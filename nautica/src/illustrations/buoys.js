// Ilustraciones: balizamiento IALA región A, en estilo C (docs/ESTILO-LAMINAS.md). Marcas de castillete con sus franjas,
// marca de tope y luz rítmica; las cuatro cardinales como en las fichas de una carta, cada una con su reloj.
// spec: { tipo:'boya', clase, ritmo?, reloj?: bool }
//   clases: babor, estribor, canal-principal-estribor (bifurcación: rojo/verde/rojo), canal-principal-babor,
//           cardinal-n, cardinal-e, cardinal-s, cardinal-w, peligro-aislado, aguas-navegables, especial, nuevo-peligro
// Fuente: Sistema de balizamiento marítimo IALA-AISM, región A (ver el apéndice de docs/ESTILO-LAMINAS.md).

import { luzC, cronoC, parseRhythm, NOMBRE_LUZ } from './lights.js';
import { T, TXT, lienzo, rotulo, etiqueta, anchoTexto, ondas, reloj, f1, parte } from './estilo-c.js';

export const BUOYS = {
  babor: { nombre: 'Lateral de babor', franjas: ['R'], tope: 'cilindro-R', ritmo: 'Fl R 4s', topeTxt: 'cilindro rojo', colores: 'roja', nota: 'Entrando en puerto se deja por babor. Roja; marca de tope cilíndrica (o boya cilíndrica).' },
  estribor: { nombre: 'Lateral de estribor', franjas: ['G'], tope: 'cono-arriba-G', ritmo: 'Fl G 4s', topeTxt: 'cono verde, punta arriba', colores: 'verde', nota: 'Entrando en puerto se deja por estribor. Verde; marca de tope cónica con el vértice arriba (o boya cónica).' },
  'canal-principal-estribor': { nombre: 'Bifurcación: canal principal a estribor', franjas: ['R', 'G', 'R'], tope: 'cilindro-R', ritmo: 'Fl(2+1) R 10s', topeTxt: 'cilindro rojo', colores: 'roja con banda verde', nota: 'Modificada de babor: roja con banda verde. El canal principal queda a estribor.' },
  'canal-principal-babor': { nombre: 'Bifurcación: canal principal a babor', franjas: ['G', 'R', 'G'], tope: 'cono-arriba-G', ritmo: 'Fl(2+1) G 10s', topeTxt: 'cono verde, punta arriba', colores: 'verde con banda roja', nota: 'Modificada de estribor: verde con banda roja. El canal principal queda a babor.' },
  'cardinal-n': { nombre: 'Cardinal Norte', franjas: ['K', 'Y'], tope: 'conos-arriba', ritmo: 'Q', topeTxt: 'dos conos, puntas arriba', colores: 'negra sobre amarilla', nota: 'Pasa por el norte. Conos hacia arriba; negro arriba. Centelleo continuo.' },
  'cardinal-e': { nombre: 'Cardinal Este', franjas: ['K', 'Y', 'K'], tope: 'conos-bases', ritmo: 'Q(3) 10s', topeTxt: 'conos base con base', colores: 'negra, banda amarilla', nota: 'Pasa por el este. Conos opuestos por la base (rombo); negro con banda amarilla. 3 centelleos (las 3 del reloj).' },
  'cardinal-s': { nombre: 'Cardinal Sur', franjas: ['Y', 'K'], tope: 'conos-abajo', ritmo: 'Q(6)+LFl 15s', topeTxt: 'dos conos, puntas abajo', colores: 'amarilla sobre negra', nota: 'Pasa por el sur. Conos hacia abajo; negro abajo. 6 centelleos + destello largo (las 6).' },
  'cardinal-w': { nombre: 'Cardinal Oeste', franjas: ['Y', 'K', 'Y'], tope: 'conos-vertices', ritmo: 'Q(9) 15s', topeTxt: 'conos punta con punta', colores: 'amarilla, banda negra', nota: 'Pasa por el oeste. Conos unidos por los vértices (reloj de arena); amarillo con banda negra. 9 centelleos (las 9).' },
  'peligro-aislado': { nombre: 'Peligro aislado', franjas: ['K', 'R', 'K'], tope: 'dos-esferas-K', ritmo: 'Fl(2) 5s', topeTxt: 'dos esferas negras', colores: 'negra, banda roja', nota: 'Peligro de extensión reducida con aguas navegables alrededor. Negra con banda roja; dos esferas negras.' },
  'aguas-navegables': { nombre: 'Aguas navegables', franjas: ['R', 'W', 'R', 'W'], verticales: true, tope: 'esfera-R', ritmo: 'LFl 10s', topeTxt: 'esfera roja', colores: 'roja y blanca, en vertical', nota: 'Centro del canal o recalada. Franjas verticales rojas y blancas; esfera roja. Isofase, ocultaciones, destello largo o Mo(A).' },
  especial: { nombre: 'Marca especial', franjas: ['Y'], tope: 'aspa-Y', ritmo: 'Fl Y 5s', topeTxt: 'aspa amarilla', colores: 'amarilla', nota: 'Zonas especiales (balizamiento de playas, conducciones, ejercicios…). Amarilla con aspa amarilla.' },
  'nuevo-peligro': { nombre: 'Nuevo peligro', franjas: ['Bu', 'Y', 'Bu', 'Y'], verticales: true, tope: 'cruz-Y', ritmo: 'Al.Bu/Y 3s', topeTxt: 'cruz amarilla', colores: 'azul y amarilla, en vertical', nota: 'Peligro aún no cartografiado. Franjas verticales azules y amarillas; luz alternativa azul/amarilla.' },
};

