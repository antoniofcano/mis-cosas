// Cuaderno de fallos (R-55, R-56): anotar sin duplicar, estados (abierto → vigilando → resuelto, y vuelta a abierto),
// calendario de comprobaciones (fechas inyectables), lo que pide cada fallo hoy, el cuaderno desde los ajustes, la
// actividad del motor y que viaja como ajuste compartido que el Worker desplegado acepta.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  anotar, dosisHecha, comprobacionHecha, pendiente, cuadernoDe, actividadCuaderno, idFallo, claveFallo, partesFallo, falloValido,
  nombreFallo, origenesDe, lineaEstado, DIAS_COMPROBACION, DIAS_TRAS_FALLO, DIAS_VIGILANDO, MAX_VECES, PREFIJO_FALLO,
} from '../src/course/cuaderno.js';
import { esAjusteCompartido, validarOperacion } from '../src/store/sync/operaciones.js';
import { planHoy } from '../src/course/plan.js';
import { pasoDeActividad } from '../src/course/sesion.js';
import { TITULACIONES } from '../src/theory/blocks.js';
import { createProgressStore } from '../src/store/progress.js';
import { anotarFallosDeExamen } from '../src/ui/cuaderno.js';
import { todosLosIndices } from '../tools/indice-errores.mjs';
import { bancosNode } from '../tools/bancos/leer.mjs';
import { chart } from './helpers.js';
import { SOLUCIONES } from '../src/bancos/soluciones.js';
import { createKit } from '../src/exams/kit.js';
import { diagnosticarPaso } from '../src/exams/avisos-pasos.js';

const DIA = 864e5;
const T0 = new Date(2026, 10, 16, 10, 0).getTime(); // lunes 16 de noviembre de 2026, 10:00 local
const en = (dias, h = 10) => new Date(2026, 10, 16 + dias, h, 0).getTime();
const iso = (ms) => new Date(ms).toLocaleDateString('sv-SE');

const primera = () => anotar(null, { error: 'adelanto-signo', tipo: 'marea-sonda', origen: 'paso', q: 'and-2024-c1-t07' }, T0);

test('anotar: un fallo nuevo, con nombre, tipo, paso y de dónde salió', () => {
  const r = primera();
  assert.equal(r.nuevo, true);
  assert.equal(r.contado, true);
  assert.equal(r.f.e, 'adelanto-signo');
  assert.equal(r.f.y, 'marea-sonda');
  assert.equal(r.f.n, 1);
  assert.equal(r.f.est, 'abierto');
  assert.equal(r.f.ev[0].o, 'paso');
  assert.ok(falloValido(r.f));
  const n = nombreFallo(r.f);
  assert.equal(n.titulo, 'Adelanto al revés');
  assert.equal(n.donde, 'Marea y sonda · Hora oficial y UT');
  assert.equal(idFallo('adelanto-signo', 'marea-sonda'), 'adelanto-signo.marea-sonda');
  assert.deepEqual(partesFallo('adelanto-signo.marea-sonda'), { error: 'adelanto-signo', tipo: 'marea-sonda' });
});

test('anotar: la misma pregunta el mismo día cuenta una vez (paso guiado y opción final no se duplican)', () => {
  const r1 = primera();
  const r2 = anotar(r1.f, { error: 'adelanto-signo', tipo: 'marea-sonda', origen: 'pregunta', q: 'and-2024-c1-t07' }, T0 + 60e3);
  assert.equal(r2.contado, false);
  assert.equal(r2.f.n, 1);
  const r3 = anotar(r1.f, { error: 'adelanto-signo', tipo: 'marea-sonda', origen: 'pregunta', q: 'and-2024-c1-t07' }, en(1));
  assert.equal(r3.contado, true);
  assert.equal(r3.f.n, 2);
  // Otra pregunta, mismo día: cuenta.
  const r4 = anotar(r1.f, { error: 'adelanto-signo', tipo: 'marea-sonda', origen: 'simulacro', q: 'otra' }, T0 + 120e3);
  assert.equal(r4.f.n, 2);
  assert.deepEqual(origenesDe(r4.f), ['simulacro', 'paso a paso']);
});

