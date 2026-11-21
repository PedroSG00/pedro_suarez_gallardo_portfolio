import { expect, test } from '@playwright/test';

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
        const actions = page.getByRole('main').getByRole('link');
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

    });
  }
});
