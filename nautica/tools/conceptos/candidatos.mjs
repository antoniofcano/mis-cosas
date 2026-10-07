// Generador de candidatos: para cada pregunta, los k conceptos del catálogo más probables, con una puntuación, para que
// quien etiqueta (un agente o una persona) elija entre pocos en vez de entre todo el catálogo (docs/CONCEPTOS.md).
//   npm run conceptos -- candidatos [--eje e] [--tit t] [--k 8] [--lote 40] [--salida dir] [--todas] [--ids a,b]
//   npm run conceptos -- candidatos --medir <oro.json>… [--k 8]      recall@k contra etiquetas hechas a mano
//
// Buscador: MiniSearch (BM25 con prefijo y fuzzy) sobre etiqueta, sinónimos, nota y etiqueta del grupo padre de cada
// concepto, con un tokenizador propio: minúsculas, sin palabras vacías, raíz Snowball española (snowball-stemmers) y
// sin acentos. La pregunta se busca por partes (enunciado, respuesta correcta, demás opciones y explicación del eje, con
// distinto peso) y se suma un refuerzo a los conceptos que se enseñan en la clase de la pregunta (practica.json).
// Las dos librerías son devDependencies solo de tools/: la app no las usa. Sin `npm install`, esta orden lo dice y sale.
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { indexarCatalogo, etiquetasDe } from '../../src/conceptos/catalogo.js';
import {
  RAIZ, bancosEnDisco, clasesDePreguntas, escribirTexto, etiquetasDisco, explicacionesDe, ficherosJSON, gruposLeidos, leerArgs,
  leerCatalogo, leerJSON, practicaDe, preguntasDe,
} from './lib.mjs';

export const FORMATO_CANDIDATOS = 'conceptos-candidatos/1';
export const FORMATO_ETIQUETAS = 'conceptos-etiquetas/1';

/** Pesos de cada parte de la pregunta y del refuerzo por clase (ajustables con --medir). */
export const PESOS = { enunciado: 1, correcta: 0.8, opciones: 0.35, explicacion: 0.5, clase: 0.3 };

// Palabras vacías (español) y muletillas de los enunciados de examen que no ayudan a elegir concepto.
const VACIAS = new Set(`a al algo algun alguna algunas alguno algunos ante antes aquel aquella aquellas aquello aquellos aqui asi aun
aunque bajo bien cada casi como con contra cual cuales cualquier cuando cuanto de del desde donde dos durante e el ella
ellas ello ellos en entre era eran es esa esas ese eso esos esta estan estar estas este esto estos fue fueron ha habia
han hasta hay la las le les lo los mas me mediante menos mi mientras muy nada ni no nos o os otra otras otro otros para
pero poco por porque puede pueden que quien se sea segun ser si sido siempre sin sobre solo son su sus tal tambien tan
tanto te tiene tienen todas todo todos tras tu u un una unas uno unos y ya
afirmacion afirmaciones cierta ciertas correcta correctas correcto falsa falso incorrecta indique indica opcion opciones
pregunta respuesta respuestas senale siguiente siguientes verdadera verdadero ninguna anteriores anterior caso dicho
debe deben deberá deberan considera considerar`.split(/\s+/).filter(Boolean));

const sinAcentos = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Carga las librerías del buscador; null si no están instaladas (npm install en nautica/). */
export async function cargarLibrerias() {
  try {
    const [{ default: MiniSearch }, snowball] = await Promise.all([import('minisearch'), import('snowball-stemmers')]);
    const stemmer = (snowball.default ?? snowball).newStemmer('spanish');
    return { MiniSearch, stemmer };
  } catch {
    return null;
  }
}

/** Tokenizador común al índice y a las búsquedas: palabras (letras y dígitos). */
export const tokenizar = (texto) => String(texto ?? '').split(/[^\p{L}\p{N}]+/u).filter(Boolean);

/** Término normalizado: minúsculas → (palabra vacía: fuera) → raíz Snowball → sin acentos. */
export function crearProcesador(stemmer) {
  return (t) => {
    const w = t.toLowerCase();
    if (VACIAS.has(sinAcentos(w))) return null;
    if (/^\d+$/.test(w)) return w; // números: tal cual (millas, metros, grados…)
    if (w.length < 3) return null;
    return sinAcentos(stemmer.stem(w));
  };
}

/**
 * Buscador de conceptos sobre un catálogo indexado.
 * @param {{ catalogo: ReturnType<typeof indexarCatalogo>, MiniSearch: any, stemmer: any, pesos?: object }} p
 * @returns {{ proponer: (q, extra?) => Array<{ id: string, p: number, clase?: true }> }}
 */
