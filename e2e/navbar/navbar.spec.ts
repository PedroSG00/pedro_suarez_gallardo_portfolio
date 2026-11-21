import { expect, test, type Locator, type Page } from '@playwright/test';

const LOCALES: Array<{ locale: 'en' | 'es'; role: string }> = [
  { locale: 'en', role: 'Full-stack developer' },
  { locale: 'es', role: 'Desarrollador full-stack' },
];

const THEMES: Array<'light' | 'dark'> = ['light', 'dark'];

const SKIP_LINK = /skip to content|saltar al contenido/i;
const IDENTITY = 'Pedro Suárez Gallardo';

/** Resolves once the window scroll position is identical across two polls. */
async function waitForScrollSettled(page: Page): Promise<void> {
  let previous = Number.NaN;
  await expect
    .poll(
      async () => {
        const current = await page.evaluate(() => window.scrollY);
        const settled = current === previous;
        previous = current;
        return settled;
      },
      { intervals: [100] },
    )
    .toBe(true);
}

/**
 * Clicks the center of a control with a raw pointer, after its box stops
 * moving. Needed for sticky controls that Playwright would otherwise scroll.
 */
async function clickCenter(page: Page, target: Locator): Promise<void> {
  let previous = '';
  await expect
    .poll(
      async () => {
        const key = JSON.stringify(await target.boundingBox());
        const settled = key === previous && key !== 'null';
        previous = key;
        return settled;
      },
      { intervals: [50, 100] },
    )
    .toBe(true);
  const box = (await target.boundingBox())!;
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

test.describe('Navbar navigation (RF-1, RF-2, RF-3, RF-4, RF-5, RF-6, RF-12, RF-13, RF-14)', () => {
  for (const { locale, role } of LOCALES) {
    for (const theme of THEMES) {
      test.describe(`/${locale} ${theme}`, () => {
        test.beforeEach(async ({ page }) => {
          await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: theme });
          await page.goto(`/${locale}`);
          await page.waitForLoadState('networkidle');
        });

        test('tabs through skip link and identity, then skips navigation to main', async ({ page }) => {
          const skip = page.getByRole('link', { name: SKIP_LINK });
          await expect(skip).toBeVisible();
          await page.keyboard.press('Tab');
          await expect(skip).toBeFocused();
          await page.keyboard.press('Tab');
          await expect(page.getByRole('link', { name: IDENTITY })).toBeFocused();
          await page.keyboard.press('Shift+Tab');
          await expect(skip).toBeFocused();
          await skip.press('Enter');
          await expect(page.locator('main#main')).toBeFocused();
        });

        test('identity goes to home and clears hash', async ({ baseURL, page }) => {
          const identity = page.getByRole('link', { name: IDENTITY });
          const logo = identity.getByRole('img', { name: IDENTITY });
          await expect(logo).toHaveAttribute('src', '/logo.svg');
          await expect(logo).toHaveCSS('filter', theme === 'dark' ? 'invert(1)' : 'none');
          await page.goto(`/${locale}#work`);
          await page.waitForLoadState('networkidle');
          await expect(page).toHaveURL(/#work$/);

          await page.getByRole('link', { name: IDENTITY }).click();
          await expect(page).toHaveURL(new URL(`/${locale}`, baseURL).toString());
          await expect(page.locator('body')).toContainText(role);
        });

        test('four anchors show heading below navbar, update hash and focus heading', async ({
          baseURL,
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
            await expect(page).toHaveURL(new URL(`/${locale}#${id}`, baseURL).toString());
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
          await expect(themeBtn).toHaveCount(1);
          await expect(langBtn).toHaveCount(1);

          await expect(themeBtn).toHaveAttribute('aria-pressed');
          for (const control of [themeBtn, langBtn]) {
            const box = await control.boundingBox();
            expect(box?.width).toBeGreaterThanOrEqual(24);
            expect(box?.height).toBeGreaterThanOrEqual(24);
          }
        });

        test('changing language preserves anchor and destination', async ({ baseURL, page }) => {
          await page.goto(new URL(`/${locale}#work`, baseURL).toString());
          await page.waitForLoadState('networkidle');
          await expect(page).toHaveURL(/#work$/);

          const otherLang = locale === 'en' ? 'Español' : 'English';
          const label = locale === 'en' ? 'Work' : 'Trabajo';
          const nextLabel = locale === 'en' ? 'Trabajo' : 'Work';
          const previousHeadingTop = await page
            .getByRole('heading', { level: 2, name: label })
            .evaluate((heading) => heading.getBoundingClientRect().top);

          await clickCenter(page, page.getByRole('button', { name: otherLang }));
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
            locale === 'en' ? 'Desarrollador full-stack' : 'Full-stack developer',
          );
        });
      });
    }
  }
});

test.describe('Scroll behavior on reload and navigation', () => {
  for (const { locale } of LOCALES) {
    test(`the navbar follows wheel scrolling delivered after animation frames on /${locale}`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'no-preference', colorScheme: 'light' });
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`/${locale}`);
      const navbar = page.getByRole('banner');
      await expect(navbar.getByRole('button', { name: /toggle theme|cambiar tema/i })).toBeVisible();

      await page.evaluate(() => {
        // Reproduce a compositor scroll delivered after the input frame.
        window.addEventListener('wheel', (event) => {
          event.preventDefault();
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              window.scrollBy({ top: event.deltaY, behavior: 'instant' });
            });
          });
        }, { passive: false });
      });

      await expect(navbar).toBeInViewport({ ratio: 0.95 });
      await page.mouse.move(500, 400);
      await page.mouse.wheel(0, 500);
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(500);
      await expect(navbar).not.toBeInViewport();

      await page.mouse.wheel(0, -160);
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(340);
      await expect(navbar).toBeInViewport({ ratio: 0.95 });
    });
  }

  test('a theme change does not hide or freeze the navbar before real downward scrolling', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference', colorScheme: 'light' });
    await page.goto('/en');
    const navbar = page.getByRole('banner');
    const theme = page.getByRole('button', { name: /toggle theme/i });
    const initialPressed = await theme.getAttribute('aria-pressed');
    const initialScrollY = await page.evaluate(() => window.scrollY);

    await theme.click();

    await expect(theme).not.toHaveAttribute('aria-pressed', initialPressed!);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(initialScrollY);
    await expect(navbar).not.toHaveAttribute('data-hidden');

    await page.mouse.move(500, 400);
    await page.mouse.wheel(0, 160);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(80);
    await expect(navbar).toHaveAttribute('data-hidden');
  });

  test('reload at the top keeps the navbar visible and the first user scroll can hide it', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/en');
    await page.reload();

    const navbar = page.getByRole('banner');
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    await expect(navbar).not.toHaveAttribute('data-hidden');

    await page.mouse.move(500, 400);
    await page.mouse.wheel(0, 160);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(80);
    await expect(navbar).toHaveAttribute('data-hidden');
  });

  test('reload with restored scroll keeps the navbar visible until a later user scroll', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/en');
    await page.evaluate(() => window.scrollTo({ top: 320, behavior: 'instant' }));
    const beforeReload = await page.evaluate(() => window.scrollY);
    expect(beforeReload).toBeGreaterThan(80);

    await page.reload();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(beforeReload);
    const navbar = page.getByRole('banner');
    await expect(navbar).not.toHaveAttribute('data-hidden');

    await page.mouse.move(500, 400);
    await page.mouse.wheel(0, 160);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(beforeReload);
    await expect(navbar).toHaveAttribute('data-hidden');

    await page.mouse.wheel(0, -160);
    await expect(navbar).not.toHaveAttribute('data-hidden');
  });

  test('reload restores the same scroll position without a second jump', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/en');
    await page.evaluate(() => window.scrollTo({ top: 320, behavior: 'instant' }));
    const beforeReload = await page.evaluate(() => window.scrollY);

    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(beforeReload);
    // Negative assertion: there is no event to wait for, so give a late jump time to show up.
    await page.waitForTimeout(150);
    expect(await page.evaluate(() => window.scrollY)).toBe(beforeReload);
  });

  test('changing language preserves the current scroll position', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/en');
    await page.evaluate(() => window.scrollTo({ top: 320, behavior: 'instant' }));
    const beforeSwitch = await page.evaluate(() => window.scrollY);

    await clickCenter(page, page.getByRole('button', { name: 'Español' }));
    await page.waitForURL('/es');
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(beforeSwitch);
  });

  test('anchor navigation keeps the navbar visible; only a later user scroll can hide it', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/en');
    const navbar = page.getByRole('banner');

    await page.getByRole('link', { name: 'About', exact: true }).click();
    await expect(page).toHaveURL(/#about$/);
    await waitForScrollSettled(page);
    await expect(navbar).not.toHaveAttribute('data-hidden');

    const beforeWheel = await page.evaluate(() => window.scrollY);
    await page.mouse.move(500, 400);
    await page.mouse.wheel(0, 200);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(beforeWheel);
    await expect(navbar).toHaveAttribute('data-hidden');
  });

  for (const { locale } of LOCALES) {
    test(`two locale switches in About keep the reading position and navbar visible from /${locale}`, async ({
      page,
    }) => {
      const aboutLabel = { en: 'About', es: 'Sobre mí' };
      const languageLabel = { en: 'English', es: 'Español' };
      const otherLocale = locale === 'en' ? 'es' : 'en';
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.goto(`/${locale}`);
      const navbar = page.getByRole('banner');

      await navbar.getByRole('link', { name: aboutLabel[locale] }).click();
      await expect(page).toHaveURL(`/${locale}#about`);
      // Smooth scrolling may or may not emit `scrollend` (e.g. when already in
      // place), so wait for the position itself to stop changing.
      await waitForScrollSettled(page);

      const headingTop = (language: 'en' | 'es') =>
        page
          .getByRole('region', { name: aboutLabel[language] })
          .getByRole('heading', { name: aboutLabel[language] })
          .evaluate((heading) => heading.getBoundingClientRect().top);
      const readingTop = await headingTop(locale);
      await expect(navbar).toBeInViewport({ ratio: 0.95 });

      for (const language of [otherLocale, locale] as const) {
        const switcher = navbar.getByRole('button', { name: languageLabel[language] });
        await expect(switcher).toBeInViewport();
        // Pointer click without Playwright repositioning the sticky control.
        await clickCenter(page, switcher);
        await expect(page).toHaveURL(`/${language}#about`);
        await expect
          .poll(async () => Math.abs((await headingTop(language)) - readingTop))
          .toBeLessThanOrEqual(1);
        await navbar.evaluate(async (header) => {
          // Allow the locale's deferred scroll restoration to paint before measuring.
          for (let frame = 0; frame < 4; frame += 1) {
            await new Promise(requestAnimationFrame);
          }
          // A cancelled animation rejects `finished`; that is not a failure here.
          await Promise.allSettled(header.getAnimations().map((animation) => animation.finished));
        });
        await expect(navbar).toBeInViewport({ ratio: 0.95 });
      }

      await page.mouse.move(500, 400);
      await page.mouse.wheel(0, 200);
      await expect(navbar).not.toBeInViewport();
      await page.mouse.wheel(0, -160);
      await expect(navbar).toBeInViewport({ ratio: 0.95 });
    });
  }

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

    await page.mouse.move(500, 400);
    await page.mouse.wheel(0, 4000);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(80);
    await expect(navbar).toHaveAttribute('data-hidden');

    await page.mouse.wheel(0, -160);
    await expect(navbar).not.toHaveAttribute('data-hidden');

    await page.mouse.wheel(0, 4000);
    await expect(navbar).toHaveAttribute('data-hidden');
    await navbar.getByRole('link', { name: IDENTITY }).focus();
    await expect(navbar).not.toHaveAttribute('data-hidden');
  });
});

