// Motor del curso: estados de lección, repaso espaciado, plan del día; y validez de los cursos publicados.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { estadoLeccion, trasPractica, hoyToca, INTERVALOS } from '../src/course/engine.js';
import { validSpec } from '../src/illustrations/index.js';

const DIA = 864e5;
const L = { id: 'per-5-1', practica: ['a', 'b', 'c', 'd', 'e'] };

test('estado de una lección: nueva → empezada → dominada → repasar', () => {
  const t0 = Date.UTC(2026, 0, 1);
  assert.equal(estadoLeccion(L, undefined, {}, t0).estado, 'nueva');
  assert.equal(estadoLeccion(L, { visto: true }, {}, t0).estado, 'empezada');
  const r1 = trasPractica({ visto: true }, 0.8, t0);
  assert.equal(r1.caja, 0); // primera práctica aprobada: entra en la caja 0 (repaso mañana)
  const r2 = trasPractica(r1, 1, t0 + DIA);
  assert.equal(r2.caja, 1);
  const ok = { a: { ok: true }, b: { ok: true }, c: { ok: true }, d: { ok: true }, e: { ok: false } };
  assert.equal(estadoLeccion(L, r2, ok, t0 + 2 * DIA).estado, 'dominada');
  assert.equal(estadoLeccion(L, r2, ok, r2.proximo + 1).estado, 'repasar');
});

test('repaso espaciado: suspender devuelve a la caja 0 (mañana)', () => {
  const t = Date.UTC(2026, 0, 1);
  const r = trasPractica({ caja: 3 }, 0.5, t);
  assert.equal(r.caja, 0);
  assert.equal(r.proximo, t + INTERVALOS[0] * DIA);
});

test('hoy toca: primero repasos, después la siguiente lección; ritmo con fecha de examen', () => {
  const curso = { modulos: [{ ut: 5, titulo: 'B', lecciones: [{ id: 'x1', practica: [] }, { id: 'x2', practica: [] }, { id: 'x3', practica: [] }] }] };
  const ahora = Date.UTC(2026, 0, 10);
  const regs = { x1: { visto: true, caja: 1, proximo: ahora - DIA } };
  const p = hoyToca(curso, regs, {}, { ahora, fechaExamen: '2026-02-09' });
  assert.deepEqual(p.repasos.map((l) => l.id), ['x1']);
  assert.equal(p.siguiente.id, 'x2');
  assert.equal(p.ritmo.dias, 30);
  assert.equal(p.ritmo.pendientes, 2);
});

for (const tit of ['per', 'py']) {
  const f = new URL(`../data/curso/${tit}.json`, import.meta.url);
  test(`curso ${tit}: lecciones válidas (pasos, ilustraciones, reglas y preguntas reales existentes)`, { skip: !existsSync(f) }, () => {
    const curso = JSON.parse(readFileSync(f));
    const banco = JSON.parse(readFileSync(new URL(`../data/exams/andalucia-${tit}-teoria.json`, import.meta.url))).preguntas;
    const carta = tit === 'per' ? JSON.parse(readFileSync(new URL('../data/exams/andalucia-per.json', import.meta.url))).preguntas : [];
    const ids = new Set([...banco, ...carta].map((q) => q.id));
    const reglas = new Set(JSON.parse(readFileSync(new URL('../data/exams/mnemotecnias.json', import.meta.url))).reglas.map((r) => r.id));
    const vistos = new Set();
    for (const m of curso.modulos) for (const l of m.lecciones) {
      assert.ok(!vistos.has(l.id), `id repetido ${l.id}`);
      vistos.add(l.id);
      assert.ok(l.titulo && l.pasos?.length, l.id);
      for (const p of l.pasos) {
        if (p.tipo === 'ilustracion') assert.ok(validSpec(p.spec), `${l.id}: ${JSON.stringify(p.spec)}`);
        if (p.tipo === 'regla') assert.ok(reglas.has(p.id), `${l.id}: regla ${p.id}`);
        if (p.tipo === 'check') assert.ok(p.opciones?.[p.correcta], `${l.id}: check sin respuesta válida`);
        if (p.tipo === 'texto') assert.ok(!/apuntes|sirocodiez|siroco ?10/i.test(p.texto), `${l.id}: referencia a apuntes`);
      }
      for (const q of l.practica ?? []) assert.ok(ids.has(q), `${l.id}: pregunta ${q}`);
      for (const r of l.profundizar ?? []) assert.match(r.url, /^https:\/\//, l.id);
    }
  });
}

test('una clase sin práctica queda aprendida al terminarla y no bloquea su tema', async () => {
  const { estadoLeccion } = await import('../src/course/engine.js');
  const { planHoy } = await import('../src/course/plan.js');
  const { TITULACIONES } = await import('../src/theory/blocks.js');
  const fs = await import('node:fs');
  const l = { id: 'x', practica: [] };
  assert.equal(estadoLeccion(l, undefined, {}).estado, 'nueva');
  assert.equal(estadoLeccion(l, { paso: 3 }, {}).estado, 'empezada');
  assert.equal(estadoLeccion(l, { visto: true, paso: 0 }, {}).estado, 'dominada');
  // Yate: todo hecho y la clase de mareas (sin práctica) terminada → Hoy ya no la propone
  const curso = JSON.parse(fs.readFileSync(new URL('../data/curso/py.json', import.meta.url)));
  const preguntas = JSON.parse(fs.readFileSync(new URL('../data/exams/andalucia-py-teoria.json', import.meta.url))).preguntas;
  const regs = {};
  for (const m of curso.modulos) for (const c of m.lecciones) regs[c.id] = c.practica?.length ? { visto: true, caja: 2, proximo: Date.now() + 9e8 } : { visto: true, paso: 0 };
  const respuestas = Object.fromEntries(preguntas.map((q) => [q.id, { ok: true }]));
  const plan = planHoy({ estructura: TITULACIONES.py.estructura, curso, preguntas, regs, respuestas });
  assert.equal(plan[0].tipo, 'simulacro', JSON.stringify(plan));
});
