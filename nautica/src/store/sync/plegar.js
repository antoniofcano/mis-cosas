// El pliegue (docs/SYNC.md): de un registro de operaciones (operaciones.js) al progreso con EXACTAMENTE la forma de
// siempre (lo que devuelve progress.get()). Función pura y determinista: el mismo conjunto de operaciones da el mismo
// progreso en cualquier aparato y en cualquier orden de llegada, porque antes de plegar se quitan los duplicados (por
// id) y se ordena todo por (instante, aparato, contador, azar).
//
//   1. Las bases (el progreso que cada aparato tenía antes de sincronizar, o una copia recuperada) se unen entre sí:
//      por pregunta, n = el máximo, la última respuesta (opción, acierto, hora, repaso) la más reciente y ok1 (acertó a
//      la primera) la del registro más antiguo; contadores de ejercicios por máximo; minutos por día, el máximo de cada
//      (aparato, día) sumado entre aparatos; travesía, rango máximo e insignias unidas con su fecha más antigua; tests
//      unidos; lo demás, el valor de la base con datos más recientes. Puede quedarse corto (dos aparatos que
//      respondieron la misma pregunta antes de unirse cuentan las veces del que más), nunca largo.
//   2. Después se aplican las operaciones en orden, con la misma lógica que tenía el almacén antiguo (recordExam,
//      recordAttempt, logActividad…): por eso el progreso derivado coincide con el de antes con las mismas llamadas.
//
// La parte del aparato (ajustes que no se comparten y el examen a medias) no viaja: entra como `local`.

import { siguienteRepaso, repasoDe, sumaDias } from '../../course/repaso.js';
import { dispositivoDe, PREFIJOS_PRIMERO } from './operaciones.js';
import { unirOps } from './fusion.js';

/** Orden de los rangos de la travesía (src/course/travesia.js, RANGOS; un test comprueba que coincide). */
export const ORDEN_RANGOS = ['grumete', 'marinero', 'timonel', 'contramaestre', 'patron'];
export const DIAS_GUARDADOS = 60;
export const TESTS_GUARDADOS = 50;
export const HISTORIA_EJERCICIO = 30;
const VERSION_TRAVESIA = 1;

const clon = (x) => (x === undefined ? undefined : JSON.parse(JSON.stringify(x)));
const esObj = (x) => x != null && typeof x === 'object' && !Array.isArray(x);
const iso = (ms) => new Date(ms).toISOString();

/** Partes de un id para ordenar: [aparato, contador (número), azar]. */
function partes(id) {
  const [d = '', n = '', a = ''] = String(id).split('.');
  return [d, parseInt(n, 36) || 0, a];
}

/** Orden total de las operaciones: instante, aparato, contador y azar. */
export function compararOps(a, b) {
  if (a.t !== b.t) return a.t - b.t;
  const [da, na, aa] = partes(a.i);
  const [db, nb, ab] = partes(b.i);
  if (da !== db) return da < db ? -1 : 1;
  if (na !== nb) return na - nb;
  return aa < ab ? -1 : aa > ab ? 1 : 0;
}

const ordenRango = (r) => ORDEN_RANGOS.indexOf(r);
const masAlto = (a, b) => (b == null ? a : a == null ? b : ordenRango(b) > ordenRango(a) ? b : a);
/** Une insignias quedándose con la fecha más antigua de cada una. */
function unirInsignias(a = {}, b = {}) {
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) if (out[k] == null || String(v) < String(out[k])) out[k] = v;
  return out;
}

const claveKV = (c, p) => `${c}\u0001${p.join('\u0001')}`;
// Marca de tiempo de un valor: [instante, id] (se comparan en orden).
const masNueva = (a, b) => !a || b[0] > a[0] || (b[0] === a[0] && b[1] > a[1]);
const primeroGana = (c, p) => c === 'settings' && PREFIJOS_PRIMERO.some((x) => String(p[0]).startsWith(x));

/** Estado del pliegue: el progreso (`prog`, sin la parte del aparato) y lo necesario para seguir plegando. */
export function nuevoPliegue() {
  return { prog: { version: 1, exercises: {}, exams: {}, settings: {} }, kv: new Map(), ultimo: null };
}

