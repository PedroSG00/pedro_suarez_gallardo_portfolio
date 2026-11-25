import type {
  StackCategoryId,
  StackTechnologyId,
} from '@/content/stack';

export const ALL_STACK_FILTER = 'all' as const;

export type StackFilter = typeof ALL_STACK_FILTER | StackCategoryId;

export type StackFilterState = {
  filter: StackFilter;
};

export type StackState = StackFilterState & {
  selectedId: StackTechnologyId | null;
  slotId: StackTechnologyId | null;
};

type SelectableTechnology = {
  id: StackTechnologyId;
  category: StackCategoryId;
};

export type StackReceiveResult = {
  outcome: 'received' | 'replaced' | 'disabled';
  replacedId: StackTechnologyId | null;
  state: StackState;
};

export function createInitialStackFilterState(): StackFilterState {
  return { filter: ALL_STACK_FILTER };
}

export function createInitialStackState(): StackState {
  return {
    ...createInitialStackFilterState(),
    selectedId: null,
    slotId: null,
  };
}

export function selectStackFilter<T extends StackFilterState>(
  state: T,
  filter: StackFilter,
): T {
  return { ...state, filter } as T;
}

export function isStackTechnologyEnabled(
  category: StackCategoryId,
  state: StackFilterState,
): boolean {
  return state.filter === ALL_STACK_FILTER || state.filter === category;
}

export function selectStackTechnology(
  state: StackState,
  technology: SelectableTechnology,
): StackState {
  if (!isStackTechnologyEnabled(technology.category, state)) return state;

  return {
    ...state,
    selectedId: technology.id,
    slotId: technology.id,
  };
}

export function receiveStackTechnology(
  state: StackState,
  technology: SelectableTechnology,
): StackReceiveResult {
  if (!isStackTechnologyEnabled(technology.category, state)) {
    return { outcome: 'disabled', replacedId: null, state };
  }

  const replacedId = state.slotId === technology.id ? null : state.slotId;
  return {
    outcome: replacedId ? 'replaced' : 'received',
    replacedId,
    state: {
      ...state,
      selectedId: technology.id,
      slotId: technology.id,
    },
  };
}

export function ejectStackTechnology(
  state: StackState,
): { state: StackState; releasedId: StackTechnologyId | null } {
  if (state.slotId === null) {
    return { state, releasedId: null };
  }

  return {
    releasedId: state.slotId,
    state: {
      ...state,
      selectedId: null,
      slotId: null,
    },
  };
}
