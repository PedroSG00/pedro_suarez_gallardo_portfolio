'use client';

import Link from '@/components/ui/Link/Link';
import Reveal from '@/components/ui/Reveal/Reveal';
import RevealGroup from '@/components/ui/RevealGroup/RevealGroup';
import './Hero.module.css';

type HeroContent = {
  name: string;
  role: string;
  pitch: string;
  support: string;
  meta: string;
  ctaPrimary: string;
  ctaSecondary: string;
};

type Props = {
  content: HeroContent;
  primaryHref?: string;
  secondaryHref?: string;
};

export default function Hero({
  content,
  primaryHref = '#work',
  secondaryHref = '#contact',
}: Props) {
  const { name, role, pitch, support, meta, ctaPrimary, ctaSecondary } = content;
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
