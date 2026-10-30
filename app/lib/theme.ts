/**
 * Theme utilities — T-03 implementation
 * RF: RF-2, RF-4, RF-7 (manual/system resolution, persistence,
 * storage event sync, invalid value fallback, blocked storage)
 */

export type ThemeValue = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme';

export function getSavedTheme(): ThemeValue {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'light' || raw === 'dark' || raw === 'system') {
      return raw;
    }
  } catch {
    // Edge case 6: localStorage blocked — silent, fall through
  }
  return 'system';
}

export function saveTheme(value: ThemeValue): void {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Silent write failure (RF-4, edge case 6)
  }
}

export function resolveActiveTheme(): ThemeValue {
  const saved = getSavedTheme();
  if (saved === 'light' || saved === 'dark' || saved === 'system') {
    return saved;
  }
  // Edge case 5: invalid value fallback to system
  return 'system';
}

export function listenStorageChanges(callback: (value: ThemeValue) => void): () => void {
  const handler = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      const val = event.newValue;
      if (val === 'light' || val === 'dark' || val === 'system') {
        callback(val);
      } else if (!val) {
        callback('system');
      }
    }
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}
