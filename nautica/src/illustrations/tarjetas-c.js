// Anverso de las tarjetas de memoria en estilo C (docs/ESTILO-LAMINAS.md): el estímulo (marca, bandera, señal acústica,
// escala…) dibujado a buen tamaño y sin ningún rótulo que delate la respuesta, con su texto alternativo, que dice cómo
// es y nunca qué es. El mazo sin dibujo en estilo C todavía (buques) reutiliza su lámina de
// siempre sin rótulos (sinRotulos), dentro del mismo marco de tarjeta. Sin DOM.

import { T, TXT, f1, lienzo, rotulo, etiqueta, anchoTexto, ondas } from './estilo-c.js';
import { BUOYS, marcaC } from './buoys.js';
import { cronoC, parseRhythm, NOMBRE_LUZ } from './lights.js';
import { SHIPS } from './ships.js';
import { banderaC, BANDERA_C, sonidoC, altSonido } from './senales-c.js';
import { BEAUFORT, DOUGLAS } from './meteo.js';
import { renderIllustration } from './index.js';
import { sinRotulos } from '../course/tarjetas.js';
import { SOCORRO, pictoSocorro } from './socorro.js';

// ---------------------------------------------------------------------------
// Balizamiento: la marca grande, en el agua, con su luz y el cronograma del ritmo

const luzDe = (ritmo) => {
  const rh = parseRhythm(ritmo);
  return [...new Set(rh.steps.filter((s) => s.on).map((s) => NOMBRE_LUZ[s.color ?? rh.colors[0]]))].join(' y ');
};

/** Cómo es una marca (colores, tope y luz), sin su nombre. */
export const altBoya = (clase) => {
  const b = BUOYS[clase];
  return `Marca de castillete ${b.colores}, con marca de tope ${b.topeTxt}; luz ${luzDe(b.ritmo)} con el ritmo ${b.ritmo}.`;
};

function anversoBoya(clase) {
  const b = BUOYS[clase];
  if (!b) return null;
  const W = 358;
  const H = 250;
  const { out, pt, cierra } = lienzo(W, H, altBoya(clase));
  out.push(`<rect x="0" y="206" width="${W}" height="${H - 206}" fill="${T.agua}"/>`, ondas(8, W - 8, 218));
  out.push(marcaC(clase, 96, 214, 1.8, { pt, ritmo: b.ritmo }));
  const X = 186;
  const w = W - X - 18;
  out.push(rotulo(X, 92, 'LUZ', { size: TXT.min, weight: 700, estilo: 'cap', anchor: 'start', color: T.apagado }));
  const ew = anchoTexto(b.ritmo, TXT.rotulo + 1, 'mono') + 10;
  out.push(etiqueta(X + ew / 2, 114, b.ritmo, { color: T.magenta, size: TXT.rotulo + 1 }));
  out.push(cronoC(X, 136, w, 16, b.ritmo));
  out.push(cierra());
  return { svg: out.join(''), alt: altBoya(clase), estiloC: true };
}

// ---------------------------------------------------------------------------
// Buques (dibujo antiguo, pendiente de migrar): el texto alternativo describe sus luces y marcas