test('anotar: alias de los ejercicios generados y errores fuera de la taxonomía', () => {
  assert.equal(anotar(null, { error: 'adelanto', tipo: 'hora', origen: 'ejercicio', q: 'ej:hora:1' }, T0).f.e, 'adelanto-signo');
  assert.equal(anotar(null, { error: 'resta-al-reves', tipo: 'ct-enfilacion', origen: 'ejercicio' }, T0).f.e, 'signo-ct');
  assert.equal(anotar(null, { error: 'salida-invertida', tipo: 'estima-directa', origen: 'ejercicio' }, T0), null);
  // Un tipo raro se guarda como «carta».
  assert.equal(anotar(null, { error: 'signo-ct', tipo: 'Raro Tipo!', origen: 'pregunta' }, T0).f.y, 'carta');
});

test('anotar: guarda solo las últimas veces (el valor no crece sin límite)', () => {
  let f = null;
  for (let i = 0; i < 30; i++) f = anotar(f, { error: 'lineal', tipo: 'marea-sonda', origen: 'pregunta', q: `q${i}` }, T0 + i * 1000).f;
  assert.equal(f.n, 30);
  assert.equal(f.ev.length, MAX_VECES);
  assert.ok(JSON.stringify(f).length < 1024);
});

test('calendario: dosis superada → comprobación a los 3 días; dos bien → resuelto', () => {
  let f = primera().f;
  assert.equal(pendiente(f, T0), 'dosis');
  // Dosis floja (3 de 5): sigue pidiendo dosis.
  f = dosisHecha(f, { aciertos: 3, total: 5 }, T0 + 1000);
  assert.equal(f.dosis.ok, false);
  assert.equal(pendiente(f, T0), 'dosis');
  // Dosis superada (4 de 5): comprobación a los 3 días.
  f = dosisHecha(f, { aciertos: 4, total: 5 }, T0 + 2000);
  assert.equal(f.comp.prox, iso(en(DIAS_COMPROBACION)));
  assert.equal(pendiente(f, en(1)), null);
  assert.equal(pendiente(f, en(2, 23)), null);
  assert.equal(pendiente(f, en(3, 8)), 'comprobar');
  assert.match(lineaEstado(f, en(1)), /falta la comprobación/);
  // Bien: vigilando, la siguiente a 7 días.
  f = comprobacionHecha(f, { ok: true, q: 'x' }, en(3));
  assert.equal(f.est, 'vigilando');
  assert.equal(f.comp.prox, iso(en(3 + DIAS_VIGILANDO)));
  assert.equal(pendiente(f, en(5)), null);
  assert.equal(pendiente(f, en(10)), 'comprobar');
  // Bien otra vez: resuelto.
  f = comprobacionHecha(f, { ok: true }, en(10));
  assert.equal(f.est, 'resuelto');
  assert.equal(pendiente(f, en(30)), null);
  assert.match(lineaEstado(f), /Resuelto/);
});

test('calendario: comprobación mal → abierto, dosis antes y la siguiente comprobación antes', () => {
  let f = dosisHecha(primera().f, { aciertos: 5, total: 5 }, T0);
  f = comprobacionHecha(f, { ok: false }, en(3));
  assert.equal(f.est, 'abierto');
  assert.equal(f.comp.seguidas, 0);
  assert.equal(pendiente(f, en(3)), 'dosis');
  assert.match(lineaEstado(f, en(3)), /otra dosis/);
  f = dosisHecha(f, { aciertos: 5, total: 5 }, en(3, 12));
  assert.equal(f.comp.prox, iso(en(3 + DIAS_TRAS_FALLO)));
  // Una bien tras una mal no da por resuelto: hacen falta dos seguidas.
  f = comprobacionHecha(f, { ok: true }, en(5));
  assert.equal(f.est, 'vigilando');
});

