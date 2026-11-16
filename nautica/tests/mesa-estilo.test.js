// Mesa de cartas en estilo C (R-04): el bloque de `styles/laminas.css` solo usa colores de la app (tokens), pone las lecturas
// en mono y los rótulos en la condensada, no redondea esquinas y deja el mar, la tierra y los trazos de la carta como están.
// Solo presentación: la geometría y las herramientas las prueban los tests de la carta.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const leer = (f) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
const LAM = leer('styles/laminas.css');
const APP = leer('styles/app.css');
const INICIO = LAM.indexOf('/* ---- Mesa de cartas al lenguaje de Hoy (R-04)');
const BLOQUE = LAM.slice(INICIO, LAM.indexOf('/* Más y Ajustes'));
const sinComentarios = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');

test('el bloque de la mesa existe y no lleva colores fijos (salvo la sombra negra translúcida)', () => {
  assert.ok(INICIO > 0 && BLOQUE.length > 500);
  const css = sinComentarios(BLOQUE).replace(/rgba\(0, 0, 0, [.\d]+\)/g, '');
  assert.ok(!/#[0-9a-f]{3,8}\b|rgb\(|hsl/i.test(css), 'solo tokens');
});

test('la mesa usa las letras y los botones del estilo nuevo', () => {
  const css = sinComentarios(BLOQUE);
  assert.match(css, /\.ichart \.protractor-bar[^{]*\{[^}]*var\(--fuente-mono\)/, 'el transportador, en mono');
  assert.match(css, /\.ichart \.readout \{[^}]*tabular-nums/, 'la lectura (que también lleva la ayuda en frases) en la letra de texto, con cifras tabulares');
  assert.match(css, /\.ws-title \{[^}]*var\(--fuente-titulos\)/, 'título de la mesa en condensada');
  assert.match(css, /\.ws-tabbtn \{[^}]*var\(--fuente-titulos\)/, 'pestañas en condensada');
  assert.match(css, /button\.tool\[aria-pressed="true"\] \{[^}]*var\(--boton\)[^}]*inset 0 -4px/, 'herramienta activa: relleno de botón y barra (no solo color)');
  assert.match(css, /\.ichart, \.ichart\.completa\.fija \{ border-radius: 0/, 'esquinas rectas');
  assert.ok(!/border-radius:\s*(?!0\b)\d/.test(css), 'sin esquinas redondeadas');
});

test('lo táctil de la mesa mide al menos 44 px y la carta conserva sus colores', () => {
  for (const m of BLOQUE.matchAll(/min-height:\s*(\d+)px/g)) assert.ok(Number(m[1]) >= 44, m[0]);
  assert.match(APP, /svg\.chart\.interactive \{[^}]*background: var\(--sea\)/);
  assert.ok(!/--sea|--land/.test(sinComentarios(BLOQUE)), 'el mar y la tierra no se tocan aquí');
});
