// Dibujo común de «sectores-luces» y «cruce», en estilo C (docs/ESTILO-LAMINAS.md): el buque visto desde arriba con
// los sectores de sus luces acotados (Regla 21: tope 225°, costados 112,5°, alcance 135°) y lo que ve de noche un
// observador que lo mira desde un punto. En «cruce», las cartelas dicen además qué situación es desde cada sector.
import { lucesVisibles } from '../../nautical/luces.js';
import { T, TXT, lienzo, rotulo, cartela, etiqueta, cotaArco, referencia, arcoD, tierra, ondaCurva, f1, pol, parte } from '../estilo-c.js';

const W = 358;
const H = 330;
const CX = 179;
const CY = 172;
const RS = 110; // radio de los sectores
const P = (deg, r) => pol(CX, CY, deg, r);

function sector(a, b, color, p, { rayado = null } = {}) {
  const [x1, y1] = P(a, RS);
  const d = `M${CX},${CY} L${f1(x1)},${f1(y1)} ${arcoD(CX, CY, RS, a, b).replace(/^M[^A]*/, '')}Z`;
  return `<g${parte(p)}><path d="${d}" fill="${color}" fill-opacity="${rayado ? 1 : 0.78}" stroke="${T.tinta}" stroke-width="1.4" stroke-linejoin="round"/>` +
    (rayado ? `<path d="${d}" fill="${rayado}" opacity=".35"/>` : '') + '</g>';
}

/**
 * Vista cenital: sectores acotados y el observador («tú») en `aspecto`.
 * @param {{ ocultarObservador?: boolean, situaciones?: boolean }} o  situaciones: rotula cada sector con la situación
 *   de cruce que se deduce si ves al otro desde ahí (Reglas 13 a 15)
 */