/** Color (token) de cada franja. */
const COLOR = { R: T.rojo, G: T.verde, Y: T.amarillo, K: T.negro, W: T.blanco, Bu: T.azul };

/** Marca de tope, en coordenadas locales (x = 0 en el eje; y = 0 en la flotación; la marca ocupa de −108 a −77). */
function topeC(t) {
  const st = `stroke="${T.tinta}" stroke-width="1.5" stroke-linejoin="round"`;
  const cono = (arriba, y0, y1, fill) => (arriba
    ? `<polygon points="-11,${y1} 11,${y1} 0,${y0}" fill="${fill}" ${st}/>`
    : `<polygon points="-11,${y0} 11,${y0} 0,${y1}" fill="${fill}" ${st}/>`);
  const trazo = (d, fill) => `<path d="${d}" stroke="${T.tinta}" stroke-width="6.5" stroke-linecap="round" fill="none"/><path d="${d}" stroke="${fill}" stroke-width="3.8" stroke-linecap="round" fill="none"/>`;
  switch (t) {
    case 'conos-arriba': return cono(true, -108, -94, T.negro) + cono(true, -91, -77, T.negro);
    case 'conos-abajo': return cono(false, -108, -94, T.negro) + cono(false, -91, -77, T.negro);
    case 'conos-bases': return cono(true, -108, -94, T.negro) + cono(false, -91, -77, T.negro);
    case 'conos-vertices': return cono(false, -108, -93, T.negro) + cono(true, -92, -77, T.negro);
    case 'cilindro-R': return `<rect x="-8" y="-104" width="16" height="25" fill="${T.rojo}" ${st}/>`;
    case 'cono-arriba-G': return cono(true, -106, -79, T.verde);
    case 'dos-esferas-K': return `<circle cy="-99" r="7" fill="${T.negro}" ${st}/><circle cy="-84" r="7" fill="${T.negro}" ${st}/>`;
    case 'esfera-R': return `<circle cy="-89" r="10" fill="${T.rojo}" ${st}/>`;
    case 'aspa-Y': return trazo('M-9,-104 L9,-82 M9,-104 L-9,-82', T.amarillo);
    case 'cruz-Y': return trazo('M0,-106 L0,-80 M-11,-93 L11,-93', T.amarillo);
    default: return '';
  }
}

/**
 * Marca de castillete en estilo C con su base en (x, yAgua), escala k.
 * @param {{ pt?: string, ritmo?: string|null, p?: string|null }} o  pt: url del punteado (textura del amarillo);
 *   ritmo: luz que destella en el mástil (null: sin luz)
 */
