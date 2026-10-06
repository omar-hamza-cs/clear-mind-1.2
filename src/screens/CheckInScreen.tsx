// ─────────────────────────────────────────────────────────────
// ClearMind — Daily Check-In Screen (Full screen modal)
// app/check-in.tsx
//
// Flow: Mood → Craving → Sleep → Energy → Used? → Note → Save
// One check-in per calendar day (YYYY-MM-DD). Today is editable.
// Historical check-ins are read-only.
// ─────────────────────────────────────────────────────────────

import { useState, useMemo, useCallback } from 'react';
import {
  ArrowLeft,
  Check,
  Moon,
  Zap,
  Wind,
  CloudRain,
  Frown,
  Meh,
  Smile,
  Laugh,
  Heart,
  Home,
  RefreshCw,
  Calendar,
  Lock,
} from 'lucide-react';
import { useStore } from '@/store';
import { useTheme } from '@/context/ThemeProvider';
import { useTab } from '@/context/Navigation';
import { typography, spacing, radii, palette } from '@/constants/theme';
import { triggerHaptic } from '@/lib/haptics';
import { getTodayISODate } from '@/lib/stats';
import type { DailyCheckIn, MoodLevel } from '@/types';

interface CheckInScreenProps {
  onClose: () => void;
}

// ─── Mood data ──────────────────────────────────────────────

const MOODS: { level: MoodLevel; emoji: string; label: string; color: string; Icon: typeof Frown }[] = [
  { level: 1, emoji: '\uD83D\uDE2B', label: 'Awful',  color: palette.error[500], Icon: Frown },
  { level: 2, emoji: '\uD83D\uDE1E', label: 'Low',    color: palette.accent[400], Icon: CloudRain },
  { level: 3, emoji: '\uD83D\uDE10', label: 'Okay',   color: palette.accent[400], Icon: Meh },
  { level: 4, emoji: '\uD83D\uDE0A', label: 'Good',   color: palette.primary[400], Icon: Smile },
  { level: 5, emoji: '\uD83D\uDE04', label: 'Great',  color: palette.success[500], Icon: Laugh },
];

// ─── Reusable slider section ────────────────────────────────

interface SliderSectionProps {
  label: string;
  icon: typeof Zap;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  leftLabel: string;
  rightLabel: string;
  color: string;
  disabled?: boolean;
}

