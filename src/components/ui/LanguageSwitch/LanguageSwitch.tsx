'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import type { Locale } from '@/lib/locale';

type Props = {
  locale?: Locale;
  ariaLabelEn?: string;
  ariaLabelEs?: string;
};

type PendingLocaleNavigation = {
  locale: Locale;
  search: string;
  hash: string;
  scrollY: number;
  headingTop: number | null;
  startedAt: number;
};

type ActivationPosition = {
  scrollY: number;
  headingTop: number | null;
};

const PENDING_LOCALE_NAVIGATION_KEY = 'psg-locale-navigation';

/** Builds a locale destination without duplicating the locale prefix. */
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
  const router = useRouter();
  const [locationParts, setLocationParts] = useState({ search: '', hash: '' });
  const activationPositionRef = useRef<ActivationPosition | null>(null);
  const enLabel = ariaLabelEn ?? t('en');
  const esLabel = ariaLabelEs ?? t('es');

  // Read the current locale from the route, which is authoritative over the
  // default locale returned by useLocale in some navigation states.
  const localeFromPath = (pathname.match(/^\/([a-z]{2})(?:\/|$)/)?.[1] ??
    hookLocale) as Locale;
  const currentLocale = (locale ?? localeFromPath) as Locale;

  useEffect(() => {
    const syncLocationParts = () => {
      setLocationParts({
        search: window.location.search,
        hash: window.location.hash,
      });
    };

    // Read browser-only URL parts after hydration to keep server and initial client markup identical.
    syncLocationParts();
    window.addEventListener('hashchange', syncLocationParts);
    window.addEventListener('popstate', syncLocationParts);

    return () => {
      window.removeEventListener('hashchange', syncLocationParts);
      window.removeEventListener('popstate', syncLocationParts);
    };
  }, [pathname]);

  useLayoutEffect(() => {
    let pending: PendingLocaleNavigation | null = null;
    try {
      const stored = window.sessionStorage.getItem(PENDING_LOCALE_NAVIGATION_KEY);
      if (stored) {
        pending = JSON.parse(stored) as PendingLocaleNavigation;
      }
    } catch {
      return;
    }

    if (
      !pending ||
      pending.locale !== currentLocale ||
      !Number.isFinite(pending.scrollY) ||
      Date.now() - pending.startedAt > 5000
    ) {
      return;
    }

    window.history.replaceState(
      window.history.state,
      '',
      `${window.location.pathname}${pending.search}${pending.hash}`,
    );
    const restorePosition = () => {
      const targetId = pending.hash.slice(1);
      const heading = targetId
        ? document
            .getElementById(targetId)
            ?.querySelector<HTMLElement>('[data-section-heading]')
        : null;
      const targetTop = heading?.getBoundingClientRect().top;
      const scrollY =
        pending.headingTop !== null && targetTop !== undefined
          ? window.scrollY + targetTop - pending.headingTop
          : pending.scrollY;
      window.scrollTo({ top: scrollY, behavior: 'instant' });
      window.sessionStorage.removeItem(PENDING_LOCALE_NAVIGATION_KEY);
    };
    window.requestAnimationFrame(() => window.requestAnimationFrame(restorePosition));
  }, [currentLocale]);

  if (!currentLocale || !enLabel || !esLabel) {
    return null;
  }

  const target = buildLanguageTarget(
    currentLocale,
    pathname,
    locationParts.search,
    locationParts.hash,
  );

  const navigateToOtherLanguage = () => {
    const nextLocale: Locale = currentLocale === 'en' ? 'es' : 'en';
    const search = typeof window !== 'undefined' ? window.location.search : '';
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    const activationPosition = activationPositionRef.current;
    const scrollY = activationPosition?.scrollY ?? window.scrollY;
    const sectionId = hash.slice(1);
    const headingTop =
      activationPosition?.headingTop ??
      (sectionId
        ? document
            .getElementById(sectionId)
            ?.querySelector<HTMLElement>('[data-section-heading]')
            ?.getBoundingClientRect().top ?? null
        : null);
    activationPositionRef.current = null;
    const destination = buildLanguageTarget(
      currentLocale,
      pathname,
      search,
      '',
    );
    const pending: PendingLocaleNavigation = {
      locale: nextLocale,
      search,
      hash,
      scrollY,
      headingTop,
      startedAt: Date.now(),
    };
    try {
      window.sessionStorage.setItem(
        PENDING_LOCALE_NAVIGATION_KEY,
        JSON.stringify(pending),
      );
    } catch {
      // Navigation still works if session storage is unavailable.
    }
    router.replace(destination, { scroll: false });
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigateToOtherLanguage();
  };

  const handlePointerDown = () => {
    const sectionId = window.location.hash.slice(1);
    const headingTop = sectionId
      ? document
          .getElementById(sectionId)
          ?.querySelector<HTMLElement>('[data-section-heading]')
          ?.getBoundingClientRect().top ?? null
      : null;
    activationPositionRef.current = { scrollY: window.scrollY, headingTop };
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigateToOtherLanguage();
    }
  };

  // Without JavaScript, the href still points to the localized destination.
  const href = target;

  return (
    <a
      role="button"
      href={href}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      aria-pressed={currentLocale === 'en'}
      aria-label={currentLocale === 'en' ? esLabel : enLabel}
      className="inline-flex size-11 items-center justify-center border-(length:--line-width) border-line bg-surface text-ink transition-colors duration-(--duration-state) hover:bg-ink hover:text-surface"
    >
      <span aria-hidden="true" className="text-meta font-emphasis">{currentLocale.toUpperCase()}</span>
    </a>
  );
}
