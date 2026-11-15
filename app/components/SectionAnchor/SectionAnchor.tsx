/**
 * SectionAnchor.tsx — T17 (RF-3, RF-8)
 *
 * Section heading that doubles as a scroll anchor. Receives its content by
 * props (Constitution 3): no visible text or data is written in the
 * component. Renders an `<h2>` with an `id` so it can be linked to, made
 * focusable with `tabindex="-1"` so the title can receive focus after an
 * anchor jump, and `scroll-margin-top` so the title lands below the header.
 * No button or link is added inside.
 */
export function SectionAnchor({
  id,
  children,
}: {
  /** Anchor id used by in-page links and hash navigation. */
  id: string;
  /** Heading text, provided by the parent (dictionary resolved). */
  children: React.ReactNode;
}) {
  return (
    <h2 id={id} tabIndex={-1} style={{ scrollMarginTop: 'var(--header-height, 64px)' }}>
      {children}
    </h2>
  );
}
