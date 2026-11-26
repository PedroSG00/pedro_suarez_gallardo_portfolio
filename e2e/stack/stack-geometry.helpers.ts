import type { Locator } from '@playwright/test';

export type Point = {
  x: number;
  y: number;
};

export type StackFootprint = Point & {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export const SLOT = { x: 0.5, y: 0.5 };

export async function canvasRect(canvas: Locator) {
  await canvas.scrollIntoViewIfNeeded();
  const rect = await canvas.boundingBox();
  if (!rect) throw new Error('The stack canvas must have visible bounds');
  return rect;
}

export async function canvasCoordinates(canvas: Locator) {
  const rect = await canvasRect(canvas);
  return ({ x, y }: Point) => ({ x: rect.x + x * rect.width, y: rect.y + y * rect.height });
}

export async function readStackCardBounds(canvas: Locator): Promise<Record<string, StackFootprint>> {
  const value = await canvas.getAttribute('data-stack-card-bounds');
  if (!value) throw new Error('Missing projected card bounds');
  return JSON.parse(value) as Record<string, StackFootprint>;
}
