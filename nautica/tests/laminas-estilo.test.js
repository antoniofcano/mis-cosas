// Estilo C de las láminas (docs/ESTILO-LAMINAS.md): tokens de color en claro y oscuro con contraste AA, y las piezas
// de dibujo comunes sin colores fijos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as C from '../src/illustrations/estilo-c.js';

const CSS = readFileSync(new URL('../styles/laminas.css', import.meta.url), 'utf8');
/** Variables --lc-* de un bloque de CSS. */
const vars = (bloque) => Object.fromEntries([...bloque.matchAll(/--(lc-[a-z0-9-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
const bloque = (desde) => { const i = CSS.indexOf(desde); return CSS.slice(i, CSS.indexOf('}', i)); };
export const CLARO = vars(bloque(':root {'));
export const OSCURO = vars(bloque(':root:not([data-theme="light"]) {'));
const FORZADO = vars(bloque(':root[data-theme="dark"] {'));

const lum = (hex) => {
  const n = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contraste = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

test('estilo C: cada color tiene su versión oscura, y el tema oscuro forzado es el mismo que el del sistema', () => {
  const colores = Object.keys(CLARO).filter((k) => CLARO[k].startsWith('#'));
  assert.ok(colores.length >= 25);
  // Las luces son iguales en los dos modos (siempre sobre la noche); el resto cambia.
  for (const k of colores.filter((x) => !x.startsWith('lc-luz-'))) assert.ok(OSCURO[k]?.startsWith('#'), `--${k} sin versión oscura`);
  assert.deepEqual(FORZADO, OSCURO);
  assert.match(CSS, /@media \(prefers-color-scheme: dark\)\s*{\s*:root:not\(\[data-theme="light"\]\)/);
});

test('estilo C: el texto tiene contraste AA (4,5:1) sobre el papel y el fondo, en claro y en oscuro', () => {
  for (const [modo, P] of [['claro', CLARO], ['oscuro', OSCURO]]) {
    for (const texto of ['lc-tinta', 'lc-apagado', 'lc-magenta', 'lc-verde-texto', 'lc-rojo-texto', 'lc-azul-texto']) {
      for (const fondo of ['lc-papel', 'lc-fondo']) {
        const c = contraste(P[texto], P[fondo]);
        assert.ok(c >= 4.5, `${modo}: --${texto} sobre --${fondo} = ${c.toFixed(2)}`);
      }
    }
    // tinta sobre el agua (rótulos sobre el mar) y el texto de noche sobre la noche
    assert.ok(contraste(P['lc-tinta'], P['lc-agua']) >= 4.5, `${modo}: tinta sobre agua`);
    assert.ok(contraste(P['lc-noche-texto'], P['lc-noche']) >= 4.5, `${modo}: texto de noche`);
    // el papel sobre el magenta (el disco «tú» de las luces)
    assert.ok(contraste(P['lc-papel'], P['lc-magenta']) >= 4.5, `${modo}: papel sobre magenta`);
  }
});

test('estilo C: las piezas de dibujo solo usan variables --lc-* y dan ids estables', () => {
  const { out, pt, ray, cierra } = C.lienzo(358, 300, 'Prueba');
  const piezas = [
    ...out, C.cartela(100, 100, 'VERDE', 'estribor', { color: C.T.verdeTxt }), C.etiqueta(50, 50, '112,5°'), C.cota(10, 10, 100, 10, '3 m'), C.cotaArco(179, 160, 141, 0, 112.5, '112,5°'),
    C.referencia(0, 0, 10, 10), C.flecha(0, 0, 50, 50), C.ondas(0, 358, 200), C.ondaCurva(0, 358, 220), C.tierra('M0,0 H10 V10Z', pt), C.reloj(50, 50, 25, 90), C.rosaNorte(30, 30),
    C.paso(20, 20, 1), C.barco(100, 100, 45), C.barquito(1), C.rotulo(10, 10, 'texto', { estilo: 'mono' }), `<rect fill="${ray}"/>`, cierra(),
  ].join('');
  assert.ok(!/#[0-9a-f]{3,8}\b(?![^"]*-(pt|ray)\))/i.test(piezas.replace(/url\(#[^)]*\)/g, '')), 'sin colores fijos');
  for (const v of piezas.match(/var\(--[a-z0-9-]+\)/g)) assert.ok(v.slice(6, -1) in CLARO, `${v} no está en styles/laminas.css`);
  assert.equal(C.lienzo(358, 300, 'Prueba').id, C.lienzo(358, 300, 'Prueba').id);
  assert.notEqual(C.lienzo(358, 300, 'Otra').id, C.lienzo(358, 300, 'Prueba').id);
});
