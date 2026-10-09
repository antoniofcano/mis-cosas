// Láminas de lección: rumbo directo (per-11-3), oposición y enfilación (per-11-7), humedad y punto de rocío (py-2-5)
// y AIS (py-3-10). Dibujos fijos, con las cifras de cada lección.

import { open, title, lbl, arrow, pol, C } from '../kit.js';
import { humedadC } from '../py-cola-meteo-c.js';
import { aisC } from '../electronica-c.js';

const f = (n) => (+n).toFixed(1);
const linea = (a, b, c, w = 2, extra = '') => `<line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}" stroke="${C[c] ?? c}" stroke-width="${w}" ${extra}/>`;
const faro = (p, nombre, anchor = 'middle', dy = -10) => `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="6" fill="#facc15" stroke="#92400e"/>` + lbl(p[0], p[1] + dy, nombre, null, anchor, 'font-weight="700"');
const punto = (p, c) => `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="7" fill="none" stroke="${C[c]}" stroke-width="2"/><circle cx="${f(p[0])}" cy="${f(p[1])}" r="2.5" fill="${C[c]}"/>`;
const tierra = (d) => `<path d="${d}" style="fill:var(--l-casco)" stroke="currentColor" stroke-opacity=".35"/>`;

/** per-11-3: de la salida a la llegada, Rv en la carta y Ra = Rv − Ct (ejemplo resuelto de la lección). */
function rumboDirecto() {
  const W = 320;
  const H = 280;
  const out = open(W, H, 'Rumbo directo', 'rd');
  out.push(title(160, 'Rumbo directo: Rv y Ra'));
  out.push(tierra('M0,236 Q60,226 110,240 Q150,252 190,236 Q240,220 320,232 L320,280 L0,280Z'));
  const S = [214, 60];
  const L = pol(S[0], S[1], 190, 150);
  out.push(linea(S, L, 'v', 2.4, `marker-end="url(#rd-v)"`));
  out.push(punto(S, 'r'), lbl(S[0] - 11, S[1] - 4, 'salida', 'r', 'end', 'font-weight="700"'));
  out.push(`<circle cx="${f(L[0])}" cy="${f(L[1])}" r="6" fill="${C.m}" stroke="#14532d"/>`, lbl(L[0] - 10, L[1] + 4, 'llegada (luz verde)', 'm', 'end', 'font-weight="700"'));
  // meridiano por la salida: el Rv se mide desde el Norte verdadero
  out.push(linea([S[0], S[1] - 26], [S[0], S[1] + 90], 'g', 1.2, 'stroke-dasharray="4 3"'), lbl(S[0], S[1] - 30, 'Nv', 'g', 'middle'));
  out.push(`<path d="M${S[0]},${S[1] - 22} A22,22 0 1,1 ${f(pol(S[0], S[1], 190, 22)[0])},${f(pol(S[0], S[1], 190, 22)[1])}" fill="none" stroke="${C.v}" stroke-width="1.4"/>`);
  out.push(lbl(S[0] + 28, S[1] + 14, 'Rv 190°', 'v', 'start', 'font-weight="700"'));
  const m = pol(S[0], S[1], 190, 82);
  out.push(lbl(m[0] + 10, m[1], 'distancia', null, 'start'), lbl(m[0] + 10, m[1] + 12, '(escala de latitudes)', null, 'start', 'font-size="9"'));
  // la cuenta del ejemplo
  const x = 12;
  out.push(lbl(x, 56, 'dm 2024 ≈ −1°', null, 'start'), lbl(x, 70, 'desvío +6°', null, 'start'));
  out.push(lbl(x, 84, 'Ct = −1° + 6° = +5°', 'p', 'start', 'font-weight="700"'));
  out.push(lbl(x, 104, 'Ra = Rv − Ct', null, 'start'), lbl(x, 118, '   = 190° − 5° = 185°', 'r', 'start', 'font-weight="700"'));
  out.push(lbl(x, 138, 'Tiempo = distancia / velocidad', null, 'start', 'font-size="9.5"'));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Se unen la salida y la llegada y se mide el Rv con el transportador centrado en la salida; la distancia, en la escala de latitudes. Con la Ct se pasa al rumbo de aguja: Ra = Rv − Ct. Las cifras son las del ejemplo resuelto de la lección.' };
}

