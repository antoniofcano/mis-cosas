// Láminas de las lecciones de costa y medio ambiente del PER: zonas de navegación (per-3-5), playas y zonas
// de baño (per-4-2), vertidos de aguas sucias y basuras (per-4-4, per-4-5), banderas a bordo (per-4-7) y
// fondeo y posidonia (per-4-8). Todas dicen lo mismo que su lección: cifras y doctrina salen de ahí.

import { open, title, lbl, arrow, hullPlan, C } from '../kit.js';

const lista = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]).map(String);
const B = 'font-weight="700"';

// ---------------------------------------------------------------------------
// Las siete zonas de navegación (RD 339/2021). spec: { tipo:'zonas', resaltar?: 1..7 | [..] }

const ZONAS = [
  [1, ['ilimitada'], null, null],
  [2, ['hasta 60 millas de la costa'], '60 mn', 'costa'],
  [3, ['hasta 25 millas de la costa'], '25 mn', 'costa'],
  [4, ['hasta 12 millas de la costa'], '12 mn', 'costa'],
  [5, ['hasta 5 millas de un abrigo', 'o playa accesible'], '5 mn', 'abrigo'],
  [6, ['hasta 2 millas de un abrigo', 'o playa accesible'], '2 mn', 'abrigo'],
  [7, ['aguas protegidas: puertos,', 'radas, rías, bahías abrigadas'], null, null],
];

function zonas(spec) {
  const hl = lista(spec.resaltar).map((z) => z.replace(/\D/g, ''));
  const W = 320;
  const H = 304;
  const top = 34;
  const h = 30;
  const x0 = 62;
  const x1 = 308;
  const out = open(W, H, 'Zonas de navegación', 'zn');
  out.push(title(160, 'Las siete zonas de navegación'));
  ZONAS.forEach(([n, desc, lim, ref], i) => {
    const y = top + i * h;
    const on = hl.includes(String(n));
    out.push(`<rect x="${x0}" y="${y}" width="${x1 - x0}" height="${h}" style="fill:var(--l-mar)" opacity="${i % 2 ? 0.6 : 1}"/>`);
    if (on) out.push(`<rect x="${x0 + 1.2}" y="${y + 1.2}" width="${x1 - x0 - 2.4}" height="${h - 2.4}" fill="${C.a}" fill-opacity=".28" stroke="currentColor" stroke-width="2.4"/>`);
    out.push(lbl(x0 + 8, y + 19, `Zona ${n}`, null, 'start', `${B} style="font-size:11px"`));
    const w = on ? B : '';
    if (desc.length === 1) out.push(lbl(x0 + 58, y + 19, desc[0], null, 'start', w));
    else out.push(lbl(x0 + 58, y + 13, desc[0], null, 'start', w), lbl(x0 + 58, y + 25, desc[1], null, 'start', w));
    if (lim) {
      out.push(`<line x1="${x0 - 6}" y1="${y}" x2="${x1}" y2="${y}" stroke="currentColor" stroke-width="1.6" ${ref === 'abrigo' ? 'stroke-dasharray="5 3"' : ''}/>`);
      out.push(lbl(x0 - 9, y + 4, lim, null, 'end', B));
    }
  });
  // zona 1: sin límite hacia fuera
  out.push(arrow(x0 - 20, top + 24, x0 - 20, top + 6, 'g', 'zn', 1.8), lbl(x0 - 26, top + 22, 'mar', 'g', 'end'));
  // la costa (abajo)
  const yc = top + 7 * h;
  out.push(`<line x1="${x0 - 6}" y1="${top + 6 * h}" x2="${x1}" y2="${top + 6 * h}" stroke="currentColor" stroke-width=".8" opacity=".5"/>`);
  out.push(`<rect x="10" y="${yc}" width="${x1 - 10}" height="20" style="fill:var(--l-calido)"/>`, lbl(18, yc + 14, 'COSTA', null, 'start', B));
  // leyenda
  const yl = yc + 38;
  out.push(`<line x1="12" y1="${yl - 4}" x2="34" y2="${yl - 4}" stroke="currentColor" stroke-width="1.6"/>`, lbl(38, yl, 'desde la costa'));
  out.push(`<line x1="124" y1="${yl - 4}" x2="146" y2="${yl - 4}" stroke="currentColor" stroke-width="1.6" stroke-dasharray="5 3"/>`, lbl(150, yl, 'desde un abrigo o playa'));
  out.push(lbl(12, yl + 16, 'Escala no proporcional: todas las franjas, del mismo alto.', 'g'));
  out.push('</svg>');
  const sel = hl.length === 1 ? ZONAS.find(([n]) => String(n) === hl[0]) : null;
  const caption = sel
    ? `Zona ${sel[0]}: ${sel[1].join(' ')}. Cuanto menor es el número de zona, más lejos puedes ir y más equipo tienes que llevar.`
    : 'Zonas 2, 3 y 4: hasta 60, 25 y 12 millas de la costa. Zonas 5 y 6: sin alejarse más de 5 o 2 millas de un abrigo o playa accesible. La 1 es ilimitada y la 7 son aguas protegidas.';
  return { svg: out.join(''), caption };
}

