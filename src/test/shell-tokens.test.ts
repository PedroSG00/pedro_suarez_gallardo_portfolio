import { describe, expect, test } from "vitest";
import { readCssText } from "./theme";

const css = readCssText();
const SPACING_PX = 4;
const ROOT_PX = 16;

function blockAt(text: string, openIndex: number): string {
  let depth = 0;
  for (let i = openIndex; i < text.length; i += 1) {
    if (text[i] === "{") depth += 1;
    else if (text[i] === "}") {
      depth -= 1;
      if (depth === 0) return text.slice(openIndex + 1, i);
    }
  }
  throw new Error("Unbalanced braces in globals.css");
}

function blockContaining(text: string, marker: string): string {
  const markerIndex = text.indexOf(marker);
  if (markerIndex === -1) throw new Error(`Missing marker: ${marker}`);
  const openIndex = text.lastIndexOf("{", markerIndex);
  if (openIndex === -1) throw new Error(`No block around marker: ${marker}`);
  return blockAt(text, openIndex);
}

function blocksStartingWith(text: string, query: string): string[] {
  const blocks: string[] = [];
  let index = text.indexOf(query);
  while (index !== -1) {
    const openIndex = text.indexOf("{", index);
    if (openIndex === -1) break;
    blocks.push(blockAt(text, openIndex));
    index = text.indexOf(query, openIndex);
  }
  return blocks;
}

function declarations(block: string): Record<string, string> {
  const result: Record<string, string> = {};
  const declaration = /(--[a-z0-9-]+)\s*:\s*([^;]+);/g;
  let match: RegExpExecArray | null;
  while ((match = declaration.exec(block)) !== null) {
    result[match[1]] = match[2].trim();
  }
  return result;
}

function pxLength(value: string): number {
  const trimmed = value.trim();
  const calc = trimmed.match(
    /^calc\(\s*var\(\s*--spacing\s*\)\s*\*\s*(\d+(?:\.\d+)?)\s*\)$/
  );
  if (calc) return Number(calc[1]) * SPACING_PX;
  const rem = trimmed.match(/^(-?\d+(?:\.\d+)?)rem$/);
  if (rem) return Number(rem[1]) * ROOT_PX;
  const px = trimmed.match(/^(-?\d+(?:\.\d+)?)px$/);
  if (px) return Number(px[1]);
  throw new Error(`Cannot resolve length: ${trimmed}`);
}

function ms(value: string): number {
  const match = value.trim().match(/^(\d+(?:\.\d+)?)(ms|s)$/);
  if (!match) throw new Error(`Cannot resolve duration: ${value}`);
  return match[2] === "s" ? Number(match[1]) * 1000 : Number(match[1]);
}

const rootTokens = declarations(blockContaining(css, "--section-end-padding"));

const SHELL_TOKENS = [
  "--nav-height",
  "--nav-hide-threshold",
  "--nav-z",
  "--anchor-offset",
  "--grid-gutter",
  "--grid-max-width",
  "--text-hero-name",
  "--hero-name-fill",
  "--hero-name-scale",
  "--hero-name-letter-spacing",
  "--hero-name-advance",
  "--hero-name-divisor",
  "--cursor-width",
  "--cursor-height",
  "--cursor-gap",
  "--cursor-offset",
  "--cursor-duration",
  "--hero-line-duration",
  "--hero-line-stagger",
  "--hero-parallax-distance",
  "--touch-target",
] as const;

describe("shell and hero tokens in the base :root (RF-3, RF-4, RF-6, RF-8, RF-9, RF-10, RF-13)", () => {
  test("all 21 tokens live next to --section-end-padding", () => {
    for (const token of SHELL_TOKENS) {
      expect(rootTokens[token]).toBeTruthy();
    }
  });

  test("navbar height is positive and the navbar stacks above content", () => {
    expect(pxLength(rootTokens["--nav-height"])).toBeGreaterThan(0);
    expect(Number(rootTokens["--nav-z"])).toBeGreaterThan(0);
  });

  test("the navigation hides after 80px", () => {
    expect(pxLength(rootTokens["--nav-hide-threshold"])).toBe(80);
  });

  test("anchor scroll padding adapts to the viewport but never overlaps the navbar", () => {
    expect(rootTokens["--anchor-offset"].replace(/\s+/g, " ")).toBe(
      "clamp( var(--nav-height), 20dvh, calc(var(--spacing) * 50) )",
    );
  });

  test("the touch target is at least 24px", () => {
    expect(pxLength(rootTokens["--touch-target"])).toBeGreaterThanOrEqual(24);
  });

  test("the cursor cycle lasts 1s and the cursor has a width", () => {
    expect(ms(rootTokens["--cursor-duration"])).toBe(1000);
    expect(Number(rootTokens["--cursor-width"])).toBeGreaterThan(0);
    expect(Number(rootTokens["--cursor-height"])).toBeGreaterThan(0);
    expect(Number(rootTokens["--cursor-gap"])).toBeGreaterThan(0);
    expect(Number(rootTokens["--cursor-offset"])).toBeGreaterThan(0);
  });

  test("the staggered entrance is 400ms per line and adds up to at most 600ms", () => {
    const line = ms(rootTokens["--hero-line-duration"]);
    const stagger = ms(rootTokens["--hero-line-stagger"]);
    expect(line).toBe(400);
    expect(stagger).toBe(100);
    expect(line + 2 * stagger).toBeLessThanOrEqual(600);
  });

  test("the parallax distance is 20dvh", () => {
    expect(rootTokens["--hero-parallax-distance"]).toBe("20dvh");
  });

  test("the hero name fill is 0.9 without a unit", () => {
    expect(rootTokens["--hero-name-fill"]).toBe("0.9");
    expect(rootTokens["--hero-name-fill"]).not.toContain("%");
  });

  test("hero name scale and tracking are dimensionless ratios", () => {
    expect(Number(rootTokens["--hero-name-scale"])).toBeGreaterThan(0);
    expect(Number(rootTokens["--hero-name-scale"])).toBeLessThan(1);
    expect(Number(rootTokens["--hero-name-letter-spacing"])).toBeGreaterThan(0);
    expect(rootTokens["--hero-name-letter-spacing"]).not.toContain("em");
  });

  test("the hero name advance and divisor are 0.6 and 4.8", () => {
    expect(rootTokens["--hero-name-advance"]).toBe("0.6");
    expect(rootTokens["--hero-name-divisor"]).toBe("4.8");
  });

  test("the grid caps its content at 1600px", () => {
    expect(pxLength(rootTokens["--grid-max-width"])).toBe(1600);
  });

  test("the hero name size is a clamp driven by gutter, fill and divisor", () => {
    const value = rootTokens["--text-hero-name"];
    expect(value.startsWith("clamp(")).toBe(true);
    expect(value).toContain("--grid-gutter");
    expect(value).toContain("--hero-name-fill");
    expect(value).toContain("--hero-name-divisor");
  });
});

describe("grid gutter breakpoint (RF-8)", () => {
  test("the gutter is 24px by default", () => {
    expect(pxLength(rootTokens["--grid-gutter"])).toBe(24);
  });

  test("the gutter grows to 48px from 768px", () => {
    const media = blocksStartingWith(css, "@media (min-width: 768px)").find(
      (block) => block.includes("--grid-gutter")
    );
    expect(media).toBeTruthy();
    const mediaTokens = declarations(blockContaining(media ?? "", "--grid-gutter"));
    expect(pxLength(mediaTokens["--grid-gutter"])).toBe(48);
  });
});
