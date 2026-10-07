// Explicaciones del profe para un eje nuevo, reutilizando por concepto las de un eje de referencia (Andalucía).
//   node tools/bancos/explicaciones.mjs lote <eje> <tit> <n> <de>      → el lote n (1..de) de preguntas sin explicación
//        (las que no son de carta), cada una con las 3 más parecidas del eje de referencia (mismo tema) y su explicación.
//   node tools/bancos/explicaciones.mjs fusionar <eje>                 → junta tools/bancos/ejes/<eje>/explicaciones/*.json
//        (lo que escribe quien redacta cada lote) en data/ejes/<eje>/<tit>/explicaciones.json y pone el `concepto` de
//        cada pregunta en su preguntas.json.
//   node tools/bancos/explicaciones.mjs estado <eje>                   → cuántas preguntas tienen explicación.
// Formato de un fichero de lote: { "<id>": { explicacion, clave, trampa?, ilustraciones?, discrepancia?, defendible?,
//   concepto? } }. `concepto` es el id de la pregunta del eje de referencia cuya explicación se ha adaptado (o null si se
//   ha escrito de cero); el motor lo usa para las preguntas equivalentes entre ejes (src/bancos/equivalentes.js).
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parecido } from '../../src/bancos/equivalentes.js';
import { validSpec } from '../../src/illustrations/index.js';
import { BANCOS, RAIZ, escribirJSON, escribirTexto, leerJSON } from './lib/comun.mjs';
import { textoBanco } from './etapas/escribir.mjs';

export const REFERENCIA = 'andalucia';
const CAMPOS = ['explicacion', 'clave', 'trampa', 'ilustraciones', 'discrepancia', 'defendible', 'verificada'];

const ruta = (eje, tit, f) => join(RAIZ, 'data', 'ejes', eje, tit, f);
const preguntas = (eje, tit) => leerJSON(ruta(eje, tit, 'preguntas.json')).preguntas;
const explicacionesDe = (eje, tit) => leerJSON(ruta(eje, tit, 'explicaciones.json'), {});
const respuesta = (q) => (q.anulada ? 'ANULADA (todas las respuestas válidas)' : q.aceptadas.map((l) => `${l}) ${q.opciones[l]}`).join(' | '));

/** Las k preguntas del eje de referencia más parecidas a q (mismo tema), con su explicación. */
export function candidatas(q, referencia, explRef, k = 3) {
  return referencia.filter((r) => r.ut === q.ut && explRef[r.id])
    .map((r) => ({ r, s: parecido(q, r) })).sort((a, b) => b.s - a.s).slice(0, k)
    .map(({ r, s }) => ({ id: r.id, parecido: Number(s.toFixed(2)), enunciado: r.enunciado, opciones: r.opciones, respuesta: respuesta(r), explicacion: explRef[r.id] }));
}

/** Preguntas del eje que necesitan explicación y aún no la tienen (las de carta se explican con su resolución). */
export function pendientes(eje, tit) {
  const expl = explicacionesDe(eje, tit);
  const hechas = new Set(Object.keys(expl));
  for (const f of ficherosLote(eje)) for (const id of Object.keys(leerJSON(f))) hechas.add(id);
  return preguntas(eje, tit).filter((q) => !q.requiere.includes('carta') && !hechas.has(q.id));
}

export function lote(eje, tit, n, de) {
  const todas = preguntas(eje, tit).filter((q) => !q.requiere.includes('carta'));
  const tam = Math.ceil(todas.length / de);
  const mias = todas.slice((n - 1) * tam, n * tam);
  const ref = preguntas(REFERENCIA, tit);
  const explRef = explicacionesDe(REFERENCIA, tit);
  return mias.map((q) => ({
    id: q.id, ut: q.ut, ut_titulo: q.ut_titulo, fecha: q.fecha, enunciado: q.enunciado, opciones: q.opciones, respuesta: respuesta(q),
    norma: q.norma, notas: q.notas || undefined, contexto: q.contexto ?? undefined,
    candidatas: candidatas(q, ref, explRef),
  }));
}

