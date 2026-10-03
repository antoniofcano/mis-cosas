// B4: tarjetas de memoria. Mazos sacados de los datos de las láminas, el anverso no revela la respuesta y las
// tarjetas falladas entran en el repaso espaciado de B1.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mazos, sesionMazo, tarjetasPorRepasar, sinRotulos, PREFIJO } from '../src/course/tarjetas.js';
import { renderIllustration } from '../src/illustrations/index.js';
import { createRng } from '../src/math/rng.js';
import { createProgressStore } from '../src/store/progress.js';

for (const tit of ['per', 'py']) {
  test(`tarjetas ${tit}: claves únicas, anversos que se dibujan y sin la respuesta a la vista`, () => {
    const ms = mazos(tit);
    assert.ok(ms.length >= 5);
    const claves = ms.flatMap((m) => m.cartas.map((c) => c.clave));
    assert.equal(new Set(claves).size, claves.length);
    for (const m of ms) for (const c of m.cartas) {
      assert.ok(c.clave.startsWith(PREFIJO));
      assert.ok(c.reverso.titulo, `${c.clave} sin reverso`);
      assert.ok(c.anverso.pregunta && (c.anverso.spec || c.anverso.texto || c.anverso.sonido), `${c.clave} sin anverso`);
      if (c.anverso.spec) {
        const r = renderIllustration(c.anverso.spec);
        assert.ok(r, `${c.clave}: su lámina no se dibuja`);
        const svg = sinRotulos(r.svg, c.anverso.quitar);
        if (!c.anverso.quitar) assert.ok(!/<text\b/.test(svg), `${c.clave}: quedan rótulos`);
        assert.ok(!svg.includes(c.reverso.titulo), `${c.clave}: el anverso enseña la respuesta`);
      }
    }
  });
}

test('sesión: primero las que tocan, luego las nuevas; una tarjeta fallada vuelve mañana', () => {
  const [mazo] = mazos('per');
  const hoy = '2026-10-03';
  const r = { [mazo.cartas[3].clave]: { ok: false, rep: { racha: 0, prox: hoy } }, [mazo.cartas[5].clave]: { ok: true, rep: null } };
  const s = sesionMazo(mazo, r, createRng(3), { hoy });
  assert.equal(s[0].clave, mazo.cartas[3].clave);
  assert.ok(!s.slice(1, 5).some((c) => r[c.clave]), 'después, las que no has visto');
  const datos = new Map();
  const p = createProgressStore({ getItem: (k) => datos.get(k) ?? null, setItem: (k, v) => datos.set(k, v), removeItem: (k) => datos.delete(k) });
  p.recordExam(mazo.cartas[0].clave, { choice: null, ok: false });
  assert.equal(p.get().exams[mazo.cartas[0].clave].rep.racha, 0);
  assert.equal(tarjetasPorRepasar(mazos('per'), p.get().exams, '2026-12-31').length, 1);
});
