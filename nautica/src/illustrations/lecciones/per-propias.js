// Láminas propias para lecciones del PER que solo tenían una lámina genérica:
// per-2-3 (tenedero), per-2-4 (fondeo-gira), per-3-3 (capear-correr), per-6-1 (ripa-definiciones) y per-8-4 (varada-abordaje).
// Mismo estilo que seamanship.js y navigation.js: fondo il-panel, trazos con currentColor y superficies con las
// variables --l-* (y --land para tierra y fondo), para que se lean igual en los temas claro y oscuro.

import { C, open, title, lbl as kitLbl, arrow, hullPlan, fx as f } from '../kit.js';
import { capearCorrerC, ripaDefinicionesC, PARTES_CAPEAR, PARTES_RIPA } from '../per-cola-c.js';

// Los textos de color usan las variables del tema (más contraste en oscuro); el gris pasa a currentColor.
const TXT = { r: 'var(--l-r)', v: 'var(--l-v)', p: 'var(--l-p)', m: 'var(--l-m)', a: 'var(--l-a)', g: null };
const lbl = (x, y, t, c = null, anchor = 'start', extra = '') => kitLbl(x, y, t, c in TXT ? TXT[c] : c, anchor, extra);
const bold = (x, y, t, c = null, anchor = 'start') => lbl(x, y, t, c, anchor, 'font-weight="700"');

// ---------------------------------------------------------------------------
// Utilidades comunes

const sel = (r) => new Set(Array.isArray(r) ? r : r ? [r] : []);
/** Texto que, si su parte está resaltada, pasa a rojo y negrita (si ya era negrita, sigue siéndolo). */
const pt = (on, x, y, t, anchor = 'start', fuerte = false) => (on ? lbl(x, y, t, 'r', anchor, 'font-weight="700"') : fuerte ? bold(x, y, t, null, anchor) : lbl(x, y, t, null, anchor));
/** Número en un círculo; resaltado: borde rojo grueso. */
const badge = (x, y, n, on = false) => `<circle cx="${f(x)}" cy="${f(y)}" r="7.5" style="fill:var(--l-casco)" stroke="${on ? C.r : 'currentColor'}" stroke-width="${on ? 2.4 : 1}"/>` +
  `<text x="${f(x)}" y="${f(y + 3.6)}" class="il-lbl" text-anchor="middle" font-weight="700">${n}</text>`;
const marco = (x, y, w, h, on) => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="6" fill="none" stroke="${on ? C.r : 'currentColor'}" stroke-width="${on ? 2.2 : 1}" ${on ? '' : 'opacity=".3"'}/>`;
const clipRect = (id, x, y, w, h) => `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6"/></clipPath>`;
const sea = (x, y, w, h) => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" style="fill:var(--l-mar)"/>`;
const tierra = (d, extra = '') => `<path d="${d}" style="fill:var(--land);stroke:var(--land-stroke)" ${extra}/>`;
const surf = (x1, x2, y) => `<line x1="${f(x1)}" y1="${f(y)}" x2="${f(x2)}" y2="${f(y)}" style="stroke:var(--l-v)" stroke-width="1.4"/>`;
const casco = 'style="fill:var(--l-casco);stroke:currentColor;stroke-width:1.2"';
const linea = (x1, y1, x2, y2, extra = 'opacity=".3"') => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="currentColor" ${extra}/>`;
const cadena = (d, w = 2.6) => `<path d="${d}" fill="none" stroke="currentColor" stroke-width="${w}" stroke-dasharray="3 1.6"/>`;
const tache = (x, y, s = 9) => `<path d="M${f(x - s)},${f(y - s)} L${f(x + s)},${f(y + s)} M${f(x + s)},${f(y - s)} L${f(x - s)},${f(y + s)}" stroke="${C.r}" stroke-width="3" stroke-linecap="round"/>`;

/** Casco de perfil con la flotación en y; bow: 'left' (proa a la izquierda, se extiende a +x) o 'right'. */
function hullSide(xb, y, L, bow = 'left', extra = '') {
  const s = bow === 'left' ? '' : ' scale(-1 1)';
  return `<g transform="translate(${f(xb)} ${f(y)})${s}" ${extra}><path d="M0,-${f(L * 0.2)} L${f(L)},-${f(L * 0.17)} L${f(L - 3)},${f(L * 0.07)} Q${f(L * 0.45)},${f(L * 0.15)} ${f(L * 0.14)},${f(L * 0.05)} Z" ${casco}/>` +
    `<rect x="${f(L * 0.42)}" y="-${f(L * 0.31)}" width="${f(L * 0.3)}" height="${f(L * 0.12)}" rx="2" ${casco}/></g>`;
}
/** Casco en planta centrado en (cx, cy) y girado rot grados (0 = proa arriba). */
const hp = (cx, cy, rot, L, B, extra = '') => `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${rot})">${hullPlan(L, B, `style="fill:var(--l-casco);stroke:currentColor;stroke-width:1.3" ${extra}`)}</g>`;

