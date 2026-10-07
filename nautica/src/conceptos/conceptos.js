// Conceptos de las preguntas de un banco (un eje y una titulación) y lo que el alumno domina de cada uno.
// Funciones puras: reciben el catálogo indexado (src/conceptos/catalogo.js), las etiquetas del banco
// ({ idPregunta: [principal, secundario?] }) y el banco (src/bancos: todas, estudio, porId). Las respuestas del alumno
// son las de progress.exams: { idPregunta: { ok, t, n?, ok1?, choice? } } (la última respuesta de cada pregunta).
//
// Los bancos no se mezclan: todo lo que se devuelve es del banco recibido. El estudio (preguntasDe, variante) nunca
// ofrece preguntas reservadas para el examen final, anuladas ni retiradas por la norma (banco.estudio ya viene sin las
// reservadas ni las retiradas).

import { etiquetasDe } from './catalogo.js';

const retirada = (q) => q?.norma?.estado === 'retirada';
const valida = (q) => q && !q.anulada && q.correcta != null && !retirada(q);
const normaliza = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ]+/g, ' ').trim();

/** Umbrales del estado de un concepto (con la tasa suavizada (aciertos+1)/(vistas+2)). */
export const UMBRALES = { flojo: 0.6, dominado: 0.8, vistasDominado: 3 };

/**
 * Resumen de un conjunto de preguntas con las respuestas del alumno.
 * @returns {{ preguntas: number, vistas: number, aciertos: number, fallos: number, tasa: number,
 *   ultimo: { id: string, t: string|null, ok: boolean } | null, estado: 'sin-datos'|'flojo'|'en-progreso'|'dominado' }}
 */
export function resumenDominio(qs, respuestas = {}, enEstudio = null) {
  let vistas = 0; let aciertos = 0; let ultimo = null;
  for (const q of qs) {
    const r = respuestas[q.id];
    if (!r || typeof r.ok !== 'boolean') continue;
    vistas += 1;
    if (r.ok) aciertos += 1;
    if (!ultimo || String(r.t ?? '') > String(ultimo.t ?? '')) ultimo = { id: q.id, t: r.t ?? null, ok: r.ok };
  }
  const fallos = vistas - aciertos;
  const tasa = (aciertos + 1) / (vistas + 2);
  let estado = 'en-progreso';
  if (!vistas) estado = 'sin-datos';
  else if (ultimo.ok === false || tasa < UMBRALES.flojo) estado = 'flojo';
  else if (vistas >= UMBRALES.vistasDominado && tasa >= UMBRALES.dominado) estado = 'dominado';
  const preguntas = enEstudio ? qs.filter((q) => enEstudio.has(q.id)).length : qs.length;
  return { preguntas, vistas, aciertos, fallos, tasa: Number(tasa.toFixed(3)), ultimo, estado };
}

/**
 * @param {{ catalogo: ReturnType<import('./catalogo.js').indexarCatalogo>, etiquetas: Record<string, string[]>,
 *   banco: { todas: object[], estudio: object[], porId: Map<string, object> } }} p
 */
