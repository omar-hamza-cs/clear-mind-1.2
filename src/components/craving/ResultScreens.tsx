// ─────────────────────────────────────────────────────────────
// ClearMind — Craving Result Screens
// Success animation (resisted) + non-judgmental relapse message.
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { CheckCircle2, Heart, RefreshCw, Home } from 'lucide-react';
import { useTheme } from '@/context/ThemeProvider';
import { typography, spacing, radii, palette } from '@/constants/theme';
import { triggerHaptic } from '@/lib/haptics';
import { useTab } from '@/context/Navigation';

interface SuccessScreenProps {
  onDone: () => void;
}

export function SuccessScreen({ onDone }: SuccessScreenProps) {
  const { colors } = useTheme();
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowCheck(true), 300);
    return () => clearTimeout(t);
  }, []);

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
      <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
        {/* Animated success ring */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            backgroundColor: palette.success[100],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            marginBottom: spacing.xl,
            transform: showCheck ? 'scale(1)' : 'scale(0.5)',
            opacity: showCheck ? 1 : 0,
            transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease',
          }}
        >
          <CheckCircle2
            size={64}
            color={palette.success[600]}
            strokeWidth={2}
            style={{
              opacity: showCheck ? 1 : 0,
              transition: 'opacity 0.3s ease 0.2s',
            }}
          />
        </div>

        <h1
          style={{
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.display,
            fontWeight: typography.weights.bold,
            color: colors.text,
            margin: 0,
            marginBottom: spacing.md,
            letterSpacing: '-0.02em',
          }}
        >
          You resisted
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
          Every craving you push through makes you stronger. This is what recovery looks like.
        </p>

        <div
          style={{
            backgroundColor: palette.primary[100],
            borderRadius: radii.lg,
            padding: spacing.lg,
            marginBottom: spacing.xl,
          }}
        >
          <p
            style={{
              fontFamily: typography.fontFamily,
              fontSize: typography.sizes.body,
              color: palette.primary[800],
              margin: 0,
              fontWeight: typography.weights.medium,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.sm,
            }}
          >
            <Heart size={18} color={palette.primary[600]} />
            Be proud of yourself.
          </p>
        </div>

        <button
          onClick={onDone}
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
          }}
        >
          <Home size={20} />
          Back to Home
        </button>
      </div>
    </div>
  );
}

interface RelapseScreenProps {
  relapseCount: number;
  onDone: () => void;
}

export function RelapseScreen({ relapseCount, onDone }: RelapseScreenProps) {
  const { colors } = useTheme();
  const { setActiveTab } = useTab();

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
      <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
        {/* Compassionate icon */}
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            backgroundColor: palette.warning[100],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            marginBottom: spacing.xl,
            animation: 'cm-scale-in 0.5s ease both',
          }}
        >
          <Heart size={44} color={palette.warning[600]} strokeWidth={2} />
        </div>

        <h1
          style={{
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.display,
            fontWeight: typography.weights.bold,
            color: colors.text,
            margin: 0,
            marginBottom: spacing.md,
            letterSpacing: '-0.02em',
          }}
        >
          It's okay
        </h1>
        <p
          style={{
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.body,
            color: colors.textSecondary,
            margin: 0,
            marginBottom: spacing.lg,
            lineHeight: typography.lineHeights.body,
          }}
        >
          Recovery isn't a straight line. What matters is that you're here, trying again.
          That takes real courage.
        </p>

        <div
          style={{
            backgroundColor: colors.surface,
            borderRadius: radii.lg,
            padding: spacing.lg,
            marginBottom: spacing.xl,
            border: `1px solid ${colors.border}`,
          }}
        >
          <p
            style={{
              fontFamily: typography.fontFamily,
              fontSize: typography.sizes.body,
              color: colors.text,
              margin: 0,
              lineHeight: typography.lineHeights.body,
            }}
          >
            Your previous streak has been saved to your history. Your money saved total
            is preserved. Today is a new day {'\u2014'} your streak resets to zero, but
            your progress doesn't.
          </p>
        </div>

        {relapseCount > 1 && (
          <p
            style={{
              fontFamily: typography.fontFamily,
              fontSize: typography.sizes.caption,
              color: colors.textMuted,
              margin: 0,
              marginBottom: spacing.lg,
            }}
          >
            This is reset #{relapseCount}. Each attempt teaches you something.
          </p>
        )}

        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('home');
            onDone();
          }}
          style={{
            width: '100%',
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.body,
            fontWeight: typography.weights.semibold,
            color: palette.neutral[50],
            backgroundColor: palette.accent[400],
            border: 'none',
            borderRadius: radii.lg,
            padding: `${spacing.lg}px ${spacing.xl}px`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
          }}
        >
          <RefreshCw size={20} />
          Start Fresh Today
        </button>
      </div>
    </div>
  );
}
