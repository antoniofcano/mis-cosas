// B3: ejercicios de la hora y del viento aparente. Casos resueltos a mano (los de la lección py-3-5 y triángulos
// de viento hechos aparte) y comprobación de que el generador da siempre datos resolubles.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { husoDe, horaLegal, horaCivilLugar, tuDesdeOficial } from '../src/nautical/hora.js';
import { vientoAparente } from '../src/nautical/viento.js';
import { getExercise } from '../src/exercises/registry.js';
import { answersFor } from '../src/exercises/define.js';
import { createRng } from '../src/math/rng.js';

const hm = (h, m) => h * 60 + m;
const cerca = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} frente a ${b}`);

test('hora: los ejemplos de la lección (069° 25′ E y 075° W)', () => {
  const lonE = 69 + 25 / 60;
  assert.equal(husoDe(lonE), 5);
  assert.equal(horaLegal(hm(10, 30), lonE), hm(15, 30));
  cerca(horaCivilLugar(hm(10, 30), lonE), hm(15, 7.7), 0.05, 'HcL 15:07,7');
  assert.equal(husoDe(-75), -5);
  assert.equal(horaLegal(hm(8, 0), -75), hm(3, 0));
  assert.equal(horaCivilLugar(hm(8, 0), -75), hm(3, 0)); // meridiano central: legal = civil
  // oficial en verano en la península (+2): las 14:00 oficiales son las 12:00 TU; en 005° 30′ W, HcL 11:38
  assert.equal(tuDesdeOficial(hm(14, 0), 2), hm(12, 0));
  assert.equal(horaCivilLugar(hm(12, 0), -5.5), hm(11, 38));
});

test('viento aparente: triángulos resueltos a mano', () => {
  const t = vientoAparente({ angReal: 90, vr: 12, vb: 6 }); // proa 6, costado 12
  cerca(t.ang, 63.43, 0.01, 'ángulo'); cerca(t.va, 13.42, 0.01, 'intensidad');
  const c = vientoAparente({ angReal: 45, vr: 10, vb: 5 }); // proa 7,07 + 5 = 12,07; costado 7,07
  cerca(c.ang, 30.36, 0.01, 'ángulo'); cerca(c.va, 13.99, 0.01, 'intensidad');
  const p = vientoAparente({ angReal: 180, vr: 12, vb: 5 }); // de popa: se resta
  cerca(p.va, 7, 1e-9, 'popa');
});

for (const id of ['hora', 'viento-aparente']) {
  test(`${id}: 200 enunciados generados se resuelven y casan con sus respuestas`, () => {
    const ex = getExercise(id);
    for (let s = 1; s <= 200; s++) {
      const p = ex.generate(createRng(s), {});
      const sol = ex.solve(p, {});
      assert.ok(ex.statement(p, {}).length > 40);
      for (const a of answersFor(ex, p)) assert.ok(Number.isFinite(sol.results[a.key]), `${id} semilla ${s}: ${a.key}`);
      if (id === 'viento-aparente') assert.ok(sol.results.ang < p.ang, 'con arrancada avante el aparente entra más a proa');
      if (id === 'hora') assert.ok(Math.abs((Math.abs(p.lon) / 15) % 1 - 0.5) >= 1 / 15, 'lejos del límite del huso');
    }
  });
}
