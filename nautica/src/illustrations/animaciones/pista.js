// Pistas de animación de las láminas (docs/ESTILO-LAMINAS.md, «Animaciones»): la descripción pura de una animación, sin
// DOM. La reproduce src/ui/animacion.js; la imagen fija (galería, miniatura, tarjetas) es uno de sus fotogramas.
//
// Una pista es:
//   { duracion, hitos: [{ t, nombre, texto }], bucle?, tFijo?, escala?, svg(t), cambios(t) }
//   duracion → segundos de reproducción a 1×          hitos → los pasos con nombre (t en segundos de reproducción)
//   tFijo    → el fotograma de la imagen fija (por defecto, el final: con todos sus rótulos y cotas)
//   escala   → segundos reales de la maniobra por segundo de reproducción (para el texto del deslizador), o
//   real(t)  → los segundos reales en el instante t, si la reproducción no va siempre al mismo ritmo (cámara lenta)
//   momento(t) → o el texto entero del momento («a las 10:30»), si el tiempo de la lámina no es de segundos
//   svg(t)   → el dibujo entero en el instante t        cambios(t) → { clave: { atributo: valor, texto?: '…' } }
// Los elementos que se mueven llevan data-ani="clave"; svg(t) se construye con los mismos cambios(t), así que el
// reproductor solo actualiza esos atributos fotograma a fotograma (nunca rehace el SVG entero).

import { T, f1, cascoPlanta } from '../estilo-c.js';

/** Elemento animado: <tag data-ani="clave" …fijos …cambios[clave]>contenido</tag>. `c` son los cambios del fotograma. */
export function el(clave, tag, fijos, c, contenido = '') {
  const v = { ...fijos, ...(c?.[clave] ?? {}) };
  const texto = v.texto;
  delete v.texto;
  const attrs = Object.entries(v).filter(([, x]) => x != null).map(([k, x]) => ` ${k}="${x}"`).join('');
  return `<${tag} data-ani="${clave}"${attrs}>${texto ?? contenido}</${tag}>`;
}

/** 0 antes de t0, 1 después de t1 y una rampa suave entre medias. */
export function tramo(t, t0, t1) {
  if (t <= t0) return 0;
  if (t >= t1) return 1;
  const k = (t - t0) / (t1 - t0);
  return k * k * (3 - 2 * k);
}

/** Opacidad de algo que aparece en su hito (en `dur` segundos) y ya no se va. */
export const aparece = (t, t0, dur = 0.5) => f1(tramo(t, t0, t0 + dur));

/** Índice del hito vigente en el instante t (el último cuyo t ya ha pasado). */
export function hitoEn(hitos, t) {
  let i = 0;
  for (let k = 0; k < hitos.length; k++) if (hitos[k].t <= t + 1e-6) i = k;
  return i;
}

/** Normaliza una pista: hitos ordenados, el primero en 0 y fotograma fijo dentro de la duración. */
export function pista(p) {
  const hitos = [...p.hitos].sort((a, b) => a.t - b.t);
  const tFijo = Math.min(p.duracion, Math.max(0, p.tFijo ?? p.duracion));
  return { bucle: false, escala: 1, ...p, hitos, tFijo };
}

/** Imagen fija de una pista: su fotograma con significado (el final, salvo que diga otro). */
export const fotogramaFijo = (p) => p.svg(p.tFijo);

/** Puntos de una polilínea en el instante t: las muestras ya pasadas y el punto exacto del momento. */
export function trazoHasta(pts, tiempos, t, actual) {
  let n = 0;
  while (n < tiempos.length && tiempos[n] <= t) n++;
  const o = pts.slice(0, n);
  if (actual) o.push(actual);
  if (o.length === 1) o.push(o[0]);
  return o.map((q) => `${f1(q[0])},${f1(q[1])}`).join(' ');
}

/** Transformación de un barco en (x, y) con la proa a `rumbo`. */
export const situa = (x, y, rumbo) => `translate(${f1(x)} ${f1(y)}) rotate(${f1(rumbo)})`;

/** Muestrea una función de estado con paso fijo (para trazar estelas): { pts, tiempos }. */
export function muestrea(fn, t0, t1, paso) {
  const pts = [];
  const tiempos = [];
  for (let t = t0; t <= t1 + 1e-9; t += paso) { pts.push(fn(t)); tiempos.push(t); }
  return { pts, tiempos };
}

/**
 * Ritmo de la reproducción por tramos: [[segundos reales, segundos de reproducción], …] crecientes. Sirve para ir a
 * cámara lenta donde pasa lo importante y deprisa en lo que solo es navegar. Devuelve { real(t), rep(s), duracion }.
 */
export function ritmo(puntos) {
  const interp = (v, i, j) => {
    for (let k = 1; k < puntos.length; k++) {
      const [a, b] = [puntos[k - 1], puntos[k]];
      if (v <= b[i]) return a[j] + ((v - a[i]) / (b[i] - a[i] || 1)) * (b[j] - a[j]);
    }
    return puntos[puntos.length - 1][j];
  };
  return { real: (t) => interp(Math.max(0, t), 1, 0), rep: (s) => interp(Math.max(0, s), 0, 1), duracion: puntos[puntos.length - 1][1] };
}

/** Texto del momento para el deslizador: «12 s de maniobra» con la escala de la pista. */
export function momento(p, t) {
  const s = Math.round(p.real ? p.real(t) : t * (p.escala ?? 1));
  return s >= 60 ? `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')} s` : `${s} s`;
}

/** Barco en planta a escala (Lpx de eslora) que se mueve con la clave `clave`; con pala de timón (clave `pala`). */
export function barcoAnimado(clave, Lpx, c, { pala = 'pala', relleno = T.casco } = {}) {
  return el(clave, 'g', {}, c, `<path d="${cascoPlanta(Lpx, Lpx * 0.34)}" fill="${relleno}" stroke="${T.tinta}" stroke-width="1.4" stroke-linejoin="round"/>` +
    `<line x1="0" y1="${f1(-Lpx / 2 + 5)}" x2="0" y2="${f1(Lpx / 2 - 3)}" stroke="${T.tinta}" stroke-width=".6"/>` +
    (pala ? el(pala, 'line', { x1: 0, y1: f1(Lpx / 2), x2: 0, y2: f1(Lpx / 2 + Math.max(7, Lpx * 0.13)), stroke: T.tinta, 'stroke-width': 3, 'stroke-linecap': 'round' }, c) : ''));
}

/** Giro de la pala del timón (timon −1…1, + a estribor; 35° a la banda) para un barco de Lpx de eslora. */
export const giroPala = (timon, Lpx) => `rotate(${f1(-timon * 35)} 0 ${f1(Lpx / 2)})`;
