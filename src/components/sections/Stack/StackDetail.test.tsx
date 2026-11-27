import { describe, expect, test, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import enMessages from '../../../../messages/en.json';
import esMessages from '../../../../messages/es.json';
import { STACK_TECHNOLOGIES } from '@/content/stack';
import { renderWithIntl } from '@/test/render-with-intl';
import StackDetail from './StackDetail';

const LOCALES = [
  {
    locale: 'en',
    messages: enMessages.stack,
    detailLabel: 'Technology detail',
    empty: 'Select a card to see what it is.',
    eject: 'Eject',
    received: 'React is now in the detail slot.',
    replaced: 'React replaced TypeScript in the detail slot.',
  },
  {
    locale: 'es',
    messages: esMessages.stack,
    detailLabel: 'Detalle de tecnología',
    empty: 'Selecciona una carta para ver qué es.',
    eject: 'Expulsar',
    received: 'React está ahora en el casillero.',
    replaced: 'React sustituye a TypeScript en el casillero.',
  },
] as const;

const react = STACK_TECHNOLOGIES.find((technology) => technology.id === 'react');
if (!react) throw new Error('React is missing from the stack registry');

const reactCopy = {
  ...react,
  name: enMessages.stack.technologies.react.name,
  description: enMessages.stack.technologies.react.description,
};

const makeDataTransfer = (id: string) => ({
  types: ['application/x-stack-technology'],
  getData: (type: string) => (type === 'application/x-stack-technology' ? id : ''),
});

describe.each(LOCALES)('StackDetail in $locale', (localeData) => {
  test('shows the approved empty-slot instruction without an eject action', () => {
    renderWithIntl(
      <StackDetail
        technology={null}
        feedback={null}
        canReceiveTechnology={() => true}
        onReceive={vi.fn()}
        onEject={vi.fn()}
      />,
      { locale: localeData.locale },
    );

    const detail = screen.getByRole('region', {
      name: localeData.detailLabel,
    });
    expect(detail).toHaveTextContent(localeData.empty);
    expect(screen.queryByRole('button', { name: localeData.eject })).not.toBeInTheDocument();
  });

  test('shows the received technology, its own mark, description and eject action', () => {
    renderWithIntl(
      <StackDetail
        technology={reactCopy}
        feedback={{ kind: 'received', name: 'React' }}
        canReceiveTechnology={() => true}
        onReceive={vi.fn()}
        onEject={vi.fn()}
      />,
      { locale: localeData.locale },
    );

    const detail = screen.getByRole('region', {
      name: localeData.detailLabel,
    });
    expect(detail).toHaveTextContent(reactCopy.name);
    expect(detail).toHaveTextContent(reactCopy.description);
    expect(detail).toHaveTextContent(localeData.received);
    expect(
      screen.getByRole('img', { hidden: true }),
    ).toHaveAttribute('src', reactCopy.brandMark);
    expect(screen.getByRole('button', { name: localeData.eject })).toBeVisible();
    expect(screen.getByRole('button', { name: localeData.eject })).toHaveAttribute(
      'title',
      localeData.eject,
    );
  });

  test('announces which technology replaced the previous slot occupant', () => {
    renderWithIntl(
      <StackDetail
        technology={reactCopy}
        feedback={{ kind: 'replaced', name: 'React', replacedName: 'TypeScript' }}
        canReceiveTechnology={() => true}
        onReceive={vi.fn()}
        onEject={vi.fn()}
      />,
      { locale: localeData.locale },
    );

    expect(screen.getByRole('status')).toHaveTextContent(localeData.replaced);
  });

  test('highlights the slot only for an enabled dragged technology and clears on leave', () => {
    renderWithIntl(
      <StackDetail
        technology={null}
        feedback={null}
        canReceiveTechnology={(id) => id === 'react'}
        onReceive={vi.fn()}
        onEject={vi.fn()}
      />,
      { locale: localeData.locale },
    );

    const detail = screen.getByRole('region', {
      name: localeData.detailLabel,
    });
    fireEvent.dragEnter(detail, { dataTransfer: makeDataTransfer('react') });
    expect(detail).toHaveAttribute('data-drop-active', 'true');

    fireEvent.dragLeave(detail, { dataTransfer: makeDataTransfer('react') });
    expect(detail).toHaveAttribute('data-drop-active', 'false');

    fireEvent.dragEnter(detail, { dataTransfer: makeDataTransfer('chartJs') });
    expect(detail).toHaveAttribute('data-drop-active', 'false');
  });

  test('forwards an enabled drop to the shared selection state', () => {
    const onReceive = vi.fn();
    renderWithIntl(
      <StackDetail
        technology={null}
        feedback={null}
        canReceiveTechnology={() => true}
        onReceive={onReceive}
        onEject={vi.fn()}
      />,
      { locale: localeData.locale },
    );

    const detail = screen.getByRole('region', {
      name: localeData.detailLabel,
    });
    fireEvent.drop(detail, { dataTransfer: makeDataTransfer('react') });

    expect(onReceive).toHaveBeenCalledWith('react');
    expect(detail).toHaveAttribute('data-drop-active', 'false');
  });
});
