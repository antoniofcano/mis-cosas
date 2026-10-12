// Web Push (src/webpush.js): cifrado contra los vectores de la RFC 8291 (sección 5 y apéndice A), JWT de VAPID (RFC
// 8292) comprobado con un verificador independiente (node:crypto) y el envío (cabeceras, un solo intento). Sin red.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPublicKey, verify } from 'node:crypto';
import { aB64u, deB64u, derivar, cifrar, importarParEcdh, importarVapid, jwtVapid, enviar } from '../src/webpush.js';
import { generarVapid, ponerEnToml, ponerEnConfig } from '../scripts/vapid.mjs';
import { VAPID_PRUEBA, NAVEGADOR_PRUEBA, susPrueba, descifrar } from './claves-prueba.js';

const sinEspacios = (t) => t.replace(/\s+/g, '');
// RFC 8291, sección 5 y apéndice A (los valores llevan espacios en la RFC: se quitan).
const RFC = {
  texto: 'When I grow up, I want to be a watermelon',
  asPublica: sinEspacios('BP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIg Dll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A8'),
  asPrivada: 'yfWPiYE-n46HLnH0KqZOF1fJJU3MYrct3AELtAQ-oRw',
  uaPublica: sinEspacios('BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV- JvLexhqUzORcx aOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4'),
  uaPrivada: 'q1dXpw3UpT5VOmu_cf_v6ih07Aems3njxI-JWgLcM94',
  salt: 'DGv6ra1nlYgDCS1FRnbzlw',
  auth: 'BTBZMqHH6r4Tts7J_aSIgg',
  ecdh: 'kyrL1jIIOHEzg3sM2ZWRHDRB62YACZhhSlknJ672kSs',
  prkKey: 'Snr3JMxaHVDXHWJn5wdC52WjpCtd2EIEGBykDcZW32k',
  keyInfo: sinEspacios(`V2ViUHVzaDogaW5mbwAEJXGyvs3942BVG q8e0PTNNmwR zr5VX4m8t7GGpTM5FzFo7OLr4BhZe9MEebhuPI-OztV3
    ylkYfpJGmQ22ggCLDgT-M_SrDepxkU21WCP3O1SUj0Ew bZIHMtu5pZpTKGSCIA5Zent7wmC6HCJ5mFgJkuk5cwAv MBKiiujwa7t45ewP`),
  ikm: 'S4lYMb_L0FxCeq0WhDx813KgSYqU26kOyzWUdsXYyrg',
  prk: '09_eUZGrsvxChDCGRCdkLiDXrReGOEVeSCdCcPBSJSc',
  cek: 'oIhVW04MRdy2XN9CiKLxTg',
  nonce: '4h_95klXJ5E_qnoN',
  cuerpo: sinEspacios(`DGv6ra1nlYgDCS1FRnbzlwAAEABBBP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27ml
    mlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A_yl95bQpu6cVPT
    pK4Mqgkf1CXztLVBSt2Ks3oZwbuwXPXLWyouBWLVWGNWQexSgSxsj_Qulcy4a-fN`),
};

test('base64url: ida y vuelta, sin relleno, y rechazo de lo que no lo es', () => {
  for (let n = 0; n < 40; n += 1) {
    const b = Uint8Array.from({ length: n }, (_, i) => (i * 37 + n) & 255);
    const t = aB64u(b);
    assert.doesNotMatch(t, /[=+/]/);
    assert.deepEqual(deB64u(t), b);
  }
  assert.throws(() => deB64u('ab+c'));
  assert.throws(() => deB64u('a'));
});

test('RFC 8291, apéndice A: todos los valores intermedios', async () => {
  const d = await derivar({ ecdh: deB64u(RFC.ecdh), auth: deB64u(RFC.auth), uaPublica: deB64u(RFC.uaPublica), asPublica: deB64u(RFC.asPublica), salt: deB64u(RFC.salt) });
  assert.equal(aB64u(d.prkKey), RFC.prkKey);
  assert.equal(aB64u(d.keyInfo), RFC.keyInfo);
  assert.equal(aB64u(d.ikm), RFC.ikm);
  assert.equal(aB64u(d.prk), RFC.prk);
  assert.equal(aB64u(d.cek), RFC.cek);
  assert.equal(aB64u(d.nonce), RFC.nonce);
});

test('RFC 8291, sección 5: el cuerpo cifrado es exactamente el del ejemplo', async () => {
  const claves = await importarParEcdh(RFC.asPublica, RFC.asPrivada);
  const cuerpo = await cifrar(RFC.texto, { p256dh: RFC.uaPublica, auth: RFC.auth }, { salt: deB64u(RFC.salt), claves });
  // La RFC pone «Content-Length: 145», pero su propio cuerpo mide 144 (86 de cabecera + 41 + 1 + 16 de etiqueta).
  assert.equal(cuerpo.length, 144);
  assert.equal(aB64u(cuerpo), RFC.cuerpo);
  // Y el lado del navegador lo descifra con su clave privada.
  assert.equal(await descifrar(cuerpo, { publica: RFC.uaPublica, privada: RFC.uaPrivada, auth: RFC.auth }), RFC.texto);
});

