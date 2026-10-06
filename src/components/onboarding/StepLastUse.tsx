// ─────────────────────────────────────────────────────────────
// Onboarding Step 2 — Last Use
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import { Calendar, Clock, Check } from 'lucide-react';
import { useTheme } from '@/context/ThemeProvider';
import { typography, spacing, radii, palette } from '@/constants/theme';
import { todayEpoch, yesterdayEpoch, formatEpoch } from '@/lib/dates';
import { StepContainer, StepHeader, StepNav, OnboardingCard, FieldLabel } from './OnboardingUI';
import type { OnboardingDraft } from '@/types';

type QuickOption = 'today' | 'yesterday' | 'custom';

export function StepLastUse({
  draft,
  onBack,
  onNext,
}: {
  draft: OnboardingDraft;
  onBack: () => void;
  onNext: (patch: Partial<OnboardingDraft>) => void;
}) {
  const { colors } = useTheme();
  const lastUse = draft.lastUseAt ?? todayEpoch();

  const isToday = (lastUse: number) =>
    new Date(lastUse).toDateString() === new Date(todayEpoch()).toDateString();
  const isYesterday = (lastUse: number) =>
    new Date(lastUse).toDateString() === new Date(yesterdayEpoch()).toDateString();

  const [option, setOption] = useState<QuickOption>(
    isToday(lastUse) ? 'today' : isYesterday(lastUse) ? 'yesterday' : 'custom'
  );
  const [customDate, setCustomDate] = useState(() => {
    const d = new Date(lastUse);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [customTime, setCustomTime] = useState(() => {
    const d = new Date(lastUse);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });

  const computeEpoch = (): number => {
    if (option === 'today') return todayEpoch();
    if (option === 'yesterday') return yesterdayEpoch();
    const [y, m, d] = customDate.split('-').map(Number);
    const [h, min] = customTime.split(':').map(Number);
    return new Date(y, m - 1, d, h || 0, min || 0).getTime();
  };

  const computed = computeEpoch();
  const canProceed = computed <= Date.now();

  const handleNext = () => {
    if (canProceed) onNext({ lastUseAt: computed });
  };

  const options: { key: QuickOption; label: string; desc: string }[] = [
    { key: 'today', label: 'Today', desc: 'Starting fresh right now' },
    { key: 'yesterday', label: 'Yesterday', desc: 'One day under your belt' },
    { key: 'custom', label: 'Custom date', desc: 'Pick a specific date and time' },
  ];

  return (
    <StepContainer animationKey={1}>
      <StepHeader
        title="When did you last use?"
        subtitle="This sets your starting point. Your streak counts from here."
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md, marginBottom: spacing.xl }}>
        {options.map(({ key, label, desc }) => (
          <OnboardingCard
            key={key}
            selected={option === key}
            onPress={() => setOption(key)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: radii.full,
                  backgroundColor: option === key ? palette.primary[200] : colors.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'background-color 0.2s ease',
                }}
              >
                {option === key && <Check size={20} color={palette.primary[600]} strokeWidth={2.5} />}
              </div>
              <div>
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
            </div>
          </OnboardingCard>
        ))}
      </div>

      {option === 'custom' && (
        <div
          className="cm-stagger-1"
          style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg, marginBottom: spacing.xl }}
        >
          <div>
            <FieldLabel>Date</FieldLabel>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.sm,
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: radii.md,
                padding: `${spacing.md}px ${spacing.lg}px`,
              }}
            >
              <Calendar size={20} color={colors.textMuted} />
              <input
                type="date"
                value={customDate}
                max={formatEpoch(todayEpoch(), 'yyyy-MM-dd')}
                onChange={(e) => setCustomDate(e.target.value)}
                style={{
                  fontFamily: typography.fontFamily,
                  fontSize: typography.sizes.body,
                  color: colors.text,
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  colorScheme: 'light dark',
                }}
              />
            </div>
          </div>
          <div>
            <FieldLabel>Time</FieldLabel>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.sm,
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: radii.md,
                padding: `${spacing.md}px ${spacing.lg}px`,
              }}
            >
              <Clock size={20} color={colors.textMuted} />
              <input
                type="time"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                style={{
                  fontFamily: typography.fontFamily,
                  fontSize: typography.sizes.body,
                  color: colors.text,
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  colorScheme: 'light dark',
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.md,
          padding: `${spacing.md}px ${spacing.lg}px`,
          border: `1px solid ${colors.border}`,
          marginBottom: 'auto',
        }}
      >
        <span style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.caption, color: colors.textMuted }}>
          Your quit date:{' '}
        </span>
        <span style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.body, fontWeight: typography.weights.semibold, color: colors.text }}>
          {formatEpoch(computed, 'MMM d, yyyy \'at\' h:mm a')}
        </span>
        {!canProceed && (
          <div style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.caption, color: palette.error[500], marginTop: spacing.xs }}>
            Date cannot be in the future.
          </div>
        )}
      </div>

      <StepNav onBack={onBack} onNext={handleNext} nextDisabled={!canProceed} />
    </StepContainer>
  );
}
