import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('T-06 globals.css — red first', () => {
  const css = fs.readFileSync(path.resolve('app/globals.css'), 'utf8');

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
