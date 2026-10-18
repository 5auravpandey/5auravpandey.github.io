/**
 * Saurav Pandey - Main Portfolio Application Script
 * Simple, grounded, orchestrating data, filtering, telemetry, and interactive lab.
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize Theme
  initTheme();

  // 2. Initialize Live Telemetry (Local Clock in Amethi / India Standard Time)
  initTelemetry();

  // 3. Render HAL Avionics Department Spotlight
  renderSpotlight();

  // 4. Initialize Projects Filtering and Rendering
  initProjects();

  // 5. Initialize Shelf & Notebook (Research, Notes, Books & Games)
  initShelf();

  // 6. Initialize Education Timeline
  renderEducation();

  // 7. Initialize Components
  if (window.PORTFOLIO_PERSPECTIVE) window.PORTFOLIO_PERSPECTIVE.init();
  if (window.PORTFOLIO_CASE_STUDY) window.PORTFOLIO_CASE_STUDY.init();
  if (window.PORTFOLIO_STACK_EXPLORER) window.PORTFOLIO_STACK_EXPLORER.init();
  if (window.PORTFOLIO_PLAYGROUND) window.PORTFOLIO_PLAYGROUND.init();
  if (window.PORTFOLIO_ADMIN) window.PORTFOLIO_ADMIN.init();

  // 8. Initialize Clipboard & Utility Actions
  initUtilities();

  // 9. Initialize Mobile Navigation Menu
  initMobileNav();
});

/**
 * Dark / Light Theme Manager
 */
function initTheme() {
  const root = document.documentElement;
  const themeBtn = document.getElementById("theme-toggle-btn");
  
  const savedTheme = localStorage.getItem("portfolio_theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialTheme = savedTheme || (prefersDark ? "dark" : "light");

  const mobileThemeBtn = document.getElementById("mobile-theme-btn");

  setTheme(initialTheme);

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") || "light";
      const next = current === "dark" ? "light" : "dark";
      setTheme(next);
    });
  }

  if (mobileThemeBtn) {
    mobileThemeBtn.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") || "light";
      const next = current === "dark" ? "light" : "dark";
      setTheme(next);
    });
  }

  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    const isDark = theme === "dark";
    if (themeBtn) {
      themeBtn.innerHTML = `<span class="theme-text-full">${isDark ? "Light mode" : "Dark mode"}</span><span class="theme-text-short">${isDark ? "☀️ Light" : "🌙 Dark"}</span>`;
      themeBtn.setAttribute("aria-pressed", isDark);
      themeBtn.setAttribute("title", isDark ? "Switch to Light mode" : "Switch to Dark mode");
    }
    if (mobileThemeBtn) {
      mobileThemeBtn.innerHTML = `<span class="mobile-theme-icon">${isDark ? "☀️" : "🌙"}</span>`;
      mobileThemeBtn.setAttribute("aria-label", isDark ? "Switch to Light mode" : "Switch to Dark mode");
      mobileThemeBtn.setAttribute("title", isDark ? "Switch to Light mode" : "Switch to Dark mode");
    }
    try {
      localStorage.setItem("portfolio_theme", theme);
    } catch (e) {}
  }
}

/**
 * Telemetry and Local Clock
 */
function initTelemetry() {
  const clockEl = document.getElementById("telemetry-time");
  if (!clockEl) return;

  function updateClock() {
    const now = new Date();
    const options = {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    };
    clockEl.textContent = `${now.toLocaleTimeString("en-GB", options)} IST`;
  }

  updateClock();
  setInterval(updateClock, 1000);
}

/**
 * HAL Avionics Spotlight Card
 */
function renderSpotlight() {
  const container = document.getElementById("spotlight-container");
  if (!container || !window.PORTFOLIO_EXPERIENCE) return;

  const exp = window.PORTFOLIO_EXPERIENCE[0];
  if (!exp) return;

  container.innerHTML = `
    <div class="spotlight-card">
      <div class="spotlight-header">
        <h3 class="spotlight-title">${exp.title}, ${exp.department}</h3>
        <span class="spotlight-badge">${exp.company}</span>
      </div>
      <div class="spotlight-meta">${exp.duration} • ${exp.location}</div>
      <p id="spotlight-summary" class="spotlight-body">
        ${exp.summary}
      </p>
      <ul class="spotlight-highlights">
        ${exp.responsibilities.map(r => `<li>${r}</li>`).join("")}
      </ul>
      <div class="spotlight-tags">
        ${exp.tech.map(t => `<span>${t}</span>`).join("")}
      </div>
    </div>
  `;
}

