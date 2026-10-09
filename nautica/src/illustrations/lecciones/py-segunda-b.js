// Segundas láminas para tres lecciones de navegación del Patrón de Yate:
// loxodrómica frente a ortodrómica en el globo y en la Mercator (py-3-4), XTE, VMG y ETA paso a paso sobre la
// derrota (py-3-9) y carta raster frente a vectorial (py-3-10).
// Funciones puras spec → { svg, caption }. Admiten `resaltar` (una parte o lista) para destacar la que trata cada paso.

import { C, open, title, pol, arrow, fx, rad } from '../kit.js';
import { T, TXT, lienzo, rotulo, arcoD } from '../estilo-c.js';
import { gnssCalculos, cartaRasterVectorial } from '../electronica-c.js';

const nf = (n, d = 1) => (+n).toFixed(d).replace('.', ',');
const col = (c) => C[c] ?? c;

/** Partes resaltadas: on(p) dice si se dibuja fuerte; dim(p) atenúa lo que no está resaltado. null si hay una parte inválida. */
function marcas(spec, validas) {
  const r = spec.resaltar;
  const s = r == null || r === '' ? null : new Set([].concat(r));
  if (s && [...s].some((p) => !validas.includes(p))) return null;
  return {
    activo: !!s,
    on: (p) => !!s && s.has(p),
    dim: (p) => (s && !s.has(p) ? ' opacity=".35"' : ''),
  };
}

