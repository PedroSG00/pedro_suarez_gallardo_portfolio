import { expect, test, type Locator, type Page } from '@playwright/test';
import { WORK_ENTRIES } from '@/content/work';
import { THEME_COLORS } from '../about/about-helpers';

const LOCALES = [
  { locale: 'en', label: 'Work' },
  { locale: 'es', label: 'Trabajo' },
] as const;
const THEMES = ['light', 'dark'] as const;

async function paint(text: Locator) {
  return text.evaluate((element) => {
    let opacity = 1;
    let translateY = 0;
    let clipped = false;
    for (let node: Element | null = element; node; node = node.parentElement) {
      const style = getComputedStyle(node);
      opacity *= Number(style.opacity);
      translateY += new DOMMatrixReadOnly(style.transform).m42;
      clipped ||= style.clipPath !== 'none';
    }
    return { opacity, translateY, clipped };
  });
}

function rowTexts(row: Locator, index: number) {
  return [
    row.getByText(String(index + 1).padStart(2, '0'), { exact: true }),
    row.getByRole('heading', { level: 4 }),
    row.getByRole('paragraph'),
    ...WORK_ENTRIES[index].technologies.map((name) => row.getByText(name, { exact: true })),
  ];
}

async function settle(page: Page) {
  await page.evaluate(() => new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  ));
}

async function openWork(page: Page, locale: string, label: string, theme: string) {
  await page.addInitScript((choice) => localStorage.setItem('psg-theme', choice), theme);
  await page.goto(`/${locale}`);
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  await page.evaluate(() => document.fonts.ready);
  const list = page.getByRole('region', { name: label }).getByRole('list');
  expect(await list.evaluate((element) => element.tagName)).toBe('OL');
  const rows = list.getByRole('listitem');
  await expect(rows).toHaveCount(5);
  return rows;
}

async function positionRow(
  page: Page,
  texts: Locator[],
  phase: 'entry' | 'reading' | 'exit',
) {
  // Use the visible content's layout bounds, not wrappers, selectors or padding.
  const bounds = [];
  for (const text of texts) {
    const state = await paint(text);
    bounds.push(await text.evaluate((element, translateY) => {
      const rect = element.getBoundingClientRect();
      return {
        top: scrollY + rect.top - translateY,
        bottom: scrollY + rect.bottom - translateY,
      };
    }, state.translateY));
  }
  const top = Math.min(...bounds.map((bound) => bound.top));
  const bottom = Math.max(...bounds.map((bound) => bound.bottom));
  await page.evaluate(({ start, end, state }) => {
    const target = state === 'entry' ? start - innerHeight * 0.9
      : state === 'exit' ? end - innerHeight * 0.1
        : (start + end - innerHeight) / 2;
    window.scrollTo({ top: target, behavior: 'instant' });
  }, { start: top, end: bottom, state: phase });
  await settle(page);
}

