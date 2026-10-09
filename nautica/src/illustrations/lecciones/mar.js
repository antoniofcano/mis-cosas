// Láminas de meteorología y mar (Patrón de Yate UT 2 y PER UT 9): vientos regionales, nubes, olas,
// corrientes del Estrecho y vocabulario del viento. Funciones puras spec → { svg, caption }.
// Los colores de superficies y acentos van con variables CSS de styles/app.css para leerse en claro y oscuro.

import { open, title, pol, fx } from '../kit.js';
import { nubesC, olaC, GENEROS_C, PARTES_OLA_C, PISOS_NUBES } from '../py-cola-meteo-c.js';

// Acentos que se adaptan al tema (texto, trazos y puntas de flecha).
const K = { v: 'var(--l-v)', r: 'var(--l-r)', a: 'var(--l-a)', m: 'var(--l-m)', p: 'var(--l-p)', g: 'var(--l-g)', t: 'currentColor' };

/** Puntas de flecha propias, con los colores del tema. */
const marks = (id) => `<defs>${Object.entries(K).map(([k, c]) => `<marker id="${id}-k${k}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" style="fill:${c}"/></marker>`).join('')}</defs>`;
const start = (W, H, label, id) => [...open(W, H, label, id), marks(id)];

/** Flecha con color del tema; doble = punta en los dos extremos. */
const flecha = (x1, y1, x2, y2, k, id, w = 2.2, { doble = false, extra = '' } = {}) =>
  `<line x1="${fx(x1)}" y1="${fx(y1)}" x2="${fx(x2)}" y2="${fx(y2)}" style="stroke:${K[k]}" stroke-width="${w}" marker-end="url(#${id}-k${k})"${doble ? ` marker-start="url(#${id}-k${k})"` : ''} ${extra}/>`;

/** Texto: o = { c: clave de K o color, a: anchor, s: tamaño, b: negrita, extra } */
const tx = (x, y, t, o = {}) => {
  const c = o.c ? (K[o.c] ?? o.c) : null;
  return `<text x="${fx(x)}" y="${fx(y)}" class="il-lbl" text-anchor="${o.a ?? 'start'}"${c ? ` style="fill:${c}"` : ''}${o.s ? ` font-size="${o.s}"` : ''}${o.b ? ' font-weight="700"' : ''} ${o.extra ?? ''}>${t}</text>`;
};
const lista = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
const close = (out) => { out.push('</svg>'); return out.join(''); };

// ===========================================================================
// 1. Vientos regionales (py-2-4). spec: { tipo:'vientos-regionales', vista:'rosa'|'mapa', resaltar?: viento o lista }

export const VIENTOS = {
  tramontana: { rumbo: 0, ab: 'N', nombre: 'tramontana', alias: '', nota: 'fría y seca', clase: 'frio' },
  gregal: { rumbo: 45, ab: 'NE', nombre: 'gregal', alias: '', nota: 'húmedo, nubes', clase: null },
  levante: { rumbo: 90, ab: 'E', nombre: 'levante', alias: 'Estrecho,', nota: 'mayo a octubre', clase: null },
  siroco: { rumbo: 135, ab: 'SE', nombre: 'siroco', alias: 'xaloc', nota: 'sahariano, cálido', clase: 'calido' },
  mediodia: { rumbo: 180, ab: 'S', nombre: 'mediodía', alias: 'migjorn, ostro', nota: 'cálido', clase: 'calido' },
  lebeche: { rumbo: 225, ab: 'SW', nombre: 'lebeche', alias: 'llebeig, garbí', nota: 'cálido y seco', clase: 'calido' },
  poniente: { rumbo: 270, ab: 'W', nombre: 'poniente', alias: '', nota: 'atlántico', clase: null },
  mistral: { rumbo: 315, ab: 'NW', nombre: 'mistral', alias: 'mestral', nota: 'frío y seco', clase: 'frio' },
};
const VIENTOS_MAPA = ['mistral', 'tramontana', 'levante', 'poniente', 'siroco', 'lebeche', 'galerna', 'vendaval', 'alisios'];
const colorClase = (c) => (c === 'frio' ? 'v' : c === 'calido' ? 'r' : 't');

