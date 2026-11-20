import { describe, expect, test } from "vitest";
import { readCssText } from "@/test/theme";
import {
  GRID_GUTTER_BREAKPOINT,
  GRID_GUTTER_COMPACT,
  GRID_GUTTER_WIDE,
  GRID_MAX_WIDTH,
  HERO_LONGEST_WORD_CHARS,
  HERO_NAME_ADVANCE,
  HERO_NAME_DIVISOR,
  HERO_NAME_FILL,
  HERO_NAME_MAX_FONT_SIZE,
  HERO_NAME_MIN_FONT_SIZE,
  gridGutterFor,
  heroNameMetrics,
} from "./hero-name";

const EPSILON = 1e-9;

interface Row {
  viewportWidth: number;
  contentWidth: number;
  fontSize: number;
  blockWidth: number;
  ratio: number;
}

const TABLE: Row[] = [
  { viewportWidth: 320, contentWidth: 272, fontSize: 51, blockWidth: 244.8, ratio: 0.9 },
  { viewportWidth: 360, contentWidth: 312, fontSize: 58.5, blockWidth: 280.8, ratio: 0.9 },
  { viewportWidth: 768, contentWidth: 672, fontSize: 126, blockWidth: 604.8, ratio: 0.9 },
  { viewportWidth: 1440, contentWidth: 1344, fontSize: 252, blockWidth: 1209.6, ratio: 0.9 },
  { viewportWidth: 1920, contentWidth: 1600, fontSize: 300, blockWidth: 1440, ratio: 0.9 },
  { viewportWidth: 2560, contentWidth: 1600, fontSize: 300, blockWidth: 1440, ratio: 0.9 },
];

function tokenValue(name: string): number {
  const match = readCssText().match(
    new RegExp(`--${name}\\s*:\\s*(-?\\d+(?:\\.\\d+)?)\\s*;`)
  );
  if (!match) throw new Error(`Missing --${name} in globals.css`);
  return Number(match[1]);
}

describe("heroNameMetrics table (RF-8)", () => {
  test.each(TABLE)(
    "at $viewportWidth px the name fills 90% of the $contentWidth px content",
    ({ viewportWidth, contentWidth, fontSize, blockWidth, ratio }) => {
      const metrics = heroNameMetrics(viewportWidth);

      expect(metrics.viewportWidth).toBe(viewportWidth);
      expect(metrics.contentWidth).toBe(contentWidth);
      expect(metrics.fontSize).toBeCloseTo(fontSize, 9);
      expect(metrics.blockWidth).toBeCloseTo(blockWidth, 9);
      expect(metrics.ratio).toBeCloseTo(ratio, 9);
    }
  );

  test("the documented defaults are the contract of the formula", () => {
    const metrics = heroNameMetrics(1440);
    expect(metrics.longestWordChars).toBe(HERO_LONGEST_WORD_CHARS);
    expect(metrics.advanceRatio).toBe(HERO_NAME_ADVANCE);
    expect(metrics.fillRatio).toBe(HERO_NAME_FILL);
    expect(metrics.minFontSize).toBe(HERO_NAME_MIN_FONT_SIZE);
    expect(metrics.maxFontSize).toBe(HERO_NAME_MAX_FONT_SIZE);
  });

  test.each([360, 768, 1440])(
    "the block covers at least 90%% of the content width at %i px",
    (viewportWidth) => {
      expect(heroNameMetrics(viewportWidth).ratio).toBeGreaterThanOrEqual(
        HERO_NAME_FILL - EPSILON
      );
    }
  );

  test("at 320px the block never exceeds the available width", () => {
    const metrics = heroNameMetrics(320);
    expect(metrics.blockWidth).toBeLessThanOrEqual(metrics.contentWidth);
    expect(metrics.blockWidth).toBeLessThanOrEqual(
      metrics.viewportWidth - 2 * GRID_GUTTER_COMPACT
    );
  });

  test.each([1920, 2560])(
    "from %i px the block stops at the grid cap instead of growing",
    (viewportWidth) => {
      const wide = heroNameMetrics(viewportWidth);
      const capped = heroNameMetrics(1920);
      expect(wide.contentWidth).toBe(GRID_MAX_WIDTH);
      expect(wide.fontSize).toBe(HERO_NAME_MAX_FONT_SIZE);
      expect(wide.blockWidth).toBeLessThanOrEqual(GRID_MAX_WIDTH);
      expect(wide.contentWidth).toBe(capped.contentWidth);
      expect(wide.fontSize).toBe(capped.fontSize);
      expect(wide.blockWidth).toBe(capped.blockWidth);
      expect(wide.ratio).toBe(capped.ratio);
    }
  );

  test("the font size never leaves the min/max range between 320 and 2560px", () => {
    for (let width = 320; width <= 2560; width += 40) {
      const metrics = heroNameMetrics(width);
      expect(metrics.fontSize).toBeGreaterThanOrEqual(HERO_NAME_MIN_FONT_SIZE);
      expect(metrics.fontSize).toBeLessThanOrEqual(HERO_NAME_MAX_FONT_SIZE);
    }
  });
});

