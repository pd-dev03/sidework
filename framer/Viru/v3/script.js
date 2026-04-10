/* ============================================================
   PORTAVIA — script.js  (v3 — full portfolio rewrite)
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

/* ── helpers ────────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

/* ================================================================
   1. CANVAS GRAIN — animated noise texture
================================================================ */
(function initGrain() {
  const canvas = $('grainCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  function drawGrain() {
    const w = canvas.width, h = canvas.height;
    const data = ctx.createImageData(w, h);
    const buf  = data.data;
    for (let i = 0; i < buf.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      buf[i] = buf[i+1] = buf[i+2] = v;
      buf[i+3] = 16;
    }
    ctx.putImageData(data, 0, 0);
  }

  drawGrain();
  setInterval(drawGrain, 80);
})();

/* ================================================================
   2. DARK / LIGHT THEME TOGGLE
================================================================ */
(function initTheme() {
  const html   = document.documentElement;
  const toggle = $('themeToggle');
  if (!toggle) return;

  const saved = localStorage.getItem('portavia-theme') || 'dark';
  html.setAttribute('data-theme', saved);

  const apply = (theme) => {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('portavia-theme', theme);
  };

  toggle.addEventListener('click', () => {
    apply(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });
  toggle.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') toggle.click();
  });
})();

/* ================================================================
   3. PORTRAIT CARD — GSAP scroll animation (desktop only)
   Phase 1: Hero → card moves right + tilts (travels to about section area)
   Phase 2: About section → card grows + repositions right
   Phase 3: After about → card fades out
================================================================ */
(function initCardAnimation() {
  if (isMobile()) return;

  const card  = $('portraitCard');
  const hero  = $('hero');
  const about = $('about');

  if (!card || !hero || !about) return;

  gsap.set(card, { transformPerspective: 900, xPercent: -50, yPercent: -50 });

  /* Phase 1: Hero scrolling out → card drifts to right, gentle tilt */
  gsap.to(card, {
    scrollTrigger: {
      trigger: hero,
      start: 'center center',
      end:   'bottom top',
      scrub: 1.6,
    },
    left:    '72%',
    top:     '46%',
    scale:    0.72,
    rotateY: -12,
    rotateZ: -4,
    ease:    'power2.inOut',
  });

  /* Phase 2: Services/About → card settles, slight angle correction */
  gsap.to(card, {
    scrollTrigger: {
      trigger: about,
      start: 'top 70%',
      end:   'center center',
      scrub: 1.8,
    },
    scale:    0.88,
    rotateY:  -8,
    rotateZ:  -2,
    top:      '44%',
    left:     '74%',
    ease:    'power1.inOut',
  });

  /* Phase 3: After about → card fades away before projects */
  gsap.to(card, {
    scrollTrigger: {
      trigger: about,
      start: 'bottom 60%',
      end:   'bottom top',
      scrub: 1,
    },
    opacity: 0,
    scale:   0.80,
    ease:   'power1.in',
  });
})();

/* ================================================================
   4. MOBILE HERO CARD — on-scroll fade out
   The mobile card fades as user scrolls past hero
================================================================ */
(function initMobileHeroCard() {
  if (!isMobile()) return;

  const mobileCard = $('heroMobileCard');
  const hero       = $('hero');
  if (!mobileCard || !hero) return;

  // Use IntersectionObserver for performance on mobile
  const io = new IntersectionObserver(
    ([entry]) => {
      if (entry.intersectionRatio < 0.4) {
        mobileCard.classList.add('scrolled-out');
      } else {
        mobileCard.classList.remove('scrolled-out');
      }
    },
    { threshold: [0, 0.4, 1] }
  );
  io.observe(hero);

  // Also use scroll for smooth animation
  const heroH = () => hero.offsetHeight;
  window.addEventListener('scroll', () => {
    const progress = window.scrollY / (heroH() * 0.6);
    if (progress > 0.7) {
      mobileCard.classList.add('scrolled-out');
    } else {
      mobileCard.classList.remove('scrolled-out');
    }
  }, { passive: true });
})();

/* ================================================================
   5. NAV MORPH — pill → "Available for work" badge
================================================================ */
(function initNavMorph() {
  const navPill = document.querySelector('.nav__pill');
  const hero    = $('hero');
  if (!navPill || !hero) return;

  const check = () => {
    const morphed = window.scrollY > hero.offsetHeight * 0.6;
    navPill.classList.toggle('is-morphed', morphed);
  };

  window.addEventListener('scroll', check, { passive: true });
  check();
})();

/* ================================================================
   6. ACTIVE NAV LINK
================================================================ */
(function initActiveNav() {
  const links      = document.querySelectorAll('.nav__link');
  const sectionIds = ['hero','about','education','experience','projects','skills','contact'];
  const sections   = sectionIds.map(id => $(id)).filter(Boolean);

  const setActive = (id) => {
    links.forEach(l => {
      const href = l.getAttribute('href').replace('#', '');
      l.classList.toggle('active', href === id);
    });
  };

  window.addEventListener('scroll', () => {
    let current = 'hero';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 200) current = s.id;
    });
    setActive(current);
  }, { passive: true });
})();

