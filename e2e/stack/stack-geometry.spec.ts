import { expect, test, type Page } from '@playwright/test';
import en from '../../messages/en.json';
import es from '../../messages/es.json';
import { readStackCardBounds as geometry, type StackFootprint } from './stack-geometry.helpers';

type Point = { x: number; y: number };
type Geometry = Record<string, StackFootprint>;

async function open(page: Page, locale: 'en' | 'es') {
  await page.goto(`/${locale}#stack`);
  const copy = locale === 'en' ? en : es;
  const stack = page.getByRole('region', { name: copy.shared.nav.stack, exact: true });
  const canvas = stack.locator('[data-stack-canvas]');
  await expect(canvas).toHaveAttribute('data-stack-scene-ready', 'true');
  const detail = stack.getByRole('region', { name: copy.stack.detail.label });
  const coordinates = async () => {
    await canvas.scrollIntoViewIfNeeded();
    const rect = await canvas.boundingBox();
    if (!rect) throw new Error('The canvas must be visible');
    return ({ x, y }: Point) => ({ x: rect.x + x * rect.width, y: rect.y + y * rect.height });
  };
  const drag = async (start: Point, end: Point) => {
    const at = await coordinates();
    const from = at(start);
    const to = at(end);
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(to.x, to.y, { steps: 7 });
    await page.mouse.up();
  };
  return { canvas, coordinates, copy, detail, drag, stack };
}

function expectInCanvas(cards: Geometry) {
  for (const [id, { left, right, top, bottom }] of Object.entries(cards)) {
    expect(left, `${id}: left`).toBeGreaterThanOrEqual(0);
    expect(right, `${id}: right`).toBeLessThanOrEqual(1);
    expect(top, `${id}: top`).toBeGreaterThanOrEqual(0);
    expect(bottom, `${id}: bottom`).toBeLessThanOrEqual(1);
  }
}

test.describe('Stack card geometry', () => {
  test.use({ reducedMotion: 'reduce' });

  test('keeps all four edges reachable on a narrow canvas at 200% text', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 2170 });
    await page.addInitScript(() => document.documentElement.style.setProperty('font-size', '200%'));
    const { canvas, coordinates, copy, detail, drag } = await open(page, 'es');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
    const edges = [
      { point: { x: -0.04, y: 0.17 }, edge: 'left', limit: 0 },
      { point: { x: 1.04, y: 0.17 }, edge: 'right', limit: 1 },
      { point: { x: 0.56, y: -0.025 }, edge: 'top', limit: 0 },
      { point: { x: 0.56, y: 1.025 }, edge: 'bottom', limit: 1 },
    ] as const;
    for (const { point, edge, limit } of edges) {
      await drag((await geometry(canvas)).react, point);
      const cards = await geometry(canvas);
      expectInCanvas(cards);
      expect(Math.abs(cards.react[edge] - limit)).toBeLessThan(0.06);
    }

    const target = (await coordinates())((await geometry(canvas)).react);
    await page.mouse.click(target.x, target.y);
    await expect(detail).toContainText(copy.stack.technologies.react.description);
  });

  test('separates a collision immediately, keeps the slot clear, and returns a card to an unoccupied space', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1050 });
    const { canvas, copy, detail, drag } = await open(page, 'en');
    const initial = await geometry(canvas);
    expect(Object.keys(initial)).toHaveLength(25);
    await drag(initial.react, initial.typescript);
    const blocked = await geometry(canvas);
    expect(Math.hypot(blocked.typescript.x - initial.typescript.x, blocked.typescript.y - initial.typescript.y)).toBeGreaterThan(0.02);
    expect(Math.hypot(blocked.react.x - blocked.typescript.x, blocked.react.y - blocked.typescript.y)).toBeGreaterThan(0.04);
    expectInCanvas(blocked);

    await drag(blocked.react, { x: 0.5, y: 0.5 });
    await expect(detail).toContainText(copy.stack.technologies.react.description);
    const occupied = await geometry(canvas);
    expect(occupied.react).toBeUndefined();
    // Fill the old position to exercise the search for a genuinely free return.
    await drag(occupied.typescript, blocked.react);
    await detail.getByRole('button', { name: copy.stack.detail.eject, exact: true }).click();
    const returned = await geometry(canvas);
    expectInCanvas(returned);
    const a = returned.react;
    for (const [id, b] of Object.entries(returned)) {
      if (id === 'react') continue;
      expect(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top, id).toBe(true);
    }
  });

  test('keeps cards and a resized edge drop inside perspective', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1050 });
    const { canvas, copy, drag, stack } = await open(page, 'en');
    await stack.getByRole('switch', { name: copy.stack.cad.view }).click();
    await drag((await geometry(canvas)).react, { x: 1.025, y: 0.23 });
    const beforeResize = await geometry(canvas);
    expectInCanvas(beforeResize);
    expect(beforeResize.react.x).toBeGreaterThan(0.7);
    await page.setViewportSize({ width: 390, height: 1050 });
    await expect.poll(() => geometry(canvas)).not.toEqual(beforeResize);
    const mobile = await geometry(canvas);
    expectInCanvas(mobile);

    await drag(mobile.react, { x: 0.5, y: 1.025 });
    const lowerEdge = await geometry(canvas);
    expectInCanvas(lowerEdge);
    expect(Math.abs(lowerEdge.react.bottom - 1)).toBeLessThan(0.08);
  });

  test('keeps collision displacement continuous and rolls back a cancelled gesture', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1050 });
    const { canvas, coordinates } = await open(page, 'en');
    const initial = await geometry(canvas);
    const at = await coordinates();
    const from = at(initial.react);
    const to = at(initial.typescript);
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(to.x, to.y, { steps: 8 });
    const displaced = await geometry(canvas);
    expect(displaced.typescript).not.toEqual(initial.typescript);
    // Continue away: a neighbor must not rebound to its pre-drag position.
    await page.mouse.move(to.x, to.y + 20, { steps: 3 });
    const continuing = await geometry(canvas);
    expect(continuing.typescript).not.toEqual(initial.typescript);
    await canvas.dispatchEvent('pointercancel', { pointerId: 1 });
    await expect.poll(() => geometry(canvas)).toEqual(initial);
    await page.mouse.up();
  });

  test('keeps a pushed neighbor still after release with reduced motion', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1050 });
    const { canvas, coordinates } = await open(page, 'en');
    const initial = await geometry(canvas);
    const at = await coordinates();
    const from = at(initial.react);
    const to = at(initial.typescript);

    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(to.x, to.y, { steps: 8 });
    await page.mouse.up();
    const atRelease = await geometry(canvas);
    await page.waitForTimeout(220);

    expect(await geometry(canvas)).toEqual(atRelease);
  });
});

