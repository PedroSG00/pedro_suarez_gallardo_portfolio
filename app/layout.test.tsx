import '@testing-library/jest-dom/vitest';
/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

vi.mock('next/font/google', () => ({
  Geist: () => ({ variable: '--font-geist-sans' }),
  Geist_Mono: () => ({ variable: '--font-geist-mono' }),
}));

// T-07: Tests fallidos (rojo) antes de implementar layout.tsx
// RF cubiertos: RF-2, RF-3, RF-5, RF-7, RF-16

describe('Layout — T-07 (red first)', () => {
  it('mounts ThemeSelect component', async () => {
    const LayoutModule = await import('./layout');
    const { default: Layout } = LayoutModule;
    render(<Layout params={Promise.resolve({})}><div>test</div></Layout>);
    expect(screen.getByRole('button', { name: /theme/i })).toBeInTheDocument();
  });

  it('applies theme class to html', async () => {
    document.documentElement.className = '';
    const LayoutModule = await import('./layout');
    const { default: Layout } = LayoutModule;
    render(<Layout params={Promise.resolve({})}><div>test</div></Layout>);
    expect(
      document.documentElement.classList.contains('theme-light') ||
      document.documentElement.classList.contains('theme-dark') ||
      document.documentElement.classList.contains('theme-system')
    ).toBe(true);
  });

  it('shows theme button always visible', async () => {
    const LayoutModule = await import('./layout');
    const { default: Layout } = LayoutModule;
    render(<Layout params={Promise.resolve({})}><div>test</div></Layout>);
    expect(screen.getByRole('button', { name: /theme/i })).toBeVisible();
  });

  it('uses accessible theme names', async () => {
    const LayoutModule = await import('./layout');
    const { default: Layout } = LayoutModule;
    render(<Layout params={Promise.resolve({})}><div>test</div></Layout>);
    expect(screen.getByLabelText(/tema|theme/i)).toBeInTheDocument();
  });
});
