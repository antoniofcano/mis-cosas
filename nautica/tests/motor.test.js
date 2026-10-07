// Motor de seguimiento: las pantallas solo pintan lo que calcula el motor, y el motor cumple sus reglas en
// sesiones de estudio simuladas al azar (PER y PY, con datos reales).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { estadoAlumno, invariantes } from '../src/course/motor.js';
import { PER, PY } from '../src/theory/blocks.js';
import { createRng } from '../src/math/rng.js';
import { trasPractica, numTramos, leccionesDe } from '../src/course/engine.js';
import { cursoDe, bancosNode, EJE_POR_DEFECTO } from '../tools/bancos/leer.mjs';

// El banco de estudio de cada titulación (sin lo reservado para el examen final) y su reserva, como en la app.
const BANCOS = { per: await bancosNode().cargarBanco(EJE_POR_DEFECTO, 'per'), py: await bancosNode().cargarBanco(EJE_POR_DEFECTO, 'py') };
const preguntasDe = (tit) => BANCOS[tit].estudio;
const reservaDe = (tit) => ({ reserva: BANCOS[tit].reserva, pool: BANCOS[tit].final, reservadas: BANCOS[tit].reservadas });

const leer = (f) => JSON.parse(readFileSync(new URL(`../${f}`, import.meta.url), 'utf8'));
const DIA = 864e5;

