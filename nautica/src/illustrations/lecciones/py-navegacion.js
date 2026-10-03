// Láminas de navegación del Patrón de Yate: la pantalla del radar con EBL y VRM y el paso de marcación a demora
// (py-3-8), racon, SART y reflector en la pantalla (py-3-8), rumbo tangente para pasar a una distancia de un faro
// con viento (py-4-3) y faro por el través cortado con la derrota (py-4-6).
// Las de carta siguen el orden de src/exams/kit.js: tangent → rvConAbatimiento → ct, y abatimiento → corteRumbo.
// Funciones puras spec → { svg, caption }. Admiten `resaltar` (una parte o lista) para destacar la que trata cada paso.

import { C, open, title, pol, arrow, deg3, fx } from '../kit.js';

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
// 1. Pantalla del radar: presentaciones, EBL y VRM, y de marcación a demora (py-3-8).
// spec: { tipo:'radar-pantalla', presentacion?:'ambas'|'proa-arriba'|'norte-arriba', rumbo?, marcacion?, resaltar? }
// Cifras de la lección: Rv 210°, eco a 40° por babor (marcación circular 320°) → Dv 170°.

const PARTES_RADAR = ['proa', 'ebl', 'vrm', 'anillos', 'calculo'];

/** Una pantalla de radar centrada en (x, y) de radio R. `arriba` es el rumbo verdadero que queda arriba. */
function pantalla(out, m, id, [x, y], R, arriba, rv, dv, { leyendas = false, norteMarca = true } = {}) {
  const sc = (b) => norm(b - arriba); // ángulo en pantalla de un rumbo verdadero
  out.push(`<circle cx="${x}" cy="${y}" r="${R}" style="fill:var(--l-mar)" fill-opacity=".22" stroke="currentColor" stroke-width="1.6"/>`);
  // escala de grados del borde (de la pantalla: 000 arriba)
  for (let a = 0; a < 360; a += 10) {
    const [p, q] = [pol(x, y, a, R), pol(x, y, a, R - (a % 30 ? 3 : 6))];
    out.push(seg(p, q, 'currentColor', 1));
  }
  // anillos fijos
  out.push(`<g${m.dim('anillos')}>`);
  for (const f of [1 / 3, 2 / 3]) out.push(`<circle cx="${x}" cy="${y}" r="${fx(R * f)}" fill="none" stroke="${C.g}" stroke-width="${m.on('anillos') ? 1.8 : 0.9}"/>`);
  out.push('</g>');
  const dEco = R * 0.56;
  const aEco = sc(dv);
  const eco = pol(x, y, aEco, dEco);
  // VRM: anillo variable hasta el borde más próximo del eco
  out.push(`<g${m.dim('vrm')}><circle cx="${x}" cy="${y}" r="${fx(dEco - 3)}" fill="none" stroke="${C.m}" stroke-width="${m.on('vrm') ? 3 : 2}" stroke-dasharray="6 3"/></g>`);
  // EBL: línea electrónica desde el centro, pasando por el eco
  const fin = pol(x, y, aEco, R - 1);
  out.push(`<g${m.dim('ebl')}>${seg([x, y], fin, 'v', m.on('ebl') ? 3 : 2, 'stroke-dasharray="7 3"')}</g>`);
  // línea de proa (línea de fe)
  const pr = pol(x, y, sc(rv), R);
  out.push(`<g${m.dim('proa')}>${seg([x, y], pr, 'currentColor', m.on('proa') ? 3.2 : 2.4)}</g>`);
  // eco y barco propio
  out.push(`<ellipse cx="${fx(eco[0])}" cy="${fx(eco[1])}" rx="5" ry="3.5" transform="rotate(${fx(aEco)} ${fx(eco[0])} ${fx(eco[1])})" fill="${C.a}" stroke="currentColor" stroke-width=".8"/>`);
  out.push(punto([x, y], 'currentColor', 2.6));
  // marcas fuera del borde: proa y norte
  const lp = pol(x, y, sc(rv), R + 9);
  out.push(t(lp[0], lp[1] + 4, 'proa', { a: 'middle', b: true, s: 10 }));
  if (norteMarca) {
    const ln = pol(x, y, sc(0), R + 9);
    if (Math.abs(norm180(sc(0) - sc(rv))) > 20) out.push(t(ln[0], ln[1] + 4, 'N', { c: 'g', a: 'middle', b: true, s: 10 }));
  }
  // etiquetas dentro: EBL junto a su extremo, VRM en el anillo, lejos de la EBL y de la proa
  const lado = norm180(aEco - sc(rv)) > 0 ? -1 : 1;
  const pe = mas(pol(x, y, aEco, R * 0.84), u(aEco + 90 * lado), 9);
  out.push(`<g${m.dim('ebl')}>${t(pe[0], pe[1] + 4, 'EBL', { c: 'v', a: 'middle', b: true, s: 10 })}</g>`);
  const libres = [45, 135, 225, 315].map((a) => [a, Math.min(Math.abs(norm180(a - aEco)), Math.abs(norm180(a - sc(rv))))]).sort((p, q) => q[1] - p[1]);
  const pv = pol(x, y, libres[0][0], dEco + 9);
  out.push(`<g${m.dim('vrm')}>${t(pv[0], pv[1] + 4, 'VRM', { c: 'm', a: 'middle', b: true, s: 10 })}</g>`);
  if (leyendas) {
    const pa = pol(x, y, libres[1][0], R * 0.86);
    out.push(`<g${m.dim('anillos')}>${t(pa[0], pa[1] + 4, 'anillos', { c: 'g', a: 'middle', s: 9 })}</g>`);
    out.push(t(eco[0], eco[1] + (Math.cos((aEco * Math.PI) / 180) < 0 ? 16 : -9), 'eco', { a: 'middle', s: 9.5, b: true }));
  }
}

