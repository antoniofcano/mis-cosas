// Recoloca la práctica ya escrita de todos los ejes para que ninguna clase lleve preguntas de otro tema
// (tools/bancos/lib/practica-tema.mjs explica los criterios). Reproducible.
//   node tools/bancos/practica-tema.mjs                → qué movería, por eje y titulación (no escribe nada)
//   node tools/bancos/practica-tema.mjs --detalle      → además, cada movimiento
//   node tools/bancos/practica-tema.mjs --json <ruta>  → los movimientos en JSON
//   node tools/bancos/practica-tema.mjs --excepciones  → recalcula tools/bancos/practica-excepciones.json con la auditoría
//        (tools/auditoria-temas.mjs): las que están en una clase de otro tema y cuya idea vive en ESE tema (al menos
//        4 hermanas y el 80 % de ellas allí). Lo dudoso es su tema, no su clase: se quedan como están y se listan.
//        Y las de las clases que se quedarían con menos de 3 preguntas de su tema. Se calcula sobre la práctica de
//        antes de recolocar; las excepciones ya escritas que siguen en su clase se conservan.
//   node tools/bancos/practica-tema.mjs --escribir     → escribe data/ejes/<eje>/<tit>/practica.json
//   node tools/bancos/practica-tema.mjs --informes     → pone al día los informes derivados (practica-informe.json de
//        Baleares y las cuentas de informes/<eje>-practica.md) con la práctica escrita
// Los generadores de la práctica aplican lo mismo al final, así que regenerarla no vuelve a mezclar temas.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RAIZ, leerJSON } from './lib/comun.mjs';
import { TITULACIONES } from '../../src/theory/blocks.js';
import { cuenta } from '../../src/texto.js';
import { contexto, recolocar, fueraDeTema, RUTA_EXCEPCIONES } from './lib/practica-tema.mjs';

export const MIN_CLASE = 3; // una clase con menos preguntas de su tema conserva las de otro que tenía (excepciones)
export const CRITERIOS = ['ya-en-su-tema', 'idea', 'hermanas', 'parecido', 'sin-clase'];

/** Bancos con práctica: [{ eje, tit }]. */
export function bancos() {
  return leerJSON(join(RAIZ, 'data', 'ejes', 'index.json')).ejes.flatMap((e) => Object.keys(leerJSON(join(RAIZ, 'data', 'ejes', e.id, 'eje.json')).examen ?? {})
    .filter((tit) => leerJSON(join(RAIZ, 'data', 'ejes', e.id, tit, 'practica.json'), null)).map((tit) => ({ eje: e.id, tit })));
}

