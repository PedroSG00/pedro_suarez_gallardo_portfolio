import type {
  StackCategoryId,
  StackTechnologyId,
} from '@/content/stack';

export const ALL_STACK_FILTER = 'all' as const;

export type StackFilter = typeof ALL_STACK_FILTER | StackCategoryId;

export type StackState = {
  filter: StackFilter;
  selectedId: StackTechnologyId | null;
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

export function createInitialStackState(): StackState {
  return { filter: ALL_STACK_FILTER, selectedId: null };
}

export function selectStackFilter(state: StackState, filter: StackFilter): StackState {
  return state.filter === filter ? state : { ...state, filter };
}

export function isStackTechnologyEnabled(
  category: StackCategoryId,
  state: StackState,
  allowFiltered = false,
): boolean {
  return allowFiltered || state.filter === ALL_STACK_FILTER || state.filter === category;
}

function placeTechnology(state: StackState, selectedId: StackTechnologyId): StackState {
  return state.selectedId === selectedId ? state : { ...state, selectedId };
}

export function selectStackTechnology(
  state: StackState,
  technology: SelectableTechnology,
  allowFiltered = false,
): StackState {
  return isStackTechnologyEnabled(technology.category, state, allowFiltered)
    ? placeTechnology(state, technology.id)
    : state;
}

export function receiveStackTechnology(
  state: StackState,
  technology: SelectableTechnology,
  allowFiltered = false,
): StackReceiveResult {
  if (!isStackTechnologyEnabled(technology.category, state, allowFiltered)) {
    return { outcome: 'disabled', replacedId: null, state };
  }

  const replacedId = state.selectedId === technology.id ? null : state.selectedId;
  return {
    outcome: replacedId ? 'replaced' : 'received',
    replacedId,
    state: placeTechnology(state, technology.id),
  };
}

export function ejectStackTechnology(
  state: StackState,
): { state: StackState; releasedId: StackTechnologyId | null } {
  if (state.selectedId === null) {
    return { state, releasedId: null };
  }

  return {
    releasedId: state.selectedId,
    state: { ...state, selectedId: null },
  };
}
