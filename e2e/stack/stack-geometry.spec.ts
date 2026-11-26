import { expect, test, type Page } from '@playwright/test';
import { canvasCoordinates, readStackCardBounds as geometry, SLOT, type Point, type StackFootprint } from './stack-geometry.helpers';
import { openStackScene, type StackLocale } from './stack.helpers';

type Geometry = Record<string, StackFootprint>;

async function open(page: Page, locale: StackLocale) {
  const scene = await openStackScene(page, locale);
  const coordinates = () => canvasCoordinates(scene.canvas);
  const drag = async (start: Point, end: Point) => {
    const at = await coordinates();
    const from = at(start);
    const to = at(end);
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(to.x, to.y, { steps: 7 });
    await page.mouse.up();
  };
  return { ...scene, coordinates, drag };
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
    await page.setViewportSize({ width: 320, height: 2400 });
    await page.addInitScript(() => document.documentElement.style.setProperty('font-size', '200%'));
    const { canvas, coordinates, copy, detail, drag, stack } = await open(page, 'es');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
    await canvas.scrollIntoViewIfNeeded();
    const dock = stack.locator('[data-stack-detail-dock]');
    const canvasBox = (await canvas.boundingBox())!;
    const dockBox = (await dock.boundingBox())!;
    // Reveal any part of the canvas covered by the sticky inspector before
    // starting the gesture. A canvas can intersect the viewport and still be occluded.
    await page.evaluate((offset) => window.scrollBy(0, Math.min(0, offset)), canvasBox.y - dockBox.y - dockBox.height - 40);
    const edges = [
      { point: { x: -0.04, y: 0.17 }, edge: 'left', limit: 0 },
      { point: { x: 1.04, y: 0.17 }, edge: 'right', limit: 1 },
      { point: { x: 0.56, y: -0.025 }, edge: 'top', limit: 0 },
      { point: { x: 0.56, y: 1.025 }, edge: 'bottom', limit: 1 },
    ] as const;
    for (const { point, edge, limit } of edges) {
      const start = (await geometry(canvas)).react;
      const from = (await coordinates())(start);
      expect(await canvas.evaluate(
        (element, { x, y }) => document.elementFromPoint(x, y) === element,
        from,
      ), `React is reachable before dragging to the ${edge} edge`).toBe(true);
      await drag(start, point);
      const cards = await geometry(canvas);
      expectInCanvas(cards);
      expect(Math.abs(cards.react[edge] - limit), `React reaches the ${edge} edge`).toBeLessThan(0.06);
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

    await drag(blocked.react, SLOT);
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

  test('pauses ambient motion outside the viewport and resumes on return', async ({ page }) => {
    await page.addInitScript(() => {
      const frames = new WeakMap<WebGL2RenderingContext['canvas'], number>();
      Reflect.set(window, 'stackFrameCounts', frames);
      const prototype = WebGL2RenderingContext.prototype;
      const clear = prototype.clear;
      prototype.clear = function (mask) {
        frames.set(this.canvas, (frames.get(this.canvas) ?? 0) + 1);
        clear.call(this, mask);
      };
    });
    const { canvas } = await openStackScene(page, 'en');
    // Settled card bounds intentionally do not update on idle ambient frames.
    const frameCount = () => canvas.evaluate((element: HTMLCanvasElement) =>
      (Reflect.get(window, 'stackFrameCounts') as WeakMap<HTMLCanvasElement, number>).get(element) ?? 0,
    );
    const centerScene = () => canvas.evaluate(
      (element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }),
    );
    await centerScene();
    await expect(canvas).toBeInViewport();
    const initial = await frameCount();
    await expect.poll(frameCount).toBeGreaterThan(initial);

    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await expect(canvas).not.toBeInViewport();
    const offscreenFrames = await canvas.evaluate(async (element: HTMLCanvasElement) => {
      // Let the browser deliver the offscreen intersection before sampling.
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      const frames = Reflect.get(window, 'stackFrameCounts') as WeakMap<HTMLCanvasElement, number>;
      const before = frames.get(element) ?? 0;
      await new Promise((resolve) => window.setTimeout(resolve, 250));
      return (frames.get(element) ?? 0) - before;
    });
    expect(offscreenFrames).toBe(0);

    const paused = await frameCount();
    await centerScene();
    await expect(canvas).toBeInViewport();
    await expect.poll(frameCount).toBeGreaterThan(paused);
  });

  test('lets a pushed neighbor glide briefly after release', async ({ page }) => {
    const { canvas, coordinates } = await open(page, 'en');
    await canvas.evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
    const initial = await geometry(canvas);
    const at = await coordinates();
    const from = at(initial.react);
    const to = at(initial.typescript);

    await page.mouse.move(from.x, from.y);
    await expect(canvas).toHaveAttribute('data-stack-hovered-technology', 'react');
    await page.mouse.down();
    // Capture the release and subsequent frames in the browser, before
    // another automation round trip can consume the short glide.
    const sample = await canvas.evaluateHandle((element: HTMLCanvasElement) => ({
      result: new Promise<{ pushed: number; glide: number }>((resolve) => {
        const neighbor = () => (JSON.parse(element.dataset.stackCardBounds!) as Geometry).typescript;
        const beforePush = neighbor();
        const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
        document.addEventListener('pointerup', () => {
          const released = neighbor();
          let glide = 0;
          const observer = new MutationObserver(() => {
            glide = Math.max(glide, distance(neighbor(), released));
          });
          observer.observe(element, { attributes: true, attributeFilter: ['data-stack-card-bounds'] });
          window.setTimeout(() => {
            observer.disconnect();
            resolve({ pushed: distance(beforePush, released), glide });
          }, 550);
        }, { once: true });
      }),
    }));
    // The scene already subdivides fast gestures for collision detection.
    await page.mouse.move(to.x, to.y);
    await page.mouse.up();
    const { pushed, glide } = await sample.evaluate(({ result }) => result);
    await sample.dispose();
    expect(pushed).toBeGreaterThan(0.01);
    expect(glide).toBeGreaterThan(0.00035);
    expect(glide).toBeLessThan(0.03);
  });
});
