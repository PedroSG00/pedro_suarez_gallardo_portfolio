import { expect, test } from 'vitest';
import { getStackPerspectiveZoom, stepStackZoom } from '@/lib/stack/stack-camera';

test.each([
  [100, 'in', 105],
  [100, 'out', 95],
  [108, 'in', 110],
  [87, 'out', 85],
  [110, 'in', 110],
  [85, 'out', 85],
  [110, 'out', 105],
  [85, 'in', 90],
] as const)('moves from %s %s to %s without crossing the limits', (current, direction, expected) => {
  expect(stepStackZoom(current, direction)).toBe(expected);
});

test('maps the maximum to the camera fit and keeps all lower levels inside it', () => {
  const fitted = 0.83;
  expect(getStackPerspectiveZoom(110, fitted)).toBe(fitted);
  expect(getStackPerspectiveZoom(100, fitted)).toBeCloseTo(fitted * 100 / 110);
  expect(getStackPerspectiveZoom(85, fitted)).toBeLessThan(getStackPerspectiveZoom(100, fitted));
});
