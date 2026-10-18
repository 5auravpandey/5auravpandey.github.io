/**
 * Saurav Pandey - Interactive Dev Playground
 * 1. Focus Sprint (4 Web Audio Soundscapes, Spotify Embedded System, Invite Friends)
 * 2. CryptoLock Live Cipher (Two-Way Bitwise XOR Encrypt & Decrypt)
 * 3. Power Terminal Shell (Tab Autocompletion, Command History, Matrix Rain, CLI Controls)
 */
window.PORTFOLIO_PLAYGROUND = {
  currentTab: "focus", // 'focus' | 'crypto' | 'terminal'
  
  // Timer State
  timerDuration: 25 * 60,
  timeLeft: 25 * 60,
  timerInterval: null,
  isRunning: false,
  sprintsCompleted: 0,
  
  // Music & Sound System
  audioMode: "ambient", // 'ambient' | 'spotify'
  soundscape: "tanpura", // 'tanpura' | 'bansuri' | 'temple' | 'tabla'
  audioCtx: null,
  activeNodes: [],
  masterGain: null,
  analyser: null,
  animFrameId: null,
  isAudioPlaying: false,
  spotifyPreset: "indian-classical",
  customSpotifyUrl: "",

  // CryptoLock Two-Way State
  cryptoMode: "encrypt", // 'encrypt' | 'decrypt'

  // Terminal Shell State
  termHistory: [],
  historyIndex: -1,
  isMatrixRunning: false,
  matrixInterval: null,
  terminalCommands: [
    "help", "about", "hal", "projects", "books", "games", "skills", 
    "contact", "admin", "matrix", "theme", "timer", "crypto", "sound", "spotify", "weather", "quote", "clear", "sudo hire"
  ],

  init() {
    this.sprintsCompleted = parseInt(localStorage.getItem("portfolio_sprints") || "0", 10);
    this.checkUrlParams();
    this.render();
  },

  checkUrlParams() {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.has("sprint")) {
        const mins = parseInt(params.get("sprint"), 10);
        if (mins > 0 && mins <= 120) {
          this.timerDuration = mins * 60;
          this.timeLeft = mins * 60;
        }
      }
      if (params.has("tab")) {
        const t = params.get("tab");
        if (["focus", "crypto", "terminal"].includes(t)) {
          this.currentTab = t;
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
            ⏱️ Focus & Music System
          </button>
          <button type="button" class="playground-tab ${this.currentTab === 'crypto' ? 'active' : ''}" data-tab="crypto">
            🔐 CryptoLock (Encrypt & Decrypt)
          </button>
          <button type="button" class="playground-tab ${this.currentTab === 'terminal' ? 'active' : ''}" data-tab="terminal">
            💻 Power Terminal Shell
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
    if (this.currentTab === "focus") {
      const minutes = Math.floor(this.timeLeft / 60).toString().padStart(2, "0");
      const seconds = (this.timeLeft % 60).toString().padStart(2, "0");

      return `
        <div class="focus-pane">
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
            <button type="button" id="btn-invite-friend" class="btn-ambient-action" title="Invite a friend to sprint together">
              👥 Invite a Friend
            </button>
          </div>

          <!-- Music & Audio Center -->
          <div class="focus-audio-center">
            <div class="audio-mode-switcher">
              <button type="button" class="audio-mode-tab ${this.audioMode === 'ambient' ? 'active' : ''}" id="btn-mode-ambient">
                🪕 Indian Soundscapes
              </button>
              <button type="button" class="audio-mode-tab ${this.audioMode === 'spotify' ? 'active' : ''}" id="btn-mode-spotify">
                🟢 Spotify Player
              </button>
            </div>

            ${this.audioMode === 'ambient' ? `
              <div class="ambient-controls">
                <div class="soundscape-selector">
                  <label for="soundscape-select" style="font-family: var(--mono); font-size: 12.5px; color: var(--muted);">Soundscape:</label>
                  <select id="soundscape-select" class="focus-input" style="padding: 4px 8px; font-size: 13.5px; width: auto;">
                    <option value="tanpura" ${this.soundscape === 'tanpura' ? 'selected' : ''}>🪕 Meditative Tanpura (Sa-Pa Drone)</option>
                    <option value="bansuri" ${this.soundscape === 'bansuri' ? 'selected' : ''}>🪈 Bansuri Flute Wind Resonance</option>
                    <option value="temple" ${this.soundscape === 'temple' ? 'selected' : ''}>🕉️ Sacred Temple Om Bowl (432Hz)</option>
                    <option value="tabla" ${this.soundscape === 'tabla' ? 'selected' : ''}>🪘 Tabla Bayan Calming Pulse</option>
                  </select>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <button type="button" id="btn-audio-toggle" class="btn-ambient-action ${this.isAudioPlaying ? 'playing' : ''}">
                    ${this.isAudioPlaying ? "⏸️ Pause Audio" : "▶️ Play Soundscape"}
                  </button>
                  <canvas id="soundscape-visualizer" class="soundscape-canvas" width="112" height="26" title="Live Web Audio Frequency Visualizer" style="border-radius: 4px; background: rgba(0,0,0,0.06); vertical-align: middle;"></canvas>
                </div>
              </div>
            ` : `
              <div class="spotify-controls">
                <div class="spotify-presets">
                  <button type="button" class="spotify-pill ${this.spotifyPreset === 'indian-classical' ? 'active' : ''}" data-spotify="indian-classical">Indian Classical Ragas</button>
                  <button type="button" class="spotify-pill ${this.spotifyPreset === 'indian-lofi' ? 'active' : ''}" data-spotify="indian-lofi">Indian Lofi Focus</button>
                  <button type="button" class="spotify-pill ${this.spotifyPreset === 'bansuri-peace' ? 'active' : ''}" data-spotify="bansuri-peace">Peaceful Bansuri</button>
                </div>
                <div class="spotify-iframe-box">
                  <iframe 
                    style="border-radius:12px; margin-top: 10px;" 
                    src="${this.getSpotifyEmbedUrl()}" 
                    width="100%" 
                    height="152" 
                    frameBorder="0" 
                    allowfullscreen="" 
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                    loading="lazy">
                  </iframe>
                </div>
                <div style="margin-top: 8px; display: flex; gap: 8px;">
                  <input type="text" id="spotify-custom-url" class="focus-input" placeholder="Or paste any Spotify Playlist / Album link..." style="font-size: 13px; text-align: left;" value="${this.customSpotifyUrl}">
                  <button type="button" id="btn-spotify-load" class="btn-secondary-action" style="font-size: 12px; padding: 4px 12px;">Load</button>
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
            <span class="term-title-text">saurav@amethi: ~ (zsh)</span>
            <button type="button" id="btn-term-expand" class="term-expand-btn" title="Toggle Terminal Size">⛶ Expand</button>
          </div>

          <div class="terminal-window" id="terminal-window">
            <div class="terminal-banner">
              Saurav Pandey OS [Version 2.5.0] (x86_64-pc-amethi)<br>
              Type '<span style="color: var(--accent);">help</span>' for commands. Supports <kbd>Tab</kbd> completion & <kbd>↑</kbd>/<kbd>↓</kbd> history.
            </div>
            <div class="terminal-history" id="terminal-history"></div>
            <div class="terminal-prompt-row">
              <span class="terminal-prompt">saurav@amethi:~$</span>
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

  getSpotifyEmbedUrl() {
    if (this.customSpotifyUrl) {
      const match = this.customSpotifyUrl.match(/(playlist|album|track)\/([a-zA-Z0-9]+)/);
      if (match) {
        return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0`;
      }
    }

    switch (this.spotifyPreset) {
      case "indian-lofi":
        return "https://open.spotify.com/embed/playlist/37i9dQZF1DX3rxVfibe1L0?utm_source=generator&theme=0";
      case "bansuri-peace":
        return "https://open.spotify.com/embed/playlist/37i9dQZF1DWZqd5JICZI0u?utm_source=generator&theme=0";
      case "indian-classical":
      default:
        return "https://open.spotify.com/embed/playlist/37i9dQZF1DX8Uebhn9wzrS?utm_source=generator&theme=0";
    }
  },

  bindEvents() {
    // Tab switching
    const tabs = document.querySelectorAll(".playground-tab");
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        const next = tab.dataset.tab;
        if (this.currentTab === next) return;
        this.currentTab = next;
        this.render();
      });
    });

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

      // Audio Mode Tabs (Ambient vs Spotify)
      const ambientModeBtn = document.getElementById("btn-mode-ambient");
      const spotifyModeBtn = document.getElementById("btn-mode-spotify");

      if (ambientModeBtn) {
        ambientModeBtn.addEventListener("click", () => {
          this.audioMode = "ambient";
          this.render();
        });
      }
      if (spotifyModeBtn) {
        spotifyModeBtn.addEventListener("click", () => {
          this.audioMode = "spotify";
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

      // Spotify Presets
      const spotifyPills = document.querySelectorAll(".spotify-pill");
      spotifyPills.forEach(pill => {
        pill.addEventListener("click", () => {
          this.spotifyPreset = pill.dataset.spotify;
          this.customSpotifyUrl = "";
          this.render();
        });
      });

      const loadCustomBtn = document.getElementById("btn-spotify-load");
      const customUrlInput = document.getElementById("spotify-custom-url");
      if (loadCustomBtn && customUrlInput) {
        loadCustomBtn.addEventListener("click", () => {
          this.customSpotifyUrl = customUrlInput.value.trim();
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
  },

  // --- Focus Timer Methods ---
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

  // Invite Modal
  openInviteModal() {
    const dialog = document.getElementById("invite-dialog");
    if (dialog) {
      const liveOrigin = window.location.origin.includes("localhost") || window.location.origin.includes("127.0.0.1") || window.location.protocol === "file:"
        ? "https://sauravpandey.me"
        : window.location.origin;
      const shareUrl = `${liveOrigin}${window.location.pathname}?tab=focus&sprint=25`;
      const input = document.getElementById("invite-link-input");
      if (input) input.value = shareUrl;

      const whatsapp = dialog.querySelector(".btn-social-share.whatsapp");
      if (whatsapp) {
        whatsapp.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(`Hey! Join me for a 25-minute focus sprint on Saurav's dev site: ${shareUrl}`)}`;
      }
      const twitter = dialog.querySelector(".btn-social-share.twitter");
      if (twitter) {
        twitter.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Doing a deep work coding sprint with authentic Indian soundscapes on @5auravpandey's portfolio!&url=${shareUrl}`)}`;
      }
      const telegram = dialog.querySelector(".btn-social-share.telegram");
      if (telegram) {
        telegram.href = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Join me for a focus sprint!`)}`;
      }

      dialog.showModal();
    }
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

      if (this.soundscape === "tanpura") {
        this.createTanpuraDrone();
      } else if (this.soundscape === "bansuri") {
        this.createBansuriFlute();
      } else if (this.soundscape === "temple") {
        this.createSacredTempleBowl();
      } else if (this.soundscape === "tabla") {
        this.createTablaBayanPulse();
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
   * 1. Meditative Tanpura (Sa-Pa Drone with Jawari Shimmer)
   * Sa = 136.1 Hz (C#3 fundamental), Pa = 204.15 Hz, Kharaj Sa = 68.05 Hz, Tar Sa = 272.2 Hz
   */
  createTanpuraDrone() {
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;

    // String 1: Kharaj Sa (Deep Bass Root - 68.05 Hz)
    const kharaj = ctx.createOscillator();
    kharaj.type = "sine";
    kharaj.frequency.value = 68.05;
    const kharajGain = ctx.createGain();
    kharajGain.gain.value = 0.35;
    kharaj.connect(kharajGain);
    kharajGain.connect(this.masterGain);
    kharaj.start();

    // String 2: Pa (Fifth Harmonic - 204.15 Hz) with gentle cyclic pluck swelling
    const pa = ctx.createOscillator();
    pa.type = "sawtooth";
    pa.frequency.value = 204.15;
    const paFilter = ctx.createBiquadFilter();
    paFilter.type = "lowpass";
    paFilter.frequency.value = 520;
    const paGain = ctx.createGain();
    paGain.gain.value = 0.12;

    const paLfo = ctx.createOscillator();
    paLfo.frequency.value = 0.22;
    const paLfoGain = ctx.createGain();
    paLfoGain.gain.value = 0.08;
    paLfo.connect(paLfoGain);
    paLfoGain.connect(paGain.gain);

    pa.connect(paFilter);
    paFilter.connect(paGain);
    paGain.connect(this.masterGain);
    pa.start();
    paLfo.start();

    // String 3: Madhya Sa (Middle Root - 136.1 Hz)
    const sa = ctx.createOscillator();
    sa.type = "sawtooth";
    sa.frequency.value = 136.1;
    const saFilter = ctx.createBiquadFilter();
    saFilter.type = "lowpass";
    saFilter.frequency.value = 480;
    const saGain = ctx.createGain();
    saGain.gain.value = 0.14;

    const saLfo = ctx.createOscillator();
    saLfo.frequency.value = 0.16;
    const saLfoGain = ctx.createGain();
    saLfoGain.gain.value = 0.09;
    saLfo.connect(saLfoGain);
    saLfoGain.connect(saGain.gain);

    sa.connect(saFilter);
    saFilter.connect(saGain);
    saGain.connect(this.masterGain);
    sa.start();
    saLfo.start();

    // String 4: Tar Sa (Higher Octave - 272.2 Hz)
    const tarSa = ctx.createOscillator();
    tarSa.type = "sine";
    tarSa.frequency.value = 272.2;
    const tarGain = ctx.createGain();
    tarGain.gain.value = 0.08;
    tarSa.connect(tarGain);
    tarGain.connect(this.masterGain);
    tarSa.start();

    // Jawari thread acoustic buzz/shimmer (gentle resonant bandpass noise)
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.015;
    }
    const jawariNoise = ctx.createBufferSource();
    jawariNoise.buffer = buffer;
    jawariNoise.loop = true;

    const jawariFilter = ctx.createBiquadFilter();
    jawariFilter.type = "bandpass";
    jawariFilter.frequency.value = 950;
    jawariFilter.Q.value = 3.5;

    jawariNoise.connect(jawariFilter);
    jawariFilter.connect(this.masterGain);
    jawariNoise.start();

    this.activeNodes.push(kharaj, pa, paLfo, sa, saLfo, tarSa, jawariNoise, paFilter, saFilter, jawariFilter);
  },

  /**
   * 2. Bansuri Flute Wind Resonance
   * Warm bamboo flute tone (432Hz fundamental) layered with breath noise and soft micro-vibrato
   */
  createBansuriFlute() {
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;

    // Flute Fundamental (Triangle warmth)
    const flute = ctx.createOscillator();
    flute.type = "triangle";
    flute.frequency.value = 432;

    // Soft human vibrato (4.5 Hz LFO)
    const vibrato = ctx.createOscillator();
    vibrato.frequency.value = 4.5;
    const vibratoGain = ctx.createGain();
    vibratoGain.gain.value = 3.5;
    vibrato.connect(vibratoGain);
    vibratoGain.connect(flute.frequency);

    const fluteFilter = ctx.createBiquadFilter();
    fluteFilter.type = "lowpass";
    fluteFilter.frequency.value = 850;

    const fluteGain = ctx.createGain();
    fluteGain.gain.value = 0.22;

    flute.connect(fluteFilter);
    fluteFilter.connect(fluteGain);
    fluteGain.connect(this.masterGain);

    // Bamboo breath turbulence (filtered noise with slow breath swell)
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const breath = ctx.createBufferSource();
    breath.buffer = buffer;
    breath.loop = true;

    const breathFilter = ctx.createBiquadFilter();
    breathFilter.type = "bandpass";
    breathFilter.frequency.value = 860;
    breathFilter.Q.value = 5.0;

    const breathGain = ctx.createGain();
    breathGain.gain.value = 0.04;

    const breathLfo = ctx.createOscillator();
    breathLfo.frequency.value = 0.15;
    const breathLfoGain = ctx.createGain();
    breathLfoGain.gain.value = 0.025;
    breathLfo.connect(breathLfoGain);
    breathLfoGain.connect(breathGain.gain);

    breath.connect(breathFilter);
    breathFilter.connect(breathGain);
    breathGain.connect(this.masterGain);

    flute.start();
    vibrato.start();
    breath.start();
    breathLfo.start();

    this.activeNodes.push(flute, vibrato, breath, breathLfo, fluteFilter, breathFilter);
  },

  /**
   * 3. Sacred Temple Om Bowl (432Hz Binaural Meditation)
   * Pure bell tones at 432 Hz, 864 Hz, and 108 Hz sub-tone with slow rotary phasing
   */
  createSacredTempleBowl() {
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;

    const bowl1 = ctx.createOscillator();
    bowl1.type = "sine";
    bowl1.frequency.value = 432;

    const bowl2 = ctx.createOscillator();
    bowl2.type = "sine";
    bowl2.frequency.value = 436;

    const chime = ctx.createOscillator();
    chime.type = "sine";
    chime.frequency.value = 864;
    const chimeGain = ctx.createGain();
    chimeGain.gain.value = 0.06;
    chime.connect(chimeGain);
    chimeGain.connect(this.masterGain);

    const sub = ctx.createOscillator();
    sub.type = "sine";
    sub.frequency.value = 108;
    const subGain = ctx.createGain();
    subGain.gain.value = 0.18;
    sub.connect(subGain);
    subGain.connect(this.masterGain);

    const swell = ctx.createOscillator();
    swell.frequency.value = 0.08;
    const swellGain = ctx.createGain();
    swellGain.gain.value = 0.06;

    const bowlMaster = ctx.createGain();
    bowlMaster.gain.value = 0.16;
    swell.connect(swellGain);
    swellGain.connect(bowlMaster.gain);

    bowl1.connect(bowlMaster);
    bowl2.connect(bowlMaster);
    bowlMaster.connect(this.masterGain);

    bowl1.start();
    bowl2.start();
    chime.start();
    sub.start();
    swell.start();

    this.activeNodes.push(bowl1, bowl2, chime, sub, swell);
  },

  /**
   * 4. Tabla Bayan Calming Pulse
   * Low meditative Ghe/Dha rhythmic pulse every 3.2 seconds with background Sa root drone
   */
  createTablaBayanPulse() {
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;

    const bgSa = ctx.createOscillator();
    bgSa.type = "sine";
    bgSa.frequency.value = 136.1;
    const bgGain = ctx.createGain();
    bgGain.gain.value = 0.09;
    bgSa.connect(bgGain);
    bgGain.connect(this.masterGain);
    bgSa.start();

    const strikeInterval = setInterval(() => {
      if (!this.isAudioPlaying || !this.audioCtx) return;
      try {
        const now = ctx.currentTime;
        const bayan = ctx.createOscillator();
        const bayanGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(280, now);

        bayan.type = "sine";
        bayan.frequency.setValueAtTime(92, now);
        bayan.frequency.exponentialRampToValueAtTime(54, now + 0.35);

        bayanGain.gain.setValueAtTime(0.28, now);
        bayanGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        bayan.connect(filter);
        filter.connect(bayanGain);
        bayanGain.connect(this.masterGain);

        bayan.start(now);
        bayan.stop(now + 1.25);
      } catch (e) {}
    }, 3200);

    this.activeNodes.push(bgSa, strikeInterval);
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
  sound [tanpura|bansuri|temple|tabla|off] - Play Indian soundscapes
  spotify         - Switch focus audio to Spotify
  crypto [enc|dec] <key> <msg> - Quick bitwise cipher
  weather         - Mock local weather in Amethi, UP
  quote           - Dev & systems wisdom
  clear           - Clear terminal window`;
        break;

      case "research":
        reply = "1. Lightweight Symmetric Bitwise Ciphers for Resource-Constrained Embedded Controllers (C++)\n2. Orthogonal Persistence vs EVM Gas on the Internet Computer (Motoko)";
        break;

      case "admin":
        if (window.PORTFOLIO_ADMIN) {
          window.PORTFOLIO_ADMIN.open();
          reply = "Opening Google Authenticator prompt...";
        } else {
          reply = "Admin Studio is loading.";
        }
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
        if (["tanpura", "bansuri", "temple", "tabla"].includes(arg1)) {
          this.audioMode = "ambient";
          this.soundscape = arg1;
          this.stopAllAudioNodes();
          this.startSynthesizedSound();
          this.isAudioPlaying = true;
          this.render();
          reply = `Playing ${arg1} Indian soundscape.`;
        } else if (arg1 === "off" || arg1 === "stop") {
          this.stopAllAudioNodes();
          this.isAudioPlaying = false;
          this.render();
          reply = "Ambient soundscape stopped.";
        } else {
          reply = "Usage: sound [tanpura | bansuri | temple | tabla | off]";
        }
        break;

      case "spotify":
        this.audioMode = "spotify";
        this.render();
        reply = "Switched to Spotify focus player in the Focus tab.";
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
        reply = "Saurav Pandey: MCA student at IIIT Ranchi and IIT Patna, and Programming Assistant in the Avionics Department at HAL. I like understanding software from scratch.";
        break;

      case "hal":
        reply = "Role: Programming Assistant in Avionics Department at Hindustan Aeronautics Limited (HAL). Assisting with internal software tooling, automation scripts, and database operations.";
        break;

      case "projects":
        reply = "1. CommerceBase (Java/JSP/MySQL)\n2. NFT-Marketplace-DApp (ICP/Motoko)\n3. CryptoLock (C++ Bitwise)\n4. Secure-Auth-App (Node.js/OAuth)\n5. Family-Travel-Tracker (PostgreSQL)";
        break;

      case "books":
        reply = "Recommended reading: 'The Pragmatic Programmer', 'Atomic Habits', and 'Designing Data-Intensive Applications'.";
        break;

      case "games":
        reply = "Favorite games: Elden Ring (Masterpiece RPG), Portal 2 (Physics puzzle genius), and Cyberpunk 2077 (Dark lofi aesthetic).";
        break;

      case "skills":
        reply = "C++, Java, Python, JavaScript, React, Node.js, Express, PostgreSQL, MySQL, Internet Computer (Web3), Git.";
        break;

      case "weather":
        reply = "🌤️ Amethi, UP, India: 28°C • Mild breeze • Great weather for writing code!";
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
      <div class="term-cmd-echo"><span class="terminal-prompt">saurav@amethi:~$</span> ${safeCmd}</div>
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
      if (e.key === "Escape" || this.isMatrixRunning) {
        this.stopMatrixRain();
        window.removeEventListener("keydown", escListener);
      }
    };
    window.addEventListener("keydown", escListener, { once: true });
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