/** Ancla pequeña: (x, y) es el arganeo; sin girar, la caña baja y la cruz queda abajo. */
function anchorG(x, y, s = 1, rot = 0, col = 'currentColor') {
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${rot}) scale(${s})" fill="none" stroke="${col}" stroke-width="${f(2.2 / Math.sqrt(s))}" stroke-linecap="round">` +
    `<circle cx="0" cy="-2.5" r="2.5"/><path d="M0,0 L0,21 M-10,11 Q-9,21 0,21 Q9,21 10,11"/>` +
    `<path d="M-10,8 L-13,15 L-7,14Z M10,8 L13,15 L7,14Z" fill="${col}"/></g>`;
}
/** Olas en planta: crestas paralelas horizontales entre x1 y x2. */
const crestas = (x1, x2, y, paso = 22, amp = 4) => {
  let d = `M${f(x1)},${f(y)}`;
  for (let x = x1; x < x2; x += paso) d += ` q${f(paso / 4)},${-amp} ${f(paso / 2)},0 t${f(paso / 2)},0`;
  return `<path d="${d}" fill="none" style="stroke:var(--l-v)" stroke-width="1.6" opacity=".8"/>`;
};

// ---------------------------------------------------------------------------
// Tenedero. spec: { tipo:'tenedero', vista:'elegir'|'fondos', resaltar? }

const FACTORES = [
  ['abrigo', 'Abrigo', 'viento y mar; ¿y si rola?'],
  ['profundidad', 'Profundidad', 'tu calado, en bajamar'],
  ['fondo', 'Tipo de fondo', 'el tenedero'],
  ['corriente', 'Corrientes', 'las de la zona'],
  ['espacio', 'Espacio', 'entrar, salir y bornear'],
  ['informacion', 'Carta y derrotero', 'prohibido, cables, canales'],
];
const FONDOS = ['arena', 'fango-duro', 'arcilla', 'cascajo', 'fango-blando', 'algas', 'piedra'];

function tenederoElegir(hl) {
  const W = 320;
  const H = 300;
  const out = open(W, H, 'Qué miras antes de fondear', 'te');
  out.push(title(160, 'Qué miras antes de fondear'));
  const on = (k) => hl.has(k);
  // mapa de la cala (de 10,32 a 310,190)
  out.push(clipRect('te-map', 10, 32, 300, 158), `<g clip-path="url(#te-map)">${sea(10, 32, 300, 158)}`);
  out.push(tierra('M0,0 L330,0 L330,200 L276,200 Q254,160 266,118 Q248,74 196,64 Q160,56 126,66 Q78,80 62,118 Q74,160 50,200 L0,200 Z'));
  // cable submarino (lo dice la carta)
  out.push(`<path d="M300,112 Q286,150 298,196" fill="none" stroke="${on('informacion') ? C.r : 'currentColor'}" stroke-width="${on('informacion') ? 2.2 : 1.4}" stroke-dasharray="7 3 2 3"/>`);
  out.push('</g>');
  out.push(`<rect x="10" y="32" width="300" height="158" rx="6" fill="none" stroke="currentColor" opacity=".3"/>`);
  // viento que viene de tierra: abrigo
  out.push(arrow(92, 40, 98, 78, 'g', 'te', 2.4), arrow(228, 40, 222, 74, 'g', 'te', 2.4));
  out.push(pt(on('abrigo'), 160, 46, 'viento de tierra', 'middle', true));
  // círculo de borneo y barco fondeado
  const [ax, ay, R] = [160, 110, 42];
  out.push(`<circle cx="${ax}" cy="${ay}" r="${R}" fill="none" stroke="${on('espacio') ? C.r : C.v}" stroke-width="${on('espacio') ? 2.6 : 1.8}" stroke-dasharray="6 4"/>`);
  out.push(cadena(`M${ax},${ay + 2} L${ax},${ay + 18}`, 2), anchorG(ax, ay - 4, 0.55), hp(ax, ay + 30, 0, 24, 9));
  // sondas (profundidad) y fondo
  const sond = on('profundidad') ? 'r' : null;
  out.push(lbl(106, 98, '3', sond, 'middle', 'font-style="italic"'), lbl(214, 98, '4', sond, 'middle', 'font-style="italic"'), lbl(118, 150, '5', sond, 'middle', 'font-style="italic"'), lbl(206, 154, '6', sond, 'middle', 'font-style="italic"'));
  out.push(pt(on('fondo'), 160, 176, 'arena', 'middle', true));
  // corriente
  out.push(arrow(70, 182, 120, 172, on('corriente') ? 'r' : 'a', 'te', on('corriente') ? 3 : 2.2));
  // números
  out.push(badge(160, 60, 1, on('abrigo')), badge(228, 100, 2, on('profundidad')), badge(128, 172, 3, on('fondo')));
  out.push(badge(60, 178, 4, on('corriente')), badge(206, 128, 5, on('espacio')), badge(282, 150, 6, on('informacion')));
  out.push(lbl(278, 178, 'cable', on('informacion') ? 'r' : null, 'end'));
  // leyenda
  FACTORES.forEach(([k, t, nota], i) => {
    const x = i % 2 ? 166 : 14;
    const y = 214 + Math.floor(i / 2) * 30;
    out.push(badge(x + 7, y - 4, i + 1, on(k)), pt(on(k), x + 19, y, t, 'start', true), lbl(x + 19, y + 12, nota));
  });
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Nunca se decide por un solo factor: abrigo del viento y de la mar (también si rola), agua suficiente para tu calado incluso en bajamar, buen tenedero, corrientes, espacio para entrar, salir y bornear, y lo que digan la carta y el derrotero.' };
}

