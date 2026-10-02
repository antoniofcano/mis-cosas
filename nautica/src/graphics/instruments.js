// Motor gráfico: instrumentos de dibujo náutico (texto SVG en coordenadas mundo, tamaño constante en
// pantalla). La interacción (arrastrar, girar) está en ui/chart/; aquí solo geometría y dibujo.
//
//  · Transportador cuadrado (tipo «Portland/Douglas» que se usa en el examen): cuadrado transparente
//    orientado al norte de la carta (sus lados paralelos a meridianos y paralelos), con agujero central,
//    cuadrícula interior y graduación 0–360° en el borde. Un hilo desde el centro marca el rumbo/demora.
//  · Compás de puntas: circunferencia de radio en millas, medido en la escala de latitudes del centro.
//  · Regla: segmento con lectura de rumbo verdadero y distancia.

import { worldPerMile, toWorld } from './chart-renderer.js';
import { norm360 } from '../math/angles.js';
import { rhumbTo } from '../math/mercator.js';
import { fmtBearing, fmtMiles } from '../math/format.js';

const f = (n) => n.toFixed(2);
const DEG = Math.PI / 180;

/** Dirección mundo (y hacia abajo) de un rumbo náutico. */
export const dirOf = (bearing) => ({ x: Math.sin(bearing * DEG), y: -Math.cos(bearing * DEG) });

/** Rumbo náutico desde el punto mundo a hacia b. */
export const bearingWorld = (a, b) => norm360(Math.atan2(b.x - a.x, -(b.y - a.y)) / DEG);

/** Punto del borde de un cuadrado de semilado h centrado en c, en la dirección del rumbo. */
export function squareEdgePoint(c, h, bearing) {
  const d = dirOf(bearing);
  const t = h / Math.max(Math.abs(d.x), Math.abs(d.y));
  return { x: c.x + d.x * t, y: c.y + d.y * t, t };
}

/**
 * Transportador cuadrado.
 * @param {{x,y}} c centro (mundo) · @param {number} bearing rumbo del hilo · @param {number} z escala (px/unidad)
 * @param {{ sizePx?: number }} opts
 */
export function squareProtractor(c, bearing, z, { sizePx = 260 } = {}) {
  const h = sizePx / 2 / z;
  const k = 1 / z;
  const out = [`<g class="protractor">`];
  out.push(`<rect class="body" x="${f(c.x - h)}" y="${f(c.y - h)}" width="${f(2 * h)}" height="${f(2 * h)}" rx="${f(6 * k)}"/>`);
  // Cuadrícula interior (para alinear con meridianos y paralelos)
  for (let i = -3; i <= 3; i++) {
    const o = (i * h) / 4;
    out.push(`<line class="grid-in" x1="${f(c.x + o)}" y1="${f(c.y - h * 0.82)}" x2="${f(c.x + o)}" y2="${f(c.y + h * 0.82)}"/>`);
    out.push(`<line class="grid-in" x1="${f(c.x - h * 0.82)}" y1="${f(c.y + o)}" x2="${f(c.x + h * 0.82)}" y2="${f(c.y + o)}"/>`);
  }
  // Graduación en el borde
  for (let deg = 0; deg < 360; deg++) {
    const e = squareEdgePoint(c, h, deg);
    const d = dirOf(deg);
    const len = (deg % 10 === 0 ? 13 : deg % 5 === 0 ? 8 : 4.5) * k;
    out.push(`<line class="tick${deg % 10 ? '' : ' major'}" x1="${f(e.x)}" y1="${f(e.y)}" x2="${f(e.x - d.x * len)}" y2="${f(e.y - d.y * len)}"/>`);
    if (deg % 10 === 0) {
      const lp = { x: e.x - d.x * 22 * k, y: e.y - d.y * 22 * k };
      const cls = deg % 90 === 0 ? 'lbl card' : 'lbl';
      out.push(`<text class="${cls}" font-size="${f((deg % 90 ? 8.5 : 10) * k)}" x="${f(lp.x)}" y="${f(lp.y + 3 * k)}" text-anchor="middle">${String(deg).padStart(3, '0')}</text>`);
    }
  }
  // Hilo y lectura
  const end = squareEdgePoint(c, h, bearing);
  const back = squareEdgePoint(c, h, bearing + 180);
  out.push(`<line class="arm-back" x1="${f(c.x)}" y1="${f(c.y)}" x2="${f(back.x)}" y2="${f(back.y)}"/>`);
  out.push(`<line class="arm" x1="${f(c.x)}" y1="${f(c.y)}" x2="${f(end.x)}" y2="${f(end.y)}"/>`);
  const dd = dirOf(bearing);
  out.push(`<text class="reading" font-size="${f(12 * k)}" x="${f(end.x + dd.x * 14 * k)}" y="${f(end.y + dd.y * 14 * k + 4 * k)}" text-anchor="middle">${fmtBearing(bearing)}</text>`);
  // Agujero central
  out.push(`<circle class="hole" cx="${f(c.x)}" cy="${f(c.y)}" r="${f(7 * k)}"/>`);
  out.push(`<line class="cross" x1="${f(c.x - 10 * k)}" y1="${f(c.y)}" x2="${f(c.x + 10 * k)}" y2="${f(c.y)}"/><line class="cross" x1="${f(c.x)}" y1="${f(c.y - 10 * k)}" x2="${f(c.x)}" y2="${f(c.y + 10 * k)}"/>`);
  out.push('</g>');
  return out.join('');
}

