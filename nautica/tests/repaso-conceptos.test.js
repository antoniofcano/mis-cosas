// Repaso por concepto (docs/CONCEPTOS.md, «Cómo se usa en el método»): el fallo vuelve como OTRA pregunta de la misma
// idea y del mismo banco, el estado de repaso se guarda también por concepto sin tocar el de cada pregunta, el resumen
// de la sesión agrupa por concepto, y sin etiquetas todo es exactamente como antes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { colaRepaso, itemsRepaso, planRepaso, repasoDelDia, siguienteRepasoConcepto, siguienteRepaso, sumaDias } from '../src/course/repaso.js';
import { indexarCatalogo } from '../src/conceptos/catalogo.js';
import { crearIndiceConceptos } from '../src/conceptos/conceptos.js';
import { crearConceptos } from '../src/conceptos/index.js';
import { createProgressStore } from '../src/store/progress.js';
import { componerSesion, resumenSesion, lineaTeCuesta, enFrase, nuevaSesion } from '../src/course/sesion.js';
import { conceptosPorTema, estadoIdea } from '../src/course/listo.js';
import { bancosNode, ejes, leerJSON } from '../tools/bancos/leer.mjs';

const HOY = '2026-10-08';
const hace = (dias, hora = 10) => new Date(Date.parse(`${sumaDias(HOY, -dias)}T${String(hora).padStart(2, '0')}:00:00`)).toISOString();

// ---------------------------------------------------------------------------------------------------------------
// Banco de juguete: la idea A tiene 4 preguntas de estudio y una reservada para el examen final; B, una sola; la
// pregunta s no tiene concepto.

const k = (id, etiqueta, extra = {}) => ({ id, tipo: 'concepto', etiqueta, tit: ['per'], clases: [], temario: 'pendiente', ...extra });
const CATALOGO = indexarCatalogo([{ grupo: 'prueba', conceptos: [k('a', 'Luces de un pesquero de arrastre', { clases: ['per-6-4'] }), k('b', 'Regala y amurada', { clases: ['per-1-1'] }), k('c', 'RIPA: definiciones')] }]);
const q = (id, ut, extra = {}) => ({ id, ut, enunciado: `Enunciado ${id}`, opciones: { a: '1', b: '2' }, correcta: 'a', ...extra });
const TODAS = [q('a1', 6), q('a2', 6), q('a3', 6), q('a4', 6), q('aR', 6), q('aX', 6, { anulada: true, correcta: null }), q('b1', 1), q('s1', 1), q('c1', 6), q('c2', 6)];
const RESERVADAS = new Set(['aR']);
const ESTUDIO = TODAS.filter((x) => !RESERVADAS.has(x.id));
const BANCO = { todas: TODAS, estudio: ESTUDIO, porId: new Map(TODAS.map((x) => [x.id, x])) };
const ETIQUETAS = { a1: ['a'], a2: ['a'], a3: ['a'], a4: ['a'], aR: ['a'], aX: ['a'], b1: ['b'], c1: ['c'], c2: ['c'] };
const IC = crearIndiceConceptos({ catalogo: CATALOGO, etiquetas: ETIQUETAS, banco: BANCO });
const conc = (estado = {}) => ({ principalDe: IC.principalDe, estado });

test('sin conceptos, la cola es la de siempre (una entrada por pregunta)', () => {
  const r = { a1: { ok: false, t: hace(2), rep: { racha: 0, prox: sumaDias(HOY, -1) } }, a2: { ok: false, t: hace(3) }, b1: { ok: true, t: hace(1), rep: null } };
  const c = colaRepaso(ESTUDIO, r, HOY);
  assert.deepEqual(c.hoy.map((x) => x.id), ['a1', 'a2']);
  assert.equal(c.porConcepto, false);
  assert.ok(c.items.every((x) => x.concepto === null));
  assert.deepEqual(colaRepaso(ESTUDIO, r, HOY, null), c, 'conceptos null = sin conceptos');
});

