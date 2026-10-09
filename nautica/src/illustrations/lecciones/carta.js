// Láminas de problemas de carta: situación de estima (per-11-4), traslado de una demora no simultánea (per-11-8),
// rumbo tangente para pasar a una distancia de un faro (per-11-9), siglas del GNSS en una ruta (py-3-9) y
// corriente desconocida (py-4-8). Cada una sigue el «método paso a paso» de su lección y usa sus cifras.
// Funciones puras spec → { svg, caption }. Admiten `resaltar` (una parte o lista) para destacar la que trata cada paso.

import { C, open, title, pol, bearing, arrow, deg3, fx } from '../kit.js';
import { T, lienzo, flecha, rosaNorte, tierra, junto as juntoC, colocaEtiquetas } from '../estilo-c.js';
import { faro as faroC, situacion, estima as estimaC, filaPaso, alrededor } from '../carta-c.js';
import { gnssC } from '../electronica-c.js';

const nf = (n, d = 1) => (+n).toFixed(d).replace('.', ',');
const col = (c) => C[c] ?? c;

/** Partes resaltadas: on(p) dice si se dibuja fuerte; dim(p) atenúa lo que no está resaltado. */
function marcas(spec) {
  const r = spec.resaltar;
  const s = r == null || r === '' ? null : new Set([].concat(r));
  return {
    activo: !!s,
    on: (p) => !!s && s.has(p),
    dim: (p) => (s && !s.has(p) ? ' opacity=".35"' : ''),
  };
}

/** Texto con halo del color del fondo (se lee aunque cruce una línea). */
function t(x, y, txt, { c = null, a = 'start', b = false, s = null, extra = '' } = {}) {
  const fill = c ? col(c) : 'currentColor';
  return `<text x="${fx(x)}" y="${fx(y)}" class="il-lbl" text-anchor="${a}"${b ? ' font-weight="700"' : ''}${s ? ` font-size="${s}"` : ''} style="fill:${fill};paint-order:stroke;stroke:var(--bg);stroke-width:3px;stroke-linejoin:round" ${extra}>${txt}</text>`;
}
const seg = (p, q, c, w = 2, extra = '') => `<line x1="${fx(p[0])}" y1="${fx(p[1])}" x2="${fx(q[0])}" y2="${fx(q[1])}" stroke="${col(c)}" stroke-width="${w}" ${extra}/>`;
const faro = (p, extra = '') => `<g${extra}><circle cx="${fx(p[0])}" cy="${fx(p[1])}" r="6" style="fill:var(--l-faro);stroke:currentColor" stroke-width="1.2"/><circle cx="${fx(p[0])}" cy="${fx(p[1])}" r="1.8" fill="currentColor"/></g>`;
const punto = (p, c = 'currentColor', r = 4) => `<circle cx="${fx(p[0])}" cy="${fx(p[1])}" r="${r}" fill="${col(c)}"/>`;
/** Situación observada: círculo con punto. Situación de estima: triángulo. */
const obs = (p, c = 'r', w = 2) => `<circle cx="${fx(p[0])}" cy="${fx(p[1])}" r="7" fill="none" stroke="${col(c)}" stroke-width="${w}"/>${punto(p, c, 2.5)}`;
const tri = (p, c = 'v', w = 2) => `<path d="M${fx(p[0])},${fx(p[1] - 8)} L${fx(p[0] + 7)},${fx(p[1] + 5)} L${fx(p[0] - 7)},${fx(p[1] + 5)}Z" fill="none" stroke="${col(c)}" stroke-width="${w}"/>${punto(p, c, 2)}`;
const norte = (x, y, len = 26) => `${arrow(x, y + len / 2, x, y - len / 2, 'g', NID, 1.6)}${t(x, y - len / 2 - 4, 'Nv', { c: 'g', a: 'middle', s: 9 })}`;
let NID = 'x';
/** Corte de las rectas p + s·u y q + r·v. */
function corte(p, u, q, v) {
  const den = u[0] * v[1] - u[1] * v[0];
  if (Math.abs(den) < 1e-9) return null;
  const s = ((q[0] - p[0]) * v[1] - (q[1] - p[1]) * v[0]) / den;
  return [p[0] + u[0] * s, p[1] + u[1] * s];
}
const dir = (p, q) => { const d = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1; return [(q[0] - p[0]) / d, (q[1] - p[1]) / d]; };
const mas = (p, u, k) => [p[0] + u[0] * k, p[1] + u[1] * k];
const hora = (h) => { const [a, b] = String(h).split(':').map(Number); return a * 60 + (b || 0); };
/** x centrada de una etiqueta de n caracteres, sin salirse del panel. */
const cx = (x, n, sz = 10) => Math.min(Math.max(x, 12 + n * sz * 0.29), 308 - n * sz * 0.29);
/** Etiqueta junto a p, desplazada k px en la dirección unitaria n (ancla según hacia dónde se aparta). */
const junto = (p, n, k, txt, o = {}) => {
  const q = mas(p, n, k);
  const a = n[0] > 0.4 ? 'start' : n[0] < -0.4 ? 'end' : 'middle';
  return t(q[0], q[1] + 3.5 + (n[1] > 0.6 ? 5 : 0) - (n[1] < -0.6 ? 2 : 0), txt, { ...o, a });
};
/** Distancia de p al segmento ab. */
function aSeg(p, a, b) {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const k = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(p[0] - a[0] - k * dx, p[1] - a[1] - k * dy);
}
/** Primer hueco libre para la flecha del norte, lejos de los segmentos dados. */
const hueco = (cands, segs, min = 44) => cands.find((c) => segs.every(([a, b]) => aSeg(c, a, b) > min)) ?? cands[0];
const hm = (min) => `${Math.floor(min / 60)} h${min % 60 ? ` ${min % 60} min` : ''}`;

