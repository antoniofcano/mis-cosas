// Coordenadas geográficas (PY, UT 3.1) en estilo C (docs/ESTILO-LAMINAS.md): la esfera con el ecuador, los paralelos y
// los meridianos; la latitud y la longitud de un punto; el meridiano del lugar visto desde el polo; y las diferencias de
// latitud y de longitud. Mismo tipo y parámetros que la lámina de lección a la que sustituye:
//   { tipo:'coordenadas', vista:'esfera'|'latitud'|'longitud'|'lugar'|'diferencias', resaltar?, lat?, lon? }
// La esfera es una proyección ortográfica de verdad (vista algo desde encima del ecuador): lo que queda detrás, a trazos.

import { T, TXT, lienzo, rotulo, etiqueta, flecha, referencia, f1, rad } from './estilo-c.js';

const W = 358;
const pts = (p) => p.map(([x, y]) => `${f1(x)},${f1(y)}`).join(' ');
const fmtLat = (l) => `${Math.abs(l)}° ${l >= 0 ? 'N' : 'S'}`;
const fmtLon = (L) => `${String(Math.abs(L)).padStart(3, '0')}° ${L >= 0 ? 'E' : 'W'}`;
export const COORD_PARTES = ['eje', 'ecuador', 'paralelos', 'meridianos', 'greenwich', 'maximos', 'tropicos'];

/** Esfera en proyección ortográfica centrada en (cx, cy), de radio R, mirando al meridiano lon0 e inclinada `tilt` grados. */
function esfera(cx, cy, R, lon0, tilt) {
  const t = rad(tilt);
  const p = (lat, lon) => {
    const la = rad(lat);
    const dl = rad(lon - lon0);
    return {
      x: cx + R * Math.cos(la) * Math.sin(dl),
      y: cy - R * (Math.cos(t) * Math.sin(la) - Math.sin(t) * Math.cos(la) * Math.cos(dl)),
      z: Math.sin(t) * Math.sin(la) + Math.cos(t) * Math.cos(la) * Math.cos(dl),
    };
  };
  /** Curva sobre la esfera: la parte visible con su trazo y la de detrás, fina y a trazos. */
  const curva = (f, a, b, n, color, w, { p: parte = null, detras = true, extra = '' } = {}) => {
    const runs = [];
    let cur = null;
    for (let i = 0; i <= n; i++) {
      const q = f(a + ((b - a) * i) / n);
      const vis = q.z >= -1e-9;
      if (!cur || cur.vis !== vis) { cur = { vis, p: cur ? [cur.p[cur.p.length - 1]] : [] }; runs.push(cur); }
      cur.p.push([q.x, q.y]);
    }
    const s = runs.map((r) => (r.vis
      ? `<polyline points="${pts(r.p)}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round"${extra ? ` ${extra}` : ''}/>`
      : detras ? `<polyline points="${pts(r.p)}" fill="none" stroke="${color}" stroke-width=".8" stroke-dasharray="3 3" opacity=".5"/>` : '')).join('');
    return parte ? `<g data-parte="${parte}">${s}</g>` : s;
  };
  return {
    p, curva,
    paralelo: (lat, color, w, o) => curva((lon) => p(lat, lon), -180, 180, 120, color, w, o),
    meridiano: (lon, color, w, o) => curva((lat) => p(lat, lon), -90, 90, 90, color, w, o),
  };
}

/** Rótulo de la columna derecha con su guía hasta un punto de la figura. */
function guia(out, [px, py], x, y, t1, t2, color = T.tinta, fuerte = false) {
  out.push(referencia(px, py, x - 4, y - 4, { color: T.apagado }));
  out.push(rotulo(x, y, t1, { size: TXT.min + 0.5, estilo: 'serif', anchor: 'start', weight: 700, color }));
  if (t2) out.push(rotulo(x, y + 15, t2, { size: TXT.min, estilo: 'serif', italic: !fuerte, anchor: 'start', color: fuerte ? color : T.apagado, weight: fuerte ? 700 : 400 }));
}

