// Lectura de las opciones de respuesta de los exámenes ("35º 53,9' N; 005º 32,2' W", "–12º (menos)",
// "Ra = 161º, HRB = 21h 34m", "9,6′", "248º, 8,5 millas"...) y elección de la opción más próxima a
// un resultado calculado. Así se valida el motor contra la plantilla oficial.

import { quantity } from '../analysis/quantities.js';

const NUM = '(\\d+(?:[.,]\\d+)?)';
const DEG = '\\s*[º°o]?';
// Minutos: «53,9'», «53,9», y también «59'5» (= 59,5′: el apóstrofo hace de coma decimal).
const MIN = `\\s*(\\d+(?:[.,]\\d+|['′’´]\\d+(?![\\d.,]))?)\\s*['′’´]?`;
const num = (s) => Number(String(s).replace(/[,'′’´]/, '.'));

const PATTERNS = {
  lat: { re: new RegExp(`(\\d{1,2})\\s*[º°o]${MIN}\\s*,?\\s*([NS])`, 'i'), val: (m) => (num(m[1]) + num(m[2]) / 60) * (/s/i.test(m[3]) ? -1 : 1) },
  lon: { re: new RegExp(`(\\d{1,3})\\s*[º°o]${MIN}\\s*([EW])`, 'i'), val: (m) => (num(m[1]) + num(m[2]) / 60) * (/w/i.test(m[3]) ? -1 : 1) },
  bearing: [
    // Cuadrantal: «S46,6ºW», «N46W» → circular.
    { re: new RegExp(`\\b([NS])\\s*${NUM}${DEG}\\s*([EW])\\b`, 'i'), val: (m) => {
      const a = num(m[2]); const ns = m[1].toUpperCase(); const ew = m[3].toUpperCase();
      return ns === 'N' ? (ew === 'E' ? a : 360 - a) : (ew === 'E' ? 180 - a : 180 + a);
    } },
    { re: new RegExp(`(\\d{1,3}(?:[.,]\\d+)?)${DEG}`), val: (m) => num(m[1]) },
  ],
  // "+5º (más)", "–12º (menos)", "2º (-)", "Ct = 8º +", "Ct=004º NE", "- 9º"
  signed: [
    // Declinación en grados y minutos: «4º50 NW», «4º 40′ NE».
    { re: /(\d{1,2})\s*[º°]\s*(\d{1,2})\s*['′’]?\s*(NE|NW)\b/i, val: (m) => (Number(m[1]) + Number(m[2]) / 60) * (/NW/i.test(m[3]) ? -1 : 1) },
    { re: new RegExp(`([+\\-–‒−])?\\s*${NUM}\\s*[º°]?\\s*(\\(\\s*(?:más|menos|[+\\-–‒−])\\s*\\)|NE|NW|[+\\-–‒−](?!\\s*\\d))?`, 'i'),
    val: (m) => {
      const v = num(m[2]);
      const s = `${m[1] ?? ''}${m[3] ?? ''}`;
      return /[-–‒−]|menos|NW/i.test(s) ? -v : v;
    } },
  ],
  clock: { re: /(\d{1,2})\s*(?:h|:|-)\s*(\d{2})/, val: (m) => Number(m[1]) * 60 + Number(m[2]) },
  distance: { re: new RegExp(`${NUM}\\s*(?:millas|′|'|M\\b)?`), val: (m) => num(m[1]) },
  meters: { re: new RegExp(`${NUM}\\s*(?:m\\b|metros)?`), val: (m) => num(m[1]) },
  speed: { re: new RegExp(`${NUM}\\s*(?:nudos|kn)?`), val: (m) => num(m[1]) },
};

/** Extrae en orden los valores de los tipos pedidos. Devuelve null si no los encuentra. */
export function parseOption(text, kinds) {
  let rest = String(text);
  // Quitamos etiquetas como "Ra =", "HRB =", "l =", "L =", "Rv=", "d =", "Distancia=".
  rest = rest.replace(/\b(?:Ra|Rv|HRB|Ct|CT|Distancia|d|l|L)\s*=\s*/g, ' ');
  const out = [];
  for (const k of kinds) {
    if (!PATTERNS[k]) throw new Error(`Tipo de opción desconocido: ${k}`);
    // Varias formas posibles (las más específicas primero): vale la primera que encaje.
    const hits = [PATTERNS[k]].flat().map((p) => ({ p, m: rest.match(p.re) })).filter((x) => x.m);
    if (!hits.length) return null;
    const { p, m } = hits[0];
    out.push(p.val(m));
    rest = rest.slice(m.index + m[0].length);
  }
  return out;
}

/**
 * Elige la opción más cercana a los valores calculados.
 * @param {Record<string,string>} opciones  {a: '...', b: '...'}
 * @param {{kind:string, value:number}[]} values
 * @returns {{ choice:string, scores:Record<string,number>, parsed:Record<string,number[]> }}
 *   score = suma de (error / tolerancia de examen) de cada valor; < 1 por valor = dentro de tolerancia.
 */
export function chooseOption(opciones, values) {
  const kinds = values.map((v) => v.kind);
  const scores = {};
  const parsed = {};
  for (const [k, text] of Object.entries(opciones)) {
    const vals = parseOption(text, kinds);
    parsed[k] = vals;
    if (!vals) { scores[k] = Infinity; continue; }
    scores[k] = values.reduce((acc, v, i) => {
      const q = quantity(v.kind);
      return acc + q.error(vals[i], v.value) / q.tolerance;
    }, 0);
  }
  const choice = Object.entries(scores).sort((a, b) => a[1] - b[1])[0][0];
  return { choice, scores, parsed };
}
