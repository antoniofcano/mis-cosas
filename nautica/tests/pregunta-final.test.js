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

test('tramos de clase: unas 7 tarjetas cada uno, seguidos, sin tramos vacíos; ritmo medido', async () => {
  const { numTramos, enTramos, tarjetasDe, minutosTramo, nuevoRitmo } = await import('../src/course/engine.js');
  assert.equal(tarjetasDe(21), 31);
  assert.equal(numTramos(21), 4, '31 tarjetas → 4 tramos de unas 8');
  assert.equal(numTramos(3), 1);
  assert.equal(numTramos(2), 1, 'nunca más tramos que pasos');
  assert.equal(minutosTramo(8, 45), 6);
  assert.equal(nuevoRitmo(40, 8, 8 * 60000), 46, 'media móvil hacia el ritmo real');
  assert.equal(nuevoRitmo(40, 2, 3600000), Math.round(0.7 * 40 + 0.3 * 120), 'una pantalla olvidada abierta cuenta como mucho 120 s por tarjeta');
  assert.equal(nuevoRitmo(40, 8, 8 * 70000), Math.round(0.7 * 40 + 0.3 * 70));
  const pasos = Array.from({ length: 11 }, (_, i) => ({ tipo: 'texto', texto: 'x'.repeat(100 + 40 * (i % 4)) }));
  for (const k of [1, 2, 3, 5, 11]) {
    const t = enTramos(pasos, k).map((p) => p.tramo);
    assert.deepEqual([...new Set(t)], Array.from({ length: k }, (_, i) => i), `k=${k}: ${t}`);
    assert.ok(t.every((x, i) => i === 0 || x >= t[i - 1]), 'seguidos');
  }
});

test('ejercicios: «Toca» tras láminas con partes y «Empareja» con los términos de la clase', async () => {
  const { conEjercicios, definicionCorta, pistaParte } = await import('../src/course/engine.js');
  const t = [
    { id: 'escora', termino: 'Escora', definicion: 'Inclinación del barco hacia una banda. Más texto.' },
    { id: 'balance', termino: 'Balance', definicion: 'Oscilación de banda a banda.' },
    { id: 'asiento', termino: 'Asiento', definicion: 'Diferencia de calados.' },
  ];
  assert.equal(definicionCorta('Inclinación del barco hacia una banda. Más texto.'), 'Inclinación del barco hacia una banda');
  assert.equal(pistaParte('G, centro de gravedad: donde se concentra el peso del barco. Sube si…'), 'donde se concentra el peso del barco');
  const final = { tipo: 'check', enunciado: '?', opciones: {}, correcta: 'a' };
  const pasos = [{ tipo: 'texto', texto: 'x' }, { tipo: 'ilustracion', spec: { tipo: 'estabilidad' } }, final];
  const r = conEjercicios(pasos, { terminos: t, partesDe: () => [['g', 'G', 'peso'], ['b', 'B', 'empuje'], ['m', 'M', 'metacentro']] });
  assert.deepEqual(r.map((p) => p.tipo), ['texto', 'ilustracion', 'toca', 'emparejar', 'check']);
  assert.deepEqual(conEjercicios(pasos, { terminos: t.slice(0, 2) }).map((p) => p.tipo), ['texto', 'ilustracion', 'check'], 'con menos de 3 términos o sin partes, nada');
});

test('«Empareja»: cada clase declara 3 o 4 términos que existen y no se delatan entre sí', async () => {
  const { readFileSync } = await import('node:fs');
  const voc = (t) => JSON.parse(readFileSync(new URL(`../data/exams/vocabulario-${t}.json`, import.meta.url), 'utf8')).terminos;
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const tit of ['per', 'py']) {
    const porId = new Map((tit === 'py' ? [...voc('per'), ...voc('py')] : voc('per')).map((x) => [x.id, x]));
    const curso = JSON.parse(readFileSync(new URL(`../data/curso/${tit}.json`, import.meta.url), 'utf8'));
    for (const l of curso.modulos.flatMap((m) => m.lecciones)) {
      const ids = l.terminos ?? [];
      if (!ids.length) continue;
      assert.ok(ids.length >= 3 && ids.length <= 4, `${l.id}: ${ids.length} términos`);
      assert.equal(new Set(ids).size, ids.length, `${l.id}: repetidos`);
      const ts = ids.map((id) => { const x = porId.get(id); assert.ok(x?.definicion, `${l.id}: «${id}» no está en el vocabulario`); return x; });
      for (const a of ts) for (const b of ts) {
        if (a === b) continue;
        for (const f of [b.termino, ...(b.formas ?? [])]) assert.ok(!new RegExp(`(^|[^a-zñ])${norm(f).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-zñ]|$)`).test(norm(a.definicion)), `${l.id}: la definición de «${a.termino}» delata «${b.termino}»`);
      }
    }
  }
});
