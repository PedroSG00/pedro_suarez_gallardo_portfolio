/**
 * app/[locale]/layout-provider.tsx — T14 (RF-1, RF-4, RF-6)
 * Client component wrapper that mounts ThemeProvider (no visible controls)
 * and LocaleProvider with the server-resolved locale and dictionary.
 */

'use client';

import { ReactNode } from 'react';
import ThemeProvider from '../components/ThemeProvider/ThemeProvider';
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
    <>
      <ThemeProvider />
      <LocaleProvider locale={locale} dictionary={dictionary}>
        {children}
      </LocaleProvider>
    </>
  );
}
