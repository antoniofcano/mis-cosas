// Elegir eje («¿Dónde te examinas?»), exámenes de convocatoria con varios juegos y preguntas que se repiten entre
// convocatorias, y las preguntas equivalentes entre ejes (pausas del podcast).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { crearBancos } from '../src/bancos/index.js';
import { equivalenteEn, parecido } from '../src/bancos/equivalentes.js';
import { buildReal, convocatorias, ordenEn, convDeClave, testDesdeIds } from '../src/theory/engine.js';
import { PER } from '../src/theory/blocks.js';
import { RAIZ, leerJSON } from '../tools/bancos/leer.mjs';

const leer = (d) => async (ruta) => { if (!(ruta in d)) throw new Error(ruta); return d[ruta]; };
const ficha = (id, nombre, estado, ambito = []) => ({ id, nombre, prefijo: id, estado, ambito, examen: { per: {} }, reserva: { modo: 'examen' } });

test('dónde te examinas: solo los ejes publicados, y nada que elegir si hay uno solo', async () => {
  const datos = (estados) => ({
    'data/ejes/index.json': { ejes: estados.map(([id, e]) => ({ id, prefijo: id, nombre: id.toUpperCase(), estado: e })) },
    ...Object.fromEntries(estados.map(([id, e]) => [`data/ejes/${id}/eje.json`, ficha(id, id.toUpperCase(), e, [`Ámbito ${id}`])])),
  });
  // Uno publicado y otro interno: no se pregunta (y el interno no aparece nunca).
  assert.deepEqual(await crearBancos(leer(datos([['a', 'publicado'], ['b', 'interno']]))).ejesParaElegir(), []);
  // Dos publicados y un borrador: se eligen los dos publicados, con su ficha.
  const dos = await crearBancos(leer(datos([['a', 'publicado'], ['b', 'publicado'], ['c', 'borrador']]))).ejesParaElegir();
  assert.deepEqual(dos.map((e) => e.id), ['a', 'b']);
  assert.deepEqual(dos[1].ficha.ambito, ['Ámbito b']);
  // El registro real: Andalucía publicada, el eje de la DGMM solo si su ficha dice «publicado».
  const reg = leerJSON('data/ejes/index.json').ejes;
  const pub = reg.filter((e) => e.estado === 'publicado');
  const elegibles = await crearBancos((r) => Promise.resolve(JSON.parse(readFileSync(join(RAIZ, r), 'utf8')))).ejesParaElegir();
  assert.deepEqual(elegibles.map((e) => e.id), pub.length > 1 ? pub.map((e) => e.id) : []);
});

test('convocatoria con dos juegos de preguntas: un examen por juego (<conv>@<modelo>), en el orden de su modelo', () => {
  // Juego 1: T01 (1–3) ≡ T03 (barajado); juego 2: T02 (1–3) ≡ T04. La pregunta x-5 sale en los dos juegos.
  const q = (id, aps, extra = {}) => ({ id, conv: 'x-2025-11', convocatoria: 'Noviembre de 2025', fecha: '2025-11-22', ut: 1, numero: aps[0][1], orden: aps[0][1], apareceEn: aps.map(([modelo, numero, conv = 'x-2025-11']) => ({ conv, modelo, numero })), ...extra });
  const banco = [
    q('x-1', [['T01', 1], ['T03', 2]]), q('x-2', [['T01', 2], ['T03', 3]]), q('x-3', [['T01', 3], ['T03', 1]]),
    q('x-4', [['T02', 1], ['T04', 3]]), q('x-5', [['T02', 2], ['T04', 1], ['T01', 4], ['T03', 4]]), q('x-6', [['T02', 3], ['T04', 2]]),
  ];
  const est = { bloques: [{ ut: 1, n: 4 }] };
  const cs = convocatorias(est, banco);
  assert.deepEqual(cs.map((c) => [c.key, c.n, c.completa, c.titulo]), [
    ['x-2025-11@T01', 4, true, 'Noviembre de 2025 · Test 01'],
    ['x-2025-11@T02', 3, false, 'Noviembre de 2025 · Test 02'],
  ]);
  assert.deepEqual(buildReal(banco, 'x-2025-11@T01').preguntas.map((p) => p.id), ['x-1', 'x-2', 'x-3', 'x-5']);
  assert.deepEqual(buildReal(banco, 'x-2025-11@T02').preguntas.map((p) => p.id), ['x-4', 'x-5', 'x-6']);
  assert.equal(buildReal(banco, 'x-2025-11@T02').titulo, 'Noviembre de 2025 · Test 02');
  assert.equal(convDeClave('x-2025-11@T02'), 'x-2025-11');
  assert.equal(convDeClave('and-2023-c1'), 'and-2023-c1');
});

test('una pregunta que se repite en otra convocatoria sale también en el examen de esa convocatoria', () => {
  const banco = [
    { id: 'y-1', conv: 'y-2024', convocatoria: 'C 2024', fecha: '2024-01-01', orden: 1, numero: 1, ut: 1, apareceEn: [{ conv: 'y-2024', modelo: null, numero: 1 }, { conv: 'y-2025', modelo: null, numero: 2 }] },
    { id: 'y-2', conv: 'y-2025', convocatoria: 'C 2025', fecha: '2025-01-01', orden: 1, numero: 1, ut: 1, apareceEn: [{ conv: 'y-2025', modelo: null, numero: 1 }] },
  ];
  assert.equal(ordenEn(banco[0], 'y-2025'), 2);
  const real = buildReal(banco, 'y-2025');
  assert.deepEqual(real.preguntas.map((p) => p.id), ['y-2', 'y-1']);
  assert.equal(real.titulo, 'C 2025');
  assert.deepEqual(convocatorias({ bloques: [{ ut: 1, n: 2 }] }, banco).map((c) => [c.key, c.n]), [['y-2025', 2], ['y-2024', 1]]);
  // El examen a medias se rehace con su título aunque la primera pregunta sea de otra convocatoria.
  assert.equal(testDesdeIds('real', ['y-1', 'y-2'], new Map(banco.map((p) => [p.id, p])), 'y-2025').titulo, 'C 2025');
});

