// Paso a paso guiado de los ejercicios generados que se resuelven con el kit de los exámenes (R-53). Hoy: la estima
// analítica (src/exercises/types/estima-analitica.js), que se resuelve en el mismo orden que las preguntas reales del
// tribunal (src/exams/solutions/*.js): situación de salida, distancias (la corriente, Ihc × horas que actúa), la tabla de
// tramos con la corriente como una fila más (k.tramos) y, si se piden, el rumbo y la distancia directos (k.rumboDirecto).
//
// Así el ejercicio generado tiene la hoja de examen (traigo, plantea, cuenta, tabla y croquis), los avisos «Ojo / No
// olvides / Así se hace», el diagnóstico por paso con los errores típicos del kit y el cuaderno de fallos, igual que una
// pregunta real. Termina como en el examen: cuatro opciones de situación (la buena y las que salen con tres errores
// típicos). Sin DOM: lo pinta src/ui/guiado.js desde src/ui/views/exercise.js.

import { createKit } from './kit.js';
import { fmtBearing, fmtClock, fmtLat, fmtLon, fmtPos } from '../math/format.js';
import { createRng } from '../math/rng.js';
import { norm180 } from '../math/angles.js';
import { filasEstima, horasTexto, horasTotales, horasCorriente, rcTexto } from '../exercises/types/estima-analitica.js';

/** Carta «vacía»: la estima analítica se resuelve con números, sin dibujar en la carta del Estrecho. */
export const CARTA_NUMEROS = Object.freeze({ inBounds: () => false, point: () => null });

const coma = (x) => (Number.isInteger(x) ? String(x) : x.toFixed(2).replace(/0$/, '').replace('.', ','));
const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];

/** Resolución con el kit de una estima analítica generada (los params del ejercicio). */
export function resolverEstima(k, p) {
  const llegada = p.hora + horasTotales(p) * 60;
  k.note('Situación de salida', `HRB ${fmtClock(p.hora)}: ${fmtPos(p.start)}. Es estima analítica: se resuelve con números, sin carta.`);
  const c = p.corriente;
  k.note('Distancia navegada', `A ${coma(p.v)} nudos: ${p.legs.map((l) => `${fmtBearing(l.rv)} durante ${horasTexto(l.h)} (${coma(p.v * l.h)} millas)`).join(', ')}.` +
    (c ? ` La corriente ${rcTexto(c)} de ${coma(c.ihc)} ${c.ihc === 1 ? 'nudo' : 'nudos'} actúa de ${fmtClock(p.hora + c.desde * 60)} a ${fmtClock(llegada)}: ${horasTexto(horasCorriente(p))} × ${coma(c.ihc)} = ${coma(c.ihc * horasCorriente(p))} millas.` : ''));
  const fin = k.tramos(p.start, filasEstima(p), 'Situación de llegada');
  const out = latlon(fin);
  if (p.directo) {
    const { rumbo, dist } = k.rumboDirecto(p.start, fin);
    out.push({ kind: 'bearing', value: rumbo }, { kind: 'distance', value: dist });
  }
  return out;
}

/** Variantes del kit con las que se arman las opciones falsas, por orden de preferencia (las de R-53 primero). */
export const VARIANTES_OPCIONES = ['antimeridiano:letra', 'corriente-al-reves', 'lm-hemisferios:llegada', 'signo-dL', 'sin-cos-lm', 'seno-coseno', 'lm-salida'];

const textoSituacion = (v) => `${fmtLat(v[0].value)}, ${fmtLon(v[1].value)}`;
/** Distancia en minutos entre dos situaciones (la longitud por el camino corto). */
const separacion = (a, b) => Math.max(Math.abs(a[0].value - b[0].value), Math.abs(norm180(a[1].value - b[1].value))) * 60;

/**
 * Pregunta de examen a partir de un ejercicio generado: { q, sol } para el paso a paso (src/ui/guiado.js), o null si ese
 * tipo no tiene resolución con el kit. Las opciones salen de la semilla (reproducibles) y nunca hay dos a menos de 3′.
 */
export function guiadoDeEjercicio(id, params, seed, statement = '') {
  if (id !== 'estima-analitica') return null;
  const sol = { ejercicio: 'estima-analitica', sinCarta: true, solve: (k) => resolverEstima(k, params) };
  const buena = sol.solve(createKit(CARTA_NUMEROS));
  const opciones = [buena.slice(0, 2)];
  for (const v of VARIANTES_OPCIONES) {
    if (opciones.length >= 4) break;
    let vals;
    try { vals = sol.solve(createKit(CARTA_NUMEROS, { error: v })).slice(0, 2); } catch { continue; }
    if (vals.every((x) => Number.isFinite(x.value)) && opciones.every((o) => separacion(o, vals) >= 3)) opciones.push(vals);
  }
  // Si los errores no dan bastantes opciones distintas, la buena desplazada (como hace el tribunal con las cifras).
  const rng = createRng(seed);
  for (let i = 0; opciones.length < 4 && i < 40; i++) {
    const vals = [{ ...buena[0], value: buena[0].value + rng.sign() * rng.int(4, 40) / 60 }, { ...buena[1], value: norm180(buena[1].value + rng.sign() * rng.int(4, 40) / 60) }];
    if (Math.abs(vals[0].value) < 89 && opciones.every((o) => separacion(o, vals) >= 3)) opciones.push(vals);
  }
  const letras = ['a', 'b', 'c', 'd'];
  const orden = rng.shuffle(opciones.map((_, i) => i));
  const correcta = letras[orden.indexOf(0)];
  const q = {
    id: `ej:estima-analitica:${seed}`,
    enunciado: statement,
    opciones: Object.fromEntries(orden.map((i, j) => [letras[j], textoSituacion(opciones[i])])),
    correcta, aceptadas: [correcta], anulada: false, generada: true,
  };
  return { q, sol };
}
