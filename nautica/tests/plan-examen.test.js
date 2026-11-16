// Simulacro con estrategia (R-57) y ensayo general (R-66): src/course/plan-examen.js. Coste por tipo para ESE alumno,
// reparto del tiempo, aviso discreto, primer minuto, informe con dónde estimar y cansancio; y que las vistas no calculan.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { TITULACIONES, estructuraModulo, totalPreguntas } from '../src/theory/blocks.js';
import { tiempoDisponible } from '../src/course/estrategia.js';
import { costeTipo, clasificar, planExamen, planCompacto, avisoPlan, hitoActual, primerMinuto, informePlan, cansancio, partesGeneral, resumenGeneral, resumenPlan, AVISO_MIN_S } from '../src/course/plan-examen.js';
import { focoModulo, claveFoco } from '../src/course/foco.js';
import { bancosNode, EJE_POR_DEFECTO } from '../tools/bancos/leer.mjs';
import { SOLUCIONES } from '../src/bancos/soluciones.js';
import { esDeCarta } from '../src/bancos/index.js';

const leer = (f) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
const cfg = JSON.parse(leer('data/comun/estrategia.json')).tiempo;
const PY = TITULACIONES.py;
const NAV = estructuraModulo(PY.estructura, 'navegacion');
const disp = tiempoDisponible(PY, cfg);
const banco = await bancosNode().cargarBanco(EJE_POR_DEFECTO, 'py');
const tipoDe = (q) => SOLUCIONES[q.id]?.ejercicio ?? (q.ut === PY.cartaUt || esDeCarta(q) ? 'carta' : 'teoria');

/** Un módulo de navegación real: 10 de teoría (ut 3) y 10 de carta (ut 4) del estudio, con mareas y trazado. */
function examenNavegacion() {
  const teoria = banco.estudio.filter((q) => q.ut === 3).slice(0, 10);
  const carta = [
    ...banco.estudio.filter((q) => SOLUCIONES[q.id]?.ejercicio === 'marea-sonda').slice(0, 2),
    ...banco.estudio.filter((q) => SOLUCIONES[q.id]?.ejercicio === 'corriente-rumbo-a-dar').slice(0, 4),
    ...banco.estudio.filter((q) => SOLUCIONES[q.id]?.ejercicio === 'estima-analitica').slice(0, 4),
  ];
  return [...teoria, ...carta];
}
const fila = (tipo, mediaS, n, aciertos, estado) => ({ tipo, n, mediaS, aciertos, estado, carta: tipo !== 'teoria' });

test('coste por tipo: con tus datos, caro si te pasas o fallas más de la mitad; fácil si cabe y aciertas; un fallo abierto lo baja', () => {
  assert.equal(costeTipo('marea-sonda', fila('marea-sonda', 600, 4, 4, 'se-pasa'), disp).coste, 'caro');
  assert.equal(costeTipo('marea-sonda', fila('marea-sonda', 200, 4, 1, 'cabe'), disp).coste, 'caro');
  assert.equal(costeTipo('marea-sonda', fila('marea-sonda', 200, 4, 4, 'cabe'), disp).coste, 'facil');
  assert.equal(costeTipo('marea-sonda', fila('marea-sonda', 300, 4, 3, 'justo'), disp).coste, 'normal');
  const conFallo = costeTipo('marea-sonda', fila('marea-sonda', 200, 4, 4, 'cabe'), disp, ['Adelanto al revés']);
  assert.equal(conFallo.coste, 'normal');
  assert.match(conFallo.motivo, /Adelanto al revés/);
  assert.equal(costeTipo('marea-sonda', fila('marea-sonda', 200, 4, 4, 'cabe'), disp).fuente, 'tuyo');
  // Sin datos (o con una sola muestra): el reparto orientativo, y lo dice.
  const o = costeTipo('corriente-rumbo-a-dar', fila('corriente-rumbo-a-dar', 100, 1, 1, 'cabe'), disp);
  assert.deepEqual([o.coste, o.fuente], ['caro', 'orientativo']);
  assert.equal(o.estimadoS, disp.cartaS);
  assert.equal(costeTipo('marea-sonda', null, disp).coste, 'normal');
  assert.equal(costeTipo('teoria', null, disp).coste, 'facil');
  assert.equal(costeTipo('teoria', null, disp).estimadoS, disp.teoriaS);
});

