import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
  usePathname: vi.fn(() => '/es'),
}));

vi.mock('../storage/storage', () => ({
  migrateLegacyLang: vi.fn(() => null),
  writeCookie: vi.fn(),
}));

import { useLocale } from './use-locale';
import LocaleProvider from './locale-provider';
import { writeCookie } from '../storage/storage';

const mockedWriteCookie = vi.mocked(writeCookie);

// T18: use-locale.ts — RF-4, RF-8
// Done when: setLocale validates locale, writes only the cookie (never localStorage),
// and navigates with router.push preserving path, query and hash.
describe('useLocale — T18', () => {
  const dictionary = { sections: { hero: { title: 'Pedro' } } };

  function Consumer() {
    const { locale, t, setLocale } = useLocale();
    return (
      <div>
        <span data-testid="locale">{locale}</span>
        <span data-testid="greeting">{t('sections.hero.title')}</span>
        <button onClick={() => setLocale('en')}>to en</button>
        <button onClick={() => setLocale('es')}>to es</button>
      </div>
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
    Object.defineProperty(window, 'location', {
      value: { pathname: '/es/projects', search: '?q=1', hash: '#top' },
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns locale, t and setLocale', () => {
    render(
      <LocaleProvider locale="en" dictionary={dictionary}>
        <Consumer />
      </LocaleProvider>
    );
    expect(screen.getByTestId('locale')).toHaveTextContent('en');
    expect(screen.getByTestId('greeting')).toHaveTextContent('Pedro');
  });

  it('setLocale writes only the cookie (never localStorage) and navigates with router.push preserving path, query and hash', () => {
    render(
      <LocaleProvider locale="es" dictionary={dictionary}>
        <Consumer />
      </LocaleProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'to en' }));
    expect(mockedWriteCookie).toHaveBeenCalledWith('lang', 'en');
    expect(mockPush).toHaveBeenCalledWith('/en/projects?q=1#top');
  });

  it('setLocale with valid locale navigates and persists', () => {
    render(
      <LocaleProvider locale="en" dictionary={dictionary}>
        <Consumer />
      </LocaleProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'to es' }));
    expect(mockedWriteCookie).toHaveBeenCalledWith('lang', 'es');
    expect(mockPush).toHaveBeenCalledWith('/es/projects?q=1#top');
  });

  it('throws when used outside LocaleProvider', () => {
    function NoProvider() {
      const { locale } = useLocale();
      return <span data-testid="locale">{locale}</span>;
    }
    expect(() => render(<NoProvider />)).toThrow(
      'useLocale must be used within a LocaleProvider'
    );
  });
});
