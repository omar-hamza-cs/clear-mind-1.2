// ─────────────────────────────────────────────────────────────
// Onboarding Step 1 — Welcome
// ─────────────────────────────────────────────────────────────

import { Brain, Heart, TrendingUp, Calendar } from 'lucide-react';
import { useTheme } from '@/context/ThemeProvider';
import { typography, spacing, radii, palette } from '@/constants/theme';
import { StepContainer, StepHeader, StepNav } from './OnboardingUI';

export function StepWelcome({ onNext }: { onNext: () => void }) {
  const { colors } = useTheme();

  const features = [
    { icon: Calendar, label: 'Track your daily progress' },
    { icon: TrendingUp, label: 'See patterns in your habits' },
    { icon: Heart, label: 'Get support during cravings' },
  ];

  return (
    <StepContainer animationKey={0}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: spacing.xxl,
          marginBottom: spacing.xl,
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: radii.full,
            backgroundColor: palette.primary[100],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'cm-scale-in 0.6s ease both',
          }}
        >
          <Brain size={56} color={palette.primary[600]} strokeWidth={1.5} />
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: spacing.xxl }}>
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
          Welcome to ClearMind
        </h1>
        <p
          style={{
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.body,
            color: colors.textSecondary,
            margin: 0,
            lineHeight: typography.lineHeights.body,
            maxWidth: 400,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          A compassionate companion for your cannabis recovery journey.
          No judgment, just support — one day at a time.
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.lg,
          marginBottom: 'auto',
        }}
      >
        {features.map(({ icon: Icon, label }, i) => (
          <div
            key={label}
            className={`cm-stagger-${i + 1}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.lg,
              padding: `${spacing.lg}px ${spacing.xl}px`,
              backgroundColor: colors.surface,
              borderRadius: radii.lg,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: radii.md,
                backgroundColor: palette.primary[100],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={22} color={palette.primary[600]} strokeWidth={2} />
            </div>
            <span
              style={{
                fontFamily: typography.fontFamily,
                fontSize: typography.sizes.body,
                color: colors.text,
                fontWeight: typography.weights.medium,
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      <StepNav onBack={() => {}} onNext={onNext} nextLabel="Begin" showBack={false} />
    </StepContainer>
  );
}
