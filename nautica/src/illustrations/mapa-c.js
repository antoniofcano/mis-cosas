// Mapa de conceptos entero en estilo C (docs/ESTILO-LAMINAS.md, «Mapas y chuletas»): papel de carta con su marco, cada
// concepto en una cartela con doble filete (un enlace a explorarlo) y cada relación con una flecha y su número en una
// etiqueta de cota; lo que se confunde, a trazos magenta con una letra. Las relaciones escritas (que son largas) no van
// en el dibujo sino debajo, en HTML, con el mismo número o letra: así el texto se lee a cualquier tamaño, lo lee el
// lector de pantalla y el dibujo cabe.
//
// El SVG se pinta a escala 1 (width = ancho del viewBox) dentro de un recuadro que se desplaza con el dedo: el tamaño
// efectivo del texto es su font-size, que nunca baja de TXT.min (11,5 px) aunque la pantalla mida 360 px.
// Sin DOM y sin colores fijos: solo T.* (variables --lc-*).

import { T, TXT, f1, lienzo, etiqueta, flecha, rotulo, anchoTexto, cajaEtiqueta } from './estilo-c.js';

/** Medidas: separación de la rejilla del mapa (X, Y), tamaño de cada cartela (nw, nh) y margen (m). */
export const MAPA_C = { X: 146, Y: 104, nw: 128, nh: 60, m: 22, nombre: 13.5, linea: 15 };

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
/** Letras de las confusiones: A, B, C… */
export const letra = (i) => String.fromCharCode(65 + i);

/**
 * El nombre de un concepto partido en líneas que caben en su cartela (como mucho 3; si no, la última se corta en una
 * palabra entera y el test lo detecta).
 */
export function lineasNombre(nombre, { ancho = MAPA_C.nw - 12, size = MAPA_C.nombre } = {}) {
  const cabe = (t) => anchoTexto(t, size, 'serif') * 1.06 <= ancho; // la serifa en negrita, algo más ancha
  const lineas = [];
  for (const w of String(nombre).split(/\s+/).filter(Boolean)) {
    const ult = lineas.at(-1);
    if (ult != null && cabe(`${ult} ${w}`)) lineas[lineas.length - 1] = `${ult} ${w}`;
    else lineas.push(w);
  }
  return lineas;
}

/** Las relaciones numeradas (en el orden del mapa) y las confusiones con su letra. */
export function leyendaMapa(mapa) {
  const relaciones = [];
  const confusiones = [];
  for (const a of mapa.aristas) {
    if (a.tipo === 'confunde') confusiones.push({ marca: letra(confusiones.length), de: a.de, a: a.a, rel: a.rel });
    else relaciones.push({ marca: String(relaciones.length + 1), de: a.de, a: a.a, rel: a.rel });
  }
  return { relaciones, confusiones };
}

/**
 * Dibuja el mapa entero.
 * @param {object} mapa  data/mapas/<id>.json
 * @param {{ actual?: string, href?: (nodo) => string }} o  actual: el concepto que se está mirando (en magenta);
 *   href: dirección de cada concepto (si falta, las cartelas no son enlaces)
 * @returns {{ svg: string, W: number, H: number, cajas: Map<string, {x0,y0,x1,y1}>, relaciones, confusiones }}
 */
