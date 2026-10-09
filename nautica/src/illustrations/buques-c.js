// Luces y marcas de los buques (RIPA, reglas 23 a 30) en estilo C (docs/ESTILO-LAMINAS.md): el buque de noche visto de
// proa, por sus dos bandas y de popa, y de día con sus marcas. Los datos de cada clase (qué luces lleva, a qué altura y
// en qué banda) son los de SHIPS (src/illustrations/ships.js), que no cambian; aquí solo cambia el dibujo. La misma
// pieza dibuja el anverso de la tarjeta de memoria (sin el nombre del buque). Solo colores T.* (--lc-*). Sin DOM.
//
// spec: { tipo:'buque', clase, vista:'proa'|'babor'|'estribor'|'popa'|'todas', dia?: bool, arrancada?: bool,
//         obstruccion?: 'babor'|'estribor' (draga), aparejo?: 'babor'|'estribor' (pesquero con aparejo > 150 m) }

import { T, TXT, f1, lienzo, rotulo } from './estilo-c.js';
import { SHIPS } from './ships.js';
import { panoBandera } from './senales-c.js';

const VISTAS = ['proa', 'babor', 'estribor', 'popa'];
const NOMBRE_VISTA = { proa: 'DE PROA', babor: 'POR SU BABOR', estribor: 'POR SU ESTRIBOR', popa: 'DE POPA' };
const LUZ = { W: T.luzBlanca, R: T.luzRoja, G: T.luzVerde, Y: T.luzAmarilla };
const NOMBRE_LUZ = { W: 'blanca', R: 'roja', G: 'verde', Y: 'amarilla' };

/** Banda real ('br' | 'er' | 'ambos') de una luz o marca desplazada, según la obstrucción o el aparejo. */
function bandaDe(lado, o) {
  if (lado === 'ambos') return 'ambos';
  const obs = o.obstruccion === 'babor' ? 'br' : 'er';
  if (lado === 'obs') return obs;
  if (lado === 'libre') return obs === 'br' ? 'er' : 'br';
  if (lado === 'aparejo') return o.aparejo === 'babor' ? 'br' : 'er';
  return null;
}
/** Signo en el dibujo de una banda del buque: visto de proa, su estribor queda a nuestra izquierda; de popa, a la derecha. */
const signo = (banda, vista) => (banda === 'br' ? 1 : -1) * (vista === 'popa' ? -1 : 1);

/**
 * Luces que se ven desde una vista: [{ t, at, h, c: 'W'|'R'|'G'|'Y', lado?: ±1, dx? }]. Mismas reglas que la lámina
 * antigua: el tope (225° a proa) no se ve de popa; la de remolque (amarilla, sobre la de alcance) solo de popa;
 * costados y alcance según la vista; con arrancada: false, los que solo los llevan con arrancada los apagan.
 */
export function lucesVista(s, vista, o = {}) {
  const arrancada = o.arrancada !== false;
  const L = [];
  for (const [t, at, h, op = {}] of s.luces) {
    if (t === 'tope' && vista === 'popa') continue;
    if (t === 'tope' && !arrancada && !op.siempre && (s.opcionalCostados || s.sinTope)) continue;
    if (t === 'remolque' && vista !== 'popa') continue;
    if (t === 'tricolor') {
      // farol combinado (Regla 25 b): de proa, verde y roja a la vez; de costado, la suya; de popa, blanca
      if (vista === 'proa') L.push({ t, at, h, c: 'G', dx: -5 }, { t, at, h, c: 'R', dx: 5 });
      else L.push({ t, at, h, c: vista === 'babor' ? 'R' : vista === 'estribor' ? 'G' : 'W' });
      continue;
    }
    const c = t.startsWith('todo-') ? t.slice(5) : t === 'remolque' ? 'Y' : 'W';
    const banda = bandaDe(op.lado, o);
    const lateral = vista === 'babor' || vista === 'estribor';
    if (banda && !lateral) for (const b of banda === 'ambos' ? ['br', 'er'] : [banda]) L.push({ t, at, h, c, lado: signo(b, vista) });
    else L.push({ t, at, h, c });
  }
  const costados = !s.sinCostados && (arrancada || !s.opcionalCostados);
  const hc = s.luces.some((l) => l[3]?.lado) ? 0.26 : 0.4;
  if (costados) {
    if (vista === 'proa') L.push({ t: 'costado', at: 'izq', h: hc, c: 'G' }, { t: 'costado', at: 'der', h: hc, c: 'R' });
    if (vista === 'babor') L.push({ t: 'costado', at: 'costado', h: hc, c: 'R' });
    if (vista === 'estribor') L.push({ t: 'costado', at: 'costado', h: hc, c: 'G' });
    if (vista === 'popa' && !s.sinAlcance) L.push({ t: 'alcance', at: 'centro', h: 0.3, c: 'W' });
  }
  return L;
}

