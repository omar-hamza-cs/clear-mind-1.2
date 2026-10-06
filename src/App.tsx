// ─────────────────────────────────────────────────────────────
// ClearMind — App Root (app/_layout.tsx equivalent)
// Wraps app in ThemeProvider, checks hydration + onboarding,
// then routes to splash / onboarding / tabs.
// ─────────────────────────────────────────────────────────────

import { useState, useCallback, useEffect } from 'react';
import { useTheme } from '@/context/ThemeProvider';
import { typography, spacing } from '@/constants/theme';
import { ThemeProvider } from '@/context/ThemeProvider';
import { NavigationProvider, TabProvider, useTab } from '@/context/Navigation';
import { useStore, useIsHydrated } from '@/store';
import { rescheduleAllNotifications, getNotificationPermission } from '@/lib/notifications';
import { SplashScreen } from '@/components/SplashScreen';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { TabBar } from '@/components/TabBar';
import { HomeScreen } from '@/screens/HomeScreen';
import { CravingModeScreen } from '@/screens/CravingModeScreen';
import { CheckInScreen } from '@/screens/CheckInScreen';
import { ProgressScreen } from '@/screens/ProgressScreen';
import { JournalScreen } from '@/screens/JournalScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';

function CheckInPlaceholder({ onOpen }: { onOpen: () => void }) {
  const { colors } = useTheme();
  useEffect(() => { onOpen(); }, [onOpen]);
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, padding: spacing.xl }}>
      <p style={{ fontFamily: typography.fontFamily, fontSize: typography.sizes.body, color: colors.textMuted, margin: 0 }}>
        Opening check-in...
      </p>
    </div>
  );
}

function TabContent({ onOpenCraving, onOpenCheckIn }: { onOpenCraving: () => void; onOpenCheckIn: () => void }) {
  const { activeTab } = useTab();

  switch (activeTab) {
    case 'home':
      return <HomeScreen onOpenCraving={onOpenCraving} onOpenCheckIn={onOpenCheckIn} />;
    case 'checkin':
      return <CheckInPlaceholder onOpen={onOpenCheckIn} />;
    case 'journal':
      return <JournalScreen />;
    case 'progress':
      return <ProgressScreen />;
    case 'settings':
      return <SettingsScreen />;
    default:
      return <HomeScreen onOpenCraving={onOpenCraving} onOpenCheckIn={onOpenCheckIn} />;
  }
}

function AppRouter() {
  const isHydrated = useIsHydrated();
  const profile = useStore((s) => s.profile);
  const settings = useStore((s) => s.settings);
  const [cravingActive, setCravingActive] = useState(false);
  const [checkInActive, setCheckInActive] = useState(false);

  const openCraving = useCallback(() => setCravingActive(true), []);
  const closeCraving = useCallback(() => setCravingActive(false), []);
  const openCheckIn = useCallback(() => setCheckInActive(true), []);
  const closeCheckIn = useCallback(() => setCheckInActive(false), []);

  // Reschedule notifications on app open (when settings change or profile loads)
  useEffect(() => {
    if (!isHydrated || !profile) return;
    getNotificationPermission().then((perm) => {
      if (perm === 'granted') {
        rescheduleAllNotifications(settings.notifications);
      }
    });
  }, [isHydrated, profile, settings.notifications]);

  // Rule 4: Never render before hydration
  if (!isHydrated) {
    return <SplashScreen />;
  }

  // Not onboarded → onboarding flow
  if (!profile || !profile.onboardingComplete) {
    return <OnboardingFlow />;
  }

  // Onboarded → tabs
  return (
    <TabProvider>
      <div style={{ minHeight: '100vh' }}>
        <TabContent onOpenCraving={openCraving} onOpenCheckIn={openCheckIn} />
        <TabBar />
        {cravingActive && <CravingModeScreen onClose={closeCraving} />}
        {checkInActive && <CheckInScreen onClose={closeCheckIn} />}
      </div>
    </TabProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <NavigationProvider>
        <AppRouter />
      </NavigationProvider>
    </ThemeProvider>
  );
}
