import { test } from 'node:test';
import assert from 'node:assert/strict';
import { conPreguntaFinal } from '../src/course/engine.js';
import { createRng } from '../src/math/rng.js';

const fija = { tipo: 'check', enunciado: '¿Fija?', opciones: { a: 'x', b: 'y' }, correcta: 'a' };
const reales = ['q1', 'q2', 'q3', 'q4'].map((id) => ({ id, enunciado: id, opciones: { a: '1', b: '2' }, correcta: 'b' }));

test('la pregunta final de la clase sale al azar entre las reales y sustituye a la fija', () => {
  const pasos = [{ tipo: 'texto', texto: 'hola' }, fija];
  const vistas = new Set();
  for (let s = 1; s <= 40; s++) {
    const r = conPreguntaFinal(pasos, reales, createRng(s));
    assert.equal(r.length, 2);
    assert.equal(r[0], pasos[0]);
    assert.ok(r[1].real && reales.includes(r[1].real));
    vistas.add(r[1].real.id);
  }
  assert.ok(vistas.size >= 3, 'cambia de una vez a otra');
});

test('sin pregunta fija al final se añade; sin preguntas reales la clase queda igual', () => {
  const pasos = [{ tipo: 'texto', texto: 'hola' }];
  assert.equal(conPreguntaFinal(pasos, reales, createRng(1)).length, 2);
  assert.equal(conPreguntaFinal([fija], [], createRng(1))[0], fija);
});
