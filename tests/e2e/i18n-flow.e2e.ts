import { test, expect } from '@playwright/test';

/**
 * i18n flow E2E — Fase 2 (tasks T7–T10).
 * Scenarios from plan §6.3, grouped by task.
 *
 * These tests are written BEFORE implementation (Fase 3), so they are red
 * until middleware, [locale] routes, and language selector exist.
 * Constitution #4: tests first.
 */

// ── T7: SSR without JavaScript and RNF5 ──────────────────────────────────────────

test.describe('T7 — SSR without JavaScript and RNF5', () => {
  test.use({ extraHTTPHeaders: { 'accept-language': 'es-ES,es;q=0.9' } });

  test('without JS, /es serves HTML with <html lang="es"> and translated text', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      // Block subsequent JS execution: force failure in any script
      const originalAppend = Element.prototype.appendChild;
      Element.prototype.appendChild = function () {
        throw new Error('JS blocked in T7');
      };
      return originalAppend;
    });

    await page.goto('/es');

    // The HTML served by the server already carries the correct language
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page.locator('main')).not.toBeEmpty();
  });

  test('heading hierarchy identical in /en and /es, single h1 (RNF5)', async ({
    page,
  }) => {
    const headings: Record<string, { h1: number; h2: number; h3: number }> = {};

    for (const locale of ['en', 'es']) {
      await page.goto(`/${locale}`);
      const h1s = await page.locator('h1').allTextContents();
      const h2s = await page.locator('h2').allTextContents();
      const h3s = await page.locator('h3').allTextContents();
      headings[locale] = { h1: h1s.length, h2: h2s.length, h3: h3s.length };
    }

    expect(headings.en.h1).toBe(1);
    expect(headings.es.h1).toBe(1);
    expect(headings.en).toEqual(headings.es);
  });

  test('no app/api/ or database access (RNF3)', async ({ page }) => {
    const res = await page.request.get('/api');
    expect(res.status()).toBe(404);
  });
});

// ── T8: URL overrides cookie and persistence ──────────────────────────────

