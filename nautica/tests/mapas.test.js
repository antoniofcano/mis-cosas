import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MAPAS, vecinos, preguntasMapa, erroresMapa } from '../src/course/mapas.js';
import { renderIllustration } from '../src/illustrations/index.js';
import { createRng } from '../src/math/rng.js';

const leer = (f) => JSON.parse(readFileSync(new URL(`../data/${f}`, import.meta.url)));
const clases = new Set(['per', 'py'].flatMap((t) => leer(`curso/${t}.json`).modulos.flatMap((m) => m.lecciones.map((l) => l.id))));

for (const id of MAPAS) {
  test(`mapa ${id}: nodos con lámina y clase, aristas válidas y ninguno suelto`, () => {
    const mapa = leer(`mapas/${id}.json`);
    assert.equal(mapa.id, id);
    assert.deepEqual(erroresMapa(mapa, { renderIllustration, clases }), []);
  });

  test(`mapa ${id}: preguntas con 4 opciones distintas y la buena entre ellas`, () => {
    const mapa = leer(`mapas/${id}.json`);
    for (let s = 1; s <= 20; s++) {
      for (const q of preguntasMapa(mapa, createRng(s))) {
        assert.equal(q.opciones.length, 4, q.enunciado);
        assert.equal(new Set(q.opciones).size, 4, q.enunciado);
        assert.ok(q.correcta >= 0, q.enunciado);
      }
    }
  });
}

test('vecinos: lo que sale, lo que entra y con qué se confunde', () => {
  const mapa = leer('mapas/rumbos.json');
  const v = vecinos(mapa, 'rv');
  assert.deepEqual(v.salen.map((x) => x.nodo.id), ['rs']);
  assert.deepEqual(v.entran.map((x) => x.nodo.id).sort(), ['cuadrantal', 'ra']);
  assert.deepEqual(v.confunde.map((x) => x.nodo.id), ['ra']);
});
