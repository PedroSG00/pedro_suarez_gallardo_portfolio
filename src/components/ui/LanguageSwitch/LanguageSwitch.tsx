'use client';

import Link from 'next/link';
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

  const search = typeof window !== 'undefined' ? window.location.search : '';
  const hash = typeof window !== 'undefined' ? window.location.hash : '';

  const hrefFor = (targetLang: Locale) =>
    `${pathname.replace(/^\/(en|es)/, `/${targetLang}`)}${search}${hash}`;

  const handleClick = (targetLang: Locale) => (
    e: React.MouseEvent<HTMLAnchorElement>
  ) => {
    e.preventDefault();
    router.replace(hrefFor(targetLang));
  };

  return (
    <div role="group" aria-label="Idioma / Language">
      <Link
        href={hrefFor('en')}
        onClick={handleClick('en')}
        aria-label={ariaLabelEn}
        aria-current={locale === 'en' ? 'page' : undefined}
        className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-surface)] text-[var(--color-ink)] border [var(--line-width)] solid [var(--color-line)] transition-colors duration-[var(--duration-state)] aria-current:bg-[var(--color-ink)] aria-current:text-[var(--color-surface)]"
      >
        {GLOBE}
      </Link>
      <Link
        href={hrefFor('es')}
        onClick={handleClick('es')}
        aria-label={ariaLabelEs}
        aria-current={locale === 'es' ? 'page' : undefined}
        className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-surface)] text-[var(--color-ink)] border [var(--line-width)] solid [var(--color-line)] transition-colors duration-[var(--duration-state)] aria-current:bg-[var(--color-ink)] aria-current:text-[var(--color-surface)]"
      >
        {GLOBE}
      </Link>
    </div>
  );
}
