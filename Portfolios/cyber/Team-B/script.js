/**
 * THE GUARDIAN — guardian_script.js
 * Pure vanilla JS boot sequence (no CDN dependency for boot)
 * jQuery + GSAP features initialize after CDNs confirmed loaded
 */

/* ══════════════════════════════════════════════
   1. VANILLA BOOT SEQUENCE
   Runs immediately — no external deps required
══════════════════════════════════════════════ */
(function guardianBoot() {
  const BOOT_LINES = [
    { text: 'Initializing Guardian Security Console v4.2.1...', tag: '' },
    { text: 'Loading kernel: </span><span class="key">linux-5.15.0-guardian</span><span> [OK]', tag: 'ok' },
    { text: 'Mounting secure partitions: /dev/sda1 AES-256-XTS... [OK]', tag: 'ok' },
    { text: 'Network interface eth0: 10GbE UP... [OK]', tag: 'ok' },
    { text: 'Firewall policies loaded: 2,847 rules active... [OK]', tag: 'ok' },
    { text: 'SIEM connector: Splunk Enterprise — AUTHENTICATED... [OK]', tag: 'ok' },
    { text: 'EDR connector: CrowdStrike Falcon — HEALTHY... [OK]', tag: 'ok' },
    { text: 'Threat intel feed: ACTIVE — Last update 00:04:17 ago... [OK]', tag: 'ok' },
    { text: 'Authenticating operator credentials... [OK]', tag: 'ok' },
    { text: 'Welcome, EV-07. All systems nominal. Threat level: <span class="ok">LOW</span>', tag: '' },
  ];

  let bootDone = false;

  function dismissBoot() {
    if (bootDone) return;
    bootDone = true;
    const overlay = document.getElementById('boot-overlay');
    if (!overlay) return;
    overlay.classList.add('dismissed');
    setTimeout(() => {
      overlay.style.display = 'none';
      if (typeof window._guardianReady === 'function') window._guardianReady();
    }, 750);
  }

  // Hard escape — dismiss after 9s no matter what
  setTimeout(dismissBoot, 9000);

  function waitDOM(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  waitDOM(function () {
    const seqEl  = document.getElementById('boot-sequence');
    const barEl  = document.getElementById('boot-bar-fill');
    const lblEl  = document.getElementById('boot-bar-label');
    if (!seqEl)  { dismissBoot(); return; }

    let idx  = 0;
    let prog = 0;

    function nextLine() {
      if (idx >= BOOT_LINES.length) {
        animBar(100, () => setTimeout(dismissBoot, 500));
        return;
      }
      const line = BOOT_LINES[idx];
      const el   = document.createElement('span');
      el.className = 'bs-line' + (line.tag ? ' ' + line.tag : '');
      el.innerHTML = '$ ' + line.text;
      seqEl.appendChild(el);
      requestAnimationFrame(() => el.classList.add('show'));
      prog = Math.round(((idx + 1) / BOOT_LINES.length) * 90);
      barEl.style.width = prog + '%';
      if (lblEl) lblEl.textContent = Math.round(prog) + '% — LOADING MODULES';
      idx++;
      setTimeout(nextLine, 80 + Math.random() * 100);
    }

    function animBar(target, cb) {
      let cur = prog;
      (function step() {
        cur = Math.min(cur + 2, target);
        barEl.style.width = cur + '%';
        if (lblEl) lblEl.textContent = cur < 100 ? cur + '% — LOADING' : 'READY';
        if (cur < target) requestAnimationFrame(step);
        else if (cb) cb();
      })();
    }

    setTimeout(nextLine, 400);
  });
})();

/* ══════════════════════════════════════════════
   2. WAIT FOR LIBRARIES THEN RUN MAIN APP
══════════════════════════════════════════════ */
function _waitLibs(fn) {
  let tries = 0;
  const check = setInterval(function () {
    tries++;
    if (typeof jQuery !== 'undefined' && typeof gsap !== 'undefined') {
      clearInterval(check);
      fn();
    } else if (tries > 120) {
      clearInterval(check);
      fn(); // run degraded
    }
  }, 100);
}

window._guardianReady = function () {
  _waitLibs(_guardianApp);
};

// Fallback: try to init after 2.5s regardless
setTimeout(function () {
  if (window._guardianReady) {
    window._guardianReady();
    window._guardianReady = null;
  }
}, 2500);

/* ══════════════════════════════════════════════
   3. MAIN APPLICATION
══════════════════════════════════════════════ */
function _guardianApp() {
  if (typeof jQuery === 'undefined') return;

  (function ($) {

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    /* ─── NAV scroll ─────────────────────── */
    $(window).on('scroll.nav', function () {
      if ($(this).scrollTop() > 50) $('#nav').addClass('scrolled');
      else $('#nav').removeClass('scrolled');
    });

    $('a[href^="#"]').on('click', function (e) {
      const $t = $($(this).attr('href'));
      if ($t.length) {
        e.preventDefault();
        $('html,body').animate({ scrollTop: $t.offset().top - 76 }, 700);
      }
    });

    /* ─── Custom cursor ──────────────────── */
    const $core  = $('#cursor-core');
    const $outer = $('#cursor-outer');
    let ox = 0, oy = 0, cx = 0, cy = 0;

    $(document).on('mousemove', function (e) { cx = e.clientX; cy = e.clientY; });

    (function moveCursor() {
      ox += (cx - ox) * 0.12;
      oy += (cy - oy) * 0.12;
      $core.css({ left: cx + 'px', top: cy + 'px' });
      $outer.css({ left: ox + 'px', top: oy + 'px' });
      requestAnimationFrame(moveCursor);
    })();

    $(document).on('mouseenter', 'a,button,.tool-card,.incident-card,.cert-card,.ai-tags span', function () {
      $('body').addClass('cursor-hover');
    }).on('mouseleave', 'a,button,.tool-card,.incident-card,.cert-card,.ai-tags span', function () {
      $('body').removeClass('cursor-hover');
    });

    /* ─── Live clock ─────────────────────── */
    function updateClock() {
      const now = new Date();
      const h = String(now.getUTCHours()).padStart(2,'0');
      const m = String(now.getUTCMinutes()).padStart(2,'0');
      const s = String(now.getUTCSeconds()).padStart(2,'0');
      $('#nav-clock').text(h + ':' + m + ':' + s);
      $('#footer-time').text(now.toUTCString().split(' ').slice(0,4).join(' '));
    }
    updateClock();
    setInterval(updateClock, 1000);

    /* ─── Hero terminal typing ───────────── */
    const HERO_LINES = [
      { text: 'System.Status()', cls: 'cmd', delay: 200 },
      { text: '──────────────────────────────────────', cls: 'out', delay: 80 },
      { text: 'Operator     : Elena Vasquez (EV-07)', cls: 'val', delay: 70 },
      { text: 'Clearance    : SECRET — ACTIVE', cls: 'val', delay: 70 },
      { text: 'Speciality   : Threat Hunting · DFIR', cls: 'val', delay: 70 },
      { text: 'SIEM         : Splunk ES — CONNECTED', cls: 'good', delay: 70 },
      { text: 'EDR          : CrowdStrike — HEALTHY', cls: 'good', delay: 70 },
      { text: 'Threat Level : LOW — 0 Active Incidents', cls: 'good', delay: 70 },
      { text: 'MTTR (30d)   : 2.4 min avg', cls: 'val', delay: 70 },
      { text: '──────────────────────────────────────', cls: 'out', delay: 80 },
      { text: 'Status: ALL SYSTEMS NOMINAL', cls: 'good', delay: 100 },
    ];

    const $body = $('#hero-terminal-body');
    let tIdx = 0;

    function typeHero() {
      if (tIdx >= HERO_LINES.length) {
        $body.append('<span class="ht-line val" style="opacity:1"><span class="ht-cursor"></span></span>');
        // Trigger hero reveals after terminal finishes
        setTimeout(() => {
          $('.hero-system-tag, .hero-terminal, .hero-name-block').addClass('visible');
          $('.hero-metrics-row').addClass('visible');
        }, 200);
        return;
      }
      const line = HERO_LINES[tIdx];
      const $l = $('<span class="ht-line ' + line.cls + '"></span>').text(line.text);
      $body.append($l);
      gsap ? gsap.to($l[0], { opacity: 1, duration: 0.12 }) : $l.css('opacity','1');
      tIdx++;
      setTimeout(typeHero, line.delay + Math.random() * 50);
    }

    setTimeout(typeHero, 300);

    /* ─── Radar canvas ───────────────────── */
    function drawRadar() {
      const canvas = document.getElementById('radar-canvas');
      if (!canvas) return;
      const ctx    = canvas.getContext('2d');
      const cx     = 110, cy = 110, maxR = 90;
      const LABELS = ['Detection', 'Response', 'Coverage', 'MTTR', 'Accuracy', 'Visibility'];
      const VALS   = [0.97, 0.94, 0.88, 0.91, 0.99, 0.86];
      const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#3B82F6', '#10B981', '#F59E0B'];

      function angleOf(i) { return (i / LABELS.length) * Math.PI * 2 - Math.PI / 2; }

      function draw(progress) {
        ctx.clearRect(0, 0, 220, 220);

        // Grid rings
        [0.25, 0.5, 0.75, 1].forEach(r => {
          ctx.beginPath();
          LABELS.forEach((_, i) => {
            const a = angleOf(i);
            const x = cx + Math.cos(a) * maxR * r;
            const y = cy + Math.sin(a) * maxR * r;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          });
          ctx.closePath();
          ctx.strokeStyle = 'rgba(59,130,246,0.1)';
          ctx.lineWidth = 1;
          ctx.stroke();
        });

        // Spokes
        LABELS.forEach((_, i) => {
          const a = angleOf(i);
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(a) * maxR, cy + Math.sin(a) * maxR);
          ctx.strokeStyle = 'rgba(59,130,246,0.1)';
          ctx.lineWidth = 1;
          ctx.stroke();
        });

        // Data polygon
        ctx.beginPath();
        VALS.forEach((v, i) => {
          const r = v * maxR * progress;
          const a = angleOf(i);
          const x = cx + Math.cos(a) * r;
          const y = cy + Math.sin(a) * r;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fillStyle = 'rgba(59,130,246,0.12)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(59,130,246,0.5)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Data points
        VALS.forEach((v, i) => {
          const r = v * maxR * progress;
          const a = angleOf(i);
          const x = cx + Math.cos(a) * r;
          const y = cy + Math.sin(a) * r;
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fillStyle = COLORS[i];
          ctx.fill();
        });

        // Labels (only at full progress)
        if (progress > 0.95) {
          ctx.font = '9px "DM Mono", monospace';
          ctx.textAlign = 'center';
          LABELS.forEach((label, i) => {
            const a = angleOf(i);
            const x = cx + Math.cos(a) * (maxR + 16);
            const y = cy + Math.sin(a) * (maxR + 14);
            ctx.fillStyle = 'rgba(107,122,154,0.8)';
            ctx.fillText(label, x, y + 3);
          });
        }
      }

      // Animate in
      let p = 0;
      const anim = setInterval(() => {
        p = Math.min(p + 0.025, 1);
        draw(p);
        if (p >= 1) clearInterval(anim);
      }, 20);
    }

    setTimeout(drawRadar, 800);

    /* ─── Live activity feed ─────────────── */
    const FEED_ITEMS = [
      { type: 'green-dot', time: 'now',    text: 'Falcon: No threats detected on 4,891 endpoints' },
      { type: 'blue-dot',  time: '02m',    text: 'Sentinel: KQL alert rule updated — BEC v3' },
      { type: 'green-dot', time: '07m',    text: 'Nessus scan completed: 0 critical CVEs' },
      { type: 'amber-dot', time: '12m',    text: 'Splunk: Anomalous login flagged — auto-closed' },
      { type: 'green-dot', time: '31m',    text: 'Threat feed synced: 1,247 new IOCs ingested' },
    ];

    const $feed = $('#activity-feed');
    FEED_ITEMS.forEach((item, i) => {
      setTimeout(() => {
        const $item = $(`
          <div class="feed-item" style="opacity:0;transform:translateY(6px)">
            <span class="fi-dot ${item.type}"></span>
            <span class="fi-time">${item.time}</span>
            <span class="fi-text">${item.text}</span>
          </div>
        `);
        $feed.append($item);
        gsap ? gsap.to($item[0], { opacity:1, y:0, duration:0.4, ease:'power2.out' })
             : $item.css({ opacity:'1', transform:'none' });
      }, 600 + i * 250);
    });

    /* ─── Scroll-decrypt paragraph ────────── */
    function initScrollDecrypt() {
      const $para = $('#scan-text');
      const raw   = $para.text().trim();
      const words = raw.split(/(\s+)/);
      $para.empty();
      const spans = [];
      words.forEach(tok => {
        if (/^\s+$/.test(tok)) {
          $para.append(document.createTextNode(tok));
        } else if (tok.length > 0) {
          const $w = $('<span class="word"></span>').text(tok);
          $para.append($w);
          spans.push($w[0]);
        }
      });

      if (typeof ScrollTrigger === 'undefined') {
        // fallback — light all words
        spans.forEach(s => s.classList.add('lit'));
        return;
      }

      ScrollTrigger.create({
        trigger: '#scan-section',
        start: 'top 70%',
        end: 'bottom 60%',
        scrub: 0.8,
        onUpdate(self) {
          const p = self.progress;
          const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
          const lit = Math.floor(eased * (spans.length + 1));
          spans.forEach((s, i) => {
            if (i < lit - 1)      { s.classList.add('lit');     s.classList.remove('current'); }
            else if (i === lit-1) { s.classList.add('current'); s.classList.remove('lit'); }
            else                  { s.classList.remove('lit','current'); }
          });
        }
      });
    }
    initScrollDecrypt();

    /* ─── Stat counters ──────────────────── */
    $('.ss-item').each(function () {
      const $el = $(this);
      if (typeof ScrollTrigger === 'undefined') { $el.addClass('visible'); return; }
      ScrollTrigger.create({
        trigger: $el[0], start: 'top 88%', once: true,
        onEnter() {
          $el.addClass('visible');
          const $v = $el.find('.ssi-val');
          const target = parseInt($v.attr('data-count'));
          let cur = 0;
          const inc = target / 60;
          const t = setInterval(() => {
            cur = Math.min(cur + inc, target);
            $v.text(Math.round(cur));
            if (cur >= target) clearInterval(t);
          }, 20);
        }
      });
    });

    /* ─── Tool proficiency bars ──────────── */
    function initToolBars() {
      $('.tool-card').each(function (i) {
        const $card = $(this);
        if (typeof ScrollTrigger === 'undefined') {
          $card.addClass('visible');
          $card.find('.tc-fill').css('width', $card.find('.tc-fill').attr('data-w') + '%');
          return;
        }
        ScrollTrigger.create({
          trigger: $card[0], start: 'top 88%', once: true,
          onEnter() {
            setTimeout(() => {
              $card.addClass('visible');
              const w = $card.find('.tc-fill').attr('data-w');
              $card.find('.tc-fill').css('width', w + '%');
            }, i * 80);
          }
        });
      });
    }
    initToolBars();

    /* ─── General scroll reveals ─────────── */
    function scrollReveal(selector, stagger) {
      $(selector).each(function (i) {
        const el = this;
        if (typeof ScrollTrigger === 'undefined') { $(el).addClass('visible'); return; }
        ScrollTrigger.create({
          trigger: el, start: 'top 88%', once: true,
          onEnter() {
            setTimeout(() => $(el).addClass('visible'), i * (stagger || 80));
          }
        });
      });
    }

    scrollReveal('.incident-card', 100);
    scrollReveal('.cert-card', 100);
    scrollReveal('.exp-stage', 80);
    scrollReveal('.edu-item', 100);

    /* ─── Contact form ───────────────────── */
    $('#contact-form').on('submit', function (e) {
      e.preventDefault();
      const name  = $('#cf-name').val().trim();
      const email = $('#cf-email').val().trim();
      const msg   = $('#cf-msg').val().trim();
      let valid = true;
      if (!name)  { $('#cf-name').css('border-color','#EF4444'); valid = false; } else { $('#cf-name').css('border-color',''); }
      if (!email || !/\S+@\S+\.\S+/.test(email)) { $('#cf-email').css('border-color','#EF4444'); valid = false; } else { $('#cf-email').css('border-color',''); }
      if (!msg)   { $('#cf-msg').css('border-color','#EF4444'); valid = false; } else { $('#cf-msg').css('border-color',''); }
      if (!valid) return;

      const $btn = $('.cf-submit');
      $btn.find('span').text('ENCRYPTING...');
      $btn.prop('disabled', true);
      setTimeout(() => {
        $btn.find('span').text('TRANSMITTING...');
        setTimeout(() => {
          $('#contact-form').hide();
          $('#form-sent').removeClass('hidden');
        }, 900);
      }, 800);
    });

    /* ─── Parallax on hero grid bg ────────── */
    $(window).on('scroll.parallax', function () {
      const s = $(this).scrollTop();
      $('.blueprint-bg').css('transform', 'translateY(' + s * 0.1 + 'px)');
    });

    /* ─── Section tag scramble on scroll ──── */
    function scramble($el) {
      const orig = $el.text();
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789./()';
      let iter = 0;
      const interval = setInterval(() => {
        $el.text(orig.split('').map((c, i) => {
          if ([' ', '/', '.', '(', ')'].includes(c)) return c;
          if (i < iter) return orig[i];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join(''));
        iter++;
        if (iter > orig.length + 3) { clearInterval(interval); $el.text(orig); }
      }, 38);
    }

    if (typeof ScrollTrigger !== 'undefined') {
      $('.section-eyebrow').each(function () {
        const $t = $(this);
        ScrollTrigger.create({
          trigger: $t[0], start: 'top 92%', once: true,
          onEnter() { scramble($t); }
        });
      });
    }

  })(jQuery);
}