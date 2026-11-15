'use client';

import { useSyncExternalStore } from 'react';

import {
  getChoice,
  getServerChoice,
  setChoice,
  subscribe,
} from '../../../theme/store';
import { nextChoice } from '../../../theme/model';
import type { ThemeValue } from '../../../theme/constants';

/**
 * ThemeToggle — botón único de tres estados: light → dark → system → light.
 *
 * Lee la elección del store externo con useSyncExternalStore (sin useState ni
 * useEffect, sin escribir className/classList). Al hacer click avanza el ciclo
 * y delega la persistencia y la escritura al DOM al store. Nunca mueve el
 * foco. Los textos visibles y el nombre accesible llegan por props.
 */
export function ThemeToggle({
  stateLabels,
  ariaLabels,
}: {
  /** Texto visible de cada opción, desde el diccionario. */
  stateLabels: Record<ThemeValue, string>;
  /** Nombre accesible de frase completa de cada opción, desde el diccionario. */
  ariaLabels: Record<ThemeValue, string>;
}) {
  const choice = useSyncExternalStore(
    subscribe,
    getChoice,
    getServerChoice
  );

  return (
    <button
      type="button"
      aria-label={ariaLabels[choice]}
      onClick={() => setChoice(nextChoice(choice))}
    >
      {stateLabels[choice]}
    </button>
  );
}
