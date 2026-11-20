import { describe, expect, test, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ThemeBootstrapScript } from './ThemeBootstrapScript';

describe('ThemeBootstrapScript', () => {
  test('renders an inert script during client rendering to avoid rerunning it on locale navigation', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ThemeBootstrapScript html="document.documentElement.dataset.theme = 'dark'" />,
    );

    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
