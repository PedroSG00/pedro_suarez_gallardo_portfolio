import { useTranslations } from 'next-intl';
import Section from '@/components/ui/Section/Section';
import SectionHeading from '@/components/ui/SectionHeading/SectionHeading';
import StackFlatList from '@/components/sections/Stack/StackFlatList';
import '@/components/sections/Stack/Stack.module.css';

export default function Stack() {
  const navigation = useTranslations('shared.nav');

  return (
    <Section id="stack" labelledBy="stack-heading">
      <SectionHeading id="stack-heading" index="03" label={navigation('stack')} />
      <div
        data-stack-content
        className="relative mx-auto grid max-w-[calc(var(--grid-max-width)+2*var(--grid-gutter))] gap-6 px-(--grid-gutter) pb-12"
      >
        <StackFlatList />
      </div>
    </Section>
  );
}
