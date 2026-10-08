// Test de nivel por conceptos (src/course/nivel.js) y ficha de la idea floja (src/course/ficha.js): selección adaptativa
// solo del estudio (nunca reservadas, anuladas ni retiradas), efecto sobre el dominio sin tocar la cola de repaso ni los
// simulacros, clases que se saltan sin marcarse vistas, cuándo toca la ficha y qué lleva, y degradación sin etiquetas.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { indexarCatalogo } from '../src/conceptos/catalogo.js';
import { crearIndiceConceptos } from '../src/conceptos/conceptos.js';
import { crearConceptos } from '../src/conceptos/index.js';
import {
  candidatosNivel, bloquesNivel, nuevoNivel, siguienteNivel, responderNivel, resultadoNivel, clasesQueSabes, puntoDePartida, estimadasNivel,
  bloqueDe, apta, MAX_PREGUNTAS,
} from '../src/course/nivel.js';
import { necesitaFicha, fichaPendiente, notaParaAlumno, reglasDeIdea, preguntaParaProbar } from '../src/course/ficha.js';
import { estadoLeccion } from '../src/course/engine.js';
import { pendientesRuta, planHoy, estadoTema } from '../src/course/plan.js';
import { siguienteEnRuta } from '../src/course/ruta.js';
import { colaRepaso } from '../src/course/repaso.js';
import { estoyListo } from '../src/course/listo.js';
import { createProgressStore } from '../src/store/progress.js';
import { PER, PY } from '../src/theory/blocks.js';
import { resumenDominio } from '../src/conceptos/conceptos.js';
import { bancosNode, ejes, leerJSON } from '../tools/bancos/leer.mjs';

function memoria() {
  const m = new Map();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
}

// ---------------------------------------------------------------------------------------------------------------
// Banco de juguete: dos bloques (nomen y ripa) con clases en la ruta; reservadas, anuladas, retiradas y de carta fuera.

const g = (id, etiqueta, extra = {}) => ({ id, tipo: 'grupo', etiqueta, tit: ['per'], clases: [], temario: 'pendiente', ...extra });
const k = (id, padre, clases, extra = {}) => ({ id, tipo: 'concepto', etiqueta: `Idea ${id}`, padre, tit: ['per'], clases, temario: 'pendiente', nota: 'Nota.', ...extra });
const CATALOGO = indexarCatalogo([{ grupo: 'prueba', conceptos: [
  g('nomen', 'Nomenclatura náutica'), g('ripa', 'Reglamento (RIPA)'), g('nav.esfera', 'Esfera'), g('nav.carta', 'Carta'),
  k('nomen.a', 'nomen', ['per-1-1']), k('nomen.b', 'nomen', ['per-1-2']), k('nomen.c', 'nomen', ['per-1-3']), k('nomen.d', 'nomen', ['per-1-4']),
  k('ripa.a', 'ripa', ['per-6-1']), k('ripa.b', 'ripa', ['per-6-2']), k('ripa.c', 'ripa', ['per-6-3']),
  k('nav.esfera.lat', 'nav.esfera', ['per-10-1']), k('nav.carta.sim', 'nav.carta', ['per-10-2']),
] }]);
const q = (id, ut, extra = {}) => ({ id, ut, enunciado: `Enunciado ${id}`, opciones: { a: '1', b: '2' }, correcta: 'a', ...extra });
const TODAS = [
  ...['a', 'b', 'c', 'd'].flatMap((c) => [q(`n${c}1`, 1), q(`n${c}2`, 1)]),
  ...['a', 'b', 'c'].flatMap((c) => [q(`r${c}1`, 6), q(`r${c}2`, 6)]),
  q('lat1', 10), q('sim1', 10),
  q('nR', 1), q('nX', 1, { anulada: true, correcta: null }), q('nW', 1, { norma: { estado: 'retirada' } }), q('nC', 1, { requiere: ['carta'] }), q('nT', 1, { contexto: 'Tabla larga' }),
];
const RESERVADAS = new Set(['nR']);
const ESTUDIO = TODAS.filter((x) => !RESERVADAS.has(x.id) && x.norma?.estado !== 'retirada');
const BANCO = { todas: TODAS, estudio: ESTUDIO, porId: new Map(TODAS.map((x) => [x.id, x])) };
const ETIQUETAS = Object.fromEntries([
  ...['a', 'b', 'c', 'd'].flatMap((c) => [[`n${c}1`, [`nomen.${c}`]], [`n${c}2`, [`nomen.${c}`]]]),
  ...['a', 'b', 'c'].flatMap((c) => [[`r${c}1`, [`ripa.${c}`]], [`r${c}2`, [`ripa.${c}`]]]),
  ['lat1', ['nav.esfera.lat']], ['sim1', ['nav.carta.sim']],
  ['nR', ['nomen.d']], ['nX', ['nomen.d']], ['nW', ['nomen.d']], ['nC', ['nomen.d']], ['nT', ['nomen.d']],
]);
const IC = crearIndiceConceptos({ catalogo: CATALOGO, etiquetas: ETIQUETAS, banco: BANCO });
const leccion = (id, titulo) => ({ id, titulo, minutos: 10, pasos: [], practica: [] });
const CURSO = { modulos: [
  { ut: 1, titulo: 'Nomenclatura', lecciones: ['per-1-1', 'per-1-2', 'per-1-3', 'per-1-4'].map((id) => leccion(id, `Clase ${id}`)) },
  { ut: 6, titulo: 'RIPA', lecciones: ['per-6-1', 'per-6-2', 'per-6-3'].map((id) => leccion(id, `Clase ${id}`)) },
  { ut: 10, titulo: 'Navegación', lecciones: ['per-10-1', 'per-10-2'].map((id) => leccion(id, `Clase ${id}`)) },
] };
const NO_VALEN = new Set(['nR', 'nX', 'nW', 'nC', 'nT']);