function vistaEsfera(spec) {
  const hl = new Set([].concat(spec.resaltar ?? []));
  if ([...hl].some((k) => !COORD_PARTES.includes(k))) return null;
  if (hl.has('maximos')) { hl.add('ecuador'); hl.add('meridianos'); hl.add('greenwich'); }
  const tropicos = hl.has('tropicos');
  const H = 312;
  const alt = tropicos
    ? 'La Tierra en una esfera con el ecuador y los cuatro paralelos con nombre propio, resaltados: el trópico de Cáncer (23° 27′ N), el de Capricornio (23° 27′ S) y los círculos polares ártico y antártico (66° 33′ N y S).'
    : `La Tierra en una esfera con su eje entre los polos, el ecuador, varios paralelos y meridianos y el meridiano de Greenwich, cada uno con su rótulo: el ecuador y los meridianos son círculos máximos; los paralelos, círculos menores.${hl.size ? ` Resaltado: ${[...hl].filter((k) => k !== 'maximos').join(', ')}.` : ''}`;
  const { out, cierra } = lienzo(W, H, alt);
  const [cx, cy, R] = [126, 164, 104];
  const S = esfera(cx, cy, R, -20, 20);
  const any = hl.size > 0;
  const col = (k, base) => (hl.has(k) ? T.magenta : any ? T.apagado : base);
  const wid = (k, base) => (hl.has(k) ? 2.6 : base);
  out.push(`<circle cx="${cx}" cy="${cy}" r="${R}" fill="${T.agua}" stroke="${T.tinta}" stroke-width="1.4"/>`);
  const NP = S.p(90, 0);
  const SP = S.p(-90, 0);
  out.push(`<g data-parte="eje"><line x1="${cx}" y1="${f1(NP.y - 22)}" x2="${cx}" y2="${f1(2 * cy - NP.y + 22)}" stroke="${col('eje', T.tinta)}" stroke-width="${hl.has('eje') ? 2.2 : 1.1}" stroke-dasharray="5 3"/></g>`);
  out.push(`<circle cx="${f1(NP.x)}" cy="${f1(NP.y)}" r="3" fill="${T.tinta}"/><circle cx="${f1(SP.x)}" cy="${f1(SP.y)}" r="3" fill="${T.tinta}" opacity=".5"/>`);
  const lats = tropicos ? [23.45, -23.45, 66.55, -66.55] : [30, 60, -30, -60];
  out.push(`<g data-parte="${tropicos ? 'tropicos' : 'paralelos'}">${lats.map((l) => S.paralelo(l, col(tropicos ? 'tropicos' : 'paralelos', T.apagado), wid(tropicos ? 'tropicos' : 'paralelos', 1.1))).join('')}</g>`);
  out.push(`<g data-parte="meridianos">${[-140, -110, -80, -50, 40, 70, 100].map((L) => S.meridiano(L, col('meridianos', T.tinta), wid('meridianos', 0.8))).join('')}</g>`);
  out.push(S.meridiano(0, col('greenwich', T.verdeTxt), wid('greenwich', 2), { p: 'greenwich' }), S.paralelo(0, col('ecuador', T.azulTxt), wid('ecuador', 2), { p: 'ecuador' }));
  out.push(rotulo(cx - 10, NP.y - 10, 'Polo N', { size: TXT.min + 0.5, estilo: 'serif', anchor: 'end', weight: 700 }), rotulo(cx - 10, 2 * cy - NP.y + 22, 'Polo S', { size: TXT.min + 0.5, estilo: 'serif', anchor: 'end', weight: 700 }));
  out.push(rotulo(cx + 6, NP.y - 20, hl.has('eje') ? 'eje: gira de W a E' : 'eje', { size: TXT.min, estilo: 'serif', italic: true, anchor: 'start', color: hl.has('eje') ? T.magenta : T.tinta, weight: hl.has('eje') ? 700 : 400 }));
  const X = 246;
  const c2 = (k, base) => (hl.has(k) ? T.magenta : base);
  const eq = S.p(0, 64);
  guia(out, [eq.x, eq.y], X, 184, 'Ecuador', hl.has('maximos') ? 'círculo máximo' : '0° de latitud', c2('ecuador', T.azulTxt), hl.has('ecuador'));
  if (tropicos) {
    [[66.55, 'Polar ártico', '66° 33′ N', 46], [23.45, 'Trópico de Cáncer', '23° 27′ N', 112], [-23.45, 'Capricornio', '23° 27′ S', 236], [-66.55, 'Polar antártico', '66° 33′ S', 282]]
      .forEach(([l, n, v, y]) => { const q = S.p(l, 60); guia(out, [q.x, q.y], X, y, n, v, T.magenta, true); });
  } else {
    const gr = S.p(44, 0);
    guia(out, [gr.x, gr.y], X, 52, 'Greenwich', 'meridiano 0°', c2('greenwich', T.verdeTxt), hl.has('greenwich'));
    const pa = S.p(30, 56);
    guia(out, [pa.x, pa.y], X, 118, 'paralelo', 'círculo menor', c2('paralelos', T.tinta), hl.has('paralelos'));
    const me = S.p(-45, 40);
    guia(out, [me.x, me.y], X, 252, 'meridiano', 'círculo máximo', c2('meridianos', T.tinta), hl.has('meridianos'));
  }
  out.push(cierra());
  const cap = tropicos
    ? 'Los trópicos de Cáncer (23° 27′ N) y Capricornio (23° 27′ S) y los círculos polares Ártico y Antártico (66° 33′) son paralelos con nombre propio: los hay en los dos hemisferios.'
    : hl.has('eje')
      ? 'La Tierra gira de W a E sobre su eje, que pasa por el centro; sus extremos son los polos. El ecuador y los paralelos son perpendiculares al eje; los meridianos lo contienen.'
      : hl.has('maximos')
        ? 'Círculos máximos (su plano pasa por el centro): el ecuador y todos los meridianos. Círculos menores: los paralelos, que se hacen más pequeños hacia los polos.'
        : 'El ecuador (círculo máximo) divide la Tierra en hemisferios N y S. Los paralelos son círculos menores paralelos a él; los meridianos, círculos máximos que pasan por los dos polos. El de Greenwich es el meridiano cero.';
  return { svg: out.join(''), caption: cap };
}

