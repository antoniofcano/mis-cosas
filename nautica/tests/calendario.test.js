import { test } from 'node:test';
import assert from 'node:assert/strict';
import { unidades, repartir, crearPlan, seguimiento, planCaducado, lineaSeguimiento, sumaDiasISO } from '../src/course/calendario.js';

// Curso mínimo: dos temas con 3 y 2 clases de 10 minutos, sin preguntas de práctica (una clase vista = terminada).
const estructura = { bloques: [{ ut: 1, titulo: 'Tema A', n: 5 }, { ut: 2, titulo: 'Tema B', n: 5 }], duracionMin: 90 };
const clase = (id) => ({ id, titulo: id, minutos: 10, pasos: [] });
const curso = { modulos: [{ ut: 1, lecciones: [clase('a1'), clase('a2'), clase('a3')] }, { ut: 2, lecciones: [clase('b1'), clase('b2')] }] };
const datos = { estructura, curso, preguntas: [], regs: {}, respuestas: {}, tests: [] };
const visto = { visto: true, paso: 0 };
const T0 = new Date(2026, 9, 5, 10).getTime(); // lunes 5 de octubre de 2026
const DIA = 864e5;

test('unidades: clases de cada tema en orden y los simulacros al final', () => {
  const us = unidades(datos);
  assert.deepEqual(us.map((u) => u.id), ['clase:a1', 'clase:a2', 'clase:a3', 'clase:b1', 'clase:b2', 'simulacro:1', 'simulacro:2', 'simulacro:3']);
  assert.ok(us.every((u) => !u.hecha));
  assert.equal(unidades({ ...datos, regs: { a1: visto } })[0].hecha, true);
});

test('repartir: llena los días con los minutos al día y reparte los simulacros al final', () => {
  const us = unidades(datos);
  const r = repartir(us, { desde: '2026-10-05', dias: 6, minutosDia: 20 });
  assert.equal(r.llega, true);
  // 6 días: simulacros los días 2, 4 y 5 (la víspera, el 6.º, libre); el resto, en orden en los demás.
  assert.deepEqual(r.dias.map((d) => d.unidades.map((u) => u.id)), [
    ['clase:a1', 'clase:a2'], ['simulacro:1'], ['clase:a3', 'clase:b1'], ['simulacro:2'], ['simulacro:3'], ['clase:b2']]);
  assert.equal(r.dias[5].fecha, '2026-10-10');
});

test('repartir: si no cabe, dice cuántos minutos al día hacen falta', () => {
  const r = repartir(unidades(datos), { desde: '2026-10-05', dias: 4, minutosDia: 10 });
  assert.equal(r.llega, false);
  assert.equal(r.minutosNecesarios, 50); // 5 clases en 1 día (los otros 3 son de simulacros)
  assert.equal(r.dias.length, 4);
  // Respeta los 10 minutos: cabe una clase y las otras 4 se quedan fuera, sin estirar el día.
  assert.ok(r.dias.every((d) => d.unidades.every((u) => u.tipo === 'simulacro') || d.minutos <= 10));
  assert.deepEqual(r.fuera.map((u) => u.id), ['clase:a2', 'clase:a3', 'clase:b1', 'clase:b2']);
});

test('plan base y seguimiento: al día, atrasado y recuperado', () => {
  const plan = crearPlan(datos, { fechaExamen: '2026-10-13', minutosDia: 20, ahora: T0 });
  assert.deepEqual(plan.dias['2026-10-05'].map((x) => x.id), ['clase:a1', 'clase:a2']);
  assert.equal(planCaducado(plan, '2026-10-13', 20), false);
  assert.equal(planCaducado(plan, '2026-10-12', 20), true);
  assert.equal(planCaducado(plan, '2026-10-13', 30), true);

  // Lunes: lo que toca hoy.
  let s = seguimiento(plan, datos, { ahora: T0 });
  assert.equal(s.estado, 'al-dia');
  assert.deepEqual(s.hoy.map((u) => u.id), ['clase:a1', 'clase:a2']);

  // Martes sin haber hecho lo del lunes: dos clases para recuperar, y van primero.
  s = seguimiento(plan, datos, { ahora: T0 + DIA });
  assert.equal(s.estado, 'atrasado');
  assert.deepEqual(s.atrasadas.map((u) => u.id), ['clase:a1', 'clase:a2']);
  assert.deepEqual(s.hoy.map((u) => u.id), ['clase:a1', 'clase:a2']);
  assert.equal(s.minutosAtraso, 20);
  assert.match(lineaSeguimiento(s, 20), /^Tienes 2 clases por recuperar \(unos 20 minutos\): empieza por ahí/);

  // Recuperadas: vuelve a estar al día y hoy le toca lo del martes.
  s = seguimiento(plan, { ...datos, regs: { a1: visto, a2: visto } }, { ahora: T0 + DIA });
  assert.equal(s.estado, 'al-dia');
  assert.deepEqual(s.hoy.map((u) => u.id), ['clase:a3', 'clase:b1']);
  assert.equal(s.hechasDelPlan, 2);
});

test('seguimiento: si ya no cabe, dice los minutos que hacen falta', () => {
  const plan = crearPlan(datos, { fechaExamen: '2026-10-11', minutosDia: 20, ahora: T0 });
  const s = seguimiento(plan, datos, { ahora: T0 + 2 * DIA }); // miércoles: quedan 4 días y no ha hecho nada
  assert.equal(s.estado, 'no-llega');
  assert.ok(s.futuro.minutosNecesarios > 20);
  const txt = lineaSeguimiento(s, 20);
  assert.match(txt, /^Con 20 minutos al día no te da tiempo: se quedarían fuera .*Para llegar, unos \d+ minutos al día\.$/);
  assert.doesNotMatch(txt, /saltado/);
});

