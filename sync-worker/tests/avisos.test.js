// Recordatorio diario (src/avisos.js y las rutas /v1/avisos de src/servidor.js) con un D1 en memoria (node:sqlite), un
// reloj simulado y un servicio de push de mentira: hora local por zona con cambios de hora, a quién se avisa y a quién
// no, topes, interruptor, limpieza y cuántas consultas hace cada ejecución. Sin red.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createPublicKey, verify } from 'node:crypto';
import { manejar, LIMITES } from '../src/servidor.js';
import { cron, decidir, local, parejas, LIMITES_AVISOS, pushActivo, CARGA } from '../src/avisos.js';
import { deB64u, aB64u } from '../src/webpush.js';
import { HORAS, ZONAS, validarSuscripcion, hostPushConocido } from '../../nautica/src/store/sync/avisos.js';
import { generarCodigo } from '../../nautica/src/store/sync/codigo.js';
import { d1Memoria } from './d1-node.js';
import { VAPID_PRUEBA, susPrueba, descifrar } from './claves-prueba.js';

const PEPPER = 'pepper-de-pruebas-0123456789';
const ORIGEN = 'https://antoniofcano.github.io';
const H = 3600e3;
const DIA = 864e5;
const L0 = { ...LIMITES_AVISOS };
const LIM0 = { ...LIMITES };
// 12 de octubre de 2026 (horario de verano en Madrid, UTC+2): las 16:00 UTC son las 18:00 en Madrid.
const T18 = Date.UTC(2026, 9, 12, 16);
let env;
beforeEach(() => {
  Object.assign(LIMITES_AVISOS, L0);
  Object.assign(LIMITES, LIM0);
  env = { DB: d1Memoria(), PEPPER, PUSH_ACTIVO: '1', VAPID_PUBLIC: VAPID_PRUEBA.publica, VAPID_PRIVATE: VAPID_PRUEBA.privada };
});
const sql = (q, ...p) => env.DB.sqlite.prepare(q).all(...p);

function pide(ruta, cuerpo, { codigo = null, ip = '1.1.1.1', ahora = T18 - 6 * H, crudo = null } = {}) {
  const h = { 'content-type': 'application/json', 'cf-connecting-ip': ip, origin: ORIGEN };
  if (codigo) h.authorization = `Bearer ${codigo}`;
  const req = new Request(`https://patron-sync.example${ruta}`, { method: 'POST', headers: h, body: crudo ?? JSON.stringify(cuerpo) });
  return manejar(req, env, { ahora }).then(async (r) => ({ r, j: await r.json().catch(() => null) }));
}

let nop = 0;
/** Un alumno con actividad en `cuando` (su primera subida). */
async function alumno(cuando = T18 - 3 * DIA) {
  const c = generarCodigo();
  const op = { i: `aaaaaaaaaa.${(++nop).toString(36)}.x`, k: 'a', t: cuando - 1000, d: '2026-10-09', m: 5 };
  const { r } = await pide('/v1/sync', { v: 1, cursor: 0, ops: [op], crear: true }, { codigo: c, ahora: cuando });
  assert.equal(r.status, 200);
  return c;
}
const alta = (codigo, { n = 1, hora = 18, zona = 'Europe/Madrid', host, ahora, extra = {} } = {}) => pide('/v1/avisos', { v: 1, sus: susPrueba(n, host), zona, hora, ...extra }, { codigo, ahora });

/** Servicio de push de mentira: apunta lo recibido y responde `estado` (o lo que diga la función). */
function servicioPush(estado = 201) {
  const recibidos = [];
  const f = async (url, init) => { recibidos.push({ url, init }); return new Response(null, { status: typeof estado === 'function' ? estado(url) : estado }); };
  return { f, recibidos };
}
const ejecuta = async (ahora, push = servicioPush()) => {
  const antes = env.DB.consultas();
  const r = await cron(env, { ahora, fetch: push.f });
  return { ...r, sentencias: env.DB.consultas() - antes, push };
};

