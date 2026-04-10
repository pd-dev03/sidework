/* ============================================================
   BOLD PORTFOLIO — script.js
   ============================================================ */
gsap.registerPlugin(ScrollTrigger);

const isMob = () => window.matchMedia('(max-width:768px)').matches;

/* ================================================================
   1. GRAIN CANVAS
================================================================ */
(function grain() {
  const c = document.getElementById('grain');
  if (!c) return;
  const ctx = c.getContext('2d');

  const resize = () => { c.width = innerWidth; c.height = innerHeight; };
  resize();
  addEventListener('resize', resize, { passive: true });

  // Sync opacity with theme
  const syncOp = () => {
    c.style.opacity = document.documentElement.dataset.theme === 'light' ? '0.22' : '0.58';
  };
  syncOp();
  new MutationObserver(syncOp).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  let last = 0;
  const draw = ts => {
    if (ts - last >= 80) {
      last = ts;
      const img = ctx.createImageData(c.width, c.height);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 20;
      }
      ctx.putImageData(img, 0, 0);
    }
    requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
})();

/* ================================================================
   2. THEME TOGGLE
================================================================ */
(function theme() {
  const html = document.documentElement;
  const btn  = document.getElementById('themeBtn');
  if (!btn) return;
  html.dataset.theme = localStorage.getItem('pv-theme') || 'dark';
  btn.addEventListener('click', () => {
    const n = html.dataset.theme === 'dark' ? 'light' : 'dark';
    html.dataset.theme = n;
    localStorage.setItem('pv-theme', n);
  });
  btn.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') btn.click(); });
})();

/* ================================================================
   3. LIVE CLOCK
================================================================ */
(function clock() {
  const el = document.getElementById('navClock');
  if (!el) return;
  const tick = () => {
    const now = new Date();
    let h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    el.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')} ${ampm}`;
  };
  tick(); setInterval(tick, 1000);
})();

/* ================================================================
   4. MENU OVERLAY
================================================================ */
(function menu() {
  const overlay = document.getElementById('menuOverlay');
  const openBtn = document.getElementById('menuBtn');
  const closeBtn = document.getElementById('menuClose');
  if (!overlay || !openBtn) return;

  openBtn.addEventListener('click', () => overlay.classList.add('open'));
  closeBtn?.addEventListener('click', () => overlay.classList.remove('open'));
  overlay.querySelectorAll('.mo-link').forEach(a => a.addEventListener('click', () => overlay.classList.remove('open')));
})();

/* ================================================================
   5. COUNTERS
================================================================ */
(function counters() {
  const els = document.querySelectorAll('.counter');
  const io  = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, target = +el.dataset.target, suf = el.dataset.suffix || '';
      const t0 = performance.now(), dur = 1500;
      const tick = ts => {
        const p = Math.min((ts - t0) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(eased * target) + suf;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick); io.unobserve(el);
    });
  }, { threshold: 0.5 });
  els.forEach(el => io.observe(el));
})();

/* ================================================================
   6. SKILL + LANGUAGE BARS
================================================================ */
(function bars() {
  const fills = document.querySelectorAll('.sbar__fill,.lang-bar__fill');
  const io    = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.width = (e.target.dataset.w || 0) + '%';
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  fills.forEach(el => io.observe(el));
})();

