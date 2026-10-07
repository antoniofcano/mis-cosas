// Validador del catálogo de conceptos y de las etiquetas de las preguntas (docs/CONCEPTOS.md).
//   npm run conceptos -- validar [--eje <eje>] [--tit per|py] [--json] [--sin-cobertura]
// Comprueba:
//   catálogo (data/conceptos/index.json y <grupo>.json): esquema, ids únicos entre grupos y con formato, padres que
//     existen y son de tipo «grupo», sin ciclos, relacionados que existen, clases que existen en data/curso, tit válidas;
//   etiquetas (data/ejes/<eje>/<tit>/conceptos.json): preguntas que existen en ese banco, 1–2 conceptos de tipo
//     «concepto» que incluyen esa titulación, sin repetir;
//   cobertura: % de preguntas no anuladas etiquetadas por eje, titulación y tema (ut).
// Sale con código 1 si hay errores (los avisos no cuentan). Funciona sin catálogo y sin etiquetas (todo al 0 %).
import { fileURLToPath } from 'node:url';
import { relative } from 'node:path';
import { ID_CONCEPTO, ID_GRUPO, MAX_POR_PREGUNTA, TIPOS } from '../../src/conceptos/catalogo.js';
import { RAIZ, TITS, bancosEnDisco, clasesDelCurso, etiquetasDisco, leerArgs, leerCatalogo, preguntasDe, rutaEtiquetasDisco } from './lib.mjs';

const CAMPOS = ['id', 'tipo', 'etiqueta', 'sinonimos', 'nota', 'padre', 'relacionados', 'tit', 'clases', 'temario'];
const esTexto = (x) => typeof x === 'string' && x.trim() !== '';
const listaDeTextos = (x) => Array.isArray(x) && x.every((s) => typeof s === 'string');