// ---------------------------------------------------------------------------
// Zona de baño (Reglamento General de Costas, art. 73). spec: { tipo:'playa', caso:'balizada'|'no-balizada' }

const bano = (x, y) => `<circle cx="${x}" cy="${y}" r="3" fill="${C.n}"/><path d="M${x - 6},${y + 4} q3,-3 6,0 q3,3 6,0" fill="none" stroke="${C.v}" stroke-width="1.2"/>`;
const barquito = (x, y, rot, s = 1) => `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})">${hullPlan(26, 10)}</g>`;

function playa(spec) {
  const caso = spec.caso === 'no-balizada' ? 'no-balizada' : 'balizada';
  const W = 320;
  const H = 262;
  const out = open(W, H, caso === 'balizada' ? 'Zona de baño balizada' : 'Costa no balizada', 'pl');
  const ys = 214; // orilla
  out.push(`<rect x="0" y="32" width="${W}" height="${ys - 32}" style="fill:var(--l-mar)"/>`);
  if (caso === 'balizada') {
    out.push(title(160, 'Zona de baño balizada: no se entra'));
    out.push(`<rect x="0" y="${ys}" width="${W}" height="${H - ys}" rx="0" style="fill:var(--l-calido)"/>`, lbl(160, ys + 18, 'PLAYA', null, 'middle', B));
    const yb = 104; // línea de boyas
    const cx1 = 214;
    const cx2 = 250; // canal de acceso
    out.push(`<rect x="0" y="${yb}" width="${cx1}" height="${ys - yb}" fill="${C.a}" fill-opacity=".14"/>`, `<rect x="${cx2}" y="${yb}" width="${W - cx2}" height="${ys - yb}" fill="${C.a}" fill-opacity=".14"/>`);
    out.push(`<line x1="0" y1="${yb}" x2="${cx1}" y2="${yb}" stroke="#ca8a04" stroke-width="1" stroke-dasharray="2 3"/>`, `<line x1="${cx2}" y1="${yb}" x2="${W}" y2="${yb}" stroke="#ca8a04" stroke-width="1" stroke-dasharray="2 3"/>`);
    const amarilla = (x, y, r = 5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#facc15" stroke="#854d0e" stroke-width="1"/>`;
    const prohibido = (x, y) => `<circle cx="${x}" cy="${y}" r="5.5" fill="#fff" stroke="#dc2626" stroke-width="2"/><line x1="${x - 3.6}" y1="${y + 3.6}" x2="${x + 3.6}" y2="${y - 3.6}" stroke="#dc2626" stroke-width="2"/>`;
    for (let x = 12; x < cx1 - 6; x += 32) out.push(amarilla(x, yb));
    for (let x = 28; x < cx1 - 14; x += 64) out.push(prohibido(x, yb));
    for (let x = 270; x < W; x += 32) out.push(amarilla(x, yb));
    // lados del canal con boyas amarillas pequeñas
    for (let y = yb + 26; y < ys - 6; y += 24) out.push(amarilla(cx1, y, 3.5), amarilla(cx2, y, 3.5));
    // entrada: cónica verde a estribor y cilíndrica roja a babor (entrando hacia la playa, el estribor queda a la izquierda del dibujo)
    out.push(`<path d="M${cx1},${yb - 8} l7,13 h-14z" fill="#16a34a" stroke="#14532d"/>`, `<rect x="${cx2 - 6}" y="${yb - 6}" width="12" height="12" fill="#dc2626" stroke="#7f1d1d"/>`);
    out.push(lbl(cx1 - 9, yb - 12, 'cónica verde', 'var(--l-m)', 'end', B), lbl(W - 6, yb - 12, 'cilíndrica roja', 'var(--l-r)', 'end', B));
    out.push(barquito((cx1 + cx2) / 2, 160, 180, 0.9), arrow((cx1 + cx2) / 2, 176, (cx1 + cx2) / 2, 198, 'g', 'pl', 1.6));
    out.push(lbl(cx2 + 8, 134, 'canal de', null, 'start', B), lbl(cx2 + 8, 147, 'acceso', null, 'start', B), lbl(cx2 + 8, 161, '25 a 50 m', null), lbl(cx2 + 8, 174, 'despacio', null));
    out.push(lbl(100, 132, 'ZONA DE BAÑO', null, 'middle', B), lbl(100, 146, 'prohibido navegar', 'var(--l-r)', 'middle', B), lbl(100, 159, '(también motos náuticas)', null, 'middle'));
    for (const [x, y] of [[40, 186], [84, 196], [130, 182], [172, 194], [292, 196]]) out.push(bano(x, y));
    // barco fuera que no debe entrar
    out.push(barquito(70, 54, 90, 0.9), `<line x1="88" y1="56" x2="114" y2="72" stroke="${C.r}" stroke-width="2" stroke-dasharray="3 3"/>`);
    out.push(`<path d="M112,66 l10,10 M122,66 l-10,10" stroke="${C.r}" stroke-width="3"/>`, lbl(132, 60, 'no se cruza la línea', 'var(--l-r)', 'start', B), lbl(132, 73, 'de boyas amarillas', 'var(--l-r)', 'start', B));
    out.push(lbl(8, yb - 12, 'esféricas amarillas', null, 'start'));
    out.push('</svg>');
    return { svg: out.join(''), caption: 'Dentro de una zona de baño balizada está prohibida la navegación de recreo, motos náuticas incluidas, vaya a la velocidad que vaya. Para llegar a la playa o salir de ella se usan los canales de acceso señalizados (entrando, la cónica verde queda a estribor y la cilíndrica roja a babor), despacio.' };
  }
  out.push(title(160, 'Costa no balizada: 200 m y 50 m'));
  const xr = 196; // fin de la playa, empiezan las rocas
  const y200 = ys - 120; // 200 m (a escala con los 50 m)
  const y50 = ys - 30;
  out.push(`<rect x="0" y="${ys}" width="${xr}" height="${H - ys}" style="fill:var(--l-calido)"/>`, lbl(xr / 2, ys + 18, 'PLAYA', null, 'middle', B));
  out.push(`<path d="M${xr},${ys} L${xr + 8},${ys - 4} L${xr + 24},${ys - 1} L${xr + 40},${ys - 6} L${xr + 62},${ys - 2} L${xr + 84},${ys - 7} L${xr + 104},${ys - 3} L${W},${ys - 5} L${W},${H} L${xr},${H}Z" style="fill:var(--l-g)"/>`, lbl((xr + W) / 2, ys + 18, 'ROCAS', null, 'middle', `${B} style="fill:#fff"`));
  out.push(`<path d="M0,${y200} H${xr} V${y50} H${W} V${ys - 4} H${xr} V${ys} H0Z" fill="${C.a}" fill-opacity=".2"/>`);
  out.push(`<path d="M0,${y200} H${xr} V${y50} H${W}" fill="none" stroke="${C.a}" stroke-width="2" stroke-dasharray="6 4"/>`);
  // cotas
  const cota = (x, ya, yb2, t) => `<line x1="${x}" y1="${ya + 2}" x2="${x}" y2="${yb2 - 2}" stroke="currentColor" stroke-width="1.2"/><path d="M${x - 3},${ya + 6} l3,-5 l3,5 M${x - 3},${yb2 - 6} l3,5 l3,-5" fill="none" stroke="currentColor" stroke-width="1.2"/>` + lbl(x + 6, (ya + yb2) / 2 + 4, t, null, 'start', `${B} style="font-size:12px"`);
  out.push(cota(18, y200, ys, ''), cota(300, y50, ys - 5, ''));
  out.push(lbl(30, y200 + 64, '200 m', null, 'start', `${B} style="font-size:12px"`), lbl(294, y50 + 18, '50 m', null, 'end', `${B} style="font-size:12px"`));
  const tb = [['zona de baño', B], ['aunque no haya boyas:', ''], ['se navega, pero', '']];
  tb.forEach(([t, e], i) => out.push(lbl(118, y200 + 22 + i * 13, t, null, 'middle', e)));
  out.push(lbl(118, y200 + 66, 'máx. 3 nudos', 'var(--l-r)', 'middle', `${B} style="font-size:12px"`), lbl(118, y200 + 80, 'y ningún vertido', 'var(--l-r)', 'middle', B));
  for (const [x, y] of [[60, 200], [100, 206], [140, 198]]) out.push(bano(x, y));
  out.push(barquito(178, 180, 180, 0.8));
  out.push(lbl(258, 76, 'fuera de la franja', null, 'middle'));
  out.push(lbl(258, y50 - 8, 'resto de costa', null, 'middle'));
  out.push(lbl(12, 48, 'Distancias medidas desde la orilla, a escala entre sí.', 'g'));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Si la costa no está balizada, se entiende que hay zona de baño en los 200 m junto a las playas y en los 50 m junto al resto de la costa. Dentro se puede navegar, pero a 3 nudos como máximo, con precaución y sin ningún vertido.' };
}

// ---------------------------------------------------------------------------
// Escalera de distancias de vertido. spec: { tipo:'vertidos', tema:'aguas-sucias'|'basuras' }

const VERTIDOS = {
  'aguas-sucias': {
    titulo: 'Aguas sucias: dónde descargar',
    cols: ['zona 7', '0 – 3 mn', '3 – 12 mn', '+12 mn'],
    ticks: ['línea de base', '3 mn', '12 mn'],
    filas: [
      ['Sin desmenuzar ni desinfectar', 3, 'a más de 12 mn'],
      ['Desmenuzadas y desinfectadas (homologado)', 2, 'a más de 3 mn'],
      ['Instalación de tratamiento homologada', 1, 'fuera de la zona 7'],
    ],
    notas: [
      'Zona 7 (puertos, rías, bahías, aguas protegidas):',
      'nada; al tanque y a la instalación del puerto.',
      'Tanque: poco a poco, en ruta y a 4 nudos o más.',
    ],
    caption: 'Las distancias se cuentan desde la línea de base (la tierra más próxima). Sin tratar, a más de 12 millas; desmenuzadas y desinfectadas, a más de 3; con instalación de tratamiento homologada, fuera de la zona 7. El tanque se vacía poco a poco, en ruta y a 4 nudos como mínimo.',
  },
  basuras: {
    titulo: 'Basuras (MARPOL V): qué y dónde',
    cols: ['0 – 3 mn', '3 – 12 mn', '+12 mn'],
    ticks: ['tierra', '3 mn', '12 mn'],
    filas: [
      ['Plásticos y aceite de cocina', null, 'nunca, en ninguna parte'],
      ['Papel, vidrio, latas, envases…', null, 'nunca: al puerto'],
      ['Fuera de zona especial: comida triturada', 1, 'a más de 3 mn'],
      ['Fuera de zona especial: comida sin triturar', 2, 'a más de 12 mn'],
      ['Mediterráneo: comida triturada', 2, 'a más de 12 mn'],
      ['Mediterráneo: comida sin triturar', null, 'nunca: al puerto'],
    ],
    notas: [
      'Triturada: criba de 25 mm. Siempre en ruta,',
      'sin bolsas ni envoltorios. Mezclas: la más rigurosa.',
      'Mediterráneo (zona especial): al este de 5° 36\' W.',
    ],
    caption: 'Plásticos y aceite de cocina, nunca. Los restos de comida, fuera de zonas especiales, triturados a más de 3 millas y sin triturar a más de 12; en el Mediterráneo, solo triturados y a más de 12 millas. Siempre en ruta.',
  },
};

function vertidos(spec) {
  const tema = spec.tema === 'basuras' ? 'basuras' : 'aguas-sucias';
  const T = VERTIDOS[tema];
  const W = 320;
  const xa = 10;
  const xb = 310;
  // columnas de anchura no proporcional (se dice en la lámina)
  const anchos = tema === 'basuras' ? [86, 92, 122] : [50, 66, 76, 108];
  const xs = [xa];
  for (const a of anchos) xs.push(xs.at(-1) + a);
  const fila = 31;
  const y0 = 66;
  const H = y0 + T.filas.length * fila + T.notas.length * 14 + 30;
  const out = open(W, H, tema === 'basuras' ? 'Vertido de basuras' : 'Descarga de aguas sucias', 'vt');
  out.push(title(160, T.titulo));
  // eje: costa a la izquierda, mar abierto a la derecha
  const off = tema === 'basuras' ? 0 : 1;
  if (off) out.push(`<rect x="${xa}" y="32" width="${anchos[0]}" height="16" style="fill:var(--l-mar)" opacity=".5"/>`);
  out.push(`<rect x="${xs[off]}" y="32" width="${xb - xs[off]}" height="16" style="fill:var(--l-mar)"/>`);
  const guias = (ya, yb2) => T.ticks.map((_, i) => `<line x1="${xs[i + off]}" y1="${ya}" x2="${xs[i + off]}" y2="${yb2}" stroke="currentColor" stroke-width="1" stroke-dasharray="2 2" opacity=".6"/>`).join('');
  out.push(guias(30, 50));
  T.cols.forEach((c, i) => out.push(lbl((xs[i] + xs[i + 1]) / 2, 44, c, null, 'middle', B)));
  T.ticks.forEach((t, i) => {
    const x = xs[i + off];
    out.push(lbl(Math.max(x, 12), 60, t, 'g', i === 0 && off === 0 ? 'start' : 'middle'));
  });
  T.filas.forEach(([nombre, desde, txt], i) => {
    const y = y0 + i * fila;
    out.push(lbl(xa, y + 10, nombre, null, 'start', B));
    const yb = y + 14;
    const hb = 13;
    const fin = desde == null ? xb : xs[desde];
    out.push(`<rect x="${xa}" y="${yb}" width="${fin - xa}" height="${hb}" style="fill:var(--l-r)" fill-opacity=".16"/>`);
    if (desde == null) out.push(lbl((xa + xb) / 2, yb + 10, `✗ ${txt}`, 'var(--l-r)', 'middle', B));
    else {
      out.push(`<rect x="${fin}" y="${yb}" width="${xb - fin}" height="${hb}" style="fill:var(--l-m);stroke:var(--l-m)" fill-opacity=".3"/>`);
      out.push(lbl((xa + fin) / 2, yb + 10, '✗ no', 'var(--l-r)', 'middle', B));
      out.push(lbl((fin + xb) / 2, yb + 10, `✓ ${txt}`, 'var(--l-m)', 'middle', B));
    }
  });
  const yn = y0 + T.filas.length * fila + 12;
  T.notas.forEach((n, i) => out.push(lbl(xa, yn + i * 14, n)));
  out.push(lbl(xa, yn + T.notas.length * 14 + 4, 'Columnas sin escala.', 'g'));
  out.push('</svg>');
  return { svg: out.join(''), caption: T.caption };
}

// ---------------------------------------------------------------------------
// Fondeo y posidonia (RD 191/2026). spec: { tipo:'posidonia', vista?: 'fondeo'|'planta' }

const ARENA = '#ecd9a8';
const PRADERA = '#22643f';

const ancla = (x, y) => `<g transform="translate(${x},${y})" stroke="#111827" stroke-width="1.6" fill="none"><circle cx="0" cy="-6" r="2"/><line x1="0" y1="-4" x2="0" y2="5"/><path d="M-5,1 Q0,8 5,1"/></g>`;
const pradera = (x, y, w, h) => {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${PRADERA}"/>`;
  for (let i = 0; i < Math.floor((w * h) / 260); i++) {
    const px = x + 6 + ((i * 37) % (w - 12));
    const py = y + 6 + ((i * 23) % (h - 12));
    s += `<path d="M${px},${py + 4} q-2,-4 0,-8 M${px + 3},${py + 4} q2,-4 1,-8" stroke="#4ade80" stroke-opacity=".5" stroke-width="1" fill="none"/>`;
  }
  return s;
};
const ok = (x, y, bien) => (bien
  ? `<circle cx="${x}" cy="${y}" r="8" fill="#16a34a"/><path d="M${x - 4},${y} l3,3 l5,-6" stroke="#fff" stroke-width="2" fill="none"/>`
  : `<circle cx="${x}" cy="${y}" r="8" fill="#dc2626"/><path d="M${x - 3.5},${y - 3.5} l7,7 M${x + 3.5},${y - 3.5} l-7,7" stroke="#fff" stroke-width="2"/>`);

function posidonia(spec) {
  if (spec.vista === 'planta') return posidoniaPlanta();
  const W = 320;
  const H = 308;
  const out = open(W, H, 'Fondeo y posidonia', 'po');
  out.push(title(160, 'Fondear en arena, nunca en la pradera'));
  const cw = 146;
  const ch = 86;
  const celdas = [
    [10, 36, true, 'Bien: ancla y cadena', 'siempre en arena'],
    [164, 36, false, 'Mal: al bornear, la', 'cadena barre la pradera'],
    [10, 158, false, 'Mal: ancla sobre', 'la pradera'],
    [164, 158, true, 'Bien: amarrado a una', 'boya autorizada'],
  ];
  celdas.forEach(([x, y, bien, l1, l2], i) => {
    out.push(`<g><clipPath id="po-c${i}"><rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="6"/></clipPath><g clip-path="url(#po-c${i})">${pradera(x, y, cw, ch)}`);
    const cx = x + cw / 2;
    const cy = y + ch / 2;
    if (i === 0) {
      out.push(`<ellipse cx="${cx}" cy="${cy}" rx="66" ry="40" fill="${ARENA}"/>`);
      out.push(`<circle cx="${cx + 8}" cy="${cy}" r="30" fill="none" stroke="#7c5a12" stroke-width="1.2" stroke-dasharray="3 3"/>`);
      out.push(`<path d="M${cx + 8},${cy} L${cx - 18},${cy - 14}" stroke="#374151" stroke-width="1.6"/>`, `<g transform="translate(${cx - 22},${cy - 15}) rotate(-90)">${hullPlan(22, 9)}</g>`, ancla(cx + 8, cy + 2));
    } else if (i === 1) {
      out.push(`<ellipse cx="${cx + 10}" cy="${cy}" rx="34" ry="26" fill="${ARENA}"/>`);
      out.push(`<circle cx="${cx + 10}" cy="${cy}" r="36" fill="none" stroke="#fde68a" stroke-width="1.4" stroke-dasharray="3 3"/>`);
      out.push(`<path d="M${cx + 10},${cy} Q${cx - 6},${cy + 8} ${cx - 24},${cy + 14}" stroke="#f87171" stroke-width="2.4" fill="none"/>`, `<g transform="translate(${cx - 30},${cy + 16}) rotate(-110)">${hullPlan(22, 9)}</g>`, ancla(cx + 10, cy + 2));
    } else if (i === 2) {
      out.push(`<path d="M${cx + 14},${cy + 4} L${cx - 14},${cy - 10}" stroke="#f87171" stroke-width="2.4"/>`, `<g transform="translate(${cx - 20},${cy - 12}) rotate(-90)">${hullPlan(22, 9)}</g>`, `<circle cx="${cx + 14}" cy="${cy + 4}" r="9" fill="#fff" fill-opacity=".85"/>`, ancla(cx + 14, cy + 6));
    } else {
      out.push(`<line x1="${cx + 12}" y1="${cy}" x2="${cx - 10}" y2="${cy - 6}" stroke="#e5e7eb" stroke-width="1.4"/>`, `<circle cx="${cx + 12}" cy="${cy}" r="6" fill="#f97316" stroke="#fff" stroke-width="1.4"/>`, `<g transform="translate(${cx - 16},${cy - 8}) rotate(-75)">${hullPlan(22, 9)}</g>`);
    }
    out.push('</g></g>', `<rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="6" fill="none" stroke="currentColor" stroke-width="${bien ? 1 : 1}" opacity=".5"/>`);
    out.push(ok(x + cw - 12, y + 12, bien));
    out.push(lbl(x + 2, y + ch + 14, l1, bien ? 'var(--l-m)' : 'var(--l-r)', 'start', B), lbl(x + 2, y + ch + 27, l2, bien ? 'var(--l-m)' : 'var(--l-r)', 'start', B));
  });
  // leyenda
  const yl = 296;
  out.push(`<rect x="10" y="${yl - 9}" width="12" height="10" fill="${ARENA}" stroke="currentColor" stroke-width=".5"/>`, lbl(26, yl, 'arena: mancha clara'));
  out.push(`<rect x="164" y="${yl - 9}" width="12" height="10" fill="${PRADERA}"/>`, lbl(180, yl, 'posidonia: mancha oscura'));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'En el Mediterráneo español está prohibido fondear sobre las praderas de posidonia, y también en la arena próxima si la cadena las toca o las barre al bornear. Sobre la pradera, solo boya autorizada. Se exceptúan la fuerza mayor y el peligro para la vida humana o la navegación.' };
}

