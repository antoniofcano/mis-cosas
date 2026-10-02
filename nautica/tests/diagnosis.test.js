// El diagnóstico debe reconocer cada error típico cuando el alumno lo comete exactamente.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EXERCISES } from '../src/exercises/registry.js';
import { answersFor } from '../src/exercises/define.js';
import { check } from '../src/analysis/checker.js';
import { quantity } from '../src/analysis/quantities.js';
import { createRng } from '../src/math/rng.js';
import { ctx } from './helpers.js';

for (const ex of EXERCISES) {
  for (const m of ex.mistakes) {
    test(`${ex.id}: detecta "${m.id}"`, () => {
      let detected = 0;
      let applicable = 0;
      for (let seed = 1; seed <= 150 && applicable < 25; seed++) {
        const params = ex.generate(createRng(seed), ctx);
        const sol = ex.solve(params, ctx);
        let alt;
        try {
          alt = m.mutate ? ex.solve(m.mutate(structuredClone(params), ctx), ctx).results : m.results(params, ctx, sol.results);
        } catch { continue; }
        if (!alt) continue;
        const answers = answersFor(ex, params);
        const inputs = Object.fromEntries(answers.map((a) => [a.key, quantity(a.kind).format(alt[a.key] ?? sol.results[a.key])]));
        const r = check(ex, params, sol, inputs, ctx);
        if (r.allOk) continue; // el error no cambia el resultado en este caso (p.ej. desvío 0)
        applicable++;
        if (r.diagnoses.some((d) => d.id === m.id)) detected++;
      }
      assert.ok(applicable > 0, 'el error nunca afecta al resultado');
      assert.ok(detected / applicable >= 0.8, `detectado ${detected}/${applicable}`);
    });
  }
}
