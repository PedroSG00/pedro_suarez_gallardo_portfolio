import { expect, test, type Page } from '@playwright/test';

test.describe('theme first paint', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('HTML of /en brings theme <script> in <head> without data-theme on the server', async ({ page }) => {
    const response = await page.goto('/en');
    expect(response, 'navigation should return a response').not.toBeNull();
    expect(response?.status()).toBeLessThan(400);

    const serverHtml = await response?.text();
    expect(serverHtml).not.toContain('data-theme');
    expect(serverHtml).toContain('(function(w,d,ls){');

    const inlineScripts = page.locator('head > script#theme-bootstrap');
    await expect(inlineScripts).toHaveCount(1);
    const content = await inlineScripts.first().textContent();
    expect(content).toContain('psg-theme');
    expect(content).toContain('dataset.theme');
  });

  test('HTML of /es brings theme <script> in <head> without data-theme on the server', async ({ page }) => {
    const response = await page.goto('/es');
    expect(response, 'navigation should return a response').not.toBeNull();
    expect(response?.status()).toBeLessThan(400);

    const serverHtml = await response?.text();
    expect(serverHtml).not.toContain('data-theme');
    expect(serverHtml).toContain('(function(w,d,ls){');

    const inlineScripts = page.locator('head > script#theme-bootstrap');
    await expect(inlineScripts).toHaveCount(1);
    const content = await inlineScripts.first().textContent();
    expect(content).toContain('psg-theme');
    expect(content).toContain('dataset.theme');
  });

  test('<html> carries mono font class and correct lang, without Google Fonts requests', async ({ page }) => {
    let googleFontRequests = 0;
    page.on('request', (request) => {
      if (
        request.url().includes('fonts.googleapis.com') ||
        request.url().includes('fonts.gstatic.com')
      ) {
        googleFontRequests += 1;
      }
    });

    const response = await page.goto('/en');
    expect(response?.status()).toBeLessThan(400);
    expect(googleFontRequests).toBe(0);

    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'en');
    const className = await html.getAttribute('class');
    expect(className).toBeTruthy();

    const fontVar = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--font-geist-mono')
        .trim()
    );
    expect(fontVar).not.toBe('');
  });

  test('no reduced motion and no seeded choice, loads /en without hydration errors', async ({ page }) => {
    const pageErrors: string[] = [];
    const hydrateConsoleErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('hydrat')) {
        hydrateConsoleErrors.push(msg.text());
      }
    });

    const response = await page.goto('/en');
    expect(response?.status()).toBeLessThan(400);
    expect(pageErrors).toEqual([]);
    expect(hydrateConsoleErrors).toEqual([]);
  });

  async function surfaceColor(page: Page): Promise<string> {
    return page.evaluate(() => {
      const probe = document.createElement('div');
      probe.style.backgroundColor = 'var(--color-surface)';
      document.documentElement.appendChild(probe);
      const cs = getComputedStyle(probe).backgroundColor;
      document.documentElement.removeChild(probe);
      return cs;
    });
  }

  test('seeded dark choice applies before first paint on /en with light system', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    const first = await page.goto('/en');
    expect(first?.status()).toBeLessThan(400);
    await expect(page.locator('html')).not.toHaveAttribute('data-theme');
    await page.evaluate(() => localStorage.setItem('psg-theme', 'dark'));
    const second = await page.goto('/en');
    expect(second?.status()).toBeLessThan(400);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    const htmlBg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).backgroundColor
    );
    const probeBg = await surfaceColor(page);
    expect(htmlBg).toBe(probeBg);
  });

  test('seeded light choice applies before first paint on /es with dark system', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    const first = await page.goto('/es');
    expect(first?.status()).toBeLessThan(400);
    await expect(page.locator('html')).not.toHaveAttribute('data-theme');
    await page.evaluate(() => localStorage.setItem('psg-theme', 'light'));
    const second = await page.goto('/es');
    expect(second?.status()).toBeLessThan(400);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    const htmlBg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).backgroundColor
    );
    const probeBg = await surfaceColor(page);
    expect(htmlBg).toBe(probeBg);
  });

  test('persistence: theme stays applied after navigation and localStorage keeps the value', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    const first = await page.goto('/en');
    expect(first?.status()).toBeLessThan(400);
    await page.evaluate(() => localStorage.setItem('psg-theme', 'dark'));
    const second = await page.goto('/en');
    expect(second?.status()).toBeLessThan(400);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    const value = await page.evaluate(() => localStorage.getItem('psg-theme'));
    expect(value).toBe('dark');
  });

  test('no contrary frame: data-theme is applied once during parsing and does not change after load', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });

    // Primera carga sin tema: no hay data-theme
    const first = await page.goto('/en');
    expect(first?.status()).toBeLessThan(400);
    await expect(page.locator('html')).not.toHaveAttribute('data-theme');

    // Sembrar localStorage y navegar de nuevo: el script inline establece
    // data-theme during parsing (before first paint).
    await page.evaluate(() => localStorage.setItem('psg-theme', 'dark'));
    const second = await page.goto('/en');
    expect(second?.status()).toBeLessThan(400);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    // After load and two animation frames, data-theme does not change: there
    // is no frame with the contrary theme nor later mutations.
    await page.waitForLoadState('load');
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            resolve();
          });
        });
      });
    });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('no system preference: paints light without data-theme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'no-preference' });
    const response = await page.goto('/en');
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('html')).not.toHaveAttribute('data-theme');
    const htmlBg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).backgroundColor
    );
    const probeBg = await surfaceColor(page);
    expect(htmlBg).toBe(probeBg);
  });

  async function computedProbe(page: Page, property: string, value: string): Promise<string> {
    return page.evaluate(
      (args: unknown) => {
        const [prop, val] = args as [string, string];
        const probe = document.createElement('div');
        probe.style.setProperty(prop, val);
        document.documentElement.appendChild(probe);
        const cs = getComputedStyle(probe).getPropertyValue(prop);
        document.documentElement.removeChild(probe);
        return cs;
      },
      [property, value]
    );
  }

  async function checkInvertedBlock(page: Page): Promise<void> {
    const pageSurface = await computedProbe(page, 'background-color', 'var(--color-surface)');
    const pageInk = await computedProbe(page, 'background-color', 'var(--color-ink)');
    const pageLine = await computedProbe(page, 'border-color', 'var(--color-line)');

    await page.evaluate(() => {
      const div = document.createElement('div');
      div.className = 'inverted';
      div.innerHTML = '<span class="child">texto</span>';
      document.documentElement.appendChild(div);
    });

    const blockBg = await page.evaluate(() => {
      const div = document.querySelector('div.inverted')!;
      return getComputedStyle(div).backgroundColor;
    });
    const childColor = await page.evaluate(() => {
      const child = document.querySelector('div.inverted .child')!;
      return getComputedStyle(child).color;
    });
    const blockBorder = await page.evaluate(() => {
      const div = document.querySelector('div.inverted')!;
      return getComputedStyle(div).borderColor;
    });

    // The block bg/text pair is the opposite of the page
    expect(blockBg).toBe(pageInk);
    expect(childColor).toBe(pageSurface);
    // The line keeps its tone
    expect(blockBorder).toBe(pageLine);
  }

  test('inverted block: light data-theme, light system', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/en'); // establece origen para localStorage
    await page.evaluate(() => localStorage.setItem('psg-theme', 'light'));
    const response = await page.goto('/en');
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await checkInvertedBlock(page);
  });

  test('inverted block: dark data-theme, light system', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/en'); // establece origen para localStorage
    await page.evaluate(() => localStorage.setItem('psg-theme', 'dark'));
    const response = await page.goto('/en');
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await checkInvertedBlock(page);
  });

  test('inverted block: no attribute, light system', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    const response = await page.goto('/en');
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('html')).not.toHaveAttribute('data-theme');
    await checkInvertedBlock(page);
  });

  test('inverted block: no attribute, dark system', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    const response = await page.goto('/en');
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('html')).not.toHaveAttribute('data-theme');
    await checkInvertedBlock(page);
  });

  test('reduced motion: state and theme durations in 0ms', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const response = await page.goto('/en');
    expect(response?.status()).toBeLessThan(400);
    const durationState = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--duration-state')
        .trim()
    );
    const durationTheme = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--duration-theme')
        .trim()
    );
    expect(['0ms', '0s']).toContain(durationState);
    expect(['0ms', '0s']).toContain(durationTheme);
  });

  test('no JavaScript: system theme without data-theme and visible content', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      colorScheme: 'dark',
    });
    const page = await context.newPage();
    try {
      const response = await page.goto('/en');
      expect(response?.status()).toBeLessThan(400);
      await expect(page.locator('html')).not.toHaveAttribute('data-theme');
      // Dark background: dark-mode surface (#121110 -> rgb(18, 17, 16))
      await expect(page.locator('html')).toHaveCSS(
        'background-color',
        'rgb(18, 17, 16)'
      );
      // The localized h1 is still visible (content does not depend on JS)
      await expect(page.locator('h1')).toBeVisible();
    } finally {
      await context.close();
    }
  });

  test('pageshow persisted: changing localStorage updates the attribute', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/en'); // establece origen para localStorage
    await page.evaluate(() => localStorage.setItem('psg-theme', 'dark'));
    const first = await page.goto('/en');
    expect(first?.status()).toBeLessThan(400);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    // Change localStorage and dispatch pageshow with persisted: true (bfcache proxy)
    await page.evaluate(() => {
      localStorage.setItem('psg-theme', 'light');
      const event = new Event('pageshow');
      Object.defineProperty(event, 'persisted', { value: true });
      window.dispatchEvent(event);
    });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    // Remove the choice and dispatch again: attribute is removed
    await page.evaluate(() => {
      localStorage.removeItem('psg-theme');
      const event = new Event('pageshow');
      Object.defineProperty(event, 'persisted', { value: true });
      window.dispatchEvent(event);
    });
    await expect(page.locator('html')).not.toHaveAttribute('data-theme');
  });

  test('theme toggle changes light/dark, announces state and persists', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    const response = await page.goto('/en');
    expect(response?.status()).toBeLessThan(400);

    const themeBtn = page.getByRole('button', { name: /toggle theme|cambiar tema/i });
    await expect(themeBtn).toBeVisible();
    await expect(themeBtn).toHaveAttribute('aria-pressed', 'false');
    await expect(themeBtn).toHaveAttribute('data-theme-icon', 'sun');

    // Switch to dark
    await themeBtn.click();
    await expect(themeBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(themeBtn).toHaveAttribute('data-theme-icon', 'moon');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    // Persists after reload
    await page.reload();
    await expect(themeBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    // Switch back to light
    await themeBtn.click();
    await expect(themeBtn).toHaveAttribute('aria-pressed', 'false');
    await expect(themeBtn).toHaveAttribute('data-theme-icon', 'sun');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('keeps the selected theme and correct icon when switching locales', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/en');

    const theme = page.getByRole('button', { name: /toggle theme/i });
    await theme.click();
    await expect(theme).toHaveAttribute('data-theme-icon', 'moon');
    await page.getByRole('button', { name: 'Español' }).click();
    await expect(page).toHaveURL(/\/es$/);

    const spanishTheme = page.getByRole('button', { name: /cambiar tema/i });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(spanishTheme).toHaveAttribute('aria-pressed', 'true');
    await expect(spanishTheme).toHaveAttribute('data-theme-icon', 'moon');

    await spanishTheme.click();
    await expect(spanishTheme).toHaveAttribute('data-theme-icon', 'sun');
    await page.getByRole('button', { name: 'English' }).click();
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(page.getByRole('button', { name: /toggle theme/i })).toHaveAttribute(
      'data-theme-icon',
      'sun',
    );
  });

  test('system dark preference shows the dark-mode icon before a manual choice', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/en');

    const theme = page.getByRole('button', { name: /toggle theme/i });
    await expect(page.locator('html')).not.toHaveAttribute('data-theme');
    await expect(theme).toHaveAttribute('aria-pressed', 'true');
    await expect(theme).toHaveAttribute('data-theme-icon', 'moon');
  });

  test('no JavaScript: theme control does not appear', async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      colorScheme: 'dark',
    });
    const page = await context.newPage();
    try {
      const response = await page.goto('/en');
      expect(response?.status()).toBeLessThan(400);
      // No theme toggle button without JS
      await expect(
        page.getByRole('button', { name: /toggle theme|cambiar tema/i })
      ).not.toBeVisible();
      // Content still visible
      await expect(page.locator('h1')).toBeVisible();
    } finally {
      await context.close();
    }
  });

  test('exactly one inline theme script in <head>', async ({ page }) => {
    await page.goto('/en');
    const inlineScripts = page.locator('head > script#theme-bootstrap');
    await expect(inlineScripts).toHaveCount(1);
    const content = await inlineScripts.first().textContent();
    expect(content).toContain('psg-theme');
  });
});
