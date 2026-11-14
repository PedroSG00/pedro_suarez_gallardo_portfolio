import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

import { getBaseUrl } from './get-base-url';
import { headers } from 'next/headers';

const mockedHeaders = vi.mocked(headers);

// T21: get-base-url.ts — URL base absoluta con fallback a localhost o env
// Done when: localhost dev → http://localhost:3000; producción con host real → https://host;
// headers falla → NEXT_PUBLIC_SITE_URL o http://localhost:3000.
describe('getBaseUrl', () => {
  const originalEnv = process.env.NEXT_PUBLIC_SITE_URL;

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env.NEXT_PUBLIC_SITE_URL = originalEnv;
  });

  it('returns http://localhost:3000 when host is localhost', async () => {
    mockedHeaders.mockResolvedValue({
      get: (key: string) => {
        if (key === 'host') return 'localhost:3000';
        if (key === 'x-forwarded-proto') return 'https';
        return null;
      },
    } as Headers);

    const url = await getBaseUrl();
    expect(url).toBe('http://localhost:3000');
  });

  it('returns https://real-host.com when host is a real domain', async () => {
    mockedHeaders.mockResolvedValue({
      get: (key: string) => {
        if (key === 'host') return 'pedro-suarez.com';
        if (key === 'x-forwarded-proto') return 'https';
        return null;
      },
    } as Headers);

    const url = await getBaseUrl();
    expect(url).toBe('https://pedro-suarez.com');
  });

  it('falls back to NEXT_PUBLIC_SITE_URL when headers throws', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';
    mockedHeaders.mockRejectedValue(new Error('headers not available'));

    const url = await getBaseUrl();
    expect(url).toBe('https://example.com');
  });

  it('falls back to http://localhost:3000 when headers throws and no env var', async () => {
    mockedHeaders.mockRejectedValue(new Error('headers not available'));

    const url = await getBaseUrl();
    expect(url).toBe('http://localhost:3000');
  });
});
