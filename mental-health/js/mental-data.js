const EARTH_HAPPY_MESSAGES = [
"You’ve got this! Keep reaching for the stars.",
"The whole planet is cheering you on!",
"Stay strong, stay focused, and enjoy the view.",
"You are doing amazing things up there. Keep going!",
"Nothing can stop you—not even gravity!",
"Every mission step you take makes history. You’re crushing it!",
"Eyes on the mission, feet off the ground. You’re unstoppable!",
"Proud of your hard work every single day. Keep shining!"
];

const RELAXATION_EXERCISES = {
    breathing: {
        id: "breathing",
        title: "Guided Breathing",
        category: "RESPIRATORY CALM",
        durationLabel: "2 Minutes",
        durationSeconds: 120,
        icon: "wind",
        shortDesc: "Rhythmic 4-4-6 orbital breathing with a visual expansion guide to lower heart rate.",
        fullDesc: "Follow the glowing sphere as it expands and contracts. Slowing your exhale signals your nervous system to release mission tension.",
        isBreathingMode: true,
        steps: [
            "Float comfortably or anchor your feet lightly in the cabin restraints.",
            "Inhale slowly through your nose for 4 seconds as the sphere expands.",
            "Hold your breath gently for 4 seconds at the top of the inhale.",
            "Exhale smoothly through your mouth for 6 seconds as the sphere softens."
        ]
    },
    mindfulness: {
        id: "mindfulness",
        title: "Mindfulness",
        category: "PRESENT AWARENESS",
        durationLabel: "3 Minutes",
        durationSeconds: 180,
        icon: "sparkles",
        shortDesc: "Ground your awareness in the present moment and let mission schedules fade briefly.",
        fullDesc: "A quiet sensory check-in designed to anchor your mind in the stillness of your personal space.",
        isBreathingMode: false,
        steps: [
            "Soften your gaze or gently close your eyes.",
            "Notice three subtle sounds around the cabin without judging them.",
            "Bring attention to the weightless sensation of your shoulders and hands.",
            "Whenever a task thought appears, acknowledge it and return to your natural breath."
        ]
    },
    muscle: {
        id: "muscle",
        title: "Muscle Relaxation",
        category: "SOMATIC RELEASE",
        durationLabel: "4 Minutes",
        durationSeconds: 240,
        icon: "feather",
        shortDesc: "Progressive tension-and-release sequence to ease neck, shoulder, and back tightness.",
        fullDesc: "Microgravity posture often holds hidden tension in the upper back and jaw. Gently tense and release each muscle group.",
        isBreathingMode: false,
        steps: [
            "Gently clench your hands into soft fists for 5 seconds, then release completely.",
            "Raise your shoulders toward your ears for 5 seconds, then let them float down.",
            "Unclench your jaw and smooth the muscles around your forehead and eyes.",
            "Take one slow breath and notice the warmth of relaxation across your upper body."
        ]
    },
    reset: {
        id: "reset",
        title: "Mental Reset",
        category: "COGNITIVE CLARITY",
        durationLabel: "2 Minutes",
        durationSeconds: 120,
        icon: "compass",
        shortDesc: "A quick cognitive pause to clear mental fatigue and restore calm focus between tasks.",
        fullDesc: "Step back from checklists and telemetry for two quiet minutes to refresh your perspective.",
        isBreathingMode: false,
        steps: [
            "Step away from screens and look toward a calm, neutral point in the cabin.",
            "Take three deep, unhurried breaths to mark a clear boundary from your last task.",
            "Remind yourself of one thing that went well today during your mission.",
            "Set one calm, simple intention for the next part of your day."
        ]
    }
};