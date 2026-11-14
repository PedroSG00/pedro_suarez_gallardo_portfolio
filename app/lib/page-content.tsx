/**
 * Shared page content builder for locale pages.
 * Extracts duplicated metadata + page shell between home and projects pages.
 */

import { getBaseUrl } from './get-base-url';
import { getDictionary } from '../i18n/translation/get-dictionary';
import { Locale } from '../i18n/config';
import { createT } from '../i18n/translation/translate';

export function generatePageMetadata(
  metadataKey: 'home' | 'projects',
  pathSuffix: string
) {
  return async function generateMetadata({
    params,
  }: {
    params: Promise<{ locale: string }>;
  }) {
    const { locale } = (await params) as { locale: Locale };
    const baseUrl = await getBaseUrl();
    const dict = getDictionary(locale) as Record<string, unknown>;
    const metadata = (dict.metadata as Record<string, unknown>)[
      metadataKey
    ] as Record<string, string>;
    return {
      title: metadata.title,
      description: metadata.description,
      canonical: `${baseUrl}/${locale}/${pathSuffix}`,
      alternates: {
        languages: {
          en: `${baseUrl}/en/${pathSuffix}`,
          es: `${baseUrl}/es/${pathSuffix}`,
        },
      },
    };
  };
}

export function pageShell(locale: Locale, translationKey: string) {
  const dict = getDictionary(locale) as Record<string, unknown>;
  const t = createT(dict);
  return (
    <main>
      <h1>{t(translationKey)}</h1>
    </main>
  );
}
