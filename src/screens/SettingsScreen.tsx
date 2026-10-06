// ─────────────────────────────────────────────────────────────
// ClearMind — Settings Screen
// app/(tabs)/settings.tsx
//
// Profile, Appearance, Notifications, Data (export/reset/delete), About
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  BellOff,
  Calendar,
  Wind,
  Trophy,
  AlertCircle,
  ChevronRight,
  Trash2,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Monitor,
  Download,
  RotateCcw,
  Shield,
  Info,
  Pencil,
  X,
  Check,
  Target,
  Wallet,
  Heart,
  Clock,
} from 'lucide-react';
import { useStore } from '@/store';
import { useTheme } from '@/context/ThemeProvider';
import { typography, spacing, radii, palette } from '@/constants/theme';
import { QUIT_REASONS, QUIT_GOALS } from '@/constants/theme';
import { triggerHaptic } from '@/lib/haptics';
import {
  getNotificationPermission,
  requestNotificationPermission,
  rescheduleAllNotifications,
  type NotificationPermissionStatus,
} from '@/lib/notifications';
import { buildExportData, exportDataAsJSON } from '@/lib/exportData';
import { getCurrentStreakDays, formatMoneyDetailed, getCurrencySymbol } from '@/lib/stats';
import { PrivacyScreen } from '@/screens/PrivacyScreen';
import type { NotificationConfig, SpendingPeriod } from '@/types';
import type { ThemeMode } from '@/constants/theme';

type ConfirmAction = 'resetProgress' | 'deleteAll' | null;

