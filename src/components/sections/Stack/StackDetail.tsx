'use client';

import Image from 'next/image';
import { useState, type DragEvent } from 'react';
import { useTranslations } from 'next-intl';
import type { StackTechnologyId } from '@/content/stack';

export const STACK_DRAG_DATA_TYPE = 'application/x-stack-technology';

export type StackDetailTechnology = {
  id: StackTechnologyId;
  name: string;
  description: string;
  brandMark: string;
};

export type StackDetailFeedback = {
  kind: 'received' | 'rejected' | 'ejected';
  name: string;
};

type Props = {
  technology: StackDetailTechnology | null;
  feedback: StackDetailFeedback | null;
  canDragCard?: boolean;
  canReceiveTechnology: (id: string) => boolean;
  onReceive: (id: string) => void;
  onEject: () => void;
};

function getDraggedTechnologyId(event: DragEvent<HTMLElement>): string | null {
  if (!Array.from(event.dataTransfer.types).includes(STACK_DRAG_DATA_TYPE)) {
    return null;
  }

  return event.dataTransfer.getData(STACK_DRAG_DATA_TYPE) || null;
}

export default function StackDetail({
  technology,
  feedback,
  canDragCard = false,
  canReceiveTechnology,
  onReceive,
  onEject,
}: Props) {
  const t = useTranslations('stack');
  const [isDropActive, setIsDropActive] = useState(false);

  const handleDragEnter = (event: DragEvent<HTMLElement>) => {
    const id = getDraggedTechnologyId(event);
    if (!id || !canReceiveTechnology(id)) return;

    event.preventDefault();
    setIsDropActive(true);
  };

  const handleDragOver = (event: DragEvent<HTMLElement>) => {
    const id = getDraggedTechnologyId(event);
    if (id && canReceiveTechnology(id)) event.preventDefault();
  };

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDropActive(false);

    const id = getDraggedTechnologyId(event);
    if (id && canReceiveTechnology(id)) onReceive(id);
  };

  let feedbackMessage: string | null = null;
  if (feedback?.kind === 'received') {
    feedbackMessage = t('detail.feedback.received', { name: feedback.name });
  } else if (feedback?.kind === 'rejected') {
    feedbackMessage = t('detail.feedback.rejected', { name: feedback.name });
  } else if (feedback?.kind === 'ejected') {
    feedbackMessage = t('detail.feedback.ejected', { name: feedback.name });
  }

  return (
    <div
      role="region"
      aria-label={t('detail.label')}
      aria-live="polite"
      data-stack-detail
      data-slot-state={technology ? 'occupied' : 'empty'}
      data-slot-technology={technology?.id}
      data-drop-active={isDropActive}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={() => setIsDropActive(false)}
      onDrop={handleDrop}
    >
      {technology ? (
        <div data-stack-detail-technology={technology.id}>
          <div data-stack-detail-heading>
            <Image
              src={technology.brandMark}
              alt=""
              aria-hidden="true"
              role="img"
              width={48}
              height={32}
              unoptimized
              data-stack-brand-mark
              className="h-8 w-12 shrink-0 object-contain"
            />
            <h3>{technology.name}</h3>
          </div>
          <p
            data-stack-detail-description
            className="max-w-prose text-body"
          >
            {technology.description}
          </p>
          <button type="button" data-stack-eject onClick={onEject}>
            {t('detail.eject')}
          </button>
        </div>
      ) : (
        <p data-stack-detail-empty>{t(canDragCard ? 'detail.emptyWithDrag' : 'detail.empty')}</p>
      )}
      {feedbackMessage && <p role="status">{feedbackMessage}</p>}
    </div>
  );
}
