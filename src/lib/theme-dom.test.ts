import { describe, expect, test, beforeEach, afterEach } from "vitest";
import { applyTheme, currentTheme, readStoredTheme } from "./theme-dom";
import { THEME_STORAGE_KEY } from "./theme";

const ORIGINAL_LOCAL_STORAGE = window.localStorage;

function resetRoot(): void {
  const root = document.documentElement;
  root.removeAttribute("data-theme");
  root.className = "";
}

function restoreLocalStorage(): void {
  Object.defineProperty(window, "localStorage", {
    value: ORIGINAL_LOCAL_STORAGE,
    configurable: true,
    writable: true,
  });
}

beforeEach(() => {
  resetRoot();
  restoreLocalStorage();
  window.localStorage.removeItem(THEME_STORAGE_KEY);
});

afterEach(() => {
  resetRoot();
  restoreLocalStorage();
  window.localStorage.removeItem(THEME_STORAGE_KEY);
});

describe("readStoredTheme", () => {
  test("devuelve 'light' con un valor válido", () => {
    const storage = { getItem: () => "light" };
    expect(readStoredTheme(storage)).toBe("light");
  });

  test("devuelve 'dark' con un valor válido", () => {
    const storage = { getItem: () => "dark" };
    expect(readStoredTheme(storage)).toBe("dark");
  });

  test("devuelve null sin valor guardado", () => {
    const storage = { getItem: () => null };
    expect(readStoredTheme(storage)).toBeNull();
  });

  test("devuelve null con un valor inválido", () => {
    for (const value of ["auto", "", "Dark", "LIGHT", null]) {
      const storage = { getItem: () => value };
      expect(readStoredTheme(storage)).toBeNull();
    }
  });

  test("devuelve null si el almacenamiento lanza", () => {
    const storage = { getItem: () => {
      throw new Error("blocked");
    } };
    expect(readStoredTheme(storage)).toBeNull();
  });

  test("devuelve null si el almacenamiento es null", () => {
    expect(readStoredTheme(null)).toBeNull();
  });

  test("sin argumento lee el valor guardado de localStorage", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
    expect(readStoredTheme()).toBe("dark");
  });

  test("sin argumento usa localStorage y no propaga sus errores", () => {
    Object.defineProperty(window, "localStorage", {
      value: { getItem: () => {
        throw new Error("blocked");
      } },
      configurable: true,
      writable: true,
    });
    expect(readStoredTheme()).toBeNull();
  });
});

describe("applyTheme", () => {
  test("escribe solo data-theme y no añade clases ni otros atributos", () => {
    const root = document.documentElement;
    const before = Array.from(root.attributes).map((attr) => attr.name);
    applyTheme(root, "dark");
    const after = Array.from(root.attributes).map((attr) => attr.name);
    expect(root).toHaveAttribute("data-theme", "dark");
    expect(root.className).toBe("");
    expect(after.filter((name) => !before.includes(name))).toEqual(["data-theme"]);
  });

  test("sobreescribe el valor previo con el nuevo tema", () => {
    const root = document.documentElement;
    applyTheme(root, "light");
    applyTheme(root, "dark");
    expect(root).toHaveAttribute("data-theme", "dark");
  });
});

describe("currentTheme", () => {
  test("prefiere el atributo data-theme válido sobre el sistema", () => {
    const root = document.documentElement;
    root.dataset.theme = "dark";
    expect(currentTheme(root, false)).toBe("dark");
    root.dataset.theme = "light";
    expect(currentTheme(root, true)).toBe("light");
  });

  test("sin atributo cae a la preferencia del sistema", () => {
    const root = document.documentElement;
    expect(currentTheme(root, true)).toBe("dark");
    expect(currentTheme(root, false)).toBe("light");
  });

  test("con atributo inválido cae a la preferencia del sistema", () => {
    const root = document.documentElement;
    root.dataset.theme = "auto";
    expect(currentTheme(root, true)).toBe("dark");
    expect(currentTheme(root, false)).toBe("light");
  });
});
