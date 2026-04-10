/* ============================================================
   PORTAVIA — script.js
   GSAP ScrollTrigger 3D card morph + all interactivity
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

/* ── Utility ────────────────────────────────────────────── */
const isMobile = () => window.innerWidth <= 768;

/* ================================================================
   1. STICKY "AVAILABLE FOR WORK" BADGE
   Hides in hero, appears once user scrolls past the hero section
================================================================ */
(function initStickyBadge() {
  const badge = document.getElementById('stickyBadge');
  const heroPanel = document.getElementById('heroPanel');

  ScrollTrigger.create({
    trigger: heroPanel,
    start: 'bottom 80%',
    onEnter: () => badge.classList.add('visible'),
    onLeaveBack: () => badge.classList.remove('visible'),
  });
})();

/* ================================================================
   2. HERO → SERVICES: 3D CARD MORPH (Desktop only)
   The portrait card travels from hero center to services right sidebar,
   scaling down and tilting in 3D as the user scrolls.
================================================================ */
(function initCardMorph() {
  if (isMobile()) return;

  const scene      = document.getElementById('scrollScene');
  const traveller  = document.getElementById('cardTraveller');
  const card       = document.querySelector('.portrait-card');
  const heroSlot   = document.getElementById('heroSlot');
  const frontImg   = document.getElementById('portraitFront');

  /* Enable 3D perspective on the traveller container */
  gsap.set(traveller, { perspective: 1000 });

  /* ── Hero state (initial) ─────────────────────────────── */
  // Card starts centered (handled by CSS). We only animate.

  /* ── ScrollTrigger: pin the scene, animate card ──────── */
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: scene,
      start: 'top top',
      end: '+=200%',
      scrub: 1.2,
      pin: true,
      anticipatePin: 1,
    }
  });

  /*
    From: centered, scale 1, no rotation
    To:   right-side, scaled down, rotated -12deg Y, -5deg Z
    We animate the card's left/top/translateX/translateY via GSAP
    so we don't fight the CSS transform.
  */
  tl
    /* Phase 1 (0 → 40%): card morphs into 3D tilt, stays roughly center-right */
    .to(card, {
      duration: 0.4,
      scale: 0.78,
      rotateY: -14,
      rotateZ: -5,
      x: '12vw',
      y: '-6vh',
      ease: 'power2.inOut',
    }, 0)

    /* Phase 2 (40% → 70%): card slides to right column */
    .to(card, {
      duration: 0.35,
      left: '72%',
      top: '44%',
      x: 0,
      ease: 'power2.inOut',
    }, 0.38)

    /* Phase 3 (70% → 100%): slight additional tilt + scale settle */
    .to(card, {
      duration: 0.25,
      scale: 0.68,
      rotateY: -12,
      rotateZ: -4,
      ease: 'power1.out',
    }, 0.72)

    /* Swap portrait image on scroll progress */
    .to(frontImg, {
      duration: 0.3,
      opacity: 1,
      ease: 'none',
    }, 0)

    /* Hero text fades out gently */
    .to('.hero__word, .hero__name, .hero__tagline', {
      duration: 0.35,
      opacity: 0,
      y: -20,
      stagger: 0.06,
      ease: 'power2.in',
    }, 0.05)

    /* Services content fades in */
    .from('.services__heading, .services__sub, .accordion', {
      duration: 0.4,
      opacity: 0,
      y: 30,
      stagger: 0.1,
      ease: 'power2.out',
    }, 0.35)

    .from('.services__workspace', {
      duration: 0.4,
      opacity: 0,
      x: 30,
      ease: 'power2.out',
    }, 0.45);
})();

/* ================================================================
   3. SECTION REVEAL (IntersectionObserver)
   Each .section-reveal fades in when scrolled into view
================================================================ */
(function initSectionReveal() {
  const sections = document.querySelectorAll('.section-reveal');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  sections.forEach(s => observer.observe(s));
})();

/* ================================================================
   4. COUNTER ANIMATION
   Numbers animate from 0 to target when section enters viewport
================================================================ */
(function initCounters() {
  const counters = document.querySelectorAll('[data-target]');

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1800; // ms
    const start = performance.now();

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(eased * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach(el => observer.observe(el));
})();

/* ================================================================
   5. ACCORDION (Services section)
================================================================ */
(function initAccordion() {
  const items = document.querySelectorAll('#accordion .accordion__item');

  items.forEach(item => {
    const trigger = item.querySelector('.accordion__trigger');
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('accordion__item--open');

      // Close all
      items.forEach(i => i.classList.remove('accordion__item--open'));

      // Toggle clicked
      if (!isOpen) {
        item.classList.add('accordion__item--open');
      }
    });
  });
})();

/* ================================================================
   6. FAQ ACCORDION
================================================================ */
(function initFaq() {
  const items = document.querySelectorAll('#faqList .faq__item');

  items.forEach(item => {
    const trigger = item.querySelector('.faq__trigger');
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('faq__item--open');
      items.forEach(i => i.classList.remove('faq__item--open'));
      if (!isOpen) item.classList.add('faq__item--open');
    });
  });
})();

