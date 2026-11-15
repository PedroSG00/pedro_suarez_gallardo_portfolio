import { describe, it, expect } from 'vitest';
import type { NextRequest } from 'next/server';

// T13: proxy.ts — routing table: pass, 308 redirect, or 404 (RF-2, RF-5)
// Done when: proxy decides pass / redirect 308 / 404 deterministically;
// trailing slash → 308 canonical; uppercase / double-slash / wrong-segment /
// unsupported locale → 404; technical assets pass untouched.
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

describe('proxy — T13', () => {
  describe('permanent redirect 308 for root and paths without locale', () => {
    it('redirects / to /es when Accept-Language is es and no cookie', async () => {
      const { proxy } = await import('../proxy');
      const req = makeRequest('http://localhost:3000/', {
        'accept-language': 'es',
      });

      const result = await proxy(req);
      expect(result.status).toBe(308);
      expect(result.headers.get('location')).toBe('http://localhost:3000/es/');
      const vary = result.headers.get('Vary') || '';
      expect(vary).toContain('Cookie');
      expect(vary).toContain('Accept-Language');
    });

    it('redirects / to /en when Accept-Language is fr and no cookie', async () => {
      const { proxy } = await import('../proxy');
      const req = makeRequest('http://localhost:3000/', {
        'accept-language': 'fr',
      });

      const result = await proxy(req);
      expect(result.status).toBe(308);
      expect(result.headers.get('location')).toBe('http://localhost:3000/en/');
    });

    it('preserves query string in redirect', async () => {
      const { proxy } = await import('../proxy');
      const req = makeRequest(
        'http://localhost:3000/projects?tab=1',
        {},
        {}
      );

      const result = await proxy(req);
      expect(result.status).toBe(308);
      expect(result.headers.get('location')).toBe(
        'http://localhost:3000/en/projects?tab=1'
      );
    });

    it('preserves trailing slash in redirect target', async () => {
      const { proxy } = await import('../proxy');
      const req = makeRequest('http://localhost:3000/', {
        'accept-language': 'es',
      });

      const result = await proxy(req);
      expect(result.status).toBe(308);
      expect(result.headers.get('location')).toBe('http://localhost:3000/es/');
    });
  });

  describe('trailing slash → 308 canonical form (without trailing slash)', () => {
    it('redirects /en/projects/ to /en/projects', async () => {
      const { proxy } = await import('../proxy');
      const req = makeRequest('http://localhost:3000/en/projects/', {
        'accept-language': 'en',
      });

      const result = await proxy(req);
      expect(result.status).toBe(308);
      expect(result.headers.get('location')).toBe(
        'http://localhost:3000/en/projects'
      );
    });

    it('redirects /es/ to /es', async () => {
      const { proxy } = await import('../proxy');
      const req = makeRequest('http://localhost:3000/es/', {
        'accept-language': 'es',
      });

      const result = await proxy(req);
      expect(result.status).toBe(308);
      expect(result.headers.get('location')).toBe('http://localhost:3000/es');
    });
  });

  describe('valid locale prefix → pass through (200)', () => {
    it('passes /en/projects untouched', async () => {
      const { proxy } = await import('../proxy');
      const req = makeRequest('http://localhost:3000/en/projects', {
        'accept-language': 'en',
      });

      const result = await proxy(req);
      expect(result.status).toBe(200);
      expect(result.headers.get('location')).toBeNull();
    });

    it('passes /es untouched', async () => {
      const { proxy } = await import('../proxy');
      const req = makeRequest('http://localhost:3000/es', {
        'accept-language': 'es',
      });

      const result = await proxy(req);
      expect(result.status).toBe(200);
      expect(result.headers.get('location')).toBeNull();
    });

    it('forwards the resolved locale to the app via x-locale', async () => {
      const { proxy } = await import('../proxy');
      const req = makeRequest('http://localhost:3000/es/projects', {
        'accept-language': 'en',
      });

      const result = await proxy(req);
      expect(
        result.headers.get('x-middleware-request-x-locale')
      ).toBe('es');
    });
  });

  describe('technical assets pass untouched (RF-5)', () => {
    it('excludes /_next', async () => {
      const { proxy } = await import('../proxy');
      const req = makeRequest('http://localhost:3000/_next/static/chunks/main.js');

      const result = await proxy(req);
      expect(result.status).toBe(200);
      expect(result.headers.get('location')).toBeNull();
    });

    it('excludes /favicon.ico', async () => {
      const { proxy } = await import('../proxy');
      const req = makeRequest('http://localhost:3000/favicon.ico');

      const result = await proxy(req);
      expect(result.status).toBe(200);
      expect(result.headers.get('location')).toBeNull();
    });

    it('excludes /robots.txt', async () => {
      const { proxy } = await import('../proxy');
      const req = makeRequest('http://localhost:3000/robots.txt');

      const result = await proxy(req);
      expect(result.status).toBe(200);
      expect(result.headers.get('location')).toBeNull();
    });

    it('excludes /sitemap.xml', async () => {
      const { proxy } = await import('../proxy');
      const req = makeRequest('http://localhost:3000/sitemap.xml');

      const result = await proxy(req);
      expect(result.status).toBe(200);
      expect(result.headers.get('location')).toBeNull();
    });

    it('excludes .well-known paths', async () => {
      const { proxy } = await import('../proxy');
      const req = makeRequest('http://localhost:3000/.well-known/assetlinks.json');

      const result = await proxy(req);
      expect(result.status).toBe(200);
      expect(result.headers.get('location')).toBeNull();
    });

    it('excludes any path with a file extension', async () => {
      const { proxy } = await import('../proxy');
      const req = makeRequest('http://localhost:3000/en/image.png');

      const result = await proxy(req);
      expect(result.status).toBe(200);
      expect(result.headers.get('location')).toBeNull();
    });
  });

  describe('invalid variants → localized 404 screen (RF-5, RF-7)', () => {
    it('uppercase locale in first segment → 404 screen', async () => {
      const { proxy } = await import('../proxy');
      const req = makeRequest('http://localhost:3000/ES', {
        'accept-language': 'es',
      });

      const result = await proxy(req);
      expect(result.status).toBe(200);
      expect(result.headers.get('x-middleware-rewrite')).toContain(
        '/es/__not-found'
      );
      expect(result.headers.get('Vary')).toContain('Cookie');
    });

    it('double slash → 404 screen', async () => {
      const { proxy } = await import('../proxy');
      const req = makeRequest('http://localhost:3000//en/projects', {
        'accept-language': 'en',
      });

      const result = await proxy(req);
      expect(result.headers.get('x-middleware-rewrite')).toContain(
        '/en/__not-found'
      );
    });

    it('unsupported locale → 404 screen in the resolved locale', async () => {
      const { proxy } = await import('../proxy');
      const req = makeRequest('http://localhost:3000/fr/projects', {
        'accept-language': 'es',
      });

      const result = await proxy(req);
      expect(result.headers.get('x-middleware-rewrite')).toContain(
        '/es/__not-found'
      );
    });

    it('locale not in first segment → 404 screen', async () => {
      const { proxy } = await import('../proxy');
      const req = makeRequest('http://localhost:3000/projects/en', {
        'accept-language': 'en',
      });

      const result = await proxy(req);
      expect(result.headers.get('x-middleware-rewrite')).toContain(
        '/en/__not-found'
      );
    });

    it('invalid percent-encoding → 404 screen (RF-5 case 25)', async () => {
      const { proxy } = await import('../proxy');
      const req = makeRequest('http://localhost:3000/en/%zz', {
        'accept-language': 'en',
      });

      const result = await proxy(req);
      expect(result.headers.get('x-middleware-rewrite')).toContain(
        '/en/__not-found'
      );
    });

    it('pathname longer than 2048 chars → 404 screen (RF-5 case 25)', async () => {
      const { proxy } = await import('../proxy');
      const longPath = '/a'.repeat(2049);
      const req = makeRequest(`http://localhost:3000${longPath}`, {
        'accept-language': 'en',
      });

      const result = await proxy(req);
      expect(result.headers.get('x-middleware-rewrite')).toContain(
        '/en/__not-found'
      );
    });

    it('segment longer than 255 chars → 404 screen (RF-5 case 25)', async () => {
      const { proxy } = await import('../proxy');
      const longSegment = 'x'.repeat(256);
      const req = makeRequest(
        `http://localhost:3000/en/${longSegment}`,
        { 'accept-language': 'en' }
      );

      const result = await proxy(req);
      expect(result.headers.get('x-middleware-rewrite')).toContain(
        '/en/__not-found'
      );
    });
  });
});
