// ─────────────────────────────────────────────────────────────
// ClearMind — Day Detail Modal
// Shows check-in, journal entries, and cravings for a given date.
// ─────────────────────────────────────────────────────────────

import { useMemo } from 'react';
import {
  X,
  Smile,
  Wind,
  Moon,
  Zap,
  CheckCircle2,
  CloudRain,
  BookOpen,
  Shield,
  FileText,
} from 'lucide-react';
import { useStore } from '@/store';
import { useTheme } from '@/context/ThemeProvider';
import { typography, spacing, radii, palette } from '@/constants/theme';
import type { MoodLevel } from '@/types';

interface DayDetailModalProps {
  dateKey: string;
  onClose: () => void;
}

const MOOD_EMOJIS: Record<MoodLevel, string> = {
  1: '\uD83D\uDE2B',
  2: '\uD83D\uDE1E',
  3: '\uD83D\uDE10',
  4: '\uD83D\uDE0A',
  5: '\uD83D\uDE04',
};

const MOOD_LABELS: Record<MoodLevel, string> = {
  1: 'Awful',
  2: 'Low',
  3: 'Okay',
  4: 'Good',
  5: 'Great',
};

export function DayDetailModal({ dateKey, onClose }: DayDetailModalProps) {
  const { colors } = useTheme();
  const checkIns = useStore((s) => s.checkIns);
  const journal = useStore((s) => s.journal);
  const cravings = useStore((s) => s.cravings);

  const checkIn = checkIns[dateKey];

  const dayJournal = useMemo(
    () => journal.filter((e) => {
      const d = new Date(e.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return key === dateKey;
    }),
    [journal, dateKey]
  );

  const dayCravings = useMemo(
    () => cravings.filter((c) => {
      const d = new Date(c.timestamp);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return key === dateKey;
    }),
    [cravings, dateKey]
  );

  const dateObj = new Date(dateKey + 'T00:00:00');
  const dateStr = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const hasAny = checkIn || dayJournal.length > 0 || dayCravings.length > 0;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: colors.overlay,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: spacing.lg,
        animation: 'cm-fade-in 0.2s ease both',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.xl,
          maxWidth: 480,
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          animation: 'cm-scale-in 0.3s ease both',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            padding: spacing.xl,
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: typography.fontFamily,
                fontSize: typography.sizes.title,
                fontWeight: typography.weights.bold,
                color: colors.text,
                margin: 0,
              }}
            >
              {dateStr}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              backgroundColor: colors.bg, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <X size={18} color={colors.textSecondary} />
          </button>
        </div>

        <div style={{ padding: spacing.xl }}>
          {!hasAny && (
            <div
              style={{
                textAlign: 'center',
                padding: spacing.xxl,
                color: colors.textMuted,
              }}
            >
              <FileText size={32} color={colors.textMuted} style={{ margin: '0 auto', marginBottom: spacing.md }} />
              <p
                style={{
                  fontFamily: typography.fontFamily,
                  fontSize: typography.sizes.body,
                  color: colors.textSecondary,
                  margin: 0,
                }}
              >
                No activity recorded for this day.
              </p>
            </div>
          )}

          {/* Check-in section */}
          {checkIn && (
            <div style={{ marginBottom: spacing.xl }}>
              <SectionHeader icon={<Smile size={16} color={palette.primary[400]} />} title="Check-in" />
              <div
                style={{
                  backgroundColor: colors.bg,
                  borderRadius: radii.lg,
                  padding: spacing.lg,
                }}
              >
                {/* Mood */}
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md }}>
                  <span style={{ fontSize: 32 }}>{MOOD_EMOJIS[checkIn.mood]}</span>
                  <div>
                    <div style={{ fontFamily: typography.fontFamily, fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Mood</div>
                    <div style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.body, fontWeight: typography.weights.semibold, color: colors.text }}>
                      {MOOD_LABELS[checkIn.mood]}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: spacing.sm, marginBottom: spacing.md }}>
                  <MiniStat icon={Wind} label="Craving" value={`${checkIn.craving}/10`} color={palette.accent[400]} />
                  <MiniStat icon={Moon} label="Sleep" value={`${checkIn.sleep}/10`} color={palette.secondary[400]} />
                  <MiniStat icon={Zap} label="Energy" value={`${checkIn.energy}/10`} color={palette.primary[400]} />
                </div>

                {/* Used cannabis badge */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.sm,
                    padding: `${spacing.sm}px ${spacing.md}px`,
                    borderRadius: radii.sm,
                    backgroundColor: checkIn.usedCannabis ? palette.warning[100] : palette.success[100],
                  }}
                >
                  {checkIn.usedCannabis ? (
                    <CloudRain size={16} color={palette.warning[600]} />
                  ) : (
                    <CheckCircle2 size={16} color={palette.success[600]} />
                  )}
                  <span
                    style={{
                      fontFamily: typography.fontFamily,
                      fontSize: typography.sizes.caption,
                      fontWeight: typography.weights.semibold,
                      color: checkIn.usedCannabis ? palette.warning[800] : palette.success[700],
                    }}
                  >
                    {checkIn.usedCannabis ? 'Used cannabis' : 'Stayed sober'}
                  </span>
                </div>

                {/* Note */}
                {checkIn.note && (
                  <div style={{ marginTop: spacing.md }}>
                    <div style={{ fontFamily: typography.fontFamily, fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: spacing.xs }}>
                      Note
                    </div>
                    <p
                      style={{
                        fontFamily: typography.fontFamily,
                        fontSize: typography.sizes.body,
                        color: colors.text,
                        margin: 0,
                        lineHeight: typography.lineHeights.body,
                        fontStyle: 'italic',
                      }}
                    >
                      "{checkIn.note}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cravings section */}
          {dayCravings.length > 0 && (
            <div style={{ marginBottom: spacing.xl }}>
              <SectionHeader icon={<Shield size={16} color={palette.accent[400]} />} title={`Craving sessions (${dayCravings.length})`} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
                {dayCravings.map((c) => {
                  const time = new Date(c.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                  return (
                    <div
                      key={c.id}
                      style={{
                        backgroundColor: colors.bg,
                        borderRadius: radii.md,
                        padding: spacing.md,
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing.md,
                      }}
                    >
                      <div
                        style={{
                          width: 36, height: 36, borderRadius: '50%',
                          backgroundColor: c.resisted ? palette.success[100] : palette.warning[100],
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {c.resisted ? <Shield size={16} color={palette.success[600]} /> : <CloudRain size={16} color={palette.warning[600]} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.caption, color: colors.textSecondary }}>
                          {time} {'\u00B7'} {c.mode === 'breathing' ? 'Breathing' : 'Distraction'}
                        </div>
                        <div style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.body, fontWeight: typography.weights.medium, color: colors.text }}>
                          {c.initialIntensity} {'\u2192'} {c.postIntensity} {'\u00B7'} {c.resisted ? 'Resisted' : 'Used'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Journal section */}
          {dayJournal.length > 0 && (
            <div>
              <SectionHeader icon={<BookOpen size={16} color={palette.secondary[600]} />} title={`Journal entries (${dayJournal.length})`} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
                {dayJournal.map((entry) => (
                  <div
                    key={entry.id}
                    style={{
                      backgroundColor: colors.bg,
                      borderRadius: radii.md,
                      padding: spacing.md,
                    }}
                  >
                    <h4
                      style={{
                        fontFamily: typography.fontFamily,
                        fontSize: typography.sizes.body,
                        fontWeight: typography.weights.semibold,
                        color: colors.text,
                        margin: 0,
                        marginBottom: spacing.xs,
                      }}
                    >
                      {entry.title || 'Untitled'}
                    </h4>
                    <p
                      style={{
                        fontFamily: typography.fontFamily,
                        fontSize: typography.sizes.caption,
                        color: colors.textSecondary,
                        margin: 0,
                        lineHeight: typography.lineHeights.body,
                      }}
                    >
                      {entry.body.length > 200 ? entry.body.slice(0, 200) + '\u2026' : entry.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  const { colors } = useTheme();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
      {icon}
      <span
        style={{
          fontFamily: typography.fontFamily,
          fontSize: typography.sizes.caption,
          fontWeight: typography.weights.semibold,
          color: colors.textSecondary,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {title}
      </span>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, color }: { icon: typeof Zap; label: string; value: string; color: string }) {
  const { colors } = useTheme();
  return (
    <div
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        borderRadius: radii.sm,
        padding: spacing.sm,
        textAlign: 'center',
      }}
    >
      <Icon size={14} color={color} style={{ margin: '0 auto', marginBottom: 2 }} />
      <div style={{ fontFamily: typography.fontFamily, fontSize: 13, fontWeight: typography.weights.bold, color: color }}>
        {value}
      </div>
      <div style={{ fontFamily: typography.fontFamily, fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </div>
    </div>
  );
}
