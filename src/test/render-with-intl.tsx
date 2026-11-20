import type { ReactElement } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { render, type RenderOptions } from '@testing-library/react';

import enMessages from '../../messages/en.json';
import esMessages from '../../messages/es.json';
import type { Locale } from '@/lib/locale';

type TestMessages = typeof enMessages;

type RenderWithIntlOptions = Omit<RenderOptions, 'wrapper'> & {
  locale?: Locale;
  messages?: TestMessages;
};

export function renderWithIntl(
  ui: ReactElement,
  { locale = 'en', messages, ...options }: RenderWithIntlOptions = {},
) {
  const selectedMessages = messages ?? (locale === 'es' ? esMessages : enMessages);

  return render(
    <NextIntlClientProvider locale={locale} messages={selectedMessages}>
      {ui}
    </NextIntlClientProvider>,
    options,
  );
}
