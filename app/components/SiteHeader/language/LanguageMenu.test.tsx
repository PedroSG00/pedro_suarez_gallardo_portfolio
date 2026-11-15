import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { LanguageMenu } from './LanguageMenu';
import type { Locale } from '../../../i18n/config';

// T13 (004): LanguageMenu — RF-7, RF-8, RNF-7
// Done when: two native hreflang links to the equivalent route (with JS,
// same query and fragment), active language marked with a sign besides
// styling, trigger with the active language name, and no language change on
// open or close.
const LABELS = {
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

const MARK = '▪';

function renderMenu(
  props: Partial<Parameters<typeof LanguageMenu>[0]> = {}
) {
  const defaultProps = {
    locale: 'en' as Locale,
    pathname: '/en/projects',
    triggerLabel: 'English',
    activeMark: MARK,
    labels: LABELS,
    languages: LANGUAGES,
    setLocale: vi.fn(),
  };
  return render(<LanguageMenu {...defaultProps} {...props} />);
}

describe('LanguageMenu — T13 (RF-7, RF-8, RNF-7)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts closed', () => {
    renderMenu();
    const details = screen.getByTestId('language-menu');
    expect(details).not.toHaveAttribute('open');
  });

  it('trigger shows the active language name', () => {
    renderMenu();
    expect(screen.getByTestId('language-trigger')).toBeInTheDocument();
  });

  it('renders two native hreflang links, one per language', () => {
    renderMenu();
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(links.map((l) => l.getAttribute('hreflang'))).toEqual(
      expect.arrayContaining(['en', 'es'])
    );
  });

  it('active language is marked with the sign besides styling', () => {
    renderMenu({ locale: 'en', triggerLabel: 'English' });
    const english = screen.getByRole('link', { name: /English/ });
    expect(within(english).getByTestId('active-mark')).toBeInTheDocument();
    const espanol = screen.getByRole('link', { name: /Español/ });
    expect(within(espanol).queryByTestId('active-mark')).toBeNull();
  });

  it('links point to the equivalent route in the other language', () => {
    renderMenu({ locale: 'en', pathname: '/en/projects' });
    const espanol = screen.getByRole('link', { name: /Español/ });
    expect(espanol).toHaveAttribute('href', '/es/projects');
  });

  it('clicking a link calls setLocale with the other language', () => {
    const setLocale = vi.fn();
    renderMenu({ locale: 'en', setLocale });
    const espanol = screen.getByRole('link', { name: /Español/ });
    fireEvent.click(espanol);
    expect(setLocale).toHaveBeenCalledWith('es');
  });

  it('closes when selecting a language', () => {
    const setLocale = vi.fn();
    renderMenu({ locale: 'en', setLocale });
    const summary = screen.getByTestId('language-trigger');
    fireEvent.click(summary);
    expect(screen.getByTestId('language-menu')).toHaveAttribute('open');
    const espanol = screen.getByRole('link', { name: /Español/ });
    fireEvent.click(espanol);
    expect(screen.getByTestId('language-menu')).not.toHaveAttribute('open');
  });

  it('closes with Escape', () => {
    renderMenu();
    const summary = screen.getByTestId('language-trigger');
    fireEvent.click(summary);
    expect(screen.getByTestId('language-menu')).toHaveAttribute('open');
    fireEvent.keyDown(summary, { key: 'Escape' });
    expect(screen.getByTestId('language-menu')).not.toHaveAttribute('open');
  });

  it('closes with click outside the disclosure', () => {
    renderMenu();
    const summary = screen.getByTestId('language-trigger');
    fireEvent.click(summary);
    expect(screen.getByTestId('language-menu')).toHaveAttribute('open');
    fireEvent.mouseDown(document.body);
    expect(screen.getByTestId('language-menu')).not.toHaveAttribute('open');
  });

  it('does not change language when opening or closing', () => {
    const setLocale = vi.fn();
    renderMenu({ locale: 'en', setLocale });
    const summary = screen.getByTestId('language-trigger');
    fireEvent.click(summary); // open
    expect(setLocale).not.toHaveBeenCalled();
    fireEvent.keyDown(summary, { key: 'Escape' }); // close
    expect(setLocale).not.toHaveBeenCalled();
  });
});
