// Cuarentena de lo reservado: inventario de todas las referencias a preguntas reservadas para el examen final
// (docs/BANCOS.md, «Cuarentena») en el contenido que sirve la app y en las fuentes del audio del podcast.
//   node tools/cuarentena.mjs              resumen por tipo y lista de referencias
//   node tools/cuarentena.mjs --json       el inventario entero en JSON
//   node tools/cuarentena.mjs --escribir   regenera el inventario de docs/CUARENTENA.md (entre sus marcas)
// Una referencia es (a) el id de una pregunta reservada fuera de su propio banco (práctica, clases, reglas, mapas,
// podcast…) o (b) su enunciado casi literal en un texto (p. ej. Elena leyéndola en el guion). No cuentan los datos
// de la propia pregunta: su fila del banco, su explicación, sus conceptos, su solución programada y su figura.
// tests/cuarentena.test.js usa `inventario()`: falla con cualquier referencia que no esté en la deuda
// (tools/cuarentena-deuda.json, solo lo que se arregla regenerando audio).
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { RAIZ, bancosNode, ejes, titsDeEje } from './bancos/leer.mjs';

const SIN_TILDES = /[̀-ͯ]/g;
/** Palabras normalizadas de un texto (sin tildes, minúsculas, letras y cifras). */
export const tokens = (s) => String(s ?? '').normalize('NFD').replace(SIN_TILDES, '').toLowerCase().split(/[^a-z0-9ñ]+/).filter(Boolean);
const N = 4; // tejas de cuatro palabras
const tejas = (ws) => { const s = new Set(); for (let i = 0; i + N <= ws.length; i += 1) s.add(ws.slice(i, i + N).join(' ')); return s; };
/** Mínimo de palabras de un enunciado para buscarlo por texto (los cortos dan falsos positivos). */
export const MIN_PALABRAS = 9;
/** Fracción de las tejas del enunciado que tiene que aparecer en un texto para darlo por citado. */
export const UMBRAL_TEXTO = 0.6;

// Ids de pregunta: and-AAAA-cN-tNN | and-py-AAAA-cN[b]-gNN | dgmm-per-AAAA-MM-NN | bal-per-… (lo que diga el banco).
const RE_ID = /\b(?:and|dgmm|bal)-[a-z0-9]+(?:-[a-z0-9]+)+\b/g;
// Ids abreviados tras uno completo («and-py-2022-c1-n11, 2024-c1-n11»): heredan el prefijo del anterior.
const RE_CORTO = /(?<![a-z0-9-])(\d{4}-c\d+b?-[tqgn]\d\d)\b/g;

/** Ficheros (rutas relativas a nautica/) bajo un directorio. */
function archivos(dir) {
  return readdirSync(join(RAIZ, dir)).flatMap((n) => {
    const p = join(dir, n);
    return statSync(join(RAIZ, p)).isDirectory() ? archivos(p) : [p];
  }).map((p) => relative(RAIZ, join(RAIZ, p)).split('\\').join('/'));
}

