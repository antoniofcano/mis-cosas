// Motor de seguimiento: las pantallas solo pintan lo que calcula el motor, y el motor cumple sus reglas en
// sesiones de estudio simuladas al azar (PER y PY, con datos reales).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { estadoAlumno, invariantes } from '../src/course/motor.js';
import { PER, PY } from '../src/theory/blocks.js';
import { createRng } from '../src/math/rng.js';
import { trasPractica, numTramos, leccionesDe } from '../src/course/engine.js';

const leer = (f) => JSON.parse(readFileSync(new URL(`../${f}`, import.meta.url), 'utf8'));
const DIA = 864e5;

test('ninguna pantalla calcula números por su cuenta: todo sale del motor', () => {
  const calculos = /\b(estadoTema|avanceCamino|avance|ritmoEstudio|estoyListo|planHoy|seguimiento|crearPlan|lineaSeguimiento|lineaRitmo|clasesFlojas|temasFlojos)\(/;
  for (const f of readdirSync(new URL('../src/ui/views/', import.meta.url))) {
    const src = readFileSync(new URL(`../src/ui/views/${f}`, import.meta.url), 'utf8');
    assert.ok(!calculos.test(src), `${f} calcula por su cuenta: ${src.match(calculos)?.[0]}`);
  }
});

/** Una sesión simulada: días de estudio con acciones al azar (preguntas, tramos, clases, prácticas). */
function simula(tit, estructura, semilla, conFecha) {
  const curso = leer(`data/curso/${tit}.json`);
  const preguntas = leer(`data/exams/andalucia-${tit}-teoria.json`).preguntas;
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
    const st = estadoAlumno({ tit, estructura, curso, preguntas, regs, respuestas, tests: [], settings, minutosHoy: dias[hoy] ?? 0, racha: 0, planGuardado, ahora });
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
  const curso = leer('data/curso/per.json');
  const preguntas = leer('data/exams/andalucia-per-teoria.json').preguntas;
  const base = { tit: 'per', estructura: PER, curso, preguntas, regs: {}, respuestas: {}, tests: [], racha: 0, planGuardado: null, ahora: Date.UTC(2026, 9, 6, 9) };
  for (const conFecha of [false, true]) {
    const settings = { minutosDia: 30, ...(conFecha ? { examen_per: '2026-10-20' } : {}) };
    assert.ok(['hecho', 'hecho-atraso', 'terminado'].includes(estadoAlumno({ ...base, settings, minutosHoy: 35 }).mensaje.tipo));
    assert.ok(!['hecho', 'hecho-atraso'].includes(estadoAlumno({ ...base, settings, minutosHoy: 5 }).mensaje.tipo));
  }
});

test('mensaje del día: si con tus minutos no llegas, se avisa también el día que cumples la meta', () => {
  const curso = leer('data/curso/per.json');
  const preguntas = leer('data/exams/andalucia-per-teoria.json').preguntas;
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
