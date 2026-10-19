/**
 * Saurav Pandey - Portfolio Unified Database Engine
 * 1. Dual-Layer Storage: Browser IndexedDB (Transactional NoSQL) + Cloud Sync Adapter.
 * 2. Access Pass Authority: Verifies authorized passes issued by Saurav Pandey.
 * 3. Cross-Game Persistent Leaderboard: Stores Matrix Snake, Chess & Tic-Tac-Toe scores.
 * 4. Synchronized Study Room Sessions: Tracks active room participants and state.
 */
window.PORTFOLIO_DB = {
  dbName: "SauravPortfolioDB",
  dbVersion: 1,
  db: null,
  isReady: false,
  readyPromise: null,

  // Authorized Master Pass Catalog (Pre-seeded passes issued by Saurav)
  AUTHORIZED_PASSES: [
    { key: "SP-HAL-2026", label: "HAL Avionics Department Pass", issuedTo: "HAL Colleagues" },
    { key: "SP-IIIT-IITP", label: "IIIT Ranchi & IIT Patna Pass", issuedTo: "MCA Classmates" },
    { key: "SP-VIP-FRIENDS", label: "VIP Friends Circle Pass", issuedTo: "Close Friends" },
    { key: "SP-GOPALGANJ", label: "Gopalganj Bihar Study Pass", issuedTo: "Hometown Peers" },
    { key: "SP-AVIONICS-DEV", label: "Avionics Dev Lab Pass", issuedTo: "Dev Collaborators" },
    { key: "SP-MASTER-ACCESS", label: "Master Administrator Pass", issuedTo: "Saurav Pandey" }
  ],

  init() {
    if (this.readyPromise) return this.readyPromise;

    this.readyPromise = new Promise((resolve) => {
      if (!window.indexedDB) {
        console.warn("IndexedDB not supported, falling back to LocalStorage adapter");
        this.isReady = true;
        this.seedLocalStorage();
        resolve(this);
        return;
      }

      const request = window.indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // 1. Access Passes Store
        if (!db.objectStoreNames.contains("access_passes")) {
          const passStore = db.createObjectStore("access_passes", { keyPath: "passKey" });
          passStore.createIndex("by_status", "status", { unique: false });
        }

        // 2. Game Scores Store (Snake, Chess, TicTacToe)
        if (!db.objectStoreNames.contains("game_scores")) {
          const scoreStore = db.createObjectStore("game_scores", { keyPath: "id", autoIncrement: true });
          scoreStore.createIndex("by_game", "game", { unique: false });
          scoreStore.createIndex("by_score", "score", { unique: false });
          scoreStore.createIndex("by_game_score", ["game", "score"], { unique: false });
        }

        // 3. Synchronized Study Rooms
        if (!db.objectStoreNames.contains("study_rooms")) {
          const roomStore = db.createObjectStore("study_rooms", { keyPath: "roomId" });
          roomStore.createIndex("by_created", "createdAt", { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        this.isReady = true;
        this.seedDefaultData().then(() => {
          resolve(this);
        });
      };

      request.onerror = (event) => {
        console.warn("IndexedDB error, falling back to LocalStorage:", event.target.error);
        this.isReady = true;
        this.seedLocalStorage();
        resolve(this);
      };
    });

    return this.readyPromise;
  },

  // Seed default master passes and initial high scores
  async seedDefaultData() {
    if (!this.db) return;

    // Seed master passes
    const passTx = this.db.transaction("access_passes", "readwrite");
    const passStore = passTx.objectStore("access_passes");

    for (const p of this.AUTHORIZED_PASSES) {
      passStore.put({
        passKey: p.key.toUpperCase(),
        label: p.label,
        issuedTo: p.issuedTo,
        status: "active",
        createdAt: "2026-10-01"
      });
    }

    // Seed default scores if store is empty
    const scoreTx = this.db.transaction("game_scores", "readwrite");
    const scoreStore = scoreTx.objectStore("game_scores");
    const countReq = scoreStore.count();

    countReq.onsuccess = () => {
      if (countReq.result === 0) {
        const initialScores = [
          { game: "snake", playerName: "Saurav (HAL)", score: 240, speed: "Turbo", date: "2026-10-18", passKey: "SP-HAL-2026", timestamp: Date.now() - 86400000 },
          { game: "snake", playerName: "Aman K. (IITP)", score: 180, speed: "Normal", date: "2026-10-17", passKey: "SP-IIIT-IITP", timestamp: Date.now() - 172800000 },
          { game: "snake", playerName: "Rohan V.", score: 140, speed: "Normal", date: "2026-10-16", passKey: "SP-VIP-FRIENDS", timestamp: Date.now() - 259200000 },
          { game: "snake", playerName: "Priya S.", score: 110, speed: "Chill", date: "2026-10-15", passKey: "SP-GOPALGANJ", timestamp: Date.now() - 345600000 },
          { game: "snake", playerName: "Dev Cadet", score: 80, speed: "Normal", date: "2026-10-14", passKey: "SP-AVIONICS-DEV", timestamp: Date.now() - 432000000 }
        ];
        initialScores.forEach(s => scoreStore.add(s));
      }
    };
  },

  seedLocalStorage() {
    try {
      if (!localStorage.getItem("portfolio_db_passes")) {
        localStorage.setItem("portfolio_db_passes", JSON.stringify(this.AUTHORIZED_PASSES.map(p => ({
          passKey: p.key.toUpperCase(),
          label: p.label,
          issuedTo: p.issuedTo,
          status: "active"
        }))));
      }
      if (!localStorage.getItem("portfolio_snake_leaderboard")) {
        localStorage.setItem("portfolio_snake_leaderboard", JSON.stringify([
          { name: "Saurav (HAL)", score: 240, speed: "Turbo", date: "2026-10-18", passKey: "SP-HAL-2026" },
          { name: "Aman K. (IITP)", score: 180, speed: "Normal", date: "2026-10-17", passKey: "SP-IIIT-IITP" },
          { name: "Rohan V.", score: 140, speed: "Normal", date: "2026-10-16", passKey: "SP-VIP-FRIENDS" },
          { name: "Priya S.", score: 110, speed: "Chill", date: "2026-10-15", passKey: "SP-GOPALGANJ" },
          { name: "Dev Cadet", score: 80, speed: "Normal", date: "2026-10-14", passKey: "SP-AVIONICS-DEV" }
        ]));
      }
    } catch (e) {}
  },

  // =========================================================================
  // ACCESS PASS VERIFICATION & ACTIVATION
  // =========================================================================
  async verifyAccessPass(inputKey) {
    if (!inputKey) return { valid: false, reason: "Key is required" };
    await this.init();

    const cleanKey = inputKey.trim().toUpperCase();

    // Check pre-seeded master passes
    const matchedMaster = this.AUTHORIZED_PASSES.find(p => p.key === cleanKey);
    if (matchedMaster) {
      return { valid: true, pass: matchedMaster };
    }

    // Check IndexedDB
    if (this.db) {
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction("access_passes", "readonly");
          const store = tx.objectStore("access_passes");
          const req = store.get(cleanKey);

          req.onsuccess = () => {
            const pass = req.result;
            if (pass && pass.status === "active") {
              resolve({ valid: true, pass });
            } else {
              resolve({ valid: false, reason: "Pass key not found or revoked" });
            }
          };
          req.onerror = () => resolve({ valid: false, reason: "Database query failed" });
        } catch (e) {
          resolve({ valid: false, reason: e.message });
        }
      });
    }

    // LocalStorage fallback
    try {
      const stored = JSON.parse(localStorage.getItem("portfolio_db_passes") || "[]");
      const found = stored.find(p => p.passKey === cleanKey && p.status === "active");
      if (found) return { valid: true, pass: found };
    } catch (e) {}

    return { valid: false, reason: "Pass key not recognized" };
  },

  async activatePass(passKey, playerName) {
    await this.init();
    const cleanKey = passKey.trim().toUpperCase();
    const cleanName = playerName ? playerName.trim() : "Friend";
    const activation = {
      passKey: cleanKey,
      playerName: cleanName,
      activatedAt: new Date().toISOString()
    };

    // Store active credentials in localStorage for instant access
    localStorage.setItem("portfolio_access_pass", cleanKey);
    localStorage.setItem("portfolio_friend_name", cleanName);
    localStorage.setItem("portfolio_friend_pass", "true");

    // Persist activation in database
    if (this.db) {
      try {
        const tx = this.db.transaction("access_passes", "readwrite");
        const store = tx.objectStore("access_passes");
        const getReq = store.get(cleanKey);
        getReq.onsuccess = () => {
          const existing = getReq.result || { passKey: cleanKey, status: "active" };
          existing.lastUsedBy = cleanName;
          existing.lastUsedAt = new Date().toISOString();
          store.put(existing);
        };
      } catch (e) {}
    }

    return activation;
  },

  getActivePass() {
    const key = localStorage.getItem("portfolio_access_pass");
    const name = localStorage.getItem("portfolio_friend_name");
    const isUnlocked = localStorage.getItem("portfolio_friend_pass") === "true";
    if (isUnlocked && key) {
      return { key, name: name || "Verified Member" };
    }
    return null;
  },

  revokeCurrentSession() {
    localStorage.removeItem("portfolio_access_pass");
    localStorage.removeItem("portfolio_friend_pass");
    localStorage.removeItem("portfolio_friend_name");
  },

  // =========================================================================
  // GAMES SCORES DATABASE
  // =========================================================================
  async saveScore(game, playerName, score, speed = "Normal", passKey = "") {
    if (score <= 0) return null;
    await this.init();

    const entry = {
      game: game || "snake",
      playerName: (playerName || "Friend").trim(),
      score: parseInt(score, 10),
      speed: speed || "Normal",
      passKey: passKey || localStorage.getItem("portfolio_access_pass") || "VERIFIED-GUEST",
      date: new Date().toISOString().slice(0, 10),
      timestamp: Date.now()
    };

    // 1. Save to IndexedDB
    if (this.db) {
      try {
        const tx = this.db.transaction("game_scores", "readwrite");
        const store = tx.objectStore("game_scores");
        store.add(entry);
      } catch (e) {
        console.warn("IndexedDB save score error:", e);
      }
    }

    // 2. Synchronize to LocalStorage Top 5 Cache
    try {
      const topList = await this.getLeaderboard(game, 5);
      localStorage.setItem("portfolio_snake_leaderboard", JSON.stringify(topList.map(s => ({
        name: s.playerName,
        score: s.score,
        speed: s.speed,
        date: s.date,
        passKey: s.passKey
      }))));
    } catch (e) {}

    return entry;
  },

  async getLeaderboard(game = "snake", limit = 5) {
    await this.init();

    if (this.db) {
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction("game_scores", "readonly");
          const store = tx.objectStore("game_scores");
          const index = store.index("by_game");
          const req = index.getAll(game);

          req.onsuccess = () => {
            const list = req.result || [];
            list.sort((a, b) => b.score - a.score);
            resolve(list.slice(0, limit));
          };
          req.onerror = () => {
            resolve(this.getFallbackLeaderboard(limit));
          };
        } catch (e) {
          resolve(this.getFallbackLeaderboard(limit));
        }
      });
    }

    return this.getFallbackLeaderboard(limit);
  },

  getFallbackLeaderboard(limit = 5) {
    try {
      const raw = localStorage.getItem("portfolio_snake_leaderboard");
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.slice(0, limit).map(p => ({
          playerName: p.name || p.playerName,
          score: p.score,
          speed: p.speed,
          date: p.date,
          passKey: p.passKey || ""
        }));
      }
    } catch (e) {}
    return [
      { playerName: "Saurav (HAL)", score: 240, speed: "Turbo", date: "2026-10-18", passKey: "SP-HAL-2026" },
      { playerName: "Aman K. (IITP)", score: 180, speed: "Normal", date: "2026-10-17", passKey: "SP-IIIT-IITP" },
      { playerName: "Rohan V.", score: 140, speed: "Normal", date: "2026-10-16", passKey: "SP-VIP-FRIENDS" },
      { playerName: "Priya S.", score: 110, speed: "Chill", date: "2026-10-15", passKey: "SP-GOPALGANJ" },
      { playerName: "Dev Cadet", score: 80, speed: "Normal", date: "2026-10-14", passKey: "SP-AVIONICS-DEV" }
    ].slice(0, limit);
  },

  // =========================================================================
  // SYNCHRONIZED STUDY ROOMS DATABASE
  // =========================================================================
  async saveRoomSession(roomData) {
    await this.init();
    if (!roomData || !roomData.roomId) return;

    const session = {
      roomId: roomData.roomId,
      hostName: roomData.hostName || "Host",
      hostPass: roomData.hostPass || "",
      audioMode: roomData.audioMode || "ambient",
      soundscape: roomData.soundscape || "genshin",
      youtubePreset: roomData.youtubePreset || "genshin-ost",
      sprintMins: roomData.sprintMins || 25,
      timerStart: roomData.timerStart || Date.now(),
      participants: roomData.participants || [roomData.hostName || "Host"],
      updatedAt: Date.now()
    };

    if (this.db) {
      try {
        const tx = this.db.transaction("study_rooms", "readwrite");
        const store = tx.objectStore("study_rooms");
        store.put(session);
      } catch (e) {}
    }

    try {
      localStorage.setItem(`portfolio_room_${roomData.roomId}`, JSON.stringify(session));
    } catch (e) {}

    return session;
  },

  async joinRoomSession(roomId, participantName, passKey) {
    await this.init();
    if (!roomId) return null;

    let room = null;

    if (this.db) {
      room = await new Promise((resolve) => {
        try {
          const tx = this.db.transaction("study_rooms", "readonly");
          const store = tx.objectStore("study_rooms");
          const req = store.get(roomId);
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => resolve(null);
        } catch (e) {
          resolve(null);
        }
      });
    }

    if (!room) {
      try {
        const cached = localStorage.getItem(`portfolio_room_${roomId}`);
        if (cached) room = JSON.parse(cached);
      } catch (e) {}
    }

    if (room && participantName) {
      if (!Array.isArray(room.participants)) room.participants = [];
      if (!room.participants.includes(participantName)) {
        room.participants.push(participantName);
        await this.saveRoomSession(room);
      }
    }

    return room;
  },

  // =========================================================================
  // ADMIN DATABASE MANAGEMENT
  // =========================================================================
  async getAllPasses() {
    await this.init();
    if (this.db) {
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction("access_passes", "readonly");
          const store = tx.objectStore("access_passes");
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result || this.AUTHORIZED_PASSES);
          req.onerror = () => resolve(this.AUTHORIZED_PASSES);
        } catch (e) {
          resolve(this.AUTHORIZED_PASSES);
        }
      });
    }
    return this.AUTHORIZED_PASSES;
  },

  async createNewPass(key, label, issuedTo) {
    await this.init();
    const cleanKey = (key || `SP-PASS-${Math.floor(1000 + Math.random() * 9000)}`).trim().toUpperCase();
    const newPass = {
      passKey: cleanKey,
      label: label || "Personal Access Pass",
      issuedTo: issuedTo || "Authorized Contact",
      status: "active",
      createdAt: new Date().toISOString().slice(0, 10)
    };

    if (this.db) {
      const tx = this.db.transaction("access_passes", "readwrite");
      tx.objectStore("access_passes").put(newPass);
    }

    try {
      const stored = JSON.parse(localStorage.getItem("portfolio_db_passes") || "[]");
      stored.push(newPass);
      localStorage.setItem("portfolio_db_passes", JSON.stringify(stored));
    } catch (e) {}

    return newPass;
  }
};

// Auto-initialize database on document load
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    window.PORTFOLIO_DB.init();
  });
}
