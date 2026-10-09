// Piezas comunes de las láminas de lección rehechas en estilo C en la tanda de cierre (docs/ESTILO-LAMINAS.md):
// rótulos en serifa y monoespaciada, líneas, paneles de notas y el resaltado de partes. Solo colores T.*. Sin DOM.

import { T, TXT, rotulo, f1, pol } from './estilo-c.js';

export const W = 358;
export const lista = (v) => (v == null || v === '' ? [] : Array.isArray(v) ? v : [v]);
export const serif = (x, y, t, o = {}) => rotulo(x, y, t, { size: TXT.min + 0.5, estilo: 'serif', anchor: 'start', ...o });
export const mono = (x, y, t, o = {}) => rotulo(x, y, t, { size: TXT.min, estilo: 'mono', ...o });
export const cap = (x, y, t, o = {}) => rotulo(x, y, t, { size: TXT.min, estilo: 'cap', weight: 700, anchor: 'start', color: T.apagado, ...o });
export const linea = (x1, y1, x2, y2, { color = T.tinta, w = 1, extra = '' } = {}) =>
  `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${color}" stroke-width="${w}"${extra ? ` ${extra}` : ''}/>`;
export const segP = (a, b, o = {}) => linea(a[0], a[1], b[0], b[1], o);
export const filete = (y, { x1 = 14, x2 = W - 14 } = {}) => linea(x1, y, x2, y, { w: 0.6 });
/** Panel de papel al pie (para las notas), de y al final del dibujo. */
export const panelNotas = (y, H) => `<rect x="5" y="${y}" width="${W - 10}" height="${H - y - 5}" fill="${T.papel}"/>${linea(5, y, W - 5, y, { w: 0.8 })}`;
/** Mar desde y hasta yFin, con su línea de flotación. */
export const marHasta = (y, yFin) => `<rect x="5" y="${y}" width="${W - 10}" height="${yFin - y}" fill="${T.agua}"/>${linea(5, y, W - 5, y, { color: T.lineaAgua, w: 1.4 })}`;
/** Aspa magenta: «no». */
export const tacha = (x, y, s = 7) => `<path d="M${x - s},${y - s} L${x + s},${y + s} M${x + s},${y - s} L${x - s},${y + s}" stroke="${T.magenta}" stroke-width="2.4" stroke-linecap="round"/>`;
/** Marca de bien: «sí». */
export const bien = (x, y, s = 7, color = T.verdeTxt) => `<path d="M${x - s},${y} L${x - s / 3},${y + s * 0.7} L${x + s},${y - s * 0.8}" fill="none" stroke="${color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
export const punto = (x, y, { r = 3, color = T.tinta } = {}) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" fill="${color}"/>`;
export const pts = (p) => p.map(([x, y]) => `${f1(x)},${f1(y)}`).join(' ');
export const deg3 = (d) => `${String(Math.round(((d % 360) + 360) % 360)).padStart(3, '0')}°`;
export const coma = (n, d = 1) => (+n).toFixed(d).replace('.', ',');
/** Número a la española con los decimales justos (hasta d). */
export const numD = (n, d = 1) => String(Math.round(n * 10 ** d) / 10 ** d).replace('.', ',');
export { pol };

/**
 * Partes resaltadas de una lámina. Devuelve null si alguna no es válida. on(k): está resaltada; c(k, base): su color
 * (magenta si está resaltada); w(k, base, fuerte): su grosor; g(k): abre su grupo con data-parte (y lo atenúa si hay otras
 * resaltadas y esta no).
 */
export function partes(spec, validas, { atenua = true } = {}) {
  const hl = new Set(lista(spec.resaltar));
  if (validas && [...hl].some((k) => !validas.includes(k))) return null;
  const on = (k) => hl.has(k);
  return {
    hl, activo: hl.size > 0, on,
    c: (k, base = T.tinta) => (on(k) ? T.magenta : base),
    w: (k, base = 1.4, fuerte = 2.4) => (on(k) ? fuerte : base),
    g: (k) => `<g data-parte="${k}"${atenua && hl.size && !on(k) ? ' opacity=".45"' : ''}>`,
    texto: (cap) => [...hl].map((k) => cap[k]).filter(Boolean).join(' '),
  };
}
