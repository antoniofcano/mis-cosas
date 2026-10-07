// Explicaciones del profe para las preguntas de Andalucía que aún no tienen (las de 2015–2019, fase F5), reutilizando por
// concepto las del mismo tribunal: las explicaciones ya escritas de Andalucía.
//   node tools/bancos/ejes/andalucia/explicaciones.mjs lote <tit> <n> <de>   → JSON del lote n (1..de) de pendientes
//        (las que no son de carta), cada una con sus candidatas: primero la idéntica o la de mismo texto, si la hay, y
//        las 3 más parecidas del mismo tema, con su explicación y si su respuesta (por el texto de la opción) es la misma.
//   node tools/bancos/ejes/andalucia/explicaciones.mjs lote py <n> <de> --carta → igual, con las de carta del PY (que en
//        Andalucía también llevan explicación: el cálculo paso a paso, como las de 2020–2026).
//   node tools/bancos/ejes/andalucia/explicaciones.mjs fusionar               → junta tools/bancos/ejes/andalucia/explicaciones/*.json
//        en data/ejes/andalucia/<tit>/explicaciones.json (solo añade: una explicación ya publicada no se toca) y pone el
//        `concepto` de cada pregunta nueva (el id de la de Andalucía cuya explicación se adaptó; null si se escribió de cero).
//   node tools/bancos/ejes/andalucia/explicaciones.mjs estado                 → cuántas faltan.
// Formato de un fichero de lote: { "<id>": { explicacion, clave, trampa?, ilustraciones?, discrepancia?, defendible?,
//   concepto? } }. Nunca se reutiliza una explicación cuya respuesta correcta es otra: `revisar` lo comprueba con el texto
//   de las respuestas de las dos preguntas.
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parecido } from '../../../../src/bancos/equivalentes.js';
import { validSpec } from '../../../../src/illustrations/index.js';
import { BANCOS, RAIZ, escribirJSON, escribirTexto, leerJSON } from '../../lib/comun.mjs';
import { clave, textoPregunta } from '../../lib/texto.mjs';
import { textoBanco } from '../../etapas/escribir.mjs';

const EJE = 'andalucia';
const TITS = ['per', 'py'];
const CAMPOS = ['explicacion', 'clave', 'trampa', 'ilustraciones', 'discrepancia', 'defendible'];
// Nada de academias, escuelas ni centros que maquetaron los cuadernillos.
export const PROHIBIDO = /academia|escuela|sirocodiez|siroco ?10|zaporito|centro integrado/i;
const ruta = (tit, f) => join(RAIZ, 'data', 'ejes', EJE, tit, f);
const DIR = join(BANCOS, 'ejes', EJE, 'explicaciones');
const respuesta = (q) => (q.anulada ? 'ANULADA (todas las respuestas válidas)' : q.aceptadas.map((l) => `${l}) ${q.opciones[l]}`).join(' | '));
/** Texto de la respuesta (para comparar dos preguntas aunque sus letras sean otras). */
export const respuestaTexto = (q) => (q.anulada ? 'ANULADA' : q.aceptadas.map((l) => clave(q.opciones[l] ?? '')).sort().join(' + '));

const ficheros = () => (existsSync(DIR) ? readdirSync(DIR).filter((f) => f.endsWith('.json')).sort().map((f) => join(DIR, f)) : []);

/** Preguntas sin explicación (ni en el banco ni en un lote ya escrito) que no son de carta. */
export function pendientes(tit, { conLotes = true, carta = false } = {}) {
  const hechas = new Set(Object.keys(leerJSON(ruta(tit, 'explicaciones.json'), {})));
  if (conLotes) for (const f of ficheros()) for (const id of Object.keys(leerJSON(f))) hechas.add(id);
  // Con `carta`, solo las de carta (el PY de Andalucía explica también sus ejercicios de carta: el cálculo paso a paso).
  return leerJSON(ruta(tit, 'preguntas.json')).preguntas.filter((q) => q.requiere.includes('carta') === carta && !hechas.has(q.id));
}

/** Candidatas de Andalucía con explicación para una pregunta: la de mismo texto (si hay) y las 3 más parecidas del tema. */
export function candidatas(q, todas, expl, k = 3) {
  const conExpl = todas.filter((r) => r.id !== q.id && expl[r.id]);
  const t = textoPregunta(q);
  const mismas = conExpl.filter((r) => textoPregunta(r) === t);
  const resto = conExpl.filter((r) => r.ut === q.ut && !mismas.includes(r)).map((r) => ({ r, s: parecido(q, r) })).sort((a, b) => b.s - a.s).slice(0, k);
  return [...mismas.map((r) => ({ r, s: 1 })), ...resto].map(({ r, s }) => ({
    id: r.id, parecido: Number(s.toFixed(2)), mismoTexto: mismas.includes(r), mismaRespuesta: respuestaTexto(r) === respuestaTexto(q),
    enunciado: r.enunciado, opciones: r.opciones, respuesta: respuesta(r), explicacion: expl[r.id],
  }));
}

