import { describe, it, expect } from 'vitest';
import { aplicarEvento, estadoInicial, medir } from './header-shift';
import casesRaw from '../../../tests/fixtures/header-cases.json';

type HeaderCase = {
  id: string;
  tops: number[];
  headerHeight: number;
  expected: { offset: number; visible: boolean; contentShiftPx: number };
};

const cases = casesRaw as unknown as HeaderCase[];

function scrollTo(tops: number[], headerHeight: number) {
  return tops.reduce(
    (state, top) => aplicarEvento(state, { type: 'scroll', top }),
    estadoInicial(headerHeight)
  );
}

// T4 (004): Matriz de la racha y retirada progresiva — RF covered: RF-4, RNF-4
// Done when: offset = 0 hasta 64 px, progresión min(1, (top − 64) / (2 × altura)),
// tope de una altura y retorno completo al subir, siempre con contentShiftPx = 0.
describe('header-shift — T4 (RF-4, RNF-4)', () => {
  const HEIGHT = 100;

  it('offset = 0 hasta 64 px de scroll hacia abajo', () => {
    for (const top of [0, 1, 32, 63, 64]) {
      const state = scrollTo([top], HEIGHT);
      expect(medir(state).offset).toBe(0);
      expect(medir(state).visible).toBe(true);
      expect(medir(state).contentShiftPx).toBe(0);
    }
  });

  it('progresión min(1, (top − 64) / (2 × altura)) al bajar más de 64 px', () => {
    // top = 64 + 100 → (100)/(200) = 0.5 → offset = -50
    const medio = scrollTo([64 + 100], HEIGHT);
    expect(medir(medio).offset).toBe(-50);
    expect(medir(medio).visible).toBe(false);

    // top = 64 + 200 → 200/200 = 1 → offset = -100 (tope de una altura)
    const tope = scrollTo([64 + 200], HEIGHT);
    expect(medir(tope).offset).toBe(-HEIGHT);
    expect(medir(tope).visible).toBe(false);
  });

  it('tope de una altura: offset nunca supera -altura', () => {
    const pasado = scrollTo([64 + 500], HEIGHT); // progreso > 1, se corta
    expect(medir(pasado).offset).toBe(-HEIGHT);
    expect(medir(pasado).contentShiftPx).toBe(0);
  });

  it('retorno completo al subir: offset vuelve a 0 aunque sea poco', () => {
    const estado = scrollTo([64 + 200, 200], HEIGHT); // baja al tope, sube un poco
    expect(medir(estado).offset).toBe(0);
    expect(medir(estado).visible).toBe(true);
    expect(medir(estado).contentShiftPx).toBe(0);
  });

  it('contentShiftPx = 0 siempre (sin desplazamiento de contenido)', () => {
    const estado = scrollTo([0, 64, 164, 264, 100, 0], HEIGHT);
    expect(medir(estado).contentShiftPx).toBe(0);
  });

  it('la matriz de fixtures produce exactamente el estado esperado', () => {
    for (const c of cases) {
      const estado = scrollTo(c.tops, c.headerHeight);
      const observado = medir(estado);
      expect(observado.offset).toBe(c.expected.offset);
      expect(observado.visible).toBe(c.expected.visible);
      expect(observado.contentShiftPx).toBe(c.expected.contentShiftPx);
    }
  });
});
