// Integridad del banco de teoría del Patrón de Yate y de su estructura de examen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { PY, TITULACIONES, totalPreguntas } from '../src/theory/blocks.js';
import { convocatorias, buildReal, buildSimulacro, grade } from '../src/theory/engine.js';
import { createRng } from '../src/math/rng.js';

const dir = new URL('../data/ejes/andalucia/', import.meta.url);
const bank = JSON.parse(readFileSync(new URL('py/preguntas.json', dir))).preguntas;

test('estructura PY: 40 preguntas, 28 aciertos, límites en navegación y carta', () => {
  assert.equal(totalPreguntas(PY), 40);
  assert.equal(PY.minAciertos, 28);
  assert.equal(PY.bloques.find((b) => b.ut === 3).maxErrores, 5);
  assert.equal(PY.bloques.find((b) => b.ut === 4).maxErrores, 3);
  assert.equal(TITULACIONES.py.estructura, PY);
});

test('banco PY: 34 convocatorias completas de 40 preguntas (2020–2026: 180 por bloque)', () => {
  const antiguas = bank.filter((q) => !/^and-py-201[5-9]-/.test(q.id));
  assert.equal(antiguas.length, 720);
  assert.equal(bank.length, 720 + 609); // 2015–2019 (fase F5): las que repiten una publicada van en su apareceEn
  for (const b of PY.bloques) assert.equal(antiguas.filter((q) => q.ut === b.ut).length, b.n * 18, `UT${b.ut}`);
  const convs = convocatorias(PY, bank);
  assert.equal(convs.length, 34);
  assert.ok(convs.every((c) => c.completa && c.n === 40));
  for (const c of convs) {
    const t = buildReal(bank, c.key);
    for (const b of PY.bloques) assert.equal(t.preguntas.filter((q) => q.ut === b.ut).length, b.n, `${c.key} UT${b.ut}`);
  }
});

test('cada pregunta PY: 4 opciones, respuesta válida o anulada, figuras existentes', () => {
  for (const q of bank) {
    assert.deepEqual(Object.keys(q.opciones).sort(), ['a', 'b', 'c', 'd'], q.id);
    if (q.anulada) assert.equal(q.correcta, null, q.id);
    else assert.ok(['a', 'b', 'c', 'd'].includes(q.correcta), q.id);
    for (const f of q.figuras ?? []) assert.ok(existsSync(new URL(f, dir)), `${q.id}: ${f}`);
  }
});

test('examen real PY: genérico (1–20) y luego navegación (21–40); corrección con las reglas del PY', () => {
  const t = buildReal(bank, 'and-py-2025-c1');
  assert.equal(t.preguntas.length, 40);
  assert.deepEqual(t.preguntas.slice(0, 20).map((q) => q.modulo), Array(20).fill('generico'));
  assert.deepEqual(t.preguntas.slice(20).map((q) => q.modulo), Array(20).fill('navegacion'));
  const todas = Object.fromEntries(t.preguntas.map((q) => [q.id, q.correcta ?? 'a']));
  assert.equal(grade(PY, t, todas).apto, true);
  // 4 fallos en carta (máx. 3) → no apto aunque haya 36 aciertos
  const carta = t.preguntas.filter((q) => q.ut === 4 && !q.anulada).slice(0, 4);
  const mal = { ...todas, ...Object.fromEntries(carta.map((q) => [q.id, q.correcta === 'a' ? 'b' : 'a'])) };
  const g = grade(PY, t, mal);
  assert.equal(g.apto, false);
  assert.ok(g.motivos.some((m) => /Carta/.test(m)));
});

test('simulacro PY: 10 preguntas de cada bloque', () => {
  const s = buildSimulacro(PY, bank, createRng(1));
  assert.equal(s.preguntas.length, 40);
  assert.equal(s.faltan.length, 0);
});

test('el profe tiene explicación para todas las preguntas del PY (también las de carta), con ilustraciones dibujables', async () => {
  const { narrateTheory } = await import('../src/teacher/theory.js');
  const { validSpec } = await import('../src/illustrations/index.js');
  const expl = JSON.parse(readFileSync(new URL('py/explicaciones.json', dir)));
  for (const q of bank) {
    const e = expl[q.id];
    assert.ok(e?.explicacion && e.clave, `sin explicación: ${q.id}`);
    for (const s of e.ilustraciones ?? []) assert.ok(validSpec(s), `${q.id}: ${JSON.stringify(s)}`);
    const n = narrateTheory(q, e, 'a');
    assert.ok(n.speech.length > 40 && !/undefined/.test(n.speech), q.id);
  }
});
