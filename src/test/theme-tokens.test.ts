import { describe, expect, test } from "vitest";
import type { TokenSheet } from "./theme-tokens";
import { parseTokenSheet, REQUIRED_TOKENS } from "./theme-tokens";

const BASE_TOKENS: Record<string, string> = {
  "color-surface": "light-dark(#f2efe6, #121110)",
  "color-ink": "light-dark(#121110, #f2efe6)",
  "color-ink-muted": "light-dark(#5a574f, #a9a49a)",
  "color-line": "#7c776c",
  "color-focus": "var(--color-ink)",
  "text-display": "clamp(4rem, 1.6667rem + 10.37vw, 11rem)",
  "text-title-lg": "clamp(2.5rem, 1.3333rem + 5.185vw, 6rem)",
  "text-title": "clamp(1.5rem, 1rem + 2.222vw, 3rem)",
  "text-body": "clamp(1rem, 0.9167rem + 0.37vw, 1.25rem)",
  "text-meta": "clamp(0.75rem, 0.7083rem + 0.185vw, 0.875rem)",
  "text-display--line-height": "0.9",
  "text-display--letter-spacing": "-0.02em",
  "text-display--font-weight": "700",
  "text-title-lg--line-height": "0.95",
  "text-title-lg--letter-spacing": "-0.015em",
  "text-title-lg--font-weight": "700",
  "text-title--line-height": "1",
  "text-title--letter-spacing": "-0.01em",
  "text-title--font-weight": "700",
  "text-body--line-height": "1.5",
  "text-body--letter-spacing": "0em",
  "text-body--font-weight": "400",
  "text-meta--line-height": "1.4",
  "text-meta--letter-spacing": "0.02em",
  "text-meta--font-weight": "400",
  "font-weight-regular": "400",
  "font-weight-emphasis": "700",
  "spacing": "0.25rem",
  "line-width": "1px",
  "motion-distance": "1.5rem",
  "duration-state": "200ms",
  "duration-theme": "400ms",
  "duration-reveal": "600ms",
};

function themeCss(tokens: Record<string, string>): string {
  const declarations = Object.entries(tokens)
    .map(([name, value]) => `--${name}: ${value};`)
    .join("\n  ");
  return `@theme static {\n  ${declarations}\n}`;
}

function sheetWith(tokens: Record<string, string>): TokenSheet {
  return parseTokenSheet(themeCss(tokens));
}

describe("REQUIRED_TOKENS", () => {
  test("is an explicit export of exactly 33 names", () => {
    expect(Array.isArray(REQUIRED_TOKENS)).toBe(true);
    expect(REQUIRED_TOKENS.length).toBe(33);
    expect(new Set(REQUIRED_TOKENS).size).toBe(33);
  });

  test("every name is a string without the leading --", () => {
    for (const name of REQUIRED_TOKENS) {
      expect(typeof name).toBe("string");
      expect(name).not.toMatch(/^--/);
    }
  });
});

describe("scope: only @theme blocks count", () => {
  test("decoy :root and @media declarations are ignored", () => {
    const css = `
      :root {
        --color-surface: #fff;
        --color-ink: #000;
      }
      @media (prefers-color-scheme: dark) {
        --color-surface: #111;
        --color-ink: #eee;
      }
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
      }
    `;
    const sheet = parseTokenSheet(css);
    expect(sheet.raw["color-surface"]).toBe("light-dark(#f2efe6, #121110)");
    expect(sheet.raw["color-ink"]).toBe("light-dark(#121110, #f2efe6)");
    expect(sheet.raw["spacing"]).toBe("0.25rem");
  });
});

describe("brace balancing and comments", () => {
  test("nested braces inside @theme are balanced and comments are ignored", () => {
    const css = `
      @theme static {
        /* comment with { brace */
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
      }
    `;
    const sheet = parseTokenSheet(css);
    expect(sheet.raw["spacing"]).toBe("0.25rem");
    expect(sheet.raw["duration-theme"]).toBe("400ms");
  });
});

describe("color classification", () => {
  test("light-dark -> pair, var(--color-x) -> alias, hex -> solid", () => {
    const sheet = sheetWith(BASE_TOKENS);
    expect(sheet.colors.surface).toEqual({
      kind: "pair",
      light: "#f2efe6",
      dark: "#121110",
    });
    expect(sheet.colors.ink).toEqual({
      kind: "pair",
      light: "#121110",
      dark: "#f2efe6",
    });
    expect(sheet.colors["ink-muted"]).toEqual({
      kind: "pair",
      light: "#5a574f",
      dark: "#a9a49a",
    });
    expect(sheet.colors.line).toEqual({ kind: "solid", value: "#7c776c" });
    expect(sheet.colors.focus).toEqual({ kind: "alias", token: "ink" });
  });
});

describe("generic regex captures role sub-tokens", () => {
  test("captures line-height, letter-spacing and font-weight sub-tokens", () => {
    const sheet = sheetWith(BASE_TOKENS);
    expect(sheet.raw["text-display--line-height"]).toBe("0.9");
    expect(sheet.raw["text-display--letter-spacing"]).toBe("-0.02em");
    expect(sheet.raw["text-display--font-weight"]).toBe("700");
    expect(sheet.raw["text-meta--letter-spacing"]).toBe("0.02em");
  });
});

describe("namespace resets are not registered", () => {
  test("--color-*: initial and value initial are skipped", () => {
    const base = themeCss(BASE_TOKENS);
    const css = base.replace("}", `--color-*: initial;\n--custom-token: initial;\n}`);
    const sheet = parseTokenSheet(css);
    expect(sheet.raw["color-line"]).toBe("#7c776c");
    expect(Object.keys(sheet.raw)).not.toContain("color-*");
    expect(Object.keys(sheet.raw)).not.toContain("custom-token");
  });
});

describe("raw keys and value trimming", () => {
  test("keys do not include the -- prefix and values are trimmed", () => {
    const tokens = { ...BASE_TOKENS, spacing: "  0.25rem  " };
    const sheet = parseTokenSheet(themeCss(tokens));
    expect(Object.keys(sheet.raw).every((k) => !k.startsWith("--"))).toBe(true);
    expect(sheet.raw["spacing"]).toBe("0.25rem");
  });
});

describe("errors", () => {
  test("throws with the missing token name when a required token is absent", () => {
    for (const missing of REQUIRED_TOKENS) {
      const tokens = { ...BASE_TOKENS };
      delete tokens[missing];
      expect(() => parseTokenSheet(themeCss(tokens))).toThrow(
        `missing token: ${missing}`
      );
    }
  });

  test("throws on duplicate token inside @theme", () => {
    const css = `@theme static { --color-surface: light-dark(#f2efe6, #121110); --color-surface: light-dark(#000, #fff); }`;
    expect(() => parseTokenSheet(css)).toThrow("duplicate token: color-surface");
  });

  test("throws on unknown color shape", () => {
    const tokens = { ...BASE_TOKENS, "color-line": "not-a-color" };
    expect(() => parseTokenSheet(themeCss(tokens))).toThrow(
      "color-line"
    );
  });
});
