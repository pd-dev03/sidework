// ===== TEMPLATE 1: EDITORIAL INK =====

// Custom cursor
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');
let mouseX = 0, mouseY = 0, followerX = 0, followerY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX; mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';
});

(function animateFollower() {
  followerX += (mouseX - followerX) * 0.12;
  followerY += (mouseY - followerY) * 0.12;
  follower.style.left = followerX + 'px';
  follower.style.top = followerY + 'px';
  requestAnimationFrame(animateFollower);
})();

// Cursor scale on hover
document.querySelectorAll('a, button, .proj-item, .tag-cloud span').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(2)';
    follower.style.transform = 'translate(-50%, -50%) scale(1.5)';
    follower.style.opacity = '0.15';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
    follower.style.transform = 'translate(-50%, -50%) scale(1)';
    follower.style.opacity = '0.5';
  });
});

// Typing effect for hero role
const roles = ['Product Designer', 'Front-End Developer', 'Creative Technologist', 'UI/UX Specialist'];
let roleIndex = 0, charIndex = 0, isDeleting = false;
const typingEl = document.getElementById('typingText');

function type() {
  const current = roles[roleIndex];
  if (isDeleting) {
    typingEl.textContent = current.substring(0, charIndex--);
    if (charIndex < 0) { isDeleting = false; roleIndex = (roleIndex + 1) % roles.length; setTimeout(type, 400); return; }
  } else {
    typingEl.textContent = current.substring(0, charIndex++);
    if (charIndex > current.length) { isDeleting = true; setTimeout(type, 1800); return; }
  }
  setTimeout(type, isDeleting ? 60 : 110);
}
setTimeout(type, 1000);

// Scroll-activated word highlight (accelerating)
const para = document.getElementById('aboutPara');
if (para) {
  const text = para.textContent;
  const words = text.split(' ');
  para.innerHTML = words.map(w => `<span class="word">${w}</span>`).join(' ');
  const wordEls = para.querySelectorAll('.word');

  window.addEventListener('scroll', () => {
    const rect = para.getBoundingClientRect();
    const viewH = window.innerHeight;
    if (rect.top > viewH || rect.bottom < 0) return;

    const progress = Math.max(0, Math.min(1, (viewH - rect.top) / (viewH + rect.height)));
    // Accelerating: square the progress so words light up faster near the end
    const accel = Math.pow(progress, 0.7);
    const litCount = Math.floor(accel * wordEls.length);

    wordEls.forEach((w, i) => {
      if (i < litCount) w.classList.add('lit');
    });
  });
}

// Skill bars animate on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.skill-bar-fill').forEach(bar => {
        bar.style.width = bar.dataset.width + '%';
      });
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.skills').forEach(s => observer.observe(s));

// Fade in sections
const fadeObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });

document.querySelectorAll('.edu-item, .exp-item, .proj-item, .stat, .skill-category, .lang-item').forEach(el => {
  el.classList.add('fade-in');
  fadeObs.observe(el);
});

// Form submission
document.getElementById('contactForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('.submit-btn');
  btn.textContent = 'Message Sent ✓';
  btn.style.background = '#8A9E7B';
  setTimeout(() => { btn.innerHTML = 'Send Message <span>→</span>'; btn.style.background = ''; }, 3000);
});