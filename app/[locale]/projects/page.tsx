/**
 * app/[locale]/proyectos/page.tsx — T22 (RF8)
 * Proyectos page per language. Exports generateMetadata({ params }) that reads
 * metadata.projects.title/description from the merged dictionary on the server.
 */

import { getDictionary } from '../../i18n/get-dictionary';
import { Locale } from '../../i18n/config';

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

export default function ProyectosPage() {
  return <main />;
}
