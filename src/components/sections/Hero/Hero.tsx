'use client';

import { useTranslations } from 'next-intl';
import Link from '@/components/ui/Link/Link';
import Reveal from '@/components/ui/Reveal/Reveal';
import RevealGroup from '@/components/ui/RevealGroup/RevealGroup';
import './Hero.module.css';

type HeroMessage =
  | 'name'
  | 'role'
  | 'pitch'
  | 'support'
  | 'meta'
  | 'ctaPrimary'
  | 'ctaSecondary';

type HeroContent = Partial<Record<HeroMessage, string>>;

type Props = {
  content?: HeroContent;
  primaryHref?: string;
  secondaryHref?: string;
};

export default function Hero({
  content,
  primaryHref = '#work',
  secondaryHref = '#contact',
}: Props) {
  const t = useTranslations('hero');
  const text = (key: HeroMessage): string =>
    content?.[key] ?? (t.has(key) ? t(key) : '');

  const name = text('name');
  const role = text('role');
  const pitch = text('pitch');
  const support = text('support');
  const meta = text('meta');
  const ctaPrimary = text('ctaPrimary');
  const ctaSecondary = text('ctaSecondary');
  const cursor = '█';

  return (
    <section
      aria-labelledby={name ? 'hero-name' : undefined}
      className="mx-auto min-h-dvh max-w-[calc(var(--grid-max-width)+2*var(--grid-gutter))] px-(--grid-gutter) pt-8 pb-14 md:pt-12"
    >
      {name && (
        <h1 id="hero-name" aria-label={name} className="font-emphasis leading-(--text-display--line-height)">
          {name.split(' ').map((word, index, words) => (
            <span key={word} aria-hidden="true" data-hero-line>
              <span aria-hidden="true">{word}</span>
              {index === words.length - 1 && (
                <span data-hero-cursor aria-hidden="true">{cursor}</span>
              )}
            </span>
          ))}
        </h1>
      )}
      <div className="grid gap-4 border-t-(length:--line-width) border-line pt-5 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-8">
        <div className="grid content-start gap-2">
          {role && <Reveal variant="rise"><p className="text-body font-emphasis">{role}</p></Reveal>}
          {meta && <Reveal variant="rise"><p className="text-meta text-ink-muted">{meta}</p></Reveal>}
        </div>
        <div className="grid content-start gap-3">
          {pitch && <Reveal variant="rise"><p className="max-w-prose text-body">{pitch}</p></Reveal>}
          {support && <Reveal variant="rise"><p className="text-meta text-ink-muted">{support}</p></Reveal>}
        </div>
        <div className="flex flex-wrap gap-2 md:col-span-2">
          <RevealGroup variant="rise">
            {ctaPrimary && <Link href={primaryHref} tone="primary">{ctaPrimary}</Link>}
            {ctaSecondary && <Link href={secondaryHref}>{ctaSecondary}</Link>}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
