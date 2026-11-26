'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import {
  FEATURED_STACK_TECHNOLOGY_IDS,
  STACK_CATEGORIES,
  STACK_TECHNOLOGIES,
  type StackCategoryId,
} from '@/content/stack';
import type { StackTechnologyId } from '@/content/stack';
import {
  createInitialStackState,
  ejectStackTechnology,
  isStackTechnologyEnabled,
  receiveStackTechnology,
  selectStackTechnology,
  selectStackFilter,
} from '@/lib/stack/stack-state';
import StackFilters, {
  type StackFilterOption,
} from '@/components/sections/Stack/StackFilters';
import StackDetail, {
  type StackDetailFeedback,
  type StackDetailTechnology,
} from '@/components/sections/Stack/StackDetail';
import StackWorkbench from '@/components/sections/Stack/StackWorkbench';
import StackTechnologyList from '@/components/sections/Stack/StackTechnologyList';
import type { StackSceneStatus } from '@/lib/stack/stack-scene-types';

const STACK_LIST_ID = 'stack-technology-list';
const FLAT_MARKS: Partial<Record<StackTechnologyId, string>> = {
  cSharp: '/stack/cSharp-flat.svg',
  playwright: '/stack/playwright-flat.svg',
};

const CATEGORY_MESSAGE_KEYS = {
  frontend: 'frontend',
  'data-visualization': 'dataVisualization',
  'backend-apis': 'backendApis',
  databases: 'databases',
  'testing-ci': 'testingCi',
  'ai-tools': 'aiTools',
} as const satisfies Record<StackCategoryId, string>;

const FEATURED_IDS: ReadonlySet<string> = new Set(
  FEATURED_STACK_TECHNOLOGY_IDS,
);

const subscribeToHydration = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

function useLocalizedStack() {
  const t = useTranslations('stack');
  return useMemo(() => {
    const categories = STACK_CATEGORIES.map((id) => ({
      id, label: t(`categories.${CATEGORY_MESSAGE_KEYS[id]}`),
    }));
    const sceneTechnologies = STACK_TECHNOLOGIES.map((technology) => ({
      ...technology,
      name: t(`technologies.${technology.id}.name`),
      categoryLabel: t(`categories.${CATEGORY_MESSAGE_KEYS[technology.category]}`),
    }));
    const technologies = sceneTechnologies.map((technology) => ({
      ...technology,
      description: t(`technologies.${technology.id}.description`),
      selectLabel: t('detail.select', { name: technology.name }),
      flatMark: FLAT_MARKS[technology.id] ?? technology.brandMark,
      featured: FEATURED_IDS.has(technology.id),
    }));
    return {
      filterOptions: [{ id: 'all', label: t('filters.all') }, ...categories] satisfies StackFilterOption[],
      sceneTechnologies,
      byId: new Map<string, (typeof technologies)[number]>(
        technologies.map((technology) => [technology.id, technology]),
      ),
      groups: categories.map(({ id, label }) => ({
        id, label, technologies: technologies.filter(({ category }) => category === id),
      })),
    };
  }, [t]);
}

export default function StackFlatList() {
  const t = useTranslations('stack');
  const [stackState, setStackState] = useState(createInitialStackState);
  const [feedback, setFeedback] = useState<StackDetailFeedback | null>(null);
  const interactive = useSyncExternalStore(subscribeToHydration, clientSnapshot, serverSnapshot);
  const [listOpen, setListOpen] = useState(false);
  const [sceneStatus, setSceneStatus] = useState<'checking' | StackSceneStatus>('checking');
  const sceneActive = sceneStatus === 'ready' || sceneStatus === 'flat';
  const flatView = !sceneActive || listOpen;

  const { byId, groups, filterOptions, sceneTechnologies } = useLocalizedStack();
  const selectedTechnology = stackState.selectedId ? byId.get(stackState.selectedId) : undefined;
  const selectedDetail: StackDetailTechnology | null = selectedTechnology
    ? {
        ...selectedTechnology,
        brandMark: flatView ? selectedTechnology.flatMark : selectedTechnology.brandMark,
      }
    : null;
  const isTechnologyEnabled = (id: string) => {
    const technology = byId.get(id);
    return technology !== undefined && isStackTechnologyEnabled(technology.category, stackState, flatView);
  };

  const handleReceive = (id: string) => {
    const technology = byId.get(id);
    if (!technology) return;

    const result = receiveStackTechnology(stackState, technology, flatView);
    if (result.outcome === 'disabled') return;
    setStackState(result.state);
    const { name } = technology;
    const replacedName = result.replacedId ? byId.get(result.replacedId)?.name : undefined;
    setFeedback(
      replacedName
        ? { kind: 'replaced', name, replacedName }
        : { kind: 'received', name },
    );
  };

  const handleEject = () => {
    const result = ejectStackTechnology(stackState);
    setStackState(result.state);
    if (result.releasedId) {
      const releasedTechnology = byId.get(result.releasedId);
      if (releasedTechnology) {
        setFeedback({
          kind: 'ejected',
          name: releasedTechnology.name,
        });
      }
    }
  };

  const handleSceneSelect = (id: StackTechnologyId) => {
    const technology = byId.get(id);
    if (!technology) return;

    setStackState((state) => selectStackTechnology(state, technology, flatView));
    setFeedback(null);
  };

  return (
    <div
      data-stack-flat-list
      data-scene-active={sceneActive}
      data-scene-status={sceneStatus}
    >
      <StackWorkbench
        interactive={interactive}
        active={sceneActive}
        supportsPerspective={sceneStatus === 'ready'}
        technologies={sceneTechnologies}
        filter={stackState.filter}
        selectedId={stackState.selectedId}
        selectedName={selectedDetail?.name}
        listId={STACK_LIST_ID}
        listOpen={listOpen}
        onSelect={handleSceneSelect}
        onReceive={handleReceive}
        onSceneStatusChange={setSceneStatus}
        onToggleList={() => setListOpen((open) => !open)}
        filters={
          <StackFilters
            activeFilter={stackState.filter}
            groupLabel={t('filters.label')}
            options={filterOptions}
            onFilterChange={(filter) =>
              setStackState((state) => selectStackFilter(state, filter))
            }
          />
        }
        detail={interactive && (
          <StackDetail
            technology={selectedDetail}
            canDragCard={sceneActive && !listOpen}
            feedback={feedback}
            canReceiveTechnology={isTechnologyEnabled}
            onReceive={handleReceive}
            onEject={handleEject}
          />
        )}
        list={
          <StackTechnologyList
            id={STACK_LIST_ID}
            groups={groups}
            state={stackState}
            interactive={interactive}
            flatView={flatView}
            onSelect={handleSceneSelect}
          />
        }
      />
    </div>
  );
}
