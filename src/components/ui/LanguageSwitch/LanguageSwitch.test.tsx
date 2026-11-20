import { beforeEach, describe, expect, test, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithIntl } from '@/test/render-with-intl';
import enMessages from '../../../../messages/en.json';
import LanguageSwitch from './LanguageSwitch';

const mockUsePathname = vi.fn(() => '/about');

vi.mock('@/i18n/navigation', () => ({
  usePathname: () => mockUsePathname(),
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
    mockUsePathname.mockReturnValue('/about');
    setLocation('http://localhost/en/about?utm=x#y');
  });

  test('renders a single toggler button without visible text', () => {
    renderWithIntl(
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
    renderWithIntl(
      <LanguageSwitch
        locale="en"
        ariaLabelEn="Switch to English"
        ariaLabelEs="Cambiar a español"
      />
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  test('aria-pressed is false when Spanish is active', () => {
    renderWithIntl(
      <LanguageSwitch
        locale="es"
        ariaLabelEn="Switch to English"
        ariaLabelEs="Cambiar a español"
      />
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });

  test('aria-label announces the language to switch to', () => {
    renderWithIntl(
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
    renderWithIntl(
      <LanguageSwitch
        locale="en"
        ariaLabelEn="Switch to English"
        ariaLabelEs="Cambiar a español"
      />
    );
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(window.location.href).toBe('/es/about?utm=x#y');
  });

  test('navigates to English preserving search and hash on click', () => {
    renderWithIntl(
      <LanguageSwitch
        locale="es"
        ariaLabelEn="Switch to English"
        ariaLabelEs="Cambiar a español"
      />
    );
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(window.location.href).toBe('/en/about?utm=x#y');
  });

  test('navigates on Enter key', () => {
    renderWithIntl(
      <LanguageSwitch
        locale="en"
        ariaLabelEn="Switch to English"
        ariaLabelEs="Cambiar a español"
      />
    );
    const button = screen.getByRole('button');
    button.focus();
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(window.location.href).toBe('/es/about?utm=x#y');
  });

  test('navigates on Space key', () => {
    renderWithIntl(
      <LanguageSwitch
        locale="en"
        ariaLabelEn="Switch to English"
        ariaLabelEs="Cambiar a español"
      />
    );
    const button = screen.getByRole('button');
    button.focus();
    fireEvent.keyDown(button, { key: ' ' });
    expect(window.location.href).toBe('/es/about?utm=x#y');
  });

  test('has an href pointing to the other language (works without JS)', () => {
    renderWithIntl(
      <LanguageSwitch
        locale="en"
        ariaLabelEn="Switch to English"
        ariaLabelEs="Cambiar a español"
      />
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('href', '/es/about?utm=x#y');
  });

  test('uses next-intl locale and message labels by default', () => {
    renderWithIntl(<LanguageSwitch />, { locale: 'es' });
    const button = screen.getByRole('button', { name: 'English' });
    expect(button).toHaveAttribute('href', '/en/about?utm=x#y');
  });

  test('renders null when a switch label is unavailable', () => {
    const messages = {
      ...enMessages,
      shared: {
        ...enMessages.shared,
        langSwitch: { ...enMessages.shared.langSwitch, es: '' },
      },
    };
    const { container } = renderWithIntl(<LanguageSwitch />, { messages });
    expect(container).toBeEmptyDOMElement();
  });

  test('renders null when both switch labels are empty', () => {
    const messages = {
      ...enMessages,
      shared: {
        ...enMessages.shared,
        langSwitch: { en: '', es: '' },
      },
    };
    const { container } = renderWithIntl(<LanguageSwitch />, { messages });
    expect(container).toBeEmptyDOMElement();
  });
});
