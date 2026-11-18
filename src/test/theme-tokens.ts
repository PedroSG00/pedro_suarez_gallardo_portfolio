export type Mode = "light" | "dark";
export type Context = "base" | "inverted";
export type ColorToken = "surface" | "ink" | "ink-muted" | "line" | "focus";

export type ColorValue =
  | { kind: "pair"; light: string; dark: string }
  | { kind: "alias"; token: ColorToken }
  | { kind: "solid"; value: string };

export interface TokenSheet {
  raw: Readonly<Record<string, string>>;
  colors: Readonly<Record<ColorToken, ColorValue>>;
}

export const REQUIRED_TOKENS: readonly string[] = [
  // 5 colors
  "color-surface",
  "color-ink",
  "color-ink-muted",
  "color-line",
  "color-focus",
  // 5 sizes
  "text-display",
  "text-title-lg",
  "text-title",
  "text-body",
  "text-meta",
  // 15 role sub-tokens
  "text-display--line-height",
  "text-display--letter-spacing",
  "text-display--font-weight",
  "text-title-lg--line-height",
  "text-title-lg--letter-spacing",
  "text-title-lg--font-weight",
  "text-title--line-height",
  "text-title--letter-spacing",
  "text-title--font-weight",
  "text-body--line-height",
  "text-body--letter-spacing",
  "text-body--font-weight",
  "text-meta--line-height",
  "text-meta--letter-spacing",
  "text-meta--font-weight",
  // 8 typography / spacing / line / motion
  "font-weight-regular",
  "font-weight-emphasis",
  "spacing",
  "line-width",
  "motion-distance",
  "duration-state",
  "duration-theme",
  "duration-reveal",
] as const;

const DECLARATION_RE = /(--[a-z0-9*-]+)\s*:\s*([^;]+);/g;

function themeBlocks(cssText: string): string[] {
  // Los comentarios no afectan la estructura de llaves.
  cssText = cssText.replace(/\/\*[\s\S]*?\*\//g, "");
  const blocks: string[] = [];
  let index = 0;
  while (true) {
    const at = cssText.indexOf("@theme", index);
    if (at === -1) break;
    let cursor = at + "@theme".length;
    while (cssText[cursor] === " " || cssText[cursor] === "\t") cursor++;
    const start = cssText.indexOf("{", cursor);
    if (start === -1) break;
    let depth = 0;
    let end = -1;
    for (let i = start; i < cssText.length; i++) {
      if (cssText[i] === "{") depth++;
      else if (cssText[i] === "}") {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    if (end === -1) break;
    blocks.push(cssText.slice(start + 1, end));
    index = end + 1;
  }
  return blocks;
}

function parseColorTokens(sheet: Record<string, string>): TokenSheet["colors"] {
  const resolvePair = (
    value: string,
    rawKey: string
  ): { kind: "pair"; light: string; dark: string } => {
    const match = value.match(/^light-dark\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)$/);
    if (!match) throw new Error(`unknown color shape for ${rawKey}: ${value}`);
    return { kind: "pair", light: match[1], dark: match[2] };
  };

  const resolveAlias = (
    value: string,
    rawKey: string
  ): { kind: "alias"; token: ColorToken } => {
    const match = value.match(/^var\(\s*--color-([a-z-]+)\s*\)$/);
    if (!match) throw new Error(`unknown color shape for ${rawKey}: ${value}`);
    const token = match[1] as ColorToken;
    if (!["surface", "ink", "ink-muted", "line", "focus"].includes(token)) {
      throw new Error(`unknown color shape for ${rawKey}: ${value}`);
    }
    return { kind: "alias", token };
  };

  const resolveSolid = (
    value: string,
    rawKey: string
  ): { kind: "solid"; value: string } => {
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value)) {
      return { kind: "solid", value };
    }
    throw new Error(`unknown color shape for ${rawKey}: ${value}`);
  };

  const colorTokens: ColorToken[] = [
    "surface",
    "ink",
    "ink-muted",
    "line",
    "focus",
  ];
  const colors: Record<ColorToken, ColorValue> = {} as Record<ColorToken, ColorValue>;
  for (const token of colorTokens) {
    const rawKey = `color-${token}`;
    const value = sheet[rawKey];
    if (!value) throw new Error(`missing token: ${rawKey}`);
    if (value.startsWith("light-dark(")) {
      colors[token] = resolvePair(value, rawKey);
    } else if (value.startsWith("var(--color-")) {
      colors[token] = resolveAlias(value, rawKey);
    } else {
      colors[token] = resolveSolid(value, rawKey);
    }
  }
  return colors;
}

export function parseTokenSheet(cssText: string): TokenSheet {
  const sheet: Record<string, string> = {};
  const seen: Record<string, boolean> = {};

  for (const block of themeBlocks(cssText)) {
    let match: RegExpExecArray | null;
    DECLARATION_RE.lastIndex = 0;
    while ((match = DECLARATION_RE.exec(block)) !== null) {
      const name = match[1];
      let value = match[2];
      if (name.includes("*")) continue;
      value = value.trim();
      if (value === "initial") continue;
      const key = name.slice(2);
      if (seen[key]) throw new Error(`duplicate token: ${key}`);
      seen[key] = true;
      sheet[key] = value;
    }
  }

  for (const required of REQUIRED_TOKENS) {
    if (!(required in sheet)) throw new Error(`missing token: ${required}`);
  }

  return { raw: sheet as Readonly<Record<string, string>>, colors: parseColorTokens(sheet) };
}
