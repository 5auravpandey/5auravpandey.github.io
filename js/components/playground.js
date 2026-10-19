/**
 * Saurav Pandey - Interactive Dev Playground
 * 1. Focus Sprint & Synchronized Study Room (Zero-Lag Web Audio, Synced YouTube Lo-Fi, Friends VIP Access)
 * 2. CryptoLock Live Cipher (Two-Way Bitwise XOR Encrypt & Decrypt)
 * 3. Power Terminal Shell (Tab Autocompletion, Command History, Matrix Rain, CLI Controls)
 * 4. Dev Arcade (Matrix Snake, Tic-Tac-Toe Dev Duel, Grandmaster Chess)
 */
window.PORTFOLIO_PLAYGROUND = {
  currentTab: "focus", // 'focus' | 'crypto' | 'terminal' | 'games'
  
  // Timer State
  timerDuration: 25 * 60,
  timeLeft: 25 * 60,
  timerInterval: null,
  isRunning: false,
  sprintsCompleted: 0,

  // Synchronized Study Room State
  activeRoomId: null,
  roomStartTime: null,
  
  // Friends VIP Access State
  isFriend: false,
  friendName: "",
  activePassKey: "",
  
  // Music & Sound System (Zero-Lag Web Audio Synthesizer)
  audioMode: "ambient", // 'ambient' | 'youtube'
  soundscape: "genshin", // 'genshin' | 'sky' | 'krishna'
  youtubePreset: "genshin-ost", // 'genshin-ost' | 'sky-ost' | 'krishna-flute' | 'lofi-study'
  customYoutubeUrl: "",
  audioCtx: null,
  activeNodes: [],
  masterGain: null,
  analyser: null,
  animFrameId: null,
  isAudioPlaying: false,

  // CryptoLock Two-Way State
  cryptoMode: "encrypt", // 'encrypt' | 'decrypt'

  // Terminal Shell State
  termHistory: [],
  historyIndex: -1,
  isMatrixRunning: false,
  matrixInterval: null,
  terminalCommands: [
    "help", "about", "hal", "projects", "books", "games", "arcade", "snake", "chess", "tictactoe", 
    "skills", "contact", "myspace", "matrix", "theme", "timer", "crypto", "sound", "youtube", "sync", "invite", "friend", "weather", "quote", "clear", "sudo hire"
  ],

  escapeHTML(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  },

  async init() {
    this.sprintsCompleted = parseInt(localStorage.getItem("portfolio_sprints") || "0", 10);
    
    // Check Unified Auth Session first
    const authSession = (window.PORTFOLIO_AUTH && typeof window.PORTFOLIO_AUTH.getSession === "function") 
      ? window.PORTFOLIO_AUTH.getSession() 
      : null;
      
    if (authSession && authSession.isWhitelistedYouTube) {
      this.isFriend = true;
      this.friendName = authSession.displayName;
      this.friendUsername = authSession.telegramId || authSession.username;
      this.friendRole = authSession.role || "Whitelisted Friend";
      this.activePassKey = (authSession.username || authSession.telegramId).toUpperCase();
    } else {
      const friendSession = window.PORTFOLIO_DB ? window.PORTFOLIO_DB.getActiveFriendSession() : null;
      if (friendSession) {
        this.isFriend = true;
        this.friendName = friendSession.name;
        this.friendUsername = friendSession.username;
        this.friendRole = friendSession.role;
        this.activePassKey = friendSession.username.toUpperCase();
      } else {
        this.isFriend = false;
        this.friendName = "";
        this.friendUsername = "";
        this.friendRole = "";
        this.activePassKey = "";

        // Check if logged-in Telegram user is already whitelisted
        const tgUser = window.PORTFOLIO_DB ? window.PORTFOLIO_DB.getTelegramUser() : null;
        if (tgUser && window.PORTFOLIO_DB) {
          const check = await window.PORTFOLIO_DB.isWhitelistedForYouTube(tgUser.telegramId);
          if (check.whitelisted) {
            this.isFriend = true;
            this.friendName = check.entry.name || tgUser.displayName;
            this.friendUsername = check.entry.handle;
            this.friendRole = check.entry.role || "Whitelisted Friend";
            this.activePassKey = check.entry.handle.toUpperCase();
          }
        }
      }
    }

    // Bind real-time unified auth listener
    if (!this._authBound) {
      this._authBound = true;
      window.addEventListener("portfolio:auth-changed", (e) => {
        const session = e.detail;
        if (session && session.isWhitelistedYouTube) {
          this.isFriend = true;
          this.friendName = session.displayName;
          this.friendUsername = session.telegramId || session.username;
          this.friendRole = session.role || "Whitelisted Friend";
          this.activePassKey = (session.username || session.telegramId).toUpperCase();
        } else if (!session) {
          this.isFriend = false;
          this.friendName = "";
          this.friendUsername = "";
          this.friendRole = "";
          this.activePassKey = "";
        }
        this.render();
      });
    }

    this.checkUrlParams();
    this.render();
  },

  checkUrlParams() {
    try {
      const params = new URLSearchParams(window.location.search);
      
      const fromName = params.get("from") || params.get("name") || "";
      if (fromName && !this.friendName) {
        this.friendName = decodeURIComponent(fromName);
      }

      if (params.has("room")) {
        this.activeRoomId = params.get("room");
        this.currentTab = "focus";
        if (window.PORTFOLIO_DB) {
          const participantName = this.friendName || fromName || "Guest Scholar";
          window.PORTFOLIO_DB.joinRoomSession(this.activeRoomId, participantName, this.friendUsername || this.activePassKey || "");
        }
      }

      if (params.has("sprint")) {
        const mins = parseInt(params.get("sprint"), 10);
        if (mins > 0 && mins <= 120) {
          this.timerDuration = mins * 60;
          this.timeLeft = mins * 60;
        }
      }

      if (params.has("t")) {
        const startMs = parseInt(params.get("t"), 10);
        if (!isNaN(startMs)) {
          this.roomStartTime = startMs;
          const elapsedSec = Math.floor((Date.now() - startMs) / 1000);
          if (elapsedSec >= 0 && elapsedSec < this.timerDuration) {
            this.timeLeft = this.timerDuration - elapsedSec;
            this.startSyncedTimer();
          } else {
            this.timeLeft = this.timerDuration;
          }
        }
      }

      if (params.has("sound")) {
        const s = params.get("sound");
        if (["genshin", "sky", "krishna"].includes(s)) {
          this.soundscape = s;
        }
      }

      if (params.has("audioMode")) {
        const am = params.get("audioMode");
        if (["ambient", "youtube"].includes(am)) {
          this.audioMode = am;
        }
      }

      if (params.has("yt")) {
        this.youtubePreset = params.get("yt");
      }

      if (params.has("tab")) {
        const t = params.get("tab");
        if (["focus", "crypto", "terminal", "games"].includes(t)) {
          this.currentTab = t;
        }
      }

      if (params.has("game") && window.PORTFOLIO_GAMES) {
        const g = params.get("game");
        if (["snake", "tictactoe", "chess"].includes(g)) {
          this.currentTab = "games";
          window.PORTFOLIO_GAMES.activeGame = g;
        }
      }
    } catch (e) {}
  },

  render() {
    const container = document.getElementById("playground-mount");
    if (!container) return;

    container.innerHTML = `
      <div class="playground-card">
        <!-- Tab Navigation -->
        <div class="playground-tabs" role="tablist">
          <button type="button" class="playground-tab ${this.currentTab === 'focus' ? 'active' : ''}" data-tab="focus">
            ⏱️ Focus &amp; Sync Room
          </button>
          <button type="button" class="playground-tab ${this.currentTab === 'crypto' ? 'active' : ''}" data-tab="crypto">
            🔐 CryptoLock (Cipher)
          </button>
          <button type="button" class="playground-tab ${this.currentTab === 'terminal' ? 'active' : ''}" data-tab="terminal">
            💻 Power Terminal Shell
          </button>
          <button type="button" class="playground-tab ${this.currentTab === 'games' ? 'active' : ''}" data-tab="games">
            🎮 Dev Arcade (Games)
          </button>
        </div>

        <!-- Playground Content Panes -->
        <div class="playground-body">
          ${this.renderActiveTab()}
        </div>
      </div>
    `;

    this.bindEvents();
  },

  renderActiveTab() {
    if (this.currentTab === "games") {
      return `
        <div id="dev-games-container"></div>
      `;
    }

    if (this.currentTab === "focus") {
      const minutes = Math.floor(this.timeLeft / 60).toString().padStart(2, "0");
      const seconds = (this.timeLeft % 60).toString().padStart(2, "0");

      return `
        <div class="focus-pane">
          <!-- Active Synchronized Study Room Banner -->
          ${this.activeRoomId ? `
            <div class="sync-room-banner">
              <div class="sync-room-left">
                <span class="sync-live-dot"></span>
                <div>
                  <span class="sync-room-title">Room #${this.activeRoomId}</span>
                  <span class="sync-room-sub">&bull; Live Synchronized Study Group</span>
                </div>
              </div>
              <div class="sync-room-actions">
                <button type="button" class="btn-sync-room-share" id="btn-sync-room-share">🔗 Share Room</button>
                <button type="button" class="btn-sync-room-leave" id="btn-sync-room-leave" title="Exit this synchronized study room">✕ Leave</button>
              </div>
            </div>
          ` : ''}

          <!-- Sprint Preset Selectors -->
          <div class="focus-modes">
            <button type="button" class="focus-mode-btn ${this.timerDuration === 25 * 60 ? 'active' : ''}" data-duration="1500">25m Sprint</button>
            <button type="button" class="focus-mode-btn ${this.timerDuration === 50 * 60 ? 'active' : ''}" data-duration="3000">50m Deep Work</button>
            <button type="button" class="focus-mode-btn ${this.timerDuration === 5 * 60 ? 'active' : ''}" data-duration="300">5m Short Break</button>
            <button type="button" class="focus-mode-btn ${this.timerDuration === 15 * 60 ? 'active' : ''}" data-duration="900">15m Long Rest</button>
          </div>

          <!-- Digital Clock Display -->
          <div class="focus-clock-display" id="focus-clock">
            ${minutes}:${seconds}
          </div>

          <!-- Task Goal Row -->
          <div class="focus-task-row">
            <input type="text" id="focus-task-input" class="focus-input" placeholder="What are you building or studying right now?" maxlength="80">
          </div>

          <!-- Controls -->
          <div class="focus-controls">
            <button type="button" id="btn-timer-toggle" class="btn-primary-action">
              ${this.isRunning ? "Pause" : "Start Sprint"}
            </button>
            <button type="button" id="btn-timer-reset" class="btn-secondary-action">Reset</button>
            <button type="button" id="btn-invite-friend" class="btn-ambient-action" title="Invite friends to study and sync audio together">
              👥 Invite Friends &amp; Sync
            </button>
          </div>

          <!-- Music & Audio Center -->
          <div class="focus-audio-center">
            <div class="audio-mode-switcher">
              <button type="button" class="audio-mode-tab ${this.audioMode === 'ambient' ? 'active' : ''}" id="btn-mode-ambient">
                ✨ Melodic Soundscapes
              </button>
              <button type="button" class="audio-mode-tab ${this.audioMode === 'youtube' ? 'active' : ''}" id="btn-mode-youtube">
                🎧 Friends YouTube Stream ${this.isFriend ? '✓' : '🔒'}
              </button>
            </div>

            ${this.audioMode === 'ambient' ? `
              <div class="ambient-controls">
                <div class="soundscape-selector">
                  <label for="soundscape-select" style="font-family: var(--mono); font-size: 12.5px; color: var(--muted);">Soundscape:</label>
                  <select id="soundscape-select" class="focus-input" style="padding: 4px 8px; font-size: 13.5px; width: auto;">
                    <option value="genshin" ${this.soundscape === 'genshin' ? 'selected' : ''}>🍃 Genshin Impact Melodies (Peaceful Mondstadt &amp; Liyue Breeze)</option>
                    <option value="sky" ${this.soundscape === 'sky' ? 'selected' : ''}>🕊️ Sky: Children of the Light Ambience (Celestial Cloud Echo)</option>
                    <option value="krishna" ${this.soundscape === 'krishna' ? 'selected' : ''}>🪈 Little Krishna Divine Flute (Vrindavan Bansuri &amp; River Murmur)</option>
                  </select>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <button type="button" id="btn-audio-toggle" class="btn-ambient-action ${this.isAudioPlaying ? 'playing' : ''}">
                    ${this.isAudioPlaying ? "⏸️ Pause Audio" : "▶️ Play Soundscape"}
                  </button>
                  <canvas id="soundscape-visualizer" class="soundscape-canvas" width="112" height="26" title="Live Web Audio Frequency Visualizer" style="border-radius: 4px; background: rgba(0,0,0,0.06); vertical-align: middle;"></canvas>
                </div>
              </div>
            ` : !this.isFriend ? this.renderFriendGate("youtube") : `
              <div class="youtube-controls">
                <div class="friend-active-banner" style="margin-bottom: 10px;">
                  <div class="friend-banner-info">
                    <span>🌟 Whitelisted Friend Stream Active: <strong>${this.escapeHTML(this.friendName || this.friendUsername)}</strong></span>
                    ${this.friendUsername ? `<span class="friend-pass-code-pill">${this.friendUsername.startsWith('@') ? this.escapeHTML(this.friendUsername) : '@' + this.escapeHTML(this.friendUsername)}</span>` : ''}
                    <span class="friend-role-badge" style="background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid currentColor;">Permanent Access (No Expiry)</span>
                  </div>
                  <div class="friend-banner-actions">
                    <button type="button" class="btn-invite-pill" id="btn-share-friend-pass-yt">👥 Invite Study Friends</button>
                    <button type="button" class="btn-revoke-pill" id="btn-revoke-pass" title="Switch or log out of this account">Log Out / Switch</button>
                  </div>
                </div>
                <div class="youtube-presets">
                  <button type="button" class="youtube-pill ${this.youtubePreset === 'genshin-ost' ? 'active' : ''}" data-youtube="genshin-ost">🍃 Genshin Relaxing OST</button>
                  <button type="button" class="youtube-pill ${this.youtubePreset === 'sky-ost' ? 'active' : ''}" data-youtube="sky-ost">🕊️ Sky Children OST</button>
                  <button type="button" class="youtube-pill ${this.youtubePreset === 'krishna-flute' ? 'active' : ''}" data-youtube="krishna-flute">🪈 Little Krishna Divine Flute</button>
                  <button type="button" class="youtube-pill ${this.youtubePreset === 'lofi-study' ? 'active' : ''}" data-youtube="lofi-study">☕ Study Lofi Beats</button>
                </div>
                <div class="youtube-iframe-box" style="margin-top: 10px;">
                  <iframe 
                    style="border-radius: 12px; width: 100%; aspect-ratio: 16/9; max-height: 220px; border: 1px solid var(--rule);" 
                    src="${this.getYoutubeEmbedUrl()}" 
                    title="YouTube Synced Focus Stream"
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen
                    loading="lazy">
                  </iframe>
                </div>
                <div style="margin-top: 8px; display: flex; gap: 8px;">
                  <input type="text" id="youtube-custom-url" class="focus-input" placeholder="Paste YouTube video or playlist URL..." style="font-size: 13px; text-align: left;" value="${this.customYoutubeUrl}">
                  <button type="button" id="btn-youtube-load" class="btn-secondary-action" style="font-size: 12px; padding: 4px 12px;">Load</button>
                </div>
              </div>
            `}
          </div>

          <div class="focus-footer">
            <span>Sprints finished: <strong id="sprint-counter">${this.sprintsCompleted}</strong></span>
            <span class="focus-tip">Tip: Bookmark or leave this tab open while studying!</span>
          </div>
        </div>
      `;
    }

    if (this.currentTab === "crypto") {
      return `
        <div class="crypto-pane">
          <div class="crypto-header-row">
            <div>
              <h3 style="margin: 0; font-size: 18px;">CryptoLock Live Cipher Playground</h3>
              <p class="crypto-intro" style="margin-top: 2px;">
                Browser demo of my <strong>CryptoLock C++ project</strong> using symmetric bitwise XOR key rotation.
              </p>
            </div>
            <!-- Two-Way Mode Switcher -->
            <div class="crypto-mode-toggle" role="group">
              <button type="button" class="crypto-mode-btn ${this.cryptoMode === 'encrypt' ? 'active' : ''}" id="btn-crypto-mode-enc">
                🔒 Encrypt Mode
              </button>
              <button type="button" class="crypto-mode-btn ${this.cryptoMode === 'decrypt' ? 'active' : ''}" id="btn-crypto-mode-dec">
                🔓 Decrypt Mode
              </button>
            </div>
          </div>

          <div class="crypto-inputs">
            <div>
              <label for="crypto-msg" id="crypto-msg-label">
                ${this.cryptoMode === 'encrypt' ? 'Plaintext Message to Encrypt:' : 'Ciphertext (Hex Bytes or Scrambled) to Decrypt:'}
              </label>
              <textarea id="crypto-msg" class="crypto-textarea" placeholder="${this.cryptoMode === 'encrypt' ? 'Type a secret message...' : 'Paste hexadecimal bytes (e.g. 05 24 29 38...) to decrypt...'}">${this.cryptoMode === 'encrypt' ? "Meet me at HAL Avionics Department at 09:00" : ""}</textarea>
            </div>
            <div>
              <label for="crypto-key">Secret Key (Passphrase):</label>
              <input type="text" id="crypto-key" class="crypto-input" value="HAL2026">
              <div style="margin-top: 10px; font-size: 12px; color: var(--muted); font-family: var(--mono);">
                Symmetric Property:<br>
                <code>(A ^ Key) ^ Key = A</code>
              </div>
            </div>
          </div>

          <div class="crypto-output-box">
            <div class="crypto-output-head">
              <strong id="crypto-output-label">
                ${this.cryptoMode === 'encrypt' ? 'Encrypted Output (Hex Bytes):' : 'Decrypted Human-Readable Text:'}
              </strong>
              <div style="display: flex; gap: 6px;">
                ${this.cryptoMode === 'encrypt' ? `
                  <button type="button" id="btn-crypto-swap" class="btn-copy" style="font-size: 11px;">⇄ Test Decrypting this</button>
                ` : ''}
                <button type="button" id="btn-crypto-copy" class="btn-copy" style="font-size: 11px;">Copy Output</button>
              </div>
            </div>
            <div id="crypto-output" class="crypto-result-stream">Loading cipher...</div>
            <div class="crypto-binary-preview" id="crypto-binary-preview"></div>
          </div>
        </div>
      `;
    }

    if (this.currentTab === "terminal") {
      return `
        <div class="terminal-pane">
          <div class="terminal-header-bar">
            <div class="term-dots">
              <span class="dot red"></span>
              <span class="dot yellow"></span>
              <span class="dot green"></span>
            </div>
            <span class="term-title-text">saurav@gopalganj: ~ (zsh)</span>
            <button type="button" id="btn-term-expand" class="term-expand-btn" title="Toggle Terminal Size">⛶ Expand</button>
          </div>

          <div class="terminal-window" id="terminal-window">
            <div class="terminal-banner">
              Saurav Pandey OS [Version 2.5.0] (x86_64-pc-gopalganj)<br>
              Type '<span style="color: var(--accent);">help</span>' for commands. Supports <kbd>Tab</kbd> completion & <kbd>↑</kbd>/<kbd>↓</kbd> history.
            </div>
            <div class="terminal-history" id="terminal-history"></div>
            <div class="terminal-prompt-row">
              <span class="terminal-prompt">saurav@gopalganj:~$</span>
              <input type="text" id="terminal-input" class="terminal-input" autofocus autocomplete="off" spellcheck="false">
            </div>
          </div>

          <div class="terminal-shortcuts">
            <button type="button" class="term-pill" data-cmd="about">about</button>
            <button type="button" class="term-pill" data-cmd="hal">hal</button>
            <button type="button" class="term-pill" data-cmd="research">research 🔬</button>
            <button type="button" class="term-pill" data-cmd="projects">projects</button>
            <button type="button" class="term-pill" data-cmd="books">books</button>
            <button type="button" class="term-pill" data-cmd="games">games</button>
            <button type="button" class="term-pill" data-cmd="matrix">matrix 🌧️</button>
            <button type="button" class="term-pill" data-cmd="sudo hire">sudo hire 🚀</button>
          </div>
        </div>
      `;
    }

    return "";
  },

  renderFriendGate(context = "youtube") {
    const activeTg = (window.PORTFOLIO_DB && typeof window.PORTFOLIO_DB.getTelegramUser === "function") 
      ? window.PORTFOLIO_DB.getTelegramUser() 
      : null;
    const prefillHandle = activeTg ? activeTg.telegramId : (localStorage.getItem("portfolio_user_telegram") || "");

    return `
      <div class="friend-gate-card">
        <div class="friend-gate-badge">🔒 Private Focus Stream &bull; Admin Whitelist Only</div>
        <h3 class="friend-gate-title">🎧 Friends YouTube Stream &bull; Whitelist Access</h3>
        <p class="friend-gate-desc">
          The synchronized YouTube focus stream and collaborative study rooms are reserved for Saurav's circle. To access YouTube mode, your handle must be whitelisted by Saurav from his Admin Studio (<code>myspace</code>).
          <br><strong style="color: var(--ok); font-family: var(--mono); font-size: 12px; display: inline-block; margin-top: 4px;">● Whitelisted access is permanent with NO expiration time.</strong>
        </p>

        ${activeTg ? `
          <div style="background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 6px; padding: 10px 14px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap;">
            <span style="font-size: 13px;">✈️ Connected Telegram: <strong>${this.escapeHTML(activeTg.telegramId)}</strong> (${this.escapeHTML(activeTg.displayName)})</span>
            <button type="button" id="btn-quick-check-whitelist" class="btn-primary-action" style="font-size: 12px; padding: 4px 10px;">
              ⚡ Check Whitelist for ${this.escapeHTML(activeTg.telegramId)}
            </button>
          </div>
        ` : ''}

        <!-- Direct Contact to Get Whitelisted -->
        <div class="friend-gate-contact-box">
          <span class="gate-contact-label">Not whitelisted yet? Request Saurav to whitelist your handle from his Admin Studio:</span>
          <div class="gate-contact-buttons">
            <a href="https://t.me/sauravpandey" target="_blank" rel="noopener noreferrer" class="btn-gate-contact telegram">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.52 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z"/></svg>
              Request Whitelist on Telegram (@sauravpandey)
            </a>
            <a href="mailto:thesauravpandey@outlook.com?subject=YouTube%20Study%20Stream%20Whitelist%20Request&body=Hi%20Saurav,%0D%0A%0D%0APlease%20whitelist%20my%20handle%20for%20your%20synchronized%20YouTube%20Focus%20Stream.%0D%0A%0D%0AMy%20Name:%20%0D%0AMy%20Telegram%20Handle:%20" class="btn-gate-contact email">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
              Request via Email
            </a>
          </div>
        </div>

        <!-- Unified Auth & Telegram 1-Click Login -->
        <div style="margin: 14px 0 16px;">
          <button type="button" id="btn-open-unified-login-yt" class="btn-primary-action" style="padding: 12px 18px; font-weight: 600; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 13.5px;">
            <span>✈️</span>
            <span>Log In with Telegram (@SauravPandeyBot) / Account</span>
          </button>
        </div>

        <div style="display: flex; align-items: center; margin: 12px 0 16px; gap: 8px;">
          <hr style="flex: 1; border: none; border-top: 1px solid var(--rule);">
          <span style="font-size: 11px; font-family: var(--mono); color: var(--muted); text-transform: uppercase;">Or Verify Whitelisted Handle Directly</span>
          <hr style="flex: 1; border: none; border-top: 1px solid var(--rule);">
        </div>

        <div class="friend-gate-form">
          <div class="friend-gate-field">
            <label for="input-friend-id">Telegram Handle / Whitelisted Username:</label>
            <input type="text" id="input-friend-id" class="focus-input" placeholder="e.g. @your_handle or aman, hal-friend..." value="${this.escapeHTML(prefillHandle)}" maxlength="32" autocomplete="username" spellcheck="false" style="font-family: var(--mono);">
          </div>
          <div id="friend-gate-error-msg" class="friend-gate-error" style="display: none;" role="alert"></div>
          <button type="button" id="btn-unlock-friend" class="btn-primary-action" style="padding: 10px 20px; font-weight: 600; width: 100%;">
            🔓 Verify Admin Whitelist &amp; Unlock YouTube Stream
          </button>
          <button type="button" id="btn-gate-switch-ambient" class="btn-secondary-action" style="margin-top: 8px; width: 100%; font-size: 13px;">
            ✨ Switch to Melodic Soundscapes (Free for Everyone, No Login)
          </button>
        </div>
        <div class="friend-gate-footer-note">
          <span>✨ Native melodic soundscapes (Genshin, Sky, Krishna flute) remain 100% free and open for everyone with zero login required.</span>
        </div>
      </div>
    `;
  },

  getYoutubeEmbedUrl() {
    const defaultIds = {
      "genshin-ost": "SO_B339kZ9k",
      "sky-ost": "P_Fv8_632e8",
      "krishna-flute": "0_Xv_uXz5m0",
      "lofi-study": "jfKfPfyJRdk"
    };

    if (this.customYoutubeUrl) {
      const match = this.customYoutubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (match) {
        return `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=0&rel=0`;
      }
      const listMatch = this.customYoutubeUrl.match(/[?&]list=([\w-]+)/);
      if (listMatch) {
        return `https://www.youtube-nocookie.com/embed/videoseries?list=${listMatch[1]}&rel=0`;
      }
    }

    const vidId = defaultIds[this.youtubePreset] || defaultIds["genshin-ost"];
    return `https://www.youtube-nocookie.com/embed/${vidId}?autoplay=0&rel=0`;
  },

  bindEvents() {
    // Tab switching
    const tabs = document.querySelectorAll(".playground-tab");
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        const next = tab.dataset.tab;
        if (this.currentTab === next) return;
        this.stopVisualizer();
        if (this.currentTab === "games" && window.PORTFOLIO_GAMES && typeof window.PORTFOLIO_GAMES.destroyCurrentGame === "function") {
          window.PORTFOLIO_GAMES.destroyCurrentGame();
        }
        this.currentTab = next;
        this.render();
      });
    });

    // Friend Gate Actions (Admin Whitelist Verification)
    const openUnifiedYtBtn = document.getElementById("btn-open-unified-login-yt");
    if (openUnifiedYtBtn) {
      openUnifiedYtBtn.addEventListener("click", () => {
        if (window.PORTFOLIO_AUTH) {
          window.PORTFOLIO_AUTH.openLoginDialog("youtube");
        }
      });
    }

    const unlockBtn = document.getElementById("btn-unlock-friend");
    const quickCheckBtn = document.getElementById("btn-quick-check-whitelist");
    const friendIdInput = document.getElementById("input-friend-id");
    const errorEl = document.getElementById("friend-gate-error-msg");

    const doWhitelistCheck = async (targetHandle) => {
      const handle = (targetHandle || (friendIdInput ? friendIdInput.value.trim() : ""));

      if (!handle) {
        if (errorEl) {
          errorEl.innerHTML = "⚠️ Please enter your Telegram @handle or username.";
          errorEl.style.display = "block";
        }
        if (friendIdInput) friendIdInput.focus();
        return;
      }

      if (unlockBtn) {
        unlockBtn.textContent = "Checking Admin Whitelist...";
        unlockBtn.disabled = true;
      }

      if (window.PORTFOLIO_DB) {
        const check = await window.PORTFOLIO_DB.isWhitelistedForYouTube(handle);
        if (check.whitelisted) {
          this.isFriend = true;
          this.friendName = check.entry.name || handle;
          this.friendUsername = check.entry.handle;
          this.friendRole = check.entry.role || "Whitelisted Friend";
          this.activePassKey = check.entry.handle.toUpperCase();

          try {
            localStorage.setItem("portfolio_friend_authenticated", "true");
            localStorage.setItem("portfolio_friend_username", check.entry.handle);
            localStorage.setItem("portfolio_friend_name", this.friendName);
            localStorage.setItem("portfolio_friend_role", this.friendRole);
          } catch (e) {}

          if (errorEl) errorEl.style.display = "none";
          this.render();
        } else {
          if (unlockBtn) {
            unlockBtn.textContent = "🔓 Verify Admin Whitelist & Unlock YouTube Stream";
            unlockBtn.disabled = false;
          }
          if (errorEl) {
            const safeHandle = this.escapeHTML(handle);
            errorEl.innerHTML = `⛔ <strong>Access Restricted:</strong> '${safeHandle}' is not on Saurav's Admin Whitelist.<br><span style="font-size:12px; opacity:0.95;">Please ask Saurav to whitelist your handle from his Admin Studio (<code>myspace</code>). Whitelisted friends receive permanent access with zero expiration time.</span>`;
            errorEl.style.display = "block";
          }
        }
      }
    };

    if (unlockBtn) {
      unlockBtn.addEventListener("click", () => doWhitelistCheck());
    }
    if (quickCheckBtn) {
      quickCheckBtn.addEventListener("click", () => {
        const activeTg = window.PORTFOLIO_DB ? window.PORTFOLIO_DB.getTelegramUser() : null;
        if (activeTg) doWhitelistCheck(activeTg.telegramId);
      });
    }
    if (friendIdInput) {
      friendIdInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          doWhitelistCheck();
        }
      });
    }

    const gateSwitchAmbientBtn = document.getElementById("btn-gate-switch-ambient");
    if (gateSwitchAmbientBtn) {
      gateSwitchAmbientBtn.addEventListener("click", () => {
        this.audioMode = "ambient";
        this.render();
      });
    }

    // Revoke / Switch Account
    const revokeBtns = document.querySelectorAll("#btn-revoke-pass");
    revokeBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        if (window.PORTFOLIO_DB) {
          window.PORTFOLIO_DB.revokeFriendSession();
        }
        this.isFriend = false;
        this.friendName = "";
        this.friendUsername = "";
        this.friendRole = "";
        this.activePassKey = "";
        this.render();
      });
    });

    // Share Pass Buttons
    const sharePassBtn = document.getElementById("btn-share-friend-pass");
    const sharePassYtBtn = document.getElementById("btn-share-friend-pass-yt");
    if (sharePassBtn) sharePassBtn.addEventListener("click", () => this.openInviteModal());
    if (sharePassYtBtn) sharePassYtBtn.addEventListener("click", () => this.openInviteModal());

    // Initialize Games if on games tab
    if (this.currentTab === "games" && window.PORTFOLIO_GAMES) {
      window.PORTFOLIO_GAMES.init();
    }

    // --- Tab 1: Focus Sprint Events ---
    if (this.currentTab === "focus") {
      const toggleBtn = document.getElementById("btn-timer-toggle");
      const resetBtn = document.getElementById("btn-timer-reset");
      const inviteBtn = document.getElementById("btn-invite-friend");
      const durationBtns = document.querySelectorAll(".focus-mode-btn");

      if (toggleBtn) toggleBtn.addEventListener("click", () => this.toggleTimer());
      if (resetBtn) resetBtn.addEventListener("click", () => this.resetTimer());
      if (inviteBtn) inviteBtn.addEventListener("click", () => this.openInviteModal());

      durationBtns.forEach(btn => {
        btn.addEventListener("click", () => {
          const duration = parseInt(btn.dataset.duration, 10);
          this.setDuration(duration);
        });
      });

      // Synchronized Room Banner Actions
      const bannerShareBtn = document.getElementById("btn-sync-room-share");
      if (bannerShareBtn) bannerShareBtn.addEventListener("click", () => this.openInviteModal());

      const bannerLeaveBtn = document.getElementById("btn-sync-room-leave");
      if (bannerLeaveBtn) {
        bannerLeaveBtn.addEventListener("click", () => {
          this.activeRoomId = null;
          this.roomStartTime = null;
          try {
            const url = new URL(window.location.href);
            url.searchParams.delete("room");
            url.searchParams.delete("t");
            window.history.replaceState({}, "", url.toString());
          } catch (e) {}
          this.render();
        });
      }

      // Audio Mode Tabs (Ambient vs YouTube)
      const ambientModeBtn = document.getElementById("btn-mode-ambient");
      const ytModeBtn = document.getElementById("btn-mode-youtube");

      if (ambientModeBtn) {
        ambientModeBtn.addEventListener("click", () => {
          this.audioMode = "ambient";
          this.render();
        });
      }
      if (ytModeBtn) {
        ytModeBtn.addEventListener("click", () => {
          this.audioMode = "youtube";
          if (this.isAudioPlaying) this.toggleAmbientAudio(); // pause synth if playing
          this.render();
        });
      }

      // Ambient controls
      const soundSelect = document.getElementById("soundscape-select");
      const audioBtn = document.getElementById("btn-audio-toggle");

      if (soundSelect) {
        soundSelect.addEventListener("change", (e) => {
          this.soundscape = e.target.value;
          if (this.isAudioPlaying) {
            this.stopAllAudioNodes();
            this.startSynthesizedSound();
          }
        });
      }

      if (audioBtn) {
        audioBtn.addEventListener("click", () => this.toggleAmbientAudio());
      }

      // Initialize or restore audio frequency visualizer state
      if (this.isAudioPlaying) {
        setTimeout(() => this.startVisualizer(), 60);
      } else {
        setTimeout(() => this.clearVisualizer(), 60);
      }

      // YouTube Presets & Custom URL
      const ytPills = document.querySelectorAll(".youtube-pill");
      ytPills.forEach(pill => {
        pill.addEventListener("click", () => {
          this.youtubePreset = pill.dataset.youtube;
          this.customYoutubeUrl = "";
          this.render();
        });
      });

      const loadYtBtn = document.getElementById("btn-youtube-load");
      const customYtInput = document.getElementById("youtube-custom-url");
      if (loadYtBtn && customYtInput) {
        loadYtBtn.addEventListener("click", () => {
          this.customYoutubeUrl = customYtInput.value.trim();
          this.render();
        });
      }
    }

    // --- Tab 2: CryptoLock Two-Way Events ---
    if (this.currentTab === "crypto") {
      const encBtn = document.getElementById("btn-crypto-mode-enc");
      const decBtn = document.getElementById("btn-crypto-mode-dec");
      const msgEl = document.getElementById("crypto-msg");
      const keyEl = document.getElementById("crypto-key");
      const copyBtn = document.getElementById("btn-crypto-copy");
      const swapBtn = document.getElementById("btn-crypto-swap");

      if (encBtn) {
        encBtn.addEventListener("click", () => {
          this.cryptoMode = "encrypt";
          this.render();
        });
      }
      if (decBtn) {
        decBtn.addEventListener("click", () => {
          this.cryptoMode = "decrypt";
          this.render();
        });
      }

      const runHandler = () => {
        const text = msgEl ? msgEl.value : "";
        const key = keyEl ? keyEl.value : "HAL2026";
        this.runTwoWayCrypto(text, key);
      };

      if (msgEl) msgEl.addEventListener("input", runHandler);
      if (keyEl) keyEl.addEventListener("input", runHandler);

      if (copyBtn) {
        copyBtn.addEventListener("click", () => {
          const out = document.getElementById("crypto-output");
          if (out) {
            navigator.clipboard.writeText(out.textContent).then(() => {
              copyBtn.textContent = "Copied!";
              setTimeout(() => { copyBtn.textContent = "Copy Output"; }, 1500);
            });
          }
        });
      }

      if (swapBtn) {
        swapBtn.addEventListener("click", () => {
          const out = document.getElementById("crypto-output");
          if (out && out.textContent) {
            this.cryptoMode = "decrypt";
            this.render();
            const newMsgEl = document.getElementById("crypto-msg");
            if (newMsgEl) {
              newMsgEl.value = out.textContent;
              this.runTwoWayCrypto(out.textContent, keyEl ? keyEl.value : "HAL2026");
            }
          }
        });
      }

      runHandler();
    }

    // --- Tab 3: Terminal Events ---
    if (this.currentTab === "terminal") {
      const input = document.getElementById("terminal-input");
      const win = document.getElementById("terminal-window");
      const expandBtn = document.getElementById("btn-term-expand");

      if (expandBtn) {
        expandBtn.addEventListener("click", () => {
          if (win) {
            win.classList.toggle("fullscreen-term");
            expandBtn.textContent = win.classList.contains("fullscreen-term") ? "⛶ Shrink" : "⛶ Expand";
          }
        });
      }

      if (input) {
        input.addEventListener("keydown", (e) => {
          // Tab Autocompletion
          if (e.key === "Tab") {
            e.preventDefault();
            const val = input.value.trim().toLowerCase();
            if (val) {
              const match = this.terminalCommands.find(c => c.startsWith(val));
              if (match) input.value = match;
            }
            return;
          }

          // Command History Up
          if (e.key === "ArrowUp") {
            e.preventDefault();
            if (this.termHistory.length > 0) {
              if (this.historyIndex === -1) this.historyIndex = this.termHistory.length - 1;
              else if (this.historyIndex > 0) this.historyIndex--;
              input.value = this.termHistory[this.historyIndex] || "";
            }
            return;
          }

          // Command History Down
          if (e.key === "ArrowDown") {
            e.preventDefault();
            if (this.termHistory.length > 0 && this.historyIndex !== -1) {
              if (this.historyIndex < this.termHistory.length - 1) {
                this.historyIndex++;
                input.value = this.termHistory[this.historyIndex];
              } else {
                this.historyIndex = -1;
                input.value = "";
              }
            }
            return;
          }

          // Execute on Enter
          if (e.key === "Enter") {
            const cmd = input.value.trim();
            if (cmd) {
              this.termHistory.push(cmd);
              this.historyIndex = -1;
              this.handleTerminalCommand(cmd);
            }
            input.value = "";
          }
        });
      }

      const shortcuts = document.querySelectorAll(".term-pill");
      shortcuts.forEach(pill => {
        pill.addEventListener("click", () => {
          const cmd = pill.dataset.cmd;
          this.handleTerminalCommand(cmd);
        });
      });
    }

    // --- Tab 4: Games Arcade Events ---
    if (this.currentTab === "games") {
      if (window.PORTFOLIO_GAMES && typeof window.PORTFOLIO_GAMES.init === "function") {
        window.PORTFOLIO_GAMES.init();
      }
    }
  },

  // --- Focus Timer Methods ---
  startSyncedTimer() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.updateClockDisplay();
      } else {
        clearInterval(this.timerInterval);
        this.isRunning = false;
        this.sprintsCompleted++;
        localStorage.setItem("portfolio_sprints", this.sprintsCompleted.toString());
        alert("🎉 Synchronized study sprint completed with your study group! Time for a quick break!");
        this.timeLeft = this.timerDuration;
        this.render();
      }
    }, 1000);
  },

  toggleTimer() {
    if (this.isRunning) {
      clearInterval(this.timerInterval);
      this.isRunning = false;
      this.render();
    } else {
      this.isRunning = true;
      this.timerInterval = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--;
          this.updateClockDisplay();
        } else {
          clearInterval(this.timerInterval);
          this.isRunning = false;
          this.sprintsCompleted++;
          localStorage.setItem("portfolio_sprints", this.sprintsCompleted.toString());
          alert("🎉 Great job! Sprint completed. Take a quick break!");
          this.timeLeft = this.timerDuration;
          this.render();
        }
      }, 1000);
      this.render();
    }
  },

  resetTimer() {
    clearInterval(this.timerInterval);
    this.isRunning = false;
    this.timeLeft = this.timerDuration;
    this.updateClockDisplay();
    this.render();
  },

  setDuration(sec) {
    clearInterval(this.timerInterval);
    this.isRunning = false;
    this.timerDuration = sec;
    this.timeLeft = sec;
    this.render();
  },

  updateClockDisplay() {
    const el = document.getElementById("focus-clock");
    if (!el) return;
    const minutes = Math.floor(this.timeLeft / 60).toString().padStart(2, "0");
    const seconds = (this.timeLeft % 60).toString().padStart(2, "0");
    el.textContent = `${minutes}:${seconds}`;
  },

  // Synchronized Study Room Invite Modal
  openInviteModal() {
    const dialog = document.getElementById("invite-dialog");
    if (!dialog) return;

    if (!this.activeRoomId) {
      this.activeRoomId = "STUDY-" + Math.floor(1000 + Math.random() * 9000);
      this.roomStartTime = Date.now() - (this.timerDuration - this.timeLeft) * 1000;
    }

    // Gate YouTube room creation to whitelisted friends only; native ambient is 100% open to everyone
    if (this.audioMode === "youtube" && !this.isFriend) {
      this.audioMode = "ambient";
      if (typeof showToast === "function") {
        showToast("YouTube rooms require whitelist access. Switched to open Melodic Soundscapes!");
      }
      this.render();
    }

    const liveOrigin = window.location.origin.includes("localhost") || window.location.origin.includes("127.0.0.1") || window.location.protocol === "file:"
      ? "https://sauravpandey.me"
      : window.location.origin;

    const sprintMins = Math.round(this.timerDuration / 60);
    const t = this.roomStartTime || Date.now();
    let shareUrl = `${liveOrigin}${window.location.pathname}?tab=focus&room=${this.activeRoomId}&sprint=${sprintMins}&audioMode=${this.audioMode}&t=${t}`;
    if (this.friendName) {
      shareUrl += `&from=${encodeURIComponent(this.friendName)}`;
    }

    if (this.audioMode === "ambient") {
      shareUrl += `&sound=${this.soundscape}`;
    } else if (this.audioMode === "youtube") {
      shareUrl += `&yt=${this.youtubePreset}`;
    }

    // Persist active room session to database
    if (window.PORTFOLIO_DB) {
      window.PORTFOLIO_DB.saveRoomSession({
        roomId: this.activeRoomId,
        hostName: this.friendName || "Host",
        hostPass: this.activePassKey || "",
        audioMode: this.audioMode,
        soundscape: this.soundscape,
        youtubePreset: this.youtubePreset,
        sprintMins: sprintMins,
        timerStart: t,
        participants: [this.friendName || "Host"]
      });
    }

    const codeBadge = document.getElementById("invite-room-code-badge");
    if (codeBadge) codeBadge.textContent = this.activeRoomId;

    const audioLabel = document.getElementById("invite-audio-channel-label");
    if (audioLabel) {
      if (this.audioMode === "ambient") {
        const soundMap = {
          genshin: "🍃 Genshin Impact Melodies",
          sky: "🕊️ Sky: Children of the Light Ambience",
          krishna: "🪈 Little Krishna Divine Flute"
        };
        audioLabel.textContent = soundMap[this.soundscape] || "✨ Melodic Soundscapes";
      } else {
        audioLabel.textContent = "🎧 YouTube Synced Focus Stream";
      }
    }

    const sprintLabel = document.getElementById("invite-sprint-label");
    if (sprintLabel) sprintLabel.textContent = `${sprintMins} Minutes Focus Sprint`;

    const input = document.getElementById("invite-link-input");
    if (input) input.value = shareUrl;

    const copyBtn = document.getElementById("btn-copy-invite-link");
    if (copyBtn) {
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(shareUrl).then(() => {
          copyBtn.textContent = "Copied! ✓";
          setTimeout(() => { copyBtn.textContent = "Copy Link"; }, 2000);
        });
      };
    }

    const whatsapp = dialog.querySelector(".btn-social-share.whatsapp");
    if (whatsapp) {
      whatsapp.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(`Hey! Join me in study room #${this.activeRoomId} for a synchronized ${sprintMins}-minute focus sprint with music on Saurav's site: ${shareUrl}`)}`;
    }
    const twitter = dialog.querySelector(".btn-social-share.twitter");
    if (twitter) {
      twitter.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Studying together in synchronized Room #${this.activeRoomId} on @5auravpandey's dev lab! Join the focus sprint:`)}&url=${encodeURIComponent(shareUrl)}`;
    }
    const telegram = dialog.querySelector(".btn-social-share.telegram");
    if (telegram) {
      telegram.href = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Hey! Join my synchronized study session in Room #${this.activeRoomId}: ${shareUrl}`)}`;
    }

    dialog.showModal();
    this.render();
  },

  // --- Web Audio Synthesized Soundscapes ---
  toggleAmbientAudio() {
    if (this.isAudioPlaying) {
      this.stopAllAudioNodes();
      this.isAudioPlaying = false;
      this.render();
      return;
    }

    this.startSynthesizedSound();
    this.isAudioPlaying = true;
    this.render();
    setTimeout(() => this.startVisualizer(), 60);
  },

  startSynthesizedSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!this.audioCtx) {
        this.audioCtx = new AudioContext();
      } else if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }

      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = 0.15;

      // Connect Analyser for frequency visualizer
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.82;
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);

      if (this.soundscape === "genshin") {
        this.createGenshinMelody();
      } else if (this.soundscape === "sky") {
        this.createSkyGameAmbience();
      } else if (this.soundscape === "krishna") {
        this.createLittleKrishnaFlute();
      } else {
        this.createGenshinMelody();
      }
    } catch (e) {
      console.error("Audio error:", e);
    }
  },

  startVisualizer() {
    this.stopVisualizer();
    const canvas = document.getElementById("soundscape-visualizer");
    if (!canvas || !this.analyser) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!this.isAudioPlaying) {
        this.clearVisualizer(canvas, ctx);
        return;
      }
      const currentCanvas = document.getElementById("soundscape-visualizer");
      if (!currentCanvas || this.currentTab !== "focus") {
        this.stopVisualizer();
        return;
      }
      this.animFrameId = requestAnimationFrame(draw);
      this.analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const numBars = 16;
      const spacing = 2;
      const barWidth = Math.floor((canvas.width - (numBars + 1) * spacing) / numBars);
      let x = spacing;

      const isDark = document.documentElement.getAttribute("data-theme") === "dark";

      for (let i = 0; i < numBars; i++) {
        const binIndex = Math.min(i * 2, bufferLength - 1);
        const val = dataArray[binIndex] || 0;
        const norm = val / 255;
        const minHeight = 3;
        const barHeight = Math.max(minHeight, norm * (canvas.height - 4));
        const y = canvas.height - barHeight - 2;

        ctx.fillStyle = isDark
          ? `rgba(96, 165, 250, ${0.45 + norm * 0.55})`
          : `rgba(37, 99, 235, ${0.5 + norm * 0.5})`;

        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barWidth, barHeight, 2);
        } else {
          ctx.rect(x, y, barWidth, barHeight);
        }
        ctx.fill();

        x += barWidth + spacing;
      }
    };
    draw();
  },

  clearVisualizer(canvas, ctx) {
    if (!canvas) canvas = document.getElementById("soundscape-visualizer");
    if (!canvas) return;
    if (!ctx) ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const numBars = 16;
    const spacing = 2;
    const barWidth = Math.floor((canvas.width - (numBars + 1) * spacing) / numBars);
    let x = spacing;
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.18)" : "rgba(0, 0, 0, 0.12)";
    for (let i = 0; i < numBars; i++) {
      ctx.fillRect(x, canvas.height - 4, barWidth, 2);
      x += barWidth + spacing;
    }
  },

  stopVisualizer() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  },

  stopAllAudioNodes() {
    this.stopVisualizer();
    this.clearVisualizer();
    this.activeNodes.forEach(n => {
      try {
        if (n && n.stop) n.stop();
        else if (n && n.disconnect) n.disconnect();
        else if (typeof n === "number") clearInterval(n);
      } catch (e) {}
    });
    this.activeNodes = [];
  },

  /**
   * 1. 🍃 Genshin Impact Melodies (Peaceful Mondstadt & Liyue Breeze)
   * Acoustic harp & piano arpeggios in D Major Pentatonic / Lydian with gentle mountain breeze
   */
  createGenshinMelody() {
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;

    // Warm Ambient Pad Drone (D3 + A3 + F#4 harmonic warmth)
    const padD = ctx.createOscillator();
    padD.type = "sine";
    padD.frequency.value = 146.83; // D3
    const padA = ctx.createOscillator();
    padA.type = "triangle";
    padA.frequency.value = 220.00; // A3
    const padGain = ctx.createGain();
    padGain.gain.value = 0.08;

    padD.connect(padGain);
    padA.connect(padGain);
    padGain.connect(this.masterGain);
    padD.start();
    padA.start();

    // Gentle Mondstadt Mountain Wind Breeze (Soft filtered noise with slow modulation)
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.015;
    }
    const windNoise = ctx.createBufferSource();
    windNoise.buffer = buffer;
    windNoise.loop = true;

    const windFilter = ctx.createBiquadFilter();
    windFilter.type = "lowpass";
    windFilter.frequency.value = 320;

    const windGain = ctx.createGain();
    windGain.gain.value = 0.04;

    const windLfo = ctx.createOscillator();
    windLfo.frequency.value = 0.08;
    const windLfoGain = ctx.createGain();
    windLfoGain.gain.value = 0.02;
    windLfo.connect(windLfoGain);
    windLfoGain.connect(windGain.gain);

    windNoise.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(this.masterGain);
    windNoise.start();
    windLfo.start();

    // Peaceful Acoustic Harp Arpeggio Sequence (Genshin Theme Motif)
    const notes = [
      293.66, // D4
      369.99, // F#4
      440.00, // A4
      587.33, // D5
      659.25, // E5
      739.99, // F#5
      880.00, // A5
      739.99, // F#5
      659.25, // E5
      440.00  // A4
    ];
    let noteIdx = 0;

    const arpeggioInterval = setInterval(() => {
      if (!this.isAudioPlaying || !this.audioCtx) return;
      try {
        const now = ctx.currentTime;
        const freq = notes[noteIdx % notes.length];
        noteIdx++;

        // Primary Pluck (Triangle warmth)
        const osc = ctx.createOscillator();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now);

        // Soft Shimmer Overtone (Sine)
        const sub = ctx.createOscillator();
        sub.type = "sine";
        sub.frequency.setValueAtTime(freq * 2, now);

        const noteGain = ctx.createGain();
        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.25);

        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.001, now);
        subGain.gain.exponentialRampToValueAtTime(0.035, now + 0.02);
        subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1400, now);
        filter.frequency.exponentialRampToValueAtTime(500, now + 1.2);

        osc.connect(filter);
        sub.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(this.masterGain);

        osc.start(now);
        sub.start(now);
        osc.stop(now + 1.3);
        sub.stop(now + 1.3);
      } catch (e) {}
    }, 620);

    this.activeNodes.push(padD, padA, padGain, windNoise, windFilter, windGain, windLfo, windLfoGain, arpeggioInterval);
  },

  /**
   * 2. 🕊️ Sky: Children of the Light Ambience (Celestial Cloud Echo & Shimmer)
   * Airy ethereal pads in Fmaj9 with slow rotary phasing and crystalline chime resonance
   */
  createSkyGameAmbience() {
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;

    // Celestial Pad Voices (F3 174.61Hz, C4 261.63Hz, A4 440.00Hz, E5 659.25Hz)
    const freqs = [174.61, 261.63, 440.00, 659.25];
    const padNodes = [];

    freqs.forEach(f => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = f;

      const oscDetune = ctx.createOscillator();
      oscDetune.type = "sine";
      oscDetune.frequency.value = f * 1.003; // Soft chorus detuning

      const voiceGain = ctx.createGain();
      voiceGain.gain.value = 0.045;

      osc.connect(voiceGain);
      oscDetune.connect(voiceGain);
      voiceGain.connect(this.masterGain);

      osc.start();
      oscDetune.start();
      padNodes.push(osc, oscDetune, voiceGain);
    });

    // Slow Celestial Rotary Phasing
    const padLfo = ctx.createOscillator();
    padLfo.frequency.value = 0.07;
    const padLfoGain = ctx.createGain();
    padLfoGain.gain.value = 0.03;
    padLfo.connect(padLfoGain);
    padLfoGain.connect(this.masterGain.gain);
    padLfo.start();
    padNodes.push(padLfo, padLfoGain);

    // Crystalline Chime Resonance (Rings every 4.2 seconds)
    const chimeFrequencies = [1318.51, 1760.00, 2093.00, 1567.98];
    let chimeIdx = 0;

    const chimeInterval = setInterval(() => {
      if (!this.isAudioPlaying || !this.audioCtx) return;
      try {
        const now = ctx.currentTime;
        const chimeFreq = chimeFrequencies[chimeIdx % chimeFrequencies.length];
        chimeIdx++;

        const chimeOsc = ctx.createOscillator();
        chimeOsc.type = "sine";
        chimeOsc.frequency.setValueAtTime(chimeFreq, now);

        const chimeGain = ctx.createGain();
        chimeGain.gain.setValueAtTime(0.001, now);
        chimeGain.gain.exponentialRampToValueAtTime(0.07, now + 0.03);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

        const chimeFilter = ctx.createBiquadFilter();
        chimeFilter.type = "bandpass";
        chimeFilter.frequency.setValueAtTime(chimeFreq, now);
        chimeFilter.Q.value = 8.0;

        chimeOsc.connect(chimeFilter);
        chimeFilter.connect(chimeGain);
        chimeGain.connect(this.masterGain);

        chimeOsc.start(now);
        chimeOsc.stop(now + 2.85);
      } catch (e) {}
    }, 4200);

    this.activeNodes.push(...padNodes, chimeInterval);
  },

  /**
   * 3. 🪈 Little Krishna Divine Flute (Vrindavan Bansuri & River Murmur)
   * Warm bamboo bansuri melody with soft vibrato, portamento glides, and Yamuna river stream
   */
  createLittleKrishnaFlute() {
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;

    // Yamuna River Water Murmur (Filtered stream noise)
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.02;
    }
    const riverNoise = ctx.createBufferSource();
    riverNoise.buffer = buffer;
    riverNoise.loop = true;

    const riverFilter = ctx.createBiquadFilter();
    riverFilter.type = "bandpass";
    riverFilter.frequency.value = 680;
    riverFilter.Q.value = 2.5;

    const riverGain = ctx.createGain();
    riverGain.gain.value = 0.04;

    riverNoise.connect(riverFilter);
    riverFilter.connect(riverGain);
    riverGain.connect(this.masterGain);
    riverNoise.start();

    // Bansuri Bamboo Flute Instrument
    const fluteOsc = ctx.createOscillator();
    fluteOsc.type = "triangle";
    fluteOsc.frequency.setValueAtTime(440, ctx.currentTime);

    // Warm bamboo 2nd harmonic overtone
    const fluteOvertone = ctx.createOscillator();
    fluteOvertone.type = "sine";
    fluteOvertone.frequency.setValueAtTime(880, ctx.currentTime);

    // Natural human vibrato (4.6 Hz LFO)
    const vibrato = ctx.createOscillator();
    vibrato.frequency.value = 4.6;
    const vibratoGain = ctx.createGain();
    vibratoGain.gain.value = 4.0;
    vibrato.connect(vibratoGain);
    vibratoGain.connect(fluteOsc.frequency);
    vibratoGain.connect(fluteOvertone.frequency);

    const fluteFilter = ctx.createBiquadFilter();
    fluteFilter.type = "lowpass";
    fluteFilter.frequency.value = 950;

    const fluteGain = ctx.createGain();
    fluteGain.gain.value = 0.16;

    fluteOsc.connect(fluteFilter);
    fluteOvertone.connect(fluteFilter);
    fluteFilter.connect(fluteGain);
    fluteGain.connect(this.masterGain);

    fluteOsc.start();
    fluteOvertone.start();
    vibrato.start();

    // Sacred Raag Yaman / Bhupali Melody Sequence (Soulful bansuri phrases)
    const krishnaPhrases = [
      392.00, // G4 (Pa)
      440.00, // A4 (Dha)
      493.88, // B4 (Ni)
      587.33, // D5 (Re)
      659.25, // E5 (Ga)
      783.99, // G5 (Pa)
      659.25, // E5
      587.33, // D5
      493.88, // B4
      440.00  // A4
    ];
    let phraseIdx = 0;

    const fluteInterval = setInterval(() => {
      if (!this.isAudioPlaying || !this.audioCtx) return;
      try {
        const now = ctx.currentTime;
        const targetFreq = krishnaPhrases[phraseIdx % krishnaPhrases.length];
        phraseIdx++;

        // Smooth natural bansuri meend / glissando glide
        fluteOsc.frequency.exponentialRampToValueAtTime(targetFreq, now + 0.18);
        fluteOvertone.frequency.exponentialRampToValueAtTime(targetFreq * 2, now + 0.18);

        // Breath envelope pulsing gently
        fluteGain.gain.setValueAtTime(0.08, now);
        fluteGain.gain.exponentialRampToValueAtTime(0.18, now + 0.15);
        fluteGain.gain.exponentialRampToValueAtTime(0.11, now + 1.8);
      } catch (e) {}
    }, 2000);

    this.activeNodes.push(riverNoise, riverFilter, riverGain, fluteOsc, fluteOvertone, vibrato, vibratoGain, fluteFilter, fluteGain, fluteInterval);
  },

  // --- CryptoLock Two-Way Encrypt & Decrypt ---
  runTwoWayCrypto(input, key) {
    const outEl = document.getElementById("crypto-output");
    const binEl = document.getElementById("crypto-binary-preview");
    if (!outEl || !binEl) return;

    if (!input || !key) {
      outEl.textContent = "(enter input message/hex and secret key)";
      binEl.textContent = "";
      return;
    }

    const keyBytes = key.split("").map(c => c.charCodeAt(0));

    if (this.cryptoMode === "encrypt") {
      let hexResult = "";
      let binaryPreview = "";

      for (let i = 0; i < input.length; i++) {
        const charCode = input.charCodeAt(i);
        const k = keyBytes[i % keyBytes.length];
        const xorByte = charCode ^ k;

        const hex = xorByte.toString(16).padStart(2, "0").toUpperCase();
        hexResult += hex + " ";

        if (i < 8) {
          binaryPreview += xorByte.toString(2).padStart(8, "0") + " ";
        }
      }

      outEl.textContent = hexResult.trim();
      binEl.textContent = `Raw Byte Preview: ${binaryPreview.trim()}${input.length > 8 ? " ... [truncated]" : ""}`;
    } else {
      // Decrypt Mode: Parse Hex bytes or fallback to string chars
      try {
        const cleanHex = input.trim().replace(/[^0-9a-fA-F]/g, " ");
        const tokens = cleanHex.split(/\s+/).filter(Boolean);

        let decryptedText = "";
        tokens.forEach((hexToken, i) => {
          const byteVal = parseInt(hexToken, 16);
          const k = keyBytes[i % keyBytes.length];
          const origChar = String.fromCharCode(byteVal ^ k);
          decryptedText += origChar;
        });

        if (decryptedText.length > 0) {
          outEl.textContent = decryptedText;
          binEl.textContent = `Decrypted ${tokens.length} bytes successfully using key "${key}"`;
        } else {
          outEl.textContent = "(no valid hex bytes found to decrypt)";
          binEl.textContent = "";
        }
      } catch (e) {
        outEl.textContent = "Error during decryption: check hex format.";
        binEl.textContent = "";
      }
    }
  },

  // --- Terminal Command Handler with Matrix & Autocompletion ---
  handleTerminalCommand(cmd) {
    const history = document.getElementById("terminal-history");
    const win = document.getElementById("terminal-window");
    if (!history) return;

    const parts = cmd.trim().split(/\s+/);
    const mainCmd = parts[0]?.toLowerCase() || "";
    const arg1 = parts[1]?.toLowerCase() || "";
    const restArgs = parts.slice(1).join(" ");
    let reply = "";

    // Stop matrix if any command typed
    if (this.isMatrixRunning && mainCmd !== "matrix") {
      this.stopMatrixRain();
    }

    switch (mainCmd) {
      case "help":
        reply = `Available Commands:
  about           - Short bio & background
  hal             - Programming Assistant in Avionics at HAL
  projects        - Overview of projects with links
  research        - Academic research & technical findings
  books           - Books I recommend
  games           - Games I love playing
  skills          - My technical stack
  contact         - Email, Telegram, GitHub & LinkedIn info
  matrix          - Launch Matrix digital rain in terminal
  theme [dark|light] - Toggle site theme
  timer [start|pause|reset] - Control focus timer
  sound [genshin|sky|krishna|off] - Play melodic ambient soundscapes
  friend [name]   - Unlock VIP Friends access for Games & YouTube
  crypto [enc|dec] <key> <msg> - Quick bitwise cipher
  weather         - Local weather (Gopalganj, Bihar & HAL Korwa)
  quote           - Dev & systems wisdom
  clear           - Clear terminal window`;
        break;

      case "research":
        reply = "1. Lightweight Symmetric Bitwise Ciphers for Resource-Constrained Embedded Controllers (C++)\n2. Orthogonal Persistence vs EVM Gas on the Internet Computer (Motoko)";
        break;

      case "myspace":
        if (typeof window.loadAdminStudio === "function") {
          window.loadAdminStudio(true);
          reply = "🔐 Launching Secure Admin Studio (myspace protocol authenticated)...";
        } else if (window.PORTFOLIO_ADMIN) {
          window.PORTFOLIO_ADMIN.open();
          reply = "🔐 Launching Secure Admin Studio...";
        } else {
          reply = "⚠️ Admin Studio is loading...";
        }
        break;

      case "admin":
        reply = "Permission denied: 'admin' command is disabled. System access is restricted.";
        break;

      case "matrix":
        this.startMatrixRain();
        return;

      case "theme":
        if (arg1 === "dark" || arg1 === "light") {
          document.documentElement.setAttribute("data-theme", arg1);
          reply = `Theme switched to ${arg1} mode.`;
        } else {
          const current = document.documentElement.getAttribute("data-theme") || "light";
          const next = current === "dark" ? "light" : "dark";
          document.documentElement.setAttribute("data-theme", next);
          reply = `Theme toggled to ${next} mode.`;
        }
        break;

      case "timer":
        if (arg1 === "start") {
          if (!this.isRunning) this.toggleTimer();
          reply = "Timer started!";
        } else if (arg1 === "pause") {
          if (this.isRunning) this.toggleTimer();
          reply = "Timer paused.";
        } else if (arg1 === "reset") {
          this.resetTimer();
          reply = "Timer reset to default duration.";
        } else {
          reply = "Usage: timer [start | pause | reset]";
        }
        break;

      case "sound":
        if (["genshin", "sky", "krishna"].includes(arg1)) {
          this.audioMode = "ambient";
          this.soundscape = arg1;
          this.stopAllAudioNodes();
          this.startSynthesizedSound();
          this.isAudioPlaying = true;
          this.render();
          reply = `Playing ${arg1} melodic soundscape.`;
        } else if (arg1 === "off" || arg1 === "stop") {
          this.stopAllAudioNodes();
          this.isAudioPlaying = false;
          this.render();
          reply = "Ambient soundscape stopped.";
        } else {
          reply = "Usage: sound [genshin | sky | krishna | off]";
        }
        break;

      case "friend":
      case "invite":
        if (!arg1 || !parts[2]) {
          reply = "🔒 Friend ID and Password required for private YouTube Stream & Study Rooms.\nUsage: friend <username> <password> [display-name]\nExample: friend hal-friend HAL2026 Saurav\nTo request credentials, contact Saurav directly on Telegram (@sauravpandey) or Email (thesauravpandey@outlook.com).";
        } else {
          const userInput = arg1.toLowerCase();
          const passInput = parts[2].toUpperCase();
          const customName = parts.slice(3).join(" ") || this.friendName || "";
          if (window.PORTFOLIO_DB) {
            window.PORTFOLIO_DB.activateFriendSession(userInput, passInput, customName).then(res => {
              const hist = document.getElementById("terminal-history");
              const win = document.getElementById("terminal-window");
              const entry = document.createElement("div");
              entry.className = "term-entry";

              if (res.valid) {
                this.isFriend = true;
                this.friendName = res.name;
                this.friendUsername = res.friend.username;
                this.friendRole = res.friend.role;
                this.activePassKey = res.friend.username.toUpperCase();
                this.render();
                const safeName = (typeof window.escapeHTML === "function") ? window.escapeHTML(res.name) : res.name;
                entry.innerHTML = `
                  <div class="term-cmd-echo"><span class="terminal-prompt">saurav@gopalganj:~$</span> friend ${userInput} ******</div>
                  <div class="term-reply">🌟 Verified Friend Authenticated! Welcome, ${safeName} (${res.friend.role})! Private YouTube stream &amp; study rooms unlocked.</div>
                `;
              } else {
                entry.innerHTML = `
                  <div class="term-cmd-echo"><span class="terminal-prompt">saurav@gopalganj:~$</span> friend ${userInput} ******</div>
                  <div class="term-reply">❌ Authentication Failed: ${res.reason || "Invalid credentials."}<br>Please request your Friend ID &amp; Password from Saurav on Telegram (@sauravpandey) or Email.</div>
                `;
              }
              if (hist) hist.appendChild(entry);
              if (win) win.scrollTop = win.scrollHeight;
            });
            reply = `Verifying credentials for '${userInput}' against database...`;
          } else {
            reply = "⚠️ Database engine initializing...";
          }
        }
        break;

      case "spotify":
        reply = "Spotify player was removed. Switch to zero-lag Melodic Soundscapes (Genshin, Sky, Krishna) or Friends YouTube stream!";
        break;

      case "crypto":
        if (parts.length >= 4) {
          const mode = parts[1].toLowerCase();
          const key = parts[2];
          const text = parts.slice(3).join(" ");
          const keyBytes = key.split("").map(c => c.charCodeAt(0));

          if (mode === "enc") {
            let res = "";
            for (let i = 0; i < text.length; i++) {
              res += (text.charCodeAt(i) ^ keyBytes[i % keyBytes.length]).toString(16).padStart(2, "0").toUpperCase() + " ";
            }
            reply = `Encrypted Hex: ${res.trim()}`;
          } else {
            const hexes = text.split(/\s+/);
            let dec = "";
            hexes.forEach((h, i) => {
              dec += String.fromCharCode(parseInt(h, 16) ^ keyBytes[i % keyBytes.length]);
            });
            reply = `Decrypted: ${dec}`;
          }
        } else {
          reply = "Usage: crypto [enc | dec] <key> <message>";
        }
        break;

      case "about":
        reply = "Saurav Pandey: BCA graduate, MCA student at IIIT Ranchi and IIT Patna, and Programming Assistant in Avionics at HAL (Korwa, Amethi). Home base: Gopalganj, Bihar.";
        break;

      case "hal":
        reply = "Role: Programming Assistant in Avionics Department at Hindustan Aeronautics Limited (HAL), Korwa, Amethi, UP. Assisting with internal software tooling, automation scripts, and database operations.";
        break;

      case "projects":
        reply = "1. CommerceBase (Java/JSP/MySQL)\n2. NFT-Marketplace-DApp (ICP/Motoko)\n3. CryptoLock (C++ Bitwise)\n4. Secure-Auth-App (Node.js/OAuth)\n5. Family-Travel-Tracker (PostgreSQL)";
        break;

      case "books":
        reply = "Recommended reading: 'The Pragmatic Programmer', 'Atomic Habits', and 'Designing Data-Intensive Applications'.";
        break;

      case "games":
      case "arcade":
        this.currentTab = "games";
        this.render();
        reply = "🎮 Switched to Dev Arcade! Choose from Retro Matrix Snake, Tic-Tac-Toe, or Interactive Chess.";
        break;

      case "snake":
        this.currentTab = "games";
        this.render();
        if (window.PORTFOLIO_GAMES) {
          window.PORTFOLIO_GAMES.activeGame = "snake";
          window.PORTFOLIO_GAMES.render();
        }
        reply = "🐍 Launching Retro Matrix Snake!";
        break;

      case "chess":
        this.currentTab = "games";
        this.render();
        if (window.PORTFOLIO_GAMES) {
          window.PORTFOLIO_GAMES.activeGame = "chess";
          window.PORTFOLIO_GAMES.render();
        }
        reply = "♟️ Launching Grandmaster Dev Chess!";
        break;

      case "tictactoe":
      case "ttt":
        this.currentTab = "games";
        this.render();
        if (window.PORTFOLIO_GAMES) {
          window.PORTFOLIO_GAMES.activeGame = "tictactoe";
          window.PORTFOLIO_GAMES.render();
        }
        reply = "⚔️ Launching Tic-Tac-Toe / Dev Duel!";
        break;

      case "sync":
      case "invite":
      case "study":
        this.openInviteModal();
        reply = "👥 Opening Synchronized Study Room modal! Share with friends to sync timer and focus music.";
        break;

      case "youtube":
        this.audioMode = "youtube";
        if (this.isAudioPlaying) this.toggleAmbientAudio();
        this.render();
        reply = "🎧 Switched audio to YouTube Synced Focus Stream.";
        break;

      case "skills":
        reply = "C++, Java, Python, JavaScript, React, Node.js, Express, PostgreSQL, MySQL, Internet Computer (Web3), Git.";
        break;

      case "weather":
        reply = "🌤️ Gopalganj, Bihar: 27°C • Clear skies\n✈️ HAL Korwa, Amethi: 28°C • Mild breeze\nGreat weather for writing code!";
        break;

      case "quote":
        const quotes = [
          "\"Simplicity is prerequisite for reliability.\" — Edsger W. Dijkstra",
          "\"First, solve the problem. Then, write the code.\" — John Johnson",
          "\"Care about your craft.\" — The Pragmatic Programmer"
        ];
        reply = quotes[Math.floor(Math.random() * quotes.length)];
        break;

      case "contact":
        reply = "Email: thesauravpandey@outlook.com | Telegram: t.me/sauravpandey | GitHub: github.com/5auravpandey | LinkedIn: linkedin.com/in/5auravpandey";
        break;

      case "sudo":
        if (arg1 === "hire") {
          reply = "Access Granted! 🚀 Thank you for considering me. Drop an email at thesauravpandey@outlook.com and let's talk!";
        } else {
          reply = "sudo: Access denied. This incident will be reported.";
        }
        break;

      case "sudo hire":
      case "hire":
        reply = "Access Granted! 🚀 Thank you for considering me. Drop an email at thesauravpandey@outlook.com and let's talk!";
        break;

      case "clear":
        history.innerHTML = "";
        return;

      default:
        reply = `Command not recognized: '${cmd}'. Type 'help' to see valid commands.`;
        break;
    }

    const safeCmd = (typeof window.escapeHTML === "function") ? window.escapeHTML(cmd) : cmd.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeReply = (typeof window.escapeHTML === "function") ? window.escapeHTML(reply).replace(/\n/g, "<br>") : reply.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");

    const entry = document.createElement("div");
    entry.className = "term-entry";
    entry.innerHTML = `
      <div class="term-cmd-echo"><span class="terminal-prompt">saurav@gopalganj:~$</span> ${safeCmd}</div>
      <div class="term-reply">${safeReply}</div>
    `;
    history.appendChild(entry);

    if (win) win.scrollTop = win.scrollHeight;
  },

  startMatrixRain() {
    const win = document.getElementById("terminal-window");
    if (!win) return;
    this.isMatrixRunning = true;

    win.innerHTML = `
      <div id="matrix-canvas-box" style="position: relative; width: 100%; height: 260px; overflow: hidden; background: #000;">
        <canvas id="matrix-canvas" style="width: 100%; height: 100%; display: block;"></canvas>
        <button type="button" id="btn-stop-matrix" style="position: absolute; top: 10px; right: 10px; font-family: var(--mono); font-size: 11px; padding: 2px 8px; background: #111; color: #56d364; border: 1px solid #56d364; cursor: pointer; border-radius: 4px;">Exit Matrix [Esc]</button>
      </div>
    `;

    const canvas = document.getElementById("matrix-canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = win.clientWidth;
    canvas.height = 260;

    const chars = "0123456789ABCDEF01SAURAVPANDEYHALAVIONICS";
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);

    this.matrixInterval = setInterval(() => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#00ff66";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }, 35);

    const stopBtn = document.getElementById("btn-stop-matrix");
    if (stopBtn) {
      stopBtn.addEventListener("click", () => this.stopMatrixRain());
    }

    const escListener = (e) => {
      if (e.key === "Escape") {
        this.stopMatrixRain();
        window.removeEventListener("keydown", escListener);
      }
    };
    window.addEventListener("keydown", escListener);
  },

  stopMatrixRain() {
    if (this.matrixInterval) {
      clearInterval(this.matrixInterval);
      this.matrixInterval = null;
    }
    this.isMatrixRunning = false;
    this.render();
  }
};
