import { expect, test } from '@playwright/test';
import { STACK_TECHNOLOGIES } from '@/content/stack';
import en from '../../messages/en.json';
import es from '../../messages/es.json';

const LOCALES = [
  {
    locale: 'en',
    messages: en.stack,
    nav: en.shared.nav,
    selectionName: (name: string) => `Select ${name}`,
    filterLabel: 'Filter by category',
    allLabel: 'All',
    eject: 'Eject',
    empty: 'Select a card or drag it here to see what it is.',
  },
  {
    locale: 'es',
    messages: es.stack,
    nav: es.shared.nav,
    selectionName: (name: string) => `Seleccionar ${name}`,
    filterLabel: 'Filtrar por categoría',
    allLabel: 'Todas',
    eject: 'Expulsar',
    empty: 'Selecciona una carta o arrástrala aquí para ver qué es.',
  },
] as const;

for (const {
  locale,
  messages,
  nav,
  selectionName,
  filterLabel,
  allLabel,
  eject,
  empty,
} of LOCALES) {
  test.describe(`/${locale}: Stack accessible selection`, () => {
    test.use({ reducedMotion: 'reduce' });

    test('selects by keyboard, preserves detail through filtering and ejects', async ({
      page,
    }) => {
      await page.goto(`/${locale}#stack`);

      const stack = page.getByRole('region', { name: nav.stack, exact: true });
      const detail = stack.getByRole('region', {
        name: locale === 'en' ? 'Technology detail' : 'Detalle de tecnología',
      });
      const reactCopy = messages.technologies.react;
      const react = stack.getByRole('button', {
        name: selectionName(reactCopy.name),
      });

      await react.focus();
      await page.keyboard.press('Enter');
      await expect(react).toHaveAttribute('aria-pressed', 'true');
      await expect(detail).toContainText(reactCopy.description);

      const filters = stack.getByRole('group', { name: filterLabel });
      await filters
        .getByRole('radio', {
          name: messages.categories.testingCi,
        })
        .check();
      await expect(react).toBeDisabled();
      await expect(react).toHaveAttribute('aria-pressed', 'true');
      await expect(detail).toContainText(reactCopy.description);

      const ejectButton = detail.getByRole('button', { name: eject });
      await ejectButton.focus();
      await page.keyboard.press('Enter');
      await expect(detail).toContainText(empty);
      await expect(react).toHaveAttribute('aria-pressed', 'false');
      await filters.getByRole('radio', { name: allLabel }).check();
      await expect(react).toBeEnabled();
      await stack.getByRole('button', { name: messages.cad.list }).click();

      const replacement = STACK_TECHNOLOGIES.find(
        (technology) => technology.id === 'nodeJs',
      );
      if (!replacement) throw new Error('Node.js is missing from the stack registry');
      const replacementButton = stack.getByRole('button', {
        name: selectionName(messages.technologies.nodeJs.name),
      });
      await replacementButton.click();
      await expect(detail).toContainText(messages.technologies.nodeJs.description);
    });

    test('selects and ejects through touch controls', async ({ browser }) => {
      const context = await browser.newContext({
        hasTouch: true,
        reducedMotion: 'reduce',
      });

      try {
        const page = await context.newPage();
        await page.goto(`/${locale}#stack`);

        const stack = page.getByRole('region', { name: nav.stack, exact: true });
        const detail = stack.getByRole('region', {
          name: locale === 'en' ? 'Technology detail' : 'Detalle de tecnología',
        });
        const react = stack.getByRole('button', {
          name: selectionName(messages.technologies.react.name),
        });
        await stack.getByRole('button', { name: messages.cad.list }).tap();
        await react.tap();
        await expect(detail).toContainText(messages.technologies.react.description);

        const ejectButton = detail.getByRole('button', { name: eject });
        await ejectButton.tap();
        await expect(detail).toContainText(messages.detail.empty);
        await expect(react).toHaveAttribute('aria-pressed', 'false');
      } finally {
        await context.close();
      }
    });
  });
}
