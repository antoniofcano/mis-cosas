// Láminas de lección del PER (maniobra, casco, seguridad y meteorología) rehechas en estilo C en la tanda de cierre
// (docs/ESTILO-LAMINAS.md). Mismos tipos, parámetros y `resaltar` que las láminas a las que sustituyen (un `resaltar`
// que no es de la vista se ignora, como antes); solo cambia el dibujo. Sin DOM.
//   ripa-definiciones: { vista: 'vela-motor'|'categorias', resaltar? }                                    (per-6-1)
//   capear-correr:     { vista: 'rumbos'|'costa', resaltar? }                                              (per-3-3)
//   fondeo:            { vista: 'ancla'|'linea'|'borneo'|'garreo'|'orinque'|'voces', resaltar? }          (per-1-6, 2-5, 2-6)
//   estructura:        { vista: 'partes'|'vias-agua', resaltar? }                                         (per-1-3, 8-5)
//   rolar:             { vista: 'vocabulario'|'instrumentos', resaltar? }                                  (per-9-3)
//   cabo:              { vista: 'partes'|'cornamusa'|'por-seno'|'encapillar', resaltar? }                 (per-7-1)
//   remolque:          { vista: 'largo'|'abarloado'|'naufrago' }                                           (per-3-8)
//   hipotermia:        { postura: 'help'|'saltar'|'grupo' }                                                (per-3-8, 8-9)

import { T, TXT, lienzo, rotulo, etiqueta, cota, flecha, referencia, paso, barco, tierra, arcoD, pol, f1 } from './estilo-c.js';
import { W, serif, cap, linea, filete, panelNotas, marHasta, tacha, bien, punto, pts, lista } from './kit-lecciones-c.js';

/** Resaltado permisivo: las partes que no son de la vista no cambian nada. */
function marca(spec, validas) {
  const hl = new Set(lista(spec.resaltar).filter((k) => !validas || validas.includes(k)));
  const on = (k) => hl.has(k);
  return { hl, on, activo: hl.size > 0, c: (k, base = T.tinta) => (on(k) ? T.magenta : base), w: (k, b = 1.4, f = 2.4) => (on(k) ? f : b), texto: (cap, def) => (hl.size ? [...hl].map((k) => cap[k]).filter(Boolean).join(' ') || def : def) };
}
/** Casco de perfil: (x, y) es la proa en la flotación; L la eslora; proa a la izquierda (o a la derecha con haciaDerecha). */
function cascoPerfil(x, y, L, { haciaDerecha = false, cabina = true, p = null } = {}) {
  const s = haciaDerecha ? -1 : 1;
  const X = (d) => f1(x + s * d);
  const h = L * 0.17;
  return `<g${p ? ` data-parte="${p}"` : ''}><path d="M${X(0)},${f1(y - h)} L${X(L)},${f1(y - h * 0.85)} L${X(L - 3)},${f1(y + h * 0.35)} Q${X(L * 0.45)},${f1(y + h * 0.75)} ${X(L * 0.14)},${f1(y + h * 0.2)} Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.3" stroke-linejoin="round"/>` +
    (cabina ? `<rect x="${f1(Math.min(x + s * L * 0.42, x + s * L * 0.72))}" y="${f1(y - h * 1.6)}" width="${f1(L * 0.3)}" height="${f1(h * 0.62)}" rx="2" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.1"/>` : '') + '</g>';
}
/** Ancla pequeña: (x, y) es el arganeo; sin girar, la caña baja y la cruz queda abajo. */
function anclaG(x, y, s = 1, rot = 0, color = T.tinta) {
  return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)}) scale(${s})" fill="none" stroke="${color}" stroke-width="${f1(2 / Math.sqrt(s))}" stroke-linecap="round">` +
    `<circle cx="0" cy="-2.5" r="2.5"/><path d="M0,0 L0,21 M-10,11 Q-9,21 0,21 Q9,21 10,11"/><path d="M-10,8 L-13,15 L-7,14Z M10,8 L13,15 L7,14Z" fill="${color}"/></g>`;
}
const cruzDe = (x, y, s, rot) => { const a = (rot * Math.PI) / 180; return [x - 21 * s * Math.sin(a), y + 21 * s * Math.cos(a)]; };
/** Cadena: trazo grueso discontinuo. */
const cadena = (d, { color = T.tinta, w = 3 } = {}) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-dasharray="3.5 1.8"/>`;
/** Cabo: contorno de tinta y alma amarilla (magenta si está resaltado). */
const cuerda = (d, { on = false, w = 3.6, alma = T.amarillo } = {}) =>
  `<path d="${d}" fill="none" stroke="${T.tinta}" stroke-width="${w + 2}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${on ? T.magenta : alma}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
/** Fondo marino con su punteado, de y a yFin. */
/** Crestas de olas en planta entre x1 y x2, a la altura y. */
const crestas = (x1, x2, y, paso = 24, amp = 4) => {
  let d = `M${f1(x1)},${f1(y)}`;
  for (let x = x1; x < x2; x += paso) d += ` q${f1(paso / 4)},${-amp} ${f1(paso / 2)},0 t${f1(paso / 2)},0`;
  return `<path d="${d}" fill="none" stroke="${T.lineaAgua}" stroke-width="1.3"/>`;
};
const recuadro = (x, y, w, h, { on = false, fondo = 'none' } = {}) => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${fondo}" stroke="${on ? T.magenta : T.tinta}" stroke-width="${on ? 2.2 : 0.8}"/>`;
const centrado = (x, y, t, o = {}) => serif(x, y, t, { anchor: 'middle', ...o });

// ===========================================================================
// Definiciones del RIPA (per-6-1). Regla 3 b), c), d), f), g) y h); regla 25 e) (cono con el vértice hacia abajo).

export const PARTES_RIPA = ['vela', 'motor', 'sin-gobierno', 'maniobra-restringida', 'pesca', 'calado'];

/** Velero de perfil, proa a la izquierda; (x, y) es la proa en la flotación. */
function velero(x, y, motor, color) {
  const o = [`<path d="M${x},${y - 8} L${x + 120},${y - 6} L${x + 115},${y + 4} Q${x + 56},${y + 11} ${x + 15},${y + 3}Z" fill="${T.casco}" stroke="${color}" stroke-width="1.4"/>`];
  o.push(`<path d="M${x + 62},${y + 8} l-5,16 h14 l-2,-14" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.1"/>`);
  o.push(linea(x + 58, y - 8, x + 58, y - 112, { w: 2 }));
  o.push(`<path d="M${x + 61},${y - 110} L${x + 61},${y - 16} L${x + 110},${y - 16}Z" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1"/>`);
  o.push(`<path d="M${x + 55},${y - 106} L${x + 55},${y - 16} L${x + 8},${y - 12}Z" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1"/>`);
  if (motor) {
    o.push(`<g transform="translate(${x + 106} ${y + 11})"><ellipse rx="3" ry="7" fill="${T.magenta}"/><circle r="1.8" fill="${T.tinta}"/></g>`);
    o.push(`<path d="M${x + 116},${y + 9} q6,-3 12,0 t12,0 M${x + 116},${y + 15} q6,-3 12,0 t12,0" fill="none" stroke="${T.lineaAgua}" stroke-width="1.3"/>`);
    for (const [dx, dy, r] of [[126, -12, 3], [132, -19, 4], [140, -27, 5]]) o.push(`<circle cx="${x + dx}" cy="${y + dy}" r="${r}" fill="${T.apagado}" opacity=".45"/>`);
  } else o.push(linea(x + 106, y + 4, x + 106, y + 18, { w: 2 }));
  return o.join('');
}

function ripaVelaMotor(m) {
  const H = 330;
  const alt = 'Dos veleros iguales con las velas izadas. A la izquierda, con el motor parado: es buque de vela. A la derecha, con el motor en marcha (hélice girando, estela y humo): es buque de propulsión mecánica, sea cual sea su eslora, y de día lo dice con un cono con el vértice hacia abajo a proa.';
  const { out, cierra } = lienzo(W, H, alt);
  const ys = 176;
  out.push(marHasta(ys, 206), linea(W / 2, 14, W / 2, 316, { w: 0.6 }));
  out.push(`<g data-parte="vela">${velero(26, ys, false, m.c('vela'))}</g>`, `<g data-parte="motor">${velero(202, ys, true, m.c('motor'))}</g>`);
  out.push(`<path d="M${202 + 18},${ys - 76} L${202 + 38},${ys - 76} L${202 + 28},${ys - 58}Z" fill="${T.tinta}"/>`, referencia(202 + 30, ys - 70, 270, 40, { color: T.magenta }), serif(250, 30, 'cono, vértice abajo', { weight: 700, color: T.magenta, size: TXT.min }), serif(272, 46, 'de día, a proa', { italic: true, size: TXT.min }));
  out.push(centrado(92, 228, 'motor parado', { weight: 700 }), centrado(268, 228, 'motor en marcha', { weight: 700, color: T.magenta }));
  const caja = (x, k, tit, l1, l2) => `<g data-parte="${k}">${recuadro(x, 242, 160, 70, { on: m.on(k) })}${rotulo(x + 80, 262, tit, { size: TXT.min, estilo: 'cap', weight: 700, color: m.c(k) })}${centrado(x + 80, 282, l1)}${centrado(x + 80, 300, l2)}</g>`;
  out.push(caja(12, 'vela', 'BUQUE DE VELA', 'navega a vela y su', 'máquina no se usa'), caja(186, 'motor', 'PROPULSIÓN MECÁNICA', 'aunque lleve velas,', 'sea cual sea su eslora'));
  out.push(cierra());
  return out.join('');
}

const CATEGORIAS = [
  ['sin-gobierno', 'SIN GOBIERNO', 'algo excepcional', ['una avería: no puede', 'maniobrar ni apartarse']],
  ['maniobra-restringida', 'MANIOBRA RESTRINGIDA', 'por su trabajo', ['boyas, cables, dragado,', 'aprovisionar, remolque']],
  ['pesca', 'DEDICADO A LA PESCA', 'por sus artes', ['redes, líneas, arrastre;', 'con curricán no lo es']],
  ['calado', 'RESTRINGIDO POR CALADO', 'por su calado', ['de propulsión mecánica;', 'poco fondo y anchura']],
];

function iconoCat(k, cx, cy) {
  if (k === 'sin-gobierno') return barco(cx - 4, cy, 90, 50, { p: null }) + `<path d="M${cx - 31},${cy - 3} l-9,-7 M${cx - 31},${cy + 3} l-10,8" stroke="${T.magenta}" stroke-width="2.4" stroke-linecap="round"/>`;
  if (k === 'maniobra-restringida') return barco(cx - 12, cy, 90, 50, { p: null }) + `<path d="M${cx - 2},${cy - 3} L${cx + 26},${cy - 16} L${cx + 26},${cy + 10}" fill="none" stroke="${T.tinta}" stroke-width="1.5"/><circle cx="${cx + 26}" cy="${cy + 14}" r="4.5" fill="${T.amarillo}" stroke="${T.tinta}"/>`;
  if (k === 'pesca') return barco(cx - 22, cy - 2, 90, 44, { p: null }) + `<path d="M${cx - 42},${cy - 1} L${cx - 2},${cy + 9} M${cx - 42},${cy - 5} L${cx - 2},${cy + 1}" stroke="${T.tinta}" stroke-width=".9"/><path d="M${cx - 2},${cy} L${cx + 40},${cy - 7} L${cx + 40},${cy + 16} Z" fill="none" stroke="${T.tinta}" stroke-width="1.3"/><path d="M${cx + 10},${cy - 1} V${cy + 11} M${cx + 21},${cy - 3} V${cy + 13} M${cx + 31},${cy - 5} V${cy + 15} M${cx},${cy + 5} H${cx + 40}" stroke="${T.tinta}" stroke-width=".7"/>`;
  return linea(cx - 62, cy - 8, cx + 62, cy - 8, { color: T.lineaAgua, w: 1.4 }) + `<path d="M${cx - 62},${cy + 2} Q${cx - 36},${cy + 2} ${cx - 28},${cy + 18} H${cx + 28} Q${cx + 36},${cy + 2} ${cx + 62},${cy + 2} V${cy + 22} H${cx - 62}Z" fill="${T.tierra}" stroke="${T.tinta}" stroke-width="1"/><path d="M${cx - 22},${cy - 14} H${cx + 22} L${cx + 14},${cy + 15} H${cx - 14}Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.2"/>`;
}

