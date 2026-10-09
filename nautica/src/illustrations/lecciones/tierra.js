// Láminas de «la Tierra y la carta»: coordenadas (esfera, latitud, longitud, meridiano del lugar, diferencias),
// la milla en la escala de latitudes, sondas y veriles con su corte del fondo, y los husos horarios.
// Funciones puras spec → { svg, caption }. Colores con las variables --l-* para que se lean en claro y en oscuro.

import { open, title, lbl, rad, fx } from '../kit.js';
import { coordenadasC, COORD_PARTES } from '../coordenadas-c.js';
import { husosC } from '../py-cola-c.js';

// Colores que se adaptan al tema (las variables están en styles/app.css).
const K = { v: 'var(--l-v)', r: 'var(--l-r)', m: 'var(--l-m)', a: 'var(--l-a)', p: 'var(--l-p)', g: 'var(--l-g)' };
/** Marcadores de flecha propios, coloreados con las variables del tema. */
const marks = (id) => `<defs>${Object.entries(K).map(([k, c]) => `<marker id="${id}-k${k}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" style="fill:${c}"/></marker>`).join('')}</defs>`;
const line = (x1, y1, x2, y2, c, w = 1.5, extra = '') => `<line x1="${fx(x1)}" y1="${fx(y1)}" x2="${fx(x2)}" y2="${fx(y2)}" style="stroke:${c}" stroke-width="${w}" ${extra}/>`;
const arr = (x1, y1, x2, y2, k, id, w = 2, extra = '') => line(x1, y1, x2, y2, K[k], w, `marker-end="url(#${id}-k${k})" ${extra}`);
/** Etiqueta con halo del color de fondo, para que no la tape ninguna línea que pase cerca. */
const tag = (x, y, t, c = null, anchor = 'start', extra = '') => `<text x="${fx(x)}" y="${fx(y)}" class="il-lbl" text-anchor="${anchor}" paint-order="stroke" style="stroke:var(--bg);stroke-width:3px;stroke-linejoin:round;${c ? `fill:${K[c] ?? c}` : ''}" ${extra}>${t}</text>`;
const B = 'font-weight="700"';
const lista = (r) => (r == null ? [] : Array.isArray(r) ? r : [r]);
const coma = (n, d = 1) => (+n).toFixed(d).replace('.', ',');
const pts = (p) => p.map(([x, y]) => `${fx(x)},${fx(y)}`).join(' ');

// ---------------------------------------------------------------------------
// Coordenadas (esfera, latitud, longitud, meridiano del lugar y diferencias): en estilo C, en
// src/illustrations/coordenadas-c.js.

// ---------------------------------------------------------------------------
// La milla en la carta. spec: { tipo:'milla', vista:'carta'|'minuto'|'definicion' }

function compas(x1, y1, x2, y2, c, h = 30) {
  // dos patas desde una charnela levantada sobre el punto medio
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const nx = (y1 - y2) / len;
  const ny = (x2 - x1) / len;
  const sgn = ny > 0 ? -1 : 1; // la charnela queda hacia arriba (en vertical, hacia dentro de la carta)
  const hx = mx + nx * h * sgn;
  const hy = my + ny * h * sgn;
  return `<g style="stroke:${c}" stroke-width="2.2" stroke-linecap="round" fill="none"><line x1="${fx(hx)}" y1="${fx(hy)}" x2="${fx(x1)}" y2="${fx(y1)}"/><line x1="${fx(hx)}" y1="${fx(hy)}" x2="${fx(x2)}" y2="${fx(y2)}"/></g><circle cx="${fx(hx)}" cy="${fx(hy)}" r="3.4" style="fill:${c}"/>`;
}

