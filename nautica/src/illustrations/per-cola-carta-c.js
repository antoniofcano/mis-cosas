// Láminas de carta del PER rehechas en estilo C (docs/ESTILO-LAMINAS.md), tanda de cierre. Mismos tipos, parámetros,
// `resaltar` y cifras que las láminas de lección a las que sustituyen; solo cambia el dibujo. Esquemas propios: no se
// usa ningún trozo de la carta escaneada. Sin DOM.
//   carta-margenes:  { resaltar?: 'latitud'|'longitud'|'divisiones' }                                  (per-11-1)
//   transportador:   { caso: 'rumbo' (rv) | 'faro' (dv) }                                               (per-11-1)
//   milla:           { vista: 'carta'|'minuto'|'definicion' }                                           (per-10-2, 11-1)
//   rumbo-directo:   {}                                                                                 (per-11-3)
//   estima:          { ra?, ct?, rv?, v?, hi?, hf?, resaltar? }                                         (per-11-4)
//   traslado-demora: { caso: 'no-simultaneas'|'simultaneas', v?, minutos?, resaltar? }                  (per-11-8)
//   tangente:        { banda: 'babor'|'estribor'|'ambas', dv?, D?, d?, resaltar? }                      (per-11-9)
//   veriles:         { vista: 'carta'|'fondos', resaltar? }                                             (per-10-3)

import { T, TXT, lienzo, rotulo, etiqueta, cartela, cota, cotaArco, flecha, rosaNorte, tierra, paso, arcoD, colocaEtiquetas, junto, f1 } from './estilo-c.js';
import { faro, situacion, estima as triEstima, filaPaso, esquinaLibre } from './carta-c.js';
import { W, serif, mono, cap, linea, segP, filete, panelNotas, tacha, punto, pts, deg3, numD, coma, partes, pol } from './kit-lecciones-c.js';

const dir = (p, q) => { const d = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1; return [(q[0] - p[0]) / d, (q[1] - p[1]) / d]; };
const mas = (p, u, k) => [p[0] + u[0] * k, p[1] + u[1] * k];
function corte(p, u, q, v) {
  const den = u[0] * v[1] - u[1] * v[0];
  if (Math.abs(den) < 1e-9) return null;
  const s = ((q[0] - p[0]) * v[1] - (q[1] - p[1]) * v[0]) / den;
  return [p[0] + u[0] * s, p[1] + u[1] * s];
}
const hora = (h) => { const [a, b] = String(h).split(':').map(Number); return a * 60 + (b || 0); };
const hm = (min) => `${Math.floor(min / 60)} h${min % 60 ? ` ${min % 60} min` : ''}`;
/** Mar de carta: rectángulo de agua con su borde, de y0 a y1. */
const aguaCarta = (x0, y0, x1, y1) => `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="${T.agua2}" stroke="${T.tinta}" stroke-width="1"/>`;
/** Banda de escala de la carta (tramos alternos tinta y papel). */
const tramo = (x, y, w, h, k) => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${k % 2 ? T.papel : T.tinta}" stroke="${T.tinta}" stroke-width=".5"/>`;
/** Compás de puntas: dos patas desde una charnela levantada h px sobre el punto medio de a–b. */
function compas(a, b, color, h = 30, lado = 1) {
  const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const u = dir(a, b);
  const c = [m[0] + u[1] * h * lado, m[1] - u[0] * h * lado];
  return `<g fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round">${segP(c, a, { color, w: 2 })}${segP(c, b, { color, w: 2 })}</g><circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="3.2" fill="${color}"/>`;
}

// ===========================================================================
// Coordenadas en los márgenes (per-11-1). Punto de la lección: 36° 07,3′ N, 005° 58,6′ W; cada minuto en cinco
// partes de 0,2′. En la Mercator el minuto de longitud mide cos(latitud) veces el de latitud.

export const MARGENES_PARTES = ['latitud', 'longitud', 'divisiones'];

export function cartaMargenesC(spec = {}) {
  const m = partes(spec, MARGENES_PARTES);
  if (!m) return null;
  const H = 356;
  const alt = 'Recuadro de carta con sus escalas en los márgenes: la de latitudes a izquierda y derecha, con la latitud N creciendo hacia arriba, y la de longitudes arriba y abajo, con la longitud W creciendo hacia la izquierda. Del punto P salen su paralelo hasta el margen lateral, donde se lee 36° 07,3′ N, y su meridiano hasta el de arriba, donde se lee 005° 58,6′ W. Debajo, un minuto de la escala ampliado: cinco partes de 0,2′ y la marca de 07,3′.';
  const { out, cierra } = lienzo(W, H, alt);
  const [x0, x1, y0, y1, bw] = [72, 330, 50, 210, 7];
  const pLat = 40;
  const pLon = pLat * Math.cos((36.1 * Math.PI) / 180);
  const yLat = (min) => y1 - (min - 5) * pLat;
  const xLon = (min) => x1 - (min - 55.5) * pLon;
  const P = [xLon(58.6), yLat(7.3)];
  out.push(aguaCarta(x0, y0, x1, y1));
  // escalas
  const lat = [];
  for (let k = 0; k < 20; k++) { const yb = y1 - (k + 1) * (pLat / 5); lat.push(tramo(x0 - bw, yb, bw, pLat / 5, k), tramo(x1, yb, bw, pLat / 5, k)); }
  for (let k = 5; k <= 9; k++) lat.push(mono(x0 - bw - 4, yLat(k) + 4, `36°0${k}′`, { anchor: 'end', color: m.c('latitud') }));
  const lon = [];
  for (let k = 0; ; k++) {
    const xa = x1 - k * (pLon / 5);
    if (xa <= x0 + 0.1) break;
    const w = Math.min(pLon / 5, xa - x0);
    const kk = Math.floor((55.5 + k * 0.2) / 0.2 + 1e-6);
    lon.push(tramo(xa - w, y0 - bw, w, bw, kk), tramo(xa - w, y1, w, bw, kk));
  }
  for (const [k, txt] of [[56, '56′'], [58, '58′'], [60, '6°00′'], [62, '02′']]) lon.push(mono(xLon(k), y0 - bw - 5, txt, { color: m.c('longitud') }));
  // el paralelo y el meridiano de P, hasta los márgenes
  lon.push(segP(P, [P[0], y0 - bw], { color: m.c('longitud', T.tinta), w: m.w('longitud', 1.4, 2.2), extra: 'stroke-dasharray="6 3"' }));
  lon.push(etiqueta(P[0] - 56, y0 + 20, '005° 58,6′ W', { color: m.c('longitud') }));
  lat.push(flecha(P[0], P[1], x0 - bw - 1, P[1], { color: m.c('latitud', T.tinta), w: m.w('latitud', 1.4, 2.2), discontinua: true }));
  lat.push(etiqueta(x0 + 50, P[1] - 15, '36° 07,3′ N', { color: m.c('latitud') }));
  // sentidos
  lon.push(flecha(x0 + 70, y1 - 14, x0 + 22, y1 - 14, { color: T.apagado, w: 1.4 }), serif(x0 + 78, y1 - 9, 'W: crece a la izquierda', { size: TXT.min, italic: true, color: m.c('longitud', T.apagado) }));
  lat.push(flecha(x0 + 14, y1 - 26, x0 + 14, y1 - 66, { color: T.apagado, w: 1.4 }), serif(x0 + 22, y1 - 46, 'N: crece hacia arriba', { size: TXT.min, italic: true, color: m.c('latitud', T.apagado) }));
  out.push(`${m.g('latitud')}${lat.join('')}</g>`, `${m.g('longitud')}${lon.join('')}</g>`);
  out.push(situacion(P[0], P[1], { color: T.magenta }), serif(P[0] + 11, P[1] + 18, 'P', { weight: 700, color: T.magenta }));
  // un minuto, ampliado
  const d = [m.g('divisiones')];
  const [zx, zw, zy] = [54, 250, 286];
  d.push(filete(228), cap(18, 248, 'UN MINUTO, AMPLIADO', { color: m.c('divisiones', T.apagado) }));
  for (let k = 0; k < 5; k++) d.push(tramo(zx + (k * zw) / 5, zy, zw / 5, 10, k));
  d.push(cota(zx, zy - 12, zx + zw / 5, zy - 12, '', { tope: 4 }), mono(zx + zw / 10, zy - 20, '0,2′', { weight: 700, color: m.c('divisiones') }));
  d.push(mono(zx, zy + 28, '07′', { weight: 700 }), mono(zx + zw, zy + 28, '08′', { weight: 700 }));
  const x73 = zx + 0.3 * zw;
  d.push(`<path d="M${f1(x73)},${zy - 2} l-6,-10 h12z" fill="${T.magenta}"/>`, etiqueta(x73, zy + 26, '07,3′', { color: T.magenta }));
  d.push(serif(18, 338, 'Cinco partes de 0,2′: 07,3′ cae a mitad de la segunda.', { size: TXT.min }));
  d.push('</g>');
  out.push(d.join(''), cierra());
  const CAP = {
    latitud: 'La latitud se lee en los márgenes izquierdo y derecho: llevas el paralelo del punto hasta la escala. En esta carta siempre es N.',
    longitud: 'La longitud se lee en los márgenes de arriba y de abajo: llevas el meridiano del punto hasta la escala. Aquí siempre es W y crece hacia la izquierda.',
    divisiones: 'Cada minuto de la escala está dividido en cinco partes de 0,2′: 07,3′ cae a mitad de la segunda parte pasado el 07′.',
  };
  return {
    svg: out.join(''),
    caption: m.hl.size === 1 ? CAP[[...m.hl][0]] : 'El paralelo del punto, llevado al margen lateral, da la latitud (N); su meridiano, llevado al margen de arriba o de abajo, da la longitud (W, crece hacia la izquierda). Cada minuto está dividido en cinco partes de 0,2′: P está en 36° 07,3′ N, 005° 58,6′ W.',
  };
}