export function marcaC(clase, x, yAgua, k = 1, { pt = null, ritmo, p = null } = {}) {
  const b = BUOYS[clase];
  if (!b) return '';
  const o = [`<g${parte(p)} transform="translate(${f1(x)} ${f1(yAgua)}) scale(${k})">`];
  o.push(topeC(b.tope));
  o.push(`<line x1="0" y1="-77" x2="0" y2="-66" stroke="${T.tinta}" stroke-width="1.5"/>`);
  // cuerpo: de −66 a −6, 20 de ancho
  const n = b.franjas.length;
  b.franjas.forEach((c, i) => {
    const r = b.verticales
      ? `x="${f1(-10 + (20 * i) / n)}" y="-66" width="${f1(20 / n)}" height="60"`
      : `x="-10" y="${f1(-66 + (60 * i) / n)}" width="20" height="${f1(60 / n)}"`;
    o.push(`<rect ${r} fill="${COLOR[c]}"/>`);
    if (c === 'Y' && pt) o.push(`<rect ${r} fill="${pt}" opacity=".55"/>`);
  });
  o.push(`<rect x="-10" y="-66" width="20" height="60" fill="none" stroke="${T.tinta}" stroke-width="1.5"/>`);
  if (!b.verticales) for (let i = 1; i < n; i++) o.push(`<line x1="-10" y1="${f1(-66 + (60 * i) / n)}" x2="10" y2="${f1(-66 + (60 * i) / n)}" stroke="${T.tinta}" stroke-width=".8"/>`);
  o.push(`<path d="M-22,-6 L22,-6 L17,8 L-17,8Z" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.5" stroke-linejoin="round"/>`);
  if (ritmo !== null) o.push(luzC(0, -71.5, 3.6, ritmo ?? b.ritmo));
  o.push('</g>');
  return o.join('');
}

/** Ilustración de una marca: el castillete en el agua, su marca de tope, sus colores y su luz con el cronograma. */
export function buoyIllustration(spec) {
  const b = BUOYS[spec.clase];
  if (!b) return null;
  if (spec.reloj || (spec.clase?.startsWith('cardinal') && spec.reloj !== false)) return cardinalClock(spec.clase);
  const ritmo = spec.ritmo ?? b.ritmo;
  const rh = parseRhythm(ritmo);
  const luz = [...new Set(rh.steps.filter((s) => s.on).map((s) => NOMBRE_LUZ[s.color ?? rh.colors[0]]))].join(' y ');
  const W = 358;
  const H = 266;
  const alt = `${b.nombre}: marca de castillete ${b.colores}, con marca de tope ${b.topeTxt}; luz ${luz}, ${ritmo}.`;
  const { out, pt, cierra } = lienzo(W, H, alt);
  out.push(`<rect x="0" y="214" width="${W}" height="${H - 214}" fill="${T.agua}"/>`, ondas(8, W - 8, 226));
  out.push(marcaC(spec.clase, 84, 222, 1.62, { pt, ritmo }));
  const X = 168;
  const fila = (y, t, valor) => rotulo(X, y, t, { size: TXT.min, weight: 700, estilo: 'cap', anchor: 'start', color: T.apagado }) +
    rotulo(X, y + 18, valor, { size: TXT.nota + 0.5, estilo: 'serif', italic: true, anchor: 'start' });
  out.push(fila(42, 'MARCA DE TOPE', b.topeTxt), fila(90, 'COLORES', b.colores));
  out.push(rotulo(X, 138, 'LUZ', { size: TXT.min, weight: 700, estilo: 'cap', anchor: 'start', color: T.apagado }));
  const w = anchoTexto(ritmo, TXT.cota, 'mono') + 10;
  out.push(etiqueta(X + w / 2, 156, ritmo, { color: T.magenta }), rotulo(X + w + 8, 160.5, luz, { size: TXT.nota + 0.5, estilo: 'serif', italic: true, anchor: 'start' }));
  out.push(cronoC(X, 176, W - X - 16, 14, ritmo));
  out.push(cierra());
  return { svg: out.join(''), caption: b.nota };
}

