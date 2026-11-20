import { expect, test } from '@playwright/test';

test.describe('i18n routing', () => {
  test.beforeEach(async ({ page, context }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await context.clearCookies();
  });

  test('loads a localized hash without a hydration mismatch', async ({ page }) => {
    const hydrationErrors: string[] = [];
    const collectHydrationError = (message: string) => {
      if (/hydration|hydrated|server rendered html/i.test(message)) {
        hydrationErrors.push(message);
      }
    };
    page.on('console', (message) => {
      if (message.type() === 'error') collectHydrationError(message.text());
    });
    page.on('pageerror', (error) => collectHydrationError(error.message));

    await page.goto('/en?source=portfolio#about');
    await expect(page.getByRole('button', { name: 'Español' })).toHaveAttribute(
      'href',
      '/es?source=portfolio#about',
    );
    expect(hydrationErrors).toEqual([]);
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
    await expect(page.locator('body')).toContainText('Full-stack developer');
  });

  test('visiting /es/ normalizes to /es and shows Spanish', async ({ page }) => {
    const response = await page.goto('/es/');
    expect(response?.status()).toBeLessThan(400);
    expect(page.url()).toContain('/es');
    await expect(page.locator('body')).toContainText('Desarrollador full-stack');
  });

  test('visiting /en directly shows English content', async ({ page }) => {
    const response = await page.goto('/en');
    expect(response?.status()).toBeLessThan(400);
    expect(page.url()).toContain('/en');
    await expect(page.locator('body')).toContainText('Full-stack developer');
  });

  test('visiting /es directly shows Spanish content', async ({ page }) => {
    const response = await page.goto('/es');
    expect(response?.status()).toBeLessThan(400);
    expect(page.url()).toContain('/es');
    await expect(page.locator('body')).toContainText('Desarrollador full-stack');
  });

  test('Spanish cookie is ignored when entering /en directly', async ({ page, context }) => {
    await context.addCookies([
      { name: 'psg_locale', value: 'es', url: 'http://127.0.0.1:3000' },
    ]);
    const response = await page.goto('/en');
    expect(response?.status()).toBeLessThan(400);
    expect(page.url()).toContain('/en');
    await expect(page.locator('body')).toContainText('Full-stack developer');
  });

  test('English cookie is ignored when entering /es directly', async ({ page, context }) => {
    await context.addCookies([
      { name: 'psg_locale', value: 'en', url: 'http://127.0.0.1:3000' },
    ]);
    const response = await page.goto('/es');
    expect(response?.status()).toBeLessThan(400);
    expect(page.url()).toContain('/es');
    await expect(page.locator('body')).toContainText('Desarrollador full-stack');
  });

  test('page does not mix English and Spanish text', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('body')).toContainText('Full-stack developer');
    await expect(page.locator('body')).not.toContainText('Desarrollador full-stack');

    await page.goto('/es');
    await expect(page.locator('body')).toContainText('Desarrollador full-stack');
    await expect(page.locator('body')).not.toContainText('Full-stack developer');
  });

  test('visiting /en/unknown shows 404 in English', async ({ page }) => {
    const response = await page.goto('/en/unknown');
    expect(response?.status()).toBe(404);
    expect(page.url()).toContain('/en/unknown');
    await expect(page.locator('body')).toContainText('Not found');
    await expect(page.locator('body')).toContainText('This page does not exist.');
  });

  test('visiting /es/unknown shows 404 in Spanish', async ({ page }) => {
    const response = await page.goto('/es/unknown');
    expect(response?.status()).toBe(404);
    expect(page.url()).toContain('/es/unknown');
    await expect(page.locator('body')).toContainText('No encontrado');
    await expect(page.locator('body')).toContainText('Esta página no existe.');
  });

  test('no redirect from inexistent route to home', async ({ page }) => {
    const response = await page.goto('/en/unknown');
    expect(response?.status()).toBe(404);
    expect(page.url()).toContain('/en/unknown');
    expect(page.url()).not.toBe('http://127.0.0.1:3000/en');
  });

  test('changing language from /es#contact preserves fragment', async ({ page }) => {
    await page.goto('/es#contact');
    await page.getByRole('button', { name: 'English' }).click();
    await expect(page).toHaveURL(/en#contact/);
    await expect(page.locator('body')).toContainText('Full-stack developer');
  });

  test('changing language from /en?utm_source=linkedin preserves query', async ({ page }) => {
    await page.goto('/en?utm_source=linkedin');
    await page.getByRole('button', { name: 'Español' }).click();
    await expect(page).toHaveURL(/es\?utm_source=linkedin/);
    await expect(page.locator('body')).toContainText('Desarrollador full-stack');
  });

  test('changing language does not mix English and Spanish', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('body')).toContainText('Full-stack developer');
    await page.getByRole('button', { name: 'Español' }).click();
    await expect(page.locator('body')).toContainText('Desarrollador full-stack');
    await expect(page.locator('body')).not.toContainText('Full-stack developer');
  });

  test('visiting /en/unknown shows 404 in English with LanguageSwitch visible', async ({ page }) => {
    const response = await page.goto('/en/unknown');
    expect(response?.status()).toBe(404);
    expect(page.url()).toContain('/en/unknown');
    await expect(page.locator('body')).toContainText('Not found');
    await expect(page.locator('body')).toContainText('This page does not exist.');
    await expect(page.getByRole('button', { name: 'Español' })).toBeVisible();
  });

  test('changing language from /en/unknown preserves path to Spanish', async ({ page }) => {
    const response = await page.goto('/en/unknown');
    expect(response?.status()).toBe(404);
    await page.getByRole('button', { name: 'Español' }).click();
    await expect(page).toHaveURL(/es\/unknown/);
    expect(page.url()).toContain('/es/unknown');
    expect(response?.status()).toBe(404);
    await expect(page.locator('body')).toContainText('No encontrado');
    await expect(page.locator('body')).toContainText('Esta página no existe.');
  });

  test('changing language from /es/unknown preserves path to English', async ({ page }) => {
    const response = await page.goto('/es/unknown');
    expect(response?.status()).toBe(404);
    await page.getByRole('button', { name: 'English' }).click();
    await expect(page).toHaveURL(/en\/unknown/);
    expect(page.url()).toContain('/en/unknown');
    await expect(page.locator('body')).toContainText('Not found');
    await expect(page.locator('body')).toContainText('This page does not exist.');
  });

  test('changing language from /en/unknown preserves query and fragment', async ({ page }) => {
    await page.goto('/en/unknown?utm_source=x#y');
    await page.getByRole('button', { name: 'Español' }).click();
    await expect(page).toHaveURL(/es\/unknown\?utm_source=x#y/);
    expect(page.url()).toContain('/es/unknown?utm_source=x#y');
  });

  test('cookies blocked / incognito falls back to English without blocking', async ({ page, context }) => {
    await context.clearCookies();
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(400);
    expect(page.url()).toContain('/en');
    await expect(page.locator('body')).toContainText('Full-stack developer');
  });

  test('served HTML of /en has exactly one <html> and one <body> with lang en', async ({ page }) => {
    const response = await page.goto('/en');
    expect(response, 'navigation should return a response').not.toBeNull();
    expect(response?.status()).toBeLessThan(400);

    const html = await response!.text();
    expect((html.match(/<html/g) || []).length).toBe(1);
    expect((html.match(/<body/g) || []).length).toBe(1);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('served HTML of /es has exactly one <html> and one <body> with lang es', async ({ page }) => {
    const response = await page.goto('/es');
    expect(response, 'navigation should return a response').not.toBeNull();
    expect(response?.status()).toBeLessThan(400);

    const html = await response!.text();
    expect((html.match(/<html/g) || []).length).toBe(1);
    expect((html.match(/<body/g) || []).length).toBe(1);
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  });

  test('normalization redirect preserves query string (/EN?utm_source=x -> /en?utm_source=x)', async ({ page }) => {
    const response = await page.goto('/EN?utm_source=x');
    expect(response?.status()).toBeLessThan(400);
    expect(page.url()).toContain('/en?utm_source=x');
    await expect(page.locator('body')).toContainText('Full-stack developer');
  });
});