// ===========================================================================
// Transportador (per-11-1): medir un rumbo, y «demora desde el faro» frente a «demora al faro».

export function transportadorC(spec = {}) {
  const caso = spec.caso ?? 'rumbo';
  if (caso === 'faro') return faroC(spec);
  if (caso !== 'rumbo') return null;
  const rv = ((Math.round(+(spec.rv ?? 75)) % 360) + 360) % 360;
  if (!Number.isFinite(rv)) return null;
  const H = 380;
  const alt = `Transportador circular centrado en el punto de salida A, con su norte paralelo al meridiano. La línea de A a la llegada B corta la graduación en ${deg3(rv)}: es el rumbo verdadero, contado desde el norte en el sentido de las agujas del reloj. Debajo, los tres pasos.`;
  const { out, cierra } = lienzo(W, H, alt);
  const [cx0, cy0, cx1, cy1] = [14, 14, W - 14, 252];
  out.push(aguaCarta(cx0, cy0, cx1, cy1));
  const A = [179, 134];
  const R = 82;
  out.push(linea(A[0], cy0, A[0], cy1, { w: 1, extra: 'stroke-dasharray="6 4"' }), serif(A[0] + 6, cy1 - 8, 'meridiano', { size: TXT.min, italic: true, color: T.apagado }));
  out.push(`<circle cx="${A[0]}" cy="${A[1]}" r="${R}" fill="${T.papel}" fill-opacity=".85" stroke="${T.tinta}" stroke-width="1.4"/>`, `<circle cx="${A[0]}" cy="${A[1]}" r="${R - 26}" fill="none" stroke="${T.tinta}" stroke-width=".6"/>`);
  for (let a = 0; a < 360; a += 5) {
    const l = a % 30 === 0 ? 10 : a % 10 === 0 ? 7 : 4;
    out.push(segP(pol(A[0], A[1], a, R), pol(A[0], A[1], a, R - l), { w: a % 30 === 0 ? 1.2 : 0.7 }));
  }
  for (let a = 0; a < 360; a += 30) {
    const dd = Math.min(Math.abs(a - rv), 360 - Math.abs(a - rv));
    if (dd < 21) continue;
    const [x, y] = pol(A[0], A[1], a, R - 19);
    out.push(mono(x, y + 4, String(a).padStart(3, '0'), { color: T.apagado }));
  }
  // la llegada, dentro de la carta, sobre el rumbo
  const u = pol(0, 0, rv, 1);
  const lim = Math.min(...[[u[0], A[0] - cx0 - 18, cx1 - A[0] - 18], [u[1], A[1] - cy0 - 18, cy1 - A[1] - 18]].map(([c, neg, pos]) => (c > 1e-6 ? pos / c : c < -1e-6 ? neg / -c : Infinity)));
  const B = mas(A, u, Math.min(126, lim));
  out.push(segP(A, B, { color: T.magenta, w: 2 }), `<path d="${arcoD(A[0], A[1], 26, 0, rv || 360)}" fill="none" stroke="${T.magenta}" stroke-width="1.4"/>`);
  out.push(flecha(A[0], A[1] - R + 14, A[0], A[1] - R - 14, { color: T.tinta, w: 1.6 }));
  out.push(etiqueta(A[0] + (rv > 20 && rv < 340 ? 0 : 58), A[1] - R - 22 + (rv > 20 && rv < 340 ? 0 : 0), '000° ∥ meridiano', {}));
  const corteG = pol(A[0], A[1], rv, R);
  out.push(`<circle cx="${f1(corteG[0])}" cy="${f1(corteG[1])}" r="5.5" fill="none" stroke="${T.magenta}" stroke-width="2"/>`);
  const lec = pol(A[0], A[1], rv + 14, R + 18);
  out.push(etiqueta(Math.min(Math.max(lec[0], 40), W - 40), Math.min(Math.max(lec[1], 30), cy1 - 14), deg3(rv), { color: T.magenta }));
  out.push(punto(A[0], A[1], { r: 3.5 }), situacion(B[0], B[1], { color: T.magenta }));
  const ladoA = rv > 180 ? 1 : -1;
  out.push(serif(A[0] + ladoA * 10, A[1] + 20, 'A salida', { anchor: ladoA > 0 ? 'start' : 'end', weight: 700 }));
  const nl = pol(0, 0, rv - 90, 1);
  const anc = nl[0] > 0.35 ? 'start' : nl[0] < -0.35 ? 'end' : 'middle';
  out.push(serif(B[0] + nl[0] * 14, B[1] + nl[1] * 14 + 4, 'B llegada', { anchor: anc, weight: 700, color: T.magenta }));
  out.push(filaPaso(24, 280, 1, 'Centro del transportador en el punto de origen.'));
  out.push(filaPaso(24, 304, 2, 'Su norte arriba, paralelo a un meridiano.'));
  out.push(filaPaso(24, 328, 3, `Lee donde corta la línea: Rv = ${deg3(rv)}.`, { clave: true }));
  out.push(serif(16, 356, 'Rumbo: de la salida a la llegada. Demora: del barco', { size: TXT.min, italic: true, color: T.apagado }), serif(16, 371, 'al objeto. Lo que lees en la carta es verdadero.', { size: TXT.min, italic: true, color: T.apagado }));
  out.push(cierra());
  return { svg: out.join(''), caption: `Con el transportador centrado en el punto de salida y su norte paralelo al meridiano, el rumbo se lee donde la línea corta la graduación, de 000° a 359° en el sentido de las agujas del reloj: aquí, Rv ${deg3(rv)}. Lo que se mide en la carta es siempre verdadero.` };
}

