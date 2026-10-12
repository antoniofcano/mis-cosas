// El recordatorio diario (docs/AVISOS.md): qué se puede ofrecer en este aparato (aviso por push o, si no, un evento
// diario en el calendario), activar, cambiar de hora y desactivar, y la comprobación al abrir la app. Sin DOM: el
// navegador (navigator, window, almacenamiento, red) entra por parámetro para poder probarlo con APIs simuladas.
//
// Tráfico: UNA petición al activar o cambiar de hora y UNA al desactivar. Al abrir la app solo se mira en local si el
// navegador cambió la suscripción (o la zona horaria); solo entonces se vuelve a mandar. Nada de sondeos.

import { estaInstalada, esIOS } from './persistencia.js';
import { HORAS, HORA_DEFECTO, ZONA_DEFECTO, zonaValida, horaTexto } from './sync/avisos.js';
import { TIMEOUT_MS } from './sync/config.js';

export { HORAS, HORA_DEFECTO, horaTexto };
export const CLAVE = 'nautica.avisos.v1';
const DIA = 864e5;
/**
 * Al abrir, si la última alta tiene más de esto, se renueva (una petición, como mucho cada 90 días): el servidor borra
 * las suscripciones sin renovar en 120 días cuyo alumno tampoco ha estudiado en ese tiempo.
 */
export const RENOVAR_MS = 90 * DIA;
/** Dirección pública de la app (el calendario la lleva para abrirla). */
export const URL_APP = 'https://antoniofcano.github.io/mis-cosas/nautica/';

/** Lo guardado en este aparato: { hora, zona, endpoint, t } o null (avisos apagados). */
export function leerLocal(storage = globalThis.localStorage) {
  try {
    const x = JSON.parse(storage?.getItem(CLAVE) ?? 'null');
    return x && HORAS.includes(x.hora) && typeof x.endpoint === 'string' ? x : null;
  } catch { return null; }
}
function guardarLocal(storage, x) { try { if (x) storage?.setItem(CLAVE, JSON.stringify(x)); else storage?.removeItem(CLAVE); } catch { /* sin almacenamiento */ } }

/** Zona horaria del aparato (IANA). Si el servidor no la admite, se usa la de Madrid. */
export function zonaCliente(intl = globalThis.Intl) {
  let z = null;
  try { z = intl.DateTimeFormat().resolvedOptions().timeZone; } catch { /* sin Intl */ }
  return zonaValida(z) ? { zona: z, propia: true } : { zona: ZONA_DEFECTO, propia: false };
}

/**
 * ¿Qué se ofrece en este aparato?
 *  - 'push': avisos del navegador (hay Notification, PushManager y service worker, y clave del servidor);
 *  - 'ios': iPhone/iPad sin la app instalada (Safari solo deja avisar a la app instalada): calendario;
 *  - 'sin-push': el navegador no tiene avisos: calendario;
 *  - 'sin-servidor': el servidor aún no tiene avisos (sin clave): calendario.
 */
export function modoAvisos({ nav = globalThis.navigator, win = globalThis, clave = '' } = {}) {
  if (esIOS(nav) && !estaInstalada(nav, win)) return 'ios';
  if (!win?.Notification || !win?.PushManager || !nav?.serviceWorker) return 'sin-push';
  if (!clave) return 'sin-servidor';
  return 'push';
}

/** Permiso de avisos del navegador: 'granted' | 'denied' | 'default' | null (sin avisos). */
export const permisoAvisos = (win = globalThis) => win?.Notification?.permission ?? null;

/**
 * Estado en una frase, sin jerga. tipo: 'activo' | 'apagado' | 'no-admite' | 'denegado'.
 * @returns {{ tipo: string, texto: string }}
 */
export function estadoAvisos({ modo, permiso, local }) {
  if (modo === 'push' && permiso === 'denied') return { tipo: 'denegado', texto: 'Permiso denegado: puedes cambiarlo en los ajustes del navegador' };
  if (modo === 'push' && local && permiso === 'granted') return { tipo: 'activo', texto: `Te avisaremos a las ${horaTexto(local.hora)}` };
  if (modo === 'push') return { tipo: 'apagado', texto: 'Avisos desactivados' };
  if (modo === 'sin-push') return { tipo: 'no-admite', texto: 'Tu navegador no admite avisos' };
  return { tipo: 'no-admite', texto: modo === 'ios' ? 'En iPhone, los avisos solo llegan con la app instalada' : 'Avisos desactivados' };
}