// ---------------------------------------------------------------------------
// 1. Situación de estima (per-11-4). spec: { tipo:'estima', ra?, ct?, rv?, v, hi, hf, resaltar? }
// Por defecto, las cifras de la lección: Ra 297° con Ct −3° (Rv 294°) y de 18:20 a 20:35 a 6 nudos (13,5 millas).

function estima(spec = {}) {
  NID = 'ce';
  const m = marcas(spec);
  const dado = spec.rv != null && spec.ra == null;
  const ra = Number(spec.ra ?? 297);
  const ct = Number(spec.ct ?? -3);
  const rv = dado ? Number(spec.rv) : ((ra + ct) % 360 + 360) % 360;
  const v = Number(spec.v ?? 6);
  const hi = spec.hi ?? '18:20';
  const hf = spec.hf ?? '20:35';
  const min = ((hora(hf) - hora(hi)) % 1440 + 1440) % 1440;
  if (!min || !(v > 0)) return null;
  const th = min / 60;
  const d = v * th;
  const W = 320;
  const H = 282;
  const out = open(W, H, 'Situación de estima', NID);
  out.push(title(160, 'Situación de estima: salida + Rv + d'));
  // el tramo se centra en la zona de dibujo
  const u = pol(0, 0, rv, 1);
  const box = [250, 100];
  const L = Math.min(190, box[0] / Math.max(Math.abs(u[0]), 1e-6), box[1] / Math.max(Math.abs(u[1]), 1e-6));
  const c0 = [160, 108];
  const S = [c0[0] - (u[0] * L) / 2, c0[1] - (u[1] * L) / 2];
  const E = [c0[0] + (u[0] * L) / 2, c0[1] + (u[1] * L) / 2];
  // compás de puntas: abre la distancia d sobre el rumbo
  const nrm = [u[1], -u[0]];
  const lado = nrm[1] < 0 ? 1 : -1; // el compás por encima del tramo
  const ap = mas(c0, nrm, 34 * lado);
  out.push(`<g${m.dim('distancia')}>${seg(S, ap, 'g', 1.2, 'stroke-dasharray="3 3"')}${seg(ap, E, 'g', 1.2, 'stroke-dasharray="3 3"')}<circle cx="${fx(ap[0])}" cy="${fx(ap[1])}" r="3" fill="${C.g}"/>`);
  out.push(junto(ap, [nrm[0] * lado, nrm[1] * lado], 9, `compás: d = ${nf(d)} M`, { c: 'p', b: m.on('distancia') }), '</g>');
  // rumbo
  const Ef = mas(E, u, -10);
  out.push(`<g${m.dim('rumbo')}>${arrow(S[0], S[1], Ef[0], Ef[1], 'v', NID, m.on('rumbo') ? 3.4 : 2.4)}</g>`);
  const nv = hueco([[296, 66], [24, 66], [296, 150], [24, 150]], [[S, E], [S, ap], [ap, E]]);
  out.push(norte(nv[0], nv[1], 30));
  out.push(`<g${m.dim('rumbo')}>${junto(mas(S, u, L * 0.42), [-nrm[0] * lado, -nrm[1] * lado], 8, `Rv ${deg3(rv)}`, { c: 'v', b: true })}</g>`);
  // salida y estima
  // etiquetas por debajo o por encima del punto, por el lado contrario a la línea
  const sy = u[1] < 0 ? 22 : -14;
  out.push(`<g${m.dim('salida')}>${obs(S, 'currentColor', m.on('salida') ? 2.6 : 1.8)}${t(cx(S[0], 12), S[1] + sy, `salida ${hi}`, { a: 'middle', b: m.on('salida') })}</g>`);
  out.push(`<g${m.dim('estima')}>${tri(E, 'r', m.on('estima') ? 2.8 : 2)}${t(cx(E[0], 12), E[1] - sy + (sy > 0 ? 4 : 6), `estima ${hf}`, { c: 'r', a: 'middle', b: true })}</g>`);
  // método
  const y0 = 196;
  const L1 = dado ? `Rv dado = ${deg3(rv)}: no se le aplica la Ct` : `Rv = Ra + Ct = ${deg3(ra)} ${ct < 0 ? '−' : '+'} ${nf(Math.abs(ct), Number.isInteger(ct) ? 0 : 1)}° = ${deg3(rv)}`;
  const filas = [
    ['salida', '1. Sitúa la salida'],
    ['rumbo', `2–3. ${L1}`],
    ['distancia', `4. t = ${hf} − ${hi} = ${hm(min)} = ${nf(th, Number.isInteger(th * 10) ? 1 : 2)} h`],
    ['distancia', `5. d = V × t = ${nf(v, Number.isInteger(v) ? 0 : 1)} × ${nf(th, Number.isInteger(th * 10) ? 1 : 2)} = ${nf(d)} millas`],
    ['estima', '6–7. Traza Rv y d desde la salida; lee l y L'],
  ];
  filas.forEach(([p, s], i) => out.push(`<g${m.dim(p)}>${t(14, y0 + i * 16, s, { b: m.on(p), s: 10.5 })}</g>`));
  out.push('</svg>');
  return {
    svg: out.join(''),
    caption: dado
      ? `Si el enunciado ya da el rumbo verdadero, se traza tal cual. Desde la salida se traza el Rv ${deg3(rv)} y se mide con el compás la distancia navegada, d = V × t = ${nf(d)} millas: el extremo es la situación de estima.`
      : `Se pasa el rumbo de aguja a verdadero (Rv = Ra + Ct), se calcula la distancia navegada (d = V × t, con el tiempo en horas) y, desde la salida, se traza el Rv y se mide d con el compás en la escala de latitudes. El extremo es la situación de estima.`,
  };
}

