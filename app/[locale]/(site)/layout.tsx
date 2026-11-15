/**
 * app/[locale]/(site)/layout.tsx — T15 (RF-1, RF-6, RF-7, RNF-10)
 * Layout for real pages only: mounts <SiteHeader> with texts resolved on the
 * server from the dictionary. The 404 screen does not inherit this layout
 * (the (site) group excludes not-found).
 */

import SiteHeader from '../../components/SiteHeader/SiteHeader';
import { getDictionary } from '../../i18n/translation/get-dictionary';
import { Locale } from '../../i18n/config';
import type { DestinationId } from '../../navigation/destinations';
import type { ThemeValue } from '../../theme/constants';
import type enDictionary from '../../i18n/dictionaries/en.json';
import { ReactNode } from 'react';

type Dictionary = typeof enDictionary;

interface SiteLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function SiteLayout({ children, params }: SiteLayoutProps) {
  const { locale } = (await params) as { locale: Locale };
  const dictionary = getDictionary(locale) as Dictionary;

  return (
    <div className="flex flex-col min-h-0">
      <SiteHeader
        brandName="Pedro Suárez Gallardo"
        navLabel={dictionary.nav.label as string}
        labels={dictionary.nav as Record<DestinationId, string>}
        locale={locale}
        pathname="/"
        activeMark="▪"
        menuLabel={dictionary.nav.menu as string}
        languageLabels={dictionary.languageMenu as { label: string; aria: Record<Locale, string> }}
        languages={dictionary.languages as Record<Locale, string>}
        triggerLabel={(dictionary.languages as Record<Locale, string>)[locale]}
        stateLabels={(dictionary.themeToggle as Record<string, unknown>).state as Record<ThemeValue, string>}
        ariaLabels={(dictionary.themeToggle as Record<string, unknown>).aria as Record<ThemeValue, string>}
        headerLabel={dictionary.header.label as string}
      />
      <main className="flex-1">{children}</main>
    </div>
  );
}
