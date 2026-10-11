// QR del enlace para unir otro aparato (Ajustes → «Mis dispositivos»). Lo lee la cámara del otro móvil, que abre el
// enlace …/nautica/#/vincular/<código>; la app no lleva lector de QR. Siempre negro sobre blanco con su margen
// (también en modo oscuro): un QR invertido no lo leen todas las cámaras. Generador: src/vendor/qrcode-generator.js
// (MIT, ver src/vendor/README.md). Sin DOM: devuelve la matriz o el SVG en texto.

import qrcode from '../vendor/qrcode-generator.js';

/** Matriz de módulos (true = oscuro) del QR de `texto` (corrección de errores M). */
export function matrizQR(texto) {
  const qr = qrcode(0, 'M');
  qr.addData(texto, 'Byte');
  qr.make();
  const n = qr.getModuleCount();
  return Array.from({ length: n }, (_, y) => Array.from({ length: n }, (__, x) => qr.isDark(y, x)));
}

/** SVG (texto) del QR, con un margen de `borde` módulos en blanco. */
export function svgQR(texto, { borde = 4, etiqueta = 'Código QR del enlace' } = {}) {
  const m = matrizQR(texto);
  const n = m.length + 2 * borde;
  let d = '';
  m.forEach((fila, y) => fila.forEach((osc, x) => { if (osc) d += `M${x + borde} ${y + borde}h1v1h-1z`; }));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges" role="img" aria-label="${etiqueta}"><rect width="${n}" height="${n}" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
}

/** Enlace para unir un aparato: la dirección de la app con #/vincular/<código formateado>. */
export function enlaceVincular(codigoFormateado, loc = globalThis.location) {
  const base = loc ? `${loc.origin}${loc.pathname}` : 'https://antoniofcano.github.io/mis-cosas/nautica/';
  return `${base}#/vincular/${codigoFormateado}`;
}
