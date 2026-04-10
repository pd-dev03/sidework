document.addEventListener('DOMContentLoaded', () => {
    initCursor();
    initMobileMenu();
    initCompareSlider();
    initTilt();
    initScrollAnimations();
    initParallax();
    initSmoothScroll();
});

// Custom cursor
function initCursor() {
    const cursor = document.querySelector('.cursor');
    document.addEventListener('mousemove', (e) => {
        cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    });
}

// Mobile menu toggle
function initMobileMenu() {
    const toggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.nav-menu');
    const actions = document.querySelector('.nav-actions');

    toggle.addEventListener('click', () => {
        if (menu.style.display === 'flex') {
            menu.style.display = 'none';
            actions.style.display = 'none';
        } else {
            menu.style.display = 'flex';
            actions.style.display = 'flex';
            menu.style.flexDirection = 'column';
            actions.style.flexDirection = 'column';
        }
    });
}

// Before/after slider
function initCompareSlider() {
    const slider = document.getElementById('compareSlider');
    const before = document.querySelector('.before');
    const after = document.querySelector('.after');
    if (!slider || !before || !after) return;

    slider.addEventListener('input', (e) => {
        const val = e.target.value;
        before.style.clipPath = `inset(0 ${100 - val}% 0 0)`;
        after.style.clipPath = `inset(0 0 0 ${val}%)`;
    });
}

// Tilt effect on polaroids
function initTilt() {
    const cards = document.querySelectorAll('[data-tilt]');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 15;
            const rotateY = (centerX - x) / 15;
            card.style.transform = `rotate(${getComputedStyle(card).getPropertyValue('--rot') || '0deg'}) perspective(500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = `rotate(${getComputedStyle(card).getPropertyValue('--rot') || '0deg'})`;
        });
    });
}

// GSAP scroll animations (updated)
function initScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    gsap.from('.hero-title .line', {
        scrollTrigger: { trigger: '.hero', start: 'top 80%' },
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.2
    });

    gsap.from('.flip-card', {
        scrollTrigger: { trigger: '.features', start: 'top 80%' },
        scale: 0.5,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15
    });

    gsap.from('.polaroid', {
        scrollTrigger: { trigger: '.samples', start: 'top 80%' },
        rotation: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1
    });

    // Animate testimonial cards
    gsap.from('.testimonial-card', {
        scrollTrigger: { trigger: '.testimonials', start: 'top 80%' },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2
    });

    gsap.from('.faq-circle', {
        scrollTrigger: { trigger: '.faq', start: 'top 80%' },
        scale: 0,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1
    });

    // Animate benefit items
    gsap.from('.benefit-item', {
        scrollTrigger: { trigger: '.final-cta', start: 'top 80%' },
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15
    });
}

// Parallax effect on hero cube (moves with mouse)
function initParallax() {
    const cube = document.querySelector('.hero-cube');
    if (!cube) return;

    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        cube.style.top = `calc(50% + ${y}px)`;
        cube.style.left = `calc(50% + ${x}px)`;
    });
}

// Smooth scroll for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Add loaded class to body after window load
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});