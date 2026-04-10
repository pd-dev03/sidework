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
  html.dataset.theme = localStorage.getItem('bold-theme') || 'dark';
  btn.addEventListener('click', () => {
    const n = html.dataset.theme === 'dark' ? 'light' : 'dark';
    html.dataset.theme = n;
    localStorage.setItem('bold-theme', n);
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
   5. ABOUT SECTION SPLIT ANIMATION
   
   The "ABOUT" and "BOLD" text:
   - Start at center (opacity 1, x: 0)
   - As user scrolls, split apart (left → -42vw, right → +42vw)
   - Portrait grows from scale 0 to scale 1
   - Holds in middle position
   - Then portrait exits upward as text follows
================================================================ */
(function aboutSplit() {
  if (isMob()) return;

  const section   = document.getElementById('about-sec');
  const wordL     = document.getElementById('splitL');
  const wordR     = document.getElementById('splitR');
  const portrait  = document.getElementById('splitPortrait');
  if (!section || !wordL || !wordR || !portrait) return;

  // Initial state — words centered, portrait hidden
  gsap.set([wordL, wordR], { opacity: 1, x: 0 });
  gsap.set(portrait, { scale: 0, opacity: 0 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top center',
      end: 'center center',
      scrub: 1.2,
      anticipatePin: 1,
    }
  });

  // Phase 1: words split apart + portrait grows (0 → 1)
  tl.to(wordL, { x: '-42vw', opacity: 1, ease: 'power2.inOut', duration: 1 }, 0)
    .to(wordR, { x: '42vw', opacity: 1, ease: 'power2.inOut', duration: 1 }, 0)
    .to(portrait, { scale: 1, opacity: 1, ease: 'back.out(1.2)', duration: 1 }, 0.1);
})();

/* ================================================================
   6. PROJECTS SECTION SPLIT ANIMATION
   
   Same mechanic as ABOUT:
   - "OUR" flies left, "WORK" flies right
   - Project image grows from center
   - Then exits upward as text follows
================================================================ */
(function projSplit() {
  if (isMob()) return;

  const section   = document.getElementById('projects');
  const wordL     = document.getElementById('projSplitL');
  const wordR     = document.getElementById('projSplitR');
  const portrait  = document.getElementById('projSplitImg');
  if (!section || !wordL || !wordR || !portrait) return;

  gsap.set([wordL, wordR], { opacity: 1, x: 0 });
  gsap.set(portrait, { scale: 0, opacity: 0 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top center',
      end: 'center center',
      scrub: 1.2,
      anticipatePin: 1,
    }
  });

  tl.to(wordL, { x: '-42vw', opacity: 1, ease: 'power2.inOut', duration: 1 }, 0)
    .to(wordR, { x: '42vw', opacity: 1, ease: 'power2.inOut', duration: 1 }, 0)
    .to(portrait, { scale: 1, opacity: 1, ease: 'back.out(1.2)', duration: 1 }, 0.1);
})();

/* ================================================================
   7. CUSTOM CURSOR (desktop only)
================================================================ */
(function cursor() {
  if (isMob()) return;
  
  const dot  = document.createElement('div');
  const ring = document.createElement('div');
  
  dot.style.cssText  = 'position:fixed;width:7px;height:7px;background:var(--lime);border-radius:50%;pointer-events:none;z-index:99999;transform:translate(-50%,-50%);mix-blend-mode:difference;transition:width .18s,height .18s';
  ring.style.cssText = 'position:fixed;width:32px;height:32px;border:1.5px solid rgba(200,241,53,.35);border-radius:50%;pointer-events:none;z-index:99998;transform:translate(-50%,-50%);transition:width .24s,height .24s,border-color .24s';
  
  document.body.append(dot, ring);

  let mx=0, my=0, rx=0, ry=0;
  
  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
  });
  
  const animate = () => {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(animate);
  };
  animate();

  // Interactive elements that enlarge cursor
  document.querySelectorAll('a, button, .project-card, .footer__panel').forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.style.width = dot.style.height = '12px';
      ring.style.width = ring.style.height = '48px';
      ring.style.borderColor = 'rgba(200,241,53,.7)';
    });
    el.addEventListener('mouseleave', () => {
      dot.style.width = dot.style.height = '7px';
      ring.style.width = ring.style.height = '32px';
      ring.style.borderColor = 'rgba(200,241,53,.35)';
    });
  });
})();

/* ================================================================
   8. SECTION REVEAL ON SCROLL
================================================================ */
(function reveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

/* ================================================================
   9. RESIZE REFRESH
================================================================ */
let resizeTimeout;
addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => ScrollTrigger.refresh(), 200);
}, { passive: true });
addEventListener('load', () => setTimeout(() => ScrollTrigger.refresh(), 300));