// ─────────────────────────────────────────────────────────────
// ClearMind — Privacy Screen
// app/privacy.tsx
//
// Explains what data is stored, where it lives, and user rights.
// ─────────────────────────────────────────────────────────────

import {
  ArrowLeft,
  Shield,
  Database,
  Lock,
  Eye,
  Trash2,
  Download,
  Heart,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeProvider';
import { typography, spacing, radii, palette } from '@/constants/theme';

interface PrivacyScreenProps {
  onClose: () => void;
}

export function PrivacyScreen({ onClose }: PrivacyScreenProps) {
  const { colors } = useTheme();

  const sections: { icon: typeof Shield; title: string; body: string }[] = [
    {
      icon: Database,
      title: 'What we store',
      body: 'ClearMind stores your profile, daily check-ins, craving logs, journal entries, milestones, and settings. This includes your quit date, spending habits, reasons for quitting, and mood data.',
    },
    {
      icon: Lock,
      title: 'Where your data lives',
      body: 'All data is stored locally on your device using browser storage. Nothing is uploaded to a server. There is no cloud sync, no account, and no tracking. Your information never leaves your device.',
    },
    {
      icon: Eye,
      title: 'Who can see it',
      body: 'Only you. No one else has access to your data — not ClearMind developers, not advertisers, not third parties. There are no analytics, no telemetry, and no background data collection.',
    },
    {
      icon: Download,
      title: 'Export your data',
      body: 'You can export all your data at any time as a JSON file from Settings > Data. This includes everything stored in the app, formatted in a readable structure.',
    },
    {
      icon: Trash2,
      title: 'Delete your data',
      body: 'You can reset your progress or delete all data from Settings > Data. Deletion is permanent and cannot be undone. Since data lives on your device, clearing your browser storage also removes everything.',
    },
    {
      icon: Heart,
      title: 'Our commitment',
      body: 'ClearMind was built to help you, not to profit from your data. We believe recovery tools should be private by default. Your journey is yours alone.',
    },
  ];

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
      <div style={{ maxWidth: 560, margin: '0 auto', padding: spacing.xl, paddingBottom: 100 }}>
        {/* Header */}
        <button
          onClick={onClose}
          style={{
            display: 'flex', alignItems: 'center', gap: spacing.xs,
            fontFamily: typography.fontFamily, fontSize: typography.sizes.body,
            color: colors.textSecondary, backgroundColor: 'transparent', border: 'none',
            cursor: 'pointer', padding: spacing.sm, marginBottom: spacing.lg,
          }}
        >
          <ArrowLeft size={20} /> Back to Settings
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xl }}>
          <div
            style={{
              width: 48, height: 48, borderRadius: radii.md,
              backgroundColor: palette.primary[100],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Shield size={24} color={palette.primary[600]} />
          </div>
          <div>
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
              Privacy
            </h1>
            <p style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.caption, color: colors.textSecondary, margin: 0 }}>
              Your data, your control
            </p>
          </div>
        </div>

        {/* Summary card */}
        <div
          style={{
            backgroundColor: palette.primary[100],
            borderRadius: radii.lg,
            padding: spacing.xl,
            marginBottom: spacing.xl,
            border: `1px solid ${palette.primary[200]}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
            <Lock size={18} color={palette.primary[700]} />
            <span style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.body, fontWeight: typography.weights.bold, color: palette.primary[900] }}>
              Private by default
            </span>
          </div>
          <p style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.caption, color: palette.primary[700], margin: 0, lineHeight: typography.lineHeights.body }}>
            ClearMind stores everything locally on your device. No accounts, no servers, no tracking. Your recovery journey is completely private.
          </p>
        </div>

        {/* Detail sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
          {sections.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              style={{
                backgroundColor: colors.surface,
                borderRadius: radii.lg,
                padding: spacing.lg,
                border: `1px solid ${colors.border}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
                <div
                  style={{
                    width: 36, height: 36, borderRadius: radii.sm,
                    backgroundColor: colors.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Icon size={18} color={colors.textSecondary} />
                </div>
                <h3
                  style={{
                    fontFamily: typography.fontFamily,
                    fontSize: typography.sizes.body,
                    fontWeight: typography.weights.semibold,
                    color: colors.text,
                    margin: 0,
                  }}
                >
                  {title}
                </h3>
              </div>
              <p
                style={{
                  fontFamily: typography.fontFamily,
                  fontSize: typography.sizes.caption,
                  color: colors.textSecondary,
                  margin: 0,
                  lineHeight: typography.lineHeights.body,
                }}
              >
                {body}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: spacing.xxl }}>
          <p style={{ fontFamily: typography.fontFamily, fontSize: 11, color: colors.textMuted, margin: 0 }}>
            ClearMind v1.0.0 — Privacy Policy
          </p>
          <p style={{ fontFamily: typography.fontFamily, fontSize: 11, color: colors.textMuted, margin: 0, marginTop: spacing.xs }}>
            Last updated: October 2026
          </p>
        </div>
      </div>
    </div>
  );
}
