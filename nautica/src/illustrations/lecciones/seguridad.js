// Láminas de seguridad: supervivencia en el agua (hipotermia), balsa salvavidas (zafa, inflado, adrizado,
// lanzamiento), rescate con helicóptero y chaleco / arnés. Cada función es pura: spec → { svg, caption }.
// Estilo común del kit: fondo il-panel, textos en currentColor y superficies con las variables --l-* del tema.

import { open, title, arrow, pol, hullPlan, fx } from '../kit.js';
import { balsaC } from '../balsa-c.js';
import { helicopteroC, arnesC, PARTES_CHALECO, PARTES_ARNES } from '../py-cola-c.js';

const RED = 'var(--l-r)';
const MAR = 'style="fill:var(--l-mar)"';

/** Texto de lámina con un único atributo style (color, tamaño y grosor). */
function tx(x, y, t, { c = null, anchor = 'start', bold = false, size = null } = {}) {
  const st = [c ? `fill:${c}` : '', size ? `font-size:${size}px` : '', bold ? 'font-weight:700' : ''].filter(Boolean).join(';');
  return `<text x="${fx(x)}" y="${fx(y)}" class="il-lbl" text-anchor="${anchor}"${st ? ` style="${st}"` : ''}>${t}</text>`;
}
/** Línea guía fina de una etiqueta a su parte. */
const lead = (x1, y1, x2, y2, c = 'currentColor') => `<line x1="${fx(x1)}" y1="${fx(y1)}" x2="${fx(x2)}" y2="${fx(y2)}" stroke="${c}" stroke-width=".8" opacity=".75"/>`;
const dot = (x, y, c = 'currentColor', r = 2.2) => `<circle cx="${fx(x)}" cy="${fx(y)}" r="${r}" style="fill:${c}"/>`;
/** Superficie del mar desde la altura y hasta el fondo de la lámina, con una línea de ola. */
function mar(y, W, H, x0 = 0) {
  let d = `M${x0},${y}`;
  for (let x = x0; x < W; x += 20) d += ` q5,-3 10,0 q5,3 10,0`;
  return `<rect x="${x0}" y="${y}" width="${W - x0}" height="${H - y}" ${MAR}/><path d="${d}" fill="none" stroke="${'var(--l-v)'}" stroke-width="1.2"/>`;
}
/** Conjunto de partes resaltadas: admite una cadena o una lista. */
const hlSet = (r) => new Set(r == null ? [] : Array.isArray(r) ? r : [r]);
/** Ayudante de resaltado: color, grosor y etiqueta de cada parte. */
function marcador(hl) {
  const on = (k) => hl.has(k);
  return {
    on,
    col: (k) => (on(k) ? RED : 'currentColor'),
    w: (k, base = 1.4) => (on(k) ? base + 1.6 : base),
    t: (x, y, t, k, anchor = 'start') => tx(x, y, t, { c: on(k) ? RED : null, anchor, bold: on(k) }),
  };
}
/** Nota al pie: varias líneas de texto, alineadas a la izquierda. */
const notas = (x, y, lineas, paso = 15) => lineas.map((l, i) => tx(x, y + i * paso, l, { size: 10.5 })).join('');
const tache = (x, y, s = 6) => `<path d="M${x - s},${y - s} L${x + s},${y + s} M${x + s},${y - s} L${x - s},${y + s}" stroke="${RED}" stroke-width="2.4" stroke-linecap="round"/>`;
const PIEL = 'var(--l-casco)';
const HULL = 'style="fill:var(--l-casco);stroke:currentColor"';
const CHAL = 'var(--l-a)';
/** Trazo de miembro (brazo o pierna). */
const miembro = (pts, w = 6) => `<polyline points="${pts.map((p) => p.map(fx).join(',')).join(' ')}" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity=".8"/>`;
const cabeza = (x, y, r = 10) => `<circle cx="${fx(x)}" cy="${fx(y)}" r="${r}" style="fill:${PIEL}" stroke="currentColor" stroke-width="1.4"/>`;
/** Tronco con chaleco: un trazo grueso redondeado del color del chaleco. */
const tronco = (a, b, w = 18) => `<line x1="${fx(a[0])}" y1="${fx(a[1])}" x2="${fx(b[0])}" y2="${fx(b[1])}" style="stroke:${CHAL}" stroke-width="${w}" stroke-linecap="round"/><line x1="${fx(a[0])}" y1="${fx(a[1])}" x2="${fx(b[0])}" y2="${fx(b[1])}" stroke="currentColor" stroke-width="${w + 2}" stroke-linecap="round" opacity=".18"/>`;

