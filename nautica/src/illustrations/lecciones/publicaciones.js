// Láminas de la carta del Estrecho (per-11-1: coordenadas en los márgenes, rumbos y demoras con el transportador,
// «desde el faro» y «al faro») y de las publicaciones náuticas (py-3-7: cómo se lleva cada Aviso a los Navegantes
// a la carta y los radioavisos). Funciones puras spec → { svg, caption }; admiten `resaltar` (una parte o lista).

import { open, title, pol, arrow, deg3, fx } from '../kit.js';

/** Acentos que se adaptan al tema claro y oscuro. */
const K = { v: 'var(--l-v)', r: 'var(--l-r)', m: 'var(--l-m)', a: 'var(--l-a)', g: 'var(--l-g)', p: 'var(--l-p)' };
const col = (c) => K[c] ?? c ?? 'currentColor';
const nf = (n, d = 1) => (+n).toFixed(d).replace('.', ',');

/** Texto con halo del color del fondo (se lee aunque pase junto a una línea). */
function t(x, y, txt, { c = null, a = 'start', b = false, s = null, extra = '' } = {}) {
  return `<text x="${fx(x)}" y="${fx(y)}" class="il-lbl" text-anchor="${a}"${b ? ' font-weight="700"' : ''}${s ? ` font-size="${s}"` : ''} style="fill:${col(c)};paint-order:stroke;stroke:var(--bg);stroke-width:3px;stroke-linejoin:round" ${extra}>${txt}</text>`;
}
const seg = (p, q, c, w = 2, extra = '') => `<line x1="${fx(p[0])}" y1="${fx(p[1])}" x2="${fx(q[0])}" y2="${fx(q[1])}" style="stroke:${col(c)}" stroke-width="${w}" ${extra}/>`;
const punto = (p, c = null, r = 3.5) => `<circle cx="${fx(p[0])}" cy="${fx(p[1])}" r="${r}" style="fill:${col(c)}"/>`;
const faro = (p) => `<circle cx="${fx(p[0])}" cy="${fx(p[1])}" r="6.5" style="fill:var(--l-faro);stroke:currentColor" stroke-width="1.2"/><circle cx="${fx(p[0])}" cy="${fx(p[1])}" r="1.8" fill="currentColor"/>`;
/** Barco en planta, proa hacia `rumbo`. */
const barco = (p, rumbo = 0) => `<g transform="translate(${fx(p[0])} ${fx(p[1])}) rotate(${rumbo})"><path d="M0,-10 C4,-6 4.5,-1 4.5,3 L3.6,9 L-3.6,9 L-4.5,3 C-4.5,-1 -4,-6 0,-10Z" style="fill:var(--l-casco);stroke:currentColor" stroke-width="1.2"/></g>`;
/** Arco de a1 a a2 (rumbos náuticos, sentido horario) alrededor de c. */
function arco(c, r, a1, a2, color, w = 1.6, extra = '') {
  const d = ((a2 - a1) % 360 + 360) % 360;
  const p1 = pol(c[0], c[1], a1, r);
  const p2 = pol(c[0], c[1], a1 + d, r);
  return `<path d="M${fx(p1[0])},${fx(p1[1])} A${r},${r} 0 ${d > 180 ? 1 : 0} 1 ${fx(p2[0])},${fx(p2[1])}" fill="none" style="stroke:${col(color)}" stroke-width="${w}" ${extra}/>`;
}

/** Partes resaltadas: on(p) dice si se dibuja fuerte; dim(p) atenúa lo que no está resaltado. */
function marcas(spec, validas) {
  const r = spec.resaltar;
  const s = r == null || r === '' ? null : new Set([].concat(r));
  if (s && [...s].some((p) => !validas.includes(p))) return null;
  return { activo: !!s, on: (p) => !!s && s.has(p), dim: (p) => (s && !s.has(p) ? ' opacity=".3"' : '') };
}

// ---------------------------------------------------------------------------
// Coordenadas en los márgenes de la carta. spec: { tipo:'carta-margenes', resaltar?: 'latitud'|'longitud'|'divisiones' }
// Punto de la lección: 36° 07,3′ N, 005° 58,6′ W. Cada minuto de la escala, en cinco partes de 0,2′.

const MARGENES_PARTES = ['latitud', 'longitud', 'divisiones'];

