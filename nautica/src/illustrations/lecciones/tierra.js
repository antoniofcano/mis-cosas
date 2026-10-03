// Láminas de «la Tierra y la carta»: coordenadas (esfera, latitud, longitud, meridiano del lugar, diferencias),
// la milla en la escala de latitudes, sondas y veriles con su corte del fondo, y los husos horarios.
// Funciones puras spec → { svg, caption }. Colores con las variables --l-* para que se lean en claro y en oscuro.

import { husoDe, horaLegal, horaCivilLugar } from '../../nautical/hora.js';
import { open, title, lbl, rad, fx } from '../kit.js';

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
// Esfera en proyección ortográfica, vista algo desde encima del ecuador.

function esferaProy(cx, cy, R, lon0, tilt) {
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
  /** Curva sobre la esfera: devuelve la parte visible (trazo) y la oculta (discontinua y tenue). */
  const curva = (f, a, b, n, c, w, extraFront = '', back = true) => {
    const runs = [];
    let cur = null;
    for (let i = 0; i <= n; i++) {
      const q = f(a + ((b - a) * i) / n);
      const vis = q.z >= -1e-9;
      if (!cur || cur.vis !== vis) { cur = { vis, p: cur ? [cur.p[cur.p.length - 1]] : [] }; runs.push(cur); }
      cur.p.push([q.x, q.y]);
    }
    return runs.map((r) => r.vis
      ? `<polyline points="${pts(r.p)}" fill="none" style="stroke:${c}" stroke-width="${w}" ${extraFront}/>`
      : back ? `<polyline points="${pts(r.p)}" fill="none" style="stroke:${c}" stroke-width="${Math.min(w, 1.2)}" stroke-dasharray="3 3" opacity=".45"/>` : '').join('');
  };
  const paralelo = (lat, c, w, extra) => curva((lon) => p(lat, lon), -180, 180, 120, c, w, extra);
  const meridiano = (lon, c, w, extra, from = -90, to = 90) => curva((lat) => p(lat, lon), from, to, 90, c, w, extra);
  return { p, curva, paralelo, meridiano };
}

const COORD_PARTES = ['eje', 'ecuador', 'paralelos', 'meridianos', 'greenwich', 'maximos', 'tropicos'];
const fmtLat = (l) => `${Math.abs(l)}° ${l >= 0 ? 'N' : 'S'}`;
const fmtLon = (L) => `${String(Math.abs(L)).padStart(3, '0')}° ${L >= 0 ? 'E' : 'W'}`;

