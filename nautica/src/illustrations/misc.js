// Ilustraciones: meteorología y banderas (borrasca, anticiclón, partes del barco y hélice: laminas-c.js).
import { borrascaAnticiclon } from './laminas-c.js';
import { buysBallot, brisa, frenteCorte } from './meteo-c.js';

const arrowDefs = (id, color) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0L10,5L0,10z" fill="${color}"/></marker></defs>`;

// ---------------------------------------------------------------------------
// Meteorología
// spec: { tipo:'meteo', sistema:'borrasca'|'anticiclon'|'buys-ballot'|'brisa-mar'|'brisa-tierra'|'frentes' }

export function meteoIllustration(spec) {
  const sys = spec.sistema;
  // borrasca y anticiclón: en estilo C, en src/illustrations/laminas-c.js
  if (sys === 'borrasca' || sys === 'anticiclon') return borrascaAnticiclon(sys === 'borrasca');
  // Buys-Ballot, brisas y frentes en corte: en estilo C, en src/illustrations/meteo-c.js
  if (sys === 'buys-ballot') return buysBallot();
  if (sys === 'brisa-mar' || sys === 'brisa-tierra') return brisa(sys === 'brisa-mar');
  if (sys === 'frente-frio-corte' || sys === 'frente-calido-corte') return frenteCorte(sys === 'frente-frio-corte');
  // frentes, isobaras y nieblas: interactivas (src/illustrations/interactivas/)
  return null;
}

// Partes del barco y efecto de la hélice: en estilo C, en src/illustrations/laminas-c.js.

// Rosa (rumbo, demora y marcación): ahora es interactiva, en src/illustrations/interactivas/rosa.js.

// ---------------------------------------------------------------------------
// Banderas
// spec: { tipo:'bandera', codigo:'A'|'buceo'|'O'|'N'|'C'|'B'|'H'|'U'|'V'|'W' }

export const FLAGS = {
  A: { nombre: 'Bandera «A» (Alfa)', nota: 'Tengo un buzo sumergido: manténgase alejado y a poca velocidad.', svg: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w / 2}" height="${h}" fill="#fff" stroke="#999"/><path d="M${x + w / 2},${y} L${x + w},${y} L${x + w * 0.75},${y + h / 2} L${x + w},${y + h} L${x + w / 2},${y + h}Z" fill="#1d4ed8"/>` },
  buceo: { nombre: 'Bandera de buceo (roja con diagonal blanca)', nota: 'Señala buceadores en inmersión (uso deportivo y recreativo).', svg: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#dc2626"/><path d="M${x},${y} L${x + w * 0.18},${y} L${x + w},${y + h * 0.82} L${x + w},${y + h} L${x + w * 0.82},${y + h} L${x},${y + h * 0.18}Z" fill="#fff"/>` },
  O: { nombre: 'Bandera «O» (Oscar)', nota: '¡Hombre al agua!', svg: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#facc15"/><path d="M${x},${y} L${x + w},${y} L${x + w},${y + h}Z" fill="#dc2626"/>` },
  N: { nombre: 'Bandera «N» (November)', nota: 'No (negativo). Con la «C» encima: señal de socorro (NC).', svg: (x, y, w, h) => [...Array(16)].map((_, i) => `<rect x="${x + (i % 4) * w / 4}" y="${y + Math.floor(i / 4) * h / 4}" width="${w / 4}" height="${h / 4}" fill="${(i + Math.floor(i / 4)) % 2 ? '#fff' : '#1d4ed8'}"/>`).join('') },
  C: { nombre: 'Bandera «C» (Charlie)', nota: 'Sí (afirmativo). NC = socorro.', svg: (x, y, w, h) => ['#1d4ed8', '#fff', '#dc2626', '#fff', '#1d4ed8'].map((c, i) => `<rect x="${x}" y="${y + (i * h) / 5}" width="${w}" height="${h / 5}" fill="${c}"/>`).join('') },
  B: { nombre: 'Bandera «B» (Bravo)', nota: 'Estoy cargando, descargando o transportando mercancías peligrosas.', svg: (x, y, w, h) => `<path d="M${x},${y} L${x + w},${y} L${x + w * 0.75},${y + h / 2} L${x + w},${y + h} L${x},${y + h}Z" fill="#dc2626"/>` },
  H: { nombre: 'Bandera «H» (Hotel)', nota: 'Tengo práctico a bordo.', svg: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w / 2}" height="${h}" fill="#fff" stroke="#999"/><rect x="${x + w / 2}" y="${y}" width="${w / 2}" height="${h}" fill="#dc2626"/>` },
  U: { nombre: 'Bandera «U» (Uniform)', nota: 'Se dirige usted hacia un peligro.', svg: (x, y, w, h) => [0, 1, 2, 3].map((i) => `<rect x="${x + (i % 2) * w / 2}" y="${y + Math.floor(i / 2) * h / 2}" width="${w / 2}" height="${h / 2}" fill="${i === 0 || i === 3 ? '#dc2626' : '#fff'}"/>`).join('') },
  V: { nombre: 'Bandera «V» (Victor)', nota: 'Necesito asistencia.', svg: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff" stroke="#999"/><path d="M${x},${y} L${x + w},${y + h} M${x + w},${y} L${x},${y + h}" stroke="#dc2626" stroke-width="${h / 5}"/>` },
  W: { nombre: 'Bandera «W» (Whiskey)', nota: 'Necesito asistencia médica.', svg: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#1d4ed8"/><rect x="${x + w / 6}" y="${y + h / 6}" width="${(w * 2) / 3}" height="${(h * 2) / 3}" fill="#fff"/><rect x="${x + w / 3}" y="${y + h / 3}" width="${w / 3}" height="${h / 3}" fill="#dc2626"/>` },
};

export function flagIllustration(spec) {
  const f = FLAGS[spec.codigo];
  if (!f) return null;
  const W = 300;
  const H = 170;
  const svg = `<svg viewBox="0 0 ${W} ${H}" class="il" role="img" aria-label="${f.nombre}"><rect width="${W}" height="${H}" rx="10" class="il-panel"/>` +
    `<line x1="40" y1="20" x2="40" y2="150" stroke="#6b7280" stroke-width="3"/>` +
    `<g><g>${f.svg(42, 30, 120, 80)}</g><animateTransform attributeName="transform" type="skewY" values="0;2;0;-2;0" dur="2.4s" repeatCount="indefinite"/></g>` +
    `<text x="180" y="52" class="il-title left">${f.nombre.replace(/ \(.*/, '')}</text>` +
    `<foreignObject x="176" y="60" width="116" height="90"><div xmlns="http://www.w3.org/1999/xhtml" class="il-fo">${f.nota}</div></foreignObject></svg>`;
  return { svg, caption: f.nota };
}
