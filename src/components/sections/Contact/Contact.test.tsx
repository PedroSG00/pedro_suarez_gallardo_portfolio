import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Contact from '@/components/sections/Contact/Contact';
import { renderWithIntl } from '@/test/render-with-intl';

describe('Contact', () => {
  it.each([
    {
      locale: 'en',
      label: 'Contact',
      title: "Let's build something solid.",
      body: 'Tell me what you need. Email or LinkedIn, whichever is easier.',
    },
    {
      locale: 'es',
      label: 'Contacto',
      title: 'Construyamos algo sólido.',
      body: 'Cuéntame qué necesitas. Por email o LinkedIn, como te resulte más cómodo.',
    },
  ] as const)('shows the numbered section and approved copy in $locale', ({ locale, label, title, body }) => {
    renderWithIntl(<Contact />, { locale });

    const region = within(screen.getByRole('region', { name: label }));
    expect(region.getAllByRole('heading', { level: 2 })).toHaveLength(1);
    expect(region.getByRole('heading', { level: 2, name: label })).toHaveTextContent(`04 / ${label}`);
    expect(region.getByRole('heading', { level: 3, name: title })).toBeVisible();
    expect(region.getByText(body, { exact: true })).toBeVisible();
  });

  it.each([
    {
      locale: 'en',
      sectionLabel: 'Contact',
      emailLabel: 'Email',
      cvLabel: 'CV',
      cvPath: '/EN_Pedro_Suarez_Gallardo_CV.pdf',
    },
    {
      locale: 'es',
      sectionLabel: 'Contacto',
      emailLabel: 'Correo',
      cvLabel: 'Currículum',
      cvPath: '/ES_Pedro_Suarez_Gallardo_CV.pdf',
    },
  ] as const)('offers the four approved contact channels in $locale', ({
    locale, sectionLabel, emailLabel, cvLabel, cvPath,
  }) => {
    renderWithIntl(<Contact />, { locale });

    const region = within(screen.getByRole('region', { name: sectionLabel }));
    const emailAddress = 'suarezgallardopedro@gmail.com';
    const email = region.getByRole('link', { name: `${emailLabel} ${emailAddress}` });

    expect(within(email).getByText(emailLabel, { exact: true })).toBeVisible();
    expect(within(email).getByText(emailAddress, { exact: true })).toBeVisible();
    expect(email).toHaveAttribute('href', `mailto:${emailAddress}`);
    expect(email).not.toHaveAttribute('target', '_blank');

    for (const [label, href] of [
      ['LinkedIn', 'https://linkedin.com/in/pedro-suarez-gallardo'],
      ['GitHub', 'https://github.com/PedroSG00'],
      [cvLabel, cvPath],
    ]) {
      const link = region.getByRole('link', { name: label });
      expect(link).toBeVisible();
      expect(link).toHaveAttribute('href', href);
      expect(link).toHaveAttribute('target', '_blank');
    }

    expect(region.getAllByRole('link')).toHaveLength(4);
    expect(region.queryByRole('button')).not.toBeInTheDocument();
  });
});
