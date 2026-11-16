// Tu examen oficial, apuntado (R-60; src/course/examen-oficial.js): qué convocatorias se pueden apuntar, la hoja por
// módulos, el resultado por materia, los fallos por tipo y que una convocatoria hecha salga de la reserva del alumno y
// entre en su estudio (reservaEfectiva, src/bancos/index.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  convocatoriasApuntables, marcarHecha, partesApuntables, estructuraParte, preguntasParte, hojasDe, resultadoDe,
  fallosAgrupados, oficialApuntado, claveHechas, DIAS_OFICIAL,
} from '../src/course/examen-oficial.js';
import { PREFIJOS_COMPARTIDOS, PREFIJOS_PRIMERO } from '../src/store/sync/operaciones.js';
import { crearBancos } from '../src/bancos/index.js';
import { PY, PER } from '../src/theory/blocks.js';
import { grade } from '../src/theory/engine.js';

test('se pueden apuntar las convocatorias celebradas en los últimos 120 días, la más reciente primero', () => {
  const convs = [{ key: 'a', fecha: '2026-06-13' }, { key: 'b', fecha: '2026-11-14' }, { key: 'c', fecha: '2026-12-01' }, { key: 'd', fecha: null }, { key: 'e', fecha: '2026-07-20' }];
  assert.equal(DIAS_OFICIAL, 120);
  assert.deepEqual(convocatoriasApuntables(convs, '2026-11-16').map((c) => c.key), ['b', 'e']);
  assert.deepEqual(convocatoriasApuntables(convs, '2026-11-14').map((c) => c.key), ['b', 'e'], 'el mismo día del examen');
  assert.deepEqual(convocatoriasApuntables(convs, 'mañana'), []);
});

test('marcar una convocatoria como hecha: lista sin repetir, en su propio ajuste (la foto de la reserva no cambia)', () => {
  assert.deepEqual(marcarHecha(['x1'], 'x2'), ['x1', 'x2']);
  assert.deepEqual(marcarHecha(['x1', 'x2'], 'x2'), ['x1', 'x2']);
  assert.deepEqual(marcarHecha(null, 'x3'), ['x3']);
  assert.deepEqual(marcarHecha([1, 'x1'], 'x3'), ['x1', 'x3']);
  assert.equal(claveHechas('andalucia', 'py'), 'hechas_andalucia_py');
  assert.ok(PREFIJOS_COMPARTIDOS.includes('hechas_') && !PREFIJOS_PRIMERO.includes('hechas_'), 'se comparte entre aparatos y gana el último');
});

test('PY: se apunta el examen entero o un módulo suelto; una hoja de 20 por módulo, numerada desde 1', () => {
  assert.deepEqual(partesApuntables(PY).map((p) => p.id), ['completo', 'generico', 'navegacion']);
  assert.deepEqual(partesApuntables(PER).map((p) => p.id), ['completo']);
  const qs = PY.bloques.flatMap((b) => Array.from({ length: b.n }, (_, i) => ({ id: `${b.ut}-${i}`, ut: b.ut })));
  const hs = hojasDe(qs, PY);
  assert.deepEqual(hs.map((x) => [x.id, x.preguntas.length, x.desde]), [['generico', 20, 0], ['navegacion', 20, 20]]);
  const nav = preguntasParte(qs, PY, 'navegacion');
  assert.equal(nav.length, 20);
  assert.deepEqual(hojasDe(nav, PY).map((x) => [x.id, x.desde]), [['navegacion', 0]], 'un módulo suelto: su hoja, desde 1');
  assert.equal(hojasDe(qs.slice(0, 5), PER)[0].id, 'unica');
});

/** Un examen del PY con los fallos dados por tema: las primeras preguntas de cada tema, falladas. */
function examenPY(fallos) {
  const preguntas = PY.bloques.flatMap((b) => Array.from({ length: b.n }, (_, i) => ({ id: `q${b.ut}-${i}`, ut: b.ut, correcta: 'a', aceptadas: ['a'], opciones: { a: '1', b: '2', c: '3', d: '4' } })));
  const respuestas = Object.fromEntries(preguntas.map((q) => [q.id, Number(q.id.split('-')[1]) < (fallos[q.ut] ?? 0) ? 'b' : 'a']));
  const test = { tipo: 'real', preguntas };
  return { test, g: grade(PY, test, respuestas) };
}