/**
 * Projects Grid with Dynamic Category Filtering
 */
let currentCategoryFilter = "all";

function initProjects() {
  const filterTabsContainer = document.getElementById("project-filter-tabs");
  if (filterTabsContainer) {
    const filters = [
      { id: "all", label: "All Projects" },
      { id: "systems", label: "Systems & C++ / Java" },
      { id: "web3", label: "Web3 & ICP" },
      { id: "fullstack", label: "Full-Stack & Web" },
      { id: "database", label: "Databases & SQL" }
    ];

    filterTabsContainer.innerHTML = filters.map(f => `
      <button 
        type="button" 
        class="filter-tab" 
        data-filter="${f.id}"
        aria-pressed="${f.id === currentCategoryFilter}">
        ${f.label}
      </button>
    `).join("");

    filterTabsContainer.addEventListener("click", (e) => {
      const tab = e.target.closest(".filter-tab");
      if (!tab) return;
      const filterId = tab.dataset.filter;
      if (filterId === currentCategoryFilter) return;

      currentCategoryFilter = filterId;
      Array.from(filterTabsContainer.children).forEach(btn => {
        btn.setAttribute("aria-pressed", btn.dataset.filter === filterId);
      });

      window.PORTFOLIO_TRANSITIONS.transition(() => {
        renderProjectsGrid();
      });
    });
  }

  renderProjectsGrid();
}

