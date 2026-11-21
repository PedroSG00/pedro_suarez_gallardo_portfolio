import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { NextIntlClientProvider } from 'next-intl';
import enMessages from '../../../../messages/en.json';
import { renderWithIntl } from '@/test/render-with-intl';
import ThemeControl from './ThemeControl';

vi.mock('@/lib/theme-dom', () => ({
  applyTheme: vi.fn((root: HTMLElement, theme: 'light' | 'dark') => {
    root.dataset.theme = theme;
  }),
  currentTheme: vi.fn(() => 'light'),
  readStoredTheme: vi.fn(() => null),
  setTheme: vi.fn(),
}));

import { applyTheme, currentTheme, readStoredTheme, setTheme } from '@/lib/theme-dom';

const mockedSetTheme = setTheme as ReturnType<typeof vi.fn>;
const mockedCurrentTheme = currentTheme as ReturnType<typeof vi.fn>;
const mockedApplyTheme = applyTheme as ReturnType<typeof vi.fn>;
const mockedReadStoredTheme = readStoredTheme as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
  mockedSetTheme.mockReset();
  mockedCurrentTheme.mockReset();
  mockedApplyTheme.mockClear();
  mockedReadStoredTheme.mockReset();
  mockedReadStoredTheme.mockReturnValue(null);
  mockedCurrentTheme.mockReturnValue('light');
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  document.documentElement.removeAttribute('data-theme');
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderControl(label = enMessages.shared.theme.toggle) {
  return renderWithIntl(<ThemeControl label={label} />);
}

// Observe the first commit (before passive effects flush):
// no button when not mounted, only reserved space.
function mountSync(label = enMessages.shared.theme.toggle) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  flushSync(() => {
    root.render(
      <NextIntlClientProvider locale="en" messages={enMessages}>
        <ThemeControl label={label} />
      </NextIntlClientProvider>,
    );
  });
  return { container, root };
}

describe('ThemeControl', () => {
  test('does not render button when not mounted; reserves the space', () => {
    const { container, root } = mountSync();
    // eslint-disable-next-line testing-library/no-node-access
    expect(container.querySelector('button')).toBeNull();
    // eslint-disable-next-line testing-library/no-node-access
    expect(container.querySelector('span[aria-hidden="true"]')).not.toBeNull();
    root.unmount();
    document.body.removeChild(container);
  });

  test('al montar aparece ThemeToggle con aria-pressed y la etiqueta traducida', () => {
    renderControl();
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-pressed');
    expect(button).toHaveAttribute('aria-label', 'Toggle theme');
  });

  test('initializes the icon from the active system preference when no theme is stored', () => {
    vi.mocked(window.matchMedia).mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList);
    mockedCurrentTheme.mockImplementation((_root, systemPrefersDark) =>
      systemPrefersDark ? 'dark' : 'light',
    );

    renderControl();

    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button')).toHaveAttribute('data-theme-icon', 'moon');
    expect(mockedCurrentTheme).toHaveBeenCalledWith(document.documentElement, true);
  });

  test('restores the saved theme if a locale transition removes the root attribute', () => {
    mockedReadStoredTheme.mockReturnValue('dark');
    mockedCurrentTheme.mockImplementation((root) => root.dataset.theme ?? 'light');

    renderControl();

    expect(mockedApplyTheme).toHaveBeenCalledWith(document.documentElement, 'dark');
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button')).toHaveAttribute('data-theme-icon', 'moon');
  });

  test('al pulsar alterna aria-pressed y llama a setTheme', () => {
    renderControl();
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(button);
    expect(mockedSetTheme).toHaveBeenCalledTimes(1);
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  test('setTheme que lanza no rompe y mantiene el tema actual', () => {
    mockedSetTheme.mockImplementation(() => {
      throw new Error('boom');
    });
    renderControl();
    const button = screen.getByRole('button');
    expect(() => fireEvent.click(button)).not.toThrow();
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  test('missing label does not render button', () => {
    renderControl('');
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  test('uses the active message catalog when no label override is provided', () => {
    renderWithIntl(<ThemeControl />, { locale: 'es' });
    expect(screen.getByRole('button', { name: 'Cambiar tema' })).toBeInTheDocument();
  });

  test('renders null when toggle message is empty', () => {
    const messages = {
      ...enMessages,
      shared: {
        ...enMessages.shared,
        theme: { ...enMessages.shared.theme, toggle: '' },
      },
    };
    renderWithIntl(<ThemeControl />, { messages });
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});
