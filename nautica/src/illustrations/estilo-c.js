// Estilo C de las láminas (docs/ESTILO-LAMINAS.md): la idea explicada como un material didáctico, con la piel de una
// carta náutica. Piezas de dibujo comunes, en SVG como texto y sin DOM. Los colores son SIEMPRE variables --lc-* de
// styles/laminas.css (claro y oscuro con el mismo SVG); nunca un color fijo.
//
// Reglas que estas piezas ya cumplen (y que comprueban los tests de las láminas piloto):
//   · texto ≥ 10,5 px efectivos a 360 px de ancho (usa TXT.* y no bajes de TXT.min en un viewBox de 358 de ancho);
//   · trazos de 1 a 1,6 px (los «gordos» solo para lo que la lámina quiere que mires: un sector, una derrota);
//   · lo importante se distingue también por forma o rótulo, no solo por color.

/** Colores: variables CSS de styles/laminas.css. */
export const T = {
  fondo: 'var(--lc-fondo)', papel: 'var(--lc-papel)', tinta: 'var(--lc-tinta)', apagado: 'var(--lc-apagado)', magenta: 'var(--lc-magenta)',
  amarillo: 'var(--lc-amarillo)', negro: 'var(--lc-negro)', blanco: 'var(--lc-blanco)', azul: 'var(--lc-azul)', azulTxt: 'var(--lc-azul-texto)',
  agua: 'var(--lc-agua)', agua2: 'var(--lc-agua-2)', lineaAgua: 'var(--lc-linea-agua)', tierra: 'var(--lc-tierra)', casco: 'var(--lc-casco)',
  verde: 'var(--lc-verde)', verdeTxt: 'var(--lc-verde-texto)', rojo: 'var(--lc-rojo)', rojoTxt: 'var(--lc-rojo-texto)',
  noche: 'var(--lc-noche)', nocheMar: 'var(--lc-noche-mar)', nocheTxt: 'var(--lc-noche-texto)',
  luzBlanca: 'var(--lc-luz-blanca)', luzVerde: 'var(--lc-luz-verde)', luzRoja: 'var(--lc-luz-roja)', luzAmarilla: 'var(--lc-luz-amarilla)', luzAzul: 'var(--lc-luz-azul)',
};

/** Tamaños de letra (px del viewBox, pensados para un viewBox de ~358 de ancho). */
export const TXT = { min: 11.5, cota: 11.5, rotulo: 12, nota: 12.5, nombre: 15, titulo: 18, grande: 30 };
/** Grosores de trazo. */
export const TRAZO = { fino: 0.7, normal: 1, marca: 1.4, fuerte: 1.6 };

export const f1 = (n) => (Math.round(Number(n) * 10) / 10).toString();
export const rad = (d) => (d * Math.PI) / 180;
/** Punto a distancia r de (x, y) en una dirección náutica (0 = arriba, sentido horario). */
export const pol = (x, y, deg, r) => [x + Math.sin(rad(deg)) * r, y - Math.cos(rad(deg)) * r];
/** Números a la española. */
export const num = (n, dec = 1) => String(Math.round(n * 10 ** dec) / 10 ** dec).replace('.', ',');
export const parte = (p) => (p ? ` data-parte="${p}"` : '');
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/** Identificador estable a partir de un texto (los patrones de dos dibujos iguales comparten id y no chocan con otros). */
export function idDe(texto) {
  let h = 5381;
  for (let i = 0; i < texto.length; i++) h = ((h * 33) ^ texto.charCodeAt(i)) >>> 0;
  return `lc${h.toString(36)}`;
}

/**
 * Abre el SVG: viewBox, nombre accesible (el texto alternativo de la lámina), patrones y fondo.
 * @returns {{ out: string[], id: string, pt: string, ray: string, cierra: () => string }}
 *   pt / ray: `url(#…)` del punteado y del rayado
 */
