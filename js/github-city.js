class GitHubCity {
    constructor() {
        this.canvas = document.querySelector('#github-canvas');
        if (!this.canvas) return;

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
        this.tick();
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
