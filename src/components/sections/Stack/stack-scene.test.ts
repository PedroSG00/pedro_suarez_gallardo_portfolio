import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest';
import { waitFor } from '@testing-library/react';
import { STACK_TECHNOLOGIES } from '@/content/stack';
import { mountStackScene } from './stack-scene';

const three = vi.hoisted(() => {
  const state = {
    scene: null as FakeScene | null,
    renderer: null as FakeRenderer | null,
    raycaster: null as FakeRaycaster | null,
    geometries: [] as FakeGeometry[],
    materials: [] as FakeMaterial[],
    textures: [] as FakeTexture[],
    loadedMarks: [] as string[],
    drawnMarks: [] as unknown[],
    drawnNames: [] as string[],
    intersections: [] as { object: FakeMesh }[],
    frameCallbacks: [] as FrameRequestCallback[],
    cancelledFrames: [] as number[],
    nextFrameId: 1,
    observer: null as FakeIntersectionObserver | null,
    resizeObserver: null as FakeResizeObserver | null,
    camera: null as FakeCamera | null,
    width: 1200,
    height: 700,
  };

  class FakeVector {
    x = 0;
    y = 0;
    z = 0;

    constructor(x = 0, y = 0, z = 0) {
      this.set(x, y, z);
    }

    set(x: number, y: number, z: number) {
      this.x = x;
      this.y = y;
      this.z = z;
    }

    setScalar(value: number) {
      this.set(value, value, value);
    }

    copy(value: FakeVector) {
      this.set(value.x, value.y, value.z);
    }
  }

  class FakeGeometry {
    disposed = false;
    readonly args: (number | FakeGeometry)[];

    constructor(...args: (number | FakeGeometry)[]) {
      this.args = args;
      state.geometries.push(this);
    }

    dispose() {
      this.disposed = true;
    }

    setFromPoints() {
      return this;
    }
  }

  class FakeMaterial {
    disposed = false;
    color = { set: vi.fn() };
    map?: FakeTexture;

    constructor(public readonly options: Record<string, unknown> = {}) {
      state.materials.push(this);
      this.map = options.map as FakeTexture | undefined;
    }

    dispose() {
      this.disposed = true;
    }
  }

  class FakeTexture {
    disposed = false;
    needsUpdate = false;

    constructor(public readonly image?: unknown) {
      state.textures.push(this);
    }

    dispose() {
      this.disposed = true;
    }
  }

  class FakeMesh {
    position = new FakeVector();
    rotation = new FakeVector();
    scale = new FakeVector();
    userData: Record<string, unknown> = {};
    castShadow = false;
    receiveShadow = false;

    constructor(
      public geometry: FakeGeometry,
      public material: FakeMaterial | FakeMaterial[],
    ) {
      this.scale.set(1, 1, 1);
    }

    add = vi.fn();
  }

  class FakeGrid extends FakeMesh {
    constructor() {
      super(new FakeGeometry(), new FakeMaterial());
    }
  }

  class FakeGroup {
    children: FakeMesh[] = [];
    position = new FakeVector();

    add(...objects: FakeMesh[]) {
      this.children.push(...objects);
    }
  }

  class FakeScene {
    children: (FakeMesh | FakeGroup | FakeLight)[] = [];
    background?: FakeColor;

    constructor() {
      state.scene = this;
    }

    add(...objects: (FakeMesh | FakeGroup | FakeLight)[]) {
      this.children.push(...objects);
    }
  }

  class FakeColor {
    constructor(public readonly value: unknown) {}
  }

  class FakeCamera {
    position = new FakeVector();
    aspect = 1;
    lookAt = vi.fn();
    updateProjectionMatrix = vi.fn();

    constructor(
      public readonly fov: number,
      aspect: number,
      public readonly near: number,
      public readonly far: number,
    ) {
      this.aspect = aspect;
      state.camera = this;
    }
  }

  class FakeLight {
    position = new FakeVector();
    castShadow = false;
    shadow = {
      dispose: vi.fn(),
      mapSize: { set: vi.fn() },
      camera: {
        near: 0,
        far: 0,
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
    };

    constructor(public readonly color: unknown, public readonly intensity: number) {}
  }

  class FakeRenderer {
    shadowMap = { enabled: false };
    render = vi.fn();
    dispose = vi.fn();
    setPixelRatio = vi.fn();
    setSize = vi.fn();

    constructor(public readonly options: Record<string, unknown>) {
      state.renderer = this;
    }
  }

  class FakeRaycaster {
    setFromCamera = vi.fn();

    constructor() {
      state.raycaster = this;
    }

    intersectObjects() {
      return state.intersections;
    }
  }

  class FakeVector2 {
    x = 0;
    y = 0;

    set(x: number, y: number) {
      this.x = x;
      this.y = y;
    }
  }

  class FakeTextureLoader {
    load(url: string, onLoad?: (texture: FakeTexture) => void) {
      state.loadedMarks.push(url);
      const texture = new FakeTexture({ width: 96, height: 96 });
      onLoad?.(texture);
      return texture;
    }
  }

  class FakeIntersectionObserver {
    constructor(
      public readonly callback: (
        entries: { isIntersecting: boolean }[],
      ) => void,
    ) {
      state.observer = this;
    }

    observe = vi.fn();
    disconnect = vi.fn();

    trigger(isIntersecting: boolean) {
      this.callback([{ isIntersecting }]);
    }
  }

  class FakeResizeObserver {
    constructor(public readonly callback: () => void) {
      state.resizeObserver = this;
    }

    observe = vi.fn();
    disconnect = vi.fn();

    trigger() {
      this.callback();
    }
  }

  class FakeCanvasTexture extends FakeTexture {
    constructor(public readonly canvas: HTMLCanvasElement) {
      super(canvas);
    }
  }

  return {
    state,
    FakeVector,
    FakeGeometry,
    FakeMaterial,
    FakeTexture,
    FakeMesh,
    FakeGroup,
    FakeGrid,
    FakeScene,
    FakeColor,
    FakeCamera,
    FakeLight,
    FakeRenderer,
    FakeRaycaster,
    FakeVector2,
    FakeTextureLoader,
    FakeIntersectionObserver,
    FakeResizeObserver,
    FakeCanvasTexture,
  };
});

vi.mock('three', () => ({
  Scene: three.FakeScene,
  Color: three.FakeColor,
  OrthographicCamera: three.FakeCamera,
  PerspectiveCamera: three.FakeCamera,
  WebGLRenderer: three.FakeRenderer,
  Raycaster: three.FakeRaycaster,
  Vector2: three.FakeVector2,
  Group: three.FakeGroup,
  Mesh: three.FakeMesh,
  GridHelper: three.FakeGrid,
  BufferGeometry: three.FakeGeometry,
  EdgesGeometry: three.FakeGeometry,
  LineSegments: three.FakeMesh,
  LineBasicMaterial: three.FakeMaterial,
  BoxGeometry: three.FakeGeometry,
  PlaneGeometry: three.FakeGeometry,
  MeshStandardMaterial: three.FakeMaterial,
  MeshBasicMaterial: three.FakeMaterial,
  ShadowMaterial: three.FakeMaterial,
  AmbientLight: three.FakeLight,
  DirectionalLight: three.FakeLight,
  TextureLoader: three.FakeTextureLoader,
  CanvasTexture: three.FakeCanvasTexture,
  Vector3: three.FakeVector,
  SRGBColorSpace: 'srgb',
  PCFSoftShadowMap: 'pcf-soft',
  DoubleSide: 2,
}));

const technologies = STACK_TECHNOLOGIES.map((technology) => ({
  ...technology,
  name: `Name: ${technology.id}`,
  categoryLabel: `Category: ${technology.category}`,
}));

const drawing = {
  clearRect: vi.fn(),
  drawImage: vi.fn((image: unknown) => {
    if ((image as { width?: number }).width === 96) {
      three.state.drawnMarks.push(image);
    }
  }),
  fillRect: vi.fn(),
  getImageData: vi.fn(() => ({ data: Uint8ClampedArray.of(20, 20, 20, 255, 255, 255, 255, 255) })),
  putImageData: vi.fn(),
  strokeRect: vi.fn(),
  fillText: vi.fn((name: string) => {
    if (name.startsWith('Name:') && !three.state.drawnNames.includes(name)) {
      three.state.drawnNames.push(name);
    }
  }),
  save: vi.fn(),
  restore: vi.fn(),
};
const originalMatchMedia = Object.getOwnPropertyDescriptor(window, 'matchMedia');
const originalVisibilityState = Object.getOwnPropertyDescriptor(
  document,
  'visibilityState',
);
const originalTheme = document.documentElement.getAttribute('data-theme');

function makeCanvas() {
  const canvas = document.createElement('canvas');
  Object.defineProperty(canvas, 'getBoundingClientRect', {
    value: () => ({
      left: 0,
      top: 0,
      width: three.state.width,
      height: three.state.height,
      right: three.state.width,
      bottom: three.state.height,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }),
  });
  return canvas;
}

function resetThree() {
  three.state.scene = null;
  three.state.renderer = null;
  three.state.raycaster = null;
  three.state.geometries.length = 0;
  three.state.materials.length = 0;
  three.state.textures.length = 0;
  three.state.loadedMarks.length = 0;
  three.state.drawnMarks.length = 0;
  three.state.drawnNames.length = 0;
  three.state.intersections.length = 0;
  three.state.frameCallbacks.length = 0;
  three.state.cancelledFrames.length = 0;
  three.state.nextFrameId = 1;
  three.state.observer = null;
  three.state.resizeObserver = null;
  three.state.camera = null;
  three.state.width = 1200;
  three.state.height = 700;
  drawing.clearRect.mockClear();
  drawing.drawImage.mockClear();
  drawing.fillRect.mockClear();
  drawing.putImageData.mockClear();
  drawing.fillText.mockClear();
  drawing.save.mockClear();
  drawing.restore.mockClear();
}

function setMotionPreference(reducedMotion: boolean) {
  const changeListeners = new Set<(event: MediaQueryListEvent) => void>();
  const mediaQuery = {
    matches: reducedMotion,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) =>
      changeListeners.add(listener),
    removeEventListener: (
      _type: string,
      listener: (event: MediaQueryListEvent) => void,
    ) => changeListeners.delete(listener),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList;

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn(() => mediaQuery),
  });

  return {
    mediaQuery,
    setReducedMotion(value: boolean) {
      Object.defineProperty(mediaQuery, 'matches', { value, configurable: true });
      for (const listener of changeListeners) {
        listener({ matches: value } as MediaQueryListEvent);
      }
    },
    listenerCount: () => changeListeners.size,
  };
}

