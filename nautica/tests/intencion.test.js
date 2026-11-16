// Carta gráfica por intención (R-54): dada una intención (acción, objeto, valor, sentido), qué traza la app, y el
// diagnóstico de las intenciones equivocadas con el error con nombre de la taxonomía. Sobre preguntas reales del banco de
// práctica (nunca las reservadas: docs/CUARENTENA.md).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createKit } from '../src/exams/kit.js';
import { SOLUCIONES } from '../src/bancos/soluciones.js';
import { ERRORES, ERRORES_DE_TRAZADO } from '../src/exams/taxonomia.js';
import { AVISOS } from '../src/exams/avisos-pasos.js';
import { planIntencion, elegir, intento, compararFinal, resolverCon, cambiosDe, textoIntencion, TRAZOS, ACCIONES } from '../src/exams/intencion.js';
import { ORIGENES, anotar, falloValido } from '../src/course/cuaderno.js';
import { rhumbTo } from '../src/math/mercator.js';
import { norm360, angleDist } from '../src/math/angles.js';
import { bancosNode, ejes, titsDeEje } from '../tools/bancos/leer.mjs';
import { chart } from './helpers.js';

const B = bancosNode();
// Preguntas del banco de práctica (sin reservadas) con resolución, de todos los ejes.
const practica = [];
for (const eje of ejes()) {
  for (const tit of titsDeEje(eje.id ?? eje)) {
    const banco = await B.cargarBanco(eje.id ?? eje, tit);
    for (const q of banco.practica) if (SOLUCIONES[q.id] && !banco.reservadas.has(q.id)) practica.push(q);
  }
}
const porId = new Map(practica.map((q) => [q.id, q]));
// PY de Andalucía, los tipos más frecuentes: situación por demoras con corrección total y corriente desconocida; tangente
// con corriente; situación por dos «al … del faro» y corriente efectiva; demoras no simultáneas.
const DEMORAS = 'and-py-2015-c1-n17';
const TANGENTE = 'and-py-2021-c1-n14';
const CORRIENTE = 'and-py-2024-c1-n16';
const TRASLADO = 'and-py-2021-c2-n15';
const sol = (id) => SOLUCIONES[id];
const plan = (id) => planIntencion({ sol: sol(id), q: porId.get(id), chart });
const opc = (d, f) => d.opciones.find(f);
const dec = (t, id) => t.decisiones.find((d) => d.id === id || d.id.startsWith(id));
/** Primeras elecciones: todas bien salvo las que se dan. */
const bienSalvo = (p, cambios = {}) => p.trazos.map((t, n) => Object.fromEntries(t.decisiones.map((d) => [d.id, cambios[n]?.[d.id] ?? opc(d, (o) => o.ok).id])));

test('las preguntas de las pruebas son del banco de práctica, no reservadas', () => {
  for (const id of [DEMORAS, TANGENTE, CORRIENTE, TRASLADO]) assert.ok(porId.has(id), `${id} no está en la práctica`);
  assert.ok(practica.length > 1000, `solo ${practica.length}`);
});

test('el kit apunta sus operaciones de primer nivel sin cambiar ningún resultado', () => {
  const q = porId.get(DEMORAS);
  const k = createKit(chart);
  const v = sol(DEMORAS).solve(k, q);
  assert.deepEqual(k.ops.map((o) => o.op), ['pos', 'fromMark', 'rhumb', 'distFor', 'run', 'ct', 'dv', 'dv', 'fix2', 'corrienteDesconocida']);
  // Los trazos de cada operación, sin huecos ni solapes; y lo que devuelve, tal cual.
  let i = 0;
  for (const o of k.ops) { assert.equal(o.items[0], i); i = o.items[1]; }
  assert.equal(i, k.items.length);
  assert.deepEqual(k.ops.at(-1).ret, { rc: v[0].value, ic: v[1].value });
  // Resolver sin cambios (a través de resolverCon) da lo mismo.
  const r = resolverCon({ sol: sol(DEMORAS), q, chart });
  assert.deepEqual(r.values, v);
});

