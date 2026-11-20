import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';
import type { Locale } from '@/lib/locale';
import type { SiteData } from '@/content/site';

const site: SiteData = {
  name: 'Pedro Suárez Gallardo',
  email: 'suarezgallardopedro@gmail.com',
  githubUrl: 'https://github.com/PedroSG00',
  linkedinUrl: 'https://linkedin.com/in/pedro-suarez-gallardo',
  cvPath: { en: '/EN_Pedro_Suarez_Gallardo_CV.pdf', es: '/ES_Pedro_Suarez_Gallardo_CV.pdf' },
};

const labelsEn = {
  copyright: '© 2026 Pedro Suárez Gallardo',
  github: 'GitHub',
  linkedin: 'LinkedIn',
  email: 'Email',
  cv: 'CV',
  newTab: 'opens in a new tab',
};

const labelsEs = {
  copyright: '© 2026 Pedro Suárez Gallardo',
  github: 'GitHub',
  linkedin: 'LinkedIn',
  email: 'Email',
  cv: 'CV',
  newTab: 'se abre en una pestaña nueva',
};

function renderFooter(locale: Locale = 'en', props = {}) {
  const labels = locale === 'es' ? labelsEs : labelsEn;
  return render(
    <Footer
      locale={locale}
      site={site}
      labels={labels}
      {...props}
    />,
  );
}

describe('Footer', () => {
  test('renderiza cuatro destinos: GitHub, LinkedIn, email y CV', () => {
    renderFooter();
    expect(screen.getByRole('link', { name: 'GitHub opens in a new tab' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'LinkedIn opens in a new tab' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Email' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'CV opens in a new tab' })).toBeInTheDocument();
  });

  test('GitHub, LinkedIn y CV abren en pestaña nueva con rel y texto sr-only traducido', () => {
    renderFooter();
    const github = screen.getByRole('link', { name: 'GitHub opens in a new tab' });
    expect(github).toHaveAttribute('target', '_blank');
    expect(github).toHaveAttribute('rel', 'noreferrer noopener');

    const linkedin = screen.getByRole('link', { name: 'LinkedIn opens in a new tab' });
    expect(linkedin).toHaveAttribute('target', '_blank');
    expect(linkedin).toHaveAttribute('rel', 'noreferrer noopener');

    const cv = screen.getByRole('link', { name: 'CV opens in a new tab' });
    expect(cv).toHaveAttribute('target', '_blank');
    expect(cv).toHaveAttribute('rel', 'noreferrer noopener');
  });

  test('texto sr-only está presente para lectores de pantalla', () => {
    renderFooter();
    expect(screen.getAllByText('opens in a new tab')).toHaveLength(3);
  });

  test('email usa mailto:', () => {
    renderFooter();
    const email = screen.getByRole('link', { name: 'Email' });
    expect(email).toHaveAttribute('href', 'mailto:suarezgallardopedro@gmail.com');
  });

  test('CV del idioma activo en inglés', () => {
    renderFooter('en');
    const cv = screen.getByRole('link', { name: 'CV opens in a new tab' });
    expect(cv).toHaveAttribute('href', '/EN_Pedro_Suarez_Gallardo_CV.pdf');
  });

  test('CV del idioma activo en español', () => {
    renderFooter('es');
    const cv = screen.getByRole('link', { name: 'CV se abre en una pestaña nueva' });
    expect(cv).toHaveAttribute('href', '/ES_Pedro_Suarez_Gallardo_CV.pdf');
  });

  test('copyright desde messages, no hardcodeado', () => {
    renderFooter();
    expect(screen.getByText('© 2026 Pedro Suárez Gallardo')).toBeInTheDocument();
  });

  test('no hay controles de tema ni idioma', () => {
    renderFooter();
    expect(screen.queryByRole('button', { name: /theme/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /idioma|language|english|español/i })).not.toBeInTheDocument();
  });

  test('falta una URL de GitHub y el resto sigue renderizado', () => {
    renderFooter('en', { site: { ...site, githubUrl: '' } });
    expect(screen.queryByRole('link', { name: 'GitHub opens in a new tab' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'LinkedIn opens in a new tab' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'CV opens in a new tab' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Email' })).toBeInTheDocument();
  });

  test('falta el copyright y no rompe, el resto se renderiza', () => {
    renderFooter('en', { labels: { ...labelsEn, copyright: '' } });
    expect(screen.queryByText('© 2026 Pedro Suárez Gallardo')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'GitHub opens in a new tab' })).toBeInTheDocument();
  });
});
