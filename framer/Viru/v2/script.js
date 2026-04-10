/* ============================================================
   PORTAVIA — script.js  (v2 complete rewrite)
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
  const ctx    = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  function drawGrain() {
    const w = canvas.width;
    const h = canvas.height;
    const data = ctx.createImageData(w, h);
    const buf  = data.data;
    for (let i = 0; i < buf.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      buf[i]   = v;
      buf[i+1] = v;
      buf[i+2] = v;
      buf[i+3] = 18; // very low alpha so grain is subtle
    }
    ctx.putImageData(data, 0, 0);
  }

  drawGrain();
  setInterval(drawGrain, 80); // ~12 fps refresh creates animated noise
})();

/* ================================================================
   2. DARK / LIGHT THEME TOGGLE
================================================================ */
(function initTheme() {
  const html   = document.documentElement;
  const toggle = $('themeToggle');
  if (!toggle) return;

  // Persist across refresh
  const saved = localStorage.getItem('portavia-theme') || 'dark';
  html.setAttribute('data-theme', saved);

  toggle.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('portavia-theme', next);
  });
  toggle.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') toggle.click();
  });
})();

/* ================================================================
   3. PORTRAIT CARD — fixed, GSAP scroll animation
   Path: hero center → services right (with 3D tilt) → about me right → fade out
================================================================ */
(function initCardAnimation() {
  if (isMobile()) return;

  const card     = $('portraitCard');
  const hero     = $('hero');
  const about    = $('about');

  // Apply perspective for 3D effect
  gsap.set(card, { transformPerspective: 900 });

  /* ── Phase 1: Hero scrolling out → card moves to right, tilts ── */
  gsap.to(card, {
    scrollTrigger: {
      trigger: hero,
      start: 'center center',   // when hero center hits viewport center
      end:   'bottom top',      // when hero bottom leaves viewport top
      scrub: 1.4,
    },
    left:    '70%',
    top:     '44%',
    scale:    0.68,
    rotateY: -13,
    rotateZ:  -5,
    ease:    'power2.inOut',
    // Keep xPercent/yPercent so card centres on the computed left/top
    xPercent: -50,
    yPercent: -50,
  });

  /* ── Phase 2: Services → About: card stays on right, slight re-angle ── */
  gsap.to(card, {
    scrollTrigger: {
      trigger: $('services'),
      start: 'center center',
      end:   'bottom top',
      scrub: 2,
    },
    rotateY: -10,
    rotateZ: -3,
    top: '42%',
    ease: 'power1.inOut',
  });

  /* ── Phase 3: After about, card fades out ── */
  gsap.to(card, {
    scrollTrigger: {
      trigger: about,
      start: 'bottom 65%',
      end:   'bottom top',
      scrub: 1,
    },
    opacity: 0,
    ease: 'none',
  });
})();

/* ================================================================
   4. NAVIGATION MORPH — pill → "Available for work" badge
   Transforms when user scrolls past the hero section
================================================================ */
(function initNavMorph() {
  const navPill   = document.querySelector('.nav__pill');
  const hero      = $('hero');
  if (!navPill || !hero) return;

  const heroHeight = () => hero.offsetHeight;

  const check = () => {
    if (window.scrollY > heroHeight() * 0.65) {
      navPill.classList.add('is-morphed');
    } else {
      navPill.classList.remove('is-morphed');
    }
  };

  window.addEventListener('scroll', check, { passive: true });
  check();
})();

/* ================================================================
   5. ACTIVE NAV LINK — highlight based on scroll position
================================================================ */
(function initActiveNav() {
  const links    = document.querySelectorAll('.nav__link');
  const sectionIds = ['hero', 'about', 'projects', 'testimonials', 'faq', 'blog', 'contact'];
  const sections = sectionIds.map(id => $(id)).filter(Boolean);

  const setActive = (id) => {
    links.forEach(l => {
      const href = l.getAttribute('href').replace('#', '');
      l.classList.toggle('active', href === id);
    });
  };

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
      if (s && window.scrollY >= s.offsetTop - 180) current = s.id;
    });
    setActive(current || 'hero');
  }, { passive: true });
})();