export function crearBuscador({ catalogo, MiniSearch, stemmer, pesos = PESOS }) {
  const conceptos = catalogo.conceptos.filter((c) => c.tipo === 'concepto');
  const processTerm = crearProcesador(stemmer);
  const ms = new MiniSearch({
    fields: ['etiqueta', 'sinonimos', 'nota', 'padre'],
    storeFields: [],
    tokenize: tokenizar,
    processTerm,
    searchOptions: {
      boost: { etiqueta: 3, sinonimos: 3, nota: 1, padre: 0.7 },
      combineWith: 'OR',
      prefix: (term) => term.length >= 5,
      fuzzy: (term) => (term.length >= 6 ? 0.2 : false),
      weights: { fuzzy: 0.4, prefix: 0.6 },
    },
  });
  ms.addAll(conceptos.map((c) => ({
    id: c.id, etiqueta: c.etiqueta, sinonimos: (c.sinonimos ?? []).join(' · '), nota: c.nota ?? '', padre: catalogo.concepto(c.padre)?.etiqueta ?? '',
  })));
  const buscar = (texto) => (String(texto ?? '').trim() ? ms.search(texto) : []);

  /**
   * Los k conceptos más probables de una pregunta.
   * @param {object} q  pregunta normalizada (enunciado, opciones, correcta, tit)
   * @param {{ clases?: string[], explicacion?: string, k?: number }} extra
   */
  function proponer(q, { clases = [], explicacion = '', k = 8 } = {}) {
    const suma = new Map();
    const añade = (res, w) => { for (const r of res) suma.set(r.id, (suma.get(r.id) ?? 0) + w * r.score); };
    const ops = q.opciones ?? {};
    const correctas = new Set(q.aceptadas?.length ? q.aceptadas : (q.correcta ? [q.correcta] : []));
    añade(buscar([q.contexto, q.enunciado].filter(Boolean).join(' ')), pesos.enunciado);
    añade(buscar(Object.entries(ops).filter(([l]) => correctas.has(l)).map(([, t]) => t).join(' ')), pesos.correcta);
    añade(buscar(Object.entries(ops).filter(([l]) => !correctas.has(l)).map(([, t]) => t).join(' ')), pesos.opciones);
    if (explicacion) añade(buscar(explicacion), pesos.explicacion);
    const max = Math.max(0, ...suma.values());
    const enClase = new Set(clases);
    const r = [];
    for (const c of conceptos) {
      if (q.tit && c.tit?.length && !c.tit.includes(q.tit)) continue;
      const texto = max ? (suma.get(c.id) ?? 0) / max : 0;
      const clase = c.clases?.some((x) => enClase.has(x)) ?? false;
      const p = (1 - pesos.clase) * texto + (clase ? pesos.clase : 0);
      if (p > 0) r.push({ id: c.id, p: Number(p.toFixed(3)), ...(clase ? { clase: true } : {}) });
    }
    return r.sort((a, b) => b.p - a.p || a.id.localeCompare(b.id)).slice(0, k);
  }
  return { proponer };
}

/** Texto de la explicación del eje que ayuda a buscar (explicación y clave; no la trampa, que habla de lo que no es). */
const textoExplicacion = (e) => (e ? [e.clave, e.explicacion].filter(Boolean).join(' ') : '');
const recorta = (s, n) => (s && s.length > n ? `${s.slice(0, n - 1)}…` : s);

/** Contexto de un banco para proponer: preguntas, clases de cada una, explicaciones y etiquetas ya hechas. */
export function contextoBanco(raiz, eje, tit) {
  return {
    eje, tit, preguntas: preguntasDe(raiz, eje, tit), clases: clasesDePreguntas(practicaDe(raiz, eje, tit)),
    explicaciones: explicacionesDe(raiz, eje, tit), etiquetas: etiquetasDisco(raiz, eje, tit) ?? {},
  };
}

/**
 * Lotes de candidatos de un banco (objetos listos para escribir).
 * @returns {object[]} lotes en formato FORMATO_CANDIDATOS
 */
