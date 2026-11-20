export type SectionId = 'about' | 'work' | 'stack' | 'contact';

export type SectionIndex = '01' | '02' | '03' | '04';

export interface SectionDefinition {
  id: SectionId;
  index: SectionIndex;
}

export interface SectionDestination extends SectionDefinition {
  label: string;
}

export const SECTION_DEFINITIONS: readonly SectionDefinition[] = [
  { id: 'about', index: '01' },
  { id: 'work', index: '02' },
  { id: 'stack', index: '03' },
  { id: 'contact', index: '04' },
];

export function buildSectionDestinations(
  navLabels: Record<SectionId, string>
): SectionDestination[] {
  return SECTION_DEFINITIONS.map(({ id, index }) => ({
    id,
    index,
    label: navLabels[id],
  }));
}
