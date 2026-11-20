import { expect, test } from '@playwright/test';

const LOCALES: Array<{ locale: 'en' | 'es'; role: string }> = [
  { locale: 'en', role: 'Full-stack developer' },
  { locale: 'es', role: 'Desarrollador full-stack' },
];

const THEMES: Array<'light' | 'dark'> = ['light', 'dark'];

test.describe('Navbar navigation (RF-1, RF-2, RF-3, RF-4, RF-5, RF-6, RF-12, RF-13, RF-14)', () => {
  for (const { locale, role } of LOCALES) {
    for (const theme of THEMES) {
      test.describe(`/${locale} ${theme}`, () => {
        test.beforeEach(async ({ page }) => {
          await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: theme });
          await page.goto(`/${locale}`);
          await page.waitForLoadState('networkidle');
        });

        test('skip link is first focusable and moves focus to main', async ({
          page,
        }) => {
          const skip = page.getByRole('link', { name: /skip to content|saltar al contenido/i });
          await expect(skip).toBeVisible();
          await skip.focus();
          await skip.press('Enter');
          await expect(page.locator('main#main')).toBeFocused();
        });

        test('tab order: skip link first, identity second', async ({ page }) => {
          await page.keyboard.press('Tab');
          await expect(
            page.getByRole('link', { name: /skip to content|saltar al contenido/i })
          ).toBeFocused();

          await page.keyboard.press('Tab');
          await expect(page.getByRole('link', { name: 'Pedro Suárez Gallardo' })).toBeFocused();
        });

        test('identity goes to home and clears hash', async ({ page }) => {
          await page.goto(`/${locale}#work`);
          await page.waitForLoadState('networkidle');
          await expect(page).toHaveURL(/#work$/);

          await page.getByRole('link', { name: 'Pedro Suárez Gallardo' }).click();
          await expect(page.url()).toBe(`http://127.0.0.1:3000/${locale}`);
          await expect(page.locator('body')).toContainText(role);
        });

        test('four anchors show heading below navbar, update hash and focus heading', async ({
          page,
        }) => {
          const anchors =
            locale === 'en'
              ? [
                  { id: 'about', label: 'About' },
                  { id: 'work', label: 'Work' },
                  { id: 'stack', label: 'Stack' },
                  { id: 'contact', label: 'Contact' },
                ]
              : [
                  { id: 'about', label: 'Sobre mí' },
                  { id: 'work', label: 'Trabajo' },
                  { id: 'stack', label: 'Stack' },
                  { id: 'contact', label: 'Contacto' },
                ];

          for (const { id, label } of anchors) {
            await page.getByRole('link', { name: label }).click();
            await expect(page.url()).toBe(`http://127.0.0.1:3000/${locale}#${id}`);
            const heading = page.getByRole('heading', { level: 2, name: label });
            await expect(heading).toBeVisible();
            await expect(heading).toBeFocused();
          }
        });

        test('theme and language controls are in the navbar, no duplicates, theme announces state', async ({
          page,
        }) => {
          const themeBtn = page.getByRole('button', { name: /toggle theme|cambiar tema/i });
          const langBtn = page.getByRole('button', { name: /English|Español/ });

          await expect(themeBtn).toBeVisible();
          await expect(langBtn).toBeVisible();

          const themeButtons = page.getByRole('button', { name: /toggle theme|cambiar tema/i });
          const langButtons = page.getByRole('button', { name: /English|Español/ });
          await expect(themeButtons).toHaveCount(1);
          await expect(langButtons).toHaveCount(1);

          await expect(themeBtn).toHaveAttribute('aria-pressed');
        });

        test('changing language preserves anchor and destination', async ({ page }) => {
          await page.goto(`http://127.0.0.1:3000/${locale}#work`);
          await page.waitForLoadState('networkidle');
          await expect(page.url()).toContain('#work');

          const otherLang = locale === 'en' ? 'Español' : 'English';
          await page.getByRole('button', { name: otherLang }).click();
          await page.waitForURL(/#work$/);

          await expect(page.locator('body')).toContainText(
            locale === 'en' ? 'Desarrollador full-stack' : 'Full-stack developer'
          );
        });
      });
    }
  }
});

test.describe('Navbar visibility on scroll (RF-3, no reduced motion)', () => {
  for (const { locale } of LOCALES) {
    for (const theme of THEMES) {
      test.describe(`/${locale} ${theme}`, () => {
        test.beforeEach(async ({ page }) => {
          await page.emulateMedia({ colorScheme: theme });
          await page.setViewportSize({ width: 1440, height: 900 });
          await page.goto(`/${locale}`);
          await page.waitForLoadState('networkidle');
        });

        test('navbar is visible at the top', async ({ page }) => {
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.waitForTimeout(100);
          const navbar = page.locator('header');
          await expect(navbar).toBeVisible();
          const transform = await navbar.evaluate(
            (el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42,
          );
          expect(transform).toBe(0);
        });

        test('navbar hides after scrolling 80px down', async ({ page }) => {
          await page.evaluate(() => window.scrollTo(0, 500));
          await page.waitForTimeout(500);
          const navbar = page.locator('header');
          await expect(navbar).toHaveAttribute('data-hidden');
        });

        test('navbar shows again when scrolling up', async ({ page }) => {
          await page.evaluate(() => window.scrollTo(0, 500));
          await page.waitForTimeout(500);
          await page.evaluate(() => window.scrollTo(0, 40));
          await page.waitForTimeout(500);
          const navbar = page.locator('header');
          await expect(navbar).not.toHaveAttribute('data-hidden');
        });

        test('navbar shows when focusing a control while hidden', async ({ page }) => {
          await page.evaluate(() => window.scrollTo(0, 500));
          await page.waitForTimeout(500);
          await expect(page.locator('header')).toHaveAttribute('data-hidden');
          await page.keyboard.press('Tab');
          await page.waitForTimeout(100);
          await expect(page.locator('header')).not.toHaveAttribute('data-hidden');
        });
      });
    }
  }
});

test.describe('Navbar with reduced motion (RF-3, RF-12)', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/en');
    await page.waitForLoadState('networkidle');
  });

  test('navbar stays visible at all scroll positions', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 200));
    await page.waitForTimeout(300);
    const navbar = page.locator('header');
    const transform = await navbar.evaluate(
      (el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42,
    );
    expect(transform).toBe(0);
  });
});

