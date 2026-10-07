// Puertas de calidad para publicar un eje (estado «publicado»): lo que tiene que cumplir su banco para que lo vean los
// alumnos. tests/bancos.test.js las aplica a todo eje publicado; para uno que aún no lo está:
//   node tools/bancos/puertas.mjs <eje>      → lista lo que falta (sale con código 1 si falta algo)
// 1. Cada pregunta: respuesta (o anulada), tema (ut), fuentes y norma resuelta (no «revisar»).
// 2. Explicación del profe para el 100 % de las preguntas que no son de carta.
// 3. Cada pregunta de carta (no anulada): solución programada (que llega a la opción oficial: tests/exams.test.js) o un
//    motivo documentado (discrepancia o no es un cálculo) en src/bancos/ejes/<eje>.js.
// 4. Cada clase del curso nacional tiene práctica del eje.
// 5. La licencia permite usarlo en la app (licencia.usoApp «permitido»).
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { TITULACIONES } from '../../src/theory/blocks.js';
import { SOLUCIONES, DOCUMENTADAS } from '../../src/bancos/soluciones.js';
import { RAIZ, leerJSON, bancosNode } from './leer.mjs';

/** → { ok, fallos: [texto], porTit: { per: { preguntas, conExplicacion, carta, cartaResuelta, clases, clasesConPractica } } } */
export async function puertasDeCalidad(eje) {
  const ficha = leerJSON(`data/ejes/${eje}/eje.json`);
  const fallos = [];
  const porTit = {};
  if (ficha.licencia?.usoApp !== 'permitido') fallos.push(`licencia: usoApp es «${ficha.licencia?.usoApp}», no «permitido»`);
  const b = bancosNode();
  for (const tit of Object.keys(ficha.examen ?? {}).filter((t) => TITULACIONES[t])) {
    const dir = `data/ejes/${eje}/${tit}`;
    const qs = leerJSON(`${dir}/preguntas.json`).preguntas;
    const expl = existsSync(join(RAIZ, `${dir}/explicaciones.json`)) ? leerJSON(`${dir}/explicaciones.json`) : {};
    const uts = new Set(TITULACIONES[tit].estructura.bloques.map((x) => x.ut));
    const f = (t) => fallos.push(`${tit}: ${t}`);
    let malas = 0;
    for (const q of qs) {
      const motivos = [];
      if (!q.anulada && !(q.correcta && q.aceptadas?.includes(q.correcta))) motivos.push('sin respuesta');
      if (!uts.has(q.ut)) motivos.push(`ut ${q.ut}`);
      if (!q.fuentes?.examen) motivos.push('sin fuente');
      if (!q.norma?.estado || q.norma.estado === 'revisar') motivos.push(`norma ${q.norma?.estado ?? '—'}`);
      if (motivos.length) { malas++; if (malas <= 30) f(`${q.id}: ${motivos.join(', ')}`); }
    }
    if (malas > 30) f(`… y ${malas - 30} preguntas más sin respuesta, tema, fuente o norma resuelta`);
    const teoria = qs.filter((q) => !q.requiere.includes('carta'));
    const sinExpl = teoria.filter((q) => !(expl[q.id]?.explicacion && expl[q.id]?.clave));
    if (sinExpl.length) f(`${sinExpl.length} de ${teoria.length} preguntas que no son de carta sin explicación (p. ej. ${sinExpl.slice(0, 5).map((q) => q.id).join(', ')})`);
    const carta = qs.filter((q) => q.requiere.includes('carta') && !q.anulada);
    const sinSol = carta.filter((q) => !SOLUCIONES[q.id] && !DOCUMENTADAS[q.id]);
    if (sinSol.length) f(`${sinSol.length} de ${carta.length} preguntas de carta sin solución ni motivo documentado (p. ej. ${sinSol.slice(0, 5).map((q) => q.id).join(', ')})`);
    const curso = await b.cargarCurso(tit, eje);
    const clases = (curso?.modulos ?? []).flatMap((m) => m.lecciones);
    const sinPractica = clases.filter((l) => !l.practica?.length);
    if (sinPractica.length) f(`${sinPractica.length} de ${clases.length} clases sin práctica (${sinPractica.slice(0, 8).map((l) => l.id).join(', ')}${sinPractica.length > 8 ? '…' : ''})`);
    porTit[tit] = {
      preguntas: qs.length, malas, teoria: teoria.length, conExplicacion: teoria.length - sinExpl.length,
      carta: carta.length, cartaResuelta: carta.length - sinSol.length, clases: clases.length, clasesConPractica: clases.length - sinPractica.length,
    };
  }
  return { ok: !fallos.length, fallos, porTit };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const eje = process.argv[2];
  if (!eje) { console.error('Uso: node tools/bancos/puertas.mjs <eje>'); process.exit(2); }
  const r = await puertasDeCalidad(eje);
  console.log(JSON.stringify(r.porTit, null, 1));
  for (const x of r.fallos) console.log(`✗ ${x}`);
  console.log(r.ok ? `✓ ${eje} cumple las puertas de calidad para publicarse` : `${eje}: no cumple ${r.fallos.length} puertas`);
  process.exitCode = r.ok ? 0 : 1;
}
