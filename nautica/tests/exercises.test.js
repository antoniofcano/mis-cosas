// Prueba de humo de todos los tipos de ejercicio: generar, resolver, enunciar y autocorregir.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EXERCISES } from '../src/exercises/registry.js';
import { answersFor } from '../src/exercises/define.js';
import { check } from '../src/analysis/checker.js';
import { quantity } from '../src/analysis/quantities.js';
import { createRng } from '../src/math/rng.js';
import { ctx } from './helpers.js';

for (const ex of EXERCISES) {
  test(`ejercicio ${ex.id}`, () => {
    for (let seed = 1; seed <= 40; seed++) {
      const params = ex.generate(createRng(seed), ctx);
      // Reproducible con la misma semilla
      assert.deepEqual(ex.generate(createRng(seed), ctx), params);
      // Serializable (va en la URL / resumen IA)
      assert.deepEqual(JSON.parse(JSON.stringify(params)), params);
      const text = ex.statement(params, ctx);
      assert.ok(text.length > 40 && !/undefined|NaN/.test(text), text);
      const sol = ex.solve(params, ctx);
      for (const s of sol.steps) assert.ok(!/undefined|NaN/.test(s.text), s.text);
      // Respondiendo con la solución formateada todo debe dar OK
      const inputs = {};
      for (const a of answersFor(ex, params)) {
        assert.ok(Number.isFinite(sol.results[a.key]), `${a.key} = ${sol.results[a.key]}`);
        inputs[a.key] = quantity(a.kind).format(sol.results[a.key]);
      }
      const r = check(ex, params, sol, inputs, ctx);
      assert.ok(r.allOk, JSON.stringify(r.fields));
    }
  });
}