test('sin fecha o con el examen pasado no hay calendario', () => {
  assert.equal(crearPlan(datos, { fechaExamen: null, minutosDia: 20, ahora: T0 }), null);
  assert.equal(crearPlan(datos, { fechaExamen: '2026-10-05', minutosDia: 20, ahora: T0 }), null);
  assert.equal(sumaDiasISO('2026-10-24', 2), '2026-10-26'); // cruza el cambio de hora
});

test('describir y duracion: en palabras, sin «cosas»', async () => {
  const { describir, duracion } = await import('../src/course/calendario.js');
  assert.equal(describir([{ tipo: 'clase' }, { tipo: 'clase' }, { tipo: 'tanda' }]), '2 clases y 1 tanda de preguntas');
  assert.equal(describir([{ tipo: 'simulacro' }]), '1 simulacro');
  assert.equal(duracion(80), 'unos 80 minutos');
  assert.equal(duracion(290), 'unas 4,8 horas');
});

test('simulacros repartidos por las dos últimas semanas, el último dos días antes del examen', async () => {
  const { diasDeSimulacro } = await import('../src/course/calendario.js');
  assert.deepEqual(diasDeSimulacro(3, 40), [29, 34, 38]); // examen el día 40: víspera (39) libre
  assert.deepEqual(diasDeSimulacro(3, 14), [4, 8, 12]);
  assert.deepEqual(diasDeSimulacro(3, 2), [1]); // con 2 días, uno para lo demás
  assert.deepEqual(diasDeSimulacro(1, 1, false), [0]);
  assert.deepEqual(diasDeSimulacro(0, 30), []);
});

test('días de descanso: de lunes a viernes no se planifica el fin de semana', async () => {
  const { fechasDeEstudio, crearPlan, seguimiento, planCaducado, lineaSeguimiento } = await import('../src/course/calendario.js');
  // Del lunes 5 al domingo 11: 7 días, 5 laborables.
  assert.deepEqual(fechasDeEstudio('2026-10-05', 7, 'lv'), ['2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09']);
  assert.equal(fechasDeEstudio('2026-10-05', 7, 'todos').length, 7);
  const plan = crearPlan(datos, { fechaExamen: '2026-10-19', minutosDia: 20, diasEstudio: 'lv', ahora: T0 });
  const fechas = Object.keys(plan.dias);
  assert.ok(fechas.every((f) => ![0, 6].includes(new Date(`${f}T12:00`).getDay())), fechas.join(' '));
  assert.equal(planCaducado(plan, '2026-10-19', 20, 'lv'), false);
  assert.equal(planCaducado(plan, '2026-10-19', 20, 'todos'), true);
  // El sábado 10, con todo lo de la semana hecho (las clases y el primer simulacro): descansa.
  const sab = T0 + 5 * DIA;
  const todo = Object.fromEntries(['a1', 'a2', 'a3', 'b1', 'b2'].map((id) => [id, visto]));
  const s = seguimiento(plan, { ...datos, regs: todo, tests: [{ tipo: 'simulacro' }] }, { ahora: sab });
  assert.equal(s.estado, 'al-dia');
  assert.equal(s.descansoHoy, true);
  assert.deepEqual(s.hoy, []);
  assert.match(lineaSeguimiento(s, 20), /Hoy es día de descanso/);
});

test('plan esencial: los temas de poco peso van por chuleta y el plan lo recuerda', async () => {
  const { temasDePocoPeso, unidades: us, crearPlan, planCaducado, alternativaEsencial, seguimiento } = await import('../src/course/calendario.js');
  const { PER, PY } = await import('../src/theory/blocks.js');
  assert.deepEqual(temasDePocoPeso(PER), [2, 4, 7, 8]);
  assert.deepEqual(temasDePocoPeso(PY), []);
  // Tema B de poco peso (2 preguntas, sin límite): sus dos clases se cambian por una chuleta de 6 minutos.
  const est = { ...estructura, bloques: [{ ut: 1, titulo: 'Tema A', n: 5, maxErrores: 2 }, { ut: 2, titulo: 'Tema B', n: 2 }] };
  const d = { ...datos, estructura: est };
  const e = us({ ...d, esencial: true });
  assert.deepEqual(e.map((u) => u.id).slice(0, 4), ['clase:a1', 'clase:a2', 'clase:a3', 'chuleta:2']);
  assert.equal(e[3].minutos, 6);
  assert.equal(us({ ...d, esencial: true, chuletasLeidas: [2] })[3].hecha, true);
  const plan = crearPlan({ ...d, esencial: true }, { fechaExamen: '2026-10-13', minutosDia: 20, ahora: T0 });
  assert.equal(plan.esencial, true);
  assert.equal(planCaducado(plan, '2026-10-13', 20, 'todos', true), false);
  assert.equal(planCaducado(plan, '2026-10-13', 20, 'todos', false), true);
  // La chuleta leída cuenta en el seguimiento.
  const s = seguimiento(plan, { ...d, chuletasLeidas: [2] }, { ahora: T0 });
  assert.ok(!s.futuro.dias.flatMap((x) => x.unidades).some((u) => u.id === 'chuleta:2'));
  // Alternativa: con 10 minutos y 4 días el completo no cabe; el esencial ahorra los 14 minutos de las dos clases de B.
  const alt = alternativaEsencial(d, { fechaExamen: '2026-10-09', minutosDia: 10, ahora: T0 });
  assert.equal(alt.ahorro, 14);
  assert.equal(alternativaEsencial({ ...d, estructura: { ...est, bloques: [est.bloques[0]] } }, { fechaExamen: '2026-10-09', minutosDia: 10, ahora: T0 }), null);
});
