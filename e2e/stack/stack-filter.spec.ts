import { expect, test } from '@playwright/test';
import { STACK_CATEGORIES, STACK_TECHNOLOGIES } from '@/content/stack';
import { canvasCoordinates, readStackCardBounds } from './stack-geometry.helpers';
import { openStackScene, STACK_COPY, STACK_LOCALES } from './stack.helpers';

function contrastRatio(foreground: string, background: string): number {
  const luminance = (color: string) => {
    const channels = color.match(/\d+/g)?.slice(0, 3).map(Number);
    if (channels?.length !== 3) throw new Error(`Unexpected color: ${color}`);

    const [red, green, blue] = channels.map((channel) => {
      const normalized = channel / 255;
      return normalized <= 0.04045
        ? normalized / 12.92
        : ((normalized + 0.055) / 1.055) ** 2.4;
    });

    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  };

  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

for (const locale of STACK_LOCALES) {
  const messages = STACK_COPY[locale].stack;

  test.describe(`/${locale}: Stack category filter`, () => {
    test.use({ reducedMotion: 'reduce' });

    test('filters in place and restores the category after leaving the keyboard-accessible list', async ({ page }) => {
      const { canvas, filters, stack, technology, view, listToggle } = await openStackScene(page, locale);
      const radio = (name: string) => filters.getByRole('radio', { name, exact: true });
      const activeRadio = filters.getByRole('radio', { checked: true });
      const all = radio(messages.filters.all);
      const frontend = radio(messages.categories.frontend);
      const dataVisualization = radio(messages.categories.dataVisualization);
      const chartJs = technology('chartJs');
      const nodeJs = technology('nodeJs');
      const initialBounds = await readStackCardBounds(canvas);

      await expect(filters.getByRole('radio')).toHaveCount(STACK_CATEGORIES.length + 1);
      for (const name of Object.values(messages.categories)) {
        await expect(radio(name)).toBeEnabled();
      }
      await expect(all).toBeChecked();
      await expect(chartJs).toBeEnabled();
      await frontend.check();
      await expect(frontend).toBeChecked();
      await expect(activeRadio).toHaveCount(1);
      await expect(stack.getByRole('listitem')).toHaveCount(STACK_TECHNOLOGIES.length);
      await expect(chartJs).toBeDisabled();
      await expect(nodeJs).toBeDisabled();
      expect(await readStackCardBounds(canvas)).toEqual(initialBounds);

      await frontend.press('ArrowRight');
      await expect(dataVisualization).toBeChecked();
      await page.keyboard.press('Tab');
      await expect(view).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(listToggle).toBeFocused();
      await page.keyboard.press('Space');
      await expect(filters).toHaveCount(0);
      await page.keyboard.press('Tab');
      await expect(technology('javascript')).toBeFocused();
      await expect(nodeJs).toBeEnabled();

      await listToggle.click();
      await expect(dataVisualization).toBeChecked();
      await expect(nodeJs).toBeDisabled();
      await all.check();
      await expect(all).toBeChecked();
      await expect(nodeJs).toBeEnabled();
    });

    test.describe('touch', () => {
      test.use({ hasTouch: true });

      test('selects an excluded technology in the list, restores the canvas filter and ejects', async ({ page }) => {
        const { filters, listToggle, technology, detail, eject } = await openStackScene(page, locale);
        const frontend = filters.getByRole('radio', { name: messages.categories.frontend, exact: true });
        const chartJs = technology('chartJs');
        await frontend.tap();
        await expect(frontend).toBeChecked();
        await expect(chartJs).toBeDisabled();

        await listToggle.tap();
        await expect(filters).toHaveCount(0);
        await chartJs.tap();
        await expect(chartJs).toHaveAttribute('aria-pressed', 'true');
        await expect(detail).toContainText(messages.technologies.chartJs.description);

        await listToggle.tap();
        await expect(frontend).toBeChecked();
        await expect(chartJs).toBeDisabled();
        await expect(detail).toContainText(messages.technologies.chartJs.description);
        await eject.tap();
        await expect(detail).toContainText(messages.detail.emptyWithDrag);
        await expect(chartJs).toHaveAttribute('aria-pressed', 'false');
      });

      test('ignores a native tap on a filtered-out canvas card', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        const { canvas, detail, filters, listToggle, technology } = await openStackScene(page, locale);
        await listToggle.tap();
        await technology('react').tap();
        await expect(detail).toContainText(messages.technologies.react.description);
        await listToggle.tap();

        await filters.getByRole('radio', { name: messages.categories.frontend, exact: true }).check();
        const at = await canvasCoordinates(canvas);
        const before = (await readStackCardBounds(canvas)).chartJs;
        const target = at(before);
        expect(await canvas.evaluate(
          (element, { x, y }) => document.elementFromPoint(x, y) === element,
          target,
        )).toBe(true);
        await page.touchscreen.tap(target.x, target.y);

        await expect(detail).toContainText(messages.technologies.react.description);
        expect((await readStackCardBounds(canvas)).chartJs).toEqual(before);
      });
    });

    for (const theme of ['light', 'dark'] as const) {
      test(`${theme} theme keeps inactive text attenuated with AA contrast`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: theme });
        const { filters, stack } = await openStackScene(page, locale);
        await filters.getByRole('radio', { name: messages.categories.frontend, exact: true }).check();

        const paint = (name: string) => stack.getByText(name, { exact: true }).evaluate((element) => ({
          foreground: getComputedStyle(element).color,
          background: getComputedStyle(document.body).backgroundColor,
        }));
        const [active, inactive] = await Promise.all([
          paint(messages.technologies.react.name),
          paint(messages.technologies.chartJs.name),
        ]);
        const activeContrast = contrastRatio(active.foreground, active.background);
        const inactiveContrast = contrastRatio(inactive.foreground, inactive.background);
        expect(inactiveContrast).toBeGreaterThanOrEqual(4.5);
        expect(inactiveContrast).toBeLessThan(activeContrast);
      });
    }
  });
}
