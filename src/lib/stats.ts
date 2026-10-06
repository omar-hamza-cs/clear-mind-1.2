// ─────────────────────────────────────────────────────────────
// ClearMind — Stats & Money Helpers
// ─────────────────────────────────────────────────────────────

import type {
  UserProfile,
  StreakHistory,
  Craving,
  DailyCheckIn,
  SpendingPeriod,
} from '@/types';

export interface StreakBreakdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

export function getStreakBreakdown(lastUseAt: number, now: number = Date.now()): StreakBreakdown {
  const totalMs = Math.max(0, now - lastUseAt);
  const totalSeconds = Math.floor(totalMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, totalSeconds };
}

export function getCurrentStreakDays(lastUseAt: number, now: number = Date.now()): number {
  return Math.floor(Math.max(0, now - lastUseAt) / (1000 * 60 * 60 * 24));
}

export function getLongestStreak(
  streakHistory: StreakHistory[],
  currentStreakDays: number
): number {
  const historical = streakHistory.reduce(
    (max, s) => Math.max(max, s.durationDays),
    0
  );
  return Math.max(historical, currentStreakDays);
}

export function getTotalCravingsResisted(cravings: Craving[]): number {
  return cravings.filter((c) => c.resisted).length;
}

export function getTotalCheckIns(checkIns: Record<string, DailyCheckIn>): number {
  return Object.keys(checkIns).length;
}

function periodToDailyRate(amount: number, period: SpendingPeriod): number {
  switch (period) {
    case 'daily':
      return amount;
    case 'weekly':
      return amount / 7;
    case 'monthly':
      return amount / 30.4375;
    default:
      return amount;
  }
}

export function getDailySpendRate(profile: UserProfile): number {
  return periodToDailyRate(profile.spending.amount, profile.spending.period);
}

export function getTotalCleanSeconds(
  streakHistory: StreakHistory[],
  lastUseAt: number,
  now: number = Date.now()
): number {
  let total = 0;
  for (const s of streakHistory) {
    total += (s.endDate - s.startDate) / 1000;
  }
  total += Math.max(0, now - lastUseAt) / 1000;
  return total;
}

export function getMoneySaved(
  profile: UserProfile,
  streakHistory: StreakHistory[],
  now: number = Date.now()
): number {
  const rate = getDailySpendRate(profile);
  if (rate <= 0) return 0;
  const totalCleanSeconds = getTotalCleanSeconds(streakHistory, profile.lastUseAt, now);
  const totalCleanDays = totalCleanSeconds / 86400;
  return totalCleanDays * rate;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '\u20AC',
  USD: '$',
  GBP: '\u00A3',
};

export function getCurrencySymbol(code: string): string {
  return CURRENCY_SYMBOLS[code] ?? code;
}

export function formatMoney(amount: number, currency: string): string {
  const symbol = getCurrencySymbol(currency);
  const rounded = Math.round(amount);
  if (rounded >= 1000) {
    return `${symbol}${(rounded / 1000).toFixed(1)}k`;
  }
  return `${symbol}${rounded.toLocaleString()}`;
}

export function formatMoneyDetailed(amount: number, currency: string): string {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function getGoalDays(goal: string): number | null {
  const map: Record<string, number> = {
    '7 days': 7,
    '14 days': 14,
    '30 days': 30,
    '90 days': 90,
    '365 days': 365,
    '1 year': 365,
    'For good': -1,
    'Forever': -1,
  };
  const val = map[goal];
  if (val === undefined) return null;
  return val;
}

export function isForeverGoal(goal: string): boolean {
  return goal === 'For good' || goal === 'Forever';
}

export function getGoalProgressPercent(
  currentStreakDays: number,
  goal: string
): number | null {
  if (isForeverGoal(goal)) return null;
  const goalDays = getGoalDays(goal);
  if (!goalDays || goalDays <= 0) return null;
  return Math.min(100, (currentStreakDays / goalDays) * 100);
}

export function getGreeting(hour: number = new Date().getHours()): string {
  if (hour < 5) return 'Still up?';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
}

export function getTodayISODate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
