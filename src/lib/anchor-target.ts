import type { SectionId } from "@/content/sections";

export type AnchorResolutionReason = "valid" | "empty" | "unknown";

export interface AnchorResolution {
  targetId: SectionId | null;
  reason: AnchorResolutionReason;
}

/**
 * Resolves a location hash against the existing section ids (RF-13).
 * Pure: it never navigates, never touches the DOM and never throws.
 * Anything that is not an exact section id (uppercase, query, extra
 * segments, invalid characters) is `unknown`, so the caller does nothing.
 */
export function resolveAnchorTarget(
  hash: string,
  sectionIds: readonly SectionId[]
): AnchorResolution {
  const raw = hash.replace(/^#/, "");

  if (raw === "") return { targetId: null, reason: "empty" };

  const targetId = sectionIds.find((id) => id === raw);

  if (targetId === undefined) return { targetId: null, reason: "unknown" };

  return { targetId, reason: "valid" };
}