/** Escribe la práctica con el mismo formato que tenía el fichero (una clase por línea, o sangrado). */
export function textoComo(original, practica) {
  if (/^\{\n"/.test(original)) return `{\n${Object.entries(practica).map(([l, ids]) => `${JSON.stringify(l)}:${JSON.stringify(ids)}`).join(',\n')}\n}\n`;
  return `${JSON.stringify(practica, null, 1)}\n`;
}

/** Excepciones según la auditoría: { eje: { tit: { id: { clase, motivo } } } }. */
export async function calcularExcepciones() {
  const { auditar } = await import('../auditoria-temas.mjs');
  const { filas } = await auditar();
  const out = {};
  for (const f of filas) {
    const pr = f.senales.find((s) => s.tipo === 'practica');
    const co = f.senales.find((s) => s.tipo === 'concepto' && s.base === 'vecinas');
    if (!pr || !co || co.propuesto !== pr.propuesto || pr.clases.length !== 1) continue;
    ((out[f.eje] ??= {})[f.tit] ??= {})[f.id] = { clase: pr.clases[0], tipo: 'tema-dudoso', motivo: `Tema dudoso (${f.ut} · ${f.tema}): ${co.texto}. Se queda en su clase hasta decidir su tema.` };
  }
  // Clases que se quedarían casi sin práctica (menos de MIN_CLASE preguntas de su tema): el tribunal pregunta lo que
  // enseñan en otro bloque (las mareas con anuario del PY, en el de carta). Conservan las que tenían, como excepción:
  // una clase sin práctica no pasa las puertas de calidad (tools/bancos/puertas.mjs) y no se puede dar por aprendida.
  const previas = leerJSON(RUTA_EXCEPCIONES, {});
  for (const { eje, tit } of bancos()) {
    const practica = leerJSON(join(RAIZ, 'data', 'ejes', eje, tit, 'practica.json'));
    const ctx = { ...contexto(eje, tit), excepciones: { ...(previas[eje]?.[tit] ?? {}), ...(out[eje]?.[tit] ?? {}) } };
    // Las excepciones ya escritas que siguen haciendo falta (la pregunta sigue en esa clase de otro tema) se conservan.
    for (const [id, e] of Object.entries(previas[eje]?.[tit] ?? {})) {
      if (practica[e.clase]?.includes(id) && ctx.porId.get(id)?.ut !== ctx.clases.get(e.clase)) ((out[eje] ??= {})[tit] ??= {})[id] ??= e;
    }
    const despues = recolocar(ctx, practica).practica;
    for (const [clase, ids] of Object.entries(practica)) {
      const suyas = (despues[clase] ?? []).filter((id) => ctx.porId.get(id)?.ut === ctx.clases.get(clase)).length;
      if (suyas >= MIN_CLASE) continue;
      const ajenas = ids.filter((id) => ctx.porId.has(id) && ctx.porId.get(id).ut !== ctx.clases.get(clase));
      const tema = TITULACIONES[tit].estructura.bloques.find((b) => b.ut === ctx.clases.get(clase))?.titulo;
      for (const id of ajenas) {
        ((out[eje] ??= {})[tit] ??= {})[id] ??= { clase, tipo: 'clase-corta', motivo: `La clase ${clase} se quedaría con ${cuenta(suyas, 'pregunta')} de su tema (${tema}): el tribunal pregunta lo que enseña en el bloque ${ctx.porId.get(id).ut}. Conserva las que tenía (y van además a la clase de su tema que las explique).` };
      }
    }
  }
  return out;
}

/**
 * Pone al día los informes derivados de la práctica con la práctica que hay escrita (no se pueden regenerar con sus
 * generadores sin rehacer toda la práctica): el motivo de cada asignación de Baleares
 * (tools/bancos/ejes/<eje>/practica-informe.json) y las cuentas por clase de tools/bancos/informes/<eje>-practica.md.
 */
export function sincronizarInformes() {
  const tocados = [];
  for (const eje of [...new Set(bancos().map((b) => b.eje))]) {
    const rutaInf = join(RAIZ, 'tools', 'bancos', 'ejes', eje, 'practica-informe.json');
    const inf = leerJSON(rutaInf, null);
    const rutaMd = join(RAIZ, 'tools', 'bancos', 'informes', `${eje}-practica.md`);
    let md = null;
    try { md = readFileSync(rutaMd, 'utf8'); } catch { /* este eje no tiene ese informe */ }
    for (const { tit } of bancos().filter((b) => b.eje === eje)) {
      const practica = leerJSON(join(RAIZ, 'data', 'ejes', eje, tit, 'practica.json'));
      const clasesDe = new Map();
      for (const [l, ids] of Object.entries(practica)) for (const id of ids) clasesDe.set(id, [...(clasesDe.get(id) ?? []), l]);
      if (inf?.[tit]) {
        inf[tit].porClase = Object.fromEntries(Object.entries(practica).map(([l, ids]) => [l, ids.length]));
        inf[tit].sinPractica = Object.keys(practica).filter((l) => !practica[l].length);
        const detalle = inf[`${tit}-detalle`] ?? {};
        for (const id of Object.keys(detalle)) {
          const antes = detalle[id].split(' · ')[0];
          const ahora = clasesDe.get(id) ?? [];
          if (ahora.length === 1 && ahora[0] === antes) continue;
          if (!ahora.length) detalle[id] = `sin clase · tema: ninguna clase de su tema la explica (antes ${antes}; tools/bancos/practica-tema.mjs)`;
          else if (!ahora.includes(antes)) detalle[id] = `${ahora.join(' + ')} · tema: recolocada en su tema (antes ${antes}; tools/bancos/practica-tema.mjs)`;
          else if (!/ · tema: /.test(detalle[id])) detalle[id] = `${ahora.join(' + ')} · tema: también en la clase de su tema (excepción «clase-corta»; tools/bancos/practica-tema.mjs)`;
        }
        inf[tit].asignadas = Object.keys(detalle).filter((id) => clasesDe.has(id)).length;
      }
      if (md) for (const [l, ids] of Object.entries(practica)) md = md.replace(new RegExp(`^(\\| ${l} [^|]*\\| )\\d+( \\|)`, 'm'), `$1${ids.length}$2`);
    }
    if (inf) { writeFileSync(rutaInf, `${JSON.stringify(inf, null, 1)}\n`); tocados.push(rutaInf); }
    if (md) { writeFileSync(rutaMd, md); tocados.push(rutaMd); }
  }
  return tocados;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.includes('--excepciones')) {
    const ex = await calcularExcepciones();
    const n = Object.values(ex).flatMap((x) => Object.values(x)).reduce((s, x) => s + Object.keys(x).length, 0);
    writeFileSync(RUTA_EXCEPCIONES, `${JSON.stringify({ descripcion: 'Preguntas que siguen en la práctica de una clase de otro tema porque lo dudoso es su tema (ut), no su clase: su idea vive en el tema de esa clase. Lo escribe node tools/bancos/practica-tema.mjs --excepciones; lo leen los generadores de la práctica y tests/practica-tema.test.js. Quitar una entrada = recolocarla en su tema con --escribir.', ...ex }, null, 1)}\n`);
    console.log(`Escrito tools/bancos/practica-excepciones.json (${n} excepciones).`);
  }
  const todos = [];
  console.log(`eje tit        fuera de tema  ${CRITERIOS.join(' / ')}   | excepciones`);
  for (const { eje, tit } of bancos()) {
    const ruta = join(RAIZ, 'data', 'ejes', eje, tit, 'practica.json');
    const original = readFileSync(ruta, 'utf8');
    const ctx = contexto(eje, tit);
    const r = recolocar(ctx, JSON.parse(original));
    const ex = fueraDeTema(ctx, r.practica, { conExcepciones: true }).length;
    console.log(`${`${eje} ${tit}`.padEnd(16)} ${String(r.movimientos.length).padStart(8)}       ${CRITERIOS.map((c) => r.movimientos.filter((m) => m.criterio === c).length).join(' / ')}   | ${ex}`);
    if (args.includes('--detalle')) for (const m of r.movimientos) console.log(`   ${m.id.padEnd(24)} ut${m.ut}  ${m.ademas ? `(sigue en ${ctx.excepciones[m.id].clase}) +` : `${m.de.join(',')} →`} ${m.a ?? '(solo en el tema)'}  [${m.criterio}] ${m.detalle} · ${ctx.porId.get(m.id).enunciado.slice(0, 80)}`);
    if (args.includes('--escribir') && r.movimientos.length) writeFileSync(ruta, textoComo(original, r.practica));
    todos.push(...r.movimientos.map((m) => ({ eje, tit, ...m, enunciado: ctx.porId.get(m.id).enunciado })));
  }
  if (args.includes('--informes')) for (const f of sincronizarInformes()) console.log(`Puesto al día ${f.slice(RAIZ.length + 1)}`);
  if (args.includes('--json')) writeFileSync(args[args.indexOf('--json') + 1], `${JSON.stringify(todos, null, 1)}\n`);
}