test('con conceptos, las falladas de una idea son una sola entrada; la de origen, la fallada más reciente', () => {
  // a1 y a2: registros antiguos sin rep (de antes de la cola): se leen como pendientes desde hoy.
  const r = { a1: { ok: false, t: hace(4) }, a2: { ok: false, t: hace(2), rep: { racha: 0, prox: sumaDias(HOY, -1) } }, s1: { ok: false } };
  const c = colaRepaso(ESTUDIO, r, HOY, conc());
  assert.equal(c.hoy.length, 2);
  assert.equal(c.porConcepto, true);
  const a = c.items.find((x) => x.concepto === 'a');
  assert.equal(a.q.id, 'a2');
  assert.deepEqual(a.preguntas.map((x) => x.id), ['a1', 'a2']);
  assert.deepEqual(a.rep, { racha: 0, prox: sumaDias(HOY, -1) });
  assert.equal(c.items.find((x) => x.concepto === null).q.id, 's1');
});

test('la variante es otra pregunta de la idea: nunca la fallada, una reservada, anulada ni retirada', () => {
  const r = { a1: { ok: false, t: hace(3), rep: { racha: 0, prox: HOY } }, a2: { ok: true, t: hace(9) } };
  const [x] = planRepaso(colaRepaso(ESTUDIO, r, HOY, conc()).items, r, IC, { hoy: HOY });
  assert.equal(x.variante, true);
  assert.equal(x.q.id, 'a3', 'primero una no vista');
  // Aunque se vean todas las de estudio, la reservada (aR) y la anulada (aX) no salen nunca.
  const todas = { a1: { ok: false, t: hace(3), rep: { racha: 0, prox: HOY } }, a2: { ok: true, t: hace(9) }, a3: { ok: true, t: hace(8) }, a4: { ok: false, t: hace(20), rep: { racha: 2, prox: sumaDias(HOY, 5) } } };
  const [y] = planRepaso(colaRepaso(ESTUDIO, todas, HOY, conc()).items, todas, IC, { hoy: HOY });
  assert.ok(!['a1', 'aR', 'aX'].includes(y.q.id));
  // Una lista de estudio más corta (p. ej. otra reserva) manda: lo que no está en ella no se ofrece.
  const [z] = planRepaso(colaRepaso(ESTUDIO, r, HOY, conc()).items, r, IC, { hoy: HOY, enEstudio: new Set(['a1', 'a2']) });
  assert.equal(z.q.id, 'a2');
});

test('una idea con una sola pregunta (o sin concepto) repite la misma, como siempre', () => {
  const r = { b1: { ok: false, t: hace(1), rep: { racha: 0, prox: HOY } }, s1: { ok: false, t: hace(1), rep: { racha: 0, prox: HOY } } };
  const plan = planRepaso(colaRepaso(ESTUDIO, r, HOY, conc()).items, r, IC, { hoy: HOY });
  assert.deepEqual(plan.map((x) => [x.q.id, x.variante]).sort(), [['b1', false], ['s1', false]]);
  // Dos falladas de la misma idea y ninguna más: se pregunta la otra (es otra redacción).
  const r2 = { c1: { ok: false, t: hace(2), rep: { racha: 0, prox: HOY } }, c2: { ok: false, t: hace(1), rep: { racha: 0, prox: HOY } } };
  const [w] = planRepaso(colaRepaso(ESTUDIO, r2, HOY, conc()).items, r2, IC, { hoy: HOY });
  assert.deepEqual([w.item.q.id, w.q.id, w.variante], ['c2', 'c1', true]);
});

