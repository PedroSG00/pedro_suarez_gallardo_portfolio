/**
 * app/[locale]/page.tsx — T21 (RNF-3)
 * Home page per language. Exports generateMetadata({ params }) that reads
 * metadata.home.title/description from the dictionary on the server, plus
 * canonical URL and hreflang alternates with x-default → /en.
 */

import { getBaseUrl } from '../lib/get-base-url';
import { getDictionary } from '../i18n/translation/get-dictionary';
import { Locale } from '../i18n/config';
import { createT } from '../i18n/translation/translate';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const baseUrl = await getBaseUrl();
  const dict = getDictionary(locale) as Record<string, unknown>;
  const metadata = (dict.metadata as Record<string, unknown>).home as Record<
    string,
    string
  >;
  return {
    title: metadata.title,
    description: metadata.description,
    canonical: `${baseUrl}/${locale}/`,
    alternates: {
      languages: {
        en: `${baseUrl}/en/`,
        es: `${baseUrl}/es/`,
      },
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const t = createT(getDictionary(locale));

  return (
    <main>
      <h1>{t('sections.hero.title')}</h1>
    </main>
  );
}
