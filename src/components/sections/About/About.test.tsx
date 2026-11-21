import { describe, expect, test } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import enMessages from '../../../../messages/en.json';
import esMessages from '../../../../messages/es.json';
import { SITE } from '@/content/site';
import { renderWithIntl } from '@/test/render-with-intl';
import About from './About';

describe('About content', () => {
  test.each([
    ['en', enMessages.about],
    ['es', esMessages.about],
  ] as const)('renders localized About content in %s', (locale, messages) => {
    renderWithIntl(<About />, { locale });

    const heading = screen.getByRole('heading', { level: 2, name: messages.intro });
    const about = within(screen.getByRole('region', { name: messages.intro }));

    expect(heading).toBeVisible();
    expect(about.getByRole('group', { name: messages.statement })).toBeVisible();
    const portrait = about.getByRole('img', { name: messages.portraitAlt });
    expect(portrait).toBeVisible();
    expect(portrait).toHaveAttribute(
      'src',
      new URL(SITE.portraitSrc, window.location.origin).toString(),
    );
    for (const paragraph of Object.values(messages.paragraphs)) {
      expect(about.getByText(paragraph)).toBeVisible();
    }

    const values = Object.values(messages.values);
    expect(values).toHaveLength(5);
    for (const value of values) {
      const label = about.getByText(value);
      expect(label).toBeVisible();
    }

    expect(about.queryByRole('link')).not.toBeInTheDocument();
    expect(about.queryByRole('button')).not.toBeInTheDocument();
    expect(about.queryByRole('textbox')).not.toBeInTheDocument();
    expect(about.queryByText(/sound engineering|ingeniería de sonido/i)).not.toBeInTheDocument();
  });

  test.each([
    ['en', 'I build the parts that are hard to get right.'],
    ['es', 'Me encargo de las partes que cuesta hacer bien.'],
  ] as const)('renders the %s statement from the catalog', (locale, expectedStatement) => {
    renderWithIntl(<About />, { locale });

    expect(screen.getByRole('group', { name: expectedStatement })).toBeVisible();
  });

  test('places the portrait before the biography in the mobile flow', () => {
    renderWithIntl(<About />, { locale: 'en' });

    const about = within(screen.getByRole('region', { name: enMessages.about.intro }));
    const portrait = about.getByRole('img', { name: enMessages.about.portraitAlt });
    const firstParagraph = about.getByText(enMessages.about.paragraphs.problem, {
      exact: true,
    });

    const position = firstParagraph.compareDocumentPosition(portrait);
    expect(position & Node.DOCUMENT_POSITION_PRECEDING).toBe(
      Node.DOCUMENT_POSITION_PRECEDING,
    );
  });

  test('keeps About content available while the portrait is pending', () => {
    renderWithIntl(<About />, { locale: 'en' });

    expect(screen.getByText(enMessages.about.paragraphs.problem)).toBeVisible();
    expect(screen.getByRole('img', { name: enMessages.about.portraitAlt })).toBeVisible();
  });

  test('omits a portrait that fails to load without affecting About content', () => {
    renderWithIntl(<About />, { locale: 'en' });

    fireEvent.error(screen.getByRole('img', { name: enMessages.about.portraitAlt }));

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText(enMessages.about.paragraphs.problem)).toBeVisible();
    expect(
      screen.getByRole('group', { name: enMessages.about.statement }),
    ).toBeVisible();
  });
});
