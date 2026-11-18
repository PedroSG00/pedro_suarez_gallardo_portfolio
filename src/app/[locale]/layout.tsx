import { Metadata } from 'next';
import { Suspense } from 'react';
import { locale } from 'next/root-params';
import LanguageSwitch from '@/components/ui/LanguageSwitch/LanguageSwitch';
import type { Locale } from '@/lib/locale';
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
      <body className="min-h-full flex flex-col">
        <nav>
          <Suspense fallback={null}>
            <LanguageSwitch locale={lang as Locale} />
          </Suspense>
        </nav>
        {children}
      </body>
    </html>
  );
}
