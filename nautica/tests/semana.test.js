// «La semana antes» (R-33, src/course/semana.js): la prioridad de cada idea, el modo (automático, a mano, salir, cómo
// fue), el reparto día a día (simulacro a mitad, repaso ligero, víspera sin nada nuevo, día del examen sin tarea), el
// recálculo sin castigo al saltarse un día y la cuarentena (nada reservado para el examen final), en PER y PY, con
// juguetes y con los bancos reales. Todas las fechas entran por `ahora`: nada depende del reloj de la máquina.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  estadoModo, leerAjuste, activarManual, salirDelModo, volverAlModo, apuntarHecho, responderComoFue, factorLimite, pesoTema,
  prioridadIdea, ideasPriorizadas, temasPriorizados, ideasFlojas, tandaDeIdeas, repartoDias, planSemana, sesionDeSemana,
  examenesDeLaSemana, rotuloSemana, lineaFaltan, claveSemana, DIAS_MODO, IDEAS_POR_TANDA,
} from '../src/course/semana.js';
import { nuevaSesion } from '../src/course/sesion.js';
import { MIN_TANDA } from '../src/course/plan.js';
import { PER, PY, totalPreguntas } from '../src/theory/blocks.js';
import { esAjusteCompartido } from '../src/store/sync/operaciones.js';
import { indexarCatalogo } from '../src/conceptos/catalogo.js';
import { crearIndiceConceptos } from '../src/conceptos/conceptos.js';
import { crearConceptos } from '../src/conceptos/index.js';
import { createRng } from '../src/math/rng.js';
import { bancosNode, EJE_POR_DEFECTO } from '../tools/bancos/leer.mjs';
import { sumaDiasISO } from '../src/course/calendario.js';

/** Mediodía local de un día 'AAAA-MM-DD' (o la hora que se diga): la fecha del alumno, no la de la máquina. */
const a = (iso, h = 12, m = 0) => { const [y, mo, d] = iso.split('-').map(Number); return new Date(y, mo - 1, d, h, m).getTime(); };
const EXAMEN = '2026-11-21';
const hoyK = (k) => sumaDiasISO(EXAMEN, -k);

// --- prioridad -------------------------------------------------------------------------------------------------------

test('peso del tema: su parte del examen por el factor de su límite de fallos (más estrecho, más peso)', () => {
  const b = (ut) => PER.bloques.find((x) => x.ut === ut);
  assert.equal(factorLimite(b(5)), 2 - 2 / 5); // Balizamiento: 2 de 5 → 1,6
  assert.equal(factorLimite(b(6)), 1.5); // RIPA: 5 de 10
  assert.equal(factorLimite(b(11)), 1.5); // Carta: 2 de 4
  assert.equal(factorLimite(b(1)), 1); // sin límite
  assert.equal(factorLimite(PY.bloques.find((x) => x.ut === 4)), 1.7); // PY Carta: 3 de 10
  assert.ok(Math.abs(pesoTema(b(6), 45) - (10 / 45) * 1.5) < 1e-12);
  // En el PY todos los temas valen 10: solo el límite los distingue.
  const py = PY.bloques.map((x) => pesoTema(x, totalPreguntas(PY)));
  assert.ok(py[3] > py[2] && py[2] > py[0] && py[0] === py[1]);
});

test('prioridad = peso × flojedad × frecuencia (y cada factor la mueve en su sentido)', () => {
  const ripa = PER.bloques.find((x) => x.ut === 6);
  const nomen = PER.bloques.find((x) => x.ut === 1);
  const p = (o) => prioridadIdea({ b: ripa, total: 45, convs: 10, convsTotal: 20, ...o });
  assert.ok(Math.abs(p({ tasa: 1 / 3 }) - (10 / 45) * 1.5 * (2 / 3) * 0.5) < 1e-12);
  assert.ok(p({ tasa: 0.25 }) > p({ tasa: 0.75 }), 'más floja, más prioridad');
  assert.equal(p({ tasa: null }), p({ tasa: 0.5 }), 'sin ver cuenta como tasa 0,5');
  assert.ok(p({ tasa: 0.4, convs: 18 }) > p({ tasa: 0.4, convs: 2 }), 'más preguntada, más prioridad');
  assert.ok(p({ tasa: 0.4 }) > prioridadIdea({ b: nomen, total: 45, convs: 10, convsTotal: 20, tasa: 0.4 }), 'tema que más pesa, más prioridad');
  assert.equal(prioridadIdea({ b: ripa, total: 45, tasa: 0.4, convs: 0, convsTotal: 0 }), 0);
});

