import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
}));

vi.mock('../../../i18n/storage/storage', () => ({
  migrateLegacyLang: vi.fn(() => null),
  writeCookie: vi.fn(),
}));

import { Brand } from './Brand';
import LocaleProvider from '../../../i18n/provider/locale-provider';

const dictionary = {
  nav: {
    home: 'Home',
    experience: 'Experience',
    projects: 'Projects',
    stack: 'Stack',
    contact: 'Contact',
    label: 'Primary navigation',
    menu: 'Menu',
  },
  header: { label: 'Site header' },
};

// T8 (004): Brand — RF-1
// Done when: the link uses the full name received by props, points to the
// home of the active language (/en or /es), and contains no visible strings
// written in the component.
describe('Brand — T8 (RF-1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the full name received by props as the link text', () => {
    render(
      <LocaleProvider locale="en" dictionary={dictionary}>
        <Brand name="Pedro Suárez Gallardo" />
      </LocaleProvider>
    );
    const link = screen.getByRole('link', {
      name: 'Pedro Suárez Gallardo',
    });
    expect(link).toBeInTheDocument();
  });

  it('links to the home of the active language in English', () => {
    render(
      <LocaleProvider locale="en" dictionary={dictionary}>
        <Brand name="Pedro Suárez Gallardo" />
      </LocaleProvider>
    );
    const link = screen.getByRole('link', {
      name: 'Pedro Suárez Gallardo',
    });
    expect(link).toHaveAttribute('href', '/en');
  });

  it('links to the home of the active language in Spanish', () => {
    render(
      <LocaleProvider locale="es" dictionary={dictionary}>
        <Brand name="Pedro Suárez Gallardo" />
      </LocaleProvider>
    );
    const link = screen.getByRole('link', {
      name: 'Pedro Suárez Gallardo',
    });
    expect(link).toHaveAttribute('href', '/es');
  });

  it('shows only the prop name as visible text, no hardcoded strings', () => {
    render(
      <LocaleProvider locale="en" dictionary={dictionary}>
        <Brand name="Custom Name" />
      </LocaleProvider>
    );
    expect(screen.getByRole('link', { name: 'Custom Name' })).toBeInTheDocument();
    expect(screen.queryByText('Pedro')).not.toBeInTheDocument();
  });
});
