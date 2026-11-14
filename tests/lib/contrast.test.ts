import { describe, it, expect } from 'vitest';

// Relative luminance (WCAG 2.2)
function luminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const f = (v: number) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function ratio(a: string, b: string): number {
  const L1 = luminance(a);
  const L2 = luminance(b);
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
}

describe('NFR-1 contrast — T-contrast', () => {
  it('light theme text-primary on bg meets AA (4.5:1)', () => {
    expect(ratio('#1a1a1a', '#f8f5f0')).toBeGreaterThanOrEqual(4.5);
  });

  it('dark theme text-primary on bg meets AA', () => {
    expect(ratio('#f8f5f0', '#1a1a1a')).toBeGreaterThanOrEqual(4.5);
  });

  it('focus color has 3:1 against backgrounds', () => {
    expect(ratio('#000000', '#f8f5f0')).toBeGreaterThanOrEqual(3);
    expect(ratio('#ffffff', '#1a1a1a')).toBeGreaterThanOrEqual(3);
  });

  it('text-secondary (warm-5) on bg meets 3:1', () => {
    expect(ratio('#8a8478', '#f8f5f0')).toBeGreaterThanOrEqual(3);
  });
});