export function cartaMargenesIllustration(spec = {}) {
  const m = marcas(spec, MARGENES_PARTES);
  if (!m) return null;
  const W = 320;
  const H = 300;
  const id = 'cmg';
  const out = open(W, H, 'Coordenadas en los márgenes de la carta', id);
  out.push(title(160, 'Coordenadas en los márgenes'));
  const x0 = 58;
  const x1 = 296;
  const y0 = 54;
  const y1 = 214;
  const bw = 7;
  const pLat = 40; // px por minuto de latitud
  const pLon = pLat * Math.cos((36.1 * Math.PI) / 180); // px por minuto de longitud (más corto)
  const latMin = 5; // 36° 05′ abajo
  const lonDer = 55.5; // 005° 55,5′ W en el borde derecho
  const yLat = (min) => y1 - (min - latMin) * pLat;
  const xLon = (min) => x1 - (min - lonDer) * pLon; // la longitud W crece hacia la izquierda
  const P = [xLon(58.6), yLat(7.3)];
  out.push(`<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" style="fill:var(--l-mar);stroke:currentColor" stroke-width="1.2"/>`);
  // escalas: cada minuto en cinco partes de 0,2′ alternas
  const lat = m.dim('latitud');
  const lon = m.dim('longitud');
  const banda = (k) => (k % 2 ? 'var(--bg)' : 'currentColor');
  let sLat = '';
  for (let k = 0; k < 20; k++) {
    const yb = y1 - (k + 1) * (pLat / 5);
    sLat += `<rect x="${x0 - bw}" y="${fx(yb)}" width="${bw}" height="${fx(pLat / 5)}" style="fill:${banda(k)};stroke:currentColor" stroke-width=".5"/>`;
    sLat += `<rect x="${x1}" y="${fx(yb)}" width="${bw}" height="${fx(pLat / 5)}" style="fill:${banda(k)};stroke:currentColor" stroke-width=".5"/>`;
  }
  let sLon = '';
  for (let k = 0; ; k++) {
    const xa = x1 - k * (pLon / 5);
    if (xa <= x0 + 0.1) break;
    const w = Math.min(pLon / 5, xa - x0);
    const kk = Math.floor((lonDer + k * 0.2) / 0.2 + 1e-6);
    sLon += `<rect x="${fx(xa - w)}" y="${y0 - bw}" width="${fx(w)}" height="${bw}" style="fill:${banda(kk)};stroke:currentColor" stroke-width=".5"/>`;
    sLon += `<rect x="${fx(xa - w)}" y="${y1}" width="${fx(w)}" height="${bw}" style="fill:${banda(kk)};stroke:currentColor" stroke-width=".5"/>`;
  }
  out.push(`<g${lat}>${sLat}</g>`, `<g${lon}>${sLon}</g>`);
  // rótulos de las escalas
  for (let k = 5; k <= 9; k++) out.push(`<g${lat}>${t(x0 - bw - 3, yLat(k) + 3.5, `36°0${k}′`, { a: 'end', s: 9 })}</g>`);
  const rLon = { 56: '5°56′', 57: '57′', 58: '58′', 59: '59′', 60: '6°00′', 61: '01′', 62: '02′' };
  for (const [k, txt] of Object.entries(rLon)) out.push(`<g${lon}>${t(xLon(+k), y0 - bw - 4, txt, { a: 'middle', s: 9 })}</g>`);
  // paralelo y meridiano del punto, hasta los márgenes
  const wl = m.on('latitud') ? 2.6 : 1.8;
  const wn = m.on('longitud') ? 2.6 : 1.8;
  out.push(`<g${lat}>${seg(P, [x0 - bw, P[1]], 'r', wl, 'stroke-dasharray="5 3"')}<path d="M${x0 - bw - 2},${fx(P[1])} l-7,-5 v10z" style="fill:${K.r}"/>${t(x0 + 6, P[1] - 7, '36° 07,3′ N', { c: 'r', b: true, s: 11 })}</g>`);
  out.push(`<g${lon}>${seg(P, [P[0], y0 - bw], 'v', wn, 'stroke-dasharray="5 3"')}${t(P[0] + 6, y0 + 16, '005° 58,6′ W', { c: 'v', b: true, s: 11 })}</g>`);
  out.push(punto(P, null, 4), t(P[0] + 7, P[1] + 14, 'P', { b: true, s: 11 }));
  // sentidos
  out.push(`<g${lon}>${arrow(x0 + 52, y1 - 12, x0 + 10, y1 - 12, 'v', id, 1.6)}${t(x0 + 58, y1 - 8, 'longitud W: crece a la izquierda', { c: 'v', s: 9.5 })}</g>`);
  out.push(`<g${lat}>${arrow(x0 + 12, y1 - 28, x0 + 12, y1 - 56, 'r', id, 1.6)}${t(x0 + 20, y1 - 38, 'latitud N: crece hacia arriba', { c: 'r', s: 9.5 })}</g>`);
  // un minuto de la escala, ampliado
  const d = m.dim('divisiones');
  const zx = 44;
  const zw = 232;
  const zy = 262;
  let z = `<line x1="14" y1="230" x2="${W - 14}" y2="230" style="stroke:${K.g}" stroke-width=".8"/>`;
  z += t(14, 246, `<tspan font-weight="700">Un minuto, ampliado:</tspan> <tspan${m.on('divisiones') ? ` font-weight="700" style="fill:${K.r}"` : ''}>cinco partes de 0,2′</tspan>`);
  for (let k = 0; k < 5; k++) z += `<rect x="${fx(zx + (k * zw) / 5)}" y="${zy}" width="${fx(zw / 5)}" height="10" style="fill:${banda(k)};stroke:currentColor" stroke-width=".8"/>`;
  z += t(zx, zy + 24, '07′', { a: 'middle', b: true }) + t(zx + zw, zy + 24, '08′', { a: 'middle', b: true });
  z += t(zx + zw / 10, zy - 4, '0,2′', { a: 'middle', s: 9 });
  const x73 = zx + 0.3 * zw;
  z += `<path d="M${fx(x73)},${zy - 1} l-5,-8 h10z" style="fill:${K.r}"/>` + t(x73 + 8, zy + 24, '07,3′', { c: 'r', b: true, s: 11 });
  out.push(`<g${d}>${z}</g>`);
  out.push('</svg>');
  const cap = {
    latitud: 'La latitud se lee en los márgenes izquierdo y derecho: llevas el paralelo del punto hasta la escala. En esta carta siempre es N.',
    longitud: 'La longitud se lee en los márgenes de arriba y de abajo: llevas el meridiano del punto hasta la escala. Aquí siempre es W y crece hacia la izquierda.',
    divisiones: 'Cada minuto de la escala está dividido en cinco partes de 0,2′: 07,3′ cae a mitad de la segunda parte pasado el 07′.',
  };
  const sel = MARGENES_PARTES.filter((p) => m.on(p));
  return {
    svg: out.join(''),
    caption: sel.length === 1 ? cap[sel[0]] : 'El paralelo del punto, llevado al margen lateral, da la latitud (N); su meridiano, llevado al margen de arriba o de abajo, da la longitud (W, crece hacia la izquierda). Cada minuto está dividido en cinco partes de 0,2′: P está en 36° 07,3′ N, 005° 58,6′ W.',
  };
}

