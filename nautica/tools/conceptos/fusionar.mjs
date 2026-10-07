// Fusión de lotes de etiquetas decididas en data/ejes/<eje>/<tit>/conceptos.json (docs/CONCEPTOS.md).
//   npm run conceptos -- fusionar <lote.json|carpeta>… [--forzar] [--simular]
// Lote de etiquetas (lo escribe quien etiqueta a partir de un lote de candidatos):
//   { "formato": "conceptos-etiquetas/1", "eje": "dgmm", "tit": "per", "autor": "…", "fecha": "AAAA-MM-DD",
//     "etiquetas": { "<idPregunta>": { "conceptos": ["principal", "secundario?"], "motivo": "frase corta" },
//                    "<idPregunta>": { "conceptos": [], "falta": "concepto que propones", "motivo": "…" } } }
// Sin «eje»/«tit» en el lote, se deducen del id de cada pregunta. No pisa una etiqueta ya fusionada distinta (la
// cuenta como «conservada») salvo con --forzar. Las entradas no válidas no se escriben y se listan; las de
// «conceptos: []» se listan como conceptos que faltan en el catálogo. Al final valida los bancos tocados.
// Sale con 1 si hay entradas rechazadas o errores de validación.
import { fileURLToPath } from 'node:url';
import { relative } from 'node:path';
import { indexarCatalogo, MAX_POR_PREGUNTA } from '../../src/conceptos/catalogo.js';
import { FORMATO_ETIQUETAS } from './candidatos.mjs';
import { RAIZ, bancosEnDisco, escribirTexto, etiquetasDisco, ficherosJSON, gruposLeidos, leerArgs, leerCatalogo, leerJSON, preguntasDe, rutaEtiquetasDisco, textoEtiquetas } from './lib.mjs';
import { informe, validar } from './validar.mjs';

const igual = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

/**
 * @param {{ raiz?: string, lotes: Array<{ fichero: string, datos: object }>, forzar?: boolean, simular?: boolean }} p
 */
export function fusionar({ raiz = RAIZ, lotes, forzar = false, simular = false }) {
  const catalogo = indexarCatalogo(gruposLeidos(leerCatalogo(raiz)));
  const bancos = new Map(); // `${eje}/${tit}` → { eje, tit, preguntas, porId, actuales, nuevas }
  const dondeId = new Map(); // id → clave de banco (para deducir el banco)
  for (const b of bancosEnDisco(raiz)) {
    const preguntas = preguntasDe(raiz, b.eje, b.tit);
    const clave = `${b.eje}/${b.tit}`;
    bancos.set(clave, { ...b, preguntas, porId: new Map(preguntas.map((q) => [q.id, q])), actuales: null, cambios: new Map() });
    for (const q of preguntas) dondeId.set(q.id, clave);
  }
  const r = { nuevas: 0, iguales: 0, cambiadas: 0, conservadas: [], rechazadas: [], faltan: [], sinMotivo: 0, conflictos: [], escritos: [] };
  const vistas = new Map(); // id → { conceptos, fichero }
  for (const { fichero, datos } of lotes) {
    const f = relative(raiz, fichero) || fichero;
    if (datos?.formato !== FORMATO_ETIQUETAS || typeof datos.etiquetas !== 'object' || !datos.etiquetas) {
      r.rechazadas.push({ fichero: f, id: '*', motivo: `no es un lote «${FORMATO_ETIQUETAS}» con «etiquetas»` });
      continue;
    }
    const claveLote = datos.eje && datos.tit ? `${datos.eje}/${datos.tit}` : null;
    if (claveLote && !bancos.has(claveLote)) { r.rechazadas.push({ fichero: f, id: '*', motivo: `el banco ${claveLote} no existe` }); continue; }
    for (const [id, e] of Object.entries(datos.etiquetas)) {
      const mal = (motivo) => r.rechazadas.push({ fichero: f, id, motivo });
      const clave = claveLote ?? dondeId.get(id);
      const b = clave && bancos.get(clave);
      if (!b || !b.porId.has(id)) { mal(`la pregunta no existe${claveLote ? ` en ${claveLote}` : ''}`); continue; }
      const cs = e?.conceptos;
      if (!Array.isArray(cs) || cs.length > MAX_POR_PREGUNTA) { mal(`«conceptos» debe ser una lista de 0 a ${MAX_POR_PREGUNTA} ids`); continue; }
      if (!cs.length) { r.faltan.push({ fichero: f, id, falta: e.falta ?? '', motivo: e.motivo ?? '' }); continue; }
      if (new Set(cs).size !== cs.length) { mal('concepto repetido'); continue; }
      const problemas = cs.map((c) => {
        const k = catalogo.concepto(c);
        if (!k) return `${c} no existe en el catálogo`;
        if (k.tipo !== 'concepto') return `${c} es un grupo`;
        if (k.tit?.length && !k.tit.includes(b.tit)) return `${c} no es de ${b.tit}`;
        return null;
      }).filter(Boolean);
      if (problemas.length) { mal(problemas.join('; ')); continue; }
      if (!e.motivo) r.sinMotivo += 1;
      const antes = vistas.get(id);
      if (antes && !igual(antes.conceptos, cs)) { r.conflictos.push({ id, a: antes, b: { conceptos: cs, fichero: f } }); continue; }
      vistas.set(id, { conceptos: cs, fichero: f, clave });
    }
  }
  // Dos lotes que no coinciden: no se escribe ninguna de las dos hasta que se decida.
  for (const c of r.conflictos) vistas.delete(c.id);
  for (const [id, v] of vistas) {
    const b = bancos.get(v.clave);
    b.actuales ??= etiquetasDisco(raiz, b.eje, b.tit) ?? {};
    const ya = Array.isArray(b.actuales[id]) ? b.actuales[id] : null;
    if (ya && igual(ya, v.conceptos)) { r.iguales += 1; continue; }
    if (ya && !forzar) { r.conservadas.push({ id, actual: ya, propuesta: v.conceptos, fichero: v.fichero }); continue; }
    if (ya) r.cambiadas += 1; else r.nuevas += 1;
    b.cambios.set(id, v.conceptos);
  }
  for (const b of bancos.values()) {
    if (!b.cambios.size) continue;
    const mapa = { ...b.actuales, ...Object.fromEntries(b.cambios) };
    const ruta = rutaEtiquetasDisco(raiz, b.eje, b.tit);
    if (!simular) escribirTexto(ruta, textoEtiquetas(mapa, b.preguntas.map((q) => q.id)));
    r.escritos.push({ eje: b.eje, tit: b.tit, ruta: relative(raiz, ruta), cambios: b.cambios.size });
  }
  return r;
}

