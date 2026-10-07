// Valida las soluciones programadas contra la plantilla oficial de cada examen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createKit } from '../src/exams/kit.js';
import { chooseOption } from '../src/exams/options.js';
import { SOLUCIONES as solutions } from '../src/bancos/soluciones.js';
import { chart } from './helpers.js';
import { bancosNode, todasLasPreguntas } from '../tools/bancos/leer.mjs';

const preguntas = todasLasPreguntas();
/** Dos opciones con los mismos valores leídos (una opción repetida en el cuadernillo). */
const mismoValor = (r, a, b) => a === b || (r.parsed[a] && JSON.stringify(r.parsed[a]) === JSON.stringify(r.parsed[b]));
const byId = new Map(preguntas.map((q) => [q.id, q]));

for (const [id, sol] of Object.entries(solutions)) {
  test(`examen ${id}`, () => {
    const q = byId.get(id);
    assert.ok(q, 'pregunta inexistente');
    const k = createKit(chart);
    const values = sol.solve(k, q);
    const r = chooseOption(q.opciones, values);
    const detail = `calculado=${JSON.stringify(values.map((v) => +v.value.toFixed(3)))} scores=${JSON.stringify(Object.fromEntries(Object.entries(r.scores).map(([a, b]) => [a, +b.toFixed(2)])))}`;
    // Si dos opciones dicen lo mismo (mismo valor leído), vale cualquiera de las dos.
    if (q.correcta) assert.equal(mismoValor(r, r.choice, q.correcta) ? q.correcta : r.choice, q.correcta, detail);
    console.log(`${id}: elegida ${r.choice} (oficial ${q.correcta}) ${detail}`);
  });
}

test('cada pregunta con resolución sabe dónde abrirla (#/q/<id>)', async () => {
  const b = bancosNode();
  for (const tit of ['per', 'py']) await b.cargarBanco('andalucia', tit); // las fichas, cargadas
  for (const id of Object.keys(solutions)) assert.deepEqual(b.rutaResolucion(byId.get(id)), ['q', id], id);
  assert.deepEqual(b.rutaResolucion(byId.get('and-py-2023-c1-n18')), ['q', 'and-py-2023-c1-n18']);
  assert.equal(b.rutaResolucion(byId.get('and-py-2021-c1-n20')), null); // en DISCREPANCIAS: sin resolución
  // Las de la lista de carta del PER se abren aunque la app no traiga su solución (se resuelven sobre la carta).
  assert.deepEqual(b.rutaResolucion(byId.get('and-2025-c2-q45')), ['q', 'and-2025-c2-q45']);
  assert.equal(b.rutaResolucion(byId.get('and-2025-c2-t01')), null);
});

test('las del PY que no se dibujan en la carta están marcadas «sinCarta»', () => {
  for (const [id, sol] of Object.entries(solutions)) {
    if (byId.get(id).tit !== 'py') continue;
    const k = createKit(chart);
    sol.solve(k, byId.get(id));
    assert.equal(!k.items.length, !!sol.sinCarta, id);
  }
});

// PY: la oficial tiene que ganar con claridad y caer cerca (como mucho el doble de la tolerancia de examen por valor).
// Las que no lo cumplen se quedan en el bloque DISCREPANCIAS de su fichero, no se fuerzan.
test('PY: cada resolución llega a la opción oficial con margen', () => {
  for (const [id, sol] of Object.entries(solutions)) {
    if (byId.get(id).tit !== 'py') continue;
    const q = byId.get(id);
    const values = sol.solve(createKit(chart), q);
    // Las opciones repetidas (mismo valor que la oficial) no cuentan como rivales.
    const r = chooseOption(q.opciones, values);
    const s = Object.entries(r.scores).filter(([k]) => k === r.choice || !mismoValor(r, k, r.choice)).map(([, v]) => v).sort((a, b) => a - b);
    assert.ok(s[0] / values.length <= 2, `${id}: lejos de la opción (${s[0].toFixed(2)})`);
    assert.ok(s[1] >= 2 * s[0], `${id}: dos opciones casi empatadas (${s[0].toFixed(2)} / ${s[1].toFixed(2)})`);
  }
});
