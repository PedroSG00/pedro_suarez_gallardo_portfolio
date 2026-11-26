import { describe, expect, test } from 'vitest';
import { screen, within } from '@testing-library/react';
import enMessages from '../../../../messages/en.json';
import esMessages from '../../../../messages/es.json';
import { renderWithIntl } from '@/test/render-with-intl';
import Stack from './Stack';

const LOCALES = [
  {
    locale: 'en',
    nav: enMessages.shared.nav,
  },
  {
    locale: 'es',
    nav: esMessages.shared.nav,
  },
] as const;

describe.each(LOCALES)(
  'Stack in $locale',
  ({ locale, nav }) => {
    test('exposes one localized heading for the Stack navigation destination', () => {
      renderWithIntl(<Stack />, { locale });
      const region = screen.getByRole('region', { name: nav.stack });
      expect(region).toHaveAttribute('id', 'stack');
      const headings = within(region).getAllByRole('heading', { level: 2 });
      expect(headings).toHaveLength(1);
      expect(headings[0]).toHaveTextContent(`03 / ${nav.stack}`);
    });
  },
);
