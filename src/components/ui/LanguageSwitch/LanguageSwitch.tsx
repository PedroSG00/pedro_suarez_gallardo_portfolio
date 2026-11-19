'use client';

import { usePathname, useRouter } from 'next/navigation';
import type { Locale } from '@/lib/locale';

type Props = {
  locale: Locale;
  ariaLabelEn: string;
  ariaLabelEs: string;
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
  const pathname = usePathname();
  const router = useRouter();

  if (!locale || !ariaLabelEn || !ariaLabelEs) {
    return null;
  }

  const search = typeof window !== 'undefined' ? window.location.search : '';
  const hash = typeof window !== 'undefined' ? window.location.hash : '';

  const otherLang: Locale = locale === 'en' ? 'es' : 'en';
  const href = `${pathname.replace(/^\/(en|es)/, `/${otherLang}`)}${search}${hash}`;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.replace(href);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      router.replace(href);
    }
  };

  return (
    <a
      role="button"
      href={href}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-pressed={locale === 'en'}
      aria-label={locale === 'en' ? ariaLabelEs : ariaLabelEn}
      className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-surface)] text-[var(--color-ink)] border [var(--line-width)] solid [var(--color-line)] transition-colors duration-[var(--duration-state)] focus-visible:outline-none"
    >
      {GLOBE}
    </a>
  );
}
