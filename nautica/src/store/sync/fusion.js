// Fusión de registros (docs/SYNC.md): unir operaciones por id (lo que hace que reenviar, recibir dos veces o recibir
// en otro orden no cambie nada) y convertir un progreso entero (el de antes de sincronizar, o una copia recuperada) en
// operaciones «base» troceadas. Funciones puras.

import { esAjusteCompartido, TROZO_BASE } from './operaciones.js';

/** Une listas de operaciones por id (la primera que llega con un id se queda). */
export function unirOps(...listas) {
  const m = new Map();
  for (const l of listas) for (const op of l ?? []) if (op && typeof op.i === 'string' && !m.has(op.i)) m.set(op.i, op);
  return [...m.values()];
}

/**
 * Separa un progreso (forma de progress.get()) en lo que se comparte y lo que es del aparato.
 * @returns {{ compartido: object, local: { settings: object, testEnCurso?: object } }}
 */
export function separar(prog) {
  const { settings = {}, testEnCurso, ...resto } = prog ?? {};
  const comp = {};
  const loc = {};
  for (const [k, v] of Object.entries(settings ?? {})) (esAjusteCompartido(k) ? comp : loc)[k] = v;
  const compartido = { ...resto, settings: comp };
  const local = { settings: loc, ...(testEnCurso ? { testEnCurso } : {}) };
  return { compartido, local };
}

/** Instante de los datos de un trozo de progreso: lo más reciente que se ve dentro (o `t`). */
export function instanteDatos(p, t) {
  let h = 0;
  const ve = (x) => { const ms = typeof x === 'number' ? x : Date.parse(x); if (Number.isFinite(ms) && ms > h) h = ms; };
  for (const r of Object.values(p.exams ?? {})) ve(r?.t);
  for (const e of Object.values(p.exercises ?? {})) ve(e?.last);
  for (const x of p.tests ?? []) ve(x?.t);
  for (const l of Object.values(p.lecciones ?? {})) ve(l?.ultimo);
  return h || t;
}

const tam = (x) => JSON.stringify(x).length;

/**
 * Trocea un progreso compartido (de separar()) en operaciones base de un mismo grupo, cada una por debajo de
 * TROZO_BASE (una entrada que sola pase de ahí va en su propio trozo; si pasa de MAX_OP, el servidor la rechazará y se
 * quedará solo en este aparato). `siguienteId()` da ids nuevos del aparato.
 * @returns {object[]}  operaciones { i, k: 'b', t, g, c, h, p }
 */
export function crearBase(compartido, { siguienteId, t = Date.now(), maximo = TROZO_BASE }) {
  const h = instanteDatos(compartido, t);
  // Entradas sueltas: [sección, clave|null, valor]. Las listas (tests) van elemento a elemento.
  const entradas = [];
  for (const [sec, val] of Object.entries(compartido)) {
    if (sec === 'version') continue;
    if (Array.isArray(val)) { if (!val.length) entradas.push([sec, '__lista', null]); for (const x of val) entradas.push([sec, null, x]); }
    else if (sec === 'travesia') {
      // Mal formada (sin bancos): se descarta, como al cargar (se recalcula sola desde los datos).
      if (!val || typeof val !== 'object' || !val.bancos || typeof val.bancos !== 'object' || Array.isArray(val.bancos)) continue;
      const { bancos = {}, ...cab } = val;
      entradas.push([sec, '__cab', cab]);
      for (const [k, v] of Object.entries(bancos)) entradas.push([sec, k, v]);
    } else if (val && typeof val === 'object') {
      if (!Object.keys(val).length) entradas.push([sec, '__vacia', null]);
      for (const [k, v] of Object.entries(val)) entradas.push([sec, k, v]);
    } else entradas.push([sec, '__valor', val]);
  }
  const trozos = [];
  let p = {};
  let usado = 0;
  const cierra = () => { if (Object.keys(p).length) trozos.push(p); p = {}; usado = 0; };
  for (const [sec, k, v] of entradas) {
    const peso = tam(v ?? null) + (k?.length ?? 0) + 8;
    if (usado && usado + peso > maximo) cierra();
    usado += peso;
    if (k === null) (p[sec] ??= []).push(v);
    else if (k === '__valor') p[sec] = v;
    else if (k === '__lista') p[sec] ??= [];
    else if (k === '__vacia') p[sec] ??= {};
    else if (sec === 'travesia') {
      p.travesia ??= { bancos: {} };
      if (k === '__cab') Object.assign(p.travesia, v);
      else p.travesia.bancos[k] = v;
    } else (p[sec] ??= {})[k] = v;
  }
  cierra();
  if (!trozos.length) trozos.push({});
  const ids = trozos.map(() => siguienteId());
  return trozos.map((tr, c) => ({ i: ids[c], k: 'b', t, g: ids[0], c, h, p: tr }));
}

