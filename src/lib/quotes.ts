// ─────────────────────────────────────────────────────────────
// ClearMind — Daily Motivational Quotes
// Deterministic selection based on day-of-year so every user
// sees the same quote on the same day, and it changes daily.
// ─────────────────────────────────────────────────────────────

export interface Quote {
  text: string;
  author: string;
}

const QUOTES: Quote[] = [
  { text: 'Every moment is a fresh beginning.', author: 'T.S. Eliot' },
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'You don\u2019t have to be great to start, but you have to start to be great.', author: 'Zig Ziglar' },
  { text: 'Recovery is not a race. You don\u2019t have to rush.', author: 'Unknown' },
  { text: 'The only way out is through.', author: 'Robert Frost' },
  { text: 'Fall seven times, stand up eight.', author: 'Japanese Proverb' },
  { text: 'Progress, not perfection.', author: 'AA Slogan' },
  { text: 'You are stronger than your cravings.', author: 'Unknown' },
  { text: 'One day at a time.', author: 'AA Slogan' },
  { text: 'The journey of a thousand miles begins with a single step.', author: 'Lao Tzu' },
  { text: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius' },
  { text: 'Believe you can and you\u2019re halfway there.', author: 'Theodore Roosevelt' },
  { text: 'Change happens when the pain of staying the same exceeds the pain of change.', author: 'Unknown' },
  { text: 'You don\u2019t have to see the whole staircase, just take the first step.', author: 'Martin Luther King Jr.' },
  { text: 'What lies behind us and what lies before us are tiny matters compared to what lies within us.', author: 'Ralph Waldo Emerson' },
  { text: 'The best time to plant a tree was 20 years ago. The second best time is now.', author: 'Chinese Proverb' },
  { text: 'Courage doesn\u2019t always roar. Sometimes it\u2019s the quiet voice saying \u2018I will try again tomorrow.\u2019', author: 'Mary Anne Radmacher' },
  { text: 'Relapse is not the opposite of recovery. It\u2019s part of the journey.', author: 'Unknown' },
  { text: 'Healing is not linear.', author: 'Unknown' },
  { text: 'Your present circumstances don\u2019t determine where you can go; they merely determine where you start.', author: 'Nido Qubein' },
  { text: 'Every day sober is a victory.', author: 'Unknown' },
  { text: 'The mind is everything. What you think you become.', author: 'Buddha' },
  { text: 'Small steps every day add up to big results.', author: 'Unknown' },
  { text: 'You are not your mistakes. You are your capacity for growth.', author: 'Unknown' },
  { text: 'Self-care is not selfish. You cannot serve from an empty vessel.', author: 'Eleanor Brown' },
  { text: 'The wound is the place where the Light enters you.', author: 'Rumi' },
  { text: 'We must accept finite disappointment, but never lose infinite hope.', author: 'Martin Luther King Jr.' },
  { text: 'Strength grows in the moments when you think you can\u2019t go on but you keep going anyway.', author: 'Unknown' },
  { text: 'The only person you are destined to become is the person you decide to be.', author: 'Ralph Waldo Emerson' },
  { text: 'Motivation gets you going, but discipline keeps you growing.', author: 'John C. Maxwell' },
  { text: 'Nothing will work unless you do.', author: 'Maya Angelou' },
  { text: 'A year from now you may wish you had started today.', author: 'Karen Lamb' },
  { text: 'The harder the battle, the sweeter the victory.', author: 'Les Brown' },
  { text: 'You have power over your mind, not outside events. Realize this, and you will find strength.', author: 'Marcus Aurelius' },
  { text: 'Well done is better than well said.', author: 'Benjamin Franklin' },
];

function getDayOfYear(date: Date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function getDailyQuote(date: Date = new Date()): Quote {
  const dayOfYear = getDayOfYear(date);
  const index = dayOfYear % QUOTES.length;
  return QUOTES[index];
}