export function coordenadasIllustration(spec = {}) {
  const vista = spec.vista ?? 'esfera';
  if (vista === 'lugar') return meridianoLugar(spec);
  if (vista === 'diferencias') return diferencias(spec);
  const W = 320;
  const H = 270;
  const id = `co${vista[0]}`;
  const out = open(W, H, 'Coordenadas', id);
  out.push(marks(id));
  const cx = 112;
  const cy = 148;
  const R = 90;
  const lon0 = vista === 'esfera' ? -20 : -35;
  const S = esferaProy(cx, cy, R, lon0, 20);
  const hl = new Set(lista(spec.resaltar));
  if (hl.has('maximos')) { hl.add('ecuador'); hl.add('meridianos'); hl.add('greenwich'); }
  const any = hl.size > 0 && vista === 'esfera';
  const on = (k) => hl.has(k);
  const col = (k, base) => (on(k) ? K.r : any ? K.g : base);
  const wid = (k, base) => (on(k) ? 3 : base);
  out.push(`<circle cx="${cx}" cy="${cy}" r="${R}" style="fill:var(--l-mar);stroke:currentColor" stroke-width="1.4"/>`);
  const NP = S.p(90, 0);
  const SP = S.p(-90, 0);
  // eje
  const ejeC = vista === 'esfera' ? col('eje', 'currentColor') : 'currentColor';
  const ext = 22;
  const dy = NP.y - cy;
  out.push(line(cx, NP.y - ext, cx, cy - dy + ext, ejeC, on('eje') ? 2.4 : 1.2, 'stroke-dasharray="5 3"'));
  out.push(`<circle cx="${fx(NP.x)}" cy="${fx(NP.y)}" r="3" fill="currentColor"/><circle cx="${fx(SP.x)}" cy="${fx(SP.y)}" r="3" fill="currentColor" opacity=".5"/>`);

  if (vista === 'esfera') {
    const tropicos = on('tropicos');
    const lats = tropicos ? [23.45, -23.45, 66.55, -66.55] : [30, 60, -30, -60];
    for (const l of lats) out.push(S.paralelo(l, col(tropicos ? 'tropicos' : 'paralelos', K.g), wid(tropicos ? 'tropicos' : 'paralelos', 1.2)));
    for (const L of [-140, -110, -80, -50, 40, 70, 100]) out.push(S.meridiano(L, col('meridianos', 'currentColor'), wid('meridianos', 0.9), on('meridianos') ? '' : 'opacity=".55"'));
    out.push(S.meridiano(0, col('greenwich', K.p), wid('greenwich', 2.2)));
    out.push(S.paralelo(0, col('ecuador', K.v), wid('ecuador', 2.2)));
    out.push(title(160, tropicos ? 'Paralelos con nombre propio' : on('maximos') ? 'Círculos máximos y menores' : 'Ecuador, paralelos y meridianos'));
    // rótulos a la derecha, con guía hasta su línea
    const X = 210;
    const w = (k) => (on(k) || (k === 'paralelos' && tropicos) ? B : '');
    const c2 = (k, base) => (on(k) ? 'r' : base);
    out.push(tag(cx - 8, NP.y - 12, 'Polo N', null, 'end', B), tag(cx - 8, cy - dy + 22, 'Polo S', null, 'end', B));
    out.push(tag(cx + 6, NP.y - ext + 4, on('eje') ? 'eje (gira de W a E)' : 'eje', on('eje') ? 'r' : null, 'start', w('eje')));
    const eq = S.p(0, 70);
    out.push(line(eq.x + 2, eq.y, X - 3, eq.y, K.g, 0.8), tag(X, eq.y - 2, 'Ecuador', c2('ecuador', 'v'), 'start', B), tag(X, eq.y + 10, on('maximos') ? 'círculo máximo' : '(0° de latitud)', c2('ecuador', 'v'), 'start', w('ecuador')));
    if (tropicos) {
      const rows = [[66.55, 'Polar Ártico', '66° 33′ N'], [23.45, 'Trópico Cáncer', '23° 27′ N'], [-23.45, 'Tróp. Capricornio', '23° 27′ S'], [-66.55, 'Polar Antártico', '66° 33′ S']];
      const ys = [52, 96, 194, 236];
      rows.forEach(([l, n, v], i) => {
        const q = S.p(l, 70);
        out.push(line(q.x + 2, q.y, X - 3, ys[i] - 3, K.g, 0.8), tag(X, ys[i] - 4, n, 'r', 'start', B), tag(X, ys[i] + 8, v, 'r'));
      });
    } else {
      const pa = S.p(30, 60);
      out.push(line(pa.x + 2, pa.y, X - 3, 104, K.g, 0.8), tag(X, 102, 'paralelo', c2('paralelos', 'g'), 'start', B), tag(X, 114, 'círculo menor', c2('paralelos', 'g'), 'start', w('paralelos')));
      const me = S.p(-45, 40);
      out.push(line(me.x + 2, me.y, X - 3, 210, K.g, 0.8), tag(X, 208, 'meridiano', c2('meridianos', null), 'start', B), tag(X, 220, 'círculo máximo', c2('meridianos', null), 'start', w('meridianos')));
      const gr = S.p(42, 0);
      out.push(line(gr.x + 2, gr.y, X - 3, 64, K.g, 0.8), tag(X, 62, 'Greenwich', c2('greenwich', 'p'), 'start', B), tag(X, 74, 'meridiano 0°', c2('greenwich', 'p'), 'start', w('greenwich')));
    }
    out.push('</svg>');
    const cap = tropicos
      ? 'Los trópicos de Cáncer (23° 27′ N) y Capricornio (23° 27′ S) y los círculos polares Ártico y Antártico (66° 33′) son paralelos con nombre propio: los hay en los dos hemisferios.'
      : on('eje')
        ? 'La Tierra gira de W a E sobre su eje, que pasa por el centro; sus extremos son los polos. El ecuador y los paralelos son perpendiculares al eje; los meridianos lo contienen.'
        : on('maximos')
          ? 'Círculos máximos (su plano pasa por el centro): el ecuador y todos los meridianos. Círculos menores: los paralelos, que se hacen más pequeños hacia los polos.'
          : 'El ecuador (círculo máximo) divide la Tierra en hemisferios N y S. Los paralelos son círculos menores paralelos a él; los meridianos, círculos máximos que pasan por los dos polos. El de Greenwich es el meridiano cero.';
    return { svg: out.join(''), caption: cap };
  }

  // Latitud o longitud de un punto P
  const lat = Number(spec.lat ?? 40);
  const lon = Number(spec.lon ?? -50);
  const P = S.p(lat, lon);
  for (const l of [30, 60, -30, -60]) out.push(S.paralelo(l, K.g, 0.8, 'opacity=".6"'));
  out.push(S.meridiano(lon, 'currentColor', 1.2));
  out.push(S.meridiano(0, K.p, vista === 'longitud' ? 2.4 : 1.4));
  out.push(S.paralelo(0, K.v, vista === 'longitud' ? 1.6 : 2.2));
  if (vista === 'latitud') {
    out.push(title(160, `Latitud: l = ${fmtLat(lat)}`));
    out.push(S.paralelo(lat, K.g, 1.4, 'stroke-dasharray="5 3"'));
    const E = S.p(0, lon);
    out.push(line(cx, cy, E.x, E.y, 'currentColor', 1, 'stroke-dasharray="3 2"'), line(cx, cy, P.x, P.y, 'currentColor', 1, 'stroke-dasharray="3 2"'));
    out.push(S.curva((l) => S.p(l, lon), 0, lat, 30, K.r, 4, `marker-end="url(#${id}-kr)"`));
    const M = S.p(lat / 2, lon);
    out.push(tag(M.x + 10, M.y + 8, `l = ${fmtLat(lat)}`, 'r', 'start', `${B} font-size="12"`));
    out.push(tag(M.x + 10, M.y + 21, 'arco de meridiano', 'r', 'start'));
    out.push(`<circle cx="${cx}" cy="${cy}" r="2.5" fill="currentColor"/>`);
    const X = 210;
    out.push(tag(X, 60, 'paralelo del lugar', 'g', 'start', B), line(X - 3, 63, S.p(lat, -10).x + 2, S.p(lat, -10).y, K.g, 0.8));
    out.push(tag(X, 72, `todos a ${fmtLat(lat)}`, 'g'));
    const eq = S.p(0, 40);
    out.push(line(eq.x + 2, eq.y, X - 3, eq.y + 2, K.g, 0.8), tag(X, eq.y + 0, 'Ecuador', 'v', 'start', B), tag(X, eq.y + 12, 'origen: 0°', 'v'));
    out.push(tag(X, 222, 'de 0° a 90°', null, 'start', B), tag(X, 234, 'hacia el N o el S', null));
  } else {
    out.push(title(160, `Longitud: L = ${fmtLon(lon)}`));
    const G = S.p(0, 0);
    const E = S.p(0, lon);
    out.push(line(cx, cy, G.x, G.y, 'currentColor', 1, 'stroke-dasharray="3 2"'), line(cx, cy, E.x, E.y, 'currentColor', 1, 'stroke-dasharray="3 2"'));
    out.push(S.curva((L) => S.p(0, L), 0, lon, 40, K.r, 4, `marker-end="url(#${id}-kr)"`));
    const M = S.p(0, lon / 2);
    out.push(tag(M.x, M.y + 18, `L = ${fmtLon(lon)}`, 'r', 'middle', `${B} font-size="12"`));
    out.push(tag(M.x, M.y + 31, 'arco de ecuador', 'r', 'middle'));
    out.push(tag(P.x + 20, P.y + 4, 'meridiano', null, 'start', B), tag(P.x + 20, P.y + 16, 'del lugar', null, 'start', B));
    const gr = S.p(50, 0);
    const X = 210;
    out.push(line(gr.x + 2, gr.y, X - 3, 70, K.g, 0.8), tag(X, 68, 'Greenwich', 'p', 'start', B), tag(X, 80, 'origen: 0°', 'p'));
    out.push(tag(X, 214, 'de 0° a 180°', null, 'start', B), tag(X, 226, 'hacia el E o el W', null));
  }
  out.push(`<circle cx="${fx(P.x)}" cy="${fx(P.y)}" r="5" style="fill:${K.r};stroke:var(--bg)" stroke-width="1.5"/>`, tag(P.x - 8, P.y - 6, 'P', 'r', 'end', `${B} font-size="12"`));
  out.push('</svg>');
  const cap = vista === 'latitud'
    ? `La latitud es el arco de meridiano desde el ecuador hasta el paralelo del lugar: de 0° a 90°, N o S. Todos los puntos del mismo paralelo tienen la misma latitud (aquí ${fmtLat(lat)}).`
    : `La longitud es el arco de ecuador desde el meridiano de Greenwich hasta el meridiano del lugar: de 0° a 180°, E o W. Todos los puntos del mismo meridiano tienen la misma longitud (aquí ${fmtLon(lon)}).`;
  return { svg: out.join(''), caption: cap };
}

