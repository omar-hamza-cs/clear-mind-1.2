// ─────────────────────────────────────────────────────────────
// Onboarding Step 3 — Spending Habits
// ─────────────────────────────────────────────────────────────

import { Euro, DollarSign, PoundSterling } from 'lucide-react';
import { useTheme } from '@/context/ThemeProvider';
import { typography, spacing, radii, palette } from '@/constants/theme';
import { StepContainer, StepHeader, StepNav, FieldLabel, Chip } from './OnboardingUI';
import type { OnboardingDraft, SpendingPeriod } from '@/types';

const CURRENCIES = [
  { code: 'EUR', symbol: '\u20AC', Icon: Euro },
  { code: 'USD', symbol: '$', Icon: DollarSign },
  { code: 'GBP', symbol: '\u00A3', Icon: PoundSterling },
];

const PERIODS: { key: SpendingPeriod; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
];

export function StepSpending({
  draft,
  onBack,
  onNext,
}: {
  draft: OnboardingDraft;
  onBack: () => void;
  onNext: (patch: Partial<OnboardingDraft>) => void;
}) {
  const { colors } = useTheme();

  const amount = draft.spendingAmount ?? 0;
  const period = draft.spendingPeriod ?? 'daily';
  const currency = draft.spendingCurrency || 'EUR';

  const canProceed = amount > 0 && !!period && !!currency;

  const handleNext = () => {
    if (canProceed) {
      onNext({
        spendingAmount: amount,
        spendingPeriod: period,
        spendingCurrency: currency,
      });
    }
  };

  const selectedCurrency = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0];

  return (
    <StepContainer animationKey={2}>
      <StepHeader
        title="Your spending"
        subtitle="How much do you spend on cannabis? This helps us show your savings over time."
      />

      <div style={{ marginBottom: spacing.xl }}>
        <FieldLabel>Currency</FieldLabel>
        <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap' }}>
          {CURRENCIES.map(({ code, symbol, Icon }) => (
            <Chip
              key={code}
              label={`${symbol} ${code}`}
              selected={currency === code}
              onPress={() =>
                onNext({ spendingCurrency: code })
              }
              icon={<Icon size={16} />}
            />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: spacing.xl }}>
        <FieldLabel>Amount per {period === 'daily' ? 'day' : period === 'weekly' ? 'week' : 'month'}</FieldLabel>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.md,
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: radii.md,
            padding: `${spacing.md}px ${spacing.lg}px`,
          }}
        >
          <selectedCurrency.Icon size={24} color={colors.textSecondary} />
          <input
            type="number"
            min={0}
            step="0.5"
            value={amount || ''}
            placeholder="0"
            onChange={(e) =>
              onNext({ spendingAmount: parseFloat(e.target.value) || 0 })
            }
            style={{
              fontFamily: typography.fontFamily,
              fontSize: typography.sizes.title,
              fontWeight: typography.weights.semibold,
              color: colors.text,
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              width: '100%',
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: 'auto' }}>
        <FieldLabel>Frequency</FieldLabel>
        <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap' }}>
          {PERIODS.map(({ key, label }) => (
            <Chip
              key={key}
              label={label}
              selected={period === key}
              onPress={() => onNext({ spendingPeriod: key })}
            />
          ))}
        </div>
      </div>

      <div
        style={{
          backgroundColor: palette.primary[100],
          borderRadius: radii.md,
          padding: `${spacing.lg}px ${spacing.xl}px`,
          marginBottom: spacing.lg,
        }}
      >
        <p
          style={{
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.caption,
            color: palette.primary[700],
            margin: 0,
            fontWeight: typography.weights.medium,
          }}
        >
          At this rate you'll save approximately{' '}
          <strong style={{ fontSize: typography.sizes.body }}>
            {selectedCurrency.symbol}
            {period === 'daily'
              ? (amount * 30).toFixed(0)
              : period === 'weekly'
                ? (amount * 4.33).toFixed(0)
                : amount.toFixed(0)}
          </strong>{' '}
          per month after quitting.
        </p>
      </div>

      <StepNav onBack={onBack} onNext={handleNext} nextDisabled={!canProceed} />
    </StepContainer>
  );
}
