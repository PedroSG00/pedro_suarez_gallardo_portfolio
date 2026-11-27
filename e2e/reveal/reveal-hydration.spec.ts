import { expect, test, type Locator, type Page } from '@playwright/test';

async function expectStaticReveals(page: Page): Promise<void> {
  const reveals = page.locator('[data-reveal-root]');
  expect(await reveals.count()).toBeGreaterThan(2);
  for (const reveal of await reveals.all()) {
    await expect(reveal).toBeVisible();
    await expect(reveal).toHaveCSS('opacity', '1');
    await expect(reveal).toHaveCSS('transform', 'none');
    await expect(reveal).toHaveCSS('clip-path', 'none');
    expect(await reveal.evaluate((node) => node.getAnimations().length)).toBe(0);
  }
}

async function placeBlock(page: Page, block: Locator, top: number): Promise<number> {
  await block.evaluate((node, viewportTop) => {
    // Ignore any animated translation when locating the document-space edge.
    let documentTop = 0;
    for (let element = node as HTMLElement | null; element; element = element.offsetParent as HTMLElement | null) {
      documentTop += element.offsetTop;
    }
    window.scrollTo({ top: documentTop - viewportTop, behavior: 'instant' });
  }, top);
  await expect.poll(async () => Math.abs(await block.evaluate((node) => node.getBoundingClientRect().top) - top)).toBeLessThan(1);
  return page.evaluate(() => window.scrollY);
}

for (const locale of ['en', 'es'] as const) {
  for (const theme of ['light', 'dark'] as const) {
    test.describe(`${locale} / ${theme}`, () => {
      test.use({
        viewport: { width: 1440, height: 1000 },
        colorScheme: theme,
        reducedMotion: 'no-preference',
      });

      test.describe('without JavaScript', () => {
        test.use({ javaScriptEnabled: false });

        test('keeps every server-rendered Reveal static before and after scrolling', async ({ page }) => {
          await page.goto(`/${locale}`);
          // CSS support and disabled JavaScript are independent conditions.
          expect(await page.evaluate(() => CSS.supports('animation-timeline: view()'))).toBe(true);
          await expectStaticReveals(page);

          for (const progress of [0.5, 1, 0.5, 0]) {
            const target = await page.evaluate((fraction) => {
              const top = (document.documentElement.scrollHeight - innerHeight) * fraction;
              window.scrollTo({ top, behavior: 'instant' });
              return top;
            }, progress);
            await expect.poll(async () => Math.abs(await page.evaluate(() => scrollY) - target)).toBeLessThan(1);
            await expectStaticReveals(page);
          }
        });
      });

      test('enables reversible entry, reading and exit after hydration', async ({ page }) => {
        await page.goto(`/${locale}`);
        const block = page.locator('#about [data-reveal-root]').first();
        await expect(block).toBeVisible();
        const height = await block.evaluate((node) => node.getBoundingClientRect().height);
        await page.evaluate(() => {
          const spacer = document.createElement('div');
          spacer.style.height = '200vh';
          document.body.append(spacer);
        });

        await placeBlock(page, block, 900);
        await expect.poll(() => block.evaluate((node) => Number(getComputedStyle(node).opacity))).toBeLessThan(1);
        const entryScroll = await page.evaluate(() => scrollY);
        const entryOpacity = await block.evaluate((node) => Number(getComputedStyle(node).opacity));

        await placeBlock(page, block, 500);
        await expect(block).toHaveCSS('opacity', '1');
        // Move the complete block past the top edge to enter its exit range.
        await placeBlock(page, block, -height * 0.85);
        await expect.poll(() => block.evaluate((node) => Number(getComputedStyle(node).opacity))).toBeLessThan(1);
        await placeBlock(page, block, 500);
        await expect(block).toHaveCSS('opacity', '1');

        await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), entryScroll);
        await expect.poll(() => block.evaluate((node) => Number(getComputedStyle(node).opacity))).toBeCloseTo(entryOpacity, 2);
      });
    });
  }
}
