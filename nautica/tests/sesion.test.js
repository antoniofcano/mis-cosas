// Sesión de estudio de Hoy: fase deducida del estado del alumno, pasos compuestos con lo que propone el motor y estado
// de la sesión en marcha (parar, recargar, terminar). Con datos reales del PER y del PY.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { estadoAlumno } from '../src/course/motor.js';
import { PER, PY } from '../src/theory/blocks.js';
import { leccionesDe } from '../src/course/engine.js';
import { cursoDe, bancosNode, EJE_POR_DEFECTO } from '../tools/bancos/leer.mjs';
import {
  deducirFase, textoFase, componerSesion, nuevaSesion, sesionDeHoy, indiceActual, arrancar, marcarHecho, saltar, pausar, cerrar,
  terminada, rutaDelPaso, pasoEnRuta, resumenSesion, lineaManana, temaVisto, DIAS_COMPROBAR,
} from '../src/course/sesion.js';
import { diaISO } from '../src/texto.js';

const BANCOS = { per: await bancosNode().cargarBanco(EJE_POR_DEFECTO, 'per'), py: await bancosNode().cargarBanco(EJE_POR_DEFECTO, 'py') };
const ESTR = { per: PER, py: PY };
const AHORA = new Date(2026, 9, 8, 18, 0).getTime();
const DIA = 864e5;

function estado(tit, { regs = {}, respuestas = {}, settings = {}, tests = [], testEnCurso = null, ahora = AHORA } = {}) {
  const b = BANCOS[tit];
  return estadoAlumno({ tit, estructura: ESTR[tit], curso: cursoDe(tit), preguntas: b.estudio, regs, respuestas, tests, testEnCurso,
    settings: { minutosDia: 20, ...settings }, minutosHoy: 0, racha: 0, planGuardado: null, ahora, reserva: b.reserva, pool: b.final, reservadas: b.reservadas });
}

/** Todas las clases vistas (y practicadas) de una titulación. */
function todoVisto(tit) {
  const regs = {};
  for (const l of leccionesDe(cursoDe(tit))) regs[l.id] = { visto: true, caja: 1, proximo: AHORA + 5 * DIA, tramo: 0, paso: 0 };
  return regs;
}

test('alumno nuevo: fase aprender y una sesión que empieza por la primera clase', () => {
  for (const tit of ['per', 'py']) {
    const st = estado(tit);
    const f = deducirFase(st);
    assert.equal(f.id, 'aprender', tit);
    assert.equal(f.vistos, 0);
    assert.equal(f.total, ESTR[tit].bloques.length);
    assert.match(f.detalle, /^Llevas 0 de \d+ temas$/);
    const s = componerSesion(st, f.id);
    assert.ok(s.pasos.length >= 1, tit);
    assert.equal(s.pasos[0].tipo, 'clase', `${tit}: empieza por una clase`);
    assert.equal(s.pasos[0].titulo, 'Clase nueva');
    assert.deepEqual(s.pasos[0].ruta.slice(0, 1), ['curso']);
    assert.equal(s.minutos, s.pasos.reduce((x, p) => x + p.minutos, 0));
    // Sin fallos ni temas empezados: ni repaso de fallos ni mezclado.
    assert.ok(!s.pasos.some((p) => p.tipo === 'fallos' || p.tipo === 'mezclado'));
  }
});

test('con fallos que vuelven hoy, la sesión de aprender empieza por ellos', () => {
  const qs = BANCOS.per.estudio.filter((q) => q.ut === ESTR.per.bloques[0].ut).slice(0, 4);
  const ayer = diaISO(AHORA - DIA);
  const respuestas = Object.fromEntries(qs.map((q) => [q.id, { ok: false, t: new Date(AHORA - DIA).toISOString(), rep: { racha: 0, prox: ayer } }]));
  const st = estado('per', { respuestas });
  assert.equal(st.repaso.hoy, 4);
  const s = componerSesion(st, deducirFase(st).id);
  assert.equal(s.pasos[0].tipo, 'fallos');
  assert.deepEqual(s.pasos[0].ruta, ['teoria', 'repaso']);
  assert.match(s.pasos[0].sub, /^4 preguntas que fallaste/);
  assert.ok(s.pasos.some((p) => p.tipo === 'clase'), 'y después, la clase');
});