test('reaparece: vigilando o resuelto vuelve a abierto; esperando la comprobación, vuelve a pedir dosis', () => {
  let f = dosisHecha(primera().f, { aciertos: 5, total: 5 }, T0);
  let r = anotar(f, { error: 'adelanto-signo', tipo: 'marea-sonda', origen: 'pregunta', q: 'otra' }, en(1));
  assert.equal(r.reabierto, true);
  assert.equal(pendiente(r.f, en(1)), 'dosis');
  f = comprobacionHecha(dosisHecha(r.f, { aciertos: 5, total: 5 }, en(1)), { ok: true }, en(4));
  f = comprobacionHecha(f, { ok: true }, en(11));
  assert.equal(f.est, 'resuelto');
  r = anotar(f, { error: 'adelanto-signo', tipo: 'marea-sonda', origen: 'oficial', q: 'z' }, en(20));
  assert.equal(r.reabierto, true);
  assert.equal(r.f.est, 'abierto');
  assert.equal(r.f.n, 3);
  assert.equal(pendiente(r.f, en(20)), 'dosis');
});

test('dosis voluntaria mientras esperas la comprobación: no la retrasa', () => {
  let f = dosisHecha(primera().f, { aciertos: 5, total: 5 }, T0);
  const prox = f.comp.prox;
  f = dosisHecha(f, { aciertos: 5, total: 5 }, en(2));
  assert.equal(f.comp.prox, prox);
  assert.equal(f.dosis.n, 2);
});

test('cuadernoDe: desde los ajustes, agrupado y con lo que pide hoy primero', () => {
  const a = dosisHecha(primera().f, { aciertos: 5, total: 5 }, en(-5)); // ya toca comprobar
  const b = anotar(null, { error: 'signo-ct', tipo: 'conversion-rumbos', origen: 'ejercicio', q: 's1' }, en(-1)).f;
  const c = comprobacionHecha(comprobacionHecha(dosisHecha(anotar(null, { error: 'lineal', tipo: 'marea-sonda', origen: 'pregunta' }, en(-30)).f, { aciertos: 5, total: 5 }, en(-30)), { ok: true }, en(-27)), { ok: true }, en(-20));
  const s = { [claveFallo('adelanto-signo.marea-sonda')]: a, [claveFallo('signo-ct.conversion-rumbos')]: b, [claveFallo('lineal.marea-sonda')]: c, [`${PREFIJO_FALLO}basura`]: { e: 'nada' }, level: 'PY' };
  const cu = cuadernoDe(s, T0);
  assert.deepEqual(cu.lista.map((x) => x.id), ['adelanto-signo.marea-sonda', 'signo-ct.conversion-rumbos', 'lineal.marea-sonda']);
  assert.deepEqual(cu.comprobar.map((x) => x.id), ['adelanto-signo.marea-sonda']);
  assert.deepEqual(cu.dosis.map((x) => x.id), ['signo-ct.conversion-rumbos']);
  assert.equal(cu.resueltos.length, 1);
  assert.equal(cuadernoDe({}, T0).vacio, true);
  // La actividad del motor: la comprobación antes que la dosis.
  const act = actividadCuaderno(cu);
  assert.equal(act.pide, 'comprobar');
  assert.deepEqual(act.ruta, ['fallos', 'comprobar', 'adelanto-signo.marea-sonda']);
  assert.equal(actividadCuaderno({ comprobar: [], dosis: cu.dosis }).ruta[1], 'dosis');
  assert.equal(actividadCuaderno(cuadernoDe({}, T0)), null);
});

test('sincronización: es un ajuste compartido y el Worker desplegado acepta la operación', () => {
  const k = claveFallo('adelanto-signo.marea-sonda');
  assert.ok(esAjusteCompartido(k));
  const op = { i: 'abcd123456.1.x', k: 'v', t: T0, c: 'settings', p: [k], v: primera().f };
  assert.equal(validarOperacion(op, T0), null);
});