// ---------------------------------------------------------------------------
// 2. Demoras no simultáneas: trasladar la primera línea (per-11-8). spec: { tipo:'traslado-demora', caso?, resaltar? }
// Cifras de la lección: 1.ª demora a las 10:00, 2.ª a las 10:40, Rv 090° a 6 nudos → 4 millas.

function trasladoDemora(spec = {}) {
  NID = 'ct';
  const m = marcas(spec);
  const caso = spec.caso ?? 'no-simultaneas';
  if (caso === 'simultaneas') return simultaneas(m);
  if (caso !== 'no-simultaneas') return null;
  const v = Number(spec.v ?? 6);
  const min = Number(spec.minutos ?? 40);
  const d = (v * min) / 60;
  const W = 320;
  const H = 300;
  const out = open(W, H, 'Demoras no simultáneas', NID);
  out.push(title(160, 'Demoras no simultáneas'));
  out.push(`<path d="M0,30 L320,30 L320,58 Q280,74 240,64 Q200,54 160,70 Q110,84 70,70 Q30,58 0,72Z" style="fill:var(--l-casco)"/>`);
  const A = [150, 64];
  const B = [36, 68];
  const P2 = [200, 222]; // situación a la hora de la 2.ª (la que se busca)
  const dpx = 90; // 4 millas
  const P1 = [P2[0] - dpx, P2[1]]; // donde estaba el barco a la hora de la 1.ª (rumbo 090°)
  const u1 = dir(A, P1);
  const u2 = dir(B, P2);
  const L1 = Math.hypot(P1[0] - A[0], P1[1] - A[1]);
  // 1.ª línea (desde el faro A)
  out.push(`<g${m.dim('primera')}>${seg(A, mas(A, u1, L1 + 34), 'v', m.on('primera') ? 3.2 : 2)}</g>`);
  // trasladada: paralela a la 1.ª por el extremo del traslado
  const Q = mas(A, u1, L1 * 0.3);
  const Q2 = [Q[0] + dpx, Q[1]];
  out.push(`<g${m.dim('trasladada')}>${seg(mas(Q2, u1, -28), mas(P2, u1, 30), 'v', m.on('trasladada') ? 3.2 : 2, 'stroke-dasharray="7 4"')}</g>`);
  // 2.ª línea (desde B)
  out.push(`<g${m.dim('segunda')}>${seg(B, mas(P2, u2, 30), 'p', m.on('segunda') ? 3.2 : 2)}</g>`);
  // punto cualquiera de la 1.ª y traslado: Rv 090° y d
  out.push(`<g${m.dim('traslado')}>${punto(Q, C.v, 3.5)}${arrow(Q[0], Q[1], Q2[0] - 2, Q2[1], 'a', NID, m.on('traslado') ? 3.2 : 2.4)}${t((Q[0] + Q2[0]) / 2 + 4, Q[1] - 8, `Rv 090° · ${nf(d, Number.isInteger(d) ? 0 : 1)} M`, { c: 'a', a: 'middle', b: true })}</g>`);
  // cruce falso (sin trasladar)
  const F = corte(A, u1, B, u2);
  out.push(`<g${m.dim('situacion')}><path d="M${fx(F[0] - 5)},${fx(F[1] - 5)} l10,10 m0,-10 l-10,10" stroke="${C.g}" stroke-width="2"/>${t(F[0] - 10, F[1] + 2, 'cruce sin trasladar:', { c: 'g', a: 'end', s: 9.5 })}${t(F[0] - 10, F[1] + 14, 'punto falso', { c: 'g', a: 'end', s: 9.5 })}</g>`);
  // faros
  out.push(faro(A), t(A[0] + 10, A[1] - 6, 'faro A', { b: true }), faro(B), t(B[0] + 10, B[1] - 6, 'faro B', { b: true }));
  // etiquetas de las líneas
  const e1 = mas(A, u1, L1 * 0.86);
  out.push(`<g${m.dim('primera')}>${t(e1[0] - 8, e1[1] + 4, '1.ª Dv 10:00', { c: 'v', a: 'end', b: m.on('primera') })}</g>`);
  const e3 = mas(Q2, u1, L1 * 0.22);
  out.push(`<g${m.dim('trasladada')}>${t(e3[0] + 8, e3[1] + 4, 'trasladada', { c: 'v', b: true })}</g>`);
  const e2 = mas(P2, u2, 30);
  out.push(`<g${m.dim('segunda')}>${t(e2[0] + 4, e2[1] + 12, '2.ª Dv 10:40', { c: 'p', b: m.on('segunda') })}</g>`);
  out.push(`<g${m.dim('situacion')}>${obs(P2, 'r', m.on('situacion') ? 2.8 : 2)}${t(P2[0] + 11, P2[1] + 4, 'situación 10:40', { c: 'r', b: true })}</g>`);
  out.push(norte(298, 186));
  out.push(t(14, H - 26, `d = V × t = ${nf(v, 0)} × ${min}/60 = ${nf(d, Number.isInteger(d) ? 0 : 1)} millas, al Rv del barco`, { s: 10.5 }));
  out.push(t(14, H - 10, 'La 1.ª, paralela a sí misma; corte con la 2.ª', { s: 10, b: true }));
  out.push('</svg>');
  return {
    svg: out.join(''),
    caption: `La primera línea viaja con el barco: desde cualquier punto de ella se traza el Rv y la distancia navegada entre las dos tomas (${nf(v, 0)} nudos × ${min} min = ${nf(d, Number.isInteger(d) ? 0 : 1)} millas) y por el extremo se traza una paralela. Su corte con la segunda línea es la situación a la hora de la segunda demora; cruzarlas sin trasladar da un punto en el que el barco no ha estado.`,
  };
}

