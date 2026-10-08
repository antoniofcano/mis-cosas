// Balizamiento IALA en planta: canal balizado (entrando y saliendo) y bifurcación de canal (canal principal y
// secundario), en estilo C (docs/ESTILO-LAMINAS.md); y las regiones A y B comparadas (aún con el dibujo antiguo).
// spec canal:       { tipo:'canal', sentido:'entrando'|'saliendo' }
// spec bifurcacion: { tipo:'bifurcacion', marca:'canal-principal-estribor'|'canal-principal-babor', ruta:'principal'|'secundario' }
// spec regiones:    { tipo:'regiones' }
// Fuente: IALA-AISM región A, marcas laterales y laterales modificadas (apéndice de docs/ESTILO-LAMINAS.md).

import { lbl, C, boatGlyph, open, title } from './kit.js';
import { marcaC } from './buoys.js';
import { T, TXT, lienzo, rotulo, cartela, etiqueta, tierra, ondas, barquito, f1 } from './estilo-c.js';

const ROJO = '#dc2626';
const VERDE = '#16a34a';
/** Marca lateral vista de lado, pequeña: cilíndrica (lata) o cónica (solo la lámina antigua de regiones). */
const can = (x, y, c) => `<rect x="${x - 6}" y="${y - 14}" width="12" height="14" fill="${c}" stroke="#0006"/><rect x="${x - 8}" y="${y - 1}" width="16" height="3" rx="1.5" fill="${c}"/>`;
const cone = (x, y, c) => `<path d="M${x - 7},${y} L${x},${y - 16} L${x + 7},${y}Z" fill="${c}" stroke="#0006"/><rect x="${x - 8}" y="${y - 1}" width="16" height="3" rx="1.5" fill="${c}"/>`;
const AGUA = '#38bdf8';
const TIERRA = '#a16207';

/**
 * Lateral pequeña, como el símbolo de la carta: lata (babor, roja) o cono con la punta arriba (estribor, verde), con su
 * número. La forma ya dice el lado aunque no se distinga el color.
 */
function lateral(x, y, lado, n, { p = null } = {}) {
  const st = `stroke="${T.tinta}" stroke-width="1.4" stroke-linejoin="round"`;
  const figura = lado === 'babor'
    ? `<rect x="${f1(x - 7)}" y="${f1(y - 17)}" width="14" height="15" fill="${T.rojo}" ${st}/>`
    : `<polygon points="${f1(x - 8.5)},${f1(y - 2)} ${f1(x + 8.5)},${f1(y - 2)} ${f1(x)},${f1(y - 19)}" fill="${T.verde}" ${st}/>`;
  const base = `<path d="M${f1(x - 10)},${f1(y - 2)} L${f1(x + 10)},${f1(y - 2)} L${f1(x + 7)},${f1(y + 3)} L${f1(x - 7)},${f1(y + 3)}Z" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1"/>`;
  const num = rotulo(lado === 'babor' ? x - 15 : x + 15, y - 4, String(n), { size: TXT.rotulo, estilo: 'mono', weight: 700, anchor: lado === 'babor' ? 'end' : 'start', color: lado === 'babor' ? T.rojoTxt : T.verdeTxt });
  return `<g${p ? ` data-parte="${p}"` : ''}>${figura}${base}${num}</g>`;
}

// ---------------------------------------------------------------------------
// Canal balizado visto desde arriba: el puerto arriba, la mar abajo.

export function canalIllustration(spec) {
  const entrando = (spec.sentido ?? 'entrando') === 'entrando';
  const W = 358;
  const H = 372;
  const alt = entrando
    ? 'Canal balizado visto desde arriba, entrando desde la mar hacia el puerto: las marcas rojas cilíndricas, con números pares, quedan a babor del barco y las verdes cónicas, con números impares, a estribor.'
    : 'Canal balizado visto desde arriba, saliendo del puerto hacia la mar: las marcas no cambian, así que ahora las rojas cilíndricas quedan a estribor del barco y las verdes cónicas a babor.';
  const { out, pt, cierra } = lienzo(W, H, alt, { fondo: T.agua });
  // tierra: el muelle del puerto arriba y las dos orillas del canal
  out.push(tierra(`M0,0 H${W} V58 H290 C286,58 284,60 284,64 V286 C284,300 300,306 ${W},306 V0 Z`, pt));
  out.push(tierra('M0,58 H68 C72,58 74,60 74,64 V286 C74,300 58,306 0,306 Z', pt));
  out.push(cartela(W / 2, 30, 'PUERTO'));
  out.push(ondas(10, W - 10, 322, { sep: 9 }));
  // marcas: rojas (pares) a la izquierda del dibujo, verdes (impares) a la derecha; se numeran desde la mar
  for (let i = 0; i < 3; i++) {
    const y = 262 - i * 82;
    out.push(lateral(96, y, 'babor', 2 * i + 2), lateral(262, y, 'estribor', 2 * i + 1));
  }
  // derrota y barco
  const path = entrando ? 'M179,360 L179,72' : 'M179,72 L179,360';
  out.push(`<line x1="179" y1="76" x2="179" y2="356" stroke="${T.tinta}" stroke-width="1" stroke-dasharray="6 5"/>`);
  out.push(`<g data-parte="barco">${barquito(1.3)}<animateMotion dur="7s" repeatCount="indefinite" rotate="auto" path="${path}"/></g>`);
  out.push(etiqueta(179, entrando ? 92 : 296, entrando ? 'ENTRANDO' : 'SALIENDO', { color: T.magenta }));
  // qué banda es cada una para el barco
  const izq = entrando ? ['BABOR', 'rojas · pares'] : ['ESTRIBOR', 'rojas · pares'];
  const der = entrando ? ['ESTRIBOR', 'verdes · impares'] : ['BABOR', 'verdes · impares'];
  out.push(cartela(84, 343, izq[0], izq[1], { color: T.rojoTxt, ancho: 128 }), cartela(274, 343, der[0], der[1], { color: T.verdeTxt, ancho: 128 }));
  out.push(cierra());
  return { svg: out.join(''), caption: 'El sentido convencional del balizamiento es entrando a puerto (de la mar hacia tierra). Entrando, las rojas (cilíndricas, numeración par) quedan a babor y las verdes (cónicas, impar) a estribor; saliendo, al revés.' };
}

