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
  for (const d of ['data/curso/per.json', 'data/curso/py.json', 'data/exams/andalucia-per-teoria.json', 'data/chart-105.json']) assert.ok(datos.includes(d), d);
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
