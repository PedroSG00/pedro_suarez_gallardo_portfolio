import { describe, it, expect } from 'vitest';
import { activeDestination } from './active-destination';
import { DestinationId } from './destinations';

// T3 (004): Función pura del destino activo — RF covered: RF-5
// Done when: `activeDestination` devuelve exactamente un id y nunca dos, para
// `top = 0`, secciones solapadas y sección más corta que la cabecera.
type Section = { id: DestinationId; top: number };

function metrics({
  top = 0,
  headerHeight = 100,
  sections = [],
}: {
  top?: number;
  headerHeight?: number;
  sections?: Section[];
} = {}) {
  return { top, headerHeight, sections };
}

const EXPERIENCIA: Section = { id: 'experience', top: 800 };
const PROYECTOS: Section = { id: 'projects', top: 1600 };
const STACK: Section = { id: 'stack', top: 2400 };
const CONTACTO: Section = { id: 'contact', top: 3200 };
const TODAS_LAS_SECCIONES: Section[] = [
  EXPERIENCIA,
  PROYECTOS,
  STACK,
  CONTACTO,
];

describe('activeDestination — T3 (RF-5)', () => {
  it('marca Inicio cuando está en el principio de la página (top = 0)', () => {
    expect(
      activeDestination(metrics({ top: 0, sections: TODAS_LAS_SECCIONES }))
    ).toBe('home');
  });

  it('sigue marcando Inicio hasta que el primer titular cruza el borde inferior de la cabecera', () => {
    expect(
      activeDestination(metrics({ top: 699, sections: TODAS_LAS_SECCIONES })) // threshold 799 < 800
    ).toBe('home');
    expect(
      activeDestination(metrics({ top: 700, sections: TODAS_LAS_SECCIONES })) // threshold 800 >= 800
    ).toBe('experience');
  });

  it('avanza de sección en sección en orden de documento', () => {
    expect(
      activeDestination(metrics({ top: 700, sections: TODAS_LAS_SECCIONES }))
    ).toBe('experience');
    expect(
      activeDestination(metrics({ top: 1500, sections: TODAS_LAS_SECCIONES })) // threshold 1600
    ).toBe('projects');
    expect(
      activeDestination(metrics({ top: 2300, sections: TODAS_LAS_SECCIONES })) // threshold 2400
    ).toBe('stack');
    expect(
      activeDestination(metrics({ top: 3100, sections: TODAS_LAS_SECCIONES })) // threshold 3200
    ).toBe('contact');
  });

  it('devuelve exactamente un id (never two) con secciones solapadas', () => {
    const solapadas: Section[] = [
      { id: 'experience', top: 800 },
      { id: 'projects', top: 800 },
    ];
    const id = activeDestination(metrics({ top: 700, sections: solapadas })); // threshold 800

    expect(typeof id).toBe('string');
    expect(['experience', 'projects']).toContain(id);
  });

  it('devuelve exactamente un id (never two) con una sección más corta que la cabecera', () => {
    const cortas: Section[] = [
      { id: 'experience', top: 800 },
      { id: 'projects', top: 850 }, // 50 px de altura: más corta que la cabecera
    ];
    const id = activeDestination(
      metrics({ top: 760, headerHeight: 100, sections: cortas }) // threshold 860
    );

    expect(typeof id).toBe('string');
    expect(['experience', 'projects']).toContain(id);
  });

  it('nunca devuelve un titular que todavía no ha cruzado el borde inferior', () => {
    expect(
      activeDestination(metrics({ top: 100, sections: TODAS_LAS_SECCIONES })) // threshold 200 < 800
    ).toBe('home');
  });

  it('devuelve Inicio por defecto cuando no hay secciones', () => {
    expect(activeDestination(metrics({ top: 500, sections: [] }))).toBe('home');
  });
});
