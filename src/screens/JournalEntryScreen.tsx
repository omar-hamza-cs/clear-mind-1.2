// ─────────────────────────────────────────────────────────────
// ClearMind — Journal Entry Screen (Create / Edit)
// app/journal-entry.tsx
//
// Full screen modal: Title, body, optional mood, optional craving level.
// ─────────────────────────────────────────────────────────────

import { useState, useCallback } from 'react';
import {
  ArrowLeft,
  Check,
  Smile,
  Wind,
} from 'lucide-react';
import { useStore } from '@/store';
import { useTheme } from '@/context/ThemeProvider';
import { typography, spacing, radii, palette } from '@/constants/theme';
import { triggerHaptic } from '@/lib/haptics';
import type { JournalEntry, MoodLevel } from '@/types';

interface JournalEntryScreenProps {
  entry: JournalEntry | null;
  onClose: () => void;
}

const MOOD_OPTIONS: { level: MoodLevel; emoji: string; label: string; color: string }[] = [
  { level: 1, emoji: '\uD83D\uDE2B', label: 'Awful', color: palette.error[500] },
  { level: 2, emoji: '\uD83D\uDE1E', label: 'Low', color: palette.accent[400] },
  { level: 3, emoji: '\uD83D\uDE10', label: 'Okay', color: palette.accent[400] },
  { level: 4, emoji: '\uD83D\uDE0A', label: 'Good', color: palette.primary[400] },
  { level: 5, emoji: '\uD83D\uDE04', label: 'Great', color: palette.success[500] },
];

