// ─────────────────────────────────────────────────────────────
// ClearMind — Distraction Activities
// Rotated every 60 seconds during distraction mode.
// ─────────────────────────────────────────────────────────────

export interface DistractionActivity {
  title: string;
  instruction: string;
  duration: number;  // seconds to display this activity
}

export const DISTRACTION_ACTIVITIES: DistractionActivity[] = [
  {
    title: 'Name 5 Things',
    instruction: 'Look around and name 5 things you can see right now. Say them out loud or in your mind.',
    duration: 60,
  },
  {
    title: 'Body Scan',
    instruction: 'Starting from your toes, notice each part of your body. Work your way up to the top of your head.',
    duration: 60,
  },
  {
    title: 'Cold Water',
    instruction: 'Splash cold water on your face, or hold an ice cube. The temperature shift resets your nervous system.',
    duration: 60,
  },
  {
    title: 'Count Backwards',
    instruction: 'Count backwards from 100 by 7s: 100, 93, 86, 79... This engages your logical brain and calms emotions.',
    duration: 60,
  },
  {
    title: '5-4-3-2-1 Grounding',
    instruction: 'Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.',
    duration: 60,
  },
  {
    title: 'Stretch It Out',
    instruction: 'Stand up and stretch your arms high overhead. Roll your shoulders. Reach for the ceiling.',
    duration: 60,
  },
  {
    title: 'Slow Sips',
    instruction: 'Get a glass of water. Take 10 slow, deliberate sips. Notice the temperature and the feeling of swallowing.',
    duration: 60,
  },
  {
    title: 'Memory Game',
    instruction: 'Think of a happy memory. Recall as many details as you can: colors, sounds, smells, who was there.',
    duration: 60,
  },
  {
    title: 'Doodle Time',
    instruction: 'Grab a pen and paper. Draw whatever comes to mind. It doesn\u2019t need to be good \u2014 just keep your hands busy.',
    duration: 60,
  },
  {
    title: 'Deep Breaths',
    instruction: 'Take 5 deep breaths. Breathe in through your nose for 4 counts, out through your mouth for 6.',
    duration: 60,
  },
];

export const BREATHING_PHASES = {
  inhale: { label: 'Breathe In', duration: 4 },
  hold: { label: 'Hold', duration: 4 },
  exhale: { label: 'Breathe Out', duration: 6 },
} as const;

export const BREATHING_CYCLE_SECONDS =
  BREATHING_PHASES.inhale.duration +
  BREATHING_PHASES.hold.duration +
  BREATHING_PHASES.exhale.duration;

export const BREATHING_TOTAL_SECONDS = 60;
export const DISTRACTION_TOTAL_SECONDS = 600; // 10 minutes
