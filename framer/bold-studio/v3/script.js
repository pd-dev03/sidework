/* ============================================================
   BOLD PORTFOLIO — script.js
   ============================================================ */
gsap.registerPlugin(ScrollTrigger);

const mob = () => window.matchMedia('(max-width:768px)').matches;

/* ================================================================
   1. GRAIN CANVAS
================================================================ */
(function() {
  const c = document.getElementById('grainCanvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  const rs  = () => { c.width = innerWidth; c.height = innerHeight; };
  rs(); addEventListener('resize', rs, { passive: true });
  let last = 0;
  const draw = ts => {
    if (ts - last >= 80) {
      last = ts;
      const img = ctx.createImageData(c.width, c.height);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        d[i] = d[i+1] = d[i+2] = v; d[i+3] = 18;
      }
      ctx.putImageData(img, 0, 0);
    }
    requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
})();

/* ================================================================
   2. LIVE CLOCK
================================================================ */
(function() {
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
   3. MENU OVERLAY
================================================================ */
(function() {
  const ov = document.getElementById('menuOverlay');
  const ob = document.getElementById('menuBtn');
  const cl = document.getElementById('menuClose');
  if (!ov || !ob) return;
  ob.addEventListener('click', () => ov.classList.add('open'));
  cl?.addEventListener('click', () => ov.classList.remove('open'));
  ov.querySelectorAll('.mo-link').forEach(a => a.addEventListener('click', () => ov.classList.remove('open')));
})();

/* ================================================================
   4. COUNTERS
================================================================ */
(function() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, t = +el.dataset.target, suf = el.dataset.suffix || '';
      const t0 = performance.now(), dur = 1400;
      const tick = ts => {
        const p = Math.min((ts - t0) / dur, 1);
        el.textContent = Math.floor((1 - Math.pow(1-p, 3)) * t) + suf;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick); io.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.counter').forEach(el => io.observe(el));
})();

/* ================================================================
   5. PROGRESS BARS
================================================================ */
(function() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.width = (e.target.dataset.w || 0) + '%';
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.sbar__fill,.lang__fill').forEach(el => io.observe(el));
})();

/* ================================================================
   6. SECTION REVEAL
================================================================ */
(function() {
  const io = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); } }),
    { threshold: 0.07 }
  );
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

/* ================================================================
   7. EDUCATION / EXPERIENCE ITEMS — stagger reveal
================================================================ */
(function() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        gsap.fromTo(e.target, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' });
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.tl__item').forEach(el => io.observe(el));
})();

