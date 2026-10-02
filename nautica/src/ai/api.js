// API de consola `window.nautica` para agentes de IA y usuarios avanzados.
// Un agente con acceso a JavaScript puede consultar el estado o resolver un ejercicio con una sola
// llamada, en lugar de leer la página entera. Ver /llms.txt.

import { EXERCISES, getExercise } from '../exercises/registry.js';
import { answersFor } from '../exercises/define.js';
import { createRng } from '../math/rng.js';
import { check } from '../analysis/checker.js';
import { quantity } from '../analysis/quantities.js';
import { GLOSSARY } from '../nautical/glossary.js';
import * as compass from '../nautical/compass.js';
import * as kinematics from '../nautical/kinematics.js';
import * as positioning from '../nautical/positioning.js';
import * as mercator from '../math/mercator.js';
import * as format from '../math/format.js';

export function installApi({ ctx, session }) {
  const api = {
    help: () => [
      'nautica.state()                → resumen en texto del estado actual (lo mismo que #ai-context)',
      'nautica.types()                → tipos de ejercicio [{id,title,category,levels}]',
      'nautica.generate(id, seed)     → {params, statement, answers}',
      'nautica.solve(id, params)      → {results (formateados), steps}',
      'nautica.check(id, params, {clave:"texto"}) → corrección con diagnóstico',
      'nautica.point(id) / nautica.points() → marcas de la carta',
      'nautica.glossary               → conceptos',
      'nautica.lib.{compass,kinematics,positioning,mercator,format} → motores de cálculo',
    ].join('\n'),
    state: () => session.summary(),
    types: () => EXERCISES.map(({ id, title, category, levels, summary }) => ({ id, title, category, levels, summary })),
    generate(id, seed = 1) {
      const ex = need(id);
      const params = ex.generate(createRng(seed), ctx);
      return { params, statement: ex.statement(params, ctx), answers: answersFor(ex, params) };
    },
    solve(id, params) {
      const ex = need(id);
      const sol = ex.solve(params, ctx);
      const results = Object.fromEntries(answersFor(ex, params).map((a) => [a.key, quantity(a.kind).format(sol.results[a.key])]));
      return { results, raw: sol.results, steps: sol.steps.map((s) => `${s.title}: ${s.text}`) };
    },
    check(id, params, inputs) {
      const ex = need(id);
      const r = check(ex, params, ex.solve(params, ctx), inputs, ctx);
      return { allOk: r.allOk, fields: r.fields.map(({ key, status, errorText, expectedText }) => ({ key, status, errorText, expectedText })), diagnoses: r.diagnoses };
    },
    point: (id) => ctx.chart.point(id),
    points: () => ctx.chart.points().map(({ id, name, lat, lon }) => ({ id, name, lat: format.fmtLat(lat), lon: format.fmtLon(lon) })),
    glossary: GLOSSARY,
    lib: { compass, kinematics, positioning, mercator, format },
  };
  function need(id) {
    const ex = getExercise(id);
    if (!ex) throw new Error(`Tipo desconocido: ${id}. Usa nautica.types()`);
    return ex;
  }
  globalThis.nautica = api;
  return api;
}
