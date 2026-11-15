import { test, expect } from '@playwright/test';

/**
 * Not-found flow E2E — RF-7 (page not found screen).
 *
 * Covers: bilingual screen, non-indexable, no header, back-to-home link,
 * link to other language, does not repeat the requested path.
 */

test.describe('Not-found flow (RF-7)', () => {
  test('shows not-found screen in Spanish for /es/nonexistent', async ({
    page,
  }) => {
    await page.goto('/es/nonexistent');

    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page.locator('main h1')).toContainText('Página no encontrada');
    await expect(page.getByRole('link', { name: 'Volver' })).toHaveAttribute(
      'href',
      '/es',
    );
    await expect(page.getByRole('link', { name: 'English' })).toHaveAttribute(
      'href',
      '/en',
    );
    // Does not repeat the requested path
    await expect(page.locator('main')).not.toContainText('/es/nonexistent');
  });

  test('shows not-found screen in English for /en/nonexistent', async ({
    page,
  }) => {
    await page.goto('/en/nonexistent');

    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('main h1')).toContainText('Page not found');
    await expect(page.getByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      '/en',
    );
    await expect(page.getByRole('link', { name: 'Español' })).toHaveAttribute(
      'href',
      '/es',
    );
    await expect(page.locator('main')).not.toContainText('/en/nonexistent');
  });

  test('back link goes to home in the active language', async ({ page }) => {
    await page.goto('/es/nonexistent');
    await page.getByRole('link', { name: 'Volver' }).click();
    await expect(page).toHaveURL(/.*\/es(\?.*)?$/);
  });

  test('other-language link goes to home in that language', async ({
    page,
  }) => {
    await page.goto('/es/nonexistent');
    await page.getByRole('link', { name: 'English' }).click();
    await expect(page).toHaveURL(/.*\/en(\?.*)?$/);
  });

  test('non-indexable: a single robots meta with noindex', async ({ page }) => {
    await page.goto('/es/nonexistent');
    const meta = page.locator('meta[name="robots"]');
    await expect(meta).toHaveCount(1);
    await expect(meta).toHaveAttribute('content', /noindex/);
  });

  test('no header / navigation on not-found screen', async ({ page }) => {
    await page.goto('/es/nonexistent');
    await expect(page.locator('header')).toHaveCount(0);
    await expect(page.locator('nav')).toHaveCount(0);
  });
});
