// Antes y después del examen real (R-48, R-49, R-50; src/course/tras-examen.js): fallos por materia frente a su
// límite, la foto de la predicción, el resultado apuntado y su comparación, y el módulo que queda en el PY (norma:
// BOE-A-2026-510, anexo III C). Las fechas entran por `ahora`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  limites, estadoFrente, fallosPorMateria, lineaMateria, textoFallos, fotoPrediccion, tocaFoto, leerFoto, leerResultado,
  modulosAprobados, aptoCompleto, compararPrediccion, textoComparacion, moduloPendiente, testsDelModulo, lineaModuloPendiente,
} from '../src/course/tras-examen.js';
import { leerAjuste, guardarFoto, apuntarResultado, descartarModulo, responderComoFue, planSemana, claveSemana } from '../src/course/semana.js';
import { estadoAlumno } from '../src/course/motor.js';
import { PER, PY } from '../src/theory/blocks.js';
import { sumaDiasISO } from '../src/course/calendario.js';

const ahora = new Date(2026, 10, 10, 12).getTime(); // martes 10 de noviembre de 2026, mediodía local
const porTema = (E, fallos) => E.bloques.map((b) => ({ ut: b.ut, aciertos: b.n - (fallos[b.ut] ?? 0), total: b.n }));
const sim = (E, fallos, o = {}) => ({ tipo: 'simulacro', apto: true, porTema: porTema(E, fallos), ...o });

test('límites: PY con Teoría 5 y Carta 3; Seguridad y Meteorología solo por módulos (5 y 5); total 12', () => {
  const L = limites(PY);
  assert.equal(L.maxTotal, 12);
  assert.deepEqual(L.materias.map((m) => [m.ut, m.limite, m.limiteModulo]), [[1, null, 5], [2, null, 5], [3, 5, null], [4, 3, null]]);
  assert.equal(limites(PER).maxTotal, 13);
});

test('estado frente al límite: holgado, justo (a uno o menos) y pasado (alguna vez por encima)', () => {
  assert.equal(estadoFrente([], 3), null);
  assert.equal(estadoFrente([1, 0], 3), 'holgado');
  assert.equal(estadoFrente([2, 1], 3), 'justo');
  assert.equal(estadoFrente([4, 1], 3), 'pasado');
  assert.equal(estadoFrente([4], null), null);
});

test('fallos por materia: los 3 últimos exámenes, el más reciente primero; solo materias completas y tipos de examen', () => {
  const tests = [
    sim(PY, { 4: 9 }), // el más antiguo: queda fuera (solo 3)
    sim(PY, { 1: 1, 2: 2, 3: 3, 4: 2 }),
    { tipo: 'errores', porTema: porTema(PY, { 4: 10 }) }, // el simulacro de tus errores no cuenta
    { tipo: 'modulo', modulo: 'navegacion', apto: null, aptoModulo: false, porTema: porTema(PY, { 3: 6, 4: 4 }).filter((p) => p.ut >= 3) },
    { tipo: 'tanda', porTema: [{ ut: 4, aciertos: 0, total: 5 }] }, // no es examen
    sim(PY, { 1: 0, 2: 1, 3: 2, 4: 1 }),
  ];
  const r = fallosPorMateria(PY, tests);
  const m = Object.fromEntries(r.materias.map((x) => [x.ut, x]));
  assert.deepEqual(m[4].fallos, [1, 4, 2]);
  assert.equal(m[4].estado, 'pasado');
  assert.deepEqual(m[3].fallos, [2, 6, 3]);
  assert.deepEqual(m[1].fallos, [0, 1, 9 - 9], 'el módulo de navegación no trae Seguridad: se mira el anterior');
  assert.equal(m[1].estado, 'holgado');
  assert.deepEqual(r.total.fallos, [4, 8, 9], 'el total, solo con exámenes completos');
  assert.equal(r.total.estado, 'holgado');
  assert.equal(r.examenes, 3);
  assert.match(lineaMateria(m[4]), /^Carta: fallaste 1, 4 y 2 .*el límite es 3: te has pasado alguna vez\.$/);
  assert.match(lineaMateria(m[1]), /el límite es 5 si te examinas por módulos/);
  assert.match(textoFallos(r), /Fallos en total: 4, 8 y 9; como mucho 12/);
  assert.equal(fallosPorMateria(PY, []).examenes, 0);
  assert.match(lineaMateria(fallosPorMateria(PY, []).materias[0]), /aún sin examen completo/);
});

test('fallos por materia de un módulo: sus límites de módulo', () => {
  const r = fallosPorMateria({ ...PY, bloques: PY.bloques.filter((b) => b.ut <= 2).map((b) => ({ ...b, maxErrores: 5 })), minAciertos: 10, modulos: undefined }, [sim(PY, { 1: 5, 2: 4 })]);
  assert.deepEqual(r.materias.map((m) => [m.limite, m.estado]), [[5, 'justo'], [5, 'justo']]);
});

