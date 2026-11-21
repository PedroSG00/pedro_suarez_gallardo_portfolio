import { expect, test, type Page, type Locator } from '@playwright/test';
import enMessages from '../../messages/en.json';
import esMessages from '../../messages/es.json';

const VIEWPORTS = [
  {
    width: 1280,
    height: 1000,
    previousPortraitMax: 384,
    portraitMax: 448,
    compactGap: 32,
  },
  {
    width: 390,
    height: 844,
    previousPortraitMax: 320,
    portraitMax: 384,
    compactGap: 24,
  },
] as const;

const LOCALES = [
  { locale: 'en', name: enMessages.about.intro, messages: enMessages.about },
  { locale: 'es', name: esMessages.about.intro, messages: esMessages.about },
] as const;

type TargetGeometry = {
  documentTop: number;
  height: number;
  viewportHeight: number;
};

async function scrollToProgress(
  page: Page,
  { documentTop, height, viewportHeight }: TargetGeometry,
  progress: number,
): Promise<void> {
  const scrollY = documentTop - viewportHeight + progress * (viewportHeight + height);
  await page.evaluate(
    (position) => window.scrollTo({ top: position, behavior: 'instant' }),
    scrollY,
  );
  await page.evaluate(
    () =>
      new Promise<void>((resolveFrame) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolveFrame())),
      ),
  );
}

async function geometryFor(target: Locator): Promise<TargetGeometry> {
  return target.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      documentTop: rect.top + window.scrollY,
      height: rect.height,
      viewportHeight: window.innerHeight,
    };
  });
}

async function effectiveOpacity(target: Locator): Promise<number> {
  return target.evaluate((element) => {
    let opacity = 1;
    let current: HTMLElement | null = element as HTMLElement;
    while (current) {
      opacity *= Number.parseFloat(getComputedStyle(current).opacity);
      current = current.parentElement;
    }
    return opacity;
  });
}

async function openAbout(page: Page, locale: string, theme: 'light' | 'dark') {
  await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
  await page.setViewportSize({ width: VIEWPORTS[0].width, height: VIEWPORTS[0].height });
  await page.addInitScript((selectedTheme) => {
    localStorage.setItem('psg-theme', selectedTheme);
  }, theme);
  await page.goto(`/${locale}`);
  await page.evaluate(() => {
    // The remaining page sections are placeholders; keep enough runway to test exit.
    document.body.style.minHeight = '400vh';
  });
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  await page.evaluate(() => document.fonts.ready);
}