function vistaLatLon(spec, vista) {
  const lat = Number(spec.lat ?? 40);
  const lon = Number(spec.lon ?? -50);
  if (!(Math.abs(lat) <= 90) || !(Math.abs(lon) <= 180)) return null;
  const lati = vista === 'latitud';
  const H = 300;
  const alt = lati
    ? `Esfera con un punto P en ${fmtLat(lat)} ${fmtLon(lon)}: la latitud, en magenta, es el arco de su meridiano desde el ecuador hasta P; a trazos, el paralelo del lugar, donde todos los puntos tienen la misma latitud.`
    : `Esfera con un punto P en ${fmtLat(lat)} ${fmtLon(lon)}: la longitud, en magenta, es el arco de ecuador desde el meridiano de Greenwich hasta el meridiano del lugar.`;
  const { out, cierra } = lienzo(W, H, alt);
  const [cx, cy, R] = [126, 158, 104];
  const S = esfera(cx, cy, R, -35, 20);
  const P = S.p(lat, lon);
  out.push(`<circle cx="${cx}" cy="${cy}" r="${R}" fill="${T.agua}" stroke="${T.tinta}" stroke-width="1.4"/>`);
  const NP = S.p(90, 0);
  out.push(`<line x1="${cx}" y1="${f1(NP.y - 18)}" x2="${cx}" y2="${f1(2 * cy - NP.y + 18)}" stroke="${T.tinta}" stroke-width="1" stroke-dasharray="5 3"/><circle cx="${f1(NP.x)}" cy="${f1(NP.y)}" r="3" fill="${T.tinta}"/>`);
  for (const l of [30, 60, -30, -60]) out.push(S.paralelo(l, T.apagado, 0.8));
  out.push(S.meridiano(lon, T.tinta, 1.3), S.meridiano(0, T.verdeTxt, lati ? 1.4 : 2.2), S.paralelo(0, T.azulTxt, lati ? 2.2 : 1.6));
  const X = 246;
  if (lati) {
    out.push(S.paralelo(lat, T.tinta, 1.4, { extra: 'stroke-dasharray="6 3"' }));
    const E = S.p(0, lon);
    out.push(`<line x1="${cx}" y1="${cy}" x2="${f1(E.x)}" y2="${f1(E.y)}" stroke="${T.tinta}" stroke-width=".8" stroke-dasharray="3 2"/><line x1="${cx}" y1="${cy}" x2="${f1(P.x)}" y2="${f1(P.y)}" stroke="${T.tinta}" stroke-width=".8" stroke-dasharray="3 2"/><circle cx="${cx}" cy="${cy}" r="2.4" fill="${T.tinta}"/>`);
    out.push(S.curva((l) => S.p(l, lon), 0, lat, 30, T.magenta, 3.2, { detras: false }));
    const M = S.p(lat / 2, lon);
    out.push(etiqueta(M.x + 44, M.y + 4, `l = ${fmtLat(lat)}`, { color: T.magenta }));
    const pl = S.p(lat, -10);
    guia(out, [pl.x, pl.y], X, 56, 'paralelo del lugar', `todos a ${fmtLat(lat)}`, T.tinta, false);
    const eq = S.p(0, 40);
    guia(out, [eq.x, eq.y], X, 176, 'Ecuador', 'origen: 0°', T.azulTxt);
    out.push(rotulo(X, 250, 'de 0° a 90°', { size: TXT.min + 0.5, estilo: 'serif', anchor: 'start', weight: 700, color: T.magenta }), rotulo(X, 266, 'hacia el N o el S', { size: TXT.min, estilo: 'serif', italic: true, anchor: 'start' }));
  } else {
    const G = S.p(0, 0);
    const E = S.p(0, lon);
    out.push(`<line x1="${cx}" y1="${cy}" x2="${f1(G.x)}" y2="${f1(G.y)}" stroke="${T.tinta}" stroke-width=".8" stroke-dasharray="3 2"/><line x1="${cx}" y1="${cy}" x2="${f1(E.x)}" y2="${f1(E.y)}" stroke="${T.tinta}" stroke-width=".8" stroke-dasharray="3 2"/>`);
    out.push(S.curva((L) => S.p(0, L), 0, lon, 40, T.magenta, 3.2, { detras: false }));
    const M = S.p(0, lon / 2);
    out.push(etiqueta(M.x, M.y + 22, `L = ${fmtLon(lon)}`, { color: T.magenta }));
    out.push(rotulo(P.x - 12, P.y - 22, 'meridiano del lugar', { size: TXT.min, estilo: 'serif', italic: true, anchor: 'middle' }));
    const gr = S.p(50, 0);
    guia(out, [gr.x, gr.y], X, 60, 'Greenwich', 'origen: 0°', T.verdeTxt);
    out.push(rotulo(X, 250, 'de 0° a 180°', { size: TXT.min + 0.5, estilo: 'serif', anchor: 'start', weight: 700, color: T.magenta }), rotulo(X, 266, 'hacia el E o el W', { size: TXT.min, estilo: 'serif', italic: true, anchor: 'start' }));
  }
  out.push(`<circle cx="${f1(P.x)}" cy="${f1(P.y)}" r="5.5" fill="${T.magenta}" stroke="${T.papel}" stroke-width="1.5"/>`, rotulo(P.x - 9, P.y - 6, 'P', { size: TXT.nota, estilo: 'serif', weight: 700, anchor: 'end', color: T.magenta }));
  out.push(cierra());
  const cap = lati
    ? `La latitud es el arco de meridiano desde el ecuador hasta el paralelo del lugar: de 0° a 90°, N o S. Todos los puntos del mismo paralelo tienen la misma latitud (aquí ${fmtLat(lat)}).`
    : `La longitud es el arco de ecuador desde el meridiano de Greenwich hasta el meridiano del lugar: de 0° a 180°, E o W. Todos los puntos del mismo meridiano tienen la misma longitud (aquí ${fmtLon(lon)}).`;
  return { svg: out.join(''), caption: cap };
}

