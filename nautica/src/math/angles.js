// Motor matemático: ángulos.
// Convenciones: ángulos en grados, rumbos/demoras circulares en [0, 360).
// Valores con signo (dm, Δ, Ct, marcaciones, abatimiento): + = Este/estribor, − = Oeste/babor.

export const DEG = Math.PI / 180;

export const toRad = (deg) => deg * DEG;
export const toDeg = (rad) => rad / DEG;

/** Normaliza a [0, 360). */
export function norm360(deg) {
  const r = deg % 360;
  return r < 0 ? r + 360 : r === 360 ? 0 : r + 0; // + 0 elimina -0
}

/** Normaliza a (−180, 180]. */
export function norm180(deg) {
  const r = norm360(deg);
  return r > 180 ? r - 360 : r;
}

/** Diferencia angular mínima a − b, en (−180, 180]. */
export const angleDiff = (a, b) => norm180(a - b);

/** Distancia angular absoluta mínima entre dos direcciones. */
export const angleDist = (a, b) => Math.abs(angleDiff(a, b));

/** Dirección opuesta (recíproca). */
export const reciprocal = (deg) => norm360(deg + 180);

/** Redondea a n decimales (sin errores de coma flotante visibles). */
export function round(x, n = 0) {
  const f = 10 ** n;
  return Math.round((x + Number.EPSILON * Math.sign(x)) * f) / f;
}

/** Grados decimales → { deg, min } con minutos redondeados a `dec` decimales. */
export function toDegMin(value, dec = 1) {
  const sign = value < 0 ? -1 : 1;
  let abs = Math.abs(value);
  let deg = Math.floor(abs);
  let min = round((abs - deg) * 60, dec);
  if (min >= 60) { deg += 1; min -= 60; }
  return { sign, deg, min };
}

/** { deg, min } → grados decimales. */
export const fromDegMin = (deg, min = 0, sign = 1) => sign * (Math.abs(deg) + Math.abs(min) / 60);
