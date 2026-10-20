# Saurav Pandey — Personal Portfolio & Developer Journal

A clean and expandable personal portfolio combining developer-first design with an interactive lab, and a curated archive of research, technical notes, books, games, watched cinema, and music.

Live Site: **[https://5auravpandey.github.io](https://5auravpandey.github.io)**

---

## 👨‍💻 About Saurav Pandey

- **MCA Student** at **IIIT Ranchi** & **IIT Patna**
- **Programming Assistant** in the **Avionics Department** at **Hindustan Aeronautics Limited (HAL)**
- **Developer** focused on Full-Stack, Systems, and Web3 from **Gopalganj, Bihar, India**

---

## 🌟 Key Features & Interactive Sections

1. **📚 Archive & Curations**:
   - Filterable showcase across:
     - 🔬 **Research Papers & Studies**
     - 📝 **Technical Notes & Findings**
     - 📚 **Books Read** (with honest takeaways and ratings)
     - 🎮 **Games Played** (system mechanics and critiques)
     - 🎬 **Watched Shows & Cinema** (sci-fi, tech dramas, and anime)
     - 🎵 **Playlists & Music** (responsive lazy-loaded Spotify & YouTube player embeds)

2. **⚙️ Hidden Admin Studio**:
   - Discreetly hidden from public visitors.
   - Triggers: Secret shortcut `Ctrl+Shift+A` (or `Cmd+Shift+A`), typing `admin` in the terminal shell, visiting `#admin`, or triple-clicking the footer copyright.
   - Protected with **RFC 6238 TOTP (Google Authenticator)** verified locally via Web Crypto API.
   - Add, edit, delete, and copy updated `shelf.js` JavaScript code directly for committing to GitHub.

3. **⏱️ Focus Sprint & Indian Classical Soundscapes**:
   - Native Web Audio synthesizer for ambient focus:
     - 🪕 Tanpura & Bansuri Drone (Indian Classical 432Hz meditative resonance)
     - ☀️ Morning Raga Bhairav (Sa-Re-Ga-Pa meditative harmonics)
     - 🌧️ Monsoon Rain over Banaras (Warm pink rain with distant thunder rumble)
     - 🔔 Temple Bells & Singing Bowls (Pure metallic overtone resonance)
   - Integrated Spotify focus player & synchronized Sprint Invite link generator.

4. **🔐 CryptoLock Two-Way Cipher**:
   - Symmetric bitwise XOR encryption and decryption (`(A ^ Key) ^ Key = A`).
   - Live hex byte visualization and raw binary bit breakdown.

5. **💻 Developer Terminal Shell**:
   - Command history (`↑`/`↓`), tab autocompletion, matrix digital rain (`matrix`), theme toggle, soundscape controls, and quick portfolio navigation.

6. **📐 Architecture Blueprints & Case Studies**:
   - Deep-dive ASCII system architecture diagrams inside accessible modal dialogs.

---

## 📁 Directory Structure

```
5auravpandey.github.io/
├── index.html                 # Semantic HTML entry point
├── README.md                  # Project documentation
├── .gitignore                 # Git ignore file
├── assets/                    # Images & media assets
├── css/
│   ├── style.css              # Editorial styles, dark theme, UI components
│   └── transitions.css        # View Transitions API & motion accessibility
└── js/
    ├── app.js                 # App coordinator, clock, search & filtering
    ├── transitions.js         # View Transitions helper with fallback
    ├── components/
    │   ├── perspective.js     # Systems vs Executive view toggle
    │   ├── case-study.js      # Modal drawer for project blueprints
    │   ├── stack-explorer.js  # Interactive skills matrix
    │   ├── playground.js      # Focus timer, soundscapes, cryptolock & terminal
    │   └── admin.js           # Google Authenticator-protected Admin Studio
    └── data/
        ├── profile.js         # Bio, education, contact info
        ├── experience.js      # HAL Avionics experience record
        ├── projects.js        # Detailed project stories & architecture diagrams
        ├── skills.js          # Technical skills cross-referenced with projects
        └── shelf.js           # Reactive curations store with localStorage
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
