import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { NavDisclosure } from './NavDisclosure';
import type { DestinationId } from '../../../navigation/destinations';

const LABELS: Record<DestinationId, string> = {
  home: 'Home',
  experience: 'Experience',
  projects: 'Projects',
  stack: 'Stack',
  contact: 'Contact',
};

// T11 (004): NavDisclosure — RF-2, RF-8
// Done when: <details> closed by default, summary with dictionary label,
// close with Escape / click outside / selection, and a single DOM with the
// same links in wide and narrow.
describe('NavDisclosure — T11 (RF-2, RF-8)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function renderDisclosure(props: Partial<Parameters<typeof NavDisclosure>[0]> = {}) {
    return render(
      <NavDisclosure
        labels={LABELS}
        locale="en"
        pathname="/"
        navLabel="Primary navigation"
        menuLabel="Menu"
        {...props}
      />
    );
  }

  it('starts closed', () => {
    renderDisclosure();
    const details = screen.getByTestId('nav-disclosure');
    expect(details).not.toHaveAttribute('open');
  });

  it('renders five links in DESTINATIONS order', () => {
    renderDisclosure();
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

  it('summary shows the dictionary menu label', () => {
    renderDisclosure();
    const summary = screen.getByText('Menu');
    expect(summary).toBeInTheDocument();
  });

  it('opens and closes with Escape', () => {
    renderDisclosure();
    const summary = screen.getByText('Menu');
    fireEvent.click(summary);
    const details = screen.getByTestId('nav-disclosure');
    expect(details).toHaveAttribute('open');

    fireEvent.keyDown(summary, { key: 'Escape' });
    expect(details).not.toHaveAttribute('open');
  });

  it('closes with click outside the disclosure', () => {
    renderDisclosure();
    const summary = screen.getByText('Menu');
    fireEvent.click(summary);
    expect(screen.getByTestId('nav-disclosure')).toHaveAttribute('open');

    fireEvent.mouseDown(document.body);
    expect(screen.getByTestId('nav-disclosure')).not.toHaveAttribute('open');
  });

  it('closes when selecting a link inside the disclosure', () => {
    renderDisclosure();
    const summary = screen.getByText('Menu');
    fireEvent.click(summary);
    expect(screen.getByTestId('nav-disclosure')).toHaveAttribute('open');

    const home = within(screen.getByTestId('nav-disclosure')).getByRole('link', {
      name: 'Home',
    });
    fireEvent.click(home);
    expect(screen.getByTestId('nav-disclosure')).not.toHaveAttribute('open');
  });

  it('uses section anchors for non-home destinations', () => {
    renderDisclosure({ pathname: '/' });
    const experience = screen.getByRole('link', { name: 'Experience' });
    expect(experience).toHaveAttribute('href', '#experiencia');
  });

  it('uses the locale prefix for the home link', () => {
    renderDisclosure({ locale: 'es', pathname: '/' });
    const home = screen.getByRole('link', { name: 'Home' });
    expect(home).toHaveAttribute('href', '/es');
  });

  it('marks Projects active with aria-current="true" on /projects', () => {
    renderDisclosure({ pathname: '/projects' });
    const projects = screen.getByRole('link', { name: 'Projects' });
    expect(projects).toHaveAttribute('aria-current', 'true');
  });
});