function posidoniaPlanta() {
  const W = 320;
  const H = 230;
  const out = open(W, H, 'La posidonia oceánica', 'pp');
  out.push(title(160, 'La posidonia: una planta, no un alga'));
  const yf = 168; // fondo de arena
  out.push(`<rect x="0" y="32" width="${W}" height="${yf - 32}" style="fill:var(--l-mar)"/>`, `<rect x="0" y="${yf}" width="${W}" height="${H - yf}" fill="${ARENA}"/>`);
  // rizoma horizontal con raíces y haces de hojas en cinta
  out.push(`<path d="M30,${yf + 10} C80,${yf + 4} 120,${yf + 16} 190,${yf + 8}" stroke="#7c4a1e" stroke-width="5" fill="none" stroke-linecap="round"/>`);
  for (const x of [44, 76, 108, 140, 172]) out.push(`<path d="M${x},${yf + 12} q-4,12 -2,22 M${x + 4},${yf + 12} q6,10 4,20" stroke="#7c4a1e" stroke-width="1.2" fill="none"/>`);
  for (const [x, k] of [[50, 0], [100, 1], [150, 2]]) {
    for (let j = -2; j <= 2; j++) out.push(`<path d="M${x + j * 2},${yf + 6} q${j * 3 + (k - 1) * 2},-50 ${j * 8 + (k - 1) * 3},-${96 - Math.abs(j) * 10}" stroke="#16a34a" stroke-width="3.2" fill="none" stroke-linecap="round"/>`);
  }
  // flor y fruto
  out.push(`<circle cx="104" cy="${yf - 64}" r="4" fill="#facc15" stroke="#854d0e"/>`, `<ellipse cx="70" cy="58" rx="6" ry="4.5" fill="#65a30d" stroke="#365314"/>`);
  out.push(lbl(80, 62, 'fruto flotante: «oliva de mar»', null, 'start'));
  const L = (x, y, t, tx, ty, anchor = 'start', extra = '') => `<line x1="${x}" y1="${y}" x2="${tx}" y2="${ty - 4}" stroke="currentColor" stroke-width=".8"/>` + lbl(tx + (anchor === 'start' ? 2 : -2), ty, t, null, anchor, extra);
  out.push(L(166, yf - 70, 'hojas en cinta', 214, 86, 'start', B));
  out.push(L(108, yf - 64, 'flores (en otoño)', 214, 108, 'start', B));
  out.push(L(190, yf + 8, 'rizoma (tallo)', 214, 150, 'start', B));
  out.push(lbl(214, yf + 30, 'raíces', '#3b2f12', 'start', B), `<line x1="176" y1="${yf + 26}" x2="212" y2="${yf + 26}" stroke="#374151" stroke-width=".8"/>`);
  out.push(lbl(10, yf + 50, 'Endémica del Mediterráneo; crece muy despacio.', '#3b2f12'));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'La posidonia oceánica es una planta con flores, con raíces, rizoma y hojas en cinta, endémica del Mediterráneo. Forma praderas sobre la arena y crece muy despacio: el daño de un ancla tarda décadas en repararse.' };
}

