/**
 * Saurav Pandey - Perspective State
 * Default engineering perspective with backward-compatibility for lenses and transitions.
 */
window.PORTFOLIO_PERSPECTIVE = {
  current: "engineer",

  init() {
    this.current = "engineer";
  },

  setPerspective(perspective) {
    this.current = perspective || "engineer";
  },

  render() {
    // Hero, pillars, and profile are statically rendered in the HTML for fast First Contentful Paint.
  }
};
