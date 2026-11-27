import type {
  StackCategoryId,
  StackTechnologyId,
} from '@/content/stack';
import type { StackFilter } from '@/lib/stack/stack-state';
import type {
  StackCameraOrientation,
  StackZoomDirection,
} from '@/lib/stack/stack-camera';

export type StackSceneTechnology = {
  id: StackTechnologyId;
  category: StackCategoryId;
  categoryLabel: string;
  brandMark: string;
  name: string;
  order: number;
};

export type StackSceneMode = '2d' | '3d';
export type StackSceneStatus = 'fallback' | 'flat' | 'ready';

export type StackSceneUpdate = {
  technologies: readonly StackSceneTechnology[];
  mode: StackSceneMode;
  zoom: number;
  yaw: number;
  pitch: number;
  filter: StackFilter;
  selectedId: StackTechnologyId | null;
  onSelect: (id: StackTechnologyId) => void;
  onReceive: (id: StackTechnologyId) => void;
  onZoom: (direction: StackZoomDirection) => void;
  onRotate: (orientation: StackCameraOrientation) => void;
};

export type StackSceneHandle = {
  supportsPerspective: boolean;
  update: (update: StackSceneUpdate) => void;
  dispose: () => void;
};
