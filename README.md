# Saurav Pandey — Software Developer Portfolio

A clean, high-performance personal portfolio combining enterprise software engineering experience at Hindustan Aeronautics Limited (HAL) with technical architecture studies, projects, and academic background.

Live Site: **[https://sauravpandey.me](https://sauravpandey.me)**

---

## 👨‍💻 About Saurav Pandey

- **Software Developer** focused on Python, Full-Stack Web Development, Relational Databases, and .NET from **Gopalganj, Bihar, India**
- **Programming Assistant Intern (Software Developer)** in the **Avionics Division** at **Hindustan Aeronautics Limited (HAL)**
  - Architecting database-driven ASP.NET web applications with C#, VB.NET, and SQL.
  - Migrating legacy Excel sheets into structured relational databases (Microsoft Access, SQL Server).
  - Modernizing avionics operational workflows with ADO.NET and key-based record retrieval.
- **MCA Student** at **IIIT Ranchi** & **IIT Patna** (2026–2028)

---

## 🌟 Key Features

1. **💼 Authentic Enterprise Experience (HAL Avionics)**:
   - Detailed breakdown of production engineering contributions: database modernization, ASP.NET/C#/VB.NET application development, ADO.NET integration, key-based operational indexing, and workflow automation.

2. **🛠️ Grounded Technical Stack**:
   - Categorized by production relevance: Languages (Python, JS, SQL, C#, VB.NET, Java), Frontend & Web Development (React.js, HTML5, CSS3 Flexbox/Grid, JS DOM, Bootstrap 5), Frameworks & Backend (Node.js/Express, Python Flask, ASP.NET, ADO.NET, Servlets), Databases (PostgreSQL, Access, MySQL), Tools & Automation, and Web3.

3. **📐 Architecture Blueprints & Case Studies**:
   - Deep-dive ASCII system architecture diagrams inside accessible modal dialogs with interactive triggers from project cards, stack explorer, and certification badges.

4. **📝 Notes, Library & Favorites (Shelf)**:
   - Technical notes on Computer Organization & Architecture (COA), favorite games (Sky: Children of the Light), watched anime (Attack on Titan), and recommended books (Atomic Habits by James Clear).
   - Discreet note-posting studio for the site owner, completely hidden from public visitors.

5. **⚙️ Discreet Admin Studio**:
   - Hidden from public visitors.
   - Triggers: Secret shortcut `Ctrl+Shift+A` (or `Cmd+Shift+A`), visiting `#admin`, or triple-clicking the footer.
   - Protected with **Telegram OAuth (@SauravPandeyBot)** cryptographic signature verification.

---

## 📁 Directory Structure

```
sauravpandey.me/
├── index.html                 # Semantic HTML entry point
├── README.md                  # Project documentation
├── .gitignore                 # Git ignore file
├── CNAME                      # Custom domain configuration (sauravpandey.me)
├── robots.txt                 # Search engine crawler instructions
├── sitemap.xml                # SEO sitemap
├── rss.xml                    # Engineering notes RSS feed
├── sw.js                      # Progressive Web App Service Worker (PWA)
├── assets/                    # Favicon & assets
│   └── favicon.svg
├── css/
│   ├── style.css              # Clean typography, dark mode, responsive styles
│   └── transitions.css        # View Transitions API & motion accessibility
└── js/
    ├── app.js                 # App coordinator, clock, filter tabs & navigation
    ├── transitions.js         # View Transitions helper with fallback
    ├── components/
    │   ├── admin.js           # Telegram OAuth-protected Admin Studio
    │   ├── case-study.js      # Modal drawer for project blueprints
    │   ├── perspective.js     # Systems vs Story view toggle
    │   └── stack-explorer.js  # Categorized technical skills matrix
    └── data/
        ├── database.js        # IndexedDB/LocalStorage persistence & Telegram auth
        ├── experience.js      # HAL Avionics experience record
        ├── profile.js         # Bio, education, contact info
        ├── projects.js        # Detailed project stories & architecture diagrams
        ├── shelf.js           # Technical notes and architecture studies
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
