// Láminas de fondeo, nudos, atraque y remolque (lecciones per-1-6, per-2-2, per-2-5, per-2-6, per-3-8 y per-7-7).
// Mismo estilo que seamanship.js y navigation.js: fondo il-panel, trazos con currentColor y superficies con las
// variables --l-* (y --land para el fondo y el muelle), para que se lean igual en los temas claro y oscuro.

import { C, open, title, lbl as kitLbl, arrow, hullPlan, fx as f } from '../kit.js';
import { fondeoC, remolqueC, PARTES_ANCLA, PARTES_LINEA, VOCES } from '../per-cola-c.js';

// Los textos de color usan las variables del tema (más contraste en oscuro); el gris pasa a currentColor.
const TXT = { r: 'var(--l-r)', v: 'var(--l-v)', p: 'var(--l-p)', m: 'var(--l-m)', a: 'var(--l-a)', g: null };
const lbl = (x, y, t, c = null, anchor = 'start', extra = '') => kitLbl(x, y, t, c in TXT ? TXT[c] : c, anchor, extra);

// ---------------------------------------------------------------------------
// Utilidades comunes

const bold = (x, y, t, c = null, anchor = 'start') => lbl(x, y, t, c, anchor, 'font-weight="700"');
const clipDef = (id, W, H) => `<clipPath id="${id}-clip"><rect width="${W}" height="${H}" rx="10"/></clipPath>`;
const sea = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:var(--l-mar)"/>`;
const tierra = (d) => `<path d="${d}" style="fill:var(--land);stroke:var(--land-stroke)"/>`;
const casco = 'style="fill:var(--l-casco);stroke:currentColor;stroke-width:1.2"';

/** Casco en planta centrado en (cx, cy) y girado rot grados (0 = proa arriba). */
const hp = (cx, cy, rot, L, B, extra = '') => `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${rot})">${hullPlan(L, B, `style="fill:var(--l-casco);stroke:currentColor;stroke-width:1.3" ${extra}`)}</g>`;

