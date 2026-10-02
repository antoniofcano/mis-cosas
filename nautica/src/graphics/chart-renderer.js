// Motor gráfico: carta en coordenadas "mundo" (Mercator) y construcciones, como texto SVG.
// No usa el DOM: lo usan la carta interactiva (ui/chart/) y las pruebas.
//
// Coordenadas mundo: x = longitud en minutos × S, y = −latitud aumentada en minutos × S (y hacia abajo,
// como en SVG). En ese sistema la carta Mercator es un plano y el zoom/desplazamiento es solo el viewBox.
// Las capas "dinámicas" (marcas, textos, construcciones) se generan para una escala z (píxeles de pantalla
// por unidad mundo) para que símbolos y textos tengan tamaño constante en pantalla.
//
// Primitivas de dibujo (las generan los ejercicios en solve().drawing.items y las herramientas de dibujo):
//   { t:'pos',    at, label?, style:'start'|'fix'|'estima'|'user' }
//   { t:'ray',    from, bearing, length, label?, style }        semirrecta desde un punto (millas)
//   { t:'line',   through, bearing, length, label?, style }     recta centrada en un punto
//   { t:'seg',    from, to, label?, style, arrow? }
//   { t:'vec',    from, bearing, length, label?, style }        vector con flecha
//   { t:'arc',    center, radius, around, span, style }         arco de compás (millas, grados)
//   { t:'circle', center, radius, label?, style }               circunferencia completa (millas)
//   { t:'guide',  axis:'lat'|'lon', value }                    guía (paralelo/meridiano) sacada de la escala
//   { t:'text',   at, text, size?, style }                      anotación de texto (size en px de pantalla)
//   Cualquier primitiva puede llevar `step`: solo se dibuja cuando se ha llegado a ese paso.
//   Estilos: construction, lop, lop2, boat, current, effective, start, fix, estima, user, measure.

import { toPlane, fromPlane, unitsPerMile, rhumbDestination } from '../math/mercator.js';
import { norm360 } from '../math/angles.js';

