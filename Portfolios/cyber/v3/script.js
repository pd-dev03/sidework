/**
 * THE INFILTRATOR — script.js v2.5
 * All existing features preserved + new additions:
 * - Hex Stream Canvas (ambient)
 * - Network Packet Visualizer (services bg)
 * - SVG Threat Map with animated arcs
 * - Skills: memory-allocation bars + language dots
 * - Contact form with validation
 * - Konami Code easter egg
 * - Grain overlay (CSS-driven)
 */

$(document).ready(function () {

  gsap.registerPlugin(ScrollTrigger);

  /* ══════════════════════════════════════════════
     1. BOOT SEQUENCE (original — unchanged)
  ══════════════════════════════════════════════ */
  const BOOT_MESSAGES = [
    { text: 'BIOS v2.5.0 · Initializing secure boot chain...', type: 'ok' },
    { text: 'Memory scan: 32768 MB DDR5 · No anomalies detected', type: 'ok' },
    { text: 'Loading kernel modules: crypto_aes, net_filter, iptable_raw', type: 'ok' },
    { text: 'Mounting encrypted partitions: /dev/sda3 [AES-256-XTS]', type: 'ok' },
    { text: 'Network interface eth0: UP · Link 10Gb/s', type: 'ok' },
    { text: 'Firewall: 1847 active rules loaded · REJECT default policy', type: 'ok' },
    { text: 'TOR relay: Bridge mode engaged · 3-hop circuit established', type: 'ok' },
    { text: 'DNS: Encrypted over HTTPS · Leak test: NEGATIVE', type: 'ok' },
    { text: 'Loading operational profile [v2.5] ...', type: '' },
    { text: 'Operator credentials verified · Welcome, MV-0x4F2A1', type: 'ok' },
    { text: 'Hex stream: ACTIVE · Packet viz: ONLINE · Threat map: ARMED', type: 'ok' },
    { text: 'System integrity: VERIFIED · Launching interface', type: 'ok' },
  ];

  const $bootLines = $('#boot-lines');
  const $bootBar   = $('#boot-progress-bar');
  let   lineIndex  = 0;
  let   progress   = 0;

  function showNextBootLine() {
    if (lineIndex >= BOOT_MESSAGES.length) {
      animateProgressTo(100, () => {
        setTimeout(() => {
          $('#boot-screen').addClass('hidden');
          initMainPage();
        }, 400);
      });
      return;
    }
    const msg  = BOOT_MESSAGES[lineIndex];
    const $el  = $('<span class="boot-line"></span>').text('$ ' + msg.text);
    if (msg.type) $el.addClass(msg.type);
    $bootLines.append($el);
    requestAnimationFrame(() => $el.addClass('visible'));
    progress = Math.round(((lineIndex + 1) / BOOT_MESSAGES.length) * 92);
    $bootBar.css('width', progress + '%');
    lineIndex++;
    setTimeout(showNextBootLine, 80 + Math.random() * 100);
  }

  function animateProgressTo(target, cb) {
    let cur = progress;
    const step = () => {
      cur = Math.min(cur + 2, target);
      $bootBar.css('width', cur + '%');
      if (cur < target) requestAnimationFrame(step);
      else if (cb) cb();
    };
    requestAnimationFrame(step);
  }

  setTimeout(showNextBootLine, 300);

  /* ══════════════════════════════════════════════
     2. CUSTOM CURSOR (original — unchanged)
  ══════════════════════════════════════════════ */
  const $dot  = $('#cursor-dot');
  const $ring = $('#cursor-ring');
  let ringX = 0, ringY = 0, dotX = 0, dotY = 0;

  $(document).on('mousemove', function (e) { dotX = e.clientX; dotY = e.clientY; });

  (function animateCursor() {
    ringX += (dotX - ringX) * 0.12;
    ringY += (dotY - ringY) * 0.12;
    $dot.css({ left: dotX + 'px', top: dotY + 'px' });
    $ring.css({ left: ringX + 'px', top: ringY + 'px' });
    requestAnimationFrame(animateCursor);
  })();

  $(document).on('mouseenter', 'a, button, .engagement-item, .kc-stage, .filter-btn, .service-item, .itag, .tool-tag', function () { $('body').addClass('cursor-hover'); });
  $(document).on('mouseleave', 'a, button, .engagement-item, .kc-stage, .filter-btn, .service-item, .itag, .tool-tag', function () { $('body').removeClass('cursor-hover'); });

  /* ══════════════════════════════════════════════
     3. HEX STREAM CANVAS (new)
     Ambient falling hex pairs — gold, ultra-subtle
  ══════════════════════════════════════════════ */
  function initHexStream() {
    const canvas = document.getElementById('hex-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const COLS     = Math.floor(window.innerWidth / 28);
    const HEX_CHARS = '0123456789ABCDEF';
    const columns  = Array.from({ length: COLS }, () => Math.random() * -50);

    function drawHex() {
      ctx.fillStyle = 'rgba(8,8,8,0.06)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = '11px "Space Mono", monospace';

      columns.forEach((y, i) => {
        const pair  = HEX_CHARS[Math.floor(Math.random() * 16)] + HEX_CHARS[Math.floor(Math.random() * 16)];
        const x     = i * 28;
        const alpha = 0.25 + Math.random() * 0.35;
        ctx.fillStyle = `rgba(125, 105, 48, ${alpha})`; // gold-dim in rgba
        ctx.fillText(pair, x, y * 16);

        if (y * 16 > canvas.height && Math.random() > 0.97) {
          columns[i] = 0;
        } else {
          columns[i] = y + 0.4;
        }
      });
    }

    setInterval(drawHex, 70);
  }

  /* ══════════════════════════════════════════════
     4. NETWORK PACKET VISUALIZER (services bg)
     Nodes + animated dashed packets between them
  ══════════════════════════════════════════════ */
  function initPacketViz() {
    const canvas = document.getElementById('packet-canvas');
    if (!canvas) return;
    const ctx    = canvas.getContext('2d');
    const parent = canvas.parentElement;

    function resize() {
      canvas.width  = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const NODE_LABELS = ['BURP', 'NMAP', 'COBALT', 'SLIVER', 'C2', 'TARGET', 'RECON', 'PIVOT'];
    const GOLD = 'rgba(125,105,48,';

    const nodes = NODE_LABELS.map((label, i) => ({
      label,
      x: 80 + (i % 4) * (canvas.width / 4 - 20) + Math.random() * 60,
      y: 60 + Math.floor(i / 4) * (canvas.height / 2 - 40) + Math.random() * 60,
      r: 6,
      pulse: Math.random() * Math.PI * 2,
    }));

    const packets = [];

    function spawnPacket() {
      const from = Math.floor(Math.random() * nodes.length);
      let to = Math.floor(Math.random() * nodes.length);
      while (to === from) to = Math.floor(Math.random() * nodes.length);
      packets.push({ from, to, t: 0, speed: 0.004 + Math.random() * 0.004 });
    }

    setInterval(spawnPacket, 600);

    function drawPackets() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw edges (faint)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (Math.abs(i - j) <= 2) {
            ctx.beginPath();
            ctx.setLineDash([3, 8]);
            ctx.strokeStyle = GOLD + '0.15)';
            ctx.lineWidth = 0.8;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
      }

      // Draw nodes
      nodes.forEach(node => {
        node.pulse += 0.03;
        const p = (Math.sin(node.pulse) + 1) / 2;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r + p * 2, 0, Math.PI * 2);
        ctx.fillStyle = GOLD + '0.08)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fillStyle = GOLD + '0.4)';
        ctx.fill();
        ctx.font = '9px "Space Mono"';
        ctx.fillStyle = GOLD + '0.5)';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y - node.r - 5);
      });

      // Draw packets
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.t += p.speed;
        if (p.t >= 1) { packets.splice(i, 1); continue; }
        const n0 = nodes[p.from], n1 = nodes[p.to];
        const px = n0.x + (n1.x - n0.x) * p.t;
        const py = n0.y + (n1.y - n0.y) * p.t;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = GOLD + '0.8)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fillStyle = GOLD + '0.15)';
        ctx.fill();
      }

      requestAnimationFrame(drawPackets);
    }

    drawPackets();
  }

  /* ══════════════════════════════════════════════
     5. THREAT MAP (new)
     World map dots + animated arc attacks
  ══════════════════════════════════════════════ */
  function initThreatMap() {
    const canvas = document.getElementById('threat-map-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const W = () => canvas.width;
    const H = () => canvas.height;

    // Convert lat/lon to canvas x/y (equirectangular)
    function project(lat, lon) {
      const x = ((lon + 180) / 360) * W();
      const y = ((90 - lat) / 180) * H();
      return { x, y };
    }

    // Simplified continent outlines as lat/lon polygons
    const LANDMASS = [
      // North America
      [[70,-140],[70,-55],[25,-55],[10,-75],[10,-83],[8,-77],[8,-83],[17,-92],[15,-83],[20,-105],[32,-117],[49,-124],[55,-130],[60,-145],[70,-140]],
      // South America
      [[10,-75],[10,-60],[-5,-35],[-35,-57],[-55,-67],[-55,-75],[-33,-70],[-18,-70],[-10,-75],[-5,-78],[10,-75]],
      // Europe
      [[70,30],[70,60],[50,40],[37,28],[37,5],[43,-9],[48,-5],[52,-5],[57,-3],[59,5],[57,12],[55,25],[53,23],[55,22],[65,15],[70,25],[70,30]],
      // Africa
      [[37,5],[37,28],[30,35],[12,42],[0,42],[-10,40],[-35,27],[-35,18],[-17,12],[5,2],[5,-5],[14,-17],[14,-13],[15,0],[37,5]],
      // Asia
      [[70,60],[70,140],[55,135],[43,130],[35,120],[23,120],[10,105],[10,100],[1,104],[5,100],[18,94],[22,90],[22,70],[25,62],[30,60],[38,56],[40,50],[55,48],[60,60],[70,60]],
      // Australia
      [[-17,122],[-20,119],[-30,115],[-35,118],[-38,146],[-38,150],[-28,153],[-18,145],[-13,136],[-13,131],[-17,122]],
    ];

    const ORIGIN_NODES = [
      { lat: 40.7, lon: -74, label: 'NYC' },
      { lat: 51.5, lon: -0.1, label: 'LON' },
      { lat: 48.8, lon: 2.3, label: 'PAR' },
      { lat: 35.7, lon: 139.7, label: 'TKY' },
      { lat: 55.7, lon: 37.6, label: 'MSC' },
      { lat: 39.9, lon: 116.4, label: 'BEJ' },
      { lat: 28.6, lon: 77.2, label: 'DEL' },
      { lat: 37.5, lon: 127, label: 'SEO' },
      { lat: -33.9, lon: 18.4, label: 'CPT' },
      { lat: 1.3, lon: 103.8, label: 'SIN' },
      { lat: 19.1, lon: 72.9, label: 'MUM' },
      { lat: -23.5, lon: -46.6, label: 'SAO' },
    ];

    const arcs = [];
    let attackCount = 0;
    let activeCount = 0;

    function spawnArc() {
      const from = ORIGIN_NODES[Math.floor(Math.random() * ORIGIN_NODES.length)];
      let to = ORIGIN_NODES[Math.floor(Math.random() * ORIGIN_NODES.length)];
      while (to === from) to = ORIGIN_NODES[Math.floor(Math.random() * ORIGIN_NODES.length)];
      arcs.push({ from, to, t: 0, speed: 0.003 + Math.random() * 0.003, done: false });
      attackCount++;
      activeCount++;
      $('#tm-attacks').text(attackCount);
      $('#tm-active').text(activeCount);
    }

    setInterval(spawnArc, 1200);

    function drawMap() {
      ctx.clearRect(0, 0, W(), H());

      // Draw background
      ctx.fillStyle = 'rgba(13,13,13,0.6)';
      ctx.fillRect(0, 0, W(), H());

      // Draw grid lines
      ctx.strokeStyle = 'rgba(74,78,105,0.08)';
      ctx.lineWidth = 0.5;
      for (let lat = -90; lat <= 90; lat += 30) {
        const p1 = project(lat, -180);
        const p2 = project(lat, 180);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
      for (let lon = -180; lon <= 180; lon += 30) {
        const p1 = project(90, lon);
        const p2 = project(-90, lon);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      // Draw landmass
      ctx.fillStyle = 'rgba(74,78,105,0.12)';
      ctx.strokeStyle = 'rgba(74,78,105,0.25)';
      ctx.lineWidth = 0.8;
      LANDMASS.forEach(poly => {
        ctx.beginPath();
        poly.forEach((pt, i) => {
          const p = project(pt[0], pt[1]);
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });

      // Draw arcs
      for (let i = arcs.length - 1; i >= 0; i--) {
        const arc = arcs[i];
        arc.t += arc.speed;
        if (arc.t > 1.2) {
          arcs.splice(i, 1);
          activeCount = Math.max(0, activeCount - 1);
          $('#tm-active').text(activeCount);
          continue;
        }

        const p0 = project(arc.from.lat, arc.from.lon);
        const p1 = project(arc.to.lat,   arc.to.lon);
        const midX = (p0.x + p1.x) / 2;
        const midY = Math.min(p0.y, p1.y) - Math.hypot(p1.x - p0.x, p1.y - p0.y) * 0.3;

        const t = Math.min(arc.t, 1);
        // Quadratic bezier progress: draw only the "head" segment
        const HEAD = 0.12;
        const tStart = Math.max(0, t - HEAD);

        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.lineWidth = 1;
        const alpha = arc.t > 1 ? Math.max(0, 1.2 - arc.t) : 1;
        ctx.strokeStyle = `rgba(201,168,76,${0.5 * alpha})`;

        const steps = 20;
        for (let s = 0; s <= steps; s++) {
          const bt = tStart + (t - tStart) * (s / steps);
          const bx = (1-bt)*(1-bt)*p0.x + 2*(1-bt)*bt*midX + bt*bt*p1.x;
          const by = (1-bt)*(1-bt)*p0.y + 2*(1-bt)*bt*midY + bt*bt*p1.y;
          if (s === 0) ctx.moveTo(bx, by);
          else ctx.lineTo(bx, by);
        }
        ctx.stroke();

        // Draw head dot
        const hx = (1-t)*(1-t)*p0.x + 2*(1-t)*t*midX + t*t*p1.x;
        const hy = (1-t)*(1-t)*p0.y + 2*(1-t)*t*midY + t*t*p1.y;
        ctx.beginPath();
        ctx.arc(hx, hy, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232,201,106,${alpha})`;
        ctx.fill();
      }

      // Draw origin nodes
      const now = Date.now();
      ORIGIN_NODES.forEach(node => {
        const p = project(node.lat, node.lon);
        const pulse = (Math.sin(now * 0.002 + node.lat) + 1) / 2;

        // Outer pulse ring
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5 + pulse * 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(125,105,48,0.07)';
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(125,105,48,0.7)';
        ctx.fill();

        // Label
        ctx.font = '8px "Space Mono"';
        ctx.fillStyle = 'rgba(107,112,145,0.7)';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, p.x, p.y - 9);
      });

      requestAnimationFrame(drawMap);
    }

    drawMap();
  }

  /* ══════════════════════════════════════════════
     6. MAIN PAGE INIT
  ══════════════════════════════════════════════ */
  function initMainPage() {
    initHexStream();
    initPacketViz();
    initThreatMap();
    initNav();
    initTerminal();
    initHeroReveal();
    initScrollDecrypt();
    initScrollAnimations();
    initKillChainProgress();
    initEngagementFilter();
    initSkillBars();
    initLangDots();
    initContactForm();
    initPgpCopy();
    initHandshakeTimer();
    initKonami();
    initSectionTagScramble();
    initHeroGlitch();
    initParallax();
  }

  /* ══════════════════════════════════════════════
     7. NAV (original)
  ══════════════════════════════════════════════ */
  function initNav() {
    $(window).on('scroll', function () {
      if ($(this).scrollTop() > 60) $('#nav').addClass('scrolled');
      else $('#nav').removeClass('scrolled');
    });
    $('a[href^="#"]').on('click', function (e) {
      const target = $($(this).attr('href'));
      if (target.length) {
        e.preventDefault();
        $('html, body').animate({ scrollTop: target.offset().top - 80 }, 700);
      }
    });
  }

  /* ══════════════════════════════════════════════
     8. TERMINAL (original)
  ══════════════════════════════════════════════ */
  const TERMINAL_LINES = [
    { text: 'whoami', cls: 'cmd', delay: 200 },
    { text: '──────────────────────────────────', cls: 'sep', delay: 100 },
    { text: 'NAME         :  Marcus R. Vance', cls: 'val', delay: 80 },
    { text: 'ALIAS        :  /dev/null', cls: 'val', delay: 80 },
    { text: 'CLEARANCE    :  TOP SECRET/SCI', cls: 'val', delay: 80 },
    { text: 'SPECIALITY   :  Offensive Security', cls: 'val', delay: 80 },
    { text: 'CVEs AUTHORED:  12 (and counting)', cls: 'val', delay: 80 },
    { text: 'LOCATION     :  [CLASSIFIED]', cls: 'val', delay: 80 },
    { text: '──────────────────────────────────', cls: 'sep', delay: 80 },
    { text: 'STATUS       :  Available Q1 2025', cls: 'val', delay: 80 },
  ];

  function initTerminal() {
    const $body = $('#terminal-output');
    let   idx   = 0;
    function typeLine() {
      if (idx >= TERMINAL_LINES.length) {
        $body.append('<span class="t-line val" style="opacity:1"><span class="t-cursor"></span></span>');
        return;
      }
      const line = TERMINAL_LINES[idx];
      const $line = $('<span class="t-line ' + line.cls + '"></span>').text(line.text);
      $body.append($line);
      gsap.to($line[0], { opacity: 1, duration: 0.15 });
      idx++;
      setTimeout(typeLine, line.delay + Math.random() * 60);
    }
    setTimeout(typeLine, 600);
    setTimeout(() => $('.terminal-block').addClass('visible'), 300);
  }

  /* ══════════════════════════════════════════════
     9. HERO REVEAL (original)
  ══════════════════════════════════════════════ */
  function initHeroReveal() {
    setTimeout(() => {
      $('.hero-type-block').addClass('visible');
      $('.clearance-badge').addClass('visible');
    }, 800);
  }

  /* ══════════════════════════════════════════════
     10. SCROLL DECRYPT (original)
  ══════════════════════════════════════════════ */
  function initScrollDecrypt() {
    const $para = $('#decrypt-text');
    const raw   = $para.text().trim();
    const words = raw.split(/(\s+)/);
    $para.empty();
    const wordSpans = [];
    words.forEach(function (token) {
      if (/^\s+$/.test(token)) {
        $para.append(document.createTextNode(token));
      } else if (token.length > 0) {
        const $w = $('<span class="word"></span>').text(token);
        $para.append($w);
        wordSpans.push($w[0]);
      }
    });
    ScrollTrigger.create({
      trigger: '#decrypt-section',
      start: 'top 80%',
      end: 'bottom 20%',
      scrub: true,
      onUpdate(self) {
        const eased = self.progress * self.progress;
        const numToLight = Math.floor(eased * wordSpans.length * 1.05);
        wordSpans.forEach((span, i) => {
          if (i < numToLight) { span.classList.add('lit'); span.classList.remove('current'); }
          else if (i === numToLight) { span.classList.add('current'); span.classList.remove('lit'); }
          else { span.classList.remove('lit', 'current'); }
        });
      }
    });

    gsap.utils.toArray('.stat-block').forEach(function (block) {
      ScrollTrigger.create({
        trigger: block, start: 'top 85%', once: true,
        onEnter() {
          $(block).addClass('visible');
          const $counter = $(block).find('.counter');
          const target = parseInt($(block).attr('data-count'));
          let current = 0;
          const steps = 60, increment = target / steps;
          const timer = setInterval(() => {
            current = Math.min(current + increment, target);
            $counter.text(Math.round(current));
            if (current >= target) clearInterval(timer);
          }, 20);
        }
      });
    });
  }

  /* ══════════════════════════════════════════════
     11. GENERAL SCROLL ANIMATIONS
  ══════════════════════════════════════════════ */
  function initScrollAnimations() {
    gsap.utils.toArray('.kc-stage').forEach(function (stage, i) {
      ScrollTrigger.create({ trigger: stage, start: 'top 85%', once: true,
        onEnter() { setTimeout(() => stage.classList.add('visible'), i * 120); }
      });
    });
    gsap.utils.toArray('.stage-item').forEach(function (item, i) {
      ScrollTrigger.create({ trigger: item, start: 'top 88%', once: true,
        onEnter() { setTimeout(() => item.classList.add('visible'), i * 100); }
      });
    });
    gsap.utils.toArray('.engagement-item').forEach(function (item, i) {
      gsap.from(item, {
        scrollTrigger: { trigger: item, start: 'top 88%', once: true },
        opacity: 0, y: 24, duration: 0.6, delay: i * 0.08, ease: 'power2.out'
      });
    });
    // Service items
    gsap.utils.toArray('.service-item').forEach(function (item, i) {
      gsap.from(item, {
        scrollTrigger: { trigger: item, start: 'top 88%', once: true },
        opacity: 0, y: 28, duration: 0.6, delay: i * 0.09, ease: 'power2.out'
      });
    });
    // About section
    gsap.from('.about-left', { scrollTrigger: { trigger: '#about', start: 'top 80%', once: true }, opacity: 0, x: -30, duration: 0.7, ease: 'power2.out' });
    gsap.from('.about-right', { scrollTrigger: { trigger: '#about', start: 'top 80%', once: true }, opacity: 0, x: 30, duration: 0.7, delay: 0.15, ease: 'power2.out' });
    // Education
    gsap.utils.toArray('.edu-item').forEach(function (item, i) {
      ScrollTrigger.create({ trigger: item, start: 'top 88%', once: true,
        onEnter() { setTimeout(() => item.classList.add('visible'), i * 120); }
      });
    });
    // Contact
    gsap.from('.contact-left',  { scrollTrigger: { trigger: '#contact', start: 'top 80%', once: true }, opacity: 0, x: -30, duration: 0.7, ease: 'power2.out' });
    gsap.from('.contact-right', { scrollTrigger: { trigger: '#contact', start: 'top 80%', once: true }, opacity: 0, x: 30, duration: 0.7, delay: 0.15, ease: 'power2.out' });
  }

  /* ══════════════════════════════════════════════
     12. KILL CHAIN PROGRESS (original)
  ══════════════════════════════════════════════ */
  function initKillChainProgress() {
    ScrollTrigger.create({
      trigger: '#killchain', start: 'top 60%', end: 'bottom 40%', scrub: true,
      onUpdate(self) { $('#kc-progress').css('width', Math.round(self.progress * 100) + '%'); }
    });
  }

  /* ══════════════════════════════════════════════
     13. ENGAGEMENT FILTER (original)
  ══════════════════════════════════════════════ */
  function initEngagementFilter() {
    $('#filter-bar').on('click', '.filter-btn', function () {
      const filter = $(this).attr('data-filter');
      $('.filter-btn').removeClass('active');
      $(this).addClass('active');
      const $items = $('.engagement-item');
      if (filter === 'all') {
        $items.each(function (i) {
          $(this).removeClass('hidden fading');
          gsap.from(this, { opacity: 0, y: 16, duration: 0.4, delay: i * 0.05, ease: 'power2.out' });
        });
      } else {
        $items.each(function () {
          if ($(this).attr('data-category') === filter) {
            $(this).removeClass('hidden fading');
          } else {
            $(this).addClass('hidden');
          }
        });
      }
      setTimeout(() => ScrollTrigger.refresh(), 300);
    });
  }

  /* ══════════════════════════════════════════════
     14. SKILL BARS — memory allocation animation
  ══════════════════════════════════════════════ */
  function initSkillBars() {
    gsap.utils.toArray('.skill-bar-item').forEach(function (item, i) {
      ScrollTrigger.create({
        trigger: item, start: 'top 88%', once: true,
        onEnter() {
          setTimeout(() => {
            item.classList.add('visible');
            const pct = parseInt(item.getAttribute('data-pct'));
            const $fill = $(item).find('.sb-fill');
            const $pctEl = $(item).find('.sb-pct');

            // Animate fill + counter
            let cur = 0;
            const interval = setInterval(() => {
              cur = Math.min(cur + 1.5, pct);
              $fill.css('width', cur + '%');
              $pctEl.text(Math.round(cur) + '%');
              if (cur >= pct) {
                clearInterval(interval);
                $(item).find('.sb-alloc').text('[' + pct + '% / 100% · HEAP ALLOCATED]');
              }
            }, 18);
          }, i * 80);
        }
      });
    });

    // Language dots
    gsap.utils.toArray('.lang-item').forEach(function (item, i) {
      ScrollTrigger.create({
        trigger: item, start: 'top 90%', once: true,
        onEnter() {
          setTimeout(() => {
            item.classList.add('visible');
            const level = parseInt(item.getAttribute('data-level'));
            $(item).find('.lang-dots span').each(function (idx) {
              setTimeout(() => {
                if (idx < level) {
                  $(this).css({ background: 'var(--gold-dim)', borderColor: 'var(--gold-dim)' });
                }
              }, idx * 80);
            });
          }, i * 60);
        }
      });
    });

    // Human language bars
    gsap.utils.toArray('.hlang-item').forEach(function (item, i) {
      ScrollTrigger.create({
        trigger: item, start: 'top 90%', once: true,
        onEnter() {
          setTimeout(() => {
            item.classList.add('visible');
            const pct = parseInt($(item).find('.hlang-fill').attr('data-pct'));
            $(item).find('.hlang-fill').css('width', pct + '%');
          }, i * 100);
        }
      });
    });
  }

  /* ══════════════════════════════════════════════
     15. LANGUAGE DOTS (called by initSkillBars)
  ══════════════════════════════════════════════ */
  function initLangDots() { /* handled in initSkillBars */ }

  /* ══════════════════════════════════════════════
     16. CONTACT FORM
  ══════════════════════════════════════════════ */
  function initContactForm() {
    $('#contact-form').on('submit', function (e) {
      e.preventDefault();
      const name  = $('#f-name').val().trim();
      const email = $('#f-email').val().trim();
      const msg   = $('#f-message').val().trim();

      // Simple validation
      let valid = true;
      if (!name)  { $('#f-name').css('border-color', 'var(--danger)');  valid = false; } else { $('#f-name').css('border-color', ''); }
      if (!email || !/\S+@\S+\.\S+/.test(email)) { $('#f-email').css('border-color', 'var(--danger)'); valid = false; } else { $('#f-email').css('border-color', ''); }
      if (!msg)   { $('#f-message').css('border-color', 'var(--danger)'); valid = false; } else { $('#f-message').css('border-color', ''); }

      if (!valid) return;

      // Simulate transmission
      const $btn = $('#form-submit-btn');
      $btn.find('.fsb-text').text('ENCRYPTING...');
      $btn.prop('disabled', true);

      setTimeout(() => {
        $btn.find('.fsb-text').text('TRANSMITTING...');
      }, 800);

      setTimeout(() => {
        $('#contact-form').hide();
        $('#form-success').removeClass('hidden');
      }, 1800);
    });
  }

  /* ══════════════════════════════════════════════
     17. PGP COPY (original)
  ══════════════════════════════════════════════ */
  function initPgpCopy() {
    $('#copy-pgp-btn').on('click', function () {
      const pgpText = $('#pgp-content').text();
      const $btn = $(this);
      const copy = () => {
        $btn.addClass('copied');
        $btn.find('.copy-text').text('COPIED');
        setTimeout(() => { $btn.removeClass('copied'); $btn.find('.copy-text').text('COPY'); }, 2000);
      };
      if (navigator.clipboard) {
        navigator.clipboard.writeText(pgpText).then(copy);
      } else {
        const $tmp = $('<textarea>').val(pgpText).appendTo('body');
        $tmp[0].select();
        document.execCommand('copy');
        $tmp.remove();
        copy();
      }
    });
  }

  /* ══════════════════════════════════════════════
     18. HANDSHAKE TIMER (original)
  ══════════════════════════════════════════════ */
  function initHandshakeTimer() {
    function update() {
      const now = new Date();
      const h = String(now.getUTCHours()).padStart(2,'0');
      const m = String(now.getUTCMinutes()).padStart(2,'0');
      const s = String(now.getUTCSeconds()).padStart(2,'0');
      const d = now.toUTCString().split(' ').slice(1,4).join(' ').toUpperCase();
      $('#last-handshake').text(d + ' · ' + h + ':' + m + ':' + s + ' UTC');
    }
    update();
    setInterval(update, 1000);
  }

  /* ══════════════════════════════════════════════
     19. KONAMI CODE EASTER EGG
     ↑↑↓↓←→←→BA
  ══════════════════════════════════════════════ */
  function initKonami() {
    const CODE = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let   pos  = 0;

    const KONAMI_LINES = [
      { text: '$ sudo cat /etc/shadow', cls: 'k-gold', delay: 200 },
      { text: 'Authenticating operator... ███████████████ [OK]', cls: '', delay: 600 },
      { text: '──────────────────────────────────────────────', cls: '', delay: 100 },
      { text: '⚠  CLASSIFIED DOCUMENT — MV EYES ONLY', cls: 'k-danger', delay: 200 },
      { text: '──────────────────────────────────────────────', cls: '', delay: 100 },
      { text: 'CVE-2025-0x1337: "The Backdoor That Wasn\'t"', cls: 'k-gold', delay: 300 },
      { text: '  Severity: DIVINE · CVSS: 11.0 (yes, 11)', cls: '', delay: 200 },
      { text: '  Vector: NETWORK · Auth: NONE · Impact: UNIVERSE', cls: '', delay: 200 },
      { text: '  Summary: Researcher found the root password to reality.', cls: '', delay: 300 },
      { text: '  Patch available: NO · Will be patched: NEVER', cls: '', delay: 200 },
      { text: '──────────────────────────────────────────────', cls: '', delay: 100 },
      { text: 'Hire this person before someone else does.', cls: 'k-online', delay: 300 },
      { text: 'End of classified document.  [ ██████████ ]', cls: 'k-gold', delay: 200 },
      { text: '$ _', cls: 'k-gold', delay: 200 },
    ];

    $(document).on('keydown', function (e) {
      if (e.key === CODE[pos]) {
        pos++;
        if (pos === CODE.length) {
          pos = 0;
          openKonami();
        }
      } else {
        pos = e.key === CODE[0] ? 1 : 0;
      }
    });

    function openKonami() {
      $('#konami-overlay').addClass('active');
      const $body = $('#konami-body');
      $body.empty();
      let i = 0;
      function showLine() {
        if (i >= KONAMI_LINES.length) return;
        const line = KONAMI_LINES[i];
        const $l = $('<span class="k-line ' + line.cls + '"></span>').text(line.text);
        $body.append($l);
        setTimeout(() => $l.addClass('vis'), 10);
        i++;
        setTimeout(showLine, line.delay);
      }
      showLine();
    }

    $('#konami-close').on('click', function () {
      $('#konami-overlay').removeClass('active');
    });

    $('#konami-overlay').on('click', function (e) {
      if ($(e.target).is('#konami-overlay')) $(this).removeClass('active');
    });
  }

  /* ══════════════════════════════════════════════
     20. SECTION TAG SCRAMBLE (original)
  ══════════════════════════════════════════════ */
  function initSectionTagScramble() {
    function scrambleTag($el) {
      const original = $el.text();
      const glitchSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789./\\';
      let iter = 0;
      const int = setInterval(() => {
        $el.text(original.split('').map((ch, idx) => {
          if (ch === ' ' || ch === '/' || ch === '.') return ch;
          if (idx < iter) return original[idx];
          return glitchSet[Math.floor(Math.random() * glitchSet.length)];
        }).join(''));
        iter++;
        if (iter > 12) { clearInterval(int); $el.text(original); }
      }, 40);
    }
    $('.section-tag').each(function () {
      const $tag = $(this);
      ScrollTrigger.create({ trigger: $tag[0], start: 'top 90%', once: true,
        onEnter() { scrambleTag($tag); }
      });
    });
  }

  /* ══════════════════════════════════════════════
     21. HERO GLITCH (original)
  ══════════════════════════════════════════════ */
  function initHeroGlitch() {
    $('#hero-name').on('mouseenter', function () {
      let count = 0;
      const glitch = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!<>-_\\/[]{}—=+*^?#';
      const int = setInterval(() => {
        if (count >= 5) { clearInterval(int); $(this).find('.line-two').text('VANCE'); return; }
        let s = '';
        for (let i = 0; i < 5; i++) {
          s += Math.random() > 0.4 ? glitch[Math.floor(Math.random() * glitch.length)] : 'VANCE'[i];
        }
        $(this).find('.line-two').text(s);
        count++;
      }, 60);
    });
    $('#hero-name').on('mouseleave', function () { $(this).find('.line-two').text('VANCE'); });
  }

  /* ══════════════════════════════════════════════
     22. PARALLAX (original)
  ══════════════════════════════════════════════ */
  function initParallax() {
    $(window).on('scroll', function () {
      const s = $(this).scrollTop();
      $('.hero-grid-bg').css('transform', 'translateY(' + s * 0.15 + 'px)');
    });
  }

});