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
      await stack.getByRole('button', { name: messages.cad.list }).click();
      await expect(stack.locator('canvas')).toBeHidden();
      const frame = stack.getByRole('region', { name: messages.cad.title });

      const destinations = await page
        .locator('main > section[id]')
        .evaluateAll((sections) => sections.map((section) => section.id));
      expect(destinations).toEqual(['about', 'work', 'stack', 'contact']);

      const lists = frame.getByRole('list');
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
        await expect(frame.getByText(copy.description, { exact: true })).toHaveCount(0);
      }

      const marks = stack.locator('[data-stack-accessible-list]')
        .getByRole('img', { includeHidden: true });
      await expect(marks).toHaveCount(STACK_TECHNOLOGIES.length);
      for (const [index, technology] of STACK_TECHNOLOGIES.entries()) {
        await expect(marks.nth(index)).toHaveAttribute(
          'src',
          technology.id === 'cSharp' || technology.id === 'playwright'
            ? `/stack/${technology.id}-flat.svg`
            : technology.brandMark,
        );
      }
      const filters = stack.getByRole('group', {
        name: locale === 'en' ? 'Filter by category' : 'Filtrar por categoría',
      });
      await expect(filters.getByRole('radio')).toHaveCount(
        STACK_CATEGORIES.length + 1,
      );
      await expect(
        filters.getByRole('radio', {
          name: locale === 'en' ? 'All' : 'Todas',
        }),
      ).toBeChecked();

      await expect(lists.getByRole('button')).toHaveCount(
        STACK_TECHNOLOGIES.length,
      );
      for (const role of [
        'checkbox',
        'textbox',
        'combobox',
        'slider',
        'progressbar',
      ] as const) {
        await expect(stack.getByRole(role)).toHaveCount(0);
      }
    });

    test('gives React and TypeScript visual priority inside Frontend', async ({ page }) => {
      await page.goto(`/${locale}#stack`);

      const stack = page.getByRole('region', { name: nav.stack, exact: true });
      await stack.getByRole('button', { name: messages.cad.list }).click();
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

    test('reflows the card grid and keeps the inspector available while browsing', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(`/${locale}#stack`);
      const frame = page.getByRole('region', { name: messages.cad.title });
      await frame.getByRole('button', { name: messages.cad.list }).click();
      const frontend = frame.getByRole('list', { name: messages.categories.frontend });
      const cards = frontend.getByRole('listitem');
      const desktopColumns = await cards.evaluateAll((items) =>
        new Set(items.map((item) => item.getBoundingClientRect().left)).size,
      );
      const select = (name: string) => frame.getByRole('button', {
        name: messages.detail.select.replace('{name}', name),
      });
      await select(messages.technologies.react.name).click();
      const inspector = frame.getByRole('region', { name: messages.detail.label });
      await expect(inspector).toContainText(messages.technologies.react.description);
      await page.setViewportSize({ width: 320, height: 760 });
      const mobileColumns = await cards.evaluateAll((items) =>
        new Set(items.map((item) => item.getBoundingClientRect().left)).size,
      );
      expect(mobileColumns).toBeLessThan(desktopColumns);
      await select(messages.technologies.playwright.name).click();
      await expect(inspector).toBeInViewport();
      await expect(inspector).toContainText(messages.technologies.playwright.description);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);

      await page.evaluate(() => {
        document.documentElement.style.fontSize = '200%';
      });
      const toolbar = frame.locator('[data-stack-toolbar]');
      expect(await toolbar.evaluate((element) => element.scrollWidth))
        .toBeLessThanOrEqual(await toolbar.evaluate((element) => element.clientWidth));
    });
  });
}
