import { expect, test, type Locator } from '@playwright/test';
import {
  ABOUT_LOCALES,
  PORTRAIT_NAME,
  STATEMENTS,
  THEMES,
  VIEWPORT_HEIGHT,
  openAbout,
} from './about-helpers';

test('About lays out the statement above the portrait and biography on desktop, with the portrait first on mobile', async ({
  page,
}) => {
  const about = await openAbout(page, 'en', { reducedMotion: 'reduce' });
  const statement = about.getByRole('group', { name: STATEMENTS.en });
  const portrait = about.getByRole('img', { name: PORTRAIT_NAME });
  const firstParagraph = about.getByRole('paragraph').first();
  const lastParagraph = about.getByRole('paragraph').last();
  const qualities = about.getByRole('list');
  const bounds = () => Promise.all(
    [statement, portrait, firstParagraph, lastParagraph, qualities].map((target) =>
      target.evaluate((node) => node.getBoundingClientRect().toJSON() as DOMRect),
    ),
  );

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
    const context = document.createElement('canvas').getContext('2d')!;
    context.font = `${style.fontSize} ${style.fontFamily}`;
    return node.getBoundingClientRect().width / context.measureText('0').width;
  });
  expect(charactersPerLine).toBeLessThanOrEqual(65.1);

  await page.setViewportSize({ width: 390, height: 844 });
  const [mobileHeadline, mobilePhoto, mobileFirst, mobileLast, mobileTags] = await bounds();
  expect(mobileHeadline.bottom).toBeLessThan(mobileFirst.top);
  expect(mobileHeadline.bottom).toBeLessThan(mobilePhoto.top);
  expect(mobilePhoto.bottom).toBeLessThan(mobileFirst.top);
  expect(mobileLast.bottom).toBeLessThan(mobileTags.top);
});

const VIEWPORTS = [
  { label: '320px', width: 320, fontSize: '' },
  { label: '1920px', width: 1920, fontSize: '' },
  { label: '320px at 200% text', width: 320, fontSize: '200%' },
] as const;

