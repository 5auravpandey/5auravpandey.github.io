/**
 * Saurav Pandey - Projects Data
 * Simple, clear, and authentic project descriptions with architecture blueprints.
 */
window.PORTFOLIO_PROJECTS = [
  {
    id: "commercebase",
    title: "CommerceBase",
    category: "systems",
    badge: "BCA Major Project",
    featured: true,
    tagline: "An e-commerce store built from scratch using Core Java (Servlets, JSP) and MySQL — no Spring Boot, just pure fundamentals.",
    github: "https://github.com/5auravpandey/CommerceBase",
    tags: ["Java", "Servlets", "JSP", "MySQL", "JDBC"],
    simpleStory: "For my BCA final project, I wanted to understand how web applications actually work before jumping into heavy frameworks. I wrote everything in raw Java Servlets, managing user sessions, product catalogs, and shopping carts directly.",
    whyBuilt: "To master the Java Servlet lifecycle, handle relational SQL queries manually with JDBC, and learn how real e-commerce backends manage shopping cart sessions.",
    architectureDiagram: `
[ Browser Client ]
        |
        | HTTP Requests (GET/POST)
        v
[ Java Servlets (Controller) ]
        |
        | Passes data to JSP Views
        v
[ DAO & JDBC Layer ]
        |
        | Prepared Statements
        v
[ MySQL Database (Normalized 3NF) ]`,
    highlights: [
      "Built without frameworks to understand raw HTTP handling in the JVM.",
      "Shopping cart session management with checkout flow.",
      "Clean 3NF normalized tables for products, orders, and users."
    ]
  },
  {
    id: "nft-marketplace-dapp",
    title: "NFT-Marketplace-DApp",
    category: "web3",
    badge: "Web3 / ICP",
    featured: true,
    tagline: "A decentralized marketplace on the Internet Computer where users can mint, browse, and trade NFTs directly on-chain.",
    github: "https://github.com/5auravpandey/NFT-Marketplace-DApp",
    tags: ["Internet Computer", "JavaScript", "Motoko", "Web3"],
    simpleStory: "I built this DApp to explore Web3 development on the Internet Computer (ICP). Unlike Ethereum where transactions cost gas and frontends are hosted on AWS, ICP hosts both the smart contracts (canisters) and frontend code directly on-chain.",
    whyBuilt: "To learn actor-model smart contracts, cryptographic principal IDs, and how decentralized apps interact with web browsers.",
    architectureDiagram: `
[ Web Browser Frontend ]
           |
           | RPC Calls via Agent-JS
           v
[ Frontend Canister (On-Chain Assets) ]
           |
           | Inter-Canister Messages
           v
[ Marketplace Canister (NFT Minting & Ownership State) ]`,
    highlights: [
      "On-chain NFT minting and ownership tracking.",
      "No gas fees for users browsing the marketplace.",
      "Frontend and smart contract both live on the blockchain."
    ]
  },
  {
    id: "cryptolock",
    title: "CryptoLock-Encryption-Utility",
    category: "systems",
    badge: "C++ Systems",
    featured: true,
    tagline: "A fast command-line file encryption tool written in Core C++ with binary file streams and bitwise XOR key rotation.",
    github: "https://github.com/5auravpandey/CryptoLock-Encryption-Utility",
    tags: ["C++", "Bitwise Ops", "File I/O", "CLI"],
    simpleStory: "During a BCA summer workshop, I built this utility to get comfortable with low-level C++. It takes any file (text, image, PDF, zip), reads raw byte streams, and scrambles them with a user key using bitwise math.",
    whyBuilt: "To understand how binary data works in memory, practice with C++ `std::fstream`, and learn how basic symmetric encryption operates.",
    architectureDiagram: `
[ Input File ] ===> [ std::fstream (Binary Mode) ]
                            |
                            v
                   [ Bitwise XOR Cipher ] <--- [ Secret Key ]
                            |
                            v
[ Output File ] <=== [ Scrambled Byte Stream ]`,
    highlights: [
      "Zero external dependencies — pure standard C++.",
      "Works safely on any file format without corrupting binary data.",
      "Streams data in chunks so it can handle files without using too much RAM."
    ]
  },
  {
    id: "secure-auth-app",
    title: "Secure-Authentication-App",
    category: "fullstack",
    badge: "Full-Stack",
    featured: true,
    tagline: "A Node.js and Express login system with password hashing (bcrypt), session cookies, and Google OAuth.",
    github: "https://github.com/5auravpandey/Secure-Authentication-App",
    tags: ["Node.js", "Express", "OAuth 2.0", "Bcrypt"],
    simpleStory: "A practical project where I learned how web security works in Node.js. It covers hashing passwords with salts, managing logged-in user sessions with secure cookies, and letting users log in with their Google account.",
    whyBuilt: "To understand web security best practices: protecting passwords, preventing session hijacking, and setting up third-party OAuth.",
    architectureDiagram: `
[ Browser ] === Login (POST) ===> [ Express Server ]
                                          |
                        +-----------------+-----------------+
                        |                                   |
                 [ Bcrypt Hash ]                     [ Google OAuth 2.0 ]
                        |                                   |
                        v                                   v
             [ Safe Password Check ]               [ Google Token Verified ]`,
    highlights: [
      "Bcrypt password salting to protect against credential leaks.",
      "Session management with HTTP-only cookies.",
      "Supports both normal email/password and Google Single Sign-On."
    ]
  },
  {
    id: "academiabase",
    title: "AcademiaBase-Student-System",
    category: "systems",
    badge: "BCA Minor Project",
    featured: false,
    tagline: "A student record and course enrollment system built with Java and a normalized MySQL database.",
    github: "https://github.com/5auravpandey/AcademiaBase-Student-System",
    tags: ["Java", "MySQL", "Database Design"],
    simpleStory: "I built this for my BCA minor project to practice relational database modeling. It keeps track of student profiles, enrolled courses, and grades, with separate access for teachers and students.",
    whyBuilt: "To design clean relational database tables (foreign keys, cascading updates) and write modular Java code connecting to a database.",
    architectureDiagram: `
[ Java Application UI ] ===> [ JDBC Connection Layer ] ===> [ MySQL Database ]
                                                             |
                                      +----------------------+----------------------+
                                      |                      |                      |
                                 [ Students ]          [ Enrollments ]          [ Courses ]`,
    highlights: [
      "Normalized MySQL tables preventing duplicate records.",
      "Separate login permissions for administrators and students.",
      "Modular DAO pattern keeping SQL queries neat and organized."
    ]
  },
  {
    id: "family-travel-tracker",
    title: "Family-Travel-Tracker",
    category: "database",
    badge: "PostgreSQL & Node",
    featured: false,
    tagline: "A web app to track places visited on a map using PostgreSQL relational queries and Node.js.",
    github: "https://github.com/5auravpandey/Family-Travel-Tracker",
    tags: ["PostgreSQL", "Node.js", "Express", "SQL"],
    simpleStory: "A fun full-stack project where family members can add countries they have traveled to, color-code them on an interactive world map, and keep a shared travel log.",
    whyBuilt: "To practice many-to-many database relationships in PostgreSQL and use SQL `JOIN` queries to power an interactive map interface.",
    architectureDiagram: `
[ World Map UI ] ===> [ Express Backend ] ===> [ PostgreSQL (JOIN Users & Countries) ]`,
    highlights: [
      "Many-to-many relational tables connected by junction keys.",
      "Interactive SVG map showing color-coded countries per user.",
      "Full CRUD operations with parameterized SQL queries."
    ]
  },
  {
    id: "server-log-analyzer",
    title: "Server-Log-Analyzer",
    category: "systems",
    badge: "Python Scripting",
    featured: false,
    tagline: "A lightweight Python script that parses web server logs, categorizes status codes, and spots error spikes.",
    github: "https://github.com/5auravpandey/Server-Log-Analyzer",
    tags: ["Python", "Regex", "Log Analysis"],
    simpleStory: "A simple command-line Python script that reads web server access logs line by line, uses regular expressions to find client IP addresses, error codes (404, 500), and outputs a summary of activity.",
    whyBuilt: "To practice Python file handling, regular expressions, and writing zero-dependency scripts that run on any terminal.",
    architectureDiagram: `
[ Server Log File ] ===> [ Python Line Generator ] ===> [ Regex Matcher ] ===> [ Summary Output ]`,
    highlights: [
      "Reads large files line-by-line so it never runs out of memory.",
      "Uses pure standard library Python — no pip install required.",
      "Counts IP frequencies and summarizes HTTP status code errors."
    ]
  }
];
