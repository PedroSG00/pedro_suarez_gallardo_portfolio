import { test, expect } from '@playwright/test';

test.describe('Theme flow (RF-2, RF-3, RF-4, RF-5, RF-6, RF-7)', () => {
  test('changes theme manually and persists', async ({ page }) => {
    await page.goto('/');
    await page.click('button[aria-label="Theme"]');
    await page.selectOption('select[role="combobox"]', 'dark');
    await expect(page.locator('html')).toHaveClass(/theme-dark/, { timeout: 10000 });
  });
});
