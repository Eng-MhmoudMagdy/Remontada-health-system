document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();

    // =========================================================
    // 1. خلفية النجوم الهادئة
    // =========================================================
    const starsCanvas = document.getElementById('roadmap-stars-canvas');
    const starsCtx = starsCanvas.getContext('2d');
    let sw, sh, starField = [];

    function resizeStarField() {
        sw = starsCanvas.width = window.innerWidth;
        sh = starsCanvas.height = window.innerHeight;
        starField = Array.from({ length: Math.floor((sw * sh) / 8000) }, () => ({
            x: Math.random() * sw,
            y: Math.random() * sh,
            r: Math.random() * 1.3 + 0.3,
            a: Math.random() * 0.6 + 0.2,
            d: (Math.random() * 0.006 + 0.002) * (Math.random() < 0.5 ? 1 : -1)
        }));
    }

    function animateStarField() {
        starsCtx.clearRect(0, 0, sw, sh);
        for (const s of starField) {
            s.a += s.d;
            if (s.a <= 0.15 || s.a >= 0.85) s.d = -s.d;
            starsCtx.beginPath();
            starsCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            starsCtx.fillStyle = `rgba(226, 232, 240, ${s.a})`;
            starsCtx.fill();
        }
        requestAnimationFrame(animateStarField);
    }

    window.addEventListener('resize', resizeStarField);
    resizeStarField();
    animateStarField();

    // =========================================================
    // 2. استرجاع حالة المهام اليومية المحفوظة
    // =========================================================
    const STORAGE_KEY = 'astro_daily_tasks_state_v2';
    const savedState = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    DAILY_ROADMAP_TASKS.forEach(task => {
        if (savedState[task.num]) task.done = true;
    });

    // =========================================================
    // 3. تهيئة مسار الطريق SVG وتأثير فرد الطريق (Trim Path Unroll)
    // =========================================================
    const roadCore = document.getElementById('road-asphalt-core');
    const roadGlowBorder = document.getElementById('road-glow-border');
    const connectorsGroup = document.getElementById('svg-connectors-group');
    const checkpointsLayer = document.getElementById('checkpoints-layer');
    const roadViewport = document.getElementById('road-viewport');
    const roadStage = document.getElementById('road-stage');

    const totalPathLength = roadCore.getTotalLength();

    [roadGlowBorder, roadCore].forEach(pathEl => {
        pathEl.style.strokeDasharray = totalPathLength;
        pathEl.style.strokeDashoffset = totalPathLength;
        requestAnimationFrame(() => {
            pathEl.style.transition = 'stroke-dashoffset 1.25s cubic-bezier(0.22, 1, 0.36, 1)';
            pathEl.style.strokeDashoffset = '0';
        });
    });

    // حساب أقرب نقطة دقيقة على منحنى SVG لكل محطة
    function getExactPathLengthForPoint(tx, ty) {
        let bestLen = 0;
        let minDist = Infinity;
        for (let l = 0; l <= totalPathLength; l += 2) {
            const pt = roadCore.getPointAtLength(l);
            const dist = Math.hypot(pt.x - tx, pt.y - ty);
            if (dist < minDist) {
                minDist = dist;
                bestLen = l;
            }
        }
        return bestLen;
    }

    DAILY_ROADMAP_TASKS.forEach(task => {
        task.pathLen = getExactPathLengthForPoint(task.targetX, task.targetY);
        const exactPt = roadCore.getPointAtLength(task.pathLen);
        task.x = exactPt.x;
        task.y = exactPt.y;
    });

    // =========================================================
    // 4. رسم نقاط الطريق + الخطوط المنقطة + الدبابيس وبطاقات المهام اليومية
    // =========================================================
    let svgMarkup = '';
    let cardsMarkup = '';

    DAILY_ROADMAP_TASKS.forEach((task, idx) => {
        const isAbove = task.position === 'above';
        const pinY = isAbove ? task.y - 78 : task.y + 78;
        const lineEndY = isAbove ? pinY + 23 : pinY - 23;

        // النقطة الملونة على الطريق + الخط العمودي المنقط
        svgMarkup += `
            <line x1="${task.x}" y1="${task.y}" x2="${task.x}" y2="${lineEndY}"
                  stroke="${task.color}" stroke-width="2.4" stroke-dasharray="4 5" stroke-opacity="0.88"/>
            <circle cx="${task.x}" cy="${task.y}" r="11" fill="#060A16" stroke="${task.color}" stroke-width="3"/>
            <circle cx="${task.x}" cy="${task.y}" r="4.5" fill="${task.color}"/>
        `;

        // الدبوس التفاعلي وبطاقة المهمة اليومية بالنسب المئوية المتطابقة مع viewBox="0 0 1200 540"
        const leftPct = (task.x / 1200) * 100;
        const topPct = (pinY / 540) * 100;

        cardsMarkup += `
            <div class="checkpoint-node ${task.position} ${idx === 0 ? 'active' : ''}"
                 data-idx="${idx}"
                 style="left: ${leftPct}%; top: ${topPct}%; --pin-color: ${task.color}; --pin-glow: ${task.glow};">

                <div class="pin-circle" title="Move Nastro to Task ${task.num}">
                    <i data-lucide="${task.icon}"></i>
                </div>

                <div class="mission-card-box">
                    <div class="card-meta-top">
                        <span class="mission-num-tag">TASK ${task.num}</span>
                        <button type="button" class="task-done-btn ${task.done ? 'completed' : ''}" data-done-idx="${idx}">
                            ${task.done ? '✓ Done' : 'Mark Done'}
                        </button>
                    </div>
                    <h3>${task.title}</h3>
                    <p>${task.description}</p>
                </div>
            </div>
        `;
    });

    connectorsGroup.innerHTML = svgMarkup;
    checkpointsLayer.innerHTML = cardsMarkup;
    if (window.lucide) lucide.createIcons();

    function refreshCompletedBadge() {
        const count = DAILY_ROADMAP_TASKS.filter(t => t.done).length;
        document.getElementById('completed-summary-text').textContent =
            `${count} / ${DAILY_ROADMAP_TASKS.length} Daily Tasks Done`;
    }
    refreshCompletedBadge();

    // =========================================================
    // 5. تحريك شخصية 'Nastro' بسلاسة على منحنى الطريق
    // =========================================================
    const nastroMascot = document.getElementById('nastro-mascot');
    const nastroSprite = document.getElementById('nastro-sprite');
    let currentIdx = 0;
    let currentPathLen = DAILY_ROADMAP_TASKS[0].pathLen;
    let isAnimatingMove = false;
    let tourInterval = null;

    function positionNastroOnCurve(len, tiltDeg = 0) {
        const pt = roadCore.getPointAtLength(len);
        const leftPct = (pt.x / 1200) * 100;
        const topPct = (pt.y / 540) * 100;

        nastroMascot.style.left = `${leftPct}%`;
        nastroMascot.style.top = `${topPct}%`;
        nastroMascot.style.transform = `translate(-50%, -86%) rotate(${tiltDeg}deg)`;

        // متابعة أفقية لطيفة للكاميرا على الشاشات الصغيرة
        if (roadViewport.scrollWidth > roadViewport.clientWidth) {
            const targetScroll = (pt.x / 1200) * roadStage.clientWidth - roadViewport.clientWidth / 2;
            roadViewport.scrollLeft = Math.max(0, targetScroll);
        }
    }

    function updateMissionHUD(idx) {
        const task = DAILY_ROADMAP_TASKS[idx];
        document.getElementById('hud-step-badge').textContent = `TASK ${task.num} / 05`;
        document.getElementById('hud-time-badge').textContent = task.timeSlot;
        document.getElementById('hud-mission-title').textContent = task.title;
        document.getElementById('hud-mission-desc').textContent = task.description;

        document.getElementById('prev-mission-btn').disabled = idx === 0;
        document.getElementById('next-mission-btn').disabled = idx === DAILY_ROADMAP_TASKS.length - 1;

        document.querySelectorAll('.checkpoint-node').forEach((node, i) => {
            node.classList.toggle('active', i === idx);
        });
    }

    function triggerArrivalBounce(idx) {
        nastroSprite.classList.remove('arrival-hop');
        void nastroSprite.offsetWidth;
        nastroSprite.classList.add('arrival-hop');

        const node = document.querySelector(`.checkpoint-node[data-idx="${idx}"]`);
        if (node) {
            node.classList.remove('pop-arrival');
            void node.offsetWidth;
            node.classList.add('pop-arrival');
        }
    }

    function travelNastroTo(targetIdx) {
        if (targetIdx < 0 || targetIdx >= DAILY_ROADMAP_TASKS.length) return;
        if (targetIdx === currentIdx && !isAnimatingMove) {
            triggerArrivalBounce(targetIdx);
            return;
        }

        const startLen = currentPathLen;
        const endLen = DAILY_ROADMAP_TASKS[targetIdx].pathLen;
        const dist = Math.abs(endLen - startLen);
        const duration = Math.min(1300, Math.max(620, dist * 1.55));
        const startTime = performance.now();

        isAnimatingMove = true;
        currentIdx = targetIdx;
        updateMissionHUD(targetIdx);

        function animateFrame(now) {
            const elapsed = now - startTime;
            const t = Math.min(1, elapsed / duration);
            const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

            currentPathLen = startLen + (endLen - startLen) * ease;

            // حساب زاوية ميلان المنحنى لإمالة Nastro بشكل طبيعي أثناء الحركة
            const pA = roadCore.getPointAtLength(Math.max(0, currentPathLen - 3));
            const pB = roadCore.getPointAtLength(Math.min(totalPathLength, currentPathLen + 3));
            let slopeDeg = Math.atan2(pB.y - pA.y, pB.x - pA.x) * (180 / Math.PI);
            slopeDeg = Math.max(-15, Math.min(15, slopeDeg * 0.55));

            positionNastroOnCurve(currentPathLen, t < 1 ? slopeDeg : 0);

            if (t < 1) {
                requestAnimationFrame(animateFrame);
            } else {
                isAnimatingMove = false;
                currentPathLen = endLen;
                positionNastroOnCurve(endLen, 0);
                triggerArrivalBounce(targetIdx);
            }
        }

        requestAnimationFrame(animateFrame);
    }

    // التموضع الابتدائي عند المحطة 01
    positionNastroOnCurve(currentPathLen, 0);
    updateMissionHUD(0);

    // =========================================================
    // 6. أزرار التنقل، الجولة التلقائية، وإتمام المهام اليومية
    // =========================================================
    function stopAutoTour() {
        if (tourInterval) {
            clearInterval(tourInterval);
            tourInterval = null;
        }
        const btn = document.getElementById('auto-tour-btn');
        btn.classList.remove('active');
        document.getElementById('auto-tour-label').textContent = 'Auto Tour';
    }

    document.getElementById('prev-mission-btn').addEventListener('click', () => {
        stopAutoTour();
        if (currentIdx > 0) travelNastroTo(currentIdx - 1);
    });

    document.getElementById('next-mission-btn').addEventListener('click', () => {
        stopAutoTour();
        if (currentIdx < DAILY_ROADMAP_TASKS.length - 1) travelNastroTo(currentIdx + 1);
    });

    document.getElementById('auto-tour-btn').addEventListener('click', () => {
        if (tourInterval) {
            stopAutoTour();
            return;
        }

        const btn = document.getElementById('auto-tour-btn');
        btn.classList.add('active');
        document.getElementById('auto-tour-label').textContent = 'Stop Tour';

        if (currentIdx >= DAILY_ROADMAP_TASKS.length - 1) {
            travelNastroTo(0);
        } else {
            travelNastroTo(currentIdx + 1);
        }

        tourInterval = setInterval(() => {
            if (currentIdx < DAILY_ROADMAP_TASKS.length - 1) {
                travelNastroTo(currentIdx + 1);
            } else {
                stopAutoTour();
            }
        }, 2200);
    });

    // النقر على المحطات أو زر Mark Done
    checkpointsLayer.addEventListener('click', (e) => {
        const doneBtn = e.target.closest('.task-done-btn');
        if (doneBtn) {
            e.stopPropagation();
            const idx = Number(doneBtn.getAttribute('data-done-idx'));
            DAILY_ROADMAP_TASKS[idx].done = !DAILY_ROADMAP_TASKS[idx].done;

            doneBtn.classList.toggle('completed', DAILY_ROADMAP_TASKS[idx].done);
            doneBtn.textContent = DAILY_ROADMAP_TASKS[idx].done ? '✓ Done' : 'Mark Done';

            const persist = {};
            DAILY_ROADMAP_TASKS.forEach(t => { if (t.done) persist[t.num] = true; });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(persist));
            refreshCompletedBadge();
            return;
        }

        const node = e.target.closest('.checkpoint-node');
        if (node) {
            stopAutoTour();
            const idx = Number(node.getAttribute('data-idx'));
            travelNastroTo(idx);
        }
    });

    // زر إعادة ضبط مهام اليوم (Reset Day)
    document.getElementById('reset-day-btn').addEventListener('click', () => {
        stopAutoTour();
        DAILY_ROADMAP_TASKS.forEach(t => { t.done = false; });
        localStorage.removeItem(STORAGE_KEY);

        document.querySelectorAll('.task-done-btn').forEach(btn => {
            btn.classList.remove('completed');
            btn.textContent = 'Mark Done';
        });

        refreshCompletedBadge();
        travelNastroTo(0);
    });
});