export function SettingsScreen() {
  const { colors } = useTheme();
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const resetAll = useStore((s) => s.resetAll);
  const resetProgress = useStore((s) => s.resetProgress);
  const profile = useStore((s) => s.profile);
  const updateProfile = useStore((s) => s.updateProfile);
  const checkIns = useStore((s) => s.checkIns);
  const cravings = useStore((s) => s.cravings);
  const journal = useStore((s) => s.journal);
  const milestones = useStore((s) => s.milestones);
  const streakHistory = useStore((s) => s.streakHistory);

  const [permission, setPermission] = useState<NotificationPermissionStatus>('undetermined');
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [editingField, setEditingField] = useState<'quitDate' | 'spending' | 'reasons' | 'goal' | null>(null);

  useEffect(() => {
    getNotificationPermission().then(setPermission);
  }, []);

  const permissionDenied = permission === 'denied';

  // ── Notification handlers ──
  const handleToggleNotifications = useCallback(async () => {
    triggerHaptic('light');
    if (!settings.notifications.enabled) {
      const status = await requestNotificationPermission();
      setPermission(status);
      if (status !== 'granted') {
        updateSettings({ notifications: { ...settings.notifications, enabled: false } });
        return;
      }
      const newConfig = { ...settings.notifications, enabled: true };
      updateSettings({ notifications: newConfig });
      await rescheduleAllNotifications(newConfig);
    } else {
      const newConfig = { ...settings.notifications, enabled: false };
      updateSettings({ notifications: newConfig });
      await rescheduleAllNotifications(newConfig);
    }
  }, [settings.notifications, updateSettings]);

  const handleToggleSubSetting = useCallback(async (key: keyof NotificationConfig) => {
    triggerHaptic('light');
    if (permissionDenied) return;
    const newConfig = { ...settings.notifications, [key]: !settings.notifications[key] };
    updateSettings({ notifications: newConfig });
    await rescheduleAllNotifications(newConfig);
  }, [settings.notifications, updateSettings, permissionDenied]);

  const handleTimeChange = useCallback(async (hour: number, minute: number) => {
    triggerHaptic('light');
    const newConfig = { ...settings.notifications, checkInHour: hour, checkInMinute: minute };
    updateSettings({ notifications: newConfig });
    await rescheduleAllNotifications(newConfig);
  }, [settings.notifications, updateSettings]);

  const handleThemeChange = useCallback((theme: ThemeMode) => {
    triggerHaptic('light');
    updateSettings({ theme });
  }, [updateSettings]);

  // ── Data handlers ──
  const handleExport = useCallback(() => {
    triggerHaptic('success');
    const data = buildExportData({
      profile,
      checkIns,
      cravings,
      journal,
      milestones,
      settings,
      streakHistory,
    });
    exportDataAsJSON(data);
  }, [profile, checkIns, cravings, journal, milestones, settings, streakHistory]);

  const handleConfirm = useCallback(() => {
    triggerHaptic('warning');
    if (confirmAction === 'resetProgress') {
      resetProgress();
    } else if (confirmAction === 'deleteAll') {
      resetAll();
    }
    setConfirmAction(null);
  }, [confirmAction, resetProgress, resetAll]);

  // ── Profile edit handlers ──
  const handleQuitDateChange = useCallback((newDate: string) => {
    if (!profile) return;
    const dt = new Date(newDate).getTime();
    if (isNaN(dt)) return;
    triggerHaptic('light');
    updateProfile({ lastUseAt: dt, quitDate: dt });
    setEditingField(null);
  }, [profile, updateProfile]);

  const handleSpendingChange = useCallback((amount: number, period: SpendingPeriod, currency: string) => {
    if (!profile) return;
    triggerHaptic('light');
    updateProfile({ spending: { amount, period, currency } });
    setEditingField(null);
  }, [profile, updateProfile]);

  const handleReasonsChange = useCallback((reasons: string[], customReason: string) => {
    if (!profile) return;
    triggerHaptic('light');
    updateProfile({ reasons, customReason });
    setEditingField(null);
  }, [profile, updateProfile]);

  const handleGoalChange = useCallback((goal: string) => {
    if (!profile) return;
    triggerHaptic('light');
    updateProfile({ goal });
    setEditingField(null);
  }, [profile, updateProfile]);

  // ── Derived display values ──
  const themeOptions: { key: ThemeMode; label: string; icon: typeof Sun }[] = [
    { key: 'light', label: 'Light', icon: Sun },
    { key: 'dark', label: 'Dark', icon: Moon },
    { key: 'system', label: 'System', icon: Monitor },
  ];

  const timeStr = `${String(settings.notifications.checkInHour).padStart(2, '0')}:${String(settings.notifications.checkInMinute).padStart(2, '0')}`;
  const currentStreak = profile ? getCurrentStreakDays(profile.lastUseAt) : 0;
  const quitDateStr = profile ? new Date(profile.lastUseAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
  const spendingStr = profile ? `${getCurrencySymbol(profile.spending.currency)}${profile.spending.amount} / ${profile.spending.period}` : '';
  const reasonsStr = profile ? (profile.reasons.length > 0 ? `${profile.reasons.length} reason${profile.reasons.length !== 1 ? 's' : ''}` : 'None selected') : '';

  // Privacy screen overlay
  if (showPrivacy) {
    return <PrivacyScreen onClose={() => setShowPrivacy(false)} />;
  }

  // Edit modals
  if (editingField === 'quitDate' && profile) {
    return (
      <QuitDateEditor
        currentDate={new Date(profile.lastUseAt).toISOString().slice(0, 10)}
        onSave={handleQuitDateChange}
        onCancel={() => setEditingField(null)}
        currentStreak={currentStreak}
      />
    );
  }
  if (editingField === 'spending' && profile) {
    return (
      <SpendingEditor
        currentAmount={profile.spending.amount}
        currentPeriod={profile.spending.period}
        currentCurrency={profile.spending.currency}
        onSave={handleSpendingChange}
        onCancel={() => setEditingField(null)}
      />
    );
  }
  if (editingField === 'reasons' && profile) {
    return (
      <ReasonsEditor
        currentReasons={profile.reasons}
        currentCustom={profile.customReason}
        onSave={handleReasonsChange}
        onCancel={() => setEditingField(null)}
      />
    );
  }
  if (editingField === 'goal' && profile) {
    return (
      <GoalEditor
        currentGoal={profile.goal}
        onSave={handleGoalChange}
        onCancel={() => setEditingField(null)}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.bg, paddingBottom: 100 }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: `${spacing.xl}px ${spacing.xl}px` }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xl }}>
          <div
            style={{
              width: 48, height: 48, borderRadius: radii.md,
              backgroundColor: colors.surface,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${colors.border}`,
            }}
          >
            <SettingsIcon size={24} color={colors.textSecondary} />
          </div>
          <h1
            style={{
              fontFamily: typography.fontFamily,
              fontSize: typography.sizes.display,
              fontWeight: typography.weights.bold,
              color: colors.text,
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Settings
          </h1>
        </div>

        {/* ── Permission denied banner ── */}
        {permissionDenied && (
          <div
            style={{
              display: 'flex', alignItems: 'flex-start', gap: spacing.md,
              padding: spacing.lg, marginBottom: spacing.lg,
              backgroundColor: palette.warning[100], borderRadius: radii.lg, border: '1px solid #fde68a',
            }}
          >
            <AlertCircle size={20} color={palette.warning[600]} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.body, fontWeight: typography.weights.semibold, color: palette.warning[800], marginBottom: spacing.xs }}>
                Notifications are blocked
              </div>
              <p style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.caption, color: palette.warning[800], margin: 0, lineHeight: typography.lineHeights.body }}>
                To receive reminders and alerts, enable notifications in your device or browser settings.
              </p>
            </div>
          </div>
        )}

        {/* ── Profile ── */}
        <SectionTitle>Profile</SectionTitle>
        <Card>
          <ProfileRow
            icon={<Clock size={20} color={palette.accent[400]} />}
            label="Quit date"
            value={quitDateStr}
            subtext={`${currentStreak} days clean`}
            onEdit={() => setEditingField('quitDate')}
          />
          <Divider />
          <ProfileRow
            icon={<Wallet size={20} color={palette.secondary[600]} />}
            label="Spending"
            value={spendingStr}
            subtext="Affects money saved calculations"
            onEdit={() => setEditingField('spending')}
          />
          <Divider />
          <ProfileRow
            icon={<Heart size={20} color={palette.accent[400]} />}
            label="Reasons"
            value={reasonsStr}
            subtext={profile?.customReason ? `+ custom reason` : undefined}
            onEdit={() => setEditingField('reasons')}
          />
          <Divider />
          <ProfileRow
            icon={<Target size={20} color={palette.accent[500]} />}
            label="Goal"
            value={profile?.goal ?? ''}
            onEdit={() => setEditingField('goal')}
          />
        </Card>

        {/* ── Appearance ── */}
        <SectionTitle>Appearance</SectionTitle>
        <Card>
          <div style={{ display: 'flex', gap: spacing.sm }}>
            {themeOptions.map(({ key, label, icon: Icon }) => {
              const active = settings.theme === key;
              return (
                <button
                  key={key}
                  onClick={() => handleThemeChange(key)}
                  style={{
                    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing.xs,
                    padding: spacing.md,
                    backgroundColor: active ? palette.primary[100] : colors.bg,
                    border: `2px solid ${active ? palette.primary[600] : colors.border}`,
                    borderRadius: radii.md, cursor: 'pointer', transition: 'all 0.2s ease',
                  }}
                >
                  <Icon size={20} color={active ? palette.primary[600] : colors.textSecondary} />
                  <span style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.caption, fontWeight: typography.weights.medium, color: active ? palette.primary[700] : colors.textSecondary }}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* ── Notifications ── */}
        <SectionTitle>Notifications</SectionTitle>
        <Card>
          <ToggleRow
            icon={settings.notifications.enabled ? <Bell size={20} color={palette.primary[600]} /> : <BellOff size={20} color={colors.textMuted} />}
            label="Enable notifications"
            description={permissionDenied ? 'Blocked by device settings' : 'Daily reminders and alerts'}
            value={settings.notifications.enabled && !permissionDenied}
            onToggle={handleToggleNotifications}
            disabled={permissionDenied}
          />
          {settings.notifications.enabled && !permissionDenied && (
            <>
              <Divider />
              <ToggleRow
                icon={<Calendar size={20} color={palette.primary[400]} />}
                label="Daily check-in reminder"
                description={`Every day at ${timeStr}`}
                value={settings.notifications.checkInReminder}
                onToggle={() => handleToggleSubSetting('checkInReminder')}
              />
              {settings.notifications.checkInReminder && (
                <div style={{ marginLeft: 40, marginBottom: spacing.md }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                    <label style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.caption, color: colors.textSecondary }}>
                      Reminder time:
                    </label>
                    <input
                      type="time"
                      value={timeStr}
                      onChange={(e) => {
                        const [h, m] = e.target.value.split(':').map(Number);
                        if (!isNaN(h) && !isNaN(m)) handleTimeChange(h, m);
                      }}
                      style={{
                        fontFamily: typography.fontFamily, fontSize: typography.sizes.body,
                        color: colors.text, backgroundColor: colors.bg,
                        border: `1px solid ${colors.border}`, borderRadius: radii.sm,
                        padding: `${spacing.xs}px ${spacing.sm}px`, cursor: 'pointer', outline: 'none',
                      }}
                    />
                  </div>
                </div>
              )}
              <Divider />
              <ToggleRow
                icon={<Trophy size={20} color={palette.accent[500]} />}
                label="Milestone alerts"
                description="Get notified when you reach a new milestone"
                value={settings.notifications.milestoneAlerts}
                onToggle={() => handleToggleSubSetting('milestoneAlerts')}
              />
              <Divider />
              <ToggleRow
                icon={<Wind size={20} color={palette.accent[400]} />}
                label="Craving support"
                description="Afternoon check-in during craving hours"
                value={settings.notifications.cravingSupport}
                onToggle={() => handleToggleSubSetting('cravingSupport')}
              />
            </>
          )}
        </Card>

        {/* ── Data ── */}
        <SectionTitle>Data</SectionTitle>
        <Card>
          <DataRow
            icon={<Download size={20} color={palette.secondary[600]} />}
            label="Export my data"
            description="Download everything as a JSON file"
            onClick={handleExport}
            iconBgColor={palette.secondary[100]}
          />
          <Divider />
          <DataRow
            icon={<RotateCcw size={20} color={palette.accent[400]} />}
            label="Reset progress"
            description="Clear streak, check-ins, cravings, and milestones"
            onClick={() => { triggerHaptic('warning'); setConfirmAction('resetProgress'); }}
            iconBgColor={palette.accent[50]}
            labelColor={palette.accent[400]}
          />
          <Divider />
          <DataRow
            icon={<Trash2 size={20} color={palette.error[500]} />}
            label="Delete all data"
            description="Remove everything and restart from scratch"
            onClick={() => { triggerHaptic('warning'); setConfirmAction('deleteAll'); }}
            iconBgColor={palette.error[100]}
            labelColor={palette.error[500]}
          />
        </Card>

        {/* ── About ── */}
        <SectionTitle>About</SectionTitle>
        <Card>
          <DataRow
            icon={<Shield size={20} color={palette.primary[600]} />}
            label="Privacy"
            description="How your data is stored and protected"
            onClick={() => { triggerHaptic('light'); setShowPrivacy(true); }}
            iconBgColor={palette.primary[100]}
            showChevron
          />
          <Divider />
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, padding: `${spacing.sm}px 0` }}>
            <div style={{ width: 40, height: 40, borderRadius: radii.sm, backgroundColor: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Info size={20} color={colors.textSecondary} />
            </div>
            <div>
              <div style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.body, fontWeight: typography.weights.semibold, color: colors.text }}>
                ClearMind v1.0.0
              </div>
              <div style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.caption, color: colors.textSecondary }}>
                Your data stays on your device. Nothing is sent to a server.
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Confirmation modals */}
      {confirmAction && (
        <ConfirmModal
          action={confirmAction}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}

// ─── Helper components ───────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <h2
      style={{
        fontFamily: typography.fontFamily, fontSize: typography.sizes.caption,
        fontWeight: typography.weights.semibold, color: colors.textSecondary,
        textTransform: 'uppercase', letterSpacing: '0.06em',
        margin: 0, marginBottom: spacing.sm, marginTop: spacing.xl,
      }}
    >
      {children}
    </h2>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <div style={{ backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.lg, border: `1px solid ${colors.border}` }}>
      {children}
    </div>
  );
}

function Divider() {
  const { colors } = useTheme();
  return <div style={{ height: 1, backgroundColor: colors.border, margin: `${spacing.md}px 0` }} />;
}

function ProfileRow({ icon, label, value, subtext, onEdit }: { icon: React.ReactNode; label: string; value: string; subtext?: string; onEdit: () => void }) {
  const { colors } = useTheme();
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, flex: 1, minWidth: 0 }}>
        <div style={{ width: 40, height: 40, borderRadius: radii.sm, backgroundColor: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.caption, color: colors.textSecondary, fontWeight: typography.weights.medium, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {label}
          </div>
          <div style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.body, fontWeight: typography.weights.semibold, color: colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {value}
          </div>
          {subtext && <div style={{ fontFamily: typography.fontFamily, fontSize: 11, color: colors.textMuted }}>{subtext}</div>}
        </div>
      </div>
      <button
        onClick={onEdit}
        style={{
          width: 36, height: 36, borderRadius: radii.sm,
          backgroundColor: colors.bg, border: `1px solid ${colors.border}`, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}
      >
        <Pencil size={16} color={colors.textSecondary} />
      </button>
    </div>
  );
}

function DataRow({ icon, label, description, onClick, iconBgColor, labelColor, showChevron }: { icon: React.ReactNode; label: string; description: string; onClick: () => void; iconBgColor: string; labelColor?: string; showChevron?: boolean }) {
  const { colors } = useTheme();
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: 0, backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, flex: 1 }}>
        <div style={{ width: 40, height: 40, borderRadius: radii.sm, backgroundColor: iconBgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </div>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.body, fontWeight: typography.weights.semibold, color: labelColor ?? colors.text }}>
            {label}
          </div>
          <div style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.caption, color: colors.textSecondary }}>
            {description}
          </div>
        </div>
      </div>
      {showChevron && <ChevronRight size={18} color={colors.textMuted} />}
    </button>
  );
}

function ToggleRow({ icon, label, description, value, onToggle, disabled }: { icon: React.ReactNode; label: string; description: string; value: boolean; onToggle: () => void; disabled?: boolean }) {
  const { colors } = useTheme();
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, opacity: disabled ? 0.5 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, flex: 1 }}>
        <div style={{ width: 40, height: 40, borderRadius: radii.sm, backgroundColor: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </div>
        <div>
          <div style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.body, fontWeight: typography.weights.semibold, color: colors.text }}>{label}</div>
          <div style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.caption, color: colors.textSecondary }}>{description}</div>
        </div>
      </div>
      <button
        onClick={onToggle}
        disabled={disabled}
        style={{
          width: 48, height: 28, borderRadius: radii.full, border: 'none',
          backgroundColor: value ? palette.primary[400] : colors.border,
          cursor: disabled ? 'not-allowed' : 'pointer', position: 'relative',
          transition: 'background-color 0.2s ease', flexShrink: 0,
        }}
      >
        <div style={{ position: 'absolute', top: 3, left: value ? 25 : 3, width: 22, height: 22, borderRadius: '50%', backgroundColor: palette.neutral[50], transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
      </button>
    </div>
  );
}

// ─── Confirmation Modal ──────────────────────────────────────

function ConfirmModal({ action, onConfirm, onCancel }: { action: ConfirmAction; onConfirm: () => void; onCancel: () => void }) {
  const { colors } = useTheme();
  const isReset = action === 'resetProgress';

  return (
    <div
      style={{ position: 'fixed', inset: 0, backgroundColor: colors.overlay, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: spacing.lg, animation: 'cm-fade-in 0.2s ease both' }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: colors.surface, borderRadius: radii.xl, maxWidth: 400, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', animation: 'cm-scale-in 0.25s ease both' }}
      >
        <div style={{ padding: spacing.xl, textAlign: 'center' }}>
          <div
            style={{
              width: 56, height: 56, borderRadius: '50%',
              backgroundColor: isReset ? palette.accent[50] : palette.error[100],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto', marginBottom: spacing.lg,
            }}
          >
            {isReset ? <RotateCcw size={26} color={palette.accent[400]} /> : <Trash2 size={26} color={palette.error[500]} />}
          </div>
          <h3 style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.title, fontWeight: typography.weights.bold, color: colors.text, margin: 0, marginBottom: spacing.sm }}>
            {isReset ? 'Reset progress?' : 'Delete all data?'}
          </h3>
          <p style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.body, color: colors.textSecondary, margin: 0, marginBottom: spacing.xl, lineHeight: typography.lineHeights.body }}>
            {isReset
              ? 'This will clear your streak, check-ins, cravings, and milestones. Your profile and journal entries will be kept. This cannot be undone.'
              : 'This will permanently delete everything — your profile, streak history, check-ins, journal entries, milestones, and settings. The app will restart from onboarding. This cannot be undone.'}
          </p>
          <div style={{ display: 'flex', gap: spacing.sm }}>
            <button
              onClick={onCancel}
              style={{ flex: 1, fontFamily: typography.fontFamily, fontSize: typography.sizes.body, fontWeight: typography.weights.semibold, color: colors.text, backgroundColor: colors.bg, border: `1px solid ${colors.border}`, borderRadius: radii.lg, padding: `${spacing.md}px`, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              style={{
                flex: 1, fontFamily: typography.fontFamily, fontSize: typography.sizes.body, fontWeight: typography.weights.semibold,
                color: palette.neutral[50], backgroundColor: isReset ? palette.accent[400] : palette.error[500],
                border: 'none', borderRadius: radii.lg, padding: `${spacing.md}px`, cursor: 'pointer',
              }}
            >
              {isReset ? 'Reset progress' : 'Delete everything'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Profile Editors ─────────────────────────────────────────

function EditorShell({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  const { colors } = useTheme();
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: colors.bg, zIndex: 1000, animation: 'cm-fade-in 0.3s ease both', overflowY: 'auto' }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: spacing.xl, paddingBottom: 120 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl }}>
          <button
            onClick={onClose}
            style={{ display: 'flex', alignItems: 'center', gap: spacing.xs, fontFamily: typography.fontFamily, fontSize: typography.sizes.body, color: colors.textSecondary, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: spacing.sm }}
          >
            <X size={20} /> Cancel
          </button>
        </div>
        <h1 style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.display, fontWeight: typography.weights.bold, color: colors.text, margin: 0, marginBottom: spacing.xl, letterSpacing: '-0.02em' }}>
          {title}
        </h1>
        {children}
      </div>
    </div>
  );
}

function QuitDateEditor({ currentDate, onSave, onCancel, currentStreak }: { currentDate: string; onSave: (date: string) => void; onCancel: () => void; currentStreak: number }) {
  const { colors } = useTheme();
  const [date, setDate] = useState(currentDate);

  return (
    <EditorShell title="Edit quit date" onClose={onCancel}>
      <div style={{ marginBottom: spacing.lg }}>
        <label style={{ display: 'block', fontFamily: typography.fontFamily, fontSize: typography.sizes.caption, color: colors.textSecondary, fontWeight: typography.weights.medium, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: spacing.sm }}>
          When did you last use?
        </label>
        <input
          type="date"
          value={date}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setDate(e.target.value)}
          style={{
            width: '100%', fontFamily: typography.fontFamily, fontSize: typography.sizes.title,
            fontWeight: typography.weights.semibold, color: colors.text,
            backgroundColor: colors.surface, border: `1px solid ${colors.border}`,
            borderRadius: radii.lg, padding: spacing.lg, outline: 'none',
          }}
        />
        <p style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.caption, color: colors.textSecondary, margin: 0, marginTop: spacing.md, lineHeight: typography.lineHeights.body }}>
          Changing this date recalculates your streak and money saved. Current streak: {currentStreak} days.
        </p>
      </div>
      <SaveButton onClick={() => onSave(date)} />
    </EditorShell>
  );
}

function SpendingEditor({ currentAmount, currentPeriod, currentCurrency, onSave, onCancel }: { currentAmount: number; currentPeriod: SpendingPeriod; currentCurrency: string; onSave: (amount: number, period: SpendingPeriod, currency: string) => void; onCancel: () => void }) {
  const { colors } = useTheme();
  const [amount, setAmount] = useState(String(currentAmount));
  const [period, setPeriod] = useState<SpendingPeriod>(currentPeriod);
  const [currency, setCurrency] = useState(currentCurrency);

  const currencies = ['EUR', 'USD', 'GBP'];
  const periods: { key: SpendingPeriod; label: string }[] = [
    { key: 'daily', label: 'Daily' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
  ];

  return (
    <EditorShell title="Edit spending" onClose={onCancel}>
      <div style={{ marginBottom: spacing.lg }}>
        <FieldLabel>Currency</FieldLabel>
        <div style={{ display: 'flex', gap: spacing.sm, marginBottom: spacing.lg }}>
          {currencies.map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              style={{
                flex: 1, padding: spacing.md, borderRadius: radii.md, cursor: 'pointer',
                backgroundColor: currency === c ? palette.primary[100] : colors.surface,
                border: `2px solid ${currency === c ? palette.primary[600] : colors.border}`,
                fontFamily: typography.fontFamily, fontSize: typography.sizes.body,
                fontWeight: typography.weights.semibold,
                color: currency === c ? palette.primary[700] : colors.textSecondary,
                transition: 'all 0.2s ease',
              }}
            >
              {getCurrencySymbol(c)} {c}
            </button>
          ))}
        </div>

        <FieldLabel>Amount</FieldLabel>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min={0}
          style={inputStyle(colors)}
        />

        <FieldLabel>Period</FieldLabel>
        <div style={{ display: 'flex', gap: spacing.sm }}>
          {periods.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              style={{
                flex: 1, padding: spacing.md, borderRadius: radii.md, cursor: 'pointer',
                backgroundColor: period === key ? palette.primary[100] : colors.surface,
                border: `2px solid ${period === key ? palette.primary[600] : colors.border}`,
                fontFamily: typography.fontFamily, fontSize: typography.sizes.body,
                fontWeight: typography.weights.semibold,
                color: period === key ? palette.primary[700] : colors.textSecondary,
                transition: 'all 0.2s ease',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <SaveButton onClick={() => onSave(Number(amount) || 0, period, currency)} />
    </EditorShell>
  );
}

function ReasonsEditor({ currentReasons, currentCustom, onSave, onCancel }: { currentReasons: string[]; currentCustom: string; onSave: (reasons: string[], custom: string) => void; onCancel: () => void }) {
  const { colors } = useTheme();
  const [reasons, setReasons] = useState<string[]>(currentReasons);
  const [custom, setCustom] = useState(currentCustom);

  const toggleReason = (reason: string) => {
    triggerHaptic('light');
    setReasons((prev) => prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]);
  };

  return (
    <EditorShell title="Edit reasons" onClose={onCancel}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl }}>
        {QUIT_REASONS.map((reason) => {
          const selected = reasons.includes(reason);
          return (
            <button
              key={reason}
              onClick={() => toggleReason(reason)}
              style={{
                padding: `${spacing.sm}px ${spacing.lg}px`, borderRadius: radii.full, cursor: 'pointer',
                backgroundColor: selected ? palette.primary[100] : colors.surface,
                border: `2px solid ${selected ? palette.primary[600] : colors.border}`,
                fontFamily: typography.fontFamily, fontSize: typography.sizes.caption,
                fontWeight: typography.weights.medium,
                color: selected ? palette.primary[700] : colors.textSecondary,
                transition: 'all 0.2s ease',
              }}
            >
              {selected && <Check size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} />}
              {reason}
            </button>
          );
        })}
      </div>
      <FieldLabel>Your own reason (optional)</FieldLabel>
      <textarea
        value={custom}
        onChange={(e) => setCustom(e.target.value)}
        placeholder="Add a personal reason..."
        rows={3}
        style={{
          ...inputStyle(colors), resize: 'vertical', minHeight: 80,
          lineHeight: typography.lineHeights.body,
        }}
      />
      <SaveButton onClick={() => onSave(reasons, custom.trim())} />
    </EditorShell>
  );
}

function GoalEditor({ currentGoal, onSave, onCancel }: { currentGoal: string; onSave: (goal: string) => void; onCancel: () => void }) {
  const { colors } = useTheme();
  const [goal, setGoal] = useState(currentGoal);

  return (
    <EditorShell title="Edit goal" onClose={onCancel}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
        {QUIT_GOALS.map((g) => (
          <button
            key={g}
            onClick={() => { triggerHaptic('light'); setGoal(g); }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: spacing.lg, borderRadius: radii.lg, cursor: 'pointer',
              backgroundColor: goal === g ? palette.primary[100] : colors.surface,
              border: `2px solid ${goal === g ? palette.primary[600] : colors.border}`,
              fontFamily: typography.fontFamily, fontSize: typography.sizes.body,
              fontWeight: typography.weights.semibold,
              color: goal === g ? palette.primary[700] : colors.text,
              transition: 'all 0.2s ease',
            }}
          >
            {g}
            {goal === g && <Check size={20} color={palette.primary[600]} />}
          </button>
        ))}
      </div>
      <div style={{ marginTop: spacing.xl }}>
        <SaveButton onClick={() => onSave(goal)} />
      </div>
    </EditorShell>
  );
}

// ─── Small shared bits ───────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <label style={{ display: 'block', fontFamily: typography.fontFamily, fontSize: typography.sizes.caption, color: colors.textSecondary, fontWeight: typography.weights.medium, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: spacing.sm }}>
      {children}
    </label>
  );
}

function inputStyle(colors: { surface: string; border: string; text: string }): React.CSSProperties {
  return {
    width: '100%', fontFamily: typography.fontFamily, fontSize: typography.sizes.body,
    color: colors.text, backgroundColor: colors.surface, border: `1px solid ${colors.border}`,
    borderRadius: radii.lg, padding: spacing.lg, outline: 'none', marginBottom: spacing.lg,
  };
}

function SaveButton({ onClick }: { onClick: () => void }) {
  const { colors } = useTheme();
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
        fontFamily: typography.fontFamily, fontSize: typography.sizes.body, fontWeight: typography.weights.semibold,
        color: palette.neutral[50], backgroundColor: palette.primary[600], border: 'none', borderRadius: radii.lg,
        padding: `${spacing.lg}px ${spacing.xl}px`, cursor: 'pointer',
      }}
    >
      <Check size={20} /> Save changes
    </button>
  );
}
