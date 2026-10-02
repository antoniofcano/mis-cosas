// Recomendador único («Hoy»), estado de un tema y tandas de práctica.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PER, PY } from '../src/theory/blocks.js';
import { planHoy, estadoTema, avance, diasHasta, lineaAvance, OBJETIVO_TEMA, TANDA } from '../src/course/plan.js';
import { buildPractica } from '../src/theory/engine.js';
import { createRng } from '../src/math/rng.js';

const DIA = 864e5;
const AHORA = new Date(2026, 4, 10, 12, 0).getTime(); // 10 de mayo de 2026, mediodía (hora local)

// Banco sintético: 30 preguntas por tema
const banco = PER.bloques.flatMap((b) => [...Array(30)].map((_, i) => ({ id: `q${b.ut}-${i}`, ut: b.ut, correcta: 'a', opciones: { a: 'x', b: 'y' } })));
// Curso con clases solo en el tema 5 (Balizamiento)
const curso = { modulos: [{ ut: 5, titulo: 'Balizamiento', lecciones: [
  { id: 'per-5-1', titulo: 'El sistema IALA', minutos: 10, practica: ['q5-0', 'q5-1', 'q5-2'] },
  { id: 'per-5-2', titulo: 'Marcas laterales', minutos: 15, practica: ['q5-3', 'q5-4'] },
] }] };

/** Respuestas: n primeras preguntas de cada tema indicado, con `ok` aciertos. */
function responder(uts, n = OBJETIVO_TEMA, ok = n) {
  const r = {};
  for (const ut of uts) for (let i = 0; i < n; i++) r[`q${ut}-${i}`] = { ok: i < ok };
  return r;
}
const base = { estructura: PER, curso, preguntas: banco, regs: {}, respuestas: {}, tests: [], testEnCurso: null, fechaExamen: null, ahora: AHORA };

test('1. progreso vacío → preguntas del tema 1', () => {
  const p = planHoy(base);
  assert.equal(p[0].tipo, 'preguntas');
  assert.equal(p[0].ut, 1);
  assert.deepEqual(p[0].ruta, ['teoria', 'ut', '1']);
});

test('2. temas 1–4 al día → clase del tema 5, «Empezar»', () => {
  const p = planHoy({ ...base, respuestas: responder([1, 2, 3, 4]) });
  assert.equal(p[0].tipo, 'clase');
  assert.equal(p[0].ut, 5);
  assert.equal(p[0].verbo, 'Empezar');
  assert.deepEqual(p[0].ruta, ['curso', 'per-5-1']);
});

test('3. clase vista sin caja → «Continuar»', () => {
  const p = planHoy({ ...base, respuestas: responder([1, 2, 3, 4]), regs: { 'per-5-1': { visto: true } } });
  assert.equal(p[0].tipo, 'clase');
  assert.equal(p[0].verbo, 'Continuar');
  assert.deepEqual(p[0].ruta, ['curso', 'per-5-1']);
});

test('4. clase con repaso vencido → repaso con práctica directa', () => {
  const regs = { 'per-5-1': { visto: true, caja: 1, proximo: AHORA - DIA } };
  const p = planHoy({ ...base, regs });
  assert.equal(p[0].tipo, 'repaso');
  assert.equal(p[0].query.practica, '1');
  assert.deepEqual(p[0].ruta, ['curso', 'per-5-1']);
});

test('5. examen a medias → lo primero', () => {
  const p = planHoy({ ...base, testEnCurso: { tit: 'per', tipo: 'simulacro', seed: 7, respuestas: {}, i: 3, consumidoMs: 30 * 60000 } });
  assert.equal(p[0].tipo, 'examen-en-curso');
  assert.equal(p[0].minutos, 60);
  assert.deepEqual(p[0].query, { s: '7' });
});

test('6. examen en 10 días y sin tests hoy → simulacro; con un test hoy, no', () => {
  const fechaExamen = new Date(AHORA + 10 * DIA).toLocaleDateString('sv-SE');
  assert.equal(diasHasta(fechaExamen, AHORA), 10);
  assert.equal(planHoy({ ...base, fechaExamen })[0].tipo, 'simulacro');
  const tests = [{ t: new Date(AHORA - 3600e3).toISOString() }];
  assert.notEqual(planHoy({ ...base, fechaExamen, tests })[0].tipo, 'simulacro');
});

test('7. 12 preguntas falladas → sesión de fallos', () => {
  const p = planHoy({ ...base, respuestas: responder([3], 12, 0) });
  const f = p.find((a) => a.tipo === 'fallos');
  assert.ok(f);
  assert.equal(f.ut, 3);
  assert.deepEqual(f.query, { f: '1' });
});

