import { describe, it, expect } from 'vitest';
import type { NextRequest } from 'next/server';

// T6: Test unitario del middleware — RF: RF1, RNF8
describe('middleware — T6 (red first)', () => {
  function makeRequest(
    url: string,
    headers: Record<string, string> = {},
    cookies: Record<string, string> = {}
  ): NextRequest {
    return {
      nextUrl: new URL(url, 'http://localhost:3000'),
      url,
      cookies: {
        get: (name: string) => ({ value: cookies[name] }),
      },
      headers: {
        get: (name: string) => headers[name] || null,
      },
    } as unknown as NextRequest;
  }

  it('redirects / to /es when Accept-Language is es-ES and no cookie', async () => {
    const { middleware } = await import('../middleware/middleware');
    const req = makeRequest('http://localhost:3000/', { 'accept-language': 'es-ES' });

    const result = await middleware(req);
    expect(result.status).toBe(307);
    expect(result.headers.get('location')).toBe('http://localhost:3000/es/');
    expect(result.headers.get('Vary')).toContain('Cookie');
    expect(result.headers.get('Vary')).toContain('Accept-Language');
  });

  it('falls back to English when Accept-Language is fr', async () => {
    const { middleware } = await import('../middleware/middleware');
    const req = makeRequest('http://localhost:3000/', { 'accept-language': 'fr' });

    const result = await middleware(req);
    expect(result.status).toBe(307);
    expect(result.headers.get('location')).toBe('http://localhost:3000/en/');
  });

  it('calls next() when path already has valid locale prefix', async () => {
    const { middleware } = await import('../middleware/middleware');
    const req = makeRequest('http://localhost:3000/es/proyectos');

    const result = await middleware(req);
    expect(result.status).toBe(200);
    expect(result.headers.get('location')).toBeNull();
  });

  it('excludes /_next and files with extensions', async () => {
    const { middleware } = await import('../middleware/middleware');
    const req = makeRequest('http://localhost:3000/_next/static/chunks/main.js');

    const result = await middleware(req);
    expect(result.status).toBe(200);
    expect(result.headers.get('location')).toBeNull();
  });
});
