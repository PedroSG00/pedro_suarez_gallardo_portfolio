import { getTranslations } from 'next-intl/server';
import { buildSectionDestinations } from '@/content/sections';
import About from '@/components/sections/About/About';
import Hero from '@/components/sections/Hero/Hero';
import Stack from '@/components/sections/Stack/Stack';
import Work from '@/components/sections/Work/Work';
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
        section.id === 'about' ? (
          <About key={section.id} />
        ) : section.id === 'work' ? (
          <Work key={section.id} />
        ) : section.id === 'stack' ? (
          <Stack key={section.id} />
        ) : (
          <Section key={section.id} id={section.id} labelledBy={`${section.id}-heading`}>
            <SectionHeading
              id={`${section.id}-heading`}
              index={section.index}
              label={section.label}
            />
          </Section>
        )
      ))}
    </>
  );
}
