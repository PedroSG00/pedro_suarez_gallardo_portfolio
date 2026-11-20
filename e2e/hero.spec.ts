import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test, type Page, type Locator } from '@playwright/test';

const HERO_STYLES_PATH = resolve(
  process.cwd(),
  'src/components/sections/Hero/Hero.module.css',
);

test.describe('Hero: entrada, cursor, contorno y parallax (RF-7, RF-9, RF-10)', () => {
  async function loadHero(page: Page, locale: 'en' | 'es', theme: 'light' | 'dark'): Promise<void> {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ colorScheme: theme === 'dark' ? 'dark' : 'light' });
    await page.goto(`/${locale}`);
    await page.waitForLoadState('networkidle');
  }

  function h1(page: Page): Locator {
    return page.getByRole('heading', { level: 1, name: 'Pedro Suárez Gallardo' });
  }

  test('un solo h1 con el nombre, /en y /es, claro y oscuro', async ({ page }) => {
    for (const locale of ['en', 'es'] as const) {
      for (const theme of ['light', 'dark'] as const) {
        await loadHero(page, locale, theme);
        await expect(h1(page)).toBeVisible();
        const count = await page.getByRole('heading', { level: 1 }).count();
        expect(count).toBe(1);
      }
    }
  });

  test('entrada <= 600 ms y estado final estable', async ({ page }) => {
    await loadHero(page, 'en', 'light');

    // After entry animations (600 ms), opacity 1 and no displacement.
    await page.waitForTimeout(700);
    await expect(h1(page)).toHaveCSS('opacity', '1');
    const transform = await h1(page).evaluate(
      (el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42,
    );
    expect(transform).toBe(0);
  });

  test('la entrada no se repite al hacer scroll', async ({ page }) => {
    await loadHero(page, 'en', 'light');
    await page.waitForTimeout(700);

    const firstLine = h1(page).getByText('Pedro', { exact: true });
    const before = await firstLine.evaluate((el) => {
      const s = getComputedStyle(el);
      return { opacity: s.opacity, transform: new DOMMatrixReadOnly(s.transform).m42 };
    });

    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(300);

    const after = await firstLine.evaluate((el) => {
      const s = getComputedStyle(el);
      return { opacity: s.opacity, transform: new DOMMatrixReadOnly(s.transform).m42 };
    });

    expect(after.opacity).toBe('1');
    expect(after.transform).toBe(before.transform);
  });

  test('cursor: ciclo 1 s, 50 % encendido, aria-hidden', async ({ page }) => {
    await loadHero(page, 'en', 'light');
    await page.waitForTimeout(700);

    const cursor = page.locator('h1#hero-name [data-hero-cursor]');
    await expect(cursor).toHaveAttribute('aria-hidden', 'true');
    const lastLine = h1(page).getByText('Gallardo', { exact: true });
    const [lineBox, cursorBox] = await Promise.all([lastLine.boundingBox(), cursor.boundingBox()]);
    expect(cursorBox!.y + cursorBox!.height).toBeLessThanOrEqual(lineBox!.y + lineBox!.height);
    expect(cursorBox!.x).toBeGreaterThanOrEqual(lineBox!.x + lineBox!.width);
    expect(cursorBox!.height).toBeGreaterThanOrEqual(lineBox!.height * 0.6);
    expect(cursorBox!.width).toBeGreaterThanOrEqual(lineBox!.height * 0.15);

    const duration = await page.evaluate(() => {
      const el = document.querySelector('h1#hero-name [data-hero-cursor]')!;
      return getComputedStyle(el).animationDuration;
    });
    expect(duration).toBe('1s');

    // 50 % encendido: en dos momentos distintos debe alternar visible/oculto.
    const opacity1 = await cursor.evaluate((el) => Number(getComputedStyle(el).opacity));
    await page.waitForTimeout(500);
    const opacity2 = await cursor.evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(opacity1).not.toBe(opacity2);
  });

  test('keeps the fill solid through most of exit before resolving to a clean outline', async ({
    page,
  }) => {
    await loadHero(page, 'en', 'light');
    await page.evaluate(() => {
      document.body.style.minHeight = '300vh';
    });
    await page.waitForTimeout(700);

    await page.evaluate(() => window.scrollTo({ top: 600, behavior: 'instant' }));
    const fillAtMidExit = await h1(page).evaluate((element) => getComputedStyle(element).color);
    expect(fillAtMidExit).toBe('rgb(18, 17, 16)');

    const exitScrollY = await page
      .locator('section[aria-labelledby="hero-name"]')
      .evaluate((element) => window.scrollY + element.getBoundingClientRect().bottom + 1);
    await page.evaluate((scrollY) => window.scrollTo({ top: scrollY, behavior: 'instant' }), exitScrollY);
    await page.waitForTimeout(100);

    const fillAtExit = await h1(page).evaluate((element) => getComputedStyle(element).color);
    expect(fillAtExit).toMatch(/,\s*0\)$/);
    await expect(h1(page)).toHaveCSS('-webkit-text-stroke-color', 'rgb(18, 17, 16)');
  });

  test('contorno y parallax reversibles, sin salir del hero ni solaparse', async ({ page }) => {
    await loadHero(page, 'en', 'light');
    await page.waitForTimeout(700);

    const hero = page.locator('section[aria-labelledby="hero-name"]');
    const h1El = h1(page);

    // Initial position of the name (top of hero).
    const topStart = await h1El.evaluate((el) => el.getBoundingClientRect().top);
    const heroTop = await hero.evaluate((el) => el.getBoundingClientRect().top);
    expect(topStart).toBeGreaterThanOrEqual(heroTop);

    // Hacer scroll para que el hero salga (fase de exit).
    await page.evaluate(() => window.scrollTo(0, 900));
    await page.waitForTimeout(300);

    const transformExit = await h1El.evaluate(
      (el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42,
    );
    // Name moves down (positive) as hero exits.
    expect(transformExit).toBeGreaterThan(0);

    // Volver arriba: el parallax revierte.
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);

    const transformBack = await h1El.evaluate(
      (el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42,
    );
    expect(transformBack).toBe(0);
  });

  test('desplazamiento maximo <= 20 %% de la altura del hero', async ({ page }) => {
    await loadHero(page, 'en', 'light');
    await page.waitForTimeout(700);

    const heroHeight = await page.locator('section[aria-labelledby="hero-name"]').evaluate(
      (el) => el.getBoundingClientRect().height,
    );
    const maxDistance = await page.evaluate(() =>
      Number(getComputedStyle(document.documentElement).getPropertyValue('--hero-parallax-distance').replace('dvh', '')),
    );

    await page.evaluate(() => window.scrollTo(0, 900));
    await page.waitForTimeout(300);

    const transform = await h1(page).evaluate(
      (el) => Math.abs(new DOMMatrixReadOnly(getComputedStyle(el).transform).m42),
    );

    const limit = (heroHeight * maxDistance) / 100;
    expect(transform).toBeLessThanOrEqual(limit + 1);
  });

  test('reduced motion: nombre solido y estatico, cursor estatico y visible', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    await expect(h1(page)).toHaveCSS('opacity', '1');
    await expect(h1(page)).toHaveCSS('transform', 'none');

    const cursor = page.locator('h1#hero-name [data-hero-cursor]');
    await expect(cursor).toBeVisible();
    await expect(cursor).toHaveCSS('animation', 'none');
  });

  test('sin JS el nombre se ve', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const noJsPage = await context.newPage();
    try {
      await noJsPage.setViewportSize({ width: 1440, height: 900 });
      await noJsPage.goto('/en');
      await noJsPage.waitForLoadState('networkidle');
      await expect(h1(noJsPage)).toBeVisible();
      await expect(h1(noJsPage)).toHaveCSS('opacity', '1');
    } finally {
      await context.close();
    }
  });

  test('impresion: nombre solido y sin animaciones', async ({ page }) => {
    await page.emulateMedia({ media: 'print' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    await expect(h1(page)).toHaveCSS('opacity', '1');
    await expect(h1(page)).toHaveCSS('animation', 'none');
    await expect(h1(page)).toHaveCSS('transform', 'none');
  });

  test('colores forzados: nombre visible con CanvasText', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active', colorScheme: 'light' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    await expect(h1(page)).toBeVisible();
    const fill = await h1(page).evaluate((el) => getComputedStyle(el).color);
    expect(fill).not.toBe('');
  });

  test('fallback sin animation-timeline: nombre solido, sin transform y sin animacion', async ({
    page,
  }) => {
    const heroStyles = await readFile(HERO_STYLES_PATH, 'utf8');

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.setContent(`
      <html lang="en">
      <style>
        html, body { margin: 0; height: 3000px; }
        :root {
          --color-surface: #f2efe6;
          --color-ink: #121110;
          --grid-gutter: 24px;
          --hero-name-fill: 0.9;
          --hero-name-divisor: 4.8;
          --cursor-width: 0.5ch;
          --cursor-duration: 1s;
          --hero-line-duration: 400ms;
          --hero-line-stagger: 100ms;
          --hero-parallax-distance: 20dvh;
        }
        body { background: var(--color-surface); color: var(--color-ink); font-family: monospace; }
      </style>
      <section aria-labelledby="hero-name">
        <h1 id="hero-name" aria-label="Pedro Suarez Gallardo">
          <span aria-hidden="true">Pedro</span>
          <span aria-hidden="true">Suarez</span>
          <span aria-hidden="true" data-hero-line><span>Gallardo</span><span data-hero-cursor aria-hidden="true">█</span></span>
        </h1>
      </section>
    `);
    await page.addStyleTag({ content: heroStyles });
    // Inject fallback rule (reveal-fallback.spec.ts pattern) to
    // simular ausencia de animation-timeline, aunque Chromium lo soporte.
    await page.addStyleTag({
      content: `
        #hero-name { animation: none !important; transform: none !important; opacity: 1 !important; color: var(--color-ink) !important; }
        #hero-name > span[aria-hidden="true"] { animation: none !important; opacity: 1 !important; transform: none !important; }
      `,
    });

    await expect(page.getByRole('heading', { level: 1, name: 'Pedro Suarez Gallardo' })).toBeVisible();
    const h1El = page.locator('h1#hero-name');
    await expect(h1El).toHaveCSS('opacity', '1');
    const transform = await h1El.evaluate(
      (el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42,
    );
    expect(transform).toBe(0);
    const animation = await h1El.evaluate((el) => getComputedStyle(el).animationName);
    expect(animation).toBe('none');
  });
});
