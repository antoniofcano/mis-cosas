// Servidor de sincronización (src/servidor.js) con un D1 en memoria (node:sqlite): esquema, validación, límites,
// duplicados, hash del código, CORS e intentos fallidos. Sin red.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { manejar, LIMITES, hashCodigo, origenPermitido } from '../src/servidor.js';
import { d1Memoria } from './d1-node.js';
import { generarCodigo, formatearCodigo } from '../../nautica/src/store/sync/codigo.js';

const PEPPER = 'pepper-de-pruebas-0123456789';
const AHORA = Date.UTC(2026, 9, 10, 12);
const ORIGEN = 'https://antoniofcano.github.io';
const LIM0 = { ...LIMITES };
let env;
beforeEach(() => { Object.assign(LIMITES, LIM0); env = { DB: d1Memoria(), PEPPER }; });

let n = 0;
const op = (dev = 'aaaaaaaaaa', extra = {}) => ({ i: `${dev}.${(++n).toString(36)}.x`, k: 'a', t: AHORA - 1000, d: '2026-10-10', m: 5, ...extra });
function pide(codigo, cuerpo, { ip = '1.1.1.1', origen = ORIGEN, metodo = 'POST', ruta = '/v1/sync', cabeceras = {}, ahora = AHORA, crudo = null } = {}) {
  const h = { 'content-type': 'application/json', 'cf-connecting-ip': ip, ...cabeceras };
  if (codigo) h.authorization = `Bearer ${codigo}`;
  if (origen) h.origin = origen;
  const req = new Request(`https://patron-sync.example${ruta}`, { method: metodo, headers: h, body: metodo === 'POST' ? (crudo ?? JSON.stringify(cuerpo)) : undefined });
  return manejar(req, env, { ahora }).then(async (r) => ({ r, j: r.status === 204 ? null : await r.json().catch(() => null) }));
}

test('salud: responde con la versión y comprueba la base de datos', async () => {
  const { r, j } = await pide(null, null, { metodo: 'GET', ruta: '/v1/salud' });
  assert.equal(r.status, 200);
  assert.equal(j.ok, true);
  assert.ok(j.version);
});

test('esquema: schema.sql y las migraciones en orden dejan las mismas tablas, índices y columnas', () => {
  const describe = (db) => db.prepare("SELECT type, name, tbl_name, sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY name").all()
    .map((x) => ({ ...x, cols: x.type === 'table' ? db.prepare(`PRAGMA table_info(${x.name})`).all().map((c) => `${c.name}:${c.type}:${c.notnull}:${c.pk}`) : null, sql: undefined }));
  const a = new DatabaseSync(':memory:');
  a.exec(readFileSync(new URL('../schema.sql', import.meta.url), 'utf8'));
  const b = new DatabaseSync(':memory:');
  const dir = new URL('../migrations/', import.meta.url);
  const migs = readdirSync(dir).filter((f) => /^\d{4}_.+\.sql$/.test(f)).sort();
  assert.ok(migs.length >= 1 && migs[0].startsWith('0001_'), 'migraciones numeradas desde 0001');
  for (const f of migs) b.exec(readFileSync(new URL(f, dir), 'utf8'));
  assert.deepEqual(describe(b), describe(a));
  const idx = a.prepare("SELECT name FROM sqlite_master WHERE type = 'index' AND tbl_name = 'operaciones'").all();
  assert.ok(idx.length >= 1, 'clave única (alumno, op_id)');
});

test('alta: con crear la primera subida crea el alumno; sin crear, un código nuevo no existe', async () => {
  const c = generarCodigo();
  const no = await pide(c, { v: 1, cursor: 0, ops: [op()] });
  assert.equal(no.r.status, 404);
  assert.equal(no.j.error, 'codigo-desconocido');
  const si = await pide(c, { v: 1, cursor: 0, ops: [op()], crear: true });
  assert.equal(si.r.status, 200);
  assert.equal(si.j.aceptadas, 1);
  assert.equal(si.j.cursor, 1);
  // Ya existe: con o sin crear entra en el mismo alumno (y con el código formateado o en minúsculas).
  const otra = await pide(formatearCodigo(c).toLowerCase(), { v: 1, cursor: 0, ops: [] });
  assert.equal(otra.r.status, 200);
  assert.equal(otra.j.total, 1);
  assert.equal(env.DB.sqlite.prepare('SELECT COUNT(*) n FROM alumnos').get().n, 1);
});

