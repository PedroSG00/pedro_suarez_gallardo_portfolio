/**
 * Theme utilities — T12 (RF-6)
 * Theme model and document class application.
 *
 * The inline boot script in <head> is the only reader of localStorage and the
 * only writer of the initial <html> class. The client provider reads the class
 * from the document and only writes it when the theme changes. Persistence
 * happens only when the visitor changes the theme.
 */

export type ThemeValue = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme';

const THEME_VALUES: readonly ThemeValue[] = ['light', 'dark', 'system'];

export function isThemeValue(value: unknown): value is ThemeValue {
  return value === 'light' || value === 'dark' || value === 'system';
}

/**
 * Reads the theme currently applied to <html>. This never touches storage:
 * the inline boot script is the only storage reader at boot.
 */
export function getThemeFromDocument(): ThemeValue {
  if (typeof document === 'undefined') return 'system';
  for (const value of THEME_VALUES) {
    if (document.documentElement.classList.contains(`theme-${value}`)) {
      return value;
    }
  }
  return 'system';
}

/**
 * Applies a theme value to <html> by swapping the theme classes.
 */
export function applyTheme(value: ThemeValue): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.remove(
    'theme-light',
    'theme-dark',
    'theme-system'
  );
  document.documentElement.classList.add(`theme-${value}`);
}

/**
 * Persists the theme choice. Never throws if storage is blocked or full.
 */
export function saveTheme(value: ThemeValue): void {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Silent write failure (blocked or full storage).
  }
}

/**
 * Subscribes to cross-tab theme changes. A deletion (newValue = null) or an
 * invalid value is treated as `system` (RF-6, case 22).
 */
export function listenStorageChanges(
  callback: (value: ThemeValue) => void
): () => void {
  const handler = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    callback(isThemeValue(event.newValue) ? event.newValue : 'system');
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}
