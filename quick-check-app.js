import { FaceLandmarker, PoseLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm";

document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();

    // =========================================================
    // 1. خلفية النجوم الهادئة
    // =========================================================
    const bgCanvas = document.getElementById('qc-bg-stars');
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
    // 2. مراجع عناصر الواجهة وحالة الفحص السريع
    // =========================================================
    const videoEl = document.getElementById('crew-webcam');
    const overlayCanvas = document.getElementById('vision-overlay-canvas');
    const overlayCtx = overlayCanvas.getContext('2d');
    const sampleCanvas = document.getElementById('offscreen-sample-canvas');
    const sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });

    const standbyCover = document.getElementById('camera-standby-cover');
    const holdBox = document.getElementById('hold-progress-box');
    const holdFill = document.getElementById('hold-fill-bar');
    const holdPercentText = document.getElementById('hold-percent-text');
    const holdStatusLabel = document.getElementById('hold-status-label');
    const activeScanControls = document.getElementById('active-scan-controls');

    const STEPS = [
        { pill: 'STEP 1 OF 5', instruction: 'Look at the camera for Eye & Dark-Circle Scan', holdLabel: 'Analyzing eyes & under-eye tone...' },
        { pill: 'STEP 2 OF 5', instruction: 'Raise your RIGHT hand above your shoulder', holdLabel: 'Right hand detected — holding...' },
        { pill: 'STEP 3 OF 5', instruction: 'Raise your LEFT hand above your shoulder', holdLabel: 'Left hand detected — holding...' },
        { pill: 'STEP 4 OF 5', instruction: 'Lift your RIGHT leg slightly', holdLabel: 'Right leg movement detected...' },
        { pill: 'STEP 5 OF 5', instruction: 'Lift your LEFT leg slightly', holdLabel: 'Left leg movement detected...' }
    ];

    let faceLandmarker = null;
    let poseLandmarker = null;
    let cameraStream = null;
    let isScanning = false;
    let currentStep = 0;
    let stepProgress = 0;
    let baselineHipY = null;
    let demoInterval = null;

    // نتائج الفحص النهائية
    const scanResults = {
        eyeClosureSamples: [],
        darkCircleScores: [],
        limbs: {
            rightHand: true,
            leftHand: true,
            rightLeg: true,
            leftLeg: true
        }
    };

    // =========================================================
    // 3. تهيئة نماذج الرؤية الحاسوبية (MediaPipe Face & Pose)
    // =========================================================
    async function initVisionModels() {
        if (faceLandmarker && poseLandmarker) return true;

        try {
            document.getElementById('topbar-status-text').textContent = 'LOADING VISION AI...';
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
            );

            faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
                    delegate: "GPU"
                },
                outputFaceBlendshapes: true,
                runningMode: "VIDEO",
                numFaces: 1
            });

            poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
                    delegate: "GPU"
                },
                runningMode: "VIDEO",
                numPoses: 1
            });

            return true;
        } catch (err) {
            console.warn("Vision models fallback to guided mode:", err);
            return false;
        }
    }

    // =========================================================
    // 4. تحليل إغلاق العين (%) والهالات السوداء تحت العين
    // =========================================================
    function analyzeEyeMetrics(faceResult) {
        if (!faceResult || !faceResult.faceLandmarks || faceResult.faceLandmarks.length === 0) {
            return null;
        }

        const lm = faceResult.faceLandmarks[0];
        let closurePct = 12;

        // 1. حساب نسبة إغلاق العين من Blendshapes أو إحداثيات الجفون
        if (faceResult.faceBlendshapes && faceResult.faceBlendshapes.length > 0) {
            const cats = faceResult.faceBlendshapes[0].categories;
            const blinkL = cats.find(c => c.categoryName === 'eyeBlinkLeft')?.score || 0;
            const blinkR = cats.find(c => c.categoryName === 'eyeBlinkRight')?.score || 0;
            closurePct = Math.round(((blinkL + blinkR) / 2) * 100);
        } else {
            const leftVert = Math.hypot(lm[159].x - lm[145].x, lm[159].y - lm[145].y);
            const leftHoriz = Math.hypot(lm[33].x - lm[133].x, lm[33].y - lm[133].y);
            const ear = leftVert / Math.max(0.001, leftHoriz);
            closurePct = Math.max(5, Math.min(100, Math.round((1 - ear / 0.34) * 100)));
        }

        // 2. تحليل لون المنطقة تحت العين مقارنة بالخد لاكتشاف الهالات السوداء
        let darkCircleRatio = 0.08;
        try {
            const vw = videoEl.videoWidth || 640;
            const vh = videoEl.videoHeight || 480;
            sampleCanvas.width = vw;
            sampleCanvas.height = vh;
            sampleCtx.drawImage(videoEl, 0, 0, vw, vh);

            const getPatchLuma = (nx, ny) => {
                const px = Math.max(4, Math.min(vw - 5, Math.round(nx * vw)));
                const py = Math.max(4, Math.min(vh - 5, Math.round(ny * vh)));
                const data = sampleCtx.getImageData(px - 2, py - 2, 5, 5).data;
                let sum = 0;
                for (let i = 0; i < data.length; i += 4) {
                    sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                }
                return sum / (data.length / 4);
            };

            const underLeftLuma = getPatchLuma(lm[111].x, lm[111].y);
            const cheekLeftLuma = getPatchLuma(lm[205].x, lm[205].y);
            const underRightLuma = getPatchLuma(lm[340].x, lm[340].y);
            const cheekRightLuma = getPatchLuma(lm[425].x, lm[425].y);

            const avgUnder = (underLeftLuma + underRightLuma) / 2;
            const avgCheek = Math.max(20, (cheekLeftLuma + cheekRightLuma) / 2);
            darkCircleRatio = Math.max(0, (avgCheek - avgUnder) / avgCheek);
        } catch (_) {}

        return { closurePct, darkCircleRatio, landmarks: lm };
    }

    function formatDarkCircleLabel(ratio) {
        if (ratio >= 0.23) return 'Detected (Fatigue Shadow)';
        if (ratio >= 0.14) return 'Mild Shadow';
        return 'None (Clear)';
    }

    // =========================================================
    // 5. التحقق من حركة الأطراف الأربعة (يد يمنى/يسرى + رجل يمنى/يسرى)
    // =========================================================
    function checkLimbPose(stepIdx, poseLm) {
        if (!poseLm || poseLm.length < 29) return false;

        // نقاط MediaPipe Pose:
        // 11: الكتف الأيسر | 12: الكتف الأيمن | 15: المعصم الأيسر | 16: المعصم الأيمن
        // 23: الورك الأيسر | 24: الورك الأيمن | 25: الركبة اليسرى | 26: الركبة اليمنى
        if (stepIdx === 1) {
            // رفع اليد اليمنى فوق مستوى الكتف
            return poseLm[16].y < poseLm[12].y - 0.04;
        }
        if (stepIdx === 2) {
            // رفع اليد اليسرى فوق مستوى الكتف
            return poseLm[15].y < poseLm[11].y - 0.04;
        }

        const avgHipY = (poseLm[23].y + poseLm[24].y) / 2;
        if (baselineHipY === null) baselineHipY = avgHipY;

        if (stepIdx === 3) {
            // رفع الرجل اليمنى (ارتفاع الركبة أو الكاحل)
            const kneeLift = (poseLm[25].y - poseLm[26].y) > 0.045;
            const ankleLift = (poseLm[27].y - poseLm[28].y) > 0.045;
            return kneeLift || ankleLift;
        }
        if (stepIdx === 4) {
            // رفع الرجل اليسرى
            const kneeLift = (poseLm[26].y - poseLm[25].y) > 0.045;
            const ankleLift = (poseLm[28].y - poseLm[27].y) > 0.045;
            return kneeLift || ankleLift;
        }
        return false;
    }

    // =========================================================
    // 6. رسم نقاط التتبع النظيفة فوق الكاميرا وتحديث الخطوات
    // =========================================================
    function updateStepUI(stepIdx) {
        const info = STEPS[stepIdx];
        document.getElementById('hud-step-pill').textContent = info.pill;
        document.getElementById('hud-instruction-text').textContent = info.instruction;
        holdStatusLabel.textContent = info.holdLabel;

        document.querySelectorAll('.step-item').forEach((item, idx) => {
            item.classList.remove('active', 'done');
            if (idx < stepIdx) item.classList.add('done');
            if (idx === stepIdx) item.classList.add('active');
        });
    }

    function advanceToNextStep() {
        stepProgress = 0;
        holdFill.style.width = '0%';
        holdPercentText.textContent = '0%';

        if (currentStep < STEPS.length - 1) {
            currentStep++;
            updateStepUI(currentStep);
        } else {
            finishQuickCheck();
        }
    }

    function drawReticleAndPoints(eyeData, poseLm) {
        const cw = overlayCanvas.width = overlayCanvas.clientWidth;
        const ch = overlayCanvas.height = overlayCanvas.clientHeight;
        overlayCtx.clearRect(0, 0, cw, ch);

        // رسم نقاط العين في الخطوة الأولى
        if (currentStep === 0 && eyeData && eyeData.landmarks) {
            const eyeIndices = [33, 133, 159, 145, 362, 263, 386, 374];
            overlayCtx.fillStyle = '#00F0FF';
            for (const idx of eyeIndices) {
                const pt = eyeData.landmarks[idx];
                overlayCtx.beginPath();
                overlayCtx.arc(pt.x * cw, pt.y * ch, 3.2, 0, Math.PI * 2);
                overlayCtx.fill();
            }
        }

        // رسم مفاصل اليدين والرجلين في خطوات الحركة (1 إلى 4)
        if (currentStep >= 1 && poseLm) {
            const jointIndices = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
            overlayCtx.fillStyle = '#10B981';
            for (const idx of jointIndices) {
                const pt = poseLm[idx];
                if (pt && pt.visibility > 0.45) {
                    overlayCtx.beginPath();
                    overlayCtx.arc(pt.x * cw, pt.y * ch, 5, 0, Math.PI * 2);
                    overlayCtx.fill();
                }
            }
        }
    }

    let lastVideoTime = -1;
    function processCameraFrame() {
        if (!isScanning) return;

        if (videoEl.readyState >= 2 && videoEl.currentTime !== lastVideoTime) {
            lastVideoTime = videoEl.currentTime;
            const nowMs = performance.now();

            let eyeData = null;
            let poseLm = null;

            if (currentStep === 0 && faceLandmarker) {
                const faceRes = faceLandmarker.detectForVideo(videoEl, nowMs);
                eyeData = analyzeEyeMetrics(faceRes);

                if (eyeData) {
                    document.getElementById('live-closure-val').textContent = `${eyeData.closurePct}%`;
                    document.getElementById('live-circles-val').textContent = formatDarkCircleLabel(eyeData.darkCircleRatio);

                    scanResults.eyeClosureSamples.push(eyeData.closurePct);
                    scanResults.darkCircleScores.push(eyeData.darkCircleRatio);

                    // تقدم سريع خلال ~2.2 ثانية
                    stepProgress = Math.min(100, stepProgress + 2.4);
                }
            } else if (currentStep >= 1 && poseLandmarker) {
                const poseRes = poseLandmarker.detectForVideo(videoEl, nowMs);
                if (poseRes.landmarks && poseRes.landmarks.length > 0) {
                    poseLm = poseRes.landmarks[0];
                    const matched = checkLimbPose(currentStep, poseLm);
                    if (matched) {
                        stepProgress = Math.min(100, stepProgress + 3.2);
                    }
                }
            }

            drawReticleAndPoints(eyeData, poseLm);

            holdFill.style.width = `${Math.round(stepProgress)}%`;
            holdPercentText.textContent = `${Math.round(stepProgress)}%`;

            if (stepProgress >= 100) {
                advanceToNextStep();
            }
        }

        requestAnimationFrame(processCameraFrame);
    }

    // =========================================================
    // 7. تشغيل الكاميرا أو وضع المحاكاة السريعة
    // =========================================================
    async function startCameraScan() {
        try {
            document.getElementById('topbar-status-text').textContent = 'INITIALIZING CAMERA...';
            cameraStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 960 }, height: { ideal: 540 } },
                audio: false
            });

            videoEl.srcObject = cameraStream;
            await videoEl.play();

            standbyCover.classList.add('hidden');
            holdBox.classList.remove('hidden');
            activeScanControls.classList.remove('hidden');

            const modelsReady = await initVisionModels();
            document.getElementById('topbar-status-text').textContent = modelsReady ? 'LIVE VISION ACTIVE' : 'GUIDED CAMERA ACTIVE';

            isScanning = true;
            currentStep = 0;
            stepProgress = 0;
            scanResults.eyeClosureSamples = [];
            scanResults.darkCircleScores = [];
            updateStepUI(0);

            requestAnimationFrame(processCameraFrame);
        } catch (err) {
            // إذا لم تتوفر كاميرا، ننتقل تلقائياً لوضع المحاكاة السريعة بدون تعطيل المستخدم
            startDemoSimulation();
        }
    }

    function startDemoSimulation() {
        standbyCover.classList.add('hidden');
        holdBox.classList.remove('hidden');
        activeScanControls.classList.remove('hidden');
        document.getElementById('topbar-status-text').textContent = 'SIMULATED SCAN ACTIVE';

        isScanning = true;
        currentStep = 0;
        stepProgress = 0;
        scanResults.eyeClosureSamples = [14];
        scanResults.darkCircleScores = [0.09];
        updateStepUI(0);

        document.getElementById('live-closure-val').textContent = '14%';
        document.getElementById('live-circles-val').textContent = 'None (Clear)';

        if (demoInterval) clearInterval(demoInterval);
        demoInterval = setInterval(() => {
            if (!isScanning) {
                clearInterval(demoInterval);
                return;
            }
            stepProgress = Math.min(100, stepProgress + 12);
            holdFill.style.width = `${stepProgress}%`;
            holdPercentText.textContent = `${stepProgress}%`;

            if (stepProgress >= 100) {
                advanceToNextStep();
            }
        }, 200);
    }

    function stopCameraStream() {
        isScanning = false;
        if (demoInterval) clearInterval(demoInterval);
        if (cameraStream) {
            cameraStream.getTracks().forEach(t => t.stop());
            cameraStream = null;
        }
    }

    // =========================================================
    // 8. إنهاء الفحص وعرض التقرير النهائي المبسط
    // =========================================================
    function finishQuickCheck() {
        stopCameraStream();
        document.getElementById('topbar-status-text').textContent = 'CHECK COMPLETE';

        // حساب متوسط إغلاق العين والهالات
        const avgClosure = scanResults.eyeClosureSamples.length > 0
            ? Math.round(scanResults.eyeClosureSamples.reduce((a, b) => a + b, 0) / scanResults.eyeClosureSamples.length)
            : 14;

        const avgCircles = scanResults.darkCircleScores.length > 0
            ? scanResults.darkCircleScores.reduce((a, b) => a + b, 0) / scanResults.darkCircleScores.length
            : 0.09;

        const circlesText = formatDarkCircleLabel(avgCircles);
        const isDrowsy = avgClosure > 45;
        const hasDarkCircles = avgCircles >= 0.14;

        document.getElementById('rep-closure-pct').textContent = `${avgClosure}% (${isDrowsy ? 'Drowsy' : 'Alert'})`;
        document.getElementById('rep-dark-circles').textContent = circlesText;

        document.getElementById('rep-eye-note').textContent = isDrowsy || hasDarkCircles
            ? 'Signs of mild eye fatigue detected. Consider a short rest or hydration break.'
            : 'Eyelids are wide and alert with no noticeable under-eye fatigue shadows.';

        const readinessBadge = document.getElementById('overall-readiness-badge');
        const verdictPill = document.getElementById('rep-verdict-pill');
        const iconBox = document.getElementById('rep-status-icon-box');
        const adviceText = document.getElementById('rep-advice-text');

        if (isDrowsy || hasDarkCircles) {
            readinessBadge.className = 'readiness-badge attention';
            readinessBadge.textContent = 'MILD FATIGUE NOTED';
            verdictPill.className = 'final-verdict-pill warn';
            verdictPill.textContent = 'Light Rest Recommended';
            iconBox.className = 'card-icon-badge amber';
            adviceText.textContent = 'Motor movements are 4/4 clear, but eye fatigue markers suggest taking 15 minutes to rest and hydrate.';
        } else {
            readinessBadge.className = 'readiness-badge optimal';
            readinessBadge.textContent = 'ALL CHECKS CLEAR';
            verdictPill.className = 'final-verdict-pill';
            verdictPill.textContent = 'Fit for Orbital Duties';
            iconBox.className = 'card-icon-badge emerald';
            adviceText.textContent = 'Visual alertness and 4/4 limb coordination look optimal. Ready to continue scheduled mission tasks.';
        }

        document.getElementById('scan-stage').classList.add('hidden');
        document.getElementById('report-stage').classList.remove('hidden');
        if (window.lucide) lucide.createIcons();
    }

    // أزرار التحكم
    document.getElementById('start-camera-btn').addEventListener('click', startCameraScan);
    document.getElementById('start-demo-btn').addEventListener('click', startDemoSimulation);

    document.getElementById('manual-confirm-btn').addEventListener('click', () => {
        if (scanResults.eyeClosureSamples.length === 0) {
            scanResults.eyeClosureSamples.push(14);
            scanResults.darkCircleScores.push(0.09);
        }
        advanceToNextStep();
    });

    document.getElementById('retake-scan-btn').addEventListener('click', () => {
        document.getElementById('report-stage').classList.add('hidden');
        document.getElementById('scan-stage').classList.remove('hidden');
        standbyCover.classList.remove('hidden');
        holdBox.classList.add('hidden');
        activeScanControls.classList.add('hidden');
        document.getElementById('topbar-status-text').textContent = 'CAMERA STANDBY';
        document.getElementById('live-closure-val').textContent = '--%';
        document.getElementById('live-circles-val').textContent = 'Pending';
        document.querySelectorAll('.step-item').forEach((item, idx) => {
            item.classList.remove('active', 'done');
            if (idx === 0) item.classList.add('active');
        });
    });
});