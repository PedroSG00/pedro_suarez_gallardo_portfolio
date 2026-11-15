/**
 * app/[locale]/layout-provider.tsx — T14 (RF-1, RF-4)
 * Client component wrapper that mounts LocaleProvider with the server-resolved
 * locale and dictionary. ThemeProvider is global and lives in the root layout.
 */

'use client';

import { ReactNode } from 'react';
import LocaleProvider from '../i18n/provider/locale-provider';
import { Locale } from '../i18n/config';

interface LayoutProviderProps {
  locale: Locale;
  dictionary: Record<string, unknown>;
  children: ReactNode;
}

export default function LayoutProvider({
  locale,
  dictionary,
  children,
}: LayoutProviderProps) {
  return (
    <LocaleProvider locale={locale} dictionary={dictionary}>
      {children}
    </LocaleProvider>
  );
}
