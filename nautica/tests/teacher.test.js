import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toSpeech } from '../src/teacher/speech.js';
import { narrateSteps } from '../src/teacher/narrate.js';
import { EXERCISES } from '../src/exercises/registry.js';
import { createRng } from '../src/math/rng.js';
import { createKit } from '../src/exams/kit.js';
import solutions from '../src/exams/solutions/andalucia-per.js';
import { ctx, chart } from './helpers.js';

test('voz: símbolos náuticos a lenguaje hablado', () => {
  assert.equal(toSpeech('Rv = Ra + Ct = 036° + (−3°) = 033°'), 'rumbo verdadero igual a rumbo de aguja más corrección total igual a cero 36 grados menos 3 grados igual a cero 33 grados');
  assert.equal(toSpeech("So 35° 51,0' N  005° 52,3' W"), 'situación observada 35 grados 51 coma 0 minutos norte 5 grados 52 coma 3 minutos oeste');
  assert.equal(toSpeech('20 × 5′ W'), '20 por 5 minutos oeste');
  assert.equal(toSpeech('HRB 14:30'), 'a las 14 y 30');
  assert.equal(toSpeech('Ct = +1°'), 'corrección total igual a más 1 grado');
  assert.equal(toSpeech('A HRB = 07:45 nos encontramos'), 'A las 7 y 45 nos encontramos');
  assert.equal(toSpeech('desvío +2° (más)'), 'desvío más 2 grados');
});

const LEFTOVER = /[°º′=Δ×·√²→≈()]|\b(Rv|Ra|Dv|Da|Ct|HRB)\b/;

test('el profe explica todos los pasos de ejercicios y exámenes, y la voz queda limpia', () => {
  const all = [];
  for (const ex of EXERCISES) for (let s = 1; s <= 10; s++) all.push(...narrateSteps(ex.solve(ex.generate(createRng(s), ctx), ctx).steps, { seed: s }));
  for (const sol of Object.values(solutions)) { const k = createKit(chart); sol.solve(k); all.push(...narrateSteps(k.steps)); }
  const withLesson = all.filter((n) => n.lesson).length / all.length;
  assert.ok(withLesson > 0.97, `pasos con lección: ${(withLesson * 100).toFixed(1)}%`);
  for (const n of all) assert.ok(!LEFTOVER.test(n.speech), n.speech);
});
