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
    <h2 id={id} tabIndex={-1} data-section-heading>
      <span aria-hidden="true">{number}</span>{' '}
      {label}
    </h2>
  );
}
