// Cobertura del diagnóstico por tipo de error (R-36): de todas las opciones erróneas de las preguntas con resolución
// programada, en cuántas se identifica un error típico único (src/exams/diagnostico.js), por eje (tribunal) y
// titulación; y qué errores explican más distractores (los que el tribunal pone «a propósito»).
//
//   node tools/diagnostico-cobertura.mjs            tabla en texto
//   node tools/diagnostico-cobertura.mjs --json     todo en JSON (por pregunta y opción)
//   node tools/diagnostico-cobertura.mjs --md       tablas en Markdown (para docs/CARTA-RESUELTOS.md)
import { readFileSync } from 'node:fs';
import { createChart } from '../src/chart/chart.js';
import { SOLUCIONES } from '../src/bancos/soluciones.js';
import { todasLasPreguntas } from './bancos/leer.mjs';
import { resolverVariantes, variantesQueLlevanA } from '../src/exams/diagnostico.js';
import { ERRORES } from '../src/exams/taxonomia.js';

const chart = createChart(JSON.parse(readFileSync(new URL('../data/chart-105.json', import.meta.url))));
const byId = new Map(todasLasPreguntas().map((q) => [q.id, q]));
const modo = process.argv.includes('--json') ? 'json' : process.argv.includes('--md') ? 'md' : 'texto';

const grupos = new Map(); // `${eje}/${tit}` → contadores
const porTipo = new Map(); // tipo → { per, py }
const detalle = [];
for (const [id, sol] of Object.entries(SOLUCIONES)) {
  const q = byId.get(id);
  if (!q || q.anulada || !q.correcta) continue;
  const r = resolverVariantes(q, sol, chart);
  if (!r) continue;
  const g = `${q.eje}/${q.tit}`;
  if (!grupos.has(g)) grupos.set(g, { eje: q.eje, tit: q.tit, preguntas: 0, opciones: 0, unico: 0, ambiguo2: 0, ambiguo3: 0, ninguno: 0, preguntasConUnico: 0 });
  const c = grupos.get(g);
  c.preguntas += 1;
  let alguna = false;
  for (const x of Object.keys(q.opciones ?? {})) {
    if (x === q.correcta || (q.aceptadas ?? []).includes(x) || (r.base.pick.choice === q.correcta && r.base.pick.repetidas.includes(x))) continue;
    c.opciones += 1;
    const tipos = [...new Set(variantesQueLlevanA(q, r, x).map((v) => v.tipo))];
    if (tipos.length === 1) {
      c.unico += 1; alguna = true;
      const t = porTipo.get(tipos[0]) ?? { per: 0, py: 0 };
      t[q.tit] = (t[q.tit] ?? 0) + 1;
      porTipo.set(tipos[0], t);
    } else if (tipos.length === 2) c.ambiguo2 += 1;
    else if (tipos.length > 2) c.ambiguo3 += 1;
    else c.ninguno += 1;
    detalle.push({ id, opcion: x, tipos });
  }
  if (alguna) c.preguntasConUnico += 1;
}

const filas = [...grupos.values()].sort((a, b) => a.eje.localeCompare(b.eje) || a.tit.localeCompare(b.tit));
const total = filas.reduce((t, f) => { for (const k of ['preguntas', 'opciones', 'unico', 'ambiguo2', 'ambiguo3', 'ninguno', 'preguntasConUnico']) t[k] += f[k]; return t; },
  { eje: 'total', tit: '', preguntas: 0, opciones: 0, unico: 0, ambiguo2: 0, ambiguo3: 0, ninguno: 0, preguntasConUnico: 0 });
const pct = (a, b) => (b ? `${((100 * a) / b).toFixed(1).replace('.', ',')} %` : '—');
const tipos = [...porTipo].sort((a, b) => (b[1].per + b[1].py) - (a[1].per + a[1].py));

if (modo === 'json') {
  console.log(JSON.stringify({ filas, total, porTipo: Object.fromEntries(porTipo), detalle }, null, 1));
} else if (modo === 'md') {
  console.log('| Tribunal | Titulación | Preguntas | Opciones erróneas | Error único | Dos posibles | Tres o más | Ninguno | % único |');
  console.log('| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |');
  for (const f of [...filas, total]) console.log(`| ${f.eje} | ${f.tit.toUpperCase()} | ${f.preguntas} | ${f.opciones} | ${f.unico} | ${f.ambiguo2} | ${f.ambiguo3} | ${f.ninguno} | ${pct(f.unico, f.opciones)} |`);
  console.log('\n| Error típico | Distractores (PER) | Distractores (PY) |');
  console.log('| --- | ---: | ---: |');
  for (const [t, n] of tipos) console.log(`| ${ERRORES[t].nombre} (\`${t}\`) | ${n.per ?? 0} | ${n.py ?? 0} |`);
} else {
  console.log('Tribunal/tit    preg  opc.err  único  2pos  3+  ninguno  %único  preg.con.único');
  for (const f of [...filas, total]) {
    console.log(`${`${f.eje}/${f.tit}`.padEnd(15)} ${String(f.preguntas).padStart(4)} ${String(f.opciones).padStart(8)} ${String(f.unico).padStart(6)} ${String(f.ambiguo2).padStart(5)} ${String(f.ambiguo3).padStart(3)} ${String(f.ninguno).padStart(8)}  ${pct(f.unico, f.opciones).padStart(7)}  ${f.preguntasConUnico}`);
  }
  console.log('\nDistractores explicados por un único error (PER / PY):');
  for (const [t, n] of tipos) console.log(`  ${t.padEnd(22)} ${String(n.per ?? 0).padStart(4)} ${String(n.py ?? 0).padStart(4)}  ${ERRORES[t].nombre}`);
}