test('situación por dos demoras con Ct: los trazos, en orden, y lo que dibuja cada uno', () => {
  const p = plan(DEMORAS);
  assert.deepEqual(p.trazos.map((t) => t.accion), ['al-del-faro', 'unir', 'rumbo', 'demora', 'demora', 'unir-situaciones']);
  for (const t of p.trazos) for (const d of t.decisiones) assert.equal(d.opciones.filter((o) => o.ok).length, 1, `${t.titulo}: ${d.pregunta}`);
  // La demora de Isla de Tarifa: desde el faro, la opuesta de la Dv corregida (Da 347° + Ct −6° = 341° → 161°).
  const t4 = p.trazos[3];
  assert.equal(t4.titulo, 'Demora de Isla de Tarifa');
  assert.equal(opc(dec(t4, 'valor'), (o) => o.ok).texto, '341°');
  assert.match(opc(dec(t4, 'sentido'), (o) => o.ok).texto, /^161°: la opuesta/);
  const rayo = t4.items.find((it) => it.t === 'ray');
  assert.deepEqual(rayo.from, chart.point('isla-tarifa'));
  assert.ok(angleDist(rayo.bearing, 161) < 1);
  assert.match(rayo.label, /^Dv 341° Isla de Tarifa$/);
  // Con el segundo trazo de la operación sale la situación observada, con su rótulo.
  assert.ok(p.trazos[4].items.some((it) => it.t === 'pos' && it.label === 'Situación observada 17:00'));
  // La pista del valor: la cuenta de la Ct y de la Dv, sin el resultado.
  assert.ok(t4.pista.some((x) => /Dv = Da \+ Ct/.test(x)));
  assert.ok(!t4.pista.some((x) => /341/.test(x)));
});

test('intenciones equivocadas en una demora: valor, faro, sentido y acción, cada una con su error y su trazo', () => {
  const q = porId.get(DEMORAS); const p = plan(DEMORAS); const t = 3; const t4 = p.trazos[t];
  // Valor: la Ct con el signo cambiado (347° + 6° = 353°).
  const malV = opc(dec(t4, 'valor'), (o) => o.texto === '353°');
  assert.deepEqual(elegir(dec(t4, 'valor'), malV.id), { ok: false, error: 'signo-ct', posibles: null, frase: `${AVISOS['signo-ct'].has}.`, regla: AVISOS['signo-ct'].no });
  const iv = intento({ sol: sol(DEMORAS), q, chart, plan: p, t, opcion: malV });
  assert.ok(angleDist(iv[0].bearing, norm360(353 + 180)) < 1e-6, 'desde el faro, la opuesta de la demora equivocada');
  assert.equal(iv[0].style, 'intento');
  assert.match(iv[0].label, /^Tu trazo: 353°/);
  // Faro equivocado: el mismo trazo, desde el otro faro.
  const malF = opc(dec(t4, 'objeto'), (o) => !o.ok);
  assert.equal(elegir(dec(t4, 'objeto'), malF.id).error, 'faro-equivocado');
  const ifaro = intento({ sol: sol(DEMORAS), q, chart, plan: p, t, opcion: malF });
  assert.deepEqual(ifaro[0].from, chart.point(malF.id));
  // Sentido: la demora tal cual desde el faro (sin la opuesta).
  const malS = opc(dec(t4, 'sentido'), (o) => !o.ok);
  assert.equal(elegir(dec(t4, 'sentido'), malS.id).error, 'demora-sin-opuesta');
  assert.ok(angleDist(intento({ sol: sol(DEMORAS), q, chart, plan: p, t, opcion: malS })[0].bearing, 341) < 1e-6);
  // Acción: un rumbo donde va una demora (trazo equivocado) o lo que va después (fuera de orden).
  const acc = dec(t4, 'accion');
  for (const o of acc.opciones.filter((x) => !x.ok)) {
    const r = elegir(acc, o.id);
    assert.ok(ERRORES_DE_TRAZADO.includes(r.error), r.error);
    assert.equal(r.error === 'orden-trazado', p.trazos.slice(t + 1).some((x) => x.accion === o.id), o.id);
  }
  assert.equal(elegir(acc, 'unir-situaciones').error, 'orden-trazado');
  assert.deepEqual(intento({ sol: sol(DEMORAS), q, chart, plan: p, t, opcion: opc(acc, (o) => !o.ok) }), []);
});

