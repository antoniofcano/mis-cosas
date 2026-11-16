// ¿De qué te examinas? (src/course/foco.js): la elección del módulo en el PY y cómo recorta el motor la ruta, el plan,
// lo de hoy y «¿Estás listo?».
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { claveFoco, opcionesFoco, focoModulo, focoDecidido, datosDelModulo, AMBOS } from '../src/course/foco.js';
import { apuntarResultado, responderComoFue, claveSemana, descartarModulo } from '../src/course/semana.js';
import { estadoAlumno } from '../src/course/motor.js';
import { PER, PY } from '../src/theory/blocks.js';
import { esAjusteCompartido } from '../src/store/sync/operaciones.js';

const ahora = new Date(2026, 10, 16, 12).getTime();
const aprobado = apuntarResultado(responderComoFue(null, '2026-11-14', 'suspenso'), '2026-11-14', { fallos: {}, modulo: 'generico' });

test('opciones: los dos módulos, solo genérico o solo navegación; el PER no tiene módulos', () => {
  assert.deepEqual(opcionesFoco(PY).map((o) => o.id), [AMBOS, 'generico', 'navegacion']);
  assert.deepEqual(opcionesFoco(PER), []);
  assert.equal(claveFoco('py'), 'modulos_py');
  assert.ok(esAjusteCompartido('modulos_py'), 'se comparte entre aparatos');
});

test('el módulo en que te centras: el elegido; sin elegir, el que queda tras aprobar el otro; «los dos» manda', () => {
  assert.equal(focoModulo({}, 'py', PY), null);
  assert.equal(focoDecidido({}, 'py', PY), false, 'sin elegir ni resultado: se pregunta');
  assert.deepEqual(focoModulo({ modulos_py: 'navegacion' }, 'py', PY), { id: 'navegacion', titulo: 'Módulo de navegación', origen: 'eleccion' });
  assert.equal(focoModulo({ [claveSemana('py')]: aprobado }, 'py', PY).id, 'navegacion');
  assert.equal(focoModulo({ [claveSemana('py')]: aprobado }, 'py', PY).origen, 'resultado');
  assert.equal(focoDecidido({ [claveSemana('py')]: aprobado }, 'py', PY), true);
  assert.equal(focoModulo({ [claveSemana('py')]: aprobado, modulos_py: AMBOS }, 'py', PY), null);
  assert.equal(focoDecidido({ modulos_py: AMBOS }, 'py', PY), true);
  assert.equal(focoModulo({ [claveSemana('py')]: descartarModulo(aprobado, '2026-11-14') }, 'py', PY), null, 'descartado el módulo pendiente');
  assert.equal(focoModulo({ modulos_py: 'raro' }, 'py', PY), null);
  assert.equal(focoModulo({ modulos_py: 'navegacion' }, 'per', PER), null);
  assert.equal(focoDecidido({}, 'per', PER), true, 'el PER no pregunta');
});

test('datos del módulo: su estructura, el curso con solo sus temas (y su ruta) y sus preguntas', () => {
  const curso = { modulos: [1, 2, 3, 4].map((ut) => ({ ut, lecciones: [{ id: `py-${ut}-1`, ut }] })), ruta: [{ ut: 1, lecciones: ['py-1-1'] }, { ut: 3, lecciones: ['py-3-1'] }] };
  const preguntas = [1, 2, 3, 4].map((ut) => ({ id: `q${ut}`, ut }));
  const r = datosDelModulo({ estructura: PY, curso, preguntas }, 'navegacion');
  assert.equal(r.estructura.modulo, 'navegacion');
  assert.deepEqual(r.curso.modulos.map((m) => m.ut), [3, 4]);
  assert.deepEqual(r.curso.ruta, [{ ut: 3, lecciones: ['py-3-1'] }]);
  assert.deepEqual(r.preguntas.map((q) => q.id), ['q3', 'q4']);
});

test('motor: con solo navegación, temas, camino, «¿Estás listo?» y simulacro son los del módulo', () => {
  const curso = { modulos: PY.bloques.map((b) => ({ ut: b.ut, lecciones: [{ id: `py-${b.ut}-1`, ut: b.ut, pasos: [{ tipo: 'texto', texto: 'x' }] }] })) };
  const preguntas = PY.bloques.flatMap((b) => Array.from({ length: 30 }, (_, i) => ({ id: `q${b.ut}-${i}`, ut: b.ut, correcta: 'a' })));
  const e = { tit: 'py', estructura: PY, curso, preguntas, regs: {}, respuestas: {}, tests: [], minutosHoy: 0, racha: 0, planGuardado: null, ahora };
  const nav = estadoAlumno({ ...e, settings: { modulos_py: 'navegacion', examen_py: '2027-03-20' } });
  assert.equal(nav.foco.id, 'navegacion');
  assert.deepEqual(nav.temas.map((t) => t.b.ut), [3, 4]);
  assert.equal(nav.listo.modulo, 'navegacion');
  assert.equal(nav.plan.base.foco, 'navegacion', 'el plan con fecha recuerda el módulo');
  assert.ok(nav.actividades.filter((a) => a.ut != null).every((a) => [3, 4].includes(a.ut)), JSON.stringify(nav.actividades.map((a) => a.ut)));
  const ambos = estadoAlumno({ ...e, settings: { examen_py: '2027-03-20' } });
  assert.deepEqual(ambos.temas.map((t) => t.b.ut).sort(), [1, 2, 3, 4]);
  assert.equal(ambos.foco, null);
  // Cambiar de elección rehace el plan guardado.
  const otra = estadoAlumno({ ...e, planGuardado: nav.plan.base, settings: { examen_py: '2027-03-20' } });
  assert.equal(otra.plan.nuevo, true);
});