test('el estado de la idea manda sobre el de sus preguntas y sigue 1-3-7; un fallo posterior la devuelve mañana', () => {
  const r = { a1: { ok: false, t: hace(1), rep: { racha: 0, prox: HOY } } };
  const t = (d) => `${d}T20:00:00.000Z`;
  // Acierta la variante hoy: la idea vuelve dentro de 3 días; a1 (que no se ha vuelto a preguntar) sigue en su cola.
  let S = siguienteRepasoConcepto(colaRepaso(ESTUDIO, r, HOY, conc()).items[0].rep, true, HOY, t(HOY));
  assert.deepEqual(S, { racha: 1, prox: sumaDias(HOY, 3), t: t(HOY) });
  assert.equal(colaRepaso(ESTUDIO, r, HOY, conc({ a: S })).hoy.length, 0);
  assert.equal(colaRepaso(ESTUDIO, r, HOY, null).hoy.length, 1, 'sin conceptos, la pregunta sigue como siempre');
  const d3 = sumaDias(HOY, 3);
  S = siguienteRepasoConcepto(colaRepaso(ESTUDIO, r, d3, conc({ a: S })).items[0].rep, true, d3, t(d3));
  assert.deepEqual(S, { racha: 2, prox: sumaDias(d3, 7), t: t(d3) });
  const d10 = sumaDias(d3, 7);
  S = siguienteRepasoConcepto(colaRepaso(ESTUDIO, r, d10, conc({ a: S })).items[0].rep, true, d10, t(d10));
  assert.deepEqual(S, { fuera: true, t: t(d10) });
  assert.equal(colaRepaso(ESTUDIO, r, d10, conc({ a: S })).total, 0, 'idea repasada: fuera de la cola');
  // Falla otra pregunta de la idea después: vuelve mañana (no «hoy» por la fecha vieja de a1).
  const d12 = sumaDias(d10, 2);
  const r2 = { ...r, a4: { ok: false, t: `${d12}T09:00:00.000Z`, rep: siguienteRepaso(undefined, false, d12) } };
  const c = colaRepaso(ESTUDIO, r2, d12, conc({ a: S }));
  assert.equal(c.hoy.length, 0);
  assert.equal(c.total, 1);
  assert.equal(repasoDelDia(ESTUDIO, r2, sumaDias(d12, 1), d12, conc({ a: S })), 1);
  // Fallar la variante en el repaso: mañana otra vez, racha a cero.
  assert.deepEqual(siguienteRepasoConcepto({ racha: 2, prox: HOY }, false, HOY, 'x'), { racha: 0, prox: sumaDias(HOY, 1), t: 'x' });
});

