import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';

vi.mock('./brand/Brand', () => ({
  Brand: function Brand({ name }: { name: string }) {
    return <div data-testid="brand">{name}</div>;
  },
}));
vi.mock('./nav/NavDisclosure', () => ({
  NavDisclosure: function NavDisclosure({ navLabel }: { navLabel: string }) {
    return <nav data-testid="navigation" aria-label={navLabel} />;
  },
}));
vi.mock('./language/LanguageMenu', () => ({
  LanguageMenu: function LanguageMenu() {
    return <div data-testid="language-menu" />;
  },
}));
vi.mock('./theme/ThemeToggle', () => ({
  ThemeToggle: function ThemeToggle() {
    return <button data-testid="theme-toggle" />;
  },
}));

import SiteHeader from './SiteHeader';
import type { Locale } from '../../i18n/config';
import type { ThemeValue } from '../../theme/constants';
import type { DestinationId } from '../../navigation/destinations';

const LABELS: Record<DestinationId, string> = {
  home: 'Home',
  experience: 'Experience',
  projects: 'Projects',
  stack: 'Stack',
  contact: 'Contact',
};

const LANGUAGE_LABELS = {
  label: 'Language',
  aria: {
    en: 'English. Change language',
    es: 'Español. Cambiar idioma',
  },
};

const LANGUAGES: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
};

const STATE_LABELS: Record<ThemeValue, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

const ARIA_LABELS: Record<ThemeValue, string> = {
  light: 'Light theme. Switch to dark theme',
  dark: 'Dark theme. Switch to system theme',
  system: 'System theme. Switch to light theme',
};

// T14 (004): SiteHeader — RF-1, RF-8
// Done when: <header role="banner" aria-label>, <nav aria-label>, order
// brand → navigation → language → theme and zero visible strings written in
// the component.
function renderHeader(props: Partial<Parameters<typeof SiteHeader>[0]> = {}) {
  const defaults = {
    brandName: 'Pedro Suárez Gallardo',
    navLabel: 'Primary navigation',
    labels: LABELS,
    locale: 'en' as Locale,
    pathname: '/en',
    activeMark: '▪',
    menuLabel: 'Menu',
    languageLabels: LANGUAGE_LABELS,
    languages: LANGUAGES,
    triggerLabel: 'English',
    stateLabels: STATE_LABELS,
    ariaLabels: ARIA_LABELS,
    headerLabel: 'Site header',
  };
  return render(<SiteHeader {...defaults} {...props} />);
}

describe('SiteHeader — T14 (RF-1, RF-8)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a banner with the header aria-label', () => {
    renderHeader({ headerLabel: 'Cabecera del sitio' });
    expect(
      screen.getByRole('banner', { name: 'Cabecera del sitio' })
    ).toBeInTheDocument();
  });

  it('renders a navigation landmark with the nav aria-label', () => {
    renderHeader({ navLabel: 'Navegación principal' });
    expect(
      screen.getByRole('navigation', { name: 'Navegación principal' })
    ).toBeInTheDocument();
  });

  it('renders in the order brand → navigation → language → theme', () => {
    renderHeader();
    const banner = screen.getByRole('banner');
    const html = banner.innerHTML;
    expect(screen.getByTestId('brand')).toBeInTheDocument();
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
    expect(screen.getByTestId('language-menu')).toBeInTheDocument();
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    expect(html.indexOf('data-testid="brand"')).toBeLessThan(
      html.indexOf('data-testid="navigation"')
    );
    expect(html.indexOf('data-testid="navigation"')).toBeLessThan(
      html.indexOf('data-testid="language-menu"')
    );
    expect(html.indexOf('data-testid="language-menu"')).toBeLessThan(
      html.indexOf('data-testid="theme-toggle"')
    );
  });

  it('writes no visible text of its own (all text comes from props)', () => {
    renderHeader({
      brandName: 'Nombre raro',
      navLabel: 'Etiqueta rara',
      headerLabel: 'Banner raro',
    });
    const banner = screen.getByRole('banner', { name: 'Banner raro' });
    // Only the brand renders visible text among the mocked children; the
    // header itself writes nothing.
    expect(banner.textContent).toBe('Nombre raro');
  });
});

// T20 (004): Altura real y scroll-margin — RF-3, RF-4, RNF-4
// Done when: --header-height refleja la altura medida al montar y tras
// resize, con un respaldo CSS que deja el titular debajo de la cabecera
// antes de medir.
describe('SiteHeader — T20 (RF-3, RF-4, RNF-4)', () => {
  function mockHeaderHeights(heights: number[]) {
    let call = 0;
    const measure = vi.fn(
      () => ({ height: heights[Math.min(call++, heights.length - 1)] } as unknown as DOMRect)
    );
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(measure);
    return measure;
  }

  beforeEach(() => {
    vi.restoreAllMocks();
    document.documentElement.style.removeProperty('--header-height');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    document.documentElement.style.removeProperty('--header-height');
  });

  it('sets --header-height on document.documentElement after mount', () => {
    mockHeaderHeights([80]);
    renderHeader();
    expect(document.documentElement.style.getPropertyValue('--header-height')).toBe('80px');
  });

  it('rounds the measured height up so the title never clips by a subpixel', () => {
    mockHeaderHeights([80.4]);
    renderHeader();
    expect(document.documentElement.style.getPropertyValue('--header-height')).toBe('81px');
  });

  it('keeps the CSS fallback when the header reports no measurable height', () => {
    mockHeaderHeights([0]);
    renderHeader();
    expect(document.documentElement.style.getPropertyValue('--header-height')).toBe('');
  });

  it('updates --header-height on resize', () => {
    mockHeaderHeights([80, 120]);
    renderHeader();
    expect(document.documentElement.style.getPropertyValue('--header-height')).toBe('80px');
    window.dispatchEvent(new Event('resize'));
    expect(document.documentElement.style.getPropertyValue('--header-height')).toBe('120px');
  });

  it('re-measures when the header changes size without a window resize', () => {
    mockHeaderHeights([72, 96]);
    let resizeObserverCallback: ResizeObserverCallback | undefined;
    const observe = vi.fn();
    const disconnect = vi.fn();
    vi.stubGlobal(
      'ResizeObserver',
      class ResizeObserverMock {
        constructor(callback: ResizeObserverCallback) {
          resizeObserverCallback = callback;
        }
        observe = observe;
        disconnect = disconnect;
        unobserve = vi.fn();
      }
    );

    const { unmount } = renderHeader();
    const header = screen.getByTestId('site-header');
    expect(document.documentElement.style.getPropertyValue('--header-height')).toBe('72px');
    expect(observe).toHaveBeenCalledWith(header);

    act(() => {
      resizeObserverCallback?.([], {} as ResizeObserver);
    });
    expect(document.documentElement.style.getPropertyValue('--header-height')).toBe('96px');

    unmount();
    expect(disconnect).toHaveBeenCalled();
  });

  it('stops measuring after unmount', () => {
    mockHeaderHeights([80, 120]);
    const { unmount } = renderHeader();
    expect(document.documentElement.style.getPropertyValue('--header-height')).toBe('80px');

    unmount();
    window.dispatchEvent(new Event('resize'));
    expect(document.documentElement.style.getPropertyValue('--header-height')).toBe('80px');
  });
});
