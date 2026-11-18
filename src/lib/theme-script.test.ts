import { describe, expect, test } from "vitest";
import { themeScript } from "./theme-script";
import { runThemeScript, type ThemeScriptDeps } from "@/test/theme";

function makeDeps(getItem: (key: string) => string | null): ThemeScriptDeps {
  const dataset: Record<string, string> = {};
  const d = {
    documentElement: {
      dataset,
      setAttribute: () => undefined,
      removeAttribute: () => undefined,
    },
  };
  const ls = { getItem, setItem: () => undefined };
  const w = { addEventListener: () => undefined };
  return { window: w, document: d, ls } as ThemeScriptDeps;
}

function makePageshowDeps(getItem: (key: string) => string | null) {
  const dataset: Record<string, string> = {};
  const d = {
    documentElement: {
      dataset,
      setAttribute: () => undefined,
      removeAttribute: () => undefined,
    },
  };
  const ls = { getItem, setItem: () => undefined };
  const w = {
    capturedListener: null as ((e: Event) => void) | null,
    addEventListener: (_k: string, f: unknown) => {
      w.capturedListener = f as (e: Event) => void;
    },
  };
  return { window: w, document: d, ls, dataset, listener: w } as ThemeScriptDeps & {
    dataset: Record<string, string>;
    listener: { capturedListener: ((e: Event) => void) | null };
  };
}

describe("themeScript", () => {
  test("generated text does not contain </script>", () => {
    const script = themeScript();
    expect(script).not.toContain("</script>");
  });

  test("storage key is injected with JSON.stringify", () => {
    expect(themeScript("psg-theme")).toContain('"psg-theme"');
    const weird = themeScript('psg-theme"weird');
    expect(weird).not.toContain("</script>");
  });

  test("with a valid stored choice writes data-theme exactly once during parse", () => {
    const deps = makeDeps(() => "dark");
    runThemeScript(themeScript("psg-theme"), deps);
    expect((deps.document.documentElement as { dataset: Record<string, string> }).dataset.theme).toBe("dark");
  });

  test("without a choice writes nothing", () => {
    const deps = makeDeps(() => null);
    runThemeScript(themeScript("psg-theme"), deps);
    expect((deps.document.documentElement as { dataset: Record<string, string> }).dataset.theme).toBeUndefined();
  });

  test("with an invalid stored choice leaves no attribute", () => {
    const deps = makeDeps(() => "auto");
    runThemeScript(themeScript("psg-theme"), deps);
    expect((deps.document.documentElement as { dataset: Record<string, string> }).dataset.theme).toBeUndefined();
  });

  test("a getItem that throws does not propagate and the listener stays registered", () => {
    const throwing = makeDeps(() => {
      throw new Error("blocked");
    });
    expect(() => runThemeScript(themeScript("psg-theme"), throwing)).not.toThrow();
    expect((throwing.document.documentElement as { dataset: Record<string, string> }).dataset.theme).toBeUndefined();

    const deps = makePageshowDeps(() => "dark");
    runThemeScript(themeScript("psg-theme"), deps);
    deps.listener.capturedListener!({ persisted: true } as unknown as Event);
    expect(deps.dataset.theme).toBe("dark");
  });

  test("first read throws, second read returns dark: pageshow applies dark", () => {
    let calls = 0;
    const firstThenDark = makePageshowDeps(() => {
      calls += 1;
      if (calls === 1) throw new Error("blocked");
      return "dark";
    });
    runThemeScript(themeScript("psg-theme"), firstThenDark);
    expect(firstThenDark.dataset.theme).toBeUndefined();
    firstThenDark.listener.capturedListener!({ persisted: true } as unknown as Event);
    expect(firstThenDark.dataset.theme).toBe("dark");
  });

  test("pageshow persisted:true reapplies or removes the attribute", () => {
    const none = makePageshowDeps(() => null);
    runThemeScript(themeScript("psg-theme"), none);
    expect(none.dataset.theme).toBeUndefined();

    const light = makePageshowDeps(() => "light");
    runThemeScript(themeScript("psg-theme"), light);
    light.listener.capturedListener!({ persisted: true } as unknown as Event);
    expect(light.dataset.theme).toBe("light");

    const gone = makePageshowDeps(() => null);
    runThemeScript(themeScript("psg-theme"), gone);
    gone.listener.capturedListener!({ persisted: true } as unknown as Event);
    expect(gone.dataset.theme).toBeUndefined();
  });

  test("pageshow persisted:false does not touch the DOM", () => {
    const deps = makePageshowDeps(() => "dark");
    runThemeScript(themeScript("psg-theme"), deps);
    expect(deps.dataset.theme).toBe("dark");
    const datasetBefore = deps.dataset.theme;
    deps.listener.capturedListener!({ persisted: false } as unknown as Event);
    expect(deps.dataset.theme).toBe(datasetBefore);
  });
});
