// ===== TEMPLATE 4: MOSS & SAND =====

// PARALLAX BG text on scroll
const bgText = document.getElementById('heroBgText');
window.addEventListener('scroll', () => {
  if (bgText) bgText.style.transform = `translateY(calc(-50% + ${window.scrollY * 0.3}px))`;
});

// SCROLL HIGHLIGHT paragraph
const mossPara = document.getElementById('mossHighlightPara');
if (mossPara) {
  const words = mossPara.textContent.split(' ');
  mossPara.innerHTML = words.map(w => `<span class="word">${w} </span>`).join('');
  const wordEls = mossPara.querySelectorAll('.word');

  window.addEventListener('scroll', () => {
    const rect = mossPara.getBoundingClientRect();
    const progress = 1 - (rect.bottom / (window.innerHeight + rect.height));
    const litCount = Math.floor(Math.max(0, progress * wordEls.length * 1.5));
    wordEls.forEach((w, i) => {
      if (i < litCount) w.classList.add('lit'); else w.classList.remove('lit');
    });
  });
}

// SKILL BARS
const skillObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.sr-fill').forEach((fill, i) => {
        const pct = fill.closest('.skill-row').dataset.pct;
        setTimeout(() => { fill.style.width = pct + '%'; }, i * 120);
      });
      skillObs.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.skills-left').forEach(el => skillObs.observe(el));

// FLIP CARDS — also toggle on click for mobile
document.querySelectorAll('.flip-card').forEach(card => {
  card.addEventListener('click', () => {
    if (window.innerWidth < 768) card.classList.toggle('flipped');
  });
});

// SECTION REVEAL
const sObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; }
  });
}, { threshold: 0.05 });

document.querySelectorAll('.section').forEach(s => {
  s.style.opacity = '0'; s.style.transform = 'translateY(30px)';
  s.style.transition = 'opacity .9s ease, transform .9s ease';
  sObs.observe(s);
});

// EDUCATION entries stagger
const eduObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      document.querySelectorAll('.edu-entry').forEach((el, i) => {
        setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, i * 150);
      });
      eduObs.disconnect();
    }
  });
}, { threshold: 0.2 });
const eduSection = document.querySelector('.edu-section');
if (eduSection) {
  document.querySelectorAll('.edu-entry').forEach(el => {
    el.style.opacity = '0'; el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity .6s ease, transform .6s ease';
  });
  eduObs.observe(eduSection);
}

// CONTACT FORM
document.getElementById('contactForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const btn = e.target.querySelector('.mb-text');
  btn.textContent = 'Message Sent!';
  setTimeout(() => btn.textContent = 'Send Message', 3000);
});