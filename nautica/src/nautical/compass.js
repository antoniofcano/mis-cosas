// Motor de conocimiento náutico: aguja, rumbos y demoras.
//
// Convención de signos (la del examen):  E = +   W = −
//   Ct = dm + Δ                (corrección total = declinación magnética + desvío)
//   Rv = Ra + Ct   Ra = Rv − Ct
//   Rv = Rm + dm   Rm = Ra + Δ
//   Dv = Da + Ct   (las demoras se corrigen igual que los rumbos, con la Ct del rumbo que se lleva)
//   Dv = Rv + M    (M = marcación: + estribor, − babor; marcación circular 0-360 contada desde la proa hacia estribor)

import { norm360, norm180 } from '../math/angles.js';

export const correccionTotal = (dm, desvio) => dm + desvio;

export const rvFromRa = (ra, ct) => norm360(ra + ct);
export const raFromRv = (rv, ct) => norm360(rv - ct);
export const rvFromRm = (rm, dm) => norm360(rm + dm);
export const rmFromRv = (rv, dm) => norm360(rv - dm);
export const rmFromRa = (ra, desvio) => norm360(ra + desvio);
export const raFromRm = (rm, desvio) => norm360(rm - desvio);

/** Ct a partir de Rv y Ra (o Dv y Da). Resultado con signo en (−180, 180]. */
export const ctFrom = (verdadero, aguja) => norm180(verdadero - aguja);

/** Desvío a partir de Ct y dm. */
export const desvioFrom = (ct, dm) => ct - dm;

/** Demora verdadera a partir de rumbo verdadero y marcación (con signo o circular). */
export const dvFromMarcacion = (rv, m) => norm360(rv + m);

/** Marcación con signo (+ estribor / − babor) a partir de Dv y Rv. */
export const marcacionFrom = (dv, rv) => norm180(dv - rv);

/**
 * Actualiza la declinación magnética de la carta a otro año.
 * @param {number} dmBase  dm del año base (con signo, E +)
 * @param {number} yearBase año de la carta
 * @param {number} annualChange variación anual en grados (con signo: + hacia el E; "decremento" de una dm W = +)
 * @param {number} year año del ejercicio
 */
export function updateDeclination(dmBase, yearBase, annualChange, year) {
  return dmBase + annualChange * (year - yearBase);
}

/**
 * Datos de una variación anual expresada como en la carta: "aumenta"/"disminuye" (incremento/decremento)
 * en valor absoluto. Devuelve la variación con signo en convención E + / W −.
 * Una dm W que "disminuye" se acerca a 0 → la variación es hacia el E (+).
 */
export function signedAnnualChange(dmBase, minutesPerYear, trend /* 'aumenta' | 'disminuye' */) {
  const mag = minutesPerYear / 60;
  const towardsEast = dmBase < 0 ? trend === 'disminuye' : trend === 'aumenta';
  return towardsEast ? mag : -mag;
}
