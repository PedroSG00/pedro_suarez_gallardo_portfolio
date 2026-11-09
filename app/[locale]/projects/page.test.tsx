import { describe, it, expect } from 'vitest';

// T22: app/[locale]/proyectos/page.tsx generateMetadata — RF8
describe('app/[locale]/proyectos/page — T22 (generateMetadata)', () => {
  it('returns title and description in Spanish for /es/proyectos', async () => {
    const mod = await import('./page');
    const metadata = await mod.generateMetadata({
      params: Promise.resolve({ locale: 'es' }),
    });
    expect(metadata.title).toContain('Proyectos');
    expect(metadata.description).toContain('proyectos');
  });

  it('returns title and description in English for /en/proyectos', async () => {
    const mod = await import('./page');
    const metadata = await mod.generateMetadata({
      params: Promise.resolve({ locale: 'en' }),
    });
    expect(metadata.title).toContain('Projects');
    expect(metadata.description).toContain('projects');
  });
});
