// Lista del día del examen (#/<tit>/dia-examen, R-44): lo que el alumno lleva y comprueba la víspera, con casillas que
// se marcan y se guardan. Funciones puras (sin DOM ni reloj propio) sobre los datos de data/comun/dia-examen.json, las
// fuentes de data/comun/estrategia.json y la ficha del eje.
//
// Regla de rigor (docs/ROADMAP.md, principio 1): solo entra lo que consta en una fuente del repositorio, y cada elemento
// dice cuál. Lo que no está comprobado para un tribunal sale como «pendiente»: se marca como «comprobado en tu
// convocatoria», nunca como norma. La calculadora solo es una casilla si el tribunal y la titulación la permiten
// (src/calculadora/reglas.js); si no, una línea que lo dice, sin casilla.
//
// Lo marcado se guarda en `listadia_<tit>` = { para, marcadas: [id…] } (ajuste compartido entre aparatos). `para` es la
// fecha del examen para la que se marcó: con una convocatoria nueva (la fecha cambia cuando la anterior ya pasó) las
// casillas se reinician; si la fecha solo se corrige antes del examen, se conservan (src/course/convocatoria.js, vigente).

import { vigente } from './convocatoria.js';

export const claveLista = (tit) => `listadia_${tit}`;
/** La casilla «estás en la lista de admitidos»: no se guarda en `listadia_<tit>` sino en la convocatoria (`admitidos`). */
export const ID_ADMITIDOS = 'admitidos';
const MAX_MARCAS = 60;
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const esObj = (x) => x != null && typeof x === 'object' && !Array.isArray(x);

/** Una fuente de estrategia.json (`fuentes[k]`) con su cita corta: { titulo, corto, url, ref }. */
function fuenteDe(fuentes, k, ref, eje) {
  const f = k ? fuentes?.[k] : null;
  if (!f) return null;
  return { id: k, titulo: String(f.titulo).replace('<eje>', eje ?? ''), corto: f.corto ?? f.titulo, url: f.url ?? null, ref: ref ?? null };
}

/**
 * La lista del día del examen de una titulación en un tribunal.
 * @param {object} p
 * @param {object} p.datos  data/comun/dia-examen.json
 * @param {object} p.fuentes  data/comun/estrategia.json → fuentes
 * @param {string} p.tit  'per' | 'py'
 * @param {string} p.eje  id del eje (tribunal)
 * @param {{ permitida: boolean, fuente: object|null }} p.calculadora  cifrasExamen(T, ficha).calculadora
 * @returns {{ grupos: { id, titulo, icono, items: object[] }[], avisos: object[], nota: string|null, sinFicha: boolean,
 *   pendientes: number, marcables: number }}
 *   item: { id, grupo, tipo: 'norma'|'consejo'|'pendiente', texto, comprobar?, ayuda?, fuente: {…}|null, marcable: boolean }
 */
export function listaDiaExamen({ datos, fuentes, tit, eje, calculadora }) {
  const trib = datos.tribunales?.[eje] ?? null;
  const deTit = (x) => !x.tit || x.tit === tit;
  const fu = (x) => fuenteDe(fuentes, x.fuente, x.ref, eje);
  const item = (x) => ({ id: x.id, grupo: x.grupo, tipo: x.tipo, texto: x.texto, comprobar: x.comprobar ?? null, ayuda: x.ayuda ?? null, fuente: fu(x), marcable: true });
  let items;
  if (trib) items = trib.items.filter(deTit).map(item);
  else items = Object.entries(datos.pendienteGenerico ?? {}).flatMap(([grupo, xs]) => xs.map((x) => item({ ...x, grupo })));
  items.push(...(datos.comun ?? []).filter(deTit).map(item));

  // La calculadora: una casilla si se permite; si no, una línea (sin casilla) con su fuente.
  const cal = trib?.calculadora ?? null;
  if (calculadora?.permitida) {
    const f = calculadora.fuente ?? fu(cal ?? {});
    items.push({
      id: 'calculadora', grupo: 'calculadora', tipo: f ? 'norma' : 'pendiente',
      texto: cal?.si ?? 'Calculadora, y que sepas usarla', comprobar: f ? null : 'Qué modelos admiten, y si la permiten, está en tu convocatoria: compruébalo.',
      ayuda: cal?.ayuda ?? null, fuente: f, marcable: true,
    });
  } else {
    const f = calculadora?.fuente ?? null;
    items.push({ id: 'calculadora', grupo: 'calculadora', tipo: f ? 'norma' : 'pendiente', texto: 'Sin calculadora: en tu examen no se permite. Las cuentas, a mano.', comprobar: f ? null : 'Compruébalo en tu convocatoria.', ayuda: null, fuente: f, marcable: false });
  }

  const grupos = (datos.grupos ?? []).map((g) => ({ ...g, items: items.filter((x) => x.grupo === g.id) })).filter((g) => g.items.length);
  const todos = grupos.flatMap((g) => g.items);
  return {
    grupos,
    avisos: (trib?.avisos ?? []).filter(deTit).map((x) => ({ texto: x.texto, fuente: fu(x) })),
    nota: trib?.nota ?? (trib ? null : 'Este tribunal no tiene aún su ficha de examen en la app: todo lo de esta lista, en su convocatoria.'),
    sinFicha: !trib,
    pendientes: todos.filter((x) => x.tipo === 'pendiente').length,
    marcables: todos.filter((x) => x.marcable).length,
  };
}