/** Valida el catálogo. → { errores, avisos, porId: Map, pendientes: number, n: { conceptos, grupos, ficheros } } */
export function validarCatalogo(raiz = RAIZ) {
  const errores = []; const avisos = [];
  const cat = leerCatalogo(raiz);
  const rel = (p) => relative(raiz, p);
  if (cat.errorIndice) errores.push(`data/conceptos/index.json: no se puede leer (${cat.errorIndice})`);
  else if (cat.indice) {
    if (!Array.isArray(cat.indice.grupos)) errores.push('data/conceptos/index.json: falta la lista «grupos»');
    else {
      const vistos = new Set();
      for (const g of cat.indice.grupos) {
        if (typeof g !== 'string' || !ID_GRUPO.test(g)) errores.push(`data/conceptos/index.json: nombre de grupo no válido: ${JSON.stringify(g)}`);
        if (vistos.has(g)) errores.push(`data/conceptos/index.json: grupo repetido: ${g}`);
        vistos.add(g);
      }
    }
  }
  for (const g of cat.sinIndice) errores.push(`data/conceptos/${g}.json: no está en data/conceptos/index.json (la app no lo cargaría)`);
  const clases = clasesDelCurso(raiz);
  const porId = new Map(); // id → { c, grupo }
  const todos = [];
  for (const f of cat.grupos) {
    if (f.falta) { avisos.push(`data/conceptos/${f.grupo}.json: aún no existe (el índice lo nombra)`); continue; }
    if (f.error) { errores.push(`${rel(f.ruta)}: no es JSON válido (${f.error})`); continue; }
    const d = f.datos;
    const donde = rel(f.ruta);
    if (!d || typeof d !== 'object' || Array.isArray(d)) { errores.push(`${donde}: debe ser un objeto { grupo, version, conceptos }`); continue; }
    if (d.grupo !== f.grupo) errores.push(`${donde}: «grupo» debe ser "${f.grupo}" (es ${JSON.stringify(d.grupo)})`);
    if (!Number.isInteger(d.version) || d.version < 1) errores.push(`${donde}: «version» debe ser un entero ≥ 1`);
    if (!Array.isArray(d.conceptos)) { errores.push(`${donde}: falta la lista «conceptos»`); continue; }
    d.conceptos.forEach((c, i) => {
      const quien = `${donde} [${i}]${c && typeof c.id === 'string' ? ` ${c.id}` : ''}`;
      if (!c || typeof c !== 'object' || Array.isArray(c)) { errores.push(`${quien}: no es un objeto`); return; }
      if (typeof c.id !== 'string' || !ID_CONCEPTO.test(c.id)) { errores.push(`${quien}: id no válido (minúsculas ASCII, dígitos, «-»/«_» y puntos): ${JSON.stringify(c.id)}`); return; }
      if (porId.has(c.id)) { errores.push(`${quien}: id repetido (ya está en ${porId.get(c.id).grupo})`); return; }
      porId.set(c.id, { c, grupo: f.grupo, quien });
      todos.push({ c, quien });
      const extra = Object.keys(c).filter((k) => !CAMPOS.includes(k));
      if (extra.length) avisos.push(`${quien}: campos desconocidos: ${extra.join(', ')}`);
      if (!TIPOS.includes(c.tipo)) errores.push(`${quien}: «tipo» debe ser ${TIPOS.join(' o ')}`);
      if (!esTexto(c.etiqueta)) errores.push(`${quien}: falta «etiqueta»`);
      if (c.sinonimos !== undefined && !listaDeTextos(c.sinonimos)) errores.push(`${quien}: «sinonimos» debe ser una lista de textos`);
      if (c.nota === undefined) avisos.push(`${quien}: sin «nota» (alcance)`);
      else if (typeof c.nota !== 'string') errores.push(`${quien}: «nota» debe ser un texto`);
      if (c.padre !== undefined && c.padre !== null && typeof c.padre !== 'string') errores.push(`${quien}: «padre» debe ser un id`);
      if (c.relacionados !== undefined && !listaDeTextos(c.relacionados)) errores.push(`${quien}: «relacionados» debe ser una lista de ids`);
      if (!Array.isArray(c.tit) || !c.tit.length || c.tit.some((t) => !TITS.includes(t)) || new Set(c.tit).size !== c.tit.length) errores.push(`${quien}: «tit» debe ser una lista no vacía de ${TITS.join('/')} sin repetir`);
      if (!listaDeTextos(c.clases)) errores.push(`${quien}: «clases» debe ser una lista de ids de clase ([] si ninguna)`);
      else {
        for (const k of c.clases) {
          const cl = clases.get(k);
          if (!cl) errores.push(`${quien}: la clase ${k} no existe en data/curso`);
          else if (Array.isArray(c.tit) && !c.tit.includes(cl.tit)) avisos.push(`${quien}: la clase ${k} es de ${cl.tit} y el concepto no incluye esa titulación`);
        }
        if (c.tipo === 'concepto' && !c.clases.length) avisos.push(`${quien}: concepto sin clases`);
      }
      if (!esTexto(c.temario)) errores.push(`${quien}: falta «temario» (si no se encuentra con seguridad, "pendiente")`);
    });
  }
  // Relaciones (cuando ya se conocen todos los ids)
  for (const { c, quien } of todos) {
    if (typeof c.padre === 'string') {
      const p = porId.get(c.padre)?.c;
      if (c.padre === c.id) errores.push(`${quien}: es su propio padre`);
      else if (!p) errores.push(`${quien}: el padre ${c.padre} no existe`);
      else {
        if (p.tipo !== 'grupo') errores.push(`${quien}: el padre ${c.padre} no es de tipo «grupo»`);
        if (Array.isArray(c.tit) && Array.isArray(p.tit) && c.tit.some((t) => !p.tit.includes(t))) avisos.push(`${quien}: tiene titulaciones que su padre ${c.padre} no tiene`);
      }
    }
    for (const r of Array.isArray(c.relacionados) ? c.relacionados : []) {
      if (r === c.id) errores.push(`${quien}: se cita a sí mismo en «relacionados»`);
      else if (!porId.has(r)) errores.push(`${quien}: el relacionado ${r} no existe`);
    }
  }
  // Ciclos de padres
  const enCiclo = new Set();
  for (const { c } of todos) {
    const camino = [];
    let x = c.id;
    while (typeof x === 'string' && porId.has(x) && !camino.includes(x)) { camino.push(x); x = porId.get(x).c.padre; }
    if (typeof x === 'string' && camino.includes(x)) {
      const ciclo = camino.slice(camino.indexOf(x));
      const clave = [...ciclo].sort().join(',');
      if (!enCiclo.has(clave)) { enCiclo.add(clave); errores.push(`ciclo de padres: ${[...ciclo, x].join(' → ')}`); }
    }
  }
  // Grupos sin hijos y etiquetas repetidas
  const conHijos = new Set(todos.map(({ c }) => c.padre).filter(Boolean));
  for (const { c, quien } of todos) if (c.tipo === 'grupo' && !conHijos.has(c.id)) avisos.push(`${quien}: grupo sin conceptos que cuelguen de él`);
  const porEtiqueta = new Map();
  for (const { c } of todos) if (esTexto(c.etiqueta)) { const k = c.etiqueta.trim().toLowerCase(); porEtiqueta.set(k, [...(porEtiqueta.get(k) ?? []), c.id]); }
  for (const [k, ids] of porEtiqueta) if (ids.length > 1) avisos.push(`etiqueta repetida «${k}»: ${ids.join(', ')}`);
  const pendientes = todos.filter(({ c }) => typeof c.temario === 'string' && c.temario.trim().toLowerCase() === 'pendiente').length;
  return {
    errores, avisos, porId: new Map([...porId].map(([k, v]) => [k, v.c])), pendientes,
    n: { conceptos: todos.filter(({ c }) => c.tipo === 'concepto').length, grupos: todos.filter(({ c }) => c.tipo === 'grupo').length, ficheros: cat.grupos.filter((g) => g.datos).length },
  };
}