function simultaneas(m) {
  const W = 320;
  const H = 290;
  const out = open(W, H, 'Marcaciones simultáneas', NID);
  out.push(title(160, 'Simultáneas: se cruzan sin trasladar'));
  out.push(`<path d="M0,30 L320,30 L320,58 Q280,74 240,64 Q200,54 160,70 Q110,84 70,70 Q30,58 0,72Z" style="fill:var(--l-casco)"/>`);
  const A = [92, 72];
  const B = [262, 66];
  const S0 = [278, 226]; // situación conocida de las 12:00
  const P = [120, 178]; // corte de las dos marcaciones, tomadas a la vez
  const uA = dir(A, P);
  const uB = dir(B, P);
  out.push(`<g${m.dim('rumbo')}>${obs(S0, 'currentColor', m.on('rumbo') ? 2.6 : 1.8)}${t(S0[0] - 4, S0[1] + 20, 'situación 12:00', { a: 'middle', b: m.on('rumbo') })}</g>`);
  const ur = dir(S0, P);
  out.push(`<g${m.dim('rumbo')}>${arrow(S0[0], S0[1], ...mas(P, ur, -10), 'v', NID, m.on('rumbo') ? 3.2 : 2.2)}</g>`);
  out.push(`<g${m.dim('distancia')}>${seg(mas(S0, [ur[1], -ur[0]], -12), mas(P, [ur[1], -ur[0]], -12), 'a', m.on('distancia') ? 2.6 : 1.6, 'stroke-dasharray="4 3"')}</g>`);
  const md = mas(mas(S0, ur, Math.hypot(P[0] - S0[0], P[1] - S0[1]) * 0.42), [ur[1], -ur[0]], -24);
  out.push(`<g${m.dim('distancia')}>${t(md[0], md[1] + 4, 'distancia navegada', { c: 'a', a: 'middle', b: m.on('distancia') })}</g>`);
  const mr = mas(mas(S0, ur, Math.hypot(P[0] - S0[0], P[1] - S0[1]) * 0.5), [ur[1], -ur[0]], 19);
  out.push(`<g${m.dim('rumbo')}>${t(mr[0], mr[1] + 4, 'rumbo (Ra → Rv)', { c: 'v', a: 'middle', b: true })}</g>`);
  out.push(`<g${m.dim('lineas')}>${seg(A, mas(P, uA, 28), 'p', m.on('lineas') ? 3.2 : 2)}${seg(B, mas(P, uB, 28), 'p', m.on('lineas') ? 3.2 : 2)}</g>`);
  out.push(faro(A), t(A[0] + 10, A[1] - 6, 'faro A', { b: true }), faro(B), t(B[0] - 10, B[1] - 6, 'faro B', { a: 'end', b: true }));
  const eb = mas(B, uB, 60);
  out.push(`<g${m.dim('lineas')}>${t(eb[0] + 2, eb[1] + 16, 'marcaciones a la vez', { c: 'p', a: 'middle', b: m.on('lineas') })}</g>`);
  out.push(`<g${m.dim('situacion')}>${obs(P, 'r', m.on('situacion') ? 2.8 : 2)}${t(P[0] - 12, P[1] + 4, 'situación', { c: 'r', a: 'end', b: true })}</g>`);
  out.push(norte(28, 130));
  out.push(t(14, H - 26, '«Más tarde, dos marcaciones»: son de la misma hora', { s: 10.5, b: true }));
  out.push(t(14, H - 10, 'La de las 12:00 solo da el rumbo y la distancia', { s: 10.5 }));
  out.push('</svg>');
  return {
    svg: out.join(''),
    caption: 'Si las dos marcaciones se toman a la vez, son simultáneas: se cruzan directamente y no se traslada nada. La situación anterior sirve para tener el rumbo con el que convertir las marcaciones y, si lo piden, para medir la distancia navegada hasta el corte.',
  };
}

// ---------------------------------------------------------------------------
// 3. Rumbo para pasar a una distancia de un faro (per-11-9). spec: { tipo:'tangente', dv, D, d, banda, resaltar? }
// Cifras de la lección: faro en Dv 004° a 10 millas, pasar a 2,5 millas dejándolo por babor (α ≈ 14,5°, Rv ≈ 019°).

