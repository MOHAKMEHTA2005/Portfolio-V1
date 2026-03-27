import { projects } from './projects.js';

// --- Global DOM Population ---
function populateProjects() {
    const container = document.getElementById('projects-container');
    if (!container) return;

    projects.forEach((proj, idx) => {
        const cardHTML = `
            <a href="${proj.link}" target="_blank" rel="noopener noreferrer" class="project-card magnetic" data-index="${idx}">
                <div class="project-abstract" style="padding: 0;">
                    ${proj.image ? `<img src="${proj.image}" alt="${proj.title}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.85; transition: opacity 0.4s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);" class="project-img" />` : '<div class="abstract-lines"></div>'}
                    <div style="position: absolute; top: 1.5rem; right: 1.5rem; width: 6px; height: 6px; background: var(--color-accent); border-radius: 50%; box-shadow: 0 0 10px var(--color-accent-glow);"></div>
                </div>
                <div class="project-info">
                    <span class="mono-label">${proj.type}</span>
                    <h3 class="project-title">${proj.title}</h3>
                    <p class="project-context">${proj.context}</p>
                    <div class="project-tech">
                        ${proj.tech.map(t => `<span class="tech-badge">${t}</span>`).join('')}
                    </div>
                </div>
            </a>
        `;
        container.insertAdjacentHTML('beforeend', cardHTML);
    });
}
document.getElementById('year').textContent = new Date().getFullYear();
populateProjects();

// --- Core App Interactions ---
class AppInteractions {
    constructor() {
        gsap.registerPlugin(ScrollTrigger, TextPlugin);
        
        // Mouse Coordinates for Parallax & Cursor
        this.mouse = { x: 0, y: 0, normalizedX: 0, normalizedY: 0 };
        
        this.initCursor();
        this.initMagneticButtons();
        
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        
        // Initialize Audio and Easter Egg listeners
        this.initSoundAndEasterEgg();
        this.initTabVisibility();
        this.printConsoleArt();
        this.initFlashlight();
        this.initLenis();
        this.initMagneticText();
    }

