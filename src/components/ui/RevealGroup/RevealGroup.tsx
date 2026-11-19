import { Children, Fragment, isValidElement, type ReactNode } from 'react';
import Reveal, { type RevealVariant } from '@/components/ui/Reveal/Reveal';

type RevealGroupProps = {
  children: ReactNode;
  variant?: RevealVariant;
  maxPoints?: number;
  maxElementsWithOffset?: number;
};

// Offsets move where the entry animation starts inside the journey: 1 point is
// 1% of the block travel, so the whole group stays within the entry band.
function calculateGroupOffset(
  groupIndex: number,
  totalInGroup: number,
  maxPoints: number,
  maxElementsWithOffset: number,
): number {
  const effectiveIndex = Math.min(groupIndex, maxElementsWithOffset - 1);
  const step = maxPoints / Math.min(totalInGroup, maxElementsWithOffset);

  return effectiveIndex * step;
}

export default function RevealGroup({
  children,
  variant,
  maxPoints = 5,
  maxElementsWithOffset = 6,
}: RevealGroupProps) {
  const items = Children.toArray(children);

  return (
    <>
      {items.map((child, index) =>
        isValidElement(child) ? (
          <Reveal
            key={index}
            variant={variant}
            offsetPoints={calculateGroupOffset(
              index,
              items.length,
              maxPoints,
              maxElementsWithOffset,
            )}
          >
            {child}
          </Reveal>
        ) : (
          <Fragment key={index}>{child}</Fragment>
        ),
      )}
    </>
  );
}
