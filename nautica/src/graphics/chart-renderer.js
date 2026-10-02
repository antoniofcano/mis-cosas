// Motor gráfico: dibuja la carta (costa, marcas, cuadrícula) y las construcciones de los ejercicios en SVG.
// No depende del DOM más que para crear la cadena SVG: devuelve texto, así se puede probar en Node.
//
// Primitivas de dibujo (las generan los ejercicios en solve().drawing.items):
//   { t:'pos',  at, label, style:'start'|'fix'|'estima' }
//   { t:'ray',  from, bearing, length, label?, style }        semirrecta desde un punto (millas)
//   { t:'line', through, bearing, length, label?, style }     recta centrada en un punto
//   { t:'seg',  from, to, label?, style, arrow? }
//   { t:'vec',  from, bearing, length, label?, style }        vector con flecha
//   { t:'arc',  center, radius, around, span, style }         arco de compás
//   Cualquier primitiva puede llevar `step`: solo se dibuja cuando se ha llegado a ese paso de la solución.
//   Estilos: construction, lop, lop2, boat, current, effective, start, fix, estima.

import { toPlane, fromPlane, unitsPerMile, rhumbDestination } from '../math/mercator.js';
import { fromPolar, add } from '../math/vector.js';
import { norm360 } from '../math/angles.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** Crea una vista (encuadre) del plano carta a un rectángulo de píxeles. */
export function createView(bbox, width, height, pad = 24) {
  // bbox en grados → plano
  const sw = toPlane({ lat: bbox.south, lon: bbox.west });
  const ne = toPlane({ lat: bbox.north, lon: bbox.east });
  const sx = (width - 2 * pad) / (ne.x - sw.x);
  const sy = (height - 2 * pad) / (ne.y - sw.y);
  const s = Math.min(sx, sy);
  const ox = pad + (width - 2 * pad - s * (ne.x - sw.x)) / 2;
  const oy = pad + (height - 2 * pad - s * (ne.y - sw.y)) / 2;
  const project = (p) => {
    const q = toPlane(p);
    return { x: ox + (q.x - sw.x) * s, y: height - (oy + (q.y - sw.y) * s) };
  };
  const unproject = ({ x, y }) => fromPlane({ x: (x - ox) / s + sw.x, y: (height - y - oy) / s + sw.y });
  return { width, height, scale: s, project, unproject, bbox };
}

/** Encuadre que contiene todos los puntos con un margen en millas, respetando la proporción del lienzo. */
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

function gridStep(spanMinutes) {
  const steps = [1, 2, 5, 10, 15, 20, 30];
  return steps.find((s) => spanMinutes / s <= 8) ?? 60;
}

function fmtTick(deg, isLat) {
  const a = Math.abs(deg);
  const d = Math.floor(a + 1e-9);
  const m = Math.round((a - d) * 60);
  return `${d}°${String(m).padStart(2, '0')}'${isLat ? (deg < 0 ? 'S' : 'N') : deg < 0 ? 'W' : 'E'}`;
}

const pathOf = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join('');

/**
 * Renderiza la carta y una construcción.
 * @param {object} chart  motor de carta (createChart)
 * @param {object} opts   { width, height, bbox?, items?, focus?, step?, showAllMarks? }
 * @returns {{ svg: string, view: object }} SVG y la vista (para convertir píxeles ↔ coordenadas)
 */
