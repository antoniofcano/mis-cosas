// Segundas láminas para tres lecciones de navegación del Patrón de Yate:
// loxodrómica frente a ortodrómica en el globo y en la Mercator (py-3-4), XTE, VMG y ETA paso a paso sobre la
// derrota (py-3-9) y carta raster frente a vectorial (py-3-10).
// Funciones puras spec → { svg, caption }. Admiten `resaltar` (una parte o lista) para destacar la que trata cada paso.

import { C, open, title, pol, arrow, fx, rad } from '../kit.js';
import { T, TXT, lienzo, rotulo, arcoD } from '../estilo-c.js';

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
// 2. XTE, VMG y ETA, paso a paso sobre la derrota (py-3-9).
// spec: { tipo:'gnss-calculos', dtg?, sog?, hora?, xte?, banda?: 'R'|'L', angulo?, resaltar? }
// Cifras de la lección: DTG 18,0 M, SOG 6,0 kn a las 10:20 → TTG 3 h, ETA 13:20; XTE 0,05 R (medio cable, ≈ 93 m);
// COG a 20° del BRG → VMG = 6 · cos 20° ≈ 5,6 kn.

const PARTES_GNSS = ['xte', 'vmg', 'eta'];
const hora = (h) => { const [a, b] = String(h).split(':').map(Number); return a * 60 + (b || 0); };
const hhmm = (min) => { const x = ((Math.round(min) % 1440) + 1440) % 1440; return `${String(Math.floor(x / 60)).padStart(2, '0')}:${String(x % 60).padStart(2, '0')}`; };
const duracion = (min) => { const h = Math.floor(Math.round(min) / 60); const r = Math.round(min) % 60; return r ? (h ? `${h} h ${String(r).padStart(2, '0')} min` : `${r} min`) : `${h} h`; };
const decimal = (n) => String(+n).replace('.', ',');
const cables = (x) => (Math.abs(x - 0.05) < 1e-9 ? 'medio cable' : Math.abs(x - 0.1) < 1e-9 ? '1 cable' : `${decimal(+(x * 10).toFixed(2))} cables`);

