import { describe, expect, test, vi } from 'vitest';

const navHelpers = {
  Link: {},
  redirect: {},
  usePathname: () => '/',
  useRouter: () => ({}),
  getPathname: () => '/',
};

vi.mock('next-intl/navigation', () => ({
  createNavigation: () => navHelpers,
}));

describe('navigation', () => {
  test('exports navigation helpers', async () => {
    const mod = await import('./navigation');
    expect(mod.Link).toBeDefined();
    expect(mod.redirect).toBeDefined();
    expect(typeof mod.usePathname).toBe('function');
    expect(typeof mod.useRouter).toBe('function');
    expect(typeof mod.getPathname).toBe('function');
  });
});
