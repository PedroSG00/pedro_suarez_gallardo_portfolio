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
  es: 'La complejidad es donde estoy tranquilo.',
} as const;

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
      :root {
        color-scheme: ${theme};
        --color-ink: light-dark(#121110, #f2efe6);
        --color-ink-muted: light-dark(#5a574f, #a9a49a);
      }
      body { min-height: 3000px; }
      main { min-height: 3000px; padding-top: ${STATEMENT_DOCUMENT_TOP}px; }
      [data-about-statement] { height: ${STATEMENT_HEIGHT}px; }
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
  await page.evaluate((position) => window.scrollTo(0, position), scrollY);
  await page.evaluate(
    () => new Promise<void>((resolveFrame) => requestAnimationFrame(() => resolveFrame())),
  );
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
      await expect(group).toBeVisible();

      const initial = await getVisualState(page, text);
      expect(initial.every((word) => word.fontWeight === '400')).toBe(true);

      await scrollToProgress(page, 0.19);
      expect((await getVisualState(page, text)).every((word) => word.fontWeight === '400')).toBe(
        true,
      );

      await scrollToProgress(page, 0.21);
      const firstLit = await getVisualState(page, text);
      expect(firstLit[0].fontWeight).toBe('700');
      expect(firstLit.slice(1).every((word) => word.fontWeight === '400')).toBe(true);

      await scrollToProgress(page, 0.41);
      const accumulated = await getVisualState(page, text);
      expect(accumulated.slice(0, 2).every((word) => word.fontWeight === '700')).toBe(true);
      expect(accumulated.slice(2).every((word) => word.fontWeight === '400')).toBe(true);

      await scrollToProgress(page, 0.99);
      expect((await getVisualState(page, text)).every((word) => word.fontWeight === '700')).toBe(
        true,
      );

      await scrollToProgress(page, 0.39);
      const reversed = await getVisualState(page, text);
      expect(reversed[0].fontWeight).toBe('700');
      expect(reversed.slice(1).every((word) => word.fontWeight === '400')).toBe(true);
    });
  }
}