test('al terminar: con todo bien a la primera, el resultado de la resolución; con un error, otro', () => {
  const q = porId.get(DEMORAS); const p = plan(DEMORAS);
  const bien = compararFinal({ sol: sol(DEMORAS), q, chart, plan: p, primeras: bienSalvo(p) });
  assert.ok(bien.igual);
  assert.deepEqual(bien.lineas.map((l) => l.bueno), ['064°', '2,1 nudos']);
  assert.deepEqual(bien.lineas.map((l) => l.que), ['Rc', 'Ihc']);
  // La Ct con el signo cambiado en la demora de Tarifa: otra situación observada y, con ella, otra corriente.
  const malV = opc(dec(p.trazos[3], 'valor'), (o) => o.texto === '353°');
  const mal = compararFinal({ sol: sol(DEMORAS), q, chart, plan: p, primeras: bienSalvo(p, { 3: { [dec(p.trazos[3], 'valor').id]: malV.id } }) });
  assert.ok(!mal.igual);
  assert.notEqual(mal.lineas[0].tuyo, '064°');
  // «Dímelo» no cambia nada (no es una elección equivocada).
  assert.deepEqual(cambiosDe(p, bienSalvo(p, { 0: { accion: 'dimelo' } })), {});
});

test('situación por traslado: la línea se traslada; cortarla tal cual (sin traslado) da otra situación', () => {
  const q = porId.get(TRASLADO); const p = plan(TRASLADO);
  assert.deepEqual(p.trazos.map((t) => t.accion), ['demora', 'trasladar', 'demora']);
  const tr = p.trazos[1];
  assert.equal(tr.decisiones[1].id, 'sentido', 'primero, qué se hace con la línea');
  const sin = opc(dec(tr, 'sentido'), (o) => o.id === 'tal-cual');
  assert.equal(elegir(dec(tr, 'sentido'), sin.id).error, 'sin-traslado');
  assert.equal(elegir(dec(tr, 'sentido'), 'reves').error, 'traslado-al-reves');
  // La distancia navegada con minutos leídos como décimas: su error con nombre.
  const dist = tr.decisiones.find((d) => d.pregunta === '¿Qué distancia navegada?');
  assert.deepEqual(elegir(dist, opc(dist, (o) => !o.ok).id).error, 'horas-decimales');
  const r = compararFinal({ sol: sol(TRASLADO), q, chart, plan: p, primeras: bienSalvo(p, { 1: { sentido: sin.id } }) });
  assert.equal(r.lineas[0].que, 'Situación');
  assert.ok(r.millas > 1, `a ${r.millas} millas`);
  // Dos errores que dan la misma demora: se dicen los dos y no se apunta ninguno.
  const v = dec(p.trazos[0], 'valor');
  const dos = v.opciones.find((o) => o.errores?.length === 2);
  assert.ok(dos);
  const e = elegir(v, dos.id);
  assert.equal(e.error, null);
  assert.match(e.frase, /^Puede ser «.+» o «.+»\.$/);
});

test('tangente y corriente: la banda, el rumbo directo y la corriente al revés', () => {
  const q = porId.get(TANGENTE); const p = plan(TANGENTE);
  assert.deepEqual(p.trazos.map((t) => t.accion), ['al-del-faro', 'tangente', 'corriente']);
  const tg = p.trazos[1];
  const s = dec(tg, 'sentido');
  assert.equal(opc(s, (o) => o.ok).texto, 'Tangente al arco, dejando el faro por babor');
  assert.equal(elegir(s, 'otra').error, 'banda');
  assert.equal(elegir(s, 'directo').error, 'directo');
  // El arco y el rumbo, rotulados.
  assert.deepEqual(tg.items.map((it) => it.label), ['5,0 millas de Cabo Espartel', 'Rv 259°']);
  // Con la otra banda, la app traza otra tangente (la del kit con el error).
  const otra = intento({ sol: sol(TANGENTE), q, chart, plan: p, t: 1, opcion: opc(s, (o) => o.id === 'otra') });
  const vec = otra.find((it) => it.t === 'vec');
  assert.ok(angleDist(vec.bearing, 259) > 10);
  // La banda ya se decidió en la tangente: el triángulo no vuelve a preguntar por ella en el rumbo efectivo.
  const tri = p.trazos[2];
  assert.ok(!tri.decisiones.some((d) => d.opciones.some((o) => o.errores?.includes('banda'))));
  const c = dec(tri, 'sentido');
  assert.equal(elegir(c, 'viene').error, 'corriente-invertida');
  assert.equal(elegir(c, 'sin').error, 'sin-corriente');
  // La respuesta final (el Ra) sale de la resolución con la otra banda.
  const r = compararFinal({ sol: sol(TANGENTE), q, chart, plan: p, primeras: bienSalvo(p, { 1: { sentido: 'otra' } }) });
  assert.ok(!r.igual);
  assert.deepEqual(p.finales.map((f) => f.title), ['Rumbo verdadero a dar', 'Corrección total', 'Rumbo de aguja']);
});

