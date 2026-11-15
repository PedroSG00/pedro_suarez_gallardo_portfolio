'use client';

import { useLocale } from '../../../i18n/provider/use-locale';

interface BrandProps {
  /** Full name shown as the brand, received from the parent (no hardcoded text). */
  name: string;
}

/**
 * Brand — T8 (RF-1)
 * Site brand: a link to the home of the active language showing the full
 * name received by props. No visible text is written in the component; the
 * visible label comes only from the `name` prop.
 */
export function Brand({ name }: BrandProps) {
  const { locale } = useLocale();
  return <a href={`/${locale}`}>{name}</a>;
}
