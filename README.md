# Saurav Pandey — Personal Portfolio & Developer Journal

A clean and expandable personal portfolio combining developer-first design with an interactive lab, and a curated archive of research, technical notes, books, games, watched cinema, and music.

Live Site: **[https://5auravpandey.github.io](https://5auravpandey.github.io)**

---

## 👨‍💻 About Saurav Pandey

- **MCA Student** at **IIIT Ranchi** & **IIT Patna**
- **Programming Assistant Intern (Software Development)** in the **Avionics Department** at **Hindustan Aeronautics Limited (HAL)**
- **Developer** focused on Full-Stack, Systems, and Web3 from **Gopalganj, Bihar, India**

---

## 🌟 Key Features & Interactive Sections

1. **📝 Engineering Notes & Research**:
   - Filterable showcase across:
     - 🔬 **Research Papers & Studies** (Distributed state, lightweight ciphers)
     - 📝 **Technical Notes & Findings** (Java Servlets, C++ bitwise arithmetic)
     - 📚 **Engineering Books** (The Pragmatic Programmer)

2. **⚙️ Hidden Admin Studio**:
   - Discreetly hidden from public visitors.
   - Triggers: Secret shortcut `Ctrl+Shift+A` (or `Cmd+Shift+A`), typing `admin` in the terminal shell, visiting `#admin`, or triple-clicking the footer copyright.
   - Protected with **Telegram OAuth (@SauravPandeyBot)** cryptographic signature verification.
   - Manage YouTube room whitelists, add, edit, delete, and copy updated `shelf.js` JavaScript code directly for committing to GitHub.

3. **🔐 Systems & Engineering Lab**:
   - **CryptoLock Two-Way XOR Cipher**: Real-time bitwise encryption and decryption (`(A ^ Key) ^ Key = A`), live hex byte visualization, and binary bit breakdown.
   - **Developer Terminal Shell**: Command history (`↑`/`↓`), tab autocompletion, matrix digital rain (`matrix`), theme toggle, and quick portfolio navigation.
   - **Deep Work Sprint Timer**: Distraction-free Pomodoro timer (25m / 50m intervals) with goal tracking.

4. **📐 Architecture Blueprints & Case Studies**:
   - Deep-dive ASCII system architecture diagrams inside accessible modal dialogs.

---

## 📁 Directory Structure

```
5auravpandey.github.io/
├── index.html                 # Semantic HTML entry point
├── README.md                  # Project documentation
├── .gitignore                 # Git ignore file
├── CNAME                      # Custom domain configuration (sauravpandey.me)
├── robots.txt                 # Search engine crawler instructions
├── sitemap.xml                # SEO sitemap
├── rss.xml                    # Engineering notes RSS feed
├── sw.js                      # Progressive Web App Service Worker
├── assets/                    # Favicon & assets
│   └── favicon.svg
├── css/
│   ├── style.css              # Editorial styles, dark theme, UI components
│   └── transitions.css        # View Transitions API & motion accessibility
└── js/
    ├── app.js                 # App coordinator, clock, search & filtering
    ├── transitions.js         # View Transitions helper with fallback
    ├── components/
    │   ├── admin.js           # Telegram OAuth-protected Admin Studio
    │   ├── case-study.js      # Modal drawer for project blueprints
    │   ├── games.js           # Lightweight mini-games
    │   ├── perspective.js     # Systems vs Executive view toggle
    │   ├── playground.js      # Focus timer, soundscapes, cryptolock & terminal
    │   └── stack-explorer.js  # Interactive skills matrix
    └── data/
        ├── database.js        # IndexedDB/LocalStorage persistence & Telegram auth
        ├── experience.js      # HAL Avionics experience record
        ├── profile.js         # Bio, education, contact info
        ├── projects.js        # Detailed project stories & architecture diagrams
        ├── shelf.js           # Reactive curations store
        └── skills.js          # Technical skills cross-referenced with projects
```

---

## 🚀 Running Locally

```bash
# Clone the repository
git clone https://github.com/5auravpandey/5auravpandey.github.io.git
cd 5auravpandey.github.io

# Start local server
python -m http.server 8000
```
Then visit `http://localhost:8000`.