test('al … del faro y corriente efectiva: el lado del faro y la velocidad efectiva sumada', () => {
  const p = plan(CORRIENTE);
  assert.deepEqual(p.trazos.map((t) => t.accion), ['al-del-faro', 'al-del-faro', 'corriente', 'rumbo', 'unir']);
  const s = dec(p.trazos[0], 'sentido');
  assert.equal(opc(s, (o) => o.ok).texto, '180°: hacia el S');
  assert.equal(elegir(s, 'opuesta').error, 'lado-del-faro');
  // La primera acción: componer la corriente antes de situarse es fuera de orden.
  assert.equal(elegir(dec(p.trazos[0], 'accion'), 'corriente').error, 'orden-trazado');
  // La velocidad efectiva: sumar la corriente en vez de componer vectores.
  const vef = p.trazos[3].decisiones.find((d) => /Vef/.test(d.pregunta));
  assert.equal(elegir(vef, opc(vef, (o) => !o.ok).id).error, 'corriente-sumada');
  // La corriente al revés ya se decidió en el triángulo: no vuelve en el rumbo efectivo de la estima.
  assert.ok(!p.trazos[3].decisiones.some((d) => d.opciones.some((o) => o.errores?.includes('corriente-invertida'))));
  assert.match(textoIntencion(p, { t: 1, hechos: 1, fallos: ['lado-del-faro'] }), /CARTA POR INTENCIÓN: 1 de 5 trazos.*\n {2}1\. Al S de Punta Paloma\n {2}Errores al elegir: Al otro lado del faro/);
});

test('barrido del banco de práctica: cada plan cuadra con su resolución y cada error tiene nombre', () => {
  let n = 0; let conPlan = 0; let opciones = 0; const sinPlan = [];
  for (const [j, q] of practica.entries()) {
    const s = SOLUCIONES[q.id];
    const k = createKit(chart);
    try { s.solve(k, q); } catch { continue; }
    if (!k.items.length) continue;
    n += 1;
    const p = planIntencion({ sol: s, q, chart });
    if (!p) { sinPlan.push(q.id); continue; }
    conPlan += 1;
    assert.ok(p.trazos.length > 0, q.id);
    for (const t of p.trazos) {
      assert.ok(ACCIONES[t.accion], `${q.id}: ${t.accion}`);
      assert.ok(t.items.length, `${q.id}: «${t.titulo}» no dibuja nada`);
      // Lo que se dibuja con todo bien son los trazos del kit (la misma geometría), rotulados.
      const delKit = k.items.slice(...k.ops[t.j].items);
      for (const it of t.items) assert.ok(delKit.some((x) => x.t === it.t && JSON.stringify({ ...x, label: 0, step: 0 }) === JSON.stringify({ ...it, label: 0, step: 0 })), `${q.id}: trazo ajeno al kit`);
      assert.ok(t.items.some((it) => it.label), `${q.id}: «${t.titulo}» sin rótulo`);
      assert.equal(t.decisiones[0].id, 'accion');
      for (const d of t.decisiones) {
        assert.equal(d.opciones.filter((o) => o.ok).length, 1, `${q.id}: ${d.pregunta}`);
        assert.ok(d.opciones.length >= 2 && d.opciones.length <= 4, `${q.id}: ${d.pregunta} con ${d.opciones.length} opciones`);
        assert.equal(new Set(d.opciones.map((o) => o.texto)).size, d.opciones.length, `${q.id}: opciones repetidas en ${d.pregunta}`);
        for (const o of d.opciones.filter((x) => !x.ok)) {
          opciones += 1;
          assert.ok(o.errores?.length >= 1 && o.errores.length <= 2 && o.errores.every((e) => ERRORES[e] && AVISOS[e]), `${q.id}: ${d.pregunta} → ${o.texto} sin error con nombre`);
          assert.ok(d.id === 'accion' || o.cambio, `${q.id}: ${d.pregunta} → ${o.texto} sin cambio`);
        }
      }
    }
    // Con todas las elecciones bien, la pregunta se resuelve igual que la resolución (y en la mitad, comprobado).
    if (j % 2 === 0) assert.ok(compararFinal({ sol: s, q, chart, plan: p, primeras: bienSalvo(p) }).igual, `${q.id}: bien a la primera no da la resolución`);
  }
  // Todas las que tienen algo que trazar (también las distancias no simultáneas con arcos). Solo quedarían fuera la
  // estima analítica (tramos, que no se traza) y las que solo sitúan puntos dados.
  let fuera = 0;
  for (const id of sinPlan) {
    const k = createKit(chart); SOLUCIONES[id].solve(k, porId.get(id));
    const trazos = k.ops.filter((o) => o.op !== 'pos' && o.items[1] > o.items[0]);
    assert.ok(!trazos.length || trazos.every((o) => o.op === 'tramos'), `${id} sin plan`);
    fuera += 1;
  }
  // Las 1124 de práctica con algo que trazar, todas (antes, 1112: faltaban las 12 de arcos no simultáneos).
  assert.equal(conPlan, n - fuera);
  assert.ok(conPlan >= 1124, `solo ${conPlan} preguntas con trazo por intención`);
  assert.ok(opciones > 5000, `solo ${opciones} opciones equivocadas`);
});

