import enMessages from '../../../messages/en.json';
import esMessages from '../../../messages/es.json';
import { buildSectionDestinations } from '@/content/sections';
import Hero from '@/components/sections/Hero/Hero';
import Section from '@/components/ui/Section/Section';
import SectionHeading from '@/components/ui/SectionHeading/SectionHeading';

export default async function LocalePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = locale === 'es' ? esMessages : enMessages;

  const sections = buildSectionDestinations({
    about: messages.shared.nav.about,
    work: messages.shared.nav.experience,
    stack: messages.shared.nav.stack,
    contact: messages.shared.nav.contact,
  });

  const heroContent = {
    name: messages.hero.name,
    role: messages.hero.role,
    pitch: messages.hero.pitch,
    support: messages.hero.support,
    meta: messages.hero.meta,
    ctaPrimary: messages.hero.ctaPrimary,
    ctaSecondary: messages.hero.ctaSecondary,
  };

  return (
    <>
      <Hero content={heroContent} primaryHref="#work" secondaryHref="#contact" />
      {sections.map((section) => (
        <Section key={section.id} id={section.id} labelledBy={`${section.id}-heading`}>
          <SectionHeading
            id={`${section.id}-heading`}
            index={section.index}
            label={section.label}
          />
        </Section>
      ))}
    </>
  );
}
