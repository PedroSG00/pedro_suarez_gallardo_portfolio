import { Metadata } from 'next';
import { locale } from 'next/root-params';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { themeScript } from '@/lib/theme-script';
import { THEME_STORAGE_KEY } from '@/lib/theme';
import '@/styles/globals.css';
import { Geist_Mono } from 'next/font/google';
import SkipLink from '@/components/ui/SkipLink/SkipLink';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import AnchorFocus from '@/components/ui/AnchorFocus/AnchorFocus';
import { SITE } from '@/content/site';
import { routing } from '@/i18n/routing';

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('hero');
  return { title: `${t('name')} — ${t('role')}` };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = await locale();
  if (!hasLocale(routing.locales, lang)) {
    notFound();
  }
  setRequestLocale(lang);
  const messages = await getMessages();

  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={`${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(${themeScript(THEME_STORAGE_KEY)})(window,document,localStorage)`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider locale={lang} messages={messages}>
          <SkipLink />
          <Navbar site={SITE} />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <AnchorFocus sectionIds={['about', 'work', 'stack', 'contact']} />
          <Footer site={SITE} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
