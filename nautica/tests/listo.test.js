// ¿Estoy listo? y repaso mezclado.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PER, PY } from '../src/theory/blocks.js';
import { fallosBloque, probAprobar, estoyListo, lineaListo } from '../src/course/listo.js';
import { buildMezcla } from '../src/theory/engine.js';
import { planHoy } from '../src/course/plan.js';
import { createRng } from '../src/math/rng.js';

const banco = (E, porTema = 40) => E.bloques.flatMap((b) => Array.from({ length: porTema }, (_, i) => ({ id: `${b.ut}-${i}`, ut: b.ut, correcta: 'a' })));
/** Responde en cada tema `n` preguntas con un porcentaje de acierto (o uno por tema). */
function responder(qs, E, n, pct) {
  const r = {};
  for (const b of E.bloques) {
    const p = typeof pct === 'object' ? pct[b.ut] ?? pct.resto : pct;
    qs.filter((q) => q.ut === b.ut).slice(0, n).forEach((q, i) => { r[q.id] = { ok: i < Math.round(n * p), t: '2026-10-01T10:00:00Z' }; });
  }
  return r;
}

test('fallos de un bloque: suma 1 y se concentra según lo que aciertas', () => {
  const d = fallosBloque(5, 90, 10);
  assert.ok(Math.abs(d.reduce((a, b) => a + b, 0) - 1) < 1e-9);
  assert.ok(d[0] > d[3]);
  const sinDatos = fallosBloque(4, 0, 0); // Beta(1,1): uniforme en el número de fallos
  assert.ok(sinDatos.every((p) => Math.abs(p - 0.2) < 1e-9));
});

test('probabilidad de aprobar con las reglas reales', () => {
  const perfecto = PER.bloques.map((b) => [1, ...Array(b.n).fill(0)]);
  assert.ok(Math.abs(probAprobar(PER, perfecto) - 1) < 1e-12);
  // un solo bloque con límite que se pasa seguro → suspenso aunque el resto sea perfecto
  const carta = PER.bloques.map((b) => (b.ut === 11 ? [0, 0, 0, 1, 0] : [1, ...Array(b.n).fill(0)]));
  assert.equal(probAprobar(PER, carta), 0);
  // 13 fallos repartidos sin tocar límites aprueba justo (45 − 32 = 13); 14 no
  const fallos = (k) => PER.bloques.map((b) => { const d = Array(b.n + 1).fill(0); d[k[b.ut] ?? 0] = 1; return d; });
  assert.equal(probAprobar(PER, fallos({ 1: 3, 2: 2, 3: 3, 4: 2, 7: 2, 9: 1 })), 1);
  assert.equal(probAprobar(PER, fallos({ 1: 3, 2: 2, 3: 3, 4: 2, 7: 2, 9: 2 })), 0);
});

test('estoy listo: sin datos, buen alumno, tema que tumba', () => {
  const qs = banco(PER);
  assert.equal(estoyListo(PER, qs, {}).estado, 'faltan-datos');
  assert.match(lineaListo(estoyListo(PER, qs, {})), /al menos 10 preguntas/);
  const bueno = estoyListo(PER, qs, responder(qs, PER, 30, 0.95));
  assert.equal(bueno.estado, 'listo');
  assert.ok(bueno.prob > 0.9);
  // aciertas 95 % en todo menos Carta (55 %): es Carta lo que te tumba
  const flojoCarta = estoyListo(PER, qs, responder(qs, PER, 30, { 11: 0.55, resto: 0.95 }));
  assert.equal(flojoCarta.limitante.ut, 11);
  assert.ok(flojoCarta.prob < bueno.prob);
  assert.match(lineaListo(flojoCarta), /Carta de navegación \(aciertas el 5[37] %, y solo se pueden fallar 2 de 4\)/);
  // Yate a la mitad: no aprueba
  const qy = banco(PY);
  assert.equal(estoyListo(PY, qy, responder(qy, PY, 30, 0.5)).estado, 'aun-no');
});

test('repaso mezclado: varios temas por turnos, más peso a los fallos y solo de lo empezado', () => {
  const qs = banco(PER);
  const r = responder(qs, PER, 10, 0.5);
  const m = buildMezcla(qs, [1, 5, 6], createRng(7), { respuestas: r, limite: 10 });
  assert.equal(m.preguntas.length, 10);
  assert.ok(m.preguntas.every((q) => [1, 5, 6].includes(q.ut)));
  assert.equal(new Set(m.preguntas.map((q) => q.id)).size, 10);
  for (let i = 1; i < m.preguntas.length; i++) assert.notEqual(m.preguntas[i].ut, m.preguntas[i - 1].ut, 'no salen dos seguidas del mismo tema');
  // las falladas pesan más que las acertadas y que las no vistas
  let falladas = 0;
  for (let s = 1; s <= 30; s++) falladas += buildMezcla(qs, [1, 5, 6], createRng(s), { respuestas: r, limite: 6 }).preguntas.filter((q) => r[q.id] && !r[q.id].ok).length;
  assert.ok(falladas / (30 * 6) > 0.5, `falladas ${falladas}`);
});

test('plan: el repaso mezclado aparece detrás de lo principal y una vez al día', () => {
  const qs = banco(PER);
  const respuestas = Object.fromEntries([...qs.filter((q) => q.ut === 1).slice(0, 5), ...qs.filter((q) => q.ut === 5).slice(0, 5)].map((q) => [q.id, { ok: true }]));
  const ahora = new Date(2026, 9, 2, 10).getTime();
  const p = planHoy({ estructura: PER, preguntas: qs, respuestas, ahora });
  assert.notEqual(p[0].tipo, 'mezclado');
  assert.ok(p.some((x) => x.tipo === 'mezclado'));
  const hecho = planHoy({ estructura: PER, preguntas: qs, respuestas, ahora, ultimoMezclado: new Date(ahora).toLocaleDateString('sv-SE') });
  assert.ok(!hecho.some((x) => x.tipo === 'mezclado'));
});
