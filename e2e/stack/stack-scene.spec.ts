import { expect, test } from '@playwright/test';
import { STACK_CATEGORIES, STACK_TECHNOLOGIES } from '@/content/stack';
import en from '../../messages/en.json';
import es from '../../messages/es.json';

const LOCALES = [
  { locale: 'en', messages: en.stack, nav: en.shared.nav },
  { locale: 'es', messages: es.stack, nav: es.shared.nav },
] as const;

for (const { locale, messages, nav } of LOCALES) {
  test.describe(`/${locale}: Stack scene`, () => {
    test.use({ reducedMotion: 'reduce' });

    test('enhances the complete accessible list when WebGL initializes', async ({
      page,
    }) => {
      await page.goto(`/${locale}`);

      const stack = page.getByRole('region', { name: nav.stack, exact: true });
      const list = stack.locator('[data-stack-flat-list]');
      await expect(stack.getByRole('listitem')).toHaveCount(
        STACK_TECHNOLOGIES.length,
      );
      await expect(stack.getByRole('list')).toHaveCount(STACK_CATEGORIES.length);

      const canvas = stack.locator('[data-stack-canvas]');
      await expect(list).toHaveAttribute('data-scene-status', 'ready');
      await expect(list).toHaveAttribute('data-scene-active', 'true');
      await expect(canvas).toBeVisible();
      await expect(canvas).toHaveAttribute(
        'data-stack-scene-card-count',
        String(STACK_TECHNOLOGIES.length),
      );

      const reactButton = stack.getByRole('button', {
        name: messages.detail.select.replace('{name}', messages.technologies.react.name),
      });
      const canvasBounds = await canvas.boundingBox();
      if (!canvasBounds) throw new Error('The stack canvas has no visible bounds');
      await canvas.click({
        position: {
          x: canvasBounds.width * 0.43,
          y: canvasBounds.height * 0.15,
        },
      });

      await expect(reactButton).toHaveAttribute('aria-pressed', 'true');
      await expect(
        stack.getByRole('region', { name: messages.detail.label }),
      ).toContainText(messages.technologies.react.description);

      const view = stack.getByRole('switch', { name: messages.cad.view });
      const toggleList = stack.getByRole('button', { name: messages.cad.list });
      const originalCanvas = await canvas.elementHandle();
      await expect(view).not.toBeChecked();
      await stack.getByRole('radio', { name: messages.categories.frontend }).check();
      await view.click();
      await expect(view).toBeChecked();
      await expect(stack.getByRole('radio', { name: messages.categories.frontend })).toBeChecked();
      await expect(reactButton).toHaveAttribute('aria-pressed', 'true');
      await expect(canvas).toHaveAttribute('data-stack-scene-mode', '3d');
      expect(await originalCanvas?.evaluate((element) => element.isConnected)).toBe(true);
      await view.press('Space');
      await expect(canvas).toHaveAttribute('data-stack-scene-mode', '2d');
      await toggleList.click();
      await expect(toggleList).toHaveAttribute('aria-expanded', 'true');
      await expect(canvas).toBeHidden();
      await reactButton.scrollIntoViewIfNeeded();
      await expect(reactButton).toBeInViewport();
      await toggleList.click();
      await expect(canvas).toBeVisible();
      await expect(reactButton).toHaveAttribute('aria-pressed', 'true');
    });

    test('offers the full list without view controls when WebGL is blocked', async ({ page }) => {
      await page.addInitScript(() => {
        const getContext = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = (function (
          this: HTMLCanvasElement,
          contextType: string,
          options?: unknown,
        ) {
          if (contextType.startsWith('webgl')) return null;
          return Reflect.apply(getContext, this, [contextType, options]);
        }) as typeof getContext;
      });
      await page.goto(`/${locale}#stack`);

      const stack = page.getByRole('region', { name: nav.stack, exact: true });
      await expect(stack.locator('[data-stack-flat-list]')).toHaveAttribute('data-scene-status', 'fallback');
      await expect(stack.getByRole('switch')).toHaveCount(0);
      const frame = stack.getByRole('region', { name: messages.cad.title });
      await expect(frame.getByRole('listitem')).toHaveCount(STACK_TECHNOLOGIES.length);
      await frame.getByRole('button', {
        name: messages.detail.select.replace('{name}', messages.technologies.react.name),
      }).click();
      await expect(frame.getByRole('region', { name: messages.detail.label }))
        .toContainText(messages.technologies.react.description);
    });
  });
}
