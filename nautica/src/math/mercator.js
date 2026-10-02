// Motor matemático: proyección Mercator y navegación loxodrómica.
//
// La carta de examen (102, Estrecho de Gibraltar) es una carta Mercator: en ella las líneas de rumbo
// constante (loxodrómicas) son rectas. Por eso trabajamos en un "plano carta":
//   x = longitud en minutos de arco (Este +)
//   y = latitud aumentada (partes meridionales) en minutos de arco (Norte +)
// En ese plano los rumbos y demoras se miden igual que con el transportador sobre la carta, y una
// milla náutica a la latitud φ mide sec(φ) unidades, igual que al medir distancias en la escala de
// latitudes junto al punto.

import { toRad, toDeg, norm360 } from './angles.js';

/** Partes meridionales (latitud aumentada) en minutos, esfera. */
export const meridionalParts = (latDeg) => toDeg(Math.log(Math.tan(Math.PI / 4 + toRad(latDeg) / 2))) * 60;

/** Inversa de meridionalParts. */
export const latFromMeridionalParts = (mp) => toDeg(2 * Math.atan(Math.exp(toRad(mp / 60))) - Math.PI / 2);

/** {lat, lon} (grados decimales, Oeste negativo) → punto del plano carta. */
export const toPlane = ({ lat, lon }) => ({ x: lon * 60, y: meridionalParts(lat) });

/** Punto del plano carta → {lat, lon}. */
export const fromPlane = ({ x, y }) => ({ lat: latFromMeridionalParts(y), lon: x / 60 });

/** Unidades de plano por milla náutica a una latitud dada (escala local de la carta). */
export const unitsPerMile = (latDeg) => 1 / Math.cos(toRad(latDeg));

/**
 * Rumbo y distancia loxodrómicos de A a B.
 * @returns {{ bearing: number, distance: number }} rumbo verdadero (°) y distancia (millas)
 */
export function rhumbTo(a, b) {
  const pa = toPlane(a);
  const pb = toPlane(b);
  const bearing = norm360(toDeg(Math.atan2(pb.x - pa.x, pb.y - pa.y)));
  const dLatMin = (b.lat - a.lat) * 60;
  const cosR = Math.cos(toRad(bearing));
  let distance;
  if (Math.abs(cosR) > 1e-6) {
    distance = dLatMin / cosR;
  } else {
    // Rumbo E-W: distancia = apartamiento = Δλ · cos φ
    distance = Math.abs((b.lon - a.lon) * 60 * Math.cos(toRad(a.lat)));
  }
  return { bearing, distance: Math.abs(distance) };
}

/**
 * Punto de llegada navegando desde A al rumbo `bearing` (°) una distancia `distance` (millas).
 */
export function rhumbDestination(a, bearing, distance) {
  const r = toRad(bearing);
  const dLatMin = distance * Math.cos(r);
  const lat = a.lat + dLatMin / 60;
  let lon;
  if (Math.abs(Math.cos(r)) > 1e-6) {
    const dMp = meridionalParts(lat) - meridionalParts(a.lat);
    lon = a.lon + (dMp * Math.tan(r)) / 60;
  } else {
    lon = a.lon + (distance * Math.sin(r)) / Math.cos(toRad(a.lat)) / 60;
  }
  return { lat, lon };
}

/** Diferencia de latitud (minutos, + N) y de longitud (minutos, + E) de A a B. */
export function deltas(a, b) {
  return { dLat: (b.lat - a.lat) * 60, dLon: (b.lon - a.lon) * 60 };
}
