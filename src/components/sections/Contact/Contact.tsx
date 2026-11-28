import { useLocale, useTranslations } from 'next-intl';
import Heading from '@/components/ui/Heading/Heading';
import Link from '@/components/ui/Link/Link';
import Reveal from '@/components/ui/Reveal/Reveal';
import Section from '@/components/ui/Section/Section';
import SectionHeading from '@/components/ui/SectionHeading/SectionHeading';
import { SITE } from '@/content/site';
import { buildContactLinks } from '@/lib/contact-links';
import type { Locale } from '@/lib/locale';

export default function Contact() {
  const locale = useLocale() as Locale;
  const t = useTranslations('contact');
  const tShared = useTranslations('shared');
  const links = buildContactLinks(locale, 'contact', SITE, {
    email: t('email'),
    linkedin: t('linkedin'),
    github: t('github'),
    cv: t('cv'),
    newTab: tShared('newTab'),
  });

  return (
    <Section id="contact" labelledBy="contact-heading">
      <Reveal variant="clip" isLastSection>
        <SectionHeading id="contact-heading" index="04" label={t('intro')} />
        <div className="relative mx-auto grid max-w-[calc(var(--grid-max-width)+2*var(--grid-gutter))] gap-4 px-(--grid-gutter) pb-12 wrap-anywhere">
          <Heading level={3}>{t('title')}</Heading>
          <p className="max-w-prose text-body">{t('body')}</p>
          <ul className="flex flex-wrap gap-2">
            {links.map(({ channel, label, href, target }) => {
              const isEmail = channel === 'email';

              return (
                <li key={channel} className={isEmail ? 'min-w-0 basis-full' : undefined}>
                  <Link
                    href={href}
                    target={target}
                    className={isEmail ? 'w-full transition-none focus-visible:bg-ink focus-visible:text-surface' : undefined}
                  >
                    {isEmail ? (
                      <span className="grid min-w-0 gap-2 wrap-anywhere">
                        <span>{label}</span>{' '}
                        <span className="text-title">{SITE.email}</span>
                      </span>
                    ) : label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </Reveal>
    </Section>
  );
}