test('barrido: un valor equivocado con un solo error se traza como lo trazaría quien lo comete', () => {
  let n = 0;
  for (const q of practica.filter((x) => x.id.startsWith('and-py'))) {
    const p = planIntencion({ sol: SOLUCIONES[q.id], q, chart });
    if (!p) continue;
    p.trazos.forEach((t, i) => {
      if (t.accion !== 'demora') return;
      const v = dec(t, 'valor');
      for (const o of v?.opciones.filter((x) => !x.ok && x.errores.length === 1) ?? []) {
        const rayo = intento({ sol: SOLUCIONES[q.id], q, chart, plan: p, t: i, opcion: o }).find((it) => it.t === 'ray');
        if (!rayo) continue; // las líneas no se cortan: no hay qué dibujar
        assert.ok(angleDist(rayo.bearing, norm360(o.valor + 180)) < 1e-6, `${q.id}: ${o.texto}`);
        n += 1;
      }
    });
  }
  assert.ok(n >= 20, `solo ${n}`);
});

test('cobertura del PY de Andalucía: situación por demoras, corrección total, corriente y tangente', () => {
  const tipos = {};
  for (const q of practica.filter((x) => x.id.startsWith('and-py'))) {
    const p = planIntencion({ sol: SOLUCIONES[q.id], q, chart });
    if (!p) continue;
    for (const t of p.trazos) tipos[t.op] = (tipos[t.op] ?? 0) + 1;
  }
  for (const op of ['fix2', 'tangent', 'efectivo', 'rumboConCorriente', 'rumboYVelocidad', 'corrienteDesconocida', 'oposicion', 'enfilacion', 'fromMark', 'traslado', 'trasladoArco', 'trasladoDosArcos']) {
    assert.ok(tipos[op] > 0, `${op} sin preguntas del PY de Andalucía`);
    assert.ok(TRAZOS[op], op);
  }
});

test('cuaderno: los fallos del trazado se anotan con el origen «traza»', () => {
  assert.equal(ORIGENES.traza, 'trázalo en la carta');
  for (const e of [...ERRORES_DE_TRAZADO, 'demora-sin-opuesta', 'banda', 'traslado-al-reves']) {
    const r = anotar(null, { error: e, tipo: 'corriente-desconocida', origen: 'traza', q: DEMORAS }, Date.UTC(2026, 10, 16));
    assert.ok(falloValido(r.f), e);
    assert.equal(r.f.ev[0].o, 'traza');
  }
  for (const e of ERRORES_DE_TRAZADO) assert.equal(ERRORES[e].paso, 'trazado');
  // Un rumbo de un faro a otro, por si acaso: la distancia entre faros no cambia por el plan.
  assert.ok(rhumbTo(chart.point('isla-tarifa'), chart.point('punta-cires')).distance > 5);
});