function rosaVientos(hl, id) {
  const W = 320;
  const H = 328;
  const out = start(W, H, 'Rosa de los vientos mediterránea', id);
  out.push(title(160, 'Rosa de los vientos mediterránea'));
  const cx = 160;
  const cy = 142;
  out.push(`<circle cx="${cx}" cy="${cy}" r="44" fill="none" stroke="currentColor" stroke-opacity=".35"/>`, `<circle cx="${cx}" cy="${cy}" r="12" fill="none" stroke="currentColor" stroke-opacity=".35"/>`);
  for (const [k, v] of Object.entries(VIENTOS)) {
    const on = !hl.size || hl.has(k);
    const c = colorClase(v.clase);
    const [x1, y1] = pol(cx, cy, v.rumbo, 62);
    const [x2, y2] = pol(cx, cy, v.rumbo, 17);
    out.push(`<g opacity="${on ? 1 : 0.35}">${flecha(x1, y1, x2, y2, c, id, hl.has(k) ? 3.6 : 2.2)}</g>`);
    // Etiqueta: rumbo y nombre, alias y carácter.
    const d = v.rumbo % 90 === 0 ? 74 : 70;
    let [lx, ly] = pol(cx, cy, v.rumbo, d);
    const a = v.rumbo === 0 || v.rumbo === 180 ? 'middle' : v.rumbo < 180 ? 'start' : 'end';
    const lines = [[`${v.ab} · ${v.nombre}`, true], ...(v.alias ? [[v.alias, false]] : []), [v.nota, false]];
    if (v.rumbo === 0) ly -= 12 * (lines.length - 1) + 2;
    else if (v.rumbo === 180) ly += 8;
    else if (v.rumbo === 90 || v.rumbo === 270) ly -= 6 * (lines.length - 1) - 4;
    else if (v.rumbo === 45 || v.rumbo === 315) ly -= 12 * (lines.length - 1) - 2;
    else ly += 6;
    lines.forEach(([t, b], i) => out.push(tx(lx, ly + i * 12, t, { a, b: b || hl.has(k), c: i === 0 && v.clase ? colorClase(v.clase) : null, s: i === 0 ? 11 : 10, extra: on ? '' : 'opacity=".45"' })));
  }
  const y = 274;
  out.push(`<line x1="14" y1="${y - 14}" x2="306" y2="${y - 14}" stroke="currentColor" stroke-opacity=".25"/>`);
  out.push(tx(14, y, 'Atlántico ibérico:', { b: true }), tx(14, y + 13, 'vendaval y ábrego (SW) · galerna (Cantábrico)'));
  out.push(tx(14, y + 26, 'nordeste (Galicia) y alisios (Canarias) (NE)'));
  out.push(tx(14, y + 46, 'Se nombra por de dónde viene.', { b: true }), tx(306, y + 46, 'azul frío · rojo cálido', { a: 'end', s: 10 }));
  return close(out);
}

// Proyección sencilla de la Península (lon, lat) → px.
const PX = (lon) => 22 + (lon + 10) * 17;
const PY = (lat) => 40 + (45.2 - lat) * 20;
const poly = (pts) => pts.map(([lo, la], i) => `${i ? 'L' : 'M'}${fx(PX(lo))},${fx(PY(la))}`).join('') + 'Z';
const IBERIA = [[-1.6, 46], [-1.5, 43.4], [-3.8, 43.45], [-5.8, 43.6], [-7.9, 43.8], [-8.3, 43.4], [-9.3, 43.1], [-8.9, 42.0], [-8.8, 41.0], [-9.5, 38.8], [-8.9, 38.5], [-8.8, 37.9], [-9.0, 37.0], [-7.4, 37.2], [-6.4, 36.8], [-6.0, 36.2], [-5.6, 36.0], [-5.3, 36.15], [-4.4, 36.7], [-2.2, 36.7], [-1.6, 37.3], [-0.7, 37.6], [-0.5, 38.3], [0.2, 38.75], [-0.3, 39.4], [0.9, 40.7], [2.2, 41.4], [3.2, 41.9], [3.3, 42.3], [3.05, 42.8], [3.1, 43.1], [4.0, 43.55], [4.8, 43.4], [5.6, 43.2], [6.0, 46]];
const AFRICA = [[-6.6, 34.0], [-6.0, 35.6], [-5.4, 35.92], [-5.3, 35.88], [-4.6, 35.2], [-3.0, 35.25], [-1.6, 35.1], [-1.2, 34.0]];
const ISLAS = [[2.95, 39.6, 9, 6], [4.1, 40.0, 5, 3], [1.4, 38.95, 4, 3]];

