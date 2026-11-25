import * as THREE from 'three';
import { FEATURED_STACK_TECHNOLOGY_IDS, type StackTechnologyId } from '@/content/stack';
import { bindStackDrag } from '@/components/sections/Stack/stack-drag';
import { hasStackPerspectiveSupport } from '@/lib/stack/stack-capabilities';
import {
  getStackPerspectiveZoom,
  rotateStackCameraBy,
  type StackCameraOrientation,
} from '@/lib/stack/stack-camera';
import {
  constrainStackCard,
  moveStackCard,
  resolveStackCollisions,
  type StackBody,
  type StackBounds,
} from '@/lib/stack/stack-geometry';
import { findStackReturnPosition, type StackPoint } from '@/lib/stack/stack-return-position';
import { observeStackProjection, stackProjectionDuration } from '@/lib/stack/stack-projection-motion';
import { observeStackSceneMotion } from '@/lib/stack/stack-scene-ambient';
import {
  drawStackCardFace,
  prepareStackCardMark,
  resolveStackTokenColor,
  STACK_CARD_FACE_HEIGHT,
  STACK_CARD_FACE_WIDTH,
} from '@/lib/stack/stack-scene-artwork';
import {
  layoutStackCards,
  STACK_CARD_HEIGHT,
  STACK_CARD_WIDTH,
  STACK_SLOT_HEIGHT,
  STACK_SLOT_WIDTH,
} from '@/lib/stack/stack-scene-layout';
import type {
  StackSceneHandle,
  StackSceneTechnology,
  StackSceneUpdate,
} from '@/lib/stack/stack-scene-types';

type Disposable = { dispose: () => void };
type Card = {
  mesh: THREE.Mesh<THREE.BoxGeometry, THREE.Material[]>;
  outline: THREE.LineSegments;
  technology: StackSceneTechnology;
  position: THREE.Vector3;
  scale: number;
  canvas: HTMLCanvasElement;
  texture: THREE.CanvasTexture;
  mark: HTMLCanvasElement | null;
  enabled: boolean;
  inSlot: boolean;
  placed: boolean;
  ambientPhase: number;
  ambientBaselineSin: number;
  ambientBaselineCos: number;
};

const CARD_DEPTH = 0.16;
const SLOT_DEPTH = 0.46;
const TRACE_SURFACE_OFFSET = 0.035;
const MAX_DRAWING_BUFFER_PIXELS = 3840 * 2160;
const MAX_DEVICE_PIXEL_RATIO = 2;
const FIELD_OF_VIEW = 34;
const CAMERA_ROTATION_SENSITIVITY = 0.18;
const AMBIENT_AMPLITUDE = 0.18;
const AMBIENT_RATE = 0.00022;
const FOOTPRINT_SCALE = 1.04;
const PERSPECTIVE_SLOT_INSET = 0.18;
const CAMERA_MARGIN = 0.02;
const FLOOR_GRID_OPACITY = 0.32;
const FLOOR_SHADOW_OPACITY = 0.1;
const PROJECTION_DURATION_TOKEN = '--duration-theme';
const FEATURED: ReadonlySet<StackTechnologyId> = new Set(FEATURED_STACK_TECHNOLOGY_IDS);
const THEME = {
  surface: '--color-surface',
  ink: '--color-ink',
  muted: '--color-ink-muted',
} as const;
type Tone = keyof typeof THEME;

function bridgeProjection(flat: THREE.Camera, space: THREE.Camera) {
  const camera = new THREE.PerspectiveCamera();
  const flatClip = new THREE.Matrix4();
  const spaceClip = new THREE.Matrix4();
  const clip = new THREE.Matrix4();
  return (progress: number) => {
    camera.position.lerpVectors(flat.position, space.position, progress);
    camera.quaternion.slerpQuaternions(flat.quaternion, space.quaternion, progress);
    camera.updateMatrixWorld();
    flatClip.multiplyMatrices(flat.projectionMatrix, flat.matrixWorldInverse);
    spaceClip.multiplyMatrices(space.projectionMatrix, space.matrixWorldInverse);
    // Normalize the homogeneous weight at the workbench origin (w = 1), then
    // mix world-to-clip matrices. Each visible point stays between its two
    // screen projections; factoring out the live pose keeps lighting coherent.
    spaceClip.multiplyScalar(1 / spaceClip.elements[15]);
    for (let i = 0; i < clip.elements.length; i++) {
      clip.elements[i] = THREE.MathUtils.lerp(flatClip.elements[i], spaceClip.elements[i], progress);
    }
    camera.projectionMatrix.multiplyMatrices(clip, camera.matrixWorld);
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
    return camera;
  };
}