export function lienzo(W, H, alt, { fondo = T.papel, clase = '' } = {}) {
  const id = idDe(`${W}x${H}|${alt}`);
  const out = [
    `<svg viewBox="0 0 ${W} ${H}" class="il lc${clase ? ` ${clase}` : ''}" role="img" aria-label="${esc(alt)}">`,
    `<defs><pattern id="${id}-pt" width="3" height="3" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r=".55" fill="${T.tinta}"/></pattern>` +
      `<pattern id="${id}-ray" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" stroke="${T.tinta}" stroke-width=".7"/></pattern></defs>`,
    `<rect width="${W}" height="${H}" fill="${fondo}"/>`,
  ];
  return { out, id, pt: `url(#${id}-pt)`, ray: `url(#${id}-ray)`, cierra: () => `${marco(W, H)}</svg>` };
}

/** Marco de carta: doble filete y graduación alterna en el borde (como la escala de latitudes). */
export function marco(W, H, { paso = 14 } = {}) {
  const o = [`<g fill="none" stroke="${T.tinta}" pointer-events="none"><rect x=".75" y=".75" width="${f1(W - 1.5)}" height="${f1(H - 1.5)}" stroke-width="1.5"/>`,
    `<rect x="5" y="5" width="${W - 10}" height="${H - 10}" stroke-width=".6"/></g>`];
  // graduación: segmentos alternos llenos entre los dos filetes
  const seg = [];
  for (let x = 1.5, i = 0; x < W - 1.5; x += paso, i++) if (i % 2 === 0) seg.push(`M${f1(x)},1.5h${f1(Math.min(paso, W - 1.5 - x))}M${f1(x)},${f1(H - 3.2)}h${f1(Math.min(paso, W - 1.5 - x))}`);
  for (let y = 1.5, i = 0; y < H - 1.5; y += paso, i++) if (i % 2 === 0) seg.push(`M1.5,${f1(y)}v${f1(Math.min(paso, H - 1.5 - y))}M${f1(W - 3.2)},${f1(y)}v${f1(Math.min(paso, H - 1.5 - y))}`);
  o.push(`<path d="${seg.join('')}" stroke="${T.tinta}" stroke-width="1.7" fill="none" pointer-events="none"/>`);
  return o.join('');
}

/**
 * Rótulo. estilo: 'serif' (títulos, notas), 'mono' (ritmos, ángulos, cifras), 'cap' (versalitas espaciadas) o 'sans'.
 */
export function rotulo(x, y, t, { size = TXT.rotulo, anchor = 'middle', estilo = 'sans', italic = false, weight = 400, color = T.tinta, p = null, espacio = 0, extra = '' } = {}) {
  const cls = estilo === 'cap' ? 'lc-sans' : `lc-${estilo}`;
  const ls = espacio || (estilo === 'cap' ? 1.4 : 0);
  return `<text${parte(p)} x="${f1(x)}" y="${f1(y)}" font-size="${size}" font-weight="${weight}"${italic ? ' font-style="italic"' : ''} text-anchor="${anchor}"${ls ? ` letter-spacing="${ls}"` : ''} fill="${color}" class="${cls}"${extra ? ` ${extra}` : ''}>${t}</text>`;
}

/** Ancho aproximado de un texto (para encajar recuadros): sans/serif ≈ 0,56 em; mono 0,62 em; versalitas, más. */
export function anchoTexto(t, size, estilo = 'sans') {
  const k = estilo === 'mono' ? 0.62 : estilo === 'cap' ? 0.68 : 0.55;
  return String(t).replace(/<[^>]*>/g, '').length * size * k;
}

/**
 * Cartela: rectángulo con doble filete y uno o dos rótulos (título en versalitas, subtítulo en cursiva serif).
 * (cx, cy) es el centro.
 */
