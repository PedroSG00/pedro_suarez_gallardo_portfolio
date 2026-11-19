'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';

type Props = {
  href: string;
  src?: string;
  alt?: string;
  children?: ReactNode;
};

export default function Logo({ href, src, alt, children }: Props) {
  if (!href) {
    return null;
  }

  if (!src && !alt && !children) {
    return null;
  }

  let content: ReactNode;
  if (src) {
    content = <Image src={src} alt={alt ?? ''} width={64} height={64} />;
  } else if (children) {
    content = children;
  } else {
    content = (
      <svg viewBox="0 0 64 64" role="img" aria-label={alt ?? undefined}>
        <use data-testid="logo-symbol" href="#d" fill="currentColor" />
      </svg>
    );
  }

  return <a href={href}>{content}</a>;
}
