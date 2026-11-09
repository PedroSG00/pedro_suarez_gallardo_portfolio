import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
  usePathname: vi.fn(() => '/es'),
}));

vi.mock('./storage', () => ({
  readStorage: vi.fn(() => null),
  writeStorage: vi.fn(),
  readCookie: vi.fn(() => null),
  writeCookie: vi.fn(),
}));

import { useLocale } from './use-locale';
import LocaleProvider from './locale-provider';
import { writeStorage, writeCookie } from './storage';

// T18: use-locale.ts — RF3, RF4, RF5, RNF6, RNF7
describe('useLocale — T18', () => {
  const dictionary = { nav: { home: 'Home' } };

  function Consumer() {
    const { locale, t, setLocale } = useLocale();
    return (
      <div>
        <span data-testid="locale">{locale}</span>
        <span data-testid="greeting">{t('nav.home')}</span>
        <button onClick={() => setLocale('en')}>to en</button>
        <button onClick={() => setLocale('es')}>to es</button>
      </div>
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
    Object.defineProperty(window, 'location', {
      value: { pathname: '/es/proyectos', search: '?q=1', hash: '#top' },
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
    expect(screen.getByTestId('greeting')).toHaveTextContent('Home');
  });

  it('setLocale writes localStorage, cookie, and navigates with router.push preserving path, query and hash', () => {
    render(
      <LocaleProvider locale="es" dictionary={dictionary}>
        <Consumer />
      </LocaleProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'to en' }));
    expect(writeStorage).toHaveBeenCalledWith('lang', 'en');
    expect(writeCookie).toHaveBeenCalledWith('lang', 'en');
    expect(mockPush).toHaveBeenCalledWith('/en/proyectos?q=1#top');
  });

  it('setLocale with valid locale navigates and persists', () => {
    render(
      <LocaleProvider locale="en" dictionary={dictionary}>
        <Consumer />
      </LocaleProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'to es' }));
    expect(writeStorage).toHaveBeenCalledWith('lang', 'es');
    expect(mockPush).toHaveBeenCalledWith('/es/proyectos?q=1#top');
  });
});
