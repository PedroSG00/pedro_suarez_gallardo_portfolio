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
import {
  STACK_CARD_HEIGHT,
  STACK_CARD_WIDTH,
  layoutStackCards,
} from '@/lib/stack/stack-scene-layout';
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
      return this;
    }

    project() {
      return this;
    }
  }

  class FakeGeometry {
    disposed = false;
    readonly args: (number | FakeGeometry)[];
    points: { x: number; y: number; z: number }[] = [];

    constructor(...args: (number | FakeGeometry)[]) {
      this.args = args;
      state.geometries.push(this);
    }

    dispose() {
      this.disposed = true;
    }

    setFromPoints(points: FakeVector[]) {
      if (this.points.length === 0) {
        this.points = points.map(({ x, y, z }) => ({ x, y, z }));
      } else {
        for (const [index, { x, y, z }] of points.entries()) {
          if (index >= this.points.length) break;
          this.points[index] = { x, y, z };
        }
      }
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
    zoom = 1;
    lookAt = vi.fn();
    updateProjectionMatrix = vi.fn();
    updateMatrixWorld = vi.fn();

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
    getContext = () => ({ getContextAttributes: () => ({ depth: true }) });

    constructor(public readonly options: Record<string, unknown>) {
      state.renderer = this;
    }
  }

  class FakeRaycaster {
    setFromCamera = vi.fn();
    ray = { intersectPlane: vi.fn(() => new FakeVector()) };

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
      return this;
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

    trigger(...intersections: boolean[]) {
      this.callback(intersections.map((isIntersecting) => ({ isIntersecting })));
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
  Plane: class {
    constant = 0;
  },
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
const originalDevicePixelRatio = Object.getOwnPropertyDescriptor(window, 'devicePixelRatio');
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

const zoomInput = {
  zoom: 100,
  yaw: 0,
  pitch: 0,
  onZoom: vi.fn(),
  onRotate: vi.fn(),
};

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
    onReceive: vi.fn(),
    ...zoomInput,
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
    if (originalDevicePixelRatio) {
      Object.defineProperty(window, 'devicePixelRatio', originalDevicePixelRatio);
    } else {
      Reflect.deleteProperty(window, 'devicePixelRatio');
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

  test('keeps mobile cards above the 3D floor when dragged to the lower edge', () => {
    setMotionPreference(true);
    three.state.width = 350;
    three.state.height = 720;
    const canvas = makeCanvas();
    const handle = mountScene(canvas, { mode: '3d' });
    const { viewHeight } = layoutStackCards(technologies, 350 / 720);
    const scene = three.state.scene;
    const floor = scene?.children.find((child) =>
      child instanceof three.FakeGroup &&
      child.children.some((mesh) => mesh instanceof three.FakeGrid),
    );
    const cardGroup = scene?.children.find((child) =>
      child instanceof three.FakeGroup &&
      child.children.some((mesh) => typeof mesh.userData.technologyId === 'string'),
    );
    if (!(floor instanceof three.FakeGroup) || !(cardGroup instanceof three.FakeGroup)) {
      throw new Error('Expected the 3D floor and technology cards');
    }
    const cards = cardGroup.children.filter((mesh) => typeof mesh.userData.technologyId === 'string');
    const bottomCard = cards.reduce((lowest, card) =>
      card.position.y < lowest.position.y ? card : lowest,
    );
    const expectAboveFloor = () => {
      const lowestCardEdge = Math.min(...cards.map(
        (card) => card.position.y - STACK_CARD_HEIGHT * card.scale.y / 2,
      ));
      expect(lowestCardEdge).toBeGreaterThan(floor.position.y);
    };
    three.state.intersections = [{ object: bottomCard }];
    const intersectPlane = three.state.raycaster?.ray.intersectPlane;
    intersectPlane?.mockReturnValueOnce(
      new three.FakeVector(bottomCard.position.x, bottomCard.position.y, 0),
    );
    intersectPlane?.mockReturnValue(
      new three.FakeVector(bottomCard.position.x, -100, 0),
    );
    for (const [type, clientY] of [['pointerdown', 100], ['pointermove', 180]] as const) {
      canvas.dispatchEvent(new PointerEvent(type, {
        bubbles: true,
        button: 0,
        pointerId: 7,
        pointerType: 'touch',
        isPrimary: true,
        clientX: 100,
        clientY,
      }));
    }

    expectAboveFloor();
    expect(bottomCard.position.y).toBeLessThan(-viewHeight / 2 + STACK_CARD_HEIGHT);
    three.state.width = 320;
    three.state.height = 912;
    three.state.resizeObserver?.trigger();
    expectAboveFloor();
    handle.dispose();
  });

  test('switches projections on the same stage without rebuilding cards or moving the occupied slot', () => {
    setMotionPreference(true);
    const selection = {
      technologies, filter: 'all', selectedId: 'react', onSelect: vi.fn(), onReceive: vi.fn(),
      ...zoomInput,
    } as const;
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

  test('consumes vertical wheel for 3D only and leaves browser gestures alone', () => {
    setMotionPreference(true);
    const canvas = makeCanvas();
    const onZoom = vi.fn();
    const options = {
      technologies,
      filter: 'all',
      selectedId: null,
      ...zoomInput,
      onSelect: vi.fn(),
      onReceive: vi.fn(),
      onZoom,
    } as const;
    const handle = mountScene(canvas, options);
    const wheel = (input: WheelEventInit) =>
      canvas.dispatchEvent(new WheelEvent('wheel', { cancelable: true, ...input }));

    expect(wheel({ deltaY: 20 })).toBe(true);
    handle.update({ ...options, mode: '3d' });
    expect(wheel({ deltaY: -20, ctrlKey: true })).toBe(true);
    expect(wheel({ deltaX: 30, deltaY: 5 })).toBe(true);
    expect(wheel({ deltaY: -20 })).toBe(false);
    expect(wheel({ deltaY: 20 })).toBe(false);
    handle.update({ ...options, mode: '2d' });
    expect(wheel({ deltaY: 20 })).toBe(true);
    handle.update({ ...options, mode: '3d' });
    handle.dispose();
    expect(wheel({ deltaY: 20 })).toBe(true);
    expect(onZoom.mock.calls).toEqual([['in'], ['out']]);
  });

  test('rotates the 3D camera by dragging the background in both axes', () => {
    setMotionPreference(true);
    const canvas = makeCanvas();
    const onRotate = vi.fn();
    const options = {
      technologies,
      filter: 'all',
      selectedId: null,
      ...zoomInput,
      onSelect: vi.fn(),
      onReceive: vi.fn(),
      onRotate,
    } as const;
    const handle = mountScene(canvas, options);
    handle.update({ ...options, mode: '3d' });
    const camera = three.state.camera;
    if (!camera) throw new Error('Expected a perspective camera');
    const initialPosition = { ...camera.position };

    pointerDrag(canvas, 'mouse', 7, { x: 600, y: 350 }, { x: 660, y: 290 });

    expect(Number(canvas.dataset.stackCameraYaw)).toBeGreaterThan(0);
    expect(Number(canvas.dataset.stackCameraPitch)).toBeGreaterThan(0);
    expect(camera.position).not.toEqual(initialPosition);
    expect(onRotate).toHaveBeenLastCalledWith({
      yaw: Number(canvas.dataset.stackCameraYaw),
      pitch: Number(canvas.dataset.stackCameraPitch),
    });
    handle.dispose();
  });

  test('starts background dragging from the visible camera pose during a control turn', () => {
    setMotionPreference(false);
    const canvas = makeCanvas();
    canvas.style.setProperty('--duration-state', '400ms');
    const initial = {
      technologies,
      mode: '3d' as const,
      filter: 'all' as const,
      selectedId: null,
      onSelect: vi.fn(),
      onReceive: vi.fn(),
      ...zoomInput,
    };
    const handle = mountScene(canvas, initial);
    handle.update({ ...initial, yaw: 10 });
    three.state.observer?.trigger(true);
    three.state.frameCallbacks.at(-1)?.(100);
    three.state.frameCallbacks.at(-1)?.(117);
    const visibleYaw = Number(canvas.dataset.stackCameraYaw);

    pointerDrag(canvas, 'mouse', 10, { x: 600, y: 350 }, { x: 660, y: 350 });

    expect(Number(canvas.dataset.stackCameraYaw)).toBeCloseTo(visibleYaw + 10.8, 2);
    handle.dispose();
  });

  test('does not rotate while dragging a card or when a touch gesture starts on the background', () => {
    setMotionPreference(true);
    const canvas = makeCanvas();
    const onRotate = vi.fn();
    const handle = mountScene(canvas, { ...zoomInput, mode: '3d', onRotate });
    const card = three.state.scene?.children
      .flatMap((child) =>
        // eslint-disable-next-line testing-library/no-node-access -- Three.js scene graph.
        child instanceof three.FakeGroup ? child.children : [],
      )
      .find((mesh) => mesh.userData.technologyId === 'react');
    if (!card) throw new Error('Expected the React card in the scene');

    three.state.intersections = [{ object: card }];
    pointerDrag(canvas, 'mouse', 8, { x: 600, y: 350 }, { x: 660, y: 290 });
    expect(onRotate).not.toHaveBeenCalled();

    three.state.intersections = [];
    const initialYaw = canvas.dataset.stackCameraYaw;
    const initialPitch = canvas.dataset.stackCameraPitch;
    pointerDrag(canvas, 'touch', 9, { x: 600, y: 350 }, { x: 660, y: 290 });
    expect(canvas.dataset.stackCameraYaw).toBe(initialYaw);
    expect(canvas.dataset.stackCameraPitch).toBe(initialPitch);
    expect(onRotate).not.toHaveBeenCalled();
    handle.dispose();
  });

  test('keeps camera orientation fixed during ambient card motion', () => {
    setMotionPreference(false);
    const canvas = makeCanvas();
    const handle = mountScene(canvas, { ...zoomInput, mode: '3d' });
    const initial = {
      yaw: canvas.dataset.stackCameraYaw,
      pitch: canvas.dataset.stackCameraPitch,
    };
    three.state.observer?.trigger(true);
    three.state.frameCallbacks.at(-1)?.(100);
    three.state.frameCallbacks.at(-1)?.(140);

    expect(canvas.dataset.stackCameraYaw).toBe(initial.yaw);
    expect(canvas.dataset.stackCameraPitch).toBe(initial.pitch);
    handle.dispose();
  });

  test('smooths zoom and rotation updates from controls and resumes from the visible pose', () => {
    setMotionPreference(false);
    const canvas = makeCanvas();
    canvas.style.setProperty('--duration-state', '400ms');
    const initial = {
      technologies,
      mode: '3d' as const,
      filter: 'all' as const,
      selectedId: null,
      onSelect: vi.fn(),
      onReceive: vi.fn(),
      ...zoomInput,
    };
    const handle = mountScene(canvas, initial);
    const readPose = () => ({
      zoom: Number(canvas.dataset.stackCameraZoom),
      yaw: Number(canvas.dataset.stackCameraYaw),
      pitch: Number(canvas.dataset.stackCameraPitch),
    });

    handle.update({ ...initial, zoom: 110, yaw: 10, pitch: 10 });
    expect(readPose()).toEqual({ zoom: 100, yaw: 0, pitch: 0 });
    three.state.observer?.trigger(true);
    const frame = (time: number) => three.state.frameCallbacks.at(-1)?.(time);
    frame(100);
    frame(117);
    const inFlight = readPose();
    expect(inFlight.zoom).toBeGreaterThan(100);
    expect(inFlight.zoom).toBeLessThan(110);
    expect(inFlight.yaw).toBeGreaterThan(0);
    expect(inFlight.yaw).toBeLessThan(10);

    handle.update({ ...initial, zoom: 120, yaw: 20, pitch: 15 });
    expect(readPose()).toEqual(inFlight);
    for (let time = 134; time <= 600; time += 17) frame(time);

    expect(readPose()).toEqual({ zoom: 120, yaw: 20, pitch: 15 });
    handle.dispose();
  });

  test('applies camera control updates immediately with reduced motion', () => {
    setMotionPreference(true);
    const canvas = makeCanvas();
    canvas.style.setProperty('--duration-state', '400ms');
    const initial = {
      technologies,
      mode: '3d' as const,
      filter: 'all' as const,
      selectedId: null,
      onSelect: vi.fn(),
      onReceive: vi.fn(),
      ...zoomInput,
    };
    const handle = mountScene(canvas, initial);

    handle.update({ ...initial, zoom: 105, yaw: 5, pitch: 5 });

    expect(canvas.dataset.stackCameraZoom).toBe('105');
    expect(canvas.dataset.stackCameraYaw).toBe('5');
    expect(canvas.dataset.stackCameraPitch).toBe('5');
    expect(three.state.frameCallbacks).toHaveLength(0);
    handle.dispose();
  });

  test('updates visible ambient movement at a 60 fps cadence', () => {
    setMotionPreference(false);
    const handle = mountScene(makeCanvas());
    const cards = three.state.scene?.children
      .flatMap((child) =>
        // eslint-disable-next-line testing-library/no-node-access -- Three.js scene graph, not DOM.
        child instanceof three.FakeGroup ? child.children : [],
      )
      .filter((mesh) => typeof mesh.userData.technologyId === 'string') ?? [];
    const rest = cards.map(({ position }) => ({ x: position.x, y: position.y }));
    three.state.observer?.trigger(true);

    three.state.frameCallbacks.at(-1)?.(100);
    three.state.frameCallbacks.at(-1)?.(117);

    expect(cards.map(({ position }) => ({ x: position.x, y: position.y }))).not.toEqual(rest);
    handle.dispose();
  });

  test('starts the ambient loop when a visible entry follows an offscreen entry', () => {
    setMotionPreference(false);
    const handle = mountScene(makeCanvas());
    three.state.observer?.trigger(false, true);

    expect(three.state.frameCallbacks).toHaveLength(1);
    handle.dispose();
  });

  test.each(['on the workbench', 'over the slot'])('keeps a held card steady %s while its neighbors move', (position) => {
    setMotionPreference(false);
    const canvas = makeCanvas();
    const handle = mountScene(canvas);
    const cards = three.state.scene?.children
      // eslint-disable-next-line testing-library/no-node-access -- Three.js scene graph.
      .flatMap((child) => child instanceof three.FakeGroup ? child.children : [])
      .filter((mesh) => typeof mesh.userData.technologyId === 'string') ?? [];
    const held = cards.find((mesh) => mesh.userData.technologyId === 'react');
    const neighbor = cards.find((mesh) => mesh.userData.technologyId === 'typescript');
    if (!held || !neighbor) throw new Error('Expected React and TypeScript cards');
    three.state.intersections = [{ object: held }];
    const intersect = three.state.raycaster?.ray.intersectPlane;
    if (position === 'over the slot') {
      const start = new three.FakeVector(held.position.x, held.position.y, held.position.z);
      intersect?.mockReturnValueOnce(start);
    } else {
      intersect?.mockReturnValueOnce(new three.FakeVector())
        .mockReturnValueOnce(new three.FakeVector())
        .mockReturnValueOnce(new three.FakeVector(10, 0, 0));
    }
    canvas.dispatchEvent(new PointerEvent('pointerdown', {
      button: 0, pointerId: 1, pointerType: 'mouse', isPrimary: true,
      clientX: 600, clientY: 350,
    }));
    canvas.dispatchEvent(new PointerEvent('pointermove', {
      pointerId: 1, pointerType: 'mouse', isPrimary: true,
      clientX: 620, clientY: 350,
    }));
    expect(canvas.dataset.stackDragging).toBe('true');
    expect(canvas.dataset.stackDropActive).toBe(String(position === 'over the slot'));
    const heldPosition = { x: held.position.x, y: held.position.y };
    const neighborPosition = { x: neighbor.position.x, y: neighbor.position.y };
    three.state.observer?.trigger(true);
    three.state.frameCallbacks.at(-1)?.(100);
    three.state.frameCallbacks.at(-1)?.(117);
    expect(held.position).toMatchObject(heldPosition);
    expect(neighbor.position).not.toEqual(neighborPosition);
    handle.dispose();
  });

  test('keeps category traces in front of card centers and updates them with ambient movement', () => {
    setMotionPreference(false);
    const handle = mountScene(makeCanvas());
    const scene = three.state.scene;
    const connections = scene?.children.find(
      (child) => child instanceof three.FakeMesh && child.geometry.points.length > 0,
    );
    if (!(connections instanceof three.FakeMesh)) {
      throw new Error('Expected category connection geometry');
    }
    const cards = scene?.children
      .flatMap((child) =>
        // eslint-disable-next-line testing-library/no-node-access -- Three.js scene graph, not DOM.
        child instanceof three.FakeGroup ? child.children : [],
      )
      .filter((mesh) => typeof mesh.userData.technologyId === 'string') ?? [];
    const before = connections.geometry.points.map(({ x, y, z }) => ({ x, y, z }));
    for (const point of before) {
      const nearest = cards.reduce((closest, card) =>
        Math.hypot(point.x - card.position.x, point.y - card.position.y)
        < Math.hypot(point.x - closest.position.x, point.y - closest.position.y)
          ? card
          : closest,
      );
      expect(point.z).toBeGreaterThan(nearest.position.z);
      const horizontalEdgeDistance = Math.abs(point.x - nearest.position.x) /
        (STACK_CARD_WIDTH * nearest.scale.x / 2);
      const verticalEdgeDistance = Math.abs(point.y - nearest.position.y) /
        (STACK_CARD_HEIGHT * nearest.scale.y / 2);
      expect(Math.max(horizontalEdgeDistance, verticalEdgeDistance)).toBeCloseTo(1, 1);
    }
    three.state.observer?.trigger(true);
    three.state.frameCallbacks.at(-1)?.(100);
    three.state.frameCallbacks.at(-1)?.(117);

    expect(connections.geometry.points).not.toEqual(before);
    handle.dispose();
  });

  test('rebuilds category traces when slot occupancy changes the number of segments', () => {
    setMotionPreference(true);
    const handle = mountScene(makeCanvas());
    const scene = three.state.scene;
    const connections = scene?.children.find(
      (child) => child instanceof three.FakeMesh && child.geometry.points.length > 0,
    );
    if (!(connections instanceof three.FakeMesh)) {
      throw new Error('Expected category connection geometry');
    }
    const previousGeometry = connections.geometry;
    const previousPointCount = previousGeometry.points.length;

    handle.update({
      technologies,
      mode: '2d',
      filter: 'all',
      selectedId: 'react',
      onSelect: vi.fn(),
      onReceive: vi.fn(),
      ...zoomInput,
    });

    expect(previousGeometry.disposed).toBe(true);
    expect(connections.geometry).not.toBe(previousGeometry);
    expect(connections.geometry.points).toHaveLength(previousPointCount - 2);
    handle.dispose();
  });

  test('uses device pixel ratio up to the drawing-buffer pixel budget', () => {
    const originalPixelRatio = Object.getOwnPropertyDescriptor(window, 'devicePixelRatio');
    Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: 1 });
    const standardDensityHandle = mountScene(makeCanvas());
    expect(three.state.renderer?.setPixelRatio).toHaveBeenLastCalledWith(2);
    standardDensityHandle.dispose();

    resetThree();
    Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: 3 });
    const highDensityHandle = mountScene(makeCanvas());
    expect(three.state.renderer?.setPixelRatio).toHaveBeenLastCalledWith(3);
    highDensityHandle.dispose();

    resetThree();
    three.state.width = 3840;
    three.state.height = 2160;
    const highDensityCanvas = makeCanvas();
    const cappedHandle = mountScene(highDensityCanvas);
    expect(three.state.renderer?.setPixelRatio).toHaveBeenLastCalledWith(1);
    cappedHandle.dispose();
    if (originalPixelRatio) {
      Object.defineProperty(window, 'devicePixelRatio', originalPixelRatio);
    } else {
      Reflect.deleteProperty(window, 'devicePixelRatio');
    }
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
      onReceive: vi.fn(),
      ...zoomInput,
    });
    three.state.intersections = [{ object: node }];
    canvasClick();
    expect(onSelect).toHaveBeenCalledTimes(1);
    handle.dispose();
  });

  test('highlights only actionable cards on hover and clears feedback on leave and filtering', () => {
    setMotionPreference(true);
    const canvas = makeCanvas();
    const handle = mountScene(canvas);
    const cardMeshes = three.state.scene?.children
      // eslint-disable-next-line testing-library/no-node-access -- Three.js scene graph.
      .flatMap((child) => child instanceof three.FakeGroup ? child.children : [])
      .filter((mesh) => typeof mesh.userData.technologyId === 'string') ?? [];
    const react = cardMeshes.find((mesh) => mesh.userData.technologyId === 'react');
    if (!react) throw new Error('Expected React card');
    const move = () => canvas.dispatchEvent(new PointerEvent('pointermove', {
      pointerType: 'mouse', clientX: 600, clientY: 350, isPrimary: true,
    }));
    three.state.intersections = [{ object: react }];
    const rest = { ...react.position };
    const drawsBefore = drawing.fillRect.mock.calls.length;
    move();
    expect(canvas.dataset.stackHoveredTechnology).toBe('react');
    expect(react.position).toMatchObject(rest);
    expect(drawing.fillRect.mock.calls.length).toBeGreaterThan(drawsBefore);
    canvas.dispatchEvent(new PointerEvent('pointerleave'));
    expect(canvas.dataset.stackHoveredTechnology).toBe('');
    move();
    handle.update({
      technologies, mode: '2d', filter: 'databases', selectedId: null,
      onSelect: vi.fn(), onReceive: vi.fn(), ...zoomInput,
    });
    expect(canvas.dataset.stackHoveredTechnology).toBe('');
    move();
    expect(canvas.dataset.stackHoveredTechnology).toBe('');
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
      onReceive: vi.fn(),
      ...zoomInput,
    });
    expect(react.userData.inSlot).toBe(true);
    expect(react.position).toMatchObject({ x: 0, y: 0 });

    handle.update({
      technologies,
      mode: '2d',
      filter: 'all',
      selectedId: null,
      onSelect: vi.fn(),
      onReceive: vi.fn(),
      ...zoomInput,
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
    expect(three.state.frameCallbacks).toHaveLength(0);
    three.state.observer?.trigger(true);
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

  test('drifts slowly, freezes offscreen, and restores rest without moving the occupied slot', () => {
    const preference = setMotionPreference(false);
    const handle = mountScene(makeCanvas(), { selectedId: 'react' });
    const meshes = three.state.scene?.children
      // eslint-disable-next-line testing-library/no-node-access -- Three.js scene graph.
      .flatMap((child) => child instanceof three.FakeGroup ? child.children : [])
      .filter((mesh) => typeof mesh.userData.technologyId === 'string') ?? [];
    const occupant = meshes.find((mesh) => mesh.userData.inSlot);
    const read = () => meshes.map(({ position: { x, y, z } }) => ({ x, y, z }));
    const rest = read();
    expect(rest).toHaveLength(25);
    expect(three.state.frameCallbacks).toHaveLength(0);
    const frame = (time: number) => three.state.frameCallbacks.at(-1)?.(time);
    three.state.observer?.trigger(true);
    frame(100);
    frame(140);
    frame(180);
    const drifting = read();
    expect(drifting).not.toEqual(rest);
    for (const [index, point] of drifting.entries()) {
      expect(Math.hypot(point.x - rest[index].x, point.y - rest[index].y)).toBeLessThan(0.1);
    }
    expect(occupant?.position).toMatchObject({ x: 0, y: 0 });

    three.state.observer?.trigger(false);
    three.state.observer?.trigger(true);
    frame(60_000);
    expect(read()).toEqual(drifting);
    preference.setReducedMotion(true);
    expect(read()).toEqual(rest);
    handle.dispose();
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
  for (const type of ['pointerdown', 'pointerup']) {
    canvas.dispatchEvent(new PointerEvent(type, {
      bubbles: true,
      clientX: 600,
      clientY: 350,
      pointerId: 1,
      isPrimary: true,
    }));
  }
}

function pointerDrag(
  canvas: HTMLCanvasElement,
  pointerType: string,
  pointerId: number,
  start: { x: number; y: number },
  end: { x: number; y: number },
) {
  for (const [type, point] of [
    ['pointerdown', start],
    ['pointermove', end],
    ['pointerup', end],
  ] as const) {
    const event = new PointerEvent(type, {
      bubbles: true,
      button: 0,
      pointerId,
      pointerType,
      isPrimary: true,
      clientX: point.x,
      clientY: point.y,
    });
    canvas.dispatchEvent(event);
  }
}
