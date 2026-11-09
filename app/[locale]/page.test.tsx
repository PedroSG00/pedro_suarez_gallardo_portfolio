import { describe, it, expect } from 'vitest';

// T21: app/[locale]/page.tsx generateMetadata — RF8, RNF4
describe('app/[locale]/page — T21 (generateMetadata)', () => {
  it('returns title and description in Spanish for /es', async () => {
    const mod = await import('./page');
    const metadata = await mod.generateMetadata({
      params: Promise.resolve({ locale: 'es' }),
    });
    expect(metadata.title).toContain('Desarrollador web');
    expect(metadata.description).toContain('currículum');
  });

  it('returns title and description in English for /en', async () => {
    const mod = await import('./page');
    const metadata = await mod.generateMetadata({
      params: Promise.resolve({ locale: 'en' }),
    });
    expect(metadata.title).toContain('Web Developer');
    expect(metadata.description).toContain('résumé');
  });
});