/** Recorre un test entero respondiendo con `responde(actual, i)`. */
function recorrer(ic, tit, curso, responde, { seed = 7, respuestas = {} } = {}) {
  let st = nuevoNivel(ic, tit, curso, { eje: 'prueba', seed, respuestas });
  let x;
  let i = 0;
  while ((x = siguienteNivel(st, ic, tit, curso, respuestas))) {
    st = responderNivel(st, x, responde(x, i));
    i += 1;
    assert.ok(i <= MAX_PREGUNTAS, 'nunca más de MAX_PREGUNTAS');
  }
  return st;
}

test('bloques: las raíces del catálogo; las de navegación (nav.*), un solo bloque', () => {
  assert.equal(bloqueDe(CATALOGO, 'nomen.a'), 'nomen');
  assert.equal(bloqueDe(CATALOGO, 'nav.esfera.lat'), 'nav');
  assert.equal(bloqueDe(CATALOGO, 'nav.carta.sim'), 'nav');
  const bs = bloquesNivel(candidatosNivel(IC, 'per', CURSO), CATALOGO);
  assert.deepEqual(bs.map((b) => b.id), ['nomen', 'ripa', 'nav']);
  assert.equal(bs.find((b) => b.id === 'nav').nombre, 'Navegación');
});

test('el test solo usa preguntas del estudio, aptas y con la idea como principal: nunca reservadas, anuladas, retiradas ni de carta', () => {
  assert.ok(!apta(q('x', 1, { requiere: ['carta'] })) && !apta(q('x', 1, { tabla_mareas: {} })) && apta(q('x', 1)));
  for (const responde of [() => true, () => false, (x, i) => i % 2 === 0]) {
    for (const seed of [1, 2, 3, 99]) {
      const st = recorrer(IC, 'per', CURSO, responde, { seed });
      for (const h of st.hechas) {
        assert.ok(!NO_VALEN.has(h.q), `${h.q} no vale`);
        assert.ok(ESTUDIO.some((x) => x.id === h.q));
        assert.equal(IC.principalDe(h.q), h.c);
      }
      assert.equal(new Set(st.hechas.map((h) => h.q)).size, st.hechas.length, 'sin repetir pregunta');
    }
  }
});

