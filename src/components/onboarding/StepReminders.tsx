// ─────────────────────────────────────────────────────────────
// Onboarding Step 6 — Reminders
// ─────────────────────────────────────────────────────────────

import { Bell, Clock } from 'lucide-react';
import { useTheme } from '@/context/ThemeProvider';
import { typography, spacing, radii, palette } from '@/constants/theme';
import { StepContainer, StepHeader, StepNav, ToggleSwitch, FieldLabel } from './OnboardingUI';
import type { OnboardingDraft } from '@/types';

export function StepReminders({
  draft,
  onBack,
  onNext,
}: {
  draft: OnboardingDraft;
  onBack: () => void;
  onNext: (patch: Partial<OnboardingDraft>) => void;
}) {
  const { colors } = useTheme();

  const enabled = draft.notificationsEnabled;
  const hour = draft.checkInHour;
  const minute = draft.checkInMinute;

  const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  const handleTimeChange = (value: string) => {
    const [h, m] = value.split(':').map(Number);
    onNext({ checkInHour: h || 9, checkInMinute: m || 0 });
  };

  return (
    <StepContainer animationKey={5}>
      <StepHeader
        title="Daily reminders"
        subtitle="Would you like a gentle nudge to check in each day?"
      />

      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.lg,
          padding: spacing.lg,
          border: `1px solid ${colors.border}`,
          marginBottom: spacing.xl,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, marginBottom: enabled ? spacing.lg : 0 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: radii.md,
              backgroundColor: enabled ? palette.primary[200] : colors.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'background-color 0.2s ease',
            }}
          >
            <Bell size={22} color={enabled ? palette.primary[600] : colors.textMuted} strokeWidth={2} />
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
              Check-in reminders
            </div>
            <div
              style={{
                fontFamily: typography.fontFamily,
                fontSize: typography.sizes.caption,
                color: colors.textSecondary,
              }}
            >
              {enabled ? 'Enabled' : 'Disabled'}
            </div>
          </div>
          <ToggleSwitch on={enabled} onToggle={() => onNext({ notificationsEnabled: !enabled })} />
        </div>

        {enabled && (
          <div className="cm-stagger-1" style={{ paddingTop: spacing.lg, borderTop: `1px solid ${colors.border}` }}>
            <FieldLabel>Reminder time</FieldLabel>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.sm,
                backgroundColor: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: radii.md,
                padding: `${spacing.md}px ${spacing.lg}px`,
              }}
            >
              <Clock size={20} color={colors.textMuted} />
              <input
                type="time"
                value={timeString}
                onChange={(e) => handleTimeChange(e.target.value)}
                style={{
                  fontFamily: typography.fontFamily,
                  fontSize: typography.sizes.title,
                  fontWeight: typography.weights.semibold,
                  color: colors.text,
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  colorScheme: 'light dark',
                }}
              />
            </div>
            <p
              style={{
                fontFamily: typography.fontFamily,
                fontSize: typography.sizes.caption,
                color: colors.textMuted,
                margin: 0,
                marginTop: spacing.sm,
              }}
            >
              You can change this anytime in Settings.
            </p>
          </div>
        )}
      </div>

      <div
        style={{
          backgroundColor: palette.primary[100],
          borderRadius: radii.md,
          padding: `${spacing.lg}px ${spacing.xl}px`,
          marginBottom: 'auto',
        }}
      >
        <p
          style={{
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.caption,
            color: palette.primary[700],
            margin: 0,
            lineHeight: typography.lineHeights.body,
          }}
        >
          Reminders are gentle and supportive — never pushy. Your data stays
          private on your device.
        </p>
      </div>

      <StepNav
        onBack={onBack}
        onNext={() =>
          onNext({
            notificationsEnabled: enabled,
            checkInHour: hour,
            checkInMinute: minute,
          })
        }
        nextLabel="Review"
      />
    </StepContainer>
  );
}
