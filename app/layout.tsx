/**
 * app/layout.tsx — T14 (RF-1, RF-4, RF-6, RF-7)
 * Single stable root layout. It owns the <html> document, the fonts, the
 * global styles and the inline theme bootstrap, so both real pages and the
 * root not-found screen render inside it (which is what makes the 404 a full,
 * JavaScript-independent HTML document).
 *
 * The active locale is forwarded by the proxy in the `x-locale` request header
 * (the URL prefix when valid, the resolved locale otherwise).
 */

import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import { headers } from 'next/headers';
import { defaultLocale, type Locale } from './i18n/config';
import { THEME_BOOT_SCRIPT } from './theme/boot-script';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

function isLocale(value: string | null | undefined): value is Locale {
  return value === 'en' || value === 'es';
}

async function resolveLocale(): Promise<Locale> {
  try {
    const headerList = await headers();
    const fromProxy = headerList.get('x-locale');
    if (isLocale(fromProxy)) return fromProxy;
  } catch {
    // No request scope (unit tests).
  }
  return defaultLocale;
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await resolveLocale();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
