import { test, expect } from '@playwright/test';

/**
 * PASO 0 — Reproducción del bug de tema (código ACTUAL).
 *
 * Escenario: SO en oscuro, elección guardada "light", recarga.
 * Esperado: <body> con fondo claro (light).
 * Hipótesis del bug: el root layout emite class="theme-system" fijo y el
 * CSS de .theme-system bajo prefers-color-scheme: dark gana, dejando el
 * fondo oscuro a pesar de que la elección es "light".
 */
test.describe('PASO 0 — repro: tema light con SO oscuro', () => {
  test('fondo de body claro tras guardar light y recargar con SO oscuro', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'dark' });

    // Navegar primero para tener un origen válido que permita localStorage.
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Guardar la elección "light" antes de recargar.
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Evidencia 1: clase de <html> y data-theme-choice tras la recarga.
    const htmlClass = await page.evaluate(() =>
      document.documentElement.className
    );
    const dataThemeChoice = await page.evaluate(() =>
      document.documentElement.dataset.themeChoice
    );

    // Evidencia 2: color real computado de <body>.
    const bodyBg = await page.evaluate(() =>
      getComputedStyle(document.body).backgroundColor
    );

    // eslint-disable-next-line no-console
    console.log('HTML class:', htmlClass);
    // eslint-disable-next-line no-console
    console.log('data-theme-choice:', dataThemeChoice);
    // eslint-disable-next-line no-console
    console.log('body backgroundColor:', bodyBg);

    expect(bodyBg).not.toBe('rgb(26, 26, 26)'); // #1a1a1a = oscuro
  });
});
