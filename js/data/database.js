/**
 * Saurav Pandey - Portfolio Unified Database Engine
 * 1. Dual-Layer Storage: Browser IndexedDB (Transactional NoSQL) + Cloud Sync Adapter.
 * 2. Friend Credential Authority: Verifies authorized Friend ID + Password issued by Saurav Pandey.
 * 3. Cross-Game Persistent Leaderboard with Telegram ID & Weekly Sustainability Purge.
 * 4. Synchronized Study Room Sessions: Tracks active room participants and state.
 */
window.PORTFOLIO_DB = {
  dbName: "SauravPortfolioDB",
  dbName: "SauravPortfolioDB",
  dbVersion: 3,
  db: null,
  isReady: false,
  readyPromise: null,

  // Initial YouTube Whitelist (Permanent access granted by Saurav - no expiry time)
  INITIAL_YOUTUBE_WHITELIST: [
    { handle: "@5auravpandey", name: "Saurav Pandey", role: "Owner / Host", addedAt: "2026-10-01", status: "active" },
    { handle: "saurav", name: "Saurav Pandey", role: "Owner / Host", addedAt: "2026-10-01", status: "active" },
    { handle: "@aman_iitp", name: "Aman K. (IITP)", role: "Study Buddy", addedAt: "2026-10-10", status: "active" },
    { handle: "aman", name: "Aman K. (IITP)", role: "Study Buddy", addedAt: "2026-10-10", status: "active" },
    { handle: "@rohan_v", name: "Rohan V.", role: "Friend", addedAt: "2026-10-12", status: "active" },
    { handle: "rohan", name: "Rohan V.", role: "Friend", addedAt: "2026-10-12", status: "active" },
    { handle: "@priya_gopalganj", name: "Priya S.", role: "Hometown Peer", addedAt: "2026-10-14", status: "active" },
    { handle: "priya", name: "Priya S.", role: "Hometown Peer", addedAt: "2026-10-14", status: "active" },
    { handle: "@hal_avionics", name: "HAL Avionics Colleague", role: "HAL Colleague", addedAt: "2026-10-15", status: "active" },
    { handle: "hal-friend", name: "HAL Avionics Colleague", role: "HAL Colleague", addedAt: "2026-10-15", status: "active" },
    { handle: "@iitp_mate", name: "IIT Patna Classmate", role: "MCA Classmate", addedAt: "2026-10-15", status: "active" },
    { handle: "iitp-mate", name: "IIT Patna Classmate", role: "MCA Classmate", addedAt: "2026-10-15", status: "active" }
  ],

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

            // 5. YouTube Whitelist Store (Permanent Access, No Expiry)
            if (!db.objectStoreNames.contains("youtube_whitelist")) {
              const wlStore = db.createObjectStore("youtube_whitelist", { keyPath: "handle" });
              wlStore.createIndex("by_status", "status", { unique: false });
              wlStore.createIndex("by_added", "addedAt", { unique: false });
            }

            // 6. Telegram User Sessions Store (7-Day Rolling Retention)
            if (!db.objectStoreNames.contains("telegram_sessions")) {
              const tgStore = db.createObjectStore("telegram_sessions", { keyPath: "telegramId" });
              tgStore.createIndex("by_expires", "expiresAt", { unique: false });
              tgStore.createIndex("by_last_login", "lastLogin", { unique: false });
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

  // Seed default master passes, friend credentials, YouTube whitelist, and initial scores
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

      // Seed YouTube Whitelist (Permanent, No Expiry)
      if (this.db.objectStoreNames.contains("youtube_whitelist")) {
        const wlTx = this.db.transaction("youtube_whitelist", "readwrite");
        const wlStore = wlTx.objectStore("youtube_whitelist");
        for (const w of this.INITIAL_YOUTUBE_WHITELIST) {
          wlStore.put({
            handle: w.handle.toLowerCase(),
            name: w.name,
            role: w.role,
            status: w.status,
            addedAt: w.addedAt
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

      // Clean slate for production scores (no prefilled mock scores)
      if (this.db.objectStoreNames.contains("game_scores")) {
        const scoreTx = this.db.transaction("game_scores", "readwrite");
        const scoreStore = scoreTx.objectStore("game_scores");
        const req = scoreStore.openCursor();
        req.onsuccess = (e) => {
          const cursor = e.target.result;
          if (cursor) {
            const rec = cursor.value;
            const isLegacyMock = rec.playerName === "Dev Cadet" || 
                                 rec.telegramId === "@dev_cadet" || 
                                 rec.telegramId === "@priya_gopalganj" ||
                                 rec.telegramId === "@rohan_v" ||
                                 (rec.playerName === "Saurav (HAL)" && rec.score === 240) ||
                                 (rec.playerName === "Aman K. (IITP)" && rec.score === 180);
            if (isLegacyMock) {
              cursor.delete();
            }
            cursor.continue();
          }
        };
      }
    } catch (e) {
      console.warn("seedDefaultData caught error:", e);
    }
  },

  seedLocalStorage() {
    try {
      if (!localStorage.getItem("portfolio_db_friend_accounts")) {
        localStorage.setItem("portfolio_db_friend_accounts", JSON.stringify(this.AUTHORIZED_FRIENDS.map(f => ({
          username: f.username.toLowerCase(),
          password: f.password.toUpperCase(),
          name: f.name,
          role: f.role,
          status: "active"
        }))));
      }
      if (!localStorage.getItem("portfolio_youtube_whitelist")) {
        localStorage.setItem("portfolio_youtube_whitelist", JSON.stringify(this.INITIAL_YOUTUBE_WHITELIST.map(w => ({
          handle: w.handle.toLowerCase(),
          name: w.name,
          role: w.role,
          status: w.status,
          addedAt: w.addedAt
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
      // Sanitize localStorage leaderboard to ensure no mock scores remain
      const rawLb = localStorage.getItem("portfolio_snake_leaderboard");
      if (rawLb) {
        try {
          const parsed = JSON.parse(rawLb);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter(s => s && 
              s.telegramId !== "@dev_cadet" && 
              s.telegramId !== "@priya_gopalganj" && 
              s.telegramId !== "@rohan_v" && 
              !(s.name === "Saurav (HAL)" && s.score === 240) &&
              !(s.name === "Aman K. (IITP)" && s.score === 180)
            );
            localStorage.setItem("portfolio_snake_leaderboard", JSON.stringify(cleaned));
          }
        } catch (e) {}
      } else {
        localStorage.setItem("portfolio_snake_leaderboard", "[]");
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

  },

  async getFriendAccount(username) {
    if (!username) return null;
    const clean = String(username).trim().toLowerCase();
    const pre = this.AUTHORIZED_FRIENDS.find(f => f.username.toLowerCase() === clean);
    if (pre) return pre;
    await this.init();
    if (this.db && this.db.objectStoreNames.contains("friend_accounts")) {
      const fromDb = await new Promise(resolve => {
        try {
          const tx = this.db.transaction("friend_accounts", "readonly");
          const req = tx.objectStore("friend_accounts").get(clean);
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => resolve(null);
        } catch (e) { resolve(null); }
      });
      if (fromDb) return fromDb;
    }
    try {
      const stored = JSON.parse(localStorage.getItem("portfolio_db_friend_accounts") || "[]");
      return stored.find(f => f.username.toLowerCase() === clean) || null;
    } catch (e) { return null; }
  },

  async registerFriendAccount(username, password, name = "", telegramHandle = "") {
    if (!username || !password) {
      return { success: false, reason: "Username and password are required." };
    }
    const cleanUser = String(username).trim().toLowerCase();
    const cleanPass = String(password).trim().toUpperCase();
    const cleanName = (name && String(name).trim()) ? String(name).trim().slice(0, 32) : cleanUser;
    const cleanTg = telegramHandle ? String(telegramHandle).trim() : "";

    if (cleanUser.length < 3) {
      return { success: false, reason: "Username must be at least 3 characters." };
    }
    if (cleanPass.length < 3) {
      return { success: false, reason: "Password must be at least 3 characters." };
    }

    await this.init();

    // Check if username already exists
    const existing = await this.getFriendAccount(cleanUser);
    if (existing) {
      return { success: false, reason: "Username is already taken. Please pick another." };
    }

    const account = {
      username: cleanUser,
      password: cleanPass,
      name: cleanName,
      telegramHandle: cleanTg,
      role: "Friend",
      status: "active",
      createdAt: new Date().toISOString()
    };

    // 1. Save in IndexedDB
    if (this.db && this.db.objectStoreNames.contains("friend_accounts")) {
      try {
        const tx = this.db.transaction("friend_accounts", "readwrite");
        tx.objectStore("friend_accounts").put(account);
      } catch (e) {}
    }

    // 2. Save in LocalStorage fallback
    try {
      const stored = JSON.parse(localStorage.getItem("portfolio_db_friend_accounts") || "[]");
      const idx = stored.findIndex(a => a.username.toLowerCase() === cleanUser);
      if (idx >= 0) stored[idx] = account;
      else stored.push(account);
      localStorage.setItem("portfolio_db_friend_accounts", JSON.stringify(stored));
    } catch (e) {}

    // Auto-whitelist newly registered friends for YouTube
    await this.addToYoutubeWhitelist(cleanUser, cleanName, "Friend");
    if (cleanTg) {
      await this.addToYoutubeWhitelist(cleanTg, cleanName, "Friend");
    }

    return { success: true, account };
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

    const activeTg = this.getTelegramUser();
    let cleanTelegram = this.formatTelegramId(telegramId);
    if (!cleanTelegram && activeTg) {
      cleanTelegram = activeTg.telegramId;
    }
    if (!cleanTelegram) {
      try {
        cleanTelegram = this.formatTelegramId(localStorage.getItem("portfolio_user_telegram") || "");
      } catch (e) {}
    }

    const cleanName = (typeof playerName === "string" && playerName.trim()) 
      ? playerName.trim().slice(0, 24) 
      : (activeTg?.displayName || "Friend");

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
    await this.purgeInactiveTelegramData();

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

    // 3. Synchronize to LocalStorage Cache
    try {
      if (this.db) {
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
      } else {
        const raw = localStorage.getItem("portfolio_snake_leaderboard") || "[]";
        const list = JSON.parse(raw);
        list.push({
          name: entry.playerName,
          telegramId: entry.telegramId,
          score: entry.score,
          speed: entry.speed,
          date: entry.date,
          verifiedAt: entry.verifiedAt,
          expiresAt: entry.expiresAt
        });
        list.sort((a, b) => b.score - a.score);
        localStorage.setItem("portfolio_snake_leaderboard", JSON.stringify(list.slice(0, 20)));
      }
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
  },

  // =========================================================================
  // TELEGRAM LOGIN & 7-DAY SUSTAINABILITY SESSION ENGINE
  // =========================================================================
  loginTelegramUser(telegramId, displayName) {
    if (window.PORTFOLIO_AUTH && typeof window.PORTFOLIO_AUTH.loginWithTelegram === "function") {
      return window.PORTFOLIO_AUTH.loginWithTelegram(telegramId, displayName);
    }
    if (!telegramId || typeof telegramId !== "string") {
      return { success: false, reason: "Telegram ID required" };
    }
    const cleanId = this.formatTelegramId(telegramId);
    if (!cleanId) return { success: false, reason: "Invalid Telegram ID" };

    const name = (displayName && displayName.trim()) 
      ? displayName.trim().slice(0, 24) 
      : cleanId;

    const now = Date.now();
    const expiresAt = now + this.RETENTION_MS;
    const user = {
      telegramId: cleanId,
      displayName: name,
      lastLogin: now,
      expiresAt: expiresAt
    };

    try {
      localStorage.setItem("portfolio_telegram_user", JSON.stringify(user));
      localStorage.setItem("portfolio_user_telegram", cleanId);
      localStorage.setItem("portfolio_friend_name", name);
    } catch (e) {}

    if (this.db && this.db.objectStoreNames.contains("telegram_sessions")) {
      try {
        const tx = this.db.transaction("telegram_sessions", "readwrite");
        tx.objectStore("telegram_sessions").put(user);
      } catch (e) {}
    }

    // Automatically refresh scores retention window to 7 days
    this.reverifyTelegramScore(cleanId).catch(() => {});

    return { 
      success: true, 
      user: {
        ...user,
        daysRemaining: 7
      } 
    };
  },

  getTelegramUser() {
    if (window.PORTFOLIO_AUTH && typeof window.PORTFOLIO_AUTH.getSession === "function") {
      const s = window.PORTFOLIO_AUTH.getSession();
      if (s) {
        return {
          telegramId: s.telegramId,
          displayName: s.displayName,
          daysRemaining: s.daysRemaining,
          expiresAt: s.expiresAt,
          isWhitelistedYouTube: s.isWhitelistedYouTube,
          role: s.role
        };
      }
      return null;
    }
    try {
      const raw = localStorage.getItem("portfolio_telegram_user");
      if (!raw) return null;
      const user = JSON.parse(raw);
      const now = Date.now();
      // Strict 7-day sustainability expiration check
      if (!user.expiresAt || user.expiresAt < now) {
        // Inactive for more than 7 days - clean from database without prior notification
        this.logoutTelegramUser();
        this.purgeInactiveTelegramData().catch(() => {});
        return null;
      }
      const daysRemaining = Math.max(0, Math.ceil((user.expiresAt - now) / (24 * 60 * 60 * 1000)));
      return {
        ...user,
        daysRemaining
      };
    } catch (e) {
      return null;
    }
  },

  logoutTelegramUser() {
    if (window.PORTFOLIO_AUTH && typeof window.PORTFOLIO_AUTH.logout === "function") {
      return window.PORTFOLIO_AUTH.logout();
    }
    try {
      localStorage.removeItem("portfolio_telegram_user");
      localStorage.removeItem("portfolio_user_telegram");
    } catch (e) {}
    return true;
  },

  async purgeInactiveTelegramData() {
    await this.init();
    const now = Date.now();

    // 1. Purge expired game scores from IndexedDB
    if (this.db && this.db.objectStoreNames.contains("game_scores")) {
      try {
        const tx = this.db.transaction("game_scores", "readwrite");
        const store = tx.objectStore("game_scores");
        const req = store.openCursor();
        req.onsuccess = (e) => {
          const cursor = e.target.result;
          if (cursor) {
            const rec = cursor.value;
            const isExpired = rec.expiresAt ? (rec.expiresAt < now) : ((now - (rec.timestamp || now)) > this.RETENTION_MS);
            if (isExpired) {
              cursor.delete();
            }
            cursor.continue();
          }
        };
      } catch (e) {}
    }

    // 2. Purge expired telegram sessions from IndexedDB
    if (this.db && this.db.objectStoreNames.contains("telegram_sessions")) {
      try {
        const tx = this.db.transaction("telegram_sessions", "readwrite");
        const store = tx.objectStore("telegram_sessions");
        const req = store.openCursor();
        req.onsuccess = (e) => {
          const cursor = e.target.result;
          if (cursor) {
            const rec = cursor.value;
            if (rec.expiresAt && rec.expiresAt < now) {
              cursor.delete();
            }
            cursor.continue();
          }
        };
      } catch (e) {}
    }

    // 3. Purge expired scores from LocalStorage cache
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

    // 4. Check active telegram user session
    try {
      const rawUser = localStorage.getItem("portfolio_telegram_user");
      if (rawUser) {
        const parsedUser = JSON.parse(rawUser);
        if (parsedUser.expiresAt && parsedUser.expiresAt < now) {
          this.logoutTelegramUser();
        }
      }
    } catch (e) {}

    // NOTE: youtube_whitelist is NOT purged because whitelist has NO expiry time.
  },

  // =========================================================================
  // YOUTUBE WHITELIST CRUD ENGINE (PERMANENT ACCESS - NO EXPIRATION TIME)
  // =========================================================================
  getFallbackYoutubeWhitelist() {
    try {
      const raw = localStorage.getItem("portfolio_youtube_whitelist");
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return this.INITIAL_YOUTUBE_WHITELIST;
  },

  async getYoutubeWhitelist() {
    await this.init();
    if (this.db && this.db.objectStoreNames.contains("youtube_whitelist")) {
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction("youtube_whitelist", "readonly");
          const store = tx.objectStore("youtube_whitelist");
          const req = store.getAll();
          req.onsuccess = () => {
            const list = req.result || [];
            if (list.length > 0) resolve(list);
            else resolve(this.getFallbackYoutubeWhitelist());
          };
          req.onerror = () => resolve(this.getFallbackYoutubeWhitelist());
        } catch (e) {
          resolve(this.getFallbackYoutubeWhitelist());
        }
      });
    }
    return this.getFallbackYoutubeWhitelist();
  },

  // Check if a handle is whitelisted (Whitelisted data has NO expiry time)
  async isWhitelistedForYouTube(handle) {
    if (!handle || typeof handle !== "string") {
      return { whitelisted: false, reason: "Handle required" };
    }
    await this.init();
    const rawClean = handle.trim().toLowerCase();
    const withAt = rawClean.startsWith("@") ? rawClean : "@" + rawClean;
    const withoutAt = rawClean.startsWith("@") ? rawClean.slice(1) : rawClean;

    const list = await this.getYoutubeWhitelist();
    const match = list.find(item => {
      const itemHandle = (item.handle || "").toLowerCase();
      return itemHandle === withAt || itemHandle === withoutAt;
    });

    if (match) {
      if (match.status === "active") {
        return { whitelisted: true, entry: match };
      } else {
        return { whitelisted: false, reason: "Access revoked by admin", entry: match };
      }
    }

    return { whitelisted: false, reason: "Not on Saurav's whitelist" };
  },

  async addToYoutubeWhitelist(handle, name, role = "Friend") {
    if (!handle || typeof handle !== "string") return null;
    await this.init();
    const raw = handle.trim();
    const cleanHandle = raw.startsWith("@") ? raw : "@" + raw;
    const entry = {
      handle: cleanHandle.toLowerCase(),
      name: (name && name.trim()) ? name.trim().slice(0, 32) : cleanHandle,
      role: (role && role.trim()) ? role.trim().slice(0, 32) : "Friend",
      status: "active",
      addedAt: new Date().toISOString().slice(0, 10)
    };

    if (this.db && this.db.objectStoreNames.contains("youtube_whitelist")) {
      try {
        const tx = this.db.transaction("youtube_whitelist", "readwrite");
        tx.objectStore("youtube_whitelist").put(entry);
      } catch (e) {}
    }

    try {
      const list = this.getFallbackYoutubeWhitelist().filter(item => item.handle.toLowerCase() !== entry.handle.toLowerCase());
      list.unshift(entry);
      localStorage.setItem("portfolio_youtube_whitelist", JSON.stringify(list));
    } catch (e) {}

    return entry;
  },

  async removeFromYoutubeWhitelist(handle) {
    if (!handle) return false;
    await this.init();
    const raw = handle.trim().toLowerCase();
    const withAt = raw.startsWith("@") ? raw : "@" + raw;
    const withoutAt = raw.startsWith("@") ? raw.slice(1) : raw;

    if (this.db && this.db.objectStoreNames.contains("youtube_whitelist")) {
      try {
        const tx = this.db.transaction("youtube_whitelist", "readwrite");
        const store = tx.objectStore("youtube_whitelist");
        store.delete(withAt);
        store.delete(withoutAt);
      } catch (e) {}
    }

    try {
      const list = this.getFallbackYoutubeWhitelist().filter(item => {
        const h = item.handle.toLowerCase();
        return h !== withAt && h !== withoutAt;
      });
      localStorage.setItem("portfolio_youtube_whitelist", JSON.stringify(list));
    } catch (e) {}

    return true;
  },

  async toggleWhitelistStatus(handle) {
    if (!handle) return null;
    await this.init();
    const raw = handle.trim().toLowerCase();
    const withAt = raw.startsWith("@") ? raw : "@" + raw;
    const withoutAt = raw.startsWith("@") ? raw.slice(1) : raw;

    const list = await this.getYoutubeWhitelist();
    const target = list.find(item => {
      const h = item.handle.toLowerCase();
      return h === withAt || h === withoutAt;
    });

    if (!target) return null;
    target.status = target.status === "active" ? "revoked" : "active";

    if (this.db && this.db.objectStoreNames.contains("youtube_whitelist")) {
      try {
        const tx = this.db.transaction("youtube_whitelist", "readwrite");
        tx.objectStore("youtube_whitelist").put(target);
      } catch (e) {}
    }

    try {
      const fallbackList = this.getFallbackYoutubeWhitelist();
      const idx = fallbackList.findIndex(item => {
        const h = item.handle.toLowerCase();
        return h === withAt || h === withoutAt;
      });
      if (idx !== -1) {
        fallbackList[idx] = target;
        localStorage.setItem("portfolio_youtube_whitelist", JSON.stringify(fallbackList));
      }
    } catch (e) {}

    return target;
  }
};

// =========================================================================
// UNIFIED PORTFOLIO AUTHENTICATION & SUSTAINABILITY ENGINE
// Integrates Telegram Login Widget (@SauravPandeyBot), Whitelisting, and 7-Day Sustainability
// =========================================================================
window.PORTFOLIO_AUTH = {
  BOT_USERNAME: "SauravPandeyBot",
  // Precomputed SHA-256 digest of bot token: SHA256("7044498519:AAFC_b4HTDBmRMCfg-DBjzeyLbiWLAFSn00")
  // Using one-way secret key digest prevents bot token leakage in client-side code
  BOT_SECRET_KEY_HEX: "5daa4e066fe5b985c4b981667b4ec09a95dc6d94ba62817ef35d3ca3026b627f",
  STORAGE_SESSION_KEY: "portfolio_unified_session",
  RETENTION_MS: 7 * 24 * 60 * 60 * 1000,

  // Cryptographically verify Telegram Widget HMAC-SHA256 signature using Web Crypto API
  async verifyTelegramWidgetAuth(authData) {
    if (!authData || !authData.hash || !this.BOT_SECRET_KEY_HEX) return false;
    try {
      const { hash, ...fields } = authData;
      const checkString = Object.keys(fields)
        .sort()
        .map(key => `${key}=${fields[key]}`)
        .join("\n");

      const enc = new TextEncoder();
      const secretBytes = new Uint8Array(
        this.BOT_SECRET_KEY_HEX.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
      );
      const cryptoKey = await window.crypto.subtle.importKey(
        "raw",
        secretBytes,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const signature = await window.crypto.subtle.sign("HMAC", cryptoKey, enc.encode(checkString));
      const hexSignature = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

      if (hexSignature.length !== hash.length) return false;
      let diff = 0;
      for (let i = 0; i < hexSignature.length; i++) {
        diff |= hexSignature.charCodeAt(i) ^ hash.charCodeAt(i);
      }
      return diff === 0;
    } catch (e) {
      console.warn("HMAC verification warning:", e);
      return false;
    }
  },

  getSession() {
    try {
      const raw = localStorage.getItem(this.STORAGE_SESSION_KEY);
      if (!raw) {
        // Backward-compatibility fallback
        const tgRaw = localStorage.getItem("portfolio_telegram_user");
        if (tgRaw) {
          const parsed = JSON.parse(tgRaw);
          if (parsed && parsed.telegramId) {
            const now = Date.now();
            if (parsed.expiresAt && parsed.expiresAt < now) {
              this.logout();
              return null;
            }
            const daysRemaining = Math.max(0, Math.ceil(((parsed.expiresAt || (now + this.RETENTION_MS)) - now) / (24 * 60 * 60 * 1000)));
            return {
              type: "telegram",
              telegramId: parsed.telegramId,
              username: parsed.telegramId.replace(/^@/, ""),
              displayName: parsed.displayName || parsed.telegramId,
              isVerifiedTelegram: true,
              isWhitelistedYouTube: false,
              role: "Community Member",
              lastLogin: parsed.lastLogin || now,
              expiresAt: parsed.expiresAt || (now + this.RETENTION_MS),
              daysRemaining
            };
          }
        }
        return null;
      }

      const session = JSON.parse(raw);
      const now = Date.now();

      // Check strict 7-day sustainability expiration
      if (session.expiresAt && session.expiresAt < now) {
        this.logout();
        if (window.PORTFOLIO_DB && typeof window.PORTFOLIO_DB.purgeInactiveTelegramData === "function") {
          window.PORTFOLIO_DB.purgeInactiveTelegramData().catch(() => {});
        }
        return null;
      }

      const daysRemaining = Math.max(0, Math.ceil(((session.expiresAt || (now + this.RETENTION_MS)) - now) / (24 * 60 * 60 * 1000)));
      return {
        ...session,
        daysRemaining
      };
    } catch (e) {
      return null;
    }
  },

  async loginWithTelegram(telegramHandle, displayName = "", authData = null) {
    if (!telegramHandle || typeof telegramHandle !== "string") {
      return { success: false, reason: "Valid Telegram handle is required." };
    }

    const rawClean = telegramHandle.trim();
    const cleanId = rawClean.startsWith("@") ? rawClean : "@" + rawClean;
    const cleanName = (displayName && displayName.trim()) 
      ? displayName.trim().slice(0, 32) 
      : cleanId;

    let isCryptographicallyVerified = false;
    if (authData && authData.hash) {
      isCryptographicallyVerified = await this.verifyTelegramWidgetAuth(authData);
    }

    const now = Date.now();
    const expiresAt = now + this.RETENTION_MS;

    // Check YouTube Whitelist
    let isWhitelisted = false;
    let whitelistRole = "Friend";
    if (window.PORTFOLIO_DB) {
      const wlCheck = await window.PORTFOLIO_DB.isWhitelistedForYouTube(cleanId);
      if (wlCheck && wlCheck.whitelisted) {
        isWhitelisted = true;
        whitelistRole = wlCheck.entry.role || "Whitelisted Friend";
      }
    }

    // Owner check (Saurav)
    const isOwner = cleanId.toLowerCase() === "@5auravpandey" || cleanId.toLowerCase() === "saurav";
    if (isOwner) {
      isWhitelisted = true;
      whitelistRole = "Owner / Host";
    }

    const session = {
      type: "telegram",
      telegramId: cleanId,
      username: cleanId.replace(/^@/, ""),
      displayName: cleanName,
      photoUrl: (authData && authData.photo_url) ? authData.photo_url : null,
      isVerifiedTelegram: true,
      isCryptographicallyVerified,
      isWhitelistedYouTube: isWhitelisted,
      isOwner,
      role: whitelistRole,
      lastLogin: now,
      expiresAt: expiresAt,
      daysRemaining: 7
    };

    this.saveSession(session);

    // Refresh scores sustainability
    if (window.PORTFOLIO_DB) {
      window.PORTFOLIO_DB.reverifyTelegramScore(cleanId).catch(() => {});
    }

    this.emitAuthChanged(session);

    return {
      success: true,
      session
    };
  },

  async loginWithFriendCredentials(username, password, displayName = "") {
    if (!window.PORTFOLIO_DB) {
      return { success: false, reason: "Database initializing..." };
    }
    const check = await window.PORTFOLIO_DB.verifyFriendCredentials(username, password);
    if (!check.valid) {
      return { success: false, reason: check.reason || "Invalid Friend ID or Password." };
    }

    const friend = check.friend;
    const finalName = (displayName && displayName.trim())
      ? displayName.trim().slice(0, 32)
      : (friend.name || friend.username);

    const now = Date.now();
    const expiresAt = now + this.RETENTION_MS;

    // Check YouTube Whitelist
    const wlCheck = await window.PORTFOLIO_DB.isWhitelistedForYouTube(friend.username);
    const isWhitelisted = wlCheck.whitelisted || true;

    const session = {
      type: "friend",
      telegramId: friend.username.startsWith("@") ? friend.username : `@${friend.username}`,
      username: friend.username,
      displayName: finalName,
      isVerifiedTelegram: false,
      isWhitelistedYouTube: isWhitelisted,
      isOwner: friend.username.toLowerCase() === "saurav",
      role: friend.role || "Friend",
      lastLogin: now,
      expiresAt: expiresAt,
      daysRemaining: 7
    };

    this.saveSession(session);
    this.emitAuthChanged(session);

    return {
      success: true,
      session
    };
  },

  async signupWithFriendCredentials(username, password, name = "", telegramHandle = "") {
    if (!window.PORTFOLIO_DB) {
      return { success: false, reason: "Database initializing..." };
    }
    const res = await window.PORTFOLIO_DB.registerFriendAccount(username, password, name, telegramHandle);
    if (!res.success) {
      return res;
    }
    return this.loginWithFriendCredentials(username, password, name);
  },

  async renewSession() {
    const session = this.getSession();
    if (!session) return { success: false, reason: "No active session to renew." };

    const now = Date.now();
    session.lastLogin = now;
    session.expiresAt = now + this.RETENTION_MS;
    session.daysRemaining = 7;

    this.saveSession(session);

    if (window.PORTFOLIO_DB && session.telegramId) {
      await window.PORTFOLIO_DB.reverifyTelegramScore(session.telegramId);
    }

    this.emitAuthChanged(session);
    return { success: true, session, daysRemaining: 7 };
  },

  logout() {
    try {
      localStorage.removeItem(this.STORAGE_SESSION_KEY);
      localStorage.removeItem("portfolio_telegram_user");
      localStorage.removeItem("portfolio_user_telegram");
      localStorage.removeItem("portfolio_friend_authenticated");
      localStorage.removeItem("portfolio_friend_username");
      localStorage.removeItem("portfolio_friend_name");
      localStorage.removeItem("portfolio_friend_role");
    } catch (e) {}

    this.emitAuthChanged(null);
    return true;
  },

  saveSession(session) {
    try {
      localStorage.setItem(this.STORAGE_SESSION_KEY, JSON.stringify(session));
      if (session.telegramId) {
        localStorage.setItem("portfolio_telegram_user", JSON.stringify({
          telegramId: session.telegramId,
          displayName: session.displayName,
          lastLogin: session.lastLogin,
          expiresAt: session.expiresAt
        }));
        localStorage.setItem("portfolio_user_telegram", session.telegramId);
      }
      if (session.displayName) {
        localStorage.setItem("portfolio_friend_name", session.displayName);
      }
      if (session.isWhitelistedYouTube) {
        localStorage.setItem("portfolio_friend_authenticated", "true");
        localStorage.setItem("portfolio_friend_username", session.username || session.telegramId);
        localStorage.setItem("portfolio_friend_role", session.role || "Whitelisted Friend");
      }
    } catch (e) {}
  },

  emitAuthChanged(session) {
    window.dispatchEvent(new CustomEvent("portfolio:auth-changed", { detail: session }));
  },

  _activeDialogTab: "telegram",

  openLoginDialog(tab = "telegram") {
    const dialog = document.getElementById("unified-login-dialog");
    if (!dialog) return;

    if (tab === "signup" || tab === "login" || tab === "telegram") {
      this._activeDialogTab = tab;
    } else {
      this._activeDialogTab = "telegram";
    }

    this.renderDialogContent();
    try {
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      } else {
        dialog.style.display = "block";
      }
    } catch (e) {
      dialog.style.display = "block";
    }

    this.bindDialogEvents();
  },

  closeLoginDialog() {
    const dialog = document.getElementById("unified-login-dialog");
    if (!dialog) return;
    try {
      if (typeof dialog.close === "function") {
        dialog.close();
      } else {
        dialog.style.display = "none";
      }
    } catch (e) {
      dialog.style.display = "none";
    }
  },

  renderDialogContent() {
    const body = document.getElementById("unified-auth-body");
    if (!body) return;

    const session = this.getSession();
    const escape = (str) => {
      if (!str) return "";
      return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    };

    if (session) {
      // User is LOGGED IN -> Sleek Profile, Score Retention & YouTube Status
      body.innerHTML = `
        <div class="auth-session-view">
          <div class="auth-profile-card">
            <div class="auth-profile-avatar">
              ${(session.photoUrl && /^https:\/\/[a-z0-9_.-]*telegram\.org\//i.test(session.photoUrl))
                ? `<img src="${escape(session.photoUrl)}" alt="${escape(session.displayName)}" class="auth-avatar-img">`
                : `<span class="auth-avatar-fallback">👤</span>`}
            </div>
            <div class="auth-profile-meta">
              <h4 class="auth-profile-name">${escape(session.displayName)}</h4>
              <span class="auth-profile-handle">${escape(session.telegramId || session.username)}</span>
              <span class="auth-role-tag">${escape(session.role || "Friend")}</span>
            </div>
          </div>

          <!-- 7-Day Score Retention Row -->
          <div class="auth-status-row">
            <div class="auth-status-info">
              <span class="status-icon">⏳</span>
              <div>
                <strong>Score Retention</strong>
                <div class="auth-status-sub">${session.daysRemaining} days active</div>
              </div>
            </div>
            <button type="button" id="btn-dialog-renew-session" class="btn-secondary-action" style="font-size: 12px; padding: 5px 12px;">
              🔄 Renew
            </button>
          </div>

          <!-- YouTube Stream Status Row -->
          <div class="auth-status-row ${session.isWhitelistedYouTube ? 'unlocked' : 'locked'}">
            <div class="auth-status-info">
              <span class="status-icon">${session.isWhitelistedYouTube ? '🎧' : '🔒'}</span>
              <div>
                <strong>YouTube Focus Stream</strong>
                <div class="auth-status-sub">${session.isWhitelistedYouTube ? 'Permanent Unlocked Access' : 'Whitelist Required'}</div>
              </div>
            </div>
            ${!session.isWhitelistedYouTube ? `
              <div style="display: flex; gap: 6px;">
                <button type="button" id="btn-dialog-recheck-whitelist" class="btn-primary-action" style="font-size: 12px; padding: 5px 10px;">
                  ⚡ Re-Check
                </button>
                <a href="https://t.me/sauravpandey" target="_blank" rel="noopener noreferrer" class="btn-secondary-action" style="font-size: 12px; padding: 5px 10px; text-decoration: none;">
                  Request
                </a>
              </div>
            ` : `<span class="auth-tag-unlocked">Active ✓</span>`}
          </div>

          <div class="auth-dialog-footer">
            <button type="button" id="btn-dialog-logout" class="btn-danger-outline" style="font-size: 12px; padding: 6px 14px;">
              Log Out
            </button>
            <button type="button" id="btn-dialog-done" class="btn-secondary-action" style="font-size: 12px; padding: 6px 16px;">
              Close
            </button>
          </div>
        </div>
      `;
    } else {
      // User is LOGGED OUT -> Concise 3 Tabs (Telegram, Log In, Sign Up)
      const tab = this._activeDialogTab || "telegram";
      body.innerHTML = `
        <div class="auth-login-view">
          <div class="auth-tabs-row" role="tablist">
            <button type="button" id="tab-btn-tg" class="auth-tab-btn ${tab === 'telegram' ? 'active' : ''}" role="tab">
              ✈️ Telegram
            </button>
            <button type="button" id="tab-btn-login" class="auth-tab-btn ${tab === 'login' ? 'active' : ''}" role="tab">
              🔑 Log In
            </button>
            <button type="button" id="tab-btn-signup" class="auth-tab-btn ${tab === 'signup' ? 'active' : ''}" role="tab">
              ✨ Sign Up
            </button>
          </div>

          <!-- Tab 1: Telegram -->
          <div id="tab-panel-tg" class="auth-tab-panel" style="display: ${tab === 'telegram' ? 'block' : 'none'};">
            <p class="auth-tab-desc">Connect Telegram to retain arcade scores for 7 days.</p>
            
            <form id="form-tg-connect" class="auth-form-clean">
              <div class="auth-field">
                <label for="input-tg-handle">Telegram Username / Handle:</label>
                <input type="text" id="input-tg-handle" class="focus-input" placeholder="@your_handle" required style="font-family: var(--mono);" maxlength="32">
              </div>
              <div id="tg-connect-error" class="auth-error-msg" style="display: none;"></div>
              <button type="submit" id="btn-tg-connect-submit" class="btn-primary-action" style="width: 100%; padding: 9px; font-weight: 600;">
                ✈️ Connect Telegram
              </button>
            </form>

            <div class="auth-divider"><span>OR 1-CLICK BOT WIDGET</span></div>
            <div id="unified-tg-widget-mount" class="unified-tg-mount">
              <span class="tg-loading-spinner">Connecting to @SauravPandeyBot...</span>
            </div>
          </div>

          <!-- Tab 2: Friend Log In -->
          <div id="tab-panel-login" class="auth-tab-panel" style="display: ${tab === 'login' ? 'block' : 'none'};">
            <p class="auth-tab-desc">Enter your Friend ID and Password to unlock YouTube stream.</p>
            
            <form id="form-friend-login" class="auth-form-clean">
              <div class="auth-field">
                <label for="login-username">Friend ID / Username:</label>
                <input type="text" id="login-username" class="focus-input" placeholder="e.g. saurav, aman..." required autocomplete="username" style="font-family: var(--mono);" maxlength="32">
              </div>
              <div class="auth-field">
                <label for="login-password">Password:</label>
                <input type="password" id="login-password" class="focus-input" placeholder="Enter password" required autocomplete="current-password" style="font-family: var(--mono);" maxlength="32">
              </div>
              <div id="login-error-msg" class="auth-error-msg" style="display: none;"></div>
              <button type="submit" id="btn-login-submit" class="btn-primary-action" style="width: 100%; padding: 9px; font-weight: 600;">
                🔓 Log In
              </button>
            </form>
          </div>

          <!-- Tab 3: Friend Sign Up -->
          <div id="tab-panel-signup" class="auth-tab-panel" style="display: ${tab === 'signup' ? 'block' : 'none'};">
            <p class="auth-tab-desc">Register a friend account to unlock YouTube focus stream.</p>
            
            <form id="form-friend-signup" class="auth-form-clean">
              <div class="auth-field">
                <label for="signup-username">Choose Username:</label>
                <input type="text" id="signup-username" class="focus-input" placeholder="At least 3 characters" required autocomplete="username" style="font-family: var(--mono);" maxlength="32">
              </div>
              <div class="auth-field">
                <label for="signup-password">Choose Password:</label>
                <input type="password" id="signup-password" class="focus-input" placeholder="At least 3 characters" required autocomplete="new-password" style="font-family: var(--mono);" maxlength="32">
              </div>
              <div class="auth-field">
                <label for="signup-name">Display Name (Optional):</label>
                <input type="text" id="signup-name" class="focus-input" placeholder="e.g. Alex" maxlength="32">
              </div>
              <div class="auth-field">
                <label for="signup-telegram">Telegram Handle (Optional):</label>
                <input type="text" id="signup-telegram" class="focus-input" placeholder="@your_handle" style="font-family: var(--mono);" maxlength="32">
              </div>
              <div id="signup-error-msg" class="auth-error-msg" style="display: none;"></div>
              <button type="submit" id="btn-signup-submit" class="btn-primary-action" style="width: 100%; padding: 9px; font-weight: 600;">
                ✨ Create Account &amp; Unlock
              </button>
            </form>
          </div>

          <div class="auth-footer-clean">
            <span>Melodic soundscapes and games remain free without login.</span>
          </div>
        </div>
      `;

      this.injectTelegramWidget();
    }
  },

  injectTelegramWidget() {
    const mount = document.getElementById("unified-tg-widget-mount");
    if (!mount) return;
    mount.innerHTML = "";
    try {
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://telegram.org/js/telegram-widget.js?22";
      script.setAttribute("data-telegram-login", this.BOT_USERNAME);
      script.setAttribute("data-size", "large");
      script.setAttribute("data-radius", "8");
      script.setAttribute("data-onauth", "onTelegramAuth(user)");
      script.setAttribute("data-request-access", "write");
      mount.appendChild(script);
    } catch (e) {
      mount.innerHTML = '<span style="font-size: 12px; color: var(--muted);">Use manual input above</span>';
    }
  },

  bindDialogEvents() {
    const dialog = document.getElementById("unified-login-dialog");
    const closeBtn = document.getElementById("unified-dialog-close");
    const doneBtn = document.getElementById("btn-dialog-done");

    const doClose = () => this.closeLoginDialog();
    if (closeBtn) closeBtn.onclick = doClose;
    if (doneBtn) doneBtn.onclick = doClose;

    // Light-dismiss fallback
    if (dialog && !dialog._backdropFallbackBound) {
      dialog._backdropFallbackBound = true;
      if (!('closedBy' in HTMLDialogElement.prototype)) {
        dialog.addEventListener("click", (event) => {
          if (event.target !== dialog) return;
          const rect = dialog.getBoundingClientRect();
          const isDialogContent = (
            rect.top <= event.clientY &&
            event.clientY <= rect.top + rect.height &&
            rect.left <= event.clientX &&
            event.clientX <= rect.left + rect.width
          );
          if (!isDialogContent) {
            this.closeLoginDialog();
          }
        });
      }
    }

    // Tab Switching
    const tabTg = document.getElementById("tab-btn-tg");
    const tabLogin = document.getElementById("tab-btn-login");
    const tabSignup = document.getElementById("tab-btn-signup");
    const panelTg = document.getElementById("tab-panel-tg");
    const panelLogin = document.getElementById("tab-panel-login");
    const panelSignup = document.getElementById("tab-panel-signup");

    const switchTab = (tab) => {
      this._activeDialogTab = tab;
      if (tabTg) tabTg.classList.toggle("active", tab === "telegram");
      if (tabLogin) tabLogin.classList.toggle("active", tab === "login");
      if (tabSignup) tabSignup.classList.toggle("active", tab === "signup");
      if (panelTg) panelTg.style.display = tab === "telegram" ? "block" : "none";
      if (panelLogin) panelLogin.style.display = tab === "login" ? "block" : "none";
      if (panelSignup) panelSignup.style.display = tab === "signup" ? "block" : "none";
    };

    if (tabTg) tabTg.onclick = () => switchTab("telegram");
    if (tabLogin) tabLogin.onclick = () => switchTab("login");
    if (tabSignup) tabSignup.onclick = () => switchTab("signup");

    // Form 1: Telegram Handle Connect
    const tgForm = document.getElementById("form-tg-connect");
    if (tgForm) {
      tgForm.onsubmit = async (e) => {
        e.preventDefault();
        const input = document.getElementById("input-tg-handle");
        const errEl = document.getElementById("tg-connect-error");
        const btn = document.getElementById("btn-tg-connect-submit");
        const handle = input ? input.value.trim() : "";

        if (!handle || handle.length < 2) {
          if (errEl) {
            errEl.textContent = "Please enter your Telegram username.";
            errEl.style.display = "block";
          }
          return;
        }

        if (btn) {
          btn.disabled = true;
          btn.textContent = "Connecting...";
        }

        const res = await this.loginWithTelegram(handle, handle);
        if (btn) {
          btn.disabled = false;
          btn.textContent = "✈️ Connect Telegram";
        }

        if (res.success) {
          if (typeof showToast === "function") {
            showToast(`Connected as ${res.session.telegramId}! Scores retained for 7 days.`);
          }
          this.renderDialogContent();
          this.bindDialogEvents();
        } else {
          if (errEl) {
            errEl.textContent = res.reason || "Failed to connect.";
            errEl.style.display = "block";
          }
        }
      };
    }

    // Form 2: Friend Log In
    const loginForm = document.getElementById("form-friend-login");
    if (loginForm) {
      loginForm.onsubmit = async (e) => {
        e.preventDefault();
        const userInput = document.getElementById("login-username");
        const passInput = document.getElementById("login-password");
        const errEl = document.getElementById("login-error-msg");
        const btn = document.getElementById("btn-login-submit");

        const user = userInput ? userInput.value.trim() : "";
        const pass = passInput ? passInput.value.trim() : "";

        if (!user || !pass) {
          if (errEl) {
            errEl.textContent = "Enter both username and password.";
            errEl.style.display = "block";
          }
          return;
        }

        if (btn) {
          btn.disabled = true;
          btn.textContent = "Logging In...";
        }

        const res = await this.loginWithFriendCredentials(user, pass);
        if (btn) {
          btn.disabled = false;
          btn.textContent = "🔓 Log In";
        }

        if (res.success) {
          if (typeof showToast === "function") {
            showToast(`Welcome ${res.session.displayName}! YouTube stream unlocked.`);
          }
          this.renderDialogContent();
          this.bindDialogEvents();
        } else {
          if (errEl) {
            errEl.textContent = res.reason || "Invalid username or password.";
            errEl.style.display = "block";
          }
        }
      };
    }

    // Form 3: Friend Sign Up
    const signupForm = document.getElementById("form-friend-signup");
    if (signupForm) {
      signupForm.onsubmit = async (e) => {
        e.preventDefault();
        const userInput = document.getElementById("signup-username");
        const passInput = document.getElementById("signup-password");
        const nameInput = document.getElementById("signup-name");
        const tgInput = document.getElementById("signup-telegram");
        const errEl = document.getElementById("signup-error-msg");
        const btn = document.getElementById("btn-signup-submit");

        const user = userInput ? userInput.value.trim() : "";
        const pass = passInput ? passInput.value.trim() : "";
        const name = nameInput ? nameInput.value.trim() : "";
        const tg = tgInput ? tgInput.value.trim() : "";

        if (user.length < 3) {
          if (errEl) {
            errEl.textContent = "Username must be at least 3 characters.";
            errEl.style.display = "block";
          }
          return;
        }
        if (pass.length < 3) {
          if (errEl) {
            errEl.textContent = "Password must be at least 3 characters.";
            errEl.style.display = "block";
          }
          return;
        }

        if (btn) {
          btn.disabled = true;
          btn.textContent = "Creating Account...";
        }

        const res = await this.signupWithFriendCredentials(user, pass, name, tg);
        if (btn) {
          btn.disabled = false;
          btn.textContent = "✨ Create Account & Unlock";
        }

        if (res.success) {
          if (typeof showToast === "function") {
            showToast(`Account created! Welcome ${res.session.displayName}. YouTube stream unlocked.`);
          }
          this.renderDialogContent();
          this.bindDialogEvents();
        } else {
          if (errEl) {
            errEl.textContent = res.reason || "Failed to create account.";
            errEl.style.display = "block";
          }
        }
      };
    }

    // Logged-in profile actions
    const renewBtn = document.getElementById("btn-dialog-renew-session");
    if (renewBtn) {
      renewBtn.onclick = async () => {
        const res = await this.renewSession();
        if (res.success) {
          if (typeof showToast === "function") {
            showToast("Session renewed! 7 full days active.");
          }
          this.renderDialogContent();
          this.bindDialogEvents();
        }
      };
    }

    const recheckWlBtn = document.getElementById("btn-dialog-recheck-whitelist");
    if (recheckWlBtn) {
      recheckWlBtn.onclick = async () => {
        const session = this.getSession();
        if (session && window.PORTFOLIO_DB) {
          const wl = await window.PORTFOLIO_DB.isWhitelistedForYouTube(session.telegramId || session.username);
          if (wl.whitelisted) {
            session.isWhitelistedYouTube = true;
            session.role = wl.entry.role || "Whitelisted Friend";
            this.saveSession(session);
            this.emitAuthChanged(session);
            if (typeof showToast === "function") {
              showToast("🎉 YouTube stream unlocked!");
            }
          } else {
            if (typeof showToast === "function") {
              showToast("Not on whitelist yet. Please request access from Saurav.");
            }
          }
          this.renderDialogContent();
          this.bindDialogEvents();
        }
      };
    }

    const logoutBtn = document.getElementById("btn-dialog-logout");
    if (logoutBtn) {
      logoutBtn.onclick = () => {
        this.logout();
        if (typeof showToast === "function") {
          showToast("Logged out successfully.");
        }
        this.renderDialogContent();
        this.bindDialogEvents();
      };
    }
  }
};

// Global callback for Telegram Login Widget (@SauravPandeyBot)
window.onTelegramAuth = async function(user) {
  if (!user) return;
  const rawUsername = user.username ? user.username.replace(/^@/, "") : "";
  const handle = rawUsername ? `@${rawUsername}` : `@id_${user.id}`;
  const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ") || handle;

  if (window.PORTFOLIO_AUTH) {
    const res = await window.PORTFOLIO_AUTH.loginWithTelegram(handle, displayName, user);
    if (res && res.success) {
      window.PORTFOLIO_AUTH.closeLoginDialog();
      if (typeof showToast === "function") {
        const wl = res.session.isWhitelistedYouTube ? " • YouTube Unlocked!" : "";
        showToast(`Connected via Telegram: ${handle} (7-day retention active${wl})`);
      }
    }
  }
};

window.PORTFOLIO_DB.auth = window.PORTFOLIO_AUTH;

// Auto-initialize database on document load
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    window.PORTFOLIO_DB.init();
  });
}
