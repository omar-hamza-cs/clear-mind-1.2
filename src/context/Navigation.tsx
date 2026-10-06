// ─────────────────────────────────────────────────────────────
// ClearMind — Simple Navigation Context
// Mirrors Expo Router structure: (onboarding), (tabs), and stack screens.
// Works in a Vite web environment without expo-router.
// ─────────────────────────────────────────────────────────────

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

export type RouteName =
  | 'splash'
  | 'onboarding'
  | 'tabs'
  | 'checkin-detail'
  | 'craving-toolkit'
  | 'journal-editor'
  | 'milestone-detail';

export interface Route {
  name: RouteName;
  params?: Record<string, string>;
}

interface NavContextValue {
  current: Route;
  navigate: (name: RouteName, params?: Record<string, string>) => void;
  goBack: () => void;
  canGoBack: boolean;
  stack: Route[];
}

const NavContext = createContext<NavContextValue | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<Route[]>([{ name: 'splash' }]);

  const current = stack[stack.length - 1];

  const navigate = (name: RouteName, params?: Record<string, string>) => {
    setStack((prev) => [...prev, { name, params }]);
  };

  const goBack = () => {
    setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  // Sync with browser history for back button support
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handler = () => {
      setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
    };

    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({}, '');
    }
  }, [current]);

  const value: NavContextValue = {
    current,
    navigate,
    goBack,
    canGoBack: stack.length > 1,
    stack,
  };

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

export function useNavigation(): NavContextValue {
  const ctx = useContext(NavContext);
  if (!ctx) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return ctx;
}

// ─── Tab state ──────────────────────────────────────────────

export type TabKey = 'home' | 'checkin' | 'journal' | 'progress' | 'settings';

interface TabContextValue {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
}

const TabContext = createContext<TabContextValue | null>(null);

export function TabProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  return (
    <TabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabContext.Provider>
  );
}

export function useTab(): TabContextValue {
  const ctx = useContext(TabContext);
  if (!ctx) {
    throw new Error('useTab must be used within a TabProvider');
  }
  return ctx;
}