test.describe('Work position-linked row motion', () => {
  test.use({ viewport: { width: 1440, height: 320 }, reducedMotion: 'no-preference' });

  for (const { locale, label } of LOCALES) {
    for (const theme of THEMES) {
      test(`${locale}, ${theme}: all five rows enter, remain readable, exit and reverse together`, async ({ page }) => {
        const rows = await openWork(page, locale, label, theme);
        for (let index = 0; index < WORK_ENTRIES.length; index += 1) {
          const texts = rowTexts(rows.nth(index), index);
          await expect(texts[0]).toHaveAttribute('aria-hidden', 'true');
          const states = new Map<string, Awaited<ReturnType<typeof paint>>>();
          for (const phase of ['entry', 'reading', 'exit', 'reading', 'entry'] as const) {
            await positionRow(page, texts, phase);
            await expect.poll(async () => {
              const { opacity, translateY } = await paint(texts[1]);
              const matches = phase === 'reading' ? opacity === 1 && translateY === 0
                : opacity > 0 && opacity < 1 && (phase === 'entry' ? translateY > 0 : translateY < 0);
              return { opacity, translateY, matches };
            }, { message: `row ${index + 1}: ${phase}` }).toEqual(expect.objectContaining({ matches: true }));
            const state = await paint(texts[1]);
            for (const text of texts) {
              const actual = await paint(text);
              expect(actual.opacity).toBeCloseTo(state.opacity, 4);
              expect(actual.translateY).toBeCloseTo(state.translateY, 4);
              expect(actual.clipped).toBe(false);
            }
            const previous = states.get(phase);
            if (previous) {
              expect(state.opacity).toBeCloseTo(previous.opacity, 3);
              expect(state.translateY).toBeCloseTo(previous.translateY, 3);
            }
            states.set(phase, state);
          }
        }
      });

      test(`${locale}, ${theme}: every text line in rows taller than the viewport reaches full reading`, async ({ page }) => {
        await page.setViewportSize({ width: 320, height: 240 });
        const rows = await openWork(page, locale, label, theme);
        // Real text enlargement and reflow, not artificial row height or filler.
        await page.addStyleTag({ content: 'html { font-size: 200%; }' });
        await settle(page);
        for (let index = 0; index < WORK_ENTRIES.length; index += 1) {
          const row = rows.nth(index);
          expect(await row.evaluate((element) => element.getBoundingClientRect().height))
            .toBeGreaterThan(240);
          for (const text of rowTexts(row, index)) {
            const state = await paint(text);
            const lines = await text.evaluate((element, translateY) => {
              const range = document.createRange();
              range.selectNodeContents(element);
              return Array.from(range.getClientRects()).map((rect) =>
                scrollY + rect.top + rect.height / 2 - translateY,
              );
            }, state.translateY);
            for (const line of lines) {
              await page.evaluate((center) =>
                window.scrollTo({ top: center - innerHeight / 2, behavior: 'instant' }),
              line);
              await settle(page);
              await expect.poll(() => paint(text), {
                message: `row ${index + 1}, "${await text.innerText()}", line at ${line}`,
              }).toEqual({ opacity: 1, translateY: 0, clipped: false });
            }
          }
        }
      });

      test(`${locale}, ${theme}: a stationary cursor follows current rows without changing scroll-driven paint`, async ({ page }) => {
        const rows = await openWork(page, locale, label, theme);
        await page.mouse.move(0, 0);
        await positionRow(page, rowTexts(rows.nth(0), 0), 'reading');
        const first = rows.nth(0);
        const second = rows.nth(1);
        const before = await paint(first.getByRole('heading'));
        const position = await page.evaluate(() => scrollY);
        const target = await first.getByRole('heading').boundingBox();
        await page.mouse.move(target!.x + target!.width / 2, target!.y + target!.height / 2);
        const inverse = THEME_COLORS[theme === 'light' ? 'dark' : 'light'];
        await expect(first).toHaveCSS('background-color', inverse.background);
        expect(await paint(first.getByRole('heading'))).toEqual(before);
        expect(await page.evaluate(() => scrollY)).toBe(position);
        // Leave the cursor fixed at the reading line while the next row moves under it.
        const x = await first.evaluate((element) => {
          const rect = element.getBoundingClientRect();
          return rect.left + rect.width / 2;
        });
        await page.mouse.move(x, 160);
        await positionRow(page, rowTexts(second, 1), 'reading');
        await expect(first).toHaveCSS('background-color', THEME_COLORS[theme].background);
        await expect(second).toHaveCSS('background-color', inverse.background);
        expect(await paint(second.getByRole('heading'))).toEqual({ opacity: 1, translateY: 0, clipped: false });
        await positionRow(page, rowTexts(second, 1), 'entry');
        await expect(second).toHaveCSS('background-color', THEME_COLORS[theme].background);
        const entering = await paint(second.getByRole('heading'));
        expect(entering.opacity).toBeGreaterThan(0);
        expect(entering.opacity).toBeLessThan(1);
        await positionRow(page, rowTexts(second, 1), 'reading');
        await expect(second).toHaveCSS('background-color', inverse.background);
        expect(await paint(second.getByRole('heading'))).toEqual({ opacity: 1, translateY: 0, clipped: false });
      });
    }
  }
});
