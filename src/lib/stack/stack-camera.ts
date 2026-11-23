export const STACK_ZOOM_MIN = 85;
export const STACK_ZOOM_DEFAULT = 100;
export const STACK_ZOOM_MAX = 110;
const STACK_ZOOM_STEP = 5;

export type StackZoomDirection = 'in' | 'out';

function clampStackZoom(level: number): number {
  return Math.max(STACK_ZOOM_MIN, Math.min(STACK_ZOOM_MAX, level));
}

export function stepStackZoom(level: number, direction: StackZoomDirection): number {
  return clampStackZoom(level + (direction === 'in' ? STACK_ZOOM_STEP : -STACK_ZOOM_STEP));
}

export function getStackPerspectiveZoom(level: number, maximumFit: number): number {
  return maximumFit * (clampStackZoom(level) / STACK_ZOOM_MAX);
}
