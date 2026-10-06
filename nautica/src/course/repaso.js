import { diaISO } from '../texto.js';
// Repaso espaciado de fallos (B1). Funciones puras: el estado de cada pregunta va en su registro de respuesta
// (progress.exams[id].rep = { racha, prox } o null) y la fecha es la local 'YYYY-MM-DD'.
//
//   fallo                      → vuelve mañana y la racha se pone a 0 (también si ya estaba en la cola)
//   acierto el día que toca    → racha 1: a los 3 días; racha 2: a los 7; racha 3: sale de la cola
//   acierto antes de que toque → no cambia nada (no se adelanta el repaso)
//
// Las respuestas guardadas antes de existir la cola no tienen `rep`: si su última respuesta es un fallo, cuentan
// como pendientes desde hoy. Así no hace falta migrar nada y una copia de seguridad antigua se recupera igual.

export const INTERVALOS = [1, 3, 7]; // días hasta el siguiente repaso con 0, 1 y 2 aciertos seguidos
export const ACIERTOS_PARA_SALIR = 3;
export const MIN_POR_PREGUNTA = 0.8; // minutos estimados por pregunta de repaso (con su explicación)

export const diaLocal = diaISO;

/** 'YYYY-MM-DD' + n días. */
export function sumaDias(fecha, n) {
  const [y, m, d] = fecha.split('-').map(Number);
  const t = new Date(y, m - 1, d + n);
  return t.toLocaleDateString('sv-SE');
}

/** Estado de repaso de un registro, con las respuestas antiguas (sin `rep`) interpretadas. */
export function repasoDe(reg, hoy) {
  if (!reg) return null;
  if (reg.rep !== undefined) return reg.rep;
  return reg.ok === false ? { racha: 0, prox: hoy } : null;
}

/** Nuevo estado tras responder. `anterior` es el registro previo de la pregunta (o undefined). */
export function siguienteRepaso(anterior, ok, hoy) {
  const rep = repasoDe(anterior, hoy);
  if (!ok) return { racha: 0, prox: sumaDias(hoy, INTERVALOS[0]) };
  if (!rep) return null; // acierto fuera de la cola: no entra
  if (rep.prox > hoy) return rep; // aún no tocaba: se queda como estaba
  const racha = rep.racha + 1;
  return racha >= ACIERTOS_PARA_SALIR ? null : { racha, prox: sumaDias(hoy, INTERVALOS[racha]) };
}

/** Cuántas preguntas de la cola tocan exactamente el día `fecha` (p. ej. mañana: las falladas hoy y las que vuelven). */
export function repasoDelDia(preguntas, respuestas = {}, fecha, hoy = diaLocal()) {
  let n = 0;
  for (const q of preguntas) {
    if (q.anulada || !q.correcta) continue;
    if (repasoDe(respuestas[q.id], hoy)?.prox === fecha) n += 1;
  }
  return n;
}

/**
 * Cola de una titulación: las preguntas del banco que están en repaso.
 * @returns {{ hoy: object[], total: number, minutosHoy: number, minutosPendientes: number }}
 *   hoy: las que tocan hoy o antes (las más atrasadas primero) · total: todas las de la cola
 *   minutosPendientes: lo que falta para vaciar la cola (cada pregunta, las veces que le quedan para salir)
 */
export function colaRepaso(preguntas, respuestas = {}, hoy = diaLocal()) {
  const enCola = [];
  for (const q of preguntas) {
    if (q.anulada || !q.correcta) continue;
    const rep = repasoDe(respuestas[q.id], hoy);
    if (rep) enCola.push({ q, rep });
  }
  const tocan = enCola.filter((x) => x.rep.prox <= hoy).sort((a, b) => a.rep.prox.localeCompare(b.rep.prox));
  const veces = enCola.reduce((s, x) => s + (ACIERTOS_PARA_SALIR - x.rep.racha), 0);
  return {
    hoy: tocan.map((x) => x.q),
    total: enCola.length,
    minutosHoy: Math.ceil(tocan.length * MIN_POR_PREGUNTA),
    minutosPendientes: Math.ceil(veces * MIN_POR_PREGUNTA),
  };
}

/**
 * Tanda de «5 minutos» (B8): primero lo que toca repasar, luego otros fallos, y si falta, preguntas sin hacer de
 * los temas ya empezados (o de cualquiera). `rng` es un generador de src/math/rng.js.
 */
export function tandaRapida(preguntas, respuestas = {}, rng, { n = 5, hoy = diaLocal() } = {}) {
  const validas = preguntas.filter((q) => !q.anulada && q.correcta);
  const baraja = (xs) => xs.map((x) => [rng.real(0, 1), x]).sort((a, b) => a[0] - b[0]).map(([, x]) => x);
  const elegidas = [];
  const add = (xs) => { for (const q of xs) if (elegidas.length < n && !elegidas.includes(q)) elegidas.push(q); };
  add(colaRepaso(validas, respuestas, hoy).hoy);
  add(baraja(validas.filter((q) => respuestas[q.id]?.ok === false)));
  const empezados = new Set(validas.filter((q) => respuestas[q.id]).map((q) => q.ut));
  add(baraja(validas.filter((q) => !respuestas[q.id] && empezados.has(q.ut))));
  add(baraja(validas.filter((q) => !respuestas[q.id])));
  add(baraja(validas));
  return elegidas;
}