function mapaVientos(hl, id) {
  const W = 320;
  const H = 310;
  const out = start(W, H, 'Vientos regionales de la Península', id);
  out.push(`<rect x="0" y="30" width="${W}" height="${H - 58}" style="fill:var(--l-mar)" opacity=".7"/>`);
  out.push(`<path d="${poly(IBERIA)}" style="fill:var(--land);stroke:var(--land-stroke)" stroke-width="1"/>`, `<path d="${poly(AFRICA)}" style="fill:var(--land);stroke:var(--land-stroke)" stroke-width="1"/>`);
  for (const [lo, la, rx, ry] of ISLAS) out.push(`<ellipse cx="${fx(PX(lo))}" cy="${fx(PY(la))}" rx="${rx}" ry="${ry}" style="fill:var(--land);stroke:var(--land-stroke)"/>`);
  out.push(`<rect x="0" y="22" width="${W}" height="10" class="il-panel"/>`, title(160, 'Vientos regionales: de dónde soplan'));
  // [clave, desde (lon,lat), hasta (lon,lat), color, etiqueta [x, y, anchor, líneas]]
  const F = [
    ['galerna', [-7.2, 44.75], [-3.4, 44.2], 'p', [PX(-5.3), PY(44.75) - 6, 'middle', ['galerna (W-NW) · Cantábrico']]],
    ['mistral', [3.9, 45.0], [5.6, 43.0], 'v', [306, PY(43.0) + 14, 'end', ['mistral', '(NW)']]],
    ['tramontana', [3.8, 43.0], [3.8, 41.8], 'v', [PX(3.8) - 9, PY(42.3), 'end', ['tramontana', '(N)']]],
    ['siroco', [4.5, 38.5], [3.3, 39.2], 'r', [PX(4.3), PY(38.5) + 14, 'middle', ['siroco (SE)']]],
    ['lebeche', [-0.2, 37.2], [0.7, 38.1], 'r', [PX(-0.2) + 2, PY(37.2) + 14, 'start', ['lebeche (SW)']]],
    ['levante', [-2.4, 36.2], [-4.3, 36.2], 't', [152, PY(36.2) + 22, 'middle', ['levante (E)']]],
    ['poniente', [-7.6, 36.05], [-5.9, 36.05], 't', [74, PY(36.05) + 22, 'middle', ['poniente (W)']]],
    ['vendaval', [-9.8, 35.7], [-8.2, 36.7], 'a', [16, PY(35.7) + 32, 'start', ['vendaval (SW)']]],
  ];
  for (const [k, [lo1, la1], [lo2, la2], c, [lx, ly, a, lines]] of F) {
    const on = !hl.size || hl.has(k);
    out.push(`<g opacity="${on ? 1 : 0.3}">${flecha(PX(lo1), PY(la1), PX(lo2), PY(la2), c, id, hl.has(k) ? 3.6 : 2.4)}${lines.map((t, i) => tx(lx, ly + i * 12, t, { a, b: true, c, s: i ? 10 : 11 })).join('')}</g>`);
  }
  out.push(tx(PX(-3.3), PY(39.8), 'PENÍNSULA', { a: 'middle', s: 10, extra: 'opacity=".55" letter-spacing="1"' }));
  // Recuadro de Canarias con los alisios.
  const bx = 196;
  const by = 224;
  const on = !hl.size || hl.has('alisios');
  out.push(`<rect x="${bx}" y="${by}" width="116" height="52" rx="6" class="il-panel" stroke="currentColor" stroke-opacity=".4"/>`);
  out.push(`<g opacity="${on ? 1 : 0.3}">`);
  for (const [x, y, rx] of [[228, 262, 5], [242, 259, 6], [256, 263, 5], [270, 261, 4], [214, 260, 3], [284, 257, 4], [296, 254, 4]]) out.push(`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="3" style="fill:var(--land);stroke:var(--land-stroke)"/>`);
  out.push(flecha(306, 232, 282, 250, 'a', id, hl.has('alisios') ? 3.6 : 2.4), tx(bx + 6, by + 13, 'alisios (NE)', { b: true, c: 'a', s: 11 }), tx(bx + 6, by + 25, 'Canarias', { s: 10 }));
  out.push('</g>');
  out.push(tx(14, H - 14, 'Flecha: hacia dónde sopla. Azul frío, rojo cálido.', { s: 10 }));
  return close(out);
}

export function vientosRegionalesIllustration(spec) {
  const vista = spec.vista ?? 'rosa';
  if (!['rosa', 'mapa'].includes(vista)) return null;
  const hl = new Set(lista(spec.resaltar));
  if (vista === 'rosa') {
    return { svg: rosaVientos(hl, 'vrr'), caption: 'Cada rumbo tiene su viento: N tramontana, NE gregal, E levante, SE siroco, S mediodía, SW lebeche, W poniente y NW mistral. Las flechas van hacia donde sopla el viento; su nombre es el del rumbo del que viene.' };
  }
  return { svg: mapaVientos(hl, 'vrm'), caption: 'Mistral (NW) y tramontana (N), fríos y secos; siroco (SE) y lebeche (SW), cálidos; levante y poniente en el Estrecho; vendaval (SW) en el golfo de Cádiz; galerna en el Cantábrico, y alisios (NE) en Canarias. Esquema sin escala.' };
}