// ---------------------------------------------------------------------------
// Transportador. spec: { tipo:'transportador', caso:'rumbo'|'faro', rv?: 0–359 (rumbo; por defecto 75), dv?: 0–359 (faro; por defecto 310) }

export function transportadorIllustration(spec = {}) {
  const caso = spec.caso ?? 'rumbo';
  if (caso === 'faro') return faroIllustration(spec);
  if (caso !== 'rumbo') return null;
  const rv = ((Math.round(+(spec.rv ?? 75)) % 360) + 360) % 360;
  if (!Number.isFinite(rv)) return null;
  const W = 320;
  const H = 318;
  const id = 'trp';
  const out = open(W, H, 'Medir un rumbo con el transportador', id);
  out.push(title(160, 'Un rumbo con el transportador'));
  // carta
  out.push(`<rect x="14" y="34" width="${W - 28}" height="200" rx="4" style="fill:var(--l-mar);stroke:currentColor" stroke-width="1"/>`);
  const A = [160, 134];
  const R = 74;
  // meridiano por A
  out.push(seg([A[0], 36], [A[0], 232], 'currentColor', 1.2, 'stroke-dasharray="5 3"'));
  // transportador circular centrado en A, con el norte paralelo al meridiano
  out.push(`<circle cx="${A[0]}" cy="${A[1]}" r="${R}" style="fill:var(--l-cielo);stroke:currentColor" stroke-width="1.4" fill-opacity=".75"/>`);
  out.push(`<circle cx="${A[0]}" cy="${A[1]}" r="${R - 22}" fill="none" style="stroke:currentColor" stroke-width=".6" opacity=".5"/>`);
  for (let a = 0; a < 360; a += 5) {
    const l = a % 30 === 0 ? 10 : a % 10 === 0 ? 7 : 4;
    out.push(seg(pol(A[0], A[1], a, R), pol(A[0], A[1], a, R - l), 'currentColor', a % 30 === 0 ? 1.2 : 0.7));
  }
  for (let a = 0; a < 360; a += 30) {
    const dd = Math.min(Math.abs(a - rv), 360 - Math.abs(a - rv));
    if (dd < 11 || a === 0) continue;
    const q = pol(A[0], A[1], a, R - 17);
    out.push(t(q[0], q[1] + 3.2, deg3(a), { a: 'middle', s: 8.5 }));
  }
  // rumbo de A (salida) a B (llegada)
  const B = pol(A[0], A[1], rv, 124);
  const Bc = [Math.min(Math.max(B[0], 30), W - 30), Math.min(Math.max(B[1], 46), 222)];
  const Bf = (() => { // recorta B dentro de la carta sobre la misma línea
    const k = Math.min(1, ...[[B[0], Bc[0], A[0]], [B[1], Bc[1], A[1]]].map(([b, c, a]) => (b === a ? 1 : (c - a) / (b - a))));
    return [A[0] + (B[0] - A[0]) * k, A[1] + (B[1] - A[1]) * k];
  })();
  out.push(arco(A, 26, 0, rv, 'r', 2.2));
  out.push(seg(A, Bf, 'r', 2.6));
  // norte del transportador
  out.push(arrow(A[0], A[1] - R + 12, A[0], A[1] - R - 12, 'g', id, 1.6));
  const arriba = rv > 20 && rv < 340; // la nota del meridiano, donde no esté la línea
  out.push(t(A[0] + 5, arriba ? 46 : 228, '000° ∥ meridiano', { s: 9.5, b: true }));
  out.push(punto(A, null, 3.6), punto(Bf, 'r', 4));
  const lado = rv > 180 ? 1 : -1; // etiquetas al lado contrario de la línea
  out.push(t(A[0] + lado * 8, A[1] + 16, 'A salida', { a: lado > 0 ? 'start' : 'end', b: true, s: 10 }));
  // B: etiqueta al lado antihorario de la línea; la lectura, al lado horario, junto al corte
  const nl = pol(0, 0, rv - 90, 1);
  const anc = (x) => (x > 0.35 ? 'start' : x < -0.35 ? 'end' : 'middle');
  out.push(t(Bf[0] + nl[0] * 12, Bf[1] + nl[1] * 12 + 4, 'B llegada', { a: anc(nl[0]), b: true, c: 'r', s: 10 }));
  const corte = pol(A[0], A[1], rv, R);
  out.push(`<circle cx="${fx(corte[0])}" cy="${fx(corte[1])}" r="5" fill="none" style="stroke:${K.r}" stroke-width="2"/>`);
  const lec = pol(A[0], A[1], rv + 13, R + 13);
  const dl = pol(0, 0, rv + 13, 1);
  out.push(t(lec[0], lec[1] + 4 + (dl[1] > 0.6 ? 6 : 0), deg3(rv), { a: anc(dl[0]), b: true, c: 'r', s: 12 }));
  // pasos
  const y = 252;
  out.push(t(14, y, '1', { b: true, c: 'r' }), t(26, y, 'Centro del transportador en el punto de origen.'));
  out.push(t(14, y + 14, '2', { b: true, c: 'r' }), t(26, y + 14, 'Su norte arriba, paralelo a un meridiano.'));
  out.push(t(14, y + 28, '3', { b: true, c: 'r' }), t(26, y + 28, `Lee donde corta la línea: Rv = ${deg3(rv)} (000°–359°).`, { b: true }));
  out.push(t(14, y + 44, 'Rumbo: de la salida a la llegada. Demora: del barco', { s: 9.5, c: 'g' }), t(14, y + 57, 'al objeto. Lo que lees es verdadero (Rv, Dv).', { s: 9.5, c: 'g' }));
  out.push('</svg>');
  return { svg: out.join(''), caption: `Con el transportador centrado en el punto de salida y su norte paralelo al meridiano, el rumbo se lee donde la línea corta la graduación, de 000° a 359° en el sentido de las agujas del reloj: aquí, Rv ${deg3(rv)}. Lo que se mide en la carta es siempre verdadero.` };
}

