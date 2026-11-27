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
      <div data-work-content className="relative mx-auto grid max-w-[calc(var(--grid-max-width)+2*var(--grid-gutter))] px-(--grid-gutter) pb-12 wrap-anywhere">
        <Heading level={3}>{t('title')}</Heading>
        <ol role="list" className="grid list-none">
          {WORK_ENTRIES.map(({ id, technologies, icon: Icon }, index) => (
            <li
              key={id}
              data-work-row
              className="min-w-0 border-t-(length:--line-width) border-line"
            >
              <Reveal>
                <div data-work-composition>
                  <div className="flex items-center gap-3">
                    <Icon role="img" aria-hidden="true" focusable="false" className="size-8 shrink-0" />
                    <span data-work-number aria-hidden="true" className="tabular-nums">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <Heading level={4}>{t(`items.${id}.title`)}</Heading>
                  <div data-work-details className="grid min-w-0 gap-4">
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
