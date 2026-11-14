document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();

    // =========================================================
    // 1. نموذج الترابط الفسيولوجي بين النسب الخمس (Physiological Correlation Model)
    // =========================================================
    const CREW_STATES = {
        resting: {
            harmony: 96,
            headline: 'Balanced Energy & Oxygen Flow',
            hr: 72,
            o2: 99,
            sys: 118,
            dia: 76,
            sugar: 95,
            radiation: 0.14
        },
        eva: {
            harmony: 84,
            headline: 'Active Spacewalk Exertion Link',
            hr: 112,
            o2: 96,
            sys: 132,
            dia: 84,
            sugar: 84,
            radiation: 0.36
        },
        lowSugar: {
            harmony: 79,
            headline: 'Low Glucose Compensation Detected',
            hr: 96,
            o2: 98,
            sys: 102,
            dia: 66,
            sugar: 68,
            radiation: 0.15
        }
    };

    let activeState = 'resting';

    // =========================================================
    // 2. رسم خريطة التوازن الخماسية (Unified Radar Balance Chart)
    // =========================================================
    const radarCtx = document.getElementById('vitalsRadarChart').getContext('2d');
    const radarChart = new Chart(radarCtx, {
        type: 'radar',
        data: {
            labels: ['Heart Rate', 'Oxygen Rate', 'Pressure', 'Sugar', 'Radiation Safety'],
            datasets: [
                {
                    label: 'Current Balance',
                    data: [95, 99, 94, 95, 94],
                    backgroundColor: 'rgba(56, 189, 248, 0.22)',
                    borderColor: '#38BDF8',
                    borderWidth: 2.2,
                    pointBackgroundColor: '#38BDF8',
                    pointRadius: 3.5
                },
                {
                    label: 'Ideal Safe Zone',
                    data: [92, 96, 92, 92, 92],
                    backgroundColor: 'rgba(52, 211, 153, 0.08)',
                    borderColor: 'rgba(52, 211, 153, 0.45)',
                    borderDash: [4, 4],
                    borderWidth: 1.5,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                r: {
                    min: 40,
                    max: 100,
                    ticks: { display: false },
                    grid: { color: 'rgba(255, 255, 255, 0.08)' },
                    angleLines: { color: 'rgba(255, 255, 255, 0.08)' },
                    pointLabels: {
                        color: '#CBD5E1',
                        font: { size: 11, weight: '600' }
                    }
                }
            }
        }
    });

    // =========================================================
    // 3. تحديث القراءات الخمس المترابطة بهدوء ووضوح
    // =========================================================
    function updateCorrelatedSensors() {
        const base = CREW_STATES[activeState];

        // تذبذب حيوي طبيعي خفيف جداً ومرتبط ببعضه
        const wave = Math.sin(Date.now() / 2400);
        const hr = Math.round(base.hr + wave * 2);
        const o2 = Math.min(100, Math.max(90, Math.round(base.o2 + (wave > 0.5 ? 0 : 0))));
        const sys = Math.round(base.sys + wave * 2);
        const dia = Math.round(base.dia + wave * 1);
        const sugar = Math.round(base.sugar - wave * 1.5);
        const radiation = +(base.radiation + Math.abs(wave) * 0.01).toFixed(2);

        // تحديث الأرقام الكبيرة في الكروت الخمسة
        document.getElementById('val-hr').textContent = hr;
        document.getElementById('val-o2').textContent = o2;
        document.getElementById('val-pressure').textContent = `${sys}/${dia}`;
        document.getElementById('val-sugar').textContent = sugar;
        document.getElementById('val-radiation').textContent = radiation;

        // تحديث أشرطة التقدم البصرية
        document.getElementById('bar-hr').style.width = `${Math.min(100, Math.max(20, ((hr - 45) / 100) * 100))}%`;
        document.getElementById('bar-o2').style.width = `${Math.min(100, Math.max(25, (o2 - 85) * 6.6))}%`;
        document.getElementById('bar-pressure').style.width = `${Math.min(100, Math.max(20, ((sys - 80) / 80) * 100))}%`;
        document.getElementById('bar-sugar').style.width = `${Math.min(100, Math.max(18, ((sugar - 50) / 100) * 100))}%`;
        document.getElementById('bar-radiation').style.width = `${Math.min(100, Math.max(12, (radiation / 0.6) * 100))}%`;

        // تحديث شارات الحالة البسيطة لكل كارد
        setTagState('card-hr', 'tag-hr', hr > 100 ? 'Elevated' : 'Optimal', hr > 100);
        setTagState('card-o2', 'tag-o2', o2 < 95 ? 'Moderate' : 'Optimal', o2 < 95);
        setTagState('card-pressure', 'tag-pressure', (sys > 128 || sys < 105) ? 'Shifted' : 'Optimal', (sys > 128 || sys < 105));
        setTagState('card-sugar', 'tag-sugar', sugar < 75 ? 'Low Fuel' : 'Optimal', sugar < 75);
        setTagState('card-radiation', 'tag-radiation', radiation > 0.25 ? 'EVA Exposure' : 'Safe Shielding', radiation > 0.25);

        // تحديث حلقة الترابط الموحدة في الأعلى
        const harmonyPct = base.harmony;
        const circumference = 213.6;
        const ringCircle = document.getElementById('harmony-ring-circle');
        ringCircle.style.strokeDashoffset = circumference - (harmonyPct / 100) * circumference;
        ringCircle.style.stroke = harmonyPct >= 90 ? '#34D399' : '#FBBF24';

        document.getElementById('harmony-percent').textContent = `${harmonyPct}%`;
        document.getElementById('harmony-headline').textContent = base.headline;
        document.getElementById('harmony-insight').textContent = base.insight;

        const globalPill = document.getElementById('global-pill');
        const globalText = document.getElementById('global-status-text');
        if (harmonyPct >= 90) {
            globalPill.classList.remove('warn');
            globalText.textContent = 'ALL 5 VITALS IN HARMONY';
        } else {
            globalPill.classList.add('warn');
            globalText.textContent = 'ACTIVE METABOLIC SHIFT';
        }

        // تحديث خريطة التوازن الخماسية (Radar Chart)
        const hrScore = Math.max(55, 100 - Math.abs(hr - 72) * 0.75);
        const o2Score = Math.max(60, o2);
        const bpScore = Math.max(58, 100 - Math.abs(sys - 118) * 1.1);
        const sugarScore = Math.max(55, 100 - Math.abs(sugar - 95) * 1.1);
        const radSafetyScore = Math.max(55, 100 - radiation * 85);

        radarChart.data.datasets[0].data = [hrScore, o2Score, bpScore, sugarScore, radSafetyScore];
        radarChart.update('none');
    }

    function setTagState(cardId, tagId, text, isWarn) {
        const card = document.getElementById(cardId);
        const tag = document.getElementById(tagId);
        card.classList.toggle('warn-border', isWarn);
        tag.className = `state-tag ${isWarn ? 'warn' : 'nominal'}`;
        tag.textContent = text;
    }

    // أزرار التبديل بين حالات رائد الفضاء
    document.querySelectorAll('.state-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.state-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeState = btn.getAttribute('data-state');
            updateCorrelatedSensors();
        });
    });

    updateCorrelatedSensors();
    setInterval(updateCorrelatedSensors, 1800);
});