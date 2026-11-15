import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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
