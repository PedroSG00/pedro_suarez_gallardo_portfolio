import { describe, expect, test } from "vitest";
import {
  contrastRatio,
  parseColor,
  reachablePairs,
} from "./theme-contrast";
import { parseClamp, sizeAt } from "./type-scale";
import { readTokenSheet, readCssText } from "./theme";

describe("readTokenSheet (real globals.css)", () => {
  test("parseTokenSheet does not throw on the real file: all 33 required tokens exist", () => {
    expect(() => readTokenSheet()).not.toThrow();
  });

  test("the 33 required tokens are present in raw", () => {
    const sheet = readTokenSheet();
    for (const token of Object.keys(sheet.raw)) {
      expect(sheet.raw[token]).toBeTruthy();
    }
  });
});

describe("palette (RF-5, RF-12)", () => {
  test("exactly surface, ink, ink-muted, line and focus; no accent color", () => {
    const sheet = readTokenSheet();
    const colorTokens = Object.keys(sheet.colors);
    expect(colorTokens.sort()).toEqual([
      "focus",
      "ink",
      "ink-muted",
      "line",
      "surface",
    ]);
  });

  test("surface crudo is in #EFECE2–#F5F2EA and ink negro is in #0E0E0C–#141312", () => {
    const sheet = readTokenSheet();
    const surfaceLight = parseColor(
      (sheet.colors.surface as { kind: "pair"; light: string }).light
    )!;
    const inkLight = parseColor(
      (sheet.colors.ink as { kind: "pair"; light: string }).light
    )!;
    expect(surfaceLight.r).toBeGreaterThanOrEqual(239);
    expect(surfaceLight.g).toBeGreaterThanOrEqual(236);
    expect(surfaceLight.b).toBeGreaterThanOrEqual(226);
    expect(surfaceLight.r).toBeLessThanOrEqual(245);
    expect(surfaceLight.g).toBeLessThanOrEqual(242);
    expect(surfaceLight.b).toBeLessThanOrEqual(234);
    expect(inkLight.r).toBeGreaterThanOrEqual(14);
    expect(inkLight.g).toBeGreaterThanOrEqual(14);
    expect(inkLight.b).toBeGreaterThanOrEqual(12);
    expect(inkLight.r).toBeLessThanOrEqual(20);
    expect(inkLight.g).toBeLessThanOrEqual(19);
    expect(inkLight.b).toBeLessThanOrEqual(18);
  });

  test("every neutral obeys R >= G >= B", () => {
    const sheet = readTokenSheet();
    const pairs = [
      sheet.colors.surface as { kind: "pair"; light: string; dark: string },
      sheet.colors.ink as { kind: "pair"; light: string; dark: string },
      sheet.colors["ink-muted"] as {
        kind: "pair";
        light: string;
        dark: string;
      },
      sheet.colors.line as { kind: "solid"; value: string },
    ];
    for (const p of pairs) {
      for (const hex of p.kind === "pair" ? [p.light, p.dark] : [p.value]) {
        const c = parseColor(hex)!;
        expect(c.r).toBeGreaterThanOrEqual(c.g);
        expect(c.g).toBeGreaterThanOrEqual(c.b);
      }
    }
  });

  test("line is solid and unique", () => {
    const sheet = readTokenSheet();
    expect(sheet.colors.line.kind).toBe("solid");
    expect((sheet.colors.line as { kind: "solid"; value: string }).value).toBe(
      "#7c776c"
    );
  });

  test("ink-muted has its own value per mode", () => {
    const sheet = readTokenSheet();
    const m = sheet.colors["ink-muted"] as {
      kind: "pair";
      light: string;
      dark: string;
    };
    expect(m.kind).toBe("pair");
    expect(m.light).not.toBe(m.dark);
  });

  test("focus is alias of ink", () => {
    const sheet = readTokenSheet();
    expect(sheet.colors.focus.kind).toBe("alias");
    expect((sheet.colors.focus as { kind: "alias"; token: string }).token).toBe(
      "ink"
    );
  });
});

