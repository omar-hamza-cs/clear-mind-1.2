// ─────────────────────────────────────────────────────────────
// ClearMind — Animated Breathing Circle
// SVG circle that scales smoothly through inhale/hold/exhale phases.
// ─────────────────────────────────────────────────────────────

import { useEffect, useState, useRef } from 'react';
import { useTheme } from '@/context/ThemeProvider';
import { typography, spacing, palette } from '@/constants/theme';
import { BREATHING_PHASES, BREATHING_TOTAL_SECONDS } from '@/constants/craving';
import { triggerHaptic } from '@/lib/haptics';

type Phase = 'inhale' | 'hold' | 'exhale';

interface BreathingCircleProps {
  onComplete: () => void;
  onExit: () => void;
}

export function BreathingCircle({ onComplete, onExit }: BreathingCircleProps) {
  const { colors } = useTheme();
  const [elapsed, setElapsed] = useState(0);
  const [phase, setPhase] = useState<Phase>('inhale');
  const [scale, setScale] = useState(0.5);
  const lastPhaseRef = useRef<Phase>('inhale');

  useEffect(() => {
    const startTime = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const totalElapsed = (now - startTime) / 1000;

      if (totalElapsed >= BREATHING_TOTAL_SECONDS) {
        setElapsed(BREATHING_TOTAL_SECONDS);
        triggerHaptic('success');
        onComplete();
        return;
      }

      setElapsed(totalElapsed);

      // Determine current phase within the cycle
      const cycleTime = totalElapsed % (
        BREATHING_PHASES.inhale.duration +
        BREATHING_PHASES.hold.duration +
        BREATHING_PHASES.exhale.duration
      );

      let newPhase: Phase;
      let newScale: number;

      if (cycleTime < BREATHING_PHASES.inhale.duration) {
        newPhase = 'inhale';
        const t = cycleTime / BREATHING_PHASES.inhale.duration;
        newScale = 0.5 + 0.5 * easeInOut(t);
      } else if (cycleTime < BREATHING_PHASES.inhale.duration + BREATHING_PHASES.hold.duration) {
        newPhase = 'hold';
        newScale = 1.0;
      } else {
        newPhase = 'exhale';
        const t = (cycleTime - BREATHING_PHASES.inhale.duration - BREATHING_PHASES.hold.duration) / BREATHING_PHASES.exhale.duration;
        newScale = 1.0 - 0.5 * easeInOut(t);
      }

      if (newPhase !== lastPhaseRef.current) {
        lastPhaseRef.current = newPhase;
        setPhase(newPhase);
        triggerHaptic('light');
      }

      setScale(newScale);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onComplete]);

  const remaining = Math.ceil(BREATHING_TOTAL_SECONDS - elapsed);
  const progress = elapsed / BREATHING_TOTAL_SECONDS;

  const phaseLabel = BREATHING_PHASES[phase].label;
  const phaseColor =
    phase === 'inhale' ? palette.primary[400] :
    phase === 'hold' ? palette.accent[400] :
    palette.secondary[400];

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

      {/* Timer */}
      <div
        style={{
          position: 'absolute',
          top: spacing.xl,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: typography.fontFamily,
          fontSize: typography.sizes.title,
          fontWeight: typography.weights.semibold,
          color: colors.textSecondary,
        }}
      >
        {remaining}s
      </div>

      {/* Breathing circle */}
      <div
        style={{
          position: 'relative',
          width: 280,
          height: 280,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Outer glow rings */}
        <div
          style={{
            position: 'absolute',
            width: 280,
            height: 280,
            borderRadius: '50%',
            backgroundColor: phaseColor,
            opacity: 0.08,
            transform: `scale(${scale * 1.15})`,
            transition: 'transform 0.1s linear, background-color 0.5s ease',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 240,
            height: 240,
            borderRadius: '50%',
            backgroundColor: phaseColor,
            opacity: 0.12,
            transform: `scale(${scale * 1.08})`,
            transition: 'transform 0.1s linear, background-color 0.5s ease',
          }}
        />

        {/* Main circle */}
        <div
          style={{
            width: 200,
            height: 200,
            borderRadius: '50%',
            backgroundColor: phaseColor,
            opacity: 0.25,
            transform: `scale(${scale})`,
            transition: 'transform 0.1s linear, background-color 0.5s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />

        {/* Phase label */}
        <div
          style={{
            position: 'absolute',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: typography.fontFamily,
              fontSize: typography.sizes.title,
              fontWeight: typography.weights.bold,
              color: phaseColor,
              transition: 'color 0.5s ease',
            }}
          >
            {phaseLabel}
          </div>
          <div
            style={{
              fontFamily: typography.fontFamily,
              fontSize: typography.sizes.caption,
              color: colors.textSecondary,
              marginTop: spacing.xs,
            }}
          >
            {phase === 'inhale' && `for ${BREATHING_PHASES.inhale.duration}s`}
            {phase === 'hold' && `for ${BREATHING_PHASES.hold.duration}s`}
            {phase === 'exhale' && `for ${BREATHING_PHASES.exhale.duration}s`}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          marginTop: spacing.xxl,
          width: 240,
          height: 4,
          borderRadius: 2,
          backgroundColor: colors.border,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: '100%',
            backgroundColor: palette.primary[400],
            transition: 'width 0.1s linear',
          }}
        />
      </div>

      <p
        style={{
          marginTop: spacing.lg,
          fontFamily: typography.fontFamily,
          fontSize: typography.sizes.caption,
          color: colors.textMuted,
          textAlign: 'center',
          maxWidth: 320,
          lineHeight: typography.lineHeights.body,
        }}
      >
        Follow the circle. Let the craving pass like a wave.
      </p>
    </div>
  );
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
