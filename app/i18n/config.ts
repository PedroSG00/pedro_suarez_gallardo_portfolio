/**
 * i18n config — T11 (RF7)
 * Single source of locales, default language, cookie, and metadata routes.
 */

export const locales = ['en', 'es'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const LOCALE_COOKIE = 'lang';

export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year in seconds

export const metadataRoutes = {
  '/': 'home',
  '/proyectos': 'projects',
} as const;
