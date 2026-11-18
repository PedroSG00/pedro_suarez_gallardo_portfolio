import { Metadata } from 'next';
import LanguageSwitch from '@/components/ui/LanguageSwitch/LanguageSwitch';
import type { Locale } from '@/lib/locale';

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
  return (
    <html lang={locale}>
      <body>
        <nav>
          <LanguageSwitch locale={locale as Locale} />
        </nav>
        {children}
      </body>
    </html>
  );
}
