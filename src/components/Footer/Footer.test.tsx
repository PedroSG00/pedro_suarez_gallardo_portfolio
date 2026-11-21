import { describe, expect, test } from 'vitest';
import { screen } from '@testing-library/react';
import enMessages from '../../../messages/en.json';
import esMessages from '../../../messages/es.json';
import { renderWithIntl } from '@/test/render-with-intl';
import Footer from './Footer';
import type { Locale } from '@/lib/locale';
import type { SiteData } from '@/content/site';

const site: SiteData = {
  name: 'Pedro Suárez Gallardo',
  email: 'suarezgallardopedro@gmail.com',
  githubUrl: 'https://github.com/PedroSG00',
  linkedinUrl: 'https://linkedin.com/in/pedro-suarez-gallardo',
  cvPath: { en: '/EN_Pedro_Suarez_Gallardo_CV.pdf', es: '/ES_Pedro_Suarez_Gallardo_CV.pdf' },
  portraitSrc: '/pedro-suarez.png',
};

const labelsEn = {
  copyright: enMessages.footer.copyright,
  github: enMessages.contact.github,
  linkedin: enMessages.contact.linkedin,
  email: enMessages.contact.email,
  cv: enMessages.contact.cv,
  newTab: enMessages.shared.newTab,
};

function renderFooter(locale: Locale = 'en', props = {}) {
  return renderWithIntl(
    <Footer
      locale={locale}
      site={site}
      {...props}
    />, { locale },
  );
}

describe('Footer', () => {
  test('shows the four English destinations with decorative icons and safe, announced new tabs', () => {
    renderFooter();
    expect(screen.getAllByRole('link')).toHaveLength(4);
    for (const [name, href] of [
      ['GitHub opens in a new tab', site.githubUrl],
      ['LinkedIn opens in a new tab', site.linkedinUrl],
      ['Email', `mailto:${site.email}`],
      ['CV opens in a new tab', site.cvPath.en],
    ] as const) {
      const link = screen.getByRole('link', { name });
      expect(link).toHaveAttribute('href', href);
      // eslint-disable-next-line testing-library/no-node-access
      const icon = link.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    }
    for (const name of ['GitHub', 'LinkedIn', 'CV']) {
      const link = screen.getByRole('link', { name: `${name} opens in a new tab` });
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noreferrer noopener');
    }
    expect(screen.getByRole('link', { name: 'Email' })).not.toHaveAttribute('target');
    expect(screen.getAllByText('opens in a new tab')).toHaveLength(3);
    expect(screen.getByText(enMessages.footer.copyright)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /theme/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /idioma|language|english|español/i })).not.toBeInTheDocument();
  });

  test('uses the Spanish CV and translations for the Spanish locale', () => {
    renderFooter('es');
    const cv = screen.getByRole('link', { name: 'CV se abre en una pestaña nueva' });
    expect(cv).toHaveAttribute('href', '/ES_Pedro_Suarez_Gallardo_CV.pdf');
    expect(screen.getByRole('link', { name: 'Email' })).toBeInTheDocument();
    expect(screen.getByText(esMessages.footer.copyright)).toBeInTheDocument();
  });

  test('omits a missing GitHub URL and keeps the remaining links', () => {
    renderFooter('en', { site: { ...site, githubUrl: '' } });
    expect(screen.queryByRole('link', { name: 'GitHub opens in a new tab' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'LinkedIn opens in a new tab' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'CV opens in a new tab' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Email' })).toBeInTheDocument();
  });

  test('omits a missing copyright without breaking the remaining footer', () => {
    renderFooter('en', { labels: { ...labelsEn, copyright: '' } });
    expect(screen.queryByText(enMessages.footer.copyright)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'GitHub opens in a new tab' })).toBeInTheDocument();
  });

  test('renders without any site URLs', () => {
    const emptySite: SiteData = {
      name: 'Pedro Suárez Gallardo',
      email: '',
      githubUrl: '',
      linkedinUrl: '',
      cvPath: { en: '', es: '' },
      portraitSrc: '',
    };
    renderFooter('en', { site: emptySite });
    expect(screen.getByText(enMessages.footer.copyright)).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  test('renders only email when other URLs are missing', () => {
    const partialSite: SiteData = {
      name: 'Pedro Suárez Gallardo',
      email: 'suarezgallardopedro@gmail.com',
      githubUrl: '',
      linkedinUrl: '',
      cvPath: { en: '', es: '' },
      portraitSrc: '',
    };
    renderFooter('en', { site: partialSite });
    expect(screen.getByRole('link', { name: 'Email' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'GitHub opens in a new tab' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'CV opens in a new tab' })).not.toBeInTheDocument();
  });
});
