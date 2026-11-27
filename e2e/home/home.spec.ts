import { expect, test } from '@playwright/test';
import { getContrastRatio } from '../about/about-helpers';

const DESTINATIONS = [
  { id: 'about' },
  { id: 'work' },
  { id: 'stack' },
  { id: 'contact' },
];

const H2_BY_LOCALE: Record<string, string[]> = {
  en: ['About', 'Work', 'Stack', 'Contact'],
  es: ['Sobre mí', 'Trabajo', 'Stack', 'Contacto'],
};

const ABOUT_CONTENT_BY_LOCALE: Record<string, string> = {
  en: 'Large data sets, live updates, complex forms, and state people can rely on.',
  es: 'Grandes conjuntos de datos, actualizaciones en tiempo real, formularios complejos y estados en los que se puede confiar.',
};

const WORK_TITLE_BY_LOCALE: Record<string, string> = {
  en: "What I've built.",
  es: 'Lo que he construido.',
};

const CONTACT_COPY_BY_LOCALE: Record<string, { title: string; body: string }> = {
  en: {
    title: "Let's build something solid.",
    body: 'Tell me what you need. Email or LinkedIn, whichever is easier.',
  },
  es: {
    title: 'Construyamos algo sólido.',
    body: 'Cuéntame qué necesitas. Por email o LinkedIn, como te resulte más cómodo.',
  },
};

const CONTACT_EMAIL_LABELS: Record<string, string> = { en: 'Email', es: 'Correo' };

test.describe('home smoke', () => {
  test('the home responds without page errors', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    const response = await page.goto('/');

    expect(response, 'navigation should return a response').not.toBeNull();
    expect(response?.status()).toBeLessThan(400);
    expect(pageErrors).toEqual([]);
  });
});