test.describe('Mobile menu at 360px (RF-4)', () => {
  for (const { locale } of LOCALES) {
    test.describe(`/${locale}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' });
        await page.setViewportSize({ width: 360, height: 900 });
        await page.goto(`/${locale}`);
        await page.waitForLoadState('networkidle');
      });

      test('menu opens, shows links, closes with control and with link, keeps navbar visible, no duplicates', async ({
        page,
      }) => {

        // Open menu (click programmatically to avoid viewport issues at 360px)
        await page.evaluate(() => {
          const btn = document.querySelector('summary button') as HTMLElement;
          if (btn) btn.click();
        });
        await page.waitForTimeout(100);
        // Links are inside the mobile <details> panel; use details a to avoid desktop duplicates
        await expect(page.locator('details a').filter({ hasText: locale === 'en' ? 'About' : 'Sobre mí' })).toBeVisible();
        await expect(page.locator('details a').filter({ hasText: locale === 'en' ? 'Work' : 'Trabajo' })).toBeVisible();
        await expect(page.locator('details a').filter({ hasText: 'Stack' })).toBeVisible();
        await expect(page.locator('details a').filter({ hasText: locale === 'en' ? 'Contact' : 'Contacto' })).toBeVisible();

        // Close with control
        await page.evaluate(() => {
          const btn = document.querySelector('summary button') as HTMLElement;
          if (btn) btn.click();
        });
        await page.waitForTimeout(100);
        await expect(page.locator('details a').filter({ hasText: locale === 'en' ? 'About' : 'Sobre mí' })).not.toBeVisible();

        // Open again and close with link
        await page.evaluate(() => {
          const btn = document.querySelector('summary button') as HTMLElement;
          if (btn) btn.click();
        });
        await page.waitForTimeout(100);
        await page.locator('details a').filter({ hasText: locale === 'en' ? 'About' : 'Sobre mí' }).click();
        await page.waitForTimeout(100);
        await expect(page.locator('details')).not.toHaveAttribute('open');

        // Navbar stays visible on scroll
        await page.evaluate(() => window.scrollTo(0, 200));
        await page.waitForTimeout(300);
        const navbar = page.locator('header');
        await expect(navbar).not.toHaveAttribute('data-hidden');
      });
    });
  }
});

test.describe('404 localized routes (RF-14)', () => {
  for (const { locale } of LOCALES) {
    test.describe(`/${locale}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' });
        await page.goto(`/${locale}/ruta-inexistente`);
        await page.waitForLoadState('networkidle');
      });

      test('shows navbar and footer with links to home + anchor', async ({ page }) => {
        await expect(page.locator('header')).toBeVisible();
        await expect(page.locator('footer')).toBeVisible();
        await expect(page.getByRole('link', { name: 'Pedro Suárez Gallardo' })).toBeVisible();
        await expect(page.getByRole('link', { name: locale === 'en' ? 'About' : 'Sobre mí' })).toHaveAttribute(
          'href',
          `/${locale}#about`,
        );
        await expect(page.locator('body')).toContainText(
          locale === 'en' ? 'Not found' : 'No encontrado',
        );
      });
    });
  }
});

test.describe('No JavaScript (RF-12, RF-14)', () => {
  test('navbar always visible, menu works, theme control absent, skip and anchors work', async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    try {
      await page.setViewportSize({ width: 360, height: 900 });
      await page.goto('/en');
      await page.waitForLoadState('networkidle');

      // Navbar always visible
      await expect(page.locator('header')).toBeVisible();

      // Skip link works
      const skip = page.getByRole('link', { name: /skip to content/i });
      await expect(skip).toBeVisible();
      await skip.click();
      await expect(page.locator('main#main')).toBeFocused();

      // Theme control does not appear
      await expect(page.getByRole('button', { name: /toggle theme/i })).not.toBeVisible();

      // Anchors work
      await page.getByRole('link', { name: 'Work' }).click();
      await expect(page.url()).toContain('#work');

      // Menu opens and closes with control (native details)
      await page.evaluate(() => {
        const summary = document.querySelector('summary') as HTMLElement;
        if (summary) summary.click();
      });
      await page.waitForTimeout(100);
      await expect(page.locator('details')).toHaveAttribute('open');
      await expect(page.locator('details a').filter({ hasText: 'About' })).toBeVisible();
      await page.evaluate(() => {
        const summary = document.querySelector('summary') as HTMLElement;
        if (summary) summary.click();
      });
      await page.waitForTimeout(100);
      await expect(page.locator('details')).not.toHaveAttribute('open');
    } finally {
      await context.close();
    }
  });
});

