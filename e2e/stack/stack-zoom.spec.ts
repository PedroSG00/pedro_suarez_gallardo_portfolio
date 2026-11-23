import { expect, test, type Locator, type Page } from '@playwright/test';
import en from '../../messages/en.json';
import es from '../../messages/es.json';
import { readStackCardBounds } from './stack-geometry.helpers';

async function openStack(page: Page, locale: 'en' | 'es') {
  await page.goto(`/${locale}#stack`);
  const { stack: copy, shared: { nav } } = locale === 'en' ? en : es;
  const stack = page.getByRole('region', { name: nav.stack, exact: true });
  const canvas = stack.locator('[data-stack-canvas]');
  await expect(canvas).toHaveAttribute('data-stack-scene-ready', 'true');
  return {
    stack,
    canvas,
    switcher: stack.getByRole('switch', { name: copy.cad.view }),
    detail: stack.getByRole('region', { name: copy.detail.label }),
    description: copy.technologies.react.description,
    eject: copy.detail.eject,
  };
}

async function canvasRect(canvas: Locator) {
  await canvas.scrollIntoViewIfNeeded();
  const rect = await canvas.boundingBox();
  if (!rect) throw new Error('Expected a displayed canvas');
  return rect;
}

async function cardWidth(canvas: Locator) {
  const { react } = await readStackCardBounds(canvas);
  return react.right - react.left;
}

test.describe('Stack zoom', () => {
  test.use({ reducedMotion: 'reduce', viewport: { width: 1280, height: 1050 } });

  test('only zooms on the 3D canvas and preserves page scrolling elsewhere', async ({ page }) => {
    const { canvas, stack, switcher } = await openStack(page, 'en');
    const zoom = stack.getByRole('group', { name: '3D zoom' });
    const level = zoom.getByRole('status');
    await expect(zoom).toHaveCount(0);
    const flat = await canvasRect(canvas);
    await page.mouse.move(flat.x + flat.width / 2, flat.y + flat.height / 2);
    const scrollY = () => page.evaluate(() => window.scrollY);
    const flatStart = await scrollY();
    await page.mouse.wheel(0, 120);
    await expect.poll(scrollY).toBeGreaterThan(flatStart);

    await switcher.click();
    await expect(level).toHaveText('100%');
    const spatial = await canvasRect(canvas);
    await page.mouse.move(spatial.x + spatial.width / 2, spatial.y + spatial.height / 2);
    const initialWidth = await cardWidth(canvas);
    const beforeZoom = await scrollY();
    await page.mouse.wheel(0, -120);
    await expect(level).toHaveText('105%');
    expect(await cardWidth(canvas)).toBeGreaterThan(initialWidth);
    await page.mouse.wheel(0, 120);
    await expect(level).toHaveText('100%');
    expect(await cardWidth(canvas)).toBeCloseTo(initialWidth);
    expect(await scrollY()).toBe(beforeZoom);

    await page.mouse.move(5, spatial.y + spatial.height / 2);
    await page.mouse.wheel(0, 120);
    await expect.poll(scrollY).toBeGreaterThan(beforeZoom);
    await expect(level).toHaveText('100%');
  });

  test('keeps an edge placement reachable at both limits via mouse and keyboard', async ({ page }) => {
    const { canvas, stack, switcher, detail, description, eject } = await openStack(page, 'en');
    const flat = await canvasRect(canvas);
    const { react } = await readStackCardBounds(canvas);
    await page.mouse.move(flat.x + flat.width * react.x, flat.y + flat.height * react.y);
    await page.mouse.down();
    await page.mouse.move(flat.x + flat.width * 1.012, flat.y + flat.height * 0.24, { steps: 6 });
    await page.mouse.up();
    expect((await readStackCardBounds(canvas)).react.x).toBeGreaterThan(0.8);

    await switcher.click();
    await expect(canvas).toHaveAttribute('data-stack-projection', '1');
    const zoom = stack.getByRole('group', { name: '3D zoom' });
    const level = zoom.getByRole('status');
    const closer = zoom.getByRole('button', { name: 'Zoom in', exact: true });
    const farther = zoom.getByRole('button', { name: 'Zoom out', exact: true });
    const baseline = await cardWidth(canvas);
    const inspectEdgeCard = async () => {
      const cards = await readStackCardBounds(canvas);
      expect(Object.keys(cards)).toHaveLength(25);
      for (const [id, { left, right, top, bottom }] of Object.entries(cards)) {
        expect(Math.min(left, top), id).toBeGreaterThanOrEqual(0);
        expect(Math.max(right, bottom), id).toBeLessThanOrEqual(1);
      }
      const { x, y } = cards.react;
      const rect = await canvasRect(canvas);
      await page.mouse.click(rect.x + rect.width * x, rect.y + rect.height * y);
      await expect(detail).toContainText(description);
      await detail.getByRole('button', { name: eject }).click();
      await expect.poll(async () => (await readStackCardBounds(canvas)).react).toBeDefined();
    };

    for (let i = 0; i < 3; i++) await farther.click();
    await expect(farther).toHaveAttribute('aria-disabled', 'true');
    await expect(farther).toBeFocused();
    await farther.press('Enter');
    await expect(level).toHaveText('85%');
    expect(await cardWidth(canvas)).toBeLessThan(baseline);
    await inspectEdgeCard();
    const minimumWidth = await cardWidth(canvas);

    for (let i = 0; i < 5; i++) await closer.press('Space');
    await expect(closer).toHaveAttribute('aria-disabled', 'true');
    await expect(closer).toBeFocused();
    await closer.press('Space');
    const spatial = await canvasRect(canvas);
    await page.mouse.move(spatial.x + spatial.width / 2, spatial.y + spatial.height / 2);
    await page.mouse.wheel(0, -120);
    await expect(level).toHaveText('110%');
    expect(await cardWidth(canvas)).toBeGreaterThan(minimumWidth);
    await inspectEdgeCard();
  });

  test.describe('touch controls', () => {
    test.use({ hasTouch: true, viewport: { width: 390, height: 950 } });

    test('offers localized zoom controls only while the 3D drawing is visible', async ({ page }) => {
      const { canvas, stack, switcher } = await openStack(page, 'es');
      await switcher.tap();
      const zoom = stack.getByRole('group', { name: 'Zoom 3D' });
      const width = await cardWidth(canvas);
      await zoom.getByRole('button', { name: 'Acercar', exact: true }).tap();
      await expect(zoom.getByRole('status')).toHaveText('105 %');
      expect(await cardWidth(canvas)).toBeGreaterThan(width);
      await zoom.getByRole('button', { name: 'Alejar', exact: true }).tap();
      await expect(zoom.getByRole('status')).toHaveText('100 %');
      expect(await cardWidth(canvas)).toBeCloseTo(width);
      await stack.getByRole('button', { name: es.stack.cad.list }).tap();
      await expect(zoom).toHaveCount(0);
    });
  });
});
