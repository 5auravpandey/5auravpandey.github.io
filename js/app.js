/**
 * Saurav Pandey - Main Portfolio Application Script
 * Cleaned, hardened architecture with static navigation,
 * XSS escaping, safe URL handling, and zero inline handlers.
 */

// Global Sanitization Utilities (XSS & Protocol Protection)
function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
window.escapeHTML = escapeHTML;

function sanitizeURL(url) {
  if (!url) return "#";
  const trimmed = String(url).trim();
  if (/^(https?:\/\/|mailto:)/i.test(trimmed)) {
    return trimmed;
  }
  return "#";
}
window.sanitizeURL = sanitizeURL;

document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize Theme
  initTheme();

  // 2. Initialize Live Telemetry (Local Clock in Amethi / India Standard Time)
  initTelemetry();

  // 3. Render HAL Avionics Department Spotlight
  renderSpotlight();

  // 4. Initialize Projects Filtering, Delegation and Rendering
  initProjects();

  // 5. Initialize Shelf & Notebook (Research, Notes, Books & Games)
  initShelf();

  // 6. Initialize Education Timeline
  renderEducation();

  // 7. Initialize Interactive Components
  if (window.PORTFOLIO_PERSPECTIVE) window.PORTFOLIO_PERSPECTIVE.init();
  if (window.PORTFOLIO_CASE_STUDY) window.PORTFOLIO_CASE_STUDY.init();
  if (window.PORTFOLIO_STACK_EXPLORER) window.PORTFOLIO_STACK_EXPLORER.init();
  if (window.PORTFOLIO_PLAYGROUND) window.PORTFOLIO_PLAYGROUND.init();
  if (window.PORTFOLIO_ADMIN) window.PORTFOLIO_ADMIN.init();

  // 8. Initialize Clipboard & Utility Actions
  initUtilities();

  // 9. Initialize Mobile Navigation Dropdown Menu
  initMobileNav();
});

/**
 * Dark / Light Theme Manager
 */
