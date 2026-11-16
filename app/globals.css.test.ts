import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

// T19 (004): Header visual structure — RF-1, RF-2, RF-5, RF-8, RNF-5
// Done when: globals.css.test.ts passes and checks the header's opaque
// background, its grid, <details> forced open plus summary hidden at
// >=1024 px, the full-width overlay panel, 24x24 px targets and a
// non-chromatic active mark.
const source = readFileSync(
  path.resolve(process.cwd(), 'app/globals.css'),
  'utf8'
).replace(/\/\*[\s\S]*?\*\//g, '');

/**
 * Returns the declarations inside the first block whose selector matches
 * `selector` (the pattern must include the opening brace). Nested blocks are
 * returned whole, so the same helper can read @media rules.
 */
function block(selector: RegExp, scope: string = source): string {
  const match = selector.exec(scope);
  if (!match) return '';
  const open = match.index + match[0].lastIndexOf('{');
  let depth = 0;
  for (let i = open; i < scope.length; i += 1) {
    if (scope[i] === '{') depth += 1;
    else if (scope[i] === '}') {
      depth -= 1;
      if (depth === 0) return scope.slice(open + 1, i);
    }
  }
  return '';
}

const HEADER = /header\[role=(?:"|')banner(?:"|')\]\s*\{/;
const HEADER_NAV_PANEL =
  /header\[role=(?:"|')banner(?:"|')\]\s*>\s*details:first-of-type\s*>\s*div\s*\{/;
const WIDE = /@media\s*\(min-width:\s*1024px\)\s*\{/;

const header = block(HEADER);
const wide = block(WIDE);

describe('globals.css — T19 (RF-1, RF-2, RF-5, RF-8, RNF-5)', () => {
  it('gives the header an opaque background of the active theme (RF-1)', () => {
    expect(header).toMatch(/background-color:\s*var\(--color-bg\)/);
    expect(header).not.toMatch(/background(?:-color)?:\s*transparent/);
    expect(header).not.toMatch(/opacity:\s*0?\.\d+/);
  });

  it('lays the header out as a grid (RF-1, RF-8)', () => {
    expect(header).toMatch(/display:\s*grid/);
    expect(header).toMatch(/grid-template-areas/);
  });

  it('hides the navigation summary and forces <details> open at >=1024px (RF-2)', () => {
    const summary = block(
      /header\[role=(?:"|')banner(?:"|')\]\s*>\s*details:first-of-type\s*>\s*summary\s*\{/,
      wide
    );
    expect(summary).toMatch(/display:\s*none/);

    const detailsContent = block(
      /header\[role=(?:"|')banner(?:"|')\]\s*>\s*details:first-of-type::details-content\s*\{/,
      wide
    );
    expect(detailsContent).toMatch(/content-visibility:\s*visible/);
  });

  it('overlays the narrow navigation panel at full width (RF-2, RNF-5)', () => {
    const panel = block(HEADER_NAV_PANEL);
    expect(panel).toMatch(/position:\s*(?:absolute|fixed)/);
    expect(panel).toMatch(/(?:inset-inline:\s*0|width:\s*100%)/);
    expect(panel).toMatch(/background-color:\s*var\(--color-bg\)/);

    const widePanel = block(HEADER_NAV_PANEL, wide);
    expect(widePanel).toMatch(/position:\s*static/);
    expect(widePanel).toMatch(/width:\s*auto/);
  });

  it('keeps every header target at least 24x24 px (RF-8)', () => {
    const targets = block(
      /header\[role=(?:"|')banner(?:"|')\]\s+:is\(a,\s*button,\s*summary\)\s*\{/
    );
    expect(targets).toMatch(/min-width:\s*24px/);
    expect(targets).toMatch(/min-height:\s*24px/);
  });

  it('marks the active destination with an inverted block, not color or motion (RF-5, RNF-5)', () => {
    const mark = block(
      /header\[role=(?:"|')banner(?:"|')\]\s+a\[aria-current=(?:"|')true(?:"|')\]\s*>\s*span\[aria-hidden=(?:"|')true(?:"|')\]\s*\{/
    );
    expect(mark).toMatch(/background-color:\s*var\(--color-bg\)/);
    expect(mark).toMatch(/color:\s*var\(--color-inverse-bg\)/);
    expect(mark).not.toMatch(/(?:^|[;\s])(?:transform|animation):/);

    const current = block(
      /header\[role=(?:"|')banner(?:"|')\]\s+a\[aria-current=(?:"|')true(?:"|')\]\s*\{/
    );
    expect(current).toMatch(/background-color:\s*var\(--color-inverse-bg\)/);
    expect(current).toMatch(/color:\s*var\(--color-inverse-text\)/);
  });
});

// T20 (004): real height and scroll-margin — RF-3, RF-4, RNF-4
// Done when: --header-height reflects the measured height on mount and after
// resize, with a CSS fallback that leaves the title under the header before
// measuring. The fallback is per breakpoint because the narrow header stacks
// brand and navigation in two rows (measured 97 px at 320 px wide) while the
// wide header fits in one (measured 41 px at >=1024 px).
describe('globals.css — T20 (RF-3, RF-4, RNF-4)', () => {
  const root = block(/:root\s*\{/);
  const wideRoot = block(/:root\s*\{/, wide);

  function fallbackHeight(scope: string): number | null {
    const match = scope.match(/--header-height:\s*(\d+(?:\.\d+)?)px/);
    return match ? Number(match[1]) : null;
  }

  it('publishes a generous narrow fallback before JavaScript measures it', () => {
    const narrow = fallbackHeight(root);
    expect(narrow).not.toBeNull();
    expect(narrow!).toBeGreaterThanOrEqual(96);
  });

  it('shrinks the fallback to the single-row wide header at >=1024px', () => {
    const narrow = fallbackHeight(root);
    const wideFallback = fallbackHeight(wideRoot);
    expect(wideFallback).not.toBeNull();
    expect(wideFallback!).toBeGreaterThanOrEqual(48);
    expect(wideFallback!).toBeLessThan(narrow!);
  });
});
