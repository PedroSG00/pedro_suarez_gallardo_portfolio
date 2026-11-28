import { expect, test, type Locator, type Page } from '@playwright/test';

const CONTACT_NAMES = { en: 'Contact', es: 'Contacto' };
const FULL_PAINT = { opacity: 1, clipped: false, animated: false };

function contactContent(page: Page, locale: keyof typeof CONTACT_NAMES) {
  const region = page.getByRole('region', { name: CONTACT_NAMES[locale], exact: true });
  return {
    title: region.getByRole('heading', { level: 3 }),
    blocks: region.getByRole('heading').or(region.getByRole('paragraph')).or(region.getByRole('link')),
    footer: page.getByRole('contentinfo'),
    links: region.getByRole('link'),
  };
}

async function paint(locator: Locator) {
  return locator.evaluate((element) => {
    let opacity = 1;
    let clipped = false;
    let animated = false;
    for (let node: Element | null = element; node; node = node.parentElement) {
      const style = getComputedStyle(node);
      opacity *= Number(style.opacity);
      clipped ||= /[1-9]/.test(style.clipPath);
      animated ||= style.animationName !== 'none';
    }
    return { opacity, clipped, animated };
  });
}

async function placeTitle(title: Locator, fraction: number) {
  await title.evaluate((element, viewportFraction) => {
    let top = 0;
    for (let node = element as HTMLElement | null; node; node = node.offsetParent as HTMLElement | null) {
      top += node.offsetTop;
    }
    window.scrollTo({ top: top - innerHeight * viewportFraction, behavior: 'instant' });
  }, fraction);
}

async function scrollToEnd(page: Page) {
  await page.evaluate(() => window.scrollTo({
    top: document.documentElement.scrollHeight,
    behavior: 'instant',
  }));
}

for (const locale of ['en', 'es'] as const) {
  for (const theme of ['light', 'dark'] as const) {
    test.describe(`${locale} / ${theme}: Contact reveal`, () => {
      test.use({ colorScheme: theme, viewport: { width: 1440, height: 768 } });

      test('reverses its clipped entrance and remains readable at the end without animating the footer', async ({ page }) => {
        await page.goto(`/${locale}`);
        const { title, blocks, footer } = contactContent(page, locale);
        await page.evaluate(() => document.fonts.ready);

        const partialEntry = async () => {
          // Content above Contact can finish laying out after the first scroll.
          await placeTitle(title, 0.98);
          const state = await paint(title);
          return state.clipped && state.opacity > 0 && state.opacity < 1;
        };
        await expect.poll(partialEntry).toBe(true);

        await placeTitle(title, 0.5);
        await expect.poll(() => paint(title)).toMatchObject({ opacity: 1, clipped: false });

        await expect.poll(partialEntry).toBe(true);
        await expect.poll(() => paint(footer)).toEqual(FULL_PAINT);

        await scrollToEnd(page);
        await expect(footer).toBeInViewport();
        await expect.poll(() => paint(footer)).toEqual(FULL_PAINT);
        for (const block of await blocks.all()) {
          await expect(block).toBeInViewport({ ratio: 1 });
          await expect.poll(() => paint(block)).toMatchObject({ opacity: 1, clipped: false });
        }

        // Make room to scroll past Contact and distinguish an entry-only reveal
        // from an exit masked solely by the end-of-page visibility override.
        await page.evaluate(() => {
          const spacer = document.createElement('div');
          spacer.style.height = '100vh';
          document.body.append(spacer);
        });
        await placeTitle(title, -0.6);
        await expect.poll(() => paint(title)).toMatchObject({ opacity: 1, clipped: false });
      });

      test('is fully painted on the first frame that shows the Contact anchor', async ({ page }) => {
        await page.addInitScript(() => {
          const capture = () => {
            const visible = [...document.querySelectorAll('#contact h2, #contact h3, #contact p, #contact a')]
              .filter((block) => {
                const { top, bottom } = block.getBoundingClientRect();
                return top < innerHeight && bottom > 0;
              });
            if (!visible.some((block) => block.matches('h3'))) {
              requestAnimationFrame(capture);
              return;
            }
            let complete = true;
            for (const block of visible) {
              for (let node: Element | null = block; node; node = node.parentElement) {
                const style = getComputedStyle(node);
                complete &&= style.opacity === '1' && !/[1-9]/.test(style.clipPath);
              }
            }
            document.documentElement.dataset.contactFirstFrame = String(complete);
          };
          requestAnimationFrame(capture);
        });
        await page.goto(`/${locale}#contact`);
        await expect(page.locator('html')).toHaveAttribute('data-contact-first-frame', 'true');
      });

      test('stays fully painted and static with reduced motion', async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto(`/${locale}`);
        const { title } = contactContent(page, locale);
        for (const position of [0.98, 0.5, 0.03]) {
          await placeTitle(title, position);
          await expect.poll(() => paint(title)).toEqual(FULL_PAINT);
        }
      });

      test.describe('without JavaScript', () => {
        test.use({ javaScriptEnabled: false });

        test('keeps Contact and Footer visible with all destinations keyboard reachable', async ({ page }) => {
          await page.goto(`/${locale}#contact`);
          const { blocks, links, footer } = contactContent(page, locale);
          await scrollToEnd(page);
          await expect(links).toHaveCount(4);
          for (const block of await blocks.all()) {
            await expect(block).toBeInViewport({ ratio: 1 });
            await expect(block).not.toHaveText('');
            await expect.poll(() => paint(block)).toEqual(FULL_PAINT);
          }
          await expect(footer.getByText('© 2026 Pedro Suárez Gallardo', { exact: true })).toBeVisible();
          await expect(footer.getByText('suarezgallardopedro@gmail.com', { exact: true })).toBeVisible();
          for (const group of [links, footer.getByRole('link')]) {
            await expect(group).toHaveCount(4);
            await group.first().focus();
            for (const [index, link] of (await group.all()).entries()) {
              await expect(link).toBeVisible();
              await expect(link).toBeFocused();
              await expect(link).toHaveAttribute('href', index === 0 ? /^mailto:.+/ : /^(https:\/\/|\/).+/);
              await page.keyboard.press('Tab');
            }
          }
        });
      });
    });
  }
}
