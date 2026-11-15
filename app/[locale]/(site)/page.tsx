/**
 * app/[locale]/(site)/page.tsx — T18 (RF-3, RF-5, RNF-10)
 * Home page shells: the `inicio` anchor plus the four sections
 * experiencia, proyectos, stack and contacto in DESTINATIONS order. Each
 * section is a SectionAnchor with a bilingual title resolved from the
 * dictionary and a min-height so its title can cross the bottom edge of the
 * header. No CV content is rendered here (that belongs to 005).
 */

import { getDictionary } from '../../i18n/translation/get-dictionary';
import { Locale } from '../../i18n/config';
import { DESTINATIONS } from '../../navigation/destinations';
import { SectionAnchor } from '../../components/SectionAnchor/SectionAnchor';
import type enDictionary from '../../i18n/dictionaries/en.json';

type Dictionary = typeof enDictionary;

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = (await params) as { locale: Locale };
  const dictionary = getDictionary(locale) as Dictionary;
  const sections = dictionary.sections as Record<string, { title: string }>;

  return (
    <main>
      {DESTINATIONS.map((dest) => {
        const sectionId =
          dest.id === 'home' ? 'inicio' : dest.sectionId;
        const titleKey = dest.id === 'home' ? 'hero' : dest.id;
        const title =
          sections[titleKey]?.title ?? sections[dest.sectionId]?.title;

        return (
          <section key={dest.id} data-testid="section-shell" style={{ minHeight: '70vh' }}>
            <SectionAnchor id={sectionId}>{title}</SectionAnchor>
          </section>
        );
      })}
    </main>
  );
}