export function crearIndiceConceptos({ catalogo, etiquetas = {}, banco }) {
  const orden = new Map(banco.todas.map((q, i) => [q.id, i]));
  const enEstudio = new Set(banco.estudio.map((q) => q.id));
  // concepto → [{ id, principal }] (solo preguntas de este banco y conceptos del catálogo), en el orden del banco
  const porConcepto = new Map();
  const deCadaPregunta = new Map();
  for (const id of Object.keys(etiquetas).sort((a, b) => (orden.get(a) ?? 1e9) - (orden.get(b) ?? 1e9))) {
    if (!banco.porId.has(id)) continue;
    const cs = etiquetasDe(etiquetas, id).filter((c) => catalogo.porId.has(c));
    if (!cs.length) continue;
    deCadaPregunta.set(id, cs);
    cs.forEach((c, i) => porConcepto.set(c, [...(porConcepto.get(c) ?? []), { id, principal: i === 0 }]));
  }

  /** Ids de los conceptos de una pregunta (el primero, el principal); [] si no está etiquetada. */
  const conceptosDe = (idPregunta) => [...(deCadaPregunta.get(idPregunta) ?? [])];
  const principalDe = (idPregunta) => deCadaPregunta.get(idPregunta)?.[0] ?? null;

  /**
   * Preguntas de un concepto (objetos del banco, en su orden). Con un grupo, las de todos los conceptos que cuelgan de él.
   * - soloEstudio (por defecto): solo las que se estudian (sin reservadas para el examen final, anuladas ni retiradas).
   *   Con false, todas las del banco salvo las anuladas y las retiradas.
   * - soloPrincipal: solo las que lo tienen como concepto principal.
   */
  function preguntasDe(conceptoId, { soloEstudio = true, soloPrincipal = false, conDescendientes = true } = {}) {
    const ids = conDescendientes ? catalogo.descendientes(conceptoId) : [conceptoId];
    const vistos = new Set();
    const r = [];
    for (const c of ids) {
      for (const e of porConcepto.get(c) ?? []) {
        if (vistos.has(e.id) || (soloPrincipal && !e.principal)) continue;
        if (soloEstudio && !enEstudio.has(e.id)) continue;
        const q = banco.porId.get(e.id);
        if (!valida(q)) continue;
        vistos.add(e.id);
        r.push(q);
      }
    }
    return ids.length > 1 ? r.sort((a, b) => orden.get(a.id) - orden.get(b.id)) : r;
  }

  /** Conceptos con alguna pregunta en este banco (directa o en sus descendientes, si es un grupo). */
  const conceptosConPreguntas = () => catalogo.conceptos.filter((c) => catalogo.descendientes(c.id).some((d) => porConcepto.has(d)));

  /**
   * Dominio de cada concepto con preguntas en este banco (también los grupos, sumando los suyos), a partir de la última
   * respuesta del alumno a cada pregunta. Cuentan las preguntas no anuladas ni retiradas, también las del examen final
   * ya hecho (lo que se ha respondido es lo que se sabe); `preguntas` = cuántas hay para estudiar.
   * @returns {Record<string, ReturnType<typeof resumenDominio> & { id: string, tipo: string, etiqueta: string }>}
   */
  function dominio(respuestas = {}) {
    const r = {};
    for (const c of conceptosConPreguntas()) {
      const qs = preguntasDe(c.id, { soloEstudio: false });
      r[c.id] = { id: c.id, tipo: c.tipo, etiqueta: c.etiqueta, ...resumenDominio(qs, respuestas, enEstudio) };
    }
    return r;
  }

  /**
   * Conceptos flojos (tipo «concepto»): el último intento fallado o una tasa suavizada por debajo de UMBRALES.flojo.
   * Primero los de peor tasa; a igual tasa, el fallo más reciente.
   */
  function conceptosFlojos(respuestas = {}, { limite = Infinity } = {}) {
    return Object.values(dominio(respuestas))
      .filter((d) => d.tipo === 'concepto' && d.estado === 'flojo')
      .sort((a, b) => a.tasa - b.tasa || String(b.ultimo?.t ?? '').localeCompare(String(a.ultimo?.t ?? '')) || a.id.localeCompare(b.id))
      .slice(0, limite);
  }

  /**
   * Otra pregunta del mismo concepto principal y del mismo banco (eje y titulación) para repasar un fallo sin repetir
   * la letra. Solo del estudio. Orden de preferencia:
   *   1. las que tienen ese concepto como principal (antes que como secundario);
   *   2. las no vistas; luego las falladas, las más antiguas primero; luego las acertadas, las más antiguas primero;
   *      las respondidas hoy (`hoy`, 'YYYY-MM-DD'), al final;
   *   3. las casi iguales a la fallada (mismo enunciado o equivalentes por `concepto` de origen), solo si no hay otra.
   * Con `rng` (() => [0,1)) elige al azar entre las del mejor nivel; sin él, la primera en el orden del banco.
   * @returns {object|null} la pregunta, o null si la fallada no tiene concepto o no hay otra.
   */
  function variante(idPregunta, respuestas = {}, { rng = null, hoy = null } = {}) {
    const principal = principalDe(idPregunta);
    if (!principal) return null;
    const q0 = banco.porId.get(idPregunta);
    const texto0 = normaliza(q0?.enunciado);
    const casiIgual = (q) => (texto0 && normaliza(q.enunciado) === texto0)
      || (q0 && (q.concepto === q0.id || q0.concepto === q.id || (q0.concepto && q.concepto === q0.concepto)));
    const nivel = (q) => {
      const r = respuestas[q.id];
      const casi = casiIgual(q) ? 100 : 0;
      const sec = principalDe(q.id) === principal ? 0 : 10;
      if (!r || typeof r.ok !== 'boolean') return casi + sec;
      const t = String(r.t ?? '');
      if (hoy && t.slice(0, 10) === hoy) return casi + sec + 3;
      return casi + sec + (r.ok ? 2 : 1);
    };
    const cands = preguntasDe(principal, { soloEstudio: true, conDescendientes: false }).filter((q) => q.id !== idPregunta);
    if (!cands.length) return null;
    const conNivel = cands.map((q) => ({ q, n: nivel(q), t: String(respuestas[q.id]?.t ?? '') }));
    const mejor = Math.min(...conNivel.map((x) => x.n));
    const top = conNivel.filter((x) => x.n === mejor);
    if (mejor % 10 === 0) return (rng ? top[Math.floor(rng() * top.length)] : top[0]).q; // no vistas
    top.sort((a, b) => a.t.localeCompare(b.t)); // respondidas: la más antigua primero
    if (rng) {
      const tMin = top[0].t.slice(0, 10);
      const mismas = top.filter((x) => x.t.slice(0, 10) === tMin);
      return mismas[Math.floor(rng() * mismas.length)].q;
    }
    return top[0].q;
  }

  return { catalogo, conceptosDe, principalDe, concepto: catalogo.concepto, preguntasDe, conceptosConPreguntas, dominio, conceptosFlojos, variante, etiquetadas: () => [...deCadaPregunta.keys()] };
}
