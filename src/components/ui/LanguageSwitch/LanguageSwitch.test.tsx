import { beforeEach, describe, expect, test, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithIntl } from '@/test/render-with-intl';
import enMessages from '../../../../messages/en.json';
import LanguageSwitch from './LanguageSwitch';

const { mockReplace } = vi.hoisted(() => ({ mockReplace: vi.fn() }));
const mockUsePathname = vi.fn(() => '/about');

vi.mock('@/i18n/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

vi.mock('next/navigation', () => ({
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
    mockUsePathname.mockReturnValue('/about');
    mockReplace.mockReset();
    window.sessionStorage.removeItem('psg-locale-navigation');
    setLocation('http://localhost/en/about?utm=x#y');
  });

  test('renders one language control that shows the active locale', () => {
    renderWithIntl(
      <LanguageSwitch
        locale="en"
        ariaLabelEn="Switch to English"
        ariaLabelEs="Cambiar a español"
      />
    );
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('EN');
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
    expect(mockReplace).toHaveBeenCalledWith('/es/about?utm=x', { scroll: false });
    expect(window.sessionStorage.getItem('psg-locale-navigation')).toContain('"hash":"#y"');
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
    expect(mockReplace).toHaveBeenCalledWith('/en/about?utm=x', { scroll: false });
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
    expect(mockReplace).toHaveBeenCalledWith('/es/about?utm=x', { scroll: false });
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
    expect(mockReplace).toHaveBeenCalledWith('/es/about?utm=x', { scroll: false });
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

  test('ignores invalid session storage pending navigation', () => {
    window.sessionStorage.setItem('psg-locale-navigation', 'not-json');
    renderWithIntl(
      <LanguageSwitch
        locale="en"
        ariaLabelEn="Switch to English"
        ariaLabelEs="Cambiar a español"
      />,
      { locale: 'en' },
    );
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(mockReplace).toHaveBeenCalledWith('/es/about?utm=x', { scroll: false });
  });

  test('processes pending navigation from session storage', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo');
    // Make requestAnimationFrame synchronous so the double rAF completes
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => cb());
    const pending = {
      locale: 'en',
      search: '?utm=x',
      hash: '#about',
      scrollY: 100,
      headingTop: null,
      startedAt: Date.now() - 1000,
    };
    window.sessionStorage.setItem('psg-locale-navigation', JSON.stringify(pending));
    setLocation('http://localhost/en/about#about');

    renderWithIntl(
      <LanguageSwitch
        locale="en"
        ariaLabelEn="Switch to English"
        ariaLabelEs="Cambiar a español"
      />,
      { locale: 'en' },
    );

    expect(scrollTo).toHaveBeenCalled();
    scrollTo.mockRestore();
    window.sessionStorage.removeItem('psg-locale-navigation');
  });

  test('records activation position on pointer down', () => {
    renderWithIntl(
      <LanguageSwitch
        locale="en"
        ariaLabelEn="Switch to English"
        ariaLabelEs="Cambiar a español"
      />,
      { locale: 'en' },
    );
    const button = screen.getByRole('button');
    fireEvent.pointerDown(button);
    fireEvent.click(button);
    expect(mockReplace).toHaveBeenCalledWith('/es/about?utm=x', { scroll: false });
  });

  test('records activation position on pointer down with hash heading', () => {
    setLocation('http://localhost/en/about#about');
    const heading = document.createElement('h2');
    heading.id = 'about';
    heading.setAttribute('data-section-heading', '');
    heading.style.position = 'absolute';
    heading.style.top = '500px';
    document.body.appendChild(heading);

    renderWithIntl(
      <LanguageSwitch
        locale="en"
        ariaLabelEn="Switch to English"
        ariaLabelEs="Cambiar a español"
      />,
      { locale: 'en' },
    );
    const button = screen.getByRole('button');
    fireEvent.pointerDown(button);
    fireEvent.click(button);
    expect(mockReplace).toHaveBeenCalledWith('/es/about', { scroll: false });
    document.body.removeChild(heading);
  });
});