/** Tipo de contenido de un fichero (para el informe). */
export function tipoDe(f) {
  if (/^data\/podcast\//.test(f)) return 'podcast-linea';
  if (/^data\/podcast-(per|py)\.json$/.test(f)) return 'podcast-ficha';
  if (f === 'podcast/episodios.json') return 'podcast-fuente';
  if (/^podcast\/.*\.md$/.test(f)) return 'podcast-guion';
  if (/^data\/curso\//.test(f)) return 'clase';
  if (/\/practica\.json$/.test(f)) return 'practica';
  if (/\/resueltos\.json$/.test(f)) return 'resueltos';
  if (/\/explicaciones\.json$/.test(f)) return 'explicacion';
  if (/\/conceptos\.json$/.test(f)) return 'conceptos';
  if (/mnemotecnias\.json$/.test(f)) return 'regla';
  if (/chuletario\.json$/.test(f)) return 'chuleta';
  if (/^data\/mapas\//.test(f)) return 'mapa';
  if (/^src\/exams\/solutions\/|^src\/bancos\/ejes\//.test(f)) return 'solucion';
  if (/^src\//.test(f)) return 'codigo';
  return 'dato';
}

/**
 * Alcance de una referencia: 'visible' (el alumno la ve o la oye), 'latente' (va en un fichero servido pero la app no
 * la enseña: la práctica y los resueltos los filtra el motor, la verificación de las clases no se pinta, la lista de
 * preguntas de la ficha del podcast tampoco), 'fuente' (fuente del audio, no se sirve: episodios.json y guiones) o
 * 'metadato' (dato que cuelga de la propia reservada y solo se usa cuando ella sale: las reglas nemotécnicas que la
 * ayudan, el `excepto` de los resueltos). El test no deja pasar ninguna salvo las de 'metadato'.
 */
export function alcanceDe(r) {
  if (r.tipo === 'regla' && r.via === 'id' && /^reglas\.\d+\.preguntas\.\d+$/.test(r.ruta)) return 'metadato';
  if (r.tipo === 'resueltos' && /\.excepto\.\d+$/.test(r.ruta)) return 'metadato';
  if (['practica', 'resueltos', 'podcast-ficha'].includes(r.tipo)) return 'latente';
  if (r.tipo === 'clase' && /\.verificacion\./.test(r.ruta)) return 'latente';
  if (['podcast-fuente', 'podcast-guion'].includes(r.tipo)) return 'fuente';
  return 'visible';
}

/** Lo que se revisa: todo lo servido (index.html, src/, data/) y las fuentes del audio (podcast/episodios.json y guiones). */
export function ficherosRevisados() {
  const servidos = ['index.html', 'llms.txt', ...archivos('src'), ...archivos('data')].filter((f) => /\.(json|js|html|txt)$/.test(f));
  const fuentes = ['podcast/episodios.json', ...archivos('podcast').filter((f) => /^podcast\/(per|py)\/.*\.md$/.test(f))];
  return [...servidos, ...fuentes];
}

/** Recorre un JSON: [ruta, texto] de cada clave y cada cadena. */
function* cadenas(x, ruta = []) {
  if (typeof x === 'string') { yield [ruta, x]; return; }
  if (Array.isArray(x)) { for (let i = 0; i < x.length; i += 1) yield* cadenas(x[i], [...ruta, i]); return; }
  if (x && typeof x === 'object') for (const [k, v] of Object.entries(x)) { yield [[...ruta, k], k, true]; yield* cadenas(v, [...ruta, k]); }
}

/** Ids de pregunta citados en un texto (con los abreviados). */
export function idsEn(texto) {
  const out = [];
  let ultimo = null;
  const todos = [...texto.matchAll(RE_ID)].map((m) => ({ i: m.index, id: m[0] }));
  for (const m of texto.matchAll(RE_CORTO)) todos.push({ i: m.index, corto: m[1] });
  todos.sort((a, b) => a.i - b.i);
  for (const t of todos) {
    if (t.id) { out.push(t.id); ultimo = t.id; continue; }
    const pre = ultimo && /^(.*-)\d{4}-c\d+b?-[tqgn]\d\d$/.exec(ultimo)?.[1];
    if (pre) out.push(pre + t.corto);
  }
  return out;
}

/**
 * Reservadas de todos los ejes y titulaciones (la reserva de la ficha, sin foto de alumno) y las públicas.
 * → { reservadas: Map id → { eje, tit, conv }, gemela: Map id reservada → id pública idéntica (si la hay), porId }
 */
export async function reservas() {
  const B = bancosNode();
  const reservadas = new Map();
  const publicas = [];
  const porId = new Map();
  for (const e of ejes()) {
    for (const tit of titsDeEje(e.id)) {
      const banco = await B.cargarBanco(e.id, tit);
      for (const q of banco.todas) porId.set(q.id, q);
      for (const id of banco.reservadas) reservadas.set(id, { eje: e.id, tit, conv: banco.porId.get(id).conv });
      publicas.push(...banco.estudio);
    }
  }
  // Gemela: la misma pregunta publicada con otro id (mismo enunciado y mismas opciones), que ya es pública.
  const clave = (q) => tokens(`${q.enunciado} ${Object.values(q.opciones ?? {}).sort().join(' ')}`).join(' ');
  const pub = new Map();
  for (const q of publicas) if (!pub.has(clave(q))) pub.set(clave(q), q.id);
  const gemela = new Map();
  for (const id of reservadas.keys()) { const g = pub.get(clave(porId.get(id))); if (g) gemela.set(id, g); }
  return { reservadas, gemela, porId, publicas };
}

/** ¿Es un dato de la propia pregunta (no una cita)? */
function propio(f, ruta, id, reservadas) {
  if (/\/preguntas\.json$/.test(f) && /^data\/ejes\//.test(f)) return true;
  if (tipoDe(f) === 'solucion') return true;
  // Explicación y conceptos de una reservada (también si citan otra reservada: se ven después del examen final).
  if (/\/(explicaciones|conceptos)\.json$/.test(f) && reservadas.has(String(ruta[0]))) return true;
  return false;
}

/** El inventario: [{ id, eje, tit, conv, fichero, ruta, tipo, via: 'id'|'texto', parecido? }]. */
export async function inventario() {
  const { reservadas, gemela, porId, publicas } = await reservas();
  // Índice de tejas de los enunciados reservados (los que no tienen gemela pública y son bastante largos).
  const indice = new Map();
  const nTejas = new Map();
  // Tejas de los enunciados públicos: una teja que también está en una pública no delata a la reservada.
  const tejasPub = new Set();
  for (const q of publicas) for (const t of tejas(tokens(q.enunciado))) tejasPub.add(t);
  for (const [id] of reservadas) {
    if (gemela.has(id)) continue;
    const ws = tokens(porId.get(id).enunciado);
    if (ws.length < MIN_PALABRAS) continue;
    const ts = [...tejas(ws)];
    const propias = ts.filter((t) => !tejasPub.has(t));
    // Si casi todo el enunciado ya sale en preguntas públicas, citarlo no delata nada.
    if (propias.length < 0.4 * ts.length) continue;
    nTejas.set(id, ts.length);
    for (const t of ts) { if (!indice.has(t)) indice.set(t, []); indice.get(t).push(id); }
  }
  const refs = [];
  const add = (r) => refs.push({ ...reservadas.get(r.id), ...r });
  const porTexto = (f, ruta, texto) => {
    if (texto.length < 40) return;
    const cuenta = new Map();
    for (const t of tejas(tokens(texto))) for (const id of indice.get(t) ?? []) cuenta.set(id, (cuenta.get(id) ?? 0) + 1);
    for (const [id, n] of cuenta) {
      const p = n / nTejas.get(id);
      if (p >= UMBRAL_TEXTO && !propio(f, ruta, id, reservadas)) add({ id, fichero: f, ruta: ruta.join('.'), tipo: tipoDe(f), via: 'texto', parecido: Math.round(p * 100) / 100 });
    }
  };
  for (const f of ficherosRevisados()) {
    const txt = readFileSync(join(RAIZ, f), 'utf8');
    if (f.endsWith('.json')) {
      if (/^data\/ejes\/[^/]+\/[^/]+\/preguntas\.json$/.test(f)) continue;
      let datos;
      try { datos = JSON.parse(txt); } catch { continue; }
      for (const [ruta, s, esClave] of cadenas(datos)) {
        for (const id of new Set(idsEn(s))) {
          if (!reservadas.has(id) || propio(f, ruta, id, reservadas)) continue;
          // La clave de la entrada de la propia reservada (explicaciones/conceptos) ya es propia; otra clave con su id, cita.
          add({ id, fichero: f, ruta: ruta.join('.'), tipo: tipoDe(f), via: 'id', ...(esClave ? { clave: true } : {}) });
        }
        if (!esClave) porTexto(f, ruta, s);
      }
    } else {
      if (tipoDe(f) === 'solucion') continue;
      const lineas = txt.split('\n');
      lineas.forEach((l, k) => {
        for (const id of new Set(idsEn(l))) if (reservadas.has(id)) add({ id, fichero: f, ruta: `línea ${k + 1}`, tipo: tipoDe(f), via: 'id' });
      });
      // Por texto, por párrafos (los guiones parten una intervención en varias líneas rara vez; los párrafos bastan).
      txt.split(/\n\s*\n/).forEach((par, k) => porTexto(f, [`párrafo ${k + 1}`], par));
    }
  }
  // Una cita por texto en el mismo sitio que una por id es la misma: se queda la de id.
  const conId = new Set(refs.filter((r) => r.via === 'id').map((r) => `${r.id}|${r.fichero}|${r.ruta}`));
  return refs.filter((r) => r.via === 'id' || !conId.has(`${r.id}|${r.fichero}|${r.ruta}`))
    .map((r) => ({ ...r, alcance: alcanceDe(r), ...(gemela.has(r.id) ? { gemela: gemela.get(r.id) } : {}) }));
}

/** Clave estable de una referencia (la deuda la usa). */
export const claveRef = (r) => `${r.fichero}#${r.ruta}#${r.id}#${r.via}`;

/** Resumen: cuántas referencias por tipo, por eje/tit y cuántas preguntas distintas. */
export function resumen(refs) {
  const por = (k) => refs.reduce((o, r) => ({ ...o, [r[k]]: (o[r[k]] ?? 0) + 1 }), {});
  return { total: refs.length, preguntas: new Set(refs.map((r) => r.id)).size, porAlcance: por('alcance'), porTipo: por('tipo'), porVia: por('via'), porBanco: refs.reduce((o, r) => ({ ...o, [`${r.eje}/${r.tit}`]: (o[`${r.eje}/${r.tit}`] ?? 0) + 1 }), {}) };
}

/** Tabla markdown del inventario (para docs/CUARENTENA.md). */
export function tablaMarkdown(refs, deuda) {
  const enDeuda = new Set(deuda.map((d) => d.clave));
  const s = resumen(refs);
  const filas = [...refs].sort((a, b) => a.fichero.localeCompare(b.fichero) || a.ruta.localeCompare(b.ruta, 'es', { numeric: true }));
  return [
    `Generado con \`node tools/cuarentena.mjs --escribir\`: ${s.total} referencias a ${s.preguntas} preguntas reservadas`
      + ` (${Object.entries(s.porTipo).map(([k, v]) => `${k} ${v}`).join(', ') || 'ninguna'}); ${filas.filter((r) => enDeuda.has(claveRef(r))).length} en la deuda de audio.`,
    '',
    '| Pregunta | Banco | Fichero | Dónde | Tipo | Por | Estado |',
    '|---|---|---|---|---|---|---|',
    ...filas.map((r) => `| \`${r.id}\` | ${r.eje}/${r.tit} | \`${r.fichero}\` | ${r.ruta} | ${r.tipo} | ${r.via}${r.parecido ? ` (${r.parecido})` : ''} | ${enDeuda.has(claveRef(r)) ? 'deuda: regenerar audio' : 'por arreglar'} |`),
  ].join('\n');
}

export const leerDeuda = () => JSON.parse(readFileSync(join(RAIZ, 'tools/cuarentena-deuda.json'), 'utf8')).deuda;

// ---------------------------------------------------------------------------------------------------------------
// Arreglos baratos (solo texto): node tools/cuarentena.mjs --arreglar

/** Lo que queda en una cita de fuentes en lugar del id de una reservada. */
export const MARCA_RESERVADA = '[pregunta reservada]';

/**
 * Una cita de fuentes sin ids de reservadas («Plantilla oficial de Andalucía and-2024-c2-t04 (b), and-2026-c1-t01 (c)»):
 * cada reservada se cambia por su gemela pública (la misma pregunta con otro id y las mismas letras) o por
 * MARCA_RESERVADA; lo demás de la cita (la letra, la nota) no se toca, así sigue diciendo de dónde sale el dato.
 */
export function limpiarCita(s, reservadas, gemela, porId) {
  return s.replace(/\b(?:and|dgmm|bal)-[a-z0-9]+(?:-[a-z0-9]+)+\b/g, (id) => {
    if (!reservadas.has(id)) return id;
    const g = gemela.get(id);
    const mismas = g && JSON.stringify(porId.get(g).opciones) === JSON.stringify(porId.get(id).opciones);
    return mismas && !s.includes(g) ? g : MARCA_RESERVADA;
  });
}

/** Arregla lo barato: práctica y resueltos (fuera las reservadas, dentro su equivalente del estudio) y las fuentes de las clases. */
export async function arreglar({ escribir = false } = {}) {
  const { reservadas, gemela, porId } = await reservas();
  const B = bancosNode();
  const { equivalenteEn } = await import('../src/bancos/equivalentes.js');
  const cambios = [];
  for (const e of ejes()) {
    for (const tit of titsDeEje(e.id)) {
      const banco = await B.cargarBanco(e.id, tit);
      // Práctica: una línea por clase.
      const fp = `data/ejes/${e.id}/${tit}/practica.json`;
      const lineas = readFileSync(join(RAIZ, fp), 'utf8').split('\n').map((l) => {
        const m = /^("[^"]+"):(\[.*\])(,?)$/.exec(l);
        if (!m) return l;
        const ids = JSON.parse(m[2]);
        if (!ids.some((id) => reservadas.has(id))) return l;
        const nuevos = [];
        for (const id of ids) {
          if (!reservadas.has(id)) { if (!nuevos.includes(id)) nuevos.push(id); continue; }
          const q = porId.get(id);
          const ya = new Set([...ids, ...nuevos]);
          const g = gemela.get(id);
          const otra = g && !ya.has(g) && banco.porId.has(g) ? banco.porId.get(g)
            : equivalenteEn(q, banco.estudio.filter((x) => !ya.has(x.id) && x.ut === q.ut && !reservadas.has(x.id)));
          cambios.push({ fichero: fp, clase: JSON.parse(m[1]), quita: id, pone: otra?.id ?? null });
          if (otra) nuevos.push(otra.id);
        }
        return `${m[1]}:${JSON.stringify(nuevos)}${m[3]}`;
      });
      if (escribir) writeFileSync(join(RAIZ, fp), lineas.join('\n'));
      // Resueltos: fuera de `ids` (el `excepto` es metadato de la propia pregunta y se queda).
      const fr = `data/ejes/${e.id}/${tit}/resueltos.json`;
      let tr = readFileSync(join(RAIZ, fr), 'utf8');
      tr = tr.replace(/"ids":\s*(\[[^\]]*\])/g, (todo, arr) => {
        const ids = JSON.parse(arr);
        const fuera = ids.filter((id) => reservadas.has(id));
        if (!fuera.length) return todo;
        for (const id of fuera) cambios.push({ fichero: fr, quita: id, pone: null });
        return todo.replace(arr, JSON.stringify(ids.filter((id) => !reservadas.has(id))).replace(/","/g, '", "'));
      });
      if (escribir) writeFileSync(join(RAIZ, fr), tr);
    }
  }
  // Fuentes de la verificación de las clases.
  for (const f of ['data/curso/per.json', 'data/curso/py.json']) {
    let txt = readFileSync(join(RAIZ, f), 'utf8');
    txt = txt.replace(/("(?:fuente|dato)": )"((?:[^"\\]|\\.)*)"/g, (todo, k, v) => {
      const s = JSON.parse(`"${v}"`);
      const n = limpiarCita(s, reservadas, gemela, porId);
      if (n === s) return todo;
      cambios.push({ fichero: f, antes: s, despues: n });
      return `${k}${JSON.stringify(n)}`;
    });
    if (escribir) writeFileSync(join(RAIZ, f), txt);
  }
  return cambios;
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
  const refs = await inventario();
  if (process.argv.includes('--arreglar') || process.argv.includes('--ver-arreglos')) {
    const cambios = await arreglar({ escribir: process.argv.includes('--arreglar') });
    for (const c of cambios) console.log(JSON.stringify(c));
    console.log(`${cambios.length} cambios${process.argv.includes('--arreglar') ? ' escritos' : ' (sin escribir; --arreglar para escribirlos)'}`);
  } else if (process.argv.includes('--json')) console.log(JSON.stringify(refs, null, 1));
  else if (process.argv.includes('--escribir')) {
    const doc = join(RAIZ, 'docs/CUARENTENA.md');
    const txt = readFileSync(doc, 'utf8');
    const [ini, fin] = ['<!-- inventario -->', '<!-- /inventario -->'];
    const i = txt.indexOf(ini);
    const j = txt.indexOf(fin);
    if (i < 0 || j < 0) throw new Error('docs/CUARENTENA.md sin las marcas del inventario');
    writeFileSync(doc, `${txt.slice(0, i + ini.length)}\n${tablaMarkdown(refs, leerDeuda())}\n${txt.slice(j)}`);
    console.log('docs/CUARENTENA.md:', JSON.stringify(resumen(refs)));
  } else {
    console.log(JSON.stringify(resumen(refs), null, 1));
    for (const r of refs) console.log(`${r.id}\t${r.tipo}\t${r.via}${r.parecido ? `(${r.parecido})` : ''}\t${r.fichero}\t${r.ruta}${r.gemela ? `\tgemela ${r.gemela}` : ''}`);
  }
}