export function lotesDeBanco(buscador, catalogo, ctx, { k = 8, tam = 40, todas = false, ids = null, fecha = new Date().toISOString().slice(0, 10) } = {}) {
  const elegidas = ctx.preguntas.filter((q) => !q.anulada && (ids ? ids.has(q.id) : (todas || !etiquetasDe(ctx.etiquetas, q.id).length)));
  const lotes = [];
  for (let i = 0; i < elegidas.length; i += tam) {
    const trozo = elegidas.slice(i, i + tam);
    const citados = new Set();
    const preguntas = trozo.map((q) => {
      const clases = ctx.clases.get(q.id) ?? [];
      const e = ctx.explicaciones[q.id];
      const candidatos = buscador.proponer(q, { clases, explicacion: textoExplicacion(e), k });
      candidatos.forEach((c) => citados.add(c.id));
      const ya = etiquetasDe(ctx.etiquetas, q.id);
      return {
        id: q.id, ut: q.ut, ut_titulo: q.ut_titulo ?? undefined, clases,
        enunciado: q.enunciado, opciones: q.opciones, correcta: q.aceptadas?.length > 1 ? q.aceptadas : q.correcta,
        ...(q.contexto ? { contexto: recorta(q.contexto, 400) } : {}),
        ...(e?.clave ? { clave: e.clave } : {}),
        ...(e?.explicacion ? { explicacion: recorta(e.explicacion, 400) } : {}),
        ...(ya.length ? { actuales: ya } : {}),
        candidatos,
      };
    });
    const conceptos = {};
    for (const id of [...citados].sort()) {
      const c = catalogo.concepto(id);
      conceptos[id] = { etiqueta: c.etiqueta, nota: c.nota ?? '', ...(c.padre ? { padre: c.padre } : {}) };
    }
    lotes.push({
      formato: FORMATO_CANDIDATOS, eje: ctx.eje, tit: ctx.tit, lote: lotes.length + 1, de: null, k, generado: fecha,
      instrucciones: 'Para cada pregunta elige 1–2 conceptos (el primero, el principal), preferiblemente de «candidatos»; puedes usar otro id del catálogo si ninguno encaja. '
        + `Escribe un fichero { "formato": "${FORMATO_ETIQUETAS}", "eje", "tit", "autor", "etiquetas": { "<id>": { "conceptos": [..], "motivo": "frase corta" } } }; `
        + 'si no hay concepto en el catálogo: { "conceptos": [], "falta": "id y etiqueta que propones", "motivo": "…" }. docs/CONCEPTOS.md',
      conceptos, preguntas,
    });
  }
  lotes.forEach((l) => { l.de = lotes.length; });
  return lotes;
}

