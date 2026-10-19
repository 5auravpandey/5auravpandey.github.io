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
  if (window.PORTFOLIO_COMMAND_PALETTE) window.PORTFOLIO_COMMAND_PALETTE.init();
  initAdminLazyLoader();

  // 8. Initialize Clipboard, Print CV & Utility Actions
  initUtilities();

  // 9. Initialize Interactive Card Spotlight
  initCardSpotlight();

  // 10. Initialize Mobile Navigation Dropdown Menu
  initMobileNav();

  // 11. Initialize Global Unified Auth UI (Navbar Pills & Status)
  initGlobalAuthUI();
});

/**
 * Dynamic On-Demand Lazy Loader for Admin Studio
 * Zero impact on visitor load time (saves ~51KB from critical path)
 */
let adminLoadPromise = null;
function loadAdminStudio(autoOpen = true) {
  if (window.PORTFOLIO_ADMIN) {
    if (autoOpen) window.PORTFOLIO_ADMIN.open();
    return Promise.resolve(window.PORTFOLIO_ADMIN);
  }
  if (!adminLoadPromise) {
    adminLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "js/components/admin.js";
      script.defer = true;
      script.onload = () => {
        if (window.PORTFOLIO_ADMIN) {
          window.PORTFOLIO_ADMIN.init();
          if (autoOpen) window.PORTFOLIO_ADMIN.open();
          resolve(window.PORTFOLIO_ADMIN);
        } else {
          reject(new Error("Admin studio failed to load"));
        }
      };
      script.onerror = (err) => {
        adminLoadPromise = null;
        reject(err);
      };
      document.body.appendChild(script);
    });
  } else {
    adminLoadPromise.then(() => {
      if (autoOpen && window.PORTFOLIO_ADMIN) window.PORTFOLIO_ADMIN.open();
    });
  }
  return adminLoadPromise;
}
window.loadAdminStudio = loadAdminStudio;

function initAdminLazyLoader() {
  // Silent background pre-load only if an active admin session is already present
  const hasActiveSession = !!sessionStorage.getItem("portfolio_admin_session_v2");
  if (hasActiveSession) {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(() => loadAdminStudio(false), { timeout: 3000 });
    } else {
      setTimeout(() => loadAdminStudio(false), 2000);
    }
  }
}

/**
 * Dark / Light Theme Manager with View Transition Circular Reveal
 */
