// ─────────────────────────────────────────────────────────────
// ClearMind — Calendar Grid Component
// Custom month grid with day markers: Clean (green dot),
// Relapse (red dot), Check-in (check icon). Multiple markers
// per day are shown together — never relies on color alone.
// ─────────────────────────────────────────────────────────────

import { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useTheme } from '@/context/ThemeProvider';
import { typography, spacing, radii, palette } from '@/constants/theme';

export interface DayMarkers {
  [dateKey: string]: {
    clean: boolean;
    relapse: boolean;
    checkIn: boolean;
  };
}

interface CalendarGridProps {
  markers: DayMarkers;
  onDayPress: (dateKey: string) => void;
  quitDate?: number;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function CalendarGrid({ markers, onDayPress, quitDate }: CalendarGridProps) {
  const { colors } = useTheme();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  const goPrev = useCallback(() => {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, []);

  const goNext = useCallback(() => {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, []);

  // Build the calendar grid
  const days = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const startWeekday = firstDay.getDay();
    const totalDays = lastDay.getDate();

    // Previous month trailing days
    const prevLastDay = new Date(viewYear, viewMonth, 0).getDate();
    const trailing: (number | null)[] = [];
    for (let i = startWeekday - 1; i >= 0; i--) {
      trailing.push(null); // null = not in current month
    }

    const current: number[] = [];
    for (let d = 1; d <= totalDays; d++) {
      current.push(d);
    }

    // Next month leading days
    const totalCells = trailing.length + current.length;
    const leadingCount = (7 - (totalCells % 7)) % 7;
    const leading: (number | null)[] = [];
    for (let i = 0; i < leadingCount; i++) {
      leading.push(null);
    }

    return [...trailing, ...current.map((d) => d), ...leading];
  }, [viewYear, viewMonth]);

  const quitDateKey = quitDate
    ? toDateKey(new Date(quitDate).getFullYear(), new Date(quitDate).getMonth(), new Date(quitDate).getDate())
    : undefined;

  return (
    <div
      style={{
        backgroundColor: colors.surface,
        borderRadius: radii.lg,
        padding: spacing.lg,
        border: `1px solid ${colors.border}`,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing.md,
        }}
      >
        <h3
          style={{
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.title,
            fontWeight: typography.weights.semibold,
            color: colors.text,
            margin: 0,
          }}
        >
          {MONTH_NAMES[viewMonth]} {viewYear}
        </h3>
        <div style={{ display: 'flex', gap: spacing.xs }}>
          <button
            onClick={goPrev}
            style={{
              width: 32, height: 32, borderRadius: radii.sm,
              backgroundColor: colors.bg, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: colors.textSecondary,
            }}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={goNext}
            style={{
              width: 32, height: 32, borderRadius: radii.sm,
              backgroundColor: colors.bg, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: colors.textSecondary,
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 2,
          marginBottom: spacing.xs,
        }}
      >
        {WEEKDAYS.map((day, i) => (
          <div
            key={i}
            style={{
              textAlign: 'center',
              fontFamily: typography.fontFamily,
              fontSize: 11,
              fontWeight: typography.weights.semibold,
              color: colors.textMuted,
              padding: `${spacing.xs}px 0`,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 2,
        }}
      >
        {days.map((dayNum, i) => {
          if (dayNum === null) {
            return <div key={i} style={{ height: 48 }} />;
          }

          const dateKey = toDateKey(viewYear, viewMonth, dayNum);
          const marker = markers[dateKey];
          const isToday = dateKey === todayKey;
          const isFuture = new Date(viewYear, viewMonth, dayNum) > today;
          const isBeforeQuit = quitDateKey
            ? dateKey < quitDateKey
            : false;

          const hasClean = marker?.clean ?? false;
          const hasRelapse = marker?.relapse ?? false;
          const hasCheckIn = marker?.checkIn ?? false;
          const hasAny = hasClean || hasRelapse || hasCheckIn;

          return (
            <button
              key={i}
              onClick={() => !isFuture && onDayPress(dateKey)}
              disabled={isFuture}
              style={{
                height: 48,
                border: 'none',
                borderRadius: radii.sm,
                backgroundColor: isToday ? `${colors.text}08` : 'transparent',
                cursor: isFuture ? 'default' : 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                padding: 0,
                position: 'relative',
                opacity: isFuture || isBeforeQuit ? 0.4 : 1,
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isFuture) e.currentTarget.style.backgroundColor = `${colors.text}06`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isToday ? `${colors.text}08` : 'transparent';
              }}
            >
              {/* Day number */}
              <span
                style={{
                  fontFamily: typography.fontFamily,
                  fontSize: 13,
                  fontWeight: isToday ? typography.weights.bold : typography.weights.medium,
                  color: isToday ? palette.primary[400] : colors.text,
                }}
              >
                {dayNum}
              </span>

              {/* Markers row */}
              {hasAny && (
                <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                  {hasClean && (
                    <div
                      style={{
                        width: 6, height: 6, borderRadius: '50%',
                        backgroundColor: palette.success[500],
                      }}
                      title="Clean day"
                    />
                  )}
                  {hasRelapse && (
                    <div
                      style={{
                        width: 6, height: 6, borderRadius: '50%',
                        backgroundColor: palette.error[500],
                      }}
                      title="Relapse"
                    />
                  )}
                  {hasCheckIn && (
                    <div
                      style={{
                        width: 12, height: 12, borderRadius: '50%',
                        backgroundColor: palette.primary[400],
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                      title="Check-in completed"
                    >
                      <Check size={8} color={palette.neutral[50]} strokeWidth={3} />
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          gap: spacing.lg,
          marginTop: spacing.md,
          paddingTop: spacing.md,
          borderTop: `1px solid ${colors.border}`,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: palette.success[500] }} />
          <span style={{ fontFamily: typography.fontFamily, fontSize: 11, color: colors.textSecondary }}>Clean</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: palette.error[500] }} />
          <span style={{ fontFamily: typography.fontFamily, fontSize: 11, color: colors.textSecondary }}>Relapse</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
          <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: palette.primary[400], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={9} color={palette.neutral[50]} strokeWidth={3} />
          </div>
          <span style={{ fontFamily: typography.fontFamily, fontSize: 11, color: colors.textSecondary }}>Check-in</span>
        </div>
      </div>
    </div>
  );
}
