// Segundas láminas del PER: qué hace crecer la mar y mar de viento frente a mar de fondo (per-9-6),
// cómo se actualiza la declinación de la carta (per-10-5), rumbo circular y cuadrantal (per-10-6),
// demora frente a marcación (per-11-5) y la calidad de la situación según el ángulo de corte (per-11-6).
// Funciones puras spec → { svg, caption }. Admiten `resaltar` (una parte o lista) donde la lámina tiene partes.
// Los colores van con variables CSS de styles/app.css para leerse en claro y oscuro.

import { open, title, fx, pol, hullPlan } from '../kit.js';

// Acentos que se adaptan al tema (texto, trazos y puntas de flecha).
const K = { v: 'var(--l-v)', r: 'var(--l-r)', a: 'var(--l-a)', m: 'var(--l-m)', p: 'var(--l-p)', g: 'var(--l-g)', t: 'currentColor' };
const marks = (id) => `<defs>${Object.entries(K).map(([k, c]) => `<marker id="${id}-k${k}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" style="fill:${c}"/></marker>`).join('')}</defs>`;
const start = (W, H, label, id) => [...open(W, H, label, id), marks(id)];
const close = (out) => { out.push('</svg>'); return out.join(''); };
const lista = (v) => (v == null || v === '' ? [] : Array.isArray(v) ? v : [v]);

/** Partes resaltadas; null si alguna no existe. */
function marcas(spec, validas) {
  const s = new Set(lista(spec.resaltar));
  if ([...s].some((p) => !validas.includes(p))) return null;
  return { activo: s.size > 0, on: (p) => s.has(p), op: (p) => (s.size && !s.has(p) ? ' opacity=".38"' : '') };
}

const flecha = (x1, y1, x2, y2, k, id, w = 2.2, extra = '') =>
  `<line x1="${fx(x1)}" y1="${fx(y1)}" x2="${fx(x2)}" y2="${fx(y2)}" style="stroke:${K[k]}" stroke-width="${w}" marker-end="url(#${id}-k${k})" ${extra}/>`;
const linea = (x1, y1, x2, y2, k = 't', w = 1.2, extra = '') =>
  `<line x1="${fx(x1)}" y1="${fx(y1)}" x2="${fx(x2)}" y2="${fx(y2)}" style="stroke:${K[k] ?? k}" stroke-width="${w}" ${extra}/>`;

/** Texto con halo del color del fondo. o = { c, a, s, b, halo, extra } */
const tx = (x, y, t, o = {}) => {
  const w = String(t).replace(/<[^>]*>|&[a-z]+;/g, 'x').length * (o.s ?? 11) * (o.b ? 0.58 : 0.52);
  const a = o.a ?? 'start';
  const [i0, i1] = a === 'start' ? [0, w] : a === 'end' ? [-w, 0] : [-w / 2, w / 2];
  if (x + i0 < 6) x = 6 - i0;
  else if (x + i1 > 314) x = 314 - i1;
  const c = o.c ? (K[o.c] ?? o.c) : 'currentColor';
  return `<text x="${fx(x)}" y="${fx(y)}" class="il-lbl" text-anchor="${a}"${o.s ? ` font-size="${o.s}"` : ''}${o.b ? ' font-weight="700"' : ''}${o.halo === false ? ` style="fill:${c}"` : ` style="fill:${c};paint-order:stroke;stroke:var(--bg);stroke-width:3px;stroke-linejoin:round"`} ${o.extra ?? ''}>${t}</text>`;
};

/** Arco de rumbo náutico a1 → a2 (sentido horario si a2 > a1) con radio r alrededor de (cx, cy). */
const arco = (cx, cy, r, a1, a2, k, w = 2, extra = '') => {
  const [x1, y1] = pol(cx, cy, a1, r);
  const [x2, y2] = pol(cx, cy, a2, r);
  const big = Math.abs(a2 - a1) > 180 ? 1 : 0;
  const sweep = a2 > a1 ? 1 : 0; // horario si a2 > a1; antihorario si no
  return `<path d="M${fx(x1)},${fx(y1)} A${r},${r} 0 ${big} ${sweep} ${fx(x2)},${fx(y2)}" fill="none" style="stroke:${K[k] ?? k}" stroke-width="${w}" ${extra}/>`;
};

const norm = (d) => ((Math.round(d) % 360) + 360) % 360;
const d3 = (d) => `${String(norm(d)).padStart(3, '0')}°`;

// ===========================================================================
// 1. La mar (per-9-6). spec: { tipo:'mar-crece', vista?: 'factores'|'viento-fondo',
//    resaltar? (factores): 'intensidad'|'persistencia'|'fetch' o lista }

const PARTES_MAR = ['intensidad', 'persistencia', 'fetch'];

