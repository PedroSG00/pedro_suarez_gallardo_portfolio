import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { useDisclosure } from './use-disclosure';

// T10 (004): use-disclosure — RF-2, RF-7
// Done when: close with Escape, click outside and selection; no focus move
// nor trap; no effect when the disclosure is already closed.
function DisclosureComponent() {
  const { open, openIt, close, containerRef } = useDisclosure();
  return (
    <div data-testid="wrapper" data-open={String(open)}>
      <button onClick={openIt} data-testid="open-btn">
        Open
      </button>
      <details ref={containerRef} data-testid="details">
        <summary>Menu</summary>
        <button onClick={close} data-testid="close-btn">
          Close
        </button>
      </details>
    </div>
  );
}

describe('useDisclosure — T10 (RF-2, RF-7)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts closed', () => {
    render(<DisclosureComponent />);
    expect(screen.getByTestId('wrapper')).toHaveAttribute('data-open', 'false');
  });

  it('opens when openIt is called', () => {
    render(<DisclosureComponent />);
    fireEvent.click(screen.getByTestId('open-btn'));
    expect(screen.getByTestId('wrapper')).toHaveAttribute('data-open', 'true');
  });

  it('closes with Escape key', () => {
    render(<DisclosureComponent />);
    const openBtn = screen.getByTestId('open-btn');
    fireEvent.click(openBtn);
    expect(screen.getByTestId('wrapper')).toHaveAttribute('data-open', 'true');

    fireEvent.keyDown(openBtn, { key: 'Escape' });
    expect(screen.getByTestId('wrapper')).toHaveAttribute('data-open', 'false');
  });

  it('closes with click outside the disclosure', () => {
    render(<DisclosureComponent />);
    const openBtn = screen.getByTestId('open-btn');
    fireEvent.click(openBtn);
    expect(screen.getByTestId('wrapper')).toHaveAttribute('data-open', 'true');

    // open-btn is outside the <details>, so clicking it is a click outside.
    fireEvent.mouseDown(openBtn);
    expect(screen.getByTestId('wrapper')).toHaveAttribute('data-open', 'false');
  });

  it('closes when selecting an option inside the disclosure', () => {
    render(<DisclosureComponent />);
    fireEvent.click(screen.getByTestId('open-btn'));
    expect(screen.getByTestId('wrapper')).toHaveAttribute('data-open', 'true');

    fireEvent.click(screen.getByTestId('close-btn'));
    expect(screen.getByTestId('wrapper')).toHaveAttribute('data-open', 'false');
  });

  it('does nothing when Escape is pressed and the disclosure is already closed', () => {
    render(<DisclosureComponent />);
    expect(screen.getByTestId('wrapper')).toHaveAttribute('data-open', 'false');

    fireEvent.keyDown(screen.getByTestId('open-btn'), { key: 'Escape' });
    expect(screen.getByTestId('wrapper')).toHaveAttribute('data-open', 'false');
  });

  it('does nothing when clicking outside and the disclosure is already closed', () => {
    render(<DisclosureComponent />);
    expect(screen.getByTestId('wrapper')).toHaveAttribute('data-open', 'false');

    fireEvent.mouseDown(screen.getByTestId('open-btn'));
    expect(screen.getByTestId('wrapper')).toHaveAttribute('data-open', 'false');
  });

  it('does not move or trap focus (no focus-related side effects)', () => {
    render(<DisclosureComponent />);
    const openButton = screen.getByTestId('open-btn');
    openButton.focus();
    expect(openButton).toHaveFocus();

    fireEvent.click(openButton);
    expect(openButton).toHaveFocus();
    expect(screen.getByTestId('wrapper')).toHaveAttribute('data-open', 'true');

    // Closing should not move focus to the disclosure or elsewhere.
    fireEvent.keyDown(openButton, { key: 'Escape' });
    expect(openButton).toHaveFocus();
  });
});