/* ================================================================
   7. MOBILE NAV BURGER
================================================================ */
(function initMobileNav() {
  const burger = $('navBurger');
  const menu   = $('mobileMenu');
  if (!burger || !menu) return;

  const spans = burger.querySelectorAll('span');
  let open = false;

  const toggle = () => {
    open = !open;
    if (open) {
      menu.style.display = 'block';
      requestAnimationFrame(() => menu.classList.add('open'));
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      menu.classList.remove('open');
      setTimeout(() => { if (!open) menu.style.display = 'none'; }, 380);
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  };

  burger.addEventListener('click', toggle);
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { if (open) toggle(); }));
})();

/* ================================================================
   8. SECTION REVEAL — IntersectionObserver fade-in
================================================================ */
(function initReveal() {
  const els = document.querySelectorAll('.section-reveal');
  const io  = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
    }),
    { threshold: 0.08 }
  );
  els.forEach(el => io.observe(el));
})();

/* ================================================================
   9. TIMELINE ITEMS — staggered reveal
================================================================ */
(function initTimelineReveal() {
  const items = document.querySelectorAll('.timeline__item');
  const io = new IntersectionObserver(
    entries => entries.forEach((e, idx) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('in-view'), idx * 80);
        io.unobserve(e.target);
      }
    }),
    { threshold: 0.1 }
  );
  items.forEach(el => io.observe(el));
})();

/* ================================================================
   10. COUNTER ANIMATION
================================================================ */
(function initCounters() {
  const els = document.querySelectorAll('.counter');

  const animate = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const dur    = 1600;
    const start  = performance.now();

    const tick = (now) => {
      const p     = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); }
    }),
    { threshold: 0.5 }
  );
  els.forEach(el => io.observe(el));
})();

/* ================================================================
   11. SKILL BARS — animate width when in view
================================================================ */
(function initSkillBars() {
  const fills = document.querySelectorAll('.skill-bar__fill');
  const io = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        const w = e.target.dataset.width;
        e.target.style.width = w + '%';
        io.unobserve(e.target);
      }
    }),
    { threshold: 0.3 }
  );
  fills.forEach(el => io.observe(el));
})();

/* ================================================================
   12. PROJECTS — Pinned slide-up stacking (desktop only)
   Card 1 sits in view. Cards 2,3,4 slide up from bottom as you scroll.
   Each card slides over the previous one. On scroll-up they reverse.
================================================================ */
(function initProjectStack() {
  if (isMobile()) return;

  const stage = document.getElementById('pssStage');
  const pinArea = document.getElementById('pssPinArea');
  if (!stage || !pinArea) return;

  const cards = Array.from(stage.querySelectorAll('.pss-card'));
  const total = cards.length;
  if (total < 2) return;

  // Build progress dots
  const dotsEl = document.createElement('div');
  dotsEl.className = 'pss-dots';
  cards.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'pss-dot' + (i === 0 ? ' active' : '');
    dotsEl.appendChild(dot);
  });
  stage.appendChild(dotsEl);
  const dots = dotsEl.querySelectorAll('.pss-dot');

  const setActiveDot = (idx) => {
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  };

  // Cards 2..N start below (translateY 100%)
  cards.forEach((card, i) => {
    if (i > 0) gsap.set(card, { yPercent: 100 });
  });

  // Pin the stage and create scroll-driven slides
  // Total scroll = (n-1) card transitions × some scroll distance each
  const scrollPerCard = window.innerHeight;
  const totalScroll   = scrollPerCard * (total - 1);

  // Set the pin-area height to allow that much scroll
  pinArea.style.height = (window.innerHeight + totalScroll) + 'px';

  let activeCard = 0;

  ScrollTrigger.create({
    trigger:  pinArea,
    start:    'top top',
    end:      `+=${totalScroll}`,
    pin:      stage,
    scrub:    1,
    onUpdate(self) {
      const progress   = self.progress; // 0 → 1
      const cardFloat  = progress * (total - 1); // 0 → (total-1)
      const cardIndex  = Math.floor(cardFloat);
      const cardProgress = cardFloat - cardIndex; // 0 → 1 within each transition

      // Reset all cards
      cards.forEach((card, i) => {
        if (i === 0) {
          // Card 0 scales down as card 1 covers it
          if (cardIndex === 0) {
            const p = cardProgress;
            gsap.set(card, {
              scale:  1 - p * 0.06,
              filter: `brightness(${1 - p * 0.3})`,
            });
          } else {
            gsap.set(card, { scale: 0.94, filter: 'brightness(0.7)' });
          }
        } else if (i <= cardIndex) {
          // Cards that have already slid in — fully visible and scaled
          gsap.set(card, { yPercent: 0, scale: 1, filter: 'brightness(1)' });

          // Scale down as the next card comes in
          if (i === cardIndex && cardIndex < total - 1) {
            const p = cardProgress;
            gsap.set(card, {
              scale:  1 - p * 0.06,
              filter: `brightness(${1 - p * 0.3})`,
            });
          }
        } else if (i === cardIndex + 1) {
          // The incoming card
          gsap.set(card, {
            yPercent: 100 - cardProgress * 100,
            scale: 1,
            filter: 'brightness(1)',
          });
        } else {
          // Future cards — waiting below
          gsap.set(card, { yPercent: 100, scale: 1, filter: 'brightness(1)' });
        }
      });

      // Update active dot
      const visibleCard = Math.min(Math.round(cardFloat), total - 1);
      if (visibleCard !== activeCard) {
        activeCard = visibleCard;
        setActiveDot(activeCard);
      }
    }
  });
})();

