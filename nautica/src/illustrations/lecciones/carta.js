// Láminas de problemas de carta: situación de estima (per-11-4), traslado de una demora no simultánea (per-11-8),
// rumbo tangente para pasar a una distancia de un faro (per-11-9), siglas del GNSS en una ruta (py-3-9) y
// corriente desconocida (py-4-8). Cada una sigue el «método paso a paso» de su lección y usa sus cifras.
// Funciones puras spec → { svg, caption }. Admiten `resaltar` (una parte o lista) para destacar la que trata cada paso.

import { C, pol, arrow, fx } from '../kit.js';
import { T, lienzo, flecha, rosaNorte, tierra, junto as juntoC, colocaEtiquetas } from '../estilo-c.js';
import { faro as faroC, situacion, estima as triEstimaC, filaPaso, alrededor } from '../carta-c.js';
import { gnssC } from '../electronica-c.js';
import { estimaC, trasladoDemoraC, tangenteC, ESTIMA_PARTES, TRASLADO_PARTES, TANGENTE_PARTES } from '../per-cola-carta-c.js';

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
const faro = (p, extra = '') => `<g${extra}><circle cx="${fx(p[0])}" cy="${fx(p[1])}" r="6" style="fill:var(--l-faro);stroke:currentColor" stroke-width="1.2"/><circle cx="${fx(p[0])}" cy="${fx(p[1])}" r="1.8" fill="currentColor"/></g>`;
const punto = (p, c = 'currentColor', r = 4) => `<circle cx="${fx(p[0])}" cy="${fx(p[1])}" r="${r}" fill="${col(c)}"/>`;
const norte = (x, y, len = 26) => `${arrow(x, y + len / 2, x, y - len / 2, 'g', NID, 1.6)}${t(x, y - len / 2 - 4, 'Nv', { c: 'g', a: 'middle', s: 9 })}`;
let NID = 'x';
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

// ---------------------------------------------------------------------------
// 1–3. Situación de estima (per-11-4), demoras no simultáneas (per-11-8) y rumbo para pasar a una distancia de un faro
// (per-11-9): en estilo C, en src/illustrations/per-cola-carta-c.js.

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
  out.push(`<g${m.dim('estima')}>${triEstimaC(Se[0], Se[1], { p: 'estima' })}</g>`);
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
    fn: estimaC,
    params: { ra: 'rumbo de aguja (por defecto 297)', ct: 'corrección total (por defecto −3)', rv: 'rumbo verdadero dado (sin ra: no se corrige)', v: 'nudos (por defecto 6)', hi: 'HRB inicial "18:20"', hf: 'HRB final "20:35"', resaltar: ESTIMA_PARTES },
    ejemplo: { tipo: 'estima' },
  },
  'traslado-demora': {
    fn: trasladoDemoraC,
    params: { caso: ['no-simultaneas', 'simultaneas'], v: 'nudos (por defecto 6; no-simultaneas)', minutos: 'entre las dos tomas (por defecto 40)', resaltar: TRASLADO_PARTES },
    ejemplo: { tipo: 'traslado-demora', caso: 'no-simultaneas' },
  },
  tangente: {
    fn: tangenteC,
    params: { banda: ['babor', 'estribor', 'ambas'], dv: 'Dv al faro (por defecto 004)', D: 'distancia al faro en millas (por defecto 10)', d: 'distancia de paso en millas (por defecto 2,5)', resaltar: TANGENTE_PARTES },
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
