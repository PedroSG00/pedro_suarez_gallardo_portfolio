import { hasLocale } from 'next-intl';
import { locale as rootLocale } from 'next/root-params';
import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

import { routing } from '@/i18n/routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;
  const candidate = requestedLocale ?? (await rootLocale());

  if (!hasLocale(routing.locales, candidate)) {
    notFound();
  }

  return {
    locale: candidate,
    messages: (await import(`../../messages/${candidate}.json`)).default,
  };
});
