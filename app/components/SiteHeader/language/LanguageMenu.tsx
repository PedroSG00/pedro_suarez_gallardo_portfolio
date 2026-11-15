/**
 * LanguageMenu.tsx — T13 (RF-7, RF-8, RNF-7)
 * Native language switcher: two <a hreflang> links to the equivalent route in
 * each language, grouped in a <details>/<summary>. JavaScript only adds
 * closing behavior (Escape, click outside, selection) through use-disclosure;
 * it never opens, never traps focus, never moves focus, and does not change
 * the language on open or close.
 *
 * All visible text comes from props (Constitution 3 / RF-8): the parent
 * resolves labels, language names and the active mark from the dictionary.
 */

'use client';

import { useDisclosure } from '../hooks/use-disclosure';
import { useLocale } from '../../../i18n/provider/use-locale';
import { locales } from '../../../i18n/config';
import type { Locale } from '../../../i18n/config';

interface LanguageMenuProps {
  /** Active locale. */
  locale: Locale;
  /** Current pathname, used to build the equivalent route in each language. */
  pathname: string;
  /** Visible name of the active language (endonym, from the dictionary). */
  triggerLabel: string;
  /** Non-chromatic mark shown on the active language link. */
  activeMark: string;
  /** languageMenu block from the dictionary. */
  labels: { label: string; aria: Record<Locale, string> };
  /** Endonym name of each language, from the dictionary. */
  languages: Record<Locale, string>;
}

/** Builds the equivalent route under another locale prefix. */
function equivalentPath(pathname: string, from: Locale, to: Locale): string {
  const segments = pathname.split('/');
  if (segments[1] === from) segments[1] = to;
  return segments.join('/');
}

export function LanguageMenu({
  locale,
  pathname,
  triggerLabel,
  activeMark,
  labels,
  languages,
}: LanguageMenuProps) {
  const { open, openIt, close, containerRef } = useDisclosure();
  const { setLocale } = useLocale();

  return (
    <details
      ref={containerRef}
      data-testid="language-menu"
      open={open}
      aria-label={labels.aria[locale]}
    >
      <summary data-testid="language-trigger" onClick={openIt}>
        {triggerLabel}
      </summary>
      <div onClick={close}>
        {locales.map((lang) => {
          const active = lang === locale;
          return (
            <a
              key={lang}
              href={equivalentPath(pathname, locale, lang)}
              hrefLang={lang}
              aria-current={active ? 'true' : undefined}
              onClick={() => setLocale(lang)}
            >
              {active ? (
                <span aria-hidden="true" data-testid="active-mark">
                  {activeMark}
                </span>
              ) : null}
              {languages[lang]}
            </a>
          );
        })}
      </div>
    </details>
  );
}
