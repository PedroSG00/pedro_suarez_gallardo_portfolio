import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import type { ComponentProps } from 'react';
import enMessages from '../../../../messages/en.json';
import { STACK_TECHNOLOGIES } from '@/content/stack';
import StackCanvas from './StackCanvas';

const mocks = vi.hoisted(() => ({
  detectWebGL: vi.fn<() => boolean>(),
  mountStackScene: vi.fn(),
}));

vi.mock('@/lib/stack/stack-capabilities', () => ({
  hasWebGLSupport: mocks.detectWebGL,
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
const onSceneStatusChange = vi.fn();
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
      filter="all"
      selectedId={null}
      onSelect={onSelect}
      onReceive={onReceive}
      onZoom={onZoom}
      onSceneStatusChange={onSceneStatusChange}
      {...props}
    />,
  );
}

describe('StackCanvas', () => {
  beforeEach(() => {
    mocks.detectWebGL.mockReset();
    mocks.mountStackScene.mockReset();
    sceneHandle.update.mockReset();
    sceneHandle.dispose.mockReset();
    onSelect.mockReset();
    onReceive.mockReset();
    onSceneStatusChange.mockReset();
    mocks.mountStackScene.mockReturnValue(sceneHandle);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('keeps the canvas and its controls absent when WebGL is unavailable', async () => {
    mocks.detectWebGL.mockReturnValue(false);
    renderCanvas();

    await waitFor(() => expect(mocks.detectWebGL).toHaveBeenCalledOnce());
    expect(screen.queryByTestId('stack-canvas')).not.toBeInTheDocument();
    expect(mocks.mountStackScene).not.toHaveBeenCalled();
    expect(onSceneStatusChange).toHaveBeenLastCalledWith('fallback');
  });

  test('mounts an aria-hidden canvas with the complete localized card registry', async () => {
    mocks.detectWebGL.mockReturnValue(true);
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

    await waitFor(() => expect(mocks.mountStackScene).toHaveBeenCalledOnce());
    expect(mocks.mountStackScene.mock.calls[0]?.[1]).toMatchObject({
      technologies,
      filter: 'all',
      selectedId: null,
    });
    expect(onSceneStatusChange).toHaveBeenLastCalledWith('ready');
  });

  test('forwards canvas selection and drops and updates filter and selected state', async () => {
    mocks.detectWebGL.mockReturnValue(true);
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
        filter="frontend"
        selectedId="react"
        onSelect={onSelect}
        onReceive={onReceive}
        onZoom={onZoom}
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
      }),
    );
  });

  test('reports a usable 2D scene when perspective is unsupported', async () => {
    mocks.detectWebGL.mockReturnValue(true);
    mocks.mountStackScene.mockReturnValue({ ...sceneHandle, supportsPerspective: false });
    renderCanvas();
    await waitFor(() => expect(onSceneStatusChange).toHaveBeenLastCalledWith('flat'));
    expect(screen.getByTestId('stack-canvas')).toBeVisible();
  });

  test('disposes the scene and reports it inactive on unmount', async () => {
    mocks.detectWebGL.mockReturnValue(true);
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
    mocks.detectWebGL.mockReturnValue(true);
    mocks.mountStackScene.mockImplementation(() => {
      throw new Error('WebGL renderer initialization failed');
    });
    renderCanvas();

    await waitFor(() =>
      expect(onSceneStatusChange).toHaveBeenLastCalledWith('fallback'),
    );
    expect(screen.queryByTestId('stack-canvas')).not.toBeInTheDocument();
  });
});