export function millaIllustration(spec = {}) {
  const vista = spec.vista ?? 'carta';
  if (vista === 'definicion') return millaDefinicion();
  if (vista === 'minuto') return millaMinuto();
  const W = 320;
  const H = 300;
  const id = 'mi';
  const out = open(W, H, 'La milla en la carta', id);
  out.push(marks(id), title(160, 'Las distancias, en la escala de latitudes'));
  // marco de la carta
  const x0 = 62;
  const x1 = 282;
  const y0 = 48;
  const y1 = 236;
  const bw = 7; // ancho de las bandas de escala
  const mLat = 18; // px por minuto de latitud
  const mLon = 14.5; // px por minuto de longitud (más corto: carta Mercator)
  out.push(`<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" style="fill:var(--l-mar);stroke:currentColor" stroke-width="1.2"/>`);
  // tierra en la esquina superior derecha
  out.push(`<path d="M${x1},${y0} L${x1},${y0 + 92} C${x1 - 20},${y0 + 86} ${x1 - 30},${y0 + 60} ${x1 - 56},${y0 + 52} C${x1 - 80},${y0 + 44} ${x1 - 76},${y0 + 18} ${x1 - 104},${y0} Z" style="fill:var(--land);stroke:var(--land-stroke)" stroke-width="1"/>`);
  // escalas: laterales (latitud) y superior/inferior (longitud)
  const bandV = (x) => {
    let s = '';
    let i = 0;
    for (let y = y1; y > y0 + 0.1; y -= mLat, i++) {
      const top = Math.max(y0, y - mLat);
      s += `<rect x="${x}" y="${fx(top)}" width="${bw}" height="${fx(y - top)}" style="fill:${i % 2 ? 'var(--bg)' : 'currentColor'};stroke:currentColor" stroke-width=".6"/>`;
    }
    return s;
  };
  const bandH = (y) => {
    let s = '';
    let i = 0;
    for (let x = x0; x < x1 - 0.1; x += mLon, i++) {
      const w = Math.min(mLon, x1 - x);
      s += `<rect x="${fx(x)}" y="${y}" width="${fx(w)}" height="${bw}" style="fill:${i % 2 ? 'var(--bg)' : 'currentColor'};stroke:currentColor" stroke-width=".6" opacity=".55"/>`;
    }
    return s;
  };
  out.push(bandV(x0 - bw), bandV(x1), bandH(y0 - bw), bandH(y1));
  // rótulos de la escala de latitudes (cada 2′)
  for (let k = 0; k <= 10; k += 2) {
    const y = y1 - k * mLat;
    if (y < y0) break;
    out.push(tag(x0 - bw - 3, y + 3.5, `36° ${String(k).padStart(2, '0')}′`, null, 'end', 'font-size="9"'));
  }
  // punto A, punto B y el compás tomando la distancia (3 millas)
  const d = 3 * mLat;
  const A = [130, 206];
  const ang = rad(52);
  const Bp = [A[0] + Math.sin(ang) * d, A[1] - Math.cos(ang) * d];
  out.push(line(...A, ...Bp, 'currentColor', 1.2, 'stroke-dasharray="4 3"'));
  out.push(`<circle cx="${A[0]}" cy="${A[1]}" r="3.5" fill="currentColor"/><circle cx="${fx(Bp[0])}" cy="${fx(Bp[1])}" r="3.5" fill="currentColor"/>`);
  out.push(tag(A[0] - 6, A[1] + 12, 'A', null, 'end', B), tag(Bp[0] + 7, Bp[1] + 12, 'B', null, 'start', B));
  out.push(compas(...A, ...Bp, K.v, 56));
  // el mismo compás en el margen izquierdo, a la misma altura
  const ym = (A[1] + Bp[1]) / 2;
  const ya = Math.round((ym + d / 2 - y1) / mLat) * mLat + y1; // ajusta a una división
  const yb = ya - d;
  const xm = x0 - bw / 2;
  out.push(compas(xm, ya, xm, yb, K.r, 50));
  out.push(`<rect x="${x0 - bw - 1}" y="${fx(yb)}" width="${bw + 2}" height="${fx(d)}" fill="none" style="stroke:${K.r}" stroke-width="2.4"/>`);
  out.push(tag(x0 + 36, ya + 14, '3′ = 3 millas', 'r', 'start', `${B} font-size="12"`));
  out.push(arr(A[0] - 10, ym - 2, x0 + 30, ym - 2, 'g', id, 1.4, 'stroke-dasharray="4 3"'));
  // la escala de arriba no sirve
  const xx = 120;
  out.push(line(xx - 7, y0 - bw - 7, xx + 7, y0 + 7, K.r, 2.6), line(xx - 7, y0 + 7, xx + 7, y0 - bw - 7, K.r, 2.6));
  out.push(tag(xx + 12, y0 + 12, 'longitudes: no', 'r', 'start', B));
  // pie
  out.push(tag(14, y1 + 26, 'Escala de latitudes (márgenes laterales),', null, 'start', B));
  out.push(tag(14, y1 + 40, 'a la altura de lo que mides: 1′ = 1 milla.', null, 'start', B));
  out.push(tag(14, y1 + 54, 'Arriba y abajo (longitudes) 1′ es más corto.', 'g', 'start'));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Toma la distancia con el compás de puntas y llévala a la escala de latitudes, la de los márgenes laterales, a la altura de la zona donde mides: cada minuto es una milla. La escala de longitudes (arriba y abajo) no sirve para distancias.' };
}

