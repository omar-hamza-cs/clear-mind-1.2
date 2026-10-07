// ─────────────────────────────────────────────────────────────
// ClearMind — Home Dashboard Screen
// app/(tabs)/index.tsx
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { Wallet, Flame, Shield, Trophy, Zap, BookOpen, SquareCheck as CheckSquare, Sparkles, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, ArrowRight, Wind } from 'lucide-react';
import { useStore } from '@/store';
import { useTheme } from '@/context/ThemeProvider';
import { useTab } from '@/context/Navigation';
import { typography, spacing, radii, palette, shadows } from '@/constants/theme';
import {
  getCurrentStreakDays,
  getLongestStreak,
  getTotalCravingsResisted,
  getMoneySaved,
  getGoalProgressPercent,
  isForeverGoal,
  getGreeting,
  getTodayISODate,
  formatMoneyDetailed,
} from '@/lib/stats';
import { getDailyQuote } from '@/lib/quotes';
import { ProgressRing } from '@/components/dashboard/ProgressRing';
import { LiveStreak } from '@/components/dashboard/LiveStreak';
import { MilestoneCelebration } from '@/components/MilestoneCelebration';
import type { Milestone } from '@/types';

export function HomeScreen({ onOpenCraving, onOpenCheckIn }: { onOpenCraving: () => void; onOpenCheckIn: () => void }) {
  const { colors } = useTheme();
  const { setActiveTab } = useTab();

  const profile = useStore((s) => s.profile);
  const streakHistory = useStore((s) => s.streakHistory);
  const cravings = useStore((s) => s.cravings);
  const checkIns = useStore((s) => s.checkIns);
  const checkMilestones = useStore((s) => s.checkMilestones);
  const [celebrationMilestone, setCelebrationMilestone] = useState<Milestone | null>(null);

  // Check milestones on mount and every time the home screen renders
  useEffect(() => {
    if (!profile) return;
    const streak = getCurrentStreakDays(profile.lastUseAt);
    const newlyUnlocked = checkMilestones(streak);
    if (newlyUnlocked.length > 0) {
      // Celebrate the highest newly unlocked milestone
      const highest = newlyUnlocked.reduce((max, m) => (m.days > max.days ? m : max), newlyUnlocked[0]);
      setCelebrationMilestone(highest);
    }
  }, [profile, checkMilestones]);

  if (!profile) return null;

  const now = Date.now();
  const currentStreak = getCurrentStreakDays(profile.lastUseAt, now);
  const longestStreak = getLongestStreak(streakHistory, currentStreak);
  const cravingsResisted = getTotalCravingsResisted(cravings);
  const moneySaved = getMoneySaved(profile, streakHistory, now);
  const foreverGoal = isForeverGoal(profile.goal);
  const goalPercent = getGoalProgressPercent(currentStreak, profile.goal);
  const greeting = getGreeting();
  const quote = getDailyQuote();
  const todayKey = getTodayISODate();
  const todaysCheckIn = checkIns[todayKey];
  const hasCheckedInToday = !!todaysCheckIn;

  const dailyRate = profile.spending;

  // ── Quick action buttons ──
  const quickActions = [
    {
      icon: Wind,
      label: 'Craving',
      desc: 'Get support now',
      color: palette.accent[400],
      bgColor: palette.accent[50],
      action: 'craving' as const,
    },
    {
      icon: CheckSquare,
      label: 'Check In',
      desc: 'How are you today?',
      color: palette.primary[600],
      bgColor: palette.primary[100],
      action: 'checkin' as const,
    },
    {
      icon: BookOpen,
      label: 'Journal',
      desc: 'Write a reflection',
      color: palette.secondary[600],
      bgColor: palette.secondary[100],
      action: 'tab' as const,
      tab: 'journal' as const,
    },
  ];

  // ── Quick stats ──
  const stats = [
    {
      icon: Flame,
      label: 'Clean days',
      value: String(currentStreak),
      color: palette.accent[400],
    },
    {
      icon: Shield,
      label: 'Cravings resisted',
      value: String(cravingsResisted),
      color: palette.primary[600],
    },
    {
      icon: Trophy,
      label: 'Longest streak',
      value: `${longestStreak}d`,
      color: palette.accent[500],
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.bg,
        paddingBottom: 100,
      }}
    >
      <div style={{ maxWidth: 560, margin: '0 auto', padding: `${spacing.xl}px ${spacing.xl}px` }}>
        {/* ── Greeting ── */}
        <div style={{ marginBottom: spacing.xl }}>
          <p
            style={{
              fontFamily: typography.fontFamily,
              fontSize: typography.sizes.body,
              color: colors.textSecondary,
              margin: 0,
            }}
          >
            {greeting}
          </p>
          <h1
            style={{
              fontFamily: typography.fontFamily,
              fontSize: typography.sizes.display,
              fontWeight: typography.weights.bold,
              color: colors.text,
              margin: 0,
              letterSpacing: '-0.02em',
              lineHeight: typography.lineHeights.heading,
            }}
          >
            {profile.reasons.length > 0
              ? 'Stay focused'
              : 'One day at a time'}
          </h1>
        </div>

        {/* ── Hero: Progress Ring + Live Streak ── */}
        <div
          className="cm-stagger-1"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: `${spacing.xxl}px ${spacing.xl}px`,
            marginBottom: spacing.lg,
            backgroundColor: colors.surface,
            borderRadius: radii.xl,
            border: `1px solid ${colors.border}`,
            boxShadow: shadows.md,
          }}
        >
          <ProgressRing percent={foreverGoal ? null : goalPercent} size={240} strokeWidth={16}>
            <LiveStreak lastUseAt={profile.lastUseAt} isForever={foreverGoal} />

            {foreverGoal ? (
              <div
                style={{
                  marginTop: spacing.sm,
                  fontFamily: typography.fontFamily,
                  fontSize: typography.sizes.caption,
                  fontWeight: typography.weights.medium,
                  color: palette.primary[600],
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.xs,
                }}
              >
                <Sparkles size={14} />
                Growing every day
              </div>
            ) : (
              <div
                style={{
                  marginTop: spacing.sm,
                  fontFamily: typography.fontFamily,
                  fontSize: typography.sizes.caption,
                  fontWeight: typography.weights.semibold,
                  color: goalPercent !== null && goalPercent >= 100 ? palette.success[500] : colors.textSecondary,
                }}
              >
                {goalPercent !== null && goalPercent >= 100
                  ? 'Goal achieved!'
                  : `${Math.round(goalPercent ?? 0)}% to your goal`}
              </div>
            )}
          </ProgressRing>

          <div
            style={{
              marginTop: spacing.lg,
              padding: `${spacing.xs}px ${spacing.lg}px`,
              backgroundColor: colors.bg,
              borderRadius: radii.full,
              fontFamily: typography.fontFamily,
              fontSize: typography.sizes.caption,
              color: colors.textSecondary,
              fontWeight: typography.weights.medium,
            }}
          >
            Goal: {profile.goal}
          </div>
        </div>

        {/* ── Money Saved ── */}
        <div
          className="cm-stagger-2"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.lg,
            padding: spacing.xl,
            marginBottom: spacing.lg,
            backgroundColor: palette.primary[100],
            borderRadius: radii.lg,
            border: `1px solid ${palette.primary[200]}`,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: radii.md,
              backgroundColor: palette.primary[200],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Wallet size={24} color={palette.primary[700]} strokeWidth={2} />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: typography.fontFamily,
                fontSize: typography.sizes.caption,
                color: palette.primary[700],
                fontWeight: typography.weights.medium,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Money saved
            </div>
            <div
              style={{
                fontFamily: typography.fontFamily,
                fontSize: 28,
                fontWeight: typography.weights.bold,
                color: palette.primary[900],
                lineHeight: 1.1,
              }}
            >
              {formatMoneyDetailed(moneySaved, profile.spending.currency)}
            </div>
            <div
              style={{
                fontFamily: typography.fontFamily,
                fontSize: typography.sizes.caption,
                color: palette.primary[600],
              }}
            >
              ~{formatMoneyDetailed(dailyRate.amount, dailyRate.currency)} / {dailyRate.period}
            </div>
          </div>
        </div>

        {/* ── Quick Stats ── */}
        <div
          className="cm-stagger-3"
          style={{
            display: 'flex',
            gap: spacing.sm,
            marginBottom: spacing.lg,
          }}
        >
          {stats.map(({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: radii.lg,
                padding: spacing.lg,
                border: `1px solid ${colors.border}`,
                display: 'flex',
                flexDirection: 'column',
                gap: spacing.xs,
              }}
            >
              <Icon size={20} color={color} strokeWidth={2} />
              <div
                style={{
                  fontFamily: typography.fontFamily,
                  fontSize: typography.sizes.title,
                  fontWeight: typography.weights.bold,
                  color: colors.text,
                  lineHeight: 1,
                }}
              >
                {value}
              </div>
              <div
                style={{
                  fontFamily: typography.fontFamily,
                  fontSize: 11,
                  color: colors.textSecondary,
                  lineHeight: 1.3,
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Daily Motivation ── */}
        <div
          className="cm-stagger-4"
          style={{
            padding: spacing.xl,
            marginBottom: spacing.lg,
            backgroundColor: colors.surface,
            borderRadius: radii.lg,
            border: `1px solid ${colors.border}`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -12,
              right: -12,
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: palette.primary[100],
              opacity: 0.5,
            }}
          />
          <div style={{ position: 'relative' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.xs,
                marginBottom: spacing.sm,
              }}
            >
              <Sparkles size={16} color={palette.primary[600]} />
              <span
                style={{
                  fontFamily: typography.fontFamily,
                  fontSize: typography.sizes.caption,
                  color: palette.primary[600],
                  fontWeight: typography.weights.semibold,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Daily motivation
              </span>
            </div>
            <p
              style={{
                fontFamily: typography.fontFamily,
                fontSize: typography.sizes.body,
                color: colors.text,
                margin: 0,
                lineHeight: typography.lineHeights.body,
                fontStyle: 'italic',
                marginBottom: spacing.xs,
              }}
            >
              "{quote.text}"
            </p>
            <p
              style={{
                fontFamily: typography.fontFamily,
                fontSize: typography.sizes.caption,
                color: colors.textMuted,
                margin: 0,
              }}
            >
              {'\u2014 '}{quote.author}
            </p>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div
          className="cm-stagger-5"
          style={{ marginBottom: spacing.lg }}
        >
          <div
            style={{
              display: 'flex',
              gap: spacing.sm,
            }}
          >
            {quickActions.map(({ icon: Icon, label, desc, color, bgColor, action, tab }) => (
              <button
                key={label}
                onClick={() => action === 'craving' ? onOpenCraving() : action === 'checkin' ? onOpenCheckIn() : setActiveTab(tab)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: spacing.sm,
                  padding: spacing.lg,
                  backgroundColor: bgColor,
                  border: 'none',
                  borderRadius: radii.lg,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'transform 0.1s ease, opacity 0.2s ease',
                  minHeight: 100,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <Icon size={22} color={color} strokeWidth={2.2} />
                <div>
                  <div
                    style={{
                      fontFamily: typography.fontFamily,
                      fontSize: typography.sizes.body,
                      fontWeight: typography.weights.semibold,
                      color: color,
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontFamily: typography.fontFamily,
                      fontSize: 11,
                      color: color,
                      opacity: 0.7,
                    }}
                  >
                    {desc}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Check-in Status Card ── */}
        <div
          className="cm-stagger-6"
          style={{
            padding: spacing.xl,
            backgroundColor: colors.surface,
            borderRadius: radii.lg,
            border: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: spacing.lg,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: hasCheckedInToday ? palette.success[100] : palette.warning[100],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {hasCheckedInToday ? (
              <CheckCircle2 size={24} color={palette.success[600]} strokeWidth={2} />
            ) : (
              <AlertCircle size={24} color={palette.warning[600]} strokeWidth={2} />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: typography.fontFamily,
                fontSize: typography.sizes.body,
                fontWeight: typography.weights.semibold,
                color: colors.text,
              }}
            >
              {hasCheckedInToday ? 'Checked in today' : 'No check-in yet'}
            </div>
            <div
              style={{
                fontFamily: typography.fontFamily,
                fontSize: typography.sizes.caption,
                color: colors.textSecondary,
              }}
            >
              {hasCheckedInToday
                ? todaysCheckIn.usedCannabis
                  ? 'Used today \u2014 be kind to yourself'
                  : `Mood: ${todaysCheckIn.mood}/5 \u00B7 Craving: ${todaysCheckIn.craving}/10`
                : 'Take a moment to reflect on your day'}
            </div>
          </div>
          {!hasCheckedInToday && (
            <button
              onClick={() => onOpenCheckIn()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.xs,
                fontFamily: typography.fontFamily,
                fontSize: typography.sizes.caption,
                fontWeight: typography.weights.semibold,
                color: palette.accent[400],
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Check in
              <ArrowRight size={14} />
            </button>
          )}
        </div>

        {/* ── Relapse info (subtle, non-judgmental) ── */}
        {profile.relapseCount > 0 && (
          <div
            style={{
              marginTop: spacing.lg,
              padding: `${spacing.md}px ${spacing.lg}px`,
              fontFamily: typography.fontFamily,
              fontSize: typography.sizes.caption,
              color: colors.textMuted,
              textAlign: 'center',
            }}
          >
            {profile.relapseCount} {profile.relapseCount === 1 ? 'reset' : 'resets'} on your journey {'\u2014'} every day forward counts
          </div>
        )}
      </div>

      {/* ── Milestone Celebration ── */}
      {celebrationMilestone && (
        <MilestoneCelebration
          milestone={celebrationMilestone}
          onClose={() => setCelebrationMilestone(null)}
        />
      )}
    </div>
  );
}
