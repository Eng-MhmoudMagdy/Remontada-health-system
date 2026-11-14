document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();

    // =========================================================
    // 1. خلفية النجوم الهادئة (Calm Starfield)
    // =========================================================
    const starCanvas = document.getElementById('calm-stars-canvas');
    const starCtx = starCanvas.getContext('2d');
    let sw, sh, stars = [];

    function resizeStars() {
        sw = starCanvas.width = window.innerWidth;
        sh = starCanvas.height = window.innerHeight;
        stars = Array.from({ length: Math.floor((sw * sh) / 7500) }, () => ({
            x: Math.random() * sw,
            y: Math.random() * sh,
            r: Math.random() * 1.4 + 0.3,
            a: Math.random() * 0.7 + 0.2,
            d: (Math.random() * 0.008 + 0.002) * (Math.random() < 0.5 ? 1 : -1)
        }));
    }

    function animateStars() {
        starCtx.clearRect(0, 0, sw, sh);
        for (const s of stars) {
            s.a += s.d;
            if (s.a <= 0.15 || s.a >= 0.9) s.d = -s.d;
            starCtx.beginPath();
            starCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            starCtx.fillStyle = `rgba(241, 245, 249, ${s.a})`;
            starCtx.fill();
        }
        requestAnimationFrame(animateStars);
    }

    window.addEventListener('resize', resizeStars);
    resizeStars();
    animateStars();

    // =========================================================
    // 2. الرسالة اليومية من الأرض (Random Non-Consecutive Happy Message)
    // =========================================================
    const LAST_MSG_KEY = 'astro_last_earth_msg_idx';
    const messageEl = document.getElementById('happy-message-text');

    function displayRandomEarthMessage() {
        const lastIdx = parseInt(localStorage.getItem(LAST_MSG_KEY), 10);
        let newIdx = Math.floor(Math.random() * EARTH_HAPPY_MESSAGES.length);

        // تجنب تكرار نفس الرسالة مرتين متتاليتين
        if (EARTH_HAPPY_MESSAGES.length > 1 && newIdx === lastIdx) {
            newIdx = (newIdx + 1) % EARTH_HAPPY_MESSAGES.length;
        }

        localStorage.setItem(LAST_MSG_KEY, newIdx.toString());
        messageEl.style.opacity = '0';
        setTimeout(() => {
            messageEl.textContent = `"${EARTH_HAPPY_MESSAGES[newIdx]}"`;
            messageEl.style.opacity = '1';
        }, 160);
    }

    displayRandomEarthMessage();
    document.getElementById('refresh-message-btn').addEventListener('click', displayRandomEarthMessage);

    // =========================================================
    // 3. المفكرة الشخصية (Personal Journal with Edit, Delete & Persistence)
    // =========================================================
    const JOURNAL_STORAGE_KEY = 'astro_mental_journal_entries';
    const titleInput = document.getElementById('journal-title-input');
    const bodyInput = document.getElementById('journal-body-input');
    const saveBtn = document.getElementById('save-journal-btn');
    const saveBtnLabel = document.getElementById('save-btn-label');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const entriesListEl = document.getElementById('journal-entries-list');
    const entriesCountEl = document.getElementById('entries-count');

    let editingEntryId = null;

    function loadJournalEntries() {
        try {
            const raw = localStorage.getItem(JOURNAL_STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    function saveJournalEntries(entries) {
        localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(entries));
    }

    function renderJournalEntries() {
        const entries = loadJournalEntries();
        entriesCountEl.textContent = `${entries.length} ${entries.length === 1 ? 'Entry' : 'Entries'}`;

        if (entries.length === 0) {
            entriesListEl.innerHTML = `
                <div class="empty-journal-box">
                    Your personal notebook is quiet right now. Write down a thought, a reflection from orbit, or how you're feeling today.
                </div>
            `;
            return;
        }

        entriesListEl.innerHTML = entries.map(entry => `
            <article class="entry-item" data-id="${entry.id}">
                <div class="entry-top">
                    <span class="entry-date">${entry.date}</span>
                    <div class="entry-actions">
                        <button class="icon-action-btn edit" title="Edit Entry" data-id="${entry.id}">
                            <i data-lucide="edit-3"></i>
                        </button>
                        <button class="icon-action-btn delete" title="Delete Entry" data-id="${entry.id}">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </div>
                ${entry.title ? `<h4>${escapeHTML(entry.title)}</h4>` : ''}
                <p>${escapeHTML(entry.content)}</p>
            </article>
        `).join('');

        if (window.lucide) lucide.createIcons();

        // أحداث التعديل والحذف
        entriesListEl.querySelectorAll('.icon-action-btn.edit').forEach(btn => {
            btn.addEventListener('click', () => startEditEntry(btn.getAttribute('data-id')));
        });

        entriesListEl.querySelectorAll('.icon-action-btn.delete').forEach(btn => {
            btn.addEventListener('click', () => deleteEntry(btn.getAttribute('data-id')));
        });
    }

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    saveBtn.addEventListener('click', () => {
        const content = bodyInput.value.trim();
        const title = titleInput.value.trim();

        if (!content) {
            bodyInput.focus();
            return;
        }

        const entries = loadJournalEntries();

        if (editingEntryId) {
            const index = entries.findIndex(e => e.id === editingEntryId);
            if (index !== -1) {
                entries[index].title = title;
                entries[index].content = content;
                entries[index].date = `${entries[index].date.split(' • ')[0]} • Edited`;
            }
            resetEditorState();
        } else {
            const now = new Date();
            const formattedDate = now.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }) + ' • ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

            entries.unshift({
                id: Date.now().toString(),
                title,
                content,
                date: formattedDate
            });
            titleInput.value = '';
            bodyInput.value = '';
        }

        saveJournalEntries(entries);
        renderJournalEntries();
    });

    function startEditEntry(id) {
        const entries = loadJournalEntries();
        const target = entries.find(e => e.id === id);
        if (!target) return;

        editingEntryId = id;
        titleInput.value = target.title || '';
        bodyInput.value = target.content;
        saveBtnLabel.textContent = 'Update Entry';
        cancelEditBtn.classList.remove('hidden');
        bodyInput.focus();
    }

    function resetEditorState() {
        editingEntryId = null;
        titleInput.value = '';
        bodyInput.value = '';
        saveBtnLabel.textContent = 'Save Entry';
        cancelEditBtn.classList.add('hidden');
    }

    cancelEditBtn.addEventListener('click', resetEditorState);

    function deleteEntry(id) {
        const updated = loadJournalEntries().filter(e => e.id !== id);
        if (editingEntryId === id) resetEditorState();
        saveJournalEntries(updated);
        renderJournalEntries();
    }

    renderJournalEntries();

    // =========================================================
    // 4. مراقبة النوم (Sleep Monitoring with Missing Data Distinction)
    // =========================================================
    const SLEEP_STORAGE_KEY = 'astro_sleep_weekly_data';
    const DAYS_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // بيانات افتراضية تحتوي على أيام مسجلة ويوم واحد مفقود (null) لتوضيح الفرق بصرياً
    const DEFAULT_SLEEP_HOURS = [7.5, 6.8, 7.2, null, 8.0, 7.4, 6.9];

    function loadSleepData() {
        try {
            const raw = localStorage.getItem(SLEEP_STORAGE_KEY);
            return raw ? JSON.parse(raw) : [...DEFAULT_SLEEP_HOURS];
        } catch {
            return [...DEFAULT_SLEEP_HOURS];
        }
    }

    function saveSleepData(arr) {
        localStorage.setItem(SLEEP_STORAGE_KEY, JSON.stringify(arr));
    }

    let sleepData = loadSleepData();
    let sleepChartInstance = null;
    let currentSleepView = 'weekly'; // 'weekly' | 'daily'

    const avgSleepEl = document.getElementById('avg-sleep-value');
    const sleepChartBox = document.getElementById('sleep-chart-box');
    const sleepEmptyState = document.getElementById('sleep-empty-state');

    function updateSleepVisualization() {
        const recordedValues = sleepData.filter(v => v !== null && !isNaN(v));

        // حساب المتوسط من البيانات الفعلية المسجلة فقط
        if (recordedValues.length === 0) {
            avgSleepEl.textContent = '-- hrs';
            sleepChartBox.classList.add('hidden');
            sleepEmptyState.classList.remove('hidden');
            return;
        }

        sleepChartBox.classList.remove('hidden');
        sleepEmptyState.classList.add('hidden');

        const sum = recordedValues.reduce((acc, val) => acc + val, 0);
        const avg = (sum / recordedValues.length).toFixed(1);
        avgSleepEl.textContent = `${avg} hrs`;

        // تمييز البيانات المسجلة عن البيانات المفقودة (Missing Data Placeholder)
        const recordedDataset = sleepData.map(val => (val !== null ? val : 0));
        const missingDataset = sleepData.map(val => (val === null ? 8 : 0)); // شريط متقطع خفيف لليوم المفقود

        const chartType = currentSleepView === 'weekly' ? 'bar' : 'line';

        if (sleepChartInstance) {
            sleepChartInstance.destroy();
        }

        const ctx = document.getElementById('sleepChart').getContext('2d');
        sleepChartInstance = new Chart(ctx, {
            type: chartType,
            data: {
                labels: DAYS_LABELS,
                datasets: [
                    {
                        label: 'Recorded Sleep (hrs)',
                        data: recordedDataset,
                        backgroundColor: 'rgba(184, 169, 248, 0.72)',
                        borderColor: '#B8A9F8',
                        borderWidth: 2,
                        borderRadius: 8,
                        tension: 0.35,
                        fill: currentSleepView === 'daily'
                    },
                    {
                        label: 'Missing Data',
                        data: missingDataset,
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        borderColor: 'rgba(165, 180, 207, 0.45)',
                        borderWidth: 1.5,
                        borderDash: [5, 5],
                        borderRadius: 8,
                        hidden: currentSleepView === 'daily'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const idx = context.dataIndex;
                                if (sleepData[idx] === null) {
                                    return 'Status: Missing / No Sleep Data Recorded';
                                }
                                return `Sleep Duration: ${sleepData[idx]} hours`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        grid: { display: false },
                        ticks: { color: '#A5B4CF' }
                    },
                    y: {
                        stacked: false,
                        min: 0,
                        max: 11,
                        grid: { color: 'rgba(255, 255, 255, 0.06)' },
                        ticks: {
                            color: '#A5B4CF',
                            callback: (val) => `${val}h`
                        }
                    }
                }
            }
        });
    }

    updateSleepVisualization();

    // التبديل بين Weekly Overview و Daily Breakdown
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSleepView = btn.getAttribute('data-view');
            updateSleepVisualization();
        });
    });

    // تحديث أو مسح ساعات النوم ليوم محدد
    document.getElementById('log-sleep-btn').addEventListener('click', () => {
        const dayIdx = parseInt(document.getElementById('sleep-day-select').value, 10);
        const hrsVal = parseFloat(document.getElementById('sleep-hours-input').value);
        if (isNaN(hrsVal) || hrsVal < 0 || hrsVal > 16) return;

        sleepData[dayIdx] = hrsVal;
        saveSleepData(sleepData);
        document.getElementById('sleep-hours-input').value = '';
        updateSleepVisualization();
    });

    document.getElementById('mark-missing-btn').addEventListener('click', () => {
        const dayIdx = parseInt(document.getElementById('sleep-day-select').value, 10);
        sleepData[dayIdx] = null;
        saveSleepData(sleepData);
        updateSleepVisualization();
    });

    // =========================================================
    // 5. كروت تمارين الاسترخاء (Relaxation Exercises Cards)
    // =========================================================
    const exercisesGrid = document.getElementById('exercises-grid');

    Object.values(RELAXATION_EXERCISES).forEach(ex => {
        const card = document.createElement('div');
        card.className = 'exercise-card';
        card.innerHTML = `
            <div>
                <div class="ex-card-top">
                    <div class="ex-icon-box">
                        <i data-lucide="${ex.icon}"></i>
                    </div>
                    <span class="ex-duration">${ex.durationLabel}</span>
                </div>
                <h3 style="margin-top: 14px;">${ex.title}</h3>
                <p>${ex.shortDesc}</p>
            </div>
            <div class="ex-start-link">
                <span>Begin Exercise</span>
                <i data-lucide="arrow-right"></i>
            </div>
        `;

        // الانتقال إلى الصفحة المخصصة للتمرين المختار
        card.addEventListener('click', () => {
            window.location.href = `exercise.html?type=${ex.id}`;
        });

        exercisesGrid.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();

    // زر العودة إلى لوحة التحكم الرئيسية
    document.getElementById('back-to-cabin').addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });
});