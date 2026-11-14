/**
 * app/[locale]/projects/page.tsx — T21 (RNF-3)
 * Projects page per language. Exports generateMetadata({ params }) that reads
 * metadata.projects.title/description from the dictionary on the server, plus
 * canonical URL and hreflang alternates with x-default → /en.
 */

import { generatePageMetadata, pageShell } from '../../lib/page-content';
import { Locale } from '../../i18n/config';

export const generateMetadata = generatePageMetadata('projects', 'projects');

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  return pageShell(locale, 'nav.projects');
}
