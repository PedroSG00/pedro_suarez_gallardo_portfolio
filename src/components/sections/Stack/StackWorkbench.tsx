'use client';

import { useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import type { StackTechnologyId } from '@/content/stack';
import type { StackFilter } from '@/lib/stack/stack-state';
import type {
  StackSceneMode, StackSceneStatus, StackSceneTechnology, StackSceneUpdate,
} from '@/lib/stack/stack-scene-types';
import StackCanvas from '@/components/sections/Stack/StackCanvas';
import StackZoomControls from '@/components/sections/Stack/StackZoomControls';
import { STACK_ZOOM_DEFAULT, stepStackZoom, type StackZoomDirection } from '@/lib/stack/stack-camera';

type Props = {
  active: boolean;
  supportsPerspective: boolean;
  technologies: readonly StackSceneTechnology[];
  filter: StackFilter;
  selectedId: StackTechnologyId | null;
  selectedName: string | undefined;
  listId: string;
  listOpen: boolean;
  filters: ReactNode;
  detail: ReactNode;
  onSelect: (id: StackTechnologyId) => void;
  onReceive: StackSceneUpdate['onReceive'];
  onToggleList: () => void;
  onSceneStatusChange: (status: StackSceneStatus) => void;
};

export default function StackWorkbench({
  active, supportsPerspective, technologies, filter, selectedId, selectedName, listId, listOpen,
  filters, detail, onSelect, onReceive, onToggleList, onSceneStatusChange,
}: Props) {
  const t = useTranslations('stack.cad');
  const [requestedMode, setMode] = useState<StackSceneMode>('2d');
  const [zoom, setZoom] = useState(STACK_ZOOM_DEFAULT);
  const changeZoom = (direction: StackZoomDirection) => setZoom((level) => stepStackZoom(level, direction));
  const mode = supportsPerspective ? requestedMode : '2d';
  const isSpatial = mode === '3d';
  const projection = t(listOpen ? 'list' : isSpatial ? 'space' : 'plane');

  return (
    <div data-stack-workbench data-active={active}>
      <div data-stack-toolbar>
        {active && (
          <div data-stack-console-heading>
            <strong>{t('title')}</strong>
            <span data-stack-engine>{t('engine')}</span>
          </div>
        )}
        <div data-stack-toolbar-controls>
          {filters}
          {active && (
            <div data-stack-view-controls>
              {supportsPerspective && <button
                type="button"
                role="switch"
                aria-label={t('view')}
                aria-checked={isSpatial}
                onClick={() => {
                  setMode((view) => view === '2d' ? '3d' : '2d');
                  if (listOpen) onToggleList();
                }}
              >
                {t('viewOptions')}
              </button>}
              <button
                type="button"
                aria-controls={listId}
                aria-expanded={listOpen}
                onClick={onToggleList}
              >
                {t('list')}
              </button>
              {isSpatial && !listOpen && <StackZoomControls level={zoom} onZoom={changeZoom} />}
            </div>
          )}
        </div>
      </div>
      <div data-stack-drawing data-mode={mode} hidden={listOpen}>
        <StackCanvas
          mode={mode}
          zoom={zoom}
          onZoom={changeZoom}
          technologies={technologies}
          filter={filter}
          selectedId={selectedId}
          onSelect={onSelect}
          onReceive={onReceive}
          onSceneStatusChange={onSceneStatusChange}
        />
        {active && <p data-stack-drawing-note aria-hidden="true">{t('hint')}</p>}
      </div>
      {active && (
        <div data-stack-readout>
          <span>{projection}</span>
          <span>{t('modules', { count: technologies.length })}</span>
          <span>{t('slot', { name: selectedName ?? t('empty') })}</span>
        </div>
      )}
      {detail}
    </div>
  );
}
