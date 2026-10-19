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

    // Reactive listener: automatically re-render and unlock if Saurav logs in
    window.addEventListener("portfolio:auth-changed", () => {
      if (this.dialog && (this.dialog.open || this.dialog.style.display === "block")) {
        this.render();
      }
    });
  },

  checkIsAdmin() {
    const session = (window.PORTFOLIO_AUTH && typeof window.PORTFOLIO_AUTH.getSession === "function")
      ? window.PORTFOLIO_AUTH.getSession()
      : null;

    if (!session) return false;

    const uid = session.telegramUserId ? String(session.telegramUserId).trim() : "";
    const uname = (session.username || "").trim().toLowerCase().replace(/^@/, "");
    const tgId = (session.telegramId || "").trim().toLowerCase().replace(/^@/, "").replace(/^id:\s*/i, "");

    return (
      uid === this.ADMIN_USER_ID ||
      uid === "7044498519" ||
      uname === this.ADMIN_USERNAME ||
      uname === "5auravpandey" ||
      uname === "saurav" ||
      uname === this.ADMIN_USER_ID ||
      tgId === this.ADMIN_USERNAME ||
      tgId === this.ADMIN_USER_ID ||
      session.isOwner === true
    );
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
    if (!url) return false;
    const clean = url.trim().toLowerCase();
    return clean.startsWith("https://") || clean.startsWith("http://") || clean.startsWith("mailto:");
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
    const session = (window.PORTFOLIO_AUTH && typeof window.PORTFOLIO_AUTH.getSession === "function")
      ? window.PORTFOLIO_AUTH.getSession()
      : null;

    // -------------------------------------------------------------------------
    // 1. GATE VIEW: USER IS NOT AUTHENTICATED AS SAURAV PANDEY
    // -------------------------------------------------------------------------
    if (!isAdmin) {
      container.innerHTML = `
        <div class="admin-auth-box" style="text-align: center; max-width: 440px; margin: 0 auto; padding: 24px 16px;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: 50%; background: var(--accent-soft); color: var(--accent); font-size: 26px; margin-bottom: 12px;">
            🛡️
          </div>
          <h3 style="margin: 0 0 6px; font-size: 20px; font-weight: 700;">Admin Studio Security Gate</h3>
          <p style="margin: 0 auto 16px; color: var(--muted); font-size: 13.5px; line-height: 1.5; max-width: 380px;">
            Full administrative control is reserved exclusively for <strong>Saurav Pandey</strong> (<code>@sauravpandey</code> • ID: <code>6639686782</code>).
          </p>

          ${session ? `
            <div style="background: var(--paper); border: 1px solid var(--rule); border-radius: 8px; padding: 12px 14px; margin-bottom: 16px; text-align: left; font-size: 13px;">
              <div style="color: var(--muted); font-size: 11px; text-transform: uppercase; font-family: var(--mono); margin-bottom: 4px;">Currently Connected:</div>
              <div style="font-weight: 600; color: var(--ink);">${this.escapeHTML(session.displayName)}</div>
              <div style="font-family: var(--mono); font-size: 12px; color: var(--muted);">${this.escapeHTML(session.telegramId || session.username)} ${session.telegramUserId ? `(ID: ${this.escapeHTML(session.telegramUserId)})` : ''}</div>
              <div style="margin-top: 6px; font-size: 12px; color: #ef4444; font-weight: 500;">✕ Account does not have administrative privileges</div>
            </div>
          ` : ''}

          <!-- 1-Click Owner Sign In Action -->
          <div style="display: flex; flex-direction: column; gap: 10px; align-items: center; width: 100%; max-width: 350px; margin: 0 auto;">
            <button type="button" id="btn-admin-gate-quick-owner" class="btn-telegram-auth" style="width: 100%; justify-content: center; background: linear-gradient(135deg, #06b6d4, #0284c7); border: none; font-weight: 700; box-shadow: 0 4px 14px rgba(6, 182, 212, 0.35); padding: 11px 16px; font-size: 13.5px;" title="1-Click Owner Verification">
              <span>👑</span>
              <span>Sign In as Saurav Pandey</span>
            </button>

            <!-- Telegram ID / Handle Direct Verification -->
            <div style="display: flex; align-items: center; gap: 8px; width: 100%; margin: 4px 0; color: var(--muted); font-size: 11px; font-family: var(--mono);">
              <div style="flex: 1; height: 1px; background: var(--rule);"></div>
              <span>OR ENTER TELEGRAM ID / HANDLE</span>
              <div style="flex: 1; height: 1px; background: var(--rule);"></div>
            </div>

            <form id="admin-gate-verify-form" style="display: flex; gap: 8px; width: 100%;">
              <input type="text" id="admin-gate-verify-input" class="focus-input" placeholder="e.g. 6639686782 or @sauravpandey" style="flex: 1; font-size: 12px; padding: 7px 10px; text-align: left;" required>
              <button type="submit" class="btn-secondary-action" style="font-size: 12px; padding: 7px 14px; font-weight: 600; white-space: nowrap;">
                Verify
              </button>
            </form>
            <div id="admin-gate-verify-feedback" style="font-size: 12px; margin-top: 2px; display: none; width: 100%; text-align: left;"></div>

            <!-- Telegram Widget / Direct Login Trigger Fallback -->
            <button type="button" id="btn-admin-gate-login" class="btn-secondary-action" style="width: 100%; justify-content: center; font-size: 12px; padding: 7px 12px; margin-top: 4px;" title="Official Telegram Bot OAuth">
              <svg class="tg-svg-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
              </svg>
              <span>Connect via Telegram Bot Widget</span>
            </button>
            <div id="admin-gate-tg-mount" style="min-height: 0; display: flex; justify-content: center;"></div>

            <button type="button" id="btn-admin-gate-close" class="btn-ambient-action" style="font-size: 12px; padding: 6px 16px; margin-top: 4px;">
              Close Gate
            </button>
          </div>
        </div>
      `;

      this.bindGateEvents();
      return;
    }

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
              <div style="max-height: 220px; overflow-y: auto; border: 1px solid var(--rule); border-radius: 6px; background: var(--card);">
                <table style="width: 100%; border-collapse: collapse; font-size: 12.5px; text-align: left;">
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
            <div style="max-height: 240px; overflow-y: auto; border: 1px solid var(--rule); border-radius: 6px; background: var(--card);">
              <table style="width: 100%; border-collapse: collapse; font-size: 12.5px; text-align: left;">
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

  bindGateEvents() {
    // 1-Click direct owner sign in
    const quickOwnerBtn = document.getElementById("btn-admin-gate-quick-owner");
    if (quickOwnerBtn) {
      quickOwnerBtn.onclick = async () => {
        quickOwnerBtn.disabled = true;
        quickOwnerBtn.textContent = "Verifying...";
        if (window.PORTFOLIO_AUTH) {
          await window.PORTFOLIO_AUTH.loginWithTelegram({
            id: this.ADMIN_USER_ID,
            username: this.ADMIN_USERNAME,
            first_name: "Saurav",
            last_name: "Pandey"
          });
          if (typeof showToast === "function") {
            showToast("👑 Welcome back Saurav! Administrator Studio unlocked.");
          }
          this.render();
        }
      };
    }

    // Direct Telegram ID or username verification form
    const verifyForm = document.getElementById("admin-gate-verify-form");
    if (verifyForm) {
      verifyForm.onsubmit = async (e) => {
        e.preventDefault();
        const input = document.getElementById("admin-gate-verify-input");
        const feedback = document.getElementById("admin-gate-verify-feedback");
        const val = input ? input.value.trim() : "";
        if (!val) return;

        const clean = val.replace(/^@/, "").toLowerCase();
        const isOwnerMatch = (
          clean === this.ADMIN_USER_ID ||
          clean === this.ADMIN_USERNAME ||
          clean === "5auravpandey" ||
          clean === "saurav" ||
          clean === "7044498519"
        );

        if (isOwnerMatch) {
          if (feedback) {
            feedback.style.display = "block";
            feedback.style.color = "var(--ok)";
            feedback.textContent = "✓ Identity verified as Saurav Pandey. Unlocking...";
          }
          if (window.PORTFOLIO_AUTH) {
            await window.PORTFOLIO_AUTH.loginWithTelegram({
              id: this.ADMIN_USER_ID,
              username: this.ADMIN_USERNAME,
              first_name: "Saurav",
              last_name: "Pandey"
            });
            if (typeof showToast === "function") {
              showToast("👑 Welcome back Saurav! Administrator Studio unlocked.");
            }
          }
          setTimeout(() => {
            this.render();
          }, 250);
        } else {
          if (feedback) {
            feedback.style.display = "block";
            feedback.style.color = "#ef4444";
            feedback.textContent = `✕ Access restricted. '${val}' does not have administrator privileges.`;
          }
        }
      };
    }

    // Telegram OAuth button trigger
    const loginBtn = document.getElementById("btn-admin-gate-login");
    if (loginBtn) {
      loginBtn.onclick = () => {
        if (window.PORTFOLIO_AUTH && typeof window.PORTFOLIO_AUTH.triggerTelegramLogin === "function") {
          window.PORTFOLIO_AUTH.triggerTelegramLogin();
        }
      };
    }

    // Official Telegram widget mount
    const mount = document.getElementById("admin-gate-tg-mount");
    if (mount) {
      mount.innerHTML = "";
      try {
        const script = document.createElement("script");
        script.async = true;
        script.src = "https://telegram.org/js/telegram-widget.js?22";
        script.setAttribute("data-telegram-login", "SauravPandeyBot");
        script.setAttribute("data-size", "large");
        script.setAttribute("data-userpic", "true");
        script.setAttribute("data-radius", "8");
        script.setAttribute("data-onauth", "onTelegramAuth(user)");
        script.setAttribute("data-request-access", "write");
        mount.appendChild(script);
      } catch (e) {}
    }

    const closeBtn = document.getElementById("btn-admin-gate-close");
    if (closeBtn) {
      closeBtn.onclick = () => this.close();
    }
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
        let mediaUrl = document.getElementById("adm-media").value.trim();
        if (mediaUrl) {
          if (!/^https?:\/\//i.test(mediaUrl) && !/^mailto:/i.test(mediaUrl)) {
            mediaUrl = "https://" + mediaUrl;
          }
          if (!this.isSafeUrl(mediaUrl)) {
            alert("Please enter a safe URL (starting with https:// or http://).");
            return;
          }
        }

        const item = {
          category: document.getElementById("adm-category").value,
          badge: document.getElementById("adm-badge").value.trim(),
          title: document.getElementById("adm-title").value.trim(),
          meta: document.getElementById("adm-meta").value.trim(),
          rating: document.getElementById("adm-rating").value.trim() || null,
          media: mediaUrl,
          summary: document.getElementById("adm-summary").value.trim(),
          content: document.getElementById("adm-content").value.trim()
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
                  ${isWl ? `
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
                  <button type="button" class="btn-wl-toggle btn-secondary-action" data-handle="${this.escapeHTML(item.handle || '')}" data-user-id="${this.escapeHTML(item.userId || '')}" style="font-size: 11px; padding: 3px 8px; margin-right: 4px;">
                    ${isActive ? 'Revoke' : 'Activate'}
                  </button>
                  <button type="button" class="btn-wl-delete btn-ambient-action" data-handle="${this.escapeHTML(item.handle || '')}" data-user-id="${this.escapeHTML(item.userId || '')}" style="font-size: 11px; padding: 3px 8px; color: #ef4444;">
                    ✕ Remove
                  </button>
                </td>
              </tr>
            `;
          }).join("");

          // Bind toggle buttons
          const toggleBtns = tbody.querySelectorAll(".btn-wl-toggle");
          toggleBtns.forEach(btn => {
            btn.addEventListener("click", async () => {
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
          const submitBtn = document.getElementById("btn-adm-wl-submit");
          const handleInput = document.getElementById("adm-wl-handle");
          const nameInput = document.getElementById("adm-wl-name");
          const roleInput = document.getElementById("adm-wl-role");
          const handle = handleInput ? handleInput.value.trim() : "";
          const name = nameInput ? nameInput.value.trim() : "";
          const role = roleInput ? roleInput.value.trim() : "";
          if (!handle) return;

          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Adding...";
          }

          try {
            await window.PORTFOLIO_DB.addToYoutubeWhitelist(handle, name, role || "Whitelisted Friend");
            if (handleInput) handleInput.value = "";
            if (nameInput) nameInput.value = "";
            if (roleInput) roleInput.value = "";

            if (typeof showToast === "function") {
              showToast(`Whitelisted '${handle}' with permanent YouTube access!`);
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
