// Conceptos (docs/CONCEPTOS.md): el módulo de la app (src/conceptos) y las herramientas (tools/conceptos: validar,
// candidatos, fusionar) sobre un catálogo y un banco de juguete. Los tests del generador de candidatos se saltan con un
// aviso si sus librerías (devDependencies de tools/) no están instaladas: `npm test` no exige `npm install`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { crearBancos } from '../src/bancos/index.js';
import { indexarCatalogo, ID_CONCEPTO } from '../src/conceptos/catalogo.js';
import { crearIndiceConceptos, resumenDominio } from '../src/conceptos/conceptos.js';
import { crearConceptos } from '../src/conceptos/index.js';
import { validar, validarCatalogo } from '../tools/conceptos/validar.mjs';
import { fusionar } from '../tools/conceptos/fusionar.mjs';
import { textoEtiquetas } from '../tools/conceptos/lib.mjs';
import { cargarLibrerias, crearBuscador, lotesDeBanco, contextoBanco, medir, leerOro, FORMATO_CANDIDATOS, FORMATO_ETIQUETAS } from '../tools/conceptos/candidatos.mjs';

// ---------------------------------------------------------------------------------------------------------------
// Datos de juguete

const k = (id, tipo, etiqueta, extra = {}) => ({ id, tipo, etiqueta, sinonimos: [], nota: '', tit: ['per', 'py'], clases: [], temario: 'pendiente', ...extra });
const CATALOGO = {
  grupo: 'prueba',
  version: 1,
  conceptos: [
    k('ripa', 'grupo', 'Reglamento de abordajes'),
    k('ripa.luces', 'grupo', 'Luces y marcas', { padre: 'ripa' }),
    k('ripa.luces.arrastre', 'concepto', 'Luces de un pesquero de arrastre', { padre: 'ripa.luces', sinonimos: ['arrastrero', 'verde sobre blanco'], nota: 'Luces del buque que pesca al arrastre.', clases: ['per-6-4'], relacionados: ['ripa.luces.remolque'] }),
    k('ripa.luces.remolque', 'concepto', 'Luces de un remolcador', { padre: 'ripa.luces', sinonimos: ['remolque', 'remolcando'], nota: 'Luces de tope en línea vertical del buque que remolca.', clases: ['per-6-4'] }),
    k('casco', 'grupo', 'Nomenclatura del casco'),
    k('casco.regala', 'concepto', 'Regala y amurada', { padre: 'casco', sinonimos: ['regala', 'amurada', 'borda'], nota: 'Remate superior del costado.', clases: ['per-1-1'] }),
    k('casco.barlovento', 'concepto', 'Barlovento y sotavento', { padre: 'casco', sinonimos: ['barlovento', 'sotavento'], nota: 'Banda por la que viene el viento.', clases: ['per-1-1'] }),
    k('mareas.corrientes', 'concepto', 'Corrientes de marea', { tit: ['py'], sinonimos: ['corriente de marea'], clases: ['py-1-1'] }),
  ],
};
const CURSO = {
  per: { meta: {}, modulos: [{ id: 'm1', lecciones: [{ id: 'per-1-1', titulo: 'El casco' }] }, { id: 'm6', lecciones: [{ id: 'per-6-4', titulo: 'Luces' }] }] },
  py: { meta: {}, modulos: [{ id: 'm1', lecciones: [{ id: 'py-1-1', titulo: 'Mareas' }] }] },
};
const pq = (id, conv, ut, enunciado, opciones, correcta, extra = {}) => ({
  id, eje: 'juguete', tit: 'per', conv, convocatoria: conv, fecha: `${conv.slice(-7)}-01`, numero: 1, orden: Number(id.slice(-2)), modulo: null, ut,
  ut_titulo: null, bloque: null, enunciado, opciones, correcta, aceptadas: correcta ? [correcta] : [], anulada: !correcta, requiere: [], figuras: [],
  contexto: null, tabla_mareas: null, apareceEn: [{ conv, modelo: null, numero: 1 }], fuentes: {}, norma: { estado: 'vigente' }, concepto: null, notas: '', ...extra,
});
const C1 = 'jug-per-2024-01';
const C2 = 'jug-per-2025-01'; // reservada para el examen final
const PREGUNTAS = [
  pq(`${C1}-01`, C1, 6, '¿Qué luces exhibe un buque dedicado a la pesca de arrastre?', { a: 'Verde sobre blanco', b: 'Rojo sobre blanco', c: 'Tres blancas', d: 'Ninguna' }, 'a'),
  pq(`${C1}-02`, C1, 6, 'Un arrastrero de noche, ¿qué luces muestra en el tope?', { a: 'Roja', b: 'Verde sobre blanco', c: 'Blanca', d: 'Azul' }, 'b'),
  pq(`${C1}-03`, C1, 6, 'Pregunta anulada sobre el arrastre', { a: 'x', b: 'y', c: 'z', d: 'w' }, null),
  pq(`${C1}-04`, C1, 6, 'Pregunta retirada sobre el arrastre', { a: 'x', b: 'y', c: 'z', d: 'w' }, 'a', { norma: { estado: 'retirada', nota: 'cambió la norma' } }),
  pq(`${C1}-05`, C1, 1, '¿Cómo se llama el remate superior de la amurada?', { a: 'Regala', b: 'Quilla', c: 'Roda', d: 'Codaste' }, 'a'),
  pq(`${C1}-06`, C1, 1, '¿Qué es barlovento?', { a: 'La banda por donde viene el viento', b: 'La popa', c: 'La proa', d: 'La quilla' }, 'a'),
  pq(`${C1}-07`, C1, 6, 'Un buque remolcando con longitud de remolque de 250 m exhibe…', { a: 'Tres luces de tope en línea vertical', b: 'Dos', c: 'Una', d: 'Ninguna' }, 'a'),
  pq(`${C1}-08`, C1, 6, 'Un remolcador que remolca a un arrastrero…', { a: 'Luces de remolque', b: 'Luces de arrastre', c: 'Nada', d: 'Ambas' }, 'a'),
  pq(`${C1}-09`, C1, 6, '¿Qué luces exhibe un buque dedicado a la pesca de arrastre?', { a: 'Rojo sobre blanco', b: 'Verde sobre blanco', c: 'Tres blancas', d: 'Ninguna' }, 'b'),
  pq(`${C1}-10`, C1, 6, 'El pesquero de arrastre sin arrancada, ¿apaga las luces de costado?', { a: 'Sí', b: 'No', c: 'Solo de día', d: 'Depende' }, 'a'),
  pq(`${C2}-01`, C2, 6, 'Luces del pesquero de arrastre (examen final)', { a: 'Verde sobre blanco', b: 'b', c: 'c', d: 'd' }, 'a'),
  pq(`${C2}-02`, C2, 1, 'Barlovento (examen final)', { a: 'a', b: 'b', c: 'c', d: 'd' }, 'a'),
];
const ETIQUETAS = {
  [`${C1}-01`]: ['ripa.luces.arrastre'],
  [`${C1}-02`]: ['ripa.luces.arrastre'],
  [`${C1}-03`]: ['ripa.luces.arrastre'],
  [`${C1}-04`]: ['ripa.luces.arrastre'],
  [`${C1}-05`]: ['casco.regala'],
  [`${C1}-06`]: ['casco.barlovento'],
  [`${C1}-07`]: ['ripa.luces.remolque'],
  [`${C1}-08`]: ['ripa.luces.remolque', 'ripa.luces.arrastre'],
  [`${C1}-09`]: ['ripa.luces.arrastre'],
  [`${C1}-10`]: ['ripa.luces.arrastre'],
  [`${C2}-01`]: ['ripa.luces.arrastre'],
  [`${C2}-02`]: ['casco.barlovento'],
};

