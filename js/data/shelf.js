/**
 * Saurav Pandey - Shelf & Journal Data Store
 * Cleaned for fresh production data entry upon website completion.
 * Supports live dynamic editing via the Admin Panel, localStorage persistence,
 * and seamless code exporting for static GitHub Pages deployment.
 */

// Initialized as clean slate (Archive items to be entered post-completion via Admin Studio)
const DEFAULT_SHELF = [];

window.PORTFOLIO_SHELF_STORE = {
  STORAGE_KEY: "portfolio_custom_shelf",

  validateItem(item) {
    if (!item || typeof item !== "object") return null;
    const validCategories = ["research", "notes", "books", "games", "shows", "music"];
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
          const legacyMocks = new Set(["research-hal-gnc", "book-deep-work", "game-chess", "show-silicon-valley", "music-lofi", "note-distributed"]);
          const cleaned = parsed.filter(i => i && !legacyMocks.has(String(i.id)));
          return cleaned.map(item => this.validateItem(item)).filter(Boolean);
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