export function cartela(cx, cy, titulo, sub = null, { color = T.tinta, ancho = null, p = null, fondo = T.papel, size = TXT.rotulo } = {}) {
  const w = ancho ?? Math.max(anchoTexto(titulo, size, 'cap'), sub ? anchoTexto(sub, TXT.min + 0.5, 'serif') : 0) + 18;
  const h = sub ? 38 : 24;
  const x = cx - w / 2;
  const y = cy - h / 2;
  const o = [`<g${parte(p)}><rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${h}" fill="${fondo}" stroke="${T.tinta}" stroke-width="1.2"/>`,
    `<rect x="${f1(x + 2.5)}" y="${f1(y + 2.5)}" width="${f1(w - 5)}" height="${h - 5}" fill="none" stroke="${T.tinta}" stroke-width=".5"/>`];
  if (sub) o.push(rotulo(cx, y + 16, titulo, { size, weight: 700, estilo: 'cap', color }), rotulo(cx, y + 30, sub, { size: TXT.min + 0.5, estilo: 'serif', italic: true }));
  else o.push(rotulo(cx, y + 16.5, titulo, { size, weight: 700, estilo: 'cap', color }));
  o.push('</g>');
  return o.join('');
}

/** Etiqueta de cota: recuadro fino con texto monoespaciado (ángulos, distancias, ritmos). (cx, cy) es el centro. */
export function etiqueta(cx, cy, t, { color = T.tinta, borde = null, size = TXT.cota, p = null, fondo = T.papel } = {}) {
  const w = anchoTexto(t, size, 'mono') + 10;
  const h = size + 6;
  return `<g${parte(p)}><rect x="${f1(cx - w / 2)}" y="${f1(cy - h / 2)}" width="${f1(w)}" height="${f1(h)}" fill="${fondo}" stroke="${borde ?? color}" stroke-width=".8"/>` +
    rotulo(cx, cy + size * 0.36, t, { size, estilo: 'mono', weight: 600, color }) + '</g>';
}

/** Línea de referencia de una cota: fina y discontinua. */
export const referencia = (x1, y1, x2, y2, { color = T.tinta } = {}) =>
  `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${color}" stroke-width="${TRAZO.fino}" stroke-dasharray="4 3"/>`;

/**
 * Cota lineal entre dos puntos: línea con trazos de tope en los extremos y la etiqueta en medio.
 * etiquetaEn: 'medio' (sobre la línea) o un desplazamiento [dx, dy] desde el centro.
 */
export function cota(x1, y1, x2, y2, t, { color = T.tinta, p = null, desplaza = [0, 0], tope = 6 } = {}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const n = Math.hypot(dx, dy) || 1;
  const [nx, ny] = [-dy / n, dx / n];
  const tk = (x, y) => `<line x1="${f1(x - nx * tope)}" y1="${f1(y - ny * tope)}" x2="${f1(x + nx * tope)}" y2="${f1(y + ny * tope)}" stroke="${color}" stroke-width="1.2"/>`;
  return `<g${parte(p)}><line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${color}" stroke-width="1"/>${tk(x1, y1)}${tk(x2, y2)}` +
    (t ? etiqueta((x1 + x2) / 2 + desplaza[0], (y1 + y2) / 2 + desplaza[1], t, { color }) : '') + '</g>';
}

/** Arco entre dos direcciones náuticas, de a a b en sentido horario. */
export function arcoD(cx, cy, r, a, b) {
  const span = ((b - a) % 360 + 360) % 360 || 360;
  const [x1, y1] = pol(cx, cy, a, r);
  const [x2, y2] = pol(cx, cy, a + span, r);
  return `M${f1(x1)},${f1(y1)} A${f1(r)},${f1(r)} 0 ${span > 180 ? 1 : 0} 1 ${f1(x2)},${f1(y2)}`;
}

/** Cota de ángulo: arco (de a a b, sentido horario) con topes radiales y la etiqueta en el ángulo medio, a radio rEt. */
export function cotaArco(cx, cy, r, a, b, t, { color = T.tinta, p = null, rEt = null, tope = 6 } = {}) {
  const span = ((b - a) % 360 + 360) % 360 || 360;
  const tk = (d) => { const [x1, y1] = pol(cx, cy, d, r - tope); const [x2, y2] = pol(cx, cy, d, r + tope); return `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${color}" stroke-width="1.2"/>`; };
  const [ex, ey] = pol(cx, cy, a + span / 2, rEt ?? r);
  return `<g${parte(p)}><path d="${arcoD(cx, cy, r, a, b)}" fill="none" stroke="${color}" stroke-width="1"/>${tk(a)}${tk(a + span)}` + (t ? etiqueta(ex, ey, t, { color }) : '') + '</g>';
}

