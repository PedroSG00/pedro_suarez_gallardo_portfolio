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

describe('LanguageSwitch (toggler)', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockUsePathname.mockReturnValue('/en/about');
    setLocation('http://localhost/en/about?utm=x#y');
  });

  test('renders a single toggler button without visible text', () => {
    render(
      <LanguageSwitch
        locale="en"
        ariaLabelEn="Switch to English"
        ariaLabelEs="Cambiar a español"
      />
    );
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button.textContent?.trim()).toBe('');
  });

  test('aria-pressed reflects the current language (true when English is active)', () => {
    render(
      <LanguageSwitch
        locale="en"
        ariaLabelEn="Switch to English"
        ariaLabelEs="Cambiar a español"
      />
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  test('aria-pressed is false when Spanish is active', () => {
    render(
      <LanguageSwitch
        locale="es"
        ariaLabelEn="Switch to English"
        ariaLabelEs="Cambiar a español"
      />
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });

  test('aria-label announces the language to switch to', () => {
    render(
      <LanguageSwitch
        locale="es"
        ariaLabelEn="Switch to English"
        ariaLabelEs="Cambiar a español"
      />
    );
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Switch to English'
    );
  });

  test('navigates to Spanish preserving search and hash on click', () => {
    render(
      <LanguageSwitch
        locale="en"
        ariaLabelEn="Switch to English"
        ariaLabelEs="Cambiar a español"
      />
    );
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(mockReplace).toHaveBeenCalledWith('/es/about?utm=x#y');
  });

  test('navigates to English preserving search and hash on click', () => {
    render(
      <LanguageSwitch
        locale="es"
        ariaLabelEn="Switch to English"
        ariaLabelEs="Cambiar a español"
      />
    );
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(mockReplace).toHaveBeenCalledWith('/en/about?utm=x#y');
  });

  test('navigates on Enter key', () => {
    render(
      <LanguageSwitch
        locale="en"
        ariaLabelEn="Switch to English"
        ariaLabelEs="Cambiar a español"
      />
    );
    const button = screen.getByRole('button');
    button.focus();
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(mockReplace).toHaveBeenCalledWith('/es/about?utm=x#y');
  });

  test('navigates on Space key', () => {
    render(
      <LanguageSwitch
        locale="en"
        ariaLabelEn="Switch to English"
        ariaLabelEs="Cambiar a español"
      />
    );
    const button = screen.getByRole('button');
    button.focus();
    fireEvent.keyDown(button, { key: ' ' });
    expect(mockReplace).toHaveBeenCalledWith('/es/about?utm=x#y');
  });

  test('has an href pointing to the other language (works without JS)', () => {
    render(
      <LanguageSwitch
        locale="en"
        ariaLabelEn="Switch to English"
        ariaLabelEs="Cambiar a español"
      />
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('href', '/es/about?utm=x#y');
  });

  test('renders null when locale is missing', () => {
    // @ts-expect-error - Testing missing required prop locale
    const { container } = render(<LanguageSwitch ariaLabelEn="Switch to English" ariaLabelEs="Cambiar a español" />);
    expect(container).toBeEmptyDOMElement();
  });

  test('renders null when ariaLabelEn is missing', () => {
    // @ts-expect-error - Testing missing required prop ariaLabelEn
    const { container } = render(<LanguageSwitch locale="en" ariaLabelEs="Cambiar a español" />);
    expect(container).toBeEmptyDOMElement();
  });

  test('renders null when ariaLabelEs is missing', () => {
    // @ts-expect-error - Testing missing required prop ariaLabelEs
    const { container } = render(<LanguageSwitch locale="en" ariaLabelEn="Switch to English" />);
    expect(container).toBeEmptyDOMElement();
  });
});
