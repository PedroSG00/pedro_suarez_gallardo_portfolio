import { Metadata } from 'next';
import { locale } from 'next/root-params';
import type { Locale } from '@/lib/locale';
import { themeScript } from '@/lib/theme-script';
import { THEME_STORAGE_KEY } from '@/lib/theme';
import '@/styles/globals.css';
import { Geist_Mono } from 'next/font/google';
import SkipLink from '@/components/ui/SkipLink/SkipLink';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import AnchorFocus from '@/components/ui/AnchorFocus/AnchorFocus';
import { SITE } from '@/content/site';
import { buildSectionDestinations } from '@/content/sections';
import enMessages from '../../../messages/en.json';
import esMessages from '../../../messages/es.json';

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
  const lang = (await locale()) as Locale;
  const messages = lang === 'es' ? esMessages : enMessages;

  const sections = buildSectionDestinations({
    about: messages.shared.nav.about,
    work: messages.shared.nav.experience,
    stack: messages.shared.nav.stack,
    contact: messages.shared.nav.contact,
  });

  const navbarLabels = {
    nav: messages.shared.nav.label,
    openMenu: messages.shared.menu.open,
    closeMenu: messages.shared.menu.close,
    themeToggle: messages.shared.theme.toggle,
    langEn: messages.shared.langSwitch.en,
    langEs: messages.shared.langSwitch.es,
  };

  const footerLabels = {
    copyright: messages.footer.copyright,
    github: messages.contact.github,
    linkedin: messages.contact.linkedin,
    email: messages.contact.email,
    cv: messages.contact.cv,
    newTab: messages.shared.newTab,
  };

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
        <SkipLink label={messages.shared.skipToContent} />
        <Navbar locale={lang} site={SITE} sections={sections} labels={navbarLabels} />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <AnchorFocus sectionIds={['about', 'work', 'stack', 'contact']} />
        <Footer locale={lang} site={SITE} labels={footerLabels} />
      </body>
    </html>
  );
}
