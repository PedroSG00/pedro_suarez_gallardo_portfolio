/**
 * destinations.ts — T2 (RF-1, RF-3, RNF-8)
 * Single source of truth for the navigation destinations. Adding or removing a
 * destination is adding or removing a row: the header, the home page order and
 * the section anchors all read from this list.
 *
 * Hrefs are derived by the consumer: `#<sectionId>` on the home page and
 * `/<locale>#<sectionId>` from any other page, so this module holds no routes.
 */

export type DestinationId =
  | 'home'
  | 'experience'
  | 'projects'
  | 'stack'
  | 'contact';

export type Destination = {
  id: DestinationId;
  /** Dictionary key of the label; `nav.stack` is identical in both languages. */
  labelKey: `nav.${DestinationId}`;
  /** Anchor on the home page; `inicio` is the top of the document. */
  sectionId: string;
  /** Page that marks this destination as current; sections have none. */
  page: 'projects' | null;
};

/** Array order is the menu order and the home page section order (RF-3). */
export const DESTINATIONS = [
  { id: 'home', labelKey: 'nav.home', sectionId: 'inicio', page: null },
  {
    id: 'experience',
    labelKey: 'nav.experience',
    sectionId: 'experiencia',
    page: null,
  },
  {
    id: 'projects',
    labelKey: 'nav.projects',
    sectionId: 'proyectos',
    page: 'projects',
  },
  { id: 'stack', labelKey: 'nav.stack', sectionId: 'stack', page: null },
  {
    id: 'contact',
    labelKey: 'nav.contact',
    sectionId: 'contacto',
    page: null,
  },
] as const satisfies readonly Destination[];
