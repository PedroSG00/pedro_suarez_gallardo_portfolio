import Link from 'next/link';

type Props = {
  locale: string;
};

export default function LanguageSwitch({ locale }: Props) {
  const other = locale === 'en' ? 'es' : 'en';
  return (
    <Link href={`/${other}`}>{other.toUpperCase()}</Link>
  );
}
