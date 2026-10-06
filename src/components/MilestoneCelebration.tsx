// ─────────────────────────────────────────────────────────────
// ClearMind — Milestone Celebration Modal
// app/milestone.tsx
//
// Triggered when a streak crosses a threshold.
// Large number, supportive message, animated confetti, haptics.
// ─────────────────────────────────────────────────────────────

import { useEffect, useState, useMemo } from 'react';
import { Trophy, X, Sparkles } from 'lucide-react';
import { useTheme } from '@/context/ThemeProvider';
import { typography, spacing, radii, palette } from '@/constants/theme';
import { triggerHaptic } from '@/lib/haptics';
import type { Milestone } from '@/types';

interface MilestoneCelebrationProps {
  milestone: Milestone;
  onClose: () => void;
}

const MILESTONE_MESSAGES: Record<number, string> = {
  1: 'Every journey begins with a single day. You did it.',
  3: 'Three days in. Your resolve is already showing.',
  7: 'A full week. This is where habits start to form.',
  14: `Two weeks. You're proving this is who you are now.`,
  30: 'One month. A milestone most people never reach.',
  60: `Two months. You've built something real.`,
  90: `90 days. You're in the top tier of people who try.`,
  180: 'Half a year. This is transformation.',
  365: `One full year. You've changed your life.`,
};

interface ConfettiPiece {
  id: number;
  x: number;
  delay: number;
  duration: number;
  color: string;
  rotation: number;
  size: number;
}

const CONFETTI_COLORS = [palette.primary[400], palette.accent[400], palette.secondary[600], palette.accent[500], palette.primary[600], palette.warning[500], palette.success[500]];

function generateConfetti(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1.5 + Math.random() * 1.5,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    rotation: Math.random() * 360,
    size: 6 + Math.random() * 8,
  }));
}

export function MilestoneCelebration({ milestone, onClose }: MilestoneCelebrationProps) {
  const { colors } = useTheme();
  const message = MILESTONE_MESSAGES[milestone.days] ?? 'Incredible progress. Keep going.';
  const confetti = useMemo(() => generateConfetti(40), []);

  // Fire haptics on mount
  useEffect(() => {
    triggerHaptic('success');
    const t = setTimeout(() => triggerHaptic('success'), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: colors.overlay,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3000,
        padding: spacing.lg,
        animation: 'cm-fade-in 0.3s ease both',
        overflow: 'hidden',
      }}
      onClick={onClose}
    >
      {/* Confetti layer */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {confetti.map((piece) => (
          <div
            key={piece.id}
            style={{
              position: 'absolute',
              left: `${piece.x}%`,
              top: '-20px',
              width: piece.size,
              height: piece.size * 0.6,
              backgroundColor: piece.color,
              borderRadius: 2,
              transform: `rotate(${piece.rotation}deg)`,
              animation: `cm-confetti-fall ${piece.duration}s ${piece.delay}s ease-in forwards`,
            }}
          />
        ))}
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.xl,
          maxWidth: 400,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          animation: 'cm-scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top gradient bar */}
        <div
          style={{
            height: 6,
            background: `linear-gradient(90deg, ${palette.primary[400]}, ${palette.accent[400]}, ${palette.secondary[600]})`,
          }}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: spacing.md,
            right: spacing.md,
            width: 32, height: 32, borderRadius: '50%',
            backgroundColor: colors.bg, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1,
          }}
        >
          <X size={18} color={colors.textSecondary} />
        </button>

        <div style={{ padding: `${spacing.xxl}px ${spacing.xl} ${spacing.xl}` }}>
          {/* Trophy icon with pulse glow */}
          <div
            style={{
              width: 80, height: 80, borderRadius: '50%',
              backgroundColor: palette.warning[100],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto', marginBottom: spacing.lg,
              animation: 'cm-milestone-glow 2s ease-in-out infinite',
            }}
          >
            <Trophy size={40} color={palette.accent[500]} strokeWidth={2} />
          </div>

          {/* "Milestone unlocked" label */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.xs,
              marginBottom: spacing.sm,
            }}
          >
            <Sparkles size={14} color={palette.accent[400]} />
            <span
              style={{
                fontFamily: typography.fontFamily,
                fontSize: typography.sizes.caption,
                fontWeight: typography.weights.semibold,
                color: palette.accent[400],
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Milestone unlocked
            </span>
            <Sparkles size={14} color={palette.accent[400]} />
          </div>

          {/* Large number */}
          <div
            style={{
              fontFamily: typography.fontFamily,
              fontSize: 64,
              fontWeight: typography.weights.bold,
              color: colors.text,
              lineHeight: 1,
              marginBottom: spacing.xs,
              letterSpacing: '-0.04em',
              animation: 'cm-milestone-number 0.6s 0.2s ease both',
            }}
          >
            {milestone.days}
          </div>
          <div
            style={{
              fontFamily: typography.fontFamily,
              fontSize: typography.sizes.title,
              fontWeight: typography.weights.semibold,
              color: colors.textSecondary,
              marginBottom: spacing.lg,
            }}
          >
            {milestone.days === 1 ? 'day' : 'days'} clean
          </div>

          {/* Message */}
          <p
            style={{
              fontFamily: typography.fontFamily,
              fontSize: typography.sizes.body,
              color: colors.text,
              margin: 0,
              marginBottom: spacing.xl,
              lineHeight: typography.lineHeights.body,
            }}
          >
            {message}
          </p>

          {/* Continue button */}
          <button
            onClick={onClose}
            style={{
              width: '100%',
              fontFamily: typography.fontFamily,
              fontSize: typography.sizes.body,
              fontWeight: typography.weights.semibold,
              color: palette.neutral[50],
              backgroundColor: palette.primary[600],
              border: 'none',
              borderRadius: radii.lg,
              padding: `${spacing.lg}px ${spacing.xl}px`,
              cursor: 'pointer',
              transition: 'opacity 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Keep going
          </button>
        </div>
      </div>
    </div>
  );
}
