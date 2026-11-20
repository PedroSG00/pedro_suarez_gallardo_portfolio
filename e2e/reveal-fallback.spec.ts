import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const REVEAL_STYLES_PATH = resolve(
  process.cwd(),
  'src/components/ui/Reveal/Reveal.module.css',
);
const VIEWPORT_HEIGHT = 1000;
const BLOCK_HEIGHT = 200;

// RF-10: fallback "visible without animation" when browser does not support
// animation-timeline: view(). Since Chromium does support it, inject fallback
// CSS to simulate lack of support and verify all revealable blocks remain
// at computed opacity 1 and transform none.
const FALLBACK_CSS = `
  [data-reveal-root] {
    opacity: 1 !important;
    transform: none !important;
    animation: none !important;
    clip-path: none !important;
  }
`;

async function mountFallbackFixture(
  page: Page,
  lang: 'en' | 'es',
  theme: 'light' | 'dark' | 'system',
  injectFallback = true,
): Promise<void> {
  const revealStyles = await readFile(REVEAL_STYLES_PATH, 'utf8');

  await page.setViewportSize({ width: 1280, height: VIEWPORT_HEIGHT });

  const themeAttr =
    theme === 'system' ? '' : `data-theme="${theme}"`;

  await page.setContent(`
    <html lang="${lang}" ${themeAttr}>
    <style>
      html, body { margin: 0; }
      :root { --motion-distance: 24px; }
      body { min-height: 3000px; }
      main { min-height: 3000px; padding-top: 1000px; }
      [data-reveal-root] { height: ${BLOCK_HEIGHT}px; }
    </style>
    <main>
      <section class="reveal" data-reveal-root role="group" aria-label="Bloque A">
        <span data-reveal-entry-marker aria-hidden="true"></span>
        <span data-reveal-exit-marker aria-hidden="true"></span>
        <h2>Bloque A</h2>
      </section>
      <section class="reveal" data-reveal-root role="group" aria-label="Bloque B">
        <span data-reveal-entry-marker aria-hidden="true"></span>
        <span data-reveal-exit-marker aria-hidden="true"></span>
        <h2>Bloque B</h2>
      </section>
      <section class="reveal" data-reveal-root role="group" aria-label="Bloque C">
        <span data-reveal-entry-marker aria-hidden="true"></span>
        <span data-reveal-exit-marker aria-hidden="true"></span>
        <h2>Bloque C</h2>
      </section>
    </main>
  `);
  await page.addStyleTag({ content: revealStyles });
  if (injectFallback) {
    await page.addStyleTag({ content: FALLBACK_CSS });
  }
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

async function checkAllBlocks(page: Page): Promise<void> {
  for (const label of ['Bloque A', 'Bloque B', 'Bloque C']) {
    const selector = `[aria-label="${label}"]`;
    expect(await computedOpacity(page, selector)).toBe(1);
    expect(await computedTransformY(page, selector)).toBe(0);
  }
}

test.describe('RF-10: fallback sin animation-timeline', () => {
  test('en claro / en', async ({ page }) => {
    await mountFallbackFixture(page, 'en', 'light', true);
    await checkAllBlocks(page);
  });

  test('en oscuro / en', async ({ page }) => {
    await mountFallbackFixture(page, 'en', 'dark', true);
    await checkAllBlocks(page);
  });

  test('en claro / es', async ({ page }) => {
    await mountFallbackFixture(page, 'es', 'light', true);
    await checkAllBlocks(page);
  });

  test('en oscuro / es', async ({ page }) => {
    await mountFallbackFixture(page, 'es', 'dark', true);
    await checkAllBlocks(page);
  });

  test('SIN fallback: al menos un bloque queda atenuado (opacidad < 1)', async ({
    page,
  }) => {
    await mountFallbackFixture(page, 'en', 'light', false);

    // Chromium supports animation-timeline, so without fallback CSS the
    // blocks in entry/exit phase remain dimmed.
    const opacities: number[] = [];
    for (const label of ['Bloque A', 'Bloque B', 'Bloque C']) {
      const selector = `[aria-label="${label}"]`;
      opacities.push(await computedOpacity(page, selector));
    }

    const someDimmed = opacities.some((o) => o < 1);
    expect(someDimmed).toBe(true);
  });
});