describe("role sub-tokens (RF-8, RF-9, RF-12)", () => {
  const ROLES = ["display", "title-lg", "title", "body", "meta"];
  const SUB = ["line-height", "letter-spacing", "font-weight"];

  test("each of the five roles has its three sub-tokens", () => {
    const sheet = readTokenSheet();
    for (const role of ROLES) {
      for (const sub of SUB) {
        expect(sheet.raw[`text-${role}--${sub}`]).toBeTruthy();
      }
    }
  });

  test("every text-<rol>--font-weight is 400 or 700 and matches the global weights", () => {
    const sheet = readTokenSheet();
    const regular = sheet.raw["font-weight-regular"];
    const emphasis = sheet.raw["font-weight-emphasis"];
    expect(regular).toBe("400");
    expect(emphasis).toBe("700");
    for (const role of ROLES) {
      const w = sheet.raw[`text-${role}--font-weight`];
      expect(w).toMatch(/^(400|700)$/);
    }
  });
});

describe("durations, spacing, line-width, motion-distance (RF-10, RF-11)", () => {
  test("durations: state 150-250ms, theme <= 400ms, reveal <= 600ms, none > 600ms", () => {
    const sheet = readTokenSheet();
    const ms = (v: string) => parseInt(v, 10);
    const state = ms(sheet.raw["duration-state"]);
    const theme = ms(sheet.raw["duration-theme"]);
    const reveal = ms(sheet.raw["duration-reveal"]);
    expect(state).toBeGreaterThanOrEqual(150);
    expect(state).toBeLessThanOrEqual(250);
    expect(theme).toBeLessThanOrEqual(400);
    expect(reveal).toBeLessThanOrEqual(600);
    expect(Math.max(state, theme, reveal)).toBeLessThanOrEqual(600);
  });

  test("spacing 0.25rem, line-width 1px, motion-distance declared", () => {
    const sheet = readTokenSheet();
    expect(sheet.raw["spacing"]).toBe("0.25rem");
    expect(sheet.raw["line-width"]).toBe("1px");
    expect(sheet.raw["motion-distance"]).toBeTruthy();
  });

  test("a single font family is declared", () => {
    const sheet = readTokenSheet();
    expect(sheet.raw["font-mono"]).toBeTruthy();
  });
});

describe("contrast pairs with real values (RF-5, RF-6)", () => {
  test("all 16 reachable pairs (8 per mode, base + inverted) pass their threshold", () => {
    const sheet = readTokenSheet();
    for (const mode of ["light", "dark"] as const) {
      const pairs = reachablePairs(sheet, mode);
      expect(pairs.length).toBe(8);
      for (const p of pairs) {
        const ratio = contrastRatio(p.fg, p.bg);
        expect(ratio).toBeGreaterThanOrEqual(p.minContrast - 1e-6);
      }
    }
  });
});

describe("type scale with real clamp values (RF-9)", () => {
  test("five roles keep hierarchy and minimums at 320, 360, 768 and 1440 px", () => {
    const sheet = readTokenSheet();
    const ROLES = ["display", "title-lg", "title", "body", "meta"];
    const WIDTHS = [320, 360, 768, 1440];
    const specs: Record<string, ReturnType<typeof parseClamp>> = {};
    for (const role of ROLES) {
      specs[role] = parseClamp(sheet.raw[`text-${role}`]);
    }
    for (const w of WIDTHS) {
      let previous = Infinity;
      for (const role of ROLES) {
        const current = sizeAt(specs[role], w);
        expect(current).toBeLessThan(previous - 1e-6);
        previous = current;
      }
      expect(sizeAt(specs.body, w)).toBeGreaterThanOrEqual(16 - 1e-6);
      for (const role of ROLES) {
        expect(sizeAt(specs[role], w)).toBeGreaterThanOrEqual(12 - 1e-6);
      }
    }
  });
});