test('planHoy: la dosis entra detrás de lo principal, nunca en su lugar', () => {
  const estructura = TITULACIONES.py.estructura;
  const cu = cuadernoDe({ [claveFallo('adelanto-signo.marea-sonda')]: primera().f }, T0);
  const sin = planHoy({ estructura, ahora: T0 });
  const con = planHoy({ estructura, ahora: T0, cuaderno: cu });
  assert.notEqual(con[0].tipo, 'dosis');
  assert.equal(con[0].tipo, sin[0].tipo);
  const d = con.find((a) => a.tipo === 'dosis');
  assert.ok(d, 'propone la dosis');
  assert.deepEqual(d.ruta, ['fallos', 'dosis', 'adelanto-signo.marea-sonda']);
  assert.ok(con.length <= 3);
  // Como paso de la sesión.
  const p = pasoDeActividad(d);
  assert.equal(p.tipo, 'dosis');
  assert.equal(p.minutos, 2);
});

test('examen corregido: cada opción falsa con diagnóstico único entra en el cuaderno con su nombre, una vez por pregunta', async () => {
  const mem = new Map();
  const p = createProgressStore({ getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) });
  const indices = await todosLosIndices();
  const x = indices.find((i) => i.tit === 'py' && i.eje === 'andalucia');
  const banco = await bancosNode().cargarBanco(x.eje, x.tit);
  // Dos preguntas cuya opción falsa es el adelanto al revés, y una acertada.
  const conAdelanto = Object.entries(x.indice.preguntas).filter(([, d]) => Object.values(d).includes('adelanto-signo')).slice(0, 2);
  assert.equal(conAdelanto.length, 2);
  const preguntas = conAdelanto.map(([id]) => banco.porId.get(id));
  const detalle = conAdelanto.map(([, d]) => ({ ok: false, respuesta: Object.keys(d).find((l) => d[l] === 'adelanto-signo') }));
  preguntas.push(preguntas[0]);
  detalle.push({ ok: true, respuesta: preguntas[0].correcta });
  const r = anotarFallosDeExamen({ preguntas, detalle, chart, origen: 'oficial' }, p);
  assert.equal(r.length, 1);
  assert.equal(r[0].nombre.titulo, 'Adelanto al revés');
  assert.equal(r[0].veces, 2);
  assert.equal(r[0].nuevo, true);
  const cu = cuadernoDe(p.settings());
  assert.equal(cu.lista.length, 1);
  assert.equal(cu.lista[0].n, 2);
  assert.deepEqual(origenesDe(cu.lista[0]), ['tu examen oficial']);
  // Repetir la corrección el mismo día no cuenta otra vez.
  anotarFallosDeExamen({ preguntas, detalle, chart, origen: 'oficial' }, p);
  assert.equal(cuadernoDe(p.settings()).lista[0].n, 2);
});

test('paso guiado: el adelanto al revés se reconoce aunque con él la hora UT caiga fuera de la tabla de mareas', async () => {
  const banco = await bancosNode().cargarBanco('andalucia', 'py');
  const q = banco.porId.get('and-py-2020-c1-n19');
  const sol = SOLUCIONES[q.id];
  const k = createKit(chart);
  sol.solve(k, q);
  const i = k.steps.findIndex((s) => s.pide);
  assert.equal(k.steps[i].pide.paso, 'hora-legal');
  // Hora oficial 22:50 con 1 h de adelanto: UT 21:50; con el adelanto sumado, 23:50 (fuera de la tabla del día).
  assert.equal(k.steps[i].pide.campos[0].value, 21 * 60 + 50);
  assert.equal(diagnosticarPaso({ sol, q, chart, i, errores: k.steps[i].errores, pide: k.steps[i].pide, valores: [23 * 60 + 50] }), 'adelanto-signo');
  assert.equal(diagnosticarPaso({ sol, q, chart, i, errores: k.steps[i].errores, pide: k.steps[i].pide, valores: [22 * 60 + 50] }), 'sin-adelanto');
});

test('fechas: el día es local (una dosis a las 23:30 cuenta desde ese día)', () => {
  const tarde = new Date(2026, 10, 16, 23, 30).getTime();
  const f = dosisHecha(primera().f, { aciertos: 5, total: 5 }, tarde);
  assert.equal(f.comp.prox, '2026-11-19');
  assert.equal(pendiente(f, new Date(2026, 10, 19, 0, 5).getTime()), 'comprobar');
  assert.equal(DIA, 864e5);
});
