import { describe, expect, test } from "vitest";
import {
  parseTokenSheet,
  type TokenSheet,
} from "./theme-tokens";
import {
  contrastRatio,
  parseColor,
  requiredContrast,
  resolveColor,
  reachablePairs,
  tokenValue,
} from "./theme-contrast";

const CSS = `
@theme static {
  --color-surface: light-dark(#f2efe6, #121110);
  --color-ink: light-dark(#121110, #f2efe6);
  --color-ink-muted: light-dark(#5a574f, #a9a49a);
  --color-line: #7c776c;
  --color-focus: var(--color-ink);
  --text-display: clamp(4rem, 1.6667rem + 10.37vw, 11rem);
  --text-title-lg: clamp(2.5rem, 1.3333rem + 5.185vw, 6rem);
  --text-title: clamp(1.5rem, 1rem + 2.222vw, 3rem);
  --text-body: clamp(1rem, 0.9167rem + 0.37vw, 1.25rem);
  --text-meta: clamp(0.75rem, 0.7083rem + 0.185vw, 0.875rem);
  --text-display--line-height: 0.9;
  --text-display--letter-spacing: -0.02em;
  --text-display--font-weight: 700;
  --text-title-lg--line-height: 0.95;
  --text-title-lg--letter-spacing: -0.015em;
  --text-title-lg--font-weight: 700;
  --text-title--line-height: 1;
  --text-title--letter-spacing: -0.01em;
  --text-title--font-weight: 700;
  --text-body--line-height: 1.5;
  --text-body--letter-spacing: 0em;
  --text-body--font-weight: 400;
  --text-meta--line-height: 1.4;
  --text-meta--letter-spacing: 0.02em;
  --text-meta--font-weight: 400;
  --font-weight-regular: 400;
  --font-weight-emphasis: 700;
  --spacing: 0.25rem;
  --line-width: 1px;
  --motion-distance: 1.5rem;
  --duration-state: 200ms;
  --duration-theme: 400ms;
  --duration-reveal: 600ms;
}`;

function sheet(): TokenSheet {
  return parseTokenSheet(CSS);
}

describe("contrastRatio", () => {
  test("black on white is 21:1", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 2);
  });

  test("equal colors is 1:1", () => {
    expect(contrastRatio("#121110", "#121110")).toBeCloseTo(1, 2);
  });

  test("is symmetric", () => {
    expect(contrastRatio("#f2efe6", "#121110")).toBeCloseTo(
      contrastRatio("#121110", "#f2efe6"),
      4
    );
  });
});

describe("parseColor", () => {
  test.each(["#121110", "#f2efe6", "#7c776c"])("6-digit hex %s", (hex) => {
    const rgb = parseColor(hex);
    expect(rgb).not.toBeNull();
    expect(rgb!.r).toBeGreaterThanOrEqual(0);
    expect(rgb!.r).toBeLessThanOrEqual(255);
  });

  test.each(["#fff", "#000", "#abc"])("3-digit hex %s", (hex) => {
    const rgb = parseColor(hex);
    expect(rgb).not.toBeNull();
  });

  test("invalid value returns null", () => {
    expect(parseColor("not-a-color")).toBeNull();
    expect(parseColor("#gggggg")).toBeNull();
    expect(parseColor("#12")).toBeNull();
  });
});

describe("requiredContrast", () => {
  test.each([
    [24, 400, 3],
    [24, 700, 3],
    [100, 400, 3],
    [23.99, 400, 4.5],
    [18.66, 700, 3],
    [18.65, 700, 4.5],
    [18.66, 400, 4.5],
    [16, 400, 4.5],
  ])("size=%s weight=%s -> %s", (size, weight, expected) => {
    expect(requiredContrast(size, weight)).toBe(expected);
  });
});