/** Rótulo a 32 px de p hacia el rumbo `hacia` (el lado libre). */
function rotulo(p, hacia, txt) {
  const q = pol(p[0], p[1], hacia, 32);
  const d = pol(0, 0, hacia, 1);
  return t(q[0], q[1] + 3.5 + (d[1] > 0.6 ? 3 : 0), txt, { s: 9, a: d[0] > 0.35 ? 'start' : d[0] < -0.35 ? 'end' : 'middle' });
}

function faroIllustration(spec) {
  const dv = ((Math.round(+(spec.dv ?? 310)) % 360) + 360) % 360;
  if (!Number.isFinite(dv)) return null;
  const op = (dv + 180) % 360;
  const W = 320;
  const H = 278;
  const id = 'trf';
  const out = open(W, H, 'Demora desde el faro y demora al faro', id);
  out.push(title(160, `Demora ${deg3(dv)}: ¿desde el faro o al faro?`));
  out.push(`<line x1="160" y1="34" x2="160" y2="222" style="stroke:${K.g}" stroke-width=".8"/>`);
  const L = 52;
  const panel = (cx, cy, rumboBarco, cab1, cab2) => {
    const F = [cx, cy];
    const Bq = pol(cx, cy, rumboBarco, L);
    const s = [];
    s.push(t(cx, 44, cab1, { a: 'middle', b: true }), t(cx, 57, cab2, { a: 'middle', b: true, c: 'r' }));
    s.push(seg([cx, cy + 22], [cx, cy - 46], 'g', 1, 'stroke-dasharray="4 3"'), arrow(cx, cy - 34, cx, cy - 48, 'g', id, 1.4));
    s.push(t(cx + 5, cy - 42, 'N', { c: 'g', s: 9, b: true }));
    return { F, Bq, s };
  };
  // izquierda: «estamos en demora dv desde el faro» → desde el faro se traza dv
  const yc = 132;
  const a = panel(80, yc, dv, `Demora ${deg3(dv)}`, 'desde el faro');
  a.s.push(arrow(a.F[0], a.F[1], ...pol(a.F[0], a.F[1], dv, L - 12), 'r', id, 2.4));
  a.s.push(arco(a.F, 20, 0, dv, 'r', 1.6), faro(a.F), barco(a.Bq, dv));
  const la = pol(a.F[0], a.F[1], dv + (dv > 180 ? 22 : -22), L * 0.62);
  a.s.push(t(la[0], la[1] + 4, deg3(dv), { a: 'middle', c: 'r', b: true, s: 11 }));
  a.s.push(rotulo(a.F, op, 'faro'));
  // derecha: «tomamos demora dv al faro» → el barco está hacia el opuesto
  const b = panel(240, yc, op, `Demora ${deg3(dv)}`, 'al faro');
  b.s.push(arrow(b.Bq[0], b.Bq[1], ...pol(b.F[0], b.F[1], op, 12), 'r', id, 2.4));
  b.s.push(arco(b.F, 20, 0, op, 'v', 1.4, 'stroke-dasharray="3 2"'), faro(b.F), barco(b.Bq, dv));
  const lb = pol(b.F[0], b.F[1], op + (op > 180 ? -26 : 26), L * 0.6);
  b.s.push(t(lb[0], lb[1] + 4, deg3(dv), { a: 'middle', c: 'r', b: true, s: 11 }));
  const lv = pol(b.F[0], b.F[1], op + (op > 180 ? 26 : -26), L * 0.72);
  b.s.push(t(lv[0], lv[1] + 4, deg3(op), { a: 'middle', c: 'v', b: true, s: 10 }));
  b.s.push(rotulo(b.F, dv, 'faro'));
  out.push(...a.s, ...b.s);
  out.push(t(80, 206, 'Trazas el ' + deg3(dv), { a: 'middle', b: true }), t(80, 219, 'desde el faro.', { a: 'middle' }));
  out.push(t(240, 206, 'Ves el faro al ' + deg3(dv) + ':', { a: 'middle', b: true }), t(240, 219, `estás al ${deg3(op)} del faro.`, { a: 'middle', c: 'v', b: true }));
  out.push(`<line x1="14" y1="232" x2="${W - 14}" y2="232" style="stroke:${K.g}" stroke-width=".8"/>`);
  out.push(t(14, 250, '«Al Sur verdadero del faro»: desde el faro trazas', { b: true }));
  out.push(t(14, 264, 'el 180°; desde el barco ves el faro en Dv 000°.'));
  out.push('</svg>');
  return { svg: out.join(''), caption: `«Demora ${deg3(dv)} desde el faro»: trazas el ${deg3(dv)} desde el faro y el barco está en esa línea. «Demora ${deg3(dv)} al faro»: desde el barco ves el faro al ${deg3(dv)}, así que el barco está hacia el ${deg3(op)} del faro.` };
}

