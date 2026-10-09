// Láminas de legislación y preparación de la salida del PER rehechas en estilo C en la tanda de cierre
// (docs/ESTILO-LAMINAS.md). Mismos tipos, parámetros y `resaltar`; solo cambia el dibujo. Cada cifra, contra su norma
// (apéndice de la guía): RD 339/2021, Reglamento General de Costas (RD 876/2014, art. 73), MARPOL anexo V, RD 191/2026,
// RD 2335/1980, RD 186/2023, RD 607/1999, TRLPEMM (art. 310), SOLAS V/33. Sin DOM.

import { T, TXT, lienzo, rotulo, etiqueta, cota, flecha, referencia, paso, barco, tierra, f1 } from './estilo-c.js';
import { W, serif, mono, cap, linea, filete, panelNotas, marHasta, tacha, bien, punto, lista } from './kit-lecciones-c.js';

/** Resaltado: null si alguna parte no es válida (como antes, en estas láminas). Con `permisivo`, las ajenas se ignoran. */
function marca(spec, validas, { permisivo = false, conv = (x) => x } = {}) {
  const hl = new Set(lista(spec.resaltar).map(conv));
  if (!permisivo && validas && [...hl].some((k) => !validas.includes(k))) return null;
  const on = (k) => hl.has(k);
  return { hl, on, activo: hl.size > 0, c: (k, b = T.tinta) => (on(k) ? T.magenta : b), w: (k, b = 1, f = 2.2) => (on(k) ? f : b), g: (k) => `<g data-parte="${k}"${hl.size && !on(k) ? ' opacity=".45"' : ''}>`, texto: (cap, def) => (hl.size ? [...hl].map((k) => cap[k]).filter(Boolean).join(' ') || def : def) };
}
const centrado = (x, y, t, o = {}) => serif(x, y, t, { anchor: 'middle', ...o });
const lineas = (x, y, ls, o = {}, paso_ = 16) => ls.map((l, i) => serif(x, y + i * paso_, l, o)).join('');
/** Bandera de España (rojo, amarillo y rojo; la franja amarilla, la mitad). */
const espana = (x, y, w, h) => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${T.rojo}"/><rect x="${f1(x)}" y="${f1(y + h / 4)}" width="${f1(w)}" height="${f1(h / 2)}" fill="${T.amarillo}"/><rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="none" stroke="${T.tinta}" stroke-width=".7"/>`;
/** Otra bandera cualquiera (la autonómica, la del club): verde y blanca. */
const otra = (x, y, w, h) => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${T.blanco}"/><rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h / 3)}" fill="${T.verde}"/><rect x="${f1(x)}" y="${f1(y + (2 * h) / 3)}" width="${f1(w)}" height="${f1(h / 3)}" fill="${T.verde}"/><rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="none" stroke="${T.tinta}" stroke-width=".7"/>`;

// ===========================================================================
// Zonas de navegación (per-3-5): RD 339/2021, art. 3

const ZONAS = [[1, ['ilimitada'], null], [2, ['hasta 60 millas de la costa'], '60 M'], [3, ['hasta 25 millas de la costa'], '25 M'], [4, ['hasta 12 millas de la costa'], '12 M'], [5, ['a 5 millas o menos de un', 'abrigo o playa accesible'], '5 M*'], [6, ['a 2 millas o menos de un', 'abrigo o playa accesible'], '2 M*'], [7, ['aguas protegidas: puertos,', 'radas, rías, bahías abrigadas'], null]];

export function zonasC(spec = {}) {
  const hl = lista(spec.resaltar).map((z) => String(z).replace(/\D/g, ''));
  const H = 372;
  const alt = 'Las siete zonas de navegación en franjas, de la mar abierta (arriba) a la costa (abajo): zona 1, ilimitada; 2, hasta 60 millas de la costa; 3, hasta 25; 4, hasta 12; 5 y 6, sin alejarse más de 5 o 2 millas de un abrigo o playa accesible; 7, aguas protegidas. Las franjas no están a escala.';
  const { out, pt, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
  const [x0, x1, top, h] = [72, W - 14, 16, 36];
  ZONAS.forEach(([n, desc, lim], i) => {
    const y = top + i * h;
    const on = hl.includes(String(n));
    out.push(`<g data-parte="zona-${n}"><rect x="${x0}" y="${y}" width="${x1 - x0}" height="${h}" fill="${i % 2 ? T.agua : T.agua2}" stroke="${on ? T.magenta : 'none'}" stroke-width="${on ? 2.4 : 0}"/>`);
    out.push(rotulo(x0 + 10, y + 23, `Zona ${n}`, { size: TXT.min, estilo: 'cap', weight: 700, anchor: 'start', color: on ? T.magenta : T.tinta }));
    out.push(desc.length === 1 ? serif(x0 + 82, y + 23, desc[0], { size: TXT.min, weight: on ? 700 : 400 }) : lineas(x0 + 82, y + 16, desc, { size: TXT.min, weight: on ? 700 : 400 }, 14));
    if (lim) out.push(linea(x0 - 6, y, x1, y, { w: 1.4, extra: lim.endsWith('*') ? 'stroke-dasharray="5 3"' : '' }), mono(x0 - 9, y + 4, lim, { anchor: 'end', weight: 700 }));
    out.push('</g>');
  });
  out.push(flecha(30, top + 30, 30, top + 6, { color: T.apagado, w: 1.4 }), serif(24, top + 46, 'mar', { anchor: 'middle', size: TXT.min, italic: true, color: T.apagado }));
  const yc = top + 7 * h;
  out.push(tierra(`M5,${yc} L${W - 5},${yc} L${W - 5},${yc + 22} L5,${yc + 22}Z`, pt), rotulo(18, yc + 16, 'COSTA', { size: TXT.min, estilo: 'cap', weight: 700, anchor: 'start' }));
  out.push(panelNotas(yc + 26, H));
  out.push(linea(16, yc + 46, 40, yc + 46, { w: 1.4 }), serif(46, yc + 50, 'desde la costa', { size: TXT.min }), linea(170, yc + 46, 194, yc + 46, { w: 1.4, extra: 'stroke-dasharray="5 3"' }), serif(200, yc + 50, '* desde un abrigo o playa', { size: TXT.min }));
  out.push(serif(16, yc + 72, 'Franjas sin escala: todas del mismo alto.', { size: TXT.min, italic: true, color: T.apagado }));
  out.push(cierra());
  const sel = hl.length === 1 ? ZONAS.find(([n]) => String(n) === hl[0]) : null;
  return {
    svg: out.join(''),
    caption: sel ? `Zona ${sel[0]}: ${sel[1].join(' ')}. Cuanto menor es el número de zona, más lejos puedes ir y más equipo tienes que llevar.` : 'Zonas 2, 3 y 4: hasta 60, 25 y 12 millas de la costa. Zonas 5 y 6: sin alejarse más de 5 o 2 millas de un abrigo o playa accesible. La 1 es ilimitada y la 7 son aguas protegidas.',
  };
}

// ===========================================================================
// Chalecos, aros y balsas por zona (per-3-5): RD 339/2021, arts. 6, 7 y 8

export const EQUIPOS = ['chaleco', 'aro', 'balsa'];
const GRUPOS = [
  { zonas: [1], nombre: 'Zona 1', sub: 'ilimitada', celdas: [['275 N', 'con luz;', '+1 de más'], ['2 aros', 'uno con luz', 'y rabiza'], ['Sí', 'para todos']] },
  { zonas: [2, 3], nombre: 'Zonas 2 y 3', sub: '60 y 25 millas', celdas: [['150 N', 'con luz'], ['1 aro', 'con luz', 'y rabiza'], ['Sí', 'para todos']] },
  { zonas: [4], nombre: 'Zona 4', sub: '12 millas', celdas: [['150 N', 'con luz;', 'de día, sin'], ['1 aro', 'con luz', 'y rabiza'], ['No']] },
  { zonas: [5, 6, 7], nombre: 'Zonas 5 a 7', sub: 'costeras', celdas: [['100 N', 'con luz;', 'de día, sin'], ['No'], ['No']] },
];
const NOMBRE_EQ = { chaleco: 'Chalecos', aro: 'Aros', balsa: 'Balsa' };

function iconoEquipo(k, x, y) {
  if (k === 'chaleco') return `<path d="M${x - 9},${y - 11} L${x - 3},${y - 11} L${x},${y - 5} L${x + 3},${y - 11} L${x + 9},${y - 11} L${x + 11},${y + 11} L${x - 11},${y + 11} Z" fill="${T.naranja}" stroke="${T.tinta}" stroke-width="1.2"/>`;
  if (k === 'aro') return `<circle cx="${x}" cy="${y}" r="9" fill="none" stroke="${T.tinta}" stroke-width="7.6"/><circle cx="${x}" cy="${y}" r="9" fill="none" stroke="${T.naranja}" stroke-width="5.4"/><circle cx="${x}" cy="${y}" r="9" fill="none" stroke="${T.blanco}" stroke-width="5.4" stroke-dasharray="5 9.1"/>`;
  return `<path d="M${x - 16},${y + 6} Q${x - 16},${y + 12} ${x - 10},${y + 12} L${x + 10},${y + 12} Q${x + 16},${y + 12} ${x + 16},${y + 6} L${x + 16},${y + 3} L${x - 16},${y + 3} Z" fill="${T.naranja}" stroke="${T.tinta}" stroke-width="1.2"/><path d="M${x - 13},${y + 3} Q${x},${y - 18} ${x + 13},${y + 3} Z" fill="${T.naranja}" stroke="${T.tinta}" stroke-width="1.2"/>`;
}

export function dotacionZonasC(spec = {}) {
  const m = marca(spec, EQUIPOS);
  if (!m) return null;
  const zona = spec.zona == null ? null : Number(spec.zona);
  if (zona != null && !(Number.isInteger(zona) && zona >= 1 && zona <= 7)) return null;
  const xs = [12, 104, 188, 270, W - 12];
  const [yh, fila] = [78, 56];
  const H = yh + GRUPOS.length * fila + 74;
  const alt = 'Tabla del equipo por zona: chalecos (275 N en la zona 1, con uno de más; 150 N en las 2 a 4; 100 N en las 5 a 7; con luz, de la que se prescinde solo de día en las 4 a 7), aros (dos en la zona 1, uno con luz y rabiza; uno con luz y rabiza en las 2 a 4; ninguno en las 5 a 7) y balsa (para todos en las zonas 1 a 3).';
  const { out, cierra } = lienzo(W, H, alt);
  EQUIPOS.forEach((k, i) => {
    const cx = (xs[i + 1] + xs[i + 2]) / 2;
    out.push(`${m.g(k)}${iconoEquipo(k, cx, 34)}${centrado(cx, yh - 10, NOMBRE_EQ[k], { weight: 700, color: m.c(k) })}</g>`);
  });
  out.push(cap(xs[0] + 2, yh - 10, 'ZONA'));
  GRUPOS.forEach((g, r) => {
    const y = yh + r * fila;
    const zOn = zona != null && g.zonas.includes(zona);
    out.push(linea(xs[0], y, xs[4], y, { w: 0.6 }));
    out.push(serif(xs[0] + 2, y + 24, g.nombre, { weight: 700, color: zOn ? T.magenta : T.tinta }), serif(xs[0] + 2, y + 41, g.sub, { size: TXT.min, italic: true, color: T.apagado }));
    g.celdas.forEach((ls, i) => {
      const [x0, x1] = [xs[i + 1], xs[i + 2]];
      const cx = (x0 + x1) / 2;
      const no = ls[0] === 'No';
      if (!no) out.push(`<rect x="${x0 + 3}" y="${y + 4}" width="${x1 - x0 - 6}" height="${fila - 8}" fill="${T.agua2}"/>`);
      const y0 = y + fila / 2 - ((ls.length - 1) * 14) / 2 + 4;
      ls.forEach((t, j) => out.push(j === 0 ? rotulo(cx, y0, t, { size: TXT.min + 0.5, estilo: no ? 'serif' : 'mono', weight: 700, color: no ? T.apagado : T.tinta }) : centrado(cx, y0 + j * 14, t, { size: TXT.min })));
    });
    if (zOn) out.push(`<rect x="${xs[0] - 2}" y="${y + 1}" width="${xs[4] - xs[0] + 4}" height="${fila - 2}" fill="none" stroke="${T.magenta}" stroke-width="2.2"/>`);
  });
  const yb = yh + GRUPOS.length * fila;
  out.push(linea(xs[0], yb, xs[4], yb, { w: 0.6 }));
  EQUIPOS.forEach((k, i) => { if (m.on(k)) out.push(`<rect x="${xs[i + 1]}" y="12" width="${xs[i + 2] - xs[i + 1]}" height="${yb - 10}" fill="none" stroke="${T.magenta}" stroke-width="2.2"/>`); });
  out.push(panelNotas(yb + 6, H));
  ['Chalecos: uno por persona, también niños y bebés.', 'Aro: con suelta rápida, hacia las aletas o en popa.', 'Balsa: con zafa hidrostática, que la suelta sola.'].forEach((t, i) => out.push(serif(16, yb + 26 + i * 18, t, { size: TXT.min, weight: m.on(EQUIPOS[i]) ? 700 : 400 })));
  out.push(cierra());
  const caps = {
    chaleco: 'Chalecos: uno por persona con su luz (en zonas 4 a 7, si solo navegas de día, sin luz vale); 275 N en zona 1, con uno adicional, 150 N en zonas 2 a 4 y 100 N en zonas 5 a 7.',
    aro: 'Aros: en zonas 1 a 4, uno con luz y rabiza; en zona 1, además, otro sin luz ni rabiza. En zonas 5 a 7 no es obligatorio.',
    balsa: 'Balsa: obligatoria en zonas 1, 2 y 3, con capacidad para todas las personas a bordo.',
  };
  return { svg: out.join(''), caption: m.texto(caps, 'Cuanto menor es el número de zona, más equipo: chalecos de 275 N en zona 1, de 150 N en 2 a 4 y de 100 N en 5 a 7; aro con luz y rabiza en zonas 1 a 4 (dos en zona 1), y balsa para todos en zonas 1 a 3.') };
}

// ===========================================================================
// Zona de baño (per-4-2): Reglamento General de Costas, art. 73

const banista = (x, y) => `<circle cx="${x}" cy="${y}" r="3.2" fill="${T.naranja}" stroke="${T.tinta}" stroke-width=".6"/><path d="M${x - 7},${y + 5} q3.5,-3 7,0 q3.5,3 7,0" fill="none" stroke="${T.lineaAgua}" stroke-width="1.2"/>`;

export function playaC(spec = {}) {
  const caso = spec.caso === 'no-balizada' ? 'no-balizada' : 'balizada';
  const H = 330;
  const ys = 262;
  if (caso === 'balizada') {
    const alt = 'Playa con su zona de baño balizada por una línea de boyas amarillas: dentro está prohibido navegar, motos náuticas incluidas. Un canal de acceso señalizado, con una marca cónica verde a estribor y una cilíndrica roja a babor entrando hacia la playa, sirve para llegar a ella y salir, despacio. Un barco que viene de fuera no cruza la línea.';
    const { out, pt, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
    out.push(tierra(`M5,${ys} L${W - 5},${ys} L${W - 5},${H - 5} L5,${H - 5}Z`, pt), rotulo(W / 2, ys + 26, 'PLAYA', { size: TXT.min, estilo: 'cap', weight: 700 }));
    const [yb, cx1, cx2] = [120, 226, 268];
    out.push(`<rect x="5" y="${yb}" width="${cx1 - 5}" height="${ys - yb}" fill="${T.agua}"/><rect x="${cx2}" y="${yb}" width="${W - 5 - cx2}" height="${ys - yb}" fill="${T.agua}"/>`);
    out.push(linea(5, yb, cx1, yb, { color: T.amarillo, w: 1.4, extra: 'stroke-dasharray="3 3"' }), linea(cx2, yb, W - 5, yb, { color: T.amarillo, w: 1.4, extra: 'stroke-dasharray="3 3"' }));
    const amarilla = (x, y, r = 5.5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${T.amarillo}" stroke="${T.tinta}" stroke-width="1"/>`;
    for (let x = 18; x < cx1 - 6; x += 34) out.push(amarilla(x, yb));
    for (let x = 290; x < W - 8; x += 34) out.push(amarilla(x, yb));
    for (let y = yb + 28; y < ys - 6; y += 26) out.push(amarilla(cx1, y, 4), amarilla(cx2, y, 4));
    out.push(`<path d="M${cx1},${yb - 9} l8,14 h-16z" fill="${T.verde}" stroke="${T.tinta}"/>`, `<rect x="${cx2 - 6}" y="${yb - 7}" width="12" height="13" fill="${T.rojo}" stroke="${T.tinta}"/>`);
    out.push(serif(cx1 - 12, yb - 12, 'cónica verde', { anchor: 'end', weight: 700, color: T.verdeTxt, size: TXT.min }), serif(W - 12, yb - 26, 'cilíndrica roja', { anchor: 'end', weight: 700, color: T.rojoTxt, size: TXT.min }));
    out.push(barco((cx1 + cx2) / 2, 180, 180, 30, { p: null }), flecha((cx1 + cx2) / 2, 200, (cx1 + cx2) / 2, 228, { color: T.apagado, w: 1.4 }));
    out.push(serif(cx2 + 10, 158, 'canal de', { weight: 700, size: TXT.min }), serif(cx2 + 10, 174, 'acceso:', { weight: 700, size: TXT.min }), serif(cx2 + 10, 190, 'despacio', { size: TXT.min }));
    out.push(centrado(112, 156, 'ZONA DE BAÑO', { weight: 700 }), centrado(112, 174, 'prohibido navegar', { weight: 700, color: T.magenta }), centrado(112, 191, '(también motos náuticas)', { size: TXT.min, italic: true }));
    for (const [x, y] of [[44, 230], [92, 242], [142, 226], [190, 240], [316, 238]]) out.push(banista(x, y));
    out.push(barco(70, 58, 90, 30, { p: null }), linea(90, 60, 118, 82, { color: T.magenta, w: 1.6, extra: 'stroke-dasharray="3 3"' }), tacha(122, 86, 6));
    out.push(serif(136, 56, 'no se cruza la línea', { weight: 700, color: T.magenta, size: TXT.min }), serif(136, 72, 'de boyas amarillas', { weight: 700, color: T.magenta, size: TXT.min }));
    out.push(serif(12, yb - 12, 'esféricas amarillas', { size: TXT.min, italic: true }));
    out.push(cierra());
    return { svg: out.join(''), caption: 'Dentro de una zona de baño balizada está prohibida la navegación de recreo, motos náuticas incluidas, vaya a la velocidad que vaya. Para llegar a la playa o salir de ella se usan los canales de acceso señalizados (entrando, la cónica verde queda a estribor y la cilíndrica roja a babor), despacio.' };
  }
  const alt = 'Costa sin balizar: junto a la playa se entiende que la zona de baño ocupa 200 m desde la orilla y junto al resto de la costa (rocas), 50 m. Dentro se puede navegar, pero a 3 nudos como máximo y sin ningún vertido. Las dos distancias están a escala entre sí.';
  const { out, pt, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
  const xr = 210;
  const k = 0.7; // px por metro
  const [y200, y50] = [ys - 200 * k, ys - 50 * k];
  out.push(`<path d="M5,${f1(y200)} H${xr} V${f1(y50)} H${W - 5} V${ys} H5Z" fill="${T.agua}"/>`, `<path d="M5,${f1(y200)} H${xr} V${f1(y50)} H${W - 5}" fill="none" stroke="${T.magenta}" stroke-width="1.6" stroke-dasharray="6 4"/>`);
  out.push(tierra(`M5,${ys} L${xr},${ys} L${xr},${H - 5} L5,${H - 5}Z`, pt), rotulo(xr / 2, ys + 26, 'PLAYA', { size: TXT.min, estilo: 'cap', weight: 700 }));
  out.push(`<path d="M${xr},${ys} L${xr + 10},${ys - 5} L${xr + 28},${ys - 1} L${xr + 46},${ys - 7} L${xr + 70},${ys - 2} L${xr + 96},${ys - 8} L${xr + 120},${ys - 3} L${W - 5},${ys - 6} L${W - 5},${H - 5} L${xr},${H - 5}Z" fill="${T.negro}" stroke="${T.tinta}"/>`, rotulo((xr + W) / 2, ys + 26, 'ROCAS', { size: TXT.min, estilo: 'cap', weight: 700, color: T.papel }));
  out.push(cota(22, y200, 22, ys, ''), mono(30, (y200 + ys) / 2, '200 m', { anchor: 'start', weight: 700 }), cota(W - 22, y50, W - 22, ys - 6, ''), mono(W - 30, y50 + 22, '50 m', { anchor: 'end', weight: 700 }));
  out.push(centrado(124, y200 + 32, 'zona de baño', { weight: 700 }), centrado(124, y200 + 50, 'aunque no haya boyas:', { size: TXT.min }), centrado(124, y200 + 66, 'se navega, pero', { size: TXT.min }), etiqueta(124, y200 + 88, 'máx. 3 nudos', { color: T.magenta }), centrado(124, y200 + 112, 'y ningún vertido', { weight: 700, color: T.magenta, size: TXT.min }));
  for (const [x, y] of [[60, 246], [104, 252], [150, 244]]) out.push(banista(x, y));
  out.push(centrado(282, 64, 'fuera de la franja', { size: TXT.min, italic: true }), centrado(282, y50 - 10, 'resto de costa', { size: TXT.min, italic: true }));
  out.push(serif(14, 26, 'Distancias desde la orilla, a escala entre sí.', { size: TXT.min, italic: true, color: T.apagado }));
  out.push(cierra());
  return { svg: out.join(''), caption: 'Si la costa no está balizada, se entiende que hay zona de baño en los 200 m junto a las playas y en los 50 m junto al resto de la costa. Dentro se puede navegar, pero a 3 nudos como máximo, con precaución y sin ningún vertido.' };
}

