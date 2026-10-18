/**
 * Saurav Pandey - Case Study Dialog Modal Component
 * Displays deep architectural blueprints, trade-offs, and data flow diagrams.
 * Accessible native <dialog> with focus trap and return.
 */
window.PORTFOLIO_CASE_STUDY = {
  dialog: null,
  lastFocusedElement: null,

  init() {
    this.dialog = document.getElementById("case-study-dialog");
    if (!this.dialog) return;

    this.bindEvents();
  },

  bindEvents() {
    // Close button click
    const closeBtn = document.getElementById("dialog-close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.close());
    }

    // Backdrop click close
    this.dialog.addEventListener("click", (e) => {
      const rect = this.dialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        this.close();
      }
    });

    // Native Esc key handling is built-in with showModal(), but sync focus return
    this.dialog.addEventListener("close", () => {
      if (this.lastFocusedElement && typeof this.lastFocusedElement.focus === 'function') {
        this.lastFocusedElement.focus();
      }
    });
  },

  open(projectId, triggerElement = null) {
    if (!this.dialog) return;
    const project = window.PORTFOLIO_PROJECTS.find(p => p.id === projectId);
    if (!project) return;

    this.lastFocusedElement = triggerElement || document.activeElement;

    // Populate Dialog Content
    const titleEl = document.getElementById("dialog-project-title");
    const badgeEl = document.getElementById("dialog-project-badge");
    const contentEl = document.getElementById("dialog-project-body");
    const githubLink = document.getElementById("dialog-github-link");

    if (titleEl) titleEl.textContent = project.title;
    if (badgeEl) badgeEl.textContent = project.badge || project.category.toUpperCase();

    if (githubLink) {
      githubLink.href = project.github;
      githubLink.style.display = project.github ? "inline-flex" : "none";
    }

    if (contentEl) {
      contentEl.innerHTML = `
        <div class="dialog-section">
          <h4>Project Summary</h4>
          <p>${project.tagline}</p>
        </div>

        <div class="dialog-section">
          <h4>How It Works (Architecture Blueprint)</h4>
          ${project.architectureDiagram ? `
            <div class="diagram-container">${project.architectureDiagram.trim()}</div>
          ` : '<p>Modular software architecture.</p>'}
        </div>

        <div class="dialog-section">
          <h4>The Story Behind It</h4>
          <p>${project.simpleStory}</p>
        </div>

        <div class="dialog-section">
          <h4>Why I Built It & What I Learned</h4>
          <p>${project.whyBuilt}</p>
          ${project.highlights ? `
            <ul style="margin: 10px 0 0; padding-left: 20px;">
              ${project.highlights.map(h => `<li style="margin-bottom: 4px;">${h}</li>`).join("")}
            </ul>
          ` : ''}
        </div>

        <div class="dialog-section">
          <h4>Technologies Used</h4>
          <div class="project-tags">
            ${project.tags.map(t => `<span class="project-tag">${t}</span>`).join("")}
          </div>
        </div>
      `;
    }

    // Open modal
    this.dialog.showModal();
    const closeBtn = document.getElementById("dialog-close-btn");
    if (closeBtn) closeBtn.focus();
  },

  close() {
    if (this.dialog && this.dialog.open) {
      this.dialog.close();
    }
  }
};