const dirLotes = (eje) => join(BANCOS, 'ejes', eje, 'explicaciones');
const ficherosLote = (eje) => (existsSync(dirLotes(eje)) ? readdirSync(dirLotes(eje)).filter((f) => f.endsWith('.json')).sort().map((f) => join(dirLotes(eje), f)) : []);

/** Comprueba una explicación (campos y tipos). Devuelve la lista de problemas. */
export function revisar(id, e, q) {
  const mal = [];
  if (!q) return [`${id}: no es una pregunta del eje`];
  if (!e.explicacion || typeof e.explicacion !== 'string') mal.push(`${id}: sin explicación`);
  if (!e.clave || typeof e.clave !== 'string') mal.push(`${id}: sin clave`);
  for (const k of Object.keys(e)) if (![...CAMPOS, 'concepto'].includes(k)) mal.push(`${id}: campo desconocido ${k}`);
  for (const s of e.ilustraciones ?? []) if (!validSpec(s)) mal.push(`${id}: ilustración no dibujable ${JSON.stringify(s)}`);
  if (e.defendible && !(e.defendible in q.opciones)) mal.push(`${id}: defendible ${e.defendible} no es una opción`);
  if (e.defendible && !e.discrepancia) mal.push(`${id}: defendible sin discrepancia`);
  if (e.concepto && !String(e.concepto).startsWith('and-')) mal.push(`${id}: concepto ${e.concepto} no es una pregunta de referencia`);
  return mal;
}

export function fusionar(eje) {
  const ficha = leerJSON(join(RAIZ, 'data', 'ejes', eje, 'eje.json'));
  const nuevas = {};
  for (const f of ficherosLote(eje)) Object.assign(nuevas, leerJSON(f));
  const out = {};
  const problemas = [];
  for (const tit of Object.keys(ficha.examen)) {
    const datos = leerJSON(ruta(eje, tit, 'preguntas.json'));
    const porId = new Map(datos.preguntas.map((q) => [q.id, q]));
    const expl = explicacionesDe(eje, tit);
    let n = 0;
    for (const [id, e] of Object.entries(nuevas)) {
      const q = porId.get(id);
      if (!q) continue;
      problemas.push(...revisar(id, e, q));
      const { concepto, ...resto } = e;
      expl[id] = Object.fromEntries(CAMPOS.filter((k) => resto[k] != null && resto[k] !== '').map((k) => [k, resto[k]]));
      if (concepto !== undefined) q.concepto = concepto || null;
      n++;
    }
    // En el orden del banco.
    const ordenado = Object.fromEntries(datos.preguntas.filter((q) => expl[q.id]).map((q) => [q.id, expl[q.id]]));
    escribirJSON(ruta(eje, tit, 'explicaciones.json'), ordenado);
    escribirTexto(ruta(eje, tit, 'preguntas.json'), textoBanco(datos.meta, datos.preguntas));
    out[tit] = { nuevas: n, total: Object.keys(ordenado).length };
  }
  return { ...out, problemas };
}

export function estado(eje) {
  const ficha = leerJSON(join(RAIZ, 'data', 'ejes', eje, 'eje.json'));
  return Object.fromEntries(Object.keys(ficha.examen).map((tit) => {
    const qs = preguntas(eje, tit).filter((q) => !q.requiere.includes('carta'));
    const expl = explicacionesDe(eje, tit);
    const conConcepto = preguntas(eje, tit).filter((q) => q.concepto).length;
    return [tit, { teoria: qs.length, conExplicacion: qs.filter((q) => expl[q.id]).length, conConcepto }];
  }));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [orden, eje, tit, n, de] = process.argv.slice(2);
  if (orden === 'lote') console.log(JSON.stringify(lote(eje, tit, Number(n), Number(de)), null, 1));
  else if (orden === 'fusionar') { const r = fusionar(eje); console.log(JSON.stringify(r, null, 1)); if (r.problemas.length) process.exitCode = 1; }
  else if (orden === 'estado') console.log(JSON.stringify(estado(eje)));
  else { console.error('Uso: explicaciones.mjs lote <eje> <tit> <n> <de> | fusionar <eje> | estado <eje>'); process.exitCode = 2; }
}
