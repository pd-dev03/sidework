$(document).ready(function() {
    // Initialize Locomotive Scroll
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
        cursor.css({
            left: e.clientX,
            top: e.clientY
        });
    });

    // Hover effect on interactive elements
    $('a, button, .card, .nav-link, .cta-button').on('mouseenter', function() {
        cursor.addClass('hover');
    }).on('mouseleave', function() {
        cursor.removeClass('hover');
    });

    // Typing effect
    const texts = ['Developer', 'Designer', 'Creator'];
    let count = 0, index = 0, currentText = '', letter = '';
    
    function type() {
        if (count === texts.length) count = 0;
        currentText = texts[count];
        letter = currentText.slice(0, ++index);
        $('.typing-text').text(letter);
        
        if (letter.length === currentText.length) {
            count++;
            index = 0;
            setTimeout(type, 2000);
        } else {
            setTimeout(type, 100);
        }
    }
    type();

    // Active nav link on scroll
    const $navLinks = $('[data-nav]');
    
    function setActiveLink() {
        const scrollTop = scroll.scroll.instance.scroll.y;
        const sections = $('.section');
        
        sections.each(function() {
            const $section = $(this);
            const sectionTop = $section.offset().top - 200;
            const sectionBottom = sectionTop + $section.outerHeight();
            const id = $section.attr('id');
            
            if (scrollTop >= sectionTop && scrollTop < sectionBottom) {
                $navLinks.removeClass('active');
                $(`[data-nav][href="#${id}"]`).addClass('active');
                return false;
            }
        });
    }
    
    scroll.on('scroll', setActiveLink);
    setTimeout(setActiveLink, 100);

    // Smooth scroll for navigation
    $('[data-nav]').on('click', function(e) {
        e.preventDefault();
        const target = $(this).attr('href');
        scroll.scrollTo(target, { 
            offset: -100, 
            duration: 1200,
            easing: [0.25, 0.0, 0.35, 1.0]
        });
    });

    // Skill circles animation
    $('.skill-circle').each(function() {
        const $this = $(this);
        const percent = $this.data('percent');
        const $progress = $this.find('.circle-progress');
        
        $progress.css('stroke-dashoffset', 100);
        
        function setProgress(value) {
            const offset = 100 - (value / 100) * 100;
            $progress.css('stroke-dashoffset', offset);
        }

        const checkSkill = function() {
            const scrollTop = scroll.scroll.instance.scroll.y;
            const windowHeight = window.innerHeight;
            const elementTop = $this.offset().top;
            
            if (scrollTop + windowHeight > elementTop + 100) {
                setProgress(percent);
                scroll.off('scroll', checkSkill);
            }
        };
        
        scroll.on('scroll', checkSkill);
        setTimeout(checkSkill, 100);
    });

    // Menu toggle for mobile
    $('.menu-toggle').on('click', function() {
        $(this).toggleClass('active');
        $('.nav-menu').slideToggle(300);
    });

    // Form submission
    $('.premium-form').on('submit', function(e) {
        e.preventDefault();
        
        const $btn = $(this).find('.submit-btn');
        $btn.css('transform', 'scale(0.95)');
        
        setTimeout(() => {
            $btn.css('transform', 'scale(1)');
            alert('Thank you for your message! (Demo)');
        }, 200);
    });

    // Parallax effect for hero backdrop
    function updateHeroParallax() {
        const scrollTop = scroll.scroll.instance.scroll.y;
        $('.hero-backdrop').css('transform', `rotate(${scrollTop * 0.01}deg)`);
    }
    
    scroll.on('scroll', updateHeroParallax);

    // Update Locomotive on resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            scroll.update();
        }, 250);
    });
});