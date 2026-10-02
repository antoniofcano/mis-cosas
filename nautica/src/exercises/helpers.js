// Utilidades compartidas por los tipos de ejercicio: datos "de examen" redondeados, textos de enunciado
// y piezas de solución que se repiten (corrección de demoras, traslado a la carta, etc.).

import { norm360, round } from '../math/angles.js';
import { rhumbTo, rhumbDestination } from '../math/mercator.js';
import { fmtBearing, fmtSigned, fmtSignedNum, fmtPos, fmtLat, fmtLon, fmtClock, fmtMiles, fmtKnots } from '../math/format.js';
import { correccionTotal } from '../nautical/compass.js';

export { fmtBearing, fmtSigned, fmtSignedNum, fmtPos, fmtLat, fmtLon, fmtClock, fmtMiles, fmtKnots };

/** Redondea una posición a décimas de minuto (como se lee en la carta). */
export const roundPos = ({ lat, lon }) => ({ lat: round(lat * 60, 1) / 60, lon: round(lon * 60, 1) / 60 });

/** Declinación como la pone el examen: "4º NW". */
export { fmtDmExam as signedText } from './compass-data.js';

/** Genera dm (año del ejercicio) y desvío plausibles, en grados enteros o medios. */
export function randomCompass(rng, chart) {
  const dmBase = chart?.declination?.value ?? -1;
  // dm entera cercana al valor de la carta (los enunciados la dan en grados enteros).
  const dm = Math.round(dmBase) + rng.int(-1, 1);
  let desvio = rng.int(-6, 6);
  if (desvio === 0) desvio = rng.sign() * rng.int(1, 4);
  return { dm, desvio, ct: correccionTotal(dm, desvio) };
}

/** Hora de reloj aleatoria (minutos desde 00:00), múltiplo de 5. */
export const randomClock = (rng, from = 6 * 60, to = 20 * 60) => rng.step(from, to, 5);

/**
 * Describe una situación de partida "en la demora Dv de X a d millas", como en los enunciados.
 * Elige una marca visible no demasiado lejana. Devuelve { mark, dv, dist, pos } o null.
 */
export function describeByMark(chart, rng, pos, maxDist = 10) {
  const options = chart.visibleMarks(pos, maxDist).filter((o) => o.distance >= 1.5);
  if (!options.length) return null;
  const o = rng.pick(options);
  // Redondeamos a lo que se pondría en un enunciado y recalculamos la posición exacta resultante.
  const dv = round(o.bearing, 0);
  const dist = round(o.distance * 2, 0) / 2;
  const p = rhumbDestination(o.mark, norm360(dv + 180), dist);
  return { mark: o.mark, dv, dist, pos: p };
}

/** Texto: "en la demora verdadera 225° de Faro de Tarifa, a 5 millas". */
export const byMarkText = (d) => `en la demora verdadera ${fmtBearing(d.dv)} del ${d.mark.name}, a una distancia de ${fmtMiles(d.dist)}`;

/** Paso estándar: corrección de una demora de aguja con la Ct. */
export function stepCorrectBearing(name, da, ct) {
  const dv = norm360(da + ct);
  return {
    dv,
    text: `Dv ${name} = Da + Ct = ${fmtBearing(da)} + (${fmtSignedNum(ct)}) = ${fmtBearing(dv)}`,
  };
}

/** Paso estándar: cálculo de la Ct. */
export function stepCt(dm, desvio) {
  const ct = correccionTotal(dm, desvio);
  return {
    ct,
    step: {
      title: 'Corrección total',
      text: `Ct = dm + Δ = (${fmtSignedNum(dm)}) + (${fmtSignedNum(desvio)}) = ${fmtSignedNum(ct)}. Recuerda: E es +, W es −.`,
    },
  };
}

/** Busca, reintentando, unos datos que cumplan una condición (los generadores usan la carta real). */
export function retry(fn, tries = 200) {
  for (let i = 0; i < tries; i++) {
    const r = fn(i);
    if (r) return r;
  }
  throw new Error('No se pudo generar un ejercicio válido');
}

export { rhumbTo, rhumbDestination, round, norm360 };
