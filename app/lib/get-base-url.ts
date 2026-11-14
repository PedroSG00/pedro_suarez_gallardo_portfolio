/**
 * get-base-url — devuelve la URL base absoluta del sitio para metadatos.
 * En entorno de servidor con request scope (producción), usa el host real.
 * En tests o desarrollo sin request, hace fallback a NEXT_PUBLIC_SITE_URL
 * o http://localhost:3000.
 */

import { headers } from 'next/headers';

export async function getBaseUrl(): Promise<string> {
  try {
    const headersList = await headers();
    const host = headersList.get('host') ?? 'localhost:3000';
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
    const protocol = isLocalhost
      ? 'http'
      : headersList.get('x-forwarded-proto') ?? 'https';
    return `${protocol}://${host}`;
  } catch {
    return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  }
}
