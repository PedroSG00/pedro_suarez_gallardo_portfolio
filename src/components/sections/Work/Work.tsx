import { useTranslations } from 'next-intl';
import { WORK_ENTRIES } from '@/content/work';
import Section from '@/components/ui/Section/Section';
import SectionHeading from '@/components/ui/SectionHeading/SectionHeading';
import Heading from '@/components/ui/Heading/Heading';
import Tag from '@/components/ui/Tag/Tag';
import Reveal from '@/components/ui/Reveal/Reveal';
import '@/components/sections/Work/Work.module.css';

export default function Work() {
  const t = useTranslations('experience');
  const navigation = useTranslations('shared.nav');

  return (
    <Section id="work" labelledBy="work-heading">
      <SectionHeading id="work-heading" index="02" label={navigation('experience')} />
      <div className="relative mx-auto grid max-w-[calc(var(--grid-max-width)+2*var(--grid-gutter))] gap-8 px-(--grid-gutter) pb-12 wrap-anywhere">
        <Heading level={3}>{t('title')}</Heading>
        <ol role="list" className="grid list-none">
          {WORK_ENTRIES.map(({ id, technologies }, index) => (
            <li
              key={id}
              data-work-row
              className="min-w-0 border-t-(length:--line-width) border-line py-8"
            >
              <Reveal>
                <div className="grid min-w-0 gap-4 md:grid-cols-[max-content_minmax(0,1fr)] md:gap-8">
                  <span data-work-number aria-hidden="true" className="text-meta text-ink-muted tabular-nums">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="grid min-w-0 gap-4">
                    <Heading level={4}>{t(`items.${id}.title`)}</Heading>
                    <p className="max-w-prose text-body">{t(`items.${id}.result`)}</p>
                    <div data-work-technologies className="flex flex-wrap gap-2">
                      {technologies.map((technology) => (
                        <Tag key={technology}>{technology}</Tag>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