test('hora local por zona con Intl, también al cambiar la hora (verano ↔ invierno)', () => {
  // Madrid: 28-29 de marzo de 2026 adelanta (UTC+1 → UTC+2); 24-25 de octubre atrasa.
  assert.deepEqual(local('Europe/Madrid', Date.UTC(2026, 2, 28, 17)), { dia: '2026-03-28', hora: 18 });
  assert.deepEqual(local('Europe/Madrid', Date.UTC(2026, 2, 29, 16)), { dia: '2026-03-29', hora: 18 });
  assert.deepEqual(local('Europe/Madrid', Date.UTC(2026, 9, 24, 16)), { dia: '2026-10-24', hora: 18 });
  assert.deepEqual(local('Europe/Madrid', Date.UTC(2026, 9, 25, 17)), { dia: '2026-10-25', hora: 18 });
  assert.deepEqual(local('Atlantic/Canary', Date.UTC(2026, 9, 12, 17)), { dia: '2026-10-12', hora: 18 });
  // La noche del cambio: a las 0:30 UTC del 29 de marzo son las 1:30 y a la 1:30 UTC ya las 3:30 (las 2 no existen).
  assert.equal(local('Europe/Madrid', Date.UTC(2026, 2, 29, 0, 30)).hora, 1);
  assert.equal(local('Europe/Madrid', Date.UTC(2026, 2, 29, 1, 30)).hora, 3);
  // Hemisferio sur (Santiago atrasa en abril) y sin cambio de hora (México desde 2022).
  assert.equal(local('America/Santiago', Date.UTC(2026, 0, 15, 21)).hora, 18);
  assert.equal(local('America/Santiago', Date.UTC(2026, 6, 15, 22)).hora, 18);
  assert.equal(local('America/Mexico_City', Date.UTC(2026, 6, 15, 0)).dia, '2026-07-14', 'el día también es el local');
  // Cada hora elegible cae en punto en todas las zonas admitidas (desfases de horas enteras) y una vez al día.
  for (const z of ZONAS) {
    const horas = Array.from({ length: 24 }, (_, i) => local(z, Date.UTC(2026, 9, 12, i)).hora).sort((a, b) => a - b);
    assert.deepEqual(horas, Array.from({ length: 24 }, (_, i) => i), z);
  }
});

test('parejas: qué (hora, zona) tocan en cada hora UTC; en Madrid, las 18 caen a otra hora UTC en invierno', () => {
  assert.ok(parejas(T18).some(([h, z]) => h === 18 && z === 'Europe/Madrid'));
  assert.ok(!parejas(T18).some(([, z]) => z === 'Atlantic/Canary'), 'en Canarias son las 17');
  assert.ok(parejas(Date.UTC(2026, 10, 2, 17)).some(([h, z]) => h === 18 && z === 'Europe/Madrid'), 'en noviembre, a las 17 UTC');
  assert.ok(!parejas(Date.UTC(2026, 10, 2, 16)).some(([, z]) => z === 'Europe/Madrid'));
  for (const [h, z] of parejas(T18)) { assert.ok(HORAS.includes(h)); assert.ok(ZONAS.includes(z)); }
});

test('decidir: avisa al que no ha estudiado hoy; no al que ya estudió, ni dos veces el mismo día, ni al pausado', () => {
  const base = { zona: 'Europe/Madrid', dia: '2026-10-11', aviso: T18 - DIA, seguidos: 1, ultimo: T18 - 2 * DIA };
  assert.deepEqual(decidir(base, T18), { enviar: true, hoy: '2026-10-12', seguidos: 2 });
  assert.equal(decidir({ ...base, ultimo: T18 - 8 * H }, T18).motivo, 'activo-hoy', 'estudió a las 10 de la mañana');
  assert.equal(decidir({ ...base, ultimo: Date.UTC(2026, 9, 11, 21, 30) }, T18).enviar, true, 'a las 23:30 de ayer en Madrid (21:30 UTC) era ayer');
  assert.equal(decidir({ ...base, ultimo: Date.UTC(2026, 9, 11, 22, 30) }, T18).motivo, 'activo-hoy', 'a las 0:30 de hoy en Madrid ya es hoy');
  assert.equal(decidir({ ...base, dia: '2026-10-12' }, T18).motivo, 'ya-avisado');
  assert.equal(decidir({ ...base, seguidos: 5 }, T18).motivo, 'pausado');
  assert.deepEqual(decidir({ ...base, seguidos: 5, ultimo: base.aviso + H }, T18), { enviar: true, hoy: '2026-10-12', seguidos: 1 }, 'vuelve a estudiar: se reanuda');
  assert.deepEqual(decidir({ ...base, aviso: 0, dia: '', seguidos: 0 }, T18), { enviar: true, hoy: '2026-10-12', seguidos: 1 }, 'alumno sin actividad desde hace días, primer aviso');
});

