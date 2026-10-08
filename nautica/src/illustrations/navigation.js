// Ilustraciones de navegación: triángulos de corriente, abatimiento,
// viento aparente (también según el rumbo), loxodrómica, mareas (y vivas/muertas), situación por dos demoras, sectores de las luces, canal balizado y dispositivo de separación del tráfico.
// Los colores son de saturación media para leerse en los temas claro y oscuro (el fondo es il-panel).

import { mareasVivasMuertas } from './meteo-c.js';

const C = { v: '#2563eb', m: '#16a34a', a: '#d97706', r: '#dc2626', p: '#7c3aed', g: '#64748b' };

const defs = (id) => `<defs>${Object.entries(C).map(([k, c]) => `<marker id="${id}-${k}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="${c}"/></marker>`).join('')}</defs>`;
const open = (W, H, label, id) => [`<svg viewBox="0 0 ${W} ${H}" class="il" role="img" aria-label="${label}">`, `<rect width="${W}" height="${H}" rx="10" class="il-panel"/>`, defs(id)];
const title = (x, t) => `<text x="${x}" y="22" class="il-title">${t}</text>`;
const rad = (d) => (d * Math.PI) / 180;
/** Punto a una distancia r desde (x, y) en un rumbo náutico (0 = arriba, sentido horario). */
const pol = (x, y, deg, r) => [x + Math.sin(rad(deg)) * r, y - Math.cos(rad(deg)) * r];
const arrow = (x1, y1, x2, y2, c, id, w = 2.4, extra = '') => `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${C[c]}" stroke-width="${w}" marker-end="url(#${id}-${c})" ${extra}/>`;
const lbl = (x, y, t, c = null, anchor = 'start', extra = '') => `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" class="il-lbl" text-anchor="${anchor}" ${c ? `style="fill:${C[c]}"` : ''} ${extra}>${t}</text>`;
/** Arco de ángulo entre dos rumbos (de a hasta b, sentido horario si b > a). */
function arc(x, y, r, a, b, c) {
  const [x1, y1] = pol(x, y, a, r);
  const [x2, y2] = pol(x, y, b, r);
  const large = Math.abs(b - a) > 180 ? 1 : 0;
  const sweep = b > a ? 1 : 0;
  return `<path d="M${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${large} ${sweep} ${x2.toFixed(1)},${y2.toFixed(1)}" fill="none" stroke="${C[c]}" stroke-width="1.6"/>`;
}
const fmt = (n) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n)}°`;

// Nortes (verdadero, magnético y de aguja): ahora es interactiva, en src/illustrations/interactivas/nortes.js.

// Corriente y abatimiento: ahora son interactivas, en src/illustrations/interactivas/ (cadena.js, corriente.js, abatimiento.js).

// Viento real, de avance y aparente: ahora en estilo C, en src/illustrations/meteo-c.js.

// ---------------------------------------------------------------------------
// Mareas. spec: { tipo:'marea', modo:'curva'|'duodecimos'|'sonda' }

export function mareaIllustration(spec) {
  // curva, duodécimos y sonda: ahora son interactivas (src/illustrations/interactivas/marea.js)
  return spec.modo === 'fases' ? mareasVivasMuertas() : null;
}

// Sectores de las luces: ahora es interactiva, en src/illustrations/interactivas/sectores-luces.js.

// Canal balizado: ahora en estilo C, en src/illustrations/balizamiento.js.

// ---------------------------------------------------------------------------
// Dispositivo de separación del tráfico (Regla 10). spec: { tipo:'dst' }

export function dstIllustration() {
  const W = 320;
  const H = 260;
  const out = open(W, H, 'Dispositivo de separación del tráfico', 'ds');
  out.push(title(160, 'Separación del tráfico (Regla 10)'));
  out.push(`<rect x="0" y="220" width="320" height="40" fill="#a16207" opacity=".75"/>`, lbl(160, 244, 'COSTA', null, 'middle', 'style="fill:#fff" font-weight="700"'));
  out.push(`<rect x="0" y="60" width="320" height="50" fill="${C.v}" opacity=".12"/><rect x="0" y="110" width="320" height="16" fill="#a855f7" opacity=".35"/><rect x="0" y="126" width="320" height="50" fill="${C.v}" opacity=".12"/>`);
  out.push(lbl(8, 76, 'vía de circulación'), lbl(8, 122, 'zona de separación', 'p'), lbl(8, 142, 'vía de circulación'), lbl(8, 198, 'zona de navegación costera'));
  for (let x = 60; x < 300; x += 80) out.push(arrow(x + 40, 88, x, 88, 'v', 'ds', 2), arrow(x, 152, x + 40, 152, 'v', 'ds', 2));
  out.push(arrow(250, 210, 250, 50, 'r', 'ds', 2.6), lbl(256, 56, 'cruzar a 90°', 'r'));
  out.push(`<g><path d="M0,-12 L6,6 L-6,6Z" fill="${C.r}"/><animateMotion dur="7s" repeatCount="indefinite" path="M250,210 L250,50"/></g>`);
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Se navega por la vía en el sentido de la circulación. Si hay que cruzarlo, lo más perpendicular posible a la corriente de tráfico; para entrar o salir, por los extremos o con el menor ángulo. Los buques de menos de 20 m, los de vela y los pesqueros pueden usar la zona de navegación costera.' };
}

// Mareas vivas y muertas: ahora en estilo C, en src/illustrations/meteo-c.js.

// Enfilación, situación por dos demoras y loxodrómica: ahora en estilo C, en src/illustrations/carta-c.js.