/** Polo N visto desde arriba: el ecuador es el borde, los meridianos son radios. Greenwich abajo, E a la derecha. */
const polar = (cx, cy, r) => (L, k = 1) => [cx + Math.sin(rad(L)) * r * k, cy + Math.cos(rad(L)) * r * k];
/** Arco sobre la vista polar entre dos longitudes (siguiendo el sentido de a hacia b, en grados con signo). */
function arcoPolar(cx, cy, r, a, delta) {
  const P = polar(cx, cy, r);
  const n = Math.max(8, Math.round(Math.abs(delta) / 4));
  const p = [];
  for (let i = 0; i <= n; i++) p.push(P(a + (delta * i) / n));
  return pts(p);
}

function meridianoLugar(spec) {
  const W = 320;
  const H = 270;
  const id = 'col';
  const out = open(W, H, 'Meridiano del lugar', id);
  out.push(marks(id), title(160, 'Meridiano del lugar'));
  const cx = 150;
  const cy = 148;
  const r = 92;
  const P = polar(cx, cy, r);
  const lon = Number(spec.lon ?? -40);
  const anti = lon > 0 ? lon - 180 : lon + 180;
  out.push(`<circle cx="${cx}" cy="${cy}" r="${r}" style="fill:var(--l-mar);stroke:${K.v}" stroke-width="2"/>`);
  for (let L = 0; L < 360; L += 30) { const [x, y] = P(L); out.push(line(cx, cy, x, y, K.g, 0.7, 'opacity=".6"')); }
  for (const k of [1 / 3, 2 / 3]) out.push(`<circle cx="${cx}" cy="${cy}" r="${fx(r * k)}" fill="none" style="stroke:${K.g}" stroke-width=".7" opacity=".6"/>`);
  // Greenwich y su antimeridiano
  out.push(line(cx, cy, ...P(0), K.p, 2.4), line(cx, cy, ...P(180), K.p, 2.4, 'stroke-dasharray="6 3"'));
  out.push(tag(cx, cy + r + 14, 'Greenwich 0°', 'p', 'middle', B), tag(cx, cy - r - 6, '180°', 'p', 'middle', B));
  out.push(tag(12, 50, 'hemisferio W', null, 'start', B), tag(W - 12, 50, 'hemisferio E', null, 'end', B));
  // meridiano del lugar: superior (por el observador) e inferior (a 180°)
  out.push(line(cx, cy, ...P(lon), K.r, 3.4), line(cx, cy, ...P(anti), K.r, 2.4, 'stroke-dasharray="6 4"'));
  const [ox, oy] = P(lon);
  out.push(`<circle cx="${fx(ox)}" cy="${fx(oy)}" r="5.5" style="fill:${K.r};stroke:var(--bg)" stroke-width="1.5"/>`);
  out.push(tag(ox + (lon < 0 ? -8 : 8), oy + 14, `tú (${fmtLon(lon)})`, 'r', lon < 0 ? 'end' : 'start', B));
  const [sx, sy] = P(lon, 0.55);
  out.push(tag(sx - 6, sy + 4, 'superior', 'r', 'end', B));
  const [ix, iy] = P(anti, 0.55);
  out.push(tag(ix + 6, iy + 4, 'inferior', 'r', 'start', B));
  out.push(`<circle cx="${cx}" cy="${cy}" r="3.5" fill="currentColor"/>`, tag(cx + 6, cy + 13, 'Polo N', null, 'start', B));
  out.push(tag(W - 8, H - 34, 'visto desde', null, 'end'), tag(W - 8, H - 22, 'encima del Polo N;', null, 'end'), tag(W - 8, H - 10, 'el borde es el ecuador', 'v', 'end'));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Cada observador tiene su meridiano del lugar. La mitad que pasa por él es el meridiano superior (el Sol lo cruza a mediodía); la opuesta, a 180° de longitud, el inferior (medianoche). Greenwich y el de 180° separan los hemisferios E y W.' };
}