/** Una luz de noche: halo y foco del color de la luz (siempre sobre la noche). */
const luz = (x, y, c, r = 4.4) => `<g data-luz="${NOMBRE_LUZ[c]}"><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r * 1.75)}" fill="${LUZ[c]}" opacity=".25"/><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${LUZ[c]}"/></g>`;

/** Celda de noche: silueta apenas visible, palo y luces, con el rótulo de la vista. */
function celdaNoche(s, vista, x, y, w, h, o, rotulos) {
  const out = [`<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${T.noche}" stroke="${T.tinta}" stroke-width=".8"/>`];
  const pie = rotulos ? 22 : 8;
  const base = y + h - pie - 12; // flotación
  out.push(`<rect x="${f1(x + 0.5)}" y="${f1(base + 4)}" width="${f1(w - 1)}" height="${f1(y + h - base - 4.5)}" fill="${T.nocheMar}"/>`);
  const alto = base - (y + 16);
  // altura de cada luz: de 0,2 (sobre la cubierta) a 1 (el tope del palo), estirada para que no se peguen
  const yOf = (l) => base - 8 - ((Math.max(0.2, l.h) - 0.2) / 0.8) * (alto - 8);
  const L = lucesVista(s, vista, o);
  const sil = `fill="${T.nocheMar}" stroke="${T.nocheTxt}" stroke-width=".8" stroke-opacity=".55"`;
  const cx = x + w / 2;
  if (vista === 'babor' || vista === 'estribor') {
    const dir = vista === 'babor' ? -1 : 1; // por su babor, la proa queda a la izquierda
    const x0 = x + w * 0.14;
    const x1 = x + w * 0.86;
    const proa = dir < 0 ? x0 : x1;
    const popa = dir < 0 ? x1 : x0;
    out.push(`<path d="M${f1(popa)},${f1(base - 12)} L${f1(proa)},${f1(base - 12)} L${f1(proa - dir * 12)},${f1(base + 4)} L${f1(popa)},${f1(base + 4)}Z" ${sil}/>`,
      `<line x1="${f1(cx)}" y1="${f1(base - 12)}" x2="${f1(cx)}" y2="${f1(y + 12)}" stroke="${T.nocheTxt}" stroke-width="1" stroke-opacity=".45"/>`);
    const xDe = (l) => (l.t === 'costado' ? proa - dir * w * 0.2 : l.at === 'proa' ? proa - dir * w * 0.1 : l.at === 'popa' ? popa + dir * w * 0.08 : cx);
    // palos de proa y de popa, hasta su luz más alta
    for (const at of ['proa', 'popa']) {
      const ls = L.filter((l) => l.at === at && l.t !== 'costado');
      if (ls.length) out.push(`<line x1="${f1(xDe(ls[0]))}" y1="${f1(base - 12)}" x2="${f1(xDe(ls[0]))}" y2="${f1(Math.min(...ls.map(yOf)) + 4)}" stroke="${T.nocheTxt}" stroke-width=".8" stroke-opacity=".4"/>`);
    }
    for (const l of L) out.push(luz(xDe(l), yOf(l), l.c));
  } else {
    const m = w * 0.2;
    out.push(`<path d="M${f1(cx - m)},${f1(base - 12)} L${f1(cx + m)},${f1(base - 12)} L${f1(cx + m * 0.7)},${f1(base + 4)} L${f1(cx - m * 0.7)},${f1(base + 4)}Z" ${sil}/>`,
      `<line x1="${f1(cx)}" y1="${f1(base - 12)}" x2="${f1(cx)}" y2="${f1(y + 12)}" stroke="${T.nocheTxt}" stroke-width="1" stroke-opacity=".45"/>`);
    // verga de las luces a una banda (draga, dragaminas, aparejo de pesca)
    const lados = L.filter((l) => l.lado);
    if (lados.length) {
      const top = Math.min(...lados.map(yOf)) - 7;
      out.push(`<line x1="${f1(cx - w * 0.34)}" y1="${f1(top)}" x2="${f1(cx + w * 0.34)}" y2="${f1(top)}" stroke="${T.nocheTxt}" stroke-width="1" stroke-opacity=".45"/>`);
      for (const sg of [...new Set(lados.map((l) => l.lado))]) out.push(`<line x1="${f1(cx + sg * w * 0.3)}" y1="${f1(top)}" x2="${f1(cx + sg * w * 0.3)}" y2="${f1(Math.max(...lados.filter((l) => l.lado === sg).map(yOf)))}" stroke="${T.nocheTxt}" stroke-width=".8" stroke-opacity=".45"/>`);
      // sus bandas, rotuladas: visto de proa, su estribor queda a nuestra izquierda
      if (rotulos) {
        out.push(rotulo(x + 8, base - 16, vista === 'popa' ? 'Br' : 'Er', { size: TXT.min, anchor: 'start', estilo: 'serif', italic: true, color: T.nocheTxt }),
          rotulo(x + w - 8, base - 16, vista === 'popa' ? 'Er' : 'Br', { size: TXT.min, anchor: 'end', estilo: 'serif', italic: true, color: T.nocheTxt }));
      }
    }
    for (const l of L) {
      const lx = l.lado ? cx + l.lado * w * 0.3 : l.at === 'izq' ? cx - m : l.at === 'der' ? cx + m : l.at === 'popa' && vista === 'proa' ? cx + 3 : cx;
      out.push(luz(lx + (l.dx ?? 0), yOf(l), l.c, l.dx ? 3.4 : 4.4));
    }
  }
  if (rotulos) out.push(rotulo(cx, y + h - 8, NOMBRE_VISTA[vista], { size: TXT.min, weight: 700, estilo: 'cap', color: T.nocheTxt, espacio: 1 }));
  return out.join('');
}

