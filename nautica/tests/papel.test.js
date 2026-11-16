// Corregir la hoja en papel por pasos (R-58): el kit sigue con los datos del alumno (`fijos`), el primer desvío se
// localiza, el error típico se nombra y los pasos bien hechos a partir de un dato malo no se marcan (errores
// arrastrados). Barrido sobre las preguntas reales del estudio de todos los bancos (nunca las reservadas).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createKit } from '../src/exams/kit.js';
import { SOLUCIONES } from '../src/bancos/soluciones.js';
import { VARIANTES, tipoDe, ERRORES } from '../src/exams/taxonomia.js';
import { toleranciaCampo } from '../src/exams/guiado.js';
import { quantity } from '../src/analysis/quantities.js';
import { pasosPapel, corregirPapel, veredicto, textoPapel, margenTexto, tecladoDe, leerEntradas, papelPosible, PAPEL } from '../src/exams/papel.js';
import { ORIGENES, anotar, falloValido } from '../src/course/cuaderno.js';
import { bancosNode, ejes, titsDeEje } from '../tools/bancos/leer.mjs';
import { chart } from './helpers.js';

const B = bancosNode();
// Las preguntas del estudio (sin reservadas, retiradas ni anuladas) con resolución por pasos, de todos los ejes.
const estudio = [];
for (const eje of ejes()) {
  for (const tit of titsDeEje(eje.id ?? eje)) {
    const banco = await B.cargarBanco(eje.id ?? eje, tit);
    for (const q of banco.estudio) if (SOLUCIONES[q.id] && !banco.reservadas.has(q.id)) estudio.push(q);
  }
}
const porId = new Map(estudio.map((q) => [q.id, q]));
const MAREA = 'and-py-2020-c1-n19'; // sonda a una hora oficial: hora UT, tramo, I, C, altura y sonda
const fmt = (c) => quantity(c.kind).format(c.value);
const resolverCon = (q, o) => { const k = createKit(chart, o); try { k.values = SOLUCIONES[q.id].solve(k, q); } catch { k.roto = true; } return k; };
/** Lo que escribiría en su hoja quien comete `variante` en su paso y sigue bien con su dato: { entradas, en } o null. */
function hojaConError(q, variante) {
  const base = resolverCon(q, {});
  const ps = pasosPapel(base.steps);
  const ke = resolverCon(q, { error: variante });
  const en = ps.find((p) => ke.steps[p.i]?.pide && ke.steps[p.i].pide.campos.some((c, j) => quantity(c.kind).error(c.value, p.campos[j].value) > 2.5 * toleranciaCampo(p.campos[j])));
  if (!en || !en.errores.includes(tipoDe(variante)) || ke.steps[en.i].pide.paso !== en.paso) return null;
  const kf = resolverCon(q, { fijos: { [en.i]: ke.steps[en.i].pide.campos.map((c) => c.value) } });
  if (kf.roto) return null;
  const entradas = {};
  for (const p of ps) if (kf.steps[p.i]?.pide) entradas[p.i] = kf.steps[p.i].pide.campos.map(fmt);
  return { entradas, en, ps };
}
const hojaBien = (q) => { const k = resolverCon(q, {}); return Object.fromEntries(pasosPapel(k.steps).map((p) => [p.i, p.campos.map(fmt)])); };

test('la pregunta de mareas de las pruebas es del estudio (no reservada) y hay un banco amplio de preguntas reales', () => {
  assert.ok(porId.has(MAREA), `${MAREA} no está en el estudio`);
  assert.ok(estudio.length > 800, `solo ${estudio.length} preguntas con resolución`);
});

