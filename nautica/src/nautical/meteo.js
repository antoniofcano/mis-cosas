// Meteorología para las láminas: viento alrededor de borrascas y anticiclones (hemisferio norte) y ley de
// Buys-Ballot. Funciones puras. Ángulos náuticos (0 = N, sentido horario).
import { norm360, norm180 } from '../math/angles.js';

/** Ángulo con el que el viento de superficie cruza las isobaras por el rozamiento (sobre el mar, unos 10–30°). */
export const CRUCE_ISOBARAS = 25;
const PUNTOS = ['norte', 'nordeste', 'este', 'sudeste', 'sur', 'suroeste', 'oeste', 'noroeste'];
export const rumboNombre = (deg) => PUNTOS[Math.round(norm360(deg) / 45) % 8];

/**
 * Viento en un punto alrededor de un centro de presión (hemisferio norte).
 * @param {{ centro: 'B'|'A', posicion: number }} p  posicion = demora desde el centro hasta el barco
 * @returns {{ hacia: number, desde: number, centroRelativo: number, lado: 'izquierda'|'derecha' }}
 *   centroRelativo: dónde queda el centro respecto a quien se pone de espaldas al viento (− a la izquierda)
 */
export function vientoEnPunto({ centro, posicion }) {
  // borrasca: giro antihorario y hacia dentro; anticiclón: horario y hacia fuera
  const hacia = norm360(centro === 'B' ? posicion - 90 - CRUCE_ISOBARAS : posicion + 90 - CRUCE_ISOBARAS);
  const desde = norm360(hacia + 180);
  const centroRelativo = norm180(posicion + 180 - hacia);
  return { hacia, desde, centroRelativo, lado: centroRelativo < 0 ? 'izquierda' : 'derecha' };
}

/** Intensidad relativa del viento según la separación de las isobaras (más juntas → más viento). */
export function intensidad(separacion, { min = 14, max = 34 } = {}) {
  const t = Math.min(1, Math.max(0, (max - separacion) / (max - min)));
  return { t, texto: t < 0.25 ? 'flojo' : t < 0.5 ? 'moderado' : t < 0.75 ? 'fresco' : 'fuerte' };
}

/** Tensión de vapor de saturación (hPa) a T °C (fórmula de Magnus). */
export const tensionSaturacion = (t) => 6.112 * Math.exp((17.62 * t) / (243.12 + t));

/**
 * Humedad relativa (%) del aire a temperatura `t` con punto de rocío `td` (la cantidad de vapor no cambia al
 * enfriarse: solo cambia lo que el aire podría contener). Al llegar al punto de rocío se satura (100 %) y condensa.
 */
export function humedadRelativa(t, td) {
  if (t <= td) return 100;
  return (100 * tensionSaturacion(td)) / tensionSaturacion(t);
}
export const hayNiebla = (t, td) => t <= td;
