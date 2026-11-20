'use client';

import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('shared.notFound');

  return (
    <>
      {t.has('title') && <h1>{t('title')}</h1>}
      {t.has('message') && <p>{t('message')}</p>}
    </>
  );
}