function tangente(spec = {}) {
  NID = 'cg';
  const m = marcas(spec);
  const dv = Number(spec.dv ?? 4);
  const D = Number(spec.D ?? 10);
  const dp = Number(spec.d ?? 2.5);
  const banda = spec.banda ?? 'babor';
  if (!(D > dp && dp > 0) || !['babor', 'estribor', 'ambas'].includes(banda)) return null;
  const alfa = Math.round((Math.asin(dp / D) * 1800) / Math.PI) / 10; // a la décima, como en la lección
  const rvE = ((dv - alfa) % 360 + 360) % 360;
  const rvB = ((dv + alfa) % 360 + 360) % 360;
  const W = 320;
  const H = 326;
  const out = open(W, H, 'Rumbo para pasar a una distancia de un faro', NID);
  out.push(title(160, `Pasar a ${nf(dp, Number.isInteger(dp) ? 0 : 1)} M del faro: la tangente`));
  const k = 150 / D; // px por milla
  const r = dp * k;
  const uf = pol(0, 0, dv, 1);
  let S = [160 - (uf[0] * D * k) / 2, 150 - (uf[1] * D * k) / 2];
  let F = mas(S, uf, D * k);
  // que quepa entre el título (y 50 con la etiqueta del círculo) y el texto (y 248)
  const top = Math.min(S[1] - 8, F[1] - r);
  const bot = Math.max(S[1] + 8, F[1] + r);
  const dy = top < 40 ? 40 - top : bot > 246 ? 246 - bot : 0;
  S = [S[0], S[1] + dy];
  F = [F[0], F[1] + dy];
  const dTxt = nf(dp, Number.isInteger(dp) ? 0 : 1);
  // circunferencia de la distancia de paso (con su etiqueta encima)
  out.push(`<g${m.dim('circulo')}><circle cx="${fx(F[0])}" cy="${fx(F[1])}" r="${fx(r)}" fill="none" stroke="${C.a}" stroke-width="${m.on('circulo') ? 2.6 : 1.6}" stroke-dasharray="5 3"/>`);
  out.push('</g>');
  // visual al faro
  out.push(`<g${m.dim('visual')}>${seg(S, F, 'g', m.on('visual') ? 2.4 : 1.4, 'stroke-dasharray="3 3"')}</g>`);
  // tangentes
  const Lt = Math.sqrt(D * D - dp * dp) * k;
  const L = Lt + 26;
  const tangs = [['estribor', rvE, -1], ['babor', rvB, 1]];
  for (const [b, rv, sg] of tangs) {
    const elegida = banda === 'ambas' || banda === b;
    const fuerte = elegida && (m.on('tangente') || !m.activo);
    const E = pol(S[0], S[1], rv, L);
    const T = pol(S[0], S[1], rv, Lt);
    const c = b === 'babor' ? 'r' : 'm';
    out.push(`<g${elegida ? m.dim('tangente') : ' opacity=".45"'}>${elegida ? arrow(S[0], S[1], E[0], E[1], c, NID, fuerte ? 3.2 : 2.4) : seg(S, E, 'g', 1.4)}`);
    // radio al punto de tangencia (perpendicular a la tangente)
    if (elegida) out.push(seg(F, T, 'a', 1.4), `<circle cx="${fx(T[0])}" cy="${fx(T[1])}" r="2.5" fill="${C[c]}"/>`);
    const n = pol(0, 0, rv + sg * 90, 1);
    const q = mas(pol(S[0], S[1], rv, L * 0.5), n, Math.abs(n[0]) < 0.4 ? 16 : 8);
    const a = n[0] > 0.4 ? 'start' : n[0] < -0.4 ? 'end' : 'middle';
    const y = q[1] + 3.5 + (n[1] > 0.6 ? 5 : 0) - (n[1] < -0.6 ? 16 : 0);
    out.push(t(q[0], y, `Rv ${deg3(rv)}`, { c: elegida ? c : 'g', a, b: elegida }), t(q[0], y + 13, `faro por ${b}`, { c: elegida ? c : 'g', a, s: 9.5 }), '</g>');
  }
  // ángulo α entre la visual y la tangente
  out.push(`<g${m.dim('angulo')}>`);
  for (const [b, rv] of tangs) {
    if (banda !== 'ambas' && banda !== b) continue;
    const [a0, a1] = b === 'babor' ? [dv, rv] : [rv, dv];
    const [x1, y1] = pol(S[0], S[1], a0, 40);
    const [x2, y2] = pol(S[0], S[1], a1, 40);
    out.push(`<path d="M${fx(x1)},${fx(y1)} A40,40 0 0 1 ${fx(x2)},${fx(y2)}" fill="none" stroke="currentColor" stroke-width="${m.on('angulo') ? 2.4 : 1.4}"/>`);
  }
  if (banda !== 'ambas') { const la = pol(S[0], S[1], banda === 'babor' ? dv + alfa / 2 : dv - alfa / 2, 52); out.push(t(la[0], la[1] + 4, 'α', { a: 'middle', b: true })); }
  out.push('</g>');
  const lf = mas(F, uf, Math.min(16, r - 4));
  out.push(faro(F), t(lf[0], lf[1] + 4 + (uf[1] > 0.5 ? 4 : 0), 'faro', { a: 'middle', b: true, s: 9.5 }));
  const ns = pol(0, 0, dv + 180, 1);
  const ts = Math.abs(ns[1]) > 0.7 ? [S[0] - 12, S[1] + 4, 'end'] : [S[0] + (ns[0] < 0 ? -8 : 8), S[1] + 20, ns[0] < 0 ? 'end' : 'start'];
  out.push(`<g${m.dim('situacion')}>${obs(S, 'currentColor', m.on('situacion') ? 2.6 : 1.8)}${t(ts[0], ts[1], 'tu situación', { a: ts[2], b: m.on('situacion') })}</g>`);
  out.push(norte(...hueco([[298, 66], [22, 66], [298, 200], [22, 200]], [[S, F], [S, pol(S[0], S[1], rvE, L)], [S, pol(S[0], S[1], rvB, L)]], 30)));
  // cálculo
  const fila = (y, s, b = false, p = null) => out.push(`<g${p ? m.dim(p) : ''}>${t(14, y, s, { s: 10.5, b: b || (p && m.on(p)) })}</g>`);
  fila(H - 58, `Al faro: Dv ${deg3(dv)}, D = ${nf(D, Number.isInteger(D) ? 0 : 1)} M · radio d = ${dTxt} M`, false, 'visual');
  fila(H - 42, `sen α = d / D = ${dTxt} / ${nf(D, Number.isInteger(D) ? 0 : 1)} → α ≈ ${nf(alfa)}°`, false, 'angulo');
  if (banda === 'babor') fila(H - 26, `Por babor: Rv = Dv + α ≈ ${deg3(dv)} + ${nf(alfa)}° ≈ ${deg3(rvB)}`, true);
  else if (banda === 'estribor') fila(H - 26, `Por estribor: Rv = Dv − α ≈ ${deg3(dv)} − ${nf(alfa)}° ≈ ${deg3(rvE)}`, true);
  else fila(H - 26, `Estribor: Dv − α ≈ ${deg3(rvE)} · Babor: Dv + α ≈ ${deg3(rvB)}`, true);
  fila(H - 10, 'Y después: Ra = Rv − Ct');
  out.push('</svg>');
  const cap = {
    babor: 'Con centro en el faro se traza la circunferencia de la distancia de paso y, desde tu situación, la tangente. Para dejar el faro por babor (a tu izquierda) se toma la tangente de la derecha de la visual: Rv = Dv + α.',
    estribor: 'Con centro en el faro se traza la circunferencia de la distancia de paso y, desde tu situación, la tangente. Para dejar el faro por estribor (a tu derecha) se toma la tangente de la izquierda de la visual: Rv = Dv − α.',
    ambas: 'Desde tu situación salen dos tangentes a la circunferencia de la distancia de paso. Faro por estribor: la de la izquierda (Rv = Dv − α); por babor: la de la derecha (Rv = Dv + α). Si el enunciado no dice la banda, la que pasa por fuera, por el lado del mar.',
  };
  return { svg: out.join(''), caption: cap[banda] };
}

