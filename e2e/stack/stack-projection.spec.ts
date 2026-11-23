import { expect, test } from '@playwright/test';
import en from '../../messages/en.json';
import es from '../../messages/es.json';
import { readStackCardBounds } from './stack-geometry.helpers';

const canvasSelector = '[data-stack-canvas]';
const { stack: copy } = en;

test('reframes the same moved cards continuously in both directions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/en#stack');
  const stack = page.getByRole('region', { name: 'Stack', exact: true });
  const canvas = stack.locator(canvasSelector);
  const view = stack.getByRole('switch', { name: copy.cad.view });
  await expect(canvas).toHaveAttribute('data-stack-scene-ready', 'true');
  await expect(view).not.toBeChecked();
  await canvas.scrollIntoViewIfNeeded();
  const rect = await canvas.boundingBox();
  if (!rect) throw new Error('Expected a displayed canvas');
  const { react } = await readStackCardBounds(canvas);
  await page.mouse.move(rect.x + rect.width * react.x, rect.y + rect.height * react.y);
  await page.mouse.down();
  await page.mouse.move(rect.x + rect.width * 1.012, rect.y + rect.height * 0.24, { steps: 6 });
  await page.mouse.up();

  const ts = stack.getByRole('button', {
    name: copy.detail.select.replace('{name}', copy.technologies.typescript.name),
  });
  await ts.press('Enter');
  const filter = stack.getByRole('radio', { name: copy.categories.frontend });
  await filter.check();
  const detail = stack.getByRole('region', { name: copy.detail.label });
  await expect(detail).toContainText(copy.technologies.typescript.description);
  const initial = await readStackCardBounds(canvas);
  expect(initial.react.x).toBeGreaterThan(0.8);
  await page.emulateMedia({ reducedMotion: 'no-preference' });

  // Sample each presentation frame rather than polling for a short-lived
  // intermediate state. The same canvas must survive both journeys.
  const sampleTrip = (target: '0' | '1') => canvas.evaluate((element, end) =>
    new Promise<{
      values: number[]; centers: number[]; visibleCards: number[]; sameCanvas: boolean;
    }>((resolve) => {
      const values: number[] = [];
      const centers: number[] = [];
      const visibleCards: number[] = [];
      element.closest('[data-stack-workbench]')
        ?.querySelector<HTMLButtonElement>('[role="switch"]')?.click();
      const start = performance.now();
      const sample = () => {
        const { stackProjection, stackCardBounds } = element.dataset;
        values.push(Number(stackProjection));
        const cards = JSON.parse(stackCardBounds ?? '{}') as Record<string, {
          x: number; left: number; right: number; top: number; bottom: number;
        }>;
        centers.push(cards.react?.x);
        visibleCards.push(Object.values(cards).filter(({ left, right, top, bottom }) =>
          left >= 0 && right <= 1 && top >= 0 && bottom <= 1).length);
        if (stackProjection === end || performance.now() - start > 2_000) {
          resolve({ values, centers, visibleCards, sameCanvas: element === document.querySelector('[data-stack-canvas]') });
        } else requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    }), target);

  let previousCenter = initial.react.x;
  for (const target of ['1', '0'] as const) {
    const trip = await sampleTrip(target);
    expect(trip.sameCanvas).toBe(true);
    expect(trip.values.some((value) => value > 0 && value < 1)).toBe(true);
    expect(trip.values.at(-1)).toBe(Number(target));
    expect(trip.visibleCards.every((count) => count === 24)).toBe(true);
    const currentCenter = (await readStackCardBounds(canvas)).react.x;
    const [start, end] = [previousCenter, currentCenter].sort((a, b) => a - b);
    expect(trip.centers.some((x) => x > start && x < end)).toBe(true);
    previousCenter = currentCenter;
    if (target === '1') {
      await expect(view).toBeChecked();
    }
    await expect(filter).toBeChecked();
    await expect(ts).toHaveAttribute('aria-pressed', 'true');
    await expect(detail).toContainText(copy.technologies.typescript.description);
  }
  await expect(view).not.toBeChecked();
  expect(await readStackCardBounds(canvas)).toEqual(initial);
});

test('changes projection in the first rendered frame with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/es#stack');
  const canvas = page.locator(canvasSelector);
  await expect(canvas).toHaveAttribute('data-stack-projection', '0');
  const view = page.getByRole('switch', { name: es.stack.cad.view });
  for (const target of ['1', '0']) {
    const firstFrame = await view.evaluate((button, selector) => {
      (button as HTMLButtonElement).click();
      return new Promise<string | undefined>((resolve) => requestAnimationFrame(() =>
        resolve(document.querySelector<HTMLCanvasElement>(selector)?.dataset.stackProjection)));
    }, canvasSelector);
    expect(firstFrame).toBe(target);
  }
});

test('keeps the full orthographic scene when a spatial depth buffer is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    const original = WebGL2RenderingContext.prototype.getContextAttributes;
    WebGL2RenderingContext.prototype.getContextAttributes = function () {
      const attributes = original.call(this);
      return attributes && { ...attributes, depth: false };
    };
  });
  await page.goto('/en#stack');
  const stack = page.getByRole('region', { name: 'Stack', exact: true });
  const canvas = stack.locator(canvasSelector);
  await expect(canvas).toHaveAttribute('data-stack-scene-ready', 'true');
  await expect(stack.getByText(copy.cad.plane)).toBeVisible();
  await expect(stack.getByRole('switch')).toHaveCount(0);
  await expect(stack.getByRole('listitem')).toHaveCount(25);
  expect(Object.keys(await readStackCardBounds(canvas))).toHaveLength(25);
});