export const S = 10;
export const toWorld = (geo) => { const p = toPlane(geo); return { x: p.x * S, y: -p.y * S }; };
export const fromWorld = ({ x, y }) => fromPlane({ x: x / S, y: -y / S });
/** Unidades mundo por milla náutica a una latitud (escala local de la carta). */
export const worldPerMile = (lat) => unitsPerMile(lat) * S;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const f = (n) => n.toFixed(2);
const pathOf = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${f(p.x)},${f(p.y)}`).join('');

/** Rectángulo mundo de un bbox geográfico. */
export function worldRect({ south, north, west, east }) {
  const a = toWorld({ lat: north, lon: west });
  const b = toWorld({ lat: south, lon: east });
  return { x: a.x, y: a.y, w: b.x - a.x, h: b.y - a.y };
}

/** Encuadre geográfico que contiene unos puntos con un margen en millas. */
export function fitBBox(points, marginMiles = 3, chartBounds) {
  const lats = points.map((p) => p.lat);
  const lons = points.map((p) => p.lon);
  const mLat = marginMiles / 60;
  const midLat = (Math.min(...lats) + Math.max(...lats)) / 2;
  const mLon = marginMiles / 60 / Math.cos((midLat * Math.PI) / 180);
  let b = { south: Math.min(...lats) - mLat, north: Math.max(...lats) + mLat, west: Math.min(...lons) - mLon, east: Math.max(...lons) + mLon };
  if (chartBounds) {
    b = {
      south: Math.max(b.south, chartBounds.south), north: Math.min(b.north, chartBounds.north),
      west: Math.max(b.west, chartBounds.west), east: Math.min(b.east, chartBounds.east),
    };
  }
  return b;
}

/** Capa base: mar y tierra vectorial (no depende del zoom; trazos no escalables por CSS). */
export function baseLayer(chart, { land = true } = {}) {
  const r = worldRect(chart.bounds);
  const pad = 600;
  const out = [`<rect class="sea" x="${f(r.x - pad)}" y="${f(r.y - pad)}" width="${f(r.w + 2 * pad)}" height="${f(r.h + 2 * pad)}"/>`];
  if (land) for (const poly of chart.land) out.push(`<path class="land" d="${pathOf(poly.map(([lon, lat]) => toWorld({ lat, lon })))}Z"/>`);
  return out.join('');
}

/** Cuadrícula de meridianos y paralelos (paso según el zoom) con rótulos de tamaño constante. */
export function gridLayer(chart, z, view, { labels = true } = {}) {
  const { south, north, west, east } = chart.bounds;
  const steps = [1, 2, 5, 10, 20, 30];
  const step = steps.find((s) => s * z * S >= 70) ?? 60;
  const out = [];
  const fs = 10 / z;
  const vx = view ? view.x : -Infinity;
  const vy = view ? view.y : -Infinity;
  for (let m = Math.ceil(Math.round(south * 600) / 10 / step) * step; m <= north * 60 + 1e-6; m += step) {
    const lat = m / 60;
    const a = toWorld({ lat, lon: west });
    const b = toWorld({ lat, lon: east });
    out.push(`<line class="grid${m % 10 ? ' minor' : ''}" x1="${f(a.x)}" y1="${f(a.y)}" x2="${f(b.x)}" y2="${f(b.y)}"/>`);
    if (labels) out.push(`<text class="tick" font-size="${f(fs)}" x="${f(Math.max(a.x, vx) + 34 / z)}" y="${f(a.y - 2 / z)}">${tick(lat, true)}</text>`);
  }
  for (let m = Math.ceil(Math.round(west * 600) / 10 / step) * step; m <= east * 60 + 1e-6; m += step) {
    const lon = m / 60;
    const a = toWorld({ lat: north, lon });
    const b = toWorld({ lat: south, lon });
    out.push(`<line class="grid${m % 10 ? ' minor' : ''}" x1="${f(a.x)}" y1="${f(a.y)}" x2="${f(b.x)}" y2="${f(b.y)}"/>`);
    if (labels) out.push(`<text class="tick" font-size="${f(fs)}" x="${f(a.x + 2 / z)}" y="${f(Math.max(a.y, vy) + 34 / z)}">${tick(lon, false)}</text>`);
  }
  const fr = worldRect(chart.bounds);
  out.push(`<rect class="neatline" x="${f(fr.x)}" y="${f(fr.y)}" width="${f(fr.w)}" height="${f(fr.h)}"/>`);
  return out.join('');
}

function tick(deg, isLat) {
  const a = Math.abs(deg);
  let d = Math.floor(a + 1e-9);
  let m = Math.round((a - d) * 60);
  if (m === 60) { d += 1; m = 0; }
  return `${d}°${String(m).padStart(2, '0')}′${isLat ? (deg < 0 ? 'S' : 'N') : deg < 0 ? 'W' : 'E'}`;
}

/** Marcas (faros y puntos) a tamaño constante en pantalla. */
export function marksLayer(chart, z, { labels = true } = {}) {
  const out = [];
  const k = 1 / z;
  for (const m of chart.points()) {
    if (m.mark === false && !m.port) continue;
    const p = toWorld(m);
    if (m.light) {
      out.push(`<g class="mark light"><path d="M${f(p.x)},${f(p.y - 8 * k)}L${f(p.x + 3.2 * k)},${f(p.y)}L${f(p.x - 3.2 * k)},${f(p.y)}Z"/><circle cx="${f(p.x)}" cy="${f(p.y)}" r="${f(2.2 * k)}"/></g>`);
    } else {
      out.push(`<circle class="mark${m.port ? ' port' : ''}" cx="${f(p.x)}" cy="${f(p.y)}" r="${f(2.5 * k)}"/>`);
    }
    if (labels && (m.mark !== false || z > 2)) {
      const name = m.short ?? (m.port ? `${m.portName} (puerto)` : m.name.replace(/^Faro de /, '').replace(/\s*\(.*\)$/, ''));
      out.push(`<text class="mark-label" font-size="${f(10.5 * k)}" x="${f(p.x + 5 * k)}" y="${f(p.y - 4 * k)}">${esc(name)}</text>`);
    }
  }
  return out.join('');
}

/** Construcciones (primitivas) hasta el paso `step`, a tamaño constante en pantalla. */
export function itemsLayer(items, z, step = Infinity) {
  return items.filter((it) => (it.step ?? 0) <= step).map((it) => drawItem(it, z)).join('');
}

function label(text, at, z, cls = 'item-label') {
  return text ? `<text class="${cls}" font-size="${f(11 / z)}" x="${f(at.x + 6 / z)}" y="${f(at.y - 6 / z)}">${esc(text)}</text>` : '';
}

const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

export function drawItem(it, z) {
  const cls = `c-${it.style ?? 'construction'}`;
  const data = it.id != null ? ` data-id="${it.id}"` : '';
  const k = 1 / z;
  switch (it.t) {
    case 'pos': {
      const p = toWorld(it.at);
      const shape = it.style === 'estima'
        ? `<rect x="${f(p.x - 4 * k)}" y="${f(p.y - 4 * k)}" width="${f(8 * k)}" height="${f(8 * k)}" class="${cls}"${data}/>`
        : `<circle cx="${f(p.x)}" cy="${f(p.y)}" r="${f((it.style === 'fix' ? 5 : 4) * k)}" class="${cls}"${data}/>`;
      return shape + label(it.label, p, z, 'pos-label');
    }
    case 'ray': {
      const a = toWorld(it.from);
      const b = toWorld(rhumbDestination(it.from, it.bearing, it.length));
      return `<line class="${cls}" x1="${f(a.x)}" y1="${f(a.y)}" x2="${f(b.x)}" y2="${f(b.y)}"${data}/>` + label(it.label, mid(a, b), z);
    }
    case 'line': {
      const a = toWorld(rhumbDestination(it.through, norm360(it.bearing + 180), it.length / 2));
      const b = toWorld(rhumbDestination(it.through, it.bearing, it.length / 2));
      return `<line class="${cls}" x1="${f(a.x)}" y1="${f(a.y)}" x2="${f(b.x)}" y2="${f(b.y)}"${data}/>` + label(it.label, toWorld(it.through), z);
    }
    case 'seg': {
      const a = toWorld(it.from);
      const b = toWorld(it.to);
      return `<line class="${cls}" x1="${f(a.x)}" y1="${f(a.y)}" x2="${f(b.x)}" y2="${f(b.y)}"${it.arrow ? ' marker-end="url(#arr)"' : ''}${data}/>` + label(it.label, mid(a, b), z);
    }
    case 'vec': {
      const a = toWorld(it.from);
      const b = toWorld(rhumbDestination(it.from, it.bearing, it.length));
      return `<line class="${cls}" x1="${f(a.x)}" y1="${f(a.y)}" x2="${f(b.x)}" y2="${f(b.y)}" marker-end="url(#arr)"${data}/>` + label(it.label, mid(a, b), z);
    }
    case 'arc': {
      const pts = [];
      for (let d = -it.span / 2; d <= it.span / 2 + 1e-9; d += 2) pts.push(toWorld(rhumbDestination(it.center, norm360(it.around + d), it.radius)));
      return `<path class="${cls} arc" d="${pathOf(pts)}"${data}/>`;
    }
    case 'guide': {
      // Guía de la escala del margen: paralelo (axis 'lat') o meridiano (axis 'lon') de lado a lado.
      const a = toWorld(it.axis === 'lat' ? { lat: it.value, lon: -30 } : { lat: 60, lon: it.value });
      const b = toWorld(it.axis === 'lat' ? { lat: it.value, lon: 20 } : { lat: 0, lon: it.value });
      return `<line class="guide${it.selected ? ' sel' : ''}" x1="${f(a.x)}" y1="${f(a.y)}" x2="${f(b.x)}" y2="${f(b.y)}"${data}/>`;
    }
    case 'text': {
      const p = toWorld(it.at);
      const fs = (it.size ?? 14) * k;
      return `<g class="note${it.selected ? ' sel' : ''}"${data}><circle cx="${f(p.x)}" cy="${f(p.y)}" r="${f(2.5 * k)}"/><text font-size="${f(fs)}" x="${f(p.x + 5 * k)}" y="${f(p.y + fs * 0.35)}">${esc(it.text || '…')}</text></g>`;
    }
    case 'circle': {
      const c = toWorld(it.center);
      const r = it.radius * worldPerMile(it.center.lat);
      return `<circle class="${cls} arc" cx="${f(c.x)}" cy="${f(c.y)}" r="${f(r)}"${data}/>` + label(it.label, { x: c.x + r * 0.7, y: c.y - r * 0.7 }, z);
    }
    default:
      return '';
  }
}

/** Definiciones comunes (flecha). */
export const DEFS = '<defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="context-stroke"/></marker></defs>';

/** SVG completo y estático (miniaturas, pruebas): carta + construcción encuadradas. */
export function renderChart(chart, { width = 640, height = 440, items = [], focus = [], step = Infinity } = {}) {
  const bbox = focus.length ? fitBBox(focus, 3, chart.bounds) : chart.bounds;
  const r = worldRect(bbox);
  const z = Math.min(width / r.w, height / r.h);
  const view = { x: r.x - (width / z - r.w) / 2, y: r.y - (height / z - r.h) / 2, w: width / z, h: height / z };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${f(view.x)} ${f(view.y)} ${f(view.w)} ${f(view.h)}" class="chart">${DEFS}` +
    baseLayer(chart) + gridLayer(chart, z, view) + marksLayer(chart, z) + itemsLayer(items, z, step) + '</svg>';
  return { svg, view, z };
}
