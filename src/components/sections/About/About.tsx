'use client';

import { useTranslations } from 'next-intl';
import Section from '@/components/ui/Section/Section';
import SectionHeading from '@/components/ui/SectionHeading/SectionHeading';
import Tag from '@/components/ui/Tag/Tag';

const PARAGRAPH_KEYS = ['problem', 'experience', 'approach', 'background'] as const;
const VALUE_KEYS = [
  'detailOriented',
  'analytical',
  'autonomous',
  'teamwork',
  'continuousLearning',
] as const;

export default function About() {
  const t = useTranslations('about');

  return (
    <Section id="about" labelledBy="about-heading">
      <SectionHeading id="about-heading" index="01" label={t('intro')} />
      <div className="mx-auto grid max-w-[calc(var(--grid-max-width)+2*var(--grid-gutter))] gap-8 px-(--grid-gutter) pb-16 md:gap-12">
        <p className="max-w-prose text-title font-emphasis">{t('statement')}</p>
        <div className="grid max-w-prose gap-5 text-body">
          {PARAGRAPH_KEYS.map((key) => (
            <p key={key}>{t(`paragraphs.${key}`)}</p>
          ))}
        </div>
        <ul aria-label={t('intro')} className="flex flex-wrap gap-2">
          {VALUE_KEYS.map((key) => (
            <li key={key}>
              <Tag>{t(`values.${key}`)}</Tag>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