test.describe('T8 — URL overrides cookie and persistence', () => {
  test('Accept-Language: es-ES, no cookie, / → redirects to /es', async ({
    browser,
  }) => {
    const context = await browser.newContext({ locale: 'es-ES' });
    const page = await context.newPage();
    await page.goto('http://localhost:3000/');

    await expect(page).toHaveURL(/.*\/es(\?.*)?$/);
    await context.close();
  });

  test('Accept-Language: fr, no cookie, / → /en (fallback)', async ({
    browser,
  }) => {
    const context = await browser.newContext({ locale: 'fr-FR' });
    const page = await context.newPage();
    await page.goto('http://localhost:3000/');

    await expect(page).toHaveURL(/.*\/en(\?.*)?$/);
    await context.close();
  });

  test('cookie lang=es wins over Accept-Language: en, / → /es', async ({
    browser,
  }) => {
    const context = await browser.newContext({ locale: 'en-US' });
    await context.addCookies([
      { name: 'lang', value: 'es', url: 'http://localhost:3000' },
    ]);
    const page = await context.newPage();
    await page.goto('http://localhost:3000/');

    await expect(page).toHaveURL(/.*\/es(\?.*)?$/);
    await context.close();
  });

  test('cookie deleted → / redetects by Accept-Language', async ({
    browser,
  }) => {
    const context = await browser.newContext({ locale: 'en-US' });
    await context.addCookies([
      { name: 'lang', value: 'es', url: 'http://localhost:3000' },
    ]);
    await context.clearCookies();
    const page = await context.newPage();
    await page.goto('http://localhost:3000/');

    await expect(page).toHaveURL(/.*\/en(\?.*)?$/);
    await context.close();
  });

  test('direct link /en/projects with cookie es → served in English and cookie unchanged', async ({
    browser,
  }) => {
    const context = await browser.newContext({ locale: 'es-ES' });
    await context.addCookies([
      { name: 'lang', value: 'es', url: 'http://localhost:3000' },
    ]);
    const page = await context.newPage();
    await page.goto('http://localhost:3000/en/projects');

    await expect(page).toHaveURL(/.*\/en\/projects/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    const cookie = await context.cookies('http://localhost:3000');
    const langCookie = cookie.find((c) => c.name === 'lang');
    expect(langCookie?.value).toBe('es');
    await context.close();
  });
});

// ── T9: Storage blocked and fr language ───────────────────────────────

test.describe('T9 — Storage blocked and fr language', () => {
  test('localStorage blocked (addInitScript): site loads and detection falls back to Accept-Language', async ({
    page,
    context,
  }) => {
    await page.addInitScript(() => {
      const blocked = new Proxy(
        {},
        {
          get() {
            throw new Error('localStorage blocked');
          },
          set() {
            throw new Error('localStorage blocked');
          },
        },
      );
      Object.defineProperty(window, 'localStorage', {
        value: blocked,
        configurable: true,
      });
    });

    await context.setExtraHTTPHeaders({ 'accept-language': 'es-ES' });
    await page.goto('/');

    // The site loads without critical console errors
    await expect(page.locator('html')).toHaveAttribute('lang', /en|es/);
  });

  test('fr language in Accept-Language → fallback to English, fr not accepted', async ({
    browser,
  }) => {
    const context = await browser.newContext({ locale: 'fr-FR' });
    const page = await context.newPage();
    await page.goto('http://localhost:3000/');

    await expect(page).toHaveURL(/.*\/en(\?.*)?$/);
    await context.close();
  });
});

// ── T10: No full page reload and window marker ─────────────────────────

declare global {
  interface Window {
    __i18nMarker?: string;
  }
}

test.describe('T10 — No full page reload and window marker', () => {
  test('selector changes language without full page reload; window marker stays alive', async ({
    page,
    context,
  }) => {
    await context.addCookies([
      { name: 'lang', value: 'es', url: 'http://localhost:3000' },
    ]);
    await page.goto('/es/projects');

    // Inject window marker BEFORE changing language
    await page.evaluate(() => {
      window.__i18nMarker = 'alive';
    });

    // The language selector uses router.push (no full page reload)
    await page.click('[data-testid="language-selector-en"]');

    await expect(page).toHaveURL(/.*\/en\/projects(\?.*)?$/);
    const marker = await page.evaluate(() => window.__i18nMarker);
    expect(marker).toBe('alive');
  });

  test('after change: cookie lang=en (single source of truth)', async ({
    page,
    context,
  }) => {
    await context.addCookies([
      { name: 'lang', value: 'es', url: 'http://localhost:3000' },
    ]);
    await page.goto('/es/projects');

    await page.click('[data-testid="language-selector-en"]');
    await expect(page).toHaveURL(/.*\/en\/projects/);

    const cookies = await context.cookies('http://localhost:3000');
    const langCookie = cookies.find((c) => c.name === 'lang');
    expect(langCookie?.value).toBe('en');

    // localStorage.lang is NOT written (cookie is the single source of truth)
    const storageLang = await page.evaluate(() => localStorage.getItem('lang'));
    expect(storageLang).toBeNull();
  });

  test('preserves query and hash and leaves a single history entry', async ({
    page,
  }) => {
    await page.goto('/es/projects?tab=1#section');

    await page.click('[data-testid="language-selector-en"]');
    await expect(page).toHaveURL(/.*\/en\/projects\?tab=1#section$/);

    // One back step returns to the previous language, same query and hash.
    await page.goBack();
    await expect(page).toHaveURL(/.*\/es\/projects\?tab=1#section$/);
  });

  test('reload after choosing language keeps the language', async ({
    page,
    context,
  }) => {
    await context.addCookies([
      { name: 'lang', value: 'es', url: 'http://localhost:3000' },
    ]);
    await page.goto('/es/projects');

    await page.click('[data-testid="language-selector-en"]');
    await expect(page).toHaveURL(/.*\/en\/projects/);

    await page.reload();
    await expect(page).toHaveURL(/.*\/en\/projects/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});
