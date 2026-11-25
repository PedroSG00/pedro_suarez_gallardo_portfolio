import { useTranslations } from 'next-intl';
import { ZoomIn, ZoomOut } from 'iconoir-react';
import { stepStackZoom, type StackZoomDirection } from '@/lib/stack/stack-camera';

type Props = {
  level: number;
  onZoom: (direction: StackZoomDirection) => void;
};

const DIRECTIONS = ['in', 'out'] as const;
const ICONS = { in: ZoomIn, out: ZoomOut } as const;

export default function StackZoomControls({ level, onZoom }: Props) {
  const t = useTranslations('stack.cad.zoom');

  return (
    <div role="group" aria-label={t('label')} data-stack-zoom-controls>
      {DIRECTIONS.map((direction) => {
        const atLimit = stepStackZoom(level, direction) === level;
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
              if (!atLimit) onZoom(direction);
            }}
          >
            <Icon aria-hidden="true" focusable="false" width={20} height={20} />
          </button>
        );
      })}
      <output>{t('level', { level })}</output>
    </div>
  );
}
