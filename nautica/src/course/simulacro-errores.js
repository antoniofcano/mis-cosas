// Simulacro de tus errores (R-43): un simulacro armado a propósito con preguntas cuyos distractores son justo los
// errores que repites, para obligarte a no caer.
//
// - De dónde salen: el índice estático de cada banco (data/ejes/<eje>/<tit>/distractores.json, generado por
//   tools/indice-errores.mjs con el mismo rigor que el diagnóstico: un único error explica esa opción) y los errores
//   del alumno (src/store/errores.js, resumen(): los vivos, con su cuenta `n`).
// - Qué preguntas: solo del estudio del alumno (banco.estudio: nunca las reservadas para el examen final ni las
//   retiradas) y nunca anuladas ni sin respuesta oficial. Primero las no vistas, después las falladas y al final las
//   acertadas; repartidas entre sus errores (una para cada error y el resto en proporción a cuántas veces lo comete,
//   reparto de D'Hondt), sin repetir.
// - Con qué errores: los del alumno si tiene al menos MIN_VECES errores registrados, al menos MIN_VECES de ellos salen
//   como distractor en su banco y con ellos se juntan al menos MINIMO preguntas. Si no, se dice por qué y se arma con los errores que más
//   ponen los tribunales en ese banco (los que más preguntas tienen como distractor en el índice).
// - Cuántas: OBJETIVO (lo de un módulo de carta) o las que haya si son menos. Tiempo: el presupuesto de la estrategia
//   (src/course/estrategia.js): las de carta al ritmo de la carta y las demás al ritmo medio de su parte del examen.
// - No es un examen con el reparto oficial: no da apto (la vista lo guarda con `tipo: 'errores'` y `apto: null`).
// Lógica pura (sin DOM); la interfaz está en src/ui/simulacro-errores.js.

import { ERRORES } from '../exams/taxonomia.js';
import { presupuestoTiempo } from './estrategia.js';

/** Preguntas que se buscan (lo de un módulo de carta). */
export const OBJETIVO = 10;
/** Por debajo de esto no se arma con tus errores (se ofrece el de los tribunales). */
export const MINIMO = 5;
/** Errores registrados (vivos y que salen en el banco) que hacen falta para armarlo con los tuyos. */
export const MIN_VECES = 2;
/** Errores distintos que entran como mucho. */
export const MAX_ERRORES = 5;

export const TITULO = 'Simulacro de tus errores';

const vale = (q) => q && !q.anulada && q.correcta && q.norma?.estado !== 'retirada';

/**
 * Preguntas del estudio por error típico que tienen como distractor: Map error → [pregunta] (orden del banco).
 * @param {Record<string, Record<string,string>>} indice  id → { letra: error }
 * @param {object[]} estudio  banco.estudio del alumno
 */
export function preguntasPorError(indice, estudio) {
  const m = new Map();
  for (const q of estudio) {
    const d = indice?.[q.id];
    if (!d || !vale(q)) continue;
    for (const e of new Set(Object.values(d))) {
      if (!ERRORES[e]) continue;
      if (!m.has(e)) m.set(e, []);
      m.get(e).push(q);
    }
  }
  return m;
}

/** Los errores que más ponen los tribunales en este banco: [{ id, peso }] (peso = preguntas que lo tienen de distractor). */
export function erroresDelTribunal(porError, max = MAX_ERRORES) {
  return [...porError].map(([id, qs]) => ({ id, peso: qs.length })).sort((a, b) => b.peso - a.peso || a.id.localeCompare(b.id)).slice(0, max);
}

/**
 * Qué errores entran: los tuyos o, si no bastan, los de los tribunales (con el motivo).
 * @param {{ errores: {id, n}[], superados?: object[] }} resumen  de src/store/errores.js
 * @returns {{ modo: 'tuyos'|'tribunal', motivo: null|'sin-errores'|'superados'|'pocos'|'sin-preguntas', errores: {id, peso}[], tuyos: string[], veces: number }}
 *   `veces`: errores registrados vivos (la suma de sus cuentas).
 */
