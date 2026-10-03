// Motor «profe»: compone la explicación del profe de una solución completa.
// Une el paso calculado (los números exactos del ejercicio) con la lección del tipo de paso
// (qué hacemos, por qué, truco y error típico) y produce dos versiones: para leer y para la voz.

import { lessonFor } from './lessons.js';
import { toSpeech } from './speech.js';

const hash = (str) => [...String(str)].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7) >>> 0;
const pick = (arr, key) => (Array.isArray(arr) ? arr[hash(key) % arr.length] : arr);

const LINKS = ['Fíjate:', 'Mira:', 'Hacemos la cuenta:', 'Así:', 'Vamos a ello:'];

/**
 * Narración de todos los pasos de una solución.
 * @param {{title:string, text:string}[]} steps
 * @param {{ seed?: string|number }} opts  la semilla solo varía la redacción (mismo ejercicio → mismas frases)
 * @returns {{ lesson: string|null, intro: string, body: string, tip: string|null, trap: string|null, display: string, speech: string }[]}
 */
export function narrateSteps(steps, { seed = '' } = {}) {
  const seen = new Set();
  return steps.map((st, i) => {
    const lesson = lessonFor(st.title, st.text);
    const first = lesson && !seen.has(lesson.id);
    if (lesson) seen.add(lesson.id);
    const intro = lesson ? pick(lesson.intro, `${seed}|${i}|${st.title}`) : `${st.title}.`;
    // El truco y el error típico solo la primera vez que aparece ese tipo de paso en el ejercicio.
    const tip = first ? lesson.tip ?? null : null;
    const trap = first && lesson.trap && hash(`${seed}|trap|${lesson.id}`) % 3 !== 0 ? lesson.trap : null;
    const link = pick(LINKS, `${seed}|link|${i}`);
    const body = /[.!?]$/.test(st.text.trim()) ? st.text.trim() : `${st.text.trim()}.`;
    const display = [intro, `${link} ${body}`, tip && `💡 ${tip}`, trap && `⚠️ ${trap}`].filter(Boolean).join('\n');
    const speech = [intro, `${link} ${toSpeech(body)}`, tip && `Truco: ${tip}`, trap && (/^(ojo|cuidado)/i.test(trap) ? trap : `Y ojo: ${trap}`)].filter(Boolean).join(' ');
    return { lesson: lesson?.id ?? null, intro, body, tip, trap, display, speech };
  });
}

/** Presentación del ejercicio (antes del primer paso). */
export function narrateIntro(statement, { title, onChart = false } = {}) {
  const display = `Vamos a resolver${title ? ` este ejercicio de ${title.toLowerCase()}` : ' este ejercicio'} paso a paso, como lo harías en el examen. ` +
    `Primero, lee bien el enunciado y localiza en la carta los faros que se citan${onChart ? ': te los he marcado en naranja' : ''}.`;
  return { display, speech: `${display} El enunciado dice: ${toSpeech(statement)}` };
}

/** Cierre con el resultado. */
export function narrateOutro(resultText) {
  const display = `Y ya lo tenemos: ${resultText}. Antes de dar la respuesta, comprueba que tiene sentido en la carta: que el punto está en el mar, que el rumbo apunta hacia donde quieres ir… Ese vistazo final te salva de más de un error en el examen.`;
  return { display, speech: toSpeech(display) };
}