for (const { locale, messages, shared } of ABOUT_LOCALES) {
  for (const theme of THEMES) {
    test(`page fits 320px, 1920px and 200% text in ${locale}/${theme}`, async ({ page }) => {
      const about = await openAbout(page, locale, { theme, reducedMotion: 'reduce' });
      const { nav } = shared;
      const header = page.getByRole('banner');
      const footer = page.getByRole('contentinfo');
      const hero = page.getByRole('region', { name: 'Pedro Suárez Gallardo' });
      const heading = about.getByRole('heading', { name: messages.intro, exact: true });
      const numbered = (locators: Locator[], prefix: string) =>
        locators.map((locator, index) => ({ label: `${prefix} ${index + 1}`, locator }));

      const targets: Array<{ label: string; locator: Locator }> = [
        { label: 'navbar', locator: header },
        { label: 'navbar identity', locator: header.getByRole('link', { name: 'Pedro Suárez Gallardo' }) },
        { label: 'hero', locator: hero },
        { label: 'hero name', locator: hero.getByRole('heading', { level: 1, name: 'Pedro Suárez Gallardo' }) },
        ...numbered(await hero.getByRole('paragraph').all(), 'hero paragraph'),
        ...numbered(await hero.getByRole('link').all(), 'hero link'),
        { label: 'heading', locator: heading },
        { label: 'statement', locator: about.getByRole('group', { name: messages.statement }) },
        ...numbered(await about.getByRole('paragraph').all(), 'paragraph'),
        ...numbered(await about.getByRole('listitem').all(), 'value'),
        { label: 'portrait', locator: about.getByRole('img', { name: messages.portraitAlt }) },
        ...[nav.experience, nav.stack, nav.contact].map((label) => ({
          label: `${label} heading`,
          locator: page.getByRole('heading', { level: 2, name: label, exact: true }),
        })),
        { label: 'footer', locator: footer },
        { label: 'footer copyright', locator: footer.getByRole('paragraph') },
        ...numbered(await footer.getByRole('link').all(), 'footer link'),
      ];
      const defaultRootFontSize = Number.parseFloat(
        await page.locator('html').evaluate((element) => getComputedStyle(element).fontSize),
      );

      for (const viewport of VIEWPORTS) {
        const where = (label: string) => `${locale}/${theme} at ${viewport.label}, ${label}`;
        await page.setViewportSize({ width: viewport.width, height: VIEWPORT_HEIGHT });
        await page.evaluate((fontSize) => {
          if (fontSize) document.documentElement.style.fontSize = fontSize;
          else document.documentElement.style.removeProperty('font-size');
          window.scrollTo({ top: 0, behavior: 'instant' });
        }, viewport.fontSize);
        await page.evaluate(() => document.fonts.ready);

        if (viewport.fontSize) {
          const enlarged = Number.parseFloat(
            await page.locator('html').evaluate((element) => getComputedStyle(element).fontSize),
          );
          expect(enlarged).toBeCloseTo(defaultRootFontSize * 2);
        }

        await expect(about).toBeVisible();
        await expect(header).toBeVisible();
        await expect(hero).toBeVisible();
        for (const { label, locator } of targets) {
          if (label !== 'navbar identity') await expect(locator).toBeVisible();
        }

        const documentWidth = await page.evaluate(() => ({
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
        }));

        for (const { label, locator } of targets) {
          const layout = await locator.evaluate((element) => {
            const bounds = element.getBoundingClientRect();
            let clipped = false;
            for (let current: Element | null = element; current; current = current.parentElement) {
              const style = getComputedStyle(current);
              clipped ||=
                (['hidden', 'clip'].includes(style.overflowX) && current.scrollWidth > current.clientWidth + 1) ||
                (['hidden', 'clip'].includes(style.overflowY) && current.scrollHeight > current.clientHeight + 1);
              if (current.getAttribute('role') === 'region') break;
            }
            return {
              left: bounds.left,
              right: bounds.right,
              width: bounds.width,
              height: bounds.height,
              clientWidth: element.clientWidth,
              scrollWidth: element.scrollWidth,
              clipped,
            };
          });
          expect(layout.width, `${where(label)}: visible width`).toBeGreaterThan(0);
          expect(layout.height, `${where(label)}: visible height`).toBeGreaterThan(0);
          expect(layout.left, `${where(label)}: left edge`).toBeGreaterThanOrEqual(-1);
          expect(layout.right, `${where(label)}: right edge`)
            .toBeLessThanOrEqual(documentWidth.clientWidth + 1);
          // The decorative cursor extends the h1's scrollWidth beyond its text box.
          if (label !== 'hero name') {
            expect(layout.scrollWidth, `${where(label)}: text width`).toBeLessThanOrEqual(layout.clientWidth);
          }
          expect(layout.clipped, `${where(label)}: clipping`).toBe(false);
        }

        for (const [index, control] of (await header.getByRole('button').all()).entries()) {
          const edges = await control.evaluate((element) => {
            const { left, right } = element.getBoundingClientRect();
            return { left, right };
          });
          expect(edges.left, `${where(`navbar control ${index + 1}`)}: left edge`).toBeGreaterThanOrEqual(-1);
          expect(edges.right, `${where(`navbar control ${index + 1}`)}: right edge`)
            .toBeLessThanOrEqual(documentWidth.clientWidth + 1);
        }

        expect(documentWidth.scrollWidth, `${where('document')}: width`)
          .toBeLessThanOrEqual(documentWidth.clientWidth);

        if (!viewport.fontSize) continue;

        await expect(header.getByRole('button', { name: shared.menu.open })).toBeVisible();
        await expect(header.getByRole('button', { name: shared.theme.toggle })).toBeVisible();
        await expect(header.getByRole('button', {
          name: locale === 'en' ? shared.langSwitch.es : shared.langSwitch.en,
        })).toBeVisible();

        const skipLink = page.getByRole('link', { name: shared.skipToContent });
        await page.keyboard.press('Tab');
        await expect(skipLink).toBeFocused();
        await expect(skipLink).toBeInViewport({ ratio: 1 });
        await page.keyboard.press('Tab');

        await header.getByRole('button', { name: shared.menu.open }).click();
        const menu = header.getByRole('navigation', { name: nav.label });
        const menuLayout = await menu.evaluate((element) => ({
          clientWidth: element.clientWidth,
          scrollWidth: element.scrollWidth,
        }));
        expect(menuLayout.scrollWidth).toBeLessThanOrEqual(menuLayout.clientWidth);
        expect(await page.evaluate(() => document.documentElement.scrollWidth))
          .toBeLessThanOrEqual(documentWidth.clientWidth);

        for (const name of [nav.about, nav.experience, nav.stack, nav.contact]) {
          const link = menu.getByRole('link', { name, exact: true });
          await expect(link).toBeInViewport({ ratio: 1 });
          const linkLayout = await link.evaluate((element) => ({
            clientWidth: element.clientWidth,
            scrollWidth: element.scrollWidth,
          }));
          expect(linkLayout.scrollWidth, `${name}: mobile menu text width`)
            .toBeLessThanOrEqual(linkLayout.clientWidth);
        }
        await menu.getByRole('link', { name: nav.experience, exact: true }).click();
        await expect(page).toHaveURL(/#work$/);
        await expect(menu).toBeHidden();
        await expect(page.getByRole('heading', { level: 2, name: nav.experience, exact: true }))
          .toBeFocused();
      }
    });
  }
}
