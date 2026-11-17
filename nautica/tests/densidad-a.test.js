// Menos densidad, parte A (H-73): lista de preguntas plegada por convocatoria, selector de modo y textos cortos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { agruparPorConvocatoria, contarGrupo, rotuloGrupo, contadoresGrupo, siguienteSinHacer, primerasPalabras, convocatoriaCorta } from '../src/exams/lista-preguntas.js';
import { TEXTOS_INTRO, CLAVE_INTRO } from '../src/ui/intro-vista.js';

const leer = (f) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
const qs = ['a', 'b', 'c', 'd'].map((x, i) => ({ id: x, conv: i < 2 ? 'c1' : 'c2', convocatoria: i < 2 ? '1ª Convocatoria 2020 (1 de abril)' : '2ª Convocatoria 2020', numero: i + 1 }));

test('la lista se agrupa por convocatoria y cuenta lo hecho y acertado', () => {
  const g = agruparPorConvocatoria(qs);
  assert.deepEqual(g.map((x) => x.preguntas.length), [2, 2]);
  const r = { a: { ok: true, t: '2026-01-01' }, b: { ok: false, t: '2026-01-02' } };
  assert.deepEqual(contarGrupo(g[0].preguntas, r), { total: 2, hechas: 2, acertadas: 1 });
  assert.match(rotuloGrupo(g[0], r), /2 hechas · 1 acertada$/);
  assert.equal(contadoresGrupo(g[1], r), '2 sin hacer');
  assert.equal(convocatoriaCorta(g[0].titulo), '1ª Convocatoria 2020');
});

test('«Seguir con la siguiente sin hacer»: la primera sin hacer tras la última tocada, o la primera de la lista', () => {
  assert.equal(siguienteSinHacer(qs, {}).id, 'a');
  assert.equal(siguienteSinHacer(qs, { b: { ok: true, t: '2026-01-02' } }).id, 'c');
  assert.equal(siguienteSinHacer(qs, { d: { ok: true, t: '2026-01-02' } }).id, 'a');
  assert.equal(siguienteSinHacer(qs, Object.fromEntries(qs.map((q) => [q.id, { ok: true, t: 'x' }]))), null);
  assert.equal(primerasPalabras('uno dos tres cuatro', 2), 'uno dos…');
});

test('las introducciones de los modos son cortas (unas 15 palabras) y cada una tiene su ajuste', () => {
  for (const [modo, t] of Object.entries(TEXTOS_INTRO)) {
    assert.ok(t.split(/\s+/).length <= 18, modo);
    assert.ok(CLAVE_INTRO[modo], modo);
  }
  assert.match(TEXTOS_INTRO.guiado, /no cuenta como fallo/);
});

test('la pregunta de carta: selector único, menú ⋯, aviso de traza sin trazado y miga a su convocatoria', () => {
  const e = leer('src/ui/views/exams.js');
  assert.match(e, /¿Cómo quieres hacerla\?/);
  for (const n of ['Solo la respuesta', 'Paso a paso', 'En papel', 'En la carta']) assert.ok(e.includes(n), n);
  assert.match(e, /menuAcciones\(/);
  assert.match(e, /Esta pregunta no tiene trazado en la carta/);
  assert.match(e, /\{ c: q\.conv \}/);
  assert.match(e, /id=?['"]?ai-context|details\.ai-context#ai-context/);
  const m = leer('src/ui/menu-acciones.js');
  for (const k of ['aria-expanded', 'ArrowDown', 'Escape', 'Home', "role: 'menu'"]) assert.ok(m.includes(k), k);
  assert.doesNotMatch(leer('src/ui/papel.js'), /papel-margen\b(?!es)/);
});
