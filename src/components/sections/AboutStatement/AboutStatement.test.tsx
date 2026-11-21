import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import AboutStatement from './AboutStatement';

describe('AboutStatement', () => {
  test.each([
    ['en', "Complexity is where I'm calmest."],
    ['es', 'La complejidad es donde estoy más tranquilo.'],
  ])('exposes the complete %s statement once to assistive technology', (_locale, text) => {
    render(<AboutStatement text={text} />);

    expect(screen.getAllByRole('group', { name: text })).toHaveLength(1);

    for (const word of text.split(/\s+/)) {
      const visualWord = screen.getByText(word, { exact: true });
      expect(visualWord).toBeVisible();
    }
  });

  test('renders the full statement visibly in its static base state', () => {
    const text = 'Complexity is where I am calmest.';
    render(<AboutStatement text={text} />);

    for (const word of text.split(/\s+/)) {
      expect(screen.getByText(word, { exact: true })).toBeVisible();
    }
  });

  test('renders nothing for an empty statement', () => {
    const { container } = render(<AboutStatement text="" />);

    expect(container).toBeEmptyDOMElement();
  });
});
