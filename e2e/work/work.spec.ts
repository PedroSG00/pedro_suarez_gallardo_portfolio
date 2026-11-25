import { expect, test, type Locator } from '@playwright/test';
import { WORK_ENTRIES } from '@/content/work';
import en from '../../messages/en.json';
import es from '../../messages/es.json';
import { getContrastRatio, readTextPaint, THEMES } from '../about/about-helpers';

const LOCALES = [
  { locale: 'en', label: 'Work', messages: en.experience, nav: en.shared.nav },
  { locale: 'es', label: 'Trabajo', messages: es.experience, nav: es.shared.nav },
] as const;

async function expectReadableText(text: Locator) {
  await expect(text).toBeVisible();
  const state = await text.evaluate((element) => {
    const style = getComputedStyle(element);
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const fragments: DOMRect[] = [];
    while (walker.nextNode()) {
      if (!walker.currentNode.textContent?.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(walker.currentNode);
      fragments.push(...range.getClientRects());
    }
    let clipped = false;
    for (let node: Element | null = element; node; node = node.parentElement) {
      const ancestor = getComputedStyle(node);
      const bounds = node.getBoundingClientRect();
      clipped ||= ancestor.clipPath !== 'none' ||
        (['hidden', 'clip'].includes(ancestor.overflowX) && node.scrollWidth > node.clientWidth + 1) ||
        (['hidden', 'clip'].includes(ancestor.overflowY) && node.scrollHeight > node.clientHeight + 1);
      for (const line of fragments) {
        clipped ||= (['hidden', 'clip'].includes(ancestor.overflowX) &&
          (line.left < bounds.left - 1 || line.right > bounds.right + 1)) ||
          (['hidden', 'clip'].includes(ancestor.overflowY) &&
            (line.top < bounds.top - 1 || line.bottom > bounds.bottom + 1));
      }
    }
    return {
      fontSize: Number.parseFloat(style.fontSize), fontWeight: Number(style.fontWeight),
      clipped, width: document.documentElement.clientWidth,
      lines: fragments.map((rect) => ({
        top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right,
      })),
    };
  });
  expect(state.clipped, await text.innerText()).toBe(false);
  expect(state.lines.length).toBeGreaterThan(0);
  for (const line of state.lines) {
    expect(line.left).toBeGreaterThanOrEqual(-1);
    expect(line.right).toBeLessThanOrEqual(state.width + 1);
  }
  const paint = await text.evaluate(readTextPaint);
  expect(paint.opacity).toBe(1);
  expect(paint.transitioning).toBe(false);
  const large = state.fontSize >= 24 || (state.fontSize >= 18.6667 && state.fontWeight >= 700);
  const ratio = Math.min(
    getContrastRatio(paint.ink, paint.paper),
    getContrastRatio(paint.inkOnGrid, paint.gridPaper),
  );
  expect(ratio, `${await text.innerText()}: ${large ? 'large' : 'normal'} text AA`)
    .toBeGreaterThanOrEqual(large ? 3 : 4.5);
  return state.lines;
}

for (const item of LOCALES) {
  for (const theme of THEMES) {
    test.describe(`${item.locale}, ${theme}: Work accessibility and reflow`, () => {
      test.use({ reducedMotion: 'reduce', colorScheme: theme });

      test('editorial hierarchy separates result headlines from supporting copy across viewports', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 1000 });
        await page.goto(`/${item.locale}#work`);
        await page.evaluate(() => document.fonts.ready);
        const work = page.getByRole('region', { name: item.label, exact: true });
        const intro = work.getByRole('heading', { level: 3 });
        const sectionHeading = work.getByRole('heading', { level: 2 });
        const rows = work.getByRole('listitem');
        for (const width of [1440, 390]) {
          await page.setViewportSize({ width, height: 1000 });
          const opening = await intro.evaluate((element) => {
            const style = getComputedStyle(element);
            return {
              size: Number.parseFloat(style.fontSize),
              contentHeight: element.getBoundingClientRect().height -
                Number.parseFloat(style.paddingTop) - Number.parseFloat(style.paddingBottom),
              lineHeight: Number.parseFloat(style.lineHeight),
            };
          });
          const headingSize = await sectionHeading.evaluate((element) =>
            Number.parseFloat(getComputedStyle(element).fontSize));
          expect(opening.size).toBeLessThanOrEqual(headingSize);
          if (width === 1440) {
            expect(opening.contentHeight).toBeLessThanOrEqual(opening.lineHeight + 1);
          }
          for (const row of await rows.all()) {
            const title = row.getByRole('heading', { level: 4 });
            const description = row.getByRole('paragraph');
            const size = (text: Locator) => text.evaluate((element) =>
              Number.parseFloat(getComputedStyle(element).fontSize));
            expect(await size(title)).toBeGreaterThanOrEqual(await size(description) * 1.5);
            expect(await size(intro)).toBeGreaterThan(await size(title));
            const headline = (await title.boundingBox())!;
            const copy = (await description.boundingBox())!;
            if (width === 1440) {
              expect(copy.x).toBeGreaterThanOrEqual(headline.x + headline.width);
            } else {
              expect(copy.y).toBeGreaterThanOrEqual(headline.y + headline.height);
            }
          }
        }
      });

      for (const width of [320, 1920]) {
        for (const scale of [1, 2]) {
          test(`${width}px, ${scale * 100}% text: all results reflow without clipping or overlap`, async ({ page }) => {
            await page.setViewportSize({ width, height: 1000 });
            await page.goto(`/${item.locale}#work`);
            await page.evaluate(() => document.fonts.ready);
            const work = page.getByRole('region', { name: item.label, exact: true });
            const result = work.getByRole('listitem').first().getByRole('paragraph');
            const initialSize = await result.evaluate((element) =>
              Number.parseFloat(getComputedStyle(element).fontSize));
            if (scale === 2) {
              // Root-only zoom does not double fluid clamp(rem + vw) typography.
              // Enlarge actual computed text sizes, retaining rem-based reflow too.
              await work.evaluate((element) => {
                const texts = [element, ...element.querySelectorAll<HTMLElement>('*')];
                const sizes = texts.map((node) => Number.parseFloat(getComputedStyle(node).fontSize));
                document.documentElement.style.fontSize = '200%';
                texts.forEach((node, index) => {
                  (node as HTMLElement).style.fontSize = `${sizes[index] * 2}px`;
                });
              });
            }
            expect(await result.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize)))
              .toBeCloseTo(initialSize * scale);
            await expect(work).toHaveAccessibleName(item.label);
            await expect(work.getByRole('heading', { level: 2, name: item.label, exact: true })).toHaveCount(1);
            await expect(work.getByRole('heading', { level: 3, name: item.messages.title })).toHaveCount(1);
            const list = work.getByRole('list');
            expect(await list.evaluate((element) => element.tagName)).toBe('OL');
            const rows = list.getByRole('listitem');
            await expect(rows).toHaveCount(5);
            const allLines = [];
            let group = 0;
            for (const heading of await work.getByRole('heading').all()) {
              allLines.push(...(await expectReadableText(heading)).map((line) => ({ ...line, group })));
              group++;
            }
            for (const [index, entry] of WORK_ENTRIES.entries()) {
              const row = rows.nth(index);
              const copy = item.messages.items[entry.id];
              await expect(row.getByRole('heading', { level: 4 })).toHaveText(copy.title);
              await expect(row.getByRole('paragraph')).toHaveText(copy.result);
              const number = row.getByText(String(index + 1).padStart(2, '0'), { exact: true });
              await expect(number).toHaveAttribute('aria-hidden', 'true');
              const numberLayout = await number.evaluate((element) => ({
                height: element.getBoundingClientRect().height,
                lineHeight: Number.parseFloat(getComputedStyle(element).lineHeight),
              }));
              expect(numberLayout.height).toBeLessThanOrEqual(numberLayout.lineHeight + 1);
              for (const text of [number, row.getByRole('paragraph'),
                ...entry.technologies.map((name) => row.getByText(name, { exact: true }))]) {
                allLines.push(...(await expectReadableText(text)).map((line) => ({ ...line, group })));
                group++;
              }
            }
            // Compare actual text fragments, not box structure or CSS classes.
            for (let i = 0; i < allLines.length; i++) {
              for (let j = i + 1; j < allLines.length; j++) {
                const a = allLines[i];
                const b = allLines[j];
                // Font em boxes can overlap within tightly set editorial headings;
                // only distinct pieces of content must not collide.
                if (a.group === b.group) continue;
                const overlapX = Math.min(a.right, b.right) - Math.max(a.left, b.left);
                const overlapY = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
                expect(overlapX > 1 && overlapY > 1, `text fragments ${i}/${j} overlap`).toBe(false);
              }
            }
            expect(await work.evaluate((element) =>
              [element, ...element.querySelectorAll<HTMLElement>('*')]
                .filter((node) => (node as HTMLElement).tabIndex >= 0 ||
                  (node as HTMLElement).isContentEditable).length,
            )).toBe(0);
            for (const role of ['link', 'button', 'textbox', 'checkbox'] as const) {
              await expect(work.getByRole(role)).toHaveCount(0);
            }
            expect(await page.evaluate(() => document.documentElement.scrollWidth))
              .toBeLessThanOrEqual(width);
          });
        }
      }

      test('keyboard navigation focuses the real destination and skips informational rows', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 1000 });
        await page.goto(`/${item.locale}`);
        const link = page.getByRole('navigation').getByRole('link', { name: item.label, exact: true });
        await link.focus();
        await page.keyboard.press('Enter');
        const work = page.getByRole('region', { name: item.label, exact: true });
        const heading = work.getByRole('heading', { level: 2, name: item.label, exact: true });
        await expect(heading).toBeFocused();
        await expect(heading).toBeInViewport();
        const visibility = await heading.evaluate((element) => {
          const bounds = element.getBoundingClientRect();
          const headerBottom = document.querySelector('header')!.getBoundingClientRect().bottom;
          const style = getComputedStyle(element);
          return { top: bounds.top, headerBottom, outline: style.outlineStyle, width: style.outlineWidth };
        });
        expect(visibility.top).toBeGreaterThanOrEqual(visibility.headerBottom);
        expect(visibility.outline).not.toBe('none');
        expect(Number.parseFloat(visibility.width)).toBeGreaterThan(0);
        await page.keyboard.press('Tab');
        expect(await work.evaluate((element) => element.contains(document.activeElement))).toBe(false);
        // Stack follows Work; its active category is the next genuine page control.
        const stack = page.getByRole('region', { name: item.nav.stack, exact: true });
        await expect(stack.getByRole('radio', { checked: true })).toBeFocused();
        await expect(page).toHaveURL(new RegExp(`/${item.locale}#work$`));
      });
    });
  }
}
