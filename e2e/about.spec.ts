import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const STATEMENT_STYLES_PATH = resolve(
  process.cwd(),
  'src/components/sections/AboutStatement/AboutStatement.module.css',
);
const VIEWPORT_HEIGHT = 1000;
const STATEMENT_HEIGHT = 300;
const STATEMENT_DOCUMENT_TOP = 1000;

const STATEMENTS = {
  en: "Complexity is where I'm calmest.",
  es: 'La complejidad es donde estoy más tranquilo.',
} as const;

const ABOUT_PROBLEM =
  'Large data sets, live updates, complex forms, and state people can rely on. That is the work teams trust me with—and the work I enjoy most.';
const ABOUT_VALUES = [
  'Detail-oriented',
  'Analytical',
  'Autonomous',
  'Teamwork',
  'Continuous learning',
];
const PORTRAIT_NAME = 'Portrait of Pedro Suárez Gallardo';

const THEME_COLORS = {
  light: {
    background: 'rgb(242, 239, 230)',
    ink: 'rgb(18, 17, 16)',
    muted: 'rgb(90, 87, 79)',
  },
  dark: {
    background: 'rgb(18, 17, 16)',
    ink: 'rgb(242, 239, 230)',
    muted: 'rgb(169, 164, 154)',
  },
} as const;

