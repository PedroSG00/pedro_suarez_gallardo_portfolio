import { describe, expect, test, beforeEach, afterEach } from "vitest";
import { applyTheme, currentTheme, readStoredTheme, setTheme } from "./theme-dom";
import { THEME_STORAGE_KEY, type Theme } from "./theme";

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
    expect(root.dataset.theme).toBe("dark");
    expect(root.className).toBe("");
    expect(after.filter((name) => !before.includes(name))).toEqual(["data-theme"]);
  });

  test("sobreescribe el valor previo con el nuevo tema", () => {
    const root = document.documentElement;
    applyTheme(root, "light");
    applyTheme(root, "dark");
    expect(root.dataset.theme).toBe("dark");
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

describe("setTheme", () => {
  function makeRootMock() {
    const dataset: Record<string, string> = {};
    let writes = 0;
    const root = {
      get dataset() {
        return new Proxy(dataset, {
          set(target, prop, value) {
            if (prop === "theme") writes += 1;
            target[prop as string] = String(value);
            return true;
          },
        });
      },
      get writes(): number {
        return writes;
      },
    } as unknown as HTMLElement;
    return root;
  }

  function makeStorageMock(initialValue?: string) {
    let value = initialValue ?? null;
    let setCalls = 0;
    let shouldThrow = false;
    return {
      getItem: () => value,
      setItem: (_k: string, v: string) => {
        setCalls += 1;
        if (shouldThrow) throw new Error("blocked");
        value = v;
      },
      get setCalls(): number {
        return setCalls;
      },
      setShouldThrow(v: boolean): void {
        shouldThrow = v;
      },
      get value(): string | null {
        return value;
      },
    };
  }

  test("setTheme('dark') persiste y escribe el atributo una sola vez", () => {
    const root = makeRootMock();
    const storage = makeStorageMock();
    setTheme("dark", { root, storage });
    expect(root.dataset.theme).toBe("dark");
    expect((root as unknown as { writes: number }).writes).toBe(1);
    expect(storage.setCalls).toBe(1);
    expect(storage.value).toBe("dark");
  });

  test("con almacenamiento que lanza no hay error y el tema se aplica igual", () => {
    const root = makeRootMock();
    const storage = makeStorageMock();
    storage.setShouldThrow(true);
    expect(() => setTheme("dark", { root, storage })).not.toThrow();
    expect(root.dataset.theme).toBe("dark");
    expect((root as unknown as { writes: number }).writes).toBe(1);
    expect(storage.value).toBeNull();
  });

  test("con reducedMotion: () => true, startViewTransition no se llama y el atributo queda escrito", () => {
    const root = makeRootMock();
    const storage = makeStorageMock();
    let startCalled = false;
    setTheme("dark", {
      root,
      storage,
      reducedMotion: () => true,
      startViewTransition: () => {
        startCalled = true;
      },
    });
    expect(startCalled).toBe(false);
    expect(root.dataset.theme).toBe("dark");
    expect((root as unknown as { writes: number }).writes).toBe(1);
  });

  test("sin startViewTransition disponible, aplica directo", () => {
    const root = makeRootMock();
    const storage = makeStorageMock();
    setTheme("dark", { root, storage, startViewTransition: undefined });
    expect(root.dataset.theme).toBe("dark");
    expect((root as unknown as { writes: number }).writes).toBe(1);
    expect(storage.value).toBe("dark");
  });

  test("con la API disponible y sin reduce, se llama una vez y el callback escribe una vez", () => {
    const root = makeRootMock();
    const storage = makeStorageMock();
    let startCalled = 0;
    let callback: (() => void) | null = null;
    setTheme("dark", {
      root,
      storage,
      reducedMotion: () => false,
      startViewTransition: (cb: () => void) => {
        startCalled += 1;
        callback = cb;
      },
    });
    expect(startCalled).toBe(1);
    expect((root as unknown as { writes: number }).writes).toBe(0);
    callback!();
    expect(root.dataset.theme).toBe("dark");
    expect((root as unknown as { writes: number }).writes).toBe(1);
    expect(storage.value).toBe("dark");
  });

  test("si el callback se invoca dos veces, la escritura sigue siendo una (applyOnce)", () => {
    const root = makeRootMock();
    const storage = makeStorageMock();
    let callback: (() => void) | null = null;
    setTheme("dark", {
      root,
      storage,
      reducedMotion: () => false,
      startViewTransition: (cb: () => void) => {
        callback = cb;
      },
    });
    callback!();
    callback!();
    expect((root as unknown as { writes: number }).writes).toBe(1);
    expect(root.dataset.theme).toBe("dark");
  });

  test("si la API lanza, el tema se aplica igual y no se propaga el error", () => {
    const root = makeRootMock();
    const storage = makeStorageMock();
    expect(() =>
      setTheme("dark", {
        root,
        storage,
        reducedMotion: () => false,
        startViewTransition: () => {
          throw new Error("boom");
        },
      })
    ).not.toThrow();
    expect(root.dataset.theme).toBe("dark");
    expect((root as unknown as { writes: number }).writes).toBe(1);
    expect(storage.value).toBe("dark");
  });

  test("tras setTheme, readStoredTheme devuelve el valor nuevo", () => {
    const storage = makeStorageMock();
    setTheme("light", { storage });
    expect(readStoredTheme(storage)).toBe("light");
  });

  test("setTheme con valor inválido no escribe nada", () => {
    const root = makeRootMock();
    const storage = makeStorageMock();
    setTheme("invalid" as Theme, { root, storage });
    expect((root as unknown as { writes: number }).writes).toBe(0);
    expect(storage.setCalls).toBe(0);
    expect(storage.value).toBeNull();
  });

  test("la llamada pública setTheme(theme) sin dependencias funciona con document y localStorage reales", () => {
    const root = document.documentElement;
    resetRoot();
    expect(() => setTheme("dark")).not.toThrow();
    expect(root.dataset.theme).toBe("dark");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  test("localStorage bloqueado: setTheme no lanza y aplica directo", () => {
    const root = makeRootMock();
    const original = window.localStorage;
    try {
      Object.defineProperty(window, "localStorage", {
        get: () => {
          throw new Error("no ls");
        },
        configurable: true,
      });
      expect(() =>
        setTheme("dark", { root, reducedMotion: () => true })
      ).not.toThrow();
      expect(root.dataset.theme).toBe("dark");
      expect((root as unknown as { writes: number }).writes).toBe(1);
    } finally {
      Object.defineProperty(window, "localStorage", {
        value: original,
        configurable: true,
        writable: true,
      });
    }
  });
});
