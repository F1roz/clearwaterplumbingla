/* ==========================================================================
   CLEARWATER PLUMBING — MAIN.JS
   Header behavior, mobile nav, custom cursor, back-to-top, smooth scroll
   ========================================================================== */
(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* ---------- Sticky header ---------- */
  const header = document.querySelector('.site-header');
  const onScroll = () => {
    if (!header) return;
    if (window.scrollY > 40) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');

    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) backToTop.classList.toggle('is-visible', window.scrollY > 600);
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('is-open');
      hamburger.classList.toggle('is-open', open);
      hamburger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileNav.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        mobileNav.classList.remove('is-open');
        hamburger.classList.remove('is-open');
        document.body.style.overflow = '';
      })
    );
  }

  /* ---------- Active nav link ---------- */
  const current = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.main-nav a, .mobile-nav a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  /* ---------- Back to top ---------- */
  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Custom cursor ----------
     Rules:
     - Default state: small dot + transparent outline ring (never fills), so
       text underneath (like nav links) always stays readable.
     - Only true call-to-action elements (marked with [data-cursor], e.g.
       primary buttons) get the filled blue ring with a label like "BOOK" or
       "CALL". Plain text links (nav items, footer links, inline links)
       just get a subtle scale-up of the outline ring — never a fill.
     - Images/cards can opt in to a "VIEW" label via [data-cursor] too.
  ---------------------------------------------------------------------- */
  if (!isTouch && !reducedMotion) {
    document.body.classList.add('cursor-enabled');
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.append(dot, ring);

    let mx = 0, my = 0, rx = 0, ry = 0;
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    });
    (function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    })();

    document.addEventListener('mouseover', (e) => {
      const ctaTarget = e.target.closest('[data-cursor]');
      const isPlainLink = e.target.closest('a, button, .faq-q, .symptom-card, .tab-btn');
      const isDark = e.target.closest('.section-dark, .section-deep, .hero, .emergency-band, .final-cta, .site-footer, .site-header, .mobile-nav');
      ring.classList.toggle('on-dark', !!isDark);

      if (ctaTarget) {
        // Filled ring with a short label — reserved for real CTAs.
        ring.classList.add('is-active');
        ring.classList.remove('is-outline-only');
        ring.textContent = ctaTarget.getAttribute('data-cursor');
      } else if (isPlainLink) {
        // Outline only — grows slightly, stays transparent, never covers text.
        ring.classList.remove('is-active');
        ring.classList.add('is-outline-only');
        ring.textContent = '';
      } else {
        ring.classList.remove('is-active', 'is-outline-only');
        ring.textContent = '';
      }
    });
    document.addEventListener('mouseleave', () => {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    });
  }

  /* ---------- Smart click-to-call ----------
     On desktop, tel: links can get hijacked by locally installed apps
     (e.g. Skype/Teams registering themselves as the tel: handler), which
     unexpectedly launches those apps instead of doing anything useful.
     On desktop we intercept the click, copy the number to the clipboard,
     and show a brief confirmation instead of navigating. On touch devices
     (actual phones) we leave the native tel: behavior alone so it dials
     normally.
  ---------------------------------------------------------------------- */
  if (!isTouch) {
    document.querySelectorAll('.js-call-link').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const number = link.getAttribute('href').replace('tel:', '');
        const finish = (msg) => {
          const toast = document.createElement('div');
          toast.textContent = msg;
          toast.style.cssText =
            'position:fixed;left:50%;bottom:32px;transform:translateX(-50%);' +
            'background:var(--blue-deep);color:#fff;padding:12px 22px;border-radius:999px;' +
            'font-family:var(--font-display);font-weight:700;font-size:0.85rem;z-index:9999;' +
            'box-shadow:0 12px 30px -10px rgba(0,0,0,0.5);opacity:0;transition:opacity .3s ease;';
          document.body.appendChild(toast);
          requestAnimationFrame(() => (toast.style.opacity = '1'));
          setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
          }, 2200);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard
            .writeText(number)
            .then(() => finish(`Copied ${number} — give us a call!`))
            .catch(() => finish(`Call us at ${number}`));
        } else {
          finish(`Call us at ${number}`);
        }
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-stagger, .process-step');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            const fill = entry.target.querySelector('.process-line-fill');
            if (fill) fill.style.width = '100%';
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach((item) => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    if (!q || !a) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      item.closest('.faq-list')?.querySelectorAll('.faq-item.is-open').forEach((openItem) => {
        if (openItem !== item) {
          openItem.classList.remove('is-open');
          openItem.querySelector('.faq-a').style.maxHeight = null;
        }
      });
      item.classList.toggle('is-open', !isOpen);
      a.style.maxHeight = !isOpen ? a.scrollHeight + 'px' : null;
    });
  });

  /* ---------- Symptom cards ---------- */
  document.querySelectorAll('.symptom-card').forEach((card) => {
    card.addEventListener('click', () => {
      card.querySelector('.symptom-detail')?.classList.toggle('is-open');
    });
  });

  /* ---------- Service filter tabs ---------- */
  const tabs = document.querySelectorAll('.tab-btn');
  const filterCards = document.querySelectorAll('[data-category]');
  if (tabs.length && filterCards.length) {
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('is-active'));
        tab.classList.add('is-active');
        const cat = tab.getAttribute('data-filter');
        filterCards.forEach((card) => {
          card.style.display = cat === 'all' || card.getAttribute('data-category') === cat ? '' : 'none';
        });
      });
    });
  }

  /* ---------- Testimonial slider ---------- */
  const track = document.querySelector('.reviews-track');
  if (track) {
    const slides = track.children.length;
    let index = 0;
    const update = () => (track.style.transform = `translateX(-${index * 100}%)`);
    document.querySelector('[data-slider-next]')?.addEventListener('click', () => {
      index = (index + 1) % slides;
      update();
    });
    document.querySelector('[data-slider-prev]')?.addEventListener('click', () => {
      index = (index - 1 + slides) % slides;
      update();
    });
  }

  /* ---------- Smooth scroll for in-page anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      }
    });
  });
})();
