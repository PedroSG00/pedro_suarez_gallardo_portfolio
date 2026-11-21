import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, type Locator, type Page } from '@playwright/test';
import enMessages from '../../messages/en.json';
import esMessages from '../../messages/es.json';

export const STATEMENT_STYLES_PATH = resolve(
  process.cwd(),
  'src/components/sections/AboutStatement/AboutStatement.module.css',
);
export const VIEWPORT_HEIGHT = 1000;

export const STATEMENTS = {
  en: 'I build the parts that are hard to get right.',
  es: 'Me encargo de las partes que cuesta hacer bien.',
} as const;

export const ABOUT_PROBLEM =
  'Large data sets, live updates, complex forms, and state people can rely on. That is the work teams trust me with—and the work I enjoy most.';
export const ABOUT_VALUES = [
  'Detail-oriented',
  'Analytical',
  'Autonomous',
  'Teamwork',
  'Continuous learning',
];
export const PORTRAIT_NAME = 'Portrait of Pedro Suárez Gallardo';

export const THEME_COLORS = {
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

export const ABOUT_LOCALES = [
  { locale: 'en', messages: enMessages.about, shared: enMessages.shared },
  { locale: 'es', messages: esMessages.about, shared: esMessages.shared },
] as const;

export type AboutLocale = (typeof ABOUT_LOCALES)[number]['locale'];
export type AboutTheme = keyof typeof THEME_COLORS;
export const THEMES = ['light', 'dark'] as const;

export type ScrollTargetGeometry = {
  documentTop: number;
  height: number;
  viewportHeight: number;
};

/* ---------------------------------------------------------------- contrast */

export function getContrastRatio(
  foreground: string | number[],
  background: string | number[],
): number {
  const luminance = (color: string | number[]) => {
    const channels = typeof color === 'string' ? color.match(/\d+/g)?.map(Number) : color;
    if (channels?.length !== 3) throw new Error(`Unexpected color: ${color}`);

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

// Runs inside the browser (and is serialized with `toString()` for an init
// script), so it must stay self-contained: no imports or outer references.
export function readTextPaint(element: Element) {
  const rgba = (color: string) => {
    const channels = color.match(/\d*\.?\d+/g)?.map(Number);
    if (!/^rgba?\(/.test(color) || !channels || ![3, 4].includes(channels.length)) {
      throw new Error(`Unsupported computed paint: ${color}`);
    }
    const [r, g, b, alpha = 1] = channels;
    return { rgb: [r, g, b], alpha };
  };
  type Paint = ReturnType<typeof rgba>;
  const over = (front: Paint, back: Paint): Paint => {
    const backAlpha = back.alpha * (1 - front.alpha);
    const alpha = front.alpha + backAlpha;
    const rgb = front.rgb.map(
      (channel, index) => alpha === 0 ? 0 : (channel * front.alpha + back.rgb[index] * backAlpha) / alpha,
    );
    return { rgb, alpha };
  };

  let ink = rgba(getComputedStyle(element).color);
  let paper = rgba('rgba(0, 0, 0, 0)');
  let inkOnGrid = ink;
  let gridPaper = paper;
  let opacity = 1;
  let transitioning = false;
  // Composite two neighboring samples (ink and bare paper). Each ancestor's
  // opacity applies to its whole painted group, including its own background.
  for (let current: Element | null = element; current; current = current.parentElement) {
    const style = getComputedStyle(current);
    if (style.backgroundImage !== 'none') {
      throw new Error('Contrast audit requires a solid backdrop behind the text');
    }
    transitioning ||= current.getAnimations().some((animation) =>
      animation instanceof CSSTransition && (animation.pending || animation.playState === 'running'),
    );
    const background = rgba(style.backgroundColor);
    let gridBackground = background;
    if (current.matches('section')) {
      for (const child of current.children) {
        if (child.getAttribute('aria-hidden') !== 'true') continue;
        const gridStyle = getComputedStyle(child);
        const lineColor = gridStyle.backgroundImage.match(/linear-gradient\((?:90deg, )?(rgba?\([^)]+\))/)?.[1];
        if (lineColor) {
          const line = rgba(lineColor);
          gridBackground = over({ ...line, alpha: line.alpha * Number(gridStyle.opacity) }, gridBackground);
        }
      }
    }
    ink = over(ink, background);
    paper = over(paper, background);
    inkOnGrid = over(inkOnGrid, gridBackground);
    gridPaper = over(gridPaper, gridBackground);
    const groupOpacity = Number(style.opacity);
    opacity *= groupOpacity;
    ink.alpha *= groupOpacity;
    paper.alpha *= groupOpacity;
    inkOnGrid.alpha *= groupOpacity;
    gridPaper.alpha *= groupOpacity;
  }
  if (ink.alpha !== 1 || paper.alpha !== 1) {
    throw new Error('Contrast audit did not reach an opaque backdrop');
  }
  return {
    ink: ink.rgb,
    paper: paper.rgb,
    inkOnGrid: inkOnGrid.rgb,
    gridPaper: gridPaper.rgb,
    opacity,
    transitioning,
    fontWeight: getComputedStyle(element).fontWeight,
  };
}

export type TextPaint = ReturnType<typeof readTextPaint>;

export function expectReadingContrast(paint: TextPaint, context: string): number {
  expect(paint.opacity, `${context}: effective opacity`).toBe(1);
  expect(paint.transitioning, `${context}: active CSS transition`).toBe(false);
  const ratio = Math.min(
    getContrastRatio(paint.ink, paint.paper),
    getContrastRatio(paint.inkOnGrid, paint.gridPaper),
  );
  expect(ratio, `${context}: contrast`).toBeGreaterThanOrEqual(4.5);
  return ratio;
}

export async function auditReadingContrast(target: Locator, context: string): Promise<number> {
  await expect(target).toBeInViewport();
  await expect.poll(async () => {
    const { opacity, transitioning } = await target.evaluate(readTextPaint);
    return { opacity, transitioning };
  }, { message: `${context}: stable reading` }).toEqual({ opacity: 1, transitioning: false });
  return expectReadingContrast(await target.evaluate(readTextPaint), context);
}

/* ------------------------------------------------------------------ scroll */

const nextFrames = () =>
  new Promise<void>((resolveFrame) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolveFrame())),
  );

export async function getScrollTargetGeometry(target: Locator): Promise<ScrollTargetGeometry> {
  return target.evaluate((node) => {
    const rect = node.getBoundingClientRect();
    return {
      documentTop: rect.top + window.scrollY,
      height: rect.height,
      viewportHeight: window.innerHeight,
    };
  });
}

/** Scrolls so the target sits at `progress` (0 = entering, 1 = fully gone) of its view range. */
export async function scrollElementToProgress(
  page: Page,
  { documentTop, height, viewportHeight }: ScrollTargetGeometry,
  progress: number,
  waitForAnimationFrame = true,
): Promise<void> {
  const scrollY = documentTop - viewportHeight + progress * (viewportHeight + height);
  await page.evaluate(
    (position) => window.scrollTo({ top: position, behavior: 'instant' }),
    scrollY,
  );
  if (waitForAnimationFrame) await page.evaluate(nextFrames);
}

/** Progress points shared by the reveal checks: [entry, top edge, exit] for a target. */
export function revealProgress({ height, viewportHeight }: ScrollTargetGeometry) {
  const range = viewportHeight + height;
  const atTop = viewportHeight / range;
  return {
    beforeTop: (viewportHeight - 4) / range,
    earlyExit: atTop + (1 - atTop) * 0.2,
    halfwayOut: (1 + atTop) / 2,
  };
}

export async function getEffectiveOpacity(target: Locator): Promise<number> {
  return target.evaluate((node) => {
    let opacity = 1;
    for (let current: Element | null = node; current; current = current.parentElement) {
      opacity *= Number.parseFloat(getComputedStyle(current).opacity);
    }
    return opacity;
  });
}

/* --------------------------------------------------------------- statement */

export function getStatementWords(group: Locator, text: string): Locator[] {
  return text.split(/\s+/).map((word) => group.getByText(word, { exact: true }));
}

export async function getVisualState(
  page: Page,
  text: string,
): Promise<Array<{ color: string; fontWeight: string }>> {
  const group = page.getByRole('group', { name: text });
  return Promise.all(
    getStatementWords(group, text).map((word) =>
      word.evaluate((element) => {
        const styles = getComputedStyle(element);
        return { color: styles.color, fontWeight: styles.fontWeight };
      }),
    ),
  );
}

/**
 * Waits until the scroll-driven word highlight has settled (two identical
 * computed-style reads separated by two animation frames), so assertions do
 * not read mid-fade under parallel load.
 */
export async function awaitStatementSettled(page: Page, text: string): Promise<void> {
  await page.waitForFunction(
    ({ text }) => {
      const group = Array.from(document.querySelectorAll<HTMLElement>('[role="group"]')).find(
        (el) => el.getAttribute('aria-label') === text,
      );
      if (!group) return false;
      const words = Array.from(group.querySelectorAll<HTMLElement>('[data-about-statement-word]'));
      if (!words.length) return false;
      const read = () => words.map((word) => {
        const style = getComputedStyle(word);
        return `${style.color} ${style.fontWeight}`;
      }).join('|');
      const before = read();
      return new Promise<boolean>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve(read() === before)));
      });
    },
    { text },
    { timeout: 10000 },
  );
}

