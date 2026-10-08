// Test de nivel por conceptos (diagnóstico inicial). Funciones puras: reciben el índice de conceptos del banco activo
// (src/conceptos: un eje y una titulación), el curso y las respuestas del alumno, y devuelven qué preguntar, el
// resultado y qué clases puede saltarse. La vista es src/ui/views/nivel.js (#/<tit>/nivel).
//
// Cómo pregunta (adaptativo, ~20 preguntas, unos 8 minutos):
//   - Bloques: los grupos de primer nivel del catálogo (nomenclatura, amarre, maniobra, balizamiento, RIPA, seguridad,
//     legislación, meteorología…); los de navegación (nav.*) son un solo bloque. Solo los que tienen preguntas aptas.
//   - Sondas: de cada bloque, 1–3 ideas según su tamaño, de clases distintas y de la parte media-alta de la ruta (lo
//     que se sabe si se sabe el bloque). La idea de cada sonda es la central de su clase (la que más preguntas tiene).
//     Se pregunta por rondas: primero una sonda de cada bloque, después las segundas…
//   - Si acierta, pasa a la siguiente sonda (otra idea, normalmente de otro bloque). Si falla, una pregunta más fácil
//     del mismo bloque: una idea de las primeras clases de la ruta (lo básico). Si también la falla, el bloque se da
//     por flojo y no se le hacen más sondas.
//   - Como mucho MAX_PREGUNTAS.
//   - Solo preguntas del ESTUDIO del banco (nunca reservadas para el examen final, anuladas ni retiradas: lo garantiza
//     ic.preguntasDe con soloEstudio), con la idea como concepto principal y que se respondan sin carta, anuario,
//     tabla de mareas ni enunciado largo de contexto.
//
// El resultado no se inventa nada: una idea acertada en el test cuenta como sabida y una fallada como floja, igual
// que cualquier respuesta (las respuestas se guardan con progress.recordExam(…, { nivel: true }), que no las mete en
// la cola de repaso). Lo que se deduce para las clases es una OFERTA («Ya lo sabes: saltar»), nunca se marcan vistas.

import { ordenRuta } from './ruta.js';
import { estadoLeccion } from './engine.js';
import { createRng } from '../math/rng.js';

export const VERSION_NIVEL = 1;
export const MAX_PREGUNTAS = 25;
export const SONDAS = 18; // sondas que se reparten entre los bloques (más las fáciles de los fallos)
export const MAX_SONDAS_BLOQUE = 3;
export const SEG_POR_PREGUNTA = 22; // para estimar los minutos (con su corrección)

const NOMBRES = { nav: 'Navegación', baliza: 'Balizamiento', ripa: 'RIPA (abordajes)', carta: 'Problemas de carta' };

/** Bloque del test de una idea: su raíz en el árbol del catálogo; las de navegación (nav.*), juntas. */
export function bloqueDe(catalogo, id) {
  const raiz = catalogo.ancestros(id).at(-1) ?? id;
  return raiz.startsWith('nav.') ? 'nav' : raiz;
}

/** Nombre de un bloque para el alumno. */
export const nombreBloque = (catalogo, b) => NOMBRES[b] ?? catalogo.concepto(b)?.etiqueta ?? b;

/** ¿Vale la pregunta para un test corto? Sin carta, anuario, tabla de mareas ni contexto largo. */
export const apta = (q) => !(q.requiere ?? []).length && !q.tabla_mareas && !q.contexto
  && !(q.figuras ?? []).some((f) => /tabla-mareas/.test(f)) && q.correcta != null && !q.anulada;

/**
 * Las ideas que se pueden preguntar en el test, con su bloque, su clase (la primera en la ruta) y su posición en ella.
 * @returns {{ c: object, bloque: string, qs: object[], clase: string|null, pos: number }[]}  en el orden de la ruta
 */
export function candidatosNivel(ic, tit, curso) {
  if (!ic) return [];
  const pos = new Map(ordenRuta(curso).map((l, i) => [l.id, i]));
  const out = [];
  for (const c of ic.conceptosConPreguntas()) {
    if (c.tipo !== 'concepto' || !(c.tit ?? []).includes(tit)) continue;
    const qs = ic.preguntasDe(c.id, { soloEstudio: true, soloPrincipal: true, conDescendientes: false }).filter(apta);
    if (!qs.length) continue;
    const clases = (c.clases ?? []).filter((id) => pos.has(id)).sort((a, b) => pos.get(a) - pos.get(b));
    out.push({ c, bloque: bloqueDe(ic.catalogo, c.id), qs, clase: clases[0] ?? null, pos: clases.length ? pos.get(clases[0]) : Infinity });
  }
  return out.sort((a, b) => a.pos - b.pos || b.qs.length - a.qs.length || a.c.id.localeCompare(b.c.id));
}