    initLenis() {
        if(typeof Lenis === 'undefined') return;

        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
        });

        // Sync Lenis with GSAP ScrollTrigger and Frame Ticker
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
    }

    initMagneticText() {
        const title = document.querySelector('.hero-title');
        if (!title) return;

        const text = title.textContent;
        title.textContent = '';
        title.removeAttribute('data-text'); // Remove global glitch wrapper
        title.style.display = 'flex';
        title.style.justifyContent = 'center';
        title.style.flexWrap = 'wrap';
        title.style.gap = '0.5rem'; // Better spacing for repelling

        const chars = [];
        
        // Split word by word first to not break wrapping
        const words = text.split(' ');
        words.forEach((word, wordIdx) => {
            const wordDiv = document.createElement('div');
            wordDiv.style.display = 'flex';
            
            for(let i = 0; i < word.length; i++) {
                const char = word[i];
                const span = document.createElement('span');
                span.className = 'char glitch-char'; // Assign class for pseudo-element CSS mapping
                span.setAttribute('data-text', char);
                span.textContent = char;
                span.style.display = 'inline-block';
                span.style.position = 'relative';
                span.style.transformOrigin = 'center';
                
                wordDiv.appendChild(span);
                chars.push(span);
            }
            
            title.appendChild(wordDiv);
        });

        // Throttle physics calculations to requestAnimationFrame for God-tier performance
        let mouseX = window.innerWidth / 2;
        let mouseY = -1000;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        const activationRadius = 200; // Activation distance
        const repelStrength = 60; // Max displacement

        gsap.ticker.add(() => {
            chars.forEach(char => {
                const rect = char.getBoundingClientRect();
                const charX = rect.left + rect.width / 2;
                const charY = rect.top + rect.height / 2;

                const distX = mouseX - charX;
                const distY = mouseY - charY;
                const distance = Math.sqrt(distX * distX + distY * distY);

                if (distance < activationRadius) {
                    const force = (activationRadius - distance) / activationRadius;
                    // Push opposite to mouse
                    const pushX = -(distX / distance) * force * repelStrength;
                    const pushY = -(distY / distance) * force * repelStrength;
                    
                    // Immediately apply physics (no tween duration for zero-latency repel)
                    gsap.to(char, {
                        x: pushX,
                        y: pushY,
                        rotation: pushX * 0.1,
                        scale: 1 + (force * 0.3),
                        duration: 0.1,
                        ease: "none",
                        overwrite: "auto"
                    });
                } else {
                    // Elastic snapback
                    if(char._gsap && (char._gsap.x !== 0 || char._gsap.y !== 0)) {
                        gsap.to(char, {
                            x: 0,
                            y: 0,
                            rotation: 0,
                            scale: 1,
                            duration: 1.2,
                            ease: "elastic.out(1, 0.3)",
                            overwrite: "auto"
                        });
                    }
                }
            });
        });
    }

    initFlashlight() {
        const btn = document.getElementById('flashlight-btn');
        if(btn) {
            btn.addEventListener('click', () => {
                document.body.classList.toggle('flashlight-mode');
            });
        }
    }

    printConsoleArt() {
        const skull = `
        .▄▄ · ▄· ▄▌.▄▄ · ▄▄▄█████▄
        ▐█ ▀. █▪██▌▐█ ▀. ▀▀▀█ ▀█ ▀
        ▄▀▀▀█▄█▌▐█▌▄▀▀▀█▄·██ ▐█▌
        ▐█▄▪▐███ █▌▐█▄▪▐█ ▐█ ▐█▌
         ▀▀▀▀ ▀▀ █▪ ▀▀▀▀   ▀ ▀▀▀
        `;
        console.log(`%c${skull}`, "color: #00f5ff; font-weight: bold;");
        console.log("%c[ SYSTEM ACCESS GRANTED ]", "color: #00ff41; font-weight: bold; font-size: 14px;");
        console.log("%cAh, I see you're an engineer of culture as well... Let's talk:", "color: #fff; font-size: 14px;");
        console.log("%c📧 mohakmehta.2005@gmail.com", "color: #00f5ff; font-size: 16px; font-weight: bold;");
        console.log("%c[ Type 'chaos' anywhere to destroy the website. ]", "color: #ff0055; font-size: 12px; font-style: italic;");
    }

    initTabVisibility() {
        const originalTitle = document.title;
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "hidden") {
                document.title = "/> System Paused... | Mohak";
            } else {
                document.title = originalTitle;
            }
        });
    }

    startAnimations() {
        this.initScrollAnimations();
        this.typewriterEffect();

        window.addEventListener('mousemove', this.onMouseMove.bind(this));
    }

    onMouseMove(e) {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;

        // Flashlight CSS Variable injection
        document.body.style.setProperty('--mouse-x', e.clientX + 'px');
        document.body.style.setProperty('--mouse-y', e.clientY + 'px');
        
        // Normalized for Three.js (-1 to +1)
        this.mouse.normalizedX = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.normalizedY = -(e.clientY / window.innerHeight) * 2 + 1;

        // Custom Cursor movement
        gsap.to('#cursor', { x: this.mouse.x, y: this.mouse.y, duration: 0, ease: "none" });
        gsap.to('#cursor-follower', { x: this.mouse.x, y: this.mouse.y, duration: 0.15, ease: "power2.out" });
    }

    initCursor() {
        const hoverTargets = document.querySelectorAll('a, button, .project-card, .magnetic');
        const cursorFollower = document.getElementById('cursor-follower');

        hoverTargets.forEach(target => {
            target.addEventListener('mouseenter', () => cursorFollower.classList.add('hovering'));
            target.addEventListener('mouseleave', () => cursorFollower.classList.remove('hovering'));
        });
    }

    initMagneticButtons() {
        // Wait briefly to ensure DOM is fully populated
        setTimeout(() => {
            const magnets = document.querySelectorAll('.magnetic');
            
            magnets.forEach(magnet => {
                magnet.addEventListener('mousemove', (e) => {
                    const rect = magnet.getBoundingClientRect();
                    // Get offset from center of element
                    const offsetX = (e.clientX - rect.left - rect.width / 2) * 0.3;
                    const offsetY = (e.clientY - rect.top - rect.height / 2) * 0.3;
                    
                    gsap.to(magnet, {
                        x: offsetX,
                        y: offsetY,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                });

                magnet.addEventListener('mouseleave', () => {
                    gsap.to(magnet, {
                        x: 0,
                        y: 0,
                        duration: 0.8,
                        ease: "elastic.out(1, 0.3)"
                    });
                });
            });
        }, 200);
    }

    initSoundAndEasterEgg() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();

        const playTick = () => {
            if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
            const osc = this.audioCtx.createOscillator();
            const gainNode = this.audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200, this.audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1800, this.audioCtx.currentTime + 0.04);
            gainNode.gain.setValueAtTime(0.003, this.audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.04);
            osc.connect(gainNode);
            gainNode.connect(this.audioCtx.destination);
            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.04);
        };

        const hoverTargets = document.querySelectorAll('a, button, .project-card, .magnetic');
        hoverTargets.forEach(target => {
            target.addEventListener('mouseenter', playTick);
        });

        // Easter Egg string tracking
        let typed = "";
        
        // Konami Code Array
        const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
        let konamiIndex = 0;

        window.addEventListener('keydown', (e) => {
            // Konami tracking
            if (e.key === konami[konamiIndex]) {
                konamiIndex++;
                if (konamiIndex === konami.length) {
                    this.triggerGodMode();
                    konamiIndex = 0;
                }
            } else {
                konamiIndex = 0;
            }

            // Word tracking (chaos, vibe, mohak)
            if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
                typed += e.key.toLowerCase();
                if (typed.length > 10) typed = typed.slice(-10); // Keep last 10 chars
                
                if (typed.endsWith('vibe') || typed.endsWith('mohak')) {
                    this.triggerMatrixEasterEgg();
                    typed = ""; 
                }
            }
        });
    }

    triggerGodMode() {
        document.designMode = 'on';
        const banner = document.createElement('div');
        banner.style.cssText = 'position:fixed;top:40%;left:50%;transform:translate(-50%, -50%);background:#fff;color:#000;padding:2rem 4rem;font-family:var(--font-sans);font-weight:900;font-size:3rem;z-index:999999;border-radius:12px;box-shadow: 0 0 100px #fff; text-align: center;';
        banner.innerHTML = 'GOD MODE OVERRIDE<br><span style="font-size: 1.2rem; font-weight: 300; font-family: var(--font-mono);">Document Design Mode is ACTIVE. Everything is editable.</span>';
        document.body.appendChild(banner);
        setTimeout(() => {
            banner.style.transition = 'opacity 1s';
            banner.style.opacity = '0';
            setTimeout(() => banner.remove(), 1000);
        }, 3000);
    }

    triggerMatrixEasterEgg() {
        document.documentElement.style.setProperty('--color-accent', '#00ff41');
        document.documentElement.style.setProperty('--color-accent-glow', 'rgba(0, 255, 65, 0.3)');
        
        if (window.experienceInstance) window.experienceInstance.triggerMatrixColor();

        const banner = document.createElement('div');
        banner.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#00ff41;color:#000;padding:10px 20px;font-family:var(--font-mono);font-weight:bold;z-index:999999;border-radius:4px; transition: opacity 0.5s;';
        banner.innerText = 'ENTER THE MATRIX [VIBE ENABLED]';
        document.body.appendChild(banner);
        
        setTimeout(() => banner.style.opacity = '0', 3500);
        setTimeout(() => banner.remove(), 4000);
        
        setTimeout(() => {
            document.documentElement.style.removeProperty('--color-accent');
            document.documentElement.style.removeProperty('--color-accent-glow');
            if (window.experienceInstance) window.experienceInstance.resetColor();
        }, 15000); // Revert after 15s
    }

    typewriterEffect() {
        // Clear text first
        document.getElementById('typewriter').textContent = "";
        
        // Run after initial entry animations
        gsap.to('#typewriter', {
            text: "Machine Learning Engineer & Full Stack Vibe Coder",
            duration: 3.5,
            delay: 1.5,
            ease: "none"
        });
    }

    initScrollAnimations() {
        // Scroll Progress Bar
        gsap.to('#scroll-progress', {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
                trigger: document.body,
                start: "top top",
                end: "bottom bottom",
                scrub: 0.3
            }
        });

        // Hero Titles
        gsap.fromTo('.hero-title', 
            { y: 60, opacity: 0 },
            { y: 0, opacity: 1, duration: 2, ease: "power4.out" }
        );
        gsap.fromTo('.terminal-box', 
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.5, delay: 0.3, ease: "power4.out" }
        );

        // Regular Sections
        const sections = document.querySelectorAll('.section:not(.hero-section)');
        sections.forEach(sec => {
            gsap.fromTo(sec.querySelector('.section-header'),
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1.2,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: sec,
                        start: "top 85%",
                    }
                }
            );
        });

        // Projects Stagger
        ScrollTrigger.batch(".project-card", {
            onEnter: batch => gsap.fromTo(batch, 
                { opacity: 0, y: 60, scale: 0.98 },
                { opacity: 1, y: 0, scale: 1, stagger: 0.15, overwrite: true, duration: 1, ease: "power3.out" }
            ),
            start: "top 85%"
        });
    }
}

