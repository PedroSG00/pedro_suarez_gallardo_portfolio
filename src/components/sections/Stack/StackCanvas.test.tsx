import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import type { ComponentProps } from 'react';
import enMessages from '../../../../messages/en.json';
import { STACK_TECHNOLOGIES } from '@/content/stack';
import StackCanvas from './StackCanvas';

const mocks = vi.hoisted(() => ({
  createContext: vi.fn<() => WebGL2RenderingContext | null>(),
  mountStackScene: vi.fn(),
}));

vi.mock('@/lib/stack/stack-capabilities', () => ({
  createStackContext: mocks.createContext,
}));

vi.mock('./stack-scene', () => ({
  mountStackScene: mocks.mountStackScene,
}));

const technologies = STACK_TECHNOLOGIES.map((technology) => ({
  ...technology,
  name: enMessages.stack.technologies[technology.id].name,
  categoryLabel: enMessages.stack.categories[
    technology.category === 'data-visualization'
      ? 'dataVisualization'
      : technology.category === 'backend-apis'
        ? 'backendApis'
        : technology.category === 'testing-ci'
          ? 'testingCi'
          : technology.category === 'ai-tools'
            ? 'aiTools'
            : technology.category
  ],
}));

const onSelect = vi.fn();
const onReceive = vi.fn();
const onZoom = vi.fn();
const onRotate = vi.fn();
const onSceneStatusChange = vi.fn();
const context = { getExtension: () => null } as unknown as WebGL2RenderingContext;
const sceneHandle = {
  supportsPerspective: true,
  update: vi.fn(),
  dispose: vi.fn(),
};

function renderCanvas(props: Partial<ComponentProps<typeof StackCanvas>> = {}) {
  return render(
    <StackCanvas
      technologies={technologies}
      mode="2d"
      zoom={100}
      yaw={0}
      pitch={0}
      filter="all"
      selectedId={null}
      onSelect={onSelect}
      onReceive={onReceive}
      onZoom={onZoom}
      onRotate={onRotate}
      onSceneStatusChange={onSceneStatusChange}
      {...props}
    />,
  );
}

describe('StackCanvas', () => {
  beforeEach(() => {
    mocks.createContext.mockReset().mockReturnValue(context);
    mocks.mountStackScene.mockReset();
    sceneHandle.update.mockReset();
    sceneHandle.dispose.mockReset();
    onSelect.mockReset();
    onReceive.mockReset();
    onRotate.mockReset();
    onSceneStatusChange.mockReset();
    mocks.mountStackScene.mockReturnValue(sceneHandle);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('keeps the canvas and its controls absent when WebGL is unavailable', async () => {
    mocks.createContext.mockReturnValue(null);
    renderCanvas();

    await waitFor(() => expect(onSceneStatusChange).toHaveBeenLastCalledWith('fallback'));
    expect(screen.queryByTestId('stack-canvas')).not.toBeInTheDocument();
    expect(mocks.mountStackScene).not.toHaveBeenCalled();
  });

  test('mounts an aria-hidden canvas with the complete localized card registry', async () => {
    renderCanvas();

    const canvas = await screen.findByTestId('stack-canvas');
    await waitFor(() =>
      expect(canvas).toHaveAttribute('data-stack-scene-ready', 'true'),
    );
    expect(canvas).toHaveAttribute(
      'data-stack-scene-card-count',
      String(STACK_TECHNOLOGIES.length),
    );
    expect(canvas).toHaveAttribute('aria-hidden', 'true');
    expect(canvas).toBeVisible();

    expect(mocks.mountStackScene).toHaveBeenCalledExactlyOnceWith(
      canvas, expect.objectContaining({ technologies, filter: 'all', selectedId: null }), context,
    );
    expect(onSceneStatusChange).toHaveBeenLastCalledWith('ready');
  });

  test('forwards canvas selection and drops and updates filter and selected state', async () => {
    const { rerender } = renderCanvas();
    await waitFor(async () =>
      expect(
        await screen.findByTestId('stack-canvas'),
      ).toHaveAttribute('data-stack-scene-ready', 'true'),
    );

    const options = mocks.mountStackScene.mock.calls[0]?.[1];
    act(() => options.onSelect('react'));
    expect(onSelect).toHaveBeenCalledWith('react');
    act(() => options.onReceive('typescript'));
    expect(onReceive).toHaveBeenCalledWith('typescript');

    rerender(
      <StackCanvas
        technologies={technologies}
        mode="3d"
        zoom={105}
        yaw={5}
        pitch={-5}
        filter="frontend"
        selectedId="react"
        onSelect={onSelect}
        onReceive={onReceive}
        onZoom={onZoom}
        onRotate={onRotate}
        onSceneStatusChange={onSceneStatusChange}
      />,
    );
    await waitFor(() =>
      expect(sceneHandle.update).toHaveBeenCalledWith({
        technologies,
        mode: '3d',
        zoom: 105,
        filter: 'frontend',
        selectedId: 'react',
        onSelect,
        onReceive,
        onZoom,
        onRotate,
        yaw: 5,
        pitch: -5,
      }),
    );
  });

  test('reports a usable 2D scene when perspective is unsupported', async () => {
    mocks.mountStackScene.mockReturnValue({ ...sceneHandle, supportsPerspective: false });
    renderCanvas();
    await waitFor(() => expect(onSceneStatusChange).toHaveBeenLastCalledWith('flat'));
    expect(screen.getByTestId('stack-canvas')).toBeVisible();
  });

  test('disposes the scene and reports it inactive on unmount', async () => {
    const { unmount } = renderCanvas();
    await waitFor(async () =>
      expect(
        await screen.findByTestId('stack-canvas'),
      ).toHaveAttribute('data-stack-scene-ready', 'true'),
    );

    unmount();

    expect(sceneHandle.dispose).toHaveBeenCalledOnce();
    expect(onSceneStatusChange).toHaveBeenLastCalledWith('ready');
  });

  test('falls back to the flat list when scene initialization fails', async () => {
    mocks.mountStackScene.mockImplementation(() => {
      throw new Error('WebGL renderer initialization failed');
    });
    renderCanvas();

    await waitFor(() =>
      expect(onSceneStatusChange).toHaveBeenLastCalledWith('fallback'),
    );
    expect(screen.queryByTestId('stack-canvas')).not.toBeInTheDocument();
  });

  test('disposes the scene and falls back when its WebGL context is lost', async () => {
    renderCanvas();
    const canvas = await screen.findByTestId('stack-canvas');
    await waitFor(() =>
      expect(canvas).toHaveAttribute('data-stack-scene-ready', 'true'),
    );

    act(() => {
      canvas.dispatchEvent(new Event('webglcontextlost'));
    });

    await waitFor(() => expect(onSceneStatusChange).toHaveBeenLastCalledWith('fallback'));
    expect(sceneHandle.dispose).toHaveBeenCalledOnce();
    expect(screen.queryByTestId('stack-canvas')).not.toBeInTheDocument();
  });
});