export function mapaSvg(mapa, { actual = null, href = null } = {}) {
  const { X, Y, nw, nh, m, nombre: fs, linea } = MAPA_C;
  const W = Math.ceil(m * 2 + Math.max(...mapa.nodos.map((n) => n.x)) * X + nw);
  const nodos = new Map(mapa.nodos.map((n) => [n.id, n]));
  // Cada cartela, centrada en su punto de la rejilla; un nombre de 4 líneas la hace algo más alta.
  const alto = (n) => Math.max(nh, lineasNombre(n.nombre).length * linea + 16);
  const caja = (n) => { const cy = m + n.y * Y + nh / 2; const h = alto(n); return { x0: m + n.x * X, y0: cy - h / 2, x1: m + n.x * X + nw, y1: cy + h / 2 }; };
  const cajas = new Map(mapa.nodos.map((n) => [n.id, caja(n)]));
  const H = Math.ceil(Math.max(...[...cajas.values()].map((c) => c.y1)) + m);
  const centro = (n) => { const c = cajas.get(n.id); return [(c.x0 + c.x1) / 2, (c.y0 + c.y1) / 2]; };
  // Punto del borde de la cartela (con 3 px de aire) en la dirección (dx, dy) desde su centro.
  const borde = (n, dx, dy) => {
    const [cx, cy] = centro(n);
    const c = cajas.get(n.id);
    const t = Math.min(Math.abs((nw / 2 + 3) / (dx || 1e-9)), Math.abs(((c.y1 - c.y0) / 2 + 3) / (dy || 1e-9)));
    return [cx + dx * t, cy + dy * t];
  };
  const { relaciones, confusiones } = leyendaMapa(mapa);
  const alt = `Mapa de conceptos «${mapa.titulo}»: ${mapa.nodos.length} conceptos unidos por ${relaciones.length} relaciones numeradas` +
    `${confusiones.length ? ` y ${confusiones.length} confusiones a trazos, con letra` : ''}. La lista de relaciones está debajo del mapa.`;
  const { out, cierra } = lienzo(W, H, alt, { clase: 'mc-svg', fondo: T.fondo });
  // Con enlaces dentro, el SVG es un grupo (role="img" los escondería del lector de pantalla).
  out[0] = out[0].replace('role="img"', 'role="group"').replace('<svg ', `<svg width="${W}" height="${H}" style="min-width: ${W}px; max-width: ${Math.round(W * 1.25)}px" `);

  const lineas = [];
  const marcas = [];
  const ocupadas = [...cajas.values()].map((c) => ({ x0: c.x0 - 2, y0: c.y0 - 2, x1: c.x1 + 2, y1: c.y1 + 2 }));
  const solapa = (a, b) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
  /** La marca (número o letra) en el primer punto del segmento que no tapa una cartela ni otra marca. */
  const marca = (p1, p2, t, color) => {
    let mejor = null;
    for (const k of [0.5, 0.4, 0.6, 0.32, 0.68, 0.25, 0.75]) {
      const x = p1[0] + (p2[0] - p1[0]) * k; const y = p1[1] + (p2[1] - p1[1]) * k;
      const c = cajaEtiqueta(t, x, y, TXT.cota);
      const pena = ocupadas.filter((b) => solapa(c, b)).length;
      if (!mejor || pena < mejor.pena) mejor = { x, y, c, pena };
      if (pena === 0) break;
    }
    ocupadas.push(mejor.c);
    marcas.push(etiqueta(mejor.x, mejor.y, t, { color, borde: color }));
  };

  // Dos aristas entre los mismos conceptos (una relación y una confusión) van en paralelo, separadas, no encima.
  const par = (a) => [a.de, a.a].sort().join('|');
  const porPar = new Map();
  for (const a of mapa.aristas) porPar.set(par(a), [...(porPar.get(par(a)) ?? []), a]);
  let ir = 0; let ic = 0;
  for (const a of mapa.aristas) {
    const A = nodos.get(a.de); const B = nodos.get(a.a);
    const [ax, ay] = centro(A); const [bx, by] = centro(B);
    const d = Math.hypot(bx - ax, by - ay) || 1;
    const [ux, uy] = [(bx - ax) / d, (by - ay) / d];
    const hermanas = porPar.get(par(a));
    // separación perpendicular, con el mismo sentido sea cual sea la dirección de la arista
    const sgn = a.de < a.a ? 1 : -1;
    const off = hermanas.length > 1 ? (hermanas.indexOf(a) - (hermanas.length - 1) / 2) * 16 * sgn : 0;
    const [nx, ny] = [-uy * off, ux * off];
    const q1 = borde(A, ux, uy); const q2 = borde(B, -ux, -uy);
    const p1 = [q1[0] + nx, q1[1] + ny]; const p2 = [q2[0] + nx, q2[1] + ny];
    if (a.tipo === 'confunde') {
      lineas.push(`<line x1="${f1(p1[0])}" y1="${f1(p1[1])}" x2="${f1(p2[0])}" y2="${f1(p2[1])}" stroke="${T.magenta}" stroke-width="1.4" stroke-dasharray="5 4" data-arista="${a.de}-${a.a}"/>`);
      marca(p1, p2, confusiones[ic++].marca, T.magenta);
    } else {
      lineas.push(flecha(p1[0], p1[1], p2[0], p2[1], { w: 1.2, punta: 8, extra: `data-arista="${a.de}-${a.a}"` }));
      marca(p1, p2, relaciones[ir++].marca, T.tinta);
    }
  }

  const cartelas = mapa.nodos.map((n) => {
    const c = cajas.get(n.id);
    const es = n.id === actual;
    const color = es ? T.magenta : T.tinta;
    const ls = lineasNombre(n.nombre);
    const y0 = (c.y0 + c.y1) / 2 - ((ls.length - 1) * linea) / 2 + fs * 0.36;
    const h = c.y1 - c.y0;
    const cuerpo = `<rect class="mc-borde" x="${f1(c.x0)}" y="${f1(c.y0)}" width="${nw}" height="${f1(h)}" fill="${T.papel}" stroke="${color}" stroke-width="${es ? 2 : 1.2}"/>` +
      `<rect x="${f1(c.x0 + 2.5)}" y="${f1(c.y0 + 2.5)}" width="${nw - 5}" height="${f1(h - 5)}" fill="none" stroke="${color}" stroke-width="${es ? 0.9 : 0.5}"/>` +
      ls.map((l, i) => rotulo((c.x0 + c.x1) / 2, y0 + i * linea, esc(l), { size: fs, weight: 700, estilo: 'serif', color: es ? T.magenta : T.tinta })).join('');
    const etiq = esc(`${n.nombre}${es ? ' (el que estás mirando)' : ''}: ${n.corto}`);
    const datos = `data-nodo="${esc(n.id)}" data-cx="${f1((c.x0 + c.x1) / 2)}" data-cy="${f1((c.y0 + c.y1) / 2)}"${es ? ' aria-current="true"' : ''}`;
    return href ? `<a class="mc-nodo" href="${esc(href(n))}" ${datos} aria-label="${etiq}">${cuerpo}</a>`
      : `<g class="mc-nodo" ${datos} aria-label="${etiq}">${cuerpo}</g>`;
  });

  out.push(`<g class="mc-aristas">${lineas.join('')}</g>`, `<g class="mc-nodos">${cartelas.join('')}</g>`, `<g class="mc-marcas" aria-hidden="true">${marcas.join('')}</g>`, cierra());
  return { svg: out.join(''), W, H, cajas, relaciones, confusiones };
}