// ---------------------------------------------------------------------------
// 4. GNSS: las siglas de una ruta entre dos waypoints (py-3-9). spec: { tipo:'gnss', resaltar? }
// Cifras de la lección: DTG 18,0 M, SOG 6,0 kn a las 10:20 → TTG 3 h, ETA 13:20; XTE 0,05 R; COG a 20° del BRG → VMG 5,6 kn.

export const SIGLAS_GNSS = {
  wpt: 'WPT: punto de ruta, de destino o de paso.',
  xte: 'XTE: error transversal, la distancia a la línea recta entre el WPT de salida y el de llegada, con su banda.',
  brg: 'BRG: demora desde tu posición al WPT.',
  dtg: 'DTG o RNG: distancia que falta hasta el WPT.',
  cog: 'COG: rumbo sobre el fondo (rumbo efectivo).',
  sog: 'SOG: velocidad sobre el fondo (velocidad efectiva).',
  hdg: 'HDG: rumbo de proa, hacia donde apunta el barco.',
  vmg: 'VMG: velocidad con la que de verdad te acercas al WPT.',
  eta: 'TTG = DTG / SOG; ETA (hora estimada de llegada) = hora + TTG.',
};

/** En estilo C, en src/illustrations/electronica-c.js. */
const gnss = (spec = {}) => gnssC(spec, SIGLAS_GNSS);

// ---------------------------------------------------------------------------
// 5. Corriente desconocida (py-4-8). spec: { tipo:'corriente-desconocida', resaltar? }
// Problema modelo de la lección: 10:00 en 35°56,0′N 005°55,0′W, Rv 100°, 6 kn; a las 11:30 Dv Punta Paloma 350° y
// Dv Punta Cires 101°. Estima 35°54,4′N 005°44,1′W; observada 35°56,6′N 005°41,5′W; Rc ≈ 044°, 3,0 M, Ihc 2 nudos.

