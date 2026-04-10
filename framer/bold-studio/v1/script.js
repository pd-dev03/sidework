/* ============================================================
   PORTAVIA PORTFOLIO v2 — Bold Studio Edition
   script.js
   ============================================================ */
gsap.registerPlugin(ScrollTrigger);

const isMobile = () => window.matchMedia('(max-width:768px)').matches;

/* ================================================================
   1. GRAIN CANVAS
================================================================ */
(function initGrain() {
  const canvas = document.getElementById('grainCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  function syncGrainOpacity() {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    canvas.style.opacity = isDark ? '0.55' : '0.20';
  }
  syncGrainOpacity();

  const mo = new MutationObserver(syncGrainOpacity);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  let lastTs = 0;
  function draw(ts) {
    if (ts - lastTs >= 80) {
      lastTs = ts;
      const w = canvas.width, h = canvas.height;
      const img = ctx.createImageData(w, h);
      const d   = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        d[i] = d[i+1] = d[i+2] = v;
        d[i+3] = 20;
      }
      ctx.putImageData(img, 0, 0);
    }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();

/* ================================================================
   2. THEME TOGGLE
================================================================ */
(function initTheme() {
  const html = document.documentElement;
  const btn  = document.getElementById('themePill');
  if (!btn) return;
  const saved = localStorage.getItem('pv-theme') || 'dark';
  html.setAttribute('data-theme', saved);
  btn.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('pv-theme', next);
  });
  btn.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') btn.click(); });
})();

/* ================================================================
   3. LIVE CLOCK
================================================================ */
(function initClock() {
  const el = document.getElementById('navClock');
  if (!el) return;
  function tick() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2,'0');
    const m = String(now.getMinutes()).padStart(2,'0');
    const s = String(now.getSeconds()).padStart(2,'0');
    el.textContent = `${h}:${m}:${s}`;
  }
  tick();
  setInterval(tick, 1000);
})();

/* ================================================================
   4. MENU OVERLAY
================================================================ */
(function initMenu() {
  const menuBtn   = document.getElementById('menuBtn');
  const menuClose = document.getElementById('menuClose');
  const overlay   = document.getElementById('menuOverlay');
  if (!menuBtn || !overlay) return;

  let open = false;
  const links = overlay.querySelectorAll('.mo-link');

  // Stagger links animation
  function openMenu() {
    open = true;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    gsap.fromTo(links,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power3.out', delay: 0.15 }
    );
    // Animate menu icon to X
    const spans = menuBtn.querySelectorAll('.nav__menu-icon span');
    if (spans[0]) spans[0].style.transform = 'translateY(5.5px) rotate(45deg)';
    if (spans[1]) spans[1].style.transform = 'translateY(-5.5px) rotate(-45deg)';
  }

  function closeMenu() {
    open = false;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    const spans = menuBtn.querySelectorAll('.nav__menu-icon span');
    if (spans[0]) spans[0].style.transform = '';
    if (spans[1]) spans[1].style.transform = '';
  }

  menuBtn.addEventListener('click', () => open ? closeMenu() : openMenu());
  if (menuClose) menuClose.addEventListener('click', closeMenu);
  overlay.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && open) closeMenu(); });
})();

/* ================================================================
   5. NAV SCROLL HIDE/SHOW
================================================================ */
(function initNavScroll() {
  const nav = document.getElementById('mainNav');
  if (!nav) return;
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > lastY && y > 100) {
      nav.style.transform = 'translateY(-100%)';
    } else {
      nav.style.transform = 'translateY(0)';
    }
    lastY = y;
  }, { passive: true });
  nav.style.transition = 'transform .4s cubic-bezier(.16,1,.3,1), background .5s';
})();

/* ================================================================
   6. PORTRAIT CARD — Fixed card hero → about → disappear
================================================================ */
(function initCard() {
  if (isMobile()) return;

  const card  = document.getElementById('portraitCard');
  const hero  = document.getElementById('home');
  const about = document.getElementById('about');
  if (!card || !hero || !about) return;

  gsap.set(card, {
    xPercent: -50, yPercent: -50,
    left: '50%', top: '50%',
    scale: 1, rotateY: 0, rotateZ: 0,
    opacity: 1, transformPerspective: 1000,
  });

  // Phase 1: card travels to about-right column as hero scrolls
  ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    end:   'bottom top',
    scrub: 1.4,
    onUpdate(self) {
      const p = self.progress;
      gsap.set(card, {
        left:    50 + (73 - 50) * p + '%',
        top:     50 + (44 - 50) * p + '%',
        scale:   1 + (0.86 - 1) * p,
        rotateY: 0 + (-12 * p),
        rotateZ: 0 + (-4  * p),
        xPercent: -50, yPercent: -50,
      });
    }
  });

  // Phase 3: card fades out as About bottom leaves
  ScrollTrigger.create({
    trigger: about,
    start: 'bottom 72%',
    end:   'bottom top',
    scrub: 0.7,
    onUpdate(self)  { gsap.set(card, { opacity: 1 - self.progress }); },
    onLeave()       { gsap.set(card, { opacity: 0, pointerEvents: 'none', display: 'none' }); },
    onEnterBack()   { gsap.set(card, { opacity: 0, pointerEvents: 'none', display: 'block' }); },
  });
})();

