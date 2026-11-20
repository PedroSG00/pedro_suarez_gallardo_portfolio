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
          const identity = page.getByRole('link', { name: 'Pedro Suárez Gallardo' });
          const logo = identity.getByRole('img', { name: 'Pedro Suárez Gallardo' });
          await expect(logo).toHaveAttribute('src', '/logo.svg');
          await expect(logo).toHaveCSS('filter', theme === 'dark' ? 'invert(1)' : 'none');
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
          for (const control of [themeBtn, langBtn]) {
            const box = await control.boundingBox();
            expect(box?.width).toBeGreaterThanOrEqual(24);
            expect(box?.height).toBeGreaterThanOrEqual(24);
          }
        });

        test('changing language preserves anchor and destination', async ({ page }) => {
          await page.goto(`http://127.0.0.1:3000/${locale}#work`);
          await page.waitForLoadState('networkidle');
          await expect(page.url()).toContain('#work');

          const otherLang = locale === 'en' ? 'Español' : 'English';
          const label = locale === 'en' ? 'Work' : 'Trabajo';
          const nextLabel = locale === 'en' ? 'Trabajo' : 'Work';
          const previousHeadingTop = await page
            .getByRole('heading', { level: 2, name: label })
            .evaluate((heading) => heading.getBoundingClientRect().top);
          const switchBox = await page.getByRole('button', { name: otherLang }).boundingBox();
          await page.mouse.click(
            switchBox!.x + switchBox!.width / 2,
            switchBox!.y + switchBox!.height / 2,
          );
          await page.waitForURL(/#work$/);

          await expect
            .poll(async () =>
              Math.abs(
                (await page
                  .getByRole('heading', { level: 2, name: nextLabel })
                  .evaluate((heading) => heading.getBoundingClientRect().top)) -
                  previousHeadingTop,
              ),
            )
            .toBeLessThan(1);
          await expect(page.getByRole('heading', { level: 2, name: nextLabel })).toBeVisible();
          await expect(page.locator('body')).toContainText(
            locale === 'en' ? 'Desarrollador full-stack' : 'Full-stack developer'
          );
        });
      });
    }
  }
});

test.describe('Scroll behavior on reload and navigation', () => {
  test('reload restores the same scroll position without a second jump', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/en');
    await page.evaluate(() => window.scrollTo({ top: 320, behavior: 'instant' }));
    const beforeReload = await page.evaluate(() => window.scrollY);

    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(beforeReload);
    await page.waitForTimeout(150);
    expect(await page.evaluate(() => window.scrollY)).toBe(beforeReload);
  });

  test('changing language preserves the current scroll position', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/en');
    await page.evaluate(() => window.scrollTo({ top: 320, behavior: 'instant' }));
    const beforeSwitch = await page.evaluate(() => window.scrollY);

    const switchBox = await page.getByRole('button', { name: 'Español' }).boundingBox();
    await page.mouse.click(
      switchBox!.x + switchBox!.width / 2,
      switchBox!.y + switchBox!.height / 2,
    );
    await page.waitForURL('/es');
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(beforeSwitch);
  });

  test('anchor navigation keeps the navbar visible; only a later user scroll can hide it', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/en');
    const navbar = page.getByRole('banner');

    await page.getByRole('link', { name: 'Work' }).click();
    await expect(page).toHaveURL(/#work$/);
    await expect(navbar).not.toHaveAttribute('data-hidden');

    await page.mouse.wheel(0, 200);
    await expect(navbar).toHaveAttribute('data-hidden');
  });

  test('uses native smooth scrolling only when reduced motion is not requested', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/en');
    await expect(page.locator('html')).toHaveCSS('scroll-behavior', 'smooth');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('html')).toHaveCSS('scroll-behavior', 'auto');
  });

  test('keeps the navbar hidden at the document end until the user scrolls up', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/en');
    const navbar = page.getByRole('banner');

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(80);
    await expect(navbar).toHaveAttribute('data-hidden');

    await page.mouse.wheel(0, -160);
    await expect(navbar).not.toHaveAttribute('data-hidden');

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect(navbar).toHaveAttribute('data-hidden');
    await navbar.getByRole('link', { name: 'Pedro Suárez Gallardo' }).focus();
    await expect(navbar).not.toHaveAttribute('data-hidden');
  });
});

