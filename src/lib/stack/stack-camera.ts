export const STACK_ZOOM_MIN = 50;
export const STACK_ZOOM_DEFAULT = 100;
export const STACK_ZOOM_MAX = 150;
export const STACK_YAW_MIN = -180;
export const STACK_YAW_MAX = 180;
export const STACK_PITCH_MIN = -20;
export const STACK_PITCH_MAX = 20;
const STACK_ZOOM_STEP = 5;
const STACK_ROTATION_STEP = 5;
const STACK_ZOOM_MAX_SCALE = 1.4;
const STACK_YAW_RANGE = STACK_YAW_MAX - STACK_YAW_MIN;

export type StackZoomDirection = 'in' | 'out';
export type StackRotationDirection = 'left' | 'right' | 'up' | 'down';
export type StackCameraOrientation = { yaw: number; pitch: number };

const ROTATION_DELTAS: Record<StackRotationDirection, StackCameraOrientation> = {
  left: { yaw: -STACK_ROTATION_STEP, pitch: 0 },
  right: { yaw: STACK_ROTATION_STEP, pitch: 0 },
  up: { yaw: 0, pitch: STACK_ROTATION_STEP },
  down: { yaw: 0, pitch: -STACK_ROTATION_STEP },
};

function clampStackZoom(level: number): number {
  return Math.max(STACK_ZOOM_MIN, Math.min(STACK_ZOOM_MAX, level));
}

export function stepStackZoom(level: number, direction: StackZoomDirection): number {
  return clampStackZoom(level + (direction === 'in' ? STACK_ZOOM_STEP : -STACK_ZOOM_STEP));
}

export function getStackPerspectiveZoom(level: number, maximumFit: number): number {
  return maximumFit * (clampStackZoom(level) / STACK_ZOOM_MAX) * STACK_ZOOM_MAX_SCALE;
}

function wrapStackYaw(yaw: number): number {
  const wrapped = (((yaw - STACK_YAW_MIN) % STACK_YAW_RANGE) + STACK_YAW_RANGE) % STACK_YAW_RANGE;
  return wrapped + STACK_YAW_MIN;
}

function clampStackOrientation(orientation: StackCameraOrientation): StackCameraOrientation {
  return {
    yaw: wrapStackYaw(orientation.yaw),
    pitch: Math.max(STACK_PITCH_MIN, Math.min(STACK_PITCH_MAX, orientation.pitch)),
  };
}

export function rotateStackCameraBy(
  orientation: StackCameraOrientation,
  yawDelta: number,
  pitchDelta: number,
): StackCameraOrientation {
  const current = clampStackOrientation(orientation);
  return clampStackOrientation({
    yaw: current.yaw + yawDelta,
    pitch: current.pitch + pitchDelta,
  });
}

export function rotateStackCamera(
  orientation: StackCameraOrientation,
  direction: StackRotationDirection,
): StackCameraOrientation {
  const delta = ROTATION_DELTAS[direction];
  return rotateStackCameraBy(orientation, delta.yaw, delta.pitch);
}

export function isStackRotationAtLimit(
  orientation: StackCameraOrientation,
  direction: StackRotationDirection,
): boolean {
  const current = clampStackOrientation(orientation);
  if (direction === 'left' || direction === 'right') return false;
  const next = rotateStackCamera(current, direction);
  return current.yaw === next.yaw && current.pitch === next.pitch;
}