// ---- Distancias no simultáneas con arcos (las 12 que faltaban): trazar el arco (o la demora), trasladar la línea o el
// centro del arco con el rumbo y la distancia navegados, y cortar con el segundo arco.
const ARCOS = {
  trasladoDosArcos: ['and-py-2022-c3-n17', 'and-py-2023-c2-n16', 'and-py-2015-c2-n12', 'and-py-2018-c1-n17', 'and-py-2019-c1-n17', 'and-py-2019-c3-n16', 'bal-py-2021-06-ac-36', 'bal-py-2025-12-a-33'],
  trasladoArco: ['and-py-2022-c2-n17', 'and-py-2025-c1-n14', 'dgmm-py-2023-11-34', 'bal-py-2020-12-b-38'],
};

test('arcos no simultáneos: las 12 preguntas tienen su plan, con el traslado entre el primer trazo y el arco', () => {
  for (const [op, ids] of Object.entries(ARCOS)) {
    for (const id of ids) {
      assert.ok(porId.has(id), `${id} no está en la práctica`);
      const p = plan(id);
      assert.ok(p, `${id} sin plan`);
      const i = p.trazos.findIndex((t) => t.op === op);
      const [a, b, c] = p.trazos.slice(i, i + 3);
      assert.deepEqual([a.accion, b.accion, c.accion], op === 'trasladoDosArcos' ? ['arco', 'trasladar-arco', 'arco'] : ['demora', 'trasladar', 'arco'], id);
      // Primero qué se hace con la primera línea; después el rumbo y la distancia navegados, si hay valores equivocados.
      assert.equal(b.decisiones[1].id, 'sentido', id);
      const s = dec(b, 'sentido');
      assert.equal(elegir(s, 'tal-cual').error, 'sin-traslado', id);
      assert.equal(elegir(s, 'reves').error, 'traslado-al-reves', id);
      // El corte, rotulado, sale con el segundo arco.
      assert.ok(c.items.some((it) => it.t === 'arc' && it.label) && c.items.some((it) => it.t === 'pos' && /^Situación/.test(it.label)), id);
      assert.ok(compararFinal({ sol: sol(id), q: porId.get(id), chart, plan: p, primeras: bienSalvo(p) }).igual, id);
    }
  }
});

test('dos distancias no simultáneas: el primer arco, el traslado de su centro y el corte con el segundo', () => {
  const id = 'and-py-2022-c3-n17'; const q = porId.get(id); const p = plan(id);
  const k = createKit(chart); sol(id).solve(k, q);
  const op = k.ops.find((o) => o.op === 'trasladoDosArcos');
  const [, , , , rumbo, millas] = op.args;
  // 1. El arco de 4 millas con centro en Cabo Espartel (el del kit, donde se tomó la distancia).
  const [t1, t2, t3] = p.trazos;
  assert.equal(t1.titulo, 'Distancia a Cabo Espartel');
  const arc1 = t1.items.find((it) => it.t === 'arc');
  assert.deepEqual(arc1.center, chart.point('cabo-espartel'));
  assert.equal(arc1.radius, 4);
  assert.equal(arc1.label, '4,0 millas de Cabo Espartel');
  // 2. El centro, trasladado 070° y 6 millas; el arco trasladado, con el mismo radio.
  assert.equal(t2.titulo, 'Traslado del centro del primer arco');
  const vec = t2.items.find((it) => it.t === 'vec');
  assert.equal(vec.bearing, rumbo); assert.equal(vec.length, millas);
  assert.equal(vec.label, '070° · 6,0 millas');
  const arc2 = t2.items.find((it) => it.t === 'arc');
  assert.equal(arc2.radius, 4);
  assert.ok(Math.abs(rhumbTo(chart.point('cabo-espartel'), arc2.center).distance - 6) < 1e-6);
  // 3. El 2º arco desde Punta Malabata y la situación.
  assert.equal(t3.titulo, 'Distancia a Punta Malabata');
  // Traslado al revés: la app traza el centro llevado con el rumbo opuesto y sale otra situación.
  const reves = opc(dec(t2, 'sentido'), (o) => o.id === 'reves');
  const iv = intento({ sol: sol(id), q, chart, plan: p, t: 1, opcion: reves });
  assert.ok(angleDist(iv.find((it) => it.t === 'vec').bearing, norm360(rumbo + 180)) < 1e-9);
  assert.equal(iv[0].style, 'intento');
  assert.match(iv[0].label, /^Tu trazo: Traslado su centro hacia atrás/);
  const r = compararFinal({ sol: sol(id), q, chart, plan: p, primeras: bienSalvo(p, { 1: { sentido: 'reves' } }) });
  assert.ok(!r.igual && r.millas > 1, `a ${r.millas} millas`);
  // Sin trasladar: el arco se queda en su sitio y sale otra situación.
  const sin = compararFinal({ sol: sol(id), q, chart, plan: p, primeras: bienSalvo(p, { 1: { sentido: 'tal-cual' } }) });
  assert.ok(!sin.igual && sin.millas > 1);
  // Al acabar, «Trazo n de 3» y su resumen.
  assert.match(textoIntencion(p, { t: 3, hechos: 3, fallos: ['traslado-al-reves'] }), /3 de 3 trazos hechos\.\n {2}1\. Distancia a Cabo Espartel\n {2}2\. Traslado del centro del primer arco\n {2}3\. Distancia a Punta Malabata\n {2}Errores al elegir: Traslado al revés/);
});