function getContrastRatio(foreground: string, background: string): number {
  const luminance = (color: string) => {
    const channels = color.match(/\d+/g)?.map(Number);
    if (!channels || channels.length !== 3) {
      throw new Error(`Unexpected computed color: ${color}`);
    }

    const [red, green, blue] = channels.map((channel) => {
      const normalized = channel / 255;
      return normalized <= 0.04045
        ? normalized / 12.92
        : ((normalized + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  };

  const foregroundLuminance = luminance(foreground);
  const backgroundLuminance = luminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

async function mountStatement(
  page: Page,
  text: string,
  theme: 'light' | 'dark',
): Promise<void> {
  const styles = await readFile(STATEMENT_STYLES_PATH, 'utf8');
  const words = text.split(/(\s+)/);
  const wordCount = words.filter((word) => !/^\s+$/.test(word)).length;
  let wordIndex = 0;
  const visualText = words
    .map((word) => {
      if (/^\s+$/.test(word)) return word;
      wordIndex += 1;
      const boundary = `${(wordIndex / wordCount) * 100}%`;
      return `<span data-about-statement-word style="--about-statement-boundary: ${boundary}">${word}</span>`;
    })
    .join('');

  await page.setViewportSize({ width: 1280, height: VIEWPORT_HEIGHT });
  await page.setContent(`
    <style>
      html, body { margin: 0; }
      p { margin: 0; }
      :root {
        color-scheme: ${theme};
        --color-ink: light-dark(#121110, #f2efe6);
        --color-ink-muted: light-dark(#5a574f, #a9a49a);
        --color-surface: light-dark(#f2efe6, #121110);
      }
      body { min-height: 3000px; }
      main { min-height: 3000px; padding-top: ${STATEMENT_DOCUMENT_TOP}px; }
      [data-about-statement] { height: ${STATEMENT_HEIGHT}px; }
      body { background: var(--color-surface); }
    </style>
    <main>
      <p data-about-statement role="group" aria-label="${text}">
        <span data-about-statement-content aria-hidden="true">${visualText}</span>
      </p>
    </main>
  `);
  await page.addStyleTag({ content: styles });
}

async function scrollToProgress(page: Page, progress: number): Promise<void> {
  const scrollY =
    STATEMENT_DOCUMENT_TOP -
    VIEWPORT_HEIGHT +
    progress * (VIEWPORT_HEIGHT + STATEMENT_HEIGHT);
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

type ScrollTargetGeometry = {
  documentTop: number;
  height: number;
  viewportHeight: number;
};

async function getScrollTargetGeometry(
  element: ReturnType<Page['getByText']>,
): Promise<ScrollTargetGeometry> {
  return element.evaluate((node) => {
    const rect = node.getBoundingClientRect();
    return {
      documentTop: rect.top + window.scrollY,
      height: rect.height,
      viewportHeight: window.innerHeight,
    };
  });
}

async function scrollElementToProgress(
  page: Page,
  { documentTop, height, viewportHeight }: ScrollTargetGeometry,
  progress: number,
): Promise<void> {
  const scrollY =
    documentTop - viewportHeight + progress * (viewportHeight + height);
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

async function getEffectiveOpacity(
  element: ReturnType<Page['getByText']>,
): Promise<number> {
  return element.evaluate((node) => {
    let opacity = 1;
    let current: HTMLElement | null = node as HTMLElement;

    while (current) {
      opacity *= Number.parseFloat(window.getComputedStyle(current).opacity);
      current = current.parentElement;
    }

    return opacity;
  });
}

async function getVisualState(page: Page, text: string): Promise<Array<{
  color: string;
  fontWeight: string;
}>> {
  const group = page.getByRole('group', { name: text });
  return Promise.all(
    text.split(/\s+/).map(async (word) =>
      group.getByText(word, { exact: true }).evaluate((element) => {
        const styles = window.getComputedStyle(element);
        return { color: styles.color, fontWeight: styles.fontWeight };
      }),
    ),
  );
}

for (const [locale, text] of Object.entries(STATEMENTS)) {
  for (const theme of ['light', 'dark'] as const) {
    test(`About statement progresses and reverses in ${locale}/${theme}`, async ({ page }) => {
      await mountStatement(page, text, theme);
      const group = page.getByRole('group', { name: text });
      const wordCount = text.trim().split(/\s+/).length;
      const firstBoundary = 1 / wordCount;
      const secondBoundary = 2 / wordCount;
      const boundaryOffset = 0.01;
      await expect(group).toBeVisible();

      const initial = await getVisualState(page, text);
      expect(initial.every((word) => word.fontWeight === '400')).toBe(true);
      expect(initial.every((word) => word.color === THEME_COLORS[theme].muted)).toBe(true);
      expect(
        initial.every(
          (word) =>
            getContrastRatio(word.color, THEME_COLORS[theme].background) >= 4.5,
        ),
      ).toBe(true);

      await scrollToProgress(page, firstBoundary - boundaryOffset);
      expect((await getVisualState(page, text)).every((word) => word.fontWeight === '400')).toBe(
        true,
      );

      await scrollToProgress(page, firstBoundary + boundaryOffset);
      const firstLit = await getVisualState(page, text);
      expect(firstLit[0].fontWeight).toBe('700');
      expect(firstLit.slice(1).every((word) => word.fontWeight === '400')).toBe(true);
      expect(firstLit[0].color).toBe(THEME_COLORS[theme].ink);
      expect(firstLit.slice(1).every((word) => word.color === THEME_COLORS[theme].muted)).toBe(
        true,
      );
      expect(
        firstLit.every(
          (word) =>
            getContrastRatio(word.color, THEME_COLORS[theme].background) >= 4.5,
        ),
      ).toBe(true);

      await scrollToProgress(page, secondBoundary + boundaryOffset);
      const accumulated = await getVisualState(page, text);
      expect(accumulated.slice(0, 2).every((word) => word.fontWeight === '700')).toBe(true);
      expect(accumulated.slice(2).every((word) => word.fontWeight === '400')).toBe(true);
      expect(accumulated.slice(0, 2).every((word) => word.color === THEME_COLORS[theme].ink)).toBe(
        true,
      );
      expect(
        accumulated.slice(2).every((word) => word.color === THEME_COLORS[theme].muted),
      ).toBe(true);

      await scrollToProgress(page, 0.99);
      const beforeFinalBoundary = await getVisualState(page, text);
      expect(beforeFinalBoundary.slice(0, -1).every((word) => word.fontWeight === '700')).toBe(
        true,
      );
      expect(beforeFinalBoundary.at(-1)?.fontWeight).toBe('400');
      expect(
        beforeFinalBoundary
          .slice(0, -1)
          .every((word) => word.color === THEME_COLORS[theme].ink),
      ).toBe(true);
      expect(beforeFinalBoundary.at(-1)?.color).toBe(THEME_COLORS[theme].muted);

      await scrollToProgress(page, 1);
      const final = await getVisualState(page, text);
      expect(final.every((word) => word.fontWeight === '700')).toBe(true);
      expect(final.every((word) => word.color === THEME_COLORS[theme].ink)).toBe(true);
      expect(
        final.every(
          (word) =>
            getContrastRatio(word.color, THEME_COLORS[theme].background) >= 4.5,
        ),
      ).toBe(true);

      await scrollToProgress(page, secondBoundary - boundaryOffset);
      const reversed = await getVisualState(page, text);
      expect(reversed[0].fontWeight).toBe('700');
      expect(reversed.slice(1).every((word) => word.fontWeight === '400')).toBe(true);
      expect(reversed[0].color).toBe(THEME_COLORS[theme].ink);
      expect(reversed.slice(1).every((word) => word.color === THEME_COLORS[theme].muted)).toBe(
        true,
      );
    });
  }
}

async function openAbout(page: Page, locale: string) {
  await page.setViewportSize({ width: 1280, height: VIEWPORT_HEIGHT });
  await page.goto(`/${locale}`);
  await page.evaluate(() => {
    // The following sections are placeholders; leave enough runway to verify
    // that About's final block can exit before the page itself ends.
    document.body.style.minHeight = '400vh';
  });

  return page.getByRole('region', { name: locale === 'en' ? 'About' : 'Sobre mí' });
}

for (const [locale, text] of Object.entries(STATEMENTS)) {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`About keeps content at full opacity while reading in ${locale}/${colorScheme}`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme, reducedMotion: 'no-preference' });
      const about = await openAbout(page, locale);
      const statement = about.getByRole('group', { name: text });
      const paragraphs = about.getByRole('paragraph');
      const qualities = about.getByRole('listitem');
      const portrait = about.getByRole('img');

      await expect(statement).toBeVisible();
      await expect(paragraphs).toHaveCount(4);
      await expect(qualities).toHaveCount(5);
      await expect(portrait).toBeVisible();
      await page.evaluate(() => document.fonts.ready);

      const targets = [statement, ...await paragraphs.all(), ...await qualities.all(), portrait];
      for (const target of targets) {
        const label = (await target.textContent())?.trim() || 'portrait';
        const geometry = await getScrollTargetGeometry(target);
        const progressAtTop = geometry.viewportHeight / (geometry.viewportHeight + geometry.height);
        const beforeTop = (geometry.viewportHeight - 4) / (geometry.viewportHeight + geometry.height);
        const halfwayOut = (1 + progressAtTop) / 2;

        await scrollElementToProgress(page, geometry, 0.05);
        const entering = await getEffectiveOpacity(target);
        expect(entering, `${label}: entering`).toBeLessThan(1);
        for (const progress of [0.2, 0.5, beforeTop]) {
          await scrollElementToProgress(page, geometry, progress);
          expect(await getEffectiveOpacity(target), `${label}: reading at ${progress}`).toBe(1);
        }
        await scrollElementToProgress(page, geometry, halfwayOut);
        expect(await getEffectiveOpacity(target), `${label}: exiting`).toBeLessThan(1);
        await scrollElementToProgress(page, geometry, beforeTop);
        expect(await getEffectiveOpacity(target), `${label}: reading again`).toBe(1);
        await scrollElementToProgress(page, geometry, 0.05);
        expect(await getEffectiveOpacity(target), `${label}: back to entry`).toBeCloseTo(entering, 2);
      }

      const geometry = await getScrollTargetGeometry(statement);
      await scrollElementToProgress(page, geometry, 0.15);
      const initialWords = await getVisualState(page, text);
      await scrollElementToProgress(page, geometry, 0.55);
      expect(await getVisualState(page, text)).not.toEqual(initialWords);
      await scrollElementToProgress(page, geometry, 0.15);
      expect(await getVisualState(page, text)).toEqual(initialWords);

      await page.emulateMedia({ reducedMotion: 'reduce' });
      for (const progress of [0.05, 0.5, 0.99]) {
        await scrollElementToProgress(page, geometry, progress);
        for (const target of targets) {
          expect(await getEffectiveOpacity(target)).toBe(1);
        }
      }
      expect(await getVisualState(page, text)).toEqual(
        text.split(/\s+/).map(() => ({ color: THEME_COLORS[colorScheme].ink, fontWeight: '700' })),
      );
    });
  }
}

test('About lays out the statement above the portrait and biography on desktop, with text first on mobile', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const about = await openAbout(page, 'en');
  const statement = about.getByRole('group', { name: STATEMENTS.en });
  const portrait = about.getByRole('img', { name: PORTRAIT_NAME });
  const firstParagraph = about.getByRole('paragraph').first();
  const lastParagraph = about.getByRole('paragraph').last();
  const qualities = about.getByRole('list');
  const bounds = async () => Promise.all(
    [statement, portrait, firstParagraph, lastParagraph, qualities].map((target) =>
      target.evaluate((node) => node.getBoundingClientRect().toJSON() as DOMRect),
    ),
  );

  await page.evaluate(() => document.fonts.ready);
  const [headline, photo, first, last, tags] = await bounds();
  expect(headline.bottom).toBeLessThan(photo.top);
  expect(headline.left).toBeCloseTo(photo.left);
  expect(headline.right).toBeGreaterThanOrEqual(first.right);
  expect(photo.right).toBeLessThan(first.left);
  expect(photo.top).toBeCloseTo(first.top);
  expect(last.bottom).toBeLessThan(tags.top);
  expect(tags.left).toBeCloseTo(first.left);
  const charactersPerLine = await firstParagraph.evaluate((node) => {
    const style = getComputedStyle(node);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    context.font = `${style.fontSize} ${style.fontFamily}`;
    return node.getBoundingClientRect().width / context.measureText('0').width;
  });
  expect(charactersPerLine).toBeLessThanOrEqual(65.1);

  await page.setViewportSize({ width: 390, height: 844 });
  const [mobileHeadline, mobilePhoto, mobileFirst, mobileLast, mobileTags] = await bounds();
  expect(mobileHeadline.bottom).toBeLessThan(mobileFirst.top);
  expect(mobileLast.bottom).toBeLessThan(mobileTags.top);
  expect(mobileTags.bottom).toBeLessThan(mobilePhoto.top);
});

test('omits a failed local portrait while keeping About available', async ({ page }) => {
  let portraitRequestFailed = false;
  await page.route('**/pedro-suarez.png', async (route) => {
    portraitRequestFailed = true;
    await route.abort();
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const about = await openAbout(page, 'en');
  const problemParagraph = about.getByText(ABOUT_PROBLEM);

  await expect.poll(() => portraitRequestFailed).toBe(true);
  await expect(about.getByRole('img')).toHaveCount(0);
  await expect(problemParagraph).toBeVisible();
  await expect(about.getByRole('heading', { name: 'About' })).toHaveCount(1);
  await expect(about.getByRole('group', { name: "Complexity is where I'm calmest." })).toBeVisible();
  await expect(about.locator('p')).toHaveCount(5);
  const statement = about.getByRole('group', { name: STATEMENTS.en });
  const [headline, paragraph] = await Promise.all([statement.boundingBox(), problemParagraph.boundingBox()]);
  expect(paragraph!.x).toBeCloseTo(headline!.x);
});

async function expectStaticAbout(page: Page, withPortrait: boolean): Promise<void> {
  const about = page.getByRole('region', { name: 'About' });
  const heading = about.getByRole('heading', { name: 'About' });
  const statement = about.getByRole('group', { name: STATEMENTS.en });
  const paragraphs = about.getByRole('paragraph');
  const qualities = ABOUT_VALUES.map((value) => about.getByText(value, { exact: true }));

  await expect(about.getByText(ABOUT_PROBLEM, { exact: true })).toBeVisible();
  await expect(paragraphs).toHaveCount(4);
  const targets = [heading, statement, ...(await paragraphs.all()), ...qualities];
  if (withPortrait) targets.push(about.getByRole('img', { name: PORTRAIT_NAME }));

  await Promise.all(targets.map((target) => expect(target).toBeVisible()));
  const geometry = await getScrollTargetGeometry(statement);
  for (const position of [0.1, 0.5]) {
    await scrollElementToProgress(page, geometry, position);
    expect(await about.evaluate((node) => node.getAnimations({ subtree: true }).length)).toBe(0);
    for (const target of targets) {
      expect(await getEffectiveOpacity(target)).toBe(1);
    }
    expect(await getVisualState(page, STATEMENTS.en)).toEqual(
      STATEMENTS.en.split(/\s+/).map(() => ({
        color: THEME_COLORS.light.ink,
        fontWeight: '700',
      })),
    );
  }
}

test('About is static with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/en');
  await expectStaticAbout(page, true);
});

test('About is static without scroll-driven animation support', async ({ browserType, baseURL }) => {
  const browser = await browserType.launch({ args: ['--disable-blink-features=ScrollTimeline'] });
  try {
    const page = await browser.newPage({ baseURL });
    await page.goto('/en');
    expect(await page.evaluate(() => CSS.supports('animation-timeline', 'view()'))).toBe(false);
    await expectStaticAbout(page, true);
  } finally {
    await browser.close();
  }
});

test.describe('with JavaScript disabled', () => {
  test.use({ javaScriptEnabled: false });

  test('About is static and includes the portrait when available', async ({ page }) => {
    await page.goto('/en');
    await expectStaticAbout(page, true);
  });

  test('About stays static and omits a failed portrait without a visual error', async ({ page }) => {
    const failedRequest = page.waitForEvent('requestfailed', {
      predicate: (request) => request.url().endsWith('/pedro-suarez.png'),
    });
    await page.route('**/pedro-suarez.png', (route) => route.abort());
    await page.goto('/en');
    await failedRequest;

    const about = page.getByRole('region', { name: 'About' });
    await expect(about.getByRole('img')).not.toBeVisible();
    await expect(about.getByText(PORTRAIT_NAME, { exact: true })).not.toBeVisible();
    await expectStaticAbout(page, false);
  });
});
