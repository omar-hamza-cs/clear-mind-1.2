// ─────────────────────────────────────────────────────────────
// ClearMind — Onboarding UI Primitives
// Shared components used across all onboarding steps.
// ─────────────────────────────────────────────────────────────

import { type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '@/context/ThemeProvider';
import { typography, spacing, radii, palette } from '@/constants/theme';

// ─── Progress Bar ────────────────────────────────────────────

export function OnboardingProgress({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const { colors } = useTheme();
  const pct = ((current + 1) / total) * 100;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: colors.border,
        zIndex: 200,
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          backgroundColor: palette.primary[400],
          transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
    </div>
  );
}

// ─── Step Container (animated) ───────────────────────────────

export function StepContainer({
  children,
  animationKey,
}: {
  children: ReactNode;
  animationKey: number;
}) {
  const { colors } = useTheme();

  return (
    <div
      key={animationKey}
      style={{
        minHeight: '100vh',
        backgroundColor: colors.bg,
        display: 'flex',
        flexDirection: 'column',
        padding: `${spacing.xxl}px ${spacing.xl}px ${spacing.xxl}px`,
        maxWidth: 560,
        margin: '0 auto',
        animation: 'cm-slide-in 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {children}
    </div>
  );
}

// ─── Title + subtitle ────────────────────────────────────────

export function StepHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const { colors } = useTheme();

  return (
    <div style={{ marginBottom: spacing.xxl }}>
      <h1
        style={{
          fontFamily: typography.fontFamily,
          fontSize: typography.sizes.display,
          fontWeight: typography.weights.bold,
          color: colors.text,
          margin: 0,
          marginBottom: spacing.sm,
          letterSpacing: '-0.02em',
          lineHeight: typography.lineHeights.heading,
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          style={{
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.body,
            fontWeight: typography.weights.regular,
            color: colors.textSecondary,
            margin: 0,
            lineHeight: typography.lineHeights.body,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ─── Button styles ───────────────────────────────────────────

export function PrimaryButton({
  children,
  onPress,
  disabled,
  style,
}: {
  children: ReactNode;
  onPress: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
}) {
  const { colors } = useTheme();

  return (
    <button
      onClick={onPress}
      disabled={disabled}
      style={{
        fontFamily: typography.fontFamily,
        fontSize: typography.sizes.body,
        fontWeight: typography.weights.semibold,
        color: disabled ? colors.textMuted : palette.neutral[50],
        backgroundColor: disabled ? colors.border : palette.accent[400],
        border: 'none',
        borderRadius: radii.lg,
        padding: `${spacing.lg}px ${spacing.xl}px`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        transition: 'opacity 0.2s ease, transform 0.1s ease',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onPress,
}: {
  children: ReactNode;
  onPress: () => void;
}) {
  const { colors } = useTheme();

  return (
    <button
      onClick={onPress}
      style={{
        fontFamily: typography.fontFamily,
        fontSize: typography.sizes.body,
        fontWeight: typography.weights.medium,
        color: colors.textSecondary,
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: radii.lg,
        padding: `${spacing.md}px ${spacing.lg}px`,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        transition: 'opacity 0.2s ease',
      }}
    >
      {children}
    </button>
  );
}

// ─── Navigation bar (back/next) ──────────────────────────────

export function StepNav({
  onBack,
  onNext,
  nextLabel,
  nextDisabled,
  showBack = true,
}: {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showBack?: boolean;
}) {
  return (
    <div
      style={{
        marginTop: 'auto',
        paddingTop: spacing.xl,
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.sm,
      }}
    >
      <PrimaryButton onPress={onNext} disabled={nextDisabled}>
        {nextLabel || 'Continue'}
        <ChevronRight size={20} />
      </PrimaryButton>
      {showBack && (
        <SecondaryButton onPress={onBack}>
          <ChevronLeft size={18} />
          Back
        </SecondaryButton>
      )}
    </div>
  );
}

// ─── Selectable Chip ─────────────────────────────────────────

export function Chip({
  label,
  selected,
  onPress,
  icon,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: ReactNode;
}) {
  const { colors } = useTheme();

  return (
    <button
      onClick={onPress}
      style={{
        fontFamily: typography.fontFamily,
        fontSize: typography.sizes.body,
        fontWeight: selected ? typography.weights.semibold : typography.weights.regular,
        color: selected ? palette.primary[900] : colors.text,
        backgroundColor: selected ? palette.primary[200] : colors.surface,
        border: `1px solid ${selected ? palette.primary[400] : colors.border}`,
        borderRadius: radii.full,
        padding: `${spacing.sm}px ${spacing.lg}px`,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: spacing.xs,
        transition: 'all 0.2s ease',
      }}
    >
      {icon}
      {label}
    </button>
  );
}

// ─── Card ────────────────────────────────────────────────────

export function OnboardingCard({
  children,
  selected,
  onPress,
}: {
  children: ReactNode;
  selected?: boolean;
  onPress?: () => void;
}) {
  const { colors } = useTheme();

  return (
    <button
      onClick={onPress}
      disabled={!onPress}
      style={{
        backgroundColor: colors.surface,
        borderRadius: radii.lg,
        padding: spacing.lg,
        border: `2px solid ${selected ? palette.primary[400] : colors.border}`,
        cursor: onPress ? 'pointer' : 'default',
        textAlign: 'left',
        width: '100%',
        transition: 'border-color 0.2s ease, transform 0.1s ease',
        boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
      }}
    >
      {children}
    </button>
  );
}

// ─── Label ───────────────────────────────────────────────────

export function FieldLabel({ children }: { children: ReactNode }) {
  const { colors } = useTheme();

  return (
    <label
      style={{
        display: 'block',
        fontFamily: typography.fontFamily,
        fontSize: typography.sizes.caption,
        fontWeight: typography.weights.medium,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}
    >
      {children}
    </label>
  );
}

// ─── Text Input ──────────────────────────────────────────────

export function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  const { colors } = useTheme();

  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
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
        transition: 'border-color 0.2s ease',
      }}
    />
  );
}

// ─── Toggle Switch ───────────────────────────────────────────

export function ToggleSwitch({
  on,
  onToggle,
}: {
  on: boolean;
  onToggle: () => void;
}) {
  const { colors } = useTheme();

  return (
    <button
      onClick={onToggle}
      style={{
        width: 52,
        height: 30,
        borderRadius: radii.full,
        border: 'none',
        backgroundColor: on ? palette.primary[400] : colors.border,
        cursor: 'pointer',
        position: 'relative',
        transition: 'background-color 0.25s ease',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 3,
          left: on ? 25 : 3,
          width: 24,
          height: 24,
          borderRadius: '50%',
          backgroundColor: palette.neutral[50],
          transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
        }}
      />
    </button>
  );
}