// ---------------------------------------------------------------------------
// Bifurcación de un canal, entrando desde la mar (de abajo arriba)

export function bifurcacionIllustration(spec) {
  const marca = spec.marca === 'canal-principal-babor' ? 'canal-principal-babor' : 'canal-principal-estribor';
  const principal = spec.ruta !== 'secundario';
  const est = marca === 'canal-principal-estribor';
  const derecha = est === principal; // la rama de estribor (derecha, entrando)
  const W = 358;
  const H = 380;
  const nombre = est ? 'roja con una banda verde (modificada de babor)' : 'verde con una banda roja (modificada de estribor)';
  const alt = `Bifurcación de un canal vista desde arriba, entrando desde la mar. En la punta del bajo, una marca ${nombre}: el canal principal sigue a ${est ? 'estribor' : 'babor'}. ` +
    `El barco toma el canal ${principal ? 'principal' : 'secundario'}, a ${derecha ? 'estribor' : 'babor'}, y deja la marca por ${derecha ? 'babor' : 'estribor'}.`;
  const { out, pt, cierra } = lienzo(W, H, alt, { fondo: T.agua });
  // tierra: todo menos la Y del canal y la mar de abajo
  out.push(tierra(`M0,0 H${W} V318 H236 V214 L330,48 H228 L179,160 L130,48 H28 L122,214 V318 H0 Z`, pt));
  out.push(ondas(10, W - 10, 334, { sep: 9 }));
  out.push(rotulo(16, 368, 'MAR · se entra desde aquí', { size: TXT.min, estilo: 'cap', weight: 700, anchor: 'start' }));
  // laterales de región A, entrando: rojas (lata) a babor y verdes (cono) a estribor, en cada rama
  out.push(lateral(140, 300, 'babor', 2), lateral(140, 240, 'babor', 4), lateral(218, 300, 'estribor', 1), lateral(218, 240, 'estribor', 3));
  out.push(lateral(70, 112, 'babor', 6), lateral(150, 96, 'estribor', 5), lateral(208, 96, 'babor', 6), lateral(288, 112, 'estribor', 5));
  // la marca de bifurcación en la punta del bajo
  out.push(marcaC(marca, 179, 208, 0.5, { pt, p: 'marca' }));
  // canales
  const pr = derecha === principal ? 'der' : 'izq';
  out.push(cartela(80, 26, pr === 'izq' ? 'PRINCIPAL' : 'SECUNDARIO', null, { color: pr === 'izq' ? T.magenta : T.tinta, ancho: 118 }),
    cartela(278, 26, pr === 'der' ? 'PRINCIPAL' : 'SECUNDARIO', null, { color: pr === 'der' ? T.magenta : T.tinta, ancho: 118 }));
  // derrota del barco
  const path = derecha ? 'M179,350 L179,232 Q179,214 200,184 L268,56' : 'M179,350 L179,232 Q179,214 158,184 L90,56';
  out.push(`<path d="${path}" fill="none" stroke="${T.tinta}" stroke-width="1.2" stroke-dasharray="6 5"/>`);
  out.push(`<g data-parte="barco">${barquito(1.3)}<animateMotion dur="8s" repeatCount="indefinite" rotate="auto" path="${path}"/></g>`);
  const deja = derecha ? 'babor' : 'estribor';
  out.push(cartela(derecha ? 66 : 292, 196, 'LA DEJA', `por ${deja}`, { ancho: 96 }));
  out.push(cierra());
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
