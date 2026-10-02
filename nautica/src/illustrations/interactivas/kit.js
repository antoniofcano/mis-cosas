// Utilidades de dibujo de las láminas interactivas. Los colores son variables CSS de styles/app.css (--l-*), así que
// el mismo SVG se ve bien en claro y en oscuro. Cada elemento que se puede resaltar lleva data-parte.

export const rad = (d) => (d * Math.PI) / 180;
export const f1 = (n) => Number(n).toFixed(1);
/** Punto a distancia r de (x, y) en una dirección náutica (0 = arriba, sentido horario). */
export const pol = (x, y, deg, r) => [x + Math.sin(rad(deg)) * r, y - Math.cos(rad(deg)) * r];
export const pad3 = (d) => String(Math.round(((d % 360) + 360) % 360)).padStart(3, '0');
export const grad = (d) => `${String(Math.abs(d)).replace('.', ',')}°`;
export const conSigno = (d) => `${d > 0 ? '+' : d < 0 ? '−' : ''}${grad(d)}`;

export const parte = (p) => (p ? ` data-parte="${p}"` : '');

export function svgOpen(W, H, label) {
  return `<svg viewBox="0 0 ${W} ${H}" class="il lam-svg" role="img" aria-label="${label}"><rect width="${W}" height="${H}" rx="10" fill="var(--l-fondo)"/>`;
}

/** Flecha con la punta dibujada (sin marker, para que tome el color de su variable en cualquier tema). */
export function flecha(x1, y1, x2, y2, color, w = 3, p = null, extra = '') {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const n = Math.hypot(dx, dy) || 1;
  const ux = dx / n;
  const uy = dy / n;
  const s = 5 + w * 2;
  const hx = x2 - ux * s;
  const hy = y2 - uy * s;
  return `<g${parte(p)}><line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(hx)}" y2="${f1(hy)}" stroke="${color}" stroke-width="${w}" stroke-linecap="round" ${extra}/>` +
    `<polygon points="${f1(x2)},${f1(y2)} ${f1(hx - uy * s * 0.6)},${f1(hy + ux * s * 0.6)} ${f1(hx + uy * s * 0.6)},${f1(hy - ux * s * 0.6)}" fill="${color}"/></g>`;
}

/** Arco entre dos direcciones náuticas, de a a b en el sentido corto. */
export function arco(x, y, r, a, b, color, w = 2.5, p = null) {
  let d = ((b - a) % 360 + 540) % 360 - 180;
  if (Math.abs(d) < 0.01) return '';
  const [x1, y1] = pol(x, y, a, r);
  const [x2, y2] = pol(x, y, a + d, r);
  return `<path${parte(p)} d="M${f1(x1)},${f1(y1)} A${r},${r} 0 0 ${d > 0 ? 1 : 0} ${f1(x2)},${f1(y2)}" fill="none" stroke="${color}" stroke-width="${w}"/>`;
}

export const texto = (x, y, t, { color = 'var(--text)', size = 14, anchor = 'middle', weight = 600, p = null } = {}) =>
  `<text${parte(p)} x="${f1(x)}" y="${f1(y)}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" fill="${color}" style="font-family:inherit">${t}</text>`;

/** Rosa de 360° con marcas cada 10° y los cardinales. */
export function rosa(cx, cy, R) {
  const out = [`<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="var(--l-g)" stroke-width="1.5"/>`];
  for (let d = 0; d < 360; d += 10) {
    const [x1, y1] = pol(cx, cy, d, R);
    const [x2, y2] = pol(cx, cy, d, d % 90 ? R - 6 : R - 12);
    out.push(`<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="var(--l-g)" stroke-width="1.2"/>`);
  }
  for (const [t, d] of [['N', 0], ['E', 90], ['S', 180], ['W', 270]]) {
    const [x, y] = pol(cx, cy, d, R + 15);
    out.push(texto(x, y + 6, t, { size: 18, weight: 700 }));
  }
  return out.join('');
}

/** Silueta de barco vista desde arriba, centrada en (cx, cy) y con la proa hacia rumbo. */
export function barcoPlanta(cx, cy, rumbo, L = 46, p = 'barco') {
  const w = L * 0.34;
  const d = `M0,${-L / 2} C${w * 0.9},${-L / 4} ${w / 2},${L / 4} ${w / 2},${L / 2} L${-w / 2},${L / 2} C${-w / 2},${L / 4} ${-w * 0.9},${-L / 4} 0,${-L / 2} Z`;
  return `<path${parte(p)} d="${d}" transform="translate(${f1(cx)} ${f1(cy)}) rotate(${f1(rumbo)})" fill="var(--l-casco)" stroke="var(--text)" stroke-width="1"/>`;
}

/** Números a la española: una cifra decimal como mucho y coma decimal. */
export const num = (n, dec = 1) => String(Math.round(n * 10 ** dec) / 10 ** dec).replace('.', ',');

/**
 * Encaja puntos en coordenadas náuticas (x al E, y al N, en cualquier unidad) dentro de una caja del SVG.
 * @returns {(p: [number, number]) => [number, number]} transforma un punto a píxeles (y hacia abajo)
 */
export function encaja(puntos, x0, y0, w, h) {
  const xs = puntos.map((p) => p[0]);
  const ys = puntos.map((p) => p[1]);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const k = Math.min(w / Math.max(maxX - minX, 1e-6), h / Math.max(maxY - minY, 1e-6));
  const ox = x0 + (w - (maxX - minX) * k) / 2;
  const oy = y0 + (h - (maxY - minY) * k) / 2;
  return ([x, y]) => [ox + (x - minX) * k, oy + (maxY - y) * k];
}

/** Vector náutico (rumbo, módulo) en coordenadas x al E, y al N. */
export const vec = (rumbo, m) => [Math.sin(rad(rumbo)) * m, Math.cos(rad(rumbo)) * m];
export const suma = (a, b) => [a[0] + b[0], a[1] + b[1]];