function gnssCalculos(spec = {}) {
  const ID = 'gc2';
  const m = marcas(spec, PARTES_GNSS);
  if (!m) return null;
  const dtg = +(spec.dtg ?? 18);
  const sog = +(spec.sog ?? 6);
  const h0 = spec.hora ?? '10:20';
  const xte = +(spec.xte ?? 0.05);
  const banda = spec.banda ?? 'R';
  const ang = +(spec.angulo ?? 20);
  if (!(dtg > 0) || !(sog > 0) || !(xte > 0) || !['R', 'L'].includes(banda) || !(ang >= 0 && ang < 90) || !/^\d{1,2}:\d{2}$/.test(String(h0))) return null;
  const ttg = (dtg / sog) * 60;
  const eta = hora(h0) + ttg;
  const vmg = sog * Math.cos(rad(ang));
  const W = 320;
  const H = 364;
  const out = open(W, H, 'XTE, VMG y ETA sobre la derrota', ID);
  out.push(title(160, 'XTE, VMG y ETA sobre la derrota'));

  // --- 1. XTE
  const yR = 80;
  const W1 = [24, yR];
  const W2 = [296, yR];
  const dy = banda === 'R' ? 22 : -22; // navegando hacia la derecha del dibujo, estribor queda abajo
  const P = [150, yR + dy];
  out.push(`<g${m.dim('xte')}>`);
  out.push(t(10, 44, '1 · XTE: cuánto te has apartado de la ruta', { b: true, c: m.on('xte') ? 'a' : null }));
  out.push(seg(W1, W2, 'g', 1.6, 'stroke-dasharray="6 4"'));
  for (const p of [W1, W2]) out.push(`<rect x="${fx(p[0] - 4)}" y="${fx(p[1] - 4)}" width="8" height="8" style="fill:var(--bg);stroke:currentColor" stroke-width="1.8"/>`);
  out.push(t(W1[0] - 4, yR - dy * 0.45 + 4, 'WPT salida', { s: 9 }), t(W2[0] + 4, yR - dy * 0.45 + 4, 'WPT llegada', { a: 'end', s: 9 }));
  out.push(seg([P[0], yR], [P[0], P[1] - Math.sign(dy) * 6], 'a', m.on('xte') ? 3.2 : 2.4));
  out.push(`<g transform="translate(${fx(P[0])} ${fx(P[1])}) rotate(90)"><path d="M0,-9 C3.5,-4 3.5,0 3,6 L-3,6 C-3.5,0 -3.5,-4 0,-9Z" style="fill:var(--l-casco);stroke:currentColor" stroke-width="1.1"/></g>`);
  out.push(t(P[0] + 10, yR + dy / 2 + 4, `XTE ${decimal(xte)} ${banda}`, { c: 'a', b: true }));
  out.push(t(P[0] - 10, yR + dy / 2 + 4, banda === 'R' ? 'a estribor' : 'a babor', { c: 'a', a: 'end', s: 9.5 }));
  out.push(t(10, 126, `${decimal(xte)} M = ${cables(xte)} ≈ ${Math.round(xte * 1852)} m · R derecha, L izquierda`, { s: 9.5 }));
  out.push('</g>');

  // --- 2. VMG
  const yV = 176;
  const O = [26, yV];
  const L = ang > 0 ? Math.min(150, 50 / Math.sin(rad(ang))) : 150;
  const E = pol(O[0], O[1], 90 + ang, L);
  const Lv = L * Math.cos(rad(ang));
  const V = [O[0] + Lv, yV];
  out.push(`<g${m.dim('vmg')}>`);
  out.push(t(10, 152, '2 · VMG: lo que de verdad te acercas al WPT', { b: true, c: m.on('vmg') ? 'm' : null }));
  out.push(seg(V, [292, yV], 'g', 1.4, 'stroke-dasharray="6 4"'));
  out.push(`<rect x="288" y="${yV - 4}" width="8" height="8" style="fill:var(--bg);stroke:currentColor" stroke-width="1.8"/>`);
  out.push(t(296, yV - 9, 'WPT', { a: 'end', s: 9 }));
  out.push(seg(E, V, 'g', 1.2, 'stroke-dasharray="2 3"'));
  out.push(arrow(O[0], O[1], E[0], E[1], 'r', ID, m.on('vmg') ? 3 : 2.4));
  out.push(arrow(O[0], O[1], V[0], V[1], 'm', ID, m.on('vmg') ? 3.6 : 3));
  out.push(t(O[0] + 70, yV - 8, `VMG ${nf(vmg)} kn`, { c: 'm', b: true }));
  out.push(t(O[0] + 6, yV - 8, 'BRG', { c: 'g', s: 9 }));
  out.push(t(E[0] + 8, E[1] + 4, `COG · SOG ${nf(sog)} kn`, { c: 'r', b: true }));
  if (ang > 0) {
    const r0 = 44;
    const p0 = pol(O[0], O[1], 90, r0);
    const p1 = pol(O[0], O[1], 90 + ang, r0);
    out.push(`<path d="M${fx(p0[0])},${fx(p0[1])} A${r0},${r0} 0 0 1 ${fx(p1[0])},${fx(p1[1])}" fill="none" stroke="currentColor" stroke-width="1.2"/>`);
    const pa = pol(O[0], O[1], 90 + ang / 2, r0 + 6);
    out.push(t(pa[0] + 2, pa[1] + 4, `${decimal(ang)}°`, { s: 9.5 }));
  }
  out.push(t(10, 248, `VMG = SOG · cos ${decimal(ang)}° = ${nf(sog)} · ${nf(Math.cos(rad(ang)), 3)} ≈ ${nf(vmg)} kn`, { s: 10 }));
  out.push('</g>');

  // --- 3. ETA
  const yT = 302;
  const T0 = 26;
  const T1 = 294;
  out.push(`<g${m.dim('eta')}>`);
  out.push(t(10, 272, `3 · ETA: ${nf(dtg)} M a ${nf(sog)} kn (SOG)`, { b: true, c: m.on('eta') ? 'v' : null }));
  out.push(`<rect x="${T0}" y="${yT - 4}" width="${T1 - T0}" height="8" rx="4" style="fill:var(--l-mar);stroke:${C.v}" stroke-width="${m.on('eta') ? 2 : 1.4}"/>`);
  const horas = Math.floor(ttg / 60 + 1e-9);
  const marcasT = horas <= 8 ? Array.from({ length: horas + 1 }, (_, i) => i * 60) : [0];
  if (marcasT[marcasT.length - 1] < ttg - 1e-6) marcasT.push(ttg);
  for (const [i, mn] of marcasT.entries()) {
    const x = T0 + ((T1 - T0) * mn) / ttg;
    const ultimo = i === marcasT.length - 1;
    const junto = !ultimo && marcasT.length > 1 && T0 + ((T1 - T0) * marcasT[marcasT.length - 1]) / ttg - x < 58;
    out.push(seg([x, yT - 9], [x, yT + 9], ultimo || i === 0 ? 'v' : 'g', ultimo || i === 0 ? 2 : 1.2));
    if (!junto) {
      out.push(t(x, yT - 13, hhmm(hora(h0) + mn), { a: i === 0 ? 'start' : ultimo ? 'end' : 'middle', s: 9.5, b: ultimo || i === 0, c: ultimo ? 'v' : null }));
      out.push(t(x, yT + 21, i === 0 ? `DTG ${nf(dtg)} M` : ultimo ? 'llegada' : `${nf((sog * mn) / 60)} M`, { a: i === 0 ? 'start' : ultimo ? 'end' : 'middle', s: 9, c: 'g' }));
    }
  }
  out.push(t(10, H - 24, `TTG = DTG / SOG = ${nf(dtg)} / ${nf(sog)} = ${duracion(ttg)}`, { s: 10, b: m.on('eta') }));
  out.push(t(10, H - 10, `ETA = ${h0} + ${duracion(ttg)} = ${hhmm(eta)}`, { s: 10, b: m.on('eta') }));
  out.push('</g>');
  out.push('</svg>');
  const cap = {
    xte: `XTE ${decimal(xte)} ${banda}: estás a ${decimal(xte)} millas (${cables(xte)}, unos ${Math.round(xte * 1852)} m) a la ${banda === 'R' ? 'derecha (estribor)' : 'izquierda (babor)'} de la línea recta entre el WPT de salida y el de llegada. No es lo que falta: eso es el DTG.`,
    vmg: `Si el COG se separa ${decimal(ang)}° de la demora al WPT, de tus ${nf(sog)} nudos solo te acercas al WPT VMG = ${nf(sog)} · cos ${decimal(ang)}° ≈ ${nf(vmg)} nudos.`,
    eta: `TTG = DTG / SOG = ${nf(dtg)} / ${nf(sog)} = ${duracion(ttg)}; a las ${h0}, la ETA es ${hhmm(eta)}.`,
  };
  const lista = m.activo ? PARTES_GNSS.filter((p) => m.on(p)) : [];
  return { svg: out.join(''), caption: lista.length ? lista.map((p) => cap[p]).join(' ') : `Los tres cálculos de la pantalla, uno a uno. ${cap.xte} ${cap.vmg} ${cap.eta}` };
}

