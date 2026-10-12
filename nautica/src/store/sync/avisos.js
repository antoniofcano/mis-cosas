// El recordatorio diario (docs/AVISOS.md): lo que comparten la app y el servidor (sync-worker importa este módulo al
// empaquetarse, como operaciones.js). Horas que se pueden elegir, zonas horarias admitidas y la validación estricta de
// una suscripción de push (dominio conocido, claves con su longitud exacta). Sin DOM ni red.

/** Horas a elegir (hora local del alumno, en punto) y la que se propone. */
export const HORAS = [9, 13, 18, 21];
export const HORA_DEFECTO = 18;
export const horaTexto = (h) => `${h}:00`;

/**
 * Zonas horarias admitidas: España y alrededores, y las grandes de Hispanoamérica (todas con desfase de horas
 * enteras: el servidor mira una vez por hora, en punto). Una zona que no esté aquí se cambia por la de Madrid.
 */
export const ZONAS = [
  'Europe/Madrid', 'Atlantic/Canary', 'Africa/Ceuta', 'Europe/Lisbon', 'Atlantic/Madeira', 'Atlantic/Azores',
  'Europe/London', 'Europe/Dublin', 'Europe/Paris', 'Europe/Brussels', 'Europe/Amsterdam', 'Europe/Berlin',
  'Europe/Zurich', 'Europe/Rome', 'Europe/Andorra', 'Europe/Gibraltar', 'Africa/Casablanca',
  'America/Mexico_City', 'America/Bogota', 'America/Lima', 'America/Caracas', 'America/Santiago',
  'America/Argentina/Buenos_Aires', 'America/Montevideo', 'America/New_York', 'UTC',
];
export const ZONA_DEFECTO = 'Europe/Madrid';
export const zonaValida = (z) => typeof z === 'string' && ZONAS.includes(z);

/** Servicios de push conocidos (Chrome/Android/Edge nuevo, Firefox, Safari/iPhone, Edge con WNS). */
const HOSTS = ['fcm.googleapis.com', 'updates.push.services.mozilla.com', 'web.push.apple.com'];
const SUFIJOS = ['.notify.windows.com'];
export const hostPushConocido = (host) => HOSTS.includes(host) || SUFIJOS.some((s) => host.endsWith(s) && /^[a-z0-9-]+$/.test(host.slice(0, -s.length)));

export const MAX_ENDPOINT = 1024;
const B64U = /^[A-Za-z0-9_-]+$/;

/**
 * Valida una suscripción `{ endpoint, keys: { p256dh, auth } }` (la de PushSubscription.toJSON(), sin relleno).
 * @returns {string|null}  el motivo si no vale; null si vale
 */
export function validarSuscripcion(s) {
  if (!s || typeof s !== 'object' || Array.isArray(s)) return 'forma';
  if (typeof s.endpoint !== 'string' || s.endpoint.length > MAX_ENDPOINT) return 'endpoint';
  let u;
  try { u = new URL(s.endpoint); } catch { return 'endpoint'; }
  if (u.protocol !== 'https:' || u.port || u.username || u.password || u.hash || !hostPushConocido(u.hostname)) return 'endpoint';
  const k = s.keys;
  if (!k || typeof k !== 'object') return 'claves';
  // p256dh: 65 bytes (punto sin comprimir, empieza por 0x04 → «B» en base64url) = 87 caracteres; auth: 16 bytes = 22.
  if (typeof k.p256dh !== 'string' || k.p256dh.length !== 87 || !B64U.test(k.p256dh) || k.p256dh[0] !== 'B') return 'claves';
  if (typeof k.auth !== 'string' || k.auth.length !== 22 || !B64U.test(k.auth)) return 'claves';
  return null;
}