function millaMinuto() {
  const W = 320;
  const H = 220;
  const id = 'mm';
  const out = open(W, H, 'Divisiones de la escala de latitudes', id);
  out.push(marks(id), title(160, 'Un minuto de la escala, dividido'));
  // escala horizontal ampliada: 2 minutos, cada uno en 5 partes de 0,2′
  const x0 = 30;
  const u = 130; // px por minuto
  const y = 82;
  for (let m = 0; m < 2; m++) {
    for (let k = 0; k < 5; k++) {
      const x = x0 + m * u + (k * u) / 5;
      out.push(`<rect x="${fx(x)}" y="${y}" width="${fx(u / 5)}" height="14" style="fill:${(m * 5 + k) % 2 ? 'var(--bg)' : 'currentColor'};stroke:currentColor" stroke-width=".7"/>`);
    }
  }
  for (let m = 0; m <= 2; m++) out.push(line(x0 + m * u, y - 10, x0 + m * u, y + 24, 'currentColor', 1.4), tag(x0 + m * u, y - 14, `${m}′`, null, 'middle', B));
  // 1 minuto = 1 milla
  out.push(arr(x0 + 2, y + 34, x0 + u - 2, y + 34, 'r', id, 2.4, `marker-start="url(#${id}-kr)"`));
  out.push(tag(x0 + u / 2, y + 50, '1′ = 1 milla', 'r', 'middle', `${B} font-size="12"`));
  // una parte = 0,2′
  const xs = x0 + u + (2 * u) / 5;
  out.push(arr(xs + 1, y + 34, xs + u / 5 - 1, y + 34, 'v', id, 2.4, `marker-start="url(#${id}-kv)"`));
  out.push(tag(xs + u / 10, y + 50, '0,2′ = 0,2 millas', 'v', 'middle', B));
  out.push(line(14, 158, W - 14, 158, K.g, 0.8));
  out.push(tag(14, 176, '1° = 60′ = 60 millas', null, 'start', B));
  out.push(tag(14, 192, 'Una décima de minuto (0,1′) = 0,1 millas', null, 'start', B));
  out.push(tag(14, 208, 'Cable = 0,1 millas = 185,2 m', null, 'start'));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Cada minuto de la escala de latitudes es una milla. Si viene dividido en cinco partes, cada una vale 0,2′, es decir, 0,2 millas; una décima de minuto son 0,1 millas.' };
}