/** Flecha con la punta dibujada (toma el color de su variable en cualquier tema). */
export function flecha(x1, y1, x2, y2, { color = T.tinta, w = TRAZO.fuerte, p = null, punta = null, discontinua = false, extra = '' } = {}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const n = Math.hypot(dx, dy) || 1;
  const [ux, uy] = [dx / n, dy / n];
  const s = punta ?? 6 + w * 1.6;
  const [hx, hy] = [x2 - ux * s, y2 - uy * s];
  return `<g${parte(p)}${extra ? ` ${extra}` : ''}><line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(hx)}" y2="${f1(hy)}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"${discontinua ? ' stroke-dasharray="5 4"' : ''}/>` +
    `<polygon points="${f1(x2)},${f1(y2)} ${f1(hx - uy * s * 0.5)},${f1(hy + ux * s * 0.5)} ${f1(hx + uy * s * 0.5)},${f1(hy - ux * s * 0.5)}" fill="${color}"/></g>`;
}

/** Líneas de agua de la carta: una discontinua larga y otra punteada, paralelas, de x1 a x2 a la altura y. */
export const ondas = (x1, x2, y, { sep = 10 } = {}) =>
  `<line x1="${f1(x1)}" y1="${f1(y)}" x2="${f1(x2)}" y2="${f1(y)}" stroke="${T.lineaAgua}" stroke-width="1" stroke-dasharray="7 4"/>` +
  `<line x1="${f1(x1)}" y1="${f1(y + sep)}" x2="${f1(x2)}" y2="${f1(y + sep)}" stroke="${T.lineaAgua}" stroke-width=".7" stroke-dasharray="3 6"/>`;

/** Línea de agua curva (para mares abiertos): una ondulación suave a lo ancho. */
export function ondaCurva(x1, x2, y, { amp = 6, fina = false } = {}) {
  const w = x2 - x1;
  return `<path d="M${f1(x1)},${f1(y)} C${f1(x1 + w * 0.17)},${f1(y + amp)} ${f1(x1 + w * 0.33)},${f1(y - amp)} ${f1(x1 + w * 0.5)},${f1(y)} S${f1(x1 + w * 0.83)},${f1(y + amp)} ${f1(x2)},${f1(y)}" fill="none" stroke="${T.lineaAgua}" stroke-width="${fina ? 0.7 : 1}" stroke-dasharray="${fina ? '3 6' : '7 4'}"/>`;
}

/** Tierra de carta: el trazado relleno de tierra, con punteado y su línea de costa. */
export const tierra = (d, pt, { p = null } = {}) => `<g${parte(p)}><path d="${d}" fill="${T.tierra}" stroke="${T.tinta}" stroke-width="1"/><path d="${d}" fill="${pt}" stroke="none" opacity=".5"/></g>`;

/** Reloj (o rosa pequeña): esfera graduada con una flecha magenta en la dirección `deg`. */
export function reloj(cx, cy, r, deg, { color = T.magenta, p = null, norte = false } = {}) {
  const per = 2 * Math.PI * (r - 2);
  const o = [`<g${parte(p)} transform="translate(${f1(cx)} ${f1(cy)})"><circle r="${r}" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.4"/>`,
    `<circle r="${r - 4}" fill="none" stroke="${T.tinta}" stroke-width=".6"/>`,
    `<circle r="${r - 2}" fill="none" stroke="${T.tinta}" stroke-width="4" stroke-dasharray="1 ${f1(per / 12 - 1)}" transform="rotate(-90.4)"/>`];
  const [x, y] = pol(0, 0, deg, r - 8);
  const [hx, hy] = pol(0, 0, deg, r - 12);
  const [ax, ay] = pol(hx, hy, deg + 90, 4);
  const [bx, by] = pol(hx, hy, deg - 90, 4);
  const [tx, ty] = pol(0, 0, deg, r - 4);
  o.push(`<line x1="0" y1="0" x2="${f1(x)}" y2="${f1(y)}" stroke="${color}" stroke-width="2" stroke-linecap="round"/>`,
    `<polygon points="${f1(ax)},${f1(ay)} ${f1(bx)},${f1(by)} ${f1(tx)},${f1(ty)}" fill="${color}"/>`, `<circle r="2.2" fill="${T.tinta}"/>`);
  if (norte) o.push(rotulo(0, -r - 4, 'N', { size: TXT.min, weight: 700, estilo: 'serif' }));
  o.push('</g>');
  return o.join('');
}