function mountScene(
  canvas: HTMLCanvasElement,
  options: Partial<Parameters<typeof mountStackScene>[1]> = {},
) {
  return mountStackScene(canvas, {
    technologies,
    mode: '2d',
    filter: 'all',
    selectedId: null,
    onSelect: vi.fn(),
    ...options,
  });
}

describe('mountStackScene', () => {
  beforeEach(() => {
    resetThree();
    vi.stubGlobal(
      'requestAnimationFrame',
      (callback: FrameRequestCallback) => {
        const id = three.state.nextFrameId++;
        three.state.frameCallbacks.push(callback);
        return id;
      },
    );
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      three.state.cancelledFrames.push(id);
    });
    vi.stubGlobal(
      'IntersectionObserver',
      three.FakeIntersectionObserver,
    );
    vi.stubGlobal(
      'ResizeObserver',
      three.FakeResizeObserver,
    );
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
      ((type: string) => (type === '2d' ? drawing : null)) as typeof HTMLCanvasElement.prototype.getContext,
    );
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible',
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    if (originalMatchMedia) {
      Object.defineProperty(window, 'matchMedia', originalMatchMedia);
    } else {
      Reflect.deleteProperty(window, 'matchMedia');
    }
    if (originalVisibilityState) {
      Object.defineProperty(
        document,
        'visibilityState',
        originalVisibilityState,
      );
    }
    if (originalTheme === null) {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', originalTheme);
    }
  });

  test('builds a lit volumetric stage with a textured branded face for every card', () => {
    setMotionPreference(true);
    const canvas = makeCanvas();
    const handle = mountScene(canvas);
    const cardMeshes = three.state.scene?.children
      .flatMap((child) =>
        // Scene object traversal is the rendering contract under test, not DOM access.
        // eslint-disable-next-line testing-library/no-node-access
        child instanceof three.FakeGroup ? child.children : [],
      )
      .filter((mesh) => typeof mesh.userData.technologyId === 'string');

    expect(three.state.renderer?.options).toMatchObject({
      canvas,
      alpha: true,
      antialias: true,
    });
    expect(cardMeshes).toHaveLength(STACK_TECHNOLOGIES.length);
    expect(three.state.loadedMarks).toEqual(
      technologies.map((technology) => technology.brandMark),
    );
    expect(three.state.drawnMarks).toHaveLength(STACK_TECHNOLOGIES.length);
    expect(three.state.drawnNames).toEqual(
      technologies.map((technology) => technology.name),
    );

    for (const mesh of cardMeshes ?? []) {
      expect(mesh.geometry.args[2]).toBeGreaterThan(0);
      expect(Array.isArray(mesh.material)).toBe(true);
      const face = (
        mesh.material as InstanceType<typeof three.FakeMaterial>[]
      )[4];
      expect(face.map).toBeInstanceOf(three.FakeCanvasTexture);
      expect(mesh.castShadow).toBe(true);
      expect(mesh.receiveShadow).toBe(true);
    }

    expect(three.state.scene?.children.some(
      (child) => child instanceof three.FakeLight,
    )).toBe(true);
    expect(three.state.renderer?.shadowMap.enabled).toBe(true);
    expect(three.state.renderer?.render).toHaveBeenCalled();
    expect(three.state.frameCallbacks).toHaveLength(0);
    handle.dispose();
  });

  test('gives React and TypeScript larger visual priority while keeping every card', () => {
    setMotionPreference(true);
    const handle = mountScene(makeCanvas());

    const cardMeshes = three.state.scene?.children
      .flatMap((child) =>
        // Scene object traversal is the rendering contract under test, not DOM access.
        // eslint-disable-next-line testing-library/no-node-access
        child instanceof three.FakeGroup ? child.children : [],
      )
      .filter((mesh) => typeof mesh.userData.technologyId === 'string');
    const featured = cardMeshes?.filter((mesh) => mesh.userData.featured === true);
    const regular = cardMeshes?.find((mesh) => mesh.userData.featured === false);

    expect(featured).toHaveLength(2);
    expect(featured?.map((mesh) => mesh.userData.technologyId)).toEqual(
      expect.arrayContaining(['react', 'typescript']),
    );
    expect(featured?.every((mesh) => mesh.scale.x > (regular?.scale.x ?? 1))).toBe(
      true,
    );
    handle.dispose();
  });

  test('preserves white knockouts inside monochrome brand marks', () => {
    setMotionPreference(true);
    const handle = mountScene(makeCanvas());

    expect(drawing.putImageData).toHaveBeenCalledWith(
      { data: Uint8ClampedArray.of(20, 20, 20, 255, 255, 255, 255, 0) },
      0,
      0,
    );
    handle.dispose();
  });

  test('resizes the perspective layout for a narrow viewport', () => {
    setMotionPreference(true);
    const canvas = makeCanvas();
    const handle = mountScene(canvas);

    three.state.width = 350;
    three.state.height = 720;
    three.state.resizeObserver?.trigger();

    expect(three.state.renderer?.setSize).toHaveBeenLastCalledWith(
      350,
      720,
      false,
    );
    expect(three.state.camera?.aspect).toBeCloseTo(350 / 720);
    expect(three.state.camera?.position.z).toBeGreaterThan(15);
    expect(three.state.camera?.updateProjectionMatrix).toHaveBeenCalled();
    handle.dispose();
  });

  test('switches projections on the same stage without rebuilding cards or moving the occupied slot', () => {
    setMotionPreference(true);
    const selection = { technologies, filter: 'all', selectedId: 'react', onSelect: vi.fn() } as const;
    const handle = mountScene(makeCanvas(), selection);
    const { render: draw } = three.state.renderer ?? {};
    const scene = three.state.scene;
    const flatCamera = draw?.mock.lastCall?.[1];
    const cardMeshes = three.state.scene?.children
      .flatMap((child) =>
        // eslint-disable-next-line testing-library/no-node-access -- Three.js scene graph, not DOM.
        child instanceof three.FakeGroup ? child.children : [],
      )
      .filter((mesh) => typeof mesh.userData.technologyId === 'string');
    expect(cardMeshes).toHaveLength(technologies.length);
    const initialPositions = cardMeshes?.map(({ position }) => ({ ...position }));

    handle.update({ ...selection, mode: '3d' });
    const spatialCamera = draw?.mock.lastCall?.[1];
    expect(spatialCamera).not.toBe(flatCamera);
    expect(draw).toHaveBeenLastCalledWith(scene, spatialCamera);
    expect(three.state.loadedMarks).toHaveLength(technologies.length);
    expect(cardMeshes?.map(({ position }) => ({ ...position }))).toEqual(initialPositions);

    handle.update({ ...selection, mode: '2d' });
    expect(draw).toHaveBeenLastCalledWith(scene, flatCamera);
    handle.dispose();
  });

  test('selects enabled cards by raycasting and ignores cards outside the active filter', () => {
    setMotionPreference(true);
    const onSelect = vi.fn();
    const handle = mountScene(makeCanvas(), { onSelect });
    const cardMeshes = three.state.scene?.children
      .flatMap((child) =>
        // Scene object traversal is the rendering contract under test, not DOM access.
        // eslint-disable-next-line testing-library/no-node-access
        child instanceof three.FakeGroup ? child.children : [],
      )
      .filter((mesh) => typeof mesh.userData.technologyId === 'string');
    const react = cardMeshes?.find((mesh) => mesh.userData.technologyId === 'react');
    const node = cardMeshes?.find((mesh) => mesh.userData.technologyId === 'nodeJs');

    if (!react || !node) throw new Error('Expected technology cards in the scene');

    three.state.intersections = [{ object: react }];
    canvasClick();
    expect(onSelect).toHaveBeenCalledWith('react');
    expect(three.state.raycaster?.setFromCamera).toHaveBeenCalled();

    handle.update({
      technologies,
      mode: '2d',
      filter: 'frontend',
      selectedId: null,
      onSelect,
    });
    three.state.intersections = [{ object: node }];
    canvasClick();
    expect(onSelect).toHaveBeenCalledTimes(1);
    handle.dispose();
  });

  test('moves the selected card into the slot and restores it when selection clears', () => {
    setMotionPreference(true);
    const handle = mountScene(makeCanvas());
    const cardMeshes = three.state.scene?.children
      .flatMap((child) =>
        // Scene object traversal is the rendering contract under test, not DOM access.
        // eslint-disable-next-line testing-library/no-node-access
        child instanceof three.FakeGroup ? child.children : [],
      )
      .filter((mesh) => typeof mesh.userData.technologyId === 'string');
    const react = cardMeshes?.find((mesh) => mesh.userData.technologyId === 'react');
    if (!react) throw new Error('React card is missing');
    const originalPosition = { ...react.position };

    handle.update({
      technologies,
      mode: '2d',
      filter: 'all',
      selectedId: 'react',
      onSelect: vi.fn(),
    });
    expect(react.userData.inSlot).toBe(true);
    expect(react.position).toMatchObject({ x: 0, y: 0 });

    handle.update({
      technologies,
      mode: '2d',
      filter: 'all',
      selectedId: null,
      onSelect: vi.fn(),
    });
    expect(react.userData.inSlot).toBe(false);
    expect(react.position.y).toBe(originalPosition.y);
    handle.dispose();
  });

  test('pauses ambient frames for reduced motion, invisibility, and inactive tabs', () => {
    const preference = setMotionPreference(true);
    const canvas = makeCanvas();
    const handle = mountScene(canvas);
    expect(three.state.frameCallbacks).toHaveLength(0);

    preference.setReducedMotion(false);
    expect(three.state.frameCallbacks).toHaveLength(1);
    three.state.observer?.trigger(false);
    expect(three.state.cancelledFrames).toContain(1);

    three.state.observer?.trigger(true);
    expect(three.state.frameCallbacks).toHaveLength(2);
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'hidden',
    });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(three.state.cancelledFrames).toContain(2);

    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible',
    });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(three.state.frameCallbacks).toHaveLength(3);
    handle.dispose();
    expect(preference.listenerCount()).toBe(0);
    expect(three.state.observer?.disconnect).toHaveBeenCalledOnce();
  });

  test('refreshes card and stage colors when the active theme changes', async () => {
    const preference = setMotionPreference(true);
    vi.spyOn(window, 'getComputedStyle').mockImplementation((element) => {
      const token = (element as HTMLElement).style.color;
      const isDark = document.documentElement.dataset.theme === 'dark';
      const color = token.includes('surface')
        ? isDark
          ? 'rgb(18, 17, 16)'
          : 'rgb(242, 239, 230)'
        : token.includes('muted')
          ? isDark
            ? 'rgb(169, 164, 154)'
            : 'rgb(90, 87, 79)'
          : isDark
            ? 'rgb(242, 239, 230)'
            : 'rgb(18, 17, 16)';
      return { color } as CSSStyleDeclaration;
    });
    const handle = mountScene(makeCanvas());
    const previousDrawCount = drawing.fillRect.mock.calls.length;
    document.documentElement.dataset.theme = 'dark';

    await waitFor(() =>
      expect(drawing.fillRect.mock.calls.length).toBeGreaterThan(
        previousDrawCount,
      ),
    );
    expect(
      three.state.materials.some(
        (material) => material.color.set.mock.calls.length > 0,
      ),
    ).toBe(true);

    handle.dispose();
    expect(preference.listenerCount()).toBe(0);
  });

  test('disposes renderer, geometry, materials, textures, and event observers', () => {
    setMotionPreference(true);
    const handle = mountScene(makeCanvas());
    handle.dispose();

    expect(three.state.renderer?.dispose).toHaveBeenCalledOnce();
    expect(three.state.geometries.length).toBeGreaterThan(0);
    expect(three.state.geometries.every((geometry) => geometry.disposed)).toBe(
      true,
    );
    expect(three.state.materials.every((material) => material.disposed)).toBe(
      true,
    );
    expect(three.state.textures.every((texture) => texture.disposed)).toBe(true);
    expect(three.state.observer?.disconnect).toHaveBeenCalledOnce();
  });
});

function canvasClick() {
  const canvas = three.state.renderer?.options.canvas as HTMLCanvasElement;
  canvas.dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      clientX: 600,
      clientY: 350,
    }),
  );
}