function marFactores(m) {
  const W = 320;
  const H = 292;
  const id = 'pmc';
  const out = start(W, H, 'Qué hace crecer la mar', id);
  out.push(title(160, 'Qué hace crecer la mar'));
  const hi = (p) => m.on(p);
  // Viento (intensidad): flechas desde tierra hacia la mar.
  const wI = hi('intensidad') ? 3.4 : 2.4;
  out.push(`<g${m.op('intensidad')}>`, tx(52, 44, 'viento', { b: hi('intensidad'), c: 'v', s: 11 }));
  for (const x of [52, 112, 172]) out.push(flecha(x, 56, x + 44, 56, 'v', id, wI));
  out.push('</g>');
  // Reloj (persistencia).
  const cx = 262;
  const cy = 54;
  out.push(`<g${m.op('persistencia')}><circle cx="${cx}" cy="${cy}" r="12" fill="none" style="stroke:${hi('persistencia') ? K.a : 'currentColor'}" stroke-width="${hi('persistencia') ? 2.6 : 1.6}"/>`);
  out.push(linea(cx, cy, cx, cy - 8, 't', 1.6), linea(cx, cy, cx + 6, cy + 2, 't', 1.6));
  out.push(tx(cx + 18, cy + 4, 'horas', { s: 10 }), '</g>');
  // Tierra a la izquierda y la mar.
  const y0 = 140;
  const xT = 46;
  out.push(`<path d="M8,104 L30,100 L${xT},112 L${xT + 4},${y0} L${xT},180 L8,180Z" style="fill:var(--l-a)" opacity=".45"/>`);
  out.push(tx(12, 96, 'tierra', { s: 10 }));
  // Olas: crecen con la distancia a la costa hasta un tope (mar totalmente desarrollada).
  const amp = (x) => 1 + 17 * Math.min(1, Math.max(0, (x - xT - 10) / 190)) ** 1.3;
  const pts = [];
  for (let x = xT + 4; x <= 312; x += 2) {
    const L = 10 + 26 * Math.min(1, (x - xT) / 180);
    pts.push([x, y0 - amp(x) * Math.cos((2 * Math.PI * (x - xT)) / L) * 0.5 - amp(x) * 0.5]);
  }
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${fx(x)},${fx(y)}`).join('');
  out.push(`<path d="${d}L312,180L${xT + 4},180Z" style="fill:var(--l-mar)"/><path d="${d}" fill="none" style="stroke:var(--l-v)" stroke-width="1.8"/>`);
  // Fetch: extensión de mar sobre la que sopla.
  const yF = 100;
  const wF = hi('fetch') ? 3 : 1.8;
  out.push(`<g${m.op('fetch')}>`, linea(xT + 4, yF - 6, xT + 4, yF + 6, 't', 1), linea(310, yF - 6, 310, yF + 6, 't', 1));
  out.push(flecha(178, yF, xT + 7, yF, 'm', id, wF), flecha(178, yF, 307, yF, 'm', id, wF));
  out.push(tx(178, yF - 8, 'fetch: extensión de mar', { a: 'middle', b: hi('fetch'), c: 'm', s: 11 }), '</g>');
  // Debajo de la mar.
  out.push(tx(xT + 2, 196, 'poco fetch,', { s: 10 }), tx(xT + 2, 208, 'poca mar', { s: 10 }));
  out.push(tx(310, 196, 'la ola ya no crece: mar', { a: 'end', s: 10 }), tx(310, 208, 'totalmente desarrollada', { a: 'end', s: 10 }));
  // Leyenda de los tres factores.
  const filas = [
    ['intensidad', 'Intensidad', '= fuerza del viento', 'v'],
    ['persistencia', 'Persistencia', '= tiempo soplando igual', 'a'],
    ['fetch', 'Fetch', '= extensión (espacio) de mar', 'm'],
  ];
  filas.forEach(([k, n, t, c], i) => {
    const y = 230 + i * 16;
    out.push(`<g${m.op(k)}>`, tx(14, y, n, { b: true, c, s: 11 }), tx(104, y, t, { b: hi(k), s: 11 }), '</g>');
  });
  out.push(tx(14, 282, 'Cuanto mayores los tres, más alta la ola.', { b: true, s: 11 }));
  return close(out);
}

function marVientoFondo() {
  const W = 320;
  const H = 280;
  const id = 'pmf';
  const out = start(W, H, 'Mar de viento y mar de fondo', id);
  out.push(title(160, 'Mar de viento y mar de fondo'));
  // Nube de temporal a la izquierda, lejos; costa en calma a la derecha.
  out.push(`<path d="M18,62 a12,12 0 0 1 16,-14 a16,16 0 0 1 30,-2 a12,12 0 0 1 20,10 a10,10 0 0 1 -4,18 L24,74 a8,8 0 0 1 -6,-12Z" style="fill:var(--l-nube);stroke:var(--l-g)" stroke-width="1.2"/>`);
  out.push(flecha(30, 90, 70, 90, 'v', id, 2.4), flecha(80, 90, 120, 90, 'v', id, 2.4));
  out.push(tx(98, 54, 'temporal lejano', { s: 10 }));
  out.push(`<path d="M290,100 L312,100 L312,150 L296,150 L292,128Z" style="fill:var(--l-a)" opacity=".45"/>`, tx(310, 92, 'costa', { a: 'end', s: 10 }));
  out.push(tx(252, 62, 'aquí: calma', { a: 'middle', s: 10 }), tx(252, 75, 'o viento de otra dirección', { a: 'middle', s: 10 }));
  // Perfil: mar de viento (corta, puntiaguda) a la izquierda, mar de fondo (larga, redonda) a la derecha.
  const y0 = 128;
  let d = `M8,${y0}`;
  for (let x = 8, i = 0; x < 128; x += 12, i++) {
    const h = [10, 14, 8, 12, 15, 9, 13, 11, 14, 10][i % 10];
    d += ` Q${x + 7},${y0 - h * 0.5} ${x + 9},${y0 - h} L${x + 12},${y0}`;
  }
  out.push(`<path d="${d} L128,150 L8,150Z" style="fill:var(--l-mar)"/><path d="${d}" fill="none" style="stroke:var(--l-v)" stroke-width="1.8"/>`);
  for (const x of [17, 53, 89, 113]) out.push(`<path d="M${x},${y0 - 12} l3,3 l-2,1 l3,3" fill="none" stroke="currentColor" stroke-width="1.1"/>`);
  const p2 = [];
  for (let x = 128; x <= 292; x += 2) p2.push([x, y0 - 4 - 5 * Math.cos((2 * Math.PI * (x - 128)) / 54)]);
  const d2 = p2.map(([x, y], i) => `${i ? 'L' : 'M'}${fx(x)},${fx(y)}`).join('');
  out.push(`<path d="${d2}L292,150L128,150Z" style="fill:var(--l-mar)"/><path d="${d2}" fill="none" style="stroke:var(--l-v)" stroke-width="2"/>`);
  out.push(linea(128, 104, 128, 152, 't', 1, 'stroke-dasharray="3 3" stroke-opacity=".6"'));
  out.push(flecha(150, 108, 250, 108, 't', id, 1.8), tx(200, 100, 'viaja hasta ti', { a: 'middle', s: 10 }));
  // Descripciones.
  out.push(tx(14, 172, 'MAR DE VIENTO', { b: true, c: 'v', s: 11 }));
  out.push(tx(14, 186, 'la levanta el viento de ese momento y lugar', { s: 10 }), tx(14, 199, 'cortas, irregulares, cresta puntiaguda que rompe', { s: 10 }));
  out.push(tx(14, 220, 'MAR DE FONDO (o mar de leva)', { b: true, c: 'p', s: 11 }));
  out.push(tx(14, 234, 'se formó lejos y ha viajado hasta ti', { s: 10 }), tx(14, 247, 'largas, regulares, cresta redondeada', { s: 10 }));
  out.push(tx(14, 268, 'Mares cruzadas o contra corriente: mar confusa.', { b: true, s: 10 }));
  return close(out);
}

export function marCreceIllustration(spec) {
  const vista = spec.vista ?? 'factores';
  if (vista === 'viento-fondo') {
    if (lista(spec.resaltar).length) return null;
    return { svg: marVientoFondo(), caption: 'Mar de viento: la levanta el viento que sopla ahí y entonces; olas cortas, irregulares y de cresta puntiaguda. Mar de fondo (o de leva): se formó lejos y llega larga, regular y redondeada, aunque aquí haya calma o sople otro viento.' };
  }
  if (vista !== 'factores') return null;
  const m = marcas(spec, PARTES_MAR);
  if (!m) return null;
  const CAP = {
    intensidad: 'Intensidad: la fuerza del viento sobre la mar. Con más fuerza, más ola.',
    persistencia: 'Persistencia: el tiempo que lleva soplando con la misma dirección e intensidad.',
    fetch: 'Fetch: la extensión de mar sobre la que sopla el viento con la misma dirección e intensidad. Un viento de tierra levanta poca mar cerca de la costa porque apenas tiene fetch.',
  };
  const s = lista(spec.resaltar);
  const caption = s.length === 1 ? CAP[s[0]] : 'La ola crece con la intensidad (fuerza), la persistencia (tiempo) y el fetch (extensión) del viento, hasta la mar totalmente desarrollada. Cerca de una costa de la que sopla el viento hay poco fetch y poca mar.';
  return { svg: marFactores(m), caption };
}

// ===========================================================================
// 2. Actualizar la declinación (per-10-5).
// spec: { tipo:'declinacion-anual', dm: minutos con signo (E +, W −), anio, variacion: minutos/año con signo, actual }

/** «2° 30′ W» a partir de minutos con signo. */
const gm = (min, conLetra = true) => {
  const a = Math.abs(Math.round(min));
  const g = Math.floor(a / 60);
  const mm = a % 60;
  const t = !g && mm ? `${mm}′` : mm ? `${g}° ${String(mm).padStart(2, '0')}′` : `${g}°`;
  if (!conLetra) return t;
  return min === 0 ? '0°' : `${t} ${min > 0 ? 'E' : 'W'}`;
};
const conSigno = (min) => (min === 0 ? '0°' : `${min > 0 ? '+' : '−'}${gm(min, false)}`);

export function declinacionAnualIllustration(spec) {
  const dm = spec.dm ?? -150;
  const anio = spec.anio ?? 2016;
  const va = spec.variacion ?? 9;
  const actual = spec.actual ?? 2026;
  if (![dm, anio, va, actual].every(Number.isInteger) || actual < anio || Math.abs(dm) > 1800 || Math.abs(va) > 60) return null;
  const n = actual - anio;
  const cambio = n * va;
  const dm2 = dm + cambio;
  const W = 320;
  const H = 286;
  const id = 'pda';
  const out = start(W, H, 'Actualizar la declinación', id);
  out.push(title(160, 'Actualizar la declinación'));
  // Rosa de la carta con su leyenda.
  const rx = 72;
  const ry = 98;
  out.push(`<circle cx="${rx}" cy="${ry}" r="50" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="${rx}" cy="${ry}" r="42" fill="none" stroke="currentColor" stroke-opacity=".5"/>`);
  for (let a = 0; a < 360; a += 10) {
    const [x1, y1] = pol(rx, ry, a, 42);
    const [x2, y2] = pol(rx, ry, a, a % 90 ? 46 : 50);
    out.push(linea(x1, y1, x2, y2, 't', 1));
  }
  out.push(tx(rx, ry - 10, gm(dm), { a: 'middle', b: true, s: 11, halo: false }), tx(rx, ry + 4, String(anio), { a: 'middle', b: true, s: 11, halo: false }));
  out.push(tx(rx, ry + 19, `(${gm(va)} anual)`, { a: 'middle', s: 10, halo: false }));
  out.push(tx(rx, 164, 'rosa de la carta', { a: 'middle', s: 10 }));
  // Nortes: Nv y el Nm del año de la carta y del año actual (ángulos exagerados).
  const ox = 222;
  const oy = 160;
  const R = 100;
  const maxG = Math.max(Math.abs(dm), Math.abs(dm2), 1) / 60;
  const k = Math.min(12, 30 / maxG);
  const a1 = (dm / 60) * k;
  const a2 = (dm2 / 60) * k;
  const tipNv = pol(ox, oy, 0, R);
  out.push(flecha(ox, oy, ...tipNv, 'v', id, 2.2), tx(tipNv[0], tipNv[1] - 6, 'Nv', { a: 'middle', b: true, c: 'v', s: 11 }));
  const t1 = pol(ox, oy, a1, R * 0.92);
  const t2 = pol(ox, oy, a2, R * 0.92);
  if (cambio !== 0) out.push(flecha(ox, oy, ...t1, 'g', id, 1.6, 'stroke-dasharray="4 3"'));
  out.push(flecha(ox, oy, ...t2, 'm', id, 2.8));
  const lado = (a) => (a < 0 ? 'end' : 'start');
  const dx = (a) => (a < 0 ? -4 : 4);
  // Etiquetas a distinta altura para que no se pisen.
  const [la, lb] = Math.abs(a1) >= Math.abs(a2) ? [t1, t2] : [t2, t1];
  const yA = la[1] + 14;
  const yB = Math.min(lb[1] + 4, yA - 18);
  const yOf = (t) => (t === la ? yA : yB);
  if (cambio !== 0) out.push(tx(t1[0] + dx(a1), yOf(t1), `Nm ${anio}`, { a: lado(a1), c: 'g', s: 10 }));
  out.push(tx(t2[0] + dx(a2), yOf(t2), `Nm ${actual}`, { a: lado(a2), b: true, c: 'm', s: 11 }));
  if (Math.abs(a2 - a1) > 3) {
    const ra = 56;
    out.push(arco(ox, oy, ra, a1, a2 > a1 ? a2 - 1.5 : a2 + 1.5, 'a', 2, `marker-end="url(#${id}-ka)"`));
  }
  out.push(`<circle cx="${ox}" cy="${oy}" r="2.5" fill="currentColor"/>`, tx(ox, oy + 14, 'ángulos exagerados', { a: 'middle', s: 9 }));
  // Pasos.
  const y = 192;
  out.push(tx(14, y, '1', { b: true, c: 'a', s: 11 }), tx(28, y, `Años: ${actual} − ${anio} = ${n}`, { s: 11 }));
  out.push(tx(14, y + 18, '2', { b: true, c: 'a', s: 11 }), tx(28, y + 18, `${n} × ${va === 0 ? '0′' : `${Math.abs(va)}′ ${va > 0 ? 'E' : 'W'}`} = ${Math.abs(cambio)}′ = ${gm(cambio)} (${cambio >= 0 ? '+' : '−'})`, { s: 11 }));
  out.push(tx(14, y + 36, '3', { b: true, c: 'a', s: 11 }), tx(28, y + 36, `${conSigno(dm)} ${cambio < 0 ? '−' : '+'} ${gm(cambio, false)} = ${conSigno(dm2)} → <tspan font-weight="700">${gm(dm2)}</tspan>`, { s: 11, c: 'm' }));
  const mismo = dm !== 0 && va !== 0 && Math.sign(dm) === Math.sign(va);
  out.push(tx(14, y + 60, 'E positiva (+), W negativa (−).', { b: true, s: 10 }));
  out.push(tx(14, y + 74, va === 0 || dm === 0 ? 'La variación se suma a la dm con su signo.' : mismo ? 'Variación del mismo signo que la dm: crece.' : 'Variación de signo contrario a la dm: se hace', { s: 10 }));
  if (!(va === 0 || dm === 0 || mismo)) out.push(tx(14, y + 87, 'más pequeña.', { s: 10 }));
  const caption = `La carta da ${gm(dm)} en ${anio} con variación anual ${va === 0 ? '0′' : gm(va)}. En ${actual}: ${n} años × ${Math.abs(va)}′ = ${gm(cambio)}, y ${conSigno(dm)} ${cambio < 0 ? '−' : '+'} ${gm(cambio, false)} = ${gm(dm2)}. Se suma siempre con su signo: E positivo, W negativo.`;
  return { svg: close(out), caption };
}

// ===========================================================================
// 3. Rumbo circular y cuadrantal (per-10-6). spec: { tipo:'rumbo-cuadrantal', rumbo?: 'N64W' (cuadrantal, 0–90) }

/** 'S45W' → { ns, x, ew, circ } o null. */
export function cuadrantalACircular(s) {
  const r = /^([NS])\s*(\d{1,2})\s*([EW])$/.exec(String(s ?? '').toUpperCase().replace(/°/g, ''));
  if (!r) return null;
  const x = Number(r[2]);
  if (x > 90) return null;
  const [ns, , ew] = [r[1], 0, r[3]];
  const circ = ns === 'N' ? (ew === 'E' ? x : 360 - x) : ew === 'E' ? 180 - x : 180 + x;
  return { ns, x, ew, circ: norm(circ) };
}

const CUADRANTES = {
  NE: { f: 'N x E = x', r: '000°–090°' },
  SE: { f: 'S x E = 180° − x', r: '090°–180°' },
  SW: { f: 'S x W = 180° + x', r: '180°–270°' },
  NW: { f: 'N x W = 360° − x', r: '270°–360°' },
};

export function rumboCuadrantalIllustration(spec) {
  const q = cuadrantalACircular(spec.rumbo ?? 'N64W');
  if (!q) return null;
  const W = 320;
  const H = 300;
  const id = 'prc';
  const out = start(W, H, 'Rumbo circular y cuadrantal', id);
  out.push(title(160, 'Circular y cuadrantal'));
  const cx = 160;
  const cy = 142;
  const R = 74;
  const key = q.ns + q.ew;
  // Cuadrante del ejemplo sombreado.
  const a0 = { NE: 0, SE: 90, SW: 180, NW: 270 }[key];
  const [sx1, sy1] = pol(cx, cy, a0, R);
  const [sx2, sy2] = pol(cx, cy, a0 + 90, R);
  out.push(`<path d="M${cx},${cy} L${fx(sx1)},${fx(sy1)} A${R},${R} 0 0 1 ${fx(sx2)},${fx(sy2)}Z" style="fill:var(--l-a)" opacity=".18"/>`);
  out.push(`<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="currentColor" stroke-width="1.3"/>`);
  for (let a = 0; a < 360; a += 10) {
    const [x1, y1] = pol(cx, cy, a, R);
    const [x2, y2] = pol(cx, cy, a, a % 90 ? R - 4 : R - 8);
    out.push(linea(x1, y1, x2, y2, 't', 1));
  }
  out.push(linea(cx, cy - R, cx, cy + R, 't', 1, 'stroke-opacity=".35"'), linea(cx - R, cy, cx + R, cy, 't', 1, 'stroke-opacity=".35"'));
  // Puntos cardinales con su valor circular.
  out.push(tx(cx, cy - R - 6, 'N 000°', { a: 'middle', b: true, s: 11 }), tx(cx, cy + R + 15, 'S 180°', { a: 'middle', b: true, s: 11 }));
  out.push(tx(cx + R + 4, cy - 4, 'E', { b: true, s: 11 }), tx(cx + R + 4, cy + 9, '090°', { s: 10 }));
  out.push(tx(cx - R - 4, cy - 4, 'W', { a: 'end', b: true, s: 11 }), tx(cx - R - 4, cy + 9, '270°', { a: 'end', s: 10 }));
  // Fórmulas en las esquinas.
  const esq = { NW: [10, 50, 'start'], NE: [310, 50, 'end'], SW: [10, 214, 'start'], SE: [310, 214, 'end'] };
  for (const [k, [x, y, a]] of Object.entries(esq)) {
    const on = k === key;
    const [n1, n2] = CUADRANTES[k].f.split(' = ');
    out.push(tx(x, y, `${n1} =`, { a, b: true, s: 11, c: on ? 'a' : null }), tx(x, y + 14, n2, { a, b: on, s: 11, c: on ? 'a' : null }), tx(x, y + 27, CUADRANTES[k].r, { a, s: 9 }));
  }
  // Ejemplo: desde N o S, x grados hacia E o W.
  const ref = q.ns === 'N' ? 0 : 180;
  const [ex, ey] = pol(cx, cy, q.circ, R - 2);
  out.push(flecha(cx, cy, ex, ey, 'v', id, 2.8));
  const hacia = (q.ns === 'N') === (q.ew === 'E') ? 1 : -1; // +1 horario
  const fin = ref + hacia * q.x;
  if (q.x > 0) out.push(arco(cx, cy, 34, Math.min(ref, fin), Math.max(ref, fin), 'r', 2.4));
  const [lx, ly] = q.x < 30 ? pol(cx, cy, ref - hacia * 14, 44) : pol(cx, cy, ref + (hacia * q.x) / 2, 48);
  if (q.x > 0) out.push(tx(lx, ly + 4, `${q.x}°`, { a: 'middle', b: true, c: 'r', s: 11 }));
  out.push(`<circle cx="${cx}" cy="${cy}" r="2.5" fill="currentColor"/>`);
  // Texto del ejemplo.
  const op = { NE: '', SE: `180° − ${q.x}° = `, SW: `180° + ${q.x}° = `, NW: `360° − ${q.x}° = ` }[key];
  const nom = `${q.ns}${q.x}${q.ew}`;
  out.push(tx(14, 256, `${nom}: desde el ${q.ns}, ${q.x}° hacia el ${q.ew}`, { b: true, s: 11 }));
  out.push(tx(14, 271, `${op}${d3(q.circ)}`, { b: true, c: 'v', s: 12 }));
  out.push(tx(14, 290, 'S65E = 115° · S45W = 225° · N64W = 296° · N20E = 020°', { s: 10 }));
  const caption = `El cuadrantal se cuenta de 0° a 90° desde el N o el S hacia el E o el W. ${nom} está en el cuadrante ${CUADRANTES[key].r}: ${op}${d3(q.circ)}.`;
  return { svg: close(out), caption };
}

// ===========================================================================
// 4. Demora y marcación (per-11-5).
// spec: { tipo:'demora-marcacion', rumbo: Rv 0–359, marcacion: −180..180 (estribor +, babor −), resaltar?: 'demora'|'marcacion' }

export function demoraMarcacionIllustration(spec) {
  const rv = spec.rumbo ?? 70;
  const mc = spec.marcacion ?? -100;
  if (!Number.isFinite(rv) || !Number.isFinite(mc) || rv < 0 || rv >= 360 || Math.abs(mc) > 180 || mc === 0) return null;
  const m = marcas(spec, ['demora', 'marcacion']);
  if (!m) return null;
  const dvBruto = rv + mc;
  const dv = norm(dvBruto);
  const W = 320;
  const H = 316;
  const id = 'pdm';
  const out = start(W, H, 'Demora y marcación', id);
  out.push(title(160, 'Demora y marcación'));
  const cx = 160;
  const cy = 150;
  const R = 84;
  const dist = (a, b) => Math.abs((((a - b) % 360) + 540) % 360 - 180);
  // Norte verdadero.
  out.push(flecha(cx, cy, cx, cy - R - 20, 't', id, 1.4), tx(cx, cy - R - 26, 'N', { a: 'middle', b: true, s: 12 }));
  // Línea de crujía hacia proa y la visual al faro.
  const [px, py] = pol(cx, cy, rv, R - 6);
  out.push(linea(cx, cy, px, py, 't', 1.2, 'stroke-dasharray="5 3"'));
  const [fx_, fy] = pol(cx, cy, dv, R);
  out.push(linea(cx, cy, fx_, fy, 'p', 1.6), `<circle cx="${fx(fx_)}" cy="${fx(fy)}" r="7" style="fill:var(--l-faro);stroke:currentColor"/>`);
  // Barco con la proa al rumbo.
  out.push(`<g transform="translate(${cx},${cy}) rotate(${rv})">${hullPlan(48, 18)}</g>`);
  // Etiqueta junto a un punto del círculo, alineada hacia fuera.
  const fuera = (ang, r, t, o) => {
    const [x, y] = pol(cx, cy, ang, r);
    const sn = Math.sin((ang * Math.PI) / 180);
    const cs = Math.cos((ang * Math.PI) / 180);
    return tx(x, y + (cs < -0.4 ? 11 : cs > 0.4 ? -1 : 4), t, { ...o, a: sn > 0.3 ? 'start' : sn < -0.3 ? 'end' : 'middle' });
  };
  if (dist(rv, dv) > 12) out.push(fuera(rv, R - 2, 'proa', { s: 10 }));
  // Arcos: demora (desde el N) y marcación (desde la proa).
  const kD = 'v';
  const kM = 'r';
  const wD = m.on('demora') ? 3.2 : 2.2;
  const wM = m.on('marcacion') ? 3.2 : 2.2;
  const rD = 40;
  const rM = 60;
  // Ángulo cercano a la mitad del arco que más se aleja de las líneas dibujadas.
  const libre = (mid, evitar) => {
    const nota = (a) => Math.min(...evitar.map((e) => dist(a, e))) - Math.abs(a - mid) * 0.5;
    return [0, -15, 15, -30, 30, -45, 45, -60, 60].map((d) => mid + d).reduce((best, a) => (nota(a) > nota(best) ? a : best));
  };
  const lineas = [0, rv, dv];
  out.push(`<g${m.op('demora')}>`, arco(cx, cy, rD, 0, Math.max(dv, 4), kD, wD, `marker-end="url(#${id}-k${kD})"`));
  const aD = libre(dv / 2, lineas);
  out.push(fuera(aD, rD + 6, `Dv ${d3(dv)}`, { b: true, c: kD, s: 11 }), '</g>');
  out.push(`<g${m.op('marcacion')}>`, arco(cx, cy, rM, rv, rv + mc, kM, wM, `marker-end="url(#${id}-k${kM})"`));
  const aM = libre(rv + mc / 2, [...lineas, aD]);
  out.push(fuera(aM, rM + 6, `M ${Math.abs(mc)}° ${mc > 0 ? 'Er' : 'Br'}`, { b: true, c: kM, s: 11 }), '</g>');
  // Bandas del barco, un poco a popa del través (se omiten si una línea pasa por encima).
  for (const [lado, t] of [[1, 'Er'], [-1, 'Br']]) {
    const a = rv + lado * 112;
    if (Math.min(...lineas.map((e) => dist(a, e))) < 16) continue;
    const [bx, by] = pol(cx, cy, a, 24);
    out.push(tx(bx, by + 4, t, { a: 'middle', b: true, s: 10 }));
  }
  // Leyenda y cuenta.
  const y = 262;
  out.push(`<g${m.op('demora')}>`, tx(14, y, 'Demora:', { b: true, c: kD, s: 11 }), tx(72, y, 'desde el norte, 000° a 359°', { s: 11 }), '</g>');
  out.push(`<g${m.op('marcacion')}>`, tx(14, y + 15, 'Marcación:', { b: true, c: kM, s: 11 }), tx(86, y + 15, 'desde la proa, 0–180° Er o Br', { s: 11 }), '</g>');
  const cuenta = `Dv = Rv + M = ${d3(rv)} ${mc > 0 ? '+' : '−'} ${Math.abs(mc)}° = ${dvBruto < 0 || dvBruto >= 360 ? `${String(dvBruto).replace('-', '−')}° → ` : ''}${d3(dv)}`;
  out.push(tx(14, y + 34, cuenta, { b: true, s: 11 }));
  const caption = `Navegando al Rv ${d3(rv)} con el faro ${Math.abs(mc)}° por ${mc > 0 ? 'estribor' : 'babor'}: la demora se cuenta desde el norte y la marcación desde la proa. Dv = Rv + M (estribor +, babor −) = ${d3(dv)}${dvBruto < 0 ? ', sumando 360° porque sale negativa' : dvBruto >= 360 ? ', restando 360° porque pasa de 360°' : ''}.`;
  return { svg: close(out), caption };
}

// ===========================================================================
// 5. Calidad de la situación (per-11-6). spec: { tipo:'calidad-corte', angulo?: ángulo agudo del caso malo (10–45, por defecto 20), resaltar?: 'buena'|'mala' }

/** Rombo donde se cortan dos bandas de anchura ±e alrededor de rectas por (cx, cy) con rumbos a y b. */
function rombo(cx, cy, a, b, e) {
  const n = (t) => [Math.cos((t * Math.PI) / 180), Math.sin((t * Math.PI) / 180)]; // normal a una recta de rumbo t
  const [a1, a2] = n(a);
  const [b1, b2] = n(b);
  const det = a1 * b2 - a2 * b1;
  const pts = [[e, e], [e, -e], [-e, -e], [-e, e]].map(([p, q]) => [cx + (p * b2 - q * a2) / det, cy + (a1 * q - b1 * p) / det]);
  return pts.map(([x, y], i) => `${i ? 'L' : 'M'}${fx(x)},${fx(y)}`).join('') + 'Z';
}

export function calidadCorteIllustration(spec) {
  const ang = spec.angulo ?? 20;
  if (!Number.isFinite(ang) || ang < 10 || ang > 45) return null;
  const m = marcas(spec, ['buena', 'mala']);
  if (!m) return null;
  const W = 320;
  const H = 262;
  const id = 'pcc';
  const out = start(W, H, 'Calidad de la situación', id);
  out.push(title(160, 'Calidad de la situación'));
  const e = 6; // error al trazar, en px a cada lado
  const panel = (x0, rumbos, nom, k, lineaTxt, sub) => {
    const cx = x0 + 78;
    const cy = 114;
    const on = m.on(nom);
    out.push(`<g${m.op(nom)}>`);
    out.push(`<rect x="${x0 + 4}" y="40" width="148" height="146" rx="8" fill="none" stroke="currentColor" stroke-opacity="${on ? 0.9 : 0.3}" stroke-width="${on ? 2 : 1}"/>`);
    out.push(`<path d="${rombo(cx, cy, rumbos[0], rumbos[1], e)}" style="fill:${K[k]};stroke:${K[k]}" fill-opacity=".45" stroke-width="1"/>`);
    for (const r of rumbos) {
      const [x1, y1] = pol(cx, cy, r, 64);
      const [x2, y2] = pol(cx, cy, r + 180, 64);
      out.push(linea(x1, y1, x2, y2, 't', 1.4));
      for (const sg of [-1, 1]) {
        const [ox, oy] = pol(0, 0, r + 90, e * sg);
        out.push(linea(x1 + ox, y1 + oy, x2 + ox, y2 + oy, 't', 0.9, 'stroke-dasharray="3 3" stroke-opacity=".6"'));
      }
      // Faro en el extremo desde el que se traza la demora.
      const [fx1, fy1] = r < 180 ? [x2, y2] : [x1, y1];
      out.push(`<circle cx="${fx(fx1)}" cy="${fx(fy1)}" r="5" style="fill:var(--l-faro);stroke:currentColor"/>`);
    }
    return { cx, cy };
  };
  // Buena: líneas a 90°.
  const b = panel(4, [135, 225], 'buena', 'm');
  out.push(arco(b.cx, b.cy, 22, 135, 225, 'm', 1.8));
  out.push(tx(b.cx, b.cy + 40, '90°', { a: 'middle', b: true, c: 'm', s: 11 }), '</g>');
  // Mala: líneas casi paralelas.
  const ml = panel(164, [270 - ang / 2, 270 + ang / 2], 'mala', 'r');
  const L = e / Math.sin(((ang / 2) * Math.PI) / 180);
  out.push(arco(ml.cx, ml.cy, 50, 270 - ang / 2, 270 + ang / 2, 'r', 1.8));
  out.push(tx(ml.cx - 46, ml.cy + 26, `${ang}°`, { a: 'middle', b: true, c: 'r', s: 11 }));
  out.push(linea(ml.cx - L, ml.cy + 12, ml.cx + L, ml.cy + 12, 'r', 1.2), linea(ml.cx - L, ml.cy + 8, ml.cx - L, ml.cy + 16, 'r', 1.2), linea(ml.cx + L, ml.cy + 8, ml.cx + L, ml.cy + 16, 'r', 1.2));
  out.push('</g>');
  const pie = (cx, t1, t2, k, nom) => out.push(`<g${m.op(nom)}>`, tx(cx, 204, t1, { a: 'middle', b: true, c: k, s: 12 }), tx(cx, 219, t2, { a: 'middle', b: m.on(nom), s: 10 }), '</g>');
  pie(82, 'BUENA', 'corte cerca de 90°', 'm', 'buena');
  pie(242, 'MALA', `corte muy agudo (${ang}°)`, 'r', 'mala');
  out.push(tx(14, 240, 'Zona sombreada: dónde puede estar el barco con', { s: 10 }), tx(14, 253, 'el mismo error pequeño (líneas a trazos) al trazar.', { s: 10 }));
  const caption = 'La situación es más fiable cuanto más se acerque a 90° el ángulo entre las dos líneas. Con líneas casi paralelas, un error pequeño al trazar mueve mucho el corte.';
  return { svg: close(out), caption };
}

// ===========================================================================

export const LAMINAS = {
  'mar-crece': {
    fn: marCreceIllustration,
    params: { vista: ['factores', 'viento-fondo'], resaltar: PARTES_MAR },
    ejemplo: { tipo: 'mar-crece', vista: 'factores' },
  },
  'declinacion-anual': {
    fn: declinacionAnualIllustration,
    params: { dm: 'declinación de la carta en minutos con signo (E +, W −; por defecto −150 = 2° 30′ W)', anio: 'año de la carta (por defecto 2016)', variacion: 'variación anual en minutos con signo (por defecto +9 = 9′ E)', actual: 'año en que navegas (por defecto 2026)' },
    ejemplo: { tipo: 'declinacion-anual', dm: -150, anio: 2016, variacion: 9, actual: 2026 },
  },
  'rumbo-cuadrantal': {
    fn: rumboCuadrantalIllustration,
    params: { rumbo: ['N20E', 'S65E', 'S45W', 'N64W'] },
    ejemplo: { tipo: 'rumbo-cuadrantal', rumbo: 'N64W' },
  },
  'demora-marcacion': {
    fn: demoraMarcacionIllustration,
    params: { rumbo: 'rumbo verdadero 0–359 (por defecto 70)', marcacion: 'marcación −180..180, estribor +, babor − (por defecto −100)', resaltar: ['demora', 'marcacion'] },
    ejemplo: { tipo: 'demora-marcacion', rumbo: 70, marcacion: -100 },
  },
  'calidad-corte': {
    fn: calidadCorteIllustration,
    params: { angulo: 'ángulo de corte del caso malo, 10–45 (por defecto 20)', resaltar: ['buena', 'mala'] },
    ejemplo: { tipo: 'calidad-corte' },
  },
};
