// e2e/console-errors.spec.ts
import { test, expect } from '@playwright/test';

const routes = ['/en', '/es'];

for (const route of routes) {
    test(`No console errors ${route}`, async ({ page }) => {
        const problems: string[] = [];

        page.on('console', (msg) => {
            if (['error', 'warning'].includes(msg.type())) {
                problems.push(`[${msg.type()}] ${msg.text()}`);
            }
        });
        page.on('pageerror', (err) => problems.push(`[pageerror] ${err.message}`));

        await page.goto(route);
        await page.waitForLoadState('networkidle');

        expect(problems, problems.join('\n')).toEqual([]);
    });
}