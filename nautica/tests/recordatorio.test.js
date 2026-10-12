// Recordatorio diario en el cliente (src/store/recordatorio.js, docs/AVISOS.md) con APIs del navegador simuladas:
// qué se ofrece en cada aparato, permiso concedido o denegado, sin PushManager, iPhone sin instalar (calendario .ics),
// cuántas peticiones hace cada cosa (UNA al activar, UNA al desactivar, NINGUNA al abrir si nada cambió) y el service
// worker (texto, icono, etiqueta y abrir Hoy al tocar).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import {
  modoAvisos, estadoAvisos, activar, desactivar, comprobarAlAbrir, leerLocal, zonaCliente, icsDiario, nombreIcs, jsonSuscripcion,
  bytesDeB64u, CLAVE, RENOVAR_MS, HORAS, HORA_DEFECTO,
} from '../src/store/recordatorio.js';
import { ZONAS, validarSuscripcion } from '../src/store/sync/avisos.js';
import { clavePublicaAvisos, VAPID_PUBLICA } from '../src/store/sync/config.js';

// Clave pública de PRUEBA (la misma de sync-worker/tests/claves-prueba.js; no es la de producción).
const CLAVE_PRUEBA = 'BJnX5BkVE0HLymIOfEpyWU3f_vpCt3XtGuZhir6EvybrpCb8tYThC4HHrZ7viMIQGfaoFO3CjGOzj9TRcv9n974';
const P256 = 'BOwqHlqhPhztXTzuDHNzI3VSNuSVQ9RSIHv3aXtnd0S8sboaDVCDlKgbj_mjrrv4G1KGjXaoOTpQ0iC-OPEWDdQ';
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Version/17.4 Mobile/15E148 Safari/604.1';
const ANDROID = 'Mozilla/5.0 (Linux; Android 14) Chrome/126 Mobile';
const T = Date.UTC(2026, 9, 12, 10);

function almacen() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), m };
}

/** Un navegador simulado con avisos: permiso, service worker con pushManager y un servidor de mentira. */
function navegador({ permiso = 'default', responde = 'granted', ua = ANDROID, standalone = false, conPush = true, respuestas = [], zona = 'Europe/Madrid' } = {}) {
  let n = 0;
  const llamadas = { permiso: 0, subscribe: 0, unsubscribe: 0, peticiones: [], sincronizar: 0 };
  let sus = null;
  const nuevaSus = () => {
    n += 1;
    const s = {
      endpoint: `https://fcm.googleapis.com/fcm/send/aparato-${n}`,
      options: { applicationServerKey: bytesDeB64u(CLAVE_PRUEBA).buffer },
      toJSON: () => ({ endpoint: s.endpoint, expirationTime: null, keys: { p256dh: P256, auth: 'AAECAwQFBgcICQoLDA0ODw==' } }),
      unsubscribe: async () => { llamadas.unsubscribe += 1; sus = null; return true; },
    };
    return s;
  };
  const pushManager = {
    getSubscription: async () => sus,
    subscribe: async (o) => { llamadas.subscribe += 1; assert.equal(o.userVisibleOnly, true); assert.ok(o.applicationServerKey instanceof Uint8Array); sus = nuevaSus(); return sus; },
  };
  const reg = { pushManager };
  const Notification = { permission: permiso, requestPermission: async () => { llamadas.permiso += 1; Notification.permission = responde; return responde; } };
  const win = conPush ? { Notification, PushManager: function PushManager() {}, matchMedia: () => ({ matches: standalone }) } : { matchMedia: () => ({ matches: standalone }) };
  const nav = { userAgent: ua, standalone, serviceWorker: { getRegistration: async () => reg, ready: Promise.resolve(reg) } };
  const storage = almacen();
  const fetch = async (url, init) => {
    llamadas.peticiones.push({ url, ruta: new URL(url).pathname, auth: init.headers.authorization ?? null, cuerpo: JSON.parse(init.body) });
    const r = respuestas.shift() ?? { status: 200, json: { ok: true } };
    return new Response(JSON.stringify(r.json), { status: r.status, headers: { 'content-type': 'application/json' } });
  };
  const intl = { DateTimeFormat: () => ({ resolvedOptions: () => ({ timeZone: zona }) }) };
  const d = {
    nav, win, storage, fetch, intl, url: 'https://patron-sync.example', clave: CLAVE_PRUEBA, ahora: T,
    codigo: () => 'K7QM4TXD92HB', sincronizar: async () => { llamadas.sincronizar += 1; },
  };
  return { d, llamadas, Notification, cambiaSus: () => { sus = nuevaSus(); }, quitaSus: () => { sus = null; } };
}

