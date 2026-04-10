// ===== TEMPLATE 2: WARM BRUTALISM =====

// Spotlight cursor effect
const spotMask = document.getElementById('spotlightMask');
const filledName = document.getElementById('filledName');
let mx = -999, my = -999;

document.addEventListener('mousemove', (e) => {
  const rect = document.querySelector('.hero-outlined').getBoundingClientRect();
  mx = e.clientX;
  my = e.clientY;
  spotMask.style.setProperty('--mx', mx + 'px');
  spotMask.style.setProperty('--my', my + 'px');
  // Also update filled text clip for the outlined hero text
  const relX = mx - rect.left;
  const relY = my - rect.top;
  filledName.style.clipPath = `circle(180px at ${relX}px ${relY}px)`;
});

// Nav drawer toggle
const menuToggle = document.getElementById('menuToggle');
const navDrawer = document.getElementById('navDrawer');
let menuOpen = false;
menuToggle.addEventListener('click', () => {
  menuOpen = !menuOpen;
  navDrawer.classList.toggle('open', menuOpen);
  menuToggle.textContent = menuOpen ? 'Close' : 'Menu';
});
function closeMenu() {
  menuOpen = false;
  navDrawer.classList.remove('open');
  menuToggle.textContent = 'Menu';
}

// Accordion
document.querySelectorAll('.proj-acc-header').forEach(header => {
  header.addEventListener('click', () => {
    const item = header.closest('.proj-acc-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.proj-acc-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// Skill bars
const skillObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.skill-radial-item').forEach((item, i) => {
        const pct = item.dataset.pct;
        setTimeout(() => {
          item.querySelector('.skill-radial-fill').style.width = pct + '%';
        }, i * 120);
      });
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.skills-radial-container').forEach(el => skillObs.observe(el));

// Radar chart
function drawRadar() {
  const canvas = document.getElementById('skillRadar');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const skills = [
    { label: 'JS/TS', value: 0.95 },
    { label: 'React', value: 0.90 },
    { label: 'Node', value: 0.82 },
    { label: 'DB', value: 0.75 },
    { label: 'DevOps', value: 0.60 },
    { label: 'Rust', value: 0.40 },
  ];
  const cx = 160, cy = 160, R = 120;
  const n = skills.length;
  const colors = { grid: 'rgba(232,213,176,0.15)', fill: 'rgba(196,154,138,0.3)', stroke: '#C49A8A', label: 'rgba(232,213,176,0.6)' };

  ctx.clearRect(0, 0, 320, 320);

  // Grid rings
  for (let r = 1; r <= 4; r++) {
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * (R * r / 4);
      const y = cy + Math.sin(angle) * (R * r / 4);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = colors.grid; ctx.lineWidth = 1; ctx.stroke();
  }

  // Axes
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * R, cy + Math.sin(angle) * R);
    ctx.strokeStyle = colors.grid; ctx.lineWidth = 1; ctx.stroke();
  }

  // Data polygon
  ctx.beginPath();
  skills.forEach((s, i) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(angle) * R * s.value;
    const y = cy + Math.sin(angle) * R * s.value;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = colors.fill; ctx.fill();
  ctx.strokeStyle = colors.stroke; ctx.lineWidth = 2; ctx.stroke();

  // Points
  skills.forEach((s, i) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(angle) * R * s.value;
    const y = cy + Math.sin(angle) * R * s.value;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = colors.stroke; ctx.fill();
  });

  // Labels
  ctx.font = '600 12px Space Grotesk, sans-serif';
  ctx.fillStyle = colors.label;
  ctx.textAlign = 'center';
  skills.forEach((s, i) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(angle) * (R + 22);
    const y = cy + Math.sin(angle) * (R + 22) + 4;
    ctx.fillText(s.label, x, y);
  });
}

// Wait for skills section to be visible then draw
const radarObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) drawRadar(); });
}, { threshold: 0.4 });
const skillsSection = document.querySelector('.skills');
if (skillsSection) radarObs.observe(skillsSection);

// Fade in
const fadeObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.edu-block, .exp-block, .proj-acc-item, .mini-stat').forEach(el => {
  el.classList.add('reveal');
  fadeObs.observe(el);
});

// Contact form
document.getElementById('contactForm2')?.addEventListener('submit', e => {
  e.preventDefault();
  const btn = e.target.querySelector('.bf-btn');
  btn.textContent = 'SENT ✓';
  btn.style.background = '#2D4A3E';
  btn.style.color = '#E8D5B0';
  setTimeout(() => { btn.textContent = 'SEND IT →'; btn.style.background = ''; btn.style.color = ''; }, 3000);
});