// ---------------------------------------------------------------------------
// Avisos a los Navegantes y radioavisos. spec: { tipo:'avisos-navegantes', vista:'correccion'|'radioavisos', resaltar? }

const AVISOS_PARTES = ['permanentes', 'temporales', 'preliminares', 'generales', 'margen'];
const RADIO_PARTES = ['navarea', 'navtex', 'vhf'];

/** Lápiz (para anotar y borrar) o pluma (tinta), de unos 34 px, inclinado. */
function lapiz(x, y) {
  return `<g transform="translate(${x} ${y}) rotate(-35)"><rect x="0" y="-3.5" width="24" height="7" style="fill:var(--l-a);stroke:currentColor" stroke-width=".9"/><rect x="24" y="-3.5" width="5" height="7" style="fill:var(--l-roja);stroke:currentColor" stroke-width=".9"/><path d="M0,-3.5 L-8,0 L0,3.5Z" style="fill:var(--l-casco);stroke:currentColor" stroke-width=".9"/><path d="M-5.3,-1.2 L-8,0 L-5.3,1.2Z" fill="currentColor"/></g>`;
}
function pluma(x, y) {
  return `<g transform="translate(${x} ${y}) rotate(-35)"><rect x="2" y="-3.8" width="27" height="7.6" rx="2" style="fill:var(--l-v);stroke:currentColor" stroke-width=".9"/><path d="M2,-3.8 L-9,0 L2,3.8Z" fill="currentColor"/></g>`;
}

