import { expect, test } from '@playwright/test';
import { STACK_CATEGORIES, STACK_TECHNOLOGIES } from '@/content/stack';
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
  {
    locale: 'en',
    messages: en.stack,
    nav: en.shared.nav,
    filterLabel: 'Filter by category',
    allLabel: 'All',
    selectionName: (name: string) => `Select ${name}`,
  },
  {
    locale: 'es',
    messages: es.stack,
    nav: es.shared.nav,
    filterLabel: 'Filtrar por categoría',
    allLabel: 'Todas',
    selectionName: (name: string) => `Seleccionar ${name}`,
  },
] as const;

const THEMES = ['light', 'dark'] as const;

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

  const foregroundLuminance = luminance(foreground);
  const backgroundLuminance = luminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

for (const {
  locale,
  messages,
  nav,
  filterLabel,
  allLabel,
  selectionName,
} of LOCALES) {
  test.describe(`/${locale}: Stack category filter`, () => {
    test.use({ reducedMotion: 'reduce' });

    test('selects one category, preserves the full editorial list and restores All', async ({
      page,
    }) => {
      await page.goto(`/${locale}#stack`);

      const stack = page.getByRole('region', { name: nav.stack, exact: true });
      const group = stack.getByRole('group', { name: filterLabel });
      const radios = group.getByRole('radio');
      const all = group.getByRole('radio', { name: allLabel, exact: true });
      const namesBefore = await stack.getByRole('listitem').allTextContents();

      await expect(radios).toHaveCount(STACK_CATEGORIES.length + 1);
      await expect(all).toBeChecked();
      for (const key of CATEGORY_LABEL_KEYS) {
        await expect(
          group.getByRole('radio', {
            name: messages.categories[key],
            exact: true,
          }),
        ).not.toBeChecked();
      }

      const frontend = group.getByRole('radio', {
        name: messages.categories.frontend,
        exact: true,
      });
      await frontend.check();

      await expect(frontend).toBeChecked();
      await expect(group.getByRole('radio', { checked: true })).toHaveCount(1);
      await expect(stack.getByRole('listitem')).toHaveCount(
        STACK_TECHNOLOGIES.length,
      );
      for (const technology of STACK_TECHNOLOGIES) {
        await expect(
          stack.getByText(messages.technologies[technology.id].name, {
            exact: true,
          }),
        ).toBeVisible();
      }
      expect(await stack.getByRole('listitem').allTextContents()).toEqual(
        namesBefore,
      );

      await expect(
        stack.getByRole('button', {
          name: selectionName(messages.technologies.chartJs.name),
        }),
      ).toBeDisabled();
      await expect(
        stack.getByRole('button', {
          name: selectionName(messages.technologies.nodeJs.name),
        }),
      ).toBeDisabled();
      await expect(frontend).toBeChecked();

      await frontend.focus();
      await page.keyboard.press('ArrowRight');
      await expect(
        group.getByRole('radio', {
          name: messages.categories.dataVisualization,
          exact: true,
        }),
      ).toBeChecked();
      await page.keyboard.press('Tab');
      await expect(stack.getByRole('switch', { name: messages.cad.view })).toBeFocused();
      await page.keyboard.press('Tab');
      const listToggle = stack.getByRole('button', { name: messages.cad.list });
      await expect(listToggle).toBeFocused();
      await page.keyboard.press('Space');
      await page.keyboard.press('Tab');

      await expect(
        stack.getByRole('button', {
          name: selectionName(messages.technologies.chartJs.name),
        }),
      ).toBeFocused();

      await all.check();
      await expect(all).toBeChecked();
      await expect(group.getByRole('radio', { checked: true })).toHaveCount(1);
    });

    test('keeps inactive technology entries non-actionable by touch', async ({
      browser,
    }) => {
      const context = await browser.newContext({
        hasTouch: true,
        reducedMotion: 'reduce',
      });

      try {
        const page = await context.newPage();
        await page.goto(`/${locale}#stack`);

        const stack = page.getByRole('region', { name: nav.stack, exact: true });
        const group = stack.getByRole('group', { name: filterLabel });
        const frontend = group.getByRole('radio', {
          name: messages.categories.frontend,
          exact: true,
        });
        const filterBounds = await frontend.boundingBox();
        expect(filterBounds).not.toBeNull();
        await page.touchscreen.tap(
          filterBounds!.x + filterBounds!.width / 2,
          filterBounds!.y + filterBounds!.height / 2,
        );
        await expect(frontend).toBeChecked();

        const inactiveTechnology = stack.getByText(
          messages.technologies.chartJs.name,
          { exact: true },
        );
        const technologyBounds = await inactiveTechnology.boundingBox();
        expect(technologyBounds).not.toBeNull();
        await page.touchscreen.tap(
          technologyBounds!.x + technologyBounds!.width / 2,
          technologyBounds!.y + technologyBounds!.height / 2,
        );
        await expect(frontend).toBeChecked();
        await expect(inactiveTechnology).toBeVisible();
      } finally {
        await context.close();
      }
    });

    for (const theme of THEMES) {
      test(`${theme} theme keeps inactive text attenuated with AA contrast`, async ({
        page,
      }) => {
        await page.emulateMedia({ colorScheme: theme });
        await page.goto(`/${locale}#stack`);

        const stack = page.getByRole('region', { name: nav.stack, exact: true });
        const group = stack.getByRole('group', { name: filterLabel });
        await group
          .getByRole('radio', {
            name: messages.categories.frontend,
            exact: true,
          })
          .check();

        const [activePaint, inactivePaint] = await Promise.all(
          [
            stack.getByText(messages.technologies.react.name, { exact: true }),
            stack.getByText(messages.technologies.chartJs.name, { exact: true }),
          ].map((technology) =>
            technology.evaluate((element) => ({
              foreground: getComputedStyle(element).color,
              background: getComputedStyle(document.body).backgroundColor,
            })),
          ),
        );
        const activeContrast = contrastRatio(
          activePaint.foreground,
          activePaint.background,
        );
        const inactiveContrast = contrastRatio(
          inactivePaint.foreground,
          inactivePaint.background,
        );

        expect(inactivePaint.foreground).not.toBe(activePaint.foreground);
        expect(inactiveContrast).toBeGreaterThanOrEqual(4.5);
        expect(inactiveContrast).toBeLessThan(activeContrast);
      });
    }
  });
}
