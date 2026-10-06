// ─────────────────────────────────────────────────────────────
// ClearMind — Theme Provider
// Manages light/dark/system theme with system preference detection.
// ─────────────────────────────────────────────────────────────

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  semanticColors,
  type SemanticColors,
  type ThemeMode,
} from '@/constants/theme';
import { useThemeMode } from '@/store';

type EffectiveTheme = 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  effective: EffectiveTheme;
  colors: SemanticColors;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): EffectiveTheme {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const storedMode = useThemeMode();
  const [systemTheme, setSystemTheme] = useState<EffectiveTheme>(getSystemTheme);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const effective: EffectiveTheme =
    storedMode === 'system' ? systemTheme : storedMode;

  const colors = semanticColors[effective];

  // Apply background to document
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.backgroundColor = colors.bg;
      document.body?.style.setProperty('background-color', colors.bg);
      document.body?.style.setProperty('color', colors.text);
      document.body?.style.setProperty(
        'color-scheme',
        effective === 'dark' ? 'dark' : 'light'
      );
    }
  }, [colors.bg, colors.text, effective]);

  // Prevent flash: set a data attribute
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = effective;
    }
  }, [effective]);

  const value: ThemeContextValue = {
    mode: storedMode,
    effective,
    colors,
    toggle: () => {
      // noop — mode is set via store updateSettings
    },
    setMode: () => {
      // noop — mode is set via store updateSettings
    },
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