test('adaptativo: acierto → otra sonda; fallo → una más fácil del mismo bloque; dos fallos → el bloque se cierra', () => {
  // Todo bien: solo sondas, una por bloque y ronda.
  const bien = recorrer(IC, 'per', CURSO, () => true);
  assert.ok(bien.hechas.every((h) => h.tipo === 'sonda'));
  assert.equal(bien.hechas.length, bien.sondas.length);
  // Fallo en la primera sonda de nomen: la siguiente es fácil, del mismo bloque y de una clase anterior en la ruta.
  let st = nuevoNivel(IC, 'per', CURSO, { eje: 'prueba', seed: 5 });
  const s0 = siguienteNivel(st, IC, 'per', CURSO);
  assert.equal(s0.tipo, 'sonda');
  st = responderNivel(st, s0, false);
  const f = siguienteNivel(st, IC, 'per', CURSO);
  assert.equal(f.tipo, 'facil');
  assert.equal(f.bloque, s0.bloque);
  assert.notEqual(f.c, s0.c);
  const pos = (c) => CURSO.modulos.flatMap((m) => m.lecciones).findIndex((l) => CATALOGO.concepto(c).clases.includes(l.id));
  assert.ok(pos(f.c) < pos(s0.c), 'la fácil es más básica (antes en la ruta)');
  // Falla también la fácil: el bloque no recibe más sondas.
  st = responderNivel(st, f, false);
  let x;
  while ((x = siguienteNivel(st, IC, 'per', CURSO))) { assert.notEqual(x.bloque, s0.bloque); st = responderNivel(st, x, true); }
  const r = resultadoNivel(st, CATALOGO);
  assert.equal(r.bloques.find((b) => b.id === s0.bloque).estado, 'flojo');
  assert.ok(r.flojos.includes(s0.c) && r.flojos.includes(f.c));
  assert.ok(estimadasNivel(nuevoNivel(IC, 'per', CURSO, { eje: 'prueba', seed: 5 })) >= 1);
});

test('el resultado: ideas sabidas y flojas, bloque a medias; punto de partida', () => {
  let st = nuevoNivel(IC, 'per', CURSO, { eje: 'prueba', seed: 5 });
  const s0 = siguienteNivel(st, IC, 'per', CURSO);
  st = responderNivel(st, s0, false);
  const f = siguienteNivel(st, IC, 'per', CURSO);
  st = responderNivel(st, f, true);
  const r = resultadoNivel(st, CATALOGO);
  assert.equal(r.bloques.find((b) => b.id === s0.bloque).estado, 'a-medias');
  assert.deepEqual(r.sabidos, [f.c]);
  assert.deepEqual(r.flojos, [s0.c]);
  const resp = { [s0.q]: { ok: false, t: '2026-10-08T10:00:00Z' }, [f.q]: { ok: true, t: '2026-10-08T10:01:00Z' } };
  assert.deepEqual(puntoDePartida(r, IC, resp), { sabidas: 1, total: 2 });
});

