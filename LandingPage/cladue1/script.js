/* ═══════════════════════════════════════════════════════
   BuildMyFolio — script.js
   All animations & interactions:
   1. Custom Cursor
   2. Nav scroll state
   3. Typewriter (hero subline — type + erase loop)
   4. Reveal-up on scroll (IntersectionObserver)
   5. Highlight-text: dim → word-by-word on scroll
   6. Fast-type: characters appear at increasing speed
   7. Counter (stat numbers)
   8. FAQ accordion
   9. Why items in-view class
════════════════════════════════════════════════════════ */

$(function () {

  /* ══════════════════════════════════════════════════
     1. CUSTOM CURSOR
  ══════════════════════════════════════════════════ */
  const $cursor   = $('#cursor');
  const $follower = $('#cursorFollower');
  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  $(document).on('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    $cursor.css({ left: mouseX, top: mouseY });
  });

  function animateFollower() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    $follower.css({ left: followerX, top: followerY });
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  /* ══════════════════════════════════════════════════
     2. NAV SCROLL STATE
  ══════════════════════════════════════════════════ */
  const $nav = $('#nav');
  $(window).on('scroll.nav', function () {
    if ($(this).scrollTop() > 60) {
      $nav.addClass('scrolled');
    } else {
      $nav.removeClass('scrolled');
    }
  });

  /* Hamburger (mobile) — just toggles links */
  $('#hamburger').on('click', function () {
    const $links = $('.nav__links');
    if ($links.is(':visible')) {
      $links.fadeOut(200);
    } else {
      $links.css({
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: '70px',
        right: '0',
        background: 'rgba(15,14,12,0.97)',
        backdropFilter: 'blur(16px)',
        padding: '2rem',
        gap: '1.5rem',
        borderLeft: '1px solid rgba(245,240,232,0.07)',
        zIndex: '999'
      }).hide().fadeIn(200);
    }
  });

  /* ══════════════════════════════════════════════════
     3. TYPEWRITER — hero subline (type + erase loop)
  ══════════════════════════════════════════════════ */
  const phrases = [
    'Ditch the drag-and-drop headaches and endless CSS tweaks.',
    'Fill in your details. Hit Publish. You\'re live.',
    'No coding required. No templates to fight with.',
    'Your portfolio at buildmyfolio.in/yourname — ready in minutes.',
    'Join the lazy club. Focus on being awesome.',
  ];

  let phraseIndex = 0;
  let charIndex   = 0;
  let isDeleting  = false;
  let typeDelay   = 48;

  function typeWriter() {
    const current = phrases[phraseIndex];

    if (isDeleting) {
      charIndex--;
      typeDelay = 22;
    } else {
      charIndex++;
      typeDelay = 48;
    }

    $('#typewriter').text(current.substring(0, charIndex));

    if (!isDeleting && charIndex === current.length) {
      // Finished typing — pause then start deleting
      typeDelay = 2200;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      typeDelay = 400;
    }

    setTimeout(typeWriter, typeDelay);
  }

  // Start after hero load animation
  setTimeout(typeWriter, 1200);

  /* ══════════════════════════════════════════════════
     4. REVEAL-UP — IntersectionObserver
  ══════════════════════════════════════════════════ */
  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal-up').forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ══════════════════════════════════════════════════
     5. HIGHLIGHT TEXT — dim → word lit on scroll
     The manifesto paragraph words light up as you
     scroll through the section. Speed accelerates
     slightly toward the end.
  ══════════════════════════════════════════════════ */
  function buildHighlightText() {
    const $p = $('#manifesto');
    if (!$p.length) return;

    // Split text node content into words, preserving HTML tags
    const html = $p.html();

    // Wrap every word in a span, but not inside HTML tags
    const wrapped = html.replace(/(<[^>]+>)|([^\s<]+)/g, function (match, tag, word) {
      if (tag) return tag; // keep HTML tags untouched
      return '<span class="word">' + word + '</span>';
    });

    $p.html(wrapped);
  }

  buildHighlightText();

  function updateHighlight() {
    const $p = $('#manifesto');
    if (!$p.length) return;

    const $words   = $p.find('.word');
    if (!$words.length) return;

    const wTop     = $p.offset().top;
    const wHeight  = $p.outerHeight();
    const scrollY  = $(window).scrollTop();
    const winH     = $(window).height();

    // progress: 0 = top of paragraph at bottom of viewport
    //           1 = bottom of paragraph at top of viewport
    const start    = wTop - winH * 0.85;
    const end      = wTop + wHeight - winH * 0.2;
    const progress = Math.min(1, Math.max(0, (scrollY - start) / (end - start)));

    const total    = $words.length;
    const litCount = Math.floor(progress * total);

    $words.each(function (i) {
      if (i < litCount) {
        $(this).addClass('lit');
      } else {
        $(this).removeClass('lit');
      }
    });
  }

  $(window).on('scroll.highlight', updateHighlight);
  updateHighlight();

  /* ══════════════════════════════════════════════════
     6. FAST-TYPE — feature titles type char by char
     at increasing speed when scrolled into view
  ══════════════════════════════════════════════════ */
  const typedTitles = new Set();

  function fastType(el) {
    if (typedTitles.has(el)) return;
    typedTitles.add(el);

    const fullText = el.textContent.trim();
    el.textContent = '';
    el.style.minHeight = ''; // allow natural height

    let i = 0;
    const totalChars = fullText.length;

    function typeChar() {
      if (i >= totalChars) return;
      el.textContent += fullText[i];
      i++;

      // Speed: starts slow (~80ms), accelerates to ~18ms by end
      const progress  = i / totalChars;
      const delay     = Math.max(18, 80 - progress * 62);
      setTimeout(typeChar, delay);
    }

    typeChar();
  }

  const fastTypeObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        fastType(entry.target);
      }
    });
  }, { threshold: 0.4 });

  document.querySelectorAll('.fast-type-trigger').forEach(function (el) {
    fastTypeObserver.observe(el);
  });

  /* ══════════════════════════════════════════════════
     7. COUNTER — stat numbers count up
  ══════════════════════════════════════════════════ */
  const counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const el     = entry.target;
        const target = parseInt(el.getAttribute('data-target'), 10);
        counterObserver.unobserve(el);

        if (target === 0) {
          // Special: stays at 0, just flash it
          el.textContent = '0';
          return;
        }

        let current = 0;
        const step  = Math.ceil(target / 40);
        const timer = setInterval(function () {
          current += step;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          el.textContent = current;
        }, 40);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.story__stat-num').forEach(function (el) {
    counterObserver.observe(el);
  });

  /* ══════════════════════════════════════════════════
     8. FAQ ACCORDION
  ══════════════════════════════════════════════════ */
  $('.faq__q').on('click', function () {
    const $btn    = $(this);
    const $answer = $btn.next('.faq__a');
    const isOpen  = $btn.attr('aria-expanded') === 'true';

    // Close all
    $('.faq__q').attr('aria-expanded', 'false');
    $('.faq__a').removeClass('open');

    if (!isOpen) {
      $btn.attr('aria-expanded', 'true');
      $answer.addClass('open');
    }
  });

  /* ══════════════════════════════════════════════════
     9. WHY ITEMS — add in-view class for line effect
  ══════════════════════════════════════════════════ */
  const whyObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.why__item').forEach(function (el) {
    whyObserver.observe(el);
  });

  /* ══════════════════════════════════════════════════
     10. RANT BLOCK — subtle parallax on scroll
  ══════════════════════════════════════════════════ */
  $(window).on('scroll.rant', function () {
    const scrollY = $(window).scrollTop();
    const $rant   = $('.rant');
    if (!$rant.length) return;

    const rantTop  = $rant.offset().top;
    const winH     = $(window).height();
    const relScroll = scrollY - rantTop + winH;

    if (relScroll > 0 && relScroll < winH * 2) {
      const shift = relScroll * 0.04;
      $rant.find('.rant__quote').css('transform', 'translateY(' + (-shift) + 'px)');
    }
  });

  /* ══════════════════════════════════════════════════
     INITIAL LOAD — trigger elements already in view
  ══════════════════════════════════════════════════ */
  // Trigger hero elements (they're in viewport on load)
  setTimeout(function () {
    $('.hero .reveal-up').each(function () {
      $(this).addClass('in-view');
    });
  }, 100);

});