// ---------------------------------------------------------------------------
// Las cuatro cardinales: una ficha por marca, con su reloj (hacia dónde está el agua segura) y su ritmo.

const CARDINALES = [
  ['cardinal-n', 'NORTE', 0, 'continua', 'agua segura al norte', 'Q'],
  ['cardinal-e', 'ESTE', 90, '3 centelleos', 'agua segura al este', 'Q(3) 10 s'],
  ['cardinal-s', 'SUR', 180, '6 + 1 largo', 'agua segura al sur', 'Q(6)+LFl 15 s'],
  ['cardinal-w', 'OESTE', 270, '9 centelleos', 'agua segura al oeste', 'Q(9) 15 s'],
];

/** Las cuatro cardinales en fichas de 2 × 2 (resaltar: una de ellas). */
export function cardinalClock(highlight) {
  const W = 358;
  const H = 446;
  const M = 8;
  const G = 10;
  const cw = (W - 2 * M - G) / 2;
  const ch = (H - 2 * M - G) / 2;
  const alt = 'Las cuatro marcas cardinales. Norte: dos conos con la punta hacia arriba, negra sobre amarilla, centelleo continuo. ' +
    'Este: conos base con base, negra con banda amarilla, tres centelleos. Sur: conos con la punta hacia abajo, amarilla sobre negra, seis centelleos y uno largo. ' +
    'Oeste: conos punta con punta, amarilla con banda negra, nueve centelleos. Cada una indica que el agua segura está al lado de su nombre.';
  const { out, pt } = lienzo(W, H, alt, { fondo: T.fondo });
  CARDINALES.forEach(([clase, nombre, deg, luz, nota, ritmo], i) => {
    const x0 = M + (i % 2) * (cw + G);
    const y0 = M + Math.floor(i / 2) * (ch + G);
    const sel = highlight === clase;
    const atenua = highlight && !sel && BUOYS[highlight];
    const g = [`<g transform="translate(${f1(x0)} ${f1(y0)})"${atenua ? ' opacity=".5"' : ''}>`];
    g.push(`<rect width="${f1(cw)}" height="${f1(ch)}" fill="${T.papel}"/>`);
    g.push(`<rect y="100" width="${f1(cw)}" height="38" fill="${T.agua}"/>`, ondas(5, cw - 5, 109, { sep: 10 }));
    g.push(marcaC(clase, 44, 112, 0.9, { pt, ritmo: BUOYS[clase].ritmo }));
    g.push(reloj(118, 50, 25, deg));
    g.push(rotulo(118, 93, luz, { size: TXT.min, estilo: 'serif', italic: true }));
    g.push(`<line x1="0" y1="138" x2="${f1(cw)}" y2="138" stroke="${T.tinta}" stroke-width=".8"/>`);
    g.push(rotulo(12, 160, nombre, { size: 16, weight: 700, estilo: 'serif', anchor: 'start', espacio: 2.4 }));
    const wr = anchoTexto(ritmo, TXT.cota + 0.5, 'mono') + 10;
    g.push(etiqueta(12 + wr / 2, 178, ritmo, { color: T.magenta, size: TXT.cota + 0.5 }));
    g.push(rotulo(12, 204, nota, { size: TXT.nota, estilo: 'serif', italic: true, anchor: 'start', color: T.apagado }));
    // ficha: doble filete (magenta y más gruesa si es la que se pregunta)
    g.push(`<rect x=".75" y=".75" width="${f1(cw - 1.5)}" height="${f1(ch - 1.5)}" fill="none" stroke="${sel ? T.magenta : T.tinta}" stroke-width="${sel ? 2.6 : 1.5}"/>`,
      `<rect x="4" y="4" width="${f1(cw - 8)}" height="${f1(ch - 8)}" fill="none" stroke="${sel ? T.magenta : T.tinta}" stroke-width=".6"/>`);
    g.push('</g>');
    out.push(g.join(''));
  });
  out.push('</svg>');
  const b = BUOYS[highlight];
  return { svg: out.join(''), caption: b ? b.nota : 'Las cardinales se leen como un reloj: E las 3, S las 6, W las 9; la N centellea sin parar.' };
}
