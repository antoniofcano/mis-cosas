// Dibujo común de «sectores-luces» y «cruce»: el buque visto desde arriba con los sectores de sus luces y lo que
// ve de noche un observador que lo mira desde un punto. Colores de styles/app.css (--l-*).
import { lucesVisibles } from '../../nautical/luces.js';
import { f1, rad, parte } from './kit.js';

const S = 170;
const C = 85;
const pol = (deg, r) => [C + r * Math.sin(rad(deg)), C - r * Math.cos(rad(deg))];

function arcoSector(a, b, r, color, w, p) {
  const [x1, y1] = pol(a, r);
  const [x2, y2] = pol(b, r);
  return `<path${parte(p)} d="M${f1(x1)},${f1(y1)} A${r},${r} 0 ${b - a > 180 ? 1 : 0} 1 ${f1(x2)},${f1(y2)}" fill="none" stroke="${color}" stroke-width="${w}"/>`;
}
function cuna(a, b, r, color, p) {
  const [x1, y1] = pol(a, r);
  const [x2, y2] = pol(b, r);
  return `<path${parte(p)} d="M${C},${C} L${f1(x1)},${f1(y1)} A${r},${r} 0 ${b - a > 180 ? 1 : 0} 1 ${f1(x2)},${f1(y2)}Z" fill="${color}" opacity=".18"/>`;
}

/** Vista cenital: sectores y el observador en `aspecto`. */
export function planta(aspecto, { ocultarObservador = false } = {}) {
  const o = [`<svg viewBox="0 0 ${S} ${S}" class="il lam-svg" role="img" aria-label="Vista desde arriba con los sectores de cada luz"><rect width="${S}" height="${S}" rx="10" fill="var(--l-mar)"/>`];
  o.push(cuna(-112.5, 0, 70, 'var(--l-roja)', 'roja'), cuna(0, 112.5, 70, 'var(--l-verde)', 'verde'), cuna(112.5, 247.5, 70, 'var(--l-alcance)', 'alcance'));
  o.push(arcoSector(-112.5, 112.5, 74, 'var(--l-tope)', 4, 'tope'));
  o.push(arcoSector(0, 112.5, 62, 'var(--l-verde)', 6, 'verde'), arcoSector(-112.5, 0, 62, 'var(--l-roja)', 6, 'roja'), arcoSector(112.5, 247.5, 62, 'var(--l-alcance)', 6, 'alcance'));
  o.push(`<path d="M85 58c8 9 9 20 9 30v20h-18v-20c0-10 1-21 9-30z" fill="var(--l-casco)" stroke="var(--text)" stroke-width="1"/>`);
  o.push(`<text x="85" y="14" font-size="13" text-anchor="middle" fill="var(--text)" style="font-family:inherit">proa ↑</text>`);
  if (!ocultarObservador) {
    const [x, y] = pol(aspecto, 78);
    o.push(`<line x1="85" y1="85" x2="${f1(x)}" y2="${f1(y)}" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="4 3"/><circle cx="${f1(x)}" cy="${f1(y)}" r="7" fill="var(--accent)" stroke="var(--surface)" stroke-width="2"/>`);
  }
  o.push('</svg>');
  return o.join('');
}

/** Lo que ve de noche el observador situado en `aspecto`. */
export function noche(aspecto, { ocultar = false } = {}) {
  const v = lucesVisibles(aspecto);
  const sn = Math.sin(rad(aspecto));
  const cs = Math.cos(rad(aspecto));
  const sx = (along, side) => C + along * sn - side * cs;
  const w = Math.max(18, 110 * Math.abs(sn) + 22 * Math.abs(cs));
  const o = [`<svg viewBox="0 0 ${S} ${S}" class="il lam-svg" role="img" aria-label="${ocultar ? 'Lo que ves de noche' : 'Lo que ves de noche: luces visibles'}"><rect width="${S}" height="${S}" rx="10" fill="var(--l-noche)"/>`];
  o.push(`<rect x="${f1(C - w / 2)}" y="100" width="${f1(w)}" height="14" rx="4" fill="var(--l-casco-noche)"/><rect y="118" width="${S}" height="52" fill="var(--l-mar-noche)"/>`);
  const luz = (x, y, color, p) => `<g${parte(p)}><circle cx="${f1(x)}" cy="${y}" r="10" fill="${color}" opacity=".25"/><circle cx="${f1(x)}" cy="${y}" r="5" fill="${color}"/></g>`;
  if (ocultar) o.push(`<text x="85" y="70" font-size="40" text-anchor="middle" fill="var(--l-luz-blanca)" style="font-family:inherit">?</text>`);
  else {
    if (v.tope) o.push(luz(sx(14, 0), 58, 'var(--l-luz-blanca)', 'tope'));
    if (v.verde) o.push(luz(sx(8, 9), 92, 'var(--l-luz-verde)', 'verde'));
    if (v.roja) o.push(luz(sx(8, -9), 92, 'var(--l-luz-roja)', 'roja'));
    if (v.alcance) o.push(luz(sx(-50, 0), 94, 'var(--l-luz-blanca)', 'alcance'));
  }
  o.push('</svg>');
  return o.join('');
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
export const PIE_PLANTA = 'Desde arriba';
export const NOTA_BUQUE = 'Buque de propulsión mecánica de menos de 50 m, en navegación.';