test('las respuestas del test cuentan como una respuesta más, pero no entran en la cola de repaso ni cuentan como simulacro', () => {
  const p = createProgressStore(memoria());
  p.recordExam('na1', { choice: 'b', ok: false, nivel: true });
  p.recordExam('nb1', { choice: 'a', ok: true, nivel: true });
  const e = p.get().exams;
  assert.equal(e.na1.n, 1);
  assert.equal(e.na1.ok, false);
  assert.equal(e.na1.rep, null, 'un fallo del test no entra en la cola');
  assert.equal(e.na1.nivel, true);
  assert.equal(colaRepaso(ESTUDIO, e, '2026-10-09').total, 0);
  assert.equal(p.tests().length, 0, 'no es un simulacro');
  // El dominio sí lo recoge: la idea fallada, floja; la acertada, vista.
  const dom = IC.dominio(e);
  assert.equal(dom['nomen.a'].estado, 'flojo');
  assert.equal(dom['nomen.b'].vistas, 1);
  // ¿Estás listo? no cambia de regla: las respuestas del test pesan como cualquier otra respuesta (y no hay tests).
  assert.deepEqual(estoyListo(PER, ESTUDIO, e, []), estoyListo(PER, ESTUDIO, { na1: { ok: false, n: 1, ok1: false }, nb1: { ok: true, n: 1, ok1: true } }, []));
  // Lo que ya estaba en la cola sigue igual (ni sale ni se mueve).
  p.recordExam('ra1', { choice: 'b', ok: false });
  const rep = p.get().exams.ra1.rep;
  p.recordExam('ra1', { choice: 'a', ok: true, nivel: true });
  assert.deepEqual(p.get().exams.ra1.rep, rep);
  assert.equal(p.get().exams.ra1.n, 2);
  // Un registro antiguo fallado sin `rep` sigue pendiente.
  const q2 = createProgressStore(memoria());
  q2.get().exams.viejo = { ok: false, t: '2026-01-01T00:00:00Z' };
  q2.recordExam('viejo', { choice: 'a', ok: true, nivel: true });
  assert.ok(q2.get().exams.viejo.rep);
  // El resultado se guarda por eje y titulación.
  p.recordNivel('andalucia', 'per', { aciertos: 1, total: 2 });
  assert.equal(p.nivel('andalucia', 'per').aciertos, 1);
  assert.equal(p.nivel('baleares', 'per'), null);
});

test('clases que ya sabe: con una idea acertada en el test y ninguna floja; no las empezadas', () => {
  const resp = { na1: { ok: true, t: '2026-10-08T10:00:00Z' }, nb1: { ok: false, t: '2026-10-08T10:01:00Z' } };
  const nivel = { sabidos: ['nomen.a'], flojos: ['nomen.b'], hechas: [] };
  const xs = clasesQueSabes({ curso: CURSO, ic: IC, respuestas: resp, nivel, tit: 'per' });
  assert.deepEqual(xs.map((x) => x.l.id), ['per-1-1']);
  assert.ok(xs[0].porTest);
  // Empezada: ya no se ofrece. Fallada después del test: tampoco.
  assert.deepEqual(clasesQueSabes({ curso: CURSO, ic: IC, respuestas: resp, regs: { 'per-1-1': { paso: 2 } }, nivel, tit: 'per' }), []);
  const despues = { ...resp, na2: { ok: false, t: '2026-10-09T10:00:00Z' } };
  assert.deepEqual(clasesQueSabes({ curso: CURSO, ic: IC, respuestas: despues, nivel, tit: 'per' }), []);
  // Sin test, la práctica dominada (≥ 3 respuestas, ≥ 80 %) también vale.
  const practica = { rc1: { ok: true, t: 'a' }, rc2: { ok: true, t: 'b' }, ...Object.fromEntries([1, 2, 3].map((i) => [`rc${i}x`, { ok: true }])) };
  assert.deepEqual(clasesQueSabes({ curso: CURSO, ic: IC, respuestas: practica, tit: 'per' }), [], 'dos respuestas no bastan');
  // Sin etiquetas, nada.
  assert.deepEqual(clasesQueSabes({ curso: CURSO, ic: null, respuestas: resp, nivel, tit: 'per' }), []);
});