/** Lectura y dibujo del compás: centro geográfico y punto del radio. */
export function compassPreview(centerGeo, edgeGeo, z) {
  const { distance } = rhumbTo(centerGeo, edgeGeo);
  const c = toWorld(centerGeo);
  const e = toWorld(edgeGeo);
  const r = distance * worldPerMile(centerGeo.lat);
  const k = 1 / z;
  const svg = `<g class="compass-preview"><circle cx="${f(c.x)}" cy="${f(c.y)}" r="${f(r)}"/>` +
    `<line x1="${f(c.x)}" y1="${f(c.y)}" x2="${f(e.x)}" y2="${f(e.y)}"/>` +
    `<circle class="pt" cx="${f(c.x)}" cy="${f(c.y)}" r="${f(3 * k)}"/><circle class="pt" cx="${f(e.x)}" cy="${f(e.y)}" r="${f(3 * k)}"/>` +
    `<text font-size="${f(12 * k)}" x="${f((c.x + e.x) / 2 + 6 * k)}" y="${f((c.y + e.y) / 2 - 6 * k)}">${fmtMiles(distance)}</text></g>`;
  return { svg, radius: distance };
}

/** Lectura y dibujo de la regla entre dos puntos geográficos. */
export function rulerPreview(aGeo, bGeo, z) {
  const { bearing, distance } = rhumbTo(aGeo, bGeo);
  const a = toWorld(aGeo);
  const b = toWorld(bGeo);
  const k = 1 / z;
  const text = `Rv ${fmtBearing(bearing)} · ${fmtMiles(distance)}`;
  const svg = `<g class="ruler-preview"><line x1="${f(a.x)}" y1="${f(a.y)}" x2="${f(b.x)}" y2="${f(b.y)}"/>` +
    `<circle class="pt" cx="${f(a.x)}" cy="${f(a.y)}" r="${f(3 * k)}"/><circle class="pt" cx="${f(b.x)}" cy="${f(b.y)}" r="${f(3 * k)}"/>` +
    `<text font-size="${f(12 * k)}" x="${f((a.x + b.x) / 2 + 6 * k)}" y="${f((a.y + b.y) / 2 - 6 * k)}">${text}</text></g>`;
  return { svg, bearing, distance, text };
}
