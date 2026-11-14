/**
 * app/[locale]/(site)/layout.tsx — T15 (RF-4, RF-6)
 * Layout for real pages only: mounts visible controls (LanguageSelector +
 * ThemeSelect). The 404 screen does not inherit this layout.
 */

import { ReactNode } from 'react';
import LanguageSelector from '../../components/LanguageSelector/LanguageSelector';
import ThemeSelect from '../../components/ThemeSelect/ThemeSelect';

interface SiteLayoutProps {
  children: ReactNode;
}

export default function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <div className="flex flex-col min-h-0">
      <div className="flex items-center justify-between py-4 px-4">
        <LanguageSelector />
        <ThemeSelect />
      </div>
      <main className="flex-1">{children}</main>
    </div>
  );
}
