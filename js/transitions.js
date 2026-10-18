/**
 * Saurav Pandey - Transitions Manager
 * Progressive enhancement wrapper around native document.startViewTransition()
 * Conforming to modern-web-guidance for same-document transitions and accessibility routing.
 */
window.PORTFOLIO_TRANSITIONS = {
  /**
   * Executes a DOM update with a View Transition if supported.
   * Preserves focus and supports fallback for older browsers.
   * 
   * @param {Function} updateDomCallback - Callback that updates DOM state
   * @param {HTMLElement|null} focusTarget - Element to receive focus after transition
   * @returns {Promise<void>}
   */
  async transition(updateDomCallback, focusTarget = null) {
    // Check for user reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Fallback: If not supported or user prefers reduced motion, update DOM immediately
    if (!document.startViewTransition || prefersReducedMotion) {
      updateDomCallback();
      if (focusTarget) {
        focusTarget.focus();
      }
      return;
    }

    try {
      const transition = document.startViewTransition(() => {
        updateDomCallback();
      });

      // Route focus after view transition finishes to preserve context for assistive technology
      await transition.finished;
      if (focusTarget && typeof focusTarget.focus === 'function') {
        focusTarget.focus();
      }
    } catch (err) {
      // Graceful fallback if transition encounters DOM exception
      updateDomCallback();
      if (focusTarget) {
        focusTarget.focus();
      }
    }
  }
};