function millaDefinicion() {
  const W = 320;
  const H = 254;
  const id = 'md';
  const out = open(W, H, 'La milla náutica', id);
  out.push(marks(id), title(160, 'La milla: un minuto de círculo máximo'));
  const cx = 104;
  const cy = 136;
  const R = 80;
  out.push(`<circle cx="${cx}" cy="${cy}" r="${R}" style="fill:var(--l-mar);stroke:${K.v}" stroke-width="2"/>`);
  out.push(tag(cx, cy + R + 14, 'círculo máximo', 'v', 'middle', B), tag(cx, cy + R + 26, '(meridiano o ecuador)', 'v', 'middle', 'font-size="9"'));
  // ángulo central «de un minuto» (exagerado para que se vea)
  const a1 = 40;
  const a2 = 64;
  const P1 = [cx + Math.sin(rad(a1)) * R, cy - Math.cos(rad(a1)) * R];
  const P2 = [cx + Math.sin(rad(a2)) * R, cy - Math.cos(rad(a2)) * R];
  out.push(line(cx, cy, ...P1, 'currentColor', 1.2), line(cx, cy, ...P2, 'currentColor', 1.2));
  const n = 16;
  const arc = [];
  for (let i = 0; i <= n; i++) { const a = a1 + ((a2 - a1) * i) / n; arc.push([cx + Math.sin(rad(a)) * R, cy - Math.cos(rad(a)) * R]); }
  out.push(`<polyline points="${pts(arc)}" fill="none" style="stroke:${K.r}" stroke-width="4.5"/>`);
  const sa = [];
  for (let i = 0; i <= n; i++) { const a = a1 + ((a2 - a1) * i) / n; sa.push([cx + Math.sin(rad(a)) * 22, cy - Math.cos(rad(a)) * 22]); }
  out.push(`<polyline points="${pts(sa)}" fill="none" style="stroke:currentColor" stroke-width="1.4"/>`, tag(cx + 26, cy - 14, '1′', null, 'start', B));
  out.push(`<circle cx="${cx}" cy="${cy}" r="3" fill="currentColor"/>`, tag(cx - 4, cy + 14, 'centro', null, 'end', 'font-size="9"'));
  const X = 194;
  out.push(tag(X, 70, 'arco de 1′', 'r', 'start', B), tag(X, 86, '= 1 milla náutica', 'r', 'start', `${B} font-size="12"`), tag(X, 102, '= 1852 m (convenio)', 'r', 'start', B));
  out.push(tag(X, 130, 'Cable: 185,2 m', null, 'start'), tag(X, 146, 'Milla terrestre: 1609 m', 'g', 'start'), tag(X, 160, '(no tiene que ver)', 'g', 'start'));
  out.push(tag(X, 188, 'Por eso en la carta:', null, 'start', B), tag(X, 202, '1′ de latitud = 1 milla', null, 'start', B));
  out.push(tag(X, 226, 'ángulo exagerado', 'g', 'start', 'font-size="9"'), tag(X, 237, 'para que se vea', 'g', 'start', 'font-size="9"'));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'La milla náutica es la longitud de un minuto de arco de un círculo máximo de la Tierra; por convenio internacional mide 1852 m. Por eso, en la carta, un minuto de latitud es una milla.' };
}

// ---------------------------------------------------------------------------
// Sondas y veriles con su corte. spec: { tipo:'veriles', vista:'carta'|'fondos', resaltar? }

const FONDOS = [
  ['S', 'arena', 'sand'], ['M', 'fango', 'mud'], ['Cy', 'arcilla', 'clay'], ['Si', 'limo', 'silt'],
  ['St', 'piedras', 'stones'], ['G', 'cascajo (grava)', 'gravel'], ['P', 'guijarros', 'pebbles'], ['R', 'roca', 'rock'],
  ['Sh', 'conchuela', 'shells'], ['Co', 'coral', 'coral'], ['Wd', 'algas', 'weed'],
];