// Banco de juguete: dos ideas de RIPA (una floja y muy preguntada, otra floja y poco), una de Nomenclatura y una
// reservada para el examen final.
const k = (id, etiqueta) => ({ id, tipo: 'concepto', etiqueta, tit: ['per'], clases: [], temario: 'pendiente' });
const CAT = indexarCatalogo([{ grupo: 'prueba', conceptos: [k('luces', 'Luces de arrastre'), k('pitadas', 'Pitadas en niebla'), k('baos', 'Baos'), k('solo-final', 'Solo en el final')] }]);
const q = (id, ut, conv, extra = {}) => ({ id, ut, conv, enunciado: `E ${id}`, opciones: { a: '1', b: '2' }, correcta: 'a', ...extra });
const TODAS = [
  q('l1', 6, 'c1'), q('l2', 6, 'c2'), q('l3', 6, 'c3', { apareceEn: [{ conv: 'c4' }] }), q('l4', 6, 'c5'), q('lR', 6, 'c9'),
  q('p1', 6, 'c1'), q('p2', 6, 'c1'),
  q('b1', 1, 'c2'), q('b2', 1, 'c3'),
  q('f1', 6, 'c9'),
];
const RES = new Set(['lR', 'f1']);
const ESTUDIO = TODAS.filter((x) => !RES.has(x.id));
const IC = crearIndiceConceptos({ catalogo: CAT, etiquetas: { l1: ['luces'], l2: ['luces'], l3: ['luces'], l4: ['luces'], lR: ['luces'], p1: ['pitadas'], p2: ['pitadas'], b1: ['baos'], b2: ['baos'], f1: ['solo-final'] }, banco: { todas: TODAS, estudio: ESTUDIO, porId: new Map(TODAS.map((x) => [x.id, x])) } });
const R = { l1: { ok: false, t: '2026-11-01T10:00:00Z' }, p1: { ok: false, t: '2026-11-02T10:00:00Z' }, b1: { ok: false, t: '2026-11-02T10:00:00Z' }, lR: { ok: false, t: '2026-11-03T10:00:00Z' } };

test('ideasPriorizadas: el orden sale de la fórmula; nada reservado entra ni cuenta como convocatoria', () => {
  const xs = ideasPriorizadas({ ic: IC, estructura: PER, preguntas: ESTUDIO, respuestas: R, reservadas: RES });
  assert.deepEqual(xs.map((x) => x.id), ['luces', 'pitadas', 'baos'], 'la muy preguntada de RIPA, la poco preguntada de RIPA y la de Nomenclatura');
  assert.ok(!xs.some((x) => x.id === 'solo-final'), 'una idea que solo está en el examen final no se estudia');
  const luces = xs[0];
  assert.equal(luces.convs, 5, 'c1–c5 (c4 por apareceEn); c9 es solo de reservadas');
  assert.equal(luces.frecuencia, 1);
  assert.equal(luces.conLimite, true);
  assert.equal(luces.estado, 'floja');
  for (const x of xs) assert.ok(Math.abs(x.prioridad - x.peso * x.flojedad * x.frecuencia) < 1e-12);
  assert.deepEqual(ideasPriorizadas({ ic: null, estructura: PER }), [], 'sin etiquetas, ninguna');
});

