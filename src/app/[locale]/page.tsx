import { SECTION_DEFINITIONS } from '@/content/sections';
import About from '@/components/sections/About/About';
import Contact from '@/components/sections/Contact/Contact';
import Hero from '@/components/sections/Hero/Hero';
import Stack from '@/components/sections/Stack/Stack';
import Work from '@/components/sections/Work/Work';

const SECTIONS = {
  about: About,
  work: Work,
  stack: Stack,
  contact: Contact,
};

export default function LocalePage() {
  return (
    <>
      <Hero primaryHref="#work" secondaryHref="#contact" />
      {SECTION_DEFINITIONS.map(({ id }) => {
        const SectionComponent = SECTIONS[id];
        return <SectionComponent key={id} />;
      })}
    </>
  );
}
