'use client';

import { useLocale, useTranslations } from 'next-intl';
import { getPathname, usePathname, useRouter } from '@/i18n/navigation';
import type { Locale } from '@/lib/locale';

type Props = {
  locale?: Locale;
  ariaLabelEn?: string;
  ariaLabelEs?: string;
};

const GLOBE = (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    style={{ color: 'currentColor' }}
  >
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export default function LanguageSwitch({
  locale,
  ariaLabelEn,
  ariaLabelEs,
}: Props) {
  const hookLocale = useLocale();
  const currentLocale = (locale ?? hookLocale) as Locale;
  const t = useTranslations('shared.langSwitch');
  const pathname = usePathname();
  const router = useRouter();
  const enLabel = ariaLabelEn ?? t('en');
  const esLabel = ariaLabelEs ?? t('es');

  if (!currentLocale || !enLabel || !esLabel) {
    return null;
  }

  const search = typeof window !== 'undefined' ? window.location.search : '';
  const hash = typeof window !== 'undefined' ? window.location.hash : '';

  const otherLang: Locale = currentLocale === 'en' ? 'es' : 'en';
  const href = `${getPathname({ href: pathname, locale: otherLang })}${search}${hash}`;
  const localizedPath = `${pathname}${search}${hash}`;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.replace(localizedPath, { locale: otherLang });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      router.replace(localizedPath, { locale: otherLang });
    }
  };

  return (
    <a
      role="button"
      href={href}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-pressed={currentLocale === 'en'}
      aria-label={currentLocale === 'en' ? esLabel : enLabel}
      className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-surface)] text-[var(--color-ink)] border [var(--line-width)] solid [var(--color-line)] transition-colors duration-[var(--duration-state)] focus-visible:outline-none"
    >
      {GLOBE}
    </a>
  );
}
