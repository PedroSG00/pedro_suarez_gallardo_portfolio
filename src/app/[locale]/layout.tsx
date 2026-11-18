import { setRequestLocale } from 'next-intl/server';
import { Metadata } from 'next';
import LanguageSwitch from '@/components/ui/LanguageSwitch/LanguageSwitch';

export const metadata: Metadata = {
  title: 'Portfolio',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <html lang={locale}>
      <body>
        <nav>
          <LanguageSwitch locale={locale} />
        </nav>
        {children}
      </body>
    </html>
  );
}