/** base64url → bytes (la clave del servidor para `subscribe`). */
export function bytesDeB64u(t) {
  const s = atob(t.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (t.length % 4)) % 4));
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
}
const sinRelleno = (t) => String(t ?? '').replace(/=+$/, '');
/** Lo que se manda de una suscripción: endpoint y claves (sin relleno). */
export function jsonSuscripcion(sus) {
  const j = sus.toJSON?.() ?? sus;
  return { endpoint: j.endpoint, keys: { p256dh: sinRelleno(j.keys?.p256dh), auth: sinRelleno(j.keys?.auth) } };
}
/** ¿La suscripción es de esta clave del servidor? (si cambió la clave, hay que suscribirse de nuevo). */
function mismaClave(sus, clave) {
  const k = sus.options?.applicationServerKey;
  if (!k) return true; // el navegador no lo dice: se da por buena
  const a = new Uint8Array(k);
  return a.length === clave.length && a.every((b, i) => b === clave[i]);
}

/** El registro del service worker (con tiempo máximo: en desarrollo puede no haberlo). */
async function registroSw(nav, ms = 10e3) {
  const sw = nav?.serviceWorker;
  if (!sw) return null;
  const ya = await sw.getRegistration?.().catch(() => null);
  if (ya) return ya;
  return Promise.race([sw.ready, new Promise((r) => setTimeout(() => r(null), ms))]).catch(() => null);
}

/** POST al servidor con tiempo máximo. Devuelve { ok, status, json } (status 0: sin red). */
async function post(d, ruta, cuerpo, codigo = null) {
  const f = d.fetch ?? globalThis.fetch?.bind(globalThis);
  const ctl = typeof AbortController === 'function' ? new AbortController() : null;
  const t = setTimeout(() => ctl?.abort(), TIMEOUT_MS);
  try {
    const headers = { 'content-type': 'application/json' };
    if (codigo) headers.authorization = `Bearer ${codigo}`;
    const r = await f(`${d.url}${ruta}`, { method: 'POST', headers, body: JSON.stringify(cuerpo), signal: ctl?.signal });
    let json = null;
    try { json = await r.json(); } catch { /* sin cuerpo */ }
    return { ok: r.ok, status: r.status, json };
  } catch {
    return { ok: false, status: 0, json: null };
  } finally { clearTimeout(t); }
}

/** Texto de un fallo del servidor, en sencillo. */
function textoFallo(r) {
  if (r.status === 0) return 'No hay conexión. Prueba otra vez cuando tengas internet.';
  if (r.json?.error === 'avisos-apagados' || r.json?.error === 'avisos-sin-configurar' || r.json?.error === 'tope-avisos') return r.json.motivo;
  if (r.json?.error === 'limite') return 'Demasiados intentos. Espera un rato y vuelve a probar.';
  return 'No se han podido activar los avisos ahora. Prueba otra vez en un rato.';
}

/**
 * Activa el aviso diario a la hora `hora` (o la cambia). Pide permiso al navegador SOLO si aún no lo ha dado: hay que
 * llamarla desde un toque del alumno.
 * @param {number} hora
 * @param {object} d  { nav, win, storage, fetch, url, clave, codigo: () => string, sincronizar: () => Promise, intl, ahora }
 * @returns {Promise<{ ok: boolean, estado: string, texto?: string }>}
 */
export async function activar(hora, d) {
  const { nav = globalThis.navigator, win = globalThis, storage = globalThis.localStorage, ahora = Date.now() } = d;
  if (!HORAS.includes(hora)) return { ok: false, estado: 'error', texto: 'Hora no válida.' };
  if (modoAvisos({ nav, win, clave: d.clave }) !== 'push') return { ok: false, estado: 'no-admite' };
  let permiso = permisoAvisos(win);
  if (permiso === 'denied') return { ok: false, estado: 'denegado' };
  if (permiso !== 'granted') {
    try { permiso = await win.Notification.requestPermission(); } catch { permiso = 'default'; }
  }
  if (permiso === 'denied') return { ok: false, estado: 'denegado' };
  if (permiso !== 'granted') return { ok: false, estado: 'apagado', texto: 'No has dado permiso. Vuelve a elegir la hora para intentarlo.' };

  let sus;
  try {
    const reg = await registroSw(nav);
    if (!reg?.pushManager) return { ok: false, estado: 'no-admite' };
    const clave = bytesDeB64u(d.clave);
    sus = await reg.pushManager.getSubscription();
    if (sus && !mismaClave(sus, clave)) { await sus.unsubscribe().catch(() => {}); sus = null; }
    if (!sus) sus = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: clave });
  } catch {
    return { ok: false, estado: 'error', texto: 'Este navegador no ha dejado activar los avisos.' };
  }
  const { zona } = zonaCliente(d.intl);
  const antes = leerLocal(storage);
  const s = jsonSuscripcion(sus);
  const cuerpo = { v: 1, sus: s, zona, hora, ...(antes?.endpoint && antes.endpoint !== s.endpoint ? { anterior: antes.endpoint } : {}) };
  let r = await post(d, '/v1/avisos', cuerpo, d.codigo());
  if (r.json?.error === 'codigo-desconocido' && d.sincronizar) {
    // El código de este aparato aún no ha llegado al servidor (recién creado): primero se sincroniza.
    await d.sincronizar();
    r = await post(d, '/v1/avisos', cuerpo, d.codigo());
  }
  if (!r.ok) return { ok: false, estado: 'error', texto: textoFallo(r) };
  guardarLocal(storage, { hora, zona, endpoint: s.endpoint, t: ahora });
  return { ok: true, estado: 'activo' };
}

