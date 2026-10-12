// Web Push mínimo con el WebCrypto del propio Worker, sin dependencias (docs/AVISOS.md en nautica/):
//   - cifrado del mensaje (RFC 8291, «aes128gcm» de RFC 8188, un solo registro);
//   - identificación del servidor ante el servicio de push (RFC 8292, VAPID: un JWT firmado con ES256).
// Probado contra los vectores de la RFC 8291 (apéndice A) y con un verificador de firmas independiente
// (tests/webpush.test.js). Unas 150 líneas: preferible a una librería que arrastraría polyfills de Node.

const subtle = globalThis.crypto.subtle;
const enc = new TextEncoder();

/** Bytes → base64url sin relleno. */
export function aB64u(bytes) {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** base64url (sin relleno) → bytes. Lanza si no es base64url. */
export function deB64u(texto) {
  if (typeof texto !== 'string' || !/^[A-Za-z0-9_-]*$/.test(texto) || texto.length % 4 === 1) throw new Error('base64url no válido');
  const s = atob(texto.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (texto.length % 4)) % 4));
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
}

const une = (...partes) => {
  const out = new Uint8Array(partes.reduce((n, p) => n + p.length, 0));
  let i = 0;
  for (const p of partes) { out.set(p, i); i += p.length; }
  return out;
};

async function hmac(clave, datos) {
  const k = await subtle.importKey('raw', clave, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await subtle.sign('HMAC', k, datos));
}

/** Clave pública P-256 sin comprimir (65 bytes, 0x04‖x‖y) → JWK (con `d` si se da la privada). */
function jwkP256(publica, privada = null) {
  if (publica.length !== 65 || publica[0] !== 4) throw new Error('clave pública P-256 no válida');
  const jwk = { kty: 'EC', crv: 'P-256', x: aB64u(publica.slice(1, 33)), y: aB64u(publica.slice(33)), ext: true };
  if (privada) jwk.d = aB64u(privada);
  return jwk;
}

/** Importa la clave pública del navegador (p256dh) para ECDH. Lanza si no es un punto válido de la curva. */
export const importarPublicaEcdh = (publica) => subtle.importKey('jwk', jwkP256(publica), { name: 'ECDH', namedCurve: 'P-256' }, true, []);

/**
 * Derivaciones de RFC 8291 §3.3–3.4 (HKDF de un bloque = HMAC). Se exportan para probarlas con los valores
 * intermedios del apéndice A.
 */
export async function derivar({ ecdh, auth, uaPublica, asPublica, salt }) {
  const prkKey = await hmac(auth, ecdh);
  const keyInfo = une(enc.encode('WebPush: info\0'), uaPublica, asPublica);
  const ikm = await hmac(prkKey, une(keyInfo, [1]));
  const prk = await hmac(salt, ikm);
  const cek = (await hmac(prk, enc.encode('Content-Encoding: aes128gcm\0\x01'))).slice(0, 16);
  const nonce = (await hmac(prk, enc.encode('Content-Encoding: nonce\0\x01'))).slice(0, 12);
  return { prkKey, keyInfo, ikm, prk, cek, nonce };
}

/**
 * Cifra `carga` (texto o bytes) para una suscripción: devuelve el cuerpo listo para mandar (cabecera de 86 bytes +
 * texto cifrado). `p256dh` y `auth` son los de la suscripción (base64url). `salt` y `claves` (par ECDH del servidor)
 * solo se pasan en las pruebas: si no, se generan nuevos para cada mensaje, como pide la RFC.
 */
export async function cifrar(carga, { p256dh, auth }, { salt = null, claves = null } = {}) {
  const uaPublica = deB64u(p256dh);
  const secreto = deB64u(auth);
  if (secreto.length !== 16) throw new Error('auth no válido');
  const uaClave = await importarPublicaEcdh(uaPublica);
  const par = claves ?? await subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const asPublica = new Uint8Array(await subtle.exportKey('raw', par.publicKey));
  const ecdh = new Uint8Array(await subtle.deriveBits({ name: 'ECDH', public: uaClave }, par.privateKey, 256));
  const sal = salt ?? crypto.getRandomValues(new Uint8Array(16));
  const { cek, nonce } = await derivar({ ecdh, auth: secreto, uaPublica, asPublica, salt: sal });
  const texto = typeof carga === 'string' ? enc.encode(carga) : carga;
  if (texto.length > 3993) throw new Error('mensaje demasiado largo'); // un registro de 4096 bytes
  const clave = await subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const cifrado = new Uint8Array(await subtle.encrypt({ name: 'AES-GCM', iv: nonce }, clave, une(texto, [2]))); // 0x02: último registro, sin relleno
  const rs = new Uint8Array([0, 0, 0x10, 0]); // 4096
  return une(sal, rs, [asPublica.length], asPublica, cifrado);
}

/** Importa una clave privada ECDH conocida (solo pruebas: vectores de la RFC). */
export async function importarParEcdh(publicaB64, privadaB64) {
  const publica = deB64u(publicaB64);
  const privateKey = await subtle.importKey('jwk', jwkP256(publica, deB64u(privadaB64)), { name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveBits']);
  return { privateKey, publicKey: await importarPublicaEcdh(publica) };
}

/** Clave VAPID para firmar (ES256), a partir de la pública (65 bytes) y la privada (32 bytes) en base64url. */
export async function importarVapid(publicaB64, privadaB64) {
  const privada = deB64u(privadaB64);
  if (privada.length !== 32) throw new Error('clave privada VAPID no válida');
  return subtle.importKey('jwk', jwkP256(deB64u(publicaB64), privada), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
}

/**
 * JWT de VAPID (RFC 8292 §2): `aud` = origen del servicio de push, `exp` en segundos (máximo 24 h) y `sub` = cómo
 * contactar con quien envía (aquí, la dirección pública de la app). La firma ES256 de WebCrypto ya es r‖s (64 bytes),
 * lo que pide JWS.
 */
export async function jwtVapid(clave, { aud, exp, sub }) {
  const cab = aB64u(enc.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const cuerpo = aB64u(enc.encode(JSON.stringify({ aud, exp, sub })));
  const firma = new Uint8Array(await subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, clave, enc.encode(`${cab}.${cuerpo}`)));
  return `${cab}.${cuerpo}.${aB64u(firma)}`;
}

/**
 * Manda un mensaje a una suscripción, UNA vez (sin reintentos). Devuelve el estado HTTP (0 si la red falla).
 * @param {{ endpoint: string, p256dh: string, auth: string }} sus
 * @param {{ jwt: string, publica: string, fetch?: Function, ttl?: number, topic?: string, urgencia?: string }} o
 */
export async function enviar(sus, carga, { jwt, publica, fetch: f = globalThis.fetch, ttl = 4 * 3600, topic = null, urgencia = 'normal' }) {
  const cuerpo = await cifrar(carga, sus);
  const cabeceras = {
    authorization: `vapid t=${jwt}, k=${publica}`,
    'content-encoding': 'aes128gcm',
    'content-type': 'application/octet-stream',
    ttl: String(ttl),
    urgency: urgencia,
  };
  if (topic) cabeceras.topic = topic; // un aviso sin entregar se sustituye por el siguiente (no se apilan)
  try {
    const r = await f(sus.endpoint, { method: 'POST', headers: cabeceras, body: cuerpo });
    return r.status;
  } catch {
    return 0;
  }
}
