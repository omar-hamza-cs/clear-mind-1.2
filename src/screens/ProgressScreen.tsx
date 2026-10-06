// ─────────────────────────────────────────────────────────────
// ClearMind — Progress Screen
// app/(tabs)/progress.tsx
//
// Stat cards + SVG charts (craving, mood, money over time).
// Every chart and stat has a thoughtful empty state.
// ─────────────────────────────────────────────────────────────

import { useMemo, useState, useCallback } from 'react';
import {
  Flame,
  Trophy,
  Calendar,
  Wallet,
  Shield,
  Wind,
  RefreshCw,
  TrendingUp,
  Smile,
  LineChart as LineChartIcon,
} from 'lucide-react';
import { useStore } from '@/store';
import { useTheme } from '@/context/ThemeProvider';
import { typography, spacing, radii, palette } from '@/constants/theme';
import {
  getCurrentStreakDays,
  getLongestStreak,
  getTotalCravingsResisted,
  getMoneySaved,
  getTotalCleanSeconds,
  formatMoneyDetailed,
} from '@/lib/stats';
import { LineChart, AreaChart, type ChartPoint } from '@/components/progress/Charts';
import { EmptyState } from '@/components/progress/EmptyState';
import { CalendarGrid, type DayMarkers } from '@/components/progress/CalendarGrid';
import { DayDetailModal } from '@/components/progress/DayDetailModal';
import { AchievementsScreen } from '@/screens/AchievementsScreen';

function toDateKeyFromDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function ProgressScreen() {
  const { colors } = useTheme();
  const profile = useStore((s) => s.profile);
  const streakHistory = useStore((s) => s.streakHistory);
  const cravings = useStore((s) => s.cravings);
  const checkIns = useStore((s) => s.checkIns);

  const now = Date.now();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAchievements, setShowAchievements] = useState(false);

  const currentStreak = profile ? getCurrentStreakDays(profile.lastUseAt, now) : 0;
  const longestStreak = profile ? getLongestStreak(streakHistory, currentStreak) : 0;
  const totalCleanSeconds = profile ? getTotalCleanSeconds(streakHistory, profile.lastUseAt, now) : 0;
  const totalCleanDays = Math.floor(totalCleanSeconds / 86400);
  const cravingsResisted = getTotalCravingsResisted(cravings);
  const totalCravings = cravings.length;
  const moneySaved = profile ? getMoneySaved(profile, streakHistory, now) : 0;
  const relapseCount = profile?.relapseCount ?? 0;

  // ── Chart data: Craving intensity over time ──
  const cravingData = useMemo<ChartPoint[]>(() => {
    if (cravings.length === 0) return [];
    return cravings.slice(-15).map((c) => {
      const d = new Date(c.timestamp);
      return {
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        value: c.postIntensity,
      };
    });
  }, [cravings]);

  // ── Chart data: Mood over time (from check-ins) ──
  const moodData = useMemo<ChartPoint[]>(() => {
    const dates = Object.keys(checkIns).sort();
    if (dates.length === 0) return [];
    return dates.slice(-15).map((date) => ({
      label: new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
      value: checkIns[date].mood,
    }));
  }, [checkIns]);

  // ── Chart data: Money saved over time (cumulative from check-in dates) ──
  const moneyData = useMemo<ChartPoint[]>(() => {
    if (!profile) return [];
    const rate = profile.spending.amount / (profile.spending.period === 'daily' ? 1 : profile.spending.period === 'weekly' ? 7 : 30.4375);
    if (rate <= 0) return [];

    // Build cumulative money saved at each streak interval + current
    const allStreaks = [
      ...streakHistory.map((s) => ({ start: s.startDate, end: s.endDate })),
      { start: profile.lastUseAt, end: now },
    ].sort((a, b) => a.start - b.start);

    const points: ChartPoint[] = [];
    let cumulativeDays = 0;

    for (const streak of allStreaks) {
      const days = (streak.end - streak.start) / 86400000;
      cumulativeDays += days;
      const d = new Date(streak.end);
      points.push({
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        value: Math.round(cumulativeDays * rate),
      });
    }

    // If only one point, add the start point for a line
    if (points.length === 1) {
      points.unshift({
        label: `${new Date(allStreaks[0].start).getMonth() + 1}/${new Date(allStreaks[0].start).getDate()}`,
        value: 0,
      });
    }

    return points.slice(-15);
  }, [profile, streakHistory, now]);

  // ── Stat cards ──
  const statCards = [
    {
      icon: Flame,
      label: 'Current streak',
      value: `${currentStreak}d`,
      color: palette.accent[400],
      bgColor: palette.accent[50],
    },
    {
      icon: Trophy,
      label: 'Longest streak',
      value: `${longestStreak}d`,
      color: palette.accent[500],
      bgColor: palette.accent[100],
    },
    {
      icon: Calendar,
      label: 'Total clean days',
      value: `${totalCleanDays}d`,
      color: palette.primary[600],
      bgColor: palette.primary[100],
    },
    {
      icon: Wallet,
      label: 'Money saved',
      value: formatMoneyDetailed(moneySaved, profile?.spending.currency ?? 'USD'),
      color: palette.secondary[600],
      bgColor: palette.secondary[100],
    },
    {
      icon: Shield,
      label: 'Cravings resisted',
      value: String(cravingsResisted),
      color: palette.primary[600],
      bgColor: palette.primary[100],
    },
    {
      icon: Wind,
      label: 'Total cravings',
      value: String(totalCravings),
      color: palette.secondary[500],
      bgColor: palette.secondary[100],
    },
    {
      icon: RefreshCw,
      label: 'Relapses',
      value: String(relapseCount),
      color: palette.warning[700],
      bgColor: palette.warning[100],
    },
  ];

  // ── Calendar markers ──
  const calendarMarkers = useMemo<DayMarkers>(() => {
    const markers: DayMarkers = {};

    // Mark clean days: every day from lastUseAt to today, plus all historical streak days
    if (profile) {
      // Current streak
      const start = new Date(profile.lastUseAt);
      start.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
        const key = toDateKeyFromDate(d);
        if (!markers[key]) markers[key] = { clean: false, relapse: false, checkIn: false };
        markers[key].clean = true;
      }

      // Historical streaks
      for (const s of streakHistory) {
        const sStart = new Date(s.startDate);
        sStart.setHours(0, 0, 0, 0);
        const sEnd = new Date(s.endDate);
        sEnd.setHours(0, 0, 0, 0);
        for (let d = new Date(sStart); d <= sEnd; d.setDate(d.getDate() + 1)) {
          const key = toDateKeyFromDate(d);
          if (!markers[key]) markers[key] = { clean: false, relapse: false, checkIn: false };
          markers[key].clean = true;
        }
      }
    }

    // Mark relapse days: the end date of each historical streak (the day they relapsed)
    for (const s of streakHistory) {
      const endDay = new Date(s.endDate);
      endDay.setHours(0, 0, 0, 0);
      const key = toDateKeyFromDate(endDay);
      if (!markers[key]) markers[key] = { clean: false, relapse: false, checkIn: false };
      markers[key].relapse = true;
      // A relapse day is NOT a clean day
      markers[key].clean = false;
    }

    // Mark check-in days
    for (const date of Object.keys(checkIns)) {
      if (!markers[date]) markers[date] = { clean: false, relapse: false, checkIn: false };
      markers[date].checkIn = true;
    }

    return markers;
  }, [profile, streakHistory, checkIns]);

  const handleDayPress = useCallback((dateKey: string) => {
    setSelectedDate(dateKey);
  }, []);

  const handleCloseDayDetail = useCallback(() => {
    setSelectedDate(null);
  }, []);

  const handleCloseAchievements = useCallback(() => {
    setShowAchievements(false);
  }, []);

  if (!profile) return null;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.bg,
        paddingBottom: 100,
      }}
    >
      <div style={{ maxWidth: 600, margin: '0 auto', padding: `${spacing.xl}px ${spacing.xl}px` }}>
        {/* Header */}
        <h1
          style={{
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.display,
            fontWeight: typography.weights.bold,
            color: colors.text,
            margin: 0,
            marginBottom: spacing.xs,
            letterSpacing: '-0.02em',
          }}
        >
          Progress
        </h1>
        <p
          style={{
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.body,
            color: colors.textSecondary,
            margin: 0,
            marginBottom: spacing.xl,
          }}
        >
          Your journey at a glance.
        </p>

        {/* ── Stat Cards Grid ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: spacing.sm,
            marginBottom: spacing.xxl,
          }}
        >
          {statCards.map(({ icon: Icon, label, value, color, bgColor }) => (
            <div
              key={label}
              style={{
                backgroundColor: colors.surface,
                borderRadius: radii.lg,
                padding: spacing.lg,
                border: `1px solid ${colors.border}`,
                display: 'flex',
                flexDirection: 'column',
                gap: spacing.sm,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: radii.sm,
                  backgroundColor: bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={18} color={color} strokeWidth={2} />
              </div>
              <div>
                <div
                  style={{
                    fontFamily: typography.fontFamily,
                    fontSize: typography.sizes.title,
                    fontWeight: typography.weights.bold,
                    color: colors.text,
                    lineHeight: 1.1,
                  }}
                >
                  {value}
                </div>
                <div
                  style={{
                    fontFamily: typography.fontFamily,
                    fontSize: 11,
                    color: colors.textSecondary,
                    marginTop: 2,
                  }}
                >
                  {label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Calendar ── */}
        <h2
          style={{
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.title,
            fontWeight: typography.weights.semibold,
            color: colors.text,
            margin: 0,
            marginBottom: spacing.md,
          }}
        >
          Calendar
        </h2>
        <div style={{ marginBottom: spacing.xxl }}>
          <CalendarGrid
            markers={calendarMarkers}
            onDayPress={handleDayPress}
            quitDate={profile.quitDate}
          />
        </div>

        {/* ── Charts Section ── */}
        <h2
          style={{
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.title,
            fontWeight: typography.weights.semibold,
            color: colors.text,
            margin: 0,
            marginBottom: spacing.md,
          }}
        >
          Trends
        </h2>

        {/* Craving intensity over time */}
        <div
          style={{
            backgroundColor: colors.surface,
            borderRadius: radii.lg,
            padding: spacing.lg,
            border: `1px solid ${colors.border}`,
            marginBottom: spacing.md,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm,
              marginBottom: spacing.md,
            }}
          >
            <TrendingUp size={18} color={palette.accent[400]} />
            <span
              style={{
                fontFamily: typography.fontFamily,
                fontSize: typography.sizes.body,
                fontWeight: typography.weights.semibold,
                color: colors.text,
              }}
            >
              Craving intensity over time
            </span>
          </div>
          {cravingData.length >= 2 ? (
            <>
              <LineChart
                data={cravingData}
                color={palette.accent[400]}
                min={1}
                max={10}
                yLabels={['10', '5', '1']}
              />
              <p
                style={{
                  fontFamily: typography.fontFamily,
                  fontSize: typography.sizes.caption,
                  color: colors.textMuted,
                  margin: 0,
                  marginTop: spacing.sm,
                }}
              >
                Post-session craving intensity (1-10) for your last {cravingData.length} craving sessions.
              </p>
            </>
          ) : cravingData.length === 1 ? (
            <>
              <LineChart data={cravingData} color={palette.accent[400]} min={1} max={10} yLabels={['10', '5', '1']} />
              <p
                style={{
                  fontFamily: typography.fontFamily,
                  fontSize: typography.sizes.caption,
                  color: colors.textMuted,
                  margin: 0,
                  marginTop: spacing.sm,
                }}
              >
                One session so far. Use the craving tool again to see your trend over time.
              </p>
            </>
          ) : (
            <EmptyState
              icon={<TrendingUp size={24} color={colors.textMuted} />}
              title="No craving data yet"
              message="When you use the craving tool, your intensity levels will appear here as a trend line."
            />
          )}
        </div>

        {/* Mood over time */}
        <div
          style={{
            backgroundColor: colors.surface,
            borderRadius: radii.lg,
            padding: spacing.lg,
            border: `1px solid ${colors.border}`,
            marginBottom: spacing.md,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm,
              marginBottom: spacing.md,
            }}
          >
            <Smile size={18} color={palette.primary[400]} />
            <span
              style={{
                fontFamily: typography.fontFamily,
                fontSize: typography.sizes.body,
                fontWeight: typography.weights.semibold,
                color: colors.text,
              }}
            >
              Mood over time
            </span>
          </div>
          {moodData.length >= 2 ? (
            <>
              <LineChart
                data={moodData}
                color={palette.primary[400]}
                min={1}
                max={5}
                yLabels={['5', '3', '1']}
              />
              <p
                style={{
                  fontFamily: typography.fontFamily,
                  fontSize: typography.sizes.caption,
                  color: colors.textMuted,
                  margin: 0,
                  marginTop: spacing.sm,
                }}
              >
                Daily mood (1-5) from your last {moodData.length} check-ins.
              </p>
            </>
          ) : moodData.length === 1 ? (
            <>
              <LineChart data={moodData} color={palette.primary[400]} min={1} max={5} yLabels={['5', '3', '1']} />
              <p
                style={{
                  fontFamily: typography.fontFamily,
                  fontSize: typography.sizes.caption,
                  color: colors.textMuted,
                  margin: 0,
                  marginTop: spacing.sm,
                }}
              >
                One check-in so far. Keep checking in daily to see your mood trend.
              </p>
            </>
          ) : (
            <EmptyState
              icon={<Smile size={24} color={colors.textMuted} />}
              title="No mood data yet"
              message="Your daily check-ins will chart your mood over time here. Check in to get started."
            />
          )}
        </div>

        {/* Money saved over time */}
        <div
          style={{
            backgroundColor: colors.surface,
            borderRadius: radii.lg,
            padding: spacing.lg,
            border: `1px solid ${colors.border}`,
            marginBottom: spacing.md,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm,
              marginBottom: spacing.md,
            }}
          >
            <Wallet size={18} color={palette.secondary[600]} />
            <span
              style={{
                fontFamily: typography.fontFamily,
                fontSize: typography.sizes.body,
                fontWeight: typography.weights.semibold,
                color: colors.text,
              }}
            >
              Money saved over time
            </span>
          </div>
          {moneyData.length >= 2 ? (
            <>
              <AreaChart data={moneyData} color={palette.secondary[600]} />
              <p
                style={{
                  fontFamily: typography.fontFamily,
                  fontSize: typography.sizes.caption,
                  color: colors.textMuted,
                  margin: 0,
                  marginTop: spacing.sm,
                }}
              >
                Cumulative {profile.spending.currency} saved across all clean periods.
              </p>
            </>
          ) : moneyData.length === 1 ? (
            <>
              <AreaChart data={moneyData} color={palette.secondary[600]} />
              <p
                style={{
                  fontFamily: typography.fontFamily,
                  fontSize: typography.sizes.caption,
                  color: colors.textMuted,
                  margin: 0,
                  marginTop: spacing.sm,
                }}
              >
                Your savings are growing. Check back as your streak continues.
              </p>
            </>
          ) : (
            <EmptyState
              icon={<Wallet size={24} color={colors.textMuted} />}
              title="No savings data yet"
              message="As you maintain your streak, your cumulative money saved will appear here as a growing area chart."
            />
          )}
        </div>

        {/* ── Milestones summary ── */}
        <div
          style={{
            backgroundColor: colors.surface,
            borderRadius: radii.lg,
            padding: spacing.lg,
            border: `1px solid ${colors.border}`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm,
              marginBottom: spacing.md,
            }}
          >
            <LineChartIcon size={18} color={palette.accent[500]} />
            <span
              style={{
                fontFamily: typography.fontFamily,
                fontSize: typography.sizes.body,
                fontWeight: typography.weights.semibold,
                color: colors.text,
              }}
            >
              Milestones
            </span>
          </div>
          <MilestonesList />
          <button
            onClick={() => setShowAchievements(true)}
            style={{
              width: '100%',
              marginTop: spacing.md,
              fontFamily: typography.fontFamily,
              fontSize: typography.sizes.caption,
              fontWeight: typography.weights.semibold,
              color: palette.primary[600],
              backgroundColor: 'transparent',
              border: `1px solid ${colors.border}`,
              borderRadius: radii.lg,
              padding: `${spacing.md}px ${spacing.lg}px`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.xs,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = palette.primary[100]; e.currentTarget.style.borderColor = palette.primary[600]; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = colors.border; }}
          >
            <Trophy size={16} color={palette.primary[600]} /> View all achievements
          </button>
        </div>
      </div>

      {/* ── Day Detail Modal ── */}
      {selectedDate && (
        <DayDetailModal dateKey={selectedDate} onClose={handleCloseDayDetail} />
      )}

      {/* ── Achievements Screen ── */}
      {showAchievements && (
        <AchievementsScreen onClose={handleCloseAchievements} />
      )}
    </div>
  );
}

