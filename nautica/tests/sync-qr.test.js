// El QR de «Mis dispositivos» (src/ui/qr.js) se lee de verdad: se dibuja en píxeles y se decodifica con jsQR (una
// librería de pruebas, no a ojo), para varios códigos y direcciones.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import jsQR from 'jsqr';
import { matrizQR, svgQR, enlaceVincular } from '../src/ui/qr.js';
import { generarCodigo, formatearCodigo, validarCodigo } from '../src/store/sync/codigo.js';

/** Pinta la matriz en RGBA (cada módulo `escala` píxeles, con margen blanco de 4 módulos) y la decodifica. */
function leer(m, escala = 4) {
  const borde = 4;
  const n = (m.length + 2 * borde) * escala;
  const px = new Uint8ClampedArray(n * n * 4).fill(255);
  m.forEach((fila, y) => fila.forEach((osc, x) => {
    if (!osc) return;
    for (let dy = 0; dy < escala; dy += 1) for (let dx = 0; dx < escala; dx += 1) {
      const i = (((y + borde) * escala + dy) * n + (x + borde) * escala + dx) * 4;
      px[i] = 0; px[i + 1] = 0; px[i + 2] = 0;
    }
  }));
  return jsQR(px, n, n)?.data ?? null;
}

test('el QR del enlace de vincular se decodifica y lleva el código', () => {
  const bases = [{ origin: 'https://antoniofcano.github.io', pathname: '/mis-cosas/nautica/' }, { origin: 'http://localhost:4820', pathname: '/' }, null];
  for (let i = 0; i < 30; i += 1) {
    const c = formatearCodigo(generarCodigo());
    const url = enlaceVincular(c, bases[i % 3]);
    assert.equal(leer(matrizQR(url)), url);
    const codigo = decodeURIComponent(url.split('#/vincular/')[1]);
    assert.equal(validarCodigo(codigo).ok, true);
  }
  assert.equal(enlaceVincular('K7QM-4TXD-92HB', null), 'https://antoniofcano.github.io/mis-cosas/nautica/#/vincular/K7QM-4TXD-92HB');
});

test('el SVG del QR: negro sobre blanco, con margen, cuadrado y con etiqueta', () => {
  const svg = svgQR('https://antoniofcano.github.io/mis-cosas/nautica/#/vincular/K7QM-4TXD-92HB');
  assert.match(svg, /^<svg [^>]*viewBox="0 0 (\d+) \1"/);
  assert.match(svg, /<rect width="\d+" height="\d+" fill="#fff"\/>/);
  assert.match(svg, /fill="#000"/);
  assert.match(svg, /aria-label="Código QR del enlace"/);
  const n = Number(svg.match(/viewBox="0 0 (\d+)/)[1]);
  assert.ok(n <= 45, `pequeño: ${n} módulos con el margen`);
});