test('cifrado normal: sal y claves nuevas en cada mensaje, y el navegador lo descifra', async () => {
  const sus = susPrueba().keys;
  const a = await cifrar('{"v":1}', sus);
  const b = await cifrar('{"v":1}', sus);
  assert.notDeepEqual(a.slice(0, 16), b.slice(0, 16), 'sal distinta');
  assert.notDeepEqual(a.slice(21, 86), b.slice(21, 86), 'clave efímera distinta');
  assert.deepEqual([...a.slice(16, 21)], [0, 0, 16, 0, 65], 'rs = 4096 e idlen = 65');
  assert.equal(a.length, 86 + 7 + 1 + 16, 'cabecera + texto + delimitador + etiqueta');
  assert.equal(await descifrar(a), '{"v":1}');
  await assert.rejects(cifrar('x', { p256dh: sus.p256dh, auth: 'AAAA' }));
  await assert.rejects(cifrar('x', { p256dh: `B${'A'.repeat(86)}`, auth: sus.auth }), 'un punto que no está en la curva');
});

test('VAPID: JWT ES256 que valida un verificador independiente (node:crypto), con aud, exp y sub', async () => {
  const clave = await importarVapid(VAPID_PRUEBA.publica, VAPID_PRUEBA.privada);
  const exp = 1_800_000_000;
  const jwt = await jwtVapid(clave, { aud: 'https://fcm.googleapis.com', exp, sub: 'https://antoniofcano.github.io/mis-cosas/nautica/' });
  const [c, p, f] = jwt.split('.');
  assert.deepEqual(JSON.parse(new TextDecoder().decode(deB64u(c))), { typ: 'JWT', alg: 'ES256' });
  assert.deepEqual(JSON.parse(new TextDecoder().decode(deB64u(p))), { aud: 'https://fcm.googleapis.com', exp, sub: 'https://antoniofcano.github.io/mis-cosas/nautica/' });
  assert.equal(deB64u(f).length, 64, 'firma r‖s de 64 bytes (JWS), no DER');
  const pub = deB64u(VAPID_PRUEBA.publica);
  const clavePublica = createPublicKey({ key: { kty: 'EC', crv: 'P-256', x: aB64u(pub.slice(1, 33)), y: aB64u(pub.slice(33)) }, format: 'jwk' });
  assert.ok(verify('sha256', Buffer.from(`${c}.${p}`), { key: clavePublica, dsaEncoding: 'ieee-p1363' }, Buffer.from(deB64u(f))));
  // Otra clave no la valida; y cambiar un byte del cuerpo, tampoco.
  const otra = await generarVapid();
  const ot = deB64u(otra.publica);
  const otraPublica = createPublicKey({ key: { kty: 'EC', crv: 'P-256', x: aB64u(ot.slice(1, 33)), y: aB64u(ot.slice(33)) }, format: 'jwk' });
  assert.ok(!verify('sha256', Buffer.from(`${c}.${p}`), { key: otraPublica, dsaEncoding: 'ieee-p1363' }, Buffer.from(deB64u(f))));
  assert.ok(!verify('sha256', Buffer.from(`${c}.${p}x`), { key: clavePublica, dsaEncoding: 'ieee-p1363' }, Buffer.from(deB64u(f))));
  await assert.rejects(importarVapid(VAPID_PRUEBA.publica, 'corta'));
});

test('npm run vapid: par válido (65 y 32 bytes) y la pública se escribe en wrangler.toml y config.js', async () => {
  const { publica, privada } = await generarVapid();
  assert.equal(deB64u(publica).length, 65);
  assert.equal(deB64u(privada).length, 32);
  await importarVapid(publica, privada);
  assert.equal(ponerEnToml('a\nVAPID_PUBLIC = ""\nb', publica), `a\nVAPID_PUBLIC = "${publica}"\nb`);
  assert.equal(ponerEnConfig("x\nexport const VAPID_PUBLICA = '';\n", publica), `x\nexport const VAPID_PUBLICA = '${publica}';\n`);
});

test('enviar: cabeceras de Web Push, cuerpo cifrado, topic y un solo intento (sin reintentos)', async () => {
  const llamadas = [];
  const f = async (url, init) => { llamadas.push({ url, init }); return new Response(null, { status: 503 }); };
  const sus = { ...susPrueba(), p256dh: NAVEGADOR_PRUEBA.publica, auth: NAVEGADOR_PRUEBA.auth };
  const estado = await enviar(sus, '{"v":1}', { jwt: 'a.b.c', publica: VAPID_PRUEBA.publica, fetch: f, ttl: 60, topic: 'recordatorio' });
  assert.equal(estado, 503);
  assert.equal(llamadas.length, 1);
  const h = llamadas[0].init.headers;
  assert.equal(h.authorization, `vapid t=a.b.c, k=${VAPID_PRUEBA.publica}`);
  assert.equal(h['content-encoding'], 'aes128gcm');
  assert.equal(h.ttl, '60');
  assert.equal(h.topic, 'recordatorio');
  assert.equal(await descifrar(llamadas[0].init.body), '{"v":1}');
  assert.equal(await enviar(sus, 'x', { jwt: 'a', publica: 'b', fetch: async () => { throw new Error('sin red'); } }), 0);
});
