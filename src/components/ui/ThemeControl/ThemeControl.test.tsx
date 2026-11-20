import { beforeEach, describe, expect, test, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { NextIntlClientProvider } from 'next-intl';
import enMessages from '../../../../messages/en.json';
import { renderWithIntl } from '@/test/render-with-intl';
import ThemeControl from './ThemeControl';

vi.mock('@/lib/theme-dom', () => ({
  currentTheme: vi.fn(() => 'light'),
  setTheme: vi.fn(),
}));

import { currentTheme, setTheme } from '@/lib/theme-dom';

const mockedSetTheme = setTheme as ReturnType<typeof vi.fn>;
const mockedCurrentTheme = currentTheme as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
  mockedSetTheme.mockReset();
  mockedCurrentTheme.mockReset();
  mockedCurrentTheme.mockReturnValue('light');
  document.documentElement.removeAttribute('data-theme');
});

function renderControl(label = enMessages.shared.theme.toggle) {
  return renderWithIntl(<ThemeControl label={label} />);
}

// Observa el primer commit (antes de que se flusheen los efectos pasivos):
// sin montar no debe haber botón, solo el espacio reservado.
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
  test('sin montar no renderiza botón; reserva el espacio', () => {
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

  test('etiqueta ausente no renderiza botón', () => {
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
