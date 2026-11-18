import { expect, test } from '@playwright/test';

test.describe('theme first paint', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('HTML de /en trae <script> de tema en <head> sin data-theme en el servidor', async ({ page }) => {
    const response = await page.goto('/en');
    expect(response, 'navigation should return a response').not.toBeNull();
    expect(response?.status()).toBeLessThan(400);

    const serverHtml = await response?.text();
    expect(serverHtml).not.toContain('data-theme');
    expect(serverHtml).toContain('(function(w,d,ls){');

    const inlineScripts = page.locator('head > script:not([src])');
    await expect(inlineScripts).toHaveCount(1);
    const content = await inlineScripts.first().textContent();
    expect(content).toContain('psg-theme');
    expect(content).toContain('dataset.theme');
  });

  test('HTML de /es trae <script> de tema en <head> sin data-theme en el servidor', async ({ page }) => {
    const response = await page.goto('/es');
    expect(response, 'navigation should return a response').not.toBeNull();
    expect(response?.status()).toBeLessThan(400);

    const serverHtml = await response?.text();
    expect(serverHtml).not.toContain('data-theme');
    expect(serverHtml).toContain('(function(w,d,ls){');

    const inlineScripts = page.locator('head > script:not([src])');
    await expect(inlineScripts).toHaveCount(1);
    const content = await inlineScripts.first().textContent();
    expect(content).toContain('psg-theme');
    expect(content).toContain('dataset.theme');
  });

  test('<html> lleva la clase de la fuente mono y lang correcto, sin peticiones a Google Fonts', async ({ page }) => {
    let googleFontRequests = 0;
    page.on('request', (request) => {
      if (
        request.url().includes('fonts.googleapis.com') ||
        request.url().includes('fonts.gstatic.com')
      ) {
        googleFontRequests += 1;
      }
    });

    const response = await page.goto('/en');
    expect(response?.status()).toBeLessThan(400);
    expect(googleFontRequests).toBe(0);

    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'en');
    const className = await html.getAttribute('class');
    expect(className).toBeTruthy();

    const fontVar = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--font-geist-mono')
        .trim()
    );
    expect(fontVar).not.toBe('');
  });

  test('sin prefers-reduced-motion ni elección sembrada, carga /en sin errores de hidratación', async ({ page }) => {
    const pageErrors: string[] = [];
    const hydrateConsoleErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('hydrat')) {
        hydrateConsoleErrors.push(msg.text());
      }
    });

    const response = await page.goto('/en');
    expect(response?.status()).toBeLessThan(400);
    expect(pageErrors).toEqual([]);
    expect(hydrateConsoleErrors).toEqual([]);
  });
});
