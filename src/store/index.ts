// ─────────────────────────────────────────────────────────────
// ClearMind — Zustand Store with AsyncStorage Persistence
// ─────────────────────────────────────────────────────────────

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { webStorage } from '@/lib/webStorage';
import {
  MILESTONE_DAYS,
} from '@/constants/theme';
import type { ThemeMode } from '@/constants/theme';
import type {
  UserProfile,
  DailyCheckIn,
  Craving,
  JournalEntry,
  Milestone,
  AppSettings,
  StreakHistory,
  OnboardingDraft,
} from '@/types';

// ─── Persisted state ─────────────────────────────────────────

interface PersistedState {
  profile: UserProfile | null;
  onboardingDraft: OnboardingDraft | null;
  checkIns: Record<string, DailyCheckIn>;   // keyed by YYYY-MM-DD
  cravings: Craving[];
  journal: JournalEntry[];
  milestones: Milestone[];
  settings: AppSettings;
  streakHistory: StreakHistory[];

  // Actions ─ onboarding draft
  setOnboardingDraft: (draft: OnboardingDraft) => void;
  updateOnboardingDraft: (patch: Partial<OnboardingDraft>) => void;
  clearOnboardingDraft: () => void;

  // Actions ─ profile
  completeOnboarding: (profile: Omit<UserProfile, 'onboardingComplete' | 'relapseCount'>) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  recordRelapse: () => void;

  // Actions ─ check-ins
  addCheckIn: (checkIn: DailyCheckIn) => void;
  getCheckInForDate: (date: string) => DailyCheckIn | undefined;

  // Actions ─ cravings
  addCraving: (craving: Craving) => void;

  // Actions ─ journal
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateJournalEntry: (id: string, patch: Partial<Pick<JournalEntry, 'title' | 'body' | 'mood' | 'cravingLevel'>>) => void;
  deleteJournalEntry: (id: string) => void;

  // Actions ─ milestones
  checkMilestones: (currentStreak: number) => Milestone[];

  // Actions ─ settings
  updateSettings: (patch: Partial<AppSettings>) => void;

  // Actions ─ reset
  resetAll: () => void;
  resetProgress: () => void;
}

// ─── Hydration state (non-persisted) ────────────────────────

interface HydrationState {
  isHydrated: boolean;
  hydrate: () => void;
}

export type Store = PersistedState & HydrationState;

// ─── Defaults ────────────────────────────────────────────────

function buildInitialMilestones(): Milestone[] {
  return MILESTONE_DAYS.map((days) => ({
    id: `milestone-${days}`,
    days,
    unlockedAt: null,
  }));
}

const defaultSettings: AppSettings = {
  theme: 'system',
  notifications: {
    enabled: true,
    checkInReminder: true,
    checkInHour: 9,
    checkInMinute: 0,
    milestoneAlerts: true,
    cravingSupport: true,
  },
};

