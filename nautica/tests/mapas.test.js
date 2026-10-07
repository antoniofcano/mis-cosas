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

test('nodosDeClase y mapasDeClases: solo los mapas y las clases de la titulación', async () => {
  const { nodosDeClase, mapasDeClases } = await import('../src/course/mapas.js');
  const fs = await import('node:fs');
  const mapas = ['rumbos', 'meteo'].map((id) => JSON.parse(fs.readFileSync(new URL(`../data/mapas/${id}.json`, import.meta.url))));
  const perEnPy = mapas[1].nodos.find((n) => n.tit === 'per');
  assert.ok(perEnPy, 'el mapa de meteo tiene un nodo de una clase del PER');
  // Un nodo PER dentro de un mapa del PY no sale ni en la clase del PER (el mapa no es del PER) ni en la del PY.
  assert.deepEqual(nodosDeClase(mapas, perEnPy.clase, 'py'), []);
  assert.ok(nodosDeClase(mapas, perEnPy.clase, 'per').every((x) => x.mapa.tits.includes('per')));
  const r = mapas[0].nodos[0];
  assert.ok(nodosDeClase(mapas, r.clase, 'per').some((x) => x.nodo.id === r.id));
  assert.deepEqual(mapasDeClases(mapas, [r.clase], 'per').map((x) => x.mapa.id), ['rumbos']);
  assert.deepEqual(mapasDeClases(mapas, [r.clase], 'py'), []);
});

test('trampaDePregunta: reconoce la trampa del mapa en la respuesta fallada', async () => {
  const { trampaDePregunta } = await import('../src/course/mapas.js');
  const fs = await import('node:fs');
  const mapas = MAPAS.map((id) => JSON.parse(fs.readFileSync(new URL(`../data/mapas/${id}.json`, import.meta.url))));
  const banco = JSON.parse(fs.readFileSync(new URL('../data/ejes/andalucia/per/preguntas.json', import.meta.url))).preguntas;
  // Velero con el motor en marcha: quien contesta «Buque de vela» cae en la trampa vela/motor.
  const q = banco.find((x) => x.id === 'and-2022-c2-t25');
  const t = trampaDePregunta(mapas, 'per', q, 'a');
  assert.equal(t.mapa.id, 'ripa-maniobras');
  assert.deepEqual([t.elegido.nombre, t.correcto.nombre], ['Buque de vela', 'Propulsión mecánica']);
  assert.equal(trampaDePregunta(mapas, 'per', q, q.correcta), null); // acertada: nada
  assert.equal(trampaDePregunta(mapas, 'py', q, 'a'), null); // los mapas del PER no salen en el PY
  // Un concepto que ya sale en el enunciado no es la confusión.
  const q2 = banco.find((x) => x.id === 'and-2020-c3-t25');
  assert.equal(trampaDePregunta(mapas, 'per', q2, 'b'), null);
});

test('preguntasRepaso y mapasEliminatorios: los mapas de los temas repasados y de los eliminatorios', async () => {
  const { preguntasRepaso, mapasEliminatorios, utDeClase } = await import('../src/course/mapas.js');
  const { PER } = await import('../src/theory/blocks.js');
  const { createRng } = await import('../src/math/rng.js');
  const fs = await import('node:fs');
  const mapas = MAPAS.map((id) => JSON.parse(fs.readFileSync(new URL(`../data/mapas/${id}.json`, import.meta.url))));
  const qs = preguntasRepaso(mapas, 'per', [5], createRng(7), 3);
  assert.equal(qs.length, 3);
  for (const p of qs) {
    const n = new Map(p.mapa.nodos.map((x) => [x.id, x]));
    assert.ok([p.de, p.a].some((id) => utDeClase(n.get(id).clase) === 5));
    assert.equal(new Set(p.opciones).size, 4);
  }
  assert.deepEqual(preguntasRepaso(mapas, 'per', [8], createRng(7), 3).filter((p) => p.mapa.tits.includes('py')), []);
  const elim = mapasEliminatorios(mapas, 'per', PER).map((x) => x.mapa.id);
  assert.ok(elim.includes('balizamiento') && elim.includes('ripa-maniobras'));
  assert.ok(!elim.includes('meteo'));
});
