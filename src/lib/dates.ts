// ─────────────────────────────────────────────────────────────
// ClearMind — Date Helpers
// All storage uses UTC epoch ms; formatting happens at UI layer.
// ─────────────────────────────────────────────────────────────

import {
  format,
  differenceInCalendarDays,
  startOfToday,
  startOfYesterday,
} from 'date-fns';

export function epochNow(): number {
  return Date.now();
}

export function todayEpoch(): number {
  return startOfToday().getTime();
}

export function yesterdayEpoch(): number {
  return startOfYesterday().getTime();
}

export function formatEpoch(epoch: number, fmt: string): string {
  return format(new Date(epoch), fmt);
}

export function daysSinceEpoch(epoch: number): number {
  return Math.max(0, differenceInCalendarDays(new Date(), new Date(epoch)));
}

export function toEpoch(year: number, month: number, day: number, hour = 0, minute = 0): number {
  return new Date(year, month, day, hour, minute).getTime();
}

export function epochToISODate(epoch: number): string {
  return format(new Date(epoch), 'yyyy-MM-dd');
}

export function epochToTime(epoch: number): string {
  return format(new Date(epoch), 'HH:mm');
}

export function epochToDateTime(epoch: number): string {
  return format(new Date(epoch), 'MMM d, yyyy \'at\' h:mm a');
}

export function epochToDate(epoch: number): string {
  return format(new Date(epoch), 'MMM d, yyyy');
}