function ripaCategorias(m) {
  const H = 352;
  const alt = 'Cuatro fichas con la razón por la que cada buque no puede apartarse: sin gobierno, por una circunstancia excepcional como una avería; maniobra restringida, por la naturaleza de su trabajo (boyas, cables, dragado, aprovisionamiento, remolque); dedicado a la pesca, por artes que le restringen la maniobra (no con curricán); restringido por su calado, un buque de propulsión mecánica por su calado frente a la profundidad y la anchura del agua.';
  const { out, cierra } = lienzo(W, H, alt);
  CATEGORIAS.forEach(([k, nom, porque, notas], i) => {
    const x0 = 12 + (i % 2) * 170;
    const y0 = 14 + Math.floor(i / 2) * 166;
    out.push(`<g data-parte="${k}">${recuadro(x0, y0, 164, 158, { on: m.on(k), fondo: T.papel })}${iconoCat(k, x0 + 82, y0 + 40)}`);
    out.push(rotulo(x0 + 82, y0 + 90, nom, { size: TXT.min, estilo: 'cap', weight: 700, color: m.c(k), espacio: 0.6 }), centrado(x0 + 82, y0 + 108, porque, { italic: true, weight: 700, color: m.c(k, T.azulTxt) }));
    notas.forEach((n, j) => out.push(centrado(x0 + 82, y0 + 128 + j * 16, n, { size: TXT.min })));
    out.push('</g>');
  });
  out.push(cierra());
  return out.join('');
}

export function ripaDefinicionesC(spec = {}) {
  const m = marca(spec, PARTES_RIPA);
  if (spec.vista === 'categorias') {
    return { svg: ripaCategorias(m), caption: 'Sin gobierno: no puede maniobrar por una circunstancia excepcional (una avería). Maniobra restringida: no puede apartarse por la naturaleza de su trabajo. Dedicado a la pesca: con artes que le restringen la maniobra (no con curricán). Restringido por su calado: de propulsión mecánica, por su calado frente al agua navegable.' };
  }
  return { svg: ripaVelaMotor(m), caption: 'Para el RIPA decide la máquina, no el aparejo: un velero es buque de vela solo si su maquinaria no se está usando. Con las velas izadas y el motor en marcha es buque de propulsión mecánica, sea cual sea su eslora, y de día lo anuncia con un cono con el vértice hacia abajo a proa.' };
}

// ===========================================================================
// Capear y correr (per-3-3)

export const PARTES_CAPEAR = ['capear', 'correr', 'traves', 'barlovento', 'sotavento'];

