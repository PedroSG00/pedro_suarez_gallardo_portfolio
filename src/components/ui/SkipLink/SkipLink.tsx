'use client';

type Props = {
  label: string;
  href?: string;
};

export default function SkipLink({ label, href = '#main' }: Props) {
  if (!label) {
    return null;
  }

  return (
    <a
      href={href}
      className={`
        absolute
        w-[1px] h-[1px]
        p-0 m-[-1px]
        overflow-hidden
        whitespace-nowrap
        border-0
        clip-[rect(0,0,0,0)]
        focus-visible:static
        focus-visible:w-auto
        focus-visible:h-auto
        focus-visible:m-0
        focus-visible:clip-auto
        focus-visible:overflow-visible
        focus-visible:whitespace-normal
        focus-visible:bg-[var(--color-surface)]
        focus-visible:text-[var(--color-ink)]
        focus-visible:px-[calc(var(--spacing)*6)]
        focus-visible:py-[calc(var(--spacing)*4)]
        focus-visible:border [var(--line-width)] solid [var(--color-line)]
        focus-visible:z-[var(--nav-z)]
        focus-visible:outline-[calc(var(--line-width)*2)] solid [var(--color-focus)]
        focus-visible:outline-offset-[calc(var(--spacing)/2)]
      `}
    >
      {label}
    </a>
  );
}
