import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const css = fs.readFileSync(path.resolve('app/globals.css'), 'utf8');

describe('T-06 globals.css — red first', () => {
  it('defines --warm-1 to --warm-5', () => {
    expect(css).toContain('--warm-1');
    expect(css).toContain('--warm-5');
  });

  it('defines semantic roles --color-bg, --color-surface, --color-text-primary', () => {
    expect(css).toContain('--color-bg');
    expect(css).toContain('--color-surface');
    expect(css).toContain('--color-text-primary');
  });

  it('has .theme-light and .theme-dark classes', () => {
    expect(css).toContain('.theme-light');
    expect(css).toContain('.theme-dark');
    expect(css).toContain('.theme-system');
  });

  it('sets native color-scheme for themes', () => {
    expect(css).toContain('color-scheme');
  });

  it('uses Geist Mono 400 and allows bold when needed', () => {
    expect(css).toContain('Geist Mono');
    expect(css).toContain('font-weight: 400');
  });

  it('has transition theme 250ms ease-in-out', () => {
    expect(css).toContain('250ms');
    expect(css).toContain('ease-in-out');
  });

  it('respects prefers-reduced-motion instantly', () => {
    expect(css).toContain('prefers-reduced-motion');
  });

  it('sets max-width 65ch for reading', () => {
    expect(css).toContain('65ch');
  });

  it('defines focus color for 3:1 contrast', () => {
    expect(css).toContain('--color-focus');
  });

  it('underlines links without accent color', () => {
    expect(css).toContain('text-decoration: underline');
  });

  it('defines spacing scale variables', () => {
    expect(css).toContain('--space-xs');
    expect(css).toContain('--space-sm');
    expect(css).toContain('--space-md');
    expect(css).toContain('--space-lg');
    expect(css).toContain('--space-xl');
    expect(css).toContain('--space-section');
  });

  it('defines typography scale roles', () => {
    expect(css).toContain('.text-page-title');
    expect(css).toContain('.text-section-title');
    expect(css).toContain('.text-subtitle');
    expect(css).toContain('.text-body');
    expect(css).toContain('.text-secondary');
    expect(css).toContain('.text-technical');
  });

  it('defines selection color variable', () => {
    expect(css).toContain('--color-selection');
  });
});

describe('T-10 impact scale and full-bleed composition — red first', () => {
  it('defines the editorial display scale tokens', () => {
    expect(css).toContain('--type-display');
    expect(css).toContain('--type-page-title');
    expect(css).toContain('--type-section-title');
  });

  it('defines --measure as 65ch for running text', () => {
    expect(css).toMatch(/--measure:\s*65ch/);
  });

  it('applies the reading measure through the shared token', () => {
    expect(css).toMatch(/max-width:\s*var\(--measure\)/);
  });

  it('defines fluid gutter and section spacing tokens', () => {
    expect(css).toContain('--gutter');
    expect(css).toContain('--section-space');
  });

  it('defines the full-bleed layout token', () => {
    expect(css).toMatch(/--layout-wide:\s*100%/);
  });

  it('provides a full-bleed container that cannot overflow horizontally', () => {
    expect(css).toContain('.layout-wide');
    expect(css).toMatch(/max-width:\s*none/);
    expect(css).toMatch(/overflow-x:\s*clip/);
  });

  it('provides an inverted block utility', () => {
    expect(css).toContain('.inverted');
    expect(css).toContain('--color-inverse-bg');
    expect(css).toContain('--color-inverse-text');
  });

  it('provides a reveal utility that is disabled with reduced motion', () => {
    expect(css).toContain('.reveal');
    expect(css).toContain('--transition-reveal');
    expect(css).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*\.reveal/,
    );
  });
});
