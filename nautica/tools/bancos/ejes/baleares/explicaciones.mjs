// Explicaciones del profe del eje Baleares: junta los lotes que escribe quien redacta (un JSON por lote:
// { "<id>": { explicacion, clave, trampa?, ilustraciones?, discrepancia?, defendible?, base?, concepto? } }) en
// data/ejes/baleares/<tit>/explicaciones.json, y pone en preguntas.json el `concepto` de cada pregunta (el id de la
// pregunta, de este eje o del de referencia, cuya explicación agrupa a las equivalentes).
//   node tools/bancos/ejes/baleares/explicaciones.mjs fusionar <dir-con-lotes>   → añade (o sustituye) las de los lotes
//   node tools/bancos/ejes/baleares/explicaciones.mjs estado                      → cuántas faltan
// `base` (la explicación revisada del otro banco que se ha adaptado) no se guarda: queda en `concepto`.
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validSpec } from '../../../../src/illustrations/index.js';
import { RAIZ, escribirJSON, escribirTexto, leerJSON } from '../../lib/comun.mjs';
import { textoBanco } from '../../etapas/escribir.mjs';

const EJE = 'baleares';
const TITS = ['per', 'py'];
const CAMPOS = ['explicacion', 'clave', 'trampa', 'ilustraciones', 'discrepancia', 'defendible', 'verificada'];
const PROHIBIDO = /academia|escuela|sirocodiez|siroco ?10|andaluc|junta de/i;
const ruta = (tit, f) => join(RAIZ, 'data', 'ejes', EJE, tit, f);

/** Problemas de una explicación frente a su pregunta. */
export function revisar(id, e, q, existe) {
  const mal = [];
  if (!q) return [`${id}: no es una pregunta del eje`];
  if (typeof e.explicacion !== 'string' || e.explicacion.length < 60) mal.push(`${id}: sin explicación`);
  if (typeof e.clave !== 'string' || e.clave.length < 6) mal.push(`${id}: sin clave`);
  for (const k of Object.keys(e)) if (![...CAMPOS, 'concepto', 'base'].includes(k)) mal.push(`${id}: campo desconocido ${k}`);
  for (const s of e.ilustraciones ?? []) if (!validSpec(s)) mal.push(`${id}: ilustración no dibujable ${JSON.stringify(s)}`);
  if (e.defendible && !(e.defendible in q.opciones)) mal.push(`${id}: defendible ${e.defendible} no es una opción`);
  if (e.defendible && q.aceptadas.includes(e.defendible)) mal.push(`${id}: defendible ${e.defendible} es la oficial`);
  if (e.defendible && !e.discrepancia) mal.push(`${id}: defendible sin discrepancia`);
  if (e.concepto && !/^(bal|and)-/.test(e.concepto)) mal.push(`${id}: concepto ${e.concepto}`);
  if (e.concepto && !existe(e.concepto)) mal.push(`${id}: concepto ${e.concepto} no existe`);
  const texto = [e.explicacion, e.clave, e.trampa, e.discrepancia].filter(Boolean).join(' ');
  if (PROHIBIDO.test(texto)) mal.push(`${id}: palabra prohibida`);
  for (const m of texto.matchAll(/(?:\bla |\bopci[oó]n |\()([a-e])\)/g)) if (!(m[1] in q.opciones)) mal.push(`${id}: cita la opción ${m[1]}) que no existe`);
  return mal;
}

export function fusionar(dir) {
  const nuevas = {};
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) Object.assign(nuevas, leerJSON(join(dir, f)));
  const datos = Object.fromEntries(TITS.map((t) => [t, leerJSON(ruta(t, 'preguntas.json'))]));
  const ids = new Set(TITS.flatMap((t) => datos[t].preguntas.map((q) => q.id)));
  for (const t of TITS) for (const q of leerJSON(join(RAIZ, 'data', 'ejes', 'andalucia', t, 'preguntas.json')).preguntas) ids.add(q.id);
  const existe = (id) => ids.has(id);
  const problemas = [];
  const out = {};
  for (const tit of TITS) {
    const porId = new Map(datos[tit].preguntas.map((q) => [q.id, q]));
    const expl = leerJSON(ruta(tit, 'explicaciones.json'), {});
    let n = 0;
    for (const [id, e] of Object.entries(nuevas)) {
      const q = porId.get(id);
      if (!q) continue;
      problemas.push(...revisar(id, e, q, existe));
      expl[id] = Object.fromEntries(CAMPOS.filter((k) => e[k] != null && e[k] !== '').map((k) => [k, e[k]]));
      const concepto = e.concepto || e.base || null;
      if (concepto) q.concepto = concepto;
      n++;
    }
    const ordenado = Object.fromEntries(datos[tit].preguntas.filter((q) => expl[q.id]).map((q) => [q.id, expl[q.id]]));
    escribirJSON(ruta(tit, 'explicaciones.json'), ordenado);
    escribirTexto(ruta(tit, 'preguntas.json'), textoBanco(datos[tit].meta, datos[tit].preguntas));
    out[tit] = { nuevas: n, total: Object.keys(ordenado).length };
  }
  const sinPregunta = Object.keys(nuevas).filter((id) => !TITS.some((t) => datos[t].preguntas.some((q) => q.id === id)));
  if (sinPregunta.length) problemas.push(`sin pregunta: ${sinPregunta.slice(0, 10).join(', ')}`);
  return { ...out, problemas };
}

export function estado() {
  return Object.fromEntries(TITS.map((tit) => {
    const qs = leerJSON(ruta(tit, 'preguntas.json')).preguntas;
    const expl = leerJSON(ruta(tit, 'explicaciones.json'), {});
    const teoria = qs.filter((q) => !q.requiere.includes('carta'));
    const faltan = teoria.filter((q) => !expl[q.id]);
    return [tit, { teoria: teoria.length, conExplicacion: teoria.length - faltan.length, faltan: faltan.map((q) => q.id), conConcepto: qs.filter((q) => q.concepto).length, conDiscrepancia: Object.values(expl).filter((e) => e.discrepancia).length }];
  }));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [orden, dir] = process.argv.slice(2);
  if (orden === 'fusionar' && dir) {
    const r = fusionar(dir);
    console.log(JSON.stringify({ ...r, problemas: r.problemas.length }, null, 1));
    for (const p of r.problemas.slice(0, 80)) console.log(`  ✗ ${p}`);
    if (r.problemas.length) process.exitCode = 1;
  } else if (orden === 'estado') {
    const e = estado();
    for (const [t, x] of Object.entries(e)) console.log(t, JSON.stringify({ ...x, faltan: x.faltan.length }), x.faltan.slice(0, 12).join(' '));
  } else { console.error('Uso: explicaciones.mjs fusionar <dir> | estado'); process.exitCode = 2; }
}
