import enMessages from '../../../messages/en.json';
import esMessages from '../../../messages/es.json';

export default async function NotFound({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = locale === 'es' ? esMessages : enMessages;
  return (
    <main>
      <h1>{messages.shared.notFound.title}</h1>
      <p>{messages.shared.notFound.message}</p>
    </main>
  );
}