export function verilesIllustration(spec = {}) {
  if ((spec.vista ?? 'carta') === 'fondos') return fondosIllustration(spec);
  const hl = new Set(lista(spec.resaltar));
  const W = 320;
  const H = 300;
  const id = 've';
  const out = open(W, H, 'Sondas y veriles', id);
  out.push(marks(id), title(160, 'Sondas y veriles (metros)'));
  const top = 32;
  const bot = 156;
  const xR = 308;
  // costa a la izquierda; posición x de cada veril según la altura y
  const coast = (y) => 34 + 10 * Math.sin((y - top) / 18) + 6 * Math.cos((y - top) / 31);
  const VER = [[5, 92, 12, 23], [10, 150, 14, 29], [20, 228, 11, 37]];
  const verX = (i, y) => { const [, b, a, f] = VER[i]; return b + a * Math.sin((y - top) / f + i); };
  const depth = (x, y) => {
    const xs = [coast(y), ...VER.map((_, i) => verX(i, y)), xR + 40];
    const ds = [0, 5, 10, 20, 28];
    for (let i = 0; i < xs.length - 1; i++) if (x <= xs[i + 1]) return ds[i] + ((ds[i + 1] - ds[i]) * (x - xs[i])) / (xs[i + 1] - xs[i]);
    return 28;
  };
  const curveX = (fx_) => { const p = []; for (let y = top; y <= bot; y += 4) p.push([fx_(y), y]); return p; };
  const coastP = curveX(coast);
  const v5 = curveX((y) => verX(0, y));
  const v10 = curveX((y) => verX(1, y));
  out.push(`<clipPath id="${id}-clip"><rect x="12" y="${top}" width="${xR - 12}" height="${bot - top}"/></clipPath>`);
  out.push(`<g clip-path="url(#${id}-clip)">`);
  // zonas someras en azul (0–5 m más intenso, 5–10 m más claro)
  out.push(`<polygon points="${pts([...coastP, ...v10.slice().reverse()])}" style="fill:var(--l-mar)"/>`);
  out.push(`<polygon points="${pts([...coastP, ...v5.slice().reverse()])}" style="fill:var(--l-v)" opacity=".28"/>`);
  out.push(`<polygon points="${pts([[0, top], ...coastP, [0, bot]])}" style="fill:var(--land);stroke:var(--land-stroke)" stroke-width="1.2"/>`);
  VER.forEach(([m], i) => {
    const on = hl.has('veriles');
    out.push(`<polyline points="${pts(curveX((y) => verX(i, y)))}" fill="none" style="stroke:${on ? K.r : K.v}" stroke-width="${on ? 2.4 : 1.4}"/>`);
  });
  out.push('</g>');
  out.push(`<rect x="12" y="${top}" width="${xR - 12}" height="${bot - top}" fill="none" style="stroke:currentColor" stroke-width="1"/>`);
  out.push(tag(18, top + 14, 'tierra', null, 'start', `${B} font-size="9"`));
  // cota de cada veril, sobre su línea (con halo, como en la carta)
  VER.forEach(([m], i) => { const y = top + 22; out.push(tag(verX(i, y), y + 4, String(m), hl.has('veriles') ? 'r' : 'v', 'middle', B)); });
  // corte X–Y
  const ys = 112;
  const xa = coast(ys);
  out.push(line(xa, ys, xR - 4, ys, 'currentColor', 1.2, 'stroke-dasharray="6 3"'), tag(xa + 2, ys - 5, 'X', null, 'start', B), tag(xR - 6, ys - 5, 'Y', null, 'end', B));
  // sondas (calculadas con la misma profundidad que el corte) y naturaleza del fondo
  const SON = [[64, 62, 'S'], [118, 78, ''], [116, 140, 'S Sh'], [186, 58, 'M'], [196, 138, ''], [262, 74, 'G'], [270, 136, ''], [56, 132, 'R']];
  for (const [x, y, f] of SON) {
    const dd = Math.max(1, Math.round(depth(x, y)));
    const onS = hl.has('sondas');
    const onF = hl.has('fondo');
    out.push(tag(x, y, String(dd), onS ? 'r' : null, 'middle', onS ? `${B} font-size="11"` : 'font-size="10"'));
    if (f) out.push(tag(x, y + 11, f, onF ? 'r' : 'a', 'middle', `${B} font-size="9" font-style="italic"`));
  }
  // corte del fondo debajo, con las mismas x
  const s0 = 182;
  const k = 3.6; // px por metro
  out.push(tag(14, s0 - 10, 'Corte X–Y', null, 'start', B));
  const prof = [];
  for (let x = xa; x <= xR; x += 3) prof.push([x, s0 + depth(x, ys) * k]);
  prof.push([xR, s0 + depth(xR, ys) * k]);
  out.push(`<polygon points="${pts([[xa, s0], ...prof, [xR, s0], [xR, s0]])}" style="fill:var(--l-mar)"/>`);
  out.push(`<polygon points="${pts([[12, s0 - 12], [xa - 6, s0 - 3], ...prof, [xR, H - 8], [12, H - 8]])}" style="fill:var(--land);stroke:var(--land-stroke)" stroke-width="1.2"/>`);
  out.push(line(xa, s0, xR, s0, K.v, 1.6), tag(xR, s0 - 4, 'cero hidrográfico', 'v', 'end', 'font-size="9"'));
  VER.forEach(([m], i) => {
    const x = verX(i, ys);
    const y = s0 + m * k;
    out.push(line(x, ys + 2, x, y, K.g, 0.9, 'stroke-dasharray="2 3"'));
    out.push(`<circle cx="${fx(x)}" cy="${fx(y)}" r="3" style="fill:${hl.has('veriles') ? K.r : K.v}"/>`);
    out.push(tag(x + 5, y + 12, `${m} m`, hl.has('veriles') ? 'r' : 'v', 'start', B));
  });
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Las cifras sueltas son las sondas: la profundidad en metros desde el cero hidrográfico. Los veriles unen puntos de igual profundidad, como curvas de nivel; las zonas someras van en azul. Las letras dicen de qué es el fondo (S arena, M fango, G cascajo, R roca, S Sh arena con conchuela).' };
}

