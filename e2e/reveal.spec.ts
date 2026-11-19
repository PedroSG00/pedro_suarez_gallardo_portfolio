import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const REVEAL_STYLES_PATH = resolve(
  process.cwd(),
  'src/components/ui/Reveal/Reveal.module.css',
);
const VIEWPORT_HEIGHT = 1000;
const BLOCK_HEIGHT = 200;
const BLOCK_DOCUMENT_TOP = 1000;
const MOTION_DISTANCE = '24px';

async function mountRevealFixture(page: Page, blockHeight = BLOCK_HEIGHT): Promise<void> {
  const revealStyles = await readFile(REVEAL_STYLES_PATH, 'utf8');

  await page.setViewportSize({ width: 1280, height: VIEWPORT_HEIGHT });
  await page.setContent(`
    <style>
      html, body { margin: 0; }
      :root { --motion-distance: ${MOTION_DISTANCE}; }
      body { min-height: 3000px; }
      main { min-height: 3000px; padding-top: ${BLOCK_DOCUMENT_TOP}px; }
      [data-reveal-root] { height: ${blockHeight}px; }
    </style>
    <main>
      <section class="reveal" data-reveal-root role="group" aria-label="Scroll content">
        <span data-reveal-entry-marker aria-hidden="true"></span>
        <span data-reveal-exit-marker aria-hidden="true"></span>
        <h2>Scroll content</h2>
      </section>
    </main>
  `);
  await page.addStyleTag({ content: revealStyles });
}

async function scrollBlockTopTo(
  page: Page,
  viewportPosition: number,
): Promise<{ opacity: number; translateY: number }> {
  await page.evaluate(
    (scrollY) => window.scrollTo(0, scrollY),
    BLOCK_DOCUMENT_TOP - viewportPosition,
  );
  await page.evaluate(
    () => new Promise<void>((resolveFrame) => requestAnimationFrame(() => resolveFrame())),
  );

  const reveal = page.getByRole('group', { name: 'Scroll content' });
  await expect(reveal).toBeVisible();

  return reveal.evaluate((element) => {
    const styles = window.getComputedStyle(element);
    const transform = new DOMMatrixReadOnly(styles.transform);
    return { opacity: Number(styles.opacity), translateY: transform.m42 };
  });
}

test.describe('Reveal edge-based opacity', () => {
  test('has opacity below one as its top edge enters the lower 15% of the viewport', async ({
    page,
  }) => {
    await mountRevealFixture(page);

    const { opacity, translateY } = await scrollBlockTopTo(
      page,
      VIEWPORT_HEIGHT * 0.85,
    );

    expect(opacity).toBeLessThan(1);
    expect(translateY).not.toBe(0);
  });

  test('has opacity one in the stable region between the edge margins', async ({ page }) => {
    await mountRevealFixture(page, VIEWPORT_HEIGHT * 1.2);

    const { opacity, translateY } = await scrollBlockTopTo(
      page,
      VIEWPORT_HEIGHT * 0.65,
    );

    expect(opacity).toBe(1);
    expect(translateY).toBe(0);
  });

  test('has opacity below one as its bottom edge enters the upper 15% of the viewport', async ({
    page,
  }) => {
    await mountRevealFixture(page);

    const { opacity, translateY } = await scrollBlockTopTo(
      page,
      VIEWPORT_HEIGHT * 0.15 - BLOCK_HEIGHT,
    );

    expect(opacity).toBeLessThan(1);
    expect(translateY).not.toBe(0);
  });

  test('changes continuously and monotonically through entry and exit margins', async ({
    page,
  }) => {
    await mountRevealFixture(page);

    const entryOpacities: number[] = [];
    for (const position of [0.95, 0.9, 0.85, 0.8]) {
      entryOpacities.push(
        (await scrollBlockTopTo(page, VIEWPORT_HEIGHT * position)).opacity,
      );
    }

    const exitOpacities: number[] = [];
    for (const bottomPosition of [0.3, 0.2, 0.1, 0.05]) {
      exitOpacities.push(
        (
          await scrollBlockTopTo(
          page,
          VIEWPORT_HEIGHT * bottomPosition - BLOCK_HEIGHT,
          )
        ).opacity,
      );
    }

    for (let index = 1; index < entryOpacities.length; index += 1) {
      expect(entryOpacities[index]).toBeGreaterThan(entryOpacities[index - 1]);
    }

    for (let index = 1; index < exitOpacities.length; index += 1) {
      expect(exitOpacities[index]).toBeLessThan(exitOpacities[index - 1]);
    }
  });

  test('no parpadea al cargar: bloque inicialmente visible tiene opacidad 1 sin scroll', async ({
    page,
  }) => {
    const revealStyles = await readFile(REVEAL_STYLES_PATH, 'utf8');

    await page.setViewportSize({ width: 1280, height: VIEWPORT_HEIGHT });
    await page.setContent(`
      <style>
        html, body { margin: 0; }
        :root { --motion-distance: ${MOTION_DISTANCE}; }
        body { min-height: 3000px; }
        main { min-height: 3000px; padding-top: 400px; }
        [data-reveal-root] { height: ${BLOCK_HEIGHT}px; }
      </style>
      <main>
        <section class="reveal" data-reveal-root role="group" aria-label="Scroll content">
          <span data-reveal-entry-marker aria-hidden="true" />
          <span data-reveal-exit-marker aria-hidden="true" />
          <h2>Initially visible content</h2>
        </section>
      </main>
    `);
    await page.addStyleTag({ content: revealStyles });

    // Bloque inicialmente dentro del viewport sin scroll (borde superior al 40%,
    // inferior al 60%, dentro de la zona estable). No hay scroll previo.
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.evaluate(
      () => new Promise<void>((resolveFrame) => requestAnimationFrame(() => resolveFrame())),
    );

    const reveal = page.getByRole('group', { name: 'Scroll content' });
    await expect(reveal).toBeVisible();

    const styles = await reveal.evaluate((element) => {
      const computed = window.getComputedStyle(element);
      return { opacity: Number(computed.opacity), transform: computed.transform };
    });

    expect(styles.opacity).toBe(1);
    expect(styles.transform).toBe('matrix(1, 0, 0, 1, 0, 0)');
  });
});
