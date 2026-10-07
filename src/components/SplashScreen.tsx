// ─────────────────────────────────────────────────────────────
// ClearMind — Animated Splash Screen
// Shows during store hydration with a gentle breathing animation.
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { Brain, Wind } from 'lucide-react';
import { useTheme } from '@/context/ThemeProvider';
import { typography, spacing, radii, shadows } from '@/constants/theme';

export function SplashScreen() {
  const { colors } = useTheme();
  const [breathe, setBreathe] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setBreathe((b) => !b), 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.bg,
        gap: spacing.xl,
        transition: 'background-color 0.3s ease',
      }}
    >
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: radii.full,
          backgroundColor: colors.surface,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 2s ease-in-out',
          transform: breathe ? 'scale(1.12)' : 'scale(0.92)',
          boxShadow: shadows.lg,
        }}
      >
        <Brain
          size={44}
          color={colors.textSecondary}
          strokeWidth={1.5}
          style={{ transition: 'opacity 2s ease' }}
        />
      </div>

      <div style={{ textAlign: 'center' }}>
        <h1
          style={{
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.title,
            fontWeight: typography.weights.semibold,
            color: colors.text,
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          ClearMind
        </h1>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.xs,
            marginTop: spacing.sm,
          }}
        >
          <Wind size={14} color={colors.textMuted} />
          <p
            style={{
              fontFamily: typography.fontFamily,
              fontSize: typography.sizes.caption,
              fontWeight: typography.weights.regular,
              color: colors.textMuted,
              margin: 0,
            }}
          >
            Breathe. One day at a time.
          </p>
        </div>
      </div>
    </div>
  );
}
