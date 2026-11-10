// Carta a pantalla completa (móvil): la base es diseño propio (clases y CSS), no la Fullscreen API, que el iPhone no
// tiene para elementos. Aquí se vigila lo que no se ve en Node pero se rompe fácil al tocar la hoja de estilos o la
// carta; el comportamiento (entrar, trazar, salir sin perder trazos, girar) se comprueba en el navegador con Playwright.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { existeIcono } from '../src/ui/iconos.js';

const lee = (f) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
const css = lee('styles/app.css');
const carta = lee('src/ui/chart/interactive-chart.js');
const bloque = css.slice(css.indexOf('/* ---- Carta a pantalla completa'));

test('hay estilos del modo y respetan las zonas seguras del iPhone por los cuatro lados', () => {
  assert.ok(bloque.length > 500, 'falta el bloque «Carta a pantalla completa» en styles/app.css');
  for (const lado of ['top', 'right', 'bottom', 'left']) assert.match(bloque, new RegExp(`env\\(safe-area-inset-${lado}\\)`), lado);
});

test('vale para el móvil en vertical y tumbado, y la página no se desplaza debajo', () => {
  assert.match(bloque, /@media \(orientation: landscape\) and \(max-height: 500px\)/);
  assert.match(bloque, /@media \(max-width: 860px\)/);
  assert.match(bloque, /body\.carta-completa \{[^}]*overflow:\s*hidden/);
  assert.match(bloque, /\.ichart\.completa \{[^}]*touch-action:\s*none/);
});

test('en la barra compacta el nombre de la herramienta se oculta a la vista, no al lector de pantalla', () => {
  const regla = bloque.slice(bloque.indexOf('.tools.dibujo .tool-name {'));
  assert.match(regla.slice(0, regla.indexOf('}')), /clip-path/);
  assert.doesNotMatch(regla.slice(0, regla.indexOf('}')), /display:\s*none/);
});

test('los botones del modo miden al menos 44 px', () => {
  assert.match(bloque, /\.completa-acciones button \{[^}]*min-height:\s*44px[^}]*min-width:\s*44px/);
});

test('la carta no depende de la Fullscreen API: solo la pide si existe', () => {
  assert.match(carta, /raiz\.requestFullscreen && document\.fullscreenEnabled/);
  assert.match(carta, /classList\.add\('completa'\)/);
});

test('existen los iconos de entrar y salir, y «Salir» lleva rótulo accesible', () => {
  assert.ok(existeIcono('pantalla-completa') && existeIcono('pantalla-reducir'));
  assert.match(carta, /'aria-label': 'Salir de la pantalla completa'/);
  assert.match(carta, /'aria-label': 'Ampliar: carta a pantalla completa'/);
});