function fondosIllustration(spec) {
  const hl = new Set(lista(spec.resaltar));
  const W = 320;
  const H = 286;
  const out = open(W, H, 'Naturaleza del fondo', 'vf');
  out.push(title(160, 'Naturaleza del fondo en la carta'));
  const col = (i) => (i < 6 ? 0 : 1);
  FONDOS.forEach(([ab, es, en], i) => {
    const c = col(i);
    const y = 50 + (i - c * 6) * 26;
    const x = 14 + c * 156;
    const on = hl.has(ab);
    out.push(`<rect x="${x}" y="${y - 14}" width="34" height="20" rx="4" style="fill:${on ? K.r : 'var(--l-mar)'};stroke:${on ? K.r : K.v}" stroke-width="${on ? 2 : 1}"/>`);
    out.push(`<text x="${x + 17}" y="${y + 1}" text-anchor="middle" font-size="12" font-weight="700" font-style="italic" style="fill:${on ? 'var(--bg)' : 'currentColor'}">${ab}</text>`);
    out.push(lbl(x + 40, y - 1, es, on ? K.r : null, 'start', on ? `${B} font-size="11"` : 'font-size="11"'), lbl(x + 40, y + 9, `(${en})`, K.g, 'start', 'font-size="9"'));
  });
  out.push(line(14, 206, W - 14, 206, K.g, 0.8));
  out.push(lbl(14, 224, 'Varias juntas, primero la que predomina:', null, 'start', B));
  out.push(lbl(14, 241, 'S G = arena con cascajo', K.a, 'start', B), lbl(14, 257, 'S Sh = arena con conchuela', K.a, 'start', B));
  out.push(lbl(14, 276, 'Ojo: G no es guijarro (P); St no es roca (R).', K.g, 'start'));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Junto a muchas sondas, unas letras (del inglés) dicen de qué es el fondo, útil para fondear. Si hay varias, la primera es la que predomina.' };
}

// ---------------------------------------------------------------------------
// Husos horarios (husos, cálculo y hora oficial): en estilo C, en src/illustrations/py-cola-c.js.

// ---------------------------------------------------------------------------

export const LAMINAS = {
  coordenadas: {
    fn: coordenadasC,
    params: { vista: ['esfera', 'latitud', 'longitud', 'lugar', 'diferencias'], resaltar: COORD_PARTES, lat: 'latitud de P en grados, N + (latitud; por defecto 40)', lon: 'longitud de P en grados, E + / W − (latitud, longitud y lugar; por defecto −50, en lugar −40)' },
    ejemplo: { tipo: 'coordenadas', vista: 'latitud', lat: 40, lon: -50 },
  },
  milla: {
    fn: millaIllustration,
    params: { vista: ['carta', 'minuto', 'definicion'] },
    ejemplo: { tipo: 'milla', vista: 'carta' },
  },
  veriles: {
    fn: verilesIllustration,
    params: { vista: ['carta', 'fondos'], resaltar: ['sondas', 'veriles', 'fondo', ...FONDOS.map((f) => f[0])] },
    ejemplo: { tipo: 'veriles', vista: 'carta' },
  },
  husos: {
    fn: husosC,
    params: { vista: ['husos', 'calculo', 'oficial'], ejemplo: ['e', 'w'], lon: 'opcional, longitud en grados (E +, W −)', tu: 'opcional, "HH:MM"' },
    ejemplo: { tipo: 'husos', vista: 'calculo', ejemplo: 'e' },
  },
};