for (const { locale, name, messages } of LOCALES) {
  for (const theme of ['light', 'dark'] as const) {
    test(`About composition and reading work in ${locale}/${theme}`, async ({ page }) => {
      await openAbout(page, locale, theme);

      const about = page.getByRole('region', { name });
      const heading = about.getByRole('heading', { name });
      const statement = about.getByRole('group', { name: messages.statement });
      const portrait = about.getByRole('img', { name: messages.portraitAlt });
      const paragraphs = await about.getByRole('paragraph').all();
      const values = about.getByRole('list');
      const listItems = await about.getByRole('listitem').all();

      await expect(portrait).toBeVisible();
      await expect(paragraphs).toHaveLength(4);
      await expect(listItems).toHaveLength(5);
      await expect.poll(() => portrait.evaluate((image: HTMLImageElement) => image.naturalWidth))
        .toBeGreaterThan(0);

      const tokenBorder = await page.evaluate(() => {
        const probe = document.createElement('div');
        probe.style.borderTop = 'var(--line-width) solid var(--color-line)';
        document.body.append(probe);
        const style = getComputedStyle(probe);
        const border = {
          width: style.borderTopWidth,
          color: style.borderTopColor,
        };
        probe.remove();
        return border;
      });

      for (const viewport of VIEWPORTS) {
        await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));

        const [
          headingBox,
          statementBox,
          portraitBox,
          firstParagraphBox,
          lastParagraphBox,
          valuesBox,
        ] = await Promise.all([
          heading.boundingBox(),
          statement.boundingBox(),
          portrait.boundingBox(),
          paragraphs[0].boundingBox(),
          paragraphs.at(-1)?.boundingBox(),
          values.boundingBox(),
        ]);
        expect(headingBox).not.toBeNull();
        expect(statementBox).not.toBeNull();
        expect(portraitBox).not.toBeNull();
        expect(firstParagraphBox).not.toBeNull();
        expect(lastParagraphBox).not.toBeNull();
        expect(valuesBox).not.toBeNull();

        const portraitStyle = await portrait.evaluate((image: HTMLImageElement) => {
          const style = getComputedStyle(image);
          return {
            borderWidth: style.borderTopWidth,
            borderColor: style.borderTopColor,
            position: style.position,
            zIndex: style.zIndex,
            naturalWidth: image.naturalWidth,
            scrollWidth: image.scrollWidth,
            clientWidth: image.clientWidth,
          };
        });
        expect(portraitStyle.borderWidth).toBe(tokenBorder.width);
        expect(portraitStyle.borderColor).toBe(tokenBorder.color);
        expect(portraitStyle.position).toBe('relative');
        expect(portraitStyle.zIndex).toBe('1');
        expect(portraitStyle.naturalWidth).toBeGreaterThan(0);
        expect(portraitStyle.scrollWidth).toBeLessThanOrEqual(portraitStyle.clientWidth);
        expect(portraitBox!.width).toBeGreaterThan(viewport.previousPortraitMax);
        expect(portraitBox!.width).toBeLessThanOrEqual(viewport.portraitMax);
        expect(statementBox!.y - (headingBox!.y + headingBox!.height)).toBeLessThanOrEqual(
          viewport.compactGap,
        );
        expect(valuesBox!.y - (lastParagraphBox!.y + lastParagraphBox!.height)).toBeLessThanOrEqual(
          16,
        );

        const composition = await about.evaluate((section) => {
          const sectionBox = section.getBoundingClientRect();
          const image = section.querySelector('img')!;
          const visibleParagraphs = [...section.querySelectorAll('p')].filter(
            (paragraph) => paragraph.getAttribute('role') !== 'group',
          );
          const valueList = section.querySelector('[role="list"]')!;
          const rect = (element: Element) => element.getBoundingClientRect();
          const overlaps = (first: DOMRect, second: DOMRect) =>
            first.left < second.right &&
            first.right > second.left &&
            first.top < second.bottom &&
            first.bottom > second.top;
          const hasClippedAncestor = (element: Element) => {
            let ancestor: Element | null = element;
            while (ancestor && ancestor !== section) {
              const style = getComputedStyle(ancestor);
              if (
                ['hidden', 'clip'].includes(style.overflowX) ||
                ['hidden', 'clip'].includes(style.overflowY)
              ) {
                return true;
              }
              ancestor = ancestor.parentElement;
            }
            return false;
          };
          const serialize = (item: DOMRect) => ({
            top: item.top,
            right: item.right,
            bottom: item.bottom,
            left: item.left,
            width: item.width,
            height: item.height,
          });
          const imageRect = rect(image);
          const paragraphRects = visibleParagraphs.map(rect);
          const listRect = rect(valueList);
          return {
            sectionLeft: sectionBox.left,
            sectionRight: sectionBox.right,
            imageRect: serialize(imageRect),
            paragraphRects: paragraphRects.map(serialize),
            overlapsText:
              paragraphRects.some((item) => overlaps(imageRect, item)) ||
              overlaps(imageRect, listRect),
            clippedText: visibleParagraphs.some(hasClippedAncestor),
            pageWidth: document.documentElement.scrollWidth,
            viewportWidth: document.documentElement.clientWidth,
          };
        });

        expect(composition.pageWidth).toBeLessThanOrEqual(composition.viewportWidth);
        expect(composition.imageRect.left).toBeGreaterThanOrEqual(composition.sectionLeft);
        expect(composition.imageRect.right).toBeLessThanOrEqual(composition.sectionRight);
        expect(composition.overlapsText).toBe(false);
        expect(composition.clippedText).toBe(false);
        if (viewport.width === 1280) {
          expect(portraitBox!.x + portraitBox!.width).toBeLessThan(firstParagraphBox!.x);
          expect(Math.abs(portraitBox!.y - firstParagraphBox!.y)).toBeLessThanOrEqual(1);
          expect(firstParagraphBox!.x - (portraitBox!.x + portraitBox!.width)).toBeLessThanOrEqual(
            viewport.compactGap,
          );
        } else {
          expect(portraitBox!.y + portraitBox!.height).toBeLessThanOrEqual(
            firstParagraphBox!.y,
          );
        }

        for (let index = 1; index < composition.paragraphRects.length; index += 1) {
          const previous = composition.paragraphRects[index - 1];
          const next = composition.paragraphRects[index];
          expect(next.top - (previous.top + previous.height)).toBeLessThanOrEqual(16);
        }

        const targets = [statement, ...paragraphs, ...listItems, portrait];
        const readAt = await geometryFor(paragraphs[0]);
        await scrollToProgress(page, readAt, 0.5);
        for (const target of targets) {
          expect(await effectiveOpacity(target)).toBe(1);
        }

        await page.emulateMedia({ colorScheme: theme, reducedMotion: 'no-preference' });
        const movementTargets = [statement, paragraphs[0], ...listItems, portrait];
        for (const target of movementTargets) {
          const geometry = await geometryFor(target);
          const progressAtTop =
            geometry.viewportHeight / (geometry.viewportHeight + geometry.height);
          const beforeTop =
            (geometry.viewportHeight - 4) / (geometry.viewportHeight + geometry.height);
          const earlyExit = progressAtTop + (1 - progressAtTop) * 0.2;
          const halfwayOut = (1 + progressAtTop) / 2;

          await scrollToProgress(page, geometry, 0.05);
          const entering = await effectiveOpacity(target);
          expect(entering).toBeLessThan(1);
          await scrollToProgress(page, geometry, 0.5);
          expect(await effectiveOpacity(target)).toBe(1);
          await scrollToProgress(page, geometry, beforeTop);
          expect(await effectiveOpacity(target)).toBe(1);
          await scrollToProgress(page, geometry, earlyExit);
          expect(await effectiveOpacity(target)).toBe(1);
          await scrollToProgress(page, geometry, halfwayOut);
          expect(await effectiveOpacity(target)).toBeLessThan(1);
          await scrollToProgress(page, geometry, 0.5);
          expect(await effectiveOpacity(target)).toBe(1);
          await scrollToProgress(page, geometry, 0.05);
          expect(await effectiveOpacity(target)).toBeCloseTo(entering, 2);
        }
      }
    });
  }
}