// ===========================================================================
// 2 y 3. Nubes (py-2-6) y olas (py-2-8): en estilo C, en src/illustrations/py-cola-meteo-c.js.

export const GENEROS = GENEROS_C;
export const PARTES_OLA = PARTES_OLA_C;
const linea = (p) => p.map(([x, y], i) => `${i ? 'L' : 'M'}${fx(x)},${fx(y)}`).join('');

// ===========================================================================
// 4. Corrientes en el Estrecho (py-2-9). spec: { tipo:'corriente-estrecho', vista:'corte'|'tipos', resaltar? (tipos): 'densidad'|'arrastre'|'gradiente'|'marea' }

function estrechoCorte() {
  const W = 320;
  const H = 326;
  const id = 'cec';
  const out = start(W, H, 'Corrientes del Estrecho de Gibraltar en dos capas', id);
  out.push(title(160, 'El Estrecho de Gibraltar en dos capas'));
  const ys = 92;
  // Evaporación sobre el Mediterráneo.
  out.push(`<circle cx="298" cy="42" r="7" style="fill:var(--l-faro)"/>`);
  for (const x of [204, 220, 236]) out.push(`<path d="M${x},74 q-4,-6 0,-12 q4,-6 0,-12" fill="none" style="stroke:var(--l-a)" stroke-width="1.6" marker-end="url(#${id}-ka)"/>`);
  out.push(tx(246, 64, 'evaporación', { c: 'a', b: true, s: 10 }));
  out.push(tx(14, 86, 'ATLÁNTICO (W)', { b: true, s: 11 }), tx(306, 86, 'MEDITERRÁNEO (E)', { b: true, s: 11, a: 'end' }));
  // Agua y fondo con el umbral.
  const fondo = 'M14,290 C80,288 112,272 138,236 C150,216 168,216 180,236 C206,272 250,288 306,290';
  out.push(`<path d="M14,${ys} L306,${ys} L306,290 L14,290Z" style="fill:var(--l-mar)"/>`);
  out.push(`<path d="M14,${ys} L306,${ys} L306,${ys + 60} C220,${ys + 62} 100,${ys + 54} 14,${ys + 52}Z" style="fill:var(--l-cielo)" opacity=".55"/>`);
  out.push(`<path d="M14,${ys + 52} C100,${ys + 54} 220,${ys + 62} 306,${ys + 60}" fill="none" stroke="currentColor" stroke-opacity=".45" stroke-dasharray="4 3"/>`);
  out.push(`<path d="${fondo} L306,300 L14,300Z" style="fill:var(--land);stroke:var(--land-stroke)"/>`, `<line x1="14" y1="${ys}" x2="306" y2="${ys}" style="stroke:var(--l-v)" stroke-width="1.6"/>`);
  out.push(tx(159, 246, 'umbral', { a: 'middle', s: 10 }));
  // Capa superior: agua atlántica entra hacia el E.
  out.push(flecha(30, ys + 16, 290, ys + 16, 'v', id, 3.2));
  out.push(tx(20, ys + 34, 'agua atlántica, menos densa:', { b: true, c: 'v' }), tx(20, ys + 46, 'entra en superficie hacia el E', { c: 'v' }));
  // Capa profunda: agua mediterránea sale hacia el W, por encima del umbral.
  out.push(`<path d="M296,${ys + 82} L196,${ys + 82} C176,${ys + 82} 168,${ys + 88} 150,${ys + 92} C130,${ys + 96} 96,${ys + 118} 36,${ys + 126}" fill="none" style="stroke:var(--l-r)" stroke-width="3.2" marker-end="url(#${id}-kr)"/>`);
  out.push(tx(306, ys + 104, 'agua mediterránea,', { a: 'end', b: true, c: 'r' }), tx(306, ys + 116, 'más salada y densa:', { a: 'end', b: true, c: 'r' }), tx(306, ys + 128, 'sale por el fondo al W', { a: 'end', c: 'r' }));
  out.push(tx(14, 310, 'En superficie, hasta unos 2 nudos frente a Tarifa; poniente', { s: 10 }), tx(14, 322, 'y levante la refuerzan o la frenan, y se suman las mareas.', { s: 10 }));
  return close(out);
}