function diferencias() {
  const W = 320;
  const H = 290;
  const id = 'cod';
  const out = open(W, H, 'Diferencia de latitud y de longitud', id);
  out.push(marks(id), title(160, 'Diferencias de latitud y longitud'));
  // ΔL en vista polar: de 100° W a 110° E
  const cx = 86;
  const cy = 136;
  const r = 66;
  const P = polar(cx, cy, r);
  out.push(tag(cx, 44, 'ΔL (visto desde el Polo N)', null, 'middle', B));
  out.push(`<circle cx="${cx}" cy="${cy}" r="${r}" style="fill:var(--l-mar);stroke:${K.v}" stroke-width="1.4"/>`);
  out.push(line(cx, cy, ...P(0), K.p, 1.8), line(cx, cy, ...P(180), K.p, 1.8, 'stroke-dasharray="5 3"'));
  out.push(tag(cx, cy + r + 13, '0°', 'p', 'middle', B), tag(cx, cy - r - 4, '180°', 'p', 'middle', B));
  const A = -100;
  const Bl = 110;
  out.push(line(cx, cy, ...P(A), 'currentColor', 1), line(cx, cy, ...P(Bl), 'currentColor', 1));
  // camino largo (210°, por Greenwich) y corto (150° hacia el W, por 180°)
  out.push(`<polyline points="${arcoPolar(cx, cy, r * 0.5, A, 210)}" fill="none" style="stroke:${K.g}" stroke-width="1.6" stroke-dasharray="4 3"/>`);
  out.push(`<polyline points="${arcoPolar(cx, cy, r * 0.78, A, -150)}" fill="none" style="stroke:${K.r}" stroke-width="3.4" marker-end="url(#${id}-kr)"/>`);
  const [ax, ay] = P(A);
  const [bx, by] = P(Bl);
  out.push(`<circle cx="${fx(ax)}" cy="${fx(ay)}" r="4.5" style="fill:currentColor"/><circle cx="${fx(bx)}" cy="${fx(by)}" r="4.5" style="fill:currentColor"/>`);
  out.push(tag(ax - 5, ay + 15, '100° W', null, 'start', B), tag(bx + 5, by + 15, '110° E', null, 'end', B));
  out.push(tag(cx, cy + 4, '210°', 'g', 'middle'));
  out.push(tag(cx, cy - r * 0.78 - 8 > 52 ? cy - r * 0.78 + 16 : cy - 30, '150° W', 'r', 'middle', B));
  // Δl sobre un meridiano: de 2° 10′ N a 1° 20′ S
  const x = 222;
  const ye = 140;
  const s = 26; // px por grado (exagerado)
  out.push(tag(250, 44, 'Δl (sobre el meridiano)', null, 'middle', B));
  out.push(line(x, 62, x, 214, 'currentColor', 1.4), line(x - 22, ye, x + 70, ye, K.v, 2.2));
  out.push(tag(x + 70, ye - 5, 'ecuador', 'v', 'end', B));
  const yA = ye - s * (2 + 10 / 60);
  const yB = ye + s * (1 + 20 / 60);
  out.push(arr(x - 10, yA, x - 10, yB, 'r', id, 3));
  out.push(`<circle cx="${x}" cy="${fx(yA)}" r="4.5" fill="currentColor"/><circle cx="${x}" cy="${fx(yB)}" r="4.5" fill="currentColor"/>`);
  out.push(tag(x + 8, yA + 4, '2° 10′ N', null, 'start', B), tag(x + 8, yB + 4, '1° 20′ S', null, 'start', B));
  out.push(tag(x + 8, (yA + ye) / 2 + 4, '+', 'r', 'start', B), tag(x + 8, (yB + ye) / 2 + 4, '+', 'r', 'start', B));
  out.push(tag(x - 20, ye + 34, '3° 30′ S', 'r', 'end', B));
  // cuentas
  out.push(line(14, 226, W - 14, 226, K.g, 0.8));
  out.push(tag(14, 242, 'Distinto nombre (N y S, E y W): se suman.', null, 'start', B));
  out.push(tag(14, 257, 'Δl = 2° 10′ + 1° 20′ = 3° 30′ S', 'r', 'start', B));
  out.push(tag(14, 272, 'ΔL = 100 + 110 = 210° → 360 − 210 = 150° W', 'r', 'start', B));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Mismo nombre, se restan; distinto nombre, se suman. Si la ΔL pasa de 180° se toma 360° − ΔL y se cambia el sentido: es el camino corto, cruzando el meridiano de 180°.' };
}

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
// Husos horarios. spec: { tipo:'husos', vista:'husos'|'calculo'|'oficial', ejemplo?:'e'|'w', lon?, tu? }

