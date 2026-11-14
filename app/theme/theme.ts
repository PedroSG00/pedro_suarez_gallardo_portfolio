/**
 * Theme utilities — T12 (RF-6)
 * Theme model and persistence; storage event sync; invalid value fallback;
 * blocked and full storage handling.
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
    // localStorage blocked — silent, fall through to system
  }
  return 'system';
}

export function saveTheme(value: ThemeValue): void {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Silent write failure (blocked or full storage)
  }
}

export function resolveActiveTheme(): ThemeValue {
  const saved = getSavedTheme();
  if (saved === 'light' || saved === 'dark' || saved === 'system') {
    return saved;
  }
  // Invalid value fallback to system
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
