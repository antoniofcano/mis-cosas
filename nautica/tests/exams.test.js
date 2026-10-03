// Valida las soluciones programadas contra la plantilla oficial de cada examen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createKit } from '../src/exams/kit.js';
import { chooseOption } from '../src/exams/options.js';
import { SOLUCIONES as solutions, bancoResolucion } from '../src/exams/solutions/index.js';
import { chart } from './helpers.js';

const preguntas = ['andalucia-per.json', 'andalucia-py-teoria.json'].flatMap((f) => JSON.parse(readFileSync(new URL(`../data/exams/${f}`, import.meta.url))).preguntas);
const byId = new Map(preguntas.map((q) => [q.id, q]));

for (const [id, sol] of Object.entries(solutions)) {
  test(`examen ${id}`, () => {
    const q = byId.get(id);
    assert.ok(q, 'pregunta inexistente');
    const k = createKit(chart);
    const values = sol.solve(k, q);
    const r = chooseOption(q.opciones, values);
    const detail = `calculado=${JSON.stringify(values.map((v) => +v.value.toFixed(3)))} scores=${JSON.stringify(Object.fromEntries(Object.entries(r.scores).map(([a, b]) => [a, +b.toFixed(2)])))}`;
    if (q.correcta) assert.equal(r.choice, q.correcta, detail);
    console.log(`${id}: elegida ${r.choice} (oficial ${q.correcta}) ${detail}`);
  });
}

test('cada pregunta con resolución sabe en qué banco abrirla', () => {
  for (const id of Object.keys(solutions)) assert.ok(bancoResolucion(byId.get(id)), id);
  assert.equal(bancoResolucion(byId.get('and-py-2023-c1-n18')), 'andalucia-py-teoria.json');
  assert.equal(bancoResolucion({ id: 'and-py-2020-c1-n11', ut: 4 }), null);
});

test('las del PY que no se dibujan en la carta están marcadas «sinCarta»', () => {
  for (const [id, sol] of Object.entries(solutions)) {
    if (!id.startsWith('and-py')) continue;
    const k = createKit(chart);
    sol.solve(k, byId.get(id));
    assert.equal(!k.items.length, !!sol.sinCarta, id);
  }
});
