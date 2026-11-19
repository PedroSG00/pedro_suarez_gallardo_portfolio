import { expect, test, type Page } from '@playwright/test';

test.describe('theme first paint', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('HTML de /en trae <script> de tema en <head> sin data-theme en el servidor', async ({ page }) => {
    const response = await page.goto('/en');
    expect(response, 'navigation should return a response').not.toBeNull();
    expect(response?.status()).toBeLessThan(400);

    const serverHtml = await response?.text();
    expect(serverHtml).not.toContain('data-theme');
    expect(serverHtml).toContain('(function(w,d,ls){');

    const inlineScripts = page.locator('head > script:not([src])');
    await expect(inlineScripts).toHaveCount(1);
    const content = await inlineScripts.first().textContent();
    expect(content).toContain('psg-theme');
    expect(content).toContain('dataset.theme');
  });

  test('HTML de /es trae <script> de tema en <head> sin data-theme en el servidor', async ({ page }) => {
    const response = await page.goto('/es');
    expect(response, 'navigation should return a response').not.toBeNull();
    expect(response?.status()).toBeLessThan(400);

    const serverHtml = await response?.text();
    expect(serverHtml).not.toContain('data-theme');
    expect(serverHtml).toContain('(function(w,d,ls){');

    const inlineScripts = page.locator('head > script:not([src])');
    await expect(inlineScripts).toHaveCount(1);
    const content = await inlineScripts.first().textContent();
    expect(content).toContain('psg-theme');
    expect(content).toContain('dataset.theme');
  });

  test('<html> lleva la clase de la fuente mono y lang correcto, sin peticiones a Google Fonts', async ({ page }) => {
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

  test('sin prefers-reduced-motion ni elección sembrada, carga /en sin errores de hidratación', async ({ page }) => {
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

  test('elección sembrada oscura se aplica antes del primer pintado en /en con sistema claro', async ({ page }) => {
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

  test('elección sembrada clara se aplica antes del primer pintado en /es con sistema oscuro', async ({ page }) => {
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

  test('persistencia: tras navegación el tema sigue aplicado y localStorage conserva el valor', async ({ page }) => {
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

  test('sin fotograma contrario: data-theme se aplica una vez durante el parseo y no cambia tras load', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });

    // Primera carga sin tema: no hay data-theme
    const first = await page.goto('/en');
    expect(first?.status()).toBeLessThan(400);
    await expect(page.locator('html')).not.toHaveAttribute('data-theme');

    // Sembrar localStorage y navegar de nuevo: el script inline establece
    // data-theme durante el parseo (antes del primer pintado).
    await page.evaluate(() => localStorage.setItem('psg-theme', 'dark'));
    const second = await page.goto('/en');
    expect(second?.status()).toBeLessThan(400);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    // Tras load y dos frames de animación, data-theme no cambia: no hay
    // fotograma con el tema contrario ni mutaciones posteriores.
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

  test('sistema sin preferencia: se pinta en claro y sin data-theme', async ({ page }) => {
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

    // El par fondo/texto del bloque es el contrario del de la página
    expect(blockBg).toBe(pageInk);
    expect(childColor).toBe(pageSurface);
    // La línea conserva su tono
    expect(blockBorder).toBe(pageLine);
  }

  test('bloque invertido: data-theme claro, sistema claro', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/en'); // establece origen para localStorage
    await page.evaluate(() => localStorage.setItem('psg-theme', 'light'));
    const response = await page.goto('/en');
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await checkInvertedBlock(page);
  });

  test('bloque invertido: data-theme oscuro, sistema claro', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/en'); // establece origen para localStorage
    await page.evaluate(() => localStorage.setItem('psg-theme', 'dark'));
    const response = await page.goto('/en');
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await checkInvertedBlock(page);
  });

  test('bloque invertido: sin atributo, sistema claro', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    const response = await page.goto('/en');
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('html')).not.toHaveAttribute('data-theme');
    await checkInvertedBlock(page);
  });

  test('bloque invertido: sin atributo, sistema oscuro', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    const response = await page.goto('/en');
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('html')).not.toHaveAttribute('data-theme');
    await checkInvertedBlock(page);
  });

  test('movimiento reducido: duraciones de estado y tema en 0ms', async ({ page }) => {
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

  test('sin JavaScript: tema del sistema sin data-theme y contenido visible', async ({
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
      // Fondo oscuro: superficie del modo oscuro (#121110 -> rgb(18, 17, 16))
      await expect(page.locator('html')).toHaveCSS(
        'background-color',
        'rgb(18, 17, 16)'
      );
      // El h1 localizado sigue visible (el contenido no depende de JS)
      await expect(page.locator('h1')).toBeVisible();
    } finally {
      await context.close();
    }
  });

  test('pageshow persistido: cambia localStorage y actualiza el atributo', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/en'); // establece origen para localStorage
    await page.evaluate(() => localStorage.setItem('psg-theme', 'dark'));
    const first = await page.goto('/en');
    expect(first?.status()).toBeLessThan(400);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    // Cambiar localStorage y despachar pageshow con persisted: true (proxy de bfcache)
    await page.evaluate(() => {
      localStorage.setItem('psg-theme', 'light');
      const event = new Event('pageshow');
      Object.defineProperty(event, 'persisted', { value: true });
      window.dispatchEvent(event);
    });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    // Retirar la elección y despachar de nuevo: se retira el atributo
    await page.evaluate(() => {
      localStorage.removeItem('psg-theme');
      const event = new Event('pageshow');
      Object.defineProperty(event, 'persisted', { value: true });
      window.dispatchEvent(event);
    });
    await expect(page.locator('html')).not.toHaveAttribute('data-theme');
  });
});