export const TIPOS_CORRIENTE = {
  densidad: ['Densidad', '(termohalinas)', ['diferencias de temperatura', 'y salinidad; lentas,', 'casi todas las profundas']],
  arrastre: ['Arrastre', '(o de deriva)', ['acción directa del viento', 'que sopla con persistencia', 'sobre la superficie']],
  gradiente: ['Gradiente', '', ['diferencias de presión', 'que desnivelan o inclinan', 'la superficie del mar']],
  marea: ['Marea', '', ['atracción de la Luna', 'y el Sol; fuertes en', 'estrechos y canales']],
};

function iconoTipo(k, x, y, id) {
  const agua = (yy, h = 18) => `<rect x="${x - 34}" y="${yy}" width="68" height="${h}" rx="2" style="fill:var(--l-mar)"/>`;
  switch (k) {
    case 'densidad':
      return `${agua(y - 10, 26)}<rect x="${x - 34}" y="${y - 10}" width="34" height="26" style="fill:var(--l-calido)" opacity=".8"/><rect x="${x}" y="${y - 10}" width="34" height="26" style="fill:var(--l-frio)"/>${tx(x - 17, y + 7, 'T, S', { a: 'middle', s: 10 })}${tx(x + 17, y + 7, 'T, S', { a: 'middle', s: 10 })}${flecha(x - 22, y + 13, x + 22, y + 13, 'v', id, 1.6)}`;
    case 'arrastre':
      return `${agua(y + 2, 14)}${flecha(x - 30, y - 10, x + 22, y - 10, 't', id, 1.6)}${tx(x + 28, y - 7, 'viento', { s: 10 })}${flecha(x - 24, y + 9, x + 20, y + 9, 'v', id, 2.2)}`;
    case 'gradiente':
      return `<path d="M${x - 34},${y - 10} L${x + 34},${y + 2} L${x + 34},${y + 16} L${x - 34},${y + 16}Z" style="fill:var(--l-mar)"/><line x1="${x - 34}" y1="${y - 10}" x2="${x + 34}" y2="${y + 2}" style="stroke:var(--l-v)" stroke-width="1.6"/>${flecha(x - 22, y + 4, x + 20, y + 11, 'v', id, 2.2)}`;
    case 'marea':
      return `${agua(y + 2, 14)}<circle cx="${x - 22}" cy="${y - 8}" r="7" style="fill:var(--l-faro)"/><path d="M${x + 22},${y - 15} a7,7 0 1,0 6,11 a5.5,5.5 0 1,1 -6,-11z" style="fill:var(--l-g)"/>${flecha(x - 22, y + 9, x + 20, y + 9, 'v', id, 2.2, { doble: true })}`;
    default:
      return '';
  }
}

function tiposCorriente(hl) {
  const W = 320;
  const H = 284;
  const id = 'cet';
  const out = start(W, H, 'Tipos de corriente por su causa', id);
  out.push(title(160, 'Tipos de corriente según su causa'));
  Object.entries(TIPOS_CORRIENTE).forEach(([k, [nom, sub, lines]], i) => {
    const x = 10 + (i % 2) * 152;
    const y = 34 + Math.floor(i / 2) * 106;
    const on = !hl.size || hl.has(k);
    const fuerte = hl.has(k);
    out.push(`<g opacity="${on ? 1 : 0.35}"><rect x="${x}" y="${y}" width="146" height="100" rx="8" fill="none" style="stroke:${fuerte ? 'var(--l-r)' : 'currentColor'}" stroke-opacity="${fuerte ? 1 : 0.3}" stroke-width="${fuerte ? 2.4 : 1}"/>`);
    out.push(tx(x + 8, y + 16, nom, { b: true, s: 12, c: fuerte ? 'r' : null }), sub ? tx(x + 8 + nom.length * 7.2 + 4, y + 16, sub, { s: 10 }) : '');
    out.push(iconoTipo(k, x + 73, y + 38, id));
    lines.forEach((t, j) => out.push(tx(x + 8, y + 68 + j * 12, t, { s: 10 })));
    out.push('</g>');
  });
  out.push(tx(14, H - 26, 'Se nombran por hacia dónde van.', { s: 10, b: true }), tx(14, H - 12, 'Coriolis las desvía a la derecha en el hemisferio norte.', { s: 10 }));
  return close(out);
}

