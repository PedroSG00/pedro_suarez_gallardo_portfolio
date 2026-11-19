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
});
