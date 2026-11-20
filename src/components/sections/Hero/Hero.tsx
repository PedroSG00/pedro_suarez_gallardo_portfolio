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
    <section aria-labelledby={name ? 'hero-name' : undefined}>
      {name && (
        <h1 id="hero-name" aria-label={name}>
          {name.split(' ').map((word) => (
            <span key={word} aria-hidden="true">{word}</span>
          ))}
          <span aria-hidden="true">{cursor}</span>
        </h1>
      )}
      <Reveal variant="rise">{role && <p>{role}</p>}</Reveal>
      <Reveal variant="rise">{pitch && <p>{pitch}</p>}</Reveal>
      <Reveal variant="rise">{support && <p>{support}</p>}</Reveal>
      <Reveal variant="rise">{meta && <p>{meta}</p>}</Reveal>
      <RevealGroup variant="rise">
        {ctaPrimary && <Link href={primaryHref}>{ctaPrimary}</Link>}
        {ctaSecondary && <Link href={secondaryHref}>{ctaSecondary}</Link>}
      </RevealGroup>
    </section>
  );
}
