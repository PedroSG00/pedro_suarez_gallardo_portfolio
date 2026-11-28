import { createHash } from 'node:crypto';
import { expect, test, type Page } from '@playwright/test';

const CVS = {
  en: {
    contact: 'Contact',
    label: 'CV',
    switchLabel: 'English',
    title: "Let's build something solid.",
    body: 'Tell me what you need. Email or LinkedIn, whichever is easier.',
    path: '/EN_Pedro_Suarez_Gallardo_CV.pdf',
    digest: 'eaa5726c8c198a0d3444969d096c82901480fe0dbfd1366519b425076014e47d',
  },
  es: {
    contact: 'Contacto',
    label: 'Currículum',
    switchLabel: 'Español',
    title: 'Construyamos algo sólido.',
    body: 'Cuéntame qué necesitas. Por email o LinkedIn, como te resulte más cómodo.',
    path: '/ES_Pedro_Suarez_Gallardo_CV.pdf',
    digest: '26027adc5e951c0d4db4e53e823e9b76a708f76bfdb2813748a7ec6639dcc476',
  },
} as const;

const SOCIALS = {
  LinkedIn: 'https://linkedin.com/in/pedro-suarez-gallardo',
  GitHub: 'https://github.com/PedroSG00',
};
const COPYRIGHT = '© 2026 Pedro Suárez Gallardo';

function contactRegion(page: Page, locale: keyof typeof CVS) {
  return page.getByRole('region', { name: CVS[locale].contact, exact: true });
}

test.use({ reducedMotion: 'reduce' });

