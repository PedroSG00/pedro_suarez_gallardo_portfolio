import { expect, test } from '@playwright/test';
import { STACK_CATEGORIES, STACK_TECHNOLOGIES } from '@/content/stack';
import { readStackCardBounds } from './stack-geometry.helpers';
import { openStackScene, stackControls, STACK_LOCALES } from './stack.helpers';

for (const locale of STACK_LOCALES) {
  test.describe(`/${locale}: Stack scene`, () => {
    test.use({ reducedMotion: 'reduce' });

    test('enhances the complete accessible list when WebGL initializes', async ({
      page,
    }) => {
      const { stack, canvas, detail, technology, messages } = await openStackScene(page, locale);
      await expect(stack.getByRole('listitem')).toHaveCount(
        STACK_TECHNOLOGIES.length,
      );
      await expect(stack.getByRole('list')).toHaveCount(STACK_CATEGORIES.length);

      await expect(canvas).toBeVisible();
      await expect(canvas).toHaveAttribute(
        'data-stack-scene-card-count',
        String(STACK_TECHNOLOGIES.length),
      );

      await expect(stack.getByRole('img')).toHaveCount(0);
      const canvasBounds = await canvas.boundingBox();
      if (!canvasBounds) throw new Error('The stack canvas has no visible bounds');
      const { react } = await readStackCardBounds(canvas);
      await canvas.click({
        position: {
          x: canvasBounds.width * react.x,
          y: canvasBounds.height * react.y,
        },
      });

      await expect(technology('react')).toHaveAttribute('aria-pressed', 'true');
      await expect(detail).toContainText(messages.technologies.react.description);
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

      const { canvas, detail, filters, frame, messages, technology, view, listToggle } = stackControls(page, locale);
      const cards = frame.getByRole('listitem').getByRole('button', { disabled: false });
      await expect(cards).toHaveCount(STACK_TECHNOLOGIES.length);
      await expect(canvas).toBeHidden();
      await expect(view).toHaveCount(0);
      await expect(listToggle).toHaveCount(0);
      await expect(filters).toHaveCount(0);
      for (const name of [messages.cad.zoom.label, messages.cad.rotation.label]) {
        await expect(frame.getByRole('group', { name })).toHaveCount(0);
      }
      await expect(frame.getByRole('listitem')).toHaveCount(STACK_TECHNOLOGIES.length);
      await technology('react').click();
      await expect(detail).toContainText(messages.technologies.react.description);
    });
  });
}