export function corrienteEstrechoIllustration(spec) {
  const vista = spec.vista ?? 'corte';
  if (vista === 'corte') {
    return { svg: estrechoCorte(), caption: 'El Mediterráneo pierde por evaporación más agua de la que recibe y es más salado y denso. Por eso, en el Estrecho el agua atlántica entra en superficie hacia el E y la mediterránea sale por el fondo hacia el W.' };
  }
  if (vista === 'tipos') {
    const hl = new Set(lista(spec.resaltar));
    for (const k of hl) if (!TIPOS_CORRIENTE[k]) return null;
    return { svg: tiposCorriente(hl), caption: 'De densidad o termohalinas (temperatura y salinidad), de arrastre o deriva (viento persistente), de gradiente (desnivel por diferencias de presión) y de marea (Luna y Sol).' };
  }
  return null;
}

// ===========================================================================
// 5. El viento: rolar, refrescar, caer… e instrumentos (per-9-3).
// spec: { tipo:'rolar', vista:'vocabulario'|'instrumentos', resaltar? (vocabulario): 'rolar'|'refrescar'|'caer'|'calmar'|'racha'|'racheado' }

export const PALABRAS_VIENTO = {
  refrescar: ['Refrescar', 'sube y se mantiene', [[0, 9], [40, 9], [52, 22], [100, 22]]],
  caer: ['Caer (amainar)', 'baja y se mantiene', [[0, 22], [40, 22], [52, 9], [100, 9]]],
  calmar: ['Calmar', 'cesa del todo o casi', [[0, 16], [40, 16], [56, 1], [100, 1]]],
  racha: ['Racha', 'subida brusca y breve', [[0, 10], [42, 10], [48, 25], [54, 10], [100, 10]]],
  racheado: ['Racheado', 'sube y baja sin parar', [[0, 10], [10, 22], [20, 8], [30, 20], [40, 12], [50, 24], [60, 9], [70, 21], [80, 11], [90, 23], [100, 10]]],
};

function vocabulario(hl) {
  const W = 320;
  const H = 330;
  const id = 'rov';
  const out = start(W, H, 'El viento: dirección e intensidad', id);
  out.push(title(160, 'El viento: dirección e intensidad'));
  // Dirección: rolar del SW al W en una rosa pequeña.
  const ron = !hl.size || hl.has('rolar');
  const fr = hl.has('rolar');
  out.push(`<g opacity="${ron ? 1 : 0.35}">`);
  out.push(`<rect x="8" y="32" width="304" height="112" rx="8" fill="none" style="stroke:${fr ? 'var(--l-r)' : 'currentColor'}" stroke-opacity="${fr ? 1 : 0.3}" stroke-width="${fr ? 2.4 : 1}"/>`);
  out.push(tx(128, 52, 'DIRECCIÓN', { b: true, s: 11 }));
  const cx = 68;
  const cy = 92;
  out.push(`<circle cx="${cx}" cy="${cy}" r="38" fill="none" stroke="currentColor" stroke-opacity=".35"/>`);
  for (const [d, t] of [[0, 'N'], [90, 'E'], [180, 'S'], [270, 'W']]) {
    const [x, y] = pol(cx, cy, d, 46);
    out.push(tx(x, y + 4, t, { a: 'middle', b: true, s: 10 }));
  }
  const [a1, b1] = pol(cx, cy, 225, 37);
  const [a2, b2] = pol(cx, cy, 270, 37);
  out.push(flecha(a1, b1, cx - 3, cy - 3, 'g', id, 2, { extra: 'stroke-dasharray="4 3"' }));
  out.push(flecha(a2, b2, cx - 4, cy, 'v', id, 3));
  const p1 = pol(cx, cy, 236, 28);
  const p2 = pol(cx, cy, 258, 28);
  out.push(`<path d="M${fx(p1[0])},${fx(p1[1])} A28,28 0 0 1 ${fx(p2[0])},${fx(p2[1])}" fill="none" style="stroke:${K[fr ? 'r' : 'a']}" stroke-width="1.8" marker-end="url(#${id}-k${fr ? 'r' : 'a'})"/>`);
  out.push(tx(128, 70, 'Rolar: cambia de dirección', { b: true, c: fr ? 'r' : null, s: 11 }), tx(128, 83, 'y se mantiene en la nueva.', { s: 10.5 }), tx(128, 96, 'Aquí rola del SW (gris) al W (azul).', { s: 10.5 }));
  out.push(tx(128, 118, 'Se nombra por de dónde viene:', { s: 10.5, b: true }), tx(128, 131, 'un poniente viene del W.', { s: 10.5 }));
  out.push('</g>');
  // Intensidad: gráficas de fuerza frente a tiempo.
  out.push(tx(16, 166, 'INTENSIDAD', { b: true, s: 11 }), tx(306, 166, 'fuerza ↑ · tiempo →', { a: 'end', s: 10 }));
  Object.entries(PALABRAS_VIENTO).forEach(([k, [nom, desc, pts]], i) => {
    const x = 8 + (i % 2) * 154;
    const y = 174 + Math.floor(i / 2) * 46;
    const on = !hl.size || hl.has(k);
    const f = hl.has(k);
    out.push(`<g opacity="${on ? 1 : 0.35}"><rect x="${x}" y="${y}" width="150" height="42" rx="6" fill="none" style="stroke:${f ? 'var(--l-r)' : 'currentColor'}" stroke-opacity="${f ? 1 : 0.3}" stroke-width="${f ? 2.4 : 1}"/>`);
    out.push(tx(x + 7, y + 16, nom, { b: true, c: f ? 'r' : null, s: 11 }), tx(x + 7, y + 34, desc, { s: 10 }));
    const gx = x + 104;
    const gy = y + 22;
    out.push(`<line x1="${gx}" y1="${gy}" x2="${gx + 40}" y2="${gy}" stroke="currentColor" stroke-opacity=".4"/><line x1="${gx}" y1="${gy}" x2="${gx}" y2="${gy - 18}" stroke="currentColor" stroke-opacity=".4"/>`);
    out.push(`<path d="${linea(pts.map(([px, py]) => [gx + 2 + px * 0.38, gy - 1 - py * 0.65]))}" fill="none" style="stroke:${K[f ? 'r' : 'v']}" stroke-width="2" stroke-linejoin="round"/>`);
    out.push('</g>');
  });
  const lx = 8 + 154;
  const ly = 174 + 2 * 46;
  out.push(tx(lx + 7, ly + 15, '«Refrescar» no habla', { s: 10 }), tx(lx + 7, ly + 28, 'de temperatura.', { s: 10 }));
  out.push(tx(14, H - 9, 'Rolar es dirección; lo demás, intensidad.', { b: true, s: 10.5 }));
  return close(out);
}