test.describe('Mobile navigation controls', () => {
  test('the larger logo and hamburger follow the theme and language controls', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/en');

    const banner = page.getByRole('banner');
    const logo = banner.getByRole('img', { name: 'Pedro Suárez Gallardo' });
    const theme = banner.getByRole('button', { name: /toggle theme|cambiar tema/i });
    const language = banner.getByRole('button', { name: 'Español' });
    const menu = banner.getByRole('button', { name: 'Open menu' });
    await expect(logo).toHaveCSS('width', '40px');

    for (const control of [theme, language, menu]) {
      const box = await control.boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(24);
      expect(box?.height).toBeGreaterThanOrEqual(24);
    }

    const order = await page.evaluate(([theme, language, menu]) => {
      const follows = (left: Element, right: Element) =>
        Boolean(left.compareDocumentPosition(right) & Node.DOCUMENT_POSITION_FOLLOWING);
      return follows(theme, language) && follows(language, menu);
    }, [await theme.elementHandle(), await language.elementHandle(), await menu.elementHandle()]);
    expect(order).toBe(true);
  });

  test('animates the menu when it opens and respects reduced motion', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/en');
    await page.getByRole('button', { name: 'Open menu' }).click();
    const panel = page.getByRole('navigation', { name: 'Main' });
    await expect(panel).toBeVisible();
    await expect.poll(() => panel.evaluate((element) => element.getAnimations().length)).toBeGreaterThan(0);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect.poll(() => panel.evaluate((element) => element.getAnimations().length)).toBe(0);
  });
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
          await expect(navbar).toHaveCSS('transition-duration', '0.2s');
          const transform = await navbar.evaluate(
            (el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42,
          );
          expect(transform).toBe(0);
        });

        test('navbar hides after scrolling 80px down', async ({ page }) => {
          await page.evaluate(() => window.scrollTo(0, 500));
          await page.waitForTimeout(500);
          const navbar = page.locator('header');
          await expect.poll(() => navbar.evaluate((element) => element.getBoundingClientRect().bottom)).toBeLessThanOrEqual(1);
          await expect(navbar).toHaveCSS('opacity', '1');
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
          await expect(page.getByRole('link', { name: /skip to content|saltar al contenido/i })).toBeFocused();
          await page.keyboard.press('Tab');
          await expect(page.getByRole('link', { name: 'Pedro Suárez Gallardo' })).toBeFocused();
          await expect.poll(() => page.locator('header').evaluate((element) => element.getBoundingClientRect().top)).toBeGreaterThanOrEqual(-1);
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

      test('menu responds to real clicks and replaces the desktop links below 768px', async ({
        page,
      }) => {
        const navbar = page.getByRole('banner');
        const open = navbar.getByRole('button', { name: /open menu|abrir menú/i });
        const close = navbar.getByRole('button', { name: /close menu|cerrar menú/i });
        const links = navbar.getByRole('link').filter({ hasText: /^(About|Sobre mí|Work|Trabajo|Stack|Contact|Contacto)$/ });
        await expect(links).toHaveCount(0);
        await open.click();
        await expect(close).toBeVisible();
        await expect(links).toHaveCount(4);
        await close.press('Space');
        await expect(links).toHaveCount(0);
        await open.click();
        await links.first().click();
        await expect(page).toHaveURL(/#about$/);
        await expect(open).toBeVisible();
        await expect(links).toHaveCount(0);

        await open.click();
        await page.setViewportSize({ width: 768, height: 900 });
        await expect(links).toHaveCount(4);
        await expect(close).toHaveCount(0);
        const boxes = await Promise.all((await links.all()).map((link) => link.boundingBox()));
        expect(boxes.every((box) => box && box.y === boxes[0]?.y)).toBe(true);
        await page.setViewportSize({ width: 360, height: 900 });
        await expect(open).toBeVisible();
        await expect(links).toHaveCount(0);
      });
    });
  }

  test('scrolling the open panel does not move the page or close the menu', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 360, height: 240 });
    await page.goto('/en');
    await page.getByRole('button', { name: 'Open menu' }).click();

    const panel = page.locator('[data-menu-panel]');
    const scrollMetrics = await panel.evaluate((element) => ({
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
    }));
    expect(scrollMetrics.scrollHeight).toBeGreaterThan(scrollMetrics.clientHeight);

    const pageScrollBefore = await page.evaluate(() => window.scrollY);
    await panel.hover();
    await page.mouse.wheel(0, 160);
    await expect.poll(() => panel.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
    expect(await page.evaluate(() => window.scrollY)).toBe(pageScrollBefore);
    await expect(page.locator('[data-navbar-menu]')).toHaveAttribute('open', '');
  });
});