test('una clase saltada no está vista, pero el plan ya no la propone y cuenta para tener el tema visto', () => {
  const l = CURSO.modulos[0].lecciones[0];
  assert.equal(estadoLeccion(l, { saltada: true }, {}).estado, 'saltada');
  assert.equal(estadoLeccion(l, { saltada: true, paso: 3 }, {}).estado, 'empezada', 'al abrirla vuelve a ser una clase más');
  assert.equal(estadoLeccion(l, { saltada: true, visto: true, paso: 0 }, {}).estado, 'dominada');
  const regs = { 'per-1-1': { saltada: true } };
  const est = { estructura: PER, curso: CURSO, preguntas: ESTUDIO, regs, respuestas: {}, ahora: Date.now() };
  assert.equal(pendientesRuta(PER, CURSO, ESTUDIO, regs, {})[0].l.id, 'per-1-2');
  assert.equal(siguienteEnRuta(PER, CURSO, regs, {}).id, 'per-1-2');
  const plan = planHoy(est);
  assert.ok(!plan.some((a) => a.ruta?.[1] === 'per-1-1'), 'la sesión salta la clase que ya sabe');
  const e = estadoTema(PER.bloques.find((b) => b.ut === 1), CURSO, ESTUDIO, regs, {});
  assert.equal(e.clases.terminadas, 1);
  assert.equal(e.clases.vistas, 0, 'no se cuenta como vista');
});

// ---------------------------------------------------------------------------------------------------------------
// Ficha

test('la ficha toca cuando la idea sale floja por segunda vez', () => {
  const qs = IC.preguntasDe('nomen.a', { soloEstudio: false, conDescendientes: false });
  const d = (r) => resumenDominio(qs, r);
  const uno = { na1: { ok: false, t: '2026-10-07T10:00:00Z', n: 1 } };
  assert.equal(necesitaFicha(d(uno), qs, uno), false, 'un fallo: aún no');
  const dos = { ...uno, na2: { ok: false, t: '2026-10-08T10:00:00Z', n: 1 } };
  assert.equal(necesitaFicha(d(dos), qs, dos), true, 'dos fallos (la variante también)');
  const misma = { na1: { ok: false, t: '2026-10-08T10:00:00Z', n: 2 } };
  assert.equal(necesitaFicha(d(misma), qs, misma), true, 'la misma pregunta fallada dos veces');
  const medio = { ...dos, na2: { ok: true, t: '2026-10-09T10:00:00Z', n: 2 } };
  assert.equal(necesitaFicha(d(medio), qs, medio), true, 'una de dos (tasa suavizada 0,5): sigue floja');
  const recupera = { na1: { ok: true, t: '2026-10-10T10:00:00Z', n: 2 }, na2: { ok: true, t: '2026-10-09T10:00:00Z', n: 2 } };
  assert.equal(necesitaFicha(d(recupera), qs, recupera), false, 'las dos bien: ya no está floja');
  // Abierta después del último fallo: ya no está pendiente.
  assert.equal(fichaPendiente(d(dos), qs, dos, undefined), true);
  assert.equal(fichaPendiente(d(dos), qs, dos, '2026-10-08T11:00:00Z'), false);
  assert.equal(fichaPendiente(d(dos), qs, dos, '2026-10-08T09:00:00Z'), true, 'abierta antes del último fallo');
});

test('la nota para el alumno quita las instrucciones de etiquetado y deja el resto tal cual', () => {
  assert.equal(notaParaAlumno('Tipos de barómetro. La interpretación de la lectura va en meteo.presion.tendencia.'), 'Tipos de barómetro.');
  assert.equal(notaParaAlumno('Definición de proa y popa, incluidas las formas de popa cuando se preguntan como vocabulario.'), 'Definición de proa y popa, incluidas las formas de popa.');
  assert.equal(notaParaAlumno('Las cuatro pistas. Si la pregunta da la característica completa de una familia, va al concepto de esa familia. Azul y amarilla = nuevo peligro.'), 'Las cuatro pistas. Azul y amarilla = nuevo peligro.');
  assert.equal(notaParaAlumno('Destello largo (p. ej. ≥ 2 s). Art. 17 del RD.'), 'Destello largo (p. ej. ≥ 2 s). Art. 17 del RD.');
  assert.equal(notaParaAlumno('Retirado: fusionado en meteo.mar.factores.'), null);
  assert.equal(notaParaAlumno(''), null);
});

