/**
 * Saurav Pandey - Hardened Admin Studio & Content Manager
 * 
 * Authentication Architecture:
 * - Genuine Telegram Identity Verification via @SauravPandeyBot OAuth.
 * - Full administrative control granted exclusively to Saurav Pandey:
 *   - Telegram User ID: 6639686782
 *   - Username: @sauravpandey
 * - Zero plaintext credentials, zero passphrases to remember, zero fragile TOTP pairing.
 * - Reactive state synchronization: immediately unlocks when Saurav logs in via Telegram.
 * - Contextual HTML escaping & strict protocol whitelisting (XSS mitigation).
 */

window.PORTFOLIO_ADMIN = {
  dialog: null,
  editingItemId: null,
  showYoutubeWhitelist: true,

  // Authorized Admin Identifiers
  ADMIN_USER_ID: "6639686782",
  ADMIN_USERNAME: "sauravpandey",

  init() {
    this.dialog = document.getElementById("admin-dialog");
    if (!this.dialog) return;

    this.bindGlobalTriggers();

    // Reactive listener: automatically close or re-render if auth state changes
    window.addEventListener("portfolio:auth-changed", () => {
      if (this.dialog && (this.dialog.open || this.dialog.style.display === "block")) {
        if (!this.checkIsAdmin()) {
          this.close();
        } else {
          this.render();
        }
      }
    });
  },

  checkIsAdmin() {
    const session = (window.PORTFOLIO_AUTH && typeof window.PORTFOLIO_AUTH.getSession === "function")
      ? window.PORTFOLIO_AUTH.getSession()
      : null;

    if (!session || !session.isOwner) return false;

    const uid = session.telegramUserId ? String(session.telegramUserId).trim() : "";
    const uname = (session.username || "").trim().toLowerCase().replace(/^@/, "");
    const tgId = (session.telegramId || "").trim().toLowerCase().replace(/^@/, "").replace(/^id:\s*/i, "");

    const isMatch = (
      uid === this.ADMIN_USER_ID ||
      uname === this.ADMIN_USERNAME ||
      uname === "5auravpandey" ||
      uname === "thesauravpandey" ||
      tgId === this.ADMIN_USERNAME ||
      tgId === "5auravpandey" ||
      tgId === "thesauravpandey" ||
      tgId === this.ADMIN_USER_ID
    );

    const isCrypto = Boolean(
      session.isCryptographicallyVerified === true &&
      session.authData &&
      session.authData.hash &&
      String(session.authData.id).trim() === this.ADMIN_USER_ID
    );

    return isMatch && isCrypto;
  },

  escapeHTML(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  },

  isSafeUrl(url) {
    if (!url || typeof url !== "string") return false;
    const clean = url.trim();
    try {
      const parsed = new URL(clean);
      return ["http:", "https:", "mailto:"].includes(parsed.protocol);
    } catch (e) {
      return false;
    }
  },

  bindGlobalTriggers() {
    const closeBtn = document.getElementById("admin-dialog-close");
    if (closeBtn) {
      closeBtn.onclick = () => this.close();
    }

    if (this.dialog && !this.dialog._backdropBound) {
      this.dialog._backdropBound = true;
      this.dialog.addEventListener("click", (event) => {
        if (event.target !== this.dialog) return;
        const rect = this.dialog.getBoundingClientRect();
        const isDialogContent = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );
        if (!isDialogContent) {
          this.close();
        }
      });
    }
  },

  open() {
    if (!this.checkIsAdmin()) {
      this.close();
      return;
    }
    this.dialog = document.getElementById("admin-dialog");
    if (!this.dialog) return;
    this.render();
    if (!this.dialog.open) {
      if (typeof this.dialog.showModal === "function") {
        this.dialog.showModal();
      } else {
        this.dialog.style.display = "block";
      }
    }
  },

  close() {
    if (!this.dialog) return;
    if (typeof this.dialog.close === "function") {
      this.dialog.close();
    } else {
      this.dialog.style.display = "none";
    }
    this.editingItemId = null;
  },

  logout() {
    if (window.PORTFOLIO_AUTH && typeof window.PORTFOLIO_AUTH.logout === "function") {
      window.PORTFOLIO_AUTH.logout();
    }
    this.editingItemId = null;
    this.render();
  },

  render() {
    const container = document.getElementById("admin-dialog-body");
    if (!container) return;

    const isAdmin = this.checkIsAdmin();
    if (!isAdmin) {
      container.innerHTML = "";
      this.close();
      return;
    }

    const session = (window.PORTFOLIO_AUTH && typeof window.PORTFOLIO_AUTH.getSession === "function")
      ? window.PORTFOLIO_AUTH.getSession()
      : null;

    // -------------------------------------------------------------------------
    // 2. STUDIO VIEW: SAURAV PANDEY IS AUTHENTICATED
    // -------------------------------------------------------------------------
    const shelfItems = window.PORTFOLIO_SHELF_STORE ? window.PORTFOLIO_SHELF_STORE.getAll() : [];
    const editingItem = this.editingItemId
      ? shelfItems.find(i => String(i.id) === String(this.editingItemId))
      : null;

    container.innerHTML = `
      <div class="admin-dashboard">
        <!-- Topbar & Admin Identity Badge -->
        <div class="admin-topbar">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <h3 style="margin: 0; font-size: 18px; font-weight: 700;">Admin Studio &amp; Content Manager</h3>
              <span style="font-size: 11px; font-family: var(--mono); padding: 2px 8px; border-radius: 999px; background: var(--ok-bg); color: var(--ok); border: 1px solid currentColor; font-weight: 600;">
                ● @sauravpandey Verified
              </span>
            </div>
            <div style="font-size: 12px; color: var(--muted); margin-top: 4px;">
              ID: <code>${this.escapeHTML(session.telegramUserId || this.ADMIN_USER_ID)}</code> &bull; Role: <strong>Owner / Administrator</strong>
            </div>
          </div>

          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <button type="button" id="btn-admin-toggle-whitelist" class="btn-secondary-action" style="font-size: 12px; padding: 6px 12px; background: rgba(6, 182, 212, 0.12); color: #06b6d4; border-color: rgba(6, 182, 212, 0.4);">
              ${this.showYoutubeWhitelist ? "✕ Close Whitelist" : "👥 YouTube Whitelist"}
            </button>
            <button type="button" id="btn-admin-export" class="btn-secondary-action" style="font-size: 12px; padding: 6px 12px;">
              📋 Export shelf.js
            </button>
            <button type="button" id="btn-admin-reset-default" class="btn-ambient-action" style="font-size: 12px; padding: 6px 12px;">
              Reset Defaults
            </button>
            <button type="button" id="btn-admin-logout" class="btn-secondary-action" style="font-size: 12px; padding: 6px 12px; color: #ef4444;">
              Logout
            </button>
          </div>
        </div>

        <!-- YouTube Whitelist Management Section (Permanent Access - Zero Expiry) -->
        ${this.showYoutubeWhitelist ? `
          <div class="admin-whitelist-card" style="margin-bottom: 24px; border-left: 3px solid #06b6d4; background: var(--paper); border-radius: var(--radius-sm); padding: 16px; border: 1px solid var(--rule);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
              <div>
                <h4 style="margin: 0; font-size: 15.5px; font-weight: 700;">👥 YouTube Focus Stream &bull; Friends Whitelist</h4>
                <span style="font-size: 12px; color: var(--muted);">Approved friends enjoy permanent access to YouTube study streams with zero expiration.</span>
              </div>
              <span style="font-size: 11px; font-family: var(--mono); padding: 2px 8px; border-radius: 999px; background: var(--ok-bg); color: var(--ok); border: 1px solid currentColor;">
                ● Permanent Whitelist (Zero Expiry)
              </span>
            </div>

            <!-- Add to Whitelist Form -->
            <form id="adm-whitelist-form" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)) 130px; gap: 8px; align-items: end; margin-bottom: 16px; background: var(--card); padding: 12px; border-radius: 6px; border: 1px solid var(--rule);">
              <div>
                <label for="adm-wl-handle" style="font-size: 11px; font-family: var(--mono); color: var(--muted); display: block; margin-bottom: 4px; text-transform: uppercase;">
                  Handle / User ID:
                </label>
                <input type="text" id="adm-wl-handle" class="focus-input" placeholder="@handle or User ID (e.g. 6639686782)" required style="font-size: 13px; padding: 6px 10px; width: 100%;">
              </div>
              <div>
                <label for="adm-wl-name" style="font-size: 11px; font-family: var(--mono); color: var(--muted); display: block; margin-bottom: 4px; text-transform: uppercase;">
                  Friend Name:
                </label>
                <input type="text" id="adm-wl-name" class="focus-input" placeholder="e.g. Aman K." required style="font-size: 13px; padding: 6px 10px; width: 100%;">
              </div>
              <div>
                <label for="adm-wl-role" style="font-size: 11px; font-family: var(--mono); color: var(--muted); display: block; margin-bottom: 4px; text-transform: uppercase;">
                  Role / Circle Note:
                </label>
                <input type="text" id="adm-wl-role" class="focus-input" placeholder="e.g. HAL Colleague, Study Partner" style="font-size: 13px; padding: 6px 10px; width: 100%;">
              </div>
              <button type="submit" id="btn-adm-wl-submit" class="btn-primary-action" style="padding: 7px 12px; font-size: 12.5px; height: 35px; white-space: nowrap;">
                + Whitelist
              </button>
            </form>

            <!-- Section 1: Registered Telegram Users (1-Click Whitelist) -->
            <div style="margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <h5 style="margin: 0; font-size: 13.5px; font-weight: 600;">⚡ Registered Telegram Visitors &amp; Access Requests</h5>
                <span style="font-size: 11px; color: var(--muted);">Click the button to instantly whitelist or revoke access.</span>
              </div>
              <div style="max-height: 220px; overflow-y: auto; overflow-x: auto; -webkit-overflow-scrolling: touch; border: 1px solid var(--rule); border-radius: 6px; background: var(--card);">
                <table style="width: 100%; border-collapse: collapse; font-size: 12.5px; text-align: left; min-width: 480px;">
                  <thead>
                    <tr style="border-bottom: 1px solid var(--rule); background: var(--paper); color: var(--muted); font-family: var(--mono); font-size: 11px; text-transform: uppercase;">
                      <th style="padding: 8px 12px;">Telegram Handle / User ID</th>
                      <th style="padding: 8px 12px;">Display Name</th>
                      <th style="padding: 8px 12px;">Status</th>
                      <th style="padding: 8px 12px; text-align: right;">1-Click Action</th>
                    </tr>
                  </thead>
                  <tbody id="adm-tg-users-table-body">
                    <tr>
                      <td colspan="4" style="text-align: center; padding: 14px; color: var(--muted);">Loading Telegram visitors...</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Section 2: Permanent Whitelist Directory -->
            <div style="margin-bottom: 8px;">
              <h5 style="margin: 0 0 8px 0; font-size: 13.5px; font-weight: 600;">📋 Permanent YouTube Whitelist Directory</h5>
            </div>
            <div style="max-height: 240px; overflow-y: auto; overflow-x: auto; -webkit-overflow-scrolling: touch; border: 1px solid var(--rule); border-radius: 6px; background: var(--card);">
              <table style="width: 100%; border-collapse: collapse; font-size: 12.5px; text-align: left; min-width: 520px;">
                <thead>
                  <tr style="border-bottom: 1px solid var(--rule); background: var(--paper); color: var(--muted); font-family: var(--mono); font-size: 11px; text-transform: uppercase;">
                    <th style="padding: 8px 12px;">Handle / User ID</th>
                    <th style="padding: 8px 12px;">Friend Name</th>
                    <th style="padding: 8px 12px;">Role / Note</th>
                    <th style="padding: 8px 12px;">Status</th>
                    <th style="padding: 8px 12px; text-align: right;">Action</th>
                  </tr>
                </thead>
                <tbody id="adm-wl-table-body">
                  <tr>
                    <td colspan="5" style="text-align: center; padding: 14px; color: var(--muted);">Loading whitelist from database...</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}

        <!-- Add / Edit Curated Shelf Form -->
        <div style="margin-bottom: 16px;">
          <h4 style="margin: 0 0 10px 0; font-size: 16px; font-weight: 700;">
            ${editingItem ? `✏️ Edit Entry: "${this.escapeHTML(editingItem.title)}"` : `➕ Add New Archive / Shelf Entry`}
          </h4>
        </div>

        <form id="admin-shelf-form" class="admin-form">
          <div class="admin-form-row">
            <div>
              <label for="adm-category">Category Type:</label>
              <select id="adm-category" class="focus-input admin-select" required>
                <option value="research" ${editingItem?.category === 'research' ? 'selected' : ''}>🔬 Research Paper &amp; Study</option>
                <option value="notes" ${editingItem?.category === 'notes' ? 'selected' : ''}>📝 Technical Note &amp; Finding</option>
                <option value="books" ${editingItem?.category === 'books' ? 'selected' : ''}>📚 Book I Read</option>
                <option value="games" ${editingItem?.category === 'games' ? 'selected' : ''}>🎮 Game I Play</option>
                <option value="shows" ${editingItem?.category === 'shows' ? 'selected' : ''}>🎬 Show &amp; Cinema</option>
                <option value="music" ${editingItem?.category === 'music' ? 'selected' : ''}>🎵 Playlist &amp; Music</option>
              </select>
            </div>
            <div>
              <label for="adm-badge">Badge Label:</label>
              <input type="text" id="adm-badge" class="focus-input admin-field" placeholder="e.g. Research, Tech Note, Book, Game, Cinema, Playlist" value="${this.escapeHTML(editingItem?.badge || '')}" required>
            </div>
          </div>

          <div class="admin-form-row">
            <div>
              <label for="adm-title">Title:</label>
              <input type="text" id="adm-title" class="focus-input admin-field" placeholder="Title of Research, Note, Book, Game, Show, or Playlist..." value="${this.escapeHTML(editingItem?.title || '')}" required>
            </div>
            <div>
              <label for="adm-meta">Meta / Author / Date:</label>
              <input type="text" id="adm-meta" class="focus-input admin-field" placeholder="e.g. Oct 2026 • 5 min read, by James Clear" value="${this.escapeHTML(editingItem?.meta || '')}" required>
            </div>
          </div>

          <div class="admin-form-row">
            <div>
              <label for="adm-rating">Rating / Status (Optional):</label>
              <input type="text" id="adm-rating" class="focus-input admin-field" placeholder="e.g. ★★★★★, 10/10, Peer-Reviewed, In Progress" value="${this.escapeHTML(editingItem?.rating || '')}">
            </div>
            <div>
              <label for="adm-media">Paper / Repo / Media URL (Optional):</label>
              <input type="text" id="adm-media" class="focus-input admin-field" placeholder="https://github.com/... or paper link" value="${this.escapeHTML(editingItem?.media || '')}">
            </div>
          </div>

          <div>
            <label for="adm-summary">Summary (1-2 sentences):</label>
            <input type="text" id="adm-summary" class="focus-input admin-field" placeholder="Brief abstract or core takeaway..." value="${this.escapeHTML(editingItem?.summary || '')}" required>
          </div>

          <div>
            <label for="adm-content">Full Findings, Methodology or Reflections:</label>
            <textarea id="adm-content" class="crypto-textarea" style="height: 120px; text-align: left;" placeholder="Write your full research findings, methodology, notes, review, or code snippets here...">${this.escapeHTML(editingItem?.content || '')}</textarea>
          </div>

          <div style="display: flex; gap: 10px; margin-top: 6px;">
            <button type="submit" class="btn-primary-action" style="flex: 1;">
              ${editingItem ? "Update Entry" : "Publish Entry"}
            </button>
            ${editingItem ? `
              <button type="button" id="btn-admin-cancel-edit" class="btn-secondary-action">Cancel Edit</button>
            ` : ''}
          </div>
        </form>

        <!-- Existing Published Items List -->
        <div class="admin-items-section">
          <h4 style="margin: 24px 0 10px; font-size: 16px; border-bottom: 1px solid var(--rule-light); padding-bottom: 6px;">
            Published Entries (${shelfItems.length})
          </h4>
          <div class="admin-items-list">
            ${shelfItems.length === 0 ? `
              <div style="padding: 16px; text-align: center; color: var(--muted); font-size: 13px; background: var(--paper); border: 1px dashed var(--rule); border-radius: var(--radius-sm);">
                No custom entries yet. Use the form above to add research papers, notes, books, games, or playlists.
              </div>
            ` : shelfItems.map(item => `
              <div class="admin-item-row">
                <div style="flex: 1;">
                  <span class="shelf-badge ${this.escapeHTML(item.category)}" style="font-size: 10.5px;">${this.escapeHTML(item.badge)}</span>
                  <strong style="margin-left: 6px; font-size: 14.5px;">${this.escapeHTML(item.title)}</strong>
                  <span style="font-size: 12px; color: var(--muted); margin-left: 6px;">(${this.escapeHTML(item.meta)})</span>
                </div>
                <div style="display: flex; gap: 6px;">
                  <button type="button" class="btn-item-edit" data-id="${this.escapeHTML(item.id)}">Edit</button>
                  <button type="button" class="btn-item-delete" data-id="${this.escapeHTML(item.id)}">Delete</button>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;

    this.bindStudioEvents();
  },


  bindStudioEvents() {
    // Toggle YouTube Whitelist
    const toggleWlBtn = document.getElementById("btn-admin-toggle-whitelist");
    if (toggleWlBtn) {
      toggleWlBtn.onclick = () => {
        this.showYoutubeWhitelist = !this.showYoutubeWhitelist;
        this.render();
      };
    }

    if (this.showYoutubeWhitelist) {
      this.loadAndRenderWhitelist();
    }

    // Export shelf.js
    const exportBtn = document.getElementById("btn-admin-export");
    if (exportBtn) {
      exportBtn.onclick = () => {
        if (window.PORTFOLIO_SHELF_STORE) {
          const code = window.PORTFOLIO_SHELF_STORE.exportCode();
          if (navigator.clipboard) {
            navigator.clipboard.writeText(code).then(() => {
              exportBtn.textContent = "✓ Copied Code!";
              setTimeout(() => { exportBtn.textContent = "📋 Export shelf.js"; }, 2000);
            });
          }
        }
      };
    }

    // Reset Defaults
    const resetBtn = document.getElementById("btn-admin-reset-default");
    if (resetBtn) {
      resetBtn.onclick = () => {
        if (!this.checkIsAdmin()) {
          alert("Security Block: Unauthorized operation.");
          this.close();
          return;
        }
        if (confirm("Reset shelf back to initial defaults?")) {
          if (window.PORTFOLIO_SHELF_STORE) {
            window.PORTFOLIO_SHELF_STORE.resetToDefaults();
          }
          this.editingItemId = null;
          this.render();
        }
      };
    }

    // Logout
    const logoutBtn = document.getElementById("btn-admin-logout");
    if (logoutBtn) {
      logoutBtn.onclick = () => this.logout();
    }

    // Cancel edit
    const cancelEditBtn = document.getElementById("btn-admin-cancel-edit");
    if (cancelEditBtn) {
      cancelEditBtn.onclick = () => {
        this.editingItemId = null;
        this.render();
      };
    }

    // Add / Update item form
    const form = document.getElementById("admin-shelf-form");
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        if (!this.checkIsAdmin()) {
          alert("Security Block: Unauthorized operation.");
          this.close();
          return;
        }

        let mediaUrl = document.getElementById("adm-media").value.trim();
        if (mediaUrl) {
          if (!/^https?:\/\//i.test(mediaUrl) && !/^mailto:/i.test(mediaUrl)) {
            mediaUrl = "https://" + mediaUrl;
          }
          if (!this.isSafeUrl(mediaUrl)) {
            alert("Please enter a safe URL (starting with https://, http://, or mailto:).");
            return;
          }
        }

        const rawTitle = document.getElementById("adm-title").value.trim();
        if (!rawTitle) {
          alert("Entry title is required.");
          return;
        }

        const item = {
          category: document.getElementById("adm-category").value,
          badge: document.getElementById("adm-badge").value.trim().slice(0, 30),
          title: rawTitle.slice(0, 120),
          meta: document.getElementById("adm-meta").value.trim().slice(0, 80),
          rating: document.getElementById("adm-rating").value.trim().slice(0, 30) || null,
          media: mediaUrl,
          summary: document.getElementById("adm-summary").value.trim().slice(0, 280),
          content: document.getElementById("adm-content").value.trim().slice(0, 10000)
        };

        if (this.editingItemId) {
          item.id = this.editingItemId;
          if (window.PORTFOLIO_SHELF_STORE) {
            window.PORTFOLIO_SHELF_STORE.updateItem(this.editingItemId, item);
          }
          if (typeof showToast === "function") showToast("✓ Entry updated successfully!");
        } else {
          if (window.PORTFOLIO_SHELF_STORE) {
            window.PORTFOLIO_SHELF_STORE.addItem(item);
          }
          if (typeof showToast === "function") showToast("✓ Entry published to archive shelf!");
        }

        this.editingItemId = null;
        this.render();
        if (typeof window.renderShelfGrid === "function") {
          window.renderShelfGrid();
        }
      };
    }

    // Edit item
    const editBtns = document.querySelectorAll(".btn-item-edit");
    editBtns.forEach(btn => {
      btn.onclick = () => {
        this.editingItemId = btn.dataset.id;
        this.render();
      };
    });

    // Delete item
    const deleteBtns = document.querySelectorAll(".btn-item-delete");
    deleteBtns.forEach(btn => {
      btn.onclick = () => {
        if (!this.checkIsAdmin()) {
          alert("Security Block: Unauthorized operation.");
          this.close();
          return;
        }
        const id = btn.dataset.id;
        if (confirm("Are you sure you want to delete this entry?")) {
          if (window.PORTFOLIO_SHELF_STORE) {
            window.PORTFOLIO_SHELF_STORE.deleteItem(id);
          }
          this.render();
          if (typeof window.renderShelfGrid === "function") {
            window.renderShelfGrid();
          }
          if (typeof showToast === "function") {
            showToast("Entry removed from shelf.");
          }
        }
      };
    });
  },

  async loadAndRenderWhitelist() {
    if (!window.PORTFOLIO_DB) return;

    try {
      // 1. Render Registered Telegram Users (1-Click Whitelist)
      const tgTbody = document.getElementById("adm-tg-users-table-body");
      if (tgTbody) {
        const tgUsers = await window.PORTFOLIO_DB.getAllTelegramUsers();
        if (!tgUsers || tgUsers.length === 0) {
          tgTbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 14px; color: var(--muted);">No Telegram visitors yet. Anyone who connects will appear here for 1-click approval.</td></tr>`;
        } else {
          tgTbody.innerHTML = tgUsers.map(u => {
            const handle = u.telegramId || u.username || "";
            const userId = u.telegramUserId || "";
            const name = u.displayName || handle || (userId ? `User #${userId}` : "Visitor");
            const isWl = Boolean(u.isWhitelisted);
            const displayId = handle || (userId ? `ID: ${userId}` : "—");
            const userIdSub = (userId && handle && !handle.includes(userId))
              ? `<span style="display:block; font-size:10.5px; color:var(--muted); font-family:var(--mono); font-weight:normal;">ID: ${this.escapeHTML(userId)}</span>`
              : '';

            const isOwnerUser = Boolean(
              (userId && String(userId).trim() === this.ADMIN_USER_ID) ||
              (handle && (handle.toLowerCase().includes("sauravpandey") || handle.toLowerCase().includes("5auravpandey")))
            );

            return `
              <tr style="border-bottom: 1px solid var(--rule-light);">
                <td style="padding: 8px 12px; font-family: var(--mono); font-weight: 600; color: var(--accent);">
                  ${this.escapeHTML(displayId)}
                  ${userIdSub}
                </td>
                <td style="padding: 8px 12px;">
                  ${this.escapeHTML(name)}
                </td>
                <td style="padding: 8px 12px;">
                  <span style="font-size: 11px; padding: 2px 7px; border-radius: 999px; font-weight: 600; background: ${isWl ? 'var(--ok-bg)' : 'rgba(245, 158, 11, 0.12)'}; color: ${isWl ? 'var(--ok)' : '#f59e0b'}; border: 1px solid currentColor;">
                    ${isWl ? '● Whitelisted (Active)' : '○ Pending Approval'}
                  </span>
                </td>
                <td style="padding: 8px 12px; text-align: right; white-space: nowrap;">
                  ${isOwnerUser ? `
                    <span style="font-size: 11px; font-family: var(--mono); color: var(--ok); font-weight: 600; padding: 3px 8px; border-radius: 4px; background: var(--ok-bg); border: 1px solid currentColor;">👑 Permanent Host</span>
                  ` : isWl ? `
                    <button type="button" class="btn-adm-tg-action btn-ambient-action" data-handle="${this.escapeHTML(handle)}" data-user-id="${this.escapeHTML(userId)}" data-name="${this.escapeHTML(name)}" data-action="revoke" style="font-size: 11.5px; padding: 4px 10px; color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.35);">
                      ✕ Revoke
                    </button>
                  ` : `
                    <button type="button" class="btn-adm-tg-action btn-primary-action" data-handle="${this.escapeHTML(handle)}" data-user-id="${this.escapeHTML(userId)}" data-name="${this.escapeHTML(name)}" data-action="whitelist" style="font-size: 11.5px; padding: 4px 12px; font-weight: 600;">
                      🔓 Whitelist for YouTube
                    </button>
                  `}
                </td>
              </tr>
            `;
          }).join("");

          // Bind 1-click whitelist/revoke action buttons
          const tgActionBtns = tgTbody.querySelectorAll(".btn-adm-tg-action");
          tgActionBtns.forEach(btn => {
            btn.addEventListener("click", async () => {
              if (!this.checkIsAdmin()) {
                alert("Security Block: Unauthorized operation.");
                this.close();
                return;
              }
              const handle = btn.dataset.handle;
              const userId = btn.dataset.userId;
              const name = btn.dataset.name;
              const action = btn.dataset.action;

              btn.disabled = true;
              btn.textContent = action === "whitelist" ? "Whitelisting..." : "Revoking...";

              if (action === "whitelist") {
                await window.PORTFOLIO_DB.addToYoutubeWhitelist(handle, name, "Whitelisted Friend", userId);
                if (typeof showToast === "function") {
                  showToast(`Whitelisted '${handle || userId}' for YouTube stream!`);
                }
              } else {
                await window.PORTFOLIO_DB.removeFromYoutubeWhitelist(handle, userId);
                if (typeof showToast === "function") {
                  showToast(`Revoked YouTube access for '${handle || userId}'.`);
                }
              }
              await this.loadAndRenderWhitelist();
            });
          });
        }
      }

      // 2. Render Permanent Whitelist Directory
      const tbody = document.getElementById("adm-wl-table-body");
      if (tbody) {
        const list = await window.PORTFOLIO_DB.getYoutubeWhitelist();
        if (!list || list.length === 0) {
          tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 14px; color: var(--muted);">No whitelisted friends yet. Use 1-click whitelist above or add below.</td></tr>`;
        } else {
          tbody.innerHTML = list.map(item => {
            const isActive = item.status === "active";
            const handleText = item.handle || (item.userId ? `ID: ${item.userId}` : "—");
            const userIdSub = (item.userId && item.handle && !item.handle.includes(item.userId))
              ? `<span style="display:block; font-size:10.5px; color:var(--muted); font-family:var(--mono); font-weight:normal;">ID: ${this.escapeHTML(item.userId)}</span>`
              : '';
            const isOwnerItem = Boolean(
              (item.userId && String(item.userId).trim() === this.ADMIN_USER_ID) ||
              (item.handle && (item.handle.toLowerCase().includes("sauravpandey") || item.handle.toLowerCase().includes("5auravpandey")))
            );

            return `
              <tr style="border-bottom: 1px solid var(--rule-light);">
                <td style="padding: 8px 12px; font-family: var(--mono); font-weight: bold; color: var(--accent);">
                  ${this.escapeHTML(handleText)}
                  ${userIdSub}
                </td>
                <td style="padding: 8px 12px;"><strong>${this.escapeHTML(item.name || handleText)}</strong></td>
                <td style="padding: 8px 12px; color: var(--muted);">${this.escapeHTML(item.role || "Friend")}</td>
                <td style="padding: 8px 12px;">
                  <span style="font-size: 11px; padding: 2px 7px; border-radius: 999px; font-weight: 600; background: ${isActive ? 'var(--ok-bg)' : 'rgba(239, 68, 68, 0.12)'}; color: ${isActive ? 'var(--ok)' : '#ef4444'}; border: 1px solid currentColor;">
                    ${isActive ? '● Active (Permanent)' : '○ Revoked'}
                  </span>
                </td>
                <td style="padding: 8px 12px; text-align: right; white-space: nowrap;">
                  ${isOwnerItem ? `
                    <span style="font-size: 11px; font-family: var(--mono); color: var(--ok); font-weight: 600; padding: 3px 8px; border-radius: 4px; background: var(--ok-bg); border: 1px solid currentColor;">👑 Permanent Host</span>
                  ` : `
                    <button type="button" class="btn-wl-toggle btn-secondary-action" data-handle="${this.escapeHTML(item.handle || '')}" data-user-id="${this.escapeHTML(item.userId || '')}" style="font-size: 11px; padding: 3px 8px; margin-right: 4px;">
                      ${isActive ? 'Revoke' : 'Activate'}
                    </button>
                    <button type="button" class="btn-wl-delete btn-ambient-action" data-handle="${this.escapeHTML(item.handle || '')}" data-user-id="${this.escapeHTML(item.userId || '')}" style="font-size: 11px; padding: 3px 8px; color: #ef4444;">
                      ✕ Remove
                    </button>
                  `}
                </td>
              </tr>
            `;
          }).join("");

          // Bind toggle buttons
          const toggleBtns = tbody.querySelectorAll(".btn-wl-toggle");
          toggleBtns.forEach(btn => {
            btn.addEventListener("click", async () => {
              if (!this.checkIsAdmin()) {
                alert("Security Block: Unauthorized operation.");
                this.close();
                return;
              }
              const handle = btn.dataset.handle;
              const userId = btn.dataset.userId;
              btn.disabled = true;
              btn.textContent = "Updating...";
              await window.PORTFOLIO_DB.toggleWhitelistStatus(handle, userId);
              await this.loadAndRenderWhitelist();
            });
          });

          // Bind delete buttons
          const delBtns = tbody.querySelectorAll(".btn-wl-delete");
          delBtns.forEach(btn => {
            btn.addEventListener("click", async () => {
              if (!this.checkIsAdmin()) {
                alert("Security Block: Unauthorized operation.");
                this.close();
                return;
              }
              const handle = btn.dataset.handle;
              const userId = btn.dataset.userId;
              if (confirm(`Remove '${handle || userId}' from the YouTube Whitelist?`)) {
                btn.disabled = true;
                await window.PORTFOLIO_DB.removeFromYoutubeWhitelist(handle, userId);
                await this.loadAndRenderWhitelist();
              }
            });
          });
        }
      }

      // 3. Bind manual whitelist form
      const wlForm = document.getElementById("adm-whitelist-form");
      if (wlForm && !wlForm.dataset.bound) {
        wlForm.dataset.bound = "true";
        wlForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          if (!this.checkIsAdmin()) {
            alert("Security Block: Unauthorized operation.");
            this.close();
            return;
          }
          const submitBtn = document.getElementById("btn-adm-wl-submit");
          const handleInput = document.getElementById("adm-wl-handle");
          const nameInput = document.getElementById("adm-wl-name");
          const roleInput = document.getElementById("adm-wl-role");
          const rawHandle = handleInput ? handleInput.value.trim() : "";
          const name = nameInput ? nameInput.value.trim().slice(0, 40) : "";
          const role = roleInput ? roleInput.value.trim().slice(0, 40) : "";
          if (!rawHandle) return;

          const cleanHandle = rawHandle.replace(/[^A-Za-z0-9_@:\s-]/g, "").slice(0, 40);
          if (!cleanHandle) {
            alert("Invalid Telegram handle or User ID format.");
            return;
          }

          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Adding...";
          }

          try {
            await window.PORTFOLIO_DB.addToYoutubeWhitelist(cleanHandle, name, role || "Whitelisted Friend");
            if (handleInput) handleInput.value = "";
            if (nameInput) nameInput.value = "";
            if (roleInput) roleInput.value = "";

            if (typeof showToast === "function") {
              showToast(`Whitelisted '${cleanHandle}' with permanent YouTube access!`);
            }
            await this.loadAndRenderWhitelist();
          } finally {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = "+ Whitelist";
            }
          }
        });
      }
    } catch (e) {
      console.warn("loadAndRenderWhitelist error:", e);
    }
  }
};

// Auto-initialize Admin Studio on DOM ready
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => window.PORTFOLIO_ADMIN.init());
  } else {
    window.PORTFOLIO_ADMIN.init();
  }
}
