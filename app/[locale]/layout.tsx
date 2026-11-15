/**
 * app/[locale]/layout.tsx — T14 (RF-1, RF-4, RF-6)
 * Locale segment layout: generateStaticParams (SSG per locale), dynamicParams
 * false (invalid locales → 404) and the locale provider with the dictionary.
 * The document (<html>, fonts, theme bootstrap) lives in the root layout.
 * Visible controls (LanguageSelector, ThemeSelect) live in (site)/layout.
 */

import type { Metadata } from 'next';
import { getDictionary } from '../i18n/translation/get-dictionary';
import LayoutProvider from './layout-provider';
import { Locale } from '../i18n/config';

export const generateStaticParams = () => {
  return [{ locale: 'en' }, { locale: 'es' }];
};

export const dynamicParams = false;

export const metadata: Metadata = {
  title: 'Pedro Suárez Gallardo — Web Developer',
  description: 'Portfolio and résumé of Pedro Suárez Gallardo, web developer.',
};

export default async function LocaleLayout({
  params,
  children,
}: {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
}) {
  const { locale } = (await params) as { locale: Locale };
  const dictionary = getDictionary(locale);

  return (
    <LayoutProvider locale={locale} dictionary={dictionary}>
      <div className="layout-wide flex flex-1 flex-col">{children}</div>
    </LayoutProvider>
  );
}
