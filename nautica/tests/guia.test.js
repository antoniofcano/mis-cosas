// La guía de bienvenida dice lo mismo que las reglas del examen y de la app (no puede quedarse desfasada).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { paginasGuia } from '../src/course/guia.js';
import { TITULACIONES, totalPreguntas } from '../src/theory/blocks.js';
import { MIN_RESPUESTAS } from '../src/course/listo.js';

test('guía: cinco pantallas con los números reales del examen de cada titulación', () => {
  for (const T of Object.values(TITULACIONES)) {
    const p = paginasGuia(T, { minutosDia: 25 });
    assert.equal(p.length, 5);
    const examen = [...p[0].texto, ...(p[0].puntos ?? [])].join(' ');
    assert.match(examen, new RegExp(`${totalPreguntas(T.estructura)} preguntas`));
    assert.match(examen, new RegExp(`${T.estructura.minAciertos} aciertos`));
    for (const b of T.estructura.bloques.filter((x) => x.maxErrores != null)) assert.ok(examen.includes(b.titulo), `${T.sigla}: falta ${b.titulo}`);
    assert.match(p[2].texto.join(' '), /25 minutos/);
    assert.match(p[3].texto.join(' '), new RegExp(`${MIN_RESPUESTAS} preguntas`));
    for (const x of p) assert.ok(!/undefined|NaN/.test(JSON.stringify(x)), x.titulo);
  }
});
