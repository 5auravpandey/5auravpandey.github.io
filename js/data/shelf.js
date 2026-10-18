/**
 * Saurav Pandey - Shelf & Journal Data Store
 * Supports live dynamic editing via the Admin Panel, localStorage persistence,
 * and seamless code exporting for static GitHub Pages deployment.
 */

const DEFAULT_SHELF = [
  // --- ACADEMIC & TECHNICAL RESEARCH ---
  {
    id: "research-lightweight-ciphers",
    type: "research",
    category: "research",
    badge: "Research Paper",
    title: "Lightweight Symmetric Bitwise Ciphers for Resource-Constrained Embedded Controllers",
    meta: "August 2026 • 8 min read • Research Findings",
    rating: null,
    summary: "Investigating trade-offs between computational overhead, RAM consumption, and entropy dispersion in lightweight circular-rotation XOR cipher blocks for low-memory microcontrollers.",
    media: "https://github.com/5auravpandey/CryptoLock",
    content: `### Abstract & Motivation
In embedded systems and telemetry controllers, standard AES-256 block implementations often introduce significant memory overhead and clock cycle latency. This research investigates lightweight symmetric bitwise block encryption utilizing dynamic cyclic key permutations and bit-rotation matrices.

### Methodology & Benchmarks
- **Dynamic Key Permutation**: Derived cyclic rotation rounds from hardware timer registers without floating-point arithmetic.
- **Memory Footprint**: Benchmarked on 16MHz ATmega328P and ARM Cortex-M0 microcontrollers; achieved under 48 bytes of RAM usage compared to 2.4KB for software AES setups.
- **Entropy & Uniformity**: Evaluated output uniformity using statistical frequency testing, verifying uniform bit dispersion across 500,000 generated cipher bytes.

### Practical Engineering Outcome
The cryptographic algorithms explored in this research paper were formalized and compiled into the open-source **CryptoLock** engine written in standard C++.`
  },
  {
    id: "research-icp-state-consensus",
    type: "research",
    category: "research",
    badge: "Research Study",
    title: "Orthogonal Persistence vs Gas-Metered EVM: Architectural Analysis of the Internet Computer",
    meta: "July 2026 • 6 min read • Comparative Study",
    rating: null,
    summary: "Comparative analysis of WebAssembly orthogonal memory persistence versus Ethereum Virtual Machine gas metering and state trie architectures.",
    media: "https://github.com/5auravpandey/NFT-Marketplace-DApp",
    content: `### Overview & Problem Statement
Decentralized applications on standard EVM networks encounter severe user experience barriers because state transitions require separate persistent store instructions (SSTORE/SLOAD) charged directly to users via volatile gas fees. This study analyzes how the Internet Computer Protocol (ICP) handles persistent execution using WebAssembly page tables.

### Key Architectural Findings:
1. **Zero-Storage-API Persistence**: Wasm canisters treat memory heaps as persistent. Changes to memory pages are captured via kernel dirty-page tracking at the end of each execution round, eliminating database query boilerplate.
2. **Reverse Gas Economic Model**: Eliminates user transaction friction by consuming developer-funded cycles rather than forcing end visitors to hold cryptocurrency to read or interact with DApps.
3. **Canister Asynchrony**: Asynchronous inter-canister messaging using formal message queues avoids whole-blockchain re-entrancy locks.`
  },

  // --- TECH NOTES & FINDINGS ---
  {
    id: "note-servlets-jvm",
    type: "note",
    category: "notes",
    badge: "Tech Note",
    title: "Why I Built an E-Commerce Backend in Pure Java Servlets",
    meta: "October 2026 • 4 min read",
    rating: null,
    summary: "Why avoiding Spring Boot for a college project was the best decision I made for learning HTTP lifecycles and thread safety.",
    media: "",
    content: `When starting CommerceBase, almost everyone advised me to generate a Spring Boot starter project. While frameworks are great for production, they hide the essential mechanics:
- **How HTTP sessions actually work**: Dealing directly with \`HttpServletRequest\` and \`HttpSession\` taught me how cookies link browsers to JVM memory.
- **Thread Safety**: Realizing that a Servlet is a single instance shared across all incoming requests forced me to never store request-specific state in instance variables.
- **Pure JDBC**: Writing plain SQL queries with \`PreparedStatement\` helped me understand SQL injection prevention and connection pooling from the ground up.`
  },
  {
    id: "note-icp-blockchain",
    type: "note",
    category: "notes",
    badge: "Research",
    title: "Decentralized State: What I Learned Building on the Internet Computer",
    meta: "September 2026 • 5 min read",
    rating: null,
    summary: "How WebAssembly canisters work, why users don't pay gas fees, and hosting frontend code on-chain.",
    media: "",
    content: `Building an NFT marketplace on ICP showed me a completely different approach to blockchain:
1. **The Reverse Gas Model**: On Ethereum, users must pay gas for every click. On ICP, developers pre-fuel their canisters with cycles, meaning visitors can use the DApp completely free.
2. **Orthogonal Persistence**: You don't write database save/load code. The WebAssembly memory heap is automatically persisted across state updates.
3. **Frontend on the Chain**: Instead of putting HTML/JS on AWS S3 or Vercel, the website assets live directly inside a canister.`
  },
  {
    id: "note-cpp-bitwise",
    type: "note",
    category: "notes",
    badge: "Dev Finding",
    title: "Playing with Bitwise Math and Binary Files in C++",
    meta: "August 2026 • 3 min read",
    rating: null,
    summary: "Streaming bytes with std::fstream and why opening files in binary mode matters.",
    media: "",
    content: `When building CryptoLock in C++, I learned:
- Always use \`std::ios::binary\`. On Windows, standard text mode automatically converts newline characters (\`\\r\\n\` <-> \`\\n\`), which silently corrupts images and zip files.
- Process files in fixed-size chunk buffers instead of reading everything into memory. This keeps RAM usage tiny even for multi-gigabyte files.
- Bitwise XOR (\`^\`) is its own inverse: \`(A ^ B) ^ B = A\`. That simple rule makes symmetric ciphers intuitive to build.`
  },

  // --- BOOKS I READ ---
  {
    id: "book-pragmatic-programmer",
    type: "book",
    category: "books",
    badge: "Book",
    title: "The Pragmatic Programmer",
    meta: "by David Thomas & Andrew Hunt",
    rating: "★★★★★",
    summary: "One of the most practical books on software craftsmanship. Changed how I think about debugging, tooling, and taking responsibility for code quality.",
    media: "",
    content: `**Key Takeaways:**
- *"Care About Your Craft"*: Don't just write code that passes tests; write code that your future self won't hate.
- *"Don't Live with Broken Windows"*: Fix small bugs and bad design early before they compound.
- *"Learn at least one new language every year"*: Different languages push you to think in different paradigms.`
  },
  {
    id: "book-atomic-habits",
    type: "book",
    category: "books",
    badge: "Book",
    title: "Atomic Habits",
    meta: "by James Clear",
    rating: "★★★★★",
    summary: "Helped me build a steady daily routine for coding, studying for MCA, and staying consistent with fitness.",
    media: "",
    content: `Small 1% daily improvements compound massively over time. The concept of *systems over goals* helped me build a daily habit of coding and reading without burning out.`
  },
  {
    id: "book-designing-data-intensive-apps",
    type: "book",
    category: "books",
    badge: "Currently Reading",
    title: "Designing Data-Intensive Applications",
    meta: "by Martin Kleppmann",
    rating: "In Progress",
    summary: "The definitive guide to distributed systems, replication, database internals, and data modeling. Reading through it alongside my MCA studies.",
    media: "",
    content: `Currently reading this alongside my distributed systems courses at IIIT Ranchi and IIT Patna. Deeply demystifies how storage engines index data on disk (B-trees vs LSM trees) and how consensus algorithms like Raft operate.`
  },

  // --- GAMES I PLAY ---
  {
    id: "game-elden-ring",
    type: "game",
    category: "games",
    badge: "Game",
    title: "Elden Ring",
    meta: "FromSoftware • Action RPG",
    rating: "10/10 Masterpiece",
    summary: "Incredible world design, combat discipline, and atmospheric storytelling. Taught me patience and how to tackle tough problems step-by-step.",
    media: "",
    content: `Elden Ring is easily one of my favorite games of all time. Beyond the tough combat, the level design is a masterclass in curiosity-driven discovery. If you get stuck on a boss, you take a step back, explore another path, level up, and come back ready.`
  },
  {
    id: "game-portal-2",
    type: "game",
    category: "games",
    badge: "Game",
    title: "Portal 2",
    meta: "Valve • Puzzle",
    rating: "10/10 Classic",
    summary: "Brilliant spatial mechanics and hilarious writing. A must-play for anyone who loves clever problem-solving and game physics.",
    media: "",
    content: `The way Portal 2 teaches players complex momentum and physics mechanics without heavy tutorials is pure genius. The co-op mode with friends is some of the most fun gaming ever.`
  },
  {
    id: "game-cyberpunk-2077",
    type: "game",
    category: "games",
    badge: "Game",
    title: "Cyberpunk 2077",
    meta: "CD Projekt Red • Sci-Fi RPG",
    rating: "9.5/10",
    summary: "Night City's visuals, lofi tech aesthetic, and story are unmatched. Great inspiration for developer UI and dark cyberpunk themes.",
    media: "",
    content: `The world design and sound engineering of Night City are stunning. The aesthetic heavily inspired my love for sleek dark-mode interfaces, terminals, and cyberpunk styles.`
  },

  // --- WATCHED SHOWS & CINEMA ---
  {
    id: "show-mr-robot",
    type: "show",
    category: "shows",
    badge: "Series • Cyber Thriller",
    title: "Mr. Robot",
    meta: "Created by Sam Esmail • 4 Seasons",
    rating: "10/10 Masterpiece",
    summary: "The most technically authentic portrayal of cybersecurity, Linux terminals, social engineering, and mental health in television history.",
    media: "https://www.imdb.com/title/tt4158110/",
    content: `What makes Mr. Robot legendary is its absolute technical accuracy. Every terminal command (\`nmap\`, \`wireshark\`, \`shred\`, python scripts) is authentic. Combined with incredible cinematography, Mac Quayle's electronic synth score, and deep psychological writing, it's one of my all-time favorites.`
  },
  {
    id: "show-steins-gate",
    type: "show",
    category: "shows",
    badge: "Anime • Sci-Fi",
    title: "Steins;Gate",
    meta: "White Fox • 24 Episodes",
    rating: "10/10 Masterpiece",
    summary: "A brilliant time-travel mystery exploring causality, the butterfly effect, and underground lab experiments in Akihabara.",
    media: "https://myanimelist.net/anime/9253/Steins_Gate",
    content: `Starts as a quirky story about eccentric university students tinkering with microwaves and CRT monitors, and evolves into one of the tightest, most emotionally resonant hard sci-fi narratives ever created.`
  },
  {
    id: "show-severance",
    type: "show",
    category: "shows",
    badge: "Series • Sci-Fi Mystery",
    title: "Severance",
    meta: "Apple TV+ • Dir. Ben Stiller",
    rating: "9.5/10",
    summary: "A chilling, darkly funny look at work-life separation with immaculate retro-futuristic computing aesthetics and mind-bending cliffhangers.",
    media: "https://www.imdb.com/title/tt11280740/",
    content: `The visual direction—floppy disks, trackball mice, green phosphor screens, and sterile brutalist hallways—is hypnotic. The exploration of identity and consciousness makes every episode unforgettable.`
  },

  // --- MUSIC & PLAYLISTS ---
  {
    id: "music-indian-classical",
    type: "music",
    category: "music",
    badge: "Spotify Playlist",
    title: "Indian Classical Focus: Sitar, Sarod & Flute",
    meta: "Hindustani Classical • Meditative Flow",
    rating: "Daily Coding Riyaz",
    summary: "A hand-picked collection of soothing ragas, sitar recitals by Ustad Vilayat Khan & Pt. Nikhil Banerjee, and meditative bamboo flute.",
    media: "https://open.spotify.com/playlist/37i9dQZF1DX8Uebhn9wzrS",
    content: `Indian classical instrumental music is my favorite backdrop for deep coding and reading. The slow Alaap creates effortless mental focus without intrusive lyrics.`
  },
  {
    id: "music-cyberpunk-synth",
    type: "music",
    category: "music",
    badge: "Synthwave / Cyberpunk",
    title: "Late Night Coding & Synthwave Sessions",
    meta: "Retro Electro • 120 BPM Focus",
    rating: "Night Flow",
    summary: "Nostalgic analog synthesizers, 80s arpeggios, and driving basslines for night-time hacking and debugging.",
    media: "https://www.youtube.com/watch?v=4xDzrJKXOOY",
    content: `When tackling tough algorithmic problems or late-night C++ debugging, the steady electronic pulse keeps energy high and distractions at zero.`
  },
  {
    id: "music-lofi-beats",
    type: "music",
    category: "music",
    badge: "Lofi Beats",
    title: "Lofi Hip Hop & Chill Beats to Study/Relax to",
    meta: "Lofi Girl / ChilledCow • Ambient",
    rating: "Calm Vibes",
    summary: "Warm vinyl crackle, mellow jazz chords, and gentle hip hop drums for quiet evening study sessions.",
    media: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
    content: `The ultimate background audio for reading textbooks or writing documentation.`
  }
];

