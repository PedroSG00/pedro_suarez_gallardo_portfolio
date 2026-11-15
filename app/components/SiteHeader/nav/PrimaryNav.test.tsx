import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { PrimaryNav } from './PrimaryNav';
import type { DestinationId } from '../../../navigation/destinations';

const LABELS: Record<DestinationId, string> = {
  home: 'Home',
  experience: 'Experience',
  projects: 'Projects',
  stack: 'Stack',
  contact: 'Contact',
};

const MARK = '▪';

// T9 (004): PrimaryNav — RF-1, RF-5, RF-8
// Done when: five links in DESTINATIONS order,
// aria-current="true" only on Projects when the route is /projects or
// /projects/<slug>, and a non-chromatic mark (inverted block + typographic
// sign) on the active destination.
describe('PrimaryNav — T9 (RF-1, RF-5, RF-8)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function renderNav(
    props: Partial<Parameters<typeof PrimaryNav>[0]> = {}
  ) {
    return render(
      <PrimaryNav
        labels={LABELS}
        locale="en"
        pathname="/"
        activeMark={MARK}
        navLabel="Primary navigation"
        {...props}
      />
    );
  }

  it('renders five links in DESTINATIONS order', () => {
    renderNav();
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(5);
    expect(links.map((l) => l.textContent)).toEqual([
      'Home',
      'Experience',
      'Projects',
      'Stack',
      'Contact',
    ]);
  });

  it('marks Projects active with aria-current="true" on /projects', () => {
    renderNav({ pathname: '/projects' });
    const projects = screen.getByRole('link', { name: 'Projects' });
    expect(projects).toHaveAttribute('aria-current', 'true');
    for (const l of screen.getAllByRole('link')) {
      if (l !== projects) {
        expect(l).not.toHaveAttribute('aria-current', 'true');
      }
    }
  });

  it('marks Projects active with aria-current="true" on /projects/<slug>', () => {
    renderNav({ pathname: '/projects/ecommerce-redesign' });
    const projects = screen.getByRole('link', { name: 'Projects' });
    expect(projects).toHaveAttribute('aria-current', 'true');
  });

  it('does not mark any destination active on the home page', () => {
    renderNav({ pathname: '/' });
    for (const l of screen.getAllByRole('link')) {
      expect(l).not.toHaveAttribute('aria-current', 'true');
    }
  });

  it('renders a non-chromatic mark (block + typographic sign) only on the active destination', () => {
    renderNav({ pathname: '/projects' });
    const projects = screen.getByRole('link', { name: 'Projects' });
    expect(within(projects).getByTestId('active-mark')).toBeInTheDocument();
    for (const l of screen.getAllByRole('link')) {
      if (l !== projects) {
        expect(within(l).queryByTestId('active-mark')).toBeNull();
      }
    }
  });

  it('uses the locale prefix for the home link', () => {
    renderNav({ locale: 'es', pathname: '/' });
    const home = screen.getByRole('link', { name: 'Home' });
    expect(home).toHaveAttribute('href', '/es');
  });

  it('uses section anchors for non-home destinations', () => {
    renderNav({ pathname: '/' });
    const experience = screen.getByRole('link', { name: 'Experience' });
    expect(experience).toHaveAttribute('href', '#experiencia');
  });
});