/** Ficheros de una app de juguete (rutas relativas a su raíz). */
function ficheros({ catalogo = true, etiquetas = true } = {}) {
  const f = {
    'data/ejes/index.json': { ejes: [{ id: 'juguete', prefijo: 'jug', nombre: 'Juguete', estado: 'publicado' }] },
    'data/ejes/juguete/eje.json': { id: 'juguete', nombre: 'Juguete', prefijo: 'jug', examen: { per: {} }, reserva: { modo: 'examen', per: [C2] } },
    'data/ejes/juguete/per/preguntas.json': { meta: { eje: 'juguete', tit: 'per' }, preguntas: PREGUNTAS },
    'data/ejes/juguete/per/practica.json': { 'per-6-4': [`${C1}-01`, `${C1}-02`, `${C1}-07`], 'per-1-1': [`${C1}-05`, `${C1}-06`] },
    'data/ejes/juguete/per/explicaciones.json': { [`${C1}-02`]: { explicacion: 'El pesquero de arrastre muestra verde sobre blanco.', clave: 'Arrastre: verde sobre blanco.' } },
    'data/curso/per.json': CURSO.per,
    'data/curso/py.json': CURSO.py,
  };
  if (catalogo) { f['data/conceptos/index.json'] = { grupos: ['prueba', 'otro-por-hacer'] }; f['data/conceptos/prueba.json'] = CATALOGO; }
  if (etiquetas) f['data/ejes/juguete/per/conceptos.json'] = ETIQUETAS;
  return f;
}
const clon = (x) => JSON.parse(JSON.stringify(x));

