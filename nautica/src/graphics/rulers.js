// Motor gráfico: escalas de los márgenes (latitudes a la izquierda, longitudes arriba) dibujadas en el borde
// de la vista, con graduación adaptada al zoom, y rótulos de las guías sobre las escalas.
// Desde estas escalas se arrastran las guías (paralelos y meridianos) para situar puntos por coordenadas.

import { toWorld, S } from './chart-renderer.js';

export const RULER_LEFT = 30; // ancho en píxeles de la escala de latitudes
export const RULER_TOP = 22; // alto en píxeles de la escala de longitudes

const f = (n) => n.toFixed(2);
const STEPS = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 30];

function stepsFor(pxPerMin) {
  const minor = STEPS.find((s) => s * pxPerMin >= 7) ?? 60;
  const major = STEPS.find((s) => s >= minor * 4 && s * pxPerMin >= 45) ?? 60;
  return { minor, major };
}

/** "36°05,2′" a partir de minutos totales (con decimales si el paso lo pide). */
function label(totalMin, dec, hemi) {
  const a = Math.abs(totalMin);
  let d = Math.floor(a / 60 + 1e-9);
  let m = a - d * 60;
  if (m > 59.95) { d += 1; m = 0; }
  return `${d}°${m.toFixed(dec).replace('.', ',').padStart(dec ? 3 + dec : 2, '0')}′${hemi}`;
}

/**
 * @param {object} view  {x,y,w,h} en mundo
 * @param {number} z     píxeles por unidad mundo
 * @param {{axis:'lat'|'lon', value:number, id?:any, selected?:boolean}[]} guides
 * @param {(w:{x,y}) => {lat,lon}} fromWorld
 */
export function rulersLayer(view, z, guides, fromWorld) {
  const k = 1 / z;
  const L = RULER_LEFT * k;
  const T = RULER_TOP * k;
  const out = [];
  out.push(`<rect class="ruler-band" x="${f(view.x)}" y="${f(view.y)}" width="${f(L)}" height="${f(view.h)}"/>`);
  out.push(`<rect class="ruler-band" x="${f(view.x)}" y="${f(view.y)}" width="${f(view.w)}" height="${f(T)}"/>`);

  // Latitudes (izquierda)
  const top = fromWorld({ x: view.x, y: view.y + T }).lat * 60;
  const bottom = fromWorld({ x: view.x, y: view.y + view.h }).lat * 60;
  const latPxPerMin = Math.abs(toWorld({ lat: (top + 1) / 60, lon: 0 }).y - toWorld({ lat: top / 60, lon: 0 }).y) * z;
  const ls = stepsFor(latPxPerMin);
  const ldec = ls.major < 1 ? 1 : 0;
  for (let m = Math.ceil(bottom / ls.minor) * ls.minor; m <= top + 1e-9; m += ls.minor) {
    const mm = Math.round(m * 10) / 10;
    const y = toWorld({ lat: mm / 60, lon: 0 }).y;
    const isMajor = Math.abs(mm / ls.major - Math.round(mm / ls.major)) < 1e-6;
    const len = (isMajor ? 10 : Math.abs(mm - Math.round(mm)) < 1e-6 ? 6 : 3.5) * k;
    out.push(`<line class="ruler-tick" x1="${f(view.x + L - len)}" y1="${f(y)}" x2="${f(view.x + L)}" y2="${f(y)}"/>`);
    if (isMajor) out.push(`<text class="ruler-lbl" font-size="${f(8.5 * k)}" transform="translate(${f(view.x + 9 * k)} ${f(y)}) rotate(-90)" text-anchor="middle">${label(mm, ldec, mm < 0 ? 'S' : 'N')}</text>`);
  }
  // Longitudes (arriba)
  const west = fromWorld({ x: view.x + L, y: view.y }).lon * 60;
  const east = fromWorld({ x: view.x + view.w, y: view.y }).lon * 60;
  const lonPxPerMin = S * z;
  const os = stepsFor(lonPxPerMin);
  const odec = os.major < 1 ? 1 : 0;
  for (let m = Math.ceil(west / os.minor) * os.minor; m <= east + 1e-9; m += os.minor) {
    const mm = Math.round(m * 10) / 10;
    const x = toWorld({ lat: 0, lon: mm / 60 }).x;
    const isMajor = Math.abs(mm / os.major - Math.round(mm / os.major)) < 1e-6;
    const len = (isMajor ? 9 : Math.abs(mm - Math.round(mm)) < 1e-6 ? 5.5 : 3) * k;
    out.push(`<line class="ruler-tick" x1="${f(x)}" y1="${f(view.y + T - len)}" x2="${f(x)}" y2="${f(view.y + T)}"/>`);
    if (isMajor) out.push(`<text class="ruler-lbl" font-size="${f(8.5 * k)}" x="${f(x)}" y="${f(view.y + 9.5 * k)}" text-anchor="middle">${label(mm, odec, mm < 0 ? 'W' : 'E')}</text>`);
  }
  // Rótulos de las guías sobre las escalas
  for (const g of guides) {
    const cls = `guide-tag${g.selected ? ' sel' : ''}`;
    if (g.axis === 'lat') {
      const y = toWorld({ lat: g.value, lon: 0 }).y;
      const txt = label(g.value * 60, 1, g.value < 0 ? 'S' : 'N');
      out.push(`<g class="${cls}"><rect x="${f(view.x + L)}" y="${f(y - 8 * k)}" width="${f(64 * k)}" height="${f(16 * k)}" rx="${f(3 * k)}"/><text font-size="${f(10 * k)}" x="${f(view.x + L + 4 * k)}" y="${f(y + 3.5 * k)}">${txt}</text></g>`);
    } else {
      const x = toWorld({ lat: 0, lon: g.value }).x;
      const txt = label(g.value * 60, 1, g.value < 0 ? 'W' : 'E');
      out.push(`<g class="${cls}"><rect x="${f(x - 34 * k)}" y="${f(view.y + T)}" width="${f(68 * k)}" height="${f(16 * k)}" rx="${f(3 * k)}"/><text font-size="${f(10 * k)}" x="${f(x)}" y="${f(view.y + T + 11.5 * k)}" text-anchor="middle">${txt}</text></g>`);
    }
  }
  out.push(`<rect class="ruler-corner" x="${f(view.x)}" y="${f(view.y)}" width="${f(L)}" height="${f(T)}"/>`);
  return out.join('');
}