/* ================================================================
   7. SECTION REVEAL
================================================================ */
(function reveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

/* ================================================================
   8. TIMELINE STAGGER
================================================================ */
(function tlReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        gsap.fromTo(e.target, { opacity: 0, x: 18 }, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' });
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.tl__item').forEach(el => io.observe(el));
})();

/* ================================================================
   9. SPLIT-TEXT ANIMATION — ABOUT ME
   
   Scroll sequence:
   Phase 1 (0→0.4): "ABOUT" flies LEFT edge, "ME" flies RIGHT edge.
                     Portrait scales from 0 → 1 in the centre.
   Phase 2 (0.4→0.7): Portrait held. Words anchored. User reads split.
   Phase 3 (0.7→1): Portrait slides UP off-screen.
                     Words stay — they'll naturally scroll up with DOM.
   After pin: About body content scrolls normally.
   
   We give the split-scene a height of 350vh so the pin has room.
================================================================ */
(function aboutSplit() {
  if (isMob()) return;

  const scene    = document.getElementById('about-sec');
  const pin      = document.getElementById('splitPin');
  const wordL    = document.getElementById('splitL');
  const wordR    = document.getElementById('splitR');
  const portrait = document.getElementById('splitPortrait');
  if (!scene || !pin || !wordL || !wordR || !portrait) return;

  // Give the scene enough scroll height: pin height + content buffer
  scene.style.minHeight = '350vh';

  // Initial state — words centred (they'll appear as one merged text)
  gsap.set(wordL, { x: 0, opacity: 1 });
  gsap.set(wordR, { x: 0, opacity: 1 });
  gsap.set(portrait, { scale: 0, opacity: 0 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: scene,
      start:   'top top',
      end:     'bottom bottom',
      pin:     pin,
      scrub:   1.2,
      anticipatePin: 1,
    }
  });

  // Phase 1: split words apart + portrait grows (0 → 40%)
  tl.to(wordL, { x: '-42vw', ease: 'power2.inOut', duration: 0.4 }, 0)
    .to(wordR, { x: '42vw',  ease: 'power2.inOut', duration: 0.4 }, 0)
    .to(portrait, { scale: 1, opacity: 1, ease: 'back.out(1.2)', duration: 0.4 }, 0.05);

  // Phase 2: hold (0.4 → 0.65) — nothing moves, user sees the split
  // (no additional tweens needed; just timeline continues)

  // Phase 3: portrait exits upward (0.65 → 1)
  tl.to(portrait, { yPercent: -140, opacity: 0, ease: 'power2.in', duration: 0.35 }, 0.65)
  // Words slide off too as portrait leaves
    .to(wordL, { yPercent: -80, opacity: 0, ease: 'power2.in', duration: 0.3 }, 0.75)
    .to(wordR, { yPercent: -80, opacity: 0, ease: 'power2.in', duration: 0.3 }, 0.75);
})();

/* ================================================================
   10. SPLIT-TEXT ANIMATION — FEATURED PROJECTS
   
   Same mechanic:
   Phase 1: "FEATURED" left, "PROJECTS" right, first project image grows centre.
   Phase 2: hold.
   Phase 3: centre image exits up, words exit up.
   After: stacking cards begin.
================================================================ */
(function projSplit() {
  if (isMob()) return;

  const scene    = document.getElementById('projects');
  const pin      = document.getElementById('projSplitPin');
  const wordL    = document.getElementById('projSplitL');
  const wordR    = document.getElementById('projSplitR');
  const portrait = document.getElementById('projSplitImg');
  if (!scene || !pin || !wordL || !wordR || !portrait) return;

  // The split-pin is the first child of proj-scene;
  // give the overall section enough room
  // (stacking cards below provide their own sticky height via DOM)

  gsap.set(wordL, { x: 0, opacity: 1 });
  gsap.set(wordR, { x: 0, opacity: 1 });
  gsap.set(portrait, { scale: 0, opacity: 0 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: pin,
      start:   'top top',
      end:     '+=250%',
      pin:     true,
      scrub:   1.2,
      anticipatePin: 1,
    }
  });

  tl.to(wordL, { x: '-40vw', ease: 'power2.inOut', duration: 0.4 }, 0)
    .to(wordR, { x: '40vw',  ease: 'power2.inOut', duration: 0.4 }, 0)
    .to(portrait, { scale: 1, opacity: 1, ease: 'back.out(1.2)', duration: 0.4 }, 0.05)
    // hold in middle
    .to(portrait, { yPercent: -140, opacity: 0, ease: 'power2.in', duration: 0.35 }, 0.65)
    .to(wordL, { yPercent: -80, opacity: 0, ease: 'power2.in', duration: 0.3 }, 0.75)
    .to(wordR, { yPercent: -80, opacity: 0, ease: 'power2.in', duration: 0.3 }, 0.75);
})();

