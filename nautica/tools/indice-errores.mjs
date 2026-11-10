// Índice estático del «Simulacro de tus errores» (R-43): por banco (eje y titulación), qué opciones erróneas de cada
// pregunta con resolución programada explica un único error típico (src/exams/diagnostico.js, distractoresUnicos: el
// mismo rigor que el diagnóstico de la corrección). Así el móvil no vuelve a resolver 1.380 preguntas para armar el
// simulacro: lee data/ejes/<eje>/<tit>/distractores.json.
//
// Solo entran preguntas del estudio (src/bancos/index.js, `estudio`): nunca las reservadas para el examen final
// (cuarentena, docs/CUARENTENA.md) ni las retiradas por la revisión normativa; tampoco las anuladas ni las que no
// tienen un distractor con error único. La app vuelve a filtrar con el estudio del alumno (su reserva puede ser otra).
//
//   node tools/indice-errores.mjs              regenera los índices y dice cuántas preguntas hay por error
//   node tools/indice-errores.mjs --comprobar  sale con error si algún índice no está al día (no escribe)
// tests/simulacro-errores.test.js comprueba que están al día y que coinciden con el diagnóstico en vivo.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RAIZ, bancosNode, ejes, titsDeEje, leerJSON } from './bancos/leer.mjs';
import { createChart } from '../src/chart/chart.js';
import { SOLUCIONES } from '../src/bancos/soluciones.js';
import { distractoresUnicos } from '../src/exams/diagnostico.js';

export const FICHERO = 'distractores.json';
export const rutaIndice = (eje, tit) => `data/ejes/${eje}/${tit}/${FICHERO}`;

let chart = null;
const carta = () => (chart ??= createChart(leerJSON('data/chart-105.json')));

/** Índice de un banco: { meta, preguntas: { id: { letra: error } } } (ids en el orden del banco). */
export async function indiceDe(eje, tit, B = bancosNode()) {
  const banco = await B.cargarBanco(eje, tit);
  const preguntas = {};
  for (const q of banco.estudio) {
    const sol = SOLUCIONES[q.id];
    if (!sol || q.anulada || !q.correcta || banco.reservadas.has(q.id)) continue;
    const d = distractoresUnicos(q, { sol, chart: carta() });
    if (Object.keys(d).length) preguntas[q.id] = d;
  }
  return {
    meta: {
      descripcion: 'Simulacro de tus errores (R-43): pregunta → { opción errónea: error típico que la explica sin duda } (src/exams/diagnostico.js, distractoresUnicos). Solo preguntas del estudio: sin reservadas, retiradas ni anuladas.',
      generado: 'node tools/indice-errores.mjs',
    },
    preguntas,
  };
}

/** Texto del fichero: una línea por pregunta (diffs legibles). */
export function textoIndice(ind) {
  const filas = Object.entries(ind.preguntas).map(([id, d]) => `  ${JSON.stringify(id)}: ${JSON.stringify(d)}`);
  return `{\n "meta": ${JSON.stringify(ind.meta)},\n "preguntas": {\n${filas.join(',\n')}\n }\n}\n`;
}

/** Todos los bancos: [{ eje, tit, ruta, indice, texto }]. */
export async function todosLosIndices() {
  const B = bancosNode();
  const out = [];
  for (const e of ejes()) {
    for (const tit of titsDeEje(e.id)) {
      const indice = await indiceDe(e.id, tit, B);
      out.push({ eje: e.id, tit, ruta: rutaIndice(e.id, tit), indice, texto: textoIndice(indice) });
    }
  }
  return out;
}

/** Preguntas por error típico en un índice: { error: n }. */
export function porError(indice) {
  const n = {};
  for (const d of Object.values(indice.preguntas)) for (const t of new Set(Object.values(d))) n[t] = (n[t] ?? 0) + 1;
  return n;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const comprobar = process.argv.includes('--comprobar');
  let mal = 0;
  for (const x of await todosLosIndices()) {
    const f = join(RAIZ, x.ruta);
    const actual = existsSync(f) ? readFileSync(f, 'utf8') : null;
    if (comprobar) {
      if (actual !== x.texto) { mal += 1; console.log(`${x.ruta}: no está al día`); }
      continue;
    }
    if (actual !== x.texto) writeFileSync(f, x.texto);
    const n = porError(x.indice);
    console.log(`${x.ruta}: ${Object.keys(x.indice.preguntas).length} preguntas, ${Buffer.byteLength(x.texto)} bytes`);
    console.log(`  ${Object.entries(n).sort((a, b) => b[1] - a[1]).map(([t, k]) => `${t} ${k}`).join(' · ')}`);
  }
  if (comprobar) { console.log(mal ? `${mal} índices por regenerar: node tools/indice-errores.mjs` : 'Índices al día.'); process.exit(mal ? 1 : 0); }
}
