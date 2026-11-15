/**
 * LanguageSelector.tsx — T18 (RF-4, RF-8)
 * Language selector: one native link per locale. All visible texts arrive as
 * props from the server layout, so this component never reads a dictionary.
 * Each link points to the same route in the other language (works without JS).
 * onClick calls setLocale from useLocale, which is the unique writer of the
 * lang cookie and handles navigation with router.push, preserving path, query
 * and hash. Active state uses aria-current.
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from '../../i18n/provider/use-locale';
import { Locale, locales } from '../../i18n/config';

interface LanguageSelectorProps {
  locale: Locale;
  labels: Record<Locale, string>;
}

export default function LanguageSelector({
  locale,
  labels,
}: LanguageSelectorProps) {
  const { setLocale } = useLocale();
  const pathname = usePathname();

  const otherLocale = locales.find((l) => l !== locale);

  const segments = pathname.split('/');
  const currentIndex = segments.findIndex((s) => locales.includes(s as Locale));
  const href =
    currentIndex >= 0 && otherLocale
      ? segments.map((s, i) => (i === currentIndex ? otherLocale : s)).join('/')
      : pathname;

  return (
    <div>
      {locales.map((l: Locale) => {
        const isActive = l === locale;
        const linkHref = isActive ? pathname : href;
        return (
          <Link
            key={l}
            href={linkHref}
            onClick={(event) => {
              // Navigation belongs to useLocale, which rebuilds the URL with
              // the current query string and hash (RF-4). Without this the
              // Link's href would win and drop both.
              event.preventDefault();
              setLocale(l);
            }}
            aria-current={isActive ? 'true' : undefined}
            data-testid={`language-selector-${l}`}
          >
            {labels[l]}
          </Link>
        );
      })}
    </div>
  );
}
