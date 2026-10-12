// Preguntas de carta sin resolución programada: no se practican y, donde se ven, dicen por qué no se resuelven.
// (docs/BANCOS.md, «Soluciones de carta»; tools/auditoria-carta.mjs hace el recuento.)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { bancosNode, ejes, titsDeEje } from '../tools/bancos/leer.mjs';
import { SOLUCIONES, DOCUMENTADAS } from '../src/bancos/soluciones.js';
import { esDeCarta, practicable } from '../src/bancos/index.js';
import { motivoSinSolucion, acuerdoAnulacion } from '../src/exams/motivo.js';
import { auditar } from '../tools/auditoria-carta.mjs';

const leer = (r) => readFileSync(new URL(`../${r}`, import.meta.url), 'utf8');
const sinSolucion = (q) => esDeCarta(q) && !SOLUCIONES[q.id];

test('práctica: ninguna pregunta de carta sin resolución programada (tres bancos, dos titulaciones)', async () => {
  const b = bancosNode();
  const vistos = [];
  for (const e of ejes()) {
    for (const tit of titsDeEje(e.id)) {
      const banco = await b.cargarBanco(e.id, tit);
      vistos.push(`${e.id}/${tit}`);
      assert.ok(banco.practica.every(practicable), `${e.id}/${tit}: banco.practica`);
      // La práctica es el estudio menos esas: no se pierde ninguna otra.
      assert.deepEqual(banco.practica.map((q) => q.id), banco.estudio.filter((q) => !sinSolucion(q)).map((q) => q.id), `${e.id}/${tit}`);
      const curso = await b.cargarCurso(tit, e.id);
      for (const l of (curso?.modulos ?? []).flatMap((m) => m.lecciones)) {
        const malas = l.practica.filter((id) => sinSolucion(banco.porId.get(id)));
        assert.deepEqual(malas, [], `${e.id}/${tit} ${l.id}: práctica con preguntas de carta sin resolución`);
        assert.deepEqual(banco.resueltasDe(l.id).filter((id) => !SOLUCIONES[id]), [], `${e.id}/${tit} ${l.id}: resueltos`);
      }
      for (const l of banco.listas.filter((x) => x.requiere === 'carta')) {
        assert.deepEqual(l.preguntas.filter(sinSolucion).map((q) => q.id), [], `${e.id}/${tit} lista ${l.id}`);
      }
      // Ninguna se queda sin ofrecer «Ver la resolución» si la tiene, y ninguna sin ella lo ofrece.
      for (const q of banco.todas.filter(esDeCarta)) assert.equal(!!b.rutaResolucion(q), !!SOLUCIONES[q.id], q.id);
    }
  }
  for (const x of ['andalucia/per', 'andalucia/py', 'dgmm/per', 'dgmm/py', 'baleares/per', 'baleares/py']) assert.ok(vistos.includes(x), x);
});

test('práctica: las que se practicaban y ya no son justo las de carta sin resolución (siguen en los exámenes)', async () => {
  const b = bancosNode();
  for (const e of ejes()) {
    for (const tit of titsDeEje(e.id)) {
      const banco = await b.cargarBanco(e.id, tit);
      const fuera = banco.estudio.filter((q) => !banco.practica.includes(q));
      assert.ok(fuera.every(sinSolucion), `${e.id}/${tit}`);
      assert.ok(fuera.every((q) => banco.examenes.includes(q)), `${e.id}/${tit}: siguen en los exámenes`);
    }
  }
});

test('cada pregunta de carta sin resolución tiene su motivo (anulada, sin cálculo o discrepancia), con texto', async () => {
  const filas = await auditar();
  assert.deepEqual(filas.filter((f) => f.estado === 'sin-motivo').map((f) => f.id), []);
  for (const f of filas.filter((x) => !x.estado.startsWith('programada'))) {
    const q = { id: f.id, anulada: f.estado === 'anulada', notas: '' };
    const m = motivoSinSolucion(q, DOCUMENTADAS[f.id]);
    assert.ok(m && m.tipo !== 'sin-motivo', f.id);
    assert.ok(m.texto.length > 20 && m.titulo && m.etiqueta, f.id);
  }
  for (const d of Object.values(DOCUMENTADAS)) assert.ok(['discrepancia', 'sin-calculo', 'anulada'].includes(d.tipo), d.tipo);
});

