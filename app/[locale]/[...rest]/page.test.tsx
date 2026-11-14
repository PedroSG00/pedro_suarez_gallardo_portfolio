import { describe, it, expect, vi } from 'vitest';

// T16: app/[locale]/[...rest]/page.tsx — unknown route under valid locale → notFound() (RF-5, RF-7)
// Done when: any unknown path under /<locale>/ calls notFound() and preserves
// the resolved locale.
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

describe('app/[locale]/[...rest]/page — T16', () => {
  it('calls notFound for unknown route under valid locale', async () => {
    const { notFound } = await import('next/navigation');
    vi.mocked(notFound).mockClear();

    const mod = await import('./page');
    await mod.default();

    expect(notFound).toHaveBeenCalled();
  });
});