describe("heroNameMetrics gutter (RF-8)", () => {
  test("the gutter is 24px below 768px and 48px from 768px", () => {
    expect(gridGutterFor(320)).toBe(GRID_GUTTER_COMPACT);
    expect(gridGutterFor(GRID_GUTTER_BREAKPOINT - 1)).toBe(GRID_GUTTER_COMPACT);
    expect(gridGutterFor(GRID_GUTTER_BREAKPOINT)).toBe(GRID_GUTTER_WIDE);
    expect(gridGutterFor(2560)).toBe(GRID_GUTTER_WIDE);
  });

  test("contentWidth discounts two gutters up to the grid cap", () => {
    expect(heroNameMetrics(360).contentWidth).toBe(360 - 2 * 24);
    expect(heroNameMetrics(768).contentWidth).toBe(768 - 2 * 48);
    expect(heroNameMetrics(1440).contentWidth).toBe(1440 - 2 * 48);
  });
});

describe("heroNameMetrics bounds and edge cases (RF-8)", () => {
  test("a null content width returns the minimum font size and a zero ratio", () => {
    const metrics = heroNameMetrics(0);
    expect(metrics.contentWidth).toBeLessThanOrEqual(0);
    expect(metrics.fontSize).toBe(HERO_NAME_MIN_FONT_SIZE);
    expect(metrics.blockWidth).toBe(0);
    expect(metrics.ratio).toBe(0);
  });

  test("a negative or unusable viewport is read as zero and never throws", () => {
    for (const viewportWidth of [-320, Number.NaN, Number.NEGATIVE_INFINITY]) {
      const metrics = heroNameMetrics(viewportWidth);
      expect(metrics.contentWidth).toBeLessThanOrEqual(0);
      expect(metrics.fontSize).toBe(HERO_NAME_MIN_FONT_SIZE);
      expect(metrics.ratio).toBe(0);
    }
  });

  test("a single-character longest word still fits the content width", () => {
    const metrics = heroNameMetrics(1440, { longestWordChars: 1 });
    expect(metrics.longestWordChars).toBe(1);
    expect(metrics.fontSize).toBe(HERO_NAME_MAX_FONT_SIZE);
    expect(metrics.blockWidth).toBe(1 * HERO_NAME_ADVANCE * HERO_NAME_MAX_FONT_SIZE);
    expect(metrics.ratio).toBeLessThanOrEqual(1);
  });

  test("a zero-character longest word falls back to the minimum without throwing", () => {
    for (const longestWordChars of [0, -3]) {
      const metrics = heroNameMetrics(1440, { longestWordChars });
      expect(metrics.fontSize).toBe(HERO_NAME_MIN_FONT_SIZE);
      expect(metrics.blockWidth).toBe(0);
      expect(metrics.ratio).toBe(0);
    }
  });

  test("the minimum font size caps a very long word", () => {
    const metrics = heroNameMetrics(320, { longestWordChars: 20 });
    expect(metrics.fontSize).toBe(HERO_NAME_MIN_FONT_SIZE);
  });

  test("the maximum font size caps a wide viewport", () => {
    const metrics = heroNameMetrics(1440, { longestWordChars: 4 });
    expect(metrics.fontSize).toBe(HERO_NAME_MAX_FONT_SIZE);
  });

  test("a different advance ratio changes the result (the formula is not hardcoded)", () => {
    const metrics = heroNameMetrics(800, { advanceRatio: 0.5 });
    const contentWidth = 800 - 2 * GRID_GUTTER_WIDE;
    const expectedFontSize = (HERO_NAME_FILL * contentWidth) / (8 * 0.5);

    expect(metrics.advanceRatio).toBe(0.5);
    expect(metrics.fontSize).toBeCloseTo(expectedFontSize, 9);
    expect(metrics.blockWidth).toBeCloseTo(8 * 0.5 * expectedFontSize, 9);
    expect(metrics.ratio).toBeCloseTo(HERO_NAME_FILL, 9);
  });

  test("an explicit gutter overrides the viewport breakpoint", () => {
    const metrics = heroNameMetrics(1440, { gutter: 0 });
    expect(metrics.contentWidth).toBe(1440);
  });

  test("an unusable explicit gutter falls back to the viewport gutter", () => {
    const derived = heroNameMetrics(1440);
    for (const gutter of [Number.NaN, Number.POSITIVE_INFINITY, -10]) {
      expect(heroNameMetrics(1440, { gutter })).toEqual(derived);
    }
  });

  test("unusable size and advance overrides fall back to the defaults", () => {
    const derived = heroNameMetrics(1440);
    const metrics = heroNameMetrics(1440, {
      advanceRatio: 0,
      minFontSize: -1,
      maxFontSize: Number.NaN,
      fillRatio: Number.NaN,
      longestWordChars: Number.NaN,
    });
    expect(metrics).toEqual(derived);
  });

  test("a maximum below the minimum never inverts the clamp", () => {
    const metrics = heroNameMetrics(1440, { minFontSize: 200, maxFontSize: 100 });
    expect(metrics.minFontSize).toBe(200);
    expect(metrics.maxFontSize).toBe(200);
    expect(metrics.fontSize).toBe(200);
  });

  test("never throws and never mutates its options", () => {
    const options = { longestWordChars: 8, advanceRatio: 0.6 };
    const snapshot = { ...options };

    expect(() => heroNameMetrics(Number.NaN)).not.toThrow();
    expect(() => heroNameMetrics(0, { longestWordChars: 0 })).not.toThrow();
    heroNameMetrics(1440, options);
    expect(options).toEqual(snapshot);
  });
});

describe("hero name constants match globals.css (RF-8)", () => {
  test("the longest word is Gallardo (8 characters) and the divisor is 4.8", () => {
    expect(HERO_LONGEST_WORD_CHARS).toBe(8);
    expect(HERO_NAME_ADVANCE).toBe(0.6);
    expect(HERO_NAME_DIVISOR).toBe(4.8);
    expect(HERO_NAME_DIVISOR).toBe(HERO_LONGEST_WORD_CHARS * HERO_NAME_ADVANCE);
  });

  test("--hero-name-advance and --hero-name-divisor cannot diverge from the module", () => {
    // If one changes, both change: the tokens and these constants are the same rule.
    expect(tokenValue("hero-name-advance")).toBe(HERO_NAME_ADVANCE);
    expect(tokenValue("hero-name-divisor")).toBe(HERO_NAME_DIVISOR);
  });
});
