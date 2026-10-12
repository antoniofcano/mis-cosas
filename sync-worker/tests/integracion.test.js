// El Worker de verdad (workerd) con el D1 local de wrangler (`wrangler dev --local`): esquema aplicado con las
// migraciones, alta, duplicados, validación y CORS. Sin red ni credenciales: todo es local. Se salta si no están
// instaladas las dependencias (npm install en sync-worker/).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { generarCodigo } from '../../nautica/src/store/sync/codigo.js';
import { VAPID_PRUEBA, susPrueba } from './claves-prueba.js';
import { parejas } from '../src/avisos.js';

const RAIZ = new URL('..', import.meta.url).pathname;
const WRANGLER = join(RAIZ, 'node_modules/.bin/wrangler');
const PUERTO = 4811;
const URL0 = `http://127.0.0.1:${PUERTO}`;
const hay = existsSync(WRANGLER);
const ENTORNO = { ...process.env, WRANGLER_SEND_METRICS: 'false', CI: '1', NO_PROXY: '127.0.0.1,localhost', no_proxy: '127.0.0.1,localhost' };
let proc = null;
let dir = null;
let salida = '';

before(async () => {
  if (!hay) return;
  dir = mkdtempSync(join(tmpdir(), 'patron-sync-'));
  execFileSync(WRANGLER, ['d1', 'migrations', 'apply', 'patron-sync', '--local', '--persist-to', dir], { cwd: RAIZ, env: ENTORNO, stdio: 'pipe' });
  proc = spawn(WRANGLER, ['dev', '--local', '--port', String(PUERTO), '--ip', '127.0.0.1', '--persist-to', dir, '--var', 'PEPPER:pepper-de-integracion-0123456789',
    '--var', `VAPID_PUBLIC:${VAPID_PRUEBA.publica}`, '--var', `VAPID_PRIVATE:${VAPID_PRUEBA.privada}`, '--test-scheduled'], { cwd: RAIZ, env: ENTORNO, stdio: 'pipe' });
  proc.stderr.on('data', (d) => { salida += d; });
  proc.stdout.on('data', (d) => { salida += d; });
  for (let i = 0; i < 120; i += 1) {
    try { if ((await fetch(`${URL0}/v1/salud`)).ok) return; } catch { /* aún arrancando */ }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('wrangler dev no arrancó');
}, { timeout: 120e3 });

after(() => {
  proc?.kill('SIGTERM');
  if (dir) rmSync(dir, { recursive: true, force: true });
});

const sync = (codigo, cuerpo, origen = 'http://localhost:4800') => fetch(`${URL0}/v1/sync`, {
  method: 'POST', headers: { authorization: `Bearer ${codigo}`, 'content-type': 'application/json', origin: origen }, body: JSON.stringify(cuerpo),
});
const op = (dev, n, extra = {}) => ({ i: `${dev}.${n}.x`, k: 'r', t: Date.now() - 1000, q: 'and-2024-c1-t01', c: 'a', o: true, d: '2026-10-10', ...extra });

test('workerd + D1 local: salud, alta, duplicados, cursor entre aparatos y rechazos', { skip: !hay && 'sin node_modules (npm install)' }, async () => {
  const salud = await (await fetch(`${URL0}/v1/salud`)).json();
  assert.equal(salud.ok, true);
  const c = generarCodigo();
  assert.equal((await sync(c, { v: 1, cursor: 0, ops: [op('aaaaaaaaaa', 1)] })).status, 404);
  const r1 = await (await sync(c, { v: 1, cursor: 0, ops: [op('aaaaaaaaaa', 1), op('aaaaaaaaaa', 2), { i: 'malo' }], crear: true })).json();
  assert.equal(r1.aceptadas, 2);
  assert.equal(r1.rechazadas.length, 1);
  const r2 = await (await sync(c, { v: 1, cursor: 0, ops: [op('bbbbbbbbbb', 1), op('aaaaaaaaaa', 1)] })).json();
  assert.equal(r2.aceptadas, 1);
  assert.equal(r2.duplicadas, 1);
  assert.deepEqual(r2.ops.map((o) => o.i), ['aaaaaaaaaa.2.x']);
  assert.equal(r2.cursor, 3);
  assert.equal(r2.total, 3);
});

test('workerd: CORS de la app y rechazo de otros orígenes', { skip: !hay && 'sin node_modules (npm install)' }, async () => {
  const pre = await fetch(`${URL0}/v1/sync`, { method: 'OPTIONS', headers: { origin: 'https://antoniofcano.github.io', 'access-control-request-method': 'POST', 'access-control-request-headers': 'authorization, content-type' } });
  assert.equal(pre.status, 204);
  assert.equal(pre.headers.get('access-control-allow-origin'), 'https://antoniofcano.github.io');
  const malo = await sync(generarCodigo(), { v: 1, cursor: 0, ops: [] }, 'https://evil.example');
  assert.equal(malo.status, 403);
});

test('workerd: un lote de 500 operaciones entra de una vez (un solo INSERT con json_each)', { skip: !hay && 'sin node_modules (npm install)' }, async () => {
  const c = generarCodigo();
  const ops = Array.from({ length: 500 }, (_, i) => op('cccccccccc', (i + 1).toString(36)));
  const r = await (await sync(c, { v: 1, cursor: 0, ops, crear: true })).json();
  assert.equal(r.aceptadas, 500);
  assert.equal(r.total, 500);
  const otro = await (await sync(c, { v: 1, cursor: 0, ops: [] })).json();
  assert.equal(otro.ops.length, 500);
  assert.deepEqual(otro.ops.map((o) => o.i), ops.map((o) => o.i), 'en el orden en que llegaron');
});

test('workerd: recordatorio diario (alta con WebCrypto de workerd, cambio de hora, baja) y el cron programado', { skip: !hay && 'sin node_modules (npm install)' }, async () => {
  const c = generarCodigo();
  assert.equal((await sync(c, { v: 1, cursor: 0, ops: [op('dddddddddd', 1)], crear: true })).status, 200);
  // Una franja que no toca ni ahora ni en la próxima hora: el cron no enviará nada (las pruebas no salen a la red).
  const ocupadas = new Set([...parejas(Date.now()), ...parejas(Date.now() + 3600e3)].map(([h, z]) => `${h}|${z}`));
  const [hora, zona] = [[9, 'Europe/Madrid'], [13, 'Europe/Madrid'], [21, 'Europe/Madrid'], [9, 'America/Lima']].find(([h, z]) => !ocupadas.has(`${h}|${z}`));
  const alta = (cuerpo) => fetch(`${URL0}/v1/avisos`, { method: 'POST', headers: { authorization: `Bearer ${c}`, 'content-type': 'application/json', origin: 'http://localhost:5100' }, body: JSON.stringify(cuerpo) });
  const r = await alta({ v: 1, sus: susPrueba(7), zona, hora });
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { ok: true, hora, zona });
  assert.equal((await alta({ v: 1, sus: { ...susPrueba(7), keys: { ...susPrueba(7).keys, p256dh: `B${'A'.repeat(86)}` } }, zona, hora })).status, 400, 'punto fuera de la curva (WebCrypto de workerd)');
  const prog = await fetch(`${URL0}/__scheduled?cron=${encodeURIComponent('0 * * * *')}`);
  assert.equal(prog.status, 200);
  await new Promise((res) => setTimeout(res, 300));
  assert.doesNotMatch(salida, /avisos .*(error|Error)|Uncaught/);
  const baja = await fetch(`${URL0}/v1/avisos/baja`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ v: 1, endpoint: susPrueba(7).endpoint }) });
  assert.deepEqual(await baja.json(), { ok: true, borradas: 1 });
});