test('temasPriorizados (sin etiquetas): peso × (1 − acierto suavizado); ideasFlojas completa hasta 5 con las sin ver', () => {
  const ts = temasPriorizados({ estructura: PER, preguntas: ESTUDIO, respuestas: R, reservadas: RES });
  assert.equal(ts[0].ut, 6, 'RIPA, el tema que más pesa y con fallos');
  assert.ok(ts.every((t, i) => i === 0 || ts[i - 1].prioridad >= t.prioridad));
  const ideas = [{ id: 'a', estado: 'floja' }, { id: 'b', estado: 'sin-ver' }, { id: 'c', estado: 'dominada' }, { id: 'd', estado: 'sin-ver' }];
  assert.deepEqual(ideasFlojas(ideas).map((x) => x.id), ['a', 'b', 'd']);
  const muchas = Array.from({ length: 14 }, (_, i) => ({ id: `x${i}`, estado: 'floja' }));
  assert.equal(ideasFlojas(muchas).length, 10);
});

test('tandaDeIdeas: por turnos entre ideas, falladas primero, como mucho 3 por idea y nunca reservadas', () => {
  const qs = tandaDeIdeas({ ic: IC, ideas: ['luces', 'pitadas', 'solo-final'], respuestas: R, limite: 10, reservadas: RES, enPractica: new Set(ESTUDIO.map((x) => x.id)) });
  const ids = qs.map((x) => x.id);
  assert.equal(ids[0], 'l1', 'la fallada de la primera idea, primero');
  assert.equal(ids[1], 'p1', 'por turnos: luego la otra idea');
  assert.ok(!ids.includes('lR') && !ids.includes('f1'), 'nada reservado');
  assert.ok(ids.filter((x) => x.startsWith('l')).length <= 3);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(tandaDeIdeas({ ic: null, ideas: ['luces'] }), []);
});

// --- el modo ---------------------------------------------------------------------------------------------------------

test('el modo se activa solo a 7 días o menos (no a 8), no con fecha orientativa, y se puede salir y volver', () => {
  assert.equal(estadoModo({ fechaExamen: EXAMEN, ahora: a(hoyK(8)) }).activo, false);
  const e7 = estadoModo({ fechaExamen: EXAMEN, ahora: a(hoyK(7)) });
  assert.deepEqual([e7.activo, e7.modo, e7.dias, e7.fecha], [true, 'auto', 7, EXAMEN]);
  assert.equal(estadoModo({ fechaExamen: EXAMEN, ahora: a(EXAMEN) }).examenHoy, true);
  assert.equal(estadoModo({ fechaExamen: EXAMEN, orientativa: true, ahora: a(hoyK(3)) }).activo, false);
  assert.equal(estadoModo({ ahora: a(hoyK(3)) }).activo, false, 'sin fecha, nada');
  const fuera = salirDelModo(null, e7);
  const e = estadoModo({ ajuste: fuera, fechaExamen: EXAMEN, ahora: a(hoyK(5)) });
  assert.deepEqual([e.activo, e.salido], [false, true]);
  assert.equal(estadoModo({ ajuste: volverAlModo(fuera), fechaExamen: EXAMEN, ahora: a(hoyK(5)) }).activo, true);
  // Si cambia la fecha del examen, salir de la anterior no cuenta.
  assert.equal(estadoModo({ ajuste: fuera, fechaExamen: '2026-11-20', ahora: a(hoyK(5)) }).activo, true);
});

test('a mano, sin fecha: eligiendo cuántos días quedan (de 1 a 7); salir lo borra', () => {
  const ahora = a('2026-11-10', 21);
  const m = activarManual(null, 4, ahora);
  assert.equal(m.manual, '2026-11-14');
  const e = estadoModo({ ajuste: m, ahora });
  assert.deepEqual([e.activo, e.modo, e.dias], [true, 'manual', 4]);
  assert.equal(activarManual(null, 30, ahora).manual, '2026-11-17', 'como mucho 7');
  assert.equal(activarManual(null, 0, ahora).manual, '2026-11-11', 'como poco 1');
  assert.equal(estadoModo({ ajuste: salirDelModo(m, e), ahora }).activo, false);
  // A mano manda aunque la fecha de Ajustes esté lejos.
  assert.equal(estadoModo({ ajuste: m, fechaExamen: '2027-02-01', ahora }).modo, 'manual');
});

