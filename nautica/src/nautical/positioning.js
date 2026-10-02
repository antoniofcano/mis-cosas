// Motor de conocimiento náutico: obtención de la situación (líneas de posición).
//
// Todos los cálculos se hacen en el plano de la carta Mercator (ver math/mercator.js), que es
// exactamente lo que se hace con transportador, regla y compás sobre la carta L105.

import { toPlane, fromPlane, unitsPerMile, rhumbDestination, rhumbTo } from '../math/mercator.js';
import { intersectLines, intersectLineCircle, fromPolar, add, sub, scale, toPolar, dot } from '../math/vector.js';
import { reciprocal } from '../math/angles.js';

/**
 * Situación por dos demoras verdaderas simultáneas.
 * Desde cada faro se traza la demora opuesta (Dv + 180°): el barco está donde se cortan.
 * @returns {{lat:number, lon:number}|null}
 */
export function fixTwoBearings(markA, dvA, markB, dvB) {
  const hit = intersectLines(toPlane(markA), reciprocal(dvA), toPlane(markB), reciprocal(dvB));
  if (!hit || hit.t1 <= 0 || hit.t2 <= 0) return null;
  return fromPlane(hit.point);
}

/** Situación por demora verdadera y distancia a un punto. */
export function fixBearingDistance(mark, dv, dist) {
  return rhumbDestination(mark, reciprocal(dv), dist);
}

/**
 * Situación por demora a un punto y distancia (círculo) a otro.
 * Devuelve las soluciones posibles (0, 1 o 2), ordenadas de más cerca a más lejos del punto de la demora.
 */
export function fixBearingAndRange(markBearing, dv, markRange, dist) {
  const pB = toPlane(markBearing);
  const pR = toPlane(markRange);
  const r = dist * unitsPerMile(markRange.lat);
  return intersectLineCircle(pB, reciprocal(dv), pR, r)
    .filter((h) => h.t > 0)
    .map((h) => fromPlane(h.point));
}

/**
 * Situación por dos demoras NO simultáneas (traslado de la primera línea de posición).
 * Entre la primera y la segunda demora el barco navega `run` millas al rumbo efectivo `course`.
 * La primera línea de posición se traslada paralela a sí misma ese vector y se corta con la segunda.
 * @returns {{ fix:{lat,lon}, first:{lat,lon} } | null} situación en la 2ª demora y en la 1ª
 */
export function fixRunning(markA, dvA, markB, dvB, course, run) {
  const pA = toPlane(markA);
  const pB = toPlane(markB);
  // La traslación en el plano depende de la latitud: usamos la del faro A como aproximación
  // (en la carta se mide la distancia en la escala de latitudes de la zona).
  const shift = fromPolar(course, run * unitsPerMile(markA.lat));
  const pA2 = add(pA, shift);
  const hit = intersectLines(pA2, reciprocal(dvA), pB, reciprocal(dvB));
  if (!hit || hit.t1 <= 0 || hit.t2 <= 0) return null;
  const fix = fromPlane(hit.point);
  const first = fromPlane(sub(hit.point, shift));
  return { fix, first };
}

/**
 * Punto de máxima aproximación a un objeto navegando desde `from` al rumbo `course`.
 * @returns {{ distance:number, bearing:number, along:number, point:{lat,lon} }}
 *   distance: distancia mínima (millas); bearing: demora verdadera del objeto en ese momento (= través);
 *   along: millas navegadas hasta ese punto (negativo si ya se pasó).
 */
export function closestApproach(from, course, mark) {
  const p = toPlane(from);
  const m = toPlane(mark);
  const k = unitsPerMile((from.lat + mark.lat) / 2);
  const u = fromPolar(course, 1);
  const t = dot(sub(m, p), u);
  const q = add(p, scale(u, t));
  const point = fromPlane(q);
  const { distance, bearing } = rhumbTo(point, mark);
  return { distance, bearing, along: t / k, point };
}

/** Demora verdadera y distancia de un punto a otro (lo que se mide en la carta). */
export const bearingAndDistance = (from, to) => rhumbTo(from, to);

export { toPolar };
