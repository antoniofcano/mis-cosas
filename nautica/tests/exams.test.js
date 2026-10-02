// Valida las soluciones programadas contra la plantilla oficial de cada examen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createKit } from '../src/exams/kit.js';
import { chooseOption } from '../src/exams/options.js';
import solutions from '../src/exams/solutions/andalucia-per.js';
import { chart } from './helpers.js';

const bank = JSON.parse(readFileSync(new URL('../data/exams/andalucia-per.json', import.meta.url)));
const byId = new Map(bank.preguntas.map((q) => [q.id, q]));

for (const [id, sol] of Object.entries(solutions)) {
  test(`examen ${id}`, () => {
    const q = byId.get(id);
    assert.ok(q, 'pregunta inexistente');
    const k = createKit(chart);
    const values = sol.solve(k);
    const r = chooseOption(q.opciones, values);
    const detail = `calculado=${JSON.stringify(values.map((v) => +v.value.toFixed(3)))} scores=${JSON.stringify(Object.fromEntries(Object.entries(r.scores).map(([a, b]) => [a, +b.toFixed(2)])))}`;
    if (q.correcta) assert.equal(r.choice, q.correcta, detail);
    console.log(`${id}: elegida ${r.choice} (oficial ${q.correcta}) ${detail}`);
  });
}
