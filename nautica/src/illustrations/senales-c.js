// Señales en estilo C (docs/ESTILO-LAMINAS.md): banderas del Código Internacional y señales acústicas del RIPA
// (reglas 34 y 35). Dos láminas (`bandera` y `sonido`) y sus piezas, que también dibujan el anverso de las tarjetas de
// memoria (src/illustrations/tarjetas-c.js) sin ningún rótulo que delate la respuesta. Solo colores T.* (--lc-*).

import { T, TXT, f1, lienzo, cartela, rotulo, ondas } from './estilo-c.js';
import { FLAGS } from './misc.js';
import { SENALES } from './situations.js';

// ---------------------------------------------------------------------------
// Banderas

/** Cómo es cada bandera (sin decir qué significa): el texto alternativo del anverso y parte del de la lámina. */
export const BANDERA_C = {
  A: { letra: 'A', fonetica: 'ALFA', forma: 'Bandera partida en vertical: blanca junto al asta y azul al batiente, con un corte en V (cola de golondrina).' },
  buceo: { letra: null, fonetica: 'BUCEO', forma: 'Bandera roja con una franja blanca en diagonal, de la esquina alta del asta a la esquina baja del batiente.' },
  O: { letra: 'O', fonetica: 'OSCAR', forma: 'Bandera partida en diagonal: roja la mitad de arriba, hacia el batiente, y amarilla la de abajo, junto al asta.' },
  N: { letra: 'N', fonetica: 'NOVEMBER', forma: 'Bandera a cuadros azules y blancos, cuatro por cuatro, como un damero.' },
  C: { letra: 'C', fonetica: 'CHARLIE', forma: 'Bandera de cinco franjas horizontales: azul, blanca, roja, blanca y azul.' },
  B: { letra: 'B', fonetica: 'BRAVO', forma: 'Bandera toda roja con un corte en V al batiente (cola de golondrina).' },
  H: { letra: 'H', fonetica: 'HOTEL', forma: 'Bandera partida en vertical: blanca junto al asta y roja al batiente.' },
  U: { letra: 'U', fonetica: 'UNIFORM', forma: 'Bandera de cuatro cuarteles: rojos el de arriba junto al asta y el de abajo al batiente, blancos los otros dos.' },
  V: { letra: 'V', fonetica: 'VICTOR', forma: 'Bandera blanca con un aspa roja de esquina a esquina.' },
  W: { letra: 'W', fonetica: 'WHISKEY', forma: 'Bandera azul con un recuadro blanco y un cuadrado rojo en el centro.' },
};

const R = (x, y, w, h, fill) => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${fill}"/>`;
const P = (pts, fill) => `<polygon points="${pts.map(([a, b]) => `${f1(a)},${f1(b)}`).join(' ')}" fill="${fill}"/>`;

/** Contorno de la bandera (con cola de golondrina en la A y la B): lo que se rellena y se perfila. */
function contorno(codigo, x, y, w, h) {
  if (codigo === 'A' || codigo === 'B') return [[x, y], [x + w, y], [x + w * 0.75, y + h / 2], [x + w, y + h], [x, y + h]];
  return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
}

/** El paño de una bandera en (x, y), de w × h, con su contorno de tinta. */
export function panoBandera(codigo, x, y, w, h) {
  const { blanco, azul, rojo, amarillo } = { blanco: T.blanco, azul: T.azul, rojo: T.rojo, amarillo: T.amarillo };
  const o = [];
  switch (codigo) {
    case 'A': o.push(R(x, y, w / 2, h, blanco), P([[x + w / 2, y], [x + w, y], [x + w * 0.75, y + h / 2], [x + w, y + h], [x + w / 2, y + h]], azul)); break;
    case 'B': o.push(P(contorno('B', x, y, w, h), rojo)); break;
    case 'buceo': o.push(R(x, y, w, h, rojo), P([[x, y], [x + w * 0.18, y], [x + w, y + h * 0.82], [x + w, y + h], [x + w * 0.82, y + h], [x, y + h * 0.18]], blanco)); break;
    case 'O': o.push(R(x, y, w, h, amarillo), P([[x, y], [x + w, y], [x + w, y + h]], rojo)); break;
    case 'N': for (let i = 0; i < 16; i++) o.push(R(x + (i % 4) * w / 4, y + Math.floor(i / 4) * h / 4, w / 4, h / 4, (i + Math.floor(i / 4)) % 2 ? blanco : azul)); break;
    case 'C': [azul, blanco, rojo, blanco, azul].forEach((c, i) => o.push(R(x, y + (i * h) / 5, w, h / 5, c))); break;
    case 'H': o.push(R(x, y, w / 2, h, blanco), R(x + w / 2, y, w / 2, h, rojo)); break;
    case 'U': [0, 1, 2, 3].forEach((i) => o.push(R(x + (i % 2) * w / 2, y + Math.floor(i / 2) * h / 2, w / 2, h / 2, i === 0 || i === 3 ? rojo : blanco))); break;
    case 'V': {
      const t = h / 5;
      o.push(R(x, y, w, h, blanco), `<path d="M${f1(x)},${f1(y)} L${f1(x + w)},${f1(y + h)} M${f1(x + w)},${f1(y)} L${f1(x)},${f1(y + h)}" stroke="${rojo}" stroke-width="${f1(t)}"/>`);
      break;
    }
    case 'W': o.push(R(x, y, w, h, azul), R(x + w / 6, y + h / 6, (w * 2) / 3, (h * 2) / 3, blanco), R(x + w / 3, y + h / 3, w / 3, h / 3, rojo)); break;
    default: return '';
  }
  const id = `cb-${codigo}-${Math.round(x)}-${Math.round(y)}`;
  // el aspa de la V se recorta al paño
  const clip = codigo === 'V' ? `<clipPath id="${id}"><rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}"/></clipPath>` : '';
  return `${clip}<g${clip ? ` clip-path="url(#${id})"` : ''}>${o.join('')}</g>` +
    `<polygon points="${contorno(codigo, x, y, w, h).map(([a, b]) => `${f1(a)},${f1(b)}`).join(' ')}" fill="none" stroke="${T.tinta}" stroke-width="1.4" stroke-linejoin="round"/>`;
}