/** Expected computed state for a statement lit up to `litCount` words. */
export function expectedWordStyles(
  wordCount: number,
  litCount: number,
  theme: AboutTheme,
): Array<{ color: string; fontWeight: string }> {
  return Array.from({ length: wordCount }, (_, index) =>
    index < litCount
      ? { color: THEME_COLORS[theme].ink, fontWeight: '700' }
      : { color: THEME_COLORS[theme].muted, fontWeight: '400' },
  );
}

/** Mounts the statement CSS in an isolated page; returns the geometry to scroll against. */
export async function mountStatement(
  page: Page,
  text: string,
  theme: AboutTheme,
): Promise<ScrollTargetGeometry> {
  const documentTop = 1000;
  const height = 300;
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
      body { min-height: 3000px; background: var(--color-surface); }
      main { min-height: 3000px; padding-top: ${documentTop}px; }
      [data-about-statement] { height: ${height}px; }
    </style>
    <main>
      <p data-about-statement role="group" aria-label="${text}">
        <span data-about-statement-content aria-hidden="true">${visualText}</span>
      </p>
    </main>
  `);
  await page.addStyleTag({ content: styles });
  return { documentTop, height, viewportHeight: VIEWPORT_HEIGHT };
}

/* ------------------------------------------------------------------- pages */

type OpenAboutOptions = {
  theme?: AboutTheme;
  reducedMotion?: 'reduce' | 'no-preference';
};

/** Opens the home page at desktop size with extra scroll runway; returns the About region. */
export async function openAbout(
  page: Page,
  locale: AboutLocale,
  { theme = 'light', reducedMotion = 'no-preference' }: OpenAboutOptions = {},
): Promise<Locator> {
  await page.setViewportSize({ width: 1280, height: VIEWPORT_HEIGHT });
  await page.emulateMedia({ colorScheme: theme, reducedMotion });
  await page.addInitScript((selectedTheme) => {
    localStorage.setItem('psg-theme', selectedTheme);
  }, theme);
  await page.goto(`/${locale}`);
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  // The following sections are placeholders; leave enough runway to verify
  // that About's final block can exit before the page itself ends.
  await page.evaluate(async () => {
    document.body.style.minHeight = '400vh';
    await document.fonts.ready;
  });
  const messages = ABOUT_LOCALES.find((item) => item.locale === locale)!.messages;
  return page.getByRole('region', { name: messages.intro });
}