test.describe('Keyboard focus visibility (RF-5, RF-12)', () => {
  for (const { locale } of LOCALES) {
    for (const theme of THEMES) {
      test(`every tab stop has a visible focus outline on /${locale} in ${theme} mode`, async ({
        page,
      }) => {
        await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: theme });
        await page.setViewportSize({ width: 1280, height: 900 });
        await page.goto(`/${locale}`);
        await page.waitForLoadState('networkidle');

        const focusableCount = await page
          .locator('a[href], button:not([disabled]), summary')
          .evaluateAll((elements) =>
            elements.filter((element) => element.getClientRects().length > 0).length,
          );

        for (let index = 0; index < focusableCount; index += 1) {
          await page.keyboard.press('Tab');
          const focusStyle = await page.evaluate(() => {
            const active = document.activeElement;
            const style = active ? getComputedStyle(active) : null;
            return {
              outlineStyle: style?.outlineStyle,
              outlineWidth: Number.parseFloat(style?.outlineWidth ?? '0'),
            };
          });
          expect(focusStyle.outlineStyle, `Tab stop ${index + 1} should show an outline`).toBe(
            'solid',
          );
          expect(focusStyle.outlineWidth, `Tab stop ${index + 1} should have a visible outline`).toBeGreaterThan(0);
        }
      });
    }
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

      test('activating a section link returns to the localized home and anchor', async ({
        page,
      }) => {
        const aboutLabel = locale === 'en' ? 'About' : 'Sobre mí';
        await page.getByRole('banner').getByRole('link', { name: aboutLabel }).click();
        await expect(page).toHaveURL(`/${locale}#about`);
        await expect(page.getByRole('heading', { level: 2, name: aboutLabel })).toBeFocused();
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
      await expect(page.getByRole('contentinfo')).toBeVisible();
      await expect(page.locator('footer')).toContainText('© 2026 Pedro Suárez Gallardo');

      // Skip link works
      const skip = page.getByRole('link', { name: /skip to content/i });
      await page.keyboard.press('Tab');
      await expect(skip).toBeFocused();
      await skip.press('Enter');
      await expect(page.locator('main#main')).toBeFocused();

      // Theme control does not appear
      await expect(page.getByRole('button', { name: /toggle theme/i })).not.toBeVisible();

      // Anchors work
      const menu = page.getByRole('button', { name: 'Open menu' });
      await menu.press('Enter');
      const work = page.getByRole('link', { name: 'Work' });
      await work.click();
      await expect(page).toHaveURL(/#work$/);
      await expect(work).toBeVisible();
      await menu.press('Space');
      await expect(work).toHaveCount(0);
    } finally {
      await context.close();
    }
  });

  test('language switch remains a working native link without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    try {
      await page.goto('/en');
      await page.getByRole('button', { name: 'Español' }).click();
      await expect(page).toHaveURL('/es');
      await expect(page.locator('html')).toHaveAttribute('lang', 'es');
      await expect(page.locator('body')).toContainText('Desarrollador full-stack');
    } finally {
      await context.close();
    }
  });

  test('keyboard focus can leave the open mobile menu without being trapped', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 360, height: 900 });
    await page.goto('/en');

    const menu = page.getByRole('button', { name: 'Open menu' });
    await menu.focus();
    await menu.press('Enter');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'About' })).toBeFocused();

    for (const name of ['Work', 'Stack', 'Contact']) {
      await page.keyboard.press('Tab');
      await expect(page.getByRole('link', { name })).toBeFocused();
    }

    await page.keyboard.press('Tab');
    expect(
      await page.evaluate(() => document.activeElement?.closest('header') === null),
    ).toBe(true);
  });
});