test('validación de la suscripción: https, servicio de push conocido y claves con su longitud exacta', () => {
  const s = susPrueba();
  assert.equal(validarSuscripcion(s), null);
  for (const host of ['fcm.googleapis.com', 'updates.push.services.mozilla.com', 'web.push.apple.com', 'wns2-par02p.notify.windows.com']) assert.equal(validarSuscripcion(susPrueba(1, host)), null, host);
  for (const host of ['evil.example', 'fcm.googleapis.com.evil.example', 'notify.windows.com', 'a.b.notify.windows.com', 'push.apple.com']) assert.ok(!hostPushConocido(host), host);
  assert.equal(validarSuscripcion({ ...s, endpoint: s.endpoint.replace('https', 'http') }), 'endpoint');
  assert.equal(validarSuscripcion({ ...s, endpoint: 'https://fcm.googleapis.com:8443/x' }), 'endpoint');
  assert.equal(validarSuscripcion({ ...s, endpoint: `https://fcm.googleapis.com/${'x'.repeat(1100)}` }), 'endpoint');
  assert.equal(validarSuscripcion({ ...s, keys: { ...s.keys, p256dh: s.keys.p256dh.slice(1) } }), 'claves');
  assert.equal(validarSuscripcion({ ...s, keys: { ...s.keys, p256dh: `A${s.keys.p256dh.slice(1)}` } }), 'claves', 'no empieza por 0x04');
  assert.equal(validarSuscripcion({ ...s, keys: { ...s.keys, auth: `${s.keys.auth}==` } }), 'claves');
  assert.equal(validarSuscripcion({ ...s, keys: { ...s.keys, auth: s.keys.auth.replace('A', '+') } }), 'claves');
  assert.equal(validarSuscripcion(null), 'forma');
  assert.equal(validarSuscripcion([]), 'forma');
});

test('alta: guarda la suscripción con su zona y hora; cambiar de hora la actualiza; baja la borra', async () => {
  const c = await alumno();
  const a = await alta(c);
  assert.equal(a.r.status, 200);
  assert.deepEqual(a.j, { ok: true, hora: 18, zona: 'Europe/Madrid' });
  assert.equal(a.r.headers.get('access-control-allow-origin'), ORIGEN);
  assert.deepEqual(sql('SELECT zona, hora FROM avisos').map((x) => ({ ...x })), [{ zona: 'Europe/Madrid', hora: 18 }]);
  const b = await alta(c, { hora: 9, zona: 'Atlantic/Canary' });
  assert.equal(b.r.status, 200);
  assert.deepEqual(sql('SELECT zona, hora FROM avisos').map((x) => ({ ...x })), [{ zona: 'Atlantic/Canary', hora: 9 }], 'misma fila (por endpoint)');
  // El navegador cambió la suscripción: con «anterior», la vieja se borra.
  assert.equal((await alta(c, { n: 2, extra: { anterior: susPrueba(1).endpoint } })).r.status, 200);
  assert.deepEqual(sql('SELECT endpoint FROM avisos').map((x) => x.endpoint), [susPrueba(2).endpoint]);
  const baja = await pide('/v1/avisos/baja', { v: 1, endpoint: susPrueba(2).endpoint });
  assert.deepEqual(baja.j, { ok: true, borradas: 1 });
  assert.equal(sql('SELECT COUNT(*) n FROM avisos')[0].n, 0);
  assert.equal((await pide('/v1/avisos/baja', { v: 1, endpoint: susPrueba(2).endpoint })).j.borradas, 0, 'baja repetida: nada que borrar');
});

