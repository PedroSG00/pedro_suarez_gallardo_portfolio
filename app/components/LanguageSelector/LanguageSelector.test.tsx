import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';

vi.mock('next/link', () => {
  const MockAnchor = React.forwardRef<HTMLAnchorElement, { children?: React.ReactNode; href: string }>(
    ({ children, href, ...props }, ref) => (
      <a ref={ref} href={href} {...props}>{children}</a>
    )
  );
  MockAnchor.displayName = 'MockAnchor';
  return {
    default: MockAnchor,
    Link: MockAnchor,
  };
});

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  usePathname: vi.fn(() => '/es/projects'),
  useLocale: vi.fn(),
}));

vi.mock('../../i18n/provider/use-locale', () => ({
  useLocale: vi.fn(),
}));

vi.mock('../../i18n/storage/storage', () => ({
  writeStorage: vi.fn(),
  writeCookie: vi.fn(),
}));

import { writeStorage, writeCookie } from '../../i18n/storage/storage';
import { useLocale } from '../../i18n/provider/use-locale';
import { Locale } from '../../i18n/config';
import LanguageSelector from './LanguageSelector';

const mockedWriteStorage = vi.mocked(writeStorage);
const mockedWriteCookie = vi.mocked(writeCookie);
const mockedUseLocale = vi.mocked(useLocale);

// T18: LanguageSelector.tsx — native links per language; unique writer of lang cookie (RF-4, RF-8)
// Done when: language change preserves route/query/hash, updates URL, adds history entry,
// saves preference only via cookie (never localStorage), and is the single write point.
describe('LanguageSelector — T18', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseLocale.mockReturnValue({
      locale: 'en',
      setLocale: vi.fn((next: Locale) => {
        writeCookie('lang', next);
      }),
      t: (key: string) => {
        const dict: Record<string, string> = {
          'languages.en': 'English',
          'languages.es': 'Español',
        };
        return dict[key] ?? key;
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders one link per locale with dictionary labels', () => {
    render(<LanguageSelector />);
    expect(screen.getByRole('link', { name: 'English' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Español' })).toBeInTheDocument();
  });

  it('each link navigates to the same route in the other language', () => {
    render(<LanguageSelector />);
    const esLink = screen.getByRole('link', { name: 'Español' });
    expect(esLink).toHaveAttribute('href', '/es/projects');
  });

  it('active state carries aria-current', () => {
    render(<LanguageSelector />);
    expect(screen.getByRole('link', { name: 'English' })).toHaveAttribute(
      'aria-current',
      'true'
    );
    expect(screen.getByRole('link', { name: 'Español' })).not.toHaveAttribute(
      'aria-current',
      'true'
    );
  });

  it('clicking a link calls setLocale (unique writer) and does not write to localStorage', () => {
    render(<LanguageSelector />);
    fireEvent.click(screen.getByRole('link', { name: 'Español' }));
    const { setLocale } = mockedUseLocale.mock.results[0]?.value;
    expect(setLocale).toHaveBeenCalledWith('es');
    expect(mockedWriteStorage).not.toHaveBeenCalled();
  });

  it('setLocale writes only the cookie (never localStorage)', () => {
    render(<LanguageSelector />);
    fireEvent.click(screen.getByRole('link', { name: 'Español' }));
    expect(mockedWriteCookie).toHaveBeenCalledWith('lang', 'es');
    expect(mockedWriteStorage).not.toHaveBeenCalledWith('lang', 'es');
  });

  it('exposes a stable test id per locale', () => {
    render(<LanguageSelector />);
    expect(screen.getByTestId('language-selector-en')).toBeInTheDocument();
    expect(screen.getByTestId('language-selector-es')).toHaveAttribute(
      'href',
      '/es/projects'
    );
  });
});
