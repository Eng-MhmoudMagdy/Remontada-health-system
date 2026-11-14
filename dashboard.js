document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();

    // =========================================================
    // 1. تحميل الكروت بسرعة وانسيابية (Smooth Staggered Entrance)
    // =========================================================
    if (window.gsap) {
        gsap.from('.anim-item', {
            y: 20,
            opacity: 0,
            duration: 0.55,
            stagger: 0.08,
            ease: 'power2.out',
            clearProps: 'transform,opacity'
        });
    }

    // =========================================================
    // 2. خلفية النجوم الهادئة
    // =========================================================
    const bgCanvas = document.getElementById('space-bg-canvas');
    const bgCtx = bgCanvas.getContext('2d');
    let bw, bh, stars = [];

    function resizeStarfield() {
        bw = bgCanvas.width = window.innerWidth;
        bh = bgCanvas.height = window.innerHeight;
        stars = Array.from({ length: Math.floor((bw * bh) / 7500) }, () => ({
            x: Math.random() * bw,
            y: Math.random() * bh,
            r: Math.random() * 1.3 + 0.3,
            a: Math.random() * 0.65 + 0.2,
            d: (Math.random() * 0.007 + 0.002) * (Math.random() < 0.5 ? 1 : -1)
        }));
    }

    function animateStarfield() {
        bgCtx.clearRect(0, 0, bw, bh);
        for (const s of stars) {
            s.a += s.d;
            if (s.a <= 0.15 || s.a >= 0.85) s.d = -s.d;
            bgCtx.beginPath();
            bgCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            bgCtx.fillStyle = `rgba(226, 232, 240, ${s.a})`;
            bgCtx.fill();
        }
        requestAnimationFrame(animateStarfield);
    }

    window.addEventListener('resize', resizeStarfield);
    resizeStarfield();
    animateStarfield();

    // =========================================================
    // 3. مجسم الكرة الأرضية الواقعي 3D (Three.js Photorealistic Earth)
    // =========================================================
    function initRealisticEarth() {
        const container = document.getElementById('earth-3d-container');
        if (!container || !window.THREE) return;

        const w = container.clientWidth;
        const h = container.clientHeight;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 1000);
        camera.position.z = 3.05;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;
        container.appendChild(renderer.domElement);

        // إضاءة الشمس + إضاءة محيطية ناعمة للجانب المظلم
        scene.add(new THREE.AmbientLight(0x28385E, 0.85));

        const sunLight = new THREE.DirectionalLight(0xFFFFFF, 1.9);
        sunLight.position.set(5, 2.5, 4);
        scene.add(sunLight);

        const rimLight = new THREE.DirectionalLight(0x38BDF8, 0.45);
        rimLight.position.set(-4, -2, -3);
        scene.add(rimLight);

        // خامات سطح الأرض والسحب والتضاريس
        const loader = new THREE.TextureLoader();
        loader.setCrossOrigin('anonymous');
        const texBase = 'https://raw.githubusercontent.com/mrdoob/three.r128/examples/textures/planets/';

        const earthMap = loader.load(texBase + 'earth_atmos_2048.jpg');
        const earthNormal = loader.load(texBase + 'earth_normal_2048.jpg');
        const earthSpecular = loader.load(texBase + 'earth_specular_2048.jpg');
        const cloudsMap = loader.load(texBase + 'earth_clouds_1024.png');

        const earthGroup = new THREE.Group();
        earthGroup.rotation.z = THREE.MathUtils.degToRad(23.5);
        scene.add(earthGroup);

        // كرة سطح الأرض
        const earthMesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.98, 64, 64),
            new THREE.MeshPhongMaterial({
                map: earthMap,
                normalMap: earthNormal,
                normalScale: new THREE.Vector2(0.85, 0.85),
                specularMap: earthSpecular,
                specular: new THREE.Color(0x334155),
                shininess: 18
            })
        );
        earthGroup.add(earthMesh);

        // طبقة السحب المتحركة
        const cloudMesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.998, 64, 64),
            new THREE.MeshPhongMaterial({
                map: cloudsMap,
                transparent: true,
                opacity: 0.82,
                depthWrite: false
            })
        );
        earthGroup.add(cloudMesh);

        // هالة الغلاف الجوي المضيئة
        const atmosMesh = new THREE.Mesh(
            new THREE.SphereGeometry(1.06, 64, 64),
            new THREE.ShaderMaterial({
                transparent: true,
                side: THREE.BackSide,
                blending: THREE.AdditiveBlending,
                vertexShader: `
                    varying vec3 vNormal;
                    void main() {
                        vNormal = normalize(normalMatrix * normal);
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    varying vec3 vNormal;
                    void main() {
                        float intensity = pow(0.66 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
                        gl_FragColor = vec4(0.22, 0.68, 1.0, 1.0) * intensity * 1.45;
                    }
                `
            })
        );
        earthGroup.add(atmosMesh);

        // تدوير الأرض بالماوس
        let isDragging = false;
        let prevX = 0, prevY = 0;

        container.addEventListener('pointerdown', (e) => {
            isDragging = true;
            prevX = e.clientX;
            prevY = e.clientY;
        });

        window.addEventListener('pointermove', (e) => {
            if (!isDragging) return;
            earthGroup.rotation.y += (e.clientX - prevX) * 0.008;
            earthGroup.rotation.x = Math.max(-0.6, Math.min(0.6, earthGroup.rotation.x + (e.clientY - prevY) * 0.006));
            prevX = e.clientX;
            prevY = e.clientY;
        });

        window.addEventListener('pointerup', () => { isDragging = false; });

        function renderLoop() {
            requestAnimationFrame(renderLoop);
            if (!isDragging) earthMesh.rotation.y += 0.0022;
            cloudMesh.rotation.y += 0.0029;
            renderer.render(scene, camera);
        }

        renderLoop();

        window.addEventListener('resize', () => {
            const nw = container.clientWidth;
            const nh = container.clientHeight;
            if (!nw || !nh) return;
            camera.aspect = nw / nh;
            camera.updateProjectionMatrix();
            renderer.setSize(nw, nh);
        });
    }

    initRealisticEarth();

    // =========================================================
    // 4. تحديث الساعة المدارية والمسافة عن الأرض
    // =========================================================
    const clockEl = document.getElementById('mission-utc-clock');
    const distanceEl = document.getElementById('earth-distance-km');
    const latencyEl = document.getElementById('signal-latency');
    let separationKm = 384412;

    function updateTelemetry() {
        clockEl.textContent = 'UTC ' + new Date().toISOString().substring(11, 19);
        separationKm += 1;
        distanceEl.textContent = separationKm.toLocaleString('en-US');
        latencyEl.textContent = `${(separationKm / 299792).toFixed(2)} s`;
    }

    updateTelemetry();
    setInterval(updateTelemetry, 1000);


    function navigateToModule(routePath) {
        if (!routePath) return;
        window.location.href = routePath;
    }


    document.querySelectorAll('.nav-card[data-route]').forEach(card => {
        card.addEventListener('click', () => {
            navigateToModule(card.getAttribute('data-route'));
        });
    });

    // أيقونة Roadmap -> roadmap.html
    document.getElementById('roadmap-nav-btn').addEventListener('click', () => {
        navigateToModule('roadmap.html');
    });
});