export function JournalEntryScreen({ entry, onClose }: JournalEntryScreenProps) {
  const { colors } = useTheme();
  const addJournalEntry = useStore((s) => s.addJournalEntry);
  const updateJournalEntry = useStore((s) => s.updateJournalEntry);

  const isEditing = !!entry;

  const [title, setTitle] = useState(entry?.title ?? '');
  const [body, setBody] = useState(entry?.body ?? '');
  const [mood, setMood] = useState<MoodLevel | 0>(entry?.mood ?? 0);
  const [cravingLevel, setCravingLevel] = useState(entry?.cravingLevel ?? 0);

  const canSave = title.trim().length > 0 || body.trim().length > 0;

  const handleSave = useCallback(() => {
    if (!canSave) return;
    triggerHaptic('success');

    if (isEditing && entry) {
      updateJournalEntry(entry.id, {
        title: title.trim(),
        body: body.trim(),
        mood: mood as MoodLevel,
        cravingLevel,
      });
    } else {
      addJournalEntry({
        title: title.trim(),
        body: body.trim(),
        mood: mood as MoodLevel,
        cravingLevel,
      });
    }
    onClose();
  }, [canSave, isEditing, entry, title, body, mood, cravingLevel, updateJournalEntry, addJournalEntry, onClose]);

  const pct = cravingLevel > 0 ? ((cravingLevel - 1) / 9) * 100 : 0;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: colors.bg,
        zIndex: 1000,
        animation: 'cm-fade-in 0.3s ease both',
        overflowY: 'auto',
      }}
    >
      <div style={{ maxWidth: 560, margin: '0 auto', padding: spacing.xl, paddingBottom: 120 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl }}>
          <button
            onClick={onClose}
            style={{
              display: 'flex', alignItems: 'center', gap: spacing.xs,
              fontFamily: typography.fontFamily, fontSize: typography.sizes.body,
              color: colors.textSecondary, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: spacing.sm,
            }}
          >
            <ArrowLeft size={20} /> Back
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            style={{
              display: 'flex', alignItems: 'center', gap: spacing.xs,
              fontFamily: typography.fontFamily, fontSize: typography.sizes.body,
              fontWeight: typography.weights.semibold,
              color: canSave ? palette.neutral[50] : colors.textMuted,
              backgroundColor: canSave ? palette.primary[600] : colors.border,
              border: 'none', borderRadius: radii.lg,
              padding: `${spacing.sm}px ${spacing.lg}px`,
              cursor: canSave ? 'pointer' : 'not-allowed',
              transition: 'opacity 0.2s ease',
            }}
          >
            <Check size={18} /> {isEditing ? 'Update' : 'Save'}
          </button>
        </div>

        <h1
          style={{
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.display,
            fontWeight: typography.weights.bold,
            color: colors.text,
            margin: 0,
            marginBottom: spacing.xl,
            letterSpacing: '-0.02em',
          }}
        >
          {isEditing ? 'Edit entry' : 'New entry'}
        </h1>

        {/* Title input */}
        <div style={{ marginBottom: spacing.lg }}>
          <label
            style={{
              display: 'block',
              fontFamily: typography.fontFamily,
              fontSize: typography.sizes.caption,
              color: colors.textSecondary,
              fontWeight: typography.weights.medium,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: spacing.sm,
            }}
          >
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your entry a title..."
            style={{
              width: '100%',
              fontFamily: typography.fontFamily,
              fontSize: typography.sizes.title,
              fontWeight: typography.weights.semibold,
              color: colors.text,
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: radii.lg,
              padding: spacing.lg,
              outline: 'none',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = palette.primary[400])}
            onBlur={(e) => (e.currentTarget.style.borderColor = colors.border)}
          />
        </div>

        {/* Body textarea */}
        <div style={{ marginBottom: spacing.xl }}>
          <label
            style={{
              display: 'block',
              fontFamily: typography.fontFamily,
              fontSize: typography.sizes.caption,
              color: colors.textSecondary,
              fontWeight: typography.weights.medium,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: spacing.sm,
            }}
          >
            Reflection
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What's on your mind? Write freely..."
            rows={8}
            style={{
              width: '100%',
              fontFamily: typography.fontFamily,
              fontSize: typography.sizes.body,
              color: colors.text,
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: radii.lg,
              padding: spacing.lg,
              outline: 'none',
              resize: 'vertical',
              minHeight: 160,
              lineHeight: typography.lineHeights.body,
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = palette.primary[400])}
            onBlur={(e) => (e.currentTarget.style.borderColor = colors.border)}
          />
        </div>

        {/* Optional mood */}
        <div style={{ marginBottom: spacing.xl }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm,
              marginBottom: spacing.md,
            }}
          >
            <Smile size={16} color={colors.textSecondary} />
            <span
              style={{
                fontFamily: typography.fontFamily,
                fontSize: typography.sizes.caption,
                color: colors.textSecondary,
                fontWeight: typography.weights.medium,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Mood (optional)
            </span>
            {mood > 0 && (
              <button
                onClick={() => { setMood(0); triggerHaptic('light'); }}
                style={{
                  fontFamily: typography.fontFamily,
                  fontSize: 11, color: colors.textMuted,
                  backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Clear
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: spacing.sm, justifyContent: 'space-between' }}>
            <button
              onClick={() => { setMood(0); triggerHaptic('light'); }}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing.xs,
                padding: `${spacing.md}px ${spacing.xs}px`,
                backgroundColor: mood === 0 ? colors.bg : colors.surface,
                border: `2px solid ${mood === 0 ? colors.borderStrong : colors.border}`,
                borderRadius: radii.lg, cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ fontSize: 20, opacity: 0.4 }}>{'\u2014'}</span>
              <span style={{ fontFamily: typography.fontFamily, fontSize: 10, color: colors.textSecondary }}>Skip</span>
            </button>
            {MOOD_OPTIONS.map(({ level, emoji, label, color }) => {
              const selected = mood === level;
              return (
                <button
                  key={level}
                  onClick={() => { setMood(level); triggerHaptic('light'); }}
                  style={{
                    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing.xs,
                    padding: `${spacing.md}px ${spacing.xs}px`,
                    backgroundColor: selected ? `${color}15` : colors.surface,
                    border: `2px solid ${selected ? color : colors.border}`,
                    borderRadius: radii.lg, cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    transform: selected ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  <span style={{ fontSize: 20, lineHeight: 1 }}>{emoji}</span>
                  <span style={{ fontFamily: typography.fontFamily, fontSize: 10, color: selected ? color : colors.textSecondary, fontWeight: typography.weights.medium }}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional craving level */}
        <div style={{ marginBottom: spacing.xxl }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm,
              marginBottom: spacing.md,
            }}
          >
            <Wind size={16} color={colors.textSecondary} />
            <span
              style={{
                fontFamily: typography.fontFamily,
                fontSize: typography.sizes.caption,
                color: colors.textSecondary,
                fontWeight: typography.weights.medium,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Craving level (optional)
            </span>
            {cravingLevel > 0 && (
              <button
                onClick={() => { setCravingLevel(0); triggerHaptic('light'); }}
                style={{
                  fontFamily: typography.fontFamily,
                  fontSize: 11, color: colors.textMuted,
                  backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Clear
              </button>
            )}
          </div>
          <div
            style={{
              backgroundColor: colors.surface,
              borderRadius: radii.lg,
              padding: spacing.lg,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
              <span style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.caption, color: colors.textSecondary }}>
                {cravingLevel === 0 ? 'Not set' : `${cravingLevel}/10`}
              </span>
              {cravingLevel > 0 && (
                <span style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.title, fontWeight: typography.weights.bold, color: palette.accent[400] }}>
                  {cravingLevel}
                </span>
              )}
            </div>
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={cravingLevel}
              onChange={(e) => setCravingLevel(Number(e.target.value))}
              style={{
                width: '100%',
                height: 28,
                appearance: 'none',
                background: cravingLevel > 0
                  ? `linear-gradient(to right, ${palette.accent[400]} 0%, ${palette.accent[400]} ${pct}%, ${colors.border} ${pct}%, ${colors.border} 100%)`
                  : colors.border,
                borderRadius: radii.full,
                cursor: 'pointer',
                outline: 'none',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: spacing.xs }}>
              <span style={{ fontFamily: typography.fontFamily, fontSize: 11, color: colors.textMuted }}>None</span>
              <span style={{ fontFamily: typography.fontFamily, fontSize: 11, color: colors.textMuted }}>Overwhelming</span>
            </div>
          </div>
        </div>

        {/* Save button (bottom) */}
        <button
          onClick={handleSave}
          disabled={!canSave}
          style={{
            width: '100%',
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.body,
            fontWeight: typography.weights.semibold,
            color: canSave ? palette.neutral[50] : colors.textMuted,
            backgroundColor: canSave ? palette.primary[600] : colors.border,
            border: 'none',
            borderRadius: radii.lg,
            padding: `${spacing.lg}px ${spacing.xl}px`,
            cursor: canSave ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
            transition: 'opacity 0.2s ease',
          }}
        >
          <Check size={20} /> {isEditing ? 'Update entry' : 'Save entry'}
        </button>
      </div>
    </div>
  );
}