test('pasada la fecha, el modo se apaga solo y pregunta cómo fue (una vez, durante 14 días, sin obligar)', () => {
  const e = estadoModo({ fechaExamen: EXAMEN, ahora: a(sumaDiasISO(EXAMEN, 1)) });
  assert.deepEqual([e.activo, e.preguntar], [false, { fecha: EXAMEN }]);
  assert.equal(estadoModo({ fechaExamen: EXAMEN, ahora: a(sumaDiasISO(EXAMEN, 15)) }).preguntar, null);
  for (const r of ['aprobado', 'suspenso', 'no-se', 'omitido', 'cualquier cosa']) {
    const aj = responderComoFue(null, EXAMEN, r);
    assert.equal(estadoModo({ ajuste: aj, fechaExamen: EXAMEN, ahora: a(sumaDiasISO(EXAMEN, 2)) }).preguntar, null);
  }
  assert.equal(responderComoFue(null, EXAMEN, 'x').fue[EXAMEN], 'omitido');
  assert.equal(estadoModo({ fechaExamen: EXAMEN, orientativa: true, ahora: a(sumaDiasISO(EXAMEN, 1)) }).preguntar, null, 'una fecha orientativa no se pregunta');
  // La manual vencida también pregunta, y contestar la apaga.
  const m = activarManual(null, 2, a('2026-11-10'));
  assert.deepEqual(estadoModo({ ajuste: m, ahora: a('2026-11-13') }).preguntar, { fecha: '2026-11-12' });
  assert.equal(responderComoFue(m, '2026-11-12', 'aprobado').manual, null);
});

test('cambio de día: a las 23:59 y a las 00:01 locales cuentan días distintos (el reloj entra por parámetro)', () => {
  assert.equal(estadoModo({ fechaExamen: EXAMEN, ahora: a(hoyK(8), 23, 59) }).activo, false);
  assert.equal(estadoModo({ fechaExamen: EXAMEN, ahora: a(hoyK(7), 0, 1) }).dias, 7);
  assert.equal(estadoModo({ fechaExamen: EXAMEN, ahora: a(EXAMEN, 23, 59) }).dias, 0);
  assert.equal(estadoModo({ fechaExamen: EXAMEN, ahora: a(sumaDiasISO(EXAMEN, 1), 0, 1) }).activo, false);
});

test('el ajuste: normalizado, con los días hechos (30 días como mucho) y compartido entre aparatos', () => {
  assert.deepEqual(leerAjuste(null), { manual: null, fuera: null, hechos: {}, fue: {} });
  assert.deepEqual(leerAjuste({ manual: 'mañana', hechos: { '2026-11-10': 'ideas', x: 'ideas', '2026-11-11': 'raro' }, fue: { '2026-11-12': 'nope' } }),
    { manual: null, fuera: null, hechos: { '2026-11-10': 'ideas' }, fue: {} });
  let aj = apuntarHecho(null, '2026-10-01', 'ideas');
  aj = apuntarHecho(aj, '2026-11-10', 'simulacro');
  assert.deepEqual(aj.hechos, { '2026-11-10': 'simulacro' });
  assert.ok(esAjusteCompartido(claveSemana('per')) && esAjusteCompartido(claveSemana('py')));
});

// --- el reparto ------------------------------------------------------------------------------------------------------

const tipos = (r) => r.map((x) => `${x.k}:${x.tipo}${x.examen && x.examen !== 'completo' ? `(${x.examen})` : ''}${x.conRepaso ? '+fallos' : ''}`);