const EJEMPLOS_HUSO = { e: { lon: 69 + 25 / 60, tu: '10:30', txt: '069° 25′ E' }, w: { lon: -75, tu: '08:00', txt: '075° W' } };
const hm = (min) => { const m = ((min % 1440) + 1440) % 1440; const h = Math.floor(m / 60); const r = m - h * 60; const ent = Math.abs(r - Math.round(r)) < 0.05; return `${String(h).padStart(2, '0')}:${ent ? String(Math.round(r)).padStart(2, '0') : coma(r).padStart(4, '0')}`; };
const aMin = (s) => { const [h, m] = String(s).split(':').map(Number); return h * 60 + (m || 0); };
const lonTxt = (L) => { const a = Math.abs(L); const g = Math.floor(a + 1e-9); const m = Math.round((a - g) * 60); return `${String(g).padStart(3, '0')}°${m ? ` ${m}′` : ''} ${L >= 0 ? 'E' : 'W'}`; };

/** Franja de husos de −6 a +6 con su hora legal para un TU dado. */
function franja(out, id, y, tuMin, marca) {
  const x0 = 17;
  const w = 22;
  const n = 13;
  for (let i = 0; i < n; i++) {
    const h = i - 6;
    const x = x0 + i * w;
    const sel = marca && marca.huso === h;
    out.push(`<rect x="${x}" y="${y}" width="${w}" height="70" style="fill:${h === 0 || sel || !(i % 2) ? 'var(--l-mar)' : 'var(--bg)'};stroke:${sel ? K.r : h === 0 ? 'currentColor' : K.g}" stroke-width="${sel ? 2.4 : h === 0 ? 1.6 : 0.8}"/>`);
    if (h !== 0) out.push(line(x + w / 2, y + 2, x + w / 2, y + 26, K.g, 0.7, 'stroke-dasharray="2 2"'), line(x + w / 2, y + 48, x + w / 2, y + 68, K.g, 0.7, 'stroke-dasharray="2 2"'));
    out.push(`<text x="${x + w / 2}" y="${y + 42}" text-anchor="middle" font-size="10" font-weight="700" style="fill:${sel ? K.r : 'currentColor'}">${h === 0 ? '0' : `${Math.abs(h)}${h > 0 ? 'E' : 'W'}`}</text>`);
    out.push(`<text x="${x + w / 2}" y="${y + 86}" text-anchor="middle" font-size="9.5" ${sel || h === 0 ? B : ''} style="fill:${sel ? K.r : 'currentColor'}">${hm(tuMin + h * 60).slice(0, 2)}h</text>`);
  }
  // meridiano de Greenwich en el centro del huso 0
  const xg = x0 + 6 * w + w / 2;
  out.push(line(xg, y - 2, xg, y + 28, K.p, 2), line(xg, y + 47, xg, y + 72, K.p, 2));
  if (marca) {
    const xm = xg + (marca.lon / 15) * w;
    out.push(line(xm, y - 8, xm, y + 28, K.r, 2.6), line(xm, y + 47, xm, y + 70, K.r, 2.6), `<circle cx="${fx(xm)}" cy="${y - 8}" r="4" style="fill:${K.r}"/>`);
  }
  return { x0, w, xg };
}

