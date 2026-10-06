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

test('preguntas intercaladas: nunca más de 3 tarjetas seguidas sin responder (si hay preguntas), sin repetir', async () => {
  const { conPreguntasIntercaladas, CADA } = await import('../src/course/engine.js');
  const t = (i) => ({ tipo: 'texto', texto: `t${i}` });
  const reales = Array.from({ length: 6 }, (_, i) => ({ id: `q${i}`, enunciado: `¿${i}?`, opciones: { a: 'x', b: 'y' }, correcta: 'a' }));
  const final = { tipo: 'check', real: reales[0], enunciado: '¿0?', opciones: {}, correcta: 'a' };
  const pasos = [...Array.from({ length: 10 }, (_, i) => t(i)), final];
  const r = conPreguntasIntercaladas(pasos, reales, createRng(3));
  let seguidas = 0;
  for (const p of r) { seguidas = p.tipo === 'check' ? 0 : seguidas + 1; assert.ok(seguidas <= CADA); }
  const ids = r.filter((p) => p.real).map((p) => p.real.id);
  assert.equal(new Set(ids).size, ids.length, 'no repite preguntas');
  assert.equal(r.at(-1), final, 'la final sigue al final');
  assert.deepEqual(conPreguntasIntercaladas(pasos, [], createRng(1)), pasos, 'sin preguntas, igual');
  // una lámina que pide predicción ya cuenta como respuesta
  const conLamina = [t(1), t(2), { tipo: 'ilustracion', prediccion: true }, t(3), t(4), final];
  assert.equal(conPreguntasIntercaladas(conLamina, reales, createRng(1)).length, conLamina.length);
});
