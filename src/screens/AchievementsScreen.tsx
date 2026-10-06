// ─────────────────────────────────────────────────────────────
// ClearMind — Achievements Screen
// Accessible from Progress. Shows locked/unlocked milestones.
// ─────────────────────────────────────────────────────────────

import { useMemo } from 'react';
import {
  ArrowLeft,
  Trophy,
  Lock,
  Check,
  Sparkles,
} from 'lucide-react';
import { useStore } from '@/store';
import { useTheme } from '@/context/ThemeProvider';
import { typography, spacing, radii, palette } from '@/constants/theme';
import { getCurrentStreakDays } from '@/lib/stats';
import type { Milestone } from '@/types';

interface AchievementsScreenProps {
  onClose: () => void;
}

const MILESTONE_DESCRIPTIONS: Record<number, string> = {
  1: 'The first step is always the hardest.',
  3: 'Building momentum, one day at a time.',
  7: 'A full week of choosing yourself.',
  14: 'Two weeks. Habits are forming.',
  30: 'One month of commitment.',
  60: 'Two months of consistency.',
  90: `90 days. You're in the elite.`,
  180: 'Half a year of transformation.',
  365: 'A full year. Life-changing.',
};

export function AchievementsScreen({ onClose }: AchievementsScreenProps) {
  const { colors } = useTheme();
  const milestones = useStore((s) => s.milestones);
  const profile = useStore((s) => s.profile);

  const currentStreak = profile ? getCurrentStreakDays(profile.lastUseAt) : 0;
  const unlockedCount = milestones.filter((m) => m.unlockedAt !== null).length;
  const totalCount = milestones.length;

  // Next milestone to unlock
  const nextMilestone = useMemo(
    () => milestones.find((m) => m.unlockedAt === null),
    [milestones]
  );

  const progressToNext = nextMilestone
    ? Math.min(100, (currentStreak / nextMilestone.days) * 100)
    : 100;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: colors.bg,
        zIndex: 1000,
        animation: 'cm-fade-in 0.3s ease both',
        overflowY: 'auto',
      }}
    >
      <div style={{ maxWidth: 560, margin: '0 auto', padding: spacing.xl, paddingBottom: 100 }}>
        {/* Header */}
        <button
          onClick={onClose}
          style={{
            display: 'flex', alignItems: 'center', gap: spacing.xs,
            fontFamily: typography.fontFamily, fontSize: typography.sizes.body,
            color: colors.textSecondary, backgroundColor: 'transparent', border: 'none',
            cursor: 'pointer', padding: spacing.sm, marginBottom: spacing.lg,
          }}
        >
          <ArrowLeft size={20} /> Back to Progress
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xl }}>
          <div
            style={{
              width: 48, height: 48, borderRadius: radii.md,
              backgroundColor: palette.warning[100],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Trophy size={24} color={palette.accent[500]} />
          </div>
          <div>
            <h1
              style={{
                fontFamily: typography.fontFamily,
                fontSize: typography.sizes.display,
                fontWeight: typography.weights.bold,
                color: colors.text,
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              Achievements
            </h1>
            <p
              style={{
                fontFamily: typography.fontFamily,
                fontSize: typography.sizes.caption,
                color: colors.textSecondary,
                margin: 0,
              }}
            >
              {unlockedCount} of {totalCount} unlocked
            </p>
          </div>
        </div>

        {/* Progress to next milestone */}
        {nextMilestone && (
          <div
            style={{
              backgroundColor: colors.surface,
              borderRadius: radii.lg,
              padding: spacing.lg,
              border: `1px solid ${colors.border}`,
              marginBottom: spacing.xl,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm }}>
              <span style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.caption, color: colors.textSecondary, fontWeight: typography.weights.medium }}>
                Next: {nextMilestone.days} days
              </span>
              <span style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.caption, color: colors.text, fontWeight: typography.weights.semibold }}>
                {currentStreak} / {nextMilestone.days}
              </span>
            </div>
            <div
              style={{
                height: 8,
                backgroundColor: colors.bg,
                borderRadius: radii.full,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progressToNext}%`,
                  background: `linear-gradient(90deg, ${palette.primary[400]}, ${palette.primary[600]})`,
                  borderRadius: radii.full,
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
          </div>
        )}

        {/* Milestone cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
          {milestones.map((m) => (
            <MilestoneCard key={m.id} milestone={m} currentStreak={currentStreak} />
          ))}
        </div>

        {/* All unlocked message */}
        {unlockedCount === totalCount && (
          <div
            style={{
              marginTop: spacing.xl,
              padding: spacing.xl,
              borderRadius: radii.lg,
              background: `linear-gradient(135deg, ${palette.warning[100]}, ${palette.accent[200]})`,
              textAlign: 'center',
            }}
          >
            <Sparkles size={28} color={palette.accent[500]} style={{ margin: '0 auto', marginBottom: spacing.sm }} />
            <h3
              style={{
                fontFamily: typography.fontFamily,
                fontSize: typography.sizes.title,
                fontWeight: typography.weights.bold,
                color: palette.warning[800],
                margin: 0,
                marginBottom: spacing.xs,
              }}
            >
              All milestones unlocked!
            </h3>
            <p
              style={{
                fontFamily: typography.fontFamily,
                fontSize: typography.sizes.caption,
                color: palette.warning[800],
                margin: 0,
              }}
            >
              You've reached every milestone. This is extraordinary.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Milestone Card ──────────────────────────────────────────

function MilestoneCard({ milestone, currentStreak }: { milestone: Milestone; currentStreak: number }) {
  const { colors } = useTheme();
  const unlocked = milestone.unlockedAt !== null;
  const desc = MILESTONE_DESCRIPTIONS[milestone.days] ?? 'A significant achievement.';

  if (unlocked) {
    const date = new Date(milestone.unlockedAt!);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.lg,
          padding: spacing.lg,
          border: `1px solid ${palette.primary[200]}`,
          display: 'flex',
          alignItems: 'center',
          gap: spacing.md,
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 56, height: 56, borderRadius: '50%',
            backgroundColor: palette.success[100],
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Trophy size={26} color={palette.success[600]} />
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: 2 }}>
            <span style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.title, fontWeight: typography.weights.bold, color: colors.text }}>
              {milestone.days} {milestone.days === 1 ? 'day' : 'days'}
            </span>
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 3,
                backgroundColor: palette.success[100], borderRadius: radii.full,
                padding: `${2}px ${spacing.sm}px`,
              }}
            >
              <Check size={12} color={palette.success[600]} strokeWidth={3} />
              <span style={{ fontFamily: typography.fontFamily, fontSize: 10, fontWeight: typography.weights.semibold, color: palette.success[700], textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Unlocked
              </span>
            </div>
          </div>
          <p style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.caption, color: colors.textSecondary, margin: 0, marginBottom: 2 }}>
            {desc}
          </p>
          <span style={{ fontFamily: typography.fontFamily, fontSize: 11, color: colors.textMuted }}>
            {dateStr}
          </span>
        </div>
      </div>
    );
  }

  // Locked card
  const progress = Math.min(100, (currentStreak / milestone.days) * 100);

  return (
    <div
      style={{
        backgroundColor: colors.surface,
        borderRadius: radii.lg,
        padding: spacing.lg,
        border: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: spacing.md,
        opacity: 0.85,
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 56, height: 56, borderRadius: '50%',
          backgroundColor: colors.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Lock size={24} color={colors.textMuted} />
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: 2 }}>
          <span style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.title, fontWeight: typography.weights.bold, color: colors.textSecondary }}>
            {milestone.days} {milestone.days === 1 ? 'day' : 'days'}
          </span>
          <span style={{ fontFamily: typography.fontFamily, fontSize: 10, fontWeight: typography.weights.semibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Locked
          </span>
        </div>
        <p style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.caption, color: colors.textSecondary, margin: 0, marginBottom: spacing.sm }}>
          {desc}
        </p>
        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <div style={{ flex: 1, height: 5, backgroundColor: colors.bg, borderRadius: radii.full, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                backgroundColor: colors.textMuted,
                borderRadius: radii.full,
              }}
            />
          </div>
          <span style={{ fontFamily: typography.fontFamily, fontSize: 10, color: colors.textMuted, fontWeight: typography.weights.medium }}>
            {currentStreak}/{milestone.days}
          </span>
        </div>
      </div>
    </div>
  );
}
