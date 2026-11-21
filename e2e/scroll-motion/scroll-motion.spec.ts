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

test.describe('Scroll motion reveal (RF-01, RF-02, RF-06)', () => {
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
        <section class="reveal" data-reveal-root data-reveal-ready role="group" aria-label="Scroll content">
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

  test('has opacity below one as its top edge enters the lower 15% of the viewport', async ({
    page,
  }) => {
    await mountRevealFixture(page);

    const { opacity } = await scrollBlockTopTo(page, VIEWPORT_HEIGHT * 0.85);

    expect(opacity).toBeLessThan(1);
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

    const { opacity } = await scrollBlockTopTo(
      page,
      VIEWPORT_HEIGHT * 0.15 - BLOCK_HEIGHT,
    );

    expect(opacity).toBeLessThan(1);
  });
});

test.describe('Reduced motion (RF-10)', () => {
  async function mountReducedMotionFixture(page: Page): Promise<void> {
    const revealStyles = await readFile(REVEAL_STYLES_PATH, 'utf8');

    await page.setViewportSize({ width: 1280, height: VIEWPORT_HEIGHT });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setContent(`
      <style>
        html, body { margin: 0; }
        :root { --motion-distance: ${MOTION_DISTANCE}; }
        body { min-height: 3000px; }
        main { min-height: 3000px; padding-top: ${BLOCK_DOCUMENT_TOP}px; }
        [data-reveal-root] { height: ${BLOCK_HEIGHT}px; }
      </style>
      <main>
        <section class="reveal" data-reveal-root data-reveal-ready role="group" aria-label="Scroll content">
          <span data-reveal-entry-marker aria-hidden="true"></span>
          <span data-reveal-exit-marker aria-hidden="true"></span>
          <h2>Scroll content</h2>
        </section>
      </main>
    `);
    await page.addStyleTag({ content: revealStyles });
  }

  test('shows all blocks fully visible with no animation', async ({ page }) => {
    await mountReducedMotionFixture(page);

    await page.evaluate(
      (scrollY) => window.scrollTo(0, scrollY),
      BLOCK_DOCUMENT_TOP - VIEWPORT_HEIGHT * 0.5,
    );
    await page.evaluate(
      () => new Promise<void>((resolveFrame) => requestAnimationFrame(() => resolveFrame())),
    );

    const reveal = page.getByRole('group', { name: 'Scroll content' });
    const opacity = await reveal.evaluate((el) => Number(getComputedStyle(el).opacity));
    const transformY = await reveal.evaluate(
      (el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42,
    );

    expect(opacity).toBe(1);
    expect(transformY).toBe(0);
  });
});

test.describe('Print mode (RF-16)', () => {
  async function mountPrintFixture(page: Page): Promise<void> {
    const revealStyles = await readFile(REVEAL_STYLES_PATH, 'utf8');

    await page.setViewportSize({ width: 1280, height: VIEWPORT_HEIGHT });
    await page.emulateMedia({ media: 'print' });
    await page.setContent(`
      <style>
        html, body { margin: 0; }
        :root { --motion-distance: ${MOTION_DISTANCE}; }
        body { min-height: 3000px; }
        main { min-height: 3000px; padding-top: ${BLOCK_DOCUMENT_TOP}px; }
        [data-reveal-root] { height: ${BLOCK_HEIGHT}px; }
      </style>
      <main>
        <section class="reveal" data-reveal-root data-reveal-ready role="group" aria-label="Scroll content">
          <span data-reveal-entry-marker aria-hidden="true"></span>
          <span data-reveal-exit-marker aria-hidden="true"></span>
          <h2>Scroll content</h2>
        </section>
      </main>
    `);
    await page.addStyleTag({ content: revealStyles });
  }

  test('shows all blocks at opacity 1 with no displacement in print', async ({ page }) => {
    await mountPrintFixture(page);

    await page.evaluate(
      (scrollY) => window.scrollTo(0, scrollY),
      BLOCK_DOCUMENT_TOP - VIEWPORT_HEIGHT * 0.5,
    );
    await page.evaluate(
      () => new Promise<void>((resolveFrame) => requestAnimationFrame(() => resolveFrame())),
    );

    const reveal = page.getByRole('group', { name: 'Scroll content' });
    const opacity = await reveal.evaluate((el) => Number(getComputedStyle(el).opacity));
    const transformY = await reveal.evaluate(
      (el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42,
    );

    expect(opacity).toBe(1);
    expect(transformY).toBe(0);
  });
});

test.describe('Resize and rotation (RF-08)', () => {
  async function mountResizeFixture(page: Page): Promise<void> {
    const revealStyles = await readFile(REVEAL_STYLES_PATH, 'utf8');

    await page.setViewportSize({ width: 1280, height: VIEWPORT_HEIGHT });
    await page.setContent(`
      <style>
        html, body { margin: 0; }
        :root { --motion-distance: ${MOTION_DISTANCE}; }
        body { min-height: 3000px; }
        main { min-height: 3000px; padding-top: ${BLOCK_DOCUMENT_TOP}px; }
        [data-reveal-root] { height: ${BLOCK_HEIGHT}px; }
      </style>
      <main>
        <section class="reveal" data-reveal-root data-reveal-ready role="group" aria-label="Scroll content">
          <span data-reveal-entry-marker aria-hidden="true"></span>
          <span data-reveal-exit-marker aria-hidden="true"></span>
          <h2>Scroll content</h2>
        </section>
      </main>
    `);
    await page.addStyleTag({ content: revealStyles });
  }

  test('keeps stable blocks at opacity 1 after resize and rotation', async ({ page }) => {
    await mountResizeFixture(page);

    await page.evaluate(
      (scrollY) => window.scrollTo(0, scrollY),
      BLOCK_DOCUMENT_TOP - VIEWPORT_HEIGHT * 0.65,
    );
    await page.evaluate(
      () => new Promise<void>((resolveFrame) => requestAnimationFrame(() => resolveFrame())),
    );

    const reveal = page.getByRole('group', { name: 'Scroll content' });
    const before = await reveal.evaluate((el) => Number(getComputedStyle(el).opacity));

    await page.setViewportSize({ width: 800, height: 600 });
    await page.evaluate(
      () => new Promise<void>((resolveFrame) => requestAnimationFrame(() => resolveFrame())),
    );
    await page.setViewportSize({ width: 600, height: 800 });
    await page.evaluate(
      () => new Promise<void>((resolveFrame) => requestAnimationFrame(() => resolveFrame())),
    );
    // Reposition so the block sits in the stable band of the new viewport.
    await page.evaluate(
      (scrollY) => window.scrollTo(0, scrollY),
      BLOCK_DOCUMENT_TOP - VIEWPORT_HEIGHT * 0.5,
    );
    await page.evaluate(
      () => new Promise<void>((resolveFrame) => requestAnimationFrame(() => resolveFrame())),
    );

    const after = await reveal.evaluate((el) => Number(getComputedStyle(el).opacity));

    expect(before).toBe(1);
    expect(after).toBe(1);
  });
});

test.describe('Language and theme change (RF-09)', () => {
  async function mountLocaleFixture(page: Page): Promise<void> {
    const revealStyles = await readFile(REVEAL_STYLES_PATH, 'utf8');

    await page.setViewportSize({ width: 1280, height: VIEWPORT_HEIGHT });
    await page.setContent(`
      <style>
        html, body { margin: 0; }
        :root { --motion-distance: ${MOTION_DISTANCE}; }
        body { min-height: 3000px; }
        main { min-height: 3000px; padding-top: ${BLOCK_DOCUMENT_TOP}px; }
        [data-reveal-root] { height: ${BLOCK_HEIGHT}px; }
      </style>
      <main>
        <section class="reveal" data-reveal-root data-reveal-ready role="group" aria-label="Scroll content">
          <span data-reveal-entry-marker aria-hidden="true"></span>
          <span data-reveal-exit-marker aria-hidden="true"></span>
          <h2>Scroll content</h2>
        </section>
      </main>
    `);
    await page.addStyleTag({ content: revealStyles });
  }

  test('keeps blocks at opacity 1 after language and theme change', async ({ page }) => {
    await mountLocaleFixture(page);

    await page.evaluate(
      (scrollY) => window.scrollTo(0, scrollY),
      BLOCK_DOCUMENT_TOP - VIEWPORT_HEIGHT * 0.65,
    );
    await page.evaluate(
      () => new Promise<void>((resolveFrame) => requestAnimationFrame(() => resolveFrame())),
    );

    const reveal = page.getByRole('group', { name: 'Scroll content' });
    const before = await reveal.evaluate((el) => Number(getComputedStyle(el).opacity));

    await page.evaluate(() => {
      document.documentElement.lang = 'es';
      document.documentElement.dataset.theme = 'dark';
    });
    await page.evaluate(
      () => new Promise<void>((resolveFrame) => requestAnimationFrame(() => resolveFrame())),
    );

    const after = await reveal.evaluate((el) => Number(getComputedStyle(el).opacity));

    expect(before).toBe(1);
    expect(after).toBe(1);
  });
});

test.describe('Last section without exit (RF-04)', () => {
  async function mountLastSectionFixture(page: Page): Promise<void> {
    const revealStyles = await readFile(REVEAL_STYLES_PATH, 'utf8');

    await page.setViewportSize({ width: 1280, height: VIEWPORT_HEIGHT });
    await page.setContent(`
      <style>
        html, body { margin: 0; }
        :root { --motion-distance: ${MOTION_DISTANCE}; }
        body { min-height: 1200px; }
        main { min-height: 1200px; padding-top: ${BLOCK_DOCUMENT_TOP}px; }
        [data-reveal-root] { height: ${BLOCK_HEIGHT}px; }
      </style>
      <main>
        <section class="reveal" data-reveal-root data-reveal-ready role="group" aria-label="Last section">
          <span data-reveal-entry-marker aria-hidden="true"></span>
          <span data-reveal-exit-marker aria-hidden="true"></span>
          <h2>Last section</h2>
        </section>
      </main>
    `);
    await page.addStyleTag({ content: revealStyles });
  }

  test('shows opacity 1 at the end of the page with no exit phase', async ({ page }) => {
    await mountLastSectionFixture(page);

    await page.evaluate(
      (scrollY) => window.scrollTo(0, scrollY),
      BLOCK_DOCUMENT_TOP - VIEWPORT_HEIGHT * 0.5,
    );
    await page.evaluate(
      () => new Promise<void>((resolveFrame) => requestAnimationFrame(() => resolveFrame())),
    );

    const reveal = page.getByRole('group', { name: 'Last section' });
    const opacity = await reveal.evaluate((el) => Number(getComputedStyle(el).opacity));
    const transformY = await reveal.evaluate(
      (el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42,
    );

    expect(opacity).toBe(1);
    expect(transformY).toBe(0);
  });
});

test.describe('Navbar does not participate in reveal (RF-3, RF-10)', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/en');
    await page.waitForLoadState('networkidle');
  });

  test('navbar keeps opacity 1 and no displacement while scrolling', async ({
    page,
  }) => {
    const navbar = page.locator('header');
    await expect(navbar).toBeVisible();
    await expect(navbar).toHaveCSS('opacity', '1');

    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(300);

    await expect(navbar).toHaveCSS('opacity', '1');
    const transform = await navbar.evaluate(
      (el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42,
    );
    expect(transform).toBe(0);
  });
});

test.describe('Hero does not cover destination on anchor arrival (RF-10, RF-13)', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' });
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  for (const [locale, label] of [['en', 'Work'], ['es', 'Trabajo']]) {
    test(`/${locale}: destination heading visible below navbar`, async ({ baseURL, page }) => {
      await page.goto(`/${locale}`);
      await page.waitForLoadState('networkidle');

      await page.getByRole('link', { name: label }).click();
      await expect(page.url()).toBe(new URL(`/${locale}#work`, baseURL).toString());

      const heading = page.getByRole('heading', { level: 2, name: label });
      await expect(heading).toBeVisible();

      // The heading is not covered by the hero: it sits below the navbar.
      const navbar = page.locator('header');
      const headingBox = await heading.boundingBox();
      const navbarBox = await navbar.boundingBox();
      expect(headingBox!.y).toBeGreaterThanOrEqual(navbarBox!.y + navbarBox!.height);
    });
  }
});