// ---------------------------------------------------------------------------
// 3. Carta raster frente a vectorial (py-3-10). spec: { tipo:'carta-raster-vectorial', resaltar?: 'raster'|'vectorial'|'sistemas' }

const PARTES_CARTAS = ['raster', 'vectorial', 'sistemas'];

function cartaRasterVectorial(spec = {}) {
  const ID = 'rv2';
  const m = marcas(spec, PARTES_CARTAS);
  if (!m) return null;
  const W = 320;
  const H = 328;
  const out = open(W, H, 'Carta raster y carta vectorial', ID);
  out.push(title(160, 'Dos tipos de carta electrónica'));

  // --- raster: una imagen hecha de píxeles
  out.push(`<g${m.dim('raster')}>`);
  out.push(t(82, 46, 'Raster (RNC)', { a: 'middle', b: true, c: m.on('raster') ? 'a' : null }));
  const gx = 22;
  const gy = 56;
  const cel = 10;
  const costa = [3, 3, 4, 4, 5, 5, 4, 4, 3, 3, 2, 2]; // filas de tierra por columna
  for (let i = 0; i < 12; i++) {
    for (let j = 0; j < 9; j++) {
      const tierra = j < costa[i];
      const boya = i === 8 && j === 6;
      out.push(`<rect x="${gx + i * cel}" y="${gy + j * cel}" width="${cel}" height="${cel}" style="fill:${boya ? 'var(--l-roja)' : tierra ? 'var(--l-calido)' : 'var(--l-mar)'};stroke:var(--bg)" stroke-width=".6"/>`);
    }
  }
  out.push(`<rect x="${gx}" y="${gy}" width="${12 * cel}" height="${9 * cel}" fill="none" stroke="${m.on('raster') ? C.a : 'currentColor'}" stroke-width="${m.on('raster') ? 2.4 : 1.2}"/>`);
  out.push(t(gx + 60, gy + 103, 'al ampliar: píxeles', { a: 'middle', s: 9, c: 'g' }));
  const ra = ['una imagen escaneada', 'copia de la carta de papel', 'se pixela con el zoom', 'no puede avisarte de nada', 'ocupa más memoria'];
  ra.forEach((s, i) => out.push(t(12, 182 + i * 14, i === 0 ? `<tspan font-weight="700">${s}</tspan>` : `· ${s}`, { s: 9.5 })));
  out.push('</g>');

  // --- vectorial: capas de objetos
  out.push(`<g${m.dim('vectorial')}>`);
  out.push(t(238, 46, 'Vectorial (ENC)', { a: 'middle', b: true, c: m.on('vectorial') ? 'v' : null }));
  const capa = (y, nombre, dentro) => {
    const x = 168;
    out.push(`<path d="M${x + 18},${y} L${x + 108},${y} L${x + 90},${y + 26} L${x},${y + 26}Z" style="fill:var(--l-mar);stroke:${m.on('vectorial') ? C.v : 'currentColor'}" stroke-width="${m.on('vectorial') ? 2 : 1.1}"/>`);
    out.push(dentro(x, y));
    out.push(t(x + 104, y + 18, nombre, { s: 9 }));
  };
  capa(56, 'boyas', (x, y) => `<path d="M${x + 44},${y + 19} l5,-12 l5,12z" style="fill:var(--l-roja)"/><path d="M${x + 66},${y + 19} l0,-11 l9,0 l0,11z" style="fill:var(--l-verde)"/>`);
  capa(88, 'sondas', (x, y) => `<path d="M${x + 14},${y + 20} C${x + 40},${y + 8} ${x + 62},${y + 22} ${x + 92},${y + 6}" fill="none" stroke="${C.v}" stroke-width="1.4" stroke-dasharray="4 2"/>${t(x + 32, y + 22, '5', { s: 9 })}${t(x + 66, y + 13, '12', { s: 9 })}`);
  capa(120, 'tierra', (x, y) => `<path d="M${x + 18},${y + 1} L${x + 70},${y + 1} C${x + 62},${y + 12} ${x + 40},${y + 18} ${x + 12},${y + 18}Z" style="fill:var(--l-calido)"/>`);
  out.push(t(238, 164, '¡Alarma: veril de 5 m!', { a: 'middle', s: 9.5, b: true, c: 'r' }));
  const ve = ['una base de datos', '· objeto a objeto, S-57', '· va por capas', '· no se deforma con el zoom', '· genera alarmas: bajos,', 'zonas prohibidas, veril', 'de seguridad'];
  ve.forEach((s, i) => out.push(t(i >= 5 ? 173 : 166, 182 + i * 14, i === 0 ? `<tspan font-weight="700">${s}</tspan>` : s, { s: 9.5 })));
  out.push('</g>');
  out.push(seg([160, 44], [160, 270], 'g', 1, 'stroke-dasharray="3 3"'));

  // --- sistemas
  const y0 = 280;
  out.push(`<g${m.dim('sistemas')}>`);
  out.push(`<rect x="8" y="${y0}" width="304" height="40" rx="7" fill="none" stroke="${m.on('sistemas') ? C.p : C.g}" stroke-width="${m.on('sistemas') ? 2.2 : 1}"/>`);
  out.push(t(16, y0 + 16, 'ECDIS, ECS y plotter no son cartas: son los', { s: 10, b: m.on('sistemas') }));
  out.push(t(16, y0 + 30, 'sistemas que las muestran. Las dos se actualizan.', { s: 10, b: m.on('sistemas') }));
  out.push('</g>');
  out.push('</svg>');
  const cap = {
    raster: 'La carta raster (RNC) es una imagen escaneada, copia exacta de una carta de papel: al ampliarla se pixela y, como es solo un dibujo, no puede avisarte de nada.',
    vectorial: 'La carta vectorial (ENC) es una base de datos objeto a objeto (cada sonda, boya o veril es un dato), según la norma S-57: va por capas, no se deforma con el zoom y genera alarmas.',
    sistemas: 'ECDIS, ECS y los plotters son los sistemas que muestran las cartas, no tipos de carta. Las ENC oficiales españolas las produce el Instituto Hidrográfico de la Marina.',
  };
  const lista = m.activo ? PARTES_CARTAS.filter((p) => m.on(p)) : [];
  return { svg: out.join(''), caption: lista.length ? lista.map((p) => cap[p]).join(' ') : `${cap.raster} ${cap.vectorial} Las dos se actualizan; ECDIS, ECS y plotter son sistemas, no cartas.` };
}

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