export function elegirErrores(porError, resumen) {
  const vivos = (resumen?.errores ?? []).filter((e) => e.n > 0);
  const tuyos = vivos.map((e) => e.id);
  const enBanco = vivos.filter((e) => porError.has(e.id)).slice(0, MAX_ERRORES).map((e) => ({ id: e.id, peso: e.n }));
  const veces = vivos.reduce((s, e) => s + e.n, 0);
  const enElBanco = enBanco.reduce((s, e) => s + e.peso, 0);
  const preguntas = new Set(enBanco.flatMap((e) => porError.get(e.id).map((q) => q.id))).size;
  let motivo = null;
  if (!vivos.length) motivo = resumen?.superados?.length ? 'superados' : 'sin-errores';
  else if (veces < MIN_VECES) motivo = 'pocos';
  else if (enElBanco < MIN_VECES) motivo = 'sin-preguntas';
  else if (preguntas < MINIMO) motivo = 'sin-preguntas';
  if (!motivo) return { modo: 'tuyos', motivo, errores: enBanco, tuyos, veces };
  return { modo: 'tribunal', motivo, errores: erroresDelTribunal(porError), tuyos, veces };
}

/**
 * Arma el simulacro.
 * @param {{ indice: object, estudio: object[], resumen: object, respuestas?: Record<string,{ok:boolean}>, rng: object, objetivo?: number }} o
 * @returns {{ tipo: 'errores', titulo, modo, motivo, errores: {id, peso, disponibles, puestas}[], tuyos: string[],
 *   preguntas: object[], objetivos: Record<string,string[]>, faltan: [], nuevas: number }}
 *   `objetivos`: por pregunta, los errores elegidos que tiene como distractor (los que se corrigen y se dan por superados).
 */
export function armarSimulacroErrores({ indice, estudio, resumen, respuestas = {}, rng, objetivo = OBJETIVO }) {
  const porError = preguntasPorError(indice, estudio);
  const sel = elegirErrores(porError, resumen);
  const ids = new Set(sel.errores.map((e) => e.id));
  const prioridad = (q) => (!respuestas[q.id] ? 0 : respuestas[q.id].ok ? 2 : 1);
  // Candidatas de cada error: barajadas y, dentro de eso, primero las no vistas, luego las falladas.
  const cola = new Map(sel.errores.map((e) => [e.id, rng.shuffle(porError.get(e.id) ?? []).map((q, i) => ({ q, i, p: prioridad(q) }))
    .sort((a, b) => a.p - b.p || a.i - b.i).map((x) => x.q)]));
  const puestas = new Map(sel.errores.map((e) => [e.id, 0]));
  const usadas = new Set();
  const preguntas = [];
  const objetivos = {};
  const tomar = (e) => {
    const c = cola.get(e);
    while (c.length && usadas.has(c[0].id)) c.shift();
    const q = c.shift();
    if (!q) return false;
    usadas.add(q.id);
    preguntas.push(q);
    const suyos = [...new Set(Object.values(indice[q.id]))].filter((x) => ids.has(x));
    objetivos[q.id] = suyos;
    for (const x of suyos) puestas.set(x, puestas.get(x) + 1);
    return true;
  };
  // Una para cada error (de más a menos peso) y el resto por D'Hondt: peso / (puestas + 1).
  for (const e of sel.errores) if (preguntas.length < objetivo) tomar(e.id);
  while (preguntas.length < objetivo) {
    const vivos = sel.errores.filter((e) => cola.get(e.id).some((q) => !usadas.has(q.id)));
    if (!vivos.length) break;
    const e = vivos.reduce((a, b) => (b.peso / (puestas.get(b.id) + 1) > a.peso / (puestas.get(a.id) + 1) ? b : a));
    tomar(e.id);
  }
  return {
    tipo: 'errores', titulo: TITULO, modo: sel.modo, motivo: sel.motivo, tuyos: sel.tuyos, veces: sel.veces,
    errores: sel.errores.map((e) => ({ ...e, disponibles: porError.get(e.id)?.length ?? 0, puestas: puestas.get(e.id) })),
    preguntas, objetivos, faltan: [], nuevas: preguntas.filter((q) => !respuestas[q.id]).length,
  };
}

