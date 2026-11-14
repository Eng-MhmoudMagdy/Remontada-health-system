const ClinicCinema = (() => {
    let animFrameId = null;

    function playWarpTransition(clinicInfo, onComplete) {
        const overlay = document.getElementById('cinema-overlay');
        const canvas = document.getElementById('warp-starfield-canvas');
        const titleEl = document.getElementById('cinema-destination-title');
        const progressBar = document.getElementById('warp-progress-bar');

        if (!overlay || !canvas) {
            if (typeof onComplete === 'function') onComplete();
            return;
        }

        titleEl.textContent = `Docking at ${clinicInfo.clinicName}...`;
        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';
        overlay.classList.remove('hidden');

        // تشغيل شريط التقدم بسلاسة
        requestAnimationFrame(() => {
            progressBar.style.transition = 'width 1.75s cubic-bezier(0.22, 1, 0.36, 1)';
            progressBar.style.width = '100%';
        });

        // رسم خطوط النجوم السريعة (Hyperspace Warp Streaks)
        const ctx = canvas.getContext('2d');
        const w = (canvas.width = window.innerWidth);
        const h = (canvas.height = window.innerHeight);

        const streaks = Array.from({ length: 95 }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            len: 28 + Math.random() * 85,
            speed: 18 + Math.random() * 26,
            alpha: 0.3 + Math.random() * 0.7
        }));

        function renderWarp() {
            ctx.fillStyle = 'rgba(3, 6, 17, 0.42)';
            ctx.fillRect(0, 0, w, h);

            for (const s of streaks) {
                s.x -= s.speed;
                if (s.x + s.len < 0) {
                    s.x = w + 20;
                    s.y = Math.random() * h;
                }

                const grad = ctx.createLinearGradient(s.x, s.y, s.x + s.len, s.y);
                grad.addColorStop(0, `rgba(0, 240, 255, ${s.alpha})`);
                grad.addColorStop(1, 'rgba(56, 189, 248, 0)');

                ctx.strokeStyle = grad;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(s.x, s.y);
                ctx.lineTo(s.x + s.len, s.y);
                ctx.stroke();
            }

            animFrameId = requestAnimationFrame(renderWarp);
        }

        renderWarp();

        // مدة الانتقال 1.85 ثانية (سريعة ومبهرة بدون إطالة مملة)
        setTimeout(() => {
            if (animFrameId) cancelAnimationFrame(animFrameId);
            overlay.classList.add('hidden');
            if (typeof onComplete === 'function') onComplete();
        }, 1850);
    }

    return { playWarpTransition };
})();