function initTheme() {
  const root = document.documentElement;
  const themeBtn = document.getElementById("theme-toggle-btn");
  const mobileThemeBtn = document.getElementById("mobile-theme-btn");
  const metaTheme = document.getElementById("meta-theme-color");
  
  const savedTheme = localStorage.getItem("portfolio_theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialTheme = savedTheme || (prefersDark ? "dark" : "light");

  setTheme(initialTheme);

  function handleThemeToggle(e) {
    const current = root.getAttribute("data-theme") || "light";
    const next = current === "dark" ? "light" : "dark";

    const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || isReducedMotion) {
      setTheme(next);
      return;
    }

    const x = e ? e.clientX : window.innerWidth / 2;
    const y = e ? e.clientY : 0;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      setTheme(next);
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`
          ]
        },
        {
          duration: 380,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)"
        }
      );
    });
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", (e) => handleThemeToggle(e));
  }

  if (mobileThemeBtn) {
    mobileThemeBtn.addEventListener("click", (e) => handleThemeToggle(e));
  }

  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    const isDark = theme === "dark";
    if (themeBtn) {
      themeBtn.innerHTML = `<span class="theme-icon">${isDark ? "☀️" : "🌙"}</span><span class="theme-text">${isDark ? "Light" : "Dark"}</span>`;
      themeBtn.setAttribute("aria-pressed", isDark);
      themeBtn.setAttribute("title", isDark ? "Switch to Light mode" : "Switch to Dark mode");
    }
    if (mobileThemeBtn) {
      mobileThemeBtn.innerHTML = `<span class="mobile-theme-icon">${isDark ? "☀️" : "🌙"}</span>`;
      mobileThemeBtn.setAttribute("aria-label", isDark ? "Switch to Light mode" : "Switch to Dark mode");
      mobileThemeBtn.setAttribute("title", isDark ? "Switch to Light mode" : "Switch to Dark mode");
    }
    if (metaTheme) {
      metaTheme.setAttribute("content", isDark ? "#121214" : "#ffffff");
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
    // YouTube music or focus video embed (strict 11-char video ID)
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
    grid.innerHTML = `
      <div class="empty-shelf-state" style="grid-column: 1 / -1; padding: 48px 24px; text-align: center; border: 1px dashed var(--rule); border-radius: var(--radius-md); background: var(--surface);">
        <span style="font-size: 32px; display: block; margin-bottom: 10px;">📚</span>
        <h3 style="font-size: 17px; margin: 0 0 8px; font-weight: 600;">Archive Entries Coming Soon</h3>
        <p style="color: var(--muted); font-size: 13.5px; max-width: 440px; margin: 0 auto; line-height: 1.55;">
          Curations, research findings, reading notes, and personal playlists will be published here upon website completion.
        </p>
      </div>
    `;
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

  if (inviteDialog) {
    inviteDialog.addEventListener("click", (e) => {
      if (e.target === inviteDialog) {
        inviteDialog.close();
      }
    });
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
 * Card Mouse-Tracking Spotlight Glow (Desktop & Fine Pointer Only)
 */
function initCardSpotlight() {
  if (window.matchMedia("(pointer: coarse)").matches) return;
  document.addEventListener("pointermove", (e) => {
    const card = e.target.closest(".project-card, .shelf-card, .spotlight-card, .pillar-card, .contact-card, .playground-card");
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  }, { passive: true });
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

/**
 * Global Unified Auth & Account Center Controller
 */
function initGlobalAuthUI() {
  const desktopAuthBtn = document.getElementById("btn-global-auth");
  const mobileAuthBtn = document.getElementById("btn-mobile-auth");
  const globalLabel = document.getElementById("global-auth-label");
  const mobileLabel = document.getElementById("mobile-auth-label");

  function updateAuthUI(session) {
    if (session) {
      const handle = session.telegramId || session.username || "Account";
      const displayShort = handle.length > 14 ? handle.slice(0, 12) + "…" : handle;
      if (globalLabel) globalLabel.textContent = displayShort;
      if (mobileLabel) mobileLabel.textContent = `✈️ ${handle} (${session.daysRemaining !== undefined ? session.daysRemaining : 7}d left)`;
      if (desktopAuthBtn) {
        desktopAuthBtn.title = `Connected: ${handle} (${session.displayName}) • Click for Account Center`;
        desktopAuthBtn.classList.add("authenticated");
      }
      if (mobileAuthBtn) {
        mobileAuthBtn.classList.add("authenticated");
      }
    } else {
      if (globalLabel) globalLabel.textContent = "Login";
      if (mobileLabel) mobileLabel.textContent = "✈️ Connect Telegram / Account";
      if (desktopAuthBtn) {
        desktopAuthBtn.title = "Unified Account Center & Telegram Login";
        desktopAuthBtn.classList.remove("authenticated");
      }
      if (mobileAuthBtn) {
        mobileAuthBtn.classList.remove("authenticated");
      }
    }
  }

  const openAuth = () => {
    if (window.PORTFOLIO_AUTH && typeof window.PORTFOLIO_AUTH.openLoginDialog === "function") {
      window.PORTFOLIO_AUTH.openLoginDialog();
    }
  };

  if (desktopAuthBtn) desktopAuthBtn.addEventListener("click", openAuth);
  if (mobileAuthBtn) mobileAuthBtn.addEventListener("click", openAuth);

  // Initial state check
  if (window.PORTFOLIO_AUTH && typeof window.PORTFOLIO_AUTH.getSession === "function") {
    updateAuthUI(window.PORTFOLIO_AUTH.getSession());
  }

  // Real-time listener
  window.addEventListener("portfolio:auth-changed", (e) => {
    updateAuthUI(e.detail);
  });
}


