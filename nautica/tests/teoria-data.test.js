// Integridad del banco de teoría PER: respuestas válidas, bloques, figuras y explicaciones del profe.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { PER } from '../src/theory/blocks.js';
import { narrateTheory } from '../src/teacher/theory.js';
import { validSpec } from '../src/illustrations/index.js';

const dir = new URL('../data/exams/', import.meta.url);
const bank = JSON.parse(readFileSync(new URL('andalucia-per-teoria.json', dir))).preguntas;
const expl = JSON.parse(readFileSync(new URL('andalucia-per-teoria-explicaciones.json', dir)));

test('banco de teoría PER: 18 convocatorias × 41 preguntas con bloques del RD', () => {
  assert.equal(bank.length, 738);
  const per = new Map(PER.bloques.map((b) => [b.ut, 0]));
  for (const q of bank) per.set(q.ut, per.get(q.ut) + 1);
  for (const b of PER.bloques.filter((x) => x.ut <= 10)) assert.equal(per.get(b.ut), b.n * 18, `UT${b.ut}`);
});

test('cada pregunta: 4 opciones, respuesta válida o anulada, figuras existentes', () => {
  for (const q of bank) {
    assert.deepEqual(Object.keys(q.opciones).sort(), ['a', 'b', 'c', 'd'], q.id);
    if (q.anulada) assert.equal(q.correcta, null, q.id);
    else assert.ok(['a', 'b', 'c', 'd'].includes(q.correcta), q.id);
    for (const f of q.figuras ?? []) assert.ok(existsSync(new URL(f, dir)), `${q.id}: ${f}`);
  }
});

test('el profe tiene explicación para todas las preguntas', () => {
  for (const q of bank) {
    assert.ok(expl[q.id]?.explicacion, `sin explicación: ${q.id}`);
    const n = narrateTheory(q, expl[q.id], 'a');
    assert.ok(n.speech.length > 40 && !/undefined/.test(n.speech), q.id);
  }
});

test('las ilustraciones asignadas a las preguntas son dibujables', () => {
  for (const [id, e] of Object.entries(expl)) {
    for (const s of e.ilustraciones ?? []) assert.ok(validSpec(s), `${id}: ${JSON.stringify(s)}`);
  }
});

test('reglas nemotécnicas: asignadas a preguntas que existen', () => {
  const m = JSON.parse(readFileSync(new URL('mnemotecnias.json', dir)));
  const py = JSON.parse(readFileSync(new URL('andalucia-py-teoria.json', dir))).preguntas;
  const ids = new Set([...bank, ...py].map((q) => q.id));
  for (const r of m.reglas) {
    assert.ok(r.regla && r.significado, r.id);
    for (const id of r.preguntas ?? []) assert.ok(ids.has(id), `${r.id}: ${id}`);
  }
});
