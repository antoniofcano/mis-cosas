// Láminas de navegación del Patrón de Yate: la pantalla del radar con EBL y VRM y el paso de marcación a demora
// (py-3-8), racon, SART y reflector en la pantalla (py-3-8), rumbo tangente para pasar a una distancia de un faro
// con viento (py-4-3) y faro por el través cortado con la derrota (py-4-6).
// Las de carta siguen el orden de src/exams/kit.js: tangent → rvConAbatimiento → ct, y abatimiento → corteRumbo.
// Funciones puras spec → { svg, caption }. Admiten `resaltar` (una parte o lista) para destacar la que trata cada paso.

import { C, open, title, pol, arrow, deg3, fx } from '../kit.js';
import { T, lienzo, flecha, cota, rosaNorte, arcoD, junto, colocaEtiquetas } from '../estilo-c.js';
import { faro as faroC, situacion, esquinaLibre, filaPaso, vientoC, alrededor } from '../carta-c.js';
import { radarPantalla, radarRespondedores } from '../electronica-c.js';

const nf = (n, d = 1) => (+n).toFixed(d).replace('.', ',');
const n0 = (n) => nf(n, Number.isInteger(+n) ? 0 : 1);
const col = (c) => C[c] ?? c;
const norm = (d) => ((d % 360) + 360) % 360;
const norm180 = (d) => { const x = norm(d); return x > 180 ? x - 360 : x; };

/** Partes resaltadas: on(p) dice si se dibuja fuerte; dim(p) atenúa lo que no está resaltado. */
function marcas(spec, validas) {
  const r = spec.resaltar;
  const s = r == null || r === '' ? null : new Set([].concat(r));
  if (s && [...s].some((p) => !validas.includes(p))) return null;
  return {
    activo: !!s,
    on: (p) => !!s && s.has(p),
    dim: (p) => (s && !s.has(p) ? ' opacity=".38"' : ''),
  };
}

