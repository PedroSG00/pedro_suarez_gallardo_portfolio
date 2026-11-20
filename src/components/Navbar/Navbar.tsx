'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { getPathname, usePathname, useRouter } from '@/i18n/navigation';

import Logo from '@/components/ui/Logo/Logo';
import NavLinks from '@/components/ui/NavLinks/NavLinks';
import ThemeControl from '@/components/ui/ThemeControl/ThemeControl';
import LanguageSwitch from '@/components/ui/LanguageSwitch/LanguageSwitch';
import { resolveNavbarVisibility } from '@/lib/nav-visibility';
import type { Locale } from '@/lib/locale';
import type { SiteData } from '@/content/site';
import { buildSectionDestinations, type SectionDestination } from '@/content/sections';
import styles from './Navbar.module.css';

type Props = {
  site: SiteData;
  locale?: Locale;
  sections?: SectionDestination[];
  labels?: Partial<{
    nav: string;
    openMenu: string;
    closeMenu: string;
    themeToggle: string;
    langEn: string;
    langEs: string;
  }>;
};

export default function Navbar({
  locale,
  site,
  sections: providedSections,
  labels,
}: Props) {
  const hookLocale = useLocale();
  const currentLocale = (locale ?? hookLocale) as Locale;
  const t = useTranslations('shared');
  const tNav = useTranslations('shared.nav');
  const pathname = usePathname();
  const router = useRouter();

  const isHome = pathname === '/' || pathname === '';
  const homePath = getPathname({ href: '/', locale: currentLocale });
  const navLabel = labels?.nav ?? tNav('label');
  const openMenuLabel = labels?.openMenu ?? t('menu.open');
  const closeMenuLabel = labels?.closeMenu ?? t('menu.close');
  const themeToggleLabel =
    labels?.themeToggle ?? t('theme.toggle');
  const langEnLabel =
    labels?.langEn ?? t('langSwitch.en');
  const langEsLabel =
    labels?.langEs ?? t('langSwitch.es');
  const sections =
    providedSections ??
    buildSectionDestinations({
      about: tNav('about'),
      work: tNav('experience'),
      stack: tNav('stack'),
      contact: tNav('contact'),
    });

  const sectionItems = sections.map((section) => ({
    href: isHome ? `#${section.id}` : `${homePath}#${section.id}`,
    label: section.label,
  }));

  const headerRef = useRef<HTMLElement>(null);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const previousScrollYRef = useRef(0);
  const focusCountRef = useRef(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [visibility, setVisibility] = useState<'visible' | 'hidden'>('visible');

  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const supportsScrollTimeline =
    typeof CSS !== 'undefined' && CSS.supports('animation-timeline: view()');

  const currentScrollY = (): number => {
    if (typeof window === 'undefined') {
      return 0;
    }
    return window.scrollY;
  };

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => setReducedMotion(media.matches);
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  const recomputeVisibility = useCallback(
    (nextMenuOpen: boolean, nextFocusWithin: boolean, scrollY: number, previousScrollY: number) => {
      setVisibility((current) =>
        resolveNavbarVisibility({
          scrollY,
          previousScrollY,
          currentVisibility: current,
          menuOpen: nextMenuOpen,
          focusWithin: nextFocusWithin,
          reducedMotion,
          supportsScrollTimeline,
        })
      );
    },
    [reducedMotion, supportsScrollTimeline],
  );

  const onScroll = useCallback(() => {
    const nextScrollY = currentScrollY();
    const previousScrollY = previousScrollYRef.current;
    recomputeVisibility(menuOpen, focusCountRef.current > 0, nextScrollY, previousScrollY);
    previousScrollYRef.current = nextScrollY;
  }, [recomputeVisibility, menuOpen]);

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) {
      return undefined;
    }
    const onFocusIn = () => {
      focusCountRef.current += 1;
      setVisibility('visible');
    };
    const onFocusOut = () => {
      focusCountRef.current = Math.max(0, focusCountRef.current - 1);
      if (focusCountRef.current === 0) {
        recomputeVisibility(
          menuOpen,
          false,
          currentScrollY(),
          previousScrollYRef.current,
        );
      }
    };
    header.addEventListener('focusin', onFocusIn);
    header.addEventListener('focusout', onFocusOut);
    return () => {
      header.removeEventListener('focusin', onFocusIn);
      header.removeEventListener('focusout', onFocusOut);
    };
  }, [recomputeVisibility, menuOpen]);

  const handleIdentityClick = useCallback(() => {
    if (isHome) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search,
      );
    } else {
      router.replace('/', { locale: currentLocale });
    }
  }, [isHome, router, currentLocale]);

  const handleToggle = useCallback(() => {
    setMenuOpen((prev) => {
      const next = !prev;
      if (detailsRef.current) {
        detailsRef.current.open = next;
      }
      if (next) {
        setVisibility('visible');
      } else {
        recomputeVisibility(
          false,
          focusCountRef.current > 0,
          currentScrollY(),
          previousScrollYRef.current,
        );
      }
      return next;
    });
  }, [recomputeVisibility]);

  const handleNavigate = useCallback(() => {
    if (detailsRef.current) {
      detailsRef.current.open = false;
      setMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)');
    const handleChange = () => {
      if (media.matches && detailsRef.current) {
        detailsRef.current.open = false;
        setMenuOpen(false);
      }
    };
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  return (
    <header
      ref={headerRef}
      className={styles.navbar}
      data-hidden={visibility === 'hidden' ? '' : undefined}
    >
      <Logo
        href={homePath}
        alt={site.name}
        onClick={handleIdentityClick}
      >
        {site.name}
      </Logo>

      <NavLinks
        items={sectionItems}
        ariaLabel={labels?.nav ?? navLabel}
        onNavigate={handleNavigate}
      />

      <details ref={detailsRef} className={styles.mobileMenu}>
        <summary className={styles.summary}>
          <button
            type="button"
            aria-label={menuOpen ? closeMenuLabel : openMenuLabel}
            aria-expanded={menuOpen}
            onClick={handleToggle}
            className={styles.summaryButton}
          >
            <span className={styles.menuIcon} aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                style={{ color: 'currentColor' }}
              >
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </span>
          </button>
        </summary>
        <div className={styles.panel}>
          <NavLinks
            items={sectionItems}
            ariaLabel={labels?.nav ?? navLabel}
            onNavigate={handleNavigate}
          />
        </div>
      </details>

      <ThemeControl label={themeToggleLabel} />
      <LanguageSwitch
        locale={currentLocale}
        ariaLabelEn={langEnLabel}
        ariaLabelEs={langEsLabel}
      />
    </header>
  );
}
