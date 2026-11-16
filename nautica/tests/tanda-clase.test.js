// La tanda de práctica de una clase se retoma donde se dejó (src/course/tanda-clase.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tandaAMedias, CLAVE_TANDA } from '../src/course/tanda-clase.js';
import { esAjusteCompartido } from '../src/store/sync/operaciones.js';

const est = new Set(['a', 'b', 'c']);
const t = { leccion: 'py-2-5', ids: ['a', 'b', 'c'], i: 2, ok: 1, dia: '2026-11-16' };

test('se retoma la tanda a medias de la misma clase, en la pregunta donde se quedó', () => {
  assert.deepEqual(tandaAMedias(t, 'py-2-5', est, '2026-11-17'), { ids: ['a', 'b', 'c'], i: 2, ok: 1 });
});

test('no se retoma si es de otra clase, vieja, terminada o con preguntas que ya no están', () => {
  assert.equal(tandaAMedias(t, 'py-2-6', est, '2026-11-17'), null);
  assert.equal(tandaAMedias(t, 'py-2-5', est, '2026-11-25'), null);
  assert.equal(tandaAMedias({ ...t, i: 3 }, 'py-2-5', est, '2026-11-17'), null);
  assert.equal(tandaAMedias(t, 'py-2-5', new Set(['a', 'b']), '2026-11-17'), null);
  assert.equal(tandaAMedias(null, 'py-2-5', est), null);
  assert.equal(tandaAMedias({ ...t, ok: 9 }, 'py-2-5', est, '2026-11-17').ok, 2, 'nunca más aciertos que respondidas');
});

test('es un ajuste del aparato: no se comparte entre aparatos', () => {
  assert.equal(esAjusteCompartido(CLAVE_TANDA), false);
});
