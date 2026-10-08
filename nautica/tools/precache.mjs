// Genera sw-lista.js: la lista de archivos que el service worker guarda en el móvil y una versión que cambia
// cuando cambia cualquiera de ellos (así el móvil sabe que hay una versión nueva).
//   npm run precache
// Un test comprueba que sw-lista.js está al día: si tocas la app, vuelve a ejecutarlo.
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

export const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');

// Solo archivos que están en git (añadidos o guardados): un archivo a medio hacer, sin añadir, no entra en la lista
// (si entrara y no se publicara, el móvil no podría instalar la versión). Sin git, todos.
let enGit = null;
try {
  enGit = new Set(execFileSync('git', ['ls-files', '-z', '--cached'], { cwd: RAIZ, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).split('\0').filter(Boolean));
} catch { /* sin git */ }

function archivos(dir) {
  return readdirSync(join(RAIZ, dir)).flatMap((n) => {
    const p = join(dir, n);
    return statSync(join(RAIZ, p)).isDirectory() ? archivos(p) : [p];
  }).filter((p) => !enGit || enGit.has(p.split('\\').join('/')));
}

/** App (se guarda al instalar) y datos (se guardan después, en segundo plano). Rutas relativas a nautica/. */
export function listaPrecache() {
  const norm = (p) => relative(RAIZ, join(RAIZ, p)).split('\\').join('/');
  const app = ['index.html', 'manifest.webmanifest', 'llms.txt', ...archivos('icons'), ...archivos('styles'), ...archivos('fonts').filter((p) => p.endsWith('.woff2')), ...archivos('src')]
    .map(norm).filter((p) => !p.endsWith('.md')).sort();
  // Los .md de data/ (p. ej. la licencia de un eje) son documentación: no se guardan en el móvil.
  const datos = archivos('data').map(norm).filter((p) => !p.endsWith('.md')).sort();
  const h = createHash('sha256');
  for (const p of [...app, ...datos]) h.update(p).update(readFileSync(join(RAIZ, p)));
  return { version: h.digest('hex').slice(0, 12), app, datos };
}

export function textoLista({ version, app, datos }) {
  return `// Generado por tools/precache.mjs: no lo edites a mano.\nself.VERSION = '${version}';\nself.APP = ${JSON.stringify(app, null, 1)};\nself.DATOS = ${JSON.stringify(datos, null, 1)};\n`;
}

/**
 * sw.js lleva también la versión en su primera línea. Safari (iPhone) solo mira si ha cambiado sw.js, no los archivos
 * que importa: sin esto, el iPhone nunca se enteraba de que había una versión nueva.
 */
export const conVersion = (sw, version) => sw.replace(/^(\/\/ versión: [0-9a-f]+\n)?/, `// versión: ${version}\n`);

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const l = listaPrecache();
  writeFileSync(join(RAIZ, 'sw-lista.js'), textoLista(l));
  const sw = join(RAIZ, 'sw.js');
  writeFileSync(sw, conVersion(readFileSync(sw, 'utf8'), l.version));
  console.log(`sw-lista.js: versión ${l.version}, ${l.app.length} archivos de la app y ${l.datos.length} de datos`);
}
