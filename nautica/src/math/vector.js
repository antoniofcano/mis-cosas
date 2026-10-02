// Motor matemático: vectores 2D en un plano "carta" (x = Este, y = Norte).
// Las direcciones se expresan como rumbos náuticos (0° = N, 90° = E, sentido horario).

import { toRad, toDeg, norm360 } from './angles.js';

export const vec = (x, y) => ({ x, y });

/** Vector a partir de rumbo (grados) y módulo. */
export function fromPolar(bearing, magnitude) {
  const r = toRad(bearing);
  return { x: magnitude * Math.sin(r), y: magnitude * Math.cos(r) };
}

/** Rumbo náutico [0,360) y módulo de un vector. */
export function toPolar(v) {
  return { bearing: norm360(toDeg(Math.atan2(v.x, v.y))), magnitude: Math.hypot(v.x, v.y) };
}

export const add = (...vs) => vs.reduce((a, b) => ({ x: a.x + b.x, y: a.y + b.y }), { x: 0, y: 0 });
export const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
export const scale = (v, k) => ({ x: v.x * k, y: v.y * k });
export const dot = (a, b) => a.x * b.x + a.y * b.y;
export const cross = (a, b) => a.x * b.y - a.y * b.x;
export const length = (v) => Math.hypot(v.x, v.y);

/**
 * Intersección de dos rectas dadas por punto + rumbo.
 * Devuelve { point, t1, t2 } (t = avance a lo largo de cada recta) o null si son paralelas.
 */
export function intersectLines(p1, bearing1, p2, bearing2) {
  const d1 = fromPolar(bearing1, 1);
  const d2 = fromPolar(bearing2, 1);
  const den = cross(d1, d2);
  if (Math.abs(den) < 1e-9) return null;
  const w = sub(p2, p1);
  const t1 = cross(w, d2) / den;
  const t2 = cross(w, d1) / den;
  return { point: add(p1, scale(d1, t1)), t1, t2 };
}

/**
 * Intersección de la recta (p, rumbo) con la circunferencia (c, r).
 * Devuelve los valores t (≥ y < 0 incluidos) ordenados de menor a mayor, con sus puntos.
 */
export function intersectLineCircle(p, bearing, c, r) {
  const d = fromPolar(bearing, 1);
  const f = sub(p, c);
  const b = 2 * dot(f, d);
  const cc = dot(f, f) - r * r;
  const disc = b * b - 4 * cc;
  if (disc < 0) return [];
  const s = Math.sqrt(disc);
  return [(-b - s) / 2, (-b + s) / 2].map((t) => ({ t, point: add(p, scale(d, t)) }));
}

/** Distancia (con signo) de un punto q a la recta (p, rumbo); + = a estribor de la recta. */
export function signedDistanceToLine(q, p, bearing) {
  const d = fromPolar(bearing, 1);
  return -cross(d, sub(q, p));
}
