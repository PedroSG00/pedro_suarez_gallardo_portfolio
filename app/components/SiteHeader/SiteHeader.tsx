/**
 * SiteHeader.tsx — T14 (RF-1, RF-8)
 * Header composition: brand → navigation → language → theme, wrapped in a
 * banner landmark. No visible text is written here: every label arrives by
 * props from the parent (Constitution 3 / RF-8).
 *
 * Uses a single DOM for navigation: NavDisclosure groups PrimaryNav inside a
 * <details>/<summary> that CSS forces open at >=1024 px (plan §5), so there is
 * no duplicated tree between wide and narrow (RF-2, RF-8).
 */

'use client';

import { Brand } from './brand/Brand';
import { NavDisclosure } from './nav/NavDisclosure';
import { LanguageMenu } from './language/LanguageMenu';
import { ThemeToggle } from './theme/ThemeToggle';
import type { DestinationId } from '../../navigation/destinations';
import type { Locale } from '../../i18n/config';
import type { ThemeValue } from '../../theme/theme';

interface SiteHeaderProps {
  /** Full brand name, shown linked to the home of the active language. */
  brandName: string;
  /** Accessible name of the navigation landmark. */
  navLabel: string;
  /** Visible label of each destination in the active language. */
  labels: Record<DestinationId, string>;
  /** Active locale. */
  locale: Locale;
  /** Current pathname (e.g. `/projects` or `/projects/<slug>`). */
  pathname: string;
  /** Non-chromatic mark shown on the active destination / language. */
  activeMark: string;
  /** Visible label of the navigation summary / menu trigger. */
  menuLabel: string;
  /** languageMenu block from the dictionary. */
  languageLabels: { label: string; aria: Record<Locale, string> };
  /** Endonym name of each language, from the dictionary. */
  languages: Record<Locale, string>;
  /** Visible name of the active language (endonym). */
  triggerLabel: string;
  /** Current theme value (read from the document by the parent). */
  theme: ThemeValue;
  /** Visible text for each theme option, from the dictionary. */
  stateLabels: Record<ThemeValue, string>;
  /** Full-sentence accessible name for each theme option, from the dictionary. */
  ariaLabels: Record<ThemeValue, string>;
  /** Accessible name of the banner landmark. */
  headerLabel: string;
}

export default function SiteHeader({
  brandName,
  navLabel,
  labels,
  locale,
  pathname,
  activeMark,
  menuLabel,
  languageLabels,
  languages,
  triggerLabel,
  theme,
  stateLabels,
  ariaLabels,
  headerLabel,
}: SiteHeaderProps) {
  return (
    <header role="banner" aria-label={headerLabel} data-testid="site-header">
      <Brand name={brandName} />
      <NavDisclosure
        navLabel={navLabel}
        labels={labels}
        locale={locale}
        pathname={pathname}
        menuLabel={menuLabel}
      />
      <LanguageMenu
        locale={locale}
        pathname={pathname}
        triggerLabel={triggerLabel}
        activeMark={activeMark}
        labels={languageLabels}
        languages={languages}
      />
      <ThemeToggle
        theme={theme}
        stateLabels={stateLabels}
        ariaLabels={ariaLabels}
      />
    </header>
  );
}