/** Une los trozos de cada base (por grupo) y devuelve [{ g, dev, h, p }] en orden. */
export function basesDe(ops) {
  const grupos = new Map();
  for (const op of ops) {
    if (op.k !== 'b') continue;
    if (!grupos.has(op.g)) grupos.set(op.g, []);
    grupos.get(op.g).push(op);
  }
  const out = [];
  for (const [g, trozos] of grupos) {
    trozos.sort((a, b) => a.c - b.c || compararOps(a, b));
    const p = {};
    for (const tr of trozos) {
      for (const [sec, val] of Object.entries(tr.p)) {
        if (Array.isArray(val)) p[sec] = [...(p[sec] ?? []), ...clon(val)];
        else if (esObj(val) && esObj(p[sec])) {
          if (sec === 'travesia') p[sec] = { ...p[sec], ...clon(val), bancos: { ...(p[sec].bancos ?? {}), ...clon(val.bancos ?? {}) } };
          else Object.assign(p[sec], clon(val));
        } else p[sec] = clon(val);
      }
    }
    out.push({ g, dev: dispositivoDe(g), h: Math.max(...trozos.map((x) => x.h)), t: Math.min(...trozos.map((x) => x.t)), p });
  }
  return out.sort((a, b) => a.h - b.h || (a.g < b.g ? -1 : a.g > b.g ? 1 : 0));
}

