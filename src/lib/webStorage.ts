// ─────────────────────────────────────────────────────────────
// Web-safe localStorage wrapper (AsyncStorage substitute)
// Mirrors the subset of AsyncStorage used by zustand/persist.
// ─────────────────────────────────────────────────────────────

const memoryStore: Record<string, string> = {};

export const webStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // SSR or restricted env — fall through to memory
    }
    return memoryStore[key] ?? null;
  },

  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch {
      // fall through
    }
    memoryStore[key] = value;
  },

  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // fall through
    }
    delete memoryStore[key];
  },
};
