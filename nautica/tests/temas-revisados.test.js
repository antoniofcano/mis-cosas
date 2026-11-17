// Revisión del tema y la clase de las preguntas dudosas (R-29): tools/bancos/temas-revisados.json está aplicado, cada
// decisión tiene su motivo y ningún cambio de tema toca un bloque con límite de fallos, una reservada o Andalucía.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { leerRevision, aplicar, temasConLimite, DECISIONES, textoAjustes } from '../tools/bancos/temas-revisados.mjs';
import { leerJSON, bancosNode } from '../tools/bancos/leer.mjs';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RAIZ } from '../tools/bancos/lib/comun.mjs';
import { temasDeClases, excepcionesDe } from '../tools/bancos/lib/practica-tema.mjs';

const revision = leerRevision();

test('la revisión está aplicada (volver a aplicarla no cambia nada)', () => {
  const { cambios, errores } = aplicar({ escribir: false });
  assert.deepEqual(errores, []);
  assert.deepEqual(cambios, []);
});

for (const [eje, porTit] of Object.entries(revision)) {
  for (const [tit, decisiones] of Object.entries(porTit)) {
    test(`revisión ${eje} · ${tit}: cada decisión es válida, tiene motivo y se cumple en los datos`, async () => {
      const banco = await bancosNode().cargarBanco(eje, tit);
      const practica = leerJSON(`data/ejes/${eje}/${tit}/practica.json`);
      const ajustes = leerJSON(`tools/bancos/ejes/${eje}/ajustes.json`)[tit] ?? {};
      const clases = temasDeClases(tit);
      const conLimite = temasConLimite(tit);
      const excepciones = excepcionesDe(eje, tit);
      const reservaConvs = new Set(banco.reserva?.convs ?? []);
      for (const [id, d] of Object.entries(decisiones)) {
        const q = banco.porId.get(id);
        assert.ok(q, `${id}: no existe`);
        assert.ok(DECISIONES.includes(d.decision), `${id}: decisión «${d.decision}»`);
        assert.ok(typeof d.motivo === 'string' && d.motivo.length > 30, `${id}: falta el motivo`);
        const reservada = banco.reservadas.has(id) || (q.apareceEn ?? []).some((a) => reservaConvs.has(a.conv));
        if (d.decision === 'tema' || d.decision === 'clase') {
          assert.ok(!reservada, `${id}: es del examen final; no se cambia ni se practica`);
          assert.ok(practica[d.clase]?.includes(id), `${id}: no practica en ${d.clase}`);
          if (!d.excepcion) assert.equal(clases.get(d.clase), q.ut, `${id}: ${d.clase} no es de su tema`);
        }
        if (d.decision === 'tema') {
          assert.notEqual(eje, 'andalucia', `${id}: el tema de Andalucía está fijado en la huella del banco`);
          assert.equal(q.ut, d.a, `${id}: su tema en el banco no es ${d.a}`);
          assert.equal(ajustes[id]?.ut, d.a, `${id}: falta su ajuste de tema en ajustes.json`);
          assert.ok(!conLimite.has(d.de) && !conLimite.has(d.a), `${id}: ${d.de} → ${d.a} toca un bloque con límite de fallos`);
        }
        if (d.excepcion) {
          assert.equal(excepciones[id]?.clase, d.excepcion.clase, `${id}: falta su excepción`);
          assert.equal(excepciones[id]?.motivo, d.motivo, `${id}: la excepción no lleva el motivo de la revisión`);
        } else assert.equal(excepciones[id], undefined, `${id}: revisada sin excepción, pero tiene una`);
      }
    });
  }
}

test('los ajustes de Baleares y DGMM se reescriben con su mismo formato', () => {
  for (const eje of ['baleares', 'dgmm']) {
    const t = readFileSync(join(RAIZ, 'tools/bancos/ejes', eje, 'ajustes.json'), 'utf8');
    assert.equal(textoAjustes(JSON.parse(t), /\{"[a-z_]+": /.test(t)), t, eje);
  }
});

test('temas con límite de fallos: PER, Balizamiento, RIPA y Carta; PY, todos', () => {
  assert.deepEqual([...temasConLimite('per')].sort((a, b) => a - b), [5, 6, 11]);
  assert.deepEqual([...temasConLimite('py')].sort(), [1, 2, 3, 4]);
});
