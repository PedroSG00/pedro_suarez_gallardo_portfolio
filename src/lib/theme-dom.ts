import { Theme, StoredTheme, THEME_STORAGE_KEY, isTheme, resolveTheme } from "./theme";

export interface ThemeDeps {
  root?: HTMLElement;
  storage?: Pick<Storage, "getItem" | "setItem">;
  reducedMotion?: () => boolean;
  startViewTransition?: (callback: () => void) => void;
}

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

export function setTheme(theme: Theme, deps: ThemeDeps = {}): void {
  if (!isTheme(theme)) {
    return;
  }
  const root = deps.root ?? document.documentElement;
  const storage = deps.storage ?? localStorageIfAvailable();
  const reduced = deps.reducedMotion ? deps.reducedMotion() : prefersReducedMotion();
  const start = deps.startViewTransition ?? document.startViewTransition?.bind(document);

  try {
    storage?.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // RF-7: if storage fails to write, there is no error nor blocking
  }

  let applied = false;
  function applyOnce(): void {
    if (applied) {
      return;
    }
    applied = true;
    root.dataset.theme = theme;
  }

  if (reduced || !start) {
    applyOnce();
    return;
  }

  try {
    start(applyOnce);
  } catch {
    applyOnce();
  }
}

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
}

function localStorageIfAvailable(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
