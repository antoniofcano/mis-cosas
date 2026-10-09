// Electrónica del PY (UT 3) en estilo C (docs/ESTILO-LAMINAS.md): el radar (presentaciones, EBL y VRM; racon, SART y
// reflector), el GNSS (las siglas de una ruta y sus cálculos), las cartas electrónicas (raster y vectorial) y el AIS.
// Mismos tipos, parámetros y `resaltar` que las láminas de lección a las que sustituyen; solo cambia el dibujo.
//   radar-pantalla:         { presentacion?:'ambas'|'proa-arriba'|'norte-arriba', rumbo?: 210, marcacion?: 320, resaltar? }
//   radar-respondedores:    { sart?:'lejos'|'cerca', resaltar? }
//   gnss:                   { resaltar? }                    (claves de SIGLAS_GNSS)
//   gnss-calculos:          { dtg?, sog?, hora?, xte?, banda?:'R'|'L', angulo?, resaltar? }
//   carta-raster-vectorial: { resaltar?:'raster'|'vectorial'|'sistemas' }
//   ais:                    {}
// La pantalla del radar es oscura (como la de verdad) en los dos temas; sus trazos van en los colores de luz (--lc-luz-*),
// y cada uno lleva su rótulo o su leyenda. Solo colores T.*.

import { T, TXT, lienzo, rotulo, etiqueta, cota, flecha, ondas, tierra, paso, referencia, rosaNorte, barco, pol, f1, rad } from './estilo-c.js';

const norm = (d) => ((d % 360) + 360) % 360;
const norm180 = (d) => { const x = norm(d); return x > 180 ? x - 360 : x; };
const deg3 = (d) => `${String(Math.round(norm(d))).padStart(3, '0')}°`;
const nf = (n, d = 1) => (+n).toFixed(d).replace('.', ',');
const n0 = (n) => nf(n, Number.isInteger(+n) ? 0 : 1);
const W = 358;

/** Partes resaltadas: on(p) dice si se dibuja fuerte; dim(p) atenúa lo que no está resaltado. null si hay una parte inválida. */
function marcas(spec, validas) {
  const r = spec.resaltar;
  const s = r == null || r === '' ? null : new Set([].concat(r));
  if (s && [...s].some((p) => !validas.includes(p))) return null;
  return { activo: !!s, on: (p) => !!s && s.has(p), dim: (p) => (s && !s.has(p) ? ' opacity=".38"' : '') };
}
const g = (p, m, cuerpo) => `<g data-parte="${p}"${m.dim(p)}>${cuerpo}</g>`;
const linea = (a, b, color, w = 1.4, extra = '') => `<line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" stroke="${color}" stroke-width="${w}"${extra ? ` ${extra}` : ''}/>`;
const serif = (x, y, t, o = {}) => rotulo(x, y, t, { size: TXT.min + 0.5, estilo: 'serif', anchor: 'start', ...o });

// ---------------------------------------------------------------------------
// Radar: pantalla, EBL y VRM

const PARTES_RADAR = ['proa', 'ebl', 'vrm', 'anillos', 'calculo'];

/** Pantalla de radar centrada en (x, y) de radio R; `arriba` es el rumbo verdadero que queda arriba. */
function pantalla(out, m, [x, y], R, arriba, rv, dv) {
  const sc = (b) => norm(b - arriba);
  out.push(`<circle cx="${x}" cy="${y}" r="${R}" fill="${T.noche}" stroke="${T.tinta}" stroke-width="1.6"/>`);
  const ticks = [];
  for (let a = 0; a < 360; a += 10) { const [p, q] = [pol(x, y, a, R - 1), pol(x, y, a, R - (a % 30 ? 4 : 8))]; ticks.push(`M${f1(p[0])},${f1(p[1])}L${f1(q[0])},${f1(q[1])}`); }
  out.push(`<path d="${ticks.join('')}" stroke="${T.nocheTxt}" stroke-width=".8"/>`);
  out.push(g('anillos', m, [1 / 3, 2 / 3].map((k) => `<circle cx="${x}" cy="${y}" r="${f1(R * k)}" fill="none" stroke="${T.luzVerde}" stroke-width="${m.on('anillos') ? 1.8 : 0.9}" opacity=".7"/>`).join('')));
  const dEco = R * 0.56;
  const aEco = sc(dv);
  const eco = pol(x, y, aEco, dEco);
  out.push(g('vrm', m, `<circle cx="${x}" cy="${y}" r="${f1(dEco - 4)}" fill="none" stroke="${T.luzAzul}" stroke-width="${m.on('vrm') ? 2.6 : 1.8}" stroke-dasharray="6 3"/>`));
  out.push(g('ebl', m, linea([x, y], pol(x, y, aEco, R - 2), T.luzAmarilla, m.on('ebl') ? 2.6 : 1.8, 'stroke-dasharray="7 3"')));
  out.push(g('proa', m, linea([x, y], pol(x, y, sc(rv), R - 1), T.nocheTxt, m.on('proa') ? 3 : 2.2)));
  out.push(`<ellipse cx="${f1(eco[0])}" cy="${f1(eco[1])}" rx="6" ry="4" transform="rotate(${f1(aEco)} ${f1(eco[0])} ${f1(eco[1])})" fill="${T.luzVerde}"/><circle cx="${x}" cy="${y}" r="2.6" fill="${T.nocheTxt}"/>`);
  // fuera del borde: la proa y el norte
  const fuera = (deg, t, o = {}) => { const [px, py] = pol(x, y, deg, R + 12); return rotulo(Math.min(Math.max(px, 22), W - 22), py + 4, t, { size: TXT.min + 0.5, estilo: 'serif', italic: true, weight: 700, ...o }); };
  out.push(g('proa', m, fuera(sc(rv), 'proa')));
  if (Math.abs(norm180(sc(0) - sc(rv))) > 24) out.push(fuera(sc(0), 'N', { italic: false }));
  // dentro: EBL junto a su extremo y VRM en su anillo, donde no tapen la proa
  const lado = norm180(aEco - sc(rv)) > 0 ? -1 : 1;
  const [ex, ey] = pol(...pol(x, y, aEco, R * 0.82), aEco + 90 * lado, 13);
  out.push(g('ebl', m, etiqueta(ex, ey, 'EBL', { color: T.luzAmarilla, fondo: T.noche, size: TXT.min })));
  const libre = [45, 135, 225, 315].sort((a, b) => Math.min(Math.abs(norm180(b - aEco)), Math.abs(norm180(b - sc(rv)))) - Math.min(Math.abs(norm180(a - aEco)), Math.abs(norm180(a - sc(rv)))))[0];
  const [vx, vy] = pol(x, y, libre, dEco - 4);
  out.push(g('vrm', m, etiqueta(vx, vy, 'VRM', { color: T.luzAzul, fondo: T.noche, size: TXT.min })));
}