/** Marca de día en (cx, cy), de tamaño k: negra, perfilada en tinta (se ve en claro y en oscuro). */
function marcaDia(m, cx, cy, k) {
  const st = `fill="${T.negro}" stroke="${T.tinta}" stroke-width="1.1" stroke-linejoin="round"`;
  const p = (pts) => `<polygon points="${pts.map(([a, b]) => `${f1(cx + a * k)},${f1(cy + b * k)}`).join(' ')}" ${st}/>`;
  if (m === 'bola') return `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(k)}" ${st}/>`;
  if (m === 'cono-abajo') return p([[-1, -1], [1, -1], [0, 1]]);
  if (m === 'cono-arriba') return p([[-1, 1], [1, 1], [0, -1]]);
  if (m === 'bicono') return p([[0, -1.3], [1, 0], [0, 1.3], [-1, 0]]);
  if (m === 'diabolo') return p([[-1, -1.3], [1, -1.3], [0, 0]]) + p([[0, 0], [1, 1.3], [-1, 1.3]]);
  if (m === 'cilindro') return `<rect x="${f1(cx - k * 0.75)}" y="${f1(cy - k * 1.2)}" width="${f1(k * 1.5)}" height="${f1(k * 2.4)}" ${st}/>`;
  // reproducción rígida de la bandera «A» (Regla 27 e ii): blanca junto al asta y azul con cola de golondrina
  if (m === 'bandera-A') return panoBandera('A', cx + 1, cy - k * 1.3, k * 3.4, k * 2.6);
  return '';
}

