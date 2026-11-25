'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
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
  type StackState,
} from '@/lib/stack/stack-state';
import Reveal from '@/components/ui/Reveal/Reveal';
import StackFilters, {
  type StackFilterOption,
} from '@/components/sections/Stack/StackFilters';
import StackDetail, {
  type StackDetailFeedback,
  type StackDetailTechnology,
} from '@/components/sections/Stack/StackDetail';
import StackWorkbench from '@/components/sections/Stack/StackWorkbench';
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

const CATEGORY_GROUPS = STACK_CATEGORIES.map((category) => ({
  id: category,
  technologies: STACK_TECHNOLOGIES.filter(
    (technology) => technology.category === category,
  ),
}));

export default function StackFlatList() {
  const t = useTranslations('stack');
  const [stackState, setStackState] = useState(createInitialStackState);
  const [feedback, setFeedback] = useState<StackDetailFeedback | null>(null);
  const [mounted, setMounted] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [sceneStatus, setSceneStatus] = useState<'checking' | StackSceneStatus>('checking');
  const sceneActive = sceneStatus === 'ready' || sceneStatus === 'flat';
  const flatView = !sceneActive || listOpen;

  useEffect(() => {
    // Keep JavaScript-only controls out of the server HTML.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const filterOptions: StackFilterOption[] = [
    { id: 'all', label: t('filters.all') },
    ...STACK_CATEGORIES.map((id) => ({
      id,
      label: t(`categories.${CATEGORY_MESSAGE_KEYS[id]}`),
    })),
  ];
  const selectedTechnology = stackState.slotId
    ? STACK_TECHNOLOGIES.find(
        (technology) => technology.id === stackState.slotId,
      )
    : null;
  const selectedDetail: StackDetailTechnology | null = selectedTechnology
    ? {
         ...selectedTechnology,
         brandMark: flatView
           ? FLAT_MARKS[selectedTechnology.id] ?? selectedTechnology.brandMark
           : selectedTechnology.brandMark,
        name: t(`technologies.${selectedTechnology.id}.name`),
        description: t(`technologies.${selectedTechnology.id}.description`),
      }
    : null;
  const sceneTechnologies = STACK_TECHNOLOGIES.map((technology) => ({
    ...technology,
    name: t(`technologies.${technology.id}.name`),
    categoryLabel: t(`categories.${CATEGORY_MESSAGE_KEYS[technology.category]}`),
  }));

  const isTechnologyEnabled = (id: string, state: StackState = stackState) => {
    const technology = STACK_TECHNOLOGIES.find((item) => item.id === id);
    return technology
      ? isStackTechnologyEnabled(technology.category, state)
      : false;
  };

  const handleReceive = (id: string) => {
    const technology = STACK_TECHNOLOGIES.find((item) => item.id === id);
    if (!technology) return;

    const result = receiveStackTechnology(stackState, technology);
    setStackState(result.state);

    if (result.outcome === 'disabled') return;
    const name = t(`technologies.${technology.id}.name`);
    const replacedTechnology = result.replacedId
      ? STACK_TECHNOLOGIES.find((item) => item.id === result.replacedId)
      : undefined;
    setFeedback(
      result.outcome === 'replaced' && replacedTechnology
        ? {
            kind: 'replaced',
            name,
            replacedName: t(`technologies.${replacedTechnology.id}.name`),
          }
        : { kind: 'received', name },
    );
  };

  const handleEject = () => {
    const result = ejectStackTechnology(stackState);
    setStackState(result.state);
    if (result.releasedId) {
      const releasedTechnology = STACK_TECHNOLOGIES.find(
        (technology) => technology.id === result.releasedId,
      );
      if (releasedTechnology) {
        setFeedback({
          kind: 'ejected',
          name: t(`technologies.${releasedTechnology.id}.name`),
        });
      }
    }
  };

  const handleSceneSelect = (id: StackTechnologyId) => {
    const technology = STACK_TECHNOLOGIES.find((item) => item.id === id);
    if (!technology) return;

    setStackState((state) => selectStackTechnology(state, technology));
    setFeedback(null);
  };

  return (
    <div
      data-stack-flat-list
      data-scene-active={sceneActive}
      data-scene-status={sceneStatus}
      className="grid"
    >
      <StackWorkbench
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
        detail={mounted && (
          <StackDetail
            technology={selectedDetail}
            canDragCard={sceneActive && !listOpen}
            feedback={feedback}
            canReceiveTechnology={(id) => isTechnologyEnabled(id)}
            onReceive={handleReceive}
            onEject={handleEject}
          />
        )}
        list={renderList()}
      />
    </div>
  );

  function renderList() {
    return (
      <div
        id={STACK_LIST_ID}
        data-stack-accessible-list={!flatView}
        data-stack-list-interactive={mounted}
      >
        {CATEGORY_GROUPS.map(({ id, technologies }) => {
          const headingId = `stack-category-${id}`;
          const isCategoryActive = isStackTechnologyEnabled(id, stackState);

          return (
            <Reveal key={id} variant="fade">
              <div
                data-stack-category={id}
                data-active={isCategoryActive}
              >
                <h3 id={headingId} data-stack-category-heading>
                  {t(`categories.${CATEGORY_MESSAGE_KEYS[id]}`)}
                </h3>
                <ul
                  aria-labelledby={headingId}
                  data-stack-technologies
                  className="grid list-none"
                >
                  {technologies.map((technology) => {
                    const { id: technologyId, brandMark } = technology;
                    const name = t(`technologies.${technologyId}.name`);
                    const isEnabled = isStackTechnologyEnabled(
                      technology.category,
                      stackState,
                    );

                    return (
                      <li
                        key={technologyId}
                        data-stack-technology={technologyId}
                        data-featured={FEATURED_IDS.has(technologyId) ? '' : undefined}
                        className="min-w-0 wrap-anywhere"
                      >
                        <div className="flex items-center gap-3">
                          <Image
                            src={flatView ? FLAT_MARKS[technologyId] ?? brandMark : brandMark}
                            alt=""
                            aria-hidden="true"
                            role="img"
                            width={48}
                            height={32}
                            unoptimized
                            data-stack-brand-mark
                            className="h-8 w-12 shrink-0 object-contain"
                          />
                          <span data-stack-technology-name>
                            {mounted ? (
                              <button
                                type="button"
                                aria-label={t('detail.select', { name })}
                                aria-pressed={stackState.selectedId === technologyId}
                                disabled={!isEnabled}
                                data-stack-select
                                onClick={() => handleSceneSelect(technologyId)}
                              >
                                {name}
                              </button>
                            ) : (
                              name
                            )}
                          </span>
                        </div>
                        {(!mounted || !flatView) && (
                          <p data-stack-technology-description className="max-w-prose text-body">
                            {t(`technologies.${technologyId}.description`)}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </Reveal>
          );
        })}
      </div>
    );
  }
}
