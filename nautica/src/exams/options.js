// Lectura de las opciones de respuesta de los exámenes ("35º 53,9' N; 005º 32,2' W", "–12º (menos)",
// "Ra = 161º, HRB = 21h 34m", "9,6′", "248º, 8,5 millas"...) y elección de la opción más próxima a
// un resultado calculado. Así se valida el motor contra la plantilla oficial.

import { quantity } from '../analysis/quantities.js';

const NUM = '(\\d+(?:[.,]\\d+)?)';
const DEG = '\\s*[º°oª]?';
// Apóstrofos de minuto, también U+0092 (el apóstrofo de Windows-1252 mal convertido) y la diéresis «¨» («27,8¨W»).
const APOS = `['′’´\u0092¨]`;
// Grados de una latitud o longitud: «36º», «35ª» (errata frecuente), «36º-07,0'» y «05-11,5'» (guion entre grados y
// minutos).
const GRADOS = `\\s*(?:[º°oª]\\s*-?|-(?=\\s*\\d))`;
// Minutos: «53,9'», «53,9», «59'5» y «5º 25’2» (el apóstrofo hace de coma decimal: 59,5′) y «10',8» (apóstrofo y coma);
// tras los minutos, a veces una errata: «24,0º'».
const MIN = `\\s*(\\d+(?:[.,]\\d+|${APOS}\\s*[.,]?\\d+(?![\\d.,]))?)\\s*[º°]?${APOS}?`;
const num = (s) => Number(String(s).replace(/\s/g, '').replace(/['′’´\u0092¨][.,]?|,/, '.'));

const PATTERNS = {
  lat: { re: new RegExp(`(\\d{1,2})${GRADOS}${MIN}\\s*,?\\s*([NS])`, 'i'), val: (m) => (num(m[1]) + num(m[2]) / 60) * (/s/i.test(m[3]) ? -1 : 1) },
  lon: { re: new RegExp(`(\\d{1,3})${GRADOS}${MIN}\\s*([EW])`, 'i'), val: (m) => (num(m[1]) + num(m[2]) / 60) * (/w/i.test(m[3]) ? -1 : 1) },
  bearing: [
    // Por su nombre: «Ev» (Este verdadero), «Nv», «Sv», «Wv»/«Ov».
    { re: /(?<![\p{L}\d])([NSEWO])v(?![\p{L}])/u, val: (m) => ({ N: 0, E: 90, S: 180, W: 270, O: 270 })[m[1]] },
    // Cuadrantal: «S46,6ºW», «N46W» → circular.
    { re: new RegExp(`\\b([NS])\\s*${NUM}${DEG}\\s*([EW])\\b`, 'i'), val: (m) => {
      const a = num(m[2]); const ns = m[1].toUpperCase(); const ew = m[3].toUpperCase();
      return ns === 'N' ? (ew === 'E' ? a : 360 - a) : (ew === 'E' ? 180 - a : 180 + a);
    } },
    { re: new RegExp(`(\\d{1,3}(?:[.,]\\d+)?)${DEG}`), val: (m) => num(m[1]) },
  ],
  // "+5º (más)", "–12º (menos)", "2º (-)", "Ct = 8º +", "Ct=004º NE", "- 9º", "20 grados babor" (babor −, estribor +)
  signed: [
    // Declinación o Ct en grados y minutos: «4º50 NW», «4º 40′ NE», «0º08' W», «1º28' E» (W/NW, −; E/NE, +).
    { re: new RegExp(`(\\d{1,2})\\s*[º°]\\s*(\\d{1,2}(?:[.,]\\d+)?)\\s*${APOS}?\\s*(NE|NW|E|W)\\b`, 'i'), val: (m) => (Number(m[1]) + num(m[2]) / 60) * (/W/i.test(m[3]) ? -1 : 1) },
    { re: new RegExp(`([+\\-–‒−])?\\s*${NUM}\\s*(?:[º°]|grados)?\\s*(\\(\\s*(?:más|menos|[+\\-–‒−])\\s*\\)|NE|NW|(?:por\\s+)?(?:babor|estribor|Br|Er)\\b|[+\\-–‒−](?!\\s*\\d))?`, 'i'),
    val: (m) => {
      const v = num(m[2]);
      const s = `${m[1] ?? ''}${m[3] ?? ''}`;
      return /[-–‒−]|menos|NW|babor|\bBr\b/i.test(s) ? -v : v;
    } },
  ],
  // «21h 34m», «21:34», «13.45», y «0924» (cuatro cifras seguidas).
  clock: [
    { re: /(\d{1,2})\s*(?:h|:|-|\.)\s*(\d{2})(?!\d)/, val: (m) => Number(m[1]) * 60 + Number(m[2]) },
    { re: /(?<![\d.,])([01]\d|2[0-3])([0-5]\d)(?![\d,]|\.\d)/, val: (m) => Number(m[1]) * 60 + Number(m[2]) }, // también «0927.»
  ],
  distance: { re: new RegExp(`${NUM}\\s*(?:millas|′|'|M\\b)?`), val: (m) => num(m[1]) },
  meters: { re: new RegExp(`${NUM}\\s*(?:m\\b|metros)?`), val: (m) => num(m[1]) },
  speed: { re: new RegExp(`${NUM}\\s*(?:nudos|kn)?`), val: (m) => num(m[1]) },
};

/** Extrae en orden los valores de los tipos pedidos. Devuelve null si no los encuentra. */
export function parseOption(text, kinds) {
  let rest = String(text);
  // Quitamos etiquetas como "Ra =", "HRB =", "l =", "L =", "Rv=", "d =", "Distancia=".
  rest = rest.replace(/\b(?:Ra|Rv|HRB|Ct|CT|Distancia|d|l|L)\s*=\s*/g, ' ');
  // Y las aclaraciones entre paréntesis, que no son valores: «Ev (Este verdadero)». Se quedan los signos: «(-)», «(más)».
  rest = rest.replace(/\((?!\s*(?:más|menos|[+\-–‒−])\s*\))[^)]*\)/gi, ' ');
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

/** Texto de una opción para comparar repeticiones exactas (sin espacios, puntos finales ni mayúsculas). */
const textoOpcion = (t) => String(t).toLowerCase().replace(/\s+/g, '').replace(/\.$/, '');

/**
 * Elige la opción más cercana a los valores calculados.
 * @param {Record<string,string>} opciones  {a: '...', b: '...'}
 * @param {{kind:string, value:number}[]} values
 * @returns {{ choice:string|null, scores:Record<string,number>, parsed:Record<string,number[]>, repetidas:string[], empate:string[] }}
 *   score = suma de (error / tolerancia de examen) de cada valor; < 1 por valor = dentro de tolerancia.
 *   `choice` es null si no se puede leer ninguna opción (nunca se elige una por defecto). `repetidas`: las opciones con
 *   el mismo texto que la elegida (una opción repetida en el cuadernillo). `empate`: las que, con otro texto, puntúan
 *   igual que la elegida (el lector no las distingue: la comparación no vale).
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
  const orden = Object.entries(scores).filter(([, s]) => Number.isFinite(s)).sort((a, b) => a[1] - b[1]);
  if (!orden.length) return { choice: null, scores, parsed, repetidas: [], empate: [] };
  const [choice, mejor] = orden[0];
  const repetidas = Object.keys(opciones).filter((k) => k !== choice && textoOpcion(opciones[k]) === textoOpcion(opciones[choice]));
  const empate = orden.slice(1).filter(([k, s]) => !repetidas.includes(k) && Math.abs(s - mejor) < 1e-9).map(([k]) => k);
  return { choice, scores, parsed, repetidas, empate };
}
