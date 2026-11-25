import { expect, test, type Locator, type Page } from '@playwright/test';
import en from '../../messages/en.json';
import es from '../../messages/es.json';
import { readStackCardBounds } from './stack-geometry.helpers';

type Locale = 'en' | 'es';

async function openScene(page: Page, locale: Locale) {
  const copy = locale === 'en' ? en : es;
  await page.goto(`/${locale}#stack`);
  const stack = page.getByRole('region', { name: copy.shared.nav.stack, exact: true });
  const canvas = stack.locator('[data-stack-canvas]');
  await expect(canvas).toHaveAttribute('data-stack-scene-ready', 'true');
  await stack.getByRole('switch', { name: copy.stack.cad.view }).click();
  await expect(canvas).toHaveAttribute('data-stack-projection', '1');
  return { stack, canvas, copy };
}

async function readOrientation(canvas: Locator) {
  const yaw = await canvas.getAttribute('data-stack-camera-yaw');
  const pitch = await canvas.getAttribute('data-stack-camera-pitch');
  if (yaw === null || pitch === null) throw new Error('Camera orientation is unavailable');
  return { yaw: Number(yaw), pitch: Number(pitch) };
}

async function findEmptyPoint(canvas: Locator) {
  await canvas.scrollIntoViewIfNeeded();
  const bounds = await readStackCardBounds(canvas);
  const candidates = Array.from({ length: 19 }, (_, index) => (index + 1) / 20);
  const point = candidates.flatMap((x) => candidates.map((y) => ({ x, y }))).find(
    ({ x, y }) => {
      if (Math.abs(x - 0.5) < 0.13 && Math.abs(y - 0.5) < 0.16) return false;
      return Object.values(bounds).every(
        (card) => x < card.left - 0.01 || x > card.right + 0.01
          || y < card.top - 0.01 || y > card.bottom + 0.01,
      );
    },
  );
  if (!point) throw new Error('Expected an empty point on the canvas');
  const rect = await canvas.boundingBox();
  if (!rect) throw new Error('Expected a displayed canvas');
  return { x: rect.x + rect.width * point.x, y: rect.y + rect.height * point.y };
}