test('reparto PER de 7 a 0 días: ideas primero, simulacro a mitad con un día de repaso, ligero, víspera y examen', () => {
  assert.deepEqual(tipos(repartoDias({ dias: 7, simulacros: ['completo'] })), ['7:ideas', '6:ideas', '5:ideas', '4:simulacro', '3:repaso-simulacro', '2:ligero', '1:vispera', '0:examen']);
  assert.deepEqual(tipos(repartoDias({ dias: 4, simulacros: ['completo'] })), ['4:simulacro', '3:repaso-simulacro', '2:ligero', '1:vispera', '0:examen']);
  assert.deepEqual(tipos(repartoDias({ dias: 3, simulacros: ['completo'] })), ['3:simulacro', '2:ligero+fallos', '1:vispera', '0:examen']);
  assert.deepEqual(tipos(repartoDias({ dias: 2, simulacros: ['completo'] })), ['2:ligero', '1:vispera', '0:examen'], 'a 2 días ya no se hace un examen entero');
  assert.deepEqual(tipos(repartoDias({ dias: 1 })), ['1:vispera', '0:examen']);
  assert.deepEqual(tipos(repartoDias({ dias: 0 })), ['0:examen']);
});

test('reparto PY por módulos: navegación (con límites) primero, genérico después y el repaso de los dos', () => {
  assert.deepEqual(tipos(repartoDias({ dias: 7, simulacros: ['navegacion', 'generico'] })), ['7:ideas', '6:ideas', '5:simulacro(navegacion)', '4:simulacro(generico)', '3:repaso-simulacro', '2:ligero', '1:vispera', '0:examen']);
  assert.deepEqual(tipos(repartoDias({ dias: 3, simulacros: ['navegacion', 'generico'] })), ['3:simulacro(navegacion)', '2:ligero+fallos', '1:vispera', '0:examen'], 'lo que no cabe se queda fuera');
});

test('el simulacro hecho antes de tiempo: el día siguiente repasa sus fallos y lo demás son ideas', () => {
  assert.deepEqual(tipos(repartoDias({ dias: 6, repasoPendiente: true })), ['6:repaso-simulacro', '5:ideas', '4:ideas', '3:ideas', '2:ligero', '1:vispera', '0:examen']);
  assert.deepEqual(tipos(repartoDias({ dias: 2, repasoPendiente: true })), ['2:ligero+fallos', '1:vispera', '0:examen']);
});

// --- el plan ---------------------------------------------------------------------------------------------------------

const IDEAS = Array.from({ length: 30 }, (_, i) => ({ id: `i${i}`, etiqueta: `Idea ${i}`, ut: i % 2 ? 6 : 5, tema: 'T', conLimite: true, estado: i < 20 ? 'floja' : 'dominada', prioridad: 1 - i / 100 }));
const TEMAS_PER = temasPriorizados({ estructura: PER, preguntas: [], respuestas: {} });
const base = (o = {}) => ({ estructura: PER, fecha: EXAMEN, minutosDia: 20, ideas: IDEAS, temas: TEMAS_PER, fallosHoy: 0, tarjetasHoy: 4, mazo: { id: 'buques', titulo: 'Luces y marcas de buques' }, cartaUt: 11, tests: [], hechos: {}, ...o });
const plan = (k, o = {}) => planSemana({ ...base(o), dias: k, hoy: hoyK(k) });
const NUEVO = new Set(['clase', 'simulacro', 'final', 'mezclado']);

