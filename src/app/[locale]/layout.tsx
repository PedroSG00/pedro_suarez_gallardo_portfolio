import { Metadata } from 'next';
import { Suspense } from 'react';
import { locale } from 'next/root-params';
import LanguageSwitch from '@/components/ui/LanguageSwitch/LanguageSwitch';
import type { Locale } from '@/lib/locale';
import { themeScript } from '@/lib/theme-script';
import { THEME_STORAGE_KEY } from '@/lib/theme';
import '@/styles/globals.css';
import { Geist_Mono } from 'next/font/google';

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Portfolio',
};

export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'es' }];
}

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = await locale();
  return (
    <html lang={lang} suppressHydrationWarning className={`${geistMono.variable} h-full antialiased`}>
      <head>
        {/* El script se envuelve y se auto-invoca con los globales reales;
            en los tests se ejecuta con new Function y deps inyectadas (T9). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(${themeScript(THEME_STORAGE_KEY)})(window,document,localStorage)`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <nav>
          <Suspense fallback={null}>
            <LanguageSwitch
              locale={lang as Locale}
              ariaLabelEn="Switch to English"
              ariaLabelEs="Cambiar a español"
            />
          </Suspense>
        </nav>
        {children}
      </body>
    </html>
  );
}
