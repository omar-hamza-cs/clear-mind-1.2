// ─────────────────────────────────────────────────────────────
// ClearMind — EmptyState Component
// Beautiful, thoughtful empty state for charts and stats.
// ─────────────────────────────────────────────────────────────

import type { ReactNode } from 'react';
import { useTheme } from '@/context/ThemeProvider';
import { typography, spacing, radii } from '@/constants/theme';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  message: string;
  height?: number;
}

export function EmptyState({ icon, title, message, height = 200 }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <div
      style={{
        height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: spacing.xl,
        backgroundColor: colors.surface,
        borderRadius: radii.lg,
        border: `1px dashed ${colors.border}`,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          backgroundColor: colors.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.md,
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontFamily: typography.fontFamily,
          fontSize: typography.sizes.body,
          fontWeight: typography.weights.semibold,
          color: colors.text,
          margin: 0,
          marginBottom: spacing.xs,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontFamily: typography.fontFamily,
          fontSize: typography.sizes.caption,
          color: colors.textSecondary,
          margin: 0,
          lineHeight: typography.lineHeights.body,
          maxWidth: 280,
        }}
      >
        {message}
      </p>
    </div>
  );
}