test('arcos no simultáneos: la distancia navegada y el rumbo navegado equivocados tienen su error con nombre', () => {
  // La distancia navegada con los minutos leídos como décimas (1 h 30 min → 1,30 h): 7,8 millas en vez de 9.
  const p = plan('and-py-2019-c3-n16');
  const dist = p.trazos[1].decisiones.find((d) => d.pregunta === '¿Qué distancia navegada?');
  assert.equal(opc(dist, (o) => o.ok).texto, '9,0 millas');
  const mal = opc(dist, (o) => !o.ok);
  assert.equal(mal.texto, '7,8 millas');
  assert.equal(elegir(dist, mal.id).error, 'horas-decimales');
  const q = porId.get('and-py-2019-c3-n16');
  const iv = intento({ sol: sol('and-py-2019-c3-n16'), q, chart, plan: p, t: 1, opcion: mal });
  assert.ok(Math.abs(iv.find((it) => it.t === 'vec').length - mal.valor) < 1e-9, 'el traslado se dibuja con la distancia equivocada');
  // El rumbo navegado con la Ct cambiada (la corrección total, antes del traslado).
  const p2 = plan('and-py-2015-c2-n12');
  const rumbo = p2.trazos[1].decisiones.find((d) => d.pregunta === '¿Qué rumbo navegado?');
  assert.equal(opc(rumbo, (o) => o.ok).texto, '073°');
  assert.equal(elegir(rumbo, opc(rumbo, (o) => o.texto === '075°').id).error, 'sin-ct');
  // Demora y distancia no simultáneas (Baleares): la demora con la Ct y, en el traslado, la distancia de 5 h 15 min.
  const p3 = plan('bal-py-2020-12-b-38');
  const d3 = p3.trazos[1].decisiones.find((d) => d.pregunta === '¿Qué distancia navegada?');
  assert.equal(elegir(d3, opc(d3, (o) => !o.ok).id).error, 'horas-decimales');
});

test('demora y distancia no simultáneas: un traslado equivocado que no llega al arco se dibuja igual', () => {
  const id = 'and-py-2022-c2-n17'; const q = porId.get(id); const p = plan(id);
  const t = p.trazos.findIndex((x) => x.accion === 'trasladar');
  for (const s of ['reves', 'tal-cual']) {
    const o = opc(dec(p.trazos[t], 'sentido'), (x) => x.id === s);
    const iv = intento({ sol: sol(id), q, chart, plan: p, t, opcion: o });
    assert.deepEqual(iv.map((it) => it.t), ['vec', 'line'], s);
    const r = compararFinal({ sol: sol(id), q, chart, plan: p, primeras: bienSalvo(p, { [t]: { sentido: s } }) });
    assert.ok(r.roto, `${s}: la línea trasladada no corta el arco`);
  }
  // El kit con el traslado al revés: la variante del error (la misma en el diagnóstico y en la hoja en papel).
  const k = createKit(chart, { error: 'traslado-al-reves' });
  assert.throws(() => sol(id).solve(k, q), /Sin corte/);
  const k2 = createKit(chart, { error: 'traslado-al-reves' });
  const v = sol('and-py-2022-c3-n17').solve(k2, porId.get('and-py-2022-c3-n17'));
  const b = sol('and-py-2022-c3-n17').solve(createKit(chart), porId.get('and-py-2022-c3-n17'));
  assert.ok(rhumbTo({ lat: v[0].value, lon: v[1].value }, { lat: b[0].value, lon: b[1].value }).distance > 1);
});
