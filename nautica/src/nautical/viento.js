// Viento aparente: el que se nota a bordo, suma del real y del viento de avance (el del propio movimiento, que
// viene siempre de proa con la velocidad del barco). Lo usan la lámina de viento aparente y su ejercicio.

const rad = (d) => (d * Math.PI) / 180;

/**
 * @param {{ angReal: number, vr: number, vb: number }} o  angReal: grados desde la proa por los que entra el viento
 *   real (0 proa, 90 través, 180 popa), vr: su intensidad y vb: la velocidad del barco, en nudos.
 * @returns {{ ang: number, va: number, proa: number, costado: number }} ángulo desde la proa del aparente, su
 *   intensidad y sus componentes (de proa y de costado).
 */
export function vientoAparente({ angReal, vr, vb }) {
  const proa = vr * Math.cos(rad(angReal)) + vb; // el avance suma viento de proa
  const costado = vr * Math.sin(rad(angReal));
  return { ang: (Math.atan2(costado, proa) * 180) / Math.PI, va: Math.hypot(proa, costado), proa, costado };
}