test('dos ideas no reciben la misma variante en una tanda', () => {
  const et = { ...ETIQUETAS, a3: ['a', 'c'], c1: ['c', 'a'] };
  const ic = crearIndiceConceptos({ catalogo: CATALOGO, etiquetas: et, banco: BANCO });
  const r = { a1: { ok: false, t: hace(2), rep: { racha: 0, prox: HOY } }, c2: { ok: false, t: hace(2), rep: { racha: 0, prox: HOY } } };
  const plan = planRepaso(colaRepaso(ESTUDIO, r, HOY, { principalDe: ic.principalDe, estado: {} }).items, r, ic, { hoy: HOY });
  const ids = plan.map((x) => x.q.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(!ids.includes('a1') && !ids.includes('c2'));
});

test('el almacén guarda el estado por concepto sin tocar las respuestas, y un progreso antiguo se lee igual', () => {
  const datos = new Map();
  const mem = { getItem: (x) => datos.get(x) ?? null, setItem: (x, v) => datos.set(x, v), removeItem: (x) => datos.delete(x) };
  // Progreso antiguo (sin repConceptos y con un registro sin rep).
  datos.set('nautica.progress.v1', JSON.stringify({ version: 1, exams: { a1: { ok: false, choice: 'b', t: hace(2) } }, settings: { eje: 'andalucia' } }));
  const p = createProgressStore(mem);
  assert.deepEqual(p.repasoConceptos('andalucia', 'per'), {});
  const antes = JSON.stringify(p.get().exams);
  p.recordRepasoConcepto('andalucia', 'per', 'a', { racha: 1, prox: '2026-10-11', t: 'x' });
  p.recordRepasoConcepto('baleares', 'per', 'a', { fuera: true, t: 'y' });
  assert.equal(JSON.stringify(p.get().exams), antes, 'las respuestas no cambian');
  assert.deepEqual(p.repasoConceptos('andalucia', 'per'), { a: { racha: 1, prox: '2026-10-11', t: 'x' } });
  assert.deepEqual(p.repasoConceptos('andalucia', 'py'), {});
  // Copia de seguridad: sale y vuelve a entrar.
  const q2 = createProgressStore({ getItem: () => null, setItem: () => {}, removeItem: () => {} });
  q2.import(p.export());
  assert.deepEqual(q2.repasoConceptos('baleares', 'per'), { a: { fuera: true, t: 'y' } });
});

test('resumen de la sesión: por concepto con etiquetas (sabido y cuándo vuelve), por tema sin ellas', () => {
  const inicio = Date.parse(`${HOY}T09:00:00Z`);
  const s = { ...nuevaSesion('per', { fase: 'aprender', pasos: [{ id: 'x', tipo: 'fallos', titulo: 'Tus fallos', sub: '', minutos: 5, ruta: ['teoria', 'repaso'] }] }, { ahora: inicio }), fin: null };
  const t = `${HOY}T09:30:00.000Z`;
  const respuestas = { a3: { ok: true, t }, a4: { ok: true, t }, b1: { ok: false, t }, s1: { ok: true, t }, c1: { ok: true, t: hace(5) } };
  const porTema = resumenSesion(s, { respuestas, porId: BANCO.porId, temaDe: (ut) => `Tema ${ut}` });
  assert.deepEqual(porTema.grupos.map((g) => [g.nombre, g.bien, g.total]).sort(), [['Tema 1', 1, 2], ['Tema 6', 2, 2]]);
  assert.ok(porTema.grupos.every((g) => g.concepto === null));
  const porConcepto = resumenSesion(s, { respuestas, porId: BANCO.porId, temaDe: (ut) => `Tema ${ut}`, conceptoDe: IC.principalDe, etiquetaDe: (c) => IC.concepto(c).etiqueta,
    proxDe: (c) => (c === 'a' ? sumaDias(HOY, 3) : c === 'b' ? sumaDias(HOY, 1) : null), hoy: HOY });
  const g = Object.fromEntries(porConcepto.grupos.map((x) => [x.nombre, x]));
  assert.deepEqual([g['Luces de un pesquero de arrastre'].sabido, g['Luces de un pesquero de arrastre'].vuelve, g['Luces de un pesquero de arrastre'].total], [true, 3, 2]);
  assert.deepEqual([g['Regala y amurada'].sabido, g['Regala y amurada'].vuelve], [false, 1]);
  assert.equal(g['Tema 1'].concepto, null, 'la pregunta sin concepto va por su tema');
  assert.equal(porConcepto.grupos[0].nombre, 'Regala y amurada', 'lo que falla, primero');
});

/** Estado mínimo del motor para componer una sesión. */
const st0 = (extra = {}) => ({ principal: { tipo: 'clase', titulo: 'El casco', verbo: 'Empezar', minutos: 10, ruta: ['curso', 'per-1-1'], ut: 1 }, actividades: [], dia: { objetivo: 20 }, flojos: { temas: [], clases: [], conceptos: [] }, ...extra });

test('Hoy: «Tus fallos» nombra las ideas y «Te cuesta» solo aparece con ideas flojas', () => {
  const sin = componerSesion(st0({ repaso: { hoy: 3, manana: 0, total: 3, porConcepto: false, conceptos: [] } }), 'aprender');
  assert.equal(sin.pasos[0].sub, '3 preguntas que fallaste, otra vez');
  const con = componerSesion(st0({ repaso: { hoy: 3, manana: 0, total: 3, porConcepto: true, conceptos: [{ id: 'a', etiqueta: 'Luces de un pesquero de arrastre' }, { id: 'c', etiqueta: 'RIPA: definiciones' }, { id: 'b', etiqueta: 'Regala y amurada' }] } }), 'aprender');
  assert.equal(con.pasos[0].sub, 'luces de un pesquero de arrastre · RIPA: definiciones y 1 más, con otra pregunta');
  assert.equal(lineaTeCuesta(st0()), null);
  assert.equal(lineaTeCuesta({ flojos: {} }), null);
  assert.equal(lineaTeCuesta(st0({ flojos: { conceptos: [{ etiqueta: 'Luz de alcance' }, { etiqueta: 'Rumbo con corriente' }, { etiqueta: 'Valor normal de la presión' }, { etiqueta: 'Otra' }] } })),
    'Te cuesta: luz de alcance · rumbo con corriente · valor normal de la presión y 1 más');
  assert.equal(enFrase('RIPA'), 'RIPA');
});

test('«¿Estás listo?» por concepto: ideas por tema (sabidas, flojas, sin ver), sin tocar la probabilidad', () => {
  const E = { bloques: [{ ut: 1, titulo: 'Nomenclatura', n: 4 }, { ut: 6, titulo: 'RIPA', n: 5, maxErrores: 2 }] };
  const r = { a1: { ok: false, t: hace(1) }, b1: { ok: true, t: hace(1) } };
  const xs = conceptosPorTema(E, IC, r);
  const t6 = xs.find((x) => x.ut === 6);
  assert.deepEqual([t6.total, t6.sabidas, t6.flojas.map((c) => c.id), t6.sinVer.map((c) => c.id)], [2, 0, ['a'], ['c']]);
  const t1 = xs.find((x) => x.ut === 1);
  assert.deepEqual([t1.total, t1.sabidas, t1.flojas.length], [1, 1, 0]);
  assert.equal(estadoIdea(undefined), 'sin-ver');
  assert.equal(conceptosPorTema(E, null, r), null, 'sin etiquetas, nada');
});

// ---------------------------------------------------------------------------------------------------------------
// Bancos reales: con etiquetas (Andalucía, Baleares), ninguna variante es reservada, retirada ni anulada, y todas son del
// mismo banco y del mismo concepto principal; sin etiquetas (DGMM), la cola es la de siempre.

for (const eje of ejes().filter((e) => e.estado === 'publicado').map((e) => e.id)) {
  for (const tit of Object.keys(leerJSON(`data/ejes/${eje}/eje.json`).examen)) {
    test(`${eje} ${tit}: el repaso por concepto no saca nada reservado y sin etiquetas no cambia nada`, async () => {
      const B = bancosNode();
      const banco = await B.cargarBanco(eje, tit);
      const etiquetas = await banco.etiquetasConceptos();
      const ic = await crearConceptos(B).cargarConceptos(eje, tit);
      const fuera = new Set(banco.reservadas);
      for (const x of banco.todas) if (x.norma?.estado === 'retirada' || x.anulada || x.correcta == null) fuera.add(x.id);
      // Un alumno que había fallado TODAS hace 3 días (también las reservadas).
      const respuestas = Object.fromEntries(banco.todas.map((x) => [x.id, { choice: null, ok: false, t: hace(3) }]));
      const sinEtiquetas = !Object.keys(etiquetas).length;
      const entrada = sinEtiquetas ? null : { principalDe: ic.principalDe, estado: {} };
      const cola = colaRepaso(banco.estudio, respuestas, HOY, entrada);
      if (sinEtiquetas) {
        assert.deepEqual(cola, colaRepaso(banco.estudio, respuestas, HOY), 'sin etiquetas, la cola de siempre');
        assert.equal(cola.porConcepto, false);
        return;
      }
      assert.ok(cola.porConcepto && cola.hoy.length < colaRepaso(banco.estudio, respuestas, HOY).hoy.length, 'una entrada por idea');
      // Aún sin fallos en las demás, para que haya variantes no vistas: solo la de origen de cada idea, fallada.
      const soloOrigen = Object.fromEntries(cola.items.map((x) => [x.q.id, respuestas[x.q.id]]));
      for (const resp of [respuestas, soloOrigen]) {
        const items = itemsRepaso(banco.estudio, resp, HOY, entrada);
        const plan = planRepaso(items, resp, ic, { hoy: HOY, enEstudio: new Set(banco.estudio.map((x) => x.id)) });
        const malas = plan.filter((x) => fuera.has(x.q.id) || !banco.porId.has(x.q.id));
        assert.deepEqual(malas.map((x) => x.q.id), []);
        for (const x of plan.filter((y) => y.variante)) {
          assert.notEqual(x.q.id, x.item.q.id);
          assert.ok(ic.conceptosDe(x.q.id).includes(x.item.concepto), `${x.q.id} no es de ${x.item.concepto}`);
        }
        if (resp === soloOrigen) assert.ok(plan.filter((x) => x.variante).length > plan.length / 2, 'la mayoría de las ideas tienen otra pregunta');
      }
    });
  }
}