test('qué se ofrece: push, iPhone sin instalar (calendario), sin PushManager y servidor sin clave', () => {
  const b = navegador();
  assert.equal(modoAvisos({ nav: b.d.nav, win: b.d.win, clave: CLAVE_PRUEBA }), 'push');
  const ios = navegador({ ua: IPHONE });
  assert.equal(modoAvisos({ nav: ios.d.nav, win: ios.d.win, clave: CLAVE_PRUEBA }), 'ios', 'iPhone con PushManager pero sin instalar');
  const iosInst = navegador({ ua: IPHONE, standalone: true });
  assert.equal(modoAvisos({ nav: iosInst.d.nav, win: iosInst.d.win, clave: CLAVE_PRUEBA }), 'push', 'iPhone con la app instalada');
  const viejo = navegador({ ua: IPHONE, standalone: true, conPush: false });
  assert.equal(modoAvisos({ nav: viejo.d.nav, win: viejo.d.win, clave: CLAVE_PRUEBA }), 'sin-push', 'iOS antiguo, instalada, sin avisos');
  const sin = navegador({ conPush: false });
  assert.equal(modoAvisos({ nav: sin.d.nav, win: sin.d.win, clave: CLAVE_PRUEBA }), 'sin-push');
  assert.equal(modoAvisos({ nav: b.d.nav, win: b.d.win, clave: '' }), 'sin-servidor');
  assert.equal(modoAvisos({ nav: { userAgent: ANDROID }, win: b.d.win, clave: CLAVE_PRUEBA }), 'sin-push', 'sin service worker');
});

test('estado en una frase, sin jerga', () => {
  assert.equal(estadoAvisos({ modo: 'push', permiso: 'granted', local: { hora: 18 } }).texto, 'Te avisaremos a las 18:00');
  assert.equal(estadoAvisos({ modo: 'push', permiso: 'default', local: null }).texto, 'Avisos desactivados');
  assert.equal(estadoAvisos({ modo: 'push', permiso: 'granted', local: null }).texto, 'Avisos desactivados');
  assert.equal(estadoAvisos({ modo: 'push', permiso: 'denied', local: { hora: 9 } }).texto, 'Permiso denegado: puedes cambiarlo en los ajustes del navegador');
  assert.equal(estadoAvisos({ modo: 'sin-push', permiso: null, local: null }).texto, 'Tu navegador no admite avisos');
  assert.deepEqual(HORAS, [9, 13, 18, 21]);
  assert.equal(HORA_DEFECTO, 18);
});

test('activar con permiso concedido: pide permiso una vez (al tocar), se suscribe y hace UNA petición', async () => {
  const b = navegador();
  const r = await activar(18, b.d);
  assert.deepEqual(r, { ok: true, estado: 'activo' });
  assert.equal(b.llamadas.permiso, 1);
  assert.equal(b.llamadas.subscribe, 1);
  assert.equal(b.llamadas.peticiones.length, 1);
  const p = b.llamadas.peticiones[0];
  assert.equal(p.ruta, '/v1/avisos');
  assert.equal(p.auth, 'Bearer K7QM4TXD92HB');
  assert.deepEqual(Object.keys(p.cuerpo).sort(), ['hora', 'sus', 'v', 'zona']);
  assert.equal(p.cuerpo.zona, 'Europe/Madrid');
  assert.equal(p.cuerpo.hora, 18);
  assert.equal(p.cuerpo.sus.keys.auth, 'AAECAwQFBgcICQoLDA0ODw', 'sin relleno');
  assert.equal(validarSuscripcion(p.cuerpo.sus), null, 'pasa la misma validación que el servidor');
  assert.deepEqual(leerLocal(b.d.storage), { hora: 18, zona: 'Europe/Madrid', endpoint: 'https://fcm.googleapis.com/fcm/send/aparato-1', t: T });
  // Cambiar de hora: sin volver a pedir permiso ni suscribirse, una petición.
  assert.equal((await activar(9, b.d)).ok, true);
  assert.equal(b.llamadas.permiso, 1);
  assert.equal(b.llamadas.subscribe, 1);
  assert.equal(b.llamadas.peticiones.length, 2);
  assert.equal(b.llamadas.peticiones[1].cuerpo.hora, 9);
  assert.equal(b.llamadas.peticiones[1].cuerpo.anterior, undefined);
  assert.equal(leerLocal(b.d.storage).hora, 9);
});