export function husosIllustration(spec = {}) {
  const vista = spec.vista ?? 'husos';
  if (vista === 'oficial') return horaOficial();
  const id = 'hu';
  const W = 320;
  if (vista === 'husos') {
    const H = 250;
    const out = open(W, H, 'Husos horarios', id);
    out.push(marks(id), title(160, '24 husos de 15°: 1 h por huso'));
    const tu = spec.tu ?? '12:00';
    const y = 70;
    const { x0, w, xg } = franja(out, id, y, aMin(tu));
    out.push(tag(xg, y - 6, 'Greenwich', 'p', 'middle', B));
    out.push(tag(14, 44, 'huso 0: de 7° 30′ W a 7° 30′ E', null, 'start', B));
    out.push(tag(x0 - 2, y + 100, `hora legal cuando son las ${tu} TU`, null, 'start', 'font-size="9"'));
    out.push(arr(xg + 16, y + 118, W - 22, y + 118, 'r', id, 2.2), tag(W - 20, y + 134, 'hacia el E: + 1 h por huso', 'r', 'end', B));
    out.push(arr(xg - 16, y + 118, 22, y + 118, 'v', id, 2.2), tag(20, y + 150, 'hacia el W: − 1 h por huso', 'v', 'start', B));
    out.push(tag(14, H - 12, 'Hz = TU ± huso (E suma, W resta)', null, 'start', `${B} font-size="12"`));
    out.push('</svg>');
    return { svg: out.join(''), caption: 'La Tierra gira 360° en 24 h: 15° = 1 h. Cada huso abarca 15° y está centrado en un meridiano múltiplo de 15°; su hora legal es la civil de ese meridiano central, la misma en todo el huso. Hacia el E se adelanta y hacia el W se atrasa.' };
  }
  // cálculo con un ejemplo de la lección (o lon/tu propios)
  const ej = EJEMPLOS_HUSO[spec.ejemplo ?? 'e'] ?? EJEMPLOS_HUSO.e;
  const lon = spec.lon != null ? Number(spec.lon) : ej.lon;
  const tu = spec.tu ?? (spec.lon != null ? '12:00' : ej.tu);
  const tuMin = aMin(tu);
  const txt = spec.lon != null ? lonTxt(lon) : ej.txt;
  const q = Math.abs(lon) / 15;
  const huso = husoDe(lon);
  const lonMin = horaCivilLugar(0, lon); // 1° = 4 min
  const H = 270;
  const out = open(W, H, 'Hora legal y hora civil del lugar', id);
  out.push(marks(id), title(160, `TU ${tu} en ${txt}`));
  const y = 52;
  franja(out, id, y, tuMin, { lon, huso });
  const sg = lon >= 0 ? '+' : '−';
  const hus = huso === 0 ? 'huso 0' : `huso ${Math.abs(huso)} ${huso > 0 ? 'E' : 'W'}`;
  const hz = horaLegal(tuMin, lon);
  const hcl = tuMin + lonMin;
  const lt = Math.abs(lonMin);
  const ltTxt = `${Math.floor(lt / 60)} h${lt % 60 > 0.05 ? ` ${coma(lt % 60)} min` : ''}`.replace(',0 min', ' min');
  let yy = y + 112;
  out.push(tag(14, yy, `${coma(Math.abs(lon), 2)} / 15 = ${coma(q, 2)} → ${hus}`, null, 'start', B));
  yy += 22;
  out.push(tag(14, yy, 'Hora legal (del huso):', 'r', 'start', B));
  out.push(tag(14, yy + 15, `Hz = ${tu} ${sg} ${Math.abs(huso)} h = ${hm(hz)}`, 'r', 'start', `${B} font-size="12"`));
  yy += 40;
  out.push(tag(14, yy, 'Hora civil del lugar (su longitud en tiempo):', 'v', 'start', B));
  out.push(tag(14, yy + 15, `HcL = ${tu} ${sg} ${ltTxt} = ${hm(hcl)}`, 'v', 'start', `${B} font-size="12"`));
  const central = Math.abs(lon - huso * 15) < 1e-6;
  out.push(tag(14, H - 12, central ? 'Meridiano central: Hz y HcL coinciden.' : 'Fuera del meridiano central: Hz ≠ HcL.', null, 'start', 'font-size="10"'));
  out.push('</svg>');
  const cap = central
    ? `En ${txt}, ${Math.abs(lon)} / 15 = ${Math.round(q)}: ${hus}. Al W la hora va atrasada, así que con TU ${tu} la hora legal es ${hm(hz)}, igual a la civil del lugar porque ${txt} es el meridiano central del huso.`
    : `En ${txt}, ${coma(Math.abs(lon), 2)} / 15 = ${coma(q, 2)}: ${hus}. La hora legal es la del meridiano central del huso (${hm(hz)}); la civil del lugar usa la longitud exacta (${hm(hcl)}). Hacia el E se suma, hacia el W se resta.`;
  return { svg: out.join(''), caption: cap };
}

