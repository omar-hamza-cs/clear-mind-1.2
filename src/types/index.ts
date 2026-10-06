// ─────────────────────────────────────────────────────────────
// ClearMind — Type Definitions
// All dates stored as UTC epoch milliseconds (number) internally.
// ─────────────────────────────────────────────────────────────

import type { ThemeMode } from '@/constants/theme';

export type SpendingPeriod = 'daily' | 'weekly' | 'monthly';

export interface Spending {
  amount: number;
  period: SpendingPeriod;
  currency: string;
}

export interface UserProfile {
  quitDate: number;          // UTC epoch ms
  lastUseAt: number;         // UTC epoch ms
  spending: Spending;
  reasons: string[];
  customReason: string;
  goal: string;
  onboardingComplete: boolean;
  relapseCount: number;
}

export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export interface DailyCheckIn {
  date: string;              // YYYY-MM-DD (display key only)
  mood: MoodLevel;
  craving: number;           // 1-10
  sleep: number;             // 1-10
  energy: number;            // 1-10
  usedCannabis: boolean;
  note: string;
}

export type CravingMode = 'breathing' | 'distraction';

export interface Craving {
  id: string;
  timestamp: number;         // UTC epoch ms
  mode: CravingMode;
  initialIntensity: number;  // 1-10
  postIntensity: number;     // 1-10
  resisted: boolean;
}

export interface JournalEntry {
  id: string;
  createdAt: number;         // UTC epoch ms
  updatedAt: number;         // UTC epoch ms
  title: string;
  body: string;
  mood: MoodLevel;
  cravingLevel: number;      // 1-10
}

export interface Milestone {
  id: string;
  days: number;
  unlockedAt: number | null; // UTC epoch ms, null if not yet unlocked
}

export interface NotificationConfig {
  enabled: boolean;
  checkInReminder: boolean;
  checkInHour: number;       // 0-23
  checkInMinute: number;     // 0-59
  milestoneAlerts: boolean;
  cravingSupport: boolean;
}

export interface AppSettings {
  theme: ThemeMode;
  notifications: NotificationConfig;
}

export interface StreakHistory {
  startDate: number;         // UTC epoch ms
  endDate: number;           // UTC epoch ms
  durationDays: number;
}

// ─── Onboarding draft (persisted mid-flow) ──────────────────

export interface OnboardingDraft {
  step: number;                        // 0-based: 0=welcome … 6=summary
  lastUseAt: number | null;           // UTC epoch ms
  spendingAmount: number | null;
  spendingPeriod: SpendingPeriod | null;
  spendingCurrency: string;
  reasons: string[];
  customReason: string;
  goal: string;
  notificationsEnabled: boolean;
  checkInHour: number;                 // 0-23
  checkInMinute: number;              // 0-59
}

// ─── Derived / helper types ─────────────────────────────────

export interface DashboardStats {
  currentStreak: number;
  longestStreak: number;
  daysSinceLastUse: number;
  moneySaved: number;
  totalCheckIns: number;
  totalCravingsResisted: number;
  relapseCount: number;
}

export type TabKey = 'home' | 'checkin' | 'journal' | 'progress' | 'settings';
