'use client';

import { usePathname } from 'next/navigation';
import enMessages from '../../../messages/en.json';
import esMessages from '../../../messages/es.json';

export default function NotFound() {
  const pathname = usePathname();
  const locale = (pathname.split('/')[1] ?? 'en') as 'en' | 'es';
  const messages = locale === 'es' ? esMessages : enMessages;
  return (
    <main>
      <h1>{messages.shared.notFound.title}</h1>
      <p>{messages.shared.notFound.message}</p>
    </main>
  );
}
