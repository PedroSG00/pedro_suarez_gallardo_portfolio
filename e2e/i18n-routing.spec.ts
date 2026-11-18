import { expect, test } from '@playwright/test';

test.describe('i18n routing', () => {
  test.beforeEach(async ({ page, context }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await context.clearCookies();
  });

  test('visiting / with Spanish cookie redirects to /es', async ({ page, context }) => {
    await context.addCookies([
      { name: 'psg_locale', value: 'es', url: 'http://127.0.0.1:3000' },
    ]);
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(400);
    expect(page.url()).toContain('/es');
  });

  test('visiting / with English cookie redirects to /en', async ({ page, context }) => {
    await context.addCookies([
      { name: 'psg_locale', value: 'en', url: 'http://127.0.0.1:3000' },
    ]);
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(400);
    expect(page.url()).toContain('/en');
  });

  test('visiting / without cookie and Accept-Language es redirects to /es', async ({ page }) => {
    await page.route('http://127.0.0.1:3000/', (route) => {
      const headers = { ...route.request().headers() };
      headers['accept-language'] = 'es,en;q=0.9';
      route.continue({ headers });
    });
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(400);
    expect(page.url()).toContain('/es');
  });

  test('visiting / without cookie and Accept-Language en redirects to /en', async ({ page, context }) => {
    await context.setExtraHTTPHeaders({ 'accept-language': 'en,es;q=0.9' });
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(400);
    expect(page.url()).toContain('/en');
  });

  test('visiting / with Accept-Language fr redirects to /en', async ({ page, context }) => {
    await context.setExtraHTTPHeaders({ 'accept-language': 'fr,de;q=0.8' });
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(400);
    expect(page.url()).toContain('/en');
  });

  test('visiting /fr shows 404 in English without redirect', async ({ page }) => {
    const response = await page.goto('/fr');
    expect(response?.status()).toBe(404);
    expect(page.url()).toContain('/fr');
    await expect(page.locator('body')).toContainText('Not found');
  });

  test('visiting /fr/about shows 404 in English without redirect', async ({ page }) => {
    const response = await page.goto('/fr/about');
    expect(response?.status()).toBe(404);
    expect(page.url()).toContain('/fr/about');
    await expect(page.locator('body')).toContainText('Not found');
  });

  test('visiting /en/es shows 404 (double prefix)', async ({ page }) => {
    const response = await page.goto('/en/es');
    expect(response?.status()).toBe(404);
  });

  test('visiting /EN normalizes to /en and shows English', async ({ page }) => {
    const response = await page.goto('/EN');
    expect(response?.status()).toBeLessThan(400);
    expect(page.url()).toContain('/en');
    await expect(page.locator('body')).toContainText('Web portfolio');
  });

  test('visiting /es/ normalizes to /es and shows Spanish', async ({ page }) => {
    const response = await page.goto('/es/');
    expect(response?.status()).toBeLessThan(400);
    expect(page.url()).toContain('/es');
    await expect(page.locator('body')).toContainText('Portfolio web');
  });

  test('visiting /en directly shows English content', async ({ page }) => {
    const response = await page.goto('/en');
    expect(response?.status()).toBeLessThan(400);
    expect(page.url()).toContain('/en');
    await expect(page.locator('body')).toContainText('Web portfolio');
  });

  test('visiting /es directly shows Spanish content', async ({ page }) => {
    const response = await page.goto('/es');
    expect(response?.status()).toBeLessThan(400);
    expect(page.url()).toContain('/es');
    await expect(page.locator('body')).toContainText('Portfolio web');
  });

  test('Spanish cookie is ignored when entering /en directly', async ({ page, context }) => {
    await context.addCookies([
      { name: 'psg_locale', value: 'es', url: 'http://127.0.0.1:3000' },
    ]);
    const response = await page.goto('/en');
    expect(response?.status()).toBeLessThan(400);
    expect(page.url()).toContain('/en');
    await expect(page.locator('body')).toContainText('Web portfolio');
  });

  test('English cookie is ignored when entering /es directly', async ({ page, context }) => {
    await context.addCookies([
      { name: 'psg_locale', value: 'en', url: 'http://127.0.0.1:3000' },
    ]);
    const response = await page.goto('/es');
    expect(response?.status()).toBeLessThan(400);
    expect(page.url()).toContain('/es');
    await expect(page.locator('body')).toContainText('Portfolio web');
  });

  test('page does not mix English and Spanish text', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('body')).toContainText('Web portfolio');
    await expect(page.locator('body')).not.toContainText('Portfolio web');

    await page.goto('/es');
    await expect(page.locator('body')).toContainText('Portfolio web');
    await expect(page.locator('body')).not.toContainText('Web portfolio');
  });
});
