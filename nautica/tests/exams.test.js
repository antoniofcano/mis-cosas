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
  assert.equal(bancoResolucion({ id: 'and-py-2021-c1-n20', ut: 4 }), null); // en DISCREPANCIAS
});

test('las del PY que no se dibujan en la carta están marcadas «sinCarta»', () => {
  for (const [id, sol] of Object.entries(solutions)) {
    if (!id.startsWith('and-py')) continue;
    const k = createKit(chart);
    sol.solve(k, byId.get(id));
    assert.equal(!k.items.length, !!sol.sinCarta, id);
  }
});

// PY: la oficial tiene que ganar con claridad y caer cerca (como mucho el doble de la tolerancia de examen por valor).
// Las que no lo cumplen se quedan en el bloque DISCREPANCIAS de su fichero, no se fuerzan.
test('PY: cada resolución llega a la opción oficial con margen', () => {
  for (const [id, sol] of Object.entries(solutions)) {
    if (!id.startsWith('and-py')) continue;
    const q = byId.get(id);
    const values = sol.solve(createKit(chart), q);
    const s = Object.values(chooseOption(q.opciones, values).scores).sort((a, b) => a - b);
    assert.ok(s[0] / values.length <= 2, `${id}: lejos de la opción (${s[0].toFixed(2)})`);
    assert.ok(s[1] >= 2 * s[0], `${id}: dos opciones casi empatadas (${s[0].toFixed(2)} / ${s[1].toFixed(2)})`);
  }
});