/** Escribe la app de juguete en una carpeta temporal y devuelve su raíz. */
function enDisco(f) {
  const raiz = mkdtempSync(join(tmpdir(), 'conceptos-'));
  for (const [ruta, datos] of Object.entries(f)) {
    mkdirSync(dirname(join(raiz, ruta)), { recursive: true });
    writeFileSync(join(raiz, ruta), typeof datos === 'string' ? datos : JSON.stringify(datos, null, 1));
  }
  return raiz;
}
const conRaiz = (f, fn) => { const raiz = enDisco(f); try { return fn(raiz); } finally { rmSync(raiz, { recursive: true, force: true }); } };

/** Banco de juguete con el motor de bancos de la app (lee de memoria) y su índice de conceptos. */
async function indiceDeJuguete(f = ficheros()) {
  const leidos = [];
  const leer = async (ruta) => { leidos.push(ruta); if (!(ruta in f)) throw new Error(`no existe ${ruta}`); return clon(f[ruta]); };
  const motor = crearBancos(leer);
  return { motor, leidos, conceptos: crearConceptos(motor) };
}

// ---------------------------------------------------------------------------------------------------------------
// Módulo de la app

test('catálogo: índice, descendientes, ancestros y formato de id', () => {
  const cat = indexarCatalogo([CATALOGO, null]);
  assert.equal(cat.conceptos.length, 8);
  assert.equal(cat.concepto('casco.regala').grupo, 'prueba');
  assert.deepEqual(cat.descendientes('ripa').sort(), ['ripa', 'ripa.luces', 'ripa.luces.arrastre', 'ripa.luces.remolque']);
  assert.deepEqual(cat.ancestros('ripa.luces.arrastre'), ['ripa.luces', 'ripa']);
  for (const bueno of ['ripa.luces.arrastre', 'a1.b-c.d_e']) assert.match(bueno, ID_CONCEPTO);
  for (const malo of ['Ripa.luces', 'ripa..luces', 'ripa.luces.', 'ripa luces', 'ñu', '.ripa']) assert.doesNotMatch(malo, ID_CONCEPTO);
});

test('cargarConceptos: carga perezosa del catálogo y de las etiquetas del banco activo', async () => {
  const { conceptos, leidos } = await indiceDeJuguete();
  assert.ok(!leidos.some((r) => r.startsWith('data/conceptos/') || r.endsWith('conceptos.json')), 'nada de conceptos antes de pedirlo');
  const c = await conceptos.cargarConceptos('juguete', 'per');
  assert.ok(leidos.includes('data/conceptos/index.json') && leidos.includes('data/ejes/juguete/per/conceptos.json'));
  assert.equal(await conceptos.cargarConceptos('juguete', 'per'), c, 'se indexa una sola vez por banco');
  assert.deepEqual(c.conceptosDe(`${C1}-08`), ['ripa.luces.remolque', 'ripa.luces.arrastre']);
  assert.equal(c.principalDe(`${C1}-08`), 'ripa.luces.remolque');
  assert.deepEqual(c.conceptosDe('no-existe'), []);
  assert.equal(c.concepto('casco.regala').etiqueta, 'Regala y amurada');
  // Sin catálogo ni etiquetas (aún no hechos): todo vacío, sin errores.
  const vacio = await (await indiceDeJuguete(ficheros({ catalogo: false, etiquetas: false }))).conceptos.cargarConceptos('juguete', 'per');
  assert.deepEqual(vacio.conceptosDe(`${C1}-01`), []);
  assert.deepEqual(vacio.conceptosFlojos({ [`${C1}-01`]: { ok: false, t: '2026-01-01' } }), []);
  assert.equal(vacio.variante(`${C1}-01`, {}), null);
});

test('preguntasDe: solo estudio (sin reservadas para el examen final, anuladas ni retiradas); grupos con sus descendientes', async () => {
  const c = await (await indiceDeJuguete()).conceptos.cargarConceptos('juguete', 'per');
  const ids = (qs) => qs.map((q) => q.id.replace('jug-per-', ''));
  assert.deepEqual(ids(c.preguntasDe('ripa.luces.arrastre')), ['2024-01-01', '2024-01-02', '2024-01-08', '2024-01-09', '2024-01-10']);
  assert.deepEqual(ids(c.preguntasDe('ripa.luces.arrastre', { soloPrincipal: true })), ['2024-01-01', '2024-01-02', '2024-01-09', '2024-01-10']);
  assert.deepEqual(ids(c.preguntasDe('ripa.luces.arrastre', { soloEstudio: false })), ['2024-01-01', '2024-01-02', '2024-01-08', '2024-01-09', '2024-01-10', '2025-01-01']);
  assert.deepEqual(ids(c.preguntasDe('ripa.luces')), ['2024-01-01', '2024-01-02', '2024-01-07', '2024-01-08', '2024-01-09', '2024-01-10']);
  assert.deepEqual(ids(c.preguntasDe('casco.barlovento')), ['2024-01-06']);
  assert.deepEqual(c.preguntasDe('no.existe'), []);
});

