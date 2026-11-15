/**
 * header-shift.ts — T4 (RF-4, RNF-4)
 * Reductor puro de la retirada progresiva de la cabecera.
 *
 * Dado un estado y un evento de scroll, devuelve el nuevo estado junto con el
 * desplazamiento de la cabecera (offset). Nunca toca `window`, `document` ni
 * el DOM: es totalmente testeable sin navegador.
 *
 * Reglas de retirada (plan §3):
 * - top ≤ 0 → offset 0 (cabecera completa en el principio de la página).
 * - Scroll hacia arriba (subiendo) → offset 0: retorno completo al subir,
 *   aunque sea poco.
 * - top > 64 px y bajando → progresión min(1, (top − 64) / (2 × altura)),
 *   con tope de una altura (offset = −altura).
 * - contentShiftPx = 0 siempre: la cabecera se retira sin desplazar el
 *   contenido (Cero CLS).
 *
 * T5 añade las guardas (foco dentro, panel abierto, movimiento reducido,
 * resize, carga sin JavaScript y umbral de reversión de 8 px).
 */

export type ScrollDirection = 'bajando' | 'subiendo';

export type ShiftState = {
  top: number;
  topPrevio: number;
  direccion: ScrollDirection;
  offset: number;
  headerHeight: number;
};

export type ScrollEvent = {
  type: 'scroll';
  top: number;
};

export type HeaderShiftEvent = ScrollEvent;

/** Distancia desde el principio antes de empezar a retirar (px). */
const UMBRAL_INICIO = 64;

/** Estado inicial: cabecera completa, sin retirada, dirección hacia abajo. */
export function estadoInicial(headerHeight: number): ShiftState {
  return {
    top: 0,
    topPrevio: 0,
    direccion: 'bajando',
    offset: 0,
    headerHeight,
  };
}

/**
 * Aplica un evento de scroll sobre el estado y devuelve el siguiente estado.
 * Función pura: misma entrada produce siempre la misma salida.
 */
export function aplicarEvento(
  state: ShiftState,
  event: HeaderShiftEvent
): ShiftState {
  const delta = event.top - state.top;

  // Dirección por signo del delta (T5 refinará con el umbral de reversión de 8 px).
  const direccion: ScrollDirection = delta > 0 ? 'bajando' : 'subiendo';

  const next: ShiftState = {
    ...state,
    topPrevio: state.top,
    top: event.top,
    direccion,
  };

  if (event.top <= 0) {
    // Principio de la página: cabecera completa.
    next.offset = 0;
  } else if (direccion === 'subiendo') {
    // Retorno completo al subir, aunque sea poco (RF-4, caso 7).
    next.offset = 0;
  } else if (event.top > UMBRAL_INICIO) {
    // Retirada progresiva proporcional al scroll, tope de una altura.
    const recorrido = 2 * state.headerHeight;
    const progreso = Math.min(1, (event.top - UMBRAL_INICIO) / recorrido);
    next.offset = -state.headerHeight * progreso;
  } else {
    // Entre 0 y 64 px bajando: sin retirada.
    next.offset = 0;
  }

  return next;
}

/**
 * Lectura observable del estado: desplazamiento, visibilidad y el invariante
 * de cero desplazamiento de contenido.
 */
export function medir(state: ShiftState) {
  return {
    offset: state.offset,
    visible: state.offset === 0,
    contentShiftPx: 0,
  };
}
