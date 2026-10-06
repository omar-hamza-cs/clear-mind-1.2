// ─────────────────────────────────────────────────────────────
// ClearMind — Tab Bar Placeholder
// Full tab navigation built in Phase 3+.
// ─────────────────────────────────────────────────────────────

import { Home, CheckSquare, BookOpen, TrendingUp, Settings } from 'lucide-react';
import { useTab, type TabKey } from '@/context/Navigation';
import { useTheme } from '@/context/ThemeProvider';
import { typography, spacing, radii, palette } from '@/constants/theme';

const TABS: { key: TabKey; label: string; icon: typeof Home }[] = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'checkin', label: 'Check-In', icon: CheckSquare },
  { key: 'journal', label: 'Journal', icon: BookOpen },
  { key: 'progress', label: 'Progress', icon: TrendingUp },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export function TabBar() {
  const { activeTab, setActiveTab } = useTab();
  const { colors } = useTheme();

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderTop: `1px solid ${colors.border}`,
        padding: `${spacing.sm}px 0`,
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 100,
      }}
    >
      {TABS.map(({ key, label, icon: Icon }) => {
        const isActive = activeTab === key;
        const iconColor = isActive ? palette.primary[400] : colors.textMuted;
        const labelColor = isActive ? colors.text : colors.textMuted;

        return (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: spacing.xs,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: `${spacing.xs}px ${spacing.sm}px`,
              fontFamily: typography.fontFamily,
              fontSize: typography.sizes.caption,
              fontWeight: isActive
                ? typography.weights.semibold
                : typography.weights.regular,
              color: labelColor,
              transition: 'color 0.2s ease',
            }}
          >
            <Icon
              size={24}
              color={iconColor}
              strokeWidth={isActive ? 2.4 : 2}
              style={{ transition: 'color 0.2s ease' }}
            />
            {label}
          </button>
        );
      })}
    </div>
  );
}