test('reparto del tiempo sin datos: teoría primero, cuentas después, trazado al final; cabe en el tiempo del tribunal', () => {
  const preguntas = examenNavegacion();
  const tipos = Object.fromEntries(preguntas.map((q) => [q.id, tipoDe(q)]));
  const items = clasificar({ preguntas, tipos, disp });
  const plan = planExamen({ items, estructura: NAV, duracionMin: NAV.duracionMin, repasoFraccion: cfg.repasoFraccion });
  assert.deepEqual(plan.fases.map((f) => f.id), ['primero', 'despues', 'final']);
  assert.deepEqual(plan.fases[0].numeros, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.equal(plan.orden.length, 20);
  assert.equal(new Set(plan.orden).size, 20);
  // Las de corriente (trazado) van al final; las de mareas y estima analítica (cuentas), antes.
  const final = plan.fases.find((f) => f.id === 'final').numeros.map((n) => tipos[preguntas[n - 1].id]);
  assert.ok(final.every((t) => t === 'corriente-rumbo-a-dar'), final.join());
  assert.equal(plan.conDatos, false);
  // El presupuesto cabe en el tiempo menos el repaso.
  const suma = Object.values(plan.presupuesto).reduce((s, x) => s + x, 0);
  assert.ok(suma <= plan.disponibleS + 20, `${suma} > ${plan.disponibleS}`);
  assert.equal(plan.repasoMin, Math.round(NAV.duracionMin * cfg.repasoFraccion));
  // Si vas justo: como mucho las del límite de Carta menos uno (dejarla en blanco cuenta como fallo).
  assert.ok(plan.prescindibles.length <= NAV.bloques.find((b) => b.ut === 4).maxErrores - 1);
  assert.ok(plan.prescindibles.every((n) => plan.fases.find((f) => f.id === 'final').numeros.includes(n)));
  assert.equal(plan.hitos.at(-1).texto, 'Empieza el repaso de las marcadas');
  assert.match(resumenPlan(plan), /^PLAN: Primero 1,2,3/);
});

test('reparto con tus datos: lo lento y fallado al final; si no cabe, se escala el presupuesto y se dice cuánto falta', () => {
  const preguntas = examenNavegacion();
  const tipos = Object.fromEntries(preguntas.map((q) => [q.id, tipoDe(q)]));
  const filas = [fila('marea-sonda', 900, 5, 2, 'se-pasa'), fila('corriente-rumbo-a-dar', 150, 6, 6, 'cabe'), fila('estima-analitica', 260, 4, 3, 'justo'), fila('teoria', 60, 20, 18, 'cabe')];
  const items = clasificar({ preguntas, tipos, filas, disp });
  const plan = planExamen({ items, estructura: NAV, duracionMin: NAV.duracionMin });
  assert.equal(plan.conDatos, true);
  const final = plan.fases.find((f) => f.id === 'final').numeros.map((n) => tipos[preguntas[n - 1].id]);
  assert.deepEqual([...new Set(final)], ['marea-sonda']);
  const despues = plan.fases.find((f) => f.id === 'despues').numeros.map((n) => tipos[preguntas[n - 1].id]);
  assert.equal(despues[0], 'corriente-rumbo-a-dar', 'la más rápida y segura, la primera de la carta');
  // 10·60 + 4·150 + 4·260 + 2·900 = 4040 s > 75 min − repaso (4050)? Justo: con un tiempo menor, no cabe.
  const corto = planExamen({ items, estructura: NAV, duracionMin: 45 });
  assert.equal(corto.cabe, false);
  assert.ok(corto.faltaS > 0);
  const suma = Object.values(corto.presupuesto).reduce((s, x) => s + x, 0);
  assert.ok(Math.abs(suma - corto.disponibleS) <= 20);
});

test('aviso discreto: solo cuando la pregunta se alarga o el ritmo se queda atrás; nunca al empezar', () => {
  const plan = { orden: ['a', 'b', 'c', 'd'], presupuesto: { a: 60, b: 60, c: 300, d: 300 }, prescindibles: [4], disponibleS: 2400 };
  assert.equal(avisoPlan({ plan, consumidoS: 30, actual: { id: 'a', n: 1, s: 30 }, respondidas: 0 }), null);
  assert.equal(avisoPlan({ plan, consumidoS: 80, actual: { id: 'a', n: 1, s: 80 }, respondidas: 0 }), null, 'por debajo del mínimo no se avisa');
  const p = avisoPlan({ plan, consumidoS: 200, actual: { id: 'a', n: 1, s: AVISO_MIN_S + 1, tipo: 'teoria' }, respondidas: 0 });
  assert.equal(p.tipo, 'pregunta');
  assert.match(p.texto, /Llevas 1 min 31 s en la 1; tu plan le daba 1 min/);
  const d = avisoPlan({ plan, consumidoS: 1000, actual: { id: 'd', n: 4, s: 460, tipo: 'marea-sonda' }, respondidas: 3 });
  assert.match(d.texto, /no merecen la pena si vas justo/);
  assert.match(d.pista, /bajamar/);
  const r = avisoPlan({ plan, consumidoS: 900, actual: { id: 'b', n: 2, s: 10 }, respondidas: 1 });
  assert.equal(r.tipo, 'ritmo');
  assert.match(r.texto, /por detrás de tu plan/);
  assert.equal(avisoPlan({ plan: null, consumidoS: 9999 }), null);
  assert.equal(hitoActual({ hitos: [{ minuto: 10, texto: 'x' }, { minuto: 30, texto: 'y' }] }, 15 * 60).texto, 'x');
  assert.equal(hitoActual({ hitos: [{ minuto: 10, texto: 'x' }] }, 60), null);
});

test('el plan compacto (el que se guarda con el examen a medias) basta para el aviso y el informe', () => {
  const preguntas = examenNavegacion();
  const items = clasificar({ preguntas, tipos: Object.fromEntries(preguntas.map((q) => [q.id, tipoDe(q)])), disp });
  const plan = planExamen({ items, estructura: NAV, duracionMin: NAV.duracionMin });
  const c = planCompacto(plan);
  assert.deepEqual(Object.keys(c).sort(), ['cabe', 'disponibleS', 'duracionMin', 'fases', 'hitos', 'orden', 'prescindibles', 'presupuesto']);
  assert.ok(JSON.stringify(c).length < 4000);
  assert.deepEqual(avisoPlan({ plan: c, consumidoS: 5000, respondidas: 2 }), avisoPlan({ plan, consumidoS: 5000, respondidas: 2 }));
});

test('primer minuto: cuenta los tipos, marca fáciles y caros y dice dónde están las mareas, los desvíos y los faros', () => {
  const preguntas = examenNavegacion();
  const tipos = Object.fromEntries(preguntas.map((q) => [q.id, tipoDe(q)]));
  const items = clasificar({ preguntas, tipos, disp });
  const pm = primerMinuto({ preguntas, items, esDeCarta });
  assert.equal(pm.recuento.reduce((s, r) => s + r.numeros.length, 0), 20);
  assert.equal(pm.recuento[0].tipo, 'teoria');
  const marea = pm.recuento.find((r) => r.tipo === 'marea-sonda');
  assert.deepEqual(marea.numeros, [11, 12]);
  const mareas = pm.localizar.find((l) => l.id === 'mareas');
  assert.ok(mareas.numeros.includes(11) && mareas.numeros.includes(12));
  assert.match(mareas.texto, /UT/);
  assert.ok(pm.localizar.some((l) => l.id === 'desvios'));
  assert.ok(pm.faros.length >= 1, 'las de corriente nombran faros o puertos');
  assert.ok(pm.faros.every((f) => /^[A-ZÁÉÍÓÚ]/.test(f)));
  assert.equal(pm.conDatos, false);
});

test('informe: plan frente a lo hecho y dónde habría convenido estimar (solo donde un dato permite descartar)', () => {
  const preguntas = examenNavegacion();
  const tipos = Object.fromEntries(preguntas.map((q) => [q.id, tipoDe(q)]));
  const plan = planExamen({ items: clasificar({ preguntas, tipos, disp }), estructura: NAV, duracionMin: NAV.duracionMin });
  // Falla todas las de carta (marca la «a» si no es la buena; si lo es, la deja en blanco) y tarda el doble en ellas.
  const detalle = preguntas.map((q) => {
    const carta = q.ut === 4;
    const r = carta ? (q.correcta === 'a' ? null : 'a') : q.correcta;
    return { id: q.id, ok: r === q.correcta, respuesta: r, anulada: false, retirada: false };
  });
  const segundos = Object.fromEntries(preguntas.map((q) => [q.id, (plan.presupuesto[q.id] ?? 60) * (q.ut === 4 ? 2 : 1)]));
  const inf = informePlan({ plan, preguntas, detalle, segundos });
  assert.deepEqual(inf.fases.map((f) => f.id), ['primero', 'despues', 'final']);
  assert.equal(inf.fases[0].aciertos, 10);
  assert.match(inf.texto, /Te pasaste del plan/);
  assert.ok(inf.estimar.length >= 2, 'mareas y estima analítica traen datos para descartar');
  for (const e of inf.estimar) {
    const q = preguntas[e.n - 1];
    assert.ok(!e.descartadas.includes(q.correcta));
    assert.ok(e.reglas.length && e.motivo);
  }
  // Sin tiempo por pregunta (ensayo en papel): sin comparación de tiempo, pero con dónde estimar.
  const papel = informePlan({ plan, preguntas, detalle });
  assert.ok(papel.fases.every((f) => f.realMin == null));
  assert.equal(papel.texto, null);
  assert.ok(papel.estimar.length >= 1);
});

test('cansancio: la primera mitad del tiempo frente a la segunda, solo con datos suficientes', () => {
  const ids = Array.from({ length: 12 }, (_, i) => `q${i}`);
  const marcas = Object.fromEntries(ids.map((id, i) => [id, i * 300000]));
  const totalMs = 12 * 300000;
  const detalle = ids.map((id, i) => ({ id, ok: i < 6 ? true : i % 2 === 0 }));
  const presupuesto = Object.fromEntries(ids.map((id) => [id, 300]));
  const segundos = Object.fromEntries(ids.map((id, i) => [id, i < 6 ? 300 : 420]));
  const c = cansancio({ marcas, totalMs, detalle, segundos, presupuesto });
  assert.equal(c.primera.n, 6);
  assert.equal(c.primera.aciertos, 6);
  assert.equal(c.segunda.aciertos, 3);
  assert.ok(c.baja && c.lento);
  assert.match(c.texto, /segunda mitad bajaste/);
  const igual = cansancio({ marcas, totalMs, detalle: ids.map((id) => ({ id, ok: true })), segundos: presupuesto, presupuesto });
  assert.match(igual.texto, /^Aguantaste/);
  assert.equal(cansancio({ marcas: { a: 1, b: 2 }, totalMs, detalle: [{ id: 'a', ok: true }, { id: 'b', ok: true }] }), null);
  assert.equal(cansancio({ marcas, totalMs: 0, detalle }), null);
});

test('ensayo general: PY genérico y navegación seguidos con sus tiempos; con foco, solo ese módulo; PER, el examen entero', () => {
  const py = partesGeneral(PY.estructura, null);
  assert.deepEqual(py.map((p) => [p.id, p.duracionMin, p.preguntas]), [['generico', 45, 20], ['navegacion', 75, 20]]);
  assert.equal(resumenGeneral(py).minutos, 120);
  assert.match(resumenGeneral(py).texto, /sin pausa/);
  // El foco del alumno (ajuste compartido modulos_py): solo navegación.
  const foco = focoModulo({ [claveFoco('py')]: 'navegacion' }, 'py', PY.estructura);
  const nav = partesGeneral(PY.estructura, foco);
  assert.deepEqual(nav.map((p) => p.id), ['navegacion']);
  assert.equal(nav[0].estructura.modulo, 'navegacion');
  const per = partesGeneral(TITULACIONES.per.estructura, null);
  assert.deepEqual(per.map((p) => [p.id, p.duracionMin, p.preguntas]), [['completo', 90, totalPreguntas(TITULACIONES.per.estructura)]]);
});

test('la vista no calcula el plan: lo pide a src/ui/plan-examen.js, que usa la lógica pura; el examen en marcha no enseña descartes', () => {
  const calculos = /\b(planExamen|clasificar|costeTipo|primerMinuto|informePlan|cansancio|descartes|partesGeneral)\(/;
  for (const f of readdirSync(new URL('../src/ui/views/', import.meta.url))) {
    const src = leer(`src/ui/views/${f}`);
    assert.ok(!calculos.test(src), `${f} calcula por su cuenta: ${src.match(calculos)?.[0]}`);
  }
  const ui = leer('src/ui/plan-examen.js');
  assert.match(ui, /from '\.\.\/course\/plan-examen\.js'/);
  // Durante el examen, el aviso no dice qué opción descartar (sería una pista): solo la pista general del tipo.
  const theory = leer('src/ui/views/theory.js');
  const correr = theory.slice(theory.indexOf('function correr('), theory.indexOf('function correrPapel('));
  assert.doesNotMatch(correr, /descartes|informeDelPlan/);
  assert.match(correr, /avisoDelPlan\(/);
});