test('kit con `fijos` vacío o con sus propios valores: los mismos resultados', () => {
  let n = 0;
  for (const q of estudio.filter((_, j) => j % 5 === 0)) {
    const a = resolverCon(q, {});
    if (a.roto) continue;
    const ps = pasosPapel(a.steps);
    const propios = Object.fromEntries(ps.map((p) => [p.i, p.campos.map((c) => c.value)]));
    for (const o of [{ fijos: {} }, { fijos: propios }]) {
      const b = resolverCon(q, o);
      assert.ok(!b.roto, q.id);
      for (const p of ps) b.steps[p.i].pide.campos.forEach((c, j) => assert.ok(Math.abs(c.value - p.campos[j].value) < 1e-6, `${q.id} paso ${p.n}`));
      a.values.forEach((v, j) => assert.ok(Math.abs(v.value - b.values[j].value) < 1e-6, `${q.id} resultado ${j}`));
    }
    n += 1;
  }
  assert.ok(n > 150, `solo ${n}`);
});

test('kit con `fijos`: el paso siguiente sale con el dato del alumno (mareas: la hora UT con el adelanto sumado)', () => {
  const q = porId.get(MAREA);
  const k = resolverCon(q, { fijos: { 0: [23 * 60 + 50] } });
  assert.ok(!k.roto, 'con la hora fuera de la tabla se sigue con el último tramo');
  const ps = pasosPapel(k.steps);
  assert.equal(fmt(ps[0].campos[0]), '23:50');
  assert.equal(fmt(ps[2].campos[0]), '25 min'); // I desde la bajamar de las 23:25
  assert.equal(fmt(ps[5].campos[0]), '2,64 m');
  // Sin `fijos`, el kit no inventa: el error simulado se sale de la tabla y se rompe, como antes.
  assert.ok(resolverCon(q, { error: 'adelanto-signo' }).roto);
});

test('mareas: suma el adelanto en la hora UT y sigue bien; solo cuenta ese paso y se nombra el error', () => {
  const q = porId.get(MAREA);
  const { entradas, en } = hojaConError(q, 'adelanto-signo');
  assert.equal(en.n, 1);
  assert.deepEqual(entradas[0], ['23:50']);
  const r = corregirPapel({ sol: SOLUCIONES[q.id], q, chart, entradas });
  assert.equal(r.primero.n, 1);
  assert.equal(r.primero.estado, PAPEL.MAL);
  assert.deepEqual(r.fallo, { error: 'adelanto-signo', i: 0, n: 1, title: 'TU' });
  assert.equal(r.pasos[1].estado, PAPEL.OK, 'D y A del mismo tramo: bien');
  for (const p of r.pasos.slice(2)) assert.equal(p.estado, PAPEL.ARRASTRADO, `${p.n} ${p.title}`);
  assert.equal(r.arrastrados, 4);
  assert.equal(r.otros, 0);
  assert.match(veredicto(r), /paso 1.*Adelanto al revés.*4 pasos siguientes.*bien hechos con tu dato/);
  assert.match(textoPapel(r), /ERROR adelanto-signo/);
  assert.equal(r.pasos[5].campos[0].conTuDatoTexto, '2,64 m');
});

test('mareas: un error en medio (marea en línea recta) y lo de antes bien; lo de después, arrastrado', () => {
  const q = porId.get(MAREA);
  const r = corregirPapel({ sol: SOLUCIONES[q.id], q, chart, entradas: { 0: ['2150'], 3: ['0,6'], 4: ['1,5'], 5: ['3,2'] } });
  assert.deepEqual(r.pasos.map((p) => p.estado), [PAPEL.OK, PAPEL.VACIO, PAPEL.VACIO, PAPEL.MAL, PAPEL.ARRASTRADO, PAPEL.ARRASTRADO]);
  assert.equal(r.fallo.error, 'lineal');
  assert.equal(r.escritos, 4);
});

