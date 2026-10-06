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
 * @param {{ regla: string }[]} [reglas] reglas nemotécnicas que ayudan con esta pregunta
 * @returns {{ display: string[], speech: string }}
 */
/**
 * ¿La opción marcada es la que la nota del profe defiende frente a una plantilla oficial discutible? (ex.defendible)
 * Puntúa como fallo (en el examen manda la plantilla), pero no se le llama «trampa».
 */
export const esDefendible = (q, ex, chosen) => !!chosen && chosen !== q.correcta && !q.anulada && ex?.defendible === chosen;

export function narrateTheory(q, ex, chosen, reglas = []) {
  const lines = [];
  if (q.anulada) {
    lines.push('Esta pregunta la anuló el tribunal: en el examen se dio por buena cualquier respuesta.');
  } else {
    const correcta = `${q.correcta}) ${q.opciones?.[q.correcta] ?? ''}`.trim();
    if (chosen == null) lines.push(`La respuesta correcta es la ${correcta}`);
    else if (chosen === q.correcta) lines.push(`${pick(BIEN, q.id)} La respuesta es la ${correcta}`);
    else if (esDefendible(q, ex, chosen)) lines.push(`Tu respuesta, la ${chosen}), es defendible, pero la plantilla oficial da la ${correcta}. En el examen cuenta la plantilla.`);
    else lines.push(`${pick(MAL, q.id)} Has marcado la ${chosen}); la correcta es la ${correcta}`);
  }
  // Si la plantilla es discutible, la nota va justo después: es lo primero que hay que leer.
  if (ex?.discrepancia) lines.push(`📝 Nota del profe: ${ex.discrepancia}`);
  if (ex?.explicacion) lines.push(ex.explicacion);
  if (ex?.clave) lines.push(`💡 ${ex.clave}`);
  if (ex?.trampa) lines.push(`⚠️ ${ex.trampa}`);
  for (const r of reglas) lines.push(`🧠 ${r.regla}`);
  if (!ex?.explicacion && !q.anulada) lines.push('Todavía no tengo preparada la explicación detallada de esta pregunta.');
  const speech = lines.map((l) => l.replace(/^💡\s*/, 'Truco: ').replace(/^⚠️\s*/, 'Y ojo: ').replace(/^🧠\s*/, 'Para recordarlo: ').replace(/^📝\s*/, '')).map(toSpeech).join(' ');
  return { display: lines, speech };
}
