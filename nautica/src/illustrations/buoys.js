// Ilustraciones: balizamiento IALA región A. Boyas de castillete con sus franjas, marca de tope y luz rítmica.
// spec: { tipo:'boya', clase, ritmo?, reloj?: bool, comparar?: [clases] }
//   clases: babor, estribor, canal-principal-estribor (bifurcación: rojo/verde/rojo), canal-principal-babor,
//           cardinal-n, cardinal-e, cardinal-s, cardinal-w, peligro-aislado, aguas-navegables, especial, nuevo-peligro

import { blinkingLight, rhythmTimeline } from './lights.js';

const C = { R: '#dc2626', G: '#16a34a', Y: '#eab308', K: '#111827', W: '#ffffff', Bu: '#2563eb' };

export const BUOYS = {
  babor: { nombre: 'Lateral de babor', franjas: ['R'], tope: 'cilindro-R', ritmo: 'Fl R 4s', nota: 'Entrando en puerto se deja por babor. Roja; marca de tope cilíndrica (o boya cilíndrica).' },
  estribor: { nombre: 'Lateral de estribor', franjas: ['G'], tope: 'cono-arriba-G', ritmo: 'Fl G 4s', nota: 'Entrando en puerto se deja por estribor. Verde; marca de tope cónica con el vértice arriba (o boya cónica).' },
  'canal-principal-estribor': { nombre: 'Bifurcación: canal principal a estribor', franjas: ['R', 'G', 'R'], tope: 'cilindro-R', ritmo: 'Fl(2+1) R 10s', nota: 'Modificada de babor: roja con banda verde. El canal principal queda a estribor.' },
  'canal-principal-babor': { nombre: 'Bifurcación: canal principal a babor', franjas: ['G', 'R', 'G'], tope: 'cono-arriba-G', ritmo: 'Fl(2+1) G 10s', nota: 'Modificada de estribor: verde con banda roja. El canal principal queda a babor.' },
  'cardinal-n': { nombre: 'Cardinal Norte', franjas: ['K', 'Y'], tope: 'conos-arriba', ritmo: 'Q', nota: 'Pasa por el norte. Conos hacia arriba; negro arriba. Centelleo continuo.' },
  'cardinal-e': { nombre: 'Cardinal Este', franjas: ['K', 'Y', 'K'], tope: 'conos-bases', ritmo: 'Q(3) 10s', nota: 'Pasa por el este. Conos opuestos por la base (rombo); negro con banda amarilla. 3 centelleos (las 3 del reloj).' },
  'cardinal-s': { nombre: 'Cardinal Sur', franjas: ['Y', 'K'], tope: 'conos-abajo', ritmo: 'Q(6)+LFl 15s', nota: 'Pasa por el sur. Conos hacia abajo; negro abajo. 6 centelleos + destello largo (las 6).' },
  'cardinal-w': { nombre: 'Cardinal Oeste', franjas: ['Y', 'K', 'Y'], tope: 'conos-vertices', ritmo: 'Q(9) 15s', nota: 'Pasa por el oeste. Conos unidos por el vértice (copa); amarillo con banda negra. 9 centelleos (las 9).' },
  'peligro-aislado': { nombre: 'Peligro aislado', franjas: ['K', 'R', 'K'], tope: 'dos-esferas-K', ritmo: 'Fl(2) 5s', nota: 'Peligro de extensión reducida con aguas navegables alrededor. Negra con banda roja; dos esferas negras.' },
  'aguas-navegables': { nombre: 'Aguas navegables', franjas: ['R', 'W', 'R', 'W'], verticales: true, tope: 'esfera-R', ritmo: 'LFl 10s', nota: 'Centro del canal o recalada. Franjas verticales rojas y blancas; esfera roja. Isofase, ocultaciones, destello largo o Mo(A).' },
  especial: { nombre: 'Marca especial', franjas: ['Y'], tope: 'aspa-Y', ritmo: 'Fl Y 5s', nota: 'Zonas especiales (balizamiento de playas, conducciones, ejercicios…). Amarilla con aspa amarilla.' },
  'nuevo-peligro': { nombre: 'Nuevo peligro', franjas: ['Bu', 'Y', 'Bu', 'Y'], verticales: true, tope: 'cruz-Y', ritmo: 'Al.Bu/Y 3s', nota: 'Peligro aún no cartografiado. Franjas verticales azules y amarillas; luz alternativa azul/amarilla.' },
};

