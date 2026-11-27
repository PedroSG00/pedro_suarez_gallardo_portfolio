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

function renderFooter(locale: Locale = 'en', props: Partial<React.ComponentProps<typeof Footer>> = {}) {
  return renderWithIntl(
    <Footer
      locale={locale}
      site={site}
      {...props}
    />, { locale },
  );
}

describe('Footer', () => {
  test.each([
    { locale: 'en', email: 'Email', cv: 'CV', newTab: 'opens in a new tab', copyright: enMessages.footer.copyright },
    { locale: 'es', email: 'Correo', cv: 'Currículum', newTab: 'se abre en una pestaña nueva', copyright: esMessages.footer.copyright },
  ] as const)('shows the four localized destinations in order for $locale', ({ locale, email, cv, newTab, copyright }) => {
    renderFooter(locale);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(4);
    const expectedLinks = [
      { label: email, href: `mailto:${site.email}`, newWindow: false },
      { label: 'LinkedIn', href: site.linkedinUrl, newWindow: true },
      { label: 'GitHub', href: site.githubUrl, newWindow: true },
      { label: cv, href: site.cvPath[locale], newWindow: true },
    ];

    for (const [index, { label, href, newWindow }] of expectedLinks.entries()) {
      const link = links[index];
      expect(link).toHaveAccessibleName(newWindow ? `${label} ${newTab}` : label);
      expect(link).toHaveAttribute('href', href);
      expect(link).toHaveAttribute('target', newWindow ? '_blank' : '_self');
      // eslint-disable-next-line testing-library/no-node-access
      const icon = link.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    }
    expect(links[0]).not.toHaveAttribute('rel');
    for (const link of links.slice(1)) {
      expect(link).toHaveAttribute('rel', 'noreferrer noopener');
    }
    expect(screen.getAllByText(newTab)).toHaveLength(3);
    expect(screen.getByText(copyright)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
  });

  test.each(['', '   '])('omits an empty or blank GitHub URL (%j) and keeps the remaining footer', (githubUrl) => {
    renderFooter('en', { site: { ...site, githubUrl } });
    expect(screen.queryByRole('link', { name: 'GitHub opens in a new tab' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'LinkedIn opens in a new tab' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'CV opens in a new tab' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Email' })).toBeInTheDocument();
    expect(screen.getByText(enMessages.footer.copyright)).toBeInTheDocument();
  });

  test('does not substitute the English CV if the Spanish CV is missing', () => {
    renderFooter('es', { site: { ...site, cvPath: { ...site.cvPath, es: '' } } });
    expect(screen.getAllByRole('link')).toHaveLength(3);
    expect(screen.queryByRole('link', { name: /currículum|cv/i })).not.toBeInTheDocument();
    expect(screen.getByText(esMessages.footer.copyright)).toBeInTheDocument();
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
