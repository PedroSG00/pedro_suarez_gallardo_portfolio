import { expect, test } from '@playwright/test';
import {
  FEATURED_STACK_TECHNOLOGY_IDS,
  STACK_CATEGORIES,
  STACK_TECHNOLOGIES,
} from '@/content/stack';
import en from '../../messages/en.json';
import es from '../../messages/es.json';

const CATEGORY_LABEL_KEYS = [
  'frontend',
  'dataVisualization',
  'backendApis',
  'databases',
  'testingCi',
  'aiTools',
] as const;

const LOCALES = [
  { locale: 'en', messages: en.stack, nav: en.shared.nav },
  { locale: 'es', messages: es.stack, nav: es.shared.nav },
] as const;

const FEATURED_IDS: ReadonlySet<string> = new Set(
  FEATURED_STACK_TECHNOLOGY_IDS,
);

const technologiesIn = (category: string) =>
  STACK_TECHNOLOGIES.filter((technology) => technology.category === category);

for (const { locale, messages, nav } of LOCALES) {
  test.describe(`/${locale}: Stack flat list`, () => {
    test.use({ reducedMotion: 'reduce' });

    test('shows the complete stack after Work and before Contact', async ({ page }) => {
      await page.goto(`/${locale}`);

      const stack = page.getByRole('region', { name: nav.stack, exact: true });
      await expect(stack).toHaveCount(1);
      await expect(stack.getByRole('heading', { level: 2 })).toHaveCount(1);
      await expect(stack.getByRole('heading', { level: 2 })).toHaveText(
        `03 / ${nav.stack}`,
      );

      const destinations = await page
        .locator('main > section[id]')
        .evaluateAll((sections) => sections.map((section) => section.id));
      expect(destinations).toEqual(['about', 'work', 'stack', 'contact']);

      const lists = stack.getByRole('list');
      await expect(lists).toHaveCount(STACK_CATEGORIES.length);
      for (const [index, category] of STACK_CATEGORIES.entries()) {
        const list = lists.nth(index);
        await expect(list).toHaveAccessibleName(
          messages.categories[CATEGORY_LABEL_KEYS[index]],
        );
        await expect(list.getByRole('listitem')).toHaveCount(
          technologiesIn(category).length,
        );
      }

      for (const technology of STACK_TECHNOLOGIES) {
        const copy = messages.technologies[technology.id];
        await expect(stack.getByText(copy.name, { exact: true })).toBeVisible();
        await expect(
          stack.getByText(copy.description, { exact: true }),
        ).toBeVisible();
      }

      await expect(stack.getByRole('img', { includeHidden: true })).toHaveCount(
        STACK_TECHNOLOGIES.length,
      );
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
      await expect(stack.locator('canvas')).toHaveCount(0);
    });

    test('gives React and TypeScript visual priority inside Frontend', async ({ page }) => {
      await page.goto(`/${locale}#stack`);

      const stack = page.getByRole('region', { name: nav.stack, exact: true });
      const featured = STACK_TECHNOLOGIES.filter((technology) =>
        FEATURED_IDS.has(technology.id),
      ).map((technology) => messages.technologies[technology.id].name);

      await expect(stack.locator('[data-featured]')).toHaveCount(featured.length);
      for (const name of featured) {
        await expect(
          stack.locator('[data-featured]').getByText(name, { exact: true }),
        ).toBeVisible();
      }

      const fontSize = (name: string) =>
        stack
          .getByText(name, { exact: true })
          .evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));

      const baseline = await fontSize(messages.technologies.javascript.name);
      for (const name of featured) {
        expect(await fontSize(name), `${name} has visual priority`).toBeGreaterThan(
          baseline,
        );
      }
    });
  });
}
