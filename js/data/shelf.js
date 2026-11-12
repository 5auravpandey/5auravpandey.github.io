/**
 * Saurav Pandey - Shelf & Journal Data Store
 * Cleaned for fresh production data entry upon website completion.
 * Supports live dynamic editing via the Admin Panel, localStorage persistence,
 * and seamless code exporting for static GitHub Pages deployment.
 */

// Default grounded shelf entries (editable via Admin Studio)
const DEFAULT_SHELF = [
  {
    id: "game-sky-children",
    type: "games",
    category: "games",
    badge: "Social Adventure",
    title: "Sky: Children of the Light",
    meta: "thatgamecompany",
    rating: "★★★★★",
    summary: "A peaceful, breathtaking journey through a forgotten kingdom, emphasizing compassion, teamwork, and exploration.",
    media: "https://thatgamecompany.com/sky/",
    content: "The ambient soundscapes and flight mechanics create a uniquely calming atmosphere that's perfect for unwinding after deep coding sessions."
  },
  {
    id: "show-aot",
    type: "shows",
    category: "shows",
    badge: "Anime • Masterpiece",
    title: "Attack on Titan (Shingeki no Kyojin)",
    meta: "Hajime Isayama • MAPPA / Wit Studio",
    rating: "10/10 Masterpiece",
    summary: "A phenomenal exploration of freedom, morality, human nature, and cycles of war with breathtaking storytelling, animation, and Hiroyuki Sawano's score.",
    media: "https://myanimelist.net/anime/16498/Shingeki_no_Kyojin",
    content: "From the desperate struggle for survival inside the Walls to complex geopolitical warfare and philosophical reflections on freedom. The thematic depth, foreshadowing, character arcs (Eren, Erwin, Levi), and Sawano's transcendent soundtrack make it one of the greatest stories ever told."
  }
];

window.PORTFOLIO_SHELF_STORE = {
  STORAGE_KEY: "portfolio_custom_shelf",

  validateItem(item) {
    if (!item || typeof item !== "object") return null;
    const validCategories = ["notes", "games", "shows", "books", "research", "music"];
    const category = validCategories.includes(item.category) ? item.category : "notes";
    return {
      id: String(item.id || `custom-${Date.now()}`),
      type: String(item.type || category),
      category: category,
      badge: String(item.badge || "Note"),
      title: String(item.title || "Untitled"),
      meta: String(item.meta || ""),
      rating: item.rating ? String(item.rating) : null,
      summary: String(item.summary || ""),
      media: item.media ? String(item.media) : "",
      content: item.content ? String(item.content) : ""
    };
  },

  getAll() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Filter out specific legacy placeholder IDs if present
          const legacyMocks = new Set([
            "note-python-fullstack-architecture",
            "note-relational-data-modeling",
            "game-nier-automata",
            "show-steins-gate",
            "show-severance",
            "book-pragmatic-programmer",
            "research-lightweight-ciphers",
            "note-servlets-jvm",
            "research-icp-state-consensus",
            "research-hal-gnc",
            "book-deep-work",
            "game-chess",
            "show-silicon-valley",
            "music-lofi",
            "note-distributed"
          ]);
          const cleaned = parsed.filter(i => i && !legacyMocks.has(String(i.id)));
          if (cleaned.length > 0) {
            return cleaned.map(item => this.validateItem(item)).filter(Boolean);
          }
        }
      }
    } catch (e) {
      console.warn("Could not read custom shelf from storage:", e);
    }
    return [...DEFAULT_SHELF];
  },

  saveAll(items) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("Could not save shelf to storage:", e);
    }
    window.PORTFOLIO_SHELF = items;
    if (typeof window.renderShelfGrid === "function") {
      window.renderShelfGrid();
    }
  },

  isAuthorized() {
    const session = (window.PORTFOLIO_AUTH && typeof window.PORTFOLIO_AUTH.getSession === "function")
      ? window.PORTFOLIO_AUTH.getSession()
      : null;
    return Boolean(session && session.isOwner);
  },

  addItem(item) {
    if (!this.isAuthorized()) {
      console.warn("[SECURITY ALERT] Unauthorized attempt to add shelf entry blocked.");
      return null;
    }
    const items = this.getAll();
    const validated = this.validateItem({
      ...item,
      id: item.id || `custom-${Date.now()}`
    });
    if (validated) {
      items.unshift(validated);
      this.saveAll(items);
      return validated;
    }
    return null;
  },

  updateItem(idOrItem, updatedFields) {
    if (!this.isAuthorized()) {
      console.warn("[SECURITY ALERT] Unauthorized attempt to update shelf entry blocked.");
      return false;
    }
    const items = this.getAll();
    let targetId, fields;
    if (typeof idOrItem === "object" && idOrItem !== null) {
      targetId = String(idOrItem.id);
      fields = idOrItem;
    } else {
      targetId = String(idOrItem);
      fields = updatedFields || {};
    }

    const idx = items.findIndex(i => String(i.id) === targetId);
    if (idx !== -1) {
      const merged = this.validateItem({ ...items[idx], ...fields, id: targetId });
      if (merged) {
        items[idx] = merged;
        this.saveAll(items);
        return true;
      }
    }
    return false;
  },

  deleteItem(id) {
    if (!this.isAuthorized()) {
      console.warn("[SECURITY ALERT] Unauthorized attempt to delete shelf entry blocked.");
      return;
    }
    let items = this.getAll();
    items = items.filter(i => String(i.id) !== String(id));
    this.saveAll(items);
  },

  resetToDefaults() {
    if (!this.isAuthorized()) {
      console.warn("[SECURITY ALERT] Unauthorized attempt to reset shelf blocked.");
      return;
    }
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (e) {}
    this.saveAll([...DEFAULT_SHELF]);
  },

  exportCode() {
    const items = this.getAll();
    return `// Paste this array into js/data/shelf.js\nwindow.PORTFOLIO_SHELF = ${JSON.stringify(items, null, 2)};`;
  }
};

// Initialize active shelf array
window.PORTFOLIO_SHELF = window.PORTFOLIO_SHELF_STORE.getAll();
