import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm start -p 3000',
    url: 'http://127.0.0.1:3000',
    timeout: 120_000,
    reuseExistingServer: false,
  },
});