export function avisosNavegantesIllustration(spec = {}) {
  const vista = spec.vista ?? 'correccion';
  if (vista === 'radioavisos') return radioavisosIllustration(spec);
  if (vista !== 'correccion') return null;
  const m = marcas(spec, AVISOS_PARTES);
  if (!m) return null;
  const W = 320;
  const H = 304;
  const id = 'avn';
  const out = open(W, H, 'Avisos a los Navegantes: cómo se corrige la carta', id);
  out.push(title(160, 'Cada aviso, en la carta'));
  const filas = [
    ['permanentes', 'Permanentes', 'Con tinta indeleble', 'cambio definitivo', 'tinta'],
    ['temporales', 'Temporales', 'A lápiz', 'se borran al cancelarse', 'lapiz'],
    ['preliminares', 'Preliminares', 'A lápiz', 'anuncian un cambio que llegará', 'lapiz'],
    ['generales', 'Generales', 'No corrigen cartas', 'información general', 'no'],
  ];
  filas.forEach(([k, nombre, como, nota, ic], i) => {
    const y = 38 + i * 42;
    const on = m.on(k);
    const s = [];
    s.push(`<rect x="14" y="${y}" width="80" height="32" rx="6" style="fill:${on ? 'var(--l-cielo)' : 'var(--l-fondo)'};stroke:${on ? K.r : 'currentColor'}" stroke-width="${on ? 2.4 : 1}"/>`);
    s.push(t(54, y + 20, nombre, { a: 'middle', b: true, s: 10.5 }));
    if (ic === 'tinta') s.push(pluma(110, y + 22), `<line x1="132" y1="${y + 26}" x2="144" y2="${y + 26}" style="stroke:currentColor" stroke-width="3"/>`);
    if (ic === 'lapiz') s.push(lapiz(110, y + 22), `<line x1="132" y1="${y + 26}" x2="144" y2="${y + 26}" style="stroke:${K.g}" stroke-width="1.6" stroke-dasharray="3 2"/>`);
    if (ic === 'no') s.push(`<rect x="106" y="${y + 6}" width="26" height="20" rx="2" style="fill:var(--l-mar);stroke:currentColor" stroke-width="1"/>`, seg([102, y + 2], [136, y + 30], 'r', 2.4), seg([136, y + 2], [102, y + 30], 'r', 2.4));
    s.push(t(152, y + 13, como, { b: true, s: 11, c: ic === 'tinta' ? null : ic === 'no' ? 'r' : null }));
    s.push(t(152, y + 27, nota, { s: 9 }));
    out.push(`<g${m.dim(k)}>${s.join('')}</g>`);
  });
  // la carta y su margen inferior
  const yc = 214;
  const s = [];
  s.push(`<rect x="14" y="${yc}" width="${W - 28}" height="50" style="fill:var(--l-mar);stroke:currentColor" stroke-width="1"/>`);
  s.push(`<path d="M14,${yc} L120,${yc} C104,${yc + 14} 72,${yc + 16} 54,${yc + 30} C40,${yc + 40} 26,${yc + 38} 14,${yc + 44}Z" style="fill:var(--land);stroke:var(--land-stroke)" stroke-width="1"/>`);
  // recorte gráfico pegado encima
  s.push(`<rect x="196" y="${yc + 8}" width="62" height="34" style="fill:var(--l-fondo);stroke:currentColor" stroke-width="1.2" stroke-dasharray="4 2"/>`);
  s.push(t(227, yc + 22, 'recorte', { a: 'middle', s: 9.5, b: true }), t(227, yc + 35, 'gráfico', { a: 'middle', s: 9.5, b: true }));
  s.push(`<rect x="14" y="${yc + 50}" width="${W - 28}" height="16" style="fill:var(--bg);stroke:${m.on('margen') ? K.r : 'currentColor'}" stroke-width="${m.on('margen') ? 2.4 : 1}"/>`);
  s.push(t(20, yc + 61.5, 'Correcciones: nº/año · nº/año · …', { s: 9.5, b: true }));
  s.push(t(W - 18, yc + 84, 'margen inferior: número y año de cada corrección', { a: 'end', s: 9.5, c: m.on('margen') ? 'r' : null, b: m.on('margen') }));
  out.push(`<g${m.dim('margen')}>${s.join('')}</g>`);
  out.push('</svg>');
  const cap = {
    permanentes: 'Los avisos permanentes son cambios definitivos: se pasan a la carta con tinta indeleble.',
    temporales: 'Los temporales (una luz apagada, unas obras) se anotan a lápiz y se borran al cancelarse.',
    preliminares: 'Los preliminares anuncian un cambio que llegará: también se anotan a lápiz.',
    generales: 'Los avisos generales son información general: no corrigen cartas.',
    margen: 'Cada corrección se registra con su número y año en el margen inferior de la carta. Si una zona pequeña cambia mucho, el aviso trae un recorte gráfico que se pega encima.',
  };
  const sel = AVISOS_PARTES.filter((p) => m.on(p));
  return {
    svg: out.join(''),
    caption: sel.length === 1 ? cap[sel[0]] : 'Permanentes, con tinta indeleble; temporales y preliminares, a lápiz; los generales no corrigen cartas. Cada corrección se apunta con su número y año en el margen inferior, y si una zona cambia mucho se pega el recorte gráfico del aviso.',
  };
}