/** Celda de día: el buque visto de proa con sus marcas en el palo (y a una banda, si las lleva). */
function celdaDia(s, x, y, w, h, o, rotulos) {
  const out = [`<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${T.papel}" stroke="${T.tinta}" stroke-width=".8"/>`];
  const pie = rotulos ? 22 : 8;
  const base = y + h - pie - 10;
  out.push(`<rect x="${f1(x + 0.5)}" y="${f1(base + 4)}" width="${f1(w - 1)}" height="${f1(y + h - base - 4.5)}" fill="${T.agua}"/>`);
  const cx = x + w / 2;
  const m = Math.min(w * 0.2, 46);
  out.push(`<path d="M${f1(cx - m)},${f1(base - 10)} L${f1(cx + m)},${f1(base - 10)} L${f1(cx + m * 0.7)},${f1(base + 4)} L${f1(cx - m * 0.7)},${f1(base + 4)}Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.2" stroke-linejoin="round"/>`,
    `<line x1="${f1(cx)}" y1="${f1(base - 10)}" x2="${f1(cx)}" y2="${f1(y + (s.dia.length ? 8 : 40))}" stroke="${T.tinta}" stroke-width="2"/>`);
  const n = s.dia.length;
  const dl = s.diaLados;
  // filas de marcas: las del palo y, si cuelgan de la verga, las de las bandas debajo de su marca «desde»
  const filas = Math.max(n, dl ? dl.desde + 1 + Math.max(...Object.entries(dl).filter(([kk]) => kk !== 'desde').map(([, v]) => v.length)) : 0);
  const k = Math.min(9, (base - y - 22) / Math.max(1, filas * 2.7));
  const ys = [];
  let yy = y + 14 + k * 1.3;
  for (const d of s.dia) { ys.push(yy); out.push(marcaDia(d, cx, yy, k)); yy += k * 2.7; }
  if (dl) {
    const y0 = ys[dl.desde] + k * 3;
    const ancho = Math.min(w * 0.34, 64);
    // la verga, justo debajo de su marca; las marcas de las bandas cuelgan de ella
    out.push(`<line x1="${f1(cx - ancho)}" y1="${f1(y0 - k * 1.45)}" x2="${f1(cx + ancho)}" y2="${f1(y0 - k * 1.45)}" stroke="${T.tinta}" stroke-width="1.6"/>`);
    for (const [lado, marcas] of Object.entries(dl)) {
      if (lado === 'desde') continue;
      const b = bandaDe(lado, o);
      for (const bb of b === 'ambos' ? ['br', 'er'] : [b]) {
        const sx = cx + signo(bb, 'proa') * ancho * 0.9;
        marcas.forEach((d, i) => out.push(marcaDia(d, sx, y0 + i * k * 2.7, k * 0.85)));
      }
    }
    if (rotulos) {
      out.push(rotulo(x + 8, base - 14, 'Er', { size: TXT.min, anchor: 'start', estilo: 'serif', italic: true, color: T.apagado }),
        rotulo(x + w - 8, base - 14, 'Br', { size: TXT.min, anchor: 'end', estilo: 'serif', italic: true, color: T.apagado }));
    }
  }
  if (!n && rotulos) out.push(rotulo(x + w / 2, y + 26, 'sin marca de día', { size: TXT.nota, estilo: 'serif', italic: true, color: T.apagado }));
  if (rotulos) out.push(rotulo(cx, y + h - 8, dl ? 'DE DÍA · DE PROA' : 'DE DÍA', { size: TXT.min, weight: 700, estilo: 'cap', color: T.apagado, espacio: 1 }));
  return out.join('');
}

