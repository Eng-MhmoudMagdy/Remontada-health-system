# 🚀 AstroHealth — Orbital Crew Wellness & Telemedicine Platform

**AstroHealth** is a futuristic, astronaut-centered health monitoring, telemedicine, and daily mission wellness web application. Designed specifically for low-cognitive-load readability in orbital environments, the platform combines real-time physiological telemetry, computer-vision rapid checks, specialized virtual clinics, psychological relaxation tools, and an interactive daily routine roadmap.

---

## 🎯 Core UX Philosophy (Astronaut-First Design)

- **Zero Visual Clutter:** Clean glassmorphic cards, high-contrast typography, and tabular numerals allow crew members to assess their health status in under 3 seconds.
- **Physiological Context:** Every biometric metric includes interactive explanations detailing *why* it matters in microgravity.
- **Calm & Reassuring Interface:** Deep-space dark backgrounds paired with bioluminescent cyan, sky blue, emerald, and soft lavender accents minimize eye strain during long orbital shifts.
- **Offline-Resilient & Stateful:** Uses `localStorage` for crew journal logs and daily task completion, alongside built-in simulation modes for testing without hardware sensors or cameras.

---
🧩 Platform Modules Overview1. Crew Vitals & Radiation Sensors (sensors/)5 Core Correlated Metrics: Tracks Heart Rate (BPM), Oxygen Rate (% SpO₂), Blood Pressure (mmHg), Blood Sugar (mg/dL), and Radiation Exposure (mSv/day).Interactive Info Tooltips (!): Hovering or focusing on the exclamation badge on any card explains the microgravity physiological significance of that metric.Physiological Correlation Simulator: Switch between Resting Orbit, Spacewalk (EVA), and Low Sugar to observe how all five metrics shift together dynamically.Unified Balance Map: A 5-axis Radar Chart (Chart.js) and top Bio-Harmony Ring visualize overall bodily equilibrium at a glance.2. Mental Health & Orbital Sanctuary (mental-health/)3 Distinct Relaxation Tools (exercise.html):Guided Breathing (4-4-6 Timed Rhythm): Expanding/contracting orbital orb to pace inhalation, hold, and exhalation.Starlight Drift Zen Game (No Timer): A pressure-free zero-G canvas game where astronauts guide a light orb to awaken floating star-lanterns with pentatonic Web Audio chimes.Earth & Cabin Ambient Soundscape: Procedural Web Audio API sound mixer blending Gentle Earth Rain, Warm Cabin Hum, and Deep Delta Calm Waves without external audio files.Personal Space Journal: Mood-tagged reflections stored locally via localStorage.Daily Notes from Earth & Circadian Sleep Overview: Rotating messages from family/Mission Control alongside a 7-day sleep duration bar chart.3. Virtual Medical Clinic (virtual-clinic/)Realistic 2D Astronaut Anatomy Map: Custom multi-layered SVG spacesuit (PLSS Backpack, Reflective Visor, DCM Chest Module) featuring 6 interactive hotspots (Head, Eyes, Ears, Chest, Stomach, Muscles).Cinematic Shuttle Warp Transition: Clicking a body region launches a brief hyperspace starfield animation (clinic-cinema.js) transporting the user to the matching specialty bay:Head → Neurology Clinic (Dr. Nova)Eyes → Ophthalmology Clinic (Dr. Iris)Ears → ENT Clinic (Dr. Echo)Chest → Cardiology Clinic (Dr. Pulse)Stomach → Gastroenterology Clinic (Dr. Sage)Muscles → Musculoskeletal Clinic (Dr. Atlas)Conversational Smart Survey & 3-Card Assessment: One question at a time with back-navigation, culminating in a clean 3-card summary (What might be happening?, What should you do?, and Should you be concerned?).4. Daily Mission Roadmap (roadmap/)Winding Asphalt Road Infographic: Animated SVG path (stroke-dashoffset trim-path unroll) with 5 alternating daily checkpoints (01 to 05).'Nastro' Astronaut Mascot: Smoothly traverses the exact cubic Bézier curve of the road, tilting along curves, bobbing while idle, and performing a celebratory jump upon reaching a checkpoint.Interactive Controls: Supports direct checkpoint clicks, Previous / Next Task buttons, hands-free Auto Tour, and persistent Mark Done / Reset Day tracking.5. Quick Crew Check (quick-check/)5-Step Rapid Camera Scan: Powered by MediaPipe Tasks Vision (FaceLandmarker & PoseLandmarker):Eye & Dark Circles Scan: Calculates real-time Eye Closure % and compares under-eye vs. cheek luminance to detect fatigue shadows.Raise Right Hand above shoulder level.Raise Left Hand above shoulder level.Raise Right Leg slightly.Raise Left Leg slightly.Fallback & Accessibility: Includes a manual Confirm Current Step button for seated close-range webcam setups and a Quick Demo Mode when no camera is attached.🎨 Visual Design System & Color PaletteToken / RoleHex / ValueUsageDeep Space Canvas#060A16Primary background & dark asphalt road coreGlass Panel Surfacergba(14, 22, 44, 0.84)Translucent cards with backdrop-filter: blur(18px)Bioluminescent Cyan#00F0FFActive telemetry highlights, ECG, & Nastro accentsOrbital Sky Blue#38BDF8Primary navigation buttons, visor glow, & oxygen metricsVital Emerald#10B981Nominal health badges, completed tasks, & limb trackingSolar Amber#F59E0BRadiation indicators, EVA exertion warnings, & checkpointsCalm Lavender#B8A9F8Mental health sanctuary, sleep charts, & blood pressureAlert Crimson / Pink#F43F5E / #F472B6Urgent medical alerts & checkpoint pin accents🛠️ Tech Stack & External LibrariesCore Frontend: HTML5, CSS3 (Grid, Flexbox, Custom Properties, Keyframe Animations), Vanilla JavaScript (ES6+ Modules)Graphics & Audio: Inline Vector SVG, HTML5 2D Canvas, Web Audio API (procedural synthesis)Icons: Lucide Icons (unpkg.com/lucide@latest)Data Visualization: Chart.js (cdn.jsdelivr.net/npm/chart.js)Computer Vision AI: MediaPipe Tasks Vision (@mediapipe/tasks-vision@0.10.14)💻 How to Run LocallyBecause the Quick Check module uses ES6 Modules (type="module") and browser Webcam APIs (navigator.mediaDevices.getUserMedia), run the project over a local HTTP server rather than opening index.html via file://:Option 1: Using Python (Recommended on Linux)Bashcd ~/remontada_project
python3 -m http.server 8080
Then open your browser and navigate to:Plaintexthttp://localhost:8080
Option 2: Using VS Code Live Server. Open the remontada_project folder in Visual Studio Code. Right-click index.html and select "Open with Live Server".⚠️ Medical & Simulation DisclaimerAstroHealth is an interactive aerospace UX prototype and educational simulation. Biometric readings, AI camera fatigue indicators, and virtual clinic assessments are simulated for demonstration purposes only and do not constitute real medical diagnosis or clinical advice.
## 📂 Project Directory Structure

