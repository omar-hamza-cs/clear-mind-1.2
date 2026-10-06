// ─────────────────────────────────────────────────────────────
// Onboarding Step 7 — Summary & Start Journey
// ─────────────────────────────────────────────────────────────

import { Check, Sparkles, Calendar, Wallet, Heart, Target, Bell, Rocket } from 'lucide-react';
import { useTheme } from '@/context/ThemeProvider';
import { typography, spacing, radii, palette } from '@/constants/theme';
import { formatEpoch } from '@/lib/dates';
import { StepContainer, StepHeader, PrimaryButton, SecondaryButton } from './OnboardingUI';
import type { OnboardingDraft } from '@/types';
import { useStore } from '@/store';

export function StepSummary({
  draft,
  onBack,
}: {
  draft: OnboardingDraft;
  onBack: () => void;
}) {
  const { colors } = useTheme();
  const completeOnboarding = useStore((s) => s.completeOnboarding);
  const updateSettings = useStore((s) => s.updateSettings);

  const allReasons = [
    ...draft.reasons,
    ...(draft.customReason.trim() ? [draft.customReason.trim()] : []),
  ];

  const handleStart = () => {
    updateSettings({
      notifications: {
        enabled: draft.notificationsEnabled,
        checkInReminder: draft.notificationsEnabled,
        checkInHour: draft.checkInHour,
        checkInMinute: draft.checkInMinute,
        milestoneAlerts: true,
        cravingSupport: true,
      },
    });

    completeOnboarding({
      quitDate: draft.lastUseAt ?? Date.now(),
      lastUseAt: draft.lastUseAt ?? Date.now(),
      spending: {
        amount: draft.spendingAmount ?? 0,
        period: draft.spendingPeriod ?? 'daily',
        currency: draft.spendingCurrency || 'EUR',
      },
      reasons: draft.reasons,
      customReason: draft.customReason.trim(),
      goal: draft.goal,
    });
  };

  const summaryItems = [
    {
      icon: Calendar,
      label: 'Quit date',
      value: formatEpoch(draft.lastUseAt ?? Date.now(), 'MMM d, yyyy \'at\' h:mm a'),
    },
    {
      icon: Wallet,
      label: 'Spending',
      value: `${draft.spendingCurrency} ${draft.spendingAmount} / ${draft.spendingPeriod}`,
    },
    {
      icon: Heart,
      label: 'Reasons',
      value: allReasons.length > 0 ? allReasons.join(', ') : 'None selected',
    },
    {
      icon: Target,
      label: 'Goal',
      value: draft.goal,
    },
    {
      icon: Bell,
      label: 'Reminders',
      value: draft.notificationsEnabled
        ? `Daily at ${String(draft.checkInHour).padStart(2, '0')}:${String(draft.checkInMinute).padStart(2, '0')}`
        : 'Off',
    },
  ];

  return (
    <StepContainer animationKey={6}>
      <StepHeader
        title="Ready to begin?"
        subtitle="Here's everything you've set up. Take a look, then start your journey."
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.md,
          marginBottom: spacing.xl,
        }}
      >
        {summaryItems.map(({ icon: Icon, label, value }, i) => (
          <div
            key={label}
            className={`cm-stagger-${Math.min(i + 1, 6)}`}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: spacing.md,
              backgroundColor: colors.surface,
              borderRadius: radii.md,
              padding: `${spacing.lg}px ${spacing.xl}px`,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: radii.sm,
                backgroundColor: palette.primary[100],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={20} color={palette.primary[600]} strokeWidth={2} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: typography.fontFamily,
                  fontSize: typography.sizes.caption,
                  fontWeight: typography.weights.medium,
                  color: colors.textMuted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: 2,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontFamily: typography.fontFamily,
                  fontSize: typography.sizes.body,
                  color: colors.text,
                  fontWeight: typography.weights.medium,
                  lineHeight: typography.lineHeights.body,
                  wordBreak: 'break-word',
                }}
              >
                {value}
              </div>
            </div>
            <Check size={18} color={palette.primary[400]} strokeWidth={2.5} style={{ flexShrink: 0, marginTop: 2 }} />
          </div>
        ))}
      </div>

      <div
        style={{
          backgroundColor: palette.primary[100],
          borderRadius: radii.lg,
          padding: spacing.xl,
          textAlign: 'center',
          marginBottom: 'auto',
        }}
      >
        <Sparkles size={28} color={palette.primary[600]} style={{ marginBottom: spacing.sm }} />
        <p
          style={{
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.body,
            color: palette.primary[800],
            margin: 0,
            fontWeight: typography.weights.medium,
            lineHeight: typography.lineHeights.body,
          }}
        >
          Remember: progress isn't linear. Every day matters, and you've got this.
        </p>
      </div>

      <div
        style={{
          marginTop: spacing.xl,
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.sm,
        }}
      >
        <PrimaryButton onPress={handleStart} style={{ fontSize: typography.sizes.title }}>
          <Rocket size={22} />
          Start My Journey
        </PrimaryButton>
        <SecondaryButton onPress={onBack}>Back</SecondaryButton>
      </div>
    </StepContainer>
  );
}