test('Andalucía no cambia: un examen por convocatoria con sus 45 preguntas (modelos A y B juntos)', () => {
  const per = leerJSON('data/ejes/andalucia/per/preguntas.json').preguntas;
  const cs = convocatorias(PER, per);
  assert.ok(cs.every((c) => !c.key.includes('@') && c.n === 45 && c.completa));
  for (const c of cs) assert.deepEqual(buildReal(per, c.key).preguntas.map((q) => q.id), per.filter((q) => q.conv === c.key).sort((a, b) => a.orden - b.orden).map((q) => q.id));
});

test('preguntas equivalentes entre ejes: por concepto, por parecido del texto o ninguna', () => {
  const base = { id: 'a-1', eje: 'a', ut: 5, concepto: null, enunciado: '¿Qué ritmo tiene la luz de una marca cardinal Sur?', opciones: { a: 'Ct(6)+Ld', b: 'Ct(3)', c: 'Ct(9)', d: 'Ct' }, correcta: 'a', anulada: false };
  const porConcepto = { id: 'b-7', eje: 'b', ut: 5, concepto: 'a-1', enunciado: 'Una cardinal S, ¿qué luz muestra?', opciones: { a: 'Blanca, 6 centelleos y uno largo', b: 'Roja', c: 'Verde', d: 'Amarilla' }, correcta: 'a', anulada: false };
  const parecida = { id: 'b-8', eje: 'b', ut: 5, concepto: null, enunciado: '¿Qué ritmo tiene la luz de una marca cardinal Sur?', opciones: { a: 'Ct(3)', b: 'Ct(6)+Ld', c: 'Ct(9)', d: 'Ct' }, correcta: 'b', anulada: false };
  const otra = { id: 'b-9', eje: 'b', ut: 6, concepto: null, enunciado: 'Un buque de vela ve por su proa a otro de propulsión mecánica', opciones: { a: 'x', b: 'y', c: 'z', d: 'w' }, correcta: 'a', anulada: false };
  assert.equal(equivalenteEn(base, [otra, parecida, porConcepto]).id, 'b-7');
  assert.equal(equivalenteEn(base, [otra, parecida]).id, 'b-8');
  assert.ok(parecido(base, parecida) > 0.9);
  assert.equal(equivalenteEn(base, [otra]), null);
  // Una anulada no sirve para el minijuego.
  assert.equal(equivalenteEn(base, [{ ...porConcepto, anulada: true, correcta: null }]), null);
});

test('pausas del podcast: la pregunta del eje del alumno, o la original con su tribunal si no hay equivalente', async () => {
  const q = (id, eje, extra = {}) => ({ id, eje, tit: 'per', conv: `${eje}-c`, ut: 5, numero: 1, orden: 1, concepto: null, enunciado: 'Ritmo de la cardinal Sur', opciones: { a: 'Ct(6)+Ld', b: 'Ct(3)' }, correcta: 'a', aceptadas: ['a'], anulada: false, requiere: [], apareceEn: [{ conv: `${eje}-c` }], ...extra });
  const datos = {
    'data/ejes/index.json': { ejes: [{ id: 'a', prefijo: 'a', nombre: 'A', estado: 'publicado' }, { id: 'b', prefijo: 'b', nombre: 'B', estado: 'publicado' }] },
    'data/ejes/a/eje.json': ficha('a', 'Tribunal A', 'publicado'),
    'data/ejes/b/eje.json': ficha('b', 'Tribunal B', 'publicado'),
    'data/ejes/a/per/preguntas.json': { meta: {}, preguntas: [q('a-1', 'a'), q('a-2', 'a', { ut: 9, enunciado: 'Isobaras y viento geostrófico', opciones: { a: 'paralelo', b: 'perpendicular' } })] },
    'data/ejes/b/per/preguntas.json': { meta: {}, preguntas: [q('b-1', 'b', { concepto: 'a-1', enunciado: 'Luz de la marca cardinal S' })] },
  };
  const b = crearBancos(leer(datos));
  const r1 = await b.equivalente('a-1', 'b');
  assert.deepEqual([r1.q.id, r1.propia, r1.equivalente], ['b-1', true, true]);
  const r2 = await b.equivalente('a-2', 'b');
  assert.deepEqual([r2.q.id, r2.propia, r2.ficha.nombre], ['a-2', false, 'Tribunal A']);
  const r3 = await b.equivalente('a-1', 'a');
  assert.deepEqual([r3.q.id, r3.propia, r3.equivalente], ['a-1', true, false]);
  assert.equal(await b.equivalente('zz-1', 'a'), null);
});

test('los datos del podcast no cambian: citan preguntas que existen', async () => {
  const b = crearBancos((r) => Promise.resolve(JSON.parse(readFileSync(join(RAIZ, r), 'utf8'))));
  const { readdirSync } = await import('node:fs');
  const ids = new Set();
  for (const f of readdirSync(join(RAIZ, 'data/podcast'))) for (const t of leerJSON(`data/podcast/${f}`).tramos ?? []) if (t.p) ids.add(t.p);
  for (const id of ids) assert.ok(await b.pregunta(id), id);
});
