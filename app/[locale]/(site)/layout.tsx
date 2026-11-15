/**
 * app/[locale]/(site)/layout.tsx — T15 (RF-4, RF-6, RF-1)
 * Layout for real pages only: mounts visible controls (LanguageSelector +
 * ThemeSelect) with texts resolved on the server from the dictionary. The 404
 * screen does not inherit this layout.
 */

import { ReactNode } from 'react';
import LanguageSelector from '../../components/LanguageSelector/LanguageSelector';
import ThemeSelect from '../../components/ThemeSelect/ThemeSelect';
import { getDictionary } from '../../i18n/translation/get-dictionary';
import { createT } from '../../i18n/translation/translate';
import { type Locale } from '../../i18n/config';

interface SiteLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function SiteLayout({ children, params }: SiteLayoutProps) {
  const { locale } = (await params) as { locale: Locale };
  const t = createT(getDictionary(locale));

  return (
    <div className="flex flex-col min-h-0">
      <div className="flex items-center justify-between py-4 px-4">
        <LanguageSelector
          locale={locale}
          labels={{ en: t('languages.en'), es: t('languages.es') }}
        />
        <ThemeSelect
          labels={{
            label: t('themeSelect.label'),
            light: t('themeSelect.option.light'),
            dark: t('themeSelect.option.dark'),
            system: t('themeSelect.option.system'),
          }}
        />
      </div>
      <main className="flex-1">{children}</main>
    </div>
  );
}