test('ninguna pantalla calcula números por su cuenta: todo sale del motor', () => {
  const calculos = /\b(estadoTema|avanceCamino|avance|ritmoEstudio|estoyListo|planHoy|seguimiento|crearPlan|lineaSeguimiento|lineaRitmo|clasesFlojas|temasFlojos|estadoFinal|margenExamen)\(/;
  for (const f of readdirSync(new URL('../src/ui/views/', import.meta.url))) {
    const src = readFileSync(new URL(`../src/ui/views/${f}`, import.meta.url), 'utf8');
    assert.ok(!calculos.test(src), `${f} calcula por su cuenta: ${src.match(calculos)?.[0]}`);
  }
});

/** Una sesión simulada: días de estudio con acciones al azar (preguntas, tramos, clases, prácticas). */
function simula(tit, estructura, semilla, conFecha) {
  const curso = cursoDe(tit);
  const preguntas = preguntasDe(tit);
  const lecciones = leccionesDe(curso);
  const rng = createRng(semilla);
  const t0 = Date.UTC(2026, 9, 6, 9);
  const settings = { minutosDia: 30, ...(conFecha ? { [`examen_${tit}`]: '2027-01-20' } : {}) };
  const regs = {};
  const respuestas = {};
  const dias = {};
  let planGuardado = null;
  const estado = (ahora) => {
    const hoy = new Date(ahora).toLocaleDateString('sv-SE');
    const st = estadoAlumno({ tit, estructura, curso, preguntas, regs, respuestas, tests: [], settings, minutosHoy: dias[hoy] ?? 0, racha: 0, planGuardado, ahora, ...reservaDe(tit) });
    if (st.plan?.nuevo) planGuardado = st.plan.base;
    return st;
  };
  const fallos = [];
  for (let dia = 0; dia < 6; dia++) {
    let ahora = t0 + dia * DIA;
    const hoy = new Date(ahora).toLocaleDateString('sv-SE');
    let prev = estado(ahora);
    for (let k = 0; k < 8; k++) {
      ahora += 5 * 60000;
      const accion = rng.int(0, 3);
      if (accion === 0) { // una tanda de preguntas de un tema
        const ut = rng.pick(estructura.bloques).ut;
        for (const q of preguntas.filter((x) => x.ut === ut).slice(0, 10)) respuestas[q.id] = { choice: null, ok: rng.next() < 0.5 };
        // Un alumno de antes de la reserva también respondió preguntas que ahora son del examen final: no cuentan.
        for (const q of BANCOS[tit].final.filter((x) => x.ut === ut).slice(0, 3)) respuestas[q.id] = { choice: null, ok: false };
      } else if (accion === 1) { // un tramo de la clase que toca
        const l = lecciones.find((x) => !regs[x.id]?.visto) ?? lecciones[0];
        const k2 = numTramos(l.pasos.filter((p) => !p.extra).length);
        const r = regs[l.id] ?? {};
        regs[l.id] = (r.tramo ?? 0) + 1 >= k2 ? { ...r, visto: true, paso: 0, tramo: 0, tramos: k2 } : { ...r, paso: 3, tramo: (r.tramo ?? 0) + 1, tramos: k2 };
      } else if (accion === 2) { // práctica de una clase vista
        const l = lecciones.find((x) => regs[x.id]?.visto);
        if (l) regs[l.id] = trasPractica(regs[l.id], rng.next(), ahora);
      }
      dias[hoy] = (dias[hoy] ?? 0) + 5; // minutos reales estudiados
      const st = estado(ahora);
      for (const m of invariantes(st)) fallos.push(`día ${dia}: ${m}`);
      // Estudiar nunca hace bajar el avance ni las preguntas hechas, ni aleja la fecha de fin el mismo día.
      if (st.camino.fraccion + 1e-9 < prev.camino.fraccion) fallos.push(`día ${dia}: el avance bajó de ${prev.camino.fraccion} a ${st.camino.fraccion}`);
      for (const { b, e } of st.temas) { const a = prev.temas.find((x) => x.b.ut === b.ut).e; if (e.hechas < a.hechas) fallos.push(`día ${dia}: ${b.titulo} bajó de ${a.hechas} a ${e.hechas} preguntas`); }
      if (!conFecha && st.ritmo.fechaFin && prev.ritmo.fechaFin && st.ritmo.fechaFin > prev.ritmo.fechaFin && st.ritmo.desglose.repaso <= prev.ritmo.desglose.repaso) fallos.push(`día ${dia}: la fecha de fin se alejó al estudiar (${prev.ritmo.fechaFin} → ${st.ritmo.fechaFin})`);
      prev = st;
    }
  }
  return fallos;
}

for (const [tit, E] of [['per', PER], ['py', PY]]) {
  for (const conFecha of [false, true]) {
    test(`motor (${tit}, ${conFecha ? 'con' : 'sin'} fecha): invariantes en sesiones simuladas`, () => {
      for (const semilla of [1, 2, 3]) assert.deepEqual(simula(tit, E, semilla, conFecha), [], `semilla ${semilla}`);
    });
  }
}

test('mensaje del día: con la meta cumplida nunca «toca», y sin cumplirla nunca «hecho»', () => {
  const curso = cursoDe('per');
  const preguntas = preguntasDe('per');
  const base = { tit: 'per', estructura: PER, curso, preguntas, regs: {}, respuestas: {}, tests: [], racha: 0, planGuardado: null, ahora: Date.UTC(2026, 9, 6, 9) };
  for (const conFecha of [false, true]) {
    const settings = { minutosDia: 30, ...(conFecha ? { examen_per: '2026-10-20' } : {}) };
    assert.ok(['hecho', 'hecho-atraso', 'terminado'].includes(estadoAlumno({ ...base, settings, minutosHoy: 35 }).mensaje.tipo));
    assert.ok(!['hecho', 'hecho-atraso'].includes(estadoAlumno({ ...base, settings, minutosHoy: 5 }).mensaje.tipo));
  }
});

test('mensaje del día: si con tus minutos no llegas, se avisa también el día que cumples la meta', () => {
  const curso = cursoDe('per');
  const preguntas = preguntasDe('per');
  // Examen en 14 días con 20 minutos: no da tiempo.
  const e = { tit: 'per', estructura: PER, curso, preguntas, regs: {}, respuestas: {}, tests: [], racha: 0, planGuardado: null, ahora: Date.UTC(2026, 9, 6, 9), settings: { minutosDia: 20, examen_per: '2026-10-20' } };
  for (const minutosHoy of [5, 25]) {
    const st = estadoAlumno({ ...e, minutosHoy });
    assert.equal(st.plan.seg.estado, 'no-llega');
    assert.ok(st.mensaje.aviso, `minutosHoy ${minutosHoy}: ${st.mensaje.texto}`);
    assert.match(`${st.mensaje.texto} ${st.mensaje.detalle}`, /minutos al día/);
    assert.deepEqual(invariantes(st), []);
  }
});
// --- Examen final (F1) ----------------------------------------------------------------------------------------

/** Respuestas de un alumno que acierta todo el estudio de una titulación (estaría listo). */
const todoBien = (tit) => Object.fromEntries(preguntasDe(tit).map((q) => [q.id, { choice: q.correcta, ok: true, n: 1 }]));

for (const [tit, E] of [['per', PER], ['py', PY]]) {
  test(`motor (${tit}): examen final cerrado sin estar listo, abierto y propuesto en la recta final, y «preparado» con margen`, () => {
    const curso = cursoDe(tit);
    const ahora = Date.UTC(2026, 9, 6, 9);
    const base = { tit, estructura: E, curso, preguntas: preguntasDe(tit), regs: {}, tests: [], racha: 0, planGuardado: null, ahora, minutosHoy: 0, ...reservaDe(tit) };
    // Alumno nuevo: cerrado, y dice qué le falta (los temas sin datos de «¿Estás listo?»).
    const nuevo = estadoAlumno({ ...base, respuestas: {}, settings: { minutosDia: 30 } });
    assert.equal(nuevo.final.hay, true);
    assert.equal(nuevo.final.desbloqueado, false);
    assert.equal(nuevo.final.bloqueo.motivo, 'faltan-datos');
    assert.equal(nuevo.final.bloqueo.temas.length, E.bloques.length);
    assert.match(nuevo.final.lineas[0], /te faltan/);
    assert.ok(!nuevo.actividades.some((a) => a.tipo === 'final'));
    assert.deepEqual(invariantes(nuevo), []);

    // Listo y con el examen en 10 días: abierto y propuesto en Hoy (antes que el simulacro).
    const respuestas = todoBien(tit);
    const settings = { minutosDia: 30, [`examen_${tit}`]: '2026-10-16' };
    const listo = estadoAlumno({ ...base, respuestas, settings });
    assert.equal(listo.listo.estado, 'listo');
    assert.equal(listo.final.desbloqueado, true);
    assert.equal(listo.final.todasVistas, false);
    assert.equal(listo.final.ineditas, 5);
    assert.ok(listo.actividades.some((a) => a.tipo === 'final' && a.ruta.join('/') === 'test/final'));
    assert.deepEqual(invariantes(listo), []);
    // Sin fecha (o lejos), no se propone: se ofrece en Examen.
    assert.ok(!estadoAlumno({ ...base, respuestas, settings: { minutosDia: 30 } }).actividades.some((a) => a.tipo === 'final'));

    // Aprobado justo (sin margen): no está preparado y se sigue proponiendo otro día; con margen, preparado.
    const total = E.bloques.reduce((n, b) => n + b.n, 0);
    const porTema = (fallos) => E.bloques.map((b) => ({ ut: b.ut, aciertos: b.n - (fallos[b.ut] ?? 0), total: b.n }));
    const limite = E.bloques.find((b) => E.margen.maxErrores[b.ut] != null);
    const justo = { tipo: 'final', tit, conv: listo.final.siguiente.key, aciertos: total - (E.margen.maxErrores[limite.ut] + 1), total, apto: true, porTema: porTema({ [limite.ut]: E.margen.maxErrores[limite.ut] + 1 }), t: new Date(ahora - 864e5).toISOString() };
    const tras = estadoAlumno({ ...base, respuestas, settings, tests: [justo] });
    assert.equal(tras.final.preparado, false);
    assert.match(tras.final.lineasResultado[0], /sin margen/);
    assert.equal(tras.final.ineditas, 4, 'la convocatoria hecha ya no es inédita');
    assert.notEqual(tras.final.siguiente.key, justo.conv);
    assert.deepEqual(invariantes(tras), []);
    const bien = { ...justo, aciertos: total, porTema: porTema({}) };
    const prep = estadoAlumno({ ...base, respuestas, settings, tests: [bien] });
    assert.equal(prep.final.preparado, true);
    assert.match(prep.final.lineasResultado[0], /estás preparado/);
    assert.ok(!prep.actividades.some((a) => a.tipo === 'final'));
    assert.deepEqual(invariantes(prep), []);
  });
}
