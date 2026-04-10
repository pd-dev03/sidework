// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
});

// Main initialization function
function initApp() {
    // Initialize 3D scene
    initThreeJS();
    
    // Initialize animations
    initAnimations();
    
    // Initialize event listeners
    initEventListeners();
    
    // Initialize scroll animations
    initScrollAnimations();
    
    // Hide loading screen after everything is loaded
    setTimeout(() => {
        document.getElementById('loadingScreen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('loadingScreen').style.display = 'none';
        }, 500);
    }, 1500);
}

// Three.js 3D Scene
let scene, camera, renderer, controls;
let cubes = [];
let lights = [];

function initThreeJS() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f7);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.set(0, 2, 10);
    
    // Create renderer
    const canvas = document.getElementById('threeCanvas');
    renderer = new THREE.WebGLRenderer({ 
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    
    updateCanvasSize();
    
    // Add orbit controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 20;
    controls.maxPolarAngle = Math.PI / 2;
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    lights.push(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);
    lights.push(directionalLight);
    
    // Create 3D objects
    create3DScene();
    
    // Start animation loop
    animate();
    
    // Handle window resize
    window.addEventListener('resize', updateCanvasSize);
}

function updateCanvasSize() {
    const container = document.querySelector('.canvas-container');
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

function create3DScene() {
    // Create a central platform
    const platformGeometry = new THREE.CylinderGeometry(4, 4, 0.5, 32);
    const platformMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x6C63FF,
        roughness: 0.4,
        metalness: 0.2
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = -0.25;
    scene.add(platform);
    
    // Create floating cubes
    const cubeCount = 8;
    const radius = 3;
    
    for (let i = 0; i < cubeCount; i++) {
        const angle = (i / cubeCount) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        // Create cube
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const colors = [0x6C63FF, 0xFF6584, 0x36D1DC, 0x5B86E5];
        const material = new THREE.MeshStandardMaterial({ 
            color: colors[i % colors.length],
            roughness: 0.3,
            metalness: 0.5,
            emissive: colors[i % colors.length],
            emissiveIntensity: 0.1
        });
        
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(x, 0.5, z);
        cube.userData.originalY = 0.5;
        cube.userData.angle = angle;
        cube.userData.speed = 0.5 + Math.random() * 0.5;
        
        scene.add(cube);
        cubes.push(cube);
        
        // Create connecting line to center
        const lineMaterial = new THREE.LineBasicMaterial({ 
            color: 0x6C63FF,
            transparent: true,
            opacity: 0.3
        });
        const points = [];
        points.push(new THREE.Vector3(0, 0, 0));
        points.push(new THREE.Vector3(x, 0.5, z));
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(line);
    }
    
    // Create central sphere
    const sphereGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.2,
        metalness: 0.8,
        emissive: 0x6C63FF,
        emissiveIntensity: 0.2
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.y = 1.5;
    scene.add(sphere);
    
    // Add floating particles
    createParticles();
}

function createParticles() {
    const particleCount = 200;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    const color = new THREE.Color(0x6C63FF);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
        // Positions
        const radius = 6 + Math.random() * 4;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        positions[i] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = radius * Math.cos(phi);
        positions[i + 2] = radius * Math.sin(phi) * Math.sin(theta);
        
        // Colors
        colors[i] = color.r;
        colors[i + 1] = color.g;
        colors[i + 2] = color.b;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.6
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
}

function animate() {
    requestAnimationFrame(animate);
    
    // Update cube animations
    cubes.forEach((cube, index) => {
        const time = Date.now() * 0.001;
        
        // Float up and down
        cube.position.y = cube.userData.originalY + Math.sin(time * cube.userData.speed + cube.userData.angle) * 0.5;
        
        // Rotate
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        
        // Orbit around center
        const orbitRadius = 3;
        const orbitSpeed = 0.2;
        cube.position.x = Math.cos(time * orbitSpeed + cube.userData.angle) * orbitRadius;
        cube.position.z = Math.sin(time * orbitSpeed + cube.userData.angle) * orbitRadius;
    });
    
    // Update controls
    controls.update();
    
    // Render scene
    renderer.render(scene, camera);
}

// GSAP Animations
function initAnimations() {
    // Animate hero title
    gsap.from('.title-line', {
        duration: 1.2,
        y: 100,
        opacity: 0,
        stagger: 0.2,
        ease: 'power3.out',
        delay: 0.5
    });
    
    // Animate hero content
    gsap.from('.hero-subtitle', {
        duration: 1,
        y: 30,
        opacity: 0,
        delay: 1.2,
        ease: 'power3.out'
    });
    
    gsap.from('.hero-description', {
        duration: 1,
        y: 30,
        opacity: 0,
        delay: 1.4,
        ease: 'power3.out'
    });
    
    gsap.from('.hero-buttons', {
        duration: 1,
        y: 30,
        opacity: 0,
        delay: 1.6,
        ease: 'power3.out'
    });
    
    // Animate skill bars on load
    document.querySelectorAll('.skill-bar').forEach(bar => {
        const level = bar.getAttribute('data-level');
        const progress = bar.querySelector('.progress');
        
        // Set initial width to 0
        progress.style.width = '0%';
        
        // Store the target width for later animation
        bar.dataset.targetWidth = level + '%';
    });
}

// Scroll Animations
function initScrollAnimations() {
    // Animate elements on scroll
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animate skill bars
                if (entry.target.classList.contains('skill-bar')) {
                    const targetWidth = entry.target.dataset.targetWidth;
                    const progress = entry.target.querySelector('.progress');
                    
                    gsap.to(progress, {
                        width: targetWidth,
                        duration: 1.5,
                        ease: 'power3.out'
                    });
                }
                
                // Animate project cards
                if (entry.target.classList.contains('project-card')) {
                    gsap.from(entry.target, {
                        y: 50,
                        opacity: 0,
                        duration: 0.8,
                        ease: 'power3.out'
                    });
                }
                
                // Animate floating cards
                if (entry.target.classList.contains('floating-card')) {
                    gsap.from(entry.target, {
                        scale: 0,
                        duration: 0.8,
                        ease: 'back.out(1.7)'
                    });
                }
                
                // Animate contact cards
                if (entry.target.classList.contains('contact-card')) {
                    gsap.from(entry.target, {
                        y: 30,
                        opacity: 0,
                        duration: 0.8,
                        ease: 'power3.out'
                    });
                }
            }
        });
    }, observerOptions);
    
    // Observe elements
    document.querySelectorAll('.skill-bar').forEach(el => observer.observe(el));
    document.querySelectorAll('.project-card').forEach(el => observer.observe(el));
    document.querySelectorAll('.floating-card').forEach(el => observer.observe(el));
    document.querySelectorAll('.contact-card').forEach(el => observer.observe(el));
}