test('dominio por concepto, con aciertos, fallos y último intento; conceptos flojos', async () => {
  const c = await (await indiceDeJuguete()).conceptos.cargarConceptos('juguete', 'per');
  const resp = {
    [`${C1}-01`]: { ok: true, t: '2026-09-01T10:00:00Z' },
    [`${C1}-02`]: { ok: false, t: '2026-09-05T10:00:00Z' },
    [`${C1}-03`]: { ok: true, t: '2026-09-06T10:00:00Z' }, // anulada: no cuenta
    [`${C1}-05`]: { ok: true, t: '2026-09-02T10:00:00Z' },
    [`${C1}-06`]: { ok: true, t: '2026-09-02T10:00:00Z' },
    [`${C2}-02`]: { ok: true, t: '2026-09-03T10:00:00Z' }, // del examen final: cuenta para el dominio
  };
  const d = c.dominio(resp);
  assert.deepEqual({ ...d['ripa.luces.arrastre'], tasa: undefined }, {
    id: 'ripa.luces.arrastre', tipo: 'concepto', etiqueta: 'Luces de un pesquero de arrastre', preguntas: 5, vistas: 2, aciertos: 1, fallos: 1, tasa: undefined,
    ultimo: { id: `${C1}-02`, t: '2026-09-05T10:00:00Z', ok: false }, estado: 'flojo',
  });
  assert.equal(d['casco.barlovento'].vistas, 2);
  assert.equal(d['casco.barlovento'].preguntas, 1);
  assert.equal(d['ripa.luces.remolque'].estado, 'sin-datos');
  assert.equal(d.ripa.tipo, 'grupo');
  assert.equal(d.ripa.vistas, 2); // los grupos suman lo de sus conceptos
  assert.equal(d.casco.vistas, 3);
  assert.deepEqual(c.conceptosFlojos(resp).map((x) => x.id), ['ripa.luces.arrastre']);
  assert.equal(resumenDominio([], {}).estado, 'sin-datos');
  const muchos = Object.fromEntries(['a', 'b', 'c', 'd'].map((x) => [x, { ok: true, t: `2026-01-0${'abcd'.indexOf(x) + 1}` }]));
  assert.equal(resumenDominio(['a', 'b', 'c', 'd'].map((id) => ({ id })), muchos).estado, 'dominado');
});

test('conceptosFlojos: primero la peor tasa y, a igual tasa, el fallo más reciente', () => {
  const banco = { todas: PREGUNTAS, estudio: PREGUNTAS.filter((q) => !q.id.startsWith(C2)), porId: new Map(PREGUNTAS.map((q) => [q.id, q])) };
  const c = crearIndiceConceptos({ catalogo: indexarCatalogo([CATALOGO]), etiquetas: ETIQUETAS, banco });
  const resp = {
    [`${C1}-05`]: { ok: false, t: '2026-09-01' },
    [`${C1}-06`]: { ok: false, t: '2026-09-03' },
    [`${C1}-07`]: { ok: false, t: '2026-09-02' },
    [`${C1}-08`]: { ok: false, t: '2026-09-02' },
  };
  // remolque: 2 fallos (tasa 0,25); regala y barlovento: 1 fallo (0,333), barlovento más reciente; arrastre: 1 fallo (por la 08)
  assert.deepEqual(c.conceptosFlojos(resp).map((x) => x.id), ['ripa.luces.remolque', 'casco.barlovento', 'ripa.luces.arrastre', 'casco.regala']);
  assert.equal(c.conceptosFlojos(resp, { limite: 2 }).length, 2);
});

