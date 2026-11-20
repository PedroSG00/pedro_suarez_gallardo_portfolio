import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import SectionHeading from './SectionHeading';

describe('SectionHeading', () => {
  test('renders an h2 whose accessible name is only the label', () => {
    render(<SectionHeading id="about" index="01" label="About" />);
    expect(screen.getByRole('heading', { level: 2, name: 'About' })).toBeInTheDocument();
  });

  test('does not include the number in the accessible name', () => {
    render(<SectionHeading id="about" index="01" label="About" />);
    const heading = screen.getByRole('heading', { name: 'About' });
    expect(heading).not.toHaveAccessibleName('01 / About');
    expect(screen.getByText('01 /')).toHaveAttribute('aria-hidden', 'true');
  });

  test('is programmatically focusable with tabIndex -1', () => {
    render(<SectionHeading id="about" index="01" label="About" />);
    const heading = screen.getByRole('heading', { name: 'About' });
    expect(heading).toHaveAttribute('tabindex', '-1');
  });

  test('exposes data-section-heading for AnchorFocus', () => {
    render(<SectionHeading id="about" index="01" label="About" />);
    const heading = screen.getByRole('heading', { name: 'About' });
    expect(heading).toHaveAttribute('data-section-heading');
  });

  test('renders null when label is missing', () => {
    // @ts-expect-error - Testing missing required prop label
    const { container } = render(<SectionHeading id="about" index="01" />);
    expect(container).toBeEmptyDOMElement();
  });

  test('renders null when id is missing', () => {
    // @ts-expect-error - Testing missing required prop id
    const { container } = render(<SectionHeading index="01" label="About" />);
    expect(container).toBeEmptyDOMElement();
  });
});