// ---------------------------------------------------------------------------
// Supervivencia en el agua. spec: { tipo:'hipotermia', postura:'saltar'|'help'|'grupo' }

export function hipotermiaIllustration(spec) {
  const postura = spec.postura ?? 'help';
  const W = 320;
  if (postura === 'grupo') {
    const H = 260;
    const out = open(W, H, 'Supervivencia en el agua: en piña', 'hg');
    out.push(title(160, 'Varios en el agua: en piña'));
    out.push(`<rect x="10" y="34" width="${W - 20}" height="174" rx="8" ${MAR}/>`);
    out.push(tx(18, 50, 'vista desde arriba', { size: 10 }));
    const cx = 130;
    const cy = 122;
    const R = 50;
    const ps = [0, 72, 144, 216, 288].map((a) => pol(cx, cy, a, R));
    // brazos enlazados entre vecinos (abrazados)
    ps.forEach((p, i) => {
      const q = ps[(i + 1) % ps.length];
      out.push(`<line x1="${fx(p[0])}" y1="${fx(p[1])}" x2="${fx(q[0])}" y2="${fx(q[1])}" stroke="currentColor" stroke-width="5" stroke-linecap="round" opacity=".55"/>`);
    });
    // brazos hacia el del centro
    ps.forEach((p) => out.push(`<line x1="${fx(p[0])}" y1="${fx(p[1])}" x2="${fx((p[0] + cx) / 2)}" y2="${fx((p[1] + cy) / 2)}" stroke="currentColor" stroke-width="4" stroke-linecap="round" opacity=".4"/>`));
    const nadador = (x, y, fuerte) => `<circle cx="${fx(x)}" cy="${fx(y)}" r="15" style="fill:${CHAL}" stroke="${fuerte ? RED : 'currentColor'}" stroke-width="${fuerte ? 2.6 : 1.2}"/>` + cabeza(x, y, 8);
    ps.forEach(([x, y]) => out.push(nadador(x, y, false)));
    out.push(nadador(cx, cy, true));
    out.push(lead(cx + 16, cy + 4, 214, 132, RED), tx(218, 128, 'el más débil,', { c: RED, bold: true }), tx(218, 141, 'en el centro', { c: RED, bold: true }));
    out.push(tx(218, 70, 'abrazados,', { bold: true }), tx(218, 83, 'con el chaleco', { bold: true }), lead(214, 80, ps[1][0] + 14, ps[1][1] - 8));
    out.push(notas(16, 226, ['Juntos conserváis el calor, os animáis y se os ve mejor.', 'Quietos: no nadéis sin algo seguro muy cerca.']));
    out.push('</svg>');
    return { svg: out.join(''), caption: 'Si sois varios en el agua, agrupaos en piña, abrazados y con los más débiles en el centro: conserváis el calor, os dais ánimo y es más fácil que os encuentren.' };
  }
  if (postura === 'saltar') {
    const H = 290;
    const out = open(W, H, 'Supervivencia en el agua: cómo saltar', 'hs');
    out.push(title(160, 'Si no hay más remedio que saltar'));
    const yAgua = 196;
    out.push(mar(yAgua, W, H - 74));
    // costado del barco
    out.push(`<path d="M10,62 L78,62 L72,${yAgua + 14} L10,${yAgua + 14}Z" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1.4"/>`);
    out.push(`<line x1="10" y1="62" x2="78" y2="62" stroke="currentColor" stroke-width="2.4"/>`);
    // persona en el aire: de pie, piernas juntas y estiradas
    const x = 130;
    out.push(miembro([[x - 3, 122], [x - 3, 168]], 5), miembro([[x + 3, 122], [x + 3, 168]], 5));
    out.push(tronco([x, 92], [x, 118], 20));
    out.push(cabeza(x, 74, 11));
    out.push(miembro([[x + 8, 88], [x + 14, 80], [x + 6, 76]], 5)); // mano tapando nariz y boca
    out.push(miembro([[x - 9, 88], [x + 4, 104], [x + 10, 100]], 5)); // brazo cruzado sujetando el chaleco
    // caída hacia agua despejada
    out.push(arrow(x, 176, x, yAgua - 4, 'v', 'hs', 2));
    out.push(lead(150, 76, 176, 66), tx(180, 64, 'inspira y tapa', { bold: true }), tx(180, 77, 'nariz y boca', { bold: true }));
    out.push(lead(146, 104, 176, 100), tx(180, 98, 'sujeta el chaleco,', { bold: true }), tx(180, 111, 'brazo cruzado', { bold: true }));
    out.push(lead(138, 150, 176, 146), tx(180, 144, 'piernas juntas', { bold: true }), tx(180, 157, 'y estiradas', { bold: true }));
    out.push(tx(140, 186, 'nadie ni nada debajo'));
    out.push(notas(14, 236, ['Salta desde la menor altura posible, lejos de', 'combustible derramado. Mejor aún: pasa a la balsa', 'desde cubierta sin mojarte.'], 14.5));
    out.push(`<text x="14" y="${H - 6}" class="il-lbl" style="fill:${RED};font-weight:700;font-size:10.5px">× No: piernas plegadas (eso es para flotar).</text>`);
    out.push('</svg>');
    return { svg: out.join(''), caption: 'Si hay que saltar: comprueba que no hay nadie ni nada debajo, salta desde la menor altura posible, de pie, con las piernas juntas y estiradas, tapando nariz y boca con una mano y sujetando el chaleco con el otro brazo.' };
  }
  // postura HELP con chaleco
  const H = 258;
  const out = open(W, H, 'Supervivencia en el agua: postura HELP', 'hh');
  out.push(title(160, 'Con chaleco: postura fetal (HELP)'));
  const yAgua = 104;
  out.push(mar(yAgua, W, 204));
  // figura recostada: espalda a la derecha, rodillas al pecho a la izquierda
  const hom = [104, 120];
  const cad = [90, 172];
  const rod = [70, 120];
  const pie = [62, 168];
  out.push(tronco(hom, cad, 22));
  out.push(miembro([cad, rod, pie], 9));
  out.push(cabeza(108, 96, 12));
  out.push(miembro([[110, 126], [80, 142], [76, 134]], 5), miembro([[100, 124], [84, 150], [92, 152]], 5)); // brazos cruzados
  const zonas = [
    ['cabeza (fuera del agua)', [116, 90], 80],
    ['cuello', [108, 110], 102],
    ['axilas', [110, 128], 124],
    ['costados', [104, 150], 146],
    ['ingles', [92, 172], 168],
  ];
  for (const [t, [px, py], ly] of zonas) out.push(dot(px, py, RED, 3), lead(px + 3, py, 176, ly - 4, RED), tx(180, ly, t, { c: RED, bold: true }));
  out.push(tx(180, 46, 'protege las zonas que'), tx(180, 59, 'más calor pierden:'));
  out.push(notas(14, 224, ['Rodillas al pecho y brazos cruzados. No nades para', 'entrar en calor. Sin chaleco: vertical, despacio.']));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Con chaleco, quieto en postura fetal (HELP): rodillas al pecho y brazos cruzados, para proteger cabeza, cuello, axilas, costados e ingles. Sin chaleco, vertical y con movimientos lentos, lo justo para flotar.' };
}

