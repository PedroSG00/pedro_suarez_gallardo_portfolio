/**
 * LanguageSelector.tsx — T19 (RF2, RF7)
 * Language selector: one option per locale from config.ts, labels from
 * languages.<locale> in the dictionary. Each option is a <Link> to the same
 * route in the other language (works without JS). onClick calls persistLocale
 * (writes localStorage + cookie) and never setLocale, to avoid double
 * navigation. Active state uses aria-current.
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from '../../i18n/use-locale';
import { Locale, locales, LOCALE_COOKIE } from '../../i18n/config';
import { writeStorage, writeCookie } from '../../i18n/storage';

function persistLocale(next: Locale): void {
  try {
    writeStorage(LOCALE_COOKIE, next);
  } catch {
    // Silently ignore storage errors (RF4, RNF6)
  }
  try {
    writeCookie(LOCALE_COOKIE, next);
  } catch {
    // Silently ignore cookie errors (RF4, RNF6)
  }
}

export default function LanguageSelector() {
  const { locale, t } = useLocale();
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
            onClick={() => persistLocale(l)}
            aria-current={isActive ? 'true' : undefined}
            data-testid={`language-selector-${l}`}
          >
            {t(`languages.${l}`)}
          </Link>
        );
      })}
    </div>
  );
}
