// ===== TEMPLATE 4: MIDNIGHT SAGE =====

// Glitch effect on name
const glitchName = document.getElementById('glitchName');
function doGlitch() {
  if (!glitchName) return;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%';
  const original = glitchName.innerText;
  let i = 0;
  const interval = setInterval(() => {
    glitchName.innerText = original.split('').map((c, idx) => {
      if (c === '\n') return '\n';
      if (idx < i) return original[idx];
      return chars[Math.floor(Math.random() * chars.length)];
    }).join('');
    i++;
    if (i > original.length) { glitchName.innerText = original; clearInterval(interval); }
  }, 40);
}
setInterval(doGlitch, 4000);
setTimeout(doGlitch, 500);

// Horizontal drag-to-scroll
const track = document.getElementById('projTrack');
if (track) {
  let isDragging = false, startX, scrollLeft;
  track.addEventListener('mousedown', e => {
    isDragging = true; startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft; track.style.cursor = 'grabbing';
  });
  track.addEventListener('mouseleave', () => { isDragging = false; track.style.cursor = 'grab'; });
  track.addEventListener('mouseup', () => { isDragging = false; track.style.cursor = 'grab'; });
  track.addEventListener('mousemove', e => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 1.5;
    track.scrollLeft = scrollLeft - walk;
  });
}

// Scroll highlight (about big quote)
const bigQuote = document.getElementById('scrollHighlight');
if (bigQuote) {
  const words = bigQuote.textContent.split(' ');
  bigQuote.innerHTML = words.map(w => `<span class="hw">${w}</span>`).join(' ');
  const hWords = bigQuote.querySelectorAll('.hw');
  window.addEventListener('scroll', () => {
    const rect = bigQuote.getBoundingClientRect();
    const viewH = window.innerHeight;
    if (rect.bottom < 0 || rect.top > viewH) return;
    const progress = Math.max(0, Math.min(1, (viewH - rect.top) / (viewH + rect.height)));
    const accel = Math.pow(progress, 0.65);
    hWords.forEach((w, i) => w.classList.toggle('lit', i < Math.floor(accel * hWords.length)));
  });
}

// Skills animate
const skillObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.skill-meter').forEach((meter, i) => {
        setTimeout(() => {
          meter.querySelector('.sm-fill').style.width = meter.dataset.level + '%';
        }, i * 100);
      });
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.skills-terminal').forEach(s => skillObs.observe(s));

// Fade in
const fadeObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'none'; } });
}, { threshold: 0.1 });
document.querySelectorAll('.exp-row, .proj-h-item, .term-entry, .fact').forEach((el, i) => {
  el.style.opacity = '0'; el.style.transform = 'translateY(24px)';
  el.style.transition = `opacity 0.7s ease ${i*0.07}s, transform 0.7s ease ${i*0.07}s`;
  fadeObs.observe(el);
});

// Form
document.getElementById('contactForm4')?.addEventListener('submit', e => {
  e.preventDefault();
  const btn = e.target.querySelector('.send-btn');
  btn.textContent = '$ message.sent ✓';
  btn.style.background = 'var(--sage)'; btn.style.color = 'var(--forest)';
  setTimeout(() => { btn.textContent = '$ submit.send() →'; btn.style.background = ''; btn.style.color = ''; }, 3000);
});