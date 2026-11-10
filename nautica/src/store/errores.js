// Errores del alumno: qué pasos falla en el modo guiado y qué errores típicos se le diagnostican (R-35, R-36).
// Lo mínimo útil para decirle «fallas sobre todo al calcular la Ct» y enseñar «Tus errores más repetidos».
// - Se guarda en el aparato (localStorage, clave CLAVE), como el bloc de notas: no va al progreso ni al registro de
//   sincronización (el Worker solo acepta las colecciones conocidas, docs/SYNC.md), ni a la copia de seguridad.
// - Una lista de anotaciones cortas, las MAX más recientes de los últimos CADUCA_DIAS días. Una misma pregunta con el
//   mismo error (o el mismo paso) en el mismo día cuenta una vez, para que repetir la pregunta no infle la cuenta.
// - Los nombres son los de la taxonomía común (src/exams/taxonomia.js): pasos (`PASOS`) y errores (`ERRORES`).
// Lógica pura + almacén inyectable (los tests usan un almacén en memoria).

import { PASOS, ERRORES, errorComun } from '../exams/taxonomia.js';

export const CLAVE = 'nautica.errores.v1';
export const MAX = 400;
export const CADUCA_DIAS = 180;
const DIA = 864e5;

/** Estado: { v: 1, ev: [{ t, q, k, id, ok? }] }  k: 'diag' (error diagnosticado), 'paso' (paso del modo guiado). */
export const estadoVacio = () => ({ v: 1, ev: [] });

export function leerEstado(crudo) {
  try {
    const e = typeof crudo === 'string' ? JSON.parse(crudo) : crudo;
    if (!e || e.v !== 1 || !Array.isArray(e.ev)) return estadoVacio();
    const ev = e.ev.filter((x) => x && Number.isFinite(x.t) && typeof x.id === 'string' && (x.k === 'diag' ? ERRORES[x.id] : x.k === 'paso' && PASOS[x.id]));
    return { v: 1, ev };
  } catch { return estadoVacio(); }
}

const mismoDia = (a, b) => Math.floor(a / DIA) === Math.floor(b / DIA);

function anota(estado, x, ahora) {
  const ev = estado.ev.filter((e) => ahora - e.t <= CADUCA_DIAS * DIA
    && !(e.k === x.k && e.id === x.id && e.q === x.q && mismoDia(e.t, ahora)));
  ev.push({ t: ahora, ...x });
  return { v: 1, ev: ev.slice(-MAX) };
}

/** Un error típico diagnosticado (en una pregunta real o en un ejercicio generado: `id` admite sus alias). */
export function anotaError(estado, { q, id }, ahora) {
  const t = errorComun(id);
  return t ? anota(estado, { k: 'diag', q: q ?? null, id: t }, ahora) : estado;
}

/** Un paso del modo guiado: acertado o no (`ok`), o pedido con «Dímelo» (`ok: false`). */
export function anotaPaso(estado, { q, paso, ok }, ahora) {
  return PASOS[paso] ? anota(estado, { k: 'paso', q: q ?? null, id: paso, ok: !!ok }, ahora) : estado;
}

/**
 * Resumen: los errores típicos más repetidos y los pasos con más fallos.
 * @returns {{ errores: {id, nombre, paso, n}[], pasos: {id, nombre, al, fallos, intentos}[], peorPaso: object|null, vacio: boolean }}
 *   `peorPaso`: el paso que más falla (al menos 2 fallos y la mitad de sus intentos, contando los errores
 *   diagnosticados de ese paso); null si no hay uno claro.
 */
export function resumen(estado) {
  const errores = new Map();
  const pasos = new Map();
  const p = (id) => { if (!pasos.has(id)) pasos.set(id, { id, ...PASOS[id], fallos: 0, intentos: 0 }); return pasos.get(id); };
  for (const e of estado.ev) {
    if (e.k === 'diag') {
      errores.set(e.id, (errores.get(e.id) ?? 0) + 1);
      const x = p(ERRORES[e.id].paso); x.fallos += 1; x.intentos += 1;
    } else {
      const x = p(e.id); x.intentos += 1; if (!e.ok) x.fallos += 1;
    }
  }
  const listaE = [...errores].map(([id, n]) => ({ id, nombre: ERRORES[id].nombre, si: ERRORES[id].si, paso: ERRORES[id].paso, n })).sort((a, b) => b.n - a.n);
  const listaP = [...pasos.values()].filter((x) => x.fallos).sort((a, b) => b.fallos - a.fallos || a.intentos - b.intentos);
  const peor = listaP[0];
  return { errores: listaE, pasos: listaP, peorPaso: peor && peor.fallos >= 2 && peor.fallos * 2 >= peor.intentos ? peor : null, vacio: !estado.ev.length };
}

// ---------------------------------------------------------------------------
// Almacén

export function crearAlmacenErrores({ almacen = almacenDelNavegador(), ahora = () => Date.now() } = {}) {
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
    error: (q, id) => escribe(anotaError(lee(), { q, id }, ahora())),
    paso: (q, paso, ok) => escribe(anotaPaso(lee(), { q, paso, ok }, ahora())),
    resumen: () => resumen(lee()),
    borrar: () => escribe(estadoVacio()),
  };
}

function almacenDelNavegador() {
  try { return globalThis.localStorage ?? null; } catch { return null; }
}

/** El almacén del navegador (uno por página). */
let compartido = null;
export const erroresAlumno = () => (compartido ??= crearAlmacenErrores());
