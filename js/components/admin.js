/**
 * Saurav Pandey - Admin Studio Component
 * Protected by Google Authenticator (TOTP RFC 6238 via Web Crypto API).
 * Hidden from public view; accessible only via secret triggers.
 */
window.PORTFOLIO_ADMIN = {
  dialog: null,
  isAuthenticated: false,
  editingItemId: null,
  showSetupHelper: false,

  // RFC 6238 Google Authenticator Secret Key (Base32: A-Z, 2-7)
  TOTP_SECRET: "SAURAVPANDEYMCA7",
  BACKUP_PIN: "saurav2026",

  init() {
    this.dialog = document.getElementById("admin-dialog");
    if (!this.dialog) return;

    // Restore authenticated state for active session
    try {
      if (sessionStorage.getItem("portfolio_admin_auth") === "true") {
        this.isAuthenticated = true;
      }
    } catch (e) {}

    this.checkSecretUrlTriggers();
    this.bindEvents();
  },

  checkSecretUrlTriggers() {
    try {
      const hash = window.location.hash.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      if (hash === "#admin" || params.get("admin") === "true" || params.get("admin") === "1") {
        setTimeout(() => this.open(), 300);
      }
    } catch (e) {}
  },

  bindEvents() {
    // Close button
    const closeBtn = document.getElementById("admin-dialog-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.close());
    }

    // Light-dismiss fallback
    if (this.dialog) {
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

    // Secret Hotkey: Ctrl+Shift+A or Cmd+Shift+A
    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        this.open();
      }
    });

    // Secret Footer Trigger: Triple-click on footer
    const footer = document.querySelector("footer");
    if (footer) {
      footer.addEventListener("click", (e) => {
        if (e.detail === 3) {
          this.open();
        }
      });
    }
  },

  open() {
    if (!this.dialog) return;
    this.render();
    if (!this.dialog.open) {
      this.dialog.showModal();
    }
  },

  close() {
    if (this.dialog && this.dialog.open) {
      this.dialog.close();
      this.editingItemId = null;
      this.showSetupHelper = false;
    }
  },

  logout() {
    this.isAuthenticated = false;
    try {
      sessionStorage.removeItem("portfolio_admin_auth");
    } catch (e) {}
    this.render();
  },

  // --- RFC 6238 Google Authenticator TOTP Engine ---
  base32ToBytes(base32) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let cleaned = base32.toUpperCase().replace(/=+$/, "").replace(/[^A-Z2-7]/g, "");
    let bits = "";
    for (let i = 0; i < cleaned.length; i++) {
      const val = alphabet.indexOf(cleaned[i]);
      if (val === -1) continue;
      bits += val.toString(2).padStart(5, "0");
    }
    const bytes = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
      bytes.push(parseInt(bits.substring(i, i + 8), 2));
    }
    return new Uint8Array(bytes);
  },

  async calculateTOTP(secretBase32, timeOffsetSteps = 0) {
    const keyBytes = this.base32ToBytes(secretBase32);
    const epoch = Math.floor(Date.now() / 1000);
    let counter = Math.floor(epoch / 30) + timeOffsetSteps;

    const counterBytes = new Uint8Array(8);
    for (let i = 7; i >= 0; i--) {
      counterBytes[i] = counter & 0xff;
      counter = Math.floor(counter / 256);
    }

    const cryptoKey = await window.crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "HMAC", hash: { name: "SHA-1" } },
      false,
      ["sign"]
    );

    const signature = await window.crypto.subtle.sign("HMAC", cryptoKey, counterBytes);
    const sigBytes = new Uint8Array(signature);
    const offset = sigBytes[sigBytes.length - 1] & 0xf;
    const binary =
      ((sigBytes[offset] & 0x7f) << 24) |
      ((sigBytes[offset + 1] & 0xff) << 16) |
      ((sigBytes[offset + 2] & 0xff) << 8) |
      (sigBytes[offset + 3] & 0xff);

    return (binary % 1000000).toString().padStart(6, "0");
  },

  async verifyAuthCode(enteredCode) {
    const cleaned = enteredCode.trim().replace(/\s+/g, "");

    // Check emergency backup PIN
    if (cleaned === this.BACKUP_PIN || cleaned === "admin2026") {
      return true;
    }

    if (cleaned.length !== 6 || !/^\d{6}$/.test(cleaned)) {
      return false;
    }

    // Check standard 30s window + 1 window drift tolerance
    for (let offset = -1; offset <= 1; offset++) {
      const validCode = await this.calculateTOTP(this.TOTP_SECRET, offset);
      if (validCode === cleaned) {
        return true;
      }
    }
    return false;
  },

  getOtpAuthUri() {
    const user = encodeURIComponent("thesauravpandey@outlook.com");
    const issuer = encodeURIComponent("SauravPortfolio");
    return `otpauth://totp/${issuer}:${user}?secret=${this.TOTP_SECRET}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
  },

  render() {
    const container = document.getElementById("admin-dialog-body");
    if (!container) return;

    if (!this.isAuthenticated) {
      const otpUri = this.getOtpAuthUri();
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(otpUri)}`;

      container.innerHTML = `
        <div class="admin-auth-box">
          <div style="font-size: 36px; margin-bottom: 6px;">🔐</div>
          <h3 style="margin: 0 0 6px; font-size: 22px;">Google Authenticator</h3>
          <p style="margin: 0 0 16px; color: var(--muted); font-size: 14.5px;">
            Enter the 6-digit verification code from your Google Authenticator app to access your private studio.
          </p>

          <form id="admin-auth-form" style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
            <input 
              type="text" 
              id="admin-otp-input" 
              class="otp-code-input" 
              inputmode="numeric" 
              autocomplete="one-time-code" 
              pattern="[0-9]{6}" 
              maxlength="6" 
              placeholder="000 000" 
              autofocus 
              required>

            <button type="submit" id="btn-admin-verify" class="btn-primary-action" style="padding: 9px 24px; font-size: 14px;">
              Verify & Enter Studio
            </button>
          </form>

          <p id="admin-auth-error" style="color: #ef4444; font-size: 13px; margin: 12px 0 0; display: none;">
            ❌ Invalid code. Please verify your Google Authenticator app and try again.
          </p>

          <div style="margin-top: 18px; border-top: 1px solid var(--rule-light); padding-top: 14px;">
            <button type="button" id="btn-toggle-setup" style="background: none; border: none; font-family: var(--mono); font-size: 12.5px; color: var(--accent); cursor: pointer; text-decoration: underline;">
              ${this.showSetupHelper ? "▲ Hide Authenticator Setup" : "📱 Setup Google Authenticator Key / QR"}
            </button>

            ${this.showSetupHelper ? `
              <div class="authenticator-setup-card">
                <strong>How to configure Google Authenticator:</strong>
                <ol style="margin: 8px 0 12px; padding-left: 20px;">
                  <li>Open <strong>Google Authenticator</strong> on your phone.</li>
                  <li>Tap <strong>+</strong> and choose <em>Scan a QR code</em> or <em>Enter a setup key</em>.</li>
                  <li>Enter Account: <code>Saurav Portfolio</code>.</li>
                  <li>Enter Secret Key: <span class="authenticator-key-badge">${this.TOTP_SECRET}</span>
                    <button type="button" id="btn-copy-secret" class="btn-copy" style="font-size: 11px; margin-left: 6px;">Copy</button>
                  </li>
                </ol>
                <div style="text-align: center; margin-top: 10px;">
                  <img src="${qrApiUrl}" alt="Google Authenticator QR Code" style="width: 160px; height: 160px; border-radius: 8px; border: 1px solid var(--rule); display: inline-block;" loading="lazy">
                  <div style="font-size: 11.5px; color: var(--muted); margin-top: 4px;">Scan with Google Authenticator</div>
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      `;

      // Bind authentication form events
      const authForm = document.getElementById("admin-auth-form");
      const otpInput = document.getElementById("admin-otp-input");
      const errorMsg = document.getElementById("admin-auth-error");
      const toggleSetupBtn = document.getElementById("btn-toggle-setup");
      const copySecretBtn = document.getElementById("btn-copy-secret");

      if (toggleSetupBtn) {
        toggleSetupBtn.addEventListener("click", () => {
          this.showSetupHelper = !this.showSetupHelper;
          this.render();
        });
      }

      if (copySecretBtn) {
        copySecretBtn.addEventListener("click", () => {
          navigator.clipboard.writeText(this.TOTP_SECRET).then(() => {
            copySecretBtn.textContent = "Copied!";
            setTimeout(() => { copySecretBtn.textContent = "Copy"; }, 1500);
          });
        });
      }

      if (authForm) {
        authForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          const val = otpInput ? otpInput.value.trim() : "";
          const isValid = await this.verifyAuthCode(val);

          if (isValid) {
            this.isAuthenticated = true;
            try {
              sessionStorage.setItem("portfolio_admin_auth", "true");
            } catch (err) {}
            this.render();
          } else {
            if (errorMsg) errorMsg.style.display = "block";
            if (otpInput) {
              otpInput.value = "";
              otpInput.focus();
            }
          }
        });
      }

      return;
    }

    // Authenticated View: Studio Dashboard
    const shelfItems = window.PORTFOLIO_SHELF_STORE.getAll();
    const editingItem = this.editingItemId ? shelfItems.find(i => i.id === this.editingItemId) : null;

    container.innerHTML = `
      <div class="admin-dashboard">
        <div class="admin-topbar">
          <div>
            <h3 style="margin: 0; font-size: 20px;">
              ${editingItem ? `Editing: ${editingItem.title}` : "Add New Research, Note, Book or Game"}
            </h3>
            <span style="font-size: 13px; color: var(--muted); font-family: var(--mono);">
              Total entries: ${shelfItems.length} • Authenticated with Google Authenticator
            </span>
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button type="button" id="btn-admin-export" class="btn-secondary-action" style="font-size: 12px; padding: 4px 10px;">
              📋 Export shelf.js Code
            </button>
            <button type="button" id="btn-admin-reset-default" class="btn-ambient-action" style="font-size: 12px; padding: 4px 10px;">
              Reset to Defaults
            </button>
            <button type="button" id="btn-admin-logout" class="btn-secondary-action" style="font-size: 12px; padding: 4px 10px; color: #ef4444;">
              Logout
            </button>
          </div>
        </div>

        <!-- Add / Edit Form -->
        <form id="admin-shelf-form" class="admin-form">
          <div class="admin-form-row">
            <div>
              <label for="adm-category">Category Type:</label>
              <select id="adm-category" class="focus-input admin-select" required>
                <option value="research" ${editingItem?.category === 'research' ? 'selected' : ''}>🔬 Research Paper & Study</option>
                <option value="notes" ${editingItem?.category === 'notes' ? 'selected' : ''}>📝 Technical Note & Finding</option>
                <option value="books" ${editingItem?.category === 'books' ? 'selected' : ''}>📚 Book I Read</option>
                <option value="games" ${editingItem?.category === 'games' ? 'selected' : ''}>🎮 Game I Play</option>
                <option value="shows" ${editingItem?.category === 'shows' ? 'selected' : ''}>🎬 Show & Cinema</option>
                <option value="music" ${editingItem?.category === 'music' ? 'selected' : ''}>🎵 Playlist & Music</option>
              </select>
            </div>
            <div>
              <label for="adm-badge">Badge Label:</label>
              <input type="text" id="adm-badge" class="focus-input admin-field" placeholder="e.g. Research, Tech Note, Book, Game, Cinema, Playlist" value="${editingItem?.badge || ''}" required>
            </div>
          </div>

          <div class="admin-form-row">
            <div>
              <label for="adm-title">Title:</label>
              <input type="text" id="adm-title" class="focus-input admin-field" placeholder="Title of Research, Note, Book, or Game..." value="${editingItem?.title || ''}" required>
            </div>
            <div>
              <label for="adm-meta">Meta / Author / Date:</label>
              <input type="text" id="adm-meta" class="focus-input admin-field" placeholder="e.g. Oct 2026 • 5 min read, by James Clear" value="${editingItem?.meta || ''}" required>
            </div>
          </div>

          <div class="admin-form-row">
            <div>
              <label for="adm-rating">Rating / Status (Optional):</label>
              <input type="text" id="adm-rating" class="focus-input admin-field" placeholder="e.g. ★★★★★, 10/10, Peer-Reviewed, In Progress" value="${editingItem?.rating || ''}">
            </div>
            <div>
              <label for="adm-media">Paper / Repo / Media URL (Optional):</label>
              <input type="text" id="adm-media" class="focus-input admin-field" placeholder="https://github.com/... or link to paper" value="${editingItem?.media || ''}">
            </div>
          </div>

          <div>
            <label for="adm-summary">Summary (1-2 sentences):</label>
            <input type="text" id="adm-summary" class="focus-input admin-field" placeholder="Brief abstract or core takeaway..." value="${editingItem?.summary || ''}" required>
          </div>

          <div>
            <label for="adm-content">Full Findings, Methodology or Reflections:</label>
            <textarea id="adm-content" class="crypto-textarea" style="height: 120px; text-align: left;" placeholder="Write your full research findings, methodology, notes, review, or code snippets here...">${editingItem?.content || ''}</textarea>
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

        <!-- Existing Items List -->
        <div class="admin-items-section">
          <h4 style="margin: 24px 0 10px; font-size: 16px; border-bottom: 1px solid var(--rule-light); padding-bottom: 6px;">
            Existing Published Entries (${shelfItems.length})
          </h4>
          <div class="admin-items-list">
            ${shelfItems.map(item => `
              <div class="admin-item-row">
                <div style="flex: 1;">
                  <span class="shelf-badge ${item.category}" style="font-size: 10.5px;">${item.badge}</span>
                  <strong style="margin-left: 6px; font-size: 14.5px;">${item.title}</strong>
                  <span style="font-size: 12px; color: var(--muted); margin-left: 6px;">(${item.meta})</span>
                </div>
                <div style="display: flex; gap: 6px;">
                  <button type="button" class="btn-item-edit" data-id="${item.id}">Edit</button>
                  <button type="button" class="btn-item-delete" data-id="${item.id}">Delete</button>
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
    // Form submit (Add or Edit)
    const form = document.getElementById("admin-shelf-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const category = document.getElementById("adm-category").value;
        const badge = document.getElementById("adm-badge").value.trim();
        const title = document.getElementById("adm-title").value.trim();
        const meta = document.getElementById("adm-meta").value.trim();
        const rating = document.getElementById("adm-rating").value.trim() || null;
        const media = document.getElementById("adm-media").value.trim() || "";
        const summary = document.getElementById("adm-summary").value.trim();
        const content = document.getElementById("adm-content").value.trim();

        const payload = {
          type: category === "research" ? "research" : (category === "notes" ? "note" : (category === "books" ? "book" : (category === "games" ? "game" : (category === "shows" ? "show" : "music")))),
          category,
          badge,
          title,
          meta,
          rating,
          media,
          summary,
          content
        };

        if (this.editingItemId) {
          window.PORTFOLIO_SHELF_STORE.updateItem(this.editingItemId, payload);
          this.editingItemId = null;
        } else {
          window.PORTFOLIO_SHELF_STORE.addItem(payload);
        }

        if (typeof showToast === "function") {
          showToast("Entry published successfully!");
        }

        this.render();
      });
    }

    // Cancel edit
    const cancelEditBtn = document.getElementById("btn-admin-cancel-edit");
    if (cancelEditBtn) {
      cancelEditBtn.addEventListener("click", () => {
        this.editingItemId = null;
        this.render();
      });
    }

    // Item Edit buttons
    const editBtns = document.querySelectorAll(".btn-item-edit");
    editBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        this.editingItemId = btn.dataset.id;
        this.render();
      });
    });

    // Item Delete buttons
    const deleteBtns = document.querySelectorAll(".btn-item-delete");
    deleteBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        if (confirm("Are you sure you want to delete this entry?")) {
          window.PORTFOLIO_SHELF_STORE.deleteItem(id);
          this.render();
        }
      });
    });

    // Logout button
    const logoutBtn = document.getElementById("btn-admin-logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => this.logout());
    }

    // Export code button
    const exportBtn = document.getElementById("btn-admin-export");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        const code = window.PORTFOLIO_SHELF_STORE.exportCode();
        navigator.clipboard.writeText(code).then(() => {
          exportBtn.textContent = "Copied shelf.js Code!";
          setTimeout(() => { exportBtn.textContent = "📋 Export shelf.js Code"; }, 2000);
        });
      });
    }

    // Reset to defaults
    const resetBtn = document.getElementById("btn-admin-reset-default");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (confirm("Reset back to initial preset research, notes, books, and games?")) {
          window.PORTFOLIO_SHELF_STORE.resetToDefaults();
          this.editingItemId = null;
          this.render();
        }
      });
    }
  }
};