function SliderSection({
  label, icon: Icon, value, onChange, min, max, leftLabel, rightLabel, color, disabled,
}: SliderSectionProps) {
  const { colors } = useTheme();
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div
      style={{
        backgroundColor: colors.surface,
        borderRadius: radii.lg,
        padding: spacing.lg,
        border: `1px solid ${colors.border}`,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <Icon size={18} color={color} />
          <span style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.body, fontWeight: typography.weights.medium, color: colors.text }}>
            {label}
          </span>
        </div>
        <span style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.title, fontWeight: typography.weights.bold, color }}>
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: '100%',
          height: 28,
          appearance: 'none',
          background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, ${colors.border} ${pct}%, ${colors.border} 100%)`,
          borderRadius: radii.full,
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: spacing.xs }}>
        <span style={{ fontFamily: typography.fontFamily, fontSize: 11, color: colors.textMuted }}>{leftLabel}</span>
        <span style={{ fontFamily: typography.fontFamily, fontSize: 11, color: colors.textMuted }}>{rightLabel}</span>
      </div>
    </div>
  );
}

// ─── Result screens ─────────────────────────────────────────

function CheckInSaved({ onDone }: { onDone: () => void }) {
  const { colors } = useTheme();
  const { setActiveTab } = useTab();

  return (
    <div
      style={{
        position: 'fixed', inset: 0, backgroundColor: colors.bg,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: spacing.xl, zIndex: 1001, animation: 'cm-fade-in 0.4s ease both',
      }}
    >
      <div style={{ width: '100%', maxWidth: 380, textAlign: 'center' }}>
        <div
          style={{
            width: 100, height: 100, borderRadius: '50%', backgroundColor: palette.success[100],
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
            marginBottom: spacing.xl, animation: 'cm-scale-in 0.5s ease both',
          }}
        >
          <Check size={48} color={palette.success[600]} strokeWidth={2.5} />
        </div>
        <h1 style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.display, fontWeight: typography.weights.bold, color: colors.text, margin: 0, marginBottom: spacing.sm, letterSpacing: '-0.02em' }}>
          Check-in saved
        </h1>
        <p style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.body, color: colors.textSecondary, margin: 0, marginBottom: spacing.xxl, lineHeight: typography.lineHeights.body }}>
          Thanks for taking a moment to reflect. Awareness is the first step to change.
        </p>
        <button
          onClick={() => { setActiveTab('home'); onDone(); }}
          style={{
            width: '100%', fontFamily: typography.fontFamily, fontSize: typography.sizes.body, fontWeight: typography.weights.semibold,
            color: palette.neutral[50], backgroundColor: palette.primary[600], border: 'none', borderRadius: radii.lg,
            padding: `${spacing.lg}px ${spacing.xl}px`, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
          }}
        >
          <Home size={20} /> Back to Home
        </button>
      </div>
    </div>
  );
}

function RelapseFromCheckIn({ relapseCount, onDone }: { relapseCount: number; onDone: () => void }) {
  const { colors } = useTheme();
  const { setActiveTab } = useTab();

  return (
    <div
      style={{
        position: 'fixed', inset: 0, backgroundColor: colors.bg,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: spacing.xl, zIndex: 1001, animation: 'cm-fade-in 0.4s ease both',
      }}
    >
      <div style={{ width: '100%', maxWidth: 380, textAlign: 'center' }}>
        <div
          style={{
            width: 88, height: 88, borderRadius: '50%', backgroundColor: palette.warning[100],
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
            marginBottom: spacing.xl, animation: 'cm-scale-in 0.5s ease both',
          }}
        >
          <Heart size={40} color={palette.warning[600]} strokeWidth={2} />
        </div>
        <h1 style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.display, fontWeight: typography.weights.bold, color: colors.text, margin: 0, marginBottom: spacing.md, letterSpacing: '-0.02em' }}>
          It's okay
        </h1>
        <p style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.body, color: colors.textSecondary, margin: 0, marginBottom: spacing.lg, lineHeight: typography.lineHeights.body }}>
          Recovery isn't a straight line. Your check-in is saved, and your previous streak
          has been added to your history. What matters is that you're still here, trying again.
        </p>
        <div style={{ backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.xl, border: `1px solid ${colors.border}` }}>
          <p style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.caption, color: colors.textSecondary, margin: 0 }}>
            {relapseCount > 1 ? `This is reset #${relapseCount}. ` : ''}Each attempt teaches you something new about yourself.
          </p>
        </div>
        <button
          onClick={() => { setActiveTab('home'); onDone(); }}
          style={{
            width: '100%', fontFamily: typography.fontFamily, fontSize: typography.sizes.body, fontWeight: typography.weights.semibold,
            color: palette.neutral[50], backgroundColor: palette.accent[400], border: 'none', borderRadius: radii.lg,
            padding: `${spacing.lg}px ${spacing.xl}px`, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
          }}
        >
          <RefreshCw size={20} /> Start Fresh Today
        </button>
      </div>
    </div>
  );
}

// ─── Main check-in screen ───────────────────────────────────

