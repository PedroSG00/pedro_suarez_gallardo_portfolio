'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Github, Linkedin, Mail, Page } from 'iconoir-react';
import Link from '@/components/ui/Link/Link';
import type { Locale } from '@/lib/locale';
import type { SiteData } from '@/content/site';

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
  const github = labels?.github ?? tContact('github');
  const linkedin = labels?.linkedin ?? tContact('linkedin');
  const email = labels?.email ?? tContact('email');
  const cv = labels?.cv ?? tContact('cv');
  const newTab = labels?.newTab ?? tShared('newTab');
  const copyright = labels?.copyright ?? tFooter('copyright');

  return (
    <footer className="border-t-(length:--line-width) border-line print:hidden">
      <div className="mx-auto flex max-w-[calc(var(--grid-max-width)+2*var(--grid-gutter))] flex-wrap items-center justify-between gap-4 px-(--grid-gutter) py-8">
        <ul className="flex flex-wrap gap-2">
          {site.githubUrl && (
            <li>
              <Link
                href={site.githubUrl}
                target="_blank"
                srLabel={newTab}
                icon={<Github aria-hidden="true" className="size-5 shrink-0" />}
              >
                {github}
              </Link>
            </li>
          )}
          {site.linkedinUrl && (
            <li>
              <Link
                href={site.linkedinUrl}
                target="_blank"
                srLabel={newTab}
                icon={<Linkedin aria-hidden="true" className="size-5 shrink-0" />}
              >
                {linkedin}
              </Link>
            </li>
          )}
          {site.email && (
            <li>
              <Link
                href={`mailto:${site.email}`}
                icon={<Mail aria-hidden="true" className="size-5 shrink-0" />}
              >
                {email}
              </Link>
            </li>
          )}
          {site.cvPath[currentLocale] && (
            <li>
              <Link
                href={site.cvPath[currentLocale]}
                target="_blank"
                srLabel={newTab}
                icon={<Page aria-hidden="true" className="size-5 shrink-0" />}
              >
                {cv}
              </Link>
            </li>
          )}
        </ul>
        {copyright && (
          <p className="text-meta text-ink-muted">{copyright}</p>
        )}
      </div>
    </footer>
  );
}