/** Polo N visto desde arriba: el ecuador es el borde, los meridianos son radios. Greenwich abajo, el E a la derecha. */
const polar = (cx, cy, r) => (L, k = 1) => [cx + Math.sin(rad(L)) * r * k, cy + Math.cos(rad(L)) * r * k];
function arcoPolar(cx, cy, r, a, delta) {
  const P = polar(cx, cy, r);
  const n = Math.max(8, Math.round(Math.abs(delta) / 4));
  return pts(Array.from({ length: n + 1 }, (_, i) => P(a + (delta * i) / n)));
}

function vistaLugar(spec) {
  const lon = Number(spec.lon ?? -40);
  if (!(Math.abs(lon) <= 180)) return null;
  const anti = lon > 0 ? lon - 180 : lon + 180;
  const H = 312;
  const alt = `La Tierra vista desde encima del Polo N: el borde es el ecuador y los meridianos son radios, con Greenwich (0°) abajo y el de 180° arriba. Tu meridiano (${fmtLon(lon)}) en magenta: la mitad que pasa por ti es el meridiano superior; la opuesta, a trazos, el inferior. A la izquierda de Greenwich, el hemisferio W; a la derecha, el E.`;
  const { out, cierra } = lienzo(W, H, alt);
  const [cx, cy, r] = [W / 2, 150, 104];
  const P = polar(cx, cy, r);
  out.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${T.agua}" stroke="${T.azulTxt}" stroke-width="2"/>`);
  for (let L = 0; L < 360; L += 30) { const [x, y] = P(L); out.push(`<line x1="${cx}" y1="${cy}" x2="${f1(x)}" y2="${f1(y)}" stroke="${T.apagado}" stroke-width=".7"/>`); }
  for (const k of [1 / 3, 2 / 3]) out.push(`<circle cx="${cx}" cy="${cy}" r="${f1(r * k)}" fill="none" stroke="${T.apagado}" stroke-width=".7"/>`);
  const ln = (a, b, color, w, extra = '') => `<line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" stroke="${color}" stroke-width="${w}"${extra}/>`;
  out.push(ln([cx, cy], P(0), T.verdeTxt, 2.2), ln([cx, cy], P(180), T.verdeTxt, 2.2, ' stroke-dasharray="6 3"'));
  out.push(rotulo(cx, cy + r + 18, 'Greenwich 0°', { size: TXT.min + 0.5, estilo: 'serif', weight: 700, color: T.verdeTxt }), rotulo(cx, cy - r - 8, '180°', { size: TXT.min + 0.5, estilo: 'mono', weight: 700, color: T.verdeTxt }));
  out.push(rotulo(16, 30, 'HEMISFERIO W', { size: TXT.min, weight: 700, estilo: 'cap', anchor: 'start', color: T.apagado }), rotulo(W - 16, 30, 'HEMISFERIO E', { size: TXT.min, weight: 700, estilo: 'cap', anchor: 'end', color: T.apagado }));
  out.push(ln([cx, cy], P(lon), T.magenta, 3.2), ln([cx, cy], P(anti), T.magenta, 2.2, ' stroke-dasharray="6 4"'));
  const [ox, oy] = P(lon);
  out.push(`<circle cx="${f1(ox)}" cy="${f1(oy)}" r="6" fill="${T.magenta}" stroke="${T.papel}" stroke-width="1.5"/>`);
  out.push(rotulo(ox + (lon < 0 ? -10 : 10), oy + 16, `tú, ${fmtLon(lon)}`, { size: TXT.min + 0.5, estilo: 'serif', weight: 700, anchor: lon < 0 ? 'end' : 'start', color: T.magenta }));
  const [sx, sy] = P(lon, 0.55);
  const [ix, iy] = P(anti, 0.55);
  out.push(etiqueta(sx, sy, 'superior', { color: T.magenta, size: TXT.min }), etiqueta(ix, iy, 'inferior', { color: T.magenta, size: TXT.min }));
  out.push(`<circle cx="${cx}" cy="${cy}" r="3.5" fill="${T.tinta}"/>`, rotulo(cx + 8, cy - 8, 'Polo N', { size: TXT.min + 0.5, estilo: 'serif', weight: 700, anchor: 'start' }));
  out.push(rotulo(W / 2, H - 14, 'visto desde encima del Polo N; el borde es el ecuador', { size: TXT.min, estilo: 'serif', italic: true, color: T.apagado }));
  out.push(cierra());
  return { svg: out.join(''), caption: 'Cada observador tiene su meridiano del lugar. La mitad que pasa por él es el meridiano superior (el Sol lo cruza a mediodía); la opuesta, a 180° de longitud, el inferior (medianoche). Greenwich y el de 180° separan los hemisferios E y W.' };
}

