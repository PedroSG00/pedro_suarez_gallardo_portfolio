import { describe, expect, test } from "vitest";
import { readCssText } from "@/test/theme";
import {
  MIN_SCROLL_DELTA,
  NAV_HIDE_THRESHOLD,
  resolveNavbarVisibility,
  type NavbarVisibility,
  type NavbarVisibilityInput,
} from "./nav-visibility";

const ROOT_PX = 16;
const SPACING_PX = 4;

function pxFromToken(value: string): number {
  const calc = value.match(
    /^calc\(\s*var\(\s*--spacing\s*\)\s*\*\s*(\d+(?:\.\d+)?)\s*\)$/
  );
  if (calc) return Number(calc[1]) * SPACING_PX;
  const rem = value.match(/^(-?\d+(?:\.\d+)?)rem$/);
  if (rem) return Number(rem[1]) * ROOT_PX;
  const px = value.match(/^(-?\d+(?:\.\d+)?)px$/);
  if (px) return Number(px[1]);
  throw new Error(`Cannot resolve length: ${value}`);
}

function thresholdFromCss(): number {
  const match = readCssText().match(/--nav-hide-threshold\s*:\s*([^;]+);/);
  if (!match) throw new Error("Missing --nav-hide-threshold in globals.css");
  return pxFromToken(match[1].trim());
}

function input(overrides: Partial<NavbarVisibilityInput> = {}): NavbarVisibilityInput {
  return {
    scrollY: 0,
    previousScrollY: 0,
    currentVisibility: "visible",
    menuOpen: false,
    focusWithin: false,
    reducedMotion: false,
    supportsScrollTimeline: true,
    ...overrides,
  };
}

interface Case {
  name: string;
  overrides: Partial<NavbarVisibilityInput>;
  expected: NavbarVisibility;
}

const CASES: Case[] = [
  {
    name: "at the top the bar is always visible, even if it was hidden",
    overrides: { scrollY: 0, previousScrollY: 0, currentVisibility: "hidden" },
    expected: "visible",
  },
  {
    name: "exactly at the 80px threshold the bar stays visible",
    overrides: { scrollY: 80, previousScrollY: 0, currentVisibility: "hidden" },
    expected: "visible",
  },
  {
    name: "at 81px scrolling down the bar hides",
    overrides: { scrollY: 81, previousScrollY: 0 },
    expected: "hidden",
  },
  {
    name: "scrolling down past the threshold hides the bar",
    overrides: { scrollY: 640, previousScrollY: 600 },
    expected: "hidden",
  },
  {
    name: "scrolling up reveals the bar",
    overrides: { scrollY: 600, previousScrollY: 640, currentVisibility: "hidden" },
    expected: "visible",
  },
  {
    name: "no direction change keeps a hidden bar hidden",
    overrides: { scrollY: 640, previousScrollY: 640, currentVisibility: "hidden" },
    expected: "hidden",
  },
  {
    name: "no direction change keeps a visible bar visible",
    overrides: { scrollY: 640, previousScrollY: 640, currentVisibility: "visible" },
    expected: "visible",
  },
  {
    name: "an open menu keeps the bar visible while scrolling down",
    overrides: { scrollY: 900, previousScrollY: 800, menuOpen: true },
    expected: "visible",
  },
  {
    name: "focus within the bar reveals it immediately",
    overrides: { scrollY: 900, previousScrollY: 800, focusWithin: true },
    expected: "visible",
  },
  {
    name: "reduced motion keeps the bar visible",
    overrides: { scrollY: 900, previousScrollY: 800, reducedMotion: true },
    expected: "visible",
  },
  {
    name: "without animation-timeline support the bar stays visible",
    overrides: {
      scrollY: 900,
      previousScrollY: 800,
      supportsScrollTimeline: false,
    },
    expected: "visible",
  },
  {
    name: "negative scroll positions are read as the top",
    overrides: { scrollY: -120, previousScrollY: 0, currentVisibility: "hidden" },
    expected: "visible",
  },
  {
    name: "negative current and previous positions are read as the top",
    overrides: { scrollY: -40, previousScrollY: -90, currentVisibility: "hidden" },
    expected: "visible",
  },
  {
    name: "a NaN scroll position is read as the top",
    overrides: { scrollY: Number.NaN, previousScrollY: 0, currentVisibility: "hidden" },
    expected: "visible",
  },
  {
    name: "a NaN previous position lets a real scroll down hide the bar",
    overrides: { scrollY: 120, previousScrollY: Number.NaN },
    expected: "hidden",
  },
  {
    name: "infinite positions are read as the top",
    overrides: {
      scrollY: Number.POSITIVE_INFINITY,
      previousScrollY: Number.POSITIVE_INFINITY,
      currentVisibility: "hidden",
    },
    expected: "visible",
  },
  {
    name: "a 1px delta keeps a hidden bar hidden",
    overrides: { scrollY: 101, previousScrollY: 100, currentVisibility: "hidden" },
    expected: "hidden",
  },
  {
    name: "a 1px delta keeps a visible bar visible",
    overrides: { scrollY: 101, previousScrollY: 100, currentVisibility: "visible" },
    expected: "visible",
  },
  {
    name: "a 1px upward delta keeps the current visibility",
    overrides: { scrollY: 100, previousScrollY: 101, currentVisibility: "hidden" },
    expected: "hidden",
  },
  {
    name: "a delta of exactly MIN_SCROLL_DELTA counts as scrolling down",
    overrides: {
      scrollY: 100 + MIN_SCROLL_DELTA,
      previousScrollY: 100,
      currentVisibility: "visible",
    },
    expected: "hidden",
  },
  {
    name: "a delta of exactly MIN_SCROLL_DELTA counts as scrolling up",
    overrides: {
      scrollY: 100,
      previousScrollY: 100 + MIN_SCROLL_DELTA,
      currentVisibility: "hidden",
    },
    expected: "visible",
  },
];

describe("resolveNavbarVisibility (RF-3, RF-4, RF-12)", () => {
  test.each(CASES)("$name", ({ overrides, expected }) => {
    expect(resolveNavbarVisibility(input(overrides))).toBe(expected);
  });

  test("deltas under 2px are ignored to avoid scroll bounce flicker", () => {
    expect(MIN_SCROLL_DELTA).toBe(2);
  });

  test("never throws on unusable numbers", () => {
    expect(() =>
      resolveNavbarVisibility(
        input({
          scrollY: Number.NaN,
          previousScrollY: Number.NaN,
          currentVisibility: "hidden",
        })
      )
    ).not.toThrow();
  });

  test("does not mutate its input", () => {
    const value = input({ scrollY: 640, previousScrollY: 600 });
    const snapshot = { ...value };
    resolveNavbarVisibility(value);
    expect(value).toEqual(snapshot);
  });
});

describe("nav hide threshold matches --nav-hide-threshold (RF-3)", () => {
  test("the module constant is 80px", () => {
    expect(NAV_HIDE_THRESHOLD).toBe(80);
  });

  test("the module constant and the CSS token cannot diverge", () => {
    // If one changes, both change: the token and this constant are the same rule.
    expect(thresholdFromCss()).toBe(NAV_HIDE_THRESHOLD);
  });
});
