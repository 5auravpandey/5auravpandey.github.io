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
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Detect and purge legacy prefilled mock items
          const hasLegacyMock = parsed.some(i => i && typeof i.id === "string" && (
            i.id.startsWith("research-") ||
            i.id.startsWith("note-") ||
            i.id.startsWith("book-") ||
            i.id.startsWith("game-") ||
            i.id.startsWith("show-") ||
            i.id.startsWith("music-")
          ));
          if (hasLegacyMock) {
            localStorage.removeItem(this.STORAGE_KEY);
            return [];
          }

          const validated = parsed.map(item => this.validateItem(item)).filter(Boolean);
          if (validated.length > 0) {
            return validated;
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

  addItem(item) {
    const items = this.getAll();
    const newItem = {
      ...item,
      id: item.id || `custom-${Date.now()}`
    };
    items.unshift(newItem);
    this.saveAll(items);
    return newItem;
  },

  updateItem(id, updatedFields) {
    const items = this.getAll();
    const idx = items.findIndex(i => i.id === id);
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...updatedFields };
      this.saveAll(items);
      return true;
    }
    return false;
  },

  deleteItem(id) {
    let items = this.getAll();
    items = items.filter(i => i.id !== id);
    this.saveAll(items);
  },

  resetToDefaults() {
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
