import { expect, test } from '@playwright/test';
import {
  FEATURED_STACK_TECHNOLOGY_IDS,
  STACK_CATEGORIES,
  STACK_TECHNOLOGIES,
} from '@/content/stack';
import { openStackScene, STACK_LOCALES } from './stack.helpers';

const CATEGORY_LABEL_KEYS = {
  frontend: 'frontend',
  'data-visualization': 'dataVisualization',
  'backend-apis': 'backendApis',
  databases: 'databases',
  'testing-ci': 'testingCi',
  'ai-tools': 'aiTools',
} as const;

for (const locale of STACK_LOCALES) {
  test.describe(`/${locale}: Stack flat list`, () => {
    test.use({ reducedMotion: 'reduce' });

    test('shows the complete editorial list after Work and before Contact', async ({ page }) => {
      const { copy, messages, stack, frame, filters, canvas, listToggle } =
        await openStackScene(page, locale, '');
      await expect(stack.getByRole('heading', { level: 2 })).toHaveText(
        `03 / ${copy.shared.nav.stack}`,
      );
      await listToggle.click();
      await expect(canvas).toBeHidden();
      await expect(filters).toHaveCount(0);

      const destinations = await page
        .locator('main > section[id]')
        .evaluateAll((sections) => sections.map((section) => section.id));
      expect(destinations).toEqual(['about', 'work', 'stack', 'contact']);

      const lists = frame.getByRole('list');
      await expect(lists).toHaveCount(STACK_CATEGORIES.length);
      for (const [index, category] of STACK_CATEGORIES.entries()) {
        const list = lists.nth(index);
        await expect(list).toHaveAccessibleName(messages.categories[CATEGORY_LABEL_KEYS[category]]);
        const names = STACK_TECHNOLOGIES.filter((technology) => technology.category === category)
          .map(({ id }) => messages.technologies[id].name);
        await expect(list.getByRole('listitem')).toHaveText(names);
        await expect(list.getByRole('button', { disabled: false })).toHaveCount(names.length);
      }
      for (const id of ['cSharp', 'playwright'] as const) {
        await expect(frame.getByRole('listitem').filter({
          hasText: messages.technologies[id].name,
        }).getByRole('img', { includeHidden: true })).toHaveAttribute(
          'src', `/stack/${id}-flat.svg`,
        );
      }
      const frontend = frame.getByRole('list', { name: messages.categories.frontend });
      const fontSize = (name: string) => frontend.getByText(name, { exact: true }).evaluate(
        (element) => Number.parseFloat(getComputedStyle(element).fontSize),
      );
      const baseline = await fontSize(messages.technologies.javascript.name);
      for (const id of FEATURED_STACK_TECHNOLOGY_IDS) {
        const { name } = messages.technologies[id];
        expect(await fontSize(name), `${name} has visual priority`).toBeGreaterThan(baseline);
      }
      await expect(frame.getByRole('progressbar')).toHaveCount(0);
    });

    test('right-aligns view controls while the list is open on desktop', async ({ page }) => {
      const { frame, listToggle } = await openStackScene(page, locale);
      await listToggle.click();
      const toolbar = frame.locator('[data-stack-toolbar]');
      const viewControls = frame.locator('[data-stack-view-controls]');
      for (const width of [830, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        const [toolbarBounds, controlsBounds, toolbarEdges] = await Promise.all([
          toolbar.boundingBox(),
          viewControls.boundingBox(),
          toolbar.evaluate((element) => {
            const style = getComputedStyle(element);
            return {
              paddingRight: Number.parseFloat(style.paddingRight),
              borderRight: Number.parseFloat(style.borderRightWidth),
            };
          }),
        ]);
        if (!toolbarBounds || !controlsBounds) {
          throw new Error('The list toolbar controls must have visible bounds');
        }
        const toolbarContentRight =
          toolbarBounds.x + toolbarBounds.width -
          toolbarEdges.paddingRight - toolbarEdges.borderRight;

        expect(
          Math.abs(toolbarContentRight - controlsBounds.x - controlsBounds.width),
        ).toBeLessThanOrEqual(1);
      }
    });

    test('reflows the card grid and keeps the inspector available while browsing', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      const { frame, listToggle, detail: inspector, technology, messages } =
        await openStackScene(page, locale);
      await listToggle.click();
      const frontend = frame.getByRole('list', { name: messages.categories.frontend });
      const cards = frontend.getByRole('listitem');
      const desktopColumns = await cards.evaluateAll((items) =>
        new Set(items.map((item) => item.getBoundingClientRect().left)).size,
      );
      await technology('react').click();
      await expect(inspector).toContainText(messages.technologies.react.description);
      await page.setViewportSize({ width: 320, height: 760 });
      const mobileColumns = await cards.evaluateAll((items) =>
        new Set(items.map((item) => item.getBoundingClientRect().left)).size,
      );
      expect(mobileColumns).toBeLessThan(desktopColumns);
      await technology('playwright').click();
      await expect(inspector).toBeInViewport();
      await expect(inspector).toContainText(messages.technologies.playwright.description);
      await expect(technology('react')).toHaveAttribute('aria-pressed', 'false');
      await expect(technology('playwright')).toHaveAttribute('aria-pressed', 'true');
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
