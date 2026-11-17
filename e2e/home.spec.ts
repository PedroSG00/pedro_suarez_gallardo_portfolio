import { expect, test } from '@playwright/test';

test('the home responds without page errors', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  const response = await page.goto('/');

  expect(response, 'navigation should return a response').not.toBeNull();
  expect(response?.status()).toBeLessThan(400);
  expect(pageErrors).toEqual([]);
});