export function lote(tit, n, de, { carta = false } = {}) {
  const todas = leerJSON(ruta(tit, 'preguntas.json')).preguntas;
  const expl = leerJSON(ruta(tit, 'explicaciones.json'), {});
  // Los lotes se reparten sobre las que no tienen explicación en el banco (no cambian aunque ya haya lotes escritos).
  const pend = pendientes(tit, { conLotes: false, carta });
  const tam = Math.ceil(pend.length / de);
  return pend.slice((n - 1) * tam, n * tam).map((q) => ({
    id: q.id, ut: q.ut, ut_titulo: q.ut_titulo, fecha: q.fecha, convocatoria: q.convocatoria, bloque: q.bloque ?? undefined,
    enunciado: q.enunciado, opciones: q.opciones, respuesta: respuesta(q), contexto: q.contexto ?? undefined,
    tabla_mareas: q.tabla_mareas ?? undefined, requiere: q.requiere.length ? q.requiere : undefined,
    norma: q.norma, candidatas: candidatas(q, todas, expl),
  }));
}

/** Problemas de una explicación frente a su pregunta (y a la pregunta cuya explicación dice adaptar). */
export function revisar(id, e, q, porId) {
  const mal = [];
  if (!q) return [`${id}: no es una pregunta de ${EJE}`];
  if (typeof e.explicacion !== 'string' || e.explicacion.length < 40) mal.push(`${id}: sin explicación`);
  if (typeof e.clave !== 'string' || e.clave.length < 4) mal.push(`${id}: sin clave`);
  for (const k of Object.keys(e)) if (![...CAMPOS, 'concepto'].includes(k)) mal.push(`${id}: campo desconocido ${k}`);
  for (const s of e.ilustraciones ?? []) if (!validSpec(s)) mal.push(`${id}: ilustración no dibujable ${JSON.stringify(s)}`);
  if (e.defendible && !(e.defendible in q.opciones)) mal.push(`${id}: defendible ${e.defendible} no es una opción`);
  if (e.defendible && q.aceptadas.includes(e.defendible)) mal.push(`${id}: defendible ${e.defendible} es la oficial`);
  if (e.defendible && !e.discrepancia) mal.push(`${id}: defendible sin discrepancia`);
  if (e.concepto) {
    const c = porId.get(e.concepto);
    if (!c) mal.push(`${id}: concepto ${e.concepto} no existe`);
    else if (c.id === id) mal.push(`${id}: concepto es la propia pregunta`);
    else if (respuestaTexto(c) !== respuestaTexto(q) && textoPregunta(c) === textoPregunta(q)) mal.push(`${id}: reutiliza ${e.concepto}, con el mismo texto y otra respuesta`);
  }
  const texto = [e.explicacion, e.clave, e.trampa, e.discrepancia].filter(Boolean).join(' ');
  if (PROHIBIDO.test(texto)) mal.push(`${id}: palabra prohibida`);
  for (const m of texto.matchAll(/(?:\bla |\bopci[oó]n |\()([a-h])\)/g)) if (!(m[1] in q.opciones)) mal.push(`${id}: cita la opción ${m[1]}) que no existe`);
  return mal;
}

export function fusionar() {
  const nuevas = {};
  for (const f of ficheros()) Object.assign(nuevas, leerJSON(f));
  const datos = Object.fromEntries(TITS.map((t) => [t, leerJSON(ruta(t, 'preguntas.json'))]));
  const problemas = [];
  const out = {};
  for (const tit of TITS) {
    const porId = new Map(datos[tit].preguntas.map((q) => [q.id, q]));
    const expl = leerJSON(ruta(tit, 'explicaciones.json'), {});
    let n = 0;
    let conConcepto = 0;
    for (const [id, e] of Object.entries(nuevas)) {
      const q = porId.get(id);
      if (!q) continue;
      const mal = revisar(id, e, q, porId);
      problemas.push(...mal);
      if (mal.length) continue;
      if (expl[id]) continue; // solo se añade: una explicación publicada no se toca
      expl[id] = Object.fromEntries(CAMPOS.filter((k) => e[k] != null && e[k] !== '').map((k) => [k, e[k]]));
      if (e.concepto !== undefined) { q.concepto = e.concepto || null; if (q.concepto) conConcepto++; }
      n++;
    }
    const ordenado = Object.fromEntries(datos[tit].preguntas.filter((q) => expl[q.id]).map((q) => [q.id, expl[q.id]]));
    escribirTexto(ruta(tit, 'explicaciones.json'), JSON.stringify(ordenado));
    escribirTexto(ruta(tit, 'preguntas.json'), textoBanco(datos[tit].meta, datos[tit].preguntas));
    out[tit] = { nuevas: n, conConcepto, total: Object.keys(ordenado).length };
  }
  const sinPregunta = Object.keys(nuevas).filter((id) => !TITS.some((t) => datos[t].preguntas.some((q) => q.id === id)));
  if (sinPregunta.length) problemas.push(`sin pregunta: ${sinPregunta.slice(0, 10).join(', ')}`);
  return { ...out, problemas };
}

export function estado() {
  return Object.fromEntries(TITS.map((tit) => [tit, { faltan: pendientes(tit).length }]));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [orden, tit, n, de] = process.argv.slice(2);
  if (orden === 'lote') console.log(JSON.stringify(lote(tit, Number(n), Number(de), { carta: process.argv.includes('--carta') }), null, 1));
  else if (orden === 'fusionar') {
    const r = fusionar();
    console.log(JSON.stringify({ ...r, problemas: r.problemas.length }, null, 1));
    for (const p of r.problemas.slice(0, 80)) console.log(`  ✗ ${p}`);
    if (r.problemas.length) process.exitCode = 1;
  } else if (orden === 'estado') console.log(JSON.stringify(estado()));
  else { console.error('Uso: explicaciones.mjs lote <tit> <n> <de> | fusionar | estado'); process.exitCode = 2; }
}