/**
 * Valida las etiquetas de un banco contra el catálogo (porId: Map id → concepto) y calcula su cobertura.
 * @returns {{ errores: string[], avisos: string[], existe: boolean, cobertura: { total, etiquetadas, porUt: Record<string, { total, etiquetadas }> } }}
 */
export function validarEtiquetas(raiz, eje, tit, porId, { etiquetas, preguntas } = {}) {
  const errores = []; const avisos = [];
  const donde = relative(raiz, rutaEtiquetasDisco(raiz, eje, tit));
  const qs = preguntas ?? preguntasDe(raiz, eje, tit);
  const porQ = new Map(qs.map((q) => [q.id, q]));
  let et = etiquetas;
  if (et === undefined) {
    try { et = etiquetasDisco(raiz, eje, tit); } catch (e) { errores.push(`${donde}: no es JSON válido (${e.message})`); et = null; }
  }
  const existe = et != null;
  if (existe && (typeof et !== 'object' || Array.isArray(et))) { errores.push(`${donde}: debe ser un objeto { idPregunta: [conceptos] }`); et = {}; }
  const buenas = new Set();
  for (const [id, cs] of Object.entries(et ?? {})) {
    const quien = `${donde} ${id}`;
    const q = porQ.get(id);
    if (!q) { errores.push(`${quien}: la pregunta no existe en el banco ${eje}/${tit}`); continue; }
    if (!Array.isArray(cs) || cs.length < 1 || cs.length > MAX_POR_PREGUNTA) { errores.push(`${quien}: debe llevar una lista de 1 a ${MAX_POR_PREGUNTA} conceptos (el primero, el principal)`); continue; }
    if (new Set(cs).size !== cs.length) errores.push(`${quien}: concepto repetido`);
    let ok = true;
    for (const c of cs) {
      const k = typeof c === 'string' ? porId.get(c) : null;
      if (!k) { errores.push(`${quien}: el concepto ${JSON.stringify(c)} no existe en el catálogo`); ok = false; continue; }
      if (k.tipo !== 'concepto') { errores.push(`${quien}: ${c} es un grupo (solo se etiqueta con conceptos)`); ok = false; }
      if (Array.isArray(k.tit) && !k.tit.includes(tit)) { errores.push(`${quien}: ${c} no es de ${tit}`); ok = false; }
    }
    if (q.anulada) avisos.push(`${quien}: la pregunta está anulada`);
    if (ok) buenas.add(id);
  }
  const cobertura = { total: 0, etiquetadas: 0, porUt: {} };
  for (const q of qs) {
    if (q.anulada) continue;
    const ut = String(q.ut ?? '—');
    const u = (cobertura.porUt[ut] ??= { total: 0, etiquetadas: 0 });
    u.total += 1; cobertura.total += 1;
    if (buenas.has(q.id)) { u.etiquetadas += 1; cobertura.etiquetadas += 1; }
  }
  return { errores, avisos, existe, cobertura };
}