test.describe('home structure', () => {
  for (const [locale, expectedH2] of Object.entries(H2_BY_LOCALE)) {
    test.describe(`/${locale}`, () => {
      test('shows the localized heading hierarchy and ordered sections without project links', async ({
        page,
      }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto(`/${locale}`);

        await expect(
          page.getByRole('heading', { level: 1, name: 'Pedro Suárez Gallardo' }),
        ).toHaveCount(1);

        const headings = page.getByRole('heading', { level: 2 });
        await expect(headings).toHaveCount(4);
        for (const [index, expected] of expectedH2.entries()) {
          await expect(headings.nth(index)).toHaveAccessibleName(expected);
        }
        await expect(page.locator('main > section').first()).toHaveAttribute(
          'aria-labelledby',
          'hero-name',
        );

        const sections = page.locator('main > section');
        await expect(sections).toHaveCount(5);
        for (const [{ id }, index] of DESTINATIONS.map((destination, index) => [
          destination,
          index,
        ] as const)) {
          const section = page.locator(`#${id}`);
          await expect(section).toHaveCount(1);
          await expect(sections.nth(index + 1)).toHaveAttribute('id', id);
          const heading = section.locator('h2').first();
          await expect(heading).toHaveCount(1);
          const headingId = await heading.getAttribute('id');
          expect(headingId).not.toBeNull();
          await expect(section).toHaveAttribute('aria-labelledby', headingId!);
          await expect(section.locator('h2')).toHaveCount(1);
          if (id === 'work') {
            await expect(section.getByRole('heading', {
              level: 3,
              name: WORK_TITLE_BY_LOCALE[locale],
              exact: true,
            })).toHaveCount(1);
            await expect(section.getByRole('heading', { level: 4 })).toHaveCount(5);
          } else if (id === 'stack') {
            await expect(section.getByRole('heading', { level: 3 })).toHaveCount(6);
            await expect(section.locator('h1, h4, h5, h6')).toHaveCount(0);
          } else if (id === 'contact') {
            const { title, body } = CONTACT_COPY_BY_LOCALE[locale];
            const contact = page.getByRole('region', { name: expectedH2[index], exact: true });
            await expect(contact).toHaveCount(1);
            await expect(contact).toHaveAttribute('id', 'contact');
            await expect(contact.getByRole('heading', { level: 2 })).toHaveText(`04 / ${expectedH2[index]}`);
            await expect(contact.getByRole('heading', { level: 3, name: title, exact: true })).toBeVisible();
            await expect(contact.getByText(body, { exact: true })).toBeVisible();
          } else {
            await expect(section.locator('h1, h3, h4, h5, h6')).toHaveCount(0);
          }
        }

        const work = page.getByRole('region', { name: expectedH2[1], exact: true });
        await expect(work).toHaveCount(1);
        const workHeading = work.getByRole('heading', { level: 2, name: expectedH2[1] });
        await expect(workHeading).toHaveText(`02 / ${expectedH2[1]}`);
        await expect(page.getByRole('heading', {
          level: 2,
          name: expectedH2[1],
          exact: true,
        })).toHaveCount(1);
        await expect(work.getByRole('heading', {
          level: 3,
          name: WORK_TITLE_BY_LOCALE[locale],
          exact: true,
        })).toBeVisible();
        await expect(work.getByRole('list')).toHaveCount(1);
        await expect(work.getByRole('listitem')).toHaveCount(5);

        const about = page.getByRole('region', { name: expectedH2[0] });
        await expect(about.getByText(ABOUT_CONTENT_BY_LOCALE[locale])).toBeVisible();
        await expect(about.locator('p')).toHaveCount(5);
        await expect(page.locator('#about')).toHaveCount(1);
        await expect(page.getByRole('heading', { name: expectedH2[0] })).toHaveCount(1);
        await expect(page.getByRole('link', { name: /project|proyecto/i })).toHaveCount(0);
        await expect(page.locator('a[href*="/projects"]')).toHaveCount(0);
      });

      for (const [index, id] of ['about', 'work'].entries()) {
        test(`navigation keeps the ${id} destination and leaves its heading accessible`, async ({
          page,
        }) => {
          await page.emulateMedia({ reducedMotion: 'reduce' });
          await page.goto(`/${locale}`);
          await page.getByRole('navigation').getByRole('link', {
            name: expectedH2[index],
            exact: true,
          }).click();

          await expect(page).toHaveURL(new RegExp(`#${id}$`));
          const heading = page.getByRole('region', {
            name: expectedH2[index],
            exact: true,
          }).getByRole('heading', { level: 2, name: expectedH2[index], exact: true });
          await expect(heading).toBeVisible();
          await expect(heading).toBeInViewport();
          await expect(heading).toBeFocused();
        });
      }

      test('the hero and footer share a readable, inset desktop layout', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto(`/${locale}`);
        const heading = page.getByRole('heading', { level: 1 });
        const hero = page.getByRole('region').filter({ has: heading });
        const actions = hero.getByRole('link');
        const footer = page.getByRole('contentinfo');
        await expect(actions).toHaveCount(2);
        const [title, primary, secondary, footerLink] = await Promise.all([
          heading.boundingBox(),
          actions.first().boundingBox(),
          actions.last().boundingBox(),
          footer.getByRole('link').first().boundingBox(),
        ]);
        expect(title?.x).toBeGreaterThan(0);
        expect(primary?.x).toBe(title?.x);
        expect(secondary?.y).toBe(primary?.y);
        expect(footerLink?.x).toBe(title?.x);
      });

      test('the footer matches Contact destinations and only announces new tabs to assistive technology', async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto(`/${locale}`);

        const contact = page.getByRole('region', { name: expectedH2[3], exact: true });
        const footer = page.getByRole('contentinfo');
        const links = footer.getByRole('link');
        const labels = locale === 'es' ? ['Correo', 'LinkedIn', 'GitHub', 'Currículum'] : ['Email', 'LinkedIn', 'GitHub', 'CV'];
        const newTab = locale === 'es' ? 'se abre en una pestaña nueva' : 'opens in a new tab';

        await expect(links).toHaveCount(labels.length);
        for (const [index, label] of labels.entries()) {
          const footerLink = links.nth(index);
          const contactLink = contact.getByRole('link', { name: label, exact: index !== 0 });
          await expect(footerLink).toHaveAttribute('href', (await contactLink.getAttribute('href'))!);
          if (index === 0) {
            await expect(footerLink).toHaveAccessibleName(label);
            await expect(footerLink).not.toHaveAttribute('target', '_blank');
          } else {
            await expect(footerLink).toHaveAccessibleName(`${label} ${newTab}`);
            await expect(footerLink).toHaveAttribute('target', '_blank');
            await expect(footerLink).toHaveAttribute('rel', 'noreferrer noopener');
            const notice = footerLink.getByText(newTab, { exact: true });
            await expect(notice).toHaveCSS('clip-path', 'inset(50%)');
          }
        }
      });

      for (const colorScheme of ['light', 'dark'] as const) {
        test(`the ${colorScheme} contact email is prominent and inverts on hover and keyboard focus`, async ({ page }) => {
          await page.emulateMedia({ colorScheme });
          await page.goto(`/${locale}`);
          expect(await page.evaluate(() => matchMedia('(hover: hover)').matches)).toBe(true);

          const name = expectedH2[3];
          const navigationLink = page.getByRole('navigation').getByRole('link', { name, exact: true });
          const contact = page.getByRole('region', { name, exact: true });
          const email = contact.getByRole('link', { name: CONTACT_EMAIL_LABELS[locale] });
          const address = email.getByText(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
          const readColors = () => address.evaluate((element) => ({
            foreground: getComputedStyle(element).color,
            background: getComputedStyle(element.closest('a')!).backgroundColor,
          }));
          const addressSize = await address.evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
          const secondarySizes = await contact.getByRole('link', {
            name: /^(LinkedIn|GitHub|CV|Currículum)$/,
          }).evaluateAll((elements) => elements.map((element) => parseFloat(getComputedStyle(element).fontSize)));
          expect(secondarySizes).toHaveLength(3);
          expect(addressSize).toBeGreaterThanOrEqual(2 * Math.max(...secondarySizes));

          const rest = await readColors();
          const inverted = { foreground: rest.background, background: rest.foreground };
          expect(getContrastRatio(rest.foreground, rest.background)).toBeGreaterThanOrEqual(4.5);

          await email.hover();
          await expect.poll(readColors).toEqual(inverted);
          const hover = await readColors();
          expect(getContrastRatio(hover.foreground, hover.background)).toBeGreaterThanOrEqual(4.5);
          await page.mouse.move(0, 0);
          await expect.poll(readColors).toEqual(rest);

          await navigationLink.click();
          await expect(contact.getByRole('heading', { level: 2 })).toBeFocused();
          await page.mouse.move(0, 0);
          await page.keyboard.press('Tab');
          await expect(email).toBeFocused();
          await expect.poll(readColors).toEqual(hover);
          await page.keyboard.press('Tab');
          await expect(contact.getByRole('link', { name: 'LinkedIn' })).toBeFocused();
          await expect.poll(readColors).toEqual(rest);
        });
      }

      test('the visible email fits at 200% text size and still activates with Enter', async ({ page }) => {
        await page.setViewportSize({ width: 320, height: 720 });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto(`/${locale}#contact`);
        const name = expectedH2[3];
        const contact = page.getByRole('region', { name, exact: true });
        const email = contact.getByRole('link', { name: CONTACT_EMAIL_LABELS[locale] });
        const address = email.getByText(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
        const fontSize = () => address.evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
        const initialSize = await fontSize();
        await page.addStyleTag({ content: 'html { font-size: 200%; }' });
        await expect.poll(fontSize).toBeGreaterThanOrEqual(initialSize * 2);
        await expect(address).toBeVisible();
        await expect(email).toHaveAttribute('href', `mailto:${await address.innerText()}`);

        const fits = await address.evaluate((element) => {
          const range = document.createRange();
          range.selectNodeContents(element);
          const lines = [...range.getClientRects()];
          const link = element.closest('a')!.getBoundingClientRect();
          const viewport = document.documentElement.clientWidth;
          return lines.length > 0 && link.left >= 0 && link.right <= viewport
            && lines.every(({ left, right }) => left >= link.left && right <= link.right)
            && document.documentElement.scrollWidth === viewport;
        });
        expect(fits).toBe(true);

        await email.focus();
        await expect(email).toBeFocused();
        await email.evaluate((element) => {
          element.addEventListener('click', (event) => {
            event.preventDefault(); // Keep the OS mail handler out of the test.
            element.setAttribute('data-mail-activated', 'true');
          }, { once: true });
        });
        await page.keyboard.press('Enter');
        await expect(email).toHaveAttribute('data-mail-activated', 'true');
      });

    });
  }
});
