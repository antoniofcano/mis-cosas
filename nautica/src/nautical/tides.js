// Motor de conocimiento náutico: mareas (Patrón de Yate).
//
// Entre una bajamar (BM) y una pleamar (PM) consecutivas la altura de la marea sigue aproximadamente una
// curva cosenoidal (es la que usa el Anuario de Mareas y las calculadoras):
//     h(t) = Hb + (Hp − Hb) · (1 − cos(180° · t / D)) / 2      (marea subiendo, t desde la BM)
// D = duración de la vaciante o creciente. La "regla de los doceavos" es su aproximación manual:
// en las 6 horas sube 1, 2, 3, 3, 2, 1 doceavos de la amplitud.
// Sonda en un momento = sonda de la carta + altura de la marea.
// Agua bajo la quilla = sonda − calado.

const toRad = (d) => (d * Math.PI) / 180;

/**
 * Altura de la marea en el instante t (minutos) entre dos extremos consecutivos.
 * @param {{ t: number, h: number }} a  extremo anterior (BM o PM)
 * @param {{ t: number, h: number }} b  extremo siguiente
 */
export function tideHeight(a, b, t) {
  const D = b.t - a.t;
  const x = Math.min(Math.max((t - a.t) / D, 0), 1);
  return a.h + (b.h - a.h) * (1 - Math.cos(toRad(180 * x))) / 2;
}

/** Primer instante entre a y b en que la marea alcanza la altura h (o null si no la alcanza). */
export function timeForHeight(a, b, h) {
  const lo = Math.min(a.h, b.h);
  const hi = Math.max(a.h, b.h);
  if (h < lo - 1e-9 || h > hi + 1e-9) return null;
  // (1 − cos θ)/2 = (h − ha)/(hb − ha)  →  θ = acos(1 − 2f)
  const fr = (h - a.h) / (b.h - a.h);
  const theta = Math.acos(Math.min(1, Math.max(-1, 1 - 2 * fr)));
  return a.t + ((b.t - a.t) * theta) / Math.PI;
}

/** Regla de los doceavos: fracción acumulada de la amplitud tras `hours` horas de una marea de 6 horas. */
export function twelfthsFraction(hours) {
  const parts = [1, 2, 3, 3, 2, 1];
  let acc = 0;
  for (let i = 0; i < 6; i++) {
    const take = Math.min(Math.max(hours - i, 0), 1);
    acc += parts[i] * take;
  }
  return acc / 12;
}

/**
 * Corrección de la tabla oficial del examen: C = A · sen²(90° · I / D), con A la amplitud, I el intervalo desde la
 * bajamar y D la duración de la creciente. Es la misma curva que tideHeight.
 */
export const correccionTabla = (A, I, D) => A * Math.sin(toRad((90 * Math.min(Math.max(I, 0), D)) / D)) ** 2;

/** Sonda en el momento y agua bajo la quilla (negativa: tocas fondo). */
export function aguaBajoQuilla({ sondaCarta, altura, calado }) {
  const sonda = sondaCarta + altura;
  return { sonda, bajoQuilla: sonda - calado };
}
