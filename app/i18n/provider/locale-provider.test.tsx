import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import LocaleProvider from './locale-provider';
import { useLocale } from './use-locale';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  usePathname: vi.fn(() => '/es'),
}));

vi.mock('../storage/storage', () => ({
  migrateLegacyLang: vi.fn(() => null),
}));

import { migrateLegacyLang } from '../storage/storage';

const mockedMigrateLegacyLang = vi.mocked(migrateLegacyLang);

// T17: locale-provider.tsx — RF-1, RF-3, RF-4
describe('LocaleProvider — T17', () => {
  const dictionary = { sections: { hero: { title: 'Pedro' } } };

  function Consumer() {
    const { locale, t, setLocale } = useLocale();
    return (
      <div>
        <span data-testid="locale">{locale}</span>
        <span data-testid="greeting">{t('sections.hero.title')}</span>
        <button onClick={() => setLocale('es')}>to es</button>
        <button onClick={() => setLocale('en')}>to en</button>
      </div>
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exposes t and returns translation of the active language', () => {
    render(
      <LocaleProvider locale="en" dictionary={dictionary}>
        <Consumer />
      </LocaleProvider>
    );
    expect(screen.getByTestId('greeting')).toHaveTextContent('Pedro');
  });

  it('setLocale changes the locale and re-renders (cookie write is use-locale responsibility)', () => {
    render(
      <LocaleProvider locale="en" dictionary={dictionary}>
        <Consumer />
      </LocaleProvider>
    );
    expect(screen.getByTestId('locale')).toHaveTextContent('en');
    fireEvent.click(screen.getByRole('button', { name: 'to es' }));
    expect(screen.getByTestId('locale')).toHaveTextContent('es');
  });

  it('setLocale ignores unsupported locale (no change)', () => {
    render(
      <LocaleProvider locale="en" dictionary={dictionary}>
        <Consumer />
      </LocaleProvider>
    );
    expect(screen.getByTestId('locale')).toHaveTextContent('en');
    fireEvent.click(screen.getByRole('button', { name: 'to en' }));
    expect(screen.getByTestId('locale')).toHaveTextContent('en');
  });

  it('runs the one-time legacy migration on mount', () => {
    render(
      <LocaleProvider locale="en" dictionary={dictionary}>
        <Consumer />
      </LocaleProvider>
    );
    expect(mockedMigrateLegacyLang).toHaveBeenCalledTimes(1);
  });

  it('keeps the URL locale even when a migrated cookie differs', () => {
    mockedMigrateLegacyLang.mockReturnValue('es');
    render(
      <LocaleProvider locale="en" dictionary={dictionary}>
        <Consumer />
      </LocaleProvider>
    );
    expect(screen.getByTestId('locale')).toHaveTextContent('en');
  });
});
