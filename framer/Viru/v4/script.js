/* ============================================================
   PORTAVIA PORTFOLIO — script.js (final)
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

/* ── Utility ────────────────────────────────────────────────── */
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

/* ================================================================
   1. CANVAS GRAIN — animated noise
================================================================ */
(function initGrain() {
  const canvas = document.getElementById('grainCanvas');
  const ctx    = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  let last = 0;
  function drawGrain(ts) {
    if (ts - last < 80) { requestAnimationFrame(drawGrain); return; }
    last = ts;
    const w = canvas.width, h = canvas.height;
    const img = ctx.createImageData(w, h);
    const d   = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      d[i] = d[i+1] = d[i+2] = v;
      d[i+3] = 16;
    }
    ctx.putImageData(img, 0, 0);
    requestAnimationFrame(drawGrain);
  }
  requestAnimationFrame(drawGrain);
})();

/* ================================================================
   2. THEME TOGGLE
================================================================ */
(function initTheme() {
  const html   = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;
  const saved = localStorage.getItem('pv-theme') || 'dark';
  html.setAttribute('data-theme', saved);
  toggle.addEventListener('click', () => {
    const n = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', n);
    localStorage.setItem('pv-theme', n);
  });
  toggle.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') toggle.click(); });
})();

/* ================================================================
   3. NAV — scroll-direction detection
   Scroll DOWN  → shrink pill to "Available for work" badge
   Scroll UP    → expand pill back to full navigation
   At very top  → always show full navigation
================================================================ */
(function initNav() {
  const pill  = document.getElementById('navPill');
  if (!pill) return;

  const hero       = document.getElementById('hero');
  let lastY        = 0;
  let rafPending   = false;
  const THRESHOLD  = 60; // px before we start reacting

  function update() {
    const y   = window.scrollY;
    const dir = y > lastY ? 'down' : 'up';
    lastY     = y;

    if (y < THRESHOLD) {
      // Always show full nav at the very top
      pill.classList.remove('is-badge');
    } else if (dir === 'down') {
      pill.classList.add('is-badge');
    } else {
      pill.classList.remove('is-badge');
    }
    rafPending = false;
  }

  window.addEventListener('scroll', () => {
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
})();

/* ================================================================
   4. ACTIVE NAV LINK
================================================================ */
(function initActiveLink() {
  const links      = $$('.nav__link');
  const sectionIds = ['hero','about','education','experience','projects','skills','interests','languages','contact'];
  const sections   = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

  const setActive = id => {
    links.forEach(l => {
      const href = l.getAttribute('href').replace('#','');
      l.classList.toggle('active', href === id);
    });
  };

  window.addEventListener('scroll', () => {
    let cur = '';
    sections.forEach(s => { if (s && window.scrollY >= s.offsetTop - 200) cur = s.id; });
    setActive(cur || 'hero');
  }, { passive: true });
})();

/* ================================================================
   5. MOBILE NAV BURGER
================================================================ */
(function initBurger() {
  const btn  = document.getElementById('navBurger');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;
  const bars = btn.querySelectorAll('span');
  let open   = false;

  const toggle = () => {
    open = !open;
    if (open) {
      menu.style.display = 'block';
      requestAnimationFrame(() => menu.classList.add('open'));
      bars[0].style.transform = 'translateY(7px) rotate(45deg)';
      bars[1].style.opacity   = '0';
      bars[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      menu.classList.remove('open');
      setTimeout(() => { if (!open) menu.style.display = 'none'; }, 360);
      bars.forEach(b => { b.style.transform = ''; b.style.opacity = ''; });
    }
  };
  btn.addEventListener('click', toggle);
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { if (open) toggle(); }));
})();

/* ================================================================
   6. PORTRAIT CARD — GSAP scroll animation
   Phase 1: Hero exit → card travels right, tilts 3D
   Phase 2: About Me → card grows, settles right side
   Phase 3: About Me exit → card fades out COMPLETELY
   No animation beyond About Me section
================================================================ */
(function initCardAnimation() {
  if (isMobile()) return;

  const card  = document.getElementById('portraitCard');
  const hero  = document.getElementById('hero');
  const about = document.getElementById('about');
  if (!card || !hero || !about) return;

  // Lock card in 3D space
  gsap.set(card, {
    left: '50%',
    top:  '50%',
    xPercent: -50,
    yPercent: -50,
    transformPerspective: 1000,
    transformOrigin: 'center center',
  });

  /* ── Phase 1: Hero scrolls away → card moves right with tilt ── */
  gsap.to(card, {
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end:   'bottom top',
      scrub: 1.4,
    },
    left:    '70%',
    top:     '46%',
    scale:   0.82,
    rotateY: -14,
    rotateZ: -5,
    xPercent: -50,
    yPercent: -50,
    ease: 'power2.inOut',
  });

  /* ── Phase 2: About Me enters → card slightly larger, re-angles ── */
  gsap.to(card, {
    scrollTrigger: {
      trigger: about,
      start: 'top 75%',
      end:   'center center',
      scrub: 1.8,
    },
    scale:   0.94,
    rotateY: -9,
    rotateZ: -3,
    top:     '44%',
    ease: 'power1.inOut',
  });

  /* ── Phase 3: About Me exits → card fades out, DONE ── */
  gsap.to(card, {
    scrollTrigger: {
      trigger: about,
      start: 'bottom 75%',
      end:   'bottom top',
      scrub: 1,
      onLeave: () => gsap.set(card, { display: 'none' }),     // hide after done
      onEnterBack: () => gsap.set(card, { display: 'block' }), // restore on scroll back
    },
    opacity: 0,
    scale: 0.72,
    ease: 'power2.in',
  });
})();

