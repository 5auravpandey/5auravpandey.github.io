/**
 * Saurav Pandey - Dev Arcade Games Suite
 * 1. Retro Matrix Snake (Canvas grid, memory tokens, Web Audio sound effects, mobile D-pad)
 * 2. Tic-Tac-Toe / Dev Duel (2-player Pass & Play or vs HAL Minimax AI, score tracker)
 * 3. Interactive Chess / Grandmaster Dev (8x8 board, legal move rules, captures, vs DeepCode AI)
 * Fully responsive for mobile touch and desktop keyboards.
 */
window.PORTFOLIO_GAMES = {
  activeGame: "snake", // 'snake' | 'tictactoe' | 'chess'
  audioCtx: null,

  init() {
    this.render();
  },

  getAudioContext() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.audioCtx = new AudioCtx();
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  },

  playTone(freq, duration = 0.08, type = "sine") {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  },

  render() {
    const container = document.getElementById("dev-games-container");
    if (!container) return;

    container.innerHTML = `
      <div class="games-arcade-card">
        <!-- Arcade Header & Game Selector Bar -->
        <div class="arcade-header">
          <div class="arcade-title-group">
            <span class="arcade-badge">🎮 Dev Arcade</span>
            <h3 style="margin: 0; font-size: 18px;">Play &amp; Challenge Friends</h3>
          </div>
          <div class="arcade-switcher" role="tablist">
            <button type="button" class="arcade-tab ${this.activeGame === 'snake' ? 'active' : ''}" data-game="snake">
              🐍 Matrix Snake
            </button>
            <button type="button" class="arcade-tab ${this.activeGame === 'tictactoe' ? 'active' : ''}" data-game="tictactoe">
              ⚔️ Tic-Tac-Toe
            </button>
            <button type="button" class="arcade-tab ${this.activeGame === 'chess' ? 'active' : ''}" data-game="chess">
              ♟️ Chess
            </button>
          </div>
        </div>

        <!-- Active Game Viewport -->
        <div class="arcade-viewport" id="arcade-active-viewport">
          ${this.renderActiveGameHtml()}
        </div>
      </div>
    `;

    this.bindGlobalEvents();
    this.initActiveGame();
  },

  renderActiveGameHtml() {
    if (this.activeGame === "snake") return this.renderSnakeHtml();
    if (this.activeGame === "tictactoe") return this.renderTicTacToeHtml();
    if (this.activeGame === "chess") return this.renderChessHtml();
    return "";
  },

  bindGlobalEvents() {
    const tabs = document.querySelectorAll(".arcade-tab");
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        const next = tab.dataset.game;
        if (this.activeGame === next) return;
        this.destroyCurrentGame();
        this.activeGame = next;
        this.render();
      });
    });
  },

  destroyCurrentGame() {
    if (this.snakeInterval) {
      clearInterval(this.snakeInterval);
      this.snakeInterval = null;
    }
  },

  initActiveGame() {
    if (this.activeGame === "snake") this.initSnake();
    else if (this.activeGame === "tictactoe") this.initTicTacToe();
    else if (this.activeGame === "chess") this.initChess();
  },

  // =========================================================================
  // 1. RETRO MATRIX SNAKE ENGINE
  // =========================================================================
  snakeGridSize: 20,
  snakeCells: 20,
  snake: [],
  snakeDir: { x: 1, y: 0 },
  snakeNextDir: { x: 1, y: 0 },
  snakeFood: { x: 10, y: 10, token: "0xFF" },
  snakeBonusFood: null, // { x, y, symbol, type, points, grow, expiresAt }
  snakeBonusTimer: null,
  snakeFoodsEaten: 0,
  snakePendingGrowth: 0,
  snakeScore: 0,
  snakeHighScore: 0,
  snakeInterval: null,
  snakeGameOver: false,
  snakeSpeedMs: 105,
  snakeSpeedName: "normal", // 'chill' | 'normal' | 'turbo' | 'insane'
  snakeTokens: ["0xFF", "HAL", "WASM", "JAVA", "C++", "0x00", "NODE", "SQL", "LINUX"],

  getSnakeLeaderboard() {
    try {
      const raw = localStorage.getItem("portfolio_snake_leaderboard");
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [
      { name: "Saurav (HAL)", score: 180, speed: "Turbo", date: "2026-10-18" },
      { name: "Aman K.", score: 140, speed: "Normal", date: "2026-10-17" },
      { name: "Rohan V.", score: 110, speed: "Normal", date: "2026-10-16" },
      { name: "Priya S.", score: 90, speed: "Chill", date: "2026-10-15" },
      { name: "Dev Cadet", score: 60, speed: "Normal", date: "2026-10-14" }
    ];
  },

  renderSnakeHtml() {
    this.snakeHighScore = parseInt(localStorage.getItem("portfolio_snake_hs") || "0", 10);
    const friendName = localStorage.getItem("portfolio_friend_name") || "Friend";
    const leaderboard = this.getSnakeLeaderboard();

    return `
      <div class="snake-arena">
        <div class="game-topbar">
          <div class="score-display">
            <span>Score: <strong id="snake-score-val">0</strong></span>
            <span style="color: var(--muted); margin-left: 10px;">High Score: <strong id="snake-hs-val">${this.snakeHighScore}</strong></span>
            <span class="snake-borderless-badge" title="Snake wraps around borders seamlessly without dying!">
              🌐 Borderless
            </span>
          </div>
          <div style="display: flex; gap: 8px;">
            <button type="button" id="btn-snake-start" class="btn-primary-action" style="font-size: 12px; padding: 5px 12px;">
              ▶ Start Game
            </button>
            <button type="button" id="btn-snake-reset" class="btn-secondary-action" style="font-size: 12px; padding: 5px 12px;">
              Reset
            </button>
          </div>
        </div>

        <!-- Speed Switcher Row -->
        <div class="snake-speed-row">
          <span style="font-size: 12px; color: var(--muted); font-family: var(--mono);">Speed:</span>
          <div class="snake-speed-group" role="group">
            <button type="button" class="snake-speed-btn ${this.snakeSpeedName === 'chill' ? 'active' : ''}" data-speed="chill" data-ms="150">🐢 Chill</button>
            <button type="button" class="snake-speed-btn ${this.snakeSpeedName === 'normal' ? 'active' : ''}" data-speed="normal" data-ms="105">⚡ Normal</button>
            <button type="button" class="snake-speed-btn ${this.snakeSpeedName === 'turbo' ? 'active' : ''}" data-speed="turbo" data-ms="70">🔥 Turbo</button>
            <button type="button" class="snake-speed-btn ${this.snakeSpeedName === 'insane' ? 'active' : ''}" data-speed="insane" data-ms="45">🚀 Insane</button>
          </div>
        </div>

        <!-- Bonus Token HUD Alert -->
        <div id="snake-bonus-hud" class="snake-bonus-hud" style="display: none;">
          <span id="snake-bonus-hud-icon">⭐</span>
          <span id="snake-bonus-hud-text">Bonus Token active!</span>
          <div class="snake-bonus-progress-bar"><div id="snake-bonus-progress-inner"></div></div>
        </div>

        <div class="snake-canvas-box">
          <canvas id="snake-canvas" width="400" height="400" class="snake-canvas"></canvas>
          <div id="snake-overlay" class="game-overlay" style="display: none;">
            <div class="game-overlay-box">
              <h4 id="snake-overlay-title" style="margin: 0 0 6px; font-size: 20px;">Game Over!</h4>
              <p id="snake-overlay-desc" style="margin: 0 0 14px; font-size: 13px; color: var(--muted);">Press restart to play again</p>
              <div id="snake-name-save-box" style="margin-bottom: 14px; display: none;">
                <label for="snake-player-name" style="font-size: 12px; display: block; margin-bottom: 4px; color: var(--muted);">
                  Save to Friends Hall of Fame:
                </label>
                <div style="display: flex; gap: 6px; justify-content: center;">
                  <input type="text" id="snake-player-name" class="focus-input" value="${friendName}" style="max-width: 170px; font-size: 13px; padding: 5px 8px;" maxlength="18">
                  <button type="button" id="btn-save-snake-score" class="btn-primary-action" style="padding: 5px 12px; font-size: 12px;">Save</button>
                </div>
              </div>
              <button type="button" id="btn-snake-retry" class="btn-primary-action" style="padding: 8px 18px;">Try Again</button>
            </div>
          </div>
        </div>

        <!-- Touch Controls for Mobile Devices -->
        <div class="snake-mobile-controls">
          <div class="dpad-grid">
            <button type="button" class="dpad-btn up" data-dir="up" aria-label="Move Up">▲</button>
            <button type="button" class="dpad-btn left" data-dir="left" aria-label="Move Left">◀</button>
            <button type="button" class="dpad-btn down" data-dir="down" aria-label="Move Down">▼</button>
            <button type="button" class="dpad-btn right" data-dir="right" aria-label="Move Right">▶</button>
          </div>
          <span style="font-size: 11px; color: var(--muted); font-family: var(--mono); text-align: center; display: block; margin-top: 4px;">
            Swipe or use D-Pad / Arrow Keys &bull; Wall wrap-around active
          </span>
        </div>

        <!-- Persistent Friends Hall of Fame -->
        <div class="snake-leaderboard-card">
          <div class="snake-lb-head">
            <span>🏆 Friends Hall of Fame (Top 5)</span>
            <span class="db-sync-badge" title="Persisted in SauravPortfolioDB (Transactional IndexedDB)">💾 Database Synced</span>
          </div>
          <div class="snake-lb-table">
            <div class="snake-lb-row header">
              <span>#</span>
              <span>Player</span>
              <span>Score</span>
              <span>Speed</span>
              <span>Date</span>
            </div>
            <div id="snake-lb-rows">
              ${leaderboard.map((item, idx) => `
                <div class="snake-lb-row ${item.name.toLowerCase().includes(friendName.toLowerCase()) ? 'highlight' : ''}">
                  <span>${idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}</span>
                  <strong>${item.name}</strong>
                  <span class="lb-score">${item.score}</span>
                  <span class="lb-speed">${item.speed || 'Normal'}</span>
                  <span class="lb-date">${item.date || ''}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  initSnake() {
    const canvas = document.getElementById("snake-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    this.snake = [
      { x: 8, y: 10 },
      { x: 7, y: 10 },
      { x: 6, y: 10 }
    ];
    this.snakeDir = { x: 1, y: 0 };
    this.snakeNextDir = { x: 1, y: 0 };
    this.snakeScore = 0;
    this.snakeGameOver = false;
    this.spawnSnakeFood();
    this.drawSnake(ctx, canvas);
    this.loadLeaderboardFromDb();

    const startBtn = document.getElementById("btn-snake-start");
    const resetBtn = document.getElementById("btn-snake-reset");
    const retryBtn = document.getElementById("btn-snake-retry");
    const speedBtns = document.querySelectorAll(".snake-speed-btn");
    const saveScoreBtn = document.getElementById("btn-save-snake-score");
    const nameInput = document.getElementById("snake-player-name");

    if (startBtn) {
      startBtn.addEventListener("click", () => {
        this.startSnakeLoop(canvas, ctx);
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        this.resetSnake(canvas, ctx);
      });
    }

    if (retryBtn) {
      retryBtn.addEventListener("click", () => {
        this.resetSnake(canvas, ctx);
        this.startSnakeLoop(canvas, ctx);
      });
    }

    speedBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        speedBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.snakeSpeedName = btn.dataset.speed;
        this.snakeSpeedMs = parseInt(btn.dataset.ms, 10);
        if (this.snakeInterval) {
          this.startSnakeLoop(canvas, ctx);
        }
      });
    });

    if (saveScoreBtn && nameInput) {
      saveScoreBtn.addEventListener("click", async () => {
        const name = nameInput.value.trim() || "Friend";
        saveScoreBtn.textContent = "Saving...";
        saveScoreBtn.disabled = true;
        await this.saveSnakeScore(name, this.snakeScore);
        saveScoreBtn.textContent = "Saved ✓";
      });
    }

    // Keyboard handlers
    window.addEventListener("keydown", (e) => {
      if (this.activeGame !== "snake") return;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
        // Prevent window scrolling while playing
        const activeEl = document.activeElement;
        if (!activeEl || activeEl.tagName !== "INPUT" && activeEl.tagName !== "TEXTAREA") {
          e.preventDefault();
        }
      }

      if ((e.key === "ArrowUp" || e.key === "w" || e.key === "W") && this.snakeDir.y !== 1) {
        this.snakeNextDir = { x: 0, y: -1 };
      } else if ((e.key === "ArrowDown" || e.key === "s" || e.key === "S") && this.snakeDir.y !== -1) {
        this.snakeNextDir = { x: 0, y: 1 };
      } else if ((e.key === "ArrowLeft" || e.key === "a" || e.key === "A") && this.snakeDir.x !== 1) {
        this.snakeNextDir = { x: -1, y: 0 };
      } else if ((e.key === "ArrowRight" || e.key === "d" || e.key === "D") && this.snakeDir.x !== -1) {
        this.snakeNextDir = { x: 1, y: 0 };
      }
    });

    // Touch D-Pad buttons
    const dpadBtns = document.querySelectorAll(".dpad-btn");
    dpadBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const dir = btn.dataset.dir;
        if (dir === "up" && this.snakeDir.y !== 1) this.snakeNextDir = { x: 0, y: -1 };
        else if (dir === "down" && this.snakeDir.y !== -1) this.snakeNextDir = { x: 0, y: 1 };
        else if (dir === "left" && this.snakeDir.x !== 1) this.snakeNextDir = { x: -1, y: 0 };
        else if (dir === "right" && this.snakeDir.x !== -1) this.snakeNextDir = { x: 1, y: 0 };
      });
    });

    // Touch swipe detection on canvas
    let touchStartX = 0;
    let touchStartY = 0;
    canvas.addEventListener("touchstart", (e) => {
      if (e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    canvas.addEventListener("touchend", (e) => {
      if (e.changedTouches.length > 0) {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) > Math.abs(dy)) {
          if (dx > 25 && this.snakeDir.x !== -1) this.snakeNextDir = { x: 1, y: 0 };
          else if (dx < -25 && this.snakeDir.x !== 1) this.snakeNextDir = { x: -1, y: 0 };
        } else {
          if (dy > 25 && this.snakeDir.y !== -1) this.snakeNextDir = { x: 0, y: 1 };
          else if (dy < -25 && this.snakeDir.y !== 1) this.snakeNextDir = { x: 0, y: -1 };
        }
      }
    }, { passive: true });
  },

  spawnSnakeFood() {
    let newX, newY, collision;
    do {
      newX = Math.floor(Math.random() * this.snakeCells);
      newY = Math.floor(Math.random() * this.snakeCells);
      collision = this.snake.some(segment => segment.x === newX && segment.y === newY) ||
                  (this.snakeBonusFood && this.snakeBonusFood.x === newX && this.snakeBonusFood.y === newY);
    } while (collision);

    const token = this.snakeTokens[Math.floor(Math.random() * this.snakeTokens.length)];
    this.snakeFood = { x: newX, y: newY, token };
  },

  spawnBonusFood() {
    if (this.snakeGameOver) return;
    let newX, newY, collision;
    do {
      newX = Math.floor(Math.random() * this.snakeCells);
      newY = Math.floor(Math.random() * this.snakeCells);
      collision = this.snake.some(segment => segment.x === newX && segment.y === newY) ||
                  (this.snakeFood.x === newX && this.snakeFood.y === newY);
    } while (collision);

    const bonusTypes = [
      { symbol: "⭐", type: "star", points: 30, grow: 2, label: "Star Bonus: +30 pts (+2 Length)" },
      { symbol: "💎", type: "gem", points: 50, grow: 3, label: "Diamond Bonus: +50 pts (+3 Length)" },
      { symbol: "⚡", type: "energy", points: 25, grow: 1, label: "Energy Bonus: +25 pts (+1 Length)" }
    ];
    const picked = bonusTypes[Math.floor(Math.random() * bonusTypes.length)];
    const durationMs = 8000;
    const expiresAt = Date.now() + durationMs;

    this.snakeBonusFood = {
      x: newX,
      y: newY,
      symbol: picked.symbol,
      type: picked.type,
      points: picked.points,
      grow: picked.grow,
      label: picked.label,
      expiresAt,
      durationMs
    };

    const hud = document.getElementById("snake-bonus-hud");
    const icon = document.getElementById("snake-bonus-hud-icon");
    const text = document.getElementById("snake-bonus-hud-text");
    const progress = document.getElementById("snake-bonus-progress-inner");
    if (hud && icon && text && progress) {
      icon.textContent = picked.symbol;
      text.textContent = picked.label;
      progress.style.width = "100%";
      hud.style.display = "flex";
    }

    this.playTone(784, 0.12, "sine"); // G5 alert chime
  },

  clearBonusFood() {
    this.snakeBonusFood = null;
    const hud = document.getElementById("snake-bonus-hud");
    if (hud) hud.style.display = "none";
  },

  startSnakeLoop(canvas, ctx) {
    if (this.snakeInterval) clearInterval(this.snakeInterval);
    const overlay = document.getElementById("snake-overlay");
    if (overlay) overlay.style.display = "none";
    const startBtn = document.getElementById("btn-snake-start");
    if (startBtn) startBtn.textContent = "Running...";

    this.snakeInterval = setInterval(() => {
      this.stepSnake(canvas, ctx);
    }, this.snakeSpeedMs || 105);
  },

  resetSnake(canvas, ctx) {
    if (this.snakeInterval) {
      clearInterval(this.snakeInterval);
      this.snakeInterval = null;
    }
    const overlay = document.getElementById("snake-overlay");
    if (overlay) overlay.style.display = "none";
    const startBtn = document.getElementById("btn-snake-start");
    if (startBtn) startBtn.textContent = "▶ Start Game";

    this.snake = [
      { x: 8, y: 10 },
      { x: 7, y: 10 },
      { x: 6, y: 10 }
    ];
    this.snakeDir = { x: 1, y: 0 };
    this.snakeNextDir = { x: 1, y: 0 };
    this.snakeScore = 0;
    this.snakeFoodsEaten = 0;
    this.snakePendingGrowth = 0;
    this.snakeGameOver = false;
    this.clearBonusFood();

    const scoreEl = document.getElementById("snake-score-val");
    if (scoreEl) scoreEl.textContent = "0";

    this.spawnSnakeFood();
    this.drawSnake(ctx, canvas);
  },

  stepSnake(canvas, ctx) {
    if (this.snakeGameOver) return;
    this.snakeDir = this.snakeNextDir;

    // BORDERLESS WRAP-AROUND: snake NEVER dies hitting the wall!
    const head = {
      x: (this.snake[0].x + this.snakeDir.x + this.snakeCells) % this.snakeCells,
      y: (this.snake[0].y + this.snakeDir.y + this.snakeCells) % this.snakeCells
    };

    // Self collision: snake dies only if running into its own body
    if (this.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
      this.handleSnakeGameOver();
      return;
    }

    this.snake.unshift(head);

    let ateFood = false;

    // 1. Regular Food collision
    if (head.x === this.snakeFood.x && head.y === this.snakeFood.y) {
      ateFood = true;
      this.snakeScore += 10;
      this.snakeFoodsEaten++;
      this.playTone(587.33, 0.08, "triangle"); // D5 bleep

      const scoreEl = document.getElementById("snake-score-val");
      if (scoreEl) scoreEl.textContent = this.snakeScore.toString();

      if (this.snakeScore > this.snakeHighScore) {
        this.snakeHighScore = this.snakeScore;
        localStorage.setItem("portfolio_snake_hs", this.snakeHighScore.toString());
        const hsEl = document.getElementById("snake-hs-val");
        if (hsEl) hsEl.textContent = this.snakeHighScore.toString();
      }

      // Periodically spawn bonus item every 4 regular foods
      if (this.snakeFoodsEaten % 4 === 0 && !this.snakeBonusFood) {
        this.spawnBonusFood();
      }

      this.spawnSnakeFood();
    }

    // 2. Bonus Food collision
    if (this.snakeBonusFood && head.x === this.snakeBonusFood.x && head.y === this.snakeBonusFood.y) {
      ateFood = true;
      this.snakeScore += this.snakeBonusFood.points;
      this.snakePendingGrowth += this.snakeBonusFood.grow;

      // Happy bonus chime: E5 -> G#5 -> B5 arpeggio
      this.playTone(659.25, 0.08, "sine");
      setTimeout(() => this.playTone(830.61, 0.08, "sine"), 90);
      setTimeout(() => this.playTone(987.77, 0.14, "sine"), 180);

      const scoreEl = document.getElementById("snake-score-val");
      if (scoreEl) scoreEl.textContent = this.snakeScore.toString();

      if (this.snakeScore > this.snakeHighScore) {
        this.snakeHighScore = this.snakeScore;
        localStorage.setItem("portfolio_snake_hs", this.snakeHighScore.toString());
        const hsEl = document.getElementById("snake-hs-val");
        if (hsEl) hsEl.textContent = this.snakeHighScore.toString();
      }

      this.clearBonusFood();
    }

    // Handle tail popping & pending length growth
    if (this.snakePendingGrowth > 0) {
      this.snakePendingGrowth--;
      // Snake grows extra length (do not pop tail)
    } else if (!ateFood) {
      this.snake.pop();
    }

    // Update active bonus countdown progress bar
    if (this.snakeBonusFood) {
      const remainingMs = this.snakeBonusFood.expiresAt - Date.now();
      if (remainingMs <= 0) {
        this.clearBonusFood();
      } else {
        const progress = document.getElementById("snake-bonus-progress-inner");
        if (progress) {
          const pct = Math.max(0, (remainingMs / this.snakeBonusFood.durationMs) * 100);
          progress.style.width = `${pct}%`;
        }
      }
    }

    this.drawSnake(ctx, canvas);
  },

  handleSnakeGameOver() {
    this.snakeGameOver = true;
    if (this.snakeInterval) {
      clearInterval(this.snakeInterval);
      this.snakeInterval = null;
    }
    this.clearBonusFood();
    this.playTone(180, 0.25, "sawtooth"); // Low tone game over
    const overlay = document.getElementById("snake-overlay");
    const desc = document.getElementById("snake-overlay-desc");
    const saveBox = document.getElementById("snake-name-save-box");
    const saveBtn = document.getElementById("btn-save-snake-score");
    if (desc) desc.textContent = `You scored ${this.snakeScore} points at ${this.snakeSpeedName.toUpperCase()} speed!`;
    if (saveBox) {
      if (this.snakeScore > 0) {
        saveBox.style.display = "block";
        if (saveBtn) {
          saveBtn.textContent = "Save Score";
          saveBtn.disabled = false;
        }
      } else {
        saveBox.style.display = "none";
      }
    }
    if (overlay) overlay.style.display = "flex";
  },

  async loadLeaderboardFromDb() {
    try {
      const top5 = window.PORTFOLIO_DB 
        ? await window.PORTFOLIO_DB.getLeaderboard("snake", 5) 
        : this.getSnakeLeaderboard();
      const friendName = localStorage.getItem("portfolio_friend_name") || "Friend";
      const rowsEl = document.getElementById("snake-lb-rows");
      if (rowsEl && top5 && top5.length > 0) {
        rowsEl.innerHTML = top5.map((item, idx) => {
          const pName = item.playerName || item.name || "Anonymous";
          const isHighlight = pName.toLowerCase().includes(friendName.toLowerCase());
          return `
            <div class="snake-lb-row ${isHighlight ? 'highlight' : ''}">
              <span>${idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}</span>
              <strong>${pName}</strong>
              <span class="lb-score">${item.score}</span>
              <span class="lb-speed">${item.speed || 'Normal'}</span>
              <span class="lb-date">${item.date || ''}</span>
            </div>
          `;
        }).join('');
      }
    } catch (e) {}
  },

  async saveSnakeScore(name, score) {
    if (!name || score <= 0) return;
    try {
      const speedLabel = this.snakeSpeedName.charAt(0).toUpperCase() + this.snakeSpeedName.slice(1);
      const passKey = window.PORTFOLIO_DB ? (window.PORTFOLIO_DB.getActivePass()?.key || localStorage.getItem("portfolio_access_pass") || "") : "";

      if (window.PORTFOLIO_DB) {
        await window.PORTFOLIO_DB.saveScore("snake", name, score, speedLabel, passKey);
      } else {
        const list = this.getSnakeLeaderboard();
        const today = new Date().toISOString().slice(0, 10);
        list.push({
          name,
          score,
          speed: speedLabel,
          date: today,
          passKey
        });
        list.sort((a, b) => b.score - a.score);
        localStorage.setItem("portfolio_snake_leaderboard", JSON.stringify(list.slice(0, 5)));
      }

      localStorage.setItem("portfolio_friend_name", name);
      await this.loadLeaderboardFromDb();
    } catch (e) {}
  },

  drawSnake(ctx, canvas) {
    const cellSize = canvas.width / this.snakeCells;
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";

    // Matrix Dark Screen Background
    ctx.fillStyle = isDark ? "#090d14" : "#111827";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle Grid Lines
    ctx.strokeStyle = "rgba(34, 197, 94, 0.05)";
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += cellSize) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Draw Bonus Food Token if Active
    if (this.snakeBonusFood) {
      const bx = this.snakeBonusFood.x * cellSize;
      const by = this.snakeBonusFood.y * cellSize;
      ctx.fillStyle = "#f59e0b";
      ctx.shadowColor = "#f59e0b";
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.roundRect(bx + 1, by + 1, cellSize - 2, cellSize - 2, 6);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.snakeBonusFood.symbol, bx + cellSize / 2, by + cellSize / 2);
    }

    // Draw Food Token
    const fx = this.snakeFood.x * cellSize;
    const fy = this.snakeFood.y * cellSize;
    ctx.fillStyle = "#ef4444";
    ctx.shadowColor = "#ef4444";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.roundRect(fx + 2, fy + 2, cellSize - 4, cellSize - 4, 4);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Food Text Monogram
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.snakeFood.token.slice(0, 3), fx + cellSize / 2, fy + cellSize / 2);

    // Draw Snake Body
    this.snake.forEach((seg, index) => {
      const sx = seg.x * cellSize;
      const sy = seg.y * cellSize;
      const isHead = index === 0;

      ctx.fillStyle = isHead ? "#22c55e" : `rgba(34, 197, 94, ${Math.max(0.4, 1 - index * 0.04)})`;
      if (isHead) {
        ctx.shadowColor = "#22c55e";
        ctx.shadowBlur = 10;
      }
      ctx.beginPath();
      ctx.roundRect(sx + 1, sy + 1, cellSize - 2, cellSize - 2, isHead ? 6 : 3);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Head Eye details
      if (isHead) {
        ctx.fillStyle = "#090d14";
        const eyeOffset = cellSize / 4;
        ctx.beginPath();
        ctx.arc(sx + eyeOffset, sy + eyeOffset, 1.8, 0, Math.PI * 2);
        ctx.arc(sx + cellSize - eyeOffset, sy + eyeOffset, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  },

  // =========================================================================
  // 2. TIC-TAC-TOE ("DEV DUEL") ENGINE
  // =========================================================================
  tttBoard: Array(9).fill(null),
  tttTurn: "X", // 'X' (Player 1) | 'O' (Player 2 / AI)
  tttMode: "ai", // 'ai' | 'pvp'
  tttScore: { p1: 0, p2: 0, ties: 0 },
  tttGameOver: false,

  renderTicTacToeHtml() {
    return `
      <div class="ttt-arena">
        <div class="game-topbar">
          <div class="score-display">
            <span>⚡ P1 (X): <strong id="ttt-s-p1">${this.tttScore.p1}</strong></span>
            <span style="margin: 0 10px;">Tie: <strong id="ttt-s-ties">${this.tttScore.ties}</strong></span>
            <span>🤖 AI / P2 (O): <strong id="ttt-s-p2">${this.tttScore.p2}</strong></span>
          </div>
          <div style="display: flex; gap: 8px;">
            <div class="ttt-mode-toggle">
              <button type="button" class="ttt-mode-btn ${this.tttMode === 'ai' ? 'active' : ''}" data-mode="ai">vs AI</button>
              <button type="button" class="ttt-mode-btn ${this.tttMode === 'pvp' ? 'active' : ''}" data-mode="pvp">2-Player</button>
            </div>
            <button type="button" id="btn-ttt-reset" class="btn-secondary-action" style="font-size: 12px; padding: 4px 10px;">New Round</button>
          </div>
        </div>

        <div class="ttt-status-indicator" id="ttt-status">
          Turn: <span style="color: var(--accent); font-weight: bold;">Player X (⚡)</span>
        </div>

        <div class="ttt-grid" id="ttt-grid">
          ${this.tttBoard.map((cell, idx) => `
            <button type="button" class="ttt-cell ${cell ? 'filled' : ''}" data-index="${idx}" aria-label="Square ${idx + 1}">
              ${cell === 'X' ? '<span class="cell-x">⚡</span>' : cell === 'O' ? '<span class="cell-o">🛡️</span>' : ''}
            </button>
          `).join("")}
        </div>
      </div>
    `;
  },

  initTicTacToe() {
    const grid = document.getElementById("ttt-grid");
    const resetBtn = document.getElementById("btn-ttt-reset");
    const modeBtns = document.querySelectorAll(".ttt-mode-btn");

    modeBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        this.tttMode = btn.dataset.mode;
        this.resetTicTacToe();
        this.render();
      });
    });

    if (resetBtn) {
      resetBtn.addEventListener("click", () => this.resetTicTacToe());
    }

    if (grid) {
      grid.addEventListener("click", (e) => {
        const cell = e.target.closest(".ttt-cell");
        if (!cell || this.tttGameOver) return;
        const index = parseInt(cell.dataset.index, 10);
        if (this.tttBoard[index] !== null) return;

        this.makeTicTacToeMove(index, this.tttTurn);

        if (!this.tttGameOver && this.tttMode === "ai" && this.tttTurn === "O") {
          setTimeout(() => this.makeAiMove(), 250);
        }
      });
    }
  },

  makeTicTacToeMove(index, player) {
    if (this.tttBoard[index] !== null || this.tttGameOver) return;
    this.tttBoard[index] = player;
    this.playTone(player === "X" ? 520 : 680, 0.07, "sine");

    const winner = this.checkTicTacToeWinner(this.tttBoard);
    if (winner) {
      this.tttGameOver = true;
      if (winner === "tie") {
        this.tttScore.ties++;
        this.updateTttStatus("🤝 It's a draw!");
      } else {
        if (winner === "X") {
          this.tttScore.p1++;
          if (window.PORTFOLIO_DB) {
            const pName = localStorage.getItem("portfolio_friend_name") || "Player 1";
            const pPass = window.PORTFOLIO_DB.getActivePass()?.key || "";
            window.PORTFOLIO_DB.saveScore("tictactoe", pName, this.tttScore.p1 * 10, this.tttMode === "ai" ? "vs-AI" : "PvP", pPass);
          }
        } else {
          this.tttScore.p2++;
        }
        this.updateTttStatus(`🏆 Player ${winner === "X" ? "1 (⚡)" : (this.tttMode === "ai" ? "HAL AI (🛡️)" : "2 (🛡️)")} wins!`);
        this.playTone(880, 0.2, "triangle");
      }
      this.updateTttScoreboard();
    } else {
      this.tttTurn = this.tttTurn === "X" ? "O" : "X";
      this.updateTttStatus(`Turn: Player ${this.tttTurn === "X" ? "1 (⚡)" : (this.tttMode === "ai" ? "HAL AI thinking..." : "2 (🛡️)")}`);
    }

    this.renderTttCells();
  },

  makeAiMove() {
    if (this.tttGameOver) return;
    // Minimax optimal move calculation
    let bestScore = -Infinity;
    let bestMove = null;

    for (let i = 0; i < 9; i++) {
      if (this.tttBoard[i] === null) {
        this.tttBoard[i] = "O";
        const score = this.minimax(this.tttBoard, 0, false);
        this.tttBoard[i] = null;
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }

    if (bestMove !== null) {
      this.makeTicTacToeMove(bestMove, "O");
    }
  },

  minimax(board, depth, isMaximizing) {
    const result = this.checkTicTacToeWinner(board);
    if (result === "O") return 10 - depth;
    if (result === "X") return depth - 10;
    if (result === "tie") return 0;

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = "O";
          const evaluation = this.minimax(board, depth + 1, false);
          board[i] = null;
          maxEval = Math.max(maxEval, evaluation);
        }
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = "X";
          const evaluation = this.minimax(board, depth + 1, true);
          board[i] = null;
          minEval = Math.min(minEval, evaluation);
        }
      }
      return minEval;
    }
  },

  checkTicTacToeWinner(b) {
    const wins = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    for (const [x, y, z] of wins) {
      if (b[x] && b[x] === b[y] && b[x] === b[z]) {
        return b[x];
      }
    }
    if (b.every(cell => cell !== null)) return "tie";
    return null;
  },

  updateTttStatus(msg) {
    const el = document.getElementById("ttt-status");
    if (el) el.innerHTML = msg;
  },

  updateTttScoreboard() {
    const p1 = document.getElementById("ttt-s-p1");
    const p2 = document.getElementById("ttt-s-p2");
    const ties = document.getElementById("ttt-s-ties");
    if (p1) p1.textContent = this.tttScore.p1;
    if (p2) p2.textContent = this.tttScore.p2;
    if (ties) ties.textContent = this.tttScore.ties;
  },

  renderTttCells() {
    const cells = document.querySelectorAll(".ttt-cell");
    cells.forEach((cell, idx) => {
      const val = this.tttBoard[idx];
      cell.innerHTML = val === 'X' ? '<span class="cell-x">⚡</span>' : val === 'O' ? '<span class="cell-o">🛡️</span>' : '';
      cell.classList.toggle("filled", !!val);
    });
  },

  resetTicTacToe() {
    this.tttBoard = Array(9).fill(null);
    this.tttTurn = "X";
    this.tttGameOver = false;
    this.updateTttStatus(`Turn: <span style="color: var(--accent); font-weight: bold;">Player X (⚡)</span>`);
    this.renderTttCells();
  },

  // =========================================================================
  // 3. INTERACTIVE CHESS ("GRANDMASTER DEV") ENGINE
  // =========================================================================
  chessBoard: [],
  chessTurn: "w", // 'w' (White) | 'b' (Black)
  chessMode: "ai", // 'ai' | 'pvp'
  selectedSquare: null,
  legalMoves: [],
  capturedPieces: { w: [], b: [] },
  moveHistory: [],
  chessGameOver: false,

  pieceSymbols: {
    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
  },

  renderChessHtml() {
    return `
      <div class="chess-arena">
        <div class="game-topbar">
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <div class="chess-mode-toggle">
              <button type="button" class="chess-mode-btn ${this.chessMode === 'ai' ? 'active' : ''}" data-mode="ai">vs AI</button>
              <button type="button" class="chess-mode-btn ${this.chessMode === 'pvp' ? 'active' : ''}" data-mode="pvp">Pass &amp; Play</button>
            </div>
            <span id="chess-status" style="font-size: 13px; font-weight: 500;">White's Turn (You)</span>
          </div>
          <button type="button" id="btn-chess-reset" class="btn-secondary-action" style="font-size: 12px; padding: 4px 10px;">
            New Match
          </button>
        </div>

        <!-- Captured Pieces Tray (Top: Black captures) -->
        <div class="captured-tray" id="tray-black" style="min-height: 24px; font-size: 18px; color: #111;">
          ${this.capturedPieces.b.map(p => this.pieceSymbols[p]).join(" ")}
        </div>

        <!-- 8x8 Board Container -->
        <div class="chessboard-wrapper">
          <div class="chessboard" id="chessboard"></div>
        </div>

        <!-- Captured Pieces Tray (Bottom: White captures) -->
        <div class="captured-tray" id="tray-white" style="min-height: 24px; font-size: 18px; color: #60a5fa;">
          ${this.capturedPieces.w.map(p => this.pieceSymbols[p]).join(" ")}
        </div>

        <div style="font-size: 11.5px; color: var(--muted); font-family: var(--mono); text-align: center; margin-top: 6px;">
          Tap any piece to view legal moves • Tap a green dot to move
        </div>
      </div>
    `;
  },

  initChess() {
    this.resetChessBoard();
    this.renderChessBoard();

    const resetBtn = document.getElementById("btn-chess-reset");
    if (resetBtn) resetBtn.addEventListener("click", () => this.resetChess());

    const modeBtns = document.querySelectorAll(".chess-mode-btn");
    modeBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        this.chessMode = btn.dataset.mode;
        this.resetChess();
        this.render();
      });
    });
  },

  resetChessBoard() {
    this.chessBoard = [
      ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
      ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
      ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
    ];
    this.chessTurn = "w";
    this.selectedSquare = null;
    this.legalMoves = [];
    this.capturedPieces = { w: [], b: [] };
    this.moveHistory = [];
    this.chessGameOver = false;
  },

  resetChess() {
    this.resetChessBoard();
    this.renderChessBoard();
    const status = document.getElementById("chess-status");
    if (status) status.textContent = "White's Turn (You)";
    this.updateCapturedTrays();
  },

  renderChessBoard() {
    const boardEl = document.getElementById("chessboard");
    if (!boardEl) return;
    boardEl.innerHTML = "";

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const isDarkSquare = (r + c) % 2 === 1;
        const piece = this.chessBoard[r][c];
        const isSelected = this.selectedSquare && this.selectedSquare.r === r && this.selectedSquare.c === c;
        const isLegalMove = this.legalMoves.some(m => m.r === r && m.c === c);

        const sq = document.createElement("div");
        sq.className = `chess-sq ${isDarkSquare ? 'dark' : 'light'} ${isSelected ? 'selected' : ''} ${isLegalMove ? 'valid-target' : ''}`;
        sq.dataset.r = r;
        sq.dataset.c = c;

        if (piece) {
          const isWhitePiece = piece === piece.toUpperCase();
          const pSpan = document.createElement("span");
          pSpan.className = `chess-piece ${isWhitePiece ? 'piece-white' : 'piece-black'}`;
          pSpan.textContent = this.pieceSymbols[piece] || "";
          sq.appendChild(pSpan);
        }

        if (isLegalMove) {
          const dot = document.createElement("span");
          dot.className = piece ? "chess-move-capture" : "chess-move-dot";
          sq.appendChild(dot);
        }

        sq.addEventListener("click", () => this.handleSquareClick(r, c));
        boardEl.appendChild(sq);
      }
    }
  },

  handleSquareClick(r, c) {
    if (this.chessGameOver) return;
    if (this.chessMode === "ai" && this.chessTurn === "b") return;

    const clickedPiece = this.chessBoard[r][c];
    const isCurrentPlayerPiece = clickedPiece && (
      (this.chessTurn === "w" && clickedPiece === clickedPiece.toUpperCase()) ||
      (this.chessTurn === "b" && clickedPiece === clickedPiece.toLowerCase())
    );

    // If clicking on a valid destination for the selected piece
    if (this.selectedSquare && this.legalMoves.some(m => m.r === r && m.c === c)) {
      this.executeChessMove(this.selectedSquare, { r, c });
      return;
    }

    // Otherwise select the piece if it belongs to current player
    if (isCurrentPlayerPiece) {
      this.selectedSquare = { r, c };
      this.legalMoves = this.calculateLegalMoves(r, c);
      this.playTone(380, 0.04, "sine");
      this.renderChessBoard();
    } else {
      this.selectedSquare = null;
      this.legalMoves = [];
      this.renderChessBoard();
    }
  },

  executeChessMove(from, to) {
    const movingPiece = this.chessBoard[from.r][from.c];
    const destPiece = this.chessBoard[to.r][to.c];

    if (destPiece) {
      if (destPiece === destPiece.toUpperCase()) {
        this.capturedPieces.w.push(destPiece);
      } else {
        this.capturedPieces.b.push(destPiece);
      }
      this.playTone(600, 0.12, "triangle"); // capture sound
    } else {
      this.playTone(480, 0.06, "sine"); // move sound
    }

    // Pawn Promotion to Queen
    if (movingPiece === 'P' && to.r === 0) {
      this.chessBoard[to.r][to.c] = 'Q';
    } else if (movingPiece === 'p' && to.r === 7) {
      this.chessBoard[to.r][to.c] = 'q';
    } else {
      this.chessBoard[to.r][to.c] = movingPiece;
    }
    this.chessBoard[from.r][from.c] = null;

    this.selectedSquare = null;
    this.legalMoves = [];

    // Check for King capture / Victory
    if (destPiece === 'k' || destPiece === 'K') {
      this.chessGameOver = true;
      const winner = destPiece === 'k' ? "White" : "Black";
      const status = document.getElementById("chess-status");
      if (status) status.innerHTML = `🏆 Checkmate! ${winner} Wins!`;
      this.playTone(880, 0.25, "triangle");
      if (window.PORTFOLIO_DB && winner === "White") {
        const pName = localStorage.getItem("portfolio_friend_name") || "Grandmaster";
        const pPass = window.PORTFOLIO_DB.getActivePass()?.key || "";
        window.PORTFOLIO_DB.saveScore("chess", pName, 100, this.chessMode === "ai" ? "vs-DeepCode" : "PvP", pPass);
      }
      this.updateCapturedTrays();
      this.renderChessBoard();
      return;
    }

    this.chessTurn = this.chessTurn === "w" ? "b" : "w";
    const status = document.getElementById("chess-status");
    if (status) {
      status.textContent = this.chessTurn === "w" ? "White's Turn" : (this.chessMode === "ai" ? "DeepCode AI thinking..." : "Black's Turn");
    }

    this.updateCapturedTrays();
    this.renderChessBoard();

    // Trigger AI move if in AI mode
    if (!this.chessGameOver && this.chessMode === "ai" && this.chessTurn === "b") {
      setTimeout(() => this.makeChessAiMove(), 300);
    }
  },

  makeChessAiMove() {
    if (this.chessGameOver) return;
    const allBlackMoves = [];

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.chessBoard[r][c];
        if (piece && piece === piece.toLowerCase()) {
          const moves = this.calculateLegalMoves(r, c);
          moves.forEach(m => allBlackMoves.push({ from: { r, c }, to: m }));
        }
      }
    }

    if (allBlackMoves.length === 0) {
      this.chessGameOver = true;
      const status = document.getElementById("chess-status");
      if (status) status.innerHTML = "🤝 Stalemate / No Legal Moves!";
      return;
    }

    // Heuristic AI: prioritize captures, central advancement
    const pieceValues = { 'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 100 };
    let bestMove = allBlackMoves[0];
    let bestScore = -Infinity;

    allBlackMoves.forEach(m => {
      let score = Math.random() * 0.5;
      const target = this.chessBoard[m.to.r][m.to.c];
      if (target) {
        score += (pieceValues[target.toLowerCase()] || 1) * 10;
      }
      // Encourage advancing towards center
      score += (3.5 - Math.abs(3.5 - m.to.c)) * 0.2;
      score += m.to.r * 0.3; // black advances downwards

      if (score > bestScore) {
        bestScore = score;
        bestMove = m;
      }
    });

    this.executeChessMove(bestMove.from, bestMove.to);
  },

  calculateLegalMoves(r, c) {
    const piece = this.chessBoard[r][c];
    if (!piece) return [];
    const isWhite = piece === piece.toUpperCase();
    const moves = [];

    const isInside = (row, col) => row >= 0 && row < 8 && col >= 0 && col < 8;
    const isEmpty = (row, col) => isInside(row, col) && this.chessBoard[row][col] === null;
    const isEnemy = (row, col) => {
      if (!isInside(row, col)) return false;
      const p = this.chessBoard[row][col];
      return p !== null && (isWhite ? p === p.toLowerCase() : p === p.toUpperCase());
    };

    const type = piece.toLowerCase();

    // 1. Pawn
    if (type === 'p') {
      const dir = isWhite ? -1 : 1;
      const startRow = isWhite ? 6 : 1;

      // 1 square forward
      if (isEmpty(r + dir, c)) {
        moves.push({ r: r + dir, c });
        // 2 squares forward from starting rank
        if (r === startRow && isEmpty(r + 2 * dir, c)) {
          moves.push({ r: r + 2 * dir, c });
        }
      }
      // Diagonal captures
      if (isEnemy(r + dir, c - 1)) moves.push({ r: r + dir, c: c - 1 });
      if (isEnemy(r + dir, c + 1)) moves.push({ r: r + dir, c: c + 1 });
    }

    // 2. Knight
    else if (type === 'n') {
      const offsets = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ];
      offsets.forEach(([dr, dc]) => {
        const nr = r + dr;
        const nc = c + dc;
        if (isEmpty(nr, nc) || isEnemy(nr, nc)) {
          moves.push({ r: nr, c: nc });
        }
      });
    }

    // 3. Bishop & Rook & Queen line scanning
    const scanRays = (rayDirs) => {
      rayDirs.forEach(([dr, dc]) => {
        let nr = r + dr;
        let nc = c + dc;
        while (isInside(nr, nc)) {
          if (isEmpty(nr, nc)) {
            moves.push({ r: nr, c: nc });
          } else if (isEnemy(nr, nc)) {
            moves.push({ r: nr, c: nc });
            break;
          } else {
            break; // friendly piece blocks ray
          }
          nr += dr;
          nc += dc;
        }
      });
    };

    if (type === 'b') {
      scanRays([[-1, -1], [-1, 1], [1, -1], [1, 1]]);
    } else if (type === 'r') {
      scanRays([[-1, 0], [1, 0], [0, -1], [0, 1]]);
    } else if (type === 'q') {
      scanRays([
        [-1, -1], [-1, 1], [1, -1], [1, 1],
        [-1, 0], [1, 0], [0, -1], [0, 1]
      ]);
    }

    // 4. King
    else if (type === 'k') {
      const kingDirs = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
      ];
      kingDirs.forEach(([dr, dc]) => {
        const nr = r + dr;
        const nc = c + dc;
        if (isEmpty(nr, nc) || isEnemy(nr, nc)) {
          moves.push({ r: nr, c: nc });
        }
      });
    }

    return moves;
  },

  updateCapturedTrays() {
    const trayBlack = document.getElementById("tray-black");
    const trayWhite = document.getElementById("tray-white");
    if (trayBlack) trayBlack.textContent = this.capturedPieces.b.map(p => this.pieceSymbols[p]).join(" ");
    if (trayWhite) trayWhite.textContent = this.capturedPieces.w.map(p => this.pieceSymbols[p]).join(" ");
  }
};
