// Motor gráfico: georreferenciación de una imagen de carta (escaneo) mediante ajuste afín por mínimos
// cuadrados entre puntos de control (lat/lon ↔ píxel). Se ajusta en el plano Mercator (longitud y
// latitud aumentada), donde una carta Mercator escaneada es (casi) una transformación afín.

import { toPlane, fromPlane } from '../math/mercator.js';

/** Resuelve el sistema normal 3×3 de mínimos cuadrados para z ≈ a·x + b·y + c. */
function fit3(rows, zs) {
  const M = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  const v = [0, 0, 0];
  rows.forEach((r, i) => {
    for (let a = 0; a < 3; a++) {
      v[a] += r[a] * zs[i];
      for (let b = 0; b < 3; b++) M[a][b] += r[a] * r[b];
    }
  });
  // Gauss-Jordan
  for (let c = 0; c < 3; c++) {
    let p = c;
    for (let r = c + 1; r < 3; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    [v[c], v[p]] = [v[p], v[c]];
    for (let r = 0; r < 3; r++) {
      if (r === c) continue;
      const f = M[r][c] / M[c][c];
      for (let k = c; k < 3; k++) M[r][k] -= f * M[c][k];
      v[r] -= f * v[c];
    }
  }
  return v.map((x, i) => x / M[i][i]);
}

/**
 * @param {{lat,lon,px,py}[]} controlPoints
 * @returns {{ toPixel, toGeo, residual, planeToPixel: number[] }}
 *   planeToPixel = [a, b, c, d, e, f] con px = a·X + b·Y + c, py = d·X + e·Y + f (X, Y del plano Mercator)
 */
export function fitAffine(controlPoints) {
  // Centramos para estabilidad numérica.
  const pl = controlPoints.map((c) => toPlane(c));
  const mx = pl.reduce((s, p) => s + p.x, 0) / pl.length;
  const my = pl.reduce((s, p) => s + p.y, 0) / pl.length;
  const rows = pl.map((p) => [p.x - mx, p.y - my, 1]);
  const [a, b, c0] = fit3(rows, controlPoints.map((c) => c.px));
  const [d, e, f0] = fit3(rows, controlPoints.map((c) => c.py));
  const c = c0 - a * mx - b * my;
  const f = f0 - d * mx - e * my;
  const det = a * e - b * d;
  const planeToPixel = [a, b, c, d, e, f];
  const toPixel = (geo) => { const p = toPlane(geo); return { x: a * p.x + b * p.y + c, y: d * p.x + e * p.y + f }; };
  const toGeo = ({ x, y }) => {
    const X = (e * (x - c) - b * (y - f)) / det;
    const Y = (-d * (x - c) + a * (y - f)) / det;
    return fromPlane({ x: X, y: Y });
  };
  const residual = Math.max(...controlPoints.map((cp) => { const q = toPixel(cp); return Math.hypot(q.x - cp.px, q.y - cp.py); }));
  return { toPixel, toGeo, residual, planeToPixel };
}

/**
 * Matriz SVG (a, b, c, d, e, f) que lleva píxeles de la imagen a coordenadas mundo de la carta
 * (x = X·S, y = −Y·S; ver chart-renderer.js). Úsese como transform="matrix(...)" en un <image>.
 */
export function rasterMatrix(fit, S) {
  const [a, b, c, d, e, f] = fit.planeToPixel;
  const det = a * e - b * d;
  return [
    (S * e) / det, (S * d) / det,
    (-S * b) / det, (-S * a) / det,
    (S * (-e * c + b * f)) / det, (-S * (d * c - a * f)) / det,
  ];
}