test('8. todos los temas al día → simulacro', () => {
  const regs = { 'per-5-1': { visto: true, caja: 2, proximo: AHORA + 5 * DIA }, 'per-5-2': { visto: true, caja: 2, proximo: AHORA + 5 * DIA } };
  const p = planHoy({ ...base, regs, respuestas: responder(PER.bloques.map((b) => b.ut)) });
  assert.equal(p[0].tipo, 'simulacro');
});

test('9. sin curso (PY) → no lanza y propone preguntas', () => {
  const bancoPy = PY.bloques.flatMap((b) => [...Array(15)].map((_, i) => ({ id: `y${b.ut}-${i}`, ut: b.ut, correcta: 'a' })));
  const p = planHoy({ ...base, estructura: PY, curso: null, preguntas: bancoPy });
  assert.equal(p[0].tipo, 'preguntas');
});

test('10. la lista nunca está vacía ni pasa de 3', () => {
  const casos = [
    base,
    { ...base, respuestas: responder([1, 2, 3, 4]) },
    { ...base, respuestas: responder([1, 2, 3], 15, 0), regs: { 'per-5-1': { visto: true, caja: 0, proximo: AHORA - DIA }, 'per-5-2': { visto: true, caja: 0, proximo: AHORA - 2 * DIA } },
      testEnCurso: { tipo: 'real', conv: 'x', consumidoMs: 0 }, fechaExamen: new Date(AHORA + 2 * DIA).toLocaleDateString('sv-SE') },
    { ...base, preguntas: [], curso: null },
  ];
  for (const c of casos) {
    const p = planHoy(c);
    assert.ok(p.length >= 1 && p.length <= 3, JSON.stringify(p));
  }
  // con una sola actividad se añade el siguiente tema pendiente, en el orden de estudio (PER: 1, 5, 6…)
  const p1 = planHoy(base);
  assert.equal(p1.length, 2);
  assert.equal(p1[1].ut, 5);
});

test('11. estadoTema: con menos de 10 hechas no hay porcentaje', () => {
  const e = estadoTema(PER.bloques[0], null, banco, {}, responder([1], 9, 9));
  assert.equal(e.pct, null);
  assert.equal(e.estado, 'en-marcha');
  assert.equal(estadoTema(PER.bloques[0], null, banco, {}, {}).estado, 'sin-empezar');
});

test('12. estadoTema: 20 hechas con 17 aciertos → bien y al día', () => {
  const e = estadoTema(PER.bloques[0], null, banco, {}, responder([1], 20, 17));
  assert.equal(e.estado, 'bien');
  assert.equal(e.alDia, true);
  assert.equal(e.pct, 85);
});

test('13. estadoTema: 10 hechas con 5 aciertos → conviene repasar', () => {
  assert.equal(estadoTema(PER.bloques[0], null, banco, {}, responder([1], 10, 5)).estado, 'repasar');
});

test('avance: la barra solo llega al 100 % con todos los temas al día, y sin clases terminadas no se llena', () => {
  // Todas las preguntas de todos los temas, pero sin ver las clases del tema 5: la barra no puede llegar al 100 %.
  const todas = responder(PER.bloques.map((b) => b.ut));
  const a = avance(PER, curso, banco, {}, todas);
  assert.equal(a.temasAlDia, a.temasTotal - 1);
  assert.ok(a.fraccion < 1);
  // Sin nada hecho, 0 %; y el texto cuenta lo mismo que la barra.
  const cero = avance(PER, curso, banco, {}, {});
  assert.equal(cero.fraccion, 0);
  assert.match(lineaAvance(cero), /0 % del camino: 0 de 11 temas al día/);
  assert.match(lineaAvance({ fraccion: 1, temasAlDia: 11, temasTotal: 11 }), /100 % del camino: todos los temas al día/);
});

test('avance: temas al día y fracción', () => {
  const a = avance(PER, curso, banco, {}, responder([1, 2], 20));
  assert.equal(a.temasAlDia, 2);
  assert.equal(a.temasTotal, 11);
  assert.ok(Math.abs(a.fraccion - 2 / 11) < 1e-9);
});

