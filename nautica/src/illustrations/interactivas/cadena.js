// Dibujo común de abatimiento y corriente: la cadena rumbo verdadero → rumbo de superficie → rumbo efectivo,
// en planta (norte arriba) y siempre con los mismos colores: proa azul, superficie naranja, corriente violeta,
// efectivo rojo.
import { svgOpen, flecha, arco, texto, barcoPlanta, encaja, vec, suma, pad3, num, f1, rad } from './kit.js';

const W = 320;
const H = 300;

/** Rótulo junto al punto medio de un segmento, por el lado que se aleja de `centro` (fuera del triángulo). */
function rotuloSeg(a, b, t, color, p, centro) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const n = Math.hypot(dx, dy) || 1;
  // en un segmento corto el rótulo va pasada la punta, para no taparla
  const corto = n < 80;
  const mx = corto ? b[0] + (dx / n) * 10 : (a[0] + b[0]) / 2;
  const my = corto ? b[1] + (dy / n) * 10 : (a[1] + b[1]) / 2;
  let nx = (-dy / n) * 14;
  let ny = (dx / n) * 14;
  if (Math.hypot(mx + nx - centro[0], my + ny - centro[1]) < Math.hypot(mx - nx - centro[0], my - ny - centro[1])) { nx = -nx; ny = -ny; }
  const anchor = nx > 4 ? 'start' : nx < -4 ? 'end' : 'middle';
  // que no se salga por los lados: se estima el ancho del texto
  const ancho = t.length * 8.6;
  let x = mx + nx;
  if (anchor === 'start') x = Math.min(x, W - 8 - ancho);
  if (anchor === 'end') x = Math.max(x, 8 + ancho);
  return texto(x, my + ny + 5, t, { color, p, size: 16, anchor });
}

/**
 * @param {object} c  { rv, rs, ref, vef, vb, rc, ic, ab, inversa }
 * @param {{ ocultar?: string[], viento?: 'babor'|'estribor'|null }} o  partes que no se enseñan todavía
 */