/** Lista legible: «a, b y c». */
const lista = (xs) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} y ${xs.at(-1)}` : xs[0] ?? '');
const LUZ_TXT = { tope: 'blanca de tope', 'todo-W': 'blanca todo horizonte', 'todo-R': 'roja todo horizonte', 'todo-G': 'verde todo horizonte', remolque: 'amarilla de remolque', linterna: 'linterna blanca', tricolor: 'farol tricolor' };

/** Qué se ve en una vista, en palabras (para el texto alternativo de la lámina). */
function enPalabras(s, vista, o) {
  const L = lucesVista(s, vista, o);
  if (!L.length) return `${NOMBRE_VISTA[vista].toLowerCase()}, ninguna luz`;
  const xs = L.map((l) => (l.t === 'costado' ? `la ${NOMBRE_LUZ[l.c]} de costado` : l.t === 'alcance' ? 'la blanca de alcance' : l.t === 'tricolor' ? `la ${NOMBRE_LUZ[l.c]} del farol tricolor` : `una ${LUZ_TXT[l.t]}`));
  return `${NOMBRE_VISTA[vista].toLowerCase()}, ${lista([...new Set(xs)])}`;
}

/** Vistas de una spec. */
export function vistasDe(s, spec) {
  const posibles = s.vistas ?? VISTAS;
  return !spec.vista || spec.vista === 'todas' || !posibles.includes(spec.vista) ? posibles : [spec.vista];
}

/**
 * Dibujo del buque: celdas de noche (una por vista) y, con `dia`, la de día.
 * @param {{ rotulos?: boolean, alt?: string }} op  rotulos: los nombres de las vistas y de las bandas (la tarjeta los
 *   conserva: no delatan la respuesta)
 */
export function buqueSvg(clase, spec = {}, { rotulos = true, alt = null } = {}) {
  const s = SHIPS[clase];
  if (!s) return null;
  const o = { arrancada: spec.arrancada !== false, obstruccion: spec.obstruccion, aparejo: spec.aparejo };
  const vistas = vistasDe(s, spec);
  const dia = !!spec.dia;
  const W = 358;
  const M = 8;
  const G = 8;
  const cw = (W - 2 * M - G) / 2;
  const ch = 150;
  const celdas = [];
  let y = M;
  if (vistas.length === 1 && !dia) celdas.push(['n', vistas[0], M, y, W - 2 * M, 200]);
  else {
    vistas.forEach((v, i) => celdas.push(['n', v, M + (i % 2) * (cw + G), y + Math.floor(i / 2) * (ch + G), cw, ch]));
    const filas = Math.ceil(vistas.length / 2);
    if (dia) {
      if (vistas.length % 2) celdas.push(['d', null, M + cw + G, y + (filas - 1) * (ch + G), cw, ch]);
      else celdas.push(['d', null, M, y + filas * (ch + G), W - 2 * M, vistas.length > 2 ? 118 : 180]);
    }
  }
  const H = Math.max(...celdas.map((c) => c[3] + c[5])) + M;
  const texto = alt ?? `${s.nombre}${o.arrancada ? '' : ', sin arrancada'}. De noche: ${vistas.map((v) => enPalabras(s, v, o)).join('; ')}.${dia ? ` De día: ${s.dia.length ? s.dia.map((d) => ({ 'cono-abajo': 'un cono con el vértice abajo', bicono: 'una marca bicónica', diabolo: 'dos conos unidos por el vértice', bola: 'una bola', 'bandera-A': 'una bandera A rígida', cilindro: 'un cilindro' }[d])).join(', ') : 'sin marca de día'}${s.diaLados ? ', y marcas a una banda' : ''}.` : ''}`;
  const { out, cierra } = lienzo(W, H, texto, { fondo: T.fondo });
  for (const [t, v, x, yy, w, h] of celdas) out.push(t === 'n' ? celdaNoche(s, v, x, yy, w, h, o, rotulos) : celdaDia(s, x, yy, w, h, o, rotulos));
  out.push(cierra());
  return out.join('');
}

/** Lámina «buque» en estilo C. */
export function buqueIllustration(spec) {
  const s = SHIPS[spec.clase];
  if (!s) return null;
  return { svg: buqueSvg(spec.clase, spec), caption: s.nota ?? 'Visto de proa, la verde queda a tu izquierda y la roja a tu derecha: son las de su estribor y su babor.' };
}