test('el código nunca se guarda: solo su hash con el pepper', async () => {
  const c = generarCodigo();
  await pide(c, { v: 1, cursor: 0, ops: [op()], crear: true });
  const volcado = JSON.stringify([
    env.DB.sqlite.prepare('SELECT * FROM alumnos').all(), env.DB.sqlite.prepare('SELECT * FROM operaciones').all(), env.DB.sqlite.prepare('SELECT * FROM limites').all(),
  ]);
  assert.ok(!volcado.includes(c), 'ni rastro del código');
  assert.ok(!volcado.includes('1.1.1.1'), 'ni de la IP');
  const h = env.DB.sqlite.prepare('SELECT hash FROM alumnos').get().hash;
  assert.equal(h, await hashCodigo(c, PEPPER));
  assert.match(h, /^[0-9a-f]{64}$/);
  assert.notEqual(await hashCodigo(c, 'otro-pepper-0123456789'), h, 'otro pepper, otro hash');
  // Sin pepper (o uno corto) el servidor no arranca la sincronización.
  env.PEPPER = '';
  assert.equal((await pide(c, { v: 1, cursor: 0, ops: [] })).r.status, 500);
});

test('duplicados: reenviar no duplica; seq sin huecos; el cursor trae lo de los otros aparatos y no lo propio', async () => {
  const c = generarCodigo();
  const a1 = op('aaaaaaaaaa');
  const a2 = op('aaaaaaaaaa');
  const r1 = await pide(c, { v: 1, cursor: 0, ops: [a1, a2, a1], crear: true });
  assert.equal(r1.j.aceptadas, 2);
  assert.deepEqual(r1.j.ops, [], 'lo suyo no se le devuelve');
  assert.equal(r1.j.cursor, 2);
  const r2 = await pide(c, { v: 1, cursor: 2, ops: [a1, a2] }); // la respuesta se perdió y lo reenvía
  assert.equal(r2.j.aceptadas, 0);
  assert.equal(r2.j.duplicadas, 2);
  assert.equal(r2.j.total, 2);
  const b1 = op('bbbbbbbbbb');
  const rb = await pide(c, { v: 1, cursor: 0, ops: [b1, a1] }); // otro aparato que también recibió a1 (raro, pero vale)
  assert.equal(rb.j.aceptadas, 1);
  assert.deepEqual(rb.j.ops.map((o) => o.i), [a2.i], 'recibe lo que no ha mandado');
  assert.equal(rb.j.cursor, 3);
  const seqs = env.DB.sqlite.prepare('SELECT seq FROM operaciones ORDER BY seq').all().map((x) => x.seq);
  assert.deepEqual(seqs, [1, 2, 3]);
  const ra = await pide(c, { v: 1, cursor: 2, ops: [] });
  assert.deepEqual(ra.j.ops, [b1], 'el JSON vuelve tal cual');
});

test('respuesta troceada: como mucho respuestaOps por respuesta, con mas: true', async () => {
  LIMITES.respuestaOps = 3;
  const c = generarCodigo();
  await pide(c, { v: 1, cursor: 0, ops: Array.from({ length: 7 }, () => op('aaaaaaaaaa')), crear: true });
  let cursor = 0;
  const vistas = [];
  for (let i = 0; i < 5; i += 1) {
    const { j } = await pide(c, { v: 1, cursor, ops: [] });
    vistas.push(...j.ops.map((o) => o.i));
    cursor = j.cursor;
    if (!j.mas) break;
  }
  assert.equal(vistas.length, 7);
  assert.equal(new Set(vistas).size, 7);
  assert.equal(cursor, 7);
});

