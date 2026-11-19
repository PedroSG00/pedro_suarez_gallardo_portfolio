import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import Tag from './Tag';

describe('Tag', () => {
  test('renders short text passed by children as a monospace label without hardcoded internal text', () => {
    render(<Tag>Next.js</Tag>);
    expect(screen.getByText('Next.js')).toBeInTheDocument();
  });

  test('renders null when children is empty', () => {
    const { container } = render(<Tag>{''}</Tag>);
    expect(container).toBeEmptyDOMElement();
  });

  test('renders null when children is missing', () => {
    // @ts-expect-error - Testing missing required prop children
    const { container } = render(<Tag />);
    expect(container).toBeEmptyDOMElement();
  });
});
