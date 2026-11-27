import { expect, test } from 'vitest';
import {
  getStackPerspectiveZoom,
  interpolateStackCamera,
  isStackRotationAtLimit,
  rotateStackCamera,
  rotateStackCameraBy,
  stepStackZoom,
  STACK_PITCH_MAX,
  STACK_PITCH_MIN,
  STACK_YAW_MAX,
  STACK_YAW_MIN,
} from '@/lib/stack/stack-camera';

test.each([
  [100, 'in', 105],
  [100, 'out', 95],
  [148, 'in', 150],
  [52, 'out', 50],
  [150, 'in', 150],
  [50, 'out', 50],
  [150, 'out', 145],
  [50, 'in', 55],
] as const)('moves from %s %s to %s without crossing the limits', (current, direction, expected) => {
  expect(stepStackZoom(current, direction)).toBe(expected);
});

test('maps the wider zoom range proportionally around the default level', () => {
  const fitted = 0.83;
  expect(getStackPerspectiveZoom(150, fitted)).toBeCloseTo(fitted * 1.4);
  expect(getStackPerspectiveZoom(100, fitted)).toBeCloseTo(fitted * (100 / 150) * 1.4);
  expect(getStackPerspectiveZoom(50, fitted)).toBeCloseTo(fitted * (50 / 150) * 1.4);
  expect(getStackPerspectiveZoom(50, fitted)).toBeLessThan(getStackPerspectiveZoom(100, fitted));
  expect(getStackPerspectiveZoom(150, fitted)).toBeGreaterThan(fitted);
});

test.each([
  ['left', { yaw: -5, pitch: 0 }],
  ['right', { yaw: 5, pitch: 0 }],
  ['up', { yaw: 0, pitch: 5 }],
  ['down', { yaw: 0, pitch: -5 }],
] as const)('rotates %s without changing the other axis', (direction, expected) => {
  expect(rotateStackCamera({ yaw: 0, pitch: 0 }, direction)).toEqual(expected);
});

test('wraps full horizontal turns and clamps vertical rotation', () => {
  expect(rotateStackCameraBy({ yaw: 0, pitch: 0 }, 12, -8)).toEqual({
    yaw: 12,
    pitch: -8,
  });
  expect(rotateStackCameraBy({ yaw: 170, pitch: 18 }, 20, 10)).toEqual({
    yaw: -170,
    pitch: STACK_PITCH_MAX,
  });
  expect(rotateStackCameraBy({ yaw: -170, pitch: -18 }, -20, -10)).toEqual({
    yaw: 170,
    pitch: STACK_PITCH_MIN,
  });
  expect(rotateStackCameraBy({ yaw: 0, pitch: 0 }, 360, 0)).toEqual({ yaw: 0, pitch: 0 });
  expect(rotateStackCameraBy({ yaw: 0, pitch: 0 }, -360, 0)).toEqual({ yaw: 0, pitch: 0 });
});

test.each([
  [{ yaw: STACK_YAW_MIN, pitch: 0 }, 'left', false],
  [{ yaw: STACK_YAW_MIN, pitch: 0 }, 'right', false],
  [{ yaw: STACK_YAW_MAX, pitch: 0 }, 'right', false],
  [{ yaw: 0, pitch: STACK_PITCH_MAX }, 'up', true],
  [{ yaw: 0, pitch: STACK_PITCH_MIN }, 'down', true],
] as const)('reports whether a rotation limit blocks %s', (orientation, direction, expected) => {
  expect(isStackRotationAtLimit(orientation, direction)).toBe(expected);
});

test('normalizes input angles before applying the next direct adjustment', () => {
  expect(rotateStackCameraBy({ yaw: 1000, pitch: -100 }, 0, 0)).toEqual({
    yaw: -80,
    pitch: STACK_PITCH_MIN,
  });
});

test('interpolates the shortest horizontal turn and keeps camera values in range', () => {
  expect(
    interpolateStackCamera(
      { zoom: 100, yaw: 170, pitch: 0 },
      { zoom: 150, yaw: -170, pitch: 20 },
      0.5,
    ),
  ).toEqual({ zoom: 125, yaw: -180, pitch: 10 });
  expect(
    interpolateStackCamera(
      { zoom: 100, yaw: 10, pitch: 0 },
      { zoom: 150, yaw: 20, pitch: 10 },
      0,
    ),
  ).toEqual({ zoom: 100, yaw: 10, pitch: 0 });
  expect(
    interpolateStackCamera(
      { zoom: 100, yaw: 10, pitch: 0 },
      { zoom: 150, yaw: 20, pitch: 10 },
      1.5,
    ),
  ).toEqual({ zoom: 150, yaw: 20, pitch: 10 });
});