/** Une las bases en el estado inicial del pliegue. */
export function aplicarBases(est, bases) {
  const { prog } = est;
  if (!bases.length) return est;
  const sola = bases.length === 1;
  // Respuestas.
  const porPregunta = new Map();
  for (const b of bases) for (const [q, r] of Object.entries(b.p.exams ?? {})) if (r) { if (!porPregunta.has(q)) porPregunta.set(q, []); porPregunta.get(q).push(r); }
  for (const [q, rs] of porPregunta) {
    if (sola || rs.length === 1) { prog.exams[q] = clon(rs[0]); continue; }
    const porT = [...rs].sort((a, b) => String(a.t ?? '').localeCompare(String(b.t ?? '')));
    const viejo = porT[0];
    const nuevo = porT.at(-1);
    prog.exams[q] = { ...clon(nuevo), n: Math.max(...rs.map((r) => r.n ?? 1)), ok1: viejo.ok1 ?? viejo.ok };
  }
  // Ejercicios.
  const porTipo = new Map();
  for (const b of bases) for (const [k, e] of Object.entries(b.p.exercises ?? {})) if (e) { if (!porTipo.has(k)) porTipo.set(k, []); porTipo.get(k).push(e); }
  for (const [k, es] of porTipo) {
    if (es.length === 1) { prog.exercises[k] = clon(es[0]); continue; }
    const nuevo = [...es].sort((a, b) => String(a.last ?? '').localeCompare(String(b.last ?? ''))).at(-1);
    const mistakes = {};
    for (const e of es) for (const [m, n] of Object.entries(e.mistakes ?? {})) mistakes[m] = Math.max(mistakes[m] ?? 0, n);
    const hist = new Map();
    for (const e of es) for (const x of e.history ?? []) hist.set(JSON.stringify([x.t, x.ok, x.seed]), x);
    prog.exercises[k] = {
      attempts: Math.max(...es.map((e) => e.attempts ?? 0)), correct: Math.max(...es.map((e) => e.correct ?? 0)),
      streak: nuevo.streak ?? 0, mistakes, last: nuevo.last ?? null,
      history: [...hist.values()].sort((a, b) => String(a.t).localeCompare(String(b.t))).slice(-HISTORIA_EJERCICIO),
    };
  }
  // Minutos por día: máximo de cada (aparato, día), sumado entre aparatos.
  if (bases.some((b) => b.p.dias)) {
    const porDev = new Map();
    for (const b of bases) {
      const m = porDev.get(b.dev) ?? {};
      for (const [d, v] of Object.entries(b.p.dias ?? {})) m[d] = { min: Math.max(m[d]?.min ?? 0, v?.min ?? 0), act: Math.max(m[d]?.act ?? 0, v?.act ?? 0) };
      porDev.set(b.dev, m);
    }
    const dias = {};
    for (const m of porDev.values()) for (const [d, v] of Object.entries(m)) dias[d] = { min: (dias[d]?.min ?? 0) + v.min, act: (dias[d]?.act ?? 0) + v.act };
    prog.dias = sola ? clon(bases[0].p.dias ?? {}) : dias;
  }
  // Tests: unión (sin id propio: los identifica su hora, tipo, convocatoria, titulación y eje).
  if (bases.some((b) => Array.isArray(b.p.tests))) {
    if (sola) prog.tests = clon(bases[0].p.tests ?? []);
    else {
      const m = new Map();
      for (const b of bases) for (const x of b.p.tests ?? []) m.set(JSON.stringify([x?.t, x?.tipo, x?.conv, x?.tit, x?.eje]), x);
      prog.tests = clon([...m.values()].sort((a, b) => String(a?.t ?? '').localeCompare(String(b?.t ?? ''))).slice(-TESTS_GUARDADOS));
    }
  }
  // Travesía.
  for (const b of bases) {
    const tr = b.p.travesia;
    if (!esObj(tr) || !esObj(tr.bancos)) continue;
    prog.travesia ??= { ...clon(tr), bancos: {} };
    prog.travesia.v ??= tr.v ?? VERSION_TRAVESIA;
    for (const [k, r] of Object.entries(tr.bancos)) {
      if (!esObj(r)) continue;
      const antes = prog.travesia.bancos[k];
      prog.travesia.bancos[k] = antes
        ? { ...antes, rango: masAlto(antes.rango ?? null, r?.rango ?? null), insignias: unirInsignias(antes.insignias, r?.insignias) }
        : clon(r);
    }
  }
  // Valores con nombre: el de la base con datos más recientes (o el primero, para la reserva del examen final).
  for (const b of bases) {
    const marca = [b.h, b.g];
    for (const [c, prof] of [['lecciones', 1], ['niveles', 1], ['planes', 1], ['fichas', 2], ['repConceptos', 2], ['settings', 1]]) {
      const sec = b.p[c];
      if (!esObj(sec)) continue;
      const entradas = prof === 1 ? Object.entries(sec).map(([k, v]) => [[k], v]) : Object.entries(sec).flatMap(([k, o]) => (esObj(o) ? Object.entries(o).map(([k2, v]) => [[k, k2], v]) : []));
      if (c !== 'settings') prog[c] ??= {};
      for (const [p, v] of entradas) ponerKV(est, c, p, v, marca, true);
    }
    // Lo que no se conoce (campos de una versión futura): el de la base más reciente.
    for (const [k, v] of Object.entries(b.p)) {
      if (['version', 'exams', 'exercises', 'dias', 'tests', 'travesia', 'lecciones', 'niveles', 'planes', 'fichas', 'repConceptos', 'settings', 'testEnCurso'].includes(k)) continue;
      prog[k] = clon(v);
    }
  }
  return est;
}

function ponerKV(est, c, p, v, marca, presente) {
  const clave = claveKV(c, p);
  const antes = est.kv.get(clave);
  const gana = primeroGana(c, p) ? (!antes || marca[0] < antes[0] || (marca[0] === antes[0] && marca[1] < antes[1])) : masNueva(antes, marca);
  if (!gana) return;
  est.kv.set(clave, marca);
  const { prog } = est;
  if (c === 'settings') {
    if (presente) prog.settings[p[0]] = clon(v); else delete prog.settings[p[0]];
    return;
  }
  if (p.length === 1) {
    prog[c] = { ...(prog[c] ?? {}), [p[0]]: clon(v) };
    if (!presente) delete prog[c][p[0]];
  } else {
    const dentro = { ...(prog[c]?.[p[0]] ?? {}), [p[1]]: clon(v) };
    if (!presente) delete dentro[p[1]];
    prog[c] = { ...(prog[c] ?? {}), [p[0]]: dentro };
  }
}

