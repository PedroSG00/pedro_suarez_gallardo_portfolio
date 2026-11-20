import Link from '@/components/ui/Link/Link';
import type { Locale } from '@/lib/locale';
import type { SiteData } from '@/content/site';
import styles from './Footer.module.css';

type Props = {
  locale: Locale;
  site: SiteData;
  labels: {
    copyright: string;
    github: string;
    linkedin: string;
    email: string;
    cv: string;
    newTab: string;
  };
};

export default function Footer({ locale, site, labels }: Props) {
  return (
    <footer className={styles.footer}>
      <ul className={styles.list}>
        {site.githubUrl && (
          <li className={styles.item}>
            <Link
              href={site.githubUrl}
              target="_blank"
              srLabel={labels.newTab}
            >
              {labels.github}
            </Link>
          </li>
        )}
        {site.linkedinUrl && (
          <li className={styles.item}>
            <Link
              href={site.linkedinUrl}
              target="_blank"
              srLabel={labels.newTab}
            >
              {labels.linkedin}
            </Link>
          </li>
        )}
        {site.email && (
          <li className={styles.item}>
            <Link href={`mailto:${site.email}`}>{labels.email}</Link>
          </li>
        )}
        {site.cvPath[locale] && (
          <li className={styles.item}>
            <Link
              href={site.cvPath[locale]}
              target="_blank"
              srLabel={labels.newTab}
            >
              {labels.cv}
            </Link>
          </li>
        )}
      </ul>
      {labels.copyright && (
        <p className={styles.copyright}>{labels.copyright}</p>
      )}
    </footer>
  );
}
