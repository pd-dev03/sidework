$(document).ready(function() {
    // Locomotive Scroll
    const scroll = new LocomotiveScroll({
        el: document.querySelector('[data-scroll-container]'),
        smooth: true,
        lerp: 0.08,
        multiplier: 0.8,
        smartphone: { smooth: true },
        tablet: { smooth: true }
    });

    // Custom cursor
    const cursor = $('.cursor');
    $(document).on('mousemove', function(e) {
        cursor.css({ left: e.clientX, top: e.clientY });
    });

    $('a, button, .card').on('mouseenter', () => cursor.addClass('hover'))
                         .on('mouseleave', () => cursor.removeClass('hover'));

    // Typing effect
    const texts = ['AI Researcher', 'ML Engineer', 'Data Scientist'];
    let i = 0, j = 0, current = '', letter = '';
    function type() {
        if (i === texts.length) i = 0;
        current = texts[i];
        letter = current.slice(0, ++j);
        $('.typing-text').text(letter);
        if (letter.length === current.length) {
            i++; j = 0;
            setTimeout(type, 2000);
        } else {
            setTimeout(type, 100);
        }
    }
    type();

    // Active nav link
    const $navLinks = $('[data-nav]');
    scroll.on('scroll', () => {
        const scrollTop = scroll.scroll.instance.scroll.y;
        $('.section').each(function() {
            const $section = $(this);
            const top = $section.offset().top - 200;
            const bottom = top + $section.outerHeight();
            const id = $section.attr('id');
            if (scrollTop >= top && scrollTop < bottom) {
                $navLinks.removeClass('active');
                $(`[data-nav][href="#${id}"]`).addClass('active');
            }
        });
    });

    // Smooth scroll
    $('[data-nav]').on('click', function(e) {
        e.preventDefault();
        scroll.scrollTo($(this).attr('href'), { offset: -100, duration: 1200 });
    });

    // Update on resize
    window.addEventListener('resize', () => { scroll.update(); });
});