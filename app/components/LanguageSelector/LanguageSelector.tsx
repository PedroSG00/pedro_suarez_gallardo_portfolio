/**
 * LanguageSelector.tsx — T18 (RF-4, RF-8)
 * Language selector: one native link per locale. Labels come from
 * languages.<locale> in the dictionary. Each link points to the same route in
 * the other language (works without JS). onClick calls setLocale from useLocale,
 * which is the unique writer of the lang cookie and handles navigation with
 * router.push, preserving path, query and hash. Active state uses aria-current.
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from '../../i18n/provider/use-locale';
import { Locale, locales } from '../../i18n/config';

export default function LanguageSelector() {
  const { locale, setLocale, t } = useLocale();
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
            onClick={() => {
              setLocale(l);
            }}
            aria-current={isActive ? 'true' : undefined}
            data-testid={`language-selector-${l}`}
          >
            {t?.(`languages.${l}`) ?? l.toUpperCase()}
          </Link>
        );
      })}
    </div>
  );
}