function initTheme() {
  const root = document.documentElement;
  const themeBtn = document.getElementById("theme-toggle-btn");
  const mobileThemeBtn = document.getElementById("mobile-theme-btn");
  
  const savedTheme = localStorage.getItem("portfolio_theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialTheme = savedTheme || (prefersDark ? "dark" : "light");

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
        <h3 class="spotlight-title">${escapeHTML(exp.title)}, ${escapeHTML(exp.department)}</h3>
        <span class="spotlight-badge">${escapeHTML(exp.company)}</span>
      </div>
      <div class="spotlight-meta">${escapeHTML(exp.duration)} • ${escapeHTML(exp.location)}</div>
      <p id="spotlight-summary" class="spotlight-body">
        ${escapeHTML(exp.summary)}
      </p>
      <ul class="spotlight-highlights">
        ${exp.responsibilities.map(r => `<li>${escapeHTML(r)}</li>`).join("")}
      </ul>
      <div class="spotlight-tags">
        ${exp.tech.map(t => `<span>${escapeHTML(t)}</span>`).join("")}
      </div>
    </div>
  `;
}

/**
 * Projects Filtering, Event Delegation & Rendering
 */
let currentCategoryFilter = "all";

function initProjects() {
  const tabsContainer = document.getElementById("project-filter-tabs");
  const grid = document.getElementById("projects-grid");

  if (tabsContainer) {
    const tabs = tabsContainer.querySelectorAll(".filter-tab");
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        const filter = tab.dataset.filter;
        if (currentCategoryFilter === filter) return;

        currentCategoryFilter = filter;
        tabs.forEach(t => t.setAttribute("aria-pressed", t.dataset.filter === filter));
        renderProjectsGrid();
      });
    });
  }

  // Event delegation to eliminate inline onclick handlers
  if (grid) {
    grid.addEventListener("click", (e) => {
      const btn = e.target.closest(".btn-case-study");
      if (btn) {
        const card = btn.closest(".project-card");
        const id = card?.dataset?.id;
        if (id && window.PORTFOLIO_CASE_STUDY) {
          window.PORTFOLIO_CASE_STUDY.open(id, btn);
        }
      }
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

    const safeGithub = sanitizeURL(project.github);

    return `
      <article class="project-card" data-id="${escapeHTML(project.id)}">
        <div class="project-badge-row">
          <span class="project-badge ${project.featured ? 'featured' : ''}">${escapeHTML(project.badge || project.category)}</span>
          <span style="font-family: var(--mono); font-size: 11px; color: var(--muted);">${escapeHTML(project.tags[0])}</span>
        </div>

        <h3 class="project-title">
          <a href="${safeGithub}" target="_blank" rel="noopener noreferrer">${escapeHTML(project.title)}</a>
        </h3>
        
        <p class="project-tagline">${escapeHTML(project.tagline)}</p>

        <div class="project-lens-box">
          <span class="project-lens-label">${lensLabel}</span>
          <div class="project-lens-content">${escapeHTML(lensText)}</div>
        </div>

        <div class="project-tags">
          ${project.tags.map(t => `<span class="project-tag">${escapeHTML(t)}</span>`).join("")}
        </div>

        <div class="project-actions">
          <button 
            type="button" 
            class="btn-case-study">
            Inspect Architecture & Blueprint →
          </button>
          <a href="${safeGithub}" target="_blank" rel="noopener noreferrer" class="github-link">
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
    const spotifyMatch = item.media.match(/^https:\/\/open\.spotify\.com\/(?:embed\/)?(playlist|album|track)\/([a-zA-Z0-9]+)/);
    if (spotifyMatch) {
      const embedUrl = `https://open.spotify.com/embed/${spotifyMatch[1]}/${spotifyMatch[2]}?utm_source=generator&theme=0`;
      return `
        <div class="shelf-media-box" style="margin: 10px 0;">
          <iframe 
            style="border-radius: 10px; width: 100%; border: none;" 
            src="${embedUrl}" 
            height="152" 
            loading="lazy" 
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture">
          </iframe>
        </div>
      `;
    }

    // YouTube music or video embed (strict 11-char video ID)
    const ytMatch = item.media.match(/^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) {
      const ytId = ytMatch[1];
      return `
        <div class="shelf-media-box" style="margin: 10px 0;">
          <iframe 
            style="border-radius: 10px; width: 100%; aspect-ratio: 16/9; max-height: 200px; border: none;" 
            src="https://www.youtube-nocookie.com/embed/${ytId}" 
            title="${escapeHTML(item.title)}" 
            loading="lazy" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
          </iframe>
        </div>
      `;
    }
  }

  const safeLink = sanitizeURL(item.media);
  if (safeLink === "#") return "";

  if (item.category === "shows") {
    return `
      <div style="margin: 8px 0;">
        <a href="${safeLink}" target="_blank" rel="noopener noreferrer" style="font-family: var(--mono); font-size: 12.5px; color: var(--accent); text-decoration: underline; display: inline-flex; align-items: center; gap: 4px;">
          🎬 View Show Details / IMDb ↗
        </a>
      </div>
    `;
  }

  if (item.category === "research") {
    return `
      <div style="margin: 8px 0;">
        <a href="${safeLink}" target="_blank" rel="noopener noreferrer" style="font-family: var(--mono); font-size: 12.5px; color: var(--accent); text-decoration: underline; display: inline-flex; align-items: center; gap: 4px;">
          📄 View Research Repo / Paper Code ↗
        </a>
      </div>
    `;
  }

  return `
    <div style="margin: 8px 0;">
      <a href="${safeLink}" target="_blank" rel="noopener noreferrer" style="font-family: var(--mono); font-size: 12.5px; color: var(--accent); text-decoration: underline; display: inline-flex; align-items: center; gap: 4px;">
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
        <span class="shelf-badge ${escapeHTML(item.category)}">${escapeHTML(item.badge)}</span>
        ${item.rating ? `<span class="shelf-rating">${escapeHTML(item.rating)}</span>` : ''}
      </div>
      <h3 class="shelf-title">${escapeHTML(item.title)}</h3>
      <div class="shelf-meta">${escapeHTML(item.meta)}</div>
      <p class="shelf-summary">${escapeHTML(item.summary)}</p>
      ${renderShelfMedia(item)}
      ${item.content ? `
        <details class="shelf-details">
          <summary>Read full notes & reflections →</summary>
          <div class="shelf-details-body">
            ${escapeHTML(item.content).trim().split("\n\n").map(p => `<p style="margin: 0 0 8px;">${p.replace(/\n/g, "<br>")}</p>`).join("")}
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
      <div class="timeline-header">
        <h3 class="timeline-title">${escapeHTML(item.degree)}</h3>
        <span class="timeline-period">${escapeHTML(item.period)}</span>
      </div>
      <div class="timeline-institution">${escapeHTML(item.institution)} • ${escapeHTML(item.location)}</div>
      <p class="timeline-desc">${escapeHTML(item.focus)}</p>
    </li>
  `).join("");
}

/**
 * Toast Notification System
 */
let toastTimeout;
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
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
  const inviteCloseBtn = document.getElementById("invite-dialog-close");
  const inviteDialog = document.getElementById("invite-dialog");

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

  if (inviteCloseBtn && inviteDialog) {
    inviteCloseBtn.addEventListener("click", () => inviteDialog.close());
  }

  if (copyInviteBtn && inviteLinkInput) {
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
 * Controls opening, closing, backdrop clicks, escape key, and smooth scroll dismissals
 */
function initMobileNav() {
  const triggerBtn = document.getElementById("nav-dropdown-trigger");
  const dropdown = document.getElementById("mobile-dropdown");
  const backdrop = document.getElementById("dropdown-backdrop");
  const navBar = document.querySelector(".nav-bar");
  const btnText = triggerBtn ? triggerBtn.querySelector(".dropdown-btn-text") : null;

  if (!triggerBtn || !dropdown) return;

  const closeDropdown = () => {
    dropdown.setAttribute("hidden", "");
    dropdown.classList.remove("is-open");
    triggerBtn.setAttribute("aria-expanded", "false");
    triggerBtn.classList.remove("active");
    if (btnText) btnText.textContent = "Menu";
    if (navBar) navBar.classList.remove("dropdown-open");
    document.body.classList.remove("dropdown-locked");
  };

  const openDropdown = () => {
    dropdown.removeAttribute("hidden");
    dropdown.classList.add("is-open");
    triggerBtn.setAttribute("aria-expanded", "true");
    triggerBtn.classList.add("active");
    if (btnText) btnText.textContent = "Close";
    if (navBar) navBar.classList.add("dropdown-open");
  };

  triggerBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.contains("is-open") && !dropdown.hasAttribute("hidden");
    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown();
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
    backdrop.addEventListener("click", (e) => {
      e.stopPropagation();
      closeDropdown();
    });
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

  // Close if window resizes to desktop width (> 960px)
  window.addEventListener("resize", () => {
    if (window.innerWidth > 960 && !dropdown.hasAttribute("hidden")) {
      closeDropdown();
    }
  });
}

