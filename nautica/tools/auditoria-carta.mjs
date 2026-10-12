// Auditoría de las preguntas de carta sin solución programada (reproducible).
//   node tools/auditoria-carta.mjs            → resumen por eje y titulación
//   node tools/auditoria-carta.mjs --detalle  → además, cada id sin solución con su estado y su motivo
//   node tools/auditoria-carta.mjs --json     → todo en JSON (para comparar antes/después)
// Pregunta de carta: `requiere` incluye «carta» o `bloque === 'carta'` (data/ejes/<eje>/<tit>/preguntas.json).
// Estado de cada una: `programada` (tiene `solve` en src/bancos/ejes/<eje>.js), `sin-calculo` o `discrepancia` (motivo
// documentado en `documentadas`), `anulada` (anulada por el tribunal y sin solución) o `sin-motivo` (ni solución ni
// motivo: no debería quedar ninguna). «En practica.json»: la pregunta está en alguna lista de práctica de una clase
// (data/ejes/<eje>/<tit>/practica.json); desde esta revisión, las de carta sin solución programada salen de la práctica al
// cargar el banco (src/bancos/index.js, `practicable`), así que el alumno ya no se las encuentra al practicar.
// «Fuera de la práctica»: las del estudio que el banco aparta de la práctica (banco.estudio − banco.practica).
// «Reservada»: de una convocatoria del examen final (no se estudia; docs/CUARENTENA.md).
import { SOLUCIONES, DOCUMENTADAS } from '../src/bancos/soluciones.js';
import { ejes, titsDeEje, leerJSON, practicaDe, bancosNode } from './bancos/leer.mjs';

export const esDeCarta = (q) => (q.requiere ?? []).includes('carta') || q.bloque === 'carta';

/** Estado de una pregunta de carta (ver arriba). */
export function estadoCarta(q) {
  if (SOLUCIONES[q.id]) return q.anulada ? 'programada-anulada' : 'programada';
  if (q.anulada) return 'anulada';
  const d = DOCUMENTADAS[q.id];
  if (d) return d.tipo;
  return 'sin-motivo';
}

/** → [{ eje, tit, id, conv, estado, practica: [clases], reservada, motivo }] de todas las preguntas de carta. */
export async function auditar() {
  const b = bancosNode();
  const filas = [];
  for (const e of ejes()) {
    for (const tit of titsDeEje(e.id)) {
      let qs;
      try { qs = leerJSON(`data/ejes/${e.id}/${tit}/preguntas.json`).preguntas; } catch { continue; }
      const banco = await b.cargarBanco(e.id, tit);
      const practica = practicaDe(tit, e.id);
      const enEstudio = new Set(banco.estudio.map((x) => x.id));
      const practicables = new Set(banco.practica.map((x) => x.id));
      const enPractica = new Map();
      for (const [clase, ids] of Object.entries(practica)) for (const id of ids) enPractica.set(id, [...(enPractica.get(id) ?? []), clase]);
      for (const q of qs.filter(esDeCarta)) {
        filas.push({
          eje: e.id, tit, id: q.id, conv: q.conv, estado: estadoCarta(q), practica: enPractica.get(q.id) ?? [],
          reservada: banco.reservadas.has(q.id), motivo: DOCUMENTADAS[q.id]?.texto ?? (q.anulada ? q.notas || '' : ''),
          fueraDePractica: enEstudio.has(q.id) && !practicables.has(q.id),
        });
      }
    }
  }
  return filas;
}

const ESTADOS = ['programada', 'programada-anulada', 'sin-calculo', 'discrepancia', 'anulada', 'sin-motivo'];

if (import.meta.url === `file://${process.argv[1]}`) {
  const filas = await auditar();
  if (process.argv.includes('--json')) { console.log(JSON.stringify(filas, null, 1)); process.exit(0); }
  const grupos = new Map();
  for (const f of filas) {
    const k = `${f.eje} ${f.tit}`;
    if (!grupos.has(k)) grupos.set(k, []);
    grupos.get(k).push(f);
  }
  console.log('eje tit       total  ' + ESTADOS.join(' / ') + '   | fuera de la práctica | sin solución en practica.json (por estado)');
  for (const [k, fs] of grupos) {
    const c = (est, sub = fs) => sub.filter((f) => f.estado === est).length;
    const pr = fs.filter((f) => f.practica.length && !f.estado.startsWith('programada'));
    const fuera = fs.filter((f) => f.fueraDePractica).length;
    console.log(`${k.padEnd(14)} ${String(fs.length).padStart(5)}  ${ESTADOS.map((e) => c(e)).join(' / ')}   | ${String(fuera).padStart(3)} | ${pr.length}: ${ESTADOS.slice(2).map((e) => `${e} ${c(e, pr)}`).join(', ')}`);
    if (process.argv.includes('--detalle')) {
      for (const f of fs.filter((x) => !x.estado.startsWith('programada') || x.estado === 'programada-anulada')) {
        console.log(`   ${f.id.padEnd(26)} ${f.estado.padEnd(18)} ${f.reservada ? 'RESERVADA ' : ''}${f.practica.length ? `práctica: ${f.practica.join(',')} ` : ''}${f.motivo ? `· ${f.motivo.slice(0, 140)}` : ''}`);
      }
    }
  }
  const sinMotivo = filas.filter((f) => f.estado === 'sin-motivo');
  if (sinMotivo.length) { console.log(`\n${sinMotivo.length} de carta sin solución ni motivo: ${sinMotivo.map((f) => f.id).join(', ')}`); process.exitCode = 1; }
}
