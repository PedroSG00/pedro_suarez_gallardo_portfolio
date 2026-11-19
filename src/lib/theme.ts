export type Theme = "light" | "dark";
export type StoredTheme = Theme | null;

export const THEME_STORAGE_KEY = "psg-theme";

export function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

export function resolveTheme(stored: StoredTheme, systemPrefersDark: boolean): Theme {
  if (isTheme(stored)) {
    return stored;
  }
  return systemPrefersDark ? "dark" : "light";
}