/**
 * Minutos del simulacro con el presupuesto de la estrategia: cada pregunta de carta al ritmo de la carta de su parte
 * del examen y las demás al ritmo medio de esa parte (duración / preguntas). Redondeado hacia arriba; al menos 5.
 * @param {object[]} preguntas
 * @param {object} T  TITULACIONES[tit]
 */
export function minutosSimulacro(preguntas, T) {
  const E = T.estructura;
  const tramos = presupuestoTiempo(T);
  const tramoDe = (ut) => {
    const m = E.modulos?.find((x) => x.uts.includes(ut));
    return (m ? tramos.find((t) => t.id === m.id) : tramos[0]) ?? tramos[0];
  };
  const preguntasDe = (t) => t.filas.reduce((s, f) => s + (f.preguntas ?? 0), 0);
  const min = preguntas.reduce((s, q) => {
    const t = tramoDe(q.ut);
    const carta = q.ut === T.cartaUt && t.filas.find((f) => f.parte === 'carta');
    return s + (carta ? carta.porPregunta : t.duracionMin / Math.max(1, preguntasDe(t)));
  }, 0);
  return Math.max(5, Math.ceil(min));
}

/**
 * Estructura con la que se hace y se corrige: la del examen sin límites por tema ni nota mínima (no es un examen con el
 * reparto oficial: grade() no da apto) y con el tiempo del simulacro. `sinApto` lo marca para la vista.
 */
export function estructuraErrores(E0, min) {
  return { ...E0, modulos: undefined, modulo: null, sinApto: true, duracionMin: min, minAciertos: 0, bloques: E0.bloques.map((b) => ({ ...b, maxErrores: null })) };
}

/**
 * Corrección: por pregunta, si caíste en un error típico (la opción marcada la explica un único error, según el
 * índice) y si es uno de los tuyos («has vuelto a…»); al acertar, los errores que esquivaste (sus objetivos).
 * @returns {{ porPregunta: Record<string, { ok, marcada, cayo: string|null, otraVez: boolean, esquivados: string[] }>,
 *   balance: { id, puestas, esquivadas, caidas }[] }}
 */
export function corregirErrores({ preguntas, respuestas, indice, objetivos, tuyos = [] }) {
  const mios = new Set(tuyos);
  const porPregunta = {};
  const balance = new Map();
  const b = (id) => { if (!balance.has(id)) balance.set(id, { id, puestas: 0, esquivadas: 0, caidas: 0 }); return balance.get(id); };
  for (const q of preguntas) {
    const marcada = respuestas[q.id] ?? null;
    const ok = marcada != null && marcada === q.correcta;
    const cayo = !ok && marcada ? indice?.[q.id]?.[marcada] ?? null : null;
    const obj = objetivos?.[q.id] ?? [];
    for (const e of obj) { const x = b(e); x.puestas += 1; if (ok) x.esquivadas += 1; }
    if (cayo && obj.includes(cayo)) b(cayo).caidas += 1;
    porPregunta[q.id] = { ok, marcada, cayo, otraVez: !!cayo && mios.has(cayo), esquivados: ok ? obj : [] };
  }
  return { porPregunta, balance: [...balance.values()] };
}

/** Por qué no se arma con tus errores (o null si sí). */
export function textoMotivo(motivo, { n = 0 } = {}) {
  return {
    'sin-errores': 'Aún no tienes errores registrados. Se apuntan cuando fallas una pregunta de carta o de cuentas con un error reconocible, o un paso de «Resolver paso a paso».',
    superados: 'Has superado los errores que tenías registrados. Si vuelves a cometer alguno, volverá aquí.',
    pocos: `Aún tienes pocos errores registrados (${n}) para armar el simulacro con los tuyos.`,
    'sin-preguntas': 'Tus errores casi no salen como distractor en las preguntas de tu tribunal.',
  }[motivo] ?? null;
}