/** Texto con halo del color del fondo (se lee aunque cruce una línea) y sin salirse del panel. */
function t(x, y, txt, { c = null, a = 'start', b = false, s = null } = {}) {
  const w = String(txt).replace(/<[^>]*>/g, '').length * (s ?? 10) * (b ? 0.58 : 0.52);
  const [i0, i1] = a === 'start' ? [0, w] : a === 'end' ? [-w, 0] : [-w / 2, w / 2];
  if (x + i0 < 6) x = 6 - i0;
  else if (x + i1 > 314) x = 314 - i1;
  const fill = c ? col(c) : 'currentColor';
  return `<text x="${fx(x)}" y="${fx(y)}" class="il-lbl" text-anchor="${a}"${b ? ' font-weight="700"' : ''}${s ? ` font-size="${s}"` : ''} style="fill:${fill};paint-order:stroke;stroke:var(--bg);stroke-width:3px;stroke-linejoin:round">${txt}</text>`;
}
const seg = (p, q, c, w = 2, extra = '') => `<line x1="${fx(p[0])}" y1="${fx(p[1])}" x2="${fx(q[0])}" y2="${fx(q[1])}" stroke="${col(c)}" stroke-width="${w}" ${extra}/>`;
const linea = (pts, c, w, extra = '') => `<polyline points="${pts.map((p) => `${fx(p[0])},${fx(p[1])}`).join(' ')}" fill="none" stroke="${col(c)}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
const punto = (p, r = 3.5) => `<circle cx="${fx(p[0])}" cy="${fx(p[1])}" r="${r}" fill="currentColor"/>`;

// ---------------------------------------------------------------------------
// 1. Loxodrómica y ortodrómica (py-3-4). spec: { tipo:'loxo-orto', resaltar?: 'loxo'|'orto' }
// La misma travesía (40° N 074° W → 50° N 005° W) calculada de verdad: círculo máximo (slerp) y rumbo constante
// (recta en longitud y latitud creciente), proyectada en un globo ortográfico y en una carta Mercator.

const PARTES_LOXO = ['loxo', 'orto'];
const psi = (lat) => (Math.log(Math.tan(Math.PI / 4 + rad(lat) / 2)) * 180) / Math.PI; // latitud creciente, en grados
const latDePsi = (p) => (2 * Math.atan(Math.exp(rad(p))) - Math.PI / 2) * (180 / Math.PI);

function travesia(A, B, n = 40) {
  // ortodrómica: interpolación esférica entre los dos vectores
  const v = ([la, lo]) => [Math.cos(rad(la)) * Math.cos(rad(lo)), Math.cos(rad(la)) * Math.sin(rad(lo)), Math.sin(rad(la))];
  const a = v(A);
  const b = v(B);
  const om = Math.acos(a[0] * b[0] + a[1] * b[1] + a[2] * b[2]);
  const orto = [];
  const loxo = [];
  for (let i = 0; i <= n; i++) {
    const f = i / n;
    const ka = Math.sin((1 - f) * om) / Math.sin(om);
    const kb = Math.sin(f * om) / Math.sin(om);
    const p = [0, 1, 2].map((j) => ka * a[j] + kb * b[j]);
    orto.push([(Math.asin(p[2]) * 180) / Math.PI, (Math.atan2(p[1], p[0]) * 180) / Math.PI]);
    loxo.push([latDePsi(psi(A[0]) + f * (psi(B[0]) - psi(A[0]))), A[1] + f * (B[1] - A[1])]);
  }
  return { orto, loxo };
}

function loxoOrto(spec = {}) {
  // Estilo C (docs/ESTILO-LAMINAS.md): la loxodrómica en magenta, continua; la ortodrómica en tinta, a trazos; la
  // retícula fina. En la Mercator, el mismo ángulo α en cada meridiano que corta la loxodrómica.
  const m = marcas(spec, PARTES_LOXO);
  if (!m) return null;
  const W = 358;
  const H = 336;
  const alt = 'La misma travesía de 40° N 074° W a 50° N 005° W de dos maneras, en el globo y en la carta Mercator: la loxodrómica (continua) corta todos los meridianos con el mismo ángulo y en la Mercator es una recta; la ortodrómica (a trazos), arco de círculo máximo, es la más corta y en la Mercator sale curvada hacia el polo.';
  const { out, cierra } = lienzo(W, H, alt);
  const A = [40, -74];
  const B = [50, -5];
  const { orto, loxo } = travesia(A, B);
  const wL = m.on('loxo') ? 2.4 : 2;
  const wO = m.on('orto') ? 2.2 : 1.8;
  const linC = (pts, color, w, extra = '') => `<polyline points="${pts.map((q) => `${fx(q[0])},${fx(q[1])}`).join(' ')}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"${extra}/>`;

  // --- globo (proyección ortográfica centrada en 42° N 040° W)
  const G = [90, 124];
  const R = 72;
  const lat0 = rad(42);
  const lon0 = -40;
  const orto2 = ([la, lo]) => {
    const f = rad(la);
    const l = rad(lo - lon0);
    const x = Math.cos(f) * Math.sin(l);
    const y = Math.cos(lat0) * Math.sin(f) - Math.sin(lat0) * Math.cos(f) * Math.cos(l);
    const z = Math.sin(lat0) * Math.sin(f) + Math.cos(lat0) * Math.cos(f) * Math.cos(l);
    return { p: [G[0] + R * x, G[1] - R * y], vis: z > 0 };
  };
  const tramo = (pts) => {
    const vis = pts.map(orto2).filter((q) => q.vis).map((q) => q.p);
    return vis.length > 1 ? vis : null;
  };
  out.push(rotulo(G[0], 34, 'EN EL GLOBO', { size: TXT.min, weight: 700, estilo: 'cap', color: T.apagado }));
  out.push(`<circle cx="${G[0]}" cy="${G[1]}" r="${R}" fill="${T.agua}" stroke="${T.tinta}" stroke-width="1.2"/>`);
  for (let lo = -180; lo < 180; lo += 20) {
    const pts = tramo(Array.from({ length: 37 }, (_, i) => [-90 + i * 5, lo]));
    if (pts) out.push(linC(pts, T.lineaAgua, 0.8));
  }
  for (let la = -60; la <= 80; la += 20) {
    const pts = tramo(Array.from({ length: 73 }, (_, i) => [la, -180 + i * 5]));
    if (pts) out.push(linC(pts, T.lineaAgua, la === 0 ? 1.2 : 0.7, la === 0 ? '' : ' stroke-dasharray="2 3"'));
  }
  out.push(`<g data-parte="loxo"${m.dim('loxo')}>${linC(tramo(loxo), T.magenta, wL)}</g>`);
  out.push(`<g data-parte="orto"${m.dim('orto')}>${linC(tramo(orto), T.tinta, wO, ' stroke-dasharray="7 4"')}</g>`);
  const gA = orto2(A).p;
  const gB = orto2(B).p;
  out.push(`<circle cx="${fx(gA[0])}" cy="${fx(gA[1])}" r="3.5" fill="${T.tinta}"/><circle cx="${fx(gB[0])}" cy="${fx(gB[1])}" r="3.5" fill="${T.tinta}"/>`);

  // --- carta Mercator (conforme: la misma escala en longitud y en latitud creciente)
  const X0 = 184;
  const X1 = 344;
  const Y0 = 52;
  const Y1 = 196;
  const lonA = -82;
  const lonB = 2;
  const k = (X1 - X0) / (lonB - lonA);
  const psiMid = (psi(38) + psi(56)) / 2;
  const yMid = (Y0 + Y1) / 2;
  const merc = ([la, lo]) => [X0 + (lo - lonA) * k, yMid - (psi(la) - psiMid) * k];
  out.push(rotulo((X0 + X1) / 2, 34, 'EN LA MERCATOR', { size: TXT.min, weight: 700, estilo: 'cap', color: T.apagado }));
  out.push(`<rect x="${X0}" y="${Y0}" width="${X1 - X0}" height="${Y1 - Y0}" fill="${T.agua}" stroke="${T.tinta}" stroke-width="1.2"/>`);
  for (let lo = -75; lo <= -15; lo += 15) {
    const x = merc([0, lo])[0];
    out.push(`<line x1="${fx(x)}" y1="${Y0}" x2="${fx(x)}" y2="${Y1}" stroke="${T.lineaAgua}" stroke-width=".8"/>`);
  }
  for (const la of [20, 30, 40, 50, 60]) {
    const y = merc([la, 0])[1];
    if (y > Y0 && y < Y1) out.push(`<line x1="${X0}" y1="${fx(y)}" x2="${X1}" y2="${fx(y)}" stroke="${T.lineaAgua}" stroke-width=".7" stroke-dasharray="2 3"/>`);
  }
  out.push(`<g data-parte="orto"${m.dim('orto')}>${linC(orto.map(merc), T.tinta, wO, ' stroke-dasharray="7 4"')}</g>`);
  const mA = merc(A);
  const mB = merc(B);
  out.push(`<g data-parte="loxo"${m.dim('loxo')}><line x1="${fx(mA[0])}" y1="${fx(mA[1])}" x2="${fx(mB[0])}" y2="${fx(mB[1])}" stroke="${T.magenta}" stroke-width="${wL}"/>`);
  // el mismo ángulo con cada meridiano que corta
  const rumbo = (Math.atan2(mB[0] - mA[0], -(mB[1] - mA[1])) * 180) / Math.PI;
  for (const lo of [-55, -25]) {
    const f = (lo - A[1]) / (B[1] - A[1]);
    const c = [mA[0] + f * (mB[0] - mA[0]), mA[1] + f * (mB[1] - mA[1])];
    out.push(`<path d="${arcoD(c[0], c[1], 14, 0, rumbo)}" fill="none" stroke="${T.magenta}" stroke-width="1.4"/>`);
    out.push(rotulo(c[0] - 5, c[1] - 6, 'α', { size: TXT.rotulo, weight: 700, estilo: 'serif', color: T.magenta, anchor: 'end' }));
  }
  out.push('</g>');
  out.push(`<circle cx="${fx(mA[0])}" cy="${fx(mA[1])}" r="3.5" fill="${T.tinta}"/><circle cx="${fx(mB[0])}" cy="${fx(mB[1])}" r="3.5" fill="${T.tinta}"/>`);
  out.push(rotulo(X0 + 4, Y1 + 16, 'salida', { size: TXT.min, estilo: 'serif', italic: true, anchor: 'start' }), rotulo(X1, Y1 + 16, 'llegada', { size: TXT.min, estilo: 'serif', italic: true, anchor: 'end' }));

  // --- leyenda
  out.push(`<line x1="14" y1="222" x2="${W - 14}" y2="222" stroke="${T.tinta}" stroke-width=".6"/>`);
  const y0 = 244;
  out.push(`<g data-parte="loxo"${m.dim('loxo')}><line x1="16" y1="${y0 - 4}" x2="40" y2="${y0 - 4}" stroke="${T.magenta}" stroke-width="2.2"/>` +
    rotulo(48, y0, 'Loxodrómica: rumbo constante', { size: TXT.nota, weight: 700, estilo: 'serif', anchor: 'start', color: T.magenta }) +
    rotulo(48, y0 + 16, 'el mismo ángulo con todos los meridianos;', { size: TXT.min + 0.5, estilo: 'serif', anchor: 'start' }) +
    rotulo(48, y0 + 31, 'en la Mercator es una recta.', { size: TXT.min + 0.5, estilo: 'serif', anchor: 'start' }) + '</g>');
  const y1 = y0 + 52;
  out.push(`<g data-parte="orto"${m.dim('orto')}><line x1="16" y1="${y1 - 4}" x2="40" y2="${y1 - 4}" stroke="${T.tinta}" stroke-width="2" stroke-dasharray="7 4"/>` +
    rotulo(48, y1, 'Ortodrómica: círculo máximo', { size: TXT.nota, weight: 700, estilo: 'serif', anchor: 'start' }) +
    rotulo(48, y1 + 16, 'la más corta, pero el rumbo cambia siempre.', { size: TXT.min + 0.5, estilo: 'serif', anchor: 'start' }) + '</g>');
  out.push(cierra());
  const cap = {
    loxo: 'La loxodrómica corta todos los meridianos con el mismo ángulo: es navegar a rumbo constante, y en la carta Mercator se dibuja como una recta. No es el camino más corto, pero en distancias cortas la diferencia es despreciable.',
    orto: 'La ortodrómica es el arco de círculo máximo entre los dos puntos: la distancia más corta. En la Mercator sale curvada hacia el polo y el rumbo cambia continuamente; en travesías oceánicas se sigue por tramos loxodrómicos.',
  };
  const lista = m.activo ? PARTES_LOXO.filter((p) => m.on(p)) : [];
  return {
    svg: out.join(''),
    caption: lista.length ? lista.map((p) => cap[p]).join(' ') : 'La misma travesía de dos maneras. La loxodrómica (roja, continua) mantiene el rumbo: corta todos los meridianos con el mismo ángulo y en la Mercator es una recta. La ortodrómica (azul, a trazos) es el arco de círculo máximo, la más corta, pero con el rumbo cambiando sin parar. En costa y en el examen se usa la loxodrómica.',
  };
}

// ---------------------------------------------------------------------------
// 2 y 3. XTE, VMG y ETA paso a paso (py-3-9) y carta raster frente a vectorial (py-3-10): en estilo C, en
// src/illustrations/electronica-c.js.
const PARTES_GNSS = ['xte', 'vmg', 'eta'];
const PARTES_CARTAS = ['raster', 'vectorial', 'sistemas'];

export const LAMINAS = {
  'loxo-orto': {
    fn: loxoOrto,
    params: { resaltar: PARTES_LOXO },
    ejemplo: { tipo: 'loxo-orto' },
  },
  'gnss-calculos': {
    fn: gnssCalculos,
    params: { dtg: 'distancia al WPT en millas (por defecto 18)', sog: 'nudos (por defecto 6)', hora: 'hora de la pantalla "10:20"', xte: 'error transversal en millas (por defecto 0,05)', banda: ['R', 'L'], angulo: 'grados entre COG y BRG (por defecto 20)', resaltar: PARTES_GNSS },
    ejemplo: { tipo: 'gnss-calculos' },
  },
  'carta-raster-vectorial': {
    fn: cartaRasterVectorial,
    params: { resaltar: PARTES_CARTAS },
    ejemplo: { tipo: 'carta-raster-vectorial' },
  },
};
