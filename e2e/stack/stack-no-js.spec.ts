import { expect, test } from '@playwright/test';
import { STACK_CATEGORIES, STACK_TECHNOLOGIES } from '@/content/stack';
import en from '../../messages/en.json';
import es from '../../messages/es.json';

const LOCALES = [
  { locale: 'en', messages: en.stack, nav: en.shared.nav },
  { locale: 'es', messages: es.stack, nav: es.shared.nav },
] as const;

for (const { locale, messages, nav } of LOCALES) {
  test.describe(`/${locale}: Stack without JavaScript`, () => {
    test.use({ javaScriptEnabled: false, reducedMotion: 'reduce' });

    test('serves the complete, readable flat list in both languages', async ({ page }) => {
      await page.goto(`/${locale}`);

      const stack = page.getByRole('region', { name: nav.stack, exact: true });
      await expect(stack).toHaveCount(1);
      await expect(stack.getByRole('heading', { level: 2 })).toHaveCount(1);
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
        expect(
          await reveal.evaluate((element) =>
            Number(getComputedStyle(element).opacity),
          ),
        ).toBe(1);
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