test('mareas: solo el resultado final; el error se busca también en los pasos que no escribió', () => {
  const q = porId.get(MAREA);
  const sol = SOLUCIONES[q.id];
  // Olvidar la sonda de la carta: se comete en el propio paso.
  const a = corregirPapel({ sol, q, chart, entradas: { 5: ['1,23'] } });
  assert.equal(a.fallo.error, 'sonda-carta-olvidada');
  // 2,64 m sale con el adelanto al revés y casi igual sin pasar a UT: dos posibles, ninguno al cuaderno.
  const b = corregirPapel({ sol, q, chart, entradas: { 5: ['2,64'] } });
  assert.equal(b.primero.n, 6);
  assert.equal(b.fallo, null);
  assert.deepEqual(new Set(b.primero.posibles), new Set(['adelanto-signo', 'sin-adelanto']));
  assert.match(veredicto(b), /Puede ser/);
  // Con la hora UT bien escrita, el adelanto queda descartado: el error está en un paso posterior que no escribió.
  const c = corregirPapel({ sol, q, chart, entradas: { 0: ['21:50'], 5: ['2,64'] } });
  assert.equal(c.pasos[0].estado, PAPEL.OK);
  assert.equal(c.primero.n, 6);
  assert.ok(!c.fallo || c.fallo.error !== 'adelanto-signo');
});

test('mareas: dos errores independientes; el primero manda y el segundo se cuenta aparte', () => {
  const q = porId.get(MAREA);
  const { entradas } = hojaConError(q, 'adelanto-signo');
  entradas[5] = ['0,94']; // y además olvida la sonda de la carta (0,94 m es la altura de la marea con su hora)
  const r = corregirPapel({ sol: SOLUCIONES[q.id], q, chart, entradas });
  assert.equal(r.fallo.error, 'adelanto-signo');
  assert.equal(r.otros, 1);
  assert.equal(r.pasos[5].estado, PAPEL.MAL);
  assert.equal(r.pasos[5].error, 'sonda-carta-olvidada');
});

test('hoja entera bien, a medias o con redondeos de papel: ningún desvío', () => {
  let n = 0;
  for (const q of estudio.filter((_, j) => j % 7 === 0)) {
    const sol = SOLUCIONES[q.id];
    if (!papelPosible(sol, q, chart)) continue;
    const entradas = hojaBien(q);
    const r = corregirPapel({ sol, q, chart, entradas });
    assert.equal(r.primero, null, `${q.id}: ${textoPapel(r)}`);
    assert.equal(r.aciertos + r.casi, r.total, q.id);
    // Solo los pasos impares.
    const medias = Object.fromEntries(Object.entries(entradas).filter((_, j) => j % 2 === 0));
    assert.equal(corregirPapel({ sol, q, chart, entradas: medias }).primero, null, `${q.id} a medias`);
    n += 1;
  }
  assert.ok(n > 150, `solo ${n}`);
});

test('formato y teclado: lo que no se entiende se dice, sin corregir; la hora de la madrugada siguiente cuadra', () => {
  const q = porId.get(MAREA);
  const r = corregirPapel({ sol: SOLUCIONES[q.id], q, chart, entradas: { 0: ['las diez'] } });
  assert.equal(r.pasos[0].estado, PAPEL.ILEGIBLE);
  assert.equal(r.primero, null);
  const p = { campos: [{ kind: 'clock', value: 1463 }] }; // 24:23 (00:23 del día siguiente)
  assert.equal(leerEntradas(p, ['00:23'])[0].valor, 1463);
  assert.equal(leerEntradas(p, ['0023'])[0].valor, 1463);
  assert.equal(tecladoDe('bearing'), 'numeric');
  assert.equal(tecladoDe('clock'), 'numeric');
  assert.equal(tecladoDe('meters'), 'decimal');
  assert.equal(tecladoDe('lat'), 'text'); // N/S
  assert.equal(tecladoDe('signed'), 'text'); // E/W o signo menos
});

test('tolerancias: las del paso a paso, el doble en lo medido en la carta', () => {
  assert.equal(margenTexto({ kind: 'bearing' }), '±1°');
  assert.equal(margenTexto({ kind: 'bearing', medido: true }), '±2°');
  assert.equal(margenTexto({ kind: 'clock' }), '±3 min');
  assert.equal(margenTexto({ kind: 'meters' }), '±0,10 m');
  assert.equal(margenTexto({ kind: 'distance', medido: true }), '±0,6 millas');
  assert.equal(margenTexto({ kind: 'lat', medido: true }), "±2'");
  assert.equal(margenTexto({ kind: 'signed' }), '±0,5°');
});