test('la foto: hasta la víspera, una vez al día (se queda la última), y se normaliza al leerla', () => {
  const fm = fallosPorMateria(PY, [sim(PY, { 1: 1, 2: 2, 3: 3, 4: 2 })]);
  const listo = { estado: 'casi', prob: 0.6789, margen: { bajo: 0.5, alto: 0.8 }, limitante: { ut: 4 } };
  const foto = fotoPrediccion(listo, fm, ahora);
  assert.deepEqual(foto, { dia: '2026-11-10', estado: 'casi', prob: 0.68, bajo: 0.5, alto: 0.8, limitante: 4, modulo: null, materias: { 1: 1, 2: 2, 3: 3, 4: 2 } });
  assert.equal(tocaFoto({}, '2026-11-14', 4, ahora), true);
  assert.equal(tocaFoto({ '2026-11-14': { dia: '2026-11-10' } }, '2026-11-14', 4, ahora), false, 'ya hecha hoy');
  assert.equal(tocaFoto({ '2026-11-14': { dia: '2026-11-09' } }, '2026-11-14', 4, ahora), true, 'la de ayer se sustituye');
  assert.equal(tocaFoto({}, '2026-11-10', 0, ahora), false, 'el día del examen no');
  assert.equal(tocaFoto({}, null, 3, ahora), false);
  assert.equal(leerFoto({ dia: 'ayer' }), null);
  assert.deepEqual(leerFoto({ dia: '2026-11-10', prob: 3, materias: { 4: 2, x: 1, 3: -1 } }).materias, { 4: 2 });
  // En el ajuste compartido: se guarda normalizada y solo las de los 6 últimos exámenes.
  let a = null;
  for (let i = 0; i < 8; i++) a = guardarFoto(a, sumaDiasISO('2026-01-10', i * 30), foto);
  assert.equal(Object.keys(leerAjuste(a).fotos).length, 6);
  assert.ok(!leerAjuste(a).fotos['2026-01-10']);
});

test('resultado: fallos válidos por materia y módulo; con ellos se sabe qué módulos y si el completo', () => {
  assert.deepEqual(leerResultado({ fallos: { 1: 3, 2: 11, 3: 'x', 9: 1 }, modulo: 'raro' }, PY), { fallos: { 1: 3 }, modulo: null });
  assert.deepEqual(leerResultado({ fallos: { 4: 2 }, modulo: 'generico' }, PY), { fallos: { 4: 2 }, modulo: 'generico' });
  assert.equal(leerResultado(null), null);
  assert.deepEqual(modulosAprobados(PY, { 1: 4, 2: 5, 3: 6, 4: 2 }).map((m) => [m.id, m.aprobado]), [['generico', true], ['navegacion', false]]);
  assert.deepEqual(modulosAprobados(PY, { 1: 4 }).map((m) => m.aprobado), [null, null], 'falta Meteorología');
  assert.equal(modulosAprobados(PER, {}), null);
  assert.equal(aptoCompleto(PY, { 1: 4, 2: 5, 3: 6, 4: 2 }), false, 'Teoría por encima de 5');
  assert.equal(aptoCompleto(PY, { 1: 4, 2: 4, 3: 3, 4: 1 }), true);
  assert.equal(aptoCompleto(PY, { 1: 6, 2: 5, 3: 1, 4: 1 }), false, '13 fallos en total');
  assert.equal(aptoCompleto(PY, { 1: 1 }), null);
});

test('comparación: la app acierta si avisó de ir justo donde fuiste justo (o te pasaste) y no avisó donde no', () => {
  const foto = { dia: '2026-11-13', prob: 0.7, estado: 'casi', materias: { 1: 2, 2: 3, 3: 4, 4: 1 } };
  const c = compararPrediccion(PY, foto, { fallos: { 1: 1, 2: 2, 3: 5, 4: 3 } });
  const f = Object.fromEntries(c.filas.map((x) => [x.ut, x]));
  assert.equal(f[3].avisada, true); assert.equal(f[3].acierto, true); // avisó (4 de 5) y fue justo (5)
  assert.equal(f[4].avisada, false); assert.equal(f[4].acierto, false); // no avisó (1 de 3) y fue justo (3)
  assert.equal(f[4].pasada, false);
  assert.equal(f[1].acierto, true, 'Seguridad se mide con el límite de módulo');
  assert.equal(c.comparables, 4);
  assert.equal(c.aciertos, 3);
  const t = textoComparacion('PY', '2026-11-14', 'No aprobé', c, { modulo: 'generico' });
  assert.match(t, /^Examen PY del 2026-11-14: No aprobé\.\nPredicción del 2026-11-13: aprobarías 7 de cada 10 \(casi\)\./);
  assert.match(t, /Carta \(fallos\): previsto 1 · real 3 · límite 3 · la app no acertó/);
  assert.match(t, /Módulo aprobado: generico\./);
  const sinFoto = compararPrediccion(PY, null, { fallos: { 4: 2 } });
  assert.equal(sinFoto.comparables, 0);
  assert.equal(sinFoto.prob, null);
});

