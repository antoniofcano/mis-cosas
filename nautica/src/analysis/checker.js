// Motor de análisis: corrección de respuestas y diagnóstico de errores típicos.
//
// El diagnóstico es genérico: cada tipo de ejercicio declara una lista de "errores típicos"
// (`mistakes`). Cada uno sabe cómo calcular el resultado que obtendría alguien que comete ese
// error. Si la respuesta del usuario coincide con ese resultado erróneo, sabemos qué ha fallado.

import { quantity } from './quantities.js';
import { answersFor } from '../exercises/define.js';

export const STATUS = { OK: 'ok', CLOSE: 'close', WRONG: 'wrong', INVALID: 'invalid', EMPTY: 'empty' };

/**
 * @param {object} exercise  definición del tipo de ejercicio
 * @param {object} params    datos del ejercicio
 * @param {object} solution  resultado de exercise.solve(params, ctx)
 * @param {Record<string,string>} inputs  texto introducido por el usuario por clave
 * @param {object} ctx       contexto (carta, etc.)
 * @param {{ toleranceFactor?: number }} opts
 */
export function check(exercise, params, solution, inputs, ctx, opts = {}) {
  const k = opts.toleranceFactor ?? 1;
  const answers = answersFor(exercise, params);
  const fields = answers.map((a) => {
    const q = quantity(a.kind);
    const raw = (inputs[a.key] ?? '').trim();
    const expected = solution.results[a.key];
    const tol = (a.tolerance ?? q.tolerance) * k;
    if (!raw) return { key: a.key, label: a.label, status: STATUS.EMPTY, expected, expectedText: q.format(expected), tol };
    const value = q.parse(raw);
    if (Number.isNaN(value)) {
      return { key: a.key, label: a.label, status: STATUS.INVALID, raw, expected, expectedText: q.format(expected), tol };
    }
    const err = q.error(value, expected);
    const status = err <= tol ? STATUS.OK : err <= 2 * tol ? STATUS.CLOSE : STATUS.WRONG;
    return {
      key: a.key, label: a.label, status, raw, value, valueText: q.format(value),
      expected, expectedText: q.format(expected), error: err, errorText: `${err.toFixed(1).replace('.', ',')}${q.errorUnit}`, tol,
    };
  });

  const answered = fields.filter((f) => f.status !== STATUS.EMPTY && f.status !== STATUS.INVALID);
  const allOk = fields.every((f) => f.status === STATUS.OK);
  const diagnoses = allOk ? [] : diagnose(exercise, params, fields, ctx, k, answers);

  return { fields, allOk, answeredCount: answered.length, diagnoses };
}

/** Busca qué error típico explica las respuestas incorrectas. */
export function diagnose(exercise, params, fields, ctx, k = 1, answers = answersFor(exercise, params)) {
  const wrong = fields.filter((f) => f.status === STATUS.WRONG || f.status === STATUS.CLOSE);
  if (!wrong.length || !exercise.mistakes?.length) return [];
  const ok = Object.fromEntries(fields.map((f) => [f.key, f.expected]));
  const found = [];
  for (const m of exercise.mistakes) {
    let alt;
    try {
      alt = m.mutate ? exercise.solve(m.mutate(structuredClone(params), ctx), ctx).results : m.results(params, ctx, ok);
    } catch {
      continue;
    }
    if (!alt) continue;
    const matched = wrong.filter((f) => {
      const a = answers.find((x) => x.key === f.key);
      const q = quantity(a.kind);
      if (alt[f.key] == null) return false;
      const tol = (a.tolerance ?? q.tolerance) * k;
      // El error típico debe explicar la respuesta mejor que la solución correcta.
      return q.error(f.value, alt[f.key]) <= tol && q.error(alt[f.key], f.expected) > tol;
    });
    if (matched.length) found.push({ id: m.id, explain: m.explain, fields: matched.map((f) => f.key) });
  }
  return found;
}