function renderProjectsGrid() {
  const grid = document.getElementById("projects-grid");
  if (!grid || !window.PORTFOLIO_PROJECTS) return;

  const currentPerspective = window.PORTFOLIO_PERSPECTIVE?.current || "engineer";
  const filtered = window.PORTFOLIO_PROJECTS.filter(p => {
    if (currentCategoryFilter === "all") return true;
    return p.category === currentCategoryFilter;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<p style="grid-column: 1/-1; color: var(--muted); font-style: italic;">No projects found in this category.</p>`;
    return;
  }

  grid.innerHTML = filtered.map(project => {
    const lensText = currentPerspective === "engineer" 
      ? project.whyBuilt 
      : project.simpleStory;
    
    const lensLabel = currentPerspective === "engineer" 
      ? "Under the Hood:" 
      : "Story & Purpose:";

    return `
      <article class="project-card" data-id="${project.id}">
        <div class="project-badge-row">
          <span class="project-badge ${project.featured ? 'featured' : ''}">${project.badge || project.category}</span>
          <span style="font-family: var(--mono); font-size: 11px; color: var(--muted);">${project.tags[0]}</span>
        </div>

        <h3 class="project-title">
          <a href="${project.github}" target="_blank" rel="noopener noreferrer">${project.title}</a>
        </h3>
        
        <p class="project-tagline">${project.tagline}</p>

        <div class="project-lens-box">
          <span class="project-lens-label">${lensLabel}</span>
          <div class="project-lens-content">${lensText}</div>
        </div>

        <div class="project-tags">
          ${project.tags.map(t => `<span class="project-tag">${t}</span>`).join("")}
        </div>

        <div class="project-actions">
          <button 
            type="button" 
            class="btn-case-study" 
            onclick="window.PORTFOLIO_CASE_STUDY.open('${project.id}', this)">
            Inspect Architecture & Blueprint →
          </button>
          <a href="${project.github}" target="_blank" rel="noopener noreferrer" class="github-link">
            GitHub ↗
          </a>
        </div>
      </article>
    `;
  }).join("");
}

/**
 * Archive & Curations (Research, Notes, Books, Games, Shows & Music)
 */
let currentShelfFilter = "all";

function initShelf() {
  const tabsContainer = document.getElementById("shelf-filter-tabs");
  if (tabsContainer) {
    const filters = [
      { id: "all", label: "All Items" },
      { id: "research", label: "🔬 Research" },
      { id: "notes", label: "📝 Notes" },
      { id: "books", label: "📚 Books" },
      { id: "games", label: "🎮 Games" },
      { id: "shows", label: "🎬 Shows & Cinema" },
      { id: "music", label: "🎵 Playlists & Music" }
    ];

    tabsContainer.innerHTML = filters.map(f => `
      <button 
        type="button" 
        class="filter-tab" 
        data-filter="${f.id}" 
        aria-pressed="${f.id === currentShelfFilter}">
        ${f.label}
      </button>
    `).join("");

    tabsContainer.addEventListener("click", (e) => {
      const tab = e.target.closest(".filter-tab");
      if (!tab) return;
      const filterId = tab.dataset.filter;
      if (filterId === currentShelfFilter) return;

      currentShelfFilter = filterId;
      Array.from(tabsContainer.children).forEach(btn => {
        btn.setAttribute("aria-pressed", btn.dataset.filter === filterId);
      });

      renderShelfGrid();
    });
  }

  renderShelfGrid();
}

function renderShelfMedia(item) {
  if (!item.media) return "";

  if (item.category === "music") {
    // Spotify playlist or track embed
    if (item.media.includes("open.spotify.com")) {
      const embedUrl = item.media.replace("open.spotify.com/", "open.spotify.com/embed/");
      return `
        <div class="shelf-media-box" style="margin: 10px 0;">
          <iframe 
            style="border-radius: 10px; width: 100%; border: none;" 
            src="${embedUrl}?utm_source=generator&theme=0" 
            height="152" 
            loading="lazy" 
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture">
          </iframe>
        </div>
      `;
    }
    // YouTube music or video embed
    const ytMatch = item.media.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/);
    if (ytMatch) {
      const ytId = ytMatch[1];
      return `
        <div class="shelf-media-box" style="margin: 10px 0;">
          <iframe 
            style="border-radius: 10px; width: 100%; aspect-ratio: 16/9; max-height: 200px; border: none;" 
            src="https://www.youtube-nocookie.com/embed/${ytId}" 
            title="${item.title}" 
            loading="lazy" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
          </iframe>
        </div>
      `;
    }
  }

  if (item.category === "shows") {
    return `
      <div style="margin: 8px 0;">
        <a href="${item.media}" target="_blank" rel="noopener noreferrer" style="font-family: var(--mono); font-size: 12.5px; color: var(--accent); text-decoration: underline; display: inline-flex; align-items: center; gap: 4px;">
          🎬 View Show Details / IMDb ↗
        </a>
      </div>
    `;
  }

  if (item.category === "research") {
    return `
      <div style="margin: 8px 0;">
        <a href="${item.media}" target="_blank" rel="noopener noreferrer" style="font-family: var(--mono); font-size: 12.5px; color: var(--accent); text-decoration: underline; display: inline-flex; align-items: center; gap: 4px;">
          📄 View Research Repo / Paper Code ↗
        </a>
      </div>
    `;
  }

  return `
    <div style="margin: 8px 0;">
      <a href="${item.media}" target="_blank" rel="noopener noreferrer" style="font-family: var(--mono); font-size: 12.5px; color: var(--accent); text-decoration: underline; display: inline-flex; align-items: center; gap: 4px;">
        🔗 Open Resource ↗
      </a>
    </div>
  `;
}

function renderShelfGrid() {
  const grid = document.getElementById("shelf-grid");
  if (!grid || !window.PORTFOLIO_SHELF) return;

  const items = window.PORTFOLIO_SHELF.filter(item => {
    if (currentShelfFilter === "all") return true;
    return item.category === currentShelfFilter;
  });

  if (items.length === 0) {
    grid.innerHTML = `<p style="grid-column: 1/-1; color: var(--muted); font-style: italic;">No items found in this category.</p>`;
    return;
  }

  grid.innerHTML = items.map(item => `
    <article class="shelf-card">
      <div class="shelf-card-header">
        <span class="shelf-badge ${item.category}">${item.badge}</span>
        ${item.rating ? `<span class="shelf-rating">${item.rating}</span>` : ''}
      </div>
      <h3 class="shelf-title">${item.title}</h3>
      <div class="shelf-meta">${item.meta}</div>
      <p class="shelf-summary">${item.summary}</p>
      ${renderShelfMedia(item)}
      ${item.content ? `
        <details class="shelf-details">
          <summary>Read full notes & reflections →</summary>
          <div class="shelf-details-body">
            ${item.content.trim().split("\n\n").map(p => `<p style="margin: 0 0 8px;">${p.replace(/\n/g, "<br>")}</p>`).join("")}
          </div>
        </details>
      ` : ''}
    </article>
  `).join("");
}

window.renderShelfGrid = renderShelfGrid;

/**
 * Education & Academic Milestones
 */
function renderEducation() {
  const container = document.getElementById("education-timeline");
  if (!container || !window.PORTFOLIO_PROFILE) return;

  const edList = window.PORTFOLIO_PROFILE.education;
  container.innerHTML = edList.map((item, idx) => `
    <li class="timeline-item ${idx === 0 ? 'active' : ''}">
      <div class="timeline-head">
        <h3 class="timeline-title">${item.degree}</h3>
        <span class="timeline-period">${item.period}</span>
      </div>
      <div class="timeline-institution">${item.institution}</div>
      <p class="timeline-desc">${item.description}</p>
    </li>
  `).join("");
}

/**
 * Global Toast Helper
 */
function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}
window.showToast = showToast;

/**
 * Email Copy & Utilities Helper
 */
function initUtilities() {
  const copyBtn = document.getElementById("btn-copy-email");
  const copyInviteBtn = document.getElementById("btn-copy-invite-link");
  const inviteLinkInput = document.getElementById("invite-link-input");

  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const email = window.PORTFOLIO_PROFILE.email;
      navigator.clipboard.writeText(email).then(() => {
        showToast("Email copied to clipboard!");
      }).catch(() => {
        showToast("Copy: " + email);
      });
    });
  }

  if (copyInviteBtn && inviteLinkInput) {
    // Dynamically update invite link value with current origin
    try {
      inviteLinkInput.value = `${window.location.origin}${window.location.pathname}?tab=focus&sprint=25`;
    } catch (e) {}

    copyInviteBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(inviteLinkInput.value).then(() => {
        showToast("Focus sprint invite link copied!");
        copyInviteBtn.textContent = "Copied!";
        setTimeout(() => { copyInviteBtn.textContent = "Copy Link"; }, 2000);
      });
    });
  }
}

/**
 * Mobile Navigation Dropdown Manager
 */
function initMobileNav() {
  const triggerBtn = document.getElementById("nav-dropdown-trigger");
  const dropdown = document.getElementById("mobile-dropdown");
  const backdrop = document.getElementById("dropdown-backdrop");
  const navBar = document.querySelector(".nav-bar");
  if (!triggerBtn || !dropdown) return;

  const closeDropdown = () => {
    dropdown.setAttribute("hidden", "");
    triggerBtn.setAttribute("aria-expanded", "false");
    triggerBtn.classList.remove("active");
    if (navBar) navBar.classList.remove("dropdown-open");
    document.body.classList.remove("dropdown-locked");
  };

  const openDropdown = () => {
    dropdown.removeAttribute("hidden");
    triggerBtn.setAttribute("aria-expanded", "true");
    triggerBtn.classList.add("active");
    if (navBar) navBar.classList.add("dropdown-open");
  };

  triggerBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isHidden = dropdown.hasAttribute("hidden");
    if (isHidden) {
      openDropdown();
    } else {
      closeDropdown();
    }
  });

  // Close when clicking any nav link inside dropdown
  dropdown.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      closeDropdown();
    });
  });

  // Close when clicking backdrop
  if (backdrop) {
    backdrop.addEventListener("click", closeDropdown);
  }

  // Close when clicking outside the navbar & dropdown
  document.addEventListener("click", (e) => {
    if (!dropdown.hasAttribute("hidden") && !dropdown.contains(e.target) && !triggerBtn.contains(e.target)) {
      closeDropdown();
    }
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !dropdown.hasAttribute("hidden")) {
      closeDropdown();
    }
  });

  // Close if window resizes to desktop width (> 768px)
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768 && !dropdown.hasAttribute("hidden")) {
      closeDropdown();
    }
  });
}
