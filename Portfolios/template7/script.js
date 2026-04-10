// ===== TEMPLATE 1: EDITORIAL INK =====

// Custom cursor
const cursor = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');
let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
  cursorDot.style.left = mouseX + 'px';
  cursorDot.style.top = mouseY + 'px';
});

function animateCursor() {
  cursorX += (mouseX - cursorX) * 0.12;
  cursorY += (mouseY - cursorY) * 0.12;
  cursor.style.left = cursorX + 'px';
  cursor.style.top = cursorY + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

document.querySelectorAll('a, button, .proj-slide').forEach(el => {
  el.addEventListener('mouseenter', () => { cursor.style.width = '60px'; cursor.style.height = '60px'; });
  el.addEventListener('mouseleave', () => { cursor.style.width = '40px'; cursor.style.height = '40px'; });
});

// Hero name reveal on load
window.addEventListener('load', () => {
  setTimeout(() => {
    document.querySelectorAll('.name-line').forEach(el => el.classList.add('visible'));
    const imgWrap = document.querySelector('.hero-img-wrap');
    if (imgWrap) imgWrap.classList.add('visible');
  }, 200);
});

// ===== SCROLL-ACTIVATED TEXT HIGHLIGHT =====
const para = document.getElementById('highlightPara');
if (para) {
  const text = para.textContent;
  const words = text.split(' ');
  para.innerHTML = words.map(w => `<span class="word">${w} </span>`).join('');

  const wordEls = para.querySelectorAll('.word');

  window.addEventListener('scroll', () => {
    const paraRect = para.getBoundingClientRect();
    const viewH = window.innerHeight;
    const progress = 1 - (paraRect.bottom / (viewH + paraRect.height));
    const litCount = Math.floor(progress * wordEls.length * 1.5);

    wordEls.forEach((w, i) => {
      if (i < litCount) w.classList.add('lit');
      else w.classList.remove('lit');
    });
  });
}

// ===== INTERSECTION OBSERVER for reveals =====
const observerOpts = { threshold: 0.15 };
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOpts);

document.querySelectorAll('.edu-item').forEach(el => revealObserver.observe(el));

// ===== COUNTER ANIMATION =====
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.count);
      let current = 0;
      const increment = target / 60;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = Math.floor(current);
      }, 25);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num').forEach(el => counterObserver.observe(el));

// ===== SKILL BARS =====
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.bar-fill').forEach(bar => {
        bar.style.width = bar.dataset.width + '%';
      });
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.skill-category').forEach(el => skillObserver.observe(el));

// ===== HORIZONTAL DRAG SCROLL (Projects) =====
const track = document.getElementById('projectsTrack');
if (track) {
  let isDown = false, startX, scrollLeft;

  track.parentElement.addEventListener('mousedown', e => {
    isDown = true;
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.dataset.offset ? parseInt(track.dataset.offset) : 0;
    track.style.cursor = 'grabbing';
  });
  document.addEventListener('mouseup', () => { isDown = false; track.style.cursor = 'grab'; });
  track.parentElement.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 2;
    let newOffset = scrollLeft - walk;
    const maxOffset = track.scrollWidth - track.parentElement.offsetWidth;
    newOffset = Math.max(0, Math.min(newOffset, maxOffset));
    track.style.transform = `translateX(-${newOffset}px)`;
    track.dataset.offset = newOffset;
  });

  // Touch support
  let touchStartX;
  track.parentElement.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; });
  track.parentElement.addEventListener('touchmove', e => {
    const diff = touchStartX - e.touches[0].clientX;
    let offset = (parseInt(track.dataset.offset) || 0) + diff;
    const maxOffset = track.scrollWidth - track.parentElement.offsetWidth;
    offset = Math.max(0, Math.min(offset, maxOffset));
    track.style.transform = `translateX(-${offset}px)`;
    track.dataset.offset = offset;
    touchStartX = e.touches[0].clientX;
  });
}

// ===== CONTACT FORM =====
document.getElementById('contactForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const btn = e.target.querySelector('.btn-send span:first-child');
  btn.textContent = 'Sent ✓';
  setTimeout(() => { btn.textContent = 'Send Message'; }, 3000);
});

// ===== Smooth section transitions =====
const sections = document.querySelectorAll('.section');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.05 });

sections.forEach(s => {
  s.style.opacity = '0';
  s.style.transform = 'translateY(30px)';
  s.style.transition = 'opacity .8s ease, transform .8s ease';
  sectionObserver.observe(s);
});