import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import Section from './Section';

describe('Section', () => {
  test('shows a 1 px grid overlay when grid is active or default', () => {
    render(
      <Section>
        <p>Content</p>
      </Section>
    );
    expect(screen.getByTestId('section-grid')).toBeInTheDocument();
  });

  test('hides the grid when grid is false', () => {
    render(
      <Section grid={false}>
        <p>Content</p>
      </Section>
    );
    expect(screen.queryByTestId('section-grid')).not.toBeInTheDocument();
  });

  test('renders the content passed by children without hardcoded internal text', () => {
    render(
      <Section>
        <p>Custom content</p>
      </Section>
    );
    expect(screen.getByText('Custom content')).toBeInTheDocument();
  });

  test('renders null when children is missing', () => {
    // @ts-expect-error - Testing missing required prop children
    const { container } = render(<Section />);
    expect(container).toBeEmptyDOMElement();
  });

  test('gives the section the stable id it receives', () => {
    render(
      <Section id="about" labelledBy="about-heading">
        <h2 id="about-heading">About</h2>
      </Section>
    );
    expect(screen.getByRole('region', { name: 'About' })).toHaveAttribute('id', 'about');
  });

  test('exposes an accessible name through labelledBy', () => {
    render(
      <Section id="about" labelledBy="about-heading">
        <h2 id="about-heading">About</h2>
      </Section>
    );
    expect(screen.getByRole('region', { name: 'About' })).toHaveAttribute(
      'aria-labelledby',
      'about-heading'
    );
  });

  test('keeps the default grid when id and labelledBy are provided', () => {
    render(
      <Section id="stack" labelledBy="stack-heading">
        <h2 id="stack-heading">Stack</h2>
      </Section>
    );
    expect(screen.getByTestId('section-grid')).toBeInTheDocument();
  });

  test('keeps the grid hidden when grid is false with id and labelledBy', () => {
    render(
      <Section id="contact" labelledBy="contact-heading" grid={false}>
        <h2 id="contact-heading">Contact</h2>
      </Section>
    );
    expect(screen.queryByTestId('section-grid')).not.toBeInTheDocument();
  });

  test('renders nothing when children is missing even with id and labelledBy', () => {
    // @ts-expect-error - Testing missing required prop children
    const { container } = render(<Section id="work" labelledBy="work-heading" />);
    expect(container).toBeEmptyDOMElement();
  });
});