/** Desactiva: baja en el navegador y UNA petición para borrarla del servidor (si falla la red, el servicio de push la
 * rechazará y el servidor la borrará solo en el próximo aviso). */
export async function desactivar(d) {
  const { nav = globalThis.navigator, storage = globalThis.localStorage } = d;
  const antes = leerLocal(storage);
  guardarLocal(storage, null);
  let sus = null;
  try { sus = await (await nav?.serviceWorker?.getRegistration?.())?.pushManager?.getSubscription(); } catch { sus = null; }
  const endpoint = sus?.endpoint ?? antes?.endpoint;
  try { await sus?.unsubscribe(); } catch { /* ya no estaba */ }
  if (endpoint) await post(d, '/v1/avisos/baja', { v: 1, endpoint });
  return { ok: true, estado: 'apagado' };
}

/**
 * Al abrir la app: comprobación local, sin red, salvo que algo haya cambiado.
 * @returns {Promise<'nada'|'al-dia'|'permiso-retirado'|'renovada'|'error'>}
 */
export async function comprobarAlAbrir(d) {
  const { nav = globalThis.navigator, win = globalThis, storage = globalThis.localStorage, ahora = Date.now() } = d;
  const antes = leerLocal(storage);
  if (!antes || modoAvisos({ nav, win, clave: d.clave }) !== 'push') return 'nada';
  if (permisoAvisos(win) !== 'granted') { guardarLocal(storage, null); return 'permiso-retirado'; } // el servicio de push la rechazará (410) y el servidor la borrará
  let sus = null;
  try {
    const reg = await nav.serviceWorker.getRegistration?.();
    if (!reg?.pushManager) return 'nada';
    sus = await reg.pushManager.getSubscription();
  } catch { return 'nada'; }
  const igual = sus && sus.endpoint === antes.endpoint && mismaClave(sus, bytesDeB64u(d.clave));
  if (igual && zonaCliente(d.intl).zona === antes.zona && ahora - (antes.t ?? 0) < RENOVAR_MS) return 'al-dia';
  // El navegador la cambió (o la perdió), el servidor cambió de clave, el aparato cambió de zona o hace mucho de la
  // última alta: se manda otra vez (activar() vuelve a suscribirse si la clave no coincide).
  const r = await activar(antes.hora, d);
  return r.ok ? 'renovada' : 'error';
}

// --- Calendario (.ics): para quien no puede recibir avisos (iPhone sin instalar, navegadores sin push) -------------

const dosCifras = (n) => String(n).padStart(2, '0');
const fechaIcs = (d) => `${d.getFullYear()}${dosCifras(d.getMonth() + 1)}${dosCifras(d.getDate())}`;
const utcIcs = (ms) => new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
/** Parte una línea en trozos de 75 octetos como pide RFC 5545 (las líneas de aquí son cortas, pero por si acaso). */
function plegar(linea) {
  const bytes = new TextEncoder().encode(linea);
  if (bytes.length <= 75) return linea;
  const partes = [];
  let actual = '';
  for (const ch of linea) {
    if (new TextEncoder().encode(actual + ch).length > (partes.length ? 74 : 75)) { partes.push(actual); actual = ''; }
    actual += ch;
  }
  partes.push(actual);
  return partes.join('\r\n ');
}

/**
 * Evento diario de 10 minutos a la hora `hora` (hora local del aparato, sin zona: «flotante», así sigue siendo a las
 * 18:00 aunque cambie la hora en verano o se viaje) con una alarma a esa hora. Se genera aquí, sin servidor.
 */
export function icsDiario(hora, { ahora = Date.now(), azar = Math.random } = {}) {
  const hoy = new Date(ahora);
  const uid = `recordatorio-${hora}-${Math.floor(azar() * 1e12).toString(36)}@antoniofcano.github.io`;
  const lineas = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Patron//Recordatorio diario//ES', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${utcIcs(ahora)}`,
    `DTSTART:${fechaIcs(hoy)}T${dosCifras(hora)}0000`,
    'DURATION:PT10M',
    'RRULE:FREQ=DAILY',
    'SUMMARY:Repaso de Patrón (10 minutos)',
    `DESCRIPTION:Hoy toca un repaso de 10 minutos.\\n${URL_APP}`,
    `URL:${URL_APP}`,
    'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Hoy toca un repaso de 10 minutos', 'TRIGGER:PT0M', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ];
  return `${lineas.map(plegar).join('\r\n')}\r\n`;
}

export const nombreIcs = (hora) => `recordatorio-patron-${dosCifras(hora)}h.ics`;
