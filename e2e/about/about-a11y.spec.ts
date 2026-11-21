import { expect, test } from '@playwright/test';
import {
  ABOUT_LOCALES,
  THEMES,
  THEME_COLORS,
  VIEWPORT_HEIGHT,
  auditReadingContrast,
  awaitStatementSettled,
  expectReadingContrast,
  expectedWordStyles,
  getEffectiveOpacity,
  getScrollTargetGeometry,
  getStatementWords,
  getVisualState,
  openAbout,
  readTextPaint,
  scrollElementToProgress,
  type TextPaint,
} from './about-helpers';

for (const { locale, messages } of ABOUT_LOCALES) {
  for (const theme of THEMES) {
    test.describe(`About audit in ${locale}/${theme}`, () => {
      test('renders localized content without interactive qualities', async ({ page }) => {
        const about = await openAbout(page, locale, { theme });
        const heading = about.getByRole('heading', { name: messages.intro, exact: true });
        const portrait = about.getByRole('img', { name: messages.portraitAlt });
        const listItems = await about.getByRole('listitem').all();

        await expect(about).toBeVisible();
        await expect(heading).toHaveCount(1);
        await expect(about.getByRole('group', { name: messages.statement })).toBeVisible();
        await expect(about.getByRole('paragraph')).toHaveCount(4);
        await expect(about.getByRole('list')).toBeVisible();
        expect(listItems).toHaveLength(5);
        await expect(portrait).toBeVisible();
        await expect.poll(() => portrait.evaluate((image: HTMLImageElement) => image.naturalWidth))
          .toBeGreaterThan(0);

        for (const paragraph of Object.values(messages.paragraphs)) {
          await expect(about.getByText(paragraph, { exact: true })).toBeVisible();
        }
        for (const value of Object.values(messages.values)) {
          await expect(about.getByRole('listitem').getByText(value, { exact: true })).toBeVisible();
        }
        for (const item of listItems) {
          await expect(item.getByRole('link')).toHaveCount(0);
          await expect(item.getByRole('button')).toHaveCount(0);
          expect(await item.getAttribute('tabindex')).toBeNull();
        }

        const background = await page
          .locator('body')
          .evaluate((element) => getComputedStyle(element).backgroundColor);
        expect(background).toBe(THEME_COLORS[theme].background);
      });

      test('lights statement words cumulatively across the whole scroll range, forward and back', async ({ page }) => {
        const about = await openAbout(page, locale, { theme });
        const statement = about.getByRole('group', { name: messages.statement });
        const geometry = await getScrollTargetGeometry(statement);
        const wordCount = getStatementWords(statement, messages.statement).length;
        const readingEnd = (geometry.viewportHeight - 4) / (geometry.viewportHeight + geometry.height);
        const boundaries = Array.from({ length: wordCount - 1 }, (_, index) => (index + 1) / wordCount)
          .flatMap((boundary) => [boundary - 0.005, boundary + 0.005]);
        const checkpoints = [-0.002, 0.05, 0.21, 0.5, readingEnd, 0.99, 1.002, ...boundaries]
          .sort((first, second) => first - second);

        for (const progress of [...checkpoints, ...checkpoints.slice(0, -1).reverse()]) {
          await scrollElementToProgress(page, geometry, progress);
          await awaitStatementSettled(page, messages.statement);
          const actualScrollY = await page.evaluate(() => window.scrollY);
          const actualProgress =
            (actualScrollY - (geometry.documentTop - geometry.viewportHeight)) /
            (geometry.viewportHeight + geometry.height);
          const litCount = Math.floor(actualProgress * wordCount);
          const wordStyles = await getVisualState(page, messages.statement);

          expect(wordStyles, `progression at ${progress}`)
            .toEqual(expectedWordStyles(wordCount, litCount, theme));
          if (progress === 0.05 || progress === 0.99) {
            expect(await getEffectiveOpacity(statement), `fade at ${progress}`).toBeLessThan(1);
          }
        }
      });

      test('keeps AA contrast for every text while reading', async ({ page }) => {
        const about = await openAbout(page, locale, { theme });
        const heading = about.getByRole('heading', { name: messages.intro, exact: true });
        const statement = about.getByRole('group', { name: messages.statement });
        const words = getStatementWords(statement, messages.statement);
        const geometry = await getScrollTargetGeometry(statement);
        const readingEnd = (geometry.viewportHeight - 4) / (geometry.viewportHeight + geometry.height);
        const ratios: number[] = [];

        // Statement words at the start, middle and end of the reading plateau.
        for (const progress of [0.21, 0.5, readingEnd]) {
          await scrollElementToProgress(page, geometry, progress);
          await awaitStatementSettled(page, messages.statement);
          ratios.push(...await Promise.all(words.map((word, index) =>
            auditReadingContrast(word, `${locale}/${theme} word ${index + 1} at ${progress}`),
          )));
        }

        const readingTargets = [
          { target: heading, text: messages.intro },
          { target: heading.getByText('01 /', { exact: true }), text: '01 /' },
          ...[...Object.values(messages.paragraphs), ...Object.values(messages.values)]
            .map((text) => ({ target: about.getByText(text, { exact: true }), text })),
        ];
        for (const { target, text } of readingTargets) {
          // Re-scroll inside the poll: under parallel load the first instant
          // scroll may not have settled when styles are read.
          await expect.poll(async () => {
            await scrollElementToProgress(page, await getScrollTargetGeometry(target), 0.5);
            await expect(target).toBeInViewport();
            const { opacity, transitioning } = await target.evaluate(readTextPaint);
            return { opacity, transitioning };
          }, { message: `${locale}/${theme}: ${text} stable reading`, timeout: 15000 })
            .toEqual({ opacity: 1, transitioning: false });
          ratios.push(await auditReadingContrast(target, `${locale}/${theme}: ${text}`));
        }
        test.info().annotations.push({
          type: 'Minimum reading contrast',
          description: Math.min(...ratios).toFixed(3),
        });
      });

      test('is static and AA from its first reduced-motion frame', async ({ page }) => {
        type FirstFrame = { animations: number; paints: Array<TextPaint & { text: string }> };
        await page.setViewportSize({ width: 1280, height: VIEWPORT_HEIGHT });
        await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
        // Register before navigation. Capture once the server markup and the
        // render-blocking styles exist, regardless of computed visibility.
        await page.addInitScript({ content: `
          const readAboutTextPaint = ${readTextPaint.toString()};
          function snapshotAboutFrame() {
            const about = document.getElementById('about');
            const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
            if (!about?.querySelector('[role="img"]') || !styles.length || styles.some(link => !link.sheet)) {
              requestAnimationFrame(snapshotAboutFrame);
              return;
            }
            const paints = [];
            const walker = document.createTreeWalker(about, NodeFilter.SHOW_TEXT);
            for (let node = walker.nextNode(); node; node = walker.nextNode()) {
              const text = node.textContent.trim();
              const element = node.parentElement;
              if (text && element && !element.matches('script, style')) {
                paints.push({ text, ...readAboutTextPaint(element) });
              }
            }
            window.aboutFirstFrame = {
              animations: about.getAnimations({ subtree: true }).length,
              paints,
            };
          }
          requestAnimationFrame(snapshotAboutFrame);
        ` });
        await page.goto(`/${locale}`, { waitUntil: 'domcontentloaded' });
        const firstFrame = () => page.evaluate(
          () => (window as Window & { aboutFirstFrame?: FirstFrame }).aboutFirstFrame,
        );
        await expect.poll(firstFrame).toBeDefined();
        const { animations, paints } = (await firstFrame())!;
        expect(animations).toBe(0);

        const words = messages.statement.split(/\s+/);
        expect(paints.map(({ text }) => text)).toEqual(expect.arrayContaining([
          messages.intro, ...words, ...Object.values(messages.paragraphs), ...Object.values(messages.values),
        ]));
        const ratios = paints.map((paint) => {
          expect(`rgb(${paint.paper.join(', ')})`, paint.text).toBe(THEME_COLORS[theme].background);
          if (words.includes(paint.text)) {
            expect(paint.fontWeight, paint.text).toBe('700');
            expect(`rgb(${paint.ink.join(', ')})`, paint.text).toBe(THEME_COLORS[theme].ink);
          }
          return expectReadingContrast(paint, `${locale}/${theme} first frame: ${paint.text}`);
        });
        test.info().annotations.push({
          type: 'Minimum first-frame contrast',
          description: Math.min(...ratios).toFixed(3),
        });
      });
    });
  }
}
