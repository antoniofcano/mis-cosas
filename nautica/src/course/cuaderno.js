// Cuaderno de fallos (R-55, R-56; docs/CARTA-MOVIL.md, función 2): «Patrón sabe cómo fallas tú, y te arregla eso».
//
// Un FALLO es un error típico con nombre (id de src/exams/taxonomia.js, ERRORES) en un tipo de problema (el id del
// ejercicio: 'marea-sonda', 'conversion-rumbos'…, o 'carta' si la pregunta no tiene tipo). Ejemplo: «Adelanto al revés»
// en «Marea y sonda», paso «Hora oficial y UT». Su id es «<error>.<tipo>» (adelanto-signo.marea-sonda).
//
// De dónde salen (origen de cada vez): un paso del paso a paso que falla con un error reconocido (diagnosticarPaso), la
// opción falsa marcada en una pregunta real con diagnóstico único (diagnosticar: práctica, simulacros, exámenes y tu
// examen oficial), los errores típicos de un ejercicio generado (`mistakes`) y el primer fallo con nombre de una hoja
// hecha en papel y corregida por pasos (R-58). Una misma pregunta (o semilla) con el
// mismo fallo el mismo día cuenta una vez: así el paso guiado y la opción final de esa pregunta no se cuentan dos veces.
//
// Estados y calendario:
//   abierto    → toca una DOSIS (1–2 minutos de micro-tarjetas sobre ese paso, src/course/dosis.js). Superada la dosis,
//                la COMPROBACIÓN queda para dentro de DIAS_COMPROBACION días (DIAS_TRAS_FALLO si la última comprobación
//                salió mal: dosis antes y comprobación antes).
//   comprobar  → un problema completo del tipo, sin pistas (pregunta real del estudio cuya trampa es ese error, o un
//                ejercicio generado). Bien: «vigilando» y la siguiente, a DIAS_VIGILANDO días. Dos seguidas bien:
//                «resuelto». Mal: «abierto» otra vez (dosis primero).
//   reaparece  → si vuelves a cometerlo (vigilando o resuelto, o esperando la comprobación), vuelve a «abierto».
//
// Dónde se guarda: un ajuste compartido por fallo (`fallo_<id>`, colección `settings`; docs/SYNC.md, «Cuaderno de
// fallos»): viaja entre aparatos con el Worker desplegado tal cual. Cada valor es pequeño (< 1 KB: las últimas
// MAX_VECES veces y las últimas MAX_COMP comprobaciones). Lógica pura: las fechas entran como `ahora` (inyectables).

import { ERRORES, PASOS, errorComun } from '../exams/taxonomia.js';
import { nombreTipo } from './velocidad.js';
import { diaISO } from '../texto.js';
import { sumaDias } from './repaso.js';

export const PREFIJO_FALLO = 'fallo_';
export const DIAS_COMPROBACION = 3;
export const DIAS_TRAS_FALLO = 2;
export const DIAS_VIGILANDO = 7;
/** Comprobaciones seguidas bien para darlo por resuelto. */
export const SEGUIDAS_RESUELTO = 2;
/** Veces que se guardan con su fecha y origen (las más recientes); `n` cuenta todas. */
export const MAX_VECES = 8;
export const MAX_COMP = 6;
/** Fallos que enseña el cuaderno (los más recientes). */
export const MAX_FALLOS = 60;
/** Una dosis se supera con este acierto (4 de 5). */
export const UMBRAL_DOSIS = 0.8;

export const ESTADOS = { abierto: 'Abierto', vigilando: 'Vigilando', resuelto: 'Resuelto' };

/** De dónde salió una vez: código corto (lo que se guarda) → texto para el alumno. */
export const ORIGENES = {
  paso: 'paso a paso',
  pregunta: 'pregunta de examen',
  simulacro: 'simulacro',
  examen: 'examen',
  oficial: 'tu examen oficial',
  ejercicio: 'ejercicio generado',
  comprobacion: 'comprobación',
  // La hoja en papel corregida por pasos (R-58, src/exams/papel.js): solo el primer fallo con nombre, no los arrastrados.
  papel: 'tu hoja en papel',
};

const TIPO_RE = /^[a-z0-9-]{1,60}$/;

/** Id de un fallo: «<error>.<tipo>». */
export const idFallo = (error, tipo) => `${error}.${tipo || 'carta'}`;
export const claveFallo = (id) => `${PREFIJO_FALLO}${id}`;
export const esClaveFallo = (k) => typeof k === 'string' && k.startsWith(PREFIJO_FALLO);
export function partesFallo(id) {
  const [error, ...resto] = String(id).split('.');
  return { error, tipo: resto.join('.') || 'carta' };
}