// ---------------------------------------------------------------------------
// Dónde va cada bandera a bordo (RD 2335/1980). spec: { tipo:'banderas-a-bordo', resaltar?: 'popa'|'pico'|'crucetas' }

const espana = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#c60b1e"/><rect x="${x}" y="${y + h / 4}" width="${w}" height="${h / 2}" fill="#ffc400"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#7f1d1d" stroke-width=".6"/>`;
const andalucia = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff" stroke="#14532d" stroke-width=".6"/><rect x="${x}" y="${y}" width="${w}" height="${h / 3}" fill="#15803d"/><rect x="${x}" y="${y + (2 * h) / 3}" width="${w}" height="${h / 3}" fill="#15803d"/>`;

function banderasABordo(spec) {
  const hl = lista(spec.resaltar);
  const on = (k) => hl.includes(k);
  const W = 320;
  const H = 342;
  const out = open(W, H, 'Banderas a bordo', 'bb');
  out.push(title(160, 'Dónde va cada bandera'));
  const yd = 196; // cubierta
  out.push(`<rect x="0" y="${yd + 14}" width="${W}" height="30" style="fill:var(--l-mar)"/>`);
  // casco (proa a la derecha)
  out.push(`<path d="M60,${yd} L292,${yd} Q284,${yd + 20} 254,${yd + 26} L84,${yd + 26} Q64,${yd + 22} 60,${yd}Z" style="fill:var(--l-casco);stroke:currentColor" stroke-width="1.2"/>`);
  // palo mayor con cangrejo (pico), botavara y crucetas
  const xm = 180;
  out.push(`<path d="M${xm - 2},92 L112,52 L94,176 L${xm - 2},176Z" style="fill:var(--l-nube);stroke:currentColor" stroke-width=".8"/>`);
  out.push(`<line x1="${xm}" y1="${yd}" x2="${xm}" y2="36" stroke="currentColor" stroke-width="3"/>`);
  out.push(`<line x1="${xm}" y1="92" x2="108" y2="50" stroke="currentColor" stroke-width="2.6"/>`, `<line x1="${xm}" y1="178" x2="90" y2="178" stroke="currentColor" stroke-width="2.6"/>`);
  out.push(`<line x1="${xm}" y1="112" x2="${xm + 18}" y2="112" stroke="currentColor" stroke-width="2.4"/>`);
  // asta de popa con la bandera de España (30 × 20)
  out.push(`<line x1="66" y1="${yd + 2}" x2="50" y2="160" stroke="currentColor" stroke-width="2.4"/>`, espana(20, 160, 30, 20));
  // driza de las crucetas con la autonómica (1/3 del área: 17,3 × 11,5)
  out.push(`<line x1="${xm + 18}" y1="112" x2="${xm + 18}" y2="124" stroke="currentColor" stroke-width=".8"/>`, andalucia(xm + 18, 123, 17.3, 11.5));
  // marcas numeradas y leyenda
  const PUNTOS = [
    ['popa', 35, 146, ['Asta de popa: solo la bandera de España.']],
    ['pico', 96, 40, ['Pico del palo mayor (si lo tiene): solo la', 'bandera de España.']],
    ['crucetas', xm + 50, 129, ['En otro lugar (p. ej. driza de las crucetas): la', 'autonómica u otras, solo con la de España', 'izada y como mucho con 1/3 de su área.']],
  ];
  let yl = 252;
  PUNTOS.forEach(([k, x, y, txt], i) => {
    const sel = on(k);
    const marca = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="8" ${sel ? `fill="${C.r}"` : 'class="il-panel"'} stroke="${C.r}" stroke-width="${sel ? 2.4 : 1.6}"/><text x="${cx}" y="${cy + 3.5}" class="il-lbl" text-anchor="middle" font-weight="700" ${sel ? 'style="fill:#fff"' : ''}>${i + 1}</text>`;
    out.push(marca(x, y));
    out.push(marca(18, yl - 4));
    txt.forEach((t, j) => out.push(lbl(32, yl + j * 13, t, null, 'start', sel ? B : '')));
    yl += txt.length * 13 + 6;
  });
  out.push(`<line x1="${xm + 42}" y1="129" x2="${xm + 37}" y2="129" stroke="${C.r}" stroke-width="1.2"/>`, `<line x1="103" y1="45" x2="108" y2="50" stroke="${C.r}" stroke-width="1.2"/>`);
  out.push('</svg>');
  const CAP = {
    popa: 'El asta de popa está reservada a la bandera de España, el único pabellón de un barco español.',
    pico: 'El pico del palo mayor, en los veleros que lo tienen, está reservado a la bandera de España, como el asta de popa.',
    crucetas: 'La autonómica, la del club o la de cortesía van en otro lugar, por ejemplo en una driza de las crucetas: solo con la de España izada y como mucho con un tercio de su área. La autonómica, en puertos nacionales y aguas interiores.',
  };
  return { svg: out.join(''), caption: hl.length === 1 && CAP[hl[0]] ? CAP[hl[0]] : 'El asta de popa y el pico del palo mayor están reservados a la bandera de España. Las demás (autonómica, club, cortesía) van en otro lugar, solo con la de España izada y como mucho con un tercio de su área.' };
}

// ---------------------------------------------------------------------------

export const LAMINAS = {
  zonas: { fn: zonas, params: { resaltar: [1, 2, 3, 4, 5, 6, 7] }, ejemplo: { tipo: 'zonas' } },
  playa: { fn: playa, params: { caso: ['balizada', 'no-balizada'] }, ejemplo: { tipo: 'playa', caso: 'balizada' } },
  vertidos: { fn: vertidos, params: { tema: ['aguas-sucias', 'basuras'] }, ejemplo: { tipo: 'vertidos', tema: 'aguas-sucias' } },
  posidonia: { fn: posidonia, params: { vista: ['fondeo', 'planta'] }, ejemplo: { tipo: 'posidonia', vista: 'fondeo' } },
  'banderas-a-bordo': { fn: banderasABordo, params: { resaltar: ['popa', 'pico', 'crucetas'] }, ejemplo: { tipo: 'banderas-a-bordo' } },
};
