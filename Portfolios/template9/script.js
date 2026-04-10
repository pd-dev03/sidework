// ===== TEMPLATE 3: DUSK AURORA =====

// AMBER WORD HIGHLIGHT on scroll
const para = document.getElementById('auroraPara');
if (para) {
  const words = para.textContent.split(' ');
  para.innerHTML = words.map(w => `<span class="word">${w} </span>`).join('');
  const wordEls = para.querySelectorAll('.word');

  window.addEventListener('scroll', () => {
    const rect = para.getBoundingClientRect();
    const progress = 1 - (rect.bottom / (window.innerHeight + rect.height));
    const litCount = Math.floor(Math.max(0, progress * wordEls.length * 1.4));
    wordEls.forEach((w, i) => {
      if (i < litCount) w.classList.add('lit');
      else w.classList.remove('lit');
    });
  });
}

// TIMELINE SVG path draw animation
const pathAnimated = document.getElementById('timelinePathAnimated');
const timelineSvg = document.getElementById('timelineSvg');
if (timelineSvg && pathAnimated) {
  const tObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        pathAnimated.style.transition = 'stroke-dashoffset 2.5s cubic-bezier(.4,0,.2,1)';
        pathAnimated.style.strokeDashoffset = '0';
        tObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  tObs.observe(timelineSvg);
}

// TIMELINE ITEMS reveal
const tlObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); }
  });
}, { threshold: 0.2 });
document.querySelectorAll('.tl-item').forEach((el, i) => {
  el.style.transitionDelay = `${i * 0.15}s`;
  tlObs.observe(el);
});

// LANGUAGE BAR FILL on scroll
const lbObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.lb-fill').forEach((bar, i) => {
        const w = bar.style.width;
        bar.style.width = '0';
        setTimeout(() => { bar.style.width = w; }, i * 200);
      });
      lbObs.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.languages-block').forEach(el => lbObs.observe(el));

// SECTION FADE IN
const secObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.05 });

document.querySelectorAll('.section').forEach(s => {
  s.style.opacity = '0'; s.style.transform = 'translateY(30px)';
  s.style.transition = 'opacity .9s ease, transform .9s ease';
  secObs.observe(s);
});

// CONTACT FORM
document.getElementById('contactForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const btn = e.target.querySelector('.aurora-btn');
  btn.textContent = 'Message Sent ✓';
  btn.style.background = '#2D4A3E';
  setTimeout(() => { btn.textContent = 'Send Message'; btn.style.background = ''; }, 3000);
});