export function CheckInScreen({ onClose }: CheckInScreenProps) {
  const { colors } = useTheme();
  const { setActiveTab } = useTab();

  const checkIns = useStore((s) => s.checkIns);
  const addCheckIn = useStore((s) => s.addCheckIn);
  const recordRelapse = useStore((s) => s.recordRelapse);
  const profile = useStore((s) => s.profile);

  const todayKey = getTodayISODate();
  const todaysCheckIn = checkIns[todayKey];
  const isEditingToday = !!todaysCheckIn;

  // Sorted historical check-in dates (excluding today)
  const historicalDates = useMemo(
    () => Object.keys(checkIns).filter((d) => d !== todayKey).sort().reverse(),
    [checkIns, todayKey]
  );

  // Form state — initialize from today's check-in if editing
  const [mood, setMood] = useState<MoodLevel>(todaysCheckIn?.mood ?? 3);
  const [craving, setCraving] = useState(todaysCheckIn?.craving ?? 5);
  const [sleep, setSleep] = useState(todaysCheckIn?.sleep ?? 5);
  const [energy, setEnergy] = useState(todaysCheckIn?.energy ?? 5);
  const [usedCannabis, setUsedCannabis] = useState(todaysCheckIn?.usedCannabis ?? false);
  const [note, setNote] = useState(todaysCheckIn?.note ?? '');

  const [showSaved, setShowSaved] = useState(false);
  const [showRelapse, setShowRelapse] = useState(false);
  const [relapseCount, setRelapseCount] = useState(0);
  const [selectedHistorical, setSelectedHistorical] = useState<string | null>(null);

  const handleSave = useCallback(() => {
    triggerHaptic('success');

    const checkIn: DailyCheckIn = {
      date: todayKey,
      mood,
      craving,
      sleep,
      energy,
      usedCannabis,
      note: note.trim(),
    };

    addCheckIn(checkIn);

    if (usedCannabis && !todaysCheckIn?.usedCannabis) {
      // Only trigger relapse if this is a new "used" — not re-saving an existing one
      recordRelapse();
      setRelapseCount((profile?.relapseCount ?? 0) + 1);
      setShowRelapse(true);
    } else {
      setShowSaved(true);
    }
  }, [mood, craving, sleep, energy, usedCannabis, note, todayKey, addCheckIn, recordRelapse, profile, todaysCheckIn]);

  const handleClose = useCallback(() => {
    setActiveTab('home');
    onClose();
  }, [setActiveTab, onClose]);

  // ── Result overlays ──
  if (showSaved) return <CheckInSaved onDone={handleClose} />;
  if (showRelapse) return <RelapseFromCheckIn relapseCount={relapseCount} onDone={handleClose} />;

  // ── Historical read-only view ──
  if (selectedHistorical) {
    const entry = checkIns[selectedHistorical];
    const moodData = MOODS.find((m) => m.level === entry.mood);
    const dateObj = new Date(selectedHistorical + 'T00:00:00');
    const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: colors.bg, zIndex: 1000, animation: 'cm-fade-in 0.3s ease both', overflowY: 'auto' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', padding: spacing.xl, paddingBottom: 100 }}>
          <button
            onClick={() => setSelectedHistorical(null)}
            style={{ display: 'flex', alignItems: 'center', gap: spacing.xs, fontFamily: typography.fontFamily, fontSize: typography.sizes.body, color: colors.textSecondary, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: `${spacing.sm}px 0`, marginBottom: spacing.lg }}
          >
            <ArrowLeft size={20} /> Back to check-ins
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
            <Calendar size={18} color={colors.textSecondary} />
            <span style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.caption, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: typography.weights.medium }}>
              {dateStr}
            </span>
          </div>
          <h1 style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.display, fontWeight: typography.weights.bold, color: colors.text, margin: 0, marginBottom: spacing.xl, letterSpacing: '-0.02em' }}>
            Past check-in
          </h1>

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
            {/* Mood */}
            <div style={{ backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.lg, border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: spacing.md }}>
              <span style={{ fontSize: 40 }}>{moodData?.emoji}</span>
              <div>
                <div style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.caption, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Mood</div>
                <div style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.title, fontWeight: typography.weights.bold, color: moodData?.color ?? colors.text }}>{moodData?.label}</div>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: spacing.sm }}>
              {[
                { label: 'Craving', value: entry.craving, color: palette.accent[400] },
                { label: 'Sleep', value: entry.sleep, color: palette.secondary[400] },
                { label: 'Energy', value: entry.energy, color: palette.primary[400] },
              ].map((s) => (
                <div key={s.label} style={{ flex: 1, backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.lg, border: `1px solid ${colors.border}`, textAlign: 'center' }}>
                  <div style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.title, fontWeight: typography.weights.bold, color: s.color }}>{s.value}</div>
                  <div style={{ fontFamily: typography.fontFamily, fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Used cannabis */}
            <div style={{ backgroundColor: entry.usedCannabis ? palette.warning[100] : palette.success[100], borderRadius: radii.lg, padding: spacing.lg, border: `1px solid ${entry.usedCannabis ? palette.warning[200] : palette.success[200]}`, display: 'flex', alignItems: 'center', gap: spacing.md }}>
              {entry.usedCannabis ? <CloudRain size={20} color={palette.warning[600]} /> : <Check size={20} color={palette.success[600]} />}
              <span style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.body, fontWeight: typography.weights.medium, color: entry.usedCannabis ? palette.warning[800] : palette.success[700] }}>
                {entry.usedCannabis ? 'Used cannabis that day' : 'Stayed sober that day'}
              </span>
            </div>

            {/* Note */}
            {entry.note && (
              <div style={{ backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.lg, border: `1px solid ${colors.border}` }}>
                <div style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.caption, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: spacing.sm }}>Note</div>
                <p style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.body, color: colors.text, margin: 0, lineHeight: typography.lineHeights.body, fontStyle: 'italic' }}>
                  "{entry.note}"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Main check-in form ──
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: colors.bg, zIndex: 1000, animation: 'cm-fade-in 0.3s ease both', overflowY: 'auto' }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: spacing.xl, paddingBottom: 100 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl }}>
          <button
            onClick={handleClose}
            style={{ display: 'flex', alignItems: 'center', gap: spacing.xs, fontFamily: typography.fontFamily, fontSize: typography.sizes.body, color: colors.textSecondary, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: spacing.sm }}
          >
            <ArrowLeft size={20} /> Back
          </button>
          {isEditingToday && (
            <span style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.caption, color: palette.primary[600], fontWeight: typography.weights.semibold, backgroundColor: palette.primary[100], padding: `${spacing.xs}px ${spacing.md}px`, borderRadius: radii.full }}>
              Editing today's check-in
            </span>
          )}
        </div>

        <h1 style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.display, fontWeight: typography.weights.bold, color: colors.text, margin: 0, marginBottom: spacing.xs, letterSpacing: '-0.02em' }}>
          Daily check-in
        </h1>
        <p style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.body, color: colors.textSecondary, margin: 0, marginBottom: spacing.xxl, lineHeight: typography.lineHeights.body }}>
          A quick reflection on how you're doing today.
        </p>

        {/* ── Mood picker ── */}
        <div style={{ marginBottom: spacing.xl }}>
          <div style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.caption, color: colors.textSecondary, fontWeight: typography.weights.medium, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: spacing.md }}>
            How's your mood?
          </div>
          <div style={{ display: 'flex', gap: spacing.sm, justifyContent: 'space-between' }}>
            {MOODS.map(({ level, emoji, label, color, Icon }) => {
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
                    transition: 'border-color 0.2s ease, background-color 0.2s ease, transform 0.1s ease',
                    transform: selected ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  <span style={{ fontSize: 32, lineHeight: 1 }}>{emoji}</span>
                  <span style={{ fontFamily: typography.fontFamily, fontSize: 11, fontWeight: typography.weights.medium, color: selected ? color : colors.textSecondary }}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Sliders ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md, marginBottom: spacing.xl }}>
          <SliderSection label="Craving level" icon={Wind} value={craving} onChange={setCraving} min={1} max={10} leftLabel="None" rightLabel="Overwhelming" color={palette.accent[400]} />
          <SliderSection label="Sleep quality" icon={Moon} value={sleep} onChange={setSleep} min={1} max={10} leftLabel="Poor" rightLabel="Excellent" color={palette.secondary[400]} />
          <SliderSection label="Energy level" icon={Zap} value={energy} onChange={setEnergy} min={1} max={10} leftLabel="Exhausted" rightLabel="Energized" color={palette.primary[400]} />
        </div>

        {/* ── Used cannabis? ── */}
        <div style={{ marginBottom: spacing.xl }}>
          <div style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.caption, color: colors.textSecondary, fontWeight: typography.weights.medium, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: spacing.md }}>
            Did you use cannabis today?
          </div>
          <div style={{ display: 'flex', gap: spacing.md }}>
            <button
              onClick={() => { setUsedCannabis(false); triggerHaptic('light'); }}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
                padding: `${spacing.lg}px ${spacing.md}px`,
                fontFamily: typography.fontFamily, fontSize: typography.sizes.body, fontWeight: typography.weights.semibold,
                backgroundColor: !usedCannabis ? palette.success[100] : colors.surface,
                color: !usedCannabis ? palette.success[700] : colors.textSecondary,
                border: `2px solid ${!usedCannabis ? palette.success[500] : colors.border}`,
                borderRadius: radii.lg, cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Check size={20} /> No, stayed sober
            </button>
            <button
              onClick={() => { setUsedCannabis(true); triggerHaptic('warning'); }}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
                padding: `${spacing.lg}px ${spacing.md}px`,
                fontFamily: typography.fontFamily, fontSize: typography.sizes.body, fontWeight: typography.weights.semibold,
                backgroundColor: usedCannabis ? palette.warning[100] : colors.surface,
                color: usedCannabis ? palette.warning[800] : colors.textSecondary,
                border: `2px solid ${usedCannabis ? palette.warning[500] : colors.border}`,
                borderRadius: radii.lg, cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <CloudRain size={20} /> Yes, I used
            </button>
          </div>
          {usedCannabis && (
            <p style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.caption, color: palette.warning[800], margin: 0, marginTop: spacing.sm, lineHeight: typography.lineHeights.body, fontStyle: 'italic' }}>
              That's okay. Your streak will reset, but your progress and money saved are preserved. Every day is a fresh start.
            </p>
          )}
        </div>

        {/* ── Optional note ── */}
        <div style={{ marginBottom: spacing.xxl }}>
          <div style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.caption, color: colors.textSecondary, fontWeight: typography.weights.medium, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: spacing.md }}>
            Note (optional)
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Anything on your mind? Triggers, wins, reflections..."
            rows={3}
            style={{
              width: '100%', fontFamily: typography.fontFamily, fontSize: typography.sizes.body,
              color: colors.text, backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`, borderRadius: radii.lg,
              padding: spacing.lg, resize: 'vertical', minHeight: 80,
              outline: 'none', lineHeight: typography.lineHeights.body,
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = palette.primary[400])}
            onBlur={(e) => (e.currentTarget.style.borderColor = colors.border)}
          />
        </div>

        {/* ── Save button ── */}
        <button
          onClick={handleSave}
          style={{
            width: '100%', fontFamily: typography.fontFamily, fontSize: typography.sizes.body, fontWeight: typography.weights.semibold,
            color: palette.neutral[50], backgroundColor: palette.primary[600], border: 'none', borderRadius: radii.lg,
            padding: `${spacing.lg}px ${spacing.xl}px`, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
            transition: 'opacity 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <Check size={20} /> {isEditingToday ? 'Update check-in' : 'Save check-in'}
        </button>

        {/* ── Historical check-ins ── */}
        {historicalDates.length > 0 && (
          <div style={{ marginTop: spacing.xxl }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
              <Lock size={14} color={colors.textMuted} />
              <span style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.caption, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: typography.weights.medium }}>
                Past check-ins
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
              {historicalDates.slice(0, 10).map((date) => {
                const entry = checkIns[date];
                const moodData = MOODS.find((m) => m.level === entry.mood);
                const dateObj = new Date(date + 'T00:00:00');
                const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

                return (
                  <button
                    key={date}
                    onClick={() => setSelectedHistorical(date)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: spacing.md, padding: spacing.md,
                      backgroundColor: colors.surface, border: `1px solid ${colors.border}`,
                      borderRadius: radii.md, cursor: 'pointer', textAlign: 'left',
                      transition: 'border-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = colors.borderStrong)}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = colors.border)}
                  >
                    <span style={{ fontSize: 24, flexShrink: 0 }}>{moodData?.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.body, fontWeight: typography.weights.medium, color: colors.text }}>
                        {dateStr}
                      </div>
                      <div style={{ fontFamily: typography.fontFamily, fontSize: 11, color: colors.textSecondary }}>
                        Mood: {moodData?.label} {'\u00B7'} Craving: {entry.craving}/10 {entry.usedCannabis ? ' \u00B7 Used' : ''}
                      </div>
                    </div>
                    <ArrowLeft size={16} color={colors.textMuted} style={{ transform: 'rotate(180deg)' }} />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