test('validación: cada operación se valida sola; las malas se rechazan con motivo y las buenas entran', async () => {
  const c = generarCodigo();
  const malas = [
    { i: 'malo', k: 'a', t: AHORA, d: '2026-10-10', m: 1 },
    op('aaaaaaaaaa', { k: 'zz' }),
    op('aaaaaaaaaa', { t: AHORA + 10 * 864e5 }), // del futuro
    op('aaaaaaaaaa', { t: Date.UTC(2020, 0, 1) }), // de antes de la app
    op('aaaaaaaaaa', { extra: 1 }),
    op('aaaaaaaaaa', { m: 99999 }),
    { ...op('aaaaaaaaaa'), k: 'r', q: 'x'.repeat(500), c: 'a', o: true },
    { ...op('aaaaaaaaaa'), k: 'v', c: 'secretos', p: ['x'], v: 1, d: undefined, m: undefined },
    { ...op('aaaaaaaaaa'), k: 'x', e: { relleno: 'x'.repeat(70 * 1024) }, d: undefined, m: undefined },
    'texto', null, 7,
  ];
  const buena = op('aaaaaaaaaa');
  const { r, j } = await pide(c, { v: 1, cursor: 0, ops: [...malas, buena], crear: true });
  assert.equal(r.status, 200);
  assert.equal(j.aceptadas, 1);
  assert.equal(j.rechazadas.length, malas.length);
  assert.ok(j.rechazadas.every((x) => typeof x.motivo === 'string' && x.motivo.length < 20));
});

test('validación del cuerpo: JSON, esquema, tamaño y número de operaciones', async () => {
  const c = generarCodigo();
  await pide(c, { v: 1, cursor: 0, ops: [], crear: true });
  assert.equal((await pide(c, null, { crudo: '{no es json' })).j.error, 'json');
  for (const malo of [[], { v: 2, cursor: 0, ops: [] }, { v: 1, cursor: -1, ops: [] }, { v: 1, cursor: 0 }, { v: 1, cursor: 0, ops: [], otra: 1 }, { v: 1, cursor: 0, ops: [], crear: 'si' }]) {
    const { r, j } = await pide(c, malo);
    assert.equal(r.status, 400, JSON.stringify(malo));
    assert.equal(j.error, 'esquema');
  }
  const muchas = await pide(c, { v: 1, cursor: 0, ops: Array.from({ length: LIMITES.opsPorLote + 1 }, () => op()) });
  assert.equal(muchas.r.status, 413);
  const grande = await pide(c, { v: 1, cursor: 0, ops: [{ relleno: 'x'.repeat(LIMITES.cuerpoBytes) }] });
  assert.equal(grande.r.status, 413);
  assert.equal(grande.j.error, 'demasiado-grande');
});

test('tope de operaciones por alumno', async () => {
  LIMITES.opsPorAlumno = 5;
  const c = generarCodigo();
  assert.equal((await pide(c, { v: 1, cursor: 0, ops: [op(), op(), op(), op()], crear: true })).j.aceptadas, 4);
  const { r, j } = await pide(c, { v: 1, cursor: 0, ops: [op(), op()] });
  assert.equal(r.status, 409);
  assert.equal(j.error, 'tope');
  assert.equal((await pide(c, { v: 1, cursor: 0, ops: [] })).r.status, 200, 'leer sigue funcionando');
});

test('límites: por IP y minuto, por alumno y minuto, y altas por IP y día', async () => {
  LIMITES.porIpMinuto = 3;
  const c = generarCodigo();
  for (let i = 0; i < 3; i += 1) assert.equal((await pide(c, { v: 1, cursor: 0, ops: [], crear: true })).r.status, 200);
  const r4 = await pide(c, { v: 1, cursor: 0, ops: [] });
  assert.equal(r4.r.status, 429);
  assert.equal(r4.r.headers.get('retry-after'), '60');
  assert.equal((await pide(c, { v: 1, cursor: 0, ops: [] }, { ip: '2.2.2.2' })).r.status, 200, 'otra IP, sí');
  assert.equal((await pide(c, { v: 1, cursor: 0, ops: [] }, { ahora: AHORA + 61e3 })).r.status, 200, 'al minuto siguiente, sí');
  LIMITES.porIpMinuto = 1000;
  LIMITES.porAlumnoMinuto = 2;
  const d = generarCodigo();
  await pide(d, { v: 1, cursor: 0, ops: [], crear: true }, { ip: '3.3.3.3' });
  await pide(d, { v: 1, cursor: 0, ops: [] }, { ip: '4.4.4.4' });
  assert.equal((await pide(d, { v: 1, cursor: 0, ops: [] }, { ip: '5.5.5.5' })).r.status, 429, 'el mismo alumno desde muchas IP');
  LIMITES.altasIpDia = 2;
  for (let i = 0; i < 2; i += 1) assert.equal((await pide(generarCodigo(), { v: 1, cursor: 0, ops: [], crear: true }, { ip: '6.6.6.6' })).r.status, 200);
  assert.equal((await pide(generarCodigo(), { v: 1, cursor: 0, ops: [], crear: true }, { ip: '6.6.6.6' })).r.status, 429);
});

