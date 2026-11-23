import { describe, expect, test } from 'vitest';
import { STACK_CATEGORIES, STACK_TECHNOLOGIES } from '@/content/stack';
import {
  createInitialStackState,
  createInitialStackFilterState,
  ejectStackTechnology,
  isStackTechnologyEnabled,
  receiveStackTechnology,
  selectStackTechnology,
  selectStackFilter,
  type StackFilter,
} from './stack-state';

const FILTERS = ['all', ...STACK_CATEGORIES] as const satisfies readonly StackFilter[];
const technology = (id: string) => {
  const match = STACK_TECHNOLOGIES.find((item) => item.id === id);
  if (!match) throw new Error(`Unknown technology: ${id}`);
  return match;
};

describe('stack filter state', () => {
  test('starts with All active', () => {
    const state = createInitialStackFilterState();

    expect(state).toEqual({ filter: 'all' });
    for (const category of STACK_CATEGORIES) {
      expect(isStackTechnologyEnabled(category, state)).toBe(true);
    }
  });

  test.each(STACK_CATEGORIES)(
    'keeps only %s enabled while that category is selected',
    (category) => {
      const state = selectStackFilter(createInitialStackFilterState(), category);

      expect(state.filter).toBe(category);
      for (const technologyCategory of STACK_CATEGORIES) {
        expect(isStackTechnologyEnabled(technologyCategory, state)).toBe(
          technologyCategory === category,
        );
      }
    },
  );

  test.each(FILTERS)('selects %s as the single active filter', (filter) => {
    const initialState = createInitialStackFilterState();
    const nextState = selectStackFilter(initialState, filter);

    expect(nextState.filter).toBe(filter);
    expect(initialState.filter).toBe('all');
  });

  test('All enables every category again', () => {
    const filtered = selectStackFilter(createInitialStackFilterState(), 'frontend');
    const state = selectStackFilter(filtered, 'all');

    expect(state.filter).toBe('all');
    for (const category of STACK_CATEGORIES) {
      expect(isStackTechnologyEnabled(category, state)).toBe(true);
    }
  });

  test('starts with an empty detail slot and no selected technology', () => {
    expect(createInitialStackState()).toEqual({
      filter: 'all',
      selectedId: null,
      slotId: null,
    });
  });

  test('selects one enabled technology and replaces the current selection', () => {
    const initial = createInitialStackState();
    const selected = selectStackTechnology(initial, technology('react'));
    const replaced = selectStackTechnology(selected, technology('typescript'));

    expect(selected).toMatchObject({ selectedId: 'react', slotId: 'react' });
    expect(replaced).toMatchObject({
      selectedId: 'typescript',
      slotId: 'typescript',
    });
    expect(initial).toMatchObject({ selectedId: null, slotId: null });
  });

  test('preserves the selection when the filter changes', () => {
    const selected = selectStackTechnology(
      createInitialStackState(),
      technology('react'),
    );

    expect(selectStackFilter(selected, 'testing-ci')).toMatchObject({
      filter: 'testing-ci',
      selectedId: 'react',
      slotId: 'react',
    });
  });

  test('does not select a technology outside the active category', () => {
    const filtered = selectStackFilter(createInitialStackState(), 'frontend');
    const next = selectStackTechnology(filtered, technology('chartJs'));

    expect(next).toBe(filtered);
    expect(next).toMatchObject({ selectedId: null, slotId: null });
  });

  test('receives an enabled technology only when the slot is empty', () => {
    const received = receiveStackTechnology(
      createInitialStackState(),
      technology('react'),
    );
    const rejected = receiveStackTechnology(
      received.state,
      technology('nodeJs'),
    );

    expect(received).toEqual({
      outcome: 'received',
      state: expect.objectContaining({ selectedId: 'react', slotId: 'react' }),
    });
    expect(rejected).toEqual({ outcome: 'rejected', state: received.state });
  });

  test('ignores a drop from a filtered-out category', () => {
    const filtered = selectStackFilter(createInitialStackState(), 'frontend');
    const result = receiveStackTechnology(filtered, technology('chartJs'));

    expect(result).toEqual({ outcome: 'disabled', state: filtered });
  });

  test('ejects the single occupant and leaves an already-empty slot unchanged', () => {
    const occupied = selectStackTechnology(
      createInitialStackState(),
      technology('react'),
    );
    const ejected = ejectStackTechnology(occupied);
    const empty = ejectStackTechnology(ejected.state);

    expect(ejected).toEqual({
      releasedId: 'react',
      state: { filter: 'all', selectedId: null, slotId: null },
    });
    expect(empty).toEqual({ releasedId: null, state: ejected.state });
  });
});
