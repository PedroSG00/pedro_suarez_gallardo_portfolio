import { describe, expect, test } from 'vitest';
import { STACK_CATEGORIES, STACK_TECHNOLOGIES } from '@/content/stack';
import {
  createInitialStackState,
  ejectStackTechnology,
  isStackTechnologyEnabled,
  receiveStackTechnology,
  selectStackTechnology,
  selectStackFilter,
} from './stack-state';

const technology = (id: string) => {
  const match = STACK_TECHNOLOGIES.find((item) => item.id === id);
  if (!match) throw new Error(`Unknown technology: ${id}`);
  return match;
};

describe('stack filter state', () => {
  test('starts with All active', () => {
    const state = createInitialStackState();

    expect(state).toEqual({ filter: 'all', selectedId: null });
    for (const category of STACK_CATEGORIES) {
      expect(isStackTechnologyEnabled(category, state)).toBe(true);
    }
  });

  test.each(STACK_CATEGORIES)(
    'keeps only %s enabled while that category is selected',
    (category) => {
      const state = selectStackFilter(createInitialStackState(), category);

      expect(state.filter).toBe(category);
      for (const technologyCategory of STACK_CATEGORIES) {
        expect(isStackTechnologyEnabled(technologyCategory, state)).toBe(
          technologyCategory === category,
        );
      }
    },
  );

  test('All enables every category again', () => {
    const filtered = selectStackFilter(createInitialStackState(), 'frontend');
    const state = selectStackFilter(filtered, 'all');

    expect(state.filter).toBe('all');
    for (const category of STACK_CATEGORIES) {
      expect(isStackTechnologyEnabled(category, state)).toBe(true);
    }
  });

  test('selects one enabled technology and replaces the current selection', () => {
    const initial = createInitialStackState();
    const selected = selectStackTechnology(initial, technology('react'));
    const replaced = selectStackTechnology(selected, technology('typescript'));

    expect(selected.selectedId).toBe('react');
    expect(replaced.selectedId).toBe('typescript');
    expect(initial.selectedId).toBeNull();
  });

  test('preserves the selection when the filter changes', () => {
    const selected = selectStackTechnology(
      createInitialStackState(),
      technology('react'),
    );

    expect(selectStackFilter(selected, 'testing-ci')).toMatchObject({
      filter: 'testing-ci',
      selectedId: 'react',
    });
  });

  test('does not select a technology outside the active category', () => {
    const filtered = selectStackFilter(createInitialStackState(), 'frontend');
    const next = selectStackTechnology(filtered, technology('chartJs'));

    expect(next).toBe(filtered);
    expect(next.selectedId).toBeNull();
  });

  test('lets the flat list select outside the category without resetting the scene filter', () => {
    const filtered = selectStackFilter(createInitialStackState(), 'frontend');
    const outsideCategory = technology('chartJs');
    const selected = selectStackTechnology(filtered, outsideCategory, true);
    expect(selected).toEqual({ filter: 'frontend', selectedId: outsideCategory.id });
    expect(receiveStackTechnology(filtered, outsideCategory, true).state).toEqual(selected);
  });

  test('receives an enabled technology into an empty slot', () => {
    const received = receiveStackTechnology(
      createInitialStackState(),
      technology('react'),
    );
    const replaced = receiveStackTechnology(
      received.state,
      technology('nodeJs'),
    );

    expect(received).toEqual({
      outcome: 'received',
      replacedId: null,
      state: { filter: 'all', selectedId: 'react' },
    });
    expect(replaced).toEqual({
      outcome: 'replaced',
      replacedId: 'react',
      state: { filter: 'all', selectedId: 'nodeJs' },
    });
  });

  test('ignores a drop from a filtered-out category', () => {
    const filtered = selectStackFilter(createInitialStackState(), 'frontend');
    const result = receiveStackTechnology(filtered, technology('chartJs'));

    expect(result).toEqual({ outcome: 'disabled', replacedId: null, state: filtered });
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
      state: { filter: 'all', selectedId: null },
    });
    expect(empty).toEqual({ releasedId: null, state: ejected.state });
  });
});
