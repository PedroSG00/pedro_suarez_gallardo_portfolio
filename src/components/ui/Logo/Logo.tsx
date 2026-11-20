'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';

type Props = {
  href: string;
  src?: string;
  alt?: string;
  children?: ReactNode;
  onClick?: () => void;
};

export default function Logo({ href, src, alt, children, onClick }: Props) {
  if (!href) {
    return null;
  }

  if (!src && !alt && !children) {
    return null;
  }

  return (
    <a href={href} onClick={onClick}>
      {src ? (
        <Image src={src} alt={alt ?? ''} width={64} height={64} />
      ) : children ? (
        children
      ) : (
        <svg viewBox="0 0 64 64" role="img" aria-label={alt ?? undefined}>
          <use data-testid="logo-symbol" href="#d" fill="currentColor" />
        </svg>
      )}
    </a>
  );
}
