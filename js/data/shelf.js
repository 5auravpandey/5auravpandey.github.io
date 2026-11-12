/**
 * Saurav Pandey - Shelf & Journal Data Store
 * Cleaned for fresh production data entry upon website completion.
 * Supports live dynamic editing via the Admin Panel, localStorage persistence,
 * and seamless code exporting for static GitHub Pages deployment.
 */

// Default grounded shelf entries (Notes, Games, Shows, Books) (editable via Admin Studio)
const DEFAULT_SHELF = [
  {
    id: "note-python-fullstack-architecture",
    type: "notes",
    category: "notes",
    badge: "Full-Stack Web",
    title: "Structuring Clean Python Backends: REST APIs, Data Layers, and Predictable State",
    meta: "Python • REST APIs • Architecture",
    rating: null,
    summary: "Key observations on structuring maintainable backend routes, input validation, and database connection pooling in modern Python and full-stack web applications.",
    media: "https://github.com/5auravpandey",
    content: "When building modern web applications, decoupling API endpoints from frontend rendering provides immense flexibility.\n\nIn Python, structuring applications with explicit service layers, validation schemas, and database session scopes prevents business logic from leaking into routing controllers. This architecture keeps code testable, modular, and ready to scale."
  },
  {
    id: "note-relational-data-modeling",
    type: "notes",
    category: "notes",
    badge: "Database Design",
    title: "Why Relational Normalization Beats Unstructured Sheets for Production Workflows",
    meta: "SQL • Database Design • Workflow Automation",
    rating: null,
    summary: "Reflections from real-world workflow automation: why moving from spreadsheet chaos to third-normal-form relational tables eliminates duplicate errors and makes queries instant.",
    media: "https://github.com/5auravpandey",
    content: "When teams store operational data in spreadsheets, inconsistencies compound over time. Records get copied, columns become irregular, and finding specific information requires tedious manual scanning.\n\nNormalizing records into structured relational tables (primary/foreign keys, indexed lookup identifiers) transforms slow manual searching into sub-second indexed SQL queries and provides a rock-solid foundation for web interfaces."
  },
  {
    id: "game-nier-automata",
    type: "games",
    category: "games",
    badge: "Action RPG",
    title: "NieR:Automata",
    meta: "Square Enix • PlatinumGames",
    rating: "★★★★★",
    summary: "Philosophical exploration of artificial consciousness, existentialism, and purpose through multiple narrative playthroughs and sublime adaptive music.",
    media: "",
    content: "Beyond the fluid combat, NieR:Automata stands as one of the finest artistic achievements in interactive storytelling. Keiichi Okabe's dynamic soundtrack and the brilliant Route C narrative reveal left a lasting impression."
  },
  {
    id: "game-sky-children",
    type: "games",
    category: "games",
    badge: "Social Adventure",
    title: "Sky: Children of the Light",
    meta: "thatgamecompany",
    rating: "★★★★★",
    summary: "A peaceful, breathtaking journey through a forgotten kingdom, emphasizing compassion, teamwork, and exploration.",
    media: "",
    content: "The ambient soundscapes and flight mechanics create a uniquely calming atmosphere that's perfect for unwinding after deep coding sessions."
  },
  {
    id: "show-steins-gate",
    type: "shows",
    category: "shows",
    badge: "Anime • Sci-Fi",
    title: "Steins;Gate",
    meta: "White Fox • 24 Episodes",
    rating: "10/10 Masterpiece",
    summary: "A brilliant time-travel mystery exploring causality, the butterfly effect, and underground lab experiments in Akihabara.",
    media: "https://myanimelist.net/anime/9253/Steins_Gate",
    content: "Starts as a quirky story about eccentric university students tinkering with microwaves and CRT monitors, and evolves into one of the tightest, most emotionally resonant hard sci-fi narratives ever created."
  },
  {
    id: "show-severance",
    type: "shows",
    category: "shows",
    badge: "Series • Mystery",
    title: "Severance",
    meta: "Apple TV+ • Dir. Ben Stiller",
    rating: "9.5/10",
    summary: "A chilling, darkly funny look at work-life separation with immaculate retro-futuristic computing aesthetics and mind-bending cliffhangers.",
    media: "https://www.imdb.com/title/tt11280740/",
    content: "The visual direction—floppy disks, trackball mice, green phosphor screens, and sterile brutalist hallways—is hypnotic. The exploration of identity and consciousness makes every episode unforgettable."
  },
  {
    id: "book-pragmatic-programmer",
    type: "books",
    category: "books",
    badge: "Engineering Book",
    title: "The Pragmatic Programmer: Your Journey to Mastery",
    meta: "David Thomas & Andrew Hunt • 20th Anniversary Edition",
    rating: "★★★★★",
    summary: "Essential reading on software craftsmanship, DRY principles, orthogonality, and treating programming as a disciplined trade.",
    media: "",
    content: "Key takeaways applied daily in my projects: software entropy (broken window theory), investing regularly in your knowledge portfolio, and building software with small, testable, orthogonal components."
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
            "research-lightweight-ciphers",
            "note-servlets-jvm",
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