/** Celda con un corte del fondo y cómo se porta el ancla en él. (cx, y0) es el centro de arriba; 92 × 40. */
function corteFondo(k, cx, y0) {
  const x0 = cx - 46;
  const yf = y0 + 18; // superficie del fondo
  const o = [clipRect(`tf-${k}`, x0, y0, 92, 40), `<g clip-path="url(#tf-${k})">`, sea(x0, y0, 92, 40)];
  const lecho = (extra = '') => `<rect x="${f(x0)}" y="${f(yf)}" width="92" height="${f(40 - 18)}" style="fill:var(--land)" ${extra}/>`;
  const capa = () => `<rect x="${f(x0)}" y="${f(yf)}" width="92" height="${f(40 - 18)}" style="fill:var(--land)" opacity=".6"/>`;
  const filo = `<line x1="${f(x0)}" y1="${f(yf)}" x2="${f(x0 + 92)}" y2="${f(yf)}" style="stroke:var(--land-stroke)" stroke-width="1.4"/>`;
  const chain = (ex, ey) => cadena(`M${f(x0 - 2)},${f(y0 + 4)} Q${f(ex - 14)},${f(ey - 2)} ${f(ex)},${f(ey)}`, 1.8);
  const dots = (n, r, dy0, alpha = '.5') => Array.from({ length: n }, (_, i) => `<circle cx="${f(x0 + 6 + ((i * 37) % 86))}" cy="${f(yf + dy0 + ((i * 7) % 15))}" r="${r}" fill="currentColor" opacity="${alpha}"/>`).join('');
  if (k === 'arena' || k === 'fango-duro') {
    // el ancla se entierra (la mitad de abajo, bajo el fondo)
    o.push(lecho(), k === 'arena' ? dots(14, 0.9, 4) : `<path d="M${x0},${yf + 8} h92 M${x0},${yf + 15} h92" stroke="currentColor" opacity=".3"/>`);
    o.push(chain(cx - 4, yf - 2), anchorG(cx - 4, yf - 2, 0.75, -62), capa(), filo);
  } else if (k === 'arcilla') {
    o.push(lecho(), `<path d="M${x0},${yf + 7} h92 M${x0},${yf + 13} h92" stroke="currentColor" opacity=".3"/>`, filo);
    o.push(chain(cx - 12, yf - 4), anchorG(cx - 12, yf - 4, 0.75, -66));
    o.push(`<ellipse cx="${f(cx + 1)}" cy="${f(yf - 3)}" rx="6" ry="3.5" style="fill:var(--land);stroke:var(--land-stroke)"/>`);
    o.push(arrow(cx + 12, yf - 8, cx + 34, yf - 8, 'g', 'tf', 1.6));
  } else if (k === 'cascajo') {
    o.push(lecho(), filo, Array.from({ length: 12 }, (_, i) => `<circle cx="${f(x0 + 4 + i * 8)}" cy="${f(yf - 1.5 + (i % 3))}" r="${2.2 + (i % 2)}" style="fill:var(--l-casco)" stroke="currentColor" stroke-width=".7"/>`).join(''), dots(8, 1.6, 5, '.35'));
    o.push(chain(cx - 6, yf - 9), anchorG(cx - 6, yf - 9, 0.75, -80));
  } else if (k === 'fango-blando') {
    // el ancla se hunde entera sin resistencia
    o.push(lecho('opacity=".55"'), chain(cx - 4, yf + 4), anchorG(cx - 4, yf + 4, 0.75, -20), `<rect x="${f(x0)}" y="${f(yf)}" width="92" height="22" style="fill:var(--land)" opacity=".5"/>`);
    o.push(`<path d="M${x0},${yf} q11,-2 23,0 t23,0 t23,0 t23,0" fill="none" style="stroke:var(--land-stroke)" stroke-width="1.4"/>`);
    o.push(arrow(cx + 22, yf + 2, cx + 22, yf + 18, 'g', 'tf', 1.6));
  } else if (k === 'algas') {
    o.push(lecho(), filo);
    for (let i = 0; i < 10; i += 1) {
      const x = x0 + 5 + i * 9.4;
      o.push(`<path d="M${f(x)},${f(yf)} q-3,-3 0,-6 t0,-6" fill="none" style="stroke:var(--l-verde)" stroke-width="1.6"/>`);
    }
    o.push(chain(cx - 6, yf - 14), anchorG(cx - 6, yf - 14, 0.75, -80));
  } else if (k === 'piedra') {
    o.push(lecho(), `<path d="M${x0},${yf + 1} q8,-12 18,-3 q6,-10 16,-2 q10,-12 20,-1 q6,-9 16,-1 q8,-10 22,1 L${x0 + 92},${yf + 22} L${x0},${yf + 22}Z" style="fill:var(--l-casco);stroke:currentColor" stroke-width="1"/>`);
    o.push(chain(cx - 10, yf - 10), anchorG(cx - 10, yf - 10, 0.75, -50));
  }
  o.push('</g>', `<rect x="${f(x0)}" y="${f(y0)}" width="92" height="40" rx="6" fill="none" stroke="currentColor" opacity=".35"/>`);
  return o.join('');
}