/* ================================================================
   7. SPLIT-TEXT ANIMATION — ABOUT section
   
   Three phases (all within one pinned sticky container):
   Phase 1: words fly from centre to edges, portrait scales up
   Phase 2: portrait slides up off screen
   Phase 3: words slide off top, content below starts
================================================================ */
(function initSplitAbout() {
  if (isMobile()) return;

  const scene    = document.getElementById('splitAbout');
  const inner    = scene ? scene.querySelector('.split-scene__inner') : null;
  const wordL    = document.getElementById('splitLeft');
  const wordR    = document.getElementById('splitRight');
  const portrait = document.getElementById('splitPortrait');
  if (!scene || !wordL || !wordR || !portrait) return;

  // Initial state: words near centre, portrait hidden
  gsap.set(wordL, { xPercent: 45 });
  gsap.set(wordR, { xPercent: -45 });
  gsap.set(portrait, { scale: 0, opacity: 0 });

  // The split-scene has height:300vh (from CSS)
  // We pin the inner for the full scroll distance
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: scene,
      start: 'top top',
      end:   'bottom top',
      scrub: 1.2,
      pin: inner,
      anticipatePin: 1,
    }
  });

  // Phase 1 (0–40%): words fly apart, portrait appears
  tl.to(wordL, { xPercent: 0, duration: 0.4, ease: 'power2.out' }, 0)
    .to(wordR, { xPercent: 0, duration: 0.4, ease: 'power2.out' }, 0)
    .to(portrait, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.5)' }, 0.05);

  // Phase 2 (40–70%): portrait slides up
  tl.to(portrait, { yPercent: -120, opacity: 0, duration: 0.3, ease: 'power2.in' }, 0.4);

  // Phase 3 (70–100%): words drift outward + fade
  tl.to(wordL, { xPercent: -15, opacity: 0, duration: 0.3, ease: 'power2.in' }, 0.7)
    .to(wordR, { xPercent: 15, opacity: 0, duration: 0.3, ease: 'power2.in' }, 0.7);
})();

/* ================================================================
   8. SPLIT-TEXT ANIMATION — PROJECTS section
================================================================ */
(function initSplitProjects() {
  if (isMobile()) return;

  const scene = document.getElementById('splitProj');
  const inner = scene ? scene.querySelector('.split-scene__inner') : null;
  const wordL = document.getElementById('splitProjLeft');
  const wordR = document.getElementById('splitProjRight');
  const img   = document.getElementById('splitProjImg');
  if (!scene || !wordL || !wordR) return;

  gsap.set(wordL, { xPercent: 45 });
  gsap.set(wordR, { xPercent: -45 });
  if (img) gsap.set(img, { scale: 0, opacity: 0 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: scene,
      start: 'top top',
      end:   'bottom top',
      scrub: 1.2,
      pin: inner,
      anticipatePin: 1,
    }
  });

  tl.to(wordL, { xPercent: 0, duration: 0.4, ease: 'power2.out' }, 0)
    .to(wordR, { xPercent: 0, duration: 0.4, ease: 'power2.out' }, 0);
  if (img) {
    tl.to(img, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.5)' }, 0.05)
      .to(img, { yPercent: -120, opacity: 0, duration: 0.25, ease: 'power2.in' }, 0.42);
  }
  tl.to(wordL, { xPercent: -15, opacity: 0, duration: 0.3, ease: 'power2.in' }, 0.7)
    .to(wordR, { xPercent: 15, opacity: 0, duration: 0.3, ease: 'power2.in' }, 0.7);
})();