const LUZ_BUQUE = { tope: 'blanca de tope', 'todo-W': 'blanca todo horizonte', 'todo-R': 'roja todo horizonte', 'todo-G': 'verde todo horizonte', remolque: 'amarilla de remolque', linterna: 'linterna blanca', tricolor: 'farol tricolor en el tope' };
const MARCA_DIA = { 'cono-abajo': 'un cono con el vértice abajo', bicono: 'un bicono (rombo)', diabolo: 'dos conos unidos por el vértice', bola: 'una bola', 'bandera-A': 'una bandera A rígida', cilindro: 'un cilindro' };
const lista = (xs) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} y ${xs.at(-1)}` : xs[0] ?? '');

/** Luces y marcas de un buque, de arriba abajo, sin decir qué buque es. */
export function altBuque(clase) {
  const s = SHIPS[clase];
  if (!s) return '';
  const donde = { proa: 'a proa', centro: 'en el palo', popa: 'a popa' };
  const grupos = ['proa', 'centro', 'popa'].map((at) => {
    const ls = s.luces.filter((l) => l[1] === at).sort((a, b) => b[2] - a[2]).map((l) => `${LUZ_BUQUE[l[0]] ?? l[0]}${l[3]?.lado ? ' (a una banda)' : ''}`);
    return ls.length ? `${donde[at]}, ${lista(ls)}` : null;
  }).filter(Boolean);
  const extra = [];
  if (!s.sinCostados) extra.push('luces de costado');
  if (!s.sinAlcance) extra.push('luz de alcance');
  const luces = grupos.length ? `De noche: ${grupos.join('; ')}` : 'De noche: sin luces de tope ni todo horizonte';
  const costados = extra.length ? `; además, ${lista(extra)}${s.opcionalCostados ? ' solo con arrancada' : ''}` : '';
  const dia = s.dia?.length ? `De día, en el palo y de arriba abajo: ${lista(s.dia.map((d) => MARCA_DIA[d] ?? d))}${s.diaLados ? ', y marcas a una banda' : ''}.` : 'De día, sin marca específica.';
  return `${luces}${costados}. ${dia}`;
}

// ---------------------------------------------------------------------------
// Señales de peligro: el pictograma de la lámina, en grande y sin rótulos (src/illustrations/socorro.js)

function anversoSocorro(id) {
  const s = SOCORRO[id];
  if (!s) return null;
  const W = 358;
  const H = 230;
  const { out, cierra } = lienzo(W, H, s.forma);
  out.push(`<rect x="74" y="30" width="210" height="170" fill="${T.fondo}" stroke="${T.tinta}" stroke-width=".7"/>`, pictoSocorro(id, 179, 115, 2.3), cierra());
  return { svg: out.join(''), alt: s.forma, estiloC: true };
}

// ---------------------------------------------------------------------------
// Escalas (Beaufort y Douglas): una regla graduada con el grado marcado en magenta (adorno: la cifra va en el texto)

function regla(n, max) {
  const W = 358;
  const H = 58;
  const x0 = 24;
  const paso = (W - 2 * x0) / max;
  const o = [`<svg viewBox="0 0 ${W} ${H}" class="il lc tc-regla" aria-hidden="true" focusable="false">`,
    `<line x1="${x0}" y1="30" x2="${W - x0}" y2="30" stroke="${T.tinta}" stroke-width="1"/>`];
  for (let i = 0; i <= max; i++) {
    const x = x0 + i * paso;
    const es = i === n;
    o.push(`<line x1="${f1(x)}" y1="${es ? 22 : 25}" x2="${f1(x)}" y2="30" stroke="${es ? T.magenta : T.tinta}" stroke-width="${es ? 1.6 : 1}"/>`,
      rotulo(x, 48, String(i), { size: TXT.rotulo, estilo: 'mono', weight: es ? 700 : 400, color: es ? T.magenta : T.apagado }));
  }
  const x = x0 + n * paso;
  o.push(`<polygon points="${f1(x - 6)},10 ${f1(x + 6)},10 ${f1(x)},20" fill="${T.magenta}"/>`, '</svg>');
  return o.join('');
}

// ---------------------------------------------------------------------------

/**
 * Anverso de una tarjeta.
 * @returns {{ svg?: string, alt: string, estiloC: boolean, texto?: { eti: string, grande: string, mono?: boolean }, regla?: string, descripcion?: string }}
 *   svg: el dibujo (role="img" con `alt` de nombre accesible); texto: el estímulo cuando es una palabra o una cifra
 *   (va en el HTML, en grande); regla: adorno de las escalas; estiloC: false si el dibujo es el antiguo; descripcion: lo
 *   que se ve, para la nota del reverso cuando la tarjeta no tiene otra (las luces y marcas de un buque)
 */
export function anversoTarjeta(mazo, carta) {
  const id = carta.id;
  switch (mazo) {
    case 'balizamiento': return anversoBoya(id);
    case 'banderas': {
      const r = banderaC(id, { rotulos: false, alt: BANDERA_C[id]?.forma });
      return r && { svg: r.svg, alt: BANDERA_C[id].forma, estiloC: true };
    }
    case 'sonidos': {
      const r = sonidoC(id, { alt: altSonido(id) });
      return r && { svg: r.svg, alt: altSonido(id), estiloC: true, sonido: id };
    }
    case 'socorro': return anversoSocorro(id);
    case 'beaufort': return { alt: `Fuerza ${id} de la escala Beaufort, de 0 a ${BEAUFORT.length - 1}.`, estiloC: true, texto: { eti: 'Escala Beaufort', grande: `Fuerza ${id}` }, regla: regla(Number(id), BEAUFORT.length - 1) };
    case 'douglas': return { alt: `Grado ${id} de la escala Douglas, de 0 a ${DOUGLAS.length - 1}.`, estiloC: true, texto: { eti: 'Escala Douglas', grande: `Grado ${id}` }, regla: regla(Number(id), DOUGLAS.length - 1) };
    case 'fuego': return { alt: `Clase ${id} de fuego.`, estiloC: true, texto: { eti: 'Clases de fuego', grande: `Clase ${id}` } };
    case 'gnss': return { alt: `Sigla ${carta.anverso.texto} de la pantalla del GNSS.`, estiloC: true, texto: { eti: 'Pantalla del GNSS', grande: carta.anverso.texto, mono: true } };
    default: {
      // dibujo antiguo sin rótulos (buques): pendiente de migrar al estilo C
      const a = carta.anverso;
      const r = a.spec ? renderIllustration(a.spec) : null;
      if (!r) return a.texto ? { alt: a.texto, estiloC: false, texto: { eti: '', grande: a.texto } } : null;
      const descripcion = mazo === 'buques' ? altBuque(id) : null;
      const alt = mazo === 'buques' ? `Un buque visto de proa, por sus dos bandas y de popa. ${descripcion}` : 'Lámina sin rótulos.';
      const esc = alt.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
      return { svg: sinRotulos(r.svg, a.quitar).replace(/aria-label="[^"]*"/, `aria-label="${esc}"`), alt, descripcion, estiloC: false };
    }
  }
}