test('reglas de la idea y «Probar otra pregunta»: solo del estudio de la idea', () => {
  const regla = { id: 'r1', regla: 'La driza iza', significado: '…' };
  const reglas = reglasDeIdea(IC.preguntasDe('nomen.d', { soloEstudio: false }), (id) => (id === 'nd1' ? [regla] : []), { pasos: [{ tipo: 'regla', id: 'r2' }] }, new Map([['r2', { id: 'r2', regla: 'Otra' }]]));
  assert.deepEqual(reglas.map((r) => r.id), ['r1', 'r2']);
  const vistas = new Set();
  for (let i = 0; i < 6; i++) {
    const x = preguntaParaProbar(IC, 'nomen.d', {}, { excluir: [...vistas] });
    if (!x) break;
    assert.ok(!['nR', 'nX', 'nW'].includes(x.id), `${x.id} no vale`);
    vistas.add(x.id);
  }
  // En la ficha sí valen las de carta o con contexto (se practican con su carta); nunca reservadas, anuladas ni retiradas.
  assert.deepEqual([...vistas].sort(), ['nC', 'nT', 'nd1', 'nd2']);
  // Antes las no vistas.
  assert.equal(preguntaParaProbar(IC, 'nomen.a', { na1: { ok: false, t: 'x' } }).id, 'na2');
});

// ---------------------------------------------------------------------------------------------------------------
// Bancos reales: en todos los ejes y titulaciones, el test no saca nada fuera del estudio y dura lo que promete; sin
// etiquetas (simulado con un banco sin conceptos.json), no hay test.

for (const eje of ejes().filter((e) => e.estado === 'publicado').map((e) => e.id)) {
  for (const tit of Object.keys(leerJSON(`data/ejes/${eje}/eje.json`).examen)) {
    test(`${eje} ${tit}: el test de nivel es corto y nunca saca reservadas, anuladas ni retiradas`, async () => {
      const B = bancosNode();
      const banco = await B.cargarBanco(eje, tit);
      const curso = await B.cargarCurso(tit, eje);
      const ic = await crearConceptos(B).cargarConceptos(eje, tit);
      const enEstudio = new Set(banco.estudio.map((x) => x.id));
      if (!ic.etiquetadas().length) {
        assert.deepEqual(nuevoNivel(ic, tit, curso, { eje, seed: 1 }).sondas, []);
        return;
      }
      for (const responde of [() => true, () => false, (x, i) => i % 3 !== 0]) {
        const st = recorrer(ic, tit, curso, responde, { seed: 11 });
        assert.ok(st.hechas.length >= 10 && st.hechas.length <= MAX_PREGUNTAS, `${st.hechas.length} preguntas`);
        for (const h of st.hechas) {
          const x = banco.porId.get(h.q);
          assert.ok(enEstudio.has(h.q) && !banco.reservadas.has(h.q), `${h.q} fuera del estudio`);
          assert.ok(!x.anulada && x.norma?.estado !== 'retirada' && apta(x), `${h.q} no vale`);
        }
      }
    });
  }
}

test('sin etiquetas (banco sin conceptos.json), no hay test ni clases que saltar', async () => {
  const base = bancosNode();
  const sinEtiquetas = { ...base, cargarBanco: async (e, t) => { const b = await base.cargarBanco(e, t); return { ...b, etiquetasConceptos: async () => ({}) }; } };
  const ic = await crearConceptos(sinEtiquetas).cargarConceptos('andalucia', 'per');
  const curso = await base.cargarCurso('per', 'andalucia');
  assert.deepEqual(candidatosNivel(ic, 'per', curso), []);
  assert.deepEqual(nuevoNivel(ic, 'per', curso, { eje: 'andalucia', seed: 1 }).sondas, []);
  assert.equal(siguienteNivel(nuevoNivel(ic, 'per', curso, { eje: 'andalucia', seed: 1 }), ic, 'per', curso), null);
  assert.deepEqual(candidatosNivel(null, 'per', curso), []);
  assert.deepEqual(clasesQueSabes({ curso, ic: null, tit: 'per' }), []);
  assert.equal(puntoDePartida(null, null), null);
  void PY;
});
