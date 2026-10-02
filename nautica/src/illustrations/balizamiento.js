// Balizamiento IALA en planta: bifurcación de canal (canal principal y secundario) y regiones A y B comparadas.
// spec bifurcacion: { tipo:'bifurcacion', marca:'canal-principal-estribor'|'canal-principal-babor', ruta:'principal'|'secundario' }
// spec regiones:    { tipo:'regiones' }

import { open, title, lbl, C, boatGlyph } from './kit.js';
import { buoySvg } from './buoys.js';

const ROJO = '#dc2626';
const VERDE = '#16a34a';
/** Marca lateral vista de lado, pequeña: cilíndrica (lata) o cónica. */
const can = (x, y, c) => `<rect x="${x - 6}" y="${y - 14}" width="12" height="14" fill="${c}" stroke="#0006"/><rect x="${x - 8}" y="${y - 1}" width="16" height="3" rx="1.5" fill="${c}"/>`;
const cone = (x, y, c) => `<path d="M${x - 7},${y} L${x},${y - 16} L${x + 7},${y}Z" fill="${c}" stroke="#0006"/><rect x="${x - 8}" y="${y - 1}" width="16" height="3" rx="1.5" fill="${c}"/>`;
const AGUA = '#38bdf8';
const TIERRA = '#a16207';

// ---------------------------------------------------------------------------
// Bifurcación de un canal, entrando desde la mar (de abajo arriba)

export function bifurcacionIllustration(spec) {
  const marca = spec.marca === 'canal-principal-babor' ? 'canal-principal-babor' : 'canal-principal-estribor';
  const principal = spec.ruta !== 'secundario';
  const est = marca === 'canal-principal-estribor';
  const derecha = est === principal; // la rama de estribor (derecha, entrando)
  const W = 320;
  const H = 340;
  const out = open(W, H, 'Bifurcación de canal', 'bf');
  out.push(title(W / 2, 'Bifurcación: canal principal y secundario'));
  // tierra y agua
  out.push(`<rect x="0" y="34" width="${W}" height="${H - 34 - 40}" fill="${TIERRA}" opacity=".35"/>`);
  out.push(`<path d="M110,${H - 40} L110,200 L28,44 L118,44 L160,150 L202,44 L292,44 L210,200 L210,${H - 40}Z" fill="${AGUA}" opacity=".45"/>`);
  out.push(`<rect x="0" y="${H - 40}" width="${W}" height="30" fill="${AGUA}" opacity=".45"/>`, lbl(W / 2, H - 21, 'MAR · se entra desde aquí', null, 'middle', 'font-weight="700"'));
  // laterales región A: rojas a babor (izquierda) y verdes a estribor, entrando
  out.push(can(104, 300, ROJO), can(104, 236, ROJO), cone(216, 300, VERDE), cone(216, 236, VERDE));
  out.push(can(46, 104, ROJO), cone(124, 92, VERDE), can(196, 92, ROJO), cone(274, 104, VERDE));
  // marca de bifurcación en la punta del bajo
  out.push(buoySvg(marca, 160, 196, 0.62));
  // rótulos de los canales
  const lp = principal ? (derecha ? 'right' : 'left') : (derecha ? 'left' : 'right');
  const txtR = lp === 'right' ? 'canal principal' : 'canal secundario';
  const txtL = lp === 'left' ? 'canal principal' : 'canal secundario';
  out.push(lbl(262, 64, txtR, null, 'middle', `font-weight="700" ${txtR === 'canal principal' ? '' : 'opacity=".75"'}`), lbl(58, 64, txtL, null, 'middle', `font-weight="700" ${txtL === 'canal principal' ? '' : 'opacity=".75"'}`));
  // derrota del barco
  const path = derecha ? 'M160,330 L160,214 Q160,196 182,170 L246,52' : 'M160,330 L160,214 Q160,196 138,170 L74,52';
  out.push(`<path d="${path}" fill="none" stroke="${C.v}" stroke-dasharray="5 5" opacity=".7"/>`);
  out.push(`<g>${boatGlyph(C.v, 1.1)}<animateMotion dur="7s" repeatCount="indefinite" rotate="auto" path="${path}"/></g>`);
  const deja = derecha ? 'babor' : 'estribor';
  out.push(lbl(derecha ? 144 : 176, 182, 'la deja', null, derecha ? 'end' : 'start', 'font-weight="700"'), lbl(derecha ? 144 : 176, 194, `por ${deja}`, null, derecha ? 'end' : 'start', 'font-weight="700"'));
  out.push('</svg>');
  const nombre = est ? 'roja con una banda verde (modificada de babor)' : 'verde con una banda roja (modificada de estribor)';
  const cap = `Marca de bifurcación ${nombre}: el canal principal está a ${est ? 'estribor' : 'babor'}. Entrando, para seguir el principal se deja como ${est ? 'una roja, por babor' : 'una verde, por estribor'}; para el secundario, por la otra banda. Luz ${est ? 'roja' : 'verde'} Fl(2+1). Es región A.`;
  return { svg: out.join(''), caption: cap };
}

// ---------------------------------------------------------------------------
// Regiones A y B

export function regionesIllustration() {
  const W = 340;
  const H = 316;
  const out = open(W, H, 'Regiones A y B', 'rg');
  out.push(title(W / 2, 'Regiones de balizamiento A y B (entrando)'));
  const panel = (x0, reg) => {
    const izq = reg === 'A' ? ROJO : VERDE; // babor, entrando
    const der = reg === 'A' ? VERDE : ROJO;
    const o = [];
    o.push(`<rect x="${x0}" y="44" width="160" height="196" fill="${TIERRA}" opacity=".3"/><rect x="${x0 + 34}" y="44" width="92" height="196" fill="${AGUA}" opacity=".45"/>`);
    o.push(`<text x="${x0 + 80}" y="62" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">Región ${reg}</text>`);
    for (const y of [130, 200]) o.push(can(x0 + 28, y, izq), cone(x0 + 132, y, der));
    const path = `M${x0 + 80},240 L${x0 + 80},74`;
    o.push(`<g>${boatGlyph(C.v)}<animateMotion dur="5s" repeatCount="indefinite" rotate="auto" path="${path}"/></g>`);
    o.push(lbl(x0 + 30, 254, 'babor', null, 'middle', 'font-size="9.5"'), lbl(x0 + 30, 266, izq === ROJO ? 'roja' : 'verde', izq === ROJO ? 'r' : 'm', 'middle', 'font-weight="700"'));
    o.push(lbl(x0 + 130, 254, 'estribor', null, 'middle', 'font-size="9.5"'), lbl(x0 + 130, 266, der === ROJO ? 'roja' : 'verde', der === ROJO ? 'r' : 'm', 'middle', 'font-weight="700"'));
    return o.join('');
  };
  out.push(panel(6, 'A'), panel(174, 'B'));
  out.push(lbl(W / 2, 288, 'Las formas no cambian: cilíndrica a babor, cónica a estribor', null, 'middle', 'font-size="9.5"'));
  out.push(lbl(W / 2, 304, 'B: América, Japón, Corea del Sur y Filipinas · A: el resto', 'g', 'middle', 'font-size="9.5"'));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Entrando a puerto, en la región A (Europa, España incluida) las laterales de babor son rojas y las de estribor verdes; en la región B, al revés. Las formas (cilíndrica a babor, cónica a estribor) y las demás marcas (cardinales, peligro aislado, aguas navegables, especiales) son iguales en las dos regiones.' };
}
