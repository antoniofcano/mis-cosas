// Tu velocidad en carta (R-42): tipo de problema de cada pregunta, tiempo solo con la pestaña visible, tiempo por
// pregunta en el registro del examen (y que pasa el validador del servidor), medias y tendencia por tipo, consejo de por
// dónde empezar y el almacén de la práctica (solo en el aparato).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TITULACIONES } from '../src/theory/blocks.js';
import { tiempoDisponible } from '../src/course/estrategia.js';
import { tipoDePregunta, acumulador, tiemposDelTest, muestras, velocidadPorTipo, consejoVelocidad, tiempoDelExamen, duracion, TOPE_PREGUNTA_S, NOMBRES_TIPO } from '../src/course/velocidad.js';
import { crearAlmacenTiempos, leerEstado, anota, CLAVE, MAX } from '../src/store/tiempos.js';
import { validarOperacion, MAX_OP } from '../src/store/sync/operaciones.js';
import { SOLUCIONES } from '../src/bancos/soluciones.js';

const leer = (f) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');

test('tipo de problema: el ejercicio de su solución; sin ella, «carta» en el tema de carta y «teoria» en el resto', () => {
  assert.equal(tipoDePregunta({ id: 'x', ut: 11 }, { ejercicio: 'situacion-dos-demoras' }, { cartaUt: 11 }), 'situacion-dos-demoras');
  assert.equal(tipoDePregunta({ id: 'x', ut: 11 }, undefined, { cartaUt: 11 }), 'carta');
  assert.equal(tipoDePregunta({ id: 'x', ut: 3 }, undefined, { cartaUt: 4, deCarta: true }), 'carta');
  assert.equal(tipoDePregunta({ id: 'x', ut: 6 }, undefined, { cartaUt: 11 }), 'teoria');
  // Todos los ejercicios de las soluciones programadas tienen nombre en la tabla.
  for (const s of Object.values(SOLUCIONES)) if (s.ejercicio) assert.ok(NOMBRES_TIPO[s.ejercicio], s.ejercicio);
});

test('el tiempo solo corre con la pestaña visible (el criterio del reloj del examen)', () => {
  let t = 0;
  let vis = true;
  const a = acumulador({ ahora: () => t, visible: () => vis });
  t = 10_000; vis = false; a.marca(); // 10 s visibles y se oculta
  t = 70_000; vis = true; a.marca(); // 60 s oculta: no cuentan
  t = 75_000;
  assert.equal(a.ms(), 15_000);
  a.reinicia();
  t = 80_000;
  assert.equal(a.ms(), 5_000);
});

