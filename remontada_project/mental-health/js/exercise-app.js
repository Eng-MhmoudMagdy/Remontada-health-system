document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();

    // قراءة نوع التمرين المختار من الرابط (?type=breathing)
    const params = new URLSearchParams(window.location.search);
    const exerciseKey = params.get('type') || 'breathing';
    const exercise = RELAXATION_EXERCISES[exerciseKey] || RELAXATION_EXERCISES.breathing;

    // تعبئة بيانات التمرين في الواجهة
    document.getElementById('exercise-category-badge').textContent = exercise.category;
    document.getElementById('exercise-duration-label').textContent = exercise.durationLabel;
    document.getElementById('exercise-title').textContent = exercise.title;
    document.getElementById('exercise-description').textContent = exercise.fullDesc;

    const stepsListEl = document.getElementById('exercise-steps-list');
    stepsListEl.innerHTML = exercise.steps
        .map((step, i) => `<li id="step-item-${i}">${step}</li>`)
        .join('');

    // عناصر المؤقت والتحكم
    const totalSeconds = exercise.durationSeconds;
    let remainingSeconds = totalSeconds;
    let timerInterval = null;
    let breathingInterval = null;
    let isRunning = false;

    const timerDisplay = document.getElementById('timer-display');
    const orbWrapper = document.getElementById('breathing-orb-wrapper');
    const orbCue = document.getElementById('orb-cue');
    const progressFill = document.getElementById('progress-fill');
    const progressPercent = document.getElementById('progress-percent');
    const statusText = document.getElementById('session-status-text');

    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resumeBtn = document.getElementById('resume-btn');
    const finishBtn = document.getElementById('finish-btn');
    const controlsBar = document.getElementById('controls-bar');
    const completionCard = document.getElementById('completion-card');

    function formatTime(sec) {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function updateProgressUI() {
        timerDisplay.textContent = formatTime(remainingSeconds);
        const elapsed = totalSeconds - remainingSeconds;
        const pct = Math.min(100, Math.round((elapsed / totalSeconds) * 100));
        progressFill.style.width = `${pct}%`;
        progressPercent.textContent = `${pct}%`;

        // تمييز الخطوة الحالية تلقائياً حسب التقدم
        const stepCount = exercise.steps.length;
        const activeIdx = Math.min(stepCount - 1, Math.floor((elapsed / totalSeconds) * stepCount));
        for (let i = 0; i < stepCount; i++) {
            const li = document.getElementById(`step-item-${i}`);
            if (li) li.classList.toggle('active-step', i === activeIdx && isRunning);
        }
    }

    // دورة التنفس البصري (4 ثوانٍ شهيق -> 4 ثوانٍ حبس -> 6 ثوانٍ زفير)
    function startOrbGuidance() {
        let cycleSec = 0;

        function runBreathPhase() {
            if (!isRunning) return;
            const mod = cycleSec % 14;

            if (exercise.isBreathingMode) {
                if (mod < 4) {
                    orbWrapper.className = 'breathing-orb-wrapper inhale';
                    orbCue.textContent = 'INHALE';
                } else if (mod < 8) {
                    orbWrapper.className = 'breathing-orb-wrapper hold';
                    orbCue.textContent = 'HOLD';
                } else {
                    orbWrapper.className = 'breathing-orb-wrapper exhale';
                    orbCue.textContent = 'EXHALE';
                }
            } else {
                // نبض هادئ للتمارين الذهنية والعضلية
                if (mod < 7) {
                    orbWrapper.className = 'breathing-orb-wrapper inhale';
                    orbCue.textContent = 'FOCUS';
                } else {
                    orbWrapper.className = 'breathing-orb-wrapper exhale';
                    orbCue.textContent = 'RELEASE';
                }
            }
            cycleSec++;
        }

        runBreathPhase();
        breathingInterval = setInterval(runBreathPhase, 1000);
    }

    function stopIntervals() {
        clearInterval(timerInterval);
        clearInterval(breathingInterval);
        orbWrapper.className = 'breathing-orb-wrapper';
    }

    function startSession() {
        if (isRunning) return;
        isRunning = true;

        startBtn.classList.add('hidden');
        resumeBtn.classList.add('hidden');
        pauseBtn.classList.remove('hidden');
        finishBtn.classList.remove('hidden');
        statusText.textContent = 'Session in progress — take your time...';

        startOrbGuidance();
        updateProgressUI();

        timerInterval = setInterval(() => {
            remainingSeconds--;
            updateProgressUI();

            if (remainingSeconds <= 0) {
                completeSession();
            }
        }, 1000);
    }

    function pauseSession() {
        isRunning = false;
        stopIntervals();
        orbCue.textContent = 'PAUSED';
        statusText.textContent = 'Session paused';

        pauseBtn.classList.add('hidden');
        resumeBtn.classList.remove('hidden');
    }

    function completeSession() {
        isRunning = false;
        stopIntervals();
        remainingSeconds = 0;
        progressFill.style.width = '100%';
        progressPercent.textContent = '100%';
        timerDisplay.textContent = '00:00';
        orbCue.textContent = 'PEACE';

        controlsBar.classList.add('hidden');
        completionCard.classList.remove('hidden');
        statusText.textContent = 'Completed';
    }

    function resetSession() {
        isRunning = false;
        stopIntervals();
        remainingSeconds = totalSeconds;
        orbCue.textContent = 'READY';
        statusText.textContent = 'Press Start when you are comfortable';
        updateProgressUI();

        completionCard.classList.add('hidden');
        controlsBar.classList.remove('hidden');
        startBtn.classList.remove('hidden');
        pauseBtn.classList.add('hidden');
        resumeBtn.classList.add('hidden');
        finishBtn.classList.add('hidden');
    }

    // ربط أزرار التحكم
    startBtn.addEventListener('click', startSession);
    pauseBtn.addEventListener('click', pauseSession);
    resumeBtn.addEventListener('click', startSession);
    finishBtn.addEventListener('click', completeSession);
    document.getElementById('restart-session-btn').addEventListener('click', resetSession);

    document.getElementById('back-to-mental').addEventListener('click', () => {
        window.location.href = 'mental.html';
    });

    document.getElementById('done-return-btn').addEventListener('click', () => {
        window.location.href = 'mental.html';
    });

    // تهيئة العرض الأولي
    updateProgressUI();
});