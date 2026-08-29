/* ==========================================================================
   CLEARWATER PLUMBING — ANIMATIONS.JS
   Magnetic buttons, staggered process line, subtle parallax
   ========================================================================== */
(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  if (reducedMotion || isTouch) return;

  /* ---------- Magnetic button effect ---------- */
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.12}px, ${y * 0.3}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  /* ---------- Subtle hero parallax ---------- */
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    window.addEventListener(
      'scroll',
      () => {
        const y = window.scrollY;
        if (y < window.innerHeight) {
          heroBg.style.transform = `translateY(${y * 0.25}px) scale(1.05)`;
        }
      },
      { passive: true }
    );
  }
})();