/** Una boya de castillete en (x, y = base), escala k. */
export function buoySvg(clase, x, y, k = 1, ritmo) {
  const b = BUOYS[clase];
  if (!b) return '';
  const w = 26 * k;
  const h = 46 * k;
  const top = y - h;
  const out = [`<g class="il-buoy">`];
  // cuerpo (castillete trapezoidal) con franjas
  const clipId = `cl-${clase}-${Math.round(x)}-${Math.round(y)}`;
  out.push(`<defs><clipPath id="${clipId}"><path d="M${x - w / 2},${y} L${x - w / 4},${top} L${x + w / 4},${top} L${x + w / 2},${y}Z"/></clipPath></defs>`);
  out.push(`<g clip-path="url(#${clipId})">`);
  const n = b.franjas.length;
  b.franjas.forEach((c, i) => {
    out.push(b.verticales
      ? `<rect x="${x - w / 2 + (w * i) / n}" y="${top}" width="${w / n + 0.5}" height="${h}" fill="${C[c]}"/>`
      : `<rect x="${x - w / 2}" y="${top + (h * i) / n}" width="${w}" height="${h / n + 0.5}" fill="${C[c]}"/>`);
  });
  out.push('</g>');
  out.push(`<path d="M${x - w / 2},${y} L${x - w / 4},${top} L${x + w / 4},${top} L${x + w / 2},${y}Z" fill="none" stroke="#0007" stroke-width="1"/>`);
  // flotador y mar
  out.push(`<rect x="${x - w * 0.65}" y="${y - 2 * k}" width="${w * 1.3}" height="${6 * k}" rx="${3 * k}" fill="${C[b.franjas[b.franjas.length - 1]]}" stroke="#0007"/>`);
  // mástil y marca de tope
  const mt = top - 10 * k;
  out.push(`<line x1="${x}" y1="${top}" x2="${x}" y2="${mt - 14 * k}" stroke="#374151" stroke-width="${1.6 * k}"/>`);
  out.push(topmark(b.tope, x, mt, k));
  // luz
  out.push(blinkingLight(x, top - 4 * k, 3.2 * k, ritmo ?? b.ritmo));
  out.push('</g>');
  return out.join('');
}

function cone(x, y, s, up, fill) {
  return up
    ? `<path d="M${x - s},${y + s * 0.9} L${x},${y - s * 0.9} L${x + s},${y + s * 0.9}Z" fill="${fill}"/>`
    : `<path d="M${x - s},${y - s * 0.9} L${x},${y + s * 0.9} L${x + s},${y - s * 0.9}Z" fill="${fill}"/>`;
}

function topmark(t, x, y, k) {
  const s = 6 * k;
  switch (t) {
    case 'cilindro-R': return `<rect x="${x - s * 0.8}" y="${y - s * 1.6}" width="${s * 1.6}" height="${s * 2}" fill="${C.R}"/>`;
    case 'cono-arriba-G': return cone(x, y - s * 0.6, s, true, C.G);
    case 'conos-arriba': return cone(x, y - s * 2.4, s, true, C.K) + cone(x, y - s * 0.2, s, true, C.K);
    case 'conos-abajo': return cone(x, y - s * 2.4, s, false, C.K) + cone(x, y - s * 0.2, s, false, C.K);
    case 'conos-bases': return cone(x, y - s * 2.6, s, true, C.K) + cone(x, y - s * 0.8, s, false, C.K);
    case 'conos-vertices': return cone(x, y - s * 2.4, s, false, C.K) + cone(x, y - s * 0.4, s, true, C.K);
    case 'dos-esferas-K': return `<circle cx="${x}" cy="${y - s * 2.4}" r="${s * 0.8}" fill="${C.K}"/><circle cx="${x}" cy="${y - s * 0.6}" r="${s * 0.8}" fill="${C.K}"/>`;
    case 'esfera-R': return `<circle cx="${x}" cy="${y - s}" r="${s}" fill="${C.R}"/>`;
    case 'aspa-Y': return `<path d="M${x - s},${y - s * 2} L${x + s},${y} M${x + s},${y - s * 2} L${x - s},${y}" stroke="${C.Y}" stroke-width="${2.6 * k}"/>`;
    case 'cruz-Y': return `<path d="M${x},${y - s * 2.2} L${x},${y} M${x - s},${y - s * 1.1} L${x + s},${y - s * 1.1}" stroke="${C.Y}" stroke-width="${2.6 * k}"/>`;
    default: return '';
  }
}

