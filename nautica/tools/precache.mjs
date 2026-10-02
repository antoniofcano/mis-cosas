// Genera sw-lista.js: la lista de archivos que el service worker guarda en el móvil y una versión que cambia
// cuando cambia cualquiera de ellos (así el móvil sabe que hay una versión nueva).
//   npm run precache
// Un test comprueba que sw-lista.js está al día: si tocas la app, vuelve a ejecutarlo.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

export const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');

function archivos(dir) {
  return readdirSync(join(RAIZ, dir)).flatMap((n) => {
    const p = join(dir, n);
    return statSync(join(RAIZ, p)).isDirectory() ? archivos(p) : [p];
  });
}

/** App (se guarda al instalar) y datos (se guardan después, en segundo plano). Rutas relativas a nautica/. */
export function listaPrecache() {
  const norm = (p) => relative(RAIZ, join(RAIZ, p)).split('\\').join('/');
  const app = ['index.html', 'manifest.webmanifest', 'llms.txt', ...archivos('icons'), ...archivos('styles'), ...archivos('src')]
    .map(norm).filter((p) => !p.endsWith('.md')).sort();
  const datos = archivos('data').map(norm).sort();
  const h = createHash('sha256');
  for (const p of [...app, ...datos]) h.update(p).update(readFileSync(join(RAIZ, p)));
  return { version: h.digest('hex').slice(0, 12), app, datos };
}

export function textoLista({ version, app, datos }) {
  return `// Generado por tools/precache.mjs: no lo edites a mano.\nself.VERSION = '${version}';\nself.APP = ${JSON.stringify(app, null, 1)};\nself.DATOS = ${JSON.stringify(datos, null, 1)};\n`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const l = listaPrecache();
  writeFileSync(join(RAIZ, 'sw-lista.js'), textoLista(l));
  console.log(`sw-lista.js: versión ${l.version}, ${l.app.length} archivos de la app y ${l.datos.length} de datos`);
}