/** ¿Vale como registro de un fallo? (lo que llega de otro aparato o de una versión antigua se comprueba al leer) */
export function falloValido(f) {
  return !!f && typeof f === 'object' && !!ERRORES[f.e] && typeof f.y === 'string' && TIPO_RE.test(f.y)
    && Number.isInteger(f.n) && f.n >= 0 && Array.isArray(f.ev) && ESTADOS[f.est] != null;
}

/** Un fallo nuevo, sin veces. */
export const falloVacio = (error, tipo) => ({ e: error, y: tipo || 'carta', n: 0, ev: [], est: 'abierto', dosis: null, comp: { prox: null, seguidas: 0, hist: [] } });

const dia = (t) => diaISO(t);

/**
 * Anota una vez del fallo.
 * @param {object|null} f  el fallo guardado (o null)
 * @param {{ error: string, tipo?: string, origen: string, q?: string|null }} x  `error` admite los alias de los ejercicios
 * @returns {{ f: object, contado: boolean, nuevo: boolean, reabierto: boolean } | null}  null si el error no está en la taxonomía
 */
export function anotar(f, { error, tipo = 'carta', origen, q = null }, ahora = Date.now()) {
  const e = errorComun(error);
  if (!e) return null;
  const y = TIPO_RE.test(tipo ?? '') ? tipo : 'carta';
  const base = falloValido(f) && f.e === e ? f : falloVacio(e, y);
  const hoy = dia(ahora);
  // La misma pregunta (o semilla) el mismo día: no se cuenta otra vez.
  if (q && base.ev.some((v) => v.q === q && dia(v.t) === hoy)) return { f: base, contado: false, nuevo: false, reabierto: false };
  const nuevo = base.n === 0;
  const reabierto = !nuevo && (base.est !== 'abierto' || !!base.comp?.prox);
  const ev = [...base.ev, { t: ahora, o: ORIGENES[origen] ? origen : 'pregunta', ...(q ? { q: String(q).slice(0, 80) } : {}) }].slice(-MAX_VECES);
  const out = { ...base, n: base.n + 1, ev, est: 'abierto', comp: { ...(base.comp ?? {}), prox: null, seguidas: 0, hist: base.comp?.hist ?? [] } };
  return { f: out, contado: true, nuevo, reabierto };
}

/** Resultado de una dosis: superada (≥ UMBRAL_DOSIS) deja la comprobación para dentro de unos días. */
export function dosisHecha(f, { aciertos, total }, ahora = Date.now()) {
  if (!falloValido(f)) return f;
  const ok = total > 0 && aciertos / total >= UMBRAL_DOSIS;
  const dosis = { t: ahora, ok, n: (f.dosis?.n ?? 0) + 1, a: aciertos, de: total };
  let comp = f.comp ?? { prox: null, seguidas: 0, hist: [] };
  // Superada y sin comprobación pendiente: se fija. Si ya había una fecha (dosis voluntaria mientras esperas), se queda.
  if (ok && f.est !== 'resuelto' && !comp.prox) {
    const ultimaMal = comp.hist?.length && !comp.hist.at(-1).ok;
    comp = { ...comp, prox: sumaDias(dia(ahora), ultimaMal ? DIAS_TRAS_FALLO : DIAS_COMPROBACION) };
  }
  return { ...f, dosis, comp };
}

/** Resultado de una comprobación (problema completo, sin pistas). */
export function comprobacionHecha(f, { ok, q = null }, ahora = Date.now()) {
  if (!falloValido(f)) return f;
  const c = f.comp ?? { prox: null, seguidas: 0, hist: [] };
  const hist = [...(c.hist ?? []), { t: ahora, ok: !!ok, ...(q ? { q: String(q).slice(0, 80) } : {}) }].slice(-MAX_COMP);
  if (!ok) return { ...f, est: 'abierto', comp: { prox: null, seguidas: 0, hist } };
  const seguidas = (c.seguidas ?? 0) + 1;
  if (seguidas >= SEGUIDAS_RESUELTO) return { ...f, est: 'resuelto', comp: { prox: null, seguidas, hist } };
  return { ...f, est: 'vigilando', comp: { prox: sumaDias(dia(ahora), DIAS_VIGILANDO), seguidas, hist } };
}

/**
 * Qué pide hoy un fallo: 'dosis' (abierto y sin comprobación fijada), 'comprobar' (le toca la comprobación) o null
 * (esperando, o resuelto).
 */
