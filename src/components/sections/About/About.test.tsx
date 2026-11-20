import { describe, expect, test } from 'vitest';
import { screen, within } from '@testing-library/react';
import enMessages from '../../../../messages/en.json';
import esMessages from '../../../../messages/es.json';
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
    expect(about.getByText(messages.statement)).toBeVisible();
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
});