/* ================================================================
   13. CONTACT FORM — validation + submit animation
================================================================ */
(function initContactForm() {
  const btn = $('contactSubmit');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const inputs = document.querySelectorAll('.c-input, .c-textarea');
    let valid = true;

    inputs.forEach(inp => {
      const empty = !inp.value.trim();
      inp.style.borderColor = empty ? 'rgba(255,80,80,0.55)' : '';
      if (empty) valid = false;
    });

    if (valid) {
      const orig = btn.textContent;
      btn.textContent     = 'SENT ✓';
      btn.style.background = 'var(--lime)';
      btn.style.color      = '#111';
      setTimeout(() => {
        btn.textContent      = orig;
        btn.style.background = '';
        btn.style.color      = '';
        inputs.forEach(i => i.value = '');
      }, 3000);
    }
  });
})();

/* ================================================================
   14. CUSTOM CURSOR (desktop only)
================================================================ */
(function initCursor() {
  if (isMobile()) return;

  const dot  = document.createElement('div');
  const ring = document.createElement('div');

  dot.style.cssText = `
    position:fixed; width:10px; height:10px;
    background:var(--lime); border-radius:50%;
    pointer-events:none; z-index:99999;
    transform:translate(-50%,-50%);
    transition:width .18s,height .18s,opacity .3s;
    mix-blend-mode:difference;
  `;
  ring.style.cssText = `
    position:fixed; width:38px; height:38px;
    border:1.5px solid rgba(200,241,53,.4); border-radius:50%;
    pointer-events:none; z-index:99998;
    transform:translate(-50%,-50%);
    transition:width .22s,height .22s,border-color .22s;
  `;
  document.body.append(dot, ring);

  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
  });

  const moveRing = () => {
    rx += (mx - rx) * 0.11; ry += (my - ry) * 0.11;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(moveRing);
  };
  moveRing();

  const enlarge  = () => {
    dot.style.width = dot.style.height = '16px';
    ring.style.width = ring.style.height = '52px';
    ring.style.borderColor = 'rgba(200,241,53,.8)';
  };
  const restore = () => {
    dot.style.width = dot.style.height = '10px';
    ring.style.width = ring.style.height = '38px';
    ring.style.borderColor = 'rgba(200,241,53,.4)';
  };

  document.querySelectorAll('a,button,.timeline__content,.pss-card,.tool-tag,.lang-item,.interest-item').forEach(el => {
    el.addEventListener('mouseenter', enlarge);
    el.addEventListener('mouseleave', restore);
  });
})();

/* ================================================================
   15. TOOL TAGS — staggered entrance
================================================================ */
(function initToolTags() {
  const tags = document.querySelectorAll('.tool-tag');
  const io   = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        const idx = [...tags].indexOf(e.target);
        e.target.style.transitionDelay = (idx * 40) + 'ms';
        e.target.style.opacity  = '1';
        e.target.style.transform = 'translateY(0)';
        io.unobserve(e.target);
      }
    }),
    { threshold: 0.2 }
  );
  tags.forEach(el => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(12px)';
    el.style.transition = 'opacity 0.4s ease, transform 0.4s ease, border-color 0.2s, background 0.2s';
    io.observe(el);
  });
})();

/* ================================================================
   16. INTERESTS + LANG ITEMS — staggered entrance
================================================================ */
(function initGridEntrance() {
  const items = document.querySelectorAll('.interest-item, .lang-item');
  const io    = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        const idx = [...items].indexOf(e.target);
        setTimeout(() => {
          e.target.style.opacity   = '1';
          e.target.style.transform = 'translateY(0) scale(1)';
        }, idx * 55);
        io.unobserve(e.target);
      }
    }),
    { threshold: 0.1 }
  );
  items.forEach(el => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(16px) scale(0.96)';
    el.style.transition = 'opacity 0.45s ease, transform 0.45s ease, border-color 0.2s';
    io.observe(el);
  });
})();

/* ================================================================
   17. RESIZE handler
================================================================ */
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => ScrollTrigger.refresh(), 250);
}, { passive: true });

window.addEventListener('load', () => {
  setTimeout(() => ScrollTrigger.refresh(), 400);
});