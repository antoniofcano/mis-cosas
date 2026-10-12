// Valida las soluciones programadas contra la plantilla oficial de cada examen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createKit } from '../src/exams/kit.js';
import { chooseOption } from '../src/exams/options.js';
import { SOLUCIONES as solutions } from '../src/bancos/soluciones.js';
import { chart } from './helpers.js';
import { bancosNode, todasLasPreguntas } from '../tools/bancos/leer.mjs';

const preguntas = todasLasPreguntas();
const byId = new Map(preguntas.map((q) => [q.id, q]));

for (const [id, sol] of Object.entries(solutions)) {
  test(`examen ${id}`, () => {
    const q = byId.get(id);
    assert.ok(q, 'pregunta inexistente');
    const k = createKit(chart);
    const values = sol.solve(k, q);
    const r = chooseOption(q.opciones, values);
    const detail = `calculado=${JSON.stringify(values.map((v) => +v.value.toFixed(3)))} scores=${JSON.stringify(Object.fromEntries(Object.entries(r.scores).map(([a, b]) => [a, +b.toFixed(2)])))}`;
    // Nunca una opción por defecto: si no se lee ninguna, falla. Un empate con otra opción de distinto texto (el
    // lector no las distingue) tampoco vale. Una opción repetida en el cuadernillo (mismo texto) vale como la oficial.
    assert.ok(r.choice, `ninguna opción legible: ${detail}`);
    assert.deepEqual(r.empate, [], `empate entre ${[r.choice, ...r.empate].join(', ')}: ${detail}`);
    if (q.correcta) assert.ok(r.choice === q.correcta || r.repetidas.includes(q.correcta), `elegida ${r.choice}, oficial ${q.correcta}: ${detail}`);
    console.log(`${id}: elegida ${r.choice} (oficial ${q.correcta}) ${detail}`);
  });
}

test('cada pregunta con resolución sabe dónde abrirla (#/q/<id>)', async () => {
  const b = bancosNode();
  for (const tit of ['per', 'py']) await b.cargarBanco('andalucia', tit); // las fichas, cargadas
  for (const id of Object.keys(solutions)) assert.deepEqual(b.rutaResolucion(byId.get(id)), ['q', id], id);
  assert.deepEqual(b.rutaResolucion(byId.get('and-py-2023-c1-n18')), ['q', 'and-py-2023-c1-n18']);
  assert.equal(b.rutaResolucion(byId.get('and-py-2021-c1-n20')), null); // en DISCREPANCIAS: sin resolución
  // Una de carta sin solución programada no ofrece «Ver la resolución» (se abriría vacía): se dice su motivo.
  assert.equal(b.rutaResolucion(byId.get('and-2025-c2-q45')), null);
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
// Las que no llegan cerca se quedan en el bloque DISCREPANCIAS de su fichero, no se fuerzan. Las que llegan cerca a la
// oficial pero con otra opción casi igual de próxima llevan `sinMargen` (el porqué, que la vista enseña junto a la
// resolución); un `sinMargen` que ya no hace falta falla, para que no quede un aviso de más.
test('PY: cada resolución llega a la opción oficial con margen (o lo avisa con sinMargen)', () => {
  for (const [id, sol] of Object.entries(solutions)) {
    if (byId.get(id).tit !== 'py') continue;
    const q = byId.get(id);
    if (q.anulada) continue; // sin respuesta oficial: se resuelve para practicar (la vista lo dice)
    const values = sol.solve(createKit(chart), q);
    // Las opciones repetidas (mismo texto que la elegida) no cuentan como rivales.
    const r = chooseOption(q.opciones, values);
    const s = Object.entries(r.scores).filter(([k]) => !r.repetidas.includes(k)).map(([, v]) => v).sort((a, b) => a - b);
    assert.ok(s[0] / values.length <= 2, `${id}: lejos de la opción (${s[0].toFixed(2)})`);
    if (sol.sinMargen) {
      assert.ok(q.correcta && r.choice === q.correcta, `${id}: sinMargen, pero no elige la oficial`);
      assert.ok(s[1] < 2 * s[0], `${id}: lleva sinMargen y ya gana con claridad (${s[0].toFixed(2)} / ${s[1].toFixed(2)}): quítalo`);
      assert.ok(sol.sinMargen.length > 40, `${id}: sinMargen sin explicación`);
    } else assert.ok(s[1] >= 2 * s[0], `${id}: dos opciones casi empatadas (${s[0].toFixed(2)} / ${s[1].toFixed(2)})`);
  }
});
