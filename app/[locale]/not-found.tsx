/**
 * app/[locale]/not-found.tsx — T17 (RF-7, RF-9, RNF-3)
 * Bilingual 404 screen: no header, no controls, exit links only.
 * Declared noindex, no canonical, no language alternatives.
 * Minimal layout: theme provider only (inherited from [locale]/layout).
 */

import { getDictionary } from '../i18n/translation/get-dictionary';
import { Locale } from '../i18n/config';
import { createT } from '../i18n/translation/translate';

export const metadata = {
  noindex: true,
};

export default async function NotFound({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const t = createT(getDictionary(locale));
  const otherLocale = locale === 'en' ? 'es' : 'en';

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-display">{t('common.notFound')}</h1>
      <p className="text-body mt-4">
        <a href={`/${locale}`} className="underline">
          {t('common.back')}
        </a>
      </p>
      <p className="text-body mt-2">
        <a href={`/${otherLocale}`} className="underline" lang={otherLocale}>
          {t(`languages.${otherLocale}`)}
        </a>
      </p>
    </div>
  );
}