/** Dibujo de la interactiva «playa sin balizar» (interactivas/per-basicas.js): la franja que toca y tu barco a su distancia. */
export function playaDistanciaC(e, r, { pendiente = false } = {}) {
  const H = 346;
  const Y0 = 300;
  const K = 0.8; // px por metro
  const alt = `${e.costa === 'playa' ? 'Playa' : 'Costa'} sin balizar con un barco a ${e.dist} m de la orilla${pendiente ? '' : `: la franja de ${r.limite} m ${r.dentro ? 'lo incluye, así que va a 3 nudos como máximo' : 'queda por dentro de él'}`}.`;
  const { out, pt, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
  out.push(`<g data-parte="orilla">${e.costa === 'playa' ? tierra(`M5,${Y0} L${W - 5},${Y0} L${W - 5},${H - 5} L5,${H - 5}Z`, pt) : `<path d="M5,${Y0} L40,${Y0 - 6} L80,${Y0 - 1} L130,${Y0 - 8} L190,${Y0 - 2} L250,${Y0 - 7} L${W - 5},${Y0 - 3} L${W - 5},${H - 5} L5,${H - 5}Z" fill="${T.negro}" stroke="${T.tinta}"/>`}${rotulo(W / 2, Y0 + 28, e.costa === 'playa' ? 'PLAYA' : 'ROCAS, ACANTILADO', { size: TXT.min, estilo: 'cap', weight: 700, color: e.costa === 'playa' ? T.tinta : T.papel })}</g>`);
  const yl = Y0 - r.limite * K;
  if (!pendiente) out.push(`<rect data-parte="franja" x="5" y="${f1(yl)}" width="${W - 10}" height="${f1(Y0 - yl)}" fill="${T.agua}"/>`);
  out.push(linea(5, yl, W - 5, yl, { color: T.magenta, w: 1.6, extra: 'stroke-dasharray="7 5"' }), mono(W - 12, yl - 8, `${r.limite} m`, { anchor: 'end', weight: 700, color: T.magenta }));
  const yb = Y0 - e.dist * K;
  out.push(barco(130, yb, 90, 46, { p: 'barco' }), cota(80, yb, 80, Y0, ''), mono(72, (yb + Y0) / 2 + 4, `${e.dist} m`, { anchor: 'end', weight: 700 }));
  if (!pendiente) out.push(rotulo(W / 2, 28, r.dentro ? 'Zona de baño: máximo 3 nudos' : 'Fuera de la zona de baño', { size: TXT.nota, estilo: 'serif', weight: 700, italic: true, color: r.dentro ? T.magenta : T.tinta }));
  out.push(cierra());
  return out.join('');
}

// ===========================================================================
// Vertidos: aguas sucias (RD 339/2021, art. 23) y basuras (MARPOL, anexo V)

const VERTIDOS = {
  'aguas-sucias': {
    cols: ['zona 7', '0 – 3 M', '3 – 12 M', '+ 12 M'],
    ticks: ['línea de base', '3 M', '12 M'],
    filas: [['Sin desmenuzar ni desinfectar', 3, 'a más de 12 M'], ['Desmenuzadas y desinfectadas', 2, 'a más de 3 M'], ['Instalación de tratamiento', 1, 'fuera de la zona 7']],
    notas: ['Zona 7 (puertos, rías, bahías): nada al mar;', 'al tanque y a la instalación del puerto.', 'Tanque: poco a poco, en ruta, a 4 nudos o más.'],
    alt: 'Escalera de distancias para descargar aguas sucias, desde la línea de base: sin desmenuzar ni desinfectar, a más de 12 millas; desmenuzadas y desinfectadas, a más de 3; con instalación de tratamiento homologada, fuera de la zona 7. En la zona 7, nada.',
    caption: 'Las distancias se cuentan desde la línea de base (la tierra más próxima). Sin tratar, a más de 12 millas; desmenuzadas y desinfectadas, a más de 3; con instalación de tratamiento homologada, fuera de la zona 7. El tanque se vacía poco a poco, en ruta y a 4 nudos como mínimo.',
  },
  basuras: {
    cols: ['0 – 3 M', '3 – 12 M', '+ 12 M'],
    ticks: ['tierra', '3 M', '12 M'],
    filas: [['Plásticos y aceite de cocina', null, 'nunca, en ninguna parte'], ['Papel, vidrio, latas, envases', null, 'nunca: al puerto'], ['Fuera de zona especial: comida triturada', 1, 'a más de 3 M'], ['Fuera de zona especial: sin triturar', 2, 'a más de 12 M'], ['Mediterráneo: comida triturada', 2, 'a más de 12 M'], ['Mediterráneo: sin triturar', null, 'nunca: al puerto']],
    notas: ['Triturada: por una criba de 25 mm. Siempre en ruta,', 'sin bolsas. Mezclada: manda la regla más dura.', 'Mediterráneo (zona especial): al E de 5° 36′ W.'],
    alt: 'Tabla de las basuras (MARPOL, anexo V): plásticos, aceite de cocina, papel, vidrio, latas y envases, nunca al mar; la comida, fuera de zonas especiales, triturada a más de 3 millas y sin triturar a más de 12; en el Mediterráneo, zona especial, solo triturada y a más de 12 millas.',
    caption: 'Plásticos y aceite de cocina, nunca. Los restos de comida, fuera de zonas especiales, triturados a más de 3 millas y sin triturar a más de 12; en el Mediterráneo, solo triturados y a más de 12 millas. Siempre en ruta.',
  },
};

export function vertidosC(spec = {}) {
  const tema = spec.tema === 'basuras' ? 'basuras' : 'aguas-sucias';
  const V = VERTIDOS[tema];
  const [xa, xb] = [14, W - 14];
  const anchos = tema === 'basuras' ? [94, 100, 136] : [58, 72, 80, 120];
  const xs = [xa];
  for (const a of anchos) xs.push(xs.at(-1) + a);
  const [fila, y0] = [40, 70];
  const H = y0 + V.filas.length * fila + V.notas.length * 17 + 40;
  const { out, cierra } = lienzo(W, H, V.alt);
  const off = tema === 'basuras' ? 0 : 1;
  if (off) out.push(`<rect x="${xa}" y="16" width="${anchos[0]}" height="20" fill="${T.agua2}"/>`);
  out.push(`<rect x="${xs[off]}" y="16" width="${xb - xs[off]}" height="20" fill="${T.agua}"/>`);
  V.ticks.forEach((t, i) => { const x = xs[i + off]; out.push(linea(x, 12, x, 40, { w: 1, extra: 'stroke-dasharray="2 2"' }), serif(Math.max(x, xa + 2), 54, t, { anchor: i === 0 && off === 0 ? 'start' : 'middle', size: TXT.min, italic: true, color: T.apagado })); });
  V.cols.forEach((c, i) => out.push(mono((xs[i] + xs[i + 1]) / 2, 31, c, { weight: 700 })));
  V.filas.forEach(([nombre, desde, txt], i) => {
    const y = y0 + i * fila;
    out.push(serif(xa, y + 12, nombre, { size: TXT.min, weight: 700 }));
    const yb = y + 17;
    const fin = desde == null ? xb : xs[desde];
    out.push(`<rect x="${xa}" y="${yb}" width="${f1(fin - xa)}" height="18" fill="${T.papel}" stroke="${T.magenta}" stroke-width=".8" stroke-dasharray="3 2"/>`);
    if (desde == null) out.push(tacha(xa + 12, yb + 9, 4.5), serif(xa + 24, yb + 14, txt, { size: TXT.min, weight: 700, color: T.magenta }));
    else {
      out.push(`<rect x="${f1(fin)}" y="${yb}" width="${f1(xb - fin)}" height="18" fill="${T.agua}" stroke="${T.verdeTxt}" stroke-width=".8"/>`);
      out.push(tacha((xa + fin) / 2, yb + 9, 4.5), bien(fin + 12, yb + 9, 5), serif(fin + 22, yb + 14, txt, { size: TXT.min, weight: 700, color: T.verdeTxt }));
    }
  });
  const yn = y0 + V.filas.length * fila + 4;
  out.push(panelNotas(yn, H));
  V.notas.forEach((n, i) => out.push(serif(16, yn + 20 + i * 17, n, { size: TXT.min })));
  out.push(serif(16, yn + 20 + V.notas.length * 17 + 2, 'Columnas sin escala.', { size: TXT.min, italic: true, color: T.apagado }));
  out.push(cierra());
  return { svg: out.join(''), caption: V.caption };
}

// ===========================================================================
// Tanque de retención (per-4-4): RD 339/2021, arts. 22 y 23

export const PARTES_TQ = ['inodoro', 'tanque', 'conexion', 'valvula', 'bomba'];
const CAP_TQ = {
  inodoro: 'Si llevas inodoro, necesitas tanque de retención, instalación de tratamiento o sistema para desmenuzar y desinfectar.',
  tanque: 'El tanque de retención guarda las aguas sucias; su capacidad depende de la duración de la navegación y de las personas a bordo.',
  conexion: 'El tanque fijo lleva conexión universal a tierra para vaciarlo en puerto.',
  valvula: 'Los pasacascos de descarga al mar llevan válvulas que se pueden cerrar y precintar.',
  bomba: 'En puerto, el tanque se vacía en la instalación del puerto.',
};

function tanquePuerto(m) {
  const H = 330;
  const alt = 'Corte de un barco atracado: el inodoro descarga a un tanque de retención; del tanque sale una conexión universal en cubierta, unida por una manguera a la bomba del puerto, y un pasacascos al mar con la válvula cerrada y precintada.';
  const { out, cierra } = lienzo(W, H, alt);
  out.push(`<rect x="5" y="150" width="256" height="76" fill="${T.agua}"/>`, `<rect x="262" y="118" width="${W - 267}" height="108" fill="${T.tierra}" stroke="${T.tinta}"/>`, centrado(306, 214, 'muelle', { weight: 700, size: TXT.min }));
  out.push(`<path d="M16,114 L250,114 L234,190 L36,190 L18,146 Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.4"/>`, `<path d="M32,126 L236,126 L224,178 L44,178 L32,148 Z" fill="${T.papel}" stroke="${T.tinta}" stroke-width=".8"/>`);
  out.push(`${m.g('inodoro')}<path d="M54,144 H80 Q80,164 70,166 L70,176 H62 L62,166 Q54,164 54,144 Z" fill="${T.blanco}" stroke="${m.c('inodoro')}" stroke-width="${m.w('inodoro', 1.2, 2.4)}"/><rect x="50" y="130" width="8" height="14" fill="${T.blanco}" stroke="${T.tinta}"/>${serif(86, 140, 'inodoro', { size: TXT.min, weight: m.on('inodoro') ? 700 : 400, color: m.c('inodoro') })}</g>`);
  out.push(`<path d="M66,176 V172 H112" fill="none" stroke="${T.tinta}" stroke-width="3"/>`);
  out.push(`${m.g('tanque')}<rect x="112" y="142" width="66" height="34" rx="3" fill="${T.amarillo}" fill-opacity=".45" stroke="${m.c('tanque')}" stroke-width="${m.w('tanque', 1.4, 2.6)}"/>${centrado(145, 164, 'tanque', { weight: 700, size: TXT.min, color: m.c('tanque') })}</g>`);
  out.push(`${m.g('valvula')}<path d="M130,176 V194" stroke="${T.tinta}" stroke-width="3"/><path d="M123,180 L137,188 L137,180 L123,188 Z" fill="${m.c('valvula', T.apagado)}" stroke="${T.tinta}"/>${linea(130, 194, 130, 202, { w: 0.8 })}${serif(14, 216, 'válvula al mar: cerrada y precintada', { size: TXT.min, weight: 700, color: m.c('valvula') })}</g>`);
  out.push(`${m.g('conexion')}<path d="M164,142 V112" stroke="${T.tinta}" stroke-width="3"/><rect x="157" y="104" width="14" height="8" rx="2" fill="${m.c('conexion', T.apagado)}" stroke="${T.tinta}"/>${centrado(150, 58, 'conexión universal', { size: TXT.min, weight: 700, color: m.c('conexion') })}${centrado(150, 74, 'a tierra', { size: TXT.min, color: m.c('conexion') })}</g>`);
  out.push(`<path d="M164,104 C164,80 250,78 284,96" fill="none" stroke="${T.tinta}" stroke-width="5"/><path d="M164,104 C164,80 250,78 284,96" fill="none" stroke="${T.verde}" stroke-width="3"/>`, flecha(214, 84, 246, 86, { color: T.verdeTxt, w: 1.6 }));
  out.push(`${m.g('bomba')}<rect x="280" y="92" width="44" height="26" rx="3" fill="${T.verde}" fill-opacity=".35" stroke="${m.c('bomba')}" stroke-width="${m.w('bomba', 1.4, 2.6)}"/>${centrado(302, 140, 'bomba', { size: TXT.min, weight: 700, color: m.c('bomba') })}${centrado(302, 156, 'del puerto', { size: TXT.min, color: m.c('bomba') })}</g>`);
  out.push(panelNotas(244, H), serif(16, 266, 'En puertos, dársenas y aguas protegidas (zona 7):', { weight: 700, size: TXT.min }), serif(16, 284, 'nada al mar; el tanque se vacía en el puerto.', { weight: 700, size: TXT.min }), serif(16, 308, 'Las reglas del artículo 22 no son para los de marcado CE.', { size: TXT.min, italic: true }));
  out.push(cierra());
  return out.join('');
}

function tanqueMar() {
  const H = 330;
  const alt = 'Arriba, un barco en ruta a 4 nudos o más vaciando el tanque poco a poco, nunca parado ni fondeado. Abajo, desde la línea de base: las aguas sucias desmenuzadas y desinfectadas, a más de 3 millas; sin desmenuzar ni desinfectar, a más de 12.';
  const { out, cierra } = lienzo(W, H, alt);
  out.push(`<rect x="5" y="70" width="${W - 10}" height="60" fill="${T.agua}"/>`, `<path d="M24,96 Q74,90 124,94 M34,108 Q84,110 124,104" fill="none" stroke="${T.blanco}" stroke-width="1.6"/>`);
  out.push(barco(166, 100, 90, 84, { p: null }));
  for (const [x, y] of [[118, 106], [104, 109], [90, 110], [76, 110]]) out.push(punto(x, y, { r: 1.8, color: T.naranja }));
  out.push(flecha(214, 100, 300, 100, { color: T.azul, w: 2 }), serif(W - 14, 60, 'en ruta, a 4 nudos o más', { anchor: 'end', weight: 700, color: T.azulTxt, size: TXT.min }), serif(14, 60, 'poco a poco', { weight: 700, size: TXT.min }));
  out.push(tacha(22, 152, 5), serif(34, 157, 'Nunca de golpe, parado ni fondeado.', { weight: 700, color: T.magenta, size: TXT.min }));
  const [x0, x3, x12, xe, ye] = [14, 136, 246, W - 14, 196];
  for (const [x, t] of [[x0, 'línea de base'], [x3, '3 M'], [x12, '12 M']]) out.push(linea(x, ye - 8, x, ye + 2, { w: 1 }), serif(x, ye - 14, t, { anchor: x === x0 ? 'start' : 'middle', size: TXT.min, weight: 700 }));
  const barra = (y, desde, t1, t2) => {
    out.push(serif(14, y - 6, t1, { size: TXT.min, weight: 700 }), mono(W - 14, y - 6, t2, { anchor: 'end', weight: 700, color: T.verdeTxt }));
    out.push(`<rect x="${x0}" y="${y}" width="${desde - x0}" height="18" fill="${T.papel}" stroke="${T.magenta}" stroke-width=".8" stroke-dasharray="3 2"/><rect x="${desde}" y="${y}" width="${xe - desde}" height="18" fill="${T.agua}" stroke="${T.verdeTxt}" stroke-width=".8"/>`, tacha((x0 + desde) / 2, y + 9, 4.5), bien((desde + xe) / 2, y + 9, 5));
  };
  barra(ye + 28, x3, 'Desmenuzadas y desinfectadas', '> 3 M');
  barra(ye + 78, x12, 'Sin desmenuzar ni desinfectar', '> 12 M');
  out.push(cierra());
  return out.join('');
}

export function tanqueRetencionC(spec = {}) {
  const v = spec.vista ?? 'puerto';
  if (v === 'puerto') {
    const m = marca(spec, PARTES_TQ);
    if (!m) return null;
    return { svg: tanquePuerto(m), caption: m.texto(CAP_TQ, 'Si llevas inodoro, las aguas sucias van a un tanque de retención (o a un sistema homologado de tratamiento, o de desmenuzar y desinfectar). El tanque fijo tiene conexión universal a tierra para vaciarlo en la instalación del puerto, y la válvula de descarga al mar se puede cerrar y precintar.') };
  }
  if (v === 'mar') {
    if (lista(spec.resaltar).length) return null;
    return { svg: tanqueMar(), caption: 'El tanque se vacía a régimen moderado, en ruta y a 4 nudos como mínimo, nunca parado ni fondeado. Desde la línea de base: desmenuzadas y desinfectadas, a más de 3 millas; sin desmenuzar ni desinfectar, a más de 12.' };
  }
  return null;
}

// ===========================================================================
// Basuras a un lado y otro del Estrecho (per-4-5): MARPOL, anexo V (zona especial del Mediterráneo: al E de 5° 36′ W)

const FILAS_BAS = [
  [['Plásticos y', 'aceite de cocina'], [false, 'nunca'], [false, 'nunca']],
  [['Papel, vidrio, latas,', 'envases, trapos'], [false, 'al puerto'], [false, 'al puerto']],
  [['Comida triturada', '(criba de 25 mm)'], [true, 'a más de 3 M'], [true, 'a más de 12 M']],
  [['Comida', 'sin triturar'], [true, 'a más de 12 M'], [false, 'al puerto']],
];

export function marpolBasurasC(spec = {}) {
  const z = spec.zona ?? null;
  if (z != null && !['atlantico', 'mediterraneo'].includes(z)) return null;
  const xs = [12, 130, 238, W - 12];
  const [yt, fila] = [138, 44];
  const H = yt + 26 + FILAS_BAS.length * fila + 60;
  const alt = 'Arriba, un esquema del Estrecho con el meridiano 5° 36′ W: al oeste, el Atlántico; al este, el Mediterráneo, zona especial. Debajo, la tabla: plásticos y aceite de cocina, nunca; papel, vidrio, latas y envases, al puerto; la comida triturada, a más de 3 millas en el Atlántico y a más de 12 en el Mediterráneo; sin triturar, a más de 12 en el Atlántico y nunca en el Mediterráneo.';
  const { out, pt, cierra } = lienzo(W, H, alt);
  out.push(`<rect x="12" y="14" width="${W - 24}" height="80" fill="${T.agua}"/>`);
  out.push(tierra(`M12,14 H${W - 12} V30 Q290,36 236,34 Q196,32 176,44 Q164,46 152,42 Q120,32 88,36 Q46,40 12,36 Z`, pt), tierra(`M12,94 V86 Q66,82 130,84 Q150,70 172,68 Q206,78 270,82 Q312,84 ${W - 12},82 V94 Z`, pt));
  out.push(linea(160, 10, 160, 100, { color: T.magenta, w: 1.6, extra: 'stroke-dasharray="4 3"' }), mono(160, 118, '5° 36′ W', { weight: 700, color: T.magenta }));
  const zOn = (k) => z === k;
  out.push(centrado(84, 66, 'Atlántico', { weight: 700, color: zOn('atlantico') ? T.magenta : T.tinta }), centrado(244, 58, 'Mediterráneo', { weight: 700, color: zOn('mediterraneo') ? T.magenta : T.tinta }), centrado(244, 74, 'zona especial', { size: TXT.min, italic: true }));
  out.push(centrado((xs[1] + xs[2]) / 2, yt + 14, 'Atlántico', { weight: 700, size: TXT.min, color: zOn('atlantico') ? T.magenta : T.tinta }), centrado((xs[2] + xs[3]) / 2, yt + 14, 'Mediterráneo', { weight: 700, size: TXT.min, color: zOn('mediterraneo') ? T.magenta : T.tinta }));
  FILAS_BAS.forEach(([nombre, ...celdas], r) => {
    const y = yt + 22 + r * fila;
    out.push(linea(xs[0], y, xs[3], y, { w: 0.6 }), serif(xs[0], y + 18, nombre[0], { size: TXT.min, weight: 700 }), serif(xs[0], y + 34, nombre[1], { size: TXT.min }));
    celdas.forEach(([ok, t], i) => {
      const [x0, x1] = [xs[i + 1], xs[i + 2]];
      out.push(`<rect x="${x0 + 3}" y="${y + 4}" width="${x1 - x0 - 6}" height="${fila - 8}" fill="${ok ? T.agua : T.papel}" stroke="${ok ? T.verdeTxt : T.magenta}" stroke-width=".8"${ok ? '' : ' stroke-dasharray="3 2"'}/>`);
      out.push(ok ? bien(x0 + 13, y + fila / 2, 4.5) : tacha(x0 + 13, y + fila / 2, 4), serif(x0 + 23, y + fila / 2 + 4, t, { size: TXT.min, weight: 700, color: ok ? T.verdeTxt : T.magenta }));
    });
  });
  const yb = yt + 22 + FILAS_BAS.length * fila;
  out.push(linea(xs[0], yb, xs[3], yb, { w: 0.6 }));
  const ci = { atlantico: 1, mediterraneo: 2 }[z];
  if (ci) out.push(`<rect x="${xs[ci]}" y="${yt}" width="${xs[ci + 1] - xs[ci]}" height="${yb - yt + 2}" fill="none" stroke="${T.magenta}" stroke-width="2.2"/>`);
  out.push(panelNotas(yb + 8, H), serif(16, yb + 30, 'La comida, siempre en ruta y sin bolsas ni envoltorios.', { size: TXT.min }), serif(16, yb + 48, 'Mezclada con otra basura, manda la regla más dura.', { size: TXT.min }));
  out.push(cierra());
  const caps = {
    atlantico: 'En el Atlántico (frente a Huelva, Cádiz o Trafalgar), fuera de zona especial: comida triturada a más de 3 millas y sin triturar a más de 12, siempre en ruta.',
    mediterraneo: 'El Mediterráneo, al este del meridiano 5° 36′ W (Málaga, Almería, Baleares), es zona especial: la comida solo triturada, a más de 12 millas y en ruta; sin triturar, al puerto.',
  };
  return { svg: out.join(''), caption: z ? caps[z] : 'Plásticos y aceite de cocina, nunca; papel, vidrio, latas y envases, al puerto. La comida, al oeste del meridiano 5° 36′ W (Atlántico), triturada a más de 3 millas y sin triturar a más de 12; en el Mediterráneo, zona especial, solo triturada y a más de 12 millas.' };
}

// ===========================================================================
// Fondeo y posidonia (per-4-8): RD 191/2026

function pradera(x, y, w, h) {
  const s = [`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${T.verde}" fill-opacity=".55"/>`];
  for (let i = 0; i < Math.floor((w * h) / 300); i++) {
    const px = x + 6 + ((i * 37) % (w - 12));
    const py = y + 6 + ((i * 23) % (h - 12));
    s.push(`<path d="M${px},${py + 4} q-2,-4 0,-8 M${px + 3},${py + 4} q2,-4 1,-8" stroke="${T.verdeTxt}" stroke-width="1" fill="none"/>`);
  }
  return s.join('');
}
const anclita = (x, y, c = T.tinta) => `<g transform="translate(${x},${y})" stroke="${c}" stroke-width="1.6" fill="none"><circle cx="0" cy="-6" r="2"/><line x1="0" y1="-4" x2="0" y2="5"/><path d="M-5,1 Q0,8 5,1"/></g>`;

export function posidoniaC(spec = {}) {
  if (spec.vista === 'planta') {
    const H = 300;
    const alt = 'La posidonia oceánica, de perfil sobre la arena: un rizoma horizontal con raíces, haces de hojas en forma de cinta, una flor y un fruto flotante, la «oliva de mar». Es una planta con flores, no un alga, y crece muy despacio.';
    const { out, pt, cierra } = lienzo(W, H, alt, { fondo: T.agua });
    const yf = 214;
    out.push(tierra(`M5,${yf} L${W - 5},${yf} L${W - 5},${H - 5} L5,${H - 5}Z`, pt));
    out.push(`<path d="M30,${yf + 12} C84,${yf + 6} 126,${yf + 18} 200,${yf + 10}" stroke="${T.tinta}" stroke-width="5" fill="none" stroke-linecap="round"/>`);
    for (const x of [46, 80, 114, 148, 182]) out.push(`<path d="M${x},${yf + 14} q-4,12 -2,22 M${x + 4},${yf + 14} q6,10 4,20" stroke="${T.tinta}" stroke-width="1.2" fill="none"/>`);
    for (const [x, k] of [[54, 0], [106, 1], [158, 2]]) for (let j = -2; j <= 2; j++) out.push(`<path d="M${x + j * 2},${yf + 8} q${j * 3 + (k - 1) * 2},-60 ${j * 8 + (k - 1) * 3},-${116 - Math.abs(j) * 12}" stroke="${T.verde}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`);
    out.push(`<circle cx="110" cy="${yf - 78}" r="4.5" fill="${T.amarillo}" stroke="${T.tinta}"/>`, `<ellipse cx="74" cy="40" rx="7" ry="5" fill="${T.verde}" stroke="${T.tinta}"/>`, serif(86, 44, 'fruto flotante: «oliva de mar»', { size: TXT.min }));
    const L = (x, y, t, ty) => referencia(x, y, 220, ty - 4) + serif(224, ty, t, { weight: 700, size: TXT.min });
    out.push(L(170, yf - 90, 'hojas en cinta', 96), L(114, yf - 78, 'flores (en otoño)', 124), L(200, yf + 10, 'rizoma (tallo)', 178), L(186, yf + 30, 'raíces', yf + 34));
    out.push(serif(14, H - 14, 'Endémica del Mediterráneo; crece muy despacio.', { size: TXT.min, weight: 700 }));
    out.push(cierra());
    return { svg: out.join(''), caption: 'La posidonia oceánica es una planta con flores, con raíces, rizoma y hojas en cinta, endémica del Mediterráneo. Forma praderas sobre la arena y crece muy despacio: el daño de un ancla tarda décadas en repararse.' };
  }
  const H = 360;
  const alt = 'Cuatro vistas desde arriba de un fondo con pradera de posidonia (oscura) y claros de arena: bien, ancla y cadena siempre en la arena; mal, al bornear la cadena barre la pradera; mal, el ancla sobre la pradera; bien, amarrado a una boya autorizada.';
  const { out, id, cierra } = lienzo(W, H, alt);
  const [cw, ch] = [162, 100];
  const celdas = [[12, 14, true, 'Bien: ancla y cadena', 'siempre en arena'], [184, 14, false, 'Mal: al bornear, la', 'cadena barre la pradera'], [12, 166, false, 'Mal: ancla sobre', 'la pradera'], [184, 166, true, 'Bien: amarrado a una', 'boya autorizada']];
  celdas.forEach(([x, y, ok, l1, l2], i) => {
    out.push(`<clipPath id="${id}-c${i}"><rect x="${x}" y="${y}" width="${cw}" height="${ch}"/></clipPath><g clip-path="url(#${id}-c${i})"><rect x="${x}" y="${y}" width="${cw}" height="${ch}" fill="${T.agua}"/>${pradera(x, y, cw, ch)}`);
    const [cx, cy] = [x + cw / 2, y + ch / 2];
    if (i === 0) out.push(`<ellipse cx="${cx}" cy="${cy}" rx="72" ry="44" fill="${T.tierra}"/><circle cx="${cx + 8}" cy="${cy}" r="32" fill="none" stroke="${T.tinta}" stroke-width="1" stroke-dasharray="3 3"/>`, linea(cx + 8, cy, cx - 20, cy - 14, { w: 1.6 }), barco(cx - 26, cy - 16, 270, 26, { p: null }), anclita(cx + 8, cy + 2));
    else if (i === 1) out.push(`<ellipse cx="${cx + 10}" cy="${cy}" rx="36" ry="28" fill="${T.tierra}"/><circle cx="${cx + 10}" cy="${cy}" r="40" fill="none" stroke="${T.magenta}" stroke-width="1.4" stroke-dasharray="3 3"/>`, `<path d="M${cx + 10},${cy} Q${cx - 6},${cy + 8} ${cx - 26},${cy + 16}" stroke="${T.magenta}" stroke-width="2.4" fill="none"/>`, barco(cx - 34, cy + 18, 250, 26, { p: null }), anclita(cx + 10, cy + 2));
    else if (i === 2) out.push(linea(cx + 16, cy + 4, cx - 16, cy - 10, { color: T.magenta, w: 2.4 }), barco(cx - 24, cy - 12, 270, 26, { p: null }), `<circle cx="${cx + 16}" cy="${cy + 4}" r="10" fill="${T.papel}"/>`, anclita(cx + 16, cy + 6, T.magenta));
    else out.push(linea(cx + 14, cy, cx - 10, cy - 6, { w: 1.4 }), `<circle cx="${cx + 14}" cy="${cy}" r="7" fill="${T.naranja}" stroke="${T.tinta}" stroke-width="1.2"/>`, barco(cx - 20, cy - 8, 285, 26, { p: null }));
    out.push('</g>', `<rect x="${x}" y="${y}" width="${cw}" height="${ch}" fill="none" stroke="${ok ? T.tinta : T.magenta}" stroke-width="${ok ? 1 : 1.6}"/>`);
    out.push(ok ? bien(x + cw - 14, y + 14, 6) : tacha(x + cw - 14, y + 14, 6));
    out.push(serif(x, y + ch + 18, l1, { size: TXT.min, weight: 700, color: ok ? T.verdeTxt : T.magenta }), serif(x, y + ch + 34, l2, { size: TXT.min, weight: 700, color: ok ? T.verdeTxt : T.magenta }));
  });
  out.push(panelNotas(316, H), `<rect x="16" y="330" width="14" height="12" fill="${T.tierra}" stroke="${T.tinta}" stroke-width=".6"/>`, serif(36, 340, 'arena: claro', { size: TXT.min }), `<rect x="180" y="330" width="14" height="12" fill="${T.verde}" fill-opacity=".55" stroke="${T.tinta}" stroke-width=".6"/>`, serif(200, 340, 'posidonia: oscuro', { size: TXT.min }));
  out.push(cierra());
  return { svg: out.join(''), caption: 'En el Mediterráneo español está prohibido fondear sobre las praderas de posidonia, y también en la arena próxima si la cadena las toca o las barre al bornear. Sobre la pradera, solo boya autorizada. Se exceptúan la fuerza mayor y el peligro para la vida humana o la navegación.' };
}

// ===========================================================================
// Banderas a bordo y pabellón obligatorio (per-4-7): RD 2335/1980

export const PUNTOS_BANDERA = ['popa', 'pico', 'crucetas'];

export function banderasABordoC(spec = {}) {
  const m = marca(spec, null, { permisivo: true });
  const H = 404;
  const alt = 'Velero de costado con tres puntos numerados: 1, el asta de popa, con la bandera de España; 2, el pico del palo mayor, reservado también a la de España; 3, la driza de las crucetas, con otra bandera (la autonómica) más pequeña, como mucho un tercio del área de la de España y solo con esta izada.';
  const { out, cierra } = lienzo(W, H, alt);
  const yd = 214;
  out.push(marHasta(yd + 14, yd + 44));
  out.push(`<path d="M70,${yd} L316,${yd} Q306,${yd + 20} 274,${yd + 26} L94,${yd + 26} Q74,${yd + 22} 70,${yd}Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.2"/>`);
  const xm = 196;
  out.push(`<path d="M${xm - 2},104 L126,62 L106,192 L${xm - 2},192Z" fill="${T.papel}" stroke="${T.tinta}" stroke-width=".8"/>`, linea(xm, yd, xm, 40, { w: 3 }), linea(xm, 104, 122, 60, { w: 2.6 }), linea(xm, 194, 102, 194, { w: 2.6 }), linea(xm, 124, xm + 20, 124, { w: 2.4 }));
  out.push(linea(76, yd + 2, 58, 172, { w: 2.4 }), espana(26, 172, 33, 22));
  const k3 = 1 / Math.sqrt(3);
  out.push(linea(xm + 20, 124, xm + 20, 136, { w: 0.8 }), otra(xm + 20, 135, 33 * k3, 22 * k3));
  const P = [['popa', 40, 156], ['pico', 110, 50], ['crucetas', xm + 52, 142]];
  P.forEach(([k, x, y], i) => out.push(`<g data-parte="${k}">${paso(x, y, i + 1, { color: m.c(k, T.magenta) })}</g>`));
  out.push(panelNotas(262, H));
  const T3 = [['popa', ['Asta de popa: solo la bandera de España.']], ['pico', ['Pico del palo mayor (si lo tiene): solo', 'la bandera de España.']], ['crucetas', ['En otro sitio (la driza de las crucetas): la', 'autonómica u otras, solo con la de España', 'izada y como mucho con 1/3 de su área.']]];
  let y = 284;
  T3.forEach(([k, ls], i) => { out.push(`<g data-parte="${k}">${paso(24, y - 4, i + 1, { color: m.c(k, T.tinta) })}${ls.map((l, j) => serif(40, y + j * 16, l, { size: TXT.min, weight: m.on(k) ? 700 : 400 })).join('')}</g>`); y += ls.length * 16 + 8; });
  out.push(cierra());
  const CAP = {
    popa: 'El asta de popa está reservada a la bandera de España, el único pabellón de un barco español.',
    pico: 'El pico del palo mayor, en los veleros que lo tienen, está reservado a la bandera de España, como el asta de popa.',
    crucetas: 'La autonómica, la del club o la de cortesía van en otro lugar, por ejemplo en una driza de las crucetas: solo con la de España izada y como mucho con un tercio de su área. La autonómica, en puertos nacionales y aguas interiores.',
  };
  const hl = [...m.hl];
  return { svg: out.join(''), caption: hl.length === 1 && CAP[hl[0]] ? CAP[hl[0]] : 'El asta de popa y el pico del palo mayor están reservados a la bandera de España. Las demás (autonómica, club, cortesía) van en otro lugar, solo con la de España izada y como mucho con un tercio de su área.' };
}

export const PABELLON = {
  guerra: ['A la vista de un buque de guerra', 'o de una fortaleza'],
  puerto: ['Al entrar y salir de puerto'],
  festivos: ['En puerto, de sol a sol,', 'en los días festivos'],
  autoridad: ['Cuando lo disponga la autoridad', 'competente'],
  extranjero: ['Cuando lo exijan la costumbre', 'internacional o las normas de', 'aguas extranjeras'],
};
const CAP_PABELLON = {
  guerra: 'A la vista de un buque de guerra o de una fortaleza hay que tener izado el pabellón nacional.',
  puerto: 'Al entrar y al salir de puerto hay que llevar izado el pabellón nacional.',
  festivos: 'En puerto, los días festivos, el pabellón nacional se iza de sol a sol.',
  autoridad: 'También es obligatorio izarlo cuando lo disponga la autoridad competente.',
  extranjero: 'Y cuando lo exijan la costumbre internacional o las normas de las aguas extranjeras en que navegas.',
  otras: 'Cualquier otra bandera, como la autonómica, solo puede ir izada con la de España izada y como mucho con un tercio de su área.',
};

function iconoPabellon(k, x, y) {
  if (k === 'guerra') return `<path d="M${x - 27},${y + 4} L${x + 9},${y + 4} L${x + 5},${y + 11} L${x - 24},${y + 11} Z" fill="${T.apagado}" stroke="${T.tinta}" stroke-width=".8"/><rect x="${x - 15}" y="${y - 4}" width="12" height="8" fill="${T.apagado}"/>${linea(x - 9, y - 4, x - 9, y - 13, { w: 1.2 })}<path d="M${x + 14},${y + 11} V${y - 8} H${x + 17} V${y - 11} H${x + 20} V${y - 8} H${x + 23} V${y - 11} H${x + 26} V${y + 11} Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width=".8"/>${linea(x - 30, y + 11, x + 29, y + 11, { color: T.lineaAgua, w: 1.2 })}`;
  if (k === 'puerto') return `<path d="M${x - 28},${y - 12} H${x - 6} V${y - 2} M${x - 28},${y + 12} H${x - 6} V${y + 4}" fill="none" stroke="${T.tinta}" stroke-width="3.4"/>${flecha(x - 22, y, x + 26, y, { color: T.azul, w: 1.6, punta: 7 })}${flecha(x + 2, y, x - 24, y, { color: T.azul, w: 1.6, punta: 7 })}`;
  if (k === 'festivos') return `${linea(x - 28, y + 10, x + 28, y + 10, { w: 1.2 })}<path d="M${x - 20},${y + 10} Q${x},${y - 24} ${x + 20},${y + 10}" fill="none" stroke="${T.apagado}" stroke-width="1.4" stroke-dasharray="3 2"/>${[x - 20, x + 20].map((sx) => `<path d="M${sx - 6},${y + 10} A6,6 0 0 1 ${sx + 6},${y + 10} Z" fill="${T.amarillo}" stroke="${T.tinta}" stroke-width=".8"/>`).join('')}${linea(x, y + 10, x, y - 6, { w: 1 })}${espana(x, y - 6, 9, 6)}`;
  if (k === 'autoridad') return `<rect x="${x - 12}" y="${y - 14}" width="22" height="28" fill="${T.papel}" stroke="${T.tinta}"/>${[-8, -3, 2].map((d) => linea(x - 8, y + d, x + 6, y + d, { w: 0.8 })).join('')}<circle cx="${x + 9}" cy="${y + 9}" r="6" fill="${T.rojo}" stroke="${T.tinta}"/>`;
  return `<circle cx="${x}" cy="${y}" r="14" fill="${T.agua}" stroke="${T.tinta}"/><ellipse cx="${x}" cy="${y}" rx="6" ry="14" fill="none" stroke="${T.tinta}" stroke-width=".7"/>${linea(x - 14, y, x + 14, y, { w: 0.7 })}`;
}

export function pabellonObligatorioC(spec = {}) {
  const m = marca(spec, [...Object.keys(PABELLON), 'otras']);
  if (!m) return null;
  const H = 400;
  const alt = 'Cuándo es obligatorio llevar izada la bandera de España, con un pictograma cada caso: a la vista de un buque de guerra o de una fortaleza; al entrar y salir de puerto; en puerto, de sol a sol, los días festivos; cuando lo disponga la autoridad; y cuando lo exijan la costumbre internacional o las normas extranjeras. Debajo, que las demás banderas solo van con la de España izada y como mucho con un tercio de su área.';
  const { out, cierra } = lienzo(W, H, alt);
  out.push(serif(16, 28, 'Es obligatorio llevar izada la de España:', { weight: 700 }));
  let y = 40;
  for (const [k, ls] of Object.entries(PABELLON)) {
    const h = ls.length === 3 ? 58 : 46;
    out.push(`${m.g(k)}${m.on(k) ? `<rect x="10" y="${y}" width="${W - 20}" height="${h - 4}" fill="none" stroke="${T.magenta}" stroke-width="2"/>` : ''}${iconoPabellon(k, 46, y + (h - 4) / 2)}`);
    const y0 = y + (h - 4) / 2 - ((ls.length - 1) * 15) / 2 + 4;
    ls.forEach((l, i) => out.push(serif(90, y0 + i * 15, l, { size: TXT.min, weight: m.on(k) ? 700 : 400 })));
    out.push('</g>');
    y += h;
  }
  const yo = y + 8;
  out.push(`${m.g('otras')}${filete(yo - 4)}${m.on('otras') ? `<rect x="10" y="${yo}" width="${W - 20}" height="${H - yo - 12}" fill="none" stroke="${T.magenta}" stroke-width="2"/>` : ''}`);
  const [fw, fh] = [48, 32];
  const k3 = 1 / Math.sqrt(3);
  out.push(espana(18, yo + 12, fw, fh), otra(72, yo + 12 + fh - fh * k3, fw * k3, fh * k3));
  out.push(serif(112, yo + 22, 'Las demás (autonómica, club…):', { size: TXT.min, weight: 700 }), serif(112, yo + 38, 'solo con la de España izada y', { size: TXT.min }), serif(112, yo + 54, 'como mucho 1/3 de su área', { size: TXT.min, weight: 700, color: m.c('otras') }), '</g>');
  out.push(cierra());
  const hl = [...m.hl];
  return { svg: out.join(''), caption: hl.length === 1 ? CAP_PABELLON[hl[0]] : 'El pabellón nacional se iza a la vista de un buque de guerra o de una fortaleza, al entrar y salir de puerto, en puerto de sol a sol los días festivos, cuando lo disponga la autoridad y cuando lo exijan la costumbre internacional o las normas extranjeras. Las demás banderas, solo con la de España izada y con un tercio de su área como máximo.' };
}