/* ================================================================
   11. STACKING PROJECT CARDS
   
   Uses native sticky positioning — no GSAP pin needed.
   Cards 2-4 start at yPercent:105, scrub to yPercent:0.
   Previous card scales down + dims as next arrives.
================================================================ */
(function stackCards() {
  const wrappers = document.querySelectorAll('.proj-wrapper');
  if (wrappers.length < 2) return;

  wrappers.forEach((wrap, i) => {
    const card = wrap.querySelector('.proj-card');
    if (!card) return;

    if (i === 0) {
      // First card scales down as second arrives
      if (wrappers[1]) {
        ScrollTrigger.create({
          trigger: wrappers[1],
          start:   'top bottom',
          end:     'top top',
          scrub:   true,
          onUpdate(s) {
            gsap.set(card, { scale: 1 - s.progress * 0.055, filter: `brightness(${1 - s.progress * 0.4})` });
          }
        });
      }
      return;
    }

    // Cards 2-4: slide in from bottom
    gsap.set(card, { yPercent: 108 });

    ScrollTrigger.create({
      trigger: wrap,
      start:   'top bottom',
      end:     'top top',
      scrub:   1,
      onUpdate(s) {
        gsap.set(card, { yPercent: 108 - 108 * s.progress });
        // Dim previous card
        const prev = wrappers[i - 1]?.querySelector('.proj-card');
        if (prev) gsap.set(prev, { scale: 1 - s.progress * 0.055, filter: `brightness(${1 - s.progress * 0.4})` });
      }
    });
  });
})();

/* ================================================================
   12. CONTACT FORM
================================================================ */
(function form() {
  const btn = document.getElementById('cformBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const inputs = document.querySelectorAll('.cform__in');
    let ok = true;
    inputs.forEach(i => {
      const empty = !i.value.trim();
      i.style.borderColor = empty ? 'rgba(255,80,80,.5)' : '';
      if (empty) ok = false;
    });
    if (ok) {
      btn.innerHTML = 'SENT ✓';
      btn.style.background = 'var(--lime)'; btn.style.color = '#111';
      setTimeout(() => {
        btn.innerHTML = 'SUBMIT <span>↗</span>';
        btn.style.background = btn.style.color = '';
        inputs.forEach(i => i.value = '');
      }, 3000);
    }
  });
})();

/* ================================================================
   13. CUSTOM CURSOR (desktop)
================================================================ */
(function cursor() {
  if (isMob()) return;
  const dot  = Object.assign(document.createElement('div'), {});
  const ring = Object.assign(document.createElement('div'), {});
  dot.style.cssText  = 'position:fixed;width:7px;height:7px;background:var(--lime);border-radius:50%;pointer-events:none;z-index:99999;transform:translate(-50%,-50%);mix-blend-mode:difference;transition:width .18s,height .18s';
  ring.style.cssText = 'position:fixed;width:32px;height:32px;border:1.5px solid rgba(200,241,53,.35);border-radius:50%;pointer-events:none;z-index:99998;transform:translate(-50%,-50%);transition:width .24s,height .24s,border-color .24s';
  document.body.append(dot, ring);

  let mx=0,my=0,rx=0,ry=0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
  });
  const ar = () => {
    rx += (mx - rx) * .1; ry += (my - ry) * .1;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(ar);
  };
  ar();

  document.querySelectorAll('a,button,.proj-card,.int-card,.lang-row,.tl__card').forEach(el => {
    el.addEventListener('mouseenter', () => { dot.style.width = dot.style.height = '12px'; ring.style.width = ring.style.height = '48px'; ring.style.borderColor = 'rgba(200,241,53,.7)'; });
    el.addEventListener('mouseleave', () => { dot.style.width = dot.style.height = '7px'; ring.style.width = ring.style.height = '32px'; ring.style.borderColor = 'rgba(200,241,53,.35)'; });
  });
})();

/* ================================================================
   14. HERO IMAGE ENTRANCE
================================================================ */
(function heroEntrance() {
  gsap.from('.hero__img-wrap', { scale: 0.88, opacity: 0, duration: 1.1, ease: 'power3.out', delay: 0.3 });
  gsap.from('.hero__headline .hero__hl-line', {
    y: 40, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out', delay: 0.1
  });
  gsap.from('.hero__sub, .hero__ctas', {
    y: 20, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out', delay: 0.55
  });
})();

/* ================================================================
   15. RESIZE REFRESH
================================================================ */
let rt;
addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => ScrollTrigger.refresh(), 200); }, { passive: true });
addEventListener('load', () => setTimeout(() => ScrollTrigger.refresh(), 300));