test('variante: otra pregunta del mismo concepto principal y del mismo banco, nunca reservada, anulada ni retirada', async () => {
  const c = await (await indiceDeJuguete()).conceptos.cargarConceptos('juguete', 'per');
  const v = (id, resp = {}, o) => c.variante(id, resp, o)?.id.replace('jug-per-', '') ?? null;
  // Sin respuestas: la primera no vista con ese concepto como principal (la 09 es casi igual a la 01: la última opción).
  assert.equal(v(`${C1}-01`), '2024-01-02');
  // No vistas antes que respondidas.
  assert.equal(v(`${C1}-01`, { [`${C1}-02`]: { ok: true, t: '2026-01-01' } }), '2024-01-10');
  // Respondidas: falladas antes que acertadas; y entre falladas, la más antigua.
  const vistas = { [`${C1}-02`]: { ok: true, t: '2026-01-01' }, [`${C1}-10`]: { ok: false, t: '2026-05-01' } };
  assert.equal(v(`${C1}-01`, vistas), '2024-01-10');
  assert.equal(v(`${C1}-01`, { ...vistas, [`${C1}-02`]: { ok: false, t: '2026-02-01' } }), '2024-01-02');
  // Las respondidas hoy van al final.
  assert.equal(v(`${C1}-01`, { [`${C1}-02`]: { ok: false, t: '2026-10-07T09:00:00Z' }, [`${C1}-10`]: { ok: true, t: '2026-03-01' } }, { hoy: '2026-10-07' }), '2024-01-10');
  // Todas vistas y acertadas: la más antigua de concepto principal (antes que la casi igual o una con él de secundario).
  const todasVistas = { [`${C1}-02`]: { ok: true, t: '2026-01-01' }, [`${C1}-10`]: { ok: true, t: '2026-01-02' } };
  assert.equal(v(`${C1}-01`, todasVistas), '2024-01-02');
  // Nunca la reservada (2025-01-01, arrastre, no vista), ni la anulada (03) ni la retirada (04).
  for (let i = 0; i < 20; i++) {
    const r = c.variante(`${C1}-01`, {}, { rng: () => i / 20 });
    assert.ok(![`${C2}-01`, `${C1}-03`, `${C1}-04`, `${C1}-01`].includes(r.id), r.id);
    assert.equal(c.principalDe(r.id), 'ripa.luces.arrastre');
  }
  // Concepto con una sola pregunta de estudio, o pregunta sin concepto: null.
  assert.equal(c.variante(`${C1}-06`, {}), null);
  assert.equal(c.variante('jug-per-2024-01-99', {}), null);
  assert.equal(v(`${C1}-07`), '2024-01-08');
  // Con el concepto como secundario, solo si no hay otra con él como principal; la casi igual, solo si no hay otra.
  const banco = { todas: PREGUNTAS, estudio: PREGUNTAS.filter((q) => !q.id.startsWith(C2)), porId: new Map(PREGUNTAS.map((q) => [q.id, q])) };
  const solo = (et) => crearIndiceConceptos({ catalogo: indexarCatalogo([CATALOGO]), etiquetas: et, banco });
  assert.equal(solo({ [`${C1}-01`]: ['ripa.luces.arrastre'], [`${C1}-08`]: ['ripa.luces.remolque', 'ripa.luces.arrastre'], [`${C1}-09`]: ['ripa.luces.arrastre'] }).variante(`${C1}-01`, {}).id, `${C1}-08`);
  assert.equal(solo({ [`${C1}-01`]: ['ripa.luces.arrastre'], [`${C1}-09`]: ['ripa.luces.arrastre'] }).variante(`${C1}-01`, {}).id, `${C1}-09`);
});

test('el banco: etiquetasConceptos se lee solo al pedirla, y vacía si el eje aún no tiene conceptos.json', async () => {
  const f = ficheros({ etiquetas: false });
  const leidos = [];
  const motor = crearBancos(async (r) => { leidos.push(r); if (!(r in f)) throw new Error(r); return clon(f[r]); });
  const banco = await motor.cargarBanco('juguete', 'per');
  assert.ok(!leidos.some((r) => r.endsWith('conceptos.json')));
  assert.deepEqual(await banco.etiquetasConceptos(), {});
  assert.equal((await motor.cargarCatalogoConceptos()).length, 1, 'un grupo del índice que aún no existe se salta');
});

// ---------------------------------------------------------------------------------------------------------------
// Herramientas: validar

test('validar: funciona sin catálogo y sin etiquetas (todo al 0 %)', () => {
  conRaiz(ficheros({ catalogo: false, etiquetas: false }), (raiz) => {
    const r = validar({ raiz });
    assert.equal(r.ok, true, r.errores.join('\n'));
    assert.deepEqual(r.bancos.map((b) => [b.eje, b.tit, b.existe, b.cobertura.etiquetadas, b.cobertura.total]), [['juguete', 'per', false, 0, 11]]);
  });
});

test('validar: el catálogo y las etiquetas de juguete son válidos; cobertura por tema', () => {
  conRaiz(ficheros(), (raiz) => {
    const r = validar({ raiz });
    assert.equal(r.ok, true, r.errores.join('\n'));
    assert.ok(r.avisos.some((a) => /otro-por-hacer\.json: aún no existe/.test(a)));
    assert.ok(r.avisos.some((a) => /03: la pregunta está anulada/.test(a)));
    assert.deepEqual(r.catalogo, { conceptos: 5, grupos: 3, ficheros: 1, pendientes: 8 });
    const c = r.bancos[0].cobertura;
    assert.deepEqual([c.etiquetadas, c.total], [11, 11]);
    assert.deepEqual(c.porUt, { 1: { total: 3, etiquetadas: 3 }, 6: { total: 8, etiquetadas: 8 } });
  });
});

