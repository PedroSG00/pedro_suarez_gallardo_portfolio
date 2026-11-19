import type { AriaRole, ReactNode } from 'react';
import styles from './Reveal.module.css';

type RevealProps = {
  children: ReactNode;
  role?: AriaRole;
  'aria-label'?: string;
};

export default function Reveal({ children, role, 'aria-label': ariaLabel }: RevealProps) {
  return (
    <div className={styles.reveal} role={role} aria-label={ariaLabel}>
      {children}
    </div>
  );
}
