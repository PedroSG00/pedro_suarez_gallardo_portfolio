import type {
  StackCategoryId,
  StackTechnologyId,
} from '@/content/stack';
import type { StackFilter } from '@/lib/stack/stack-state';

export type StackSceneTechnology = {
  id: StackTechnologyId;
  category: StackCategoryId;
  categoryLabel: string;
  brandMark: string;
  name: string;
  order: number;
};

export type StackSceneMode = '2d' | '3d';

export type StackSceneUpdate = {
  technologies: readonly StackSceneTechnology[];
  mode: StackSceneMode;
  filter: StackFilter;
  selectedId: StackTechnologyId | null;
  onSelect: (id: StackTechnologyId) => void;
};

export type StackSceneHandle = {
  update: (update: StackSceneUpdate) => void;
  dispose: () => void;
};
