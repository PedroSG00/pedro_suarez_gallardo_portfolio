'use client';

import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import LanguageSwitch from './LanguageSwitch';
import type { Locale } from '@/lib/locale';

type Props = {
  currentLang: Locale;
  ariaLabel: string;
};

export default function LanguageSwitchClient({
  currentLang,
  ariaLabel,
}: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const onChange = (nextLang: string) => {
    const url = new URL(`http://localhost${pathname}`);
    searchParams.forEach((value, key) => url.searchParams.set(key, value));
    url.pathname = url.pathname.replace(/\/(en|es)\//, `/${nextLang}/`);
    router.push(url.pathname + url.search);
  };

  return (
    <LanguageSwitch
      onChange={onChange}
      currentLang={currentLang}
      ariaLabel={ariaLabel}
    />
  );
}
