const CLINIC_SPECIALTIES = {
    head: {
        id: 'head',
        partLabel: 'Head',
        clinicName: 'Neurology Clinic',
        doctorName: 'Dr. Remontada',
        icon: 'brain',
        doctorIntro: "Hello Commander, I'm Dr. Nova in the Neurology Bay. I'll ask you 4 quick questions to understand your head symptoms.",
        questions: [
            {
                prompt: 'What kind of head discomfort are you noticing right now?',
                options: [
                    { text: 'Mild dull pressure or heaviness', score: 1, tag: 'pressure' },
                    { text: 'Throbbing headache or sensitivity to light', score: 2, tag: 'migraine' },
                    { text: 'Sudden severe pain, confusion, or dizziness', score: 4, tag: 'urgent' }
                ]
            },
            {
                prompt: 'How long has this feeling been present?',
                options: [
                    { text: 'Just started within the last hour', score: 1 },
                    { text: 'Several hours today', score: 2 },
                    { text: 'More than 24 hours or worsening quickly', score: 3 }
                ]
            },
            {
                prompt: 'How strong is the discomfort on a simple scale?',
                options: [
                    { text: 'Mild — I can focus on tasks easily', score: 1 },
                    { text: 'Moderate — making concentration harder', score: 2 },
                    { text: 'Severe — hard to continue normal duties', score: 4, tag: 'urgent' }
                ]
            },
            {
                prompt: 'Have you noticed any related triggers recently?',
                options: [
                    { text: 'Low water intake or skipped meal', score: 1 },
                    { text: 'Long screen session or poor sleep cycle', score: 1 },
                    { text: 'Recent bump/impact or vision changes', score: 4, tag: 'urgent' }
                ]
            }
        ],
        evaluate(answers) {
            const total = answers.reduce((s, a) => s + a.score, 0);
            const hasUrgent = answers.some(a => a.tag === 'urgent');

            if (hasUrgent || total >= 11) {
                return {
                    level: 'urgent',
                    badge: 'Urgent medical attention',
                    happening: 'Your responses point to intense neurological or pressure-related symptoms that require immediate human medical evaluation.',
                    actions: [
                        'Pause active tasks and rest quietly in a seated or supported position.',
                        'Contact the Flight Surgeon or Mission Medical Officer immediately.',
                        'Check your Oxygen and Pressure readings on the Sensors Dashboard.'
                    ],
                    concernText: 'Please seek immediate help from a qualified medical professional right away.'
                };
            }
            if (total >= 7) {
                return {
                    level: 'moderate',
                    badge: 'Needs medical attention',
                    happening: 'Persistent head tension or space-adaptation fluid shift may be affecting your comfort and focus.',
                    actions: [
                        'Dim bright cabin displays and rest your eyes for 15 minutes.',
                        'Review your hydration, blood sugar, and cabin CO₂ levels on the Sensors Dashboard.',
                        'Schedule a live check-in with the Flight Surgeon if symptoms continue.'
                    ],
                    concernText: 'Moderate symptoms warrant a direct review by a qualified medical professional.'
                };
            }
            return {
                level: 'low',
                badge: 'Low concern',
                happening: 'Mild head heaviness or brief tension is common in microgravity due to normal upper-body fluid shift.',
                actions: [
                    'Drink water slowly and take a short break away from telemetry screens.',
                    'Verify your Oxygen Rate and Sugar levels on the Sensors Dashboard.',
                    'Re-check if the sensation does not ease over the next few hours.'
                ],
                concernText: 'Mild and brief symptoms are low concern, but continue monitoring how you feel.'
            };
        }
    },

    eyes: {
        id: 'eyes',
        partLabel: 'Eyes',
        clinicName: 'Ophthalmology Clinic',
        doctorName: 'Dr. Remontada',
        icon: 'eye',
        doctorIntro: "Welcome to the Ophthalmology Clinic, Commander. I'm Dr. Iris. Let's go through 4 short questions about your vision and eye comfort.",
        questions: [
            {
                prompt: 'What symptom are you experiencing in your eyes?',
                options: [
                    { text: 'Dryness, mild irritation, or tired eyelids', score: 1 },
                    { text: 'Blurred focus after looking at screens', score: 2 },
                    { text: 'Sudden vision loss, flashes, or sharp eye pain', score: 4, tag: 'urgent' }
                ]
            },
            {
                prompt: 'Does this affect one eye or both eyes?',
                options: [
                    { text: 'Both eyes equally', score: 1 },
                    { text: 'Mostly one eye', score: 2 },
                    { text: 'Sudden change in one eye', score: 4, tag: 'urgent' }
                ]
            },
            {
                prompt: 'How long have you noticed this change?',
                options: [
                    { text: 'Only during the current shift', score: 1 },
                    { text: 'Over the past 1–2 days', score: 2 },
                    { text: 'Sudden onset or steadily worsening', score: 3 }
                ]
            },
            {
                prompt: 'What were you doing right before it started?',
                options: [
                    { text: 'Extended console or tablet monitoring', score: 1 },
                    { text: 'Working in dry cabin airflow', score: 1 },
                    { text: 'Exposure to bright glare or debris', score: 3 }
                ]
            }
        ],
        evaluate(answers) {
            const total = answers.reduce((s, a) => s + a.score, 0);
            const hasUrgent = answers.some(a => a.tag === 'urgent');

            if (hasUrgent || total >= 11) {
                return {
                    level: 'urgent',
                    badge: 'Urgent medical attention',
                    happening: 'Sudden visual disturbances or sharp eye pain can signal an acute ocular or pressure issue.',
                    actions: [
                        'Avoid rubbing or pressing on your eyes.',
                        'Contact the Flight Surgeon immediately for an urgent vision evaluation.',
                        'Have a crewmate assist if your vision is unclear.'
                    ],
                    concernText: 'Sudden visual changes require immediate evaluation by a qualified medical professional.'
                };
            }
            if (total >= 7) {
                return {
                    level: 'moderate',
                    badge: 'Needs medical attention',
                    happening: 'Ongoing visual blur or eye strain may be linked to microgravity ocular pressure changes or prolonged near-focus work.',
                    actions: [
                        'Follow the 20-20-20 visual rest rule away from close displays.',
                        'Run an optical eyelid check in Quick Check and review your Sensors Dashboard.',
                        'Consult the Flight Surgeon for a scheduled eye check.'
                    ],
                    concernText: 'Persistent visual changes should be evaluated by a medical professional.'
                };
            }
            return {
                level: 'low',
                badge: 'Low concern',
                happening: 'Mild dryness or screen-related visual fatigue is common in low-humidity cabin air.',
                actions: [
                    'Rest your eyes away from bright screens for 10–15 minutes.',
                    'Stay well hydrated and blink consciously during console tasks.',
                    'Reference Optical Care Compartment A1 in your onboard Med-Kit simulation if needed.'
                ],
                concernText: 'Mild eye tiredness is low concern and typically improves with visual rest.'
            };
        }
    },

    ears: {
        id: 'ears',
        partLabel: 'Ears',
        clinicName: 'ENT Clinic',
        doctorName: 'Dr. Remontada',
        icon: 'ear',
        doctorIntro: "Hello Commander, I'm Dr. Echo in the ENT Clinic. I'll ask 4 brief questions to check on your ears and balance.",
        questions: [
            {
                prompt: 'What are you noticing in your ears?',
                options: [
                    { text: 'Mild fullness or muffled hearing like altitude change', score: 1 },
                    { text: 'Ringing sound (tinnitus) or mild earache', score: 2 },
                    { text: 'Strong spinning dizziness (vertigo) or severe ear pain', score: 4, tag: 'urgent' }
                ]
            },
            {
                prompt: 'How long has this sensation lasted?',
                options: [
                    { text: 'Less than an hour', score: 1 },
                    { text: 'A few hours', score: 2 },
                    { text: 'More than a day or worsening', score: 3 }
                ]
            },
            {
                prompt: 'How much is it affecting your balance or communication?',
                options: [
                    { text: 'Minimal — I feel steady and hear clearly', score: 1 },
                    { text: 'Noticeable — slightly harder to hear or stay oriented', score: 2 },
                    { text: 'Strong — trouble maintaining orientation or hearing alerts', score: 4, tag: 'urgent' }
                ]
            },
            {
                prompt: 'Did this follow a recent cabin or suit pressure change?',
                options: [
                    { text: 'Yes, after airlock or suit pressure adjustment', score: 1 },
                    { text: 'After prolonged headset use', score: 1 },
                    { text: 'No clear pressure or headset trigger', score: 2 }
                ]
            }
        ],
        evaluate(answers) {
            const total = answers.reduce((s, a) => s + a.score, 0);
            const hasUrgent = answers.some(a => a.tag === 'urgent');

            if (hasUrgent || total >= 11) {
                return {
                    level: 'urgent',
                    badge: 'Urgent medical attention',
                    happening: 'Severe ear pain or spinning vertigo can affect spatial orientation and inner-ear function.',
                    actions: [
                        'Anchor yourself safely in the cabin to prevent disorientation.',
                        'Notify the Flight Surgeon immediately for medical guidance.',
                        'Verify cabin and suit pressure levels on the Sensors Dashboard.'
                    ],
                    concernText: 'Severe dizziness or acute ear pain requires prompt attention from a medical professional.'
                };
            }
            if (total >= 7) {
                return {
                    level: 'moderate',
                    badge: 'Needs medical attention',
                    happening: 'Ongoing ear fullness or ringing may indicate middle-ear pressure imbalance or fluid congestion.',
                    actions: [
                        'Take a break from tight communication headsets.',
                        'Check cabin pressure stability on the Sensors Dashboard.',
                        'Request an ENT review with your Flight Surgeon.'
                    ],
                    concernText: 'Persistent ear or balance symptoms should be checked by a qualified medical professional.'
                };
            }
            return {
                level: 'low',
                badge: 'Low concern',
                happening: 'Mild ear fullness often occurs from minor pressure equalization shifts or microgravity fluid redistribution.',
                actions: [
                    'Swallow or yawn gently to help equalize middle-ear pressure.',
                    'Give your ears a short rest from headset audio.',
                    'Monitor whether hearing clarity returns to normal.'
                ],
                concernText: 'Mild pressure fullness is low concern and usually settles naturally.'
            };
        }
    },

    chest: {
        id: 'chest',
        partLabel: 'Chest',
        clinicName: 'Cardiology Clinic',
        doctorName: 'Dr. Remontada',
        icon: 'heart-pulse',
        doctorIntro: "Welcome to the Cardiology Clinic, Commander. I'm Dr. Pulse. Let's answer 4 short questions carefully so we can assess your chest symptoms.",
        questions: [
            {
                prompt: 'What sensation are you feeling in your chest?',
                options: [
                    { text: 'Mild muscle soreness on the chest wall', score: 1 },
                    { text: 'Brief fluttering or faster heartbeat after exertion', score: 2 },
                    { text: 'Tightness, heavy pressure, or shortness of breath', score: 5, tag: 'urgent' }
                ]
            },
            {
                prompt: 'When did this sensation begin?',
                options: [
                    { text: 'Right after exercise or resistive training', score: 1 },
                    { text: 'Gradually over the past few hours', score: 2 },
                    { text: 'Suddenly while resting', score: 4, tag: 'urgent' }
                ]
            },
            {
                prompt: 'How intense does it feel right now?',
                options: [
                    { text: 'Very mild and already easing', score: 1 },
                    { text: 'Moderate and still noticeable', score: 3 },
                    { text: 'Strong, squeezing, or spreading to arm/jaw', score: 5, tag: 'urgent' }
                ]
            },
            {
                prompt: 'Are you experiencing any other symptoms with it?',
                options: [
                    { text: 'None — breathing and energy feel normal', score: 1 },
                    { text: 'Mild fatigue or dehydration', score: 2 },
                    { text: 'Sweating, lightheadedness, or trouble breathing', score: 5, tag: 'urgent' }
                ]
            }
        ],
        evaluate(answers) {
            const total = answers.reduce((s, a) => s + a.score, 0);
            const hasUrgent = answers.some(a => a.tag === 'urgent');

            if (hasUrgent || total >= 9) {
                return {
                    level: 'urgent',
                    badge: 'Urgent medical attention',
                    happening: 'Chest tightness, pressure, or breathing difficulty can indicate an acute cardiac or respiratory event that must never be ignored.',
                    actions: [
                        'Stop all physical exertion immediately and rest calmly.',
                        'Contact the Flight Surgeon and crew medical lead right now.',
                        'Review your live Heart Rate and Oxygen Rate on the Sensors Dashboard.'
                    ],
                    concernText: 'Seek immediate help from a qualified medical professional without delay.'
                };
            }
            if (total >= 6) {
                return {
                    level: 'moderate',
                    badge: 'Needs medical attention',
                    happening: 'Post-exertion heart rate elevation or mild chest discomfort warrants a direct look at your cardiovascular telemetry.',
                    actions: [
                        'Rest quietly and avoid strenuous activity until cleared.',
                        'Inspect your Heart Rate, Oxygen Rate, and Pressure on the Sensors Dashboard.',
                        'Consult your Flight Surgeon to review your readings.'
                    ],
                    concernText: 'Chest symptoms should always be reviewed by a qualified medical professional.'
                };
            }
            return {
                level: 'low',
                badge: 'Low concern',
                happening: 'Mild superficial chest wall soreness often stems from upper-body resistive exercise in orbit.',
                actions: [
                    'Allow your upper-body muscles to rest and stay hydrated.',
                    'Confirm your Heart Rate and Oxygen Rate look steady on the Sensors Dashboard.',
                    'Seek immediate medical review if any tightness or breathlessness develops.'
                ],
                concernText: 'Mild localized soreness is low concern, though any new chest pressure needs prompt evaluation.'
            };
        }
    },

    stomach: {
        id: 'stomach',
        partLabel: 'Stomach',
        clinicName: 'Gastroenterology Clinic',
        doctorName: 'Dr. Remontada',
        icon: 'utensils',
        doctorIntro: "Hello Commander, I'm Dr. Sage in the Gastroenterology Clinic. Let's walk through 4 brief questions about your digestive comfort.",
        questions: [
            {
                prompt: 'What digestive symptom are you noticing?',
                options: [
                    { text: 'Mild bloating or fullness after eating', score: 1 },
                    { text: 'Mild nausea or reduced appetite', score: 2 },
                    { text: 'Sharp abdominal pain or persistent vomiting', score: 4, tag: 'urgent' }
                ]
            },
            {
                prompt: 'How long has this discomfort been going on?',
                options: [
                    { text: 'Less than 2 hours', score: 1 },
                    { text: 'Most of today', score: 2 },
                    { text: 'More than 24 hours or intensifying', score: 3 }
                ]
            },
            {
                prompt: 'How severe is the discomfort right now?',
                options: [
                    { text: 'Mild — easy to tolerate', score: 1 },
                    { text: 'Moderate — uncomfortable during movement', score: 2 },
                    { text: 'Severe — sharp or cramping pain', score: 4, tag: 'urgent' }
                ]
            },
            {
                prompt: 'Have you been able to keep fluids down normally?',
                options: [
                    { text: 'Yes, drinking water comfortably', score: 1 },
                    { text: 'Drinking less than usual', score: 2 },
                    { text: 'Unable to keep fluids down', score: 4, tag: 'urgent' }
                ]
            }
        ],
        evaluate(answers) {
            const total = answers.reduce((s, a) => s + a.score, 0);
            const hasUrgent = answers.some(a => a.tag === 'urgent');

            if (hasUrgent || total >= 11) {
                return {
                    level: 'urgent',
                    badge: 'Urgent medical attention',
                    happening: 'Sharp abdominal pain or inability to retain fluids can lead to rapid dehydration or an acute abdominal condition.',
                    actions: [
                        'Pause solid meals and rest comfortably.',
                        'Contact the Flight Surgeon immediately for medical evaluation.',
                        'Monitor your Sugar and Heart Rate levels on the Sensors Dashboard.'
                    ],
                    concernText: 'Severe abdominal symptoms require immediate evaluation by a qualified medical professional.'
                };
            }
            if (total >= 7) {
                return {
                    level: 'moderate',
                    badge: 'Needs medical attention',
                    happening: 'Slower digestion in microgravity or mild stomach irritation may be causing ongoing nausea or discomfort.',
                    actions: [
                        'Take small, slow sips of water to maintain hydration.',
                        'Check your Sugar reading on the Sensors Dashboard.',
                        'Check in with the Flight Surgeon if symptoms persist today.'
                    ],
                    concernText: 'Ongoing digestive discomfort should be reviewed by a medical professional.'
                };
            }
            return {
                level: 'low',
                badge: 'Low concern',
                happening: 'Mild bloating or fullness is common in zero gravity because gases separate differently in the stomach.',
                actions: [
                    'Eat smaller portions slowly and stay hydrated with small sips of water.',
                    'Check your Sugar balance on the Sensors Dashboard.',
                    'Reference Digestive Support Compartment C3 in your onboard Med-Kit simulation if needed.'
                ],
                concernText: 'Mild bloating is low concern and typically settles with gentle hydration and rest.'
            };
        }
    },

    muscles: {
        id: 'muscles',
        partLabel: 'Muscles',
        clinicName: 'Musculoskeletal Clinic',
        doctorName: 'Dr. Remontada',
        icon: 'dumbbell',
        doctorIntro: "Welcome to the Musculoskeletal Clinic, Commander. I'm Dr. Atlas. Let's answer 4 quick questions to understand your muscle or joint strain.",
        questions: [
            {
                prompt: 'What type of muscle discomfort are you feeling?',
                options: [
                    { text: 'Mild stiffness or post-workout soreness', score: 1 },
                    { text: 'Localized ache or tightness in shoulders, back, or legs', score: 2 },
                    { text: 'Sharp pain, visible swelling, or inability to move the limb', score: 4, tag: 'urgent' }
                ]
            },
            {
                prompt: 'What likely triggered this discomfort?',
                options: [
                    { text: 'Routine resistive exercise or EVA suit movement', score: 1 },
                    { text: 'Holding one posture for a long shift', score: 1 },
                    { text: 'Sudden strain, twist, or impact', score: 3 }
                ]
            },
            {
                prompt: 'How strong is the soreness right now?',
                options: [
                    { text: 'Mild — loosens up when moving gently', score: 1 },
                    { text: 'Moderate — limits full range of motion', score: 2 },
                    { text: 'Severe — painful even at complete rest', score: 4, tag: 'urgent' }
                ]
            },
            {
                prompt: 'How long has this muscle area felt strained?',
                options: [
                    { text: 'Started today after activity', score: 1 },
                    { text: 'Lasted 1–2 days', score: 2 },
                    { text: 'More than 3 days without improvement', score: 3 }
                ]
            }
        ],
        evaluate(answers) {
            const total = answers.reduce((s, a) => s + a.score, 0);
            const hasUrgent = answers.some(a => a.tag === 'urgent');

            if (hasUrgent || total >= 11) {
                return {
                    level: 'urgent',
                    badge: 'Urgent medical attention',
                    happening: 'Sharp pain, swelling, or loss of movement suggests a significant acute muscle or joint injury.',
                    actions: [
                        'Stop using or loading the affected limb immediately.',
                        'Contact the Flight Surgeon right away for a physical assessment.',
                        'Reference Recovery Wrap Bay D4 (Simulation Only) while awaiting medical guidance.'
                    ],
                    concernText: 'Acute pain or loss of mobility needs prompt attention from a qualified medical professional.'
                };
            }
            if (total >= 7) {
                return {
                    level: 'moderate',
                    badge: 'Needs medical attention',
                    happening: 'Moderate muscular fatigue or postural strain from microgravity adaptation is limiting your comfort.',
                    actions: [
                        'Pause heavy resistive workouts for 24 hours to allow tissue recovery.',
                        'Perform gentle, pain-free mobility stretches and hydrate steadily.',
                        'Have the Flight Surgeon review the strain if tightness continues.'
                    ],
                    concernText: 'Moderate strain benefits from rest and a follow-up check with a medical professional.'
                };
            }
            return {
                level: 'low',
                badge: 'Low concern',
                happening: 'Mild post-exercise stiffness is normal as muscles adapt to microgravity resistance routines.',
                actions: [
                    'Do slow, gentle stretching within a comfortable, pain-free range.',
                    'Drink water and allow adequate rest between training sessions.',
                    'Onboard Med-Kit Bay D4 (Simulation Reference Only) is stocked for basic cold/warm pack support.'
                ],
                concernText: 'Mild post-activity soreness is low concern and responds well to gentle recovery.'
            };
        }
    }
};