test.describe('Stack ambient motion', () => {
  test.use({ reducedMotion: 'no-preference', viewport: { width: 1280, height: 1050 } });

  test('keeps unheld cards moving while a card is dragged', async ({ page }) => {
    const { canvas, coordinates } = await open(page, 'en');
    await canvas.evaluate((element) => element.scrollIntoView({ block: 'center' }));
    const initial = await geometry(canvas);
    const at = await coordinates();
    const from = at(initial.react);
    const destination = at({ x: 0.42, y: 0.35 });

    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(destination.x, destination.y, { steps: 6 });
    await expect(canvas).toHaveAttribute('data-stack-dragging', 'true');
    const whileHeld = await geometry(canvas);
    await page.waitForTimeout(250);
    const afterAmbientFrames = await geometry(canvas);

    expect(afterAmbientFrames.react.x).toBeCloseTo(whileHeld.react.x, 4);
    expect(afterAmbientFrames.react.y).toBeCloseTo(whileHeld.react.y, 4);
    const greatestNeighborMovement = Object.keys(afterAmbientFrames)
      .filter((id) => id !== 'react')
      .reduce((greatest, id) => {
        const before = whileHeld[id];
        const after = afterAmbientFrames[id];
        return Math.max(greatest, Math.hypot(after.x - before.x, after.y - before.y));
      }, 0);
    expect(greatestNeighborMovement).toBeGreaterThan(0.0001);

    await page.mouse.up();
  });

  test('lets a pushed neighbor glide briefly after release', async ({ page }) => {
    const { canvas, coordinates } = await open(page, 'en');
    await canvas.evaluate((element) => element.scrollIntoView({ block: 'center' }));
    const initial = await geometry(canvas);
    const at = await coordinates();
    const from = at(initial.react);
    const to = at(initial.typescript);

    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(to.x, to.y, { steps: 8 });
    await page.mouse.up();
    const atRelease = await geometry(canvas);
    await page.waitForTimeout(220);
    const afterGlide = await geometry(canvas);
    const distance = Math.hypot(
      afterGlide.typescript.x - atRelease.typescript.x,
      afterGlide.typescript.y - atRelease.typescript.y,
    );

    expect(distance).toBeGreaterThan(0.0005);
    expect(distance).toBeLessThan(0.03);
  });
});