function tenederoFondos(hl) {
  const W = 320;
  const H = 312;
  const out = open(W, H, 'Los tenederos, de mejor a peor', 'tf');
  out.push(title(160, 'Los tenederos, de mejor a peor'));
  const filas = [
    ['✓ Buenos', 'el ancla se entierra y agarra', 'm', [['arena', 'arena compacta', 'se entierra'], ['fango-duro', 'fango duro', 'se entierra']]],
    ['≈ Regulares', 'agarra peor', 'a', [['arcilla', 'arcilla', 'dura: resbala, se pega'], ['cascajo', 'cascajo', 'se clava mal']]],
    ['✗ Malos', 'no agarra', 'r', [['fango-blando', 'fango blando', 'se hunde'], ['algas', 'algas', 'no llega al fondo'], ['piedra', 'piedra', 'puede enrocarse']]],
  ];
  filas.forEach(([cab, nota, col, celdas], i) => {
    const y = 46 + i * 90;
    out.push(bold(12, y, cab, col), lbl(18 + (cab.length * 7.2), y, `· ${nota}`));
    const xs = celdas.length === 2 ? [100, 220] : [56, 160, 264];
    celdas.forEach(([k, nombre, que], j) => {
      const cx = xs[j];
      const on = hl.has(k);
      out.push(corteFondo(k, cx, y + 8));
      if (on) out.push(`<rect x="${cx - 50}" y="${y + 4}" width="100" height="76" rx="7" fill="none" stroke="${C.r}" stroke-width="2.2"/>`);
      out.push(pt(on, cx, y + 61, nombre, 'middle', true), lbl(cx, y + 74, que, null, 'middle'));
    });
  });
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Buenos: arena compacta y fango duro. Regulares: arcilla (dura, resbala y se pega a las uñas) y cascajo. Malos: fango blando, algas y piedra. Ojo al adjetivo: fango duro es de los mejores y fango blando de los peores.' };
}

export function tenederoIllustration(spec = {}) {
  const hl = sel(spec.resaltar);
  return spec.vista === 'fondos' ? tenederoFondos(hl) : tenederoElegir(hl);
}

// ---------------------------------------------------------------------------
// Fondeo a la gira. spec: { tipo:'fondeo-gira', vista:'maniobra'|'cadena', resaltar? }

const PASOS_FONDEO = ['pendura', 'freno', 'proa', 'fondo', 'filar', 'agarra'];

