// Motor «profe» para preguntas tipo test de teoría: compone la explicación a partir de los datos de la
// pregunta (respuesta oficial) y de su ficha de explicación { explicacion, clave, trampa }.

import { toSpeech } from './speech.js';

const BIEN = ['¡Muy bien!', '¡Correcto!', '¡Eso es!', 'Bien visto.'];
const MAL = ['No, esa no es.', 'Casi, pero no.', 'Ojo, que esa es la trampa.'];
const pick = (arr, key) => arr[[...String(key)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % arr.length];

/**
 * @param {object} q        pregunta { id, opciones, correcta, anulada }
 * @param {object} [ex]     explicación { explicacion, clave?, trampa? }
 * @param {string} [chosen] letra elegida por el alumno (si respondió)
 * @returns {{ display: string[], speech: string }}
 */
export function narrateTheory(q, ex, chosen) {
  const lines = [];
  if (q.anulada) {
    lines.push('Esta pregunta la anuló el tribunal: en el examen se dio por buena cualquier respuesta.');
  } else {
    const correcta = `${q.correcta}) ${q.opciones?.[q.correcta] ?? ''}`.trim();
    if (chosen == null) lines.push(`La respuesta correcta es la ${correcta}`);
    else if (chosen === q.correcta) lines.push(`${pick(BIEN, q.id)} La respuesta es la ${correcta}`);
    else lines.push(`${pick(MAL, q.id)} Has marcado la ${chosen}); la correcta es la ${correcta}`);
  }
  if (ex?.explicacion) lines.push(ex.explicacion);
  if (ex?.clave) lines.push(`💡 ${ex.clave}`);
  if (ex?.trampa) lines.push(`⚠️ ${ex.trampa}`);
  if (ex?.discrepancia) lines.push(`📝 Nota del profe: ${ex.discrepancia}`);
  if (!ex?.explicacion && !q.anulada) lines.push('Todavía no tengo preparada la explicación detallada de esta pregunta.');
  const speech = lines.map((l) => l.replace(/^💡\s*/, 'Truco: ').replace(/^⚠️\s*/, 'Y ojo: ').replace(/^📝\s*/, '')).map(toSpeech).join(' ');
  return { display: lines, speech };
}
