// ─────────────────────────────────────────────────────────────
// ClearMind — Post-Timer Flow
// Intensity slider + "I resisted" / "I used" buttons.
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import { Shield, Heart, AlertCircle, ChevronRight } from 'lucide-react';
import { useTheme } from '@/context/ThemeProvider';
import { useTab } from '@/context/Navigation';
import { typography, spacing, radii, palette } from '@/constants/theme';
import { triggerHaptic } from '@/lib/haptics';
import type { CravingMode } from '@/types';

interface PostTimerProps {
  mode: CravingMode;
  initialIntensity: number;
  onComplete: (
    postIntensity: number,
    resisted: boolean
  ) => void;
  onExit: () => void;
}

export function PostTimer({
  mode,
  initialIntensity,
  onComplete,
  onExit,
}: PostTimerProps) {
  const { colors } = useTheme();
  const [intensity, setIntensity] = useState(initialIntensity);

  const intensityLabel =
    intensity <= 3 ? 'Low' : intensity <= 6 ? 'Moderate' : intensity <= 8 ? 'High' : 'Very high';
  const intensityColor =
    intensity <= 3 ? palette.primary[400] : intensity <= 6 ? palette.accent[400] : palette.error[500];

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
        animation: 'cm-fade-in 0.5s ease both',
      }}
    >
      <div style={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>
        {/* Icon */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            backgroundColor: palette.primary[100],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            marginBottom: spacing.lg,
            animation: 'cm-scale-in 0.5s ease both',
          }}
        >
          <Heart size={32} color={palette.primary[600]} strokeWidth={2} />
        </div>

        <h1
          style={{
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.display,
            fontWeight: typography.weights.bold,
            color: colors.text,
            margin: 0,
            marginBottom: spacing.sm,
            letterSpacing: '-0.02em',
          }}
        >
          You did it
        </h1>
        <p
          style={{
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.body,
            color: colors.textSecondary,
            margin: 0,
            marginBottom: spacing.xxl,
            lineHeight: typography.lineHeights.body,
          }}
        >
          {mode === 'breathing'
            ? 'You completed 60 seconds of breathing.'
            : 'You completed 10 minutes of distraction.'}{' '}
          How strong is the craving now?
        </p>

        {/* Intensity slider */}
        <div
          style={{
            backgroundColor: colors.surface,
            borderRadius: radii.lg,
            padding: spacing.xl,
            border: `1px solid ${colors.border}`,
            marginBottom: spacing.xl,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: spacing.md,
            }}
          >
            <span
              style={{
                fontFamily: typography.fontFamily,
                fontSize: typography.sizes.caption,
                color: colors.textSecondary,
                fontWeight: typography.weights.medium,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Craving intensity
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: spacing.xs }}>
              <span
                style={{
                  fontFamily: typography.fontFamily,
                  fontSize: typography.sizes.display,
                  fontWeight: typography.weights.bold,
                  color: intensityColor,
                  lineHeight: 1,
                }}
              >
                {intensity}
              </span>
              <span
                style={{
                  fontFamily: typography.fontFamily,
                  fontSize: typography.sizes.caption,
                  color: intensityColor,
                  fontWeight: typography.weights.medium,
                }}
              >
                /10 {intensityLabel}
              </span>
            </div>
          </div>

          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            style={{
              width: '100%',
              height: 32,
              appearance: 'none',
              background: 'transparent',
              cursor: 'pointer',
            }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: typography.fontFamily,
              fontSize: 11,
              color: colors.textMuted,
              marginTop: spacing.xs,
            }}
          >
            <span>1 - Barely noticeable</span>
            <span>10 - Overwhelming</span>
          </div>
        </div>

        {/* Action buttons */}
        <button
          onClick={() => {
            triggerHaptic('success');
            onComplete(intensity, true);
          }}
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
            marginBottom: spacing.md,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
            transition: 'opacity 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <Shield size={20} />
          I Resisted
        </button>

        <button
          onClick={() => {
            triggerHaptic('warning');
            onComplete(intensity, false);
          }}
          style={{
            width: '100%',
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.body,
            fontWeight: typography.weights.medium,
            color: colors.textSecondary,
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: radii.lg,
            padding: `${spacing.lg}px ${spacing.xl}px`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
            transition: 'opacity 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <AlertCircle size={20} />
          I Used
        </button>

        <button
          onClick={onExit}
          style={{
            marginTop: spacing.lg,
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.caption,
            color: colors.textMuted,
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: spacing.sm,
          }}
        >
          Dismiss without saving
        </button>
      </div>
    </div>
  );
}