/** Una pregunta de la idea: antes las no vistas y sin figuras; entre ellas, al azar (con la semilla). */
function preguntaDe(cand, respuestas, rng, usadas = new Set()) {
  const libres = cand.qs.filter((q) => !usadas.has(q.id));
  if (!libres.length) return null;
  const nivelQ = (q) => (respuestas[q.id] ? 2 : 0) + ((q.figuras ?? []).length ? 1 : 0);
  const mejor = Math.min(...libres.map(nivelQ));
  const top = libres.filter((q) => nivelQ(q) === mejor);
  return top[Math.floor(rng.next() * top.length)];
}

/**
 * Bloques del test, en el orden de la ruta (el de su primera idea), con sus sondas.
 * @returns {{ id: string, nombre: string, cands: object[], sondas: object[] }[]}
 */
export function bloquesNivel(cands, catalogo, { sondas = SONDAS } = {}) {
  const porBloque = new Map();
  for (const x of cands) porBloque.set(x.bloque, [...(porBloque.get(x.bloque) ?? []), x]);
  const total = cands.length || 1;
  return [...porBloque.entries()].map(([id, xs]) => {
    // Las sondas, de clases distintas (la idea central de cada una) y de la parte media-alta de la ruta del bloque.
    const porClase = new Map();
    for (const x of xs.filter((y) => y.clase)) {
      const ya = porClase.get(x.clase);
      if (!ya || x.qs.length > ya.qs.length) porClase.set(x.clase, x);
    }
    const centrales = [...porClase.values()].sort((a, b) => a.pos - b.pos);
    const base = centrales.length ? centrales : xs;
    const cuota = Math.max(1, Math.min(MAX_SONDAS_BLOQUE, base.length, Math.round((sondas * xs.length) / total)));
    const desde = base.length >= 3 ? Math.floor(base.length / 3) : 0;
    const elegidas = [];
    for (let j = 0; j < cuota; j++) {
      const k = Math.min(base.length - 1, Math.floor(desde + ((j + 0.5) * (base.length - desde)) / cuota));
      if (!elegidas.includes(base[k])) elegidas.push(base[k]);
    }
    return { id, nombre: nombreBloque(catalogo, id), cands: xs, sondas: elegidas };
  });
}

/**
 * Test nuevo: las sondas, por rondas (la primera de cada bloque, luego las segundas…), cada una con su pregunta.
 * Se guarda tal cual (ajuste nivelEnCurso_<eje>_<tit>) para seguir donde se dejó.
 */
export function nuevoNivel(ic, tit, curso, { eje, seed, respuestas = {}, ahora = Date.now() } = {}) {
  const cands = candidatosNivel(ic, tit, curso);
  const bloques = bloquesNivel(cands, ic.catalogo);
  const rng = createRng(seed);
  const usadas = new Set();
  const sondas = [];
  const rondas = Math.max(0, ...bloques.map((b) => b.sondas.length));
  for (let r = 0; r < rondas; r++) {
    for (const b of bloques) {
      const x = b.sondas[r];
      if (!x) continue;
      const q = preguntaDe(x, respuestas, rng, usadas);
      if (!q) continue;
      usadas.add(q.id);
      sondas.push({ bloque: b.id, c: x.c.id, q: q.id });
    }
  }
  return { v: VERSION_NIVEL, eje, tit, seed, inicio: ahora, sondas, hechas: [] };
}

/** Bloques caídos: sonda fallada y su fácil también. Ya no se les pregunta más. */
function caidos(st) {
  const r = new Set();
  st.hechas.forEach((x, i) => { if (x.tipo === 'facil' && !x.ok && st.hechas[i - 1]?.tipo === 'sonda' && !st.hechas[i - 1].ok) r.add(x.bloque); });
  return r;
}

/**
 * La siguiente pregunta del test, o null si ya ha terminado.
 * @returns {{ q: string, c: string, bloque: string, tipo: 'sonda'|'facil' } | null}
 */
export function siguienteNivel(st, ic, tit, curso, respuestas = {}) {
  if (!st || st.hechas.length >= MAX_PREGUNTAS) return null;
  const preguntadas = new Set(st.hechas.map((x) => x.q));
  const ideas = new Set(st.hechas.map((x) => x.c));
  const ult = st.hechas.at(-1);
  if (ult && ult.tipo === 'sonda' && !ult.ok) {
    // Una más fácil del mismo bloque: la idea más temprana en la ruta que no se haya preguntado (ni sea de una sonda).
    const deSondas = new Set(st.sondas.map((s) => s.c));
    const cands = candidatosNivel(ic, tit, curso).filter((x) => x.bloque === ult.bloque && !ideas.has(x.c.id) && !deSondas.has(x.c.id));
    const rng = createRng((Number(st.seed) || 1) + st.hechas.length * 7919);
    for (const x of cands) {
      const q = preguntaDe(x, respuestas, rng, new Set([...preguntadas, ...st.sondas.map((s) => s.q)]));
      if (q) return { q: q.id, c: x.c.id, bloque: ult.bloque, tipo: 'facil' };
    }
  }
  const fuera = caidos(st);
  const s = st.sondas.find((x) => !preguntadas.has(x.q) && !fuera.has(x.bloque));
  return s ? { ...s, tipo: 'sonda' } : null;
}

