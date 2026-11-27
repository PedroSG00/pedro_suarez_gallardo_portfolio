import { expect, test } from '@playwright/test';
import { STACK_CATEGORIES, STACK_TECHNOLOGIES } from '@/content/stack';
import { stackControls, STACK_LOCALES } from './stack.helpers';

for (const locale of STACK_LOCALES) {
  test.describe(`/${locale}: Stack without JavaScript`, () => {
    test.use({ javaScriptEnabled: false, reducedMotion: 'reduce' });

    test('serves the complete, readable flat list with decorative logos', async ({ page }) => {
      await page.goto(`/${locale}`);

      const { stack, messages } = stackControls(page, locale);
      await expect(stack.getByRole('list')).toHaveCount(STACK_CATEGORIES.length);
      await expect(stack.getByRole('listitem')).toHaveCount(
        STACK_TECHNOLOGIES.length,
      );

      for (const technology of STACK_TECHNOLOGIES) {
        const copy = messages.technologies[technology.id];
        await expect(stack.getByText(copy.name, { exact: true })).toBeVisible();
        await expect(
          stack.getByText(copy.description, { exact: true }),
        ).toBeVisible();
      }

      const marks = stack.getByRole('img', { includeHidden: true });
      await expect(marks).toHaveCount(STACK_TECHNOLOGIES.length);
      await expect(stack.getByRole('img')).toHaveCount(0);
      for (const [index, technology] of STACK_TECHNOLOGIES.entries()) {
        await expect(marks.nth(index)).toHaveAttribute(
          'src',
          technology.id === 'cSharp' || technology.id === 'playwright'
            ? `/stack/${technology.id}-flat.svg`
            : technology.brandMark,
        );
      }

      const reveals = stack.locator('[data-reveal-root]');
      await expect(reveals).toHaveCount(STACK_CATEGORIES.length);
      for (const reveal of await reveals.all()) {
        await expect(reveal).toHaveCSS('opacity', '1');
      }

      await expect(stack.locator('canvas')).toHaveCount(0);
      for (const role of [
        'button',
        'checkbox',
        'radio',
        'textbox',
        'combobox',
        'slider',
        'progressbar',
      ] as const) {
        await expect(stack.getByRole(role)).toHaveCount(0);
      }
    });
  });
}