/* ================================================================
   8. SPLIT-TEXT ANIMATION
   
   The EXACT Bold Studio animation (studied from 7 images):
   
   STEP 1 (scroll 0 → 30%):
     - Pre-box fades OUT
     - Split stage fades IN
     - "ABOUT" slides from center to LEFT edge (partially off-screen)
     - "ME" slides from center to RIGHT edge (partially off-screen)
     - Portrait scales from 0.0 → 1.0 in the centre
   
   STEP 2 (scroll 30% → 65%):
     HOLD — user sees the split layout (image 4)
     No movement. This is where Bold Studio shows the full state.
   
   STEP 3 (scroll 65% → 100%):
     - Portrait slides UP (yPercent: 0 → -120) and fades
     - Words follow (yPercent: 0 → -80) and fade
     - Pin releases → about content scrolls into view normally
   
   The about-scene has min-height:400vh to provide scroll distance.
================================================================ */
function makeSplit({
  sceneId, pinId, preboxId, stageId, wordLId, wordRId, portraitId,
  scrollMultiplier = 3.5
}) {
  const scene    = document.getElementById(sceneId);
  const pin      = document.getElementById(pinId);
  const prebox   = document.getElementById(preboxId);
  const stage    = document.getElementById(stageId);
  const wL       = document.getElementById(wordLId);
  const wR       = document.getElementById(wordRId);
  const portrait = document.getElementById(portraitId);
  if (!scene || !pin || !prebox || !stage || !wL || !wR || !portrait) return;

  if (mob()) {
    // Mobile: simple fade-in, no pin
    prebox.style.opacity = '0';
    stage.style.opacity  = '1';
    gsap.set(wL, { x: 0, opacity: 1 });
    gsap.set(wR, { x: 0, opacity: 1 });
    gsap.set(portrait, { scale: 1, opacity: 1 });
    return;
  }

  // Measure once
  const vw = window.innerWidth;

  // Initial states
  gsap.set(prebox, { opacity: 1 });
  gsap.set(stage,  { opacity: 0 });
  gsap.set(wL,     { x: 0, opacity: 1 });
  gsap.set(wR,     { x: 0, opacity: 1 });
  gsap.set(portrait, { scale: 0, opacity: 0 });

  // How far words travel — enough to be partially off-screen
  const wordTravelL = -(vw * 0.42);
  const wordTravelR =  (vw * 0.42);

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: scene,
      start:   'top top',
      end:     `+=${window.innerHeight * scrollMultiplier}`,
      pin:     pin,
      scrub:   1.0,
      anticipatePin: 1,
    }
  });

  // Phase 1 (0 → 0.28): prebox fades, stage appears, words split, portrait grows
  tl
    .to(prebox, { opacity: 0, duration: 0.08 }, 0)
    .to(stage,  { opacity: 1, duration: 0.08 }, 0)
    .to(wL,     { x: wordTravelL, ease: 'power2.inOut', duration: 0.28 }, 0.05)
    .to(wR,     { x: wordTravelR, ease: 'power2.inOut', duration: 0.28 }, 0.05)
    .to(portrait, { scale: 1, opacity: 1, ease: 'back.out(1)', duration: 0.28 }, 0.08);

  // Phase 2 (0.28 → 0.62): HOLD — nothing moves

  // Phase 3 (0.62 → 1.0): portrait exits up, words follow
  tl
    .to(portrait, { yPercent: -130, opacity: 0, ease: 'power2.in', duration: 0.32 }, 0.65)
    .to(wL,       { yPercent: -70, opacity: 0, ease: 'power2.in', duration: 0.25 }, 0.73)
    .to(wR,       { yPercent: -70, opacity: 0, ease: 'power2.in', duration: 0.25 }, 0.73);
}

// About split
makeSplit({
  sceneId:   'about',
  pinId:     'splitAbout',
  preboxId:  'splitAbout',
  stageId:   'splitAbout',
  wordLId:   'splitLeft',
  wordRId:   'splitRight',
  portraitId:'splitPortrait',
  scrollMultiplier: 3.5,
});

// Projects split
makeSplit({
  sceneId:   'projects',
  pinId:     'splitProj',
  preboxId:  'splitProj',
  stageId:   'splitProj',
  wordLId:   'splitProjLeft',
  wordRId:   'splitProjRight',
  portraitId:'splitProjImg',
  scrollMultiplier: 2.5,
});

/* ================================================================
   9. STACKING PROJECT CARDS
   Bold Studio style: left = image, right = info panel
   Cards slide up from bottom, previous one dims.
================================================================ */
(function() {
  const wrappers = document.querySelectorAll('.proj__wrapper');
  if (wrappers.length < 2) return;

  wrappers.forEach((wrap, i) => {
    const card = wrap.querySelector('.proj__card');
    if (!card) return;

    if (i === 0) {
      // First card: scale down as second arrives
      const next = wrappers[1];
      if (!next) return;
      ScrollTrigger.create({
        trigger: next,
        start: 'top bottom',
        end:   'top top',
        scrub: true,
        onUpdate(s) {
          const p = s.progress;
          gsap.set(card, {
            scale:  1 - p * 0.05,
            filter: `brightness(${1 - p * 0.45})`,
          });
        }
      });
      return;
    }

    // Cards 2–4: start below viewport, slide in
    gsap.set(card, { yPercent: 106 });
    ScrollTrigger.create({
      trigger: wrap,
      start:  'top bottom',
      end:    'top top',
      scrub:  1,
      onUpdate(s) {
        const p = s.progress;
        gsap.set(card, { yPercent: 106 * (1 - p) });
        // Dim previous
        const prev = wrappers[i - 1]?.querySelector('.proj__card');
        if (prev) gsap.set(prev, {
          scale:  1 - p * 0.05,
          filter: `brightness(${1 - p * 0.45})`,
        });
      }
    });
  });
})();

