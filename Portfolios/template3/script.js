// ===== TEMPLATE 3: DUSK AURORA =====

// Dim paragraph - words light up as you scroll
const dimPara = document.getElementById('dimPara');
if (dimPara) {
  const words = dimPara.textContent.split(' ');
  dimPara.innerHTML = words.map(w => `<span class="dword">${w}</span>`).join(' ');
  const dWords = dimPara.querySelectorAll('.dword');

  window.addEventListener('scroll', () => {
    const rect = dimPara.getBoundingClientRect();
    const viewH = window.innerHeight;
    if (rect.bottom < 0 || rect.top > viewH) return;

    // How far the paragraph has passed into view
    const progress = Math.max(0, Math.min(1, (viewH - rect.top) / (viewH + rect.height)));
    // Accelerate: ease-in curve
    const accelerated = progress * progress * (3 - 2 * progress);
    const litCount = Math.floor(accelerated * dWords.length);
    dWords.forEach((w, i) => w.classList.toggle('lit', i < litCount));
  });
}

// Blob skills - staggered animation on appear
const blobObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.blob-skill').forEach((blob, i) => {
        setTimeout(() => {
          blob.style.opacity = '1';
          blob.style.transform = 'scale(1)';
        }, i * 100);
      });
    }
  });
}, { threshold: 0.2 });

const skillsSection = document.querySelector('.skills');
if (skillsSection) {
  skillsSection.querySelectorAll('.blob-skill').forEach(b => {
    b.style.opacity = '0';
    b.style.transform = 'scale(0.5)';
    b.style.transition = 'opacity 0.6s ease, transform 0.8s cubic-bezier(0.34,1.56,0.64,1)';
  });
  blobObs.observe(skillsSection);
}

// Fade in elements
const fadeObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.edu-card, .exp-aurora-item, .iris-item, .metric-card').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = `opacity 0.7s ease ${i * 0.08}s, transform 0.7s ease ${i * 0.08}s`;
  fadeObs.observe(el);
});

// Contact form
document.getElementById('contactForm3')?.addEventListener('submit', e => {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  btn.textContent = 'Sent ✓';
  btn.style.background = '#6B8F71';
  setTimeout(() => { btn.textContent = 'Send Message'; btn.style.background = ''; }, 3000);
});