test.describe('Mobile navigation controls', () => {
  test('the larger logo and hamburger follow the theme and language controls', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/en');

    const banner = page.getByRole('banner');
    const logo = banner.getByRole('img', { name: IDENTITY });
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
    await expect
      .poll(() => panel.evaluate((element) => element.getAnimations().length))
      .toBeGreaterThan(0);

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

        test('navbar is visible at the top, slides out downward and returns on upward scrolling', async ({ page }) => {
          await page.evaluate(() => window.scrollTo(0, 0));
          const navbar = page.locator('header');
          await expect(navbar).toBeVisible();
          await expect(navbar).toHaveCSS('transition-duration', '0.2s');
          await expect
            .poll(() =>
              navbar.evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42),
            )
            .toBe(0);
          await page.mouse.move(500, 400);
          await page.mouse.wheel(0, 500);
          await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(80);
          await expect(navbar).toHaveAttribute('data-hidden');
          await expect
            .poll(() => navbar.evaluate((element) => element.getBoundingClientRect().bottom))
            .toBeLessThanOrEqual(1);
          await expect(navbar).toHaveCSS('opacity', '1');
          await waitForScrollSettled(page);
          const beforeUpwardScroll = await page.evaluate(() => window.scrollY);
          await page.mouse.wheel(0, -160);
          await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(beforeUpwardScroll);
          await expect(navbar).not.toHaveAttribute('data-hidden');
          await expect(navbar).toBeInViewport({ ratio: 0.95 });
        });

        test('navbar shows when focusing a control while hidden', async ({ page }) => {
          await page.mouse.move(500, 400);
          await page.mouse.wheel(0, 500);
          await expect(page.locator('header')).toHaveAttribute('data-hidden');
          await page.keyboard.press('Tab');
          await expect(page.getByRole('link', { name: SKIP_LINK })).toBeFocused();
          await page.keyboard.press('Tab');
          await expect(page.getByRole('link', { name: IDENTITY })).toBeFocused();
          await expect
            .poll(() =>
              page.locator('header').evaluate((element) => element.getBoundingClientRect().top),
            )
            .toBeGreaterThanOrEqual(-1);
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
    await waitForScrollSettled(page);
    const navbar = page.locator('header');
    await expect
      .poll(() =>
        navbar.evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42),
      )
      .toBe(0);
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
        const links = navbar
          .getByRole('link')
          .filter({ hasText: /^(About|Sobre mí|Work|Trabajo|Stack|Contact|Contacto)$/ });
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
        // Fractional layout: compare rows with a tolerance, not strict equality.
        await expect
          .poll(async () => {
            const boxes = await Promise.all((await links.all()).map((link) => link.boundingBox()));
            return boxes.every((box) => box && Math.abs(box.y - boxes[0]!.y) < 1);
          })
          .toBe(true);
        await page.setViewportSize({ width: 360, height: 900 });
        await expect(open).toBeVisible();
        await expect(links).toHaveCount(0);
      });
    });
  }

  test('scrolling the open panel does not move the page or close the menu', async ({ page }) => {
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
          .evaluateAll(
            (elements) => elements.filter((element) => element.getClientRects().length > 0).length,
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
          expect(
            focusStyle.outlineWidth,
            `Tab stop ${index + 1} should have a visible outline`,
          ).toBeGreaterThan(0);
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
        await expect(page.getByRole('link', { name: IDENTITY })).toBeVisible();
        await expect(
          page.getByRole('link', { name: locale === 'en' ? 'About' : 'Sobre mí' }),
        ).toHaveAttribute('href', `/${locale}#about`);
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

  test('keyboard focus can leave the open mobile menu without being trapped', async ({ page }) => {
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
    expect(await page.evaluate(() => document.activeElement?.closest('header') === null)).toBe(
      true,
    );
  });
});
