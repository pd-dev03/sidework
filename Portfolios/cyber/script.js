/**
 * THE INFILTRATOR — script.js
 * All motion, boot sequence, terminal, scroll-decrypt, engagement filter,
 * cursor, kill-chain animation, and vault interactions.
 */

$(document).ready(function () {

  /* ══════════════════════════════════════════════
     0. REGISTER GSAP PLUGINS
  ══════════════════════════════════════════════ */
  gsap.registerPlugin(ScrollTrigger);

  /* ══════════════════════════════════════════════
     1. BOOT SEQUENCE
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
      // Final — complete progress then hide
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

    // Trigger visible on next tick
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
  let ringX = 0, ringY = 0;
  let dotX  = 0, dotY  = 0;

  $(document).on('mousemove', function (e) {
    dotX  = e.clientX;
    dotY  = e.clientY;
  });

  // Smooth ring follow
  (function animateCursor() {
    ringX += (dotX - ringX) * 0.12;
    ringY += (dotY - ringY) * 0.12;

    $dot.css({ left: dotX + 'px', top: dotY + 'px' });
    $ring.css({ left: ringX + 'px', top: ringY + 'px' });

    requestAnimationFrame(animateCursor);
  })();

  // Hover state
  $(document).on('mouseenter', 'a, button, .engagement-item, .kc-stage, .filter-btn', function () {
    $('body').addClass('cursor-hover');
  });
  $(document).on('mouseleave', 'a, button, .engagement-item, .kc-stage, .filter-btn', function () {
    $('body').removeClass('cursor-hover');
  });

  /* ══════════════════════════════════════════════
     3. MAIN PAGE INIT (called after boot)
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
  }

  /* ══════════════════════════════════════════════
     4. NAVIGATION — scroll behavior
  ══════════════════════════════════════════════ */
  function initNav() {
    $(window).on('scroll', function () {
      if ($(this).scrollTop() > 60) {
        $('#nav').addClass('scrolled');
      } else {
        $('#nav').removeClass('scrolled');
      }
    });

    // Smooth scroll
    $('a[href^="#"]').on('click', function (e) {
      const target = $($(this).attr('href'));
      if (target.length) {
        e.preventDefault();
        $('html, body').animate({
          scrollTop: target.offset().top - 80
        }, 700);
      }
    });
  }

  /* ══════════════════════════════════════════════
     5. TERMINAL SEQUENCE
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
    const $body    = $('#terminal-output');
    let   lineIdx  = 0;

    function typeLine() {
      if (lineIdx >= TERMINAL_LINES.length) {
        // Add blinking cursor at end
        $body.append('<span class="t-line val" style="opacity:1"><span class="t-cursor"></span></span>');
        return;
      }

      const line  = TERMINAL_LINES[lineIdx];
      const $line = $('<span class="t-line ' + line.cls + '"></span>').text(line.text);
      $body.append($line);

      // Animate in
      gsap.to($line[0], { opacity: 1, duration: 0.15, delay: 0 });

      lineIdx++;
      setTimeout(typeLine, line.delay + Math.random() * 60);
    }

    // Start terminal after a brief delay
    setTimeout(typeLine, 600);
    setTimeout(() => {
      $('.terminal-block').addClass('visible');
    }, 300);
  }

  /* ══════════════════════════════════════════════
     6. HERO REVEAL
  ══════════════════════════════════════════════ */
  function initHeroReveal() {
    setTimeout(() => {
      $('.hero-type-block').addClass('visible');
      $('.clearance-badge').addClass('visible');
    }, 800);
  }

  /* ══════════════════════════════════════════════
     7. SCROLL-DECRYPT PARAGRAPH
     Words fade in one-by-one with accelerating
     speed as the user scrolls through the section.
  ══════════════════════════════════════════════ */
  function initScrollDecrypt() {
    const $para = $('#decrypt-text');
    const raw   = $para.text().trim();

    // Split into word spans, preserving spaces
    const words = raw.split(/(\s+)/);
    $para.empty();

    const wordSpans = [];
    words.forEach(function (token) {
      if (/^\s+$/.test(token)) {
        // Whitespace — add as-is (space between words)
        $para.append(document.createTextNode(token));
      } else if (token.length > 0) {
        const $w = $('<span class="word"></span>').text(token);
        $para.append($w);
        wordSpans.push($w[0]);
      }
    });

    // GSAP ScrollTrigger for word-by-word lighting
    ScrollTrigger.create({
      trigger: '#decrypt-section',
      start: 'top 80%',
      end: 'bottom 20%',
      scrub: true,
      onUpdate(self) {
        const p = self.progress; // 0 → 1
        // Illuminate words with increasing speed (ease-in feel)
        // Use quadratic easing: faster near end
        const eased = p * p; // slow start, fast end
        const numToLight = Math.floor(eased * wordSpans.length * 1.05);

        wordSpans.forEach((span, i) => {
          if (i < numToLight) {
            span.classList.add('lit');
            span.classList.remove('current');
          } else if (i === numToLight) {
            span.classList.add('current');
            span.classList.remove('lit');
          } else {
            span.classList.remove('lit', 'current');
          }
        });
      }
    });

    // Stats counter animation
    gsap.utils.toArray('.stat-block').forEach(function (block, i) {
      ScrollTrigger.create({
        trigger: block,
        start: 'top 85%',
        once: true,
        onEnter() {
          $(block).addClass('visible');
          const $counter = $(block).find('.counter');
          const target   = parseInt($(block).attr('data-count'));
          let   current  = 0;
          const duration = 1200;
          const stepTime = 20;
          const steps    = duration / stepTime;
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
     8. GENERAL SCROLL ANIMATIONS
  ══════════════════════════════════════════════ */
  function initScrollAnimations() {
    // Kill chain stages — staggered reveal
    gsap.utils.toArray('.kc-stage').forEach(function (stage, i) {
      ScrollTrigger.create({
        trigger: stage,
        start: 'top 85%',
        once: true,
        onEnter() {
          setTimeout(() => {
            stage.classList.add('visible');
          }, i * 120);
        }
      });
    });

    // Credential stages
    gsap.utils.toArray('.stage-item').forEach(function (item, i) {
      ScrollTrigger.create({
        trigger: item,
        start: 'top 88%',
        once: true,
        onEnter() {
          setTimeout(() => {
            item.classList.add('visible');
          }, i * 100);
        }
      });
    });

    // Engagement items
    gsap.utils.toArray('.engagement-item').forEach(function (item, i) {
      gsap.from(item, {
        scrollTrigger: {
          trigger: item,
          start: 'top 88%',
          once: true,
        },
        opacity: 0,
        y: 24,
        duration: 0.6,
        delay: i * 0.08,
        ease: 'power2.out'
      });
    });
  }

  /* ══════════════════════════════════════════════
     9. KILL CHAIN PROGRESS BAR
  ══════════════════════════════════════════════ */
  function initKillChainProgress() {
    ScrollTrigger.create({
      trigger: '#killchain',
      start: 'top 60%',
      end: 'bottom 40%',
      scrub: true,
      onUpdate(self) {
        const w = Math.round(self.progress * 100);
        $('#kc-progress').css('width', w + '%');
      }
    });
  }

  /* ══════════════════════════════════════════════
     10. ENGAGEMENT FILTER
  ══════════════════════════════════════════════ */
  function initEngagementFilter() {
    $('#filter-bar').on('click', '.filter-btn', function () {
      const filter = $(this).attr('data-filter');

      // Update active button
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
          const cat = $(this).attr('data-category');
          if (cat === filter) {
            $(this).removeClass('hidden fading');
            gsap.from(this, { opacity: 0, y: 16, duration: 0.4, delay: i * 0.05, ease: 'power2.out' });
          } else {
            $(this).addClass('hidden');
          }
        });
      }

      // Refresh grid if needed
      setTimeout(() => ScrollTrigger.refresh(), 300);
    });
  }

  /* ══════════════════════════════════════════════
     11. PGP COPY TO CLIPBOARD
  ══════════════════════════════════════════════ */
  function initPgpCopy() {
    $('#copy-pgp-btn').on('click', function () {
      const pgpText = $('#pgp-content').text();
      const $btn    = $(this);

      if (navigator.clipboard) {
        navigator.clipboard.writeText(pgpText).then(function () {
          $btn.addClass('copied');
          $btn.find('.copy-text').text('COPIED');

          setTimeout(function () {
            $btn.removeClass('copied');
            $btn.find('.copy-text').text('COPY');
          }, 2000);
        });
      } else {
        // Fallback
        const $tmp = $('<textarea>').val(pgpText).appendTo('body');
        $tmp[0].select();
        document.execCommand('copy');
        $tmp.remove();

        $btn.addClass('copied');
        $btn.find('.copy-text').text('COPIED');
        setTimeout(() => {
          $btn.removeClass('copied');
          $btn.find('.copy-text').text('COPY');
        }, 2000);
      }
    });
  }

  /* ══════════════════════════════════════════════
     12. LAST HANDSHAKE TIMER
  ══════════════════════════════════════════════ */
  function initHandshakeTimer() {
    function updateHandshake() {
      const now       = new Date();
      const hours     = String(now.getHours()).padStart(2, '0');
      const minutes   = String(now.getMinutes()).padStart(2, '0');
      const seconds   = String(now.getSeconds()).padStart(2, '0');
      const dateStr   = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase();
      $('#last-handshake').text(dateStr + ' · ' + hours + ':' + minutes + ':' + seconds + ' UTC');
    }

    updateHandshake();
    setInterval(updateHandshake, 1000);
  }

  /* ══════════════════════════════════════════════
     13. CURSOR GLITCH on hover of hero name
  ══════════════════════════════════════════════ */
  $('#hero-name').on('mouseenter', function () {
    const $name = $(this);
    const orig  = $name.html();

    let count = 0;
    const glitchChars = '!<>-_\\/[]{}—=+*^?#';
    const interval = setInterval(function () {
      if (count >= 5) {
        clearInterval(interval);
        $name.html(orig);
        return;
      }

      // Briefly scramble the second line text
      const $line2 = $name.find('.line-two');
      const originalText = 'VANCE';
      let scrambled = '';
      for (let i = 0; i < originalText.length; i++) {
        if (Math.random() > 0.4) {
          scrambled += glitchChars[Math.floor(Math.random() * glitchChars.length)];
        } else {
          scrambled += originalText[i];
        }
      }
      $line2.text(scrambled);
      count++;
    }, 60);
  });

  $('#hero-name').on('mouseleave', function () {
    $(this).find('.line-two').text('VANCE');
  });

  /* ══════════════════════════════════════════════
     14. SECTION TAG SCRAMBLE (ambient effect)
  ══════════════════════════════════════════════ */
  function scrambleTag($el) {
    const original  = $el.text();
    const glitchSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789./\\';
    let   iter      = 0;
    const maxIter   = 12;

    const int = setInterval(function () {
      $el.text(
        original.split('').map(function (ch, idx) {
          if (ch === ' ' || ch === '/' || ch === '.') return ch;
          if (idx < iter) return original[idx];
          return glitchSet[Math.floor(Math.random() * glitchSet.length)];
        }).join('')
      );
      iter++;
      if (iter > maxIter) {
        clearInterval(int);
        $el.text(original);
      }
    }, 40);
  }

  // Trigger on scroll enter
  $('.section-tag').each(function () {
    const $tag = $(this);
    ScrollTrigger.create({
      trigger: $tag[0],
      start: 'top 90%',
      once: true,
      onEnter() {
        scrambleTag($tag);
      }
    });
  });

  /* ══════════════════════════════════════════════
     15. PARALLAX on hero grid background
  ══════════════════════════════════════════════ */
  $(window).on('scroll', function () {
    const scrolled = $(this).scrollTop();
    $('.hero-grid-bg').css('transform', 'translateY(' + scrolled * 0.15 + 'px)');
  });

});