/**
 * app/[locale]/page.tsx — T21 (RNF-3)
 * Home page per language. Exports generateMetadata({ params }) that reads
 * metadata.home.title/description from the dictionary on the server, plus
 * canonical URL and hreflang alternates with x-default → /en.
 */

import { generatePageMetadata, pageShell } from '../lib/page-content';
import { Locale } from '../i18n/config';

export const generateMetadata = generatePageMetadata('home', '');

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  return pageShell(locale, 'sections.hero.title');
}
