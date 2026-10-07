// Examen final (F1): lo reservado no se estudia por ninguna puerta, la reserva de cada alumno es suya (no cambia con los
// datos), el examen final elige una convocatoria que el alumno no ha visto y el simulacro prefiere lo no visto.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { bancosNode, ejes, leerJSON } from '../tools/bancos/leer.mjs';
import { crearBancos, repartoReserva } from '../src/bancos/index.js';
import { TITULACIONES } from '../src/theory/blocks.js';
import { buildSimulacro, buildPractica, buildMezcla, buildReal, buildFinal, grade, AVISO_VISTAS } from '../src/theory/engine.js';
import { colaRepaso, tandaRapida } from '../src/course/repaso.js';
import { conPreguntaFinal, conPreguntasIntercaladas, leccionesDe } from '../src/course/engine.js';
import { estadoAlumno } from '../src/course/motor.js';
import { estadoFinal, margenExamen, UMBRAL_VISTA } from '../src/course/final.js';
import { createRng } from '../src/math/rng.js';

const PUBLICADOS = ejes().filter((e) => e.estado === 'publicado').map((e) => e.id);
const DIA = 864e5;

/** Ids de preguntas que citan las pausas del podcast (de cualquier titulación). */
const idsPodcast = () => [...new Set(readdirSync(new URL('../data/podcast/', import.meta.url)).filter((f) => f.endsWith('.json'))
  .flatMap((f) => [...readFileSync(new URL(`../data/podcast/${f}`, import.meta.url), 'utf8').matchAll(/"p":"([^"]+)"/g)].map((m) => m[1])))];

test('los ejes publicados reservan algo para el examen final (Andalucía y DGMM por convocatorias, Baleares por preguntas)', () => {
  const modos = Object.fromEntries(PUBLICADOS.map((e) => [e, leerJSON(`data/ejes/${e}/eje.json`).reserva]));
  assert.equal(modos.andalucia.modo, 'examen');
  assert.deepEqual(modos.andalucia.per, ['and-2025-c1', 'and-2025-c2', 'and-2025-c3', 'and-2026-c1', 'and-2026-c2']);
  assert.deepEqual(modos.andalucia.py, ['and-py-2025-c1', 'and-py-2025-c2', 'and-py-2025-c3', 'and-py-2026-c1', 'and-py-2026-c2']);
  if (modos.dgmm) assert.equal(modos.dgmm.modo, 'examen');
  if (modos.baleares) assert.equal(modos.baleares.modo, 'pregunta');
  for (const [e, r] of Object.entries(modos)) for (const tit of ['per', 'py']) if (leerJSON(`data/ejes/${e}/eje.json`).examen[tit]) assert.ok(r[tit]?.length, `${e} ${tit} sin reserva`);
});

for (const eje of PUBLICADOS) {
  for (const tit of Object.keys(leerJSON(`data/ejes/${eje}/eje.json`).examen)) {
    test(`${eje} ${tit}: ninguna pregunta reservada ni retirada sale por ninguna puerta del estudio`, async () => {
      const B = bancosNode();
      const banco = await B.cargarBanco(eje, tit);
      const curso = await B.cargarCurso(tit, eje);
      const E = TITULACIONES[tit].estructura;
      const fuera = new Set(banco.reservadas);
      for (const q of banco.todas) if (q.norma?.estado === 'retirada') fuera.add(q.id);
      assert.ok(banco.reservadas.size > 0, 'sin reserva');
      const fuga = (donde, ids) => { const f = [...ids].filter((id) => fuera.has(id)); assert.deepEqual(f, [], `${donde}: ${f.slice(0, 5).join(', ')}`); };
      const ids = (qs) => qs.map((q) => q.id);
      fuga('estudio', ids(banco.estudio));
      // Clases: práctica, pregunta final, intercaladas y «míralo resuelto».
      for (const l of leccionesDe(curso)) {
        fuga(`práctica de ${l.id}`, l.practica);
        fuga(`resueltas de ${l.id}`, banco.resueltasDe(l.id));
        const disponibles = l.practica.map((id) => banco.porId.get(id));
        const pasos = conPreguntasIntercaladas(conPreguntaFinal(l.pasos.filter((p) => !p.extra), disponibles, createRng(1)), disponibles, createRng(2));
        fuga(`pasos de ${l.id}`, pasos.map((p) => p.real?.id ?? p.q?.id ?? p.pregunta?.id).filter(Boolean));
      }
      // Un alumno que había respondido (y fallado) TODAS, también las reservadas: nada de eso vuelve a su estudio.
      const respuestas = Object.fromEntries(banco.todas.map((q) => [q.id, { choice: null, ok: false, t: new Date(Date.now() - 3 * DIA).toISOString() }]));
      const rng = createRng(7);
      for (const b of E.bloques) {
        fuga(`tanda del tema ${b.ut}`, ids(buildPractica(banco.estudio, b.ut, rng, { respuestas, limite: 10 }).preguntas));
        fuga(`tanda de fallos del tema ${b.ut}`, ids(buildPractica(banco.estudio, b.ut, rng, { soloFalladas: new Set(Object.keys(respuestas)), respuestas, limite: 10 }).preguntas));
      }
      fuga('mezcla', ids(buildMezcla(banco.estudio, E.bloques.map((b) => b.ut), rng, { respuestas, limite: 30 }).preguntas));
      fuga('repaso', ids(colaRepaso(banco.estudio, respuestas).hoy));
      fuga('5 minutos', ids(tandaRapida(banco.estudio, respuestas, rng)));
      for (const s of [1, 2, 3]) fuga(`simulacro ${s}`, ids(buildSimulacro(E, banco.estudio, createRng(s), { respuestas: {} }).preguntas));
      // Exámenes de convocatorias (las reservadas no se ofrecen) y listas de preguntas reales.
      const reservadasConv = new Set(banco.reserva.convs);
      for (const c of banco.convocatorias()) {
        assert.ok(!reservadasConv.has(c.key.split('@')[0]), `${c.key} es reservada`);
        fuga(`examen ${c.key}`, ids(buildReal(banco.examenes, c.key).preguntas).filter((id) => banco.reservadas.has(id)));
      }
      for (const l of banco.listas) fuga(`lista ${l.id}`, ids(l.preguntas).filter((id) => banco.reservadas.has(id)));
      // Motor: el repaso y los temas no cuentan las reservadas.
      const st = estadoAlumno({ tit, estructura: E, curso, preguntas: banco.estudio, regs: {}, respuestas, tests: [], settings: {}, minutosHoy: 0, racha: 0, planGuardado: null,
        reserva: banco.reserva, pool: banco.final, reservadas: banco.reservadas });
      assert.equal(st.repaso.total, colaRepaso(banco.estudio, respuestas).total);
      // Pausas del podcast: la pregunta que se enseña (la propia o su equivalente) nunca es reservada ni retirada.
      for (const id of idsPodcast()) {
        const r = await B.equivalente(id, eje);
        if (!r || r.q.tit !== tit) continue;
        const suyo = await B.cargarBanco(r.q.eje, r.q.tit);
        assert.ok(suyo.estudio.includes(r.q), `pausa ${id} → ${r.q.id} no se estudia`);
      }
    });
  }
}

test('reserva por alumno: la foto se guarda la primera vez y los cambios de datos no cambian su examen final', async () => {
  const q = (id, conv, ut) => ({ id, eje: 'x', tit: 'py', conv, convocatoria: conv, fecha: conv.slice(2), numero: 1, orden: Number(id.slice(2)), ut, opciones: { a: '1', b: '2' }, correcta: 'a', aceptadas: ['a'], anulada: false, requiere: [], apareceEn: [{ conv }] });
  const preguntas = [q('x-1', 'x-2024-01', 1), q('x-2', 'x-2025-01', 1), q('x-3', 'x-2025-06', 1), q('x-4', 'x-2026-01', 1)];
  const datos = (reserva) => ({
    'data/ejes/index.json': { ejes: [{ id: 'x', prefijo: 'x', nombre: 'X', estado: 'publicado' }] },
    'data/ejes/x/eje.json': { id: 'x', nombre: 'X', prefijo: 'x', examen: { py: {} }, reserva: { modo: 'examen', py: reserva } },
    'data/ejes/x/py/preguntas.json': { meta: { eje: 'x', tit: 'py' }, preguntas },
  });
  const leer = (d) => async (ruta) => { if (!(ruta in d)) throw new Error(ruta); return d[ruta]; };
  const ajustes = {};
  const alumno = { leer: (e, t) => ajustes[`reserva_${e}_${t}`] ?? null, guardar: (e, t, foto) => { ajustes[`reserva_${e}_${t}`] = foto; } };
  const b1 = crearBancos(leer(datos(['x-2025-06'])));
  b1.fijarReservaAlumno(alumno);
  const antes = await b1.cargarBanco('x', 'py');
  assert.deepEqual(ajustes.reserva_x_py.convs, ['x-2025-06'], 'la foto se guarda al cargar');
  assert.deepEqual(antes.final.map((x) => x.id), ['x-3']);
  // Los datos rotan la reserva: su examen final sigue siendo x-2025-06, y lo nuevo reservado tampoco se estudia.
  const b2 = crearBancos(leer(datos(['x-2026-01'])));
  b2.fijarReservaAlumno(alumno);
  const despues = await b2.cargarBanco('x', 'py');
  assert.deepEqual(despues.final.map((x) => x.id), ['x-3']);
  assert.deepEqual(despues.reserva.examenes.map((e) => e.key), ['x-2025-06']);
  assert.deepEqual(despues.estudio.map((x) => x.id), ['x-1', 'x-2']);
  assert.deepEqual(despues.convocatorias().map((c) => c.key), ['x-2025-01', 'x-2024-01']);
  // Sin almacén (herramientas), la de la ficha.
  assert.deepEqual((await crearBancos(leer(datos(['x-2026-01']))).cargarBanco('x', 'py')).final.map((x) => x.id), ['x-4']);
});

test('reparto de la reserva: en modo «examen» una pregunta repetida en una convocatoria pública sigue en el estudio', () => {
  const qs = [{ id: 'a', conv: 'c1', apareceEn: [{ conv: 'c1' }, { conv: 'c2' }] }, { id: 'b', conv: 'c2', apareceEn: [{ conv: 'c2' }] }, { id: 'c', conv: 'c0', apareceEn: [] }];
  const ex = repartoReserva(qs, { modo: 'examen', convs: ['c2'] });
  assert.deepEqual(ex.final.map((q) => q.id), ['a', 'b']);
  assert.deepEqual([...ex.reservadas], ['b']);
  const pr = repartoReserva(qs, { modo: 'pregunta', convs: ['c2'] });
  assert.deepEqual([...pr.reservadas], ['a', 'b']);
});

test('examen final de un alumno antiguo de Andalucía: le toca una convocatoria reservada que no ha visto', async () => {
  const banco = await bancosNode().cargarBanco('andalucia', 'per');
  const E = TITULACIONES.per.estructura;
  // Practicó 2025 (las tres convocatorias, casi enteras) antes de la reserva.
  const respuestas = {};
  for (const e of banco.reserva.examenes.filter((x) => x.key.startsWith('and-2025'))) for (const id of e.ids.slice(0, 30)) respuestas[id] = { choice: 'a', ok: true };
  const listo = { estado: 'listo', prob: 0.9, temasSinDatos: [] };
  const f = estadoFinal({ estructura: E, reserva: banco.reserva, pool: banco.final, respuestas, tests: [], listo });
  assert.equal(f.desbloqueado, true);
  assert.equal(f.ineditas, 2);
  assert.ok(f.siguiente.key.startsWith('and-2026'), f.siguiente.key);
  assert.equal(f.siguiente.yaVistas, 0);
  const t = buildFinal(E, { modo: 'examen', key: f.siguiente.key, examenes: banco.reserva.examenes, porId: banco.porId, pool: banco.final, respuestas, rng: createRng(1) });
  assert.equal(t.preguntas.length, 45);
  assert.equal(t.nuevas, 45);
  assert.ok(t.preguntas.every((q) => banco.reservadas.has(q.id)));
  // Las ha visto todas: se dice, sin fingir que es inédito.
  for (const e of banco.reserva.examenes) for (const id of e.ids.slice(0, Math.ceil(UMBRAL_VISTA * e.n))) respuestas[id] = { choice: 'a', ok: true };
  const visto = estadoFinal({ estructura: E, reserva: banco.reserva, pool: banco.final, respuestas, tests: [], listo });
  assert.equal(visto.todasVistas, true);
  assert.match(visto.lineas[0], /ya no es inédito/);
  assert.equal(visto.sugerir, false);
});

test('examen final en modo «pregunta» (Baleares): reparto oficial por temas con las reservadas, primero las no vistas', async () => {
  const banco = await bancosNode().cargarBanco('baleares', 'per');
  const E = TITULACIONES.per.estructura;
  assert.equal(banco.reserva.modo, 'pregunta');
  const respuestas = Object.fromEntries(banco.final.slice(0, 20).map((q) => [q.id, { ok: true }]));
  const t = buildFinal(E, { modo: 'pregunta', pool: banco.final, respuestas, rng: createRng(3) });
  assert.equal(t.tipo, 'final');
  for (const b of E.bloques) {
    const n = t.preguntas.filter((q) => q.ut === b.ut).length;
    const nuevas = banco.final.filter((q) => q.ut === b.ut && !q.anulada && q.correcta && !respuestas[q.id]).length;
    assert.ok(n <= b.n);
    if (nuevas >= b.n) assert.ok(t.preguntas.filter((q) => q.ut === b.ut).every((q) => !respuestas[q.id]), `tema ${b.ut}`);
  }
  assert.ok(t.preguntas.every((q) => banco.reservadas.has(q.id)));
});

test('examen final de DGMM: convocatoria reservada completa', async () => {
  const banco = await bancosNode().cargarBanco('dgmm', 'py');
  const E = TITULACIONES.py.estructura;
  const f = estadoFinal({ estructura: E, reserva: banco.reserva, pool: banco.final, respuestas: {}, tests: [], listo: { estado: 'listo', prob: 0.9, temasSinDatos: [] } });
  const t = buildFinal(E, { modo: 'examen', key: f.siguiente.key, examenes: banco.reserva.examenes, porId: banco.porId, pool: banco.final, respuestas: {}, rng: createRng(1) });
  assert.equal(t.preguntas.length, 40);
});

test('simulacro: con el mismo reparto oficial, primero las preguntas no vistas; avisa cuando casi todo está visto', async () => {
  const banco = await bancosNode().cargarBanco('andalucia', 'per');
  const E = TITULACIONES.per.estructura;
  // Ha visto la mitad de cada tema.
  const respuestas = {};
  for (const b of E.bloques) { const qs = banco.estudio.filter((q) => q.ut === b.ut); for (const q of qs.slice(0, Math.floor(qs.length / 2))) respuestas[q.id] = { ok: true }; }
  const s = buildSimulacro(E, banco.estudio, createRng(5), { respuestas });
  for (const b of E.bloques) assert.equal(s.preguntas.filter((q) => q.ut === b.ut).length, b.n, `tema ${b.ut}`);
  assert.equal(s.nuevas, 45, 'todas nuevas mientras haya');
  assert.equal(s.avisoVistas, false);
  for (const q of banco.estudio) respuestas[q.id] = { ok: true };
  const casi = buildSimulacro(E, banco.estudio, createRng(5), { respuestas });
  assert.ok(casi.vistas >= AVISO_VISTAS && casi.avisoVistas);
  assert.equal(casi.nuevas, 0);
});

test('margen del examen final y preguntas retiradas en la corrección', () => {
  const E = TITULACIONES.per.estructura;
  const porTema = (fallos) => E.bloques.map((b) => ({ ut: b.ut, aciertos: b.n - (fallos[b.ut] ?? 0), total: b.n }));
  assert.equal(margenExamen(E, { apto: true, aciertos: 40, porTema: porTema({ 6: 3, 5: 1, 11: 1 }) }).conMargen, true);
  assert.equal(margenExamen(E, { apto: true, aciertos: 40, porTema: porTema({ 6: 4 }) }).conMargen, false);
  assert.equal(margenExamen(E, { apto: true, aciertos: 35, porTema: porTema({}) }).conMargen, false);
  const PY = TITULACIONES.py.estructura;
  assert.equal(margenExamen(PY, { apto: true, aciertos: 32, porTema: PY.bloques.map((b) => ({ ut: b.ut, aciertos: b.n - (b.ut === 4 ? 2 : 0), total: b.n })) }).conMargen, false);
  // Una retirada cuenta como las anuladas: no resta.
  const q = { id: 'r', ut: 1, correcta: 'a', anulada: false, norma: { estado: 'retirada' } };
  const g = grade(E, { preguntas: [q] }, { r: 'b' });
  assert.equal(g.detalle[0].ok, true);
  assert.equal(g.detalle[0].retirada, true);
});