export function main(argv = process.argv.slice(2)) {
  const o = leerArgs(argv, ['forzar', 'simular']);
  const raiz = o.raiz ?? RAIZ;
  if (!o._.length) { console.error('Uso: npm run conceptos -- fusionar <lote.json|carpeta>… [--forzar] [--simular]'); return 2; }
  const lotes = ficherosJSON(o._).map((fichero) => ({ fichero, datos: leerJSON(fichero) }));
  const r = fusionar({ raiz, lotes, forzar: !!o.forzar, simular: !!o.simular });
  console.log(`${lotes.length} lotes: ${r.nuevas} nuevas, ${r.cambiadas} cambiadas, ${r.iguales} iguales, ${r.conservadas.length} conservadas (distintas de las ya fusionadas${o.forzar ? '' : '; --forzar para cambiarlas'}), ${r.rechazadas.length} rechazadas, ${r.conflictos.length} en conflicto entre lotes, ${r.faltan.length} sin concepto en el catálogo.${r.sinMotivo ? ` ${r.sinMotivo} sin motivo.` : ''}`);
  for (const e of r.escritos) console.log(`  ${o.simular ? '(simulado) ' : ''}${e.ruta}: ${e.cambios} cambios`);
  const lista = (titulo, xs, f) => { if (xs.length) { console.log(`${titulo} (${xs.length}):`); for (const x of xs.slice(0, 50)) console.log(`  ${f(x)}`); if (xs.length > 50) console.log(`  … y ${xs.length - 50} más`); } };
  lista('Conservadas', r.conservadas, (x) => `${x.id}: queda ${x.actual.join(', ')} · el lote ${x.fichero} propone ${x.propuesta.join(', ')}`);
  lista('Rechazadas', r.rechazadas, (x) => `${x.fichero} ${x.id}: ${x.motivo}`);
  lista('Conflictos entre lotes (no se escriben)', r.conflictos, (x) => `${x.id}: ${x.a.fichero} → ${x.a.conceptos.join(', ')} · ${x.b.fichero} → ${x.b.conceptos.join(', ')}`);
  lista('Sin concepto en el catálogo (propuestas)', r.faltan, (x) => `${x.id}: ${x.falta || '—'}${x.motivo ? ` (${x.motivo})` : ''}`);
  let ok = !r.rechazadas.length && !r.conflictos.length;
  if (!o.simular) {
    const v = validar({ raiz });
    console.log(`\n${informe(v, { maxAvisos: 10 })}`);
    ok = ok && v.ok;
  }
  return ok ? 0 : 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.exitCode = main();
