import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import Heading from './Heading';

describe('Heading', () => {
  test.each([
    [1, 'h1'],
    [2, 'h2'],
    [3, 'h3'],
    [4, 'h4'],
    [5, 'h5'],
    [6, 'h6'],
  ])('renders the semantic heading level h%i', (level, tag) => {
    render(
      <Heading level={level as 1 | 2 | 3 | 4 | 5 | 6}>Experience</Heading>
    );
    const heading = screen.getByRole('heading', { level });
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe(tag.toUpperCase());
    expect(heading).toHaveTextContent('Experience');
  });

  test('defaults to h2 when level is not provided', () => {
    render(<Heading>Experience</Heading>);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.tagName).toBe('H2');
    expect(heading).toHaveTextContent('Experience');
  });

  test('shows the text passed by children and does not hardcode internal text', () => {
    render(<Heading level={3}>Results</Heading>);
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
      'Results'
    );
  });

  test('renders null when children is missing', () => {
    // @ts-expect-error - Testing missing required prop children
    render(<Heading level={2} />);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
});
