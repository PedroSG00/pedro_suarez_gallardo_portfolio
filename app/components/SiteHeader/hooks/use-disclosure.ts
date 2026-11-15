/**
 * use-disclosure.ts — T10 (RF-2, RF-7)
 * Common disclosure closer for <details>-based dropdowns (navigation and
 * language menu). JavaScript only adds closing behavior: Escape, click
 * outside, and selection. It never opens, never traps focus, never moves
 * focus, and does nothing when the disclosure is already closed.
 *
 * Returns { open, openIt, close, toggle, containerRef }:
 * - `open` — boolean state.
 * - `openIt` / `close` / `toggle` — control the open state.
 * - `containerRef` — attach to the <details> element so click-outside can
 *   distinguish inside from outside.
 */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export function useDisclosure() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDetailsElement | null>(null);

  const close = useCallback(() => setOpen(false), []);
  const openIt = useCallback(() => setOpen(true), []);
  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  // Escape and click-outside only when open (no effect when already closed).
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };

    const onMouseDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        close();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onMouseDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onMouseDown);
    };
  }, [open, close]);

  return { open, openIt, close, toggle, containerRef };
}
