import type { Locator } from '@playwright/test';

export type StackFootprint = {
  x: number;
  y: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export async function readStackCardBounds(canvas: Locator): Promise<Record<string, StackFootprint>> {
  const value = await canvas.getAttribute('data-stack-card-bounds');
  if (!value) throw new Error('Missing projected card bounds');
  return JSON.parse(value) as Record<string, StackFootprint>;
}