/** Validación completa. Filtros opcionales: eje, tit. */
export function validar({ raiz = RAIZ, eje = null, tit = null } = {}) {
  const cat = validarCatalogo(raiz);
  const errores = [...cat.errores]; const avisos = [...cat.avisos];
  const bancos = [];
  for (const b of bancosEnDisco(raiz)) {
    if ((eje && b.eje !== eje) || (tit && b.tit !== tit)) continue;
    const r = validarEtiquetas(raiz, b.eje, b.tit, cat.porId);
    errores.push(...r.errores); avisos.push(...r.avisos);
    bancos.push({ ...b, existe: r.existe, cobertura: r.cobertura });
  }
  return { ok: !errores.length, errores, avisos, catalogo: { ...cat.n, pendientes: cat.pendientes }, bancos };
}

const pct = (a, b) => (b ? `${((100 * a) / b).toFixed(1)} %` : '—');

/** Informe legible de validar(). */
export function informe(r, { cobertura = true, maxAvisos = 40 } = {}) {
  const l = [];
  l.push(`Catálogo: ${r.catalogo.conceptos} conceptos y ${r.catalogo.grupos} grupos en ${r.catalogo.ficheros} ficheros; temario pendiente en ${r.catalogo.pendientes}.`);
  if (cobertura) {
    l.push('', 'Cobertura (preguntas no anuladas con concepto):');
    for (const b of r.bancos) {
      const c = b.cobertura;
      l.push(`  ${b.eje}/${b.tit}: ${c.etiquetadas}/${c.total} (${pct(c.etiquetadas, c.total)})${b.existe ? '' : ' · sin conceptos.json'}`);
      const uts = Object.keys(c.porUt).sort((a, b2) => Number(a) - Number(b2) || a.localeCompare(b2));
      l.push(`    por tema: ${uts.map((u) => `${u}: ${c.porUt[u].etiquetadas}/${c.porUt[u].total}`).join(' · ')}`);
    }
  }
  if (r.avisos.length) {
    l.push('', `Avisos (${r.avisos.length}):`);
    for (const a of r.avisos.slice(0, maxAvisos)) l.push(`  · ${a}`);
    if (r.avisos.length > maxAvisos) l.push(`  … y ${r.avisos.length - maxAvisos} más (--avisos N para ver más)`);
  }
  l.push('', r.errores.length ? `ERRORES (${r.errores.length}):` : 'Sin errores.');
  for (const e of r.errores) l.push(`  ✗ ${e}`);
  return l.join('\n');
}

export function main(argv = process.argv.slice(2)) {
  const o = leerArgs(argv, ['json', 'sin-cobertura']);
  const r = validar({ raiz: o.raiz ?? RAIZ, eje: o.eje ?? null, tit: o.tit ?? null });
  if (o.json) console.log(JSON.stringify(r, null, 1));
  else console.log(informe(r, { cobertura: !o['sin-cobertura'], maxAvisos: Number(o.avisos ?? 40) }));
  return r.ok ? 0 : 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.exitCode = main();