test('validar: detecta los errores del catálogo y de las etiquetas', () => {
  const f = ficheros();
  const cat = clon(CATALOGO);
  cat.conceptos.push(
    k('Mal.Id', 'concepto', 'Id no válido'),
    k('casco.regala', 'concepto', 'Repetido'),
    k('hijo.de.concepto', 'concepto', 'Padre que no es grupo', { padre: 'casco.regala' }),
    k('ciclo.a', 'grupo', 'A', { padre: 'ciclo.b' }),
    k('ciclo.b', 'grupo', 'B', { padre: 'ciclo.a' }),
    k('rel.roto', 'concepto', 'Relacionado roto', { relacionados: ['no.existe'] }),
    k('clase.rota', 'concepto', 'Clase rota', { clases: ['per-99-1'] }),
    k('tit.mala', 'concepto', 'Tit mala', { tit: ['capitan'] }),
    k('padre.roto', 'concepto', 'Padre roto', { padre: 'no.existe' }),
    { id: 'sin.temario', tipo: 'concepto', etiqueta: 'Sin temario', tit: ['per'], clases: [] },
    k('tipo.malo', 'cosa', 'Tipo malo'),
  );
  f['data/conceptos/prueba.json'] = cat;
  f['data/conceptos/suelto.json'] = { grupo: 'suelto', version: 1, conceptos: [] };
  f['data/ejes/juguete/per/conceptos.json'] = {
    ...ETIQUETAS,
    'jug-per-no-existe': ['casco.regala'],
    [`${C1}-05`]: ['casco'],
    [`${C1}-06`]: ['casco.barlovento', 'casco.regala', 'ripa.luces.arrastre'],
    [`${C1}-07`]: ['mareas.corrientes'],
    [`${C1}-01`]: ['no.existe'],
    [`${C1}-02`]: [],
  };
  conRaiz(f, (raiz) => {
    const r = validar({ raiz });
    assert.equal(r.ok, false);
    const hay = (re) => assert.ok(r.errores.some((e) => re.test(e)), `falta el error ${re}\n${r.errores.join('\n')}`);
    hay(/suelto\.json: no está en data\/conceptos\/index\.json/);
    hay(/id no válido.*Mal\.Id/);
    hay(/casco\.regala: id repetido/);
    hay(/hijo\.de\.concepto: el padre casco\.regala no es de tipo «grupo»/);
    hay(/ciclo de padres: ciclo\.(a|b) → ciclo\.(a|b) → ciclo\.(a|b)/);
    hay(/rel\.roto: el relacionado no\.existe no existe/);
    hay(/clase\.rota: la clase per-99-1 no existe/);
    hay(/tit\.mala: «tit» debe ser/);
    hay(/padre\.roto: el padre no\.existe no existe/);
    hay(/sin\.temario: falta «temario»/);
    hay(/tipo\.malo: «tipo» debe ser/);
    hay(/jug-per-no-existe: la pregunta no existe en el banco juguete\/per/);
    hay(/-05: casco es un grupo/);
    hay(/-06: debe llevar una lista de 1 a 2 conceptos/);
    hay(/-07: mareas\.corrientes no es de per/);
    hay(/-01: el concepto "no\.existe" no existe en el catálogo/);
    hay(/-02: debe llevar una lista de 1 a 2/);
    assert.equal(r.errores.filter((e) => /ciclo de padres/.test(e)).length, 1);
    // Las mal etiquetadas no cuentan para la cobertura.
    assert.equal(r.bancos[0].cobertura.etiquetadas, 11 - 5);
  });
  assert.equal(validarCatalogo(join(tmpdir(), 'no-existe-conceptos')).errores.length, 0);
});

// ---------------------------------------------------------------------------------------------------------------
// Herramientas: fusionar

const lote = (etiquetas, extra = {}) => ({ formato: FORMATO_ETIQUETAS, eje: 'juguete', tit: 'per', autor: 'test', etiquetas, ...extra });