function fondeoManiobra(hl) {
  const W = 320;
  const H = 326;
  const out = open(W, H, 'Fondeo a la gira, paso a paso', 'fm');
  out.push(title(160, 'Fondeo a la gira, paso a paso'));
  const pasos = [
    ['pendura', 'Ancla a la pendura', 'carta y parte vistos'],
    ['freno', 'Freno puesto', 'y desembragado'],
    ['proa', 'Proa al viento', 'despacio, con la sonda'],
    ['fondo', '«¡Fondo!»', 'el freno dosifica'],
    ['filar', 'Cae atrás: filar', 'la cadena se tiende'],
    ['agarra', 'Firme y comprobar', 'atrás suave: ¿agarra?'],
  ];
  pasos.forEach(([k, t, nota], i) => {
    const x0 = i % 2 ? 164 : 8;
    const y0 = 32 + Math.floor(i / 2) * 97;
    const on = hl.has(k);
    out.push(marco(x0, y0, 148, 92, on));
    // escena (148 × 48)
    const ys = y0 + 30; // flotación
    const yb = y0 + 54; // fondo
    const esc = [clipRect(`fm-c${i}`, x0 + 1, y0 + 1, 146, 58), `<g clip-path="url(#fm-c${i})">`];
    if (k !== 'freno' && k !== 'proa') {
      esc.push(sea(x0, ys, 148, yb - ys), tierra(`M${x0},${yb} L${x0 + 148},${yb} L${x0 + 148},${yb + 10} L${x0},${yb + 10}Z`), surf(x0, x0 + 148, ys));
    }
    if (k === 'pendura') {
      esc.push(hullSide(x0 + 50, ys, 64, 'left'), cadena(`M${x0 + 52},${ys - 9} L${x0 + 46},${ys - 1}`, 1.8), anchorG(x0 + 46, ys - 1, 0.55));
      esc.push(lbl(x0 + 58, ys + 16, 'cuelga, lista'));
    } else if (k === 'freno') {
      // molinete visto de frente: barbotén con freno apretado y embrague fuera
      const mx = x0 + 74;
      const my = y0 + 28;
      esc.push(`<line x1="${mx - 52}" y1="${my}" x2="${mx + 40}" y2="${my}" stroke="currentColor" stroke-width="3"/>`);
      esc.push(`<rect x="${mx - 12}" y="${my - 16}" width="24" height="32" rx="3" ${casco}/>`);
      for (let yy = my - 12; yy < my + 14; yy += 6) esc.push(`<rect x="${mx - 4}" y="${yy}" width="8" height="3" fill="currentColor"/>`);
      esc.push(`<path d="M${mx - 9},${my - 16} Q${mx},${my - 22} ${mx + 9},${my - 16}" fill="none" stroke="${C.r}" stroke-width="3"/>`);
      esc.push(`<rect x="${mx - 30}" y="${my - 8}" width="9" height="16" rx="2" style="fill:var(--l-casco)" stroke="currentColor" stroke-dasharray="2 2"/>`);
      esc.push(`<rect x="${mx + 22}" y="${my - 12}" width="24" height="24" rx="3" ${casco}/>`);
      esc.push(bold(mx + 14, y0 + 13, 'freno', 'r'), lbl(x0 + 6, my + 25, 'embrague fuera'));
    } else if (k === 'proa') {
      esc.push(sea(x0, y0, 148, 60), hp(x0 + 92, y0 + 34, 0, 34, 12));
      esc.push(arrow(x0 + 92, y0 + 2, x0 + 92, y0 + 10, 'g', 'fm', 2.2), arrow(x0 + 112, y0 + 2, x0 + 112, y0 + 10, 'g', 'fm', 2.2));
      esc.push(lbl(x0 + 74, y0 + 14, 'viento', null, 'end'), lbl(x0 + 74, y0 + 40, 'muy poca', null, 'end'), lbl(x0 + 74, y0 + 52, 'arrancada', null, 'end'));
    } else if (k === 'fondo') {
      esc.push(hullSide(x0 + 50, ys, 64, 'left'), cadena(`M${x0 + 52},${ys - 9} L${x0 + 44},${yb - 18}`, 1.8), anchorG(x0 + 44, yb - 18, 0.55));
      esc.push(arrow(x0 + 32, ys + 2, x0 + 32, ys + 16, 'g', 'fm', 1.8));
    } else if (k === 'filar') {
      esc.push(hullSide(x0 + 74, ys, 60, 'left'), cadena(`M${x0 + 76},${ys - 8} Q${x0 + 50},${yb - 2} ${x0 + 30},${yb - 1} L${x0 + 18},${yb - 1}`, 1.8), anchorG(x0 + 18, yb - 2, 0.5, 90));
      esc.push(arrow(x0 + 108, ys - 14, x0 + 140, ys - 14, 'g', 'fm', 1.8));
    } else if (k === 'agarra') {
      esc.push(hullSide(x0 + 78, ys, 60, 'left'), cadena(`M${x0 + 80},${ys - 8} Q${x0 + 56},${yb - 6} ${x0 + 30},${yb - 1} L${x0 + 18},${yb - 1}`, 2.4), anchorG(x0 + 18, yb - 2, 0.5, 90));
      esc.push(arrow(x0 + 138, ys + 6, x0 + 146, ys + 6, 'g', 'fm', 1.8));
    }
    esc.push('</g>');
    out.push(...esc);
    out.push(badge(x0 + 13, y0 + 70, i + 1, on), pt(on, x0 + 25, y0 + 74, t, 'start', true), lbl(x0 + 25, y0 + 86, nota));
  });
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Ancla a la pendura; en el molinete, freno puesto y desembragado; llegas despacio proa al viento o a la corriente; con el barco parado, «¡fondo!» y dosificas con el freno; filas mientras el barco cae atrás para que la cadena se tienda; haces firme y compruebas que agarra.' };
}

