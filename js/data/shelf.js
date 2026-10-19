/**
 * Saurav Pandey - Shelf & Journal Data Store
 * Cleaned for fresh production data entry upon website completion.
 * Supports live dynamic editing via the Admin Panel, localStorage persistence,
 * and seamless code exporting for static GitHub Pages deployment.
 */

// Default grounded archive entries (editable via Admin Studio)
const DEFAULT_SHELF = [
  {
    id: "research-lightweight-ciphers",
    type: "research",
    category: "research",
    badge: "Systems Paper",
    title: "Lightweight Symmetric Bitwise Ciphers for Resource-Constrained Embedded Controllers",
    meta: "C++ • Cryptography • Embedded Systems",
    rating: null,
    summary: "Investigating trade-offs between computational overhead, RAM consumption, and entropy dispersion in lightweight circular-rotation XOR cipher blocks for low-memory microcontrollers.",
    media: "https://github.com/5auravpandey/CryptoLock-Encryption-Utility",
    content: "In embedded avionics and microcontroller environments, heavy cryptographic suites like AES-256 can introduce prohibitive cycle counts and memory overhead.\n\nThis paper explores lightweight symmetric bitwise XOR ciphers utilizing circular key rotation and linear feedback shifts. By eliminating dynamic heap allocations and streaming strictly over fixed byte chunks, memory consumption remains under 4KB RAM while maintaining deterministic execution time."
  },
  {
    id: "note-servlets-jvm",
    type: "notes",
    category: "notes",
    badge: "Web Architecture",
    title: "Why I Built an E-Commerce Backend in Pure Java Servlets",
    meta: "Core Java • Servlets & JSP • MySQL",
    rating: null,
    summary: "Why avoiding Spring Boot for CommerceBase was the best decision for mastering HTTP request lifecycles, multithreaded servlet concurrency, and JDBC connection pooling.",
    media: "https://github.com/5auravpandey/CommerceBase",
    content: "Modern web frameworks abstract away the raw HTTP request/response pipeline. Building CommerceBase with vanilla Java Servlets and JSP forced an intimate understanding of the servlet lifecycle (init, service, destroy), session tracking via JSESSIONID cookies, and thread-safe prepared statements with JDBC.\n\nUnderstanding these foundations makes adopting frameworks like Spring Boot or Express second nature, because you understand what is happening under the hood."
  },
  {
    id: "research-icp-state-consensus",
    type: "research",
    category: "research",
    badge: "Web3 Analysis",
    title: "Orthogonal Persistence vs Gas-Metered EVM: Architectural Analysis of the Internet Computer",
    meta: "Motoko • WebAssembly • DApps",
    rating: null,
    summary: "Comparative analysis of WebAssembly orthogonal memory persistence versus Ethereum Virtual Machine gas metering and state trie architectures.",
    media: "https://github.com/5auravpandey/NFT-Marketplace-DApp",
    content: "On the Internet Computer, smart contracts (canisters) run WebAssembly with orthogonal persistence. Variables in memory automatically persist across transactions without explicitly writing to a database or disk.\n\nAdditionally, the reverse gas model allows developers to fuel canisters with cycles so end-users can interact with decentralized applications without buying tokens or setting up crypto browser wallets."
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
    content: "The ambient soundscapes and flight mechanics inspired the study soundscapes integrated into this dev lab."
  }
];

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