/** Texto con halo del color del fondo (se lee aunque cruce una línea). */
function t(x, y, txt, { c = null, a = 'start', b = false, s = null } = {}) {
  // que no se salga del panel (ancho estimado del texto)
  const w = String(txt).replace(/<[^>]*>/g, '').length * (s ?? 10.5) * (b ? 0.56 : 0.5);
  const [i0, i1] = a === 'start' ? [0, w] : a === 'end' ? [-w, 0] : [-w / 2, w / 2];
  if (x + i0 < 6) x = 6 - i0;
  else if (x + i1 > 314) x = 314 - i1;
  const fill = c ? col(c) : 'currentColor';
  return `<text x="${fx(x)}" y="${fx(y)}" class="il-lbl" text-anchor="${a}"${b ? ' font-weight="700"' : ''}${s ? ` font-size="${s}"` : ''} style="fill:${fill};paint-order:stroke;stroke:var(--bg);stroke-width:3px;stroke-linejoin:round">${txt}</text>`;
}
const seg = (p, q, c, w = 2, extra = '') => `<line x1="${fx(p[0])}" y1="${fx(p[1])}" x2="${fx(q[0])}" y2="${fx(q[1])}" stroke="${col(c)}" stroke-width="${w}" ${extra}/>`;
const faro = (p) => `<circle cx="${fx(p[0])}" cy="${fx(p[1])}" r="6" style="fill:var(--l-faro);stroke:currentColor" stroke-width="1.2"/><circle cx="${fx(p[0])}" cy="${fx(p[1])}" r="1.8" fill="currentColor"/>`;
const punto = (p, c = 'currentColor', r = 4) => `<circle cx="${fx(p[0])}" cy="${fx(p[1])}" r="${r}" fill="${col(c)}"/>`;
const obs = (p, c = 'r', w = 2) => `<circle cx="${fx(p[0])}" cy="${fx(p[1])}" r="7" fill="none" stroke="${col(c)}" stroke-width="${w}"/>${punto(p, c, 2.5)}`;
const mas = (p, u, k) => [p[0] + u[0] * k, p[1] + u[1] * k];
const u = (deg) => pol(0, 0, deg, 1);
const norte = (x, y, id, len = 26) => `${arrow(x, y + len / 2, x, y - len / 2, 'g', id, 1.6)}${t(x, y - len / 2 - 4, 'Nv', { c: 'g', a: 'middle', s: 9 })}`;
/** Corte de las rectas p + s·a y q + r·b. */
function corte(p, a, q, b) {
  const den = a[0] * b[1] - a[1] * b[0];
  if (Math.abs(den) < 1e-9) return null;
  const s = ((q[0] - p[0]) * b[1] - (q[1] - p[1]) * b[0]) / den;
  return [p[0] + a[0] * s, p[1] + a[1] * s];
}
/** Escala y traslada (norte arriba) los puntos en millas para que quepan en la caja [x0, y0, x1, y1]. */
function encaja(pts, [x0, y0, x1, y1], maxK = 40) {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const [ax, bx, ay, by] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const k = Math.min(maxK, (x1 - x0) / Math.max(bx - ax, 1e-6), (y1 - y0) / Math.max(by - ay, 1e-6));
  const ox = (x0 + x1) / 2 - ((ax + bx) / 2) * k;
  const oy = (y0 + y1) / 2 - ((ay + by) / 2) * k;
  return { k, P: (p) => [ox + p[0] * k, oy + p[1] * k] };
}
/** Arco de radio r centrado en c entre dos rumbos (de a0 a a1 en sentido horario). */
const arco = (c, r, a0, a1, color = 'currentColor', w = 1.4) => {
  const p0 = pol(c[0], c[1], a0, r);
  const p1 = pol(c[0], c[1], a1, r);
  const large = norm(a1 - a0) > 180 ? 1 : 0;
  return `<path d="M${fx(p0[0])},${fx(p0[1])} A${r},${r} 0 ${large} 1 ${fx(p1[0])},${fx(p1[1])}" fill="none" stroke="${col(color)}" stroke-width="${w}"/>`;
};
/** Banda por la que entra el viento (como windSide de src/nautical/kinematics.js). */
const bandaViento = (de, proa) => { const r = norm180(de - proa); return Math.abs(r) < 1e-9 || Math.abs(Math.abs(r) - 180) < 1e-9 ? null : r > 0 ? 'estribor' : 'babor'; };
const PUNTOS = { 0: 'N', 45: 'NE', 90: 'E', 135: 'SE', 180: 'S', 225: 'SW', 270: 'W', 315: 'NW' };
const nombreViento = (d) => PUNTOS[norm(d)] ?? deg3(d);
const hhmm = (min) => { const m = ((Math.round(min) % 1440) + 1440) % 1440; return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; };
const hora = (h) => { const [a, b] = String(h).split(':').map(Number); return a * 60 + (b || 0); };

// ---------------------------------------------------------------------------
// 1 y 2. Pantalla del radar (EBL, VRM, de marcación a demora) y racon, SART y reflector (py-3-8): en estilo C, en
// src/illustrations/electronica-c.js.
const PARTES_RADAR = ['proa', 'ebl', 'vrm', 'anillos', 'calculo'];
const PARTES_RESP = ['racon', 'sart', 'reflector'];

// ---------------------------------------------------------------------------
// 3. Rumbo para pasar a una distancia de un faro, con viento (py-4-3).
// spec: { tipo:'tangente-viento', dv?, D?, d?, banda?:'babor'|'estribor', ab?, viento?, ct?, resaltar? }
// Cifras del problema modelo: Dv 089,5°, D 10,9 M, d 4 M, por babor → Rs 111°; viento del S, Ab 10° → Rv 121°; Ct +5° → Ra 116°.

const PARTES_TV = ['situacion', 'circulo', 'visual', 'tangente', 'viento', 'rv', 'ra'];