test('fusionar: añade, no pisa sin --forzar, rechaza lo no válido y lista lo que falta en el catálogo', () => {
  const base = clon(ETIQUETAS);
  delete base[`${C1}-05`];
  delete base[`${C1}-07`];
  delete base[`${C1}-10`];
  const f = ficheros();
  f['data/ejes/juguete/per/conceptos.json'] = base;
  conRaiz(f, (raiz) => {
    const ruta = join(raiz, 'data/ejes/juguete/per/conceptos.json');
    const lotes = [
      { fichero: join(raiz, 'a.json'), datos: lote({
        [`${C1}-05`]: { conceptos: ['casco.regala'], motivo: 'pregunta por la regala' },
        [`${C1}-06`]: { conceptos: ['casco.regala'], motivo: 'distinta de la ya fusionada' },
        [`${C1}-01`]: { conceptos: ['ripa.luces.arrastre'], motivo: 'igual' },
        [`${C1}-07`]: { conceptos: ['casco'], motivo: 'un grupo' },
        [`${C1}-10`]: { conceptos: [], falta: 'ripa.luces.sin-arrancada', motivo: 'luces sin arrancada' },
      }) },
      // Sin eje ni tit: se deducen del id.
      { fichero: join(raiz, 'b.json'), datos: { formato: FORMATO_ETIQUETAS, etiquetas: { [`${C1}-07`]: { conceptos: ['ripa.luces.remolque'] }, 'xx-1': { conceptos: ['casco.regala'] } } } },
      { fichero: join(raiz, 'c.json'), datos: { formato: 'otro' } },
    ];
    const sim = fusionar({ raiz, lotes, simular: true });
    assert.equal(sim.nuevas, 2);
    assert.deepEqual(JSON.parse(readFileSync(ruta, 'utf8')), base, 'simular no escribe');
    const r = fusionar({ raiz, lotes });
    assert.equal(r.nuevas, 2);
    assert.equal(r.iguales, 1);
    assert.equal(r.sinMotivo, 1);
    assert.deepEqual(r.conservadas.map((x) => x.id), [`${C1}-06`]);
    assert.deepEqual(r.rechazadas.map((x) => x.id).sort(), ['*', `${C1}-07`, 'xx-1']);
    assert.deepEqual(r.faltan.map((x) => [x.id, x.falta]), [[`${C1}-10`, 'ripa.luces.sin-arrancada']]);
    const escrito = JSON.parse(readFileSync(ruta, 'utf8'));
    assert.deepEqual(escrito[`${C1}-05`], ['casco.regala']);
    assert.deepEqual(escrito[`${C1}-07`], ['ripa.luces.remolque']);
    assert.deepEqual(escrito[`${C1}-06`], ['casco.barlovento']);
    assert.ok(!(`${C1}-10` in escrito));
    // Una pregunta por línea, en el orden del banco.
    const lineas = readFileSync(ruta, 'utf8').trim().split('\n');
    assert.equal(lineas.length, Object.keys(escrito).length + 2);
    assert.match(lineas[1], /^"jug-per-2024-01-01": \["ripa\.luces\.arrastre"\],$/);
    assert.equal(validar({ raiz }).ok, true);
    // Con --forzar, sí cambia la ya fusionada.
    const r2 = fusionar({ raiz, lotes: lotes.slice(0, 1), forzar: true });
    assert.equal(r2.cambiadas, 1);
    assert.deepEqual(JSON.parse(readFileSync(ruta, 'utf8'))[`${C1}-06`], ['casco.regala']);
  });
});

test('fusionar: dos lotes que no coinciden en una pregunta no la escriben; crea conceptos.json si no existe', () => {
  conRaiz(ficheros({ etiquetas: false }), (raiz) => {
    const r = fusionar({ raiz, lotes: [
      { fichero: join(raiz, 'a.json'), datos: lote({ [`${C1}-05`]: { conceptos: ['casco.regala'], motivo: 'x' }, [`${C1}-06`]: { conceptos: ['casco.barlovento'], motivo: 'x' } }) },
      { fichero: join(raiz, 'b.json'), datos: lote({ [`${C1}-05`]: { conceptos: ['casco.barlovento'], motivo: 'y' } }) },
    ] });
    assert.deepEqual(r.conflictos.map((c) => c.id), [`${C1}-05`]);
    const ruta = join(raiz, 'data/ejes/juguete/per/conceptos.json');
    assert.ok(existsSync(ruta));
    assert.deepEqual(JSON.parse(readFileSync(ruta, 'utf8')), { [`${C1}-06`]: ['casco.barlovento'] });
  });
  assert.equal(textoEtiquetas({}), '{}\n');
  assert.equal(textoEtiquetas({ b: ['x'], a: ['y'] }, ['b', 'a']), '{\n"b": ["x"],\n"a": ["y"]\n}\n');
});

// ---------------------------------------------------------------------------------------------------------------
// Herramientas: candidatos (necesitan minisearch y snowball-stemmers, devDependencies de tools/)

