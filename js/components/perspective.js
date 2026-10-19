/**
 * Saurav Pandey - Perspective Switcher Component
 * Switches between 'engineer' (Code & Tech) and 'overview' (Simple Story).
 * Cleaned and unified for static header architecture.
 */
window.PORTFOLIO_PERSPECTIVE = {
  current: "engineer", // 'engineer' | 'overview'

  init() {
    const saved = localStorage.getItem("portfolio_perspective");
    if (saved === "engineer" || saved === "overview" || saved === "executive") {
      this.current = (saved === "executive") ? "overview" : saved;
    } else {
      this.current = "engineer";
    }
    this.bindEvents();
    this.render();
  },

  bindEvents() {
    const engBtn = document.getElementById("btn-perspective-eng");
    const overviewBtn = document.getElementById("btn-perspective-exec");
    const mobileEngBtn = document.getElementById("btn-mobile-eng");
    const mobileOverviewBtn = document.getElementById("btn-mobile-exec");

    if (engBtn) {
      engBtn.addEventListener("click", () => this.setPerspective("engineer"));
    }
    if (overviewBtn) {
      overviewBtn.addEventListener("click", () => this.setPerspective("overview"));
    }
    if (mobileEngBtn) {
      mobileEngBtn.addEventListener("click", () => this.setPerspective("engineer"));
    }
    if (mobileOverviewBtn) {
      mobileOverviewBtn.addEventListener("click", () => this.setPerspective("overview"));
    }
  },

  setPerspective(perspective) {
    if (this.current === perspective) return;
    this.current = perspective;
    try {
      localStorage.setItem("portfolio_perspective", perspective);
    } catch (e) {}

    const targetHeading = document.getElementById("hero-role");
    if (window.PORTFOLIO_TRANSITIONS) {
      window.PORTFOLIO_TRANSITIONS.transition(() => {
        this.render();
      }, targetHeading);
    } else {
      this.render();
    }
  },

  render() {
    const profile = window.PORTFOLIO_PROFILE;
    if (!profile) return;
    const config = profile.perspectives[this.current] || profile.perspectives.engineer;

    // 1. Update button states (Desktop and Mobile)
    const engBtn = document.getElementById("btn-perspective-eng");
    const overviewBtn = document.getElementById("btn-perspective-exec");
    const mobileEngBtn = document.getElementById("btn-mobile-eng");
    const mobileOverviewBtn = document.getElementById("btn-mobile-exec");
    const mobileLabel = document.getElementById("mobile-perspective-label");

    if (engBtn) {
      engBtn.setAttribute("aria-pressed", this.current === "engineer");
      engBtn.classList.toggle("active", this.current === "engineer");
    }
    if (overviewBtn) {
      overviewBtn.setAttribute("aria-pressed", this.current === "overview");
      overviewBtn.classList.toggle("active", this.current === "overview");
    }
    if (mobileEngBtn) {
      mobileEngBtn.setAttribute("aria-pressed", this.current === "engineer");
      mobileEngBtn.classList.toggle("active", this.current === "engineer");
    }
    if (mobileOverviewBtn) {
      mobileOverviewBtn.setAttribute("aria-pressed", this.current === "overview");
      mobileOverviewBtn.classList.toggle("active", this.current === "overview");
    }
    if (mobileLabel) {
      mobileLabel.textContent = config.label;
    }

    // 2. Update Hero
    const heroRole = document.getElementById("hero-role");
    const heroSubtitle = document.getElementById("hero-subtitle");
    const heroBio = document.getElementById("hero-bio");

    if (heroRole) heroRole.textContent = config.role;
    if (heroSubtitle) heroSubtitle.textContent = config.tagline;
    if (heroBio) heroBio.textContent = config.bio;

    // 3. Update Pillars
    const pillarsContainer = document.getElementById("hero-pillars");
    if (pillarsContainer) {
      pillarsContainer.innerHTML = config.keyPillars.map(p => `
        <div class="pillar-card">
          <h3>${typeof window.escapeHTML === "function" ? window.escapeHTML(p.title) : p.title}</h3>
          <p>${typeof window.escapeHTML === "function" ? window.escapeHTML(p.desc) : p.desc}</p>
        </div>
      `).join("");
    }

    // 4. Update Project Cards
    this.updateProjectCardLenses();
  },

  updateProjectCardLenses() {
    const cards = document.querySelectorAll(".project-card");
    cards.forEach(card => {
      const projectId = card.dataset.id;
      const project = window.PORTFOLIO_PROJECTS.find(p => p.id === projectId);
      if (!project) return;

      const lensBox = card.querySelector(".project-lens-content");
      const lensLabel = card.querySelector(".project-lens-label");
      if (!lensBox || !lensLabel) return;

      if (this.current === "engineer") {
        lensLabel.textContent = "Under the Hood:";
        lensBox.textContent = project.whyBuilt;
      } else {
        lensLabel.textContent = "Story & Purpose:";
        lensBox.textContent = project.simpleStory;
      }
    });
  }
};
