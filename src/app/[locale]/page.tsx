import { setRequestLocale } from 'next-intl/server';
import enMessages from '../../../messages/en.json';
import esMessages from '../../../messages/es.json';

export default async function LocalePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = locale === 'es' ? esMessages : enMessages;
  return (
    <main>
      <h1>{messages.hero.title}</h1>
      <p>{messages.hero.subtitle}</p>
    </main>
  );
}