/** Texto de un fichero de lote: cabecera legible y una pregunta por línea. */
export function textoLote(l) {
  const { preguntas, conceptos, ...cab } = l;
  const cabecera = Object.entries(cab).map(([k, v]) => ` ${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(',\n');
  const cs = Object.entries(conceptos).map(([id, c]) => `  ${JSON.stringify(id)}: ${JSON.stringify(c)}`).join(',\n');
  return `{\n${cabecera},\n "conceptos": {\n${cs}\n },\n "preguntas": [\n${preguntas.map((q) => `  ${JSON.stringify(q)}`).join(',\n')}\n ]\n}\n`;
}

/** Etiquetas de oro: un conceptos.json ({ id: [c] }) o un lote de etiquetas decididas. → Map id → [conceptos] */
export function leerOro(datos) {
  const m = new Map();
  if (datos?.formato === FORMATO_ETIQUETAS) {
    for (const [id, e] of Object.entries(datos.etiquetas ?? {})) if (e?.conceptos?.length) m.set(id, e.conceptos);
  } else {
    for (const [id, cs] of Object.entries(datos ?? {})) if (Array.isArray(cs) && cs.length) m.set(id, cs);
  }
  return m;
}

/**
 * recall@k de los candidatos contra etiquetas de oro.
 * @param {Map<string, string[]>} oro
 * @param {(id: string) => Array<{ id: string }>|null} proponerPorId  candidatos de una pregunta (null si no existe)
 */
export function medir(oro, proponerPorId, { ks = [1, 3, 5, 8] } = {}) {
  const kMax = Math.max(...ks);
  const r = { n: 0, desconocidas: [], principal: Object.fromEntries(ks.map((k) => [k, 0])), todos: Object.fromEntries(ks.map((k) => [k, 0])), etiquetas: 0, mrr: 0, fallos: [] };
  for (const [id, gold] of oro) {
    const cand = proponerPorId(id, kMax);
    if (!cand) { r.desconocidas.push(id); continue; }
    r.n += 1; r.etiquetas += gold.length;
    const pos = cand.map((c) => c.id);
    const iP = pos.indexOf(gold[0]);
    if (iP >= 0) r.mrr += 1 / (iP + 1);
    for (const k of ks) {
      if (iP >= 0 && iP < k) r.principal[k] += 1;
      r.todos[k] += gold.filter((g) => { const i = pos.indexOf(g); return i >= 0 && i < k; }).length;
    }
    if (iP < 0) r.fallos.push({ id, oro: gold, top: pos.slice(0, 3) });
  }
  for (const k of ks) { r.principal[k] = r.n ? r.principal[k] / r.n : 0; r.todos[k] = r.etiquetas ? r.todos[k] / r.etiquetas : 0; }
  r.mrr = r.n ? r.mrr / r.n : 0;
  return r;
}

const fmt = (x) => `${(100 * x).toFixed(1)} %`;

export async function main(argv = process.argv.slice(2)) {
  const o = leerArgs(argv, ['todas']);
  const raiz = o.raiz ?? RAIZ;
  const libs = await cargarLibrerias();
  if (!libs) {
    console.error('Faltan las librerías del buscador (minisearch, snowball-stemmers): ejecuta `npm install` en nautica/ (son devDependencies de tools/).');
    return 2;
  }
  const catalogo = indexarCatalogo(gruposLeidos(leerCatalogo(raiz)));
  if (!catalogo.conceptos.some((c) => c.tipo === 'concepto')) {
    console.error('El catálogo no tiene conceptos todavía (data/conceptos/*.json).');
    return 1;
  }
  const buscador = crearBuscador({ catalogo, ...libs });
  const k = Number(o.k ?? 8);
  const bancos = bancosEnDisco(raiz).filter((b) => (!o.eje || b.eje === o.eje) && (!o.tit || b.tit === o.tit));

  if (o.medir) {
    const ficheros = ficherosJSON([o.medir, ...o._].filter((x) => typeof x === 'string'));
    const oro = new Map();
    for (const f of ficheros) for (const [id, cs] of leerOro(leerJSON(f))) oro.set(id, cs);
    const ctxs = bancos.map((b) => contextoBanco(raiz, b.eje, b.tit));
    const donde = new Map();
    for (const ctx of ctxs) for (const q of ctx.preguntas) donde.set(q.id, { q, ctx });
    const r = medir(oro, (id, kk) => {
      const d = donde.get(id);
      return d ? buscador.proponer(d.q, { clases: d.ctx.clases.get(id) ?? [], explicacion: textoExplicacion(d.ctx.explicaciones[id]), k: kk }) : null;
    }, { ks: [...new Set([1, 3, 5, k])].sort((a, b) => a - b) });
    console.log(`Oro: ${r.n} preguntas con ${r.etiquetas} etiquetas (${ficheros.length} ficheros)${r.desconocidas.length ? `; ${r.desconocidas.length} ids no están en los bancos` : ''}.`);
    for (const kk of Object.keys(r.principal)) console.log(`  recall@${kk}: principal ${fmt(r.principal[kk])} · todas las etiquetas ${fmt(r.todos[kk])}`);
    console.log(`  MRR del principal: ${r.mrr.toFixed(3)}`);
    if (r.fallos.length) {
      console.log(`  Principal fuera de los candidatos (${r.fallos.length}; los 10 primeros):`);
      for (const f of r.fallos.slice(0, 10)) console.log(`    ${f.id}: oro ${f.oro.join(', ')} · propone ${f.top.join(', ') || '—'}`);
    }
    return 0;
  }

  const salida = o.salida ?? join(raiz, '.cache', 'conceptos', 'candidatos');
  const ids = typeof o.ids === 'string' ? new Set(o.ids.split(',')) : null;
  const tam = Number(o.lote ?? 40);
  let n = 0; let preguntas = 0;
  for (const b of bancos) {
    const ctx = contextoBanco(raiz, b.eje, b.tit);
    const lotes = lotesDeBanco(buscador, catalogo, ctx, { k, tam, todas: !!o.todas, ids });
    for (const l of lotes) {
      escribirTexto(join(salida, b.eje, b.tit, `lote-${String(l.lote).padStart(3, '0')}.json`), textoLote(l));
      n += 1; preguntas += l.preguntas.length;
    }
    console.log(`${b.eje}/${b.tit}: ${lotes.reduce((s, l) => s + l.preguntas.length, 0)} preguntas en ${lotes.length} lotes`);
  }
  console.log(`${preguntas} preguntas en ${n} lotes → ${salida.startsWith(process.cwd()) ? relative(process.cwd(), salida) || '.' : salida}`);
  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.exitCode = await main();
