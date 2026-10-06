// ─────────────────────────────────────────────────────────────
// Onboarding Step 4 — Reasons
// ─────────────────────────────────────────────────────────────

import { useTheme } from '@/context/ThemeProvider';
import { typography, spacing, radii } from '@/constants/theme';
import { QUIT_REASONS } from '@/constants/theme';
import { StepContainer, StepHeader, StepNav, Chip, FieldLabel } from './OnboardingUI';
import type { OnboardingDraft } from '@/types';

export function StepReasons({
  draft,
  onBack,
  onNext,
}: {
  draft: OnboardingDraft;
  onBack: () => void;
  onNext: (patch: Partial<OnboardingDraft>) => void;
}) {
  const { colors } = useTheme();

  const selected: string[] = draft.reasons;
  const customReason: string = draft.customReason;

  const toggleReason = (reason: string) => {
    if (selected.includes(reason)) {
      onNext({ reasons: selected.filter((r) => r !== reason) });
    } else {
      onNext({ reasons: [...selected, reason] });
    }
  };

  const canProceed = selected.length > 0 || customReason.trim().length > 0;

  return (
    <StepContainer animationKey={3}>
      <StepHeader
        title="Your reasons"
        subtitle="Why are you choosing to reduce or quit? Select all that resonate."
      />

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: spacing.sm,
          marginBottom: spacing.xl,
        }}
      >
        {QUIT_REASONS.map((reason, i) => (
          <div key={reason} className={`cm-stagger-${Math.min(i + 1, 6)}`}>
            <Chip
              label={reason}
              selected={selected.includes(reason)}
              onPress={() => toggleReason(reason)}
            />
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 'auto' }}>
        <FieldLabel>Your own reason (optional)</FieldLabel>
        <textarea
          value={customReason}
          onChange={(e) => onNext({ customReason: e.target.value })}
          placeholder="Add a personal reason that matters to you..."
          rows={3}
          style={{
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.body,
            color: colors.text,
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: radii.md,
            padding: `${spacing.md}px ${spacing.lg}px`,
            width: '100%',
            outline: 'none',
            resize: 'vertical',
            lineHeight: typography.lineHeights.body,
            transition: 'border-color 0.2s ease',
          }}
        />
      </div>

      <StepNav
        onBack={onBack}
        onNext={() =>
          canProceed &&
          onNext({ reasons: selected, customReason: customReason.trim() })
        }
        nextDisabled={!canProceed}
        nextLabel="Continue"
      />
    </StepContainer>
  );
}
