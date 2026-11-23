'use client';

import { useEffect, useRef, useState } from 'react';
import type { StackTechnologyId } from '@/content/stack';
import { hasWebGLSupport } from '@/lib/stack/stack-capabilities';
import type { StackFilter } from '@/lib/stack/stack-state';
import type {
  StackSceneHandle,
  StackSceneMode,
  StackSceneTechnology,
  StackSceneUpdate,
} from '@/lib/stack/stack-scene-types';

type Props = {
  technologies: readonly StackSceneTechnology[];
  mode: StackSceneMode;
  filter: StackFilter;
  selectedId: StackTechnologyId | null;
  onSelect: (id: StackTechnologyId) => void;
  onSceneStatusChange: (status: 'fallback' | 'ready') => void;
};

export type { StackSceneTechnology };

export default function StackCanvas({
  technologies,
  mode,
  filter,
  selectedId,
  onSelect,
  onSceneStatusChange,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<StackSceneHandle | null>(null);
  const latestUpdateRef = useRef<StackSceneUpdate>({
    technologies,
    mode,
    filter,
    selectedId,
    onSelect,
  });
  const [webglAvailable, setWebglAvailable] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    const supported = hasWebGLSupport();
    // Keep the canvas out of server HTML and fall back when WebGL is missing.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWebglAvailable(supported);
    if (!supported) onSceneStatusChange('fallback');
  }, [onSceneStatusChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!webglAvailable || !canvas) return;

    let cancelled = false;
    const failToFlatList = () => {
      if (cancelled) return;
      sceneRef.current = null;
      setSceneReady(false);
      setWebglAvailable(false);
      onSceneStatusChange('fallback');
    };

    void import('@/components/sections/Stack/stack-scene')
      .then(({ mountStackScene }) => {
        if (cancelled) return;

        try {
          const scene = mountStackScene(canvas, latestUpdateRef.current);
          if (cancelled) {
            scene.dispose();
            return;
          }

          sceneRef.current = scene;
          setSceneReady(true);
          onSceneStatusChange('ready');
        } catch {
          failToFlatList();
        }
      })
      .catch(failToFlatList);

    return () => {
      cancelled = true;
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [webglAvailable, onSceneStatusChange]);

  useEffect(() => {
    const update: StackSceneUpdate = {
      technologies,
      mode,
      filter,
      selectedId,
      onSelect,
    };
    latestUpdateRef.current = update;
    if (sceneReady) sceneRef.current?.update(update);
  }, [technologies, mode, filter, selectedId, onSelect, sceneReady]);

  if (!webglAvailable) return null;

  return (
    <div
      data-stack-canvas-shell
      data-stack-scene-ready={sceneReady}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        data-stack-canvas
        data-testid="stack-canvas"
        data-stack-scene-mode={mode}
        data-stack-scene-ready={sceneReady}
        data-stack-scene-card-count={technologies.length}
      />
    </div>
  );
}
