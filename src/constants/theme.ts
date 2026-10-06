// ─────────────────────────────────────────────────────────────
// ClearMind Design System — Single Source of Truth
// ─────────────────────────────────────────────────────────────

export type ThemeMode = 'light' | 'dark' | 'system';

export type ColorShade = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
};

export type ColorSystem = {
  primary: ColorShade;
  secondary: ColorShade;
  accent: ColorShade;
  success: ColorShade;
  warning: ColorShade;
  error: ColorShade;
  neutral: ColorShade;
};

// Sage Green — calm, healing, growth
const primary: ColorShade = {
  50: '#f2f8f2',
  100: '#e3eee3',
  200: '#c7dec8',
  300: '#a3c9a5',
  400: '#8FBC8F',
  500: '#6fa671',
  600: '#588a5a',
  700: '#476e49',
  800: '#385539',
  900: '#2c4329',
};

// Muted Teal — secondary support color
const secondary: ColorShade = {
  50: '#effaf8',
  100: '#d8f2ee',
  200: '#b3e4dd',
  300: '#84cfc6',
  400: '#5bb5ab',
  500: '#429e94',
  600: '#338078',
  700: '#2b6660',
  800: '#26524e',
  900: '#214341',
};

// Warm Terracotta/Amber — CTAs, encouragement
const accent: ColorShade = {
  50: '#fdf7f0',
  100: '#fbe9d4',
  200: '#f6cf9e',
  300: '#f0b067',
  400: '#e8933f',
  500: '#d9732a',
  600: '#c25c20',
  700: '#9d471c',
  800: '#7c3919',
  900: '#5d2d13',
};

// Success — achievements, positive milestones
const success: ColorShade = {
  50: '#f0fdf4',
  100: '#dcfce7',
  200: '#bbf7d0',
  300: '#86efac',
  400: '#4ade80',
  500: '#22c55e',
  600: '#16a34a',
  700: '#15803d',
  800: '#166534',
  900: '#14532d',
};

// Warning — caution, moderate cravings
const warning: ColorShade = {
  50: '#fffbeb',
  100: '#fef3c7',
  200: '#fde68a',
  300: '#fcd34d',
  400: '#fbbf24',
  500: '#f59e0b',
  600: '#d97706',
  700: '#b45309',
  800: '#92400e',
  900: '#78350f',
};

// Error — high craving, relapse (non-judgmental)
const error: ColorShade = {
  50: '#fef2f2',
  100: '#fee2e2',
  200: '#fecaca',
  300: '#fca5a5',
  400: '#f87171',
  500: '#ef4444',
  600: '#dc2626',
  700: '#b91c1c',
  800: '#991b1b',
  900: '#7f1d1d',
};

// Warm neutrals — off-whites to deep charcoals
const neutral: ColorShade = {
  50: '#fafaf9',
  100: '#f5f5f4',
  200: '#e7e5e4',
  300: '#d6d3d1',
  400: '#a8a29e',
  500: '#78716c',
  600: '#57534e',
  700: '#44403c',
  800: '#292524',
  900: '#1c1917',
};

const colorRamps: ColorSystem = {
  primary,
  secondary,
  accent,
  success,
  warning,
  error,
  neutral,
};

// ─── Semantic tokens (differ per mode) ──────────────────────

export type SemanticColors = {
  bg: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderStrong: string;
  overlay: string;
};

export const semanticColors: Record<'light' | 'dark', SemanticColors> = {
  light: {
    bg: neutral[50],
    surface: '#ffffff',
    surfaceElevated: '#ffffff',
    text: neutral[900],
    textSecondary: neutral[600],
    textMuted: neutral[400],
    border: neutral[200],
    borderStrong: neutral[300],
    overlay: 'rgba(28, 25, 23, 0.4)',
  },
  dark: {
    bg: '#0f0e0d',
    surface: neutral[800],
    surfaceElevated: '#33312e',
    text: neutral[50],
    textSecondary: neutral[300],
    textMuted: neutral[500],
    border: '#3a3735',
    borderStrong: '#4a4643',
    overlay: 'rgba(0, 0, 0, 0.6)',
  },
};

// ─── Typography ─────────────────────────────────────────────

export const typography = {
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  sizes: {
    caption: 12,
    body: 16,
    title: 20,
    display: 32,
  },
  lineHeights: {
    body: 1.5, // 150%
    heading: 1.2, // 120%
  },
} as const;

// ─── Spacing (8px system) ───────────────────────────────────

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

// ─── Border Radii ───────────────────────────────────────────

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// ─── Flat palette (for use in components that need specific ramp shades) ──

export const palette = {
  primary,
  secondary,
  accent,
  success,
  warning,
  error,
  neutral,
} as const;

// ─── Shadows (for box-shadow utilities) ─────────────────────

export const shadows = {
  sm: '0 1px 8px rgba(0,0,0,0.04)',
  md: '0 2px 16px rgba(0,0,0,0.06)',
  lg: '0 4px 24px rgba(0,0,0,0.08)',
  xl: '0 20px 60px rgba(0,0,0,0.3)',
} as const;

// ─── Full theme ─────────────────────────────────────────────

export const theme = {
  colors: colorRamps,
  semantic: semanticColors,
  typography,
  spacing,
  radii,
} as const;

// ─── Milestone definitions ──────────────────────────────────

export const MILESTONE_DAYS: number[] = [1, 3, 7, 14, 30, 60, 90, 180, 365];

// ─── Predefined quit reasons ────────────────────────────────

export const QUIT_REASONS: string[] = [
  'Better mental clarity',
  'Improved sleep',
  'Save money',
  'Better relationships',
  'Career motivation',
  'Physical health',
  'Emotional regulation',
  'Personal growth',
];

export const QUIT_GOALS: string[] = [
  '7 days',
  '14 days',
  '30 days',
  '90 days',
  '6 months',
  '1 year',
  'For good',
];