export function renderChart(chart, opts = {}) {
  const width = opts.width ?? 640;
  const height = opts.height ?? 440;
  const step = opts.step ?? Infinity;
  const items = (opts.items ?? []).filter((it) => (it.step ?? 0) <= step);
  const bbox = opts.bbox ?? (opts.focus?.length ? fitBBox(opts.focus, 3, chart.bounds) : chart.bounds);
  const view = createView(bbox, width, height);
  const P = view.project;
  const out = [];

  out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="chart" role="img" aria-label="Carta náutica: ${esc(chart.name)}">`);
  out.push(`<defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="context-stroke"/></marker>` +
    `<clipPath id="clip"><rect x="0" y="0" width="${width}" height="${height}"/></clipPath></defs>`);
  out.push(`<rect class="sea" x="0" y="0" width="${width}" height="${height}"/>`);
  out.push('<g clip-path="url(#clip)">');

  // Cuadrícula
  const spanLatMin = (bbox.north - bbox.south) * 60;
  const g = gridStep(spanLatMin) / 60;
  const ext = 0.5;
  for (let lat = Math.ceil((bbox.south - ext) / g) * g; lat <= bbox.north + ext; lat += g) {
    const a = P({ lat, lon: bbox.west - ext });
    const b = P({ lat, lon: bbox.east + ext });
    out.push(`<line class="grid" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`);
    const l = P({ lat, lon: bbox.west });
    if (l.y > 12 && l.y < height - 4) out.push(`<text class="tick" x="3" y="${(l.y - 2).toFixed(1)}">${fmtTick(lat, true)}</text>`);
  }
  for (let lon = Math.ceil((bbox.west - ext) / g) * g; lon <= bbox.east + ext; lon += g) {
    const a = P({ lat: bbox.south - ext, lon });
    const b = P({ lat: bbox.north + ext, lon });
    out.push(`<line class="grid" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`);
    if (a.x > 30 && a.x < width - 30) out.push(`<text class="tick" x="${(a.x + 2).toFixed(1)}" y="${height - 4}">${fmtTick(lon, false)}</text>`);
  }

  // Tierra
  for (const poly of chart.land) {
    out.push(`<path class="land" d="${pathOf(poly.map(([lon, lat]) => P({ lat, lon })))}Z"/>`);
  }

  // Marcas
  for (const m of chart.marks()) {
    const p = P(m);
    if (p.x < -20 || p.y < -20 || p.x > width + 20 || p.y > height + 20) continue;
    if (m.light) {
      out.push(`<g class="mark light"><path d="M${p.x},${p.y - 7}L${p.x + 3},${p.y}L${p.x - 3},${p.y}Z"/><circle cx="${p.x}" cy="${p.y}" r="2"/></g>`);
    } else {
      out.push(`<circle class="mark" cx="${p.x}" cy="${p.y}" r="2.5"/>`);
    }
    out.push(`<text class="mark-label" x="${(p.x + 5).toFixed(1)}" y="${(p.y - 4).toFixed(1)}">${esc(m.short ?? m.name.replace(/^Faro de /, ''))}</text>`);
  }

  // Construcción
  for (const it of items) out.push(drawItem(it, P));

  out.push('</g>');
  out.push(scaleBar(view, bbox));
  out.push(`<text class="rose" x="${width - 18}" y="20">N↑</text>`);
  out.push('</svg>');
  return { svg: out.join(''), view };
}

function label(text, at, cls = 'item-label') {
  return text ? `<text class="${cls}" x="${(at.x + 6).toFixed(1)}" y="${(at.y - 6).toFixed(1)}">${esc(text)}</text>` : '';
}

function drawItem(it, P) {
  const cls = `c-${it.style ?? 'construction'}`;
  switch (it.t) {
    case 'pos': {
      const p = P(it.at);
      const shape = it.style === 'estima'
        ? `<rect x="${p.x - 4}" y="${p.y - 4}" width="8" height="8" class="${cls}"/>`
        : `<circle cx="${p.x}" cy="${p.y}" r="${it.style === 'fix' ? 5 : 4}" class="${cls}"/>`;
      return shape + label(it.label, p, 'pos-label');
    }
    case 'ray': {
      const a = P(it.from);
      const b = P(rhumbDestination(it.from, it.bearing, it.length));
      return `<line class="${cls}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>` + label(it.label, mid(a, b));
    }
    case 'line': {
      const a = P(rhumbDestination(it.through, norm360(it.bearing + 180), it.length / 2));
      const b = P(rhumbDestination(it.through, it.bearing, it.length / 2));
      return `<line class="${cls}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>` + label(it.label, b);
    }
    case 'seg': {
      const a = P(it.from);
      const b = P(it.to);
      return `<line class="${cls}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"${it.arrow ? ' marker-end="url(#arr)"' : ''}/>` + label(it.label, mid(a, b));
    }
    case 'vec': {
      const a = P(it.from);
      const b = P(rhumbDestination(it.from, it.bearing, it.length));
      return `<line class="${cls}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" marker-end="url(#arr)"/>` + label(it.label, mid(a, b));
    }
    case 'arc': {
      const pts = [];
      for (let k = -it.span / 2; k <= it.span / 2; k += 2) pts.push(P(rhumbDestination(it.center, norm360(it.around + k), it.radius)));
      return `<path class="${cls} arc" d="${pathOf(pts)}"/>`;
    }
    default:
      return '';
  }
}

const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

function scaleBar(view, bbox) {
  const lat = (bbox.south + bbox.north) / 2;
  const span = (bbox.north - bbox.south) * 60;
  const miles = span > 30 ? 5 : span > 12 ? 2 : 1;
  const a = view.project({ lat: bbox.south, lon: bbox.west });
  const b = view.project(rhumbDestination({ lat: bbox.south, lon: bbox.west }, 90, miles));
  const w = b.x - a.x;
  const x = view.width - w - 14;
  const y = 40;
  return `<g class="scale"><line x1="${x}" y1="${y}" x2="${x + w}" y2="${y}"/><line x1="${x}" y1="${y - 3}" x2="${x}" y2="${y + 3}"/><line x1="${x + w}" y1="${y - 3}" x2="${x + w}" y2="${y + 3}"/><text x="${x}" y="${y - 5}">${miles} M (lat ${lat.toFixed(0)}°)</text></g>`;
}

export { unitsPerMile, fromPolar, add };