/* ================================================================
   7. MOBILE NAV BURGER
================================================================ */
(function initMobileNav() {
  const burger  = document.getElementById('navBurger');
  const menu    = document.getElementById('mobileMenu');
  const spans   = burger.querySelectorAll('span');
  let open = false;

  burger.addEventListener('click', () => {
    open = !open;
    if (open) {
      menu.style.display = 'block';
      setTimeout(() => menu.classList.add('open'), 10);
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      menu.classList.remove('open');
      setTimeout(() => { if (!open) menu.style.display = 'none'; }, 400);
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  // Close on nav link click
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      open = false;
      menu.classList.remove('open');
      setTimeout(() => { menu.style.display = 'none'; }, 400);
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });
})();

/* ================================================================
   8. NAVBAR: Active link on scroll + scrolled state
================================================================ */
(function initNavScroll() {
  const nav   = document.getElementById('navbar');
  const links = document.querySelectorAll('.nav__link');

  const sections = ['about', 'projects', 'testimonials', 'faq', 'blog', 'contact']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  const setActive = (id) => {
    links.forEach(l => {
      const href = l.getAttribute('href').replace('#', '');
      l.classList.toggle('active', href === id);
    });
  };

  window.addEventListener('scroll', () => {
    const y = window.scrollY;

    // Scrolled navbar style
    if (y > 60) {
      nav.style.padding = '8px 24px';
    } else {
      nav.style.padding = '14px 24px';
    }

    // Active section detection
    let current = '';
    sections.forEach(section => {
      if (section && y >= section.offsetTop - 160) {
        current = section.id;
      }
    });
    if (current) setActive(current);
    else {
      links.forEach(l => l.classList.remove('active'));
      const homeLink = document.querySelector('.nav__link[href="#"]');
      if (homeLink) homeLink.classList.add('active');
    }
  }, { passive: true });
})();

/* ================================================================
   9. PROJECT CARD: staggered entrance animations
================================================================ */
(function initProjectCards() {
  const cards = document.querySelectorAll('.project-card');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          gsap.fromTo(entry.target,
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.7, delay: i * 0.1, ease: 'power3.out' }
          );
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  cards.forEach(c => observer.observe(c));
})();

/* ================================================================
   10. CONTACT FORM: basic validation + submit animation
================================================================ */
(function initContactForm() {
  const submitBtn = document.querySelector('.contact__submit');
  if (!submitBtn) return;

  submitBtn.addEventListener('click', () => {
    const inputs = document.querySelectorAll('.contact__input, .contact__textarea');
    let allFilled = true;

    inputs.forEach(inp => {
      if (!inp.value.trim()) {
        allFilled = false;
        inp.style.borderColor = 'rgba(255,80,80,0.5)';
        setTimeout(() => inp.style.borderColor = '', 2000);
      }
    });

    if (allFilled) {
      submitBtn.textContent = 'SENT ✓';
      submitBtn.style.background = '#c8f135';
      submitBtn.style.color = '#111';
      setTimeout(() => {
        submitBtn.textContent = 'SUBMIT';
        submitBtn.style.background = '';
        submitBtn.style.color = '';
        inputs.forEach(inp => inp.value = '');
      }, 3000);
    }
  });
})();

/* ================================================================
   11. HERO TOGGLE PILL: decorative interaction
================================================================ */
(function initToggle() {
  const track = document.querySelector('.hero__toggle-track');
  const thumb = document.querySelector('.hero__toggle-thumb');
  if (!track) return;

  let toggled = true;
  track.addEventListener('click', () => {
    toggled = !toggled;
    thumb.style.transform = toggled ? '' : 'translateX(-24px)';
  });
})();

/* ================================================================
   12. SMOOTH PARALLAX on portrait images (subtle)
================================================================ */
(function initParallax() {
  if (isMobile()) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const aboutPortrait = document.querySelector('.about__portrait');
    if (aboutPortrait) {
      aboutPortrait.style.transform = `translateY(${y * 0.03}px)`;
    }
  }, { passive: true });
})();

/* ================================================================
   13. CURSOR: custom lime dot on desktop
================================================================ */
(function initCursor() {
  if (isMobile()) return;

  const cursor = document.createElement('div');
  cursor.style.cssText = `
    position: fixed;
    width: 10px; height: 10px;
    background: #c8f135;
    border-radius: 50%;
    pointer-events: none;
    z-index: 99999;
    transform: translate(-50%, -50%);
    transition: transform 0.15s, width 0.25s, height 0.25s, opacity 0.3s;
    mix-blend-mode: difference;
  `;
  document.body.appendChild(cursor);

  const cursorRing = document.createElement('div');
  cursorRing.style.cssText = `
    position: fixed;
    width: 36px; height: 36px;
    border: 1.5px solid rgba(200,241,53,0.5);
    border-radius: 50%;
    pointer-events: none;
    z-index: 99998;
    transform: translate(-50%, -50%);
    transition: left 0.12s, top 0.12s, width 0.25s, height 0.25s, opacity 0.3s;
  `;
  document.body.appendChild(cursorRing);

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
  });

  // Smooth ring follow
  const animateRing = () => {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  };
  animateRing();

  // Hover effect on interactive elements
  const hoverEls = document.querySelectorAll('a, button, .accordion__trigger, .faq__trigger, .project-card');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width  = '18px';
      cursor.style.height = '18px';
      cursorRing.style.width  = '56px';
      cursorRing.style.height = '56px';
      cursorRing.style.borderColor = 'rgba(200,241,53,0.8)';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.width  = '10px';
      cursor.style.height = '10px';
      cursorRing.style.width  = '36px';
      cursorRing.style.height = '36px';
      cursorRing.style.borderColor = 'rgba(200,241,53,0.5)';
    });
  });
})();

/* ================================================================
   14. WINDOW RESIZE: refresh ScrollTrigger
================================================================ */
window.addEventListener('resize', () => {
  ScrollTrigger.refresh();
});

/* ================================================================
   15. PAGE LOAD: initial entrance animation
================================================================ */
window.addEventListener('load', () => {
  // Hero elements already animated via CSS keyframes.
  // Trigger a ScrollTrigger refresh once everything is laid out.
  setTimeout(() => ScrollTrigger.refresh(), 200);
});