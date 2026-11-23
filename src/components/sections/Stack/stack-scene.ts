import * as THREE from 'three';
import { FEATURED_STACK_TECHNOLOGY_IDS, type StackTechnologyId } from '@/content/stack';
import { bindStackDrag } from '@/components/sections/Stack/stack-drag';
import { hasStackPerspectiveSupport } from '@/lib/stack/stack-capabilities';
import { getStackPerspectiveZoom } from '@/lib/stack/stack-camera';
import {
  constrainStackCard,
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
};

const CARD_DEPTH = 0.16;
const SLOT_DEPTH = 0.46;
const CONNECTION_DEPTH = -1;
const FIELD_OF_VIEW = 34;
const AMBIENT_AMPLITUDE = 0.12;
const AMBIENT_RATE = 0.00032;
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
  const rules = stroke('muted', 0.32);
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

  const drawCard = (card: Card) => {
    drawStackCardFace(
      card.canvas, card.mark, card.technology.name, card.technology.categoryLabel,
      card.technology.order, colors.surface, card.enabled || card.inSlot ? colors.ink : colors.muted, font,
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
    const card: Card = {
      mesh, outline, technology, position: new THREE.Vector3(), scale: 1,
      canvas: face, texture, mark: null, enabled: true, inSlot: false, placed: false,
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
  scene.add(connections);
  const updateConnections = () => {
    const previous = new Map<StackSceneTechnology['category'], Card>();
    const points: THREE.Vector3[] = [];
    for (const card of cards.values()) {
      if (card.inSlot) continue;
      const neighbor = previous.get(card.technology.category);
      if (neighbor) {
        points.push(
          new THREE.Vector3(neighbor.position.x, neighbor.position.y, CONNECTION_DEPTH),
          new THREE.Vector3(card.position.x, card.position.y, CONNECTION_DEPTH),
        );
      }
      previous.set(card.technology.category, card);
    }
    connections.geometry.dispose();
    connections.geometry = new THREE.BufferGeometry().setFromPoints(points);
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
  const resize = () => {
    drag.cancel();
    const bounds = canvas.getBoundingClientRect();
    const { width, height } = bounds;
    if (!width || !height) return;
    const aspect = width / height;
    const { positions, viewHeight } = layoutStackCards(initial.technologies, aspect);
    homePositions = positions;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
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
    space.position.set(distance * (aspect > 1 ? 0.24 : 0.17), distance * 0.12, distance * 1.02);
    space.lookAt(0, 0, 0);
    space.updateProjectionMatrix();
    space.updateMatrixWorld();
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
    // Fit the 2D working area at both depth extremes so a drop against any
    // edge stays in view in either projection without moving the card.
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

  function settledGeometry() {
    const screenPoint = new THREE.Vector3();
    const project = (x: number, y: number, z: number) => {
      screenPoint.set(x, y, z);
      screenPoint.project(projection());
      return { x: (1 + screenPoint.x) / 2, y: (1 - screenPoint.y) / 2 };
    };
    const geometry = freeCards().map((card) => {
      const { x, y, halfWidth: w, halfHeight: h } = footprint(card);
      const { z } = card.position;
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
  }

  const meshes = [...cards.values()].map(({ mesh }) => mesh);
  const drag = bindStackDrag(canvas, {
    pick: (event) => {
      if (!aimAtPointer(event)) return null;
      const hit = raycaster.intersectObjects(meshes, false)[0];
      const card = hit && cards.get(hit.object.userData.technologyId as StackTechnologyId);
      if (!card?.enabled || card.inSlot) return null;
      const point = pointAtDepth(card.mesh.position.z);
      if (!point) return null;
      return { card, dx: card.mesh.position.x - point.x, dy: card.mesh.position.y - point.y };
    },
    move: ({ card, dx, dy }, event) => {
      const inside = aimAtPointer(event);
      const point = pointAtDepth(card.mesh.position.z);
      if (!point) return;
      const held = new THREE.Vector3(point.x + dx, point.y + dy, card.mesh.position.z);
      const receiving = inside && isOverSlot(held);
      indicateSlot(receiving);
      const bodies = freeCards().map((item) => ({
        ...footprint(item, item === card ? held : item.position), card: item,
      }));
      const heldIndex = bodies.findIndex((item) => item.card === card);
      if (receiving) {
        renderPositions(bodies);
      } else {
        renderPositions(resolveStackCollisions(bodies, limits, slotFootprint(), heldIndex));
      }
      render();
    },
    drop: ({ card }, event) => {
      const inside = aimAtPointer(event);
      const received = inside && isOverSlot(card.mesh.position);
      indicateSlot(false);
      if (received) {
        if (current.selectedId) returnToStack(card, current.selectedId);
        settle();
        current.onReceive(card.technology.id);
      } else {
        settle(card);
      }
    },
    select: ({ card }) => current.onSelect(card.technology.id),
    reset: () => {
      indicateSlot(false);
      restoreRest();
    },
  });
  indicateSlot(false);

  function restoreRest() {
    if (drag.target()) return;
    freeCards().forEach((card) => card.mesh.position.copy(card.position));
    render();
  }

  function animate(time: number) {
    if (drag.target()) return;
    const bodies = freeCards().map((card, index) => {
      const phase = index * 0.73;
      const angle = phase + time * AMBIENT_RATE;
      return {
        ...footprint(card), card, anchor: card.position,
        x: card.position.x + (Math.sin(angle) - Math.sin(phase)) * AMBIENT_AMPLITUDE,
        y: card.position.y + (Math.cos(angle) - Math.cos(phase)) * AMBIENT_AMPLITUDE,
      };
    });
    renderPositions(resolveStackCollisions(bodies, limits, slotFootprint()));
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
      if (selectionChanged || projectionChanged || zoomChanged || current.filter !== update.filter) drag.cancel();
      current = update;
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