/** Asta con su perilla y la driza; la bandera izada arriba, a la derecha del asta. */
function astaConBandera(codigo, xAsta, yTope, yPie, w, h) {
  return `<line x1="${xAsta}" y1="${yTope}" x2="${xAsta}" y2="${yPie}" stroke="${T.tinta}" stroke-width="3" stroke-linecap="round"/>` +
    `<circle cx="${xAsta}" cy="${yTope - 3}" r="4" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.4"/>` +
    `<line x1="${xAsta + 3}" y1="${yTope + 4}" x2="${xAsta + 3}" y2="${yTope + 10 + h}" stroke="${T.tinta}" stroke-width=".7"/>` +
    panoBandera(codigo, xAsta + 4, yTope + 6, w, h);
}

/**
 * Bandera en estilo C. Con `rotulos` (la lámina) lleva su cartela con la letra; sin ellos (el anverso de una tarjeta),
 * solo el asta y el paño.
 */
export function banderaC(codigo, { rotulos = true, alt = null } = {}) {
  const b = BANDERA_C[codigo];
  if (!b || !FLAGS[codigo]) return null;
  const W = 358;
  const H = rotulos ? 236 : 210;
  const { out, cierra } = lienzo(W, H, alt ?? `${FLAGS[codigo].nombre}. ${b.forma} ${FLAGS[codigo].nota}`);
  out.push(`<rect x="0" y="${H - 34}" width="${W}" height="34" fill="${T.agua}"/>`, ondas(8, W - 8, H - 24));
  const w = 196;
  const h = 128;
  out.push(astaConBandera(codigo, 74, 30, H - 30, w, h));
  if (rotulos) {
    const t = b.letra ? `${b.letra} · ${b.fonetica}` : b.fonetica;
    out.push(cartela(78 + w / 2, H - 50, t, b.letra ? 'Código Internacional' : 'buceo recreativo', { color: T.magenta }));
  }
  out.push(cierra());
  return { svg: out.join(''), caption: FLAGS[codigo].nota };
}

/** Lámina `bandera` (spec { tipo: 'bandera', codigo }). */
export const banderaIllustration = (spec) => banderaC(spec.codigo);

// ---------------------------------------------------------------------------
// Señales acústicas: el cronograma de pitadas (corta ≈ 1 s, larga 4–6 s) o de campana y gong

/** Señales que no son de pito: b golpe de campana · B repique de campana (~5 s) · G gong (~5 s). */
export const SECUENCIA_SONIDO = { campana: 'B', 'campana-gong': 'BG', varado: 'bbbBbbb' };

const NOMBRE = { '.': 'corta', '-': 'larga', b: 'golpe de campana', B: 'repique de campana', G: 'gong' };
/** Duración de cada elemento en segundos (la larga, en el medio de sus 4–6 s) y pausa detrás. */
const DUR = { '.': 1, '-': 4.5, b: 0.4, B: 5, G: 5 };
const PAUSA = { '.': 1, '-': 1.2, b: 0.8, B: 0.8, G: 0.8 };
const ROT = { '.': '1 s', '-': '4–6 s', B: '≈ 5 s', G: '≈ 5 s' };

/** Cómo suena (sin decir qué significa): «larga, corta y corta». */
export function patronSonido(senal) {
  const seq = [...(SECUENCIA_SONIDO[senal] ?? senal)];
  if (senal === 'varado') return 'tres golpes de campana claros y separados, un repique rápido de unos 5 segundos y otros tres golpes';
  const partes = seq.map((c) => NOMBRE[c]);
  return partes.length > 1 ? `${partes.slice(0, -1).join(', ')} y ${partes.at(-1)}` : partes[0];
}

/** Texto alternativo del cronograma, sin el significado. */
export const altSonido = (senal) => {
  const campana = !!SECUENCIA_SONIDO[senal];
  return `Cronograma de una señal ${campana ? 'de campana' : 'de pito'}: ${patronSonido(senal)}${campana ? '' : '. La corta dura un segundo; la larga, de cuatro a seis'}.`;
};