test('intentos con códigos que no existen (o mal formados): a los N por hora, esa IP queda bloqueada una hora', async () => {
  LIMITES.fallosIpHora = 4;
  const bueno = generarCodigo();
  await pide(bueno, { v: 1, cursor: 0, ops: [], crear: true }, { ip: '9.9.9.9' });
  for (let i = 0; i < 3; i += 1) assert.equal((await pide(generarCodigo(), { v: 1, cursor: 0, ops: [] }, { ip: '7.7.7.7' })).r.status, 404);
  assert.equal((await pide('NO-VALE', { v: 1, cursor: 0, ops: [] }, { ip: '7.7.7.7' })).r.status, 401);
  // Bloqueada: ni siquiera con un código bueno.
  const b = await pide(bueno, { v: 1, cursor: 0, ops: [] }, { ip: '7.7.7.7' });
  assert.equal(b.r.status, 429);
  assert.equal(b.r.headers.get('retry-after'), '3600');
  assert.equal((await pide(bueno, { v: 1, cursor: 0, ops: [] }, { ip: '7.7.7.7', ahora: AHORA + 3600e3 })).r.status, 200, 'a la hora siguiente, sí');
  assert.equal((await pide(bueno, { v: 1, cursor: 0, ops: [] }, { ip: '8.8.8.8' })).r.status, 200, 'las demás IP, sin bloquear');
  // Sin cabecera o con otro esquema de autorización: código no válido.
  assert.equal((await pide(null, { v: 1, cursor: 0, ops: [] }, { ip: '8.8.4.4' })).j.error, 'codigo-invalido');
  assert.equal((await pide(null, { v: 1, cursor: 0, ops: [] }, { ip: '8.8.4.4', cabeceras: { authorization: `Basic ${bueno}` } })).r.status, 401);
});

test('CORS: solo la app publicada y localhost; preflight y respuestas con sus cabeceras', async () => {
  assert.ok(origenPermitido('https://antoniofcano.github.io'));
  assert.ok(origenPermitido('http://localhost:4800'));
  assert.ok(origenPermitido('http://127.0.0.1:4850'));
  for (const o of ['https://antoniofcano.github.io.malo.com', 'http://antoniofcano.github.io', 'https://evil.example', 'null', 'http://localhost.evil.com']) assert.ok(!origenPermitido(o), o);
  assert.ok(origenPermitido('https://otra.example', { ORIGENES_EXTRA: 'https://otra.example, https://x.example' }));
  const pre = await pide(null, null, { metodo: 'OPTIONS' });
  assert.equal(pre.r.status, 204);
  assert.equal(pre.r.headers.get('access-control-allow-origin'), ORIGEN);
  assert.match(pre.r.headers.get('access-control-allow-headers'), /authorization/);
  assert.equal((await pide(null, null, { metodo: 'OPTIONS', origen: 'https://evil.example' })).r.status, 403);
  const c = generarCodigo();
  const ok = await pide(c, { v: 1, cursor: 0, ops: [], crear: true }, { origen: 'http://localhost:4820' });
  assert.equal(ok.r.headers.get('access-control-allow-origin'), 'http://localhost:4820');
  const malo = await pide(c, { v: 1, cursor: 0, ops: [] }, { origen: 'https://evil.example' });
  assert.equal(malo.r.status, 403);
  assert.equal(malo.r.headers.get('access-control-allow-origin'), null);
  assert.equal((await pide(c, { v: 1, cursor: 0, ops: [] }, { origen: null })).r.status, 200, 'sin Origin (no es un navegador): vale');
});

test('rutas y métodos', async () => {
  assert.equal((await pide(null, null, { metodo: 'GET', ruta: '/' })).r.status, 404);
  assert.equal((await pide(null, null, { metodo: 'GET', ruta: '/v1/sync' })).r.status, 405);
});

test('pocas consultas por petición (D1 cuenta las consultas de cada invocación)', async () => {
  const c = generarCodigo();
  await pide(c, { v: 1, cursor: 0, ops: [], crear: true });
  const antes = env.DB.consultas();
  await pide(c, { v: 1, cursor: 0, ops: Array.from({ length: 500 }, () => op()) });
  assert.ok(env.DB.consultas() - antes <= 10, `${env.DB.consultas() - antes} consultas`);
});