test('permiso denegado (al pedirlo o de antes): no se suscribe ni pide nada al servidor', async () => {
  const b = navegador({ responde: 'denied' });
  assert.equal((await activar(18, b.d)).estado, 'denegado');
  assert.equal(b.llamadas.subscribe, 0);
  assert.equal(b.llamadas.peticiones.length, 0);
  const antes = navegador({ permiso: 'denied' });
  assert.equal((await activar(18, antes.d)).estado, 'denegado');
  assert.equal(antes.llamadas.permiso, 0, 'no se vuelve a preguntar');
  assert.equal(estadoAvisos({ modo: 'push', permiso: antes.Notification.permission, local: null }).tipo, 'denegado');
  // Cerrar el diálogo sin contestar: sigue apagado, con una frase para volver a intentarlo.
  const cierra = navegador({ responde: 'default' });
  const r = await activar(18, cierra.d);
  assert.equal(r.estado, 'apagado');
  assert.match(r.texto, /Vuelve a elegir la hora/);
  assert.equal(cierra.llamadas.peticiones.length, 0);
});

test('sin PushManager o iPhone sin instalar: activar no hace nada (se ofrece el calendario)', async () => {
  for (const b of [navegador({ conPush: false }), navegador({ ua: IPHONE })]) {
    assert.equal((await activar(18, b.d)).estado, 'no-admite');
    assert.equal(b.llamadas.permiso, 0);
    assert.equal(b.llamadas.peticiones.length, 0);
  }
});

test('código aún no conocido por el servidor: se sincroniza primero y se reintenta una vez', async () => {
  const b = navegador({ respuestas: [{ status: 404, json: { error: 'codigo-desconocido' } }] });
  assert.equal((await activar(18, b.d)).ok, true);
  assert.equal(b.llamadas.sincronizar, 1);
  assert.equal(b.llamadas.peticiones.length, 2);
});

test('servidor con los avisos apagados (interruptor) o sin red: mensaje claro y nada guardado', async () => {
  const motivo = 'Los avisos diarios están desactivados por ahora. Prueba más adelante.';
  const b = navegador({ respuestas: [{ status: 503, json: { error: 'avisos-apagados', motivo } }] });
  const r = await activar(18, b.d);
  assert.equal(r.ok, false);
  assert.equal(r.texto, motivo);
  assert.equal(leerLocal(b.d.storage), null);
  const red = navegador();
  red.d.fetch = async () => { throw new TypeError('Failed to fetch'); };
  assert.match((await activar(18, red.d)).texto, /No hay conexión/);
});

test('desactivar: baja en el navegador, UNA petición de baja y estado apagado', async () => {
  const b = navegador();
  await activar(21, b.d);
  const r = await desactivar(b.d);
  assert.equal(r.estado, 'apagado');
  assert.equal(b.llamadas.unsubscribe, 1);
  assert.equal(b.llamadas.peticiones.length, 2);
  assert.deepEqual(b.llamadas.peticiones[1].cuerpo, { v: 1, endpoint: 'https://fcm.googleapis.com/fcm/send/aparato-1' });
  assert.equal(b.llamadas.peticiones[1].ruta, '/v1/avisos/baja');
  assert.equal(b.d.storage.getItem(CLAVE), null);
  // Sin red también se apaga (el servicio de push la rechazará y el servidor la borrará solo).
  const s = navegador();
  await activar(21, s.d);
  s.d.fetch = async () => { throw new TypeError('sin red'); };
  assert.equal((await desactivar(s.d)).estado, 'apagado');
  assert.equal(leerLocal(s.d.storage), null);
});

