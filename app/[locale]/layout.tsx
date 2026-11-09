/**
 * app/[locale]/layout.tsx — T20 (RF8, RNF4, RNF5)
 * Per-language layout: <html lang={locale}>, generateStaticParams (SSG per
 * locale), and LocaleProvider wrapping children with the server-resolved
 * merged dictionary.
 */

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { getDictionary } from '../i18n/get-dictionary';
import LocaleProvider from '../i18n/locale-provider';
import LanguageSelector from '../components/LanguageSelector/LanguageSelector';
import '../globals.css';
import { Locale } from '../i18n/config';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const generateStaticParams = () => {
  return [{ locale: 'en' }, { locale: 'es' }];
};

export const dynamicParams = false;

export const metadata: Metadata = {
  title: 'Pedro Suárez Gallardo — Web Developer',
  description: 'Portfolio and résumé of Pedro Suárez Gallardo, web developer.',
};

export default async function RootLayout({
  params,
  children,
}: {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
}) {
  const { locale } = (await params) as { locale: Locale };
  const dictionary = getDictionary(locale);

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} theme-system h-full antialiased`}
    >
      <head />
      <body>
        <LocaleProvider locale={locale} dictionary={dictionary}>
          {children}
          <LanguageSelector />
        </LocaleProvider>
      </body>
    </html>
  );
}