function fondeoCadena() {
  const W = 320;
  const H = 304;
  const out = open(W, H, 'Cuánta cadena filar y si agarra', 'fc');
  out.push(title(160, 'Cuánta cadena filar'));
  // perfil con la cadena tendida
  const ys = 56;
  const yb = 94;
  out.push(clipRect('fc-alto', 8, 30, 304, 82), `<g clip-path="url(#fc-alto)">${sea(8, ys, 304, yb - ys)}`, tierra(`M0,${yb} L320,${yb} L320,${yb + 18} L0,${yb + 18}Z`), '</g>', surf(8, 312, ys));
  out.push(hullSide(214, ys, 76, 'left'), cadena(`M216,${ys - 11} Q186,${yb - 4} 140,${yb - 1.5} L76,${yb - 1.5}`), anchorG(74, yb - 2, 0.75, 90));
  out.push(lbl(150, yb + 12, 'cadena tendida en el fondo', null, 'middle'));
  // cota de la profundidad
  const xd = 30;
  out.push(`<path d="M${xd - 4},${ys} h8 M${xd - 4},${yb} h8 M${xd},${ys} V${yb}" stroke="currentColor" stroke-width="1.3"/>`, bold(xd + 7, ys + 25, 'd'));
  // regla
  const u = 22;
  const x0 = 104;
  const barra = (y, n, col) => Array.from({ length: n }, (_, i) => `<rect x="${x0 + i * u}" y="${y - 9}" width="${u - 2}" height="10" rx="2" style="fill:${col}" stroke="currentColor" stroke-width=".8"/>`).join('');
  out.push(bold(12, 124, 'Buen tiempo'), barra(124, 3, 'var(--l-m)'), bold(x0 + 3 * u + 6, 124, '3 × d'));
  out.push(bold(12, 142, 'Mal tiempo'), barra(142, 5, 'var(--l-a)'), bold(x0 + 5 * u + 6, 142, '5 × d o más'));
  out.push(lbl(12, 160, 'd = profundidad con la sonda, contando la marea.'), lbl(12, 173, 'Con cabo en vez de cadena, hace falta más.'));
  out.push(linea(12, 182, 308, 182));
  // comprobar que agarra
  out.push(bold(12, 199, '¿Agarra? Da atrás suave'));
  const ys2 = 230;
  const yb2 = 258;
  out.push(clipRect('fc-b', 8, 204, 304, 62), `<g clip-path="url(#fc-b)">${sea(8, ys2, 304, yb2 - ys2)}`, tierra(`M0,${yb2} L320,${yb2} L320,280 L0,280Z`), '</g>', surf(8, 312, ys2));
  out.push(hullSide(196, ys2, 72, 'left'), `<path d="M198,${ys2 - 10} Q160,${yb2 - 8} 100,${yb2 - 1.5} L76,${yb2 - 1.5}" fill="none" stroke="currentColor" stroke-width="2.8"/>`, anchorG(74, yb2 - 2, 0.75, 90));
  out.push(arrow(272, ys2 - 6, 304, ys2 - 6, 'g', 'fc', 2.2), lbl(14, ys2 + 12, 'cadena tensa', null, 'start', 'font-weight="700"'));
  out.push(lbl(160, 280, 'Cadena tensa y barco quieto: agarra.', null, 'middle'), lbl(160, 293, 'Luego, referencias en tierra o alarma del GPS.', null, 'middle'));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Regla práctica, no norma: unas 3 veces la profundidad con buen tiempo y 5 o más con mal tiempo, para que la cadena quede tendida y el tiro llegue horizontal. Para comprobar que agarra, atrás suave: si la cadena se tensa y el barco se queda quieto, ha agarrado; toma referencias en tierra o pon la alarma de fondeo.' };
}

