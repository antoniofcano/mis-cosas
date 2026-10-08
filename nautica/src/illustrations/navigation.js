// Ilustraciones de navegación: triángulos de corriente, abatimiento,
// viento aparente (también según el rumbo), loxodrómica, mareas (y vivas/muertas), situación por dos demoras, sectores de las luces, canal balizado y dispositivo de separación del tráfico.
// Los colores son de saturación media para leerse en los temas claro y oscuro (el fondo es il-panel).

import { vientoAparente } from '../nautical/viento.js';
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

// ---------------------------------------------------------------------------
// Viento real, de avance y aparente. spec: { tipo:'viento-aparente' }

const RUMBOS_VIENTO = { cenida: ['Ceñida', 45], traves: ['Través', 90], aleta: ['Aleta', 135], popa: ['Popa', 180] };

/** Viento aparente según el ángulo del viento real con la proa (real 12 kn, barco 6 kn). */
function vientoAparenteRumbo(rumbo) {
  const [nombre, ang] = RUMBOS_VIENTO[rumbo];
  const vr = 12;
  const vb = 6;
  const s = 7.5;
  // vectores en pantalla (proa hacia arriba): el real viene de «ang» grados por estribor y va hacia ang + 180
  const real = [-Math.sin(rad(ang)) * vr, Math.cos(rad(ang)) * vr];
  const avance = [0, vb];
  const ap = [real[0] + avance[0], real[1] + avance[1]];
  const ap0 = vientoAparente({ angReal: ang, vr, vb });
  const vap = ap0.va;
  const angAp = Math.round(ap0.ang);
  const W = 320;
  const H = 256;
  const out = open(W, H, 'Viento aparente', 'vr');
  out.push(title(160, `${nombre}: viento real a ${ang}° de la proa`));
  const boat = [96, 172];
  out.push(`<g transform="translate(${boat[0]} ${boat[1]})"><path d="M0,-34 C12,-20 12,0 11,26 L-11,26 C-12,0 -12,-20 0,-34Z" class="il-hull-plan"/></g>`, lbl(boat[0], boat[1] - 40, 'proa', null, 'middle', 'font-size="9"'));
  // el triángulo termina junto al barco, por su estribor (por donde le llega el viento)
  if (ang === 180) {
    // en popa los tres vectores van en la misma línea: se dibujan uno junto a otro
    const x = boat[0] + 26;
    const yb = boat[1] + 60;
    out.push(arrow(x, yb, x, yb - vr * s, 'v', 'vr', 2.4), arrow(x + 12, yb - vr * s, x + 12, yb - vr * s + vb * s, 'm', 'vr', 2.4));
    out.push(`<line x1="${x + 24}" y1="${yb}" x2="${x + 24}" y2="${yb - vap * s}" stroke="${C.r}" stroke-width="3" stroke-dasharray="7 4" marker-end="url(#vr-r)"><animate attributeName="stroke-dashoffset" from="22" to="0" dur="1s" repeatCount="indefinite"/></line>`);
  } else {
    const P = [boat[0] + 22, boat[1] - 6];
    const o = [P[0] - ap[0] * s, P[1] - ap[1] * s];
    const m = [o[0] + real[0] * s, o[1] + real[1] * s];
    out.push(arrow(o[0], o[1], m[0], m[1], 'v', 'vr', 2.4), arrow(m[0], m[1], P[0], P[1], 'm', 'vr', 2.4));
    out.push(`<line x1="${o[0].toFixed(1)}" y1="${o[1].toFixed(1)}" x2="${P[0].toFixed(1)}" y2="${P[1].toFixed(1)}" stroke="${C.r}" stroke-width="3" stroke-dasharray="7 4" marker-end="url(#vr-r)"><animate attributeName="stroke-dashoffset" from="22" to="0" dur="1s" repeatCount="indefinite"/></line>`);
  }
  out.push(lbl(220, 52, `real: ${vr} kn`, 'v', 'start', 'font-weight="700"'), lbl(220, 66, ang === 180 ? 'de popa' : `de ${ang}° por Er`, 'v'));
  out.push(lbl(220, 88, `de avance: ${vb} kn`, 'm', 'start', 'font-weight="700"'), lbl(220, 102, 'de proa', 'm'));
  out.push(lbl(220, 124, `aparente: ${vap.toFixed(1).replace('.', ',')} kn`, 'r', 'start', 'font-weight="700"'), lbl(220, 138, angAp === 180 ? 'de popa' : `de ${angAp}° por Er`, 'r'));
  const comp = vap > vr ? 'más fuerte que el real y más a proa' : vap < vr ? `más flojo que el real${angAp < ang ? ' y más a proa' : ''}` : 'igual que el real';
  out.push(lbl(14, H - 12, `Aparente ${comp}`, null, 'start', 'font-weight="700"'));
  out.push('</svg>');
  const cap = {
    cenida: 'Ciñendo, el viento de avance se suma casi de frente: el aparente es más fuerte que el real y entra más cerrado (más a proa). Por eso a bordo parece que sopla más de lo que sopla.',
    traves: 'Con el real de través, el aparente sigue siendo algo más fuerte que el real y entra por delante del través.',
    aleta: 'Con el real por la aleta, el aparente es más flojo que el real y entra más a proa: navegando con el viento a favor se nota menos viento.',
    popa: 'Con el real en popa, el aparente es la diferencia entre el real y tu velocidad: viene de popa y es más flojo. A tu misma velocidad, el aparente sería nulo.',
  };
  return { svg: out.join(''), caption: cap[rumbo] };
}

export function vientoAparenteIllustration(spec = {}) {
  if (spec.rumbo) return RUMBOS_VIENTO[spec.rumbo] ? vientoAparenteRumbo(spec.rumbo) : null;
  const W = 320;
  const H = 260;
  const out = open(W, H, 'Viento aparente', 'va');
  out.push(title(160, 'Real + de avance = aparente'));
  const o = [200, 70];
  const s = 9;
  // viento real del través de estribor (sopla hacia el oeste), barco a rumbo norte
  const real = [-14 * s, 0];
  const avance = [0, 8 * s];
  out.push(`<path d="M120,230 L128,200 L136,230Z" fill="${C.g}"/>`, lbl(140, 225, 'barco a rumbo N'));
  out.push(arrow(o[0], o[1], o[0] + real[0], o[1] + real[1], 'v', 'va'), lbl(o[0] + real[0] / 2, o[1] - 8, 'real (14 kn)', 'v', 'middle'));
  out.push(arrow(o[0] + real[0], o[1], o[0] + real[0] + avance[0], o[1] + avance[1], 'm', 'va'), lbl(o[0] + real[0] - 6, o[1] + avance[1] / 2, 'de avance (8 kn)', 'm', 'end'));
  out.push(arrow(o[0], o[1], o[0] + real[0] + avance[0], o[1] + avance[1], 'r', 'va', 2.8), lbl(o[0] - 20, o[1] + 52, 'aparente', 'r', 'start', 'font-weight="700"'));
  out.push(lbl(14, H - 12, 'El de avance es igual y contrario a la velocidad del barco'));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'A bordo notas el viento aparente: la suma del real y del que produce tu propio avance. Al navegar, el aparente entra más por la proa que el real y, ciñendo, es más fuerte.' };
}

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