function vistaDiferencias() {
  const H = 334;
  const alt = 'Dos ejemplos de diferencias. A la izquierda, la de longitud vista desde el Polo N: de 100° W a 110° E hay 210° por Greenwich, pero el camino corto, cruzando el meridiano de 180°, es de 150° hacia el W. A la derecha, la de latitud sobre un meridiano: de 2° 10′ N a 1° 20′ S hay 3° 30′ hacia el S. Debajo, las cuentas: distinto nombre, se suman.';
  const { out, cierra } = lienzo(W, H, alt);
  // ΔL en vista polar: de 100° W a 110° E
  const [cx, cy, r] = [94, 132, 70];
  const P = polar(cx, cy, r);
  out.push(rotulo(cx, 30, 'ΔL, desde el Polo N', { size: TXT.min + 0.5, estilo: 'serif', weight: 700 }));
  out.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${T.agua}" stroke="${T.azulTxt}" stroke-width="1.4"/>`);
  out.push(`<line x1="${cx}" y1="${cy}" x2="${f1(P(0)[0])}" y2="${f1(P(0)[1])}" stroke="${T.verdeTxt}" stroke-width="1.8"/><line x1="${cx}" y1="${cy}" x2="${f1(P(180)[0])}" y2="${f1(P(180)[1])}" stroke="${T.verdeTxt}" stroke-width="1.8" stroke-dasharray="5 3"/>`);
  out.push(rotulo(cx, cy + r + 15, '0°', { size: TXT.min, estilo: 'mono', weight: 700, color: T.verdeTxt }), rotulo(cx, cy - r - 6, '180°', { size: TXT.min, estilo: 'mono', weight: 700, color: T.verdeTxt }));
  const [A, B] = [-100, 110];
  for (const L of [A, B]) { const [x, y] = P(L); out.push(`<line x1="${cx}" y1="${cy}" x2="${f1(x)}" y2="${f1(y)}" stroke="${T.tinta}" stroke-width="1"/><circle cx="${f1(x)}" cy="${f1(y)}" r="4.5" fill="${T.tinta}"/>`); }
  out.push(`<polyline points="${arcoPolar(cx, cy, r * 0.48, A, 210)}" fill="none" stroke="${T.apagado}" stroke-width="1.4" stroke-dasharray="4 3"/>`);
  out.push(`<polyline points="${arcoPolar(cx, cy, r * 0.8, A, -150)}" fill="none" stroke="${T.magenta}" stroke-width="3"/>`);
  const [e1, e2] = [P(A - 146, 0.8), P(A - 150, 0.8)];
  out.push(flecha(e1[0], e1[1], e2[0], e2[1], { color: T.magenta, w: 3, punta: 10 }));
  const [ax, ay] = P(A);
  const [bx, by] = P(B);
  out.push(rotulo(ax + 2, ay + 26, '100° W', { size: TXT.min, estilo: 'mono', weight: 700, anchor: 'start' }), rotulo(bx - 2, by + 26, '110° E', { size: TXT.min, estilo: 'mono', weight: 700, anchor: 'end' }));
  out.push(rotulo(cx, cy + 5, '210°', { size: TXT.min, estilo: 'mono', color: T.apagado }), etiqueta(cx, cy - r * 0.8 + 22, '150° W', { color: T.magenta }));
  // Δl sobre un meridiano: de 2° 10′ N a 1° 20′ S (escala exagerada)
  const [x, ye, s] = [262, 134, 26];
  out.push(rotulo(272, 30, 'Δl, sobre el meridiano', { size: TXT.min + 0.5, estilo: 'serif', weight: 700 }));
  out.push(`<line x1="${x}" y1="52" x2="${x}" y2="220" stroke="${T.tinta}" stroke-width="1.4"/><line x1="${x - 26}" y1="${ye}" x2="${x + 76}" y2="${ye}" stroke="${T.azulTxt}" stroke-width="2"/>`);
  out.push(rotulo(x + 76, ye - 6, 'ecuador', { size: TXT.min, estilo: 'serif', italic: true, anchor: 'end', color: T.azulTxt }));
  const yA = ye - s * (2 + 10 / 60);
  const yB = ye + s * (1 + 20 / 60);
  out.push(flecha(x - 12, yA, x - 12, yB, { color: T.magenta, w: 2.6 }));
  out.push(`<circle cx="${x}" cy="${f1(yA)}" r="4.5" fill="${T.tinta}"/><circle cx="${x}" cy="${f1(yB)}" r="4.5" fill="${T.tinta}"/>`);
  out.push(rotulo(x + 9, yA + 4, '2° 10′ N', { size: TXT.min, estilo: 'mono', weight: 700, anchor: 'start' }), rotulo(x + 9, yB + 4, '1° 20′ S', { size: TXT.min, estilo: 'mono', weight: 700, anchor: 'start' }));
  out.push(etiqueta(x - 50, ye + 40, '3° 30′ S', { color: T.magenta }));
  // las cuentas
  out.push(`<line x1="14" y1="240" x2="${W - 14}" y2="240" stroke="${T.tinta}" stroke-width=".6"/>`);
  const fila = (y, t, o = {}) => rotulo(18, y, t, { size: TXT.min + 0.5, estilo: 'serif', anchor: 'start', ...o });
  out.push(fila(262, 'Distinto nombre (N y S, E y W): se suman.', { weight: 700 }));
  out.push(fila(284, 'Δl = 2° 10′ + 1° 20′ = 3° 30′ S', { color: T.magenta, weight: 700 }));
  out.push(fila(306, 'ΔL = 100° + 110° = 210° → 360° − 210° = 150° W', { color: T.magenta, weight: 700 }));
  out.push(cierra());
  return { svg: out.join(''), caption: 'Mismo nombre, se restan; distinto nombre, se suman. Si la ΔL pasa de 180° se toma 360° − ΔL y se cambia el sentido: es el camino corto, cruzando el meridiano de 180°.' };
}

export function coordenadasC(spec = {}) {
  const vista = spec.vista ?? 'esfera';
  if (vista === 'esfera') return vistaEsfera(spec);
  if (vista === 'latitud' || vista === 'longitud') return vistaLatLon(spec, vista);
  if (vista === 'lugar') return vistaLugar(spec);
  if (vista === 'diferencias') return vistaDiferencias();
  return null;
}