/** Ids de las casillas marcables de una lista, en orden. */
export const idsMarcables = (lista) => lista.grupos.flatMap((g) => g.items).filter((x) => x.marcable).map((x) => x.id);

/** El ajuste guardado, normalizado: { para, marcadas }. */
export function leerLista(v) {
  const a = esObj(v) ? v : {};
  const marcadas = Array.isArray(a.marcadas) ? [...new Set(a.marcadas.filter((x) => typeof x === 'string' && /^[a-z0-9-]{1,40}$/.test(x)))].slice(0, MAX_MARCAS) : [];
  return { para: ISO.test(a.para ?? '') ? a.para : null, marcadas };
}

/**
 * Las casillas marcadas que cuentan hoy: las guardadas, o ninguna si son de una convocatoria que ya pasó.
 * @param {object} v  el ajuste guardado
 * @param {{ fechaExamen?: string|null, hoy: string }} o
 * @returns {string[]}
 */
export function marcadasVigentes(v, { fechaExamen = null, hoy }) {
  const a = leerLista(v);
  return vigente(a.para, fechaExamen, hoy) ? a.marcadas : [];
}

/** Marca o desmarca una casilla y devuelve lo que se guarda (con `para` = la fecha del examen de hoy). */
export function alternarMarca(v, id, marcada, { fechaExamen = null, hoy }) {
  const actuales = marcadasVigentes(v, { fechaExamen, hoy });
  const sin = actuales.filter((x) => x !== id);
  const a = leerLista(v);
  return { para: fechaExamen && ISO.test(fechaExamen) ? fechaExamen : (vigente(a.para, fechaExamen, hoy) ? a.para : null), marcadas: marcada ? [...sin, id] : sin };
}

/** Desmarca todo (borrar la lista). */
export const vaciarLista = ({ fechaExamen = null } = {}) => ({ para: fechaExamen && ISO.test(fechaExamen) ? fechaExamen : null, marcadas: [] });

/**
 * Cuántas casillas hay marcadas de las que se pueden marcar (la de admitidos cuenta si `admitidos` es true).
 * @returns {{ total: number, hechas: number, faltan: string[] }}  `faltan`: ids sin marcar, en orden
 */
export function casillasHechas(lista, marcadas, { admitidos = false } = {}) {
  const ids = idsMarcables(lista);
  const hechas = new Set(marcadas);
  if (admitidos) hechas.add(ID_ADMITIDOS);
  const faltan = ids.filter((id) => !hechas.has(id));
  return { total: ids.length, hechas: ids.length - faltan.length, faltan };
}

/** Resumen en texto (para `nautica.state()`): una línea por casilla. */
export function resumenLista(lista, marcadas, { admitidos = false } = {}) {
  const hechas = new Set(marcadas);
  if (admitidos) hechas.add(ID_ADMITIDOS);
  const av = casillasHechas(lista, marcadas, { admitidos });
  return [`LISTA DEL DÍA DEL EXAMEN: ${av.hechas} de ${av.total} marcadas${lista.pendientes ? ` · ${lista.pendientes} pendientes de verificar (compruébalo en tu convocatoria)` : ''}`,
    ...lista.grupos.map((g) => `${g.titulo.toUpperCase()}: ${g.items.map((x) => `${x.marcable ? (hechas.has(x.id) ? '[x]' : '[ ]') : '[-]'} ${x.texto}${x.tipo === 'pendiente' ? ' (PENDIENTE DE VERIFICAR)' : ''}${x.fuente ? ` (${x.fuente.corto}${x.fuente.ref ? `, ${x.fuente.ref}` : ''})` : ''}`).join(' · ')}`)].join('\n');
}
