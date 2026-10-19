/**
 * Saurav Pandey - Portfolio Unified Database Engine
 * 1. Dual-Layer Storage: Browser IndexedDB (Transactional NoSQL) + Cloud Sync Adapter.
 * 2. Friend Credential Authority: Verifies authorized Friend ID + Password issued by Saurav Pandey.
 * 3. Cross-Game Persistent Leaderboard with Telegram ID & Weekly Sustainability Purge.
 * 4. Synchronized Study Room Sessions: Tracks active room participants and state.
 */
window.PORTFOLIO_DB = {
  dbName: "SauravPortfolioDB",
  dbVersion: 2,
  db: null,
  isReady: false,
  readyPromise: null,

  // Authorized Friends Catalog (ID + Password credentials issued by Saurav)
  AUTHORIZED_FRIENDS: [
    { username: "saurav", password: "HAL2026", name: "Saurav Pandey", role: "Host / Admin" },
    { username: "hal-friend", password: "HAL2026", name: "HAL Avionics Colleague", role: "HAL Colleague" },
    { username: "hal-colleague", password: "AVIONICS2026", name: "HAL Avionics Colleague", role: "HAL Colleague" },
    { username: "iitp-mate", password: "IITP2026", name: "IIT Patna Classmate", role: "MCA Classmate" },
    { username: "iiit-mate", password: "IIIT2026", name: "IIIT Ranchi Classmate", role: "MCA Classmate" },
    { username: "aman", password: "IITP2026", name: "Aman K. (IITP)", role: "Study Partner" },
    { username: "rohan", password: "FRIENDS2026", name: "Rohan V.", role: "VIP Friend" },
    { username: "priya", password: "GOPALGANJ2026", name: "Priya S.", role: "Hometown Peer" },
    { username: "vip-friend", password: "VIP2026", name: "VIP Friend", role: "Close Friends" },
    { username: "study-group", password: "STUDY2026", name: "Study Group Member", role: "Study Circle" },
    { username: "bihar-peer", password: "BIHAR2026", name: "Gopalganj Peer", role: "Bihar Circle" },
    { username: "dev-peer", password: "DEV2026", name: "Dev Collaborator", role: "Collaborator" }
  ],

  // Authorized Master Pass Catalog (Pre-seeded passes issued by Saurav)
  AUTHORIZED_PASSES: [
    { key: "SP-HAL-2026", label: "HAL Avionics Department Pass", issuedTo: "HAL Colleagues" },
    { key: "HAL2026", label: "HAL Avionics Department Pass", issuedTo: "HAL Colleagues" },
    { key: "HAL", label: "HAL Avionics Department Pass", issuedTo: "HAL Colleagues" },
    { key: "SP-IIIT-IITP", label: "IIIT Ranchi & IIT Patna Pass", issuedTo: "MCA Classmates" },
    { key: "IIIT", label: "IIIT Ranchi Pass", issuedTo: "MCA Classmates" },
    { key: "IITP", label: "IIT Patna Pass", issuedTo: "MCA Classmates" },
    { key: "SP-VIP-FRIENDS", label: "VIP Friends Circle Pass", issuedTo: "Close Friends" },
    { key: "FRIENDS", label: "VIP Friends Circle Pass", issuedTo: "Close Friends" },
    { key: "FRIEND", label: "VIP Friends Circle Pass", issuedTo: "Close Friends" },
    { key: "VIP", label: "VIP Friends Circle Pass", issuedTo: "Close Friends" },
    { key: "SP-GOPALGANJ", label: "Gopalganj Bihar Study Pass", issuedTo: "Hometown Peers" },
    { key: "GOPALGANJ", label: "Gopalganj Bihar Study Pass", issuedTo: "Hometown Peers" },
    { key: "SP-AVIONICS-DEV", label: "Avionics Dev Lab Pass", issuedTo: "Dev Collaborators" },
    { key: "DEV", label: "Avionics Dev Lab Pass", issuedTo: "Dev Collaborators" },
    { key: "STUDY", label: "Synchronized Study Group Pass", issuedTo: "Study Group" },
    { key: "SAURAV", label: "Master Administrator Pass", issuedTo: "Saurav Pandey" },
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

      try {
        const request = window.indexedDB.open(this.dbName, this.dbVersion);

        request.onupgradeneeded = (event) => {
          try {
            const db = event.target.result;

            // 1. Friend Accounts Store (ID + Password)
            if (!db.objectStoreNames.contains("friend_accounts")) {
              const accountStore = db.createObjectStore("friend_accounts", { keyPath: "username" });
              accountStore.createIndex("by_status", "status", { unique: false });
            }

            // 2. Access Passes Store
            if (!db.objectStoreNames.contains("access_passes")) {
              const passStore = db.createObjectStore("access_passes", { keyPath: "passKey" });
              passStore.createIndex("by_status", "status", { unique: false });
            }

            // 3. Game Scores Store (Snake, Chess, TicTacToe with Telegram ID & Expiry)
            if (!db.objectStoreNames.contains("game_scores")) {
              const scoreStore = db.createObjectStore("game_scores", { keyPath: "id", autoIncrement: true });
              scoreStore.createIndex("by_game", "game", { unique: false });
              scoreStore.createIndex("by_score", "score", { unique: false });
              scoreStore.createIndex("by_telegram", "telegramId", { unique: false });
              scoreStore.createIndex("by_expiry", "expiresAt", { unique: false });
            }

            // 4. Synchronized Study Rooms
            if (!db.objectStoreNames.contains("study_rooms")) {
              const roomStore = db.createObjectStore("study_rooms", { keyPath: "roomId" });
              roomStore.createIndex("by_created", "createdAt", { unique: false });
            }
          } catch (upgradeErr) {
            console.warn("IndexedDB onupgradeneeded error:", upgradeErr);
          }
        };

        request.onsuccess = (event) => {
          this.db = event.target.result;
          this.isReady = true;
          this.seedDefaultData().catch(() => {}).then(() => {
            resolve(this);
          });
        };

        request.onerror = (event) => {
          console.warn("IndexedDB request error, falling back to LocalStorage:", event.target ? event.target.error : event);
          this.isReady = true;
          this.seedLocalStorage();
          resolve(this);
        };

        request.onblocked = () => {
          console.warn("IndexedDB blocked, falling back to LocalStorage");
          this.isReady = true;
          this.seedLocalStorage();
          resolve(this);
        };
      } catch (err) {
        console.warn("IndexedDB open exception, falling back to LocalStorage:", err);
        this.isReady = true;
        this.seedLocalStorage();
        resolve(this);
      }
    });

    return this.readyPromise;
  },

  // Seed default master passes, friend credentials, and initial scores
  async seedDefaultData() {
    if (!this.db) return;

    try {
      // Seed friend accounts
      if (this.db.objectStoreNames.contains("friend_accounts")) {
        const accTx = this.db.transaction("friend_accounts", "readwrite");
        const accStore = accTx.objectStore("friend_accounts");
        for (const f of this.AUTHORIZED_FRIENDS) {
          accStore.put({
            username: f.username.toLowerCase(),
            password: f.password.toUpperCase(),
            name: f.name,
            role: f.role,
            status: "active",
            createdAt: "2026-10-01"
          });
        }
      }

      // Seed master passes
      if (this.db.objectStoreNames.contains("access_passes")) {
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
      }

      // Seed default scores if store is empty
      if (this.db.objectStoreNames.contains("game_scores")) {
        const scoreTx = this.db.transaction("game_scores", "readwrite");
        const scoreStore = scoreTx.objectStore("game_scores");
        const countReq = scoreStore.count();

        countReq.onsuccess = () => {
          if (countReq.result === 0) {
            const now = Date.now();
            const initialScores = [
              { game: "snake", playerName: "Saurav (HAL)", telegramId: "@5auravpandey", score: 240, speed: "Turbo", date: "2026-10-18", verifiedAt: now, expiresAt: now + 7 * 86400000, timestamp: now - 86400000 },
              { game: "snake", playerName: "Aman K. (IITP)", telegramId: "@aman_iitp", score: 180, speed: "Normal", date: "2026-10-17", verifiedAt: now - 86400000, expiresAt: now + 6 * 86400000, timestamp: now - 172800000 },
              { game: "snake", playerName: "Rohan V.", telegramId: "@rohan_v", score: 140, speed: "Normal", date: "2026-10-16", verifiedAt: now - 2 * 86400000, expiresAt: now + 5 * 86400000, timestamp: now - 259200000 },
              { game: "snake", playerName: "Priya S.", telegramId: "@priya_gopalganj", score: 110, speed: "Chill", date: "2026-10-15", verifiedAt: now - 3 * 86400000, expiresAt: now + 4 * 86400000, timestamp: now - 345600000 },
              { game: "snake", playerName: "Dev Cadet", telegramId: "@dev_cadet", score: 80, speed: "Normal", date: "2026-10-14", verifiedAt: now - 4 * 86400000, expiresAt: now + 3 * 86400000, timestamp: now - 432000000 }
            ];
            initialScores.forEach(s => {
              try { scoreStore.add(s); } catch (e) {}
            });
          }
        };
      }
    } catch (e) {
      console.warn("seedDefaultData caught error:", e);
    }
  },

  seedLocalStorage() {
    try {
      const now = Date.now();
      if (!localStorage.getItem("portfolio_db_friend_accounts")) {
        localStorage.setItem("portfolio_db_friend_accounts", JSON.stringify(this.AUTHORIZED_FRIENDS.map(f => ({
          username: f.username.toLowerCase(),
          password: f.password.toUpperCase(),
          name: f.name,
          role: f.role,
          status: "active"
        }))));
      }
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
          { name: "Saurav (HAL)", telegramId: "@5auravpandey", score: 240, speed: "Turbo", date: "2026-10-18", verifiedAt: now, expiresAt: now + 7 * 86400000 },
          { name: "Aman K. (IITP)", telegramId: "@aman_iitp", score: 180, speed: "Normal", date: "2026-10-17", verifiedAt: now - 86400000, expiresAt: now + 6 * 86400000 },
          { name: "Rohan V.", telegramId: "@rohan_v", score: 140, speed: "Normal", date: "2026-10-16", verifiedAt: now - 2 * 86400000, expiresAt: now + 5 * 86400000 },
          { name: "Priya S.", telegramId: "@priya_gopalganj", score: 110, speed: "Chill", date: "2026-10-15", verifiedAt: now - 3 * 86400000, expiresAt: now + 4 * 86400000 },
          { name: "Dev Cadet", telegramId: "@dev_cadet", score: 80, speed: "Normal", date: "2026-10-14", verifiedAt: now - 4 * 86400000, expiresAt: now + 3 * 86400000 }
        ]));
      }
    } catch (e) {}
  },

  // =========================================================================
  // ACCESS PASS VERIFICATION & ACTIVATION
  // =========================================================================
  async verifyAccessPass(inputKey) {
    if (!inputKey || typeof inputKey !== "string") {
      return { valid: false, reason: "Pass key must be a non-empty string" };
    }
    await this.init();

    const cleanKey = inputKey.trim().toUpperCase().replace(/\s+/g, "");
    if (!cleanKey) {
      return { valid: false, reason: "Pass key cannot be empty" };
    }

    // Check pre-seeded master passes (exact or hyphen-flexible)
    const matchedMaster = this.AUTHORIZED_PASSES.find(p => 
      p.key === cleanKey || 
      p.key.replace(/-/g, "") === cleanKey.replace(/-/g, "")
    );
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
          // If transaction fails, check LocalStorage fallback
          try {
            const stored = JSON.parse(localStorage.getItem("portfolio_db_passes") || "[]");
            const found = stored.find(p => p.passKey === cleanKey && p.status === "active");
            if (found) return resolve({ valid: true, pass: found });
          } catch (storageErr) {}
          resolve({ valid: false, reason: e.message || "Database access error" });
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
    const cleanKey = (typeof passKey === "string" ? passKey.trim().toUpperCase() : "");
    const cleanName = (typeof playerName === "string" && playerName.trim()) ? playerName.trim().slice(0, 24) : "Friend";
    const activation = {
      passKey: cleanKey,
      playerName: cleanName,
      activatedAt: new Date().toISOString()
    };

    // Store active credentials in localStorage for instant access
    try {
      localStorage.setItem("portfolio_access_pass", cleanKey);
      localStorage.setItem("portfolio_friend_name", cleanName);
      localStorage.setItem("portfolio_friend_pass", "true");
    } catch (e) {}

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
          try { store.put(existing); } catch (err) {}
        };
      } catch (e) {}
    }

    return activation;
  },

  // =========================================================================
  // FRIEND CREDENTIALS (ID + PASSWORD) & SESSION MANAGEMENT
  // =========================================================================
  async verifyFriendCredentials(username, password) {
    if (!username || !password) {
      return { valid: false, reason: "Friend ID and Password are both required." };
    }
    await this.init();

    const cleanUser = String(username).trim().toLowerCase();
    const cleanPass = String(password).trim().toUpperCase();

    // 1. Check pre-seeded AUTHORIZED_FRIENDS catalog
    const matched = this.AUTHORIZED_FRIENDS.find(f => 
      f.username.toLowerCase() === cleanUser && 
      (f.password.toUpperCase() === cleanPass || f.password.toUpperCase().replace(/-/g, "") === cleanPass.replace(/-/g, ""))
    );
    if (matched) {
      return { valid: true, friend: matched };
    }

    // 2. Check IndexedDB friend_accounts
    if (this.db && this.db.objectStoreNames.contains("friend_accounts")) {
      const dbMatch = await new Promise((resolve) => {
        try {
          const tx = this.db.transaction("friend_accounts", "readonly");
          const store = tx.objectStore("friend_accounts");
          const req = store.get(cleanUser);
          req.onsuccess = () => {
            const acc = req.result;
            if (acc && acc.status === "active" && acc.password.toUpperCase() === cleanPass) {
              resolve(acc);
            } else {
              resolve(null);
            }
          };
          req.onerror = () => resolve(null);
        } catch (e) {
          resolve(null);
        }
      });
      if (dbMatch) return { valid: true, friend: dbMatch };
    }

    // 3. Check LocalStorage fallback
    try {
      const stored = JSON.parse(localStorage.getItem("portfolio_db_friend_accounts") || "[]");
      const found = stored.find(f => f.username.toLowerCase() === cleanUser && f.password.toUpperCase() === cleanPass && f.status === "active");
      if (found) return { valid: true, friend: found };
    } catch (e) {}

    return { valid: false, reason: "Invalid Friend ID or Password. Please request authorized credentials from Saurav." };
  },

  async activateFriendSession(username, password, displayName) {
    const check = await this.verifyFriendCredentials(username, password);
    if (!check.valid) return check;

    const friend = check.friend;
    const finalName = (displayName && displayName.trim()) 
      ? displayName.trim().slice(0, 24) 
      : (friend.name || friend.username);

    try {
      localStorage.setItem("portfolio_friend_authenticated", "true");
      localStorage.setItem("portfolio_friend_username", friend.username);
      localStorage.setItem("portfolio_friend_name", finalName);
      localStorage.setItem("portfolio_friend_role", friend.role || "Friend");
      localStorage.setItem("portfolio_friend_pass", "true"); // legacy compatibility
      localStorage.setItem("portfolio_access_pass", friend.password); // legacy compatibility
    } catch (e) {}

    // Record login time in IndexedDB
    if (this.db && this.db.objectStoreNames.contains("friend_accounts")) {
      try {
        const tx = this.db.transaction("friend_accounts", "readwrite");
        const store = tx.objectStore("friend_accounts");
        const getReq = store.get(friend.username);
        getReq.onsuccess = () => {
          const record = getReq.result || { username: friend.username };
          record.lastLoginAt = new Date().toISOString();
          record.lastDisplayName = finalName;
          try { store.put(record); } catch (err) {}
        };
      } catch (e) {}
    }

    return { valid: true, friend, name: finalName };
  },

  getActiveFriendSession() {
    try {
      const isAuth = localStorage.getItem("portfolio_friend_authenticated") === "true";
      const username = localStorage.getItem("portfolio_friend_username");
      const name = localStorage.getItem("portfolio_friend_name");
      const role = localStorage.getItem("portfolio_friend_role");
      if (isAuth && username) {
        return {
          username,
          name: name || username,
          role: role || "Friend",
          isAuthenticated: true
        };
      }
    } catch (e) {}
    return null;
  },

  revokeFriendSession() {
    try {
      localStorage.removeItem("portfolio_friend_authenticated");
      localStorage.removeItem("portfolio_friend_username");
      localStorage.removeItem("portfolio_friend_name");
      localStorage.removeItem("portfolio_friend_role");
      localStorage.removeItem("portfolio_friend_pass");
      localStorage.removeItem("portfolio_access_pass");
    } catch (e) {}
  },

  getActivePass() {
    const friendSession = this.getActiveFriendSession();
    if (friendSession) {
      return {
        key: friendSession.username,
        name: friendSession.name,
        role: friendSession.role
      };
    }
    try {
      const key = localStorage.getItem("portfolio_access_pass");
      const name = localStorage.getItem("portfolio_friend_name");
      const isUnlocked = localStorage.getItem("portfolio_friend_pass") === "true";
      if (isUnlocked && key) {
        return { key, name: name || "Verified Member" };
      }
    } catch (e) {}
    return null;
  },

  revokeCurrentSession() {
    this.revokeFriendSession();
  },

  // =========================================================================
  // GAMES SCORES DATABASE WITH TELEGRAM ID & 7-DAY DATA SUSTAINABILITY
  // =========================================================================
  RETENTION_MS: 7 * 24 * 60 * 60 * 1000, // Strict 7-day sustainability window

  // Clean and format Telegram handle
  formatTelegramId(input) {
    if (!input || typeof input !== "string") return "";
    let clean = input.trim();
    if (!clean) return "";
    if (!clean.startsWith("@")) clean = "@" + clean;
    return clean.slice(0, 32);
  },

  async saveScore(game, playerName, score, speed = "Normal", telegramId = "") {
    const numericScore = parseInt(score, 10);
    if (isNaN(numericScore) || numericScore <= 0) return null;
    await this.init();

    const cleanName = (typeof playerName === "string" && playerName.trim()) 
      ? playerName.trim().slice(0, 24) 
      : "Friend";

    let cleanTelegram = this.formatTelegramId(telegramId);
    if (!cleanTelegram) {
      try {
        cleanTelegram = this.formatTelegramId(localStorage.getItem("portfolio_user_telegram") || "");
      } catch (e) {}
    }

    const now = Date.now();
    const expiresAt = now + this.RETENTION_MS;

    const entry = {
      game: String(game || "snake").toLowerCase(),
      playerName: cleanName,
      telegramId: cleanTelegram || "@guest_player",
      score: numericScore,
      speed: String(speed || "Normal"),
      date: new Date().toISOString().slice(0, 10),
      timestamp: now,
      verifiedAt: now,
      expiresAt: expiresAt,
      isVerified: true
    };

    // Store preferred telegram handle for user's convenience
    if (cleanTelegram && cleanTelegram !== "@guest_player") {
      try {
        localStorage.setItem("portfolio_user_telegram", cleanTelegram);
      } catch (e) {}
    }

    // 1. Purge expired scores first to maintain sustainability
    await this.purgeExpiredScores();

    // 2. Save to IndexedDB
    if (this.db) {
      try {
        const tx = this.db.transaction("game_scores", "readwrite");
        const store = tx.objectStore("game_scores");
        store.add(entry);
      } catch (e) {
        console.warn("IndexedDB save score error:", e);
      }
    }

    // 3. Synchronize to LocalStorage Top 5 Cache
    try {
      const topList = await this.getLeaderboard(game, 5);
      localStorage.setItem("portfolio_snake_leaderboard", JSON.stringify(topList.map(s => ({
        name: s.playerName,
        telegramId: s.telegramId,
        score: s.score,
        speed: s.speed,
        date: s.date,
        verifiedAt: s.verifiedAt,
        expiresAt: s.expiresAt
      }))));
    } catch (e) {}

    return entry;
  },

  // Weekly Re-Verification to Extend 7-day Data Sustainability
  async reverifyTelegramScore(telegramId) {
    if (!telegramId) return { success: false, reason: "Telegram ID required" };
    await this.init();

    const cleanHandle = this.formatTelegramId(telegramId);
    if (!cleanHandle) return { success: false, reason: "Invalid Telegram ID" };

    const now = Date.now();
    const newExpiresAt = now + this.RETENTION_MS;
    let count = 0;

    if (this.db) {
      try {
        const tx = this.db.transaction("game_scores", "readwrite");
        const store = tx.objectStore("game_scores");
        const req = store.openCursor();

        await new Promise((resolve) => {
          req.onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor) {
              const record = cursor.value;
              if (record.telegramId && record.telegramId.toLowerCase() === cleanHandle.toLowerCase()) {
                record.verifiedAt = now;
                record.expiresAt = newExpiresAt;
                record.isVerified = true;
                cursor.update(record);
                count++;
              }
              cursor.continue();
            } else {
              resolve();
            }
          };
          req.onerror = () => resolve();
        });
      } catch (e) {}
    }

    // Update LocalStorage cache as well
    try {
      const raw = localStorage.getItem("portfolio_snake_leaderboard");
      if (raw) {
        const list = JSON.parse(raw);
        let modified = false;
        list.forEach(item => {
          if (item.telegramId && item.telegramId.toLowerCase() === cleanHandle.toLowerCase()) {
            item.verifiedAt = now;
            item.expiresAt = newExpiresAt;
            modified = true;
            count++;
          }
        });
        if (modified) {
          localStorage.setItem("portfolio_snake_leaderboard", JSON.stringify(list));
        }
      }
      localStorage.setItem("portfolio_user_telegram", cleanHandle);
    } catch (e) {}

    return { 
      success: true, 
      count: Math.max(1, count), 
      telegramId: cleanHandle, 
      newExpiresAt,
      daysRemaining: 7 
    };
  },

  // Silent Purge of Expired Scores (> 7 days without re-verification)
  async purgeExpiredScores() {
    await this.init();
    const now = Date.now();

    // 1. Purge from IndexedDB
    if (this.db) {
      try {
        const tx = this.db.transaction("game_scores", "readwrite");
        const store = tx.objectStore("game_scores");
        const req = store.openCursor();

        req.onsuccess = (e) => {
          const cursor = e.target.result;
          if (cursor) {
            const record = cursor.value;
            const isExpired = record.expiresAt ? (record.expiresAt < now) : ((now - (record.timestamp || now)) > this.RETENTION_MS);
            if (isExpired) {
              cursor.delete();
            }
            cursor.continue();
          }
        };
      } catch (e) {}
    }

    // 2. Purge from LocalStorage cache
    try {
      const raw = localStorage.getItem("portfolio_snake_leaderboard");
      if (raw) {
        const list = JSON.parse(raw);
        const filtered = list.filter(item => {
          if (item.expiresAt) return item.expiresAt >= now;
          if (item.verifiedAt) return (now - item.verifiedAt) <= this.RETENTION_MS;
          return true;
        });
        if (filtered.length !== list.length) {
          localStorage.setItem("portfolio_snake_leaderboard", JSON.stringify(filtered));
        }
      }
    } catch (e) {}
  },

  async getLeaderboard(game = "snake", limit = 5) {
    await this.init();
    await this.purgeExpiredScores();
    const now = Date.now();

    if (this.db) {
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction("game_scores", "readonly");
          const store = tx.objectStore("game_scores");
          const index = store.index("by_game");
          const req = index.getAll(game);

          req.onsuccess = () => {
            const list = req.result || [];
            const activeList = list.filter(item => {
              if (item.expiresAt) return item.expiresAt >= now;
              return true;
            });
            activeList.sort((a, b) => b.score - a.score);
            const enriched = activeList.slice(0, limit).map(item => {
              const remainingMs = item.expiresAt ? (item.expiresAt - now) : this.RETENTION_MS;
              const daysRemaining = Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
              return {
                playerName: item.playerName,
                telegramId: item.telegramId || "@guest_player",
                score: item.score,
                speed: item.speed,
                date: item.date,
                verifiedAt: item.verifiedAt,
                expiresAt: item.expiresAt,
                daysRemaining,
                isVerified: true
              };
            });
            resolve(enriched);
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
    const now = Date.now();
    try {
      const raw = localStorage.getItem("portfolio_snake_leaderboard");
      if (raw) {
        const parsed = JSON.parse(raw);
        const filtered = parsed.filter(p => !p.expiresAt || p.expiresAt >= now);
        return filtered.slice(0, limit).map(p => {
          const remainingMs = p.expiresAt ? (p.expiresAt - now) : this.RETENTION_MS;
          const daysRemaining = Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
          return {
            playerName: p.name || p.playerName,
            telegramId: p.telegramId || "@guest_player",
            score: p.score,
            speed: p.speed,
            date: p.date,
            verifiedAt: p.verifiedAt || now,
            expiresAt: p.expiresAt || (now + this.RETENTION_MS),
            daysRemaining,
            isVerified: true
          };
        });
      }
    } catch (e) {}

    return [
      { playerName: "Saurav (HAL)", telegramId: "@5auravpandey", score: 240, speed: "Turbo", date: "2026-10-18", daysRemaining: 7, isVerified: true },
      { playerName: "Aman K. (IITP)", telegramId: "@aman_iitp", score: 180, speed: "Normal", date: "2026-10-17", daysRemaining: 6, isVerified: true },
      { playerName: "Rohan V.", telegramId: "@rohan_v", score: 140, speed: "Normal", date: "2026-10-16", daysRemaining: 5, isVerified: true },
      { playerName: "Priya S.", telegramId: "@priya_gopalganj", score: 110, speed: "Chill", date: "2026-10-15", daysRemaining: 4, isVerified: true },
      { playerName: "Dev Cadet", telegramId: "@dev_cadet", score: 80, speed: "Normal", date: "2026-10-14", daysRemaining: 3, isVerified: true }
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
      try {
        const tx = this.db.transaction("access_passes", "readwrite");
        tx.objectStore("access_passes").put(newPass);
      } catch (e) {}
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