function instrumentos() {
  const W = 320;
  const H = 250;
  const id = 'roi';
  const out = start(W, H, 'Instrumentos del viento', id);
  out.push(title(160, 'Instrumentos del viento'));
  out.push(flecha(24, 44, 120, 44, 'v', id, 2.4), tx(128, 48, 'viento (del W)', { c: 'v', s: 10.5 }));
  const base = 160;
  // Anemómetro de cazoletas: gira más deprisa cuanto más sopla.
  const ax = 54;
  const ay = 100;
  out.push(`<line x1="${ax}" y1="${ay}" x2="${ax}" y2="${base}" stroke="currentColor" stroke-width="2"/>`);
  out.push(`<g><g>${[0, 120, 240].map((d) => { const [x, y] = pol(ax, ay, d, 22); return `<line x1="${ax}" y1="${ay}" x2="${fx(x)}" y2="${fx(y)}" stroke="currentColor" stroke-width="1.6"/><circle cx="${fx(x)}" cy="${fx(y)}" r="6" style="fill:var(--l-a)" stroke="currentColor"/>`; }).join('')}<animateTransform attributeName="transform" type="rotate" from="0 ${ax} ${ay}" to="360 ${ax} ${ay}" dur="1.6s" repeatCount="indefinite"/></g></g>`);
  out.push(`<circle cx="${ax}" cy="${ay}" r="3" style="fill:currentColor"/>`);
  out.push(tx(ax, 182, 'Anemómetro', { a: 'middle', b: true, s: 11 }), tx(ax, 196, 'mide la velocidad', { a: 'middle', s: 10, c: 'a' }), tx(ax, 208, '(nudos)', { a: 'middle', s: 10 }));
  // Veleta: la punta señala de dónde viene.
  const vx = 160;
  const vy = 100;
  out.push(`<line x1="${vx}" y1="${vy}" x2="${vx}" y2="${base}" stroke="currentColor" stroke-width="2"/>`);
  out.push(`<path d="M${vx - 30},${vy} L${vx - 20},${vy - 6} L${vx - 20},${vy + 6}Z" style="fill:var(--l-v)"/><line x1="${vx - 22}" y1="${vy}" x2="${vx + 22}" y2="${vy}" stroke="currentColor" stroke-width="2"/><path d="M${vx + 14},${vy} L${vx + 30},${vy - 12} L${vx + 30},${vy + 12}Z" style="fill:var(--l-g)"/><circle cx="${vx}" cy="${vy}" r="3" style="fill:currentColor"/>`);
  out.push(tx(vx - 30, vy - 12, 'apunta al W', { s: 10, c: 'v' }));
  out.push(tx(vx, 182, 'Veleta', { a: 'middle', b: true, s: 11 }), tx(vx, 196, 'indica la dirección', { a: 'middle', s: 10, c: 'v' }), tx(vx, 208, '(de dónde viene)', { a: 'middle', s: 10 }));
  // Catavientos: manga de tela que se llena con el viento.
  const cx = 266;
  const cy = 96;
  out.push(`<line x1="${cx - 14}" y1="${cy - 6}" x2="${cx - 14}" y2="${base}" stroke="currentColor" stroke-width="2"/>`);
  out.push(`<path d="M${cx - 12},${cy - 10} L${cx + 36},${cy - 4} L${cx + 36},${cy + 6} L${cx - 12},${cy + 12}Z" style="fill:var(--l-roja)"/><path d="M${cx + 4},${cy - 8} L${cx + 4},${cy + 10} M${cx + 20},${cy - 6} L${cx + 20},${cy + 8}" stroke="#fff" stroke-width="4"/><ellipse cx="${cx - 12}" cy="${cy + 1}" rx="3" ry="11" fill="none" stroke="currentColor" stroke-width="1.5"/>`);
  out.push(tx(cx, 182, 'Catavientos', { a: 'middle', b: true, s: 11 }), tx(cx, 196, 'indica la dirección', { a: 'middle', s: 10, c: 'v' }), tx(cx, 208, '(manga o cintas)', { a: 'middle', s: 10 }));
  out.push(`<line x1="14" y1="${base}" x2="306" y2="${base}" stroke="currentColor" stroke-opacity=".35"/>`);
  out.push(tx(14, 230, 'Navegando, el anemómetro mide el viento aparente.', { s: 10 }), tx(14, 243, 'Ninguno mide la presión: eso es el barómetro.', { s: 10, b: true }));
  return close(out);
}