/** Bocina (pito) o campana a la izquierda del cronograma. */
function instrumento(campana, x, y) {
  if (campana) {
    return `<g transform="translate(${x} ${y})"><path d="M-13,10 C-13,-4 -9,-14 0,-14 C9,-14 13,-4 13,10 L16,14 L-16,14Z" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.4" stroke-linejoin="round"/>` +
      `<line x1="0" y1="-14" x2="0" y2="-19" stroke="${T.tinta}" stroke-width="1.4"/><circle cy="17" r="3" fill="${T.tinta}"/></g>`;
  }
  return `<g transform="translate(${x} ${y})"><path d="M-14,-4 L-6,-4 L10,-13 L10,13 L-6,4 L-14,4Z" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.4" stroke-linejoin="round"/>` +
    `<path d="M15,-7 q5,7 0,14 M19,-11 q8,11 0,22" fill="none" stroke="${T.tinta}" stroke-width="1.2" stroke-linecap="round"/></g>`;
}

/**
 * Cronograma de una señal acústica en estilo C. `alt`: el texto alternativo (la lámina dice también qué significa; el
 * anverso de la tarjeta, solo cómo suena).
 */
export function sonidoC(senal, { alt = null } = {}) {
  if (!SENALES[senal]) return null;
  const seq = [...(SECUENCIA_SONIDO[senal] ?? senal)];
  const campana = !!SECUENCIA_SONIDO[senal];
  const W = 358;
  const H = 156;
  const x0 = 72;
  const ancho = W - x0 - 22;
  const total = seq.reduce((s, c, i) => s + DUR[c] + (i < seq.length - 1 ? PAUSA[c] : 0), 0);
  // eje de al menos 8 s: una pitada corta se ve corta (y las largas, de 4 a 6 s, largas) en cualquier señal
  const eje = Math.max(8, Math.ceil(total));
  const k = ancho / eje;
  const { out, ray, pt, cierra } = lienzo(W, H, alt ?? `${altSonido(senal)} Significa: ${SENALES[senal]}`);
  out.push(instrumento(campana, 36, 62));
  const y = 50;
  const hb = 24;
  // eje de tiempo: un trazo por segundo y los segundos en los extremos
  const fin = x0 + eje * k;
  const marcas = [];
  for (let s = 0; s <= eje; s++) marcas.push(`M${f1(x0 + s * k)},${y + hb + 22}v${s % 5 === 0 ? 7 : 4}`);
  out.push(`<line x1="${x0}" y1="${y + hb + 22}" x2="${f1(fin)}" y2="${y + hb + 22}" stroke="${T.tinta}" stroke-width="1"/>`,
    `<path d="${marcas.join('')}" stroke="${T.tinta}" stroke-width="1"/>`);
  out.push(rotulo(x0, y + hb + 44, '0 s', { size: TXT.min, estilo: 'mono', anchor: 'start', color: T.apagado }),
    rotulo(fin, y + hb + 44, `${eje} s`, { size: TXT.min, estilo: 'mono', anchor: 'end', color: T.apagado }));
  let t = 0;
  seq.forEach((c, i) => {
    const x = x0 + t * k;
    const w = DUR[c] * k;
    if (c === 'b') out.push(`<circle cx="${f1(x + w / 2)}" cy="${y + hb / 2}" r="5" fill="${T.tinta}"/>`);
    else if (c === 'B' || c === 'G') {
      out.push(`<rect x="${f1(x)}" y="${y}" width="${f1(w)}" height="${hb}" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.2"/>`,
        `<rect x="${f1(x)}" y="${y}" width="${f1(w)}" height="${hb}" fill="${c === 'B' ? ray : pt}" stroke="none"/>`);
    } else out.push(`<rect x="${f1(x)}" y="${y}" width="${f1(w)}" height="${hb}" fill="${c === '-' ? T.tinta : T.magenta}" stroke="${T.tinta}" stroke-width="1"/>`);
    if (ROT[c] && !(c === '.' && seq.length > 6)) out.push(rotulo(x + w / 2, y + hb + 15, ROT[c], { size: TXT.min, estilo: 'mono', color: c === '.' ? T.magenta : T.tinta }));
    t += DUR[c] + (i < seq.length - 1 ? PAUSA[c] : 0);
  });
  // qué es cada cosa, en una línea (versalitas): corta y larga o campana y gong
  const leyenda = campana ? (seq.includes('G') ? 'CAMPANA A PROA · GONG A POPA' : seq.includes('b') ? 'GOLPES · REPIQUE · GOLPES' : 'REPIQUE RÁPIDO DE CAMPANA') : 'PITADAS DE PITO O SIRENA';
  out.push(rotulo(x0, 30, leyenda, { size: TXT.min, weight: 700, estilo: 'cap', anchor: 'start', color: T.apagado }));
  out.push(cierra());
  return { svg: out.join(''), caption: SENALES[senal], sound: senal };
}

/** Lámina `sonido` (spec { tipo: 'sonido', senal, texto? }). */
export const sonidoIllustration = (spec) => sonidoC(spec.senal ?? '.');
