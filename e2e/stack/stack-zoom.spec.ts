import { expect, test, type Locator } from '@playwright/test';
import { canvasCoordinates, canvasRect, readStackCardBounds } from './stack-geometry.helpers';
import { openStackScene } from './stack.helpers';

async function cardWidth(canvas: Locator) {
  const { react } = await readStackCardBounds(canvas);
  return react.right - react.left;
}

test.describe('Stack zoom', () => {
  test.use({ reducedMotion: 'reduce', viewport: { width: 1280, height: 1050 } });

  test('only zooms on the 3D canvas and preserves page scrolling elsewhere', async ({ page }) => {
    const { canvas, stack, view: switcher } = await openStackScene(page, 'en');
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

  test('widens zoom in both directions and restores the full composition when zoomed out', async ({ page }) => {
    const { canvas, stack, view: switcher, detail, messages, eject } = await openStackScene(page, 'en');
    const at = await canvasCoordinates(canvas);
    const { react } = await readStackCardBounds(canvas);
    const start = at(react);
    const destination = at({ x: 1.012, y: 0.24 });
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(destination.x, destination.y, { steps: 6 });
    await page.mouse.up();
    expect((await readStackCardBounds(canvas)).react.x).toBeGreaterThan(0.8);

    await switcher.click();
    await expect(canvas).toHaveAttribute('data-stack-projection', '1');
    const zoom = stack.getByRole('group', { name: '3D zoom' });
    const level = zoom.getByRole('status');
    const closer = zoom.getByRole('button', { name: 'Zoom in', exact: true });
    const farther = zoom.getByRole('button', { name: 'Zoom out', exact: true });
    const baseline = await cardWidth(canvas);
    const inspectFullComposition = async () => {
      const cards = await readStackCardBounds(canvas);
      expect(Object.keys(cards)).toHaveLength(25);
      for (const [id, { left, right, top, bottom }] of Object.entries(cards)) {
        expect(Math.min(left, top), id).toBeGreaterThanOrEqual(0);
        expect(Math.max(right, bottom), id).toBeLessThanOrEqual(1);
      }
    };

    await farther.focus();
    for (let i = 0; i < 10; i++) await farther.press('Enter');
    await expect(farther).toHaveAttribute('aria-disabled', 'true');
    await expect(farther).toBeFocused();
    await farther.press('Enter');
    await expect(level).toHaveText('50%');
    expect(await cardWidth(canvas)).toBeLessThan(baseline);
    await inspectFullComposition();
    const minimumWidth = await cardWidth(canvas);

    await closer.focus();
    for (let i = 0; i < 20; i++) await closer.press('Space');
    await expect(closer).toHaveAttribute('aria-disabled', 'true');
    await expect(closer).toBeFocused();
    await closer.press('Space');
    await expect(level).toHaveText('150%');
    expect(await cardWidth(canvas)).toBeGreaterThan(baseline);
    expect(await cardWidth(canvas)).toBeGreaterThan(minimumWidth);
    expect(Object.keys(await readStackCardBounds(canvas))).toHaveLength(25);

    for (let i = 0; i < 20; i++) await farther.press('Enter');
    await expect(level).toHaveText('50%');
    await inspectFullComposition();
    const projected = await canvasCoordinates(canvas);
    const { react: visibleReact } = await readStackCardBounds(canvas);
    const target = projected(visibleReact);
    await page.mouse.click(target.x, target.y);
    await expect(detail).toContainText(messages.technologies.react.description);
    await eject.click();
    await expect.poll(async () => (await readStackCardBounds(canvas)).react).toBeDefined();
  });

  test.describe('touch controls', () => {
    test.use({ hasTouch: true, viewport: { width: 390, height: 950 } });

    test('offers localized zoom controls only while the 3D drawing is visible', async ({ page }) => {
      const { canvas, stack, view: switcher, listToggle } = await openStackScene(page, 'es');
      await switcher.tap();
      const zoom = stack.getByRole('group', { name: 'Zoom 3D' });
      const width = await cardWidth(canvas);
      await zoom.getByRole('button', { name: 'Acercar', exact: true }).tap();
      await expect(zoom.getByRole('status')).toHaveText('105 %');
      expect(await cardWidth(canvas)).toBeGreaterThan(width);
      await zoom.getByRole('button', { name: 'Alejar', exact: true }).tap();
      await expect(zoom.getByRole('status')).toHaveText('100 %');
      expect(await cardWidth(canvas)).toBeCloseTo(width);
      await listToggle.tap();
      await expect(zoom).toHaveCount(0);
    });
  });
});