test('alta: rechazos claros (código, suscripción, zona, hora, esquema, tamaño) y el mismo límite por IP que la API', async () => {
  const c = await alumno();
  assert.equal((await pide('/v1/avisos', { v: 1, sus: susPrueba(), zona: 'Europe/Madrid', hora: 18 })).j.error, 'codigo-invalido');
  assert.equal((await alta(generarCodigo())).j.error, 'codigo-desconocido');
  assert.equal((await alta(c, { host: 'evil.example' })).j.error, 'suscripcion');
  assert.equal((await alta(c, { zona: 'Asia/Tokyo' })).j.error, 'zona');
  assert.equal((await alta(c, { hora: 10 })).j.error, 'hora');
  assert.equal((await alta(c, { hora: '18' })).j.error, 'hora');
  assert.equal((await alta(c, { extra: { otra: 1 } })).j.error, 'esquema');
  assert.equal((await pide('/v1/avisos', { v: 1, sus: { ...susPrueba(), keys: { p256dh: `B${'A'.repeat(86)}`, auth: susPrueba().keys.auth } }, zona: 'Europe/Madrid', hora: 18 }, { codigo: c })).j.error, 'suscripcion', 'punto fuera de la curva');
  const grande = await pide('/v1/avisos', null, { codigo: c, crudo: JSON.stringify({ v: 1, relleno: 'x'.repeat(3000) }) });
  assert.equal(grande.r.status, 413);
  assert.equal((await pide('/v1/avisos', null, { codigo: c, crudo: '{' })).j.error, 'json');
  assert.equal((await pide('/v1/avisos/baja', { v: 1, endpoint: 5 })).j.error, 'esquema');
  LIMITES.porIpMinuto = 2;
  await pide('/v1/avisos/baja', { v: 1, endpoint: 'x' }, { ip: '9.9.9.9' });
  await pide('/v1/avisos/baja', { v: 1, endpoint: 'x' }, { ip: '9.9.9.9' });
  const r = await pide('/v1/avisos/baja', { v: 1, endpoint: 'x' }, { ip: '9.9.9.9' });
  assert.equal(r.r.status, 429);
  assert.equal(r.r.headers.get('retry-after'), '60');
});

test('topes: 3 por alumno (se sustituye la más antigua) y 500 en total (409)', async () => {
  const c = await alumno();
  for (let n = 1; n <= 4; n += 1) assert.equal((await alta(c, { n, ahora: T18 - 10 * H + n * 1000 })).r.status, 200);
  assert.deepEqual(sql('SELECT endpoint FROM avisos ORDER BY id').map((x) => x.endpoint), [2, 3, 4].map((n) => susPrueba(n).endpoint));
  LIMITES_AVISOS.total = 3;
  const otro = await alumno();
  const r = await alta(otro, { n: 9 });
  assert.equal(r.r.status, 409);
  assert.equal(r.j.error, 'tope-avisos');
  assert.equal((await alta(c, { n: 4, hora: 21 })).r.status, 200, 'cambiar la hora de una que ya está sí se puede');
});

test('interruptor PUSH_ACTIVO = "0": altas rechazadas con un mensaje claro y el cron no hace NADA (ni una consulta)', async () => {
  const c = await alumno();
  await alta(c);
  env.PUSH_ACTIVO = '0';
  assert.equal(pushActivo(env), false);
  const r = await alta(c, { n: 2 });
  assert.equal(r.r.status, 503);
  assert.equal(r.j.error, 'avisos-apagados');
  assert.match(r.j.motivo, /desactivados/);
  const e = await ejecuta(T18);
  assert.equal(e.sentencias, 0);
  assert.equal(e.push.recibidos.length, 0);
  assert.equal(e.motivo, 'apagado');
  // La baja sí funciona con el interruptor apagado.
  assert.equal((await pide('/v1/avisos/baja', { v: 1, endpoint: susPrueba(1).endpoint })).j.borradas, 1);
  // Sin claves VAPID: tampoco.
  env.PUSH_ACTIVO = '1';
  env.VAPID_PRIVATE = '';
  assert.equal((await alta(c)).j.error, 'avisos-sin-configurar');
  assert.equal((await ejecuta(T18)).sentencias, 0);
});

