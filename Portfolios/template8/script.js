// ===== TEMPLATE 2: WARM BRUTALISM =====

// SPOTLIGHT EFFECT — cursor moves a radial glow
const spotlight = document.getElementById('spotlight');
document.addEventListener('mousemove', e => {
  spotlight.style.left = e.clientX + 'px';
  spotlight.style.top = e.clientY + 'px';
});

// HERO OUTLINED → FILLED via cursor clip-path
const heroFilled = document.getElementById('heroFilled');
const heroTextWrap = document.getElementById('heroTextWrap');
if (heroTextWrap && heroFilled) {
  heroTextWrap.addEventListener('mousemove', e => {
    const rect = heroTextWrap.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    heroFilled.style.webkitClipPath = `circle(120px at ${x}px ${y}px)`;
    heroFilled.style.clipPath = `circle(120px at ${x}px ${y}px)`;
  });
  heroTextWrap.addEventListener('mouseleave', () => {
    heroFilled.style.webkitClipPath = 'circle(0px at 50% 50%)';
    heroFilled.style.clipPath = 'circle(0px at 50% 50%)';
  });
}

// TYPING EFFECT for roles
const roles = ['Full-Stack Engineer', 'UI Architect', 'Systems Thinker', 'Open Source Author'];
let rIdx = 0, cIdx = 0, deleting = false;
const roleEl = document.getElementById('roleTyping');

function typeRole() {
  if (!roleEl) return;
  const current = roles[rIdx];
  if (!deleting) {
    roleEl.textContent = current.slice(0, cIdx + 1);
    cIdx++;
    if (cIdx === current.length) { deleting = true; setTimeout(typeRole, 2000); return; }
  } else {
    roleEl.textContent = current.slice(0, cIdx - 1);
    cIdx--;
    if (cIdx === 0) { deleting = false; rIdx = (rIdx + 1) % roles.length; }
  }
  setTimeout(typeRole, deleting ? 40 : 80);
}
typeRole();

// ACCORDION
document.querySelectorAll('.acc-header').forEach(header => {
  header.addEventListener('click', () => {
    const item = header.parentElement;
    const isActive = item.classList.contains('active');
    document.querySelectorAll('.acc-item').forEach(i => i.classList.remove('active'));
    if (!isActive) item.classList.add('active');
  });
});

// RADAR CHART (canvas)
const canvas = document.getElementById('radarChart');
if (canvas) {
  const ctx = canvas.getContext('2d');
  const categories = ['Frontend', 'Backend', 'DevOps', 'Mobile', 'AI/ML', 'Design'];
  const values = [95, 85, 72, 45, 60, 78];
  const colors = { line: '#C49A8A', fill: 'rgba(196,154,138,0.2)', text: '#0D0D0D', grid: 'rgba(13,13,13,0.1)' };
  const cx = 200, cy = 200, radius = 150;

  function drawRadar() {
    ctx.clearRect(0, 0, 400, 400);
    const n = categories.length;
    const angleStep = (Math.PI * 2) / n;

    // Grid rings
    [0.2, 0.4, 0.6, 0.8, 1].forEach(r => {
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = cx + Math.cos(angle) * radius * r;
        const y = cy + Math.sin(angle) * radius * r;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = colors.grid;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Spokes
    for (let i = 0; i < n; i++) {
      const angle = i * angleStep - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
      ctx.strokeStyle = colors.grid;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Data area
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const val = (values[i] / 100) * radius;
      const x = cx + Math.cos(angle) * val;
      const y = cy + Math.sin(angle) * val;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = colors.fill;
    ctx.fill();
    ctx.strokeStyle = colors.line;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Labels
    ctx.font = '600 13px Space Grotesk';
    ctx.fillStyle = colors.text;
    ctx.textAlign = 'center';
    for (let i = 0; i < n; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = cx + Math.cos(angle) * (radius + 25);
      const y = cy + Math.sin(angle) * (radius + 25);
      ctx.fillText(categories[i], x, y + 5);
    }
  }
  drawRadar();
}

// SKILL BAR ANIMATION
const skillObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.pill-bar span').forEach(bar => {
        bar.style.width = bar.parentElement.previousElementSibling ? '' : bar.style.width;
        // trigger reflow
        const width = bar.style.width;
        bar.style.width = '0';
        setTimeout(() => bar.style.width = width, 100);
      });
      skillObs.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.skills-list-wrap').forEach(el => skillObs.observe(el));

// Animate pill bars on scroll
const pillObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.pill-bar span').forEach((bar, i) => {
        const targetWidth = bar.style.width;
        bar.style.width = '0';
        setTimeout(() => { bar.style.width = targetWidth; }, i * 150);
      });
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.skills-layout').forEach(el => pillObs.observe(el));

// SECTION REVEAL
const sectionObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.05 });

document.querySelectorAll('.section').forEach(s => {
  s.style.opacity = '0'; s.style.transform = 'translateY(40px)';
  s.style.transition = 'opacity .9s ease, transform .9s ease';
  sectionObs.observe(s);
});

// CONTACT FORM
document.getElementById('contactForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const btn = e.target.querySelector('.submit-btn span');
  btn.textContent = 'SENT ✓';
  setTimeout(() => btn.textContent = 'SEND IT', 3000);
});