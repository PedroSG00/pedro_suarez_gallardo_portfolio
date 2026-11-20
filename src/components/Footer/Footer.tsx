'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from '@/components/ui/Link/Link';
import type { Locale } from '@/lib/locale';
import type { SiteData } from '@/content/site';
import styles from './Footer.module.css';

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
    <footer className={styles.footer}>
      <ul className={styles.list}>
        {site.githubUrl && (
          <li className={styles.item}>
            <Link
              href={site.githubUrl}
              target="_blank"
              srLabel={newTab}
            >
              {github}
            </Link>
          </li>
        )}
        {site.linkedinUrl && (
          <li className={styles.item}>
            <Link
              href={site.linkedinUrl}
              target="_blank"
              srLabel={newTab}
            >
              {linkedin}
            </Link>
          </li>
        )}
        {site.email && (
          <li className={styles.item}>
            <Link href={`mailto:${site.email}`}>{email}</Link>
          </li>
        )}
        {site.cvPath[currentLocale] && (
          <li className={styles.item}>
            <Link
              href={site.cvPath[currentLocale]}
              target="_blank"
              srLabel={newTab}
            >
              {cv}
            </Link>
          </li>
        )}
      </ul>
      {copyright && (
        <p className={styles.copyright}>{copyright}</p>
      )}
    </footer>
  );
}
