// Catálogo de conceptos (docs/CONCEPTOS.md): común a todos los ejes y titulaciones. Funciones puras, sin lectura de
// ficheros: las usan la app (src/conceptos/index.js) y las herramientas (tools/conceptos/).
//
// data/conceptos/index.json          { "grupos": ["nomenclatura-maniobra", …] }  qué ficheros forman el catálogo
// data/conceptos/<grupo>.json        { "grupo", "version", "conceptos": [ { id, tipo, etiqueta, sinonimos, nota, padre?,
//                                      relacionados?, tit, clases, temario } ] }
// data/ejes/<eje>/<tit>/conceptos.json  { "<idPregunta>": ["concepto.principal", "concepto.secundario"?] }

/** Ruta del índice de grupos y de cada grupo (relativas a la raíz de la app). */
export const RUTA_INDICE = 'data/conceptos/index.json';
export const rutaGrupo = (grupo) => `data/conceptos/${grupo}.json`;
/** Etiquetas de las preguntas de un banco. */
export const rutaEtiquetas = (eje, tit) => `data/ejes/${eje}/${tit}/conceptos.json`;

/** Id de concepto: minúsculas ASCII y dígitos, en segmentos separados por puntos (dentro de un segmento, «-» o «_»). */
export const ID_CONCEPTO = /^[a-z0-9]+(?:[-_][a-z0-9]+)*(?:\.[a-z0-9]+(?:[-_][a-z0-9]+)*)*$/;
/** Nombre de grupo (fichero): minúsculas ASCII, dígitos y guiones. */
export const ID_GRUPO = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const TIPOS = ['concepto', 'grupo'];
export const MAX_POR_PREGUNTA = 2;

/**
 * Índice del catálogo a partir de los ficheros de grupo ya leídos (los que falten, null, se saltan).
 * Si un id está repetido se queda el primero (el validador lo señala como error).
 * @param {Array<{ grupo: string, conceptos: object[] } | null>} grupos
 */
export function indexarCatalogo(grupos) {
  const conceptos = [];
  const porId = new Map();
  for (const g of grupos ?? []) {
    for (const c of g?.conceptos ?? []) {
      if (!c || typeof c.id !== 'string' || porId.has(c.id)) continue;
      const k = { ...c, grupo: g.grupo, sinonimos: c.sinonimos ?? [], relacionados: c.relacionados ?? [], tit: c.tit ?? [], clases: c.clases ?? [] };
      conceptos.push(k);
      porId.set(k.id, k);
    }
  }
  const hijos = new Map();
  for (const c of conceptos) if (c.padre) hijos.set(c.padre, [...(hijos.get(c.padre) ?? []), c.id]);
  /** El concepto y todos los que cuelgan de él (sin repetir; resiste ciclos). */
  const descendientes = (id) => {
    const vistos = new Set();
    const pila = [id];
    while (pila.length) {
      const x = pila.pop();
      if (vistos.has(x)) continue;
      vistos.add(x);
      pila.push(...(hijos.get(x) ?? []));
    }
    return [...vistos];
  };
  /** Cadena de padres de un concepto, del más cercano a la raíz (resiste ciclos). */
  const ancestros = (id) => {
    const r = [];
    let p = porId.get(id)?.padre;
    while (p && !r.includes(p)) { r.push(p); p = porId.get(p)?.padre; }
    return r;
  };
  return { conceptos, porId, hijos, descendientes, ancestros, concepto: (id) => porId.get(id) ?? null };
}

/** Etiquetas de una pregunta normalizadas a lista de ids (acepta un id suelto por tolerancia). */
export const etiquetasDe = (etiquetas, id) => {
  const e = etiquetas?.[id];
  if (!e) return [];
  return (Array.isArray(e) ? e : [e]).filter((x) => typeof x === 'string');
};