/* ================================================================
   10. HERO ENTRANCE ANIMATION
================================================================ */
(function() {
  gsap.from('.hero__big', { y: 50, opacity: 0, stagger: 0.1, duration: 0.9, ease: 'power3.out', delay: 0.2 });
  gsap.from('.hero__tag', { y: 20, opacity: 0, duration: 0.7, ease: 'power3.out', delay: 0.1 });
  gsap.from('.hero__hire', { y: 20, opacity: 0, duration: 0.7, ease: 'power3.out', delay: 0.55 });
  gsap.from('.pc img', { scale: 1.08, opacity: 0, duration: 1.2, ease: 'power3.out', delay: 0.05 });
})();

/* ================================================================
   11. CONTACT FORM
================================================================ */
(function() {
  const btn = document.getElementById('cformBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const ins = document.querySelectorAll('.cform__in');
    let ok = true;
    ins.forEach(i => {
      const e = !i.value.trim();
      i.style.borderColor = e ? 'rgba(255,80,80,.5)' : '';
      if (e) ok = false;
    });
    if (ok) {
      btn.textContent = 'SENT ✓';
      btn.style.background = '#fff'; btn.style.color = '#0a0a0a';
      setTimeout(() => {
        btn.textContent = 'SUBMIT ↗';
        btn.style.background = btn.style.color = '';
        ins.forEach(i => i.value = '');
      }, 3000);
    }
  });
})();

/* ================================================================
   12. CUSTOM CURSOR (desktop)
================================================================ */
(function() {
  if (mob()) return;
  const dot  = document.createElement('div');
  const ring = document.createElement('div');
  dot.style.cssText  = 'position:fixed;width:6px;height:6px;background:#fff;border-radius:50%;pointer-events:none;z-index:99999;transform:translate(-50%,-50%);mix-blend-mode:difference;transition:width .15s,height .15s';
  ring.style.cssText = 'position:fixed;width:30px;height:30px;border:1px solid rgba(255,255,255,.35);border-radius:50%;pointer-events:none;z-index:99998;transform:translate(-50%,-50%);transition:width .22s,height .22s,border-color .22s';
  document.body.append(dot, ring);
  let mx=0,my=0,rx=0,ry=0;
  document.addEventListener('mousemove', e => {
    mx=e.clientX; my=e.clientY;
    dot.style.left=mx+'px'; dot.style.top=my+'px';
  });
  const ar = () => { rx+=(mx-rx)*.1; ry+=(my-ry)*.1; ring.style.left=rx+'px'; ring.style.top=ry+'px'; requestAnimationFrame(ar); };
  ar();
  document.querySelectorAll('a,button,.proj__card,.int-card,.lang').forEach(el => {
    el.addEventListener('mouseenter', () => { dot.style.width=dot.style.height='12px'; ring.style.width=ring.style.height='46px'; ring.style.borderColor='rgba(255,255,255,.7)'; });
    el.addEventListener('mouseleave', () => { dot.style.width=dot.style.height='6px'; ring.style.width=ring.style.height='30px'; ring.style.borderColor='rgba(255,255,255,.35)'; });
  });
})();

/* ================================================================
   13. FOOTER GRID — fix HTML structure
   The footer has 2 rows: top (2-col) and bottom (3-col).
   We restructure the bottom row via JS since HTML already has the right elements.
================================================================ */
(function() {
  const grid = document.querySelector('.footer-grid');
  if (!grid) return;
  // Wrap bottom 3 panels in footer-bottom-row if not already done
  const wm      = grid.querySelector('.fp-wm');
  const tag     = grid.querySelector('.fp-tag');
  const contact = grid.querySelector('.fp-contact');
  if (!wm || !tag || !contact) return;
  const bottomRow = document.createElement('div');
  bottomRow.className = 'footer-bottom-row';
  grid.appendChild(bottomRow);
  bottomRow.appendChild(wm);
  bottomRow.appendChild(tag);
  bottomRow.appendChild(contact);
  // Add borders
  [wm, tag, contact].forEach(p => {
    p.style.borderTop = '1px solid rgba(255,255,255,0.12)';
  });
  tag.style.borderLeft = '1px solid rgba(255,255,255,0.12)';
  contact.style.borderLeft = '1px solid rgba(255,255,255,0.12)';
})();

/* ================================================================
   14. RESIZE
================================================================ */
let rt;
addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => ScrollTrigger.refresh(), 200); }, { passive: true });
addEventListener('load', () => setTimeout(() => ScrollTrigger.refresh(), 300));