test('barrido sobre las preguntas reales: primer desvío exacto, error con nombre y nada arrastrado marcado como fallo', (t) => {
  const s = { preguntas: new Set(), casos: 0, primero: 0, limpio: 0, nombrado: 0, otro: 0, tipos: {} };
  const fallos = [];
  for (const q of estudio) {
    const sol = SOLUCIONES[q.id];
    for (const v of VARIANTES) {
      const h = hojaConError(q, v);
      if (!h) continue;
      const r = corregirPapel({ sol, q, chart, entradas: h.entradas });
      s.casos += 1; s.preguntas.add(q.id);
      const tipo = sol.ejercicio ?? 'carta';
      s.tipos[tipo] = (s.tipos[tipo] ?? 0) + 1;
      if (r.primero?.i === h.en.i) s.primero += 1; else fallos.push(`${q.id} ${v}: primero ${r.primero?.n} en vez de ${h.en.n}`);
      if (r.pasos.every((p) => p.i <= h.en.i || p.estado !== PAPEL.MAL)) s.limpio += 1;
      if (r.fallo?.error === tipoDe(v)) s.nombrado += 1; else if (r.fallo) s.otro += 1;
    }
  }
  t.diagnostic(`${s.preguntas.size} preguntas, ${s.casos} casos: primer desvío ${s.primero}, sin arrastrados marcados ${s.limpio}, con nombre ${s.nombrado}, con otro nombre ${s.otro}; ${JSON.stringify(s.tipos)}`);
  assert.ok(s.casos > 5000, `solo ${s.casos} casos`);
  assert.ok(s.preguntas.size > 700, `solo ${s.preguntas.size} preguntas`);
  // Mareas, estima, corrección total, corrientes, abatimiento, situación, rumbos…
  for (const t of ['marea-sonda', 'estima-analitica', 'ct-enfilacion', 'corriente-efectiva', 'corriente-rumbo-a-dar', 'corriente-desconocida', 'abatimiento', 'situacion-dos-demoras', 'demoras-no-simultaneas', 'rumbo-distancia', 'estima-directa'])
    assert.ok((s.tipos[t] ?? 0) >= 20, `pocos casos de ${t}: ${s.tipos[t] ?? 0}`);
  assert.equal(s.primero, s.casos, fallos.slice(0, 5).join('\n'));
  // Lo arrastrado no se marca. Solo se escapa algún caso de geometría muy sensible (a pocas décimas de milla de un faro,
  // un redondeo de la hoja mueve mucho la demora): menos de 1 de cada 500.
  assert.ok(s.limpio / s.casos > 0.998, `arrastrados marcados: ${s.casos - s.limpio} de ${s.casos}`);
  assert.ok(s.nombrado / s.casos > 0.9, `con nombre: ${s.nombrado} de ${s.casos}`);
  assert.ok(s.otro / s.casos < 0.001, `con otro nombre: ${s.otro}`);
});

test('cuaderno: origen «papel» y el fallo sigue siendo válido (sincronización)', () => {
  assert.equal(ORIGENES.papel, 'tu hoja en papel');
  const r = anotar(null, { error: 'adelanto-signo', tipo: 'marea-sonda', origen: 'papel', q: MAREA }, Date.UTC(2026, 10, 16, 10));
  assert.equal(r.f.ev[0].o, 'papel');
  assert.ok(falloValido(r.f));
  // La misma pregunta el mismo día (paso a paso y luego en papel) no cuenta dos veces.
  const r2 = anotar(r.f, { error: 'adelanto-signo', tipo: 'marea-sonda', origen: 'paso', q: MAREA }, Date.UTC(2026, 10, 16, 12));
  assert.equal(r2.contado, false);
  assert.ok(ERRORES['adelanto-signo']);
});
