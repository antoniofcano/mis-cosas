// Reloj del paso a paso y de las preguntas de carta (R-64): el objetivo sale del tiempo que ya calcula «Tu velocidad en
// carta» (R-42), los estados son los de esa tabla y cada paso lleva su tiempo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TITULACIONES } from '../src/theory/blocks.js';
import { tiempoDisponible } from '../src/course/estrategia.js';
import { objetivoPorProblema, fraccionObjetivo, estadoReloj, textoPasoHecho, cronoPasos } from '../src/course/reloj-paso.js';
import { estadoTiempo, acumulador } from '../src/course/velocidad.js';

const cfg = JSON.parse(readFileSync(new URL('../data/comun/estrategia.json', import.meta.url), 'utf8')).tiempo;

test('el objetivo es el tiempo disponible por pregunta de carta de «Tu velocidad en carta», y dice que es una estimación', () => {
  for (const tit of Object.keys(TITULACIONES)) {
    const T = TITULACIONES[tit];
    const ob = objetivoPorProblema(T, cfg);
    assert.ok(ob, tit);
    const d = tiempoDisponible(T, cfg);
    assert.equal(ob.s, d.cartaS ?? d.mediaS, tit);
    assert.match(ob.texto, /estimación/);
    assert.match(ob.texto, /no una norma/);
    assert.ok(ob.s > 60 && ob.s < 3600, `${tit}: ${ob.s}`);
  }
});

test('sin estructura no hay objetivo; sin carta en el presupuesto se usa la media del examen', () => {
  assert.equal(objetivoPorProblema(null, cfg), null);
  assert.equal(objetivoPorProblema({}, cfg), null);
  const T = structuredClone(TITULACIONES.per);
  T.cartaUt = -1; // ningún bloque de carta
  const ob = objetivoPorProblema(T, cfg);
  assert.equal(ob.origen, 'media');
  assert.match(ob.texto, /media/);
});

test('estados: vas bien hasta el 75 %, vas justo hasta el 100 % y te pasas después (los de la tabla de velocidad)', () => {
  assert.equal(estadoReloj(0, 400), 'bien');
  assert.equal(estadoReloj(300, 400), 'bien');
  assert.equal(estadoReloj(301, 400), 'justo');
  assert.equal(estadoReloj(400, 400), 'justo');
  assert.equal(estadoReloj(401, 400), 'pasas');
  assert.equal(estadoReloj(10, null), null);
  assert.equal(estadoTiempo(500, 400), 'se-pasa');
  assert.equal(fraccionObjetivo(200, 400), 0.5);
  assert.equal(fraccionObjetivo(800, 400), 2);
  assert.equal(fraccionObjetivo(5, null), null);
});

test('cada paso lleva su tiempo: el total menos el del paso anterior', () => {
  const c = cronoPasos();
  assert.equal(c.marca(48), 48);
  assert.equal(c.marca(130), 82);
  assert.equal(c.marca(120), 0); // el reloj no retrocede
  c.reinicia();
  assert.equal(c.marca(10), 10);
  assert.equal(textoPasoHecho(1, 48, true), 'paso 1 · 0:48 ✓');
  assert.equal(textoPasoHecho(2, 82), 'paso 2 · 1:22');
});

test('el acumulador no cuenta mientras no está visible (la pausa del reloj usa el mismo criterio)', () => {
  let t = 0; let vis = true;
  const a = acumulador({ ahora: () => t, visible: () => vis });
  t = 5000; assert.equal(a.ms(), 5000);
  vis = false; a.marca(); t = 15000; assert.equal(a.ms(), 5000);
  vis = true; a.marca(); t = 18000; assert.equal(a.ms(), 8000);
});

test('el paso a paso guarda su tiempo con los de carta y la tanda usa el mismo reloj; los exámenes no lo llevan', () => {
  const guiado = readFileSync(new URL('../src/ui/guiado.js', import.meta.url), 'utf8');
  assert.match(guiado, /tiemposAlumno\(\)\.anota\(/);
  assert.match(guiado, /relojPaso\(/);
  const theory = readFileSync(new URL('../src/ui/views/theory.js', import.meta.url), 'utf8');
  assert.match(theory, /relojPaso\(\{ tit: T\.id, compacto: true/);
  const examen = readFileSync(new URL('../src/ui/views/exams.js', import.meta.url), 'utf8');
  assert.doesNotMatch(examen, /relojPaso/);
});
