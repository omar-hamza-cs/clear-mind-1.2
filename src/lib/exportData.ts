// ─────────────────────────────────────────────────────────────
// ClearMind — Data Export Library
// Web-safe mock of expo-file-system + expo-sharing.
// On web, exports JSON as a downloaded file.
// ─────────────────────────────────────────────────────────────

import type {
  UserProfile,
  DailyCheckIn,
  Craving,
  JournalEntry,
  Milestone,
  AppSettings,
  StreakHistory,
} from '@/types';

export interface ExportData {
  exportedAt: number;
  appVersion: string;
  profile: UserProfile | null;
  checkIns: Record<string, DailyCheckIn>;
  cravings: Craving[];
  journal: JournalEntry[];
  milestones: Milestone[];
  settings: AppSettings;
  streakHistory: StreakHistory[];
}

export function buildExportData(data: Omit<ExportData, 'exportedAt' | 'appVersion'>): ExportData {
  return {
    ...data,
    exportedAt: Date.now(),
    appVersion: '1.0.0',
  };
}

export function exportDataAsJSON(data: ExportData): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `clearmind-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
