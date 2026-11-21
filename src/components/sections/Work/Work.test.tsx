import { describe, expect, test } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderWithIntl } from '@/test/render-with-intl';
import Work from '@/components/sections/Work/Work';

const TECHNOLOGIES = [
  ['React', 'TypeScript'],
  ['React', 'TypeScript'],
  ['React', 'TypeScript'],
  ['React', 'TypeScript', 'WebSockets'],
  ['Node.js', 'Express', 'C#', 'PHP', 'Python', 'REST'],
];

const LOCALES = [
  {
    locale: 'en',
    label: 'Work',
    title: "What I've built.",
    entries: [
      ['Desktop apps, moved to the web.', 'I migrated two contact-center applications and redesigned their multilanguage interface. Both are in production and actively maintained.'],
      ['A real-time supervision dashboard.', 'Tracks agent activity live, with customizable views and charts over hundreds of thousands of records.'],
      ['An admin suite with dozens of sections.', 'Custom reporting, plus complex forms and tables with advanced validation.'],
      ['A visual flow editor.', 'A workflow system for chatbots and voice menus (IVR), plus the frontend of a real-time live chat.'],
      ['Integrations and backend APIs.', 'Messaging and CRM integrations through REST APIs and third-party SDKs, REST APIs in Node.js (Express), C# and PHP, Python automation, and backend refactors for speed and clarity.'],
    ],
  },
  {
    locale: 'es',
    label: 'Trabajo',
    title: 'Lo que he construido.',
    entries: [
      ['Aplicaciones de escritorio, llevadas a la web.', 'Migré dos aplicaciones de contact center y rediseñé su interfaz multidioma. Ambas están en producción y en mantenimiento activo.'],
      ['Un panel de supervisión en tiempo real.', 'Sigue la actividad de los agentes al instante, con vistas y gráficas personalizables sobre cientos de miles de registros.'],
      ['Una suite de administración con decenas de secciones.', 'Informes a medida, y formularios y tablas complejos con validación avanzada.'],
      ['Un editor visual de flujos.', 'Un sistema de flujos para chatbots y menús de voz (IVR), y el frontend de un chat en vivo en tiempo real.'],
      ['Integraciones y APIs de backend.', 'Integraciones de mensajería y CRM mediante APIs REST y SDKs de terceros, APIs REST en Node.js (Express), C# y PHP, automatización en Python y refactors del backend para ganar velocidad y claridad.'],
    ],
  },
] as const;

describe.each(LOCALES)('Work in $locale', ({ locale, label, title, entries }) => {
  test('presents the complete approved results and technologies in canonical order', () => {
    renderWithIntl(<Work />, { locale });

    const region = screen.getByRole('region', { name: label });
    expect(region).toHaveAttribute('id', 'work');
    const work = within(region);
    expect(work.getByRole('heading', { level: 2, name: label })).toBeVisible();
    expect(work.getByText('02 /')).toBeVisible();
    expect(work.getByRole('heading', { level: 3, name: title })).toBeVisible();
    const list = work.getByRole('list');
    expect(list.tagName).toBe('OL');
    const rows = within(list).getAllByRole('listitem');
    expect(rows).toHaveLength(5);
    expect(rows.map((row) => within(row).getByRole('heading', { level: 4 }).textContent))
      .toEqual(entries.map(([heading]) => heading));

    rows.forEach((row, index) => {
      const result = within(row);
      expect(result.getByRole('heading', { name: entries[index][0] })).toBeVisible();
      expect(result.getByText(entries[index][1], { exact: true })).toBeVisible();
      for (const technology of TECHNOLOGIES[index]) {
        expect(result.getByText(technology, { exact: true })).toBeVisible();
      }
      expect(result.queryAllByText('WebSockets', { exact: true }))
        .toHaveLength(index === 3 ? 1 : 0);
    });
  });

  test('keeps the visual row numbers decorative for assistive technology', () => {
    renderWithIntl(<Work />, { locale });

    const rows = within(screen.getByRole('list')).getAllByRole('listitem');
    rows.forEach((row, index) => {
      const number = within(row).getByText(String(index + 1).padStart(2, '0'));
      expect(number).toBeVisible();
      expect(number).toHaveAttribute('aria-hidden', 'true');
    });
  });

  test('keeps results and technology labels informational without focus stops', () => {
    renderWithIntl(<Work />, { locale });

    const list = screen.getByRole('list');
    const results = within(list);
    expect(results.queryByRole('link')).not.toBeInTheDocument();
    expect(results.queryByRole('button')).not.toBeInTheDocument();
    expect(results.queryByRole('textbox')).not.toBeInTheDocument();
    // Inspect focusability directly: generic elements with tabindex have no dedicated role.
    // eslint-disable-next-line testing-library/no-node-access
    const elements = [list, ...list.querySelectorAll<HTMLElement>('*')];
    for (const element of elements) {
      expect(element.tabIndex).toBe(-1);
      expect(element).not.toHaveAttribute('contenteditable', 'true');
    }
  });
});