export function planta(aspecto, { ocultarObservador = false, situaciones = false } = {}) {
  const alt = situaciones
    ? 'Buque de motor visto desde arriba con sus sectores. Si lo ves por su verde, se aparta él; por su roja, te apartas tú; si solo ves su blanca de alcance, lo alcanzas y te apartas tú; de proa, vuelta encontrada.'
    : 'Buque de motor visto desde arriba con sus sectores: verde a estribor y roja a babor, de 112,5° cada una; blanca de alcance a popa, de 135°; y, por fuera, el arco de 225° de la luz de tope.';
  const { out, pt, ray, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
  // costa y agua, como en una carta
  out.push(tierra('M0,0 H64 C56,40 38,72 20,104 L0,124 Z', pt));
  out.push(ondaCurva(0, W, 286, { amp: 5 }), ondaCurva(0, W, 306, { amp: 4, fina: true }));
  // graduación de la rosa
  out.push(`<circle cx="${CX}" cy="${CY}" r="131" fill="none" stroke="${T.tinta}" stroke-width="5" stroke-dasharray="1 ${f1((2 * Math.PI * 131) / 36 - 1)}" transform="rotate(-90.2 ${CX} ${CY})"/>`,
    `<circle cx="${CX}" cy="${CY}" r="128" fill="none" stroke="${T.tinta}" stroke-width=".6"/>`);
  // arcos de tope (225°, magenta) y de alcance (135°, a trazos)
  out.push(`<path${parte('tope')} d="${arcoD(CX, CY, 122, 247.5, 112.5)}" fill="none" stroke="${T.magenta}" stroke-width="6"/>`);
  out.push(`<path${parte('alcance')} d="${arcoD(CX, CY, 122, 112.5, 247.5)}" fill="none" stroke="${T.tinta}" stroke-width="1.6" stroke-dasharray="6 3"/>`);
  // sectores de costado y alcance
  out.push(sector(0, 112.5, T.verde, 'verde'), sector(247.5, 360, T.rojo, 'roja'), sector(112.5, 247.5, T.papel, 'alcance', { rayado: ray }));
  // el buque
  out.push(`<path d="M${CX},${CY - 34} C${CX + 14},${CY - 19} ${CX + 16},${CY + 16} ${CX + 12},${CY + 37} L${CX - 12},${CY + 37} C${CX - 16},${CY + 16} ${CX - 14},${CY - 19} ${CX},${CY - 34}Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.4" stroke-linejoin="round"/>`,
    `<line x1="${CX}" y1="${CY - 28}" x2="${CX}" y2="${CY + 34}" stroke="${T.tinta}" stroke-width=".6"/>`,
    `<circle${parte('tope')} cx="${CX}" cy="${CY - 10}" r="3.5" fill="${T.amarillo}" stroke="${T.tinta}" stroke-width="1"/>`);
  // cotas: líneas de referencia y arcos con el ángulo de cada sector
  for (const d of [0, 112.5, 247.5]) { const [x1, y1] = P(d, RS); const [x2, y2] = P(d, 150); out.push(referencia(x1, y1, x2, y2)); }
  out.push(cotaArco(CX, CY, 141, 0, 112.5, '112,5°', { p: 'verde', rEt: 152 }), cotaArco(CX, CY, 141, 247.5, 360, '112,5°', { p: 'roja', rEt: 152 }),
    cotaArco(CX, CY, 141, 112.5, 247.5, '135°', { p: 'alcance' }));
  // rótulos: tope arriba; cartelas de cada sector
  if (situaciones) out.push(etiqueta(CX, 50, 'VUELTA ENCONTRADA', { color: T.magenta, borde: T.magenta, p: 'tope' }));
  else out.push(etiqueta(CX, 50, 'TOPE 225°', { color: T.magenta, borde: T.magenta, p: 'tope' }));
  out.push(rotulo(CX, 22, 'PROA · 000°', { size: TXT.min, weight: 700, estilo: 'cap', espacio: 2 }));
  if (situaciones) {
    out.push(cartela(232, 124, 'SE APARTA', 'él', { color: T.verdeTxt, ancho: 92, p: 'verde' }), cartela(126, 124, 'SE APARTA', 'tú', { color: T.rojoTxt, ancho: 92, p: 'roja' }),
      cartela(CX, 236, 'ALCANCE', 'te apartas tú', { ancho: 106, p: 'alcance' }));
  } else {
    out.push(cartela(232, 124, 'VERDE', 'estribor', { color: T.verdeTxt, ancho: 84, p: 'verde' }), cartela(126, 124, 'ROJA', 'babor', { color: T.rojoTxt, ancho: 84, p: 'roja' }),
      cartela(CX, 236, 'ALCANCE', 'blanca · popa', { ancho: 106, p: 'alcance' }));
  }
  // el observador, sobre la rosa
  if (!ocultarObservador) {
    const [x, y] = P(aspecto, 116);
    out.push(`<g data-parte="tu"><line x1="${CX}" y1="${CY}" x2="${f1(x)}" y2="${f1(y)}" stroke="${T.magenta}" stroke-width="1.4" stroke-dasharray="4 3"/>` +
      `<circle cx="${f1(x)}" cy="${f1(y)}" r="12" fill="${T.magenta}" stroke="${T.papel}" stroke-width="2"/>` +
      `${rotulo(x, y + 4.2, 'tú', { size: TXT.rotulo, weight: 700, estilo: 'serif', color: T.papel })}</g>`);
  }
  out.push(cierra());
  return out.join('');
}

/** Lo que ve de noche el observador situado en `aspecto`: las luces, rotuladas con su nombre. */
export function noche(aspecto, { ocultar = false } = {}) {
  const v = lucesVisibles(aspecto);
  const S = 1.8;
  const C = W / 2;
  const sn = Math.sin((aspecto * Math.PI) / 180);
  const cs = Math.cos((aspecto * Math.PI) / 180);
  const sx = (along, side) => C + (along * sn - side * cs) * S;
  const hw = Math.max(22, (110 * Math.abs(sn) + 22 * Math.abs(cs)) * S * 0.9);
  const nombres = { tope: 'tope', verde: 'verde', roja: 'roja', alcance: 'alcance' };
  const alt = ocultar ? 'Lo que ves de noche: ¿qué luces?' : `Lo que ves de noche: ${['tope', 'verde', 'roja', 'alcance'].filter((k) => v[k]).map((k) => `la ${k === 'tope' ? 'blanca de tope' : k === 'alcance' ? 'blanca de alcance' : k}`).join(', ')}.`;
  const { out, cierra } = lienzo(W, 150, alt, { fondo: T.noche });
  out.push(`<rect y="106" width="${W}" height="44" fill="${T.nocheMar}"/>`);
  out.push(`<rect x="${f1(C - hw / 2)}" y="92" width="${f1(hw)}" height="13" rx="3" fill="${T.nocheMar}" stroke="${T.nocheTxt}" stroke-width=".6" opacity=".8"/>`);
  if (ocultar) {
    out.push(rotulo(C, 78, '?', { size: 40, weight: 700, estilo: 'serif', color: T.luzBlanca }));
  } else {
    const luces = [];
    if (v.tope) luces.push(['tope', sx(14, 0), 50, T.luzBlanca]);
    if (v.verde) luces.push(['verde', sx(8, 9), 84, T.luzVerde]);
    if (v.roja) luces.push(['roja', sx(8, -9), 84, T.luzRoja]);
    if (v.alcance) luces.push(['alcance', sx(-50, 0), 86, T.luzBlanca]);
    // los rótulos, debajo, sin pisarse
    const et = luces.map(([k, x]) => ({ k, x })).sort((a, b) => a.x - b.x);
    for (let i = 1; i < et.length; i++) if (et[i].x - et[i - 1].x < 56) et[i].x = et[i - 1].x + 56;
    const desplaza = et.length ? Math.max(0, et[et.length - 1].x - (W - 40)) : 0;
    for (const [k, x, y, col] of luces) {
      const lx = et.find((e) => e.k === k).x - desplaza;
      out.push(`<g${parte(k)}><circle cx="${f1(x)}" cy="${y}" r="11" fill="${col}" opacity=".25"/><circle cx="${f1(x)}" cy="${y}" r="5.5" fill="${col}"/>` +
        `<line x1="${f1(x)}" y1="${y + 8}" x2="${f1(lx)}" y2="124" stroke="${T.nocheTxt}" stroke-width=".6" opacity=".6"/>` +
        `${rotulo(lx, 138, nombres[k], { size: TXT.rotulo, estilo: 'serif', italic: true, color: T.nocheTxt })}</g>`);
    }
  }
  out.push(cierra());
  return out.join('');
}

/** Desde dónde lo miras, en palabras. */
export function desde(aspecto) {
  const v = lucesVisibles(aspecto);
  if (v.verde && v.roja) return 'de proa: viene hacia ti';
  if (v.alcance) return 'por su popa';
  return v.verde ? 'por su costado de estribor' : 'por su costado de babor';
}

export const MANDO_ASPECTO = {
  id: 'aspecto', tipo: 'rango', etiqueta: 'Desde dónde lo miras', min: 0, max: 355, paso: 5,
  texto: (v) => `${desde(v)} (${v}°)`, extremos: ['proa', 'estribor', 'popa', 'babor', 'proa'],
};

export const PARTES_LUCES = {
  tope: 'Luz de tope: blanca, en el palo, se ve en 225° hacia proa (hasta 22,5° a popa del través por cada banda).',
  verde: 'Luz de costado de estribor: verde, 112,5° desde la proa hasta 22,5° a popa del través de estribor.',
  roja: 'Luz de costado de babor: roja, 112,5° desde la proa hasta 22,5° a popa del través de babor.',
  alcance: 'Luz de alcance: blanca, en la popa, se ve en 135° hacia popa. Si es la única que ves, lo estás alcanzando.',
};
export const BOTONES_LUCES = [['tope', 'Tope'], ['verde', 'Verde'], ['roja', 'Roja'], ['alcance', 'Alcance']];
export const PIE_PLANTA = 'Desde arriba: sus sectores';
export const NOTA_BUQUE = 'Buque de propulsión mecánica de menos de 50 m, en navegación.';
