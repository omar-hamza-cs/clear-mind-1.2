// ─────────────────────────────────────────────────────────────
// ClearMind — Distraction Timer
// 10-minute countdown with rotating activities every 60s.
// ─────────────────────────────────────────────────────────────

import { useEffect, useState, useRef } from 'react';
import { useTheme } from '@/context/ThemeProvider';
import { typography, spacing, radii, palette } from '@/constants/theme';
import { DISTRACTION_ACTIVITIES, DISTRACTION_TOTAL_SECONDS } from '@/constants/craving';
import { triggerHaptic } from '@/lib/haptics';

interface DistractionTimerProps {
  onComplete: () => void;
  onExit: () => void;
}

export function DistractionTimer({ onComplete, onExit }: DistractionTimerProps) {
  const { colors } = useTheme();
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef<number>(0);

  const activityIndex = Math.min(
    Math.floor(elapsed / 60),
    DISTRACTION_ACTIVITIES.length - 1
  );
  const currentActivity = DISTRACTION_ACTIVITIES[activityIndex];
  const activityElapsed = elapsed - activityIndex * 60;
  const activityProgress = Math.min(1, activityElapsed / 60);

  useEffect(() => {
    const startTime = performance.now();
    startTimeRef.current = startTime;
    let raf: number;

    const tick = (now: number) => {
      const totalElapsed = (now - startTime) / 1000;

      if (totalElapsed >= DISTRACTION_TOTAL_SECONDS) {
        setElapsed(DISTRACTION_TOTAL_SECONDS);
        triggerHaptic('success');
        onComplete();
        return;
      }

      const prevIndex = Math.floor(elapsed / 60);
      const newIndex = Math.floor(totalElapsed / 60);
      if (newIndex !== prevIndex) {
        triggerHaptic('medium');
      }

      setElapsed(totalElapsed);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onComplete]);

  const remaining = DISTRACTION_TOTAL_SECONDS - elapsed;
  const mins = Math.floor(remaining / 60);
  const secs = Math.floor(remaining % 60);
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const totalProgress = elapsed / DISTRACTION_TOTAL_SECONDS;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: colors.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
        zIndex: 1000,
      }}
    >
      {/* Close button */}
      <button
        onClick={onExit}
        style={{
          position: 'absolute',
          top: spacing.xl,
          right: spacing.xl,
          fontFamily: typography.fontFamily,
          fontSize: typography.sizes.caption,
          color: colors.textMuted,
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: spacing.sm,
        }}
      >
        Skip
      </button>

      {/* Total timer */}
      <div
        style={{
          fontFamily: typography.fontFamily,
          fontSize: 48,
          fontWeight: typography.weights.bold,
          color: colors.text,
          marginBottom: spacing.xs,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.02em',
        }}
      >
        {timeStr}
      </div>
      <p
        style={{
          fontFamily: typography.fontFamily,
          fontSize: typography.sizes.caption,
          color: colors.textMuted,
          margin: 0,
          marginBottom: spacing.xxl,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        Time remaining
      </p>

      {/* Total progress bar */}
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          height: 4,
          borderRadius: 2,
          backgroundColor: colors.border,
          overflow: 'hidden',
          marginBottom: spacing.xxl,
        }}
      >
        <div
          style={{
            width: `${totalProgress * 100}%`,
            height: '100%',
            backgroundColor: palette.primary[400],
            transition: 'width 0.1s linear',
          }}
        />
      </div>

      {/* Activity card */}
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          backgroundColor: colors.surface,
          borderRadius: radii.xl,
          padding: spacing.xxl,
          border: `1px solid ${colors.border}`,
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          textAlign: 'center',
          animation: 'cm-fade-in 0.5s ease both',
        }}
        key={activityIndex}
      >
        <div
          style={{
            display: 'inline-block',
            padding: `${spacing.xs}px ${spacing.md}px`,
            backgroundColor: palette.primary[100],
            borderRadius: radii.full,
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.caption,
            fontWeight: typography.weights.semibold,
            color: palette.primary[600],
            marginBottom: spacing.lg,
          }}
        >
          Activity {activityIndex + 1} of {DISTRACTION_ACTIVITIES.length}
        </div>

        <h2
          style={{
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.title,
            fontWeight: typography.weights.bold,
            color: colors.text,
            margin: 0,
            marginBottom: spacing.md,
          }}
        >
          {currentActivity.title}
        </h2>
        <p
          style={{
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.body,
            color: colors.textSecondary,
            margin: 0,
            lineHeight: typography.lineHeights.body,
            marginBottom: spacing.lg,
          }}
        >
          {currentActivity.instruction}
        </p>

        {/* Activity progress */}
        <div
          style={{
            width: '100%',
            height: 3,
            borderRadius: 2,
            backgroundColor: colors.border,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${activityProgress * 100}%`,
              height: '100%',
              backgroundColor: palette.accent[400],
              transition: 'width 0.1s linear',
            }}
          />
        </div>
        <p
          style={{
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.caption,
            color: colors.textMuted,
            margin: 0,
            marginTop: spacing.sm,
          }}
        >
          {Math.ceil(60 - activityElapsed)}s left for this activity
        </p>
      </div>
    </div>
  );
}