/** Aplica una operación (que no es base) al estado del pliegue, con la lógica del almacén de siempre. */
export function aplicar(est, op) {
  const { prog } = est;
  switch (op.k) {
    case 'r': {
      const prev = prog.exams[op.q];
      const n = (prev?.n ?? (prev ? 1 : 0)) + 1;
      const ok1 = prev ? (prev.ok1 ?? prev.ok) : op.o;
      const rep = op.n ? (prev ? repasoDe(prev, op.d) : null) : siguienteRepaso(prev, op.o, op.d);
      const t = iso(op.t);
      // Una respuesta más antigua que la guardada (un aparato que llega tarde) suma su vez y su repaso, pero la última
      // respuesta sigue siendo la más reciente.
      if (prev && String(prev.t ?? '') > t) prog.exams[op.q] = { ...prev, n, ok1, rep };
      else prog.exams[op.q] = { choice: op.c, ok: op.o, t, n, ok1, rep, ...(op.n ? { nivel: true } : {}) };
      break;
    }
    case 'e': {
      const e = (prog.exercises[op.y] ??= { attempts: 0, correct: 0, streak: 0, mistakes: {}, last: null, history: [] });
      e.attempts += 1;
      if (op.o) { e.correct += 1; e.streak += 1; } else { e.streak = 0; }
      e.mistakes ??= {};
      for (const m of op.m ?? []) e.mistakes[m] = (e.mistakes[m] ?? 0) + 1;
      e.last = iso(op.t);
      e.history = [...(e.history ?? []), { t: e.last, ok: op.o, seed: op.s }].slice(-HISTORIA_EJERCICIO);
      break;
    }
    case 'v':
      ponerKV(est, op.c, op.p, op.v, [op.t, op.i], Object.hasOwn(op, 'v'));
      break;
    case 'a': {
      const dias = { ...(prog.dias ?? {}) };
      const d = dias[op.d] ?? { min: 0, act: 0 };
      dias[op.d] = { min: d.min + op.m, act: d.act + 1 };
      const limite = sumaDias(op.d, -(DIAS_GUARDADOS - 1));
      prog.dias = Object.fromEntries(Object.entries(dias).filter(([k]) => k >= limite));
      break;
    }
    case 'x':
      prog.tests = [...(prog.tests ?? []), clon(op.e)].slice(-TESTS_GUARDADOS);
      break;
    case 'g': {
      const antes = prog.travesia ?? { v: VERSION_TRAVESIA, bancos: {} };
      const r = antes.bancos?.[op.b];
      const reg = r
        ? { rango: masAlto(r.rango ?? null, op.r ?? null), insignias: unirInsignias(r.insignias, op.s) }
        : { rango: op.r ?? null, insignias: { ...op.s } };
      prog.travesia = { ...antes, v: antes.v ?? VERSION_TRAVESIA, bancos: { ...antes.bancos, [op.b]: reg } };
      break;
    }
    default:
      break; // tipo desconocido (de una versión futura): se ignora
  }
  est.ultimo = op;
  return est;
}

/**
 * Pliega un registro entero.
 * @param {object[]} ops  operaciones (con duplicados o desordenadas: da igual)
 * @param {{ settings?: object, testEnCurso?: object }} local  la parte del aparato
 * @returns {{ prog: object, est: object }}  prog: el progreso (con la parte del aparato); est: para seguir plegando
 */
export function plegarConEstado(ops, local = {}) {
  const todas = unirOps(ops);
  const est = nuevoPliegue();
  aplicarBases(est, basesDe(todas));
  for (const op of todas.filter((x) => x.k !== 'b').sort(compararOps)) aplicar(est, op);
  return { prog: conLocal(est.prog, local), est };
}

/** plegar(operaciones, local) → progreso (lo que devuelve progress.get(), antes de normalizar). */
export const plegar = (ops, local = {}) => plegarConEstado(ops, local).prog;

/** El progreso con la parte del aparato encima (ajustes por defecto, ajustes del aparato y examen a medias). */
export function conLocal(prog, local = {}) {
  prog.settings = { level: 'PER', toleranceFactor: 1, ...prog.settings, ...(local.settings ?? {}) };
  if (local.testEnCurso) prog.testEnCurso = local.testEnCurso;
  else delete prog.testEnCurso;
  return prog;
}
