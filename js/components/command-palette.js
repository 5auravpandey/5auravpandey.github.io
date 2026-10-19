/**
 * Saurav Pandey - Global Command Palette (Cmd+K / Ctrl+K)
 * Universal keyboard-driven navigation, project/note search, and quick dev actions.
 */
window.PORTFOLIO_COMMAND_PALETTE = {
  dialog: null,
  input: null,
  resultsContainer: null,
  selectedIndex: 0,
  currentItems: [],

  init() {
    this.dialog = document.getElementById("command-palette-dialog");
    this.input = document.getElementById("cmd-palette-input");
    this.resultsContainer = document.getElementById("cmd-palette-results");
    if (!this.dialog || !this.input || !this.resultsContainer) return;

    this.bindEvents();
  },

  getAllActions() {
    const actions = [
      // Quick Actions
      { id: "act-admin-studio", type: "action", icon: "⚙️", title: "Admin Studio & Content Manager", desc: "Manage research, notes, and YouTube whitelist (@sauravpandey)", handler: () => {
        if (typeof window.loadAdminStudio === "function") window.loadAdminStudio(true);
        else if (window.PORTFOLIO_ADMIN) window.PORTFOLIO_ADMIN.open();
      }},
      { id: "act-auth", type: "action", icon: "✈️", title: "Account Center & Telegram Login", desc: "Manage Telegram connection, 7-day score sustainability & whitelist", handler: () => {
        if (window.PORTFOLIO_AUTH) window.PORTFOLIO_AUTH.openLoginDialog();
      }},
      { id: "act-renew-session", type: "action", icon: "🔄", title: "Renew 7-Day Score Sustainability", desc: "Extend arcade high score retention for another 7 days", handler: async () => {
        if (window.PORTFOLIO_AUTH) {
          const res = await window.PORTFOLIO_AUTH.renewSession();
          if (res.success && typeof showToast === "function") {
            showToast("Score sustainability renewed for 7 days!");
          }
        }
      }},
      { id: "act-theme", type: "action", icon: "🌓", title: "Toggle Dark / Light Theme", desc: "Switch visual theme between light and dark mode", handler: () => {
        const btn = document.getElementById("theme-toggle-btn");
        if (btn) btn.click();
      }},
      { id: "act-focus", type: "action", icon: "⏱️", title: "Start 25m Focus Sprint", desc: "Launches deep work timer in Dev Lab", handler: () => {
        window.location.hash = "#playground";
        if (window.PORTFOLIO_PLAYGROUND) {
          window.PORTFOLIO_PLAYGROUND.currentTab = "focus";
          window.PORTFOLIO_PLAYGROUND.render();
          window.PORTFOLIO_PLAYGROUND.setDuration(25 * 60);
          window.PORTFOLIO_PLAYGROUND.toggleTimer();
        }
      }},
      { id: "act-sync-room", type: "action", icon: "👥", title: "Invite Friends & Sync Music", desc: "Create a live synchronized study room with timer and audio", handler: () => {
        window.location.hash = "#playground";
        if (window.PORTFOLIO_PLAYGROUND) {
          window.PORTFOLIO_PLAYGROUND.openInviteModal();
        }
      }},
      { id: "act-game-snake", type: "action", icon: "🐍", title: "Play Matrix Snake (Dev Arcade)", desc: "Retro 20x20 canvas snake with Web Audio sound effects", handler: () => {
        window.location.hash = "#playground";
        if (window.PORTFOLIO_PLAYGROUND) {
          window.PORTFOLIO_PLAYGROUND.currentTab = "games";
          window.PORTFOLIO_PLAYGROUND.render();
          if (window.PORTFOLIO_GAMES) {
            window.PORTFOLIO_GAMES.activeGame = "snake";
            window.PORTFOLIO_GAMES.render();
          }
        }
      }},
      { id: "act-game-ttt", type: "action", icon: "⚔️", title: "Play Tic-Tac-Toe / Dev Duel", desc: "Challenge HAL Minimax AI or 2-Player pass & play", handler: () => {
        window.location.hash = "#playground";
        if (window.PORTFOLIO_PLAYGROUND) {
          window.PORTFOLIO_PLAYGROUND.currentTab = "games";
          window.PORTFOLIO_PLAYGROUND.render();
          if (window.PORTFOLIO_GAMES) {
            window.PORTFOLIO_GAMES.activeGame = "tictactoe";
            window.PORTFOLIO_GAMES.render();
          }
        }
      }},
      { id: "act-game-chess", type: "action", icon: "♟️", title: "Play Chess / Grandmaster Dev", desc: "Interactive 8x8 chessboard with DeepCode AI or 2-Player", handler: () => {
        window.location.hash = "#playground";
        if (window.PORTFOLIO_PLAYGROUND) {
          window.PORTFOLIO_PLAYGROUND.currentTab = "games";
          window.PORTFOLIO_PLAYGROUND.render();
          if (window.PORTFOLIO_GAMES) {
            window.PORTFOLIO_GAMES.activeGame = "chess";
            window.PORTFOLIO_GAMES.render();
          }
        }
      }},
      { id: "act-copy-link", type: "action", icon: "🔗", title: "Copy Portfolio URL", desc: "Copies https://sauravpandey.me to clipboard", handler: () => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText("https://sauravpandey.me");
          if (typeof showToast === "function") showToast("Portfolio link copied to clipboard!");
        }
      }},

      // Sections
      { id: "sec-about", type: "section", icon: "👤", title: "Jump to: About Saurav", desc: "Bio, engineering pillars, and background", url: "#about" },
      { id: "sec-experience", type: "section", icon: "🛩️", title: "Jump to: Experience & HAL Avionics", desc: "Programming Assistant internship at Hindustan Aeronautics Limited", url: "#experience" },
      { id: "sec-projects", type: "section", icon: "🚀", title: "Jump to: Projects", desc: "Core Java Servlets, ICP Web3, C++ systems", url: "#projects" },
      { id: "sec-playground", type: "section", icon: "⚡", title: "Jump to: Dev Lab Playground", desc: "Focus sprints, live soundscapes, CryptoLock cipher & terminal", url: "#playground" },
      { id: "sec-curations", type: "section", icon: "📚", title: "Jump to: Shelf & Research", desc: "Academic papers, technical notes, and reading shelf", url: "#curations" },
      { id: "sec-skills", type: "section", icon: "🛠️", title: "Jump to: Technical Stack", desc: "Languages, databases, developer tools & systems", url: "#skills" },
      { id: "sec-education", type: "section", icon: "🎓", title: "Jump to: Education", desc: "MCA @ IIIT Ranchi & IIT Patna", url: "#education" },
      { id: "sec-contact", type: "section", icon: "📬", title: "Jump to: Contact", desc: "Direct telegram, email, GitHub and LinkedIn links", url: "#contact" }
    ];

    // Projects
    if (window.PORTFOLIO_PROJECTS) {
      window.PORTFOLIO_PROJECTS.forEach(proj => {
        actions.push({
          id: `proj-${proj.id}`,
          type: "project",
          icon: "💻",
          title: `Project: ${proj.title}`,
          desc: `${proj.category.toUpperCase()} • ${proj.tech.slice(0, 3).join(", ")}`,
          handler: () => {
            window.location.hash = "#projects";
            if (window.PORTFOLIO_CASE_STUDY) {
              window.PORTFOLIO_CASE_STUDY.open(proj.id);
            }
          }
        });
      });
    }

    // Shelf & Research
    if (window.PORTFOLIO_SHELF_STORE) {
      window.PORTFOLIO_SHELF_STORE.getAll().forEach(item => {
        actions.push({
          id: `shelf-${item.id}`,
          type: "shelf",
          icon: item.category === "research" ? "🔬" : item.category === "books" ? "📖" : "📝",
          title: `${item.badge || item.category}: ${item.title}`,
          desc: item.summary || item.meta,
          handler: () => {
            window.location.hash = "#curations";
          }
        });
      });
    }

    return actions;
  },

  open() {
    if (!this.dialog) return;
    this.dialog.showModal();
    if (this.input) {
      this.input.value = "";
      this.input.focus();
    }
    this.search("");
  },

  close() {
    if (this.dialog && this.dialog.open) {
      this.dialog.close();
      this.selectedIndex = 0;
    }
  },

  search(query) {
    const q = (query || "").trim().toLowerCase();
    const all = this.getAllActions();

    if (!q) {
      this.currentItems = all.slice(0, 9);
    } else {
      this.currentItems = all.filter(item => {
        const titleMatch = item.title.toLowerCase().includes(q);
        const descMatch = (item.desc || "").toLowerCase().includes(q);
        const typeMatch = item.type.toLowerCase().includes(q);
        return titleMatch || descMatch || typeMatch;
      }).slice(0, 10);
    }

    this.selectedIndex = 0;
    this.renderResults();
  },

  renderResults() {
    if (!this.resultsContainer) return;
    if (this.currentItems.length === 0) {
      this.resultsContainer.innerHTML = `
        <div class="cmd-no-results">
          <span>🔍</span>
          <p>No matching commands, projects or notes found.</p>
        </div>
      `;
      return;
    }

    this.resultsContainer.innerHTML = this.currentItems.map((item, index) => `
      <div class="cmd-item ${index === this.selectedIndex ? 'selected' : ''}" data-index="${index}" role="option" aria-selected="${index === this.selectedIndex}">
        <span class="cmd-item-icon">${item.icon}</span>
        <div class="cmd-item-info">
          <div class="cmd-item-title">${this.escapeHTML(item.title)}</div>
          <div class="cmd-item-desc">${this.escapeHTML(item.desc)}</div>
        </div>
        <span class="cmd-item-type">${item.type}</span>
      </div>
    `).join("");

    const activeEl = this.resultsContainer.querySelector(".cmd-item.selected");
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  },

  executeSelected() {
    if (this.currentItems.length === 0) return;
    const item = this.currentItems[this.selectedIndex];
    if (!item) return;

    this.close();

    if (item.handler) {
      item.handler();
    } else if (item.url) {
      window.location.hash = item.url;
    }
  },

  escapeHTML(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  },

  bindEvents() {
    // Keyboard shortcuts to trigger palette (Cmd+K / Ctrl+K)
    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (this.dialog && this.dialog.open) {
          this.close();
        } else {
          this.open();
        }
      }
    });

    // Trigger button listeners (desktop & mobile)
    const desktopTrigger = document.getElementById("btn-cmd-palette-desktop");
    const mobileTrigger = document.getElementById("btn-cmd-palette-mobile");
    if (desktopTrigger) desktopTrigger.addEventListener("click", () => this.open());
    if (mobileTrigger) mobileTrigger.addEventListener("click", () => this.open());

    // Close button
    const closeKbd = this.dialog.querySelector(".cmd-esc-kbd");
    if (closeKbd) closeKbd.addEventListener("click", () => this.close());

    // Search input typing
    if (this.input) {
      this.input.addEventListener("input", (e) => {
        this.search(e.target.value);
      });

      this.input.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          if (this.currentItems.length > 0) {
            this.selectedIndex = (this.selectedIndex + 1) % this.currentItems.length;
            this.renderResults();
          }
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          if (this.currentItems.length > 0) {
            this.selectedIndex = (this.selectedIndex - 1 + this.currentItems.length) % this.currentItems.length;
            this.renderResults();
          }
        } else if (e.key === "Enter") {
          e.preventDefault();
          this.executeSelected();
        } else if (e.key === "Escape") {
          this.close();
        }
      });
    }

    // Click on result item
    if (this.resultsContainer) {
      this.resultsContainer.addEventListener("click", (e) => {
        const itemEl = e.target.closest(".cmd-item");
        if (!itemEl) return;
        const index = parseInt(itemEl.dataset.index, 10);
        if (!isNaN(index)) {
          this.selectedIndex = index;
          this.executeSelected();
        }
      });
    }

    // Click outside dialog to close
    this.dialog.addEventListener("click", (e) => {
      if (e.target === this.dialog) {
        this.close();
      }
    });
  }
};
