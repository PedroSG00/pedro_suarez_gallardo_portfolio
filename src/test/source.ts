export interface Violation {
  path: string;
  message: string;
}

const HEX_RE = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;
const FONT_SANS_RE = /\bfont-sans\b/;
const FONT_SERIF_RE = /\bfont-serif\b/;
const DARK_VARIANT_RE = /\bdark:/;
const ARBITRARY_SPACING_RE = /\b(?:p|m|px|py|pt|pr|pb|pl|gap|inset|translate)-\[[^\]]*\]/g;
const HALF_FRACTION_RE = /\b(?:p|m|px|py|pt|pr|pb|pl|mx|my|gap|space-x|space-y|inset|mt|mr|mb|ml|size|w|h)-(0\.[0-9]*[1-9]|[0-9]+\.[0-9]*[1-9])\b/g;
const CSS_SPACING_RE = /((?:padding|margin|gap|inset)(?:-[a-z]+)?)\s*:\s*([^;}]+)/gi;

function normalizePath(path: string): string {
  return path.replace(/\\/g, "/");
}

function isTestFile(path: string): boolean {
  const n = normalizePath(path);
  return (
    /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(n) || n.includes("/src/test/")
  );
}

function isGlobalsCss(path: string): boolean {
  const n = normalizePath(path);
  return n.endsWith("globals.css") || n.includes("/globals.css");
}

function toPx(value: string): number | null {
  const m = value.match(/^([0-9]*\.?[0-9]+)px$/);
  if (m) return parseFloat(m[1]);
  const r = value.match(/^([0-9]*\.?[0-9]+)rem$/);
  if (r) return parseFloat(r[1]) * 16;
  return null;
}

function isValidCssSpacing(value: string): boolean {
  const v = value.trim();
  if (v === "0") return true;
  if (v === "var(--spacing)") return true;
  if (v.startsWith("calc(") && v.includes("--spacing")) return true;
  const px = toPx(v);
  return px !== null && px % 4 === 0;
}

export function scanSource(
  files: Array<{ path: string; content: string }>
): Violation[] {
  const violations: Violation[] = [];

  for (const { path, content } of files) {
    if (isTestFile(path)) continue;

    const isCss = normalizePath(path).endsWith(".css");
    const allowHex = isGlobalsCss(path);

    if (!allowHex) {
      let match: RegExpExecArray | null;
      HEX_RE.lastIndex = 0;
      while ((match = HEX_RE.exec(content)) !== null) {
        violations.push({
          path,
          message: `hex color outside globals.css: ${match[0]}`,
        });
      }
    }

    if (FONT_SANS_RE.test(content)) {
      violations.push({ path, message: "font-sans used outside token" });
    }
    if (FONT_SERIF_RE.test(content)) {
      violations.push({ path, message: "font-serif used outside token" });
    }
    if (DARK_VARIANT_RE.test(content)) {
      violations.push({
        path,
        message: "dark: variant used (follows prefers-color-scheme, not data-theme)",
      });
    }

    let arbMatch: RegExpExecArray | null;
    ARBITRARY_SPACING_RE.lastIndex = 0;
    while ((arbMatch = ARBITRARY_SPACING_RE.exec(content)) !== null) {
      violations.push({
        path,
        message: `arbitrary spacing value: ${arbMatch[0]}`,
      });
    }

    let halfMatch: RegExpExecArray | null;
    HALF_FRACTION_RE.lastIndex = 0;
    while ((halfMatch = HALF_FRACTION_RE.exec(content)) !== null) {
      violations.push({
        path,
        message: `half-fraction spacing utility: ${halfMatch[0]}`,
      });
    }

    if (isCss) {
      CSS_SPACING_RE.lastIndex = 0;
      let cssMatch: RegExpExecArray | null;
      while ((cssMatch = CSS_SPACING_RE.exec(content)) !== null) {
        const prop = cssMatch[1];
        const value = cssMatch[2];
        if (!isValidCssSpacing(value)) {
          violations.push({
            path,
            message: `CSS spacing property ${prop} with non-grid value: ${value}`,
          });
        }
      }
    }
  }

  return violations;
}
