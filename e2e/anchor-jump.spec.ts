import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const REVEAL_STYLES_PATH = resolve(
  process.cwd(),
  'src/components/ui/Reveal/Reveal.module.css',
);
const VIEWPORT_HEIGHT = 1000;
const BLOCK_HEIGHT = 200;

// RF-12: with anchor jump (CSS only), the destination block must arrive
// complete (opacity 1, no displacement). As an anchor jump places the target
// at the top edge of the viewport, the block would enter the exit phase
// (dimmed). So the target is given a scroll padding that drops it into the
// reveal stable band.
async function mountAnchorFixture(page: Page): Promise<void> {
  const revealStyles = await readFile(REVEAL_STYLES_PATH, 'utf8');

  await page.setViewportSize({ width: 1280, height: VIEWPORT_HEIGHT });
  await page.setContent(`
    <style>
      html, body { margin: 0; }
      :root { --motion-distance: 24px; }
      body { min-height: 3000px; }
      [data-reveal-root] { height: ${BLOCK_HEIGHT}px; }
      .spacer { height: 1400px; }
      /* RF-12: shifts anchor targets into the reveal stable band so that, on
         anchor jump, the destination block arrives complete (opacity 1)
         instead of dimmed by the exit phase. */
      html { scroll-padding-top: ${VIEWPORT_HEIGHT * 0.4}px; }
    </style>
    <main>
      <a href="#destino" class="anchor-link">Go to destination</a>
      <div class="spacer"></div>
      <section id="destino" class="reveal" data-reveal-root role="region" aria-label="Destination section">
        <span data-reveal-entry-marker aria-hidden="true"></span>
        <span data-reveal-exit-marker aria-hidden="true"></span>
        <h2>Destination</h2>
        <p>Destination block content</p>
      </section>
      <div class="spacer"></div>
    </main>
  `);
  await page.addStyleTag({ content: revealStyles });
}

async function computedOpacity(page: Page, selector: string): Promise<number> {
  return page.evaluate(
    (sel: string) => {
      const el = document.querySelector(sel)!;
      return Number(getComputedStyle(el).opacity);
    },
    selector,
  );
}

async function computedTransformY(page: Page, selector: string): Promise<number> {
  return page.evaluate(
    (sel: string) => {
      const el = document.querySelector(sel)!;
      return new DOMMatrixReadOnly(getComputedStyle(el).transform).m42;
    },
    selector,
  );
}

test.describe('Anchor jump: destination section complete (RF-12)', () => {
  test('all destination blocks have computed opacity 1 when arriving by anchor', async ({
    page,
  }) => {
    await mountAnchorFixture(page);
    await page.getByRole('link', { name: 'Go to destination' }).click();
    await page.waitForURL(/#destino/);
    await page.evaluate(() =>
      new Promise<void>((resolveFrame) => requestAnimationFrame(() => resolveFrame())),
    );

    expect(await computedOpacity(page, '#destino')).toBe(1);
  });

  test('no destination block appears half-revealed after an anchor jump', async ({
    page,
  }) => {
    await mountAnchorFixture(page);
    await page.getByRole('link', { name: 'Go to destination' }).click();
    await page.waitForURL(/#destino/);
    await page.evaluate(() =>
      new Promise<void>((resolveFrame) => requestAnimationFrame(() => resolveFrame())),
    );

    const opacity = await computedOpacity(page, '#destino');
    const translateY = await computedTransformY(page, '#destino');

    expect(opacity).toBe(1);
    expect(translateY).toBe(0);
  });
});
