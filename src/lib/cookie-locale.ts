import type { Locale } from './locale';

const COOKIE_NAME = 'psg_locale';
const COOKIE_MAX_AGE = 31536000; // 1 año en segundos

function parseCookieValue(cookieHeader?: string): string | undefined {
  if (!cookieHeader) return undefined;
  const match = cookieHeader.match(new RegExp('(?:^|; *)psg_locale=([^;]+)'));
  return match?.[1];
}

export function getLocaleCookie(
  request: { cookies?: Record<string, string>; headers?: { cookie?: string } }
): Locale | null {
  const cookieValue =
    request.cookies?.[COOKIE_NAME] ?? parseCookieValue(request.headers?.cookie);

  if (cookieValue === 'en' || cookieValue === 'es') {
    return cookieValue;
  }

  return null;
}

export function setLocaleCookie(
  response: { headers?: Record<string, string[]> },
  locale: Locale
): void {
  const cookie = `${COOKIE_NAME}=${locale}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${COOKIE_MAX_AGE}`;
  if (!response.headers) {
    response.headers = {};
  }
  response.headers['set-cookie'] = [
    ...(response.headers['set-cookie'] ?? []),
    cookie,
  ];
}