test('plan PER a 7 días: cada día con sus pasos y sus minutos; las ideas no se repiten y van por prioridad', () => {
  const p = plan(7);
  assert.deepEqual(p.dias.map((x) => x.tipo), ['ideas', 'ideas', 'ideas', 'simulacro', 'repaso-simulacro', 'ligero', 'vispera', 'examen']);
  assert.deepEqual(p.dias.map((x) => x.fecha), [7, 6, 5, 4, 3, 2, 1, 0].map(hoyK));
  const ideas = p.dias.flatMap((x) => x.pasos.flatMap((s) => s.ideas ?? []));
  assert.deepEqual(ideas.slice(0, 8), ['i0', 'i1', 'i2', 'i3', 'i4', 'i5', 'i6', 'i7'], 'el primer día, las de más prioridad');
  assert.equal(new Set(ideas).size, ideas.length, 'sin repetir en la semana');
  // Respeta los minutos al día (salvo el día del simulacro, que lo dice).
  for (const x of p.dias.filter((y) => y.tipo !== 'simulacro')) assert.ok(x.minutos <= 20 + 5, `${x.tipo}: ${x.minutos} min`);
  const sim = p.dias.find((x) => x.tipo === 'simulacro');
  assert.equal(sim.pasos[0].ruta.join('/'), 'test/simulacro');
  assert.equal(sim.minutos, 90);
  assert.ok(sim.largo && /más tiempo/.test(sim.texto));
  // Cada paso es un paso de sesión válido, con su dirección única en el día.
  for (const x of p.dias) assert.equal(new Set(x.pasos.map((s) => s.ruta.join('/'))).size, x.pasos.length);
});

test('el último día, nada nuevo: un repaso corto y descanso (dicho así); el día del examen, sin tarea', () => {
  const v = plan(7).dias.find((x) => x.tipo === 'vispera');
  assert.ok(v.pasos.length === 1 && ['tarjetas', 'chuleta'].includes(v.pasos[0].tipo));
  assert.ok(v.minutos <= 10);
  assert.ok(/nada nuevo/i.test(v.titulo) && /descans/i.test(v.texto));
  assert.ok(!v.pasos.some((s) => NUEVO.has(s.tipo) || s.tipo === 'ideas'));
  // Sin tarjetas que toquen ni mazo: la chuleta.
  assert.equal(plan(1, { tarjetasHoy: 0, mazo: null }).dias[0].pasos[0].tipo, 'chuleta');
  const ex = plan(0).dias[0];
  assert.deepEqual([ex.tipo, ex.pasos.length, ex.minutos], ['examen', 0, 0]);
  assert.equal(sesionDeSemana(plan(0)), null, 'el día del examen no hay sesión');
});

test('el penúltimo día: tarjetas, la chuleta del tema con límite más flojo (no la carta) y una tanda de carta', () => {
  const l = plan(2).dias[0];
  assert.deepEqual(l.pasos.map((s) => s.tipo), ['tarjetas', 'chuleta', 'preguntas']);
  assert.equal(l.pasos[1].ut, TEMAS_PER.find((t) => t.conLimite && t.ut !== 11).ut);
  assert.equal(l.pasos[2].ruta.join('/'), 'teoria/ut/11');
});

test('respeta los minutos al día: con más minutos, más tandas de ideas (como mucho 3); con fallos, primero los fallos', () => {
  const n = (min, o = {}) => plan(7, { minutosDia: min, ...o }).dias[0].pasos;
  assert.equal(n(10).length, 1);
  assert.equal(n(20).length, 2);
  assert.equal(n(60).length, 3);
  const f = n(20, { fallosHoy: 12 });
  assert.equal(f[0].tipo, 'fallos');
  assert.ok(f.reduce((s, x) => s + x.minutos, 0) <= 20);
  assert.ok(f.every((x) => x.minutos >= 1) && f.slice(1).every((x) => x.minutos === MIN_TANDA));
});

