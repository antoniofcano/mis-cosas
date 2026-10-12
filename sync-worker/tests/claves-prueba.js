// CLAVES DE PRUEBA, SOLO PARA LOS TESTS. No son las de producción ni sirven para nada fuera de las pruebas: la privada
// de producción solo existe como secreto de Cloudflare (VAPID_PRIVATE; ver nautica/docs/AVISOS.md).
import { deB64u, aB64u, derivar } from '../src/webpush.js';

/** Par VAPID de prueba (servidor). */
export const VAPID_PRUEBA = {
  publica: 'BJnX5BkVE0HLymIOfEpyWU3f_vpCt3XtGuZhir6EvybrpCb8tYThC4HHrZ7viMIQGfaoFO3CjGOzj9TRcv9n974',
  privada: 'dTLam81Kdup9QUfvbApnUudL0eet1THm63IvFQUsdKE',
};

/** Par ECDH de prueba de un «navegador» (para descifrar lo que manda el servidor en los tests). */
export const NAVEGADOR_PRUEBA = {
  publica: 'BOwqHlqhPhztXTzuDHNzI3VSNuSVQ9RSIHv3aXtnd0S8sboaDVCDlKgbj_mjrrv4G1KGjXaoOTpQ0iC-OPEWDdQ',
  privada: '8Su6B43msW0tgBJNJrGAO7S6uteBtjEzzR04aKosTMA',
  auth: 'AAECAwQFBgcICQoLDA0ODw', // 16 bytes 0..15
};

/** Suscripción de prueba con un endpoint de un servicio de push conocido. */
export const susPrueba = (n = 1, host = 'fcm.googleapis.com') => ({
  endpoint: `https://${host}/fcm/send/prueba-${n}-${'x'.repeat(40)}`,
  keys: { p256dh: NAVEGADOR_PRUEBA.publica, auth: NAVEGADOR_PRUEBA.auth },
});

/** Lado del navegador (RFC 8291): descifra un cuerpo aes128gcm con la clave privada del navegador. Solo pruebas. */
export async function descifrar(cuerpo, { publica, privada, auth } = NAVEGADOR_PRUEBA) {
  const b = new Uint8Array(cuerpo);
  const salt = b.slice(0, 16);
  const idlen = b[20];
  const asPublica = b.slice(21, 21 + idlen);
  const cifrado = b.slice(21 + idlen);
  const pub = deB64u(publica);
  const jwk = { kty: 'EC', crv: 'P-256', x: aB64u(pub.slice(1, 33)), y: aB64u(pub.slice(33)), d: privada };
  const priv = await crypto.subtle.importKey('jwk', jwk, { name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveBits']);
  const asClave = await crypto.subtle.importKey('raw', asPublica, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const ecdh = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: asClave }, priv, 256));
  const { cek, nonce } = await derivar({ ecdh, auth: deB64u(auth), uaPublica: pub, asPublica, salt });
  const k = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['decrypt']);
  const claro = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: nonce }, k, cifrado));
  let fin = claro.length - 1;
  while (fin >= 0 && claro[fin] === 0) fin -= 1; // relleno
  if (claro[fin] !== 2) throw new Error('falta el delimitador del último registro');
  return new TextDecoder().decode(claro.slice(0, fin));
}