function radarPantalla(spec = {}) {
  const id = 'rp';
  const m = marcas(spec, PARTES_RADAR);
  const pres = spec.presentacion ?? 'ambas';
  if (!m || !['ambas', 'proa-arriba', 'norte-arriba'].includes(pres)) return null;
  const rv = norm(Number(spec.rumbo ?? 210));
  const M = norm(Number(spec.marcacion ?? 320));
  if (!Number.isFinite(rv) || !Number.isFinite(M)) return null;
  const dv = norm(rv + M);
  const mb = M > 180 ? 360 - M : M; // marcación por banda
  const banda = M === 0 ? 'proa' : M === 180 ? 'popa' : M > 180 ? 'babor' : 'estribor';
  const W = 320;
  const H = 276;
  const out = open(W, H, 'Pantalla del radar: EBL, VRM y presentaciones', id);
  const sumaTxt = `Dv = Rv + M = ${deg3(rv)} + ${deg3(M)}${rv + M >= 360 ? ' − 360°' : ''} = ${deg3(dv)}`;
  const bandaTxt = banda === 'babor' ? `${n0(mb)}° por babor: ${deg3(rv)} − ${n0(mb)}° = ${deg3(dv)}` : banda === 'estribor' ? `${n0(mb)}° por estribor: ${deg3(rv)} + ${n0(mb)}° = ${deg3(dv)}` : `eco por la ${banda}`;
  if (pres === 'ambas') {
    out.push(title(160, 'Mismo eco, dos presentaciones'));
    out.push(t(82, 44, 'Proa arriba (H-UP)', { a: 'middle', b: true, s: 11 }), t(238, 44, 'Norte arriba (N-UP)', { a: 'middle', b: true, s: 11 }));
    pantalla(out, m, id, [82, 124], 58, rv, rv, dv);
    pantalla(out, m, id, [238, 124], 58, 0, rv, dv);
    out.push(`<g${m.dim('ebl')}>`);
    out.push(t(82, 210, `EBL ${deg3(M)}`, { c: 'v', a: 'middle', b: true, s: 11 }), t(82, 224, '= marcación', { a: 'middle', s: 10 }));
    out.push(t(238, 210, `EBL ${deg3(dv)}`, { c: 'v', a: 'middle', b: true, s: 11 }), t(238, 224, '= demora (Dv)', { a: 'middle', s: 10 }));
    out.push('</g>');
    out.push(`<g${m.dim('calculo')}>${t(160, 248, sumaTxt, { a: 'middle', b: true, s: 11 })}${t(160, 264, `(${bandaTxt})`, { a: 'middle', s: 10 })}</g>`);
  } else {
    const hup = pres === 'proa-arriba';
    out.push(title(160, hup ? 'Radar en proa arriba (H-UP)' : 'Radar en norte arriba (N-UP)'));
    pantalla(out, m, id, [104, 130], 82, hup ? rv : 0, rv, dv, { leyendas: true });
    const x = 202;
    const fila = (y, linea, txt1, txt2, p, c) => out.push(`<g${m.dim(p)}>${linea}${t(x + 26, y + 4, txt1, { c, b: true, s: 10.5 })}${t(x + 26, y + 17, txt2, { s: 9.5 })}</g>`);
    fila(52, seg([x, 52], [x + 20, 52], 'currentColor', m.on('proa') ? 3.2 : 2.4), 'Línea de proa', hup ? 'arriba, en la crujía' : `al ${deg3(rv)} (el Rv)`, 'proa', null);
    fila(88, seg([x, 88], [x + 20, 88], 'v', m.on('ebl') ? 3 : 2, 'stroke-dasharray="7 3"'), `EBL ${deg3(hup ? M : dv)}`, hup ? '= marcación' : '= demora (Dv)', 'ebl', 'v');
    fila(124, seg([x, 124], [x + 20, 124], 'm', m.on('vrm') ? 3 : 2, 'stroke-dasharray="6 3"'), 'VRM', '= distancia al eco', 'vrm', 'm');
    fila(160, seg([x, 160], [x + 20, 160], 'g', m.on('anillos') ? 1.8 : 1), 'Anillos fijos', 'solo de referencia', 'anillos', 'g');
    out.push(t(x, 196, hup ? 'Al cambiar de rumbo,' : 'Al cambiar de rumbo,', { s: 9.5 }), t(x, 208, hup ? 'toda la imagen gira.' : 'la imagen no gira.', { s: 9.5, b: true }));
    out.push(`<g${m.dim('calculo')}>${t(160, 248, sumaTxt, { a: 'middle', b: true, s: 11 })}${t(160, 264, `(${bandaTxt})`, { a: 'middle', s: 10 })}</g>`);
  }
  out.push('</svg>');
  const cap = {
    ambas: `El mismo eco en las dos presentaciones. En proa arriba la línea de proa va arriba y la EBL da la marcación (${deg3(M)}); en norte arriba el norte va arriba y la EBL da la demora. Para pasar de una a otra: Dv = Rv + M = ${deg3(dv)}.`,
    'proa-arriba': 'En proa arriba la línea de proa va arriba, sobre la crujía: la EBL da la marcación del eco y el VRM su distancia. Para trazarla en la carta necesitas el rumbo: Dv = Rv + M.',
    'norte-arriba': 'En norte arriba el norte va arriba y la imagen no gira al cambiar de rumbo: la EBL da directamente la demora del eco y el VRM su distancia.',
  };
  return { svg: out.join(''), caption: cap[pres] };
}

