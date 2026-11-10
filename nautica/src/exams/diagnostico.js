// Diagnóstico por tipo de error en las preguntas reales con resolución programada (R-36).
//
// Método: se vuelve a resolver la pregunta con un kit «con un error típico» (createKit(chart, { error }), una vez por
// cada variante de src/exams/taxonomia.js) y se mira a qué opción lleva, con el mismo criterio que la resolución buena
// (chooseOption de src/exams/options.js). Rigor:
//   - una variante explica la opción X solo si chooseOption la elige sin empate, cada valor cae dentro de la
//     tolerancia de examen del de X (src/analysis/quantities.js; con 1,5 o 2 tolerancias salían coincidencias de
//     tribunal que no eran el error: «339°, 8,8 nudos» contra «339°, 8,3 nudos»), la resolución
//     sin error NO lleva a X y X no es la oficial (ni una aceptada);
//   - se afirma un diagnóstico solo si todas las variantes que explican X son del mismo error («unico»); si son de dos
//     errores distintos se dice «puede ser A o B» («ambiguo»); con tres o más, nada. Nunca se inventa un motivo.
// Sin DOM: lo usan la vista de la pregunta, el panel del profe y tools/diagnostico-cobertura.mjs.

import { createKit } from './kit.js';
import { chooseOption } from './options.js';
import { VARIANTES, tipoDe } from './taxonomia.js';
import { quantity } from '../analysis/quantities.js';

/** Margen máximo (en tolerancias de examen por valor) para que una variante «caiga» en una opción. */
export const MARGEN = 1;

const cache = new Map();

/**
 * Resuelve la pregunta sin error y con cada variante. Devuelve { base, variantes: [{ variante, tipo, values, pick }] }
 * o null si no tiene resolución o falla. Se guarda por pregunta (las variantes no dependen del alumno).
 */
export function resolverVariantes(q, sol, chart) {
  if (!sol) return null;
  const clave = q.id;
  if (cache.has(clave)) return cache.get(clave);
  let base;
  try {
    const values = sol.solve(createKit(chart), q);
    base = { values, pick: chooseOption(q.opciones ?? {}, values) };
  } catch {
    cache.set(clave, null);
    return null;
  }
  const variantes = [];
  for (const variante of VARIANTES) {
    let values;
    try { values = sol.solve(createKit(chart, { error: variante }), q); } catch { continue; }
    if (!values?.length || values.some((v) => !Number.isFinite(v.value))) continue;
    variantes.push({ variante, tipo: tipoDe(variante), values, pick: chooseOption(q.opciones ?? {}, values) });
  }
  const r = { base, variantes };
  if (cache.size > 200) cache.delete(cache.keys().next().value);
  cache.set(clave, r);
  return r;
}

/** ¿Esta opción es buena (la oficial, una aceptada o el mismo texto que la oficial)? */
function esBuena(q, x, base) {
  if (q.anulada || !q.correcta) return true; // sin respuesta oficial no hay opción «errónea» que explicar
  return x === q.correcta || (q.aceptadas ?? []).includes(x) || (base.pick.choice === q.correcta && base.pick.repetidas.includes(x));
}

/** Variantes que llevan a la opción `x` con el criterio de arriba. */
export function variantesQueLlevanA(q, r, x) {
  if (!r || esBuena(q, x, r.base)) return [];
  if (r.base.pick.choice === x || r.base.pick.repetidas.includes(x)) return [];
  return r.variantes.filter((v) => {
    const p = v.pick;
    if (!(p.choice === x || p.repetidas.includes(x)) || p.empate.length) return false;
    // Cada valor, cerca del de la opción (no basta con que la media lo esté).
    const leidos = p.parsed[x];
    return !!leidos && v.values.every((val, i) => { const qn = quantity(val.kind); return qn.error(leidos[i], val.value) / qn.tolerance <= MARGEN; });
  });
}

/**
 * Diagnóstico de la opción marcada.
 * @returns {{ estado: 'acierto'|'sin-resolucion'|'unico'|'ambiguo'|'ninguno', marcada: string, tipos: string[],
 *   valores: Record<string, {kind, value}[]> }}  `valores`: lo que sale con cada error (el de su primera variante).
 */
export function diagnosticar(q, marcada, { sol, chart }) {
  const r = resolverVariantes(q, sol, chart);
  if (!r) return { estado: 'sin-resolucion', marcada, tipos: [], valores: {} };
  if (esBuena(q, marcada, r.base)) return { estado: 'acierto', marcada, tipos: [], valores: {} };
  const vs = variantesQueLlevanA(q, r, marcada);
  const tipos = [...new Set(vs.map((v) => v.tipo))];
  const valores = Object.fromEntries(tipos.map((t) => [t, vs.find((v) => v.tipo === t).values]));
  const estado = tipos.length === 0 ? 'ninguno' : tipos.length === 1 ? 'unico' : 'ambiguo';
  return { estado, marcada, tipos, valores };
}

/** ¿Se puede enseñar? Único, o ambiguo entre dos errores. */
export const diagnosticoUtil = (d) => d.estado === 'unico' || (d.estado === 'ambiguo' && d.tipos.length === 2);
