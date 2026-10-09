// La carta de la derrota (Hoy y la Travesía, docs/ENTRADA.md y docs/TRAVESIA.md) dibujada en estilo C
// (docs/ESTILO-LAMINAS.md): papel de carta, tierra con punteado y veriles, líneas de agua, la derrota en magenta, marco
// graduado, rosa y cartela. Solo el fondo y las patas: los faros, la bandera y sus nombres son HTML encima (botones de
// verdad en la Travesía), colocados en % con las mismas coordenadas. SVG como texto, sin DOM, solo colores T.* (--lc-*).
//
// Coordenadas: las de la carta de 358 × 320 (PUNTOS_DERROTA y BANDERA de src/course/travesia.js). En compacto (Hoy) la
// carta es más baja (358 × 232) y las capas HTML cubren hasta y = 360: aquí cada y se multiplica por 232 / 360, de modo
// que el dibujo no se estira (el texto y los trazos conservan su forma).

import { T, TRAZO, marco, tierra, ondaCurva, cartela, rotulo, idDe, f1 } from './estilo-c.js';

export const ANCHO = 358;
export const ALTO = 320;
/** Alto de la carta compacta en el SVG y alto de referencia de sus capas HTML (los faros caben con su nombre). */
export const ALTO_COMPACTA_SVG = 232;
export const ALTO_COMPACTA = 360;

/** Costas (en la carta de 358 × 320), solo con M, L, C y Z y pares «x y». */
const COSTAS = [
  'M0 0 L72 0 C64 40 50 70 40 104 C32 136 30 168 18 200 C12 218 6 232 0 246 Z',
  'M232 0 L358 0 L358 132 C340 120 318 114 298 100 C278 86 262 70 252 50 C244 34 238 18 232 0 Z',
];
/** Un islote frente a la costa de levante (decorativo, lejos de los faros). */
const ISLOTE = 'M316 172 C326 166 338 170 340 180 C342 190 332 196 322 194 C312 192 308 178 316 172 Z';

/** Escala las y de un trazado de pares «x y». */
export const escalaY = (d, k) => (k === 1 ? d : d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_, x, y) => `${x} ${f1(Number(y) * k)}`));

/** Estilo de cada pata según el faro al que llega: encendido, en camino o apagado (también por el trazo, no solo el color). */
const PATA = {
  on: `stroke="${T.magenta}" stroke-width="2.4"`,
  parcial: `stroke="${T.tinta}" stroke-width="${TRAZO.fuerte}" stroke-dasharray="7 5"`,
  off: `stroke="${T.apagado}" stroke-width="${TRAZO.marca}" stroke-dasharray="1.5 5"`,
};

/** Rosa del norte con la N a 12 (a 360 px la carta se dibuja a unos 324 px: 12 × 324 / 358 ≈ 10,9 px efectivos). */
function rosa(cx, cy, r = 14) {
  return `<g transform="translate(${f1(cx)} ${f1(cy)})"><circle r="${r}" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1"/><circle r="${r - 3}" fill="none" stroke="${T.tinta}" stroke-width=".5"/>` +
    `<polygon points="0,${-r + 2} 4,0 0,${r - 2} -4,0" fill="${T.papel}" stroke="${T.tinta}" stroke-width=".8"/><polygon points="0,${-r + 2} 4,0 -4,0" fill="${T.tinta}"/>` +
    rotulo(0, -r - 4, 'N', { size: 12, weight: 700, estilo: 'serif' }) + '</g>';
}

/**
 * El SVG de la carta (decorativo: el nombre accesible lo lleva la carta HTML o su enlace).
 * @param {{ estado: string }[]} faros  en orden de la derrota
 * @param {[number, number][]} pos  posiciones de los faros (posicionesDerrota) y `bandera` la del examen
 * @param {{ compacta?: boolean, rotulo?: { titulo: string, sub?: string } | null }} [o]  rotulo: la cartela (solo en grande)
 */
export function cartaDerrotaSvg(faros, pos, bandera, { compacta = false, rotulo: cart = null } = {}) {
  const H = compacta ? ALTO_COMPACTA_SVG : ALTO;
  const k = compacta ? ALTO_COMPACTA_SVG / ALTO_COMPACTA : 1;
  const W = ANCHO;
  const id = idDe(`derrota|${compacta ? 'c' : 'g'}`);
  const pt = `url(#${id}-pt)`;
  const y = (v) => f1(v * k);
  const o = [`<svg class="carta-svg lc" viewBox="0 0 ${W} ${H}" aria-hidden="true" focusable="false">`,
    `<defs><pattern id="${id}-pt" width="3" height="3" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r=".55" fill="${T.tinta}"/></pattern></defs>`,
    `<rect width="${W}" height="${H}" fill="${T.papel}"/>`];
  // Veriles: el agua somera sigue la costa (dos bandas de azul)
  const costas = [...COSTAS, ISLOTE].map((d) => escalaY(d, k));
  for (const d of costas) o.push(`<path d="${d}" fill="none" stroke="${T.agua2}" stroke-width="40" stroke-linejoin="round"/>`);
  for (const d of costas) o.push(`<path d="${d}" fill="none" stroke="${T.agua}" stroke-width="20" stroke-linejoin="round"/>`);
  // Líneas de agua en mar abierto
  for (const [x1, x2, yy, fina] of [[96, 226, 200, true], [160, 352, 300, false], [70, 200, 312, true], [212, 338, 262, true]]) {
    if (!compacta || yy < 300) o.push(ondaCurva(x1, x2, Number(y(yy)), { amp: 4, fina }));
  }
  for (const d of costas) o.push(tierra(d, pt));
  // La derrota: una pata por faro, la última hasta la bandera del examen
  const puntos = [...pos, bandera];
  faros.forEach((f, i) => {
    const [a, b] = [puntos[i], puntos[i + 1]];
    o.push(`<line class="pata ${f.estado}" x1="${a[0]}" y1="${y(a[1])}" x2="${b[0]}" y2="${y(b[1])}" ${PATA[f.estado] ?? PATA.off} stroke-linecap="round" fill="none"/>`);
  });
  if (!compacta) {
    o.push(rosa(38, 40));
    if (cart) o.push(cartela(298, 293, cart.titulo, cart.sub ?? null));
  }
  o.push(marco(W, H), '</svg>');
  return o.join('');
}

/**
 * Dónde va el nombre de un faro: debajo (lo normal) o al lado ('nombre-izq' / 'nombre-der') cuando otro faro o la
 * bandera queda justo debajo y el nombre lo taparía (en la carta compacta de Hoy, más baja, pasa entre Carta y
 * Balizamiento). Al lado que da al centro de la carta. Solo presentación. `pos` y `bandera`, en la carta de 358 × 320.
 */
export function ladoNombre(pos, i, bandera) {
  const [x, y] = pos[i];
  const debajo = [...pos, bandera].some((p, j) => j !== i && Math.abs(p[0] - x) < 70 && p[1] - y > 0 && p[1] - y < 90);
  return debajo ? (x >= ANCHO * 0.42 ? 'nombre-izq' : 'nombre-der') : '';
}
