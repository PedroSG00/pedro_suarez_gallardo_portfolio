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

async function mountRevealFixture(
  page: Page,
  blockHeight = BLOCK_HEIGHT,
  variant = 'rise',
): Promise<void> {
  const revealStyles = await readFile(REVEAL_STYLES_PATH, 'utf8');

  await page.setViewportSize({ width: 1280, height: VIEWPORT_HEIGHT });
  await page.setContent(`
    <style>
      html, body { margin: 0; }
      html { scroll-padding-top: 96px; }
      :root { --motion-distance: ${MOTION_DISTANCE}; }
      body { min-height: 3000px; }
      main { min-height: 3000px; padding-top: ${BLOCK_DOCUMENT_TOP}px; padding-bottom: ${VIEWPORT_HEIGHT * 2}px; }
      [data-reveal-root] { height: ${blockHeight}px; }
    </style>
    <main>
      <section class="reveal" data-reveal-root data-reveal-ready data-reveal-variant="${variant}" role="group" aria-label="Scroll content">
        <span data-reveal-entry-marker aria-hidden="true"></span>
        <span data-reveal-exit-marker aria-hidden="true"></span>
        <div data-reveal-content><h2>Scroll content</h2></div>
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
    () => new Promise<void>((resolveFrame) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolveFrame())),
    ),
  );

  const reveal = page.getByRole('group', { name: 'Scroll content' });
  await expect(reveal).toBeVisible();

  return reveal.evaluate((element) => {
    const styles = window.getComputedStyle(element);
    const content = element.querySelector<HTMLElement>('[data-reveal-content]');
    if (!content) throw new Error('Reveal content is missing');
    const contentStyles = window.getComputedStyle(content);
    const transform = new DOMMatrixReadOnly(styles.transform);
    const contentTransform = new DOMMatrixReadOnly(contentStyles.transform);
    return {
      opacity: Number(styles.opacity) * Number(contentStyles.opacity),
      translateY: transform.m42 + contentTransform.m42,
    };
  });
}

test.describe('Reveal edge-based opacity', () => {
  test('keeps every variant fully visible when reduced motion is requested', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const variant of ['rise', 'clip', 'fade']) {
      await mountRevealFixture(page, BLOCK_HEIGHT, variant);
      for (const position of [VIEWPORT_HEIGHT * 0.85, VIEWPORT_HEIGHT * 0.5, 0]) {
        expect(await scrollBlockTopTo(page, position)).toEqual({
          opacity: 1,
          translateY: 0,
        });
      }
    }
  });

  test('has opacity below one as its top edge enters the lower 15% of the viewport', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName === 'webkit', 'WebKit uses the static visible fallback');
    await mountRevealFixture(page);

    const { opacity, translateY } = await scrollBlockTopTo(
      page,
      VIEWPORT_HEIGHT * 0.85,
    );

    expect(opacity).toBeLessThan(1);
    expect(translateY).not.toBe(0);
  });

  test('has opacity one in the stable region between the edge margins', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName === 'webkit', 'WebKit uses the static visible fallback');
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
    browserName,
  }) => {
    test.skip(browserName === 'webkit', 'WebKit uses the static visible fallback');
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
    browserName,
  }) => {
    test.skip(browserName === 'webkit', 'WebKit uses the static visible fallback');
    await mountRevealFixture(page);

    const entryOpacities: number[] = [];
    for (const position of [0.95, 0.9, 0.85, 0.8]) {
      entryOpacities.push(
        (await scrollBlockTopTo(page, VIEWPORT_HEIGHT * position)).opacity,
      );
    }

    const exitOpacities: number[] = [];
    for (const bottomPosition of [0.2, 0.15, 0.1, 0.05]) {
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

  for (const variant of ['rise', 'clip', 'fade']) {
    test(`${variant}: keeps all portions of a six-viewport block fully readable before a reversible edge-based exit`, async ({ page, browserName }) => {
      test.skip(browserName === 'webkit', 'WebKit uses the static visible fallback');
      const height = VIEWPORT_HEIGHT * 6;
      await mountRevealFixture(page, height, variant);
      const block = page.getByRole('group', { name: 'Scroll content' });
      // Every viewport-sized portion, including the trailing content, gets a
      // stable interval. The exit must depend on the bottom edge, not height.
      for (const top of [650, -500, -1500, -2500, -3500, -4500, 250 - height]) {
        const state = await scrollBlockTopTo(page, top);
        expect(state).toEqual({ opacity: 1, translateY: 0 });
        const clipPaths = await block.evaluate((element) => {
          const content = element.querySelector('[data-reveal-content]');
          if (!content) throw new Error('Reveal content is missing');
          return [getComputedStyle(element).clipPath, getComputedStyle(content).clipPath];
        });
        expect(clipPaths.every((clipPath) => !clipPath.includes('100%'))).toBe(true);
      }
      const exit = await scrollBlockTopTo(page, 100 - height);
      expect(exit.opacity).toBeGreaterThan(0);
      expect(exit.opacity).toBeLessThan(1);
      if (variant === 'rise') expect(exit.translateY).toBeLessThan(0);
      else expect(exit.translateY).toBe(0);
      expect(await scrollBlockTopTo(page, 500 - height))
        .toEqual({ opacity: 1, translateY: 0 });
      const reversedExit = await scrollBlockTopTo(page, 100 - height);
      expect(reversedExit.opacity).toBeCloseTo(exit.opacity, 4);
      expect(reversedExit.translateY).toBeCloseTo(exit.translateY, 4);
    });
  }
});

test('keeps WebKit content fully visible when scroll timelines fall back to static', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'webkit', 'This fallback applies to WebKit');
  for (const variant of ['rise', 'clip', 'fade']) {
    await mountRevealFixture(page, BLOCK_HEIGHT, variant);
    for (const position of [VIEWPORT_HEIGHT * 0.85, VIEWPORT_HEIGHT * 0.5, 0]) {
      expect(await scrollBlockTopTo(page, position)).toEqual({
        opacity: 1,
        translateY: 0,
      });
    }
  }
});
