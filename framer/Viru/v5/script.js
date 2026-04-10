/* ============================================================
   PORTAVIA PORTFOLIO — script.js (final)
   ============================================================ */
gsap.registerPlugin(ScrollTrigger);

const isMobile = () => window.matchMedia('(max-width:768px)').matches;

/* ================================================================
   1. GRAIN CANVAS
   Dark mode: heavier noise. Light mode: lighter.
   Uses mix-blend-mode:overlay in CSS so it works on both themes.
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

  // Update canvas opacity when theme changes
  function syncGrainOpacity() {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    canvas.style.opacity = isDark ? '0.62' : '0.28';
  }
  syncGrainOpacity();

  // Watch for theme attribute changes
  const mo = new MutationObserver(syncGrainOpacity);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  let lastTs = 0;
  function draw(ts) {
    if (ts - lastTs >= 75) {
      lastTs = ts;
      const w = canvas.width, h = canvas.height;
      const img = ctx.createImageData(w, h);
      const d   = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        d[i] = d[i+1] = d[i+2] = v;
        d[i+3] = 22; // per-pixel alpha
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
   3. NAV DIRECTION-AWARE MORPH
   Scroll DOWN → badge pill
   Scroll UP   → full nav
   At top < 80px → always full nav
================================================================ */
(function initNav() {
  const pill = document.getElementById('navPill');
  if (!pill) return;
  let lastY = 0, raf = false;

  function tick() {
    const y   = window.scrollY;
    const dir = y > lastY ? 'down' : 'up';
    lastY = y;
    if (y < 80) {
      pill.classList.remove('badge');
    } else if (dir === 'down') {
      pill.classList.add('badge');
    } else {
      pill.classList.remove('badge');
    }
    raf = false;
  }
  window.addEventListener('scroll', () => { if (!raf) { raf = true; requestAnimationFrame(tick); } }, { passive: true });
})();

/* ================================================================
   4. ACTIVE NAV LINK
================================================================ */
(function initActiveLink() {
  const links = document.querySelectorAll('.nav__a');
  const ids   = ['home','about','education','experience','projects','skills','interests','languages','contact'];
  const secs  = ids.map(id => document.getElementById(id)).filter(Boolean);

  window.addEventListener('scroll', () => {
    let cur = '';
    secs.forEach(s => { if (s && window.scrollY >= s.offsetTop - 220) cur = s.id; });
    links.forEach(l => {
      const h = l.getAttribute('href').replace('#', '');
      l.classList.toggle('active', h === (cur || 'home'));
    });
  }, { passive: true });
})();

/* ================================================================
   5. MOBILE BURGER
================================================================ */
(function initBurger() {
  const btn  = document.getElementById('navBurger');
  const menu = document.getElementById('navMob');
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
   6. PORTRAIT CARD — THE CORRECT ANIMATION
   
   The card is position:fixed. We use GSAP to animate its CSS
   left/top/xPercent/yPercent/scale/rotation.
   
   Key requirement: card must STOP AT About Me section.
   We achieve this by:
   - Phase 1: hero scrolls out → card travels to about section RIGHT column
   - Phase 2: card is PINNED in the About Me right column (no movement)
              We do this by setting scrollTrigger start/end to match
              About Me's scroll range, and NOT animating anything.
   - Phase 3: Once About Me's BOTTOM leaves viewport → fade out instantly
   
   The "stuck on About Me" effect = the card simply doesn't move
   during the entire About Me scroll range.
================================================================ */
(function initCard() {
  if (isMobile()) return;

  const card  = document.getElementById('portraitCard');
  const hero  = document.getElementById('home');
  const about = document.getElementById('about');
  if (!card || !hero || !about) return;

  // Initial state: centred on hero
  gsap.set(card, {
    xPercent: -50,
    yPercent: -50,
    left: '50%',
    top: '50%',
    scale: 1,
    rotateY: 0,
    rotateZ: 0,
    opacity: 1,
    transformPerspective: 1000,
  });

  // ── Phase 1: As hero scrolls off-screen, card travels right and tilts ──
  // End position: right column of the About section
  const aboutRight = document.getElementById('aboutRight');

  ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    end:   'bottom top',
    scrub: 1.6,
    onUpdate(self) {
      const p = self.progress; // 0 → 1

      // Interpolate from hero-centre to about-right-column
      const fromLeft = 50;  const toLeft = 73;
      const fromTop  = 50;  const toTop  = 44;
      const fromScale = 1;  const toScale = 0.86;
      const fromRY   = 0;   const toRY = -13;
      const fromRZ   = 0;   const toRZ = -5;

      gsap.set(card, {
        left:    fromLeft + (toLeft  - fromLeft)  * p + '%',
        top:     fromTop  + (toTop   - fromTop)   * p + '%',
        scale:   fromScale + (toScale - fromScale) * p,
        rotateY: fromRY   + (toRY   - fromRY)   * p,
        rotateZ: fromRZ   + (toRZ   - fromRZ)   * p,
        xPercent: -50,
        yPercent: -50,
      });
    }
  });

  // ── Phase 2: While About Me is in view → card stays PUT (no motion) ──
  // This is the "stuck" behaviour. We don't animate here.
  // The card just remains at the position Phase 1 left it.

  // ── Phase 3: About Me bottom exits viewport → card fades out ──
  // We also reset so scrolling back up restores it.
  ScrollTrigger.create({
    trigger: about,
    start: 'bottom 70%',
    end:   'bottom top',
    scrub: 0.8,
    onUpdate(self) {
      gsap.set(card, { opacity: 1 - self.progress });
    },
    onLeave()     { gsap.set(card, { opacity: 0, pointerEvents: 'none', display: 'none' }); },
    onEnterBack() { gsap.set(card, { opacity: 0, pointerEvents: 'none', display: 'block' }); },
  });
})();

