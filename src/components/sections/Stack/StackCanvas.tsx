'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { hasWebGLSupport } from '@/lib/stack/stack-capabilities';
import type {
  StackSceneHandle,
  StackSceneStatus,
  StackSceneTechnology,
  StackSceneUpdate,
} from '@/lib/stack/stack-scene-types';

type Props = StackSceneUpdate & {
  onSceneStatusChange: (status: StackSceneStatus) => void;
};

export type { StackSceneTechnology };

export default function StackCanvas({
  technologies,
  mode,
  zoom,
  filter,
  selectedId,
  onSelect,
  onReceive,
  onZoom,
  onSceneStatusChange,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<StackSceneHandle | null>(null);
  const latestUpdateRef = useRef<StackSceneUpdate>({
    technologies,
    mode,
    zoom,
    filter,
    selectedId,
    onSelect,
    onReceive,
    onZoom,
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
          onSceneStatusChange(scene.supportsPerspective ? 'ready' : 'flat');
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

  useLayoutEffect(() => {
    const update: StackSceneUpdate = {
      technologies,
      mode,
      zoom,
      filter,
      selectedId,
      onSelect,
      onReceive,
      onZoom,
    };
    latestUpdateRef.current = update;
    if (sceneReady) sceneRef.current?.update(update);
  }, [technologies, mode, zoom, filter, selectedId, onSelect, onReceive, onZoom, sceneReady]);

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