```text
remontada_project/
├── index.html                      # Main Command Hub & Navigation Dashboard
├── dashboard.css                   # Global theme, glassmorphism, and hub layout
├── dashboard.js                    # Command hub animations & live status sync
│
├── sensors/                        # Module 1: Crew Vitals & Radiation Telemetry
│   ├── sensors.html                # 5-card biometric dashboard & balance map
│   ├── sensors.css                 # Responsive grid, tooltips, & progress bars
│   └── sensors.js                  # Physiological correlation engine & Radar chart
│
├── mental-health/                  # Module 2: Psychological Sanctuary & Relaxation
│   ├── mental.html                 # Main mental wellness hub, journal & sleep log
│   ├── exercise.html               # Interactive relaxation studio (3 modes)
│   ├── css/
│   │   ├── mental.css              # Sanctuary layout, journal, & sleep bar styles
│   │   └── exercise.css            # Breathing orb, Zen game canvas, & mixer UI
│   └── js/
│       ├── mental-data.js          # Relaxation tools, Earth notes, & sleep data
│       ├── mental-app.js           # Starfield, local journal persistence, & charts
│       └── exercise-app.js         # 4-4-6 timer, Starlight Drift game, & Web Audio synth
│
├── virtual-clinic/                 # Module 3: Interactive Astronaut Telemedicine
│   ├── clinic.html                 # 2D Spacesuit anatomy map, warp HUD, & clinic UI
│   ├── css/
│   │   ├── clinic-base.css         # Topbar, astronaut SVG stage, & hotspot styles
│   │   └── clinic-station.css      # Warp overlay, conversational survey, & report cards
│   └── js/
│       ├── clinic-data.js          # 6 specialized clinics, doctors, & triage logic
│       ├── clinic-cinema.js        # Hyperspace shuttle warp canvas animation
│       └── clinic-app.js           # Hotspot sync, step-by-step survey, & assessment
│
├── roadmap/                        # Module 4: Daily Crew Routine Infographic
│   ├── roadmap.html                # Winding road SVG & Nastro astronaut mascot
│   ├── css/
│   │   └── roadmap.css             # Road styling, alternating pins, & Nastro animations
│   └── js/
│       ├── roadmap-data.js         # 5 daily astronaut tasks (01 to 05)
│       └── roadmap-app.js          # SVG curve path traversal, slope tilt, & Auto Tour
│
├── quick-check/                    # Module 5: AI Camera Vision & Mobility Scan
│   ├── quick-check.html            # Live webcam HUD, 5-step checklist, & summary
│   ├── quick-check.css             # Camera reticle frame, progress bars, & report UI
│   └── quick-check.js              # MediaPipe Face & Pose AI + Demo Mode fallback
│
└── README.md                       # Project documentation

