/**
 * app/[locale]/layout.tsx — T14 (RF-1, RF-4, RF-6)
 * Root layout per language: <html lang={locale}>, generateStaticParams (SSG per
 * locale), inline synchronous theme bootstrap script in <head>, and layout
 * providers (ThemeProvider + LocaleProvider) without visible controls.
 * Visible controls (LanguageSelector, ThemeSelect) live in (site)/layout.
 */

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import { getDictionary } from '../i18n/translation/get-dictionary';
import LayoutProvider from './layout-provider';
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
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){
            try{
              var t=localStorage.getItem('theme');
              if(t==='light'||t==='dark'||t==='system'){
                document.documentElement.classList.remove('theme-light','theme-dark','theme-system');
                document.documentElement.classList.add('theme-'+t);
              }
            }catch(e){}
          })();`}
        </Script>
      </head>
      <body className="min-h-full flex flex-col">
        <LayoutProvider locale={locale} dictionary={dictionary}>
          <div className="layout-wide flex flex-1 flex-col">{children}</div>
        </LayoutProvider>
      </body>
    </html>
  );
}