test('con todas las clases vistas: fase mezclar', () => {
  for (const tit of ['per', 'py']) {
    const st = estado(tit, { regs: todoVisto(tit) });
    assert.ok(st.temas.every((t) => !t.e.clases.total || temaVisto(t.e)), tit);
    const f = deducirFase(st);
    assert.equal(f.id, 'mezclar', tit);
    assert.equal(f.detalle, 'Temario visto');
    const s = componerSesion(st, f.id);
    assert.ok(s.pasos.length >= 1);
    assert.ok(!s.pasos.some((p) => p.tipo === 'clase' && p.titulo === 'Clase nueva'), 'en mezclar no hay clase nueva');
  }
});

test('examen a ≤ 14 días: fase comprobar con simulacro primero', () => {
  const fecha = diaISO(AHORA + 10 * DIA);
  const st = estado('per', { settings: { examen_per: fecha } });
  const f = deducirFase(st);
  assert.equal(f.id, 'comprobar');
  assert.equal(f.detalle, 'Faltan 10 días');
  const s = componerSesion(st, f.id);
  assert.equal(s.pasos[0].tipo, 'simulacro');
  assert.ok(s.pasos.length <= 2, 'tras un examen, como mucho un paso más');
  // A 15 días todavía no.
  assert.notEqual(deducirFase(estado('per', { settings: { examen_per: diaISO(AHORA + (DIAS_COMPROBAR + 1) * DIA) } })).id, 'comprobar');
  // Fecha pasada: no cuenta.
  assert.equal(deducirFase(estado('per', { settings: { examen_per: diaISO(AHORA - 3 * DIA) } })).id, 'aprender');
});

test('un examen a medias va siempre el primero, en cualquier fase', () => {
  const tc = { tit: 'per', eje: EJE_POR_DEFECTO, tipo: 'simulacro', seed: 7, ids: [], respuestas: {}, i: 0, consumidoMs: 30 * 60000 };
  const st = estado('per', { testEnCurso: tc });
  for (const fase of ['aprender', 'mezclar', 'comprobar']) {
    const s = componerSesion(st, fase);
    assert.equal(s.pasos[0].tipo, 'examen-en-curso', fase);
    assert.equal(s.pasos.filter((p) => p.tipo === 'simulacro').length, 0, `${fase}: no se propone otro simulacro`);
  }
});

test('mirar otra fase no cambia la real; los textos de cada fase', () => {
  const st = estado('per');
  const real = deducirFase(st);
  const m = textoFase('mezclar', real);
  assert.equal(m.id, 'mezclar');
  assert.match(m.porque, /mezclar/);
  assert.equal(textoFase('aprender', real), real);
  assert.equal(deducirFase(st).id, 'aprender');
});

test('los pasos no repiten pantalla y caben en los minutos del día', () => {
  const st = estado('per');
  for (const objetivo of [10, 20, 45]) {
    const s = componerSesion(st, 'aprender', { objetivo });
    const rutas = s.pasos.map((p) => p.ruta.join('/'));
    assert.equal(new Set(rutas).size, rutas.length);
    if (s.pasos.length > 1) assert.ok(s.minutos <= Math.max(15, objetivo) + 5, `${objetivo}: ${s.minutos}`);
  }
});