test('cron sin nada que hacer: UNA consulta por ejecución durante un día entero (y ningún envío)', async () => {
  const c = await alumno();
  await alta(c, { hora: 9, zona: 'America/Lima' }); // hay suscripciones, pero en otra franja casi siempre
  let total = 0;
  let consultas = 0;
  for (let h = 0; h < 24; h += 1) {
    const ahora = Date.UTC(2026, 9, 12, h);
    const e = await ejecuta(ahora);
    const limpia = h === LIMITES_AVISOS.horaLimpieza ? 2 : 0; // a las 3 UTC, el batch de limpieza (2 sentencias)
    const lima = h === 14; // las 9 en Lima (UTC-5)
    // Sin ninguna zona a una hora elegible no hace falta ni la consulta (0); si alguna lo está, una.
    if (!lima) assert.ok(e.sentencias <= 1 + limpia, `a las ${h} UTC`);
    if (!lima) assert.ok(e.sentencias >= limpia, `a las ${h} UTC`);
    total += e.push.recibidos.length;
    consultas += e.sentencias;
  }
  assert.equal(total, 1, 'solo el aviso de Lima, una vez');
  assert.ok(consultas <= 24 + 2 + 3, `${consultas} sentencias en un día`);
});

test('cron: avisa una vez a las 18 locales con un mensaje mínimo cifrado y VAPID válido; repetir no duplica', async () => {
  const c = await alumno();
  await alta(c);
  const e = await ejecuta(T18);
  assert.equal(e.enviados, 1);
  assert.equal(e.push.recibidos.length, 1);
  const { url, init } = e.push.recibidos[0];
  assert.equal(url, susPrueba(1).endpoint);
  assert.equal(await descifrar(init.body), CARGA);
  assert.ok(init.body.length < 120, 'mensaje mínimo');
  assert.equal(init.headers.topic, 'recordatorio');
  assert.equal(init.headers.ttl, String(LIMITES_AVISOS.ttl));
  const [, t, k] = /^vapid t=([^,]+), k=(.+)$/.exec(init.headers.authorization);
  assert.equal(k, VAPID_PRUEBA.publica);
  const [cab, cuerpo, firma] = t.split('.');
  const claims = JSON.parse(new TextDecoder().decode(deB64u(cuerpo)));
  assert.equal(claims.aud, 'https://fcm.googleapis.com');
  assert.equal(claims.sub, 'https://antoniofcano.github.io/mis-cosas/nautica/');
  assert.ok(claims.exp * 1000 > T18 && claims.exp * 1000 <= T18 + 24 * H);
  const pub = deB64u(VAPID_PRUEBA.publica);
  const clave = createPublicKey({ key: { kty: 'EC', crv: 'P-256', x: aB64u(pub.slice(1, 33)), y: aB64u(pub.slice(33)) }, format: 'jwk' });
  assert.ok(verify('sha256', Buffer.from(`${cab}.${cuerpo}`), { key: clave, dsaEncoding: 'ieee-p1363' }, Buffer.from(deB64u(firma))));
  // Consultas: la selección, el contador del día y un batch (actualizar la fila + el contador).
  assert.equal(e.consultas, 3);
  assert.equal(e.sentencias, 4);
  assert.deepEqual({ ...sql('SELECT dia, seguidos FROM avisos')[0] }, { dia: '2026-10-12', seguidos: 1 });
  // Otra ejecución a la misma hora (o un reintento de Cloudflare): ya avisado hoy, nada más.
  const otra = await ejecuta(T18 + 60e3);
  assert.equal(otra.push.recibidos.length, 0);
  assert.equal(otra.sentencias, 1);
});

test('cron: no avisa a quien ya ha estudiado hoy; sí al que no (cada alumno lo suyo)', async () => {
  const estudioso = await alumno(T18 - 7 * H); // a las 11 de hoy
  const vago = await alumno(T18 - 2 * DIA);
  await alta(estudioso, { n: 1 });
  await alta(vago, { n: 2 });
  const e = await ejecuta(T18);
  assert.deepEqual(e.push.recibidos.map((x) => x.url), [susPrueba(2).endpoint]);
  assert.equal(e.filas, 2);
  assert.equal(e.candidatas, 1);
});

