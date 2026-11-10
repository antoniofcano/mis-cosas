// La práctica de una clase solo lleva preguntas de su tema (el bloque del examen en que salió cada pregunta): estudiando
// una clase de Nomenclatura no debe salir una pregunta del bloque de Seguridad. Las únicas que siguen en una clase de
// otro tema son las excepciones de tools/bancos/practica-excepciones.json, una a una y con su motivo.
// Criterios y herramienta: tools/bancos/lib/practica-tema.mjs y tools/bancos/practica-tema.mjs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { contexto, fueraDeTema, recolocar, elegirClase, RUTA_EXCEPCIONES } from '../tools/bancos/lib/practica-tema.mjs';
import { bancos, textoComo } from '../tools/bancos/practica-tema.mjs';
import { RAIZ, leerJSON } from '../tools/bancos/leer.mjs';

const TIPOS = ['tema-dudoso', 'clase-corta'];

for (const { eje, tit } of bancos()) {
  test(`eje ${eje} · ${tit}: ninguna pregunta de la práctica de una clase es de otro tema (salvo las excepciones listadas)`, () => {
    const ctx = contexto(eje, tit);
    const practica = leerJSON(`data/ejes/${eje}/${tit}/practica.json`);
    const fuera = fueraDeTema(ctx, practica).map((f) => `${f.id} (tema ${f.ut}) en ${f.clases.join(', ')}`);
    assert.deepEqual(fuera, [], 'Preguntas en la práctica de una clase de otro tema. Recolócalas con «node tools/bancos/practica-tema.mjs --escribir» (o, si lo dudoso es su tema, justifícalas en tools/bancos/practica-excepciones.json).');
    // Recolocar otra vez no cambia nada.
    assert.deepEqual(recolocar(ctx, practica).movimientos, []);
    // Cada excepción sigue haciendo falta, está donde dice y explica por qué.
    for (const [id, e] of Object.entries(ctx.excepciones)) {
      const q = ctx.porId.get(id);
      assert.ok(q, `${id}: la excepción cita una pregunta que no existe`);
      assert.ok(ctx.clases.has(e.clase), `${id}: la excepción cita una clase que no existe (${e.clase})`);
      assert.notEqual(ctx.clases.get(e.clase), q.ut, `${id}: ya es del tema de ${e.clase}; la excepción sobra`);
      assert.ok(practica[e.clase]?.includes(id), `${id}: no está en la práctica de ${e.clase}; la excepción sobra`);
      assert.ok(TIPOS.includes(e.tipo), `${id}: tipo de excepción «${e.tipo}»`);
      assert.ok(typeof e.motivo === 'string' && e.motivo.length > 40, `${id}: falta el motivo de la excepción`);
      // Una «tema-dudoso» está solo en esa clase; una «clase-corta» puede estar además en una de su tema.
      const otras = Object.entries(practica).filter(([l, ids]) => l !== e.clase && ids.includes(id)).map(([l]) => l);
      for (const l of otras) assert.equal(ctx.clases.get(l), q.ut, `${id}: además está en ${l}, que tampoco es de su tema`);
    }
  });
}

test('excepciones: solo de ejes y titulaciones que existen', () => {
  const ex = leerJSON('tools/bancos/practica-excepciones.json');
  const conocidos = new Set(bancos().map((b) => `${b.eje}/${b.tit}`));
  for (const [eje, porTit] of Object.entries(ex)) {
    if (eje === 'descripcion') continue;
    for (const tit of Object.keys(porTit)) assert.ok(conocidos.has(`${eje}/${tit}`), `${eje}/${tit}`);
  }
  assert.ok(RUTA_EXCEPCIONES.endsWith('practica-excepciones.json'));
});