function faroC(spec) {
  const dv = ((Math.round(+(spec.dv ?? 310)) % 360) + 360) % 360;
  if (!Number.isFinite(dv)) return null;
  const op = (dv + 180) % 360;
  const H = 360;
  const alt = `Dos dibujos. A la izquierda, «demora ${deg3(dv)} desde el faro»: desde el faro se traza el ${deg3(dv)} y el barco está en esa línea. A la derecha, «demora ${deg3(dv)} al faro»: desde el barco se ve el faro al ${deg3(dv)}, así que el barco está hacia el ${deg3(op)} del faro. Debajo, el ejemplo del Sur verdadero.`;
  const { out, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
  const L = 58;
  const yc = 150;
  out.push(linea(W / 2, 16, W / 2, 268, { w: 0.6 }));
  const panel = (cx, sub) => {
    const s = [cartela(cx, 36, `DEMORA ${deg3(dv)}`, sub, { ancho: 150, color: T.magenta })];
    s.push(linea(cx, yc + 24, cx, yc - 62, { w: 1, extra: 'stroke-dasharray="4 3"' }), flecha(cx, yc - 50, cx, yc - 66, { w: 1.4 }), serif(cx + 6, yc - 58, 'N', { weight: 700, size: TXT.min }));
    return s;
  };
  // izquierda: desde el faro se traza dv
  const Fa = [90, yc];
  const Ba = pol(Fa[0], Fa[1], dv, L);
  const a = panel(Fa[0], 'desde el faro');
  a.push(flecha(Fa[0], Fa[1], ...pol(Fa[0], Fa[1], dv, L - 13), { color: T.magenta, w: 2 }), `<path d="${arcoD(Fa[0], Fa[1], 22, 0, dv || 360)}" fill="none" stroke="${T.magenta}" stroke-width="1.2"/>`);
  a.push(`<g transform="translate(${f1(Ba[0])} ${f1(Ba[1])}) rotate(${dv})"><path d="M0,-11 C5,-6 5,-1 5,3 L4,10 L-4,10 L-5,3 C-5,-1 -5,-6 0,-11Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.2"/></g>`);
  const la = pol(Fa[0], Fa[1], dv + (dv > 180 ? 28 : -28), L * 0.72);
  a.push(etiqueta(la[0], la[1], deg3(dv), { color: T.magenta }), faro(Fa[0], Fa[1], { destella: false }));
  a.push(serif(Fa[0], 222, `Trazas el ${deg3(dv)}`, { anchor: 'middle', weight: 700 }), serif(Fa[0], 240, 'desde el faro.', { anchor: 'middle' }));
  // derecha: desde el barco se ve el faro a dv; el barco está hacia el opuesto
  const Fb = [268, yc];
  const Bb = pol(Fb[0], Fb[1], op, L);
  const b = panel(Fb[0], 'al faro');
  b.push(flecha(Bb[0], Bb[1], ...pol(Fb[0], Fb[1], op, 12), { color: T.magenta, w: 2 }), `<path d="${arcoD(Fb[0], Fb[1], 22, 0, op || 360)}" fill="none" stroke="${T.tinta}" stroke-width="1" stroke-dasharray="3 2"/>`);
  b.push(`<g transform="translate(${f1(Bb[0])} ${f1(Bb[1])}) rotate(${dv})"><path d="M0,-11 C5,-6 5,-1 5,3 L4,10 L-4,10 L-5,3 C-5,-1 -5,-6 0,-11Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.2"/></g>`);
  const lb = pol(Fb[0], Fb[1], op + (op > 180 ? -30 : 30), L * 0.66);
  const lv = pol(Fb[0], Fb[1], op + (op > 180 ? 34 : -34), L * 0.86);
  b.push(etiqueta(lb[0], lb[1], deg3(dv), { color: T.magenta }), etiqueta(lv[0], lv[1], deg3(op), {}), faro(Fb[0], Fb[1], { destella: false }));
  b.push(serif(Fb[0], 222, `Ves el faro al ${deg3(dv)}:`, { anchor: 'middle', weight: 700, color: T.magenta }), serif(Fb[0], 240, `estás al ${deg3(op)} del faro.`, { anchor: 'middle', weight: 700 }));
  out.push(...a, ...b);
  out.push(panelNotas(270, H));
  out.push(serif(18, 294, '«Al Sur verdadero del faro»:', { weight: 700 }), serif(18, 314, 'desde el faro trazas el 180°;'), serif(18, 334, 'desde el barco ves el faro en Dv 000°.'));
  out.push(cierra());
  return { svg: out.join(''), caption: `«Demora ${deg3(dv)} desde el faro»: trazas el ${deg3(dv)} desde el faro y el barco está en esa línea. «Demora ${deg3(dv)} al faro»: desde el barco ves el faro al ${deg3(dv)}, así que el barco está hacia el ${deg3(op)} del faro.` };
}

// ===========================================================================
// La milla (per-10-2 y per-11-1): un minuto de arco de círculo máximo; en la carta, un minuto de latitud.

export function millaC(spec = {}) {
  const vista = spec.vista ?? 'carta';
  if (vista === 'definicion') return millaDefinicion();
  if (vista === 'minuto') return millaMinuto();
  if (vista !== 'carta') return null;
  const H = 360;
  const alt = 'Recuadro de carta con tierra en una esquina. Un compás de puntas toma la distancia entre los puntos A y B y la lleva a la escala de latitudes del margen izquierdo, a la misma altura: abarca 3 minutos, que son 3 millas. La escala de longitudes, arriba, está tachada: no sirve para medir distancias.';
  const { out, pt, cierra } = lienzo(W, H, alt);
  const [x0, x1, y0, y1, bw] = [72, 330, 44, 224, 7];
  const mLat = 18;
  const mLon = mLat * Math.cos((36 * Math.PI) / 180);
  out.push(aguaCarta(x0, y0, x1, y1));
  out.push(tierra(`M${x1},${y0} L${x1},${y0 + 92} C${x1 - 20},${y0 + 86} ${x1 - 30},${y0 + 60} ${x1 - 56},${y0 + 52} C${x1 - 80},${y0 + 44} ${x1 - 76},${y0 + 18} ${x1 - 104},${y0} Z`, pt));
  for (let y = y1, i = 0; y > y0 + 0.1; y -= mLat, i++) { const top = Math.max(y0, y - mLat); out.push(tramo(x0 - bw, top, bw, y - top, i), tramo(x1, top, bw, y - top, i)); }
  for (let x = x0, i = 0; x < x1 - 0.1; x += mLon, i++) { const w = Math.min(mLon, x1 - x); out.push(tramo(x, y0 - bw, w, bw, i), tramo(x, y1, w, bw, i)); }
  for (let k = 0; k <= 10; k += 2) out.push(mono(x0 - bw - 4, y1 - k * mLat + 4, `36°${String(k).padStart(2, '0')}′`, { anchor: 'end', color: T.apagado }));
  const d = 3 * mLat;
  const A = [150, 196];
  const Bp = pol(A[0], A[1], 52, d);
  out.push(segP(A, Bp, { w: 1, extra: 'stroke-dasharray="4 3"' }), punto(A[0], A[1], { r: 3.5 }), punto(Bp[0], Bp[1], { r: 3.5 }));
  out.push(serif(A[0] - 8, A[1] + 14, 'A', { anchor: 'end', weight: 700 }), serif(Bp[0] + 8, Bp[1] + 14, 'B', { weight: 700 }));
  out.push(compas(A, Bp, T.tinta, 40, -1));
  // el mismo compás en el margen izquierdo, a la misma altura
  const ym = (A[1] + Bp[1]) / 2;
  const ya = Math.round((ym + d / 2 - y1) / mLat) * mLat + y1;
  const yb = ya - d;
  const xm = x0 - bw / 2;
  out.push(compas([xm, ya], [xm, yb], T.magenta, 40, -1));
  out.push(`<rect x="${x0 - bw - 1.5}" y="${f1(yb)}" width="${bw + 3}" height="${f1(d)}" fill="none" stroke="${T.magenta}" stroke-width="2.2"/>`);
  out.push(etiqueta(x0 + 62, yb - 14, '3′ = 3 millas', { color: T.magenta }));
  out.push(flecha(A[0] - 12, ym, x0 + 46, ym, { color: T.apagado, w: 1.2, discontinua: true }));
  const xx = 128;
  out.push(tacha(xx, y0 - bw / 2, 8), serif(xx + 14, y0 + 16, 'longitudes: no', { weight: 700, color: T.magenta }));
  out.push(panelNotas(250, H));
  out.push(serif(18, 274, 'Escala de latitudes (márgenes laterales),', { weight: 700 }), serif(18, 292, 'a la altura de lo que mides: 1′ = 1 milla.', { weight: 700 }));
  out.push(serif(18, 318, 'Arriba y abajo, la escala de longitudes: en el'), serif(18, 336, 'Estrecho (36° N) su minuto mide unas 0,8 millas.'));
  out.push(cierra());
  return { svg: out.join(''), caption: 'Toma la distancia con el compás de puntas y llévala a la escala de latitudes, la de los márgenes laterales, a la altura de la zona donde mides: cada minuto es una milla. La escala de longitudes (arriba y abajo) no sirve para distancias.' };
}

function millaMinuto() {
  const H = 270;
  const alt = 'Dos minutos de la escala de latitudes, ampliados, cada uno dividido en cinco partes alternas. Un minuto entero es una milla; cada parte, 0,2 minutos, es decir, 0,2 millas. Debajo, las equivalencias: un grado son 60 millas y una décima de minuto, un cable.';
  const { out, cierra } = lienzo(W, H, alt);
  const [x0, u, y] = [39, 140, 70];
  for (let mm = 0; mm < 2; mm++) for (let k = 0; k < 5; k++) out.push(tramo(x0 + mm * u + (k * u) / 5, y, u / 5, 14, mm * 5 + k));
  for (let mm = 0; mm <= 2; mm++) out.push(linea(x0 + mm * u, y - 10, x0 + mm * u, y + 24, { w: 1.4 }), mono(x0 + mm * u, y - 16, `${mm}′`, { weight: 700 }));
  out.push(cota(x0, y + 40, x0 + u, y + 40, '1′ = 1 milla', { color: T.magenta }));
  const xs = x0 + u + (2 * u) / 5;
  out.push(cota(xs, y + 40, xs + u / 5, y + 40, ''), etiqueta(xs + u / 10, y + 66, '0,2′ = 0,2 millas', {}));
  out.push(panelNotas(162, H));
  out.push(serif(18, 186, '1° = 60′ = 60 millas', { weight: 700 }), serif(18, 208, 'Una décima de minuto (0,1′) = 0,1 millas'), serif(18, 230, 'Un cable = 0,1 millas = 185,2 m'), serif(18, 252, 'Lee minutos y décimas: 07,3′ son 7,3 millas.', { size: TXT.min, italic: true, color: T.apagado }));
  out.push(cierra());
  return { svg: out.join(''), caption: 'Cada minuto de la escala de latitudes es una milla. Si viene dividido en cinco partes, cada una vale 0,2′, es decir, 0,2 millas; una décima de minuto son 0,1 millas.' };
}

function millaDefinicion() {
  const H = 300;
  const alt = 'Un círculo máximo de la Tierra (un meridiano o el ecuador) con un ángulo en el centro, exagerado, de un minuto: el arco que abarca, en magenta, es una milla náutica, que por convenio mide 1852 metros. Al lado, el cable (185,2 m) y la milla terrestre (1609 m), que no tiene que ver.';
  const { out, cierra } = lienzo(W, H, alt);
  const [cx, cy, R] = [104, 140, 82];
  out.push(`<circle cx="${cx}" cy="${cy}" r="${R}" fill="${T.agua}" stroke="${T.tinta}" stroke-width="1.6"/>`);
  out.push(serif(cx, cy + R + 18, 'círculo máximo', { anchor: 'middle', weight: 700 }), serif(cx, cy + R + 34, '(meridiano o ecuador)', { anchor: 'middle', size: TXT.min, italic: true, color: T.apagado }));
  const [a1, a2] = [40, 64];
  out.push(segP([cx, cy], pol(cx, cy, a1, R), { w: 1.1 }), segP([cx, cy], pol(cx, cy, a2, R), { w: 1.1 }));
  out.push(`<path d="${arcoD(cx, cy, R, a1, a2)}" fill="none" stroke="${T.magenta}" stroke-width="4.5"/>`, `<path d="${arcoD(cx, cy, 24, a1, a2)}" fill="none" stroke="${T.tinta}" stroke-width="1.4"/>`);
  const [lx, ly] = pol(cx, cy, 52, 36);
  out.push(mono(lx, ly + 4, '1′', { weight: 700 }), punto(cx, cy, { r: 3 }), serif(cx - 6, cy + 16, 'centro', { anchor: 'end', size: TXT.min, italic: true, color: T.apagado }));
  const X = 210;
  out.push(serif(X, 52, 'arco de 1′', { weight: 700, color: T.magenta }), serif(X, 70, '= 1 milla náutica', { weight: 700, color: T.magenta }), etiqueta(X + 46, 92, '1852 m', { color: T.magenta }), serif(X, 116, '(por convenio)', { size: TXT.min, italic: true, color: T.apagado }));
  out.push(filete(132, { x1: X, x2: W - 14 }));
  out.push(serif(X, 152, 'Cable: 185,2 m'), serif(X, 172, 'Milla terrestre:'), serif(X, 190, '1609 m (no tiene'), serif(X, 208, 'que ver)'));
  out.push(filete(222, { x1: X, x2: W - 14 }), serif(X, 242, 'En la carta:', { weight: 700 }), serif(X, 260, '1′ de latitud', { weight: 700 }), serif(X, 278, '= 1 milla', { weight: 700 }));
  out.push(serif(18, 286, 'ángulo exagerado', { size: TXT.min, italic: true, color: T.apagado }));
  out.push(cierra());
  return { svg: out.join(''), caption: 'La milla náutica es la longitud de un minuto de arco de un círculo máximo de la Tierra; por convenio internacional mide 1852 m. Por eso, en la carta, un minuto de latitud es una milla.' };
}

// ===========================================================================
// Rumbo directo (per-11-3): ejemplo resuelto de la lección. Rv ≈ 190° medido en la carta; dm 2005 2° 50′ W (7′ E)
// actualizada a 2024: −170′ + 19 · 7′ = −37′ ≈ −1°; desvío +6° → Ct = +5°; Ra = Rv − Ct = 185°.

export function rumboDirectoC() {
  const H = 386;
  const alt = 'Carta con la salida arriba y la llegada, la luz verde de una bocana, abajo. Desde el meridiano de la salida se acota el rumbo verdadero 190°, medido con el transportador; la distancia se toma con el compás en la escala de latitudes. Debajo, la cuenta del ejemplo: declinación actualizada −1°, desvío +6°, corrección total +5° y rumbo de aguja 185°.';
  const { out, pt, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
  out.push(tierra('M5,216 Q60,206 110,220 Q150,232 186,214 L196,206 L204,214 Q244,198 300,212 Q330,218 353,210 L353,252 L5,252Z', pt));
  out.push(linea(196, 206, 214, 196, { w: 3 }));
  const S = [258, 50];
  const Lg = [214, 196];
  out.push(linea(S[0], S[1] - 30, S[0], S[1] + 90, { w: 1, extra: 'stroke-dasharray="5 4"' }), serif(S[0] + 6, S[1] - 20, 'Nv', { weight: 700, size: TXT.min }));
  out.push(flecha(S[0], S[1], ...mas(Lg, dir(S, Lg), -12), { color: T.magenta, w: 2 }));
  out.push(cotaArco(S[0], S[1], 26, 0, 190, 'Rv 190°', { color: T.magenta, rEt: 58 }));
  out.push(situacion(S[0], S[1], { color: T.tinta }), serif(S[0] - 12, S[1] - 6, 'salida', { anchor: 'end', weight: 700 }));
  out.push(`<circle cx="${Lg[0]}" cy="${Lg[1]}" r="6" fill="${T.verde}" stroke="${T.tinta}" stroke-width="1.2"/>`, serif(Lg[0] - 12, Lg[1] - 10, 'llegada:', { anchor: 'end', weight: 700 }), serif(Lg[0] - 12, Lg[1] + 6, 'luz verde', { anchor: 'end', weight: 700, color: T.verdeTxt }));
  const md = pol(S[0], S[1], 190, 84);
  out.push(serif(md[0] + 12, md[1], 'distancia: compás en', { size: TXT.min, italic: true }), serif(md[0] + 12, md[1] + 15, 'la escala de latitudes', { size: TXT.min, italic: true }));
  out.push(panelNotas(256, H));
  out.push(filaPaso(24, 280, 1, 'En la carta: Rv ≈ 190°'));
  out.push(filaPaso(24, 302, 2, 'dm 2024 = −2° 50′ + 19 × 7′ ≈ −1°'));
  out.push(filaPaso(24, 324, 3, 'Ct = dm + Δ = −1° + 6° = +5°'));
  out.push(filaPaso(24, 346, 4, 'Ra = Rv − Ct = 190° − 5° = 185°', { clave: true }));
  out.push(filaPaso(24, 368, 5, 'Tiempo = distancia / velocidad'));
  out.push(cierra());
  return { svg: out.join(''), caption: 'Se unen la salida y la llegada y se mide el Rv con el transportador centrado en la salida; la distancia, en la escala de latitudes. Con la Ct se pasa al rumbo de aguja: Ra = Rv − Ct. Las cifras son las del ejemplo resuelto de la lección.' };
}

// ===========================================================================
// Situación de estima (per-11-4). Por defecto, las cifras de la lección: Ra 297° con Ct −3° (Rv 294°), de 18:20 a
// 20:35 a 6 nudos: 2 h 15 min = 2,25 h → 13,5 millas.

export const ESTIMA_PARTES = ['salida', 'rumbo', 'distancia', 'estima'];

export function estimaC(spec = {}) {
  const m = partes(spec, ESTIMA_PARTES);
  if (!m) return null;
  const dado = spec.rv != null && spec.ra == null;
  const ra = Number(spec.ra ?? 297);
  const ct = Number(spec.ct ?? -3);
  const rv = dado ? Number(spec.rv) : ((ra + ct) % 360 + 360) % 360;
  const v = Number(spec.v ?? 6);
  const hi = spec.hi ?? '18:20';
  const hf = spec.hf ?? '20:35';
  const min = ((hora(hf) - hora(hi)) % 1440 + 1440) % 1440;
  if (!min || !(v > 0) || !Number.isFinite(rv)) return null;
  const th = min / 60;
  const d = v * th;
  const thTxt = numD(th, 2);
  const dMi = coma(d, 1);
  const H = 390;
  const alt = `Carta: desde la situación de salida de las ${hi} se traza el rumbo verdadero ${deg3(rv)} y, con el compás abierto a la distancia navegada (${dMi} millas), se marca la situación de estima de las ${hf}, un triángulo. Debajo, la cuenta paso a paso.`;
  const { out, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
  const u = pol(0, 0, rv, 1);
  const L = Math.min(200, 250 / Math.max(Math.abs(u[0]), 1e-6), 120 / Math.max(Math.abs(u[1]), 1e-6));
  const c0 = [179, 128];
  const S = mas(c0, u, -L / 2);
  const E = mas(c0, u, L / 2);
  const nrm = [u[1], -u[0]];
  const lado = nrm[1] < 0 ? 1 : -1;
  const ap = mas(c0, nrm, 38 * lado);
  const cDist = m.activo ? m.c('distancia', T.apagado) : T.apagado;
  out.push(`${m.g('distancia')}${segP(S, ap, { color: cDist, w: 1.2, extra: 'stroke-dasharray="3 3"' })}${segP(ap, E, { color: cDist, w: 1.2, extra: 'stroke-dasharray="3 3"' })}<circle cx="${f1(ap[0])}" cy="${f1(ap[1])}" r="3" fill="${cDist}"/></g>`);
  out.push(`${m.g('rumbo')}${flecha(S[0], S[1], ...mas(E, u, -11), { color: m.c('rumbo'), w: m.w('rumbo', 1.6, 2.4) })}</g>`);
  const cEst = m.activo ? m.c('estima') : T.magenta;
  out.push(`${m.g('salida')}${situacion(S[0], S[1], { color: m.c('salida') })}</g>`, `${m.g('estima')}${triEstima(E[0], E[1], { color: cEst })}</g>`);
  const segs = [[S, E], [S, ap], [ap, E]];
  const caja = (p) => ({ x0: p[0] - 12, y0: p[1] - 12, x1: p[0] + 12, y1: p[1] + 12 });
  const rosa = esquinaLibre([S, E, ap, c0], [[36, 40], [W - 36, 40], [36, 220], [W - 36, 220]]);
  const cajas = [caja(S), caja(E), { x0: rosa[0] - 20, y0: rosa[1] - 34, x1: rosa[0] + 20, y1: rosa[1] + 20 }];
  out.push(colocaEtiquetas([
    { t: `Rv ${deg3(rv)}`, cands: junto(S, E, `Rv ${deg3(rv)}`, { centro: ap }), color: m.c('rumbo'), p: 'rumbo' },
    { t: `d = ${dMi} M`, cands: [[ap[0] + nrm[0] * lado * 18, ap[1] + nrm[1] * lado * 18], ...junto(ap, E, `d = ${dMi} M`)], color: m.c('distancia'), p: 'distancia' },
    { t: `salida ${hi}`, cands: junto(E, S, `salida ${hi}`, { ks: [1.08, 0.95, 1.2] }), p: 'salida', rotulo: true },
    { t: `estima ${hf}`, cands: junto(S, E, `estima ${hf}`, { ks: [1.08, 0.95, 1.2] }), color: cEst, p: 'estima', rotulo: true },
  ], { W, H: 250, segs, cajas }));
  out.push(rosaNorte(rosa[0], rosa[1]));
  out.push(panelNotas(252, H));
  const L1 = dado ? `Rv dado = ${deg3(rv)}: no se le aplica la Ct` : `Rv = Ra + Ct = ${deg3(ra)} ${ct < 0 ? '−' : '+'} ${numD(Math.abs(ct))}° = ${deg3(rv)}`;
  const filas = [
    ['salida', 'Sitúa la salida.'],
    ['rumbo', L1],
    ['distancia', `t = ${hf} − ${hi} = ${hm(min)} = ${thTxt} h`],
    ['distancia', `d = V × t = ${numD(v)} × ${thTxt} = ${dMi} millas`],
    ['estima', 'Traza Rv y d desde la salida; lee l y L.'],
  ];
  filas.forEach(([p, s], i) => out.push(filaPaso(24, 276 + i * 23, i + 1, s, { clave: m.activo ? m.on(p) : i === 4, p })));
  out.push(cierra());
  return {
    svg: out.join(''),
    caption: dado
      ? `Si el enunciado ya da el rumbo verdadero, se traza tal cual. Desde la salida se traza el Rv ${deg3(rv)} y se mide con el compás la distancia navegada, d = V × t = ${dMi} millas: el extremo es la situación de estima.`
      : 'Se pasa el rumbo de aguja a verdadero (Rv = Ra + Ct), se calcula la distancia navegada (d = V × t, con el tiempo en horas) y, desde la salida, se traza el Rv y se mide d con el compás en la escala de latitudes. El extremo es la situación de estima.',
  };
}

// ===========================================================================
// Demoras no simultáneas (per-11-8). Cifras de la lección: 1.ª a las 10:00, 2.ª a las 10:40, Rv 090° a 6 nudos →
// 4 millas. Y el caso de dos marcaciones tomadas a la vez («más tarde»), que no se trasladan.

export const TRASLADO_PARTES = ['primera', 'traslado', 'trasladada', 'segunda', 'situacion', 'rumbo', 'distancia', 'lineas'];

export function trasladoDemoraC(spec = {}) {
  const m = partes(spec, TRASLADO_PARTES);
  if (!m) return null;
  const caso = spec.caso ?? 'no-simultaneas';
  if (caso === 'simultaneas') return simultaneasC(m);
  if (caso !== 'no-simultaneas') return null;
  const v = Number(spec.v ?? 6);
  const min = Number(spec.minutos ?? 40);
  if (!(v > 0) || !(min > 0)) return null;
  const d = (v * min) / 60;
  const dTxt = numD(d);
  const H = 384;
  const alt = `Costa con dos faros, A y B. La primera demora (desde A, a las 10:00) se traslada paralela a sí misma el rumbo y la distancia navegados entre las dos tomas (Rv 090°, ${dTxt} millas); su corte con la segunda demora (desde B, a las 10:40) es la situación de las 10:40, en magenta. El cruce de las dos sin trasladar, tachado, es un punto falso.`;
  const { out, pt, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
  out.push(tierra('M5,5 L353,5 L353,58 Q310,76 266,64 Q222,52 178,70 Q124,86 80,72 Q36,58 5,74Z', pt));
  const A = [168, 66];
  const B = [44, 70];
  const P2 = [228, 226];
  const dpx = 92;
  const P1 = [P2[0] - dpx, P2[1]];
  const u1 = dir(A, P1);
  const u2 = dir(B, P2);
  const L1 = Math.hypot(P1[0] - A[0], P1[1] - A[1]);
  out.push(`${m.g('primera')}${segP(A, mas(A, u1, L1 + 30), { color: m.c('primera'), w: m.w('primera', 1.6, 2.4) })}</g>`);
  const Q = mas(A, u1, L1 * 0.32);
  const Q2 = [Q[0] + dpx, Q[1]];
  out.push(`${m.g('trasladada')}${segP(mas(Q2, u1, -26), mas(P2, u1, 30), { color: m.c('trasladada'), w: m.w('trasladada', 1.6, 2.4), extra: 'stroke-dasharray="8 4"' })}</g>`);
  out.push(`${m.g('segunda')}${segP(B, mas(P2, u2, 30), { color: m.c('segunda'), w: m.w('segunda', 1.6, 2.4) })}</g>`);
  out.push(`${m.g('traslado')}${punto(Q[0], Q[1], { r: 3.2 })}${flecha(Q[0], Q[1], Q2[0] - 1, Q2[1], { color: m.activo ? m.c('traslado') : T.magenta, w: 2 })}${etiqueta((Q[0] + Q2[0]) / 2, Q[1] - 16, `Rv 090° · ${dTxt} M`, { color: m.activo ? m.c('traslado') : T.magenta })}</g>`);
  const F = corte(A, u1, B, u2);
  out.push(`<g>${tacha(F[0], F[1], 5)}${serif(F[0] - 12, F[1] + 2, 'sin trasladar:', { anchor: 'end', size: TXT.min, italic: true, color: T.apagado })}${serif(F[0] - 12, F[1] + 17, 'punto falso', { anchor: 'end', size: TXT.min, italic: true, color: T.apagado })}</g>`);
  out.push(faro(A[0], A[1], { destella: false }), serif(A[0] + 10, A[1] - 9, 'faro A', { weight: 700 }), faro(B[0], B[1], { destella: false }), serif(B[0] + 10, B[1] - 9, 'faro B', { weight: 700 }));
  const e1 = mas(A, u1, L1 * 0.86);
  out.push(`${m.g('primera')}${serif(e1[0] - 10, e1[1] + 4, '1.ª Dv 10:00', { anchor: 'end', weight: 700, color: m.c('primera') })}</g>`);
  const e3 = mas(Q2, u1, L1 * 0.24);
  out.push(`${m.g('trasladada')}${serif(e3[0] + 10, e3[1] + 4, 'trasladada', { weight: 700, color: m.c('trasladada') })}</g>`);
  const e2 = mas(P2, u2, 28);
  out.push(`${m.g('segunda')}${serif(e2[0] - 4, e2[1] + 18, '2.ª Dv 10:40', { anchor: 'middle', weight: 700, color: m.c('segunda') })}</g>`);
  const cSit = m.activo ? m.c('situacion') : T.magenta;
  out.push(`${m.g('situacion')}${situacion(P2[0], P2[1], { color: cSit })}${serif(P2[0] + 13, P2[1] - 6, 'situación', { weight: 700, color: cSit })}${serif(P2[0] + 13, P2[1] + 9, 'de las 10:40', { weight: 700, color: cSit })}</g>`);
  out.push(rosaNorte(330, 120));
  out.push(panelNotas(290, H));
  out.push(filaPaso(24, 314, 1, `d = V × t = ${numD(v)} × ${min}/60 = ${dTxt} millas`));
  out.push(filaPaso(24, 338, 2, 'Desde un punto de la 1.ª: Rv y d navegados.'));
  out.push(filaPaso(24, 362, 3, 'Paralela por el extremo; corte con la 2.ª.', { clave: true }));
  out.push(cierra());
  return {
    svg: out.join(''),
    caption: `La primera línea viaja con el barco: desde cualquier punto de ella se traza el Rv y la distancia navegada entre las dos tomas (${numD(v)} nudos × ${min} min = ${dTxt} millas) y por el extremo se traza una paralela. Su corte con la segunda línea es la situación a la hora de la segunda demora; cruzarlas sin trasladar da un punto en el que el barco no ha estado.`,
  };
}

function simultaneasC(m) {
  const H = 364;
  const alt = 'Costa con dos faros, A y B. Las dos marcaciones se toman a la vez: sus líneas se cruzan directamente y el corte, en magenta, es la situación. La situación anterior de las 12:00 solo sirve para el rumbo con el que se convierten las marcaciones y para medir la distancia navegada hasta el corte.';
  const { out, pt, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
  out.push(tierra('M5,5 L353,5 L353,58 Q310,76 266,64 Q222,52 178,70 Q124,86 80,72 Q36,58 5,74Z', pt));
  const A = [96, 74];
  const B = [272, 62];
  const S0 = [300, 232];
  const P = [130, 182];
  const uA = dir(A, P);
  const uB = dir(B, P);
  const ur = dir(S0, P);
  const nr = [ur[1], -ur[0]];
  const D = Math.hypot(P[0] - S0[0], P[1] - S0[1]);
  out.push(`${m.g('rumbo')}${situacion(S0[0], S0[1], { color: m.c('rumbo') })}${serif(S0[0] - 6, S0[1] + 26, 'situación 12:00', { anchor: 'middle', weight: 700 })}${flecha(S0[0], S0[1], ...mas(P, ur, -12), { color: m.c('rumbo'), w: m.w('rumbo', 1.6, 2.4) })}</g>`);
  const mr = mas(mas(S0, ur, D * 0.5), nr, 18);
  out.push(`${m.g('rumbo')}${serif(mr[0], mr[1] + 8, 'rumbo (Ra → Rv)', { anchor: 'end', weight: 700, color: m.c('rumbo') })}</g>`);
  out.push(`${m.g('distancia')}${cota(...mas(S0, nr, -14), ...mas(P, nr, -14), '', { color: m.c('distancia', T.apagado) })}${serif(...mas(mas(S0, ur, D * 0.42), nr, -30), 'distancia navegada', { anchor: 'start', italic: true, size: TXT.min, color: m.c('distancia', T.apagado) })}</g>`);
  out.push(`${m.g('lineas')}${segP(A, mas(P, uA, 28), { color: m.c('lineas'), w: m.w('lineas', 1.6, 2.4) })}${segP(B, mas(P, uB, 28), { color: m.c('lineas'), w: m.w('lineas', 1.6, 2.4) })}</g>`);
  out.push(faro(A[0], A[1], { destella: false }), serif(A[0] + 10, A[1] - 9, 'faro A', { weight: 700 }), faro(B[0], B[1], { destella: false }), serif(B[0] - 10, B[1] - 9, 'faro B', { anchor: 'end', weight: 700 }));
  const eb = mas(B, uB, 70);
  out.push(`${m.g('lineas')}${serif(eb[0] + 8, eb[1] + 16, 'marcaciones a la vez', { weight: 700, color: m.c('lineas') })}</g>`);
  const cSit = m.activo ? m.c('situacion') : T.magenta;
  out.push(`${m.g('situacion')}${situacion(P[0], P[1], { color: cSit })}${serif(P[0] - 14, P[1] + 5, 'situación', { anchor: 'end', weight: 700, color: cSit })}</g>`);
  out.push(rosaNorte(36, 140));
  out.push(panelNotas(276, H));
  out.push(serif(18, 300, '«Más tarde, dos marcaciones»: son de la', { weight: 700 }), serif(18, 318, 'misma hora y se cruzan sin trasladar nada.', { weight: 700 }));
  out.push(serif(18, 342, 'La situación de las 12:00 solo da el rumbo'), serif(18, 358, 'y la distancia navegada hasta el corte.'));
  out.push(cierra());
  return {
    svg: out.join(''),
    caption: 'Si las dos marcaciones se toman a la vez, son simultáneas: se cruzan directamente y no se traslada nada. La situación anterior sirve para tener el rumbo con el que convertir las marcaciones y, si lo piden, para medir la distancia navegada hasta el corte.',
  };
}

// ===========================================================================
// Rumbo para pasar a una distancia de un faro (per-11-9). Cifras de la lección: faro en Dv 004° a 10 millas, pasar a
// 2,5 millas dejándolo por babor: sen α = 2,5 / 10 → α ≈ 14,5°, Rv = Dv + α ≈ 019°.

export const TANGENTE_PARTES = ['situacion', 'circulo', 'visual', 'tangente', 'angulo'];

export function tangenteC(spec = {}) {
  const m = partes(spec, TANGENTE_PARTES);
  if (!m) return null;
  const dv = Number(spec.dv ?? 4);
  const D = Number(spec.D ?? 10);
  const dp = Number(spec.d ?? 2.5);
  const banda = spec.banda ?? 'babor';
  if (!(D > dp && dp > 0) || !Number.isFinite(dv) || !['babor', 'estribor', 'ambas'].includes(banda)) return null;
  const alfa = Math.round((Math.asin(dp / D) * 1800) / Math.PI) / 10;
  const rvE = ((dv - alfa) % 360 + 360) % 360;
  const rvB = ((dv + alfa) % 360 + 360) % 360;
  const [dTxt, DTxt] = [numD(dp), numD(D)];
  const H = 400;
  const alt = `Desde tu situación, la visual al faro (Dv ${deg3(dv)}, a ${DTxt} millas) y, con centro en el faro, la circunferencia de la distancia de paso (${dTxt} millas). ${banda === 'ambas' ? 'Salen dos tangentes: la de la izquierda deja el faro por estribor y la de la derecha, por babor' : `La tangente que deja el faro por ${banda} es el rumbo`}; el ángulo α entre la visual y la tangente cumple sen α = d / D. Debajo, la cuenta.`;
  const { out, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
  const k = 160 / D;
  const r = dp * k;
  const uf = pol(0, 0, dv, 1);
  let S = [179 - (uf[0] * D * k) / 2, 140 - (uf[1] * D * k) / 2];
  let F = mas(S, uf, D * k);
  const top = Math.min(S[1] - 10, F[1] - r);
  const bot = Math.max(S[1] + 30, F[1] + r);
  const dy = top < 26 ? 26 - top : bot > 262 ? 262 - bot : 0;
  S = [S[0], S[1] + dy];
  F = [F[0], F[1] + dy];
  out.push(`${m.g('circulo')}<circle cx="${f1(F[0])}" cy="${f1(F[1])}" r="${f1(r)}" fill="none" stroke="${m.c('circulo', T.tinta)}" stroke-width="${m.w('circulo', 1.2, 2.2)}" stroke-dasharray="5 3"/></g>`);
  out.push(`${m.g('visual')}${segP(S, F, { color: m.c('visual', T.apagado), w: m.w('visual', 1.2, 2.2), extra: 'stroke-dasharray="3 3"' })}</g>`);
  const Lt = Math.sqrt(D * D - dp * dp) * k;
  const L = Lt + 28;
  const segs = [[S, F]];
  const peticiones = [];
  for (const [b, rv, sg] of [['estribor', rvE, -1], ['babor', rvB, 1]]) {
    const elegida = banda === 'ambas' || banda === b;
    const E = pol(S[0], S[1], rv, L);
    const Tg = pol(S[0], S[1], rv, Lt);
    segs.push([S, E]);
    const color = elegida ? (m.activo ? m.c('tangente') : T.magenta) : T.apagado;
    const g = [elegida ? m.g('tangente') : '<g opacity=".6">'];
    g.push(elegida ? flecha(S[0], S[1], E[0], E[1], { color, w: m.w('tangente', 1.8, 2.6) }) : segP(S, E, { color, w: 1 }));
    if (elegida) g.push(segP(F, Tg, { w: 1 }), punto(Tg[0], Tg[1], { r: 2.5, color }));
    g.push('</g>');
    out.push(g.join(''));
    const lbl = `Rv ${deg3(rv)}`;
    const n = pol(0, 0, rv + sg * 90, 1);
    const q = pol(S[0], S[1], rv, L * 0.52);
    peticiones.push({ t: `${lbl} · faro por ${b}`, cands: [[q[0] + n[0] * 74, q[1] + n[1] * 20], [q[0] + n[0] * 80, q[1] + n[1] * 30 + 20], ...junto(S, E, `${lbl} · faro por ${b}`)], color: elegida ? color : T.apagado, p: elegida ? 'tangente' : null });
  }
  out.push(`${m.g('angulo')}`);
  for (const [b, rv] of [['estribor', rvE], ['babor', rvB]]) {
    if (banda !== 'ambas' && banda !== b) continue;
    const [a0, a1] = b === 'babor' ? [dv, rv] : [rv, dv];
    out.push(`<path d="${arcoD(S[0], S[1], 46, a0, a1)}" fill="none" stroke="${m.c('angulo')}" stroke-width="${m.w('angulo', 1.2, 2.2)}"/>`);
  }
  if (banda !== 'ambas') { const la = pol(S[0], S[1], banda === 'babor' ? dv + alfa / 2 : dv - alfa / 2, 60); out.push(rotulo(la[0], la[1] + 5, 'α', { size: TXT.nota, estilo: 'serif', weight: 700, italic: true, color: m.c('angulo') })); }
  out.push('</g>');
  out.push(faro(F[0], F[1], { destella: false }));
  const lf = mas(F, uf, Math.min(16, r - 4));
  out.push(serif(lf[0], lf[1] + 5 + (uf[1] > 0.5 ? 5 : 0), 'faro', { anchor: 'middle', weight: 700, size: TXT.min }));
  out.push(`${m.g('situacion')}${situacion(S[0], S[1], { color: m.c('situacion') })}</g>`);
  const cajas = [{ x0: F[0] - 14, y0: F[1] - 14, x1: F[0] + 14, y1: F[1] + 24 }, { x0: S[0] - 12, y0: S[1] - 12, x1: S[0] + 12, y1: S[1] + 12 }];
  const rosa = esquinaLibre([S, F, pol(S[0], S[1], rvE, L), pol(S[0], S[1], rvB, L)], [[36, 44], [W - 36, 44], [36, 240], [W - 36, 240]]);
  cajas.push({ x0: rosa[0] - 20, y0: rosa[1] - 34, x1: rosa[0] + 20, y1: rosa[1] + 20 });
  out.push(rosaNorte(rosa[0], rosa[1]));
  out.push(colocaEtiquetas([
    { t: 'tu situación', cands: [[S[0], S[1] + 24], [S[0] - 50, S[1] + 4], [S[0] + 50, S[1] + 4]], p: 'situacion', rotulo: true },
    { t: `d = ${dTxt} M`, cands: [pol(F[0], F[1], dv + 90, r + 30), pol(F[0], F[1], dv - 90, r + 30), pol(F[0], F[1], dv, r + 20)], color: m.c('circulo'), p: 'circulo' },
    ...peticiones,
  ], { W, H: 272, segs, cajas }));
  out.push(panelNotas(274, H));
  out.push(filaPaso(24, 298, 1, `Al faro: Dv ${deg3(dv)} a ${DTxt} M; paso a d = ${dTxt} M`, { p: 'visual' }));
  out.push(filaPaso(24, 322, 2, `sen α = d / D = ${dTxt} / ${DTxt} → α ≈ ${numD(alfa)}°`, { p: 'angulo' }));
  const fin = banda === 'babor' ? `Por babor: Rv = Dv + α ≈ ${deg3(rvB)}` : banda === 'estribor' ? `Por estribor: Rv = Dv − α ≈ ${deg3(rvE)}` : `Er: Dv − α ≈ ${deg3(rvE)} · Br: Dv + α ≈ ${deg3(rvB)}`;
  out.push(filaPaso(24, 346, 3, fin, { clave: true }));
  out.push(filaPaso(24, 370, 4, 'Y después, al timón: Ra = Rv − Ct'));
  out.push(cierra());
  const cap = {
    babor: 'Con centro en el faro se traza la circunferencia de la distancia de paso y, desde tu situación, la tangente. Para dejar el faro por babor (a tu izquierda) se toma la tangente de la derecha de la visual: Rv = Dv + α.',
    estribor: 'Con centro en el faro se traza la circunferencia de la distancia de paso y, desde tu situación, la tangente. Para dejar el faro por estribor (a tu derecha) se toma la tangente de la izquierda de la visual: Rv = Dv − α.',
    ambas: 'Desde tu situación salen dos tangentes a la circunferencia de la distancia de paso. Faro por estribor: la de la izquierda (Rv = Dv − α); por babor: la de la derecha (Rv = Dv + α). Si el enunciado no dice la banda, la que pasa por fuera, por el lado del mar.',
  };
  return { svg: out.join(''), caption: cap[banda] };
}

// ===========================================================================
// Sondas y veriles (per-10-3). Naturaleza del fondo con las abreviaturas de la Carta n.º 1 (INT 1, sección J).

export const FONDOS = [
  ['S', 'arena', 'sand'], ['M', 'fango', 'mud'], ['Cy', 'arcilla', 'clay'], ['Si', 'limo', 'silt'],
  ['St', 'piedras', 'stones'], ['G', 'cascajo (grava)', 'gravel'], ['P', 'guijarros', 'pebbles'], ['R', 'roca', 'rock'],
  ['Sh', 'conchuela', 'shells'], ['Co', 'coral', 'coral'], ['Wd', 'algas', 'weed'],
];
export const VERILES_PARTES = ['sondas', 'veriles', 'fondo', ...FONDOS.map((f) => f[0])];

export function verilesC(spec = {}) {
  const vista = spec.vista ?? 'carta';
  if (vista === 'fondos') return fondosC(spec);
  if (vista !== 'carta') return null;
  const m = partes(spec, null, { atenua: false });
  const H = 326;
  const alt = 'Trozo de carta con la costa a la izquierda: sondas sueltas (la profundidad en metros desde el cero hidrográfico), los veriles de 5, 10 y 20 m como curvas de nivel, las zonas someras más azules y letras de la naturaleza del fondo. Debajo, el corte del fondo por la línea X–Y, con los mismos veriles a su profundidad.';
  const { out, id, pt, cierra } = lienzo(W, H, alt);
  const [top, bot, xL, xR] = [14, 168, 14, W - 14];
  const coast = (y) => 40 + 10 * Math.sin((y - top) / 18) + 6 * Math.cos((y - top) / 31);
  const VER = [[5, 100, 12, 23], [10, 164, 14, 29], [20, 250, 11, 37]];
  const verX = (i, y) => { const [, b, a, f] = VER[i]; return b + a * Math.sin((y - top) / f + i); };
  const depth = (x, y) => {
    const xs = [coast(y), ...VER.map((_, i) => verX(i, y)), xR + 40];
    const ds = [0, 5, 10, 20, 28];
    for (let i = 0; i < xs.length - 1; i++) if (x <= xs[i + 1]) return ds[i] + ((ds[i + 1] - ds[i]) * (x - xs[i])) / (xs[i + 1] - xs[i]);
    return 28;
  };
  const curva = (fx_) => { const p = []; for (let y = top; y <= bot; y += 4) p.push([fx_(y), y]); return p; };
  const costa = curva(coast);
  const v5 = curva((y) => verX(0, y));
  const v10 = curva((y) => verX(1, y));
  out.push(`<clipPath id="${id}-cl"><rect x="${xL}" y="${top}" width="${xR - xL}" height="${bot - top}"/></clipPath><g clip-path="url(#${id}-cl)">`);
  out.push(`<rect x="${xL}" y="${top}" width="${xR - xL}" height="${bot - top}" fill="${T.papel}"/>`);
  out.push(`<polygon points="${pts([...costa, ...v10.slice().reverse()])}" fill="${T.agua2}"/>`, `<polygon points="${pts([...costa, ...v5.slice().reverse()])}" fill="${T.agua}"/>`);
  out.push(tierra(`M0,${top} ${costa.map(([x, y]) => `L${f1(x)},${f1(y)}`).join(' ')} L0,${bot}Z`, pt));
  out.push(`<g data-parte="veriles">${VER.map((_, i) => `<polyline points="${pts(curva((y) => verX(i, y)))}" fill="none" stroke="${m.c('veriles', T.azul)}" stroke-width="${m.w('veriles', 1.2, 2.2)}"/>`).join('')}</g>`, '</g>');
  out.push(`<rect x="${xL}" y="${top}" width="${xR - xL}" height="${bot - top}" fill="none" stroke="${T.tinta}" stroke-width="1"/>`);
  out.push(serif(20, top + 18, 'tierra', { size: TXT.min, italic: true, weight: 700 }));
  out.push(`<g data-parte="veriles">${VER.map(([mm], i) => etiqueta(verX(i, top + 24), top + 24, String(mm), { color: m.c('veriles', T.azulTxt), borde: m.c('veriles', T.azul) })).join('')}</g>`);
  const ys = 120;
  const xa = coast(ys);
  out.push(linea(xa, ys, xR - 6, ys, { w: 1, extra: 'stroke-dasharray="6 3"' }), serif(xa + 4, ys - 6, 'X', { weight: 700 }), serif(xR - 8, ys - 6, 'Y', { anchor: 'end', weight: 700 }));
  const SON = [[70, 64, 'S'], [126, 82, ''], [128, 148, 'S Sh'], [204, 60, 'M'], [212, 146, ''], [286, 76, 'G'], [296, 146, ''], [64, 140, 'R']];
  const so = [];
  const fo = [];
  for (const [x, y, f] of SON) {
    so.push(mono(x, y, String(Math.max(1, Math.round(depth(x, y)))), { weight: m.on('sondas') ? 700 : 400, color: m.c('sondas'), extra: 'font-style="italic"' }));
    if (f) fo.push(rotulo(x, y + 14, f, { size: TXT.min, estilo: 'serif', italic: true, weight: 700, color: m.c('fondo', T.apagado) }));
  }
  out.push(`<g data-parte="sondas">${so.join('')}</g>`, `<g data-parte="fondo">${fo.join('')}</g>`);
  // corte X–Y
  const s0 = 214;
  const k = 3.4;
  out.push(cap(18, 194, 'CORTE X–Y'));
  const prof = [];
  for (let x = xa; x <= xR - 6; x += 3) prof.push([x, s0 + depth(x, ys) * k]);
  prof.push([xR - 6, s0 + depth(xR - 6, ys) * k]);
  out.push(`<polygon points="${pts([[xa, s0], ...prof, [xR - 6, s0]])}" fill="${T.agua}"/>`);
  out.push(tierra(`M${xL},${s0 - 12} L${f1(xa - 6)},${s0 - 3} ${prof.map(([x, y]) => `L${f1(x)},${f1(y)}`).join(' ')} L${xR - 6},${H - 5} L${xL},${H - 5}Z`, pt));
  out.push(linea(xa, s0, xR - 6, s0, { color: T.azul, w: 1.4 }), serif(xR - 8, s0 - 6, 'cero hidrográfico', { anchor: 'end', size: TXT.min, italic: true, color: T.azulTxt }));
  out.push(`<g data-parte="veriles">${VER.map(([mm], i) => { const x = verX(i, ys); const y = s0 + mm * k; return linea(x, ys + 2, x, y, { color: T.apagado, w: 0.7, extra: 'stroke-dasharray="2 3"' }) + punto(x, y, { color: m.c('veriles', T.azul) }) + mono(x + 8, y - 7, `${mm} m`, { anchor: 'start', weight: 700, color: m.c('veriles', T.azulTxt) }); }).join('')}</g>`);
  out.push(cierra());
  return { svg: out.join(''), caption: 'Las cifras sueltas son las sondas: la profundidad en metros desde el cero hidrográfico. Los veriles unen puntos de igual profundidad, como curvas de nivel; las zonas someras van en azul. Las letras dicen de qué es el fondo (S arena, M fango, G cascajo, R roca, S Sh arena con conchuela).' };
}

function fondosC(spec) {
  const m = partes(spec, null, { atenua: false });
  const H = 330;
  const alt = 'Tabla de la naturaleza del fondo en la carta: once abreviaturas (del inglés) con su nombre en español: S arena, M fango, Cy arcilla, Si limo, St piedras, G cascajo, P guijarros, R roca, Sh conchuela, Co coral y Wd algas. Debajo, que si van varias juntas la primera es la que predomina.';
  const { out, cierra } = lienzo(W, H, alt);
  FONDOS.forEach(([ab, es, en], i) => {
    const c = i < 6 ? 0 : 1;
    const y = 30 + (i - c * 6) * 30;
    const x = 18 + c * 170;
    const col = m.c(ab);
    out.push(`<g data-parte="${ab}">${etiqueta(x + 16, y, ab, { color: col, borde: m.on(ab) ? T.magenta : T.tinta })}${serif(x + 40, y - 1, es, { weight: m.on(ab) ? 700 : 400, color: col })}${serif(x + 40, y + 13, `(${en})`, { size: TXT.min, italic: true, color: T.apagado })}</g>`);
  });
  out.push(panelNotas(206, H));
  out.push(serif(18, 230, 'Varias juntas, primero la que predomina:', { weight: 700 }), serif(18, 252, 'S G = arena con cascajo'), serif(18, 272, 'S Sh = arena con conchuela'));
  out.push(serif(18, 300, 'Ojo: G no es guijarro (P); St no es roca (R).', { weight: 700, color: T.magenta }));
  out.push(cierra());
  return { svg: out.join(''), caption: 'Junto a muchas sondas, unas letras (del inglés) dicen de qué es el fondo, útil para fondear. Si hay varias, la primera es la que predomina.' };
}

// ===========================================================================
// per-11-7: oposición (entre los dos faros) y enfilación (en la prolongación), cortadas por la opuesta de la demora
// verdadera de un tercer faro. Geometría real: el tercer faro está a la demora dicha desde la situación, y la recta
// que se traza desde él es Dv ± 180°.

export const OPOSICION_PARTES = ['recta', 'demora', 'situacion'];

export function oposicionC(spec = {}) {
  const caso = spec.caso === 'enfilacion' ? 'enfilacion' : 'oposicion';
  const m = partes(spec, OPOSICION_PARTES);
  if (!m) return null;
  const H = 372;
  const op = caso === 'oposicion';
  const dv = op ? 80 : 205;
  const opu = (dv + 180) % 360;
  const P = op ? [150, 170] : [150, 150];
  let A;
  let B;
  if (op) { A = pol(P[0], P[1], 315, 120); B = pol(P[0], P[1], 135, 112); } else { A = pol(P[0], P[1], 40, 164); B = pol(P[0], P[1], 40, 92); }
  const C = pol(P[0], P[1], dv, op ? 150 : 120);
  const alt = op
    ? `Oposición: el barco está entre el faro A y el faro B, sobre el segmento que los une. Desde un tercer faro C, visto a ${deg3(dv)}, se traza la opuesta, ${deg3(opu)}; su corte con la recta A–B es la situación.`
    : `Enfilación: el faro B tapa al faro A y el barco está en la prolongación de la recta que los une, fuera del segmento. Desde un tercer faro C, visto a ${deg3(dv)}, se traza la opuesta, ${deg3(opu)}; su corte con la prolongación es la situación.`;
  const { out, pt, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
  if (op) out.push(tierra('M5,5 L120,5 L112,40 Q80,62 46,58 Q20,56 5,66Z', pt), tierra(`M${W - 5},230 L${W - 5},286 L190,286 Q206,262 246,252 Q290,240 ${W - 5},230Z`, pt), tierra(`M${W - 5},5 L${W - 5},170 Q320,150 300,128 Q284,104 ${W - 5},5Z`, pt));
  else out.push(tierra(`M5,5 L${W - 5},5 L${W - 5},72 Q300,84 262,70 Q220,58 180,78 Q140,96 100,84 Q60,74 5,90Z`, pt), tierra('M5,248 Q60,244 106,266 Q124,280 130,300 L5,300Z', pt));
  const ext = op ? [A, B] : [A, pol(P[0], P[1], 220, 60)];
  out.push(`${m.g('recta')}${segP(ext[0], ext[1], { color: m.c('recta', T.azul), w: m.w('recta', 1.6, 2.6), extra: op ? '' : 'stroke-dasharray="7 4"' })}${op ? '' : segP(A, B, { color: m.c('recta', T.azul), w: m.w('recta', 1.6, 2.6) })}</g>`);
  out.push(faro(A[0], A[1], { destella: false }), faro(B[0], B[1], { destella: false }), faro(C[0], C[1], { destella: false }));
  out.push(serif(A[0] + 10, A[1] - 8, 'faro A', { weight: 700 }), serif(B[0] + (op ? -12 : 12), B[1] + (op ? 4 : 4), 'faro B', { weight: 700, anchor: op ? 'end' : 'start' }), serif(C[0] + (op ? -10 : 10), C[1] + (op ? -10 : 4), 'faro C', { weight: 700, anchor: op ? 'end' : 'start' }));
  const fin = pol(P[0], P[1], opu, 40);
  out.push(`${m.g('demora')}${segP(C, fin, { color: m.c('demora', T.magenta), w: m.w('demora', 1.6, 2.6) })}`);
  const mid = [(C[0] + P[0]) / 2, (C[1] + P[1]) / 2];
  out.push(etiqueta(mid[0] + (op ? 10 : 48), mid[1] + (op ? 22 : 0), `opuesta ${deg3(opu)}`, { color: m.c('demora', T.magenta) }), '</g>');
  out.push(`${m.g('situacion')}${situacion(P[0], P[1], { color: m.c('situacion', T.magenta) })}${serif(P[0] + (op ? -14 : 14), P[1] + (op ? 22 : -8), 'situación', { weight: 700, anchor: op ? 'end' : 'start', color: m.c('situacion', T.magenta) })}</g>`);
  out.push(rosaNorte(W - 30, op ? 210 : 120, 13));
  out.push(panelNotas(300, H));
  out.push(serif(16, 322, op ? 'A y B en sentidos opuestos: el corte, entre ellos.' : 'A y B en la misma dirección: el corte, en la', { size: TXT.min, weight: 700 }));
  out.push(serif(16, 340, op ? `Ves C a ${deg3(dv)}: desde C trazas ${deg3(opu)}.` : `prolongación. Ves C a ${deg3(dv)}: desde C, ${deg3(opu)}.`, { size: TXT.min }));
  out.push(serif(16, 358, 'La recta de los dos faros no lleva correcciones.', { size: TXT.min, italic: true, color: T.apagado }));
  out.push(cierra());
  return {
    svg: out.join(''),
    caption: op
      ? 'En una oposición estás sobre el segmento que une los dos faros. Esa recta ya es una línea de posición, sin correcciones: córtala con la opuesta de la demora verdadera de un tercer faro y tienes la situación.'
      : 'En una enfilación ves un faro tapando al otro: estás en la prolongación de la recta que los une, fuera del segmento. Córtala con la opuesta de la demora verdadera de un tercer faro.',
  };
}