for (const locale of ['en', 'es'] as const) {
  const cv = CVS[locale];
  const otherLocale = locale === 'en' ? 'es' : 'en';

  test(`serves the reviewed ${locale} CV from both link locations`, async ({ page, request }) => {
    await page.goto(`/${locale}`);
    const locations = [contactRegion(page, locale), page.getByRole('contentinfo')];
    for (const location of locations) {
      await expect(location.getByRole('link', { name: cv.label })).toHaveAttribute('href', cv.path);
    }

    const response = await request.get(cv.path, { maxRedirects: 0 });
    expect(response.status(), `${cv.path} must be available without a fallback`).toBe(200);
    expect(response.headers()['content-type']).toMatch(/^application\/pdf\b/);
    // Update only after reviewing the replacement PDF for legibility and language.
    const digest = createHash('sha256').update(await response.body()).digest('hex');
    expect(digest, `${cv.path} must match the reviewed ${locale} document`).toBe(cv.digest);
  });

  test(`updates Contact and opens the ${locale} CV from both locations after changing language`, async ({ page, context }) => {
    await page.goto(`/${otherLocale}`);
    const footer = page.getByRole('contentinfo');
    await expect(footer.getByText(COPYRIGHT, { exact: true })).toBeVisible();
    await page.getByRole('button', { name: cv.switchLabel }).click();
    await expect(page).toHaveURL(new RegExp(`/${locale}$`));

    const contact = contactRegion(page, locale);
    await expect(contact.getByRole('heading', { name: cv.title, exact: true })).toBeVisible();
    await expect(contact.getByText(cv.body, { exact: true })).toBeVisible();
    await expect(footer.getByText(COPYRIGHT, { exact: true })).toBeVisible();

    for (const location of [contact, footer]) {
      const [popup, response] = await Promise.all([
        page.waitForEvent('popup'),
        context.waitForEvent('response', (response) =>
          response.request().isNavigationRequest() && new URL(response.url()).pathname === cv.path,
        ),
        location.getByRole('link', { name: cv.label }).click(),
      ]);
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toMatch(/^application\/pdf\b/);
      await expect(page).toHaveURL(new RegExp(`/${locale}$`));
      await popup.close();
    }
  });

  test(`preserves destinations and readable email under the browser's ${locale} navigation restrictions`, async ({ page, baseURL, context }) => {
    await page.setContent(`<iframe title="Portfolio" sandbox="allow-same-origin allow-scripts"
      src="${baseURL}/${locale}#contact" style="width:100%;height:80vh"></iframe>`);
    const frame = page.frameLocator('iframe');
    const contact = frame.getByRole('region', { name: cv.contact, exact: true });
    const footer = frame.getByRole('contentinfo');
    const alerts = frame.getByRole('alert');
    const initialAlerts = await alerts.allTextContents();
    const address = 'suarezgallardopedro@gmail.com';

    for (const location of [contact, footer]) {
      const [blocked] = await Promise.all([
        page.waitForEvent('console', { predicate: (message) => /blocked opening.*sandboxed/i.test(message.text()) }),
        location.getByRole('link', { name: 'LinkedIn' }).click(),
      ]);
      expect(blocked.text()).toContain(SOCIALS.LinkedIn);
      await expect(location.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', SOCIALS.LinkedIn);
      await expect(alerts).toHaveText(initialAlerts);
      expect(context.pages()).toEqual([page]);

      const email = location.getByRole('link', { name: locale === 'en' ? /^Email\b/ : /^Correo\b/ });
      await expect(email).toHaveAttribute('href', `mailto:${address}`);
      await email.press('Enter');
      const visibleAddress = location.getByText(address, { exact: true });
      await expect(visibleAddress).toBeVisible();
      const selection = await visibleAddress.evaluate((element) => {
        const range = document.createRange();
        range.selectNodeContents(element);
        const selection = window.getSelection()!;
        selection.removeAllRanges();
        selection.addRange(range);
        return selection.toString();
      });
      expect(selection).toBe(address);
    }
  });

  test(`does not substitute another CV when the ${locale} destination returns 404`, async ({ page, context }) => {
    const requestedPaths: string[] = [];
    await context.route('**/*_CV.pdf', async (route) => {
      const { pathname } = new URL(route.request().url());
      requestedPaths.push(pathname);
      if (pathname === cv.path) {
        await route.fulfill({ status: 404, contentType: 'text/plain', body: 'Not found' });
      } else {
        await route.continue();
      }
    });

    await page.goto(`/${locale}`);
    const navigation = context.waitForEvent('response', (response) =>
      response.request().isNavigationRequest() && new URL(response.url()).pathname === cv.path,
    );
    await contactRegion(page, locale).getByRole('link', { name: cv.label, exact: true }).click();
    const response = await navigation;
    expect(response.status()).toBe(404);
    expect(await response.text()).toBe('Not found');
    await expect(page).toHaveURL(new RegExp(`/${locale}$`));
    expect(requestedPaths).toEqual([cv.path]);
  });

  test(`keeps the ${locale} portfolio usable when a social destination is unreachable`, async ({ page, context }) => {
    await context.route(SOCIALS.LinkedIn, (route) => route.abort('internetdisconnected'));
    await page.goto(`/${locale}`);
    const contact = contactRegion(page, locale);
    const footer = page.getByRole('contentinfo');
    for (const location of [contact, footer]) {
      for (const [name, href] of Object.entries(SOCIALS)) {
        await expect(location.getByRole('link', { name })).toHaveAttribute('href', href);
      }
    }

    const alerts = page.getByRole('alert');
    const initialAlerts = await alerts.allTextContents();
    const failed = context.waitForEvent('requestfailed', (request) => request.url() === SOCIALS.LinkedIn);
    await contact.getByRole('link', { name: 'LinkedIn', exact: true }).click();
    expect((await failed).failure()?.errorText).toBe('net::ERR_INTERNET_DISCONNECTED');
    await expect(page).toHaveURL(new RegExp(`/${locale}$`));
    await expect(alerts).toHaveText(initialAlerts);
    await expect(footer.getByRole('link', { name: cv.label })).toBeVisible();

    await page.getByRole('button', { name: CVS[otherLocale].switchLabel }).click();
    await expect(contactRegion(page, otherLocale)).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/${otherLocale}$`));
  });
}
