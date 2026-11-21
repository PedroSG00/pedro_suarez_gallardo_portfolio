'use client';

type Props = {
  id: string;
  index: string;
  label: string;
};

export default function SectionHeading({ id, index, label }: Props) {
  if (!id || !label) {
    return null;
  }

  const number = `${index} /`;

  return (
    <h2 id={id} tabIndex={-1} data-section-heading className="relative mx-auto flex max-w-[calc(var(--grid-max-width)+2*var(--grid-gutter))] items-baseline gap-4 px-(--grid-gutter) py-5 text-title max-sm:flex-wrap max-sm:gap-y-0 max-sm:pe-4 max-sm:wrap-anywhere">
      <span aria-hidden="true" className="shrink-0 text-meta text-ink-muted">{number}</span>{' '}
      {label}
    </h2>
  );
}
