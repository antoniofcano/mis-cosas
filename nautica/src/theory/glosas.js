// Siglas y términos que se explican al tocarlos (src/ui/glosas.js): localiza en un texto las abreviaturas
// (data/comun/abreviaturas.json) y los términos del vocabulario (data/comun/vocabulario-*.json). Funciones puras.
//
// - Las siglas distinguen mayúsculas («Ct» no es «CT» ni «ct»); los términos, no.
// - Palabra completa: ni letra ni número pegados delante o detrás, también con tildes y letras griegas
//   («Ct» no se marca en «Ctra», «Δ» no se marca en «Δl», «Da» no se marca en «Dañado»).
// - Cada cosa se marca solo la primera vez (el conjunto `usados` es de una tarjeta o un paso).

const escapa = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const FUERA = '(?<![\\p{L}\\p{N}_])';
const DENTRO = '(?![\\p{L}\\p{N}_])';

/**
 * Temas que tratan lo mismo en las dos titulaciones (la navegación del PER y la del PY, la meteorología, la seguridad):
 * un término del vocabulario se explica en su tema y en los afines; fuera de ellos, no (en una clase de navegación,
 * «en navegación» no es el término del RIPA).
 */
export const TEMAS_AFINES = {
  'per-10': ['per-11', 'py-3', 'py-4'], 'per-11': ['per-10', 'py-3', 'py-4'], 'py-3': ['py-4', 'per-10', 'per-11'], 'py-4': ['py-3', 'per-10', 'per-11'],
  'per-9': ['py-2'], 'py-2': ['per-9'],
  'per-3': ['per-8', 'py-1'], 'per-8': ['per-3', 'py-1'], 'py-1': ['per-3', 'per-8'],
  'per-1': ['per-2', 'per-7'], 'per-2': ['per-1', 'per-7'], 'per-7': ['per-1', 'per-2'],
  'per-5': [], 'per-6': [], 'per-4': [],
};

/** Claves de tema de un contexto: «per-5» (titulación y UT) y la clase («per-5-3»). */
export function clavesTema({ tit, ut, leccion } = {}) {
  return new Set([tit && ut != null ? `${tit}-${ut}` : null, leccion ?? null].filter(Boolean));
}

/**
 * Prepara la búsqueda para un contexto. De cada sigla vale el sentido de ese tema si lo tiene (`temas`) y, si no, el
 * general; un sentido con `temas` no sale fuera de ellos.
 * @param {{ abreviaturas?: object[], terminos?: object[] }} datos  terminos: los del vocabulario (sin los básicos)
 * @param {{ tit?: string, ut?: number, leccion?: string }} ctx
 */
export function compilarGlosas({ abreviaturas = [], terminos = [] } = {}, ctx = {}) {
  const claves = clavesTema(ctx);
  const porSigla = new Map();
  for (const a of abreviaturas) {
    if (ctx.tit && a.tit && !a.tit.includes(ctx.tit)) continue;
    const especifica = !!a.temas?.length;
    if (especifica && !a.temas.some((t) => claves.has(t))) continue;
    const ya = porSigla.get(a.sigla);
    if (!ya || (especifica && !ya.temas?.length)) porSigla.set(a.sigla, a);
  }
  // Términos: los del tema y sus afines (sin tema en el contexto, todos).
  const tema = ctx.tit && ctx.ut != null ? `${ctx.tit}-${ctx.ut}` : null;
  const afines = tema ? new Set([tema, ...(TEMAS_AFINES[tema] ?? [])]) : null;
  const delTema = afines ? terminos.filter((t) => !t.temas?.length || t.temas.some((x) => afines.has(x))) : terminos;
  const porForma = new Map();
  const porTermino = new Map(delTema.map((t) => [t.id, t]));
  for (const t of delTema) for (const f of t.formas ?? []) if (f && !porForma.has(f.toLowerCase())) porForma.set(f.toLowerCase(), t);
  const alternativas = (formas) => formas.sort((a, b) => b.length - a.length).map(escapa).join('|');
  return {
    porSigla,
    porForma,
    porTermino,
    reSigla: porSigla.size ? new RegExp(`${FUERA}(${alternativas([...porSigla.keys()])})${DENTRO}`, 'gu') : null,
    reTermino: porForma.size ? new RegExp(`${FUERA}(${alternativas([...porForma.keys()])})${DENTRO}`, 'giu') : null,
  };
}

/** Lo que se enseña al tocar una glosa. */
export function entradaGlosa(g, id) {
  if (id.startsWith('ab:')) {
    const a = g.porSigla.get(id.slice(3));
    return a && { clase: 'abreviatura', id, titulo: a.sigla, significado: a.significado, texto: a.explicacion ?? '', tit: a.tit ?? [] };
  }
  const t = g.porTermino.get(id.slice(3));
  return t && { clase: 'termino', id, titulo: t.termino, significado: '', texto: t.definicion, tit: [] };
}

/**
 * Parte un texto en trozos normales y glosas (la primera vez de cada una).
 * @param {string} texto
 * @param {ReturnType<typeof compilarGlosas>} g
 * @param {Set<string>} [usados]  ids ya marcados en esta tarjeta (se actualiza)
 * @param {{ excluir?: (entrada: object) => boolean }} [o]  p. ej. lo que delataría la respuesta de una tarjeta
 * @returns {({ tipo: 'texto', texto: string } | { tipo: 'glosa', texto: string, id: string, clase: string })[]}
 */
export function buscarGlosas(texto, g, usados = new Set(), { excluir } = {}) {
  const s = String(texto ?? '');
  if (!s || !g) return [{ tipo: 'texto', texto: s }];
  const hallados = [];
  if (g.reSigla) {
    for (const m of s.matchAll(g.reSigla)) {
      const a = g.porSigla.get(m[0]);
      // «Norte verdadero (Nv)»: la sigla entre paréntesis ya viene explicada al lado; no se marca esa vez.
      const explicada = s[m.index - 1] === '(' && s[m.index + m[0].length] === ')';
      const excepto = explicada || (a.excepto ?? []).some((frase) => s.startsWith(frase, m.index));
      hallados.push({ i: m.index, fin: m.index + m[0].length, id: excepto ? null : `ab:${a.sigla}`, clase: 'abreviatura' });
    }
  }
  if (g.reTermino) {
    for (const m of s.matchAll(g.reTermino)) {
      const t = g.porForma.get(m[0].toLowerCase());
      if (t) hallados.push({ i: m.index, fin: m.index + m[0].length, id: `vo:${t.id}`, clase: 'termino' });
    }
  }
  // De izquierda a derecha y, en el mismo sitio, la más larga; lo que se solapa con algo ya visto no se marca.
  hallados.sort((a, b) => a.i - b.i || b.fin - a.fin);
  const out = [];
  let ocupado = 0; // fin de lo último visto (marcado o no)
  let cursor = 0; // fin de lo último escrito
  for (const x of hallados) {
    if (x.i < ocupado) continue;
    ocupado = x.fin;
    if (!x.id || usados.has(x.id) || (excluir && excluir(entradaGlosa(g, x.id)))) continue;
    usados.add(x.id);
    if (x.i > cursor) out.push({ tipo: 'texto', texto: s.slice(cursor, x.i) });
    out.push({ tipo: 'glosa', texto: s.slice(x.i, x.fin), id: x.id, clase: x.clase });
    cursor = x.fin;
  }
  if (cursor < s.length || !out.length) out.push({ tipo: 'texto', texto: s.slice(cursor) });
  return out;
}

