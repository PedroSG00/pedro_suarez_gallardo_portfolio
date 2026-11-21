'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { getPathname, usePathname } from '@/i18n/navigation';

import Logo from '@/components/ui/Logo/Logo';
import NavLinks from '@/components/ui/NavLinks/NavLinks';
import ThemeControl from '@/components/ui/ThemeControl/ThemeControl';
import LanguageSwitch from '@/components/ui/LanguageSwitch/LanguageSwitch';
import { resolveNavbarVisibility } from '@/lib/nav-visibility';
import type { Locale } from '@/lib/locale';
import type { SiteData } from '@/content/site';
import { buildSectionDestinations, type SectionDestination } from '@/content/sections';

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

// The localized layout remounts the navbar, but the document survives the switch.
let lastMountedLocale: Locale | undefined;

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

  const homePath = getPathname({ href: '/', locale: currentLocale });
  const isHome = pathname === '/' || pathname === '' || pathname === homePath;
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
  const keyboardFocusRef = useRef(false);
  const lastInteractionWasKeyboardRef = useRef(false);
  const userScrollIntentRef = useRef(false);
  const clearUserScrollIntentFrameRef = useRef<number | null>(null);
  const navigationInProgressRef = useRef(false);
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
    const hasUserScrollIntent = userScrollIntentRef.current;
    if (hasUserScrollIntent) {
      userScrollIntentRef.current = false;
      if (clearUserScrollIntentFrameRef.current !== null) {
        window.cancelAnimationFrame(clearUserScrollIntentFrameRef.current);
        clearUserScrollIntentFrameRef.current = null;
      }
    }
    if (navigationInProgressRef.current && !hasUserScrollIntent) {
      setVisibility('visible');
      previousScrollYRef.current = nextScrollY;
      return;
    }
    if (!hasUserScrollIntent) {
      recomputeVisibility(
        menuOpen,
        focusCountRef.current > 0 && keyboardFocusRef.current,
        nextScrollY,
        nextScrollY,
      );
      previousScrollYRef.current = nextScrollY;
      return;
    }
    navigationInProgressRef.current = false;
    recomputeVisibility(
      menuOpen,
      focusCountRef.current > 0 && keyboardFocusRef.current,
      nextScrollY,
      previousScrollY,
    );
    previousScrollYRef.current = nextScrollY;
  }, [recomputeVisibility, menuOpen]);

  useLayoutEffect(() => {
    if (lastMountedLocale !== undefined && lastMountedLocale !== currentLocale) {
      navigationInProgressRef.current = true;
    }
    lastMountedLocale = currentLocale;
  }, [currentLocale]);

  useEffect(() => {
    previousScrollYRef.current = currentScrollY();
    const finishNavigation = () => {
      navigationInProgressRef.current = false;
      previousScrollYRef.current = currentScrollY();
    };
    const markUserScrollIntent = () => {
      navigationInProgressRef.current = false;
      userScrollIntentRef.current = true;
      if (clearUserScrollIntentFrameRef.current !== null) {
        window.cancelAnimationFrame(clearUserScrollIntentFrameRef.current);
      }
      clearUserScrollIntentFrameRef.current = window.requestAnimationFrame(() => {
        userScrollIntentRef.current = false;
        clearUserScrollIntentFrameRef.current = null;
      });
    };
    const isInsideMenuPanel = (target: EventTarget | null) =>
      target instanceof Element && target.closest('[data-menu-panel]') !== null;
    const handlePointerDown = () => {
      lastInteractionWasKeyboardRef.current = false;
      keyboardFocusRef.current = false;
    };
    const handleWheel = (event: WheelEvent) => {
      if (isInsideMenuPanel(event.target)) {
        return;
      }
      lastInteractionWasKeyboardRef.current = false;
      keyboardFocusRef.current = false;
      markUserScrollIntent();
    };
    const handleScrollKey = (event: KeyboardEvent) => {
      lastInteractionWasKeyboardRef.current = true;
      if (
        !event.defaultPrevented &&
        !isInsideMenuPanel(event.target) &&
        ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)
      ) {
        markUserScrollIntent();
      }
    };
    const handleTouchMove = (event: TouchEvent) => {
      if (isInsideMenuPanel(event.target)) {
        return;
      }
      lastInteractionWasKeyboardRef.current = false;
      keyboardFocusRef.current = false;
      markUserScrollIntent();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scrollend', finishNavigation);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('keydown', handleScrollKey);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scrollend', finishNavigation);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleScrollKey);
      if (clearUserScrollIntentFrameRef.current !== null) {
        window.cancelAnimationFrame(clearUserScrollIntentFrameRef.current);
        clearUserScrollIntentFrameRef.current = null;
      }
    };
  }, [onScroll]);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) {
      return undefined;
    }
    const onFocusIn = () => {
      focusCountRef.current += 1;
      keyboardFocusRef.current = lastInteractionWasKeyboardRef.current;
      setVisibility('visible');
    };
    const onFocusOut = () => {
      focusCountRef.current = Math.max(0, focusCountRef.current - 1);
      if (navigationInProgressRef.current) {
        setVisibility('visible');
        return;
      }
      if (focusCountRef.current === 0) {
        keyboardFocusRef.current = false;
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

  const handleNavigate = useCallback(() => {
    navigationInProgressRef.current = true;
    setVisibility('visible');
    if (detailsRef.current) {
      detailsRef.current.open = false;
      setMenuOpen(false);
    }
  }, []);

  function handleIdentityClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!isHome || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    handleNavigate();
    window.scrollTo({ top: 0, behavior: 'auto' });
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }

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
      className="sticky top-0 z-(--nav-z) border-b-(length:--line-width) border-line bg-surface text-ink transition-transform duration-(--duration-state) data-hidden:-translate-y-full motion-reduce:transition-none print:hidden"
      data-hidden={visibility === 'hidden' ? '' : undefined}
    >
      <div className="mx-auto flex min-h-(--nav-height) max-w-[calc(var(--grid-max-width)+2*var(--grid-gutter))] items-center gap-1 px-3 md:gap-3 md:px-(--grid-gutter)">
        <div className="mr-auto flex min-w-0 items-center">
          <Logo href={homePath} src="/logo.svg" alt={site.name} onClick={handleIdentityClick} />
        </div>

        <nav aria-label={navLabel} className="hidden flex-1 md:block">
          <NavLinks
            items={sectionItems}
            ariaLabel={navLabel}
            onNavigate={handleNavigate}
            inline
          />
        </nav>

        <div className="flex shrink-0 items-center gap-1 md:gap-2">
          <ThemeControl label={themeToggleLabel} />
          <LanguageSwitch
            locale={currentLocale}
            ariaLabelEn={langEnLabel}
            ariaLabelEs={langEsLabel}
          />
        </div>

        <details
          ref={detailsRef}
          className="group shrink-0 md:hidden"
          data-navbar-menu
          onToggle={(event) => {
            const open = event.currentTarget.open;
            setMenuOpen(open);
            if (open) setVisibility('visible');
          }}
        >
          <summary
            role="button"
            aria-label={menuOpen ? closeMenuLabel : openMenuLabel}
            className="grid size-11 cursor-pointer list-none place-items-center border-(length:--line-width) border-line hover:bg-ink hover:text-surface [&::-webkit-details-marker]:hidden"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="size-5">
              <path className="group-open:hidden" d="M3 7h18M3 12h18M3 17h18" />
              <path className="hidden group-open:block" d="m5 5 14 14M19 5 5 19" />
            </svg>
          </summary>
          <nav data-menu-panel aria-label={navLabel} className="absolute inset-x-0 top-full max-h-[calc(100dvh-var(--nav-height))] overflow-y-auto overscroll-contain border-b-(length:--line-width) border-line bg-surface px-(--grid-gutter) py-3">
            <NavLinks items={sectionItems} ariaLabel={navLabel} onNavigate={handleNavigate} />
          </nav>
        </details>
      </div>
    </header>
  );
}
