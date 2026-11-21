import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const REVEAL_STYLES_PATH = resolve(
  process.cwd(),
  'src/components/ui/Reveal/Reveal.module.css',
);
const VIEWPORT_HEIGHT = 1000;
const BLOCK_HEIGHT = 200;

// Helpers compartidos para fixtures con estilos reales de Reveal.
async function mountFixture(
  page: Page,
  html: string,
  paddingTop = '1000px',
): Promise<void> {
  const revealStyles = await readFile(REVEAL_STYLES_PATH, 'utf8');

  await page.setViewportSize({ width: 1280, height: VIEWPORT_HEIGHT });
  await page.setContent(`
    <style>
      html, body { margin: 0; }
      :root { --motion-distance: 24px; }
      body { min-height: 3000px; }
      main { min-height: 3000px; padding-top: ${paddingTop}; }
      [data-reveal-root] { height: ${BLOCK_HEIGHT}px; }
    </style>
    <main>
      ${html.replaceAll('data-reveal-root', 'data-reveal-root data-reveal-ready')}
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

async function scrollTo(page: Page, y: number): Promise<void> {
  await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
  await page.evaluate(
    () => new Promise<void>((r) => requestAnimationFrame(() => r())),
  );
}

test.describe('T19: real evidence per RF', () => {

  test('RF-03: block visible on load, opacity 1 on first frame', async ({
    page,
  }) => {
    await mountFixture(page, `
      <section class="reveal" data-reveal-root role="region" aria-label="Block visible on load">
        <span data-reveal-entry-marker aria-hidden="true"></span>
        <span data-reveal-exit-marker aria-hidden="true"></span>
        <h2>Visible on load</h2>
      </section>
    `, '400px');

    // No scroll: block is in visible zone (padding-top 1000, viewport 1000,
    // block starts at 1000, just at the viewport edge). To ensure it is in
    // stable phase, we place it higher up.
    await scrollTo(page, 0);

    const opacity = await computedOpacity(page, '[aria-label="Block visible on load"]');
    const transformY = await computedTransformY(page, '[aria-label="Block visible on load"]');

    expect(opacity).toBe(1);
    expect(transformY).toBe(0);
  });

  test('RF-05: viewport taller than the page, everything at opacity 1', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 2000 });
    const revealStyles = await readFile(REVEAL_STYLES_PATH, 'utf8');

    await page.route('**/*.js', (route) => route.abort());
    await page.setContent(`
      <style>
        html, body { margin: 0; }
        :root { --motion-distance: 24px; }
        body { min-height: 900px; }
        main { min-height: 900px; padding-top: 0px; }
        [data-reveal-root] { height: ${BLOCK_HEIGHT}px; }
      </style>
      <main>
        <section class="reveal" data-reveal-root role="region" aria-label="Short page block">
          <span data-reveal-entry-marker aria-hidden="true"></span>
          <span data-reveal-exit-marker aria-hidden="true"></span>
          <h2>Short page</h2>
        </section>
      </main>
    `);
    await page.addStyleTag({ content: revealStyles });

    await scrollTo(page, 0);

    const opacity = await computedOpacity(page, '[aria-label="Short page block"]');

    // Without JavaScript the shared Reveal must remain fully static.
    expect(opacity).toBe(1);
  });

  test('RF-07: fast scroll and abrupt stop, stable blocks opacity 1', async ({
    page,
  }) => {
    await mountFixture(page, `
      <section class="reveal" data-reveal-root role="region" aria-label="Stable block">
        <span data-reveal-entry-marker aria-hidden="true"></span>
        <span data-reveal-exit-marker aria-hidden="true"></span>
        <h2>Stable block</h2>
      </section>
    `);

    // Fast scroll: several positions rapidly.
    for (const y of [0, 2000, 500, 3000, 1000]) {
      await scrollTo(page, y);
    }

    // Abrupt stop: stable position (top edge at 400px of viewport).
    await scrollTo(page, 600);

    const opacity = await computedOpacity(page, '[aria-label="Stable block"]');
    const transformY = await computedTransformY(page, '[aria-label="Stable block"]');

    expect(opacity).toBe(1);
    expect(transformY).toBe(0);
  });

  test('RF-11: nav, footer and skip link at opacity 1 in all phases', async ({
    page,
  }) => {
    await mountFixture(page, `
      <nav class="excluded" role="navigation" aria-label="Nav excluded">
        <a href="#skip">Skip link</a>
      </nav>
      <section class="reveal" data-reveal-root role="region" aria-label="Middle block">
        <span data-reveal-entry-marker aria-hidden="true"></span>
        <span data-reveal-exit-marker aria-hidden="true"></span>
        <h2>Middle block</h2>
      </section>
      <footer class="excluded" role="contentinfo" aria-label="Footer excluded">
        <p>Footer</p>
      </footer>
    `);

    // Scroll through entry, center and exit.
    for (const y of [500, 1500, 2500]) {
      await scrollTo(page, y);

      const navOpacity = await computedOpacity(page, '[aria-label="Nav excluded"]');
      const footerOpacity = await computedOpacity(page, '[aria-label="Footer excluded"]');

      expect(navOpacity).toBe(1);
      expect(footerOpacity).toBe(1);
    }
  });

  test('RF-15: keyboard focus inside a dimmed block keeps it fully visible', async ({ page }) => {
    await mountFixture(page, `
    <section class="reveal" data-reveal-root role="region" aria-label="Block with focus">
      <span data-reveal-entry-marker aria-hidden="true"></span>
      <span data-reveal-exit-marker aria-hidden="true"></span>
      <h2>Block with focus</h2>
      <button type="button">Action</button>
    </section>
  `);

    // Block top at 950px of a 1000px viewport: entry phase, so it is dimmed.
    await scrollTo(page, 50);
    const selector = '[aria-label="Block with focus"]';
    expect(await computedOpacity(page, selector)).toBeLessThan(1);

    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Action' })).toBeFocused();

    await expect.poll(() => computedOpacity(page, selector)).toBe(1);
    await expect.poll(() => computedOpacity(page, 'button')).toBe(1);
  });
});