test('cron: se pausa tras 5 avisos seguidos sin estudiar y se reanuda en cuanto vuelve a usar la app', async () => {
  const c = await alumno(T18 - 10 * DIA);
  await alta(c, { ahora: T18 - 10 * DIA });
  const avisos = [];
  for (let d = 0; d < 7; d += 1) avisos.push((await ejecuta(T18 + d * DIA)).push.recibidos.length);
  assert.deepEqual(avisos, [1, 1, 1, 1, 1, 0, 0]);
  // Pausado: la consulta ni siquiera lo lee.
  assert.equal((await ejecuta(T18 + 7 * DIA)).filas, 0);
  // Vuelve: estudia el día 8 por la mañana (sube operaciones)…
  const op = { i: 'bbbbbbbbbb.1.x', k: 'a', t: T18 + 8 * DIA - 8 * H, d: '2026-10-20', m: 5 };
  assert.equal((await pide('/v1/sync', { v: 1, cursor: 0, ops: [op] }, { codigo: c, ahora: T18 + 8 * DIA - 8 * H })).r.status, 200);
  assert.equal((await ejecuta(T18 + 8 * DIA)).push.recibidos.length, 0, 'ese día ya ha estudiado');
  const e = await ejecuta(T18 + 9 * DIA);
  assert.equal(e.push.recibidos.length, 1, 'al día siguiente, si no estudia, vuelve el aviso');
  assert.equal(sql('SELECT seguidos FROM avisos')[0].seguidos, 1);
});

test('cron: una suscripción que el servicio de push rechaza (404/410) se borra; otros errores, un intento y nada más', async () => {
  for (let n = 1; n <= 3; n += 1) await alta(await alumno(), { n });
  const push = servicioPush((url) => (url.includes('prueba-1-') ? 410 : url.includes('prueba-2-') ? 404 : 500));
  const e = await ejecuta(T18, push);
  assert.equal(push.recibidos.length, 3, 'un intento por suscripción, sin reintentos');
  assert.equal(e.borrados, 2);
  assert.equal(e.fallidos, 1);
  assert.deepEqual(sql('SELECT endpoint FROM avisos').map((x) => x.endpoint), [susPrueba(3).endpoint]);
  assert.equal(sql('SELECT dia FROM avisos')[0].dia, '', 'el fallido no cuenta como avisado');
  // Red caída: tampoco lanza.
  const caida = await cron(env, { ahora: T18 + DIA, fetch: async () => { throw new Error('sin red'); } });
  assert.equal(caida.fallidos, 1);
});

test('topes del cron: envíos por ejecución, por día (contador en D1) y filas leídas', async () => {
  for (let n = 1; n <= 5; n += 1) await alta(await alumno(), { n });
  LIMITES_AVISOS.enviosPorEjecucion = 2;
  const e = await ejecuta(T18);
  assert.equal(e.push.recibidos.length, 2);
  assert.equal(e.motivo, 'tope');
  assert.equal(sql("SELECT n FROM limites WHERE clave = 'avisos:dia'")[0].n, 2);
  LIMITES_AVISOS.enviosPorEjecucion = 40;
  LIMITES_AVISOS.enviosPorDia = 3;
  const f = await ejecuta(T18 + 60e3);
  assert.equal(f.push.recibidos.length, 1, 'quedaba 1 del día');
  assert.equal((await ejecuta(T18 + 120e3)).push.recibidos.length, 0, 'tope del día alcanzado');
  LIMITES_AVISOS.enviosPorDia = 400;
  LIMITES_AVISOS.filasPorEjecucion = 1;
  assert.equal((await ejecuta(T18 + 180e3)).filas, 1);
});

test('limpieza diaria (3:00 UTC, dentro del mismo batch): límites pasados y suscripciones caducadas', async () => {
  const viejo = await alumno(T18 - 200 * DIA);
  const nuevo = await alumno(T18 - DIA);
  await alta(viejo, { n: 1, ahora: T18 - 200 * DIA });
  await alta(nuevo, { n: 2, ahora: T18 - 200 * DIA }); // sin renovar, pero el alumno estudia: se queda
  env.DB.sqlite.prepare("INSERT INTO limites (clave, ventana, n) VALUES ('ip:viejo', 1, 3)").run();
  const tres = Date.UTC(2026, 9, 13, 3);
  const e = await ejecuta(tres);
  assert.equal(e.sentencias, 3, '1 consulta + 2 borrados en un batch');
  assert.deepEqual(sql('SELECT endpoint FROM avisos').map((x) => x.endpoint), [susPrueba(2).endpoint]);
  assert.equal(sql("SELECT COUNT(*) n FROM limites WHERE clave = 'ip:viejo'")[0].n, 0);
});