// --- High-End Three.js Experience ---
class Experience {
    constructor(appInteractions) {
        this.appInteractions = appInteractions;
        this.canvas = document.getElementById('webgl-canvas');
        if (!this.canvas) return;
        
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x030303, 0.0012); // Slightly denser fog

        this.sizes = { width: window.innerWidth, height: window.innerHeight };

        this.camera = new THREE.PerspectiveCamera(75, this.sizes.width / this.sizes.height, 0.1, 2000);
        this.camera.position.z = 1000;
        
        // Base camera rig for parallax
        this.cameraRig = new THREE.Group();
        this.cameraRig.add(this.camera);
        this.scene.add(this.cameraRig);

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(this.sizes.width, this.sizes.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        this.createNeuralTunnel();
        this.syncScroll();
        this.initMobileGyroscope();

        window.addEventListener('resize', this.onResize.bind(this));
        
        this.clock = new THREE.Clock();
        this.tick();
    }

    initMobileGyroscope() {
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (e) => {
                // e.gamma = left-to-right (-90 to 90)
                // e.beta = front-to-back (-180 to 180)
                if (e.gamma !== null && e.beta !== null) {
                    const normalizedX = Math.max(-1, Math.min(1, e.gamma / 45));
                    const normalizedY = Math.max(-1, Math.min(1, (e.beta - 45) / 45));
                    // Smooth merge with mouse coordinates
                    this.appInteractions.mouse.normalizedX = normalizedX;
                    this.appInteractions.mouse.normalizedY = normalizedY;
                }
            });
        }
    }

    createNeuralTunnel() {
        const particleCount = 2500;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const color1 = new THREE.Color('#ffffff');
        const color2 = new THREE.Color('#00f5ff');

        for(let i = 0; i < particleCount; i++) {
            const z = Math.random() * 2500 - 1500;
            const radius = 180 + Math.random() * 150;
            const theta = Math.random() * Math.PI * 2;
            
            const x = Math.cos(theta) * radius;
            const y = Math.sin(theta) * radius;

            positions[i * 3 + 0] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            const mixedColor = color1.clone().lerp(color2, Math.random());
            colors[i * 3 + 0] = mixedColor.r;
            colors[i * 3 + 1] = mixedColor.g;
            colors[i * 3 + 2] = mixedColor.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 2.5,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
        
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x00f5ff,
            transparent: true,
            opacity: 0.15,
            blending: THREE.AdditiveBlending
        });
        this.lines = new THREE.LineSegments(geometry, lineMaterial);
        this.scene.add(this.lines);
    }

    syncScroll() {
        // Deep dive into the tunnel on scroll
        gsap.to(this.camera.position, {
            z: -700,
            ease: "none",
            scrollTrigger: {
                trigger: document.body,
                start: "top top",
                end: "bottom bottom",
                scrub: 1
            }
        });
    }

    triggerMatrixColor() {
        if (!this.particles || !this.particles.geometry.attributes.color) return;
        const colors = this.particles.geometry.attributes.color.array;
        for(let i = 0; i < colors.length; i+=3) {
            colors[i] = 0.0;     // R
            colors[i+1] = 1.0;   // G
            colors[i+2] = 0.25;  // B
        }
        this.particles.geometry.attributes.color.needsUpdate = true;
        this.lines.material.color.setHex(0x00ff41);
    }

    resetColor() {
        if (!this.particles || !this.particles.geometry.attributes.color) return;
        const color1 = new THREE.Color('#ffffff');
        const color2 = new THREE.Color('#00f5ff');
        const colors = this.particles.geometry.attributes.color.array;
        
        for(let i = 0; i < colors.length / 3; i++) {
            const mixedColor = color1.clone().lerp(color2, Math.random());
            colors[i * 3 + 0] = mixedColor.r;
            colors[i * 3 + 1] = mixedColor.g;
            colors[i * 3 + 2] = mixedColor.b;
        }
        this.particles.geometry.attributes.color.needsUpdate = true;
        this.lines.material.color.setHex(0x00f5ff);
    }

    onResize() {
        this.sizes.width = window.innerWidth;
        this.sizes.height = window.innerHeight;

        this.camera.aspect = this.sizes.width / this.sizes.height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.sizes.width, this.sizes.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    tick() {
        const elapsedTime = this.clock.getElapsedTime();

        // 1. Core rotation of the tunnel
        if (this.particles) {
            this.particles.rotation.z = elapsedTime * 0.03;
            this.lines.rotation.z = elapsedTime * 0.03;
        }

        // 2. Parallax mouse effect (smooth interpolation)
        const targetX = this.appInteractions.mouse.normalizedX * 150;
        const targetY = this.appInteractions.mouse.normalizedY * 150;

        this.cameraRig.position.x += (targetX - this.cameraRig.position.x) * 0.05;
        this.cameraRig.position.y += (targetY - this.cameraRig.position.y) * 0.05;

        // Subtle tilt
        this.cameraRig.rotation.y = -this.cameraRig.position.x * 0.001;
        this.cameraRig.rotation.x = this.cameraRig.position.y * 0.001;

        this.renderer.render(this.scene, this.camera);
        window.requestAnimationFrame(this.tick.bind(this));
    }
}

// Initializer with Preloader
document.addEventListener('DOMContentLoaded', () => {
    const output = document.getElementById('preloader-output');
    const preloader = document.getElementById('preloader');
    
    const lines = [
        "[SYS] Initializing WebGL Renderer...",
        "[SYS] Mounting GSAP Control Nodes...",
        "[SYS] Bypassing Security Protocols...",
        "[OK] Identity Confirmed: MOHAK MEHTA.",
        "[OK] Access Granted. Entering VIBE Mode."
    ];
    
    let delay = 0;
    lines.forEach((line) => {
        setTimeout(() => {
            const div = document.createElement('div');
            div.className = 'preloader-line';
            div.textContent = line;
            output.appendChild(div);
        }, delay);
        delay += Math.random() * 300 + 400; // Between 400 and 700ms per line
    });
    
    // Total preloader time is roughly delay + 600ms
    setTimeout(() => {
        // Init the systems in background
        const appInteractions = new AppInteractions();
        window.experienceInstance = new Experience(appInteractions);
        
        // Fade out preloader
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.display = 'none';
            // Start animations after preloader is totally gone
            appInteractions.startAnimations();
        }, 800);
    }, delay + 600);
});