test('recolocar: ya en su tema, por idea, por hermanas, por parecido, sin clase y excepciones (banco de juguete)', () => {
  const q = (id, ut, enunciado = id, opciones = { a: 'x' }) => ({ id, ut, enunciado, opciones });
  const qs = [
    q('a', 1), q('b', 1), q('c', 1), q('d', 1), q('e', 1), q('f', 1, 'calcular la sonda en la bajamar de hoy', { a: 'dos metros', b: 'tres metros' }),
    q('g', 1, 'calcular la sonda en la bajamar de ayer', { a: 'dos metros', b: 'cuatro metros' }), q('h', 1, 'algo que nadie explica'), q('x', 1), q('y', 2), q('z', 2),
  ];
  const ctx = {
    eje: 'j', tit: 'per', qs, porId: new Map(qs.map((p) => [p.id, p])),
    etiquetas: { a: ['idea.uno'], b: ['idea.dos'], c: ['idea.dos'], d: ['idea.dos'], e: ['idea.dos'], x: ['idea.dos'] },
    catalogo: new Map([['idea.uno', { id: 'idea.uno', clases: ['c2-1', 'c1-2'] }], ['idea.dos', { id: 'idea.dos', clases: ['c2-1'] }]]),
    clases: new Map([['c1-1', 1], ['c1-2', 1], ['c2-1', 2]]),
    excepciones: { x: { clase: 'c2-1', tipo: 'tema-dudoso', motivo: 'm' } },
  };
  const practica = { 'c1-1': ['c', 'd', 'e', 'g', 'y'], 'c1-2': ['z', 'b'], 'c2-1': ['a', 'b', 'f', 'h', 'x', 'y'] };
  const copia = JSON.stringify(practica);
  const r = recolocar(ctx, practica);
  assert.equal(JSON.stringify(practica), copia, 'no modifica la práctica que recibe');
  const mov = Object.fromEntries(r.movimientos.map((m) => [m.id, m]));
  assert.deepEqual([mov.a.a, mov.a.criterio], ['c1-2', 'idea'], 'la clase de su tema donde se enseña su idea');
  assert.deepEqual([mov.b.a, mov.b.criterio], ['c1-2', 'ya-en-su-tema'], 'ya estaba en una de su tema: solo se quita');
  assert.deepEqual([mov.f.a, mov.f.criterio], ['c1-1', 'parecido'], 'la clase de sus vecinas más parecidas');
  assert.deepEqual([mov.h.a, mov.h.criterio], [null, 'sin-clase']);
  assert.deepEqual([mov.z.a, mov.z.criterio], [null, 'sin-clase']);
  assert.deepEqual([mov.y.a, mov.y.criterio], ['c2-1', 'ya-en-su-tema']);
  assert.equal('x' in mov, false, 'la excepción no se toca');
  assert.deepEqual(r.practica, { 'c1-1': ['c', 'd', 'e', 'f', 'g'], 'c1-2': ['a', 'b'], 'c2-1': ['x', 'y'] });
  assert.deepEqual(fueraDeTema(ctx, r.practica), []);
  assert.deepEqual(fueraDeTema(ctx, r.practica, { conExcepciones: true }).map((f) => f.id), ['x']);
  // Hermanas: sin clase del catálogo en su tema, va donde están al menos 3 de su idea.
  const sinCatalogo = { ...ctx, catalogo: new Map([['idea.dos', { id: 'idea.dos', clases: [] }]]), excepciones: {} };
  const en = new Map([['c', ['c1-1']], ['d', ['c1-1']], ['e', ['c1-1']]]);
  assert.deepEqual(elegirClase(ctx.porId.get('x'), sinCatalogo, en).criterio, 'hermanas');
  assert.deepEqual(elegirClase(ctx.porId.get('x'), sinCatalogo, new Map([['c', ['c1-1']]])).criterio, 'sin-clase');
  // «clase-corta»: se queda en su clase de otro tema y, además, va a la de su tema.
  const corta = recolocar({ ...ctx, excepciones: { a: { clase: 'c2-1', tipo: 'clase-corta', motivo: 'm' } } }, { 'c1-2': [], 'c2-1': ['a'] });
  assert.deepEqual(corta.practica, { 'c1-2': ['a'], 'c2-1': ['a'] });
  assert.equal(corta.movimientos[0].ademas, true);
});

test('los generadores de la práctica no mandan preguntas a clases de otro tema y aplican la red de seguridad', () => {
  const generico = readFileSync(join(RAIZ, 'tools/bancos/practica.mjs'), 'utf8');
  const baleares = readFileSync(join(RAIZ, 'tools/bancos/ejes/baleares/practica.mjs'), 'utf8');
  for (const [nombre, t] of [['practica.mjs', generico], ['ejes/baleares/practica.mjs', baleares]]) {
    assert.match(t, /recolocar\(ctxTema, practica\)/, `${nombre}: recoloca al final`);
    assert.match(t, /ctxTema\.excepciones/, `${nombre}: aplica las excepciones`);
  }
  assert.doesNotMatch(generico, /porUt\.get\(cartaUt - 1\)/, 'las de carta sin carta ya no van a las clases de la unidad anterior');
  assert.doesNotMatch(baleares, /lid = otra;/, 'una clase de otro tema ya no gana por contenido');
  // El formato de cada fichero se conserva al escribir.
  for (const { eje, tit } of bancos()) {
    const original = readFileSync(join(RAIZ, `data/ejes/${eje}/${tit}/practica.json`), 'utf8');
    assert.equal(textoComo(original, JSON.parse(original)), original, `${eje}/${tit}`);
  }
});
