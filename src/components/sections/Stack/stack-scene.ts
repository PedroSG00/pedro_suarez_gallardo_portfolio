import * as THREE from 'three';
import { FEATURED_STACK_TECHNOLOGY_IDS, type StackTechnologyId } from '@/content/stack';
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
};

const CARD_DEPTH = 0.16;
const SLOT_DEPTH = 0.46;
const CONNECTION_DEPTH = -1;
const FIELD_OF_VIEW = 34;
const AMBIENT_AMPLITUDE = 0.035;
const FEATURED: ReadonlySet<StackTechnologyId> = new Set(FEATURED_STACK_TECHNOLOGY_IDS);
const THEME = {
  surface: '--color-surface',
  ink: '--color-ink',
  muted: '--color-ink-muted',
} as const;
type Tone = keyof typeof THEME;

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
  const projection = () => current.mode === '3d' ? space : flat;
  const renderer = new THREE.WebGLRenderer({
    canvas, alpha: true, antialias: true, powerPreference: 'low-power',
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
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
  const grid = new THREE.GridHelper(floorSize, 38);
  grid.material.dispose();
  grid.material = rules;
  track(grid.geometry);
  const shadow = new THREE.Mesh(
    track(new THREE.PlaneGeometry(floorSize, floorSize)),
    track(new THREE.ShadowMaterial({ opacity: 0.1 })),
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
  const backing = new THREE.Mesh(
    track(new THREE.PlaneGeometry(STACK_SLOT_WIDTH, STACK_SLOT_HEIGHT)),
    tint(new THREE.MeshBasicMaterial(), 'surface'),
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
      canvas: face, texture, mark: null, enabled: true, inSlot: false,
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
    const spatial = current.mode === '3d';
    floor.visible = spatial;
    let index = 0;
    for (const card of cards.values()) {
      const enabled = current.filter === 'all' || card.technology.category === current.filter;
      const inSlot = card.technology.id === current.selectedId;
      const redraw = enabled !== card.enabled || inSlot !== card.inSlot;
      card.enabled = enabled;
      card.inSlot = inSlot;
      card.mesh.userData.inSlot = inSlot;
      card.outline.material = enabled || inSlot ? edges : mutedEdges;
      card.mesh.rotation.y = !inSlot ? Math.sin(index * 1.2) * (spatial ? 0.1 : 0.04) : 0;
      card.mesh.rotation.x = !inSlot && !spatial ? 0.05 : 0;
      if (inSlot) card.mesh.position.set(0, 0, CARD_DEPTH);
      else card.mesh.position.copy(card.position);
      card.mesh.scale.setScalar(inSlot ? 1.22 : card.scale);
      if (redraw) drawCard(card);
      index++;
    }
  };

  const resize = () => {
    const bounds = canvas.getBoundingClientRect();
    const { width, height } = bounds;
    if (!width || !height) return;
    const aspect = width / height;
    const { positions, viewHeight } = layoutStackCards(initial.technologies, aspect);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    flat.left = -viewHeight * aspect / 2;
    flat.right = -flat.left;
    flat.top = viewHeight / 2;
    flat.bottom = -flat.top;
    flat.position.set(0, 0, 25);
    flat.updateProjectionMatrix();
    const distance = viewHeight / (2 * Math.tan(FIELD_OF_VIEW * Math.PI / 360));
    space.aspect = aspect;
    space.position.set(distance * (aspect > 1 ? 0.24 : 0.17), distance * 0.12, distance * 1.02);
    space.lookAt(0, 0, 0);
    space.updateProjectionMatrix();

    let bottom = 0;
    for (const [id, position] of positions) {
      const card = cards.get(id);
      if (!card) continue;
      card.position.set(position.x, position.y, position.z);
      card.scale = position.scale;
      bottom = Math.min(bottom, position.y);
    }
    floor.position.y = bottom - 0.92;
    updateCards();
    updateConnections();
    render();
  };

  const refreshTheme = () => {
    const next = { surface: resolveTone('surface'), ink: resolveTone('ink'), muted: resolveTone('muted') };
    if (next.surface === colors.surface && next.ink === colors.ink && next.muted === colors.muted) return;
    Object.assign(colors, next);
    for (const { tone, color } of themedMaterials) color.set(colors[tone]);
    cards.forEach(drawCard);
    render();
  };

  const pick = (event: MouseEvent) => {
    const bounds = canvas.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0) return;
    pointer.set(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, projection());
    const hit = raycaster.intersectObjects([...cards.values()].map(({ mesh }) => mesh), false)[0];
    if (!hit) return;
    const card = cards.get(hit.object.userData.technologyId as StackTechnologyId);
    if (card?.enabled && !card.inSlot) current.onSelect(card.technology.id);
  };

  const animate = (time: number) => {
    let index = 0;
    for (const card of cards.values()) {
      const phase = time * 0.00024 + index++ * 0.73;
      if (card.inSlot) continue;
      card.mesh.position.x = card.position.x + Math.sin(phase) * AMBIENT_AMPLITUDE;
      card.mesh.position.y = card.position.y + Math.cos(phase * 0.73) * AMBIENT_AMPLITUDE * 0.5;
    }
    render();
  };

  const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize);
  if (resizeObserver) resizeObserver.observe(host);
  else window.addEventListener('resize', resize);
  const themeObserver = new MutationObserver(refreshTheme);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  const systemTheme = window.matchMedia?.('(prefers-color-scheme: dark)');
  systemTheme?.addEventListener('change', refreshTheme);
  canvas.addEventListener('click', pick);
  resize();
  const motion = observeStackSceneMotion(host, render, animate);

  return {
    update: (update) => {
      const selectionChanged = current.selectedId !== update.selectedId;
      current = update;
      updateCards();
      if (selectionChanged) updateConnections();
      render();
    },
    dispose: () => {
      if (disposed) return;
      disposed = true;
      motion.dispose();
      canvas.removeEventListener('click', pick);
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
