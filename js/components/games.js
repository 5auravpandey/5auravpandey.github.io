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
  snakeScore: 0,
  snakeHighScore: 0,
  snakeInterval: null,
  snakeGameOver: false,
  snakeTokens: ["0xFF", "HAL", "WASM", "JAVA", "C++", "0x00", "NODE", "SQL", "LINUX"],

  renderSnakeHtml() {
    this.snakeHighScore = parseInt(localStorage.getItem("portfolio_snake_hs") || "0", 10);
    return `
      <div class="snake-arena">
        <div class="game-topbar">
          <div class="score-display">
            <span>Score: <strong id="snake-score-val">0</strong></span>
            <span style="color: var(--muted); margin-left: 12px;">High Score: <strong id="snake-hs-val">${this.snakeHighScore}</strong></span>
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

        <div class="snake-canvas-box">
          <canvas id="snake-canvas" width="400" height="400" class="snake-canvas"></canvas>
          <div id="snake-overlay" class="game-overlay" style="display: none;">
            <div class="game-overlay-box">
              <h4 id="snake-overlay-title" style="margin: 0 0 6px; font-size: 20px;">Game Over!</h4>
              <p id="snake-overlay-desc" style="margin: 0 0 14px; font-size: 13px; color: var(--muted);">Press restart to play again</p>
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
            Swipe or use D-Pad / Arrow Keys
          </span>
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

    const startBtn = document.getElementById("btn-snake-start");
    const resetBtn = document.getElementById("btn-snake-reset");
    const retryBtn = document.getElementById("btn-snake-retry");

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
      collision = this.snake.some(segment => segment.x === newX && segment.y === newY);
    } while (collision);

    const token = this.snakeTokens[Math.floor(Math.random() * this.snakeTokens.length)];
    this.snakeFood = { x: newX, y: newY, token };
  },

  startSnakeLoop(canvas, ctx) {
    if (this.snakeInterval) clearInterval(this.snakeInterval);
    const overlay = document.getElementById("snake-overlay");
    if (overlay) overlay.style.display = "none";
    const startBtn = document.getElementById("btn-snake-start");
    if (startBtn) startBtn.textContent = "Running...";

    this.snakeInterval = setInterval(() => {
      this.stepSnake(canvas, ctx);
    }, 110);
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
    this.snakeGameOver = false;
    const scoreEl = document.getElementById("snake-score-val");
    if (scoreEl) scoreEl.textContent = "0";

    this.spawnSnakeFood();
    this.drawSnake(ctx, canvas);
  },

  stepSnake(canvas, ctx) {
    if (this.snakeGameOver) return;
    this.snakeDir = this.snakeNextDir;

    const head = {
      x: this.snake[0].x + this.snakeDir.x,
      y: this.snake[0].y + this.snakeDir.y
    };

    // Wall collision
    if (head.x < 0 || head.x >= this.snakeCells || head.y < 0 || head.y >= this.snakeCells) {
      this.handleSnakeGameOver();
      return;
    }

    // Self collision
    if (this.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
      this.handleSnakeGameOver();
      return;
    }

    this.snake.unshift(head);

    // Food collision
    if (head.x === this.snakeFood.x && head.y === this.snakeFood.y) {
      this.snakeScore += 10;
      this.playTone(587.33, 0.08, "triangle"); // D5 bleep
      const scoreEl = document.getElementById("snake-score-val");
      if (scoreEl) scoreEl.textContent = this.snakeScore.toString();

      if (this.snakeScore > this.snakeHighScore) {
        this.snakeHighScore = this.snakeScore;
        localStorage.setItem("portfolio_snake_hs", this.snakeHighScore.toString());
        const hsEl = document.getElementById("snake-hs-val");
        if (hsEl) hsEl.textContent = this.snakeHighScore.toString();
      }

      this.spawnSnakeFood();
    } else {
      this.snake.pop();
    }

    this.drawSnake(ctx, canvas);
  },

  handleSnakeGameOver() {
    this.snakeGameOver = true;
    if (this.snakeInterval) {
      clearInterval(this.snakeInterval);
      this.snakeInterval = null;
    }
    this.playTone(180, 0.25, "sawtooth"); // Low tone game over
    const overlay = document.getElementById("snake-overlay");
    const desc = document.getElementById("snake-overlay-desc");
    if (desc) desc.textContent = `You scored ${this.snakeScore} points!`;
    if (overlay) overlay.style.display = "flex";
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
        if (winner === "X") this.tttScore.p1++;
        else this.tttScore.p2++;
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
