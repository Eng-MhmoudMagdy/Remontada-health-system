document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();

    // =========================================================
    // 1. خلفية النجوم الهادئة
    // =========================================================
    const bgCanvas = document.getElementById('clinic-bg-stars');
    const bgCtx = bgCanvas.getContext('2d');
    let bw, bh, bgStars = [];

    function resizeBgStars() {
        bw = bgCanvas.width = window.innerWidth;
        bh = bgCanvas.height = window.innerHeight;
        bgStars = Array.from({ length: Math.floor((bw * bh) / 8000) }, () => ({
            x: Math.random() * bw,
            y: Math.random() * bh,
            r: Math.random() * 1.3 + 0.3,
            a: Math.random() * 0.6 + 0.2,
            d: (Math.random() * 0.006 + 0.002) * (Math.random() < 0.5 ? 1 : -1)
        }));
    }

    function animateBgStars() {
        bgCtx.clearRect(0, 0, bw, bh);
        for (const s of bgStars) {
            s.a += s.d;
            if (s.a <= 0.15 || s.a >= 0.85) s.d = -s.d;
            bgCtx.beginPath();
            bgCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            bgCtx.fillStyle = `rgba(226, 232, 240, ${s.a})`;
            bgCtx.fill();
        }
        requestAnimationFrame(animateBgStars);
    }

    window.addEventListener('resize', resizeBgStars);
    resizeBgStars();
    animateBgStars();

    // =========================================================
    // 2. إدارة مراحل العيادة (Body Map -> Cinema -> Survey -> Analyzing -> Report)
    // =========================================================
    const stageBodyMap = document.getElementById('stage-body-map');
    const stageSurvey = document.getElementById('stage-clinic-survey');
    const stageAnalyzing = document.getElementById('stage-analyzing');
    const stageAssessment = document.getElementById('stage-assessment');
    const topbarClinicLabel = document.getElementById('topbar-clinic-label');

    let selectedClinic = null;
    let currentQuestionIdx = 0;
    let userAnswers = [];

    function showStage(stageEl) {
        [stageBodyMap, stageSurvey, stageAnalyzing, stageAssessment].forEach(sec => {
            sec.classList.add('hidden');
        });
        stageEl.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // =========================================================
    // 3. بناء بطاقات الاختيار السريع وربطها بنقاط مجسم رائد الفضاء
    // =========================================================
    const partsListContainer = document.getElementById('parts-selector-list');
    const partKeys = ['head', 'eyes', 'ears', 'chest', 'stomach', 'muscles'];

    partsListContainer.innerHTML = partKeys.map(key => {
        const info = CLINIC_SPECIALTIES[key];
        return `
            <button type="button" class="part-choice-card" data-part="${info.id}">
                <div class="part-icon-circle">
                    <i data-lucide="${info.icon}"></i>
                </div>
                <div class="part-text-info">
                    <strong>${info.partLabel}</strong>
                    <span>${info.clinicName}</span>
                </div>
            </button>
        `;
    }).join('');

    if (window.lucide) lucide.createIcons();

    // تزامن التمرير والضغط بين مجسم رائد الفضاء والبطاقات الجانبية
    function highlightBodyPart(partId, isHovering) {
        document.querySelectorAll(`.body-hotspot[data-part="${partId}"]`)
            .forEach(el => el.classList.toggle('active', isHovering));
        document.querySelectorAll(`.part-choice-card[data-part="${partId}"]`)
            .forEach(el => el.classList.toggle('highlighted', isHovering));
    }

    function launchClinicForPart(partId) {
        const specialty = CLINIC_SPECIALTIES[partId];
        if (!specialty) return;

        selectedClinic = specialty;
        currentQuestionIdx = 0;
        userAnswers = new Array(specialty.questions.length).fill(null);

        topbarClinicLabel.textContent = specialty.clinicName.toUpperCase();

        // تشغيل الانتقال السينمائي بالمركبة الفضائية ثم فتح العيادة المتخصصة
        ClinicCinema.playWarpTransition(specialty, () => {
            openSpecializedClinic();
        });
    }

    document.querySelectorAll('.body-hotspot').forEach(hotspot => {
        const partId = hotspot.getAttribute('data-part');
        hotspot.addEventListener('mouseenter', () => highlightBodyPart(partId, true));
        hotspot.addEventListener('mouseleave', () => highlightBodyPart(partId, false));
        hotspot.addEventListener('click', () => launchClinicForPart(partId));
        hotspot.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                launchClinicForPart(partId);
            }
        });
    });

    document.querySelectorAll('.part-choice-card').forEach(card => {
        const partId = card.getAttribute('data-part');
        card.addEventListener('mouseenter', () => highlightBodyPart(partId, true));
        card.addEventListener('mouseleave', () => highlightBodyPart(partId, false));
        card.addEventListener('click', () => launchClinicForPart(partId));
    });

    // =========================================================
    // 4. تشغيل الاستبيان الطبي التفاعلي (سؤال واحد في كل مرة + إمكانية الرجوع)
    // =========================================================
    function openSpecializedClinic() {
        document.getElementById('clinic-name-heading').textContent = selectedClinic.clinicName;
        document.getElementById('selected-part-badge').textContent = selectedClinic.partLabel.toUpperCase();
        document.getElementById('doctor-intro-text').textContent = selectedClinic.doctorIntro;

        showStage(stageSurvey);
        renderCurrentQuestion();
    }

    function renderCurrentQuestion() {
        const totalQ = selectedClinic.questions.length;
        const qObj = selectedClinic.questions[currentQuestionIdx];

        document.getElementById('question-counter-text').textContent = `Question ${currentQuestionIdx + 1} of ${totalQ}`;
        document.getElementById('survey-progress-fill').style.width = `${((currentQuestionIdx + 1) / totalQ) * 100}%`;
        document.getElementById('question-prompt-text').textContent = qObj.prompt;

        // تحديث نص زر الرجوع (إما الرجوع للسؤال السابق أو العودة لمجسم رائد الفضاء)
        document.getElementById('survey-back-label').textContent =
            currentQuestionIdx === 0 ? 'Change Body Part' : 'Previous Question';

        const optionsContainer = document.getElementById('question-options-container');
        const previouslyPicked = userAnswers[currentQuestionIdx];

        optionsContainer.innerHTML = qObj.options.map((opt, idx) => {
            const isSelected = previouslyPicked && previouslyPicked.text === opt.text;
            return `
                <button type="button" class="survey-option-btn ${isSelected ? 'selected' : ''}" data-opt-idx="${idx}">
                    <span>${opt.text}</span>
                    <span class="option-bullet"></span>
                </button>
            `;
        }).join('');

        optionsContainer.querySelectorAll('.survey-option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const chosenIdx = Number(btn.getAttribute('data-opt-idx'));
                userAnswers[currentQuestionIdx] = qObj.options[chosenIdx];

                // تمييز الاختيار بصرياً ثم الانتقال بسلاسة للسؤال التالي
                optionsContainer.querySelectorAll('.survey-option-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');

                setTimeout(() => {
                    if (currentQuestionIdx < totalQ - 1) {
                        currentQuestionIdx++;
                        renderCurrentQuestion();
                    } else {
                        runBackgroundReview();
                    }
                }, 260);
            });
        });
    }

    document.getElementById('survey-back-btn').addEventListener('click', () => {
        if (currentQuestionIdx > 0) {
            currentQuestionIdx--;
            renderCurrentQuestion();
        } else {
            topbarClinicLabel.textContent = 'SELECT BODY REGION';
            showStage(stageBodyMap);
        }
    });

    // =========================================================
    // 5. مراجعة الطبيب الافتراضي في الخلفية وعرض التقرير المبسط (3 بطاقات)
    // =========================================================
    function runBackgroundReview() {
        document.getElementById('analyzing-doctor-text').textContent =
            `${selectedClinic.doctorName} is reviewing your responses...`;
        showStage(stageAnalyzing);

        setTimeout(() => {
            const assessment = selectedClinic.evaluate(userAnswers);
            renderFinalAssessment(assessment);
        }, 1650);
    }

    function renderFinalAssessment(result) {
        document.getElementById('report-clinic-eyebrow').textContent =
            `${selectedClinic.clinicName.toUpperCase()} • ${selectedClinic.partLabel.toUpperCase()}`;

        // A. What might be happening?
        document.getElementById('report-happening-text').textContent = result.happening;

        // B. What should you do?
        const actionsList = document.getElementById('report-actions-list');
        actionsList.innerHTML = result.actions.map(step => `<li>${step}</li>`).join('');

        // C. Should you be concerned?
        const concernCard = document.getElementById('report-concern-card');
        const concernIcon = document.getElementById('report-concern-icon');
        const concernBadge = document.getElementById('report-concern-badge');
        const concernText = document.getElementById('report-concern-text');

        concernCard.classList.remove('low-border', 'moderate-border', 'urgent-border');
        concernCard.classList.add(`${result.level}-border`);

        concernIcon.className = `report-card-icon ${result.level}`;
        const iconName = result.level === 'urgent'
            ? 'alert-octagon'
            : (result.level === 'moderate' ? 'alert-triangle' : 'shield-check');
        concernIcon.innerHTML = `<i data-lucide="${iconName}"></i>`;

        concernBadge.className = `concern-status-pill ${result.level}`;
        concernBadge.textContent = result.badge;
        concernText.textContent = result.concernText;

        showStage(stageAssessment);
        if (window.lucide) lucide.createIcons();
    }

    // زر فحص منطقة أخرى من جسم رائد الفضاء
    document.getElementById('check-another-part-btn').addEventListener('click', () => {
        topbarClinicLabel.textContent = 'SELECT BODY REGION';
        showStage(stageBodyMap);
    });
});