export function radarPantalla(spec = {}) {
  const m = marcas(spec, PARTES_RADAR);
  const pres = spec.presentacion ?? 'ambas';
  if (!m || !['ambas', 'proa-arriba', 'norte-arriba'].includes(pres)) return null;
  const rv = norm(Number(spec.rumbo ?? 210));
  const M = norm(Number(spec.marcacion ?? 320));
  if (!Number.isFinite(rv) || !Number.isFinite(M)) return null;
  const dv = norm(rv + M);
  const mb = M > 180 ? 360 - M : M;
  const banda = M === 0 ? 'proa' : M === 180 ? 'popa' : M > 180 ? 'babor' : 'estribor';
  const sumaTxt = `Dv = Rv + M = ${deg3(rv)} + ${deg3(M)}${rv + M >= 360 ? ' − 360°' : ''} = ${deg3(dv)}`;
  const bandaTxt = banda === 'babor' ? `${n0(mb)}° por babor: ${deg3(rv)} − ${n0(mb)}° = ${deg3(dv)}` : banda === 'estribor' ? `${n0(mb)}° por estribor: ${deg3(rv)} + ${n0(mb)}° = ${deg3(dv)}` : `eco por la ${banda}`;
  const calculo = (y) => g('calculo', m, rotulo(W / 2, y, sumaTxt, { size: TXT.nota + 0.5, estilo: 'serif', weight: 700, color: T.magenta }) + rotulo(W / 2, y + 21, `(${bandaTxt})`, { size: TXT.nota, estilo: 'serif', italic: true }));
  if (pres === 'ambas') {
    const H = 326;
    const alt = `El mismo eco en dos pantallas de radar. A la izquierda, proa arriba: la línea de proa va arriba y la EBL da la marcación, ${deg3(M)}. A la derecha, norte arriba: el norte va arriba y la EBL da la demora, ${deg3(dv)}. En las dos, el VRM es un anillo a trazos que toca el eco. Debajo, la cuenta: ${sumaTxt}.`;
    const { out, cierra } = lienzo(W, H, alt);
    out.push(rotulo(92, 32, 'PROA ARRIBA', { size: TXT.min, weight: 700, estilo: 'cap', color: T.apagado }), rotulo(266, 32, 'NORTE ARRIBA', { size: TXT.min, weight: 700, estilo: 'cap', color: T.apagado }));
    pantalla(out, m, [92, 128], 68, rv, rv, dv);
    pantalla(out, m, [266, 128], 68, 0, rv, dv);
    out.push(g('ebl', m, etiqueta(92, 230, `EBL ${deg3(M)}`, { color: T.magenta }) + rotulo(92, 254, '= marcación', { size: TXT.nota, estilo: 'serif', italic: true }) +
      etiqueta(266, 230, `EBL ${deg3(dv)}`, { color: T.magenta }) + rotulo(266, 254, '= demora (Dv)', { size: TXT.nota, estilo: 'serif', italic: true })));
    out.push(linea([14, 268], [W - 14, 268], T.tinta, 0.6), calculo(290));
    out.push(cierra());
    return { svg: out.join(''), caption: `El mismo eco en las dos presentaciones. En proa arriba la línea de proa va arriba y la EBL da la marcación (${deg3(M)}); en norte arriba el norte va arriba y la EBL da la demora. Para pasar de una a otra: Dv = Rv + M = ${deg3(dv)}.` };
  }
  const hup = pres === 'proa-arriba';
  const H = 404;
  const alt = `Pantalla de radar en ${hup ? 'proa arriba: la línea de proa va arriba, sobre la crujía, y la EBL da la marcación' : 'norte arriba: el norte va arriba y la EBL da la demora'} del eco; el VRM, un anillo a trazos, da su distancia y los anillos fijos son solo de referencia. Debajo, la leyenda y la cuenta: ${sumaTxt}.`;
  const { out, cierra } = lienzo(W, H, alt);
  out.push(rotulo(16, 28, hup ? 'PROA ARRIBA (H-UP)' : 'NORTE ARRIBA (N-UP)', { size: TXT.min, weight: 700, estilo: 'cap', anchor: 'start', color: T.apagado }));
  pantalla(out, m, [W / 2, 140], 90, hup ? rv : 0, rv, dv);
  const ley = (x, y, p, muestra, t1, t2) => g(p, m, muestra(x, y - 4) + serif(x + 28, y, t1, { weight: 700 }) + serif(x + 28, y + 16, t2, { italic: true, color: T.apagado, size: TXT.min }));
  const tramo = (color, w, dash = '') => (x, y) => `<rect x="${x - 2}" y="${y - 6}" width="26" height="12" fill="${T.noche}"/>` + linea([x, y], [x + 22, y], color, w, dash);
  out.push(ley(16, 264, 'proa', tramo(T.nocheTxt, 2.4), 'Línea de proa', hup ? 'arriba, en la crujía' : `al ${deg3(rv)}: el Rv`));
  out.push(ley(190, 264, 'ebl', tramo(T.luzAmarilla, 2, 'stroke-dasharray="7 3"'), `EBL ${deg3(hup ? M : dv)}`, hup ? '= marcación' : '= demora (Dv)'));
  out.push(ley(16, 304, 'vrm', tramo(T.luzAzul, 2, 'stroke-dasharray="6 3"'), 'VRM', '= distancia al eco'));
  out.push(ley(190, 304, 'anillos', tramo(T.luzVerde, 1.2), 'Anillos fijos', 'solo de referencia'));
  out.push(rotulo(W / 2, 342, hup ? 'Al cambiar de rumbo, toda la imagen gira.' : 'Al cambiar de rumbo, la imagen no gira.', { size: TXT.nota, estilo: 'serif', italic: true, weight: 700 }));
  out.push(calculo(366));
  out.push(cierra());
  const cap = {
    'proa-arriba': 'En proa arriba la línea de proa va arriba, sobre la crujía: la EBL da la marcación del eco y el VRM su distancia. Para trazarla en la carta necesitas el rumbo: Dv = Rv + M.',
    'norte-arriba': 'En norte arriba el norte va arriba y la imagen no gira al cambiar de rumbo: la EBL da directamente la demora del eco y el VRM su distancia.',
  };
  return { svg: out.join(''), caption: cap[pres] };
}