// ---------------------------------------------------------------------------
// 2. Racon, SART y reflector de radar en la pantalla (py-3-8). spec: { tipo:'radar-respondedores', sart?:'lejos'|'cerca', resaltar? }

const PARTES_RESP = ['racon', 'sart', 'reflector'];

function radarRespondedores(spec = {}) {
  const id = 'rr';
  const m = marcas(spec, PARTES_RESP);
  const sart = spec.sart ?? 'lejos';
  if (!m || !['lejos', 'cerca'].includes(sart)) return null;
  const W = 320;
  const H = 262;
  const out = open(W, H, 'Racon, SART y reflector en el radar', id);
  out.push(title(160, 'Racon, SART y reflector en el radar'));
  const [x, y, R] = [94, 134, 82];
  out.push(`<circle cx="${x}" cy="${y}" r="${R}" style="fill:var(--l-mar)" fill-opacity=".22" stroke="currentColor" stroke-width="1.6"/>`);
  for (const f of [1 / 3, 2 / 3]) out.push(`<circle cx="${x}" cy="${y}" r="${fx(R * f)}" fill="none" stroke="${C.g}" stroke-width=".9"/>`);
  out.push(seg([x, y], [x, y - R], 'currentColor', 2), punto([x, y], 'currentColor', 2.6));
  const num = (p, n, on) => `<circle cx="${fx(p[0])}" cy="${fx(p[1])}" r="7.5" fill="currentColor"/><text x="${fx(p[0])}" y="${fx(p[1] + 3.6)}" text-anchor="middle" font-size="10" font-weight="700" style="fill:var(--bg)">${n}</text>${on ? '' : ''}`;
  // 1. Racon: eco de la boya y, detrás, la letra Morse en línea radial («D» = − · ·)
  const aR = 50;
  const g1 = [`<g${m.dim('racon')}>`];
  const eR = pol(x, y, aR, R * 0.4);
  g1.push(`<circle cx="${fx(eR[0])}" cy="${fx(eR[1])}" r="3.5" fill="${C.a}" stroke="currentColor" stroke-width=".8"/>`);
  const wR = m.on('racon') ? 5 : 4;
  let r0 = R * 0.4 + 9;
  for (const [lng, gap] of [[16, 5], [4, 5], [4, 0]]) { g1.push(seg(pol(x, y, aR, r0), pol(x, y, aR, r0 + lng), 'a', wR, 'stroke-linecap="butt"')); r0 += lng + gap; }
  g1.push(num(pol(x, y, aR - 13, R * 0.4 + 6), 1), '</g>');
  out.push(g1.join(''));
  // 2. SART: 12 puntos alejándose del centro desde su posición; de cerca, arcos
  const aS = 140;
  const g2 = [`<g${m.dim('sart')}>`];
  const rS = R * 0.22;
  if (sart === 'lejos') {
    for (let i = 0; i < 12; i++) { const p = pol(x, y, aS, rS + (i * (R * 0.96 - rS)) / 11); g2.push(punto(p, 'r', m.on('sart') ? 2.6 : 2.2)); }
    g2.push(num(pol(x, y, aS - 14, R * 0.5), 2));
  } else {
    for (let i = 0; i < 12; i++) { const rr = rS + (i * (R * 0.9 - rS)) / 11; g2.push(arco([x, y], fx(rr), aS - 18 - i * 3, aS + 18 + i * 3, 'r', m.on('sart') ? 2.4 : 1.8)); }
    g2.push(num(pol(x, y, aS - 40, R * 0.5), 2));
  }
  g2.push('</g>');
  out.push(g2.join(''));
  // 3. Reflector: un barco pequeño no metálico que, con reflector, da un eco claro
  const eB = pol(x, y, 290, R * 0.62);
  out.push(`<g${m.dim('reflector')}><ellipse cx="${fx(eB[0])}" cy="${fx(eB[1])}" rx="5" ry="3.5" fill="${C.a}" stroke="currentColor" stroke-width=".8"/>${num(pol(x, y, 290, R * 0.62 + 16), 3)}</g>`);
  // leyenda
  const lx = 184;
  const ley = (yy, n, p, tit, lineas, c) => out.push(`<g${m.dim(p)}>${num([lx + 7, yy - 4], n)}${t(lx + 19, yy, tit, { b: true, s: 11, c })}${lineas.map((l, i) => t(lx + 19, yy + 14 + 12 * i, l, { s: 9.5 })).join('')}</g>`);
  ley(52, 1, 'racon', 'Racon', ['letra Morse detrás', 'de su eco (D = −··)'], 'a');
  ley(106, 2, 'sart', 'SART', sart === 'lejos' ? ['12 puntos que se', 'alejan del centro', '(radar de banda X)'] : ['de cerca, los', 'puntos se vuelven', 'arcos'], 'r');
  ley(172, 3, 'reflector', 'Reflector', ['hace visible un', 'barco pequeño', 'no metálico'], null);
  out.push(t(160, 238, 'Racon: baliza respondedora en faros, boyas o puentes.', { a: 'middle', s: 10 }), t(160, 252, 'SART: respondedor de socorro (lo interroga tu radar).', { a: 'middle', s: 10 }));
  out.push('</svg>');
  const cap = sart === 'lejos'
    ? 'El racon responde a tu pulso con una letra Morse en línea radial detrás de su eco; la «D» marca un nuevo peligro o pecio. El SART aparece como una línea de 12 puntos que se aleja del centro desde su posición. El reflector hace visible un barco pequeño no metálico.'
    : 'De cerca, los 12 puntos del SART se convierten en arcos alrededor del centro de la pantalla. El racon sigue mostrando su letra Morse detrás del eco.';
  return { svg: out.join(''), caption: cap };
}

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
  const W = 320;
  const H = 306;
  const out = open(W, H, 'Rumbo para pasar a una distancia de un faro, con viento', id);
  out.push(title(160, 'Con viento, la tangente es el Rs'));
  // geometría en millas (x al E, y al S, como la pantalla)
  const S0 = [0, 0];
  const F0 = pol(0, 0, dv, D);
  const Lt = Math.sqrt(D * D - dp * dp);
  const T0 = pol(0, 0, rs, Lt);
  const E0 = pol(0, 0, rs, Lt * 1.18);
  const pts = [S0, E0, [F0[0] - dp, F0[1] - dp], [F0[0] + dp, F0[1] + dp]];
  const { k, P } = encaja(pts, [40, 50, 270, 168]);
  const S = P(S0);
  const F = P(F0);
  const T = P(T0);
  const E = P(E0);
  const r = dp * k;
  // circunferencia de la distancia de paso
  out.push(`<g${m.dim('circulo')}><circle cx="${fx(F[0])}" cy="${fx(F[1])}" r="${fx(r)}" fill="none" stroke="${C.a}" stroke-width="${m.on('circulo') ? 2.6 : 1.6}" stroke-dasharray="5 3"/>${seg(F, T, 'a', 1.2)}</g>`);
  // visual al faro
  out.push(`<g${m.dim('visual')}>${seg(S, F, 'g', m.on('visual') ? 2.4 : 1.4, 'stroke-dasharray="3 3"')}</g>`);
  // tangente = Rs
  out.push(`<g${m.dim('tangente')}>${arrow(S[0], S[1], E[0], E[1], 'v', id, m.on('tangente') || !m.activo ? 3.2 : 2.4)}${punto(T, 'v', 2.5)}</g>`);
  // Rv: la proa, metida hacia el viento
  const Lrv = Math.hypot(E[0] - S[0], E[1] - S[1]) * 0.55;
  const V = pol(S[0], S[1], rv, Lrv);
  out.push(`<g${m.dim('rv')}>${arrow(S[0], S[1], V[0], V[1], 'r', id, m.on('rv') ? 3.2 : 2.4)}</g>`);
  // arco del abatimiento entre Rv y Rs, con su etiqueta por fuera del lado del Rv
  const [a0, a1] = norm(rs - rv) < 180 ? [rv, rs] : [rs, rv];
  const lado = norm180(rs - rv) > 0 ? 1 : -1; // el Rs queda a la derecha (+1) o a la izquierda (−1) del Rv
  out.push(`<g${m.dim('viento')}>${arco(S, 40, a0, a1, 'currentColor', m.on('viento') ? 2.4 : 1.4)}`);
  const pAb = pol(S[0], S[1], rv - lado * 22, 42);
  out.push(t(pAb[0], pAb[1] + 4, `Ab ${abG}°`, { a: pAb[0] < S[0] - 4 ? 'end' : pAb[0] > S[0] + 4 ? 'start' : 'middle', b: true, s: 10 }));
  // flecha del viento (sopla de `viento` hacia viento+180), en la esquina inferior izquierda
  const hacia = u(viento + 180);
  const wc = [40, 170];
  const w0 = mas(wc, hacia, -14);
  const w1 = mas(wc, hacia, 14);
  const nrm = [-hacia[1] * 4, hacia[0] * 4];
  out.push(arrow(w0[0] + nrm[0], w0[1] + nrm[1], w1[0] + nrm[0], w1[1] + nrm[1], 'g', id, 2.2), arrow(w0[0] - nrm[0], w0[1] - nrm[1], w1[0] - nrm[0], w1[1] - nrm[1], 'g', id, 2.2));
  out.push(t(wc[0], 198, `viento ${nombreViento(viento)}`, { c: 'g', a: 'middle', b: true, s: 10 }), '</g>');
  // etiquetas de Rs y Rv, cada una más allá de la punta de su flecha
  const punta = (q, deg, txt1, txt2, c, p, dy0 = 0) => {
    const n = u(deg);
    const a = n[0] > 0.35 ? 'start' : n[0] < -0.35 ? 'end' : 'middle';
    const r0 = mas(q, n, 8);
    const dy = (n[1] > 0.5 ? 12 : n[1] < -0.5 ? -16 : 4) + dy0;
    out.push(`<g${m.dim(p)}>${t(r0[0], r0[1] + dy, txt1, { c, a, b: true, s: 10.5 })}${t(r0[0], r0[1] + dy + 12, txt2, { a, s: 9.5 })}</g>`);
  };
  punta(E, rs, `Rs ${deg3(rs)}`, 'la tangente', 'v', 'tangente');
  punta(V, rv, `Rv ${deg3(rv)}`, 'la proa', 'r', 'rv');
  // faro, situación y norte
  const ufs = u(dv);
  const lf = mas(F, ufs, 0);
  out.push(faro(F), t(lf[0], lf[1] - 10, 'faro', { a: 'middle', b: true, s: 9.5 }));
  const mr = [(F[0] + T[0]) / 2, (F[1] + T[1]) / 2];
  const nr = u(rs); // perpendicular al radio, hacia fuera de la situación
  out.push(`<g${m.dim('circulo')}>${t(mr[0] + nr[0] * 7, mr[1] + nr[1] * 7 + 4, `d = ${n0(dp)} M`, { c: 'a', a: nr[0] >= 0 ? 'start' : 'end', b: true, s: 10 })}</g>`);
  const ns = u(dv + 180);
  out.push(`<g${m.dim('situacion')}>${obs(S, 'currentColor', m.on('situacion') ? 2.6 : 1.8)}${t(S[0] + ns[0] * 4, S[1] - 13, 'situación', { a: 'middle', b: m.on('situacion'), s: 10 })}</g>`);
  out.push(norte(298, 186, id));
  // cálculo, en el orden de la lección
  const fila = (yy, s, b, p) => out.push(`<g${m.dim(p)}>${t(14, yy, s, { s: 10.5, b: b || m.on(p) })}</g>`);
  const sgn = banda === 'babor' ? '+' : '−';
  fila(H - 84, `1. Al faro: Dv ${Number.isInteger(dv) ? deg3(dv) : `${nf(dv)}°`}, D = ${n0(D)} M; sen α = ${n0(dp)} / ${n0(D)}`, false, 'visual');
  fila(H - 68, `2. α ≈ ${nf(alfa)}° → por ${banda}: Rs = Dv ${sgn} α ≈ ${deg3(rs)}`, false, 'tangente');
  fila(H - 52, `3. Viento del ${nombreViento(viento)} por ${bv} → Ab = ${ab > 0 ? '+' : '−'}${abG}°`, false, 'viento');
  fila(H - 36, `4. Rv = Rs − Ab = ${deg3(rs)} ${ab > 0 ? '−' : '+'} ${abG}° = ${deg3(rv)}`, true, 'rv');
  fila(H - 20, `5. Ra = Rv − Ct = ${deg3(rv)} ${ct >= 0 ? '−' : '+'} ${n0(Math.abs(ct))}° = ${deg3(ra)}`, false, 'ra');
  out.push('</svg>');
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
  const W = 320;
  const H = 306;
  const out = open(W, H, 'Faro por el través y corte con la derrota', id);
  out.push(title(160, 'El través, con el Rv; la derrota, con el Rs'));
  // geometría en millas
  const S0 = [0, 0];
  const mDib = Math.min(millas, dfaro * 1.6); // la derrota se acorta en el dibujo: es un esquema, no la carta
  const P0 = pol(0, 0, rs, mDib);
  const F0 = pol(P0[0], P0[1], dvT, dfaro);
  const Q0 = corte(S0, u(rs), F0, u(dvMal));
  const E0 = pol(0, 0, rs, mDib + 0.9);
  const pts = [S0, E0, F0, pol(P0[0], P0[1], rv, 1.2)];
  const { k, P } = encaja(pts, [56, 50, 210, 200], 44);
  const S = P(S0);
  const Pc = P(P0);
  const F = P(F0);
  const E = P(E0);
  const derecha = F[0] >= Pc[0];
  // derrota (Rs) desde la salida
  out.push(`<g${m.dim('derrota')}>${arrow(S[0], S[1], E[0], E[1], 'v', id, m.on('derrota') || !m.activo ? 3 : 2.2)}</g>`);
  // trampa: el través con el Rs
  if (trampa && Q0) {
    const Q = P(Q0);
    out.push(`<g${m.on('trampa') ? '' : ' opacity=".55"'}>${seg(F, Q, 'g', m.on('trampa') ? 1.8 : 1.2, 'stroke-dasharray="2 3"')}<circle cx="${fx(Q[0])}" cy="${fx(Q[1])}" r="4" fill="none" stroke="${C.g}" stroke-width="1.4"/></g>`);
  }
  // línea del través: desde el faro, Dv + 180°
  out.push(`<g${m.dim('traves')}>${seg(F, Pc, 'r', m.on('traves') ? 3 : 2.2)}</g>`);
  // la proa (Rv) en el punto de corte, con el ángulo recto entre la proa y el faro
  const Pv = pol(Pc[0], Pc[1], rv, 1.6 * k);
  const a1 = pol(Pc[0], Pc[1], rv, 10);
  const a2 = pol(Pc[0], Pc[1], dvT, 10);
  const a3 = [a1[0] + a2[0] - Pc[0], a1[1] + a2[1] - Pc[1]];
  out.push(`<g${m.dim('proa')}>${seg(Pc, Pv, 'currentColor', m.on('proa') ? 2.4 : 1.6, 'stroke-dasharray="5 3"')}<path d="M${fx(a1[0])},${fx(a1[1])} L${fx(a3[0])},${fx(a3[1])} L${fx(a2[0])},${fx(a2[1])}" fill="none" stroke="currentColor" stroke-width="1.2"/></g>`);
  // situación de corte
  out.push(`<g${m.dim('corte')}>${obs(Pc, 'r', m.on('corte') ? 2.8 : 2)}</g>`);
  // faro
  out.push(faro(F));
  // etiquetas a la derecha del dibujo (o a la izquierda si el faro queda a la izquierda)
  const lx = derecha ? Math.max(F[0], Pc[0]) + 12 : Math.min(F[0], Pc[0]) - 12;
  const la = derecha ? 'start' : 'end';
  out.push(t(F[0] + (derecha ? 10 : -10), F[1] - 8, 'faro', { a: la, b: true, s: 10 }));
  out.push(`<g${m.dim('traves')}>${t(lx, F[1] + 14, `Dv ${deg3(dvT)}`, { c: 'r', a: la, b: true, s: 11 })}${t(lx, F[1] + 27, 'por el través', { a: la, s: 9.5 })}${t(lx, F[1] + 39, `desde el faro: ${deg3(dvT + 180)}`, { a: la, s: 9.5 })}</g>`);
  const hora1 = hhmm(hora(hi) + (millas / v) * 60);
  out.push(`<g${m.dim('corte')}>${t(Pc[0] + (derecha ? -12 : 12), Pc[1] - 6, `situación ${hora1}`, { a: derecha ? 'end' : 'start', b: true, s: 10, c: 'r' })}</g>`);
  const pv = pol(Pc[0], Pc[1], rv, 1.6 * k + 4);
  out.push(`<g${m.dim('proa')}>${t(pv[0] + (derecha ? 6 : -6), pv[1] + 8, `proa: Rv ${deg3(rv)}`, { a: la, s: 10 })}</g>`);
  const pm = pol(S[0], S[1], rs, mDib * 0.45 * k);
  out.push(`<g${m.dim('derrota')}>${t(pm[0] + (derecha ? -10 : 10), pm[1], `Rs ${deg3(rs)}`, { c: 'v', a: derecha ? 'end' : 'start', b: true, s: 10.5 })}${t(pm[0] + (derecha ? -10 : 10), pm[1] + 12, 'derrota', { a: derecha ? 'end' : 'start', s: 9.5 })}</g>`);
  out.push(`<g${m.dim('salida')}>${punto(S, 'currentColor', 3.5)}${t(S[0] + (derecha ? -8 : 8), S[1] - 6, `salida ${hi}`, { a: derecha ? 'end' : 'start', b: m.on('salida'), s: 10 })}</g>`);
  if (trampa && Q0) {
    const Q = P(Q0);
    out.push(`<g${m.on('trampa') ? '' : ' opacity=".7"'}>${t(Q[0] + (derecha ? -12 : 12), Q[1] + 14, 'trampa: través', { c: 'g', a: derecha ? 'end' : 'start', s: 9.5 })}${t(Q[0] + (derecha ? -12 : 12), Q[1] + 26, `con el Rs (${deg3(dvMal)})`, { c: 'g', a: derecha ? 'end' : 'start', s: 9.5 })}</g>`);
  }
  // viento, en la esquina superior derecha
  const hacia = u(viento + 180);
  const wc = [236, 64];
  const w0 = mas(wc, hacia, -13);
  const w1 = mas(wc, hacia, 13);
  const nrm = [-hacia[1] * 5, hacia[0] * 5];
  out.push(arrow(w0[0] + nrm[0], w0[1] + nrm[1], w1[0] + nrm[0], w1[1] + nrm[1], 'g', id, 2), arrow(w0[0] - nrm[0], w0[1] - nrm[1], w1[0] - nrm[0], w1[1] - nrm[1], 'g', id, 2));
  out.push(t(wc[0], wc[1] + 28, `viento ${nombreViento(viento)}`, { c: 'g', a: 'middle', s: 9.5 }));
  out.push(norte(298, 70, id));
  // cálculo
  const mins = Math.round((millas / v) * 60);
  const fila = (yy, s, b, p) => out.push(`<g${m.dim(p)}>${t(14, yy, s, { s: 10.5, b: b || m.on(p) })}</g>`);
  const abTxt = abG ? `Viento del ${nombreViento(viento)} por ${bv} → Ab ${ab > 0 ? '+' : '−'}${abG}° → Rs ${deg3(rs)}` : `Sin abatimiento: Rs = Rv = ${deg3(rs)}`;
  fila(H - 68, `1. ${abTxt}`, false, 'derrota');
  fila(H - 52, `2. Través de ${banda}: Dv = Rv ${sg > 0 ? '+' : '−'} 90° = ${deg3(dvT)}`, true, 'traves');
  fila(H - 36, `3. Desde el faro, ${deg3(dvT + 180)}; su corte con el Rs = situación`, false, 'corte');
  fila(H - 20, `4. ${n0(millas)} M / ${n0(v)} nudos ≈ ${Math.floor(mins / 60)} h ${String(mins % 60).padStart(2, '0')} min → HRB ${hora1}`, false, 'hora');
  out.push('</svg>');
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