const cabo = (d, col, w = 2, extra = '') => `<path d="${d}" fill="none" style="stroke:${col}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;

// ---------------------------------------------------------------------------
// Fondeo. spec: { tipo:'fondeo', vista:'ancla'|'linea'|'borneo'|'garreo'|'orinque'|'voces', resaltar? }

// ---------------------------------------------------------------------------
// Nudos. spec: { tipo:'nudos', nudo?: 'llano'|'rezon'|'ballestrinque'|'as-de-guia' }
// Cada cabo es una curva suave por puntos [x, y, z]; z dice qué va por encima en los cruces (más alto = delante).
// La curva se trocea en tramos cortos que se pintan ordenados por z, así los cruces salen sin costuras.

const A = 'var(--l-a)';
const V = 'var(--l-v)';

/** Muestrea una Catmull-Rom por los puntos (z se interpola lineal). */
function muestrear(P) {
  const out = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[i - 1] ?? P[i];
    const [p1, p2] = [P[i], P[i + 1]];
    const p3 = P[i + 2] ?? P[i + 1];
    const n = Math.max(2, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / 1.5));
    for (let s = 0; s < n; s++) {
      const t = s / n;
      const cr = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
      out.push([cr(p0[0], p1[0], p2[0], p3[0]), cr(p0[1], p1[1], p2[1], p3[1]), (p1[2] ?? 0) + ((p2[2] ?? 0) - (p1[2] ?? 0)) * t]);
    }
  }
  const u = P[P.length - 1];
  out.push([u[0], u[1], u[2] ?? 0]);
  return out;
}

/** cabos: [{ p: puntos, col, w, cerrado? }] → SVG con los cruces bien resueltos.
 * Cada cabo se parte en tramos de nivel constante (z redondeado); los niveles altos se pintan después. */
function trenzar(cabos) {
  const tramos = [];
  const finales = [];
  cabos.forEach((c, ci) => {
    const w = c.w ?? 7;
    const s = muestrear(c.cerrado ? [...c.p, c.p[0]] : c.p);
    let ini = 0;
    for (let i = 1; i <= s.length; i++) {
      if (i === s.length || Math.round(s[i][2]) !== Math.round(s[ini][2])) {
        const seg = s.slice(ini, Math.min(i + 1, s.length));
        const cierra = c.cerrado && ini === 0 && i === s.length;
        tramos.push({ z: Math.round(s[ini][2]), ci, i: ini, d: `M${seg.map((q) => `${f(q[0])},${f(q[1])}`).join(' L')}${cierra ? 'Z' : ''}`, col: c.col, w, sinFin: c.sinFin });
        ini = i;
      }
    }
    if (!c.cerrado && !c.sinFin) for (const q of [s[0], s[s.length - 1]]) finales.push({ q, col: c.col, w });
  });
  tramos.sort((a, b) => a.z - b.z || a.ci - b.ci || a.i - b.i);
  const o = tramos.map((t) => `<path d="${t.d}" fill="none" stroke="currentColor" stroke-width="${f(t.w + 2.6)}" stroke-linejoin="round"/><path d="${t.d}" fill="none" style="stroke:${t.col}" stroke-width="${t.w}" stroke-linejoin="round" stroke-linecap="${t.sinFin ? 'butt' : 'square'}"/>`);
  for (const { q, col, w } of finales) o.push(`<circle cx="${f(q[0])}" cy="${f(q[1])}" r="${f(w / 2 + 1.3)}" fill="currentColor"/><circle cx="${f(q[0])}" cy="${f(q[1])}" r="${f(w / 2)}" style="fill:${col}"/>`);
  return o.join('');
}
const aro = (cx, cy, r, zs = {}) => Array.from({ length: 36 }, (_, i) => { const a = (i * 10 * Math.PI) / 180; return [cx + r * Math.sin(a), cy - r * Math.cos(a), zs[i * 10] ?? 0]; });

// Dibujos en una caja local de 140 × 110.
const NUDOS = {
  llano: {
    nombre: 'Nudo llano',
    uso: 'unir dos cabos',
    dibujo: () => trenzar([
      { col: A, p: [[2, 36], [40, 36], [80, 36], [98, 42], [102, 52], [98, 62], [80, 68], [46, 68, 1], [30, 68], [2, 68]] },
      { col: V, p: [[138, 44], [100, 44, 1], [62, 44], [44, 50], [40, 60], [44, 70], [62, 76], [100, 76], [138, 76]] },
    ]),
    etiquetas: [[6, 28, 'cabo 1', 'start'], [134, 94, 'cabo 2', 'end']],
    texto: 'Une dos cabos por sus chicotes, de la misma mena y material. Con tensión aguanta y sin ella se deshace fácil. También se llama nudo de rizo.',
  },
  rezon: {
    nombre: 'Vuelta de rezón',
    uso: 'a una argolla',
    dibujo: () => trenzar([
      { col: 'var(--l-casco)', w: 6, cerrado: true, p: aro(70, 30, 21) },
      { col: A, w: 6, p: [[52, 110], [54, 90], [56, 74, -1], [56, 62], [57, 52, -2], [58, 40, -2], [62, 33], [66, 40], [67, 52, 2], [67, 62], [71, 60], [73, 52, -2], [74, 40, -2], [78, 33], [82, 40], [82, 52, 2], [80, 64], [72, 70], [56, 72, 1], [42, 76], [42, 86], [56, 90, -1], [70, 88], [84, 96], [96, 104]] },
    ]),
    etiquetas: [[96, 14, 'argolla', 'start'], [92, 50, 'dos vueltas', 'start'], [100, 98, 'remate', 'start']],
    texto: 'Se dan vueltas a la argolla y se remata con el chicote para que no se suelte. Muy segura y no se afloja con los tirones: para una defensa colgada mucho tiempo.',
  },
  ballestrinque: {
    nombre: 'Ballestrinque',
    uso: 'a un palo, rápido',
    dibujo: () => trenzar([
      { col: 'var(--l-casco)', w: 22, sinFin: true, p: [[70, 0], [70, 110]] },
      { col: A, p: [[2, 60], [36, 58], [58, 56, 1], [70, 55, 1], [80, 53, 1], [86, 49], [80, 43, -1], [70, 41, -1], [60, 39, -1], [55, 36], [60, 33, 1], [64, 40, 2], [70, 54, 2], [76, 68, 2], [80, 76, 1], [85, 81], [80, 86, -1], [70, 86, -1], [60, 85, -1], [55, 79], [60, 72, 1], [70, 70, 1], [82, 68, 1], [100, 66], [138, 64]] },
    ]),
    etiquetas: [[6, 50, 'firme', 'start'], [134, 56, 'chicote', 'end'], [86, 104, 'palo o candelero', 'start']],
    texto: 'Dos vueltas cruzadas alrededor de un palo, candelero o barandilla. Se hace muy rápido, pero con tirones laterales o intermitentes puede correrse: para una defensa por poco tiempo.',
  },
  'as-de-guia': {
    nombre: 'As de guía',
    uso: 'gaza fija',
    dibujo: () => trenzar([
      { col: A, w: 5.5, p: [[70, 0], [70, 12], [70, 30, -1], [78, 40], [84, 52], [76, 64], [62, 64], [55, 52], [60, 39], [70, 30, 1], [82, 22], [96, 26], [104, 42], [108, 66], [102, 92], [78, 108], [50, 104], [34, 86], [36, 70], [48, 64], [57, 61, -1], [62, 50], [64, 36, 1], [60, 24], [70, 14, -2], [82, 13], [86, 20], [80, 30, 2], [76, 40, 2], [74, 52], [72, 64, -1], [73, 82]] },
    ]),
    etiquetas: [[76, 6, 'firme', 'start'], [98, 116, 'gaza fija', 'start'], [80, 88, 'chicote', 'start']],
    texto: 'Forma una gaza fija que ni corre ni se aprieta y luego se deshace con facilidad: para encapillar una amarra en un noray, afirmar escotas o rodear a una persona por el pecho.',
  },
};

export function nudosIllustration(spec = {}) {
  const k = spec.nudo;
  if (NUDOS[k]) {
    const n = NUDOS[k];
    const W = 320;
    const H = 260;
    const out = open(W, H, n.nombre, 'nu');
    out.push(title(160, `${n.nombre}: ${n.uso}`));
    const s = 1.7;
    const ox = 160 - 70 * s;
    const oy = 38;
    out.push(`<g transform="translate(${f(ox)} ${oy}) scale(${s})">${n.dibujo()}</g>`);
    for (const [x, y, t, a] of n.etiquetas) out.push(lbl(ox + x * s, oy + y * s, t, null, a, 'font-weight="700"'));
    out.push('</svg>');
    return { svg: out.join(''), caption: n.texto };
  }
  const W = 320;
  const H = 296;
  const out = open(W, H, 'Los cuatro nudos del PER', 'nu');
  out.push(title(160, 'Los cuatro nudos y su uso'));
  Object.values(NUDOS).forEach((n, i) => {
    const cx = i % 2 ? 240 : 80;
    const y0 = 34 + Math.floor(i / 2) * 132;
    const s = 0.82;
    out.push(`<g transform="translate(${f(cx - 70 * s)} ${y0}) scale(${s})">${n.dibujo()}</g>`);
    out.push(bold(cx, y0 + 104, n.nombre, null, 'middle'), lbl(cx, y0 + 117, n.uso, null, 'middle'));
  });
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Unir dos cabos iguales: llano. A una argolla: vuelta de rezón. A un palo o candelero, rápido: ballestrinque. Una gaza fija: as de guía.' };
}

// ---------------------------------------------------------------------------
// Atraque. spec: { tipo:'atraque', modo:'costado'|'punta'|'abarloado'|'boya', helice?: 'dextrogira'|'levogira', viento?: 'costado' }

const muelle = (W, y, H) => `${tierra(`M0,${y} L${W},${y} L${W},${H} L0,${H}Z`)}`;
const noray = (x, y) => `<circle cx="${f(x)}" cy="${f(y)}" r="3.6" fill="currentColor"/>`;
const amarra = (p, q, on = true) => `<line x1="${f(p[0])}" y1="${f(p[1])}" x2="${f(q[0])}" y2="${f(q[1])}" stroke="${on ? C.r : C.g}" stroke-width="${on ? 2.6 : 1.4}"/>`;
const defensa = (x, y, w, h) => `<rect x="${f(x)}" y="${f(y)}" width="${w}" height="${h}" rx="2" style="fill:var(--l-a)" stroke="currentColor" stroke-width=".8"/>`;

function atraqueCostado(spec) {
  const lev = spec.helice === 'levogira';
  const W = 320;
  const H = 280;
  const yq = 226;
  const out = open(W, H, 'Atraque de costado', 'ac');
  out.push(clipDef('ac', W, H), `<g clip-path="url(#ac-clip)">${sea(0, 30, W, yq - 30)}${muelle(W, yq, H)}</g>`);
  out.push(title(160, `De costado con hélice ${lev ? 'levógira' : 'dextrógira'}`));
  out.push(bold(160, 266, 'MUELLE', null, 'middle'));
  // Se dibuja para dextrógira (babor al muelle, proa a la izquierda) y se refleja para levógira.
  const mx = (x) => (lev ? W - x : x);
  const ma = (a) => (a === 'start' ? (lev ? 'end' : 'start') : a === 'end' ? (lev ? 'start' : 'end') : a);
  const rot = (r) => (lev ? -r : r);
  const L = 104;
  const B = 32;
  const [fx0, fy0] = [176, yq - 6 - B / 2];
  // aproximación (fantasma) a 20–30°
  out.push(`<g opacity=".45" stroke-dasharray="4 3">${hp(mx(214), 120, rot(-115), L, B)}</g>`);
  out.push(`<path d="M${mx(170)},152 Q${mx(146)},176 ${mx(136)},${fy0 - 20}" fill="none" stroke="${C.v}" stroke-width="1.8" stroke-dasharray="5 4" marker-end="url(#ac-v)"/>`);
  out.push(lbl(mx(150), 86, 'entra a 20–30°, despacio', 'v', ma('end')));
  // posición final, paralelo al muelle
  out.push(hp(mx(fx0), fy0, rot(-90), L, B));
  for (const x of [140, 172, 204]) out.push(defensa(mx(x) - 6, yq - 6, 12, 6));
  // la popa se arrima al dar atrás
  out.push(arrow(mx(fx0 + 40), fy0 - 40, mx(fx0 + 40), fy0 - 22, 'r', 'ac', 2.6));
  out.push(bold(mx(fx0 + 50), fy0 - 46, 'atrás: la popa', 'r', ma('start')), bold(mx(fx0 + 50), fy0 - 33, `va a ${lev ? 'estribor' : 'babor'}`, 'r', ma('start')));
  // primer cabo: largo de proa
  const bow = [mx(fx0 - L / 2 + 2), fy0];
  out.push(amarra(bow, [mx(78), yq + 6]), noray(mx(78), yq + 6));
  out.push(bold(mx(56), yq + 24, '1.º largo de proa', 'r', ma('start')));
  // corriente de proa
  out.push(arrow(mx(20), 160, mx(66), 160, 'p', 'ac', 2.4), lbl(mx(20), 152, 'corriente', 'p', ma('start')));
  out.push(lbl(mx(14), 48, `${lev ? 'Levógira' : 'Dextrógira'}: atraca por ${lev ? 'estribor' : 'babor'}`, null, ma('start'), 'font-weight="700"'));
  out.push('</svg>');
  return {
    svg: out.join(''),
    caption: `Con hélice ${lev ? 'levógira' : 'dextrógira'}, al dar atrás para parar la popa va a ${lev ? 'estribor' : 'babor'}: atracando por esa banda se arrima sola y quedas paralelo. Con corriente de proa o viento de tierra, el primer cabo a tierra es el largo de proa.`,
  };
}

function atraquePunta(spec) {
  const costado = spec.viento === 'costado';
  const W = 320;
  const H = 280;
  const yq = 232;
  const out = open(W, H, 'Atraque de punta', 'ap');
  out.push(clipDef('ap', W, H), `<g clip-path="url(#ap-clip)">${sea(0, 30, W, yq - 30)}${muelle(W, yq, H)}</g>`);
  out.push(title(160, costado ? 'De punta con viento de costado' : 'De punta: popa al muelle'));
  out.push(bold(262, 266, 'MUELLE', null, 'middle'));
  const L = 100;
  const B = 32;
  const cy = yq - 4 - L / 2;
  // vecinos
  for (const x of [96, 224]) out.push(`<g opacity=".4">${hp(x, cy, 0, L, B)}</g>`);
  out.push(hp(160, cy, 0, L, B));
  for (const x of [134, 180]) out.push(defensa(x, cy + 6, 6, 14));
  // muerto con su guía
  out.push(`<rect x="152" y="40" width="16" height="12" rx="2" fill="currentColor" opacity=".7"/>`, bold(174, 50, 'muerto', null, 'start'));
  const bow = [160, cy - L / 2];
  out.push(`<line x1="160" y1="52" x2="${bow[0]}" y2="${bow[1] + 2}" stroke="${C.r}" stroke-width="2.6"/>`);
  out.push(`<path d="M168,52 Q262,70 290,${yq}" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="4 3" opacity=".7"/>`, lbl(296, 150, 'guía', null, 'end'));
  // largos de popa
  const pb = [149, yq - 6];
  const pe = [171, yq - 6];
  const nb = [118, yq + 8];
  const ne = [202, yq + 8];
  if (costado) {
    out.push(amarra(pb, nb), amarra(pe, nb), noray(...nb), noray(...ne));
    out.push(arrow(14, 110, 60, 110, 'g', 'ap', 2.6), lbl(14, 102, 'viento', 'g'));
    out.push(bold(112, yq + 24, 'los dos largos al noray', 'r', 'middle'), bold(112, yq + 36, 'de barlovento', 'r', 'middle'));
    out.push(lbl(186, 88, 'tesa el muerto', 'r'), lbl(186, 100, 'cuanto antes', 'r'));
  } else {
    out.push(amarra(pb, nb), amarra(pe, ne), noray(...nb), noray(...ne));
    out.push(bold(68, yq + 24, 'dos largos', 'r', 'middle'), bold(68, yq + 36, 'de popa', 'r', 'middle'));
    out.push(lbl(186, 88, 'proa: muerto,', 'r'), lbl(186, 100, 'codera o ancla', 'r'));
    out.push(lbl(14, 96, 'defensas'), lbl(14, 108, 'a las dos'), lbl(14, 120, 'bandas'));
  }
  out.push('</svg>');
  return {
    svg: out.join(''),
    caption: costado
      ? 'Con viento de costado los largos tienen que trabajar contra el viento: encapilla los dos en el noray de barlovento. Coge y tesa el muerto cuanto antes (si hay dos, primero el de barlovento).'
      : 'Al muelle das dos largos (de popa si atracas de popa) y el otro extremo se sujeta con el muerto, cuya guía cobras desde el muelle, con una codera o con tu ancla. Defensas por las dos bandas.',
  };
}

function atraqueAbarloado() {
  const W = 320;
  const H = 280;
  const yq = 232;
  const out = open(W, H, 'Abarloarse', 'ab');
  out.push(clipDef('ab', W, H), `<g clip-path="url(#ab-clip)">${sea(0, 30, W, yq - 30)}${muelle(W, yq, H)}</g>`);
  out.push(title(160, 'Abarloado a otro barco'));
  out.push(bold(160, 266, 'MUELLE', null, 'middle'));
  const B = 32;
  const yo = yq - 6 - B / 2;
  const ym = yo - B - 20;
  // el otro, amarrado al muelle
  out.push(amarra([98, yo + 4], [86, yq + 6], false), amarra([222, yo + 4], [236, yq + 6], false), noray(86, yq + 6), noray(236, yq + 6));
  out.push(hp(160, yo, -90, 130, B), lbl(176, yo + 4, 'el otro', null, 'middle'));
  // defensas entre los dos
  for (const x of [118, 200]) out.push(defensa(x - 6, ym + B / 2 + 4, 12, 10));
  out.push(hp(160, ym, -90, 112, B), bold(146, ym + 4, 'tu barco', null, 'middle'));
  // palos desfasados
  out.push(`<circle cx="128" cy="${yo}" r="5" fill="currentColor"/><circle cx="192" cy="${ym}" r="5" fill="currentColor"/>`);
  out.push(lbl(222, ym - 28, 'palos no a la', null, 'start'), lbl(222, ym - 16, 'misma altura', null, 'start'));
  // cabos al otro barco: largos y esprines
  const top = ym + B / 2 - 2;
  const bot = yo - B / 2 + 2;
  out.push(amarra([110, top - 4], [102, bot + 4]), amarra([212, top - 4], [222, bot + 4]), amarra([140, top], [176, bot]), amarra([180, top], [144, bot]));
  out.push(lbl(14, 54, 'avisa al otro barco', null, 'start', 'font-weight="700"'), lbl(14, 68, 'y pon defensas de sobra'));
  out.push(lbl(14, 90, 'si hay marea, deja seno', null, 'start'));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Abarloarse es amarrarse al costado de otro barco. Avisa a su tripulación, pon defensas de sobra y, entre veleros, que los palos no queden a la misma altura. Si el otro está fondeado o en una boya, acércate por su popa; si arde, por barlovento.' };
}

function atraqueBoya() {
  const W = 320;
  const H = 280;
  const out = open(W, H, 'Amarrar a una boya', 'ay');
  out.push(clipDef('ay', W, H), `<g clip-path="url(#ay-clip)">${sea(0, 30, W, H - 30)}</g>`);
  out.push(title(160, 'Amarrar a una boya'));
  out.push(arrow(160, 34, 160, 66, 'g', 'ay', 2.6), lbl(168, 48, 'viento o corriente', 'g'));
  const [bx, by] = [174, 92];
  const [cx, cy] = [156, 162];
  const L = 104;
  // estela de llegada
  out.push(`<path d="M${cx},${H - 4} L${cx},${cy + L / 2 + 4}" stroke="${C.v}" stroke-width="1.8" stroke-dasharray="5 4"/>`);
  out.push(hp(cx, cy, 0, L, 32));
  // cabo por seno: de la cornamusa de proa a la argolla de la boya y de vuelta
  out.push(`<path d="M${cx - 3},${cy - L / 2 + 10} Q${bx - 10},${by + 14} ${bx},${by + 2} Q${bx - 2},${by + 18} ${cx + 3},${cy - L / 2 + 12}" fill="none" stroke="${C.r}" stroke-width="2.4"/>`);
  out.push(`<circle cx="${bx}" cy="${by}" r="9" fill="#f97316" stroke="currentColor" stroke-width="1.4"/>`);
  // bichero desde la amura
  out.push(`<line x1="${cx + 14}" y1="${cy - L / 2 + 26}" x2="${bx + 6}" y2="${by + 8}" stroke="currentColor" stroke-width="2.4"/>`);
  out.push(bold(bx + 14, by - 4, 'boya', null, 'start'), lbl(bx + 14, by + 26, 'bichero desde', null, 'start'), lbl(bx + 14, by + 38, 'la amura', null, 'start'));
  out.push(bold(bx + 14, by + 64, 'cabo por seno:', 'r', 'start'), lbl(bx + 14, by + 76, 'te sueltas', 'r', 'start'), lbl(bx + 14, by + 88, 'desde a bordo', 'r', 'start'));
  out.push(lbl(cx - 26, cy + 10, 'llega proa', null, 'end', 'font-weight="700"'), lbl(cx - 26, cy + 22, 'al viento y', null, 'end'), lbl(cx - 26, cy + 34, 'muy despacio', null, 'end'));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Llega proa al viento o a la corriente (a lo que más empuje) y muy despacio. Con la boya por la amura, cógela con el bichero y pasa tu cabo por seno, para soltarte desde a bordo. Nunca fondees junto a una boya de amarre.' };
}

export function atraqueIllustration(spec = {}) {
  const m = spec.modo ?? 'costado';
  if (m === 'punta') return atraquePunta(spec);
  if (m === 'abarloado') return atraqueAbarloado(spec);
  if (m === 'boya') return atraqueBoya(spec);
  return atraqueCostado(spec);
}

// ---------------------------------------------------------------------------
// Remolque y náufrago. spec: { tipo:'remolque', vista?: 'largo'|'abarloado'|'naufrago' }

// ---------------------------------------------------------------------------

export const LAMINAS = {
  fondeo: {
    fn: fondeoC,
    params: { vista: ['ancla', 'linea', 'borneo', 'garreo', 'orinque', 'voces'], resaltar: `una parte o lista; ancla: ${PARTES_ANCLA.join(', ')}; linea: ${PARTES_LINEA.join(', ')}; orinque: orinque, boyarin, cruz; voces: ${VOCES.join(', ')}` },
    ejemplo: { tipo: 'fondeo', vista: 'ancla' },
  },
  nudos: {
    fn: nudosIllustration,
    params: { nudo: Object.keys(NUDOS) },
    ejemplo: { tipo: 'nudos' },
  },
  atraque: {
    fn: atraqueIllustration,
    params: { modo: ['costado', 'punta', 'abarloado', 'boya'], helice: ['dextrogira', 'levogira'], viento: ['costado'] },
    ejemplo: { tipo: 'atraque', modo: 'costado', helice: 'dextrogira' },
  },
  remolque: {
    fn: remolqueC,
    params: { vista: ['largo', 'abarloado', 'naufrago'] },
    ejemplo: { tipo: 'remolque', vista: 'largo' },
  },
};

/** Todas las variantes que conviene comprobar (las usa el test y la página de revisión). */
export const VARIANTES = [
  ...['ancla', 'linea', 'borneo', 'garreo', 'orinque', 'voces'].map((vista) => ({ tipo: 'fondeo', vista })),
  { tipo: 'fondeo', vista: 'ancla', resaltar: ['unas', 'danforth', 'cepo'] },
  { tipo: 'fondeo', vista: 'linea', resaltar: 'barboten' },
  { tipo: 'fondeo', vista: 'orinque', resaltar: 'cruz' },
  { tipo: 'fondeo', vista: 'voces', resaltar: 'pique' },
  { tipo: 'nudos' },
  ...Object.keys(NUDOS).map((nudo) => ({ tipo: 'nudos', nudo })),
  { tipo: 'atraque', modo: 'costado', helice: 'dextrogira' },
  { tipo: 'atraque', modo: 'costado', helice: 'levogira' },
  { tipo: 'atraque', modo: 'punta' },
  { tipo: 'atraque', modo: 'punta', viento: 'costado' },
  { tipo: 'atraque', modo: 'abarloado' },
  { tipo: 'atraque', modo: 'boya' },
  ...['largo', 'abarloado', 'naufrago'].map((vista) => ({ tipo: 'remolque', vista })),
];
