import { describe, expect, test, vi } from 'vitest';
import { hasLocale } from 'next-intl';

vi.mock('next-intl', () => ({
  hasLocale: vi.fn(() => true),
}));

vi.mock('next-intl/server', () => ({
  getRequestConfig: vi.fn((config) => config),
}));

vi.mock('next/root-params', () => ({
  locale: vi.fn(() => Promise.resolve('en')),
}));

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

describe('request', () => {
  test('module loads without errors', async () => {
    const { default: getRequestConfig } = await import('./request');
    expect(getRequestConfig).toBeDefined();
  });

  test('resolves locale and returns messages', async () => {
    const { default: configFn } = await import('./request');
    const result = await configFn({ requestLocale: Promise.resolve('en') });
    expect(result.locale).toBe('en');
    expect(result.messages).toBeDefined();
  });

  test('calls notFound for unsupported locale', async () => {
    vi.mocked(hasLocale).mockReturnValueOnce(false);
    const { default: configFn } = await import('./request');
    await expect(configFn({ requestLocale: Promise.resolve('fr') })).rejects.toThrow();
  });
});
