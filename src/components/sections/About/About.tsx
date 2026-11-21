'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { SITE } from '@/content/site';
import Section from '@/components/ui/Section/Section';
import SectionHeading from '@/components/ui/SectionHeading/SectionHeading';
import Reveal from '@/components/ui/Reveal/Reveal';
import RevealGroup from '@/components/ui/RevealGroup/RevealGroup';
import Tag from '@/components/ui/Tag/Tag';
import AboutStatement from '@/components/sections/AboutStatement/AboutStatement';
import './About.module.css';

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
  const [portraitFailed, setPortraitFailed] = useState(false);

  return (
    <Section id="about" labelledBy="about-heading">
      <SectionHeading id="about-heading" index="01" label={t('intro')} />
      <div
        data-about-content
        className="mx-auto grid max-w-[calc(var(--grid-max-width)+2*var(--grid-gutter))] gap-6 px-(--grid-gutter) pb-12 md:gap-8"
      >
        <Reveal variant="fade">
          <AboutStatement text={t('statement')} />
        </Reveal>
        <div
          className={`grid items-start gap-6 md:gap-8 ${portraitFailed ? '' : 'lg:grid-cols-[max-content_minmax(0,1fr)]'}`}
        >
          {!portraitFailed && (
            <div className="lg:col-start-1 lg:row-start-1">
              <Reveal variant="fade">
                <Image
                  alt=""
                  aria-label={t('portraitAlt')}
                  className="h-auto w-full max-w-sm aspect-auto border-(length:--line-width) border-line lg:max-w-md"
                  data-about-portrait
                  height={1278}
                  onError={() => setPortraitFailed(true)}
                  role="img"
                  src={SITE.portraitSrc}
                  unoptimized
                  width={1230}
                />
              </Reveal>
            </div>
          )}
          <div className={`grid min-w-0 gap-4 ${portraitFailed ? '' : 'lg:col-start-2 lg:row-start-1'}`}>
            <div className="grid max-w-prose gap-4 text-body">
              {PARAGRAPH_KEYS.map((key) => (
                <Reveal key={key} variant="fade">
                  <p>{t(`paragraphs.${key}`)}</p>
                </Reveal>
              ))}
            </div>
            <div aria-label={t('intro')} className="flex flex-wrap gap-2" role="list">
              <RevealGroup variant="fade">
                {VALUE_KEYS.map((key) => (
                  <span key={key} className="block" role="listitem">
                    <Tag>{t(`values.${key}`)}</Tag>
                  </span>
                ))}
              </RevealGroup>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