export function dibujaCadena(c, { ocultar = [], viento = null } = {}) {
  const ve = (p) => !ocultar.includes(p);
  // puntos en nudos (1 hora de navegación)
  const O = [0, 0];
  let S; // extremo del vector superficie
  let E; // extremo del efectivo
  let Cc = null; // extremo de la corriente cuando se dibuja primero (inversa)
  if (c.inversa) {
    Cc = vec(c.rc, c.ic);
    E = vec(c.ref, c.vef);
    S = E;
  } else {
    S = vec(c.rs, c.vb);
    E = suma(S, vec(c.rc, c.ic));
  }
  const destino = c.inversa ? vec(c.ref, c.vef * 1.25) : null;
  const proa = vec(c.rv, c.vb * 0.55);
  const pts = [O, S, E, proa, ...(Cc ? [Cc] : []), ...(destino ? [destino] : [])];
  const T = encaja(pts, 50, 50, W - 100, H - 100);
  const o = T(O);
  const px = pts.map(T);
  const centro = [px.reduce((a, q) => a + q[0], 0) / px.length, px.reduce((a, q) => a + q[1], 0) / px.length];
  const out = [svgOpen(W, H, c.inversa ? 'Rumbo a dar con corriente' : 'Rumbo verdadero, de superficie y efectivo')];
  out.push(texto(W - 12, 22, 'N ↑', { anchor: 'end', size: 15 }));
  out.push(texto(12, H - 10, 'escala: 1 hora de navegación', { anchor: 'start', size: 13, weight: 400, color: 'var(--muted)' }));
  if (viento) {
    // tres flechas de viento en la banda de barlovento, hacia sotavento, repartidas a lo largo de la proa
    const hacia = c.rv + (viento === 'babor' ? 90 : -90);
    const cx = W / 2;
    const cy = H / 2;
    for (let i = -1; i <= 1; i++) {
      const bx = cx - Math.sin(rad(hacia)) * 105 + Math.sin(rad(c.rv)) * i * 55;
      const by = cy + Math.cos(rad(hacia)) * 105 - Math.cos(rad(c.rv)) * i * 55;
      out.push(flecha(bx, by, bx + Math.sin(rad(hacia)) * 34, by - Math.cos(rad(hacia)) * 34, 'var(--l-g)', 2.5, 'viento'));
    }
  }
  if (destino) {
    const d = T(destino);
    out.push(`<line data-parte="ref" x1="${f1(o[0])}" y1="${f1(o[1])}" x2="${f1(d[0])}" y2="${f1(d[1])}" stroke="var(--l-g)" stroke-width="1.5" stroke-dasharray="6 5"/>`);
    out.push(`<circle data-parte="ref" cx="${f1(d[0])}" cy="${f1(d[1])}" r="6" fill="var(--l-faro)" stroke="var(--text)"/>`, texto(d[0], d[1] - 12, 'destino', { size: 15 }));
  }
  const s = T(S);
  const e = T(E);
  if (c.inversa) {
    const cc = T(Cc);
    out.push(flecha(o[0], o[1], cc[0], cc[1], 'var(--l-p)', 3, 'corriente'), rotuloSeg(o, cc, `1 · corriente ${num(c.ic)} kn`, 'var(--l-p)', 'corriente', centro));
    if (ve('rs')) out.push(flecha(cc[0], cc[1], s[0], s[1], 'var(--l-a)', 3, 'rs'), rotuloSeg(cc, s, `2 · Rs ${pad3(c.rs)}°`, 'var(--l-a)', 'rs', centro));
    if (ve('ref')) out.push(flecha(o[0], o[1], e[0], e[1], 'var(--l-r)', 3.5, 'ref'), rotuloSeg(o, e, `Ref ${pad3(c.ref)}°`, 'var(--l-r)', 'ref', centro));
  } else {
    if (ve('rs')) out.push(flecha(o[0], o[1], s[0], s[1], 'var(--l-a)', 3, 'rs'), rotuloSeg(o, s, `Rs ${pad3(c.rs)}°`, 'var(--l-a)', 'rs', centro));
    if (c.ic && ve('ref')) out.push(flecha(s[0], s[1], e[0], e[1], 'var(--l-p)', 3, 'corriente'), rotuloSeg(s, e, `corriente ${num(c.ic)} kn`, 'var(--l-p)', 'corriente', centro));
    if (c.ic && ve('ref')) out.push(flecha(o[0], o[1], e[0], e[1], 'var(--l-r)', 3.5, 'ref'), rotuloSeg(o, e, `Ref ${pad3(c.ref)}°`, 'var(--l-r)', 'ref', centro));
  }
  // la proa: el barco apunta a su rumbo verdadero
  if (ve('rv')) {
    const p = T(proa);
    // con abatimiento la proa no apunta por donde va el barco: se dibuja su dirección (sin él coincidiría con el Rs)
    if (c.ab || ocultar.includes('rs')) out.push(flecha(o[0], o[1], p[0], p[1], 'var(--l-v)', 2.5, 'rv', 'stroke-dasharray="2 4"'), rotuloSeg(o, p, `Rv ${pad3(c.rv)}°`, 'var(--l-v)', 'rv', centro));
    out.push(barcoPlanta(o[0], o[1], c.rv, 34, 'rv'));
  } else {
    out.push(`<circle cx="${f1(o[0])}" cy="${f1(o[1])}" r="5" fill="var(--text)"/>`);
  }
  out.push('</svg>');
  return out.join('');
}

/** Las tres casillas de la cadena, en su orden. '?' en lo que aún no se enseña. */
export function casillasCadena(c, ocultar = []) {
  const q = (p, v) => (ocultar.includes(p) ? '?' : v);
  const dar = c.inversa ? ' a dar' : '';
  return [
    [`1 · Verdadero${dar}`, q('rv', `${pad3(c.rv)}°`)],
    [`2 · Superficie${dar}`, q('rs', `${pad3(c.rs)}°${c.ab ? ` (Ab ${c.ab > 0 ? '+' : '−'}${Math.abs(c.ab)}°)` : ' (sin viento)'}`)],
    ['3 · Efectivo', q('ref', c.ic ? `${pad3(c.ref)}° · ${num(c.vef)} kn` : `${pad3(c.ref)}° (sin corriente)`)],
  ];
}
