import type { Locale } from '@/lib/locale';

export interface SiteData {
  name: string;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
  cvPath: Record<Locale, string>;
  portraitSrc: string;
}

export const SITE: SiteData = {
  name: 'Pedro Suárez Gallardo',
  email: 'suarezgallardopedro@gmail.com',
  githubUrl: 'https://github.com/PedroSG00',
  linkedinUrl: 'https://linkedin.com/in/pedro-suarez-gallardo',
  cvPath: {
    en: '/EN_Pedro_Suarez_Gallardo_CV.pdf',
    es: '/ES_Pedro_Suarez_Gallardo_CV.pdf',
  },
  portraitSrc: '/pedro-suarez.png',
};
