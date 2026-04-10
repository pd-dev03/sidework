// ===== TEMPLATE 5: MIDNIGHT COPPER =====

// MAGNETIC CURSOR
const magCursor = document.getElementById('magCursor');
let mx = 0, my = 0, cx = 0, cy = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
function animMag() {
  cx += (mx - cx) * 0.15; cy += (my - cy) * 0.15;
  magCursor.style.left = cx + 'px'; magCursor.style.top = cy + 'px';
  requestAnimationFrame(animMag);
}
animMag();

document.querySelectorAll('.mag-target').forEach(el => {
  el.addEventListener('mouseenter', () => { magCursor.style.width = '60px'; magCursor.style.height = '60px'; magCursor.style.background = 'rgba(184,115,51,.15)'; });
  el.addEventListener('mouseleave', () => { magCursor.style.width = '30px'; magCursor.style.height = '30px'; magCursor.style.background = 'transparent'; });
});

// COUNTER
const ctrObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const el = e.target; const target = parseInt(el.dataset.count);
      let cur = 0;
      const step = target / 60;
      const t = setInterval(() => {
        cur += step; if (cur >= target) { cur = target; clearInterval(t); }
        el.textContent = Math.floor(cur);
      }, 25);
      ctrObs.unobserve(el);
    }
  });
}, { threshold: .5 });
document.querySelectorAll('.hs-n').forEach(el => ctrObs.observe(el));

// SCROLL HIGHLIGHT — Copper
const copperPara = document.getElementById('copperHighlightPara');
if (copperPara) {
  const words = copperPara.textContent.split(' ');
  copperPara.innerHTML = words.map(w => `<span class="word">${w} </span>`).join('');
  const wordEls = copperPara.querySelectorAll('.word');

  window.addEventListener('scroll', () => {
    const rect = copperPara.getBoundingClientRect();
    const progress = 1 - (rect.bottom / (window.innerHeight + rect.height));
    const litCount = Math.floor(Math.max(0, progress * wordEls.length * 1.5));
    wordEls.forEach((w, i) => {
      if (i < litCount) w.classList.add('lit'); else w.classList.remove('lit');
    });
  });
}

// SLIDE IN BLOCKS
const slideObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
}, { threshold: 0.2 });
document.querySelectorAll('.slide-in-block').forEach(el => slideObs.observe(el));

// EXP ITEMS reveal
const expObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
}, { threshold: 0.2 });
document.querySelectorAll('.es-item').forEach((el, i) => {
  el.style.transitionDelay = `${i * 0.12}s`;
  expObs.observe(el);
});

// SKILL BARS
const skObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.skill-copper-row').forEach((row, i) => {
        const fill = row.querySelector('.scr-fill');
        const pct = row.dataset.pct;
        setTimeout(() => { fill.style.width = pct + '%'; }, i * 130);
      });
      skObs.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.skl-left').forEach(el => skObs.observe(el));

// SECTION REVEAL
const secObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; } });
}, { threshold: 0.05 });
document.querySelectorAll('.section').forEach(s => {
  s.style.opacity = '0'; s.style.transform = 'translateY(30px)';
  s.style.transition = 'opacity .9s ease, transform .9s ease';
  secObs.observe(s);
});

// CONTACT FORM
document.getElementById('contactForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const btn = e.target.querySelector('.copper-btn');
  btn.querySelector('span:first-child').textContent = 'Sent ✓';
  btn.style.background = '#2D5A3D';
  setTimeout(() => { btn.querySelector('span:first-child').textContent = 'Send Message'; btn.style.background = ''; }, 3000);
});