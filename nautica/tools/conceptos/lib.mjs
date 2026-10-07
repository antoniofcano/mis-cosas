// Lectura y escritura de los datos de conceptos desde el disco (herramientas de tools/conceptos/). Todas las funciones
// reciben la raíz de la app (la carpeta nautica/ o, en los tests, una de juguete con la misma estructura).
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RUTA_INDICE, rutaEtiquetas, rutaGrupo } from '../../src/conceptos/catalogo.js';

/** Carpeta nautica/. */
export const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const TITS = ['per', 'py'];

export function leerJSON(ruta, defecto) {
  if (!existsSync(ruta)) {
    if (defecto !== undefined) return defecto;
    throw new Error(`No existe ${ruta}`);
  }
  return JSON.parse(readFileSync(ruta, 'utf8'));
}

export function escribirTexto(ruta, texto) {
  mkdirSync(dirname(ruta), { recursive: true });
  writeFileSync(ruta, texto);
}

/**
 * Ficheros del catálogo: los que nombra el índice (leídos, o con su error) y los .json de data/conceptos/ que el índice
 * no nombra. Sin índice ni carpeta: todo vacío.
 * @returns {{ indice: object|null, errorIndice: string|null, grupos: Array<{ grupo, ruta, datos?, error?, falta? }>, sinIndice: string[] }}
 */
export function leerCatalogo(raiz = RAIZ) {
  const dir = join(raiz, 'data', 'conceptos');
  let indice = null; let errorIndice = null;
  try { indice = leerJSON(join(raiz, RUTA_INDICE), null); } catch (e) { errorIndice = e.message; }
  const nombres = Array.isArray(indice?.grupos) ? indice.grupos : [];
  const grupos = nombres.map((g) => {
    const ruta = join(raiz, rutaGrupo(g));
    if (!existsSync(ruta)) return { grupo: g, ruta, falta: true };
    try { return { grupo: g, ruta, datos: leerJSON(ruta) }; } catch (e) { return { grupo: g, ruta, error: e.message }; }
  });
  const enDisco = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json') && f !== 'index.json').map((f) => f.slice(0, -5)) : [];
  return { indice, errorIndice, grupos, sinIndice: enDisco.filter((g) => !nombres.includes(g)).sort() };
}

/** Los ficheros de grupo leídos sin error (lo que indexa src/conceptos/catalogo.js). */
export const gruposLeidos = (cat) => cat.grupos.filter((g) => g.datos).map((g) => ({ ...g.datos, grupo: g.datos.grupo ?? g.grupo }));

/** Clases del curso nacional: Map idClase → { tit, titulo }. */
export function clasesDelCurso(raiz = RAIZ) {
  const m = new Map();
  for (const tit of TITS) {
    const curso = leerJSON(join(raiz, 'data', 'curso', `${tit}.json`), null);
    for (const mod of curso?.modulos ?? []) for (const l of mod.lecciones ?? []) m.set(l.id, { tit, titulo: l.titulo });
  }
  return m;
}

/** Bancos que hay en disco: [{ eje, tit, prefijo, estado }] (los del registro, con las titulaciones de su ficha). */
export function bancosEnDisco(raiz = RAIZ) {
  const reg = leerJSON(join(raiz, 'data', 'ejes', 'index.json'), { ejes: [] }).ejes ?? [];
  return reg.flatMap((e) => {
    const ficha = leerJSON(join(raiz, 'data', 'ejes', e.id, 'eje.json'), {});
    return Object.keys(ficha.examen ?? {}).filter((t) => TITS.includes(t) && existsSync(join(raiz, 'data', 'ejes', e.id, t, 'preguntas.json')))
      .map((tit) => ({ eje: e.id, tit, prefijo: e.prefijo, estado: e.estado }));
  });
}

const dirBanco = (raiz, eje, tit) => join(raiz, 'data', 'ejes', eje, tit);
export const preguntasDe = (raiz, eje, tit) => leerJSON(join(dirBanco(raiz, eje, tit), 'preguntas.json')).preguntas ?? [];
export const practicaDe = (raiz, eje, tit) => leerJSON(join(dirBanco(raiz, eje, tit), 'practica.json'), {});
export const explicacionesDe = (raiz, eje, tit) => leerJSON(join(dirBanco(raiz, eje, tit), 'explicaciones.json'), {});
export const rutaEtiquetasDisco = (raiz, eje, tit) => join(raiz, rutaEtiquetas(eje, tit));
export const etiquetasDisco = (raiz, eje, tit) => leerJSON(rutaEtiquetasDisco(raiz, eje, tit), null);

/** Clases (de practica.json) de cada pregunta: Map id → [idClase]. */
export function clasesDePreguntas(practica) {
  const m = new Map();
  for (const [clase, ids] of Object.entries(practica ?? {})) for (const id of ids) m.set(id, [...(m.get(id) ?? []), clase]);
  return m;
}

/**
 * Texto del fichero de etiquetas: una pregunta por línea (diferencias limpias en git), en el orden del banco; las que
 * no están en el banco, al final por id.
 */
export function textoEtiquetas(mapa, ordenIds = []) {
  const pos = new Map(ordenIds.map((id, i) => [id, i]));
  const ids = Object.keys(mapa).sort((a, b) => (pos.get(a) ?? 1e9) - (pos.get(b) ?? 1e9) || a.localeCompare(b));
  if (!ids.length) return '{}\n';
  return `{\n${ids.map((id) => `${JSON.stringify(id)}: ${JSON.stringify(mapa[id])}`).join(',\n')}\n}\n`;
}

/** Ficheros .json de una lista de rutas (ficheros o carpetas, sin recursión en subcarpetas ocultas). */
export function ficherosJSON(rutas) {
  const r = [];
  for (const p of rutas) {
    if (!existsSync(p)) throw new Error(`No existe ${p}`);
    let entradas = null;
    try { entradas = readdirSync(p, { withFileTypes: true }); } catch { /* es un fichero */ }
    if (!entradas) r.push(p);
    else r.push(...ficherosJSON(entradas.filter((e) => !e.name.startsWith('.') && (e.isDirectory() || e.name.endsWith('.json'))).map((e) => join(p, e.name)).sort()));
  }
  return r;
}

/** Opciones de la línea de órdenes: --clave valor | --bandera; el resto, posicionales. */
export function leerArgs(argv, banderas = []) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { o._.push(a); continue; }
    const [k, v] = a.slice(2).split('=');
    if (v !== undefined) o[k] = v;
    else if (banderas.includes(k)) o[k] = true;
    else if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) o[k] = argv[++i];
    else o[k] = true;
  }
  return o;
}
