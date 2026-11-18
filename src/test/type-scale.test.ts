import { describe, expect, test } from "vitest";
import type { ClampSpec } from "./type-scale";
import { parseClamp, sizeAt } from "./type-scale";

// Valores de partida del plan §2.5 (no una copia de globals.css).
const ROLE_CLAMP: Record<string, string> = {
  display: "clamp(4rem, 1.6667rem + 10.37vw, 11rem)",
  "title-lg": "clamp(2.5rem, 1.3333rem + 5.185vw, 6rem)",
  title: "clamp(1.5rem, 1rem + 2.222vw, 3rem)",
  body: "clamp(1rem, 0.9167rem + 0.37vw, 1.25rem)",
  meta: "clamp(0.75rem, 0.7083rem + 0.185vw, 0.875rem)",
};

const ROLE_MIN: Record<string, number> = {
  display: 64,
  "title-lg": 40,
  title: 24,
  body: 16,
  meta: 12,
};

const ROLE_MAX: Record<string, number> = {
  display: 176,
  "title-lg": 96,
  title: 48,
  body: 20,
  meta: 14,
};

const ORDER = ["display", "title-lg", "title", "body", "meta"];
const WIDTHS = [320, 360, 768, 1440];

function specs(): Record<string, ClampSpec> {
  const out: Record<string, ClampSpec> = {};
  for (const role of ORDER) {
    out[role] = parseClamp(ROLE_CLAMP[role]);
  }
  return out;
}

describe("parseClamp", () => {
  test("parses rem extremes and a px + vw preferred term", () => {
    const spec = parseClamp("clamp(4rem, 1.6667rem + 10.37vw, 11rem)");
    expect(spec.min).toBeCloseTo(64, 2);
    expect(spec.preferred.px).toBeCloseTo(1.6667 * 16, 4);
    expect(spec.preferred.vw).toBeCloseTo(10.37, 2);
    expect(spec.max).toBeCloseTo(176, 2);
  });

  test("parses px extremes", () => {
    const spec = parseClamp("clamp(16px, 1rem + 0.37vw, 20px)");
    expect(spec.min).toBe(16);
    expect(spec.max).toBe(20);
  });

  test("parses a single preferred term without vw", () => {
    const spec = parseClamp("clamp(1rem, 1.5rem, 1.25rem)");
    expect(spec.preferred.vw).toBe(0);
    expect(spec.preferred.px).toBeCloseTo(1.5 * 16, 4);
  });

  test("trims whitespace around terms", () => {
    const spec = parseClamp("clamp( 1rem , 1rem + 0.37vw , 1.25rem )");
    expect(spec.min).toBeCloseTo(16, 2);
    expect(spec.max).toBeCloseTo(20, 2);
    expect(spec.preferred.px).toBeCloseTo(16, 2);
  });

  test("a malformed clamp throws", () => {
    expect(() => parseClamp("not a clamp")).toThrow();
    expect(() => parseClamp("clamp(1rem)")).toThrow();
    expect(() => parseClamp("clamp(1rem, 2rem)")).toThrow();
  });
});

describe("sizeAt", () => {
  test("returns the minimum at 360 px and the maximum at 1440 px for every role (tolerance 0.05 px)", () => {
    const sp = specs();
    for (const role of ORDER) {
      expect(sizeAt(sp[role], 360)).toBeCloseTo(ROLE_MIN[role], 0.05);
      expect(sizeAt(sp[role], 1440)).toBeCloseTo(ROLE_MAX[role], 0.05);
    }
  });

  test("the curve never decreases between 360 and 1440", () => {
    const sp = specs();
    for (const role of ORDER) {
      let previous = sizeAt(sp[role], 360);
      for (let w = 370; w <= 1440; w += 10) {
        const current = sizeAt(sp[role], w);
        expect(current).toBeGreaterThanOrEqual(previous - 0.001);
        previous = current;
      }
    }
  });

  test("strict hierarchy display > title-lg > title > body > meta at 320, 360, 768 and 1440 px", () => {
    const sp = specs();
    for (const w of WIDTHS) {
      let previous = Infinity;
      for (const role of ORDER) {
        const current = sizeAt(sp[role], w);
        expect(current).toBeLessThan(previous - 0.001);
        previous = current;
      }
    }
  });

  test("body is at least 16 px and any role at least 12 px at all tested widths", () => {
    const sp = specs();
    for (const w of WIDTHS) {
      expect(sizeAt(sp.body, w)).toBeGreaterThanOrEqual(16 - 0.001);
      for (const role of ORDER) {
        expect(sizeAt(sp[role], w)).toBeGreaterThanOrEqual(12 - 0.001);
      }
    }
  });

  test("clamps below the minimum and above the maximum", () => {
    const sp = specs();
    expect(sizeAt(sp.body, 0)).toBeCloseTo(ROLE_MIN.body, 0.05);
    expect(sizeAt(sp.body, 10_000)).toBeCloseTo(ROLE_MAX.body, 0.05);
  });
});

describe("synthetic large-text boundary (18.66 px with emphasis)", () => {
  test("an 18.66 px role with emphasis weight counts as large text", () => {
    const emphasis: ClampSpec = {
      min: 18.66,
      preferred: { px: 18.66 / 16, vw: 0 },
      max: 18.66,
    };
    expect(sizeAt(emphasis, 360)).toBeCloseTo(18.66, 0.05);
    expect(sizeAt(emphasis, 1440)).toBeCloseTo(18.66, 0.05);
  });
});