export function mountStackScene(
  canvas: HTMLCanvasElement,
  initial: StackSceneUpdate,
): StackSceneHandle {
  const host = canvas.parentElement ?? canvas;
  const hostStyle = getComputedStyle(host);
  const font = hostStyle.fontFamily || 'monospace';
  const resolveTone = (tone: Tone) => resolveStackTokenColor(
    host, THEME[tone], tone === 'surface' ? 'white' : 'black',
  );
  const colors = { surface: resolveTone('surface'), ink: resolveTone('ink'), muted: resolveTone('muted') };
  const scene = new THREE.Scene();
  const flat = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 150);
  const space = new THREE.PerspectiveCamera(FIELD_OF_VIEW, 1, 0.1, 150);
  let current = initial;
  let disposed = false;
  let limits: StackBounds = { left: -1, right: 1, bottom: -1, top: 1 };
  const renderer = new THREE.WebGLRenderer({
    canvas, alpha: true, antialias: true, powerPreference: 'low-power',
  });
  const supportsPerspective = hasStackPerspectiveSupport(renderer.getContext());
  let progress: number = supportsPerspective && initial.mode === '3d' ? 1 : 0;
  let activeCamera: THREE.Camera = progress ? space : flat;
  let blend: ReturnType<typeof bridgeProjection> | undefined;
  const cameraHome = { radius: 0, yaw: 0, pitch: 0 };
  let backgroundGesture: {
    pointerId: number;
    startX: number;
    startY: number;
    yaw: number;
    pitch: number;
    last: StackCameraOrientation;
  } | null = null;
  const projection = () => activeCamera;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = supportsPerspective;
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1));
  const planeHit = new THREE.Vector3();
  const rayStart = new THREE.Vector3();
  const rayEnd = new THREE.Vector3();
  const resources = new Set<Disposable>();
  const themedMaterials: { tone: Tone; color: THREE.Color }[] = [];
  const track = <T extends Disposable>(resource: T): T => {
    resources.add(resource);
    return resource;
  };
  const tint = <T extends THREE.Material & { color: THREE.Color }>(material: T, tone: Tone) => {
    material.color.set(colors[tone]);
    themedMaterials.push({ tone, color: material.color });
    return track(material);
  };
  const stroke = (tone: Tone, opacity = 1) => tint(
    new THREE.LineBasicMaterial({ opacity, transparent: opacity < 1 }), tone,
  );
  const render = () => {
    if (!disposed) renderer.render(scene, projection());
  };

  const fill = tint(new THREE.MeshStandardMaterial({ roughness: 0.82 }), 'surface');
  const edges = stroke('ink');
  const mutedEdges = stroke('muted', 0.76);
  const rules = stroke('muted', 0.56);
  rules.depthWrite = false;
  const light = new THREE.DirectionalLight(0xffffff, 1.8);
  light.position.set(-4, 7, 11);
  light.castShadow = true;
  light.shadow.mapSize.set(1024, 1024);
  light.shadow.camera.left = light.shadow.camera.bottom = -12;
  light.shadow.camera.right = light.shadow.camera.top = 12;
  light.shadow.camera.far = 52;
  light.shadow.bias = -0.001;
  scene.add(new THREE.AmbientLight(0xffffff, 1.9), light);

  const floor = new THREE.Group();
  const floorSize = 52;
  const floorRules = stroke('muted', FLOOR_GRID_OPACITY);
  const grid = new THREE.GridHelper(floorSize, 38);
  grid.material.dispose();
  grid.material = floorRules;
  track(grid.geometry);
  const shadowMaterial = track(new THREE.ShadowMaterial({ opacity: FLOOR_SHADOW_OPACITY }));
  const shadow = new THREE.Mesh(
    track(new THREE.PlaneGeometry(floorSize, floorSize)),
    shadowMaterial,
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -0.015;
  shadow.receiveShadow = true;
  floor.add(grid, shadow);
  scene.add(floor);

  const slot = new THREE.Group();
  const halfWidth = STACK_SLOT_WIDTH / 2;
  const halfHeight = STACK_SLOT_HEIGHT / 2;
  function makeRail(width: number, height: number, x: number, y: number) {
    const geometry = track(new THREE.BoxGeometry(width, height, SLOT_DEPTH));
    const mesh = new THREE.Mesh(geometry, fill);
    mesh.position.set(x, y, -SLOT_DEPTH / 2);
    mesh.add(new THREE.LineSegments(track(new THREE.EdgesGeometry(geometry)), edges));
    slot.add(mesh);
  }
  for (const side of [-1, 1]) {
    makeRail(STACK_SLOT_WIDTH, 0.045, 0, side * halfHeight);
    makeRail(0.045, STACK_SLOT_HEIGHT, side * halfWidth, 0);
  }
  const slotFill = tint(new THREE.MeshBasicMaterial(), 'surface');
  const slotHighlight = tint(new THREE.MeshBasicMaterial(), 'ink');
  const backing = new THREE.Mesh(
    track(new THREE.PlaneGeometry(STACK_SLOT_WIDTH, STACK_SLOT_HEIGHT)), slotFill,
  );
  backing.position.z = -SLOT_DEPTH;
  const corners = [-1, 1].flatMap((side) =>
    [-1, 1].flatMap((edge) => {
      const x = side * (halfWidth + 0.06);
      const y = edge * (halfHeight + 0.06);
      return [
        new THREE.Vector3(x - side * 0.26, y, 0.04), new THREE.Vector3(x, y, 0.04),
        new THREE.Vector3(x, y, 0.04), new THREE.Vector3(x, y - edge * 0.22, 0.04),
      ];
    }),
  );
  slot.add(backing, new THREE.LineSegments(
    track(new THREE.BufferGeometry().setFromPoints(corners)), edges,
  ));
  scene.add(slot);

  const cardGeometry = track(new THREE.BoxGeometry(STACK_CARD_WIDTH, STACK_CARD_HEIGHT, CARD_DEPTH));
  const cardEdges = track(new THREE.EdgesGeometry(cardGeometry));
  const cardGroup = new THREE.Group();
  const loader = new THREE.TextureLoader();
  const cards = new Map<StackTechnologyId, Card>();
  let ambientTime = 0;
  let highlighted: Card | null = null;

  const drawCard = (card: Card) => {
    const inverted = card === highlighted && card.enabled && !card.inSlot;
    drawStackCardFace(
      card.canvas, card.mark, card.technology.name, card.technology.categoryLabel,
      card.technology.order, inverted ? colors.ink : colors.surface,
      inverted ? colors.surface : card.enabled || card.inSlot ? colors.ink : colors.muted, font,
    );
    card.texture.needsUpdate = true;
  };

  for (const technology of initial.technologies) {
    const face = document.createElement('canvas');
    face.width = STACK_CARD_FACE_WIDTH;
    face.height = STACK_CARD_FACE_HEIGHT;
    const texture = track(new THREE.CanvasTexture(face));
    texture.colorSpace = THREE.SRGBColorSpace;
    const front = track(new THREE.MeshBasicMaterial({ map: texture }));
    const mesh = new THREE.Mesh(cardGeometry, [fill, fill, fill, fill, front, fill]);
    mesh.rotation.order = 'YXZ';
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { technologyId: technology.id, featured: FEATURED.has(technology.id) };
    const outline = new THREE.LineSegments(cardEdges, edges);
    mesh.add(outline);
    cardGroup.add(mesh);
    const ambientPhase = cards.size * 0.73;
    const card: Card = {
      mesh, outline, technology, position: new THREE.Vector3(), scale: 1,
      canvas: face, texture, mark: null, enabled: true, inSlot: false, placed: false,
      ambientPhase,
      ambientBaselineSin: Math.sin(ambientPhase),
      ambientBaselineCos: Math.cos(ambientPhase),
    };
    cards.set(technology.id, card);
    drawCard(card);
    track(loader.load(technology.brandMark, (mark) => {
      if (disposed) return;
      card.mark = prepareStackCardMark(mark.image as HTMLImageElement);
      drawCard(card);
      render();
    }));
  }
  scene.add(cardGroup);

  // Keep only a chain per category so the lines read as a schematic, not a web.
  const connections = new THREE.LineSegments(new THREE.BufferGeometry(), rules);
  connections.renderOrder = 1;
  connections.frustumCulled = false;
  scene.add(connections);
  let connectionPointCount = 0;
  const updateConnections = () => {
    const previous = new Map<StackSceneTechnology['category'], Card>();
    const points: THREE.Vector3[] = [];
    for (const card of cards.values()) {
      if (card.inSlot) continue;
      const neighbor = previous.get(card.technology.category);
      if (neighbor) {
        const from = neighbor.mesh.position;
        const to = card.mesh.position;
        const length = Math.hypot(to.x - from.x, to.y - from.y);
        const directionX = length ? (to.x - from.x) / length : 1;
        const directionY = length ? (to.y - from.y) / length : 0;
        const edgePoint = (item: Card, sign: number) => {
          const halfWidth = STACK_CARD_WIDTH * item.scale / 2;
          const halfHeight = STACK_CARD_HEIGHT * item.scale / 2;
          const distance = Math.min(
            directionX === 0 ? Infinity : halfWidth / Math.abs(directionX),
            directionY === 0 ? Infinity : halfHeight / Math.abs(directionY),
          );
          return new THREE.Vector3(
            item.mesh.position.x + directionX * distance * sign,
            item.mesh.position.y + directionY * distance * sign,
            item.mesh.position.z + CARD_DEPTH / 2 + TRACE_SURFACE_OFFSET,
          );
        };
        points.push(
          edgePoint(neighbor, 1),
          edgePoint(card, -1),
        );
      }
      previous.set(card.technology.category, card);
    }
    if (points.length !== connectionPointCount) {
      const previousGeometry = connections.geometry;
      connections.geometry = new THREE.BufferGeometry();
      previousGeometry.dispose();
      connectionPointCount = points.length;
    }
    connections.geometry.setFromPoints(points);
  };

  const updateCards = () => {
    let index = 0;
    for (const card of cards.values()) {
      const enabled = current.filter === 'all' || card.technology.category === current.filter;
      const inSlot = card.technology.id === current.selectedId;
      const redraw = enabled !== card.enabled || inSlot !== card.inSlot;
      card.enabled = enabled;
      card.inSlot = inSlot;
      card.mesh.userData.inSlot = inSlot;
      card.outline.material = enabled || inSlot ? edges : mutedEdges;
      card.mesh.rotation.y = !inSlot ? Math.sin(index * 1.2) * 0.04 : 0;
      card.mesh.rotation.x = !inSlot ? 0.05 : 0;
      if (!supportsPerspective) {
        card.mesh.renderOrder = inSlot ? 3 : card.position.z;
        card.outline.renderOrder = card.mesh.renderOrder;
      }
      if (inSlot) card.mesh.position.set(0, 0, CARD_DEPTH);
      card.mesh.scale.setScalar(inSlot ? 1.22 : card.scale);
      if (redraw) drawCard(card);
      index++;
    }
  };

  let homePositions: ReturnType<typeof layoutStackCards>['positions'];
  let maximumZoomFit = 1;
  function setPerspectiveCamera(yaw: number, pitch: number) {
    const angle = Math.PI / 180;
    const absoluteYaw = cameraHome.yaw + yaw * angle;
    const absolutePitch = cameraHome.pitch + pitch * angle;
    const horizontalRadius = cameraHome.radius * Math.cos(absolutePitch);
    space.position.set(
      horizontalRadius * Math.sin(absoluteYaw),
      cameraHome.radius * Math.sin(absolutePitch),
      horizontalRadius * Math.cos(absoluteYaw),
    );
    space.lookAt(0, 0, 0);
    space.updateMatrixWorld();
    canvas.dataset.stackCameraYaw = String(yaw);
    canvas.dataset.stackCameraPitch = String(pitch);
  }

  function applyCameraOrientation(orientation: StackCameraOrientation) {
    setPerspectiveCamera(orientation.yaw, orientation.pitch);
    fitPerspective();
    if (progress > 0) settledGeometry();
    render();
  }

  const resize = () => {
    drag.cancel();
    cancelBackgroundDrag();
    const bounds = canvas.getBoundingClientRect();
    const { width, height } = bounds;
    if (!width || !height) return;
    const aspect = width / height;
    const { positions, viewHeight } = layoutStackCards(initial.technologies, aspect);
    homePositions = positions;
    renderer.setPixelRatio(Math.min(
      window.devicePixelRatio || 1,
      MAX_DEVICE_PIXEL_RATIO,
      Math.sqrt(MAX_DRAWING_BUFFER_PIXELS / (width * height)),
    ));
    renderer.setSize(width, height, false);
    flat.left = -viewHeight * aspect / 2;
    flat.right = -flat.left;
    flat.top = viewHeight / 2;
    flat.bottom = -flat.top;
    flat.position.set(0, 0, 25);
    flat.updateProjectionMatrix();
    flat.updateMatrixWorld();
    const distance = viewHeight / (2 * Math.tan(FIELD_OF_VIEW * Math.PI / 360));
    space.aspect = aspect;
    const x = distance * (aspect > 1 ? 0.24 : 0.17);
    const y = distance * 0.12;
    const z = distance * 1.02;
    cameraHome.radius = Math.hypot(x, y, z);
    cameraHome.yaw = Math.atan2(x, z);
    cameraHome.pitch = Math.atan2(y, Math.hypot(x, z));
    setPerspectiveCamera(current.yaw, current.pitch);
    space.updateProjectionMatrix();
    limits = {
      left: flat.left + CAMERA_MARGIN, right: flat.right - CAMERA_MARGIN,
      bottom: flat.bottom + CAMERA_MARGIN, top: flat.top - CAMERA_MARGIN,
    };
    if (supportsPerspective) fitPerspective();
    projectStage(progress);

    let bottom = 0;
    for (const [id, position] of positions) {
      const card = cards.get(id);
      if (!card) continue;
      if (!card.placed) card.position.set(position.x, position.y, position.z);
      card.scale = position.scale;
      bottom = Math.min(bottom, position.y);
    }
    floor.position.y = bottom - 0.92;
    updateCards();
    settle();
  };

  const refreshTheme = () => {
    const next = { surface: resolveTone('surface'), ink: resolveTone('ink'), muted: resolveTone('muted') };
    if (next.surface === colors.surface && next.ink === colors.ink && next.muted === colors.muted) return;
    Object.assign(colors, next);
    for (const { tone, color } of themedMaterials) color.set(colors[tone]);
    cards.forEach(drawCard);
    render();
  };

  function pointAtDepth(z: number) {
    dragPlane.constant = -z;
    return raycaster.ray.intersectPlane(dragPlane, planeHit);
  }

  function fitPerspective() {
    // Find the full-scene fit at both depth extremes; higher zoom levels can
    // intentionally crop the outer cards for closer inspection.
    const depths = [...homePositions.values()].map(({ z }) => Math.abs(z));
    for (const card of cards.values()) if (card.placed) depths.push(Math.abs(card.position.z));
    const depth = Math.max(0, ...depths) + CARD_DEPTH;
    const corner = new THREE.Vector3();
    space.zoom = 1;
    space.updateProjectionMatrix();
    let fit = 1;
    for (const x of [flat.left, flat.right]) {
      for (const y of [flat.bottom, flat.top]) {
        for (const z of [-depth, depth]) {
          corner.set(x, y, z);
          corner.project(space);
          fit = Math.max(fit, Math.abs(corner.x), Math.abs(corner.y));
        }
      }
    }
    maximumZoomFit = 1 / fit;
    applyZoom();
  }

  function applyZoom() {
    space.zoom = getStackPerspectiveZoom(current.zoom, maximumZoomFit);
    space.updateProjectionMatrix();
  }

  function projectStage(next: number) {
    progress = next;
    if (next === 0) activeCamera = flat;
    else if (next === 1) activeCamera = space;
    else {
      blend ??= bridgeProjection(flat, space);
      activeCamera = blend(next);
    }
    floor.visible = next > 0;
    floorRules.opacity = FLOOR_GRID_OPACITY * next;
    shadowMaterial.opacity = FLOOR_SHADOW_OPACITY * next;
    host.style.setProperty('--stack-perspective', String(next));
    canvas.dataset.stackProjection = String(next);
  }

  function aimRay(x: number, y: number) {
    const camera = projection();
    if (progress === 0 || progress === 1) {
      raycaster.setFromCamera(pointer.set(x, y), camera);
      return;
    }
    // A mixed clip matrix is not a standard Three.js camera projection.
    // Build the ray through its two unprojected depth endpoints instead.
    rayStart.set(x, y, -1);
    rayEnd.set(x, y, 1);
    rayStart.unproject(camera);
    rayEnd.unproject(camera).sub(rayStart).normalize();
    raycaster.set(rayStart, rayEnd);
  }

  function aimAtPointer(event: PointerEvent) {
    const { left, top, width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return false;
    const x = ((event.clientX - left) / width) * 2 - 1;
    const y = 1 - ((event.clientY - top) / height) * 2;
    const cap = (value: number) => Math.max(-1, Math.min(1, value));
    aimRay(cap(x), cap(y));
    return Math.abs(x) <= 1 && Math.abs(y) <= 1;
  }

  function isOverSlot(center: THREE.Vector3) {
    const projected = new THREE.Vector3().copy(center).project(projection());
    aimRay(projected.x, projected.y);
    const point = pointAtDepth(0);
    return Boolean(point && Math.abs(point.x) <= halfWidth && Math.abs(point.y) <= halfHeight);
  }

  function indicateSlot(active: boolean) {
    backing.material = active ? slotHighlight : slotFill;
    canvas.dataset.stackDropActive = String(active);
  }

  function* returnCandidates(card: Card) {
    yield card.position;
    const distance = (point: StackPoint) =>
      Math.hypot(card.position.x - point.x, card.position.y - point.y);
    yield* [...homePositions.values()].sort((a, b) => distance(a) - distance(b));
    const { left, right, bottom, top } = limits;
    for (let y = bottom; y < top; y += STACK_CARD_HEIGHT / 4) {
      for (let x = left; x < right; x += STACK_CARD_WIDTH / 4) yield { x, y };
    }
  }

  const footprint = (card: Card, point: StackPoint = card.position): StackBody => ({
    x: point.x, y: point.y,
    halfWidth: STACK_CARD_WIDTH * card.scale * FOOTPRINT_SCALE / 2,
    halfHeight: STACK_CARD_HEIGHT * card.scale * FOOTPRINT_SCALE / 2,
  });
  const slotFootprint = (): StackBody => {
    const inset = supportsPerspective ? PERSPECTIVE_SLOT_INSET : CAMERA_MARGIN;
    return { x: 0, y: 0, halfWidth: halfWidth + inset, halfHeight: halfHeight + inset };
  };
  const freeCards = () => [...cards.values()].filter((card) => card.technology.id !== current.selectedId);

  function renderPositions(positions: readonly (StackBody & { card: Card })[]) {
    for (const { card, x, y } of positions) card.mesh.position.set(x, y, card.position.z);
  }

  function setAmbientBaseline(card: Card, time: number) {
    const angle = card.ambientPhase + time * AMBIENT_RATE;
    card.ambientBaselineSin = Math.sin(angle);
    card.ambientBaselineCos = Math.cos(angle);
  }

  function rebaseAmbient(card: Card) {
    setAmbientBaseline(card, ambientTime);
  }

  function settledGeometry(includeAmbientMovement = false) {
    const screenPoint = new THREE.Vector3();
    const project = (x: number, y: number, z: number) => {
      screenPoint.set(x, y, z);
      screenPoint.project(projection());
      return { x: (1 + screenPoint.x) / 2, y: (1 - screenPoint.y) / 2 };
    };
    const geometry = freeCards().map((card) => {
      const position = includeAmbientMovement ? card.mesh.position : card.position;
      const { x, y, halfWidth: w, halfHeight: h } = footprint(card, position);
      const { z } = position;
      const corners = [z - CARD_DEPTH, z + CARD_DEPTH].flatMap((depth) =>
        [x - w, x + w].flatMap((side) => [y - h, y + h].map((edge) => project(side, edge, depth))));
      return [card.technology.id, {
        ...project(x, y, z),
        left: Math.min(...corners.map((point) => point.x)),
        right: Math.max(...corners.map((point) => point.x)),
        top: Math.min(...corners.map((point) => point.y)),
        bottom: Math.max(...corners.map((point) => point.y)),
      }];
    });
    // Expose the same settled cards in the live projection, without running
    // layout or recording ambient drift for every frame.
    canvas.dataset.stackCardBounds = JSON.stringify(Object.fromEntries(geometry));
  }

  function settle(held?: Card) {
    const bodies = freeCards().map((card) => ({
      ...footprint(card, card === held ? card.mesh.position : card.position), card,
    }));
    const slot = slotFootprint();
    const resolved = resolveStackCollisions(
      bodies, limits, slot, bodies.findIndex(({ card }) => card === held),
    );
    for (const { card, x, y } of resolved) {
      if (held && (held === card || x !== card.position.x || y !== card.position.y)) card.placed = true;
      card.position.set(x, y, card.position.z);
      rebaseAmbient(card);
    }
    renderPositions(resolved);
    updateConnections();
    settledGeometry();
    render();
  }

  function returnToStack(card: Card, nextSlotId: StackTechnologyId | null) {
    const slot = slotFootprint();
    const inView = (point: StackPoint) => {
      const constrained = constrainStackCard(footprint(card, point), limits, slot);
      return constrained.x === point.x && constrained.y === point.y;
    };
    const neighbors = [...cards.values()]
      .filter((item) => item !== card && item.technology.id !== nextSlotId)
      .map(({ position, scale }) => ({ x: position.x, y: position.y, scale: scale * FOOTPRINT_SCALE }));
    const available = findStackReturnPosition(
      returnCandidates(card), card.scale * FOOTPRINT_SCALE, neighbors, inView,
    );
    if (available && available !== card.position) {
      card.position.set(available.x, available.y, card.position.z);
      card.placed = true;
    }
    rebaseAmbient(card);
  }

  const meshes = [...cards.values()].map(({ mesh }) => mesh);
  function highlight(card: Card | null) {
    if (card === highlighted) return;
    const previous = highlighted;
    highlighted = card;
    if (previous) drawCard(previous);
    if (card) drawCard(card);
    canvas.dataset.stackHoveredTechnology = card?.technology.id ?? '';
    render();
  }
  function cardAtPointer(event: PointerEvent) {
    if (!aimAtPointer(event)) return null;
    const hit = raycaster.intersectObjects(meshes, false)[0];
    const card = hit && cards.get(hit.object.userData.technologyId as StackTechnologyId);
    return card?.enabled && !card.inSlot ? card : null;
  }
  const drag = bindStackDrag(canvas, {
    pick: (event) => {
      const card = cardAtPointer(event);
      if (!card) return null;
      const point = pointAtDepth(card.mesh.position.z);
      if (!point) return null;
      const positions = freeCards().map((item) => ({
        card: item, x: item.position.x, y: item.position.y, placed: item.placed,
      }));
      highlight(card);
      return { card, positions, dx: card.mesh.position.x - point.x, dy: card.mesh.position.y - point.y };
    },
    move: ({ card, dx, dy }, event) => {
      const inside = aimAtPointer(event);
      const point = pointAtDepth(card.mesh.position.z);
      if (!point) return;
      const held = new THREE.Vector3(point.x + dx, point.y + dy, card.mesh.position.z);
      const receiving = inside && isOverSlot(held);
      indicateSlot(receiving);
      const bodies = freeCards().map((item) => ({
        ...footprint(item, item.mesh.position), card: item,
      }));
      const heldIndex = bodies.findIndex((item) => item.card === card);
      let resolved: typeof bodies;
      if (receiving) {
        resolved = resolveStackCollisions(
          bodies.filter((item) => item.card !== card), limits, slotFootprint(),
        );
        resolved.push({ ...footprint(card, held), card });
      } else {
        resolved = moveStackCard(bodies, heldIndex, held, limits, slotFootprint());
      }
      for (const { card: item, x, y } of resolved) {
        if (item === card || x !== item.position.x || y !== item.position.y) item.placed = true;
        item.position.set(x, y, item.position.z);
        rebaseAmbient(item);
      }
      renderPositions(resolved);
      updateConnections();
      settledGeometry();
      render();
    },
    drop: ({ card }, event) => {
      const inside = aimAtPointer(event);
      const received = inside && isOverSlot(card.mesh.position);
      indicateSlot(false);
      highlight(null);
      if (received) {
        if (current.selectedId) returnToStack(card, current.selectedId);
        settle();
        current.onReceive(card.technology.id);
      } else {
        settle(card);
      }
    },
    select: ({ card }) => current.onSelect(card.technology.id),
    reset: ({ positions }) => {
      indicateSlot(false);
      for (const { card, x, y, placed } of positions) {
        card.position.set(x, y, card.position.z);
        card.placed = placed;
      }
      highlight(null);
      restoreRest();
    },
  });
  indicateSlot(false);

  const cameraListeners = new AbortController();

  function cancelBackgroundDrag() {
    const gesture = backgroundGesture;
    if (!gesture) return;
    backgroundGesture = null;
    canvas.dataset.stackRotating = 'false';
    if (canvas.hasPointerCapture?.(gesture.pointerId)) {
      canvas.releasePointerCapture(gesture.pointerId);
    }
  }

  function startBackgroundDrag(event: PointerEvent) {
    if (
      !supportsPerspective
      || current.mode !== '3d'
      || progress !== 1
      || !event.isPrimary
      || event.button !== 0
      || event.pointerType === 'touch'
      || drag.target()
      || !aimAtPointer(event)
      || raycaster.intersectObjects(meshes, false).length > 0
    ) {
      return;
    }

    highlight(null);
    canvas.dataset.stackRotating = 'true';
    backgroundGesture = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      yaw: current.yaw,
      pitch: current.pitch,
      last: { yaw: current.yaw, pitch: current.pitch },
    };
    canvas.setPointerCapture?.(event.pointerId);
  }

  function moveBackgroundDrag(event: PointerEvent) {
    if (!backgroundGesture || backgroundGesture.pointerId !== event.pointerId) return;
    const gesture = backgroundGesture;
    const orientation = rotateStackCameraBy(
      { yaw: gesture.yaw, pitch: gesture.pitch },
      (event.clientX - gesture.startX) * CAMERA_ROTATION_SENSITIVITY,
      (gesture.startY - event.clientY) * CAMERA_ROTATION_SENSITIVITY,
    );
    if (orientation.yaw === gesture.last.yaw && orientation.pitch === gesture.last.pitch) return;
    gesture.last = orientation;
    applyCameraOrientation(orientation);
    current.onRotate(orientation);
  }

  const finishBackgroundDrag = (event: PointerEvent) => {
    if (backgroundGesture?.pointerId === event.pointerId) cancelBackgroundDrag();
  };
  const cameraOptions = { signal: cameraListeners.signal };
  canvas.dataset.stackHoveredTechnology = '';
  canvas.addEventListener('pointermove', (event) => {
    if (drag.target() || backgroundGesture || event.pointerType === 'touch') return;
    highlight(cardAtPointer(event));
  }, cameraOptions);
  canvas.addEventListener('pointerleave', () => {
    if (!drag.target()) highlight(null);
  }, cameraOptions);
  canvas.addEventListener('pointerdown', startBackgroundDrag, cameraOptions);
  canvas.addEventListener('pointermove', moveBackgroundDrag, cameraOptions);
  canvas.addEventListener('pointerup', finishBackgroundDrag, cameraOptions);
  canvas.addEventListener('pointercancel', finishBackgroundDrag, cameraOptions);
  canvas.addEventListener('lostpointercapture', finishBackgroundDrag, cameraOptions);

  function restoreRest() {
    if (drag.target()) return;
    freeCards().forEach((card) => {
      card.mesh.position.copy(card.position);
      rebaseAmbient(card);
    });
    updateConnections();
    settledGeometry();
    render();
  }

  function animate(time: number) {
    if (time < ambientTime) {
      for (const card of cards.values()) setAmbientBaseline(card, time);
    }
    ambientTime = time;
    const heldCard = drag.target()?.card;
    const bodies = freeCards().map((card) => {
      const angle = card.ambientPhase + time * AMBIENT_RATE;
      const target = card === heldCard
        ? card.mesh.position
        : {
            x: card.position.x + (Math.sin(angle) - card.ambientBaselineSin) * AMBIENT_AMPLITUDE,
            y: card.position.y + (Math.cos(angle) - card.ambientBaselineCos) * AMBIENT_AMPLITUDE,
          };
      return {
        ...footprint(card, target), card, anchor: card.position,
      };
    });
    const heldIndex = bodies.findIndex(({ card }) => card === heldCard);
    renderPositions(resolveStackCollisions(bodies, limits, slotFootprint(), heldIndex));
    updateConnections();
    if (heldCard) settledGeometry(true);
    render();
  }

  const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize);
  if (resizeObserver) resizeObserver.observe(host);
  else window.addEventListener('resize', resize);
  const themeObserver = new MutationObserver(refreshTheme);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  const systemTheme = window.matchMedia?.('(prefers-color-scheme: dark)');
  systemTheme?.addEventListener('change', refreshTheme);
  resize();
  const motion = observeStackSceneMotion(host, restoreRest, animate);
  const transition = observeStackProjection(
    () => stackProjectionDuration(getComputedStyle(host).getPropertyValue(PROJECTION_DURATION_TOKEN)),
    (next) => {
      projectStage(next);
      settledGeometry();
      render();
    },
    progress === 1 ? 1 : 0,
  );

  function handleWheel(event: WheelEvent) {
    if (!event.cancelable || event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    event.preventDefault();
    current.onZoom(event.deltaY < 0 ? 'in' : 'out');
  }

  function bindZoomWheel() {
    if (supportsPerspective && current.mode === '3d') {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
    } else {
      canvas.removeEventListener('wheel', handleWheel);
    }
  }
  bindZoomWheel();

  return {
    supportsPerspective,
    update: (update) => {
      const previousSelection = current.selectedId;
      const selectionChanged = previousSelection !== update.selectedId;
      const projectionChanged = current.mode !== update.mode;
      const zoomChanged = supportsPerspective && current.zoom !== update.zoom;
      const orientationChanged = current.yaw !== update.yaw || current.pitch !== update.pitch;
      if (selectionChanged || projectionChanged || zoomChanged || current.filter !== update.filter) {
        drag.cancel();
        cancelBackgroundDrag();
        highlight(null);
      }
      current = update;
      if (orientationChanged && supportsPerspective) {
        applyCameraOrientation({ yaw: update.yaw, pitch: update.pitch });
      }
      if (zoomChanged) {
        applyZoom();
        projectStage(progress);
      }
      const returning = selectionChanged && previousSelection ? cards.get(previousSelection) : undefined;
      if (returning) returnToStack(returning, update.selectedId);
      updateCards();
      if (selectionChanged) settle();
      else if (zoomChanged || !projectionChanged) {
        if (zoomChanged) settledGeometry();
        render();
      }
      if (projectionChanged && supportsPerspective) {
        bindZoomWheel();
        transition.goTo(update.mode === '3d' ? 1 : 0);
      }
    },
    dispose: () => {
      if (disposed) return;
      disposed = true;
      cameraListeners.abort();
      cancelBackgroundDrag();
      canvas.removeEventListener('wheel', handleWheel);
      transition.dispose();
      motion.dispose();
      drag.dispose();
      if (resizeObserver) resizeObserver.disconnect();
      else window.removeEventListener('resize', resize);
      themeObserver.disconnect();
      systemTheme?.removeEventListener('change', refreshTheme);
      connections.geometry.dispose();
      light.shadow.dispose();
      for (const resource of resources) resource.dispose();
      renderer.dispose();
    },
  };
}