function radioavisosIllustration(spec) {
  const m = marcas(spec, RADIO_PARTES);
  if (!m) return null;
  const W = 320;
  const H = 304;
  const id = 'rda';
  const out = open(W, H, 'Avisos a los Navegantes y radioavisos', id);
  out.push(title(160, 'Avisos semanales y radioavisos'));
  // dos cajas: lo que puede esperar y lo urgente
  const caja = (x, w, cab, lineas, c) => {
    const s = [`<rect x="${x}" y="34" width="${w}" height="82" rx="6" style="fill:var(--l-fondo);stroke:${col(c)}" stroke-width="1.6"/>`];
    s.push(t(x + w / 2, 50, cab, { a: 'middle', b: true, c, s: 10.5 }));
    lineas.forEach(([txt, b], i) => s.push(t(x + 7, 66 + i * 13, txt, { s: 9.5, b })));
    return s.join('');
  };
  out.push(caja(14, 152, 'Avisos a los Navegantes', [['Boletín del IHM:', true], ['cada semana y gratis.', false], ['Mantienen al día las', false], ['cartas y publicaciones.', true]], 'v'));
  out.push(caja(172, 134, 'Radioavisos', [['Lo urgente, por radio', true], ['no espera al boletín.', false], ['Se anuncian con', false], ['SÉCURITÉ (seguridad)', true]], 'r'));
  // tres niveles de radioaviso, de mayor a menor alcance
  const filas = [
    ['navarea', 'NAVAREA', 'por satélite', ['21 zonas. España coordina la III', '(Mediterráneo y mar Negro); el', 'Atlántico, la II (Francia).'], 26],
    ['navtex', 'Costeros', 'NAVTEX', ['518 kHz en inglés, 490 kHz en español.', 'En España, Salvamento Marítimo.'], 17],
    ['vhf', 'Locales', 'VHF', ['En los puertos y sus proximidades.'], 9],
  ];
  let y = 132;
  filas.forEach(([k, nom, via, lineas, r]) => {
    const on = m.on(k);
    const h = 24 + lineas.length * 13;
    const s = [];
    s.push(`<rect x="14" y="${y}" width="${W - 28}" height="${h}" rx="6" style="fill:${on ? 'var(--l-cielo)' : 'none'};stroke:${on ? K.r : K.g}" stroke-width="${on ? 2.4 : 1}"/>`);
    // alcance: círculos concéntricos, el de la fila más marcado
    const cx = 44;
    const cy = y + h / 2;
    for (const rr of [9, 17, 26]) if (rr <= h / 2 + 2) s.push(`<circle cx="${cx}" cy="${fx(cy)}" r="${rr}" fill="none" style="stroke:${rr === r ? K.r : K.g}" stroke-width="${rr === r ? 2.2 : 0.8}"/>`);
    s.push(`<circle cx="${cx}" cy="${fx(cy)}" r="2.5" fill="currentColor"/>`);
    s.push(t(80, y + 16, `${nom} <tspan style="fill:${K.r}">· ${via}</tspan>`, { b: true, s: 11 }));
    lineas.forEach((l, i) => s.push(t(80, y + 31 + i * 13, l, { s: 9.5 })));
    out.push(`<g${m.dim(k)}>${s.join('')}</g>`);
    y += h + 6;
  });
  out.push('</svg>');
  const cap = {
    navarea: 'NAVAREA: radioavisos por satélite. El mundo se divide en 21 zonas; España coordina la III (Mediterráneo y mar Negro) y la costa atlántica está en la II, que coordina Francia.',
    navtex: 'Radioavisos costeros por NAVTEX: 518 kHz en inglés y 490 kHz en español. En España los emite Salvamento Marítimo.',
    vhf: 'Radioavisos locales: por VHF, en los puertos y sus proximidades.',
  };
  const sel = RADIO_PARTES.filter((p) => m.on(p));
  return {
    svg: out.join(''),
    caption: sel.length === 1 ? cap[sel[0]] : 'Los Avisos a los Navegantes son el boletín semanal del IHM que mantiene al día cartas y publicaciones. Lo urgente no espera: va por radioaviso, NAVAREA por satélite, costeros por NAVTEX y locales por VHF, anunciados con la palabra SÉCURITÉ.',
  };
}

// ---------------------------------------------------------------------------

export const LAMINAS = {
  'carta-margenes': {
    fn: cartaMargenesIllustration,
    params: { resaltar: MARGENES_PARTES },
    ejemplo: { tipo: 'carta-margenes' },
  },
  transportador: {
    fn: transportadorIllustration,
    params: { caso: ['rumbo', 'faro'], rv: 'rumbo: Rv a medir, 0–359 (por defecto 75)', dv: 'faro: demora del enunciado, 0–359 (por defecto 310)' },
    ejemplo: { tipo: 'transportador', caso: 'rumbo' },
  },
  'avisos-navegantes': {
    fn: avisosNavegantesIllustration,
    params: { vista: ['correccion', 'radioavisos'], resaltar: [...AVISOS_PARTES, ...RADIO_PARTES] },
    ejemplo: { tipo: 'avisos-navegantes', vista: 'correccion' },
  },
};