/** Ilustración completa de una boya: dibujo, nombre, característica animada y cronograma. */
export function buoyIllustration(spec) {
  const b = BUOYS[spec.clase];
  if (!b) return null;
  const ritmo = spec.ritmo ?? b.ritmo;
  if (spec.reloj || spec.clase?.startsWith('cardinal') && spec.reloj !== false) return cardinalClock(spec.clase);
  const W = 300;
  const H = 190;
  const svg = `<svg viewBox="0 0 ${W} ${H}" class="il" role="img" aria-label="${b.nombre}">` +
    `<rect width="${W}" height="${H}" rx="10" class="il-sky"/><rect y="${H - 46}" width="${W}" height="46" class="il-sea"/>` +
    buoySvg(spec.clase, 80, H - 40, 1.6, ritmo) +
    `<text x="150" y="34" class="il-title on-light">${b.nombre}</text>` +
    `<text x="150" y="54" class="il-sub" text-anchor="middle">Luz: ${ritmo}</text>` +
    rhythmTimeline(150, 66, 132, 14, ritmo) +
    '</svg>';
  return { svg, caption: b.nota };
}

/** Las cuatro cardinales alrededor de un peligro, con el «reloj» (3, 6, 9 y continuo). */
export function cardinalClock(highlight) {
  const W = 320;
  const H = 300;
  const cx = 160;
  const cy = 158;
  const R = 92;
  const pos = { 'cardinal-n': [cx, cy - R], 'cardinal-e': [cx + R, cy], 'cardinal-s': [cx, cy + R], 'cardinal-w': [cx - R, cy] };
  const lbl = { 'cardinal-n': 'N · Q continuo (las 12)', 'cardinal-e': 'E · Q(3) (las 3)', 'cardinal-s': 'S · Q(6)+LFl (las 6)', 'cardinal-w': 'W · Q(9) (las 9)' };
  const out = [`<svg viewBox="0 0 ${W} ${H}" class="il" role="img" aria-label="Marcas cardinales">`, `<rect width="${W}" height="${H}" rx="10" class="il-sea"/>`];
  out.push(`<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#fff8" stroke-dasharray="4 4"/>`);
  out.push(`<circle cx="${cx}" cy="${cy}" r="16" fill="#92400e"/><text x="${cx}" y="${cy + 4}" font-size="10" text-anchor="middle" fill="#fff">peligro</text>`);
  for (const [k, [x, y]] of Object.entries(pos)) {
    const hl = !highlight || highlight === k;
    out.push(`<g opacity="${hl ? 1 : 0.45}">${buoySvg(k, x, y + 22, 0.9)}</g>`);
    out.push(`<text x="${x}" y="${y + 38}" font-size="10" text-anchor="middle" class="il-lbl on-dark${hl && highlight ? ' strong' : ''}">${lbl[k]}</text>`);
  }
  out.push(`<text x="${cx}" y="18" class="il-title on-dark">Pasa por el lado que indica la marca</text>`);
  out.push('</svg>');
  const b = BUOYS[highlight];
  return { svg: out.join(''), caption: b ? b.nota : 'Las cardinales se leen como un reloj: E las 3, S las 6, W las 9; la N centellea sin parar.' };
}
