import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';

// T19 (004): Estructura visual de la cabecera — RF-1, RF-2, RF-5, RF-8, RNF-5
// Done when: globals.css.test.ts passes and checks fondo opaco, retícula de
// cabecera, <details> forzado abierto y summary oculto en ≥1024 px, panel
// superpuesto a ancho completo, objetivos de 24×24 px y marca de activo no
// cromática.
const cssPath = path.resolve(process.cwd(), 'app/globals.css');
const css = readFileSync(cssPath, 'utf8');

function ruleExists(pattern: RegExp): boolean {
  return pattern.test(css);
}

/** Extrae el bloque interior de una @media rule contando llaves. */
function extractMediaBlock(css: string, mediaQuery: string): string {
  const startPattern = new RegExp(
    `@media\\s*\\(${mediaQuery}\\)\\s*\\{`
  );
  const startMatch = css.match(startPattern);
  if (!startMatch) return '';
  let i = startMatch.index! + startMatch[0].length;
  let depth = 1;
  while (i < css.length && depth > 0) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}') depth--;
    i++;
  }
  return css.slice(startMatch.index! + startMatch[0].length, i - 1);
}

describe('globals.css — T19 (RF-1, RF-2, RF-5, RF-8, RNF-5)', () => {
  it('header has opaque background (fondo opaco)', () => {
    expect(ruleExists(/header\s*\{[^}]*background-color:/)).toBe(true);
    expect(
      ruleExists(/header\s*\{[^}]*background:[^;]*!important;/)
    ).toBe(false);
    // background-color must not be transparent
    const headerBlock = css.match(/header\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(headerBlock).not.toMatch(/background-color:\s*transparent/);
    expect(headerBlock).not.toMatch(/background:\s*transparent/);
  });

  it('header uses a grid (retícula de cabecera)', () => {
    expect(ruleExists(/header\s*\{[^}]*display:\s*grid/)).toBe(true);
  });

  it('<details> forced open at >=1024px', () => {
    const mediaBlock = extractMediaBlock(css, 'min-width: 1024px');
    expect(mediaBlock).toMatch(/details\s*\[open\]/);
    expect(mediaBlock).toMatch(/details/);
  });

  it('summary hidden at >=1024px', () => {
    const mediaBlock = extractMediaBlock(css, 'min-width: 1024px');
    expect(mediaBlock).toMatch(/summary\s*\{/);
    expect(mediaBlock).toMatch(/display:\s*none/);
  });

  it('panel full-width overlay (ancho completo, superpuesto)', () => {
    expect(
      ruleExists(
        new RegExp(
          '\\[data-testid="nav-disclosure"\\][\\s\\S]*position:\\s*fixed|position:\\s*fixed[\\s\\S]*\\[data-testid="nav-disclosure"\\]'
        )
      )
    ).toBe(true);
    expect(ruleExists(/width:\s*100%/)).toBe(true);
  });

  it('24×24 px touch targets (objetivos de 24×24 px)', () => {
    expect(ruleExists(/min-width:\s*24px/)).toBe(true);
    expect(ruleExists(/min-height:\s*24px/)).toBe(true);
  });

  it('non-chromatic active mark (marca de activo no cromática)', () => {
    expect(ruleExists(/\[data-testid="active-mark"\]/)).toBe(true);
    const markBlock = css.match(/\[data-testid="active-mark"\]\s*\{([^}]*)\}/)?.[1] ?? '';
    // Non-chromatic: should not rely on color alone; uses background/inverted block
    expect(markBlock).toMatch(/background|border|transform|opacity/);
    expect(markBlock).not.toMatch(/color:\s*#[0-9a-f]{3,6}/i);
  });

  it('fallback --header-height (respaldo CSS antes de medir)', () => {
    expect(
      ruleExists(/:\s*root\s*\{[^}]*--header-height:/) ||
        ruleExists(/--header-height:\s*\d+/)
    ).toBe(true);
  });
});