// ─── Store ───────────────────────────────────────────────────

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // ── Persisted ──
      profile: null,
      onboardingDraft: null,
      checkIns: {},
      cravings: [],
      journal: [],
      milestones: buildInitialMilestones(),
      settings: defaultSettings,
      streakHistory: [],

      // ── Onboarding draft ──
      setOnboardingDraft: (draft) => {
        set({ onboardingDraft: draft });
      },

      updateOnboardingDraft: (patch) => {
        const current = get().onboardingDraft;
        if (!current) return;
        set({ onboardingDraft: { ...current, ...patch } });
      },

      clearOnboardingDraft: () => {
        set({ onboardingDraft: null });
      },

      // ── Hydration ──
      isHydrated: false,
      hydrate: () => set({ isHydrated: true }),

      // ── Profile ──
      completeOnboarding: (profileData) => {
        set({
          profile: {
            ...profileData,
            onboardingComplete: true,
            relapseCount: 0,
          },
          onboardingDraft: null,
        });
      },

      updateProfile: (patch) => {
        const current = get().profile;
        if (!current) return;
        set({ profile: { ...current, ...patch } });
      },

      recordRelapse: () => {
        const { profile, streakHistory } = get();
        if (!profile) return;

        const now = Date.now();
        const durationDays = Math.floor(
          (now - profile.lastUseAt) / (1000 * 60 * 60 * 24)
        );

        const completedStreak: StreakHistory | null =
          durationDays > 0
            ? {
                startDate: profile.lastUseAt,
                endDate: now,
                durationDays,
              }
            : null;

        set({
          profile: {
            ...profile,
            lastUseAt: now,
            relapseCount: profile.relapseCount + 1,
          },
          streakHistory: completedStreak
            ? [...streakHistory, completedStreak]
            : streakHistory,
        });
      },

      // ── Check-ins ──
      addCheckIn: (checkIn) => {
        set((state) => ({
          checkIns: { ...state.checkIns, [checkIn.date]: checkIn },
        }));
      },

      getCheckInForDate: (date) => get().checkIns[date],

      // ── Cravings ──
      addCraving: (craving) => {
        set((state) => ({ cravings: [...state.cravings, craving] }));
      },

      // ── Journal ──
      addJournalEntry: (entry) => {
        const now = Date.now();
        const newEntry: JournalEntry = {
          ...entry,
          id: `journal-${now}-${Math.random().toString(36).slice(2, 8)}`,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ journal: [newEntry, ...state.journal] }));
      },

      updateJournalEntry: (id, patch) => {
        set((state) => ({
          journal: state.journal.map((e) =>
            e.id === id ? { ...e, ...patch, updatedAt: Date.now() } : e
          ),
        }));
      },

      deleteJournalEntry: (id) => {
        set((state) => ({
          journal: state.journal.filter((e) => e.id !== id),
        }));
      },

      // ── Milestones ──
      checkMilestones: (currentStreak) => {
        const now = Date.now();
        const newlyUnlocked: Milestone[] = [];
        set((state) => ({
          milestones: state.milestones.map((m) => {
            if (m.unlockedAt === null && currentStreak >= m.days) {
              const unlocked = { ...m, unlockedAt: now };
              newlyUnlocked.push(unlocked);
              return unlocked;
            }
            return m;
          }),
        }));
        return newlyUnlocked;
      },

      // ── Settings ──
      updateSettings: (patch) => {
        set((state) => ({
          settings: { ...state.settings, ...patch },
        }));
      },

      // ── Reset ──
      resetAll: () => {
        set({
          profile: null,
          onboardingDraft: null,
          checkIns: {},
          cravings: [],
          journal: [],
          milestones: buildInitialMilestones(),
          settings: defaultSettings,
          streakHistory: [],
        });
      },

      resetProgress: () => {
        const profile = get().profile;
        if (!profile) return;
        set({
          profile: { ...profile, lastUseAt: Date.now(), relapseCount: 0 },
          checkIns: {},
          cravings: [],
          milestones: buildInitialMilestones(),
          streakHistory: [],
        });
      },
    }),
    {
      name: 'clearmind-store',
      storage: createJSONStorage(() => webStorage),
      partialize: (state) => ({
        profile: state.profile,
        onboardingDraft: state.onboardingDraft,
        checkIns: state.checkIns,
        cravings: state.cravings,
        journal: state.journal,
        milestones: state.milestones,
        settings: state.settings,
        streakHistory: state.streakHistory,
      }),
      onRehydrateStorage: () => (state) => {
        state?.hydrate();
      },
    }
  )
);

// ─── Selectors ────────────────────────────────────────────────

export function useIsHydrated(): boolean {
  return useStore((s) => s.isHydrated);
}

export function useProfile(): UserProfile | null {
  return useStore((s) => s.profile);
}

export function useSettings(): AppSettings {
  return useStore((s) => s.settings);
}

export function useThemeMode(): ThemeMode {
  return useStore((s) => s.settings.theme);
}
