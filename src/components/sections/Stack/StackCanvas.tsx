'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createStackContext } from '@/lib/stack/stack-capabilities';
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

export default function StackCanvas({ onSceneStatusChange, ...update }: Props) {
  const { technologies, mode, yaw, pitch } = update;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<StackSceneHandle | null>(null);
  const latestUpdateRef = useRef(update);
  const [phase, setPhase] = useState<'loading' | 'ready' | 'fallback'>('loading');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let active = true;
    let pendingContext: WebGL2RenderingContext | null = null;
    const dispose = () => {
      active = false;
      canvas.removeEventListener('webglcontextlost', failToFlatList);
      sceneRef.current?.dispose();
      sceneRef.current = null;
      pendingContext?.getExtension('WEBGL_lose_context')?.loseContext();
      pendingContext = null;
    };
    function failToFlatList() {
      if (!active) return;
      dispose();
      setPhase('fallback');
      onSceneStatusChange('fallback');
    }
    canvas.addEventListener('webglcontextlost', failToFlatList);

    void Promise.resolve()
      .then(async () => {
        if (!active) return;
        pendingContext = createStackContext(canvas);
        if (!pendingContext) {
          failToFlatList();
          return;
        }
        const { mountStackScene } = await import('@/components/sections/Stack/stack-scene');
        if (!active || !pendingContext) return;
        const scene = mountStackScene(canvas, latestUpdateRef.current, pendingContext);
        pendingContext = null;
        sceneRef.current = scene;
        setPhase('ready');
        onSceneStatusChange(scene.supportsPerspective ? 'ready' : 'flat');
      })
      .catch(failToFlatList);

    return dispose;
  }, [onSceneStatusChange]);

  useLayoutEffect(() => {
    latestUpdateRef.current = update;
    sceneRef.current?.update(update);
  });

  if (phase === 'fallback') return null;
  const sceneReady = phase === 'ready';

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
        data-stack-camera-yaw={yaw}
        data-stack-camera-pitch={pitch}
      />
    </div>
  );
}