function horaOficial() {
  const W = 320;
  const H = 268;
  const out = open(W, H, 'Hora oficial en España', 'ho');
  out.push(title(160, 'Hora oficial en España'));
  const cols = [['', 14], ['huso', 134], ['invierno', 192], ['verano', 256]];
  const y0 = 50;
  out.push(...cols.slice(1).map(([t, x]) => lbl(x, y0, t, null, 'start', B)));
  const rows = [['Península y Baleares', 'huso 0', 'TU + 1', 'TU + 2'], ['Canarias', 'huso 1 W', 'TU', 'TU + 1']];
  rows.forEach((r, i) => {
    const y = y0 + 30 + i * 38;
    out.push(`<rect x="10" y="${y - 18}" width="${W - 20}" height="30" rx="6" style="fill:var(--l-mar)"/>`);
    if (i === 0) out.push(lbl(16, y - 4, 'Península', null, 'start', `${B} font-size="11"`), lbl(16, y + 8, 'y Baleares', null, 'start', `${B} font-size="11"`));
    else out.push(lbl(16, y + 1, r[0], null, 'start', `${B} font-size="11"`));
    out.push(lbl(134, y + 1, r[1], null, 'start', 'font-size="10"'), lbl(192, y + 1, r[2], K.v, 'start', `${B} font-size="12"`), lbl(256, y + 1, r[3], K.r, 'start', `${B} font-size="12"`));
  });
  out.push(lbl(14, 168, 'Verano: del último domingo de marzo', null, 'start'), lbl(14, 182, 'al último domingo de octubre (cambio a la 01:00 TU).', null, 'start'));
  out.push(`<line x1="14" y1="194" x2="${W - 14}" y2="194" style="stroke:${K.g}" stroke-width=".8"/>`);
  out.push(lbl(14, 212, 'Legal (Hz): la del huso, TU ± huso.', null, 'start', B));
  out.push(lbl(14, 228, 'Oficial (Ho): la fija el Gobierno.', null, 'start', B));
  out.push(lbl(14, 244, 'HRB: la fija el patrón. Puede coincidir', null, 'start', B), lbl(14, 258, 'con la legal o la oficial, pero no tiene por qué.', null, 'start', B));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Casi toda la península está en el huso 0 y Canarias en el 1 W, pero la hora oficial la fija el Gobierno: por eso la española no coincide con la legal ni siquiera en invierno.' };
}

// ---------------------------------------------------------------------------

export const LAMINAS = {
  coordenadas: {
    fn: coordenadasIllustration,
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
    fn: husosIllustration,
    params: { vista: ['husos', 'calculo', 'oficial'], ejemplo: ['e', 'w'], lon: 'opcional, longitud en grados (E +, W −)', tu: 'opcional, "HH:MM"' },
    ejemplo: { tipo: 'husos', vista: 'calculo', ejemplo: 'e' },
  },
};
