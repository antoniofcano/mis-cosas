// App instalable y sin conexión: manifiesto, lista de archivos del service worker al día y sin colarse nada
// que no sea de la app.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { listaPrecache, textoLista, RAIZ } from '../tools/precache.mjs';

test('sw-lista.js está al día (si falla: npm run precache)', () => {
  assert.equal(readFileSync(join(RAIZ, 'sw-lista.js'), 'utf8'), textoLista(listaPrecache()));
});

test('la lista guarda la app y los datos, y nada de tests, herramientas ni documentación', () => {
  const { app, datos } = listaPrecache();
  for (const imprescindible of ['index.html', 'manifest.webmanifest', 'src/ui/app.js', 'src/ui/pwa.js', 'styles/app.css', 'icons/icono-192.png']) assert.ok(app.includes(imprescindible), imprescindible);
  for (const d of ['data/curso/per.json', 'data/curso/py.json', 'data/ejes/index.json', 'data/ejes/andalucia/eje.json', 'data/ejes/andalucia/per/preguntas.json', 'data/ejes/andalucia/py/preguntas.json', 'data/chart-105.json']) assert.ok(datos.includes(d), d);
  for (const p of [...app, ...datos]) {
    assert.ok(existsSync(join(RAIZ, p)), p);
    assert.doesNotMatch(p, /^(tests|tools|docs|node_modules)\/|\.md$/);
  }
});

test('manifiesto: nombre, inicio, pantalla completa e iconos que existen', () => {
  const m = JSON.parse(readFileSync(join(RAIZ, 'manifest.webmanifest'), 'utf8'));
  assert.ok(m.name && m.short_name && m.start_url && m.scope);
  assert.equal(m.display, 'standalone');
  const tam = m.icons.map((i) => i.sizes);
  assert.ok(tam.includes('192x192') && tam.includes('512x512'));
  assert.ok(m.icons.some((i) => i.purpose === 'maskable'));
  for (const i of m.icons) assert.ok(existsSync(join(RAIZ, i.src)), i.src);
  const html = readFileSync(join(RAIZ, 'index.html'), 'utf8');
  assert.match(html, /<link rel="manifest" href="manifest.webmanifest">/);
  assert.match(html, /apple-touch-icon/);
});

test('sw.js lleva la versión en su primera línea (Safari solo mira si cambia sw.js)', () => {
  const sw = readFileSync(join(RAIZ, 'sw.js'), 'utf8');
  assert.equal(sw.split('\n')[0], `// versión: ${listaPrecache().version}`);
});

// sw.js y sw-lista.js tienen que ser JavaScript válido: si no, el navegador no instala la versión nueva y el alumno
// se queda con la vieja sin saberlo (pasó con restos de una fusión de git en sw.js).
test('sw.js y sw-lista.js son JavaScript válido', async () => {
  const { execFileSync } = await import('node:child_process');
  for (const f of ['sw.js', 'sw-lista.js']) execFileSync(process.execPath, ['--check', new URL(`../${f}`, import.meta.url).pathname]);
});

test('ningún fichero del repositorio tiene marcas de conflicto de git', async () => {
  const { execFileSync } = await import('node:child_process');
  const raiz = new URL('..', import.meta.url).pathname;
  let salida = '';
  try {
    salida = execFileSync('git', ['grep', '-n', '-I', '-E', '^(<<<<<<< |>>>>>>> |=======$)', '--', '.'], { cwd: raiz, encoding: 'utf8' });
  } catch (e) {
    if (e.status !== 1) throw e; // 1 = sin coincidencias
  }
  assert.equal(salida, '', `Marcas de conflicto sin resolver:\n${salida}`);
});
