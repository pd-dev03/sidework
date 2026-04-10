// ===== TEMPLATE 5: COPPER MINIMAL =====

// Counter animation
function animateCounter(el, target, duration = 2000) {
  let start = null;
  const startVal = 0;
  const step = (ts) => {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  };
  requestAnimationFrame(step);
}

// Hero years counter
const yearsCount = document.getElementById('yearsCount');
let yearsAnimated = false;
const heroObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting && !yearsAnimated) {
      yearsAnimated = true;
      animateCounter(yearsCount, 12);
    }
  });
}, { threshold: 0.5 });
if (yearsCount) heroObs.observe(yearsCount);

// About counters
const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.counter-num').forEach(el => {
        animateCounter(el, parseInt(el.dataset.target));
      });
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.counters').forEach(el => counterObs.observe(el));

// Word highlight
const aboutHighlight = document.getElementById('aboutHighlight');
if (aboutHighlight) {
  const words = aboutHighlight.textContent.split(' ');
  aboutHighlight.innerHTML = words.map(w => `<span class="wh">${w}</span>`).join(' ');
  const whs = aboutHighlight.querySelectorAll('.wh');
  window.addEventListener('scroll', () => {
    const rect = aboutHighlight.getBoundingClientRect();
    const viewH = window.innerHeight;
    if (rect.bottom < 0 || rect.top > viewH) return;
    const progress = Math.max(0, Math.min(1, (viewH - rect.top) / (viewH + rect.height)));
    const accel = Math.pow(progress, 0.6);
    whs.forEach((w, i) => w.classList.toggle('lit', i < Math.floor(accel * whs.length)));
  });
}

// Skill bars
const skillObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.sk-item').forEach((item, i) => {
        setTimeout(() => {
          item.querySelector('.sk-fill').style.width = item.dataset.w + '%';
        }, i * 90);
      });
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.skills-copper').forEach(s => skillObs.observe(s));

// Fade in
const fadeObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'none'; } });
}, { threshold: 0.1 });
document.querySelectorAll('.edu-single, .exp-single, .proj-single, .counter-item').forEach((el, i) => {
  el.style.opacity = '0'; el.style.transform = 'translateY(20px)';
  el.style.transition = `opacity 0.6s ease ${i * 0.06}s, transform 0.6s ease ${i * 0.06}s`;
  fadeObs.observe(el);
});

// Form
document.getElementById('contactForm5')?.addEventListener('submit', e => {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  btn.textContent = 'Sent ✓';
  btn.style.background = 'var(--copper)';
  setTimeout(() => { btn.textContent = 'Send Inquiry →'; btn.style.background = ''; }, 3000);
});