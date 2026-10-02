// Motor de conocimiento náutico: navegación (distancia-velocidad-tiempo), corrientes y abatimiento.
//
// Convenciones:
//   - Corriente: su "rumbo" (Rc) es HACIA DONDE va el agua ("corriente del NE" en un enunciado
//     ambiguo se interpreta como dirección NE = hacia el NE; los enunciados de examen suelen decir
//     "corriente de rumbo 045" o "dirección 045", siempre hacia donde va).
//   - Viento: se nombra por DE DÓNDE viene ("viento del N" sopla hacia el S).
//   - Abatimiento (Ab): + a estribor (viento entrando por babor), − a babor (viento por estribor).
//     Rumbo de superficie Rs = Rv + Ab.

import { fromPolar, toPolar, add, sub, length, intersectLineCircle } from '../math/vector.js';
import { norm360, norm180 } from '../math/angles.js';

export const distance = (speed, hours) => speed * hours;
export const timeFor = (dist, speed) => dist / speed;
export const speedFor = (dist, hours) => dist / hours;

/** Rumbo y velocidad efectivos (sobre el fondo) = vector barco + vector corriente. */
export function effectiveCourse(rs, vb, rc, ic) {
  const v = add(fromPolar(rs, vb), fromPolar(rc, ic));
  const { bearing, magnitude } = toPolar(v);
  return { ref: bearing, vef: magnitude };
}

/**
 * Rumbo de superficie que hay que llevar para que, con la corriente (rc, ic), el barco avance sobre
 * el fondo por el rumbo efectivo `ref` deseado. Triángulo de velocidades clásico:
 * desde el extremo del vector corriente se traza un arco de radio vb que corta la línea del Ref.
 * @returns {{ rs:number, vef:number } | null} null si es imposible (corriente demasiado fuerte)
 */
export function courseToSteer(ref, vb, rc, ic) {
  // Buscamos t ≥ 0 tal que |t·u − C| = vb, con u unitario en la dirección del Ref.
  const c = fromPolar(rc, ic);
  const hits = intersectLineCircle({ x: 0, y: 0 }, ref, c, vb).filter((h) => h.t > 1e-9);
  if (!hits.length) return null;
  const best = hits[hits.length - 1]; // la mayor velocidad efectiva (solución físicamente útil)
  const boat = sub(best.point, c);
  return { rs: toPolar(boat).bearing, vef: best.t };
}

/** Corriente (rumbo e intensidad) a partir de la situación estimada y la observada tras `hours` horas. */
export function currentFromDrift(driftBearing, driftDistance, hours) {
  return { rc: norm360(driftBearing), ic: driftDistance / hours };
}

/** Rumbo de superficie a partir del verdadero y el abatimiento con signo. */
export const rsFromRv = (rv, ab) => norm360(rv + ab);
export const rvFromRs = (rs, ab) => norm360(rs - ab);

/** Abatimiento con signo según la banda por la que entra el viento ("babor" → +, "estribor" → −). */
export const abatimientoSigned = (deg, bandaViento) => (bandaViento === 'babor' ? Math.abs(deg) : -Math.abs(deg));

/** Banda por la que entra el viento dado su origen y el rumbo del barco. */
export function windSide(windFrom, heading) {
  const rel = norm180(windFrom - heading);
  if (Math.abs(rel) < 1e-9 || Math.abs(Math.abs(rel) - 180) < 1e-9) return 'proa/popa';
  return rel > 0 ? 'estribor' : 'babor';
}

export { length };