// ---------------------------------------------------------------------------
// Balsa salvavidas (zafa, inflado, adrizar, lanzar): en estilo C, en src/illustrations/balsa-c.js.

// ---------------------------------------------------------------------------
// Rescate con helicóptero (rumbo, cable, señales) y chaleco y arnés: en estilo C, en src/illustrations/py-cola-c.js.

// ---------------------------------------------------------------------------

export const LAMINAS = {
  hipotermia: { fn: hipotermiaIllustration, params: { postura: ['saltar', 'help', 'grupo'] }, ejemplo: { tipo: 'hipotermia', postura: 'help' } },
  balsa: { fn: balsaC, params: { vista: ['zafa', 'inflado', 'adrizar', 'lanzar'], resaltar: ['contenedor', 'zafa', 'trinca', 'boza', 'union-debil'] }, ejemplo: { tipo: 'balsa', vista: 'zafa' } },
  helicoptero: { fn: helicopteroC, params: { vista: ['rumbo', 'cable', 'senales'] }, ejemplo: { tipo: 'helicoptero', vista: 'rumbo' } },
  arnes: { fn: arnesC, params: { vista: ['chaleco', 'arnes'], resaltar: [...PARTES_CHALECO, ...PARTES_ARNES] }, ejemplo: { tipo: 'arnes', vista: 'chaleco' } },
};