// Event Listeners
function initEventListeners() {
    // Theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    const themeIcon = document.getElementById('themeIcon');
    
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        if (document.body.classList.contains('dark-mode')) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            
            // Update Three.js scene background
            if (scene) {
                scene.background = new THREE.Color(0x121212);
            }
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            
            // Update Three.js scene background
            if (scene) {
                scene.background = new THREE.Color(0xf5f5f7);
            }
        }
    });
    
    // Hamburger menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Animate hamburger lines
        const spans = hamburger.querySelectorAll('span');
        if (hamburger.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
    
    // Close menu when clicking on a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            
            // Reset hamburger lines
            const spans = hamburger.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Update active nav link
                document.querySelectorAll('.nav-menu a').forEach(link => {
                    link.classList.remove('active');
                });
                this.classList.add('active');
            }
        });
    });
    
    // Form submission
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = this.querySelector('input[type="text"]').value;
            const email = this.querySelector('input[type="email"]').value;
            const message = this.querySelector('textarea').value;
            
            // In a real application, you would send this data to a server
            console.log('Form submitted:', { name, email, message });
            
            // Show success message
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            
            submitButton.textContent = 'Message Sent!';
            submitButton.style.backgroundColor = 'var(--success-color)';
            
            // Reset form
            this.reset();
            
            // Reset button after 3 seconds
            setTimeout(() => {
                submitButton.textContent = originalText;
                submitButton.style.backgroundColor = '';
            }, 3000);
        });
    }
    
    // Update active nav link on scroll
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY + 100;
        
        // Get all sections
        const sections = document.querySelectorAll('section');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                // Update active nav link
                document.querySelectorAll('.nav-menu a').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
    
    // Parallax effect for floating cards
    window.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        // Apply parallax to floating cards
        const cards = document.querySelectorAll('.floating-card');
        cards.forEach((card, index) => {
            const speed = 0.05 + (index * 0.02);
            const x = (mouseX - 0.5) * 20 * speed;
            const y = (mouseY - 0.5) * 20 * speed;
            
            card.style.transform = `translate(${x}px, ${y}px)`;
        });
    });
}