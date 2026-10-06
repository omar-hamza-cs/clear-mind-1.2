// ─────────────────────────────────────────────────────────────
// Onboarding Step 5 — Goal
// ─────────────────────────────────────────────────────────────

import { Check, Target, Infinity as InfinityIcon } from 'lucide-react';
import { useTheme } from '@/context/ThemeProvider';
import { typography, spacing, radii, palette } from '@/constants/theme';
import { StepContainer, StepHeader, StepNav, OnboardingCard } from './OnboardingUI';
import type { OnboardingDraft } from '@/types';

const GOALS: { label: string; value: string; desc: string; days: number | null }[] = [
  { label: '1 Week', value: '7 days', desc: 'A solid first milestone', days: 7 },
  { label: '1 Month', value: '30 days', desc: 'Build real momentum', days: 30 },
  { label: '3 Months', value: '90 days', desc: 'A new habit formed', days: 90 },
  { label: '1 Year', value: '365 days', desc: 'Transform your lifestyle', days: 365 },
  { label: 'Forever', value: 'For good', desc: 'A lifelong commitment', days: null },
];

export function StepGoal({
  draft,
  onBack,
  onNext,
}: {
  draft: OnboardingDraft;
  onBack: () => void;
  onNext: (patch: Partial<OnboardingDraft>) => void;
}) {
  const { colors } = useTheme();
  const selected = draft.goal || '';

  return (
    <StepContainer animationKey={4}>
      <StepHeader
        title="Your goal"
        subtitle="What milestone are you working toward? You can always change this later."
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.md,
          marginBottom: 'auto',
        }}
      >
        {GOALS.map(({ label, value, desc, days }, i) => {
          const isSelected = selected === value;
          const Icon = days === null ? InfinityIcon : Target;

          return (
            <div key={value} className={`cm-stagger-${Math.min(i + 1, 6)}`}>
              <OnboardingCard selected={isSelected} onPress={() => onNext({ goal: value })}>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: radii.md,
                      backgroundColor: isSelected ? palette.primary[200] : colors.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    <Icon
                      size={24}
                      color={isSelected ? palette.primary[600] : colors.textMuted}
                      strokeWidth={2}
                    />
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
                      {label}
                    </div>
                    <div
                      style={{
                        fontFamily: typography.fontFamily,
                        fontSize: typography.sizes.caption,
                        color: colors.textSecondary,
                      }}
                    >
                      {desc}
                    </div>
                  </div>
                  {isSelected && (
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        backgroundColor: palette.primary[400],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Check size={16} color={palette.neutral[50]} strokeWidth={3} />
                    </div>
                  )}
                </div>
              </OnboardingCard>
            </div>
          );
        })}
      </div>

      <StepNav
        onBack={onBack}
        onNext={() => selected && onNext({ goal: selected })}
        nextDisabled={!selected}
      />
    </StepContainer>
  );
}
