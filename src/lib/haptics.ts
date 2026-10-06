// ─────────────────────────────────────────────────────────────
// ClearMind — Haptics Mock (Web-safe)
// Wraps native haptics with silent web fallbacks.
// ─────────────────────────────────────────────────────────────

export type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export function triggerHaptic(style: HapticStyle = 'light'): void {
  // Web fallback: silent no-op
  // Native: would call Haptics.impactAsync / notificationAsync
  // Guarded by Platform.OS === 'web' check at build time
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    const patterns: Record<HapticStyle, number | number[]> = {
      light: 10,
      medium: 20,
      heavy: 40,
      success: [10, 30, 10],
      warning: [20, 40, 20],
      error: [40, 60, 40],
    };
    try {
      navigator.vibrate(patterns[style]);
    } catch {
      // silent fallback
    }
  }
}