test('módulo pendiente: solo con «No aprobé» y un módulo aprobado; se va al aprobar, al descartarlo o sin módulos', () => {
  let a = responderComoFue(null, '2026-11-14', 'suspenso');
  assert.equal(moduloPendiente(leerAjuste(a), PY), null, 'sin resultado');
  a = apuntarResultado(a, '2026-11-14', { fallos: {}, modulo: 'generico' });
  const p = moduloPendiente(leerAjuste(a), PY);
  assert.deepEqual(p, { id: 'navegacion', titulo: 'Módulo de navegación', aprobado: { id: 'generico', titulo: 'Módulo genérico' }, desde: '2026-11-14' });
  assert.equal(lineaModuloPendiente(p), 'Aprobaste el módulo genérico: te queda el módulo de navegación. Te guardan el aprobado 2 convocatorias de PY más, y solo en el tribunal donde te examinaste.');
  assert.equal(moduloPendiente(leerAjuste(a), PER), null, 'el PER no tiene módulos');
  assert.equal(moduloPendiente(leerAjuste(descartarModulo(a, '2026-11-14')), PY), null, 'descartado');
  assert.ok(moduloPendiente(leerAjuste(apuntarResultado(descartarModulo(a, '2026-11-14'), '2026-11-14', { fallos: {}, modulo: 'generico' })), PY), 'al volver a apuntarlo, vuelve');
  assert.equal(moduloPendiente(leerAjuste(apuntarResultado(a, '2026-11-14', { modulo: 'ninguno' })), PY), null);
  assert.equal(moduloPendiente(leerAjuste(responderComoFue(a, '2027-04-17', 'aprobado')), PY), null, 'aprobado después');
  assert.ok(moduloPendiente(leerAjuste(responderComoFue(a, '2027-04-17', 'no-se')), PY), 'sin saber la nota siguiente, sigue');
  const ts = testsDelModulo([{ tipo: 'modulo', modulo: 'navegacion', apto: null, aptoModulo: true }, { tipo: 'modulo', modulo: 'generico', aptoModulo: false }, { tipo: 'simulacro', apto: true }], 'navegacion');
  assert.deepEqual(ts.map((t) => t.apto), [true]);
});

test('semana con un módulo pendiente: el simulacro es solo el de ese módulo, nunca el completo ni el final', () => {
  const EX = '2027-04-17';
  const p = planSemana({ estructura: PY, dias: 7, hoy: sumaDiasISO(EX, -7), fecha: EX, minutosDia: 200, ideas: [], temas: [], cartaUt: 4, tests: [], hechos: {}, finalSugerido: true, soloModulo: 'navegacion' });
  assert.deepEqual(p.simulacro.pendientes, ['navegacion']);
  assert.equal(p.porModulos, true);
  const hecho = planSemana({ estructura: PY, dias: 5, hoy: sumaDiasISO(EX, -5), fecha: EX, minutosDia: 200, ideas: [], temas: [], cartaUt: 4,
    tests: [{ tipo: 'simulacro', t: new Date(2027, 3, 11, 12).toISOString(), apto: true }], hechos: {}, soloModulo: 'navegacion' });
  assert.deepEqual(hecho.simulacro.pendientes, ['navegacion'], 'un simulacro completo no sustituye al del módulo');
  const sinSolo = planSemana({ estructura: PY, dias: 7, hoy: sumaDiasISO(EX, -7), fecha: EX, minutosDia: 200, ideas: [], temas: [], cartaUt: 4, tests: [], hechos: {} });
  assert.deepEqual(sinSolo.simulacro.pendientes, ['completo']);
});

test('motor: con un módulo pendiente, «¿Estás listo?» es el del módulo y lo dice', () => {
  const preguntas = PY.bloques.flatMap((b) => Array.from({ length: 30 }, (_, i) => ({ id: `q${b.ut}-${i}`, ut: b.ut, correcta: 'a' })));
  const respuestas = Object.fromEntries(preguntas.map((q, i) => [q.id, { ok: i % 5 !== 0, t: new Date(ahora - 864e5).toISOString() }]));
  const ajuste = apuntarResultado(responderComoFue(null, '2026-11-07', 'suspenso'), '2026-11-07', { fallos: {}, modulo: 'generico' });
  const e = { tit: 'py', estructura: PY, curso: null, preguntas, regs: {}, respuestas, tests: [], minutosHoy: 0, racha: 0, planGuardado: null, ahora };
  const con = estadoAlumno({ ...e, settings: { [claveSemana('py')]: ajuste } });
  assert.equal(con.moduloPendiente?.id, 'navegacion');
  assert.equal(con.listo.modulo, 'navegacion');
  assert.deepEqual(con.listo.temas.map((t) => t.ut), [3, 4]);
  const sin = estadoAlumno({ ...e, settings: {} });
  assert.equal(sin.moduloPendiente, null);
  assert.deepEqual(sin.listo.temas.map((t) => t.ut), [1, 2, 3, 4]);
  assert.equal(sin.listo.modulo, undefined);
});
