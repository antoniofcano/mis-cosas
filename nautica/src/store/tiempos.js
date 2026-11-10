// Tiempo en la práctica de carta (R-42): cuánto tardas en cada pregunta de carta de las tandas y en cada ejercicio de
// carta. Los exámenes guardan su tiempo por pregunta en su propio registro (`recordTest`, campo `tq`, que ya se
// sincroniza); la práctica no cabe en lo que se sincroniza (las operaciones «r» y «e» del registro tienen sus campos
// cerrados y el servidor desplegado rechaza uno nuevo), así que se guarda aquí, en el aparato, como los errores del
// alumno (src/store/errores.js): no va al progreso, ni a la sincronización, ni a la copia. Decisión en docs/SYNC.md.
// Lógica pura + almacén inyectable (los tests usan uno en memoria).

import { TOPE_PREGUNTA_S } from '../course/velocidad.js';

export const CLAVE = 'nautica.tiempos.v1';
export const MAX = 400;
export const CADUCA_DIAS = 180;
const DIA = 864e5;

/** Estado: { v: 1, ev: [{ t, y, s, o, q? }] }  y: tipo de problema · s: segundos · o: acierto · q: pregunta o ejercicio */
export const estadoVacio = () => ({ v: 1, ev: [] });

const valido = (x) => x && Number.isFinite(x.t) && typeof x.y === 'string' && x.y.length <= 60 && Number.isFinite(x.s) && x.s > 0;

export function leerEstado(crudo) {
  try {
    const e = typeof crudo === 'string' ? JSON.parse(crudo) : crudo;
    if (!e || e.v !== 1 || !Array.isArray(e.ev)) return estadoVacio();
    return { v: 1, ev: e.ev.filter(valido) };
  } catch { return estadoVacio(); }
}

/**
 * Anota un tiempo. Menos de 3 s no es resolver (es pasar de largo) y no se anota; el tope, TOPE_PREGUNTA_S. Una misma
 * pregunta o ejercicio (`q`) se anota una vez por día: repetirla enseguida no la hace parecer más rápida.
 */
export function anota(estado, { y, s, o, q = null }, ahora) {
  const seg = Math.min(TOPE_PREGUNTA_S, Math.round(s));
  if (!(seg >= 3) || typeof y !== 'string') return estado;
  const mismoDia = (a) => Math.floor(a / DIA) === Math.floor(ahora / DIA);
  if (q && estado.ev.some((e) => e.q === q && mismoDia(e.t))) return estado;
  const ev = estado.ev.filter((e) => ahora - e.t <= CADUCA_DIAS * DIA);
  ev.push({ t: ahora, y, s: seg, o: !!o, ...(q ? { q } : {}) });
  return { v: 1, ev: ev.slice(-MAX) };
}

export function crearAlmacenTiempos({ almacen = almacenDelNavegador(), ahora = () => Date.now() } = {}) {
  let memoria = null;
  const lee = () => {
    if (memoria) return memoria;
    try { return leerEstado(almacen?.getItem(CLAVE) ?? null); } catch { return (memoria = estadoVacio()); }
  };
  const escribe = (e) => {
    if (memoria) { memoria = e; return; }
    try { if (!almacen) throw new Error('sin almacenamiento'); almacen.setItem(CLAVE, JSON.stringify(e)); } catch { memoria = e; }
  };
  return {
    /** Apunta el tiempo de una pregunta o ejercicio de carta: tipo, segundos, acierto y su id. */
    anota: (x) => escribe(anota(lee(), x, ahora())),
    lista: () => lee().ev,
    borrar: () => escribe(estadoVacio()),
  };
}

function almacenDelNavegador() {
  try { return globalThis.localStorage ?? null; } catch { return null; }
}

let compartido = null;
/** El almacén del navegador (uno por página). */
export const tiemposAlumno = () => (compartido ??= crearAlmacenTiempos());
