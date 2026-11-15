/**
 * active-destination.ts — T3 (RF-5)
 * Función pura: decide qué destino es el activo a partir de métricas de scroll.
 * No toca `window`, `document` ni el DOM: recibe números y devuelve exactamente un id.
 *
 * Regla (plan §3):
 * - Mientras el scroll esté en el principio (top ≤ 0), el activo es Inicio.
 * - A partir de ahí, el activo es la última sección en orden de documento cuyo
 *   titular ha cruzado el borde inferior de la cabecera (top + headerHeight).
 *
 * Eso garantiza exactamente un destino activo, nunca dos: ni siquiera con
 * secciones solapadas o una sección más corta que la cabecera.
 */

import { DestinationId } from './destinations';

export type SectionPosition = {
  id: DestinationId;
  /** Offset del titular de la sección desde el inicio del documento (px). */
  top: number;
};

export type ActiveDestinationMetrics = {
  /** Posición del scroll desde el inicio del documento (px). */
  top: number;
  /** Altura actual de la cabecera (px), medida cuando monta. */
  headerHeight: number;
  /** Secciones en orden de documento (las de la portada; Inicio no va aquí). */
  sections: readonly SectionPosition[];
};

/**
 * Devuelve exactamente un `DestinationId`. Nunca dos, nunca ninguno.
 *
 * - `top ≤ 0` → `'home'` (RF-5: Inicio cuando está en el principio de la página).
 * - De lo contrario → la última sección cuyo `top ≤ top + headerHeight`,
 *   o `'home'` si ninguna ha cruzado todavía.
 */
export function activeDestination(
  metrics: ActiveDestinationMetrics
): DestinationId {
  const { top, headerHeight, sections } = metrics;

  if (top <= 0) {
    return 'home';
  }

  const threshold = top + headerHeight; // borde inferior de la cabecera en el documento
  let active: DestinationId = 'home';

  for (const section of sections) {
    // "Última sección cuyo titular cruzó el borde inferior de la cabecera".
    // Iterar en orden de documento y sobrescribir deja la última cruzada,
    // aun cuando varias cumplan la condición a la vez.
    if (section.top <= threshold) {
      active = section.id;
    }
  }

  return active;
}