function capearRumbos(m) {
  const H = 340;
  const alt = 'Mar y viento que llegan de arriba, con sus crestas. Tres barcos: el que capea recibe la mar por la amura con poca máquina avante; el que corre el temporal la recibe por la aleta o la popa; el tercero, atravesado a la mar, está tachado: puede zozobrar.';
  const { out, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
  for (let y = 34; y < 214; y += 26) out.push(crestas(10, W - 10, y));
  out.push(flecha(28, 20, 28, 58, { color: T.azul, w: 2 }), flecha(W - 28, 20, W - 28, 58, { color: T.azul, w: 2 }), etiqueta(179, 26, 'mar y viento', { color: T.azulTxt }));
  const barcos = [['capear', 64, -35, 'Capear', ['mar por la amura,', 'poca máquina avante']], ['correr', 179, 155, 'Correr', ['mar por la aleta', 'o por la popa']], ['traves', 294, 90, 'Atravesado', ['mar por el través:', 'puede zozobrar']]];
  for (const [k, x, rot, nom, notas] of barcos) {
    const y = 130;
    const col = k === 'traves' ? T.magenta : m.c(k, T.tinta);
    out.push(`<g data-parte="${k}">${barco(x, y, rot, 56, { p: null, relleno: T.casco })}`);
    if (m.on(k)) out.push(`<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M0,-28 C10,-17 9.5,-3 9.5,4 L7.6,28 L-7.6,28 L-9.5,4 C-9.5,-3 -10,-17 0,-28Z" fill="none" stroke="${T.magenta}" stroke-width="2.4"/></g>`);
    if (k !== 'traves') { const [a, b] = pol(x, y, rot, 34); const [c, d] = pol(x, y, rot, 52); out.push(flecha(a, b, c, d, { color: T.verdeTxt, w: 2 })); } else out.push(tacha(x, y, 15));
    out.push(k === 'traves' ? tacha(x - 44, 240, 6) : bien(x - 40, 240, 7));
    out.push(serif(x - 30, 245, nom, { weight: 700, color: col }));
    notas.forEach((n, i) => out.push(centrado(x, 266 + i * 16, n, { size: TXT.min })));
    out.push('</g>');
  }
  out.push(panelNotas(304, H), centrado(179, 326, 'Parado tampoco: sin arrancada no hay gobierno.', { italic: true }));
  out.push(cierra());
  return out.join('');
}

function capearCostaC(m) {
  const H = 340;
  const alt = 'Vista desde arriba con tierra a los dos lados y viento y mar que soplan de izquierda a derecha. La costa de barlovento, de donde viene el viento, da abrigo; la de sotavento, con rocas, es la peligrosa: una avería y el barco deriva hacia ella. La flecha de «aléjate» apunta a barlovento y a la mar abierta.';
  const { out, pt, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
  for (let i = 0; i < 6; i++) { const x = 104 + i * 32; const a = 3 + i * 1.6; out.push(`<path d="M${x},62 q${a},12 0,24 t0,24 t0,24 t0,24 t0,24" fill="none" stroke="${T.lineaAgua}" stroke-width="1.4"/>`); }
  out.push(`<g data-parte="barlovento">${tierra('M5,5 L68,5 Q80,70 64,120 Q76,170 66,214 L5,214Z', pt)}${m.on('barlovento') ? `<path d="M68,5 Q80,70 64,120 Q76,170 66,214" fill="none" stroke="${T.magenta}" stroke-width="2.6"/>` : ''}</g>`);
  out.push(`<g data-parte="sotavento">${tierra('M353,5 L294,5 Q284,70 298,120 Q284,170 296,214 L353,214Z', pt)}${m.on('sotavento') ? `<path d="M294,5 Q284,70 298,120 Q284,170 296,214" fill="none" stroke="${T.magenta}" stroke-width="2.6"/>` : ''}`);
  for (const [x, y] of [[290, 64], [284, 104], [292, 146], [284, 186]]) out.push(`<path d="M${x - 8},${y + 5} L${x - 4},${y - 4} L${x + 2},${y - 6} L${x + 6},${y + 5}Z" fill="${T.negro}"/>`);
  out.push('</g>');
  out.push(linea(5, 214, W - 5, 214, { w: 0.8 }));
  for (const y of [30, 46]) out.push(flecha(92, y, 150, y, { color: T.azul, w: 2 }));
  out.push(serif(158, 42, 'viento y mar', { weight: 700, color: T.azulTxt }));
  out.push(barco(170, 132, 0, 44, { p: null }));
  out.push(flecha(186, 132, 270, 132, { color: T.magenta, w: 2, discontinua: true }), etiqueta(228, 116, 'avería: deriva', { color: T.magenta }));
  out.push(flecha(152, 132, 104, 132, { color: T.verdeTxt, w: 2 }), etiqueta(128, 152, 'aléjate', { color: T.verdeTxt }));
  out.push(`<g data-parte="barlovento">${bien(20, 238, 6)}${serif(32, 243, 'Costa a barlovento', { weight: 700, color: m.c('barlovento') })}${serif(18, 262, 'el viento viene de tierra:', { size: TXT.min })}${serif(18, 278, 'te aleja y da abrigo', { size: TXT.min })}</g>`);
  out.push(`<g data-parte="sotavento">${tacha(198, 238, 6)}${serif(210, 243, 'Costa a sotavento', { weight: 700, color: m.on('sotavento') ? T.magenta : T.tinta })}${serif(196, 262, 'viento y mar te echan', { size: TXT.min })}${serif(196, 278, 'contra ella: aléjate', { size: TXT.min })}</g>`);
  out.push(panelNotas(292, H), centrado(179, 318, 'Derrota a un puerto de abrigo, lejos de los peligros.', { italic: true }));
  out.push(cierra());
  return out.join('');
}

export function capearCorrerC(spec = {}) {
  const m = marca(spec, PARTES_CAPEAR);
  if (spec.vista === 'costa') {
    return { svg: capearCostaC(m), caption: 'Con mal tiempo, la costa peligrosa es la de sotavento: viento y mar te empujan hacia ella y cualquier avería te lleva contra las rocas. Mejor dejar la costa a barlovento, que te aleja y te da abrigo, y buscar mar abierta.' };
  }
  return { svg: capearRumbos(m), caption: 'Con mala mar, ajusta rumbo y velocidad: capear es recibirla por la amura con poca máquina avante; correr el temporal, por la aleta o la popa. Recibirla por el través es lo más peligroso: balances violentos y riesgo de zozobrar.' };
}

// ===========================================================================
// Fondeo (per-1-6, per-2-5 y per-2-6). Línea de fondeo: RD 339/2021, art. 11.

export const PARTES_ANCLA = ['arganeo', 'cana', 'cruz', 'brazos', 'unas', 'cepo', 'arado', 'danforth', 'rezon', 'almirantazgo'];
export const PARTES_LINEA = ['barboten', 'cabiron', 'embrague', 'freno', 'cadena', 'estacha', 'grillete'];
export const PARTES_ORINQUE = ['orinque', 'boyarin', 'cruz'];
export const VOCES = ['pendura', 'fondo', 'filar', 'virar', 'pique', 'zarpa', 'clara'];

function fondeoAncla(m) {
  const H = 390;
  const alt = 'Un ancla sin cepo con sus partes rotuladas: el arganeo arriba, donde se une la cadena; la caña; la cruz abajo; los dos brazos y sus uñas. Debajo, cuatro tipos: de arado (una reja), Danforth (dos palas), rezón (cuatro o cinco brazos) y almirantazgo, con el cepo.';
  const { out, cierra } = lienzo(W, H, alt);
  const bar = (d, k, w = 6) => `<g data-parte="${k}"><path d="${d}" fill="none" stroke="${m.c(k)}" stroke-width="${w + 2.6}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${T.casco}" stroke-width="${w}" stroke-linecap="round"/></g>`;
  const cx = 150;
  out.push(bar(`M${cx - 56},124 Q${cx - 42},164 ${cx},160 Q${cx + 42},164 ${cx + 56},124`, 'brazos'), bar(`M${cx},58 L${cx},158`, 'cana'));
  out.push(`<g data-parte="arganeo"><circle cx="${cx}" cy="44" r="10" fill="none" stroke="${m.c('arganeo')}" stroke-width="${m.w('arganeo', 3, 4.2)}"/></g>`);
  out.push(`<g data-parte="unas"><path d="M${cx - 58},108 L${cx - 72},138 L${cx - 46},132Z M${cx + 58},108 L${cx + 72},138 L${cx + 46},132Z" fill="${T.casco}" stroke="${m.c('unas')}" stroke-width="${m.w('unas', 1.4, 2.6)}"/></g>`);
  out.push(`<g data-parte="cruz"><circle cx="${cx}" cy="159" r="5.5" fill="${m.c('cruz')}"/></g>`);
  const r = (x1, y1, x2, y2, k, t, a = 'start') => `<g data-parte="${k}">${referencia(x1, y1, x2, y2, { color: m.c(k) })}${serif(x2 + (a === 'end' ? -4 : 4), y2 + 4, t, { anchor: a, weight: m.on(k) ? 700 : 400, color: m.c(k) })}</g>`;
  out.push(r(cx + 11, 44, 222, 44, 'arganeo', 'arganeo (la cadena)'), r(cx + 4, 100, 222, 100, 'cana', 'caña'), r(cx, 166, cx + 30, 186, 'cruz', 'cruz'));
  out.push(r(cx + 46, 156, 236, 160, 'brazos', 'brazo'), r(cx - 46, 156, 64, 160, 'brazos', 'brazo', 'end'), r(cx - 66, 120, 52, 108, 'unas', 'uña', 'end'), r(cx + 66, 120, 236, 128, 'unas', 'uña'));
  out.push(filete(204), cap(18, 224, 'TIPOS'));
  const ico = {
    arado: `<path d="M0,-26 L0,10"/><circle cx="0" cy="-29" r="3"/><path d="M0,30 C-6,22 -22,14 -22,0 C-12,6 -4,8 0,6 C4,8 12,6 22,0 C22,14 6,22 0,30Z" fill="${T.casco}"/>`,
    danforth: `<path d="M0,-26 L0,22"/><circle cx="0" cy="-29" r="3"/><path d="M-24,22 L24,22"/><path d="M-3,20 L-19,-10 L-9,-14 L-2,10Z M3,20 L19,-10 L9,-14 L2,10Z" fill="${T.casco}"/>`,
    rezon: '<path d="M0,-26 L0,18"/><circle cx="0" cy="-29" r="3"/><path d="M0,18 Q-20,20 -21,0 M0,18 Q20,20 21,0 M0,18 Q-9,24 -9,6 M0,18 Q9,24 9,6"/>',
    almirantazgo: `<path d="M0,-26 L0,18"/><circle cx="0" cy="-29" r="3"/><path d="M0,18 Q-20,20 -22,-2 M0,18 Q20,20 22,-2"/><path d="M-22,-6 L-26,4 L-18,2Z M22,-6 L26,4 L18,2Z" fill="${T.casco}"/>`,
  };
  [['arado', 'De arado', 'una reja'], ['danforth', 'Danforth', 'dos palas'], ['rezon', 'Rezón', '4 o 5 brazos'], ['almirantazgo', 'Almirantazgo', 'con cepo']].forEach(([k, n, nota], i) => {
    const x = 48 + i * 87;
    out.push(`<g data-parte="${k}">${m.on(k) ? recuadro(x - 40, 232, 80, 142, { on: true }) : ''}<g transform="translate(${x} 280)" fill="none" stroke="${m.c(k)}" stroke-width="${m.w(k, 2, 2.6)}" stroke-linejoin="round">${ico[k]}</g>`);
    if (k === 'almirantazgo') out.push(`<g data-parte="cepo">${linea(x - 18, 259, x + 18, 259, { color: m.c('cepo'), w: m.w('cepo', 3.5, 4.6) })}</g>`);
    out.push(centrado(x, 334, n, { weight: 700, color: m.c(k) }), centrado(x, 352, nota, { size: TXT.min, color: k === 'almirantazgo' ? m.c('cepo') : T.tinta }), '</g>');
  });
  out.push(cierra());
  return out.join('');
}

function fondeoLinea(m, pt) {
  const H = 400;
  const alt = 'Arriba, el molinete visto de frente: el barbotén con muescas que mueve la cadena, su freno y su embrague, y el cabirón liso para los cabos. A la derecha, lo que pide el RD 339/2021: línea de al menos cinco esloras, cadena de al menos una eslora y empalmes con grillete. Abajo, la línea de fondeo de perfil: estacha desde el barco, grillete, cadena en catenaria y ancla.';
  const { out: o, cierra } = lienzo(W, H, alt);
  const c = (k) => m.c(k);
  o.push(recuadro(12, 14, 180, 128));
  o.push(`<rect x="28" y="108" width="150" height="7" fill="${T.casco}" stroke="${T.tinta}"/>`, linea(32, 82, 172, 82, { w: 3 }));
  o.push(`<rect x="92" y="66" width="38" height="42" rx="3" fill="${T.casco}" stroke="${T.tinta}"/>`, centrado(111, 92, 'motor', { size: TXT.min, italic: true }));
  o.push(`<g data-parte="barboten"><rect x="48" y="62" width="28" height="44" rx="3" fill="${T.casco}" stroke="${c('barboten')}" stroke-width="${m.w('barboten', 1.3, 2.4)}"/>${[66, 73, 80, 87, 94].map((y) => `<rect x="57" y="${y}" width="10" height="3.5" fill="${c('barboten')}"/>`).join('')}</g>`);
  o.push(`<line x1="62" y1="106" x2="62" y2="136" stroke="${T.tinta}" stroke-width="3" stroke-dasharray="3.5 1.8"/>`);
  o.push(`<g data-parte="freno"><path d="M52,62 Q62,54 72,62 L86,46" fill="none" stroke="${c('freno')}" stroke-width="${m.w('freno', 2.2, 3.2)}"/><circle cx="87" cy="45" r="3.5" fill="${c('freno')}"/>${serif(92, 44, 'freno', { weight: m.on('freno') ? 700 : 400, color: c('freno') })}</g>`);
  o.push(`<g data-parte="embrague"><rect x="34" y="74" width="10" height="16" rx="2" fill="${T.casco}" stroke="${c('embrague')}" stroke-width="${m.w('embrague', 1.3, 2.4)}"/>${referencia(38, 74, 34, 40)}${serif(18, 34, 'embrague', { weight: m.on('embrague') ? 700 : 400, color: c('embrague') })}</g>`);
  o.push(`<g data-parte="cabiron"><path d="M142,64 L172,64 L164,84 L172,104 L142,104 L150,84Z" fill="${T.casco}" stroke="${c('cabiron')}" stroke-width="${m.w('cabiron', 1.3, 2.4)}"/>${centrado(157, 54, 'cabirón (liso)', { size: TXT.min, weight: m.on('cabiron') ? 700 : 400, color: c('cabiron') })}</g>`);
  o.push(`<g data-parte="barboten">${referencia(76, 100, 92, 126)}${serif(96, 130, 'barbotén', { weight: m.on('barboten') ? 700 : 400, color: c('barboten') })}</g>`);
  o.push(cap(204, 30, 'EL RD 339/2021'), serif(204, 46, 'artículo 11', { size: TXT.min, italic: true, color: T.apagado }));
  o.push(serif(204, 68, 'línea ≥ 5 × eslora', { weight: 700 }), serif(204, 88, 'cadena ≥ 1 × eslora', { weight: 700 }), serif(204, 108, 'empalmes con grillete'), serif(204, 126, 'eslora ≤ 6 m: puede'), serif(204, 142, 'ser toda de estacha'));
  const yw = 176;
  o.push(`<rect x="5" y="${yw}" width="${W - 10}" height="${H - yw - 5}" fill="${T.agua}"/>`, linea(5, yw, W - 5, yw, { color: T.lineaAgua, w: 1.4 }));
  o.push(tierra(`M5,346 Q90,338 179,344 T353,342 L353,${H - 5} L5,${H - 5}Z`, pt));
  o.push(cascoPerfil(256, yw, 92, { cabina: true }));
  o.push(`<g data-parte="estacha">${cuerda(`M258,${yw - 10} Q224,224 170,262`, { on: m.on('estacha'), w: 2.6 })}${serif(222, 236, 'estacha (cabo)', { weight: m.on('estacha') ? 700 : 400, color: c('estacha') })}</g>`);
  o.push(`<g data-parte="cadena">${cadena('M170,262 Q126,342 72,342', { color: c('cadena'), w: m.w('cadena', 3, 4) })}${serif(110, 300, 'cadena', { anchor: 'end', weight: m.on('cadena') ? 700 : 400, color: c('cadena') })}${serif(110, 316, 'en catenaria', { anchor: 'end', italic: true, size: TXT.min })}</g>`);
  o.push(anclaG(70, 342, 0.9, 90));
  o.push(`<g data-parte="grillete">${[[170, 262], [71, 342]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="${T.papel}" stroke="${c('grillete')}" stroke-width="${m.w('grillete', 1.6, 2.6)}"/>`).join('')}${serif(180, 268, 'grillete', { weight: m.on('grillete') ? 700 : 400, color: c('grillete') })}</g>`);
  o.push(serif(36, 372, 'ancla', { italic: true }));
  o.push(cierra());
  return o.join('');
}

function fondeoBorneo() {
  const H = 340;
  const alt = 'Vista desde arriba: el barco fondeado gira alrededor del ancla cuando rola el viento. El círculo de borneo tiene un radio aproximado de la cadena filada más la eslora; dentro no debe haber bajos, costa, boyas ni otros barcos.';
  const { out, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
  const [ax, ay, R] = [128, 162, 104];
  out.push(`<circle cx="${ax}" cy="${ay}" r="${R}" fill="none" stroke="${T.magenta}" stroke-width="1.8" stroke-dasharray="7 4"/>`);
  out.push(`<g opacity=".45">${cadena(`M${ax},${ay} L${ax - 60},${ay}`)}${barco(ax - 82, ay, 90, 44, { p: null })}</g>`);
    out.push(`<path d="${arcoD(ax, ay, R + 10, 172, 252)}" fill="none" stroke="${T.apagado}" stroke-width="1.4"/>`, flecha(...pol(ax, ay, 246, R + 10), ...pol(ax, ay, 256, R + 10), { color: T.apagado, w: 1.4, punta: 9 }), serif(28, 290, 'borneo', { weight: 700, color: T.apagado }));
  out.push(cadena(`M${ax},${ay} L${ax},${ay + 60}`), barco(ax, ay + 82, 0, 44, { p: null }));
  out.push(anclaG(ax, ay - 2, 0.8, 0, T.magenta), serif(ax - 10, ay - 10, 'ancla', { anchor: 'end', weight: 700, color: T.magenta }));
  const xd = ax + 20;
  out.push(cota(xd, ay, xd, ay + 60, ''), cota(xd + 22, ay, xd + 22, ay + R, ''));
  out.push(serif(xd + 4, ay + 34, 'cadena', { size: TXT.min }), serif(xd + 26, ay + R - 16, 'radio', { size: TXT.min, weight: 700, color: T.magenta }));
  out.push(flecha(300, 22, 300, 58, { color: T.azul, w: 2 }), serif(292, 40, 'viento', { anchor: 'end', color: T.azulTxt, weight: 700 }), flecha(W - 12, 88, 316, 88, { color: T.azul, w: 1.4, discontinua: true }), serif(320, 106, 'luego', { anchor: 'middle', size: TXT.min, italic: true, color: T.azulTxt }));
  const tx = 246;
  out.push(etiqueta(290, 140, 'radio ≈'), etiqueta(290, 162, 'cadena + eslora', { color: T.magenta }));
  out.push(serif(tx, 196, 'Dentro, nada:', { weight: 700 }), serif(tx, 212, 'bajos, costa,', { size: TXT.min }), serif(tx, 227, 'boyas, barcos', { size: TXT.min }));
  out.push(serif(tx, 256, 'Menos borneo:', { weight: 700 }), serif(tx, 272, 'menos cadena', { size: TXT.min }), serif(tx, 287, 'o una 2.ª ancla', { size: TXT.min }));
  out.push(cierra());
  return out.join('');
}

function fondeoGarreo(pt) {
  const H = 360;
  const alt = 'Dos perfiles. Arriba, con cadena suficiente: la cadena llega tumbada al fondo, el tiro es horizontal y el ancla trabaja clavada. Abajo, con poca cadena: el tiro va hacia arriba, desclava el ancla y el barco garrea, deriva arrastrándola.';
  const { out, cierra } = lienzo(W, H, alt);
  const panel = (y0, bueno) => {
    const yw = y0 + 36;
    const yb = y0 + 118;
    const o = [`<rect x="5" y="${yw}" width="${W - 10}" height="${yb - yw}" fill="${T.agua}"/>`, linea(5, yw, W - 5, yw, { color: T.lineaAgua, w: 1.4 }), tierra(`M5,${yb} L${W - 5},${yb} L${W - 5},${yb + 16} L5,${yb + 16}Z`, pt)];
    o.push(bueno ? bien(22, y0 + 16, 6) : tacha(22, y0 + 16, 6), serif(36, y0 + 21, bueno ? 'Bien: cadena suficiente' : 'Garrea: poca cadena', { weight: 700, color: bueno ? T.verdeTxt : T.magenta }));
    if (bueno) o.push(flecha(276, yw + 30, 330, yw + 30, { color: T.azul, w: 1.8 }), serif(303, yw + 22, 'viento', { anchor: 'middle', color: T.azulTxt, size: TXT.min }));
    if (bueno) {
      o.push(cascoPerfil(250, yw, 76), cadena(`M252,${yw - 10} Q206,${yb} 130,${yb - 2} L64,${yb - 2}`), anclaG(62, yb - 2, 0.8, 90));
      o.push(serif(90, yb - 38, 'tiro horizontal:', { size: TXT.min, weight: 700 }), serif(90, yb - 22, 'el ancla clava', { size: TXT.min }));
    } else {
      o.push(cascoPerfil(170, yw, 76), cadena(`M172,${yw - 10} Q150,${yw + 32} 118,${yb - 15}`, { color: T.magenta }), anclaG(118, yb - 15, 0.8, 52));
      o.push(`<path d="M34,${yb - 1} L92,${yb - 1}" stroke="${T.apagado}" stroke-width="1.6" stroke-dasharray="5 4"/>`, flecha(76, yb - 24, 106, yb - 24, { color: T.magenta, w: 2 }));
      o.push(serif(16, yw + 24, 'tira hacia arriba', { weight: 700, color: T.magenta, size: TXT.min }), serif(16, yw + 40, 'y la desclava', { weight: 700, color: T.magenta, size: TXT.min }));
      o.push(serif(246, yb - 30, 'el barco deriva', { size: TXT.min }), flecha(252, yb - 46, 290, yb - 46, { color: T.magenta, w: 1.8 }));
    }
    return o.join('');
  };
  out.push(panel(10, true), filete(176), panel(182, false));
  out.push(cierra());
  return out.join('');
}

function fondeoOrinque(m, pt) {
  const H = 350;
  const alt = 'Perfil de un fondeo en piedra: el ancla, enrocada, lleva afirmado a su cruz el orinque, un cabo que sube hasta un boyarín en la superficie. Si se enroca, tirando del orinque sale por la cruz. El orinque debe ser más largo que la profundidad en pleamar.';
  const { out, cierra } = lienzo(W, H, alt);
  out.push(centrado(179, 32, 'orinque más largo que la profundidad en pleamar', { weight: 700 }));
  const yw = 72;
  const yb = 290;
  out.push(`<rect x="5" y="${yw}" width="${W - 10}" height="${H - yw - 5}" fill="${T.agua}"/>`, linea(5, yw, W - 5, yw, { color: T.lineaAgua, w: 1.4 }), serif(190, yw - 6, 'pleamar', { anchor: 'middle', italic: true, size: TXT.min, color: T.azulTxt }));
  out.push(tierra(`M5,${yb} L80,${yb} Q88,${yb - 18} 104,${yb - 14} Q112,${yb - 22} 124,${yb} L${W - 5},${yb} L${W - 5},${H - 5} L5,${H - 5}Z`, pt));
  out.push(cascoPerfil(258, yw, 82), cadena(`M260,${yw - 10} Q220,${yb - 12} 166,${yb - 2} L114,${yb - 2}`), serif(234, 190, 'cadena', { size: TXT.min, italic: true }));
  out.push(anclaG(112, yb - 2, 0.95, 75));
  const [cx, cy] = cruzDe(112, yb - 2, 0.95, 75);
  out.push(`<g data-parte="cruz"><circle cx="${f1(cx)}" cy="${f1(cy)}" r="3.4" fill="${m.c('cruz')}"/>${centrado(cx - 6, cy + 24, 'cruz del ancla', { size: TXT.min, weight: m.on('cruz') ? 700 : 400, color: m.c('cruz') })}</g>`);
  out.push(`<g data-parte="orinque">${cuerda(`M${f1(cx)},${f1(cy)} C${f1(cx - 30)},${f1(cy - 70)} 44,176 64,${yw + 4}`, { on: m.on('orinque'), w: 2.6 })}${serif(56, 140, 'orinque', { anchor: 'end', weight: 700, color: m.c('orinque') })}</g>`);
  out.push(`<g data-parte="boyarin"><ellipse cx="64" cy="${yw - 1}" rx="10" ry="8" fill="${T.naranja}" stroke="${m.c('boyarin')}" stroke-width="${m.w('boyarin', 1.3, 2.6)}"/>${serif(80, yw - 8, 'boyarín', { weight: 700, color: m.c('boyarin') })}</g>`);
  out.push(cota(20, yw + 4, 20, yb - 4, ''), `<text x="34" y="${(yw + yb) / 2}" font-size="${TXT.min}" text-anchor="middle" fill="${T.tinta}" class="lc-serif" transform="rotate(-90 34 ${(yw + yb) / 2})">profundidad</text>`);
  out.push(flecha(96, 212, 96, 186, { color: T.verdeTxt, w: 2 }), serif(104, 194, 'si se enroca, tiras', { weight: 700, color: T.verdeTxt, size: TXT.min }), serif(104, 209, 'y sale por la cruz', { weight: 700, color: T.verdeTxt, size: TXT.min }));
  out.push(serif(180, yb + 26, 'fondo de piedra', { italic: true, size: TXT.min }));
  out.push(cierra());
  return out.join('');
}

function fondeoVoces(m, pt) {
  const H = 372;
  const alt = 'Siete viñetas de perfil con las voces de la maniobra. Al fondear: a la pendura (el ancla cuelga sin tocar fondo), dar fondo y filar (largar cadena). Al levar: virar (recoger), a pique (cadena vertical con el ancla aún en el fondo), zarpa (se despega) y clara (asoma limpia).';
  const { out, id, cierra } = lienzo(W, H, alt);
  const vin = (k, x0, y0, w, nombre, nota) => {
    const h = 90;
    const yw = y0 + 28;
    const yb = y0 + h - 10;
    const cid = `${id}-${k}`;
    const o = [`<g data-parte="${k}"><clipPath id="${cid}"><rect x="${x0}" y="${y0}" width="${w}" height="${h}"/></clipPath>`];
    o.push(`<g clip-path="url(#${cid})"><rect x="${x0}" y="${yw}" width="${w}" height="${h}" fill="${T.agua}"/>${tierra(`M${x0},${yb} L${x0 + w},${yb} L${x0 + w},${y0 + h} L${x0},${y0 + h}Z`, pt)}`);
    const bx = { pendura: 0.3, fondo: 0.3, filar: 0.55, virar: 0.5, pique: 0.3, zarpa: 0.3, clara: 0.3 }[k];
    const xb = x0 + w * bx;
    o.push(cascoPerfil(xb, yw, w * 0.78, { cabina: false }), '</g>', recuadro(x0, y0, w, h, { on: m.on(k) }));
    const ax = xb + 1;
    const top = yw - 9;
    if (k === 'pendura') o.push(cadena(`M${ax},${top} L${ax},${yw - 6}`, { w: 2.4 }), anclaG(ax, yw - 4, 0.55));
    if (k === 'clara') o.push(cadena(`M${ax},${top} L${ax},${yw}`, { w: 2.4 }), anclaG(ax, yw + 1, 0.55));
    if (k === 'fondo') o.push(cadena(`M${ax},${top} L${ax},${yb - 13}`, { w: 2.4 }), anclaG(ax, yb - 13, 0.55), flecha(ax + 11, yw + 6, ax + 11, yw + 28, { color: T.magenta, w: 1.6 }));
    if (k === 'pique') o.push(cadena(`M${ax},${top} L${ax},${yb - 13}`, { w: 2.4 }), anclaG(ax, yb - 13, 0.55));
    if (k === 'zarpa') o.push(cadena(`M${ax},${top} L${ax},${yb - 24}`, { w: 2.4 }), anclaG(ax, yb - 24, 0.55), flecha(ax + 11, yb - 4, ax + 11, yb - 24, { color: T.magenta, w: 1.6 }));
    if (k === 'filar' || k === 'virar') {
      const axx = x0 + 18;
      o.push(cadena(`M${ax},${top} Q${ax - 10},${yb - 2} ${axx + 14},${yb - 2}`, { w: 2.4 }), anclaG(axx + 12, yb - 2, 0.5, 90));
      o.push(k === 'filar' ? flecha(xb + 6, yw - 24, xb + 28, yw - 24, { color: T.magenta, w: 1.6 }) : flecha(xb + 28, yw - 24, xb + 6, yw - 24, { color: T.magenta, w: 1.6 }));
    }
    o.push(centrado(x0 + w / 2, y0 + h + 17, nombre, { weight: 700, color: m.c(k) }), centrado(x0 + w / 2, y0 + h + 33, nota, { size: TXT.min, italic: true }), '</g>');
    return o.join('');
  };
  out.push(cap(14, 28, 'AL FONDEAR'));
  [['pendura', 'a la pendura', 'sin tocar fondo'], ['fondo', 'dar fondo', 'toca el fondo'], ['filar', 'filar', 'largar cadena']].forEach(([k, n, t], i) => out.push(vin(k, 12 + i * 113, 36, 108, n, t)));
  out.push(cap(14, 196, 'AL LEVAR'));
  [['virar', 'virar', 'recoger'], ['pique', 'a pique', 'vertical'], ['zarpa', 'zarpa', 'se despega'], ['clara', 'clara', 'asoma limpia']].forEach(([k, n, t], i) => out.push(vin(k, 12 + i * 84.5, 204, 80, n, t)));
  out.push(cierra());
  return out.join('');
}

export function fondeoC(spec = {}) {
  const v = spec.vista ?? 'ancla';
  const todas = [...PARTES_ANCLA, ...PARTES_LINEA, ...PARTES_ORINQUE, ...VOCES];
  const m = marca(spec, todas);
  if (v === 'linea') return { svg: conPunteado(fondeoLinea, m), caption: 'El barbotén (con muescas) mueve la cadena; el cabirón, liso, es para cabos. La línea de fondeo debe medir al menos 5 esloras, con un tramo de cadena de al menos 1 eslora y grilletes en los empalmes; la cadena forma la catenaria, que amortigua los tirones.' };
  if (v === 'borneo') return { svg: fondeoBorneo(), caption: 'Al rolar el viento o la corriente, el barco gira alrededor del ancla. Prevé un radio ≈ cadena filada + eslora (por exceso) sin bajos, costa, boyas ni barcos dentro. Se reduce filando menos cadena o fondeando una segunda ancla; dar máquina no lo cambia.' };
  if (v === 'garreo') return { svg: conPunteado((_, p) => fondeoGarreo(p), m), caption: 'Con cadena suficiente el tiro llega horizontal y el ancla trabaja tumbada y clavada. Con poca cadena el tiro va hacia arriba, desclava el ancla y el barco garrea: deriva arrastrándola. Otras causas: mal tenedero, mala maniobra, más viento del previsto o ancla sucia.' };
  if (v === 'orinque') return { svg: conPunteado(fondeoOrinque, m), caption: 'El orinque es un cabo afirmado a la cruz del ancla con un boyarín (o cualquier flotador visible) en la otra punta. Señala dónde está el ancla y, si se enroca, tirando de él sale «al revés», por la cruz. Debe ser algo más largo que la profundidad en pleamar.' };
  if (v === 'voces') return { svg: conPunteado(fondeoVoces, m), caption: 'Al fondear: a la pendura (cuelga sin tocar fondo), dar fondo y filar. Al levar: virar (dando avante muy suave hacia el ancla), a pique (cadena vertical con el ancla aún en el fondo), zarpa (se despega) y clara; después, levada y estibada.' };
  return { svg: fondeoAncla(m), caption: 'Ancla sin cepo: arganeo (donde se une la cadena con un grillete), caña, cruz, brazos y uñas. La de almirantazgo añade el cepo, una barra junto al arganeo. En foto: una reja es de arado; dos palas anchas, Danforth.' };
}
/** Vistas que reciben el punteado de la tierra como parámetro: se dibujan con un marcador y se cambia por el url(#…-pt) de su lienzo. */
function conPunteado(fn, m) {
  const svg = fn(m, '__PT__');
  const id = svg.match(/<pattern id="([^"]+)-pt"/)?.[1];
  return svg.replaceAll('__PT__', `url(#${id}-pt)`);
}

// ===========================================================================
// Estructura del casco (per-1-3) y vías de agua (per-8-5)

export const ESTRUCTURA = ['quilla', 'roda', 'codaste', 'cuadernas', 'baos', 'trancanil', 'borda', 'regala', 'mamparos', 'plan', 'sentina', 'grifos-fondo'];

function perfilCasco(m, vias, y0) {
  const sx = 358 / 320;
  const X = (x) => f1(x * sx);
  const Y = (y) => f1(y + y0);
  const st = (k, w) => `stroke="${m.c(k)}" stroke-width="${m.on(k) ? w + 1.2 : w}"`;
  const dy = (x) => 52 - (6 * (x - 20)) / 276;
  const o = [`<rect x="5" y="${Y(70)}" width="${W - 10}" height="58" fill="${T.agua}"/>`];
  o.push(`<path d="M${X(20)},${Y(52)} L${X(296)},${Y(46)} Q${X(290)},${Y(92)} ${X(262)},${Y(108)} L${X(70)},${Y(108)} L${X(70)},${Y(78)} L${X(24)},${Y(72)} Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.4"/>`);
  o.push(`<g data-parte="cuadernas">${[128, 148, 168, 188, 208, 228].map((x) => `<line x1="${X(x)}" y1="${Y(dy(x) + 1)}" x2="${X(x)}" y2="${Y(107)}" ${st('cuadernas', 1)}/>`).join('')}</g>`);
  o.push(`<g data-parte="mamparos">${[112, 248].map((x) => `<line x1="${X(x)}" y1="${Y(dy(x) + 1)}" x2="${X(x)}" y2="${Y(x > 200 ? 101 : 107)}" ${st('mamparos', 2.6)}/>`).join('')}</g>`);
  o.push(`<g data-parte="sentina"><rect x="${X(72)}" y="${Y(98)}" width="${f1(186 * sx)}" height="9" fill="${T.azul}" fill-opacity="${m.on('sentina') ? 0.6 : 0.3}"${m.on('sentina') ? ` stroke="${T.magenta}" stroke-width="1.6"` : ''}/></g>`);
  o.push(`<g data-parte="plan"><line x1="${X(72)}" y1="${Y(98)}" x2="${X(258)}" y2="${Y(98)}" ${st('plan', 1.4)}/></g>`);
  o.push(`<rect x="${X(84)}" y="${Y(84)}" width="${f1(24 * sx)}" height="14" rx="2" fill="${T.apagado}" stroke="${T.tinta}" stroke-width=".8"/>`);
  o.push(linea(84 * sx, 94 + y0, 62 * sx, 94 + y0, { w: 1.6 }), `<ellipse cx="${X(62)}" cy="${Y(94)}" rx="2" ry="7" fill="${T.apagado}" stroke="${T.tinta}" stroke-width=".8"/>`);
  o.push(`<path d="M${X(42)},${Y(80)} L${X(54)},${Y(80)} L${X(54)},${Y(112)} L${X(34)},${Y(110)} Q${X(28)},${Y(96)} ${X(32)},${Y(82)} Z" fill="${T.apagado}" stroke="${T.tinta}"/>`, linea(42 * sx, dy(42) + y0, 42 * sx, 82 + y0, { w: 1.6 }));
  o.push(`<g data-parte="grifos-fondo" ${st('grifos-fondo', 1.2)}><path d="M${X(146)},${Y(99)} L${X(154)},${Y(105)} L${X(154)},${Y(99)} L${X(146)},${Y(105)} Z" fill="${m.c('grifos-fondo')}"/><line x1="${X(150)}" y1="${Y(105)}" x2="${X(150)}" y2="${Y(110)}"/><line x1="${X(150)}" y1="${Y(99)}" x2="${X(150)}" y2="${Y(90)}"/></g>`);
  o.push(`<g data-parte="quilla"><line x1="${X(70)}" y1="${Y(108)}" x2="${X(262)}" y2="${Y(108)}" ${st('quilla', 4)} stroke-linecap="round"/></g>`);
  o.push(`<g data-parte="codaste"><line x1="${X(70)}" y1="${Y(108)}" x2="${X(70)}" y2="${Y(78)}" ${st('codaste', 4)} stroke-linecap="round"/></g>`);
  o.push(`<g data-parte="roda"><path d="M${X(262)},${Y(108)} Q${X(290)},${Y(92)} ${X(296)},${Y(46)}" fill="none" ${st('roda', 4)} stroke-linecap="round"/></g>`);
  o.push(linea(20 * sx, 70 + y0, 300 * sx, 70 + y0, { color: T.lineaAgua, w: 1, extra: 'stroke-dasharray="4 3"' }));
  if (vias) o.push(punto(22 * sx, 62 + y0, { r: 2.6 }));
  return { o, X, Y };
}

function estructuraPartes(m) {
  const H = 374;
  const alt = 'Arriba, el casco de costado: quilla abajo de proa a popa, roda a proa, codaste a popa, cuadernas transversales, mamparos (el de proa es el de colisión), el plan sobre la sentina y un grifo de fondo. Abajo, una sección transversal con la regala, la borda, el trancanil, el bao bajo la cubierta, la cuaderna, el plan, la sentina y la quilla.';
  const { out, cierra } = lienzo(W, H, alt);
  const y0 = 20;
  const { o, X, Y } = perfilCasco(m, false, y0);
  out.push(...o, cap(14, 24, 'DE COSTADO'));
  const r = (k, x1, y1, x2, y2, t, a = 'middle') => `<g data-parte="${k}">${referencia(x1, y1, x2, y2, { color: m.c(k) })}${serif(x2, y2 + (y2 < y1 ? -4 : 14), t, { anchor: a, size: TXT.min, weight: m.on(k) ? 700 : 400, color: m.c(k) })}</g>`;
  out.push(r('mamparos', +X(112), +Y(54), 112, 50, 'mamparo'), r('cuadernas', +X(168), +Y(62), 196, 50, 'cuadernas'), r('mamparos', +X(248), +Y(54), 292, 50, 'm. de colisión'));
  out.push(r('codaste', +X(70), +Y(110), 70, 140, 'codaste'), r('grifos-fondo', +X(150), +Y(110), 162, 140, 'grifo de fondo'), r('quilla', +X(230), +Y(110), 250, 140, 'quilla'), r('roda', +X(292), +Y(84), 336, 98, 'roda', 'end'));
  out.push(filete(170), cap(14, 190, 'SECCIÓN'));
  const sx = 96;
  const yS = 190;
  const S = (y) => y + yS - 150;
  out.push(`<rect x="14" y="${S(226)}" width="162" height="${S(290) - S(226)}" fill="${T.agua}"/>`);
  out.push(`<path d="M40,${S(168)} L40,${S(190)} C40,${S(240)} 70,${S(270)} ${sx},${S(276)} C122,${S(270)} 152,${S(240)} 152,${S(190)} L152,${S(168)} Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.4"/>`);
  out.push(`<g data-parte="cuadernas"><path d="M45,${S(192)} C45,${S(238)} 72,${S(264)} ${sx},${S(270)} C120,${S(264)} 147,${S(238)} 147,${S(192)}" fill="none" stroke="${m.c('cuadernas')}" stroke-width="${m.w('cuadernas', 2, 3)}"/></g>`);
  out.push(`<g data-parte="sentina"><path d="M56,${S(250)} C68,${S(262)} 82,${S(268)} ${sx},${S(269)} C110,${S(268)} 124,${S(262)} 136,${S(250)} Z" fill="${T.azul}" fill-opacity="${m.on('sentina') ? 0.6 : 0.3}"${m.on('sentina') ? ` stroke="${T.magenta}" stroke-width="1.6"` : ''}/></g>`);
  out.push(`<g data-parte="plan">${linea(56, S(250), 136, S(250), { color: m.c('plan'), w: m.w('plan', 1.6, 2.6) })}</g>`);
  out.push(`<g data-parte="baos"><path d="M42,${S(196)} Q${sx},${S(186)} 150,${S(196)}" fill="none" stroke="${m.c('baos')}" stroke-width="${m.w('baos', 3, 4)}"/></g>`, `<path d="M40,${S(190)} Q${sx},${S(181)} 152,${S(190)}" fill="none" stroke="${T.tinta}" stroke-width="1.6"/>`);
  for (const x of [40, 152]) {
    out.push(`<g data-parte="borda">${linea(x, S(190), x, S(170), { color: m.c('borda'), w: m.w('borda', 1.6, 2.6) })}</g>`);
    out.push(`<g data-parte="regala"><rect x="${x - 4}" y="${S(164)}" width="8" height="6" rx="1.5" fill="${m.c('regala')}"/></g>`, `<g data-parte="trancanil"><circle cx="${x}" cy="${S(190)}" r="${m.on('trancanil') ? 4 : 2.8}" fill="${m.c('trancanil')}"/></g>`);
  }
  out.push(`<g data-parte="quilla"><rect x="${sx - 6}" y="${S(274)}" width="12" height="12" rx="1.5" fill="${m.c('quilla')}"/></g>`);
  out.push(linea(18, S(226), 172, S(226), { color: T.lineaAgua, w: 1, extra: 'stroke-dasharray="4 3"' }));
  const L = [['regala', 'regala', 214, 156, 167], ['borda', 'borda', 232, 153, 180], ['trancanil', 'trancanil', 250, 155, 190], ['baos', 'bao', 268, 132, 193], ['cuadernas', 'cuaderna', 286, 145, 226], ['plan', 'plan', 304, 132, 250], ['sentina', 'sentina', 322, 120, 260], ['quilla', 'quilla', 340, 102, 281]];
  for (const [k, t, y, px, py] of L) out.push(`<g data-parte="${k}">${referencia(px, S(py), 214, y - 4, { color: m.c(k) })}${serif(218, y, t, { weight: m.on(k) ? 700 : 400, color: m.c(k) })}</g>`);
  out.push(cierra());
  return out.join('');
}

function estructuraVias(m) {
  const H = 330;
  const alt = 'El casco de costado con cuatro puntos numerados por donde puede entrar el agua: 1, la bocina, paso del eje de la hélice; 2, la limera, paso de la mecha del timón; 3, los grifos de fondo y pasacascos; 4, el escape del motor. La hélice no, porque está fuera del casco.';
  const { out, cierra } = lienzo(W, H, alt);
  const { o, X, Y } = perfilCasco(m, true, 20);
  out.push(...o);
  const num = (n, bx, by, px, py) => `${linea(bx, by, px, py, { color: T.magenta, w: 1.2 })}${punto(px, py, { r: 2.6, color: T.magenta })}${paso(bx, by, n)}`;
  out.push(num(1, 96, +Y(126), +X(70), +Y(94)), num(2, 46, 24, +X(42), +Y(74)), num(3, 168, +Y(126), +X(150), +Y(108)), num(4, 14 + 6, 24, +X(22), +Y(62)));
  out.push(panelNotas(166, H));
  [['1', 'Bocina: paso del eje de la hélice'], ['2', 'Limera: paso de la mecha del timón'], ['3', 'Grifos de fondo y pasacascos'], ['4', 'Escape del motor (puede agrietarse)']].forEach(([n, t], i) => out.push(paso(26, 190 + i * 26, n), serif(42, 194 + i * 26, t)));
  out.push(tacha(26, 296, 5), serif(42, 300, 'La hélice no: está fuera del casco.', { italic: true, color: T.apagado }));
  out.push(cierra());
  return out.join('');
}

const CAP_ESTRUCTURA = {
  quilla: 'Quilla: la pieza longitudinal que recorre el casco de proa a popa por su parte más baja; sobre ella se montan las cuadernas.',
  roda: 'Roda: continúa la quilla hacia proa y forma el «filo» de la proa.',
  codaste: 'Codaste: continúa la quilla hacia popa; en él se apoya el timón y por esa zona sale el eje de la hélice.',
  cuadernas: 'Cuadernas: las «costillas» transversales que salen de la quilla y dan forma al casco.',
  baos: 'Baos: vigas de banda a banda que sostienen la cubierta; tienen una ligera curva hacia arriba para que el agua corra a los costados.',
  trancanil: 'Trancanil: la zona de unión de la cubierta con el costado.',
  borda: 'Borda: la parte del costado que queda por encima de la cubierta, desde esta hasta la regala.',
  regala: 'Regala: la pieza que remata la borda por arriba; refuerzo longitudinal en la parte alta del casco.',
  mamparos: 'Mamparos: tabiques que dividen el interior; si son estancos, limitan una inundación. El primero de proa es el mamparo de colisión.',
  plan: 'Plan: el piso más bajo del interior.',
  sentina: 'Sentina: debajo del plan, la parte más baja del casco, donde se acumula el agua; se vacía con las bombas de achique.',
  'grifos-fondo': 'Grifos de fondo: válvulas por debajo de la flotación que dejan pasar agua de mar; ciérralos al dejar el barco.',
};

export function estructuraC(spec = {}) {
  if (spec.vista === 'vias-agua') return { svg: estructuraVias(marca({}, [])), caption: 'El agua entra casi siempre por donde algo atraviesa el casco: la bocina del eje, la limera del timón, los grifos de fondo y pasacascos, y el escape. Cierra los grifos de fondo que no uses.' };
  const m = marca(spec, ESTRUCTURA);
  return { svg: estructuraPartes(m), caption: m.texto(CAP_ESTRUCTURA, 'Quilla: longitudinal, abajo. Baos: transversales, sostienen la cubierta. Regala: longitudinal, arriba, remata la borda.') };
}

// ===========================================================================
// El viento: rolar y las palabras de la intensidad; instrumentos (per-9-3)

export const PALABRAS_VIENTO = {
  refrescar: ['Refrescar', 'sube y se mantiene', [[0, 9], [40, 9], [52, 22], [100, 22]]],
  caer: ['Caer (amainar)', 'baja y se mantiene', [[0, 22], [40, 22], [52, 9], [100, 9]]],
  calmar: ['Calmar', 'cesa del todo o casi', [[0, 16], [40, 16], [56, 1], [100, 1]]],
  racha: ['Racha', 'subida brusca y breve', [[0, 10], [42, 10], [48, 25], [54, 10], [100, 10]]],
  racheado: ['Racheado', 'sube y baja sin parar', [[0, 10], [10, 22], [20, 8], [30, 20], [40, 12], [50, 24], [60, 9], [70, 21], [80, 11], [90, 23], [100, 10]]],
};

function vocabulario(hl) {
  const H = 408;
  const alt = 'Arriba, la dirección: en una rosa, el viento rola del SW al W y se mantiene en la nueva dirección; se nombra por de dónde viene. Abajo, la intensidad: cinco gráficas de fuerza frente al tiempo para refrescar, caer o amainar, calmar, racha y racheado.';
  const { out, cierra } = lienzo(W, H, alt);
  const on = (k) => hl.has(k);
  const fr = on('rolar');
  out.push(`<g data-parte="rolar"${hl.size && !fr ? ' opacity=".45"' : ''}>${recuadro(12, 14, W - 24, 130, { on: fr })}${cap(140, 36, 'DIRECCIÓN')}`);
  const [cx, cy] = [72, 82];
  out.push(`<circle cx="${cx}" cy="${cy}" r="40" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1"/>`);
  for (const [d, t] of [[0, 'N'], [90, 'E'], [180, 'S'], [270, 'W']]) { const [x, y] = pol(cx, cy, d, 50); out.push(centrado(x, y + 4, t, { weight: 700, size: TXT.min })); }
  out.push(flecha(...pol(cx, cy, 225, 38), cx - 3, cy + 3, { color: T.apagado, w: 1.6, discontinua: true }), flecha(...pol(cx, cy, 270, 38), cx - 4, cy, { color: T.azul, w: 2.4 }));
  out.push(`<path d="${arcoD(cx, cy, 28, 232, 262)}" fill="none" stroke="${T.magenta}" stroke-width="1.8"/>`);
  out.push(serif(140, 60, 'Rolar: cambia de dirección', { weight: 700, color: fr ? T.magenta : T.tinta }), serif(140, 78, 'y se mantiene en la nueva.', { size: TXT.min }), serif(140, 96, 'Aquí, del SW (a trazos)', { size: TXT.min }), serif(140, 112, 'al W (azul).', { size: TXT.min }), serif(140, 132, 'Se nombra por de dónde viene.', { size: TXT.min, weight: 700 }), '</g>');
  out.push(cap(14, 170, 'INTENSIDAD'), serif(W - 14, 170, 'fuerza frente al tiempo', { anchor: 'end', size: TXT.min, italic: true, color: T.apagado }));
  Object.entries(PALABRAS_VIENTO).forEach(([k, [nom, desc, p]], i) => {
    const x = 12 + (i % 2) * 170;
    const y = 180 + Math.floor(i / 2) * 64;
    const f = on(k);
    out.push(`<g data-parte="${k}"${hl.size && !f ? ' opacity=".45"' : ''}>${recuadro(x, y, 164, 58, { on: f })}${serif(x + 8, y + 22, nom, { weight: 700, color: f ? T.magenta : T.tinta })}${serif(x + 8, y + 44, desc, { size: TXT.min })}`);
    const gx = x + 112;
    const gy = y + 30;
    out.push(linea(gx, gy, gx + 44, gy, { color: T.apagado, w: 0.8 }), linea(gx, gy, gx, gy - 22, { color: T.apagado, w: 0.8 }));
    out.push(`<polyline points="${pts(p.map(([px, py]) => [gx + 2 + px * 0.42, gy - 1 - py * 0.8]))}" fill="none" stroke="${f ? T.magenta : T.azul}" stroke-width="2" stroke-linejoin="round"/></g>`);
  });
  out.push(serif(190, 334, '«Refrescar» no habla', { size: TXT.min, italic: true }), serif(190, 350, 'de temperatura.', { size: TXT.min, italic: true }));
  out.push(panelNotas(372, H), serif(18, 394, 'Rolar es dirección; lo demás, intensidad.', { weight: 700 }));
  out.push(cierra());
  return out.join('');
}

function instrumentosViento() {
  const H = 300;
  const alt = 'Tres instrumentos con el viento soplando del W: el anemómetro de cazoletas mide la velocidad; la veleta, con la punta hacia el W, indica de dónde viene; el catavientos, una manga que se llena y se tiende hacia sotavento, también indica la dirección. Ninguno mide la presión.';
  const { out, cierra } = lienzo(W, H, alt);
  out.push(flecha(24, 30, 130, 30, { color: T.azul, w: 2.2 }), serif(138, 35, 'viento (del W)', { color: T.azulTxt, weight: 700 }));
  const base = 176;
  const [ax, ay] = [62, 106];
  out.push(linea(ax, ay, ax, base, { w: 2 }), ...[0, 120, 240].map((d) => { const [x, y] = pol(ax, ay, d, 24); return linea(ax, ay, x, y, { w: 1.6 }) + `<circle cx="${f1(x)}" cy="${f1(y)}" r="6.5" fill="${T.amarillo}" stroke="${T.tinta}"/>`; }), punto(ax, ay, { r: 3 }));
  out.push(centrado(ax, 200, 'Anemómetro', { weight: 700 }), centrado(ax, 218, 'mide la velocidad', { size: TXT.min }), centrado(ax, 234, '(nudos)', { size: TXT.min, italic: true }));
  const [vx, vy] = [179, 106];
  out.push(linea(vx, vy, vx, base, { w: 2 }), `<path d="M${vx - 32},${vy} L${vx - 21},${vy - 7} L${vx - 21},${vy + 7}Z" fill="${T.azul}"/>`, linea(vx - 23, vy, vx + 22, vy, { w: 2 }), `<path d="M${vx + 14},${vy} L${vx + 32},${vy - 13} L${vx + 32},${vy + 13}Z" fill="${T.apagado}"/>`, punto(vx, vy, { r: 3 }));
  out.push(serif(vx - 32, vy - 14, 'apunta al W', { size: TXT.min, color: T.azulTxt }));
  out.push(centrado(vx, 200, 'Veleta', { weight: 700 }), centrado(vx, 218, 'indica la dirección', { size: TXT.min }), centrado(vx, 234, '(de dónde viene)', { size: TXT.min, italic: true }));
  const [cx, cy] = [288, 100];
  out.push(linea(cx - 16, cy - 6, cx - 16, base, { w: 2 }), `<path d="M${cx - 14},${cy - 11} L${cx + 40},${cy - 4} L${cx + 40},${cy + 7} L${cx - 14},${cy + 13}Z" fill="${T.naranja}" stroke="${T.tinta}"/>`, `<path d="M${cx + 4},${cy - 9} L${cx + 4},${cy + 11} M${cx + 22},${cy - 6} L${cx + 22},${cy + 9}" stroke="${T.blanco}" stroke-width="4"/>`, `<ellipse cx="${cx - 14}" cy="${cy + 1}" rx="3" ry="12" fill="none" stroke="${T.tinta}" stroke-width="1.5"/>`);
  out.push(centrado(cx, 200, 'Catavientos', { weight: 700 }), centrado(cx, 218, 'indica la dirección', { size: TXT.min }), centrado(cx, 234, '(manga o cintas)', { size: TXT.min, italic: true }));
  out.push(linea(14, base, W - 14, base, { w: 0.8 }));
  out.push(panelNotas(248, H), serif(18, 268, 'Navegando, el anemómetro mide el viento aparente.', { size: TXT.min }), serif(18, 288, 'Ninguno mide la presión: eso es el barómetro.', { weight: 700 }));
  out.push(cierra());
  return out.join('');
}

export function rolarC(spec = {}) {
  const vista = spec.vista ?? 'vocabulario';
  if (vista === 'vocabulario') {
    const hl = new Set(lista(spec.resaltar));
    for (const k of hl) if (k !== 'rolar' && !PALABRAS_VIENTO[k]) return null;
    const CAP = {
      rolar: 'Rolar: el viento cambia de dirección y se mantiene en la nueva, por ejemplo del SW al W.',
      refrescar: 'Refrescar: la intensidad del viento aumenta y se mantiene. No tiene nada que ver con la temperatura.',
      caer: 'Caer (o amainar): la intensidad del viento disminuye y se mantiene.',
      calmar: 'Calmar: el viento cesa del todo o casi.',
      racha: 'Racha: aumento brusco y breve de la intensidad.',
      racheado: 'Viento racheado: la intensidad sube y baja continuamente, a golpes.',
    };
    return { svg: vocabulario(hl), caption: hl.size === 1 ? CAP[[...hl][0]] : 'Rolar habla de dirección: el viento cambia de dónde viene. Refrescar, caer, calmar, racha y racheado hablan de intensidad.' };
  }
  if (vista === 'instrumentos') return { svg: instrumentosViento(), caption: 'El anemómetro mide la velocidad del viento y no da la dirección; la veleta y el catavientos indican de dónde viene, pero no su fuerza.' };
  return null;
}

// ===========================================================================
// Cabos (per-7-1): partes, hacer firme en una cornamusa, amarrar por seno y encapillar

export const CABO = ['chicote', 'firme', 'seno', 'gaza'];
const CAP_CABO = {
  chicote: 'Chicote: cada uno de los dos extremos del cabo.',
  firme: 'Firme: la parte que trabaja, la que soporta la tensión.',
  seno: 'Seno: la parte intermedia, cuando forma una curva o un arco.',
  gaza: 'Gaza: un ojo fijo hecho en un extremo, con una costura o con un nudo; si va a rozar, se protege con un guardacabos.',
};

function caboPartes(m) {
  const H = 236;
  const alt = 'Un cabo con su gaza y guardacabos encapillada en un noray, el firme tenso que soporta la tensión hasta la cornamusa de a bordo, el seno que cuelga en curva y el chicote libre en el extremo.';
  const { out, cierra } = lienzo(W, H, alt);
  const Y = 96;
  out.push(`<circle cx="40" cy="${Y}" r="10" fill="${T.apagado}" stroke="${T.tinta}" stroke-width="1.2"/>`);
  out.push(`<g data-parte="gaza">${cuerda(`M92,${Y} L76,${Y} C60,${Y - 20} 24,${Y - 22} 24,${Y} C24,${Y + 22} 60,${Y + 20} 76,${Y}`, { on: m.on('gaza') })}<path d="M72,${Y} C58,${Y - 12} 30,${Y - 12} 30,${Y} C30,${Y + 12} 58,${Y + 12} 72,${Y}" fill="none" stroke="${T.apagado}" stroke-width="1.6"/></g>`);
  out.push(`<rect x="76" y="${Y - 4}" width="16" height="8" rx="2" fill="${T.tinta}" opacity=".55"/>`);
  out.push(`<g data-parte="firme">${cuerda(`M92,${Y} L236,${Y}`, { on: m.on('firme') })}${flecha(170, Y + 16, 120, Y + 16, { color: m.c('firme', T.apagado), w: 1.4 })}${flecha(170, Y + 16, 220, Y + 16, { color: m.c('firme', T.apagado), w: 1.4 })}</g>`);
  out.push(`<rect x="230" y="${Y - 6}" width="38" height="9" rx="4.5" fill="${T.apagado}" stroke="${T.tinta}"/>`, cuerda(`M236,${Y} L262,${Y - 4} M236,${Y - 4} L262,${Y}`, { w: 2.8 }));
  out.push(`<g data-parte="seno">${cuerda(`M262,${Y - 2} Q290,${Y + 80} 318,${Y + 22}`, { on: m.on('seno') })}</g>`);
  out.push(`<g data-parte="chicote">${cuerda(`M318,${Y + 22} L330,${Y + 8}`, { on: m.on('chicote') })}<circle cx="330" cy="${Y + 8}" r="3.4" fill="${m.c('chicote')}"/></g>`);
  out.push(`<g data-parte="gaza">${centrado(40, Y - 32, 'gaza', { weight: 700, color: m.c('gaza') })}${centrado(46, Y + 40, 'guardacabos', { size: TXT.min, color: m.c('gaza') })}</g>`, centrado(40, Y + 58, 'noray', { size: TXT.min, italic: true, color: T.apagado }));
  out.push(`<g data-parte="firme">${centrado(160, Y - 12, 'firme', { weight: 700, color: m.c('firme') })}${centrado(170, Y + 36, 'soporta la tensión', { size: TXT.min, italic: true })}</g>`, centrado(249, Y - 18, 'cornamusa', { size: TXT.min, italic: true, color: T.apagado }));
  out.push(`<g data-parte="seno">${centrado(292, Y + 60, 'seno', { weight: 700, color: m.c('seno') })}</g>`, `<g data-parte="chicote">${centrado(330, Y - 6, 'chicote', { weight: 700, color: m.c('chicote') })}</g>`);
  out.push(panelNotas(182, H), serif(18, 204, 'Chicote: cada extremo. Firme: la parte que trabaja.', { size: TXT.min }), serif(18, 222, 'Seno: la parte intermedia, en curva.', { size: TXT.min }));
  out.push(cierra());
  return out.join('');
}

function cornamusa() {
  const H = 250;
  const alt = 'Tres pasos para hacer firme en una cornamusa vista desde arriba: 1, una vuelta completa a la base; 2, vueltas cruzadas en ocho por los cuernos; 3, la última, mordida con un cote que la bloquea.';
  const { out, cierra } = lienzo(W, H, alt);
  const cleat = (cx, cy) => `<ellipse cx="${cx}" cy="${cy}" rx="13" ry="8" fill="${T.casco}" stroke="${T.tinta}"/><path d="M${cx - 34},${cy - 3} Q${cx - 34},${cy - 6} ${cx - 28},${cy - 6} L${cx + 28},${cy - 6} Q${cx + 34},${cy - 6} ${cx + 34},${cy - 3} L${cx + 34},${cy + 3} Q${cx + 34},${cy + 6} ${cx + 28},${cy + 6} L${cx - 28},${cy + 6} Q${cx - 34},${cy + 6} ${cx - 34},${cy + 3} Z" fill="${T.apagado}" stroke="${T.tinta}" stroke-width="1.2"/>`;
  [['vuelta completa', 'a la base'], ['vueltas en ocho', 'por los cuernos'], ['la última,', 'mordida (cote)']].forEach(([t1, t2], i) => {
    const cx = 62 + i * 117;
    const cy = 112;
    const g = [cuerda(`M${cx - 50},${cy + 46} L${cx - 14},${cy + 12}`, { w: 3.2 }), cuerda(`M${cx - 14},${cy + 12} C${cx + 30},${cy + 12} ${cx + 30},${cy - 12} ${cx},${cy - 12} C${cx - 30},${cy - 12} ${cx - 26},${cy + 12} ${cx - 6},${cy + 14}`, { w: 3.2 }), cleat(cx, cy)];
    if (i === 0) g.push(cuerda(`M${cx - 6},${cy + 14} L${cx + 26},${cy + 38}`, { w: 3.2 }));
    if (i >= 1) g.push(cuerda(`M${cx - 6},${cy + 14} L${cx + 24},${cy - 10} C${cx + 40},${cy - 22} ${cx + 44},${cy + 4} ${cx + 30},${cy + 10} L${cx - 26},${cy - 10} C${cx - 42},${cy - 16} ${cx - 42},${cy + 12} ${cx - 28},${cy + 10} L${cx + 22},${cy - 12}`, { w: 3.2 }));
    if (i === 1) g.push(cuerda(`M${cx + 22},${cy - 12} C${cx + 40},${cy - 24} ${cx + 46},${cy + 4} ${cx + 32},${cy + 14} L${cx + 40},${cy + 38}`, { w: 3.2 }));
    if (i === 2) g.push(cuerda(`M${cx + 22},${cy - 12} C${cx + 30},${cy - 18} ${cx + 38},${cy - 12} ${cx + 30},${cy - 4} C${cx + 22},${cy + 4} ${cx + 14},${cy - 14} ${cx + 24},${cy - 22} L${cx + 40},${cy - 34}`, { w: 3.2, on: true }), serif(cx + 44, cy - 40, 'mordida', { anchor: 'end', weight: 700, color: T.magenta }));
    g.push(paso(cx - 40, 34, i + 1), centrado(cx, 186, t1, { weight: 700 }), centrado(cx, 204, t2, { size: TXT.min }));
    out.push(g.join(''));
  });
  out.push(serif(20, 172, 'firme', { size: TXT.min, italic: true, color: T.apagado }));
  out.push(panelNotas(216, H), centrado(179, 238, 'Sin vueltas de más: se suelta en segundos.', { italic: true }));
  out.push(cierra());
  return out.join('');
}

function porSeno(pt) {
  const H = 260;
  const alt = 'Vista desde arriba: un barco amarrado por seno, con el cabo que sale de una cornamusa, da la vuelta al noray del muelle y vuelve a la otra cornamusa. Los dos extremos quedan a bordo: para largar se suelta uno y se cobra del otro.';
  const { out, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
  out.push(tierra(`M5,190 L${W - 5},190 L${W - 5},${H - 5} L5,${H - 5}Z`, pt), linea(5, 190, W - 5, 190, { w: 1.4 }));
  out.push(`<path d="M34,62 L254,60 C304,62 326,80 334,92 C326,104 304,120 254,122 L34,120 Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.4"/>`, serif(320, 96, 'proa', { anchor: 'end', size: TXT.min, italic: true }));
  for (const x of [124, 234]) out.push(`<rect x="${x - 12}" y="108" width="24" height="7" rx="3.5" fill="${T.apagado}" stroke="${T.tinta}"/>`);
  out.push(`<circle cx="179" cy="204" r="8" fill="${T.apagado}" stroke="${T.tinta}" stroke-width="1.2"/>`);
  out.push(cuerda('M124,112 L172,198 A8,8 0 1 0 186,198 L234,112', { w: 3.2 }));
  out.push(centrado(124, 100, 'firme', { weight: 700 }), centrado(234, 100, 'chicote', { weight: 700 }), centrado(179, 82, 'los dos extremos, a bordo', { weight: 700, color: T.magenta }));
  out.push(serif(196, 230, 'noray o argolla', { weight: 700 }));
  out.push(flecha(218, 158, 234, 134, { color: T.azul, w: 1.8 }), serif(240, 156, 'cobras de uno', { color: T.azulTxt, size: TXT.min }), serif(40, 156, 'sueltas el otro', { color: T.azulTxt, size: TXT.min }));
  out.push(cierra());
  return out.join('');
}

function encapillar(pt) {
  const H = 250;
  const alt = 'Un noray con la gaza de otro barco ya encapillada. Tu gaza pasa por dentro de la del vecino, de abajo arriba, y se encapilla encima: así cada barco puede sacar la suya sin tocar la otra.';
  const { out, cierra } = lienzo(W, H, alt);
  out.push(tierra(`M5,196 L${W - 5},196 L${W - 5},${H - 5} L5,${H - 5}Z`, pt));
  out.push(`<rect x="165" y="84" width="28" height="112" fill="${T.apagado}" stroke="${T.tinta}" stroke-width="1.2"/><rect x="157" y="76" width="44" height="10" rx="4" fill="${T.apagado}" stroke="${T.tinta}" stroke-width="1.2"/>`);
  out.push(cuerda('M150,166 C152,159 206,159 208,166', { w: 3.2, alma: T.casco }), cuerda('M150,166 C112,168 56,172 14,174', { w: 3.2, alma: T.casco }));
  out.push(cuerda('M344,188 C280,188 222,188 202,176 C196,170 198,154 202,142', { w: 3.6, on: true }));
  out.push(cuerda('M150,166 C152,174 206,174 208,166', { w: 3.2, alma: T.casco }));
  out.push(cuerda('M202,142 C206,132 154,128 152,134 C150,142 198,146 202,142', { w: 3.6, on: true }));
  out.push(flecha(216, 182, 216, 144, { color: T.magenta, w: 2 }));
  ['tu gaza: por dentro', 'de la otra, de', 'abajo arriba'].forEach((t, i) => out.push(serif(226, 112 + i * 16, t, { weight: 700, color: T.magenta })));
  out.push(serif(16, 158, 'gaza del vecino', { size: TXT.min }), centrado(179, 64, 'noray', { size: TXT.min, italic: true, color: T.apagado }));
  out.push(panelNotas(210, H), centrado(179, 232, 'Cada barco saca su gaza sin tocar la otra.', { weight: 700 }));
  out.push(cierra());
  return out.join('');
}

export function caboC(spec = {}) {
  if (spec.vista === 'cornamusa') return { svg: cornamusa(), caption: 'Hacer firme en una cornamusa: una vuelta completa a la base, varias vueltas cruzadas en ocho por los cuernos y la última mordida, con un cote que la bloquea. Sin vueltas de más: así se suelta en segundos.' };
  if (spec.vista === 'por-seno') return { svg: conPunteado((_, p) => porSeno(p), null), caption: 'Por seno, el firme y el chicote quedan los dos a bordo. Para largar sueltas un extremo y cobras del otro, sin nadie en el muelle. Si algún extremo queda en tierra, ya no es por seno.' };
  if (spec.vista === 'encapillar') return { svg: conPunteado((_, p) => encapillar(p), null), caption: 'Si en el noray ya hay otra gaza, pasa la tuya por dentro de ella, de abajo arriba, y después encapíllala. Así cada barco puede sacar su gaza sin tocar la del vecino; para eso, las gazas tienen que ser holgadas.' };
  const m = marca(spec, CABO);
  return { svg: caboPartes(m), caption: m.texto(CAP_CABO, 'Chicote: cada extremo. Firme: la parte que trabaja. Seno: la parte intermedia, en curva. La gaza es un ojo fijo en un extremo, protegido aquí con un guardacabos.') };
}

// ===========================================================================
// Remolque (per-3-8): largo, abarloado y subir al náufrago

function remolqueLargo() {
  const H = 300;
  const alt = 'De perfil, con mar: el remolcador y el remolcado están a la vez en una cresta, separados dos longitudes de ola; el cabo de remolque, largo, hace seno con un peso a la mitad que amortigua los tirones. El remolcado lo tiene firme a un punto resistente, con el motor desembragado.';
  const { out, id, cierra } = lienzo(W, H, alt);
  const lam = 104;
  const x1 = 72;
  const ys = (x) => 144 - 12 * Math.cos((2 * Math.PI * (x - x1)) / lam);
  let d = `M5,${f1(ys(5))}`;
  for (let x = 9; x <= W - 5; x += 4) d += ` L${x},${f1(ys(x))}`;
  out.push(`<clipPath id="${id}-m"><rect x="5" y="5" width="${W - 10}" height="${H - 10}"/></clipPath><path d="${d} L${W - 5},${H - 5} L5,${H - 5}Z" fill="${T.agua}" clip-path="url(#${id}-m)"/>`, `<path d="${d}" fill="none" stroke="${T.lineaAgua}" stroke-width="1.4"/>`);
  const x2 = x1 + 2 * lam;
  out.push(cascoPerfil(x1 - 32, ys(x1), 64), cascoPerfil(x2 - 32, ys(x2), 64));
  const p1 = [x1 + 32, ys(x1) - 10];
  const p2 = [x2 - 31, ys(x2) - 11];
  const mid = [(p1[0] + p2[0]) / 2, 184];
  out.push(cuerda(`M${f1(p1[0])},${f1(p1[1])} Q${f1(mid[0])},${f1(2 * mid[1] - (p1[1] + p2[1]) / 2)} ${f1(p2[0])},${f1(p2[1])}`, { w: 2.4 }));
  out.push(`<rect x="${f1(mid[0] - 7)}" y="${f1(mid[1] - 6)}" width="14" height="12" rx="2" fill="${T.tinta}"/>`, centrado(mid[0], mid[1] + 26, 'peso a mitad del cabo', { size: TXT.min, italic: true }));
  out.push(punto(p2[0], p2[1], { r: 3.4, color: T.magenta }), serif(x2 - 38, 112, 'firme a un punto', { anchor: 'end', size: TXT.min, color: T.magenta, weight: 700 }), serif(x2 - 38, 127, 'resistente', { anchor: 'end', size: TXT.min, color: T.magenta, weight: 700 }));
  out.push(centrado(x1, 30, 'remolcador', { weight: 700 }), centrado(x1, 48, 'mínima velocidad,', { size: TXT.min }), centrado(x1, 63, 'sin tirones', { size: TXT.min }));
  out.push(centrado(x2 - 6, 30, 'remolcado', { weight: 700 }), centrado(x2 - 6, 48, 'motor desembragado,', { size: TXT.min }), centrado(x2 - 6, 63, 'sigue la estela', { size: TXT.min }));
  out.push(flecha(x1 - 34, 96, x1 - 58, 96, { color: T.azul, w: 2 }));
  out.push(cota(x1, 82, x2, 82, '2 olas', { color: T.azulTxt }));
  out.push(panelNotas(232, H), serif(18, 254, 'Con mar, remolque largo: los dos barcos a la vez', { weight: 700 }), serif(18, 272, 'en la cresta o en el seno de la ola.', { weight: 700 }), serif(18, 290, 'Canal de trabajo acordado por VHF; cuchillo a mano.', { size: TXT.min }));
  out.push(cierra());
  return out.join('');
}

function remolqueAbarloado() {
  const H = 300;
  const alt = 'Vista desde arriba: el remolcador y el barco averiado amarrados costado con costado, con defensas y tres amarras; el averiado queda entre el través y la aleta del remolcador, de modo que la popa del remolcador queda más a popa y gobierna con su hélice y su timón.';
  const { out, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
  const [Lr, La, B] = [132, 92, 36];
  const [xr, yr] = [200, 140];
  const [xa, ya] = [xr - B - 14, yr + 16];
  for (const y of [yr - 4, yr + 46]) out.push(`<rect x="${(xa + xr) / 2 - 8}" y="${y}" width="9" height="15" rx="4" fill="${T.naranja}" stroke="${T.tinta}"/>`);
  out.push(barco(xr, yr, 0, Lr, { p: null }), barco(xa, ya, 0, La, { p: null }));
  const l = xa + (B - 4) / 2 - 2;
  const r = xr - B / 2 + 2;
  for (const [a, b] of [[[r, yr - 18], [l, ya - La / 2 + 18]], [[r, yr + 20], [l, ya - 4]], [[r, yr + Lr / 2 - 14], [l, ya + La / 2 - 14]]]) out.push(linea(a[0], a[1], b[0], b[1], { w: 1.6 }));
  const xt = xr + B / 2 + 6;
  out.push(linea(xt, yr, xt + 14, yr, { w: 1.2 }), serif(xt + 18, yr + 4, 'través', { size: TXT.min }), linea(xt, yr + Lr * 0.36, xt + 14, yr + Lr * 0.36, { w: 1.2 }), serif(xt + 18, yr + Lr * 0.36 + 4, 'aleta', { size: TXT.min }));
  out.push(serif(xr + B / 2 + 8, yr - Lr / 2 + 16, 'remolcador', { weight: 700 }));
  out.push(serif(xa - B / 2 - 6, ya - 8, 'averiado:', { anchor: 'end', weight: 700, color: T.magenta }), serif(xa - B / 2 - 6, ya + 9, 'entre el través', { anchor: 'end', size: TXT.min }), serif(xa - B / 2 - 6, ya + 24, 'y la aleta del', { anchor: 'end', size: TXT.min }), serif(xa - B / 2 - 6, ya + 39, 'remolcador', { anchor: 'end', size: TXT.min }));
  out.push(flecha(330, 250, 330, 210, { color: T.azul, w: 2 }), centrado(330, 268, 'avante', { size: TXT.min, color: T.azulTxt }));
  out.push(serif(16, 286, 'Aguas abrigadas y espacios reducidos.', { italic: true }));
  out.push(cierra());
  return out.join('');
}

function remolqueNaufrago() {
  const H = 320;
  const alt = 'Vista desde arriba con el viento de arriba abajo: el barco, con la máquina en punto muerto, deja al náufrago junto a su costado de sotavento, donde el casco le hace socaire; le pasa un aro con rabiza y lo sube por la escala de popa.';
  const { out, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
  out.push(flecha(40, 18, 40, 60, { color: T.azul, w: 2 }), serif(50, 36, 'viento', { color: T.azulTxt, weight: 700 }));
  const [cx, cy] = [190, 116];
  const [L, B] = [160, 46];
  out.push(`<path d="M${cx - 44},${cy + 23} L${cx + 64},${cy + 23} L${cx + 54},${cy + 96} L${cx - 34},${cy + 96}Z" fill="${T.agua}"/>`, serif(cx + 58, cy + 90, 'socaire', { anchor: 'end', italic: true, size: TXT.min, color: T.azulTxt }));
  out.push(barco(cx, cy, 90, L, { p: null }));
  out.push(centrado(cx + 50, cy - 32, 'barlovento', { size: TXT.min, italic: true }), serif(cx + 70, cy + 44, 'sotavento', { weight: 700 }));
  out.push(`<circle cx="${cx - L / 2 - 4}" cy="${cy}" r="6" fill="none" stroke="${T.magenta}" stroke-width="2.4"/>`, serif(14, cy - 26, 'máquina en', { weight: 700, color: T.magenta }), serif(14, cy - 10, 'punto muerto', { weight: 700, color: T.magenta }));
  const [nx, ny] = [cx - 10, cy + 60];
  out.push(`<circle cx="${nx}" cy="${ny}" r="6.5" fill="${T.naranja}" stroke="${T.tinta}"/>`, `<circle cx="${nx + 17}" cy="${ny - 2}" r="8" fill="none" stroke="${T.naranja}" stroke-width="4"/>`);
  out.push(cuerda(`M${nx + 23},${ny - 8} Q${nx + 36},${ny - 28} ${nx + 28},${cy + B / 2 - 2}`, { w: 1.8 }));
  out.push(serif(nx - 12, ny + 5, 'náufrago', { anchor: 'end', weight: 700 }), serif(nx + 30, ny + 12, 'aro con rabiza', { size: TXT.min }));
  const ex = cx - L / 2 + 8;
  out.push(`<path d="M${ex},${cy + 16} V${cy + 36} M${ex + 9},${cy + 16} V${cy + 36} M${ex},${cy + 23} H${ex + 9} M${ex},${cy + 30} H${ex + 9}" stroke="${T.tinta}" stroke-width="1.6"/>`, serif(14, cy + 56, 'súbelo por la escala', { size: TXT.min }), serif(14, cy + 72, 'o la plataforma', { size: TXT.min }));
  out.push(panelNotas(232, H), serif(18, 254, 'Llega despacio y para la hélice antes de tenerlo', { size: TXT.min }), serif(18, 272, 'cerca. Agotado: le ayuda un tripulante con chaleco', { size: TXT.min }), serif(18, 290, 'y amarrado. En agua fría, súbelo en horizontal.', { size: TXT.min, weight: 700 }));
  out.push(cierra());
  return out.join('');
}

export function remolqueC(spec = {}) {
  const v = spec.vista ?? 'largo';
  if (v === 'abarloado') return { svg: remolqueAbarloado(), caption: 'En aguas abrigadas y espacios reducidos, como al entrar en puerto, se puede remolcar abarloado: los dos barcos amarrados costado con costado, con el averiado entre el través y la aleta del remolcador, que así gobierna con su hélice y su timón.' };
  if (v === 'naufrago') return { svg: remolqueNaufrago(), caption: 'Llega despacio y pon punto muerto antes de tenerlo cerca: la hélice es el mayor peligro. Que quede junto a tu costado de sotavento, donde el casco le hace socaire; pásale un aro con rabiza y súbelo por la escala o la plataforma de baño.' };
  return { svg: remolqueLargo(), caption: 'Con mar, el remolque debe ser largo, de modo que los dos barcos estén a la vez en la cresta o en el seno; un peso a mitad del cabo amortigua los tirones. El remolcado lo afirma a un punto resistente, desembraga y sigue la estela; arranca a mínima velocidad y sin tirones.' };
}

// ===========================================================================
// Supervivencia en el agua (per-3-8 y per-8-9): postura HELP, saltar y en piña

const miembro = (p, w = 6) => `<polyline points="${pts(p)}" fill="none" stroke="${T.tinta}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const cabeza = (x, y, r = 10) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.4"/>`;
const tronco = (a, b, w = 18) => `<line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" stroke="${T.tinta}" stroke-width="${w + 2}" stroke-linecap="round"/><line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" stroke="${T.naranja}" stroke-width="${w}" stroke-linecap="round"/>`;

function posturaHelp() {
  const H = 320;
  const alt = 'Una persona con chaleco, quieta en el agua en postura fetal (HELP): rodillas al pecho y brazos cruzados. Se señalan las zonas que más calor pierden y que así se protegen: cabeza fuera del agua, cuello, axilas, costados e ingles.';
  const { out, cierra } = lienzo(W, H, alt);
  out.push(marHasta(110, 236));
  const [hom, cad, rod, pie] = [[112, 128], [98, 182], [76, 128], [66, 178]];
  out.push(tronco(hom, cad, 24), miembro([cad, rod, pie], 9), cabeza(116, 102, 13));
  out.push(miembro([[118, 134], [86, 152], [82, 142]], 5), miembro([[108, 132], [90, 160], [98, 162]], 5));
  out.push(serif(204, 34, 'Protege las zonas que', { weight: 700 }), serif(204, 50, 'más calor pierden:', { weight: 700 }));
  for (const [t, [px, py], ly] of [['cabeza (fuera del agua)', [124, 96], 82], ['cuello', [116, 116], 106], ['axilas', [118, 136], 130], ['costados', [112, 160], 154], ['ingles', [100, 182], 178]]) out.push(punto(px, py, { r: 3, color: T.magenta }), referencia(px + 3, py, 196, ly - 4, { color: T.magenta }), serif(200, ly, t, { weight: 700, color: T.magenta }));
  out.push(panelNotas(240, H), serif(18, 262, 'Rodillas al pecho y brazos cruzados.', { weight: 700 }), serif(18, 282, 'No nades para entrar en calor.'), serif(18, 302, 'Sin chaleco: vertical y despacio, lo justo para flotar.', { size: TXT.min }));
  out.push(cierra());
  return out.join('');
}

function posturaSaltar() {
  const H = 340;
  const alt = 'Una persona salta del costado del barco al agua: de pie, con las piernas juntas y estiradas, tapándose nariz y boca con una mano y sujetando el chaleco con el otro brazo cruzado, hacia agua despejada, sin nadie ni nada debajo.';
  const { out, cierra } = lienzo(W, H, alt);
  const yA = 214;
  out.push(marHasta(yA, 250));
  out.push(`<path d="M5,66 L82,66 L76,${yA + 14} L5,${yA + 14}Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.4"/>`, linea(5, 66, 82, 66, { w: 2.4 }));
  const x = 140;
  out.push(miembro([[x - 3, 130], [x - 3, 178]], 5), miembro([[x + 3, 130], [x + 3, 178]], 5), tronco([x, 98], [x, 124], 20), cabeza(x, 78, 12));
  out.push(miembro([[x + 8, 92], [x + 14, 84], [x + 6, 80]], 5), miembro([[x - 9, 92], [x + 4, 108], [x + 10, 104]], 5));
  out.push(flecha(x, 186, x, yA - 4, { color: T.azul, w: 1.8 }));
  const r = (px, py, ly, l1, l2) => referencia(px, py, 192, ly - 4) + serif(196, ly, l1, { weight: 700 }) + serif(196, ly + 16, l2, { weight: 700 });
  out.push(r(160, 80, 64, 'inspira y tapa', 'nariz y boca'), r(156, 106, 108, 'sujeta el chaleco,', 'brazo cruzado'), r(148, 156, 152, 'piernas juntas', 'y estiradas'));
  out.push(serif(150, 204, 'nadie ni nada debajo', { size: TXT.min, italic: true }));
  out.push(panelNotas(254, H), serif(18, 276, 'Salta desde la menor altura posible, lejos de', { size: TXT.min }), serif(18, 292, 'combustible derramado. Mejor aún: pasa a la balsa', { size: TXT.min }), serif(18, 308, 'desde cubierta sin mojarte.', { size: TXT.min }));
  out.push(tacha(24, 326, 5), serif(36, 330, 'No: piernas plegadas (eso es para flotar).', { size: TXT.min, weight: 700, color: T.magenta }));
  out.push(cierra());
  return out.join('');
}

function posturaGrupo() {
  const H = 300;
  const alt = 'Vista desde arriba: cinco náufragos con chaleco, abrazados en círculo, y el más débil en el centro. Juntos conservan el calor, se animan y se les ve mejor.';
  const { out, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
  out.push(serif(18, 30, 'vista desde arriba', { size: TXT.min, italic: true, color: T.apagado }));
  const [cx, cy, R] = [130, 128, 54];
  const ps = [0, 72, 144, 216, 288].map((a) => pol(cx, cy, a, R));
  ps.forEach((p, i) => { const q = ps[(i + 1) % 5]; out.push(linea(p[0], p[1], q[0], q[1], { w: 5 })); });
  ps.forEach((p) => out.push(linea(p[0], p[1], (p[0] + cx) / 2, (p[1] + cy) / 2, { w: 4, color: T.apagado })));
  const nadador = (x, y, fuerte) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="16" fill="${T.naranja}" stroke="${fuerte ? T.magenta : T.tinta}" stroke-width="${fuerte ? 2.6 : 1.2}"/>${cabeza(x, y, 8)}`;
  ps.forEach(([x, y]) => out.push(nadador(x, y, false)));
  out.push(nadador(cx, cy, true));
  out.push(referencia(cx + 18, cy + 4, 226, 140, { color: T.magenta }), serif(230, 136, 'el más débil,', { weight: 700, color: T.magenta }), serif(230, 152, 'en el centro', { weight: 700, color: T.magenta }));
  out.push(referencia(ps[1][0] + 14, ps[1][1] - 8, 226, 76), serif(230, 70, 'abrazados,', { weight: 700 }), serif(230, 86, 'con el chaleco', { weight: 700 }));
  out.push(panelNotas(222, H), serif(18, 246, 'Juntos conserváis el calor, os animáis y se os ve', { size: TXT.min }), serif(18, 262, 'mejor.', { size: TXT.min }), serif(18, 284, 'Quietos: no nadéis sin algo seguro muy cerca.', { weight: 700 }));
  out.push(cierra());
  return out.join('');
}

export function hipotermiaC(spec = {}) {
  const postura = spec.postura ?? 'help';
  if (postura === 'grupo') return { svg: posturaGrupo(), caption: 'Si sois varios en el agua, agrupaos en piña, abrazados y con los más débiles en el centro: conserváis el calor, os dais ánimo y es más fácil que os encuentren.' };
  if (postura === 'saltar') return { svg: posturaSaltar(), caption: 'Si hay que saltar: comprueba que no hay nadie ni nada debajo, salta desde la menor altura posible, de pie, con las piernas juntas y estiradas, tapando nariz y boca con una mano y sujetando el chaleco con el otro brazo.' };
  return { svg: posturaHelp(), caption: 'Con chaleco, quieto en postura fetal (HELP): rodillas al pecho y brazos cruzados, para proteger cabeza, cuello, axilas, costados e ingles. Sin chaleco, vertical y con movimientos lentos, lo justo para flotar.' };
}