const libs = await cargarLibrerias();
const sinLibs = libs ? false : 'faltan minisearch/snowball-stemmers (npm install en nautica/): se salta el generador de candidatos';
if (!libs) console.warn(`AVISO: ${sinLibs}`);

test('candidatos: propone el concepto correcto arriba, filtra por titulación y refuerza la clase', { skip: sinLibs }, () => {
  const catalogo = indexarCatalogo([CATALOGO]);
  const b = crearBuscador({ catalogo, ...libs });
  const q = (id) => PREGUNTAS.find((x) => x.id === `${C1}-${id}`);
  assert.equal(b.proponer(q('01'), { clases: ['per-6-4'] })[0].id, 'ripa.luces.arrastre');
  assert.equal(b.proponer(q('05'))[0].id, 'casco.regala');
  assert.equal(b.proponer(q('06'))[0].id, 'casco.barlovento');
  assert.equal(b.proponer(q('07'))[0].id, 'ripa.luces.remolque');
  const todos = b.proponer(q('01'), { k: 20 });
  assert.ok(!todos.some((c) => c.id === 'mareas.corrientes'), 'un concepto solo de py no se propone para el per');
  assert.ok(!todos.some((c) => catalogo.concepto(c.id).tipo === 'grupo'), 'los grupos no se proponen');
  // Sin texto en común, la clase basta para proponerlo (y lo marca).
  const sinTexto = { ...q('01'), enunciado: 'xyz', opciones: { a: 'qqq' } };
  assert.deepEqual(b.proponer(sinTexto, { clases: ['per-1-1'] }).map((c) => [c.id, c.clase]), [['casco.barlovento', true], ['casco.regala', true]]);
  // Acentos y plurales: «Arrastreros» encuentra «arrastrero».
  assert.equal(b.proponer({ tit: 'per', enunciado: 'Los ARRASTREROS de noche', opciones: {} })[0].id, 'ripa.luces.arrastre');
  assert.ok(b.proponer(q('01'), { k: 2 }).length <= 2);
});

test('candidatos: lotes en su formato (solo las preguntas sin etiquetar, sin anuladas) y recall@k contra un oro', { skip: sinLibs }, () => {
  conRaiz(ficheros(), (raiz) => {
    const catalogo = indexarCatalogo([CATALOGO]);
    const b = crearBuscador({ catalogo, ...libs });
    const ctx = contextoBanco(raiz, 'juguete', 'per');
    ctx.etiquetas = { [`${C1}-01`]: ['ripa.luces.arrastre'] };
    const lotes = lotesDeBanco(b, catalogo, ctx, { k: 3, tam: 4, fecha: '2026-10-07' });
    assert.equal(lotes.length, 3); // 12 − 1 anulada − 1 etiquetada = 10 → lotes de 4, 4 y 2
    assert.deepEqual(lotes.map((l) => [l.lote, l.de, l.preguntas.length]), [[1, 3, 4], [2, 3, 4], [3, 3, 2]]);
    const l = lotes[0];
    assert.equal(l.formato, FORMATO_CANDIDATOS);
    assert.equal(l.preguntas[0].id, `${C1}-02`);
    assert.deepEqual(l.preguntas[0].clases, ['per-6-4']);
    assert.equal(l.preguntas[0].clave, 'Arrastre: verde sobre blanco.');
    assert.ok(l.preguntas.every((q) => q.candidatos.length <= 3 && q.candidatos.every((c) => l.conceptos[c.id])));
    assert.ok(!l.preguntas.some((q) => q.id.endsWith('-03')));
    // --todas incluye las ya etiquetadas, con sus etiquetas actuales.
    const todas = lotesDeBanco(b, catalogo, ctx, { k: 3, tam: 100, todas: true }).flatMap((x) => x.preguntas);
    assert.deepEqual(todas.find((q) => q.id === `${C1}-01`).actuales, ['ripa.luces.arrastre']);
    // recall@k contra el oro (las etiquetas de juguete)
    const oro = leerOro(ETIQUETAS);
    assert.deepEqual(leerOro(lote({ a: { conceptos: ['x'] }, b: { conceptos: [] } })), new Map([['a', ['x']]]));
    const porId = new Map(ctx.preguntas.map((q) => [q.id, q]));
    const m = medir(oro, (id, kk) => (porId.has(id) ? b.proponer(porId.get(id), { clases: ctx.clases.get(id) ?? [], k: kk }) : null), { ks: [1, 3] });
    assert.equal(m.n, 12);
    assert.ok(m.principal[3] >= 0.9, JSON.stringify(m));
    assert.ok(m.principal[1] <= m.principal[3] && m.mrr > 0.5);
    assert.equal(medir(new Map([['zz', ['a']]]), () => null).desconocidas.length, 1);
  });
});