test('14. buildPractica con límite: 10, primero sin responder, luego falladas, luego acertadas', () => {
  const respuestas = {};
  for (let i = 0; i < 25; i++) respuestas[`q1-${i}`] = { ok: i >= 3 }; // 3 falladas, 22 acertadas, 5 sin responder
  const s = buildPractica(banco, 1, createRng(1), { respuestas, limite: TANDA });
  assert.equal(s.preguntas.length, 10);
  const prio = s.preguntas.map((q) => (!respuestas[q.id] ? 0 : respuestas[q.id].ok ? 2 : 1));
  assert.deepEqual(prio, [0, 0, 0, 0, 0, 1, 1, 1, 2, 2]);
  assert.equal(s.pendientes, 0);
  const s2 = buildPractica(banco, 1, createRng(1), { respuestas: {}, limite: TANDA });
  assert.equal(s2.pendientes, 20);
});

test('15. buildPractica sin límite: todas las del tema, barajadas y reproducibles', () => {
  const a = buildPractica(banco, 2, createRng(5));
  assert.equal(a.preguntas.length, 30);
  assert.deepEqual(a.preguntas.map((q) => q.id), buildPractica(banco, 2, createRng(5)).preguntas.map((q) => q.id));
  const solo = buildPractica(banco, 2, createRng(5), { soloFalladas: new Set(['q2-1', 'q2-4']) });
  assert.deepEqual(solo.preguntas.map((q) => q.id).sort(), ['q2-1', 'q2-4']);
});

// --- Orden de estudio y ritmo ----------------------------------------------------------------------------------
import { bloquesEnOrden, PER as PER_E, PY as PY_E } from '../src/theory/blocks.js';
import { ritmoEstudio, planHoy as planHoy2 } from '../src/course/plan.js';

test('orden de estudio: lo que más pesa primero', () => {
  assert.deepEqual(bloquesEnOrden(PER_E).map((b) => b.ut), [1, 5, 6, 10, 11, 2, 3, 4, 7, 8, 9]);
  assert.deepEqual(bloquesEnOrden(PY_E).map((b) => b.ut), [3, 4, 1, 2]);
  assert.deepEqual(bloquesEnOrden({ bloques: [{ ut: 2 }, { ut: 1 }] }).map((b) => b.ut), [1, 2]); // sin orden: el oficial
  // alumno nuevo de Yate: la primera clase que toca es de Teoría de navegación
  const curso = { modulos: PY_E.bloques.map((b) => ({ ut: b.ut, titulo: b.titulo, lecciones: [{ id: `py-${b.ut}-1`, titulo: `c${b.ut}`, minutos: 10, practica: [] }] })) };
  assert.equal(planHoy2({ estructura: PY_E, curso, preguntas: [] })[0].ut, 3);
});

test('ritmo: cuándo terminas y si llegas al examen', () => {
  const ahora = new Date(2026, 9, 2, 10).getTime(); // 2 de octubre
  const curso = { modulos: [{ ut: 1, titulo: 'A', lecciones: [{ id: 'a1', minutos: 60, practica: [] }, { id: 'a2', minutos: 60, practica: [] }] }] };
  const estructura = { duracionMin: 90, bloques: [{ ut: 1, titulo: 'A', n: 4 }] };
  const preguntas = Array.from({ length: 30 }, (_, i) => ({ id: `q${i}`, ut: 1, correcta: 'a' }));
  // 120 min de clases + 2 tandas (20 preguntas) × 8 + 3 simulacros × 90 = 406 min; a 20 min/día, 21 días
  const r = ritmoEstudio({ estructura, curso, preguntas, ahora, minutosDia: 20, fechaExamen: '2026-10-12' });
  assert.deepEqual(r.desglose, { clases: 120, preguntas: 16, simulacros: 270 });
  assert.equal(r.diasNecesarios, 21);
  assert.equal(r.fechaFin, '2026-10-22');
  assert.equal(r.diasDisponibles, 10);
  assert.equal(r.llega, false);
  assert.equal(r.minutosNecesarios, 45); // 406 / 10 = 40,6 → 45 (de 5 en 5)
  // con clases hechas, preguntas al día y simulacros hechos no queda nada
  const regs = { a1: { visto: true, paso: 0 }, a2: { visto: true, paso: 0 } };
  const respuestas = Object.fromEntries(preguntas.slice(0, 20).map((q) => [q.id, { ok: true }]));
  const tests = [{ tipo: 'simulacro' }, { tipo: 'real' }, { tipo: 'simulacro' }];
  const fin = ritmoEstudio({ estructura, curso, preguntas, regs, respuestas, tests, ahora, fechaExamen: '2026-10-12' });
  assert.equal(fin.minutosPendientes, 0);
  assert.equal(fin.llega, true);
  // sin fecha de examen no se sabe si llegas
  assert.equal(ritmoEstudio({ estructura, curso, preguntas, ahora }).llega, null);
});
