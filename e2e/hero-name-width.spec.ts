import { expect, test, type Page } from '@playwright/test';

const GRID_MAX_WIDTH = 1600;
const GUTTER_COMPACT = 24;
const GUTTER_WIDE = 48;
const BREAKPOINT = 768;

function contentWidthFor(viewportWidth: number): number {
  const gutter = viewportWidth < BREAKPOINT ? GUTTER_COMPACT : GUTTER_WIDE;
  return Math.min(viewportWidth - 2 * gutter, GRID_MAX_WIDTH);
}

async function blockWidth(page: Page): Promise<number> {
  return page.evaluate(() => {
    const gallardo = document.querySelector(
      'h1#hero-name span[aria-hidden="true"]:nth-of-type(3)',
    );
    return gallardo ? gallardo.getBoundingClientRect().width : 0;
  });
}

async function hasHorizontalScroll(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const root = document.documentElement;
    return root.scrollWidth > root.clientWidth + 1;
  });
}

test.describe('hero name width (RF-8)', () => {
  test('at 360, 768 and 1440 px the name covers at least 90%% of the content width', async ({
    page,
  }) => {
    for (const viewportWidth of [360, 768, 1440]) {
      await page.setViewportSize({ width: viewportWidth, height: 900 });
      await page.goto('/en');
      await page.waitForLoadState('networkidle');

      const width = await blockWidth(page);
      const expected = contentWidthFor(viewportWidth);
      const ratio = width / expected;

      expect(ratio).toBeGreaterThanOrEqual(0.9);
    }
  });

  test('at 320 px there is no horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto('/en');
    await page.waitForLoadState('networkidle');
    expect(await hasHorizontalScroll(page)).toBe(false);
  });

  test('from 1920 and 2560 px the name stops at the grid cap and does not grow', async ({
    page,
  }) => {
    const capped = contentWidthFor(1920);
    const expected = 0.9 * capped;

    for (const viewportWidth of [1920, 2560]) {
      await page.setViewportSize({ width: viewportWidth, height: 900 });
      await page.goto('/en');
      await page.waitForLoadState('networkidle');

      const width = await blockWidth(page);

      expect(width).toBeLessThanOrEqual(expected + 1);
      expect(width).toBeLessThanOrEqual(GRID_MAX_WIDTH * 0.9 + 1);
    }
  });

  test('sweep from 320 to 1920 px: no horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    for (let w = 320; w <= 1920; w += 80) {
      await page.setViewportSize({ width: w, height: 900 });
      expect(await hasHorizontalScroll(page)).toBe(false);
    }
  });

  test('text at 200%: no horizontal scroll and words stay on their own line', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    await page.evaluate(() => {
      document.documentElement.style.fontSize = '32px';
    });
    await page.waitForLoadState('networkidle');

    expect(await hasHorizontalScroll(page)).toBe(false);

    const lines = await page.locator(
      'h1#hero-name span[aria-hidden="true"]',
    ).count();
    expect(lines).toBeGreaterThanOrEqual(3);
  });
});
