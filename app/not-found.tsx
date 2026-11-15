/**
 * app/not-found.tsx — T17 (RF-7, RF-9, RNF-3)
 * Bilingual 404 screen rendered inside the root layout, so it is a complete,
 * JavaScript-independent HTML document with the effective theme.
 * Declared noindex, no canonical and no language alternatives. No header, no
 * controls: only exit links (home in the active language + the other language).
 *
 * `not-found` components receive no props, so the active locale comes from the
 * `x-locale` request header set by the proxy.
 */

import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getDictionary } from './i18n/translation/get-dictionary';
import { createT } from './i18n/translation/translate';
import { defaultLocale, type Locale } from './i18n/config';

function isLocale(value: string | null | undefined): value is Locale {
  return value === 'en' || value === 'es';
}

async function resolveLocale(): Promise<Locale> {
  try {
    const headerList = await headers();
    const fromProxy = headerList.get('x-locale');
    if (isLocale(fromProxy)) return fromProxy;
  } catch {
    // No request scope (unit tests).
  }
  return defaultLocale;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveLocale();
  const t = createT(getDictionary(locale));
  // Next injects `<meta name="robots" content="noindex">` for the not-found
  // convention. Declaring it here too would emit a duplicate tag.
  return {
    title: t('common.notFound'),
  };
}

export default async function NotFound() {
  const locale = await resolveLocale();
  const t = createT(getDictionary(locale));
  const otherLocale: Locale = locale === 'en' ? 'es' : 'en';

  return (
    <main className="min-h-full flex flex-col items-center justify-center p-4 text-center">
      <span
        aria-hidden="true"
        className="text-display leading-none"
        data-testid="error-code"
      >
        {t('common.errorCode')}
      </span>
      <h1 className="text-page-title mt-2">{t('common.notFound')}</h1>
      <p className="text-body mt-4">
        <a href={`/${locale}`} className="underline">
          {t('common.back')}
        </a>
      </p>
      <p className="text-body mt-2">
        <a href={`/${otherLocale}`} className="underline" lang={otherLocale}>
          {t(`languages.${otherLocale}`)}
        </a>
      </p>
    </main>
  );
}