export function fondeoGiraIllustration(spec = {}) {
  return spec.vista === 'cadena' ? fondeoCadena() : fondeoManiobra(sel(spec.resaltar));
}

// ---------------------------------------------------------------------------
// Capear y correr. spec: { tipo:'capear-correr', vista:'rumbos'|'costa', resaltar? }

// ---------------------------------------------------------------------------
// Definiciones del RIPA. spec: { tipo:'ripa-definiciones', vista:'vela-motor'|'categorias', resaltar? }

/** Velero de perfil con proa a la izquierda; (x, y) es la flotación en la proa. */

// ---------------------------------------------------------------------------
// Varada y abordaje. spec: { tipo:'varada-abordaje', vista:'varada'|'abordaje', resaltar? }

function varada(hl) {
  const W = 320;
  const H = 300;
  const out = open(W, H, 'Varada: evaluar y reflotar', 'va');
  out.push(title(160, 'Varada: primero evaluar, luego reflotar'));
  const on = (k) => hl.has(k);
  const ys = 58;
  out.push(clipRect('va-mapa', 8, 30, 304, 96), `<g clip-path="url(#va-mapa)">${sea(8, ys, 304, 80)}`);
  out.push(tierra(`M0,${ys + 6} Q90,${ys + 8} 140,${ys + 16} T320,${ys + 62} L320,140 L0,140Z`));
  out.push('</g>', surf(8, 312, ys), `<rect x="8" y="30" width="304" height="96" rx="6" fill="none" stroke="currentColor" opacity=".3"/>`);
  // barco varado (proa a tierra, a la izquierda), escorado un poco
  out.push(`<g transform="rotate(-4 120 ${ys})">${hullSide(84, ys + 2, 80, 'left')}</g>`);
  // ancla llevada hacia aguas profundas, por donde llegó
  out.push(`<path d="M160,${ys - 8} Q220,${ys + 20} 268,${ys + 50}" fill="none" stroke="${on('ancla') ? C.r : 'currentColor'}" stroke-width="${on('ancla') ? 2.4 : 1.6}"/>`, anchorG(270, ys + 50, 0.55, -60, on('ancla') ? C.r : 'currentColor'));
  out.push(pt(on('ancla'), 306, ys + 20, 'ancla hacia', 'end'), pt(on('ancla'), 306, ys + 32, 'lo hondo', 'end'));
  // la marea que sube
  out.push(arrow(30, ys + 18, 30, ys - 14, on('pleamar') ? 'r' : 'v', 'va', 2.6), pt(on('pleamar'), 38, ys - 14, 'pleamar'));
  // sondas alrededor
  for (const [x, yy] of [[60, ys + 7], [186, ys + 22]]) out.push(`<line x1="${x}" y1="${ys}" x2="${x}" y2="${yy}" stroke="${on('sondar') ? C.r : 'currentColor'}" stroke-width="1.6" stroke-dasharray="2 2"/>`);
  out.push(pt(on('sondar'), 186, ys + 36, 'sondar', 'middle'));
  // pesos trasladados
  out.push(arrow(104, ys - 3, 140, ys - 5, on('pesos') ? 'r' : 'a', 'va', 2.2), pt(on('pesos'), 172, 44, 'pasar pesos', 'start'));
  // listas
  const y1 = 146;
  out.push(bold(12, y1, 'Primero, sin prisas'));
  [['heridos', '¿Hay heridos?'], ['danos', 'Daños: vías de agua'], ['sondar', 'Sondar alrededor'], ['marea', 'Marea: ¿sube o baja?']].forEach(([k, t], i) => {
    out.push(badge(20, y1 + 14 + i * 21, i + 1, on(k)), pt(on(k), 32, y1 + 18 + i * 21, t));
  });
  out.push(bold(166, y1, 'Para reflotar'));
  const ref = [['pleamar', 'aprovecha la pleamar'], ['pesos', 'pasa pesos y líquidos'], ['pesos', '  (rompe el efecto ventosa)'], ['ancla', 'ancla hacia lo hondo'], ['escorar', 'velero: escorarlo'], ['remolque', 'motor suave; o remolque']];
  ref.forEach(([k, t], i) => out.push(pt(on(k), t.startsWith(' ') ? 176 : 166, y1 + 16 + i * 14, (t.startsWith(' ') ? '' : '• ') + t.trim())));
  out.push(linea(12, 256, 308, 256));
  out.push(tache(22, 272, 6), bold(36, 276, 'Nada de atrás a toda al primer momento', 'r'));
  out.push(lbl(36, 290, 'ni abrir portillos: entraría más agua.'));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Tras embarrancar, nada brusco: mira si hay heridos, busca vías de agua, sonda alrededor y mira la marea. Para reflotar, aprovecha la pleamar, traslada pesos y trasvasa líquidos (rompe el efecto ventosa del fondo blando), lleva un ancla hacia aguas profundas y cobra; en un velero de quilla, escóralo; motor con suavidad, y si no sales, remolque.' };
}

