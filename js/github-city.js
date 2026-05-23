class GitHubCity {
    constructor() {
        this.canvas = document.querySelector('#github-canvas');
        if (!this.canvas) return;

        // WebGL Capability Safety Checking & 2D Fallback Scaffolding
        let hasWebGL = false;
        try {
            hasWebGL = !!(window.WebGLRenderingContext && (this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl')));
        } catch (e) {
            hasWebGL = false;
        }

        if (!hasWebGL) {
            this.canvas.style.display = 'none';
            // Inject beautiful Neo-Cyber 2D CSS bar grid as static capability fallback
            const fallback = document.createElement('div');
            fallback.className = 'github-fallback';
            fallback.style.cssText = 'width:100%; height:30vh; display:flex; justify-content:center; align-items:flex-end; gap:4px; padding:2rem; overflow:hidden; border-top:1px dashed rgba(0, 245, 255, 0.15);';
            
            // Generate procedurally styled contribution lines
            fallback.innerHTML = Array.from({ length: 60 }, () => {
                const height = Math.random() > 0.35 ? Math.floor(Math.random() * 80 + 10) : 10;
                const active = height > 10;
                const opacity = active ? Math.random() * 0.7 + 0.3 : 0.1;
                const color = height > 60 ? '#00f5ff' : (height > 30 ? '#00aaff' : '#004444');
                return `<div class="fallback-bar" style="flex:1; height:${height}px; background:${active ? color : 'rgba(255,255,255,0.03)'}; opacity:${opacity}; border-radius:1px; transition: all 0.3s ease;"></div>`;
            }).join('');
            
            this.canvas.parentNode.insertBefore(fallback, this.canvas.nextSibling);
            return;
        }

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / (window.innerHeight * 0.5), 0.1, 1000);
        this.camera.position.set(0, 30, 40);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight * 0.5);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        this.cityGroup = new THREE.Group();
        this.scene.add(this.cityGroup);

        this.createCity();
        this.addLights();

        this.clock = new THREE.Clock();
        this.mouse = { x: 0, y: 0 };
        
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        window.addEventListener('resize', this.onResize.bind(this));
        
        this.isIntersecting = false;
        this.initObserver();
    }

    initObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const wasIntersecting = this.isIntersecting;
                this.isIntersecting = entry.isIntersecting;
                if (this.isIntersecting && !wasIntersecting) {
                    this.tick();
                }
            });
        }, { threshold: 0.01 });
        observer.observe(this.canvas);
    }

    createCity() {
        const weeks = 52;
        const days = 7;
        const size = 1;
        const gap = 0.2;

        const geometry = new THREE.BoxGeometry(size, 1, size);
        const material = new THREE.MeshPhongMaterial({ color: 0x00f5ff, transparent: true, opacity: 0.9, shininess: 100 });
        
        this.instancedMesh = new THREE.InstancedMesh(geometry, material, weeks * days);
        const dummy = new THREE.Object3D();

        let index = 0;
        for (let i = 0; i < weeks; i++) {
            for (let j = 0; j < days; j++) {
                // Procedural generation of activity
                const isActive = Math.random() > 0.4;
                const contributions = isActive ? Math.random() * Math.random() * 12 : 0;
                const height = contributions < 0.5 ? 0.2 : contributions;

                const x = (i - weeks / 2) * (size + gap);
                const z = (j - days / 2) * (size + gap);
                const y = height / 2;

                dummy.position.set(x, y, z);
                dummy.scale.set(1, height, 1);
                dummy.updateMatrix();

                this.instancedMesh.setMatrixAt(index, dummy.matrix);
                
                // Coloring based on intensity
                const color = new THREE.Color();
                if (!isActive) color.setHex(0x111111);
                else if (contributions < 3) color.setHex(0x004444);
                else if (contributions < 7) color.setHex(0x00aaff);
                else color.setHex(0x00f5ff);

                this.instancedMesh.setColorAt(index, color);
                index++;
            }
        }
        
        this.cityGroup.add(this.instancedMesh);
    }

    addLights() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambient);
        const point = new THREE.PointLight(0x00f5ff, 2, 100);
        point.position.set(0, 20, 0);
        this.scene.add(point);
    }

    onResize() {
        this.camera.aspect = window.innerWidth / (window.innerHeight * 0.5);
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight * 0.5);
    }

    tick() {
        if (!this.isIntersecting) return; // Completely pause requestAnimationFrame loop when scrolled off-screen

        const elapsedTime = this.clock.getElapsedTime();
        
        // Auto-orbit slowly combined with mouse parallax
        this.cityGroup.rotation.y = elapsedTime * 0.1 + (this.mouse.x * 0.3);
        this.cityGroup.rotation.x = this.mouse.y * 0.1;

        this.renderer.render(this.scene, this.camera);
        window.requestAnimationFrame(this.tick.bind(this));
    }
}

// Auto-init on load
window.addEventListener('DOMContentLoaded', () => {
    new GitHubCity();
});
