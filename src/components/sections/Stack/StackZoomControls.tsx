import { useTranslations } from 'next-intl';
import { stepStackZoom, type StackZoomDirection } from '@/lib/stack/stack-camera';

type Props = {
  level: number;
  onZoom: (direction: StackZoomDirection) => void;
};

const DIRECTIONS = ['in', 'out'] as const;

export default function StackZoomControls({ level, onZoom }: Props) {
  const t = useTranslations('stack.cad.zoom');

  return (
    <div role="group" aria-label={t('label')} data-stack-zoom-controls>
      {DIRECTIONS.map((direction) => {
        const atLimit = stepStackZoom(level, direction) === level;
        return (
          <button
            key={direction}
            type="button"
            aria-disabled={atLimit}
            onClick={() => {
              if (!atLimit) onZoom(direction);
            }}
          >
            {t(direction)}
          </button>
        );
      })}
      <output>{t('level', { level })}</output>
    </div>
  );
}