// ---------------------------------------------------------------------------
// Racon, SART y reflector de radar en la pantalla

const PARTES_RESP = ['racon', 'sart', 'reflector'];

export function radarRespondedores(spec = {}) {
  const m = marcas(spec, PARTES_RESP);
  const sart = spec.sart ?? 'lejos';
  if (!m || !['lejos', 'cerca'].includes(sart)) return null;
  const H = 372;
  const alt = `Pantalla de radar con tres ecos numerados. 1, un racon: detrás del eco de la boya, su letra Morse en línea radial (la D, raya, punto, punto). 2, un SART: ${sart === 'lejos' ? 'una línea de 12 puntos que sale de su posición y se aleja del centro' : 'de cerca, los 12 puntos se han vuelto arcos alrededor del centro'}. 3, un barco pequeño de fibra con reflector de radar, que da un eco claro.`;
  const { out, cierra } = lienzo(W, H, alt);
  const [x, y, R] = [W / 2, 124, 96];
  out.push(`<circle cx="${x}" cy="${y}" r="${R}" fill="${T.noche}" stroke="${T.tinta}" stroke-width="1.6"/>`);
  out.push([1 / 3, 2 / 3].map((k) => `<circle cx="${x}" cy="${y}" r="${f1(R * k)}" fill="none" stroke="${T.luzVerde}" stroke-width=".9" opacity=".6"/>`).join(''));
  out.push(linea([x, y], [x, y - R + 1], T.nocheTxt, 2), `<circle cx="${x}" cy="${y}" r="2.6" fill="${T.nocheTxt}"/>`, rotulo(x, y - R - 6, 'proa', { size: TXT.min + 0.5, estilo: 'serif', italic: true, weight: 700 }));
  const num = (p, n) => paso(p[0], p[1], n, { color: T.tinta });
  // 1. Racon: el eco de la boya y, detrás, la «D» (− · ·) en línea radial
  const aR = 50;
  const r1 = [`<circle cx="${f1(pol(x, y, aR, R * 0.4)[0])}" cy="${f1(pol(x, y, aR, R * 0.4)[1])}" r="4" fill="${T.luzVerde}"/>`];
  let r0 = R * 0.4 + 9;
  for (const [lng, gap] of [[17, 5], [4, 5], [4, 0]]) { r1.push(linea(pol(x, y, aR, r0), pol(x, y, aR, r0 + lng), T.luzAmarilla, m.on('racon') ? 5.5 : 4.5)); r0 += lng + gap; }
  out.push(g('racon', m, r1.join('')), num(pol(x, y, aR - 18, R * 0.42), 1));
  // 2. SART: 12 puntos hacia fuera desde su posición; de cerca, arcos
  const aS = 140;
  const rS = R * 0.24;
  const s2 = [];
  if (sart === 'lejos') {
    for (let i = 0; i < 12; i++) { const p = pol(x, y, aS, rS + (i * (R * 0.95 - rS)) / 11); s2.push(`<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="${m.on('sart') ? 2.8 : 2.3}" fill="${T.luzRoja}"/>`); }
  } else {
    for (let i = 0; i < 12; i++) { const rr = rS + (i * (R * 0.9 - rS)) / 11; const [a0, a1] = [aS - 16 - i * 3, aS + 16 + i * 3]; const [p, q] = [pol(x, y, a0, rr), pol(x, y, a1, rr)]; s2.push(`<path d="M${f1(p[0])},${f1(p[1])} A${f1(rr)},${f1(rr)} 0 0 1 ${f1(q[0])},${f1(q[1])}" fill="none" stroke="${T.luzRoja}" stroke-width="${m.on('sart') ? 2.4 : 1.8}"/>`); }
  }
  out.push(g('sart', m, s2.join('')), num(pol(x, y, aS - (sart === 'lejos' ? 16 : 44), R * 0.52), 2));
  // 3. Reflector: un barco pequeño no metálico que da un eco claro
  const eB = pol(x, y, 290, R * 0.6);
  out.push(g('reflector', m, `<ellipse cx="${f1(eB[0])}" cy="${f1(eB[1])}" rx="6" ry="4" fill="${T.luzVerde}"/>`), num(pol(x, y, 290, R * 0.6 + 20), 3));
  // leyenda
  const ley = (yy, n, p, t1, t2) => g(p, m, paso(24, yy - 4, n, { color: T.tinta }) + serif(40, yy, t1, { weight: 700 }) + serif(40, yy + 17, t2, { italic: true, color: T.apagado, size: TXT.min }));
  out.push(linea([14, 232], [W - 14, 232], T.tinta, 0.6));
  out.push(ley(256, 1, 'racon', 'Racon: baliza respondedora (faro, boya)', 'su letra Morse detrás de su eco; la D, nuevo peligro'));
  out.push(ley(296, 2, 'sart', 'SART: respondedor de socorro', sart === 'lejos' ? '12 puntos que se alejan del centro (banda X)' : 'de cerca, los puntos se vuelven arcos'));
  out.push(ley(336, 3, 'reflector', 'Reflector: hace visible al barco pequeño', 'de fibra o madera, que casi no da eco'));
  out.push(cierra());
  const cap = sart === 'lejos'
    ? 'El racon responde a tu pulso con una letra Morse en línea radial detrás de su eco; la «D» marca un nuevo peligro o pecio. El SART aparece como una línea de 12 puntos que se aleja del centro desde su posición. El reflector hace visible un barco pequeño no metálico.'
    : 'De cerca, los 12 puntos del SART se convierten en arcos alrededor del centro de la pantalla. El racon sigue mostrando su letra Morse detrás del eco.';
  return { svg: out.join(''), caption: cap };
}

