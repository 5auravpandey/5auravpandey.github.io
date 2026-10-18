/**
 * Saurav Pandey - Interactive Stack Explorer Component
 * Renders categorized skill matrices and establishes interactive bidirectional links to projects.
 * Cleaned with event delegation and XSS sanitization (Zero inline handlers).
 */
window.PORTFOLIO_STACK_EXPLORER = {
  activeSkill: null,

  init() {
    this.render();
  },

  render() {
    const container = document.getElementById("stack-explorer-content");
    if (!container || !window.PORTFOLIO_SKILLS) return;

    const escape = (str) => typeof window.escapeHTML === "function" ? window.escapeHTML(str) : String(str || "");

    container.innerHTML = `
      <div class="stack-categories-grid">
        ${window.PORTFOLIO_SKILLS.map(cat => `
          <div class="stack-category-block">
            <h3>${escape(cat.category)}</h3>
            <p class="stack-category-desc">${escape(cat.description)}</p>
            <div class="stack-chips">
              ${cat.items.map(skill => `
                <button 
                  type="button" 
                  class="stack-chip ${this.activeSkill?.name === skill.name ? 'active' : ''}" 
                  data-skill="${encodeURIComponent(skill.name)}"
                  aria-pressed="${this.activeSkill?.name === skill.name}">
                  ${escape(skill.name)}
                </button>
              `).join("")}
            </div>
          </div>
        `).join("")}
      </div>

      <div id="stack-focus-banner" class="stack-focus-box ${this.activeSkill ? 'visible' : ''}">
        ${this.renderFocusBanner()}
      </div>
    `;

    this.bindEvents();
  },

  bindEvents() {
    const chips = document.querySelectorAll(".stack-chip");
    chips.forEach(chip => {
      chip.addEventListener("click", () => {
        const skillName = decodeURIComponent(chip.dataset.skill);
        this.toggleSkill(skillName);
      });
    });

    const closeBtn = document.getElementById("btn-close-skill-focus");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        this.activeSkill = null;
        this.render();
      });
    }

    const banner = document.getElementById("stack-focus-banner");
    if (banner) {
      banner.addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-case-study");
        if (btn) {
          const id = btn.dataset.projectId;
          if (id && window.PORTFOLIO_CASE_STUDY) {
            window.PORTFOLIO_CASE_STUDY.open(id, btn);
          }
        }
      });
    }
  },

  toggleSkill(skillName) {
    if (this.activeSkill && this.activeSkill.name === skillName) {
      this.activeSkill = null;
    } else {
      for (const cat of window.PORTFOLIO_SKILLS) {
        const found = cat.items.find(i => i.name === skillName);
        if (found) {
          this.activeSkill = { ...found, category: cat.category };
          break;
        }
      }
    }
    this.render();
  },

  renderFocusBanner() {
    if (!this.activeSkill) return "";

    const escape = (str) => typeof window.escapeHTML === "function" ? window.escapeHTML(str) : String(str || "");
    const related = (this.activeSkill.projects || [])
      .map(id => window.PORTFOLIO_PROJECTS.find(p => p.id === id))
      .filter(Boolean);

    return `
      <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 8px;">
        <span style="font-family: var(--mono); font-size: 14px; font-weight: 500; color: var(--accent);">
          Technology Focus: ${escape(this.activeSkill.name)} (${escape(this.activeSkill.category)})
        </span>
        <button type="button" id="btn-close-skill-focus" style="font-family: var(--mono); font-size: 12px; background: none; border: none; color: var(--muted); cursor: pointer;">[Close / Reset]</button>
      </div>
      <p style="margin: 6px 0 10px; color: var(--ink-secondary); font-size: 15px;">${escape(this.activeSkill.focus)}</p>
      ${related.length > 0 ? `
        <div style="font-size: 14px; color: var(--ink);">
          <strong>Applied in projects:</strong>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px;">
            ${related.map(p => `
              <button 
                type="button" 
                class="btn-case-study" 
                data-project-id="${escape(p.id)}"
                style="background: var(--tint); padding: 4px 10px; border-radius: 4px; text-decoration: none; font-size: 13.5px; border: 1px solid var(--rule-light); cursor: pointer;">
                ${escape(p.title)} ↗
              </button>
            `).join("")}
          </div>
        </div>
      ` : '<div style="font-size: 13.5px; color: var(--muted);">Internal scripting & production workflows.</div>'}
    `;
  }
};
