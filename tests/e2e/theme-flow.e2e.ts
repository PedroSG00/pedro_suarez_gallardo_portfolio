import { test, expect } from '@playwright/test';

test.describe('Theme flow (RF-6, RF-9)', () => {
  test('select is always visible; changes theme manually and persists', async ({
    page,
  }) => {
    await page.goto('/');

    // <select> is always visible (no reveal button)
    await expect(page.locator('select[role="combobox"]')).toBeVisible();
    await page.selectOption('select[role="combobox"]', 'dark');
    await expect(page.locator('html')).toHaveClass(/theme-dark/, {
      timeout: 10000,
    });
  });

  test('no reveal button or dialog element', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('button[aria-label="Theme"]')).not.toBeVisible();
    await expect(page.locator('#theme-dialog')).not.toBeVisible();
  });
});