test('saltarse un día no castiga: el simulacro que no se hizo pasa al día siguiente; el hecho deja el repaso', () => {
  // Día 4: tocaba el simulacro. No lo hace.
  assert.equal(plan(4).dias[0].tipo, 'simulacro');
  const sin = plan(3);
  assert.deepEqual(sin.dias.map((x) => x.tipo), ['simulacro', 'ligero', 'vispera', 'examen']);
  assert.ok(sin.dias[1].pasos.some((s) => s.tipo === 'fallos'), 'su repaso entra en el repaso ligero');
  // Si lo hizo el día 4, el día 3 repasa sus fallos.
  const t = [{ tipo: 'simulacro', t: new Date(a(hoyK(4), 18)).toISOString(), apto: true }];
  const con = plan(3, { tests: t, fallosHoy: 7 });
  assert.equal(con.dias[0].tipo, 'repaso-simulacro');
  assert.equal(con.dias[0].pasos[0].ruta.join('/'), 'teoria/repaso');
  // Y el mismo día del simulacro, recalcular no cambia lo de hoy: queda hecho.
  const mismo = plan(4, { tests: [{ tipo: 'simulacro', t: new Date(a(hoyK(4), 18)).toISOString() }] });
  assert.deepEqual([mismo.dias[0].tipo, mismo.dias[0].hecho, mismo.dias[1].tipo], ['simulacro', true, 'repaso-simulacro']);
  // Un día de ideas sin hacer no se arrastra: el día siguiente es el que le toca.
  assert.equal(plan(6).dias[0].tipo, 'ideas');
  // Hecho el repaso, no vuelve.
  const tras = plan(2, { tests: t, hechos: { [hoyK(3)]: 'repaso-simulacro' } });
  assert.ok(!tras.dias[0].pasos.some((s) => s.tipo === 'fallos'));
});

test('exámenes de la semana: solo cuentan los de esta semana; un simulacro de módulo no es uno completo', () => {
  const t = (tipo, iso, extra = {}) => ({ tipo, t: new Date(a(iso, 10)).toISOString(), ...extra });
  const ex = examenesDeLaSemana([t('simulacro', '2026-11-01'), t('modulo', hoyK(5), { modulo: 'navegacion' })], { desde: hoyK(7), hasta: hoyK(4) });
  assert.deepEqual([ex.completo, [...ex.modulos], ex.ultimo], [false, ['navegacion'], hoyK(5)]);
});

test('PY: por módulos con menos minutos de los que dura el examen; completo con tiempo de sobra', () => {
  const py = (o = {}) => planSemana({ ...base({ estructura: PY, cartaUt: 4, mazo: { id: 'socorro', titulo: 'Señales de peligro' }, temas: temasPriorizados({ estructura: PY }), ...o }), dias: 7, hoy: hoyK(7) });
  const m = py();
  assert.equal(m.porModulos, true);
  const sims = m.dias.filter((x) => x.tipo === 'simulacro');
  assert.deepEqual(sims.map((x) => x.pasos[0].query), [{ m: 'navegacion' }, { m: 'generico' }]);
  assert.deepEqual(sims.map((x) => x.minutos), [75, 45]);
  // Con un módulo ya hecho, solo queda el otro.
  const uno = py({ tests: [{ tipo: 'modulo', modulo: 'navegacion', t: new Date(a(hoyK(7), 9)).toISOString() }] });
  assert.deepEqual(uno.simulacro.pendientes, ['generico']);
  const c = py({ minutosDia: 120 });
  assert.equal(c.porModulos, false);
  assert.deepEqual(c.dias.filter((x) => x.tipo === 'simulacro').map((x) => x.minutos), [120]);
  assert.equal(c.dias.find((x) => x.tipo === 'ligero').pasos.at(-1).ruta.join('/'), 'teoria/ut/4');
});

test('el examen final solo entra si ya toca (y entonces ocupa el sitio del simulacro); si no, nunca', () => {
  for (const k of [7, 5, 4, 3, 2, 1, 0]) assert.ok(!plan(k).dias.some((x) => x.pasos.some((s) => s.tipo === 'final' || s.ruta.includes('final'))));
  const f = plan(7, { finalSugerido: true }).dias.find((x) => x.tipo === 'simulacro');
  assert.equal(f.pasos[0].ruta.join('/'), 'test/final');
});