/* ================================================================
   7. PROJECTS — GSAP stacking (slide-from-bottom)
   The pss__stage is pinned. Cards slide up from 100% yPercent.
   Scrub = 1 makes it directly scroll-linked and reversible.
================================================================ */
(function initProjectStack() {
  const stage = document.getElementById('pssStage');
  if (!stage) return;

  const cards       = stage.querySelectorAll('.pss__card');
  const progressBar = document.getElementById('pssProgressBar');
  const counter     = document.getElementById('pssCounter');
  const total       = cards.length;

  if (total < 2) return;

  // All cards except first start below the stage (off-screen bottom)
  cards.forEach((card, i) => {
    if (i > 0) gsap.set(card, { yPercent: 105 });
  });

  // Build a timeline where each card slides in from bottom
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: stage,
      start:   'top top',
      end:     `+=${(total - 1) * window.innerHeight}`,
      pin:     true,
      scrub:   1,
      anticipatePin: 1,
      onUpdate(self) {
        // Update progress bar and counter
        const progress  = self.progress;
        const cardIndex = Math.min(Math.floor(progress * total), total - 1);
        if (progressBar) progressBar.style.width = `${(cardIndex + 1) / total * 100}%`;
        if (counter)     counter.textContent = `0${cardIndex + 1} / 0${total}`;
      }
    }
  });

  // Each subsequent card slides from bottom
  cards.forEach((card, i) => {
    if (i > 0) {
      tl.to(card, {
        yPercent: 0,
        ease: 'power2.inOut',
        duration: 1,
      }, i - 1);
    }
  });
})();

/* ================================================================
   8. SECTION REVEAL — IntersectionObserver
================================================================ */
(function initReveal() {
  const els = $$('.section-reveal');
  const io  = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
    }),
    { threshold: 0.1 }
  );
  els.forEach(el => io.observe(el));
})();

/* ================================================================
   9. COUNTER ANIMATION
================================================================ */
(function initCounters() {
  const els = $$('.counter');
  const io  = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el     = e.target;
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      const dur    = 1600;
      const start  = performance.now();
      const tick   = now => {
        const p     = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(eased * target) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });
  els.forEach(el => io.observe(el));
})();