test('motivo: dice la verdad de cada tipo, con el texto documentado', () => {
  const sc = motivoSinSolucion({ id: 'x' }, { tipo: 'sin-calculo', texto: 'Se mira la zona de fondeo.' });
  assert.equal(sc.tipo, 'sin-calculo');
  assert.match(sc.titulo, /mirando la carta/);
  assert.match(sc.texto, /zona de fondeo/);
  const di = motivoSinSolucion({ id: 'x' }, { tipo: 'discrepancia', texto: 'Sale 078,6°, no 080°.' });
  assert.match(di.titulo, /no coincide con la plantilla oficial/);
  assert.match(di.texto, /078,6°/);
  assert.match(di.texto, /vale la respuesta oficial/);
  // Con resolución programada y no anulada: nada que avisar.
  assert.equal(motivoSinSolucion({ id: 'x' }, undefined, { programada: true }), null);
  // Nunca la frase antigua (engañosa para una anulada o una discrepancia).
  assert.doesNotMatch(leer('src/ui/views/exams.js'), /requiere leer símbolos de la carta/);
});

test('motivo: anulada, con el acuerdo del tribunal si consta en las notas', () => {
  const dg = motivoSinSolucion({ anulada: true, notas: 'PER T01 pregunta 42: anulada (todas las respuestas válidas). Acuerdo del Tribunal de 22-07-2019. [https://x]' });
  assert.equal(dg.tipo, 'anulada');
  assert.equal(dg.titulo, 'Pregunta anulada por el tribunal: se dieron todas por válidas');
  assert.match(dg.texto, /acuerdo del tribunal de 22-07-2019/);
  const an = acuerdoAnulacion('Anulada por acuerdo del Tribunal de 26-07-2024 (pdf/a.pdf) por la errata "demora a Punta Carnero de 200º" (el dato correcto era 20º). La plantilla');
  assert.equal(an.acuerdo, 'acuerdo del tribunal de 26-07-2024');
  assert.match(an.causa, /^la errata «demora a Punta Carnero de 200º»/);
  assert.equal(an.todasValidas, false);
  const ni = acuerdoAnulacion('nota informativa 14-jun-2022: "PER - Modelo A: nº 43", cualquier respuesta se considera correcta');
  assert.equal(ni.acuerdo, 'nota informativa del tribunal de 14-jun-2022');
  assert.ok(ni.todasValidas);
  // Resuelta para practicar: lo dice.
  const pr = motivoSinSolucion({ anulada: true, notas: 'Anulada: "se dan todas por correctas" (nota de 04-01-2022)' }, undefined, { programada: true });
  assert.match(pr.texto, /para que te sirva de práctica/);
  // Sin notas: no se inventa el acuerdo.
  assert.equal(motivoSinSolucion({ anulada: true, notas: '' }).titulo, 'Pregunta anulada por el tribunal');
});

test('aviso del motivo: estilo C (solo variables --lc-*), sin emojis, con etiqueta en palabras', () => {
  const css = leer('styles/laminas.css');
  const i = css.indexOf('.motivo-carta {');
  assert.ok(i > 0, 'bloque .motivo-carta');
  const bloque = css.slice(i);
  assert.doesNotMatch(bloque, /#[0-9a-f]{3,6}\b|rgb\(/i, 'sin colores fijos');
  for (const v of bloque.match(/var\(--[a-z0-9-]+\)/g)) assert.match(v, /var\(--lc-/);
  const ui = leer('src/ui/motivo-carta.js') + leer('src/exams/motivo.js');
  assert.doesNotMatch(ui, /\p{Extended_Pictographic}/u);
  assert.match(leer('src/ui/motivo-carta.js'), /aria-label/);
});