/* ================================================================
   6. MOBILE NAVIGATION BURGER
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
   7. PROJECT STACKING CARDS — scale-down effect as next card covers
================================================================ */
(function initProjectStack() {
  const wrappers = document.querySelectorAll('.ps-wrapper');
  if (!wrappers.length) return;

  wrappers.forEach((wrapper, i) => {
    const card = wrapper.querySelector('.ps-card');
    if (!card) return;

    // As the NEXT wrapper scrolls INTO view over this card, scale + darken it
    ScrollTrigger.create({
      trigger: wrapper,
      start:  'top top+=80',        // when this card sticks
      end:    'bottom top+=80',     // when this card's wrapper is fully consumed
      scrub:  true,
      onUpdate(self) {
        // Only scale once the card is fully stuck and next card is coming in
        // (progress 0.7 → 1.0 = next card sliding over this one)
        if (self.progress > 0.65) {
          const p = (self.progress - 0.65) / 0.35; // 0→1
          const scale      = 1 - p * 0.06;          // 1 → 0.94
          const brightness = 1 - p * 0.35;          // 1 → 0.65
          const borderRad  = 20 + p * 8;            // 20 → 28px (tucks behind)
          gsap.set(card, {
            scale,
            filter:       `brightness(${brightness})`,
            borderRadius: borderRad + 'px',
          });
        } else {
          gsap.set(card, { scale: 1, filter: 'brightness(1)', borderRadius: '20px' });
        }
      }
    });
  });
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
    { threshold: 0.1 }
  );
  els.forEach(el => io.observe(el));
})();

/* ================================================================
   9. COUNTER ANIMATION — count up from 0 when in view
================================================================ */
(function initCounters() {
  const els = document.querySelectorAll('.counter');

  const animate = (el) => {
    const target  = parseInt(el.dataset.target, 10);
    const suffix  = el.dataset.suffix || '';
    const dur     = 1600;
    const start   = performance.now();

    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
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
   10. ACCORDION (services)
================================================================ */
(function initAccordion() {
  const items = document.querySelectorAll('#accordion .accordion__item');
  items.forEach(item => {
    item.querySelector('.accordion__trigger').addEventListener('click', () => {
      const isOpen = item.classList.contains('accordion__item--open');
      items.forEach(i => i.classList.remove('accordion__item--open'));
      if (!isOpen) item.classList.add('accordion__item--open');
    });
  });
})();

/* ================================================================
   11. FAQ ACCORDION
================================================================ */
(function initFaq() {
  const items = document.querySelectorAll('#faqList .faq__item');
  items.forEach(item => {
    item.querySelector('.faq__btn').addEventListener('click', () => {
      const isOpen = item.classList.contains('faq__item--open');
      items.forEach(i => i.classList.remove('faq__item--open'));
      if (!isOpen) item.classList.add('faq__item--open');
    });
  });
})();

/* ================================================================
   12. CONTACT FORM — validation + submit animation
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
      btn.textContent   = 'SENT ✓';
      btn.style.background = 'var(--lime)';
      btn.style.color      = '#111';
      setTimeout(() => {
        btn.textContent      = 'SUBMIT';
        btn.style.background = '';
        btn.style.color      = '';
        inputs.forEach(i => i.value = '');
      }, 3000);
    }
  });
})();

/* ================================================================
   13. PROJECT CARD — entrance stagger
================================================================ */
(function initProjectEntrance() {
  const wrappers = document.querySelectorAll('.ps-wrapper');
  wrappers.forEach((w, i) => {
    const card = w.querySelector('.ps-card');
    if (!card) return;
    gsap.fromTo(card,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 0.7,
        delay: i * 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 90%', once: true },
      }
    );
  });
})();

/* ================================================================
   14. CUSTOM CURSOR (desktop only)
================================================================ */
(function initCursor() {
  if (isMobile()) return;

  const dot = Object.assign(document.createElement('div'), {});
  dot.style.cssText = `
    position:fixed; width:10px; height:10px;
    background:var(--lime); border-radius:50%;
    pointer-events:none; z-index:99999;
    transform:translate(-50%,-50%);
    transition:width .2s,height .2s,opacity .3s;
    mix-blend-mode:difference;
  `;
  const ring = Object.assign(document.createElement('div'), {});
  ring.style.cssText = `
    position:fixed; width:38px; height:38px;
    border:1.5px solid rgba(200,241,53,.45); border-radius:50%;
    pointer-events:none; z-index:99998;
    transform:translate(-50%,-50%);
    transition:width .25s,height .25s,border-color .25s;
  `;
  document.body.append(dot, ring);

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  const moveRing = () => {
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(moveRing);
  };
  moveRing();

  document.querySelectorAll('a,button,.accordion__trigger,.faq__btn,.ps-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.style.width = dot.style.height = '16px';
      ring.style.width = ring.style.height = '54px';
      ring.style.borderColor = 'rgba(200,241,53,.8)';
    });
    el.addEventListener('mouseleave', () => {
      dot.style.width = dot.style.height = '10px';
      ring.style.width = ring.style.height = '38px';
      ring.style.borderColor = 'rgba(200,241,53,.45)';
    });
  });
})();

/* ================================================================
   15. REFRESH on resize
================================================================ */
window.addEventListener('resize', () => {
  ScrollTrigger.refresh();
}, { passive: true });

window.addEventListener('load', () => {
  setTimeout(() => ScrollTrigger.refresh(), 300);
});