function abordaje(hl) {
  const W = 320;
  const H = 296;
  const out = open(W, H, 'Abordaje: qué hacer', 'ab');
  out.push(title(160, 'Abordaje: antes de separar los barcos'));
  const on = (k) => hl.has(k);
  out.push(clipRect('ab-mapa', 8, 30, 304, 98), `<g clip-path="url(#ab-mapa)">${sea(8, 30, 304, 98)}`);
  for (let y = 44; y < 128; y += 22) out.push(crestas(0, 320, y, 26, 2.5));
  out.push('</g>');
  // barco abordado (de costado) y la proa del otro metida en su costado
  out.push(hp(118, 62, 90, 110, 30));
  out.push(hp(124, 102, 0, 46, 18));
  out.push(`<path d="M114,${77} l4,-4 l3,5 l4,-5 l3,4" fill="none" stroke="${C.r}" stroke-width="2"/>`);
  out.push(`<rect x="190" y="84" width="104" height="32" rx="4" class="il-panel" opacity=".9"/>`, lbl(196, 97, 'su proa tapona', 'r', 'start', 'font-weight="700"'), lbl(196, 110, 'la brecha', 'r', 'start', 'font-weight="700"'));
  out.push(arrow(190, 96, 140, 80, 'r', 'ab', 1.6));
  const pasos = [
    ['danos', 'Vías de agua y daños', ['sobre todo bajo la flotación']],
    ['separar', 'Antes de separar, acuérdalo con el otro patrón', ['estanqueidad, apuntalamientos y achique;', 'buen tiempo: sin prisa · mala mar: cuanto antes']],
    ['despues', 'Después', ['ayuda mutua, datos y seguro; Salvamento', 'Marítimo si hay peligro; diario de navegación']],
    ['parte', 'Parte a Capitanía Marítima', ['de inmediato; a declarar en 24 h hábiles', 'tras llegar a puerto']],
  ];
  let y = 146;
  pasos.forEach(([k, t, notas], i) => {
    out.push(badge(18, y - 4, i + 1, on(k)), pt(on(k), 31, y, t, 'start', true));
    notas.forEach((n, j) => out.push(lbl(31, y + 12 + j * 12, n)));
    y += 18 + notas.length * 12;
  });
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Lo primero, las vías de agua y los daños bajo la flotación: la proa de uno puede estar taponando la brecha del otro. Antes de separar, estanqueidad, apuntalamientos y achique, y acordarlo con el otro patrón; con buen tiempo sin prisa, con mala mar cuanto antes. Después, ayuda mutua, datos, aviso a Salvamento si hay peligro, y parte a Capitanía.' };
}

export function varadaAbordajeIllustration(spec = {}) {
  const hl = sel(spec.resaltar);
  return spec.vista === 'abordaje' ? abordaje(hl) : varada(hl);
}

// ---------------------------------------------------------------------------

export const LAMINAS = {
  tenedero: {
    fn: tenederoIllustration,
    params: { vista: ['elegir', 'fondos'], resaltar: [...FACTORES.map(([k]) => k), ...FONDOS] },
    ejemplo: { tipo: 'tenedero', vista: 'elegir' },
  },
  'fondeo-gira': {
    fn: fondeoGiraIllustration,
    params: { vista: ['maniobra', 'cadena'], resaltar: PASOS_FONDEO },
    ejemplo: { tipo: 'fondeo-gira', vista: 'maniobra' },
  },
  'capear-correr': {
    fn: capearCorrerC,
    params: { vista: ['rumbos', 'costa'], resaltar: PARTES_CAPEAR },
    ejemplo: { tipo: 'capear-correr', vista: 'rumbos' },
  },
  'ripa-definiciones': {
    fn: ripaDefinicionesC,
    params: { vista: ['vela-motor', 'categorias'], resaltar: PARTES_RIPA },
    ejemplo: { tipo: 'ripa-definiciones', vista: 'vela-motor' },
  },
  'varada-abordaje': {
    fn: varadaAbordajeIllustration,
    params: { vista: ['varada', 'abordaje'], resaltar: ['heridos', 'danos', 'sondar', 'marea', 'pleamar', 'pesos', 'ancla', 'escorar', 'remolque', 'separar', 'despues', 'parte'] },
    ejemplo: { tipo: 'varada-abordaje', vista: 'varada' },
  },
};