test.describe('Stack 3D rotation', () => {
  test.use({ reducedMotion: 'reduce', viewport: { width: 1280, height: 1050 } });

  test('rotates the background on both axes, but dragging a card only moves that card', async ({ page }) => {
    const { stack, canvas, copy } = await openScene(page, 'en');
    const controls = stack.getByRole('group', { name: copy.stack.cad.rotation.label });
    await expect(controls).toBeVisible();
    const initial = await readOrientation(canvas);

    const react = (await readStackCardBounds(canvas)).react;
    const rect = await canvas.boundingBox();
    if (!rect) throw new Error('Expected a displayed canvas');
    const start = { x: rect.x + rect.width * react.x, y: rect.y + rect.height * react.y };
    const destination = { x: start.x + 65, y: start.y + 40 };
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(destination.x, destination.y, { steps: 5 });
    await page.mouse.up();
    expect(await readOrientation(canvas)).toEqual(initial);
    await expect.poll(async () => (await readStackCardBounds(canvas)).react.x).not.toBe(react.x);

    const background = await findEmptyPoint(canvas);
    await page.mouse.move(background.x, background.y);
    await page.mouse.down();
    await page.mouse.move(background.x + 90, background.y - 70, { steps: 6 });
    await page.mouse.up();
    const rotated = await readOrientation(canvas);
    expect(rotated.yaw).toBeGreaterThan(initial.yaw);
    expect(rotated.pitch).toBeGreaterThan(initial.pitch);
  });

  test('rotates through full horizontal turns and keeps vertical angles explorable', async ({ page }) => {
    const { stack, canvas, copy } = await openScene(page, 'en');
    const controls = stack.getByRole('group', { name: copy.stack.cad.rotation.label });
    const left = controls.getByRole('button', { name: copy.stack.cad.rotation.left });
    const right = controls.getByRole('button', { name: copy.stack.cad.rotation.right });
    const up = controls.getByRole('button', { name: copy.stack.cad.rotation.up });
    const down = controls.getByRole('button', { name: copy.stack.cad.rotation.down });

    await left.focus();
    await left.press('Enter');
    await expect.poll(async () => (await readOrientation(canvas)).yaw).toBeLessThan(0);
    await right.press('Space');
    await expect.poll(async () => (await readOrientation(canvas)).yaw).toBe(0);
    await up.press('Enter');
    await expect.poll(async () => (await readOrientation(canvas)).pitch).toBeGreaterThan(0);
    await down.press('Space');
    await expect.poll(async () => (await readOrientation(canvas)).pitch).toBe(0);

    for (let step = 0; step < 72; step++) await right.press('Enter');
    await expect(right).toHaveAttribute('aria-disabled', 'false');
    expect((await readOrientation(canvas)).yaw).toBe(0);
    await left.press('Enter');
    expect((await readOrientation(canvas)).yaw).toBe(-5);

    for (let step = 0; step < 12; step++) await up.press('Enter');
    await expect(up).toHaveAttribute('aria-disabled', 'true');
    const maximumPitch = await readOrientation(canvas);
    await up.press('Enter');
    expect(await readOrientation(canvas)).toEqual(maximumPitch);
    for (let step = 0; step < 12; step++) await down.press('Enter');
    await expect(down).toHaveAttribute('aria-disabled', 'true');

    const beforeIdle = await readOrientation(canvas);
    await page.waitForTimeout(250);
    expect(await readOrientation(canvas)).toEqual(beforeIdle);
  });

  test.describe('touch controls', () => {
    test.use({ hasTouch: true, viewport: { width: 390, height: 950 } });

    test('uses localized controls and keeps touch scrolling available on the canvas', async ({ page }) => {
      const { stack, canvas, copy } = await openScene(page, 'es');
      const controls = stack.getByRole('group', { name: copy.stack.cad.rotation.label });
      const left = controls.getByRole('button', { name: copy.stack.cad.rotation.left });
      const up = controls.getByRole('button', { name: copy.stack.cad.rotation.up });
      await left.tap();
      await up.tap();
      await expect.poll(async () => (await readOrientation(canvas)).yaw).toBeLessThan(0);
      await expect.poll(async () => (await readOrientation(canvas)).pitch).toBeGreaterThan(0);

      const rect = await canvas.boundingBox();
      if (!rect) throw new Error('Expected a displayed canvas');
      const beforeScroll = await page.evaluate(() => window.scrollY);
      const session = await page.context().newCDPSession(page);
      const point = { x: rect.x + rect.width * 0.1, y: rect.y + rect.height * 0.2 };
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x: point.x, y: point.y }],
      });
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: point.x, y: point.y - 80 }],
      });
      await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(beforeScroll);
      await session.detach();
    });
  });

  test.describe('camera controls with motion enabled', () => {
    test.use({ reducedMotion: 'no-preference' });

    test('eases zoom and rotation buttons to their targets', async ({ page }) => {
      const { stack, canvas, copy } = await openScene(page, 'en');
      const rotation = stack.getByRole('group', { name: copy.stack.cad.rotation.label });
      const zoom = stack.getByRole('group', { name: copy.stack.cad.zoom.label });
      const readZoom = async () => Number(await canvas.getAttribute('data-stack-camera-zoom'));

      await rotation.getByRole('button', { name: copy.stack.cad.rotation.right }).click();
      await expect.poll(async () => {
        const { yaw } = await readOrientation(canvas);
        return yaw > 0 && yaw < 5;
      }, { intervals: [5], timeout: 1_000 }).toBe(true);
      await expect.poll(async () => (await readOrientation(canvas)).yaw).toBe(5);

      await zoom.getByRole('button', { name: copy.stack.cad.zoom.in }).click();
      await expect.poll(async () => {
        const level = await readZoom();
        return level > 100 && level < 105;
      }, { intervals: [5], timeout: 1_000 }).toBe(true);
      await expect.poll(readZoom).toBe(105);
    });
  });
});
