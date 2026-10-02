// Vocabulario dentro de las preguntas: localiza los términos técnicos en un texto para que el alumno pueda tocarlos
// y leer su definición. Funciones puras (sin DOM).

const escapa = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * @param {{ id, termino, formas: string[], definicion, basico?: boolean }[]} terminos
 * @param {{ basicos?: boolean }} o  los básicos (proa, babor, rumbo…) no se subrayan salvo que se pida: llenarían
 *   de marcas casi todas las preguntas y son lo primero que se aprende
 * @returns {{ porId: Map<string, object>, re: RegExp|null, idDeForma: Map<string, string> }}
 */
export function compilarVocabulario(terminos = [], { basicos = false } = {}) {
  const porId = new Map();
  const idDeForma = new Map();
  for (const t of terminos) {
    if (t.basico && !basicos) continue;
    porId.set(t.id, t);
    for (const f of t.formas ?? []) if (f && !idDeForma.has(f.toLowerCase())) idDeForma.set(f.toLowerCase(), t.id);
  }
  const formas = [...idDeForma.keys()].sort((a, b) => b.length - a.length).map(escapa);
  // palabra completa: ni letra ni número pegados delante o detrás
  const re = formas.length ? new RegExp(`(?<![\\p{L}\\p{N}])(${formas.join('|')})(?![\\p{L}\\p{N}])`, 'giu') : null;
  return { porId, re, idDeForma };
}

/**
 * Parte un texto en trozos normales y términos. Cada término se marca solo la primera vez (`usados` se comparte
 * entre el enunciado y las opciones de una misma pregunta).
 * @returns {({ tipo: 'texto', texto: string } | { tipo: 'termino', texto: string, id: string })[]}
 */
export function segmentar(texto, voc, usados = new Set()) {
  const s = String(texto ?? '');
  if (!voc?.re || !s) return [{ tipo: 'texto', texto: s }];
  const out = [];
  let ultimo = 0;
  for (const m of s.matchAll(voc.re)) {
    const id = voc.idDeForma.get(m[0].toLowerCase());
    if (!id || usados.has(id)) continue;
    usados.add(id);
    if (m.index > ultimo) out.push({ tipo: 'texto', texto: s.slice(ultimo, m.index) });
    out.push({ tipo: 'termino', texto: m[0], id });
    ultimo = m.index + m[0].length;
  }
  if (ultimo < s.length) out.push({ tipo: 'texto', texto: s.slice(ultimo) });
  return out;
}

const sinTildes = (s) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const VACIAS = new Set(['sobre', 'entre', 'hacia', 'desde', 'hasta', 'donde', 'cuando', 'puede', 'pueden', 'tiene', 'tienen', 'siempre', 'nunca', 'todas', 'todos', 'otras', 'otros', 'mismo', 'misma', 'parte', 'forma', 'manera', 'cualquier', 'respuestas', 'anteriores', 'correctas', 'correcta', 'ninguna']);
const llenas = (s) => new Set(sinTildes(s).split(/[^\p{L}\p{N}]+/u).filter((w) => w.length >= 5 && !VACIAS.has(w)));

/**
 * ¿La definición de un término delataría la respuesta correcta? (comparten alguna palabra con contenido, o el
 * término es la propia respuesta). Antes de responder, esos términos no se subrayan.
 */
export function delata(termino, textoCorrecta) {
  if (!termino || !textoCorrecta) return false;
  const c = llenas(textoCorrecta);
  if (!c.size) return false;
  for (const f of termino.formas ?? []) if (sinTildes(textoCorrecta).includes(sinTildes(f))) return true;
  for (const w of llenas(`${termino.definicion} ${termino.termino}`)) if (c.has(w)) return true;
  return false;
}