window.PORTFOLIO_SHELF_STORE = {
  STORAGE_KEY: "portfolio_custom_shelf",

  validateItem(item) {
    if (!item || typeof item !== "object") return null;
    const validCategories = ["research", "notes", "books", "games", "shows", "music"];
    const category = validCategories.includes(item.category) ? item.category : "notes";
    return {
      id: String(item.id || `custom-${Date.now()}`),
      type: String(item.type || category),
      category: category,
      badge: String(item.badge || "Note"),
      title: String(item.title || "Untitled"),
      meta: String(item.meta || ""),
      rating: item.rating ? String(item.rating) : null,
      summary: String(item.summary || ""),
      media: item.media ? String(item.media) : "",
      content: item.content ? String(item.content) : ""
    };
  },

  getAll() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const validated = parsed.map(item => this.validateItem(item)).filter(Boolean);
          if (validated.length > 0) {
            return validated;
          }
        }
      }
    } catch (e) {
      console.warn("Could not read custom shelf from storage:", e);
    }
    return [...DEFAULT_SHELF];
  },

  saveAll(items) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("Could not save shelf to storage:", e);
    }
    window.PORTFOLIO_SHELF = items;
    if (typeof window.renderShelfGrid === "function") {
      window.renderShelfGrid();
    }
  },

  addItem(item) {
    const items = this.getAll();
    const newItem = {
      ...item,
      id: item.id || `custom-${Date.now()}`
    };
    items.unshift(newItem);
    this.saveAll(items);
    return newItem;
  },

  updateItem(id, updatedFields) {
    const items = this.getAll();
    const idx = items.findIndex(i => i.id === id);
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...updatedFields };
      this.saveAll(items);
      return true;
    }
    return false;
  },

  deleteItem(id) {
    let items = this.getAll();
    items = items.filter(i => i.id !== id);
    this.saveAll(items);
  },

  resetToDefaults() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (e) {}
    this.saveAll([...DEFAULT_SHELF]);
  },

  exportCode() {
    const items = this.getAll();
    return `// Paste this array into js/data/shelf.js\nwindow.PORTFOLIO_SHELF = ${JSON.stringify(items, null, 2)};`;
  }
};

// Initialize active shelf array
window.PORTFOLIO_SHELF = window.PORTFOLIO_SHELF_STORE.getAll();
