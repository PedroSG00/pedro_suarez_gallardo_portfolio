/**
 * app/[locale]/page.tsx — T21 (RF8, RNF4)
 * Home page per language. Exports generateMetadata({ params }) that reads
 * metadata.home.title/description from the merged dictionary on the server.
 */

import { getDictionary } from '../i18n/get-dictionary';
import { Locale } from '../i18n/config';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const dict = getDictionary(locale) as Record<string, unknown>;
  const metadata = (dict.metadata as Record<string, unknown>).home as Record<
    string,
    string
  >;
  return {
    title: metadata.title,
    description: metadata.description,
  };
}

export default function HomePage() {
  return <main />;
}
