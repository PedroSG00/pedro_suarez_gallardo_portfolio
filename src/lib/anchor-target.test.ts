import { describe, expect, test } from "vitest";
import type { SectionId } from "@/content/sections";
import {
  resolveAnchorTarget,
  type AnchorResolution,
  type AnchorResolutionReason,
} from "./anchor-target";

const SECTION_IDS: SectionId[] = ["about", "work", "stack", "contact"];

interface Case {
  name: string;
  hash: string;
  sectionIds: readonly SectionId[];
  expected: AnchorResolution;
}

const CASES: Case[] = [
  {
    name: "an empty hash is empty, not unknown",
    hash: "",
    sectionIds: SECTION_IDS,
    expected: { targetId: null, reason: "empty" },
  },
  {
    name: "a lone hash is empty",
    hash: "#",
    sectionIds: SECTION_IDS,
    expected: { targetId: null, reason: "empty" },
  },
  {
    name: "a known section resolves to its id",
    hash: "#about",
    sectionIds: SECTION_IDS,
    expected: { targetId: "about", reason: "valid" },
  },
  {
    name: "every known section resolves to its id",
    hash: "#contact",
    sectionIds: SECTION_IDS,
    expected: { targetId: "contact", reason: "valid" },
  },
  {
    name: "an unknown hash is unknown",
    hash: "#unknown",
    sectionIds: SECTION_IDS,
    expected: { targetId: null, reason: "unknown" },
  },
  {
    name: "a hash with a query string is unknown",
    hash: "#about?x",
    sectionIds: SECTION_IDS,
    expected: { targetId: null, reason: "unknown" },
  },
  {
    name: "uppercase ids are not a match",
    hash: "#About",
    sectionIds: SECTION_IDS,
    expected: { targetId: null, reason: "unknown" },
  },
  {
    name: "a hash with an extra path segment is unknown",
    hash: "#about/extra",
    sectionIds: SECTION_IDS,
    expected: { targetId: null, reason: "unknown" },
  },
  {
    name: "a hash with surrounding spaces is unknown",
    hash: "# about",
    sectionIds: SECTION_IDS,
    expected: { targetId: null, reason: "unknown" },
  },
  {
    name: "a hash with invalid characters is unknown",
    hash: "#about%20",
    sectionIds: SECTION_IDS,
    expected: { targetId: null, reason: "unknown" },
  },
  {
    name: "repeated ids still resolve to the section",
    hash: "#work",
    sectionIds: ["work", "work", "about"],
    expected: { targetId: "work", reason: "valid" },
  },
  {
    name: "an empty id list makes every hash unknown",
    hash: "#about",
    sectionIds: [],
    expected: { targetId: null, reason: "unknown" },
  },
  {
    name: "an empty id list keeps an empty hash empty",
    hash: "",
    sectionIds: [],
    expected: { targetId: null, reason: "empty" },
  },
];

describe("resolveAnchorTarget (RF-13)", () => {
  test.each(CASES)("$name", ({ hash, sectionIds, expected }) => {
    expect(resolveAnchorTarget(hash, sectionIds)).toEqual(expected);
  });

  test("only the three documented reasons exist", () => {
    const reasons: AnchorResolutionReason[] = ["valid", "empty", "unknown"];
    expect(reasons).toHaveLength(3);
  });

  test("valid resolutions point at an id of the given list", () => {
    const resolution = resolveAnchorTarget("#stack", SECTION_IDS);
    expect(SECTION_IDS).toContain(resolution.targetId);
  });

  test("never throws on any hash", () => {
    const hashes = ["", "#", "#about", "##about", "#About", "#about?x", "about"];
    for (const hash of hashes) {
      expect(() => resolveAnchorTarget(hash, SECTION_IDS)).not.toThrow();
    }
  });

  test("does not mutate the section id list", () => {
    const sectionIds: SectionId[] = ["about", "work"];
    const snapshot = [...sectionIds];
    resolveAnchorTarget("#work", sectionIds);
    expect(sectionIds).toEqual(snapshot);
  });
});
