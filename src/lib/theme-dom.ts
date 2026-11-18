import { Theme, StoredTheme, THEME_STORAGE_KEY, isTheme, resolveTheme } from "./theme";

export function readStoredTheme(storage?: Pick<Storage, "getItem"> | null): StoredTheme {
  if (storage === null) {
    return null;
  }
  const store = storage ?? window.localStorage;
  try {
    const value = store.getItem(THEME_STORAGE_KEY);
    return isTheme(value) ? value : null;
  } catch {
    return null;
  }
}

export function currentTheme(root: HTMLElement, systemPrefersDark: boolean): Theme {
  if (isTheme(root.dataset.theme)) {
    return root.dataset.theme;
  }
  return resolveTheme(null, systemPrefersDark);
}

export function applyTheme(root: HTMLElement, theme: Theme): void {
  root.dataset.theme = theme;
}