export function rolarIllustration(spec) {
  const vista = spec.vista ?? 'vocabulario';
  if (vista === 'vocabulario') {
    const hl = new Set(lista(spec.resaltar));
    for (const k of hl) if (k !== 'rolar' && !PALABRAS_VIENTO[k]) return null;
    const CAP = {
      rolar: 'Rolar: el viento cambia de dirección y se mantiene en la nueva, por ejemplo del SW al W.',
      refrescar: 'Refrescar: la intensidad del viento aumenta y se mantiene. No tiene nada que ver con la temperatura.',
      caer: 'Caer (o amainar): la intensidad del viento disminuye y se mantiene.',
      calmar: 'Calmar: el viento cesa del todo o casi.',
      racha: 'Racha: aumento brusco y breve de la intensidad.',
      racheado: 'Viento racheado: la intensidad sube y baja continuamente, a golpes.',
    };
    const caption = hl.size === 1 ? CAP[[...hl][0]] : 'Rolar habla de dirección: el viento cambia de dónde viene. Refrescar, caer, calmar, racha y racheado hablan de intensidad.';
    return { svg: vocabulario(hl), caption };
  }
  if (vista === 'instrumentos') {
    return { svg: instrumentos(), caption: 'El anemómetro mide la velocidad del viento y no da la dirección; la veleta y el catavientos indican de dónde viene, pero no su fuerza.' };
  }
  return null;
}

// ===========================================================================

export const LAMINAS = {
  'vientos-regionales': {
    fn: vientosRegionalesIllustration,
    params: { vista: ['rosa', 'mapa'], resaltar: [...Object.keys(VIENTOS), 'galerna', 'vendaval', 'alisios'] },
    ejemplo: { tipo: 'vientos-regionales', vista: 'rosa' },
  },
  nubes: {
    fn: nubesC,
    params: { resaltar: [...Object.keys(GENEROS), ...PISOS_NUBES] },
    ejemplo: { tipo: 'nubes' },
  },
  ola: {
    fn: olaC,
    params: { vista: ['partes', 'mar-de-fondo'], resaltar: PARTES_OLA },
    ejemplo: { tipo: 'ola', vista: 'partes' },
  },
  'corriente-estrecho': {
    fn: corrienteEstrechoIllustration,
    params: { vista: ['corte', 'tipos'], resaltar: Object.keys(TIPOS_CORRIENTE) },
    ejemplo: { tipo: 'corriente-estrecho', vista: 'corte' },
  },
  rolar: {
    fn: rolarIllustration,
    params: { vista: ['vocabulario', 'instrumentos'], resaltar: ['rolar', ...Object.keys(PALABRAS_VIENTO)] },
    ejemplo: { tipo: 'rolar', vista: 'vocabulario' },
  },
};
export { VIENTOS_MAPA };
