'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
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

/** Ruta de destino al cambiar de idioma, sin duplicar el prefijo de locale. */
function buildLanguageTarget(
  currentLocale: Locale,
  pathname: string,
  search: string,
  hash: string,
): string {
  const otherLang: Locale = currentLocale === 'en' ? 'es' : 'en';
  const rest = pathname
    .replace(new RegExp(`^/${currentLocale}`), '')
    .replace(/^\//, '')
    .replace(/\/$/, '');
  return `/${otherLang}${rest ? '/' + rest : ''}${search}${hash}`;
}

export default function LanguageSwitch({
  locale,
  ariaLabelEn,
  ariaLabelEs,
}: Props) {
  const hookLocale = useLocale();
  const t = useTranslations('shared.langSwitch');
  const pathname = usePathname();
  const enLabel = ariaLabelEn ?? t('en');
  const esLabel = ariaLabelEs ?? t('es');

  // El locale actual se lee de la ruta (siempre correcta) y no de useLocale,
  // que puede devolver el locale por defecto en lugar del de la ruta actual.
  const localeFromPath = (pathname.match(/^\/([a-z]{2})(?:\/|$)/)?.[1] ??
    hookLocale) as Locale;
  const currentLocale = (locale ?? localeFromPath) as Locale;

  if (!currentLocale || !enLabel || !esLabel) {
    return null;
  }

  const search = typeof window !== 'undefined' ? window.location.search : '';
  const hash = typeof window !== 'undefined' ? window.location.hash : '';

  const target = buildLanguageTarget(currentLocale, pathname, search, hash);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // Leer search/hash en el momento del clic por si cambiaron tras el render.
    const clickTarget = buildLanguageTarget(
      currentLocale,
      pathname,
      typeof window !== 'undefined' ? window.location.search : '',
      typeof window !== 'undefined' ? window.location.hash : '',
    );
    window.location.href = clickTarget;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const clickTarget = buildLanguageTarget(
        currentLocale,
        pathname,
        typeof window !== 'undefined' ? window.location.search : '',
        typeof window !== 'undefined' ? window.location.hash : '',
      );
      window.location.href = clickTarget;
    }
  };

  // La href (sin JS) apunta al mismo destino ya calculado.
  const href = target;

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
