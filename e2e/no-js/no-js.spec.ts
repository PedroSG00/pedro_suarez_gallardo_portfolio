import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const REVEAL_STYLES_PATH = resolve(
  process.cwd(),
  'src/components/ui/Reveal/Reveal.module.css',
);
const VIEWPORT_HEIGHT = 1000;
const BLOCK_HEIGHT = 200;

// T18: JavaScript desactivado (RF-04, RF-05).
// Se bloquean los bundles de la app (**/*.js) para simular un entorno sin JS
// de la app, manteniendo page.evaluate disponible (es API del navegador).
// Los tests miden opacidad computada, no el atributo style.
async function mountNoJsFixture(
  page: Page,
  lang: 'en' | 'es',
  theme: 'light' | 'dark',
  pageShorterThanViewport: boolean,
  isLastSection: boolean,
  paddingTop = '1000px',
): Promise<void> {
  const revealStyles = await readFile(REVEAL_STYLES_PATH, 'utf8');

  await page.route('**/*.js', (route) => route.abort());

  await page.setViewportSize({ width: 1280, height: VIEWPORT_HEIGHT });

  const pageHeight = pageShorterThanViewport
    ? VIEWPORT_HEIGHT - 100
    : VIEWPORT_HEIGHT * 3;

  const themeAttr = theme === 'dark' ? 'data-theme="dark"' : '';
  const lastAttr = isLastSection ? 'data-last-section' : '';

  await page.setContent(`
    <html lang="${lang}" ${themeAttr}>
    <style>
      html, body { margin: 0; }
      :root { --motion-distance: 24px; }
      body { min-height: ${pageHeight}px; }
      main { min-height: ${pageHeight}px; padding-top: ${paddingTop}; }
      [data-reveal-root] { height: ${BLOCK_HEIGHT}px; }
    </style>
    <main>
      <section class="reveal" data-reveal-root role="region" aria-label="Contact block" ${lastAttr}>
        <span data-reveal-entry-marker aria-hidden="true"></span>
        <span data-reveal-exit-marker aria-hidden="true"></span>
        <h2>Contact</h2>
      </section>
    </main>
  `);
  await page.addStyleTag({ content: revealStyles });
}

async function computedOpacity(page: Page, selector: string): Promise<number> {
  return page.evaluate(
    (sel: string) => Number(getComputedStyle(document.querySelector(sel)!).opacity),
    selector,
  );
}

async function computedTransformY(page: Page, selector: string): Promise<number> {
  return page.evaluate(
    (sel: string) =>
      new DOMMatrixReadOnly(getComputedStyle(document.querySelector(sel)!).transform)
        .m42,
    selector,
  );
}

async function scrollToEnd(page: Page): Promise<void> {
  await page.evaluate(
    () => window.scrollTo(0, document.body.scrollHeight),
  );
  await page.evaluate(
    () => new Promise<void>((r) => requestAnimationFrame(() => r())),
  );
}

test.describe('T18: JS disabled — RF-04 Contact at the end', () => {
  test('light / en: opacity 1 when reaching the end', async ({ page }) => {
    await mountNoJsFixture(page, 'en', 'light', false, true);
    await scrollToEnd(page);
    expect(await computedOpacity(page, '[aria-label="Contact block"]')).toBe(1);
    expect(await computedTransformY(page, '[aria-label="Contact block"]')).toBe(0);
  });

  test('dark / en: opacity 1 when reaching the end', async ({ page }) => {
    await mountNoJsFixture(page, 'en', 'dark', false, true);
    await scrollToEnd(page);
    expect(await computedOpacity(page, '[aria-label="Contact block"]')).toBe(1);
    expect(await computedTransformY(page, '[aria-label="Contact block"]')).toBe(0);
  });

  test('light / es: opacity 1 when reaching the end', async ({ page }) => {
    await mountNoJsFixture(page, 'es', 'light', false, true);
    await scrollToEnd(page);
    expect(await computedOpacity(page, '[aria-label="Contact block"]')).toBe(1);
    expect(await computedTransformY(page, '[aria-label="Contact block"]')).toBe(0);
  });

  test('dark / es: opacity 1 when reaching the end', async ({ page }) => {
    await mountNoJsFixture(page, 'es', 'dark', false, true);
    await scrollToEnd(page);
    expect(await computedOpacity(page, '[aria-label="Contact block"]')).toBe(1);
    expect(await computedTransformY(page, '[aria-label="Contact block"]')).toBe(0);
  });
});

test.describe('T18: JS disabled — RF-05 page shorter than the viewport', () => {
  test('light / en: all blocks fully visible without JavaScript', async ({
    page,
  }) => {
    await mountNoJsFixture(page, 'en', 'light', true, false, '0px');
    await scrollToEnd(page);
    const opacity = await computedOpacity(page, '[aria-label="Contact block"]');
    expect(opacity).toBe(1);
  });

  test('dark / en: all blocks fully visible without JavaScript', async ({
    page,
  }) => {
    await mountNoJsFixture(page, 'en', 'dark', true, false, '0px');
    await scrollToEnd(page);
    const opacity = await computedOpacity(page, '[aria-label="Contact block"]');
    expect(opacity).toBe(1);
  });

  test('light / es: all blocks fully visible without JavaScript', async ({
    page,
  }) => {
    await mountNoJsFixture(page, 'es', 'light', true, false, '0px');
    await scrollToEnd(page);
    const opacity = await computedOpacity(page, '[aria-label="Contact block"]');
    expect(opacity).toBe(1);
  });

  test('dark / es: all blocks fully visible without JavaScript', async ({
    page,
  }) => {
    await mountNoJsFixture(page, 'es', 'dark', true, false, '0px');
    await scrollToEnd(page);
    const opacity = await computedOpacity(page, '[aria-label="Contact block"]');
    expect(opacity).toBe(1);
  });
});
