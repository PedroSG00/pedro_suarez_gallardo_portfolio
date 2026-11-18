export interface ClampSpec {
  min: number;
  preferred: { px: number; vw: number };
  max: number;
}

const HEX_REM = /^([0-9]*\.?[0-9]+)rem$/;
const HEX_PX = /^([0-9]*\.?[0-9]+)px$/;

function toPx(value: string): number {
  const m = value.match(HEX_REM);
  if (m) return parseFloat(m[1]) * 16;
  const p = value.match(HEX_PX);
  if (p) return parseFloat(p[1]);
  throw new Error(`cannot convert to px: ${value}`);
}

function sumTerms(term: string): { px: number; vw: number } {
  let px = 0;
  let vw = 0;
  for (const part of term.split("+")) {
    const trimmed = part.trim();
    if (trimmed.endsWith("vw")) {
      vw += parseFloat(trimmed.replace(/vw$/, "").trim());
    } else {
      px += toPx(trimmed);
    }
  }
  return { px, vw };
}

export function parseClamp(value: string): ClampSpec {
  const match = value.match(/^clamp\(\s*([^,]+?)\s*,\s*([^,]+?)\s*,\s*([^)]+?)\s*\)$/);
  if (!match) throw new Error(`malformed clamp: ${value}`);
  const min = toPx(match[1].trim());
  const preferred = sumTerms(match[2].trim());
  const max = toPx(match[3].trim());
  return { min, preferred, max };
}

export function sizeAt(spec: ClampSpec, widthPx: number): number {
  const preferred = spec.preferred.px + (spec.preferred.vw * widthPx) / 100;
  return Math.min(Math.max(preferred, spec.min), spec.max);
}
