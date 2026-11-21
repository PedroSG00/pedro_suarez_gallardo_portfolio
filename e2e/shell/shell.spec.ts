import { expect, test } from '@playwright/test';

test.describe('shell', () => {
  test.beforeEach(async ({ page, context }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await context.clearCookies();
  });

  test('/en renders shell: banner, main, contentinfo, one language control', async ({
    page,
  }) => {
    const response = await page.goto('/en');
    expect(response?.status()).toBeLessThan(400);

    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();

    const skipLink = page.getByRole('link', { name: 'Skip to content' });
    await expect(skipLink).toBeVisible();
    await expect(skipLink).toHaveAttribute('href', '#main');

    const languageControls = page.getByRole('button', {
      name: /English|Español/,
    });
    await expect(languageControls).toHaveCount(1);

    const mains = page.locator('main');
    await expect(mains).toHaveCount(1);
    const banners = page.getByRole('banner');
    await expect(banners).toHaveCount(1);
  });

  test('/es renders shell: banner, main, contentinfo, one language control', async ({
    page,
  }) => {
    const response = await page.goto('/es');
    expect(response?.status()).toBeLessThan(400);

    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();

    const skipLink = page.getByRole('link', { name: 'Saltar al contenido' });
    await expect(skipLink).toBeVisible();
    await expect(skipLink).toHaveAttribute('href', '#main');

    const languageControls = page.getByRole('button', {
      name: /English|Español/,
    });
    await expect(languageControls).toHaveCount(1);

    const mains = page.locator('main');
    await expect(mains).toHaveCount(1);
    const banners = page.getByRole('banner');
    await expect(banners).toHaveCount(1);
  });

  test('uses the white brand mark as the browser icon', async ({ page }) => {
    await page.goto('/en');
    const iconHref = await page.locator('head link[rel="icon"]').first().getAttribute('href');
    expect(iconHref).toMatch(/icon\.svg/);

    const response = await page.request.get(new URL(iconHref!, page.url()).toString());
    expect(response.ok()).toBe(true);
    expect(await response.text()).toContain('#ffffff');
  });

  test('footer destinations show their matching icons', async ({ page }) => {
    await page.goto('/en');
    const footer = page.getByRole('contentinfo');
    for (const name of [
      'GitHub opens in a new tab',
      'LinkedIn opens in a new tab',
      'Email',
      'CV opens in a new tab',
    ]) {
      const link = footer.getByRole('link', { name });
      await expect(link.locator('svg[aria-hidden="true"]')).toBeVisible();
    }
  });

  test('footer is not sticky and both shell bars are omitted in print', async ({ page }) => {
    await page.goto('/en');
    const footer = page.getByRole('contentinfo');
    await expect(footer).toHaveCSS('position', 'static');

    await page.emulateMedia({ media: 'print' });
    await expect(page.getByRole('banner')).toBeHidden();
    await expect(footer).toBeHidden();
    await expect(page.getByRole('heading', { level: 1, name: 'Pedro Suárez Gallardo' })).toHaveCSS(
      'animation',
      'none',
    );
  });

  test('skip link is the first focusable element and moves focus to #main', async ({
    page,
  }) => {
    await page.goto('/en');

    const skipLink = page.getByRole('link', { name: 'Skip to content' });
    await expect(skipLink).toBeVisible();

    const focusables = page.locator(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    await expect(focusables.first()).toHaveAttribute('href', '#main');

    await skipLink.dispatchEvent('click');

    const main = page.getByRole('main');
    await expect(main).toBeFocused();
  });

  test('localized 404 keeps banner and footer (/en/ruta-inexistente)', async ({
    page,
  }) => {
    const response = await page.goto('/en/ruta-inexistente');
    expect(response?.status()).toBe(404);

    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();

    const skipLink = page.getByRole('link', { name: 'Skip to content' });
    await expect(skipLink).toBeVisible();
    await expect(skipLink).toHaveAttribute('href', '#main');

    const languageControls = page.getByRole('button', {
      name: /English|Español/,
    });
    await expect(languageControls).toHaveCount(1);

    const mains = page.locator('main');
    await expect(mains).toHaveCount(1);
    const banners = page.getByRole('banner');
    await expect(banners).toHaveCount(1);
  });

  test('localized 404 keeps banner and footer in Spanish (/es/ruta-inexistente)', async ({
    page,
  }) => {
    const response = await page.goto('/es/ruta-inexistente');
    expect(response?.status()).toBe(404);

    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();

    const skipLink = page.getByRole('link', { name: 'Saltar al contenido' });
    await expect(skipLink).toBeVisible();

    const languageControls = page.getByRole('button', {
      name: /English|Español/,
    });
    await expect(languageControls).toHaveCount(1);

    const mains = page.locator('main');
    await expect(mains).toHaveCount(1);
    const banners = page.getByRole('banner');
    await expect(banners).toHaveCount(1);
  });

  test('/fr remains the naked proxy 404 without localized shell', async ({
    page,
  }) => {
    const response = await page.goto('/fr');
    expect(response?.status()).toBe(404);

    await expect(page.getByRole('banner')).toHaveCount(0);
    await expect(page.getByRole('main')).toHaveCount(0);
    await expect(page.getByRole('contentinfo')).toHaveCount(0);
    await expect(page.locator('body')).toContainText('Not found');
  });
});