// ─── Milestones inline list ─────────────────────────────────

function MilestonesList() {
  const { colors } = useTheme();
  const milestones = useStore((s) => s.milestones);
  const unlockedCount = milestones.filter((m) => m.unlockedAt).length;

  return (
    <>
      <p
        style={{
          fontFamily: typography.fontFamily,
          fontSize: typography.sizes.caption,
          color: colors.textSecondary,
          margin: 0,
          marginBottom: spacing.md,
        }}
      >
        {unlockedCount} of {milestones.length} unlocked
      </p>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.xs,
        }}
      >
        {milestones.map((m) => {
          const unlocked = m.unlockedAt !== null;
          return (
            <div
              key={m.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: `${spacing.sm}px ${spacing.md}px`,
                borderRadius: radii.sm,
                backgroundColor: unlocked ? palette.success[100] : colors.bg,
              }}
            >
              <span
                style={{
                  fontFamily: typography.fontFamily,
                  fontSize: typography.sizes.body,
                  fontWeight: typography.weights.medium,
                  color: unlocked ? palette.success[700] : colors.textSecondary,
                }}
              >
                {m.days} {m.days === 1 ? 'day' : 'days'}
              </span>
              <span
                style={{
                  fontFamily: typography.fontFamily,
                  fontSize: typography.sizes.caption,
                  fontWeight: typography.weights.semibold,
                  color: unlocked ? palette.success[600] : colors.textMuted,
                }}
              >
                {unlocked ? 'Unlocked' : 'Locked'}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}
