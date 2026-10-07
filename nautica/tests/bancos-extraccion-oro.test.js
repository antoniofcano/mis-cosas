// Prueba de oro de Andalucía 2020–2026 (tools/bancos/ejes/andalucia/oro.mjs): la salida del proceso de extracción desde
// los PDF oficiales coincide con el banco vivo en correcta y anulada, y toda otra diferencia está explicada en oro.json.
// La comparación real necesita la caché local (.cache/bancos/andalucia/salida/, que no se sube): sin ella, se salta.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { huella as huellaMigracion } from '../tools/bancos/migrar-andalucia.mjs';
import { CRITICOS, clasificar, comparar, ejecutarOro, hayCache, huella, informeOro, normalizar } from '../tools/bancos/ejes/andalucia/oro.mjs';

const q = (id, extra = {}) => ({
  id, enunciado: 'La Demora es:', opciones: { a: 'uno', b: 'dos', c: 'tres', d: 'cuatro' },
  correcta: 'a', anulada: false, ut: 10, numero: 37, fecha: '2020-07-25', ...extra,
});

test('oro: normalización de texto (espacios, comillas, espacio antes de un signo)', () => {
  assert.equal(normalizar('La  Demora es :'), 'La Demora es:');
  assert.equal(normalizar('«buque»'), normalizar('“buque”'));
  assert.equal(normalizar('35º 50´ N'), normalizar("35º 50' N"));
  assert.notEqual(normalizar('estriborbabor'), normalizar('estribor-babor'));
});

test('oro: la huella es la de la migración', () => {
  const p = q('and-2020-c1-t37');
  assert.equal(huella(p), huellaMigracion(p));
});

test('oro: comparación campo a campo y clasificación de diferencias', () => {
  const vivo = [q('and-2020-c1-t37'), q('and-2020-c1-t38'), q('and-2020-c1-t39')];
  const salida = [
    q('and-2020-c1-t37', { enunciado: 'La Demora es :' }),
    q('and-2020-c1-t38', { correcta: 'b' }),
    q('and-2015-c1-t01'),
  ];
  const r = comparar(vivo, salida, { huellas: { 'and-2020-c1-t37': huella(vivo[0]) } });
  assert.deepEqual(r.faltan, ['and-2020-c1-t39']);
  assert.deepEqual(r.sobran, []); // las de 2015–2019 no cuentan como sobrantes
  assert.equal(r.porCampo.enunciado.distintas, 0);
  assert.deepEqual(r.diferencias.map((d) => `${d.id}|${d.campo}`), ['and-2020-c1-t38|correcta']);
  assert.deepEqual(r.huella, { iguales: 0, total: 1 }); // la huella no normaliza
  const c = clasificar(r.diferencias, { 'and-2020-c1-t38|correcta': { clase: 'banco', evidencia: 'hoja A y B: b' } });
  assert.equal(c[0].clase, 'banco');
  assert.equal(clasificar(r.diferencias)[0].clase, 'sin-explicar');
});

test('oro: Andalucía 2020–2026 desde la caché de extracción (se salta sin caché)', (t) => {
  if (!hayCache()) { t.skip('sin .cache/bancos/andalucia/salida (npm run bancos -- andalucia)'); return; }
  const r = ejecutarOro();
  for (const tit of ['per', 'py']) {
    const x = r.res[tit];
    assert.deepEqual(x.faltan, [], `${tit}: faltan preguntas en la salida`);
    const sinExplicar = x.diferencias.filter((d) => d.clase === 'sin-explicar');
    assert.deepEqual(sinExplicar.map((d) => `${d.id}|${d.campo}`), [], `${tit}: diferencias sin explicar en oro.json`);
    for (const campo of CRITICOS) {
      const dif = x.diferencias.filter((d) => d.campo === campo);
      assert.ok(dif.every((d) => d.clase === 'banco' && d.evidencia), `${tit}: ${campo} distinta sin evidencia`);
    }
  }
  assert.match(informeOro(r), /Prueba de oro/);
});
