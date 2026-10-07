// Interfaz para asistentes de IA (Claude en Chrome, Cowork...): resúmenes de texto compactos del estado.
//
// Objetivo: que un agente entienda el ejercicio en pantalla leyendo pocas líneas, sin tener que
// interpretar el SVG, el CSS ni el HTML. Formato estable, una idea por línea, clave: valor.

import { answersFor } from '../exercises/define.js';
import { quantity } from '../analysis/quantities.js';

/** Resumen de un ejercicio generado (con o sin respuestas del alumno). */
export function exerciseSummary({ exercise, seed, params, solution, inputs = {}, result = null, revealed = 0, statement }) {
  const lines = [];
  lines.push(`EJERCICIO ${exercise.id} · "${exercise.title}" · semilla=${seed} · nivel=${exercise.levels.join('/')}`);
  lines.push(`URL: #/ej/${exercise.id}?s=${seed}`);
  lines.push(`ENUNCIADO: ${statement}`);
  lines.push(`DATOS: ${JSON.stringify(params)}`);
  const answers = answersFor(exercise, params);
  const user = answers.map((a) => {
    const f = result?.fields.find((x) => x.key === a.key);
    const raw = inputs[a.key] ?? '';
    return `${a.label}="${raw}"${f ? ` [${f.status}${f.errorText ? `, error ${f.errorText}` : ''}]` : ''}`;
  });
  lines.push(`RESPUESTAS ALUMNO: ${user.join(' · ') || '(ninguna)'}`);
  if (result?.diagnoses?.length) lines.push(`DIAGNÓSTICO: ${result.diagnoses.map((d) => d.explain).join(' | ')}`);
  lines.push(`PISTAS VISTAS: ${revealed}/${solution.steps.length}`);
  lines.push(`SOLUCIÓN: ${answers.map((a) => `${a.label}=${quantity(a.kind).format(solution.results[a.key])}`).join(' · ')}`);
  solution.steps.forEach((s, i) => lines.push(`PASO ${i + 1} ${s.title}: ${s.text}`));
  lines.push(`MÉTODO: ${exercise.method.join(' / ')}`);
  return lines.join('\n');
}

/** Resumen de una pregunta de examen real (`o`: nombre del eje y sigla de la titulación). */
export function examQuestionSummary(q, choice, computed, o = {}) {
  const lines = [
    `PREGUNTA EXAMEN ${[q.id, o.eje, o.titulacion, q.convocatoria].filter(Boolean).join(' · ')}${q.numero ? ` · nº ${q.numero}` : ''}`,
  ];
  if (q.enunciado_comun) lines.push(`ENUNCIADO COMÚN: ${q.enunciado_comun}`);
  lines.push(`ENUNCIADO: ${q.enunciado}`);
  for (const [k, v] of Object.entries(q.opciones ?? {})) lines.push(`  ${k}) ${v}`);
  lines.push(`RESPUESTA ALUMNO: ${choice ?? '(ninguna)'}`);
  lines.push(`CORRECTA (plantilla oficial): ${q.correcta ?? '?'}`);
  if (computed) {
    lines.push(`CALCULADO: ${computed.values.join(' · ')} → opción ${computed.choice}`);
    computed.steps.forEach((s, i) => lines.push(`PASO ${i + 1} ${s.title}: ${s.text}`));
  }
  if (q.notas) lines.push(`NOTAS: ${q.notas}`);
  if (q.fuentes?.examen) lines.push(`FUENTE: ${q.fuentes.examen}`);
  return lines.join('\n');
}
