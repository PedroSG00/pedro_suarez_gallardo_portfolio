/**
 * app/[locale]/projects/page.tsx — T22 (RF8)
 * Projects page per language. Exports generateMetadata({ params }) that reads
 * metadata.projects.title/description from the merged dictionary on the server.
 */

import { getDictionary } from '../../i18n/translation/get-dictionary';
import { Locale } from '../../i18n/config';
import { createT } from '../../i18n/translation/translate';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const dict = getDictionary(locale) as Record<string, unknown>;
  const metadata = (dict.metadata as Record<string, unknown>).projects as Record<
    string,
    string
  >;
  return {
    title: metadata.title,
    description: metadata.description,
  };
}

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const t = createT(getDictionary(locale));

  return (
    <main>
      <h1>{t('nav.projects')}</h1>
    </main>
  );
}
