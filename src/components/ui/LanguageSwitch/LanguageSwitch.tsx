'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { buildLocalizedHref } from '@/lib/build-localized-href';
import type { Locale } from '@/lib/locale';

type Props = {
  locale: Locale;
};

export default function LanguageSwitch({ locale }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hash = typeof window === 'undefined' ? '' : window.location.hash;
  const other = locale === 'en' ? 'es' : 'en';

  const url = new URL(`http://localhost${pathname}`);
  searchParams.forEach((value, key) => url.searchParams.set(key, value));
  url.hash = hash;
  const href = buildLocalizedHref(url, other);

  return (
    <Link href={href}>{other.toUpperCase()}</Link>
  );
}