/** Rosa pequeña de orientación (el norte de la lámina). */
export function rosaNorte(cx, cy, r = 14) {
  return `<g transform="translate(${f1(cx)} ${f1(cy)})"><circle r="${r}" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1"/>` +
    `<polygon points="0,${-r + 2} 4,0 0,${r - 2} -4,0" fill="${T.papel}" stroke="${T.tinta}" stroke-width=".8"/><polygon points="0,${-r + 2} 4,0 -4,0" fill="${T.tinta}"/>` +
    rotulo(0, -r - 4, 'N', { size: TXT.min, weight: 700, estilo: 'serif' }) + '</g>';
}

/** Número de paso en un círculo (sin caracteres especiales: se lee igual en todos los móviles). */
export const paso = (x, y, n, { color = T.magenta, p = null } = {}) =>
  `<g${parte(p)}><circle cx="${f1(x)}" cy="${f1(y)}" r="9" fill="${T.papel}" stroke="${color}" stroke-width="1.4"/>${rotulo(x, y + 4.2, String(n), { size: TXT.rotulo, weight: 700, estilo: 'serif', color })}</g>`;

/** Casco en planta, proa hacia arriba, centrado en (0, 0): L eslora y B manga. */
export const cascoPlanta = (L, B) => `M0,${f1(-L / 2)} C${f1(B * 0.55)},${f1(-L / 2 + L * 0.2)} ${f1(B / 2)},${f1(-L * 0.06)} ${f1(B / 2)},${f1(L * 0.14)} L${f1(B * 0.4)},${f1(L / 2)} L${f1(-B * 0.4)},${f1(L / 2)} L${f1(-B / 2)},${f1(L * 0.14)} C${f1(-B / 2)},${f1(-L * 0.06)} ${f1(-B * 0.55)},${f1(-L / 2 + L * 0.2)} 0,${f1(-L / 2)}Z`;

/** Barco en planta dibujado en (cx, cy) con la proa a `rumbo`. */
export function barco(cx, cy, rumbo, L = 40, { p = 'barco', crujia = true, relleno = T.casco } = {}) {
  return `<g${parte(p)} transform="translate(${f1(cx)} ${f1(cy)}) rotate(${f1(rumbo)})"><path d="${cascoPlanta(L, L * 0.34)}" fill="${relleno}" stroke="${T.tinta}" stroke-width="1.4" stroke-linejoin="round"/>` +
    (crujia ? `<line x1="0" y1="${f1(-L / 2 + 5)}" x2="0" y2="${f1(L / 2 - 3)}" stroke="${T.tinta}" stroke-width=".6"/>` : '') + '</g>';
}

/** Silueta pequeña de barco (para animateMotion con rotate="auto": apunta hacia +x). */
export const barquito = (s = 1, color = T.tinta) => `<path d="M${f1(13 * s)},0 C${f1(6 * s)},${f1(-5 * s)} ${f1(-4 * s)},${f1(-5 * s)} ${f1(-7 * s)},${f1(-4.5 * s)} L${f1(-7 * s)},${f1(4.5 * s)} C${f1(-4 * s)},${f1(5 * s)} ${f1(6 * s)},${f1(5 * s)} ${f1(13 * s)},0Z" fill="${T.casco}" stroke="${color}" stroke-width="1.3" stroke-linejoin="round"/>`;