test('la vista del examen cuenta cada pregunta con el mismo criterio que el reloj y la guarda en el registro del test', () => {
  const src = leer('src/ui/views/theory.js');
  const contar = src.slice(src.indexOf('function contar()'), src.indexOf('function tick()'));
  assert.match(contar, /activo && document\.visibilityState === 'visible'/);
  assert.match(contar, /msPregunta\[enPantalla\]/);
  assert.match(src, /tiemposDelTest\(\{ preguntas: test\.preguntas, ms: msPregunta/);
  assert.match(src, /porTema: [^\n]+\n\s*\/\/[^\n]+\n\s*tq \}\);/);
  // En la práctica, la pregunta de carta y el ejercicio de carta, con el reloj de pestaña visible y en el aparato.
  assert.match(src, /relojVisible\(\{ vivo: \(\) => box\.isConnected \}\)/);
  assert.match(leer('src/ui/views/exercise.js'), /tiemposAlumno\(\)\.anota\(\{ y: exercise\.id, s: reloj\.parar\(\)/);
});

const preguntas = Array.from({ length: 45 }, (_, i) => ({ id: `and-2025-c1-mod-a-${String(i + 1).padStart(2, '0')}-largo`, ut: i < 41 ? 1 : 11 }));

test('tiempo por pregunta en el registro: compacto, con tope, y cabe en una operación que acepta el servidor', () => {
  const ms = Object.fromEntries(preguntas.map((q, i) => [q.id, i === 0 ? 400 : i === 1 ? 99 * 3600_000 : 60_000 + i * 1000]));
  const tq = tiemposDelTest({ preguntas, ms, detalle: preguntas.map((q, i) => ({ id: q.id, ok: i % 2 === 0 })), tipoDe: (q) => (q.ut === 11 ? 'corriente-rumbo-a-dar' : 'teoria') });
  assert.equal(tq.length, 44, 'menos de un segundo no se guarda');
  assert.deepEqual(tq[0], [preguntas[1].id, TOPE_PREGUNTA_S, 0, 'teoria'], 'con tope');
  assert.deepEqual(tq.at(-1), [preguntas[44].id, 104, 1, 'corriente-rumbo-a-dar']);
  // La operación «x» con un examen de 45 preguntas y sus tiempos: válida y muy por debajo del tamaño máximo.
  const entry = { tit: 'per', eje: 'andalucia', tipo: 'simulacro', titulo: 'Simulacro de examen', aciertos: 30, total: 45, minutos: 80, apto: false, nuevas: 10,
    porTema: Array.from({ length: 11 }, (_, i) => ({ ut: i + 1, aciertos: 3, total: 4 })), tq, t: new Date().toISOString() };
  const op = { i: 'abcd1234ef.1a.x9', k: 'x', t: Date.now(), e: entry };
  assert.equal(validarOperacion(op), null);
  const bytes = new TextEncoder().encode(JSON.stringify(op)).length;
  assert.ok(bytes < MAX_OP / 8, `${bytes} bytes`);
});

test('medias por tipo con exámenes y práctica, tendencia y frente al tiempo disponible', () => {
  const t0 = Date.parse('2026-10-01T10:00:00Z');
  const tests = [
    { t: new Date(t0).toISOString(), tq: [['a', 600, 0, 'corriente-rumbo-a-dar'], ['b', 200, 1, 'situacion-dos-demoras'], ['c', 50, 1, 'teoria'], ['mal', 'x', 1, 'teoria']] },
    { t: new Date(t0 + 864e5).toISOString(), tq: [['a2', 560, 1, 'corriente-rumbo-a-dar'], ['b2', 180, 1, 'situacion-dos-demoras']] },
    { t: new Date(t0).toISOString(), minutos: 80 }, // sin tq: un examen de antes
  ];
  const practica = [
    { t: t0 + 2 * 864e5, y: 'corriente-rumbo-a-dar', s: 400, o: true },
    { t: t0 + 3 * 864e5, y: 'corriente-rumbo-a-dar', s: 380, o: true },
  ];
  assert.equal(muestras({ tests, practica }).length, 7, 'la fila mal formada se ignora');
  const f = velocidadPorTipo({ tests, practica, disponibleCartaS: 480, disponibleTeoriaS: 72 });
  assert.deepEqual(f.map((x) => x.tipo), ['corriente-rumbo-a-dar', 'situacion-dos-demoras', 'teoria'], 'carta primero, de más lenta a más rápida; la teoría al final');
  const c = f[0];
  assert.equal(c.n, 4); assert.equal(c.mediaS, (600 + 560 + 400 + 380) / 4); assert.equal(c.aciertos, 3); assert.equal(c.examen, 2);
  assert.equal(c.tendencia, 'baja', 'cada vez más rápido');
  assert.equal(c.estado, 'se-pasa', '485 s de media con 480 disponibles');
  assert.equal(f[1].estado, 'cabe'); assert.equal(f[1].tendencia, null, 'con dos muestras no hay tendencia');
  assert.equal(f[2].disponibleS, 72);
});

test('consejo: deja para el final lo que no cabe y empieza por lo rápido que aciertas', () => {
  const filas = velocidadPorTipo({ tests: [{ t: '2026-10-01', tq: [['a', 700, 0, 'corriente-desconocida'], ['b', 650, 1, 'corriente-desconocida'], ['c', 120, 1, 'situacion-dos-demoras'], ['d', 140, 1, 'situacion-dos-demoras'], ['e', 300, 1, 'carta']] }], disponibleCartaS: 480 });
  const k = consejoVelocidad(filas, { disponibleCartaS: 480 });
  assert.deepEqual(k.alFinal, ['corriente-desconocida']);
  assert.deepEqual(k.primero, ['situacion-dos-demoras'], '«carta» con una sola muestra no entra en el consejo');
  assert.match(k.texto, /^Empieza la carta por situación por dos demoras: .*Deja para el final corriente desconocida: te llevan de media 11 min y tienes unos 8 min por pregunta de carta/);
  const todo = consejoVelocidad(velocidadPorTipo({ tests: [{ t: '', tq: [['c', 120, 1, 'estima-directa'], ['d', 140, 1, 'estima-directa']] }], disponibleCartaS: 480 }), { disponibleCartaS: 480 });
  assert.match(todo.texto, /^Todos tus tipos de carta caben/);
  assert.equal(consejoVelocidad(velocidadPorTipo({ tests: [{ t: '', tq: [['c', 120, 1, 'estima-directa']] }] })), null, 'sin datos suficientes, sin consejo');
  assert.equal(duracion(45), '45 s'); assert.equal(duracion(80), '1 min 20 s'); assert.equal(duracion(660), '11 min');
  assert.equal(tiempoDelExamen([['c', 120, 1, 'estima-directa'], ['d', 60, 0, 'estima-directa']])[0].totalS, 180);
});

test('tiempo disponible por pregunta: el del presupuesto de la estrategia (carta del PER 8 min, del PY 5,5 min)', () => {
  const per = tiempoDisponible(TITULACIONES.per, { minTeoria: 1.2, repasoFraccion: 0.1 });
  assert.equal(per.cartaS, 480); assert.equal(per.mediaS, 120); assert.equal(per.tramo, null);
  const py = tiempoDisponible(TITULACIONES.py, { minTeoria: 1.2, repasoFraccion: 0.1 });
  assert.equal(py.cartaS, 330); assert.equal(py.tramo, 'Módulo de navegación');
});

test('práctica: en el aparato, con tope, sin pasar de largo y una vez por pregunta y día', () => {
  const mem = new Map();
  const almacen = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) };
  let t = Date.parse('2026-11-10T09:00:00Z');
  const a = crearAlmacenTiempos({ almacen, ahora: () => t });
  a.anota({ y: 'estima-directa', s: 2, o: true, q: 'p1' }); // pasar de largo
  a.anota({ y: 'estima-directa', s: 95.4, o: true, q: 'p1' });
  a.anota({ y: 'estima-directa', s: 30, o: false, q: 'p1' }); // misma pregunta, mismo día
  a.anota({ y: 'estima-directa', s: 99999, o: false, q: 'p2' });
  assert.deepEqual(a.lista().map((e) => e.s), [95, TOPE_PREGUNTA_S]);
  t += 864e5;
  a.anota({ y: 'estima-directa', s: 60, o: true, q: 'p1' });
  assert.equal(a.lista().length, 3);
  assert.ok(mem.has(CLAVE));
  assert.deepEqual(leerEstado('{roto').ev, []);
  let e = { v: 1, ev: [] };
  for (let i = 0; i < MAX + 5; i++) e = anota(e, { y: 'x', s: 10, o: true }, t + i);
  assert.equal(e.ev.length, MAX);
  // No va al progreso ni a la sincronización.
  assert.doesNotMatch(leer('src/store/progress.js'), /tiempos/);
  for (const f of ['operaciones.js', 'plegar.js', 'fusion.js', 'motor.js']) assert.doesNotMatch(leer(`src/store/sync/${f}`), /nautica\.tiempos/, f);
});
