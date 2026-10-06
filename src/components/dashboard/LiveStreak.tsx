// ─────────────────────────────────────────────────────────────
// ClearMind — Live Streak Counter
// Updates every second with days/hours/minutes.
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeProvider';
import { typography, spacing } from '@/constants/theme';
import { getStreakBreakdown } from '@/lib/stats';

interface LiveStreakProps {
  lastUseAt: number;
  isForever: boolean;
}

export function LiveStreak({ lastUseAt, isForever }: LiveStreakProps) {
  const { colors } = useTheme();
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const breakdown = getStreakBreakdown(lastUseAt);

  const unitStyle: React.CSSProperties = {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.medium,
    color: colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
  };

  const valueStyle: React.CSSProperties = {
    fontFamily: typography.fontFamily,
    fontSize: 28,
    fontWeight: typography.weights.bold,
    color: colors.text,
    lineHeight: 1,
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: spacing.md,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={valueStyle}>{breakdown.days}</span>
        <span style={unitStyle}>{breakdown.days === 1 ? 'day' : 'days'}</span>
      </div>
      <span style={{ ...valueStyle, fontSize: 20, color: colors.textMuted, paddingBottom: 18 }}>
        :
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={valueStyle}>{String(breakdown.hours).padStart(2, '0')}</span>
        <span style={unitStyle}>hrs</span>
      </div>
      <span style={{ ...valueStyle, fontSize: 20, color: colors.textMuted, paddingBottom: 18 }}>
        :
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={valueStyle}>{String(breakdown.minutes).padStart(2, '0')}</span>
        <span style={unitStyle}>min</span>
      </div>
    </div>
  );
}