function corrienteDesconocida(spec = {}) {
  // Estilo C (docs/ESTILO-LAMINAS.md): la estima con una punta, la corriente (de la estimada a la observada) con tres y
  // en magenta; la estimada es un triángulo y la observada un círculo, como en la carta.
  const m = marcas(spec);
  const W = 358;
  const H = 388;
  const alt = 'Corriente desconocida: desde la salida de las 10:00, la estima sin corriente (Rv 100°, 9 millas) lleva a la situación estimada de las 11:30; las demoras de Punta Paloma (350°) y Punta Cires (101°) dan la observada. La corriente va de la estimada a la observada: rumbo 044°, 3,0 millas en 1,5 horas, intensidad 2 nudos.';
  const { out, pt, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
  // millas en la carta (x al E, y al N) desde la salida, con cos(35,9°) para las longitudes
  const cl = Math.cos((35.92 * Math.PI) / 180);
  const mi = (lat, lon) => [(-(lon - (5 + 55 / 60)) * 60) * cl, (lat - (35 + 56 / 60)) * 60];
  const k = 22;
  const O = [22, 168];
  const px = ([x, y]) => [O[0] + x * k, O[1] - y * k];
  const S = px([0, 0]);
  const Se = px(mi(35 + 54.4 / 60, 5 + 44.1 / 60));
  const So = px(mi(35 + 56.6 / 60, 5 + 41.5 / 60));
  // líneas de posición desde los faros (opuestas a las Dv: 170° desde Paloma y 281° desde Cires)
  const uP = pol(0, 0, 350, 1);
  const uC = pol(0, 0, 101, 1);
  const Pal = mas(So, uP, 118);
  const Cir = mas(So, uC, 56);
  // costa: la de Paloma al norte y la de Cires al este
  out.push(tierra(`M${fx(Pal[0] - 120)},0 H${fx(Pal[0] + 70)} C${fx(Pal[0] + 40)},${fx(Pal[1] - 6)} ${fx(Pal[0] + 16)},${fx(Pal[1] - 2)} ${fx(Pal[0])},${fx(Pal[1] - 4)} C${fx(Pal[0] - 40)},${fx(Pal[1] - 18)} ${fx(Pal[0] - 80)},${fx(Pal[1] - 10)} ${fx(Pal[0] - 120)},${fx(Pal[1] - 16)} Z`, pt));
  out.push(tierra(`M${W},${fx(Cir[1] - 70)} C${fx(Cir[0] + 20)},${fx(Cir[1] - 50)} ${fx(Cir[0] + 6)},${fx(Cir[1] - 18)} ${fx(Cir[0] + 4)},${fx(Cir[1])} C${fx(Cir[0] + 8)},${fx(Cir[1] + 30)} ${fx(Cir[0] + 24)},${fx(Cir[1] + 50)} ${W},${fx(Cir[1] + 60)} Z`, pt));
  const fP = mas(So, uP, -16);
  const fC = mas(So, uC, -60);
  out.push(`<g data-parte="observada"${m.dim('observada')}><line x1="${fx(Pal[0])}" y1="${fx(Pal[1])}" x2="${fx(fP[0])}" y2="${fx(fP[1])}" stroke="${T.tinta}" stroke-width="${m.on('observada') ? 1.9 : 1.5}"/>` +
    `<line x1="${fx(Cir[0])}" y1="${fx(Cir[1])}" x2="${fx(fC[0])}" y2="${fx(fC[1])}" stroke="${T.tinta}" stroke-width="${m.on('observada') ? 1.9 : 1.5}" stroke-dasharray="8 4"/></g>`);
  out.push(faroC(Pal[0], Pal[1], { destella: false }), faroC(Cir[0], Cir[1], { destella: false }));
  const segs = [[Pal, fP], [Cir, fC], [S, Se], [Se, So]];
  const cajas = [{ x0: Pal[0] - 9, y0: Pal[1] - 9, x1: Pal[0] + 9, y1: Pal[1] + 9 }, { x0: Cir[0] - 9, y0: Cir[1] - 9, x1: Cir[0] + 9, y1: Cir[1] + 9 }];
  const pet = [];
  pet.push({ t: 'Pta. Paloma', cands: [[Pal[0] - 46, Pal[1] + 4], [Pal[0] + 46, Pal[1] + 4], [Pal[0], Pal[1] + 20]], rotulo: true });
  pet.push({ t: 'Pta. Cires', cands: [[Cir[0] - 8, Cir[1] + 22], [Cir[0] - 8, Cir[1] - 16], [Cir[0] - 44, Cir[1]]], rotulo: true });
  pet.push({ t: 'Dv 350°', cands: juntoC(So, Pal, 'Dv 350°', { centro: S, ks: [0.6, 0.45, 0.75] }), p: 'observada' });
  pet.push({ t: 'Dv 101°', cands: juntoC(So, Cir, 'Dv 101°', { centro: S, ks: [0.55, 0.4, 0.7] }), p: 'observada' });
  // estima sin corriente
  out.push(`<g data-parte="estima"${m.dim('estima')}>${flecha(S[0], S[1], ...mas(Se, dir(S, Se), -10), { color: T.tinta, w: m.on('estima') ? 1.9 : 1.6 })}</g>`);
  pet.push({ t: 'Rv 100° · 9 M', cands: juntoC(S, Se, 'Rv 100° · 9 M', { centro: So, ks: [0.45, 0.3, 0.6] }), p: 'estima' });
  out.push(`<g data-parte="salida"${m.dim('salida')}>${situacion(S[0], S[1], { color: T.tinta })}</g>`);
  pet.push({ t: 'salida 10:00', cands: [[S[0] + 14, S[1] - 18], [S[0] + 20, S[1] + 22]], rotulo: true, p: 'salida' });
  out.push(`<g${m.dim('estima')}>${estimaC(Se[0], Se[1], { p: 'estima' })}</g>`);
  pet.push({ t: 'Se 11:30', cands: [[Se[0], Se[1] + 24], [Se[0] + 44, Se[1] + 16], ...alrededor(Se, [30, 44])], p: 'estima' });
  out.push(`<g${m.dim('observada')}>${situacion(So[0], So[1], { color: T.tinta, p: 'observada' })}</g>`);
  pet.push({ t: 'So 11:30', cands: [[So[0] - 38, So[1] - 16], [So[0] + 38, So[1] - 18], [So[0] - 44, So[1] + 4]], p: 'observada' });
  // la corriente: de la estimada a la observada (tres puntas, magenta)
  const e0 = mas(Se, dir(Se, So), 9);
  const e1 = mas(So, dir(Se, So), -10);
  const d = Math.hypot(e1[0] - e0[0], e1[1] - e0[1]) || 1;
  const [ux, uy] = [(e1[0] - e0[0]) / d, (e1[1] - e0[1]) / d];
  const chev = [1, 2].map((i) => { const c = [e1[0] - ux * (10 + 6 * i), e1[1] - uy * (10 + 6 * i)]; return `<polyline points="${fx(c[0] - uy * 4.5 - ux * 5)},${fx(c[1] + ux * 4.5 - uy * 5)} ${fx(c[0])},${fx(c[1])} ${fx(c[0] + uy * 4.5 - ux * 5)},${fx(c[1] - ux * 4.5 - uy * 5)}" fill="none" stroke="${T.magenta}" stroke-width="1.4"/>`; }).join('');
  out.push(`<g data-parte="corriente"${m.dim('corriente')}>${flecha(e0[0], e0[1], e1[0], e1[1], { color: T.magenta, w: m.on('corriente') ? 2.4 : 2 })}${chev}</g>`);
  pet.push({ t: 'Rc 044° · 3,0 M', cands: juntoC(Se, So, 'Rc 044° · 3,0 M', { centro: Cir, ks: [0.5, 0.3, 0.7] }), color: T.magenta, p: 'corriente', ref: [(Se[0] + So[0]) / 2, (Se[1] + So[1]) / 2] });
  out.push(rosaNorte(34, 54));
  cajas.push({ x0: 12, y0: 26, x1: 56, y1: 74 }, { x0: S[0] - 10, y0: S[1] - 10, x1: S[0] + 10, y1: S[1] + 10 }, { x0: Se[0] - 10, y0: Se[1] - 11, x1: Se[0] + 10, y1: Se[1] + 8 }, { x0: So[0] - 10, y0: So[1] - 10, x1: So[0] + 10, y1: So[1] + 10 });
  out.push(colocaEtiquetas(pet, { W, H: 246, segs, cajas }));
  // resolución
  out.push(`<line x1="14" y1="246" x2="${W - 14}" y2="246" stroke="${T.tinta}" stroke-width=".6"/>`);
  const filas = [
    ['salida', 'Salida 10:00: 35°56,0′ N 005°55,0′ W'],
    ['estima', 'Se 11:30, sin corriente: 35°54,4′ N 005°44,1′ W'],
    ['observada', 'So 11:30 (Dv 350° y 101°): 35°56,6′ N 005°41,5′ W'],
    ['corriente', 'De Se a So: Rc ≈ 044°, 3,0 millas'],
    ['corriente', 'Ihc = 3,0 M / 1,5 h = 2 nudos'],
  ];
  filas.forEach(([p, txt], i) => out.push(filaPaso(22, 268 + i * 23, i + 1, txt, { clave: i >= 3, extra: m.dim(p) })));
  out.push(cierra());
  return {
    svg: out.join(''),
    caption: 'La corriente es el vector que va de la situación de estima (Se, calculada sin corriente) a la observada (So) a la misma hora: su dirección es el rumbo de la corriente y su longitud, dividida por las horas desde la salida fiable, la intensidad horaria. En el problema modelo: 3,0 millas al 044° en 1,5 h, Ihc 2 nudos.',
  };
}

export const LAMINAS = {
  estima: {
    fn: estima,
    params: { ra: 'rumbo de aguja (por defecto 297)', ct: 'corrección total (por defecto −3)', rv: 'rumbo verdadero dado (sin ra: no se corrige)', v: 'nudos (por defecto 6)', hi: 'HRB inicial "18:20"', hf: 'HRB final "20:35"', resaltar: ['salida', 'rumbo', 'distancia', 'estima'] },
    ejemplo: { tipo: 'estima' },
  },
  'traslado-demora': {
    fn: trasladoDemora,
    params: { caso: ['no-simultaneas', 'simultaneas'], v: 'nudos (por defecto 6; no-simultaneas)', minutos: 'entre las dos tomas (por defecto 40)', resaltar: ['primera', 'traslado', 'trasladada', 'segunda', 'situacion', 'rumbo', 'distancia', 'lineas'] },
    ejemplo: { tipo: 'traslado-demora', caso: 'no-simultaneas' },
  },
  tangente: {
    fn: tangente,
    params: { banda: ['babor', 'estribor', 'ambas'], dv: 'Dv al faro (por defecto 004)', D: 'distancia al faro en millas (por defecto 10)', d: 'distancia de paso en millas (por defecto 2,5)', resaltar: ['situacion', 'circulo', 'visual', 'tangente', 'angulo'] },
    ejemplo: { tipo: 'tangente', banda: 'babor' },
  },
  gnss: {
    fn: gnss,
    params: { resaltar: Object.keys(SIGLAS_GNSS) },
    ejemplo: { tipo: 'gnss' },
  },
  'corriente-desconocida': {
    fn: corrienteDesconocida,
    params: { resaltar: ['salida', 'estima', 'observada', 'corriente'] },
    ejemplo: { tipo: 'corriente-desconocida' },
  },
};