test('el resultado por materia del examen de verdad: genérico aprobado y carta suspendida (14 de noviembre de 2026)', () => {
  // Seguridad 2, Meteorología 2, Teoría de navegación 2, Carta 5 (límite 3): no apto, genérico aprobado.
  const { g } = examenPY({ 1: 2, 2: 2, 3: 2, 4: 5 });
  assert.equal(g.apto, false);
  assert.deepEqual(resultadoDe(PY, g), { fallos: { 1: 2, 2: 2, 3: 2, 4: 5 }, modulo: 'generico' });
  assert.equal(resultadoDe(PY, examenPY({ 1: 6, 4: 4 }).g).modulo, 'ninguno');
  // Solo el módulo de navegación: se sabe si se aprueba ese, no el otro.
  const E = estructuraParte(PY, 'navegacion');
  const qs = examenPY({ 3: 1, 4: 2 }).test.preguntas.filter((q) => q.ut >= 3);
  const gn = grade(E, { tipo: 'real', preguntas: qs }, Object.fromEntries(qs.map((q) => [q.id, Number(q.id.split('-')[1]) < ({ 3: 1, 4: 2 })[q.ut] ? 'b' : 'a'])));
  assert.deepEqual(resultadoDe(PY, gn), { fallos: { 3: 1, 4: 2 }, modulo: 'navegacion' });
});

test('los fallos se agrupan por tipo de problema (carta) o por materia (teoría), el grupo con más fallos primero', () => {
  const { test, g } = examenPY({ 1: 1, 4: 3 });
  const tipos = { 'q4-0': 'mareas', 'q4-1': 'mareas', 'q4-2': 'loxodromica' };
  const grupos = fallosAgrupados(test.preguntas, g.detalle, {
    tipoDe: (q) => tipos[q.id] ?? 'teoria', nombreTipo: (t) => t.toUpperCase(), materiaDe: (q) => `UT ${q.ut}`, numeroDe: (i) => String(i + 1),
  });
  assert.deepEqual(grupos.map((x) => [x.titulo, x.fallos.length, x.carta]), [['MAREAS', 2, true], ['LOXODROMICA', 1, true], ['UT 1', 1, false]]);
  assert.deepEqual(grupos[0].fallos[0], { id: 'q4-0', numero: '31', marcada: 'b', correcta: 'a' });
});

test('el examen oficial ya apuntado de una convocatoria es el último con esa convocatoria', () => {
  const ts = [{ tipo: 'real', conv: 'c3', aciertos: 1 }, { tipo: 'real', oficial: true, conv: 'c3', aciertos: 29 }, { tipo: 'real', oficial: true, conv: 'c2', aciertos: 30 }];
  assert.equal(oficialApuntado(ts, 'c3').aciertos, 29);
  assert.equal(oficialApuntado(ts, 'c9'), null);
});

test('una convocatoria reservada que el alumno ya hizo sale de su examen final y entra en su estudio', async () => {
  const q = (id, conv) => ({ id, eje: 'x', tit: 'py', conv, convocatoria: conv, fecha: `${conv.slice(2)}-15`, numero: 1, orden: 1, ut: 1, opciones: { a: '1', b: '2' }, correcta: 'a', aceptadas: ['a'], anulada: false, requiere: [], apareceEn: [{ conv }] });
  const preguntas = [q('x-1', 'x-2025-06'), q('x-2', 'x-2026-06'), q('x-3', 'x-2026-11')];
  const d = {
    'data/ejes/index.json': { ejes: [{ id: 'x', prefijo: 'x', nombre: 'X', estado: 'publicado' }] },
    'data/ejes/x/eje.json': { id: 'x', nombre: 'X', prefijo: 'x', examen: { py: {} }, reserva: { modo: 'examen', py: ['x-2026-06', 'x-2026-11'] } },
    'data/ejes/x/py/preguntas.json': { meta: { eje: 'x', tit: 'py' }, preguntas },
  };
  const leer = async (ruta) => { if (!(ruta in d)) throw new Error(ruta); return d[ruta]; };
  const ajustes = {};
  const alumno = { leer: (e, t) => ajustes[`reserva_${e}_${t}`] ?? null, guardar: (e, t, foto) => { ajustes[`reserva_${e}_${t}`] = foto; }, hechas: (e, t) => ajustes[claveHechas(e, t)] ?? [] };
  const b = crearBancos(leer);
  b.fijarReservaAlumno(alumno);
  const antes = await b.cargarBanco('x', 'py');
  assert.deepEqual(antes.estudio.map((x) => x.id), ['x-1']);
  assert.deepEqual(antes.convocatoriasTodas().map((c) => c.key).sort(), ['x-2025-06', 'x-2026-06', 'x-2026-11'], 'para apuntar se ven todas');
  const foto = ajustes.reserva_x_py;
  ajustes.hechas_x_py = marcarHecha(ajustes.hechas_x_py, 'x-2026-11');
  const despues = await b.cargarBanco('x', 'py');
  assert.deepEqual(despues.estudio.map((x) => x.id), ['x-1', 'x-3']);
  assert.deepEqual(despues.final.map((x) => x.id), ['x-2']);
  assert.deepEqual(despues.reserva.hechas, ['x-2026-11']);
  assert.ok(despues.convocatorias().some((c) => c.key === 'x-2026-11'), 'se puede repetir como examen de convocatoria');
  // La foto de la reserva no se toca (en ella gana el primer valor entre aparatos).
  assert.deepEqual(ajustes.reserva_x_py, foto);
});