/* ================================================================
   9. PROJECTS — TRUE STICKY STACK
================================================================ */
(function initProjects() {
  const wrappers = document.querySelectorAll('.proj__wrapper');
  if (!wrappers.length) return;

  wrappers.forEach((wrapper, i) => {
    const card = wrapper.querySelector('.proj__card');
    if (!card) return;

    if (i === 0) {
      ScrollTrigger.create({
        trigger: wrappers[1] || wrapper,
        start: 'top bottom',
        end:   'top top',
        scrub: true,
        onUpdate(self) {
          const p = self.progress;
          gsap.set(card, {
            scale: 1 - p * 0.06,
            filter: `brightness(${1 - p * 0.42})`,
          });
        }
      });
      return;
    }

    gsap.set(card, { yPercent: 108 });

    ScrollTrigger.create({
      trigger: wrapper,
      start: 'top bottom',
      end:   'top top',
      scrub: 1,
      onUpdate(self) {
        const p = self.progress;
        gsap.set(card, { yPercent: 108 - 108 * p });
        const prevWrapper = wrappers[i - 1];
        if (prevWrapper) {
          const prevCard = prevWrapper.querySelector('.proj__card');
          if (prevCard) {
            gsap.set(prevCard, {
              scale: 1 - p * 0.06,
              filter: `brightness(${1 - p * 0.42})`,
            });
          }
        }
      }
    });
  });
})();

/* ================================================================
   10. SECTION REVEAL
================================================================ */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  const io  = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
    }),
    { threshold: 0.07 }
  );
  els.forEach(el => io.observe(el));
})();

/* ================================================================
   11. COUNTERS
================================================================ */
(function initCounters() {
  const els = document.querySelectorAll('.counter');
  const io  = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      const dur    = 1600;
      const t0     = performance.now();
      const tick   = now => {
        const p     = Math.min((now - t0) / dur, 1);
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
   12. SKILL & LANGUAGE BARS
================================================================ */
(function initBars() {
  const fills = document.querySelectorAll('.sbar__fill, .lang__fill');
  const io    = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.width = (e.target.dataset.w || '0') + '%';
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  fills.forEach(el => io.observe(el));
})();

/* ================================================================
   13. TIMELINE STAGGER
================================================================ */
(function initTimeline() {
  const items = document.querySelectorAll('.tl__item');
  const io    = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        gsap.fromTo(e.target,
          { opacity: 0, x: 24 },
          { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out' }
        );
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach(el => io.observe(el));
})();

/* ================================================================
   14. CONTACT FORM
================================================================ */
(function initForm() {
  const btn = document.getElementById('cformBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const inputs = document.querySelectorAll('.cform__in');
    let ok = true;
    inputs.forEach(i => {
      const empty = !i.value.trim();
      i.style.borderBottomColor = empty ? 'rgba(255,80,80,.6)' : '';
      if (empty) ok = false;
    });
    if (ok) {
      const orig = btn.textContent;
      btn.textContent = 'SENT ✓';
      btn.style.background  = 'transparent';
      btn.style.color       = 'var(--fg)';
      setTimeout(() => {
        btn.textContent = orig;
        btn.style.background = btn.style.color = '';
        inputs.forEach(i => { i.value = ''; i.style.borderBottomColor = ''; });
      }, 3000);
    }
  });
})();

/* ================================================================
   15. CUSTOM CURSOR
================================================================ */
(function initCursor() {
  if (isMobile()) return;

  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  const ar = () => {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(ar);
  };
  ar();

  const hoverEls = document.querySelectorAll('a, button, .proj__card, .int-card, .lang, .tl__card, .mo-link');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.style.width = dot.style.height = '14px';
      ring.style.width = ring.style.height = '54px';
      ring.style.borderColor = 'rgba(255,255,255,0.6)';
    });
    el.addEventListener('mouseleave', () => {
      dot.style.width = dot.style.height = '8px';
      ring.style.width = ring.style.height = '36px';
      ring.style.borderColor = 'rgba(255,255,255,0.3)';
    });
  });
})();

/* ================================================================
   16. FOOTER NEWSLETTER BUTTON
================================================================ */
(function initNewsletter() {
  const btn   = document.querySelector('.footer__nl-btn');
  const input = document.querySelector('.footer__nl-input');
  if (!btn || !input) return;
  btn.addEventListener('click', () => {
    if (input.value.trim()) {
      btn.textContent = '✓';
      setTimeout(() => { btn.textContent = '→'; input.value = ''; }, 2500);
    }
  });
})();

/* ================================================================
   17. RESIZE REFRESH
================================================================ */
let rt;
window.addEventListener('resize', () => {
  clearTimeout(rt);
  rt = setTimeout(() => ScrollTrigger.refresh(), 200);
}, { passive: true });
window.addEventListener('load', () => {
  setTimeout(() => ScrollTrigger.refresh(), 400);
});