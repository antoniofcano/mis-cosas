// Genera el par de claves VAPID del recordatorio diario (nautica/docs/AVISOS.md).
//
//   npm run vapid --silent                        la PRIVADA sale sola por la salida estándar; lo demás, por stderr
//   npm run vapid --silent -- --escribir | npx wrangler secret put VAPID_PRIVATE
//       además escribe la PÚBLICA en wrangler.toml (VAPID_PUBLIC) y en nautica/src/store/sync/config.js
//       (VAPID_PUBLICA), y la privada va directa a Cloudflare sin pasar por la pantalla ni por ningún archivo.
//
// La privada NUNCA se escribe en un archivo del repositorio. Si se pierde, se genera otro par: los aparatos con el
// aviso activado dejan de recibirlo hasta que el alumno lo vuelva a activar (la app lo detecta sola al abrirse).
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { aB64u } from '../src/webpush.js';

/** Un par nuevo: { publica (65 bytes, base64url), privada (32 bytes, base64url) }. */
export async function generarVapid() {
  const par = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const publica = aB64u(new Uint8Array(await crypto.subtle.exportKey('raw', par.publicKey)));
  const { d } = await crypto.subtle.exportKey('jwk', par.privateKey);
  return { publica, privada: d };
}

/** Sustituye la clave pública en el texto de wrangler.toml y en el de config.js. */
export const ponerEnToml = (texto, publica) => texto.replace(/^VAPID_PUBLIC = ".*"$/m, `VAPID_PUBLIC = "${publica}"`);
export const ponerEnConfig = (texto, publica) => texto.replace(/^export const VAPID_PUBLICA = '.*';$/m, `export const VAPID_PUBLICA = '${publica}';`);

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { publica, privada } = await generarVapid();
  const err = (t) => process.stderr.write(`${t}\n`);
  if (process.argv.includes('--escribir')) {
    for (const [ruta, poner] of [[new URL('../wrangler.toml', import.meta.url), ponerEnToml], [new URL('../../nautica/src/store/sync/config.js', import.meta.url), ponerEnConfig]]) {
      const antes = readFileSync(ruta, 'utf8');
      const despues = poner(antes, publica);
      if (despues === antes) { err(`No he encontrado dónde poner la clave pública en ${fileURLToPath(ruta)}.`); process.exit(1); }
      writeFileSync(ruta, despues);
      err(`Clave pública escrita en ${fileURLToPath(ruta)}`);
    }
  }
  err(`Clave pública VAPID (va en el cliente y en wrangler.toml; no es secreta):\n  ${publica}`);
  err('La clave privada sale por la salida estándar: guárdala con  npx wrangler secret put VAPID_PRIVATE  (no la pegues en ningún archivo).');
  process.stdout.write(`${privada}\n`);
}
