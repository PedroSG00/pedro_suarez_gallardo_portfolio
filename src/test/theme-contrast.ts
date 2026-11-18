import type { ColorToken, Context, Mode, TokenSheet } from "./theme-tokens";

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

export interface ColorPair {
  token: ColorToken;
  context: Context;
  fg: string;
  bg: string;
  minContrast: number;
}

const HEX6 = /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/;
const HEX3 = /^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/;

export function parseColor(value: string): Rgb | null {
  const m6 = value.match(HEX6);
  if (m6) {
    return {
      r: parseInt(m6[1], 16),
      g: parseInt(m6[2], 16),
      b: parseInt(m6[3], 16),
    };
  }
  const m3 = value.match(HEX3);
  if (m3) {
    return {
      r: parseInt(m3[1] + m3[1], 16),
      g: parseInt(m3[2] + m3[2], 16),
      b: parseInt(m3[3] + m3[3], 16),
    };
  }
  return null;
}

function channel(c: number): number {
  const x = c / 255;
  return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(rgb: Rgb): number {
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

export function contrastRatio(fg: string, bg: string): number {
  const c1 = parseColor(fg);
  const c2 = parseColor(bg);
  if (!c1 || !c2) throw new Error("invalid color for contrast ratio");
  const l1 = relativeLuminance(c1);
  const l2 = relativeLuminance(c2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function requiredContrast(sizePx: number, weight: number): number {
  const large = sizePx >= 24 || (sizePx >= 18.66 && weight >= 700);
  return large ? 3 : 4.5;
}

export function resolveColor(
  sheet: TokenSheet,
  token: ColorToken,
  mode: Mode,
  context: Context = "base",
  seen: Set<ColorToken> = new Set()
): string {
  const value = sheet.colors[token];
  if (value.kind === "alias") {
    if (seen.has(token)) throw new Error(`cyclic alias: ${token}`);
    seen.add(token);
    return resolveColor(sheet, value.token, mode, context, seen);
  }
  if (value.kind === "solid") return value.value;
  const effective =
    context === "inverted" ? (mode === "light" ? "dark" : "light") : mode;
  return effective === "light" ? value.light : value.dark;
}

export function tokenValue(sheet: TokenSheet, name: string): string {
  if (!(name in sheet.raw)) throw new Error(`missing token: ${name}`);
  return sheet.raw[name];
}

const FONT_TOKENS: ColorToken[] = ["ink", "ink-muted", "line", "focus"];

export function reachablePairs(sheet: TokenSheet, mode: Mode): ColorPair[] {
  const pairs: ColorPair[] = [];
  for (const context of ["base", "inverted"] as Context[]) {
    const bg = resolveColor(sheet, "surface", mode, context);
    for (const token of FONT_TOKENS) {
      const fg = resolveColor(sheet, token, mode, context);
      const minContrast = token === "line" || token === "focus" ? 3 : 4.5;
      pairs.push({ token, context, fg, bg, minContrast });
    }
  }
  return pairs;
}