/* ================================================================
   10. SKILL & LANGUAGE BARS — animate width when in view
================================================================ */
(function initBars() {
  const fills = $$('.skill-bar__fill, .lang-card__fill');
  const io    = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const target = e.target.dataset.width || '0';
        e.target.style.width = target + '%';
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  fills.forEach(el => io.observe(el));
})();

/* ================================================================
   11. ACCORDION (Education, Experience use timeline layout,
       but if any accordion exists, handle it)
================================================================ */
(function initAccordion() {
  const items = $$('.accordion__item');
  items.forEach(item => {
    const btn = item.querySelector('.accordion__trigger');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const open = item.classList.contains('accordion__item--open');
      items.forEach(i => i.classList.remove('accordion__item--open'));
      if (!open) item.classList.add('accordion__item--open');
    });
  });
})();

/* ================================================================
   12. CONTACT FORM — validation + success state
================================================================ */
(function initContact() {
  const btn = document.getElementById('contactSubmit');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const inputs = $$('.cf-input');
    let valid    = true;
    inputs.forEach(inp => {
      const empty = !inp.value.trim();
      inp.style.borderColor = empty ? 'rgba(255,80,80,0.5)' : '';
      if (empty) valid = false;
    });
    if (valid) {
      btn.textContent = 'SENT ✓';
      btn.style.background  = 'var(--lime)';
      btn.style.borderColor = 'var(--lime)';
      btn.style.color = '#111';
      setTimeout(() => {
        btn.textContent = 'SUBMIT';
        btn.style.background = '';
        btn.style.borderColor = '';
        btn.style.color = '';
        inputs.forEach(i => i.value = '');
      }, 3000);
    }
  });
})();

/* ================================================================
   13. CUSTOM CURSOR (desktop only)
================================================================ */
(function initCursor() {
  if (isMobile()) return;
  const dot  = document.createElement('div');
  const ring = document.createElement('div');
  dot.style.cssText  = `position:fixed;width:9px;height:9px;background:var(--lime);border-radius:50%;pointer-events:none;z-index:99999;transform:translate(-50%,-50%);mix-blend-mode:difference;transition:width .2s,height .2s;`;
  ring.style.cssText = `position:fixed;width:36px;height:36px;border:1.5px solid rgba(200,241,53,.4);border-radius:50%;pointer-events:none;z-index:99998;transform:translate(-50%,-50%);transition:width .25s,height .25s,border-color .25s;`;
  document.body.append(dot, ring);

  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
  });
  const animRing = () => {
    rx += (mx - rx) * 0.1; ry += (my - ry) * 0.1;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(animRing);
  };
  animRing();

  const hoverEls = $$('a, button, .tl-card, .pss__card, .interest-item, .lang-card');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.style.width = dot.style.height = '14px';
      ring.style.width = ring.style.height = '52px';
      ring.style.borderColor = 'rgba(200,241,53,.75)';
    });
    el.addEventListener('mouseleave', () => {
      dot.style.width = dot.style.height = '9px';
      ring.style.width = ring.style.height = '36px';
      ring.style.borderColor = 'rgba(200,241,53,.4)';
    });
  });
})();

/* ================================================================
   14. TIMELINE ITEMS — stagger reveal
================================================================ */
(function initTimelineReveal() {
  const items = $$('.tl-item');
  const io    = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        gsap.fromTo(e.target,
          { opacity: 0, x: 24 },
          { opacity: 1, x: 0, duration: 0.65, delay: 0.08, ease: 'power3.out' }
        );
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach(el => io.observe(el));
})();

/* ================================================================
   15. RESIZE — refresh GSAP
================================================================ */
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 250);
}, { passive: true });

window.addEventListener('load', () => {
  setTimeout(() => ScrollTrigger.refresh(), 300);
});