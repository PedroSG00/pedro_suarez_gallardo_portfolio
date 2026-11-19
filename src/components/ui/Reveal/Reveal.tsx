import type { AriaRole, ReactNode } from 'react';
import styles from './Reveal.module.css';

type RevealProps = {
  children: ReactNode;
  role?: AriaRole;
  'aria-label'?: string;
};

export default function Reveal({ children, role, 'aria-label': ariaLabel }: RevealProps) {
  return (
    <div
      className={styles.reveal}
      data-reveal-root
      role={role}
      aria-label={ariaLabel}
    >
      <span data-reveal-entry-marker aria-hidden="true" />
      <span data-reveal-exit-marker aria-hidden="true" />
      {children}
    </div>
  );
}