test('estado de la sesión: empezar, hacer, saltar, parar, terminar (idempotente)', () => {
  const st = estado('per');
  const comp = { fase: 'aprender', pasos: [
    { id: 'fallos:teoria/repaso', tipo: 'fallos', titulo: 'Tus fallos', sub: '', minutos: 4, ruta: ['teoria', 'repaso'], ut: null },
    { id: 'clase:curso/x', tipo: 'clase', titulo: 'Clase nueva', sub: 'X', minutos: 6, ruta: ['curso', 'x'], ut: 1 },
    { id: 'mezclado:teoria/mezcla', tipo: 'mezclado', titulo: 'Repaso mezclado', sub: '', minutos: 8, ruta: ['teoria', 'mezcla'], ut: null },
  ] };
  let s = nuevaSesion('per', comp, { ahora: AHORA, hrefs: ['#/per/teoria/repaso', '#/per/curso/x', '#/per/teoria/mezcla?s=5'] });
  assert.equal(s.dia, diaISO(AHORA));
  assert.equal(indiceActual(s), 0);
  assert.equal(s.pasos[2].href, '#/per/teoria/mezcla?s=5');
  s = arrancar(s, AHORA + 1000);
  assert.equal(s.pasos[0].inicio, AHORA + 1000);
  s = marcarHecho(s, 0, AHORA + 5000);
  const otra = marcarHecho(s, 0, AHORA + 9000);
  assert.equal(otra.pasos[0].fin, AHORA + 5000, 'marcar dos veces no cambia el fin');
  assert.equal(indiceActual(s), 1);
  s = pausar(arrancar(s, AHORA + 6000));
  assert.equal(s.estado, 'pausada');
  // Recargar: lo guardado es JSON y vuelve igual.
  s = JSON.parse(JSON.stringify(s));
  assert.equal(sesionDeHoy(s, AHORA + 7000), s);
  assert.equal(sesionDeHoy(s, AHORA + DIA), null, 'la de ayer no vale hoy');
  assert.equal(sesionDeHoy({ ...s, v: 99 }, AHORA), null);
  s = saltar(s, 1, AHORA + 8000);
  assert.equal(s.pasos[1].estado, 'saltado');
  assert.ok(!terminada(s));
  s = marcarHecho(s, 2, AHORA + 9000);
  assert.ok(terminada(s));
  s = cerrar(s, AHORA + 10000);
  assert.equal(s.estado, 'hecha');
  assert.equal(cerrar(s, AHORA + 20000).fin, AHORA + 10000);
  assert.equal(arrancar(s, AHORA + 30000).estado, 'hecha', 'una sesión terminada no se reabre');
  void st;
});

test('la dirección de cada paso: se compara el camino, no la semilla', () => {
  const p = { ruta: ['teoria', 'ut', '3'] };
  assert.ok(rutaDelPaso(p, 'per', ['per', 'teoria', 'ut', '3']));
  assert.ok(!rutaDelPaso(p, 'per', ['py', 'teoria', 'ut', '3']));
  assert.ok(!rutaDelPaso(p, 'per', ['per', 'teoria', 'ut']));
  const s = { tit: 'per', pasos: [{ ruta: ['teoria', 'repaso'] }, { ruta: ['test', 'simulacro'] }] };
  assert.equal(pasoEnRuta(s, ['per', 'test', 'simulacro']), 1);
  assert.equal(pasoEnRuta(s, ['per', 'temario']), -1);
});

test('resumen: lo respondido durante la sesión, por tema, y los minutos', () => {
  const qs = BANCOS.per.estudio.slice(0, 5);
  const s0 = nuevaSesion('per', { fase: 'aprender', pasos: [{ id: 'a', tipo: 'fallos', titulo: 'T', sub: '', minutos: 5, ruta: ['teoria', 'repaso'] }] }, { ahora: AHORA, minutosAntes: 7 });
  const iso = (ms) => new Date(ms).toISOString();
  const respuestas = {
    [qs[0].id]: { ok: true, t: iso(AHORA + 60000) },
    [qs[1].id]: { ok: false, t: iso(AHORA + 120000) },
    [qs[2].id]: { ok: true, t: iso(AHORA - 60000) }, // de antes de empezar: no cuenta
  };
  const s = cerrar(marcarHecho(s0, 0, AHORA + 180000), AHORA + 180000);
  const r = resumenSesion(s, { respuestas, porId: BANCOS.per.porId, temaDe: (ut) => `Tema ${ut}`, minutosHoy: 19 });
  assert.equal(r.total, 2);
  assert.equal(r.aciertos, 1);
  assert.equal(r.minutos, 12);
  assert.equal(r.hechos, 1);
  assert.ok(r.grupos.length >= 1);
  assert.equal(r.grupos.reduce((x, g) => x + g.total, 0), 2);
});

test('la línea de «Mañana» dice lo que toca', () => {
  const st = estado('per');
  const t = lineaManana(componerSesion(st, 'aprender'), { fallosManana: 3 });
  assert.match(t, /^Clase nueva \(/);
  assert.match(t, /Vuelven 3 preguntas falladas\.$/);
  assert.equal(lineaManana({ pasos: [] }), 'Lo que proponga tu plan.');
});