/* ================================================================
   7. PROJECTS — TRUE STICKY STACK
   
   Each .proj__wrapper is sticky (position:sticky; top:0; height:100vh).
   Cards 2-4 start at yPercent:105 (below viewport).
   GSAP animates them to yPercent:0 (covering previous card) as user scrolls.
   
   This is the most reliable cross-browser approach:
   - No pinning bugs from GSAP pin
   - Perfect scrub and reverse
   - Cards truly slide up from bottom
================================================================ */
(function initProjects() {
  const wrappers = document.querySelectorAll('.proj__wrapper');
  if (!wrappers.length) return;

  wrappers.forEach((wrapper, i) => {
    const card = wrapper.querySelector('.proj__card');
    if (!card) return;

    if (i === 0) {
      // First card: scale it down as second card enters
      ScrollTrigger.create({
        trigger: wrappers[1] || wrapper,
        start: 'top bottom',
        end:   'top top',
        scrub: true,
        onUpdate(self) {
          const p = self.progress;
          gsap.set(card, {
            scale: 1 - p * 0.06,
            filter: `brightness(${1 - p * 0.4})`,
          });
        }
      });
      return;
    }

    // Cards 2-4: slide up from bottom
    gsap.set(card, { yPercent: 105 });

    // Slide in: triggered by THIS wrapper entering the viewport
    ScrollTrigger.create({
      trigger: wrapper,
      start: 'top bottom',  // when this sticky wrapper's top hits viewport bottom
      end:   'top top',     // when it's fully stuck at top
      scrub: 1,
      onUpdate(self) {
        const p = self.progress;
        gsap.set(card, { yPercent: 105 - 105 * p });

        // Also scale + dim the PREVIOUS card as THIS one comes in
        const prevWrapper = wrappers[i - 1];
        if (prevWrapper) {
          const prevCard = prevWrapper.querySelector('.proj__card');
          if (prevCard) {
            gsap.set(prevCard, {
              scale: 1 - p * 0.06,
              filter: `brightness(${1 - p * 0.4})`,
            });
          }
        }
      }
    });
  });
})();

/* ================================================================
   8. SECTION REVEAL
================================================================ */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  const io  = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
    }),
    { threshold: 0.08 }
  );
  els.forEach(el => io.observe(el));
})();

/* ================================================================
   9. COUNTERS
================================================================ */
(function initCounters() {
  const els = document.querySelectorAll('.counter');
  const io  = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      const dur    = 1500;
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
   10. SKILL & LANGUAGE BARS
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
   11. TIMELINE STAGGER REVEAL
================================================================ */
(function initTimeline() {
  const items = document.querySelectorAll('.tl__item');
  const io    = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        gsap.fromTo(e.target,
          { opacity: 0, x: 20 },
          { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' }
        );
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach(el => io.observe(el));
})();

/* ================================================================
   12. CONTACT FORM
================================================================ */
(function initForm() {
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
      btn.textContent = 'SENT ✓';
      btn.style.background  = 'var(--lime)';
      btn.style.borderColor = 'var(--lime)';
      btn.style.color       = '#111';
      setTimeout(() => {
        btn.textContent = 'SUBMIT';
        btn.style.background = btn.style.borderColor = btn.style.color = '';
        inputs.forEach(i => i.value = '');
      }, 3000);
    }
  });
})();

/* ================================================================
   13. CUSTOM CURSOR (desktop)
================================================================ */
(function initCursor() {
  if (isMobile()) return;

  const dot  = document.createElement('div');
  const ring = document.createElement('div');
  dot.style.cssText  = 'position:fixed;width:8px;height:8px;background:var(--lime);border-radius:50%;pointer-events:none;z-index:99999;transform:translate(-50%,-50%);mix-blend-mode:difference;transition:width .18s,height .18s';
  ring.style.cssText = 'position:fixed;width:34px;height:34px;border:1.5px solid rgba(200,241,53,.38);border-radius:50%;pointer-events:none;z-index:99998;transform:translate(-50%,-50%);transition:width .24s,height .24s,border-color .24s';
  document.body.append(dot, ring);

  let mx=0,my=0,rx=0,ry=0;
  document.addEventListener('mousemove', e => {
    mx=e.clientX; my=e.clientY;
    dot.style.left=mx+'px'; dot.style.top=my+'px';
  });
  const ar = () => {
    rx += (mx-rx)*.1; ry += (my-ry)*.1;
    ring.style.left=rx+'px'; ring.style.top=ry+'px';
    requestAnimationFrame(ar);
  };
  ar();

  document.querySelectorAll('a,button,.proj__card,.int-card,.lang,.tl__card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.style.width=dot.style.height='14px';
      ring.style.width=ring.style.height='50px';
      ring.style.borderColor='rgba(200,241,53,.72)';
    });
    el.addEventListener('mouseleave', () => {
      dot.style.width=dot.style.height='8px';
      ring.style.width=ring.style.height='34px';
      ring.style.borderColor='rgba(200,241,53,.38)';
    });
  });
})();

/* ================================================================
   14. RESIZE REFRESH
================================================================ */
let rt;
window.addEventListener('resize', () => { clearTimeout(rt); rt=setTimeout(()=>ScrollTrigger.refresh(),200); }, { passive:true });
window.addEventListener('load', () => { setTimeout(()=>ScrollTrigger.refresh(), 300); });