/** per-11-7: oposición (entre los dos faros) y enfilación (en la prolongación), cortadas por la opuesta de una demora. */
function oposicion(spec) {
  const caso = spec.caso === 'enfilacion' ? 'enfilacion' : 'oposicion';
  const W = 320;
  const H = 270;
  const out = open(W, H, caso === 'oposicion' ? 'Oposición' : 'Enfilación', 'op');
  out.push(title(160, caso === 'oposicion' ? 'Oposición: estás entre los dos faros' : 'Enfilación: un faro tapa al otro'));
  let A;
  let B;
  let P;
  if (caso === 'oposicion') {
    out.push(tierra('M0,30 L110,30 L120,70 Q80,92 40,80 Q14,74 0,84Z'), tierra('M320,190 L320,260 L170,260 Q190,226 236,214 Q284,202 320,190Z'));
    A = [70, 72];
    B = [262, 200];
    P = [A[0] + (B[0] - A[0]) * 0.45, A[1] + (B[1] - A[1]) * 0.45];
    out.push(linea(A, B, 'v', 2.2));
  } else {
    out.push(tierra('M0,30 L320,30 L320,64 Q260,84 200,74 Q140,64 90,86 Q40,100 0,92Z'));
    A = [230, 52];
    B = [178, 78];
    const u = [(B[0] - A[0]), (B[1] - A[1])];
    P = [A[0] + u[0] * 2.9, A[1] + u[1] * 2.9];
    out.push(linea(A, [A[0] + u[0] * 3.6, A[1] + u[1] * 3.6], 'v', 2.2, 'stroke-dasharray="7 4"'), linea(A, B, 'v', 2.2));
  }
  out.push(faro(A, 'faro A', 'middle', caso === 'oposicion' ? -10 : -10), faro(B, 'faro B', caso === 'oposicion' ? 'end' : 'middle', caso === 'oposicion' ? 22 : -10));
  // tercer faro y la opuesta de su demora
  const T = caso === 'oposicion' ? [40, 226] : [290, 214];
  out.push(tierra(caso === 'oposicion' ? 'M0,214 L60,222 L50,260 L0,260Z' : 'M320,200 L280,206 L276,260 L320,260Z'));
  out.push(linea(T, [T[0] + (P[0] - T[0]) * 1.25, T[1] + (P[1] - T[1]) * 1.25], 'p', 2));
  out.push(faro(T, 'faro C', caso === 'oposicion' ? 'start' : 'end', -12));
  const mT = [T[0] + (P[0] - T[0]) * 0.5, T[1] + (P[1] - T[1]) * 0.5];
  out.push(lbl(mT[0] + (caso === 'oposicion' ? 8 : -8), mT[1] + 14, 'opuesta de la Dv de C', 'p', caso === 'oposicion' ? 'start' : 'end', 'font-weight="700"'));
  out.push(punto(P, 'r'), lbl(P[0] + (caso === 'oposicion' ? 12 : -12), P[1] - 8, 'situación', 'r', caso === 'oposicion' ? 'start' : 'end', 'font-weight="700"'));
  out.push(lbl(14, H - 12, caso === 'oposicion' ? 'A y B en sentidos opuestos: el corte, entre ellos.' : 'A y B en la misma dirección: el corte, en la prolongación.', null, 'start', 'font-size="9.5"'));
  out.push('</svg>');
  return {
    svg: out.join(''),
    caption: caso === 'oposicion'
      ? 'En una oposición estás sobre el segmento que une los dos faros. Esa recta ya es una línea de posición, sin correcciones: córtala con la opuesta de la demora verdadera de un tercer faro y tienes la situación.'
      : 'En una enfilación ves un faro tapando al otro: estás en la prolongación de la recta que los une, fuera del segmento. Córtala con la opuesta de la demora verdadera de un tercer faro.',
  };
}

/** py-2-5: humedad relativa y punto de rocío; en estilo C, en src/illustrations/py-cola-meteo-c.js. */
const humedad = humedadC;

/** py-3-10: lo que enseña el AIS y lo que no; en estilo C, en src/illustrations/electronica-c.js. */
const ais = aisC;

export const LAMINAS = {
  'rumbo-directo': { fn: rumboDirecto, params: {}, ejemplo: { tipo: 'rumbo-directo' } },
  oposicion: { fn: oposicion, params: { caso: ['oposicion', 'enfilacion'] }, ejemplo: { tipo: 'oposicion', caso: 'oposicion' } },
  humedad: { fn: humedad, params: { t: 'temperatura del aire (por defecto 20)', td: 'punto de rocío (por defecto 12)' }, ejemplo: { tipo: 'humedad' } },
  ais: { fn: ais, params: {}, ejemplo: { tipo: 'ais' } },
};