// ---------------------------------------------------------------------------
// GNSS: las siglas de una ruta entre dos waypoints (py-3-9)
// Cifras de la lección: DTG 18,0 M, SOG 6,0 kn a las 10:20 → TTG 3 h, ETA 13:20; XTE 0,05 R; COG a 20° del BRG → VMG 5,6 kn.

export function gnssC(spec, SIGLAS) {
  const r = spec.resaltar;
  const lista = r == null || r === '' ? [] : [].concat(r);
  if (lista.some((p) => !SIGLAS[p])) return null;
  const m = marcas(spec, Object.keys(SIGLAS));
  const on = (...ps) => ps.some((p) => m.on(p));
  const dimV = (...ps) => (m.activo && !on(...ps) ? ' opacity=".38"' : '');
  const H = 392;
  const alt = 'Ruta entre dos waypoints, vista desde arriba: el barco, a estribor de la ruta, con el error transversal XTE acotado; la demora (BRG) y la distancia (DTG) al waypoint de llegada; el rumbo y la velocidad sobre el fondo (COG y SOG), 20° a la derecha del BRG; su proyección sobre el BRG, la VMG; y la proa (HDG), algo a la izquierda del COG. Debajo, la pantalla con TTG, ETA, XTE y VMG.';
  const { out, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
  const W1 = [30, 66];
  const W2 = [328, 66];
  const P = [84, 186];
  const wpt = (p) => `<rect x="${f1(p[0] - 6)}" y="${f1(p[1] - 6)}" width="12" height="12" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.6"/>`;
  out.push(g('wpt', m, linea(W1, W2, T.tinta, 1.4, 'stroke-dasharray="7 4"') + wpt(W1) + wpt(W2) + serif(W1[0] - 8, W1[1] - 14, 'WPT salida', { italic: true }) + rotulo(W2[0] + 8, W2[1] - 14, 'WPT llegada', { size: TXT.min + 0.5, estilo: 'serif', italic: true, anchor: 'end' }) + rotulo(179, 58, 'ruta', { size: TXT.min, estilo: 'serif', italic: true, color: T.apagado })));
  // XTE: del barco a la línea de la ruta
  out.push(g('xte', m, cota(P[0], W1[1], P[0], P[1] - 14, '', { color: T.magenta }) + etiqueta(P[0] - 40, 118, 'XTE', { color: T.magenta }) + etiqueta(P[0] - 40, 140, '0,05 R', { color: T.magenta })));
  // BRG y DTG
  const brg = norm((Math.atan2(W2[0] - P[0], -(W2[1] - P[1])) * 180) / Math.PI);
  out.push(`<g data-parte="brg"${dimV('brg', 'dtg')}>${linea(P, pol(...W2, brg + 180, 9), T.tinta, on('brg', 'dtg') ? 2.4 : 1.6)}</g>`);
  out.push(`<g data-parte="dtg"${dimV('brg', 'dtg')}>${etiqueta(222, 104, 'BRG · DTG 18,0 M')}</g>`);
  // COG / SOG (20° a la derecha del BRG) y VMG (su proyección sobre el BRG)
  const cog = brg + 20;
  const Lc = 150;
  const Ec = pol(P[0], P[1], cog, Lc);
  out.push(`<g data-parte="cog"${dimV('cog', 'sog')}>${flecha(P[0], P[1], Ec[0], Ec[1], { color: T.azulTxt, w: on('cog', 'sog') ? 2.4 : 1.8 })}${etiqueta(Ec[0] - 10, Ec[1] + 18, 'COG · SOG 6,0 kn', { color: T.azulTxt })}</g>`);
  const Ev = pol(P[0], P[1], brg, Lc * Math.cos(rad(20)));
  out.push(g('vmg', m, linea(Ec, Ev, T.tinta, 1, 'stroke-dasharray="2 3"') + flecha(P[0], P[1], Ev[0], Ev[1], { color: T.magenta, w: m.on('vmg') ? 2.8 : 2.2 }) + etiqueta(...pol(...pol(P[0], P[1], brg, 64), brg - 90, 16), 'VMG 5,6 kn', { color: T.magenta })));
  const [a1, a2] = [pol(P[0], P[1], brg, 46), pol(P[0], P[1], cog, 46)];
  out.push(g('vmg', m, `<path d="M${f1(a1[0])},${f1(a1[1])} A46,46 0 0 1 ${f1(a2[0])},${f1(a2[1])}" fill="none" stroke="${T.tinta}" stroke-width="1"/>` + rotulo(...pol(P[0], P[1] + 4, brg + 10, 58), '20°', { size: TXT.min, estilo: 'mono' })));
  // HDG: la proa, algo a la izquierda del COG (el viento y la corriente la desvían)
  out.push(g('hdg', m, barco(P[0], P[1], cog - 14, 30, { p: null }) + serif(P[0] - 64, P[1] + 34, 'HDG: hacia donde apunta la proa', { italic: true })));
  // la pantalla con las cuentas de la lección
  const y0 = 246;
  out.push(`<rect x="12" y="${y0}" width="${W - 24}" height="${H - y0 - 34}" fill="${T.noche}" stroke="${T.tinta}" stroke-width="1.2"/>`);
  [['eta', 'TTG = DTG / SOG = 18,0 / 6,0 = 3 h'], ['eta', 'ETA = 10:20 + 3 h = 13:20'], ['xte', 'XTE 0,05 R: medio cable (≈ 93 m) a estribor'], ['vmg', 'VMG = 6 · cos 20° ≈ 5,6 kn'], [null, 'COG y SOG: sobre el fondo, con viento y corriente']]
    .forEach(([p, t], i) => out.push(`<g${p ? m.dim(p) : (m.activo ? ' opacity=".38"' : '')}>${rotulo(24, y0 + 22 + i * 19, t, { size: TXT.min + 0.5, estilo: 'serif', anchor: 'start', color: T.nocheTxt, weight: p && m.on(p) ? 700 : 400 })}</g>`));
  out.push(rotulo(W / 2, H - 14, 'No a escala: el XTE va muy exagerado.', { size: TXT.min, estilo: 'serif', italic: true, color: T.apagado }));
  out.push(cierra());
  const cap = lista.length ? lista.map((p) => SIGLAS[p]).join('\n') : 'Con una ruta cargada, el GNSS da la demora (BRG) y la distancia (DTG) al siguiente waypoint, el error transversal (XTE) respecto a la línea entre los dos waypoints, el rumbo y la velocidad sobre el fondo (COG, SOG) y, con ellos, el tiempo que falta (TTG), la hora de llegada (ETA) y la velocidad con la que te acercas (VMG).';
  return { svg: out.join(''), caption: cap };
}

// ---------------------------------------------------------------------------
// XTE, VMG y ETA paso a paso (py-3-9)

const PARTES_GNSS = ['xte', 'vmg', 'eta'];
const hora = (h) => { const [a, b] = String(h).split(':').map(Number); return a * 60 + (b || 0); };
const hhmm = (min) => { const x = ((Math.round(min) % 1440) + 1440) % 1440; return `${String(Math.floor(x / 60)).padStart(2, '0')}:${String(x % 60).padStart(2, '0')}`; };
const duracion = (min) => { const h = Math.floor(Math.round(min) / 60); const r = Math.round(min) % 60; return r ? (h ? `${h} h ${String(r).padStart(2, '0')} min` : `${r} min`) : `${h} h`; };
const decimal = (n) => String(+n).replace('.', ',');
const cables = (x) => (Math.abs(x - 0.05) < 1e-9 ? 'medio cable' : Math.abs(x - 0.1) < 1e-9 ? '1 cable' : `${decimal(+(x * 10).toFixed(2))} cables`);

export function gnssCalculos(spec = {}) {
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
  const H = 428;
  const alt = `Tres cálculos del GNSS, uno debajo de otro. 1, XTE ${decimal(xte)} ${banda}: el barco a ${decimal(xte)} millas a ${banda === 'R' ? 'estribor' : 'babor'} de la línea entre los dos waypoints. 2, VMG: el COG se separa ${decimal(ang)}° de la demora al waypoint y solo ${nf(vmg)} de los ${nf(sog)} nudos te acercan a él. 3, ETA: una barra de tiempo de ${nf(dtg)} millas a ${nf(sog)} nudos, de las ${h0} a las ${hhmm(eta)}.`;
  const { out, cierra } = lienzo(W, H, alt);
  const cab = (y, n, t, p) => paso(22, y - 4, n, { color: m.on(p) ? T.magenta : T.tinta }) + serif(38, y, t, { weight: 700, size: TXT.nota + 0.5, color: m.on(p) ? T.magenta : T.tinta });
  // --- 1. XTE
  const yR = 82;
  const W1 = [30, yR];
  const W2 = [328, yR];
  const dy = banda === 'R' ? 26 : -26; // navegando hacia la derecha del dibujo, estribor queda abajo
  const P = [170, yR + dy];
  const wpt = (p) => `<rect x="${f1(p[0] - 5)}" y="${f1(p[1] - 5)}" width="10" height="10" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.5"/>`;
  out.push(g('xte', m, cab(32, 1, 'XTE: cuánto te has apartado de la ruta', 'xte') +
    linea(W1, W2, T.tinta, 1.3, 'stroke-dasharray="7 4"') + wpt(W1) + wpt(W2) +
    serif(W1[0] - 6, yR - dy * 0.5 + 4, 'WPT salida', { italic: true, size: TXT.min }) + rotulo(W2[0] + 6, yR - dy * 0.5 + 4, 'WPT llegada', { size: TXT.min, estilo: 'serif', italic: true, anchor: 'end' }) +
    cota(P[0] - 18, yR, P[0] - 18, P[1], '', { color: T.magenta, tope: 4 }) + barco(P[0], P[1], 90, 28, { p: null }) +
    etiqueta(P[0] + 62, P[1] + (banda === 'R' ? -14 : 14), `XTE ${decimal(xte)} ${banda}`, { color: T.magenta }) +
    rotulo(P[0] - 26, yR + dy / 2 + 4, banda === 'R' ? 'a estribor' : 'a babor', { size: TXT.min, estilo: 'serif', italic: true, anchor: 'end', color: T.magenta }) +
    rotulo(W / 2, 140, `${decimal(xte)} M = ${cables(xte)} ≈ ${Math.round(xte * 1852)} m · R derecha, L izquierda`, { size: TXT.min, estilo: 'serif' })));
  out.push(linea([14, 152], [W - 14, 152], T.tinta, 0.6));
  // --- 2. VMG
  const yV = 214;
  const O = [34, yV];
  const L = ang > 0 ? Math.min(170, 44 / Math.sin(rad(ang))) : 170;
  const E = pol(O[0], O[1], 90 + ang, L);
  const V = [O[0] + L * Math.cos(rad(ang)), yV];
  const v2 = [flecha(O[0], O[1], E[0], E[1], { color: T.azulTxt, w: 1.8 }), linea(E, V, T.tinta, 1, 'stroke-dasharray="2 3"'), linea(V, [322, yV], T.tinta, 1.2, 'stroke-dasharray="7 4"'), wpt([328, yV]), flecha(O[0], O[1], V[0], V[1], { color: T.magenta, w: m.on('vmg') ? 2.8 : 2.2 })];
  v2.push(etiqueta(O[0] + 76, yV - 14, `VMG ${nf(vmg)} kn`, { color: T.magenta }), rotulo(328, yV - 12, 'WPT', { size: TXT.min, estilo: 'serif', italic: true, anchor: 'end' }));
  v2.push(etiqueta(Math.min(E[0] + 6, W - 80), Math.min(E[1] + 16, 250), `COG · SOG ${nf(sog)} kn`, { color: T.azulTxt }));
  if (ang > 0) {
    const [p0, p1] = [pol(O[0], O[1], 90, 40), pol(O[0], O[1], 90 + ang, 40)];
    v2.push(`<path d="M${f1(p0[0])},${f1(p0[1])} A40,40 0 0 1 ${f1(p1[0])},${f1(p1[1])}" fill="none" stroke="${T.tinta}" stroke-width="1"/>`, rotulo(...pol(O[0] + 4, O[1] + 4, 90 + ang / 2, 52), `${decimal(ang)}°`, { size: TXT.min, estilo: 'mono' }));
  }
  v2.push(rotulo(W / 2, 274, `VMG = SOG · cos ${decimal(ang)}° = ${nf(sog)} · ${nf(Math.cos(rad(ang)), 3)} ≈ ${nf(vmg)} kn`, { size: TXT.min + 0.5, estilo: 'serif' }));
  out.push(g('vmg', m, cab(176, 2, 'VMG: lo que de verdad te acercas al WPT', 'vmg') + v2.join('')));
  out.push(linea([14, 286], [W - 14, 286], T.tinta, 0.6));
  // --- 3. ETA
  const yT = 340;
  const [T0, T1] = [30, 328];
  const e3 = [cab(310, 3, `ETA: ${nf(dtg)} M a ${nf(sog)} kn (SOG)`, 'eta'), `<rect x="${T0}" y="${yT - 5}" width="${T1 - T0}" height="10" fill="${T.agua}" stroke="${m.on('eta') ? T.magenta : T.tinta}" stroke-width="${m.on('eta') ? 1.6 : 1}"/>`];
  const horas = Math.floor(ttg / 60 + 1e-9);
  const marcasT = horas <= 8 ? Array.from({ length: horas + 1 }, (_, i) => i * 60) : [0];
  if (marcasT[marcasT.length - 1] < ttg - 1e-6) marcasT.push(ttg);
  for (const [i, mn] of marcasT.entries()) {
    const x = T0 + ((T1 - T0) * mn) / ttg;
    const ultimo = i === marcasT.length - 1;
    const pegado = !ultimo && marcasT.length > 1 && T0 + ((T1 - T0) * marcasT[marcasT.length - 1]) / ttg - x < 62;
    e3.push(linea([x, yT - 10], [x, yT + 10], ultimo || i === 0 ? T.magenta : T.tinta, ultimo || i === 0 ? 1.8 : 1));
    if (!pegado) {
      const a = i === 0 ? 'start' : ultimo ? 'end' : 'middle';
      e3.push(rotulo(x, yT - 15, hhmm(hora(h0) + mn), { size: TXT.min, estilo: 'mono', anchor: a, weight: ultimo || i === 0 ? 700 : 400, color: ultimo ? T.magenta : T.tinta }));
      e3.push(rotulo(x, yT + 25, i === 0 ? `DTG ${nf(dtg)} M` : ultimo ? 'llegada' : `${nf((sog * mn) / 60)} M`, { size: TXT.min, estilo: 'serif', italic: true, anchor: a, color: T.apagado }));
    }
  }
  e3.push(serif(22, H - 34, `TTG = DTG / SOG = ${nf(dtg)} / ${nf(sog)} = ${duracion(ttg)}`, { weight: m.on('eta') ? 700 : 400 }), serif(22, H - 15, `ETA = ${h0} + ${duracion(ttg)} = ${hhmm(eta)}`, { weight: 700, color: T.magenta }));
  out.push(g('eta', m, e3.join('')));
  out.push(cierra());
  const cap = {
    xte: `XTE ${decimal(xte)} ${banda}: estás a ${decimal(xte)} millas (${cables(xte)}, unos ${Math.round(xte * 1852)} m) a la ${banda === 'R' ? 'derecha (estribor)' : 'izquierda (babor)'} de la línea recta entre el WPT de salida y el de llegada. No es lo que falta: eso es el DTG.`,
    vmg: `Si el COG se separa ${decimal(ang)}° de la demora al WPT, de tus ${nf(sog)} nudos solo te acercas al WPT VMG = ${nf(sog)} · cos ${decimal(ang)}° ≈ ${nf(vmg)} nudos.`,
    eta: `TTG = DTG / SOG = ${nf(dtg)} / ${nf(sog)} = ${duracion(ttg)}; a las ${h0}, la ETA es ${hhmm(eta)}.`,
  };
  const lista = m.activo ? PARTES_GNSS.filter((p) => m.on(p)) : [];
  return { svg: out.join(''), caption: lista.length ? lista.map((p) => cap[p]).join(' ') : `Los tres cálculos de la pantalla, uno a uno. ${cap.xte} ${cap.vmg} ${cap.eta}` };
}
export const PARAMS_GNSS_CALCULOS = PARTES_GNSS;

// ---------------------------------------------------------------------------
// Carta raster frente a vectorial (py-3-10)

const PARTES_CARTAS = ['raster', 'vectorial', 'sistemas'];

export function cartaRasterVectorial(spec = {}) {
  const m = marcas(spec, PARTES_CARTAS);
  if (!m) return null;
  const H = 360;
  const alt = 'Dos tipos de carta electrónica. A la izquierda, la raster (RNC): una imagen escaneada que, al ampliarla, se ve hecha de píxeles. A la derecha, la vectorial (ENC): una base de datos por capas (boyas, sondas, tierra) según la norma S-57, que puede dar una alarma de veril. Abajo: ECDIS, ECS y plotter son los sistemas que las muestran, no tipos de carta.';
  const { out, cierra } = lienzo(W, H, alt);
  out.push(linea([179, 18], [179, 286], T.tinta, 0.7, 'stroke-dasharray="3 3"'));
  // --- raster: una imagen hecha de píxeles
  const r = [rotulo(92, 34, 'Raster (RNC)', { size: TXT.nombre, estilo: 'serif', weight: 700, color: m.on('raster') ? T.magenta : T.tinta })];
  const [gx, gy, cel] = [26, 50, 11];
  const costa = [3, 3, 4, 4, 5, 5, 4, 4, 3, 3, 2, 2];
  for (let i = 0; i < 12; i++) for (let j = 0; j < 9; j++) {
    const boya = i === 8 && j === 6;
    r.push(`<rect x="${gx + i * cel}" y="${gy + j * cel}" width="${cel}" height="${cel}" fill="${boya ? T.rojo : j < costa[i] ? T.tierra : T.agua}" stroke="${T.papel}" stroke-width=".7"/>`);
  }
  r.push(`<rect x="${gx}" y="${gy}" width="${12 * cel}" height="${9 * cel}" fill="none" stroke="${m.on('raster') ? T.magenta : T.tinta}" stroke-width="${m.on('raster') ? 2 : 1.2}"/>`);
  r.push(rotulo(92, 168, 'al ampliar: píxeles', { size: TXT.min, estilo: 'serif', italic: true, color: T.apagado }));
  ['una imagen escaneada', 'copia de la de papel', 'se pixela con el zoom', 'no avisa de nada'].forEach((t, i) => r.push(serif(18, 198 + i * 22, i ? `· ${t}` : t, { weight: i ? 400 : 700 })));
  out.push(g('raster', m, r.join('')));
  // --- vectorial: capas de objetos
  const v = [rotulo(268, 34, 'Vectorial (ENC)', { size: TXT.nombre, estilo: 'serif', weight: 700, color: m.on('vectorial') ? T.magenta : T.tinta })];
  const capa = (y, nombre, dentro) => {
    const x = 190;
    v.push(`<path d="M${x + 16},${y} L${x + 106},${y} L${x + 90},${y + 26} L${x},${y + 26}Z" fill="${T.agua}" stroke="${m.on('vectorial') ? T.magenta : T.tinta}" stroke-width="${m.on('vectorial') ? 1.6 : 1}"/>`, dentro(x, y), serif(x + 112, y + 18, nombre, { italic: true, size: TXT.min }));
  };
  capa(50, 'boyas', (x, y) => `<path d="M${x + 40},${y + 20} l5,-13 l5,13z" fill="${T.verde}" stroke="${T.tinta}" stroke-width=".6"/><rect x="${x + 62}" y="${y + 8}" width="9" height="12" fill="${T.rojo}" stroke="${T.tinta}" stroke-width=".6"/>`);
  capa(84, 'sondas', (x, y) => `<path d="M${x + 12},${y + 20} C${x + 38},${y + 8} ${x + 60},${y + 22} ${x + 92},${y + 6}" fill="none" stroke="${T.azulTxt}" stroke-width="1.3" stroke-dasharray="4 2"/>`);
  capa(118, 'tierra', (x, y) => `<path d="M${x + 18},${y + 1} L${x + 72},${y + 1} C${x + 62},${y + 12} ${x + 40},${y + 18} ${x + 12},${y + 18}Z" fill="${T.tierra}" stroke="${T.tinta}" stroke-width=".6"/>`);
  v.push(etiqueta(268, 162, 'norma S-57'));
  v.push(etiqueta(268, 186, '¡alarma: veril de 5 m!', { color: T.rojoTxt, size: TXT.min }));
  ['una base de datos', '· objeto a objeto, por capas', '· no se deforma con el zoom', '· da alarmas: bajos, zonas'].forEach((t, i) => v.push(serif(188, 220 + i * 20, t, { weight: i ? 400 : 700, size: TXT.min })));
  out.push(g('vectorial', m, v.join('')));
  // --- sistemas
  out.push(g('sistemas', m, `<rect x="12" y="298" width="${W - 24}" height="48" fill="${T.papel}" stroke="${m.on('sistemas') ? T.magenta : T.tinta}" stroke-width="${m.on('sistemas') ? 1.8 : 1}"/>` +
    rotulo(W / 2, 318, 'ECDIS, ECS y plotter no son cartas:', { size: TXT.nota, estilo: 'serif', weight: 700 }) + rotulo(W / 2, 336, 'son los sistemas que las muestran.', { size: TXT.nota, estilo: 'serif', italic: true })));
  out.push(cierra());
  const cap = {
    raster: 'La carta raster (RNC) es una imagen escaneada, copia exacta de una carta de papel: al ampliarla se pixela y, como es solo un dibujo, no puede avisarte de nada.',
    vectorial: 'La carta vectorial (ENC) es una base de datos objeto a objeto (cada sonda, boya o veril es un dato), según la norma S-57: va por capas, no se deforma con el zoom y genera alarmas.',
    sistemas: 'ECDIS, ECS y los plotters son los sistemas que muestran las cartas, no tipos de carta. Las ENC oficiales españolas las produce el Instituto Hidrográfico de la Marina.',
  };
  const lista = m.activo ? PARTES_CARTAS.filter((p) => m.on(p)) : [];
  return { svg: out.join(''), caption: lista.length ? lista.map((p) => cap[p]).join(' ') : `${cap.raster} ${cap.vectorial} Las dos se actualizan; ECDIS, ECS y plotter son sistemas, no cartas.` };
}

// ---------------------------------------------------------------------------
// AIS: solo ves a quien lo lleva (py-3-10)

export function aisC() {
  const H = 338;
  const alt = 'Carta vista desde arriba con tu barco en el centro y el alcance del VHF a trazos. Llegan por AIS un mercante (triángulo con su vector de rumbo y velocidad, y su nombre), una boya con AIS y la estación costera. Un velero sin AIS, a trazos, no aparece en la pantalla aunque esté cerca.';
  const { out, pt, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
  out.push(tierra('M0,0 L118,0 C112,30 96,52 70,64 C44,76 20,74 0,86Z', pt));
  out.push(`<rect x="28" y="26" width="18" height="14" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.2"/><line x1="37" y1="26" x2="37" y2="10" stroke="${T.tinta}" stroke-width="1.4"/>`, serif(16, 100, 'estación costera', { italic: true, size: TXT.min }));
  const yo = [179, 196];
  for (const rr of [44, 78, 112]) out.push(`<circle cx="${yo[0]}" cy="${yo[1]}" r="${rr}" fill="none" stroke="${T.lineaAgua}" stroke-width="1" stroke-dasharray="3 4"/>`);
  out.push(barco(yo[0], yo[1], 0, 30, { p: null }), rotulo(yo[0] + 22, yo[1] + 22, 'tú', { size: TXT.nota, estilo: 'serif', weight: 700, anchor: 'start' }));
  // el blanco AIS: triángulo hacia su rumbo y su vector (rumbo y velocidad)
  const tri = (p, r, color, dash = '') => { const a = pol(p[0], p[1], r, 12); const b = pol(p[0], p[1], r + 145, 9); const c = pol(p[0], p[1], r - 145, 9); return `<path d="M${f1(a[0])},${f1(a[1])} L${f1(b[0])},${f1(b[1])} L${f1(c[0])},${f1(c[1])}Z" fill="${T.papel}" stroke="${color}" stroke-width="1.6"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`; };
  const b1 = [292, 96];
  out.push(tri(b1, 235, T.magenta), linea(pol(...b1, 235, 12), pol(...b1, 235, 58), T.magenta, 1.6));
  out.push(rotulo(W - 16, 40, 'mercante con AIS', { size: TXT.nota, estilo: 'serif', weight: 700, anchor: 'end', color: T.magenta }), rotulo(W - 16, 58, 'nombre, rumbo y velocidad', { size: TXT.min, estilo: 'serif', italic: true, anchor: 'end' }));
  // boya con AIS (ayuda a la navegación)
  out.push(`<path d="M282,232 l7,-14 l7,14Z" fill="${T.verde}" stroke="${T.tinta}" stroke-width="1"/><path d="M289,206 l9,9 l-9,9 l-9,-9Z" fill="none" stroke="${T.magenta}" stroke-width="1.4"/>`, rotulo(289, 252, 'boya con AIS', { size: TXT.min, estilo: 'serif', italic: true }));
  // velero sin AIS
  const v = [86, 186];
  out.push(`<g opacity=".7">${tri(v, 60, T.apagado, '3 2')}</g>`, rotulo(v[0], v[1] + 26, 'velero sin AIS:', { size: TXT.min + 0.5, estilo: 'serif', weight: 700 }), rotulo(v[0], v[1] + 42, 'no aparece', { size: TXT.min + 0.5, estilo: 'serif', italic: true }));
  out.push(`<rect x="0" y="268" width="${W}" height="${H - 268}" fill="${T.papel}"/>`, linea([0, 268], [W, 268], T.tinta, 0.8));
  out.push(serif(18, 292, 'Por VHF, canales 87B y 88B: unas 20–30 millas.'), serif(18, 314, 'No sustituye al radar ni a la vigilancia.', { weight: 700 }));
  out.push(cierra());
  return { svg: out.join(''), caption: 'El AIS emite y recibe por VHF la identidad, el rumbo y la velocidad de los barcos, estaciones costeras y ayudas a la navegación que lo llevan. Quien no lo lleva o lo tiene apagado no aparece: por eso no sustituye al radar ni a la vigilancia.' };
}
