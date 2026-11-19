import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LanguageSwitch from './LanguageSwitch';

const mockReplace = vi.fn();
const mockUsePathname = vi.fn(() => '/en/about');

vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({ replace: mockReplace }),
}));

function setLocation(url: string) {
  const parsed = new URL(url, 'http://localhost');
  Object.defineProperty(window, 'location', {
    value: {
      href: parsed.href,
      search: parsed.search,
      hash: parsed.hash,
    },
    configurable: true,
  });
}

describe('LanguageSwitch', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockUsePathname.mockReturnValue('/en/about');
    setLocation('http://localhost/en/about?utm=x#y');
  });

  test('shows the active language with aria-current', () => {
    render(
      <LanguageSwitch
        locale="es"
        ariaLabelEn="Switch to English"
        ariaLabelEs="Cambiar a español"
      />
    );
    const links = screen.getAllByRole('link');
    expect(links[1]).toHaveAttribute('aria-current', 'page');
    expect(links[0]).not.toHaveAttribute('aria-current');
  });

  test('offers both languages as accessible links by role', () => {
    render(
      <LanguageSwitch
        locale="en"
        ariaLabelEn="Switch to English"
        ariaLabelEs="Cambiar a español"
      />
    );
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', '/en/about?utm=x#y');
    expect(links[1]).toHaveAttribute('href', '/es/about?utm=x#y');
  });

  test('announces aria-label with the text passed by prop', () => {
    render(
      <LanguageSwitch
        locale="en"
        ariaLabelEn="Switch to English"
        ariaLabelEs="Cambiar a español"
      />
    );
    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('aria-label', 'Switch to English');
    expect(links[1]).toHaveAttribute('aria-label', 'Cambiar a español');
  });

  test('shows no visible text, only symbol and accessibility attributes', () => {
    render(
      <LanguageSwitch
        locale="en"
        ariaLabelEn="Switch to English"
        ariaLabelEs="Cambiar a español"
      />
    );
    const links = screen.getAllByRole('link');
    links.forEach((link) => {
      expect(link.textContent?.trim()).toBe('');
    });
  });

  test('navigates to English preserving search and hash on click', () => {
    render(
      <LanguageSwitch
        locale="es"
        ariaLabelEn="Switch to English"
        ariaLabelEs="Cambiar a español"
      />
    );
    const enLink = screen.getAllByRole('link')[0];
    fireEvent.click(enLink);
    expect(mockReplace).toHaveBeenCalledWith('/en/about?utm=x#y');
  });

  test('navigates to Spanish preserving search and hash on click', () => {
    render(
      <LanguageSwitch
        locale="en"
        ariaLabelEn="Switch to English"
        ariaLabelEs="Cambiar a español"
      />
    );
    const esLink = screen.getAllByRole('link')[1];
    fireEvent.click(esLink);
    expect(mockReplace).toHaveBeenCalledWith('/es/about?utm=x#y');
  });
});