test('Hero copy reaches full opacity early and stays readable until near viewport exit', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });

  for (const viewport of VIEWPORTS) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/en');
    await page.evaluate(() => document.fonts.ready);

    const role = page.getByText('Full-stack developer', { exact: true });
    await expect(role).toBeVisible();
    const geometry = await geometryFor(role);
    const nearUpperEdge = (geometry.viewportHeight * 0.8) /
      (geometry.viewportHeight + geometry.height);
    const progressAtTop =
      geometry.viewportHeight / (geometry.viewportHeight + geometry.height);
    const halfwayOut = (1 + progressAtTop) / 2;

    if (geometry.documentTop > geometry.viewportHeight * 0.8) {
      await scrollToProgress(page, geometry, 0.05);
      expect(await effectiveOpacity(role)).toBeLessThan(1);
      await scrollToProgress(page, geometry, 0.2);
      expect(await effectiveOpacity(role)).toBe(1);
    }
    await scrollToProgress(page, geometry, 0.5);
    expect(await effectiveOpacity(role)).toBe(1);
    await scrollToProgress(page, geometry, nearUpperEdge);
    expect(await effectiveOpacity(role)).toBe(1);
    await expect(page.getByRole('heading', { name: 'About', exact: true })).toBeInViewport();
    await scrollToProgress(page, geometry, halfwayOut);
    expect(await effectiveOpacity(role)).toBeLessThan(1);
    await scrollToProgress(page, geometry, 0.5);
    expect(await effectiveOpacity(role)).toBe(1);
  }
});