/** Apunta la respuesta a la pregunta actual (la que da siguienteNivel). */
export function responderNivel(st, actual, ok) {
  return { ...st, hechas: [...st.hechas, { ...actual, ok: !!ok }] };
}

/** Preguntas que quedarían como mucho (para la barra y los minutos): las sondas pendientes más una fácil por fallo. */
export function estimadasNivel(st) {
  if (!st) return 0;
  const preguntadas = new Set(st.hechas.map((x) => x.q));
  const fuera = caidos(st);
  const pendientes = st.sondas.filter((x) => !preguntadas.has(x.q) && !fuera.has(x.bloque)).length;
  const ult = st.hechas.at(-1);
  const facil = ult && ult.tipo === 'sonda' && !ult.ok ? 1 : 0;
  return Math.min(MAX_PREGUNTAS, st.hechas.length + pendientes + facil);
}

/** Minutos que se anuncian antes de empezar (las sondas y un margen para las fáciles). */
export const minutosNivel = (st) => Math.max(1, Math.round((Math.min(MAX_PREGUNTAS, (st?.sondas.length ?? 0) + 3) * SEG_POR_PREGUNTA) / 60));

/**
 * Resultado del test: por bloque (sabe / a medias / flojo) y por idea (sabidas y flojas).
 * @returns {{ v, t, aciertos, total, sabidos: string[], flojos: string[], bloques: { id, nombre, estado, bien, total }[], hechas }}
 */
export function resultadoNivel(st, catalogo, ahora = Date.now()) {
  const bloques = new Map();
  for (const x of st.hechas) {
    const b = bloques.get(x.bloque) ?? { id: x.bloque, nombre: nombreBloque(catalogo, x.bloque), bien: 0, total: 0 };
    b.total += 1;
    if (x.ok) b.bien += 1;
    bloques.set(x.bloque, b);
  }
  for (const b of bloques.values()) b.estado = b.bien === b.total ? 'sabe' : b.bien === 0 ? 'flojo' : 'a-medias';
  const sabidos = [...new Set(st.hechas.filter((x) => x.ok).map((x) => x.c))];
  const flojos = [...new Set(st.hechas.filter((x) => !x.ok).map((x) => x.c))].filter((c) => !sabidos.includes(c));
  const orden = { flojo: 0, 'a-medias': 1, sabe: 2 };
  return {
    v: VERSION_NIVEL, t: new Date(ahora).toISOString(), aciertos: st.hechas.filter((x) => x.ok).length, total: st.hechas.length,
    sabidos, flojos, bloques: [...bloques.values()].sort((a, b) => orden[a.estado] - orden[b.estado]), hechas: st.hechas,
  };
}

/**
 * Clases que el alumno puede saltarse porque ya sabe lo que enseñan: sin empezar, ninguna de sus ideas floja (con lo
 * que ha respondido hasta hoy) y al menos una acertada en el test de nivel (y no fallada después) o dominada con la
 * práctica (≥ 3 respuestas y ≥ 80 % de acierto suavizado). Sin etiquetas (ic null), ninguna.
 * @returns {{ l: object, ideas: object[], porTest: boolean }[]}  en el orden de la ruta
 */
export function clasesQueSabes({ curso, ic, respuestas = {}, regs = {}, nivel = null, tit, ahora = Date.now() }) {
  if (!ic || !curso) return [];
  const dom = ic.dominio(respuestas);
  const delTest = new Set(nivel?.sabidos ?? []);
  const ideasDe = new Map();
  for (const c of ic.conceptosConPreguntas()) {
    if (c.tipo !== 'concepto' || !(c.tit ?? []).includes(tit)) continue;
    for (const id of c.clases ?? []) ideasDe.set(id, [...(ideasDe.get(id) ?? []), c]);
  }
  const out = [];
  for (const l of ordenRuta(curso)) {
    const ideas = ideasDe.get(l.id) ?? [];
    if (!ideas.length || estadoLeccion(l, regs[l.id], respuestas, ahora).estado !== 'nueva') continue;
    if (ideas.some((c) => dom[c.id]?.estado === 'flojo')) continue;
    const porTest = ideas.some((c) => delTest.has(c.id) && dom[c.id]?.ultimo?.ok !== false);
    const porPractica = ideas.some((c) => dom[c.id]?.estado === 'dominado');
    if (porTest || porPractica) out.push({ l, ideas, porTest });
  }
  return out;
}

/** «Dominas X de Y ideas del test»: las acertadas en el test que siguen sin fallarse. */
export function puntoDePartida(nivel, ic, respuestas = {}) {
  if (!nivel) return null;
  const dom = ic ? ic.dominio(respuestas) : {};
  const ideas = [...new Set(nivel.hechas.map((x) => x.c))];
  const sabidas = ideas.filter((c) => nivel.sabidos.includes(c) && dom[c]?.estado !== 'flojo');
  return { sabidas: sabidas.length, total: ideas.length };
}
