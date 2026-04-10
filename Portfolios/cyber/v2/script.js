/**
 * THE INFILTRATOR — script.js v2.5.0
 * Enhanced with: Hex Dump BG, Network Packet Visualizer, Live Threat Map,
 * RAM Skill Bars, Contact Form, Konami Code Easter Egg, Noise Overlay,
 * ASCII Footer + all original animations preserved.
 */
$(document).ready(function () {

  /* ══════════════════════════════════════════════
     0. REGISTER GSAP PLUGINS
  ══════════════════════════════════════════════ */
  gsap.registerPlugin(ScrollTrigger);

  /* ══════════════════════════════════════════════
     1. BOOT SEQUENCE (UNCHANGED)
  ══════════════════════════════════════════════ */
  const BOOT_MESSAGES = [
    { text: 'BIOS v2.4.1 · Initializing secure boot chain...', type: 'ok' },
    { text: 'Memory scan: 32768 MB DDR5 · No anomalies detected', type: 'ok' },
    { text: 'Loading kernel modules: crypto_aes, net_filter, iptable_raw', type: 'ok' },
    { text: 'Mounting encrypted partitions: /dev/sda3 [AES-256-XTS]', type: 'ok' },
    { text: 'Network interface eth0: UP · Link 10Gb/s', type: 'ok' },
    { text: 'Firewall: 1847 active rules loaded · REJECT default policy', type: 'ok' },
    { text: 'TOR relay: Bridge mode engaged · 3-hop circuit established', type: 'ok' },
    { text: 'DNS: Encrypted over HTTPS · Leak test: NEGATIVE', type: 'ok' },
    { text: 'Authenticating operator credentials...', type: '' },
    { text: 'HMAC-SHA512 signature verified · Welcome, MV-0x4F2A1', type: 'ok' },
    { text: 'Loading operational profile...', type: 'ok' },
    { text: 'System integrity: VERIFIED · Launching interface', type: 'ok' },
  ];
  const $bootLines  = $('#boot-lines');
  const $bootBar    = $('#boot-progress-bar');
  let   lineIndex   = 0;
  let   progress    = 0;

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
     2. CUSTOM CURSOR
  ══════════════════════════════════════════════ */
  const $dot  = $('#cursor-dot');
  const $ring = $('#cursor-ring');
  let ringX = 0, ringY = 0, dotX = 0, dotY = 0;

  $(document).on('mousemove', function (e) {
    dotX = e.clientX;
    dotY = e.clientY;
  });
  (function animateCursor() {
    ringX += (dotX - ringX) * 0.12;
    ringY += (dotY - ringY) * 0.12;
    $dot.css({ left: dotX + 'px', top: dotY + 'px' });
    $ring.css({ left: ringX + 'px', top: ringY + 'px' });
    requestAnimationFrame(animateCursor);
  })();
  $(document).on('mouseenter', 'a, button, .engagement-item, .kc-stage, .filter-btn, .service-item, .cf-input, .cf-submit', function () {
    $('body').addClass('cursor-hover');
  });
  $(document).on('mouseleave', 'a, button, .engagement-item, .kc-stage, .filter-btn, .service-item, .cf-input, .cf-submit', function () {
    $('body').removeClass('cursor-hover');
  });

  /* ══════════════════════════════════════════════
     3. MAIN PAGE INIT
  ══════════════════════════════════════════════ */
  function initMainPage() {
    initNav();
    initTerminal();
    initHeroReveal();
    initScrollDecrypt();
    initScrollAnimations();
    initKillChainProgress();
    initEngagementFilter();
    initPgpCopy();
    initHandshakeTimer();
    initHexDumpBG();
    initSkillBars();
    initNetworkVisualizer();
    initThreatMap();
    initContactForm();
    initKonamiCode();
    initEduReveal();
    initServiceReveal();
    initSectionTagScramble();
    // parallax
    $(window).on('scroll', function () {
      const scrolled = $(this).scrollTop();
      $('.hero-grid-bg').css('transform', 'translateY(' + scrolled * 0.15 + 'px)');
    });
  }

  /* ══════════════════════════════════════════════
     4. NAVIGATION
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
     5. TERMINAL (UNCHANGED)
  ══════════════════════════════════════════════ */
  const TERMINAL_LINES = [
    { text: 'whoami', cls: 'cmd', delay: 200 },
    { text: '──────────────────────────────────', cls: 'sep', delay: 100 },
    { text: 'NAME         :  Marcus Vance', cls: 'val', delay: 80 },
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
    let lineIdx = 0;
    function typeLine() {
      if (lineIdx >= TERMINAL_LINES.length) {
        $body.append('<span class="t-line val" style="opacity:1"><span class="t-cursor"></span></span>');
        return;
      }
      const line  = TERMINAL_LINES[lineIdx];
      const $line = $('<span class="t-line ' + line.cls + '"></span>').text(line.text);
      $body.append($line);
      gsap.to($line[0], { opacity: 1, duration: 0.15 });
      lineIdx++;
      setTimeout(typeLine, line.delay + Math.random() * 60);
    }
    setTimeout(typeLine, 600);
    setTimeout(() => { $('.terminal-block').addClass('visible'); }, 300);
  }

  /* ══════════════════════════════════════════════
     6. HERO REVEAL (UNCHANGED)
  ══════════════════════════════════════════════ */
  function initHeroReveal() {
    setTimeout(() => {
      $('.hero-type-block').addClass('visible');
      $('.clearance-badge').addClass('visible');
    }, 800);
  }

  /* ══════════════════════════════════════════════
     7. SCROLL-DECRYPT (UNCHANGED)
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
        const p      = self.progress;
        const eased  = p * p;
        const numToLight = Math.floor(eased * wordSpans.length * 1.05);
        wordSpans.forEach((span, i) => {
          if (i < numToLight)       { span.classList.add('lit'); span.classList.remove('current'); }
          else if (i === numToLight){ span.classList.add('current'); span.classList.remove('lit'); }
          else                       { span.classList.remove('lit', 'current'); }
        });
      }
    });
    gsap.utils.toArray('.stat-block').forEach(function (block) {
      ScrollTrigger.create({
        trigger: block, start: 'top 85%', once: true,
        onEnter() {
          $(block).addClass('visible');
          const $counter = $(block).find('.counter');
          const target   = parseInt($(block).attr('data-count'));
          let   current  = 0;
          const stepTime = 20;
          const steps    = 1200 / stepTime;
          const increment = target / steps;
          const timer = setInterval(function () {
            current = Math.min(current + increment, target);
            $counter.text(Math.round(current));
            if (current >= target) clearInterval(timer);
          }, stepTime);
        }
      });
    });
  }

  /* ══════════════════════════════════════════════
     8. SCROLL ANIMATIONS (UNCHANGED + new)
  ══════════════════════════════════════════════ */
  function initScrollAnimations() {
    gsap.utils.toArray('.kc-stage').forEach(function (stage, i) {
      ScrollTrigger.create({
        trigger: stage, start: 'top 85%', once: true,
        onEnter() { setTimeout(() => stage.classList.add('visible'), i * 120); }
      });
    });
    gsap.utils.toArray('.stage-item').forEach(function (item, i) {
      ScrollTrigger.create({
        trigger: item, start: 'top 88%', once: true,
        onEnter() { setTimeout(() => item.classList.add('visible'), i * 100); }
      });
    });
    gsap.utils.toArray('.engagement-item').forEach(function (item, i) {
      gsap.from(item, {
        scrollTrigger: { trigger: item, start: 'top 88%', once: true },
        opacity: 0, y: 24, duration: 0.6, delay: i * 0.08, ease: 'power2.out'
      });
    });
  }

  /* ══════════════════════════════════════════════
     9. KILL CHAIN PROGRESS (UNCHANGED)
  ══════════════════════════════════════════════ */
  function initKillChainProgress() {
    ScrollTrigger.create({
      trigger: '#killchain', start: 'top 60%', end: 'bottom 40%', scrub: true,
      onUpdate(self) { $('#kc-progress').css('width', Math.round(self.progress * 100) + '%'); }
    });
  }

  /* ══════════════════════════════════════════════
     10. ENGAGEMENT FILTER (UNCHANGED)
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
        $items.each(function (i) {
          if ($(this).attr('data-category') === filter) {
            $(this).removeClass('hidden fading');
            gsap.from(this, { opacity: 0, y: 16, duration: 0.4, delay: i * 0.05, ease: 'power2.out' });
          } else {
            $(this).addClass('hidden');
          }
        });
      }
      setTimeout(() => ScrollTrigger.refresh(), 300);
    });
  }

  /* ══════════════════════════════════════════════
     11. PGP COPY (UNCHANGED)
  ══════════════════════════════════════════════ */
  function initPgpCopy() {
    $('#copy-pgp-btn').on('click', function () {
      const pgpText = $('#pgp-content').text();
      const $btn    = $(this);
      if (navigator.clipboard) {
        navigator.clipboard.writeText(pgpText).then(function () {
          $btn.addClass('copied'); $btn.find('.copy-text').text('COPIED');
          setTimeout(() => { $btn.removeClass('copied'); $btn.find('.copy-text').text('COPY'); }, 2000);
        });
      } else {
        const $tmp = $('<textarea>').val(pgpText).appendTo('body');
        $tmp[0].select(); document.execCommand('copy'); $tmp.remove();
        $btn.addClass('copied'); $btn.find('.copy-text').text('COPIED');
        setTimeout(() => { $btn.removeClass('copied'); $btn.find('.copy-text').text('COPY'); }, 2000);
      }
    });
  }

  /* ══════════════════════════════════════════════
     12. HANDSHAKE TIMER (UNCHANGED)
  ══════════════════════════════════════════════ */
  function initHandshakeTimer() {
    function updateHandshake() {
      const now = new Date();
      const h = String(now.getHours()).padStart(2,'0');
      const m = String(now.getMinutes()).padStart(2,'0');
      const s = String(now.getSeconds()).padStart(2,'0');
      const d = now.toLocaleDateString('en-US', { month:'short', day:'2-digit', year:'numeric' }).toUpperCase();
      $('#last-handshake').text(d + ' · ' + h + ':' + m + ':' + s + ' UTC');
    }
    updateHandshake();
    setInterval(updateHandshake, 1000);
  }

  /* ══════════════════════════════════════════════
     13. HERO NAME GLITCH (UNCHANGED)
  ══════════════════════════════════════════════ */
  $('#hero-name').on('mouseenter', function () {
    const $name = $(this);
    const orig  = $name.html();
    let count = 0;
    const glitchChars = '!<>-_\\/[]{}—=+*^?#';
    const interval = setInterval(function () {
      if (count >= 5) { clearInterval(interval); $name.html(orig); return; }
      const $line2 = $name.find('.line-two');
      const originalText = 'VANCE';
      let scrambled = '';
      for (let i = 0; i < originalText.length; i++) {
        scrambled += Math.random() > 0.4 ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : originalText[i];
      }
      $line2.text(scrambled);
      count++;
    }, 60);
  });
  $('#hero-name').on('mouseleave', function () { $(this).find('.line-two').text('VANCE'); });

  /* ══════════════════════════════════════════════
     14. SECTION TAG SCRAMBLE
  ══════════════════════════════════════════════ */
  function initSectionTagScramble() {
    function scrambleTag($el) {
      const original  = $el.text();
      const glitchSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789./\\';
      let   iter      = 0;
      const int = setInterval(function () {
        $el.text(
          original.split('').map(function (ch, idx) {
            if (ch === ' ' || ch === '/' || ch === '.') return ch;
            if (idx < iter) return original[idx];
            return glitchSet[Math.floor(Math.random() * glitchSet.length)];
          }).join('')
        );
        iter++;
        if (iter > 12) { clearInterval(int); $el.text(original); }
      }, 40);
    }
    $('.section-tag').each(function () {
      const $tag = $(this);
      ScrollTrigger.create({
        trigger: $tag[0], start: 'top 90%', once: true,
        onEnter() { scrambleTag($tag); }
      });
    });
  }

  /* ══════════════════════════════════════════════
     NEW 15. HEX DUMP BACKGROUND
     Ambient scrolling gold hex pairs — Matrix rain
     but gold hex, very low opacity
  ══════════════════════════════════════════════ */
  function initHexDumpBG() {
    const targets = [
      { id: 'hex-bg-about',   cols: 18 },
      { id: 'hex-bg-skills',  cols: 18 },
      { id: 'hex-bg-contact', cols: 18 },
    ];

    targets.forEach(function ({ id, cols }) {
      const container = document.getElementById(id);
      if (!container) return;

      for (let c = 0; c < cols; c++) {
        const col = document.createElement('div');
        col.className = 'hex-col';
        col.style.left = (c * (100 / cols)) + '%';
        col.style.animationDelay = -(Math.random() * 8) + 's';
        col.style.animationDuration = (6 + Math.random() * 8) + 's';

        let content = '';
        for (let r = 0; r < 32; r++) {
          const hex = Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, '0');
          content += hex + ' ';
          if ((r + 1) % 4 === 0) content += '\n';
        }
        col.textContent = content;
        container.appendChild(col);
      }

      // Randomize hex values slowly
      setInterval(function () {
        const colEls = container.querySelectorAll('.hex-col');
        const randomCol = colEls[Math.floor(Math.random() * colEls.length)];
        if (!randomCol) return;
        let lines = randomCol.textContent.split('\n');
        const lineIdx = Math.floor(Math.random() * lines.length);
        if (lines[lineIdx]) {
          lines[lineIdx] = lines[lineIdx].replace(/[0-9A-F]{2}/g, () =>
            Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, '0')
          );
          randomCol.textContent = lines.join('\n');
        }
      }, 150);
    });
  }

  /* ══════════════════════════════════════════════
     NEW 16. RAM ALLOCATION SKILL BARS
  ══════════════════════════════════════════════ */
  function initSkillBars() {
    document.querySelectorAll('.skill-item').forEach(function (item) {
      ScrollTrigger.create({
        trigger: item, start: 'top 88%', once: true,
        onEnter() {
          item.classList.add('visible');
          const bar  = item.querySelector('.skill-bar');
          const fill = parseInt(bar.getAttribute('data-fill'));
          const totalBlocks = 20;
          const filledBlocks = Math.round((fill / 100) * totalBlocks);

          // Build block-style bar
          bar.innerHTML = '';
          for (let i = 0; i < totalBlocks; i++) {
            const block = document.createElement('span');
            block.className = 'skill-block';
            if (i < filledBlocks) {
              block.classList.add('filled');
              setTimeout(() => block.classList.add('lit'), i * 35);
            } else {
              block.classList.add('empty');
            }
            bar.appendChild(block);
          }
        }
      });
    });

    // Language bars
    document.querySelectorAll('.lang-fill').forEach(function (fill) {
      ScrollTrigger.create({
        trigger: fill, start: 'top 90%', once: true,
        onEnter() {
          const pct = fill.style.getPropertyValue('--fill');
          fill.style.width = '0%';
          setTimeout(() => {
            fill.style.transition = 'width 1.2s cubic-bezier(0.16,1,0.3,1)';
            fill.style.width = pct;
          }, 200);
        }
      });
    });
  }

  /* ══════════════════════════════════════════════
     NEW 17. NETWORK PACKET VISUALIZER
     Canvas-based animated nodes + packet arcs
  ══════════════════════════════════════════════ */
  function initNetworkVisualizer() {
    const canvas = document.getElementById('netvis-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const GOLD     = 'rgba(201,168,76,';
    const SLATE    = 'rgba(107,112,145,';

    const tools = [
      { label: 'BURP',         x: 0.12, y: 0.5  },
      { label: 'NMAP',         x: 0.25, y: 0.2  },
      { label: 'NUCLEI',       x: 0.25, y: 0.8  },
      { label: 'COBALT',       x: 0.5,  y: 0.35 },
      { label: 'METASPLOIT',   x: 0.5,  y: 0.65 },
      { label: 'MALTEGO',      x: 0.75, y: 0.2  },
      { label: 'IMPACKET',     x: 0.75, y: 0.8  },
      { label: 'C2',           x: 0.88, y: 0.5  },
    ];

    const edges = [
      [0,1],[0,2],[1,3],[2,3],[1,4],[2,4],[3,5],[4,6],[3,7],[4,7],[5,7],[6,7]
    ];

    // Packets in flight
    const packets = [];
    function spawnPacket() {
      const edge = edges[Math.floor(Math.random() * edges.length)];
      const reversed = Math.random() > 0.5;
      packets.push({
        from: reversed ? edge[1] : edge[0],
        to:   reversed ? edge[0] : edge[1],
        t:    0,
        speed: 0.004 + Math.random() * 0.006,
        size:  2 + Math.random() * 2,
        latency: Math.floor(2 + Math.random() * 80) + 'ms',
        showLabel: Math.random() > 0.6,
      });
    }
    setInterval(spawnPacket, 400);

    let nodePhase = 0;

    function draw() {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      nodePhase += 0.02;

      const nodes = tools.map(t => ({ ...t, px: t.x * W, py: t.y * H }));

      // Draw edges
      edges.forEach(([a, b]) => {
        const na = nodes[a], nb = nodes[b];
        ctx.beginPath();
        ctx.moveTo(na.px, na.py);
        ctx.lineTo(nb.px, nb.py);
        ctx.strokeStyle = SLATE + '0.25)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Update + draw packets
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.t += p.speed;
        if (p.t >= 1) { packets.splice(i, 1); continue; }

        const na = nodes[p.from], nb = nodes[p.to];
        const x = na.px + (nb.px - na.px) * p.t;
        const y = na.py + (nb.py - na.py) * p.t;

        // Packet dot
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = GOLD + '0.9)';
        ctx.fill();

        // Glow
        const grd = ctx.createRadialGradient(x, y, 0, x, y, p.size * 4);
        grd.addColorStop(0, GOLD + '0.3)');
        grd.addColorStop(1, GOLD + '0)');
        ctx.beginPath();
        ctx.arc(x, y, p.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Latency label
        if (p.showLabel && p.t > 0.3 && p.t < 0.7) {
          ctx.font = '9px "Space Mono", monospace';
          ctx.fillStyle = GOLD + '0.6)';
          ctx.fillText(p.latency, x + 6, y - 6);
        }
      }

      // Draw nodes
      nodes.forEach((n, i) => {
        const pulse = 1 + Math.sin(nodePhase + i * 0.8) * 0.15;
        const r = 20 * pulse;

        // Outer ring
        ctx.beginPath();
        ctx.arc(n.px, n.py, r, 0, Math.PI * 2);
        ctx.strokeStyle = GOLD + '0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Inner circle
        ctx.beginPath();
        ctx.arc(n.px, n.py, 12, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(20,20,20,0.9)';
        ctx.fill();
        ctx.strokeStyle = GOLD + '0.7)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Label
        ctx.font = 'bold 9px "Space Mono", monospace';
        ctx.fillStyle = GOLD + '0.9)';
        ctx.textAlign = 'center';
        ctx.fillText(n.label, n.px, n.py + (n.py > H / 2 ? 32 : -22));
        ctx.textAlign = 'left';
      });

      requestAnimationFrame(draw);
    }

    // Only start when visible
    ScrollTrigger.create({
      trigger: '#netvis', start: 'top 80%', once: true,
      onEnter() { draw(); }
    });
  }

  /* ══════════════════════════════════════════════
     NEW 18. LIVE THREAT MAP
     SVG world map with pulsing attack nodes + arcs
  ══════════════════════════════════════════════ */
  function initThreatMap() {
    const canvas = document.getElementById('threatmap-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight || 400;
    }
    resize();
    window.addEventListener('resize', resize);

    // Approximate lat/lon -> canvas x/y
    function project(lat, lon) {
      const W = canvas.width, H = canvas.height;
      const x = (lon + 180) * (W / 360);
      const y = (90 - lat)  * (H / 180);
      return [x, y];
    }

    // Threat origin cities [lat, lon, label]
    const origins = [
      [ 39.9, 116.4, 'BEIJING'    ],
      [ 55.8,  37.6, 'MOSCOW'     ],
      [ 37.5, 126.9, 'SEOUL'      ],
      [ 35.7, 139.7, 'TOKYO'      ],
      [ 52.5,  13.4, 'BERLIN'     ],
      [ 48.9,   2.4, 'PARIS'      ],
      [ 51.5,  -0.1, 'LONDON'     ],
      [ 40.7, -74.0, 'NEW YORK'   ],
      [ 37.8,-122.4, 'SAN FRAN'   ],
      [ 19.4, -99.1, 'MEXICO CITY'],
      [-23.5, -46.6, 'SAO PAULO'  ],
      [ 28.6,  77.2, 'NEW DELHI'  ],
      [  1.3, 103.8, 'SINGAPORE'  ],
      [-33.9,  18.4, 'CAPE TOWN'  ],
      [ 25.2,  55.3, 'DUBAI'      ],
    ];

    // Target: always "home" node (red team HQ)
    const targetLatLon = [38.9, -77.0]; // DC

    const arcs = [];
    let   attackCount = 0;
    let   blockedCount = 0;

    function spawnArc() {
      const origin = origins[Math.floor(Math.random() * origins.length)];
      arcs.push({
        lat: origin[0], lon: origin[1], label: origin[2],
        t: 0,
        speed: 0.003 + Math.random() * 0.004,
        blocked: Math.random() > 0.35,
        opacity: 1,
      });
      attackCount++;
      $('#tm-attacks').text(attackCount);
      $('#tm-origins').text(Math.min(attackCount, origins.length));
    }

    setInterval(spawnArc, 900);

    // Threat log
    const logMessages = [
      'SYN flood detected from {label}',
      'Brute force SSH attempt — {label}',
      'SQL injection probe — {label}',
      'Port scan 0–65535 — {label}',
      'Credential stuffing — {label}',
      'Zero-day probe pattern — {label}',
      'Malformed packet flood — {label}',
    ];
    function addLog(label, blocked) {
      const msg = logMessages[Math.floor(Math.random() * logMessages.length)].replace('{label}', label);
      const $entry = $('<div class="tl-entry"></div>').html(
        '<span class="tl-status ' + (blocked ? 'blocked' : 'active') + '">' + (blocked ? 'BLOCKED' : 'ACTIVE') + '</span> ' +
        '<span class="tl-msg">' + msg + '</span>'
      );
      $('#threat-log').prepend($entry);
      setTimeout(() => $entry.addClass('visible'), 10);
      // Keep only last 6
      const entries = $('#threat-log .tl-entry');
      if (entries.length > 6) entries.last().remove();
    }

    // Draw world map (simplified continent outlines as dots/lines)
    function drawMap() {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Grid lines
      ctx.strokeStyle = 'rgba(74,78,105,0.12)';
      ctx.lineWidth = 0.5;
      for (let lon = -180; lon <= 180; lon += 30) {
        const [x] = project(0, lon);
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let lat = -90; lat <= 90; lat += 30) {
        const [,y] = project(lat, 0);
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Target node (home)
      const [tx, ty] = project(...targetLatLon);
      const grd = ctx.createRadialGradient(tx, ty, 0, tx, ty, 25);
      grd.addColorStop(0, 'rgba(201,168,76,0.4)');
      grd.addColorStop(1, 'rgba(201,168,76,0)');
      ctx.beginPath(); ctx.arc(tx, ty, 25, 0, Math.PI*2);
      ctx.fillStyle = grd; ctx.fill();
      ctx.beginPath(); ctx.arc(tx, ty, 6, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(232,201,106,0.9)'; ctx.fill();
      ctx.font = '8px "Space Mono", monospace';
      ctx.fillStyle = 'rgba(201,168,76,0.8)';
      ctx.fillText('TARGET', tx + 10, ty - 4);

      // Origin nodes (all)
      origins.forEach(([lat, lon, label]) => {
        const [x, y] = project(lat, lon);
        ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(139,44,44,0.5)'; ctx.fill();
      });

      // Draw arcs
      for (let i = arcs.length - 1; i >= 0; i--) {
        const arc = arcs[i];
        arc.t += arc.speed;

        if (arc.t > 1.5) { arcs.splice(i, 1); continue; }

        const [ox, oy] = project(arc.lat, arc.lon);
        const progress = Math.min(arc.t, 1);

        // Bezier arc
        const mx = (ox + tx) / 2;
        const my = Math.min(oy, ty) - (Math.abs(ox - tx) * 0.3);

        // Draw trail
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        // Only draw up to progress
        const steps = 40;
        for (let s = 0; s <= steps * progress; s++) {
          const st = s / steps;
          const bx = (1-st)*(1-st)*ox + 2*(1-st)*st*mx + st*st*tx;
          const by = (1-st)*(1-st)*oy + 2*(1-st)*st*my + st*st*ty;
          if (s === 0) ctx.moveTo(bx, by);
          else ctx.lineTo(bx, by);
        }
        const col = arc.blocked ? 'rgba(139,44,44,' : 'rgba(201,168,76,';
        const fade = arc.t > 1 ? Math.max(0, 1 - (arc.t - 1) * 2) : 1;
        ctx.strokeStyle = col + (0.5 * fade) + ')';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Packet head
        if (arc.t <= 1) {
          const st = progress;
          const hx = (1-st)*(1-st)*ox + 2*(1-st)*st*mx + st*st*tx;
          const hy = (1-st)*(1-st)*oy + 2*(1-st)*st*my + st*st*ty;
          ctx.beginPath(); ctx.arc(hx, hy, 3, 0, Math.PI*2);
          ctx.fillStyle = col + '1)'; ctx.fill();
        }

        // On arrive
        if (arc.t >= 1 && !arc._logged) {
          arc._logged = true;
          if (arc.blocked) { blockedCount++; $('#tm-blocked').text(blockedCount); }
          addLog(arc.label, arc.blocked);
        }

        // Origin pulse
        const [px, py] = project(arc.lat, arc.lon);
        ctx.beginPath();
        ctx.arc(px, py, 3 + arc.t * 4, 0, Math.PI*2);
        ctx.strokeStyle = 'rgba(139,44,44,' + Math.max(0, 0.6 - arc.t * 0.4) + ')';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      requestAnimationFrame(drawMap);
    }

    ScrollTrigger.create({
      trigger: '#threatmap', start: 'top 80%', once: true,
      onEnter() { drawMap(); }
    });
  }

  /* ══════════════════════════════════════════════
     NEW 19. EDUCATION REVEAL
  ══════════════════════════════════════════════ */
  function initEduReveal() {
    gsap.utils.toArray('.edu-item').forEach(function (item, i) {
      gsap.from(item, {
        scrollTrigger: { trigger: item, start: 'top 88%', once: true },
        opacity: 0, y: 20, duration: 0.6, delay: i * 0.1, ease: 'power2.out'
      });
    });
  }

  /* ══════════════════════════════════════════════
     NEW 20. SERVICES REVEAL
  ══════════════════════════════════════════════ */
  function initServiceReveal() {
    gsap.utils.toArray('.service-item').forEach(function (item, i) {
      gsap.from(item, {
        scrollTrigger: { trigger: item, start: 'top 88%', once: true },
        opacity: 0, y: 24, duration: 0.55, delay: i * 0.07, ease: 'power2.out'
      });
    });
  }

  /* ══════════════════════════════════════════════
     NEW 21. CONTACT FORM
  ══════════════════════════════════════════════ */
  function initContactForm() {
    $('#cf-submit').on('click', function () {
      const $btn  = $(this);
      const $text = $btn.find('.cf-submit-text');
      const msgs  = [
        'ENCRYPTING PAYLOAD...',
        'ROUTING THROUGH TOR...',
        'HANDSHAKE ESTABLISHED...',
        'MESSAGE DELIVERED · STAND BY',
      ];
      let i = 0;
      $btn.addClass('sending');
      $text.text(msgs[0]);
      const int = setInterval(function () {
        i++;
        if (i >= msgs.length) {
          clearInterval(int);
          $btn.removeClass('sending').addClass('sent');
          $text.text('TRANSMISSION COMPLETE');
          setTimeout(() => {
            $btn.removeClass('sent');
            $text.text('TRANSMIT SECURE MESSAGE');
          }, 4000);
        } else {
          $text.text(msgs[i]);
        }
      }, 700);
    });

    // Input focus effects
    $('.cf-input').on('focus', function () {
      $(this).closest('.cf-field').addClass('active');
    }).on('blur', function () {
      $(this).closest('.cf-field').removeClass('active');
    });
  }

  /* ══════════════════════════════════════════════
     NEW 22. KONAMI CODE EASTER EGG
     ↑↑↓↓←→←→BA → classified terminal overlay
  ══════════════════════════════════════════════ */
  function initKonamiCode() {
    const SEQUENCE = [38,38,40,40,37,39,37,39,66,65];
    let   pos       = 0;

    const KONAMI_LINES = [
      { t: 80,  text: '$ sudo access_classified_vault --auth MV-0x4F2A1', cls: 'cmd' },
      { t: 160, text: '[    0.001] Verifying retinal scan...', cls: 'val' },
      { t: 280, text: '[    0.002] ██████████ 100% · IDENTITY CONFIRMED', cls: 'ok' },
      { t: 400, text: '// ═══ CLASSIFIED RECORDS — EYES ONLY ═══', cls: 'sep' },
      { t: 550, text: 'CVE-2025-0x1337 · STATUS: EMBARGOED', cls: 'val' },
      { t: 650, text: '  PRODUCT   : [████████] Enterprise VPN Gateway', cls: 'val' },
      { t: 750, text: '  VULN TYPE : Pre-auth RCE via malformed TLS ClientHello', cls: 'val' },
      { t: 850, text: '  CVSS      : 10.0 (NETWORK / LOW / NONE / CHANGED)', cls: 'val' },
      { t: 950, text: '  NOTE      : Patch exists. Vendor: "No exploits in the wild."', cls: 'val' },
      { t:1050, text: '  NOTE      : (We have a PoC. We are the wild.)', cls: 'gold' },
      { t:1200, text: '// ═══════════════════════════════════════', cls: 'sep' },
      { t:1350, text: 'PERSONAL LOG — 2024-11-07:', cls: 'cmd' },
      { t:1450, text: '  Broke into a Fortune 100 and left a note: "You left the', cls: 'val' },
      { t:1550, text: '  front door open." Engagement extended by 3 weeks.', cls: 'val' },
      { t:1700, text: '  Client said "impossible." Sent them the pcap.', cls: 'val' },
      { t:1850, text: '  They said "we are upgrading our firewall."', cls: 'val' },
      { t:1950, text: '  I said "the firewall wasn\'t the problem."', cls: 'gold' },
      { t:2100, text: '// ═══════════════════════════════════════', cls: 'sep' },
      { t:2200, text: '$  echo "You found the easter egg. Respect." ', cls: 'cmd' },
      { t:2350, text: '   You found the easter egg. Respect.', cls: 'ok' },
      { t:2500, text: '<span class="t-cursor"></span>', cls: 'val', html: true },
    ];

    $(document).on('keydown', function (e) {
      if (e.keyCode === SEQUENCE[pos]) {
        pos++;
        if (pos === SEQUENCE.length) {
          pos = 0;
          triggerKonami();
        }
      } else {
        pos = 0;
      }
    });

    function triggerKonami() {
      const $overlay = $('#konami-overlay');
      const $body    = $('#konami-body');
      $body.empty();
      $overlay.addClass('visible');
      $('body').addClass('konami-active');

      KONAMI_LINES.forEach(function (line) {
        setTimeout(function () {
          const $line = $('<span class="t-line"></span>');
          $line.addClass(line.cls || 'val');
          if (line.html) $line.html(line.text);
          else $line.text(line.text);
          $body.append($line);
          $line[0].offsetHeight; // reflow
          $line.addClass('kvis');
          $body[0].scrollTop = $body[0].scrollHeight;
        }, line.t);
      });
    }

    $('#konami-close').on('click', function () {
      $('#konami-overlay').removeClass('visible');
      $('body').removeClass('konami-active');
    });

    $(document).on('keydown', function (e) {
      if (e.keyCode === 27) {
        $('#konami-overlay').removeClass('visible');
        $('body').removeClass('konami-active');
      }
    });
  }

});