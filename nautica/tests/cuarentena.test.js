// Cuarentena de lo reservado (docs/BANCOS.md, «Cuarentena»): ningún contenido servido ni ninguna fuente del audio cita
// una pregunta reservada para el examen final, salvo la deuda explícita del audio del podcast (tools/cuarentena-deuda.json),
// que no puede crecer y que se va vaciando al regrabar.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inventario, claveRef, leerDeudaCompleta, deudaDe, conAudio, idsEn, limpiarCita, MARCA_RESERVADA } from '../tools/cuarentena.mjs';
import { crearBancos } from '../src/bancos/index.js';

/** Tope de la deuda: el número de entradas cuando se creó (fase 1). Solo puede bajar; si bajas la deuda, bájalo. */
const MAX_DEUDA = 197;

const refs = await inventario();
const { deuda, permitidas } = leerDeudaCompleta();

test('ninguna cita nueva a una pregunta reservada (fuera de la deuda del audio y de los falsos positivos revisados)', () => {
  const conocidas = new Set([...deuda, ...permitidas].map((d) => d.clave));
  const nuevas = refs.filter((r) => r.alcance !== 'metadato' && !conocidas.has(claveRef(r)));
  assert.deepEqual(nuevas.map((r) => `${r.id} en ${r.fichero} (${r.ruta}, ${r.tipo}, por ${r.via})`), [],
    'Cita a una pregunta reservada para el examen final. Cámbiala por una equivalente del estudio (node tools/cuarentena.mjs --arreglar arregla práctica, resueltos y fuentes de las clases).');
});

test('la deuda no crece, es solo audio del podcast y cada entrada sigue existiendo (si la arreglas, quítala)', () => {
  assert.ok(deuda.length <= MAX_DEUDA, `la deuda ha crecido: ${deuda.length} > ${MAX_DEUDA}`);
  const actuales = new Set(refs.map(claveRef));
  const arregladas = [...deuda, ...permitidas].filter((d) => !actuales.has(d.clave)).map((d) => d.clave);
  assert.deepEqual(arregladas, [], 'ya no existen: quítalas de tools/cuarentena-deuda.json (node tools/cuarentena.mjs --deuda)');
  for (const d of deuda) {
    assert.equal(d.estado, 'pendiente regenerar audio', d.clave);
    assert.ok(d.motivo && d.id && d.episodio, d.clave);
    assert.ok(conAudio(d.episodio), `${d.clave}: el episodio ${d.episodio} no tiene audio; se arregla en el texto, no es deuda`);
  }
  // La deuda es exactamente lo del podcast con audio (nada que se pueda arreglar en texto se cuela en ella).
  assert.deepEqual(deudaDe(refs, permitidas).map((d) => d.clave).sort(), deuda.map((d) => d.clave).sort());
  for (const p of permitidas) assert.ok(p.motivo, p.clave);
});

test('ids citados en un texto, también los abreviados tras uno completo', () => {
  assert.deepEqual(idsEn('plantillas and-py-2022-c1-n11, 2024-c1-n11 y and-2025-c1-t05 (b)'), ['and-py-2022-c1-n11', 'and-py-2024-c1-n11', 'and-2025-c1-t05']);
});

test('limpiarCita: la reservada se cambia por su gemela pública (mismas letras) o por la marca; lo demás no se toca', () => {
  const porId = new Map([['and-2025-r1', { opciones: { a: '1', b: '2' } }], ['and-2020-p1', { opciones: { a: '1', b: '2' } }], ['and-2025-r2', { opciones: { a: 'x' } }]]);
  const reservadas = new Set(['and-2025-r1', 'and-2025-r2']);
  const gemela = new Map([['and-2025-r1', 'and-2020-p1']]);
  assert.equal(limpiarCita('Plantilla and-2025-r1 (b), and-2020-x9 (c)', reservadas, gemela, porId), 'Plantilla and-2020-p1 (b), and-2020-x9 (c)');
  assert.equal(limpiarCita('Plantilla and-2025-r2 (a); RIPA', reservadas, gemela, porId), `Plantilla ${MARCA_RESERVADA} (a); RIPA`);
  assert.equal(limpiarCita('Sin citas', reservadas, gemela, porId), 'Sin citas');
});

test('pausas del podcast: una reservada sale por su equivalente del estudio, sin él no sale y, hecho el examen final, sale la del guion', async () => {
  const q = (id, conv, enunciado, concepto = null, opciones = { a: 'chicote', b: 'seno' }) => ({ id, eje: 'x', tit: 'per', conv, ut: 1, enunciado, opciones, correcta: 'a', aceptadas: ['a'], anulada: false, requiere: [], apareceEn: [{ conv }], concepto });
  const preguntas = [
    q('x-1', 'x-2020-01', 'El extremo libre de un cabo se denomina'),
    q('x-2', 'x-2026-01', 'Al extremo libre de un cabo o cable se le llama', 'x-1'),
    q('x-3', 'x-2026-01', 'Qué resguardo hay que dar a una embarcación con la bandera alfa izada', null, { a: 'cincuenta metros', b: 'veinticinco metros' }),
  ];
  const datos = {
    'data/ejes/index.json': { ejes: [{ id: 'x', prefijo: 'x', nombre: 'X', estado: 'publicado' }] },
    'data/ejes/x/eje.json': { id: 'x', nombre: 'X', prefijo: 'x', examen: { per: {} }, reserva: { modo: 'examen', per: ['x-2026-01'] } },
    'data/ejes/x/per/preguntas.json': { meta: { eje: 'x', tit: 'per' }, preguntas },
  };
  const B = crearBancos(async (ruta) => { if (!(ruta in datos)) throw new Error(ruta); return datos[ruta]; });
  assert.equal((await B.equivalente('x-2', 'x')).q.id, 'x-1', 'equivalente por concepto');
  assert.equal(await B.equivalente('x-3', 'x'), null, 'sin equivalente: la pausa se queda sin pregunta');
  const hecho = await B.equivalente('x-3', 'x', { finalHecho: (e, t) => e === 'x' && t === 'per' });
  assert.equal(hecho.q.id, 'x-3');
  assert.equal(hecho.reservada, true);
  assert.deepEqual(await B.reservadaDe('x-3', 'x'), { eje: 'x', tit: 'per' });
  assert.equal(await B.reservadaDe('x-1', 'x'), null);
});