test('sin etiquetas de conceptos: los días de ideas son tandas de los temas que más pesan y más fallas', () => {
  const ts = temasPriorizados({ estructura: PER, preguntas: ESTUDIO, respuestas: R });
  const p = plan(7, { ideas: [], temas: ts });
  const d0 = p.dias[0];
  assert.equal(d0.titulo, 'Tus temas más flojos');
  assert.deepEqual(d0.pasos.map((s) => s.ruta.join('/')), [`teoria/ut/${ts[0].ut}`, `teoria/ut/${ts[1].ut}`]);
});

test('la sesión del día: fase «semana», el tipo del día, y la sesión guardada lo conserva', () => {
  const s = sesionDeSemana(plan(7));
  assert.equal(s.fase, 'semana');
  assert.equal(s.semana, 'ideas');
  assert.ok(s.pasos.every((x) => !('ideas' in x) && x.ruta[0] === 'semana' && x.query.c));
  const g = nuevaSesion('per', s, { ahora: a(hoyK(7)) });
  assert.equal(g.semana, 'ideas');
  assert.equal(g.dia, hoyK(7));
});

test('textos: «faltan N días», mañana y hoy', () => {
  assert.equal(rotuloSemana(3), 'Semana del examen · faltan 3 días');
  assert.equal(rotuloSemana(1), 'Semana del examen · mañana es el día');
  assert.equal(lineaFaltan(0), 'El examen es hoy');
  assert.equal(DIAS_MODO, 7);
});

// --- bancos reales: PER y PY -------------------------------------------------------------------------------------------

for (const [tit, E] of [['per', PER], ['py', PY]]) {
  test(`${tit.toUpperCase()} real: lo que más prioriza es de temas con límite o de mucho peso, y ninguna tanda saca reservadas`, async () => {
    const B = bancosNode();
    const banco = await B.cargarBanco(EJE_POR_DEFECTO, tit);
    const ic = await crearConceptos(B).cargarConceptos(EJE_POR_DEFECTO, tit);
    // Un alumno que ha fallado una de cada tres preguntas del estudio.
    const rng = createRng(7);
    const respuestas = Object.fromEntries(banco.practica.filter(() => rng.next() < 0.5).map((x, i) => [x.id, { ok: i % 3 !== 0, t: '2026-11-01T10:00:00Z' }]));
    const ideas = ideasPriorizadas({ ic, estructura: E, preguntas: banco.practica, respuestas, reservadas: banco.reservadas });
    assert.ok(ideas.length > 20);
    const top = ideas.slice(0, 10);
    const conLimite = top.filter((x) => x.conLimite).length;
    assert.ok(conLimite >= 6, `de las 10 primeras, ${conLimite} con límite`);
    const enPractica = new Set(banco.practica.map((x) => x.id));
    for (let i = 0; i < ideas.length; i += IDEAS_POR_TANDA) {
      const qs = tandaDeIdeas({ ic, ideas: ideas.slice(i, i + IDEAS_POR_TANDA).map((x) => x.id), respuestas, rng: createRng(i + 1), enPractica, reservadas: banco.reservadas });
      for (const x of qs) assert.ok(enPractica.has(x.id) && !banco.reservadas.has(x.id), `${x.id} no se practica o es reservada`);
    }
    // El plan entero, de 7 a 0 días: ningún paso fuera de lo de siempre y nada del examen final.
    const temas = temasPriorizados({ estructura: E, preguntas: banco.practica, respuestas, reservadas: banco.reservadas });
    for (let k = 7; k >= 0; k--) {
      const p = planSemana({ estructura: E, dias: k, hoy: hoyK(k), fecha: EXAMEN, minutosDia: 20, ideas, temas, cartaUt: E === PER ? 11 : 4, mazo: { id: 'socorro', titulo: 'Señales de peligro' } });
      for (const x of p.dias) for (const s of x.pasos) assert.ok(!s.ruta.includes('final'), `${k}: ${s.ruta.join('/')}`);
      assert.equal(p.dias.at(-1).tipo, 'examen');
    }
  });
}