describe("resolveColor", () => {
  test("pair resolves light/dark by mode", () => {
    const s = sheet();
    expect(resolveColor(s, "ink", "light", "base")).toBe("#121110");
    expect(resolveColor(s, "ink", "dark", "base")).toBe("#f2efe6");
  });

  test("solid returns its value regardless of mode", () => {
    const s = sheet();
    expect(resolveColor(s, "line", "light", "base")).toBe("#7c776c");
    expect(resolveColor(s, "line", "dark", "base")).toBe("#7c776c");
  });

  test("alias follows the referenced token", () => {
    const s = sheet();
    expect(resolveColor(s, "focus", "light", "base")).toBe("#121110");
    expect(resolveColor(s, "focus", "dark", "base")).toBe("#f2efe6");
  });

  test("inverted context applies the opposite mode", () => {
    const s = sheet();
    expect(resolveColor(s, "ink", "light", "inverted")).toBe("#f2efe6");
    expect(resolveColor(s, "ink", "dark", "inverted")).toBe("#121110");
  });

  test("cyclic alias throws", () => {
    const css = `
      @theme static {
        --color-ink: light-dark(#121110, #f2efe6);
        --color-ink-muted: light-dark(#5a574f, #a9a49a);
        --color-line: #7c776c;
        --color-focus: var(--color-surface);
        --color-surface: var(--color-focus);
        --text-display: clamp(4rem, 1.6667rem + 10.37vw, 11rem);
        --text-title-lg: clamp(2.5rem, 1.3333rem + 5.185vw, 6rem);
        --text-title: clamp(1.5rem, 1rem + 2.222vw, 3rem);
        --text-body: clamp(1rem, 0.9167rem + 0.37vw, 1.25rem);
        --text-meta: clamp(0.75rem, 0.7083rem + 0.185vw, 0.875rem);
        --text-display--line-height: 0.9;
        --text-display--letter-spacing: -0.02em;
        --text-display--font-weight: 700;
        --text-title-lg--line-height: 0.95;
        --text-title-lg--letter-spacing: -0.015em;
        --text-title-lg--font-weight: 700;
        --text-title--line-height: 1;
        --text-title--letter-spacing: -0.01em;
        --text-title--font-weight: 700;
        --text-body--line-height: 1.5;
        --text-body--letter-spacing: 0em;
        --text-body--font-weight: 400;
        --text-meta--line-height: 1.4;
        --text-meta--letter-spacing: 0.02em;
        --text-meta--font-weight: 400;
        --font-weight-regular: 400;
        --font-weight-emphasis: 700;
        --spacing: 0.25rem;
        --line-width: 1px;
        --motion-distance: 1.5rem;
        --duration-state: 200ms;
        --duration-theme: 400ms;
        --duration-reveal: 600ms;
      }
    `;
    const s = parseTokenSheet(css);
    expect(() => resolveColor(s, "surface", "light", "base")).toThrow();
  });
});

describe("reachablePairs", () => {
  test("returns 8 pairs per mode (base + inverted)", () => {
    const light = reachablePairs(sheet(), "light");
    const dark = reachablePairs(sheet(), "dark");
    expect(light.length).toBe(8);
    expect(dark.length).toBe(8);

    const tokens = new Set(light.map((p) => p.token));
    expect(tokens).toEqual(new Set(["ink", "ink-muted", "line", "focus"]));

    const contexts = new Set(light.map((p) => p.context));
    expect(contexts).toEqual(new Set(["base", "inverted"]));

    for (const p of [...light, ...dark]) {
      expect(p.minContrast).toBeGreaterThan(0);
      expect(p.fg).toBeTruthy();
      expect(p.bg).toBeTruthy();
    }
  });

  test("inverted pairs use opposite mode for background and foreground", () => {
    const s = sheet();
    const base = reachablePairs(s, "light").find(
      (p) => p.context === "base" && p.token === "ink"
    );
    const inv = reachablePairs(s, "light").find(
      (p) => p.context === "inverted" && p.token === "ink"
    );
    expect(base!.fg).toBe("#121110");
    expect(base!.bg).toBe("#f2efe6");
    expect(inv!.fg).toBe("#f2efe6");
    expect(inv!.bg).toBe("#121110");
  });
});

describe("tokenValue", () => {
  test("returns the raw value", () => {
    const s = sheet();
    expect(tokenValue(s, "color-line")).toBe("#7c776c");
    expect(tokenValue(s, "spacing")).toBe("0.25rem");
  });

  test("throws if the token does not exist", () => {
    const s = sheet();
    expect(() => tokenValue(s, "does-not-exist")).toThrow("does-not-exist");
  });
});