describe("color-scheme rules (RF-5, RF-7)", () => {
  const css = readCssText();

  test(":root declares color-scheme: light dark", () => {
    expect(css).toContain(":root {\n    color-scheme: light dark;\n  }");
  });

  test(":root[data-theme='light'] declares color-scheme: light", () => {
    expect(css).toContain(
      ':root[data-theme="light"] {\n    color-scheme: light;\n  }'
    );
  });

  test(":root[data-theme='dark'] declares color-scheme: dark", () => {
    expect(css).toContain(
      ':root[data-theme="dark"] {\n    color-scheme: dark;\n  }'
    );
  });
});

describe("inverted block (RF-5)", () => {
  const css = readCssText();

  test(".inverted reapplies surface and ink and changes color-scheme", () => {
    expect(css).toContain(".inverted {\n    color-scheme: dark;\n    background-color: var(--color-surface);\n    color: var(--color-ink);\n  }");
  });

  test("override for data-theme='dark' inverts back", () => {
    expect(css).toContain(
      ':root[data-theme="dark"] .inverted {\n    color-scheme: light;\n  }'
    );
  });

  test("override for system dark without attribute", () => {
    expect(css).toContain(
      "@media (prefers-color-scheme: dark) {\n    :root:not([data-theme]) .inverted {\n      color-scheme: light;\n    }\n  }"
    );
  });

  test("line does not change inside the inverted block", () => {
    expect(css).not.toContain(".inverted { --color-line:");
    expect(css).not.toContain(".inverted { border-color:");
  });
});

describe("base rules, focus and selection (RF-4, RF-5, RF-11)", () => {
  const css = readCssText();

  test("html applies surface, ink, font-mono, regular weight and tabular-nums", () => {
    expect(css).toContain("html {\n    background-color: var(--color-surface);\n    color: var(--color-ink);\n    font-family: var(--font-mono);\n    font-weight: var(--font-weight-regular);\n    font-variant-numeric: tabular-nums;\n    -webkit-font-smoothing: antialiased;\n  }");
  });

  test("body applies surface, ink and min-height", () => {
    expect(css).toContain(
      "body {\n    min-height: 100dvh;\n    background-color: var(--color-surface);\n    color: var(--color-ink);\n  }"
    );
  });

  test("*, ::before, ::after take border-color from line token", () => {
    expect(css).toContain(
      "*,\n  ::before,\n  ::after {\n    border-color: var(--color-line);\n  }"
    );
  });

  test("::selection uses the ink/surface inverted pair", () => {
    expect(css).toContain(
      "::selection {\n    background-color: var(--color-ink);\n    color: var(--color-surface);\n  }"
    );
  });

  test(":focus-visible uses focus token with line-width and spacing", () => {
    expect(css).toContain(
      ":focus-visible {\n    outline: calc(var(--line-width) * 2) solid var(--color-focus);\n    outline-offset: calc(var(--spacing) / 2);\n  }"
    );
  });

  test("no transition in html nor body", () => {
    const htmlBlock = css.match(/html\s*\{[\s\S]*?\}/)?.[0] ?? "";
    const bodyBlock = css.match(/body\s*\{[\s\S]*?\}/)?.[0] ?? "";
    expect(htmlBlock).not.toMatch(/transition/);
    expect(bodyBlock).not.toMatch(/transition/);
  });

  test("::view-transition-* use duration-theme token", () => {
    expect(css).toContain(
      "::view-transition-group(root),\n::view-transition-old(root),\n::view-transition-new(root) {\n  animation-duration: var(--duration-theme);\n}"
    );
  });
});

describe("prefers-reduced-motion (RF-4, RF-11)", () => {
  const css = readCssText();

  test("the reduce block has no @layer and sets durations to 0ms", () => {
    expect(css).toContain("@media (prefers-reduced-motion: reduce) {\n  :root {\n    --duration-state: 0ms;\n    --duration-theme: 0ms;\n    --duration-reveal: 0ms;\n  }\n\n  ::view-transition-group(*),\n  ::view-transition-old(*),\n  ::view-transition-new(*) {\n    animation: none !important;\n  }\n}");
  });
});
