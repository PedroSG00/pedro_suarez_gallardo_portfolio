import { expect, test, type Locator, type Page } from '@playwright/test';
import { WORK_ENTRIES } from '@/content/work';
import { auditReadingContrast, THEME_COLORS, THEMES } from '../about/about-helpers';

const LOCALES = [
  { locale: 'en', label: 'Work' },
  { locale: 'es', label: 'Trabajo' },
] as const;

type Theme = (typeof THEMES)[number];

async function openWork(page: Page, locale: string, label: string, theme: Theme) {
  // A saved choice takes precedence over the opposite system preference.
  await page.emulateMedia({ colorScheme: theme === 'light' ? 'dark' : 'light' });
  await page.addInitScript((choice) => localStorage.setItem('psg-theme', choice), theme);
  await page.goto(`/${locale}`);
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  await page.evaluate(() => document.fonts.ready);
  return page.getByRole('region', { name: label, exact: true }).getByRole('listitem');
}

function rowText(row: Locator, index: number) {
  return [
    row.getByText(String(index + 1).padStart(2, '0'), { exact: true }),
    row.getByRole('heading', { level: 4 }),
    row.getByRole('paragraph'),
    ...WORK_ENTRIES[index].technologies.map((name) => row.getByText(name, { exact: true })),
  ];
}

async function expectRowPaint(row: Locator, index: number, theme: Theme, inverted: boolean) {
  const palette = THEME_COLORS[inverted ? (theme === 'light' ? 'dark' : 'light') : theme];
  await expect(row).toHaveCSS('background-color', palette.background);
  await expect(row).toHaveCSS('color', palette.ink);
  await expect(row).toHaveCSS('border-top-style', 'solid');
  const line = await row.evaluate((element) => {
    const probe = document.createElement('span');
    probe.style.color = 'var(--color-line)';
    document.documentElement.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return { color, width: getComputedStyle(element).borderTopWidth };
  });
  expect(Number.parseFloat(line.width)).toBeGreaterThan(0);
  await expect(row).toHaveCSS('border-top-color', inverted ? palette.ink : line.color);

  const texts = rowText(row, index);
  for (const [position, text] of texts.entries()) {
    await expect(text).toBeVisible();
    await expect(text).toHaveCSS('color', position === 0 && !inverted ? palette.muted : palette.ink);
    await auditReadingContrast(text, `row ${index + 1}, ${theme}, inverted=${inverted}`);
    if (position >= 3) {
      await expect(text).toHaveCSS('background-color', palette.background);
      await expect(text).toHaveCSS('border-top-color', inverted ? palette.ink : line.color);
    }
  }
  await expect(row).not.toHaveCSS('cursor', 'pointer');
  await expect(row.getByRole('link')).toHaveCount(0);
  await expect(row.getByRole('button')).toHaveCount(0);
  expect(await row.evaluate((element) =>
    [element, ...element.querySelectorAll<HTMLElement>('*')].every((node) =>
      (node as HTMLElement).tabIndex === -1,
    ),
  )).toBe(true);
}

test.describe('Work row inversion with a compatible cursor', () => {
  test.use({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' });

  for (const { locale, label } of LOCALES) {
    for (const theme of THEMES) {
      test(`${locale}, ${theme}: every complete row inverts and reverts without an action`, async ({ page }) => {
        const rows = await openWork(page, locale, label, theme);
        expect(await page.evaluate(() => matchMedia('(hover: hover) and (pointer: fine)').matches)).toBe(true);
        await expect(rows).toHaveCount(5);
        const url = page.url();
        for (let index = 0; index < WORK_ENTRIES.length; index += 1) {
          const row = rows.nth(index);
          await page.mouse.move(0, 0);
          await row.scrollIntoViewIfNeeded();
          const content = await row.innerText();
          await expectRowPaint(row, index, theme, false);
          if (index === 0) await row.screenshot({ path: `.tmp/work-${locale}-${theme}-base.png` });
          await row.hover();
          await expectRowPaint(row, index, theme, true);
          if (index === 0) await row.screenshot({ path: `.tmp/work-${locale}-${theme}-inverted.png` });
          // Hovering text or a tag must keep the whole row inverted.
          await rowText(row, index).at(-1)!.hover();
          await expectRowPaint(row, index, theme, true);
          await row.click();
          expect(page.url()).toBe(url);
          expect(await row.innerText()).toBe(content);
          const neighbor = rows.nth((index + 1) % WORK_ENTRIES.length);
          await expect(neighbor).toHaveCSS('background-color', THEME_COLORS[theme].background);
          await page.mouse.move(0, 0);
          await expectRowPaint(row, index, theme, false);
          expect(await row.innerText()).toBe(content);
        }
      });
    }
  }
});

test.describe('Work without a hover cursor', () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 1000 },
    reducedMotion: 'reduce',
  });

  for (const { locale, label } of LOCALES) {
    for (const theme of THEMES) {
      test(`${locale}, ${theme}: touch leaves every row legible without a persistent inversion`, async ({ page }) => {
        const rows = await openWork(page, locale, label, theme);
        expect(await page.evaluate(() => matchMedia('(hover: none)').matches)).toBe(true);
        const url = page.url();
        for (let index = 0; index < WORK_ENTRIES.length; index += 1) {
          const row = rows.nth(index);
          await row.scrollIntoViewIfNeeded();
          const content = await row.innerText();
          await expectRowPaint(row, index, theme, false);
          await row.tap();
          await expectRowPaint(row, index, theme, false);
          await rowText(row, index).at(-1)!.tap();
          await expectRowPaint(row, index, theme, false);
          expect(page.url()).toBe(url);
          expect(await row.innerText()).toBe(content);
        }
      });
    }
  }
});

test.describe('Work on a touch-primary hybrid desktop', () => {
  test.use({
    hasTouch: true,
    isMobile: false,
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'no-preference',
  });

  for (const { locale, label } of LOCALES) {
    for (const theme of THEMES) {
      test(`${locale}, ${theme}: mouse and native touch remain informational without sticky hover`, async ({ page }) => {
        const rows = await openWork(page, locale, label, theme);
        const capabilities = await page.evaluate(() => ({
          touch: navigator.maxTouchPoints,
          coarse: matchMedia('(pointer: coarse)').matches,
          hover: matchMedia('(hover: hover)').matches,
        }));
        expect(capabilities.touch).toBeGreaterThan(0);
        expect(capabilities.coarse).toBe(true);
        expect(capabilities.hover).toBe(false);
        const url = page.url();
        for (let index = 0; index < WORK_ENTRIES.length; index++) {
          const row = rows.nth(index);
          await row.scrollIntoViewIfNeeded();
          await row.hover();
          await expectRowPaint(row, index, theme, false);
          await row.getByRole('heading').tap();
          await expectRowPaint(row, index, theme, false);
          await page.mouse.move(0, 0);
          await expectRowPaint(row, index, theme, false);
          expect(page.url()).toBe(url);
        }
      });
    }
  }
});
