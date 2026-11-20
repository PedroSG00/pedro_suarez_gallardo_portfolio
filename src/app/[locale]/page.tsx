import { getTranslations } from 'next-intl/server';
import { buildSectionDestinations } from '@/content/sections';
import Hero from '@/components/sections/Hero/Hero';
import Section from '@/components/ui/Section/Section';
import SectionHeading from '@/components/ui/SectionHeading/SectionHeading';

export default async function LocalePage() {
  const t = await getTranslations('shared.nav');
  const sections = buildSectionDestinations({
    about: t.has('about') ? t('about') : '',
    work: t.has('experience') ? t('experience') : '',
    stack: t.has('stack') ? t('stack') : '',
    contact: t.has('contact') ? t('contact') : '',
  });

  return (
    <>
      <Hero primaryHref="#work" secondaryHref="#contact" />
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
