// Clases de carta → preguntas reales de examen ya resueltas por la app (src/exams/solutions) del mismo tipo, para
// «Míralo resuelto en la carta». Se elige por el tipo de ejercicio de la solución o, cuando el tipo mezcla casos
// distintos, por la lista exacta de preguntas.

import { SOLUCIONES } from '../exams/solutions/index.js';

const porEjercicio = (...tipos) => (id, s) => tipos.includes(s.ejercicio);
const lista = (ids) => (id) => ids.includes(id);
const delPY = (f) => (id, s) => id.startsWith('and-py') && f(id, s);
const delPER = (f) => (id, s) => /^and-\d/.test(id) && f(id, s);

// Faro por el través (corte del rumbo con la demora del través) y tangente con viento: listas exactas.
const TRAVES = ['and-py-2022-c3-n15', 'and-py-2023-c1-n15', 'and-py-2023-c2-n12', 'and-py-2024-c1-n13', 'and-py-2024-c2-n14', 'and-py-2024-c3-n14',
  'and-py-2025-c2-n14', 'and-py-2025-c3-n14', 'and-py-2026-c1-n14', 'and-py-2026-c2-n14'];
const TANGENTE_VIENTO = ['and-py-2020-c1-n12', 'and-py-2020-c1-n13', 'and-py-2020-c3-n12', 'and-py-2021-c1-n14', 'and-py-2021-c2-n14', 'and-py-2022-c1-n12',
  'and-py-2022-c2-n12', 'and-py-2022-c3-n12', 'and-py-2023-c1-n12', 'and-py-2023-c2-n11', 'and-py-2023-c3-n13', 'and-py-2024-c1-n14', 'and-py-2024-c2-n12',
  'and-py-2024-c3-n12', 'and-py-2025-c1-n12', 'and-py-2026-c1-n12', 'and-py-2026-c2-n12'];

export const RESUELTOS = {
  'py-4-2': delPY((id, s) => s.ejercicio === 'abatimiento' && !TANGENTE_VIENTO.includes(id) && !TRAVES.includes(id)),
  'py-4-3': lista(TANGENTE_VIENTO),
  'py-4-4': delPY(porEjercicio('demoras-no-simultaneas', 'situacion-dos-demoras', 'situacion-demora-distancia')),
  'py-4-5': delPY(porEjercicio('corriente-efectiva')),
  'py-4-6': lista(TRAVES),
  'py-4-7': delPY(porEjercicio('corriente-rumbo-a-dar')),
  'py-4-8': delPY(porEjercicio('corriente-desconocida')),
  'py-4-9': delPY(porEjercicio('marea-sonda')),
  'py-4-10': delPY(porEjercicio('estima-analitica')),
  // PER: preguntas de carta del banco andalucia-per.json
  'per-11-2': delPER(porEjercicio('ct-enfilacion')),
  'per-11-3': delPER(porEjercicio('rumbo-distancia')),
  'per-11-4': delPER(porEjercicio('estima-directa')),
  'per-11-5': delPER(porEjercicio('situacion-demora-distancia', 'distancia-faro')),
  'per-11-6': delPER(porEjercicio('situacion-dos-demoras')),
  'per-11-7': delPER(porEjercicio('distancia-faro', 'ct-enfilacion')),
  'per-11-9': delPER(porEjercicio('rumbo-pasar-distancia')),
};

/** Ids de las preguntas resueltas que ilustran una clase (vacío si la clase no tiene). */
export function resueltasDe(leccionId) {
  const f = RESUELTOS[leccionId];
  return f ? Object.entries(SOLUCIONES).filter(([id, s]) => f(id, s)).map(([id]) => id) : [];
}

/**
 * Inserta el paso «resuelto» tras el primer paso de resolución de la clase («Resolución…», «Ejemplo resuelto»,
 * «Método paso a paso») y sus láminas; si no lo hay, antes de la pregunta final. Sin preguntas resueltas, la clase queda igual.
 */
export function conResuelto(pasos, ids) {
  if (!ids.length) return pasos;
  const paso = { tipo: 'resuelto', ids };
  let i = pasos.findIndex((p) => /^(Resolución|Ejemplo resuelto|Método paso a paso)/i.test(p.titulo ?? ''));
  if (i < 0) i = pasos.at(-1)?.tipo === 'check' ? pasos.length - 2 : pasos.length - 1;
  else while (pasos[i + 1]?.tipo === 'ilustracion') i += 1; // detrás de la lámina de la resolución
  return [...pasos.slice(0, i + 1), paso, ...pasos.slice(i + 1)];
}
