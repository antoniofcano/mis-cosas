// Motor «profe»: convierte el texto técnico de una solución en texto para leer en voz alta (español).
// "Rv = 036° + (−3°) = 033°"  →  "rumbo verdadero igual a cero treinta y seis grados más menos 3 grados…"
// "35° 51,0' N  005° 52,3' W" →  "35 grados 51 coma 0 minutos norte, 5 grados 52 coma 3 minutos oeste"

const HEMI = { N: 'norte', S: 'sur', E: 'este', W: 'oeste' };

const ABBR = [
  [/Δλ/g, 'diferencia de longitud'],
  [/Δl\b/g, 'diferencia de latitud'],
  [/Δ/g, 'desvío'],
  [/\bRv\b/g, 'rumbo verdadero'],
  [/\bRa\b/g, 'rumbo de aguja'],
  [/\bRm\b/g, 'rumbo magnético'],
  [/\bRs\b/g, 'rumbo de superficie'],
  [/\bRef\b/g, 'rumbo efectivo'],
  [/\bVef\b/g, 'velocidad efectiva'],
  [/\bVb\b/g, 'velocidad del barco'],
  [/\bDv\b/g, 'demora verdadera'],
  [/\bDa\b/g, 'demora de aguja'],
  [/\bCt\b/g, 'corrección total'],
  [/\bdm\b/g, 'declinación'],
  [/\blm\b/g, 'latitud media'],
  [/\bAb\b/g, 'abatimiento'],
  [/\bHRB\b/g, 'hora'],
  [/\bUT\b/g, 'hora universal'],
  [/\bBM\b/g, 'bajamar'],
  [/\bPM\b/g, 'pleamar'],
  [/\bSe\b/g, 'situación de estima'],
  [/\bSo\b/g, 'situación observada'],
  [/\bER\b/g, 'estribor'],
  [/\bBR\b/g, 'babor'],
  [/\bNE\b/g, 'nordeste'],
  [/\bNW\b/g, 'noroeste'],
  [/\bSE\b/g, 'sudeste'],
  [/\bSW\b/g, 'sudoeste'],
  [/\barcsen\b/g, 'arco seno de'],
  [/\barctg\b/g, 'arco tangente de'],
  [/\bcos\b/g, 'coseno de'],
  [/\bsen\b/g, 'seno de'],
  [/\bPta\.\s*/g, 'Punta '],
];

/** "005" → "5"; "036" (rumbo) → "cero treinta y seis"; "000" → "cero cero cero". */
function bearingWords(digits) {
  if (/^000$/.test(digits)) return 'cero cero cero';
  if (/^00\d$/.test(digits)) return `cero cero ${Number(digits)}`;
  if (/^0\d\d$/.test(digits)) return `cero ${Number(digits)}`;
  return String(Number(digits));
}

export function toSpeech(text) {
  let s = ` ${String(text)} `;
  // Signos dobles: "+ (−3°)" → "− 3°"
  s = s.replace(/([+−-])\s*\(\s*([+−-])/g, (m, a, b) => ((a === '+') === (b === '+') ? '+ (' : '− ('));
  s = s.replace(/\bE \(NE\)/g, 'este o nordeste').replace(/\bW \(NW\)/g, 'oeste o noroeste');
  s = s.replace(/\b([Aa])\s+HRB\s*=?\s*(?=\d{1,2}:\d{2})/g, '$1 ');
  s = s.replace(/\bHRB\s*=?\s*(?=\d{1,2}:\d{2})/g, 'a ');
  s = s.replace(/\s*\((más|menos)\)/g, '');
  // Coordenadas
  s = s.replace(/(\d{1,3})\s*[°º]\s*(\d{1,2})(?:,(\d+))?\s*['′’]\s*([NSEW])\b/g, (m, d, mi, dec, h) =>
    `${Number(d)} grados ${Number(mi)}${dec ? ` coma ${dec}` : ''} minutos ${HEMI[h]}`);
  // Declinación tipo "5º 20′ W" (sin décimas) ya cubierta; minutos sueltos "20′"
  s = s.replace(/(\d+)\s*[′']\s*(?=[\s).,;]|$)/g, '$1 minutos ');
  s = s.replace(/minutos\s+([NSEW])\b/g, (m, h) => `minutos ${HEMI[h]}`);
  // Rumbos y ángulos
  s = s.replace(/\b(\d{3})(?:,(\d))?\s*[°º]/g, (m, d, dec) => `${bearingWords(d)}${dec ? ` coma ${dec}` : ''} grados`);
  s = s.replace(/(\d+(?:,\d+)?)\s*[°º]/g, '$1 grados');
  // Horas hh:mm
  s = s.replace(/\b(\d{1,2}):(\d{2})\b/g, (m, hh, mm) => `las ${Number(hh)}${mm === '00' ? ' en punto' : ` y ${Number(mm)}`}`);
  // Unidades
  s = s.replace(/(\d)\s*min\b/g, '$1 minutos');
  s = s.replace(/(\d)\s*h\b/g, '$1 horas');
  s = s.replace(/(\d)\s*kn\b/g, '$1 nudos');
  s = s.replace(/(\d)\s*m\b(?!\w)/g, '$1 metros');
  s = s.replace(/(\d)\s*M\b/g, '$1 millas');
  // Abreviaturas
  for (const [re, w] of ABBR) s = s.replace(re, w);
  s = s.replace(/\bM\b/g, 'marcación');
  // Operadores y símbolos
  s = s.replace(/√/g, 'raíz de ').replace(/²/g, ' al cuadrado');
  s = s.replace(/\s*=\s*/g, ' igual a ');
  s = s.replace(/\s*≈\s*/g, ', aproximadamente ');
  s = s.replace(/\s*[×·]\s*/g, ' por ');
  s = s.replace(/\s+\/\s+/g, ' entre ');
  s = s.replace(/\s*→\s*/g, ', ');
  s = s.replace(/\+\s*/g, ' más ');
  s = s.replace(/[−–]\s*/g, ' menos ');
  s = s.replace(/(\s)-\s*(?=\d)/g, '$1menos ');
  s = s.replace(/[()[\]{}]/g, ' ');
  s = s.replace(/(^|[^\d,])1 grados/g, '$11 grado').replace(/(^|[^\d,])1 minutos/g, '$11 minuto');
  s = s.replace(/\s+([,.;:])/g, '$1');
  return s.replace(/\s{2,}/g, ' ').trim();
}

/** Trocea un texto largo en frases (los sintetizadores cortan las locuciones muy largas). */
export function sentences(text) {
  return String(text).split(/(?<=[.!?])\s+/).map((x) => x.trim()).filter(Boolean);
}
