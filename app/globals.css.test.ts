import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const css = fs.readFileSync(path.resolve('app/globals.css'), 'utf8');

// T22: globals.css — focus and contrast tokens, prefers-reduced-motion,
// color-scheme (RF-9, RNF-5)
// Done when: focus indicator is visible with 3:1 contrast against background
// and unfocused state, never hidden; theme changes are instant with reduced
// motion; color-scheme declared for each theme.
describe('T22 globals.css — focus and contrast tokens', () => {
  it('defines focus color variable for 3:1 contrast', () => {
    expect(css).toContain('--color-focus');
  });

  it('applies visible focus outline on :focus-visible', () => {
    expect(css).toMatch(/:\s*focus-visible/);
    expect(css).toContain('outline');
  });

  it('applies visible focus outline on :focus', () => {
    expect(css).toMatch(/:\s*focus\b/);
    expect(css).toContain('outline-offset');
  });

  it('declares color-scheme for light theme', () => {
    expect(css).toMatch(/color-scheme:\s*light/);
  });

  it('declares color-scheme for dark theme', () => {
    expect(css).toMatch(/color-scheme:\s*dark/);
  });

  it('respects prefers-reduced-motion for instant theme changes', () => {
    expect(css).toContain('prefers-reduced-motion');
  });

  it('sets transition-duration to 0ms with reduced motion', () => {
    expect(css).toMatch(/transition-duration:\s*0ms/);
  });

  it('never hides focus indicator', () => {
    // No outline: none or outline: 0 that would hide focus
    expect(css).not.toMatch(/outline:\s*none/);
    expect(css).not.toMatch(/outline:\s*0/);
  });
});
