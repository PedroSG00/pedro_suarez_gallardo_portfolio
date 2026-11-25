import { useTranslations } from 'next-intl';
import {
  NavArrowDown,
  NavArrowUp,
  RotateCameraLeft,
  RotateCameraRight,
} from 'iconoir-react';
import {
  isStackRotationAtLimit,
  type StackCameraOrientation,
  type StackRotationDirection,
} from '@/lib/stack/stack-camera';

type Props = {
  orientation: StackCameraOrientation;
  onRotate: (direction: StackRotationDirection) => void;
};

const DIRECTIONS: readonly StackRotationDirection[] = ['left', 'right', 'up', 'down'];
const ICONS = {
  left: RotateCameraLeft,
  right: RotateCameraRight,
  up: NavArrowUp,
  down: NavArrowDown,
} as const;

export default function StackRotationControls({ orientation, onRotate }: Props) {
  const t = useTranslations('stack.cad.rotation');

  return (
    <div role="group" aria-label={t('label')} data-stack-rotation-controls>
      {DIRECTIONS.map((direction) => {
        const atLimit = isStackRotationAtLimit(orientation, direction);
        const Icon = ICONS[direction];
        const label = t(direction);
        return (
          <button
            key={direction}
            type="button"
            aria-label={label}
            title={label}
            data-stack-icon-button
            aria-disabled={atLimit}
            onClick={() => {
              if (!atLimit) onRotate(direction);
            }}
          >
            <Icon aria-hidden="true" focusable="false" width={20} height={20} />
          </button>
        );
      })}
    </div>
  );
}
