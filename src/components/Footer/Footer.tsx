'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Github, Linkedin, Mail, Page } from 'iconoir-react';
import Link from '@/components/ui/Link/Link';
import { buildContactLinks, type ContactLink } from '@/lib/contact-links';
import type { Locale } from '@/lib/locale';
import type { SiteData } from '@/content/site';

const CHANNEL_ICONS: Record<ContactLink['channel'], typeof Mail> = {
  email: Mail,
  linkedin: Linkedin,
  github: Github,
  cv: Page,
};

type Props = {
  site: SiteData;
  locale?: Locale;
  labels?: Partial<{
    copyright: string;
    github: string;
    linkedin: string;
    email: string;
    cv: string;
    newTab: string;
  }>;
};

export default function Footer({ locale, site, labels }: Props) {
  const hookLocale = useLocale();
  const currentLocale = (locale ?? hookLocale) as Locale;
  const tContact = useTranslations('contact');
  const tFooter = useTranslations('footer');
  const tShared = useTranslations('shared');
  const copyright = labels?.copyright ?? tFooter('copyright');
  const links = buildContactLinks(currentLocale, 'footer', site, {
    email: labels?.email ?? tContact('email'),
    linkedin: labels?.linkedin ?? tContact('linkedin'),
    github: labels?.github ?? tContact('github'),
    cv: labels?.cv ?? tContact('cv'),
    newTab: labels?.newTab ?? tShared('newTab'),
  });

  return (
    <footer className="border-t-(length:--line-width) border-line print:hidden">
      <div className="mx-auto flex max-w-[calc(var(--grid-max-width)+2*var(--grid-gutter))] flex-wrap items-center justify-between gap-4 px-(--grid-gutter) py-8">
        <ul className="flex flex-wrap gap-2">
          {links.map(({ channel, href, label, target, srLabel }) => {
            const Icon = CHANNEL_ICONS[channel];
            return (
              <li key={channel} className="min-w-0">
                <Link
                  href={href}
                  target={target}
                  srLabel={srLabel}
                  icon={<Icon aria-hidden="true" className="size-5 shrink-0" />}
                >
                  {label}
                </Link>
                {channel === 'email' && (
                  <span className="mt-2 block text-meta text-ink-muted wrap-anywhere">{site.email}</span>
                )}
              </li>
            );
          })}
        </ul>
        {copyright && (
          <p className="text-meta text-ink-muted">{copyright}</p>
        )}
      </div>
    </footer>
  );
}