export function pendiente(f, ahora = Date.now()) {
  if (!falloValido(f) || f.est === 'resuelto') return null;
  const prox = f.comp?.prox ?? null;
  if (prox) return prox <= dia(ahora) ? 'comprobar' : null;
  return f.est === 'abierto' ? 'dosis' : null;
}

/** Última vez que se cometió (instante), o 0. */
export const ultimaVez = (f) => f.ev?.at(-1)?.t ?? 0;

/** Nombre en lenguaje claro: «Adelanto al revés», «Marea y sonda · Hora oficial y UT». */
export function nombreFallo(f) {
  const E = ERRORES[f.e];
  const paso = PASOS[E.paso]?.nombre ?? '';
  const tipo = f.y === 'carta' ? null : nombreTipo(f.y);
  // «Estima analítica · Estima analítica (loxodrómica)» → solo el paso, que ya lo dice.
  const donde = tipo && !paso.startsWith(tipo) ? `${tipo} · ${paso}` : paso;
  return { titulo: E.nombre, paso, tipo: tipo ?? 'Carta', si: E.si, donde };
}

/** De dónde ha salido (orígenes distintos, del más reciente al más antiguo), en texto. */
export function origenesDe(f) {
  return [...new Set([...(f.ev ?? [])].reverse().map((v) => v.o))].map((o) => ORIGENES[o] ?? o);
}

/**
 * El cuaderno a partir de los ajustes: los fallos válidos, con su id, lo que piden hoy y agrupados por estado.
 * Orden: lo que pide algo hoy primero (comprobar antes que dosis), luego por la última vez (lo reciente arriba).
 */
export function cuadernoDe(settings = {}, ahora = Date.now()) {
  const todos = [];
  for (const [k, v] of Object.entries(settings ?? {})) {
    if (!esClaveFallo(k) || !falloValido(v) || !v.n) continue;
    const id = k.slice(PREFIJO_FALLO.length);
    todos.push({ id, ...v, pide: pendiente(v, ahora) });
  }
  const peso = (x) => (x.pide === 'comprobar' ? 0 : x.pide === 'dosis' ? 1 : 2);
  todos.sort((a, b) => peso(a) - peso(b) || ultimaVez(b) - ultimaVez(a));
  const lista = todos.slice(0, MAX_FALLOS);
  return {
    lista,
    abiertos: lista.filter((x) => x.est === 'abierto'),
    vigilando: lista.filter((x) => x.est === 'vigilando'),
    resueltos: lista.filter((x) => x.est === 'resuelto'),
    dosis: lista.filter((x) => x.pide === 'dosis'),
    comprobar: lista.filter((x) => x.pide === 'comprobar'),
    vacio: !lista.length,
  };
}

/**
 * La actividad del día para el motor (planHoy): la comprobación que toca o, si no, la dosis del fallo abierto más
 * reciente. null si no hay nada pendiente.
 */
export function actividadCuaderno(cuad) {
  const c = cuad?.comprobar?.[0];
  if (c) return { tipo: 'dosis', titulo: `Comprobar: ${ERRORES[c.e].nombre.toLowerCase()}`, verbo: 'Comprobar', minutos: 4, ruta: ['fallos', 'comprobar', c.id], query: undefined, ut: null, fallo: c.id, pide: 'comprobar' };
  const d = cuad?.dosis?.[0];
  if (d) return { tipo: 'dosis', titulo: `Dosis de 2 minutos: ${ERRORES[d.e].nombre.toLowerCase()}`, verbo: 'Empezar', minutos: 2, ruta: ['fallos', 'dosis', d.id], query: undefined, ut: null, fallo: d.id, pide: 'dosis' };
  return null;
}

/** «Próxima comprobación: el jueves» → la fecha (ISO) o null. */
export const proximaComprobacion = (f) => f.comp?.prox ?? null;

/** Texto corto del estado de un fallo para la lista. */
export function lineaEstado(f, ahora = Date.now()) {
  const p = pendiente(f, ahora);
  if (f.est === 'resuelto') return 'Resuelto: dos comprobaciones seguidas bien.';
  if (p === 'comprobar') return 'Toca comprobarlo hoy.';
  if (p === 'dosis') return f.comp?.hist?.length && !f.comp.hist.at(-1).ok ? 'La comprobación salió mal: otra dosis primero.' : 'Toca una dosis.';
  if (f.est === 'vigilando') return 'Vigilando: una comprobación bien; falta otra.';
  return 'Dosis hecha: falta la comprobación.';
}