function tangenteViento(spec = {}) {
  const id = 'tv';
  const m = marcas(spec, PARTES_TV);
  const dv = Number(spec.dv ?? 89.5);
  const D = Number(spec.D ?? 10.9);
  const dp = Number(spec.d ?? 4);
  const banda = spec.banda ?? 'babor';
  const abG = Math.abs(Number(spec.ab ?? 10));
  const viento = norm(Number(spec.viento ?? 180));
  const ct = spec.ct == null ? 5 : Number(spec.ct);
  if (!m || !(D > dp && dp > 0) || !['babor', 'estribor'].includes(banda) || ![dv, abG, viento, ct].every(Number.isFinite)) return null;
  // como kit.tangent: α = arcsen(d / D); por estribor Rs = Dv − α, por babor Rs = Dv + α
  const alfa = (Math.asin(dp / D) * 180) / Math.PI;
  const rs = norm(Math.round(banda === 'babor' ? dv + alfa : dv - alfa));
  // como kit.rvConAbatimiento: banda del viento respecto al Rs; Ab + si entra por babor; Rv = Rs − Ab
  const bv = bandaViento(viento, rs);
  if (!bv) return null;
  const ab = bv === 'babor' ? abG : -abG;
  const rv = norm(rs - ab);
  const ra = norm(rv - ct);
  // Estilo C (docs/ESTILO-LAMINAS.md): la tangente (Rs) con una punta, la proa (Rv) a trazos con el barco, los ángulos
  // α y Ab acotados y la cuenta, paso a paso, debajo.
  const W = 358;
  const H = 352;
  const dvTxt = Number.isInteger(dv) ? deg3(dv) : `${nf(dv)}°`.padStart(6, '0');
  const alt = `Rumbo para pasar a ${n0(dp)} millas de un faro, con viento. Desde la situación, la visual al faro (Dv ${dvTxt}, ${n0(D)} millas) y la tangente a la circunferencia de ${n0(dp)} millas, que es el rumbo de superficie (${deg3(rs)}); el viento del ${nombreViento(viento)} abate ${abG}°, así que la proa va metida hacia él: Rv ${deg3(rv)}.`;
  const { out, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
  // geometría en millas (x al E, y al S, como la pantalla)
  const S0 = [0, 0];
  const F0 = pol(0, 0, dv, D);
  const Lt = Math.sqrt(D * D - dp * dp);
  const T0 = pol(0, 0, rs, Lt);
  const E0 = pol(0, 0, rs, Lt * 1.18);
  const pts = [S0, E0, [F0[0] - dp, F0[1] - dp], [F0[0] + dp, F0[1] + dp]];
  const { k, P } = encaja(pts, [52, 44, 306, 200]);
  const S = P(S0);
  const F = P(F0);
  const Tg = P(T0);
  const E = P(E0);
  const r = dp * k;
  const Lrv = Math.hypot(E[0] - S[0], E[1] - S[1]) * 0.5;
  const V = pol(S[0], S[1], rv, Lrv);
  const segs = [[S, F], [S, E], [F, Tg], [S, V]];
  const cajas = [];
  const pet = [];
  // circunferencia de la distancia de paso, con su radio acotado
  out.push(`<g${m.dim('circulo')}><circle cx="${fx(F[0])}" cy="${fx(F[1])}" r="${fx(r)}" fill="none" stroke="${T.tinta}" stroke-width="${m.on('circulo') ? 1.8 : 1.2}" stroke-dasharray="6 4"/>${cota(F[0], F[1], Tg[0], Tg[1], '', { tope: 4 })}</g>`);
  pet.push({ t: `d ${n0(dp)} M`, cands: junto(F, Tg, `d ${n0(dp)} M`, { centro: S }), p: 'circulo', extra: m.dim('circulo') });
  // visual al faro
  out.push(`<g${m.dim('visual')}><line x1="${fx(S[0])}" y1="${fx(S[1])}" x2="${fx(F[0])}" y2="${fx(F[1])}" stroke="${T.apagado}" stroke-width="${m.on('visual') ? 1.6 : 1.1}" stroke-dasharray="3 3"/></g>`);
  const tVis = `Dv ${dvTxt} · ${n0(D)} M`;
  pet.push({ t: tVis, cands: junto(S, F, tVis, { centro: E, ks: [0.6, 0.45, 0.75, 0.3] }), p: 'visual' });
  // α: de la visual a la tangente
  const [b0, b1] = norm180(rs - dv) > 0 ? [dv, rs] : [rs, dv];
  out.push(`<g${m.dim('tangente')}><path d="${arcoD(S[0], S[1], 58, b0, b1)}" fill="none" stroke="${T.tinta}" stroke-width="1"/></g>`);
  const [ax, ay] = pol(S[0], S[1], (b0 + norm180(b1 - b0) / 2), 58);
  pet.push({ t: `α ${nf(alfa)}°`, cands: alrededor([ax, ay]), ref: [ax, ay], p: 'tangente' });
  // la tangente = Rs (una punta) y el punto de tangencia
  out.push(`<g${m.dim('tangente')}>${flecha(S[0], S[1], E[0], E[1], { color: T.tinta, w: m.on('tangente') || !m.activo ? 1.8 : 1.5 })}<circle cx="${fx(Tg[0])}" cy="${fx(Tg[1])}" r="2.6" fill="${T.tinta}"/></g>`);
  pet.unshift({ t: `Rs ${deg3(rs)}`, cands: junto(S, E, `Rs ${deg3(rs)}`, { centro: F, ks: [0.85, 0.7, 0.95] }), p: 'tangente' });
  // la proa (Rv), metida hacia el viento, con el abatimiento acotado
  out.push(`<g${m.dim('rv')}><line x1="${fx(S[0])}" y1="${fx(S[1])}" x2="${fx(V[0])}" y2="${fx(V[1])}" stroke="${T.magenta}" stroke-width="${m.on('rv') ? 2.2 : 1.8}" stroke-dasharray="6 3"/></g>`);
  pet.unshift({ t: `Rv ${deg3(rv)}`, cands: junto(S, V, `Rv ${deg3(rv)}`, { centro: F, ks: [0.95, 0.8, 1.1, 0.65] }), color: T.magenta, p: 'rv' });
  const [c0, c1] = norm180(rs - rv) > 0 ? [rv, rs] : [rs, rv];
  out.push(`<g${m.dim('viento')}><path d="${arcoD(S[0], S[1], 38, c0, c1)}" fill="none" stroke="${T.magenta}" stroke-width="1.2"/></g>`);
  const [bx, by] = pol(S[0], S[1], c0 + norm180(c1 - c0) / 2, 38);
  pet.push({ t: `Ab ${ab > 0 ? '+' : '−'}${abG}°`, cands: alrededor([bx, by]), ref: [bx, by], color: T.magenta, p: 'viento' });
  // faro y situación
  out.push(faroC(F[0], F[1], { destella: false }));
  cajas.push({ x0: F[0] - 9, y0: F[1] - 9, x1: F[0] + 9, y1: F[1] + 9 }, { x0: S[0] - 16, y0: S[1] - 16, x1: S[0] + 16, y1: S[1] + 16 });
  pet.push({ t: 'faro', cands: [[F[0], F[1] - 16], [F[0] + 26, F[1]], [F[0] - 26, F[1]], [F[0], F[1] + 20]], rotulo: true });
  out.push(`<g${m.dim('situacion')}>${situacion(S[0], S[1], { color: T.tinta })}</g>`);
  pet.push({ t: 'situación', cands: [[S[0], S[1] - 18], [S[0], S[1] + 24], [S[0] - 40, S[1]], [S[0] + 40, S[1]]], rotulo: true, p: 'situacion' });
  // viento y norte, en las esquinas libres
  const esq = esquinaLibre([S, F, E, Tg, V], [[W - 34, 36], [34, 36], [W - 34, 186], [34, 186]]);
  out.push(rosaNorte(esq[0], esq[1]));
  cajas.push({ x0: esq[0] - 20, y0: esq[1] - 30, x1: esq[0] + 20, y1: esq[1] + 18 });
  const esqV = esquinaLibre([S, F, E, Tg, V, esq], [[W - 40, 40], [40, 40], [W - 40, 178], [40, 178]]);
  out.push(vientoC(esqV[0], esqV[1] - 6, viento, `viento del ${nombreViento(viento)}`, { p: 'viento', extra: m.dim('viento') }));
  cajas.push({ x0: esqV[0] - 40, y0: esqV[1] - 26, x1: esqV[0] + 40, y1: esqV[1] + 30 });
  out.push(colocaEtiquetas(pet, { W, H: 222, segs, cajas }));
  // cálculo, en el orden de la lección
  out.push(`<line x1="14" y1="222" x2="${W - 14}" y2="222" stroke="${T.tinta}" stroke-width=".6"/>`);
  const sgn = banda === 'babor' ? '+' : '−';
  const filas = [
    ['visual', `Al faro: Dv ${dvTxt}, D = ${n0(D)} M; sen α = ${n0(dp)} / ${n0(D)}`],
    ['tangente', `α ≈ ${nf(alfa)}°; por ${banda}: Rs = Dv ${sgn} α ≈ ${deg3(rs)}`],
    ['viento', `Viento del ${nombreViento(viento)}, por ${bv}: Ab = ${ab > 0 ? '+' : '−'}${abG}°`],
    ['rv', `Rv = Rs − Ab = ${deg3(rs)} ${ab > 0 ? '−' : '+'} ${abG}° = ${deg3(rv)}`],
    ['ra', `Ra = Rv − Ct = ${deg3(rv)} ${ct >= 0 ? '−' : '+'} ${n0(Math.abs(ct))}° = ${deg3(ra)}`],
  ];
  filas.forEach(([p, txt], i) => out.push(filaPaso(22, 244 + i * 22, i + 1, txt, { clave: p === 'rv' || m.on(p), extra: m.dim(p) })));
  out.push(cierra());
  const cap = `La tangente a la circunferencia de ${n0(dp)} millas es la derrota que quieres hacer sobre el agua: el rumbo de superficie (Rs ${deg3(rs)}). Como el viento del ${nombreViento(viento)} te abate ${abG}°, la proa va metida hacia el viento: Rv = Rs − Ab = ${deg3(rv)}, y luego Ra = Rv − Ct.`;
  return { svg: out.join(''), caption: cap };
}

// ---------------------------------------------------------------------------
// 4. Faro por el través cortado con la derrota (py-4-6).
// spec: { tipo:'traves-derrota', rv?, ab?, viento?, banda?:'babor'|'estribor', v?, hi?, millas?, dfaro?, trampa?, resaltar? }
// Cifras del problema modelo: Rv 170°, viento del W que abate 10° → Rs 160°; través de babor Dv 080° (desde el faro 260°);
// 8,4 millas a 8 nudos desde las 10:00 → 11:03; el faro queda a unas 2,5 millas. Trampa: través con el Rs (Dv 070°).

const PARTES_TD = ['salida', 'derrota', 'proa', 'traves', 'corte', 'trampa', 'hora'];

function travesDerrota(spec = {}) {
  const id = 'td';
  const m = marcas(spec, PARTES_TD);
  const rv = norm(Number(spec.rv ?? 170));
  const abG = Math.abs(Number(spec.ab ?? 10));
  const viento = norm(Number(spec.viento ?? 270));
  const banda = spec.banda ?? 'babor';
  const v = Number(spec.v ?? 8);
  const hi = spec.hi ?? '10:00';
  const millas = Number(spec.millas ?? 8.4);
  const dfaro = Number(spec.dfaro ?? 2.5);
  const trampa = spec.trampa ?? true;
  if (!m || !['babor', 'estribor'].includes(banda) || !(v > 0 && millas > 0 && dfaro > 0) || ![rv, abG, viento].every(Number.isFinite) || !/^\d{1,2}:\d{2}$/.test(hi)) return null;
  // como kit.abatimiento: Ab + si el viento entra por babor; Rs = Rv + Ab
  const bv = abG ? bandaViento(viento, rv) : 'babor';
  if (!bv) return null;
  const ab = bv === 'babor' ? abG : -abG;
  const rs = norm(rv + ab);
  const sg = banda === 'estribor' ? 1 : -1;
  const dvT = norm(rv + 90 * sg); // través con el Rv
  const dvMal = norm(rs + 90 * sg); // trampa: con el Rs
  // Estilo C (docs/ESTILO-LAMINAS.md): la derrota (Rs) con una punta; el través, del faro al corte, perpendicular a la
  // PROA (Rv, a trazos, con su ángulo recto); el corte en magenta y la trampa (través con el Rs) apagada.
  const W = 358;
  const H = trampa ? 394 : 372;
  const alt = `Faro por el través: con el Rv ${deg3(rv)} y el viento del ${nombreViento(viento)}, la derrota es el Rs ${deg3(rs)}. El través de ${banda} es la Dv ${deg3(dvT)}, perpendicular a la proa; trazada desde el faro, se corta con la derrota: esa es la situación de las ${hhmm(hora(hi) + (millas / v) * 60)}.`;
  const { out, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
  // geometría en millas
  const S0 = [0, 0];
  const mDib = Math.min(millas, dfaro * 1.6); // la derrota se acorta en el dibujo: es un esquema, no la carta
  const P0 = pol(0, 0, rs, mDib);
  const F0 = pol(P0[0], P0[1], dvT, dfaro);
  const Q0 = corte(S0, u(rs), F0, u(dvMal));
  const E0 = pol(0, 0, rs, mDib + 0.9);
  const pts = [S0, E0, F0, pol(P0[0], P0[1], rv, 1.2)];
  const { k, P } = encaja(pts, [66, 44, 292, 222], 64);
  const S = P(S0);
  const Pc = P(P0);
  const F = P(F0);
  const E = P(E0);
  const Pv = pol(Pc[0], Pc[1], rv, 1.6 * k);
  const segs = [[S, E], [F, Pc], [Pc, Pv]];
  const cajas = [];
  const pet = [];
  // derrota (Rs) desde la salida
  out.push(`<g${m.dim('derrota')}>${flecha(S[0], S[1], E[0], E[1], { color: T.tinta, w: m.on('derrota') || !m.activo ? 1.8 : 1.5 })}</g>`);
  pet.push({ t: `Rs ${deg3(rs)}`, cands: junto(S, E, `Rs ${deg3(rs)}`, { centro: F, ks: [0.35, 0.5, 0.2, 0.65] }), p: 'derrota' });
  // trampa: el través con el Rs
  if (trampa && Q0) {
    const Q = P(Q0);
    segs.push([F, Q]);
    out.push(`<g data-parte="trampa"${m.on('trampa') ? '' : ' opacity=".7"'}><line x1="${fx(F[0])}" y1="${fx(F[1])}" x2="${fx(Q[0])}" y2="${fx(Q[1])}" stroke="${T.apagado}" stroke-width="1.2" stroke-dasharray="2 3"/><circle cx="${fx(Q[0])}" cy="${fx(Q[1])}" r="4.5" fill="none" stroke="${T.apagado}" stroke-width="1.4"/></g>`);
    pet.push({ t: `trampa ${deg3(dvMal)}`, cands: alrededor(Q, [30, 46, 62]), rotulo: true, color: T.apagado, p: 'trampa' });
    cajas.push({ x0: Q[0] - 6, y0: Q[1] - 6, x1: Q[0] + 6, y1: Q[1] + 6 });
  }
  // línea del través: desde el faro, Dv + 180°
  out.push(`<g${m.dim('traves')}><line x1="${fx(F[0])}" y1="${fx(F[1])}" x2="${fx(Pc[0])}" y2="${fx(Pc[1])}" stroke="${T.tinta}" stroke-width="${m.on('traves') ? 2 : 1.6}"/></g>`);
  pet.unshift({ t: `Dv ${deg3(dvT)}`, cands: junto(F, Pc, `Dv ${deg3(dvT)}`, { centro: S }), p: 'traves' });
  // la proa (Rv) en el punto de corte, con el ángulo recto entre la proa y el faro
  const a1 = pol(Pc[0], Pc[1], rv, 10);
  const a2 = pol(Pc[0], Pc[1], dvT, 10);
  const a3 = [a1[0] + a2[0] - Pc[0], a1[1] + a2[1] - Pc[1]];
  out.push(`<g${m.dim('proa')}><line x1="${fx(Pc[0])}" y1="${fx(Pc[1])}" x2="${fx(Pv[0])}" y2="${fx(Pv[1])}" stroke="${T.tinta}" stroke-width="${m.on('proa') ? 1.8 : 1.3}" stroke-dasharray="6 3"/>` +
    `<path d="M${fx(a1[0])},${fx(a1[1])} L${fx(a3[0])},${fx(a3[1])} L${fx(a2[0])},${fx(a2[1])}" fill="none" stroke="${T.tinta}" stroke-width="1"/></g>`);
  pet.push({ t: `proa: Rv ${deg3(rv)}`, cands: junto(Pc, Pv, `proa: Rv ${deg3(rv)}`, { centro: F, ks: [0.9, 1.05, 0.7] }), p: 'proa' });
  // situación de corte, faro y salida
  out.push(`<g${m.dim('corte')}>${situacion(Pc[0], Pc[1])}</g>`, faroC(F[0], F[1], { destella: false }));
  cajas.push({ x0: Pc[0] - 10, y0: Pc[1] - 10, x1: Pc[0] + 10, y1: Pc[1] + 10 }, { x0: F[0] - 9, y0: F[1] - 9, x1: F[0] + 9, y1: F[1] + 9 }, { x0: S[0] - 6, y0: S[1] - 6, x1: S[0] + 6, y1: S[1] + 6 });
  const hora1 = hhmm(hora(hi) + (millas / v) * 60);
  pet.unshift({ t: `situación ${hora1}`, cands: alrededor(Pc, [34, 50, 66]), color: T.magenta, p: 'corte', ref: Pc });
  pet.push({ t: 'faro', cands: alrededor(F, [18, 26]), rotulo: true });
  out.push(`<g${m.dim('salida')}><circle cx="${fx(S[0])}" cy="${fx(S[1])}" r="3.5" fill="${T.tinta}"/></g>`);
  pet.push({ t: `salida ${hi}`, cands: alrededor(S, [26, 40]), rotulo: true, p: 'salida' });
  // viento y norte, en las esquinas libres
  const esq = esquinaLibre([S, Pc, F, E, Pv], [[W - 34, 36], [34, 36], [W - 34, 214], [34, 214]]);
  out.push(rosaNorte(esq[0], esq[1]));
  cajas.push({ x0: esq[0] - 20, y0: esq[1] - 30, x1: esq[0] + 20, y1: esq[1] + 18 });
  const esqV = esquinaLibre([S, Pc, F, E, Pv, esq], [[W - 40, 40], [40, 40], [W - 40, 204], [40, 204]]);
  out.push(vientoC(esqV[0], esqV[1] - 6, viento, `viento del ${nombreViento(viento)}`));
  cajas.push({ x0: esqV[0] - 40, y0: esqV[1] - 26, x1: esqV[0] + 40, y1: esqV[1] + 30 });
  out.push(colocaEtiquetas(pet, { W, H: 250, segs, cajas }));
  // cálculo
  out.push(`<line x1="14" y1="250" x2="${W - 14}" y2="250" stroke="${T.tinta}" stroke-width=".6"/>`);
  const mins = Math.round((millas / v) * 60);
  const abTxt = abG ? `Viento del ${nombreViento(viento)}, por ${bv}: Ab ${ab > 0 ? '+' : '−'}${abG}°; Rs ${deg3(rs)}` : `Sin abatimiento: Rs = Rv = ${deg3(rs)}`;
  const filas = [
    ['derrota', abTxt],
    ['traves', `Través de ${banda}: Dv = Rv ${sg > 0 ? '+' : '−'} 90° = ${deg3(dvT)}`],
    ['corte', `Trazada desde el faro: ${deg3(dvT + 180)}; su corte con el Rs, la situación`],
    ['hora', `${n0(millas)} M / ${n0(v)} nudos ≈ ${Math.floor(mins / 60)} h ${String(mins % 60).padStart(2, '0')} min → HRB ${hora1}`],
    ...(trampa ? [['trampa', `Trampa: el través con el Rs (${deg3(dvMal)}) da otro punto`]] : []),
  ];
  filas.forEach(([p, txt], i) => out.push(filaPaso(22, 274 + i * 24, i + 1, txt, { clave: p === 'traves' || m.on(p), extra: m.dim(p) })));
  out.push(cierra());
  const cap = `El través se mide desde la proa: con el Rv ${deg3(rv)}, el faro por ${banda} está en Dv ${deg3(dvT)}. Esa línea, trazada desde el faro (${deg3(dvT + 180)}), se corta con la derrota que de verdad sigues, el Rs ${deg3(rs)}: ese corte es la situación.${trampa ? ` Calcularlo con el Rs (${deg3(dvMal)}) da un punto muy cercano pero erróneo.` : ''}`;
  return { svg: out.join(''), caption: cap };
}

export const LAMINAS = {
  'radar-pantalla': {
    fn: radarPantalla,
    params: { presentacion: ['ambas', 'proa-arriba', 'norte-arriba'], rumbo: 'Rv 0-359 (por defecto 210)', marcacion: 'marcación circular 0-359 (por defecto 320 = 40° por babor)', resaltar: PARTES_RADAR },
    ejemplo: { tipo: 'radar-pantalla', presentacion: 'ambas' },
  },
  'radar-respondedores': {
    fn: radarRespondedores,
    params: { sart: ['lejos', 'cerca'], resaltar: PARTES_RESP },
    ejemplo: { tipo: 'radar-respondedores' },
  },
  'tangente-viento': {
    fn: tangenteViento,
    params: { banda: ['babor', 'estribor'], dv: 'Dv al faro (por defecto 89,5)', D: 'distancia al faro en millas (por defecto 10,9)', d: 'distancia de paso en millas (por defecto 4)', ab: 'abatimiento en grados (por defecto 10)', viento: 'de dónde sopla, 0-359 (por defecto 180)', ct: 'corrección total (por defecto +5)', resaltar: PARTES_TV },
    ejemplo: { tipo: 'tangente-viento' },
  },
  'traves-derrota': {
    fn: travesDerrota,
    params: { banda: ['babor', 'estribor'], rv: 'rumbo verdadero (por defecto 170)', ab: 'abatimiento en grados (por defecto 10)', viento: 'de dónde sopla (por defecto 270)', v: 'nudos (por defecto 8)', hi: 'HRB de salida "10:00"', millas: 'distancia navegada hasta el corte (por defecto 8,4)', dfaro: 'distancia del corte al faro (por defecto 2,5)', trampa: 'bool: dibuja el corte erróneo con el Rs (por defecto sí)', resaltar: PARTES_TD },
    ejemplo: { tipo: 'traves-derrota' },
  },
};
