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
}));

vi.mock('../../i18n/use-locale', () => ({
  useLocale: vi.fn(() => ({
    locale: 'en',
    setLocale: vi.fn(),
    t: (key: string) => key,
  })),
}));

vi.mock('../../i18n/storage', () => ({
  readStorage: vi.fn(() => null),
  writeStorage: vi.fn(),
  readCookie: vi.fn(() => null),
  writeCookie: vi.fn(),
}));

import { writeStorage, writeCookie } from '../../i18n/storage';
import { useLocale } from '../../i18n/use-locale';
import LanguageSelector from './LanguageSelector';

const mockedWriteStorage = vi.mocked(writeStorage);
const mockedWriteCookie = vi.mocked(writeCookie);
const mockedUseLocale = vi.mocked(useLocale);

// T19: LanguageSelector.tsx — RF2, RF7
describe('LanguageSelector — T19', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseLocale.mockReturnValue({
      locale: 'en',
      setLocale: vi.fn(),
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

  it('renders one option per locale with dictionary labels', () => {
    render(<LanguageSelector />);
    expect(screen.getByRole('link', { name: 'English' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Español' })).toBeInTheDocument();
  });

  it('each option is a Link to the same route in the other language', () => {
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

  it('clicking an option writes localStorage and cookie via persistLocale, without calling setLocale', () => {
    render(<LanguageSelector />);
    fireEvent.click(screen.getByRole('link', { name: 'Español' }));
    expect(mockedWriteStorage).toHaveBeenCalledWith('lang', 'es');
    expect(mockedWriteCookie).toHaveBeenCalledWith('lang', 'es');
    const { setLocale } = mockedUseLocale.mock.results[0]?.value;
    expect(setLocale).not.toHaveBeenCalled();
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