test('al abrir la app: NINGUNA petición si nada cambió; una si el navegador cambió la suscripción, la zona o hace 90 días', async () => {
  const b = navegador();
  await activar(18, b.d);
  const base = b.llamadas.peticiones.length;
  assert.equal(await comprobarAlAbrir({ ...b.d, ahora: T + 86400e3 }), 'al-dia');
  assert.equal(b.llamadas.peticiones.length, base, 'cero tráfico');
  assert.equal(b.llamadas.permiso, 1, 'al abrir nunca se pide permiso');
  // El navegador cambió la suscripción: se manda la nueva con la anterior para que el servidor la borre.
  b.cambiaSus();
  assert.equal(await comprobarAlAbrir(b.d), 'renovada');
  assert.equal(b.llamadas.peticiones.length, base + 1);
  assert.equal(b.llamadas.peticiones.at(-1).cuerpo.anterior, 'https://fcm.googleapis.com/fcm/send/aparato-1');
  assert.equal(b.llamadas.peticiones.at(-1).cuerpo.hora, 18);
  // La perdió del todo: se suscribe otra vez (sin pedir permiso: ya lo tenía).
  b.quitaSus();
  assert.equal(await comprobarAlAbrir(b.d), 'renovada');
  assert.equal(b.llamadas.permiso, 1);
  // Otra zona horaria.
  const viaje = { ...b.d, intl: { DateTimeFormat: () => ({ resolvedOptions: () => ({ timeZone: 'Atlantic/Canary' }) }) } };
  assert.equal(await comprobarAlAbrir(viaje), 'renovada');
  assert.equal(b.llamadas.peticiones.at(-1).cuerpo.zona, 'Atlantic/Canary');
  // Mucho tiempo sin abrirla: una renovación.
  const n = b.llamadas.peticiones.length;
  assert.equal(await comprobarAlAbrir({ ...viaje, ahora: T + RENOVAR_MS - 1 }), 'al-dia');
  assert.equal(await comprobarAlAbrir({ ...viaje, ahora: T + RENOVAR_MS + 1 }), 'renovada');
  assert.equal(b.llamadas.peticiones.length, n + 1);
  // El servidor cambió de clave VAPID: la suscripción vieja no vale; se vuelve a suscribir y se manda (una petición).
  const subs = b.llamadas.subscribe;
  assert.equal(await comprobarAlAbrir({ ...viaje, ahora: T + RENOVAR_MS + 2, clave: P256 }), 'renovada');
  assert.equal(b.llamadas.subscribe, subs + 1);
  assert.equal(b.llamadas.peticiones.length, n + 2);
});

test('al abrir: permiso retirado en el navegador → se apaga en local, sin red; sin avisos activados no hace nada', async () => {
  const b = navegador();
  await activar(18, b.d);
  b.Notification.permission = 'denied';
  const n = b.llamadas.peticiones.length;
  assert.equal(await comprobarAlAbrir(b.d), 'permiso-retirado');
  assert.equal(b.llamadas.peticiones.length, n);
  assert.equal(leerLocal(b.d.storage), null);
  const nuevo = navegador();
  assert.equal(await comprobarAlAbrir(nuevo.d), 'nada');
  assert.equal(nuevo.llamadas.peticiones.length + nuevo.llamadas.permiso + nuevo.llamadas.subscribe, 0);
});

test('zona horaria: la del aparato si está admitida; si no, la de Madrid', () => {
  const intl = (z) => ({ DateTimeFormat: () => ({ resolvedOptions: () => ({ timeZone: z }) }) });
  assert.deepEqual(zonaCliente(intl('Atlantic/Canary')), { zona: 'Atlantic/Canary', propia: true });
  assert.deepEqual(zonaCliente(intl('Asia/Tokyo')), { zona: 'Europe/Madrid', propia: false });
  assert.deepEqual(zonaCliente({}), { zona: 'Europe/Madrid', propia: false });
  assert.ok(ZONAS.includes('Europe/Madrid'));
});

test('calendario (.ics): evento diario de 10 minutos a la hora elegida, con alarma, generado en el aparato', () => {
  const ics = icsDiario(18, { ahora: Date.UTC(2026, 9, 12, 10), azar: () => 0.5 });
  assert.match(ics, /^BEGIN:VCALENDAR\r\nVERSION:2\.0\r\n/);
  assert.match(ics, /\r\nEND:VCALENDAR\r\n$/);
  assert.match(ics, /\r\nDTSTART:20261012T180000\r\n/, 'hora local «flotante»: sigue a las 18:00 en verano y en invierno');
  assert.match(ics, /\r\nRRULE:FREQ=DAILY\r\n/);
  assert.match(ics, /\r\nDURATION:PT10M\r\n/);
  assert.match(ics, /BEGIN:VALARM\r\nACTION:DISPLAY\r\nDESCRIPTION:Hoy toca un repaso de 10 minutos\r\nTRIGGER:PT0M\r\nEND:VALARM/);
  assert.match(ics, /\r\nUID:recordatorio-18-[a-z0-9]+@antoniofcano\.github\.io\r\n/);
  assert.match(ics, /\r\nDTSTAMP:20261012T100000Z\r\n/);
  assert.ok(!/\n(?<!\r\n)/.test(ics.replace(/\r\n/g, '')), 'solo CRLF');
  for (const l of ics.split('\r\n')) assert.ok(new TextEncoder().encode(l).length <= 75, l);
  assert.match(icsDiario(9, { ahora: Date.UTC(2026, 9, 12, 10) }), /DTSTART:20261012T090000/);
  assert.equal(nombreIcs(9), 'recordatorio-patron-09h.ics');
});

test('suscripción a JSON: endpoint y claves sin relleno; la clave de pruebas se puede poner en el navegador', () => {
  const s = jsonSuscripcion({ toJSON: () => ({ endpoint: 'https://fcm.googleapis.com/x', expirationTime: null, keys: { p256dh: `${P256}=`, auth: 'AAECAwQFBgcICQoLDA0ODw==' } }) });
  assert.deepEqual(s, { endpoint: 'https://fcm.googleapis.com/x', keys: { p256dh: P256, auth: 'AAECAwQFBgcICQoLDA0ODw' } });
  assert.equal(bytesDeB64u(CLAVE_PRUEBA).length, 65);
  const st = almacen();
  assert.equal(clavePublicaAvisos(st), VAPID_PUBLICA);
  st.setItem('nautica.avisos.vapid', CLAVE_PRUEBA);
  assert.equal(clavePublicaAvisos(st), CLAVE_PRUEBA);
  st.setItem('nautica.avisos.vapid', 'basura');
  assert.equal(clavePublicaAvisos(st), VAPID_PUBLICA);
});

test('tarjeta de Hoy: tras unos días de uso, solo donde hay avisos o en iPhone, respeta «Ahora no» y calla si ya está activo', async () => {
  const { tocaOfrecerAvisos, DIAS_ANTES_DE_OFRECER, SILENCIO_DIAS } = await import('../src/ui/recordatorio.js');
  const base = { modo: 'push', activo: false, diasConActividad: DIAS_ANTES_DE_OFRECER, silenciadaHasta: 0, ahora: 1000 };
  assert.equal(tocaOfrecerAvisos(base), true);
  assert.equal(tocaOfrecerAvisos({ ...base, modo: 'ios' }), true, 'iPhone sin instalar: el calendario');
  assert.equal(tocaOfrecerAvisos({ ...base, modo: 'sin-push' }), false, 'solo en Ajustes');
  assert.equal(tocaOfrecerAvisos({ ...base, modo: 'sin-servidor' }), false);
  assert.equal(tocaOfrecerAvisos({ ...base, activo: true }), false);
  assert.equal(tocaOfrecerAvisos({ ...base, diasConActividad: DIAS_ANTES_DE_OFRECER - 1 }), false);
  assert.equal(tocaOfrecerAvisos({ ...base, silenciadaHasta: 5000 }), false);
  assert.ok(SILENCIO_DIAS >= 14);
});

test('service worker: el texto, el icono y la etiqueta del aviso están aquí; al tocarlo abre la app en Hoy', async () => {
  const oyentes = {};
  const mostradas = [];
  const abiertas = [];
  const self = {
    addEventListener: (t, f) => { oyentes[t] = f; },
    registration: { scope: 'https://antoniofcano.github.io/mis-cosas/nautica/', showNotification: async (t, o) => { mostradas.push({ t, o }); } },
    clients: { matchAll: async () => [], openWindow: async (u) => { abiertas.push(u); }, claim: async () => {} },
  };
  const ctx = vm.createContext({ self, importScripts: () => { self.VERSION = 'x'; self.APP = []; self.DATOS = []; }, URL, caches: {}, fetch: () => {} });
  vm.runInContext(readFileSync(new URL('../sw.js', import.meta.url), 'utf8'), ctx);
  let espera;
  oyentes.push({ waitUntil: (p) => { espera = p; }, data: null });
  await espera;
  assert.equal(mostradas.length, 1);
  assert.equal(mostradas[0].t, 'Patrón');
  assert.equal(mostradas[0].o.body, 'Hoy toca un repaso de 10 minutos.');
  assert.equal(mostradas[0].o.tag, 'recordatorio-diario');
  assert.equal(mostradas[0].o.icon, 'icons/icono-192.png');
  let cerrada = false;
  oyentes.notificationclick({ notification: { close: () => { cerrada = true; } }, waitUntil: (p) => { espera = p; } });
  await espera;
  assert.ok(cerrada);
  assert.deepEqual(abiertas, ['https://antoniofcano.github.io/mis-cosas/nautica/#/']);
  // Con la app ya abierta: se enfoca esa ventana y va a Hoy.
  const pasos = [];
  self.clients.matchAll = async () => [{ url: 'https://antoniofcano.github.io/mis-cosas/nautica/#/per/temario', focus: async () => pasos.push('focus'), navigate: async (u) => pasos.push(u) }];
  oyentes.notificationclick({ notification: { close: () => {} }, waitUntil: (p) => { espera = p; } });
  await espera;
  assert.deepEqual(pasos, ['focus', 'https://antoniofcano.github.io/mis-cosas/nautica/#/']);
  assert.equal(abiertas.length, 1);
});
